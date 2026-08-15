/* Targeted test #2: math lessons, trace/color steps inside lessons,
   class-specific games, adventure claim, journey dots. */
const { JSDOM } = require('jsdom');
const stub = `<script>
  HTMLCanvasElement.prototype.getContext = function(){ return new Proxy({}, { get(t,p){ return (typeof p==='string') ? (function(){}) : undefined; }, set(){ return true; } }); };
  window.speechSynthesis = { speak(u){ if (u && u.onend) setTimeout(u.onend, 8); if (u && u.onstart) u.onstart(); }, cancel(){}, getVoices(){ return [{name:'Test',lang:'en-US'}]; } };
  window.SpeechSynthesisUtterance = function(t){ this.text = t; };
  window.AudioContext = function(){ return { state:'running', currentTime:0, destination:{}, createOscillator(){ return { type:'', frequency:{ setValueAtTime(){}, exponentialRampToValueAtTime(){} }, connect(){ return { connect(){} }; }, start(){}, stop(){} }; }, createGain(){ return { gain:{ setValueAtTime(){}, exponentialRampToValueAtTime(){} }, connect(){ return { connect(){} }; } }; }, resume(){ return Promise.resolve(); } }; };
  window.confirm = () => true; window.scrollTo = () => {};
  window.PointerEvent = class PointerEvent extends window.MouseEvent { constructor(type, opts){ super(type, opts); this.pointerId = (opts && opts.pointerId) || 1; } };
  window.HTMLMediaElement.prototype.play = function(){ return Promise.resolve(); };
</script>`;
const errors = [];
let dom, w, doc;
const wait = ms => new Promise(r => setTimeout(r, ms));
function click(sel) { const el = doc.querySelector(sel); if (!el) { errors.push('click: missing ' + sel); return null; } el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); return el; }
function setHash(h) { w.location.hash = h; }
async function solveQuiz(rounds = 8) {
  for (let i = 0; i < rounds; i++) {
    const btns = doc.querySelectorAll('.answer-btn:not(.disabled)');
    const matchBtns = doc.querySelectorAll('.match-card:not(.matched)');
    const orderBtns = doc.querySelectorAll('.order-chip:not(.picked)');
    if (btns.length) {
      let solved = false;
      for (const b of btns) {
        b.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
        await wait(80);
        if (b.classList.contains('correct')) { solved = true; break; }
        await wait(80);
      }
      if (!solved) errors.push('quiz unsolved');
      await wait(3300); // celebration then advance
    } else if (matchBtns.length) {
      const a = matchBtns[0];
      a.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
      await wait(50);
      const b = doc.querySelector(`.match-card[data-key="${a.getAttribute('data-key')}"][data-kind="${a.getAttribute('data-kind') === 'pic' ? 'word' : 'pic'}"]`);
      if (b) b.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
      await wait(700);
    } else if (orderBtns.length) {
      orderBtns[0].dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
      await wait(500);
    } else {
      const next = doc.querySelector('.lesson-stage .btn.green');
      if (next) { click('.lesson-stage .btn.green'); await wait(250); }
      else return;
    }
  }
}
async function setup(classId) {
  setHash('#/parent'); await wait(250);
  if (doc.querySelector('.pin-pad')) {
    ['1','2','3','4'].forEach(k => click(`.pin-key[data-k="${k}"]`));
    await wait(500);
    if (doc.querySelector('#btn-clear')) { click('#btn-clear'); await wait(400); }
  }
  setHash('#/welcome'); await wait(400);
  click('#btn-start'); await wait(250);
  click(`.class-card[data-class="${classId}"]`); await wait(250);
  doc.querySelector('#child-name').value = 'Kato';
  click('#btn-done-profile'); await wait(400);
}
(async () => {
  dom = await JSDOM.fromURL('http://localhost:3000/index.html', { resources:'usable', runScripts:'dangerously', pretendToBeVisual:true,
    beforeParse(w2){
      w2.fetch = (url, opts) => {
        const u = String(url);
        if (u.indexOf('api/state') !== -1) return Promise.resolve({ ok: false, status: 404, json: () => Promise.reject(new Error('no state')) });
        if (u.indexOf('api/tts') !== -1) return Promise.resolve({ ok: false, status: 503, json: () => Promise.resolve({ error: 'offline' }) }); // hermetic TTS
        const t = /^https?:/.test(u) ? u : 'http://localhost:3000' + (u.startsWith('/') ? '' : '/') + u;
        return globalThis.fetch(t, opts); };
      w2.addEventListener('error', e => errors.push('window: ' + e.message)); } });
  w = dom.window; doc = w.document;
  const s = doc.createElement('script'); s.textContent = stub.replace(/<script>/,'').replace(/<\/script>/,'');
  doc.head.appendChild(s);
  await wait(700);

  // A: Baby games
  await setup('baby');
  setHash('#/play'); await wait(300);
  const babyGames = [...doc.querySelectorAll('[data-game]')].map(b => b.getAttribute('data-game'));
  if (babyGames.join(',') !== 'counting,shapes,colors') errors.push('baby games wrong: ' + babyGames);
  else console.log('✅ Baby games:', babyGames.join(', '));

  // B: P3 games include mathpop
  setHash('#/parent'); await wait(250);
  ['1','2','3','4'].forEach(k => click(`.pin-key[data-k="${k}"]`));
  await wait(500);
  click('#btn-edit-child'); await wait(250);
  click('.class-card[data-class="p3"]'); await wait(250);
  doc.querySelector('#child-name').value = 'Kato';
  click('#btn-done-profile'); await wait(400);
  setHash('#/play'); await wait(300);
  const p3Games = [...doc.querySelectorAll('[data-game]')].map(b => b.getAttribute('data-game'));
  if (p3Games.indexOf('mathpop') === -1) errors.push('p3 games missing mathpop: ' + p3Games);
  else console.log('✅ P3 games:', p3Games.join(', '));

  // C: P3 maths lesson
  setHash('#/learn'); await wait(300);
  click('.subject-card[data-subject="maths"]'); await wait(300);
  click('.lesson-card'); await wait(400);
  await solveQuiz(20);
  await wait(600);
  if (doc.querySelector('.game-end')) console.log('✅ P3 maths lesson completed');
  else errors.push('P3 maths lesson did not finish');

  // D: Baby colour + drawing area lessons (b-c1 colour the apple, b-c2 trace)
  await setup('baby');
  setHash('#/learn'); await wait(400);
  click('.area-card[data-area="colours"]'); await wait(400);
  click('.lesson-card[data-lesson="b-c1"]'); await wait(400);
  click('.lesson-stage .btn.green'); await wait(400);
  const zones = doc.querySelectorAll('.zone');
  if (!zones.length) errors.push('coloring step: no zones rendered');
  for (const z of zones) { z.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); await wait(30); }
  await wait(300);
  const doneCol = doc.querySelector('.btn-done');
  if (doneCol && !doneCol.disabled) { click('.btn-done'); console.log('✅ Baby coloring step advanced lesson'); } else errors.push('coloring step done disabled');
  await wait(1500);
  setHash('#/area/drawing'); await wait(400);
  click('.lesson-card[data-lesson="b-c2"]'); await wait(400);
  click('.lesson-stage .btn.green'); await wait(400);
  const canvas = doc.querySelector('.trace-canvas-wrap canvas');
  if (!canvas) errors.push('trace canvas missing in lesson');
  else {
    const rect = { left: 0, top: 0, width: 500, height: 500 };
    canvas.getBoundingClientRect = () => rect;
    const SCALE = 500 / 100;
    const waypoints = w.LLData.TRACE_TEMPLATES.shape.circle;
    for (const [wx, wy] of waypoints) {
      const x = wx * SCALE, y = wy * SCALE;
      canvas.dispatchEvent(new w.PointerEvent('pointerdown', { bubbles: true, clientX: x, clientY: y, pointerId: 1 }));
      canvas.dispatchEvent(new w.PointerEvent('pointermove', { bubbles: true, clientX: x + 2, clientY: y + 2, pointerId: 1 }));
      canvas.dispatchEvent(new w.PointerEvent('pointerup', { bubbles: true, clientX: x + 2, clientY: y + 2, pointerId: 1 }));
      await wait(25);
    }
    await wait(200);
    const pct = doc.querySelector('.trace-pct');
    console.log('✅ Trace % after simulated strokes:', pct ? pct.textContent + '%' : 'n/a');
    const doneTr = doc.querySelector('.trace-done');
    if (doneTr && !doneTr.disabled) { click('.trace-done'); await wait(1200); console.log('✅ Tracing step advanced lesson'); }
    else errors.push('trace done stayed disabled');
  }

  // E: mathpop game
  await setup('p3');
  setHash('#/play'); await wait(300);
  click('[data-game="mathpop"]'); await wait(400);
  for (let i = 0; i < 6; i++) {
    if (doc.querySelector('.game-end')) break;
    const bls = [...doc.querySelectorAll('.balloon')];
    if (!bls.length) { await wait(1200); i--; continue; }
    let solved = false;
    for (const bl of bls) {
      bl.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
      await wait(150);
      if (bl.classList.contains('popped')) { solved = true; break; }
      await wait(80);
    }
    if (!solved && !doc.querySelector('.game-end')) errors.push('mathpop round unsolved');
    await wait(1200);
  }
  await wait(4500); // big celebration, then end screen
  if (doc.querySelector('.game-end')) console.log('✅ Math balloons game completed');
  else errors.push('mathpop no end screen');

  // F: adventure
  setHash('#/adventure'); await wait(300);
  const claim = doc.querySelector('#btn-claim');
  console.log('✅ Adventure claim button state:', claim.disabled ? 'disabled (ok if tasks pending)' : 'enabled');

  // G: journey
  setHash('#/journey'); await wait(300);
  if (doc.querySelectorAll('.jtab').length !== 5) errors.push('journey tabs != 5');
  click('.jtab[data-subject="maths"]'); await wait(300);
  if (!doc.querySelector('.journey-path')) errors.push('journey maths path missing');
  else console.log('✅ Journey tabs + maths path OK');

  console.log('=== TEST 2 (games & lessons) RESULTS ===');
  console.log(errors.length ? '❌ ERRORS:\n' + errors.join('\n') : '✅ ALL TARGETED TESTS PASSED');
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error('FATAL:', e); process.exit(2); });
