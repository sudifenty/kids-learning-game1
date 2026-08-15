/* ==========================================================================
   LET'S LEARN — tools/build-celebrations.js
   Composes the original Let's Learn celebration jingle library:
     celebration-success  — short cheerful "You did it!" (correct answers)
     celebration-big      — bigger, more exciting fanfare (milestones)
     celebration-lesson   — special completion tune (lesson finished)
   All three are ORIGINAL compositions by Let's Learn (CC0) — no third-party
   music, no licensing risk. They are encoded to small MP3s served by our
   own app (and embedded in the standalone build).
   Run:  node tools/build-celebrations.js
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { melodyWav, writeWav } = require('./synth');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'media', 'audio', 'celebration');
const TMP = '/tmp/ll-celeb.wav';

const CELEBRATIONS = [
  {
    id: 'celebration-success',
    title: 'Success Jingle',
    desc: 'Short cheerful "You did it!" fanfare for correct answers.',
    bpm: 150, vol: 0.3, leadIn: 0.05, tail: 0.3,
    notes: [
      ['C5', 0.5], ['E5', 0.5], ['G5', 0.5], ['C6', 1.5],
      ['G5', 0.5], ['E5', 0.5], ['C5', 1]
    ]
  },
  {
    id: 'celebration-big',
    title: 'Big Achievement Fanfare',
    desc: 'More exciting fanfare for major achievements and milestones.',
    bpm: 165, vol: 0.32, leadIn: 0.05, tail: 0.4,
    notes: [
      ['C5', 0.5], ['E5', 0.5], ['G5', 0.5], ['C6', 0.5],
      ['E6', 0.5], ['G6', 0.5], ['C6', 0.5], ['G5', 0.5],
      ['E5', 0.5], ['C6', 2]
    ]
  },
  {
    id: 'celebration-lesson',
    title: 'Lesson Complete Tune',
    desc: 'A warm completion melody when a lesson is finished.',
    bpm: 120, vol: 0.3, leadIn: 0.05, tail: 0.4,
    notes: [
      ['G4', 0.5], ['C5', 0.5], ['E5', 0.5], ['G5', 0.5], ['C6', 2],
      ['G5', 0.5], ['E5', 0.5], ['C6', 1.5]
    ]
  }
];

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const durations = {};

  for (const c of CELEBRATIONS) {
    const samples = melodyWav(c.notes, c.bpm, { vol: c.vol, leadIn: c.leadIn, tail: c.tail });
    writeWav(samples, TMP);
    const out = path.join(OUT_DIR, c.id + '.mp3');
    execFileSync('ffmpeg', ['-y', '-i', TMP, '-c:a', 'libmp3lame', '-b:a', '96k', out], { stdio: 'ignore' });
    const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).toString().trim());
    durations[c.id] = Math.round(dur * 10) / 10;
    console.log(`♪ ${c.id} → ${dur.toFixed(1)}s (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
  }

  /* ---- update media database (idempotent) ---- */
  const dbPath = path.join(ROOT, 'media', 'db', 'media.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const keep = db.filter(m => m.category !== 'Celebration');
  const recs = CELEBRATIONS.map(c => ({
    id: c.id, title: c.title, description: c.desc,
    mediaType: 'audio', filePath: `/media/audio/celebration/${c.id}.mp3`,
    thumbnailPath: '/media/thumbnails/audio-note.png',
    classLevel: ['all'], subject: null, topic: 'Celebration', lesson: null,
    skill: 'Celebration', category: 'Celebration', language: 'en',
    duration: durations[c.id],
    creator: "Let's Learn Originals",
    source: "Let's Learn (original composition)",
    license: 'CC0 1.0 Public Domain Dedication',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    attribution: '© 2026 Let\'s Learn — original production',
    approved: true, published: true, createdAt: '2026-08-12T00:00:00.000Z'
  }));
  fs.writeFileSync(dbPath, JSON.stringify(keep.concat(recs), null, 2));
  console.log(`📚 media.json: +${recs.length} celebration records (total ${keep.length + recs.length})`);

  /* ---- update LICENSES.md section (idempotent) ---- */
  const licPath = path.join(ROOT, 'media', 'LICENSES.md');
  let lic = fs.readFileSync(licPath, 'utf8');
  const start = lic.indexOf('## 6. Celebration jingles');
  if (start !== -1) lic = lic.slice(0, start).replace(/\s*$/, '\n');
  const section = `## 6. Celebration jingles (3)

Original short compositions by Let's Learn — CC0 1.0, fully authorized for
local hosting, redistribution and commercial use. Played only during success
celebrations (correct answers, activity completions, lesson completions,
milestones). Not part of the learning catalog.

| Title | File | Duration | Creator | Source | License | License URL | Attribution | Date added |
|---|---|---|---|---|---|---|---|---|
${CELEBRATIONS.map(c => `| ${c.title} | \`media/audio/celebration/${c.id}.mp3\` | ${durations[c.id]}s | Let's Learn Originals | Original composition | CC0 1.0 | creativecommons.org/publicdomain/zero/1.0/ | © 2026 Let's Learn | 2026-08-12 |`).join('\n')}

## 7. Policy notes
`;
  // renumber old section 7 → keep single "Policy notes" (dedupe if present)
  const oldPolicy = lic.indexOf('## 7. Policy notes');
  if (oldPolicy !== -1) lic = lic.slice(0, oldPolicy);
  lic = lic.replace(/## 6\. Policy notes/, '');
  fs.writeFileSync(licPath, lic.trimEnd() + '\n\n' + section);
  console.log('📄 LICENSES.md updated');

  console.log('\n✅ Celebration jingles ready. Durations for JS:', JSON.stringify(durations));
}

main();
