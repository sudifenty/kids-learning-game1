/* ==========================================================================
   🌈 LET'S LEARN — audio.js
   Teacher voice + gentle WebAudio sound effects.

   Voice priority (same voice on every device, works offline):
     1. Bundled natural-voice MP3  (voice-library.js) — no internet
     2. Runtime cache of clips the child has already heard
     3. Server neural TTS (online only) — then saved into the runtime cache
     4. Browser speech synthesis — last resort only
   ========================================================================== */

window.LLAudio = (function () {
  let ctx = null;
  let muted = false;
  let speaking = false;

  function ensureCtx() {
    if (!ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) ctx = new AC();
      } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') {
      try { ctx.resume().catch(() => {}); } catch (e) {}
    }
    return ctx;
  }

  /* ---------- simple synthesized tones ---------- */
  function tone(freq, start, dur, type, vol, endFreq) {
    if (!ensureCtx()) return;
    try {
      const t0 = ctx.currentTime + (start || 0);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + dur);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    } catch (e) { /* tone failed — not critical */ }
  }

  const sfx = {
    click() { if (muted) return; tone(600, 0, 0.08, 'triangle', 0.12); },
    pop() { if (muted) return; tone(500, 0, 0.12, 'sine', 0.18, 900); },
    correct() {
      if (muted) return;
      tone(660, 0, 0.12, 'sine', 0.2);
      tone(880, 0.12, 0.18, 'sine', 0.2);
    },
    wrong() {
      if (muted) return;
      tone(300, 0, 0.16, 'sine', 0.12, 240);
      tone(240, 0.16, 0.2, 'sine', 0.1, 200);
    },
    star() {
      if (muted) return;
      tone(880, 0, 0.1, 'triangle', 0.16);
      tone(1108, 0.09, 0.1, 'triangle', 0.16);
      tone(1318, 0.18, 0.22, 'triangle', 0.16);
    },
    celebrate() {
      if (muted) return;
      [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.13, 0.24, 'triangle', 0.2));
      tone(1318, 0.52, 0.4, 'triangle', 0.18);
    },
    tick() { if (muted) return; tone(500, 0, 0.05, 'sine', 0.1); },
    flip() { if (muted) return; tone(420, 0, 0.07, 'triangle', 0.12, 560); }
  };

  let voices = [];
  function loadVoices() {
    try {
      voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    } catch (e) { voices = []; }
  }
  loadVoices();
  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  /* ---------- mobile audio unlock (critical for phones) ----------
     Mobile browsers suspend audio until a real user gesture. We:
     1. Unlock on the first tap (one-time silent play to unblock audio)
     2. Keep re-unlocking on EVERY tap (some phones re-suspend aggressively)
     3. Resume AudioContext when the tab comes back to foreground
     4. Work around the iOS speechSynthesis "15-second freeze" bug
  */
  let mobileUnlocked = false;

  function unlockMobileAudio() {
    /* 1. Resume AudioContext */
    try { ensureCtx(); } catch (e) {}

    /* 2. Reload voices (some mobile browsers lazy-load them) */
    loadVoices();

    /* 3. Silent speech synthesis utterance to unblock TTS */
    try {
      if (window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(' ');
        u.volume = 0.01;
        u.rate = 1;
        u.pitch = 1;
        window.speechSynthesis.speak(u);
      }
    } catch (e) {}

    /* 4. Silent AudioContext tone to unblock WebAudio */
    try {
      if (ctx && ctx.state === 'running') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.001;
        osc.connect(gain).connect(ctx.destination);
        osc.start(0);
        osc.stop(0.01);
      }
    } catch (e) {}

    mobileUnlocked = true;
  }

  /* First-time unlock on any user gesture */
  function armMobileUnlock() {
    const firstUnlock = () => {
      unlockMobileAudio();
    };
    ['pointerdown', 'touchstart', 'touchend', 'click', 'keydown'].forEach(evt =>
      window.addEventListener(evt, firstUnlock, { once: true, passive: true })
    );

    /* Keep re-unlocking on every tap — some phones re-suspend audio context
       aggressively, especially after navigation or screen transitions */
    const keepAlive = () => {
      try { ensureCtx(); } catch (e) {}
      /* iOS speechSynthesis bug: after ~15s it freezes. Cancel keeps it alive. */
      try {
        if (window.speechSynthesis && speechSynthesis.speaking && !speaking) {
          speechSynthesis.cancel();
        }
      } catch (e) {}
    };
    window.addEventListener('pointerdown', keepAlive, { passive: true });
    window.addEventListener('touchstart', keepAlive, { passive: true });
  }
  armMobileUnlock();

  /* Resume audio when tab returns to foreground (critical for mobile) */
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      try { ensureCtx(); } catch (e) {}
      loadVoices();
      /* iOS: speechSynthesis may be stuck after tab switch — cancel to unstick */
      try {
        if (window.speechSynthesis) {
          speechSynthesis.cancel();
          speaking = false;
        }
      } catch (e) {}
      /* Resume background music if it was playing */
      if (bgmOn && bgmAudio) {
        try { bgmAudio.play().catch(() => {}); } catch (e) {}
      }
    } else {
      /* Tab going to background — pause BGM to save battery */
      if (bgmAudio) {
        try { bgmAudio.pause(); } catch (e) {}
      }
    }
  });

  /* Handle page freeze/unfreeze (modern mobile browsers) */
  if ('onfreeze' in document) {
    document.addEventListener('freeze', () => {
      try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
      speaking = false;
    });
    document.addEventListener('resume', () => {
      try { ensureCtx(); } catch (e) {}
      loadVoices();
    });
  }

  /* iOS speechSynthesis keepalive: iOS kills speech after ~15 seconds of
     continuous use. This timer pokes it periodically to keep it alive. */
  let iosKeepalive = null;
  function startIosKeepalive() {
    if (iosKeepalive) return;
    iosKeepalive = setInterval(() => {
      try {
        if (window.speechSynthesis && speechSynthesis.speaking) {
          /* Poke: pause and immediately resume to prevent the 15s freeze */
          speechSynthesis.pause();
          speechSynthesis.resume();
        } else {
          /* Not speaking anymore — stop the timer */
          stopIosKeepalive();
        }
      } catch (e) { stopIosKeepalive(); }
    }, 10000);
  }
  function stopIosKeepalive() {
    if (iosKeepalive) { clearInterval(iosKeepalive); iosKeepalive = null; }
  }

  function pickVoice() {
    const preferred = ['Google US English', 'Samantha', 'Microsoft Zira', 'Microsoft Aria', 'Karen', 'Moira', 'Daniel', 'en-US', 'en-GB', 'en'];
    for (const p of preferred) {
      const found = voices.find(v => v.name && v.name.toLowerCase().includes(p.toLowerCase()));
      if (found) return found;
    }
    return voices.find(v => (v.lang || '').startsWith('en')) || null;
  }

  let speakAudio = null;
  let speakWatchdog = null;
  let speakToken = 0;

  function speakSpeedRate() {
    try {
      if (window.LLNarration) return window.LLNarration.SPEEDS[window.LLNarration.speedOf()].playRate;
    } catch (e) {}
    return 0.85;
  }
  function speakVolume() {
    try {
      const v = window.LLRewards.state.speechVolume;
      return v == null ? 1 : v;
    } catch (e) { return 1; }
  }

  function preprocessText(t) {
    try { return window.LLNarration ? window.LLNarration.preprocess(t) : t; } catch (e) { return t; }
  }

  function isOnline() {
    try { return navigator.onLine !== false; } catch (e) { return true; }
  }

  /* ---------- persistent clip cache (IndexedDB-backed Cache API) ---------- */
  const RUNTIME = 'll-teacher-voice-v1';
  function clipKey(text) {
    let h = 0;
    const s = String(text || '');
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return '/__llvoice/' + Math.abs(h).toString(36) + '-' + s.length;
  }
  async function cacheGet(text) {
    if (!('caches' in window)) return null;
    try {
      const cache = await caches.open(RUNTIME);
      const res = await cache.match(clipKey(text));
      if (!res || !res.ok) return null;
      const blob = await res.blob();
      if (!blob || blob.size < 400) return null;
      return URL.createObjectURL(blob);
    } catch (e) { return null; }
  }
  async function cachePut(text, blob) {
    if (!('caches' in window) || !blob) return;
    try {
      const cache = await caches.open(RUNTIME);
      await cache.put(clipKey(text), new Response(blob, { headers: { 'Content-Type': 'audio/mpeg' } }));
    } catch (e) { /* ignore */ }
  }

  function browserSpeakOnce(text, opts) {
    try {
      if (!window.speechSynthesis) { if (opts.onend) opts.onend(); return false; }
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = pickVoice();
      if (v) u.voice = v;
      u.rate = opts.rate || speakSpeedRate();
      u.pitch = 1.05;
      u.volume = muted ? 0 : Math.max(0.05, speakVolume());
      u.lang = (v && v.lang) || 'en-US';
      let done = false;
      const finish = () => { if (done) return; done = true; stopIosKeepalive(); if (speakWatchdog) clearTimeout(speakWatchdog); speaking = false; bgmDuck(false); if (opts.onend) opts.onend(); };
      u.onstart = () => { speaking = true; startIosKeepalive(); if (opts.onstart) opts.onstart(); };
      u.onend = finish;
      u.onerror = finish;
      speechSynthesis.speak(u);
      /* On mobile, speechSynthesis.speak() sometimes silently fails.
         We retry once after a short delay if speech hasn't started. */
      setTimeout(() => {
        if (!done && !speaking) {
          try {
            speechSynthesis.cancel();
            speechSynthesis.speak(u);
          } catch (e) {}
        }
      }, 200);
      speakWatchdog = setTimeout(finish, 900 + text.length * 85 + 1500);
      return true;
    } catch (e) {
      if (opts.onend) opts.onend();
      return false;
    }
  }

  function playUrl(url, opts, token) {
    try {
      if (typeof Audio === 'undefined') return false;
      const a = new Audio(url);
      a.playbackRate = opts.rate || speakSpeedRate();
      a.volume = muted ? 0 : Math.max(0.05, speakVolume()) * 0.95;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        if (token !== speakToken) return;
        if (speakWatchdog) clearTimeout(speakWatchdog);
        speaking = false;
        bgmDuck(false);
        if (opts.onend) opts.onend();
      };
      a.onended = finish;
      a.onerror = () => { try { a.pause(); } catch (e) {} finish(); };
      speakAudio = a;
      speaking = true;
      if (opts.onstart) opts.onstart();
      const p = a.play();
      if (p && p.catch) {
        p.catch(() => {
          /* Mobile play() rejected — retry once after ensuring context */
          try { ensureCtx(); } catch (e) {}
          const retry = a.play();
          if (retry && retry.catch) {
            retry.catch(() => { try { a.pause(); } catch (e) {} finish(); });
          }
        });
      }
      speakWatchdog = setTimeout(finish, 900 + (opts.durMs || (String(opts.text || '').length * 85 + 2500)));
      return true;
    } catch (e) { return false; }
  }

  function speak(text, opts) {
    opts = opts || {};
    if (muted && !opts.force) return false;
    const clean = preprocessText(text);
    opts.text = clean;
    if (speakAudio) { try { speakAudio.pause(); } catch (e) {} speakAudio = null; }
    if (speakWatchdog) clearTimeout(speakWatchdog);
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
    const token = ++speakToken;

    bgmDuck(true);

    /* 1) Bundled natural voice — identical on every device, 100% offline. */
    let localUrl = null;
    try { if (window.LLVoice) localUrl = window.LLVoice.lookup(clean); } catch (e) {}
    if (localUrl) {
      if (playUrl(localUrl, opts, token)) return true;
    }

    /* 2) Runtime cache (heard this sentence before). */
    cacheGet(clean).then(cachedUrl => {
      if (token !== speakToken) return;
      if (cachedUrl) {
        playUrl(cachedUrl, opts, token);
        return;
      }
      /* 3) Server neural TTS — only when we have a network. */
      if (!isOnline() || typeof fetch !== 'function') {
        browserSpeakOnce(clean, opts);
        return;
      }
      const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const to = setTimeout(() => { try { if (ctrl) ctrl.abort(); } catch (e) {} }, 2800);
      fetch('api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean }),
        signal: ctrl ? ctrl.signal : undefined
      }).then(res => {
        if (!res.ok) throw new Error('tts ' + res.status);
        return res.json();
      }).then(data => {
        clearTimeout(to);
        if (token !== speakToken) return;
        return fetch(data.url).then(r => {
          if (!r.ok) throw new Error('clip');
          return r.blob();
        }).then(blob => {
          cachePut(clean, blob);
          if (token !== speakToken) return;
          const obj = URL.createObjectURL(blob);
          playUrl(obj, opts, token);
        });
      }).catch(() => {
        clearTimeout(to);
        if (token !== speakToken) return;
        browserSpeakOnce(clean, opts);
      });
    }).catch(() => {
      if (token !== speakToken) return;
      browserSpeakOnce(clean, opts);
    });
    return true;
  }

  function stop() {
    speakToken++;
    stopIosKeepalive();
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
    if (speakAudio) { try { speakAudio.pause(); } catch (e) {} speakAudio = null; }
    if (speakWatchdog) clearTimeout(speakWatchdog);
    speaking = false;
    bgmDuck(false);
  }

  /* ---------------- soft background music (original, CC0) ---------------- */
  let bgmAudio = null;
  let bgmOn = false;
  let bgmDucked = false;

  function bgmUrl() {
    try {
      if (window.__LL_STANDALONE_CATALOG__) {
        const m = window.__LL_STANDALONE_CATALOG__.find(x => x.id === 'bgm-learn');
        if (m && m.filePath && m.filePath.indexOf('data:') === 0) return m.filePath;
      }
    } catch (e) { /* ignore */ }
    return '/media/audio/bgm/bgm-learn.mp3';
  }
  function setBgm(on) {
    bgmOn = !!on;
    if (bgmOn) {
      try {
        if (typeof Audio === 'undefined') return;
        if (bgmAudio) {
          bgmAudio.volume = bgmDucked ? 0.05 : 0.12;
          /* Try to resume if paused (may have been paused by visibility change) */
          const p = bgmAudio.play();
          if (p && p.catch) p.catch(() => {});
          return;
        }
        ensureCtx();
        const a = new Audio(bgmUrl());
        a.loop = true;
        a.volume = bgmDucked ? 0.05 : 0.12;
        a.preload = 'auto';
        const p = a.play();
        if (p && p.catch) {
          p.catch(() => {
            /* Mobile rejected — retry after short delay */
            setTimeout(() => {
              const r = a.play();
              if (r && r.catch) r.catch(() => {});
            }, 100);
          });
        }
        bgmAudio = a;
      } catch (e) { /* ignore */ }
    } else {
      bgmStop();
    }
  }
  function bgmStop() {
    if (bgmAudio) { try { bgmAudio.pause(); } catch (e) {} bgmAudio = null; }
  }
  function bgmDuck(duck) {
    bgmDucked = !!duck;
    if (bgmAudio) {
      try { bgmAudio.volume = duck ? 0.05 : 0.12; } catch (e) {}
    }
  }
  function isBgmOn() { return bgmOn; }

  function setMuted(m) {
    muted = m;
    if (m) stop();
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
  }
  function isMuted() { return muted; }

  /* ---------- celebration music (original Let's Learn jingles) ---------- */
  const CELEB = {
    success: { id: 'celebration-success', dur: 2.4 },
    big: { id: 'celebration-big', dur: 2.8 },
    lesson: { id: 'celebration-lesson', dur: 3.7 }
  };
  let celebAudio = null;

  function celebSrc(id) {
    try {
      if (window.__LL_STANDALONE_CATALOG__) {
        const m = window.__LL_STANDALONE_CATALOG__.find(x => x.id === id);
        if (m && m.filePath && m.filePath.indexOf('data:') === 0) return m.filePath;
      }
    } catch (e) { /* ignore */ }
    return '/media/audio/celebration/' + id + '.mp3';
  }

  function playCelebration(kind) {
    const cfg = CELEB[kind] || CELEB.success;
    const duration = cfg.dur;
    try {
      if (typeof Audio === 'undefined') return duration;
      const R = window.LLRewards;
      if (R && R.state && R.state.celebrationOn === false) return duration;
      if (celebAudio) { try { celebAudio.pause(); } catch (e) {} }
      /* Ensure audio context is running before playing celebration */
      ensureCtx();
      const a = new Audio();
      a.src = celebSrc(cfg.id);
      a.volume = 0.9;
      a.preload = 'auto';
      const p = a.play();
      if (p && p.catch) {
        p.catch(() => {
          /* Mobile rejected autoplay — retry once after a tick */
          setTimeout(() => {
            const r = a.play();
            if (r && r.catch) r.catch(() => { sfx.celebrate(); });
          }, 50);
        });
      }
      celebAudio = a;
    } catch (e) { sfx.celebrate(); }
    return duration;
  }

  function stopCelebration() {
    if (celebAudio) { try { celebAudio.pause(); celebAudio.currentTime = 0; } catch (e) {} }
  }

  const PRAISE = ['Amazing!', 'Great job!', 'You got it!', 'Wonderful!', 'Super!', 'You are a star!'];
  const ENCOURAGE = ['Almost! Try again.', 'Good try! Let\'s look again.', 'You can do it! Try once more.', 'So close! Have another go.'];

  function randomPraise() { return PRAISE[Math.floor(Math.random() * PRAISE.length)]; }
  function randomEncourage() { return ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)]; }

  return {
    speak, stop, setMuted, isMuted, sfx, playCelebration, stopCelebration,
    randomPraise, randomEncourage, ensureCtx, setBgm, bgmDuck, isBgmOn,
    cacheGet, cachePut, clipKey
  };
})();
