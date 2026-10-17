// Exercise the standalone audio review page, independent of the Godot game.
const {chromium} = require('playwright');
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const root = process.env.KALULU_GERMAN_WORKSPACE || '/workspace/kalulu-german-demo';
const base = process.env.KALULU_GERMAN_URL || 'http://127.0.0.1:8061/';
const pageUrl = new URL('audio-review.html', base).href;
const clips = JSON.parse(fs.readFileSync(path.join(__dirname, '../german/audio/manifest.json'), 'utf8')).clips;
const result = {url: pageUrl, checks: {}, audio: [], playback: [], requests: [], pageErrors: [], consoleErrors: [],
  limitations: ['Headless Chromium with local HTTP hosting; no physical phone or Safari tested.',
    'Audio decoding and playback time do not establish pronunciation, comprehension, or human-perceived sound quality.']};

(async () => {
  let browser;
  try {
    browser = await chromium.launch({executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox']});
    const page = await browser.newPage({viewport: {width: 1100, height: 850}});
    page.on('pageerror', error => result.pageErrors.push(String(error)));
    page.on('console', message => {if (message.type() === 'error') result.consoleErrors.push(message.text());});
    page.on('response', response => result.requests.push({url: response.url(), status: response.status()}));
    page.on('requestfailed', request => result.requests.push({url: request.url(), failure: request.failure()?.errorText}));
    const response = await page.goto(pageUrl, {waitUntil: 'load'});
    assert.equal(response.status(), 200);
    const rows = await page.locator('audio').evaluateAll(elements => elements.map(audio => {
      const row = audio.closest('tr');
      const label = row.cells[0].cloneNode(true);
      label.querySelector('small').remove();
      return {id: row.querySelector('small').textContent.trim(), text: label.textContent.trim(),
        pronunciation: row.cells[1].textContent.trim(), src: audio.getAttribute('src')};
    }));
    assert.equal(rows.length, 63);
    assert.equal(new Set(rows.map(row => row.id)).size, 63);
    assert.deepEqual(rows.map(row => row.id).sort(), clips.map(clip => clip.id).sort());
    for (const clip of clips) {
      const row = rows.find(row => row.id === clip.id);
      assert.equal(row.text, clip.text, clip.id + ' visible text');
      assert.equal(row.pronunciation, '/' + (clip.phonemes || 'gesprochene Anleitung') + '/', clip.id + ' IPA/label');
      assert.equal(row.src, 'review-audio/' + clip.id + '.wav');
    }
    result.checks.all63UniqueControlsAndLabelsMatchManifest = true;
    result.audio = await page.evaluate(async () => {
      const elements = [...document.querySelectorAll('audio')];
      const context = new AudioContext();
      const output = new Array(elements.length);
      let next = 0;
      try {
        await Promise.all(Array.from({length: 4}, async () => {
          while (next < elements.length) {
            const index = next++;
            const audio = elements[index];
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => finish(new Error('Audio load timeout: ' + audio.src)), 15000);
              function finish(error) {
                clearTimeout(timeout);
                audio.removeEventListener('canplaythrough', ready);
                audio.removeEventListener('error', failed);
                error ? reject(error) : resolve();
              }
              const ready = () => finish();
              const failed = () => finish(new Error('Audio element error ' + audio.error?.code + ': ' + audio.src));
              audio.addEventListener('canplaythrough', ready);
              audio.addEventListener('error', failed);
              // Changing preload starts this existing element's load. Calling
              // load() as well would cancel that new request in Chromium.
              audio.preload = 'auto';
            });
            // Also decode the complete file, rather than inferring full decoding
            // merely from loadedmetadata or initial playback readiness.
            const response = await fetch(audio.currentSrc);
            if (!response.ok) throw new Error('Audio fetch status ' + response.status);
            const decoded = await context.decodeAudioData(await response.arrayBuffer());
            const samples = decoded.getChannelData(0);
            let peak = 0;
            for (const sample of samples) {
              if (!Number.isFinite(sample)) throw new Error('Nonfinite decoded sample');
              peak = Math.max(peak, Math.abs(sample));
            }
            output[index] = {id: audio.closest('tr').querySelector('small').textContent.trim(),
              elementDuration: audio.duration, readyState: audio.readyState,
              decodedDuration: decoded.duration, decodedFrames: decoded.length,
              channels: decoded.numberOfChannels, decodedSampleRate: decoded.sampleRate, peak};
          }
        }));
      } finally {await context.close();}
      return output;
    });
    for (const audio of result.audio) {
      assert.ok(Number.isFinite(audio.elementDuration) && audio.elementDuration > 0, audio.id);
      assert.ok(audio.readyState >= 3 && audio.decodedFrames > 0 && audio.channels === 1, audio.id);
      assert.ok(Math.abs(audio.decodedDuration - audio.elementDuration) < 0.001, audio.id);
      assert.ok(audio.peak > 0.002 && audio.peak < 0.75, audio.id);
    }
    result.checks.all63MetadataCanPlayAndCompleteBrowserDecode = true;
    for (const id of ['gp_a_long', 'word_lila']) {
      const index = rows.findIndex(row => row.id === id);
      const control = page.locator('audio').nth(index);
      await control.scrollIntoViewIfNeeded();
      const bounds = await control.boundingBox();
      // The native Chromium audio control's left button; a real user gesture.
      await page.mouse.click(bounds.x + 18, bounds.y + bounds.height / 2);
      await page.waitForFunction(i => document.querySelectorAll('audio')[i].currentTime > 0.05, index, {timeout: 5000});
      const observed = await control.evaluate(audio => ({currentTime: audio.currentTime, ended: audio.ended, error: audio.error?.code || null}));
      assert.equal(observed.error, null);
      result.playback.push({id, ...observed});
      await control.evaluate(audio => audio.pause());
    }
    result.checks.nativeControlClickAdvancesPhonemeAndWordPlayback = true;
    await page.waitForLoadState('networkidle');
    assert.ok(result.requests.length > 63);
    assert.ok(result.requests.every(request => new URL(request.url).origin === new URL(base).origin), 'All requests same origin');
    assert.ok(result.requests.every(request => !request.failure && request.status >= 200 && request.status < 400), 'All requests succeeded');
    assert.deepEqual(result.pageErrors, []);
    assert.deepEqual(result.consoleErrors, []);
    result.checks.requestsSuccessfulSameOriginAndNoPageErrors = true;
    result.passed = true;
  } catch (error) {
    result.passed = false;
    result.error = String(error.stack || error);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    const logs = path.join(root, 'logs');
    fs.mkdirSync(logs, {recursive: true});
    fs.writeFileSync(path.join(logs, 'german-audio-review.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify({passed: result.passed, checks: result.checks,
      decodedClips: result.audio.length, playback: result.playback, error: result.error}, null, 2));
  }
})();
