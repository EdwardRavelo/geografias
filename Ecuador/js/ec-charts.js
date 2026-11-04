/* Gráfico auxiliar: comparación de superficie y población por regiones. */
(function () {
  const EC = (window.EC = window.EC || {});
  const U = EC.util;
  const svg = U.svg, el = U.el;
  const G = window.EC_GEO;

  /* Comparación superficie / población por regiones */
  EC.regionChart = function (root) {
    root.innerHTML = '';
    const S = EC.STATS;
    const regs = ['costa', 'sierra', 'amazonia', 'insular'];
    const row = (title, key) => {
      const bar = el('div', { class: 'rbar', role: 'img', 'aria-label': title + ': ' + regs.map((r) => EC.REGIONS[r].name + ' ' + S[r][key].toFixed(1).replace('.', ',') + ' %').join(', ') });
      for (const r of regs) {
        const v = S[r][key];
        const s = el('span', { style: `flex:${Math.max(v, 0.6)};--c:${EC.REGIONS[r].color}`, class: v < 6 ? 'mini' : '' }, v >= 4 ? v.toFixed(0) + ' %' : '');
        bar.append(s);
      }
      return el('div', { class: 'rbar-row' }, [el('h4', null, title), bar]);
    };
    const legend = el('div', { class: 'rlegend' }, regs.map((r) => el('span', { style: `display:flex;align-items:center;gap:.4rem` }, [el('i', { class: 'dot', style: `--c:${EC.REGIONS[r].color}` }), EC.REGIONS[r].name])));
    root.append(el('div', { class: 'aux-title' }, [el('span', null, 'Territorio frente a población')]), el('div', { class: 'rbars' }, [row('Superficie', 'areaPct'), row('Población (Censo 2022)', 'popPct'), legend]));
  };
})();
