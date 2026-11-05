/* Vistas: inicio y las tres secciones (Provincia → Ciudad → Sector). */
(function () {
  const EC = (window.EC = window.EC || {});
  const U = EC.util, el = U.el, G = window.EC_GEO, GUIA = window.EC_GUIA;
  const V = (EC.views = {});
  const P = EC.PROVS;
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const REGION_ORDER = ['costa', 'sierra', 'amazonia', 'insular'];
  const CITIES = GUIA.ciudades.slice().sort((a, b) => b.n - a.n);
  const cityById = (id) => CITIES.find((c) => c.id === id);
  const provCases = (id) => GUIA.provincias[id] || 0;
  const pct = (n) => U.num((n / GUIA.total) * 100, n / GUIA.total < 0.1 ? 1 : 0);
  const legendHTML = () => '<div class="map-legend" aria-hidden="true">' + REGION_ORDER.map((r) => `<span><i style="--c:${EC.REGIONS[r].color}"></i>${EC.REGIONS[r].name}</span>`).join('') + '</div>';
  const mes = (s) => { const [d, m, y] = s.split('-'); return ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][+m - 1] + ' de ' + y; };
  const periodo = () => `${mes(GUIA.desde)} a ${mes(GUIA.hasta)}`;

  /* ═════════════ Inicio ═════════════ */
  V.home = function (root) {
    const S = EC.STATS;
    const top4 = Object.entries(GUIA.provincias).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const top4pct = Math.round((top4.reduce((a, [, n]) => a + n, 0) / GUIA.total) * 100);
    root.innerHTML = `
      <section class="hero">
        <div class="wrap hero-grid">
          <div class="hero-copy">
            <div>
              <p class="eyebrow rise">Guía de consulta para ubicar direcciones</p>
              <h1 class="page-title rise d1" tabindex="-1">Geografía<em>del Ecuador</em></h1>
              <p class="lede rise d2">Las direcciones llegan por teléfono en este orden: <b>provincia, ciudad y sector</b>. Aquí están las tres, en un mapa, con las ciudades que más se piden.</p>
              <div class="hero-actions rise d3">
                <a class="btn arrow" href="#/provincias">Empezar por la provincia</a>
              </div>
            </div>
            <div class="hero-meta rise d4">
              <span class="chip"><i class="dot" style="--c:var(--costa)"></i>Costa</span>
              <span class="chip"><i class="dot" style="--c:var(--sierra)"></i>Sierra</span>
              <span class="chip"><i class="dot" style="--c:var(--amazonia)"></i>Amazonía</span>
              <span class="chip"><i class="dot" style="--c:var(--insular)"></i>Insular</span>
            </div>
          </div>
          <div class="hero-map rise d2"><div class="caption" id="heroCaption">Pasa el cursor por el mapa</div><div id="heroMap" style="height:100%"></div></div>
        </div>
      </section>

      <section class="section" id="ficha">
        <div class="wrap">
          <div class="section-head">
            <h2>El país en seis datos</h2>
            <p>Lo mínimo para ubicarse. El detalle de cada provincia está en la primera sección.</p>
          </div>
          <dl class="fact-list">
            ${[
              ['Población', U.num(S.total.pop / 1e6, 1) + ' millones', 'Censo 2022, INEC'],
              ['División', '24 provincias', 'Cada provincia se divide en cantones; cada cantón tiene una ciudad cabecera'],
              ['Regiones', 'Cuatro', 'Costa, Sierra, Amazonía e Insular (Galápagos)'],
              ['Capital', 'Quito', 'En la Sierra, a 2 850 m de altura'],
              ['Ciudad más poblada', 'Guayaquil', 'En la Costa; es el puerto principal'],
              ['Hora', 'UTC−5', 'En Galápagos, UTC−6'],
            ].map(([k, v, s]) => `<div class="fact"><dt>${k}</dt><dd>${v}<small>${s}</small></dd></div>`).join('')}
          </dl>
        </div>
      </section>

      <section class="section" id="ruta">
        <div class="wrap">
          <div class="section-head">
            <h2>Cómo se dicta una dirección</h2>
            <p>Siempre de lo general a lo particular. Si el cliente salta un paso, se le pregunta en este mismo orden.</p>
          </div>
          <ol class="route">
            <li><span class="num">01</span><div><h3><a href="#/provincias">Provincia</a></h3><p>Las 24 provincias en el mapa, con su capital y las ciudades que más se piden. ${top4.map(([id]) => P[id].name).join(', ')} concentran el ${top4pct} % de los casos.</p></div><div class="meta"><span>24</span></div></li>
            <li><span class="num">02</span><div><h3><a href="#/ciudades">Ciudad</a></h3><p>Las ${CITIES.length} ciudades más frecuentes, ordenadas por número de casos, con su provincia y su cantón.</p></div><div class="meta"><span>${CITIES.length}</span></div></li>
            <li><span class="num">03</span><div><h3><a href="#/sectores">Sector</a></h3><p>Barrios y sectores de cada ciudad ubicados en el mapa, para quienes dictan «por la Villaflora» o «cerca de la Kennedy».</p></div><div class="meta"><span>${CITIES.filter((c) => c.sectores.length).length} ciudades</span></div></li>
          </ol>
          <p class="foot-note" style="margin-top:var(--s5)">Las ciudades y su orden salen del reporte de asistencias de ${periodo()} (${U.num(GUIA.total)} casos). Es una ayuda de contexto: la dirección exacta se confirma siempre con el mapa de despacho o la ubicación que comparte el cliente.</p>
        </div>
      </section>

      <section class="credits">
        <div class="wrap cols">
          <div><h4>Mapas</h4><p>Límites de provincias: geoBoundaries (CC0), referenciales; no sustituyen la cartografía oficial del IGM. Relieve calculado con teselas Terrarium (SRTM y GEBCO, vía AWS Open Data).</p></div>
          <div><h4>Ciudades y sectores</h4><p>Ubicaciones: GeoNames (CC BY 4.0) y © colaboradores de OpenStreetMap (ODbL). Pueden faltar sectores o tener posiciones aproximadas.</p></div>
          <div><h4>Cifras</h4><p>Población: INEC, Censo 2022. Casos: conteo agregado del reporte de asistencias, sin datos de personas.</p></div>
        </div>
      </section>`;
    const map = new EC.AtlasMap(root.querySelector('#heroMap'), { wheel: 'ctrl', touchPan: false, controls: false, label: 'Mapa de las regiones del Ecuador' });
    map.setScene({ focus: 'all', tint: 0.62, labels: 'provinces', places: 'capitals' }, { animate: false });
    const cap = root.querySelector('#heroCaption');
    map.on('hover', (id) => { cap.textContent = id ? `${P[id].name} · ${EC.REGIONS[P[id].region].name}` : 'Pasa el cursor por el mapa'; });
    map.on('select', (id) => { if (id) location.hash = '#/provincias/' + id; });
    return { destroy: () => map.destroy() };
  };

  /* ═════════════ 1 · Provincia ═════════════ */
  V.provincias = function (root, app, param) {
    root.innerHTML = `
      <h1 class="sr-only page-title" tabindex="-1">Provincias del Ecuador</h1>
      <div class="atlas" id="atlas">
        <aside class="atlas-side" aria-label="Provincias">
          <div class="side-block"><p class="step-tag">1 · Provincia</p><input class="search" type="search" id="q" placeholder="Buscar provincia o capital…" aria-label="Buscar provincia o capital" autocomplete="off"></div>
          <div class="side-block" style="border-bottom:none"><h2>Por número de casos <span id="count" class="mono" style="color:var(--muted)"></span></h2><ul class="plist" id="plist"></ul></div>
        </aside>
        <div class="atlas-stage"><div class="stage-map"><div id="map" style="height:100%"></div></div></div>
        <aside class="detail" id="detail" aria-label="Ficha de la provincia" aria-live="polite"></aside>
      </div>`;
    const A = root.querySelector('#atlas'), detail = root.querySelector('#detail'), plist = root.querySelector('#plist'), q = root.querySelector('#q'), count = root.querySelector('#count');
    const map = new EC.AtlasMap(root.querySelector('#map'));
    map.setScene({ focus: 'all', tint: 0.5, labels: 'provinces', places: 'capitals', equator: false, cantones: false }, { animate: false });
    map.view.insertAdjacentHTML('beforeend', legendHTML());
    const buttons = {};
    const order = EC.PROV_IDS.slice().sort((a, b) => provCases(b) - provCases(a) || P[a].name.localeCompare(P[b].name, 'es'));
    function buildList(filter = '') {
      plist.innerHTML = ''; let n = 0;
      for (const id of order) {
        if (filter && !norm(P[id].name + ' ' + P[id].capital).includes(filter)) continue;
        n++;
        const c = provCases(id);
        const b = el('button', { type: 'button', 'data-id': id, 'aria-current': map.selected === id ? 'true' : 'false' }, [P[id].name, el('small', null, c ? U.num(c) : '—')]);
        b.addEventListener('click', () => map.select(id, { fly: true }));
        b.addEventListener('pointerenter', () => map.setHover(id));
        b.addEventListener('pointerleave', () => map.setHover(null));
        buttons[id] = b; plist.append(el('li', null, b));
      }
      count.textContent = `(${n})`;
    }
    buildList();
    q.addEventListener('input', () => buildList(norm(q.value.trim())));

    function showDetail(id) {
      A.classList.toggle('has-detail', !!id);
      if (!id) { detail.innerHTML = ''; return; }
      const p = P[id], reg = EC.REGIONS[p.region], c = provCases(id);
      const adj = (G.adjacency[id] || []).slice().sort((a, b) => P[a].name.localeCompare(P[b].name, 'es'));
      const ext = [];
      (G.borders[id] || []).forEach((b) => ext.push(b === 'colombia' ? 'Colombia' : 'Perú'));
      if (EC.SETS.coast.includes(id) || id === 'galapagos') ext.push('Océano Pacífico');
      const cities = CITIES.filter((x) => x.prov === id);
      detail.innerHTML = `
        <button class="close" type="button" aria-label="Cerrar ficha">×</button>
        <span class="chip region-chip"><i class="dot" style="--c:${reg.color}"></i>${reg.name} · ${reg.alt}</span>
        <h2 tabindex="-1">${p.name}</h2>
        <dl class="grid">
          <div><dt>Capital</dt><dd>${p.capital.replace(/ \(.*\)/, '')}<br><small>${U.num(p.capitalAlt)} m s. n. m.</small></dd></div>
          <div><dt>Casos reportados</dt><dd>${c ? U.num(c) : 'Ninguno'}<br><small>${c ? pct(c) + ' % del total' : 'en el período'}</small></dd></div>
        </dl>
        <p style="margin-top:1.1rem">${U.tidy(p.resumen)}</p>
        <h3>Ciudades más frecuentes</h3>
        ${cities.length ? `<ul class="reflist">${cities.map((x) => `<li><a class="rowlink" href="#/ciudades/${x.id}"><span>${esc(x.name)}</span><small>${U.num(x.n)} casos</small></a></li>`).join('')}</ul>` : '<p class="note-warn">Esta provincia no tiene ciudades entre las más frecuentes. Si llega un caso, se ubica con el mapa de despacho.</p>'}
        <h3>Limita con</h3>
        <div class="neigh">${adj.map((a) => `<button class="chip" type="button" data-go="${a}">${P[a].name}</button>`).join('')}${ext.map((e) => `<span class="chip ext">${e}</span>`).join('')}</div>`;
      detail.querySelector('.close').onclick = () => map.select(null);
      detail.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => map.select(b.dataset.go, { fly: true })));
      detail.scrollTop = 0;
    }
    map.on('select', (id) => {
      showDetail(id);
      Object.entries(buttons).forEach(([k, b]) => b.setAttribute('aria-current', k === id ? 'true' : 'false'));
      if (id && buttons[id]) buttons[id].scrollIntoView({ block: 'nearest' });
      history.replaceState(null, '', id ? '#/provincias/' + id : '#/provincias');
    });
    map.on('hover', (id) => Object.entries(buttons).forEach(([k, b]) => b.classList.toggle('is-hover', k === id)));
    if (param && P[param]) setTimeout(() => map.select(param, { fly: true }), 60);
    return { destroy: () => map.destroy() };
  };

  /* ═════════════ 2 · Ciudad ═════════════ */
  V.ciudades = function (root, app, param) {
    root.innerHTML = `
      <h1 class="sr-only page-title" tabindex="-1">Ciudades más frecuentes</h1>
      <div class="atlas has-detail cities" id="cities">
        <aside class="atlas-side" aria-label="Ciudades">
          <div class="side-block"><p class="step-tag">2 · Ciudad</p><input class="search" type="search" id="q" placeholder="Buscar ciudad…" aria-label="Buscar ciudad" autocomplete="off"></div>
          <div class="side-block" style="border-bottom:none"><h2>Por número de casos <span id="count" class="mono" style="color:var(--muted)"></span></h2><ul class="plist" id="clist"></ul></div>
        </aside>
        <div class="atlas-stage"><div class="stage-map"><div id="map" style="height:100%"></div></div></div>
        <aside class="detail" id="detail" aria-label="Ficha de la ciudad" aria-live="polite"></aside>
      </div>`;
    const detail = root.querySelector('#detail'), clist = root.querySelector('#clist'), q = root.querySelector('#q'), count = root.querySelector('#count');
    const map = new EC.AtlasMap(root.querySelector('#map'), { label: 'Mapa de ciudades frecuentes' });
    const SCENE = { tint: 0.5, labels: 'provinces', places: false, equator: false, cantones: false, regions: true };
    map.setScene({ ...SCENE, focus: 'all' }, { animate: false });
    map.setMarkers(CITIES.map((c) => ({ id: c.id, x: c.x, y: c.y, type: 'ciudad', glyph: '', typeName: 'Ciudad', label: c.name, note: P[c.prov].name })));
    const buttons = {};
    let city = null;
    function buildList(filter = '') {
      clist.innerHTML = ''; let n = 0;
      for (const c of CITIES) {
        if (filter && !norm(c.name + ' ' + P[c.prov].name).includes(filter)) continue;
        n++;
        const b = el('button', { type: 'button', 'data-id': c.id, 'aria-current': city && city.id === c.id ? 'true' : 'false' }, [el('span', null, [c.name, el('em', { class: 'sub' }, P[c.prov].name)]), el('small', null, U.num(c.n))]);
        b.addEventListener('click', () => pick(c.id));
        buttons[c.id] = b; clist.append(el('li', null, b));
      }
      count.textContent = `(${n})`;
    }
    buildList();
    q.addEventListener('input', () => buildList(norm(q.value.trim())));

    function render() {
      const c = city, p = P[c.prov], reg = EC.REGIONS[p.region];
      const alt = norm(p.capital).includes(norm(c.name)) ? p.capitalAlt : c.alt;
      const same = CITIES.filter((x) => x.prov === c.prov && x.id !== c.id);
      detail.innerHTML = `
        <span class="chip region-chip"><i class="dot" style="--c:${reg.color}"></i>${reg.name}</span>
        <p class="eyebrow" style="margin:1rem 0 0">Provincia · <a href="#/provincias/${p.id}">${p.name}</a></p>
        <h2 tabindex="-1" style="margin-top:.2rem">${esc(c.name)}</h2>
        <dl class="grid">
          <div><dt>Provincia</dt><dd><a href="#/provincias/${p.id}">${p.name}</a></dd></div>
          <div><dt>Cantón</dt><dd>${esc(c.canton)}</dd></div>
          <div><dt>Altitud</dt><dd>${alt != null ? '≈ ' + U.num(alt) + ' <small>m</small>' : '—'}</dd></div>
          <div><dt>Casos reportados</dt><dd>${U.num(c.n)}<br><small>${pct(c.n)} % del total</small></dd></div>
        </dl>
        ${c.sectores.length ? `<a class="btn arrow" href="#/sectores/${c.id}" style="margin-top:1.2rem">Ver sus ${c.sectores.length} sectores</a>` : '<p class="note-warn">Aún no hay sectores cargados para esta ciudad. Se ubica con el mapa de despacho.</p>'}
        ${same.length ? `<h3>Otras ciudades de ${p.name}</h3><div class="neigh">${same.map((x) => `<button class="chip" type="button" data-c="${x.id}">${esc(x.name)}</button>`).join('')}</div>` : ''}
        <p class="note-warn">Ubicación de la cabecera cantonal. Úsela para orientarse; confirme la dirección con el mapa de despacho.</p>`;
      detail.querySelectorAll('[data-c]').forEach((b) => (b.onclick = () => pick(b.dataset.c)));
      detail.scrollTop = 0;
    }
    function pick(id, animate = true) {
      const c = cityById(id); if (!c) return;
      city = c;
      Object.entries(buttons).forEach(([k, b]) => b.setAttribute('aria-current', k === id ? 'true' : 'false'));
      if (buttons[id]) buttons[id].scrollIntoView({ block: 'nearest' });
      map.markActive(id);
      map.setScene({ ...SCENE, focus: { box: [c.lon - 0.5, c.lat - 0.42, c.lon + 0.5, c.lat + 0.42] } }, { animate });
      render();
      history.replaceState(null, '', '#/ciudades/' + id);
    }
    map.on('marker', (id) => pick(id));
    pick(param && cityById(param) ? param : CITIES[0].id, false);
    return { destroy: () => map.destroy() };
  };

  /* ═════════════ 3 · Sector ═════════════ */
  V.sectores = function (root, app, param) {
    const WITH = CITIES.filter((c) => c.sectores.length);
    root.innerHTML = `
      <h1 class="sr-only page-title" tabindex="-1">Sectores de cada ciudad</h1>
      <div class="atlas sectors" id="sectors">
        <aside class="atlas-side" aria-label="Sectores">
          <div class="side-block"><p class="step-tag">3 · Sector</p><label class="lbl" for="city">Ciudad</label><select class="search" id="city">${WITH.map((c) => `<option value="${c.id}">${esc(c.name)} · ${P[c.prov].name}</option>`).join('')}</select></div>
          <div class="side-block"><input class="search" type="search" id="q" placeholder="Buscar sector…" aria-label="Buscar sector" autocomplete="off"></div>
          <div class="side-block" style="border-bottom:none"><h2 id="shead">Sectores <span id="count" class="mono" style="color:var(--muted)"></span></h2><ul class="plist" id="slist"></ul><p class="foot-note" id="snote"></p></div>
        </aside>
        <div class="atlas-stage"><div class="stage-map"><div id="map" style="height:100%"></div></div></div>
      </div>`;
    const sel = root.querySelector('#city'), q = root.querySelector('#q'), slist = root.querySelector('#slist'), count = root.querySelector('#count'), snote = root.querySelector('#snote');
    const map = new EC.AtlasMap(root.querySelector('#map'), { label: 'Mapa de los sectores de la ciudad' });
    const SCENE = { tint: 0.4, labels: false, places: false, equator: false, cantones: false, regions: true };
    map.setScene({ ...SCENE, focus: 'all' }, { animate: false });
    let city = null;
    const buttons = {};
    function buildList() {
      const filter = norm(q.value.trim());
      slist.innerHTML = ''; let n = 0;
      for (const s of city.sectores.slice().sort((a, b) => a.name.localeCompare(b.name, 'es'))) {
        if (filter && !norm(s.name).includes(filter)) continue;
        n++;
        const b = el('button', { type: 'button', 'data-s': s.name }, [s.name, el('small', null, s.n ? U.num(s.n) + (s.n === 1 ? ' caso' : ' casos') : '')]);
        b.addEventListener('click', () => focus(s.name));
        buttons[s.name] = b; slist.append(el('li', null, b));
      }
      count.textContent = `(${n})`;
      if (!n) slist.append(el('li', { class: 'empty' }, 'Ningún sector con ese nombre.'));
    }
    function focus(name) {
      const s = city.sectores.find((x) => x.name === name); if (!s) return;
      map.markActive(city.id + '|' + name);
      map.flyTo(map.fit({ x: s.x - 9, y: s.y - 9, w: 18, h: 18 }, 0), 700);
      Object.entries(buttons).forEach(([k, b]) => b.setAttribute('aria-current', k === name ? 'true' : 'false'));
    }
    function pick(id, animate = true) {
      const c = cityById(id) && cityById(id).sectores.length ? cityById(id) : WITH[0];
      city = c; sel.value = c.id; q.value = '';
      map.setMarkers(c.sectores.map((s) => ({ id: c.id + '|' + s.name, x: s.x, y: s.y, type: 'sector', glyph: '', typeName: 'Sector', label: s.name, note: '' })));
      map.setScene({ ...SCENE, focus: { box: c.view } }, { animate });
      buildList();
      snote.textContent = `${c.name}, ${P[c.prov].name}. Posiciones aproximadas (GeoNames y OpenStreetMap): sirven para orientarse, no para despachar.`;
      history.replaceState(null, '', '#/sectores/' + c.id);
    }
    sel.addEventListener('change', () => pick(sel.value));
    q.addEventListener('input', buildList);
    map.on('marker', (id) => { const name = id.split('|').slice(1).join('|'); focus(name); if (buttons[name]) buttons[name].scrollIntoView({ block: 'nearest' }); });
    pick(param, false);
    return { destroy: () => map.destroy() };
  };
})();
