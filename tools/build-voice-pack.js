#!/usr/bin/env node
/* ==========================================================================
   🌈 LET'S LEARN — tools/build-voice-pack.js
   Builds the offline teacher-voice library.

   One warm neural voice (Microsoft Edge Aria — free, no API key) is used
   for every phrase. The resulting MP3s live in public/assets/audio/ and
   public/js/voice-library.js maps each phrase to its file.

   Because the clips are real files:
     • the voice is identical on every phone
     • it works with no internet
     • it is never the robotic device TTS

   Usage:  node tools/build-voice-pack.js
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const AUDIO_DIR = path.join(ROOT, 'public', 'assets', 'audio');
const PHRASE_DIR = path.join(AUDIO_DIR, 'phrases');
const LIB_FILE = path.join(ROOT, 'public', 'js', 'voice-library.js');
const MANIFEST = path.join(AUDIO_DIR, 'manifest.json');
const VOICE = process.env.LETSLEARN_TTS_VOICE || 'en-US-AriaNeural';

const EMOJI = {
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
  '🏅': 'medal', '⭐️': 'star', '✨': 'sparkle', '🎉': 'celebrate',
  '🥳': 'party', '😊': 'smile', '😅': 'oops', '🔢': 'numbers', '🔤': 'letters',
  '🧩': 'puzzle', '🎵': 'song', '🎧': 'listen', '🔊': 'listen',
  '🔴': 'red', '🟡': 'yellow', '🔵': 'blue', '🟢': 'green', '🟠': 'orange',
  '🟣': 'purple', '🩷': 'pink', '🟤': 'brown', '⚫': 'black', '⚪': 'white',
  '🔺': 'triangle', '🔻': 'triangle', '🟩': 'green square', '🟨': 'yellow square',
  '🥭': 'mango', '🍇': 'grapes', '🍐': 'pear', '🍑': 'peach', '🍍': 'pineapple',
  '🍉': 'watermelon', '🍊': 'orange', '🧸': 'teddy', '🚂': 'train',
  '🪁': 'kite', '🪀': 'yo-yo', '🥄': 'spoon', '🍽️': 'plate', '🥛': 'milk',
  '👟': 'shoe', '🎒': 'bag', '☂️': 'umbrella', '👕': 'shirt', '👖': 'trousers',
  '🧢': 'cap', '🧦': 'socks', '🧥': 'coat', '👗': 'dress', '🧤': 'gloves',
  '🧣': 'scarf', '✈️': 'aeroplane', '🚜': 'tractor', '🚒': 'fire engine',
  '⛵': 'boat', '🚁': 'helicopter', '🐸': 'frog', '🦄': 'unicorn',
  '🐻': 'bear', '🍫': 'chocolate', '🐧': 'penguin', '🫐': 'blueberry',
  '🥦': 'broccoli', '🦊': 'fox', '🍀': 'clover', '👦': 'brother',
  '👧': 'sister', '🥚': 'egg', '🐛': 'caterpillar', '🫙': 'jar',
  '👴': 'grandpa', '🛁': 'bath', '🍳': 'kitchen', '🛋️': 'sofa',
  '📺': 'television', '🐝': 'bee', '🐞': 'ladybird', '❄️': 'snow',
  '🍦': 'ice cream', '🏠': 'house', '☂️': 'umbrella'
};

const NUM_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen', 'twenty'
];

function preprocess(text) {
  let t = ' ' + String(text || '') + ' ';
  for (const [e, w] of Object.entries(EMOJI)) t = t.split(e).join(' ' + w + ' ');
  t = t.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]/gu, ' ');
  t = t.replace(/\bsst\b/gi, 'S.S.T.').replace(/\bp1\b/gi, 'Primary one')
    .replace(/\bp2\b/gi, 'Primary two').replace(/\bp3\b/gi, 'Primary three');
  t = t.replace(/[×✕]/g, ' times ')
    .replace(/[–—]/g, ', ')
    .replace(/−/g, ' minus ')
    .replace(/(\d)\s*-\s*(\d)/g, '$1 minus $2')
    .replace(/(\d)\s*\+\s*(\d)/g, '$1 plus $2')
    .replace(/\+/g, ' plus ').replace(/=/g, ' equals ').replace(/÷/g, ' divided by ');
  t = t.replace(/\b(\d{1,2})\b/g, (m, n) => {
    const v = parseInt(n, 10);
    return (v >= 0 && v <= 20) ? NUM_WORDS[v] : m;
  });
  t = t.replace(/\s+/g, ' ').trim();
  if (t && !/[.!?]$/.test(t)) t += '.';
  return t;
}

function normalize(s) {
  return String(s || '').toLowerCase()
    .replace(/[^a-z0-9\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slug(s) {
  return normalize(s).replace(/'/g, '').replace(/\s+/g, '-').slice(0, 60) || 'clip';
}

function hash8(s) {
  return crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
}

/* ---------------- phrase collection ---------------- */
function collectPhrases() {
  const set = new Map(); // key -> original spoken text (preprocessed)
  const add = (raw) => {
    const spoken = preprocess(raw);
    const key = normalize(spoken);
    if (!key || key.length < 2) return;
    if (!set.has(key)) set.set(key, spoken);
  };

  const UI = [
    'Amazing!', 'Great job!', 'You got it!', 'Wonderful!', 'Super!', 'You are a star!',
    'Almost! Try again.', "Good try! Let's look again.", 'You can do it! Try once more.',
    'So close! Have another go.', 'Almost! Let us try again.',
    "Welcome to Let's Learn! Let's get started!",
    'Tap your class! Baby Class, Middle Class, Top Class, Primary One, Primary Two, or Primary Three!',
    "Let's learn! Pick an activity you like!",
    'Welcome, little learner! Let\'s have fun learning!',
    'Flip the cards and find the matching pairs!',
    'Tap the numbers in order, starting from one!',
    'Tap the numbers in order, from smallest to biggest!',
    'Tap these numbers in order!',
    'Perfect tracing! You did it!',
    'Almost there! Keep tracing the dotted path!',
    'Beautiful! Your picture is finished!',
    'That PIN is not correct. Try again!',
    'Add a few more shapes to finish your picture!',
    'Super tracing!', 'What a beautiful picture!', 'What a wonderful picture!',
    'Tap a shape to pick it, then tap the canvas to place it! Drag shapes to move them.',
    'Pick a shape and a color, then tap the canvas to add it!',
    'Progress has been reset.',
    'Find the same pictures! Tap two the same!',
    'Find the different one!',
    'Put the picture together! Tap each piece to place it.',
    'Match the picture to its word!',
    'What comes next in the pattern?',
    'Which side has more?',
    'Tap Next to continue!',
    'You ordered all the numbers! No mistakes — perfect!',
    'You ordered all the numbers! Well done!',
    'Pop the balloon with the answer!',
    'Counting and numbers! Let us count together!',
    'Letters and sounds! Let us say our letters!',
    'Colours! Red, blue, yellow — let us play with colours!',
    'Let us draw and trace together!',
    'Shapes! Circles, squares and triangles!',
    'Let us play matching and puzzles!',
    'Songs! Let us sing together!',
    'Animals! What does the dog say? Woof woof!',
    'My body! Let us learn about our body!',
    'My family and my home!',
    'A seed grows into a plant, and then into a big tree. What comes next?',
    'An egg hatches into a chick. What does the chick grow into?',
    'The caterpillar makes a chrysalis. What comes out?',
    'Day, night, day... what comes next?',
    'The baby grows into a child. What does the child grow into?',
    'Red, yellow, red, yellow. What comes next?',
    'Blue, green, blue, green. What comes next?',
    'Triangle, circle, triangle, circle. What comes next?',
    'Star, moon, star, moon. What comes next?',
    'Red, yellow, green. Red, yellow... what comes next?',
    'Apple, banana, grapes. Apple, banana... what comes next?',
    'The house is missing its roof! Which piece fits?',
    'The car is missing its wheel! Which piece fits?',
    'The face is missing an eye! Which piece fits?',
    'The tree is missing its top! Which piece fits?',
    'The flower is missing a petal! Which piece fits?',
    'Find mummy!', 'Find daddy!', 'Find baby!', 'Find brother!', 'Find sister!', 'Find grandma!',
    'Find the red one!', 'Find the yellow one!', 'Find the blue one!', 'Find the green one!',
    'Find the orange one!', 'Find the purple one!', 'Find the pink one!', 'Find the brown one!',
    'Find the same shape! Find the circle!', 'Find the same shape! Find the square!',
    'Find the same shape! Find the triangle!',
    'Moo! Moo! Which animal says that?', 'Woof! Woof! Which animal says that?',
    'Meow! Meow! Which animal says that?', 'Quack! Quack! Which animal says that?',
    'Cluck! Cluck! Which animal says that?', 'Roar! Which animal says that?',
    'Baa! Baa! Which animal says that?', 'Oink! Oink! Which animal says that?',
    'An apple is a fruits thing! Where does it go?',
    'Where does it belong? Find the bedroom!',
    'Where does it belong? Find the bathroom!',
    'Where does it belong? Find the kitchen!',
    'Where does it belong? Find the living room!',
    'Trace the circle. Start at the dots and follow the path!',
    'Trace the square. Start at the dots and follow the path!',
    'Trace the triangle. Start at the dots and follow the path!',
    'Trace the star. Start at the dots and follow the path!',
    'Trace the heart. Start at the dots and follow the path!',
    'Let\'s color the apple! Pick a color and tap the picture.',
    'Let\'s color the flower! Pick a color and tap the picture.',
    'Let\'s color the house! Pick a color and tap the picture.',
    'Let\'s color the fish! Pick a color and tap the picture.',
    'Let\'s color the butterfly! Pick a color and tap the picture.',
    'Let\'s color the tree! Pick a color and tap the picture.',
    'Let\'s color the balloon! Pick a color and tap the picture.'
  ];
  UI.forEach(add);

  const LETTER_PICS = {
    A: ['Apple', 'ah'], B: ['Bus', 'buh'], C: ['Cat', 'kuh'], D: ['Dog', 'duh'],
    E: ['Elephant', 'eh'], F: ['Frog', 'fuh'], G: ['Giraffe', 'guh'], H: ['House', 'huh'],
    I: ['Ice cream', 'ih'], J: ['Jug', 'juh'], K: ['Kite', 'kuh'], L: ['Lion', 'luh'],
    M: ['Monkey', 'mmm'], N: ['Nest', 'nnn'], O: ['Orange', 'oh'], P: ['Pig', 'puh'],
    Q: ['Queen', 'kwuh'], R: ['Rabbit', 'rrr'], S: ['Sun', 'sss'], T: ['Turtle', 'tuh'],
    U: ['Umbrella', 'uh'], V: ['Van', 'vuh'], W: ['Watch', 'wuh'], X: ['Box', 'ks'],
    Y: ['Yo-yo', 'yuh'], Z: ['Zebra', 'zzz']
  };
  for (const ch of Object.keys(LETTER_PICS)) {
    const [word, ph] = LETTER_PICS[ch];
    add(`Find the letter ${ch}.`);
    add(`Find the letter ${ch}! ${ch} says ${ph}, like ${word}!`);
    add(`${ch} says ${ph}. ${ch} for ${word}!`);
    add(`${word} begins with the letter ${ch}. ${ch} says ${ph}, ${ph}, like ${word}!`);
    add(`${word}. ${word}.`);
    add(`This is the letter ${ch}.`);
    add(`Big ${ch}, little ${ch.toLowerCase()}. Find the little ${ch.toLowerCase()}!`);
    add(`Trace the ${ch}. Start at the dots and follow the path!`);
  }

  for (let n = 0; n <= 20; n++) {
    add(String(n));
    add(`Where is the number ${n}?`);
    add(`This is the number ${n}.`);
    add(`Find the number ${n}.`);
    add(`Trace the ${n}. Start at the dots and follow the path!`);
    if (n >= 1 && n <= 10) {
      add(`Can you find ${NUM_WORDS[n]}? Count with me! ${Array.from({ length: n }, (_, i) => NUM_WORDS[i + 1]).join('... ')}`);
    }
  }
  for (let n = 1; n <= 12; n++) add(`Tap in order, 1 to ${n}!`);

  const SHAPES = ['Circle', 'Square', 'Triangle', 'Star', 'Heart', 'Rectangle', 'Oval', 'Diamond', 'Moon'];
  SHAPES.forEach(s => {
    add(`This is a ${s}. A ${s}!`);
    add(`Tap the ${s}.`);
    add(`Tap the ${s}!`);
    add(`Find the same shape! Find the ${s.toLowerCase()}!`);
  });

  const COLORS = ['Red', 'Yellow', 'Blue', 'Green', 'Orange', 'Purple', 'Pink', 'Brown'];
  COLORS.forEach(c => {
    add(`This is ${c}. ${c}!`);
    add(`Tap the ${c} one.`);
    add(`Tap the ${c} color!`);
    add(`Find the ${c.toLowerCase()} one!`);
  });

  const OBJECTS = ['apple', 'banana', 'star', 'chick', 'flower', 'balloon', 'strawberry', 'butterfly', 'turtle'];
  OBJECTS.forEach(o => add(`Count the ${o}. How many are there?`));

  // curriculum math (common small facts + a few larger ones used in lessons)
  const maths = [
    [2, 3, '+'], [4, 2, '+'], [3, 3, '+'], [5, 2, '+'], [3, 4, '+'], [5, 3, '+'],
    [6, 2, '+'], [4, 5, '+'], [7, 3, '+'], [9, 6, '+'], [12, 5, '+'], [15, 4, '+'],
    [34, 27, '+'], [48, 36, '+'], [56, 29, '+'],
    [5, 2, '-'], [7, 3, '-'], [9, 4, '-'], [8, 5, '-'], [14, 6, '-'], [17, 8, '-'],
    [13, 7, '-'], [72, 38, '-'], [91, 47, '-'], [65, 28, '-'],
    [2, 3, '×'], [3, 2, '×'], [2, 5, '×'], [4, 2, '×'], [5, 2, '×'],
    [2, 4, '×'], [2, 8, '×'], [5, 3, '×'], [5, 6, '×'], [10, 2, '×'], [10, 3, '×']
  ];
  maths.forEach(([a, b, op]) => {
    if (op === '×') add(`${a} groups of ${b}. How many in total?`);
    else if (op === '-') add(`${a} take away ${b}. How many are left?`);
    else add(`${a} plus ${b}. How many in total?`);
  });
  // math balloon game — small facts
  for (let a = 2; a <= 10; a++) {
    for (let b = 2; b <= 10; b++) {
      add(`${a} + ${b}. Pop the balloon with the answer!`);
      if (a >= b) add(`${a} - ${b}. Pop the balloon with the answer!`);
    }
  }

  // harvest lesson texts from data.js
  const data = fs.readFileSync(path.join(ROOT, 'public', 'js', 'data.js'), 'utf8');
  const callRe = /(infoStep|qStep|readStep|wordStep|findNumber|findLetter)\s*\(([^)]*)\)/g;
  let m;
  while ((m = callRe.exec(data))) {
    const args = [];
    const argRe = /'((?:\\'|[^'])*)'|"((?:\\"|[^"])*)"/g;
    let a;
    const chunk = m[2];
    while ((a = argRe.exec(chunk))) args.push((a[1] || a[2] || '').replace(/\\'/g, "'"));
    const fn = m[1];
    if (fn === 'infoStep') add(args[1] || args[0]);
    else if (fn === 'qStep') add(args[0]);
    else if (fn === 'readStep') add('Read along. ' + (args[0] || ''));
    else if (fn === 'wordStep') add(`${args[0]}. ${args[0]}.`);
    else if (fn === 'findNumber') add(args[0]);
    else if (fn === 'findLetter') add(`Find the letter ${args[0]}.`);
  }
  // leftover quoted speak: '...'
  const speakRe = /speak:\s*'((?:\\'|[^'])*)'/g;
  while ((m = speakRe.exec(data))) add(m[1].replace(/\\'/g, "'"));

  const puzzles = fs.readFileSync(path.join(ROOT, 'public', 'js', 'puzzles.js'), 'utf8');
  const pzSpeak = /speak:\s*'((?:\\'|[^'])*)'/g;
  while ((m = pzSpeak.exec(puzzles))) add(m[1].replace(/\\'/g, "'"));
  const pzSpeak2 = /speak:\s*`([^`$]*)`/g;
  while ((m = pzSpeak2.exec(puzzles))) add(m[1]);

  const nav = fs.readFileSync(path.join(ROOT, 'public', 'js', 'navigation.js'), 'utf8');
  const navSpeak = /\.speak\(\s*`([^`$]*)`|\.speak\(\s*'((?:\\'|[^'])*)'/g;
  while ((m = navSpeak.exec(nav))) add((m[1] || m[2] || '').replace(/\\'/g, "'"));

  return set;
}

/* ---------------- TTS ---------------- */
function ttsGoogle(text) {
  return new Promise((resolve, reject) => {
    const q = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${q}&tl=en&client=tw-ob`;
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error('google tts ' + res.statusCode));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.setTimeout(20000, () => { req.destroy(new Error('google timeout')); });
    req.on('error', reject);
  });
}

let _edgeMod = null;
let _edgeReady = [];

async function getEdgeEngine() {
  if (!_edgeMod) {
    let mod = await import('msedge-tts').catch(() => null);
    if (!mod) throw new Error('msedge-tts not installed');
    if (!mod.MsEdgeTTS && mod.default) mod = mod.default;
    if (!mod.MsEdgeTTS) throw new Error('MsEdgeTTS missing');
    _edgeMod = mod;
  }
  if (_edgeReady.length) return _edgeReady.pop();
  const tts = new _edgeMod.MsEdgeTTS();
  await tts.setMetadata(VOICE, _edgeMod.OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  return tts;
}

async function ttsEdge(text) {
  const tts = await getEdgeEngine();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'll-voice-'));
  try {
    const { audioFilePath } = await tts.toFile(tmp, text, { rate: '-8%', pitch: '+4Hz', volume: '+0%' });
    return fs.readFileSync(audioFilePath);
  } finally {
    _edgeReady.push(tts);
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* ignore */ }
  }
}

async function synth(text) {
  try {
    const buf = await ttsEdge(text);
    if (buf && buf.length > 800) return buf;
  } catch (e) {
    /* fall through */
  }
  const buf = await ttsGoogle(text);
  if (!buf || buf.length < 400) throw new Error('empty audio');
  return buf;
}

function writeLibrary(entries) {
  const lines = Object.keys(entries).sort().map(k => {
    const p = entries[k].replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const key = k.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `    '${key}': '${p}'`;
  });
  const src = `/* ==========================================================================
   🌈 LET'S LEARN — voice-library.js
   AUTO-GENERATED by tools/build-voice-pack.js — do not edit by hand.

   Every phrase maps to a locally-bundled MP3 of the same teacher voice.
   The audio engine checks this library FIRST, so the voice is identical
   on every device and works fully offline.
   ========================================================================== */

window.LLVoice = (function () {
  const LIB = {
${lines.join(',\n')}
  };

  function normalize(s) {
    return String(s || '').toLowerCase()
      .replace(/[^a-z0-9\\s']/g, ' ')
      .replace(/\\s+/g, ' ')
      .trim();
  }

  function lookup(text) {
    const key = normalize(text);
    return LIB[key] || null;
  }

  function has(text) { return !!lookup(text); }

  function allUrls() {
    const seen = {};
    const out = [];
    Object.keys(LIB).forEach(k => {
      const u = LIB[k];
      if (!seen[u]) { seen[u] = 1; out.push(u); }
    });
    return out;
  }

  return { lookup, has, normalize, LIB, allUrls };
})();
`;
  fs.writeFileSync(LIB_FILE, src);
}

async function main() {
  fs.mkdirSync(PHRASE_DIR, { recursive: true });
  const phrases = collectPhrases();
  console.log('🎙️  Voice pack: ' + phrases.size + ' unique phrases  (voice: ' + VOICE + ')');

  const entries = {};
  const files = [];
  let ok = 0, skip = 0, fail = 0;
  const list = [...phrases.entries()];
  const CONCURRENCY = 4;

  async function one(i) {
    const [key, spoken] = list[i];
    const fileRel = 'assets/audio/phrases/' + hash8(key) + '-' + slug(spoken) + '.mp3';
    const fileAbs = path.join(ROOT, 'public', fileRel);
    entries[key] = fileRel;
    if (fs.existsSync(fileAbs) && fs.statSync(fileAbs).size > 800) {
      skip++;
      files.push('/' + fileRel);
      return;
    }
    process.stdout.write('  [' + (i + 1) + '/' + list.length + '] ' + spoken.slice(0, 70) + '\n');
    try {
      const buf = await synth(spoken);
      fs.mkdirSync(path.dirname(fileAbs), { recursive: true });
      fs.writeFileSync(fileAbs, buf);
      ok++;
      files.push('/' + fileRel);
    } catch (e) {
      fail++;
      console.error('    ✗', e.message);
      delete entries[key];
    }
  }

  let next = 0;
  async function worker() {
    while (next < list.length) {
      const i = next++;
      await one(i);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  writeLibrary(entries);
  fs.writeFileSync(MANIFEST, JSON.stringify({ voice: VOICE, count: Object.keys(entries).length, files }, null, 2));
  console.log('✅ wrote', Object.keys(entries).length, 'clips  (new', ok + ', cached', skip + ', failed', fail + ')');
  console.log('   ', path.relative(ROOT, LIB_FILE));
  console.log('   ', path.relative(ROOT, MANIFEST));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
