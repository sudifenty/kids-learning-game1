# 🎨 Assets — vector-first approach

This app intentionally ships **no heavy binary assets** for performance on
low-end devices. Everything visual is generated at runtime:

- **Characters** → inline SVG (js/data.js)
- **Shapes / letters / numbers / tracing paths** → SVG + Canvas (controlled vector artwork)
- **Coloring pages** → inline SVG templates (js/data.js)
- **Backgrounds** → CSS gradients + light SVG decoration layer (js/navigation.js)
- **Icons** → emoji (universally supported, crisp at any size)
- **Sounds** → synthesized with WebAudio + browser speech synthesis (js/audio.js)

If you later want custom art, drop files in these folders and reference them
from the code — the server already serves them with correct MIME types.
