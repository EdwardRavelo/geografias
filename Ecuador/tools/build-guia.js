// Construye js/guia-data.js: frecuencia de casos por provincia y ciudad (agregado del reporte) y sectores de cada ciudad.
// Entradas: tools/data/frecuencia.json (conteos, sin datos personales), js/cantones-data.js, js/geo-data.js,
//           tools/cache/EC.txt (GeoNames), tools/cache/sec-<ciudad>.json (OSM), tools/sectores-curados.json
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const FREQ = require('./data/frecuencia.json');
const CUR = require('./sectores-curados.json');
const MAN = require('./sectores-manual.json');
const CITIESCFG = require('./cities-sectores.json');
global.window = {};
eval(fs.readFileSync(path.join(ROOT, 'js', 'geo-data.js'), 'utf8').replace('window.EC_GEO', 'global.EC_GEO'));
eval(fs.readFileSync(path.join(ROOT, 'js', 'cantones-data.js'), 'utf8'));
const GEO = global.EC_GEO, CANT = window.EC_CANTONES;
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const P = GEO.proj.main;
const project = (lon, lat) => [Math.round((P.x0 + (lon - P.lonRef) * P.k) * 10) / 10, Math.round((P.y0 + (P.latRef - lat) * P.k) * 10) / 10];
const km = (a, b, c, d) => Math.hypot((a - c) * 111.2, (b - d) * 111.2 * Math.cos((a * Math.PI) / 180));
const cap = (s) => s.toLowerCase().replace(/(^|\s)\S/g, (m) => m.toUpperCase()).replace(/\b(De|Del|La|Las|Los|Y)\b/g, (m) => m.toLowerCase());

const PROV = (s) => { const n = norm(s).replace(/ /g, '-'); return n === 'santo-domingo-de-los-tsachilas' ? 'santo-domingo' : n; };
// En el reporte algunas «ciudades» son en realidad barrios o parroquias de otra ciudad.
const SECTOR_DE = { 'PICHINCHA|BELISARIO QUEVEDO': 'quito', 'PICHINCHA|SOLANDA': 'quito', 'PICHINCHA|CARCELEN': 'quito', 'PICHINCHA|PUEMBO': 'quito', 'PICHINCHA|CENTRO HISTORICO': 'quito', 'PICHINCHA|GUAMANI': 'quito', 'PICHINCHA|JIPIJAPA': 'quito', 'PICHINCHA|TUMBACO': 'quito', 'PICHINCHA|CONOCOTO': 'quito', 'PICHINCHA|LA FERROVIARIA': 'quito', 'PICHINCHA|CUMBAYA': 'quito', 'AZUAY|BELLAVISTA': 'cuenca', 'AZUAY|CAÑARIBAMBA': 'cuenca', 'AZUAY|BAÑOS': 'cuenca', 'AZUAY|VALLE': 'cuenca', 'CHIMBORAZO|LIZARZABURU': 'riobamba', 'GUAYAS|AYACUCHO': 'guayaquil', 'GUAYAS|FEBRES CORDERO': 'guayaquil', 'GUAYAS|ELOY ALFARO (DURAN)': 'duran', 'COTOPAXI|ELOY ALFARO  (SAN FELIPE)': 'latacunga', 'COTOPAXI|LA MATRIZ': 'latacunga', 'ORELLANA|ORELLANA': 'francisco-de-orellana', 'LOJA|EL SAGRARIO': 'loja', 'LOJA|SAN SEBASTIAN': 'loja' };
const CLEAN = (v) => v.split(',')[0].replace(/\s*\(.*\)\s*$/, '').replace(/^PUERTO FRANCISCO DE ORELLANA$/, 'FRANCISCO DE ORELLANA').trim();
const MIN = 10;

// ciudades: pares provincia|ciudad del reporte
const cities = {}; const folded = {}; const late = {}; const orphan = {};
for (const [k, n] of Object.entries(FREQ.pares)) {
  const [pv, cv0] = k.split('|'); const cv = CLEAN(cv0);
  if (SECTOR_DE[k]) { if (SECTOR_DE[k] === 'duran' || SECTOR_DE[k] === 'francisco-de-orellana') { (late[SECTOR_DE[k]] = late[SECTOR_DE[k]] || 0); late[SECTOR_DE[k]] += n; continue; } (folded[SECTOR_DE[k]] = folded[SECTOR_DE[k]] || []).push({ name: cap(cv.replace(/\s*\(.*\)/, '')), n }); continue; }
  const prov = PROV(pv);
  const canton = CANT.find((c) => c.prov === prov && (norm(c.seat) === norm(cv) || norm(c.name) === norm(cv)));
  if (!canton) { (orphan[prov] = orphan[prov] || []).push([cv, n]); continue; }
  const nm = norm(cv) === norm(canton.name) ? canton.name : canton.seat; const id = norm(nm).replace(/ /g, '-');
  const c = (cities[id] = cities[id] || { id, name: nm, prov, canton: canton.name, n: 0, alt: canton.alt, pop: canton.seatPop, lat: canton.lat, lon: canton.lon });
  c.n += n;
}
for (const [id, v] of Object.entries(late)) if (cities[id]) cities[id].n += v;
for (const [pv, list] of Object.entries(orphan)) { const top = Object.values(cities).filter((c) => c.prov === pv).sort((a, b) => b.n - a.n)[0]; list.forEach(([nm, n]) => { if (top) { top.n += n; } else console.log('sin ciudad en', pv, nm, n); }); }
for (const [id, list] of Object.entries(folded)) if (cities[id]) cities[id].n += list.reduce((a, b) => a + b.n, 0); else console.log('no hay ciudad destino para', id);

// puntos candidatos de sector: GeoNames (PPLX) y OSM
const geo = fs.readFileSync(path.join(__dirname, 'cache', 'EC.txt'), 'utf8').split('\n').map((l) => l.split('\t')).filter((f) => f[6] === 'P').map((f) => ({ name: f[1], lat: +f[4], lon: +f[5], src: 'gn', cls: f[7] }));
const out = [];
const report = [];
for (const c of Object.values(cities).sort((a, b) => b.n - a.n)) {
  if (c.n < MIN) continue;
  const cfg = CITIESCFG.find((x) => x.id === c.id);
  const R = ((cfg && cfg.radius) || 0.05) * 111.2 * 1.25;
  const cands = geo.filter((g) => km(c.lat, c.lon, g.lat, g.lon) <= R);
  const f = path.join(__dirname, 'cache', `sec-${c.id}.json`);
  let hasOsm = false;
  if (fs.existsSync(f)) {
    hasOsm = true;
    for (const e of JSON.parse(fs.readFileSync(f, 'utf8'))) {
      if (!e.tags || !e.tags.name) continue;
      const lon = e.type === 'node' ? e.lon : e.center && e.center.lon, lat = e.type === 'node' ? e.lat : e.center && e.center.lat;
      if (lon == null || km(c.lat, c.lon, lat, lon) > R) continue;
      cands.push({ name: e.tags.name, lat, lon, src: 'osm', cls: e.tags.place });
    }
  }
  const sectors = []; const used = new Set();
  const add = (name, g, extra = {}) => { const [x, y] = project(g.lon, g.lat); sectors.push({ name, x, y, ...extra }); used.add(norm(name)); };
  const wanted = CUR[c.id];
  const extra = (folded[c.id] || []).reduce((m, s) => { m[norm(s.name)] = s.n; return m; }, {});
  if (wanted) {
    for (const w of wanted) {
      const nw = norm(w);
      const exact = cands.filter((g) => norm(g.name) === nw);
      const loose = cands.filter((g) => norm(g.name).startsWith(nw + ' ') || norm(g.name).endsWith(' ' + nw) || norm(g.name) === 'sector ' + nw);
      const pool = (exact.length ? exact : loose).sort((a, b) => (a.src === 'gn' ? 0 : 1) - (b.src === 'gn' ? 0 : 1) || km(c.lat, c.lon, a.lat, a.lon) - km(c.lat, c.lon, b.lat, b.lon));
      const man = MAN[c.id] && MAN[c.id][w];
      if (!pool.length && man) { add(w, { lat: man[0], lon: man[1] }, extra[nw] ? { n: extra[nw] } : {}); continue; }
      if (!pool.length) { report.push(`${c.name}: sin ubicación para «${w}»`); continue; }
      if (used.has(nw)) continue;
      add(w, pool[0], extra[nw] ? { n: extra[nw] } : {});
    }
  } else {
    // sin lista curada: barrios conocidos, el más cercano al centro primero
    const seen = new Set();
    const pool = cands.filter((g) => /^(PPLX|suburb|quarter|neighbourhood)$/.test(g.cls) && !/(centro comercial|hospital|polic|condominio|mirador|colegio|escuela|universidad|iglesia|cementerio|parque|mall|^cdla|^urb|conjunto|etapa)/i.test(g.name) && g.name.length < 32)
      .sort((a, b) => km(c.lat, c.lon, a.lat, a.lon) - km(c.lat, c.lon, b.lat, b.lon));
    for (const g of pool) { const k = norm(g.name); if (seen.has(k)) continue; seen.add(k); add(g.name, g); if (sectors.length >= 16) break; }
    if (!hasOsm) report.push(`${c.name}: solo GeoNames (aún sin OSM)`);
  }
  for (const s of folded[c.id] || []) if (!used.has(norm(s.name))) report.push(`${c.name}: sector del reporte «${s.name}» (${s.n}) sin ubicar`);
  const [x, y] = project(c.lon, c.lat);
  const d = (cfg && cfg.radius) || 0.04;
  if (sectors.length < 5) sectors.length = 0;
  out.push({ ...c, x, y, view: [+(c.lon - d * 1.05).toFixed(4), +(c.lat - d).toFixed(4), +(c.lon + d * 1.05).toFixed(4), +(c.lat + d).toFixed(4)], sectores: sectors });
}
const provincias = {};
for (const [k, n] of Object.entries(FREQ.provincias)) provincias[PROV(k)] = n;
const js = `/* Generado por tools/build-guia.js — no editar a mano.
   Frecuencias: conteo agregado de asistencias (${FREQ.desde} a ${FREQ.hasta}); no contiene datos de personas.
   Sectores: GeoNames (CC BY 4.0) y © colaboradores de OpenStreetMap (ODbL). Verifique siempre con el mapa de despacho. */
window.EC_GUIA = ${JSON.stringify({ total: FREQ.total, desde: FREQ.desde, hasta: FREQ.hasta, provincias, ciudades: out })};
`;
fs.writeFileSync(path.join(ROOT, 'js', 'guia-data.js'), js);
console.log(out.length, 'ciudades;', out.reduce((a, c) => a + c.sectores.length, 0), 'sectores;', Math.round(js.length / 1024), 'KB');
console.log(report.join('\n'));
