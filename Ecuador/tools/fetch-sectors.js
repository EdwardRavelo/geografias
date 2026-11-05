// Descarga de OpenStreetMap solo los barrios/sectores (place=suburb|quarter|neighbourhood) de cada ciudad.
// Consulta liviana (a diferencia de fetch-osm.js). Uso: node tools/fetch-sectors.js → tools/cache/sec-<id>.json
const fs = require('fs');
const path = require('path');
const CITIES = require('./cities-sectores.json');
const OUT = path.join(__dirname, 'cache');
fs.mkdirSync(OUT, { recursive: true });
const SERVERS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (b) => `[out:json][timeout:60];(nwr["place"~"^(suburb|quarter|neighbourhood|village|hamlet)$"]["name"](${b}););out center tags;`;

(async () => {
  for (const c of CITIES) {
    const file = path.join(OUT, `sec-${c.id}.json`);
    if (fs.existsSync(file) && fs.statSync(file).size > 50) { console.log(c.id, 'ya descargada'); continue; }
    const [lat, lon] = c.center, d = c.radius;
    const bbox = [lat - d, lon - d * 1.05, lat + d, lon + d * 1.05].map((v) => v.toFixed(4)).join(',');
    let ok = false;
    for (let i = 0; i < 9 && !ok; i++) {
      try {
        const res = await fetch(SERVERS[i % SERVERS.length], { method: 'POST', headers: { 'User-Agent': 'AtlasDeCampo-Educational/1.0', 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body: 'data=' + encodeURIComponent(q(bbox)), signal: AbortSignal.timeout(70000) });
        const j = JSON.parse(await res.text());
        fs.writeFileSync(file, JSON.stringify(j.elements));
        console.log(c.id, j.elements.length, 'elementos');
        ok = true;
      } catch (e) { console.log(c.id, 'reintento', i + 1, String(e.message).slice(0, 50)); await sleep(4000); }
    }
    await sleep(1500);
  }
})();
