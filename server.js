import http from 'node:http';
import { readFile } from 'node:fs/promises';
const files = { '/': ['index.html', 'text/html'], '/src/style.css': ['src/style.css', 'text/css'], '/src/app.js': ['src/app.js', 'text/javascript'] };
const server = http.createServer(async (req, res) => {
  const file = files[new URL(req.url, 'http://localhost').pathname];
  if (!file) { res.writeHead(404); return res.end('Not found'); }
  try { res.writeHead(200, { 'Content-Type': file[1] + '; charset=utf-8' }); res.end(await readFile(new URL(file[0], import.meta.url))); }
  catch { res.writeHead(500); res.end('Unable to load application'); }
});
server.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('Devspace running on port ' + (process.env.PORT || 3000)));
