/* AtlasMap: mapa interactivo en SVG (relieve + provincias + capas).
   Sin dependencias. Coordenadas del lienzo: ver EC_GEO.proj. */
(function () {
  const EC = (window.EC = window.EC || {});
  const U = EC.util;
  const G = window.EC_GEO;
  const svg = U.svg, el = U.el;

  const FULL = { x: 20, y: 90, w: 3180, h: 2820 };
  const MAIN = { x: 700, y: 110, w: 2470, h: 2740 };
  const GAL = { x: 20, y: 2230, w: 630, h: 660 };
  const INSET = { x: 34, y: 2240, w: 600, h: 640 };
  const MAX_W = 3600, MIN_W = 110;

  const lonX = (lon) => (lon - G.proj.main.lonRef) * G.proj.main.k;
  const latY = (lat) => (G.proj.main.latRef - lat) * G.proj.main.k;

  const REGION_LABELS = [
    ['costa', 'COSTA', -79.95, -0.95], ['sierra', 'SIERRA', -78.55, -0.55], ['amazonia', 'AMAZONÍA', -76.6, -2.2],
  ];
  const CONTEXT_LABELS = [
    ['COLOMBIA', -77.0, 1.72, 'land'], ['PERÚ', -77.3, -5.35, 'land'], ['OCÉANO', -81.35, -0.12, 'sea'], ['PACÍFICO', -81.35, -0.4, 'sea'],
  ];

  class AtlasMap {
    constructor(root, opts = {}) {
      this.opts = Object.assign({ wheel: 'always', touchPan: true, ticks: true, controls: true, scale: true, tooltip: true, label: 'Mapa interactivo de las provincias del Ecuador' }, opts);
      this.root = root;
      U.emitter(this);
      this.vb = Object.assign({}, FULL);
      this.target = null;
      this.scene = null;
      this.layerOverride = {};
      this.selected = null;
      this.hovered = null;
      this.marks = {};
      this.cw = 0; this.ch = 0; this.ppu = 0.3;
      this.build();
      this.bind();
      this.measure();
      this.setScene({}, { animate: false });
    }

    /* ───────────── DOM ───────────── */
    build() {
      const R = this.root;
      R.classList.add('map');
      R.innerHTML = '';
      this.frame = el('div', { class: 'map-frame' });
      this.view = el('div', { class: 'map-view', tabindex: '0', role: 'group', 'aria-label': this.opts.label + '. Use las flechas para desplazar y + o − para acercar.' });
      this.frame.append(this.view);
      R.append(this.frame);

      const s = (this.svg = svg('svg', { class: 'map-svg', viewBox: this.vbString(), preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'false' }));
      this.view.append(s);
      const defs = svg('defs', null, s);

      // Fondo
      svg('rect', { class: 'sea', x: -6000, y: -6000, width: 15000, height: 15000 }, s);
      this.gRelief = svg('g', { class: 'relief' }, s);
      svg('image', { href: 'assets/relief-main.webp', x: 480, y: 0, width: 2800, height: 2960, preserveAspectRatio: 'none', class: 'relief-img' }, this.gRelief);
      this.gGrat = svg('g', { class: 'grat' }, s);
      for (let lon = -83; lon <= -74; lon++) svg('path', { d: `M${lonX(lon)} 0V${G.h}` }, this.gGrat);
      for (let lat = -6; lat <= 2; lat++) svg('path', { d: `M0 ${latY(lat)}H${G.w}` }, this.gGrat);

      // Recuadro de Galápagos
      const gi = svg('g', { class: 'inset' }, s);
      svg('rect', { class: 'inset-bg', x: INSET.x, y: INSET.y, width: INSET.w, height: INSET.h }, gi);
      this.gReliefGal = svg('g', { class: 'relief' }, gi);
      svg('image', { href: 'assets/relief-gal.webp', x: 50, y: 2270, width: 558, height: 594, preserveAspectRatio: 'none', class: 'relief-img' }, this.gReliefGal);
      const gg = svg('g', { class: 'grat' }, gi);
      for (let lon = -92; lon <= -89; lon += 0.5) { const x = G.proj.gal.x0 + (lon - G.proj.gal.lonRef) * G.proj.gal.k; svg('path', { d: `M${x} ${INSET.y}V${INSET.y + INSET.h}` }, gg); }
      for (let lat = -1.5; lat <= 1.5; lat += 0.5) { const y = G.proj.gal.y0 + (G.proj.gal.latRef - lat) * G.proj.gal.k; svg('path', { d: `M${INSET.x} ${y}H${INSET.x + INSET.w}` }, gg); }
      svg('rect', { class: 'inset-frame', x: INSET.x, y: INSET.y, width: INSET.w, height: INSET.h }, gi);
      const gtt = svg('g', { transform: `translate(${INSET.x + 8} ${INSET.y + 6})` }, gi);
      const ginv = svg('g', { class: 'inv' }, gtt);
      svg('text', { class: 'inset-title', x: 0, y: 14 }, ginv).textContent = 'GALÁPAGOS';
      svg('text', { class: 'inset-sub', x: 0, y: 30 }, ginv).textContent = 'escala reducida';

      // Vecinos
      this.gNeighbors = svg('g', { class: 'neighbors' }, s);
      for (const n of G.neighbors) svg('path', { d: n.d, 'data-name': n.name }, this.gNeighbors);

      // Provincias (relleno con mezcla multiplicativa sobre el relieve)
      this.gFills = svg('g', { class: 'fills' }, s);
      this.fillEl = {};
      for (const p of G.provinces) {
        const meta = EC.PROVS[p.id];
        this.fillEl[p.id] = svg('path', { class: 'fill', d: p.d, 'data-id': p.id, 'data-region': meta.region }, this.gFills);
      }
      this.gIslands = svg('g', { class: 'isl-fills' }, s);
      // Islas (contorno propio para dar más peso visual a Galápagos)
      this.gLines = svg('g', { class: 'lines' }, s);
      this.lineEl = {};
      for (const p of G.provinces) this.lineEl[p.id] = svg('path', { class: 'line', d: p.d, 'data-id': p.id }, this.gLines);

      // Línea equinoccial y corte
      this.gEq = svg('g', { class: 'equator' }, s);
      svg('path', { class: 'eq-line', d: `M0 ${latY(0)}H${G.w}` }, this.gEq);
      const eqT = svg('g', { transform: `translate(${lonX(-75.55)} ${latY(0)})` }, this.gEq);
      const eqt = svg('text', { class: 'eq-text', x: 0, y: -8, 'text-anchor': 'end' }, svg('g', { class: 'inv' }, eqT));
      eqt.textContent = 'LÍNEA EQUINOCCIAL · 0° 0′ 0″';

      // Capa de interacción
      this.gHit = svg('g', { class: 'hits' }, s);
      this.hitEl = {};
      for (const p of G.provinces) {
        const meta = EC.PROVS[p.id];
        const h = svg('path', {
          class: 'hit' + (p.inset ? ' hit-wide' : ''), d: p.d, 'data-id': p.id, tabindex: '0', role: 'button',
          'aria-label': `${p.name}, región ${EC.REGIONS[meta.region].name}. Capital: ${meta.capital}.`,
        }, this.gHit);
        this.hitEl[p.id] = h;
      }
      this.hlPath = svg('path', { class: 'hl-path', d: '' }, s);
      this.selPath = svg('path', { class: 'sel-path', d: '' }, s);

      // Marcadores: lugares, cumbres, parques
      this.gPlaces = svg('g', { class: 'places' }, s);
      this.placeEl = {};
      for (const pl of G.places) {
        const g = svg('g', { class: 'feat place' + (pl.capital ? ' cap' : ''), transform: `translate(${pl.x} ${pl.y})`, 'data-name': pl.name, tabindex: '-1' }, this.gPlaces);
        const inv = svg('g', { class: 'inv' }, g);
        svg('circle', { r: 3.6, class: 'dot' }, inv);
        const west = pl.province === 'galapagos';
        const t = svg('text', { x: west ? -7 : 7, y: 3.5, class: 'flabel', 'text-anchor': west ? 'end' : 'start' }, inv); t.textContent = pl.name;
        this.placeEl[pl.name] = g;
      }
      // Etiquetas
      this.gLabels = svg('g', { class: 'labels' }, s);
      this.provLabels = [];
      for (const p of G.provinces) {
        const meta = EC.PROVS[p.id];
        const g = svg('g', { class: 'plabel', transform: `translate(${p.label[0]} ${p.label[1]})`, 'data-id': p.id }, this.gLabels);
        const inv = svg('g', { class: 'inv' }, g);
        const t = svg('text', { class: 'ptext', 'text-anchor': 'middle' }, inv);
        meta.lines.forEach((ln, i) => { const ts = svg('tspan', { x: 0, dy: i === 0 ? `${-(meta.lines.length - 1) * 0.5}em` : '1em' }, t); ts.textContent = ln; });
        this.provLabels.push({ g, p, lines: meta.lines });
      }
      this.islLabels = [];
      this.regLabels = [];
      for (const [id, text, lon, lat] of REGION_LABELS) {
        const g = svg('g', { class: 'rlabel', transform: `translate(${lonX(lon)} ${latY(lat)})`, 'data-region': id }, this.gLabels);
        const inv = svg('g', { class: 'inv' }, g);
        const t = svg('text', { class: 'rtext', 'text-anchor': 'middle' }, inv); t.textContent = text;
        this.regLabels.push(g);
      }
      this.gContext = svg('g', { class: 'context' }, s);
      for (const [text, lon, lat, kind] of CONTEXT_LABELS) {
        const g = svg('g', { transform: `translate(${lonX(lon)} ${latY(lat)})` }, this.gContext);
        const inv = svg('g', { class: 'inv' }, g);
        const t = svg('text', { class: 'ctext ' + kind, 'text-anchor': 'middle' }, inv); t.textContent = text;
      }
      // Superposiciones HTML
      this.tip = el('div', { class: 'map-tip', role: 'status', hidden: true });
      this.view.append(this.tip);
      if (this.opts.ticks) { this.ticks = svg('svg', { class: 'map-ticks', 'aria-hidden': 'true' }); this.frame.append(this.ticks); }
      this.coord = el('div', { class: 'map-coord', 'aria-hidden': 'true' });
      this.view.append(this.coord);
      if (this.opts.scale) { this.scaleEl = el('div', { class: 'map-scale', 'aria-hidden': 'true' }); this.view.append(this.scaleEl); }
      if (this.opts.controls) {
        const mk = (label, txt, fn, cls) => el('button', { type: 'button', class: 'mc ' + (cls || ''), 'aria-label': label, title: label, onclick: fn }, txt);
        this.controls = el('div', { class: 'map-controls' }, [
          mk('Acercar', '+', () => this.zoomBy(1.6)),
          mk('Alejar', '−', () => this.zoomBy(1 / 1.6)),
          mk('Restablecer la vista', '⌖', () => this.resetView(), 'mc-reset'),
        ]);
        this.view.append(this.controls);
      }
      this.live = el('div', { class: 'sr-only', 'aria-live': 'polite' });
      this.root.append(this.live);
    }

    /* ───────────── Vista / zoom ───────────── */
    vbString(v = this.vb) { return `${v.x.toFixed(2)} ${v.y.toFixed(2)} ${v.w.toFixed(2)} ${v.h.toFixed(2)}`; }

    measure() {
      const r = this.view.getBoundingClientRect();
      this.cw = r.width; this.ch = r.height;
    }

    fit(b, pad = 0.05) {
      let { x, y, w, h } = b;
      x -= w * pad; y -= h * pad; w *= 1 + 2 * pad; h *= 1 + 2 * pad;
      const ar = (this.cw || 1000) / (this.ch || 800);
      if (w / h < ar) { const nw = h * ar; x -= (nw - w) / 2; w = nw; } else { const nh = w / ar; y -= (nh - h) / 2; h = nh; }
      return { x, y, w, h };
    }

    resolveFocus(f) {
      if (!f || f === 'all') return this.fit(FULL, 0);
      if (f === 'main') return this.fit(MAIN, 0);
      if (f === 'gal') return this.fit(GAL, 0);
      if (f.box) { const [lo0, la0, lo1, la1] = f.box; const x0 = lonX(lo0), x1 = lonX(lo1), y0 = latY(la1), y1 = latY(la0); return this.fit({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, 0); }
      if (f.provinces) {
        let b = null;
        for (const id of f.provinces) { const p = G.provinces.find((q) => q.id === id); if (!p) continue; const [a, c, d, e] = p.bbox; b = b ? [Math.min(b[0], a), Math.min(b[1], c), Math.max(b[2], d), Math.max(b[3], e)] : [a, c, d, e]; }
        if (b) return this.fit({ x: b[0], y: b[1], w: b[2] - b[0], h: b[3] - b[1] }, 0.08);
      }
      if (f.view) return this.fit(f.view, 0);
      return this.fit(FULL, 0);
    }

    clampView(v) {
      v.w = U.clamp(v.w, MIN_W, MAX_W);
      v.h = v.w * ((this.ch || 800) / (this.cw || 1000));
      v.x = U.clamp(v.x, -420, Math.max(-420, G.w - v.w));
      v.y = U.clamp(v.y, -60, Math.max(-60, G.h - v.h));
      return v;
    }

    setView(v) {
      this.vb = v;
      this.svg.setAttribute('viewBox', this.vbString());
      this.afterView();
    }

    flyTo(focus, dur = 900) {
      const to = this.clampView(Object.assign({}, focus && focus.w !== undefined && focus.x !== undefined ? focus : this.resolveFocus(focus)));
      this.cancelFly();
      if (!dur || U.prefersReducedMotion()) { this.setView(this.clampView(Object.assign({}, to))); return; }
      const from = Object.assign({}, this.vb);
      // Interpolación en espacio logarítmico del ancho, para que el zoom se sienta uniforme
      const t0 = performance.now();
      const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const step = (now) => {
        const t = Math.min(1, (now - t0) / dur), e = ease(t);
        const w = Math.exp(Math.log(from.w) * (1 - e) + Math.log(to.w) * e);
        const cx = from.x + from.w / 2 + (to.x + to.w / 2 - (from.x + from.w / 2)) * e;
        const cy = from.y + from.h / 2 + (to.y + to.h / 2 - (from.y + from.h / 2)) * e;
        const h = w * (to.h / to.w);
        this.vb = { x: cx - w / 2, y: cy - h / 2, w, h };
        this.svg.setAttribute('viewBox', this.vbString());
        this.afterView(true);
        if (t < 1) this.raf = requestAnimationFrame(step); else { this.raf = 0; this.afterView(); }
      };
      this.raf = requestAnimationFrame(step);
    }
    cancelFly() { if (this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; } }

    zoomBy(f, cx, cy) {
      this.cancelFly();
      const v = this.vb;
      const px = cx === undefined ? v.x + v.w / 2 : cx, py = cy === undefined ? v.y + v.h / 2 : cy;
      const w = U.clamp(v.w / f, MIN_W, MAX_W), k = w / v.w;
      const nv = { x: px - (px - v.x) * k, y: py - (py - v.y) * k, w, h: v.h * k };
      this.setView(this.clampView(nv));
    }

    resetView() { this.flyTo(this.scene ? this.scene.focus : 'all', 700); }

    toCanvas(clientX, clientY) {
      const r = this.view.getBoundingClientRect();
      const ppu = Math.min(r.width / this.vb.w, r.height / this.vb.h);
      const ox = (r.width - this.vb.w * ppu) / 2, oy = (r.height - this.vb.h * ppu) / 2;
      return [this.vb.x + (clientX - r.left - ox) / ppu, this.vb.y + (clientY - r.top - oy) / ppu];
    }

    afterView(moving) {
      const r = this.vb;
      this.ppu = Math.min(this.cw / r.w, this.ch / r.h) || 0.3;
      this.svg.style.setProperty('--ppu', this.ppu.toFixed(4));
      const z = this.ppu < 0.3 ? 'far' : this.ppu < 0.62 ? 'mid' : 'near';
      if (this.zoomClass !== z) { this.svg.dataset.zoom = z; this.zoomClass = z; }
      if (!this.pending) this.pending = requestAnimationFrame(() => { this.pending = 0; this.drawTicks(); this.layoutLabels(); this.drawScale(); });
      this.emit('view', this.vb, moving);
    }

    /* ───────────── Marcos, escala y etiquetas ───────────── */
    drawTicks() {
      if (!this.ticks) return;
      const fr = this.frame.getBoundingClientRect(), vr = this.view.getBoundingClientRect();
      const W = fr.width, H = fr.height, ox = vr.left - fr.left, oy = vr.top - fr.top;
      this.ticks.setAttribute('width', W); this.ticks.setAttribute('height', H);
      this.ticks.setAttribute('viewBox', `0 0 ${W} ${H}`);
      this.ticks.textContent = '';
      const v = this.vb, ppu = this.ppu;
      const sx = (x) => ox + (x - v.x) * ppu + (vr.width - v.w * ppu) / 2;
      const sy = (y) => oy + (y - v.y) * ppu + (vr.height - v.h * ppu) / 2;
      const cx = v.x + v.w / 2, cy = v.y + v.h / 2;
      const gal = U.isInset(cx, cy);
      const p = gal ? G.proj.gal : G.proj.main;
      const toX = (lon) => p.x0 + (lon - p.lonRef) * p.k, toY = (lat) => p.y0 + (p.latRef - lat) * p.k;
      const lon0 = p.lonRef + (v.x - p.x0) / p.k, lon1 = p.lonRef + (v.x + v.w - p.x0) / p.k;
      const lat1 = p.latRef - (v.y - p.y0) / p.k, lat0 = p.latRef - (v.y + v.h - p.y0) / p.k;
      const pxPerDeg = p.k * ppu;
      const steps = [0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10];
      const step = steps.find((s) => s * pxPerDeg >= 64) || 10;
      const sub = step / 4;
      const inView = (px, py) => px >= ox - 1 && px <= ox + vr.width + 1 && py >= oy - 1 && py <= oy + vr.height + 1;
      const line = (x1, y1, x2, y2, cls) => svg('line', { x1, y1, x2, y2, class: cls }, this.ticks);
      const txt = (x, y, t, anchor) => { const e = svg('text', { x, y, 'text-anchor': anchor, class: 'tick-label' }, this.ticks); e.textContent = t; };
      // Longitudes: marcas abajo y arriba
      for (let lon = Math.ceil(lon0 / sub) * sub; lon <= lon1; lon += sub) {
        const px = sx(toX(lon));
        if (px < ox || px > ox + vr.width) continue;
        const major = Math.abs(lon / step - Math.round(lon / step)) < 1e-6;
        const len = major ? 9 : 4;
        line(px, oy + vr.height, px, oy + vr.height + len, 'tick' + (major ? ' major' : ''));
        line(px, oy, px, oy - len, 'tick' + (major ? ' major' : ''));
        if (major) txt(px, oy + vr.height + 21, U.dms(lon, 'lon').replace(/ /g, ' '), 'middle');
      }
      for (let lat = Math.ceil(lat0 / sub) * sub; lat <= lat1; lat += sub) {
        const py = sy(toY(lat));
        if (py < oy || py > oy + vr.height) continue;
        const major = Math.abs(lat / step - Math.round(lat / step)) < 1e-6;
        const len = major ? 9 : 4;
        line(ox, py, ox - len, py, 'tick' + (major ? ' major' : ''));
        line(ox + vr.width, py, ox + vr.width + len, py, 'tick' + (major ? ' major' : ''));
        if (major) { const e = svg('text', { x: ox - 14, y: py, 'text-anchor': 'middle', class: 'tick-label', transform: `rotate(-90 ${ox - 14} ${py})` }, this.ticks); e.textContent = U.dms(lat, 'lat').replace(/ /g, ' '); }
      }
      this.gal = gal;
    }

    drawScale() {
      if (!this.scaleEl) return;
      const gal = U.isInset(this.vb.x + this.vb.w / 2, this.vb.y + this.vb.h / 2);
      const k = gal ? G.proj.gal.k : G.proj.main.k;
      const kmPerPx = 111.32 / (k * this.ppu);
      const nice = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
      let km = nice[0];
      for (const n of nice) { if (n / kmPerPx <= 150) km = n; }
      const w = km / kmPerPx;
      this.scaleEl.innerHTML = `<span class="sb" style="width:${w.toFixed(0)}px"></span><span class="sl">${km} km</span>`;
    }

    layoutLabels() {
      const sc = this.scene || {};
      const mode = this.layer('labels');
      const v = this.vb, ppu = this.ppu;
      const kept = [];
      const hit = (r) => kept.some((k) => !(r.r < k.l || r.l > k.r || r.b < k.t || r.t > k.b));
      const scr = (x, y) => [(x - v.x) * ppu + (this.cw - v.w * ppu) / 2, (y - v.y) * ppu + (this.ch - v.h * ppu) / 2];
      const fits = (x, y, w, h, force) => {
        const [px, py] = scr(x, y);
        const r = { l: px - w / 2, r: px + w / 2, t: py - h / 2, b: py + h / 2 };
        const vis = px > -20 && px < this.cw + 20 && py > -10 && py < this.ch + 10;
        const ok = vis && (force || !hit(r));
        if (ok) kept.push(r);
        return ok;
      };
      const place = (g, x, y, w, h, force) => { const ok = fits(x, y, w, h, force); g.classList.toggle('is-hidden', !ok); return ok; };
      const hl = sc.hl ? new Set(sc.hl) : null;
      const list = this.provLabels.slice().sort((a, b) => (hl ? (hl.has(b.p.id) ? 1 : 0) - (hl.has(a.p.id) ? 1 : 0) : 0) || EC.PROVS[b.p.id].area - EC.PROVS[a.p.id].area);
      for (const L of list) {
        const galZ = this.vb.w < 1500 && U.isInset(this.vb.x + this.vb.w / 2, this.vb.y + this.vb.h / 2);
        const show = mode === 'provinces' && (!hl || hl.has(L.p.id)) && !(L.p.id === 'galapagos' && galZ);
        if (!show) { L.g.classList.add('is-hidden'); continue; }
        const nchar = Math.max(...L.lines.map((s) => s.length));
        place(L.g, L.p.label[0], L.p.label[1], nchar * 7.2 + 6, L.lines.length * 15, hl && hl.has(L.p.id) && hl.size <= 3);
      }
      // Islas
      const galZoom = this.vb.w < 1500 && U.isInset(this.vb.x + this.vb.w / 2, this.vb.y + this.vb.h / 2);
      this.islLabels.forEach((g) => g.classList.toggle('is-hidden', !(galZoom && mode !== 'regions')));
      // Regiones (grandes)
      this.regLabels.forEach((g) => g.classList.toggle('is-hidden', mode !== 'regions'));
      // Ciudades con etiqueta
      const featLabels = (map) => Object.values(map).forEach((g) => {
        if (!g.classList.contains('is-on')) { g.classList.remove('lab-off'); return; }
        const mm = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(g.getAttribute('transform'));
        const pl = G.places.find((p) => p.name === g.dataset.name);
        const dup = pl && mode === 'provinces' && EC.PROVS[pl.province].lines.join(' ') === pl.name;
        const west = pl && pl.province === 'galapagos';
        const w = g.dataset.name.length * 6.2 + 16;
        const ok = !dup && fits(+mm[1] + (west ? -(w / 2 + 6) : w / 2 + 6) / ppu, +mm[2], w, 16, false);
        g.classList.toggle('lab-off', !ok);
      });
      featLabels(this.placeEl);
    }

    /* ───────────── Capas y escena ───────────── */
    layer(name) { return name in this.layerOverride ? this.layerOverride[name] : (this.scene ? this.scene[name] : null); }

    setLayer(name, value) {
      this.layerOverride[name] = value;
      this.applyLayers();
    }
    clearOverrides() { this.layerOverride = {}; this.applyLayers(); }

    setScene(scene, { animate = true } = {}) {
      const d = Object.assign({}, EC.SCENE_DEFAULT || {});
      const sc = Object.assign(d, scene, scene.layers || {});
      this.scene = sc;
      this.applyLayers();
      this.applyHighlight();
      if (animate) this.flyTo(sc.focus, 1000); else this.setView(this.clampView(this.resolveFocus(sc.focus)));
    }

    applyLayers() {
      const L = (n) => this.layer(n);
      const r = this.root;
      r.classList.toggle('no-relief', !L('relief'));
      r.classList.toggle('no-regions', !L('regions'));
      r.classList.toggle('show-equator', !!L('equator'));
      r.classList.toggle('show-graticule', L('graticule') !== false);
      this.svg.style.setProperty('--tint', String(L('tint') == null ? 0.5 : L('tint')));
      const on = (map, v) => {
        for (const [k, g] of Object.entries(map)) g.classList.toggle('is-on', v === true || (Array.isArray(v) && v.includes(k)));
      };
      on(this.placeEl, L('places') === 'capitals' ? Object.keys(this.placeEl).filter((k) => G.places.find((p) => p.name === k).capital) : L('places'));
      this.applyHighlight();
      this.layoutLabels();
    }

    applyHighlight() {
      const hl = this.scene && this.scene.hl ? new Set(this.scene.hl) : null;
      for (const id of Object.keys(this.fillEl)) {
        const dim = hl && !hl.has(id);
        this.fillEl[id].classList.toggle('is-dim', !!dim);
        this.lineEl[id].classList.toggle('is-dim', !!dim);
        this.fillEl[id].classList.toggle('is-hl', !!(hl && hl.has(id)));
      }
      this.root.classList.toggle('has-hl', !!hl);
    }

    /* ───────────── Selección y marcas ───────────── */
    select(id, { fly = false, announce = true } = {}) {
      this.selected = id;
      for (const k of Object.keys(this.fillEl)) this.fillEl[k].classList.toggle('is-sel', k === id);
      const p = id && G.provinces.find((q) => q.id === id);
      this.selPath.setAttribute('d', p ? p.d : '');
      if (fly && id) this.flyTo({ provinces: [id] }, 800);
      if (announce && p) this.live.textContent = `${p.name} seleccionada`;
      this.emit('select', id);
    }

    mark(id, kind) {
      const f = this.fillEl[id]; if (!f) return;
      for (const c of ['mark-ok', 'mark-bad', 'mark-target']) { f.classList.remove(c); this.lineEl[id].classList.remove(c); }
      if (kind) { f.classList.add('mark-' + kind); this.lineEl[id].classList.add('mark-' + kind); }
      this.marks[id] = kind;
    }
    clearMarks() { for (const id of Object.keys(this.marks)) this.mark(id, null); this.marks = {}; }

    flash(id, ms = 2200) {
      const f = this.fillEl[id]; if (!f) return;
      this.hlPath.setAttribute('d', G.provinces.find((q) => q.id === id).d);
      this.hlPath.classList.remove('pulse'); void this.hlPath.getBBox(); this.hlPath.classList.add('pulse');
      clearTimeout(this._ft);
      this._ft = setTimeout(() => { this.hlPath.classList.remove('pulse'); this.hlPath.setAttribute('d', this.hovered ? G.provinces.find((q) => q.id === this.hovered).d : ''); }, ms);
    }

    /* ───────────── Interacción ───────────── */
    bind() {
      const v = this.view;
      this.ro = new ResizeObserver(() => { this.measure(); if (!this.raf) this.setView(this.clampView(this.fit(this.vb, 0))); else this.afterView(); });
      this.ro.observe(v);

      // Rueda
      v.addEventListener('wheel', (e) => {
        if (this.opts.wheel === 'ctrl' && !(e.ctrlKey || e.metaKey)) return;
        e.preventDefault();
        const [cx, cy] = this.toCanvas(e.clientX, e.clientY);
        this.zoomBy(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0016)), cx, cy);
      }, { passive: false });

      // Arrastre y pellizco
      const pts = new Map();
      let last = null, moved = 0, pinch = 0;
      const down = (e) => {
        if (e.target.closest('.map-controls')) return;
        if (e.pointerType === 'touch' && !this.opts.touchPan && pts.size === 0) { pts.set(e.pointerId, e); return; }
        pts.set(e.pointerId, e);
        last = { x: e.clientX, y: e.clientY }; moved = 0;
        if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
        this.cancelFly();
      };
      const move = (e) => {
        if (!pts.has(e.pointerId)) { this.hoverMove(e); return; }
        pts.set(e.pointerId, e);
        if (pts.size === 2) {
          const [a, b] = [...pts.values()];
          const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
          if (pinch) { const [cx, cy] = this.toCanvas((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2); this.zoomBy(d / pinch, cx, cy); }
          pinch = d; moved = 10; return;
        }
        if (e.pointerType === 'touch' && !this.opts.touchPan) return;
        const dx = e.clientX - last.x, dy = e.clientY - last.y;
        moved += Math.abs(dx) + Math.abs(dy);
        if (moved > 6) {
          v.classList.add('dragging');
          const ppu = this.ppu; const nv = Object.assign({}, this.vb); nv.x -= dx / ppu; nv.y -= dy / ppu;
          this.setView(this.clampView(nv)); this.hideTip();
        }
        last = { x: e.clientX, y: e.clientY };
      };
      const up = (e) => {
        pts.delete(e.pointerId); pinch = 0;
        if (pts.size === 0) { v.classList.remove('dragging'); this.suppressClick = moved > 6; setTimeout(() => (this.suppressClick = false), 0); }
        if (pts.size === 1) last = { x: [...pts.values()][0].clientX, y: [...pts.values()][0].clientY };
      };
      v.addEventListener('pointerdown', down);
      this._wm = move; this._wu = up;
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
      v.addEventListener('pointerleave', () => { this.hideTip(); this.setHover(null); this.coord.textContent = ''; });
      v.addEventListener('click', (e) => {
        if (this.suppressClick) return;
        const t = e.target.closest('.hit');
        if (t) this.select(t.dataset.id);
      });
      v.addEventListener('keydown', (e) => {
        const t = e.target;
        if (t.classList && t.classList.contains('hit') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); this.select(t.dataset.id); return; }
        if (t !== v) return;
        const step = this.vb.w * 0.12;
        const map = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
        if (map[e.key]) { e.preventDefault(); const nv = Object.assign({}, this.vb); nv.x += map[e.key][0]; nv.y += map[e.key][1]; this.setView(this.clampView(nv)); }
        else if (e.key === '+' || e.key === '=') this.zoomBy(1.4);
        else if (e.key === '-' || e.key === '_') this.zoomBy(1 / 1.4);
        else if (e.key === '0') this.resetView();
      });
      // Foco por teclado en provincias
      this.gHit.addEventListener('focusin', (e) => { const id = e.target.dataset && e.target.dataset.id; if (id) { this.setHover(id); this.showTipFor(id, e.target); } });
      this.gHit.addEventListener('focusout', () => { this.setHover(null); this.hideTip(); });
    }

    hoverMove(e) {
      const r = this.view.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      const [x, y] = this.toCanvas(e.clientX, e.clientY);
      const gal = U.isInset(x, y);
      const [lon, lat] = U.unproject(x, y, gal);
      this.coord.textContent = `${U.dms(lat, 'lat')} · ${U.dms(lon, 'lon')}`;
      const t = e.target;
      if (t && t.classList && t.classList.contains('hit')) { this.setHover(t.dataset.id); this.showTipFor(t.dataset.id, null, e); }
      else { this.setHover(null); this.hideTip(); }
    }

    setHover(id) {
      if (this.hovered === id) return;
      this.hovered = id;
      if (!this.hlPath.classList.contains('pulse')) this.hlPath.setAttribute('d', id ? G.provinces.find((q) => q.id === id).d : '');
      this.root.classList.toggle('is-hovering', !!id);
      this.emit('hover', id);
    }

    showTipFor(id, node, e) {
      if (!this.opts.tooltip) return;
      const m = EC.PROVS[id], reg = EC.REGIONS[m.region];
      this.tip.innerHTML = `<span class="tip-chip" style="background:${reg.color}"></span><b>${m.name}</b><span class="tip-sub">${reg.name} · capital ${m.capital}</span>`;
      this.placeTip(e, node);
    }
    placeTip(e, node) {
      this.tip.hidden = false;
      const r = this.view.getBoundingClientRect();
      let x, y;
      if (e) { x = e.clientX - r.left; y = e.clientY - r.top; }
      else { const b = node.getBoundingClientRect(); x = b.left - r.left + b.width / 2; y = b.top - r.top + b.height / 2; }
      const tw = this.tip.offsetWidth, th = this.tip.offsetHeight;
      let tx = x + 16, ty = y + 16;
      if (tx + tw > r.width - 8) tx = x - tw - 12;
      if (ty + th > r.height - 8) ty = y - th - 12;
      this.tip.style.transform = `translate(${Math.max(8, tx)}px, ${Math.max(8, ty)}px)`;
    }
    hideTip() { this.tip.hidden = true; }

    destroy() {
      this.cancelFly();
      this.ro && this.ro.disconnect();
      window.removeEventListener('pointermove', this._wm);
      window.removeEventListener('pointerup', this._wu);
      window.removeEventListener('pointercancel', this._wu);
      cancelAnimationFrame(this.pending);
      clearTimeout(this._ft); clearTimeout(this._rt); clearTimeout(this._pt);
    }
  }

  EC.AtlasMap = AtlasMap;
})();
