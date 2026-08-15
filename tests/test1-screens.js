/* Full-frontend smoke test: boots the app in jsdom and clicks through
   every major screen, playing a lesson and a game, doing coloring/tracing.
   Canvas, SpeechSynthesis and AudioContext are stubbed.
   Run:  node tests/test1-screens.js   (requires the server on :3000 and jsdom) */
const { JSDOM } = require('jsdom');

const stubHTML = `<script>
  HTMLCanvasElement.prototype.getContext = function(){ return new Proxy({}, { get(t,p){ return (typeof p==='string') ? (function(){}) : undefined; }, set(){ return true; } }); };
  window.speechSynthesis = { speak(u){ if (u && u.onend) setTimeout(u.onend, 8); if (u && u.onstart) u.onstart(); }, cancel(){}, getVoices(){ return [{name:'Test',lang:'en-US'}]; } };
  window.SpeechSynthesisUtterance = function(t){ this.text = t; };
  window.AudioContext = function(){ return { state:'running', currentTime:0, destination:{}, createOscillator(){ return { type:'', frequency:{ setValueAtTime(){}, exponentialRampToValueAtTime(){} }, connect(){ return { connect(){} }; }, start(){}, stop(){} }; }, createGain(){ return { gain:{ setValueAtTime(){}, exponentialRampToValueAtTime(){} }, connect(){ return { connect(){} }; } }; }, resume(){ return Promise.resolve(); } }; };
  window.confirm = () => true;
  window.alert = () => {};
  if (!window.Element.prototype.setPointerCapture) window.Element.prototype.setPointerCapture = function(){};
  window.HTMLMediaElement.prototype.play = function(){ return Promise.resolve(); };
</script>`;

let errors = [];
let dom;

async function boot() {
  dom = await JSDOM.fromURL('http://localhost:3000/index.html', {
    resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(window) {
      // jsdom has no fetch — route through Node's fetch to the test server
      window.fetch = (url, opts) => {
        const u = String(url);
        if (u.indexOf('api/tts') !== -1) return Promise.resolve({ ok: false, status: 503, json: () => Promise.resolve({ error: 'offline' }) });
        const target = u.startsWith('http') ? u : 'http://localhost:3000' + u;
        return globalThis.fetch(target, opts);
      };
      window.addEventListener('error', e => errors.push('window error: ' + e.message));
    }
  });
  const w = dom.window;
  const s = w.document.createElement('script');
  s.textContent = stubHTML.replace(/<script>/,'').replace(/<\/script>/,'');
  w.document.head.appendChild(s);
  await new Promise(r => setTimeout(r, 700));
  return w;
}
function click(w, sel) {
  const el = w.document.querySelector(sel);
  if (!el) throw new Error('click: not found ' + sel);
  el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  return el;
}
function setHash(w, h) { w.location.hash = h; }
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const w = await boot();
  const doc = w.document;

  await wait(300);
  if (!doc.querySelector('#btn-start')) errors.push('welcome: no start button');
  click(w, '#btn-start');
  await wait(200);
  if (!doc.querySelector('.class-card')) errors.push('class: no class cards');
  click(w, '.class-card[data-class="p2"]');
  await wait(200);
  const nameInput = doc.querySelector('#child-name');
  if (!nameInput) errors.push('profile: no name input');
  nameInput.value = 'Amina';
  click(w, '.avatar-opt[data-avatar="panda"]');
  click(w, '#btn-done-profile');
  await wait(300);

  if (!doc.querySelector('.home-hello')) errors.push('home: not rendered');
  const hello = doc.querySelector('.hh-name').textContent;
  if (hello.indexOf('Amina') === -1) errors.push('home: name missing: ' + hello);
  if (!doc.querySelector('.adventure-banner')) errors.push('home: no adventure banner');
  if (doc.querySelectorAll('.nav-item').length !== 5) errors.push('home: nav items != 5');

  if (doc.querySelectorAll('.subject-card').length !== 5) errors.push('home: subject cards != 5');
  else console.log('✅ Home shows 5 subject cards');

  click(w, '.subject-card[data-subject="english"]');
  await wait(200);
  const lessonBtns = doc.querySelectorAll('.lesson-card');
  if (!lessonBtns.length) errors.push('subject: no lessons');
  click(w, '.lesson-card');
  await wait(300);
  if (!doc.querySelector('#lesson-player .lesson-stage')) errors.push('lesson: player not rendered');

  for (let i = 0; i < 8; i++) {
    const next = doc.querySelector('.lesson-stage .btn.green');
    const answer = doc.querySelector('.answer-btn');
    if (answer) { click(w, '.answer-btn'); await wait(3300); }
    else if (next) { click(w, '.lesson-stage .btn.green'); await wait(300); }
    else break;
  }
  for (let i = 0; i < 12; i++) {
    const quizBtns = doc.querySelectorAll('.answer-btn:not(.disabled)');
    const matchBtns = doc.querySelectorAll('.match-card:not(.matched)');
    const orderBtns = doc.querySelectorAll('.order-chip:not(.picked)');
    if (quizBtns.length) {
      // if this is a counting question, the visible objects must equal the answer
      const field = doc.querySelector('#step-body .count-field');
      let solved = false, correctVal = null;
      for (const b of quizBtns) {
        b.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
        await wait(100);
        if (b.classList.contains('correct')) { solved = true; correctVal = b.textContent.trim(); break; }
        await wait(100);
      }
      if (!solved) errors.push('lesson: could not solve quiz step');
      else if (field) {
        const visible = field.querySelectorAll('.cf-item').length;
        if (String(correctVal) !== String(visible)) errors.push('lesson count mismatch: ' + visible + ' object(s) shown but answer ' + correctVal);
        else console.log('✅ Lesson count step: ' + visible + ' object(s) shown, answer ' + correctVal + ' — match');
      }
      await wait(3300); // celebration (jingle + dance) then advance
    } else if (matchBtns.length) {
      const first = matchBtns[0];
      first.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
      await wait(50);
      const second = doc.querySelector(`.match-card[data-key="${first.getAttribute('data-key')}"][data-kind="${first.getAttribute('data-kind') === 'pic' ? 'word' : 'pic'}"]`);
      if (second) second.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
      await wait(700);
    } else if (orderBtns.length) {
      orderBtns[0].dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
      await wait(500);
    } else {
      const next = doc.querySelector('.lesson-stage .btn.green');
      if (next) { click(w, '.lesson-stage .btn.green'); await wait(300); }
      else break;
    }
  }
  await wait(1500);
  if (!doc.querySelector('.game-end')) errors.push('lesson: never finished (no game-end)');
  else console.log('✅ Lesson finished (results screen shown)');

  // auto-advance: the app should move on to the next challenge by itself
  const lessonHash = w.location.hash;
  let autoAdvanced = false;
  for (let i = 0; i < 60; i++) {
    if (w.location.hash !== lessonHash && w.location.hash.startsWith('#/lesson/')) { autoAdvanced = true; break; }
    await wait(150);
  }
  if (!autoAdvanced) errors.push('lesson: did not auto-advance to next challenge');
  else console.log('✅ Lesson auto-advances to the next challenge: ' + w.location.hash);
  await wait(500); // let the next lesson render

  setHash(w, '#/play');
  await wait(300);
  const games = doc.querySelectorAll('[data-game]');
  if (!games.length) errors.push('play: no games for P2');

  click(w, '[data-game="counting"]');
  await wait(300);
  for (let i = 0; i < 6; i++) {
    // THE VISUAL MUST MATCH THE ANSWER: count the objects actually shown
    const visible = doc.querySelectorAll('.count-field .cf-item').length;
    const btns = doc.querySelectorAll('.answer-btn:not(.disabled)');
    if (!visible) { errors.push('counting game: no objects rendered'); break; }
    let solved = false, correctVal = null;
    for (const b of btns) {
      b.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
      await wait(90);
      if (b.classList.contains('correct')) { solved = true; correctVal = +b.getAttribute('data-n'); break; }
      await wait(90);
    }
    if (!solved) errors.push('game: could not solve round');
    else if (correctVal !== visible) errors.push('counting game mismatch: ' + visible + ' object(s) shown but answer is ' + correctVal);
    else console.log('✅ Counting round: ' + visible + ' object(s) shown, answer ' + correctVal + ' — match');
    await wait(1000);
  }
  await wait(4500); // big celebration fanfare, then end screen
  if (!doc.querySelector('.game-end')) errors.push('game: no end screen');

  setHash(w, '#/creative');
  await wait(300);
  click(w, '[data-go="coloring"]');
  await wait(200);
  click(w, '[data-tpl="apple"]');
  await wait(300);
  if (!doc.querySelector('.coloring-svg-wrap svg')) errors.push('coloring: svg missing');
  const zones = doc.querySelectorAll('.zone');
  for (let i = 0; i < zones.length; i++) {
    zones[i].dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await wait(40);
  }
  await wait(200);
  const doneBtn = doc.querySelector('.btn-done');
  if (doneBtn && !doneBtn.disabled) { click(w, '.btn-done'); await wait(300); }
  else errors.push('coloring: done stayed disabled');

  setHash(w, '#/tracing');
  await wait(200);
  if (!doc.querySelectorAll('.trace-option').length) errors.push('tracing: no options');
  click(w, '.trace-option[data-k="letter"][data-w="A"]');
  await wait(300);
  if (!doc.querySelector('.trace-canvas-wrap canvas')) errors.push('tracing: canvas missing');

  setHash(w, '#/rewards');
  await wait(300);
  if (!doc.querySelector('.badge-grid')) errors.push('rewards: no badges');
  if (doc.querySelectorAll('.badge-card').length !== 12) errors.push('rewards: badge count != 12');

  setHash(w, '#/journey');
  await wait(300);
  if (!doc.querySelector('.journey-path')) errors.push('journey: missing');

  setHash(w, '#/adventure');
  await wait(300);
  if (doc.querySelectorAll('.task-row').length !== 3) errors.push('adventure: tasks != 3');

  setHash(w, '#/progress');
  await wait(300);
  if (!doc.querySelector('.progress-hero')) errors.push('progress: missing');

  setHash(w, '#/parent');
  await wait(200);
  if (!doc.querySelector('.pin-pad')) errors.push('parent: pin pad missing');
  click(w, '.pin-key[data-k="1"]');
  click(w, '.pin-key[data-k="2"]');
  click(w, '.pin-key[data-k="3"]');
  click(w, '.pin-key[data-k="4"]');
  await wait(600);
  const pdots = [...doc.querySelectorAll('.pin-dots .pd')].map(d => d.className);
  const pinHash = w.location.hash;
  const pinTitle = doc.querySelector('.screen-title') ? doc.querySelector('.screen-title').textContent : 'none';
  console.log('DEBUG parent: hash=' + pinHash + ' title=' + pinTitle + ' dots=' + pdots.join(','));
  if (!doc.querySelector('.stat-cards')) errors.push('parent: dashboard missing after PIN');
  if (doc.querySelectorAll('.stat-card').length !== 5) errors.push('parent: stat cards != 5');

  console.log('=== TEST 1 (screens) RESULTS ===');
  console.log(errors.length ? '❌ ERRORS:\n' + errors.join('\n') : '✅ ALL SCREENS PASSED');
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error('FATAL:', e); process.exit(2); });
