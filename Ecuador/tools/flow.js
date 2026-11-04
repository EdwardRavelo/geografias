// Prueba de flujos de interacción (smoke test): node tools/serve.js 5191 &  node tools/flow.js
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
  const log = (...a) => console.log(...a);
  const ok = (cond, msg) => { if (!cond) errs.push('FALLO: ' + msg); };

  // Portada
  await go('#/');
  ok((await p.$$('.route li')).length === 7, 'la portada debe listar 7 lecciones');
  ok((await p.$$('.nav a')).length === 5, 'el menú debe tener 5 enlaces');
  log('portada: lecciones', (await p.$$('.route li')).length);

  // Atlas: buscar un cantón y abrir su ficha
  await go('#/atlas');
  await p.type('#q', 'durán'); await sleep(400);
  const hasCanton = await p.$('#plist [data-cid]');
  ok(!!hasCanton, 'la búsqueda debe encontrar el cantón Durán');
  if (hasCanton) { await hasCanton.click(); await sleep(1500); log('atlas cantón:', await p.$eval('#detail h2', (e) => e.textContent), '|', await p.$eval('#detail .grid', (e) => e.textContent.replace(/\s+/g, ' ').slice(0, 90))); }
  await go('#/atlas/azuay'); log('atlas provincia:', await p.$eval('#detail h2', (e) => e.textContent));
  await go('#/atlas/quito'); log('atlas cantón por URL:', await p.$eval('#detail h2', (e) => e.textContent).catch(() => 'sin ficha'));

  // Tabla de cantones
  await go('#/cantones');
  log('cantones:', await p.$$eval('#rows tr', (r) => r.length));
  await p.click('#cd'); await sleep(300);
  log('con cabecera distinta:', await p.$$eval('#rows tr', (r) => r.length));
  ok((await p.$$eval('#rows tr', (r) => r.length)) === 54, 'deben ser 54 cantones con otra cabecera');

  // Ciudades
  await go('#/ciudades/guayaquil');
  log('ciudad:', await p.$eval('#detail h2', (e) => e.textContent), '| marcadores:', await p.$$eval('.ref', (r) => r.length), '| referencias en lista:', await p.$$eval('[data-ref]', (r) => r.length));
  const first = await p.$('[data-ref]'); if (first) { await first.click(); await sleep(900); ok(!!(await p.$('.ref.is-active')), 'debe resaltar el marcador'); }

  // Lecciones
  for (const id of ['posicion', 'regiones', 'relieve', 'agua', 'clima', 'naturaleza', 'direcciones']) {
    await go('#/leccion/' + id);
    const n = (await p.$$('.step')).length;
    ok(n > 0, 'la lección ' + id + ' debe tener pasos');
    log('lección', id, n, 'pasos');
  }
  log(errs.length ? errs.join('\n') : 'sin errores');
  await b.close();
})().catch((e) => { console.error('FALLO', e); process.exit(1); });
