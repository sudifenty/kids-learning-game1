/* ==========================================================================
   LET'S LEARN — tools/build-standalone.js
   Produces lets-learn-standalone.html — a SINGLE self-contained file with:
   - all CSS and JS inlined (no external requests at all)
   - the complete media catalog embedded as data URIs (songs, audio clips,
     videos, illustrations, thumbnails)
   The standalone opens and runs the full app anywhere JavaScript is allowed,
   even with NO server and NO internet (e.g. the workspace file preview).
   Run:  node tools/build-standalone.js
   ========================================================================== */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const MEDIA = path.join(ROOT, 'media');
const OUT = path.join(ROOT, 'lets-learn-standalone.html');

const MIME_BY_EXT = {
  '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml'
};

function toDataUri(filePath) {
  const abs = path.join(MEDIA, filePath.replace(/^\/media\//, ''));
  if (!fs.existsSync(abs)) return null;
  const buf = fs.readFileSync(abs);
  const ext = path.extname(abs).toLowerCase();
  const mime = MIME_BY_EXT[ext];
  if (!mime) return null;
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function main() {
  let html = fs.readFileSync(path.join(PUBLIC, 'index.html'), 'utf8');

  /* 1. drop external font links (offline-safe) */
  html = html.replace(/\s*<link[^>]*fonts\.googleapis[^>]*>/g, '');
  html = html.replace(/\s*<link[^>]*fonts\.gstatic[^>]*>/g, '');
  html = html.replace(/\s*<link[^>]*preconnect[^>]*>/g, '');

  /* 2. inline stylesheets */
  html = html.replace(
    /<link rel="stylesheet" href="(css\/[^"]+)"\/>/g,
    (m, href) => {
      const css = fs.readFileSync(path.join(PUBLIC, href.split('?')[0]), 'utf8');
      return `\n<style>\n${css}\n</style>`;
    }
  );

  /* 3. build the embedded media catalog */
  const db = JSON.parse(fs.readFileSync(path.join(MEDIA, 'db', 'media.json'), 'utf8'));
  const catalog = db.map(rec => {
    const r = Object.assign({}, rec);
    if (rec.filePath && rec.mediaType !== 'image') {
      r.filePath = toDataUri(rec.filePath) || rec.filePath;
    } else if (rec.filePath) {
      r.filePath = toDataUri(rec.filePath) || rec.filePath;
    }
    if (rec.thumbnailPath) {
      const uri = toDataUri(rec.thumbnailPath);
      if (uri) r.thumbnailPath = uri;
    }
    return r;
  });

  const catalogScript =
    `<script>window.__LL_STANDALONE__ = true;window.__LL_STANDALONE_CATALOG__ = ${JSON.stringify(catalog)};</script>`;

  /* 4. inline app scripts (keeping order), catalog injected first */
  html = html.replace(/<script src="js\/data\.js(\?v=\d+)?"[^>]*><\/script>/, (m) => catalogScript + '\n  ' + m.replace(/js\/data\.js(\?v=\d+)?/, 'js/data.js'));
  html = html.replace(
    /<script src="(js\/[^"]+)"(><\/script>| \/><\/script>)/g,
    (m, src) => {
      const js = fs.readFileSync(path.join(PUBLIC, src.split('?')[0]), 'utf8');
      return `\n<script>\n${js}\n</script>`;
    }
  );

  /* 5. replace the server-only fallback script with a standalone-appropriate one */
  html = html.replace(
    /<script>\s*\/\* If the app scripts never load[\s\S]*?<\/script>/,
    `<script>
    /* standalone: if the app still didn't boot, say so plainly */
    window.addEventListener('DOMContentLoaded', function () {
      setTimeout(function () {
        if (!window.LLApp) {
          var s = document.getElementById('boot-splash');
          if (s) s.innerHTML = '<div class="bs-logo">🌈</div><div class="bs-title">LET\\'S LEARN</div><div style="max-width:440px;margin-top:16px;line-height:1.6;font-weight:600;color:#5a6088">The app did not start. Please open this file in a browser that allows JavaScript.</div>';
        }
      }, 2500);
    });
  </script>`
  );

  fs.writeFileSync(OUT, html);
  const sizeMB = (fs.statSync(OUT).size / 1024 / 1024).toFixed(1);
  console.log(`✅ lets-learn-standalone.html written (${sizeMB} MB, ${catalog.length} media records embedded)`);
  console.log('   Open this file anywhere — no server, no internet needed.');
}

main();
