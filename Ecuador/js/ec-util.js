/* Utilidades compartidas */
(function () {
  const EC = (window.EC = window.EC || {});
  const U = (EC.util = {});

  const NS = 'http://www.w3.org/2000/svg';
  U.svg = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  U.el = (tag, attrs, children) => {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'text') e.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    if (children) for (const c of [].concat(children)) if (c != null) e.append(c.nodeType ? c : document.createTextNode(c));
    return e;
  };

  // Número con espacio fino como separador de miles y coma decimal (norma RAE/SI)
  U.num = (n, dec = 0) => {
    const [i, d] = Math.abs(n).toFixed(dec).split('.');
    const g = i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return (n < 0 ? '−' : '') + g + (d ? ',' + d : '');
  };
  // Aplica la misma tipografía a cadenas escritas a mano ("5 897 m" → espacio fino)
  U.tidy = (s) => s.replace(/(\d) (?=\d{3}(?!\d))/g, '$1 ');

  U.dms = (v, axis) => {
    if (Math.abs(v) < 1e-9) return '0°';
    const hem = axis === 'lat' ? (v >= 0 ? 'N' : 'S') : v >= 0 ? 'E' : 'O';
    let a = Math.abs(v);
    let d = Math.floor(a + 1e-9);
    let m = Math.round((a - d) * 60);
    if (m === 60) { d += 1; m = 0; }
    return m ? `${d}° ${String(m).padStart(2, '0')}′ ${hem}` : `${d}° ${hem}`;
  };

  U.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  U.shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  U.pick = (arr, n) => U.shuffle(arr).slice(0, n);

  // Almacenamiento tolerante a fallos (modo privado, bloqueo de cookies…)
  const KEY = 'ec-atlas-v1';
  let mem = {};
  U.load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return mem; } };
  U.save = (o) => { mem = o; try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* sin persistencia */ } };

  U.prefersReducedMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  U.emitter = (obj) => {
    const h = {};
    obj.on = (ev, fn) => ((h[ev] = h[ev] || []).push(fn), obj);
    obj.off = (ev, fn) => { h[ev] = (h[ev] || []).filter((f) => f !== fn); return obj; };
    obj.emit = (ev, ...a) => (h[ev] || []).slice().forEach((f) => f(...a));
    return obj;
  };

  // Proyección inversa/directa
  const G = () => window.EC_GEO;
  U.project = (lon, lat, gal) => { const p = gal ? G().proj.gal : G().proj.main; return [p.x0 + (lon - p.lonRef) * p.k, p.y0 + (p.latRef - lat) * p.k]; };
  U.unproject = (x, y, gal) => { const p = gal ? G().proj.gal : G().proj.main; return [p.lonRef + (x - p.x0) / p.k, p.latRef - (y - p.y0) / p.k]; };
  U.isInset = (x, y) => x < 700 && y > 2200;
})();
