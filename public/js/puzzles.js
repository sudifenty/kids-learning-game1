/* ==========================================================================
   🌈 LET'S LEARN — puzzles.js
   🧩 MATCHING & PUZZLES — a real learning area with a large library of
   age-appropriate activities for kindergarten (Baby / Middle / Top Class).

   - Data-driven content database: activity records describe type, level,
     instruction, voice narration, choices and answer. Hundreds of activities
     can be added later without touching the UI.
   - 15 activity types across 4 difficulty levels (🟢→🔴).
   - Visual-first: short labels ("MATCH THE SAME"), the teacher voice teaches.
   - One task at a time → immediate feedback → short celebration → automatic
     progression to the next activity.
   ========================================================================== */

window.LLPuzzles = (function () {
  const D = window.LLData;
  const A = window.LLAudio;
  const R = window.LLRewards;
  const SH = D.shapeSVG;

  /* ================= CONTENT POOLS ================= */
  const POOLS = {
    animals: ['🐶', '🐱', '🐮', '🐔', '🐷', '🐑', '🐘', '🦁', '🐵', '🦒', '🐰', '🦆'],
    fruits: ['🍎', '🍌', '🍊', '🍇', '🍓', '🍉', '🥭', '🍐', '🍑', '🍍'],
    toys: ['🧸', '⚽', '🚂', '🪁', '🎈', '🧩', '🪀', '🎨'],
    objects: ['🥄', '🍽️', '🥛', '🪥', '👟', '📖', '🪑', '🎒', '☂️', '🪣'],
    clothes: ['👕', '👖', '🧢', '🧦', '🧥', '👗', '🧤', '🧣'],
    vehicles: ['🚗', '🚌', '✈️', '🚲', '🚜', '🚒', '⛵', '🚁'],
    shapes3: ['circle', 'square', 'triangle'],
    shapes4: ['circle', 'square', 'triangle', 'rectangle'],
    shapes7: ['circle', 'square', 'triangle', 'rectangle', 'oval', 'star', 'heart']
  };

  const COLOUR_OF = {
    '🍎': 'red', '🍓': 'red', '🚗': 'red', '❤️': 'red',
    '🍌': 'yellow', '☀️': 'yellow', '🐤': 'yellow', '⭐': 'yellow',
    '🫐': 'blue', '💧': 'blue', '🚌': 'blue', '🧢': 'blue',
    '🍀': 'green', '🐸': 'green', '🥦': 'green', '🌿': 'green',
    '🍊': 'orange', '🥕': 'orange', '🦊': 'orange',
    '🍇': 'purple', '🦄': 'purple',
    '🌸': 'pink', '🩷': 'pink', '🐷': 'pink',
    '🐻': 'brown', '🍫': 'brown',
    '🐧': 'black',
    '⚪': 'white', '🤍': 'white'
  };
  const COLOUR_KEYS = ['red', 'yellow', 'blue', 'green', 'orange', 'purple', 'pink', 'brown', 'black', 'white'];
  const COLOUR_EMOJI = { red: '🔴', yellow: '🟡', blue: '🔵', green: '🟢', orange: '🟠', purple: '🟣', pink: '🩷', brown: '🟤', black: '⚫', white: '⚪' };

  const FAMILY = [
    { e: '👩', name: 'mummy' }, { e: '👨', name: 'daddy' }, { e: '👶', name: 'baby' },
    { e: '👦', name: 'brother' }, { e: '👧', name: 'sister' }, { e: '👵', name: 'grandma' }
  ];

  const ANIMAL_SOUNDS = [
    { a: '🐮', sound: 'Moo! Moo!' }, { a: '🐶', sound: 'Woof! Woof!' }, { a: '🐱', sound: 'Meow! Meow!' },
    { a: '🦆', sound: 'Quack! Quack!' }, { a: '🐔', sound: 'Cluck! Cluck!' }, { a: '🦁', sound: 'Roar!' },
    { a: '🐑', sound: 'Baa! Baa!' }, { a: '🐷', sound: 'Oink! Oink!' }
  ];

  const HOME_ITEMS = [
    { obj: '🛏️', room: '🛏️', roomName: 'the bedroom' }, { obj: '🪥', room: '🛁', roomName: 'the bathroom' },
    { obj: '🛁', room: '🛁', roomName: 'the bathroom' }, { obj: '🍳', room: '🍳', roomName: 'the kitchen' },
    { obj: '🍽️', room: '🍳', roomName: 'the kitchen' }, { obj: '🛋️', room: '🛋️', roomName: 'the living room' },
    { obj: '📺', room: '🛋️', roomName: 'the living room' }
  ];
  const ROOM_EMOJIS = ['🛏️', '🍳', '🛁', '🛋️'];

  const CATEGORIES = [
    { icon: '🍎', name: 'fruits', members: ['🍎', '🍌', '🍊', '🍓', '🥭', '🍇', '🍐', '🍑'] },
    { icon: '🐶', name: 'animals', members: ['🐶', '🐱', '🐮', '🐔', '🐘', '🦁', '🐵', '🐰'] },
    { icon: '👕', name: 'clothes', members: ['👕', '👖', '🧢', '🧦', '👗', '🧥', '🧤', '🧣'] },
    { icon: '🧸', name: 'toys', members: ['🧸', '⚽', '🚂', '🪁', '🎈', '🧩', '🪀', '🎨'] }
  ];

  const SEQUENCES = [
    { seq: ['🌱', '🌿', '❓'], answer: '🌳', speak: 'A seed grows into a plant, and then into a big tree. What comes next?' },
    { seq: ['🥚', '🐣', '❓'], answer: '🐔', speak: 'An egg hatches into a chick. What does the chick grow into?' },
    { seq: ['🐛', '🫙', '❓'], answer: '🦋', speak: 'The caterpillar makes a chrysalis. What comes out?' },
    { seq: ['☀️', '🌙', '❓'], answer: '☀️', speak: 'Day, night, day... what comes next?' },
    { seq: ['👶', '🧒', '❓'], answer: '👨', speak: 'The baby grows into a child. What does the child grow into?' }
  ];

  const PATTERN_2 = [
    { seq: ['🔴', '🟡', '🔴', '🟡', '❓'], answer: '🔴', speak: 'Red, yellow, red, yellow. What comes next?' },
    { seq: ['🔵', '🟢', '🔵', '🟢', '❓'], answer: '🔵', speak: 'Blue, green, blue, green. What comes next?' },
    { seq: ['🔺', '🔵', '🔺', '🔵', '❓'], answer: '🔺', speak: 'Triangle, circle, triangle, circle. What comes next?' },
    { seq: ['⭐', '🌙', '⭐', '🌙', '❓'], answer: '⭐', speak: 'Star, moon, star, moon. What comes next?' }
  ];
  const PATTERN_3 = [
    { seq: ['🔴', '🟡', '🟢', '🔴', '🟡', '❓'], answer: '🟢', speak: 'Red, yellow, green. Red, yellow... what comes next?' },
    { seq: ['🍎', '🍌', '🍇', '🍎', '🍌', '❓'], answer: '🍇', speak: 'Apple, banana, grapes. Apple, banana... what comes next?' }
  ];

  const MISSING_SCENES = [
    {
      id: 'house', speak: 'The house is missing its roof! Which piece fits?', answer: 'triangle',
      scene: `<rect x="70" y="150" width="160" height="120" rx="6" fill="#fff3cd" stroke="#33385c" stroke-width="4"/>
              <rect x="95" y="190" width="44" height="80" rx="18" fill="#c98a4b" stroke="#33385c" stroke-width="4"/>
              <rect x="160" y="168" width="36" height="36" rx="6" fill="#a8d4ff" stroke="#33385c" stroke-width="4"/>
              <polygon points="150,70 62,150 238,150" fill="none" stroke="#ffb703" stroke-width="6" stroke-dasharray="10 8"/>`
    },
    {
      id: 'car', speak: 'The car is missing its wheel! Which piece fits?', answer: 'circle',
      scene: `<rect x="60" y="130" width="180" height="80" rx="20" fill="#ffb3c1" stroke="#33385c" stroke-width="4"/>
              <rect x="90" y="145" width="50" height="34" rx="8" fill="#a8d4ff" stroke="#33385c" stroke-width="4"/>
              <rect x="160" y="145" width="50" height="34" rx="8" fill="#a8d4ff" stroke="#33385c" stroke-width="4"/>
              <circle cx="105" cy="240" r="30" fill="none" stroke="#ffb703" stroke-width="6" stroke-dasharray="10 8"/>
              <circle cx="200" cy="240" r="30" fill="#33385c"/>`
    },
    {
      id: 'face', speak: 'The face is missing an eye! Which piece fits?', answer: 'circle',
      scene: `<circle cx="150" cy="150" r="100" fill="#ffd9a8" stroke="#33385c" stroke-width="4"/>
              <circle cx="115" cy="130" r="12" fill="#33385c"/>
              <circle cx="185" cy="130" r="12" fill="none" stroke="#ffb703" stroke-width="5" stroke-dasharray="6 6"/>
              <path d="M120 195 Q 150 220 180 195" stroke="#33385c" stroke-width="5" fill="none" stroke-linecap="round"/>`
    },
    {
      id: 'tree', speak: 'The tree is missing its top! Which piece fits?', answer: 'circle',
      scene: `<rect x="130" y="200" width="40" height="80" rx="10" fill="#a0683c" stroke="#33385c" stroke-width="4"/>
              <circle cx="150" cy="150" r="70" fill="none" stroke="#ffb703" stroke-width="6" stroke-dasharray="10 8"/>`
    },
    {
      id: 'flower', speak: 'The flower is missing a petal! Which piece fits?', answer: 'oval',
      scene: `<rect x="145" y="200" width="12" height="80" rx="6" fill="#2fa96b" stroke="#33385c" stroke-width="3"/>
              <ellipse cx="150" cy="130" rx="30" ry="26" fill="#f472b6" stroke="#33385c" stroke-width="4"/>
              <ellipse cx="150" cy="70" rx="30" ry="26" fill="none" stroke="#ffb703" stroke-width="5" stroke-dasharray="8 7"/>`
    }
  ];

  const JIGSAW_EMOJIS = ['🐶', '🍎', '🚗', '🏠', '🌸', '🐱', '⚽', '🦋', '🐘', '⭐'];

  /* ================= helpers ================= */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function pickN(pool, n, avoid) {
    const p = pool.filter(x => !avoid || x !== avoid);
    return shuffle(p).slice(0, n);
  }
  function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  const NUM_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  function word(n) { return NUM_WORDS[n] || String(n); }
  function countWords(n) { return Array.from({ length: n }, (_, i) => word(i + 1)).join('... '); }
  /* answer is ALWAYS included in the choices — never show an unsolvable task */
  function withAnswer(answer, distractorPool, n) {
    const distractors = shuffle(distractorPool.filter(x => x !== answer)).slice(0, n || 2);
    return shuffle([answer].concat(distractors));
  }
  function patternChoices(answer) {
    return withAnswer(answer, ['🔴', '🟡', '🟢', '🔵', '🔺', '⭐', '🌙', '🍎', '🍌', '🍇']);
  }

  /* ================= LIBRARY (generated once) ================= */
  let LIBRARY = null;
  function buildLibrary() {
    if (LIBRARY) return LIBRARY;
    const L = [];
    let n = 0;
    const add = (level, act) => { act.id = 'pz' + (++n); act.level = level; L.push(act); };

    /* ---- LEVEL 1 🟢 very easy: 2 pairs, 3 choices, identical, obvious ---- */
    ['animals', 'fruits', 'toys'].forEach(pool => {
      add(1, { type: 'picmatch', label: 'MATCH THE SAME', category: pool, pairs: 2, pools: [pool],
        speak: 'Find the same pictures! Tap two the same!' });
    });
    ['red', 'blue', 'yellow'].forEach(c => {
      const objs = Object.keys(COLOUR_OF).filter(o => COLOUR_OF[o] === c);
      const target = pickN(objs, 1)[0];
      const others = Object.keys(COLOUR_OF).filter(o => COLOUR_OF[o] !== c);
      add(1, { type: 'colormatch', label: 'FIND THE COLOUR', color: c,
        objects: shuffle([target].concat(pickN(others, 2))),
        speak: `Find the ${c} one!` });
    });
    ['circle', 'square', 'triangle'].forEach(sh => {
      add(1, { type: 'shapematch', label: 'FIND THE SHAPE', shape: sh, choices: shuffle(POOLS.shapes3),
        speak: `Find the same shape! Find the ${sh}!` });
    });
    ['animals', 'fruits', 'objects'].forEach(pool => {
      add(1, { type: 'picmatch', label: 'MATCH THE SAME', category: pool, pairs: 2, pools: [pool],
        speak: 'Find the same pictures! Tap two the same!' });
    });
    ['👩', '👨', '👶'].forEach(e => {
      const f = FAMILY.find(x => x.e === e);
      const distractors = shuffle(FAMILY.map(x => x.e).filter(x => x !== e)).slice(0, 2);
      add(1, { type: 'familymatch', label: 'FIND THE FAMILY', member: e,
        choices: shuffle([e].concat(distractors)),
        speak: `Find ${f.name}!` });
    });
    for (let i = 0; i < 3; i++) {
      const em = rnd(['🍎', '🐶', '⭐', '🚗', '🧸', '🌸']);
      const diff = rnd(['🍌', '🐱', '🌙', '🚲', '⚽', '🌼'].filter(x => x !== em));
      add(1, { type: 'oddoneout', label: 'FIND THE DIFFERENT ONE', items: shuffle([em, em, em, diff]),
        speak: 'Find the different one!' });
    }

    /* ---- LEVEL 2 🟡 easy: 3-4 choices, number→quantity, letters, animals ---- */
    ['animals', 'fruits', 'toys', 'vehicles'].forEach(pool => {
      add(2, { type: 'picmatch', label: 'MATCH THE SAME', category: pool, pairs: 3, pools: [pool],
        speak: 'Find the same pictures! Tap two the same!' });
    });
    ['green', 'orange', 'purple', 'pink'].forEach(c => {
      const objs = Object.keys(COLOUR_OF).filter(o => COLOUR_OF[o] === c);
      const target = pickN(objs, 1)[0];
      const others = Object.keys(COLOUR_OF).filter(o => COLOUR_OF[o] !== c);
      add(2, { type: 'colormatch', label: 'FIND THE COLOUR', color: c,
        objects: shuffle([target].concat(pickN(others, 2))),
        speak: `Find the ${c} one!` });
    });
    for (let i = 0; i < 3; i++) {
      const pic = rnd(['🍎', '⭐', '🎈', '🌸', '🐤']);
      const n = 2 + Math.floor(Math.random() * 4); // 2..5
      const groups = shuffle([n, n + 1, n - 1].filter(x => x >= 1 && x <= 6));
      add(2, { type: 'numqty', label: 'FIND THE NUMBER', n: n, pic: pic, groups: groups,
        speak: `Can you find ${word(n)} ${pic}s? Count with me! ${countWords(n)}` });
    }
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(ch => {
      const low = ch.toLowerCase();
      const distractors = shuffle(['a', 'b', 'c', 'd', 'e', 'f'].filter(x => x !== low)).slice(0, 2);
      add(2, { type: 'lettermatch', label: 'FIND THE LETTER', letter: ch,
        choices: shuffle([low].concat(distractors)),
        speak: `Big ${ch}, little ${low}. Find the little ${low}!` });
    });
    ['animals', 'fruits'].forEach(pool => {
      add(2, { type: 'picmatch', label: 'MATCH THE SAME', category: pool, pairs: 3, pools: [pool],
        speak: 'Find the same pictures! Tap two the same!' });
    });
    for (let i = 0; i < 3; i++) {
      const p = rnd(PATTERN_2);
      add(2, { type: 'pattern', label: "WHAT'S NEXT?", seq: p.seq, answer: p.answer,
        choices: patternChoices(p.answer), speak: p.speak });
    }

    /* ---- LEVEL 3 🟠 developing: sounds, odd one out, sequences, pieces ---- */
    for (let i = 0; i < 3; i++) {
      const pic = rnd(['🍎', '⭐', '🎈', '🌸', '🐤', '🍓']);
      const n = 6 + Math.floor(Math.random() * 5); // 6..10
      const groups = shuffle([n, Math.max(1, n - 2), n + 2]);
      add(3, { type: 'numqty', label: 'FIND THE NUMBER', n: n, pic: pic, groups: groups,
        speak: `Can you find ${word(n)} ${pic}s? Count with me! ${countWords(n)}` });
    }
    ANIMAL_SOUNDS.slice(0, 6).forEach(s => {
      const distractors = shuffle(ANIMAL_SOUNDS.map(x => x.a).filter(x => x !== s.a)).slice(0, 2);
      add(3, { type: 'animalsound', label: 'WHO SAYS THAT?', animal: s.a, sound: s.sound,
        choices: shuffle([s.a].concat(distractors)),
        speak: `${s.sound} Which animal says that?` });
    });
    for (let i = 0; i < 3; i++) {
      const cat = rnd(CATEGORIES);
      const em = rnd(cat.members);
      const diff = rnd(Object.keys(COLOUR_OF).concat(['🍌', '🌙', '🚲', '⚽']).filter(x => x !== em));
      add(3, { type: 'oddoneout', label: 'FIND THE DIFFERENT ONE', items: shuffle([em, em, em, diff]),
        speak: 'Find the different one!' });
    }
    SEQUENCES.forEach(s => {
      const dist = shuffle(['🐔', '🌳', '🦋', '🐸', '☀️', '👴', '🐤', '🌿']).filter(x => x !== s.answer).slice(0, 2);
      add(3, { type: 'whatsnext', label: 'WHAT COMES NEXT?', seq: s.seq, answer: s.answer,
        choices: shuffle([s.answer].concat(dist)), speak: s.speak });
    });
    CATEGORIES.slice(0, 4).forEach(cat => {
      const obj = rnd(cat.members);
      const others = CATEGORIES.filter(c => c.name !== cat.name).map(c => c.icon);
      add(3, { type: 'categorymatch', label: 'WHERE DOES IT GO?', object: obj, category: cat,
        choices: shuffle([cat.icon].concat(pickN(others, 2))),
        speak: `${obj === '🍎' ? 'An apple' : obj + ' is'} a ${cat.name} thing! Where does it go?` });
    });
    MISSING_SCENES.forEach(s => {
      const choices = shuffle(POOLS.shapes7).filter(sh => sh !== s.answer).slice(0, 2).concat(s.answer);
      add(3, { type: 'missingpiece', label: 'WHAT IS MISSING?', sceneId: s.id, answer: s.answer, scene: s.scene,
        choices: shuffle(choices), speak: s.speak });
    });
    HOME_ITEMS.slice(0, 4).forEach(h => {
      add(3, { type: 'homematch', label: 'WHERE DOES IT GO?', object: h.obj, answer: h.room,
        choices: shuffle(ROOM_EMOJIS),
        speak: `Where does the ${h.obj} belong? Find ${h.roomName}!` });
    });
    rnd(PATTERN_3) && PATTERN_3.forEach(p => {
      add(3, { type: 'pattern', label: "WHAT'S NEXT?", seq: p.seq, answer: p.answer,
        choices: patternChoices(p.answer), speak: p.speak });
    });

    /* ---- LEVEL 4 🔴 challenge: memory, jigsaw, longer matching ---- */
    [2, 3, 4].forEach(pairs => {
      const pool = rnd(['animals', 'fruits', 'toys']);
      add(4, { type: 'memory', label: 'MEMORY MATCH', pairs: pairs, pools: [pool],
        speak: 'Flip the cards and find the matching pairs!' });
    });
    [2, 3, 4, 6].forEach(pieces => {
      add(4, { type: 'jigsaw', label: 'PUT IT TOGETHER', pieces: pieces, emoji: rnd(JIGSAW_EMOJIS),
        speak: 'Put the picture together! Tap each piece to place it.' });
    });
    add(4, { type: 'picmatch', label: 'MATCH THE SAME', category: 'animals', pairs: 6, pools: ['animals'],
      speak: 'Find the same pictures! Tap two the same!' });

    LIBRARY = L;
    return L;
  }

  function librarySize() { return buildLibrary().length; }
  function allDoneCount() {
    const p = R.state.puzzle || { done: { 1: [], 2: [], 3: [], 4: [] } };
    return [1, 2, 3, 4].reduce((s, l) => s + (p.done[l] || []).length, 0);
  }

  /* ================= VALIDATION (safety net) =================
     Every activity must be solvable: the correct answer must exist among
     the visible choices. Broken activities are logged (dev) and NEVER
     shown to a child — they are skipped by nextActivity. */
  function activityIssues(act) {
    const errs = [];
    const has = (list) => Array.isArray(list) && list.length >= 2;
    const answerIn = (list, answer) => has(list) && list.indexOf(answer) !== -1;

    switch (act.type) {
      case 'familymatch':
        if (!answerIn(act.choices, act.member)) errs.push('familymatch: "' + act.member + '" not in choices ' + JSON.stringify(act.choices));
        break;
      case 'lettermatch':
        if (!answerIn(act.choices, act.letter.toLowerCase())) errs.push('lettermatch: "' + act.letter + '" not in choices');
        break;
      case 'animalsound':
        if (!answerIn(act.choices, act.animal)) errs.push('animalsound: "' + act.animal + '" not in choices');
        break;
      case 'shapematch':
        if (!answerIn(act.choices, act.shape)) errs.push('shapematch: "' + act.shape + '" not in choices');
        break;
      case 'categorymatch':
        if (!answerIn(act.choices, act.category.icon)) errs.push('categorymatch: icon not in choices');
        break;
      case 'homematch':
        if (!answerIn(act.choices, act.answer)) errs.push('homematch: "' + act.answer + '" not in choices');
        break;
      case 'missingpiece':
        if (!answerIn(act.choices, act.answer)) errs.push('missingpiece: "' + act.answer + '" not in choices');
        break;
      case 'pattern':
      case 'whatsnext':
        if (!answerIn(act.choices, act.answer)) errs.push(act.type + ': answer not in choices');
        break;
      case 'numqty':
        if (!has(act.groups) || act.groups.indexOf(act.n) === -1) errs.push('numqty: "' + act.n + '" not in groups');
        break;
      case 'colormatch':
        if (!Array.isArray(act.objects) || !act.objects.some(o => COLOUR_OF[o] === act.color)) errs.push('colormatch: no object of colour "' + act.color + '"');
        break;
      case 'oddoneout':
        if (!Array.isArray(act.items) || !act.items.some(x => {
          const counts = {};
          act.items.forEach(y => { counts[y] = (counts[y] || 0) + 1; });
          return counts[x] === 1;
        })) errs.push('oddoneout: no odd item');
        break;
      case 'picmatch':
      case 'memory':
        if (!act.pairs || act.pairs < 1) errs.push(act.type + ': bad pairs');
        break;
      case 'jigsaw':
        if (!act.pieces || act.pieces < 2) errs.push('jigsaw: bad pieces');
        break;
    }
    return errs;
  }

  function validateLibrary() {
    const lib = buildLibrary();
    let bad = 0;
    lib.forEach(a => {
      const issues = activityIssues(a);
      if (issues.length) {
        bad++;
        console.error('❌ Puzzle activity invalid:', a.id, a.type, issues.join('; '));
      }
    });
    if (bad) console.error('❌ ' + bad + ' broken puzzle activities — they will be skipped.');
    else console.log('✅ All ' + lib.length + ' puzzle activities are solvable (answer always among choices).');
    return bad;
  }

  /* ================= PROGRESSION ================= */
  function progress() {
    if (!R.state.puzzle) R.state.puzzle = { level: 1, done: { 1: [], 2: [], 3: [], 4: [] } };
    return R.state.puzzle;
  }
  function nextActivity() {
    const p = progress();
    // only activities that pass validation are ever offered to a child
    const pool = buildLibrary().filter(a => a.level === p.level && activityIssues(a).length === 0 && (p.done[p.level] || []).indexOf(a.id) === -1);
    if (pool.length) return { act: rnd(pool) };
    // all done at this level but level not yet advanced — fall through levels
    for (let lvl = p.level + 1; lvl <= 4; lvl++) {
      const nextPool = buildLibrary().filter(a => a.level === lvl && activityIssues(a).length === 0 && (p.done[lvl] || []).indexOf(a.id) === -1);
      if (nextPool.length) return { act: rnd(nextPool) };
    }
    return { done: true };
  }
  function complete(act) {
    const p = progress();
    const lvl = act.level;
    if (!p.done[lvl]) p.done[lvl] = [];
    if (p.done[lvl].indexOf(act.id) === -1) p.done[lvl].push(act.id);
    // level up when this level's pool is exhausted
    const remaining = buildLibrary().filter(a => a.level === lvl && p.done[lvl].indexOf(a.id) === -1);
    if (!remaining.length && lvl < 4) p.level = lvl + 1;
    R.save();
  }
  function resetAll() {
    R.state.puzzle = { level: 1, done: { 1: [], 2: [], 3: [], 4: [] } };
    R.save();
  }

  /* ================= FLOW ================= */
  function startFlow(container, opts) {
    opts = opts || {};
    let sessionStars = 0;
    let busy = false;

    function speak(text) {
      A.stop();
      A.speak(text);
      if (window.LLNarration) window.LLNarration.armGestureRetry();
    }

    function showActivity(act) {
      busy = false;
      container.innerHTML = '';
      const stage = document.createElement('div');
      stage.className = 'puzzle-stage screen-anim';
      stage.setAttribute('data-act-id', act.id);
      stage.innerHTML = `
        <div class="pz-top">
          <span class="pz-level lv${act.level}" aria-hidden="true">${['🟢', '🟡', '🟠', '🔴'][act.level - 1]}</span>
          <span class="pz-label">${act.label}</span>
          <span class="pz-stars">⭐ ${R.totalStars()}</span>
        </div>
        <div id="pz-body" class="pz-body"></div>`;
      container.appendChild(stage);
      const body = stage.querySelector('#pz-body');

      const onCorrect = () => {
        if (busy) return;
        busy = true;
        const prevLevel = progress().level;
        R.recordActivity('puzzle', act.label, 1);
        complete(act);
        sessionStars++;
        A.playCelebration('success');
        const bubble = document.createElement('div');
        bubble.className = 'pz-great';
        bubble.textContent = '🎉 GREAT!';
        stage.appendChild(bubble);
        setTimeout(() => {
          const leveledUp = progress().level > prevLevel;
          const n = nextActivity();
          if (n.done) return showAllDone();
          if (leveledUp) {
            window.LLApp.celebrate('LEVEL UP! 🎉', null, 3, {
              kind: 'big',
              badge: 'Level ' + progress().level,
              onClose: () => showActivity(n.act)
            });
          } else {
            showActivity(n.act);
          }
        }, 2000);
      };
      const onWrong = (el) => {
        if (busy) return;
        if (el) { el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 500); }
        A.sfx.wrong();
        A.speak('Almost! Let us try again.');
      };

      render(act, body, onCorrect, onWrong);
      setTimeout(() => speak(act.speak), 350);
    }

    function showNext() {
      const n = nextActivity();
      if (n.done) return showAllDone();
      showActivity(n.act);
    }

    function showAllDone() {
      container.innerHTML = `
        <div class="puzzle-stage screen-anim">
          <div class="lesson-emoji">🏆</div>
          <div class="ge-title">ALL DONE!</div>
          <div class="ge-sub">You finished every puzzle — what a superstar!</div>
          <div class="ge-stars">⭐ +${allDoneCount()} puzzle stars</div>
          <div class="row center-x">
            <button class="btn small ghost" id="pz-back" type="button">🧸 Back</button>
            <button class="btn small play" id="pz-again" type="button">🔁 Play again</button>
          </div>
        </div>`;
      container.querySelector('#pz-back').addEventListener('click', () => { A.sfx.click(); location.hash = '#/area/puzzles'; });
      container.querySelector('#pz-again').addEventListener('click', () => { A.sfx.click(); resetAll(); showNext(); });
      A.playCelebration('big');
    }

    showNext();
  }

  /* ================= RENDERERS ================= */
  function render(act, body, onCorrect, onWrong) {
    switch (act.type) {
      case 'picmatch': return picmatch(act, body, onCorrect, onWrong);
      case 'colormatch': return colormatch(act, body, onCorrect, onWrong);
      case 'shapematch': return shapematch(act, body, onCorrect, onWrong);
      case 'numqty': return numqty(act, body, onCorrect, onWrong);
      case 'lettermatch': return lettermatch(act, body, onCorrect, onWrong);
      case 'familymatch': return familymatch(act, body, onCorrect, onWrong);
      case 'oddoneout': return oddoneout(act, body, onCorrect, onWrong);
      case 'pattern': return pattern(act, body, onCorrect, onWrong);
      case 'whatsnext': return whatsnext(act, body, onCorrect, onWrong);
      case 'animalsound': return animalsound(act, body, onCorrect, onWrong);
      case 'categorymatch': return categorymatch(act, body, onCorrect, onWrong);
      case 'missingpiece': return missingpiece(act, body, onCorrect, onWrong);
      case 'homematch': return homematch(act, body, onCorrect, onWrong);
      case 'memory': return memory(act, body, onCorrect, onWrong);
      case 'jigsaw': return jigsaw(act, body, onCorrect, onWrong);
      default:
        body.innerHTML = '<p class="lesson-hint">Activity coming soon!</p>';
    }
  }

  function choiceBtn(html, cls, onTap) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'answer-btn pz-choice ' + (cls || '');
    b.innerHTML = html;
    b.addEventListener('click', () => onTap(b));
    return b;
  }
  function choicesGrid() {
    const g = document.createElement('div');
    g.className = 'pz-choices';
    return g;
  }

  /* ---- picture matching (identical pairs, tap two) ---- */
  function picmatch(act, body, onCorrect, onWrong) {
    const pool = act.pools[0];
    const emojis = pickN(POOLS[pool], act.pairs);
    const deck = shuffle(emojis.concat(emojis));
    const prompt = document.createElement('div');
    prompt.className = 'lesson-prompt';
    prompt.textContent = 'MATCH THE SAME';
    body.appendChild(prompt);
    const grid = document.createElement('div');
    grid.className = 'pz-match-grid';
    let selected = null, matched = 0;
    deck.forEach(e => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'pz-match-card';
      card.textContent = e;
      card.addEventListener('click', () => {
        if (card.classList.contains('matched')) return;
        A.sfx.flip();
        if (!selected) {
          selected = card; card.classList.add('selected');
        } else if (selected === card) {
          selected = null; card.classList.remove('selected');
        } else {
          const a = selected; selected = null;
          if (a.textContent === card.textContent) {
            a.classList.remove('selected');
            a.classList.add('matched');
            card.classList.add('matched');
            matched++;
            if (matched === act.pairs) onCorrect();
          } else {
            a.classList.remove('selected');
            a.classList.add('shake'); card.classList.add('shake');
            setTimeout(() => { a.classList.remove('shake'); card.classList.remove('shake'); }, 500);
            onWrong(null);
          }
        }
      });
      grid.appendChild(card);
    });
    body.appendChild(grid);
  }

  /* ---- colour matching: prompt colour → tap the object of that colour ---- */
  function colormatch(act, body, onCorrect, onWrong) {
    const blob = document.createElement('div');
    blob.className = 'color-prompt-blob';
    blob.style.background = D.COLORS[act.color] ? D.COLORS[act.color].css : (COLOUR_EMOJI[act.color] ? '#f472b6' : '#ef4444');
    blob.style.margin = '8px auto';
    body.appendChild(blob);
    const g = choicesGrid();
    shuffle(act.objects).forEach(o => {
      g.appendChild(choiceBtn(`<span class="pz-emoji">${o}</span>`, '', b => {
        if (COLOUR_OF[o] === act.color) { b.classList.add('correct'); onCorrect(); }
        else onWrong(b);
      }));
    });
    body.appendChild(g);
  }

  /* ---- shape matching: prompt shape → tap identical shape ---- */
  function shapematch(act, body, onCorrect, onWrong) {
    const prompt = document.createElement('div');
    prompt.className = 'pz-prompt-shape';
    prompt.innerHTML = SH(act.shape, 130, '');
    body.appendChild(prompt);
    const g = choicesGrid();
    shuffle(act.choices).forEach(sh => {
      g.appendChild(choiceBtn(SH(sh, 80, ''), '', b => {
        if (sh === act.shape) { b.classList.add('correct'); onCorrect(); }
        else onWrong(b);
      }));
    });
    body.appendChild(g);
  }

  /* ---- number → quantity: big number, tap the group with that many ---- */
  function numqty(act, body, onCorrect, onWrong) {
    const num = document.createElement('div');
    num.className = 'lesson-letter math';
    num.textContent = act.n;
    body.appendChild(num);
    const g = document.createElement('div');
    g.className = 'pz-groups';
    shuffle(act.groups).forEach(cnt => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'pz-group';
      const tier = cnt <= 4 ? '' : cnt <= 8 ? ' medium' : ' small';
      // build exactly `cnt` objects — the group's count must match its number
      const items = Array.from({ length: cnt }, () => `<span class="cf-item">${act.pic}</span>`).join('');
      card.innerHTML = `<span class="count-field${tier}" style="margin:0">${items}</span>`;
      // safety net: what the child SEES must equal this group's count
      if (card.querySelectorAll('.cf-item').length !== cnt) {
        console.error('❌ numqty group mismatch — repairing', cnt);
        card.innerHTML = `<span class="count-field${tier}" style="margin:0">${items}</span>`;
      }
      card.addEventListener('click', () => {
        if (cnt === act.n) { card.classList.add('correct'); onCorrect(); }
        else onWrong(card);
      });
      g.appendChild(card);
    });
    body.appendChild(g);
  }

  /* ---- letter matching: big letter → little letter ---- */
  function lettermatch(act, body, onCorrect, onWrong) {
    const prompt = document.createElement('div');
    prompt.className = 'lesson-letter';
    prompt.textContent = act.letter;
    body.appendChild(prompt);
    const g = choicesGrid();
    shuffle(act.choices).forEach(ch => {
      g.appendChild(choiceBtn(`<span class="ab-big" style="font-size:clamp(2.6rem,10vw,3.6rem)">${ch}</span>`, '', b => {
        if (ch === act.letter.toLowerCase()) { b.classList.add('correct'); onCorrect(); }
        else onWrong(b);
      }));
    });
    body.appendChild(g);
  }

  /* ---- family: "Find mummy!" ---- */
  function familymatch(act, body, onCorrect, onWrong) {
    const prompt = document.createElement('div');
    prompt.className = 'pz-emoji-big';
    prompt.textContent = act.member;
    body.appendChild(prompt);
    const g = choicesGrid();
    shuffle(act.choices).forEach(e => {
      g.appendChild(choiceBtn(`<span class="pz-emoji">${e}</span>`, '', b => {
        if (e === act.member) { b.classList.add('correct'); onCorrect(); }
        else onWrong(b);
      }));
    });
    body.appendChild(g);
  }

  /* ---- odd one out ---- */
  function oddoneout(act, body, onCorrect, onWrong) {
    const g = choicesGrid();
    act.items.forEach(e => {
      g.appendChild(choiceBtn(`<span class="pz-emoji">${e}</span>`, '', b => {
        const counts = {};
        act.items.forEach(x => { counts[x] = (counts[x] || 0) + 1; });
        if (counts[e] === 1) { b.classList.add('correct'); onCorrect(); }
        else onWrong(b);
      }));
    });
    body.appendChild(g);
  }

  /* ---- simple patterns ---- */
  function pattern(act, body, onCorrect, onWrong) {
    const seq = document.createElement('div');
    seq.className = 'count-field';
    act.seq.forEach(e => {
      const s = document.createElement('span');
      s.className = 'cf-item' + (e === '❓' ? ' pz-q' : '');
      s.textContent = e;
      seq.appendChild(s);
    });
    body.appendChild(seq);
    const g = choicesGrid();
    shuffle(act.choices || [act.answer]).forEach(e => {
      g.appendChild(choiceBtn(`<span class="pz-emoji">${e}</span>`, '', b => {
        if (e === act.answer) { b.classList.add('correct'); onCorrect(); }
        else onWrong(b);
      }));
    });
    body.appendChild(g);
  }

  /* ---- what comes next (growth sequences) ---- */
  function whatsnext(act, body, onCorrect, onWrong) {
    const seq = document.createElement('div');
    seq.className = 'count-field';
    act.seq.forEach(e => {
      const s = document.createElement('span');
      s.className = 'cf-item' + (e === '❓' ? ' pz-q' : '');
      s.textContent = e;
      seq.appendChild(s);
    });
    body.appendChild(seq);
    const g = choicesGrid();
    shuffle(act.choices).forEach(e => {
      g.appendChild(choiceBtn(`<span class="pz-emoji">${e}</span>`, '', b => {
        if (e === act.answer) { b.classList.add('correct'); onCorrect(); }
        else onWrong(b);
      }));
    });
    body.appendChild(g);
  }

  /* ---- animal sound: narrator says the sound, child picks the animal ---- */
  function animalsound(act, body, onCorrect, onWrong) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'listen-btn';
    btn.innerHTML = '🔊 ' + act.sound;
    btn.style.margin = '8px auto';
    btn.addEventListener('click', () => { A.sfx.click(); A.speak(act.speak); });
    body.appendChild(btn);
    const g = choicesGrid();
    shuffle(act.choices).forEach(e => {
      g.appendChild(choiceBtn(`<span class="pz-emoji">${e}</span>`, '', b => {
        if (e === act.animal) { b.classList.add('correct'); onCorrect(); }
        else onWrong(b);
      }));
    });
    body.appendChild(g);
    setTimeout(() => A.speak(act.speak), 400);
  }

  /* ---- category: object → which group? ---- */
  function categorymatch(act, body, onCorrect, onWrong) {
    const prompt = document.createElement('div');
    prompt.className = 'pz-emoji-big';
    prompt.textContent = act.object;
    body.appendChild(prompt);
    const g = choicesGrid();
    shuffle(act.choices).forEach(catIcon => {
      g.appendChild(choiceBtn(`<span class="pz-emoji">${catIcon}</span>`, '', b => {
        if (catIcon === act.category.icon) { b.classList.add('correct'); onCorrect(); }
        else onWrong(b);
      }));
    });
    body.appendChild(g);
  }

  /* ---- missing piece: dashed outline + 3 shape choices ---- */
  function missingpiece(act, body, onCorrect, onWrong) {
    const scene = document.createElement('div');
    scene.className = 'pz-scene';
    scene.innerHTML = `<svg viewBox="0 0 300 300">${act.scene}</svg>`;
    body.appendChild(scene);
    const g = choicesGrid();
    shuffle(act.choices).forEach(sh => {
      g.appendChild(choiceBtn(SH(sh, 76, ''), '', b => {
        if (sh === act.answer) {
          // fill the missing piece
          const fill = document.createElement('div');
          fill.className = 'pz-scene-fill';
          fill.innerHTML = `<svg viewBox="0 0 300 300">${SH(act.answer, 300, '#ffb703')}</svg>`;
          scene.appendChild(fill);
          b.classList.add('correct');
          onCorrect();
        } else onWrong(b);
      }));
    });
    body.appendChild(g);
  }

  /* ---- home: object → which room? ---- */
  function homematch(act, body, onCorrect, onWrong) {
    const prompt = document.createElement('div');
    prompt.className = 'pz-emoji-big';
    prompt.textContent = act.object;
    body.appendChild(prompt);
    const g = choicesGrid();
    shuffle(act.choices).forEach(room => {
      g.appendChild(choiceBtn(`<span class="pz-emoji">${room}</span>`, '', b => {
        if (room === act.answer) { b.classList.add('correct'); onCorrect(); }
        else onWrong(b);
      }));
    });
    body.appendChild(g);
  }

  /* ---- memory matching (face-down pairs) ---- */
  function memory(act, body, onCorrect, onWrong) {
    const emojis = pickN(POOLS[act.pools[0]], act.pairs);
    const deck = shuffle(emojis.concat(emojis));
    let flipped = [], matched = 0;
    const grid = document.createElement('div');
    grid.className = 'memory-grid pz-memory';
    deck.forEach((e, i) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'mem-card';
      card.setAttribute('data-e', e);
      card.addEventListener('click', () => {
        if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
        if (flipped.length === 2) return;
        A.sfx.flip();
        card.classList.add('flipped');
        card.textContent = e;
        flipped.push(card);
        if (flipped.length === 2) {
          const [a, b] = flipped;
          if (a.getAttribute('data-e') === b.getAttribute('data-e')) {
            setTimeout(() => {
              a.classList.add('matched'); b.classList.add('matched');
              matched++;
              flipped = [];
              if (matched === act.pairs) onCorrect();
            }, 420);
          } else {
            setTimeout(() => {
              a.classList.remove('flipped'); b.classList.remove('flipped');
              a.textContent = ''; b.textContent = '';
              flipped = [];
              onWrong(null);
            }, 750);
          }
        }
      });
      grid.appendChild(card);
    });
    body.appendChild(grid);
  }

  /* ---- jigsaw: slice a big emoji picture, tap pieces into place ---- */
  function jigsaw(act, body, onCorrect, onWrong) {
    const pieces = act.pieces;
    const cols = pieces === 2 ? 2 : pieces === 3 ? 3 : pieces === 4 ? 2 : 3;
    const rows = Math.ceil(pieces / cols);
    const W = 300, H = 300, cw = W / cols, ch = H / rows;

    let pieceImages = [];
    try {
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      const g = c.getContext('2d');
      if (g && typeof g.fillText === 'function') {
        g.fillStyle = '#fff7d6';
        g.fillRect(0, 0, W, H);
        g.font = '200px sans-serif';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(act.emoji, W / 2, H / 2 + 6);
        for (let r = 0; r < rows; r++) {
          for (let col = 0; col < cols; col++) {
            const pc = document.createElement('canvas');
            pc.width = cw; pc.height = ch;
            const pg = pc.getContext('2d');
            pg.drawImage(c, -col * cw, -r * ch);
            const url = typeof pc.toDataURL === 'function' ? pc.toDataURL() : null;
            pieceImages.push({ url: url, slot: r * cols + col, r: r, c: col });
          }
        }
      }
    } catch (e) { pieceImages = []; }

    const board = document.createElement('div');
    board.className = 'pz-jigsaw-board';
    board.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)';
    const slots = [];
    for (let i = 0; i < pieces; i++) {
      const slot = document.createElement('div');
      slot.className = 'pz-jigsaw-slot';
      board.appendChild(slot);
      slots.push(slot);
    }
    body.appendChild(board);

    const tray = document.createElement('div');
    tray.className = 'pz-jigsaw-tray';
    body.appendChild(tray);

    if (!pieceImages.length) {
      // fallback: emoji tiles
      pieceImages = Array.from({ length: pieces }, (_, i) => ({
        url: null, slot: i, r: 0, c: i, fallback: act.emoji
      }));
    }
    shuffle(pieceImages).forEach(p => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pz-jigsaw-piece';
      if (p.url) btn.style.backgroundImage = 'url(' + p.url + ')';
      else btn.textContent = p.fallback || act.emoji;
      btn.style.width = (100 / cols) + '%';
      btn.style.paddingBottom = (100 / cols) + '%';
      btn.addEventListener('click', () => {
        A.sfx.pop();
        const slot = slots[p.slot];
        if (slot.classList.contains('filled')) return;
        slot.classList.add('filled');
        if (p.url) slot.style.backgroundImage = 'url(' + p.url + ')';
        else slot.textContent = p.fallback || act.emoji;
        btn.style.display = 'none';
        A.playCelebration('success');
        const done = slots.every(s => s.classList.contains('filled'));
        if (done) setTimeout(onCorrect, 700);
      });
      tray.appendChild(btn);
    });
  }

  return { startFlow, render, buildLibrary, librarySize, allDoneCount, nextActivity, complete, resetAll, activityIssues, validateLibrary };
})();
