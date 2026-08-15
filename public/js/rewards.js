/* ==========================================================================
   🌈 LET'S LEARN — rewards.js
   Stars, badges, lesson records, Today's Adventure, progress & persistence.
   ========================================================================== */

window.LLRewards = (function () {
  const D = window.LLData;
  const LS_KEY = 'lets-learn-state-v1';

  const DEFAULT_STATE = {
    version: 2,
    child: null, // { name, avatar, className }
    soundOn: true,
    celebrationOn: true, // 🎵 celebration music (parent setting)
    animationsOn: true,  // 🎉 dance & confetti (parent setting)
    speechSpeed: 'slow', // 🐢 teacher voice: 'slow' | 'normal' | 'fast' (slow default for young learners)
    speechVolume: 1,     // 🔊 teacher voice volume 0..1
    bgmOn: false,        // 🎵 soft background music (default OFF during explanations)
    lessonRecords: {},   // lessonId -> { stars, wrong }
    gameRecords: {},     // gameId -> { best, plays }
    badges: [],
    adventure: null,     // { date, tasks:[ids], done:[ids], claimed }
    timeSec: 0,
    lastActiveAt: null,
    log: [],
    created: null
  };

  let state = null;
  let saveTimer = null;

  /* ---------- load / save ---------- */
  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) state = Object.assign({}, DEFAULT_STATE, JSON.parse(raw));
    } catch (e) { /* ignore */ }
    if (!state) state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    if (!state.bySubject) state.bySubject = buildSubjectStats(); // legacy guard
    return state;
  }

  function buildSubjectStats() {
    const stats = {};
    D.SUBJECT_ORDER.forEach(s => { stats[s] = { lessons: 0, stars: 0, correct: 0, wrong: 0 }; });
    Object.keys(state.lessonRecords || {}).forEach(id => {
      const rec = state.lessonRecords[id];
      const lesson = findLesson(id);
      if (!lesson || !stats[lesson.subject]) return;
      stats[lesson.subject].lessons += 1;
      stats[lesson.subject].stars += rec.stars;
      stats[lesson.subject].correct += rec.correct || 0;
      stats[lesson.subject].wrong += rec.wrong || 0;
    });
    return stats;
  }

  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
    // debounce server sync
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(syncToServer, 800);
  }

  async function syncToServer() {
    try {
      const res = await fetch('api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ savedAt: Date.now(), state: state })
      });
      if (!res.ok) throw new Error('save failed');
    } catch (e) { /* offline — localStorage is the fallback */ }
  }

  async function tryLoadFromServer() {
    try {
      const res = await fetch('api/state');
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.state && data.state.child) {
        const serverState = Object.assign({}, DEFAULT_STATE, data.state);
        const localHasChild = !!(state && state.child);
        const serverNewer = (data.savedAt || 0) > (state.lastSavedAt || 0);
        if (!localHasChild || serverNewer) {
          state = serverState;
          save();
        }
      }
    } catch (e) { /* offline mode */ }
  }

  /* ---------- derived stats ---------- */
  function totalStars() {
    return Object.keys(state.lessonRecords).reduce((sum, id) => sum + (state.lessonRecords[id].stars || 0), 0);
  }
  function lessonsDone() {
    return Object.keys(state.lessonRecords).length;
  }
  function bySubject() {
    const stats = buildSubjectStats();
    const total = { lessons: 0, stars: 0 };
    D.SUBJECT_ORDER.forEach(s => {
      total.lessons += stats[s].lessons;
      total.stars += stats[s].stars;
    });
    return { stats, total };
  }
  function subjectMaxStars(subject, className) {
    const lessons = (D.CURRICULUM[className] || {})[subject] || [];
    return lessons.length * 3;
  }
  function accuracy(subject) {
    const s = buildSubjectStats()[subject];
    const total = s.correct + s.wrong;
    return total ? Math.round((s.correct / total) * 100) : null;
  }
  function weakAreas() {
    const stats = buildSubjectStats();
    const withData = D.SUBJECT_ORDER
      .filter(s => stats[s].lessons > 0)
      .map(s => ({ subject: s, acc: accuracy(s), lessons: stats[s].lessons }));
    if (!withData.length) return [];
    withData.sort((a, b) => (a.acc === null ? -1 : a.acc) - (b.acc === null ? -1 : b.acc));
    return withData.slice(0, 2);
  }
  function leastPracticed() {
    const stats = buildSubjectStats();
    const arr = D.SUBJECT_ORDER.map(s => ({ subject: s, lessons: stats[s].lessons })).sort((a, b) => a.lessons - b.lessons);
    return arr[0];
  }

  /* ---------- lesson lookup ---------- */
  function findLesson(id) {
    for (const cls of D.CLASS_ORDER) {
      for (const subj of D.SUBJECT_ORDER) {
        const found = (D.CURRICULUM[cls][subj] || []).find(l => l.id === id);
        if (found) return found;
      }
    }
    return null;
  }

  function lessonsFor(subject, className) {
    return (D.CURRICULUM[className] || {})[subject] || [];
  }

  /* ---------- recording ---------- */
  function recordLesson(lessonId, stars, wrongCount, correctCount) {
    state.lessonRecords[lessonId] = {
      stars: stars,
      wrong: wrongCount,
      correct: correctCount,
      doneAt: Date.now()
    };
    state.bySubject = buildSubjectStats();
    logActivity('lesson', lessonId, stars);
    checkBadges();
    touchAdventure('subject', findLesson(lessonId) ? findLesson(lessonId).subject : null);
    save();
  }

  function recordGame(gameId, stars) {
    const prev = state.gameRecords[gameId] || { best: 0, plays: 0 };
    state.gameRecords[gameId] = { best: Math.max(prev.best, stars), plays: prev.plays + 1 };
    logActivity('game', gameId, stars);
    touchAdventure('game', null);
    checkBadges();
    save();
  }

  function recordActivity(kind, label, stars) {
    logActivity(kind, label, stars || 0);
    touchAdventure(kind, null);
    checkBadges();
    save();
  }

  function logActivity(type, label, stars) {
    state.log.unshift({ type: type, label: label, stars: stars || 0, ts: Date.now() });
    if (state.log.length > 60) state.log.length = 60;
    // rough time tracking
    const now = Date.now();
    if (state.lastActiveAt) {
      const delta = now - state.lastActiveAt;
      if (delta > 0 && delta < 2 * 60 * 60 * 1000) state.timeSec += Math.round(delta / 1000);
    }
    state.lastActiveAt = now;
  }

  /* ---------- badges ---------- */
  function checkBadges() {
    const s = snapshot();
    let changed = false;
    D.BADGES.forEach(b => {
      if (state.badges.indexOf(b.id) === -1 && b.check(s)) {
        state.badges.push(b.id);
        changed = true;
      }
    });
    return changed;
  }

  function snapshot() {
    const total = bySubject();
    const activityCount = {
      tracing: state.log.filter(l => l.type === 'tracing').length,
      coloring: state.log.filter(l => l.type === 'coloring').length,
      games: state.log.filter(l => l.type === 'game').length
    };
    return {
      totalStars: totalStars(),
      lessonsDone: lessonsDone(),
      bySubject: total.stats,
      activityCount: activityCount,
      badges: state.badges
    };
  }

  /* ---------- today's adventure ---------- */
  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  function getAdventure(forceNew) {
    if (forceNew || !state.adventure || state.adventure.date !== todayKey()) {
      const pool = D.ADVENTURE_TASKS.slice();
      const tasks = [];
      while (tasks.length < 3 && pool.length) {
        const i = Math.floor(Math.random() * pool.length);
        tasks.push(pool.splice(i, 1)[0]);
      }
      state.adventure = { date: todayKey(), tasks: tasks.map(t => t.id), done: [], claimed: false };
      save();
    }
    return state.adventure;
  }

  function touchAdventure(kind, subject) {
    const adv = state.adventure;
    if (!adv || adv.date !== todayKey()) return;
    const taskDefs = D.ADVENTURE_TASKS.filter(t => adv.tasks.indexOf(t.id) !== -1);
    taskDefs.forEach(t => {
      if (adv.done.indexOf(t.id) !== -1) return;
      if (t.kind === 'subject' && kind === 'subject' && t.subject === subject) adv.done.push(t.id);
      else if (t.kind === 'game' && kind === 'game') adv.done.push(t.id);
      else if (t.kind === 'coloring' && kind === 'coloring') adv.done.push(t.id);
      else if (t.kind === 'tracing' && kind === 'tracing') adv.done.push(t.id);
      else if (t.kind === 'draw' && kind === 'draw') adv.done.push(t.id);
    });
  }

  function claimAdventure() {
    const adv = getAdventure();
    if (adv.claimed || adv.done.length < 3) return 0;
    adv.claimed = true;
    save();
    return 3; // bonus stars
  }

  /* ---------- child ---------- */
  function setChild(name, avatar, className) {
    state.child = { name: name || 'Little Learner', avatar: avatar || 'panda', className: className || 'top' };
    state.created = Date.now();
    getAdventure(true);
    save();
  }

  /* Change class only — keep name, avatar and progress. */
  function setClass(className) {
    if (!state.child) return;
    const next = className || state.child.className;
    if (state.child.className === next) return;
    state.child.className = next;
    save();
  }

  function resetProgress() {
    state.lessonRecords = {};
    state.gameRecords = {};
    state.badges = [];
    state.log = [];
    state.timeSec = 0;
    state.adventure = null;
    state.bySubject = buildSubjectStats();
    save();
  }

  function clearAll() {
    try { localStorage.removeItem(LS_KEY); } catch (e) {}
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  return {
    load, save, syncToServer, tryLoadFromServer,
    get state() { return state; },
    totalStars, lessonsDone, bySubject, subjectMaxStars, accuracy, weakAreas, leastPracticed,
    findLesson, lessonsFor,
    recordLesson, recordGame, recordActivity,
    checkBadges, snapshot,
    getAdventure, claimAdventure,
    setChild, setClass, resetProgress, clearAll,
    todayKey
  };
})();
