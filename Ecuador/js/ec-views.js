/* Vistas: portada, atlas y lecciones. */
(function () {
  const EC = (window.EC = window.EC || {});
  const U = EC.util, el = U.el, G = window.EC_GEO;
  const V = (EC.views = {});
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const T = (s) => U.tidy(s);

  const REGION_ORDER = ['costa', 'sierra', 'amazonia', 'insular'];
  const legendHTML = () => '<div class="map-legend" aria-hidden="true">' + REGION_ORDER.map((r) => `<span><i style="--c:${EC.REGIONS[r].color}"></i>${EC.REGIONS[r].name}</span>`).join('') + '</div>';

  /* ═════════════ Portada ═════════════ */
  V.home = function (root, app) {
    const lessons = EC.LESSONS;
    const totalMin = lessons.reduce((a, l) => a + l.minutes, 0);
    const S = EC.STATS;
    root.innerHTML = `
      <section class="hero">
        <div class="wrap hero-grid">
          <div class="hero-copy">
            <div>
              <p class="eyebrow rise">Módulo de capacitación · ${lessons.length} lecciones · ≈ ${totalMin} min</p>
              <h1 class="page-title rise d1" tabindex="-1">Geografía<em>del Ecuador</em></h1>
              <p class="lede rise d2">Del Pacífico a la selva, pasando por la cordillera. Un mapa interactivo para ubicar provincias, cantones y ciudades, con sus cabeceras y puntos de referencia, y lecciones para interpretar una dirección dictada.</p>
              <div class="hero-actions rise d3">
                <a class="btn arrow" href="#/atlas">Abrir el atlas</a>
                <a class="btn ghost" href="#/ciudades">Ciudades y referencias</a>
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
      <div class="eq-divider" role="presentation"><span>0° 0′ 0″ · línea equinoccial</span></div>

      <section class="section" id="ficha">
        <div class="wrap">
          <div class="section-head">
            <h2>El país en una página</h2>
            <p>Nueve datos que conviene tener presentes antes de entrar en detalle. Se amplían a lo largo de las lecciones.</p>
          </div>
          <dl class="fact-list">
            ${[
              ['Superficie', '≈ 256 000 km²', 'Incluye Galápagos (8 010 km²)'],
              ['Población', U.num(S.total.pop / 1e6, 2) + ' millones', 'Censo 2022, INEC'],
              ['Latitud', '1° 27′ N a 5° 01′ S', 'La línea equinoccial cruza cinco provincias'],
              ['Longitud', '75° 11′ a 81° 01′ O', 'Galápagos: entre 89° y 92° O'],
              ['Punto más alto', 'Chimborazo, 6 263 m', 'El más lejano al centro de la Tierra'],
              ['Capital', 'Quito, 2 850 m', 'Segunda ciudad más poblada tras Guayaquil'],
              ['División', '24 provincias', `${S.total.cantones} cantones, cada uno con su cabecera`],
              ['Regiones', 'Cuatro', 'Costa, Sierra, Amazonía e Insular'],
              ['Hora', 'UTC−5', 'En Galápagos, UTC−6'],
            ].map(([k, v, s]) => `<div class="fact"><dt>${k}</dt><dd>${T(v)}<small>${T(s)}</small></dd></div>`).join('')}
          </dl>
        </div>
      </section>

      <section class="section" id="ruta">
        <div class="wrap">
          <div class="section-head">
            <h2>Ruta de aprendizaje</h2>
            <p>Lecciones breves que combinan texto y mapa: mientras lees, el mapa se acerca y resalta las provincias de cada paso. Sirven también como consulta.</p>
          </div>
          <ol class="route">
            ${lessons.map((l) => `<li><span class="num">${String(l.n).padStart(2, '0')}</span>
                <div><h3><a href="#/leccion/${l.id}">${l.title}</a></h3><p>${l.blurb}</p></div>
                <div class="meta"><span>${l.minutes} min</span></div></li>`).join('')}
          </ol>
          <div class="extras">
            <div class="extra"><h3>Atlas</h3><p>Las 24 provincias con su ficha y, al acercar el mapa, los cantones con sus cabeceras. Capas de relieve, regiones, nombres y capitales.</p><a class="btn ghost sm arrow" href="#/atlas">Abrir el atlas</a></div>
            <div class="extra"><h3>Cantones y cabeceras</h3><p>Tabla de los 223 cantones con búsqueda: cabecera, altitud y población. Marca los casos en que la cabecera no se llama igual que el cantón y los nombres que se repiten.</p><a class="btn ghost sm arrow" href="#/cantones">Ver cantones</a></div>
            <div class="extra"><h3>Ciudades y referencias</h3><p>Las ciudades principales con sus sectores y puntos de referencia (terminales, aeropuertos, hospitales, estadios, centros comerciales) y una guía para orientarse.</p><a class="btn ghost sm arrow" href="#/ciudades">Ver ciudades</a></div>
          </div>
        </div>
      </section>

      <section class="credits">
        <div class="wrap cols">
          <div><h4>Datos geográficos</h4><p>Límites de provincias y cantones: geoBoundaries (CC0), de precisión referencial; no sustituyen la cartografía oficial del IGM. Cabeceras: GeoNames (CC BY 4.0). Sectores y referencias de ciudades: © colaboradores de OpenStreetMap (ODbL).</p></div>
          <div><h4>Relieve</h4><p>Sombreado calculado a partir del modelo digital de elevación de teselas Terrarium (SRTM y GEBCO, vía AWS Open Data).</p></div>
          <div><h4>Cifras</h4><p>Superficie, población (Censo 2022) y cantones por provincia, a partir de INEC. Alturas de cumbres y capitales, redondeadas y referenciales. Últimas revisiones: noviembre de 2026.</p></div>
        </div>
      </section>`;

    const map = new EC.AtlasMap(root.querySelector('#heroMap'), { wheel: 'ctrl', touchPan: false, controls: false, label: 'Mapa de las regiones del Ecuador' });
    map.setScene({ focus: 'all', tint: 0.62, labels: 'provinces', places: 'capitals' }, { animate: false });
    map.view.insertAdjacentHTML('beforeend', '');
    const cap = root.querySelector('#heroCaption');
    map.on('hover', (id) => { cap.textContent = id ? `${EC.PROVS[id].name} · ${EC.REGIONS[EC.PROVS[id].region].name}` : 'Pasa el cursor por el mapa'; });
    map.on('select', (id) => { if (id) location.hash = '#/atlas/' + id; });
    return { destroy: () => map.destroy() };
  };

  /* ═════════════ Atlas ═════════════ */
  V.atlas = function (root, app, param) {
    const P = EC.PROVS;
    root.innerHTML = `
      <h1 class="sr-only page-title" tabindex="-1">Atlas de las provincias del Ecuador</h1>
      <div class="atlas" id="atlas">
        <aside class="atlas-side" aria-label="Provincias y capas">
          <div class="side-block"><h2>Buscar</h2><input class="search" type="search" id="q" placeholder="Provincia, cantón o ciudad…" aria-label="Buscar provincia, cantón o cabecera" autocomplete="off"></div>
          <div class="side-block"><h2>Capas</h2><div class="layers" id="layers"></div></div>
          <div class="side-block" style="border-bottom:none"><h2>Provincias <span id="count" class="mono" style="color:var(--muted)"></span></h2><ul class="plist" id="plist"></ul></div>
        </aside>
        <div class="atlas-stage" id="stage">
          <div class="stage-map"><div id="map" style="height:100%"></div></div>
        </div>
        <aside class="detail" id="detail" aria-label="Ficha de la provincia" aria-live="polite"></aside>
      </div>`;
    const A = root.querySelector('#atlas'), detail = root.querySelector('#detail');
    const map = new EC.AtlasMap(root.querySelector('#map'));
    map.setScene({ focus: 'all', tint: 0.5, labels: 'provinces', places: 'capitals', equator: true, cantones: true }, { animate: false });
    map.view.insertAdjacentHTML('beforeend', legendHTML());
    const hint = el('div', { class: 'map-hint' }, 'Acerca el mapa para ver los cantones');
    map.view.append(hint);
    map.on('view', () => hint.classList.toggle('is-off', map.ppu >= 0.3 || !map.layer('cantones')));
    let cantons = null;
    U.loadScript('js/cantones-data.js').then(() => { cantons = window.EC_CANTONES; map.setCantons(cantons); buildList(norm(q.value.trim())); if (pendingCanton) { map.selectCanton(pendingCanton, { fly: true }); pendingCanton = null; } }).catch(() => hint.remove());
    let pendingCanton = null;

    // Capas
    const LAYERS = [
      ['relief', 'Relieve sombreado', true], ['regions', 'Colores por región', true], ['labels', 'Nombres de provincias', true],
      ['places', 'Capitales provinciales', true], ['cantones', 'Cantones y cabeceras', true], ['equator', 'Línea equinoccial', true], ['graticule', 'Cuadrícula', true],
    ];
    const lay = root.querySelector('#layers');
    for (const [k, label, on] of LAYERS) {
      const id = 'ly-' + k;
      const row = el('label', { class: 'layer-row', for: id }, [el('input', { type: 'checkbox', id, checked: on }), label]);
      row.querySelector('input').addEventListener('change', (e) => {
        const v = e.target.checked;
        map.setLayer(k, k === 'labels' ? (v ? 'provinces' : false) : k === 'places' ? (v ? 'capitals' : false) : v);
      });
      lay.append(row);
    }

    // Lista de provincias
    const plist = root.querySelector('#plist'), q = root.querySelector('#q'), count = root.querySelector('#count');
    const buttons = {};
    function buildList(filter = '') {
      plist.innerHTML = ''; let n = 0;
      for (const r of REGION_ORDER) {
        const ids = EC.PROV_IDS.filter((id) => P[id].region === r && (!filter || norm(P[id].name + ' ' + P[id].capital).includes(filter)));
        if (!ids.length) continue;
        plist.append(el('li', { class: 'grp', style: `--c:${EC.REGIONS[r].color}` }, EC.REGIONS[r].name));
        for (const id of ids) {
          n++;
          const b = el('button', { type: 'button', 'data-id': id, 'aria-current': map.selected === id ? 'true' : 'false' }, [P[id].name, el('small', null, P[id].capital.replace(/ \(.*\)/, ''))]);
          b.addEventListener('click', () => map.select(id, { fly: true }));
          b.addEventListener('pointerenter', () => map.setHover(id));
          b.addEventListener('pointerleave', () => map.setHover(null));
          buttons[id] = b;
          plist.append(el('li', null, b));
        }
      }
      if (filter && filter.length >= 2 && cantons) {
        const hits = cantons.filter((c) => norm(c.name + ' ' + c.seat).includes(filter)).slice(0, 18);
        if (hits.length) {
          plist.append(el('li', { class: 'grp grp-c' }, 'Cantones y cabeceras'));
          for (const c of hits) {
            const b = el('button', { type: 'button', 'data-cid': c.id }, [c.name, el('small', null, P[c.prov].name)]);
            b.addEventListener('click', () => map.selectCanton(c.id, { fly: true }));
            plist.append(el('li', null, b));
          }
        }
      }
      count.textContent = `(${n})`;
    }
    buildList();
    q.addEventListener('input', () => buildList(norm(q.value.trim())));

    // Ficha de provincia
    const neighborName = (id) => P[id].name;
    function showDetail(id) {
      A.classList.toggle('has-detail', !!id);
      if (!id) { detail.innerHTML = ''; return; }
      const p = P[id], reg = EC.REGIONS[p.region];
      const maxPop = Math.max(...Object.values(P).map((x) => x.pop));
      const adj = (G.adjacency[id] || []).sort((a, b) => P[a].name.localeCompare(P[b].name, 'es'));
      const ext = [];
      (G.borders[id] || []).forEach((b) => ext.push(b === 'colombia' ? 'Colombia' : 'Perú'));
      if (EC.SETS.coast.includes(id) || id === 'galapagos') ext.push('Océano Pacífico');
      detail.innerHTML = `
        <button class="close" type="button" aria-label="Cerrar ficha">×</button>
        <span class="chip region-chip"><i class="dot" style="--c:${reg.color}"></i>${reg.name} · ${reg.alt}</span>
        <h2 tabindex="-1">${p.name}</h2>
        <dl class="grid">
          <div><dt>Capital</dt><dd>${p.capital.replace(/ \(.*\)/, '')}<br><small>${U.num(p.capitalAlt)} m s. n. m.</small></dd></div>
          <div><dt>Superficie</dt><dd>${U.num(p.area)} <small>km²</small></dd></div>
          <div><dt>Población</dt><dd>${U.num(p.pop)}<br><small>Censo 2022</small></dd></div>
          <div><dt>Densidad</dt><dd>${U.num(p.dens, 1)} <small>hab/km²</small></dd></div>
          <div><dt>Cantones</dt><dd>${p.cantones}<br><small>divisiones de la provincia</small></dd></div>
          <div><dt>% del país</dt><dd>${U.num((p.pop / EC.STATS.total.pop) * 100, 1)} <small>% de la población</small></dd></div>
        </dl>
        <div class="poprow"><span>Población relativa a Guayas</span><span class="track"><i style="width:${(p.pop / maxPop) * 100}%"></i></span></div>
        <p style="margin-top:1.1rem">${T(p.resumen)}</p>
        <h3>Para recordar</h3>
        <ul class="claves">${p.claves.map((c) => `<li>${T(c)}</li>`).join('')}</ul>
        <h3>Limita con</h3>
        <div class="neigh">${adj.map((a) => `<button class="chip" type="button" data-go="${a}">${neighborName(a)}</button>`).join('')}${ext.map((e) => `<span class="chip ext">${e}</span>`).join('')}</div>`;
      detail.querySelector('.close').onclick = () => map.select(null);
      detail.querySelectorAll('[data-go]').forEach((b) => (b.onclick = () => map.select(b.dataset.go, { fly: true })));
      detail.scrollTop = 0;
    }

    function showCanton(id) {
      const c = cantons && cantons.find((x) => x.id === id);
      A.classList.toggle('has-detail', !!c);
      if (!c) { detail.innerHTML = ''; return; }
      const p = P[c.prov], reg = EC.REGIONS[p.region];
      const siblings = cantons.filter((x) => x.prov === c.prov && x.id !== c.id).sort((a, b) => a.name.localeCompare(b.name, 'es'));
      const dens = c.pop && c.area ? c.pop / c.area : null;
      const notes = [];
      if (c.noPoly) notes.push('Cantón de creación reciente: su límite todavía no está dibujado en este mapa; aparece dentro del cantón de origen.');
      if (!c.geoSeat) notes.push('La ubicación de la cabecera es aproximada (centro del cantón). Verifíquela en el mapa de despacho.');
      detail.innerHTML = `
        <button class="close" type="button" aria-label="Cerrar ficha">×</button>
        <span class="chip region-chip"><i class="dot" style="--c:${reg.color}"></i>${reg.name} · ${p.name}</span>
        <p class="eyebrow" style="margin:1rem 0 0">Cantón</p>
        <h2 tabindex="-1" style="margin-top:.2rem">${c.name}</h2>
        <dl class="grid">
          <div><dt>Cabecera cantonal</dt><dd>${c.seat}${c.alt != null ? '<br><small>≈ ' + U.num(c.alt) + ' m s. n. m.</small>' : ''}</dd></div>
          <div><dt>Provincia</dt><dd><button class="term" type="button" data-prov="${p.id}" style="font-size:inherit">${p.name}</button></dd></div>
          <div><dt>Población del cantón</dt><dd>${c.pop ? U.num(c.pop) : '—'}<br><small>Censo 2022</small></dd></div>
          <div><dt>Población de la cabecera</dt><dd>${c.seatPop ? U.num(c.seatPop) : '—'}</dd></div>
          <div><dt>Superficie</dt><dd>${c.area ? U.num(c.area, c.area < 100 ? 1 : 0) : '—'} <small>km²</small></dd></div>
          <div><dt>Densidad</dt><dd>${dens ? U.num(dens, 1) : '—'} <small>hab/km²</small></dd></div>
        </dl>
        ${c.lat != null ? `<p class="coords">Cabecera: ${U.dms(c.lat, 'lat')} · ${U.dms(c.lon, 'lon')}${c.geoSeat ? '' : ' (aprox.)'}</p>` : ''}
        ${c.year ? `<p style="color:var(--muted);margin:.4rem 0 0">Cantonizado en ${c.year}.</p>` : ''}
        ${notes.map((n) => `<p class="note-warn">${n}</p>`).join('')}
        <h3>Otros cantones de ${p.name} (${siblings.length})</h3>
        <div class="neigh">${siblings.map((s) => `<button class="chip" type="button" data-c="${s.id}">${s.name}</button>`).join('')}</div>`;
      detail.querySelector('.close').onclick = () => { map.selectCanton(null); A.classList.remove('has-detail'); };
      detail.querySelectorAll('[data-c]').forEach((b) => (b.onclick = () => map.selectCanton(b.dataset.c, { fly: true })));
      detail.querySelector('[data-prov]').onclick = () => map.select(p.id, { fly: true });
      detail.scrollTop = 0;
    }
    map.on('selectCanton', (id) => { if (id) { showCanton(id); history.replaceState(null, '', '#/atlas'); } });

    map.on('select', (id) => {
      showDetail(id);
      Object.entries(buttons).forEach(([k, b]) => b.setAttribute('aria-current', k === id ? 'true' : 'false'));
      if (id && buttons[id]) buttons[id].scrollIntoView({ block: 'nearest' });
      if (id) history.replaceState(null, '', '#/atlas/' + id); else history.replaceState(null, '', '#/atlas');
    });
    map.on('hover', (id) => Object.entries(buttons).forEach(([k, b]) => b.classList.toggle('is-hover', k === id)));

    if (param && P[param]) setTimeout(() => map.select(param, { fly: true }), 60);
    else if (param) pendingCanton = param;
    return { destroy: () => map.destroy() };
  };

  /* ═════════════ Lecciones ═════════════ */
  V.lesson = function (root, app, id) {
    const L = EC.LESSONS.find((l) => l.id === id);
    if (!L) { root.innerHTML = '<div class="wrap" style="padding-block:4rem"><h1>Lección no encontrada</h1><p><a href="#/">Volver al inicio</a></p></div>'; return {}; }
    const idx = EC.LESSONS.indexOf(L), prev = EC.LESSONS[idx - 1], nextL = EC.LESSONS[idx + 1];
    root.innerHTML = `
      <header class="lesson-head"><div class="wrap">
        <div class="crumbs eyebrow"><a href="#/">Inicio</a><span>/</span><span>Lección ${L.n} de ${EC.LESSONS.length}</span><span>/</span><span>≈ ${L.minutes} min</span></div>
        <div class="row"><h1 class="page-title" tabindex="-1">${L.title}</h1><p>${L.blurb}</p></div>
      </div></header>
      <div class="wrap lesson-grid">
        <div class="steps" id="steps">
          ${L.steps.map((s, i) => `<section class="step" data-i="${i}" aria-labelledby="st${i}">
            <div class="kicker"><span class="sn">${L.n}.${i + 1}</span><span>${T(s.kicker)}</span></div>
            <h2 id="st${i}">${T(s.title)}</h2>
            <div class="body">${T(s.body)}</div>
            ${s.aside ? `<aside class="aside-note"><b>${s.aside[0]}</b>${T(s.aside[1])}</aside>` : ''}
          </section>`).join('')}
          <nav class="lesson-nav" aria-label="Navegación entre lecciones">
            ${prev ? `<a class="btn ghost sm" href="#/leccion/${prev.id}">← ${prev.title}</a>` : '<span></span>'}
            ${nextL ? `<a class="btn arrow" href="#/leccion/${nextL.id}">Lección ${nextL.n}</a>` : '<a class="btn arrow" href="#/ciudades">Ciudades y referencias</a>'}
          </nav>
        </div>
        <div class="stage" aria-label="Mapa de la lección">
          <div class="stage-map"><div id="map" style="height:100%"></div></div>
          <div class="stage-aux" id="aux"></div>
        </div>
      </div>`;

    const map = new EC.AtlasMap(root.querySelector('#map'), { wheel: 'ctrl', touchPan: false, label: `Mapa de la lección ${L.n}` });
    map.view.insertAdjacentHTML('beforeend', legendHTML());
    const legend = map.view.querySelector('.map-legend');
    U.loadScript('js/cantones-data.js').then(() => map.setCantons(window.EC_CANTONES)).catch(() => {});
    const aux = root.querySelector('#aux');
    let auxKind = null;

    function applyStep(i) {
      const s = L.steps[i].scene;
      const wantAux = s.aux ? 'chart' : null;
      map.clearOverrides();
      map.setScene(s, { animate: true });
      const sc = map.scene;
      legend.hidden = !(sc.regions !== false && (sc.tint == null || sc.tint >= 0.3) && sc.relief !== false);
      if (wantAux !== auxKind) {
        auxKind = wantAux;
        aux.classList.toggle('on', !!wantAux);
        aux.innerHTML = '';
        if (wantAux) EC.regionChart(aux);
        setTimeout(() => { map.measure(); map.resetView(); }, 480);
      }
    }

    // Paso activo según el scroll
    const steps = [...root.querySelectorAll('.step')];
    let current = -1;
    const activate = (i) => {
      if (i === current) return;
      current = i;
      steps.forEach((el_, k) => el_.classList.toggle('is-active', k === i));
      applyStep(i);
    };
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) activate(+e.target.dataset.i); });
    }, { rootMargin: '-38% 0px -52% 0px', threshold: 0 });
    steps.forEach((s) => io.observe(s));
    activate(0);

    // Términos interactivos
    root.querySelector('#steps').addEventListener('click', (e) => {
      const t = e.target.closest('.term'); if (!t) return;
      if (t.dataset.prov) { map.flyTo({ provinces: [t.dataset.prov] }, 800); map.flash(t.dataset.prov); }
      document.querySelector('.stage').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });

    return { destroy: () => { io.disconnect(); map.destroy(); } };
  };
})();
