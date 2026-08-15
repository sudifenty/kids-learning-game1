/* ==========================================================================
   🌈 LET'S LEARN — navigation.js
   Hash router + all screen renderers (welcome → setup → home → activities).
   ========================================================================== */

window.LLNav = (function () {
  const D = window.LLData;
  const A = window.LLAudio;
  const R = window.LLRewards;

  let appEl = null;

  /* ---------------- background environments ---------------- */
  function isKinder() {
    const c = R.state.child ? R.state.child.className : null;
    return D.isKinderClass(c);
  }

  function areaCardHTML(a, extra) {
    return `<button class="area-card${extra ? ' ' + extra : ''}" data-area="${a.id}" type="button" style="--ac:${a.color}">
      <span class="ac-icon">${a.icon}</span>
      <span class="ac-name">${a.name}</span>
    </button>`;
  }

  function setEnv(env) {
    document.body.className = 'env-' + env;
    const bg = document.getElementById('bg-layer');
    let svg = '';
    const cloud = (x, y, s, cls) =>
      `<g class="${cls}" transform="translate(${x},${y}) scale(${s})">
        <ellipse cx="40" cy="30" rx="34" ry="16" fill="#ffffff" opacity="0.85"/>
        <ellipse cx="22" cy="22" rx="18" ry="13" fill="#ffffff" opacity="0.9"/>
        <ellipse cx="58" cy="22" rx="16" ry="12" fill="#ffffff" opacity="0.9"/>
      </g>`;

    switch (env) {
      case 'home':
        svg = `
          <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMax slice">
            <circle cx="880" cy="90" r="52" fill="#ffd75e" opacity="0.9"/>
            <circle cx="880" cy="90" r="70" fill="#ffd75e" opacity="0.35"/>
            ${cloud(80, 70, 1, 'drift')}${cloud(560, 130, 0.8, 'drift2')}${cloud(330, 40, 0.6, 'drift3')}
            <path d="M0 620 Q 200 560 420 610 T 1000 590 L 1000 700 L 0 700 Z" fill="#8ed98a" opacity="0.5"/>
            <path d="M0 650 Q 250 600 500 645 T 1000 635 L 1000 700 L 0 700 Z" fill="#5fbf6b" opacity="0.45"/>
            <g transform="translate(120,560)">
              <rect x="26" y="20" width="14" height="44" rx="6" fill="#a0683c"/>
              <circle cx="33" cy="16" r="22" fill="#58b368"/>
              <circle cx="16" cy="24" r="14" fill="#58b368"/>
              <circle cx="50" cy="24" r="14" fill="#58b368"/>
            </g>
            <g transform="translate(860,570) scale(1.1)">
              <rect x="26" y="20" width="14" height="44" rx="6" fill="#a0683c"/>
              <circle cx="33" cy="16" r="22" fill="#58b368"/>
              <circle cx="16" cy="24" r="14" fill="#58b368"/>
              <circle cx="50" cy="24" r="14" fill="#58b368"/>
            </g>
            <g transform="translate(560,530)">${flowerSVG()}</g>
            <g transform="translate(680,545) scale(0.8)">${flowerSVG()}</g>
            <g transform="translate(300,540) scale(0.9)">${flowerSVG()}</g>
            <g transform="translate(700,140) scale(0.7)" class="drift2"><text x="0" y="20" font-size="28">🦋</text></g>
            <g transform="translate(200,160) scale(0.6)" class="drift3"><text x="0" y="20" font-size="28">🦋</text></g>
          </svg>`;
        break;
      case 'learn':
        svg = `
          <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMax slice">
            <circle cx="130" cy="100" r="48" fill="#ffd75e" opacity="0.9"/>
            ${cloud(700, 80, 1, 'drift')}${cloud(420, 60, 0.7, 'drift2')}
            <g transform="translate(380,470)">
              <rect x="0" y="60" width="240" height="120" rx="8" fill="#fff" opacity="0.85"/>
              <polygon points="120,-20 0,60 240,60" fill="#f99a1c" opacity="0.9"/>
              <rect x="24" y="90" width="44" height="50" rx="6" fill="#8ed3ff"/>
              <rect x="90" y="90" width="44" height="50" rx="6" fill="#ffb3c1"/>
              <rect x="156" y="90" width="44" height="50" rx="6" fill="#b7e4a4"/>
              <rect x="104" y="140" width="32" height="40" rx="6" fill="#a0683c"/>
              <polygon points="120,-20 110,0 130,0" fill="#e05a1c"/>
            </g>
            <g transform="translate(120,540)">${flowerSVG()}</g>
            <g transform="translate(830,520) scale(0.8)">${flowerSVG()}</g>
            <text x="620" y="120" font-size="40" opacity="0.5" transform="rotate(-12 620 120)">📖</text>
            <text x="250" y="180" font-size="34" opacity="0.45" transform="rotate(8 250 180)">✏️</text>
          </svg>`;
        break;
      case 'play':
        svg = `
          <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMax slice">
            <circle cx="880" cy="100" r="50" fill="#ffd75e" opacity="0.9"/>
            ${cloud(90, 80, 1, 'drift')}${cloud(500, 50, 0.7, 'drift2')}
            ${balloon(180, 300, '#ff8a8a')}${balloon(780, 280, '#8ac6ff')}${balloon(850, 420, '#b3e09a')}
            <g transform="translate(430,560)">
              <rect x="10" y="30" width="80" height="90" rx="10" fill="#ff8a8a"/>
              <rect x="110" y="0" width="40" height="60" rx="8" fill="#8ac6ff"/>
              <rect x="170" y="40" width="70" height="80" rx="10" fill="#ffd75e"/>
              <rect x="0" y="115" width="260" height="14" rx="7" fill="#5fbf6b"/>
              <path d="M60 30 Q 80 -20 120 -14" stroke="#a0683c" stroke-width="8" fill="none" stroke-linecap="round"/>
            </g>
            <text x="560" y="180" font-size="40" opacity="0.5">🎈</text>
            <text x="260" y="300" font-size="34" opacity="0.4">🪁</text>
          </svg>`;
        break;
      case 'creative':
        svg = `
          <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMax slice">
            ${cloud(700, 70, 1, 'drift')}${cloud(200, 60, 0.7, 'drift2')}
            <g transform="translate(760,480) rotate(-15)">
              <ellipse cx="60" cy="60" rx="56" ry="48" fill="#fff" opacity="0.92"/>
              <circle cx="34" cy="36" r="14" fill="#ef4444"/>
              <circle cx="78" cy="30" r="13" fill="#facc15"/>
              <circle cx="66" cy="78" r="13" fill="#3b82f6"/>
              <circle cx="28" cy="82" r="12" fill="#22c55e"/>
              <rect x="106" y="48" width="26" height="10" rx="4" fill="#a0683c"/>
            </g>
            <g transform="translate(90,500)">
              <rect x="8" y="60" width="16" height="70" rx="6" fill="#f472b6"/>
              <rect x="30" y="46" width="16" height="84" rx="6" fill="#facc15"/>
              <rect x="52" y="60" width="16" height="70" rx="6" fill="#60a5fa"/>
              <rect x="0" y="126" width="80" height="10" rx="5" fill="#a0683c"/>
            </g>
            <text x="420" y="160" font-size="44" opacity="0.5">🖍️</text>
            <text x="540" y="240" font-size="36" opacity="0.4">🎨</text>
            <g transform="translate(300,520)">${flowerSVG()}</g>
          </svg>`;
        break;
      default: /* focus / lessons — calm */
        svg = `
          <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMax slice">
            <circle cx="150" cy="90" r="46" fill="#ffd75e" opacity="0.85"/>
            ${cloud(650, 90, 1, 'drift')}${cloud(380, 50, 0.65, 'drift2')}
            <path d="M0 640 Q 300 590 1000 630 L 1000 700 L 0 700 Z" fill="#8ed98a" opacity="0.4"/>
          </svg>`;
    }
    bg.innerHTML = svg;
  }

  function flowerSVG() {
    return `
      <g>
        <rect x="11" y="26" width="8" height="30" rx="4" fill="#58b368"/>
        <circle cx="15" cy="22" r="12" fill="#f472b6"/>
        <circle cx="4" cy="30" r="9" fill="#f472b6"/>
        <circle cx="26" cy="30" r="9" fill="#f472b6"/>
        <circle cx="15" cy="12" r="9" fill="#f472b6"/>
        <circle cx="15" cy="42" r="9" fill="#f472b6"/>
        <circle cx="15" cy="22" r="5" fill="#facc15"/>
      </g>`;
  }
  function balloon(x, y, color) {
    return `<g transform="translate(${x},${y})">
      <ellipse cx="0" cy="0" rx="26" ry="34" fill="${color}" opacity="0.85"/>
      <polygon points="-6,32 6,32 0,42" fill="${color}" opacity="0.85"/>
      <path d="M0 42 Q -8 60 0 80" stroke="${color}" stroke-width="2.5" fill="none" opacity="0.7"/>
    </g>`;
  }

  /* ---------------- topbar ---------------- */
  function topbar() {
    const soundOn = !A.isMuted();
    return `
      <header class="topbar">
        <button class="logo" id="btn-logo" type="button" aria-label="Go to home">
          <span class="logo-emoji">🌈</span>
          <span class="logo-text">LET'S LEARN</span>
        </button>
        <div class="spacer"></div>
        <span class="chip stars" id="topbar-stars" aria-label="Stars">⭐ ${R.totalStars()}</span>
        <button class="icon-btn" id="btn-switch-class" type="button" aria-label="Switch class" title="Switch class">🔄</button>
        <button class="icon-btn ${soundOn ? '' : 'muted'}" id="btn-sound" type="button" aria-label="${soundOn ? 'Mute sounds' : 'Unmute sounds'}">${soundOn ? '🔊' : '🔇'}</button>
        <button class="icon-btn" id="btn-home" type="button" aria-label="Home">🏠</button>
      </header>`;
  }

  function bindTopbar() {
    const logo = document.getElementById('btn-logo');
    if (logo) logo.addEventListener('click', () => { A.sfx.click(); location.hash = '#/home'; });
    const home = document.getElementById('btn-home');
    if (home) home.addEventListener('click', () => { A.sfx.click(); location.hash = '#/home'; });
    const sound = document.getElementById('btn-sound');
    if (sound) sound.addEventListener('click', () => {
      A.sfx.click();
      A.setMuted(!A.isMuted());
      const st = R.state;
      st.soundOn = !A.isMuted();
      R.save();
      renderTopbarOnly();
    });
  }

  function renderTopbarOnly() {
    const h = document.querySelector('.topbar');
    if (h) {
      const soundOn = !A.isMuted();
      h.querySelector('#topbar-stars').textContent = '⭐ ' + R.totalStars();
      const sb = h.querySelector('#btn-sound');
      sb.textContent = soundOn ? '🔊' : '🔇';
      sb.classList.toggle('muted', !soundOn);
      sb.setAttribute('aria-label', soundOn ? 'Mute sounds' : 'Unmute sounds');
    }
  }

  /* ---------------- bottom nav ---------------- */
  const NAV_ITEMS = [
    { hash: '#/home', icon: '🏠', label: 'Home', cls: '' },
    { hash: '#/learn', icon: '📚', label: 'Learn', cls: '' },
    { hash: '#/play', icon: '🎮', label: 'Play', cls: 'play-b' },
    { hash: '#/creative', icon: '🎨', label: 'Creative', cls: 'creative-b' },
    { hash: '#/progress', icon: '⭐', label: 'Progress', cls: 'gold-b' }
  ];

  function bottomNav(activeHash) {
    return `
      <nav class="bottom-nav" aria-label="Main navigation">
        ${NAV_ITEMS.map(n => {
          const active = activeHash.startsWith(n.hash);
          return `<button class="nav-item ${active ? 'active ' + n.cls : ''}" data-nav="${n.hash}" type="button">
            <span class="n-icon">${n.icon}</span><span>${n.label}</span>
          </button>`;
        }).join('')}
      </nav>`;
  }

  function bindNav() {
    document.querySelectorAll('[data-nav]').forEach(b => {
      b.addEventListener('click', () => { A.sfx.click(); location.hash = b.getAttribute('data-nav'); });
    });
  }

  /* ================================================================ */
  /*  SCREENS                                                          */
  /* ================================================================ */

  /* ---------- welcome ---------- */
  function screenWelcome() {
    setEnv('home');
    appEl.innerHTML = `
      <div class="welcome-wrap screen-anim">
        <div class="logo-hero">🌈</div>
        <h1 class="title-hero">${'LET\'S LEARN'.split('').map((c, i) => c === ' ' ? ' ' : `<span class="bouncy-letter" style="animation-delay:${i * 0.08}s">${c}</span>`).join('')}</h1>
        <div class="welcome-char">🐼</div>
        <div class="welcome-line big">👋 Welcome, little learner!</div>
        <div class="welcome-line">Ready to learn and play?</div>
        <button class="btn big green welcome-btn" id="btn-start" type="button">START 🚀</button>
      </div>`;
    document.getElementById('btn-start').addEventListener('click', () => {
      A.sfx.celebrate();
      A.speak('Welcome to Let\'s Learn! Let\'s get started!');
      location.hash = R.state.child ? '#/home' : '#/class';
    });
  }

  /* ---------- class selection ---------- */
  function screenClass() {
    setEnv('learn');
    appEl.innerHTML = `
      <div class="setup-wrap screen-anim">
        <div class="screen-title">👶 Which class are you in?</div>
        <p class="screen-sub">Tap your class to get started! (A parent or teacher can help)</p>
        <div class="class-grid">
          ${D.CLASS_ORDER.map(c => {
            const cls = D.CLASSES[c];
            return `<button class="class-card ${c}" data-class="${c}" type="button">
              <span class="cc-emoji">${cls.emoji}</span>
              <span class="cc-name">${cls.name}</span>
              <span class="cc-age">${cls.age}</span>
            </button>`;
          }).join('')}
        </div>
        <div class="row center-x mt">
          <button class="btn small ghost" id="btn-back-welcome" type="button">← Back</button>
        </div>
      </div>`;
    appEl.querySelectorAll('.class-card').forEach(card => {
      card.addEventListener('click', () => {
        A.sfx.correct();
        const cls = card.getAttribute('data-class');
        window._pendingClass = cls;
        location.hash = '#/profile';
      });
    });
    document.getElementById('btn-back-welcome').addEventListener('click', () => { A.sfx.click(); location.hash = '#/welcome'; });
    setTimeout(() => A.speak('Tap your class! Baby Class, Middle Class, Top Class, Primary One, Primary Two, or Primary Three!'), 500);
  }

  /* ---------- profile ---------- */
  function screenProfile() {
    setEnv('home');
    appEl.innerHTML = `
      <div class="setup-wrap screen-anim">
        <div class="screen-title">🐼 Who is learning today?</div>
        <div class="panel center">
          <p class="lesson-hint">Choose a friendly avatar</p>
          <div class="avatar-grid">
            ${D.AVATARS.map(a => `
              <button class="avatar-opt" data-avatar="${a}" type="button" aria-label="${a}">
                ${D.avatarHTML(a, 64)}
              </button>`).join('')}
          </div>
          <div class="mt"></div>
          <input class="field" id="child-name" type="text" maxlength="14" placeholder="Type your name" aria-label="Child's name" autocomplete="off"/>
          <div class="row center-x mt">
            <button class="btn small ghost" id="btn-back-class" type="button">← Back</button>
            <button class="btn big green" id="btn-done-profile" type="button">Let's Go! 🚀</button>
          </div>
        </div>
      </div>`;
    let avatar = 'panda';
    appEl.querySelectorAll('.avatar-opt').forEach(b => {
      b.addEventListener('click', () => {
        A.sfx.click();
        avatar = b.getAttribute('data-avatar');
        appEl.querySelectorAll('.avatar-opt').forEach(x => x.classList.toggle('selected', x === b));
      });
    });
    appEl.querySelectorAll('.avatar-opt')[0].classList.add('selected');
    document.getElementById('btn-back-class').addEventListener('click', () => { A.sfx.click(); location.hash = '#/class'; });
    document.getElementById('btn-done-profile').addEventListener('click', () => {
      A.sfx.celebrate();
      const name = (document.getElementById('child-name').value || '').trim();
      const cls = window._pendingClass || 'top';
      R.setChild(name || 'Little Learner', avatar, cls);
      A.speak(`Welcome, ${name || 'little learner'}! Let's have fun learning!`);
      location.hash = '#/home';
    });
    const input = document.getElementById('child-name');
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('btn-done-profile').click();
    });
    setTimeout(() => input.focus(), 400);
  }

  /* ---------- home ----------
     Kindergarten → big playful activity-area cards.
     Primary (P1–P3) → subject cards (unchanged). */
  function screenHome() {
    setEnv('home');
    const child = R.state.child;
    const kinder = isKinder();
    const areas = D.KINDER_AREAS.filter(a => !a.more);
    appEl.innerHTML = `
      <div class="screen-anim">
        <div class="home-hello">
          <div class="hh-avatar">${D.avatarHTML(child.avatar, 74)}</div>
          <div class="hh-name">👋 Hello, <span>${escapeHtml(child.name)}</span>!</div>
          <div class="hh-sub">
            <button class="class-switch-chip" id="btn-home-class" type="button" aria-label="Switch class">
              ${D.CLASSES[child.className].emoji} ${D.CLASSES[child.className].name} <span class="csc-icon">🔄</span>
            </button>
            <span>&nbsp;•&nbsp; ⭐ ${R.totalStars()} stars</span>
          </div>
        </div>

        ${kinder ? `
          <div class="screen-sub" style="margin-top:0">What do you want to learn?</div>
          <div class="card-grid">
            ${areas.map(a => areaCardHTML(a)).join('')}
          </div>
        ` : `
          <div class="screen-sub" style="margin-top:0">What would you like to learn today?</div>
          <div class="card-grid">
            ${D.SUBJECT_ORDER.map(s => {
              const subj = D.SUBJECTS[s];
              const total = R.subjectMaxStars(s, child.className);
              const earned = R.bySubject().stats[s].stars;
              return `<button class="subject-card" data-subject="${s}" type="button" style="border-top:10px solid ${subj.colorCss}">
                <span class="sc-stars">⭐ ${earned}/${total}</span>
                <span class="sc-icon">${subj.icon}</span>
                <span class="sc-name">${subj.name}</span>
              </button>`;
            }).join('')}
          </div>
        `}
        <div class="row center-x mt2">
          <button class="btn small ghost" id="go-parent" type="button">👨‍👩‍👧 Parents</button>
        </div>
      </div>`;
    appEl.querySelectorAll('.area-card').forEach(card => {
      card.addEventListener('click', () => {
        A.sfx.click();
        location.hash = '#/area/' + card.getAttribute('data-area');
      });
    });
    appEl.querySelectorAll('.subject-card').forEach(card => {
      card.addEventListener('click', () => {
        A.sfx.click();
        location.hash = '#/subject/' + card.getAttribute('data-subject');
      });
    });
    appEl.querySelector('#go-parent').addEventListener('click', () => { A.sfx.click(); location.hash = '#/parent'; });
    const classChip = appEl.querySelector('#btn-home-class');
    if (classChip) classChip.addEventListener('click', () => { A.sfx.click(); openClassSwitcher(); });
  }

  /* ---------- learn ----------
     Kindergarten → "What do you want to learn?" activity areas.
     Primary → subjects + media cards (unchanged). */
  function screenLearn() {
    setEnv('learn');
    const cls = R.state.child.className;

    if (isKinder()) {
      const core = D.KINDER_AREAS.filter(a => !a.more);
      const more = D.KINDER_AREAS.filter(a => a.more);
      appEl.innerHTML = `
        <div class="screen-anim">
          <div class="screen-title">🧸 Let's Learn!</div>
          <p class="screen-sub">What do you want to learn?</p>
          <div class="card-grid">
            ${core.map(a => areaCardHTML(a)).join('')}
          </div>
          <div class="section-label">✨ More</div>
          <div class="card-grid">
            ${more.map(a => areaCardHTML(a)).join('')}
          </div>
        </div>`;
      appEl.querySelectorAll('.area-card').forEach(card => {
        card.addEventListener('click', () => {
          A.sfx.click();
          location.hash = '#/area/' + card.getAttribute('data-area');
        });
      });
      setTimeout(() => {
        if (!document.hidden) A.speak("Let's learn! Pick an activity you like!");
        if (window.LLNarration) window.LLNarration.armGestureRetry();
      }, 500);
      return;
    }

    appEl.innerHTML = `
      <div class="screen-anim">
        <div class="screen-title">📚 Let's Learn</div>
        <p class="screen-sub">Pick a subject, ${R.state.child.name}!</p>
        <div class="subject-grid">
          ${D.SUBJECT_ORDER.map(s => {
            const subj = D.SUBJECTS[s];
            const total = R.subjectMaxStars(s, cls);
            const earned = R.bySubject().stats[s].stars;
            return `<button class="subject-card" data-subject="${s}" type="button" style="border-top:10px solid ${subj.colorCss}">
              <span class="sc-stars">⭐ ${earned}/${total}</span>
              <span class="sc-icon">${subj.icon}</span>
              <span class="sc-name">${subj.name}</span>
            </button>`;
          }).join('')}
        </div>
        <div class="section-label">🎬 Watch & sing along — all inside Let's Learn!</div>
        <div class="media-grid" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">
          <button class="creative-card" id="go-songs" type="button">
            <span class="cr-icon">🎵</span><span class="cr-name">Songs</span>
            <span class="cr-sub">Sing our Let's Learn songs</span>
          </button>
          <button class="creative-card" id="go-videos" type="button">
            <span class="cr-icon">🎬</span><span class="cr-name">Videos</span>
            <span class="cr-sub">Watch and learn with us</span>
          </button>
        </div>
      </div>`;
    appEl.querySelectorAll('.subject-card').forEach(card => {
      card.addEventListener('click', () => {
        A.sfx.click();
        location.hash = '#/subject/' + card.getAttribute('data-subject');
      });
    });
    appEl.querySelector('#go-songs').addEventListener('click', () => { A.sfx.click(); location.hash = '#/songs'; });
    appEl.querySelector('#go-videos').addEventListener('click', () => { A.sfx.click(); location.hash = '#/videos'; });
  }

  /* ---------- media libraries ---------- */
  function screenSongs() {
    setEnv('learn');
    if (!window.LLMedia) { appEl.innerHTML = '<div class="screen-anim"><div class="screen-title">🎵 Songs</div><p class="screen-sub">The media library is not available right now.</p></div>'; return; }
    window.LLMedia.loadCatalog().then(() => {
      appEl.innerHTML = '<div class="screen-anim"><div id="songs-root"></div></div>';
      window.LLMedia.libraryHTML(document.getElementById('songs-root'), 'song', R.state.child.className);
      document.getElementById('songs-root').querySelectorAll('.media-card, .screen-title').length;
    });
  }

  function screenVideos() {
    setEnv('learn');
    if (!window.LLMedia) { appEl.innerHTML = '<div class="screen-anim"><div class="screen-title">🎬 Videos</div><p class="screen-sub">The media library is not available right now.</p></div>'; return; }
    window.LLMedia.loadCatalog().then(() => {
      appEl.innerHTML = '<div class="screen-anim"><div id="videos-root"></div></div>';
      window.LLMedia.libraryHTML(document.getElementById('videos-root'), 'video', R.state.child.className);
    });
  }

  function screenMedia(id) {
    setEnv('focus');
    appEl.innerHTML = `
      <div class="screen-anim">
        <div class="row center-x" style="margin-bottom:6px">
          <button class="btn small ghost" id="btn-back-media" type="button">← Back</button>
        </div>
        <div id="media-root"></div>
        <div id="media-related"></div>
      </div>`;
    document.getElementById('btn-back-media').addEventListener('click', () => {
      A.sfx.click();
      history.length > 1 ? history.back() : (location.hash = '#/learn');
    });
    if (!window.LLMedia) { document.getElementById('media-root').innerHTML = '<p class="screen-sub">Media not available.</p>'; return; }
    window.LLMedia.loadCatalog().then(() => {
      const rec = window.LLMedia.byId(id);
      if (!rec) { document.getElementById('media-root').innerHTML = '<p class="screen-sub">Media not found</p>'; return; }
      window.LLMedia.playerHTML(document.getElementById('media-root'), { id, autoplay: false });
      window.LLMedia.relatedHTML(document.getElementById('media-related'), id, 4);
    });
  }

  /* ---------- kindergarten activity area ----------
     Show-first, speak-second: big cards, short words, teacher voice. */
  function screenArea(areaId) {
    setEnv('focus');
    const cls = R.state.child.className;
    const area = D.KINDER_AREAS.find(a => a.id === areaId);
    if (!area) { location.hash = '#/learn'; return; }
    const ids = (area.lessons && area.lessons[cls]) || [];
    const lessons = ids.map(id => R.findLesson(id)).filter(Boolean);
    const records = R.state.lessonRecords;
    const nowId = lessons.find(l => !records[l.id]);
    const gameCard = area.game && window.LLGames
      ? window.LLGames.availableGames(cls).find(g => g.id === area.game)
      : null;

    appEl.innerHTML = `
      <div class="screen-anim">
        <div class="screen-title">${area.icon} ${area.label}</div>
        <p class="screen-sub">Choose an activity</p>
        <div class="lesson-grid">
          ${lessons.map(l => {
            const rec = records[l.id];
            const isNow = nowId === l;
            return `<button class="subject-card lesson-card ${rec ? 'done' : ''} ${isNow ? 'current' : ''}" data-lesson="${l.id}" type="button" style="border-top:10px solid ${rec ? '#35c46b' : isNow ? '#ffb703' : area.color}">
              <span class="sc-stars">${rec ? '⭐'.repeat(rec.stars) + '☆'.repeat(3 - rec.stars) : '☆☆☆'}</span>
              <span class="sc-icon">${l.icon}</span>
              <span class="sc-name">${l.title}</span>
              ${isNow ? '<span class="sc-pill">▶ Play</span>' : ''}
            </button>`;
          }).join('')}
          ${gameCard ? `<button class="area-card" data-hash="#/game/${gameCard.id}" type="button" style="--ac:${area.color}">
            <span class="ac-icon">🎮</span><span class="ac-name">${gameCard.name}</span>
          </button>` : ''}
          ${(area.builtin || []).map(b => `<button class="area-card" data-hash="${b.hash}" type="button" style="--ac:${area.color}">
            <span class="ac-icon">${b.icon}</span><span class="ac-name">${b.name}</span>
          </button>`).join('')}
        </div>
        <div class="row center-x mt">
          <button class="btn small ghost" id="btn-back-areas" type="button">← All activities</button>
        </div>
      </div>`;

    appEl.querySelectorAll('.lesson-card').forEach(card => {
      card.addEventListener('click', () => {
        A.sfx.click();
        location.hash = '#/lesson/' + card.getAttribute('data-lesson');
      });
    });
    appEl.querySelectorAll('.area-card[data-hash]').forEach(card => {
      card.addEventListener('click', () => {
        A.sfx.click();
        location.hash = card.getAttribute('data-hash');
      });
    });
    document.getElementById('btn-back-areas').addEventListener('click', () => { A.sfx.click(); location.hash = '#/learn'; });
    // the teacher voice welcomes the child to the area
    if (area.speak) {
      setTimeout(() => {
        if (!document.hidden) A.speak(area.speak);
        if (window.LLNarration) window.LLNarration.armGestureRetry();
      }, 450);
    }
  }

  /* ---------- subject lessons (primary) ---------- */
  function screenSubject(subjectId) {
    if (isKinder()) { location.hash = '#/learn'; return; }

    setEnv('focus');
    const cls = R.state.child.className;
    const subj = D.SUBJECTS[subjectId];
    const lessons = R.lessonsFor(subjectId, cls);
    const records = R.state.lessonRecords;
    const doneCount = lessons.filter(l => records[l.id]).length;
    const nowId = lessons.find(l => !records[l.id]);
    appEl.innerHTML = `
      <div class="screen-anim">
        <div class="screen-title">${subj.icon} ${subj.name}</div>
        <p class="screen-sub">${doneCount} of ${lessons.length} lessons done • ⭐ ${R.bySubject().stats[subjectId].stars} stars</p>
        <div class="lesson-grid">
          ${lessons.map(l => {
            const rec = records[l.id];
            const isNow = nowId === l;
            return `<button class="subject-card lesson-card ${rec ? 'done' : ''} ${isNow ? 'current' : ''}" data-lesson="${l.id}" type="button" style="border-top:10px solid ${rec ? '#35c46b' : isNow ? '#ffb703' : subj.colorCss}">
              <span class="sc-stars">${rec ? '⭐'.repeat(rec.stars) + '☆'.repeat(3 - rec.stars) : '☆☆☆'}</span>
              <span class="sc-icon">${l.icon}</span>
              <span class="sc-name">${l.title}</span>
              <span class="lc-topic">${l.topic} • ${l.steps.length} steps</span>
              ${isNow ? '<span class="sc-pill">▶ Play</span>' : ''}
            </button>`;
          }).join('')}
        </div>
        <div class="row center-x mt">
          <button class="btn small ghost" id="btn-back-learn" type="button">← All subjects</button>
        </div>
      </div>`;
    appEl.querySelectorAll('.lesson-card').forEach(row => {
      row.addEventListener('click', () => {
        A.sfx.click();
        location.hash = '#/lesson/' + row.getAttribute('data-lesson');
      });
    });
    document.getElementById('btn-back-learn').addEventListener('click', () => { A.sfx.click(); location.hash = '#/learn'; });
  }

  /* ---------- lesson ---------- */
  function screenLesson(lessonId) {
    setEnv('focus');
    const lesson = R.findLesson(lessonId);
    appEl.innerHTML = `
      <div class="screen-anim">
        <div class="row center-x" style="margin-bottom:6px">
          <button class="btn small ghost" id="btn-quit-lesson" type="button">← Back</button>
        </div>
        <div id="lesson-player"></div>
      </div>`;
    document.getElementById('btn-quit-lesson').addEventListener('click', () => {
      A.sfx.click();
      if (lesson) {
        const area = isKinder() ? D.areaForLesson(lesson.id) : null;
        location.hash = area ? '#/area/' + area : '#/subject/' + lesson.subject;
      } else {
        location.hash = '#/learn';
      }
    });
    if (lesson) {
      window.LLLessons.play(document.getElementById('lesson-player'), lesson);
    } else {
      document.getElementById('lesson-player').innerHTML = '<p class="screen-sub">Lesson not found!</p>';
    }
  }

  /* ---------- play ---------- */
  function screenPlay() {
    setEnv('play');
    const cls = R.state.child.className;
    appEl.innerHTML = `<div id="games-root"></div>`;
    window.LLGames.renderGameList(document.getElementById('games-root'), cls);
  }

  function screenGame(gameId) {
    setEnv('play');
    const cls = R.state.child.className;
    appEl.innerHTML = `<div id="game-root"></div>`;
    window.LLGames.play(document.getElementById('game-root'), gameId, cls);
  }

  /* ---------- creative ---------- */
  function screenCreative() {
    setEnv('creative');
    const cards = [
      { id: 'coloring', icon: '🖍️', name: 'Coloring', sub: 'Color beautiful pictures' },
      { id: 'tracing', icon: '✏️', name: 'Tracing', sub: 'Trace letters, numbers & shapes' },
      { id: 'draw', icon: '🖼️', name: 'Free Draw', sub: 'Draw anything you like' },
      { id: 'shapeart', icon: '🔷', name: 'Shape Art', sub: 'Build pictures with shapes' },
      { id: 'matching', icon: '🧩', name: 'Matching', sub: 'Match pairs & colors' }
    ];
    appEl.innerHTML = `
      <div class="screen-anim">
        <div class="screen-title">🎨 Creative Corner</div>
        <p class="screen-sub">Make something beautiful!</p>
        <div class="creative-grid">
          ${cards.map(c => `
            <button class="creative-card" data-go="${c.id}" type="button">
              <span class="cr-icon">${c.icon}</span>
              <span class="cr-name">${c.name}</span>
              <span class="cr-sub">${c.sub}</span>
            </button>`).join('')}
        </div>
      </div>`;
    appEl.querySelectorAll('[data-go]').forEach(b => {
      b.addEventListener('click', () => {
        A.sfx.click();
        const go = b.getAttribute('data-go');
        if (go === 'coloring') location.hash = '#/coloring';
        else if (go === 'tracing') location.hash = '#/tracing';
        else if (go === 'draw') location.hash = '#/draw';
        else if (go === 'shapeart') location.hash = '#/shapeart';
        else if (go === 'matching') location.hash = '#/matching';
      });
    });
  }

  /* ---------- coloring picker + activity ---------- */
  function screenColoring(templateId) {
    setEnv('creative');
    const tplIds = Object.keys(D.COLORING_TEMPLATES);
    if (templateId && D.COLORING_TEMPLATES[templateId]) {
      appEl.innerHTML = `
        <div class="screen-anim">
          <div class="row center-x" style="margin-bottom:6px">
            <button class="btn small ghost" id="btn-back-creative" type="button">← Back</button>
          </div>
          <div id="coloring-root"></div>
        </div>`;
      document.getElementById('btn-back-creative').addEventListener('click', () => { A.sfx.click(); location.hash = '#/creative'; });
      window.LLColoring.start(document.getElementById('coloring-root'), {
        template: templateId,
        onDone: () => {
          R.recordActivity('coloring', D.COLORING_TEMPLATES[templateId].name, 1);
          A.sfx.celebrate();
          const cDur = window.LLApp.celebrate('🎉 Beautiful! 🎉', null, 1, { kind: 'success' });
          goLater('#/coloring', cDur * 1000 + 350);
        }
      });
    } else {
      appEl.innerHTML = `
        <div class="screen-anim">
          <div class="screen-title">🖍️ Choose a picture to color</div>
          <div class="card-grid cols-2">
            ${tplIds.map(t => `
              <button class="creative-card" data-tpl="${t}" type="button">
                <span class="cr-icon">${D.COLORING_TEMPLATES[t].emoji}</span>
                <span class="cr-name">${D.COLORING_TEMPLATES[t].name}</span>
              </button>`).join('')}
          </div>
        </div>`;
      appEl.querySelectorAll('[data-tpl]').forEach(b => {
        b.addEventListener('click', () => {
          A.sfx.click();
          location.hash = '#/coloring/' + b.getAttribute('data-tpl');
        });
      });
    }
  }

  /* ---------- tracing picker + activity ---------- */
  function screenTracing(kind, which) {
    setEnv('creative');
    const cls = R.state.child.className;
    const options = {
      letter: cls === 'baby' || cls === 'middle' ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
      number: cls === 'baby' || cls === 'middle' ? ['1', '2', '3'] : ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      shape: ['circle', 'square', 'triangle', 'star', 'heart', 'diamond'],
      line: ['straight', 'wave', 'zigzag', 'spiral']
    };
    if (kind && which && D.TRACE_TEMPLATES[kind] && D.TRACE_TEMPLATES[kind][which]) {
      appEl.innerHTML = `
        <div class="screen-anim">
          <div class="row center-x" style="margin-bottom:6px">
            <button class="btn small ghost" id="btn-back-tracing" type="button">← Back</button>
          </div>
          <div id="tracing-root"></div>
        </div>`;
      document.getElementById('btn-back-tracing').addEventListener('click', () => { A.sfx.click(); location.hash = '#/tracing'; });
      window.LLTracing.start(document.getElementById('tracing-root'), {
        kind, which,
        onDone: () => {
          R.recordActivity('tracing', `${kind} ${which}`, 1);
          A.sfx.celebrate();
          const cDur = window.LLApp.celebrate('🎉 Super Tracing! 🎉', null, 1, { kind: 'success' });
          goLater('#/tracing', cDur * 1000 + 350);
        }
      });
    } else {
      appEl.innerHTML = `
        <div class="screen-anim">
          <div class="screen-title">✏️ What shall we trace?</div>
          <div class="section-label">🔤 Letters</div>
          <div class="trace-tools" style="justify-content:flex-start">
            ${options.letter.map(l => `<button class="trace-option" data-k="letter" data-w="${l}" type="button">${l}</button>`).join('')}
          </div>
          <div class="section-label">🔢 Numbers</div>
          <div class="trace-tools" style="justify-content:flex-start">
            ${options.number.map(n => `<button class="trace-option" data-k="number" data-w="${n}" type="button">${n}</button>`).join('')}
          </div>
          <div class="section-label">🔷 Shapes</div>
          <div class="trace-tools" style="justify-content:flex-start">
            ${options.shape.map(s => `<button class="trace-option" data-k="shape" data-w="${s}" type="button">${D.TRACE_LABELS.shape[s]} ${D.SHAPE_NAMES[s]}</button>`).join('')}
          </div>
          <div class="section-label">〰️ Lines</div>
          <div class="trace-tools" style="justify-content:flex-start">
            ${options.line.map(l => `<button class="trace-option" data-k="line" data-w="${l}" type="button">${D.TRACE_LABELS.line[l]} ${l}</button>`).join('')}
          </div>
        </div>`;
      appEl.querySelectorAll('.trace-option').forEach(b => {
        b.addEventListener('click', () => {
          A.sfx.click();
          location.hash = '#/tracing/' + b.getAttribute('data-k') + '/' + b.getAttribute('data-w');
        });
      });
    }
  }

  /* ---------- free draw ---------- */
  function screenDraw() {
    setEnv('creative');
    appEl.innerHTML = `
      <div class="screen-anim">
        <div class="screen-title">🖼️ Free Draw</div>
        <div class="draw-tools">
          ${['#ef4444', '#facc15', '#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#33385c'].map((c, i) =>
            `<button type="button" class="pal-swatch${i === 0 ? ' selected' : ''}" data-c="${c}" style="background:${c}"></button>`).join('')}
          <button type="button" class="draw-size" data-s="8" aria-label="Small brush"><span class="dot" style="width:8px;height:8px"></span></button>
          <button type="button" class="draw-size active" data-s="16" aria-label="Medium brush"><span class="dot" style="width:16px;height:16px"></span></button>
          <button type="button" class="draw-size" data-s="30" aria-label="Large brush"><span class="dot" style="width:30px;height:30px"></span></button>
        </div>
        <div class="trace-canvas-wrap mt" style="touch-action:none">
          <canvas width="1200" height="760" style="border-radius:16px;background:#fff" aria-label="Drawing canvas"></canvas>
        </div>
        <div class="trace-tools mt">
          <button type="button" class="btn small ghost" id="btn-clear-draw">🧽 Clear</button>
          <button type="button" class="btn small green" id="btn-done-draw">✅ Done</button>
        </div>
      </div>`;
    const canvas = appEl.querySelector('canvas');
    const g = canvas.getContext('2d');
    const wrap = appEl.querySelector('.trace-canvas-wrap');
    let color = '#ef4444', size = 16, drawing = false;

    function pos(e) {
      const rect = canvas.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    }
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      drawing = true;
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
      const [x, y] = pos(e);
      g.beginPath();
      g.arc(x, y, size / 2, 0, Math.PI * 2);
      g.fillStyle = color;
      g.fill();
      g.beginPath();
      g.moveTo(x, y);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!drawing) return;
      const [x, y] = pos(e);
      g.lineTo(x, y);
      g.strokeStyle = color;
      g.lineWidth = size;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.stroke();
    });
    canvas.addEventListener('pointerup', () => { drawing = false; });
    appEl.querySelectorAll('.pal-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        A.sfx.click();
        color = sw.getAttribute('data-c');
        appEl.querySelectorAll('.pal-swatch').forEach(x => x.classList.toggle('selected', x === sw));
      });
    });
    appEl.querySelectorAll('.draw-size').forEach(b => {
      b.addEventListener('click', () => {
        A.sfx.click();
        size = +b.getAttribute('data-s');
        appEl.querySelectorAll('.draw-size').forEach(x => x.classList.toggle('active', x === b));
      });
    });
    document.getElementById('btn-clear-draw').addEventListener('click', () => {
      A.sfx.click();
      g.clearRect(0, 0, canvas.width, canvas.height);
    });
    document.getElementById('btn-done-draw').addEventListener('click', () => {
      A.sfx.click();
      R.recordActivity('draw', 'Free draw', 1);
      const cDur = window.LLApp.celebrate('🎉 What a masterpiece! 🎉', null, 1, { kind: 'success' });
      goLater('#/creative', cDur * 1000 + 350);
    });
  }

  /* ---------- shape art ---------- */
  function screenShapeArt() {
    setEnv('creative');
    appEl.innerHTML = `
      <div class="screen-anim">
        <div class="screen-title">🔷 Shape Art</div>
        <p class="screen-sub">Pick a shape and a color, then tap the canvas to stamp it. Drag shapes to move them!</p>
        <div id="shapeart-root"></div>
      </div>`;
    const D2 = D;
    // reuse a mini version of the lesson shapeArt player via a synthetic lesson
    const syntheticLesson = {
      id: 'shapeart-free', subject: 'creative', title: 'Shape Art', steps: [{ t: 'shapeArt' }]
    };
    const holder = document.getElementById('shapeart-root');
    // We render directly with a simplified variant: reuse LLLessons by overriding? Simplest: inline player here.
    const body = holder;
    let color = '#2f7de1';
    body.innerHTML = `
      <div class="lesson-stage">
        <div class="shape-art-tray">
          ${['circle', 'square', 'triangle', 'star', 'heart', 'diamond'].map(s =>
            `<button type="button" class="sa-shape" data-shape="${s}">${D2.shapeSVG(s, 44, '#2f7de1')}</button>`).join('')}
        </div>
        <div class="palette">
          ${['#ef4444', '#facc15', '#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#92400e'].map((c, i) =>
            `<button type="button" class="pal-swatch${i === 0 ? ' selected' : ''}" data-c="${c}" style="background:${c}"></button>`).join('')}
        </div>
        <div class="trace-canvas-wrap" style="touch-action:none">
          <canvas width="1000" height="700" style="border-radius:16px;background:#fff"></canvas>
        </div>
        <div class="trace-tools">
          <button type="button" class="btn small ghost btn-sa-clear">🧽 Clear</button>
          <button type="button" class="btn small green btn-sa-done">✅ Done</button>
        </div>
      </div>`;
    const canvas = body.querySelector('canvas');
    const g = canvas.getContext('2d');
    const wrap = body.querySelector('.trace-canvas-wrap');
    let shapes = [];
    let selectedShape = 'circle';

    function drawAll() {
      g.clearRect(0, 0, canvas.width, canvas.height);
      shapes.forEach(sh => {
        g.fillStyle = sh.c;
        g.strokeStyle = '#33385c';
        g.lineWidth = 6;
        const cx = sh.x, cy = sh.y, r = sh.r;
        g.beginPath();
        if (sh.s === 'circle') g.arc(cx, cy, r, 0, Math.PI * 2);
        else if (sh.s === 'square') g.rect(cx - r, cy - r, r * 2, r * 2);
        else if (sh.s === 'triangle') { g.moveTo(cx, cy - r); g.lineTo(cx - r, cy + r); g.lineTo(cx + r, cy + r); g.closePath(); }
        else if (sh.s === 'star') {
          const pts = D2.starPoints(cx, cy, r, r * 0.45).split(' ').map(p => p.split(',').map(Number));
          g.moveTo(pts[0][0], pts[0][1]);
          pts.slice(1).forEach(p => g.lineTo(p[0], p[1]));
          g.closePath();
        }
        else if (sh.s === 'heart') {
          g.moveTo(cx, cy + r * 0.8);
          g.bezierCurveTo(cx - r * 1.3, cy - r * 0.1, cx - r * 0.8, cy - r, cx, cy - r * 0.3);
          g.bezierCurveTo(cx + r * 0.8, cy - r, cx + r * 1.3, cy - r * 0.1, cx, cy + r * 0.8);
        }
        else if (sh.s === 'diamond') { g.moveTo(cx, cy - r); g.lineTo(cx + r, cy); g.lineTo(cx, cy + r); g.lineTo(cx - r, cy); g.closePath(); }
        g.fill();
        g.stroke();
      });
    }
    function pos(e) {
      const rect = canvas.getBoundingClientRect();
      return [(e.clientX - rect.left) * (canvas.width / rect.width), (e.clientY - rect.top) * (canvas.height / rect.height)];
    }
    canvas.addEventListener('pointerdown', (e) => {
      const [x, y] = pos(e);
      for (let i = shapes.length - 1; i >= 0; i--) {
        const sh = shapes[i];
        if (Math.sqrt((x - sh.x) ** 2 + (y - sh.y) ** 2) < sh.r + 25) {
          window._saDrag = { sh, ox: x - sh.x, oy: y - sh.y };
          canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
          return;
        }
      }
      shapes.push({ s: selectedShape, x, y, r: 40, c: color });
      A.sfx.pop();
      drawAll();
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!window._saDrag) return;
      const [x, y] = pos(e);
      window._saDrag.sh.x = x - window._saDrag.ox;
      window._saDrag.sh.y = y - window._saDrag.oy;
      drawAll();
    });
    canvas.addEventListener('pointerup', () => { window._saDrag = null; });
    body.querySelectorAll('.sa-shape').forEach(b => {
      b.addEventListener('click', () => {
        A.sfx.click();
        selectedShape = b.getAttribute('data-shape');
        body.querySelectorAll('.sa-shape').forEach(x => x.classList.toggle('active', x === b));
      });
    });
    body.querySelectorAll('.pal-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        A.sfx.click();
        color = sw.getAttribute('data-c');
        body.querySelectorAll('.pal-swatch').forEach(x => x.classList.toggle('selected', x === sw));
      });
    });
    body.querySelector('.btn-sa-clear').addEventListener('click', () => { A.sfx.click(); shapes = []; drawAll(); });
    body.querySelector('.btn-sa-done').addEventListener('click', () => {
      A.sfx.click();
      if (shapes.length >= 2) {
        R.recordActivity('shapeart', 'Shape art', 1);
        const cDur = window.LLApp.celebrate('🎉 Wonderful picture! 🎉', null, 1, { kind: 'success' });
        goLater('#/creative', cDur * 1000 + 350);
      } else {
        A.speak('Add a few more shapes to finish your picture!');
      }
    });
    drawAll();
    setTimeout(() => A.speak('Pick a shape and a color, then tap the canvas to add it!', { force: false }), 400);
  }

  /* ---------- matching (creative) ---------- */
  function screenMatching() {
    setEnv('creative');
    appEl.innerHTML = `
      <div class="screen-anim">
        <div class="screen-title">🧩 Matching</div>
        <div class="panel center">
          <div id="match-body"></div>
        </div>
      </div>`;
    const pairs = [['🍎', 'Apple'], ['⚽', 'Ball'], ['🐱', 'Cat'], ['☀️', 'Sun'], ['⭐', 'Star'], ['🌸', 'Flower']].slice(0, 4);
    const body = document.getElementById('match-body');
    let selected = null, matchedCount = 0;
    body.innerHTML = `
      <p class="lesson-prompt">Tap the picture, then tap its word!</p>
      <div class="match-grid">
        ${D.shuffle(pairs.map((p, i) => ({ kind: 'pic', key: i })).concat(pairs.map((p, i) => ({ kind: 'word', key: i })))).map(it => `
          <button class="match-card" data-key="${it.key}" data-kind="${it.kind}" type="button">
            ${it.kind === 'pic' ? `<span class="mc-emoji">${pairs[it.key][0]}</span>` : pairs[it.key][1]}
          </button>`).join('')}
      </div>`;
    body.querySelectorAll('.match-card').forEach(card => {
      card.addEventListener('click', () => {
        if (card.classList.contains('matched')) return;
        A.sfx.flip();
        if (!selected) { selected = card; card.classList.add('selected'); }
        else if (selected === card) { selected = null; card.classList.remove('selected'); }
        else {
          const a = selected, b = card;
          if (a.dataset.key === b.dataset.key && a.dataset.kind !== b.dataset.kind) {
            a.classList.remove('selected'); a.classList.add('matched'); b.classList.add('matched');
            matchedCount++; A.sfx.correct(); selected = null;
            if (matchedCount === pairs.length) {
              R.recordActivity('matching', 'Matching game', 1);
              const cDur = window.LLApp.celebrate('🎉 All matched! 🎉', null, 1, { kind: 'success' });
              goLater('#/creative', cDur * 1000 + 350);
            }
          } else {
            a.classList.remove('selected');
            selected = null;
            A.sfx.wrong();
            a.classList.add('shake'); b.classList.add('shake');
            setTimeout(() => { a.classList.remove('shake'); b.classList.remove('shake'); }, 450);
          }
        }
      });
    });
  }

  /* ---------- rewards ---------- */
  function screenRewards() {
    setEnv('focus');
    const snap = R.snapshot();
    appEl.innerHTML = `
      <div class="screen-anim">
        <div class="screen-title">🏆 Rewards</div>
        <div class="panel center mb">
          <div class="progress-hero" style="padding:10px">
            <div class="ph-stars">${'⭐'.repeat(Math.min(snap.totalStars, 20))}</div>
            <div class="ph-num">${snap.totalStars} Stars</div>
            <div class="ph-label">Keep learning to earn more!</div>
          </div>
        </div>
        <div class="section-label">🎖️ My Badges (${snap.badges.length}/${D.BADGES.length})</div>
        <div class="badge-grid">
          ${D.BADGES.map(b => {
            const unlocked = snap.badges.indexOf(b.id) !== -1;
            return `<div class="badge-card ${unlocked ? 'unlocked' : 'locked'}">
              <span class="bc-icon">${b.icon}</span>
              <span class="bc-name">${b.name}</span>
              <span class="bc-desc">${b.desc}</span>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  /* ---------- journey ---------- */
  function screenJourney(subject) {
    setEnv('focus');
    const cls = R.state.child.className;
    const records = R.state.lessonRecords;

    // kindergarten: journey follows the activity areas, not school subjects
    if (isKinder()) {
      const areas = D.KINDER_AREAS;
      const active = subject && areas.find(a => a.id === subject) ? subject : areas[0].id;
      const area = areas.find(a => a.id === active);
      appEl.innerHTML = `
        <div class="screen-anim">
          <div class="screen-title">🗺️ Learning Journey</div>
          <div class="journey-tabs">
            ${areas.map(a => `<button class="jtab ${a.id === active ? 'active' : ''}" data-subject="${a.id}" type="button"
              style="${a.id === active ? 'background:' + a.color : ''}">${a.icon} ${a.name}</button>`).join('')}
          </div>
          <div class="journey-path panel">
            ${(function () {
              const lessons = ((area.lessons && area.lessons[cls]) || []).map(id => R.findLesson(id)).filter(Boolean);
              const nowId = lessons.find(l => !records[l.id]);
              if (!lessons.length) return '<p class="screen-sub">Choose an activity to begin!</p>';
              return lessons.map((l, i) => {
                const rec = records[l.id];
                const isNow = nowId === l;
                const icon = rec ? '⭐' : l.icon;
                return `
                  <div class="jnode">
                    ${i > 0 ? `<div class="jn-line ${rec ? 'done' : ''}"></div>` : ''}
                    <button class="jn-dot ${rec ? 'done' : ''} ${isNow ? 'current' : ''}" data-lesson="${l.id}" type="button"
                      style="border-color:${rec ? '#ffb703' : isNow ? area.color : '#dfe4f5'}">
                      ${icon}
                    </button>
                    <div class="jn-label">${l.title}</div>
                    <div class="jn-stars">${rec ? '⭐'.repeat(rec.stars) + '☆'.repeat(3 - rec.stars) : '☆☆☆'}</div>
                  </div>`;
              }).join('');
            })()}
          </div>
        </div>`;
      appEl.querySelectorAll('.jtab').forEach(t => {
        t.addEventListener('click', () => {
          A.sfx.click();
          location.hash = '#/journey/' + t.getAttribute('data-subject');
        });
      });
      appEl.querySelectorAll('.jn-dot').forEach(d => {
        d.addEventListener('click', () => {
          A.sfx.click();
          location.hash = '#/lesson/' + d.getAttribute('data-lesson');
        });
      });
      return;
    }

    const activeSubject = subject || 'english';
    appEl.innerHTML = `
      <div class="screen-anim">
        <div class="screen-title">🗺️ Learning Journey</div>
        <div class="journey-tabs">
          ${D.SUBJECT_ORDER.map(s => {
            const subj = D.SUBJECTS[s];
            return `<button class="jtab ${s === activeSubject ? 'active' : ''}" data-subject="${s}" type="button"
              style="${s === activeSubject ? 'background:' + subj.colorCss : ''}">${subj.icon} ${subj.name}</button>`;
          }).join('')}
        </div>
        <div class="journey-path panel">
          ${(function () {
            const lessons = R.lessonsFor(activeSubject, cls);
            const nowId = lessons.find(l => !records[l.id]);
            const subj = D.SUBJECTS[activeSubject];
            if (!lessons.length) return '<p class="screen-sub">No lessons yet!</p>';
            return lessons.map((l, i) => {
              const rec = records[l.id];
              const isNow = nowId === l;
              const icon = rec ? '⭐' : l.icon;
              return `
                <div class="jnode">
                  ${i > 0 ? `<div class="jn-line ${rec ? 'done' : ''}"></div>` : ''}
                  <button class="jn-dot ${rec ? 'done' : ''} ${isNow ? 'current' : ''}" data-lesson="${l.id}" type="button"
                    style="border-color:${rec ? '#ffb703' : isNow ? subj.colorCss : '#dfe4f5'}">
                    ${icon}
                  </button>
                  <div class="jn-label">${l.title}</div>
                  <div class="jn-stars">${rec ? '⭐'.repeat(rec.stars) + '☆'.repeat(3 - rec.stars) : '☆☆☆'}</div>
                </div>`;
            }).join('');
          })()}
        </div>
      </div>`;
    appEl.querySelectorAll('.jtab').forEach(t => {
      t.addEventListener('click', () => {
        A.sfx.click();
        location.hash = '#/journey/' + t.getAttribute('data-subject');
      });
    });
    appEl.querySelectorAll('.jn-dot').forEach(d => {
      d.addEventListener('click', () => {
        A.sfx.click();
        location.hash = '#/lesson/' + d.getAttribute('data-lesson');
      });
    });
  }

  /* ---------- adventure ---------- */
  function screenAdventure() {
    setEnv('home');
    const adv = R.getAdventure();
    const taskDefs = D.ADVENTURE_TASKS.filter(t => adv.tasks.indexOf(t.id) !== -1);
    appEl.innerHTML = `
      <div class="screen-anim">
        <div class="screen-title">🌟 Today's Adventure</div>
        <div class="panel">
          <p class="screen-sub">Complete all 3 tasks to earn <b>3 bonus stars</b>! No rush — tomorrow is a new adventure. 🌈</p>
          ${taskDefs.map(t => {
            const done = adv.done.indexOf(t.id) !== -1;
            return `<div class="task-row ${done ? 'done' : ''}">
              <span class="task-check">✓</span>
              <span>
                <span class="task-label">${t.icon} ${t.label}</span><br/>
                <span class="task-sub">${done ? 'Completed! 🎉' : 'Not yet — go and try it!'}</span>
              </span>
            </div>`;
          }).join('')}
          <div class="row center-x mt">
            <button class="btn big gold" id="btn-claim" type="button" ${adv.claimed || adv.done.length < 3 ? 'disabled' : ''}>
              ${adv.claimed ? '✅ Claimed!' : adv.done.length >= 3 ? '🎁 Claim 3 stars!' : `Claim (${adv.done.length}/3 done)`}
            </button>
          </div>
        </div>
      </div>`;
    document.getElementById('btn-claim').addEventListener('click', () => {
      const bonus = R.claimAdventure();
      if (bonus > 0) {
        // add bonus stars as activity
        R.recordActivity('adventure', 'Today\'s Adventure bonus', bonus);
        A.sfx.celebrate();
        const cDur = window.LLApp.celebrate('🎉 Adventure Complete! 🎉', null, bonus, { kind: 'big' });
        goLater('#/home', cDur * 1000 + 350);
      }
    });
  }

  /* ---------- progress ---------- */
  function screenProgress() {
    setEnv('focus');
    const cls = R.state.child.className;
    const total = R.bySubject();
    const snap = R.snapshot();
    const records = R.state.lessonRecords;

    // kindergarten: progress shown per playful activity area
    const rows = isKinder() ? D.KINDER_AREAS.map(a => {
      const lessons = ((a.lessons && a.lessons[cls]) || []).map(id => R.findLesson(id)).filter(Boolean);
      const earned = lessons.reduce((s, l) => s + (records[l.id] ? records[l.id].stars : 0), 0);
      const max = lessons.length * 3;
      const pct = max ? Math.round((earned / max) * 100) : 0;
      return `<div class="panel subject-progress">
          <div class="sp-head">
            <span class="sp-name">${a.icon} ${a.name}</span>
            <span class="sp-stars">⭐ ${earned}/${max}</span>
          </div>
          <div class="pbar"><div class="fill" style="width:${pct}%;background:linear-gradient(90deg,${a.color},${a.color}cc)"></div></div>
        </div>`;
    }).join('') : D.SUBJECT_ORDER.map(s => {
      const subj = D.SUBJECTS[s];
      const stats = total.stats[s];
      const max = R.subjectMaxStars(s, cls);
      const pct = max ? Math.round((stats.stars / max) * 100) : 0;
      return `
        <div class="panel subject-progress">
          <div class="sp-head">
            <span class="sp-name">${subj.icon} ${subj.name}</span>
            <span class="sp-stars">⭐ ${stats.stars}/${max}</span>
          </div>
          <div class="pbar"><div class="fill" style="width:${pct}%;background:linear-gradient(90deg,${subj.colorCss},${subj.colorCss}cc)"></div></div>
        </div>`;
    }).join('');

    appEl.innerHTML = `
      <div class="screen-anim">
        <div class="screen-title">⭐ My Progress</div>
        <div class="panel center mb">
          <div class="progress-hero" style="padding:8px">
            <div class="ph-stars">${'⭐'.repeat(Math.min(total.total.stars, 20))}</div>
            <div class="ph-num">${total.total.stars} Stars</div>
            <div class="ph-label">${snap.lessonsDone} lessons • ${snap.badges.length} badges • ${fmtTime(R.state.timeSec)} learning</div>
          </div>
        </div>
        ${rows}
        <div class="row center-x">
          <button class="btn small ghost" id="btn-to-rewards" type="button">🏆 See my badges</button>
          <button class="btn small ghost" id="btn-to-journey" type="button">🗺️ Learning journey</button>
        </div>
      </div>`;
    document.getElementById('btn-to-rewards').addEventListener('click', () => { A.sfx.click(); location.hash = '#/rewards'; });
    document.getElementById('btn-to-journey').addEventListener('click', () => { A.sfx.click(); location.hash = '#/journey'; });
  }

  function fmtTime(sec) {
    const m = Math.round(sec / 60);
    if (m < 60) return m + ' min';
    return Math.floor(m / 60) + 'h ' + (m % 60) + 'm';
  }

  /* ---------- parent area ---------- */
  function screenParent() {
    setEnv('focus');
    appEl.innerHTML = `
      <div class="screen-anim">
        <div class="screen-title">👨‍👩‍👧 Parent Area</div>
        <div class="panel center" style="max-width:420px;margin:0 auto">
          <p class="lesson-hint">Enter the 4-digit PIN to open the parent area</p>
          <div class="pin-dots" id="pin-dots">${'<span class="pd"></span>'.repeat(4)}</div>
          <div class="pin-pad" id="pin-pad">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map(k =>
              `<button class="pin-key" data-k="${k}" type="button">${k}</button>`).join('')}
          </div>
          <p class="lesson-hint" style="font-size:0.85rem;margin-top:10px">Demo PIN: 1 2 3 4</p>
        </div>
      </div>`;
    let pin = '';
    const dots = document.getElementById('pin-dots').children;
    const PIN = '1234';
    document.getElementById('pin-pad').addEventListener('click', (e) => {
      const k = e.target.getAttribute('data-k');
      if (k === null) return;
      A.sfx.click();
      if (k === '⌫') { pin = pin.slice(0, -1); }
      else if (k !== '') { pin = (pin + k).slice(0, 4); }
      for (let i = 0; i < 4; i++) dots[i].classList.toggle('filled', i < pin.length);
      if (pin.length === 4) {
        if (pin === PIN) {
          A.sfx.correct();
          setTimeout(() => screenParentDash(), 350);
        } else {
          A.sfx.wrong();
          A.speak('That PIN is not correct. Try again!');
          pin = '';
          setTimeout(() => { for (let i = 0; i < 4; i++) dots[i].classList.remove('filled'); }, 400);
        }
      }
    });
  }

  function screenParentDash() {
    setEnv('focus');
    const total = R.bySubject();
    const snap = R.snapshot();
    const weak = R.weakAreas();
    const least = R.leastPracticed();
    const child = R.state.child;
    appEl.innerHTML = `
      <div class="screen-anim">
        <div class="screen-title">👨‍👩‍👧 Parent Area</div>
        <div class="panel mb">
          <div class="row">
            <span style="font-size:2.4rem">${D.avatarHTML(child.avatar, 52)}</span>
            <span class="grow">
              <b style="font-size:1.3rem">${escapeHtml(child.name)}</b><br/>
              <span style="color:var(--ink-soft);font-weight:600">${D.CLASSES[child.className].name}</span>
            </span>
            <button class="btn small gray" id="btn-edit-child" type="button">✏️ Edit</button>
          </div>
        </div>
        <div class="stat-cards">
          <div class="stat-card"><div class="sc-num">⭐ ${total.total.stars}</div><div class="sc-label">Stars</div></div>
          <div class="stat-card"><div class="sc-num">📚 ${snap.lessonsDone}</div><div class="sc-label">Lessons done</div></div>
          <div class="stat-card"><div class="sc-num">🎮 ${snap.activityCount.games}</div><div class="sc-label">Games played</div></div>
          <div class="stat-card"><div class="sc-num">⏱️ ${fmtTime(R.state.timeSec)}</div><div class="sc-label">Learning time</div></div>
          <div class="stat-card"><div class="sc-num">🏅 ${snap.badges.length}</div><div class="sc-label">Badges</div></div>
        </div>

        <div class="section-label">📖 Subjects</div>
        <div class="panel">
          ${D.SUBJECT_ORDER.map(s => {
            const subj = D.SUBJECTS[s];
            const stats = total.stats[s];
            const max = R.subjectMaxStars(s, child.className);
            const acc = R.accuracy(s);
            return `<div class="stat-row">
              <span>${subj.icon} ${subj.name}</span>
              <span>⭐ ${stats.stars}/${max} &nbsp; • &nbsp; ${stats.lessons} lessons</span>
              <span style="color:${acc === null ? '#b0b6d4' : acc >= 70 ? 'var(--green)' : acc >= 40 ? 'var(--maths)' : 'var(--red)'}">${acc === null ? '—' : acc + '%'}</span>
            </div>`;
          }).join('')}
        </div>

        <div class="section-label">💡 Needs a little more practice</div>
        <div class="panel">
          ${weak.length ? weak.map(w => `
            <div class="stat-row">
              <span>${D.SUBJECTS[w.subject].icon} ${D.SUBJECTS[w.subject].name}</span>
              <span>${w.acc === null ? 'Practice to begin!' : w.acc + '% accuracy'}</span>
            </div>`).join('')
            : `<div class="stat-row"><span>🎉 Great — no weak areas! Keep it up.</span></div>`}
          <div class="stat-row">
            <span>🚀 Least practiced</span>
            <span>${D.SUBJECTS[least.subject].icon} ${D.SUBJECTS[least.subject].name} (${least.lessons} lessons)</span>
          </div>
        </div>

        <div class="section-label">🕘 Recent activity</div>
        <div class="panel">
          ${R.state.log.length ? R.state.log.slice(0, 10).map(l => `
            <div class="log-line"><span class="ll-time">${new Date(l.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> &nbsp; ${logLabel(l)}</div>`).join('')
            : '<div class="stat-row"><span>No activity yet — let\'s start learning!</span></div>'}
        </div>

        <div class="section-label">🎬 Media Library (administrators only)</div>
        <div class="panel">
          <div class="stat-row">
            <span>🎵 Upload & manage songs, videos and audio</span>
            <button class="btn small sst" id="btn-media-admin" type="button">Manage media</button>
          </div>
        </div>

        <div class="section-label">⚙️ Settings</div>
        <div class="panel">
          <div class="stat-row">
            <span>🔊 Learning sounds</span>
            <button class="btn small ${A.isMuted() ? 'gray' : 'green'}" id="btn-p-sound" type="button">${A.isMuted() ? 'Off' : 'On ✓'}</button>
          </div>
          <div class="stat-row">
            <span>🎵 Celebration music</span>
            <button class="btn small ${R.state.celebrationOn === false ? 'gray' : 'green'}" id="btn-p-celeb" type="button">${R.state.celebrationOn === false ? 'Off' : 'On ✓'}</button>
          </div>
          <div class="stat-row">
            <span>🎉 Dance & confetti</span>
            <button class="btn small ${R.state.animationsOn === false ? 'gray' : 'green'}" id="btn-p-anim" type="button">${R.state.animationsOn === false ? 'Off' : 'On ✓'}</button>
          </div>
          <div class="stat-row">
            <span>🎵 Soft background music <span style="font-size:0.8rem;color:#b0b6d4">(default off; stays quiet under the teacher's voice)</span></span>
            <button class="btn small ${R.state.bgmOn ? 'green' : 'gray'}" id="btn-p-bgm" type="button">${R.state.bgmOn ? 'On' : 'Off'}</button>
          </div>
          <div class="stat-row">
            <span>📲 Add to home screen <span style="font-size:0.8rem;color:#b0b6d4">(install as an app — works offline)</span></span>
            <button class="btn small green" id="btn-p-install" type="button">${window.LLPWA ? window.LLPWA.statusLabel() : 'Install'}</button>
          </div>
          <div class="stat-row">
            <span>🗑️ Reset progress (keeps profile)</span>
            <button class="btn small gray" id="btn-reset" type="button">Reset</button>
          </div>
          <div class="stat-row">
            <span>🔄 Start fresh (delete everything)</span>
            <button class="btn small gray" id="btn-clear" type="button">Clear all</button>
          </div>
        </div>
        <div class="row center-x mt">
          <button class="btn small ghost" id="btn-child-home" type="button">← Back to ${escapeHtml(child.name)}'s home</button>
        </div>
      </div>`;

    document.getElementById('btn-media-admin').addEventListener('click', () => { A.sfx.click(); location.hash = '#/admin-media'; });
    document.getElementById('btn-edit-child').addEventListener('click', () => { A.sfx.click(); location.hash = '#/class'; });
    document.getElementById('btn-p-sound').addEventListener('click', () => {
      A.sfx.click();
      A.setMuted(!A.isMuted());
      R.state.soundOn = !A.isMuted();
      R.save();
      screenParentDash();
    });
    document.getElementById('btn-p-celeb').addEventListener('click', () => {
      A.sfx.click();
      R.state.celebrationOn = R.state.celebrationOn === false;
      R.save();
      screenParentDash();
    });
    document.getElementById('btn-p-anim').addEventListener('click', () => {
      A.sfx.click();
      R.state.animationsOn = R.state.animationsOn === false;
      R.save();
      screenParentDash();
    });
    const bgmBtn = document.getElementById('btn-p-bgm');
    if (bgmBtn) bgmBtn.addEventListener('click', () => {
      A.sfx.click();
      R.state.bgmOn = !R.state.bgmOn;
      R.save();
      A.setBgm(R.state.bgmOn);
      screenParentDash();
    });
    document.getElementById('btn-reset').addEventListener('click', () => {
      if (confirm('Reset all progress? The profile will stay.')) {
        R.resetProgress();
        A.speak('Progress has been reset.');
        screenParentDash();
      }
    });
    document.getElementById('btn-clear').addEventListener('click', () => {
      if (confirm('Delete everything and start fresh?')) {
        R.clearAll();
        location.hash = '#/welcome';
      }
    });
    document.getElementById('btn-child-home').addEventListener('click', () => { A.sfx.click(); location.hash = '#/home'; });
  }

  function logLabel(l) {
    switch (l.type) {
      case 'lesson': {
        const lesson = R.findLesson(l.label);
        return lesson ? `📖 Completed: ${lesson.title} (+${l.stars}⭐)` : `📖 Lesson (${l.label})`;
      }
      case 'game': return `🎮 Played a game (+${l.stars}⭐)`;
      case 'coloring': return `🖍️ Colored: ${l.label}`;
      case 'tracing': return `✏️ Traced: ${l.label}`;
      case 'draw': return `🖼️ Drew a picture`;
      case 'matching': return `🧩 Played matching`;
      case 'shapeart': return `🔷 Made shape art`;
      case 'adventure': return `🌟 Adventure bonus (+${l.stars}⭐)`;
      default: return `⭐ ${l.label}`;
    }
  }

  /* ---------- media admin (parent area only, admin token required) ---------- */
  const ADMIN_TOKEN_KEY = 'll-admin-token';

  function getAdminToken() {
    try { return sessionStorage.getItem(ADMIN_TOKEN_KEY); } catch (e) { return null; }
  }
  function setAdminToken(t) {
    try { setAdminToken(t); } catch (e) { window.__llAdminToken = t; }
  }

  function screenMediaAdmin() {
    setEnv('focus');
    const token = getAdminToken() || window.__llAdminToken;
    if (!token) return screenAdminLogin();
    appEl.innerHTML = `
      <div class="screen-anim">
        <div class="screen-title">🎬 Media Manager</div>
        <p class="screen-sub">Upload, edit, publish and remove media. Children never see this screen.</p>
        <div class="panel mb">
          <div class="stat-row"><span>➕ Add new media</span>
            <button class="btn small green" id="btn-am-add" type="button">New media</button>
          </div>
          <div class="stat-row"><span>🔎 Refresh list</span>
            <button class="btn small ghost" id="btn-am-refresh" type="button">Refresh</button>
          </div>
        </div>
        <div id="am-list" class="panel"></div>
        <div class="row center-x mt">
          <button class="btn small ghost" id="btn-am-back" type="button">← Back to parent area</button>
        </div>
      </div>`;
    document.getElementById('btn-am-back').addEventListener('click', () => { A.sfx.click(); location.hash = '#/parent'; });
    document.getElementById('btn-am-add').addEventListener('click', () => { A.sfx.click(); amForm(null); });
    document.getElementById('btn-am-refresh').addEventListener('click', () => { A.sfx.click(); amList(); });
    amList();

    function amList() {
      const list = document.getElementById('am-list');
      list.innerHTML = '<p class="screen-sub">Loading…</p>';
      fetch('api/media?admin=1')
        .then(r => r.json())
        .then(media => {
          if (!media.length) { list.innerHTML = '<p class="screen-sub">No media yet.</p>'; return; }
          list.innerHTML = media.map(m => `
            <div class="admin-media-row">
              <img class="am-thumb" src="${m.thumbnailPath || ''}" alt="" onerror="this.style.display='none'"/>
              <span class="grow">
                <span class="am-title">${LLMedia_esc(m.title)}</span><br/>
                <span class="am-meta">${LLMedia_esc(m.mediaType)} • ${LLMedia_esc(m.subject || '—')} • ${LLMedia_esc(m.topic || '—')} • ${LLMedia_esc((m.classLevel || []).join(', '))}</span>
              </span>
              <span class="am-badge ${m.published ? 'on' : 'off'}">${m.published ? 'PUBLISHED' : 'HIDDEN'}</span>
              <button class="btn small ghost" data-am-edit="${m.id}" type="button">✏️ Edit</button>
              <button class="btn small ${m.published ? 'gray' : 'green'}" data-am-pub="${m.id}" type="button">${m.published ? 'Unpublish' : 'Publish'}</button>
              <button class="btn small gray" data-am-del="${m.id}" type="button">🗑️</button>
            </div>`).join('');
          list.querySelectorAll('[data-am-edit]').forEach(b => b.addEventListener('click', () => {
            A.sfx.click();
            const rec = media.find(x => x.id === b.getAttribute('data-am-edit'));
            amForm(rec);
          }));
          list.querySelectorAll('[data-am-pub]').forEach(b => b.addEventListener('click', () => {
            A.sfx.click();
            const rec = media.find(x => x.id === b.getAttribute('data-am-pub'));
            fetch('api/media/' + rec.id, {
              method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
              body: JSON.stringify({ published: !rec.published })
            }).then(() => amList());
          }));
          list.querySelectorAll('[data-am-del]').forEach(b => b.addEventListener('click', () => {
            A.sfx.click();
            const rec = media.find(x => x.id === b.getAttribute('data-am-del'));
            if (confirm('Delete "' + rec.title + '"' + (rec.filePath ? ' and its file?' : '?'))) {
              fetch('api/media/' + rec.id + '?deleteFile=1', {
                method: 'DELETE', headers: { 'x-admin-token': token }
              }).then(() => amList());
            }
          }));
        });
    }

    function amForm(rec) {
      const isEdit = !!rec;
      const panel = document.getElementById('am-list');
      panel.innerHTML = `
        <div class="am-form">
          <h3 style="text-align:center">${isEdit ? '✏️ Edit media' : '➕ New media'}</h3>
          <label>Title *<input id="amf-title" value="${rec ? LLMedia_esc(rec.title) : ''}"/></label>
          <label>Description<textarea id="amf-desc" rows="2">${rec ? LLMedia_esc(rec.description || '') : ''}</textarea></label>
          <label>Type *
            <select id="amf-type">${['song', 'video', 'audio', 'image'].map(t =>
              `<option value="${t}" ${rec && rec.mediaType === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
          </label>
          <label>Subject
            <select id="amf-subject">${['english', 'maths', 'science', 'sst', 'creative', ''].map(s =>
              `<option value="${s}" ${rec && rec.subject === s ? 'selected' : ''}>${s ? s : '— none —'}</option>`).join('')}</select>
          </label>
          <div class="row wrap">
            <label style="flex:1">Topic<input id="amf-topic" value="${rec ? LLMedia_esc(rec.topic || '') : ''}"/></label>
            <label style="flex:1">Skill<input id="amf-skill" value="${rec ? LLMedia_esc(rec.skill || '') : ''}"/></label>
          </div>
          <div class="row wrap">
            <label style="flex:1">Category<input id="amf-category" value="${rec ? LLMedia_esc(rec.category || '') : ''}" placeholder="e.g. Alphabet Songs"/></label>
            <label style="flex:1">Lesson id (optional)<input id="amf-lesson" value="${rec ? LLMedia_esc(rec.lesson || '') : ''}"/></label>
          </div>
          <label>Classes
            <select id="amf-classes" multiple size="3">${['baby', 'middle', 'top', 'p1', 'p2', 'p3', 'all'].map(c =>
              `<option value="${c}" ${rec && rec.classLevel && rec.classLevel.indexOf(c) !== -1 ? 'selected' : c === 'all' && !rec ? 'selected' : ''}>${c}</option>`).join('')}</select>
          </label>
          <label>Media file (mp4 / mp3 / png)${isEdit ? ` — current: ${LLMedia_esc(rec.filePath || 'none')}` : ''}
            <input type="file" id="amf-file" accept=".mp4,.webm,.mp3,.wav,.ogg,.png,.jpg,.jpeg,.svg"/>
          </label>
          <div class="row wrap">
            <label style="flex:1">License<input id="amf-license" value="${rec ? LLMedia_esc(rec.license || '') : 'CC0 1.0'}"/></label>
            <label style="flex:1">License URL<input id="amf-licenseUrl" value="${rec ? LLMedia_esc(rec.licenseUrl || '') : 'https://creativecommons.org/publicdomain/zero/1.0/'}"/></label>
          </div>
          <label>Attribution / credit<input id="amf-attribution" value="${rec ? LLMedia_esc(rec.attribution || '') : "© Let's Learn — original production"}"/></label>
          <label>Duration (seconds)<input id="amf-duration" type="number" min="0" value="${rec ? rec.duration || 0 : 0}"/></label>
          <div class="row center-x">
            <button class="btn small ghost" id="amf-cancel" type="button">Cancel</button>
            <button class="btn small green" id="amf-save" type="button">${isEdit ? 'Save changes' : 'Create media'}</button>
          </div>
        </div>`;

      document.getElementById('amf-cancel').addEventListener('click', () => amList());
      document.getElementById('amf-save').addEventListener('click', async () => {
        A.sfx.click();
        const saveBtn = document.getElementById('amf-save');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving…';
        try {
          const title = document.getElementById('amf-title').value.trim();
          if (!title) throw new Error('Title is required');
          const fileInput = document.getElementById('amf-file');
          let filePath = rec ? rec.filePath : null;
          if (fileInput.files && fileInput.files[0]) {
            const f = fileInput.files[0];
            const type = document.getElementById('amf-type').value;
            const folder = type === 'video' ? 'videos' : type === 'image' ? 'images' : 'audio';
            const up = await fetch('api/admin/upload?name=' + encodeURIComponent(f.name) + '&folder=' + folder + '/admin', {
              method: 'POST',
              headers: { 'x-admin-token': token, 'Content-Type': 'application/octet-stream' },
              body: f
            });
            const upJson = await up.json();
            if (!up.ok) throw new Error(upJson.error || 'upload failed');
            filePath = upJson.path;
          }
          if (!filePath) throw new Error('Please choose a file (or keep the existing one)');
          const body = {
            title,
            description: document.getElementById('amf-desc').value,
            mediaType: document.getElementById('amf-type').value,
            subject: document.getElementById('amf-subject').value || null,
            topic: document.getElementById('amf-topic').value,
            skill: document.getElementById('amf-skill').value,
            category: document.getElementById('amf-category').value,
            lesson: document.getElementById('amf-lesson').value || null,
            classLevel: [...document.getElementById('amf-classes').selectedOptions].map(o => o.value),
            filePath,
            thumbnailPath: rec ? rec.thumbnailPath : (document.getElementById('amf-type').value === 'image' ? filePath : null),
            license: document.getElementById('amf-license').value,
            licenseUrl: document.getElementById('amf-licenseUrl').value,
            attribution: document.getElementById('amf-attribution').value,
            duration: parseInt(document.getElementById('amf-duration').value, 10) || 0
          };
          const res = await fetch(isEdit ? 'api/media/' + rec.id : 'api/media', {
            method: isEdit ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
            body: JSON.stringify(body)
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || 'save failed');
          window.LLMedia.loadCatalog(true).then(() => amList());
        } catch (e) {
          alert('Error: ' + e.message);
          saveBtn.disabled = false;
          saveBtn.textContent = isEdit ? 'Save changes' : 'Create media';
        }
      });
    }
  }

  function screenAdminLogin() {
    setEnv('focus');
    appEl.innerHTML = `
      <div class="screen-anim">
        <div class="screen-title">🔐 Media Manager</div>
        <div class="panel center" style="max-width:400px;margin:0 auto">
          <p class="lesson-hint">This area is for administrators only.<br/>Enter the admin token to continue.</p>
          <div class="token-form">
            <input class="field" id="admin-token" type="password" placeholder="Admin token" autocomplete="off"/>
            <button class="btn green" id="btn-admin-go" type="button">Unlock 🔓</button>
            <button class="btn small ghost" id="btn-admin-back" type="button">← Back</button>
          </div>
        </div>
      </div>`;
    document.getElementById('btn-admin-back').addEventListener('click', () => { A.sfx.click(); location.hash = '#/parent'; });
    document.getElementById('btn-admin-go').addEventListener('click', async () => {
      A.sfx.click();
      const t = document.getElementById('admin-token').value.trim();
      try {
        const res = await fetch('api/admin/login', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: t })
        });
        const json = await res.json();
        if (json.ok) {
          setAdminToken(t);
          screenMediaAdmin();
        } else {
          A.sfx.wrong();
          document.getElementById('admin-token').classList.add('shake');
          setTimeout(() => document.getElementById('admin-token').classList.remove('shake'), 500);
        }
      } catch (e) { /* offline */ }
    });
  }

  function LLMedia_esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ---------- helpers ---------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* navigate after a delay, but ONLY if the child hasn't moved on */
  function goLater(targetHash, delay) {
    const from = location.hash;
    setTimeout(() => {
      if (location.hash === from) location.hash = targetHash;
    }, delay);
  }

  /* ---------- router ---------- */
  const NO_NAV = ['welcome', 'class', 'profile', 'parent', 'lesson', 'game', 'coloring', 'tracing', 'draw', 'shapeart', 'matching', 'media', 'admin-media'];

  function route() {
    const hash = location.hash || '#/welcome';
    const parts = hash.replace(/^#\//, '').split('/');
    const screen = parts[0] || 'welcome';

    // guard: setup screens require no child; main screens require child
    if (['welcome', 'class', 'profile'].indexOf(screen) !== -1) {
      // if child exists and they go to welcome/class/profile manually, allow (used for edit)
    } else if (!R.state.child) {
      location.hash = '#/welcome';
      return;
    }

    const appRoot = document.getElementById('app');
    appRoot.classList.toggle('has-nav', NO_NAV.indexOf(screen) === -1);

    // topbar + nav (welcome/class/profile are full-screen standalone)
    const standalone = ['welcome', 'class', 'profile'].indexOf(screen) !== -1;
    const navHTML = NO_NAV.indexOf(screen) === -1 ? bottomNav(hash) : '';
    appRoot.innerHTML = (standalone ? '' : topbar()) + '<main id="screen"></main>' + navHTML;
    bindTopbar();
    bindNav();

    appEl = document.getElementById('screen');
    const main = appEl;
    window.scrollTo(0, 0);
    A.stop();
    if (window.LLNarration) window.LLNarration.stop(); // teacher voice stops cleanly
    // close any open celebration overlay (the child moved on)
    const openCel = document.getElementById('celebration');
    if (openCel) openCel.remove();
    A.stopCelebration();

    switch (screen) {
      case 'welcome': screenWelcome(); break;
      case 'class': screenClass(); break;
      case 'profile': screenProfile(); break;
      case 'home': screenHome(); break;
      case 'learn': screenLearn(); break;
      case 'area': screenArea(parts[1]); break;
      case 'songs': screenSongs(); break;
      case 'videos': screenVideos(); break;
      case 'media': screenMedia(parts[1]); break;
      case 'admin-media': screenMediaAdmin(); break;
      case 'subject': screenSubject(parts[1]); break;
      case 'lesson': screenLesson(parts[1]); break;
      case 'play': screenPlay(); break;
      case 'game': screenGame(parts[1]); break;
      case 'creative': screenCreative(); break;
      case 'coloring': screenColoring(parts[1]); break;
      case 'tracing': screenTracing(parts[1], parts[2]); break;
      case 'draw': screenDraw(); break;
      case 'shapeart': screenShapeArt(); break;
      case 'matching': screenMatching(); break;
      case 'rewards': screenRewards(); break;
      case 'journey': screenJourney(parts[1]); break;
      case 'adventure': screenAdventure(); break;
      case 'progress': screenProgress(); break;
      case 'parent': screenParent(); break;
      default: screenWelcome();
    }
  }

  function init() {
    window.addEventListener('hashchange', route);
    route();
  }

  return { init, setEnv, route };
})();
