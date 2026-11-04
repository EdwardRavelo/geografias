/* Preguntas, juegos de práctica y evaluación final. */
(function () {
  const EC = (window.EC = window.EC || {});
  const U = EC.util, el = U.el, G = window.EC_GEO;
  const P = EC.PROVS;
  const T = (s) => U.tidy(s);

  /* ───────── Pregunta de opción múltiple / verdadero-falso ───────── */
  const Quiz = (EC.Quiz = {});
  Quiz.question = function (q, i, total, onAnswer, { shuffle = false } = {}) {
    const wrap = el('div', { class: 'q' });
    wrap.append(el('span', { class: 'qn' }, `Pregunta ${i + 1} de ${total}`), el('div', { class: 'qtext' }, T(q.q)));
    let opts = q.t === 'tf' ? [{ t: 'Verdadero', ok: q.a === true }, { t: 'Falso', ok: q.a === false }] : q.o.map((t, k) => ({ t, ok: k === q.a }));
    if (shuffle && q.t === 'mcq') opts = U.shuffle(opts);
    const list = el('div', { class: 'opts', role: 'group', 'aria-label': 'Opciones de respuesta' });
    const btns = opts.map((o, k) => {
      const b = el('button', { type: 'button', class: 'opt' }, [el('span', { class: 'k' }, String.fromCharCode(65 + k)), el('span', null, T(o.t))]);
      b.addEventListener('click', () => {
        btns.forEach((x, j) => { x.disabled = true; if (opts[j].ok) x.classList.add('right'); });
        if (!o.ok) b.classList.add('wrong');
        wrap.append(el('div', { class: 'why', role: 'status' }, [el('b', null, o.ok ? 'Correcto' : 'Respuesta correcta: ' + opts.find((z) => z.ok).t), T(q.why)]));
        onAnswer(o.ok, o.t, opts.find((z) => z.ok).t);
      });
      list.append(b);
      return b;
    });
    wrap.append(list);
    return wrap;
  };

  /* ───────── Utilidades de juego ───────── */
  const GAMES = [
    { id: 'provincias', n: 1, title: 'Ubica la provincia', rounds: 24, desc: 'Te decimos un nombre y haces clic en el mapa. Sin etiquetas ni colores: solo el relieve y los límites. Puedes limitar la ronda a una región.' },
    { id: 'capitales', n: 2, title: 'Capitales provinciales', rounds: 12, desc: 'Se ilumina una provincia en el mapa y eliges su capital entre cuatro opciones.' },
    { id: 'regiones', n: 3, title: '¿De qué región es?', rounds: 12, desc: 'Se ilumina una provincia. ¿Costa, Sierra, Amazonía o Insular? Incluye los casos engañosos.' },
  ];
  EC.GAMES = GAMES;
  const REG_ORDER = ['costa', 'sierra', 'amazonia', 'insular'];

  function shell(root, title) {
    root.innerHTML = `<h1 class="sr-only page-title" tabindex="-1">${title}</h1>
      <div class="game"><div class="game-map"><div id="map" style="height:100%"></div></div><aside class="game-panel" id="panel" aria-live="polite"></aside></div>`;
    return { panel: root.querySelector('#panel'), mapEl: root.querySelector('#map') };
  }
  function saveScore(app, id, pct) {
    const p = (app.state.practice[id] = app.state.practice[id] || { best: 0, plays: 0 });
    p.best = Math.max(p.best, pct); p.last = pct; p.plays++;
    app.save();
  }
  function resultView(panel, { title, score, total, misses, app, id, again, extra }) {
    const pct = Math.round((score / total) * 100);
    saveScore(app, id, pct);
    const msg = pct === 100 ? 'Ronda perfecta.' : pct >= 80 ? 'Muy buen dominio.' : pct >= 50 ? 'Vas bien; repasa los fallos.' : 'Conviene repasar las lecciones primero.';
    panel.innerHTML = `<div class="top"><span>${title}</span><span>Resultado</span></div>
      <div class="result"><div class="big">${score}<em>/${total}</em></div><p style="font-size:1.15rem;margin:.5rem 0 0">${msg}${extra ? ' ' + extra : ''}</p></div>
      ${misses.length ? `<div><h3 class="eyebrow" style="margin-bottom:.5rem">Para repasar</h3><div class="neigh">${misses.map((m) => `<a class="chip" href="#/atlas/${m.id || ''}">${m.label}</a>`).join('')}</div></div>` : ''}
      <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:auto"><button class="btn" id="again" type="button">Otra ronda</button><a class="btn ghost" href="#/practica">Más juegos</a></div>`;
    panel.querySelector('#again').onclick = again;
    panel.querySelector('#again').focus();
  }
  const header = (title, i, total) => `<div class="top"><span>${title}</span><span>${i} / ${total}</span></div><div class="bar"><i style="width:${(i / total) * 100}%"></i></div>`;

  /* ───────── Juego 1: ubica la provincia ───────── */
  function gProvincias(root, app) {
    const { panel, mapEl } = shell(root, 'Juego: ubica la provincia');
    const map = new EC.AtlasMap(mapEl, { tooltip: false, label: 'Mapa del juego: haz clic en la provincia pedida' });
    map.setScene({ focus: 'all', regions: false, tint: 0, labels: false, places: false, graticule: true }, { animate: false });
    let regs = new Set(REG_ORDER), order = [], i = 0, score = 0, misses = [], target = null, locked = true;

    function start() {
      map.clearMarks(); map.select(null, { announce: false });
      order = U.shuffle(EC.PROV_IDS.filter((id) => regs.has(P[id].region)));
      i = 0; score = 0; misses = []; ask();
    }
    function menu() {
      panel.innerHTML = `<div class="top"><span>Ubica la provincia</span><span>${GAMES[0].rounds} preguntas</span></div>
        <div class="prompt"><small>Antes de empezar</small>Elige qué regiones quieres practicar</div>
        <div class="filters" role="group" aria-label="Regiones">${REG_ORDER.map((r) => `<button class="chip" type="button" data-r="${r}" aria-pressed="${regs.has(r)}"><i class="dot" style="--c:${EC.REGIONS[r].color}"></i>${EC.REGIONS[r].name}</button>`).join('')}</div>
        <p style="color:var(--ink-2)">Haz clic en la provincia que te pidan. Cuenta solo el primer intento. Con el teclado: Tab para recorrer las provincias y Enter para elegir.</p>
        <button class="btn arrow" id="go" type="button" style="align-self:flex-start">Empezar</button>`;
      panel.querySelectorAll('[data-r]').forEach((b) => b.addEventListener('click', () => {
        const r = b.dataset.r; if (regs.has(r) && regs.size === 1) return;
        regs.has(r) ? regs.delete(r) : regs.add(r); b.setAttribute('aria-pressed', regs.has(r));
      }));
      panel.querySelector('#go').onclick = start;
    }
    function ask() {
      if (i >= order.length) return resultView(panel, { title: 'Ubica la provincia', score, total: order.length, misses, app, id: 'provincias', again: menu });
      map.clearMarks(); map.flyTo('all', 600);
      target = order[i]; locked = false;
      panel.innerHTML = `${header('Ubica la provincia', i, order.length)}
        <div class="prompt"><small>Haz clic en el mapa</small>${P[target].name}</div>
        <div class="feedback" id="fb"><button class="btn ghost sm" id="hint" type="button">Pista</button></div>
        <div style="margin-top:auto"><span class="eyebrow">Aciertos: ${score}</span></div>`;
      panel.querySelector('#hint').onclick = (e) => { e.target.parentElement.innerHTML = `<span class="mono" style="color:var(--muted)">Región</span><br><b>${EC.REGIONS[P[target].region].name}</b>, capital <b>${P[target].capital.replace(/ \(.*\)/, '')}</b>`; };
    }
    map.on('select', (id) => {
      if (!id || locked || !target) return;
      locked = true; map.select(null, { announce: false });
      const fb = panel.querySelector('#fb');
      if (id === target) { score++; map.mark(id, 'ok'); fb.innerHTML = `<span class="ok">Correcto.</span> ${P[id].name} está en la ${EC.REGIONS[P[id].region].name}; su capital es ${P[id].capital}.`; }
      else { misses.push({ id: target, label: P[target].name }); map.mark(id, 'bad'); map.mark(target, 'target'); fb.innerHTML = `<span class="bad">Esa es ${P[id].name}.</span> ${P[target].name} es la provincia marcada con borde rojo.`; }
      i++;
      fb.insertAdjacentHTML('beforeend', `<div style="margin-top:.8rem"><button class="btn sm" id="next" type="button">${i >= order.length ? 'Ver resultado' : 'Siguiente'}</button></div>`);
      const nb = fb.querySelector('#next'); nb.onclick = ask; nb.focus();
    });
    menu();
    return { destroy: () => map.destroy() };
  }

  /* ───────── Juegos 2 y 3: opción múltiple con provincia resaltada ───────── */
  function gChoice(kind) {
    return function (root, app) {
      const cfg = GAMES.find((g) => g.id === kind);
      const { panel, mapEl } = shell(root, 'Juego: ' + cfg.title);
      const map = new EC.AtlasMap(mapEl, { tooltip: false, label: 'Mapa del juego con la provincia resaltada' });
      let order = [], i = 0, score = 0, misses = [];
      map.setScene({ focus: 'all', tint: 0.55, labels: false, places: false }, { animate: false });
      const hardRegions = ['santo-domingo', 'los-rios', 'loja', 'bolivar', 'zamora-chinchipe', 'galapagos', 'esmeraldas', 'napo'];
      function start() { order = U.pick(EC.PROV_IDS, cfg.rounds); i = 0; score = 0; misses = []; ask(); }
      function menu() {
        panel.innerHTML = `<div class="top"><span>${cfg.title}</span><span>${cfg.rounds} preguntas</span></div>
          <div class="prompt"><small>Listo para empezar</small>${kind === 'capitales' ? 'Capitales de las provincias' : 'Región de cada provincia'}</div>
          <p style="color:var(--ink-2)">${cfg.desc}</p><button class="btn arrow" id="go" type="button" style="align-self:flex-start">Empezar</button>`;
        panel.querySelector('#go').onclick = start;
        map.setScene({ focus: 'all', tint: 0.55, labels: false, places: false, hl: null }, { animate: true });
      }
      function ask() {
        if (i >= order.length) return resultView(panel, { title: cfg.title, score, total: order.length, misses, app, id: kind, again: menu });
        const id = order[i], p = P[id];
        map.setScene({ focus: id === 'galapagos' ? 'gal' : { provinces: [id] }, hl: [id], tint: 0.62, labels: false, places: false }, { animate: true });
        let options;
        if (kind === 'capitales') {
          const same = EC.PROV_IDS.filter((x) => x !== id && P[x].region === p.region), other = EC.PROV_IDS.filter((x) => x !== id && P[x].region !== p.region);
          const d = [...U.pick(same, 2), ...U.pick(other, 3)].slice(0, 3);
          options = U.shuffle([id, ...d]).map((x) => ({ t: P[x].capital.replace(/ \(.*\)/, ''), ok: x === id }));
        } else options = REG_ORDER.map((r) => ({ t: EC.REGIONS[r].name, ok: r === p.region, r }));
        panel.innerHTML = `${header(cfg.title, i, order.length)}
          <div class="prompt"><small>${kind === 'capitales' ? 'Provincia resaltada en el mapa' : '¿A qué región pertenece?'}</small>${kind === 'capitales' ? '¿Capital de ' + p.name + '?' : p.name}</div>
          <div class="opts" role="group" aria-label="Opciones"></div><div class="feedback" id="fb"></div>`;
        const list = panel.querySelector('.opts');
        const btns = options.map((o, k) => {
          const b = el('button', { type: 'button', class: 'opt' }, [el('span', { class: 'k' }, String.fromCharCode(65 + k)), el('span', null, o.t)]);
          b.onclick = () => {
            btns.forEach((x, j) => { x.disabled = true; if (options[j].ok) x.classList.add('right'); });
            if (o.ok) score++; else { b.classList.add('wrong'); misses.push({ id, label: p.name }); }
            const note = kind === 'capitales' ? `${p.capital} está a ${U.num(p.capitalAlt)} m s. n. m.` : `${p.name} pertenece a la región ${EC.REGIONS[p.region].name.toLowerCase()}${id === 'santo-domingo' ? ' (está en el piedemonte andino, pero se clasifica como Costa)' : ''}.`;
            panel.querySelector('#fb').innerHTML = `<span class="${o.ok ? 'ok' : 'bad'}">${o.ok ? 'Correcto.' : 'No exactamente.'}</span> ${T(note)}<div style="margin-top:.8rem"><button class="btn sm" id="next" type="button">${i + 1 >= order.length ? 'Ver resultado' : 'Siguiente'}</button></div>`;
            i++; const nb = panel.querySelector('#next'); nb.onclick = ask; nb.focus();
          };
          list.append(b); return b;
        });
      }
      menu();
      return { destroy: () => map.destroy() };
    };
  }

  const GAME_FN = { provincias: gProvincias, capitales: gChoice('capitales'), regiones: gChoice('regiones') };

  /* ───────── Índice de práctica ───────── */
  EC.views.practice = function (root, app, gid) {
    if (gid && GAME_FN[gid]) return GAME_FN[gid](root, app);
    const st = app.state;
    root.innerHTML = `<header class="practice-head"><div class="wrap"><p class="eyebrow">Práctica</p><h1 class="page-title" tabindex="-1">Tres juegos<br><em style="color:var(--pencil)">para fijar el mapa</em></h1><p>Rondas cortas, sin límite de tiempo. Se guarda tu mejor resultado en este navegador.</p></div></header>
      <div class="wrap"><ol class="games">${GAMES.map((g) => {
        const b = st.practice[g.id];
        return `<li class="game-card"><span class="gn">${String(g.n).padStart(2, '0')}</span><div><h2><a href="#/practica/${g.id}">${g.title}</a></h2><p>${g.desc}</p></div><span class="best">${b ? 'Mejor: ' + b.best + ' %<br>' + b.plays + (b.plays === 1 ? ' ronda' : ' rondas') : 'Sin jugar'}</span></li>`;
      }).join('')}</ol>
      <div style="padding-block:2.5rem 4rem;display:flex;gap:1rem;align-items:center;flex-wrap:wrap"><a class="btn arrow" href="#/evaluacion">Evaluación final</a><span style="color:var(--muted)">20 preguntas con mapa. Se aprueba con 80 %.${st.exam.best != null ? ' Tu mejor: ' + st.exam.best + ' %.' : ''}</span></div></div>`;
    return {};
  };

  /* ───────── Evaluación final ───────── */
  const TAGS = { posicion: 'Posición', regiones: 'Regiones', relieve: 'Relieve', agua: 'Agua', clima: 'Clima', naturaleza: 'Naturaleza' };
  function buildExam() {
    const lessonQs = EC.LESSONS.flatMap((l) => l.check.map((q) => Object.assign({ tag: l.id }, q)));
    const text = [...lessonQs, ...EC.BANK.filter((q) => q.t !== 'map')];
    // 14 preguntas de texto: se reparten por tema (round-robin) para cubrir todo el módulo
    const byTag = {}; U.shuffle(text).forEach((q) => (byTag[q.tag] = byTag[q.tag] || []).push(q));
    const picked = []; const tags = Object.keys(byTag);
    for (let r = 0; picked.length < 14; r++) { let any = false; for (const t of tags) if (byTag[t][r] && picked.length < 14) { picked.push(byTag[t][r]); any = true; } if (!any) break; }
    // 6 de mapa: provincias al azar de distintas regiones
    const pool = U.shuffle(EC.PROV_IDS), chosen = [], seen = {};
    for (const id of pool) { const r = P[id].region; if (chosen.length < 6 && (seen[r] || 0) < 2) { chosen.push(id); seen[r] = (seen[r] || 0) + 1; } }
    const maps = chosen.map((id) => ({ t: 'map', tag: 'regiones', q: `Haz clic en la provincia de ${P[id].name}.`, a: id, why: `${P[id].name}: región ${EC.REGIONS[P[id].region].name}, capital ${P[id].capital}.` }));
    return U.shuffle([...picked, ...maps]);
  }

  EC.views.exam = function (root, app) {
    let qs = [], i = 0, right = 0, byTag = {}, wrong = [], map = null;
    const st = app.state;
    function intro() {
      root.innerHTML = `<div class="wrap exam-wrap"><p class="eyebrow">Evaluación final</p><h1 class="page-title" tabindex="-1" style="font-size:clamp(3rem,6vw,5.4rem);margin:1rem 0 1.5rem">Veinte preguntas,<br><em style="color:var(--pencil)">seis de mapa</em></h1>
        <p style="font-size:1.2rem;color:var(--ink-2)">Cubre las seis lecciones: posición, regiones, relieve, agua, clima y naturaleza. Se aprueba con 16 aciertos (80 %). Puedes repetirla las veces que quieras; cada intento trae preguntas distintas.</p>
        ${st.exam.best != null ? `<p class="eyebrow">Mejor resultado: ${st.exam.best} % · intentos: ${st.exam.tries || 1}</p>` : ''}
        <button class="btn arrow" id="go" type="button" style="margin-top:1rem">Comenzar</button></div>`;
      root.querySelector('#go').onclick = start;
    }
    function start() { qs = buildExam(); i = 0; right = 0; byTag = {}; wrong = []; ask(); }
    function ask() {
      if (map) { map.destroy(); map = null; }
      if (i >= qs.length) return finish();
      const q = qs[i];
      root.innerHTML = `<div class="wrap exam-wrap"><div class="exam-progress"><span>Pregunta ${i + 1} de ${qs.length}</span><span>${right} aciertos</span></div><div class="game-panel" style="padding:0;border:none;gap:.6rem"><div class="bar" style="height:3px;background:var(--rule-soft)"><i style="display:block;height:100%;width:${(i / qs.length) * 100}%;background:var(--pencil)"></i></div></div><div id="slot" style="margin-top:1rem"></div></div>`;
      const slot = root.querySelector('#slot');
      const done = (ok, extra) => {
        right += ok ? 1 : 0;
        const t = (byTag[q.tag] = byTag[q.tag] || { ok: 0, n: 0 }); t.n++; t.ok += ok ? 1 : 0;
        if (!ok) wrong.push({ q: q.q, a: extra, why: q.why });
        i++;
        slot.append(el('div', { style: 'margin-top:1.2rem' }, [el('button', { class: 'btn arrow', id: 'next', type: 'button', onclick: ask }, i >= qs.length ? 'Ver resultado' : 'Siguiente')]));
        slot.querySelector('#next').focus();
      };
      if (q.t === 'map') {
        slot.append(el('div', { class: 'q', style: 'padding-top:0' }, [el('span', { class: 'qn' }, 'Pregunta de mapa'), el('div', { class: 'qtext' }, q.q)]));
        const host = el('div', { class: 'exam-q-map' }); slot.append(host);
        const fb = el('div', { class: 'feedback', style: 'margin-top:.8rem' }); slot.append(fb);
        map = new EC.AtlasMap(host, { tooltip: false, label: 'Mapa de la pregunta: elige la provincia' });
        map.setScene({ focus: 'all', regions: false, tint: 0, labels: false, places: false }, { animate: false });
        let locked = false;
        map.on('select', (id) => {
          if (!id || locked) return; locked = true; map.select(null, { announce: false });
          const ok = id === q.a;
          if (ok) map.mark(id, 'ok'); else { map.mark(id, 'bad'); map.mark(q.a, 'target'); }
          fb.innerHTML = `<span class="${ok ? 'ok' : 'bad'}">${ok ? 'Correcto.' : 'Elegiste ' + P[id].name + '.'}</span> ${T(q.why)}`;
          done(ok, 'Era ' + P[q.a].name);
        });
      } else {
        slot.append(EC.Quiz.question(q, i, qs.length, (ok, chosen, correct) => done(ok, correct), { shuffle: true }));
      }
      const h = root.querySelector('.qtext'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }
    function finish() {
      const pct = Math.round((right / qs.length) * 100);
      st.exam.best = Math.max(st.exam.best || 0, pct); st.exam.last = pct; st.exam.tries = (st.exam.tries || 0) + 1; app.save(); app.updateProgress();
      const pass = pct >= 80;
      root.innerHTML = `<div class="wrap exam-wrap result"><p class="eyebrow">${pass ? 'Aprobado' : 'Sin aprobar todavía'}</p>
        <div class="big" style="margin-top:.6rem">${right}<em>/${qs.length}</em></div>
        <p style="font-size:1.2rem;color:var(--ink-2)">${pass ? 'Dominas lo esencial de la geografía del Ecuador.' : 'Faltaron ' + (16 - right) + ' aciertos para aprobar. Revisa los temas más débiles y vuelve a intentarlo.'}</p>
        <h2 class="eyebrow" style="margin-top:2rem">Por tema</h2>
        <ul class="breakdown">${Object.entries(byTag).map(([t, v]) => `<li><span>${TAGS[t] || t}</span><span class="track"><i style="width:${(v.ok / v.n) * 100}%"></i></span><span>${v.ok}/${v.n}</span></li>`).join('')}</ul>
        ${wrong.length ? `<h2 class="eyebrow">Para repasar</h2><ul class="review">${wrong.map((w) => `<li><b>${T(w.q)}</b><span>${T(w.a)}. ${T(w.why)}</span></li>`).join('')}</ul>` : ''}
        <div style="display:flex;gap:.7rem;flex-wrap:wrap;margin-top:2rem"><button class="btn" id="again" type="button">Repetir con otras preguntas</button><a class="btn ghost" href="#/leccion/posicion">Repasar lecciones</a><a class="btn ghost" href="#/practica">Practicar</a></div></div>`;
      root.querySelector('#again').onclick = start;
      root.querySelector('.big').scrollIntoView({ block: 'center' });
    }
    intro();
    return { destroy: () => map && map.destroy() };
  };
})();
