/* ==========================================================================
   🌈 LET'S LEARN — pwa.js
   Installable Progressive Web App:
     • registers / updates the service worker
     • captures the browser install prompt (Android / desktop Chrome)
     • shows iPhone / iPad “Add to Home Screen” steps (Safari has no prompt)
     • Parent Area + optional home banner can call install()
   ========================================================================== */

window.LLPWA = (function () {
  let deferredPrompt = null;
  let installed = false;

  function isStandalone() {
    try {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
      if (window.navigator.standalone === true) return true;
      if (new URLSearchParams(location.search).get('source') === 'pwa') return true;
    } catch (e) { /* ignore */ }
    return false;
  }

  function isIos() {
    const ua = navigator.userAgent || '';
    const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return iOS && !window.MSStream;
  }

  function canPrompt() { return !!deferredPrompt; }

  function markInstalled() {
    installed = true;
    try { localStorage.setItem('ll-pwa-installed', '1'); } catch (e) {}
    hideBanner();
    document.documentElement.classList.add('ll-standalone');
  }

  function alreadyInstalled() {
    if (isStandalone()) return true;
    try { if (localStorage.getItem('ll-pwa-installed') === '1' && isStandalone()) return true; } catch (e) {}
    return isStandalone();
  }

  function registerSW() {
    if (window.__LL_STANDALONE__) return Promise.resolve(null);
    if (!('serviceWorker' in navigator)) return Promise.resolve(null);
    return navigator.serviceWorker.register('sw.js?v=23').then(reg => {
      try { reg.update(); } catch (e) {}
      return reg;
    }).catch(() => null);
  }

  function listen() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      document.documentElement.classList.add('ll-can-install');
      maybeShowBanner();
    });
    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      markInstalled();
      if (window.LLApp && window.LLApp.toast) window.LLApp.toast('📲 Let\'s Learn is on your home screen!');
    });
    if (alreadyInstalled()) {
      installed = true;
      document.documentElement.classList.add('ll-standalone');
    }
  }

  async function install() {
    if (alreadyInstalled()) {
      showSheet('already');
      return { ok: true, reason: 'already' };
    }
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        deferredPrompt = null;
        if (choice && choice.outcome === 'accepted') {
          markInstalled();
          return { ok: true, reason: 'prompt' };
        }
        return { ok: false, reason: 'dismissed' };
      } catch (e) {
        return { ok: false, reason: 'error' };
      }
    }
    showSheet(isIos() ? 'ios' : 'manual');
    return { ok: false, reason: isIos() ? 'ios' : 'manual' };
  }

  function showSheet(kind) {
    hideSheet();
    const wrap = document.createElement('div');
    wrap.id = 'pwa-sheet';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', 'Add Let\'s Learn to the home screen');
    let body = '';
    if (kind === 'already') {
      body = `
        <div class="pwa-emoji">✅</div>
        <div class="pwa-title">Already on this device</div>
        <p class="pwa-text">Let's Learn is running as an app. Open it from your home screen any time — even offline.</p>`;
    } else if (kind === 'ios') {
      body = `
        <div class="pwa-emoji">📲</div>
        <div class="pwa-title">Add to Home Screen</div>
        <ol class="pwa-steps">
          <li>Tap the <b>Share</b> button <span class="pwa-glyph">􀈂</span> at the bottom of Safari</li>
          <li>Scroll and tap <b>Add to Home Screen</b></li>
          <li>Tap <b>Add</b> — the rainbow panda icon will appear on the home screen</li>
        </ol>
        <p class="pwa-text">Then open Let's Learn like any other app. It works without internet.</p>`;
    } else {
      body = `
        <div class="pwa-emoji">📲</div>
        <div class="pwa-title">Install Let's Learn</div>
        <p class="pwa-text">On your phone browser, open the menu and choose <b>Install app</b> or <b>Add to Home screen</b>.</p>
        <p class="pwa-text">The app keeps working offline after you open it once.</p>`;
    }
    wrap.innerHTML = `
      <div class="pwa-card">
        ${body}
        <button class="btn green pwa-ok" type="button">OK</button>
      </div>`;
    wrap.addEventListener('click', (e) => { if (e.target === wrap) hideSheet(); });
    document.body.appendChild(wrap);
    wrap.querySelector('.pwa-ok').addEventListener('click', hideSheet);
  }

  function hideSheet() {
    const el = document.getElementById('pwa-sheet');
    if (el) el.remove();
  }

  function maybeShowBanner() {
    if (alreadyInstalled()) return;
    try { if (sessionStorage.getItem('ll-pwa-banner') === '1') return; } catch (e) {}
    // only after the child profile exists — don't interrupt welcome/setup
    try {
      if (!window.LLRewards || !window.LLRewards.state || !window.LLRewards.state.child) return;
    } catch (e) { return; }
    if (document.getElementById('pwa-banner')) return;
    const bar = document.createElement('div');
    bar.id = 'pwa-banner';
    bar.innerHTML = `
      <span class="pwa-b-icon">📲</span>
      <span class="pwa-b-txt"><b>Use like an app</b><br/>Add Let's Learn to the home screen</span>
      <button class="pwa-b-go" type="button">Add</button>
      <button class="pwa-b-x" type="button" aria-label="Dismiss">✕</button>`;
    document.body.appendChild(bar);
    bar.querySelector('.pwa-b-go').addEventListener('click', () => { install(); });
    bar.querySelector('.pwa-b-x').addEventListener('click', () => {
      try { sessionStorage.setItem('ll-pwa-banner', '1'); } catch (e) {}
      hideBanner();
    });
  }

  function hideBanner() {
    const el = document.getElementById('pwa-banner');
    if (el) el.remove();
  }

  function statusLabel() {
    if (alreadyInstalled()) return 'Installed ✓';
    if (canPrompt()) return 'Add to home screen';
    if (isIos()) return 'Add on iPhone';
    return 'How to install';
  }

  function init() {
    listen();
    registerSW();
    // show the banner a moment after boot so the home screen is already up
    setTimeout(maybeShowBanner, 1800);
  }

  return {
    init, install, isStandalone, alreadyInstalled, canPrompt, statusLabel,
    registerSW, maybeShowBanner, hideBanner
  };
})();
