/* ==========================================================================
   🌈 LET'S LEARN — media.js
   Self-hosted educational media system:
   - loads the media catalog (media/db/media.json via the API)
   - child-friendly Songs & Videos libraries (no feeds, no autoplay chains)
   - a simple big-button player for video/audio that plays ONLY local files
   - helper for embedding a media step inside lessons
   ========================================================================== */

window.LLMedia = (function () {
  const A = window.LLAudio;
  let catalog = null;
  let loadPromise = null;

  /* ---------- catalog ---------- */
  function loadCatalog(force) {
    if (catalog && !force) return Promise.resolve(catalog);
    if (loadPromise && !force) return loadPromise;
    // standalone build: the catalog (with data-URI files) is embedded in the page
    if (window.__LL_STANDALONE_CATALOG__) {
      catalog = window.__LL_STANDALONE_CATALOG__;
      return Promise.resolve(catalog);
    }
    loadPromise = Promise.resolve().then(() => {
      if (typeof fetch !== 'function') throw new Error('no fetch');
      return fetch('api/media');
    })
      .then(r => r.json())
      .then(list => { catalog = list; return catalog; })
      .catch(() => { catalog = catalog || []; return catalog; });
    return loadPromise;
  }
  function byId(id) { return catalog ? catalog.find(m => m.id === id) : null; }
  function byLesson(lessonId) { return (catalog || []).filter(m => m.lesson === lessonId && m.mediaType !== 'image'); }
  function categories(type) {
    const set = [];
    (catalog || []).forEach(m => {
      if (m.mediaType === type && m.category && set.indexOf(m.category) === -1) set.push(m.category);
    });
    return set;
  }
  function items(type, klass) {
    return (catalog || []).filter(m => {
      if (m.mediaType !== type) return false;
      if (m.published === false) return false;
      if (klass && m.classLevel && m.classLevel.indexOf('all') === -1 && m.classLevel.indexOf(klass) === -1) return false;
      return true;
    });
  }
  function fmtDuration(sec) {
    if (!sec) return '';
    const m = Math.floor(sec / 60), s = sec % 60;
    return m ? m + ':' + String(s).padStart(2, '0') : s + 's';
  }
  function typeIcon(t) {
    return { song: '🎵', video: '🎬', audio: '🔊', image: '🖼️' }[t] || '📁';
  }
  function escapeHTML(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ---------- media card ---------- */
  function cardHTML(m) {
    return `
      <button class="media-card" data-id="${m.id}" type="button">
        <span class="mc-thumb">
          <img src="${m.thumbnailPath || ''}" alt="" loading="lazy" onerror="this.style.display='none'"/>
          <span class="mc-type">${typeIcon(m.mediaType)}</span>
          ${m.duration ? `<span class="mc-dur">${fmtDuration(m.duration)}</span>` : ''}
        </span>
        <span class="mc-title">${escapeHTML(m.title)}</span>
        <span class="mc-sub">${m.topic ? escapeHTML(m.topic) : ''}${m.skill ? ' • ' + escapeHTML(m.skill) : ''}</span>
      </button>`;
  }

  /* ---------- library screen ---------- */
  function libraryHTML(container, type, className) {
    const media = items(type, className);
    const cats = categories(type);
    const label = type === 'song' ? 'Songs' : type === 'video' ? 'Videos' : 'Audio';
    const emoji = type === 'song' ? '🎵' : type === 'video' ? '🎬' : '🔊';
    if (!media.length) {
      container.innerHTML = `<div class="screen-anim"><div class="screen-title">${emoji} ${label}</div><p class="screen-sub">No ${label.toLowerCase()} yet — check back soon!</p></div>`;
      return;
    }
    let html = `<div class="screen-anim">
      <div class="screen-title">${emoji} ${label} Library</div>
      <p class="screen-sub">Everything plays right here inside Let's Learn! 🌈</p>`;
    cats.forEach(cat => {
      const items = media.filter(m => m.category === cat);
      if (!items.length) return;
      html += `<div class="section-label">${cat}</div><div class="media-grid">${items.map(cardHTML).join('')}</div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
    container.querySelectorAll('.media-card').forEach(c => {
      c.addEventListener('click', () => { A.sfx.click(); location.hash = '#/media/' + c.getAttribute('data-id'); });
    });
  }

  /* ---------- child-friendly player ---------- */
  /* opts: { id, autoplay: bool, onEnded: fn } */
  function playerHTML(container, opts) {
    const m = byId(opts.id);
    if (!m) { container.innerHTML = '<p class="screen-sub">Media not found</p>'; return null; }
    const isVideo = m.mediaType === 'video';

    container.innerHTML = `
      <div class="media-player screen-anim">
        <div class="mp-head">
          <div class="mp-title">${typeIcon(m.mediaType)} ${escapeHTML(m.title)}</div>
          <div class="mp-meta">
            <span class="mp-chip">${escapeHTML(m.topic || '')}</span>
            <span class="mp-chip">${escapeHTML(m.skill || '')}</span>
            ${m.duration ? `<span class="mp-chip">⏱ ${fmtDuration(m.duration)}</span>` : ''}
            <span class="mp-chip license">${escapeHTML(m.license || '')}</span>
          </div>
        </div>
        <div class="mp-stage">
          ${isVideo ? `
            <video class="mp-video" controls playsinline preload="metadata" poster="${m.thumbnailPath || ''}" aria-label="${escapeHTML(m.title)}">
              <source src="${m.filePath}" type="video/mp4"/>
              Your browser cannot play this video.
            </video>` : `
            <div class="mp-art">
              ${m.thumbnailPath && m.thumbnailPath.indexOf('audio-note') === -1
                ? `<img src="${m.thumbnailPath}" alt="" />`
                : `<div class="mp-note">🎵</div>`}
              <div class="mp-pulse" aria-hidden="true"></div>
            </div>
            <audio class="mp-audio" controls preload="none" aria-label="${escapeHTML(m.title)}">
              <source src="${m.filePath}" type="audio/mpeg"/>
            </audio>`}
          <button class="mp-bigplay" type="button" aria-label="Play">▶</button>
        </div>
        <div class="row center-x">
          <button class="btn small gold mp-replay" type="button">🔁 Replay</button>
        </div>
        <p class="mp-desc">${escapeHTML(m.description || '')}</p>
        <p class="mp-credit">${escapeHTML(m.attribution || '')}</p>
      </div>`;

    const video = container.querySelector('.mp-video');
    const audio = container.querySelector('.mp-audio');
    const bigPlay = container.querySelector('.mp-bigplay');
    const media = video || audio;

    function showBigPlay() { if (bigPlay) bigPlay.style.display = 'flex'; }
    function hideBigPlay() { if (bigPlay) bigPlay.style.display = 'none'; }

    if (media) {
      media.addEventListener('play', () => {
        hideBigPlay();
        const art = container.querySelector('.mp-art');
        if (art) art.classList.add('playing');
      });
      media.addEventListener('pause', () => { if (media.paused && media.currentTime > 0) showBigPlay(); });
      media.addEventListener('ended', () => { showBigPlay(); if (opts.onEnded) opts.onEnded(); });
    }
    if (bigPlay) {
      bigPlay.addEventListener('click', () => {
        A.sfx.click();
        const p = media.play();
        if (p && p.catch) p.catch(() => showBigPlay());
      });
    }
    const replay = container.querySelector('.mp-replay');
    if (replay) replay.addEventListener('click', () => {
      A.sfx.click();
      if (media) { media.currentTime = 0; const p = media.play(); if (p && p.catch) p.catch(() => {}); }
    });
    if (opts.autoplay && media) {
      setTimeout(() => { const p = media.play(); if (p && p.catch) p.catch(() => showBigPlay()); }, 350);
    }
    return { media, id: m.id };
  }

  /* ---------- related media (same topic/category only, no random feed) ---------- */
  function relatedHTML(container, id, limit) {
    const m = byId(id);
    if (!m) return;
    const sameCat = (catalog || []).filter(x => x.id !== id && x.mediaType === m.mediaType && x.category === m.category && x.published !== false);
    const sameTopic = (catalog || []).filter(x => x.id !== id && x.mediaType === m.mediaType && x.topic === m.topic && x.category !== m.category && x.published !== false);
    const rel = sameCat.concat(sameTopic).slice(0, limit || 4);
    if (!rel.length) return;
    container.innerHTML = `<div class="section-label">🧩 More about this topic</div>
      <div class="media-grid">${rel.map(cardHTML).join('')}</div>`;
    container.querySelectorAll('.media-card').forEach(c => {
      c.addEventListener('click', () => { A.sfx.click(); location.hash = '#/media/' + c.getAttribute('data-id'); });
    });
  }

  return { loadCatalog, byId, byLesson, items, categories, cardHTML, libraryHTML, playerHTML, relatedHTML, fmtDuration, typeIcon };
})();
