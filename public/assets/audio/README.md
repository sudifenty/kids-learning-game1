# 🎙️ Natural Voice Audio Library

This folder holds the **pre-recorded natural teacher voice** for Let's Learn —
real audio files bundled with the app, NOT device text-to-speech and NOT an
online TTS call.

Because every clip is a local file:

- ✅ **The voice is identical on every phone** (iPhone, Android — no variance)
- ✅ **Works 100% offline** — no Wi-Fi, no mobile data needed
- ✅ **Natural, warm and friendly** — suitable for young learners

## Folder layout

```
assets/audio/
├── feedback/      praise + encouragement ("Great job!", "Almost! Try again.")
├── instructions/  common directions ("Tap your class!", "Choose an activity!")
├── numbers/       numbers 0–20 (counting + maths)
├── letters/       letter names + phonics sounds (A–Z)
├── phonics/       letter sounds and blending prompts
├── words/         high-frequency vocabulary
└── lessons/       key lesson explanations and read-along passages
```

## How clips are wired in

`public/js/voice-library.js` maps each phrase to its file here. The audio engine
(`public/js/audio.js`) checks that library **first** whenever it needs to speak,
so any phrase with a bundled clip always plays the natural recording — offline
and identically on every device.

**Format:** MP3 (24 kHz mono is plenty for speech and keeps the app small).
Keep clips short (one phrase each) so they can be mixed and matched.

## Adding a clip

1. Put the MP3 in the right subfolder (e.g. `instructions/tap-your-class.mp3`).
2. Add one line to `voice-library.js`:

```js
'tap your class': 'assets/audio/instructions/tap-your-class.mp3',
```

The key is the phrase **normalized**: lowercase, letters/digits/apostrophes
kept, other punctuation → spaces, whitespace collapsed.
