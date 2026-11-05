// Prueba de flujos (smoke test): node tools/serve.js 5191 &  node tools/flow.js
const puppeteer = require('puppeteer-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  p.on('requestfailed', (r) => errs.push('fallo de red: ' + r.url()));
  await p.setViewport({ width: 1440, height: 900 });
  const go = async (h) => { await p.goto('http://localhost:5191/' + h, { waitUntil: 'load' }); await sleep(1200); };
  const ok = (cond, msg) => { if (!cond) errs.push('FALLO: ' + msg); };

  await go('#/');
  ok((await p.$$('.nav a')).length === 3, 'el menú debe tener exactamente 3 secciones');
  ok((await p.$$('.route li')).length === 3, 'el inicio debe listar 3 pasos');

  await go('#/provincias');
  ok((await p.$$('#plist button')).length === 24, 'deben listarse 24 provincias');
  await p.type('#q', 'azuay'); await sleep(300);
  await p.click('#plist button'); await sleep(1200);
  ok((await p.$eval('#detail h2', (e) => e.textContent)) === 'Azuay', 'debe abrir la ficha de Azuay');
  await go('#/provincias/pichincha');
  console.log('provincia:', await p.$eval('#detail h2', (e) => e.textContent), '| ciudades:', await p.$$eval('#detail .rowlink', (r) => r.length));

  await go('#/ciudades');
  const nCities = (await p.$$('#clist button')).length;
  ok(nCities >= 20, 'deben listarse las ciudades frecuentes');
  await go('#/ciudades/guayaquil');
  ok((await p.$eval('#detail h2', (e) => e.textContent)) === 'Guayaquil', 'debe abrir Guayaquil');
  console.log('ciudades:', nCities);

  await go('#/sectores/quito');
  ok((await p.$$('.zone')).length === 8, 'Quito debe tener 8 zonas');
  ok((await p.$$('.ref')).length === 33, 'Quito debe mostrar sus 33 clínicas');
  await p.click('.zone:nth-child(3) .zhead'); await sleep(900);
  ok((await p.$$('.ref')).length === 33, 'el mapa conserva todas las clínicas de la ciudad');
  await p.click('.zone.is-open .clist2 li:not(.barrio) button'); await sleep(900);
  ok(!!(await p.$('.ref.is-active')), 'debe resaltar la clínica');
  await go('#/sectores/guayaquil'); ok((await p.$$('.zone')).length === 5, 'Guayaquil debe tener 5 zonas');
  await go('#/sectores/cuenca'); ok((await p.$$('.zone')).length === 5, 'Cuenca debe tener 5 zonas');

  await go('#/atlas');
  ok((await p.evaluate(() => location.hash)) === '#/provincias', 'las rutas antiguas deben redirigir');
  console.log(errs.length ? errs.join('\n') : 'sin errores');
  await b.close();
})().catch((e) => { console.error('FALLO', e); process.exit(1); });
