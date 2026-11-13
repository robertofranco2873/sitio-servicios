// Genera el HTML de la página a partir de config.json.
// Los textos se editan en config.json; aquí solo vive la estructura.

const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const icono = {
  whatsapp:
    '<svg class="icono" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M12 2.8a9.2 9.2 0 0 0-7.9 13.9L3 21l4.4-1.1A9.2 9.2 0 1 0 12 2.8z"/><path fill="currentColor" d="M8.7 7.6c.3-.5.6-.5.9-.5h.5c.2 0 .4.1.5.4l.8 1.8c.1.3 0 .5-.1.7l-.5.6c-.1.2-.2.4 0 .6.4.7.9 1.4 1.6 2 .6.5 1.2.9 1.9 1.1.2.1.4.1.6-.1l.6-.8c.2-.2.4-.3.7-.2l1.7.8c.3.1.4.3.4.5 0 .4-.1 1-.6 1.5s-1.3.8-2.1.7c-1-.1-2.4-.6-3.9-1.9-1.6-1.4-2.5-3.1-2.7-4-.2-1 .1-1.7.6-2.2z"/></svg>',
};

export function plantilla(c, { css, js, url, anio }) {
  const numero = c.whatsapp.numero;
  const wa = `https://wa.me/${numero}?text=${encodeURIComponent(c.whatsapp.mensaje)}`;
  const imagenCompartir = url + c.sitio.imagenCompartir;
  const numeroListo = /^\d{10,15}$/.test(numero);

  const botonWa = (texto, clase = 'boton boton--principal') =>
    `<a class="${clase}" href="${esc(wa)}" target="_blank" rel="noopener">${icono.whatsapp}<span>${esc(texto)}</span></a>`;

  // Datos estructurados: servicio profesional con área de servicio (sin dirección).
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: `${c.persona.nombre} | Sistemas para negocios`,
    description: c.sitio.descripcion,
    url,
    image: imagenCompartir,
    logo: url + 'assets/foto-perfil-256.png',
    ...(numeroListo ? { telephone: '+' + numero } : {}),
    priceRange: '$0 – $5,000+ MXN',
    currenciesAccepted: 'MXN',
    areaServed: c.contacto.area.map((nombre) => ({
      '@type': 'City',
      name: nombre,
      containedInPlace: { '@type': 'State', name: 'Nuevo León' },
    })),
    openingHoursSpecification: c.contacto.horario.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.diasSchema,
      opens: h.abre,
      closes: h.cierra,
    })),
    founder: { '@type': 'Person', name: c.persona.nombre },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: c.servicios.titulo,
      itemListElement: c.servicios.lista.map((s) => {
        const [precio = 0, maximo] = (s.precio.match(/\d[\d,]*/g) || []).map((n) => Number(n.replace(/,/g, '')));
        const spec = maximo
          ? { minPrice: precio, maxPrice: maximo }
          : s.desde ? { minPrice: precio } : { price: precio };
        return {
          '@type': 'Offer',
          name: s.nombre,
          description: s.descripcion,
          priceSpecification: {
            '@type': 'PriceSpecification',
            priceCurrency: 'MXN',
            ...spec,
          },
        };
      }),
    },
  };

  const analitica = c.analitica.tokenCloudflare
    ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${esc(c.analitica.tokenCloudflare)}"}'></script>`
    : '';

  const [nombreH1, ...restoH1] = c.encabezado.titulo.split(' | ');
  const testimonios = c.testimonios.lista || [];

  return `<!DOCTYPE html>
<html lang="${esc(c.sitio.idioma)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(c.sitio.titulo)}</title>
<meta name="description" content="${esc(c.sitio.descripcion)}">
<link rel="canonical" href="${esc(url)}">
<meta name="theme-color" content="#1e2d42">
<meta name="geo.region" content="MX-NLE">
<meta name="geo.placename" content="San Nicolás de los Garza">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_MX">
<meta property="og:site_name" content="${esc(c.persona.nombre)}">
<meta property="og:title" content="${esc(c.sitio.titulo)}">
<meta property="og:description" content="${esc(c.sitio.descripcion)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(imagenCompartir)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(c.sitio.textoImagenCompartir)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/foto-perfil-256.png">
<link rel="preload" as="image" href="assets/foto-perfil-256.webp" type="image/webp">
<style>${css}</style>
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
</head>
<body>
<a class="saltar" href="#contenido">Saltar al contenido</a>

<header class="encabezado">
  <div class="contenedor">
    <picture>
      <source srcset="assets/foto-perfil-256.webp" type="image/webp">
      <img class="foto" src="assets/foto-perfil-256.png" width="128" height="128" alt="${esc(c.persona.textoFoto)}" fetchpriority="high">
    </picture>
    <h1><span class="h1-nombre">${esc(nombreH1)}</span><span class="visual-oculto"> | </span><span class="h1-lema">${esc(restoH1.join(' | '))}</span></h1>
    <p class="subtitulo">${esc(c.encabezado.subtitulo)}</p>
    <div class="acciones">
      ${botonWa(c.encabezado.botonWhatsapp)}
      <a class="boton boton--secundario" href="#servicios">${esc(c.encabezado.botonDiagnostico)}</a>
    </div>
  </div>
</header>

<main id="contenido">

<section class="seccion" aria-labelledby="t-problema">
  <div class="contenedor">
    <h2 id="t-problema">${esc(c.problema.titulo)}</h2>
    <ul class="problemas">
${c.problema.situaciones
  .map((s) => `      <li><h3>${esc(s.titulo)}</h3><p>${esc(s.texto)}</p></li>`)
  .join('\n')}
    </ul>
  </div>
</section>

<section class="seccion seccion--tono" id="servicios" aria-labelledby="t-servicios">
  <div class="contenedor">
    <h2 id="t-servicios">${esc(c.servicios.titulo)}</h2>
    <div class="servicios">
${c.servicios.lista
  .map(
    (s, i) => `      <article class="servicio${i === 0 ? ' servicio--destacado' : ''}">
        <div class="servicio-cabeza">
          <h3>${esc(s.nombre)}</h3>
          <p class="precio">${s.desde ? '<span class="desde">desde</span> ' : ''}${esc(s.precio)}</p>
        </div>
        <p>${esc(s.descripcion)}</p>${
          s.incluye.length
            ? `\n        <ul class="incluye">${s.incluye.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`
            : ''
        }${i === 0 ? `\n        ${botonWa('Pedir diagnóstico', 'boton boton--principal boton--chico')}` : ''}
      </article>`
  )
  .join('\n')}
    </div>
    <p class="nota">${esc(c.servicios.nota)}</p>
  </div>
</section>

<section class="seccion" id="ejemplos" aria-labelledby="t-ejemplos">
  <div class="contenedor">
    <h2 id="t-ejemplos">${esc(c.demos.titulo)}</h2>
    <p>${esc(c.demos.intro)}</p>
    <div class="demos">
${c.demos.lista
  .map(
    (d) => `      <article class="demo">
        <img src="${esc(d.captura)}" alt="${esc(d.textoCaptura)}" width="800" height="500" loading="lazy" decoding="async">
        <div class="demo-cuerpo">
          <h3>${esc(d.nombre)}</h3>
          <p>${esc(d.descripcion)}</p>
          <a class="boton boton--secundario boton--chico" href="${esc(d.enlace)}" target="_blank" rel="noopener">${esc(c.demos.boton)}<span class="visual-oculto">: ${esc(d.nombre)} (se abre en otra pestaña)</span></a>
        </div>
      </article>`
  )
  .join('\n')}
    </div>
    <p class="nota">${esc(c.demos.aviso)}</p>
  </div>
</section>

<section class="seccion seccion--tono" id="como-trabajo" aria-labelledby="t-proceso">
  <div class="contenedor">
    <h2 id="t-proceso">${esc(c.proceso.titulo)}</h2>
    <ol class="pasos">
${c.proceso.pasos.map((p) => `      <li><h3>${esc(p.titulo)}</h3><p>${esc(p.texto)}</p></li>`).join('\n')}
    </ol>
  </div>
</section>

<section class="seccion" id="sobre-mi" aria-labelledby="t-sobre">
  <div class="contenedor">
    <h2 id="t-sobre">${esc(c.sobreMi.titulo)}</h2>
${c.sobreMi.parrafos.map((p) => `    <p>${esc(p)}</p>`).join('\n')}
  </div>
</section>

<section class="seccion seccion--tono" id="preguntas" aria-labelledby="t-preguntas">
  <div class="contenedor">
    <h2 id="t-preguntas">${esc(c.preguntas.titulo)}</h2>
    <div class="preguntas">
${c.preguntas.lista
  .map((p) => `      <details><summary>${esc(p.pregunta)}</summary><p>${esc(p.respuesta)}</p></details>`)
  .join('\n')}
    </div>
  </div>
</section>

<section class="seccion" id="contacto" aria-labelledby="t-contacto">
  <div class="contenedor">
    <h2 id="t-contacto">${esc(c.contacto.titulo)}</h2>
    <p>${esc(c.contacto.texto)}</p>
    <div class="acciones">${botonWa(c.encabezado.botonWhatsapp)}</div>
    <div class="datos">
      <div>
        <h3>Horario</h3>
        <dl class="horario">
${c.contacto.horario.map((h) => `          <div><dt>${esc(h.dias)}</dt><dd>${esc(h.horas)}</dd></div>`).join('\n')}
        </dl>
      </div>
      <div>
        <h3>Área de servicio</h3>
        <ul class="area">${c.contacto.area.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
        <p class="nota">${esc(c.contacto.notaArea)}</p>
      </div>
    </div>
  </div>
</section>
${
  testimonios.length
    ? `
<section class="seccion seccion--tono" id="testimonios" aria-labelledby="t-testimonios">
  <div class="contenedor">
    <h2 id="t-testimonios">${esc(c.testimonios.titulo)}</h2>
${testimonios
  .map(
    (t) => `    <figure class="testimonio"><blockquote><p>${esc(t.texto)}</p></blockquote><figcaption>${esc(t.nombre)}${t.negocio ? `, <span>${esc(t.negocio)}</span>` : ''}</figcaption></figure>`
  )
  .join('\n')}
  </div>
</section>
`
    : '<!-- Testimonios: se muestran automáticamente al agregarlos en config.json -->'
}
</main>

<footer class="pie">
  <div class="contenedor">
    <nav aria-label="Secciones">
      <ul>${c.pie.enlaces.map((e) => `<li><a href="${esc(e.url)}">${esc(e.texto)}</a></li>`).join('')}<li><a href="${esc(wa)}" target="_blank" rel="noopener">WhatsApp</a></li></ul>
    </nav>
    <p>© <span id="anio">${anio}</span> ${esc(c.persona.nombre)} · ${esc(c.contacto.area.join(', '))}, N.L.</p>
  </div>
</footer>

<a class="flotante" href="${esc(wa)}" target="_blank" rel="noopener" aria-label="Escríbeme por WhatsApp">${icono.whatsapp}</a>

<script>${js}</script>
${analitica}
</body>
</html>
`;
}
