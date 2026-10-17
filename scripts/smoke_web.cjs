// Requires Playwright and system Chromium. This is a startup probe, not a lesson test.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const root = process.env.KALULU_WORKSPACE || '/workspace/kalulu-feasibility';
  const name = process.env.KALULU_PROBE_NAME || 'browser';
  const browser = await chromium.launch({executablePath: '/usr/bin/chromium', headless: true,
    args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader']});
  const page = await browser.newPage({viewport: {width: 1280, height: 900}});
  const events = [];
  page.on('console', m => {
    events.push({kind: 'console', type: m.type(), text: m.text()});
    console.log(m.type() + ': ' + m.text());
  });
  page.on('pageerror', e => events.push({kind: 'pageerror', text: String(e)}));
  page.on('requestfailed', r => events.push({kind: 'requestfailed', url: r.url(), failure: r.failure()}));
  try {
    await page.goto(process.env.KALULU_PROBE_URL || 'http://127.0.0.1:8060/index.html', {waitUntil: 'load', timeout: 120000});
    if (process.env.KALULU_EXPECT_WELCOME === '1') {
      await page.waitForFunction(() => document.querySelector('canvas')?.width > 300, null, {timeout: 120000});
      const deadline = Date.now() + 120000;
      while (!events.some(e => /Welcome: Loaded/.test(e.text || '')) && Date.now() < deadline)
        await page.waitForTimeout(1000);
      if (events.some(e => /Welcome: Loaded/.test(e.text || ''))) {
        await page.waitForTimeout(1000);
        await page.screenshot({path: path.join(root, `logs/${name}-login.png`)});
        await page.mouse.click(790, 130);
        await page.waitForTimeout(1000);
        await page.screenshot({path: path.join(root, `logs/${name}-signup.png`)});
        await page.mouse.click(470, 130);
        await page.waitForTimeout(1000);
        await page.screenshot({path: path.join(root, `logs/${name}-login-return.png`)});
        await page.mouse.click(500, 385);
        await page.waitForTimeout(1000);
        await page.screenshot({path: path.join(root, `logs/${name}-languages.png`)});
        await page.keyboard.press('Escape');
        if (process.env.KALULU_TEST_LOCALE_RELOAD === '1') {
          await page.mouse.click(500, 385);
          await page.keyboard.press('Home');
          for(let i=0;i<4;i++) await page.keyboard.press('ArrowDown');
          await page.keyboard.press('Enter');
          await page.waitForTimeout(3000);
          await page.screenshot({path: path.join(root, `logs/${name}-selected-locale.png`)});
          const offset = events.length;
          events.push({kind:'phase',text:'reload after language selection'});
          await page.reload({waitUntil:'load',timeout:120000});
          const reloadDeadline = Date.now()+120000;
          while(!events.slice(offset).some(e => /Welcome: Loaded/.test(e.text || '')) && Date.now()<reloadDeadline)
            await page.waitForTimeout(1000);
          if(!events.slice(offset).some(e => /Welcome: Loaded/.test(e.text || '')))
            throw new Error('Welcome did not reload after language selection');
          await page.waitForTimeout(1000);
          await page.screenshot({path: path.join(root, `logs/${name}-reloaded.png`)});
        }
      }
    } else {
      await page.waitForTimeout(30000);
    }
    const state = await page.evaluate(() => ({title: document.title, isolated: crossOriginIsolated,
      text: document.body.innerText, canvas: !!document.querySelector('canvas'),
      canvasSize: [document.querySelector('canvas')?.width, document.querySelector('canvas')?.height]}));
    await page.screenshot({path: path.join(root, `logs/${name}.png`)});
    fs.writeFileSync(path.join(root, `logs/${name}.json`), JSON.stringify({state, events}, null, 2));
    console.log(JSON.stringify({state, events}, null, 2));
    if(process.env.KALULU_EXPECT_WELCOME === '1' && !events.some(e => /Welcome: Loaded/.test(e.text || '')))
      process.exitCode = 1;
    if(events.some(e => e.kind === 'pageerror' || /SCRIPT ERROR|Parse Error|GDExtension.*not supported|Failed to load script/.test(e.text || '')))
      process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(e => {console.error(e); process.exitCode = 1;});
