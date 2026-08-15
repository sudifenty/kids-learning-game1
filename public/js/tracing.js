/* ==========================================================================
   🌈 LET'S LEARN — tracing.js
   Canvas tracing activities: letters, numbers, shapes and lines.
   Works with finger, mouse and stylus (Pointer Events).
   ========================================================================== */

window.LLTracing = (function () {
  const D = window.LLData;
  const A = window.LLAudio;

  /* Renders the whole tracing activity into a container element.
     opts: { kind: 'letter'|'number'|'shape'|'line', which: 'A'|'1'|'circle'|'wave',
             onDone: function() } */
  function start(container, opts) {
    const kind = opts.kind;
    const which = opts.which;
    const template = D.TRACE_TEMPLATES[kind][which];
    const label = D.TRACE_LABELS[kind][which];
    if (!template) return;

    const W = 100, H = 100; // logical grid

    container.innerHTML = `
      <div class="trace-wrap screen-anim">
        <div class="screen-title">✏️ Trace the ${label}</div>
        <div class="trace-canvas-wrap">
          <div class="trace-guide-label">${label}</div>
          <canvas width="1000" height="1000" aria-label="Tracing area for ${label}"></canvas>
        </div>
        <div class="trace-progress">⭐ <span class="trace-pct">0</span>% complete</div>
        <div class="trace-tools">
          <button class="btn small ghost trace-clear" type="button">🧽 Clear</button>
          <button class="btn small green trace-done" type="button" disabled>✅ Done</button>
        </div>
      </div>`;

    const canvas = container.querySelector('canvas');
    const g = canvas.getContext('2d');
    const wrap = container.querySelector('.trace-canvas-wrap');
    const pctEl = container.querySelector('.trace-pct');
    const doneBtn = container.querySelector('.trace-done');
    const clearBtn = container.querySelector('.trace-clear');

    // scale logical 100x100 -> canvas pixels
    const S = canvas.width / W;
    let scale = 1; // css px per logical unit, computed on resize
    let traced = [];        // completed waypoints
    let drawing = false;
    let finished = false;
    let lastPt = null;
    let strokeColor = '#2f7de1';
    const visited = template.map(() => false);
    const RADIUS = 12; // logical units of tolerance

    function resize() {
      const rect = wrap.getBoundingClientRect();
      scale = rect.width / W;
    }
    resize();
    window.addEventListener('resize', resize);

    function clearTrace() {
      traced = [];
      visited.fill(false);
      drawing = false;
      lastPt = null;
      draw();
      updatePct();
    }

    function draw() {
      const g2 = g;
      g2.clearRect(0, 0, canvas.width, canvas.height);
      // guide: dotted line + dots
      g2.lineWidth = S * 4;
      g2.strokeStyle = '#cfe0f5';
      g2.setLineDash([S * 6, S * 6]);
      g2.lineCap = 'round';
      g2.lineJoin = 'round';
      g2.beginPath();
      template.forEach((p, i) => {
        if (i === 0) g2.moveTo(p[0] * S, p[1] * S);
        else g2.lineTo(p[0] * S, p[1] * S);
      });
      g2.stroke();
      g2.setLineDash([]);

      // dots
      template.forEach((p, i) => {
        g2.beginPath();
        g2.arc(p[0] * S, p[1] * S, S * 4.5, 0, Math.PI * 2);
        g2.fillStyle = visited[i] ? '#35c46b' : '#9db8e0';
        g2.fill();
      });

      // user's traced strokes
      g2.lineWidth = S * 8;
      g2.strokeStyle = strokeColor;
      g2.lineCap = 'round';
      g2.lineJoin = 'round';
      traced.forEach((seg) => {
        if (seg.length < 2) return;
        g2.beginPath();
        seg.forEach((p, i) => {
          if (i === 0) g2.moveTo(p[0] * S, p[1] * S);
          else g2.lineTo(p[0] * S, p[1] * S);
        });
        g2.stroke();
      });

      // celebration glow when done
      if (finished) {
        g2.beginPath();
        g2.arc(50 * S, 50 * S, S * 46, 0, Math.PI * 2);
        g2.strokeStyle = '#ffd75e';
        g2.lineWidth = S * 3;
        g2.stroke();
      }
    }

    function updatePct() {
      const done = visited.filter(Boolean).length;
      const pct = Math.round((done / visited.length) * 100);
      pctEl.textContent = pct;
      if (pct >= 100 && !finished) {
        finished = true;
        doneBtn.disabled = false;
        A.sfx.celebrate();
        A.speak('Perfect tracing! You did it!', { force: false });
      }
    }

    function handleMove(px, py) {
      if (finished || !drawing) return;
      const rect = canvas.getBoundingClientRect();
      const x = (px - rect.left) * (W / rect.width);
      const y = (py - rect.top) * (H / rect.height);
      if (x < -5 || y < -5 || x > 105 || y > 105) return;

      if (lastPt) {
        traced[traced.length - 1].push([x, y]);
      } else {
        traced.push([[x, y]]);
      }
      lastPt = [x, y];

      // mark visited waypoints within tolerance
      let newVisit = false;
      template.forEach((p, i) => {
        if (visited[i]) return;
        const dx = p[0] - x, dy = p[1] - y;
        if (Math.sqrt(dx * dx + dy * dy) <= RADIUS) {
          visited[i] = true;
          newVisit = true;
        }
      });
      if (newVisit) {
        A.sfx.tick();
        draw();
        updatePct();
      } else {
        draw();
      }
    }

    function onDown(e) {
      if (finished) return;
      e.preventDefault();
      drawing = true;
      lastPt = null;
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
      handleMove(e.clientX, e.clientY);
    }
    function onMove(e) {
      if (!drawing) return;
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    }
    function onUp() {
      drawing = false;
      lastPt = null;
    }

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('pointerleave', onUp);

    clearBtn.addEventListener('click', () => { A.sfx.click(); clearTrace(); });

    doneBtn.addEventListener('click', () => {
      A.sfx.click();
      const done = visited.filter(Boolean).length;
      if (done >= visited.length) {
        if (opts.onDone) opts.onDone();
      } else {
        A.speak('Almost there! Keep tracing the dotted path!');
        doneBtn.classList.add('shake');
        setTimeout(() => doneBtn.classList.remove('shake'), 500);
      }
    });

    draw();
    updatePct();

    // auto prompt
    setTimeout(() => {
      A.speak(`Trace the ${label}. Start at the dots and follow the path!`, { force: false });
    }, 400);

    return {
      cleanup() {
        window.removeEventListener('resize', resize);
        canvas.removeEventListener('pointerdown', onDown);
        canvas.removeEventListener('pointermove', onMove);
        canvas.removeEventListener('pointerup', onUp);
        canvas.removeEventListener('pointercancel', onUp);
        canvas.removeEventListener('pointerleave', onUp);
      },
      isFinished() { return finished; }
    };
  }

  return { start };
})();
