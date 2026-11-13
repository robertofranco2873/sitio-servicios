// JS mínimo: el sitio funciona igual sin él.
// Año del pie siempre actual aunque no se reconstruya el sitio.
document.getElementById('anio').textContent = new Date().getFullYear();
// Abrir solo una pregunta frecuente a la vez.
document.querySelectorAll('.preguntas details').forEach(function (d, _, todas) {
  d.addEventListener('toggle', function () {
    if (d.open) todas.forEach(function (o) { if (o !== d) o.open = false; });
  });
});
