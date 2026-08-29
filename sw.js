/* FitTrack service worker.
   Two jobs: deliver push notifications, and keep the app usable offline.

   CACHING IS NETWORK-FIRST FOR EVERY GET, DELIBERATELY.
   In April a cache-first worker pinned a broken build and the only way out was
   uninstalling the PWA. There is no build step here and no hashed filenames, so
   there is nothing a cache-first branch could safely match on. The cache exists
   purely as an offline fallback: if the network answers at all, the network wins.
   Do not "optimise" this into cache-first.

   Bump SW_VERSION on every change to this file. The activate handler deletes
   every cache that is not the current version, so a bump is also the escape
   hatch if a cache ever goes bad. */
const SW_VERSION = '3';
const CACHE = `fittrack-v${SW_VERSION}`;
const SHELL = ['./fittrack.html', './manifest.json', './icon-192.png', './icon-512.png'];

/* The reminder server, repeated here because a service worker cannot read the
   page's constants. Public either way: the client posts to it on every launch.
   test/push.test.mjs asserts this string matches PUSH_API in fittrack.html. */
const PUSH_API = 'https://fittrack-push.addyrallxx.workers.dev';

self.addEventListener('install', e => {
  // Activate immediately rather than waiting for every old tab to close.
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (!req.url.startsWith(self.location.origin)) return; // CDN and API calls pass through untouched
  e.respondWith(
    fetch(req)
      .then(res => {
        // Only cache real successes. A cached 404 or an opaque error response is
        // exactly the kind of thing that later looks like a broken app.
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then(hit => {
        if (hit) return hit;
        // Only a navigation may fall back to the shell. Answering a JSON GET
        // with HTML gives the caller a 200 that r.ok accepts and .json() then
        // throws on, which looks exactly like an empty food database.
        if (req.mode === 'navigate') return caches.match('./fittrack.html');
        return Response.error();
      }))
  );
});

/* ── PUSH ─────────────────────────────────────────────────────────────────
   The cache is never touched below this line, so a corrupt cache can never
   stop a notification firing.

   iOS Safari has no silent push: every push MUST produce a visible
   notification or the OS can revoke permission after a few silent-looking
   ones. So showNotification() is called unconditionally, even for a payload
   that failed to parse. */
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; }
  catch (_) {
    try { d = { body: e.data ? e.data.text() : '' }; } catch (_2) { d = {}; }
  }

  // Anything thrown while building the options object would leave the push
  // event resolving with no notification: silent on Android, and on iOS a
  // repeat offender gets its permission revoked. So the whole build is
  // guarded and falls back to a plain, always-valid notification.
  e.waitUntil(
    Promise.resolve()
      .then(() => self.registration.showNotification(d.title || 'FitTrack reminder', buildOpts(d)))
      .catch(() => self.registration.showNotification('FitTrack reminder', { body: 'Open FitTrack to view the reminder.', icon: './icon-192.png', tag: 'fittrack' }))
  );
});

/* Split out so the push handler above has something to fall back to when this
   throws. vibrate and the richer fields are Android-only and ignored on iOS,
   so one options object serves both platforms. */
function buildOpts(d) {
  return {
    body: d.body || '',
    icon: './icon-192.png',
    badge: './badge-96.png',
    // A tag collapses repeats: the second water reminder replaces the first
    // rather than stacking four unread pings by evening.
    tag: d.tag || 'fittrack',
    renotify: true,
    requireInteraction: !!d.sticky,
    // Safari caps action buttons at 2, so never send more than that.
    actions: (d.actions || []).slice(0, 2),
    // Android only, ignored by iOS. A short double buzz is what makes a
    // reminder register in a pocket; One UI silences a notification with no
    // vibrate pattern when the phone is on vibrate-only.
    vibrate: [80, 40, 80],
    timestamp: d.timestamp ?? Date.now(),
    data: { url: d.url || './fittrack.html' }
  };
}

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const data = e.notification.data || {};
  // An action button carries its own payload in action.action, e.g. "water:500".
  // A plain body tap just opens the app.
  const act = e.action || '';
  const target = new URL(
    (data.url || './fittrack.html') + (act ? '#act=' + encodeURIComponent(act) : ''),
    self.registration.scope
  ).href;
  const base = target.split('#')[0];

  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.split('#')[0] === base && 'focus' in c) {
          // Already open: postMessage instead of navigating. Assigning location
          // on a live client reloads it and would throw away open sheet state.
          if (act) c.postMessage({ type: 'action', act });
          return c.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});

/* Fires when the browser rotates a subscription. Not reliably delivered across
   browsers, so the server also prunes on 410/404 at send time. This is the
   cheap half of that belt and braces. */
self.addEventListener('pushsubscriptionchange', e => {
  const opts = e.oldSubscription
    ? { userVisibleOnly: true, applicationServerKey: e.oldSubscription.options.applicationServerKey }
    : { userVisibleOnly: true };
  const oldEndpoint = e.oldSubscription && e.oldSubscription.endpoint;
  e.waitUntil(
    self.registration.pushManager.subscribe(opts)
      .then(sub => {
        // Telling an open page is not enough. This event almost always fires
        // while the app is closed, and a postMessage to nobody means the
        // server keeps pushing to a dead endpoint until it 410s and is
        // deleted, at which point reminders stop until the user happens to
        // open the app. So the worker registers the new subscription itself,
        // keyed on the old endpoint since it cannot read the device id out
        // of localStorage.
        const tell = self.clients.matchAll({ includeUncontrolled: true })
          .then(list => list.forEach(c => c.postMessage({ type: 'resubscribed', sub: sub.toJSON() })))
          .catch(() => {});
        const heal = oldEndpoint
          ? fetch(PUSH_API + '/resubscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ old: oldEndpoint, sub: sub.toJSON() }),
            }).catch(() => {})
          : Promise.resolve();
        return Promise.all([tell, heal]);
      })
      .catch(() => {})
  );
});
