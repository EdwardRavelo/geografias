// Descarga de OpenStreetMap (Overpass) los puntos de referencia de las ciudades principales.
// Uso:  node tools/fetch-osm.js   → tools/cache/osm-<ciudad>.json (reintenta con pausas si el servidor está ocupado)
const fs = require('fs');
const path = require('path');
const CITIES = require('./cities.json');
const OUT = path.join(__dirname, 'cache');
const SERVERS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const query = (b) => `[out:json][timeout:90];
(
  nwr["aeroway"~"aerodrome|terminal"]["name"](${b});
  nwr["amenity"="bus_station"]["name"](${b});
  nwr["amenity"="hospital"]["name"](${b});
  nwr["amenity"="university"]["name"](${b});
  nwr["amenity"="townhall"]["name"](${b});
  nwr["leisure"="stadium"]["name"](${b});
  nwr["shop"="mall"]["name"](${b});
  nwr["barrier"="toll_booth"]["name"](${b});
  nwr["railway"="station"]["name"](${b});
  nwr["place"~"^(suburb|quarter|neighbourhood)$"]["name"](${b});
  nwr["tourism"~"^(attraction|museum)$"]["name"]["wikidata"](${b});
  nwr["leisure"="park"]["name"]["wikidata"](${b});
  nwr["amenity"="place_of_worship"]["name"]["wikidata"](${b});
);
out center tags;`;

(async () => {
  for (const c of CITIES) {
    const file = path.join(OUT, `osm-${c.id}.json`);
    if (fs.existsSync(file) && fs.statSync(file).size > 500) { console.log(c.id, 'ya descargada'); continue; }
    const [lat, lon] = c.center, d = c.radius || 0.11;
    const bbox = [lat - d, lon - d * 1.05, lat + d, lon + d * 1.05].map((v) => v.toFixed(4)).join(',');
    let ok = false;
    for (let attempt = 0; attempt < 12 && !ok; attempt++) {
      const url = SERVERS[attempt % SERVERS.length];
      try {
        const res = await fetch(url, { method: 'POST', headers: { 'User-Agent': 'AtlasDeCampo-Educational/1.0', 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body: 'data=' + encodeURIComponent(query(bbox)), signal: AbortSignal.timeout(110000) });
        const txt = await res.text();
        const j = JSON.parse(txt);
        fs.writeFileSync(file, JSON.stringify(j));
        console.log(c.id, j.elements.length, 'elementos');
        ok = true;
      } catch (e) { await sleep(8000 + attempt * 4000); }
    }
    if (!ok) console.log(c.id, 'FALLÓ');
    await sleep(3000);
  }
})();
