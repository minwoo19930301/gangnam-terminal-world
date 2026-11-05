// Tiny static server for local testing:  node tests/serve.mjs [port]
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
export function serve(port = 0) {
  return new Promise(res => {
    const srv = http.createServer((req, rsp) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, p); if (!f.startsWith(ROOT)) { rsp.writeHead(403); return rsp.end(); }
      fs.readFile(f, (e, d) => { if (e) { rsp.writeHead(404); return rsp.end('404'); } rsp.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' }); rsp.end(d); });
    });
    srv.listen(port, '127.0.0.1', () => res(srv));
  });
}
if (import.meta.url === url.pathToFileURL(process.argv[1]).href) { const s = await serve(+process.argv[2] || 8765); console.log('http://127.0.0.1:' + s.address().port + '/'); }
