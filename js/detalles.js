/* Los detalles: preguntas frecuentes que se abren y cierran */
document.querySelectorAll('.faq-item').forEach((item) => {
  const boton = item.querySelector('button');
  boton.addEventListener('click', () => {
    const abierta = boton.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.faq-item').forEach((otro) => {
      otro.querySelector('button').setAttribute('aria-expanded', 'false');
      otro.querySelector('.faq-icon').textContent = '+';
      otro.querySelector('.ans').hidden = true;
    });
    if (!abierta) {
      boton.setAttribute('aria-expanded', 'true');
      item.querySelector('.faq-icon').textContent = '−';
      item.querySelector('.ans').hidden = false;
    }
  });
});

/* Agregar al calendario (Google y archivo .ics para Apple / Outlook) */
(function () {
  const f = new Date(CONFIG.fecha);
  if (isNaN(f)) return;
  const fin = new Date(f.getTime() + 6 * 3600000);
  const utc = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const titulo = 'Boda de Mariana & Manuel';
  const lugar = (CONFIG.ceremonia && CONFIG.ceremonia.direccion) || '';
  document.getElementById('cal-google').href = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' +
    encodeURIComponent(titulo) + '&dates=' + utc(f) + '/' + utc(fin) + '&location=' + encodeURIComponent(lugar);
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Mariana y Manuel//Boda//ES', 'BEGIN:VEVENT',
    'UID:boda-mariana-manuel', 'DTSTAMP:' + utc(new Date()), 'DTSTART:' + utc(f), 'DTEND:' + utc(fin),
    'SUMMARY:' + titulo, 'LOCATION:' + lugar, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  document.getElementById('cal-ics').href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
})();

/* Botones de mapa: Google Maps y Waze con la dirección de js/config.js */
document.querySelectorAll('[data-mapa]').forEach((a) => {
  const lugar = CONFIG[a.dataset.mapa] || {};
  const q = (lugar.direccion || '').trim();
  if (!q) return;                                   // sin dirección todavía
  a.href = a.dataset.app === 'waze'
    ? 'https://waze.com/ul?q=' + encodeURIComponent(q) + '&navigate=yes'
    : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
});
