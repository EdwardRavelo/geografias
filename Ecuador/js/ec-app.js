/* Enrutador y navegación. */
(function () {
  const EC = (window.EC = window.EC || {});
  const U = EC.util;
  const root = document.getElementById('app');
  const app = (EC.app = {});

  const routes = [
    [/^\/?$|^\/inicio$/, 'inicio', () => 'Inicio', (m) => EC.views.home(root, app)],
    [/^\/cantones$/, 'cantones', () => 'Cantones y cabeceras', (m) => EC.views.cantones(root, app)],
    [/^\/ciudades(?:\/([\w-]+))?$/, 'ciudades', () => 'Ciudades y referencias', (m) => EC.views.ciudades(root, app, m[1])],
    [/^\/atlas(?:\/([\w-]+))?$/, 'atlas', () => 'Atlas', (m) => EC.views.atlas(root, app, m[1])],
    [/^\/leccion\/([\w-]+)$/, 'lecciones', (m) => { const l = EC.LESSONS.find((x) => x.id === m[1]); return l ? `Lección ${l.n}: ${l.title}` : 'Lección'; }, (m) => EC.views.lesson(root, app, m[1])],
  ];

  let current = null;
  function render() {
    const path = location.hash.replace(/^#/, '') || '/';
    if (current && current.destroy) { try { current.destroy(); } catch (e) { console.error(e); } }
    current = null;
    root.textContent = '';
    window.scrollTo(0, 0);
    let matched = false;
    for (const [re, key, title, fn] of routes) {
      const m = re.exec(path);
      if (!m) continue;
      matched = true;
      document.title = `${title(m)} · Atlas de campo — Geografía del Ecuador`;
      document.querySelectorAll('.nav a').forEach((a) => (key === a.dataset.key ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
      try { current = fn(m) || null; } catch (e) { console.error(e); root.innerHTML = '<div class="wrap" style="padding-block:4rem"><h1>Algo salió mal</h1><p>No se pudo mostrar esta página. Intenta volver al <a href="#/">inicio</a>.</p></div>'; }
      break;
    }
    if (!matched) { document.title = 'Página no encontrada'; root.innerHTML = '<div class="wrap" style="padding-block:4rem"><h1>No encontramos esa página</h1><p><a href="#/">Volver al inicio</a></p></div>'; }
    const h = root.querySelector('.page-title');
    if (h) h.focus({ preventScroll: true });
  }
  window.addEventListener('hashchange', render);
  if (!location.hash) history.replaceState(null, '', '#/');
  render();
})();
