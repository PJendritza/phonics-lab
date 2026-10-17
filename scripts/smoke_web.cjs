// Requires Playwright and system Chromium. This is a startup probe, not a lesson test.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const root = process.env.KALULU_WORKSPACE || '/workspace/kalulu-feasibility';
  const browser = await chromium.launch({executablePath: '/usr/bin/chromium', headless: true,
    args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader']});
  const page = await browser.newPage({viewport: {width: 1280, height: 900}});
  const events = [];
  page.on('console', m => events.push({kind: 'console', type: m.type(), text: m.text()}));
  page.on('pageerror', e => events.push({kind: 'pageerror', text: String(e)}));
  page.on('requestfailed', r => events.push({kind: 'requestfailed', url: r.url(), failure: r.failure()}));
  try {
    await page.goto('http://127.0.0.1:8060/index.html', {waitUntil: 'load', timeout: 120000});
    await page.waitForTimeout(30000);
    const state = await page.evaluate(() => ({title: document.title, isolated: crossOriginIsolated,
      text: document.body.innerText, canvas: !!document.querySelector('canvas'),
      canvasSize: [document.querySelector('canvas')?.width, document.querySelector('canvas')?.height]}));
    await page.screenshot({path: path.join(root, 'logs/browser.png')});
    fs.writeFileSync(path.join(root, 'logs/browser.json'), JSON.stringify({state, events}, null, 2));
    console.log(JSON.stringify({state, events}, null, 2));
    if(events.some(e => e.kind === 'pageerror' || /SCRIPT ERROR|Parse Error|GDExtension.*not supported|Failed to load script/.test(e.text || '')))
      process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(e => {console.error(e); process.exitCode = 1;});
