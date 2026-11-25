const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  const base = 'http://127.0.0.1:8070/preview/phonics-lab/';
  const browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  const page = await browser.newPage({viewport:{width:320,height:568},hasTouch:true,isMobile:true});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const button = id => page.locator('#' + id);
  const state = () => page.evaluate(() => {
    const store = JSON.parse(localStorage.getItem('kalulu-de:learners:v3'));
    return store.profiles.find(profile => profile.id === store.activeId).progress;
  });
  const round = async () => (await state()).pending.round;
  const meter = async () => Number(await page.getByRole('progressbar').getAttribute('aria-valuenow'));
  const previous = () => button('exercise-prev').tap();
  const next = () => button('exercise-next').tap();
  const choose = target => page.locator('[data-choice="' + target + '"]').tap();
  const waitForExercise = async index => {
    await page.locator('.exercise-controls [aria-live]').getByText('Aufgabe ' + (index + 1) + ' von', {exact:false}).waitFor();
    assert.equal((await state()).pending.index, index);
  };
  const selectLevel = async stage => {
    await button('path').click();
    await button('preview').check();
    await page.locator('[data-level="' + stage + '"]').tap();
  };

  try {
    await page.goto(base);
    await selectLevel('reading_everyday');
    assert.match(await button('level-menu').innerText(), /Etappe 1\/4.*Buch und Apfel/);
    assert.equal(await button('exercise-prev').isDisabled(), true);
    assert.equal(await meter(),0);
    const arrows = await page.locator('.exercise-controls').boundingBox();
    const progress = await page.locator('.meter-track').boundingBox();
    assert.ok(arrows.y + arrows.height <= progress.y);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);

    const first = await round();
    await choose(first.choices.find(value => value !== first.target));
    const withError = await round();
    await next();
    const second = await round();
    assert.notEqual(second.target,first.target);
    assert.equal(await meter(),0);
    assert.equal((await state()).seeds,0);
    await previous();
    assert.deepEqual(await round(),withError);
    await next();
    assert.deepEqual(await round(),second);
    await choose(second.target);
    await waitForExercise(2);
    assert.equal(await meter(),1);
    const third = await round();

    await button('exercise-prev').focus();
    await page.keyboard.press('Enter');
    const replay = await round();
    assert.equal(replay.target,second.target);
    assert.deepEqual(replay.choices, second.choices);
    assert.match(await page.locator('.exercise-controls').innerText(),/Wiederholung/);
    assert.equal(await meter(),1);
    const earned = await state();
    await choose(replay.target);
    await waitForExercise(2);
    const afterReplay = await state();
    for(const key of ['seeds','skills','spacing','readingPath']){
      assert.deepEqual(afterReplay[key],earned[key]);
    }
    assert.deepEqual(await round(),third);

    await page.reload();
    await button('play').tap();
    await waitForExercise(2);
    assert.deepEqual(await round(),third);
    assert.equal(await meter(),1);
    await previous();
    await previous();
    assert.deepEqual(await round(),withError);
    // Leave during the brief teaching acknowledgment, before its timer runs.
    // Automatic return to the skipped exercise must restore usable choices.
    await choose(first.choices.find(value => value !== first.target));
    assert.equal((await round()).help,'show');
    await page.evaluate(() => {
      document.querySelector('.tile.hint').click();
      document.querySelector('#exercise-next').click();
    });
    assert.equal((await state()).pending.exerciseHistory.rounds[0].help,'ack');
    const total = (await state()).pending.total;
    for(let index=2;index<total;index++)await next();
    assert.equal(await button('exercise-next').isDisabled(),true);
    await choose((await round()).target);
    await waitForExercise(0);
    assert.deepEqual(await round(),{...withError,tries:2,misses:0});
    assert.equal(await page.locator('[data-choice]:enabled').count(),first.choices.length);
    assert.equal(await meter(),2);
    assert.equal((await state()).sessions,0);

    const beforeFresh = await state();
    await button('settings').tap();
    await button('new-exercises').tap();
    assert.deepEqual(await state(),beforeFresh);
    await button('new-exercises-start').tap();
    await waitForExercise(0);
    const fresh = await state();
    assert.equal(fresh.pending.etappeId,beforeFresh.pending.etappeId);
    assert.equal(fresh.pending.preferUnseen,true);
    assert.notEqual(fresh.pending.round.target,beforeFresh.pending.round.target);
    assert.equal(await meter(),0);
    for(const key of ['seeds','sessions','skills','spacing','readingPath','paused']){
      assert.deepEqual(fresh[key],beforeFresh[key]);
    }

    await selectLevel('story_order');
    const story = await round();
    await page.locator('[data-story-frame]').first().tap();
    const partialOrder = (await round()).order;
    await next();
    await previous();
    assert.equal((await round()).target,story.target);
    assert.deepEqual((await round()).order,partialOrder);
    assert.equal(await meter(),0);

    assert.deepEqual(errors,[]);
    const info = await (await page.request.get(base+'BUILD_INFO.json')).json();
    const result = {
      status:'passed',version:info.version,assetVersion:info.assetVersion,
      checks:[
        '320×568 Chromium touch layout has reachable arrows above the progress bar and no horizontal overflow.',
        'Real touch and keyboard navigation preserve skipped questions, errors, exact choice order, reload and partial story placement.',
        'Replaying a solved exercise preserves awards, skill and spacing data; solving the last slot returns to an earlier skipped exercise with usable choices even after an interrupted teaching timer.',
        'Parent confirmation starts a new selection in the same Etappe and preserves earned progress.',
      ],
      pageErrors:errors,
    };
    fs.writeFileSync('docs/verification/v16-exercise-navigation.json',JSON.stringify(result,null,2)+'\n');
    console.log(JSON.stringify(result,null,2));
  } finally {
    await browser.close();
  }
})().catch(error => {console.error(error);process.exitCode=1;});
