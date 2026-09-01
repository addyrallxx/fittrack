/* Static file server for local testing.
 *
 * The app must be tested over a real http origin. A file:// or data: URL
 * disables localStorage entirely, which makes a working app look completely
 * broken. python -m http.server does not work on this machine either: the
 * python on PATH is the Microsoft Store stub and exits with an error.
 *
 *   node serve.mjs        then open http://localhost:8899/
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
/* A wrong content type is not a cosmetic problem here. An SVG served as
   application/octet-stream is refused by the browser and reports
   naturalWidth 0, which looks exactly like a broken file. */
const T={'.html':'text/html','.js':'text/javascript','.json':'application/json',
         '.png':'image/png','.svg':'image/svg+xml','.gif':'image/gif',
         '.webmanifest':'application/manifest+json','.ico':'image/x-icon'};
const ROOT=path.resolve(process.cwd());
const nope=r=>{r.writeHead(404);r.end('nope');};
http.createServer((q,r)=>{
  let rel;
  try{rel=decodeURIComponent(q.url.split('?')[0]).replace(/^[\\/]+/,'')||'index.html';}
  catch{return nope(r);}
  const parts=rel.split(/[\\/]+/);
  if(parts.some(p=>p.startsWith('.'))||parts[0].toLowerCase()==='worker')return nope(r);
  const f=path.resolve(ROOT,rel);
  if(f!==ROOT&&!f.startsWith(ROOT+path.sep))return nope(r);
  fs.readFile(f,(e,d)=>{
    if(e)return nope(r);
    r.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream','Service-Worker-Allowed':'/'});
    r.end(d);
  });
}).listen(8899,'127.0.0.1',()=>console.log('serving on http://127.0.0.1:8899'));
