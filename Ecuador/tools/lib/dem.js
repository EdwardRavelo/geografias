// Modelo digital de elevación a partir de teselas Terrarium (AWS Open Data, Mapzen/SRTM/GEBCO).
// Descarga y cachea las teselas z=8 que cubren una caja y ofrece muestreo bilineal.
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const Z = 8;
const N = 2 ** Z;
const CACHE = path.join(__dirname, '..', 'cache', 'tiles');

const lonToX = (lon) => ((lon + 180) / 360) * N;
const latToY = (lat) => {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * N;
};
const xToLon = (x) => (x / N) * 360 - 180;
const yToLat = (y) => {
  const n = Math.PI - (2 * Math.PI * y) / N;
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
};

async function getTile(x, y) {
  const dir = path.join(CACHE, String(Z), String(x));
  const file = path.join(dir, `${y}.png`);
  if (!fs.existsSync(file)) {
    fs.mkdirSync(dir, { recursive: true });
    const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${Z}/${x}/${y}.png`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Tesela ${x}/${y}: HTTP ${res.status}`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  const png = PNG.sync.read(fs.readFileSync(file));
  const el = new Float32Array(256 * 256);
  for (let i = 0; i < 256 * 256; i++) {
    el[i] = png.data[i * 4] * 256 + png.data[i * 4 + 1] + png.data[i * 4 + 2] / 256 - 32768;
  }
  return el;
}

// Carga un mosaico para [lonMin, lonMax] x [latMin, latMax]
async function loadDEM(lonMin, lonMax, latMin, latMax) {
  const x0 = Math.floor(lonToX(lonMin)), x1 = Math.floor(lonToX(lonMax));
  const y0 = Math.floor(latToY(latMax)), y1 = Math.floor(latToY(latMin));
  const W = (x1 - x0 + 1) * 256, H = (y1 - y0 + 1) * 256;
  const grid = new Float32Array(W * H);
  const list = [];
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) list.push([tx, ty]);
  // Descarga con concurrencia limitada (6) para no saturar el servidor
  for (let i = 0; i < list.length; i += 6) {
    await Promise.all(list.slice(i, i + 6).map(async ([tx, ty]) => {
      const t = await getTile(tx, ty);
      for (let j = 0; j < 256; j++) grid.set(t.subarray(j * 256, j * 256 + 256), ((ty - y0) * 256 + j) * W + (tx - x0) * 256);
    }));
  }
  // Muestreo bilineal en lon/lat
  const px0 = x0 * 256, py0 = y0 * 256;
  function at(lon, lat) {
    const fx = lonToX(lon) * 256 - px0 - 0.5;
    const fy = latToY(lat) * 256 - py0 - 0.5;
    const ix = Math.max(0, Math.min(W - 2, Math.floor(fx)));
    const iy = Math.max(0, Math.min(H - 2, Math.floor(fy)));
    const tx = Math.max(0, Math.min(1, fx - ix)), ty = Math.max(0, Math.min(1, fy - iy));
    const a = grid[iy * W + ix], b = grid[iy * W + ix + 1], c = grid[(iy + 1) * W + ix], d = grid[(iy + 1) * W + ix + 1];
    return a * (1 - tx) * (1 - ty) + b * tx * (1 - ty) + c * (1 - tx) * ty + d * tx * ty;
  }
  // Máximo en un radio (grados) alrededor de un punto
  function maxNear(lon, lat, r = 0.04) {
    let m = -1e9;
    for (let dx = -r; dx <= r + 1e-9; dx += 0.004) for (let dy = -r; dy <= r + 1e-9; dy += 0.004) m = Math.max(m, at(lon + dx, lat + dy));
    return m;
  }
  return { at, maxNear };
}

module.exports = { loadDEM, lonToX, latToY, xToLon, yToLat };
