// Prueba de flujos de interacción (smoke test): node tools/flow.js
const puppeteer = require('puppeteer-core');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await p.setViewport({ width: 1440, height: 900 });
  const go = async (h) => {
    await p.goto('http://localhost:5191/' + h, { waitUntil: 'load' });
    await p.evaluate(() => { localStorage.removeItem('ec-atlas-v1'); });
    await p.reload({ waitUntil: 'load' });
    await sleep(900);
  };
  const log = (...a) => console.log(...a);
  const clickProv = (id) => p.evaluate((t) => document.querySelector('.hit[data-id="' + t + '"]').dispatchEvent(new MouseEvent('click', { bubbles: true })), id);

  // 1. Juego de provincias: un acierto y un fallo
  await go('#/practica/provincias');
  await p.click('#go'); await sleep(700);
  for (let k = 0; k < 2; k++) {
    const name = await p.$eval('.prompt', (e) => e.textContent.replace('Haz clic en el mapa', '').trim());
    const id = await p.evaluate((n) => Object.values(EC.PROVS).find((x) => x.name === n).id, name);
    await clickProv(k === 0 ? id : id === 'azuay' ? 'loja' : 'azuay');
    await sleep(200);
    log('juego', k, name, '->', await p.$eval('#fb', (e) => e.textContent.trim().slice(0, 70)));
    await p.click('#next'); await sleep(900);
  }
  // 2. Capitales
  await go('#/practica/capitales'); await p.click('#go'); await sleep(800);
  await p.click('.opt'); await sleep(200);
  log('capitales', await p.$eval('#fb', (e) => e.textContent.trim().slice(0, 80)));
  // 3. Lección con comprobación
  await go('#/leccion/posicion'); await sleep(500);
  for (let k = 0; k < 3; k++) { const qs = await p.$$('#qs .q'); const o = await qs[k].$('.opt'); await o.click(); await sleep(150); }
  log('leccion', await p.$eval('.check-foot', (e) => e.textContent.trim().replace(/\s+/g, ' ')), '| progreso:', await p.$eval('#progress .txt', (e) => e.textContent));
  // 4. Evaluación completa
  await go('#/evaluacion'); await p.click('#go'); await sleep(500);
  for (let i = 0; i < 20; i++) {
    const isMap = await p.$('.exam-q-map');
    if (isMap) { await sleep(500); await clickProv('azuay'); } else { await p.click('.opt'); }
    await sleep(150); await p.click('#next'); await sleep(250);
  }
  log('examen', await p.$eval('.result', (e) => e.textContent.replace(/\s+/g, ' ').slice(0, 120)));
  await p.screenshot({ path: 'tools/cache/s-exam.png' });
  // 5. Atlas: búsqueda y selección
  await go('#/atlas'); await p.type('#q', 'cuen'); await sleep(200);
  await p.click('#plist button'); await sleep(1200);
  log('atlas', await p.$eval('#detail h2', (e) => e.textContent), await p.$$eval('#plist button', (x) => x.length));
  log(errs.length ? errs.join('\n') : 'sin errores');
  await b.close();
})().catch((e) => { console.error('FALLO', e); process.exit(1); });
