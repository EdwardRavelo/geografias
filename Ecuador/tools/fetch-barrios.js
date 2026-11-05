// Descarga de OpenStreetMap los límites (polígonos) de parroquias urbanas y barrios de cada ciudad.
// Uso: node tools/fetch-barrios.js → tools/cache/bar-<ciudad>.json   (Overpass; reintenta si el servidor está ocupado)
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'cache');
fs.mkdirSync(OUT, { recursive: true });
const CITIES = [
  { id: 'quito', bbox: [-0.36, -78.60, -0.04, -78.38] },
  { id: 'guayaquil', bbox: [-2.31, -80.03, -2.04, -79.78] },
  { id: 'cuenca', bbox: [-2.96, -79.08, -2.84, -78.93] },
];
const SERVERS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (b) => `[out:json][timeout:120];(rel["boundary"="administrative"]["admin_level"~"^(9|10)$"](${b.join(',')}););out geom;`;
(async () => {
  for (const c of CITIES) {
    const file = path.join(OUT, `bar-${c.id}.json`);
    if (!process.env.FORCE && fs.existsSync(file) && fs.statSync(file).size > 60000) { console.log(c.id, 'ya descargada'); continue; }
    let ok = false;
    for (let i = 0; i < 12 && !ok; i++) {
      try {
        const res = await fetch(SERVERS[i % SERVERS.length], { method: 'POST', headers: { 'User-Agent': 'AtlasDeCampo-Educational/1.0', 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body: 'data=' + encodeURIComponent(q(c.bbox)), signal: AbortSignal.timeout(130000) });
        const j = JSON.parse(await res.text());
        fs.writeFileSync(file, JSON.stringify(j.elements));
        console.log(c.id, j.elements.length, 'relaciones');
        ok = true;
      } catch (e) { console.log(c.id, 'reintento', i + 1, String(e.message).slice(0, 50)); await sleep(4000); }
    }
  }
})();
