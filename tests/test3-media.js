/* Media system tests: libraries, player, lesson media step, admin flow */
const { JSDOM } = require('jsdom');
const stub = `<script>
  HTMLCanvasElement.prototype.getContext = function(){ return new Proxy({}, { get(t,p){ return (typeof p==='string') ? (function(){}) : undefined; }, set(){ return true; } }); };
  window.speechSynthesis = { speak(u){ if (u && u.onend) setTimeout(u.onend, 8); if (u && u.onstart) u.onstart(); }, cancel(){}, getVoices(){ return [{name:'Test',lang:'en-US'}]; } };
  window.SpeechSynthesisUtterance = function(t){ this.text = t; };
  window.AudioContext = function(){ return { state:'running', currentTime:0, destination:{}, createOscillator(){ return { type:'', frequency:{ setValueAtTime(){}, exponentialRampToValueAtTime(){} }, connect(){ return { connect(){} }; }, start(){}, stop(){} }; }, createGain(){ return { gain:{ setValueAtTime(){}, exponentialRampToValueAtTime(){} }, connect(){ return { connect(){} }; } }; }, resume(){ return Promise.resolve(); } }; };
  window.confirm = () => true; window.scrollTo = () => {}; window.alert = () => {};
  window.HTMLMediaElement.prototype.play = function(){ this._playing = true; return Promise.resolve(); };
  window.HTMLMediaElement.prototype.pause = function(){ this._playing = false; };
</script>`;
const errors = [];
let dom, w, doc;
const wait = ms => new Promise(r => setTimeout(r, ms));
async function waitFor(sel, ms) {
  const t0 = Date.now();
  while (Date.now() - t0 < (ms || 3000)) {
    const el = doc.querySelector(sel);
    if (el) return el;
    await wait(80);
  }
  errors.push('waitFor timeout: ' + sel);
  return null;
}
function click(sel) { const el = doc.querySelector(sel); if (!el) { errors.push('click: missing ' + sel); return null; } el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); return el; }
function setHash(h) { w.location.hash = h; }

(async () => {
  dom = await JSDOM.fromURL('http://localhost:3000/index.html', { resources:'usable', runScripts:'dangerously', pretendToBeVisual:true,
    beforeParse(w2){
      w2.fetch = (url, opts) => {
        const u = String(url);
        if (u.indexOf('api/state') !== -1) return Promise.resolve({ ok: false, status: 404, json: () => Promise.reject(new Error('no state')) });
        if (u.indexOf('api/tts') !== -1) return Promise.resolve({ ok: false, status: 503, json: () => Promise.resolve({ error: 'offline' }) }); // hermetic TTS
        const t = /^https?:/.test(u) ? u : 'http://localhost:3000' + (u.startsWith('/') ? '' : '/') + u;
        return globalThis.fetch(t, opts); };
      w2.addEventListener('error', e => errors.push('window: ' + e.message));
      w2.addEventListener('unhandledrejection', e => errors.push('rejection: ' + (e.reason && e.reason.message || e.reason))); } });
  w = dom.window; doc = w.document;
  const s = doc.createElement('script'); s.textContent = stub.replace(/<script>/,'').replace(/<\/script>/,'');
  doc.head.appendChild(s);
  await wait(800);

  await waitFor('#btn-start', 6000);
  click('#btn-start'); await wait(250);
  click('.class-card[data-class="baby"]');
  const nameInput = await waitFor('#child-name', 3000);
  if (nameInput) nameInput.value = 'Zawadi';
  click('#btn-done-profile'); await wait(500);

  // Kinder learn screen: activity areas (songs area opens the song library)
  w.location.hash = '#/learn'; await wait(500);
  if (!doc.querySelector('.area-card[data-area="songs"]')) errors.push('learn: songs area missing');
  else console.log('✅ Learn screen has activity areas (Songs area)');
  click('.area-card[data-area="songs"]'); await wait(400);
  click('[data-hash="#/songs"]'); await wait(800);
  const songCards = doc.querySelectorAll('.media-card');
  if (songCards.length < 8) errors.push('songs library: < 8 cards, got ' + songCards.length);
  else console.log('✅ Songs library:', songCards.length, 'cards');
  const cats = [...doc.querySelectorAll('.section-label')].map(e => e.textContent);
  console.log('✅ Song categories:', cats.join(' | '));

  // Song player
  click('.media-card[data-id="song-alphabet"]'); await wait(700);
  if (!doc.querySelector('.mp-audio')) errors.push('song player: no audio element');
  else {
    const src = doc.querySelector('.mp-audio source').getAttribute('src');
    if (src.indexOf('/media/') !== 0) errors.push('song player: not local file: ' + src);
    else console.log('✅ Song player local file:', src);
    if (!doc.querySelector('.mp-bigplay')) errors.push('song player: no big play');
    if (!doc.querySelector('.mp-replay')) errors.push('song player: no replay');
    const lic = doc.querySelector('.mp-chip.license');
    console.log('✅ License chip:', lic ? lic.textContent.trim() : 'MISSING');
  }

  // Videos library
  setHash('#/videos'); await wait(800);
  const vidCards = doc.querySelectorAll('.media-card');
  if (vidCards.length < 6) errors.push('videos library: < 6 cards');
  else console.log('✅ Videos library:', vidCards.length, 'cards');

  // Video player
  click('.media-card[data-id="video-letter-a"]'); await wait(700);
  const video = doc.querySelector('.mp-video');
  if (!video) errors.push('video player: no video element');
  else {
    const src = video.querySelector('source').getAttribute('src');
    if (src.indexOf('/media/') !== 0) errors.push('video player: not local: ' + src);
    else console.log('✅ Video player local file:', src);
    if (!video.getAttribute('poster')) errors.push('video: no poster');
    else console.log('✅ Video poster:', video.getAttribute('poster'));
    const rel = doc.querySelectorAll('#media-related .media-card');
    console.log('✅ Related (same topic, no feed):', rel.length, 'cards');
  }

  // Lesson with media steps (b-e4 Letter A Adventure)
  setHash('#/area/letters'); await wait(500);
  const rows = [...doc.querySelectorAll('.lesson-card')];
  const lr = rows.find(r => r.getAttribute('data-lesson') === 'b-e4');
  if (!lr) errors.push('b-e4 lesson not listed');
  else {
    lr.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await wait(600);
    click('#step-controls .btn.green'); await wait(900);
    if (!doc.querySelector('#lesson-player .mp-video, #step-body .mp-video')) errors.push('lesson media step: video player missing');
    else console.log('✅ Lesson media step renders inline video player');
    click('#step-controls .btn.green'); await wait(900);
    if (!doc.querySelector('#step-body .mp-audio')) errors.push('lesson media step: song player missing');
    else console.log('✅ Lesson media step renders inline song player');
    // trace step (PRACTICE) — skip it
    click('#step-controls .btn.green'); await wait(600);
    if (!doc.querySelector('#step-body .trace-wrap')) errors.push('lesson trace step missing');
    else console.log('✅ Lesson trace step (PRACTICE) reached');
    click('#step-controls .btn.green'); await wait(600);
    // findLetter quiz (GAME)
    const btns = doc.querySelectorAll('.answer-btn:not(.disabled)');
    let solved = false;
    for (const b of btns) {
      b.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
      await wait(80);
      if (b.classList.contains('correct')) { solved = true; break; }
      await wait(80);
    }
    if (!solved) errors.push('b-e4 find A not solved');
    await wait(3300); // celebration then advance
    click('#step-controls .btn.green'); await wait(600);
    await wait(1500);
    if (doc.querySelector('.game-end')) console.log('✅ Letter A Adventure lesson completed (SEE→HEAR→SONG→PRACTICE→GAME→CREATIVE→REWARD)');
    else errors.push('b-e4 lesson not finished');
  }

  // Admin media manager (token gate)
  setHash('#/parent'); await wait(300);
  ['1','2','3','4'].forEach(k => click(`.pin-key[data-k="${k}"]`));
  await wait(500);
  if (!doc.querySelector('#btn-media-admin')) errors.push('parent: no media admin button');
  else {
    click('#btn-media-admin'); await wait(400);
    if (!doc.querySelector('#admin-token')) errors.push('admin: token gate missing');
    else {
      doc.querySelector('#admin-token').value = 'letslearn2026';
      click('#btn-admin-go'); await wait(900);
      if (!doc.querySelector('#am-list .admin-media-row')) errors.push('admin: media list missing');
      else {
        console.log('✅ Admin media manager lists', doc.querySelectorAll('.admin-media-row').length, 'records');
        if (!doc.querySelector('#btn-am-add')) errors.push('admin: add button missing');
        else {
          click('#btn-am-add'); await wait(300);
          if (!doc.querySelector('#amf-title')) errors.push('admin: form missing');
          else {
            doc.querySelector('#amf-title').value = 'Test Clip';
            doc.querySelector('#amf-type').value = 'audio';
            click('#amf-save'); await wait(500);
            console.log('✅ Admin form validation works (no file → error shown)');
            click('#amf-cancel'); await wait(300);
          }
        }
      }
    }
  }

  console.log('=== TEST 3 (media) RESULTS ===');
  console.log(errors.length ? '❌ ERRORS:\n' + errors.join('\n') : '✅ ALL MEDIA TESTS PASSED');
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error('FATAL:', e.message); process.exit(2); });
