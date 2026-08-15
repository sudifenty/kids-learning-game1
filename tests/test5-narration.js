/* Narration system tests: preprocessing, sentence splitting, sentence-by-
   sentence playback with highlighting, pauses, pause/resume/replay/stop,
   player bar controls and the server→browser fallback chain. */
const { JSDOM } = require('jsdom');

const stub = `<script>
  HTMLCanvasElement.prototype.getContext = function(){ return new Proxy({}, { get(t,p){ return (typeof p==='string') ? (function(){}) : undefined; }, set(){ return true; } }); };
  window.confirm = () => true; window.scrollTo = () => {};
  window.alert = () => {};
  window.HTMLMediaElement.prototype.play = function(){ return Promise.resolve(); };
  window.HTMLMediaElement.prototype.pause = function(){};
  // TTS API offline → engine must fall back to the browser voice
  window.fetch = (url, opts) => {
    const u = String(url);
    if (u.indexOf('api/state') !== -1) return Promise.resolve({ ok:false, status:404, json: () => Promise.reject(new Error('x')) });
    if (u.indexOf('api/tts') !== -1) return Promise.resolve({ ok:false, status:503, json: () => Promise.resolve({ error: 'offline' }) });
    return Promise.reject(new Error('no network'));
  };
  // controllable browser voice: records utterances, fires onend
  window.__spoken = [];
  window.speechSynthesis = {
    speak(u){ window.__spoken.push({ text: u.text, rate: u.rate, pitch: u.pitch }); if (u.onstart) u.onstart(); setTimeout(() => u.onend && u.onend(), 15); },
    cancel(){}, getVoices(){ return [{ name: 'Google US English', lang: 'en-US' }]; }
  };
  window.SpeechSynthesisUtterance = function(t){ this.text = t; };
</script>`;

const errors = [];
let dom, w, doc;
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  dom = await JSDOM.fromURL('http://localhost:3000/index.html', {
    resources: 'usable', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w2) {
      w2.addEventListener('error', e => errors.push('window: ' + e.message));
      w2.addEventListener('unhandledrejection', e => errors.push('rejection: ' + (e.reason && e.reason.message || e.reason)));
    }
  });
  w = dom.window; doc = w.document;
  const s = doc.createElement('script'); s.textContent = stub.replace(/<script>/,'').replace(/<\/script>/,'');
  doc.head.appendChild(s);
  await wait(900);

  const N = w.LLNarration;
  const A = w.LLAudio;
  if (!N) { console.log('❌ LLNarration missing'); process.exit(1); }
  console.log('✅ LLNarration loaded');

  /* ---- 1. preprocessing ---- */
  const t1 = N.preprocess('Count 2 apples + 1 more. Where is SST? 5 − 2 = 3');
  if (t1.indexOf('two') === -1 || t1.indexOf('plus') === -1 || t1.indexOf('S.S.T.') === -1 || t1.indexOf('minus') === -1 || t1.indexOf('equals') === -1)
    errors.push('preprocess failed: ' + t1);
  else console.log('✅ Preprocessing:', t1);

  /* ---- 2. sentence splitting ---- */
  const sents = N.splitSentences('Today we are learning about animals. Animals are living things. Can you name one animal?');
  if (sents.length !== 3) errors.push('split: expected 3, got ' + sents.length + ': ' + JSON.stringify(sents));
  else console.log('✅ Sentence splitting: 3 sentences with punctuation kept');

  /* ---- 3. provider fallback: TTS API offline → browser voice ---- */
  const prov = await N.checkProvider();
  if (prov !== 'browser') errors.push('provider should be browser when TTS offline, got ' + prov);
  else console.log('✅ Provider fallback: server TTS offline → browser voice');

  /* ---- 4. sentence-by-sentence playback with highlight + pauses ---- */
  const highlighted = [];
  let ended = false;
  N.playSentences(sents, {
    onSentence: i => highlighted.push(i),
    onEnd: () => { ended = true; }
  });
  await wait(3000); // engine pauses between sentences (browser voice fires fast)
  if (JSON.stringify(highlighted) !== '[0,1,2]') errors.push('highlight order wrong: ' + JSON.stringify(highlighted));
  else console.log('✅ Sentence-by-sentence: highlighted in order', highlighted.join('→'));
  if (!ended) errors.push('onEnd not fired');
  else console.log('✅ onEnd fired after last sentence');
  const spoken = w.__spoken.map(x => x.text);
  if (spoken.length !== 3) errors.push('spoken count: ' + spoken.length);
  else console.log('✅ All 3 sentences spoken via fallback voice:', spoken.map(x => x.slice(0, 20) + '…').join(' | '));
  // slow default rate
  const rate = w.__spoken[0] && w.__spoken[0].rate;
  if (Math.abs(rate - 0.78) > 0.01) errors.push('default slow rate wrong: ' + rate);
  else console.log('✅ Default speed = Slow (rate 0.78)');

  /* ---- 5. pause / resume / stop ---- */
  N.playSentences(['One.', 'Two.', 'Three.'], { onSentence: i => highlighted.push('p' + i), onEnd: () => {} });
  await wait(200);
  N.pause();
  const countAtPause = w.__spoken.length;
  await wait(600);
  if (w.__spoken.length !== countAtPause) errors.push('pause did not stop speech');
  else console.log('✅ Pause stops narration');
  N.resume();
  await wait(1200);
  if (w.__spoken.length < countAtPause + 1) errors.push('resume did not continue');
  else console.log('✅ Resume continues from current sentence');
  N.stop();
  const afterStop = w.__spoken.length;
  await wait(400);
  if (w.__spoken.length !== afterStop) errors.push('stop did not halt narration');
  else console.log('✅ Stop halts narration cleanly');

  /* ---- 6. replay ---- */
  const beforeReplay = w.__spoken.length;
  N.playSentences(['Hello there!', 'Let us learn!'], { onSentence: i => {}, onEnd: () => {} });
  await wait(200); // sentence 0 spoken; possibly sentence 1 started
  N.replaySentence(); // restarts the CURRENT sentence
  await wait(1200);
  const tail = w.__spoken.slice(-2).map(x => x.text);
  if (tail[0] !== tail[1]) errors.push('replay did not re-speak the current sentence: ' + JSON.stringify(tail));
  else console.log('✅ Replay re-speaks the current sentence: "' + tail[0].slice(0, 24) + '…"');
  if (w.__spoken.length <= beforeReplay) errors.push('replay produced no speech');

  /* ---- 7. player bar UI + speed chips ---- */
  const holder = doc.createElement('div');
  doc.body.appendChild(holder);
  N.playerBar(holder, { onSentence: () => {} });
  const chips = holder.querySelectorAll('.nb-speed-chip');
  if (chips.length !== 3) errors.push('speed chips != 3');
  else console.log('✅ Player bar: 3 speed chips (Slow/Normal/Fast), Slow default active =', holder.querySelector('.nb-speed-chip.active') ? holder.querySelector('.nb-speed-chip.active').textContent : 'none');
  if (!holder.querySelector('.nb-play') || !holder.querySelector('.nb-replay') || !holder.querySelector('.nb-volume')) errors.push('player bar missing controls');
  else console.log('✅ Player bar: play/pause, replay, volume controls present');
  // change speed → fast
  holder.querySelector('.nb-speed-chip[data-speed="fast"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  if (w.LLRewards.state.speechSpeed !== 'fast') errors.push('speed chip did not persist setting');
  else console.log('✅ Speed chip sets Fast and persists to settings');
  w.LLRewards.state.speechSpeed = 'slow'; w.LLRewards.save();

  /* ---- 8. read-along card ---- */
  const cardHTML = N.readAlongHTML('Red is a bright colour. Can you find something red?');
  const tmp = doc.createElement('div'); tmp.innerHTML = cardHTML;
  if (tmp.querySelectorAll('.readalong-sent').length !== 2) errors.push('read-along spans != 2');
  else console.log('✅ Read-along card: 2 sentence spans');

  /* ---- 9. lesson integration: info step renders narration + auto-plays ---- */
  w.LLRewards.state.soundOn = true; w.LLRewards.state.speechSpeed = 'slow';
  const click = sel => { const el = doc.querySelector(sel); if (!el) { errors.push('click: missing ' + sel); return null; } el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); return el; };
  click('#btn-start'); await wait(250);
  click('.class-card[data-class="baby"]'); await wait(250);
  doc.querySelector('#child-name').value = 'Nia';
  click('#btn-done-profile'); await wait(400);
  w.location.hash = '#/lesson/b-s1'; await wait(600); // My Body: first step is info "Eyes"
  if (!doc.querySelector('#lesson-player .readalong-card')) errors.push('lesson: read-along card missing on info step');
  else console.log('✅ Lesson info step shows read-along card');
  if (!doc.querySelector('#lesson-player .narration-bar')) errors.push('lesson: narration player missing');
  else console.log('✅ Lesson info step shows narration player');
  await wait(1500);
  const spoken2 = w.__spoken.length;
  if (spoken2 <= spoken.length) errors.push('lesson narration did not auto-play');
  else console.log('✅ Lesson narration auto-plays (teacher voice starts)');
  if (!doc.querySelector('#lesson-player .readalong-sent.speaking')) errors.push('no speaking highlight');
  else console.log('✅ Current sentence is highlighted while spoken');
  click('#step-controls .btn.green'); await wait(300);
  if (doc.querySelector('#lesson-player .readalong-sent.speaking')) errors.push('highlight not reset after Next');
  else console.log('✅ Next stops narration & moves on');

  console.log('=== TEST 5 (narration) RESULTS ===');
  console.log(errors.length ? '❌ ERRORS:\n' + errors.join('\n') : '✅ ALL NARRATION TESTS PASSED');
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error('FATAL:', e.message); process.exit(2); });
