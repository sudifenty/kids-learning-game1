# 🌈 Let's Learn

A complete, colorful children's educational web application for young learners
from **Baby Class** to **Primary 3** — built with **HTML, CSS, Vanilla JavaScript and Node.js**.

> **Make learning feel like a fun adventure while keeping the educational purpose clear.**

---

## ✨ Features

| Area | What's inside |
|---|---|
| 👋 Welcome & Setup | Cheerful welcome screen, big-card class selection (Baby → P3), child profile with friendly SVG avatar |
| 🏠 Home | Greeting, Today's Adventure banner, big destination cards |
| 📚 Learn | 5 subjects (English, Maths, Science, SST, Creative) with level-appropriate lessons |
| 📖 Lessons | 90+ data-driven lessons: letters, phonics, counting, shapes, colors, reading, visual addition/subtraction, money, fractions, comprehension, patterns & more |
| 🎮 Play | 7 educational games: Counting, Memory Match, Shape Sorter, Color Splash, Letter Finder, Number Order, Math Balloons |
| 🎨 Creative Corner | SVG coloring pages (apple, flower, house, fish, butterfly, tree, balloon), canvas tracing (letters, numbers, shapes, lines), free draw, shape art, matching |
| ⭐ Rewards | Stars for everything, 12 achievement badges |
| 🗺️ Learning Journey | Visual per-subject path showing progress |
| 🌟 Today's Adventure | 3 daily tasks + bonus stars (no guilt, no streaks) |
| 📊 Progress | Simple, visual per-subject stars — not a stats dashboard |
| 👨‍👩‍👧 Parent Area | PIN-gated (demo PIN `1234`): lessons, accuracy, weak areas, learning time, activity log, settings |
| 🔊 Audio | "Listen" buttons use the browser's speech synthesis; gentle sound effects are synthesized with WebAudio — no audio files to download |
| 🎉 Feedback | Positive-only: "Almost! Try again", confetti celebrations, never shaming |

## 🎨 Design

- Child-friendly palette with consistent subject colors:
  📖 English = blue, 🔢 Maths = orange, 🔬 Science = green, 🌍 SST = purple, 🎨 Creative = pink
- Soft illustrated SVG environments (home, school, playground, art room) — lightweight, never busy
- 4 friendly SVG characters: **Pip the Panda, Ruby the Rabbit, Leo the Lion, Milo the Monkey**
- All educational artwork (shapes, letters, numbers, coloring regions, tracing paths) is **controlled SVG/canvas** — precise, clean and consistent
- Large touch targets, icons + text, simple language, reduced-motion support

## 🚀 Run it

```bash
npm start
# or
node server/server.js
```

Then open **http://localhost:3000** (the server prints the port).

No dependencies — the Node.js server serves the static app from `public/` and
provides a tiny persistence API:

```
GET  /api/state   → saved app state (or 404)
POST /api/state   → save app state to server/data/state.json
```

The app also works fully offline in the browser (progress is kept in `localStorage`
and synced to the server when available).

## 📁 Project structure

```
lets-learn/
├── public/
│   ├── index.html
│   ├── css/
│   │   ├── style.css        ← design system, components
│   │   ├── home.css         ← welcome, setup, home, journey, progress, parent
│   │   ├── activities.css   ← lessons, games, coloring, tracing
│   │   └── responsive.css   ← phones / tablets / desktops
│   ├── js/
│   │   ├── data.js          ← curriculum, characters, shapes, templates, badges
│   │   ├── audio.js         ← speech + synthesized sound effects
│   │   ├── rewards.js       ← stars, badges, adventure, persistence
│   │   ├── tracing.js       ← canvas tracing engine
│   │   ├── coloring.js      ← SVG coloring engine
│   │   ├── games.js         ← 7 educational mini-games
│   │   ├── lessons.js       ← lesson player (18 step types)
│   │   ├── navigation.js    ← hash router + screens
│   │   └── app.js           ← bootstrap, confetti, celebrations
│   └── assets/              ← vector-first: see README inside
├── server/
│   └── server.js            ← static server + /api/state persistence
├── package.json
└── README.md
```

## 🎵🎬 Self-Hosted Media System

Let's Learn ships with its **own original media library** — no YouTube, no
external players, no leaving the app. Every song, video and audio clip plays
directly from our server via native HTML5 `<video>`/`<audio>` (with HTTP Range
support for smooth seeking).

**The library today (all originals, CC0):**
- 🎵 **8 songs** — Alphabet, Count With Me, Colors Around Us, Shape Adventure,
  My Body, Wash Your Hands, Animal Friends, Good Morning Song
- 🎬 **6 animated videos** — Welcome, Alphabet Song, Letter A, Number 5, Red,
  The Dog (640×480 H.264, 15–56 s)
- 🔊 **5 pronunciation clips** + 7 illustrations + thumbnails

**Where media lives:** `media/` (videos/, audio/, images/, thumbnails/) with a
full metadata + license database at `media/db/media.json` and provenance
records in `media/LICENSES.md`.

**Production pipeline:** `tools/synth.js` (melody synthesis) +
`tools/render-media.js` (vector animation → MP4, mixing, thumbnails). All
narration is our own voice; all melodies are public-domain arrangements or
original compositions.

**Media API (server):**

```
GET    /api/media?type=song|video|audio&subject=&class=&category=&q=   list media
GET    /api/media/:id                                                   one record
POST   /api/media                create record         (admin token)
PUT    /api/media/:id            update/publish        (admin token)
DELETE /api/media/:id            delete (+file)        (admin token)
POST   /api/admin/upload         upload a media file   (admin token)
POST   /api/admin/login          check admin token
```

Admin token: env `LETSLEARN_ADMIN_TOKEN` (default `letslearn2026`). The admin
media manager lives inside the Parent Area (PIN) → **Manage media** — children
never see it.

**Where kids find media:** the **Learn** screen has **Songs 🎵** and **Videos 🎬**
library cards, and media steps are embedded inside lessons (e.g. the
"Letter A Adventure" lesson follows SEE → HEAR → SONG → PRACTICE → GAME →
CREATIVE → REWARD). Players are child-friendly (big play button, replay) and
only show **related content from the same topic** — no feeds, no autoplay
chains, no recommendations algorithms.

**Offline-first:** a service worker (`public/sw.js`) caches the app shell and
runtime-caches each media file the first time it plays, so already-played
songs/videos keep working without internet.

**Extending the library:** use the admin manager, or drop files into `media/`
and add a record to `media/db/media.json` (or POST `/api/media`). Regenerate
everything with `node tools/render-media.js`.

## 📄 Standalone single-file version

`lets-learn-standalone.html` is the **entire app in one file** — all CSS, all
JavaScript and the full media library (songs, videos, audio clips,
illustrations) embedded as data URIs. It runs **with no server and no
internet** — open it in any browser (or the workspace file preview) and the
whole experience works, including the songs and videos.

Regenerate it after any change:

```
node tools/build-standalone.js
```

(It is a snapshot build — the served app at `npm start` is always the
authoritative version.)

## 🧸 Kindergarten experience (Baby / Middle / Top Class)

Kindergarten learners are NOT shown a formal primary-school portal. Instead
they see **large playful activity-area cards** — no "subjects", no "lessons":

```
🔢 COUNTING   🔤 LETTERS   🎨 COLOURS   ✏️ DRAWING
🔺 SHAPES     🧩 PUZZLES   🎵 SONGS     🐶 ANIMALS
```

- **Home screen** asks *"What do you want to learn?"* with big visual cards.
- **Learn screen** adds a *"More"* row: 🧼 My Body, 👨‍👩‍👧 My Family & Home.
- Each area opens **"Choose an activity"** — simple activity cards (star
  progress, "▶ Play" pill on the next one) plus related **mini-games**
  (Counting Game in 🔢, Memory in 🧩, Shape Sorter in 🔺…) and extras
  (Song Time 🎵, Free Draw ✏️).
- The **teacher voice** welcomes each area: *"Counting and numbers! Let us
  count together!"* — visuals first, spoken words second, minimal text.
- **Journey & Progress** follow the activity areas for kindergarten.
- Everything stays playful: no "Lesson 1/2/3", no "subjects", no paragraphs.

**Primary (P1–P3) is completely unchanged** — subjects, lessons, quizzes and
academic structure remain exactly as before. The kindergarten experience and
the primary experience are two distinct worlds in the same app.

## 🗣️ The Friendly Teacher Voice

Narration is a **natural, warm, child-friendly teacher voice** — not robotic
browser speech:

- **Natural neural TTS served by our own app**: `POST /api/tts` generates
  crisp, calm, warm narration clips using **Microsoft Edge neural voices** by
  default — a genuinely natural, friendly teacher voice (`en-GB-SoniaNeural`;
  override with `LETSLEARN_TTS_VOICE`). It's **completely free** — no API key,
  no subscription (served via the MIT-licensed `msedge-tts` package). Google
  Translate TTS remains as an automatic fallback if the neural voice is
  unreachable. Every clip is **disk-cached** so the same sentence is never
  re-generated.
- **Sentence-by-sentence read-along**: narration is split into sentences with
  **natural pauses** (longer before questions). The sentence currently being
  spoken is **highlighted** and the page scrolls to it gently — connecting
  spoken word, written word and picture.
- **Child-friendly player** on every narrated step: ▶ Play / ⏸ Pause /
  🔁 Replay / 🔊 volume / 🐢 **Slow • Normal • Fast** (Slow is the default —
  ≈0.78×, like a patient teacher). No technical settings for children.
- **Pronunciation preprocessing**: numbers become words ("5 − 2" →
  "five minus two"), abbreviations expand ("SST" → "S.S.T."), math symbols
  are spoken clearly.
- **Fallback chain**: if the server TTS is unreachable, the browser's speech
  synthesis takes over automatically with a tuned voice — the audio button
  never breaks.
- **Soft background music** (original, CC0): default OFF; parents can turn it
  on, and it **ducks to a whisper while the teacher speaks** so the voice is
  always clearly louder.
- Parent Area → Settings: 🔊 learning sounds, 🎵 celebration music,
  🎉 dance & confetti, 🎵 soft background music.

## 🎉 Celebration system

When a child succeeds, Let's Learn celebrates **inside the app**:

- **🎉 Correct answer** → "AMAZING!" + the child's own avatar character
  **dances** (bounce/twist/step) while an **original success jingle** plays
  (~2s), then auto-scrolls to the next activity.
- **🏆 Game / milestone complete** → bigger dance + confetti + fanfare (~3s).
- **🌟 Lesson complete** → completion tune + confetti + any **new badge**
  appears on the results screen.

The dance is **synchronized to the music**: it starts when the jingle starts
and the overlay closes when the music ends (tap to skip early). Jingles are
**original Let's Learn compositions** (CC0 — see `media/LICENSES.md` §6),
served from `/media/audio/celebration/` and embedded in the standalone build.
No third-party music, no external players.

Parents control the experience in the Parent Area → Settings:

```
🔊 Learning sounds     On / Off
🎵 Celebration music   On / Off
🎉 Dance & confetti    On / Off
```

Music only plays for real achievements — never for ordinary navigation.

## ✅ Activity accuracy guarantee

Every educational activity follows the rule:

> **WHAT THE CHILD SEES == WHAT THE CHILD IS ASKED == WHAT THE SYSTEM EXPECTS**

- **Counting** — the number of objects rendered IS the correct answer; answer
  options are generated from the same value (`countOptions(n)`), so a mismatch
  is impossible by construction.
- **Math visuals** — `+` shows two groups joined, `−` shows objects crossed
  out (taken away), `×` shows rows of groups (e.g. 2 groups of 3).
- **`js/validate.js`** — an internal validator checks every step
  (answer ∈ options, unique options, subtraction a>b, multiplication ≤30
  items, no compare ties, matching pairs well-formed, tracing/coloring
  templates exist, letters have audio data). It runs at boot (dev console
  only — children never see it) and as a runtime guard: an invalid step is
  skipped instead of shown.
- **Large, separated objects** — responsive `clamp()` sizing keeps objects
  big on phones, tablets and desktops; flex layouts space countable objects
  so each one is individually identifiable.

## 🧪 Tests

```
node tests/test1-screens.js   # full app journey (needs jsdom + server on :3000)
node tests/test2-games.js     # lessons, games, tracing, coloring
node tests/test3-media.js     # media libraries, players, admin
```

## 🧑‍🏫 Notes for parents & teachers

- The **Parent Area** (🏠 home → Parents, PIN `1234`) shows what the child has
  learned, accuracy per subject and which subjects need more practice.
- The interface adapts to the class: Baby/Middle Class rely on pictures, audio
  and simple taps; P1–P3 add reading, writing and academic content — always in
  the same friendly world.
- No loot boxes, no paid power-ups, no guilt-based notifications. Stars and
  badges celebrate real learning only.
