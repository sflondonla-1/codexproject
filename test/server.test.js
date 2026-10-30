import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
let server;
const base = 'http://127.0.0.1:3097';
before(async () => {
  server = spawn(process.execPath, ['server.js'], { cwd: new URL('../', import.meta.url), env: { ...process.env, PORT: '3097' }, stdio: ['ignore', 'pipe', 'pipe'] });
  await Promise.race([once(server.stdout, 'data'), once(server, 'exit').then(([code]) => { throw new Error('Server exited: ' + code); }), new Promise((_,reject) => {const timer=setTimeout(()=>reject(new Error('Startup timeout')),5000);timer.unref();})]);
});
after(() => server?.kill());
test('serves the dashboard and its interactive controls', async () => {
  const response=await fetch(base); assert.equal(response.status,200); assert.match(response.headers.get('content-type'), /text\/html/);
  const html=await response.text();
  for(const id of ['task-form','tasks','start-timer','reset-timer','week','ai-period','ai-metrics','ai-tools','ai-quality-metrics']) assert.ok(html.includes(`id="${id}"`));
  assert.ok(html.includes('Demo workspace'));
});
test('serves application assets with correct content types', async () => {
  for(const [path,type] of [['/src/style.css','text/css'],['/src/app.js','text/javascript'],['/src/ai-metrics.js','text/javascript']]) {const r=await fetch(base+path);assert.equal(r.status,200);assert.ok(r.headers.get('content-type').startsWith(type));assert.ok((await r.text()).length>100);}
});
test('does not expose repository or server files', async () => {
  for(const path of ['/.git/config','/server.js','/package.json','/missing']) assert.equal((await fetch(base+path)).status,404);
});
