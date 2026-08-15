/* ==========================================================================
   🌈 LET'S LEARN — coloring.js
   Interactive SVG coloring with a palette. Tap a region to fill it.
   ========================================================================== */

window.LLColoring = (function () {
  const D = window.LLData;
  const A = window.LLAudio;
  const PALETTE = ['red', 'yellow', 'blue', 'green', 'orange', 'purple', 'pink', 'brown'];

  /* opts: { template: 'apple', onDone: function } */
  function start(container, opts) {
    const tpl = D.COLORING_TEMPLATES[opts.template];
    if (!tpl) return;
    const size = tpl.size || 300;

    let selected = 'red';
    const colored = {}; // zoneId -> css color
    let finished = false;

    container.innerHTML = `
      <div class="coloring-wrap screen-anim">
        <div class="screen-title">🎨 Color ${tpl.name}</div>
        <p class="lesson-hint">Choose a color, then tap the picture to color it!</p>
        <div class="coloring-svg-wrap">
          <svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Coloring page: ${tpl.name}">
            <rect width="${size}" height="${size}" fill="#ffffff"/>
            ${tpl.svg}
          </svg>
        </div>
        <div class="palette" role="group" aria-label="Colors">
          ${PALETTE.map(c => {
            const col = D.COLORS[c];
            return `<button type="button" class="pal-swatch${c === selected ? ' selected' : ''}" data-color="${c}"
              style="background:${col.css}" aria-label="${col.name}" title="${col.name}"></button>`;
          }).join('')}
        </div>
        <div class="row center-x">
          <span class="color-count">🎨 <span class="colored-count">0</span> / ${countZones(tpl.svg)} colored</span>
        </div>
        <div class="trace-tools">
          <button type="button" class="btn small ghost btn-clear">🧽 Clear</button>
          <button type="button" class="btn small green btn-done" disabled>✅ Done</button>
        </div>
      </div>`;

    const svg = container.querySelector('svg');
    const countEl = container.querySelector('.colored-count');
    const doneBtn = container.querySelector('.btn-done');
    const totalZones = countZones(tpl.svg);

    function countZones(svgStr) {
      const m = svgStr.match(/class="zone"/g);
      return m ? m.length : 0;
    }

    function refresh() {
      container.querySelectorAll('.zone').forEach(z => {
        const id = z.getAttribute('data-id');
        if (colored[id]) z.style.fill = colored[id];
      });
      const n = Object.keys(colored).length;
      countEl.textContent = n;
      doneBtn.disabled = n < totalZones;
      if (n === totalZones && !finished) {
        finished = true;
        A.sfx.celebrate();
        A.speak('Beautiful! Your picture is finished!');
      }
    }

    svg.addEventListener('click', (e) => {
      const zone = e.target.closest('.zone');
      if (!zone) return;
      const id = zone.getAttribute('data-id');
      const col = D.COLORS[selected];
      colored[id] = col.css;
      zone.style.fill = col.css;
      zone.classList.add('colored');
      A.sfx.pop();
      refresh();
    });

    container.querySelectorAll('.pal-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        A.sfx.click();
        selected = sw.getAttribute('data-color');
        container.querySelectorAll('.pal-swatch').forEach(s => s.classList.toggle('selected', s === sw));
      });
    });

    container.querySelector('.btn-clear').addEventListener('click', () => {
      A.sfx.click();
      Object.keys(colored).forEach(k => delete colored[k]);
      container.querySelectorAll('.zone').forEach(z => { z.style.fill = ''; });
      finished = false;
      refresh();
    });

    doneBtn.addEventListener('click', () => {
      A.sfx.click();
      if (opts.onDone) opts.onDone();
    });

    setTimeout(() => A.speak(`Let's color the ${tpl.name}! Pick a color and tap the picture.`, { force: false }), 300);

    return {
      isFinished() { return finished; },
      cleanup() { svg.removeEventListener('click', null); }
    };
  }

  return { start };
})();
