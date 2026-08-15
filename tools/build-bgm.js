/* ==========================================================================
   LET'S LEARN — tools/build-bgm.js
   Composes the original, very soft background music loop (CC0):
   a gentle pentatonic music-box arpeggio. Sits far below the teacher's
   voice (the app ducks it even lower while narration plays).
   Also registers it in the media database + LICENSES.md.
   Run:  node tools/build-bgm.js
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { melodyWav, writeWav } = require('./synth');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'media', 'audio', 'bgm');
const TMP = '/tmp/ll-bgm.wav';

/* one gentle phrase, repeated to fill ~50s */
const PHRASE = [
  ['C5', 1], ['G4', 1], ['E5', 1], ['G4', 1],
  ['A4', 1], ['E5', 1], ['C5', 1], ['G4', 1],
  ['E5', 1], ['C5', 1], ['D5', 1], ['A4', 1],
  ['G4', 1], ['C5', 1], ['E5', 2]
];

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const passes = Math.max(3, Math.ceil(50 / (PHRASE.length * (60 / 84))));
  const notes = [];
  for (let p = 0; p < passes; p++) notes.push(...PHRASE.map(n => [n[0], n[1]]));

  const samples = melodyWav(notes, 84, { vol: 0.16, leadIn: 0.3, tail: 1.2 });
  writeWav(samples, TMP);
  const out = path.join(OUT_DIR, 'bgm-learn.mp3');
  execFileSync('ffmpeg', ['-y', '-i', TMP, '-c:a', 'libmp3lame', '-b:a', '80k', out], { stdio: 'ignore' });
  const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).toString().trim());
  console.log(`♪ bgm-learn.mp3 → ${dur.toFixed(1)}s (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);

  /* media db record (hidden from libraries: published=false, category Background Music) */
  const dbPath = path.join(ROOT, 'media', 'db', 'media.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const idx = db.findIndex(m => m.id === 'bgm-learn');
  const rec = {
    id: 'bgm-learn', title: 'Soft Learning Music', description: 'Very soft original background music for the learning environment. Default OFF.',
    mediaType: 'audio', filePath: '/media/audio/bgm/bgm-learn.mp3', thumbnailPath: '/media/thumbnails/audio-note.png',
    classLevel: ['all'], subject: null, topic: 'Background music', lesson: null, skill: null,
    category: 'Background Music', language: 'en', duration: Math.round(dur),
    creator: "Let's Learn Originals", source: "Let's Learn (original composition)",
    license: 'CC0 1.0 Public Domain Dedication', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    attribution: '© 2026 Let\'s Learn — original production',
    approved: true, published: false, createdAt: '2026-08-12T00:00:00.000Z'
  };
  if (idx !== -1) db[idx] = rec; else db.push(rec);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log(`📚 media.json: bgm-learn record ${idx !== -1 ? 'updated' : 'added'} (total ${db.length})`);

  /* LICENSES.md */
  const licPath = path.join(ROOT, 'media', 'LICENSES.md');
  let lic = fs.readFileSync(licPath, 'utf8');
  const marker = '## 7. Policy notes';
  const section = `## 7. Background music (1)

| Title | File | Duration | Creator | Source | License | License URL | Attribution | Date added |
|---|---|---|---|---|---|---|---|---|
| Soft Learning Music | \`media/audio/bgm/bgm-learn.mp3\` | ${Math.round(dur)}s | Let's Learn Originals | Original composition | CC0 1.0 | creativecommons.org/publicdomain/zero/1.0/ | © 2026 Let's Learn | 2026-08-12 |

## 8. Policy notes
`;
  if (lic.indexOf(marker) !== -1) lic = lic.replace(marker, section.replace('## 8. Policy notes', '## 7. Policy notes'));
  else lic += '\n' + section;
  fs.writeFileSync(licPath, lic);
  console.log('📄 LICENSES.md updated');
}

main();
