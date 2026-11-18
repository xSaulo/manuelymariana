/* Inicio photo booth: ajusta la escena del sobre al tamaño de pantalla */
function ajustarEscena() {
  const vw = window.innerWidth;
  const movil = vw < 700;                       // en celular: encuadre vertical más grande
  const escala = movil ? (vw - 6) / 600 : Math.min(1.15, (vw - 12) / 1000);
  const escena = document.getElementById('escena');
  escena.style.width = (movil ? 600 : 1000) + 'px';
  escena.style.transform = `translateX(-50%) scale(${escala})`;
  document.getElementById('escena-int').style.transform = `translateX(${movil ? -150 : 0}px)`;
  document.getElementById('hero').style.height = Math.round((movil ? 680 : 700) * escala) + 'px';

  const tira = document.getElementById('tira');
  tira.style.left = (movil ? 612 : 700) + 'px';
  tira.style.width = (movil ? 128 : 150) + 'px';

  document.getElementById('amaranto').style.left = (movil ? 146 : 98) + 'px';


  // Collage: mesa de 600px que se escala al ancho de la pantalla
  const csc = Math.min(1.3, (vw - 16) / 600);
  document.getElementById('mesa').style.transform = `translateX(-50%) scale(${csc})`;
  document.getElementById('collage').style.height = Math.round(1820 * csc) + 'px';
}
ajustarEscena();
window.addEventListener('resize', ajustarEscena);

/* Entrada del sobre abierto: empieza cuando el sobre está en pantalla */
(function () {
  const hero = document.getElementById('hero');
  const on = () => hero.classList.add('on');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { on(); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(hero);
  } else on();
  setTimeout(on, 2500);
})();

/* Collage: las piezas caen cuando la mesa entra en pantalla */
(function () {
  const mesa = document.getElementById('mesa');
  const on = () => mesa.classList.add('on');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { on(); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(mesa);
  }
  setTimeout(on, 2600);   // por si acaso, siempre terminan visibles

  /* Profundidad (2.0): las piezas se desplazan un poco según su altura sobre la mesa */
  setTimeout(() => mesa.classList.add('lista'), 5200);
  let pend = false;
  const par = () => {
    pend = false;
    const r = mesa.parentNode.getBoundingClientRect();
    const c = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
    mesa.style.setProperty('--py', Math.max(-1.6, Math.min(1.6, c)).toFixed(3));
  };
  window.addEventListener('scroll', () => { if (!pend) { pend = true; requestAnimationFrame(par); } }, { passive: true });
  par();
})();

/* Disco: al tocarlo gira y suena la canción.
   Si la página está dentro del sobre (index.html), la música la lleva el sobre
   para que no se corte al cambiar de sección. */
const disco = document.getElementById('disco');
const nota = document.getElementById('disco-nota');
const yt = document.getElementById('yt-mm');
const enSobre = window.parent !== window;
function pintarDisco(on) {
  disco.classList.toggle('sonando', on);
  disco.setAttribute('aria-pressed', on);
  nota.textContent = on ? '♪ Sonando · toca para pausar' : '♪ Reproduce nuestra canción';
}
if (enSobre) {
  window.addEventListener('message', (e) => { if (e.data && e.data.mm === 'estado') pintarDisco(!!e.data.sonando); });
  window.parent.postMessage({ mm: 'musica', accion: 'estado?' }, '*');
} else {
  yt.src = yt.dataset.src;
}
document.addEventListener('visibilitychange', () => {
  if (!enSobre && !document.hidden && disco.classList.contains('sonando'))
    yt.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
});
disco.addEventListener('click', () => {
  const on = !disco.classList.contains('sonando');
  if (enSobre) { window.parent.postMessage({ mm: 'musica', accion: on ? 'play' : 'pause' }, '*'); return; }
  pintarDisco(on);
  yt.contentWindow.postMessage(JSON.stringify({ event: 'command', func: on ? 'playVideo' : 'pauseVideo', args: [] }), '*');
});

/* Al tocar Los detalles o Confirma tu asistencia: primero su animación y luego la sección */
document.querySelectorAll('[data-abre]').forEach((a) => {
  a.addEventListener('click', (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    e.preventDefault();
    if (a.classList.contains('abriendo')) return;
    a.classList.add('abriendo');
    const lento = a.classList.contains('rsvp-s');      // el sobre necesita un poco más para abrirse
    setTimeout(() => document.body.classList.add('saliendo'), lento ? 1300 : 850);
    setTimeout(() => { window.location.href = a.getAttribute('href'); }, lento ? 1600 : 1150);
  });
});
window.addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  document.body.classList.remove('saliendo');
  document.querySelectorAll('[data-abre].abriendo').forEach((a) => a.classList.remove('abriendo'));
});
