// Standalone real-asset capability test. No account, authentication bypass, or game changes.
const {chromium} = require('playwright');
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
(async () => {
  const root = process.env.KALULU_EXTENSION_WORKSPACE || '/workspace/kalulu-extension-test';
  const browser = await chromium.launch({executablePath:'/usr/bin/chromium', headless:true,
    args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
  const page = await browser.newPage({viewport:{width:800,height:600}});
  const events = [];
  const checks = {};
  page.on('console', m => { events.push({type:m.type(),text:m.text()}); console.log(m.text()); });
  page.on('pageerror', e => events.push({type:'pageerror',text:String(e)}));
  await page.addInitScript(() => {
    window.__audioAnalyzers = [];
    const connect = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (...args) {
      const result = connect.apply(this, args);
      if (args[0] instanceof AudioDestinationNode) {
        const analyzer = this.context.createAnalyser();
        connect.call(this, analyzer);
        window.__audioAnalyzers.push(analyzer);
      }
      return result;
    };
  });
  const has = text => events.some(e => e.text.includes(text));
  async function until(test, timeout=60000) {
    const end = Date.now()+timeout;
    while(!test() && Date.now()<end) {
      assert.ok(!events.some(e => /CAPABILITY_FAIL|SCRIPT ERROR|Parse Error/.test(e.text)), 'Runtime capability failure');
      await page.waitForTimeout(100);
    }
    assert.ok(test(), 'Expected capability result within timeout');
  }
  try {
    await page.goto('http://127.0.0.1:8060/probe/index.html',{waitUntil:'load',timeout:60000});
    await until(() => has('CAPABILITY_READY'));
    assert.ok(has('CAPABILITY_STORAGE_PREVIOUS: false'));
    assert.ok(has('CAPABILITY_SQLITE_PASS'));
    assert.ok(has('CAPABILITY_MP3_DECODE_PASS'));
    checks.frenchDatabaseAndMp3 = true;
    await page.mouse.click(300,140);
    await until(() => has('CAPABILITY_AUDIO_STARTED'),10000);
    await page.waitForFunction(() => window.__audioAnalyzers.some(a => {
      const data = new Float32Array(a.fftSize);
      a.getFloatTimeDomainData(data);
      return data.some(value => Math.abs(value)>0.00001);
    }), null, {timeout:10000});
    checks.nonzeroWebAudioOutput = true;
    await until(() => has('CAPABILITY_AUDIO_FINISHED'),10000);
    checks.audioPlaybackCompleted = true;
    // Let Godot's asynchronous IndexedDB filesystem sync run before reloading.
    await page.waitForTimeout(3000);
    await page.screenshot({path:path.join(root,'logs/capabilities.png')});
    events.push({type:'phase',text:'reload'});
    await page.reload({waitUntil:'load',timeout:60000});
    await until(() => events.slice(events.findIndex(e => e.type==='phase')+1).some(e => e.text.includes('CAPABILITY_READY')));
    assert.ok(has('CAPABILITY_STORAGE_PREVIOUS: true'));
    checks.filesAndSqliteSurviveReload = true;
    assert.ok(!events.some(e => e.type==='pageerror' || /CAPABILITY_FAIL|SCRIPT ERROR|Parse Error/.test(e.text)));
    checks.noRuntimeErrors = true;
    console.log('CAPABILITY_SUITE_PASS',checks);
  } catch(error) {
    checks.failure = String(error);
    process.exitCode = 1;
    console.error(error);
  } finally {
    fs.writeFileSync(path.join(root,'logs/capabilities.json'),JSON.stringify({checks,events},null,2));
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
