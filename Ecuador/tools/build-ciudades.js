// Construye js/ciudades-data.js: ciudades principales con sectores y puntos de referencia (OpenStreetMap, ODbL).
// Uso:  node tools/build-ciudades.js   (requiere tools/cache/osm-<ciudad>.json y js/cantones-data.js)
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const CITIES = require('./cities.json');
global.window = {};
eval(fs.readFileSync(path.join(ROOT, 'js', 'geo-data.js'), 'utf8').replace('window.EC_GEO', 'global.EC_GEO'));
eval(fs.readFileSync(path.join(ROOT, 'js', 'cantones-data.js'), 'utf8'));
const GEO = global.EC_GEO, CANT = window.EC_CANTONES;
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const P = GEO.proj.main;
const project = (lon, lat) => [Math.round((P.x0 + (lon - P.lonRef) * P.k) * 10) / 10, Math.round((P.y0 + (P.latRef - lat) * P.k) * 10) / 10];
const km = (a, b, c, d) => Math.hypot((a - c) * 111.2, (b - d) * 111.2 * Math.cos((a * Math.PI) / 180));

const TYPES = {
  aeropuerto: { name: 'Aeropuerto', glyph: 'A' }, terminal: { name: 'Terminal terrestre', glyph: 'T' }, hospital: { name: 'Hospital', glyph: 'H' },
  estadio: { name: 'Estadio o coliseo', glyph: 'E' }, comercial: { name: 'Centro comercial', glyph: 'C' }, universidad: { name: 'Universidad', glyph: 'U' },
  peaje: { name: 'Peaje', glyph: 'P' }, lugar: { name: 'Lugar emblemático', glyph: '★' },
};
const ptOf = (e) => (e.type === 'node' ? [e.lon, e.lat] : e.center ? [e.center.lon, e.center.lat] : null);
const isArea = (e) => e.type !== 'node';

function classify(e) {
  const t = e.tags, n = t.name || '';
  if (/aerodrome|terminal/.test(t.aeroway || '') && /aeropuerto|aeródromo|aerodromo/i.test(n) && !/base a[eé]rea/i.test(n)) return 'aeropuerto';
  if (t.amenity === 'bus_station' && /terminal terrestre|terminal terrestre|terminal interprovincial|terminal de buses/i.test(n)) return 'terminal';
  if (t.amenity === 'hospital' && /^(hospital|clínica|clinica)\b/i.test(n) && !/estétic|estetic|odontol|dental|de ojos|psicoter|veterin|cruz roja/i.test(n)) return 'hospital';
  if (t.leisure === 'stadium' && /estadio|coliseo/i.test(n) && !/barrial|liga|cancha|colegio|comit|lumbisi|comuna/i.test(n)) return 'estadio';
  if (t.shop === 'mall' && /centro comercial|mall|shopping|quicentro|city|plaza|paseo/i.test(n) && isArea(e)) return 'comercial';
  if (t.amenity === 'university' && /^(universidad|escuela superior|escuela polit[eé]cnica|pontificia)/i.test(n) && isArea(e)) return 'universidad';
  if (t.barrier === 'toll_booth') return 'peaje';
  if (t.wikidata && (t.tourism || t.leisure === 'park') && norm(n) !== 'quito' && norm(n) !== 'guayaquil' && norm(n) !== 'cuenca') return 'lugar';
  if (t.wikidata && t.amenity === 'place_of_worship' && /catedral|bas[ií]lica|santuario/i.test(n)) return 'lugar';
  if (t.amenity === 'townhall' && /^(municipio|alcald|gobierno aut)/i.test(n)) return 'lugar';
  return null;
}
const LIMIT = { aeropuerto: 2, terminal: 4, hospital: 9, estadio: 6, comercial: 8, universidad: 6, peaje: 4, lugar: 7 };

const out = [];
const report = [];
for (const c of CITIES) {
  const f = path.join(__dirname, 'cache', `osm-${c.id}.json`);
  if (!fs.existsSync(f)) { report.push(`${c.name}: sin datos OSM todavía`); continue; }
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  const [clat, clon] = c.center, R = (c.radius || 0.1) * 111.2 * 1.1;
  const canton = CANT.find((k) => norm(k.seat) === norm(c.name) || norm(k.name) === norm(c.name)) || CANT.find((k) => norm(k.seat).includes(norm(c.name)));
  const byType = {}, sectors = [], seen = new Set();
  for (const e of j.elements) {
    if (!e.tags || !e.tags.name) continue;
    const pt = ptOf(e); if (!pt) continue;
    const [lon, lat] = pt;
    if (km(clat, clon, lat, lon) > R) continue;
    if (/^(suburb|quarter|neighbourhood)$/.test(e.tags.place || '')) { if (!/(centro comercial|hospital|polic[ií]a|hipermercado|condominio|mirador|plaza|colegio|escuela|universidad|iglesia|cementerio|parque|mall)/i.test(e.tags.name)) sectors.push({ name: e.tags.name, rank: { suburb: 0, quarter: 1, neighbourhood: 2 }[e.tags.place], lon, lat, d: km(clat, clon, lat, lon) }); continue; }
    const t = classify(e); if (!t) continue;
    const key = t + '|' + norm(e.tags.name); if (seen.has(key)) continue; seen.add(key);
    (byType[t] = byType[t] || []).push({ name: e.tags.name, lon, lat, wiki: !!e.tags.wikidata, area: isArea(e), d: km(clat, clon, lat, lon), note: e.tags.operator || '' });
  }
  const refs = [];
  for (const [t, list] of Object.entries(byType)) {
    list.sort((a, b) => (b.wiki - a.wiki) || (b.area - a.area) || a.d - b.d);
    list.slice(0, LIMIT[t]).forEach((r, i) => { const [x, y] = project(r.lon, r.lat); refs.push({ id: `${c.id}-${t}-${i + 1}`, type: t, name: r.name, lat: +r.lat.toFixed(5), lon: +r.lon.toFixed(5), x, y, note: r.note }); });
  }
  const seenS = new Set(), sect = [];
  const sub = sectors.filter((x) => x.rank === 0).length >= 12 ? sectors.filter((x) => x.rank === 0) : sectors.filter((x) => x.rank <= 1);
  for (const s of sub.sort((a, b) => a.d - b.d)) { const k = norm(s.name); if (seenS.has(k)) continue; seenS.add(k); const [x, y] = project(s.lon, s.lat); sect.push({ name: s.name, x, y }); }
  const [cx, cy] = project(clon, clat);
  out.push({ id: c.id, name: c.name, prov: canton ? canton.prov : null, canton: canton ? canton.name : null, cantonId: canton ? canton.id : null, lat: clat, lon: clon, x: cx, y: cy, alt: canton ? canton.alt : null, seatPop: canton ? canton.seatPop : null, radius: c.radius || 0.1, view: c.view || null, refs, sectors: sect.slice(0, 40) });
  report.push(`${c.name}: ${refs.length} referencias (${Object.entries(byType).map(([t, l]) => t + ' ' + Math.min(l.length, LIMIT[t])).join(', ')}), ${sect.length} sectores`);
}
fs.writeFileSync(path.join(ROOT, 'js', 'ciudades-data.js'), '/* Generado por tools/build-ciudades.js — no editar a mano.\n   Referencias y sectores: © colaboradores de OpenStreetMap (ODbL). Verifique siempre con el mapa de despacho. */\nwindow.EC_TIPOS = ' + JSON.stringify(TYPES) + ';\nwindow.EC_CIUDADES = ' + JSON.stringify(out) + ';\n');
console.log(report.join('\n'));
