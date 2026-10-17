// Original frog gameplay through physical screenshot-guided browser inputs only.
const {chromium} = require('playwright');
const fs = require('fs');
const path = require('path');
const {createHash} = require('crypto');
const {execFileSync} = require('child_process');
const assert = require('assert/strict');

const root = process.env.KALULU_GERMAN_WORKSPACE || '/workspace/kalulu-german-demo';
const base = process.env.KALULU_GERMAN_URL || 'http://127.0.0.1:8061/';
const lesson = Number(process.env.KALULU_GERMAN_LESSON || 1);
const touch = process.env.KALULU_GERMAN_TOUCH === '1';
assert.ok(Number.isInteger(lesson) && lesson >= 1 && lesson <= 6);
const name = `german-frog-lesson-${lesson}${touch ? '-touch' : ''}`;
const logs = path.join(root, 'logs');
fs.mkdirSync(logs, {recursive:true});
const events = [], requests = [], failedRequests = [], inputs = [], checks = {};
const localArtifactHashes = {};
for (const file of ['play.pck','play.wasm','play.side.wasm','libgdsqlite.web.template_release.wasm32.nothreads.wasm']) {
  const artifact = path.join(root,'web',file);
  if (fs.existsSync(artifact)) localArtifactHashes[file] = createHash('sha256').update(fs.readFileSync(artifact)).digest('hex');
}
const has = text => events.some(event => event.text.includes(text));
const runtimeError = () => events.find(event => event.type === 'pageerror' ||
  /^ERROR:|SCRIPT ERROR:|GERMAN: database could not open/.test(event.text));

function ocrWords(file) {
  const tsv = execFileSync('tesseract', [file, 'stdout', '--psm', '6', 'tsv'],
    {encoding:'utf8',stdio:['ignore','pipe','ignore'],env:{...process.env,OMP_THREAD_LIMIT:'1'}});
  return tsv.trim().split('\n').slice(1).map(line => {
    const columns = line.split('\t');
    return {text:columns.slice(11).join('\t'),x:Number(columns[6]),y:Number(columns[7]),
      width:Number(columns[8]),height:Number(columns[9]),confidence:Number(columns[10])};
  }).filter(word => word.text && word.confidence >= 0);
}

(async () => {
  const browser = await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,
    args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
  const context = await browser.newContext(touch ?
    {viewport:{width:1280,height:900},deviceScaleFactor:1,isMobile:true,hasTouch:true} :
    {viewport:{width:1280,height:900}});
  const page = await context.newPage();
  page.on('console', message => {
    events.push({type:message.type(),text:message.text(),time:Date.now()});
    if (/GERMAN_|BaseMinigame:|Playing Word|ERROR/.test(message.text())) console.log(message.text());
  });
  page.on('pageerror',error => events.push({type:'pageerror',text:String(error),time:Date.now()}));
  page.on('request',request => requests.push(request.url()));
  page.on('requestfailed',request => failedRequests.push({url:request.url(),error:request.failure()}));
  await page.addInitScript(() => {
    window.__frogAudio = {peak:0,samples:0};
    const connect = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function(...args) {
      const result = connect.apply(this,args);
      if (args[0] instanceof AudioDestinationNode) {
        const analyser = this.context.createAnalyser();
        connect.call(this,analyser);
        setInterval(() => {
          const data = new Float32Array(analyser.fftSize);
          analyser.getFloatTimeDomainData(data);
          for (const value of data) window.__frogAudio.peak = Math.max(window.__frogAudio.peak,Math.abs(value));
          window.__frogAudio.samples++;
        },50);
      }
      return result;
    };
  });
  async function waitFor(predicate, milliseconds = 90000) {
    const deadline = Date.now()+milliseconds;
    while (!predicate() && Date.now() < deadline) {
      assert.ok(!runtimeError(),JSON.stringify(runtimeError()));
      await page.waitForTimeout(200);
    }
    assert.ok(predicate(),'Expected game event did not arrive');
  }
  async function input(x,y,reason) {
    inputs.push({x,y,reason,time:Date.now()});
    if (touch) await page.touchscreen.tap(x,y);
    else await page.mouse.click(x,y);
  }
  try {
    const response = await page.goto(base,{waitUntil:'load'});
    assert.equal(response.status(),200);
    const launch = page.getByRole('link',{name:/starten|ausprobieren|spielen/i});
    if (await launch.count()) await launch.first().click();
    await waitFor(() => has('GERMAN_MENU'));
    await page.screenshot({path:path.join(logs,name+'-menu.png')});
    // Menu uses a fixed 2560x1800 design. The six lesson buttons occupy one row.
    // Inspect their actual screen text before choosing the desired lesson.
    if (lesson !== 1) {
      const file = path.join(logs,name+'-menu.png');
      const words = ocrWords(file);
      const number = words.find(word => word.text.replace(/[^0-9]/g,'') === String(lesson)
        && word.y > 70 && word.y < 230);
      // Rectangle outlines can cause OCR to omit the button row. These centres
      // were independently confirmed from the actual 1280x900 menu screenshot.
      await input(number ? number.x+number.width/2 : 155+(lesson-1)*193.5,
        number ? number.y+number.height/2 : 165,'select visible lesson button');
      await waitFor(() => has(`GERMAN_MENU lesson=${lesson}`));
      await page.waitForTimeout(300);
    }
    const menu = path.join(logs,name+'-selected.png');
    await page.screenshot({path:menu});
    const frog = ocrWords(menu).find(word => /frosch/i.test(word.text));
    assert.ok(frog,'Visible Wörter lesen · Frosch button must be present');
    await input(frog.x+frog.width/2,frog.y+frog.height/2,'start visible frog activity');
    await waitFor(() => has(`Start minigame=frog lesson=${lesson}`));
    checks.originalFrogStarted = true;
    await page.screenshot({path:path.join(logs,name+'-started.png')});
    const deadline = Date.now()+Number(process.env.KALULU_FROG_TIMEOUT_MS || 360000);
    let clicks = 0;
    while (!has(`GERMAN_COMPLETE lesson=${lesson} game=frog`) && Date.now() < deadline) {
      assert.ok(!runtimeError(),JSON.stringify(runtimeError()));
      if (has('frog won in')) {
        await page.waitForTimeout(350);
        continue;
      }
      const file = path.join(logs,name+'-targets.png');
      await page.screenshot({path:file});
      const targets = JSON.parse(execFileSync('python3',
        [path.join(__dirname,'find_frog_targets.py'),file],{encoding:'utf8'}));
      if (targets.length) {
        const target = targets[0];
        await input(target.x,target.y,'tap lily pad above rightmost printed plaque');
        clicks++;
        await page.waitForTimeout(2300);
      } else await page.waitForTimeout(250);
    }
    assert.ok(has(`GERMAN_COMPLETE lesson=${lesson} game=frog`),'Original five-word frog activity must complete');
    const won = events.find(event => /frog won in .*progression 5\/5/.test(event.text));
    assert.ok(won,'Original frog must report genuine progression 5/5');
    checks.completedOriginalFrog = {lesson,clicks,progression:'5/5',touch,log:won.text};
    const audio = await page.evaluate(() => window.__frogAudio);
    assert.ok(audio && audio.peak > 0.00001,'Original gameplay must produce nonzero WebAudio samples');
    checks.nonzeroAudio = audio;
    const spoken = events.filter(event => /Playing Word /.test(event.text)).map(event =>
      event.text.replace(/^.*Playing Word /,''));
    // Release logging can omit the game's TRACE-level word-playback messages.
    // Audio output plus actual completion are asserted above; the separate Godot
    // audit validates German asset mapping and decoding. Never invent transcripts.
    checks.wordPlaybackTrace = {words:spoken,available:spoken.length > 0};
    assert.ok(has('de_DE/language.db'),'The real German database must have opened');
    checks.germanDatabaseOpened = true;
    assert.ok(!runtimeError(),JSON.stringify(runtimeError()));
    assert.ok(requests.every(url => /^(blob:|data:)/.test(url) || new URL(url).origin === new URL(base).origin),
      'Gameplay must not make external requests');
    checks.noRuntimeErrors = true;
    checks.noExternalRequests = true;
    await waitFor(() => has(`GERMAN_MENU lesson=${lesson} completed=1`));
    await page.waitForTimeout(500);
    await page.screenshot({path:path.join(logs,name+'-complete.png')});
    checks.returnedToMenu = true;
    console.log('GERMAN_FROG_PASS',JSON.stringify(checks));
  } catch (error) {
    checks.failure = String(error);
    console.error(error);
    await page.screenshot({path:path.join(logs,name+'-failure.png')}).catch(()=>{});
    process.exitCode = 1;
  } finally {
    fs.writeFileSync(path.join(logs,name+'.json'),JSON.stringify({checks,localArtifactHashes,events,requests,failedRequests,inputs},null,2));
    await browser.close();
  }
})().catch(error => {console.error(error);process.exitCode=1;});
