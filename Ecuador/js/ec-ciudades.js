/* Vistas de consulta: tabla de cantones y ciudades principales con referencias. */
(function () {
  const EC = (window.EC = window.EC || {});
  const U = EC.util, el = U.el;
  const V = (EC.views = EC.views || {});
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const T = (s) => U.tidy(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ═════════════ Tabla de cantones ═════════════ */
  V.cantones = function (root) {
    root.innerHTML = `<header class="practice-head compact"><div class="wrap">
        <p class="eyebrow">Consulta</p>
        <h1 class="page-title" tabindex="-1">Cantones <em style="color:var(--pencil)">y cabeceras</em></h1>
        <p>El cantón es la división que sigue a la provincia, y su cabecera es la ciudad donde está el municipio. En muchos casos la cabecera se llama distinto que el cantón: conviene verificarlo antes de ubicar una dirección.</p>
      </div></header>
      <div class="wrap" id="body"><p class="empty">Cargando cantones…</p></div>`;
    U.loadScript('js/cantones-data.js').then(() => {
      const list = window.EC_CANTONES, P = EC.PROVS;
      const count = {}; list.forEach((c) => { const k = norm(c.name); count[k] = (count[k] || 0) + 1; });
      const seatCount = {}; list.forEach((c) => { const k = norm(c.seat); seatCount[k] = (seatCount[k] || 0) + 1; });
      list.forEach((c) => { c.diff = norm(c.seat) !== norm(c.name); c.dup = count[norm(c.name)] > 1 || seatCount[norm(c.seat)] > 1 || list.some((o) => o !== c && (norm(o.seat) === norm(c.name) || norm(o.name) === norm(c.seat))); });
      const body = root.querySelector('#body');
      body.innerHTML = `
        <div class="ctools">
          <label class="sr-only" for="cq">Buscar cantón o cabecera</label>
          <input class="search" id="cq" type="search" placeholder="Buscar cantón, cabecera o provincia…" autocomplete="off">
          <label class="sr-only" for="cp">Provincia</label>
          <select id="cp" class="search"><option value="">Todas las provincias</option>${EC.PROV_IDS.map((id) => `<option value="${id}">${P[id].name}</option>`).join('')}</select>
          <label class="layer-row"><input type="checkbox" id="cd"> Solo cabecera con otro nombre</label>
          <label class="layer-row"><input type="checkbox" id="cu"> Solo nombres que se repiten</label>
          <span class="mono" id="cc" style="color:var(--muted)"></span>
        </div>
        <div class="table-wrap"><table class="ctable">
          <caption class="sr-only">Cantones del Ecuador con provincia, cabecera, altitud y población</caption>
          <thead><tr>
            <th scope="col"><button data-k="name">Cantón</button></th><th scope="col"><button data-k="prov">Provincia</button></th><th scope="col"><button data-k="seat">Cabecera cantonal</button></th>
            <th scope="col" class="num"><button data-k="alt">Altitud (m)</button></th><th scope="col" class="num"><button data-k="pop">Población</button></th><th scope="col"><span class="sr-only">Mapa</span></th>
          </tr></thead><tbody id="rows"></tbody></table></div>
        <p class="foot-note">Altitud de la cabecera: modelo digital SRTM (GeoNames), aproximada. Población: Censo 2022. La ubicación de cinco cabeceras es aproximada; los cantones creados recientemente aún no tienen límite dibujado en el mapa.</p>`;
      let key = 'name', dir = 1;
      const rows = body.querySelector('#rows'), cq = body.querySelector('#cq'), cp = body.querySelector('#cp'), cd = body.querySelector('#cd'), cu = body.querySelector('#cu'), cc = body.querySelector('#cc');
      const val = (c, k) => (k === 'prov' ? P[c.prov].name : c[k]);
      function draw() {
        const q = norm(cq.value.trim());
        const items = list.filter((c) => (!q || norm(c.name + ' ' + c.seat + ' ' + P[c.prov].name).includes(q)) && (!cp.value || c.prov === cp.value) && (!cd.checked || c.diff) && (!cu.checked || c.dup));
        items.sort((a, b) => { const x = val(a, key), y = val(b, key); const r = typeof x === 'number' || x == null ? (x ?? -1) - (y ?? -1) : String(x).localeCompare(String(y), 'es'); return r * dir || a.name.localeCompare(b.name, 'es'); });
        rows.innerHTML = items.map((c) => `<tr><th scope="row">${esc(c.name)}${c.dup ? ' <span class="tag" title="Hay otro cantón o cabecera con un nombre igual o muy parecido">se repite</span>' : ''}${c.noPoly ? ' <span class="tag" title="Creación reciente: su límite aún no está en el mapa">nuevo</span>' : ''}</th>
          <td>${esc(P[c.prov].name)}</td><td>${esc(c.seat)}${c.diff ? ' <span class="tag" title="La cabecera no se llama igual que el cantón">≠ cantón</span>' : ''}</td>
          <td class="num">${c.alt != null ? U.num(c.alt) : '—'}</td><td class="num">${c.pop ? U.num(c.pop) : '—'}</td>
          <td><a class="btn ghost sm" href="#/atlas/${c.id}" aria-label="Ver ${esc(c.name)} en el atlas">Mapa</a></td></tr>`).join('');
        cc.textContent = `${items.length} de ${list.length}`;
      }
      body.querySelectorAll('thead button').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.k; dir = key === k ? -dir : 1; key = k; draw(); }));
      [cq, cp, cd, cu].forEach((x) => x.addEventListener('input', draw));
      draw();
    }).catch(() => { root.querySelector('#body').innerHTML = '<p class="empty">No se pudieron cargar los cantones.</p>'; });
    return {};
  };

  /* ═════════════ Ciudades y referencias ═════════════ */
  V.ciudades = function (root, app, param) {
    root.innerHTML = '<h1 class="sr-only page-title" tabindex="-1">Ciudades y referencias</h1><div class="wrap"><p class="empty" style="padding-top:3rem">Cargando ciudades…</p></div>';
    let map = null, destroyed = false;
    Promise.all([U.loadScript('js/cantones-data.js'), U.loadScript('js/ciudades-data.js')]).then(() => {
      if (destroyed) return;
      const CITIES = window.EC_CIUDADES.slice().sort((a, b) => (b.seatPop || 0) - (a.seatPop || 0)), TYPES = window.EC_TIPOS, P = EC.PROVS;
      root.innerHTML = `
        <h1 class="sr-only page-title" tabindex="-1">Ciudades y referencias</h1>
        <div class="atlas has-detail cities" id="cities">
          <aside class="atlas-side" aria-label="Ciudades">
            <div class="side-block"><h2>Ciudades principales <span class="mono" style="color:var(--muted)">(${CITIES.length})</span></h2><ul class="plist" id="clist"></ul></div>
            <div class="side-block" style="border-bottom:none"><p class="foot-note" style="margin:0">Sectores y referencias: OpenStreetMap. Sirven para orientarse; la dirección exacta se verifica siempre en el mapa de despacho.</p></div>
          </aside>
          <div class="atlas-stage"><div class="stage-map"><div id="map" style="height:100%"></div></div></div>
          <aside class="detail" id="detail" aria-label="Detalle de la ciudad" aria-live="polite"></aside>
        </div>`;
      const detail = root.querySelector('#detail'), clist = root.querySelector('#clist');
      map = new EC.AtlasMap(root.querySelector('#map'), { label: 'Mapa de la ciudad con puntos de referencia' });
      map.setScene({ focus: 'all', tint: 0.3, labels: false, places: false, equator: false, cantones: true, regions: false }, { animate: false });
      map.setCantons(window.EC_CANTONES);
      let city = null; const active = new Set(Object.keys(TYPES)); let showSectors = true;
      const buttons = {};
      for (const c of CITIES) {
        const b = el('button', { type: 'button', 'data-id': c.id }, [c.name, el('small', null, c.prov ? P[c.prov].name : '')]);
        b.addEventListener('click', () => pick(c.id));
        buttons[c.id] = b; clist.append(el('li', null, b));
      }

      function markers() {
        const refs = city.refs.filter((r) => active.has(r.type));
        map.setMarkers(refs.map((r) => ({ id: r.id, x: r.x, y: r.y, type: r.type, glyph: TYPES[r.type].glyph, typeName: TYPES[r.type].name, label: r.name, note: r.note })));
        map.setSectors(showSectors ? city.sectors : []);
      }
      function render() {
        const c = city, guide = EC.CITY_GUIDE && EC.CITY_GUIDE[c.id];
        const counts = {}; c.refs.forEach((r) => (counts[r.type] = (counts[r.type] || 0) + 1));
        const reg = c.prov ? EC.REGIONS[P[c.prov].region] : null;
        const isCap = c.prov && norm(P[c.prov].capital).includes(norm(c.name));
        const alt = isCap ? P[c.prov].capitalAlt : c.alt;
        detail.innerHTML = `
          ${reg ? `<span class="chip region-chip"><i class="dot" style="--c:${reg.color}"></i>${reg.name} · ${P[c.prov].name}</span>` : ''}
          <h2 tabindex="-1">${c.name}</h2>
          <dl class="grid">
            <div><dt>Cantón</dt><dd>${c.canton ? esc(c.canton) : '—'}${c.cantonId ? `<br><small><a href="#/atlas/${c.cantonId}">ver cantón</a></small>` : ''}</dd></div>
            <div><dt>Altitud</dt><dd>${alt != null ? '≈ ' + U.num(alt) + ' <small>m</small>' : '—'}</dd></div>
            <div><dt>Población de la ciudad</dt><dd>${c.seatPop ? U.num(c.seatPop) : '—'}<br><small>Censo 2022</small></dd></div>
            <div><dt>Referencias</dt><dd>${c.refs.length}<br><small>${c.sectors.length} sectores</small></dd></div>
          </dl>
          ${guide ? `<p>${T(guide.resumen)}</p>` : ''}
          <h3>Qué mostrar en el mapa</h3>
          <div class="filters" role="group" aria-label="Tipos de referencia">${Object.keys(TYPES).filter((t) => counts[t]).map((t) => `<button type="button" class="chip" data-t="${t}" aria-pressed="${active.has(t)}"><span class="glyph ref-${t}">${TYPES[t].glyph}</span>${TYPES[t].name} · ${counts[t]}</button>`).join('')}
            <button type="button" class="chip" data-sec="1" aria-pressed="${showSectors}">Sectores · ${c.sectors.length}</button></div>
          <h3>Puntos de referencia</h3>
          <div id="reflist">${Object.keys(TYPES).filter((t) => counts[t] && active.has(t)).map((t) => `<p class="reftype">${TYPES[t].name}</p><ul class="reflist">${c.refs.filter((r) => r.type === t).map((r) => `<li><button type="button" data-ref="${r.id}"><span class="glyph ref-${t}">${TYPES[t].glyph}</span>${esc(r.name)}</button></li>`).join('')}</ul>`).join('')}</div>
          ${guide ? guideHTML(guide) : '<p class="note-warn">Aún no hay guía escrita para esta ciudad; el mapa muestra sus sectores y referencias.</p>'}
          <p class="note-warn">Las referencias vienen de OpenStreetMap y pueden estar incompletas o desactualizadas. Úselas para orientarse y confirme la dirección exacta con el mapa de despacho o la ubicación compartida por el cliente.</p>`;
        detail.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => { const t = b.dataset.t; active.has(t) ? active.delete(t) : active.add(t); render(); markers(); }));
        detail.querySelector('[data-sec]').addEventListener('click', () => { showSectors = !showSectors; render(); markers(); });
        detail.querySelectorAll('[data-ref]').forEach((b) => b.addEventListener('click', () => focusRef(b.dataset.ref)));
        detail.scrollTop = 0;
      }
      function guideHTML(g) {
        return `<h3>Cómo orientarse</h3>
          <details open><summary>Zonas</summary><ul class="plain">${g.zonas.map(([n, t]) => `<li><b>${esc(n)}.</b> ${esc(T(t))}</li>`).join('')}</ul></details>
          <details><summary>Vías principales</summary><ul class="plain">${g.vias.map((v) => `<li>${esc(T(v))}</li>`).join('')}</ul></details>
          <details><summary>Cómo se escriben las direcciones</summary><p class="addr">${esc(g.direccion.formato)}</p><p>${esc(T(g.direccion.lectura))}</p></details>
          <details open><summary>Al ubicar una llamada</summary><ul class="plain">${g.consejos.map((v) => `<li>${esc(T(v))}</li>`).join('')}</ul></details>`;
      }
      function focusRef(id) {
        const r = city.refs.find((x) => x.id === id); if (!r) return;
        if (!active.has(r.type)) { active.add(r.type); markers(); render(); }
        map.markActive(id);
        map.flyTo(map.fit({ x: r.x - 7, y: r.y - 7, w: 14, h: 14 }, 0), 700);
        detail.querySelectorAll('[data-ref]').forEach((b) => b.classList.toggle('is-active', b.dataset.ref === id));
      }
      function pick(id, animate = true) {
        const c = CITIES.find((x) => x.id === id); if (!c) return;
        city = c;
        Object.entries(buttons).forEach(([k, b]) => b.setAttribute('aria-current', k === id ? 'true' : 'false'));
        const r = c.radius, box = c.view || [c.lon - r * 0.95, c.lat - r * 0.85, c.lon + r * 0.95, c.lat + r * 0.85];
        map.setScene({ focus: { box }, tint: 0.3, labels: false, places: false, equator: false, cantones: true, regions: false }, { animate });
        markers(); render();
        history.replaceState(null, '', '#/ciudades/' + id);
      }
      map.on('marker', (id) => { focusRef(id); const b = detail.querySelector(`[data-ref="${id}"]`); if (b) b.scrollIntoView({ block: 'nearest' }); });
      map.on('selectCanton', (id) => { const c = window.EC_CANTONES.find((x) => x.id === id); if (c) { map.live.textContent = 'Cantón ' + c.name; } });
      pick((param && CITIES.find((c) => c.id === param) ? param : CITIES[0].id), false);
    }).catch((e) => { console.error(e); root.innerHTML = '<div class="wrap"><p class="empty">No se pudieron cargar las ciudades.</p></div>'; });
    return { destroy: () => { destroyed = true; map && map.destroy(); } };
  };
})();
