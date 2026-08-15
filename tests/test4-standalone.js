/* Standalone single-file build test: no server, no fetch, no network.
   Loads lets-learn-standalone.html directly from disk and verifies the
   whole app boots and media plays from embedded data URIs. */
const { JSDOM } = require('jsdom');
const stub = `<script>
  HTMLCanvasElement.prototype.getContext = function(){ return new Proxy({}, { get(t,p){ return (typeof p==='string') ? (function(){}) : undefined; }, set(){ return true; } }); };
  window.confirm = () => true; window.scrollTo = () => {};
  window.HTMLMediaElement.prototype.play = function(){ return Promise.resolve(); };
  window.HTMLMediaElement.prototype.pause = function(){};
  window.alert = () => {};
  // NO fetch polyfill on purpose — standalone must not need the network
</script>`;
const errors = [];
(async () => {
  const dom = await JSDOM.fromFile('/home/user/lets-learn/lets-learn-standalone.html', {
    runScripts: 'dangerously', pretendToBeVisual: true, resources: 'usable',
    beforeParse(w2) {
      w2.addEventListener('error', e => errors.push('window: ' + e.message));
      w2.addEventListener('unhandledrejection', e => errors.push('rejection: ' + (e.reason && e.reason.message || e.reason)));
    }
  });
  const w = dom.window, doc = w.document;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  await wait(1500);
  const click = sel => { const el = doc.querySelector(sel); if (!el) { errors.push('click: missing ' + sel); return null; } el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); return el; };

  // booted?
  if (typeof w.LLApp !== 'object') errors.push('LLApp not defined');
  else console.log('✅ Standalone booted (no server, no network)');
  if (doc.getElementById('boot-splash')) errors.push('boot splash not removed');
  else console.log('✅ Splash removed after boot');
  if (!doc.querySelector('#btn-start')) errors.push('welcome not rendered');
  else console.log('✅ Welcome screen rendered');

  // catalog embedded?
  const cat = await w.LLMedia.loadCatalog();
  if (!cat || cat.length !== 30) errors.push('catalog wrong: ' + (cat && cat.length));
  else console.log('✅ Embedded catalog:', cat.length, 'records');
  const withData = cat.filter(m => m.filePath && m.filePath.startsWith('data:'));
  if (withData.length !== 30) errors.push('data URIs: ' + withData.length + ' (expected 30 records)');
  else console.log('✅ Media files embedded as data URIs:', withData.length);

  // full flow: start → class → profile → home
  click('#btn-start'); await wait(300);
  if (!doc.querySelector('.class-card')) errors.push('class screen missing');
  else console.log('✅ Class selection rendered');
  click('.class-card[data-class="middle"]'); await wait(300);
  const ni = doc.querySelector('#child-name');
  if (!ni) errors.push('profile missing');
  else { ni.value = 'Mia'; click('#btn-done-profile'); await wait(400); }
  if (!doc.querySelector('.home-hello')) errors.push('home missing');
  else console.log('✅ Home rendered after setup');

  // songs library (standalone, no network)
  w.location.hash = '#/learn'; await wait(400); // bottom nav
  click('.area-card[data-area="songs"]'); await wait(400);
  click('[data-hash="#/songs"]'); await wait(700);
  const cards = doc.querySelectorAll('.media-card');
  if (cards.length !== 8) errors.push('songs cards: ' + cards.length);
  else console.log('✅ Songs library:', cards.length, 'cards (offline)');
  const firstImg = doc.querySelector('.media-card img');
  if (firstImg && firstImg.getAttribute('src').startsWith('data:')) console.log('✅ Song thumbnails are data URIs');
  else if (firstImg) errors.push('thumbnail not a data URI: ' + (firstImg.getAttribute('src') || '').slice(0, 40));

  // song player
  click('.media-card[data-id="song-count-with-me"]'); await wait(600);
  const srcEl = doc.querySelector('.mp-audio source');
  if (!srcEl) errors.push('player audio missing');
  else if (srcEl.getAttribute('src').startsWith('data:audio/mpeg')) console.log('✅ Song player plays embedded audio (data URI)');
  else errors.push('song src not data URI: ' + (srcEl.getAttribute('src') || '').slice(0, 50));
  if (!doc.querySelector('.mp-bigplay')) errors.push('no big play button');
  else console.log('✅ Big play + replay controls present');

  // video player
  w.location.hash = '#/videos'; await wait(600);
  const vids = doc.querySelectorAll('.media-card');
  if (vids.length !== 6) errors.push('videos: ' + vids.length);
  else console.log('✅ Videos library:', vids.length, 'cards (offline)');
  click('.media-card[data-id="video-letter-a"]'); await wait(600);
  const vSrc = doc.querySelector('.mp-video source');
  if (!vSrc) errors.push('video player missing');
  else if (vSrc.getAttribute('src').startsWith('data:video/mp4')) console.log('✅ Video player plays embedded video (data URI)');
  else errors.push('video src not data URI: ' + (vSrc.getAttribute('src') || '').slice(0, 50));

  // a lesson with a media step (Letter A Adventure, baby class) — switch class via parent area
  w.location.hash = '#/parent'; await wait(400);
  if (doc.querySelector('.pin-pad')) {
    ['1','2','3','4'].forEach(k => click(`.pin-key[data-k="${k}"]`));
    await wait(500);
    click('#btn-edit-child'); await wait(300);
    click('.class-card[data-class="baby"]'); await wait(300);
    doc.querySelector('#child-name').value = 'Mia';
    click('#btn-done-profile'); await wait(400);
  }
  w.location.hash = '#/area/letters';
  let lr = null;
  for (let i = 0; i < 30 && !lr; i++) {
    await wait(120);
    lr = [...doc.querySelectorAll('.lesson-card')].find(r => r.getAttribute('data-lesson') === 'b-e4');
  }
  if (!lr) errors.push('b-e4 not listed');
  else {
    lr.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await wait(500);
    click('#step-controls .btn.green'); await wait(800);
    if (!doc.querySelector('#step-body .mp-video')) errors.push('lesson media step video missing');
    else console.log('✅ Lesson media step plays embedded video (offline)');
    click('#step-controls .btn.green'); await wait(800);
    if (!doc.querySelector('#step-body .mp-audio')) errors.push('lesson media step song missing');
    else console.log('✅ Lesson media step plays embedded song (offline)');
  }

  console.log('=== TEST 4 (standalone) RESULTS ===');
  console.log(errors.length ? '❌ ERRORS:\n' + errors.join('\n') : '✅ STANDALONE FULLY WORKS OFFLINE');
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error('FATAL:', e.message); process.exit(2); });
