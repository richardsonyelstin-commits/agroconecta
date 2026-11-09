const http = require('node:http'),
  fs = require('node:fs'),
  path = require('node:path');
const zlib = require('node:zlib');
const root = path.resolve(__dirname, '..');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.vtt': 'text/vtt; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};
http
  .createServer((req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const name = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
      const parts = name.split('/');
      const file = path.resolve(root, '.' + name);
      if (
        !file.startsWith(root + path.sep) ||
        parts.some(
          (p) =>
            p.startsWith('.') ||
            ['node_modules', 'supabase', 'api', 'tests', 'tools', 'output'].includes(p)
        ) ||
        name === '/js/config.js' ||
        !types[path.extname(file)] ||
        !fs.existsSync(file) ||
        !fs.statSync(file).isFile()
      ) {
        res.writeHead(404).end('No encontrado');
        return;
      }
      const size = fs.statSync(file).size;
      res.setHeader('Content-Type', types[path.extname(file)]);
      res.setHeader('Accept-Ranges', 'bytes');
      if (
        ['.html', '.css', '.js', '.txt', '.vtt'].includes(path.extname(file)) &&
        /gzip/.test(req.headers['accept-encoding'] || '')
      ) {
        const body = zlib.gzipSync(fs.readFileSync(file));
        res.writeHead(200, {
          'Content-Encoding': 'gzip',
          Vary: 'Accept-Encoding',
          'Content-Length': body.length
        });
        res.end(body);
        return;
      }
      const range = req.headers.range;
      if (range) {
        const m = /^bytes=(\d+)-(\d*)$/.exec(range);
        if (!m) {
          res.writeHead(416).end();
          return;
        }
        const start = Number(m[1]),
          end = Math.min(m[2] ? Number(m[2]) : size - 1, size - 1);
        if (start > end || start >= size) {
          res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end();
          return;
        }
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${size}`,
          'Content-Length': end - start + 1
        });
        fs.createReadStream(file, { start, end }).pipe(res);
      } else {
        res.setHeader('Content-Length', size);
        fs.createReadStream(file).pipe(res);
      }
    } catch (_) {
      res.writeHead(400).end('Solicitud inválida');
    }
  })
  .listen(5500, '127.0.0.1', () =>
    console.log('AGROCONECTA: http://127.0.0.1:5500 (Ctrl+C para cerrar)')
  );
