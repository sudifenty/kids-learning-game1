/* ==========================================================================
   🌈 LET'S LEARN — narration.js
   The "friendly digital teacher" voice system.

   - Natural voice: prefers the server's neural TTS provider (cached MP3s);
     falls back to the browser's speech synthesis so audio never breaks.
   - Sentence-by-sentence playback with NATURAL PAUSES (longer before
     questions), read-along highlighting and gentle auto-scroll.
   - Child-friendly controls: ▶ Play / ⏸ Pause / 🔁 Replay / 🔊 volume /
     🐢 speed (Slow • Normal • Fast — Slow is the default for young learners).
   - Pronunciation preprocessing (numbers, math symbols, abbreviations).
   - Never speaks over itself; stops cleanly when leaving a lesson.
   ========================================================================== */

window.LLNarration = (function () {
  const A = window.LLAudio;

  /* ---------------- settings (from parent-controlled state) ---------------- */
  const SPEEDS = {
    slow: { label: 'Slow', browserRate: 0.78, playRate: 0.78, estScale: 1.35 },
    normal: { label: 'Normal', browserRate: 0.95, playRate: 0.95, estScale: 1.05 },
    fast: { label: 'Fast', browserRate: 1.1, playRate: 1.1, estScale: 0.9 }
  };
  function stateOf() { return (window.LLRewards && window.LLRewards.state) || {}; }
  function speedOf() { return stateOf().speechSpeed || 'slow'; }
  function volumeOf() { const v = stateOf().speechVolume; return v == null ? 1 : v; }
  function speedCfg() { return SPEEDS[speedOf()] || SPEEDS.slow; }

  /* ---------------- pronunciation preprocessing ---------------- */
  const WORD_MAP = {
    'sst': 'S.S.T.', 'p1': 'Primary one', 'p2': 'Primary two', 'p3': 'Primary three',
    'cc0': 'C C zero', 'mr.': 'Mister', 'mrs.': 'Missis', 'tv': 'T.V.'
  };
  const NUM_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
    'eighteen', 'nineteen', 'twenty'];

  /* Emoji → spoken words so "Count the 🍎" is "Count the apple" — never a
     beep, never skipped, and it matches the bundled voice clips. */
  const EMOJI_WORDS = {
    '🍎': 'apple', '🍌': 'banana', '⭐': 'star', '🌟': 'star', '🐤': 'chick',
    '🌸': 'flower', '🎈': 'balloon', '🍓': 'strawberry', '🦋': 'butterfly',
    '🐢': 'turtle', '🌼': 'flower', '🐶': 'dog', '🐱': 'cat', '🐄': 'cow',
    '🦆': 'duck', '🐑': 'sheep', '🐘': 'elephant', '🦁': 'lion', '🐵': 'monkey',
    '🦒': 'giraffe', '🐰': 'rabbit', '☀️': 'sun', '🌧️': 'rain', '🍃': 'leaves',
    '👀': 'eyes', '👂': 'ears', '👏': 'hands', '👃': 'nose', '👅': 'tongue',
    '✋': 'hands', '👩': 'mummy', '👨': 'daddy', '👶': 'baby', '🏠': 'house',
    '🛏️': 'bed', '🍚': 'food', '👋': 'hello', '🙏': 'thank you', '🎨': 'paint',
    '⭕': 'circle', '⬜': 'square', '⚽': 'ball', '🎩': 'hat', '🦇': 'bat',
    '🏃': 'run', '🐔': 'hen', '🐣': 'chick', '🐦': 'bird', '🐟': 'fish',
    '🛵': 'boda boda', '🚌': 'bus', '🚲': 'bicycle', '🛒': 'market',
    '🕌': 'mosque', '🏫': 'school', '👩‍🏫': 'teacher', '🧑‍🤝‍🧑': 'friends',
    '👩‍⚕️': 'doctor', '👨‍🌾': 'farmer', '👮': 'police officer', '🧼': 'soap',
    '🪥': 'toothbrush', '🥕': 'carrot', '🌱': 'plant', '🌿': 'roots',
    '🪵': 'wood', '🔑': 'key', '🪣': 'bucket', '🪑': 'chair', '🍞': 'bread',
    '💧': 'water', '🦴': 'bones', '❤️': 'heart', '🫁': 'lungs', '🧹': 'broom',
    '👵': 'grandparents', '👨‍👩‍👧‍👦': 'family', '🇺🇬': 'Uganda', '🏙️': 'city',
    '🌊': 'lake', '🏞️': 'river', '🗣️': 'language', '🪘': 'drum', '🍲': 'food',
    '🦍': 'gorilla', '🍕': 'pizza', '🍰': 'cake', '🧠': 'brain', '🏐': 'ball',
    '🧲': 'magnet', '🧷': 'pin', '🌳': 'tree', '🪨': 'stone', '🚗': 'car',
    '🌙': 'moon', '🚀': 'rocket', '🪐': 'planet', '🌍': 'earth', '🧭': 'compass',
    '🗺️': 'map', '🏔️': 'mountain', '♻️': 'recycle', '🔥': 'fire', '📚': 'books',
    '📖': 'book', '✏️': 'pencil', '🖍️': 'crayon', '🎮': 'game', '🏆': 'trophy',
    '🔴': 'red', '🟡': 'yellow', '🔵': 'blue', '🟢': 'green', '🟠': 'orange',
    '🟣': 'purple', '🩷': 'pink', '🟤': 'brown', '⚫': 'black', '⚪': 'white',
    '🔺': 'triangle', '🔻': 'triangle', '🥭': 'mango', '🍇': 'grapes',
    '🧸': 'teddy', '🚂': 'train', '🪁': 'kite', '🍦': 'ice cream',
    '❄️': 'snow', '🐛': 'caterpillar', '🥚': 'egg', '👦': 'brother',
    '👧': 'sister', '🐸': 'frog', '🦄': 'unicorn'
  };

  function preprocess(text) {
    let t = ' ' + String(text || '').trim() + ' ';
    for (const e of Object.keys(EMOJI_WORDS)) t = t.split(e).join(' ' + EMOJI_WORDS[e] + ' ');
    t = t.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/gu, ' ');
    t = t.replace(/\s+/g, ' ');
    for (const k of Object.keys(WORD_MAP)) {
      t = t.replace(new RegExp('\\b' + k + '\\b', 'gi'), WORD_MAP[k]);
    }
    // math symbols → words ("5 − 2" → "five minus two")
    t = t.replace(/[×✕]/g, ' times ')
      .replace(/[–—]/g, ', ')
      .replace(/−/g, ' minus ')
      .replace(/(\d)\s*-\s*(\d)/g, '$1 minus $2')
      .replace(/(\d)\s*\+\s*(\d)/g, '$1 plus $2')
      .replace(/\+/g, ' plus ').replace(/=/g, ' equals ').replace(/÷/g, ' divided by ');
    // small numbers → words (clear for young children)
    t = t.replace(/\b(\d{1,2})\b/g, (m, n) => {
      const v = parseInt(n, 10);
      return (v >= 0 && v <= 20) ? NUM_WORDS[v] : m;
    });
    t = t.replace(/\s+/g, ' ').trim();
    if (t && !/[.!?]$/.test(t)) t += '.';
    return t;
  }

  /* split into sentences (keeps punctuation with its sentence; safe on old Safari) */
  function splitSentences(text) {
    const t = preprocess(text);
    const parts = [];
    let cur = '';
    for (const ch of t) {
      cur += ch;
      if (ch === '.' || ch === '!' || ch === '?') {
        if (cur.trim()) parts.push(cur.trim());
        cur = '';
      }
    }
    if (cur.trim()) parts.push(cur.trim());
    return parts.length ? parts : [t];
  }

  function escapeHTML(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ---------------- provider detection ---------------- */
  let provider = 'browser';
  let providerChecked = false;
  async function checkProvider() {
    if (providerChecked) return provider;
    providerChecked = true;
    try {
      if (typeof fetch !== 'function') return provider;
      const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      // Allow slow mobile networks time to answer before assuming the server
      // voice is unavailable.
      const to = ctrl ? setTimeout(() => ctrl.abort(), 6000) : null;
      const res = await fetch('api/tts/status', ctrl ? { signal: ctrl.signal } : undefined);
      if (to) clearTimeout(to);
      if (res && res.ok) provider = 'server';
    } catch (e) { /* offline → browser voice */ }
    return provider;
  }

  /* ---------------- audio cache (client session) ---------------- */
  const urlCache = {};
  function simpleHash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return 'h' + Math.abs(h);
  }
  async function audioURLFor(text) {
    const key = simpleHash(text);
    if (urlCache[key]) return urlCache[key];
    const res = await fetch('api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text })
    });
    if (!res.ok) throw new Error('tts unavailable');
    const data = await res.json();
    urlCache[key] = data.url;
    return data.url;
  }

  /* ---------------- engine state ---------------- */
  let sentences = [];
  let index = 0;
  let playing = false;
  let paused = false;
  let callbacks = null;
  let currentAudio = null;
  let timer = null;
  let lastUserScroll = 0;
  let scrollWatchInit = false;

  function sleep(ms) { return new Promise(r => { timer = setTimeout(r, ms); }); }

  function estimateMs(text) { return 900 + text.length * 82; }

  function fire(name, arg) { if (callbacks && callbacks[name]) { try { callbacks[name](arg); } catch (e) {} } }

  /* ---------------- browser voice (fallback, tuned for children) ---------------- */
  function browserSpeak(text) {
    return new Promise((resolve) => {
      try {
        if (!window.speechSynthesis) return resolve();
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
        const preferred = ['Google US English', 'Samantha', 'Microsoft Zira', 'Microsoft Aria', 'Karen', 'Moira', 'Daniel', 'en-US', 'en-GB'];
        let voice = null;
        for (const p of preferred) {
          voice = voices.find(v => v.name && v.name.toLowerCase().includes(p.toLowerCase()));
          if (voice) break;
        }
        if (!voice) voice = voices.find(v => (v.lang || '').startsWith('en')) || null;
        if (voice) u.voice = voice;
        const cfg = speedCfg();
        u.rate = cfg.browserRate;
        u.pitch = 1.2; // warm, friendly
        u.volume = Math.max(0.05, volumeOf());
        let done = false;
        const finish = () => { if (!done) { done = true; if (timer) clearTimeout(timer); resolve(); } };
        u.onend = finish;
        u.onerror = finish;
        window.speechSynthesis.speak(u);
        timer = setTimeout(finish, estimateMs(text) * cfg.estScale + 1200); // watchdog
      } catch (e) { resolve(); }
    });
  }

  /* ---------------- main loop ---------------- */
  async function playSentences(list, opts) {
    stop();
    callbacks = opts || {};
    sentences = (list || []).map(s => preprocess(s)).filter(Boolean);
    if (!sentences.length) return;
    index = 0;
    playing = true;
    paused = false;
    A.bgmDuck(true);
    fire('onStart');
    await checkProvider();
    if (playing && !paused) playCurrent();
  }

  async function playCurrent() {
    if (!playing || paused || index >= sentences.length) return;
    const text = sentences[index];
    fire('onSentence', index);
    // natural pauses: gentle before each sentence, longer before questions
    const pauseMs = index === 0 ? 350 : (text.indexOf('?') !== -1 ? 750 : 480);
    await sleep(pauseMs);
    if (!playing || paused || index >= sentences.length) return;

    try {
      if (provider === 'server') {
        const url = await audioURLFor(text);
        if (!playing || paused) return;
        const cfg = speedCfg();
        currentAudio = new Audio(url);
        currentAudio.playbackRate = cfg.playRate;
        currentAudio.volume = Math.max(0.05, volumeOf()) * 0.95;
        A.bgmDuck(true);
        let finished = false;
        const markDone = () => { finished = true; };
        currentAudio.onended = markDone;
        currentAudio.onerror = markDone;
        const est = estimateMs(text) * cfg.estScale;
        const p = currentAudio.play();
        if (p && p.catch) p.catch(() => { /* autoplay may be blocked — tap play */ });
        await Promise.race([new Promise(r => { const t0 = setInterval(() => { if (finished) { clearInterval(t0); r(); } }, 120); setTimeout(() => { clearInterval(t0); r(); }, est + 800); }), sleep(est + 800)]);
        if (currentAudio) { try { currentAudio.pause(); } catch (e) {} currentAudio = null; }
      } else {
        await browserSpeak(text);
      }
    } catch (e) {
      // server TTS failed mid-run → switch to the browser voice gracefully
      provider = 'browser';
      if (playing && !paused && index < sentences.length) await browserSpeak(sentences[index]);
    }
    if (!playing || paused) return;
    index++;
    if (index >= sentences.length) {
      playing = false;
      A.bgmDuck(false);
      fire('onEnd');
    } else {
      playCurrent();
    }
  }

  /* ---------------- controls ---------------- */
  function pause() {
    if (!playing) return;
    paused = true;
    if (currentAudio) { try { currentAudio.pause(); } catch (e) {} }
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
  }
  function resume() {
    if (!playing || !paused) return;
    paused = false;
    playCurrent();
  }
  function toggle() { playing && !paused ? pause() : (paused ? resume() : replayAll()); }
  function replaySentence() {
    if (!sentences.length) return;
    paused = false;
    playing = true;
    playCurrent();
  }
  function replayAll() {
    if (!sentences.length) return;
    index = 0;
    paused = false;
    playing = true;
    playCurrent();
  }
  function stop() {
    playing = false;
    paused = false;
    if (timer) clearTimeout(timer);
    timer = null;
    if (currentAudio) { try { currentAudio.pause(); } catch (e) {} currentAudio = null; }
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
    sentences = [];
    index = 0;
    A.bgmDuck(false);
  }
  function isPlaying() { return playing && !paused; }
  function isPaused() { return paused; }
  function currentIndex() { return index; }

  /* ---------------- auto-scroll (respects the child's manual scrolling) ---------------- */
  function initScrollWatch() {
    if (scrollWatchInit) return;
    scrollWatchInit = true;
    const mark = () => { lastUserScroll = Date.now(); };
    window.addEventListener('wheel', mark, { passive: true });
    window.addEventListener('touchmove', mark, { passive: true });
  }
  function scrollToEl(el) {
    initScrollWatch();
    if (Date.now() - lastUserScroll < 4000) return; // child is in control
    try { el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
  }

  /* ---------------- read-along building blocks ---------------- */
  function readAlongHTML(text) {
    const sents = splitSentences(text);
    return `<div class="readalong-card" role="note" aria-label="Teacher narration">` +
      sents.map((s, i) => `<span class="readalong-sent" data-i="${i}">${escapeHTML(s)}</span>`).join(' ') +
      `</div>`;
  }

  /* opts: { onSentence(i), onEnd(), autoPlay: bool } */
  function playerBar(container, opts) {
    opts = opts || {};
    container.innerHTML = `
      <div class="narration-bar" role="group" aria-label="Teacher voice controls">
        <button class="nb-btn nb-play" type="button" aria-label="Play or pause">▶️</button>
        <button class="nb-btn nb-replay" type="button" aria-label="Replay">🔁</button>
        <span class="nb-vol-wrap">
          <button class="nb-btn nb-vol" type="button" aria-label="Volume">🔊</button>
          <input class="nb-volume" type="range" min="0" max="100" step="5" value="${Math.round(volumeOf() * 100)}" aria-label="Volume"/>
        </span>
        <div class="nb-speed" role="group" aria-label="Speech speed">
          ${Object.keys(SPEEDS).map(s => `<button class="nb-speed-chip${speedOf() === s ? ' active' : ''}" data-speed="${s}" type="button">${SPEEDS[s].label}</button>`).join('')}
        </div>
      </div>`;

    const playBtn = container.querySelector('.nb-play');
    const replayBtn = container.querySelector('.nb-replay');
    const volInput = container.querySelector('.nb-volume');
    const volBtn = container.querySelector('.nb-vol');
    const chips = container.querySelectorAll('.nb-speed-chip');

    function refreshPlayIcon() {
      playBtn.textContent = isPlaying() ? '⏸️' : '▶️';
    }
    playBtn.addEventListener('click', () => {
      A.sfx.click();
      toggle();
      refreshPlayIcon();
      setTimeout(refreshPlayIcon, 400);
    });
    replayBtn.addEventListener('click', () => {
      A.sfx.click();
      if (!playing) replayAll(); else replaySentence();
    });
    volBtn.addEventListener('click', () => {
      A.sfx.click();
      const v = volumeOf() > 0 ? 0 : 1;
      window.LLRewards.state.speechVolume = v;
      window.LLRewards.save();
      volInput.value = Math.round(v * 100);
      volBtn.textContent = v > 0 ? '🔊' : '🔇';
    });
    volInput.addEventListener('input', () => {
      const v = parseInt(volInput.value, 10) / 100;
      window.LLRewards.state.speechVolume = v;
      window.LLRewards.save();
      volBtn.textContent = v > 0 ? '🔊' : '🔇';
    });
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        A.sfx.click();
        window.LLRewards.state.speechSpeed = chip.getAttribute('data-speed');
        window.LLRewards.save();
        chips.forEach(c => c.classList.toggle('active', c === chip));
        if (playing && !paused) replaySentence(); // restart at the new speed
      });
    });

    if (opts.onSentence) {
      const origOn = opts.onSentence;
      opts.onSentence = (i) => { origOn(i); refreshPlayIcon(); };
    }
    return {
      setPlayingIcon(playingNow) { playBtn.textContent = playingNow ? '⏸️' : '▶️'; }
    };
  }

  /* retry once the child interacts, in case the browser blocked autoplay */
  function armGestureRetry() {
    window.addEventListener('pointerdown', function once() {
      window.removeEventListener('pointerdown', once);
      if (playing && !paused && currentAudio && currentAudio.paused) {
        const p = currentAudio.play();
        if (p && p.catch) p.catch(() => {});
      }
    });
  }

  return {
    preprocess, splitSentences, readAlongHTML, playerBar,
    playSentences, pause, resume, toggle, replaySentence, replayAll, stop,
    isPlaying, isPaused, currentIndex, scrollToEl, armGestureRetry,
    speedOf, SPEEDS, checkProvider
  };
})();
