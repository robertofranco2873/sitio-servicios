# Sitio de servicios — Roberto Guerrero

Página de una sola sección para ofrecer sistemas a negocios locales en San Nicolás de los Garza y Monterrey.
HTML + CSS + un poco de JS, **sin dependencias**: solo necesitas Node 18 o más reciente.

```
config.json          ← TODOS los textos, precios, horario, número y enlaces
assets/              ← foto, capturas de las demos, imagen para compartir, favicon
src/plantilla.mjs    ← estructura HTML (normalmente no hay que tocarla)
src/estilos.css      ← colores y diseño
src/main.js          ← JS mínimo (año del pie, preguntas frecuentes)
build.mjs            ← genera la página final en dist/
herramientas/        ← servidor local y plantilla de la imagen para compartir
```

## Ver la página en tu computadora

```bash
npm run dev          # construye y abre un servidor en http://localhost:8080
```

`node build.mjs` solo construye `dist/`. Al terminar muestra avisos si falta algo (número, capturas).

## Editar textos y precios

Todo está en **`config.json`**. Cambia el texto entre comillas y guarda. Ejemplos:

- Precio del control básico: `servicios.lista[1].precio` → `"$2,500"`.
  `"desde": true` muestra la palabra “desde” antes del precio.
- Agregar una pregunta frecuente: copia un bloque `{ "pregunta": ..., "respuesta": ... }` dentro de `preguntas.lista`.
- Horario: `contacto.horario`. `dias` y `horas` son lo que se ve; `diasSchema`, `abre` y `cierra` son para Google (días en inglés, horas en formato 24 h).
- Título y descripción para Google: `sitio.titulo` y `sitio.descripcion`. Mantén “San Nicolás de los Garza” y “Monterrey”.

Cuidado con el formato JSON: cada elemento separado por coma, sin coma después del último, y comillas dobles.
Si te equivocas, `node build.mjs` marcará el error con la línea.

## Poner tu número de WhatsApp

En `config.json`:

```json
"whatsapp": {
  "numero": "5281XXXXXXXX",
```

Solo dígitos, con código de país `52` y sin `+`, espacios ni guiones. Se usa en todos los botones
(encabezado, diagnóstico, contacto, pie y botón flotante) con el enlace `https://wa.me/NUMERO?text=...`.
El mensaje prellenado está en `whatsapp.mensaje`.

Mientras siga como `[NUMERO]`, los botones no funcionarán y el build mostrará un aviso.

## Reemplazar las capturas de las demos

Ahora hay marcadores (`assets/capturas/demo-taller.svg` y `demo-comercio.svg`). Para poner las reales:

1. Copia la captura de cada demo, por ejemplo:
   - `C:\dev\demo-taller\docs\capturas\dashboard.png` → `assets/capturas/demo-taller.png`
   - `C:\dev\demo-comercio\docs\capturas\dashboard.png` → `assets/capturas/demo-comercio.png`
2. En `config.json`, cambia `demos.lista[].captura` a la nueva ruta (`assets/capturas/demo-taller.png`).
3. Opcional pero recomendado para que cargue rápido: conviértela a WebP de ~1000 px de ancho en
   [squoosh.app](https://squoosh.app) (calidad 75) y usa el `.webp`. Idealmente cada captura debe pesar menos de 100 KB.

La imagen se muestra en proporción 16:10 recortada desde la esquina superior izquierda; las capturas horizontales de escritorio quedan bien.
Puedes borrar los `.svg` de marcador cuando ya no se usen.

## Cambiar la foto

Reemplaza `assets/foto-perfil.png` (cuadrada) y genera las dos versiones chicas que usa la página,
`assets/foto-perfil-256.webp` y `assets/foto-perfil-256.png` (256×256), por ejemplo con squoosh.app.

## Regenerar la imagen para compartir (WhatsApp/Facebook)

`assets/og-imagen.png` (1200×630) se generó a partir de `herramientas/og.html`. Si cambias textos o foto:

```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --hide-scrollbars --window-size=1200,630 --screenshot="C:\dev\sitio-servicios\assets\og-imagen.png" "file:///C:/dev/sitio-servicios/herramientas/og.html"
```

WhatsApp y Facebook guardan la vista previa en caché. Para forzar la nueva en Facebook usa el
[Depurador de compartir](https://developers.facebook.com/tools/debug/) y pulsa “Volver a extraer”.

## Testimonios

La sección está lista pero oculta. Aparece sola cuando agregas al menos uno en `testimonios.lista`:

```json
"lista": [
  { "texto": "Ya sé cuánto vendo cada semana sin hacer cuentas.", "nombre": "María L.", "negocio": "Papelería, Anáhuac" }
]
```

Pide permiso por escrito antes de publicar el nombre de alguien.

## Desplegar en Cloudflare Pages (gratis)

### Opción A — conectado a GitHub (recomendado: se actualiza solo con cada push)

1. Entra a <https://dash.cloudflare.com> → **Workers & Pages** → **Create** → pestaña **Pages** → **Connect to Git**.
2. Autoriza GitHub y elige el repositorio `sitio-servicios`.
3. Configuración de build:
   - Framework preset: **None**
   - Build command: `node build.mjs`
   - Build output directory: `dist`
   - Variable de entorno (opcional): `NODE_VERSION` = `20`
4. **Save and Deploy**. Tu sitio queda en `https://sitio-servicios.pages.dev` (o el nombre que te asigne si ya está ocupado).
5. Si la URL final es distinta, cámbiala en `config.json` → `sitio.url` y haz push (se usa en canonical, sitemap y vista previa).

Desde ahí, cada `git push` a `main` publica los cambios en 1–2 minutos.

### Opción B — subida directa desde tu computadora

```bash
npx wrangler login                     # solo la primera vez, abre el navegador
node build.mjs
npx wrangler pages deploy dist --project-name sitio-servicios --branch main
```

## Activar la analítica (Cloudflare Web Analytics)

No usa cookies ni requiere banner de consentimiento.

- **Si usas Cloudflare Pages:** en el proyecto → **Metrics** → **Web Analytics** → **Enable**. Cloudflare inserta el script solo. No hay que tocar código.
- **Alternativa manual:** en <https://dash.cloudflare.com> → **Analytics & Logs** → **Web Analytics** → **Add a site**, copia el *token*
  del fragmento que te da y pégalo en `config.json` → `analitica.tokenCloudflare`. Usa solo una de las dos opciones.

## Conectar un dominio propio (cuando lo compres)

1. Compra el dominio (por ejemplo en Cloudflare Registrar, a precio de costo, ~US$10 al año por un `.com`).
2. En el proyecto de Pages → **Custom domains** → **Set up a custom domain** → escribe el dominio y sigue los pasos.
   Si el dominio está en Cloudflare, los registros DNS se crean solos; si no, te indica qué CNAME agregar.
3. Cambia `config.json` → `sitio.url` al dominio nuevo (`https://tudominio.com`) y haz push.
4. Opcional: da de alta el dominio en [Google Search Console](https://search.google.com/search-console) y envía `https://tudominio.com/sitemap.xml`.
   También conviene crear un **Perfil de Negocio de Google** como negocio de área de servicio (sin dirección visible) con este enlace.

## Revisar calidad

- Lighthouse: en Chrome abre la página → F12 → **Lighthouse** → *Mobile* → **Analyze page load**.
- Datos estructurados: <https://search.google.com/test/rich-results> con tu URL.
- Vista previa al compartir: <https://www.opengraph.xyz> con tu URL.
