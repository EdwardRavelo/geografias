// Construye js/geo-data.js a partir de las fuentes en tools/cache.
// Uso:  node tools/build-geo.js
// Fuentes: geoBoundaries (CC0) para provincias y países vecinos; OpenStreetMap (ODbL) y Natural Earth (dominio público) para ríos.
const fs = require('fs');
const path = require('path');
const { loadDEM } = require('./lib/dem.js');

const ROOT = path.join(__dirname, '..');
const C = (f) => path.join(__dirname, 'cache', f);
const readJSON = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

// ───────── Proyección (equirrectangular, 400 u/° en el continente) ─────────
const PROJ = {
  main: { k: 400, x0: 0, y0: 0, lonRef: -82.9, latRef: 1.9 },
  gal: { k: 180, x0: 50, y0: 2270, lonRef: -92.1, latRef: 1.8 },
};
const W = Math.round((-74.7 - PROJ.main.lonRef) * PROJ.main.k); // 3280
const H = Math.round((PROJ.main.latRef - -5.6) * PROJ.main.k); // 3000
const project = (p, lon, lat) => [Math.round(p.x0 + (lon - p.lonRef) * p.k), Math.round(p.y0 + (p.latRef - lat) * p.k)];

// ───────── Utilidades geométricas ─────────
function dp(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let md = 0, mi = -1;
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    for (let i = a + 1; i < b; i++) {
      let t = L ? ((pts[i][0] - ax) * dx + (pts[i][1] - ay) * dy) / L : 0;
      t = Math.max(0, Math.min(1, t));
      const d = Math.hypot(pts[i][0] - (ax + t * dx), pts[i][1] - (ay + t * dy));
      if (d > md) { md = d; mi = i; }
    }
    if (md > tol) { keep[mi] = 1; stack.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const segDist = (px, py, ax, ay, bx, by) => {
  const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
  let t = L ? ((px - ax) * dx + (py - ay) * dy) / L : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};
function pip(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const inPoly = (x, y, polys) => polys.some((rings) => pip(x, y, rings[0]) && !rings.slice(1).some((h) => pip(x, y, h)));
const polysOf = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates);
function areaRing(r) { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] * r[i][1] - r[i][0] * r[j][1]); return a / 2; }
function minDistToPolys(x, y, polys) {
  let m = 1e9;
  for (const rings of polys) for (const r of rings) for (let i = 0; i < r.length - 1; i++) m = Math.min(m, segDist(x, y, r[i][0], r[i][1], r[i + 1][0], r[i + 1][1]));
  return m;
}
// Polo de inaccesibilidad (aprox.) para ubicar la etiqueta dentro del polígono
function labelPoint(polys) {
  let best = polys.reduce((a, b) => (Math.abs(areaRing(b[0])) > Math.abs(areaRing(a[0])) ? b : a));
  const xs = best[0].map((p) => p[0]), ys = best[0].map((p) => p[1]);
  let [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  let bp = null, bd = -1;
  let step = Math.max(x1 - x0, y1 - y0) / 24;
  for (let pass = 0; pass < 4; pass++) {
    for (let x = x0; x <= x1; x += step) for (let y = y0; y <= y1; y += step) {
      if (!inPoly(x, y, [best])) continue;
      const d = minDistToPolys(x, y, [best]);
      if (d > bd) { bd = d; bp = [x, y]; }
    }
    if (!bp) break;
    x0 = bp[0] - step; x1 = bp[0] + step; y0 = bp[1] - step; y1 = bp[1] + step; step /= 4;
  }
  return bp;
}

// ───────── Identidad de provincias ─────────
const META = {
  Azuay: ['azuay', 'Azuay'], Bolívar: ['bolivar', 'Bolívar'], Cañar: ['canar', 'Cañar'], Carchi: ['carchi', 'Carchi'],
  Chimborazo: ['chimborazo', 'Chimborazo'], Cotopaxi: ['cotopaxi', 'Cotopaxi'], 'El Oro': ['el-oro', 'El Oro'],
  Esmeraldas: ['esmeraldas', 'Esmeraldas'], 'Galápagos': ['galapagos', 'Galápagos'], Guayas: ['guayas', 'Guayas'],
  Imbabura: ['imbabura', 'Imbabura'], Loja: ['loja', 'Loja'], 'Los Ríos': ['los-rios', 'Los Ríos'], Manabi: ['manabi', 'Manabí'],
  'Morona Santiago': ['morona-santiago', 'Morona Santiago'], Napo: ['napo', 'Napo'], Orellana: ['orellana', 'Orellana'],
  Pastaza: ['pastaza', 'Pastaza'], Pichincha: ['pichincha', 'Pichincha'], 'Santa Elena': ['santa-elena', 'Santa Elena'],
  'Santo Domingo de los Tsáchilas': ['santo-domingo', 'Santo Domingo de los Tsáchilas'], Sucumbios: ['sucumbios', 'Sucumbíos'],
  Tungurahua: ['tungurahua', 'Tungurahua'], 'Zamora Chinchipe': ['zamora-chinchipe', 'Zamora Chinchipe'],
};

// ───────── Provincias ─────────
const raw = readJSON(C('provinces-raw.geojson'));
const provs = raw.features.map((f) => {
  const [id, name] = META[f.properties.shapeName] || (() => { throw new Error('Sin meta: ' + f.properties.shapeName); })();
  return { id, name, polys: polysOf(f.geometry) };
}).sort((a, b) => a.name.localeCompare(b.name, 'es'));

const TOL = 0.0016; // grados (~180 m)
const ringPath = (ring, p) => {
  const pts = dp(ring, TOL).map(([lo, la]) => project(p, lo, la));
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) if (pts[i][0] !== out[out.length - 1][0] || pts[i][1] !== out[out.length - 1][1]) out.push(pts[i]);
  if (out.length < 3) return '';
  // Trazo relativo compacto
  let d = `M${out[0][0]} ${out[0][1]}`, px = out[0][0], py = out[0][1];
  for (let i = 1; i < out.length; i++) { d += `l${out[i][0] - px} ${out[i][1] - py}`; px = out[i][0]; py = out[i][1]; }
  return d + 'z';
};

const out = { w: W, h: H, proj: PROJ, provinces: [], islands: [], rivers: [], places: [], peaks: [], neighbors: [] };
const bboxOf = (polys, p) => {
  const pts = polys.flatMap((r) => r[0]).map(([lo, la]) => project(p, lo, la));
  const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
};

for (const pv of provs) {
  const isGal = pv.id === 'galapagos';
  const p = isGal ? PROJ.gal : PROJ.main;
  const lat = pv.polys.flatMap((r) => r[0].map((q) => q[1]));
  const lon = pv.polys.flatMap((r) => r[0].map((q) => q[0]));
  let d = '';
  for (const rings of pv.polys) for (const r of rings) d += ringPath(r, p);
  const lp = labelPoint(pv.polys);
  const [lx, ly] = project(p, lp[0], lp[1]);
  pv.lat = [Math.min(...lat), Math.max(...lat)];
  pv.lon = [Math.min(...lon), Math.max(...lon)];
  out.provinces.push({ id: pv.id, name: pv.name, d, label: [lx, ly], bbox: bboxOf(pv.polys, p), latRange: pv.lat.map((v) => +v.toFixed(3)), lonRange: pv.lon.map((v) => +v.toFixed(3)), inset: isGal });
}

// Islas de Galápagos (cada polígono, con nombre por proximidad a puntos conocidos)
const GAL_NAMES = [
  ['Isabela', -0.83, -91.1], ['Santa Cruz', -0.63, -90.35], ['San Cristóbal', -0.84, -89.43], ['Floreana', -1.29, -90.43],
  ['Española', -1.37, -89.69], ['Santiago', -0.24, -90.77], ['Fernandina', -0.37, -91.55], ['Genovesa', 0.32, -89.96],
  ['Marchena', 0.33, -90.47], ['Pinta', 0.58, -90.75], ['Wolf', 1.38, -91.82], ['Darwin', 1.68, -92.0],
  ['Baltra', -0.46, -90.28], ['Santa Fe', -0.82, -90.06], ['Rábida', -0.41, -90.71], ['Pinzón', -0.61, -90.67], ['Bartolomé', -0.28, -90.55],
];
const galProv = provs.find((p) => p.id === 'galapagos');
const nameFor = (lo, la) => GAL_NAMES.map(([n, a, b]) => [n, Math.hypot(a - la, b - lo)]).sort((x, y) => x[1] - y[1])[0];
// Cada isla con nombre se asigna al polígono más grande entre los más cercanos a su punto de referencia
const cands = galProv.polys.map((rings) => {
  const ar = Math.abs(areaRing(rings[0])) * 111.32 * 111.32;
  const cx = rings[0].reduce((s, q) => s + q[0], 0) / rings[0].length, cy = rings[0].reduce((s, q) => s + q[1], 0) / rings[0].length;
  const [n, dist] = nameFor(cx, cy);
  return { rings, ar, cx, cy, n, dist };
});
const best = {};
for (const c of cands) if (c.dist < 0.3 && c.ar > 5 && (!best[c.n] || c.ar > best[c.n].ar)) best[c.n] = c;
for (const c of cands) {
  out.islands.push({ name: best[c.n] === c ? c.n : null, km2: Math.round(c.ar), d: c.rings.map((r) => ringPath(r, PROJ.gal)).join(''), c: project(PROJ.gal, c.cx, c.cy) });
}

// ───────── Lugares (capitales provinciales y otras ciudades) ─────────
const PLACES = [
  ['Quito', 'pichincha', -0.2201, -78.5124, 2850, 1, 'Capital de la República'], ['Guayaquil', 'guayas', -2.1962, -79.8862, 4, 1, ''],
  ['Cuenca', 'azuay', -2.8953, -78.9963, 2560, 1, ''], ['Ambato', 'tungurahua', -1.2491, -78.6167, 2577, 1, ''],
  ['Riobamba', 'chimborazo', -1.6651, -78.6589, 2754, 1, ''], ['Latacunga', 'cotopaxi', -0.9342, -78.6152, 2750, 1, ''],
  ['Ibarra', 'imbabura', 0.3488, -78.1246, 2225, 1, ''], ['Tulcán', 'carchi', 0.8124, -77.7171, 2980, 1, ''],
  ['Esmeraldas', 'esmeraldas', 0.9592, -79.654, 6, 1, ''], ['Portoviejo', 'manabi', -1.0576, -80.4514, 53, 1, ''],
  ['Santo Domingo', 'santo-domingo', -0.2537, -79.1763, 655, 1, ''], ['Babahoyo', 'los-rios', -1.8049, -79.5249, 8, 1, ''],
  ['Machala', 'el-oro', -3.2589, -79.9588, 6, 1, ''], ['Loja', 'loja', -3.9931, -79.2042, 2060, 1, ''],
  ['Zamora', 'zamora-chinchipe', -4.0645, -78.9512, 970, 1, ''], ['Macas', 'morona-santiago', -2.3074, -78.1203, 1020, 1, ''],
  ['Puyo', 'pastaza', -1.4916, -78.0034, 960, 1, ''], ['Tena', 'napo', -0.9961, -77.8131, 510, 1, ''],
  ['Coca', 'orellana', -0.4497, -76.9972, 250, 1, 'Francisco de Orellana'], ['Nueva Loja', 'sucumbios', 0.086, -76.8953, 297, 1, 'Lago Agrio'],
  ['Guaranda', 'bolivar', -1.5911, -78.999, 2668, 1, ''], ['Azogues', 'canar', -2.7398, -78.8456, 2518, 1, ''],
  ['Santa Elena', 'santa-elena', -2.2265, -80.8581, 6, 1, ''], ['Puerto Baquerizo Moreno', 'galapagos', -0.9017, -89.6102, 6, 1, 'Isla San Cristóbal'],
];
const issues = [];
for (const [name, pid, lat, lon, alt, cap, note] of PLACES) {
  const pr = provs.find((p) => p.id === pid);
  const ok = inPoly(lon, lat, pr.polys);
  const dist = ok ? 0 : minDistToPolys(lon, lat, pr.polys);
  if (!ok) issues.push(`${name} fuera de ${pid} (a ${dist.toFixed(3)}°)`);
  const [x, y] = project(pid === 'galapagos' ? PROJ.gal : PROJ.main, lon, lat);
  out.places.push({ name, province: pid, lat, lon, alt, capital: !!cap, note, x, y });
}

// ───────── Cumbres (verificadas contra el DEM) ─────────
const PEAKS = [
  ['Chimborazo', -1.469, -78.817, 6263, 'Chimborazo', 'Punto de la superficie terrestre más alejado del centro de la Tierra'],
  ['Cotopaxi', -0.684, -78.438, 5897, 'Cotopaxi', 'Uno de los volcanes activos más altos del mundo'],
  ['Cayambe', 0.029, -77.986, 5790, 'Pichincha', 'Sobre la línea ecuatorial; su nieve está en 0° de latitud'],
  ['Antisana', -0.481, -78.141, 5704, 'Napo', ''],
  ['El Altar', -1.668, -78.413, 5319, 'Chimborazo', 'Caldera abierta, hoy glaciar y laguna'],
  ['Illiniza Sur', -0.659, -78.714, 5248, 'Cotopaxi', ''],
  ['Sangay', -2.002, -78.341, 5230, 'Morona Santiago', 'Volcán en erupción casi constante'],
  ['Tungurahua', -1.467, -78.442, 5023, 'Tungurahua', ''],
  ['Cotacachi', 0.363, -78.349, 4944, 'Imbabura', ''],
  ['Imbabura', 0.25, -78.18, 4609, 'Imbabura', 'Taita Imbabura'],
  ['Guagua Pichincha', -0.171, -78.598, 4784, 'Pichincha', 'Domina Quito por el occidente'],
  ['Quilotoa', -0.85, -78.9, 3914, 'Cotopaxi', 'Caldera con laguna'],
  ['Sumaco', -0.538, -77.626, 3732, 'Napo', 'Volcán aislado en la Amazonía'],
  ['Reventador', -0.077, -77.656, 3562, 'Napo', ''],
];

(async () => {
  const dm = await loadDEM(-81.7, -74.7, -5.5, 1.9);
  const dg = await loadDEM(-92.1, -89.0, -1.5, 1.8);
  for (const [name, lat, lon, h, prov, note] of PEAKS) {
    const m = dm.maxNear(lon, lat, 0.05);
    const [x, y] = project(PROJ.main, lon, lat);
    out.peaks.push({ name, lat, lon, h, province: prov, note, x, y, demMax: Math.round(m) });
  }
  // Volcanes de Galápagos
  const GALV = [['Wolf', 0.0, 0, 1707], ['Cerro Azul', -0.92, -91.4, 1640], ['Sierra Negra', -0.83, -91.17, 1124], ['Fernandina (La Cumbre)', -0.37, -91.55, 1476], ['Alcedo', -0.43, -91.12, 1130]];
  // (Wolf: volcán en el norte de Isabela, lat 0.02, lon -91.35)
  GALV[0] = ['Wolf', 0.0267, -91.3517, 1707];
  for (const [name, lat, lon, h] of GALV) {
    const [x, y] = project(PROJ.gal, lon, lat);
    out.peaks.push({ name, lat, lon, h, province: 'Galápagos', note: '', x, y, demMax: Math.round(dg.maxNear(lon, lat, 0.05)), gal: true });
  }

  // ───────── Ríos ─────────
  // Los ríos ya no se publican; solo se procesan si los archivos de origen están en cache.
  const hasRivers = fs.existsSync(C('osm-rivers.json')) && fs.existsSync(C('ne-rivers.geojson'));
  const osm = hasRivers ? readJSON(C('osm-rivers.json')) : { elements: [] };
  const ne = hasRivers ? readJSON(C('ne-rivers.geojson')) : { features: [] };
  const KEEP = {
    // nombre → [etiqueta, importancia (1 = etiquetar siempre), vertiente]
    'Esmeraldas': ['Río Esmeraldas', 1, 'pacifico'], 'Guayas': ['Río Guayas', 1, 'pacifico'], 'Daule': ['Río Daule', 2, 'pacifico'],
    'Babahoyo': ['Río Babahoyo', 2, 'pacifico'], 'Vinces': ['Río Vinces', 3, 'pacifico'], 'Chimbo': ['Río Chimbo', 3, 'pacifico'],
    'Portoviejo': ['Río Portoviejo', 3, 'pacifico'], 'Chone': ['Río Chone', 3, 'pacifico'], 'Cañar': ['Río Cañar', 3, 'pacifico'],
    'Jubones': ['Río Jubones', 3, 'pacifico'], 'Puyango': ['Río Puyango', 3, 'pacifico'], 'Catamayo': ['Río Catamayo', 3, 'pacifico'],
    'Macará': ['Río Macará', 3, 'pacifico'], 'Guayllabamba': ['Río Guayllabamba', 2, 'pacifico'], 'Toachi': ['Río Toachi', 3, 'pacifico'],
    'Cayapas': ['Río Cayapas', 3, 'pacifico'], 'Mira': ['Río Mira', 2, 'pacifico'], 'Chota': ['Río Chota', 3, 'pacifico'],
    'Quevedo': ['Río Quevedo', 3, 'pacifico'],
    'Napo': ['Río Napo', 1, 'amazonica'], 'Pastaza': ['Río Pastaza', 1, 'amazonica'], 'Coca': ['Río Coca', 2, 'amazonica'],
    'Aguarico': ['Río Aguarico', 2, 'amazonica'], 'Curaray': ['Río Curaray', 2, 'amazonica'], 'Santiago': ['Río Santiago', 2, 'amazonica'],
    'Zamora': ['Río Zamora', 2, 'amazonica'], 'Upano': ['Río Upano', 3, 'amazonica'], 'Paute': ['Río Paute', 2, 'amazonica'],
    'Morona': ['Río Morona', 3, 'amazonica'], 'Putumayo': ['Río Putumayo', 2, 'amazonica'], 'Tiputini': ['Río Tiputini', 3, 'amazonica'],
    'Bobonaza': ['Río Bobonaza', 3, 'amazonica'], 'Marañón': ['Río Marañón', 3, 'amazonica'], 'Quijos': ['Río Quijos', 3, 'amazonica'],
    'Patate': ['Río Patate', 3, 'amazonica'], 'Chambo': ['Río Chambo', 3, 'amazonica'], 'Misahuallí': ['Río Misahuallí', 3, 'amazonica'],
    'Cononaco': ['Río Cononaco', 3, 'amazonica'], 'Palora': ['Río Palora', 3, 'amazonica'],
  };
  const lines = {}; // nombre → [[lon,lat]...]
  const inBox = (lo, la) => lo > -82.5 && lo < -74.0 && la > -5.9 && la < 2.2;
  for (const e of osm.elements) {
    const n = e.tags.name.replace(/^Río /, '');
    if (!KEEP[n]) continue;
    const g = e.geometry.map((q) => [q.lon, q.lat]);
    if (!g.some(([lo, la]) => inBox(lo, la))) continue;
    (lines[n] = lines[n] || []).push(g);
  }
  for (const f of ne.features) {
    const n = f.properties.name;
    if (!KEEP[n] || (lines[n] && n !== 'Napo' && n !== 'Putumayo' && n !== 'Mira' && n !== 'Marañón')) continue;
    const ls = f.geometry.type === 'LineString' ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const g of ls) if (g.some(([lo, la]) => inBox(lo, la))) (lines[n] = lines[n] || []).push(g);
  }
  // Unir tramos contiguos (OSM los entrega fragmentados) y simplificar
  const joinWays = (ways) => {
    const ws = ways.map((w) => w.slice()), res = [];
    while (ws.length) {
      let cur = ws.pop(), grew = true;
      while (grew) {
        grew = false;
        for (let i = 0; i < ws.length; i++) {
          const w = ws[i], eq = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.0004;
          if (eq(cur[cur.length - 1], w[0])) cur = cur.concat(w.slice(1));
          else if (eq(cur[cur.length - 1], w[w.length - 1])) cur = cur.concat(w.slice().reverse().slice(1));
          else if (eq(cur[0], w[w.length - 1])) cur = w.concat(cur.slice(1));
          else if (eq(cur[0], w[0])) cur = w.slice().reverse().concat(cur.slice(1));
          else continue;
          ws.splice(i, 1); grew = true; break;
        }
      }
      res.push(cur);
    }
    return res;
  };
  for (const [n, ways] of Object.entries(lines)) {
    const [label, imp, slope] = KEEP[n];
    const joined = joinWays(ways).map((l) => dp(l, 0.004)).filter((l) => l.length > 1);
    // Recorte: solo puntos dentro de la caja del lienzo (con holgura)
    let d = '';
    let longest = null, len = 0;
    for (const l of joined) {
      const pts = l.map(([lo, la]) => project(PROJ.main, lo, la)).filter(([x, y]) => x > -100 && x < W + 100 && y > -100 && y < H + 100);
      if (pts.length < 2) continue;
      d += 'M' + pts.map((q) => q.join(' ')).join('L');
      let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (L > len) { len = L; longest = pts; }
    }
    if (!d) continue;
    // Punto de etiqueta: a 55% del tramo más largo
    const mid = longest[Math.floor(longest.length * 0.55)];
    out.rivers.push({ id: n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-'), name: label, rank: imp, slope, d, label: mid, len: Math.round(len) });
  }

  // ───────── Países vecinos (contexto) ─────────
  for (const [nm, f] of [['Colombia', 'col-adm0.geojson'], ['Perú', 'per-adm0.geojson']]) {
    const g = readJSON(C(f)).features[0].geometry;
    let d = '';
    for (const rings of polysOf(g)) {
      const r = rings[0];
      if (!r.some(([lo, la]) => lo > -83 && lo < -73.5 && la > -6.5 && la < 3)) continue;
      d += ringPath(r.filter(() => true), PROJ.main).replace(/z$/, '') + 'z';
    }
    out.neighbors.push({ name: nm, d });
  }

  // ───────── Vecindad entre provincias y fronteras internacionales ─────────
  const near = (A, B, tol) => {
    for (const ra of A.polys) for (const q of ra[0]) if (minDistToPolys(q[0], q[1], B.polys.map((x) => [x[0]])) < tol) return true;
    return false;
  };
  const adj = {};
  for (const a of provs) {
    adj[a.id] = [];
    if (a.id === 'galapagos') continue;
    for (const b of provs) {
      if (a === b || b.id === 'galapagos') continue;
      // al menos 3 vértices de A pegados al borde de B
      let c = 0;
      for (const ra of a.polys) for (const q of ra[0]) if (minDistToPolys(q[0], q[1], b.polys.map((x) => [x[0]])) < 0.01) c++;
      if (c >= 3) adj[a.id].push(b.id);
    }
  }
  const borders = {};
  for (const [nm, f] of [['colombia', 'col-adm0.geojson'], ['peru', 'per-adm0.geojson']]) {
    const polys = polysOf(readJSON(C(f)).features[0].geometry).map((x) => [x[0]]);
    for (const a of provs) {
      if (a.id === 'galapagos') continue;
      let c = 0;
      for (const ra of a.polys) for (const q of ra[0]) if (minDistToPolys(q[0], q[1], polys) < 0.03) c++;
      if (c >= 8) (borders[a.id] = borders[a.id] || []).push(nm);
    }
  }
  out.adjacency = adj;
  out.borders = borders;

  // ───────── Escritura ─────────
  // Alcance del módulo: provincias, regiones y ciudades. Ríos y cumbres se calculan solo como verificación.
  const outFile = Object.assign({}, out); delete outFile.rivers; delete outFile.peaks;
  out.islands.forEach((i) => { i.name = null; });
  const js = '/* Generado por tools/build-geo.js — no editar a mano.\n   Límites: geoBoundaries (CC0, referenciales). Ríos: © colaboradores de OpenStreetMap (ODbL) y Natural Earth. */\nwindow.EC_GEO = ' + JSON.stringify(outFile) + ';\n';
  fs.writeFileSync(path.join(ROOT, 'js', 'geo-data.js'), js);
  console.log('geo-data.js', (js.length / 1024).toFixed(0), 'KB');
  console.log('Avisos de capitales:', issues.length ? issues.join('; ') : 'ninguno');
  console.log('Cumbres (DEM max vs altura oficial):');
  for (const p of out.peaks) console.log(' ', p.name.padEnd(24), p.h, p.demMax, p.demMax < p.h * 0.85 ? '← revisar posición' : '');
  console.log('Ríos:', out.rivers.map((r) => r.name + '(' + r.len + ')').join(', '));
  console.log('Vecinos:'); for (const k of Object.keys(adj)) console.log(' ', k.padEnd(18), adj[k].join(', '), '|', (borders[k] || []).join(','));
  console.log('Cruzan el Ecuador (0°):', out.provinces.filter((p) => p.latRange[0] < 0 && p.latRange[1] > 0).map((p) => p.name).join(', '));
})().catch((e) => { console.error(e); process.exit(1); });
