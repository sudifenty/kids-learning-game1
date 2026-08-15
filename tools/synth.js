/* ==========================================================================
   LET'S LEARN — tools/synth.js
   Tiny WAV synthesizer: renders pleasant melodies (sine + harmonics with
   exponential decay envelopes) to 16-bit mono WAV. All melodies are our own
   arrangements of traditional public-domain tunes, or original compositions.
   ========================================================================== */

const fs = require('fs');
const SR = 44100;

const NOTE = {
  C3: 48, D3: 50, E3: 52, F3: 53, G3: 55, A3: 57, B3: 59,
  C4: 60, D4: 62, E4: 64, F4: 65, G4: 67, A4: 69, B4: 71,
  C5: 72, D5: 74, E5: 76, F5: 77, G5: 79, A5: 81, B5: 83, C6: 84
};

function freq(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

/* notes: array of [name|'R', beats] */
function melodyWav(notes, bpm, opts = {}) {
  const beat = 60 / bpm;
  const leadVol = opts.vol || 0.24;
  const leadIn = opts.leadIn || 0.5; // seconds of silence before
  const tail = opts.tail !== undefined ? opts.tail : 1.6; // fade-out tail
  let total = leadIn;
  for (const n of notes) total += (n[1] || 1) * beat;
  total += tail;
  const N = Math.ceil(total * SR);
  const s = new Float32Array(N);
  let tt = Math.round(leadIn * SR);

  for (const [name, beats] of notes) {
    const dur = beats * beat;
    const D = Math.round(dur * SR);
    if (name === 'R') { tt += D; continue; }
    const f = freq(NOTE[name]);
    for (let i = 0; i < D; i++) {
      const ph = i / SR;
      const env = Math.min(1, ph * 28) * Math.exp(-2.1 * ph);
      const w = Math.sin(2 * Math.PI * f * ph)
        + 0.33 * Math.sin(4 * Math.PI * f * ph)
        + 0.12 * Math.sin(6 * Math.PI * f * ph);
      s[tt + i] += leadVol * env * w;
      // soft bass an octave down
      s[tt + i] += 0.09 * env * Math.sin(2 * Math.PI * (f / 2) * ph);
    }
    tt += D;
  }
  // gentle fade-out
  const fadeN = Math.round((tail > 0.5 ? tail : 0.35) * SR);
  for (let i = 0; i < fadeN && i < N; i++) {
    s[N - 1 - i] *= i / fadeN;
  }
  return s;
}

/* combine arrays with optional delays (seconds) */
function mix(parts) {
  let N = 0;
  const items = parts.map(p => {
    const samples = p.samples || p;
    const delay = Math.round((p.delay || 0) * SR);
    N = Math.max(N, samples.length + delay);
    return { samples, delay };
  });
  const out = new Float32Array(N);
  for (const it of items) {
    for (let i = 0; i < it.samples.length; i++) out[it.delay + i] += it.samples[i];
  }
  return out;
}

function writeWav(samples, file) {
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + samples.length * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);   // PCM
  buf.writeUInt16LE(1, 22);   // mono
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) {
    let v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  fs.writeFileSync(file, buf);
}

/* ---------------- melody definitions (traditional, public domain) ---------------- */

const MELODIES = {
  /* Twinkle Twinkle / ABC song */
  twinkle(bpm = 104, passes = 2) {
    const phrase = [
      ['C4',1],['C4',1],['G4',1],['G4',1],['A4',1],['A4',1],['G4',2],
      ['F4',1],['F4',1],['E4',1],['E4',1],['D4',1],['D4',1],['C4',2],
      ['G4',1],['G4',1],['F4',1],['F4',1],['E4',1],['E4',1],['D4',2],
      ['G4',1],['G4',1],['F4',1],['F4',1],['E4',1],['E4',1],['D4',2],
      ['C4',1],['C4',1],['G4',1],['G4',1],['A4',1],['A4',1],['G4',2],
      ['F4',1],['F4',1],['E4',1],['E4',1],['D4',1],['D4',1],['C4',2]
    ];
    const notes = [];
    for (let p = 0; p < passes; p++) notes.push(...phrase.map(n => [n[0], n[1]]));
    return { notes, bpm };
  },

  /* Frère Jacques (counting) */
  frere(bpm = 112, passes = 3) {
    const phrase = [
      ['C4',1],['D4',1],['E4',1],['C4',1],
      ['C4',1],['D4',1],['E4',1],['C4',1],
      ['E4',1],['F4',1],['G4',2],
      ['E4',1],['F4',1],['G4',2],
      ['G4',1],['A4',1],['G4',1],['F4',1],['E4',1],['C4',1],
      ['G4',1],['A4',1],['G4',1],['F4',1],['E4',1],['C4',1],
      ['C4',1],['G4',1],['C4',2],
      ['C4',1],['G4',1],['C4',2]
    ];
    const notes = [];
    for (let p = 0; p < passes; p++) notes.push(...phrase.map(n => [n[0], n[1]]));
    return { notes, bpm };
  },

  /* Old MacDonald (animals) */
  oldMac(bpm = 116, passes = 2) {
    const phrase = [
      ['G4',1],['G4',1],['G4',1],['D4',1],
      ['E4',1],['E4',1],['D4',2],
      ['G4',1],['G4',1],['G4',1],['D4',1],
      ['E4',1],['E4',1],['D4',2],
      ['G4',1],['G4',1],['G4',1],['G4',1],['D4',1],['D4',1],['D4',1],['D4',1],
      ['E4',1],['E4',1],['D4',1],['D4',1],['G4',2]
    ];
    const notes = [];
    for (let p = 0; p < passes; p++) notes.push(...phrase.map(n => [n[0], n[1]]));
    return { notes, bpm };
  },

  /* Row Row Row Your Boat (wash hands) */
  rowrow(bpm = 108, passes = 3) {
    const phrase = [
      ['C4',1],['C4',1],['C4',1],['D4',1],['E4',1],
      ['E4',1],['D4',1],['E4',1],['F4',1],['G4',2],
      ['C5',1],['C5',1],['C5',1],['G4',1],['G4',1],['E4',1],['E4',1],['C4',1],['C4',1],
      ['G4',1],['F4',1],['E4',1],['D4',1],['C4',2]
    ];
    const notes = [];
    for (let p = 0; p < passes; p++) notes.push(...phrase.map(n => [n[0], n[1]]));
    return { notes, bpm };
  },

  /* London Bridge (greetings) */
  london(bpm = 112, passes = 3) {
    const phrase = [
      ['G4',1],['A4',1],['G4',1],['F4',1],['E4',1],['F4',1],['G4',2],
      ['D4',1],['E4',1],['F4',2],
      ['E4',1],['F4',1],['G4',2],
      ['G4',1],['A4',1],['G4',1],['F4',1],['E4',1],['F4',1],['G4',2],
      ['D4',1],['G4',1],['E4',1],['C4',2]
    ];
    const notes = [];
    for (let p = 0; p < passes; p++) notes.push(...phrase.map(n => [n[0], n[1]]));
    return { notes, bpm };
  },

  /* Mary Had a Little Lamb (colors) */
  mary(bpm = 110, passes = 3) {
    const phrase = [
      ['E4',1],['D4',1],['C4',1],['D4',1],['E4',1],['E4',1],['E4',2],
      ['D4',1],['D4',1],['D4',2],['E4',1],['G4',1],['G4',2],
      ['E4',1],['D4',1],['C4',1],['D4',1],['E4',1],['E4',1],['E4',1],['E4',1],
      ['D4',1],['D4',1],['E4',1],['D4',1],['C4',2]
    ];
    const notes = [];
    for (let p = 0; p < passes; p++) notes.push(...phrase.map(n => [n[0], n[1]]));
    return { notes, bpm };
  },

  /* original gentle melody (shapes) */
  shapes(bpm = 104, passes = 3) {
    const phrase = [
      ['C5',1],['D5',1],['E5',1],['G5',1],['E5',1],['D5',1],['C5',2],
      ['A4',1],['C5',1],['D5',1],['E5',1],['D5',1],['C5',1],['A4',2],
      ['G4',1],['A4',1],['C5',1],['D5',1],['E5',1],['D5',1],['C5',2],
      ['C5',1],['D5',1],['E5',1],['G5',1],['C6',1],['G5',1],['E5',2]
    ];
    const notes = [];
    for (let p = 0; p < passes; p++) notes.push(...phrase.map(n => [n[0], n[1]]));
    return { notes, bpm };
  },

  /* original gentle melody (body parts) */
  body(bpm = 100, passes = 3) {
    const phrase = [
      ['C5',1],['E5',1],['G5',1],['E5',1],['F5',1],['G5',1],['A5',1],['G5',1],
      ['F5',1],['G5',1],['A5',1],['C6',1],['A5',1],['G5',1],['F5',1],['E5',1],
      ['D5',1],['E5',1],['F5',1],['D5',1],['C5',1],['D5',1],['E5',1],['C5',1],
      ['G4',1],['A4',1],['B4',1],['G4',1],['C5',2],['R',2]
    ];
    const notes = [];
    for (let p = 0; p < passes; p++) notes.push(...phrase.map(n => [n[0], n[1]]));
    return { notes, bpm };
  }
};

module.exports = { melodyWav, writeWav, mix, MELODIES, SR };
