// Convierte los límites de OpenStreetMap (tools/cache/bar-<ciudad>.json, relaciones con geometría) en polígonos proyectados.
// Devuelve { quito: [{ id, name, level, d, rings, cx, cy }], ... }
const fs = require('fs');
const path = require('path');

const key = (p) => p.lat.toFixed(6) + ',' + p.lon.toFixed(6);
function rings(ways) {
  const rest = ways.map((w) => w.slice());
  const out = [];
  while (rest.length) {
    let cur = rest.shift();
    let guard = 0;
    while (key(cur[0]) !== key(cur[cur.length - 1]) && guard++ < 5000) {
      const end = key(cur[cur.length - 1]);
      let i = rest.findIndex((w) => key(w[0]) === end);
      if (i >= 0) { cur = cur.concat(rest.splice(i, 1)[0].slice(1)); continue; }
      i = rest.findIndex((w) => key(w[w.length - 1]) === end);
      if (i >= 0) { cur = cur.concat(rest.splice(i, 1)[0].reverse().slice(1)); continue; }
      break;
    }
    if (cur.length > 3 && key(cur[0]) === key(cur[cur.length - 1])) out.push(cur);
  }
  return out;
}
// Douglas-Peucker sobre puntos [x, y]
function simplify(pts, tol) {
  if (pts.length < 4) return pts;
  const sq = (a, b, p) => {
    let x = a[0], y = a[1], dx = b[0] - x, dy = b[1] - y;
    if (dx || dy) { const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy); if (t > 1) { x = b[0]; y = b[1]; } else if (t > 0) { x += dx * t; y += dy * t; } }
    return (p[0] - x) ** 2 + (p[1] - y) ** 2;
  };
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [f, l] = stack.pop(); let max = 0, idx = -1;
    for (let i = f + 1; i < l; i++) { const d = sq(pts[f], pts[l], pts[i]); if (d > max) { max = d; idx = i; } }
    if (max > tol * tol) { keep[idx] = 1; stack.push([f, idx], [idx, l]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const area = (r) => { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return a / 2; };
function centroid(r) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const f = r[j][0] * r[i][1] - r[i][0] * r[j][1]; a += f; cx += (r[j][0] + r[i][0]) * f; cy += (r[j][1] + r[i][1]) * f; }
  a *= 3; return a ? [cx / a, cy / a] : r[0];
}
function pip(pt, rs) {
  let inside = false;
  for (const r of rs) for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i], [xj, yj] = r[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

module.exports = function (project, cacheDir, cityNames) {
  const res = {};
  for (const id of Object.keys(cityNames)) {
    const f = path.join(cacheDir, `bar-${id}.json`);
    if (!fs.existsSync(f)) continue;
    const list = [];
    for (const e of JSON.parse(fs.readFileSync(f, 'utf8'))) {
      const name = (e.tags.name || '').replace(/^Parroquia\s+/i, '').trim();
      if (!name || name.toLowerCase() === cityNames[id].toLowerCase()) continue;
      const out = rings((e.members || []).filter((m) => m.type === 'way' && m.role === 'outer' && m.geometry).map((m) => m.geometry));
      const inn = rings((e.members || []).filter((m) => m.type === 'way' && m.role === 'inner' && m.geometry).map((m) => m.geometry));
      const proj = (r) => simplify(r.map((p) => project(p.lat, p.lon)), 0.12);
      const all = out.concat(inn).map(proj).filter((r) => r.length >= 4);
      if (!all.length) continue;
      const main = all.slice().sort((a, b) => Math.abs(area(b)) - Math.abs(area(a)))[0];
      const [cx, cy] = centroid(main);
      list.push({
        id: `${id}-${e.id}`, name, level: +e.tags.admin_level, rings: all, cx: Math.round(cx * 10) / 10, cy: Math.round(cy * 10) / 10,
        d: all.map((r) => 'M' + r.map((p) => p[0] + ' ' + p[1]).join('L') + 'Z').join(''),
      });
    }
    res[id] = list;
  }
  res.pip = pip;
  return res;
};
