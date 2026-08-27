/* Static file server for local testing.
 *
 * The app must be tested over a real http origin. A file:// or data: URL
 * disables localStorage entirely, which makes a working app look completely
 * broken. python -m http.server does not work on this machine either: the
 * python on PATH is the Microsoft Store stub and exits with an error.
 *
 *   node serve.mjs        then open http://localhost:8899/fittrack.html
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
const T={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png'};
http.createServer((q,r)=>{
  const f=path.join(process.cwd(),decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/,'')||'fittrack.html');
  fs.readFile(f,(e,d)=>{
    if(e){r.writeHead(404);return r.end('nope');}
    r.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream','Service-Worker-Allowed':'/'});
    r.end(d);
  });
}).listen(8899,()=>console.log('serving on 8899'));
