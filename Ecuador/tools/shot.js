// Captura de verificación: node tools/shot.js <hash> <salida.png> [ancho] [alto] [scrollY] [jsAntes]
const puppeteer = require('puppeteer-core');
(async () => {
  const [hash, out, w = 1440, h = 900, sy = 0, js = ''] = process.argv.slice(2);
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  const errs = [];
  p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errs.push(m.type() + ': ' + m.text()); });
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  await p.setViewport({ width: +w, height: +h, deviceScaleFactor: 1 });
  await p.goto('http://localhost:5191/' + hash, { waitUntil: 'load' });
  await new Promise((r) => setTimeout(r, 1500));
  if (js) { const r = await p.evaluate(js); if (r !== undefined) console.log('eval:', JSON.stringify(r)); await new Promise((r) => setTimeout(r, 1800)); }
  if (+sy) { await p.evaluate((y) => window.scrollTo(0, y), +sy); await new Promise((r) => setTimeout(r, 1500)); }
  await p.screenshot({ path: out });
  console.log(errs.length ? errs.join('\n') : 'sin errores de consola');
  await b.close();
})();
