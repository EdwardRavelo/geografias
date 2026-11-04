// Construye js/cantones-data.js: límites de los cantones, cabeceras cantonales con coordenadas y datos básicos.
// Fuentes (tools/cache): geoBoundaries ADM2 (CC0), tabla de cantones (Wikipedia/INEC), GeoNames (CC BY 4.0).
// Uso:  node tools/build-cantones.js
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const C = (f) => path.join(__dirname, 'cache', f);

global.window = {};
eval(fs.readFileSync(path.join(ROOT, 'js', 'geo-data.js'), 'utf8').replace('window.EC_GEO', 'global.EC_GEO'));
const GEO = global.EC_GEO;
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const expand = (n) => n.replace(/\bcrnel\b/, 'coronel').replace(/\bgnral\b/, 'general').replace(/^24 de mayo/, 'veinticuatro de mayo');
const slug = (s) => norm(s).replace(/ /g, '-');
const project = (lon, lat, gal) => { const p = gal ? GEO.proj.gal : GEO.proj.main; return [Math.round(p.x0 + (lon - p.lonRef) * p.k), Math.round(p.y0 + (p.latRef - lat) * p.k)]; };
const projectF = (lon, lat, gal) => { const p = gal ? GEO.proj.gal : GEO.proj.main; return [Math.round((p.x0 + (lon - p.lonRef) * p.k) * 10) / 10, Math.round((p.y0 + (p.latRef - lat) * p.k) * 10) / 10]; };

const PROV = { A: 'azuay', B: 'bolivar', F: 'canar', C: 'carchi', H: 'chimborazo', X: 'cotopaxi', O: 'el-oro', E: 'esmeraldas', W: 'galapagos', G: 'guayas', I: 'imbabura', L: 'loja', R: 'los-rios', M: 'manabi', S: 'morona-santiago', N: 'napo', D: 'orellana', Y: 'pastaza', P: 'pichincha', SE: 'santa-elena', SD: 'santo-domingo', U: 'sucumbios', T: 'tungurahua', Z: 'zamora-chinchipe' };

// ───── geometría ─────
function dp(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const st = [[0, pts.length - 1]];
  while (st.length) {
    const [a, b] = st.pop(); let md = 0, mi = -1;
    const [ax, ay] = pts[a], [bx, by] = pts[b], dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    for (let i = a + 1; i < b; i++) {
      let t = L ? ((pts[i][0] - ax) * dx + (pts[i][1] - ay) * dy) / L : 0; t = Math.max(0, Math.min(1, t));
      const d = Math.hypot(pts[i][0] - (ax + t * dx), pts[i][1] - (ay + t * dy));
      if (d > md) { md = d; mi = i; }
    }
    if (md > tol) { keep[mi] = 1; st.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const pip = (x, y, ring) => { let inside = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside; } return inside; };
const polysOf = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates);
const inPolys = (x, y, polys) => polys.some((r) => pip(x, y, r[0]) && !r.slice(1).some((h) => pip(x, y, h)));
const areaRing = (r) => { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += r[j][0] * r[i][1] - r[i][0] * r[j][1]; return a / 2; };
const segDist = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy; let t = L ? ((px - ax) * dx + (py - ay) * dy) / L : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(px - (ax + t * dx), py - (ay + t * dy)); };
const minDist = (x, y, polys) => { let m = 1e9; for (const r of polys) for (const ring of r) for (let i = 0; i < ring.length - 1; i++) m = Math.min(m, segDist(x, y, ring[i][0], ring[i][1], ring[i + 1][0], ring[i + 1][1])); return m; };
function labelPoint(polys) {
  const best = polys.reduce((a, b) => (Math.abs(areaRing(b[0])) > Math.abs(areaRing(a[0])) ? b : a));
  const xs = best[0].map((p) => p[0]), ys = best[0].map((p) => p[1]);
  let [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)], bp = null, bd = -1, step = Math.max(x1 - x0, y1 - y0) / 16;
  for (let pass = 0; pass < 3; pass++) {
    for (let x = x0; x <= x1; x += step) for (let y = y0; y <= y1; y += step) { if (!inPolys(x, y, [best])) continue; const d = minDist(x, y, [best]); if (d > bd) { bd = d; bp = [x, y]; } }
    if (!bp) break; x0 = bp[0] - step; x1 = bp[0] + step; y0 = bp[1] - step; y1 = bp[1] + step; step /= 4;
  }
  return bp || [(x0 + x1) / 2, (y0 + y1) / 2];
}
function ringPath(ring, gal, tol) {
  const pts = dp(ring, tol).map(([lo, la]) => project(lo, la, gal));
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) if (pts[i][0] !== out[out.length - 1][0] || pts[i][1] !== out[out.length - 1][1]) out.push(pts[i]);
  if (out.length < 3) return '';
  let d = `M${out[0][0]} ${out[0][1]}`, px = out[0][0], py = out[0][1];
  for (let i = 1; i < out.length; i++) { d += `l${out[i][0] - px} ${out[i][1] - py}`; px = out[i][0]; py = out[i][1]; }
  return d + 'z';
}

// ───── datos de entrada ─────
const adm2 = JSON.parse(fs.readFileSync(C('ecu-adm2.geojson'), 'utf8'));
const wiki = JSON.parse(fs.readFileSync(C('cantones-wiki.json'), 'utf8'));
const provRaw = JSON.parse(fs.readFileSync(C('provinces-raw.geojson'), 'utf8'));
const provIdByName = {}; GEO.provinces.forEach((p) => (provIdByName[norm(p.name)] = p.id));
const provPolys = provRaw.features.map((f) => ({ id: provIdByName[norm(f.properties.shapeName)], polys: polysOf(f.geometry) }));
const provOf = (lon, lat) => (provPolys.find((p) => inPolys(lon, lat, p.polys)) || {}).id;

// GeoNames: lugares poblados
const places = fs.readFileSync(C('EC.txt'), 'utf8').split('\n').map((l) => l.split('\t')).filter((c) => c[6] === 'P').map((c) => ({ name: c[1], ascii: norm(c[2] || c[1]), alt: (c[3] || '').split(',').map(norm), lat: +c[4], lon: +c[5], code: c[7], pop: +c[14] || 0, elev: c[15] ? +c[15] : c[16] ? +c[16] : null }));
console.log('lugares poblados GeoNames:', places.length);

// ───── asociar polígonos con la tabla de cantones ─────
const feats = adm2.features.map((f) => {
  const polys = polysOf(f.geometry);
  const lp = labelPoint(polys);
  return { name: f.properties.shapeName, n: expand(norm(f.properties.shapeName)), polys, lp, prov: provOf(lp[0], lp[1]) };
});
const used = new Set(), items = [], problems = [];
for (const w of wiki) {
  const pid = PROV[w.prov];
  const wn = norm(w.name);
  let f = feats.find((x) => !used.has(x) && x.n === wn && x.prov === pid);
  if (!f) f = feats.find((x) => !used.has(x) && x.prov === pid && (x.n.includes(wn) || wn.includes(x.n)));
  if (!f) { problems.push(`${w.name} (${pid}): sin polígono`); }
  items.push({ w, pid, f });
  if (f) used.add(f);
}
console.log('polígonos sin usar:', feats.filter((f) => !used.has(f)).map((f) => f.name + '@' + f.prov).join(', ') || 'ninguno');
console.log('cantones sin polígono:', problems.join('; ') || 'ninguno');

// ───── construir salida ─────
const seen = {}, outItems = [], seatIssues = [];
for (const { w, pid, f } of items) {
  const gal = pid === 'galapagos';
  let id = slug(w.name); if (seen[id]) id = id + '-' + pid; seen[id] = 1;
  let seatName = w.seat || w.name;
  const SEAT_ALIAS = { 'el coca': ['coca', 'puerto francisco de orellana', 'francisco de orellana'], 'general antonio elizalde': ['bucay'], 'coronel marcelino mariduena': ['marcelino mariduena', 'crnel marcelino mariduena'], 'pablo sexto': ['pablo vi', 'pablo sexto'], 'sucre': ['sucre', 'bellavista'] };
  const sn0 = norm(seatName.replace(/\(.*\)/, ''));
  const aliases = SEAT_ALIAS[sn0] || [sn0];
  let seat = null;
  if (f) {
    const match = (p) => aliases.some((a) => p.ascii === a || p.alt.includes(a));
    const cands = places.filter((p) => match(p) && inPolys(p.lon, p.lat, f.polys));
    seat = cands.sort((a, b) => b.pop - a.pop)[0] || null;
    if (!seat) { // cabecera cerca del borde del polígono
      const near = places.filter((p) => match(p) && minDist(p.lon, p.lat, f.polys) < 0.05);
      seat = near.sort((a, b) => b.pop - a.pop)[0] || null;
    }
  }
  if (!seat) seatIssues.push(`${w.name} → ${seatName}`);
  const lon = seat ? seat.lon : f ? f.lp[0] : null, lat = seat ? seat.lat : f ? f.lp[1] : null;
  const [x, y] = lon == null ? [null, null] : projectF(lon, lat, gal);
  let d = '', bbox = null, label = null;
  if (f) {
    for (const rings of f.polys) d += ringPath(rings[0], gal, gal ? 0.004 : 0.0032);
    const pts = f.polys.flatMap((r) => r[0]).map(([lo, la]) => project(lo, la, gal));
    const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
    bbox = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    label = project(f.lp[0], f.lp[1], gal);
  }
  outItems.push({ id, name: w.name, prov: pid, seat: seatName.replace(/\(.*\)/, '').trim(), lat: lat && +lat.toFixed(4), lon: lon && +lon.toFixed(4), x, y, alt: seat && seat.elev != null ? Math.round(seat.elev) : null, pop: w.pop, area: w.area, seatPop: w.seatPop, year: w.year, geoSeat: !!seat, noPoly: !f, d, bbox, label });
}
console.log('cabeceras sin coordenada de GeoNames (se usa el punto interior):', seatIssues.length, seatIssues.join('; '));
const js = '/* Generado por tools/build-cantones.js — no editar a mano.\n   Límites: geoBoundaries ADM2 (CC0). Cabeceras: GeoNames (CC BY 4.0). Cifras: INEC, Censo 2022 (vía Wikipedia). */\nwindow.EC_CANTONES = ' + JSON.stringify(outItems) + ';\n';
fs.writeFileSync(path.join(ROOT, 'js', 'cantones-data.js'), js);
console.log('cantones-data.js', (js.length / 1024).toFixed(0), 'KB;', outItems.length, 'cantones');
