/* ==========================================================================
   🌈 LET'S LEARN — app.js
   Bootstrapping: load state, restore sound preference, confetti &
   celebration overlays, topbar star updates.
   ========================================================================== */

window.LLApp = (function () {
  const A = window.LLAudio;
  const R = window.LLRewards;

  /* ---------- celebration overlay ----------
     kinds: 'success' (correct answer — short dance + jingle)
            'big'     (milestone — bigger dance + confetti + fanfare)
            'lesson'  (lesson complete — completion tune + confetti + badge)
     The dance runs exactly while the music plays; when the music ends the
     overlay closes and (optionally) calls opts.onClose — so the character
     never dances after the music has finished. Returns the duration (s). */
  function celebrate(title, character, stars, opts) {
    opts = opts || {};
    const kind = opts.kind || 'success';
    const R = window.LLRewards;
    const animationsOn = !R.state || R.state.animationsOn !== false;
    const duration = A.playCelebration(kind);

    /* parents can switch animations off — then celebrate quietly (stars only) */
    if (!animationsOn) {
      if (opts.onClose) setTimeout(opts.onClose, 350);
      return duration;
    }

    const overlay = document.createElement('div');
    overlay.id = 'celebration';
    overlay.className = 'show';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-live', 'assertive');
    overlay.innerHTML = `
      <div class="cel-title">${title}</div>
      <div class="cel-char dance">${resolveChar(character)}</div>
      <div class="cel-notes" aria-hidden="true"><span>♪</span><span>♫</span><span>♪</span><span>♫</span></div>
      ${opts.badge ? `<div class="cel-badge">🏅 ${opts.badge}</div>` : ''}
      <div class="cel-stars">${stars ? '⭐ +' + stars : '✨ ✨ ✨'}</div>`;
    document.body.appendChild(overlay);

    if (kind === 'big' || kind === 'lesson' || opts.confetti) burstConfetti(overlay);

    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      if (overlay.parentNode) overlay.remove();
      if (opts.onClose) opts.onClose();
    };
    const closeDelay = Math.round((duration || 2) * 1000) + 300;
    setTimeout(close, closeDelay);
    overlay.addEventListener('click', close); // tap to skip — still closes cleanly

    return duration;
  }

  /* character can be: an SVG string, a character id (panda…), an emoji, or
     omitted → the child's own avatar dances */
  function resolveChar(character) {
    try {
      const D = window.LLData;
      if (!character) {
        const avatar = R.state && R.state.child ? R.state.child.avatar : 'panda';
        return D.avatarHTML(D.CHARACTERS[avatar] ? avatar : 'panda', 150);
      }
      if (typeof character === 'string' && character.indexOf('<') === 0) return character;
      if (D && D.CHARACTERS[character]) return D.avatarHTML(character, 150);
      return `<span style="font-size:6rem;line-height:1">${character || '🐼'}</span>`;
    } catch (e) { return '<span style="font-size:6rem">🐼</span>'; }
  }

  function burstConfetti(host) {
    host = host || document.getElementById('celebration') || document.body;
    const colors = ['#ef4444', '#facc15', '#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#ffd75e'];
    for (let i = 0; i < 46; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      c.style.animationDuration = (1.6 + Math.random() * 1.6) + 's';
      c.style.animationDelay = (Math.random() * 0.5) + 's';
      c.style.width = (8 + Math.random() * 8) + 'px';
      c.style.height = (8 + Math.random() * 8) + 'px';
      c.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px';
      host.appendChild(c);
      setTimeout(() => c.remove(), 3800);
    }
    // sparkles
    for (let i = 0; i < 12; i++) {
      const s = document.createElement('div');
      s.className = 'sparkle';
      s.textContent = ['✨', '⭐', '🌟', '💫'][Math.floor(Math.random() * 4)];
      s.style.left = Math.random() * 90 + 'vw';
      s.style.top = 40 + Math.random() * 40 + 'vh';
      s.style.animationDelay = (Math.random() * 0.6) + 's';
      host.appendChild(s);
      setTimeout(() => s.remove(), 3200);
    }
  }

  /* ---------- toast ---------- */
  let toastTimer = null;
  function toast(msg, isWrong) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'show' + (isWrong ? ' wrong' : '');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.className = ''; }, 2200);
  }

  function updateTopbarStars() {
    const el = document.getElementById('topbar-stars');
    if (el) el.textContent = '⭐ ' + R.totalStars();
  }

  /* ---------- boot ---------- */
  function boot() {
    const state = R.load();
    A.setMuted(state.soundOn === false);
    // background layer
    const bg = document.createElement('div');
    bg.id = 'bg-layer';
    document.body.appendChild(bg);
    // development-time curriculum validation (console only — children never see it)
    try { if (window.LLValidate) window.LLValidate.validateAll(); } catch (e) {}
    // soft background music (default off; parent setting)
    try { if (state.bgmOn) A.setBgm(true); } catch (e) {}
    // preload media catalog (optional — the app works without it; media files are lazy)
    if (window.LLMedia) window.LLMedia.loadCatalog().catch(() => {});
    window.LLNav.init();
    R.tryLoadFromServer().then(() => {
      if (R.state.child && !location.hash) location.hash = '#/home';
      updateTopbarStars();
    });
    if (window.LLPWA) window.LLPWA.init();
    else registerSW();
    hideSplash();
  }

  function hideSplash() {
    const splash = document.getElementById('boot-splash');
    if (splash) {
      splash.style.transition = 'opacity 0.35s ease';
      splash.style.opacity = '0';
      setTimeout(() => splash.remove(), 400);
    }
  }

  /* ---------- offline-first service worker (best effort) ---------- */
  function registerSW() {
    if (window.__LL_STANDALONE__) return; // no server in standalone mode
    try {
      if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.protocol === 'http:')) {
        navigator.serviceWorker.register('sw.js?v=23').catch(() => {});
      }
    } catch (e) { /* sandboxed environments: skip */ }
  }

  /* ---------- child-friendly offline indicator ---------- */
  function initOfflineIndicator() {
    try {
      const el = document.getElementById('offline-indicator');
      if (!el) return;
      const update = () => { el.hidden = !!navigator.onLine; };
      update();
      window.addEventListener('online', update);
      window.addEventListener('offline', update);
    } catch (e) { /* ignore */ }
  }

  /* ---------- never show a silent white screen ---------- */
  function showFatal(msg) {
    try {
      const el = document.getElementById('fatal-error');
      const m = document.getElementById('fatal-msg');
      if (el) el.style.display = 'flex';
      if (m) m.textContent = msg || 'Something went wrong while starting up.';
      hideSplash();
    } catch (e) { /* ignore */ }
  }

  function initErrorHandlers() {
    window.addEventListener('error', (e) => {
      if (e && e.message && /script error/i.test(e.message)) return;
      console.error('Let\'s Learn error:', e && (e.message || e.error));
    });
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Let\'s Learn rejection:', e && e.reason);
    });
    // If the app never booted within 6s, offer a refresh instead of a white page.
    setTimeout(() => {
      const app = document.getElementById('app');
      if (app && app.children.length === 0 && !document.querySelector('#fatal-error[style*="flex"]')) {
        showFatal('The app took too long to start. This can happen after an update — a refresh usually fixes it.');
      }
    }, 6000);
  }

  return { boot, celebrate, burstConfetti, toast, updateTopbarStars, showFatal, initErrorHandlers, initOfflineIndicator };
})();

document.addEventListener('DOMContentLoaded', () => {
  try {
    window.LLApp.boot();
    window.LLApp.initErrorHandlers();
    window.LLApp.initOfflineIndicator();
  } catch (e) {
    window.LLApp.showFatal((e && e.message) || 'Something went wrong while starting up.');
  }
});
