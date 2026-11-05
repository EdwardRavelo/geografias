// Construye js/clinicas-data.js: clínicas dentales por provincia, ciudad y zona, con ubicación aproximada.
// Entradas: tools/data/clinicas.json (nombre, dirección, ciudad y zona del listado de proveedores; sin teléfonos ni prioridades),
//           js/guia-data.js (coordenadas de sectores), js/cantones-data.js (cabeceras), js/geo-data.js (proyección).
// La ubicación NO sale de la dirección exacta: es el sector o la cabecera más cercana, con un pequeño desplazamiento si coinciden.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const DATA = require('./data/clinicas.json');
global.window = {};
eval(fs.readFileSync(path.join(ROOT, 'js', 'geo-data.js'), 'utf8').replace('window.EC_GEO', 'global.EC_GEO'));
eval(fs.readFileSync(path.join(ROOT, 'js', 'cantones-data.js'), 'utf8'));
eval(fs.readFileSync(path.join(ROOT, 'js', 'guia-data.js'), 'utf8'));
const GEO = global.EC_GEO, CANT = window.EC_CANTONES, GUIA = window.EC_GUIA;
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const P = GEO.proj.main;
const project = (lat, lon) => [Math.round((P.x0 + (lon - P.lonRef) * P.k) * 10) / 10, Math.round((P.y0 + (P.latRef - lat) * P.k) * 10) / 10];
const SMALL = /^(De|Del|La|Las|Los|Y|E|En)$/;
const UP = /^(Rx|Ok|Bs|As|Go|G&o|St)$/i;
const tc = (s) => s.toLowerCase().replace(/(^|[\s(\-\/´'])(\S+)/g, (m, a, b) => a + b.charAt(0).toUpperCase() + b.slice(1)).replace(/\S+/g, (w) => (SMALL.test(w) && true ? w.toLowerCase() : UP.test(w) ? w.toUpperCase() : w)).replace(/^./, (c) => c.toUpperCase());

// Anclas aproximadas: nombre de la clínica (normalizado, por prefijo) → sector de la ciudad o [lat, lon].
const ANCLAS = {
  quito: {
    'titanium': 'La Floresta', 'prevedent norte': 'Cotocollao', 'rehabilitame': 'Jipijapa', 'zavdent norte': 'Comité del Pueblo', 'akrodent': 'La Mariscal',
    'dra carmen flores': 'La Mariscal', 'global smile alemania': 'Iñaquito', 'lexxa': 'Iñaquito', 'dental be': 'Iñaquito', 'global smile real': 'Cotocollao',
    'sanest': 'Calderón', 'optident': 'Rumipamba', 'pro boca rio coca': 'Kennedy', 'yessalud': 'Rumipamba',
    'pro boca villaflora': 'Villaflora', 'prevedent sur': 'Villaflora', 'multident': 'Chilibulo', 'pro boca solanda': 'Solanda', 'prevedent by axxis': [-0.2527, -78.5238], 'kronos dental': 'Solanda',
    'zavdent centro': 'Centro Histórico',
    'novadental tumbaco': 'Tumbaco', 'eva dental': 'Cumbayá', 'novadental puembo': 'Puembo',
    'odontopanoramic': [-0.3030, -78.4470], 'centrodent': [-0.3150, -78.4560], 'pro boca san rafael': [-0.3180, -78.4530], 'zavdent valle': [-0.3126, -78.4417], 'pro boca conocoto': 'Conocoto',
    'kronos': [-0.5100, -78.5680], 'dental area': [0.0430, -78.1450], 'idental cayambe': [0.0425, -78.1440], 'tutti dent': [-0.0560, -78.3180],
  },
  guayaquil: {
    'metrosonrisas': 'Kennedy Norte', 'g o dental': 'Samanes', 'st dental': 'Samanes', 'dental ok norte': 'Garzota', 'odontosmile': 'Alborada',
    'estetica dental centenario': [-2.2250, -79.8960], 'estetica dental sur': [-2.2330, -79.9010], 'metropolitan': 'Centro',
    'dental ok duran': [-2.1700, -79.8300],
  },
  cuenca: {
    'inmola': [-2.8880, -78.9990], 'odontoart principal': [-2.9050, -79.0070], 'odontoart herrerias': 'El Vergel', 'as dental': 'Totoracocha',
    'dr santiago barzallo': [-2.9040, -79.0190], 'odontopro': [-2.8840, -79.0100], 'centro norte santodonto': [-2.8890, -79.0170],
    'odontoclinic': [-2.8940, -79.0130], 'bs implants': [-2.8870, -79.0050],
  },
};
// Barrio de cada clínica cuando el ancla es una coordenada. Si el ancla es un sector, ese sector es el barrio.
const BARRIOS = {
  quito: { 'kronos dental': 'Solanda', 'prevedent by axxis': 'El Recreo', 'odontopanoramic': 'El Triángulo', 'centrodent': 'San Rafael', 'pro boca san rafael': 'San Rafael', 'zavdent valle': 'Capelo', 'kronos': 'Machachi', 'dental area': 'Cayambe', 'idental cayambe': 'Cayambe', 'tutti dent': 'Guayllabamba', 'zavdent norte': 'San Carlos', 'global smile real': 'Rumiñahui' },
  guayaquil: { 'estetica dental centenario': 'Centenario', 'estetica dental sur': 'Sur (10ma y Cuenca)', 'dental ok duran': 'Primavera 1', 'odontosmile': 'Los Álamos' },
  cuenca: { 'inmola': 'Coliseo Gilberto Gatto', 'odontoart principal': 'González Suárez', 'dr santiago barzallo': 'Av. Loja', 'odontopro': 'Paucarbamba', 'centro norte santodonto': 'Av. de las Américas', 'odontoclinic': 'Monte Sinaí', 'bs implants': 'Av. 10 de Agosto' },
};
const barrioDeDireccion = (d) => {
  const t = d.replace(/\s+/g, ' ');
  let m = t.match(/barrio\s+([A-Za-zÁÉÍÓÚÑáéíóúñ ]+?)(?=\s+(?:calle|av\b|avenida|entre)|[,.]|$)/i); if (m) return m[1].trim();
  m = t.match(/urb\.?\s+([A-Za-zÁÉÍÓÚÑáéíóúñ ]+?)(?=\s+(?:pasaje|calle|av\b|avenida)|[,.]|$)/i); if (m) return m[1].trim();
  m = t.match(/sector\s+([A-Za-zÁÉÍÓÚÑáéíóúñ ]+?)(?=[,.:]|$)/i); if (m) return m[1].trim();
  return 'Centro';
};
// Zonas de Cuenca según la etiqueta que trae el nombre en el listado
const ZONA_CUENCA = { 'inmola': 'Norte', 'bs implants': 'Norte', 'odontopro': 'Centro norte', 'centro norte santodonto': 'Centro norte', 'odontoart herrerias': 'Centro', 'odontoclinic': 'Centro', 'odontoart principal': 'Centro sur' };

const PROV = { 'ESMERALDA': 'esmeraldas', 'DOMINGO DE LOS TSACHILAS': 'santo-domingo', 'ZAMORA': 'zamora-chinchipe', 'MANABÍ': 'manabi' };
const provId = (s) => PROV[s] || norm(s).replace(/ /g, '-');
const CITY = { 'EL COCA': 'El Coca', 'ESMERALDA': 'Esmeraldas', 'PELILEO': 'Pelileo', 'PUYO': 'Puyo' };
const ZONA_NOMBRE = { 'VALLES DE  TUMBACO, CUMBAYA Y PUEMBO': 'Valles de Tumbaco, Cumbayá y Puembo', 'VALLES DE LOS CHILLOS/ SAN RAFAEL': 'Valles de los Chillos y San Rafael', 'NORTE': 'Norte', 'SUR': 'Sur', 'CENTRO': 'Centro', 'MACHACHI': 'Machachi', 'CAYAMBE': 'Cayambe', 'GUAYLLABAMBA': 'Guayllabamba', 'DURÁN': 'Durán', 'MILAGRO': 'Milagro' };
const NAME_FIX = { 'prevedent by axxis': 'Prevedent by Axxis' };

const POLYS = require('./lib/poligonos.js')(project, path.join(__dirname, 'cache'), { quito: 'Quito', guayaquil: 'Guayaquil', cuenca: 'Cuenca' });
const places = {};
const used = {};
const log = [];
for (const c of DATA) {
  const pid = provId(c.prov);
  const guayas = pid === 'guayas', quito = c.city === 'QUITO';
  const placeId = quito ? 'quito' : guayas ? 'guayaquil' : norm(CITY[c.city] || c.city).replace(/ /g, '-');
  const placeName = quito ? 'Quito' : guayas ? 'Guayaquil' : tc(CITY[c.city] || c.city);
  const place = (places[placeId] = places[placeId] || { id: placeId, name: placeName, prov: pid, zonas: {} });
  let zona = c.zone ? ZONA_NOMBRE[c.zone] || tc(c.zone) : 'Todas las clínicas';
  const nname = norm(c.name.replace(/,$/, ''));
  if (placeId === 'cuenca') { const k = Object.keys(ZONA_CUENCA).find((z) => nname.startsWith(z)); zona = k ? ZONA_CUENCA[k] : 'Sin zona indicada'; }
  // posición aproximada
  let lat, lon, via;
  const anclas = ANCLAS[placeId] || {};
  const key = Object.keys(anclas).sort((a, b) => b.length - a.length).find((k) => nname.startsWith(k));
  let xy = null;
  if (key) {
    const a = anclas[key];
    if (Array.isArray(a)) xy = project(a[0], a[1]);
    else { const g = GUIA.ciudades.find((x) => x.id === placeId); const s = g && g.sectores.find((q) => norm(q.name) === norm(a)); if (s) xy = [s.x, s.y]; else log.push(`sector no encontrado: ${a} (${c.name})`); }
  }
  if (!xy) {
    const canton = CANT.find((k) => k.prov === pid && (norm(k.seat) === norm(CITY[c.city] || c.city) || norm(k.name) === norm(CITY[c.city] || c.city)));
    if (!canton) { log.push(`sin ubicación: ${c.name} (${c.city})`); continue; }
    xy = project(canton.lat, canton.lon);
  }
  // si varias clínicas caen en el mismo punto, se separan ~200 m en círculo para que se vean todas
  const gk = Math.round(xy[0]) + ',' + Math.round(xy[1]);
  const n = (used[gk] = (used[gk] || 0) + 1) - 1;
  if (n > 0) { const ang = (n - 1) * 2.2 + 0.6, r = 0.8 + 0.5 * Math.floor((n - 1) / 6); xy = [Math.round((xy[0] + Math.cos(ang) * r) * 10) / 10, Math.round((xy[1] + Math.sin(ang) * r) * 10) / 10]; }
  const anc = key ? anclas[key] : null;
  const bk = BARRIOS[placeId] && Object.keys(BARRIOS[placeId]).sort((a, c2) => c2.length - a.length).find((k) => nname.startsWith(k));
  let barrio = bk ? BARRIOS[placeId][bk] : typeof anc === 'string' ? anc : null;
  if (!barrio) barrio = tc(barrioDeDireccion(c.dir));
  let pg = null;
  const polys = POLYS[placeId];
  if (polys) {
    const hits = polys.filter((p) => POLYS.pip(xy, p.rings)).sort((a, b) => b.level - a.level);
    if (hits.length) { pg = hits[0].id; barrio = hits[0].name; }
  }
  const z = (place.zonas[zona] = place.zonas[zona] || []);
  const name = NAME_FIX[nname] || tc(c.name.replace(/,$/, '').replace(/^\((.*)\)$/, '$1').replace(/\(bco /i, '(Banco ')).replace(/Pro-boca/, 'Pro-Boca').replace(/Estetica/, 'Estética').replace(/Odontologicas/, 'Odontológicas').replace(/Herrerias/, 'Herrerías');
  z.push({ id: placeId + '-' + (z.length + Object.values(place.zonas).reduce((a, l) => a + l.length, 0)), name, barrio, pg, dir: c.dir.replace(/\s+\*+.*$/, ''), x: xy[0], y: xy[1] });
}
const ORDER = ['Norte', 'Centro norte', 'Centro', 'Centro sur', 'Sur'];
const lugares = Object.values(places).map((p) => ({
  id: p.id, name: p.name, prov: p.prov,
  areas: (() => {
    const polys = POLYS[p.id]; if (!polys) return undefined;
    const hot = new Set(Object.values(p.zonas).flat().map((c) => c.pg).filter(Boolean));
    return polys.filter((q) => q.level === 9 || hot.has(q.id)).map((q) => ({ id: q.id, name: q.name, hot: hot.has(q.id), d: q.d }));
  })(),
  barrios: (() => { const m = {}; Object.values(p.zonas).flat().forEach((c) => { (m[c.barrio] = m[c.barrio] || []).push(c); }); const polys = POLYS[p.id] || []; return Object.entries(m).map(([name, l]) => { const q = l[0].pg && polys.find((z) => z.id === l[0].pg); return q ? { name, pg: q.id, x: q.cx, y: q.cy } : { name, x: Math.round((l.reduce((a, c) => a + c.x, 0) / l.length) * 10) / 10, y: Math.round((l.reduce((a, c) => a + c.y, 0) / l.length) * 10) / 10 + 2.2 }; }); })(),
  zonas: Object.entries(p.zonas).map(([name, clinicas]) => ({ name, clinicas })).sort((a, b) => { const ia = ORDER.indexOf(a.name), ib = ORDER.indexOf(b.name); return (ia < 0 ? 9 : ia) - (ib < 0 ? 9 : ib); }),
})).sort((a, b) => b.zonas.reduce((s, z) => s + z.clinicas.length, 0) - a.zonas.reduce((s, z) => s + z.clinicas.length, 0));
let ids = 0; lugares.forEach((l) => l.zonas.forEach((z) => z.clinicas.forEach((c) => { c.id = 'c' + ++ids; })));
const js = `/* Generado por tools/build-clinicas.js — no editar a mano.
   Clínicas del listado de proveedores dentales (nombre, dirección y zona). La ubicación en el mapa es APROXIMADA (sector o cabecera). */
window.EC_CLINICAS = ${JSON.stringify({ total: ids, lugares })};
`;
fs.writeFileSync(path.join(ROOT, 'js', 'clinicas-data.js'), js);
console.log(ids, 'clínicas en', lugares.length, 'ciudades;', Math.round(js.length / 1024), 'KB');
console.log(log.join('\n') || 'sin avisos');
