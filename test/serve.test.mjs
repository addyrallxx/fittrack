/* Security checks for the local static server. Run: node test/serve.test.mjs */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'fittrack-serve-'));
const webRoot=path.join(fixture,'root');
fs.mkdirSync(path.join(webRoot,'worker'),{recursive:true});
fs.writeFileSync(path.join(webRoot,'public.txt'),'public');
fs.writeFileSync(path.join(webRoot,'.secret'),'secret');
fs.writeFileSync(path.join(webRoot,'worker','secret.txt'),'worker secret');
fs.writeFileSync(path.join(fixture,'outside.txt'),'outside');

let child,failed=0;
const check=async(name,fn)=>{
  try{await fn();console.log('PASS  '+name);}
  catch(e){failed++;console.log('FAIL  '+name+'\n      '+e.message);}
};
const status=raw=>new Promise((resolve,reject)=>{
  const q=http.get({hostname:'127.0.0.1',port:8899,path:raw},r=>{
    r.resume();r.on('end',()=>resolve(r.statusCode));
  });
  q.on('error',reject);
});
const ready=p=>new Promise((resolve,reject)=>{
  let err='';
  const timer=setTimeout(()=>reject(new Error('server did not start')),3000);
  p.stdout.on('data',d=>{if(String(d).includes('serving on')){clearTimeout(timer);resolve();}});
  p.stderr.on('data',d=>{err+=d;});
  p.on('exit',code=>{clearTimeout(timer);reject(new Error('server exited '+code+': '+err.trim()));});
});

try{
  child=spawn(process.execPath,[path.join(repo,'serve.mjs')],{cwd:webRoot,stdio:['ignore','pipe','pipe']});
  await ready(child);
  await check('serves an ordinary file',async()=>assert.equal(await status('/public.txt'),200));
  await check('refuses encoded traversal outside the root',async()=>assert.equal(await status('/%2e%2e%2foutside.txt'),404));
  await check('refuses Windows separator traversal',async()=>assert.equal(await status('/..%5coutside.txt'),404));
  await check('refuses dotfiles',async()=>assert.equal(await status('/.secret'),404));
  await check('refuses the worker directory regardless of case',async()=>{
    assert.equal(await status('/worker/secret.txt'),404);
    assert.equal(await status('/WORKER/secret.txt'),404);
  });
  await check('refuses malformed URL encoding',async()=>assert.equal(await status('/%E0%A4%A'),404));
}catch(e){failed++;console.log('FAIL  server setup\n      '+e.message);}
finally{
  if(child&&child.exitCode===null){
    const exited=new Promise(resolve=>child.once('exit',resolve));
    child.kill();
    await exited;
  }
  fs.rmSync(fixture,{recursive:true,force:true});
}

console.log('\nVERDICT: '+(failed?'FAIL ('+failed+' broken)':'PASS'));
process.exit(failed?1:0);
