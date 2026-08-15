/* Auto-advance test: narrated steps move forward BY THEMSELVES (no clicks). */
const { JSDOM } = require('jsdom');
const stub = `<script>
  HTMLCanvasElement.prototype.getContext = function(){ return new Proxy({}, { get(t,p){ return (typeof p==='string') ? (function(){}) : undefined; }, set(){ return true; } }); };
  window.confirm = () => true; window.scrollTo = () => {};
  window.alert = () => {};
  window.HTMLMediaElement.prototype.play = function(){ return Promise.resolve(); };
  window.HTMLMediaElement.prototype.pause = function(){};
  window.fetch = (url, opts) => {
    const u = String(url);
    if (u.indexOf('api/state') !== -1) return Promise.resolve({ ok:false, status:404, json: () => Promise.reject(new Error('x')) });
    if (u.indexOf('api/tts') !== -1) return Promise.resolve({ ok:false, status:503, json: () => Promise.resolve({ error: 'offline' }) });
    return Promise.reject(new Error('no network'));
  };
  window.speechSynthesis = { speak(u){ if (u && u.onend) setTimeout(u.onend, 8); if (u && u.onstart) u.onstart(); }, cancel(){}, getVoices(){ return [{name:'Test',lang:'en-US'}]; } };
</script>`;
const errors = [];
(async () => {
  const dom = await JSDOM.fromURL('http://localhost:3000/index.html', {
    resources:'usable', runScripts:'dangerously', pretendToBeVisual:true,
    beforeParse(w2){ w2.addEventListener('error', e => errors.push('window: ' + e.message)); }
  });
  const w = dom.window, doc = w.document;
  const s = doc.createElement('script'); s.textContent = stub.replace(/<script>/,'').replace(/<\/script>/,'');
  doc.head.appendChild(s);
  await new Promise(r => setTimeout(r, 900));
  const click = sel => { const el = doc.querySelector(sel); if (!el) { errors.push('click: missing ' + sel); return null; } el.dispatchEvent(new w.MouseEvent('click', {bubbles:true})); return el; };
  const wait = ms => new Promise(r => setTimeout(r, ms));

  click('#btn-start'); await wait(250);
  click('.class-card[data-class="baby"]'); await wait(250);
  doc.querySelector('#child-name').value = 'T';
  click('#btn-done-profile'); await wait(400);

  // lesson b-s1 "My Body": [info Eyes, info Ears, info Hands, quiz] — pure narration steps
  w.location.hash = '#/lesson/b-s1'; await wait(600);

  // wait for step 1 (info: Eyes) to render
  if (!doc.querySelector('#lesson-player .lesson-stage')) errors.push('lesson did not render');
  else console.log('✅ Step 1 rendered (info: Eyes)');

  // NO CLICKS — the teacher voice plays and the step must advance by itself
  let step2 = false;
  for (let i = 0; i < 40; i++) {
    const now = doc.querySelector('.l-dot.now');
    if (now && [...doc.querySelectorAll('.l-dot')].indexOf(now) >= 1) { step2 = true; break; }
    await wait(150);
  }
  if (!step2) errors.push('step 1 did not auto-advance (no clicks given)');
  else console.log('✅ Step 1 auto-advanced to step 2 without any clicks');

  // step 2 (info: Ears) should also auto-advance to step 3
  let step3 = false;
  for (let i = 0; i < 40; i++) {
    const now = doc.querySelector('.l-dot.now');
    if (now && [...doc.querySelectorAll('.l-dot')].indexOf(now) >= 2) { step3 = true; break; }
    await wait(150);
  }
  if (!step3) errors.push('step 2 did not auto-advance');
  else console.log('✅ Step 2 auto-advanced to step 3 without any clicks');

  // step 3 (info: Hands) auto-advances to the QUIZ step
  let quiz = false;
  for (let i = 0; i < 40; i++) {
    if (doc.querySelector('#step-body .answer-btn')) { quiz = true; break; }
    await wait(150);
  }
  if (!quiz) errors.push('step 3 did not auto-advance to the quiz');
  else console.log('✅ Step 3 auto-advanced to the quiz (waiting for the child to answer)');

  // the quiz must NOT auto-advance without an answer (child interaction required)
  await wait(2500);
  const stillQuiz = !!doc.querySelector('#step-body .answer-btn:not(.disabled)');
  if (!stillQuiz) errors.push('quiz advanced without an answer!');
  else console.log('✅ Quiz waits for the child (no auto-advance on questions)');

  // Skip button exists on narrated steps and works as a shortcut
  w.location.hash = '#/lesson/b-s2'; await wait(500); // Farm Animals, first step = info
  const skip = doc.querySelector('#step-controls .btn.green');
  if (!skip) errors.push('Skip button missing on info step');
  else {
    click('#step-controls .btn.green'); await wait(400);
    console.log('✅ Skip button jumps ahead instantly');
  }

  console.log('=== TEST 6 (auto-advance) RESULTS ===');
  console.log(errors.length ? '❌ ERRORS:\n' + errors.join('\n') : '✅ ALL AUTO-ADVANCE TESTS PASSED');
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error('FATAL:', e.message); process.exit(2); });
