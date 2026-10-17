// Real mouse/touch input against the shipped demo. No answers exposed by game code.
const {chromium} = require('playwright');
const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');
const assert = require('assert/strict');
const root = process.env.KALULU_DEMO_WORKSPACE || '/workspace/kalulu-phone-demo';
const base = process.env.KALULU_DEMO_URL || 'http://127.0.0.1:8060/';
const lesson = Number(process.env.KALULU_DEMO_LESSON || 1);
assert.ok([1,2].includes(lesson));
const events = [], checks = {}, requests = [];
const bad = () => events.find(e => e.type==='pageerror' || /^ERROR:|SCRIPT ERROR:|DEMO: French database could not open/.test(e.text));
(async()=>{
  const browser = await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,
    args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
  async function observe(page, name) {
    page.on('console',m=>{events.push({probe:name,type:m.type(),text:m.text()});console.log(name+': '+m.text());});
    page.on('pageerror',e=>events.push({probe:name,type:'pageerror',text:String(e)}));
    page.on('request',r=>requests.push(r.url()));
  }
  async function wait(page, predicate, milliseconds=90000) {
    const deadline=Date.now()+milliseconds;
    while(!predicate() && Date.now()<deadline) {
      assert.ok(!bad(),JSON.stringify(bad()));
      await page.waitForTimeout(200);
    }
    assert.ok(predicate(),'Expected game event within timeout');
  }
  const has = (name,text) => events.some(e=>e.probe===name && e.text.includes(text));
  try {
    const desktop=await browser.newPage({viewport:{width:1280,height:900}});
    await desktop.addInitScript(()=>{
      window.__demoAnalyzers=[];
      const connect=AudioNode.prototype.connect;
      AudioNode.prototype.connect=function(...args){
        const value=connect.apply(this,args);
        if(args[0] instanceof AudioDestinationNode){const a=this.context.createAnalyser();connect.call(this,a);window.__demoAnalyzers.push(a);}
        return value;
      };
    });
    await observe(desktop,'desktop');
    const response=await desktop.goto(base,{waitUntil:'load'});
    assert.equal(response.status(),200);
    await desktop.getByRole('link',{name:'Demo starten'}).click();
    await wait(desktop,()=>has('desktop','DEMO_MENU'));
    checks.offlineMenuLoadsWithoutIsolation = !(await desktop.evaluate(()=>crossOriginIsolated));
    await desktop.screenshot({path:path.join(root,'logs/demo-menu.png')});
    await desktop.mouse.click(640,lesson===1?390:520);
    await wait(desktop,()=>has('desktop',`Start minigame=jellyfish lesson=${lesson}`));
    await desktop.waitForFunction(()=>window.__demoAnalyzers.some(a=>{
      const data=new Float32Array(a.fftSize);a.getFloatTimeDomainData(data);
      return data.some(value=>Math.abs(value)>0.00001);
    }),null,{timeout:20000});
    checks.nonzeroGameAudio = true;
    await desktop.screenshot({path:path.join(root,'logs/demo-playing.png')});
    let hits=0;
    const deadline=Date.now()+180000;
    while(!has('desktop','DEMO_COMPLETE') && Date.now()<deadline) {
      assert.ok(!bad(),JSON.stringify(bad()));
      const file=path.join(root,'logs/targets.png');
      const time=Date.now();
      await desktop.screenshot({path:file});
      const targets=JSON.parse(execFileSync('python3',[path.join(__dirname,'find_demo_targets.py'),file],{encoding:'utf8'}));
      if(targets.length) {
        const target=targets[0];
        // Compensate for normal upward movement between image capture and input.
        await desktop.mouse.click(target.x, Math.max(140,target.y-(Date.now()-time)*.075));
        hits++;
        await desktop.waitForTimeout(3000);
      } else await desktop.waitForTimeout(400);
    }
    assert.ok(has('desktop','DEMO_COMPLETE'),'Original eight-round activity must complete');
    assert.ok(has('desktop','won in') && has('desktop','progression 8/8'));
    checks.originalLessonCompleted = {lesson,clicks:hits,progression:'8/8'};
    await desktop.waitForTimeout(1000);
    await desktop.screenshot({path:path.join(root,'logs/demo-completed.png')});
    await desktop.close();
    const phone=await browser.newContext({viewport:{width:844,height:390},deviceScaleFactor:1,isMobile:true,hasTouch:true});
    const page=await phone.newPage();
    await observe(page,'phone-landscape');
    await page.goto(new URL('play.html',base).href,{waitUntil:'load'});
    await wait(page,()=>has('phone-landscape','DEMO_MENU'));
    await page.screenshot({path:path.join(root,'logs/demo-phone-menu.png')});
    // The 2560x1800 game is letterboxed in this landscape viewport.
    await page.touchscreen.tap(422,169);
    await wait(page,()=>has('phone-landscape','Start minigame=jellyfish lesson=1'));
    let touched=false;
    const end=Date.now()+45000;
    while(!touched && Date.now()<end) {
      const file=path.join(root,'logs/phone-targets.png');
      const time=Date.now();
      await page.screenshot({path:file});
      const targets=JSON.parse(execFileSync('python3',[path.join(__dirname,'find_demo_targets.py'),file],{encoding:'utf8'}));
      if(targets.length) {
        const target=targets[0];
        await page.touchscreen.tap(target.x,Math.max(60,target.y-(Date.now()-time)*.0325));
        touched=true;
      } else await page.waitForTimeout(300);
    }
    assert.ok(touched,'Touch must reach a moving letter plaque');
    await page.waitForTimeout(3000);
    const phoneScreenshot=path.join(root,'logs/demo-phone-playing.png');
    await page.screenshot({path:phoneScreenshot});
    assert.ok(Number(execFileSync('python3',[path.join(__dirname,'find_demo_targets.py'),phoneScreenshot,'--gauge'],{encoding:'utf8'}))>0,'Touch must visibly advance the original progress gauge');
    checks.emulatedPhoneTouch = true;
    assert.ok(!bad(),JSON.stringify(bad()));
    assert.ok(requests.every(url=>new URL(url).origin===new URL(base).origin),'No external gameplay requests');
    checks.noExternalRequests = true;
    checks.noRuntimeErrors = true;
    console.log('PHONE_DEMO_PASS',checks);
  } catch(error) {
    checks.failure=String(error);
    console.error(error);
    process.exitCode=1;
  } finally {
    fs.writeFileSync(path.join(root,'logs/demo-test.json'),JSON.stringify({checks,events,requests},null,2));
    await browser.close();
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
