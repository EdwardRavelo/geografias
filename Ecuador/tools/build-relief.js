// Genera el relieve sombreado (assets/relief-main.webp, assets/relief-gal.webp) a partir de teselas Terrarium.
// Uso:  node tools/build-relief.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { loadDEM } = require('./lib/dem.js');

const ROOT = path.join(__dirname, '..');
global.window = {};
eval(fs.readFileSync(path.join(ROOT, 'js', 'geo-data.js'), 'utf8').replace('window.EC_GEO', 'global.EC_GEO'));
const GEO = global.EC_GEO;

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
const clamp01 = (v) => Math.max(0, Math.min(1, v));

// Paleta de la hipsometría (tonos de papel cálido → arcilla → roca clara)
const SEA_DEEP = hex('#b9cac6'), SEA_SHELF = hex('#d6e1da');
const STOPS = [
  [0, hex('#ece4cf')], [400, hex('#e7dcc0')], [1200, hex('#dccaa4')], [2400, hex('#d0b88c')],
  [3500, hex('#c6a77f')], [4400, hex('#cdb99a')], [5400, hex('#e6e0d4')],
];
function landColor(h) {
  for (let i = 1; i < STOPS.length; i++) if (h <= STOPS[i][0]) return mix(STOPS[i - 1][1], STOPS[i][1], clamp01((h - STOPS[i - 1][0]) / (STOPS[i][0] - STOPS[i - 1][0])));
  return STOPS[STOPS.length - 1][1];
}

async function landMask(w, h, vb, body) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vb}"><g fill="#000" stroke="#000" stroke-width="3" stroke-linejoin="round">${body}</g></svg>`;
  const { data, info } = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const m = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) m[i] = data[i * info.channels + 3] > 40 ? 1 : 0;
  return m;
}

async function render(name, bbox, stepDeg, dem, zEx, vb, body) {
  const [lon0, lon1, lat0, lat1] = bbox;
  const w = Math.round((lon1 - lon0) / stepDeg), h = Math.round((lat1 - lat0) / stepDeg);
  const MASK = await landMask(w, h, vb, body);
  const E = new Float32Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { let v = dem.at(lon0 + (i + 0.5) * stepDeg, lat1 - (j + 0.5) * stepDeg); if (MASK[j * w + i] && v < 1) v = 1; else if (!MASK[j * w + i] && v > -1 && v < 40) v = -1; E[j * w + i] = v; }
  // Suavizado ligero para evitar el aspecto "escalonado" del DEM base
  const S = new Float32Array(w * h);
  for (let j = 1; j < h - 1; j++) for (let i = 1; i < w - 1; i++) {
    let s = 0; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) s += E[(j + dj) * w + i + di] * (di === 0 && dj === 0 ? 4 : di === 0 || dj === 0 ? 2 : 1);
    S[j * w + i] = s / 16;
  }
  const cell = stepDeg * 111320; // m por píxel
  const az = (315 * Math.PI) / 180, alt = (38 * Math.PI) / 180;
  const flat = Math.sin(alt);
  const buf = Buffer.alloc(w * h * 3);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const k = j * w + i;
    const e = S[k] === 0 && (i === 0 || j === 0 || i === w - 1 || j === h - 1) ? E[k] : (S[k] || E[k]);
    let col;
    if (e <= 0) {
      const t = clamp01((-e - 20) / 1900); // plataforma continental → océano profundo
      col = mix(SEA_SHELF, SEA_DEEP, Math.pow(t, 0.6));
    } else {
      const g = (a, b) => (a === undefined ? 0 : a);
      const z = (ii, jj) => S[Math.max(0, Math.min(h - 1, jj)) * w + Math.max(0, Math.min(w - 1, ii))] || E[Math.max(0, Math.min(h - 1, jj)) * w + Math.max(0, Math.min(w - 1, ii))];
      const dzdx = ((z(i + 1, j - 1) + 2 * z(i + 1, j) + z(i + 1, j + 1)) - (z(i - 1, j - 1) + 2 * z(i - 1, j) + z(i - 1, j + 1))) / (8 * cell);
      const dzdy = ((z(i - 1, j + 1) + 2 * z(i, j + 1) + z(i + 1, j + 1)) - (z(i - 1, j - 1) + 2 * z(i, j - 1) + z(i + 1, j - 1))) / (8 * cell);
      const sx = dzdx * zEx, sy = dzdy * zEx;
      const slope = Math.atan(Math.hypot(sx, sy));
      const aspect = Math.atan2(sy, -sx);
      let sh = Math.sin(alt) * Math.cos(slope) + Math.cos(alt) * Math.sin(slope) * Math.cos(az - aspect);
      sh = clamp01(sh) / flat; // 1 = terreno plano
      const shade = 0.34 + 0.66 * Math.min(1.12, sh);
      const base = landColor(e);
      col = [base[0] * shade, base[1] * shade, base[2] * shade * 0.985];
    }
    buf[k * 3] = Math.round(col[0]); buf[k * 3 + 1] = Math.round(col[1]); buf[k * 3 + 2] = Math.round(col[2]);
  }
  const file = path.join(ROOT, 'assets', `relief-${name}.webp`);
  await sharp(buf, { raw: { width: w, height: h, channels: 3 } }).webp({ quality: 80, effort: 6 }).toFile(file);
  console.log(name, w + '×' + h, (fs.statSync(file).size / 1024).toFixed(0) + ' KB');
}

(async () => {
  fs.mkdirSync(path.join(ROOT, 'assets'), { recursive: true });
  const main = await loadDEM(-81.7, -74.7, -5.5, 1.9);
  const gal = await loadDEM(-92.1, -89.0, -1.5, 1.8);
  const mainBody = GEO.provinces.filter((p) => !p.inset).map((p) => '<path d="' + p.d + '"/>').join('') + GEO.neighbors.map((n) => '<path d="' + n.d + '"/>').join('');
  const galBody = GEO.islands.map((i) => '<path d="' + i.d + '"/>').join('');
  await render('main', [-81.7, -74.7, -5.5, 1.9], 0.0028, main, 2.6, '480 0 2800 2960', mainBody);
  await render('gal', [-92.1, -89.0, -1.5, 1.8], 0.0027, gal, 2.2, '50 2270 558 594', galBody);

})().catch((e) => { console.error(e); process.exit(1); });
