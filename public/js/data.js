/* ==========================================================================
   🌈 LET'S LEARN — data.js
   All educational content: characters, shapes, curriculum (Baby Class → P3),
   tracing templates, coloring templates, badges, adventure tasks.
   Everything is controlled vector/SVG or emoji — no random AI artwork.
   ========================================================================== */

/* ------------------------------------------------------------------ */
/*  SUBJECTS & COLORS                                                  */
/* ------------------------------------------------------------------ */

const SUBJECTS = {
  english:  { name: 'English',  icon: '📖', color: 'var(--english)',  colorCss: '#2f7de1' },
  maths:    { name: 'Maths',    icon: '🔢', color: 'var(--maths)',    colorCss: '#f99a1c' },
  science:  { name: 'Science',  icon: '🔬', color: 'var(--science)',  colorCss: '#2fa96b' },
  sst:      { name: 'SST',      icon: '🌍', color: 'var(--sst)',      colorCss: '#8b5cf6' },
  creative: { name: 'Creative', icon: '🎨', color: 'var(--creative)', colorCss: '#ec4899' }
};

const SUBJECT_ORDER = ['english', 'maths', 'science', 'sst', 'creative'];

/* ------------------------------------------------------------------ */
/*  CLASSES                                                            */
/* ------------------------------------------------------------------ */

const CLASSES = {
  baby:   { name: 'Baby Class',   short: 'Baby',   emoji: '👶', age: '3–4 years', color: '#f99a1c' },
  middle: { name: 'Middle Class', short: 'Middle', emoji: '🧒', age: '4–5 years', color: '#ec4899' },
  top:    { name: 'Top Class',    short: 'Top',    emoji: '🧒', age: '5–6 years', color: '#2f7de1' },
  p1:     { name: 'Primary 1',    short: 'P1',     emoji: '1️⃣', age: '6–7 years', color: '#2fa96b' },
  p2:     { name: 'Primary 2',    short: 'P2',     emoji: '2️⃣', age: '7–8 years', color: '#8b5cf6' },
  p3:     { name: 'Primary 3',    short: 'P3',     emoji: '3️⃣', age: '8–9 years', color: '#e05a1c' }
};

const CLASS_ORDER = ['baby', 'middle', 'top', 'p1', 'p2', 'p3'];

/* ------------------------------------------------------------------ */
/*  COLORS (for color activities)                                      */
/* ------------------------------------------------------------------ */

const COLORS = {
  red:    { name: 'Red',    css: '#ef4444', emoji: '🔴' },
  yellow: { name: 'Yellow', css: '#facc15', emoji: '🟡' },
  blue:   { name: 'Blue',   css: '#3b82f6', emoji: '🔵' },
  green:  { name: 'Green',  css: '#22c55e', emoji: '🟢' },
  orange: { name: 'Orange', css: '#f97316', emoji: '🟠' },
  purple: { name: 'Purple', css: '#a855f7', emoji: '🟣' },
  pink:   { name: 'Pink',   css: '#f472b6', emoji: '🩷' },
  brown:  { name: 'Brown',  css: '#92400e', emoji: '🟤' },
  black:  { name: 'Black',  css: '#1a1a2e', emoji: '⚫' },
  white:  { name: 'White',  css: '#f0f0f0', emoji: '⚪' },
  grey:   { name: 'Grey',   css: '#9ca3af', emoji: '🩶' }
};

/* ------------------------------------------------------------------ */
/*  SHAPES (SVG — precise, clean, consistent)                          */
/* ------------------------------------------------------------------ */

function shapeSVG(shape, size, fill) {
  size = size || 80;
  const s = size, half = s / 2;
  const c = fill || 'none';
  const stroke = '#33385c';
  const sw = Math.max(3, s * 0.05);
  let body = '';
  switch (shape) {
    case 'circle':
      body = `<circle cx="${half}" cy="${half}" r="${half * 0.78}" fill="${c}" stroke="${stroke}" stroke-width="${sw}"/>`;
      break;
    case 'square':
      body = `<rect x="${s*0.14}" y="${s*0.14}" width="${s*0.72}" height="${s*0.72}" rx="${s*0.08}" fill="${c}" stroke="${stroke}" stroke-width="${sw}"/>`;
      break;
    case 'triangle':
      body = `<polygon points="${half},${s*0.12} ${s*0.12},${s*0.85} ${s*0.88},${s*0.85}" fill="${c}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      break;
    case 'star':
      body = `<polygon points="${starPoints(half, half, half*0.75, half*0.35)}" fill="${c}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      break;
    case 'heart':
      body = `<path d="${heartPath(half, half, half*0.7)}" fill="${c}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      break;
    case 'rectangle':
      body = `<rect x="${s*0.08}" y="${s*0.3}" width="${s*0.84}" height="${s*0.4}" rx="${s*0.07}" fill="${c}" stroke="${stroke}" stroke-width="${sw}"/>`;
      break;
    case 'oval':
      body = `<ellipse cx="${half}" cy="${half}" rx="${half*0.8}" ry="${half*0.55}" fill="${c}" stroke="${stroke}" stroke-width="${sw}"/>`;
      break;
    case 'diamond':
      body = `<polygon points="${half},${s*0.08} ${s*0.92},${half} ${half},${s*0.92} ${s*0.08},${half}" fill="${c}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      break;
    case 'moon':
      body = `<path d="M ${half*0.55} ${s*0.08} A ${half*0.8} ${half*0.8} 0 1 0 ${half*0.95} ${s*0.72} A ${half*0.6} ${half*0.6} 0 1 1 ${half*0.55} ${s*0.08} Z" fill="${c}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      break;
    case 'pentagon':
      body = `<polygon points="${polygonPoints(half, half, half*0.78, 5)}" fill="${c}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      break;
    case 'hexagon':
      body = `<polygon points="${polygonPoints(half, half, half*0.78, 6)}" fill="${c}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      break;
    default:
      body = `<circle cx="${half}" cy="${half}" r="${half*0.7}" fill="${c}" stroke="${stroke}" stroke-width="${sw}"/>`;
  }
  return `<svg viewBox="0 0 ${s} ${s}" role="img" aria-label="${shape} shape">${body}</svg>`;
}

function starPoints(cx, cy, outer, inner) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

function heartPath(cx, cy, r) {
  return `M ${cx} ${cy + r * 0.9} C ${cx - r * 1.4} ${cy - r * 0.1} ${cx - r * 0.9} ${cy - r * 1.1} ${cx} ${cy - r * 0.35} C ${cx + r * 0.9} ${cy - r * 1.1} ${cx + r * 1.4} ${cy - r * 0.1} ${cx} ${cy + r * 0.9} Z`;
}

function polygonPoints(cx, cy, r, sides) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const a = (Math.PI * 2 * i) / sides - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

const SHAPE_NAMES = {
  circle: 'Circle', square: 'Square', triangle: 'Triangle', star: 'Star',
  heart: 'Heart', rectangle: 'Rectangle', oval: 'Oval', diamond: 'Diamond', moon: 'Moon',
  pentagon: 'Pentagon', hexagon: 'Hexagon'
};

/* ------------------------------------------------------------------ */
/*  FRIENDLY CHARACTERS (SVG)                                          */
/* ------------------------------------------------------------------ */

const CHARACTERS = {
  panda: {
    name: 'Pip the Panda',
    role: 'Our friendly teacher',
    svg: `<svg viewBox="0 0 140 132" role="img" aria-label="Pip the panda">
      <ellipse cx="70" cy="112" rx="34" ry="13" fill="#d9deec"/>
      <ellipse cx="70" cy="100" rx="26" ry="20" fill="#ffffff" stroke="#33385c" stroke-width="3"/>
      <circle cx="38" cy="96" r="9" fill="#ffffff" stroke="#33385c" stroke-width="3"/>
      <circle cx="102" cy="96" r="9" fill="#ffffff" stroke="#33385c" stroke-width="3"/>
      <circle cx="40" cy="20" r="14" fill="#3a3f52"/>
      <circle cx="100" cy="20" r="14" fill="#3a3f52"/>
      <circle cx="70" cy="52" r="40" fill="#ffffff" stroke="#33385c" stroke-width="3.5"/>
      <ellipse cx="51" cy="50" rx="11" ry="14" fill="#3a3f52" transform="rotate(-18 51 50)"/>
      <ellipse cx="89" cy="50" rx="11" ry="14" fill="#3a3f52" transform="rotate(18 89 50)"/>
      <circle cx="53" cy="47" r="4.2" fill="#ffffff"/>
      <circle cx="87" cy="47" r="4.2" fill="#ffffff"/>
      <circle cx="55" cy="49" r="1.8" fill="#3a3f52"/>
      <circle cx="85" cy="49" r="1.8" fill="#3a3f52"/>
      <ellipse cx="70" cy="64" rx="7" ry="5" fill="#3a3f52"/>
      <path d="M62 73 Q70 81 78 73" stroke="#33385c" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="36" cy="66" r="6" fill="#ffb3c1" opacity="0.9"/>
      <circle cx="104" cy="66" r="6" fill="#ffb3c1" opacity="0.9"/>
    </svg>`
  },
  rabbit: {
    name: 'Ruby the Rabbit',
    role: 'Loves reading',
    svg: `<svg viewBox="0 0 140 132" role="img" aria-label="Ruby the rabbit">
      <ellipse cx="70" cy="112" rx="34" ry="13" fill="#d9deec"/>
      <ellipse cx="70" cy="100" rx="26" ry="20" fill="#fffaf2" stroke="#33385c" stroke-width="3"/>
      <circle cx="38" cy="96" r="9" fill="#fffaf2" stroke="#33385c" stroke-width="3"/>
      <circle cx="102" cy="96" r="9" fill="#fffaf2" stroke="#33385c" stroke-width="3"/>
      <ellipse cx="46" cy="14" rx="11" ry="26" fill="#fffaf2" stroke="#33385c" stroke-width="3" transform="rotate(-12 46 14)"/>
      <ellipse cx="46" cy="16" rx="5.5" ry="18" fill="#ffb3c1" transform="rotate(-12 46 16)"/>
      <ellipse cx="94" cy="14" rx="11" ry="26" fill="#fffaf2" stroke="#33385c" stroke-width="3" transform="rotate(12 94 14)"/>
      <ellipse cx="94" cy="16" rx="5.5" ry="18" fill="#ffb3c1" transform="rotate(12 94 16)"/>
      <circle cx="70" cy="60" r="38" fill="#fffaf2" stroke="#33385c" stroke-width="3.5"/>
      <circle cx="52" cy="56" r="4.5" fill="#33385c"/>
      <circle cx="88" cy="56" r="4.5" fill="#33385c"/>
      <circle cx="53.5" cy="54.5" r="1.6" fill="#fff"/>
      <circle cx="86.5" cy="54.5" r="1.6" fill="#fff"/>
      <ellipse cx="70" cy="72" rx="4.5" ry="3.5" fill="#f472b6"/>
      <rect x="63" y="76" width="6" height="7" rx="1.5" fill="#fff" stroke="#33385c" stroke-width="1.6"/>
      <rect x="71" y="76" width="6" height="7" rx="1.5" fill="#fff" stroke="#33385c" stroke-width="1.6"/>
      <path d="M56 66 L46 62 M56 70 L45 69 M84 66 L94 62 M84 70 L95 69" stroke="#c9c2b0" stroke-width="2" stroke-linecap="round"/>
      <circle cx="38" cy="70" r="6" fill="#ffb3c1" opacity="0.9"/>
      <circle cx="102" cy="70" r="6" fill="#ffb3c1" opacity="0.9"/>
    </svg>`
  },
  lion: {
    name: 'Leo the Lion',
    role: 'Brave and clever',
    svg: `<svg viewBox="0 0 140 132" role="img" aria-label="Leo the lion">
      <ellipse cx="70" cy="112" rx="34" ry="13" fill="#d9deec"/>
      <ellipse cx="70" cy="100" rx="26" ry="20" fill="#ffd98c" stroke="#33385c" stroke-width="3"/>
      <circle cx="38" cy="96" r="9" fill="#ffd98c" stroke="#33385c" stroke-width="3"/>
      <circle cx="102" cy="96" r="9" fill="#ffd98c" stroke="#33385c" stroke-width="3"/>
      <circle cx="70" cy="56" r="42" fill="#f9a826" stroke="#33385c" stroke-width="3.5"/>
      ${maneTriangles()}
      <circle cx="70" cy="60" r="26" fill="#ffd98c" stroke="#33385c" stroke-width="3"/>
      <circle cx="56" cy="54" r="4.5" fill="#33385c"/>
      <circle cx="84" cy="54" r="4.5" fill="#33385c"/>
      <circle cx="57.5" cy="52.5" r="1.6" fill="#fff"/>
      <circle cx="82.5" cy="52.5" r="1.6" fill="#fff"/>
      <ellipse cx="70" cy="70" rx="8" ry="6" fill="#f9a826" stroke="#33385c" stroke-width="2.5"/>
      <ellipse cx="70" cy="69" rx="3.5" ry="2.6" fill="#7a4a12"/>
      <path d="M62 78 Q70 85 78 78" stroke="#33385c" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="38" cy="66" r="6" fill="#ff8f8f" opacity="0.85"/>
      <circle cx="102" cy="66" r="6" fill="#ff8f8f" opacity="0.85"/>
    </svg>`
  },
  monkey: {
    name: 'Milo the Monkey',
    role: 'Loves games',
    svg: `<svg viewBox="0 0 140 132" role="img" aria-label="Milo the monkey">
      <ellipse cx="70" cy="112" rx="34" ry="13" fill="#d9deec"/>
      <ellipse cx="70" cy="100" rx="26" ry="20" fill="#c98a4b" stroke="#33385c" stroke-width="3"/>
      <circle cx="38" cy="96" r="9" fill="#c98a4b" stroke="#33385c" stroke-width="3"/>
      <circle cx="102" cy="96" r="9" fill="#c98a4b" stroke="#33385c" stroke-width="3"/>
      <circle cx="34" cy="42" r="16" fill="#c98a4b" stroke="#33385c" stroke-width="3.5"/>
      <circle cx="106" cy="42" r="16" fill="#c98a4b" stroke="#33385c" stroke-width="3.5"/>
      <circle cx="34" cy="42" r="8" fill="#ffd9a8"/>
      <circle cx="106" cy="42" r="8" fill="#ffd9a8"/>
      <circle cx="70" cy="58" r="38" fill="#c98a4b" stroke="#33385c" stroke-width="3.5"/>
      <ellipse cx="70" cy="66" rx="26" ry="24" fill="#ffd9a8" stroke="#33385c" stroke-width="3"/>
      <circle cx="58" cy="60" r="4.5" fill="#33385c"/>
      <circle cx="82" cy="60" r="4.5" fill="#33385c"/>
      <circle cx="59.5" cy="58.5" r="1.6" fill="#fff"/>
      <circle cx="80.5" cy="58.5" r="1.6" fill="#fff"/>
      <circle cx="70" cy="74" r="5.5" fill="#33385c"/>
      <path d="M61 82 Q70 89 79 82" stroke="#33385c" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="40" cy="72" r="6" fill="#ff8f8f" opacity="0.8"/>
      <circle cx="100" cy="72" r="6" fill="#ff8f8f" opacity="0.8"/>
    </svg>`
  }
};

function maneTriangles() {
  let out = '';
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI / 6) * i;
    const x1 = 70 + 46 * Math.cos(a - 0.18), y1 = 56 + 46 * Math.sin(a - 0.18);
    const x2 = 70 + 46 * Math.cos(a + 0.18), y2 = 56 + 46 * Math.sin(a + 0.18);
    const x3 = 70 + 58 * Math.cos(a), y3 = 56 + 58 * Math.sin(a);
    out += `<polygon points="${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)} ${x3.toFixed(1)},${y3.toFixed(1)}" fill="#f9a826" stroke="#33385c" stroke-width="2.6" stroke-linejoin="round"/>`;
  }
  return out;
}

const AVATARS = ['panda', 'rabbit', 'lion', 'monkey', '👧', '👦', '🦄', '🚀'];

function avatarHTML(id, sizePx) {
  if (CHARACTERS[id]) {
    return `<span style="width:${sizePx}px;height:${sizePx}px;display:inline-block">${CHARACTERS[id].svg}</span>`;
  }
  return `<span style="font-size:${Math.round(sizePx * 0.8)}px;line-height:${sizePx}px">${id}</span>`;
}

/* ------------------------------------------------------------------ */
/*  LETTERS, PHONICS & PICTURES                                        */
/* ------------------------------------------------------------------ */

const LETTER_PICS = {
  A: ['🍎', 'Apple', 'ah'], B: ['🚌', 'Bus', 'buh'], C: ['🐱', 'Cat', 'kuh'], D: ['🐶', 'Dog', 'duh'],
  E: ['🐘', 'Elephant', 'eh'], F: ['🐸', 'Frog', 'fuh'], G: ['🦒', 'Giraffe', 'guh'], H: ['🏠', 'House', 'huh'],
  I: ['🍦', 'Ice cream', 'ih'], J: ['🫙', 'Jug', 'juh'], K: ['🪁', 'Kite', 'kuh'], L: ['🦁', 'Lion', 'luh'],
  M: ['🐵', 'Monkey', 'mmm'], N: ['🪺', 'Nest', 'nnn'], O: ['🍊', 'Orange', 'oh'], P: ['🐷', 'Pig', 'puh'],
  Q: ['👑', 'Queen', 'kwuh'], R: ['🐰', 'Rabbit', 'rrr'], S: ['☀️', 'Sun', 'sss'], T: ['🐢', 'Turtle', 'tuh'],
  U: ['☂️', 'Umbrella', 'uh'], V: ['🚗', 'Van', 'vuh'], W: ['⏰', 'Watch', 'wuh'], X: ['📦', 'Box', 'ks'],
  Y: ['🪀', 'Yo-yo', 'yuh'], Z: ['🦓', 'Zebra', 'zzz']
};

const LETTERS = Object.keys(LETTER_PICS); // A..Z

/* ------------------------------------------------------------------ */
/*  LESSON STEP HELPERS                                                */
/* ------------------------------------------------------------------ */

function letterIntro(ch) {
  const pic = LETTER_PICS[ch];
  return [
    { t: 'letter', ch: ch, pic: pic[0], word: pic[1], phonics: pic[2] },
    { t: 'say', emoji: pic[0], text: `${pic[1]} begins with the letter ${ch}. ${ch} says ${pic[2]}, ${pic[2]}, like ${pic[1]}!`, auto: true }
  ];
}

function findLetter(ch, options) {
  return {
    t: 'findLetter', prompt: `Find the letter ${ch}!`, answer: ch,
    options: options || (['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].filter(l => l !== ch).sort(() => Math.random() - 0.5).slice(0, 3).concat(ch).sort(() => Math.random() - 0.5)),
    speak: `Find the letter ${ch}.`
  };
}

function countStep(pic, n, max) {
  // The number of objects rendered (n) IS the correct answer — options are
  // generated from n, so question ↔ visual ↔ answer can never mismatch.
  return { t: 'count', pic: pic, n: n, options: countOptions(n), speak: `Count the ${pic}. How many are there?` };
}

function findNumber(prompt, answer, max) {
  return { t: 'findNumber', prompt: prompt, answer: answer, options: mcOptions(answer), speak: prompt };
}

function shapeIntro(shape, colorCss) {
  return { t: 'shape', shape: shape, speak: `This is a ${SHAPE_NAMES[shape]}. A ${SHAPE_NAMES[shape]}!` };
}

function findShape(shape, options, colorCss) {
  return { t: 'findShape', shape: shape, answer: shape, options: options, speak: `Tap the ${SHAPE_NAMES[shape]}.` };
}

function colorIntro(colorKey) {
  const c = COLORS[colorKey];
  return { t: 'color', color: colorKey, speak: `This is ${c.name}. ${c.name} like a ${c.emoji}!` };
}

function findColor(colorKey, options) {
  return { t: 'findColor', color: colorKey, answer: colorKey, options: options, speak: `Tap the ${COLORS[colorKey].name} one.` };
}

function wordStep(word, emoji) {
  return { t: 'word', word: word, emoji: emoji, speak: `${word}. ${word}. ${emoji} is a ${word}.` };
}

function matchStep(pairs) {
  return { t: 'match', pairs: pairs, speak: 'Match the picture to its word!' };
}

function mathStep(a, b, op, pic) {
  // answer is computed ONCE here and stored on the step: the visual renderer
  // draws from a/b and the correct button is step.answer — one source of truth.
  const answer = op === '×' ? a * b : op === '-' ? a - b : a + b;
  const speak = op === '×' ? `${a} groups of ${b}. How many in total?`
    : op === '-' ? `${a} take away ${b}. How many are left?`
    : `${a} plus ${b}. How many in total?`;
  return {
    t: 'math', a: a, b: b, op: op, pic: pic || '🍎',
    answer: answer, options: mcOptions(answer), speak: speak
  };
}

function readStep(text, emoji) {
  return { t: 'read', text: text, emoji: emoji, speak: `Read along. ${text}` };
}

function qStep(question, options, answer, emoji) {
  return { t: 'q', question: question, options: options, answer: answer, emoji: emoji, speak: question };
}

function infoStep(title, text, emoji, listen) {
  return { t: 'info', title: title, text: text, emoji: emoji, speak: listen || text };
}

function traceStep(kind, which) {
  return { t: 'trace', kind: kind, which: which };
}

function colorStep(templateId) {
  return { t: 'colorIt', template: templateId };
}

function patternStep(seq, answerEmoji) {
  const distractors = [...new Set(seq.concat(['🐞', '🦋', '🐝', '🐢']).filter(x => x !== answerEmoji))].slice(0, 3);
  return {
    t: 'pattern', seq: seq, answer: answerEmoji,
    options: shuffle(distractors.concat([answerEmoji])),
    speak: 'What comes next in the pattern?'
  };
}

function compareStep(picA, nA, picB, nB) {
  if (nA === nB) console.error('❌ compareStep tie — neither side has more', picA, nA, picB, nB);
  return { t: 'compare', picA: picA, nA: nA, picB: picB, nB: nB, answer: nA > nB ? 'A' : 'B', speak: 'Which side has more?' };
}

function orderStep(items, speak) {
  return { t: 'order', items: shuffle(items.slice()), speak: speak || 'Tap the numbers in order, from smallest to biggest!' };
}

/* ------------------------------------------------------------------ */
/*  ANSWER OPTION POOLS (single source of truth)                       */
/*  Every pool is generated FROM the correct answer, so the visible    */
/*  objects, the question and the expected answer can never disagree.  */
/* ------------------------------------------------------------------ */

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* 4 distinct integer options ≥ minVal, always including `answer` */
function optionPool(answer, minVal) {
  const set = new Set([answer]);
  let delta = 1;
  while (set.size < 4) {
    set.add(Math.max(minVal, answer - delta));
    if (set.size < 4) set.add(answer + delta);
    delta++;
  }
  return shuffle([...set]);
}

/* counting options start at 1 (you cannot count 0 objects) */
function countOptions(n) { return optionPool(n, 1); }
/* number/math options may include 0 */
function mcOptions(a) { return optionPool(a, 0); }

function makeLesson(id, subject, title, icon, steps, topic) {
  return { id: id, subject: subject, title: title, icon: icon, steps: steps, topic: topic || title };
}

/* ------------------------------------------------------------------ */
/*  CURRICULUM — Baby Class → P3                                       */
/* ------------------------------------------------------------------ */

const CURRICULUM = {};

/* ============================ BABY CLASS ============================ */
CURRICULUM.baby = {
  english: [
    makeLesson('b-e1', 'english', 'Letters A, B, C', '🔤', [
      ...letterIntro('A'), { t: 'media', id: 'song-alphabet', label: 'Sing the Alphabet Song!' }, findLetter('A', ['A', 'B', 'C']),
      ...letterIntro('B'), findLetter('B', ['A', 'B', 'C']),
      ...letterIntro('C'), findLetter('C', ['A', 'B', 'C'])
    ], 'Letters'),
    makeLesson('b-e4', 'english', 'Letter A Adventure', '🍎', [
      infoStep('See the Letter A', 'Look at the big letter A!', '🔤'),
      { t: 'media', id: 'video-letter-a', label: 'Watch the Letter A video!' },
      { t: 'media', id: 'song-alphabet', label: 'Sing along!' },
      traceStep('letter', 'A'),
      findLetter('A', ['A', 'B', 'C']),
      colorStep('apple')
    ], 'Letter A adventure'),
    makeLesson('b-e2', 'english', 'Letters D, E, F', '🔡', [
      ...letterIntro('D'), findLetter('D', ['D', 'E', 'F']),
      ...letterIntro('E'), findLetter('E', ['D', 'E', 'F']),
      ...letterIntro('F'), findLetter('F', ['D', 'E', 'F'])
    ], 'Letters'),
    makeLesson('b-e3', 'english', 'My First Words', '🅰️', [
      wordStep('Apple', '🍎'), wordStep('Ball', '⚽'), wordStep('Cat', '🐱'),
      matchStep([['🍎', 'Apple'], ['⚽', 'Ball'], ['🐱', 'Cat']])
    ], 'First words'),
    makeLesson('b-e5', 'english', 'Letters G, H, I', '🔤', [
      ...letterIntro('G'), findLetter('G', ['G', 'H', 'I']),
      ...letterIntro('H'), findLetter('H', ['G', 'H', 'I']),
      ...letterIntro('I'), findLetter('I', ['G', 'H', 'I'])
    ], 'Letters'),
    makeLesson('b-e6', 'english', 'Letters J, K, L', '🔡', [
      ...letterIntro('J'), findLetter('J', ['J', 'K', 'L']),
      ...letterIntro('K'), findLetter('K', ['J', 'K', 'L']),
      ...letterIntro('L'), findLetter('L', ['J', 'K', 'L'])
    ], 'Letters'),
    makeLesson('b-e7', 'english', 'Find the Letters', '🔍', [
      infoStep('Letter Hunt', 'Can you find the right letter?', '🔍'),
      findLetter('A', ['A', 'M', 'S']),
      findLetter('B', ['B', 'P', 'D']),
      findLetter('C', ['C', 'G', 'O']),
      findLetter('D', ['D', 'B', 'P'])
    ], 'Letter recognition'),
    makeLesson('b-e8', 'english', 'Animal Words', '🐾', [
      wordStep('Dog', '🐶'), wordStep('Cat', '🐱'), wordStep('Cow', '🐄'),
      wordStep('Hen', '🐔'),
      matchStep([['🐶', 'Dog'], ['🐱', 'Cat'], ['🐄', 'Cow'], ['🐔', 'Hen']])
    ], 'Animal words'),
    makeLesson('b-e9', 'english', 'Food Words', '🍽️', [
      wordStep('Milk', '🥛'), wordStep('Banana', '🍌'), wordStep('Egg', '🥚'),
      wordStep('Bread', '🍞'),
      matchStep([['🥛', 'Milk'], ['🍌', 'Banana'], ['🥚', 'Egg'], ['🍞', 'Bread']])
    ], 'Food words'),
    makeLesson('b-e10', 'english', 'Letter Sounds: A, B, C', '🔊', [
      infoStep('A says ah', 'A says ah, ah, Apple!', '🍎'),
      infoStep('B says buh', 'B says buh, buh, Ball!', '⚽'),
      infoStep('C says kuh', 'C says kuh, kuh, Cat!', '🐱'),
      qStep('Which letter says buh?', ['A', 'B', 'C'], 'B', '⚽'),
      qStep('Which letter says ah?', ['A', 'B', 'C'], 'A', '🍎')
    ], 'Letter sounds')
  ],
  maths: [
    makeLesson('b-m1', 'maths', 'Count 1, 2, 3', '🔢', [
      infoStep('Let\'s Count!', 'We are going to count to three!', '👶'),
      countStep('🍎', 1, 3),
      { t: 'media', id: 'song-count-with-me', label: 'Sing the counting song!' },
      countStep('🍌', 2, 3), countStep('🐤', 3, 3),
      findNumber('Where is the number 2?', 2, 3)
    ], 'Counting'),
    makeLesson('b-m2', 'maths', 'Count 4 and 5', '🔢', [
      countStep('⭐', 4, 5), countStep('🌸', 5, 5),
      findNumber('Where is the number 5?', 5, 5)
    ], 'Counting'),
    makeLesson('b-m3', 'maths', 'Circles and Squares', '🔵', [
      shapeIntro('circle'),
      { t: 'media', id: 'song-shapes', label: 'Sing the shape song!' },
      findShape('circle', ['circle', 'square']),
      shapeIntro('square'), findShape('square', ['circle', 'square'])
    ], 'Shapes'),
    makeLesson('b-m4', 'maths', 'Number 5 Adventure', '5️⃣', [
      infoStep('Five Apples', 'Look at the five apples!', '🍎'),
      { t: 'media', id: 'video-number-5', label: 'Watch the Number 5 video!' },
      { t: 'media', id: 'song-count-with-me', label: 'Sing the counting song!' },
      countStep('🍎', 5, 5),
      traceStep('number', '5'),
      findNumber('Where is the number 5?', 5, 5)
    ], 'Number 5 adventure'),
    makeLesson('b-m5', 'maths', 'Count the Animals', '🐾', [
      infoStep('Count Animals', 'Let us count the animals!', '🐾'),
      countStep('🐶', 1, 5), countStep('🐱', 2, 5), countStep('🐔', 3, 5),
      countStep('🐸', 4, 5), countStep('🐟', 5, 5)
    ], 'Counting animals'),
    makeLesson('b-m6', 'maths', 'Count the Fruits', '🍎', [
      infoStep('Count Fruits', 'Let us count the fruits!', '🍇'),
      countStep('🍌', 2, 5), countStep('🍊', 3, 5), countStep('🍓', 4, 5),
      countStep('🥭', 5, 5), countStep('🍎', 1, 5)
    ], 'Counting fruits'),
    makeLesson('b-m7', 'maths', 'Big and Small', '🐘', [
      infoStep('Big and Small', 'Some things are big and some are small!', '📏'),
      qStep('Which one is BIG?', ['🐘 Elephant', '🐜 Ant', '🐁 Mouse'], '🐘 Elephant', '🐘'),
      qStep('Which one is SMALL?', ['🐘 Elephant', '🐁 Mouse', '🐄 Cow'], '🐁 Mouse', '🐁'),
      qStep('Which fruit is BIGGER?', ['🍉 Watermelon', '🍒 Cherry', '🍇 Grape'], '🍉 Watermelon', '🍉')
    ], 'Comparing size'),
    makeLesson('b-m8', 'maths', 'Trace Numbers 1-5', '✏️', [
      infoStep('Trace the Numbers', 'Use your finger to trace each number!', '✏️'),
      traceStep('number', '1'), traceStep('number', '2'), traceStep('number', '3'),
      traceStep('number', '4'), traceStep('number', '5')
    ], 'Tracing numbers'),
    makeLesson('b-m9', 'maths', 'More Shapes', '🔷', [
      shapeIntro('heart'), findShape('heart', ['heart', 'circle', 'star']),
      shapeIntro('oval'), findShape('oval', ['oval', 'square', 'circle']),
      shapeIntro('diamond'), findShape('diamond', ['diamond', 'triangle', 'square'])
    ], 'More shapes'),
    makeLesson('b-m10', 'maths', 'Same or Different', '🔍', [
      infoStep('Same or Different', 'Look carefully. Are they the same or different?', '🔍'),
      qStep('Are these the same? 🍎 🍎', ['Same! ✅', 'Different! ❌'], 'Same! ✅', '🍎'),
      qStep('Are these the same? 🐶 🐱', ['Same! ✅', 'Different! ❌'], 'Different! ❌', '🐾'),
      qStep('Are these the same? ⭐ ⭐', ['Same! ✅', 'Different! ❌'], 'Same! ✅', '⭐'),
      qStep('Are these the same? 🔴 🔵', ['Same! ✅', 'Different! ❌'], 'Different! ❌', '🎨')
    ], 'Same and different')
  ],
  science: [
    makeLesson('b-s1', 'science', 'My Body', '🫀', [
      infoStep('Eyes', 'We see with our eyes! 👀', '👀'),
      infoStep('Ears', 'We hear with our ears! 👂', '👂'),
      infoStep('Hands', 'We clap with our hands!', '👏'),
      qStep('What do we see with?', ['👀 Eyes', '👂 Ears', '👃 Nose'], '👀 Eyes', '👀')
    ], 'My body'),
    makeLesson('b-s2', 'science', 'Farm Animals', '🐄', [
      infoStep('Cow', 'The cow says moo!', '🐄'),
      infoStep('Duck', 'The duck says quack!', '🦆'),
      infoStep('Sheep', 'The sheep says baa!', '🐑'),
      { t: 'media', id: 'song-animal-friends', label: 'Sing the Animal Friends song!' },
      qStep('Which animal says moo?', ['🐄', '🦆', '🐑'], '🐄', '🐄')
    ], 'Animals'),
    makeLesson('b-s3', 'science', 'Weather', '🌦️', [
      infoStep('Sun', 'The sun is bright and warm!', '☀️'),
      infoStep('Rain', 'Rain falls from the clouds!', '🌧️'),
      infoStep('Wind', 'The wind blows the leaves!', '🍃'),
      qStep('What is bright and warm?', ['☀️ Sun', '🌧️ Rain', '❄️ Snow'], '☀️ Sun', '☀️')
    ], 'Weather'),
    makeLesson('b-s4', 'science', 'The Dog — Animal Friends', '🐶', [
      infoStep('The Dog', 'The dog says woof woof!', '🐶'),
      { t: 'media', id: 'video-animal-dog', label: 'Watch the Dog video!' },
      { t: 'media', id: 'song-animal-friends', label: 'Sing the Animal Friends song!' },
      qStep('Which animal says woof woof?', ['🐶 Dog', '🐱 Cat', '🐤 Chick'], '🐶 Dog', '🐶'),
      matchStep([['🐶', 'Dog'], ['🐱', 'Cat'], ['🐤', 'Chick']])
    ], 'Animals'),
    makeLesson('b-s5', 'science', 'My Body Parts', '🧒', [
      infoStep('Head', 'This is my head! I think with my head.', '🗣️'),
      infoStep('Arms', 'These are my arms! I hug with my arms.', '💪'),
      infoStep('Legs', 'These are my legs! I walk with my legs.', '🦵'),
      infoStep('Feet', 'These are my feet! I stand on my feet.', '🦶'),
      qStep('What do we walk with?', ['🦶 Feet', '👂 Ears', '👃 Nose'], '🦶 Feet', '🦶')
    ], 'My body'),
    makeLesson('b-s6', 'science', 'Fruits We Eat', '🍎', [
      infoStep('Banana', 'A banana is yellow and sweet!', '🍌'),
      infoStep('Mango', 'A mango is juicy and delicious!', '🥭'),
      infoStep('Apple', 'An apple is crunchy and healthy!', '🍎'),
      infoStep('Orange', 'An orange is round and full of juice!', '🍊'),
      qStep('Which fruit is yellow?', ['🍌 Banana', '🍎 Apple', '🍇 Grapes'], '🍌 Banana', '🍌')
    ], 'Fruits'),
    makeLesson('b-s7', 'science', 'Wash Your Hands', '🧼', [
      infoStep('Clean Hands', 'We wash our hands to stay healthy!', '🧼'),
      infoStep('Before Eating', 'Always wash hands before eating!', '🍽️'),
      infoStep('After Playing', 'Wash your hands after playing outside!', '⚽'),
      { t: 'media', id: 'song-wash-hands', label: 'Sing the Wash Your Hands song!' },
      qStep('When should we wash our hands?', ['🧼 Before eating', '😴 While sleeping', '📺 While watching TV'], '🧼 Before eating', '🧼')
    ], 'Hygiene'),
    makeLesson('b-s8', 'science', 'Animal Sounds', '🔊', [
      infoStep('The Cat', 'The cat says meow!', '🐱'),
      infoStep('The Goat', 'The goat says maa!', '🐐'),
      infoStep('The Pig', 'The pig says oink!', '🐷'),
      infoStep('The Rooster', 'The rooster says cock-a-doodle-doo!', '🐓'),
      qStep('Which animal says meow?', ['🐱 Cat', '🐐 Goat', '🐷 Pig'], '🐱 Cat', '🐱'),
      qStep('Which animal says oink?', ['🐷 Pig', '🐱 Cat', '🐓 Rooster'], '🐷 Pig', '🐷')
    ], 'Animal sounds'),
    makeLesson('b-s9', 'science', 'Day and Night', '🌞', [
      infoStep('Daytime', 'In the daytime, the sun shines and we play!', '☀️'),
      infoStep('Nighttime', 'At night, the moon and stars come out and we sleep!', '🌙'),
      infoStep('Morning', 'In the morning, we wake up and eat breakfast!', '🌅'),
      qStep('When do we sleep?', ['🌙 At night', '☀️ In the day', '🌅 In the morning'], '🌙 At night', '🌙'),
      qStep('When does the sun shine?', ['☀️ In the day', '🌙 At night', '🌧️ In the rain'], '☀️ In the day', '☀️')
    ], 'Day and night')
  ],
  sst: [
    makeLesson('b-sst1', 'sst', 'My Family', '👨‍👩‍👧', [
      infoStep('Mummy', 'Mummy loves me very much!', '👩'),
      infoStep('Daddy', 'Daddy is strong and kind!', '👨'),
      infoStep('Baby', 'The baby is small and cute!', '👶'),
      qStep('Who loves you very much?', ['👩 Mummy', '🚗 Car', '🌳 Tree'], '👩 Mummy', '👩')
    ], 'Family'),
    makeLesson('b-sst2', 'sst', 'My Home', '🏠', [
      infoStep('My House', 'We live in a house. It keeps us safe!', '🏠'),
      infoStep('My Bed', 'We sleep in a soft bed. Good night!', '🛏️'),
      infoStep('My Food', 'We eat yummy food at home!', '🍚'),
      qStep('Where do we sleep?', ['🛏️ Bed', '🚌 Bus', '🌊 Lake'], '🛏️ Bed', '🛏️')
    ], 'Home'),
    makeLesson('b-sst3', 'sst', 'Good Greetings', '👋', [
      infoStep('Hello!', 'We say hello when we meet a friend!', '👋'),
      infoStep('Thank You', 'We say thank you when someone helps us!', '🙏'),
      { t: 'media', id: 'song-good-morning', label: 'Sing the Good Morning song!' },
      qStep('What do we say when we meet a friend?', ['👋 Hello', '😴 Good night', '🍎 Apple'], '👋 Hello', '👋')
    ], 'Greetings'),
    makeLesson('b-sst4', 'sst', 'Please and Sorry', '🙏', [
      infoStep('Please', 'We say please when we want something nicely!', '🙏'),
      infoStep('Sorry', 'We say sorry when we make a mistake!', '😔'),
      infoStep('Excuse Me', 'We say excuse me when we need to pass!', '🚶'),
      qStep('What do we say when we want something nicely?', ['🙏 Please', '😴 Good night', '🏃 Run'], '🙏 Please', '🙏'),
      qStep('What do we say when we make a mistake?', ['😔 Sorry', '🎉 Party', '🍎 Apple'], '😔 Sorry', '😔')
    ], 'Good manners'),
    makeLesson('b-sst5', 'sst', 'Sharing is Caring', '🤝', [
      infoStep('Share Toys', 'We share our toys with friends!', '🧸'),
      infoStep('Share Food', 'We can share our food with others!', '🍞'),
      infoStep('Take Turns', 'We take turns on the swing!', '🎠'),
      qStep('What should we do with our toys?', ['🤝 Share them', '😤 Keep all', '😢 Cry'], '🤝 Share them', '🧸'),
      qStep('What do we do on the swing?', ['🎠 Take turns', '😤 Push others', '😴 Sleep'], '🎠 Take turns', '🎠')
    ], 'Sharing'),
    makeLesson('b-sst6', 'sst', 'My Feelings', '😊', [
      infoStep('Happy', 'I feel happy when I play!', '😊'),
      infoStep('Sad', 'I feel sad when I miss Mummy.', '😢'),
      infoStep('Angry', 'I feel angry when someone takes my toy.', '😠'),
      infoStep('Scared', 'I feel scared in the dark.', '😨'),
      qStep('How do you feel when you play?', ['😊 Happy', '😢 Sad', '😨 Scared'], '😊 Happy', '😊'),
      qStep('How do you feel when you miss Mummy?', ['😢 Sad', '😊 Happy', '😠 Angry'], '😢 Sad', '😢')
    ], 'Emotions'),
    makeLesson('b-sst7', 'sst', 'People at Home', '👨‍👩‍👧‍👦', [
      infoStep('Grandma', 'Grandma tells us lovely stories!', '👵'),
      infoStep('Grandpa', 'Grandpa is wise and kind!', '👴'),
      infoStep('Brother', 'My brother plays with me!', '👦'),
      infoStep('Sister', 'My sister sings with me!', '👧'),
      qStep('Who tells us lovely stories?', ['👵 Grandma', '🚌 Bus driver', '🌳 Tree'], '👵 Grandma', '👵')
    ], 'Family members')
  ],
  creative: [
    makeLesson('b-c1', 'creative', 'Color the Apple', '🍎', [
      infoStep('Let\'s Color!', 'Pick a color and tap the apple to color it!', '🎨'),
      colorStep('apple')
    ], 'Coloring'),
    makeLesson('b-c4', 'creative', 'Red Adventure', '🔴', [
      colorIntro('red'),
      { t: 'media', id: 'video-color-red', label: 'Watch the Red video!' },
      { t: 'media', id: 'song-colors', label: 'Sing the colors song!' },
      findColor('red', ['red', 'blue', 'green']),
      colorStep('apple')
    ], 'Color red adventure'),
    makeLesson('b-c2', 'creative', 'Trace a Circle', '⭕', [
      infoStep('Trace the Circle', 'Use your finger to trace the dotted circle!', '⭕'),
      traceStep('shape', 'circle')
    ], 'Tracing'),
    makeLesson('b-c3', 'creative', 'Shape Matching', '🧩', [
      infoStep('Match the Shapes', 'Tap the shape and its friend!', '🧩'),
      matchStep([['⭕', 'Circle'], ['⬜', 'Square'], ['⭐', 'Star']])
    ], 'Matching'),
    makeLesson('b-c5', 'creative', 'Color the Balloon', '🎈', [
      infoStep('Color the Balloon', 'Pick your favourite color for the balloon!', '🎈'),
      colorStep('balloon')
    ], 'Coloring'),
    makeLesson('b-c6', 'creative', 'Trace Shapes', '✏️', [
      infoStep('Trace the Shapes', 'Follow the dots to make shapes!', '✏️'),
      traceStep('shape', 'circle'), traceStep('shape', 'square'), traceStep('shape', 'triangle')
    ], 'Tracing shapes'),
    makeLesson('b-c7', 'creative', 'Trace Lines', '〰️', [
      infoStep('Trace the Lines', 'Follow the lines with your finger!', '〰️'),
      traceStep('line', 'straight'), traceStep('line', 'wave'), traceStep('line', 'zigzag')
    ], 'Tracing lines'),
    makeLesson('b-c8', 'creative', 'All the Colors', '🌈', [
      colorIntro('red'), colorIntro('blue'), colorIntro('yellow'),
      colorIntro('green'),
      findColor('blue', ['red', 'blue', 'yellow']),
      findColor('yellow', ['green', 'yellow', 'red'])
    ], 'Colors'),
    makeLesson('b-c9', 'creative', 'Color the Fish', '🐠', [
      infoStep('Color the Fish', 'Make the fish colorful!', '🐠'),
      colorStep('fish')
    ], 'Coloring')
  ]
};

/* ============================ MIDDLE CLASS ============================ */
CURRICULUM.middle = {
  english: [
    makeLesson('m-e1', 'english', 'Letters G to L', '🔤', [
      ...letterIntro('G'), ...letterIntro('H'), ...letterIntro('I'),
      findLetter('I', ['I', 'O', 'U']), ...letterIntro('J'), ...letterIntro('K'), ...letterIntro('L'),
      findLetter('L', ['L', 'K', 'J'])
    ], 'Letters'),
    makeLesson('m-e2', 'english', 'Letters M to R', '🔡', [
      ...letterIntro('M'), ...letterIntro('N'), ...letterIntro('O'),
      findLetter('M', ['M', 'N', 'W']), ...letterIntro('P'), ...letterIntro('Q'), ...letterIntro('R'),
      findLetter('Q', ['Q', 'O', 'P'])
    ], 'Letters'),
    makeLesson('m-e3', 'english', 'Simple Words', '📝', [
      wordStep('Dog', '🐶'), wordStep('Cat', '🐱'), wordStep('Sun', '☀️'), wordStep('Hat', '🎩'),
      matchStep([['🐶', 'Dog'], ['🐱', 'Cat'], ['☀️', 'Sun'], ['🎩', 'Hat']])
    ], 'Words'),
    makeLesson('m-e4', 'english', 'Letters S to X', '🔤', [
      ...letterIntro('S'), ...letterIntro('T'), ...letterIntro('U'),
      findLetter('T', ['T', 'U', 'S']),
      ...letterIntro('V'), ...letterIntro('W'), ...letterIntro('X'),
      findLetter('W', ['W', 'V', 'X'])
    ], 'Letters'),
    makeLesson('m-e5', 'english', 'Letters Y and Z', '🔡', [
      ...letterIntro('Y'), ...letterIntro('Z'),
      findLetter('Y', ['Y', 'Z', 'X']),
      findLetter('Z', ['Z', 'Y', 'A']),
      { t: 'media', id: 'song-alphabet', label: 'Sing the full Alphabet Song!' }
    ], 'Letters'),
    makeLesson('m-e6', 'english', 'Uppercase and Lowercase', '🔤', [
      infoStep('Big and Small Letters', 'Every letter has a big (uppercase) and small (lowercase) form!', '🔤'),
      infoStep('A and a', 'Big A and small a are the same letter!', '🅰️'),
      infoStep('B and b', 'Big B and small b are the same letter!', '🅱️'),
      qStep('Which is the small letter for D?', ['d', 'P', 'B'], 'd', '🔤'),
      qStep('Which is the big letter for g?', ['G', 'J', 'Q'], 'G', '🔤')
    ], 'Upper & lowercase'),
    makeLesson('m-e7', 'english', 'Body Part Words', '🧒', [
      wordStep('Eyes', '👀'), wordStep('Nose', '👃'), wordStep('Mouth', '👄'),
      wordStep('Ear', '👂'),
      matchStep([['👀', 'Eyes'], ['👃', 'Nose'], ['👄', 'Mouth'], ['👂', 'Ear']])
    ], 'Body words'),
    makeLesson('m-e8', 'english', 'Missing Letters', '❓', [
      infoStep('Find the Missing Letter', 'What letter is missing?', '❓'),
      qStep('C_T (an animal that says meow)', ['A', 'O', 'U'], 'A', '🐱'),
      qStep('D_G (an animal that says woof)', ['O', 'A', 'E'], 'O', '🐶'),
      qStep('S_N (the bright thing in the sky)', ['U', 'A', 'O'], 'U', '☀️'),
      qStep('B_LL (you kick it)', ['A', 'I', 'U'], 'A', '⚽')
    ], 'Missing letters')
  ],
  maths: [
    makeLesson('m-m1', 'maths', 'Count to 10', '🔢', [
      countStep('🍎', 6, 10), countStep('🌟', 7, 10), countStep('🐤', 8, 10),
      countStep('🌼', 9, 10), countStep('🎈', 10, 10),
      findNumber('Where is the number 10?', 10, 10)
    ], 'Counting'),
    makeLesson('m-m2', 'maths', 'More or Less', '⚖️', [
      infoStep('More or Less', 'Which group has MORE? Tap the bigger group!', '⚖️'),
      compareStep('🍎', 4, '🍌', 2), compareStep('⭐', 2, '🌸', 5), compareStep('🎈', 5, '🐤', 3)
    ], 'Comparing'),
    makeLesson('m-m3', 'maths', 'Shapes All Around', '🔷', [
      shapeIntro('triangle'), findShape('triangle', ['triangle', 'circle', 'square']),
      shapeIntro('star'), findShape('star', ['star', 'circle', 'triangle']),
      shapeIntro('heart'), findShape('heart', ['heart', 'star', 'square'])
    ], 'Shapes'),
    makeLesson('m-m4', 'maths', 'Count the Fruits', '🍎', [
      infoStep('Fruit Counting', 'Count the fruits carefully!', '🍎'),
      countStep('🍌', 6, 10), countStep('🥭', 7, 10), countStep('🍊', 8, 10),
      countStep('🍇', 9, 10), countStep('🍓', 10, 10)
    ], 'Counting fruits'),
    makeLesson('m-m5', 'maths', 'Numbers 6 to 10', '🔢', [
      infoStep('Numbers 6-10', 'Let us learn numbers from 6 to 10!', '🔢'),
      findNumber('Where is the number 6?', 6, 10),
      findNumber('Where is the number 7?', 7, 10),
      findNumber('Where is the number 8?', 8, 10),
      findNumber('Where is the number 9?', 9, 10),
      findNumber('Where is the number 10?', 10, 10)
    ], 'Numbers 6-10'),
    makeLesson('m-m6', 'maths', 'Trace Numbers 4-9', '✏️', [
      infoStep('Trace the Numbers', 'Follow the dots to trace each number!', '✏️'),
      traceStep('number', '4'), traceStep('number', '5'), traceStep('number', '6'),
      traceStep('number', '7'), traceStep('number', '8'), traceStep('number', '9')
    ], 'Tracing numbers'),
    makeLesson('m-m7', 'maths', 'Patterns', '🔴', [
      infoStep('Patterns', 'What comes next in the pattern?', '🧩'),
      patternStep(['🔴', '🔵', '🔴', '🔵'], '🔴'),
      patternStep(['⭐', '🌙', '⭐', '🌙'], '⭐'),
      patternStep(['🍎', '🍌', '🍎', '🍌'], '🍎'),
      patternStep(['🐶', '🐱', '🐶', '🐱'], '🐶')
    ], 'Patterns'),
    makeLesson('m-m8', 'maths', 'Compare: More and Fewer', '⚖️', [
      compareStep('🍎', 7, '🍌', 3),
      compareStep('⭐', 4, '🌸', 8),
      compareStep('🐶', 6, '🐱', 2),
      compareStep('🎈', 3, '🌺', 9)
    ], 'Comparing numbers')
  ],
  science: [
    makeLesson('m-s1', 'science', 'Parts of a Plant', '🌱', [
      infoStep('The Plant', 'A plant has roots, a stem, leaves and flowers!', '🌱'),
      infoStep('Roots', 'Roots hold the plant in the soil.', '🌿'),
      infoStep('Flowers', 'Flowers are bright and beautiful!', '🌸'),
      qStep('What holds the plant in the soil?', ['🌱 Roots', '☀️ Sun', '💧 Water'], '🌱 Roots', '🌱')
    ], 'Plants'),
    makeLesson('m-s2', 'science', 'Seasons & Weather', '🌈', [
      infoStep('Rainy Season', 'In the rainy season, plants grow tall and green!', '🌧️'),
      infoStep('Dry Season', 'In the dry season, the sun shines hot!', '☀️'),
      infoStep('Rainbow', 'After rain, we may see a rainbow!', '🌈'),
      qStep('When do we see a rainbow?', ['🌈 After rain', '🌙 At night', '🍽️ At lunch'], '🌈 After rain', '🌈')
    ], 'Weather'),
    makeLesson('m-s3', 'science', 'Animal Babies', '🐣', [
      infoStep('Puppy', 'A baby dog is called a puppy.', '🐶'),
      infoStep('Kitten', 'A baby cat is called a kitten.', '🐱'),
      infoStep('Chick', 'A baby chicken is called a chick.', '🐤'),
      qStep('What is a baby dog called?', ['🐶 Puppy', '🐱 Kitten', '🐤 Chick'], '🐶 Puppy', '🐶')
    ], 'Animals'),
    makeLesson('m-s4', 'science', 'Domestic Animals', '🏠', [
      infoStep('Dog', 'A dog lives at home. It is a domestic animal.', '🐶'),
      infoStep('Cat', 'A cat lives at home too!', '🐱'),
      infoStep('Chicken', 'Chickens live on the farm.', '🐔'),
      infoStep('Goat', 'Goats live on the farm.', '🐐'),
      qStep('Which animal lives at home?', ['🐶 Dog', '🦁 Lion', '🐘 Elephant'], '🐶 Dog', '🐶'),
      qStep('Which animal lives on the farm?', ['🐐 Goat', '🦁 Lion', '🐍 Snake'], '🐐 Goat', '🐐')
    ], 'Domestic animals'),
    makeLesson('m-s5', 'science', 'What Do Animals Eat?', '🍽️', [
      infoStep('Dog', 'A dog eats meat and bones.', '🐶'),
      infoStep('Cow', 'A cow eats grass.', '🐄'),
      infoStep('Hen', 'A hen eats grains and seeds.', '🐔'),
      infoStep('Fish', 'A fish eats small things in water.', '🐟'),
      qStep('What does a cow eat?', ['🌿 Grass', '🍖 Meat', '🍞 Bread'], '🌿 Grass', '🐄'),
      qStep('What does a hen eat?', ['🌾 Grains', '🍖 Meat', '🍌 Banana'], '🌾 Grains', '🐔')
    ], 'Animal food'),
    makeLesson('m-s6', 'science', 'Brushing Teeth', '🪥', [
      infoStep('Clean Teeth', 'We brush our teeth to keep them clean and strong!', '🪥'),
      infoStep('Morning', 'Brush your teeth every morning!', '🌅'),
      infoStep('Night', 'Brush your teeth before bed!', '🌙'),
      qStep('When should we brush our teeth?', ['🌅 Morning and 🌙 night', '😴 Only when sleeping', '🎮 Only when playing'], '🌅 Morning and 🌙 night', '🪥')
    ], 'Hygiene'),
    makeLesson('m-s7', 'science', 'Clean Water', '💧', [
      infoStep('Clean Water', 'We must drink clean water to stay healthy!', '💧'),
      infoStep('Boil Water', 'We can boil water to make it safe.', '🫖'),
      infoStep('Dirty Water', 'Dirty water can make us sick.', '🤢'),
      qStep('What kind of water should we drink?', ['💧 Clean water', '🤢 Dirty water', '🌊 Lake water'], '💧 Clean water', '💧')
    ], 'Clean water')
  ],
  sst: [
    makeLesson('m-sst1', 'sst', 'My School', '🏫', [
      infoStep('Our School', 'We go to school to learn and play!', '🏫'),
      infoStep('Our Teacher', 'Our teacher helps us to learn.', '👩‍🏫'),
      infoStep('Our Friends', 'We share and play with our friends.', '🧑‍🤝‍🧑'),
      qStep('Who helps us to learn at school?', ['👩‍🏫 Teacher', '🦁 Lion', '🚌 Bus'], '👩‍🏫 Teacher', '👩‍🏫')
    ], 'School'),
    makeLesson('m-sst2', 'sst', 'Community Helpers', '🚒', [
      infoStep('Doctor', 'A doctor makes us better when we are sick.', '👩‍⚕️'),
      infoStep('Farmer', 'A farmer grows food for us.', '👨‍🌾'),
      infoStep('Police Officer', 'A police officer keeps us safe.', '👮'),
      qStep('Who grows food for us?', ['👨‍🌾 Farmer', '👩‍⚕️ Doctor', '🎨 Artist'], '👨‍🌾 Farmer', '👨‍🌾')
    ], 'Helpers'),
    makeLesson('m-sst3', 'sst', 'Good Habits', '🪥', [
      infoStep('Wash Your Hands', 'Wash your hands before eating!', '🧼'),
      infoStep('Brush Your Teeth', 'Brush your teeth every morning!', '🪥'),
      infoStep('Eat Healthy', 'Eat fruits and vegetables to grow strong!', '🥕'),
      { t: 'media', id: 'song-wash-hands', label: 'Sing the Wash Your Hands song!' },
      qStep('When should we wash our hands?', ['🧼 Before eating', '🛏️ After sleeping', '📚 While reading'], '🧼 Before eating', '🧼')
    ], 'Habits'),
    makeLesson('m-sst4', 'sst', 'Community Helpers', '👷', [
      infoStep('Teacher', 'A teacher helps us to learn at school.', '👩‍🏫'),
      infoStep('Doctor', 'A doctor makes us better when we are sick.', '👩‍⚕️'),
      infoStep('Farmer', 'A farmer grows food for us to eat.', '👨‍🌾'),
      infoStep('Police Officer', 'A police officer keeps us safe.', '👮'),
      infoStep('Driver', 'A driver takes us from place to place.', '🚗'),
      qStep('Who helps us learn at school?', ['👩‍🏫 Teacher', '👮 Police', '🚗 Driver'], '👩‍🏫 Teacher', '👩‍🏫'),
      qStep('Who grows food for us?', ['👨‍🌾 Farmer', '👮 Police', '🚗 Driver'], '👨‍🌾 Farmer', '👨‍🌾')
    ], 'Community helpers'),
    makeLesson('m-sst5', 'sst', 'Ways of Transport', '🚌', [
      infoStep('Bicycle', 'A bicycle has two wheels. We pedal it!', '🚲'),
      infoStep('Boda Boda', 'A boda boda is a motorcycle taxi.', '🛵'),
      infoStep('Bus', 'A bus carries many people.', '🚌'),
      infoStep('Car', 'A car takes us from place to place.', '🚗'),
      qStep('Which has two wheels?', ['🚲 Bicycle', '🚌 Bus', '🚗 Car'], '🚲 Bicycle', '🚲'),
      qStep('Which carries many people?', ['🚌 Bus', '🚲 Bicycle', '🛵 Boda boda'], '🚌 Bus', '🚌')
    ], 'Transport'),
    makeLesson('m-sst6', 'sst', 'Road Safety', '🚦', [
      infoStep('Look Both Ways', 'Always look left and right before crossing!', '👀'),
      infoStep('Zebra Crossing', 'Cross the road at the zebra crossing!', '🦓'),
      infoStep('Traffic Lights', 'Red means stop, green means go!', '🚦'),
      qStep('What does a RED traffic light mean?', ['🛑 Stop', '🏃 Go', '💤 Sleep'], '🛑 Stop', '🚦'),
      qStep('Where should we cross the road?', ['🦓 Zebra crossing', '🌳 Anywhere', '🚗 In the middle'], '🦓 Zebra crossing', '🦓')
    ], 'Road safety')
  ],
  creative: [
    makeLesson('m-c1', 'creative', 'Color the Flower', '🌸', [
      infoStep('Let\'s Color!', 'Color the flower however you like!', '🎨'),
      colorStep('flower')
    ], 'Coloring'),
    makeLesson('m-c2', 'creative', 'Trace Numbers 1-3', '✏️', [
      infoStep('Trace the Numbers', 'Trace each dotted number!', '✏️'),
      traceStep('number', '1'), traceStep('number', '2'), traceStep('number', '3')
    ], 'Tracing'),
    makeLesson('m-c3', 'creative', 'Color Matching', '🎨', [
      infoStep('Match the Colors', 'Tap the color and its name!', '🎨'),
      { t: 'media', id: 'song-colors', label: 'Sing the colors song!' },
      matchStep([['🔴', 'Red'], ['🔵', 'Blue'], ['🟢', 'Green'], ['🟡', 'Yellow']])
    ], 'Matching'),
    makeLesson('m-c4', 'creative', 'Color the House', '🏠', [
      infoStep('Color the House', 'Give the house a happy paint job!', '🏠'),
      colorStep('house')
    ], 'Coloring'),
    makeLesson('m-c5', 'creative', 'Trace Letters D-F', '✏️', [
      infoStep('Trace the Letters', 'Follow the dots carefully!', '✏️'),
      traceStep('letter', 'D'), traceStep('letter', 'E'), traceStep('letter', 'F')
    ], 'Tracing letters'),
    makeLesson('m-c6', 'creative', 'Trace Numbers 4-6', '🔢', [
      infoStep('Trace the Numbers', 'Follow the dotted paths!', '✏️'),
      traceStep('number', '4'), traceStep('number', '5'), traceStep('number', '6')
    ], 'Tracing numbers'),
    makeLesson('m-c7', 'creative', 'Color the Butterfly', '🦋', [
      infoStep('Color the Butterfly', 'Make the butterfly beautiful!', '🦋'),
      colorStep('butterfly')
    ], 'Coloring'),
    makeLesson('m-c8', 'creative', 'More Colors', '🌈', [
      colorIntro('orange'), colorIntro('purple'), colorIntro('pink'), colorIntro('brown'),
      findColor('orange', ['orange', 'red', 'purple']),
      findColor('pink', ['pink', 'purple', 'brown'])
    ], 'More colors')
  ]
};

/* ============================ TOP CLASS ============================ */
CURRICULUM.top = {
  english: [
    makeLesson('t-e1', 'english', 'All Letters A–Z', '🔤', [
      ...letterIntro('S'), ...letterIntro('T'), ...letterIntro('U'),
      ...letterIntro('V'), ...letterIntro('W'), ...letterIntro('X'),
      ...letterIntro('Y'), ...letterIntro('Z'), findLetter('Z', ['Z', 'S', 'X'])
    ], 'Letters'),
    makeLesson('t-e2', 'english', 'Three-Letter Words', '📖', [
      wordStep('Cat', '🐱'), wordStep('Bat', '🦇'), wordStep('Dog', '🐶'),
      wordStep('Run', '🏃'), matchStep([['🐱', 'Cat'], ['🦇', 'Bat'], ['🐶', 'Dog'], ['🏃', 'Run']]),
      qStep('Which word says cat?', ['Cat', 'Bat', 'Run'], 'Cat', '🐱')
    ], 'Words'),
    makeLesson('t-e3', 'english', 'My First Reading', '📚', [
      readStep('The cat sat on the mat.', '🐱'),
      qStep('Where did the cat sit?', ['On the mat', 'In the tree', 'In the water'], 'On the mat', '🐱'),
      readStep('A dog ran to the sun.', '🐶'),
      qStep('What ran to the sun?', ['A cat', 'A dog', 'A hen'], 'A dog', '🐶')
    ], 'Reading'),
    makeLesson('t-e4', 'english', 'Phonics: Beginning Sounds', '🔊', [
      infoStep('Beginning Sounds', 'Every word starts with a sound!', '🔊'),
      qStep('What sound does Ball start with?', ['B', 'M', 'S'], 'B', '⚽'),
      qStep('What sound does Dog start with?', ['D', 'T', 'P'], 'D', '🐶'),
      qStep('What sound goes with Cat?', ['C says kuh', 'M says mmm', 'S says sss'], 'C says kuh', '🐱'),
      qStep('What sound does Sun start with?', ['S', 'C', 'Z'], 'S', '☀️')
    ], 'Beginning sounds'),
    makeLesson('t-e5', 'english', 'CVC Words: -at Family', '📖', [
      infoStep('The -at Family', 'Cat, bat, hat, mat — they all end in -at!', '🐱'),
      wordStep('Cat', '🐱'), wordStep('Bat', '🦇'), wordStep('Hat', '🎩'), wordStep('Mat', '🟫'),
      readStep('The cat sat on the mat with a hat.', '🐱'),
      qStep('Which word rhymes with cat?', ['Hat', 'Dog', 'Sun'], 'Hat', '🎩')
    ], 'Word families'),
    makeLesson('t-e6', 'english', 'CVC Words: -an Family', '📖', [
      infoStep('The -an Family', 'Man, van, fan, can — they all end in -an!', '👨'),
      wordStep('Man', '👨'), wordStep('Van', '🚐'), wordStep('Fan', '🌀'), wordStep('Can', '🥫'),
      readStep('The man has a van and a fan.', '👨'),
      qStep('Which word rhymes with man?', ['Van', 'Dog', 'Red'], 'Van', '🚐')
    ], 'Word families'),
    makeLesson('t-e7', 'english', 'Reading: Short Stories', '📚', [
      readStep('The hen has a nest. The nest is in the tree. The hen sits on eggs.', '🐔'),
      qStep('Where is the nest?', ['In the tree', 'In the water', 'On the road'], 'In the tree', '🌳'),
      qStep('What does the hen sit on?', ['Eggs', 'Stones', 'Leaves'], 'Eggs', '🥚'),
      readStep('Tom has a big red ball. He plays with it in the sun. He is happy.', '⚽'),
      qStep('What does Tom have?', ['A big red ball', 'A blue kite', 'A yellow hat'], 'A big red ball', '⚽')
    ], 'Reading comprehension')
  ],
  maths: [
    makeLesson('t-m1', 'maths', 'Count to 20', '🔢', [
      countStep('⭐', 11, 15), countStep('🎈', 13, 15), countStep('🍓', 15, 15),
      findNumber('Where is the number 12?', 12, 15), findNumber('Where is the number 20?', 20, 20)
    ], 'Counting'),
    makeLesson('t-m2', 'maths', 'Adding with Pictures', '➕', [
      infoStep('Adding', 'Adding means putting things together!', '➕'),
      mathStep(2, 3, '+', '🍎'), mathStep(4, 2, '+', '⭐'), mathStep(3, 3, '+', '🐤'),
      mathStep(5, 2, '+', '🌸')
    ], 'Addition'),
    makeLesson('t-m3', 'maths', 'Shapes & Patterns', '🧩', [
      shapeIntro('rectangle'), shapeIntro('oval'), shapeIntro('diamond'),
      patternStep(['🔴', '🔵', '🔴', '🔵'], '🔴'),
      patternStep(['⭐', '⭐', '🌙', '⭐', '⭐'], '🌙')
    ], 'Shapes & patterns'),
    makeLesson('t-m4', 'maths', 'Numbers 21 to 50', '🔢', [
      infoStep('Counting On', 'Let us count from 21 to 50!', '🔢'),
      findNumber('Where is the number 25?', 25, 50),
      findNumber('Where is the number 30?', 30, 50),
      findNumber('Where is the number 40?', 40, 50),
      findNumber('Where is the number 50?', 50, 50),
      orderStep([22, 25, 23, 24], 'Tap these numbers in order!')
    ], 'Numbers 21-50'),
    makeLesson('t-m5', 'maths', 'Taking Away', '➖', [
      infoStep('Subtraction', 'Taking away makes the number smaller!', '➖'),
      mathStep(5, 2, '-', '🍎'), mathStep(7, 3, '-', '⭐'), mathStep(6, 4, '-', '🎈'),
      mathStep(8, 5, '-', '🐤'), mathStep(9, 3, '-', '🌸')
    ], 'Subtraction'),
    makeLesson('t-m6', 'maths', 'Counting by Tens', '🔢', [
      infoStep('Skip Counting', '10, 20, 30, 40, 50, 60, 70, 80, 90, 100!', '🔢'),
      qStep('What comes after 30?', ['40', '31', '50'], '40', '🔢'),
      qStep('What comes after 70?', ['80', '71', '90'], '80', '🔢'),
      qStep('What comes after 50?', ['60', '51', '70'], '60', '🔢'),
      findNumber('Where is the number 100?', 100, 100)
    ], 'Skip counting'),
    makeLesson('t-m7', 'maths', 'Telling Time', '🕐', [
      infoStep('The Clock', 'A clock tells us the time!', '🕐'),
      infoStep('O\'clock', 'When the big hand points to 12, we say o\'clock.', '🕐'),
      infoStep('Morning', 'In the morning it is bright. We go to school!', '🌅'),
      infoStep('Evening', 'In the evening the sun goes down.', '🌇'),
      qStep('When do we go to school?', ['🌅 In the morning', '🌙 At midnight', '🌇 In the evening'], '🌅 In the morning', '🌅'),
      qStep('What tells us the time?', ['🕐 A clock', '📚 A book', '🍎 An apple'], '🕐 A clock', '🕐')
    ], 'Time'),
    makeLesson('t-m8', 'maths', 'Days of the Week', '📅', [
      infoStep('Seven Days', 'There are seven days in a week!', '📅'),
      infoStep('Monday to Friday', 'Monday, Tuesday, Wednesday, Thursday, Friday — we go to school!', '🏫'),
      infoStep('Saturday & Sunday', 'Saturday and Sunday are the weekend. We rest and play!', '🎉'),
      qStep('How many days are in a week?', ['7', '5', '10'], '7', '📅'),
      qStep('Which days are the weekend?', ['Saturday and Sunday', 'Monday and Tuesday', 'Wednesday and Thursday'], 'Saturday and Sunday', '🎉')
    ], 'Days of the week')
  ],
  science: [
    makeLesson('t-s1', 'science', 'My Five Senses', '👃', [
      infoStep('See', 'We see with our eyes!', '👀'),
      infoStep('Hear', 'We hear with our ears!', '👂'),
      infoStep('Smell', 'We smell with our nose!', '👃'),
      infoStep('Taste', 'We taste with our tongue!', '👅'),
      infoStep('Touch', 'We touch with our hands!', '✋'),
      { t: 'media', id: 'song-body', label: 'Sing the My Body song!' },
      qStep('What do we smell with?', ['👃 Nose', '👀 Eyes', '👂 Ears'], '👃 Nose', '👃')
    ], 'Senses'),
    makeLesson('t-s2', 'science', 'Living & Non-living', '🌳', [
      infoStep('Living Things', 'Living things grow, eat and move!', '🌱'),
      infoStep('Non-living Things', 'Non-living things do not grow.', '🪨'),
      qStep('Which one is a living thing?', ['🌳 Tree', '🪨 Stone', '🚗 Car'], '🌳 Tree', '🌳'),
      qStep('Which one is NOT living?', ['🐶 Dog', '🪨 Stone', '🌸 Flower'], '🪨 Stone', '🪨')
    ], 'Living things'),
    makeLesson('t-s3', 'science', 'Animal Homes', '🦁', [
      infoStep('Lion', 'The lion lives in the savannah.', '🦁'),
      infoStep('Fish', 'The fish lives in the water.', '🐟'),
      infoStep('Bird', 'The bird lives in a nest.', '🐦'),
      qStep('Where does a fish live?', ['💧 In water', '🌳 In a tree', '🏠 In a house'], '💧 In water', '🐟')
    ], 'Habitats'),
    makeLesson('t-s4', 'science', 'Food We Eat', '🍽️', [
      infoStep('Fruits', 'Mangoes, bananas and oranges are fruits!', '🍌'),
      infoStep('Vegetables', 'Tomatoes, carrots and beans are vegetables!', '🥕'),
      infoStep('Grains', 'Rice, maize and millet are grains!', '🌾'),
      infoStep('Healthy Food', 'Fruits and vegetables keep us strong!', '💪'),
      qStep('Which is a fruit?', ['🥭 Mango', '🥕 Carrot', '🍚 Rice'], '🥭 Mango', '🥭'),
      qStep('Which is a vegetable?', ['🥕 Carrot', '🍌 Banana', '🍚 Rice'], '🥕 Carrot', '🥕')
    ], 'Food groups'),
    makeLesson('t-s5', 'science', 'Safety at Home', '🏠', [
      infoStep('Hot Things', 'Do not touch hot pots and fire!', '🔥'),
      infoStep('Sharp Things', 'Do not play with knives or blades!', '🔪'),
      infoStep('Electricity', 'Do not touch wires or sockets!', '⚡'),
      infoStep('Medicines', 'Never take medicine without an adult!', '💊'),
      qStep('Should we touch hot pots?', ['🔥 No!', '✅ Yes', '🤷 Maybe'], '🔥 No!', '🔥'),
      qStep('Should we play with knives?', ['🔪 No!', '✅ Yes', '🤷 Maybe'], '🔪 No!', '🔪')
    ], 'Home safety'),
    makeLesson('t-s6', 'science', 'Safety with Strangers', '🚸', [
      infoStep('Stay with Family', 'Always stay close to your family or teacher.', '👨‍👩‍👧'),
      infoStep('Do Not Follow Strangers', 'Never go with someone you do not know.', '🚫'),
      infoStep('Tell an Adult', 'If someone makes you feel scared, tell a trusted adult!', '👩‍🏫'),
      qStep('Should you go with a stranger?', ['🚫 No!', '✅ Yes', '🤷 Maybe'], '🚫 No!', '🚫'),
      qStep('If you feel scared, what should you do?', ['👩‍🏫 Tell a trusted adult', '😢 Cry alone', '🏃 Run away'], '👩‍🏫 Tell a trusted adult', '👩‍🏫')
    ], 'Stranger safety'),
    makeLesson('t-s7', 'science', 'Parts of a Plant', '🌱', [
      infoStep('Roots', 'Roots hold the plant and drink water from the soil.', '🌿'),
      infoStep('Stem', 'The stem carries water up to the leaves.', '🌾'),
      infoStep('Leaves', 'Leaves make food for the plant using sunlight.', '🍃'),
      infoStep('Flowers', 'Flowers are beautiful and can become fruits.', '🌸'),
      infoStep('Fruits', 'Fruits have seeds inside. Seeds grow into new plants!', '🍎'),
      qStep('What holds the plant in the soil?', ['🌿 Roots', '🌸 Flowers', '🍎 Fruits'], '🌿 Roots', '🌿'),
      qStep('What makes food for the plant?', ['🍃 Leaves', '🌿 Roots', '🌾 Stem'], '🍃 Leaves', '🍃')
    ], 'Plants')
  ],
  sst: [
    makeLesson('t-sst1', 'sst', 'Our Country Uganda', '🇺🇬', [
      infoStep('Uganda', 'We live in Uganda. Uganda is in Africa!', '🇺🇬'),
      infoStep('Our Flag', 'Our flag has black, yellow and red.', '🇺🇬'),
      infoStep('Our Capital', 'Kampala is the capital city of Uganda.', '🏙️'),
      qStep('What is the capital city of Uganda?', ['Kampala', 'Nairobi', 'London'], 'Kampala', '🏙️')
    ], 'Uganda'),
    makeLesson('t-sst2', 'sst', 'Ways of Transport', '🚌', [
      infoStep('Boda Boda', 'A boda boda carries people on the road.', '🛵'),
      infoStep('Bus', 'A bus carries many people.', '🚌'),
      infoStep('Bicycle', 'A bicycle has two wheels.', '🚲'),
      qStep('Which one has two wheels?', ['🚲 Bicycle', '🚌 Bus', '✈️ Aeroplane'], '🚲 Bicycle', '🚲')
    ], 'Transport'),
    makeLesson('t-sst3', 'sst', 'Our District', '🗺️', [
      infoStep('Our Home Area', 'We live in a district. Kampala is one district!', '🏘️'),
      infoStep('The Market', 'People buy and sell food at the market.', '🛒'),
      infoStep('The Mosque & Church', 'People pray in churches and mosques.', '🕌'),
      qStep('Where do people buy food?', ['🛒 At the market', '🌳 In the forest', '🚌 On the bus'], '🛒 At the market', '🛒')
    ], 'Our area'),
    makeLesson('t-sst4', 'sst', 'Land, Water and Air Transport', '✈️', [
      infoStep('Land Transport', 'Cars, buses, bicycles and boda bodas travel on land.', '🚗'),
      infoStep('Water Transport', 'Boats and ships travel on water.', '🚢'),
      infoStep('Air Transport', 'Aeroplanes and helicopters fly in the air.', '✈️'),
      qStep('Which travels on water?', ['🚢 Boat', '🚗 Car', '✈️ Aeroplane'], '🚢 Boat', '🚢'),
      qStep('Which flies in the air?', ['✈️ Aeroplane', '🚗 Car', '🚢 Boat'], '✈️ Aeroplane', '✈️'),
      qStep('A boda boda travels on...?', ['🛣️ Land', '💧 Water', '☁️ Air'], '🛣️ Land', '🛵')
    ], 'Transport types'),
    makeLesson('t-sst5', 'sst', 'Caring for Our Environment', '🌍', [
      infoStep('Clean Environment', 'A clean environment keeps us healthy!', '✨'),
      infoStep('Rubbish', 'Put rubbish in the bin, not on the ground!', '🗑️'),
      infoStep('Plant Trees', 'Trees give us clean air and shade.', '🌳'),
      qStep('Where should we put rubbish?', ['🗑️ In the bin', '🌊 In the river', '🛣️ On the road'], '🗑️ In the bin', '🗑️'),
      qStep('Why should we plant trees?', ['🌳 For clean air and shade', '🎮 For games', '📺 For TV'], '🌳 For clean air and shade', '🌳')
    ], 'Environment'),
    makeLesson('t-sst6', 'sst', 'My Feelings and Emotions', '😊', [
      infoStep('Happy', 'I feel happy when I learn something new!', '😊'),
      infoStep('Sad', 'I feel sad when a friend is hurt.', '😢'),
      infoStep('Angry', 'I feel angry when someone is unkind.', '😠'),
      infoStep('Excited', 'I feel excited when we go on a trip!', '🤩'),
      infoStep('Scared', 'I feel scared when I hear loud thunder.', '😨'),
      qStep('How do you feel when you learn something new?', ['😊 Happy', '😢 Sad', '😨 Scared'], '😊 Happy', '😊'),
      qStep('How do you feel when a friend is hurt?', ['😢 Sad', '😊 Happy', '🤩 Excited'], '😢 Sad', '😢')
    ], 'Emotions')
  ],
  creative: [
    makeLesson('t-c1', 'creative', 'Color the Butterfly', '🦋', [
      infoStep('Color the Butterfly', 'Make the butterfly beautiful!', '🦋'),
      colorStep('butterfly')
    ], 'Coloring'),
    makeLesson('t-c2', 'creative', 'Trace Letters A–C', '✏️', [
      infoStep('Trace the Letters', 'Follow the dots carefully!', '✏️'),
      traceStep('letter', 'A'), traceStep('letter', 'B'), traceStep('letter', 'C')
    ], 'Tracing'),
    makeLesson('t-c3', 'creative', 'Tracing Lines', '〰️', [
      infoStep('Trace the Lines', 'Trace the wavy lines!', '〰️'),
      traceStep('line', 'wave'), traceStep('line', 'zigzag'), traceStep('line', 'spiral')
    ], 'Lines'),
    makeLesson('t-c4', 'creative', 'Color the Tree', '🌳', [
      infoStep('Color the Tree', 'A happy tree for a happy world!', '🌳'),
      colorStep('tree')
    ], 'Coloring'),
    makeLesson('t-c5', 'creative', 'Trace Letters D-F', '✏️', [
      infoStep('Trace the Letters', 'Follow the dots carefully!', '✏️'),
      traceStep('letter', 'D'), traceStep('letter', 'E'), traceStep('letter', 'F')
    ], 'Tracing letters'),
    makeLesson('t-c6', 'creative', 'Trace Numbers 4-9', '🔢', [
      infoStep('Trace the Numbers', 'Follow the dotted paths!', '✏️'),
      traceStep('number', '4'), traceStep('number', '5'), traceStep('number', '6'),
      traceStep('number', '7'), traceStep('number', '8'), traceStep('number', '9')
    ], 'Tracing numbers'),
    makeLesson('t-c7', 'creative', 'Shape Patterns', '🧩', [
      infoStep('Pattern Fun', 'What shape comes next?', '🧩'),
      patternStep(['🔴', '🔵', '🔴', '🔵'], '🔴'),
      patternStep(['⭐', '⭐', '🌙', '⭐', '⭐'], '🌙'),
      patternStep(['🟩', '🟨', '🟩', '🟨'], '🟩')
    ], 'Patterns'),
    makeLesson('t-c8', 'creative', 'Color the House', '🏠', [
      infoStep('Color the House', 'Give the house a happy paint job!', '🏠'),
      colorStep('house')
    ], 'Coloring')
  ]
};

/* ============================ PRIMARY 1 ============================ */
CURRICULUM.p1 = {
  english: [
    makeLesson('p1-e1', 'english', 'Letter Sounds', '🔤', [
      infoStep('Sounds Make Words', 'Words are made of sounds!', '🔤'),
      ...letterIntro('B'), ...letterIntro('M'),
      qStep('Which word begins with the letter B?', ['🍌 Banana', '🍎 Apple', '🥭 Mango'], '🍌 Banana', '🍌'),
      ...letterIntro('S'),
      qStep('Which word begins with the letter S?', ['☀️ Sun', '🐘 Elephant', '🦁 Lion'], '☀️ Sun', '☀️')
    ], 'Phonics'),
    makeLesson('p1-e2', 'english', 'Word Families', '📖', [
      infoStep('The -at Family', 'Cat, bat, hat and mat all end with -at!', '🐱'),
      wordStep('Cat', '🐱'), wordStep('Bat', '🦇'), wordStep('Hat', '🎩'),
      qStep('Which word belongs to the -at family?', ['Bat', 'Sun', 'Dog'], 'Bat', '🦇'),
      readStep('The bat and the cat sat on the mat.', '🦇'),
      qStep('Who sat on the mat?', ['The bat and cat', 'The dog and hen', 'The cow and pig'], 'The bat and cat', '🦇')
    ], 'Word families'),
    makeLesson('p1-e3', 'english', 'Read & Answer', '📚', [
      readStep('Tom has a red ball. He plays with it in the sun.', '⚽'),
      qStep('What does Tom have?', ['A red ball', 'A blue kite', 'A yellow hat'], 'A red ball', '⚽'),
      readStep('The hen is on the nest. The eggs are warm.', '🐔'),
      qStep('Where are the eggs?', ['In the nest', 'In the water', 'In the car'], 'In the nest', '🐔')
    ], 'Reading')
  ],
  maths: [
    makeLesson('p1-m1', 'maths', 'Numbers to 50', '🔢', [
      infoStep('Counting On', 'Let\'s count by tens: 10, 20, 30, 40, 50!', '🔢'),
      findNumber('Where is the number 20?', 20, 20),
      findNumber('Where is the number 35?', 35, 50),
      orderStep([15, 17, 16], 'Tap these numbers in order!'),
      countStep('⭐', 18, 20)
    ], 'Numbers'),
    makeLesson('p1-m2', 'maths', 'Adding to 10', '➕', [
      infoStep('Adding Together', 'Put the groups together and count!', '➕'),
      mathStep(3, 4, '+', '🍎'), mathStep(5, 3, '+', '⭐'), mathStep(6, 2, '+', '🐤'),
      mathStep(4, 5, '+', '🌸'), mathStep(7, 3, '+', '🍓')
    ], 'Addition'),
    makeLesson('p1-m3', 'maths', 'Taking Away', '➖', [
      infoStep('Taking Away', 'Taking away makes the number smaller!', '➖'),
      mathStep(5, 2, '-', '🍎'), mathStep(7, 3, '-', '⭐'), mathStep(9, 4, '-', '🎈'),
      mathStep(8, 5, '-', '🐤')
    ], 'Subtraction'),
    makeLesson('p1-m4', 'maths', 'Shapes & Patterns', '🔷', [
      shapeIntro('moon'), shapeIntro('diamond'),
      patternStep(['🟩', '🟨', '🟩', '🟨'], '🟩'),
      patternStep(['🔺', '🔻', '🔺', '🔻'], '🔺'),
      compareStep('🍎', 8, '🍌', 5)
    ], 'Shapes')
  ],
  science: [
    makeLesson('p1-s1', 'science', 'Plants & Growth', '🌱', [
      infoStep('A Seed', 'A seed grows into a plant!', '🌰'),
      infoStep('What Plants Need', 'Plants need water, sunlight and air.', '🌞'),
      qStep('What do plants need?', ['💧 Water and ☀️ sun', '🍬 Sweets', '🧊 Ice'], '💧 Water and ☀️ sun', '🌱'),
      infoStep('The Banana Plant', 'Bananas grow in bunches on big plants!', '🍌'),
      qStep('Where do bananas grow?', ['On big plants', 'Under the ground', 'In the river'], 'On big plants', '🍌')
    ], 'Plants'),
    makeLesson('p1-s2', 'science', 'Materials', '🧱', [
      infoStep('Wood', 'Wood comes from trees. Chairs can be made of wood.', '🪵'),
      infoStep('Metal', 'Metal is strong. Pans and keys are made of metal.', '🔑'),
      infoStep('Plastic', 'Plastic is light. Buckets can be made of plastic.', '🪣'),
      qStep('What can be made of wood?', ['🪑 A chair', '🍞 Bread', '💧 Water'], '🪑 A chair', '🪵'),
      qStep('What is strong and used for keys?', ['Metal', 'Paper', 'Cotton'], 'Metal', '🔑')
    ], 'Materials'),
    makeLesson('p1-s3', 'science', 'Our Bodies', '🦴', [
      infoStep('Bones', 'Our bones give our body shape and strength.', '🦴'),
      infoStep('Heart', 'Our heart beats all the time, even when we sleep!', '❤️'),
      infoStep('Lungs', 'We breathe with our lungs.', '🫁'),
      qStep('What beats all the time?', ['❤️ The heart', '👀 The eyes', '🦶 The feet'], '❤️ The heart', '❤️'),
      qStep('What do we breathe with?', ['🫁 Lungs', '👂 Ears', '🦷 Teeth'], '🫁 Lungs', '🫁')
    ], 'My body')
  ],
  sst: [
    makeLesson('p1-sst1', 'sst', 'Our School', '🏫', [
      infoStep('School Rules', 'We line up, listen and share at school.', '🏫'),
      infoStep('School People', 'The head teacher, teachers and pupils work together.', '👩‍🏫'),
      qStep('Who leads our school?', ['👩‍🏫 The head teacher', '🚗 The driver', '🌳 The tree'], '👩‍🏫 The head teacher', '🏫'),
      infoStep('Classrooms', 'We learn our lessons in classrooms.', '📚'),
      qStep('Where do we learn our lessons?', ['📚 In classrooms', '🌊 In the lake', '🛒 At the market'], '📚 In classrooms', '📚')
    ], 'School'),
    makeLesson('p1-sst2', 'sst', 'Our Home & Family', '🏠', [
      infoStep('Family Members', 'A family has parents, children, grandparents and more!', '👨‍👩‍👧‍👦'),
      infoStep('Helping at Home', 'We can help by sweeping and fetching water.', '🧹'),
      qStep('How can we help at home?', ['🧹 Sweeping', '😴 Sleeping all day', '🙈 Hiding'], '🧹 Sweeping', '🏠'),
      qStep('Who are our parents\' parents?', ['👵 Grandparents', '👧 Sisters', '🐔 Hens'], '👵 Grandparents', '👨‍👩‍👧‍👦')
    ], 'Family'),
    makeLesson('p1-sst3', 'sst', 'Our Country Uganda', '🇺🇬', [
      infoStep('Uganda', 'Uganda is our country. It is called the Pearl of Africa!', '🇺🇬'),
      infoStep('The Flag', 'Black, yellow and red are on our flag.', '🇺🇬'),
      infoStep('Kampala', 'Kampala is the capital city, near Lake Victoria.', '🏙️'),
      qStep('What is Uganda called?', ['The Pearl of Africa', 'The Land of Snow', 'The Big Island'], 'The Pearl of Africa', '🇺🇬'),
      qStep('Which lake is near Kampala?', ['🌊 Lake Victoria', '🌊 Lake Chad', '🌊 Lake Toba'], '🌊 Lake Victoria', '🏙️')
    ], 'Uganda')
  ],
  creative: [
    makeLesson('p1-c1', 'creative', 'Color the House', '🏠', [
      infoStep('Color the House', 'Give the house a happy paint job!', '🏠'),
      colorStep('house')
    ], 'Coloring'),
    makeLesson('p1-c2', 'creative', 'Trace Numbers 1–5', '✏️', [
      infoStep('Trace the Numbers', 'Start at the dot and follow the path!', '✏️'),
      traceStep('number', '4'), traceStep('number', '5'), traceStep('shape', 'star')
    ], 'Tracing'),
    makeLesson('p1-c3', 'creative', 'Shape Art', '🖼️', [
      infoStep('Build a Picture', 'Use shapes to build your own picture on the canvas!', '🖼️'),
      { t: 'shapeArt' }
    ], 'Shape art')
  ]
};

/* ============================ PRIMARY 2 ============================ */
CURRICULUM.p2 = {
  english: [
    makeLesson('p2-e1', 'english', 'Reading: The Little Bird', '📖', [
      readStep('A little bird sat on a tree. It sang a sweet song. The children smiled and listened.', '🐦'),
      qStep('Where did the bird sit?', ['On a tree', 'In a car', 'On a roof'], 'On a tree', '🐦'),
      qStep('What did the bird do?', ['It sang a song', 'It went to school', 'It ate a mango'], 'It sang a song', '🐦'),
      qStep('How did the children feel?', ['Happy — they smiled', 'Sad — they cried', 'Sleepy — they yawned'], 'Happy — they smiled', '😊')
    ], 'Reading'),
    makeLesson('p2-e2', 'english', 'Naming Words', '📝', [
      infoStep('Naming Words', 'Naming words name things, like dog, tree and Amina.', '🏷️'),
      qStep('Which one is a naming word?', ['🪁 Kite', 'Run', 'Happy'], '🪁 Kite', '🏷️'),
      qStep('Which one is a naming word?', ['🐘 Elephant', 'Jump', 'Quickly'], '🐘 Elephant', '🏷️'),
      qStep('Which one is a naming word?', ['Sleep', '🍌 Banana', 'Slow'], '🍌 Banana', '🏷️')
    ], 'Grammar'),
    makeLesson('p2-e3', 'english', 'Spelling & Writing', '✍️', [
      infoStep('Spell It!', 'Listen to the word, then pick the correct spelling!', '✍️'),
      qStep('How do we spell the animal that barks?', ['Dog', 'Dug', 'Dag'], 'Dog', '🐶'),
      qStep('How do we spell the big grey animal with a trunk?', ['Elefant', 'Elephant', 'Elefent'], 'Elephant', '🐘'),
      qStep('How do we spell the fruit that is red and sweet?', ['Appel', 'Aple', 'Apple'], 'Apple', '🍎'),
      readStep('I like apples. They are sweet and red.', '🍎')
    ], 'Spelling')
  ],
  maths: [
    makeLesson('p2-m1', 'maths', 'Numbers to 100', '🔢', [
      infoStep('Counting by Tens', '10, 20, 30, 40, 50, 60, 70, 80, 90, 100!', '🔢'),
      findNumber('Where is the number 50?', 50, 100),
      findNumber('Where is the number 75?', 75, 100),
      orderStep([40, 45, 43, 41], 'Tap the numbers in order!'),
      countStep('⭐', 26, 30)
    ], 'Numbers'),
    makeLesson('p2-m2', 'maths', 'Adding & Subtracting to 20', '➕', [
      mathStep(9, 6, '+', '🍎'), mathStep(12, 5, '+', '⭐'), mathStep(15, 4, '+', '🎈'),
      mathStep(14, 6, '-', '🍓'), mathStep(17, 8, '-', '🐤'), mathStep(13, 7, '-', '🌸')
    ], 'Add & subtract'),
    makeLesson('p2-m3', 'maths', 'Groups of (Multiplication)', '✖️', [
      infoStep('Groups Of', '2 groups of 3 apples is 6 apples. 2 × 3 = 6!', '🍎'),
      mathStep(2, 3, '×', '🍎'), mathStep(3, 2, '×', '⭐'), mathStep(2, 5, '×', '🎈'),
      mathStep(4, 2, '×', '🐤'), mathStep(5, 2, '×', '🍓')
    ], 'Multiplication'),
    makeLesson('p2-m4', 'maths', 'Money — Shillings', '💵', [
      infoStep('Ugandan Shillings', 'We use shillings to buy things in Uganda.', '💵'),
      qStep('How much is 1000 + 500 shillings?', ['1500 shillings', '500 shillings', '2000 shillings'], '1500 shillings', '💵'),
      qStep('A mango costs 1000 shillings. You pay 2000. What is your change?', ['1000 shillings', '2000 shillings', '500 shillings'], '1000 shillings', '🥭'),
      qStep('How much is 500 + 500 shillings?', ['1000 shillings', '500 shillings', '1500 shillings'], '1000 shillings', '💵')
    ], 'Money')
  ],
  science: [
    makeLesson('p2-s1', 'science', 'Life Cycles', '🦋', [
      infoStep('Butterfly Life Cycle', 'Egg → caterpillar → pupa → butterfly!', '🦋'),
      infoStep('The Caterpillar', 'A caterpillar eats leaves and grows fast.', '🐛'),
      infoStep('The Pupa', 'The caterpillar wraps itself into a pupa.', '🫙'),
      qStep('What comes out of the pupa?', ['🦋 A butterfly', '🐸 A frog', '🐤 A chick'], '🦋 A butterfly', '🦋'),
      infoStep('Frog Life Cycle', 'Eggs → tadpole → frog. The tadpole swims in water!', '🐸'),
      qStep('What does a tadpole grow into?', ['🐸 A frog', '🐔 A hen', '🐟 A fish'], '🐸 A frog', '🐸')
    ], 'Life cycles'),
    makeLesson('p2-s2', 'science', 'Energy Around Us', '⚡', [
      infoStep('The Sun', 'The sun gives us light and heat energy.', '☀️'),
      infoStep('Wind', 'Wind energy can push sails and turn windmills.', '🌬️'),
      infoStep('Food', 'Food gives our bodies energy to run and play!', '🍌'),
      qStep('What gives us light and heat?', ['☀️ The sun', '🌊 The lake', '🪨 A stone'], '☀️ The sun', '☀️'),
      qStep('What does food give our bodies?', ['⚡ Energy', '💧 Water', '🪵 Wood'], '⚡ Energy', '🍌')
    ], 'Energy'),
    makeLesson('p2-s3', 'science', 'Keeping Healthy', '💪', [
      infoStep('Exercise', 'Running and playing keep our bodies strong.', '⚽'),
      infoStep('Sleep', 'We need sleep so our bodies can rest and grow.', '😴'),
      infoStep('Clean Water', 'Drinking clean water keeps us healthy.', '💧'),
      qStep('Why do we need sleep?', ['😴 To rest and grow', '🍕 To eat more', '🎮 To play games'], '😴 To rest and grow', '😴'),
      qStep('Which drink keeps us healthy?', ['💧 Clean water', '🥤 Soda', '🍬 Juice only'], '💧 Clean water', '💧')
    ], 'Health')
  ],
  sst: [
    makeLesson('p2-sst1', 'sst', 'Uganda — Pearl of Africa', '🇺🇬', [
      infoStep('Our Country', 'Uganda is in East Africa, on the equator.', '🇺🇬'),
      infoStep('Lake Victoria', 'Lake Victoria is the largest lake in Africa!', '🌊'),
      infoStep('River Nile', 'The River Nile starts from Lake Victoria at Jinja.', '🏞️'),
      qStep('Where does the River Nile start?', ['🏞️ At Jinja', '🌊 At the sea', '⛰️ On a mountain'], '🏞️ At Jinja', '🏞️'),
      qStep('What is the largest lake in Africa?', ['🌊 Lake Victoria', '🌊 Lake Albert', '🌊 Lake Kyoga'], '🌊 Lake Victoria', '🌊')
    ], 'Uganda'),
    makeLesson('p2-sst2', 'sst', 'People & Culture', '🪘', [
      infoStep('Many Languages', 'People in Uganda speak many languages, like Luganda, Runyankore and Ateso.', '🗣️'),
      infoStep('Dancing', 'We dance and drum at celebrations!', '🪘'),
      infoStep('Traditional Food', 'Matooke, posho, beans and groundnuts are common foods.', '🍲'),
      qStep('Which language is spoken in Uganda?', ['🗣️ Luganda', '🗣️ French', '🗣️ Chinese'], '🗣️ Luganda', '🗣️'),
      qStep('Which food is common in Uganda?', ['🍲 Matooke', '🍕 Pizza', '🍣 Sushi'], '🍲 Matooke', '🍲')
    ], 'Culture'),
    makeLesson('p2-sst3', 'sst', 'Wild Animals of Uganda', '🦁', [
      infoStep('The Savannah', 'Lions, giraffes and zebras live in our national parks.', '🦁'),
      infoStep('The Mountain Gorilla', 'Uganda is home to the mountain gorilla in Bwindi!', '🦍'),
      infoStep('The Elephant', 'Elephants are the largest land animals.', '🐘'),
      qStep('Which animal lives in Bwindi?', ['🦍 Mountain gorilla', '🐧 Penguin', '🐫 Camel'], '🦍 Mountain gorilla', '🦍'),
      qStep('Which is the largest land animal?', ['🐘 Elephant', '🦁 Lion', '🦒 Giraffe'], '🐘 Elephant', '🐘')
    ], 'Wildlife')
  ],
  creative: [
    makeLesson('p2-c1', 'creative', 'Color the Fish', '🐠', [
      infoStep('Color the Fish', 'Make this fish the brightest in the lake!', '🐠'),
      colorStep('fish')
    ], 'Coloring'),
    makeLesson('p2-c2', 'creative', 'Trace Letters D–F', '✏️', [
      infoStep('Trace the Letters', 'Take your time and stay on the dots!', '✏️'),
      traceStep('letter', 'D'), traceStep('letter', 'E'), traceStep('letter', 'F')
    ], 'Tracing'),
    makeLesson('p2-c3', 'creative', 'Trace the Numbers 6–8', '🔢', [
      infoStep('Trace the Numbers', 'Follow the dotted paths!', '✏️'),
      traceStep('number', '6'), traceStep('number', '7'), traceStep('number', '8')
    ], 'Tracing')
  ]
};

/* ============================ PRIMARY 3 ============================ */
CURRICULUM.p3 = {
  english: [
    makeLesson('p3-e1', 'english', 'Reading: The Market Trip', '📖', [
      readStep('Amina went to the market with her mother. They bought matooke, tomatoes and a bunch of bananas. The market was full of people, and the sellers were calling out loudly.', '🛒'),
      qStep('Who went to the market with Amina?', ['Her mother', 'Her teacher', 'Her friend'], 'Her mother', '🛒'),
      qStep('What did they buy?', ['Matooke, tomatoes and bananas', 'Books and pens', 'Shoes and shirts'], 'Matooke, tomatoes and bananas', '🍌'),
      qStep('How was the market?', ['Full of people', 'Empty and quiet', 'Closed'], 'Full of people', '🛒')
    ], 'Reading'),
    makeLesson('p3-e2', 'english', 'Doing Words', '🏃', [
      infoStep('Doing Words', 'Doing words (verbs) tell us what someone does: run, jump, sing!', '🏃'),
      qStep('Which word is a doing word?', ['Jump', 'Mango', 'Blue'], 'Jump', '🏃'),
      qStep('Which word is a doing word?', ['Sing', 'House', 'Happy'], 'Sing', '🎤'),
      qStep('Which word is a doing word?', ['Sleep', 'Chair', 'Rain'], 'Sleep', '😴')
    ], 'Grammar'),
    makeLesson('p3-e3', 'english', 'Describing Words', '🎨', [
      infoStep('Describing Words', 'Describing words (adjectives) tell us HOW something is: big, red, tall!', '🎨'),
      qStep('Which word describes the elephant?', ['Big', 'Run', 'Quickly'], 'Big', '🐘'),
      qStep('Which word describes the sun?', ['Bright', 'Sleep', 'Under'], 'Bright', '☀️'),
      qStep('Which word describes the giraffe?', ['Tall', 'Jump', 'Sweet'], 'Tall', '🦒'),
      readStep('The tall giraffe ate the sweet leaves from the high tree.', '🦒')
    ], 'Grammar'),
    makeLesson('p3-e4', 'english', 'Writing Sentences', '✍️', [
      infoStep('Sentences', 'A sentence starts with a capital letter and ends with a full stop.', '✍️'),
      qStep('Which is a correct sentence?', ['The dog runs fast.', 'dog runs fast the', 'The Dog Runs Fast'], 'The dog runs fast.', '🐶'),
      qStep('Which is a correct sentence?', ['Amina likes matooke.', 'amina likes matooke', 'likes Amina matooke'], 'Amina likes matooke.', '🍲'),
      qStep('What does a sentence start with?', ['A capital letter', 'A small letter', 'A number'], 'A capital letter', '✍️')
    ], 'Writing')
  ],
  maths: [
    makeLesson('p3-m1', 'maths', 'Place Value to 1000', '🔢', [
      infoStep('Hundreds, Tens, Ones', 'In 365: 3 hundreds, 6 tens and 5 ones.', '🔢'),
      qStep('How many hundreds are in 365?', ['3', '6', '5'], '3', '🔢'),
      qStep('How many tens are in 365?', ['6', '3', '5'], '6', '🔢'),
      findNumber('Where is the number 500?', 500, 1000),
      qStep('Which number is 7 hundreds, 2 tens and 4 ones?', ['724', '742', '274'], '724', '🔢')
    ], 'Place value'),
    makeLesson('p3-m2', 'maths', 'Adding & Subtracting to 100', '➕', [
      mathStep(34, 27, '+', '🍎'), mathStep(48, 36, '+', '⭐'), mathStep(56, 29, '+', '🎈'),
      mathStep(72, 38, '-', '🍓'), mathStep(91, 47, '-', '🐤'), mathStep(65, 28, '-', '🌸')
    ], 'Add & subtract'),
    makeLesson('p3-m3', 'maths', 'Times Tables: 2, 5, 10', '✖️', [
      infoStep('Times Tables', '2 × 3 = 6 means two groups of three!', '✖️'),
      mathStep(2, 4, '×', '🍎'), mathStep(2, 8, '×', '⭐'), mathStep(5, 3, '×', '🎈'),
      mathStep(5, 6, '×', '🐤'), mathStep(10, 2, '×', '🍓'), mathStep(10, 3, '×', '🌸')
    ], 'Times tables'),
    makeLesson('p3-m4', 'maths', 'Fractions — Halves & Quarters', '🍕', [
      infoStep('Half', 'One half is one of two equal parts. A half of 8 is 4!', '🍕'),
      qStep('What is half of 8?', ['4', '2', '6'], '4', '🍕'),
      infoStep('Quarter', 'One quarter is one of four equal parts. A quarter of 12 is 3!', '🍰'),
      qStep('What is a quarter of 12?', ['3', '4', '6'], '3', '🍰'),
      qStep('A pizza is cut into 2 equal parts. What do we call each part?', ['A half', 'A quarter', 'A whole'], 'A half', '🍕')
    ], 'Fractions')
  ],
  science: [
    makeLesson('p3-s1', 'science', 'The Human Body', '🦴', [
      infoStep('The Skeleton', 'Our skeleton has 206 bones! Bones keep us standing tall.', '🦴'),
      infoStep('The Heart', 'Our heart pumps blood all around the body.', '❤️'),
      infoStep('The Brain', 'Our brain is the control centre — it thinks and remembers!', '🧠'),
      qStep('How many bones does our skeleton have?', ['206', '26', '1000'], '206', '🦴'),
      qStep('What pumps blood around the body?', ['❤️ The heart', '🫁 The lungs', '👀 The eyes'], '❤️ The heart', '❤️'),
      qStep('What is the control centre of the body?', ['🧠 The brain', '🦶 The foot', '👃 The nose'], '🧠 The brain', '🧠')
    ], 'My body'),
    makeLesson('p3-s2', 'science', 'Forces & Magnets', '🧲', [
      infoStep('Forces', 'A push or a pull is a force. Forces make things move!', '🏐'),
      infoStep('Magnet', 'A magnet attracts things made of iron, like pins.', '🧲'),
      infoStep('Gravity', 'Gravity pulls things down to the ground.', '🍎'),
      qStep('What is a push or a pull called?', ['A force', 'A colour', 'A sound'], 'A force', '🏐'),
      qStep('What does a magnet attract?', ['🧷 Things made of iron', '🌳 Wood', '💧 Water'], '🧷 Things made of iron', '🧲'),
      qStep('What pulls things down to the ground?', ['Gravity', 'A balloon', 'A song'], 'Gravity', '🍎')
    ], 'Forces'),
    makeLesson('p3-s3', 'science', 'Food Chains', '🦁', [
      infoStep('A Food Chain', 'Grass → antelope → lion. Energy flows from one to the next!', '🌿'),
      infoStep('Producers', 'Plants make their own food using sunlight.', '🌱'),
      infoStep('Consumers', 'Animals eat plants or other animals.', '🦁'),
      qStep('What do plants use to make food?', ['☀️ Sunlight', '🎵 Music', '💨 Wind'], '☀️ Sunlight', '🌱'),
      qStep('In grass → antelope → lion, what eats the antelope?', ['🦁 The lion', '🌿 The grass', '🐛 The worm'], '🦁 The lion', '🦁')
    ], 'Food chains'),
    makeLesson('p3-s4', 'science', 'The Solar System', '🪐', [
      infoStep('The Sun', 'The sun is a star at the centre of our solar system.', '☀️'),
      infoStep('The Planets', 'Eight planets go around the sun. Earth is our home!', '🌍'),
      infoStep('The Moon', 'The moon goes around the Earth. It shines with reflected light.', '🌙'),
      qStep('What is at the centre of our solar system?', ['☀️ The sun', '🌙 The moon', '⭐ Other stars'], '☀️ The sun', '☀️'),
      qStep('How many planets go around the sun?', ['8', '3', '100'], '8', '🪐'),
      qStep('What goes around the Earth?', ['🌙 The moon', '☀️ The sun', '🚀 A rocket only'], '🌙 The moon', '🌙')
    ], 'Space')
  ],
  sst: [
    makeLesson('p3-sst1', 'sst', 'East Africa', '🗺️', [
      infoStep('East Africa', 'East Africa has Uganda, Kenya, Tanzania, Rwanda, Burundi and South Sudan.', '🗺️'),
      infoStep('Our Neighbours', 'Kenya is to the east and Tanzania is to the south of Uganda.', '🧭'),
      qStep('Which country is to the east of Uganda?', ['Kenya', 'DR Congo', 'Egypt'], 'Kenya', '🗺️'),
      qStep('Which country is to the south of Uganda?', ['Tanzania', 'Ethiopia', 'Libya'], 'Tanzania', '🗺️'),
      qStep('Which city is the capital of Kenya?', ['Nairobi', 'Kampala', 'Kigali'], 'Nairobi', '🏙️')
    ], 'East Africa'),
    makeLesson('p3-sst2', 'sst', 'Regions & Cities', '🏙️', [
      infoStep('Four Regions', 'Uganda has four regions: Central, Eastern, Western and Northern.', '🗺️'),
      infoStep('Big Cities', 'Kampala, Jinja, Mbarara, Gulu and Mbale are big cities.', '🏙️'),
      infoStep('Jinja', 'Jinja is where the River Nile starts — the source of the Nile!', '🏞️'),
      qStep('How many regions does Uganda have?', ['4', '2', '10'], '4', '🗺️'),
      qStep('Where is the source of the Nile?', ['Jinja', 'Kampala', 'Mbarara'], 'Jinja', '🏞️')
    ], 'Uganda regions'),
    makeLesson('p3-sst3', 'sst', 'Weather & Seasons', '🌦️', [
      infoStep('Two Seasons', 'Uganda has a rainy season and a dry season each year.', '🌦️'),
      infoStep('The Equator', 'Uganda lies on the equator, so it is warm all year.', '🌍'),
      infoStep('Mountain Snow', 'The Rwenzori mountains have snow at the top!', '🏔️'),
      qStep('How is the weather in Uganda all year?', ['Warm', 'Very cold', 'Snowy everywhere'], 'Warm', '🌍'),
      qStep('Which mountains have snow at the top?', ['Rwenzori', 'Muhabura', 'Elgon'], 'Rwenzori', '🏔️')
    ], 'Weather'),
    makeLesson('p3-sst4', 'sst', 'Caring for Our Environment', '🌳', [
      infoStep('Trees', 'Trees give us shade, fruits and clean air. Let\'s plant more!', '🌳'),
      infoStep('Water', 'We should keep our lakes and rivers clean.', '🌊'),
      infoStep('Waste', 'We can reuse and recycle instead of burning rubbish.', '♻️'),
      qStep('Why should we plant trees?', ['🌳 For shade and clean air', '🚗 To make cars', '📚 To make noise'], '🌳 For shade and clean air', '🌳'),
      qStep('What should we do with old plastic bottles?', ['♻️ Reuse or recycle', '🔥 Burn them', '🌊 Throw in the lake'], '♻️ Reuse or recycle', '♻️')
    ], 'Environment')
  ],
  creative: [
    makeLesson('p3-c1', 'creative', 'Color the Tree', '🌳', [
      infoStep('Color the Tree', 'A happy tree for a happy world!', '🌳'),
      colorStep('tree')
    ], 'Coloring'),
    makeLesson('p3-c2', 'creative', 'Trace Letters G–I', '✏️', [
      infoStep('Trace the Letters', 'Nice and slow — stay on the dots!', '✏️'),
      traceStep('letter', 'G'), traceStep('letter', 'H'), traceStep('letter', 'I')
    ], 'Tracing'),
    makeLesson('p3-c3', 'creative', 'Design a Balloon', '🎈', [
      infoStep('Design a Balloon', 'Color and trace your very own balloon!', '🎈'),
      colorStep('balloon'), traceStep('line', 'spiral')
    ], 'Creative')
  ]
};

/* ------------------------------------------------------------------ */
/*  TRACING TEMPLATES (waypoints on a 100×100 grid)                    */
/* ------------------------------------------------------------------ */

function circlePts(cx, cy, r, n) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    pts.push([+(cx + r * Math.cos(a)).toFixed(1), +(cy + r * Math.sin(a)).toFixed(1)]);
  }
  return pts;
}

const TRACE_TEMPLATES = {
  letter: {
    A: [[50, 10], [50, 88], [14, 12], [14, 88], [26, 58], [74, 58]],
    B: [[30, 10], [30, 90], [62, 90], [80, 74], [62, 56], [30, 50], [62, 32], [80, 16], [62, 10], [30, 10]],
    C: [[78, 18], [34, 18], [12, 50], [34, 82], [78, 82]],
    D: [[30, 10], [30, 90], [62, 90], [80, 68], [80, 32], [62, 10], [30, 10]],
    E: [[30, 10], [30, 90], [78, 90], [30, 50], [66, 50], [30, 10], [78, 10]],
    F: [[30, 10], [30, 90], [30, 50], [70, 50], [30, 10], [76, 10]],
    G: [[78, 20], [34, 20], [12, 50], [34, 80], [70, 80], [82, 60], [82, 50], [56, 50]],
    H: [[25, 10], [25, 90], [25, 50], [75, 50], [75, 10], [75, 90]],
    I: [[35, 10], [65, 10], [50, 10], [50, 90], [35, 90], [65, 90]],
    J: [[62, 10], [62, 74], [50, 88], [30, 88], [18, 74], [18, 60]],
    K: [[25, 10], [25, 90], [25, 50], [75, 12], [40, 55], [75, 90]],
    L: [[25, 10], [25, 90], [75, 90]],
    M: [[15, 88], [15, 12], [50, 62], [85, 12], [85, 88]],
    N: [[20, 88], [20, 12], [80, 88], [80, 12]],
    O: circlePts(50, 50, 36, 14),
    P: [[28, 10], [28, 90], [60, 90], [78, 72], [78, 40], [60, 22], [28, 22], [28, 10]],
    Q: circlePts(46, 46, 30, 14).concat([[68, 68], [82, 88]]),
    R: [[28, 10], [28, 90], [60, 90], [78, 72], [78, 40], [60, 22], [28, 22], [28, 10], [58, 55], [80, 90]],
    S: [[76, 16], [30, 16], [16, 36], [30, 56], [70, 60], [84, 78], [70, 92], [24, 92]],
    T: [[20, 12], [80, 12], [50, 12], [50, 90]],
    U: [[25, 15], [25, 62], [38, 84], [62, 84], [75, 62], [75, 15]],
    V: [[18, 12], [50, 88], [82, 12]],
    W: [[12, 12], [32, 88], [50, 34], [68, 88], [88, 12]],
    X: [[20, 12], [80, 88], [20, 88], [80, 12]],
    Y: [[22, 10], [50, 50], [78, 10], [50, 50], [50, 90]],
    Z: [[18, 12], [82, 12], [18, 88], [82, 88]]
  },
  number: {
    '1': [[50, 8], [50, 90], [18, 90], [82, 90]],
    '2': [[20, 14], [80, 14], [80, 52], [20, 86], [20, 92], [90, 92]],
    '3': [[74, 12], [26, 12], [12, 40], [26, 68], [74, 68], [26, 68], [12, 95]],
    '4': [[14, 52], [84, 52], [46, 52], [46, 8], [46, 92]],
    '5': [[78, 10], [16, 10], [16, 46], [72, 56], [86, 82], [52, 92], [22, 86]],
    '6': [[70, 16], [30, 20], [14, 52], [32, 82], [70, 80], [78, 50], [48, 48], [34, 62]],
    '7': [[14, 14], [86, 14], [52, 54], [52, 92]],
    '8': [[48, 6], [26, 10], [14, 30], [30, 48], [70, 48], [86, 30], [74, 10], [48, 6], [34, 54], [18, 72], [30, 92], [52, 96], [74, 88], [82, 68], [66, 54]],
    '9': [[44, 8], [24, 16], [14, 38], [30, 58], [58, 62], [78, 48], [74, 26], [56, 16], [44, 8], [56, 96]],
    '0': circlePts(50, 50, 36, 14)
  },
  shape: {
    circle: circlePts(50, 50, 38, 14),
    square: [[12, 12], [88, 12], [88, 88], [12, 88], [12, 12]],
    triangle: [[50, 10], [90, 88], [10, 88], [50, 10]],
    star: starPoints(50, 50, 40, 17).split(' ').map(p => p.split(',').map(Number)),
    heart: [[50, 86], [12, 46], [24, 22], [50, 40], [76, 22], [88, 46], [50, 86]],
    diamond: [[50, 8], [92, 50], [50, 92], [8, 50], [50, 8]],
    pentagon: [[50, 8], [93, 38], [77, 88], [23, 88], [7, 38], [50, 8]],
    hexagon: [[50, 8], [88, 28], [88, 72], [50, 92], [12, 72], [12, 28], [50, 8]]
  },
  line: {
    straight: [[5, 50], [95, 50]],
    wave: [[5, 50], [18, 28], [31, 72], [44, 28], [57, 72], [70, 28], [83, 72], [95, 50]],
    zigzag: [[5, 80], [25, 20], [45, 80], [65, 20], [85, 80], [95, 40]],
    spiral: circlePts(50, 50, 42, 16).concat(circlePts(50, 50, 24, 12)).concat(circlePts(50, 50, 8, 8))
  }
};

const TRACE_LABELS = {
  letter: { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', H: 'H', I: 'I', J: 'J', K: 'K', L: 'L', M: 'M', N: 'N', O: 'O', P: 'P', Q: 'Q', R: 'R', S: 'S', T: 'T', U: 'U', V: 'V', W: 'W', X: 'X', Y: 'Y', Z: 'Z' },
  number: { '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9' },
  shape: { circle: '⭕', square: '⬜', triangle: '🔺', star: '⭐', heart: '❤️', diamond: '🔷', pentagon: '⬠', hexagon: '⬡' },
  line: { straight: '—', wave: '〰️', zigzag: '⚡', spiral: '🌀' }
};

/* ------------------------------------------------------------------ */
/*  COLORING TEMPLATES (SVG regions)                                   */
/* ------------------------------------------------------------------ */

const COLORING_TEMPLATES = {
  apple: {
    name: 'The Apple', emoji: '🍎', size: 300,
    svg: `
      <g class="zone" data-id="leaf"><path d="M150 78 C 120 30 160 8 190 20 C 205 28 205 52 185 66 C 170 78 160 82 150 78 Z"/></g>
      <g class="zone" data-id="stem"><rect x="143" y="50" width="14" height="44" rx="7"/></g>
      <g class="zone" data-id="body"><path d="M150 92 C 118 74 88 86 84 124 C 80 168 104 226 150 232 C 196 226 220 168 216 124 C 212 86 182 74 150 92 Z"/></g>
      <g class="zone" data-id="shine"><ellipse cx="122" cy="130" rx="14" ry="22" fill="#fff" opacity="0.55" transform="rotate(-24 122 130)"/></g>
      <ellipse cx="150" cy="240" rx="90" ry="10" fill="#e8ecf7" opacity="0.6"/>`
  },
  flower: {
    name: 'The Flower', emoji: '🌸', size: 320,
    svg: `
      <g class="zone" data-id="stem"><rect x="148" y="180" width="16" height="120" rx="8"/></g>
      <g class="zone" data-id="leafL"><path d="M156 220 C 120 210 90 230 92 260 C 94 284 128 292 156 272 Z"/></g>
      <g class="zone" data-id="leafR"><path d="M164 250 C 200 240 230 258 228 286 C 226 308 194 316 164 296 Z"/></g>
      <g class="zone" data-id="petal1"><ellipse cx="160" cy="96" rx="38" ry="52" transform="rotate(0 160 150)"/></g>
      <g class="zone" data-id="petal2"><ellipse cx="160" cy="96" rx="38" ry="52" transform="rotate(60 160 150)"/></g>
      <g class="zone" data-id="petal3"><ellipse cx="160" cy="96" rx="38" ry="52" transform="rotate(120 160 150)"/></g>
      <g class="zone" data-id="petal4"><ellipse cx="160" cy="96" rx="38" ry="52" transform="rotate(180 160 150)"/></g>
      <g class="zone" data-id="petal5"><ellipse cx="160" cy="96" rx="38" ry="52" transform="rotate(240 160 150)"/></g>
      <g class="zone" data-id="petal6"><ellipse cx="160" cy="96" rx="38" ry="52" transform="rotate(300 160 150)"/></g>
      <g class="zone" data-id="center"><circle cx="160" cy="150" r="34"/></g>
      <ellipse cx="160" cy="308" rx="90" ry="10" fill="#e8ecf7" opacity="0.6"/>`
  },
  house: {
    name: 'The House', emoji: '🏠', size: 320,
    svg: `
      <g class="zone" data-id="sky"><rect x="20" y="20" width="280" height="120" rx="10"/></g>
      <g class="zone" data-id="roof"><path d="M160 20 L 60 100 L 260 100 Z"/></g>
      <g class="zone" data-id="walls"><rect x="76" y="100" width="168" height="150" rx="6"/></g>
      <g class="zone" data-id="door"><rect x="136" y="150" width="48" height="100" rx="24"/></g>
      <g class="zone" data-id="windowL"><rect x="96" y="128" width="40" height="40" rx="8"/></g>
      <g class="zone" data-id="windowR"><rect x="184" y="128" width="40" height="40" rx="8"/></g>
      <g class="zone" data-id="chimney"><rect x="212" y="34" width="30" height="50" rx="6"/></g>
      <ellipse cx="160" cy="268" rx="110" ry="12" fill="#e8ecf7" opacity="0.6"/>`
  },
  fish: {
    name: 'The Fish', emoji: '🐠', size: 340,
    svg: `
      <g class="zone" data-id="body"><path d="M60 170 C 70 100 150 80 210 110 C 260 135 270 200 210 230 C 150 260 70 240 60 170 Z"/></g>
      <g class="zone" data-id="tail"><path d="M60 170 L 14 130 L 16 210 Z"/></g>
      <g class="zone" data-id="fin"><path d="M150 140 C 160 100 190 96 200 110 C 180 130 170 150 160 160 Z"/></g>
      <g class="zone" data-id="stripe"><path d="M120 120 C 140 150 140 200 120 228 C 108 206 108 148 120 120 Z"/></g>
      <g class="zone" data-id="eye"><circle cx="210" cy="160" r="16"/></g>
      <circle cx="214" cy="156" r="5" fill="#fff"/>
      <g class="zone" data-id="mouth"><path d="M230 176 Q 248 184 230 192" stroke="#33385c" stroke-width="4" fill="none" stroke-linecap="round"/></g>
      <g class="zone" data-id="bubble1"><circle cx="262" cy="120" r="8"/></g>
      <g class="zone" data-id="bubble2"><circle cx="280" cy="90" r="6"/></g>
      <ellipse cx="170" cy="290" rx="110" ry="12" fill="#e8ecf7" opacity="0.6"/>`
  },
  butterfly: {
    name: 'The Butterfly', emoji: '🦋', size: 340,
    svg: `
      <g class="zone" data-id="wingTL"><path d="M150 150 C 90 60 20 70 40 140 C 55 190 110 200 150 170 Z"/></g>
      <g class="zone" data-id="wingTR"><path d="M190 150 C 250 60 320 70 300 140 C 285 190 230 200 190 170 Z"/></g>
      <g class="zone" data-id="wingBL"><path d="M150 180 C 90 210 40 250 70 290 C 100 320 140 260 150 200 Z"/></g>
      <g class="zone" data-id="wingBR"><path d="M190 180 C 250 210 300 250 270 290 C 240 320 200 260 190 200 Z"/></g>
      <g class="zone" data-id="body"><ellipse cx="170" cy="180" rx="14" ry="70"/></g>
      <g class="zone" data-id="head"><circle cx="170" cy="100" r="16"/></g>
      <path d="M160 90 Q 140 60 130 40 M 180 90 Q 200 60 210 40" stroke="#33385c" stroke-width="4" fill="none" stroke-linecap="round"/>
      <g class="zone" data-id="spot1"><circle cx="90" cy="120" r="14"/></g>
      <g class="zone" data-id="spot2"><circle cx="250" cy="120" r="14"/></g>
      <g class="zone" data-id="spot3"><circle cx="120" cy="230" r="10"/></g>
      <g class="zone" data-id="spot4"><circle cx="220" cy="230" r="10"/></g>
      <ellipse cx="170" cy="300" rx="110" ry="12" fill="#e8ecf7" opacity="0.6"/>`
  },
  tree: {
    name: 'The Tree', emoji: '🌳', size: 320,
    svg: `
      <g class="zone" data-id="trunk"><rect x="136" y="170" width="48" height="120" rx="10"/></g>
      <g class="zone" data-id="canopy"><circle cx="160" cy="110" r="64"/></g>
      <g class="zone" data-id="canopyL"><circle cx="100" cy="130" r="44"/></g>
      <g class="zone" data-id="canopyR"><circle cx="220" cy="130" r="44"/></g>
      <g class="zone" data-id="apple1"><circle cx="130" cy="100" r="13"/></g>
      <g class="zone" data-id="apple2"><circle cx="190" cy="120" r="13"/></g>
      <g class="zone" data-id="apple3"><circle cx="160" cy="150" r="13"/></g>
      <g class="zone" data-id="grass"><rect x="20" y="288" width="280" height="26" rx="12"/></g>
      <ellipse cx="160" cy="300" rx="120" ry="10" fill="#e8ecf7" opacity="0.6"/>`
  },
  balloon: {
    name: 'The Balloon', emoji: '🎈', size: 300,
    svg: `
      <g class="zone" data-id="balloon"><ellipse cx="150" cy="110" rx="70" ry="88"/></g>
      <g class="zone" data-id="knot"><polygon points="142,196 158,196 152,212"/></g>
      <g class="zone" data-id="string"><path d="M152 212 Q 140 260 160 288" stroke="#33385c" stroke-width="4" fill="none" stroke-linecap="round"/></g>
      <g class="zone" data-id="shine"><ellipse cx="118" cy="80" rx="14" ry="24" fill="#fff" opacity="0.55" transform="rotate(-20 118 80)"/></g>
      <g class="zone" data-id="stripe"><path d="M120 40 C 140 70 140 150 120 186 C 132 170 140 100 132 48 Z" opacity="0.35"/></g>
      <ellipse cx="150" cy="300" rx="90" ry="10" fill="#e8ecf7" opacity="0.6"/>`
  },
  dog: {
    name: 'The Dog', emoji: '🐶', size: 320,
    svg: `
      <g class="zone" data-id="body"><ellipse cx="160" cy="200" rx="70" ry="50"/></g>
      <g class="zone" data-id="head"><circle cx="230" cy="140" r="50"/></g>
      <g class="zone" data-id="earL"><ellipse cx="200" cy="100" rx="18" ry="30" transform="rotate(-20 200 100)"/></g>
      <g class="zone" data-id="earR"><ellipse cx="260" cy="100" rx="18" ry="30" transform="rotate(20 260 100)"/></g>
      <g class="zone" data-id="eye"><circle cx="245" cy="135" r="8"/></g>
      <g class="zone" data-id="nose"><ellipse cx="270" cy="150" rx="10" ry="8"/></g>
      <g class="zone" data-id="tail"><path d="M90 180 Q 60 140 80 100" stroke="#33385c" stroke-width="8" fill="none" stroke-linecap="round"/></g>
      <g class="zone" data-id="legFL"><rect x="200" y="230" width="16" height="40" rx="8"/></g>
      <g class="zone" data-id="legFR"><rect x="230" y="230" width="16" height="40" rx="8"/></g>
      <g class="zone" data-id="legBL"><rect x="110" y="230" width="16" height="40" rx="8"/></g>
      <g class="zone" data-id="legBR"><rect x="140" y="230" width="16" height="40" rx="8"/></g>
      <ellipse cx="160" cy="280" rx="100" ry="10" fill="#e8ecf7" opacity="0.6"/>`
  },
  banana: {
    name: 'The Banana', emoji: '🍌', size: 300,
    svg: `
      <g class="zone" data-id="body"><path d="M80 240 Q 60 160 100 80 Q 160 20 220 60 Q 240 80 220 100 Q 160 60 120 120 Q 100 180 120 240 Z"/></g>
      <g class="zone" data-id="tip"><ellipse cx="80" cy="244" rx="10" ry="6"/></g>
      <g class="zone" data-id="stem"><path d="M220 60 Q 240 40 260 50" stroke="#33385c" stroke-width="6" fill="none" stroke-linecap="round"/></g>
      <ellipse cx="160" cy="280" rx="90" ry="10" fill="#e8ecf7" opacity="0.6"/>`
  },
  car: {
    name: 'The Car', emoji: '🚗', size: 340,
    svg: `
      <g class="zone" data-id="body"><rect x="40" y="140" width="260" height="80" rx="16"/></g>
      <g class="zone" data-id="top"><path d="M100 140 L 140 80 L 240 80 L 280 140 Z"/></g>
      <g class="zone" data-id="windowL"><path d="M110 140 L 144 88 L 170 88 L 170 140 Z" fill="#b8e0ff"/></g>
      <g class="zone" data-id="windowR"><path d="M180 140 L 180 88 L 236 88 L 270 140 Z" fill="#b8e0ff"/></g>
      <g class="zone" data-id="wheelL"><circle cx="100" cy="220" r="28"/></g>
      <g class="zone" data-id="wheelR"><circle cx="240" cy="220" r="28"/></g>
      <g class="zone" data-id="hubcapL"><circle cx="100" cy="220" r="10" fill="#fff"/></g>
      <g class="zone" data-id="hubcapR"><circle cx="240" cy="220" r="10" fill="#fff"/></g>
      <g class="zone" data-id="headlight"><circle cx="296" cy="170" r="10"/></g>
      <ellipse cx="170" cy="260" rx="120" ry="10" fill="#e8ecf7" opacity="0.6"/>`
  },
  mango: {
    name: 'The Mango', emoji: '🥭', size: 300,
    svg: `
      <g class="zone" data-id="body"><ellipse cx="150" cy="160" rx="80" ry="100"/></g>
      <g class="zone" data-id="stem"><path d="M150 60 Q 160 40 170 50" stroke="#33385c" stroke-width="5" fill="none" stroke-linecap="round"/></g>
      <g class="zone" data-id="leaf"><path d="M170 50 Q 200 30 220 50 Q 200 60 170 50 Z"/></g>
      <g class="zone" data-id="shine"><ellipse cx="120" cy="130" rx="16" ry="30" fill="#fff" opacity="0.45" transform="rotate(-15 120 130)"/></g>
      <ellipse cx="150" cy="280" rx="90" ry="10" fill="#e8ecf7" opacity="0.6"/>`
  }
};

/* ------------------------------------------------------------------ */
/*  BADGES                                                             */
/* ------------------------------------------------------------------ */

const BADGES = [
  { id: 'first',      icon: '🏅', name: 'First Lesson',      desc: 'Complete your first lesson',           check: s => s.lessonsDone >= 1 },
  { id: 'stars10',    icon: '🌟', name: '10 Stars',          desc: 'Earn 10 stars',                        check: s => s.totalStars >= 10 },
  { id: 'stars50',    icon: '⭐', name: '50 Stars',          desc: 'Earn 50 stars',                        check: s => s.totalStars >= 50 },
  { id: 'stars100',   icon: '💫', name: '100 Stars',         desc: 'Earn 100 stars',                       check: s => s.totalStars >= 100 },
  { id: 'letterChamp',icon: '🔤', name: 'Letter Champion',   desc: 'Finish 5 English lessons',             check: s => s.bySubject.english.lessons >= 5 },
  { id: 'letterMaster',icon: '📖', name: 'Letter Master',     desc: 'Finish 10 English lessons',            check: s => s.bySubject.english.lessons >= 10 },
  { id: 'mathExplorer',icon: '🔢', name: 'Maths Explorer',   desc: 'Finish 5 Maths lessons',               check: s => s.bySubject.maths.lessons >= 5 },
  { id: 'mathMaster', icon: '🧮', name: 'Maths Master',      desc: 'Finish 10 Maths lessons',              check: s => s.bySubject.maths.lessons >= 10 },
  { id: 'scienceBuddy',icon: '🔬', name: 'Science Buddy',    desc: 'Finish 3 Science lessons',             check: s => s.bySubject.science.lessons >= 3 },
  { id: 'scienceStar', icon: '🧪', name: 'Science Star',     desc: 'Finish 7 Science lessons',             check: s => s.bySubject.science.lessons >= 7 },
  { id: 'worldFriend',icon: '🌍', name: 'World Friend',      desc: 'Finish 3 SST lessons',                 check: s => s.bySubject.sst.lessons >= 3 },
  { id: 'worldExplorer',icon: '🗺️', name: 'World Explorer',  desc: 'Finish 7 SST lessons',                 check: s => s.bySubject.sst.lessons >= 7 },
  { id: 'artist',     icon: '🎨', name: 'Creative Artist',   desc: 'Finish 3 Creative activities',         check: s => s.bySubject.creative.lessons >= 3 },
  { id: 'artMaster',  icon: '🖼️', name: 'Art Master',        desc: 'Finish 8 Creative activities',         check: s => s.bySubject.creative.lessons >= 8 },
  { id: 'traceStar',  icon: '✏️', name: 'Tracing Star',      desc: 'Finish 3 tracings',                    check: s => (s.activityCount.tracing || 0) >= 3 },
  { id: 'traceChamp', icon: '🖊️', name: 'Tracing Champion',  desc: 'Finish 8 tracings',                    check: s => (s.activityCount.tracing || 0) >= 8 },
  { id: 'colorWiz',   icon: '🖍️', name: 'Color Wizard',      desc: 'Finish 3 colorings',                   check: s => (s.activityCount.coloring || 0) >= 3 },
  { id: 'colorChamp', icon: '🌈', name: 'Color Champion',    desc: 'Finish 8 colorings',                   check: s => (s.activityCount.coloring || 0) >= 8 },
  { id: 'gamePlayer', icon: '🎮', name: 'Game Player',       desc: 'Play 3 games',                         check: s => (s.activityCount.games || 0) >= 3 },
  { id: 'gameChamp',  icon: '🏆', name: 'Game Champion',     desc: 'Play 10 games',                        check: s => (s.activityCount.games || 0) >= 10 },
  { id: 'hero',       icon: '🏆', name: 'Learning Hero',     desc: 'Complete 10 lessons',                  check: s => s.lessonsDone >= 10 },
  { id: 'superHero',  icon: '🦸', name: 'Super Learner',     desc: 'Complete 25 lessons',                  check: s => s.lessonsDone >= 25 },
  { id: 'songStar',   icon: '🎵', name: 'Song Star',         desc: 'Listen to 3 songs',                    check: s => (s.activityCount.songs || 0) >= 3 },
  { id: 'safeKid',    icon: '🛡️', name: 'Safety Star',       desc: 'Complete 2 safety lessons',            check: s => s.lessonsDone >= 2 }
];

/* ------------------------------------------------------------------ */
/*  TODAY'S ADVENTURE TASK POOL                                        */
/* ------------------------------------------------------------------ */

const ADVENTURE_TASKS = [
  { id: 'lesson-english', icon: '📖', label: 'Learn an English lesson', kind: 'subject', subject: 'english' },
  { id: 'lesson-maths', icon: '🔢', label: 'Do a Maths lesson', kind: 'subject', subject: 'maths' },
  { id: 'lesson-science', icon: '🔬', label: 'Do a Science lesson', kind: 'subject', subject: 'science' },
  { id: 'lesson-sst', icon: '🌍', label: 'Do an SST lesson', kind: 'subject', subject: 'sst' },
  { id: 'lesson-creative', icon: '🎨', label: 'Finish a Creative activity', kind: 'subject', subject: 'creative' },
  { id: 'game', icon: '🎮', label: 'Play a game', kind: 'game' },
  { id: 'coloring', icon: '🖍️', label: 'Color a picture', kind: 'coloring' },
  { id: 'tracing', icon: '✏️', label: 'Trace a letter, number or shape', kind: 'tracing' },
  { id: 'draw', icon: '🖼️', label: 'Draw a picture', kind: 'draw' }
];

/* ------------------------------------------------------------------ */
/*  KINDERGARTEN ACTIVITY AREAS (Baby/Middle/Top Class)                */
/*  Young learners see playful activity areas — NOT formal subjects.   */
/*  Each area maps to existing activities + optional games/extras.     */
/*  Primary (P1–P3) keeps the subject structure unchanged.             */
/* ------------------------------------------------------------------ */

const KINDER_AREAS = [
  {
    id: 'counting', icon: '🔢', name: 'COUNTING', label: 'Counting & Numbers', color: '#f99a1c',
    speak: 'Counting and numbers! Let us count together!',
    lessons: { baby: ['b-m1', 'b-m2', 'b-m4', 'b-m5', 'b-m6', 'b-m8', 'b-m9', 'b-m10'], middle: ['m-m1', 'm-m2', 'm-m4', 'm-m5', 'm-m6', 'm-m7', 'm-m8'], top: ['t-m1', 't-m2', 't-m4', 't-m5', 't-m6', 't-m7', 't-m8'] },
    game: 'counting'
  },
  {
    id: 'letters', icon: '🔤', name: 'LETTERS', label: 'Letters & Sounds', color: '#2f7de1',
    speak: 'Letters and sounds! Let us say our letters!',
    lessons: { baby: ['b-e1', 'b-e2', 'b-e4', 'b-e5', 'b-e6', 'b-e7', 'b-e10'], middle: ['m-e1', 'm-e2', 'm-e4', 'm-e5', 'm-e6', 'm-e7', 'm-e8'], top: ['t-e1', 't-e2', 't-e4', 't-e5', 't-e6', 't-e7'] },
    game: 'letters'
  },
  {
    id: 'colours', icon: '🎨', name: 'COLOURS', label: 'Colours & Shading', color: '#ec4899',
    speak: 'Colours! Red, blue, yellow — let us play with colours!',
    lessons: { baby: ['b-c4', 'b-c1', 'b-c8'], middle: ['m-c3', 'm-c1', 'm-c8'], top: ['t-c1'] },
    game: 'colors'
  },
  {
    id: 'drawing', icon: '✏️', name: 'DRAWING', label: 'Drawing & Tracing', color: '#14b8a6',
    speak: 'Let us draw and trace together!',
    lessons: { baby: ['b-c2', 'b-c6', 'b-c7'], middle: ['m-c2', 'm-c5', 'm-c6'], top: ['t-c2', 't-c3', 't-c5', 't-c6'] },
    builtin: [{ id: 'draw', icon: '🖼️', name: 'Free Draw', hash: '#/draw' }]
  },
  {
    id: 'shapes', icon: '🔺', name: 'SHAPES', label: 'Shapes', color: '#a855f7',
    speak: 'Shapes! Circles, squares and triangles!',
    lessons: { baby: ['b-m3', 'b-m9'], middle: ['m-m3'], top: ['t-m3', 't-c7'] },
    game: 'shapes'
  },
  {
    id: 'puzzles', icon: '🧩', name: 'PUZZLES', label: 'Matching & Puzzles', color: '#f97316',
    speak: 'Let us play matching and puzzles!',
    lessons: { baby: ['b-c3', 'b-e3', 'b-e8', 'b-e9'], middle: ['m-c3', 'm-e3'], top: ['t-m3'] },
    game: 'memory',
    builtin: [{ id: 'match', icon: '🧩', name: 'Matching', hash: '#/matching' }]
  },
  {
    id: 'songs', icon: '🎵', name: 'SONGS', label: 'Songs & Rhymes', color: '#e11d48',
    speak: 'Songs! Let us sing together!',
    builtin: [{ id: 'songs', icon: '🎵', name: 'Song Time', hash: '#/songs' }]
  },
  {
    id: 'animals', icon: '🐶', name: 'ANIMALS', label: 'Animals & Nature', color: '#2fa96b',
    speak: 'Animals! What does the dog say? Woof woof!',
    lessons: { baby: ['b-s2', 'b-s4', 'b-s8'], middle: ['m-s3', 'm-s4', 'm-s5', 'm-s2'], top: ['t-s3', 't-s4', 't-s7'] }
  },
  {
    id: 'reading', icon: '📚', name: 'READING', label: 'Reading & Stories', color: '#0891b2', more: true,
    speak: 'Let us read together!',
    lessons: { baby: [], middle: ['m-e3', 'm-e7'], top: ['t-e3', 't-e5', 't-e6', 't-e7'] }
  },
  {
    id: 'body', icon: '🧼', name: 'MY BODY', label: 'My Body & Personal Care', color: '#0ea5e9', more: true,
    speak: 'My body! Let us learn about our body!',
    lessons: { baby: ['b-s1', 'b-s5', 'b-s7'], middle: ['m-sst3', 'm-s6', 'm-s7'], top: ['t-s1'] }
  },
  {
    id: 'family', icon: '👨‍👩‍👧', name: 'MY FAMILY', label: 'My Family & Home', color: '#f59e0b', more: true,
    speak: 'My family and my home!',
    lessons: { baby: ['b-sst1', 'b-sst2', 'b-sst7'], middle: ['m-sst1', 'm-sst2'], top: ['t-sst3'] }
  },
  {
    id: 'safety', icon: '🚸', name: 'SAFETY', label: 'Safety & Good Manners', color: '#dc2626', more: true,
    speak: 'Let us learn how to stay safe!',
    lessons: { baby: ['b-sst3', 'b-sst4', 'b-sst5'], middle: ['m-sst6'], top: ['t-s5', 't-s6'] }
  },
  {
    id: 'emotions', icon: '😊', name: 'FEELINGS', label: 'My Feelings & Emotions', color: '#d946ef', more: true,
    speak: 'Let us learn about our feelings!',
    lessons: { baby: ['b-sst6'], middle: [], top: ['t-sst6'] }
  },
  {
    id: 'transport', icon: '🚌', name: 'TRANSPORT', label: 'Transport & Travel', color: '#059669', more: true,
    speak: 'Let us learn about transport!',
    lessons: { baby: [], middle: ['m-sst5'], top: ['t-sst2', 't-sst4'] }
  },
  {
    id: 'time', icon: '🕐', name: 'TIME', label: 'Time, Days & Weather', color: '#7c3aed', more: true,
    speak: 'Let us learn about time and weather!',
    lessons: { baby: ['b-s9'], middle: ['m-s2'], top: ['t-m7', 't-m8', 't-sst5'] }
  },
  {
    id: 'coloring', icon: '🖍️', name: 'COLORING', label: 'Coloring Pictures', color: '#f43f5e', more: true,
    speak: 'Let us color beautiful pictures!',
    lessons: { baby: ['b-c1', 'b-c5', 'b-c9'], middle: ['m-c1', 'm-c4', 'm-c7'], top: ['t-c1', 't-c4', 't-c8'] }
  }
];

/* which kindergarten area contains this lesson (for back-navigation) */
function areaForLesson(lessonId) {
  for (const a of KINDER_AREAS) {
    for (const cls of ['baby', 'middle', 'top']) {
      if (a.lessons && a.lessons[cls] && a.lessons[cls].indexOf(lessonId) !== -1) return a.id;
    }
  }
  return null;
}

function isKinderClass(cls) {
  return ['baby', 'middle', 'top'].indexOf(cls) !== -1;
}

/* ------------------------------------------------------------------ */
/*  EXPORT (browser global)                                            */
/* ------------------------------------------------------------------ */

window.LLData = {
  SUBJECTS, SUBJECT_ORDER, CLASSES, CLASS_ORDER, COLORS, SHAPE_NAMES, shapeSVG,
  CHARACTERS, AVATARS, avatarHTML, LETTER_PICS, LETTERS,
  CURRICULUM, TRACE_TEMPLATES, TRACE_LABELS, COLORING_TEMPLATES, BADGES,
  ADVENTURE_TASKS, KINDER_AREAS, areaForLesson, isKinderClass, shuffle, starPoints, polygonPoints
};
