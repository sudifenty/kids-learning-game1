/* ==========================================================================
   LET'S LEARN — tools/render-media.js
   Produces the entire ORIGINAL media library:
   - 6 animated videos (SVG frames → PNG → H.264 MP4) with our voice + music
   - 8 songs (original arrangements of public-domain melodies + our voice)
   - pronunciation audio clips, thumbnails, illustrations
   - media/db/media.json (full license & metadata records)

   All artwork, music arrangements and voice recordings are Let's Learn
   originals → CC0, fully authorized for self-hosting and redistribution.
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const { execFile, execFileSync } = require('child_process');
const { melodyWav, writeWav, mix, MELODIES, SR } = require('./synth');

global.window = global;
require('../public/js/data.js');
const D = global.LLData;

const ROOT = path.join(__dirname, '..');
const MEDIA = path.join(ROOT, 'media');
const TMP = '/tmp/ll-frames';
const VOICE = path.join(MEDIA, 'raw/voice');

const W = 640, H = 480;

/* ------------------------------------------------------------------ */
/*  small helpers                                                      */
/* ------------------------------------------------------------------ */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function readWav(file) {
  const buf = fs.readFileSync(file);
  const dataOff = 44; // our writer: 'data' at 36, size at 40, samples at 44
  const n = (buf.length - dataOff) / 2;
  const s = new Float32Array(n);
  for (let i = 0; i < n; i++) s[i] = buf.readInt16LE(dataOff + i * 2) / 32768;
  return s;
}

function melToDuration(name, minDur) {
  const base = MELODIES[name](120, 1);
  const samples = melodyWav(base.notes, base.bpm);
  const onePass = samples.length / SR;
  const passes = Math.max(1, Math.ceil((minDur + 1) / onePass));
  const m = MELODIES[name](120, passes);
  return { notes: m.notes, bpm: m.bpm };
}

function melodyFile(name, minDur, outWav) {
  const m = melToDuration(name, minDur);
  const s = melodyWav(m.notes, m.bpm, { leadIn: 0.6 });
  writeWav(s, outWav);
  return outWav;
}

/* mix melody + vocal into one wav */
function mixAudio(melWav, vocalMp3, vocalDelay, outWav, melGain, vocalGain) {
  const parts = [melodyGain(readWav(melWav), melGain || 1)];
  if (vocalMp3 && fs.existsSync(vocalMp3)) {
    const tmpVocal = TMP + '/vocal.wav';
    execFileSync('ffmpeg', ['-y', '-i', vocalMp3, '-ac', '1', '-ar', String(SR), tmpVocal]);
    parts.push({ samples: melodyGain(readWav(tmpVocal), vocalGain || 1), delay: vocalDelay || 2 });
  }
  const out = mix(parts);
  // soft clip protection
  for (let i = 0; i < out.length; i++) {
    if (out[i] > 0.92) out[i] = 0.92;
    else if (out[i] < -0.92) out[i] = -0.92;
  }
  writeWav(out, outWav);
  return outWav;
}
function melodyGain(s, g) { if (g === 1) return s; const o = new Float32Array(s.length); for (let i = 0; i < s.length; i++) o[i] = s[i] * g; return o; }

/* ------------------------------------------------------------------ */
/*  SVG drawing helpers (640x480)                                      */
/* ------------------------------------------------------------------ */
const sky = (t, b) => `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#sk)"/>`;
const sun = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffd75e"/><circle cx="${x}" cy="${y}" r="${r * 1.4}" fill="#ffd75e" opacity="0.28"/>`;
const cloud = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="40" cy="30" rx="34" ry="15" fill="#fff" opacity="0.85"/><ellipse cx="22" cy="22" rx="18" ry="12" fill="#fff" opacity="0.9"/><ellipse cx="58" cy="22" rx="16" ry="11" fill="#fff" opacity="0.9"/></g>`;
const hills = () => `<path d="M0 420 Q 160 360 320 415 T 640 405 L 640 480 L 0 480 Z" fill="#8ed98a" opacity="0.5"/><path d="M0 452 Q 220 400 430 448 T 640 442 L 640 480 L 0 480 Z" fill="#5fbf6b" opacity="0.45"/>`;
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
const txt = (x, y, size, str, color, bold, extra) => `<text x="${x}" y="${y}" font-family="DejaVu Sans" font-size="${size}" font-weight="${bold ? 800 : 400}" fill="${color || '#33385c'}" text-anchor="middle"${extra || ''}>${esc(str)}</text>`;
const oTxt = (x, y, size, str, color, sw) => `<text x="${x}" y="${y}" font-family="DejaVu Sans" font-size="${size}" font-weight="800" text-anchor="middle" stroke="#ffffff" stroke-width="${sw || Math.max(3, size * 0.09)}" paint-order="stroke" fill="${color}">${esc(str)}</text>`;
const bigLetter = (x, y, size, ch, color) => `<text x="${x}" y="${y}" font-family="DejaVu Sans" font-size="${size}" font-weight="800" text-anchor="middle" stroke="#33385c" stroke-width="${Math.max(4, size * 0.045)}" paint-order="stroke" fill="${color}">${ch}</text>`;

function apple(x, y, s) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <path d="M0 -6 C -11 -18 -25 -10 -24 5 C -23 23 -10 33 0 33 C 10 33 23 23 24 5 C 25 -10 11 -18 0 -6 Z" fill="#ef4444" stroke="#33385c" stroke-width="2.6"/>
    <ellipse cx="-9" cy="9" rx="4.5" ry="8.5" fill="#fff" opacity="0.5" transform="rotate(-22 -9 9)"/>
    <rect x="-2.2" y="-19" width="4.4" height="11" rx="2.2" fill="#92400e"/>
    <ellipse cx="7" cy="-16" rx="8" ry="4.5" fill="#22c55e" transform="rotate(-28 7 -16)"/>
  </g>`;
}

function starSVG(cx, cy, r, color, rot) {
  const pts = D.starPoints(cx, cy, r, r * 0.45);
  return `<polygon points="${pts}" fill="${color}" stroke="#33385c" stroke-width="3" stroke-linejoin="round" transform="rotate(${rot || 0} ${cx} ${cy})"/>`;
}

function balloon(x, y, c, s) {
  return `<g transform="translate(${x},${y}) scale(${s || 1})">
    <ellipse cx="0" cy="0" rx="26" ry="34" fill="${c}" stroke="#33385c" stroke-width="3"/>
    <ellipse cx="-8" cy="-12" rx="6" ry="10" fill="#fff" opacity="0.5" transform="rotate(-20 -8 -12)"/>
    <polygon points="-5,32 5,32 0,42" fill="${c}" stroke="#33385c" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M0 42 Q -10 58 -2 76" stroke="#33385c" stroke-width="2.5" fill="none"/>
  </g>`;
}

function panda(x, y, s, bob) {
  const inner = D.CHARACTERS.panda.svg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '');
  return `<g transform="translate(${x},${y + (bob || 0)}) scale(${s})">${inner}</g>`;
}

function dog(x, y, s, wag) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <g transform="rotate(${wag || 0} 34 10)"><ellipse cx="34" cy="2" rx="8" ry="16" fill="#b45309" stroke="#33385c" stroke-width="2.5"/></g>
    <ellipse cx="-2" cy="14" rx="26" ry="18" fill="#d97706" stroke="#33385c" stroke-width="2.5"/>
    <ellipse cx="16" cy="14" rx="18" ry="16" fill="#d97706" stroke="#33385c" stroke-width="2.5"/>
    <ellipse cx="16" cy="7" rx="11" ry="13" fill="#fbbf24" stroke="#33385c" stroke-width="2.5"/>
    <ellipse cx="20" cy="15" rx="7" ry="5" fill="#33385c"/>
    <circle cx="22.5" cy="13" r="1.9" fill="#fff"/>
    <ellipse cx="30" cy="20" rx="5" ry="6" fill="#d97706" stroke="#33385c" stroke-width="2"/>
    <path d="M11 17 Q 14 24 9 27" stroke="#33385c" stroke-width="2" fill="none"/>
    <rect x="-22" y="27" width="9" height="15" rx="3.5" fill="#b45309" stroke="#33385c" stroke-width="2"/>
    <rect x="-7" y="29" width="9" height="15" rx="3.5" fill="#b45309" stroke="#33385c" stroke-width="2"/>
    <rect x="10" y="27" width="9" height="15" rx="3.5" fill="#b45309" stroke="#33385c" stroke-width="2"/>
    <rect x="25" y="29" width="9" height="15" rx="3.5" fill="#b45309" stroke="#33385c" stroke-width="2"/>
  </g>`;
}

function bone(x, y, s, rot) {
  return `<g transform="translate(${x},${y}) scale(${s}) rotate(${rot || 0})">
    <rect x="-22" y="-6" width="44" height="12" rx="6" fill="#fff8e1" stroke="#33385c" stroke-width="2.5"/>
    <circle cx="-22" cy="-6" r="8" fill="#fff8e1" stroke="#33385c" stroke-width="2.5"/>
    <circle cx="-22" cy="6" r="8" fill="#fff8e1" stroke="#33385c" stroke-width="2.5"/>
    <circle cx="22" cy="-6" r="8" fill="#fff8e1" stroke="#33385c" stroke-width="2.5"/>
    <circle cx="22" cy="6" r="8" fill="#fff8e1" stroke="#33385c" stroke-width="2.5"/>
  </g>`;
}

function confetti(t, seed, n) {
  const rnd = mulberry32(seed);
  const cols = ['#ef4444', '#facc15', '#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899'];
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = rnd() * W, speed = 60 + rnd() * 120, size = 6 + rnd() * 8;
    const y = ((t * speed + rnd() * H * 2) % (H + 60)) - 30;
    const rot = (t * 90 + rnd() * 360) % 360;
    out += `<rect x="${x}" y="${y}" width="${size}" height="${size * 0.6}" rx="${rnd() > 0.5 ? size / 2 : 2}" fill="${cols[i % cols.length]}" transform="rotate(${rot} ${x} ${y})"/>`;
  }
  return out;
}

/* trace-progress stroke along a waypoint polyline */
function tracePath(pts, progress, scale, ox, oy, color) {
  // pts: [x,y] in 0..100 space
  let d = 'M';
  let len = 0;
  for (let i = 0; i < pts.length; i++) {
    const x = ox + pts[i][0] * scale, y = oy + pts[i][1] * scale;
    d += (i === 0 ? '' : ' L') + x.toFixed(1) + ' ' + y.toFixed(1);
    if (i > 0) len += Math.hypot((pts[i][0] - pts[i - 1][0]) * scale, (pts[i][1] - pts[i - 1][1]) * scale);
  }
  const shown = len * Math.max(0, Math.min(1, progress));
  return `<path d="${d}" fill="none" stroke="#cfd8f0" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${len.toFixed(1)}" stroke-dashoffset="${len.toFixed(1)}"/>
          <path d="${d}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${len.toFixed(1)}" stroke-dashoffset="${(len - shown).toFixed(1)}"/>`;
}

function frameSVG(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`;
}

/* ------------------------------------------------------------------ */
/*  SCENES                                                             */
/* ------------------------------------------------------------------ */

function sceneWelcome(t) {
  const bob = Math.sin(t * 4) * 8;
  let s = sky('#7ec8ff', '#dff3ff') + sun(560, 80, 44) + cloud(80, 70, 1) + cloud(380, 40, 0.7) + hills();
  s += panda(320, 300, 1.9, bob);
  if (t > 0.5) s += oTxt(320, 110, 58, 'WELCOME TO', '#e8458b');
  if (t > 1.6) {
    s += oTxt(320, 178, 74, "LET'S LEARN", '#2f7de1');
    s += starSVG(120, 120, 18, '#ffd75e', t * 30) + starSVG(540, 150, 14, '#f472b6', -t * 40) + starSVG(200, 420, 16, '#22c55e', t * 20);
  }
  if (t > 3) s += oTxt(320, 240, 34, 'Ready to learn and play?', '#f97316');
  if (t > 5) s += txt(100, 420, 30, '♪', '#8b5cf6') + txt(540, 380, 30, '♪', '#ec4899') + txt(420, 440, 26, '♪', '#3b82f6') + txt(150, 300, 24, '♪', '#f97316');
  if (t > 8) s += oTxt(320, 300, 30, 'Let us sing and play together!', '#2fa96b');
  if (t > 11) s += confetti(t - 11, 7, 40);
  return frameSVG(s);
}

function sceneAlphabet(t) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const cols = ['#e8458b', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
  let s = sky('#8ed3ff', '#eaf7ff') + sun(90, 80, 40) + cloud(500, 60, 0.9) + hills();
  if (t < 3.2) {
    const p = Math.min(1, t / 3.2);
    s += oTxt(320, 150, 56, '♪ The Alphabet Song ♪', '#e8458b');
    s += oTxt(320, 220, 34, 'Sing along with me!', '#2f7de1');
    s += txt(120, 400, 34, '♪', '#8b5cf6') + txt(520, 380, 30, '♪', '#ec4899') + txt(500, 440, 26, '♪', '#22c55e');
    s += `<g opacity="${p}">${starSVG(180, 120, 16, '#ffd75e', 0)}${starSVG(460, 130, 12, '#f472b6', 20)}</g>`;
  } else if (t < 3.2 + 26 * 1.85) {
    const idx = Math.min(25, Math.floor((t - 3.2) / 1.85));
    const local = (t - 3.2) % 1.85;
    const ch = letters[idx];
    const col = cols[idx % cols.length];
    const pop = local < 0.25 ? 0.8 + (local / 0.25) * 0.25 : 1.02 - Math.min(0.12, (local - 0.25) * 0.15);
    const bob = Math.sin(t * 3) * 6;
    s += `<g transform="translate(0 ${bob})">`;
    s += bigLetter(320, 250, 170, ch, col);
    s += txt(320, 320, 40, ch.toLowerCase(), col, true);
    s += oTxt(320, 380, 26, `${ch} for ${D.LETTER_PICS[ch][1]}`, '#33385c', 5);
    s += txt(120, 400, 34, '♪', '#8b5cf6') + txt(540, 380, 30, '♪', '#ec4899');
    s += `<g opacity="${pop}">`;
    s += apple(500, 320, 0.9) + starSVG(130, 150, 16, '#ffd75e', t * 20) + starSVG(520, 130, 12, '#f472b6', -t * 30);
    s += `</g></g>`;
  } else {
    const e = Math.min(1, (t - 3.2 - 26 * 1.85) / 3);
    s += panda(320, 300, 1.5, Math.sin(t * 6) * 10);
    s += oTxt(320, 120, 46, 'You sang A to Z!', '#e8458b');
    s += `<g opacity="${e}">${confetti(t, 21, 50)}</g>`;
    s += starSVG(140, 160, 18, '#ffd75e', t * 40) + starSVG(500, 180, 15, '#f472b6', -t * 30) + starSVG(320, 420, 16, '#22c55e', t * 25);
  }
  return frameSVG(s);
}

function sceneLetterA(t) {
  let s = sky('#a8d4ff', '#f0f9ff') + sun(560, 80, 42) + cloud(90, 60, 0.9) + cloud(420, 90, 0.7) + hills();
  const bob = Math.sin(t * 3) * 7;
  if (t < 3) {
    s += oTxt(320, 130, 44, 'Meet the letter', '#33385c');
    s += bigLetter(320, 300, 190, 'A', '#2f7de1');
    s += starSVG(140, 160, 18, '#ffd75e', t * 40) + starSVG(520, 150, 14, '#f472b6', -t * 30);
  } else if (t < 9) {
    s += `<g transform="translate(0 ${bob})">`;
    s += bigLetter(320, 200, 110, 'A', '#2f7de1');
    s += apple(320, 330, 1.9);
    s += `</g>`;
    s += oTxt(320, 96, 38, 'A is for Apple!', '#e8458b');
    s += txt(320, 420, 30, 'ah ah ah!', '#33385c', true);
  } else if (t < 15) {
    s += `<g transform="translate(0 ${bob})">`;
    s += bigLetter(320, 190, 100, 'A', '#2f7de1');
    s += txt(240, 210, 46, 'a', '#2f7de1', true);
    s += apple(460, 320, 1.2);
    s += `</g>`;
    s += txt(120, 420, 34, '♪', '#8b5cf6') + txt(540, 400, 30, '♪', '#ec4899') + txt(420, 450, 26, '♪', '#22c55e');
    s += oTxt(320, 90, 34, 'Sing: A A A!', '#f97316');
  } else if (t < 21) {
    const p = Math.min(1, Math.max(0, (t - 15) / 5.5));
    s += oTxt(320, 80, 34, 'Now trace the A!', '#2fa96b');
    const Apts = D.TRACE_TEMPLATES.letter.A;
    s += tracePath(Apts, p, 3.1, 165, 60, '#2f7de1');
    s += txt(320, 120, 60, 'A', '#dfe9ff', true);
  } else if (t < 26) {
    const e = t - 21;
    s += bigLetter(320, 200, 150, 'A', '#e8458b');
    s += `<g opacity="${Math.min(1, e)}">${confetti(t, 5, 46)}</g>`;
    s += apple(140, 330, 1.1) + apple(500, 330, 1.1);
    s += oTxt(320, 300, 36, 'A! A! A!', '#f97316');
  } else {
    s += panda(320, 310, 1.6, Math.sin(t * 5) * 9);
    s += oTxt(320, 120, 48, 'You learned A!', '#e8458b');
    s += starSVG(140, 170, 18, '#ffd75e', t * 40) + starSVG(500, 190, 15, '#f472b6', -t * 30) + starSVG(320, 430, 16, '#22c55e', t * 25);
    s += confetti(t, 9, 40);
  }
  return frameSVG(s);
}

function sceneNumber5(t) {
  let s = sky('#ffe3b8', '#fff6e8') + sun(560, 80, 42) + cloud(80, 70, 0.9) + cloud(430, 50, 0.7) + hills();
  const apples = [];
  const show = Math.min(5, Math.floor(t / 2.1) + (t < 2.1 ? 0 : 1));
  for (let i = 0; i < show; i++) apples.push(apple(150 + i * 85, 300, 1.0));
  if (t < 2) {
    s += oTxt(320, 150, 52, "Let's count!", '#e8458b');
  } else if (t < 13.5) {
    s += apples.join('');
    s += oTxt(320, 110, 44, `Count with me!`, '#f97316');
    if (show >= 1) s += oTxt(130, 240, 34, '1', '#3b82f6');
    if (show >= 2) s += oTxt(215, 240, 34, '2', '#22c55e');
    if (show >= 3) s += oTxt(300, 240, 34, '3', '#e8458b');
    if (show >= 4) s += oTxt(385, 240, 34, '4', '#8b5cf6');
    if (show >= 5) s += oTxt(470, 240, 34, '5', '#f97316');
  } else if (t < 20) {
    s += apples.join('');
    s += bigLetter(320, 170, 120, '5', '#f97316');
    s += oTxt(320, 96, 38, 'This is the number 5!', '#e8458b');
    s += txt(120, 430, 34, '♪', '#8b5cf6') + txt(540, 410, 30, '♪', '#ec4899');
  } else {
    const e = t - 20;
    s += bigLetter(320, 170, 110, '5', '#f97316');
    s += balloon(120, 300, '#ff8a8a') + balloon(530, 290, '#8ac6ff') + balloon(460, 160, '#b3e09a');
    s += `<g opacity="${Math.min(1, e)}">${confetti(t, 13, 46)}</g>`;
    s += oTxt(320, 90, 38, 'Five! Count with me!', '#2fa96b');
  }
  return frameSVG(s);
}

function sceneRed(t) {
  let s = sky('#ffd9e8', '#fff5fa') + sun(560, 80, 42) + cloud(80, 60, 0.9) + cloud(420, 90, 0.7) + hills();
  const bob = Math.sin(t * 3) * 7;
  if (t < 2) {
    s += oTxt(320, 180, 120, 'RED', '#ef4444');
    s += starSVG(140, 150, 18, '#ffd75e', t * 40) + starSVG(510, 180, 14, '#f472b6', -t * 30);
  } else if (t < 9) {
    const show = Math.min(4, Math.floor((t - 2) / 1.8) + 1);
    s += `<g transform="translate(0 ${bob})">`;
    if (show >= 1) s += apple(140, 300, 1.4) + oTxt(140, 380, 28, 'apple', '#c62828');
    if (show >= 2) s += balloon(330, 250, '#ef4444', 1.1) + oTxt(330, 380, 28, 'balloon', '#c62828');
    if (show >= 3) s += starSVG(500, 300, 34, '#ef4444', t * 20) + oTxt(500, 380, 28, 'star', '#c62828');
    if (show >= 4) s += heartSVG(240, 200, 1.0) + oTxt(240, 290, 28, 'heart', '#c62828');
    s += `</g>`;
    s += oTxt(320, 90, 40, 'Red things!', '#e8458b');
  } else if (t < 15) {
    s += `<g transform="translate(0 ${bob})">`;
    s += apple(120, 320, 1.2) + balloon(280, 270, '#ef4444', 1.1) + heartSVG(430, 300, 1.1) + starSVG(540, 220, 30, '#ef4444', t * 25);
    s += `</g>`;
    s += oTxt(320, 100, 44, 'RED RED RED!', '#ef4444');
    s += txt(140, 440, 34, '♪', '#8b5cf6') + txt(500, 430, 30, '♪', '#ec4899');
  } else if (t < 21) {
    s += `<circle cx="320" cy="250" r="90" fill="#ef4444" stroke="#33385c" stroke-width="6"/>`;
    s += `<circle cx="320" cy="250" r="120" fill="#ef4444" opacity="0.3"/>`;
    s += oTxt(320, 260, 56, 'RED', '#fff', 6);
    s += txt(320, 380, 30, 'Red is bright and happy!', '#c62828', true);
  } else {
    s += panda(320, 310, 1.5, Math.sin(t * 5) * 9);
    s += oTxt(320, 120, 44, 'Red is happy!', '#ef4444');
    s += confetti(t, 17, 46);
    s += balloon(120, 300, '#ef4444') + balloon(530, 290, '#ef4444');
    s += starSVG(200, 420, 16, '#ffd75e', t * 30);
  }
  return frameSVG(s);
}

function heartSVG(x, y, s) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <path d="M0 14 C -20 -4 -34 8 -34 22 C -34 34 -22 42 0 26 C 22 42 34 34 34 22 C 34 8 20 -4 0 14 Z" fill="#ef4444" stroke="#33385c" stroke-width="3"/>
  </g>`;
}

function sceneDog(t) {
  let s = sky('#bfe6a0', '#f0fbe8') + sun(560, 80, 42) + cloud(80, 60, 0.9) + cloud(420, 90, 0.7) + hills();
  const wag = Math.sin(t * 8) * 25;
  const bob = Math.sin(t * 3) * 6;
  if (t < 2) {
    s += oTxt(320, 130, 100, 'DOG', '#b45309');
    s += dog(320, 340, 1.6, wag);
  } else if (t < 9) {
    s += `<g transform="translate(0 ${bob})">`;
    s += dog(320, 340, 1.6, wag);
    s += `</g>`;
    s += oTxt(320, 90, 42, 'The dog says woof woof!', '#33385c');
    s += bone(150, 260, 1.1, -15) + bone(500, 280, 1.1, 12);
    s += txt(320, 150, 36, 'Woof! Woof!', '#b45309', true);
  } else if (t < 16) {
    const run = Math.sin((t - 9) / 7 * Math.PI) * 190;
    s += `<g transform="translate(${run} ${bob})">${dog(320, 340, 1.7, wag)}</g>`;
    s += oTxt(320, 90, 40, 'Dogs love to run and play!', '#2fa96b');
    s += bone(120, 200, 0.9, 20) + ballSVG(540, 300, 0.9);
    s += txt(120, 440, 34, '♪', '#8b5cf6') + txt(540, 420, 30, '♪', '#ec4899');
  } else if (t < 21) {
    s += dog(320, 330, 1.7, wag * 2);
    s += oTxt(320, 90, 40, 'Dogs are our friends!', '#e8458b');
    s += bone(140, 200, 1.1, -10) + bone(500, 210, 1.1, 14) + bone(320, 420, 1.0, 0);
    s += heartSVG(180, 120, 0.7) + heartSVG(460, 140, 0.6);
  } else {
    const e = t - 21;
    s += dog(320, 330, 1.7, wag * 2);
    s += oTxt(320, 110, 46, 'Woof! See you soon!', '#b45309');
    s += `<g opacity="${Math.min(1, e)}">${confetti(t, 23, 46)}</g>`;
  }
  return frameSVG(s);
}

function ballSVG(x, y, s) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <circle cx="0" cy="0" r="26" fill="#3b82f6" stroke="#33385c" stroke-width="3"/>
    <path d="M-22 -13 A 26 26 0 0 1 22 -13" fill="none" stroke="#fff" stroke-width="3"/>
    <path d="M-13 -22 A 26 26 0 0 1 13 -22" fill="none" stroke="#fff" stroke-width="3"/>
    <path d="M0 -26 A 20 20 0 0 1 20 0" fill="none" stroke="#fff" stroke-width="3" opacity="0.6"/>
  </g>`;
}

/* ------------------------------------------------------------------ */
/*  RENDERING PIPELINE                                                 */
/* ------------------------------------------------------------------ */

async function rsvgPool(svgs, outDir, prefix) {
  const tmpSvg = (i) => path.join(outDir, prefix + String(i).padStart(4, '0') + '.svg');
  const outPng = (i) => path.join(outDir, prefix + String(i).padStart(4, '0') + '.png');
  svgs.forEach((s, i) => fs.writeFileSync(tmpSvg(i), s));
  const jobs = svgs.map((_, i) => ({ i }));
  let cursor = 0;
  const worker = async () => {
    while (cursor < jobs.length) {
      const j = jobs[cursor++];
      await new Promise((res, rej) => {
        execFile('rsvg-convert', ['-o', outPng(j.i), tmpSvg(j.i)], (e) => (e ? rej(e) : res()));
      });
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  for (let i = 0; i < svgs.length; i++) fs.unlinkSync(tmpSvg(i));
}

async function renderVideo(id, dur, fps, sceneFn, audioWav, outPath) {
  const frames = Math.round(dur * fps);
  console.log(`  → ${id}: rendering ${frames} frames @${fps}fps (${dur}s)`);
  fs.mkdirSync(TMP + '/' + id, { recursive: true });
  const svgs = [];
  for (let i = 0; i < frames; i++) svgs.push(sceneFn(i / fps));
  await rsvgPool(svgs, TMP + '/' + id, 'f');
  const pngPat = TMP + '/' + id + '/f%04d.png';
  execFileSync('ffmpeg', [
    '-y', '-framerate', String(fps), '-i', pngPat, '-i', audioWav,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '26', '-preset', 'veryfast',
    '-c:a', 'aac', '-b:a', '96k', '-shortest', '-movflags', '+faststart', outPath
  ], { stdio: 'ignore' });
  fs.rmSync(TMP + '/' + id, { recursive: true, force: true });
  console.log(`  → ${id}: encoded ${outPath}`);
}

function durationOf(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim();
  return Math.round(parseFloat(out));
}

function svgToPng(svgStr, outPath, w, h) {
  const tmp = TMP + '/art.svg';
  fs.writeFileSync(tmp, svgStr);
  execFileSync('rsvg-convert', ['-w', String(w || W), '-h', String(h || H), '-o', outPath, tmp]);
}

/* ------------------------------------------------------------------ */
/*  MAIN                                                               */
/* ------------------------------------------------------------------ */

async function main() {
  fs.mkdirSync(TMP, { recursive: true });
  const created = '2026-08-12T00:00:00.000Z';

  /* ---------- songs (mp3) ---------- */
  const SONGS = [
    { id: 'song-alphabet', title: 'The Alphabet Song', melody: 'twinkle', vocal: null, cat: 'Alphabet Songs', subj: 'english', topic: 'Alphabet', lesson: 'b-e4', skill: 'Letter recognition', art: 'alphabet' },
    { id: 'song-count-with-me', title: 'Count With Me', melody: 'frere', vocal: 'number-5.mp3', cat: 'Counting Songs', subj: 'maths', topic: 'Counting 1–5', lesson: 'b-m4', skill: 'Counting', art: 'numbers' },
    { id: 'song-colors', title: 'Colors Around Us', melody: 'mary', vocal: 'colors.mp3', cat: 'Color Songs', subj: 'english', topic: 'Colors', lesson: 'b-c4', skill: 'Color recognition', art: 'colors' },
    { id: 'song-shapes', title: 'Shape Adventure', melody: 'shapes', vocal: 'shapes.mp3', cat: 'Shape Songs', subj: 'maths', topic: 'Shapes', lesson: 'b-m3', skill: 'Shape recognition', art: 'shapes' },
    { id: 'song-body', title: 'My Body', melody: 'body', vocal: 'body.mp3', cat: 'Body Parts Songs', subj: 'science', topic: 'Body parts', lesson: 't-s1', skill: 'Body awareness', art: 'body' },
    { id: 'song-wash-hands', title: 'Wash Your Hands', melody: 'rowrow', vocal: 'wash-hands.mp3', cat: 'Good Habits Songs', subj: 'science', topic: 'Hygiene', lesson: 'm-sst3', skill: 'Good habits', art: 'wash' },
    { id: 'song-animal-friends', title: 'Animal Friends', melody: 'oldMac', vocal: 'animal-dog.mp3', cat: 'Animal Songs', subj: 'science', topic: 'Animals', lesson: 'b-s4', skill: 'Animal recognition', art: 'animals' },
    { id: 'song-good-morning', title: 'Good Morning Song', melody: 'london', vocal: null, cat: 'Greeting Songs', subj: 'sst', topic: 'Greetings', lesson: 'b-sst3', skill: 'Greetings', art: 'sun' }
  ];

  for (const song of SONGS) {
    const mel = TMP + '/' + song.id + '-mel.wav';
    const mixWav = TMP + '/' + song.id + '-mix.wav';
    melodyFile(song.melody, 32, mel);
    const vocalPath = song.vocal ? path.join(VOICE, song.vocal) : null;
    mixAudio(mel, vocalPath, 2.2, mixWav, 0.95, 1.0);
    const out = path.join(MEDIA, 'audio/songs', song.id + '.mp3');
    execFileSync('ffmpeg', ['-y', '-i', mixWav, '-c:a', 'libmp3lame', '-b:a', '96k', out], { stdio: 'ignore' });
    console.log(`♪ song ${song.id} → ${durationOf(out)}s`);
  }

  /* ---------- videos (mp4) ---------- */
  const VIDEOS = [
    { id: 'video-welcome', dur: 15, fps: 10, scene: sceneWelcome, vocal: 'welcome.mp3', melody: 'twinkle', cat: 'General Learning', subj: 'english', topic: 'Welcome', lesson: null, skill: 'Welcome', folder: 'general' },
    { id: 'video-alphabet-song', dur: 56, fps: 8, scene: sceneAlphabet, vocal: null, melody: 'twinkle', cat: 'Alphabet', subj: 'english', topic: 'Alphabet', lesson: 'b-e4', skill: 'Letter recognition', folder: 'alphabet' },
    { id: 'video-letter-a', dur: 30, fps: 10, scene: sceneLetterA, vocal: 'letter-a.mp3', melody: 'twinkle', cat: 'Alphabet', subj: 'english', topic: 'Letter A', lesson: 'b-e4', skill: 'Letter recognition', folder: 'alphabet' },
    { id: 'video-number-5', dur: 30, fps: 10, scene: sceneNumber5, vocal: 'number-5.mp3', melody: 'frere', cat: 'Numbers', subj: 'maths', topic: 'Number 5', lesson: 'b-m4', skill: 'Number recognition', folder: 'numbers' },
    { id: 'video-color-red', dur: 25, fps: 10, scene: sceneRed, vocal: 'color-red.mp3', melody: 'mary', cat: 'Colors', subj: 'english', topic: 'Color red', lesson: 'b-c4', skill: 'Color recognition', folder: 'colors' },
    { id: 'video-animal-dog', dur: 25, fps: 10, scene: sceneDog, vocal: 'animal-dog.mp3', melody: 'oldMac', cat: 'Animals', subj: 'science', topic: 'The dog', lesson: 'b-s4', skill: 'Animal recognition', folder: 'animals' }
  ];

  for (const v of VIDEOS) {
    const mel = TMP + '/' + v.id + '-mel.wav';
    const mixWav = TMP + '/' + v.id + '-mix.wav';
    melodyFile(v.melody, v.dur, mel);
    const vocalPath = v.vocal ? path.join(VOICE, v.vocal) : null;
    mixAudio(mel, vocalPath, 1.2, mixWav, 0.5, 1.15);
    const out = path.join(MEDIA, 'videos', v.folder, v.id + '.mp4');
    await renderVideo(v.id, v.dur, v.fps, v.scene, mixWav, out);
    // thumbnail
    const thumb = path.join(MEDIA, 'thumbnails', v.id + '.jpg');
    execFileSync('ffmpeg', ['-y', '-ss', '4', '-i', out, '-frames:v', '1', '-q:v', '3', thumb], { stdio: 'ignore' });
    console.log(`🎬 video ${v.id} → ${durationOf(out)}s, thumb ok`);
  }

  /* ---------- audio pronunciation clips (copy of our voice originals) ---------- */
  const CLIPS = [
    { id: 'audio-letter-a', src: 'letter-a.mp3', cat: 'Pronunciation', subj: 'english', topic: 'Letter A', lesson: 'b-e4', folder: 'letters' },
    { id: 'audio-number-5', src: 'number-5.mp3', cat: 'Pronunciation', subj: 'maths', topic: 'Number 5', lesson: 'b-m4', folder: 'numbers' },
    { id: 'audio-color-red', src: 'color-red.mp3', cat: 'Pronunciation', subj: 'english', topic: 'Color red', lesson: 'b-c4', folder: 'colors' },
    { id: 'audio-animal-dog', src: 'animal-dog.mp3', cat: 'Pronunciation', subj: 'science', topic: 'The dog', lesson: 'b-s4', folder: 'animals' },
    { id: 'audio-welcome', src: 'welcome.mp3', cat: 'Pronunciation', subj: 'english', topic: 'Welcome', lesson: null, folder: 'general' }
  ];
  for (const c of CLIPS) {
    fs.copyFileSync(path.join(VOICE, c.src), path.join(MEDIA, 'audio', c.folder, c.id + '.mp3'));
    console.log(`🔊 clip ${c.id}`);
  }

  /* ---------- illustrations ---------- */
  const artBg = (c1, c2) => sky(c1, c2) + sun(560, 70, 40) + cloud(70, 60, 0.8) + cloud(430, 90, 0.6) + hills();
  const ILLUS = [
    { id: 'panda-welcome', svg: frameSVG(artBg('#7ec8ff', '#eaf7ff') + panda(320, 300, 2.2, 0) + oTxt(320, 100, 46, 'Welcome!', '#e8458b') + starSVG(120, 130, 18, '#ffd75e', 0) + starSVG(520, 150, 14, '#f472b6', 20)) },
    { id: 'apple', svg: frameSVG(artBg('#ffe3b8', '#fff6e8') + apple(320, 270, 3.2) + oTxt(320, 110, 44, 'Apple', '#c62828')) },
    { id: 'letter-a', svg: frameSVG(artBg('#a8d4ff', '#f0f9ff') + bigLetter(320, 260, 190, 'A', '#2f7de1') + apple(470, 380, 1.3) + oTxt(320, 110, 44, 'A is for Apple', '#e8458b')) },
    { id: 'number-5', svg: frameSVG(artBg('#ffe3b8', '#fff6e8') + bigLetter(320, 250, 170, '5', '#f97316') + apple(150, 380, 1.1) + apple(240, 380, 1.1) + apple(400, 380, 1.1) + apple(490, 380, 1.1) + oTxt(320, 100, 40, 'Count with me!', '#e8458b')) },
    { id: 'red-balloon', svg: frameSVG(artBg('#ffd9e8', '#fff5fa') + balloon(320, 250, '#ef4444', 2.0) + oTxt(320, 110, 52, 'RED', '#ef4444')) },
    { id: 'dog', svg: frameSVG(artBg('#bfe6a0', '#f0fbe8') + dog(320, 340, 2.2, 20) + oTxt(320, 100, 48, 'DOG', '#b45309') + bone(180, 240, 1.1, -15) + bone(480, 260, 1.1, 12)) }
  ];
  for (const il of ILLUS) {
    svgToPng(il.svg, path.join(MEDIA, 'images/illustrations', il.id + '.png'));
  }
  console.log('🖼️ illustrations done');

  /* song art thumbnails */
  const SONG_ART = {
    alphabet: bigLetter(320, 270, 170, 'A', '#e8458b') + txt(320, 340, 40, 'B C D E F G', '#33385c', true) + starSVG(140, 160, 18, '#ffd75e', 0),
    numbers: bigLetter(320, 270, 160, '5', '#f97316') + txt(180, 350, 36, '1 2 3 4', '#3b82f6', true) + starSVG(480, 180, 16, '#22c55e', 15),
    colors: balloon(200, 240, '#ef4444', 1.3) + balloon(320, 220, '#facc15', 1.3) + balloon(440, 250, '#3b82f6', 1.3) + txt(320, 400, 34, 'Colors!', '#8b5cf6', true),
    shapes: D.shapeSVG('circle', 90, '#3b82f6') + `<g transform="translate(260 60)">${D.shapeSVG('square', 90, '#22c55e')}</g><g transform="translate(400 60)">${D.shapeSVG('triangle', 90, '#f97316')}</g><g transform="translate(320 180)">${D.shapeSVG('star', 90, '#e8458b')}</g>` + txt(320, 420, 32, 'Shapes!', '#33385c', true),
    body: txt(320, 150, 40, 'Head', '#e8458b', true) + txt(320, 230, 40, 'Shoulders', '#f97316', true) + txt(320, 310, 40, 'Knees & Toes', '#3b82f6', true) + starSVG(140, 140, 16, '#ffd75e', 0),
    wash: `<circle cx="320" cy="250" r="80" fill="#3b82f6" stroke="#33385c" stroke-width="6"/><path d="M290 250 A 30 30 0 0 1 350 250" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/>` + txt(320, 380, 36, 'Wash your hands!', '#1d5cb0', true),
    animals: dog(180, 300, 1.5, 15) + `<g transform="translate(420 230)">${D.shapeSVG('circle', 70, '')}</g><circle cx="420" cy="230" r="24" fill="#fbbf24" stroke="#33385c" stroke-width="3"/><circle cx="414" cy="224" r="3.5" fill="#33385c"/><circle cx="428" cy="224" r="3.5" fill="#33385c"/><path d="M414 238 Q 420 244 426 238" stroke="#33385c" stroke-width="2.5" fill="none"/>` + bone(520, 330, 1.0, 10),
    sun: sun(320, 220, 90) + txt(320, 420, 34, 'Good morning!', '#e05a1c', true)
  };
  for (const song of SONGS) {
    const svgStr = frameSVG(artBg('#8ed3ff', '#eaf7ff') + (SONG_ART[song.art] || ''));
    svgToPng(svgStr, path.join(MEDIA, 'thumbnails', song.id + '.png'));
  }
  console.log('🎵 song art done');

  /* ---------- media database ---------- */
  const rec = (r) => ({
    id: r.id, title: r.title, description: r.description,
    mediaType: r.type, filePath: r.file, thumbnailPath: r.thumb,
    classLevel: r.classes || ['all'], subject: r.subject || null, topic: r.topic || null,
    lesson: r.lesson || null, skill: r.skill || null, category: r.category || null,
    language: 'en', duration: r.duration || 0,
    creator: "Let's Learn Originals",
    source: "Let's Learn (self-produced: original voice recordings, original arrangements of public-domain melodies, original vector animation)",
    license: 'CC0 1.0 Public Domain Dedication',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    attribution: '© 2026 Let\'s Learn — original production. Free to use, share and adapt.',
    approved: true, published: true, createdAt: created
  });

  const db = [];
  for (const song of SONGS) {
    db.push(rec({
      id: song.id, title: song.title,
      description: `An original Let's Learn song — ${song.skill.toLowerCase()} for ${song.topic.toLowerCase()}. Sing along!`,
      type: 'song', file: `/media/audio/songs/${song.id}.mp3`, thumb: `/media/thumbnails/${song.id}.png`,
      classes: ['baby', 'middle', 'top', 'p1', 'p2', 'p3'], subject: song.subj, topic: song.topic,
      lesson: song.lesson, skill: song.skill, category: song.cat,
      duration: durationOf(path.join(MEDIA, 'audio/songs', song.id + '.mp3'))
    }));
  }
  for (const v of VIDEOS) {
    db.push(rec({
      id: v.id, title: v.title,
      description: `An original Let's Learn video — ${v.skill.toLowerCase()}. Watch, listen and learn inside Let's Learn!`,
      type: 'video', file: `/media/videos/${v.folder}/${v.id}.mp4`, thumb: `/media/thumbnails/${v.id}.jpg`,
      classes: v.id === 'video-welcome' ? ['baby', 'middle', 'top', 'p1', 'p2', 'p3'] : ['baby', 'middle', 'top'],
      subject: v.subj, topic: v.topic, lesson: v.lesson, skill: v.skill, category: v.cat,
      duration: durationOf(path.join(MEDIA, 'videos', v.folder, v.id + '.mp4'))
    }));
  }
  for (const c of CLIPS) {
    db.push(rec({
      id: c.id, title: c.title || c.id.replace(/-/g, ' ').replace(/audio/g, 'Say').trim(),
      description: `A short pronunciation clip by our friendly Let's Learn narrator.`,
      type: 'audio', file: `/media/audio/${c.folder}/${c.id}.mp3`, thumb: '/media/thumbnails/audio-note.png',
      classes: ['baby', 'middle', 'top', 'p1', 'p2', 'p3'], subject: c.subj, topic: c.topic,
      lesson: c.lesson, skill: 'Pronunciation', category: c.cat,
      duration: durationOf(path.join(MEDIA, 'audio', c.folder, c.id + '.mp3'))
    }));
  }
  // audio-note thumb
  svgToPng(frameSVG(artBg('#8ed3ff', '#eaf7ff') + txt(320, 260, 150, '♪', '#8b5cf6', true) + txt(320, 120, 44, 'Listen!', '#e8458b')), path.join(MEDIA, 'thumbnails', 'audio-note.png'));
  db.push(rec({
    id: 'image-welcome-panda', title: 'Welcome Panda', description: 'Our friendly panda welcomes every learner.',
    type: 'image', file: '/media/images/illustrations/panda-welcome.png', thumb: '/media/images/illustrations/panda-welcome.png',
    classes: ['all'], subject: 'english', topic: 'Welcome', lesson: null, skill: null, category: 'Illustrations',
    duration: 0
  }));
  for (const il of ILLUS) {
    db.push(rec({
      id: 'image-' + il.id, title: il.id.replace(/-/g, ' ').replace(/image /, '').replace(/\b\w/g, c => c.toUpperCase()),
      description: `Original Let's Learn illustration.`,
      type: 'image', file: `/media/images/illustrations/${il.id}.png`, thumb: `/media/images/illustrations/${il.id}.png`,
      classes: ['all'], subject: null, topic: null, lesson: null, skill: null, category: 'Illustrations', duration: 0
    }));
  }

  fs.writeFileSync(path.join(MEDIA, 'db', 'media.json'), JSON.stringify(db, null, 2));
  console.log(`📚 media.json written: ${db.length} records`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
