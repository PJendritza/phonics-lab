// German content + original jellyfish gameplay via real canvas mouse/touch input.
const {chromium} = require('playwright');
const fs = require('fs');
const path = require('path');
const {execFileSync} = require('child_process');
const assert = require('assert/strict');
const root = process.env.KALULU_GERMAN_WORKSPACE || '/workspace/kalulu-de-build';
const base = process.env.KALULU_GERMAN_URL || 'http://127.0.0.1:8061/';
const lesson = Number(process.env.KALULU_GERMAN_LESSON || 1);
assert.ok(Number.isInteger(lesson) && lesson >= 1 && lesson <= 6);
const name = 'german-jellyfish-lesson-'+lesson;
const logs = path.join(root,'logs');
const events = [], requests = [], checks = {};
const has = (probe,text,start=0) => events.slice(start).some(e=>e.probe===probe && e.text.includes(text));
const bad = () => events.find(e=>e.type==='pageerror' || /^ERROR:|SCRIPT ERROR:|GERMAN: database could not open/.test(e.text));

(async()=>{
  const browser = await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,
    args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
  async function observe(page,probe) {
    page.on('console',m=>{events.push({probe,type:m.type(),text:m.text()}); if (/GERMAN_|Start minigame|won in|ERROR/.test(m.text())) console.log(probe+': '+m.text());});
    page.on('pageerror',e=>events.push({probe,type:'pageerror',text:String(e)}));
    page.on('request',r=>requests.push(r.url()));
    await page.addInitScript(()=>{
      window.__audioPeak=0;
      const connect=AudioNode.prototype.connect;
      AudioNode.prototype.connect=function(...args){
        const value=connect.apply(this,args);
        if(args[0] instanceof AudioDestinationNode){
          const analyser=this.context.createAnalyser();connect.call(this,analyser);
          setInterval(()=>{const data=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(data);
            for(const sample of data)window.__audioPeak=Math.max(window.__audioPeak,Math.abs(sample));},30);
        }
        return value;
      };
    });
  }
  async function wait(page,predicate,milliseconds=90000) {
    const end=Date.now()+milliseconds;
    while(!predicate() && Date.now()<end){assert.ok(!bad(),JSON.stringify(bad()));await page.waitForTimeout(200);}
    assert.ok(predicate(),'Expected game event within timeout');
  }
  function point(page,x,y) {
    const {width,height}=page.viewportSize();const scale=Math.min(width/2560,height/1800);
    return {x:(width-2560*scale)/2+x*scale,y:(height-1800*scale)/2+y*scale};
  }
  async function click(page,x,y,touch=false) {
    const p=point(page,x,y);
    if(touch)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);
  }
  try {
    const desktop=await browser.newPage({viewport:{width:1280,height:900}});
    await observe(desktop,'desktop');
    const response=await desktop.goto(base,{waitUntil:'load'});assert.equal(response.status(),200);
    await desktop.getByRole('link',{name:'Deutsch-Demo starten'}).click();
    await wait(desktop,()=>has('desktop','GERMAN_MENU lesson=1 completed=0'));
    checks.noIsolationHeadersNeeded=!(await desktop.evaluate(()=>crossOriginIsolated));
    await desktop.screenshot({path:path.join(logs,name+'-menu.png')});
    await click(desktop,500,930);
    await wait(desktop,()=>has('desktop','GERMAN_PREVIEW a_long'));
    await desktop.waitForFunction(()=>window.__audioPeak>0.00001,null,{timeout:10000});
    checks.germanPhonemePreviewHasAudio=true;
    // Verify all six menu selections are reachable, including long explanations.
    for(let number=2;number<=6;number++) {
      const start=events.length;
      await click(desktop,310+385*(number-1),330);
      await wait(desktop,()=>has('desktop','GERMAN_MENU lesson='+number,start));
      await desktop.waitForTimeout(150);
      await desktop.screenshot({path:path.join(logs,'german-menu-lesson-'+number+'.png')});
    }
    checks.allSixLessonMenusReachable=true;
    if(lesson!==6){const start=events.length;await click(desktop,310+385*(lesson-1),330);
      await wait(desktop,()=>has('desktop','GERMAN_MENU lesson='+lesson,start));}
    // Buttons may move vertically with wrapped lesson explanations. OCR uses the
    // visible game name, never privileged application state or hidden answers.
    const menu=path.join(logs,name+'-selected.png');await desktop.screenshot({path:menu});
    const tsv=execFileSync('tesseract',[menu,'stdout','--psm','6','tsv'],{encoding:'utf8',stdio:['ignore','pipe','ignore'],env:{...process.env,OMP_THREAD_LIMIT:'1'}});
    const word=tsv.split('\n').map(row=>row.split('\t')).find(c=>/Quallen/i.test(c[11]||''));
    assert.ok(word,'Visible Quallen button');
    await desktop.mouse.click(Number(word[6])+Number(word[8])/2,Number(word[7])+Number(word[9])/2);
    await wait(desktop,()=>has('desktop',`Start minigame=jellyfish lesson=${lesson}`));
    await desktop.waitForTimeout(1500);
    await desktop.evaluate(()=>window.__audioPeak=0);
    await desktop.waitForFunction(()=>window.__audioPeak>0.00001,null,{timeout:25000});
    checks.nonzeroGameAudio=true;
    let clicks=0;
    const deadline=Date.now()+240000;
    while(!has('desktop',`GERMAN_COMPLETE lesson=${lesson} game=jellyfish`) && Date.now()<deadline) {
      assert.ok(!bad(),JSON.stringify(bad()));
      const file=path.join(logs,name+'-targets.png');const time=Date.now();
      await desktop.screenshot({path:file});
      const targets=JSON.parse(execFileSync('python3',[path.join(__dirname,'find_demo_targets.py'),file],{encoding:'utf8'}));
      if(targets.length){const t=targets[0];await desktop.mouse.click(t.x,Math.max(140,t.y-(Date.now()-time)*.075));clicks++;await desktop.waitForTimeout(3000);}
      else await desktop.waitForTimeout(300);
    }
    assert.ok(has('desktop',`GERMAN_COMPLETE lesson=${lesson} game=jellyfish`),'Original activity completes');
    const won=events.find(e=>e.probe==='desktop'&&/jellyfish won in .*progression 8\/8/.test(e.text));
    assert.ok(won,'Original eight-round win log');
    checks.originalGermanJellyfishCompleted={lesson,clicks,log:won.text};
    await wait(desktop,()=>has('desktop',`GERMAN_MENU lesson=${lesson} completed=1`));
    await desktop.waitForTimeout(1500);
    await desktop.screenshot({path:path.join(logs,name+'-complete.png')});
    const start=events.length;
    await desktop.reload({waitUntil:'load'});
    await wait(desktop,()=>has('desktop',`GERMAN_MENU lesson=${lesson} completed=1`,start));
    checks.lessonAndCompletionPersistAfterReload=true;
    await desktop.close();

    const phone=await browser.newContext({viewport:{width:844,height:390},deviceScaleFactor:1,isMobile:true,hasTouch:true});
    const page=await phone.newPage();await observe(page,'phone-landscape');
    await page.goto(new URL('play.html',base).href,{waitUntil:'load'});
    await wait(page,()=>has('phone-landscape','GERMAN_MENU lesson=1 completed=0'));
    await page.screenshot({path:path.join(logs,'german-phone-menu.png')});
    await click(page,700,1350,true);
    await wait(page,()=>has('phone-landscape','Start minigame=jellyfish lesson=1'));
    const end=Date.now()+65000;let advanced=false;let taps=0;
    while(!advanced && Date.now()<end) {
      const file=path.join(logs,'german-phone-targets.png');const time=Date.now();
      await page.screenshot({path:file});
      const targets=JSON.parse(execFileSync('python3',[path.join(__dirname,'find_demo_targets.py'),file],{encoding:'utf8'}));
      if(targets.length){const t=targets[0];await page.touchscreen.tap(t.x,Math.max(60,t.y-(Date.now()-time)*.0325));taps++;await page.waitForTimeout(3000);
        await page.screenshot({path:file});
        advanced=Number(execFileSync('python3',[path.join(__dirname,'find_demo_targets.py'),file,'--gauge'],{encoding:'utf8'}))>0;
      } else await page.waitForTimeout(300);
    }
    assert.ok(advanced,'Real touch must visibly advance original progress gauge');
    await page.screenshot({path:path.join(logs,'german-phone-playing.png')});
    checks.emulatedPhoneTouch={viewport:'844x390',taps,progressGaugeAdvanced:true};
    assert.ok(requests.every(url=>/^(blob:|data:)/.test(url)||new URL(url).origin===new URL(base).origin));
    assert.ok(!bad(),JSON.stringify(bad()));
    checks.noExternalRequests=true;checks.noRuntimeErrors=true;
    console.log('GERMAN_DEMO_PASS',JSON.stringify(checks));
  } catch(error){checks.failure=String(error);console.error(error);process.exitCode=1;}
  finally{fs.writeFileSync(path.join(logs,name+'.json'),JSON.stringify({checks,events,requests},null,2));await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
