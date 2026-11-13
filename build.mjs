// Construye el sitio en dist/ a partir de config.json y src/.
// Sin dependencias: solo Node 18+.  Uso: node build.mjs
import { readFile, writeFile, mkdir, rm, cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { plantilla } from './src/plantilla.mjs';

const raiz = new URL('./', import.meta.url);
const ruta = (p) => new URL(p, raiz);
const dist = ruta('dist/');

const config = JSON.parse(await readFile(ruta('config.json'), 'utf8'));
const css = await readFile(ruta('src/estilos.css'), 'utf8');
const js = await readFile(ruta('src/main.js'), 'utf8');

// Minificado ligero y seguro (quita comentarios y espacios sobrantes).
const minCss = css
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*([{}:;,>])\s*/g, '$1')
  .replace(/;}/g, '}')
  .trim();
const minJs = js
  .split('\n')
  .filter((l) => !l.trim().startsWith('//'))
  .map((l) => l.trim())
  .filter(Boolean)
  .join('\n');

const url = config.sitio.url.replace(/\/+$/, '') + '/';
const hoy = new Date();

// Avisos útiles al construir.
const avisos = [];
if (!/^\d{10,15}$/.test(config.whatsapp.numero)) {
  avisos.push(`El número de WhatsApp aún es "${config.whatsapp.numero}". Ponlo en config.json → whatsapp.numero.`);
}
for (const d of config.demos.lista) {
  if (!existsSync(ruta(d.captura))) avisos.push(`No existe la captura ${d.captura}.`);
  else if (d.captura.endsWith('.svg')) avisos.push(`La demo "${d.nombre}" aún usa la captura de marcador (${d.captura}).`);
}

const html = plantilla(config, { css: minCss, js: minJs, url, anio: hoy.getFullYear() });

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(ruta('assets/'), new URL('assets/', dist), { recursive: true });
await writeFile(new URL('index.html', dist), html);

await writeFile(
  new URL('robots.txt', dist),
  `User-agent: *\nAllow: /\n\nSitemap: ${url}sitemap.xml\n`
);

await writeFile(
  new URL('sitemap.xml', dist),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${url}</loc>
    <lastmod>${hoy.toISOString().slice(0, 10)}</lastmod>
  </url>
</urlset>
`
);

// Encabezados de Cloudflare Pages: caché larga para imágenes y seguridad básica.
await writeFile(
  new URL('_headers', dist),
  `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()

/assets/*
  Cache-Control: public, max-age=604800, stale-while-revalidate=86400
`
);

console.log(`Listo: dist/ (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB de HTML)`);
for (const a of avisos) console.warn('Aviso: ' + a);
