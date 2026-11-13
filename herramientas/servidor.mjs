// Servidor local mínimo para revisar dist/ en http://localhost:8080
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const tipos = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon',
};
const puerto = Number(process.env.PORT) || 8080;

createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const archivo = normalize(join(dist, p));
  if (!archivo.startsWith(dist)) { res.writeHead(403).end(); return; }
  try {
    const datos = await readFile(archivo);
    res.writeHead(200, { 'Content-Type': tipos[extname(archivo)] || 'application/octet-stream' }).end(datos);
  } catch {
    res.writeHead(404).end('No encontrado');
  }
}).listen(puerto, () => console.log(`Sirviendo dist/ en http://localhost:${puerto}`));
