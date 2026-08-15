/**
 * 🌈 Let's Learn — Node.js server
 * -------------------------------
 * - Serves the static app from /public
 * - Serves the self-hosted media library from /media (with HTTP Range support
 *   so HTML5 <video>/<audio> can seek and stream efficiently)
 * - Natural narration TTS endpoint (cached):
 *     GET  /api/tts/status             provider availability
 *     POST /api/tts  { text, voice }   generate + cache a sentence clip
 *     GET  /api/tts/cache/<hash>.mp3   serve a cached clip
 *     LETSLEARN_TTS=edge (default) | google
 *     LETSLEARN_TTS_VOICE=en-GB-SoniaNeural (override the neural voice)
 * - Media database API:
 *     GET    /api/media            list/filter media
 *     GET    /api/media/:id        one media record
 *     POST   /api/media            create record          (admin)
 *     PUT    /api/media/:id        update record          (admin)
 *     DELETE /api/media/:id        delete record (+file)  (admin)
 *     POST   /api/admin/upload     upload a media file    (admin)
 *     POST   /api/admin/login      check admin token
 *     GET    /api/state            saved app state
 *     POST   /api/state            save app state
 *
 * Admin token: env LETSLEARN_ADMIN_TOKEN, default "letslearn2026".
 * Admin controls are never reachable from the child UI.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const https = require('https');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const MEDIA_DIR = path.join(ROOT, 'media');
const MEDIA_DB = path.join(MEDIA_DIR, 'db', 'media.json');
const DATA_DIR = path.join(ROOT, 'server', 'data');
const DATA_FILE = path.join(DATA_DIR, 'state.json');
const TTS_CACHE_DIR = path.join(DATA_DIR, 'tts-cache');
const ADMIN_TOKEN = process.env.LETSLEARN_ADMIN_TOKEN || 'letslearn2026';
const TTS_PROVIDER = process.env.LETSLEARN_TTS || 'edge'; // 'edge' (neural, default) | 'google'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.jfif': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.m4v': 'video/mp4',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4', '.aac': 'audio/aac',
  '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

/* ---------------- helpers ---------------- */

function send(res, status, body, type, headers) {
  const h = Object.assign({ 'Content-Type': type || 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }, headers || {});
  res.writeHead(status, h);
  res.end(body);
}
function sendJson(res, status, obj) { send(res, status, JSON.stringify(obj), 'application/json'); }
function readBody(req, limitMB) {
  return new Promise((resolve, reject) => {
    let data = [];
    let size = 0;
    const limit = (limitMB || 50) * 1024 * 1024;
    req.on('data', (c) => {
      data.push(c);
      size += c.length;
      if (size > limit) { reject(new Error('Body too large')); req.destroy(); }
    });
    req.on('end', () => resolve(Buffer.concat(data)));
    req.on('error', reject);
  });
}
function isAdmin(req) {
  const h = req.headers['x-admin-token'] || req.headers['authorization'];
  const token = h ? String(h).replace(/^Bearer\s+/i, '') : '';
  const q = new URL(req.url, 'http://x').searchParams.get('token');
  return token === ADMIN_TOKEN || q === ADMIN_TOKEN;
}
function safeJoin(root, urlPath) {
  const p = path.normalize(path.join(root, urlPath));
  return p.startsWith(root) ? p : null;
}

/* ---------------- natural narration TTS (cached, provider-agnostic) ---------------- */

const TTS_VOICES = {
  google: 'en', // Google Translate TTS (free, no key — fallback if the neural voice is unreachable)
  // Warm, friendly, clear British neural voice — natural and child-friendly.
  // Other good options: en-US-JennyNeural, en-US-AriaNeural, en-GB-LibbyNeural.
  edge: process.env.LETSLEARN_TTS_VOICE || 'en-US-AriaNeural'
};

function ttsCachePath(text, voice) {
  const key = crypto.createHash('sha1').update((voice || 'en') + '|' + text).digest('hex');
  return path.join(TTS_CACHE_DIR, key + '.mp3');
}

/* provider 1: Google Translate TTS (works everywhere, no key) */
function ttsGoogle(text) {
  return new Promise((resolve, reject) => {
    const q = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${q}&tl=en&client=tw-ob`;
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
      if (res.statusCode !== 200 || !/audio/.test(res.headers['content-type'] || '')) {
        res.resume();
        return reject(new Error('TTS google status ' + res.statusCode));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.setTimeout(15000, () => { req.destroy(new Error('TTS google timeout')); });
    req.on('error', reject);
  });
}

/* provider (default): Microsoft Edge neural voices — genuinely natural, warm
   human-like speech, completely FREE (no API key, no subscription). Served
   server-side via the MIT-licensed `msedge-tts` package. The default voice is
   en-GB-SoniaNeural (warm, friendly, clear — ideal for young learners);
   override with LETSLEARN_TTS_VOICE. */
async function ttsEdge(text, voice) {
  let mod = await import('msedge-tts').catch(() => null);
  if (!mod) throw new Error('msedge-tts not installed — run npm install');
  if (!mod.MsEdgeTTS && mod.default) mod = mod.default; // CommonJS interop
  if (!mod.MsEdgeTTS) throw new Error('msedge-tts: MsEdgeTTS export not found');
  const tts = new mod.MsEdgeTTS();
  await tts.setMetadata(voice || TTS_VOICES.edge, mod.OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'll-tts-'));
  try {
    // Neutral pitch + rate: the client's Slow/Normal/Fast control already sets
    // the pace, so we keep one natural, warm baseline for every sentence.
    const { audioFilePath } = await tts.toFile(tmp, text, { rate: 1.0, pitch: '+0Hz', volume: '+0%' });
    return fs.readFileSync(audioFilePath);
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* ignore */ }
  }
}

async function ttsGenerate(text, voice) {
  if (TTS_PROVIDER === 'edge') {
    try { return await ttsEdge(text, voice); } catch (e) { /* fall through to google */ }
  }
  return await ttsGoogle(text);
}

async function ttsGetOrCreate(text, voice) {
  fs.mkdirSync(TTS_CACHE_DIR, { recursive: true });
  const file = ttsCachePath(text, voice);
  if (fs.existsSync(file)) return { file, cached: true };
  const buf = await ttsGenerate(text, voice);
  if (!buf || buf.length < 1000) throw new Error('TTS returned empty audio');
  fs.writeFileSync(file, buf);
  return { file, cached: false };
}

function loadDb() {
  try { return JSON.parse(fs.readFileSync(MEDIA_DB, 'utf8')); } catch (e) { return []; }
}
function saveDb(db) {
  const tmp = MEDIA_DB + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, MEDIA_DB);
}
function genId() { return 'm-' + Date.now().toString(36) + '-' + crypto.randomBytes(3).toString('hex'); }

function filterMedia(db, q) {
  const type = q.get('type');
  const subject = q.get('subject');
  const klass = q.get('class');
  const category = q.get('category');
  const lesson = q.get('lesson');
  const search = (q.get('q') || '').toLowerCase();
  return db.filter(m => {
    if (!m.published && m.published !== undefined && q.get('admin') !== '1') return false;
    if (type && m.mediaType !== type) return false;
    if (subject && m.subject !== subject) return false;
    if (category && m.category !== category) return false;
    if (lesson && m.lesson !== lesson) return false;
    if (klass && m.classLevel && m.classLevel.indexOf('all') === -1 && m.classLevel.indexOf(klass) === -1) return false;
    if (search) {
      const hay = (m.title + ' ' + (m.topic || '') + ' ' + (m.description || '') + ' ' + (m.skill || '') + ' ' + (m.category || '')).toLowerCase();
      if (hay.indexOf(search) === -1) return false;
    }
    return true;
  });
}

/* ---------------- static + range file serving ---------------- */

function serveFile(req, res, filePath, opts) {
  opts = opts || {};
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) return send(res, 404, 'Not found');
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    // media files (immutable content) get long caching; code/assets must revalidate
    const isMedia = opts.longCache === true;
    const cache = isMedia ? 'public, max-age=31536000, immutable' : 'no-cache';
    const total = stat.size;
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', cache);
    const range = req.headers.range;
    if (range && /^bytes=/.test(range)) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      let start, end;
      if (m && m[1] !== '' && m[2] === '') { start = parseInt(m[1], 10); end = total - 1; }
      else if (m && m[2] !== '' && m[1] === '') { const suf = parseInt(m[2], 10); start = Math.max(0, total - suf); end = total - 1; }
      else if (m && m[1] !== '' && m[2] !== '') { start = parseInt(m[1], 10); end = parseInt(m[2], 10); }
      else { return send(res, 416, '', 'text/plain', { 'Content-Range': `bytes */${total}` }); }
      if (start >= total || start > end) return send(res, 416, '', 'text/plain', { 'Content-Range': `bytes */${total}` });
      end = Math.min(end, total - 1);
      res.writeHead(206, {
        'Content-Type': mime,
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Content-Length': end - start + 1,
        'Accept-Ranges': 'bytes',
        'Cache-Control': cache
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': mime, 'Content-Length': total, 'Accept-Ranges': 'bytes', 'Cache-Control': cache });
      if (req.method === 'HEAD') return res.end();
      fs.createReadStream(filePath).pipe(res);
    }
  });
}

function serveStatic(req, res, urlPath) {
  let filePath = path.normalize(path.join(PUBLIC_DIR, urlPath));
  if (!filePath.startsWith(PUBLIC_DIR)) return send(res, 403, 'Forbidden');
  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) return serveFile(req, res, filePath, { longCache: false });
    fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (e2, html) => {
      if (e2) return send(res, 404, 'Not found');
      send(res, 200, html, MIME['.html'], { 'Cache-Control': 'no-cache' });
    });
  });
}

/* ---------------- server ---------------- */

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(url.pathname);
  const method = req.method;

  /* ============ TTS API (natural narration) ============ */
  if (pathname === '/api/tts/status' && method === 'GET') {
    return sendJson(res, 200, { ok: true, provider: TTS_PROVIDER });
  }
  if (pathname === '/api/tts/cache/' && method === 'GET') {
    return send(res, 404, 'not found');
  }
  const ttsCacheMatch = pathname.match(/^\/api\/tts\/cache\/([a-f0-9]{40}\.mp3)$/);
  if (ttsCacheMatch && method === 'GET') {
    const fp = safeJoin(TTS_CACHE_DIR, ttsCacheMatch[1]);
    if (!fp || !fs.existsSync(fp)) return send(res, 404, 'not found');
    return serveFile(req, res, fp, { longCache: true });
  }
  if (pathname === '/api/tts' && method === 'POST') {
    try {
      const body = JSON.parse((await readBody(req, 1)).toString('utf8'));
      const text = String(body.text || '').trim();
      if (!text) return sendJson(res, 400, { error: 'text required' });
      if (text.length > 260) return sendJson(res, 413, { error: 'text too long — narrate sentence by sentence' });
      const { file, cached } = await ttsGetOrCreate(text, body.voice || null);
      const name = path.basename(file);
      return sendJson(res, 200, { url: '/api/tts/cache/' + name, cached, provider: TTS_PROVIDER });
    } catch (e) {
      return sendJson(res, 503, { error: 'tts unavailable: ' + e.message });
    }
  }

  /* ============ MEDIA API ============ */
  if (pathname === '/api/media' && method === 'GET') {
    return sendJson(res, 200, filterMedia(loadDb(), url.searchParams));
  }
  const mediaMatch = pathname.match(/^\/api\/media\/([^/]+)$/);
  if (mediaMatch && method === 'GET') {
    const rec = loadDb().find(m => m.id === mediaMatch[1]);
    return rec ? sendJson(res, 200, rec) : sendJson(res, 404, { error: 'not found' });
  }
  if (pathname === '/api/media' && method === 'POST') {
    if (!isAdmin(req)) return sendJson(res, 401, { error: 'admin token required' });
    try {
      const rec = JSON.parse((await readBody(req, 2)).toString('utf8'));
      if (!rec.title || !rec.filePath) return sendJson(res, 400, { error: 'title and filePath required' });
      const db = loadDb();
      const id = rec.id || genId();
      const full = Object.assign({
        id, title: rec.title, description: rec.description || '', mediaType: rec.mediaType || 'audio',
        filePath: rec.filePath, thumbnailPath: rec.thumbnailPath || null,
        classLevel: rec.classLevel || ['all'], subject: rec.subject || null, topic: rec.topic || null,
        lesson: rec.lesson || null, skill: rec.skill || null, category: rec.category || null,
        language: rec.language || 'en', duration: rec.duration || 0,
        creator: rec.creator || "Let's Learn", source: rec.source || '',
        license: rec.license || 'CC0 1.0', licenseUrl: rec.licenseUrl || '',
        attribution: rec.attribution || '', approved: rec.approved !== false, published: rec.published !== false,
        createdAt: rec.createdAt || new Date().toISOString()
      }, rec);
      db.push(full);
      saveDb(db);
      return sendJson(res, 200, full);
    } catch (e) { return sendJson(res, 400, { error: 'bad json: ' + e.message }); }
  }
  if (mediaMatch && method === 'PUT') {
    if (!isAdmin(req)) return sendJson(res, 401, { error: 'admin token required' });
    try {
      const patch = JSON.parse((await readBody(req, 2)).toString('utf8'));
      const db = loadDb();
      const idx = db.findIndex(m => m.id === mediaMatch[1]);
      if (idx === -1) return sendJson(res, 404, { error: 'not found' });
      db[idx] = Object.assign({}, db[idx], patch, { id: db[idx].id });
      saveDb(db);
      return sendJson(res, 200, db[idx]);
    } catch (e) { return sendJson(res, 400, { error: 'bad json' }); }
  }
  if (mediaMatch && method === 'DELETE') {
    if (!isAdmin(req)) return sendJson(res, 401, { error: 'admin token required' });
    const db = loadDb();
    const idx = db.findIndex(m => m.id === mediaMatch[1]);
    if (idx === -1) return sendJson(res, 404, { error: 'not found' });
    const [rec] = db.splice(idx, 1);
    saveDb(db);
    if (url.searchParams.get('deleteFile') === '1' && rec.filePath) {
      const fp = safeJoin(MEDIA_DIR, rec.filePath.replace(/^\/media\//, ''));
      if (fp && !fp.includes('/raw/') && !fp.includes('/db/')) {
        fs.unlink(fp, () => {});
      }
    }
    return sendJson(res, 200, { ok: true });
  }

  /* ============ ADMIN: upload ============ */
  if (pathname === '/api/admin/upload' && method === 'POST') {
    if (!isAdmin(req)) return sendJson(res, 401, { error: 'admin token required' });
    const name = (url.searchParams.get('name') || 'file.bin').replace(/[^a-zA-Z0-9._-]/g, '_');
    const folderParam = (url.searchParams.get('folder') || 'incoming').replace(/[^a-zA-Z0-9/_-]/g, '');
    const allowedRoots = ['incoming', 'videos', 'audio', 'images', 'thumbnails'];
    const root = folderParam.split('/')[0];
    if (allowedRoots.indexOf(root) === -1) return sendJson(res, 400, { error: 'folder not allowed' });
    const dir = safeJoin(MEDIA_DIR, folderParam);
    if (!dir) return sendJson(res, 400, { error: 'bad folder' });
    try {
      fs.mkdirSync(dir, { recursive: true });
      const body = await readBody(req, 500);
      const out = path.join(dir, name);
      fs.writeFileSync(out, body);
      return sendJson(res, 200, { path: '/media/' + folderParam + '/' + name, size: body.length });
    } catch (e) { return sendJson(res, 400, { error: e.message }); }
  }
  if (pathname === '/api/admin/login' && method === 'POST') {
    try {
      const body = JSON.parse((await readBody(req, 1)).toString('utf8'));
      return sendJson(res, 200, { ok: body.token === ADMIN_TOKEN });
    } catch (e) { return sendJson(res, 400, { error: 'bad json' }); }
  }

  /* ============ STATE API ============ */
  if (pathname === '/api/state' && method === 'GET') {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
      if (err) return sendJson(res, 404, { error: 'no state saved yet' });
      send(res, 200, data, 'application/json');
    });
    return;
  }
  if (pathname === '/api/state' && method === 'POST') {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    try {
      const body = (await readBody(req, 5)).toString('utf8');
      JSON.parse(body);
      fs.writeFile(DATA_FILE, body, (err) => {
        if (err) return sendJson(res, 500, { error: 'save failed' });
        sendJson(res, 200, { ok: true, savedAt: Date.now() });
      });
    } catch (e) { sendJson(res, 400, { error: 'bad json' }); }
    return;
  }

  /* ============ HEALTH ============ */
  if (pathname === '/api/health') {
    return sendJson(res, 200, { ok: true, app: 'lets-learn', media: loadDb().length });
  }

  /* ============ MEDIA FILES ============ */
  if (pathname.startsWith('/media/') && method === 'GET' || pathname.startsWith('/media/') && method === 'HEAD') {
    const fp = safeJoin(MEDIA_DIR, pathname.replace(/^\/media\//, ''));
    if (!fp) return send(res, 403, 'Forbidden');
    return serveFile(req, res, fp, { longCache: true });
  }

  /* ============ STATIC APP ============ */
  if (method === 'GET' || method === 'HEAD') {
    const urlPath = pathname === '/' ? '/index.html' : pathname;
    return serveStatic(req, res, urlPath);
  }

  send(res, 405, 'Method not allowed');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌈 Let's Learn server running at http://0.0.0.0:${PORT} (admin token: ${ADMIN_TOKEN === 'letslearn2026' ? 'default — set LETSLEARN_ADMIN_TOKEN in production' : 'configured'})`);
});
