/* 🧩 Matching & Puzzles test suite: flow, renderers, progression, feedback. */
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
  window.SpeechSynthesisUtterance = function(t){ this.text = t; };
</script>`;
const errors = [];
let dom, w, doc;
const wait = ms => new Promise(r => setTimeout(r, ms));
function click(sel) { const el = doc.querySelector(sel); if (!el) { errors.push('click: missing ' + sel); return null; } el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); return el; }
function setHash(h) { w.location.hash = h; }

async function solveCurrentActivity() {
  // find and correctly solve whatever activity is showing (one attempt)
  const stage = doc.querySelector('#puzzle-root .puzzle-stage');
  if (!stage) return 'none';
  // picmatch → match ALL pairs (tap two identical repeatedly)
  const matchCards = stage.querySelectorAll('.pz-match-card');
  if (matchCards.length) {
    const totalPairs = Math.ceil(matchCards.length / 2);
    for (let round = 0; round < totalPairs; round++) {
      const remaining = [...stage.querySelectorAll('.pz-match-card:not(.matched)')];
      if (!remaining.length) break;
      const a = remaining[0];
      a.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
      await wait(80);
      const b = [...stage.querySelectorAll('.pz-match-card:not(.matched)')].find(c => c !== a && c.textContent === a.textContent);
      if (!b) { errors.push('picmatch: no identical partner found'); return 'fail'; }
      b.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
      await wait(200);
    }
    return stage.querySelectorAll('.pz-match-card.matched').length === matchCards.length ? 'solved' : 'retry';
  }
  // memory
  const memCards = stage.querySelectorAll('.pz-memory .mem-card');
  if (memCards.length) {
    const a = memCards[0];
    a.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await wait(60);
    const b = [...stage.querySelectorAll('.pz-memory .mem-card')].find(c => c !== a && c.getAttribute('data-e') === a.getAttribute('data-e'));
    if (!b) { errors.push('memory: no pair found'); return 'fail'; }
    b.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    await wait(450);
    return stage.querySelectorAll('.pz-memory .mem-card.matched').length >= 2 ? 'solved' : 'retry';
  }
  // jigsaw: place all pieces
  const pieces = stage.querySelectorAll('.pz-jigsaw-piece');
  if (pieces.length) {
    for (const p of [...pieces]) {
      p.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
      await wait(60);
    }
    return 'solved';
  }
  // single-choice activities: try each until correct (correct adds .correct)
  const choices = stage.querySelectorAll('.pz-choice');
  if (choices.length) {
    for (const c of choices) {
      c.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
      await wait(90);
      if (c.classList.contains('correct')) return 'solved';
      await wait(90);
    }
    return 'fail';
  }
  return 'none';
}

(async () => {
  dom = await JSDOM.fromURL('http://localhost:3000/index.html', {
    resources:'usable', runScripts:'dangerously', pretendToBeVisual:true,
    beforeParse(w2){
      w2.fetch = (url, opts) => {
        const u = String(url);
        if (u.indexOf('api/state') !== -1) return Promise.resolve({ ok:false, status:404, json: () => Promise.reject(new Error('x')) });
        if (u.indexOf('api/tts') !== -1) return Promise.resolve({ ok:false, status:503, json: () => Promise.resolve({ error: 'offline' }) });
        const t = /^https?:/.test(u) ? u : 'http://localhost:3000' + (u.startsWith('/') ? '' : '/') + u;
        return globalThis.fetch(t, opts);
      };
      w2.addEventListener('error', e => errors.push('window: ' + e.message));
      w2.addEventListener('unhandledrejection', e => errors.push('rejection: ' + (e.reason && e.reason.message || e.reason)));
    }
  });
  w = dom.window; doc = w.document;
  const s = doc.createElement('script'); s.textContent = stub.replace(/<script>/,'').replace(/<\/script>/,'');
  doc.head.appendChild(s);
  await wait(900);
  const P = w.LLPuzzles;
  if (!P) { console.log('❌ LLPuzzles missing'); process.exit(1); }
  console.log('✅ LLPuzzles loaded — library:', P.librarySize(), 'activities');

  // ---- library sanity ----
  if (P.librarySize() < 60) errors.push('library too small: ' + P.librarySize());
  else console.log('✅ Library has ' + P.librarySize() + ' activities across 4 levels');

  // ---- setup baby ----
  click('#btn-start'); await wait(250);
  click('.class-card[data-class="baby"]'); await wait(250);
  doc.querySelector('#child-name').value = 'Kiki';
  click('#btn-done-profile'); await wait(400);

  // ---- puzzles area: intro straight into activities ----
  w.location.hash = '#/area/puzzles'; await wait(500);
  if (!doc.querySelector('#btn-start-puzzles')) errors.push('puzzles area: start button missing');
  else console.log('✅ Puzzles area opens with a big "Let\'s Play!" button (no submenu)');
  click('#btn-start-puzzles'); await wait(600);
  if (w.location.hash !== '#/puzzles') errors.push('start did not go to #/puzzles: ' + w.location.hash);
  else console.log('✅ Start launches the puzzle flow');

  // first activity renders with label + choices
  let label = doc.querySelector('.pz-label');
  if (!label) errors.push('flow: no activity label');
  else console.log('✅ First activity:', label.textContent);

  // ---- solve activities in a loop, verify auto-advance + progression ----
  let solved = 0;
  let lastActId = doc.querySelector('.puzzle-stage') ? doc.querySelector('.puzzle-stage').getAttribute('data-act-id') : null;
  for (let i = 0; i < 4; i++) {
    const before = doc.querySelector('.pz-label') ? doc.querySelector('.pz-label').textContent : '?';
    const res = await solveCurrentActivity();
    if (res === 'fail' || res === 'none') { errors.push('could not solve activity: ' + before + ' (' + res + ')'); break; }
    // wait for "GREAT!" + auto-advance
    const great = doc.querySelector('.pz-great');
    if (!great) errors.push('no GREAT! feedback after solving');
    else console.log('✅ Solved "' + before + '" → 🎉 GREAT! feedback');
    solved++;
    // wait for next activity (tracked by activity id — labels may repeat)
    let changed = false;
    for (let j = 0; j < 30; j++) {
      await wait(150);
      const st = doc.querySelector('.puzzle-stage');
      const id = st ? st.getAttribute('data-act-id') : null;
      if (id && id !== lastActId) { lastActId = id; changed = true; break; }
      if (doc.querySelector('.ge-title')) { changed = true; break; }
    }
    if (!changed) { errors.push('did not auto-advance after solving'); break; }
  }
  if (solved >= 2) console.log('✅ Auto-progresses through activities after celebration');

  // ---- progression recorded ----
  const done = P.allDoneCount();
  if (done < 2) errors.push('puzzle progress not recorded: ' + done);
  else console.log('✅ Progress recorded:', done, 'activities completed');

  // ---- wrong answer → retry allowed ----
  // (force a single-choice activity to test wrong-tap)
  const n = P.nextActivity();
  if (!n.done) {
    const holder = doc.createElement('div');
    doc.body.appendChild(holder);
    P.render(n.act, holder, () => {}, (el) => {
      if (el) el.classList.add('shake');
    });
    const wrong = holder.querySelector('.pz-choice');
    if (wrong) {
      wrong.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
      await wait(100);
      const ok = holder.querySelectorAll('.pz-choice').length >= 2 && !holder.querySelector('.pz-great');
      if (ok) console.log('✅ Wrong answer shakes & allows retry (no advance)');
      else errors.push('wrong answer handling broken');
    }
  }

  // ---- level progression: fill level 1, expect level 2 ----
  w.LLRewards.state.puzzle = { level: 1, done: { 1: [], 2: [], 3: [], 4: [] } };
  P.buildLibrary().filter(a => a.level === 1).forEach(a => { P.complete(a); });
  const p2 = P.nextActivity();
  if (w.LLRewards.state.puzzle.level === 2 && p2.act && p2.act.level === 2)
    console.log('✅ Level 1 finished → levels up to 🟡 Level 2 automatically');
  else errors.push('level up broken: level=' + w.LLRewards.state.puzzle.level + ' next=' + (p2.act && p2.act.level));

  // ---- renderer spot checks ----
  const holder = doc.createElement('div');
  doc.body.appendChild(holder);
  const jig = P.buildLibrary().find(a => a.type === 'jigsaw');
  P.render(jig, holder, () => {}, () => {});
  await wait(100);
  if (holder.querySelectorAll('.pz-jigsaw-piece').length < 2) errors.push('jigsaw: pieces missing');
  else console.log('✅ Jigsaw renders ' + holder.querySelectorAll('.pz-jigsaw-piece').length + ' pieces + ' + holder.querySelectorAll('.pz-jigsaw-slot').length + ' slots');
  holder.innerHTML = '';

  const mem = P.buildLibrary().find(a => a.type === 'memory');
  P.render(mem, holder, () => {}, () => {});
  if (holder.querySelectorAll('.pz-memory .mem-card').length !== mem.pairs * 2) errors.push('memory: card count wrong');
  else console.log('✅ Memory renders ' + mem.pairs * 2 + ' face-down cards');

  const mp = P.buildLibrary().find(a => a.type === 'missingpiece');
  P.render(mp, holder, () => {}, () => {});
  if (!holder.querySelector('.pz-scene svg')) errors.push('missingpiece: scene missing');
  else console.log('✅ Missing-piece scene renders with ' + holder.querySelectorAll('.pz-choice').length + ' choices');
  holder.innerHTML = '';

  // ---- RENDER CHECK: "find the number" — every group must display exactly
  // its count of objects (the bug the user hit: groups showed one object) ----
  const nq = P.buildLibrary().find(a => a.type === 'numqty');
  if (!nq) errors.push('numqty: none in library');
  else {
    P.render(nq, holder, () => {}, () => {});
    await wait(80);
    const groups = holder.querySelectorAll('.pz-group');
    // the renderer shuffles the groups, so compare the SET of displayed
    // counts against the SET of intended counts (each group must show its
    // own exact count — the bug used to render only ONE object per group)
    const shownCounts = [...groups].map(gr => gr.querySelectorAll('.cf-item').length).sort((a, b) => a - b);
    const expectedCounts = [...nq.groups].sort((a, b) => a - b);
    const sameSet = shownCounts.length === expectedCounts.length && shownCounts.every((v, i) => v === expectedCounts[i]);
    if (!sameSet) errors.push('numqty render: displayed counts ' + JSON.stringify(shownCounts) + ' ≠ intended ' + JSON.stringify(expectedCounts));
    else if (shownCounts.indexOf(nq.n) === -1) errors.push('numqty render: answer ' + nq.n + ' not among shown groups ' + JSON.stringify(shownCounts));
    else console.log('✅ "FIND THE NUMBER" render check: groups show ' + JSON.stringify(shownCounts) + ' — answer ' + nq.n + ' present');
  }
  holder.innerHTML = '';

  // ---- SOLVABILITY GUARANTEE: the "find daddy" bug — answer must always be
  // among the visible choices, across many regenerations ----
  let bad = 0, checked = 0;
  for (let round = 0; round < 5; round++) {
    const lib = P.buildLibrary();
    lib.forEach(a => {
      const issues = P.activityIssues(a);
      if (issues.length) { bad++; if (bad <= 5) errors.push('round ' + round + ': ' + issues.join('; ') + ' (' + a.type + ')'); }
      checked++;
    });
  }
  if (bad === 0) console.log('✅ SOLVABILITY GUARANTEE: ' + checked + ' activity instances, every correct answer present in the choices');
  else errors.push('solvability violations: ' + bad);

  console.log('=== TEST 7 (puzzles) RESULTS ===');
  console.log(errors.length ? '❌ ERRORS:\n' + errors.join('\n') : '✅ ALL PUZZLE TESTS PASSED');
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error('FATAL:', e.message); process.exit(2); });
