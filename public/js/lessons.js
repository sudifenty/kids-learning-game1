/* ==========================================================================
   🌈 LET'S LEARN — lessons.js
   The lesson player. One concept at a time, big visuals, audio, gentle
   feedback. Each lesson is a sequence of typed steps (see data.js).
   ========================================================================== */

window.LLLessons = (function () {
  const D = window.LLData;
  const A = window.LLAudio;
  const R = window.LLRewards;

  let currentLesson = null;
  let stepIndex = 0;
  let wrongCount = 0;
  let correctCount = 0;
  let stepWrong = 0;
  let cleanupActivity = null;
  let finished = false;

  function play(container, lesson) {
    currentLesson = lesson;
    stepIndex = 0;
    wrongCount = 0;
    correctCount = 0;
    finished = false;
    renderStep(container);
  }

  /* object count tier: 1–4 → large, 5–8 → medium, 9+ → compact.
     Keeps several objects comfortably on screen without dominating it. */
  function countTier(n) {
    if (n <= 4) return '';
    if (n <= 8) return ' medium';
    return ' small';
  }

  /* ---------- step renderers ---------- */

  function shell(container, opts) {
    // opts: { dots: n, now: i, subject }
    const subj = opts.subject || 'english';
    container.innerHTML = `
      <div class="lesson-stage screen-anim">
        <div class="lesson-progress-dots">
          ${Array.from({ length: opts.dots }, (_, i) =>
            `<span class="l-dot ${i < opts.now ? 'done' : i === opts.now ? 'now' : ''}"></span>`).join('')}
        </div>
        <div id="step-body" style="width:100%;display:flex;flex-direction:column;align-items:center"></div>
        <div id="step-controls" class="row center-x mt" style="gap:12px"></div>
      </div>`;
    return {
      body: container.querySelector('#step-body'),
      controls: container.querySelector('#step-controls')
    };
  }

  /* The "friendly teacher": read-along card + child-friendly voice player.
     Narration plays sentence-by-sentence (natural pauses, slow default),
     the current sentence is highlighted, and content scrolls gently. */
  function narrationSetup(container, text, el) {
    const N = window.LLNarration;
    if (!N || !text) return null;
    // read-along card (sentence spans) below the visuals
    const card = document.createElement('div');
    card.innerHTML = N.readAlongHTML(text);
    el.body.appendChild(card);
    const spans = card.querySelectorAll('.readalong-sent');

    const onSentence = (i) => {
      spans.forEach((s, si) => {
        s.classList.toggle('speaking', si === i);
        s.classList.toggle('done', si < i);
      });
      if (spans[i]) N.scrollToEl(spans[i]);
    };

    // player controls: ▶ ⏸ 🔁 🔊 🐢 Slow/Normal/Fast
    const bar = document.createElement('div');
    bar.className = 'narration-holder';
    el.controls.insertBefore(bar, el.controls.firstChild);
    N.playerBar(bar, { onSentence });

    const sentences = N.splitSentences(text);
    return {
      play(onEnd) { N.playSentences(sentences, { onSentence, onEnd }); },
      sentences,
      spans,
      estimateMs() {
        const cfg = N.SPEEDS[N.speedOf()] || N.SPEEDS.slow;
        return sentences.reduce((s, x) => s + 900 + x.length * 82, 0) * (cfg.estScale || 1.35);
      }
    };
  }

  function nextButton(label, fn) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn green';
    btn.innerHTML = label || 'Next ▶';
    btn.addEventListener('click', () => { A.sfx.click(); fn(); });
    return btn;
  }

  /* Auto-advance: narrated steps move forward BY THEMSELVES when the
     teacher voice finishes (plus a short "look at the picture" pause).
     The child keeps full control: Skip ▶ jumps ahead instantly, pausing
     the narration also pauses the auto-advance, and the child can always
     scroll/read at their own pace. */
  let autoAdvanceTimer = null;
  let currentStepMedia = null; // media element of the current step (paused on leave)
  function clearAutoAdvance() {
    if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }
  }
  function scheduleAutoAdvance(container, lookMs) {
    clearAutoAdvance();
    const stepAt = stepIndex;
    autoAdvanceTimer = setTimeout(() => {
      autoAdvanceTimer = null;
      if (stepIndex === stepAt) advance(container);
    }, lookMs || 1300);
  }
  function pauseStepMedia() {
    if (currentStepMedia) {
      try { currentStepMedia.pause(); } catch (e) {}
      currentStepMedia = null;
    }
  }

  function infoControls(container, text, body) {
    const el = shell(container, { dots: currentLesson.steps.length, now: stepIndex, subject: currentLesson.subject });
    el.body.appendChild(body);
    const narration = narrationSetup(container, text, el);
    el.controls.appendChild(nextButton('Skip ▶', () => advance(container)));

    const stepAt = stepIndex;
    if (!narration || A.isMuted()) {
      // no voice (muted/offline): move on after the estimated reading time
      const est = narration ? narration.estimateMs() : 3500;
      setTimeout(() => {
        if (stepIndex === stepAt) scheduleAutoAdvance(container, 1200);
      }, est);
      return;
    }
    setTimeout(() => {
      if (stepIndex !== stepAt) return; // child already moved on
      if (!document.hidden) {
        narration.play(() => {
          if (stepIndex === stepAt) scheduleAutoAdvance(container, 1400);
        });
      }
      if (window.LLNarration) window.LLNarration.armGestureRetry();
    }, 450);
  }

  function advance(container) {
    clearAutoAdvance();
    pauseStepMedia();
    if (window.LLNarration) window.LLNarration.stop();
    stepIndex++;
    if (stepIndex >= currentLesson.steps.length) {
      finishLesson(container);
    } else {
      renderStep(container);
      // 📜 gentle auto-scroll so the new activity is in view
      try {
        const stage = container.querySelector('.lesson-stage');
        if (stage && stage.getBoundingClientRect().top < 0) {
          stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } catch (e) { /* ignore */ }
    }
  }

  /* ---------- quiz scaffolding ---------- */
  function quizShell(container, prompt, opts) {
    opts = opts || {};
    const el = shell(container, { dots: currentLesson.steps.length, now: stepIndex, subject: currentLesson.subject });
    const promptEl = document.createElement('div');
    promptEl.className = 'lesson-stage';
    promptEl.style.width = '100%';
    if (opts.emoji) {
      const pic = document.createElement('div');
      pic.className = 'lesson-emoji';
      pic.textContent = opts.emoji;
      promptEl.appendChild(pic);
    }
    const p = document.createElement('div');
    p.className = 'lesson-prompt';
    p.textContent = prompt;
    promptEl.appendChild(p);
    el.body.appendChild(promptEl);
    if (opts.autoSpeak !== false) {
      setTimeout(() => A.speak(opts.speak || prompt, { force: false }), 350);
    }
    return el;
  }

  function onWrong(btn, el) {
    wrongCount++;
    stepWrong++;
    A.sfx.wrong();
    A.speak(A.randomEncourage(), { force: false });
    if (btn) {
      btn.classList.add('wrong');
      setTimeout(() => btn.classList.remove('wrong'), 550);
    }
  }

  /* Correct answer → 🎉 AMAZING! + dancing character + short jingle,
     then auto-advance the moment the celebration ends (music-synced). */
  function onRight(btn, el, advanceFn) {
    correctCount++;
    if (window.LLNarration) window.LLNarration.stop();
    A.sfx.correct();
    if (btn) {
      btn.classList.add('correct');
      el.body.querySelectorAll('.answer-btn').forEach(b => b.classList.add('disabled'));
    }
    if (window.LLApp && window.LLApp.celebrate) {
      const praise = A.randomPraise().replace(/!+$/, '');
      window.LLApp.celebrate('🎉 ' + praise + '! 🎉', null, 0, {
        kind: 'success',
        onClose: advanceFn
      });
    } else {
      setTimeout(advanceFn, 950);
    }
  }

  /* ---------- step dispatcher ---------- */
  function renderStep(container) {
    currentStepMedia = null;
    if (cleanupActivity) {
      if (typeof cleanupActivity === 'function') cleanupActivity();
      else if (cleanupActivity.cleanup) cleanupActivity.cleanup();
      cleanupActivity = null;
    }
    const step = currentLesson.steps[stepIndex];

    /* RUNTIME ACTIVITY VALIDATION — never show a step where the visual
       contradicts the question or the expected answer. Invalid steps are
       skipped (and logged in the developer console, never on screen). */
    if (window.LLValidate) {
      const issues = window.LLValidate.check(currentLesson, step);
      if (issues.length) {
        issues.forEach(i => console.error('❌ Skipping invalid activity:', i.msg, i.detail));
        advance(container);
        return;
      }
    }
    stepWrong = 0;

    switch (step.t) {
      /* ----- info / say: picture + text + listen + next ----- */
      case 'info':
      case 'say': {
        const body = document.createElement('div');
        body.className = 'lesson-stage';
        if (step.emoji) {
          const pic = document.createElement('div');
          pic.className = step.t === 'say' ? 'big-picture' : 'lesson-emoji';
          pic.textContent = step.emoji;
          body.appendChild(pic);
        }
        if (step.title) {
          const t = document.createElement('div');
          t.className = 'lesson-word';
          t.textContent = step.title;
          body.appendChild(t);
        }
        const txt = document.createElement('div');
        txt.className = 'lesson-hint';
        txt.style.marginTop = '8px';
        txt.textContent = step.text;
        body.appendChild(txt);
        infoControls(container, step.speak || step.text, body);
        return;
      }

      /* ----- letter intro ----- */
      case 'letter': {
        const body = document.createElement('div');
        body.className = 'lesson-stage';
        const letter = document.createElement('div');
        letter.className = 'lesson-letter';
        letter.textContent = step.ch;
        body.appendChild(letter);
        const pic = document.createElement('div');
        pic.className = 'lesson-emoji';
        pic.textContent = step.pic;
        body.appendChild(pic);
        const word = document.createElement('div');
        word.className = 'lesson-word';
        word.textContent = `${step.ch} is for ${step.word}!`;
        body.appendChild(word);
        const say = step.phonics ? `${step.ch} says ${step.phonics}. ${step.ch} for ${step.word}!` : `${step.ch} for ${step.word}!`;
        infoControls(container, say, body);
        return;
      }

      /* ----- word intro ----- */
      case 'word': {
        const body = document.createElement('div');
        body.className = 'lesson-stage';
        const pic = document.createElement('div');
        pic.className = 'big-picture';
        pic.textContent = step.emoji;
        body.appendChild(pic);
        const w = document.createElement('div');
        w.className = 'lesson-word';
        w.textContent = step.word;
        body.appendChild(w);
        infoControls(container, step.speak, body);
        return;
      }

      /* ----- read passage (read-along: sentences highlighted in place) ----- */
      case 'read': {
        const body = document.createElement('div');
        body.className = 'lesson-stage';
        const pic = document.createElement('div');
        pic.className = 'lesson-emoji';
        pic.textContent = step.emoji;
        body.appendChild(pic);
        const card = document.createElement('div');
        card.className = 'read-card';
        card.innerHTML = window.LLNarration ? window.LLNarration.readAlongHTML(step.speak || step.text) : step.text;
        body.appendChild(card);
        const el = shell(container, { dots: currentLesson.steps.length, now: stepIndex, subject: currentLesson.subject });
        el.body.appendChild(body);
        const spans = card.querySelectorAll('.readalong-sent');
        const bar = document.createElement('div');
        bar.className = 'narration-holder';
        el.controls.insertBefore(bar, el.controls.firstChild);
        el.controls.appendChild(nextButton('Skip ▶', () => advance(container)));
        if (window.LLNarration) {
          const N = window.LLNarration;
          const onSentence = (i) => {
            spans.forEach((s, si) => {
              s.classList.toggle('speaking', si === i);
              s.classList.toggle('done', si < i);
            });
            if (spans[i]) N.scrollToEl(spans[i]);
          };
          N.playerBar(bar, { onSentence });
          // read-along plays; when it finishes → gentle pause → next step
          if (!A.isMuted()) {
            setTimeout(() => {
              if (!document.hidden) {
                N.playSentences(N.splitSentences(step.speak || step.text), {
                  onSentence,
                  onEnd: () => scheduleAutoAdvance(container, 1800)
                });
              }
              N.armGestureRetry();
            }, 450);
          } else {
            const stepAt = stepIndex;
            const sentences = N.splitSentences(step.speak || step.text);
            const cfg = N.SPEEDS[N.speedOf()] || N.SPEEDS.slow;
            const est = sentences.reduce((s2, x) => s2 + 900 + x.length * 82, 0) * (cfg.estScale || 1.35);
            setTimeout(() => {
              if (stepIndex === stepAt) scheduleAutoAdvance(container, 1200);
            }, est);
          }
        }
        return;
      }

      /* ----- shape intro ----- */
      case 'shape': {
        const body = document.createElement('div');
        body.className = 'lesson-stage';
        const sh = document.createElement('div');
        sh.innerHTML = D.shapeSVG(step.shape, 160, '');
        body.appendChild(sh);
        const name = document.createElement('div');
        name.className = 'lesson-word';
        name.textContent = D.SHAPE_NAMES[step.shape];
        body.appendChild(name);
        infoControls(container, step.speak, body);
        return;
      }

      /* ----- color intro ----- */
      case 'color': {
        const body = document.createElement('div');
        body.className = 'lesson-stage';
        const blob = document.createElement('div');
        blob.className = 'color-prompt-blob';
        blob.style.background = D.COLORS[step.color].css;
        body.appendChild(blob);
        const name = document.createElement('div');
        name.className = 'lesson-word';
        name.textContent = D.COLORS[step.color].name;
        body.appendChild(name);
        infoControls(container, step.speak, body);
        return;
      }

      /* ----- find letter ----- */
      case 'findLetter': {
        const el = quizShell(container, step.prompt, { speak: step.speak });
        const grid = document.createElement('div');
        grid.className = 'answer-grid';
        D.shuffle(step.options).forEach(l => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'answer-btn';
          b.innerHTML = `<span class="ab-big" style="font-size:clamp(3rem,12vw,4.2rem)">${l}</span>`;
          b.addEventListener('click', () => {
            if (l === step.answer) onRight(b, el, () => advance(container));
            else onWrong(b, el);
          });
          grid.appendChild(b);
        });
        el.body.appendChild(grid);
        return;
      }

      /* ----- count objects -----
         Visual hierarchy: instruction → LARGE spaced objects → "How many?" → answers.
         The number of rendered objects (step.n) IS the correct answer. */
      case 'count': {
        const el = quizShell(container, `🔢 Count the ${step.pic}!`, { speak: step.speak });
        const field = document.createElement('div');
        field.className = 'count-field' + countTier(step.n);
        for (let i = 0; i < step.n; i++) {
          const s = document.createElement('span');
          s.className = 'cf-item';
          s.textContent = step.pic;
          s.style.animationDelay = (i * 0.05) + 's';
          field.appendChild(s);
        }
        el.body.appendChild(field);
        const howMany = document.createElement('div');
        howMany.className = 'lesson-hint';
        howMany.style.marginTop = '14px';
        howMany.textContent = 'How many?';
        el.body.appendChild(howMany);
        const grid = document.createElement('div');
        grid.className = 'answer-grid';
        D.shuffle(step.options).forEach(n => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'answer-btn';
          b.innerHTML = `<span class="ab-big">${n}</span>`;
          b.addEventListener('click', () => {
            if (n === step.n) onRight(b, el, () => advance(container));
            else onWrong(b, el);
          });
          grid.appendChild(b);
        });
        el.body.appendChild(grid);
        return;
      }

      /* ----- find number ----- */
      case 'findNumber': {
        const el = quizShell(container, step.prompt, { speak: step.speak });
        const grid = document.createElement('div');
        grid.className = 'answer-grid';
        D.shuffle(step.options).forEach(n => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'answer-btn';
          b.innerHTML = `<span class="ab-big">${n}</span>`;
          b.addEventListener('click', () => {
            if (n === step.answer) onRight(b, el, () => advance(container));
            else onWrong(b, el);
          });
          grid.appendChild(b);
        });
        el.body.appendChild(grid);
        return;
      }

      /* ----- find shape ----- */
      case 'findShape': {
        const el = quizShell(container, `Tap the ${D.SHAPE_NAMES[step.answer]}!`, { speak: step.speak });
        const grid = document.createElement('div');
        grid.className = 'answer-grid';
        D.shuffle(step.options).forEach(s => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'answer-btn shape-option';
          b.innerHTML = D.shapeSVG(s, 84, '');
          b.addEventListener('click', () => {
            if (s === step.answer) onRight(b, el, () => advance(container));
            else onWrong(b, el);
          });
          grid.appendChild(b);
        });
        el.body.appendChild(grid);
        return;
      }

      /* ----- find color ----- */
      case 'findColor': {
        const el = quizShell(container, `Tap the ${D.COLORS[step.answer].name} color!`, { speak: step.speak });
        const row = document.createElement('div');
        row.className = 'row center-x wrap';
        row.style.gap = '14px';
        D.shuffle(step.options).forEach(c => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'color-option';
          b.style.background = D.COLORS[c].css;
          b.setAttribute('aria-label', D.COLORS[c].name);
          b.addEventListener('click', () => {
            if (c === step.answer) {
              b.style.outline = '6px solid #35c46b';
              onRight(b, el, () => advance(container));
            } else onWrong(b, el);
          });
          row.appendChild(b);
        });
        el.body.appendChild(row);
        return;
      }

      /* ----- match pairs ----- */
      case 'match': {
        const el = shell(container, { dots: currentLesson.steps.length, now: stepIndex, subject: currentLesson.subject });
        const promptEl = document.createElement('div');
        promptEl.className = 'lesson-prompt';
        promptEl.textContent = 'Tap the picture, then tap its word!';
        el.body.appendChild(promptEl);
        const grid = document.createElement('div');
        grid.className = 'match-grid';
        const items = D.shuffle(step.pairs.map((p, i) => ({ kind: 'pic', key: i })).concat(step.pairs.map((p, i) => ({ kind: 'word', key: i }))));
        let selected = null;
        let matchedCount = 0;
        const cards = [];
        items.forEach(it => {
          const card = document.createElement('button');
          card.type = 'button';
          card.className = 'match-card';
          card.setAttribute('data-key', it.key);
          card.setAttribute('data-kind', it.kind);
          if (it.kind === 'pic') {
            const e = document.createElement('span');
            e.className = 'mc-emoji';
            e.textContent = step.pairs[it.key][0];
            card.appendChild(e);
          } else {
            card.textContent = step.pairs[it.key][1];
          }
          card.addEventListener('click', () => {
            if (card.classList.contains('matched')) return;
            A.sfx.flip();
            if (!selected) {
              selected = card;
              card.classList.add('selected');
            } else if (selected === card) {
              selected = null;
              card.classList.remove('selected');
            } else {
              const a = selected, b = card;
              if (a.getAttribute('data-key') === b.getAttribute('data-key') && a.getAttribute('data-kind') !== b.getAttribute('data-kind')) {
                a.classList.remove('selected');
                a.classList.add('matched');
                b.classList.add('matched');
                matchedCount++;
                A.sfx.correct();
                A.playCelebration('success');
                selected = null;
                if (matchedCount === step.pairs.length) {
                  correctCount++;
                  setTimeout(() => advance(container), 800);
                }
              } else {
                a.classList.remove('selected');
                onWrong(null, el);
                selected = null;
                setTimeout(() => { a.classList.add('shake'); b.classList.add('shake'); setTimeout(() => { a.classList.remove('shake'); b.classList.remove('shake'); }, 450); }, 10);
              }
            }
          });
          grid.appendChild(card);
          cards.push(card);
        });
        el.body.appendChild(grid);
        el.controls.appendChild(nextButton('Skip ▶', () => advance(container)));
        setTimeout(() => A.speak(step.speak), 400);
        return;
      }

      /* ----- visual math -----
         The picture MUST show the operation:
           +  → a items, plus sign, b items
           −  → a items, minus sign, b items crossed out (taken away)
           ×  → a groups of b items (grouped rows)
         The correct button is step.answer — the same value the visuals encode. */
      case 'math': {
        const opSym = { '+': '+', '-': '−', '×': '×' }[step.op] || step.op;
        const el = quizShell(container, `${step.a} ${opSym} ${step.b} = ?`, { speak: step.speak });
        const field = document.createElement('div');
        const totalShown = step.op === '×' ? step.a * step.b : step.a + step.b;
        field.className = 'count-field' + countTier(totalShown);
        const mkItem = (delay, taken) => {
          const s = document.createElement('span');
          s.className = 'cf-item' + (taken ? ' cf-taken' : '');
          s.textContent = step.pic;
          s.style.animationDelay = (delay * 0.05) + 's';
          return s;
        };
        if (step.op === '×') {
          // groups: a groups of b — children count groups × items
          for (let g = 0; g < step.a; g++) {
            const group = document.createElement('div');
            group.className = 'cf-group';
            for (let i = 0; i < step.b; i++) group.appendChild(mkItem(g * step.b + i, false));
            field.appendChild(group);
          }
          const gl = document.createElement('div');
          gl.className = 'cf-group-label';
          gl.textContent = `${step.a} groups of ${step.b}`;
          field.appendChild(gl);
        } else {
          for (let i = 0; i < step.a; i++) field.appendChild(mkItem(i, false));
          const sign = document.createElement('span');
          sign.className = 'cf-sign';
          sign.textContent = opSym;
          field.appendChild(sign);
          for (let i = 0; i < step.b; i++) field.appendChild(mkItem(step.a + i, step.op === '-'));
        }
        el.body.appendChild(field);
        const grid = document.createElement('div');
        grid.className = 'answer-grid';
        D.shuffle(step.options).forEach(n => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'answer-btn';
          b.innerHTML = `<span class="ab-big">${n}</span>`;
          b.addEventListener('click', () => {
            if (n === step.answer) onRight(b, el, () => advance(container));
            else onWrong(b, el);
          });
          grid.appendChild(b);
        });
        el.body.appendChild(grid);
        return;
      }

      /* ----- comprehension / multiple choice ----- */
      case 'q': {
        const el = quizShell(container, step.question, { speak: step.speak, emoji: step.emoji });
        const grid = document.createElement('div');
        grid.className = 'answer-grid';
        D.shuffle(step.options).forEach(o => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'answer-btn';
          b.innerHTML = `<span class="ab-small" style="font-size:1.25rem">${o}</span>`;
          b.addEventListener('click', () => {
            if (o === step.answer) onRight(b, el, () => advance(container));
            else onWrong(b, el);
          });
          grid.appendChild(b);
        });
        el.body.appendChild(grid);
        return;
      }

      /* ----- pattern ----- */
      case 'pattern': {
        const el = quizShell(container, 'What comes next?', { speak: step.speak });
        const seq = document.createElement('div');
        seq.className = 'count-field';
        step.seq.forEach((e, i) => {
          const s = document.createElement('span');
          s.className = 'cf-item';
          s.textContent = e;
          s.style.animationDelay = (i * 0.08) + 's';
          seq.appendChild(s);
        });
        el.body.appendChild(seq);
        const grid = document.createElement('div');
        grid.className = 'answer-grid';
        D.shuffle(step.options).forEach(e => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'answer-btn';
          b.innerHTML = `<span class="ab-big">${e}</span>`;
          b.addEventListener('click', () => {
            if (e === step.answer) onRight(b, el, () => advance(container));
            else onWrong(b, el);
          });
          grid.appendChild(b);
        });
        el.body.appendChild(grid);
        return;
      }

      /* ----- compare more/less ----- */
      case 'compare': {
        const el = quizShell(container, 'Which side has MORE?', { speak: step.speak });
        const row = document.createElement('div');
        row.className = 'row center-x';
        row.style.gap = '24px';
        row.style.marginTop = '10px';
        const mkSide = (pic, n, id) => {
          const side = document.createElement('button');
          side.type = 'button';
          side.className = 'answer-btn compare-side';
          side.setAttribute('data-side', id);
          let html = '';
          for (let i = 0; i < n; i++) html += pic;
          side.innerHTML = `<span class="ab-big">${html}</span>`;
          side.addEventListener('click', () => {
            if (id === step.answer) onRight(side, el, () => advance(container));
            else onWrong(side, el);
          });
          return side;
        };
        row.appendChild(mkSide(step.picA, step.nA, 'A'));
        row.appendChild(mkSide(step.picB, step.nB, 'B'));
        el.body.appendChild(row);
        return;
      }

      /* ----- order ----- */
      case 'order': {
        const el = quizShell(container, 'Tap them in order!', { speak: step.speak });
        const tray = document.createElement('div');
        tray.className = 'order-tray';
        const items = D.shuffle(step.items.slice());
        let idx = 0;
        items.forEach(v => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'order-chip';
          b.textContent = v;
          b.setAttribute('data-v', v);
          b.addEventListener('click', () => {
            const sorted = step.items.slice().sort((x, y) => x - y);
            if (v === sorted[idx]) {
              b.classList.add('picked');
              A.sfx.correct();
              A.playCelebration('success');
              idx++;
              if (idx === items.length) {
                correctCount++;
                setTimeout(() => advance(container), 700);
              }
            } else {
              wrongCount++;
              A.sfx.wrong();
              b.classList.add('bad');
              setTimeout(() => b.classList.remove('bad'), 450);
            }
          });
          tray.appendChild(b);
        });
        el.body.appendChild(tray);
        return;
      }

      /* ----- tracing step ----- */
      case 'trace': {
        const el = shell(container, { dots: currentLesson.steps.length, now: stepIndex, subject: currentLesson.subject });
        el.controls.appendChild(nextButton('Skip ▶', () => advance(container)));
        cleanupActivity = window.LLTracing.start(el.body, {
          kind: step.kind, which: step.which,
          onDone: () => {
            correctCount++;
            A.sfx.celebrate();
            A.speak('Super tracing!');
            setTimeout(() => advance(container), 900);
          }
        });
        return;
      }

      /* ----- coloring step ----- */
      case 'colorIt': {
        const el = shell(container, { dots: currentLesson.steps.length, now: stepIndex, subject: currentLesson.subject });
        el.controls.appendChild(nextButton('Skip ▶', () => advance(container)));
        cleanupActivity = window.LLColoring.start(el.body, {
          template: step.template,
          onDone: () => {
            correctCount++;
            A.sfx.celebrate();
            A.speak('What a beautiful picture!');
            setTimeout(() => advance(container), 900);
          }
        });
        return;
      }

      /* ----- media step (song / video / audio, self-hosted) ----- */
      case 'media': {
        const el = shell(container, { dots: currentLesson.steps.length, now: stepIndex, subject: currentLesson.subject });
        const body = el.body;
        body.innerHTML = '<p class="screen-sub">Loading…</p>';
        if (!window.LLMedia) { body.innerHTML = '<p class="lesson-hint">Media is not available right now.</p>'; return; }
        window.LLMedia.loadCatalog().then(() => {
          const m = window.LLMedia.byId(step.id);
          if (!m) {
            body.innerHTML = '<p class="lesson-hint">Media not found — moving on!</p>';
            scheduleAutoAdvance(container, 2200);
            return;
          }
          body.innerHTML = '';
          const label = document.createElement('div');
          label.className = 'lesson-prompt';
          label.textContent = '🎧 ' + (step.label || ('Listen and learn! ' + m.title));
          body.appendChild(label);
          const player = window.LLMedia.playerHTML(body, { id: m.id, autoplay: true });
          // when the song/video finishes, move on by itself
          if (player && player.media) {
            currentStepMedia = player.media;
            const stepAt = stepIndex;
            player.media.addEventListener('ended', () => {
              if (stepIndex === stepAt) scheduleAutoAdvance(container, 1200);
            });
          }
        });
        const next = nextButton('Skip ▶', () => advance(container));
        el.controls.appendChild(next);
        return;
      }

      /* ----- shape art step ----- */
      case 'shapeArt': {
        const el = shell(container, { dots: currentLesson.steps.length, now: stepIndex, subject: currentLesson.subject });
        const body = el.body;
        let shapes = null, color = '#2f7de1';
        body.innerHTML = `
          <div class="lesson-stage">
            <div class="lesson-prompt">Build a picture with shapes!</div>
            <div class="shape-art-tray">
              ${['circle', 'square', 'triangle', 'star', 'heart', 'diamond'].map(s =>
                `<button type="button" class="sa-shape" data-shape="${s}">${D.shapeSVG(s, 44, '#2f7de1')}</button>`).join('')}
            </div>
            <div class="palette">
              ${['#ef4444', '#facc15', '#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#92400e'].map((c, i) =>
                `<button type="button" class="pal-swatch${i === 0 ? ' selected' : ''}" data-c="${c}" style="background:${c}"></button>`).join('')}
            </div>
            <div class="trace-canvas-wrap" style="touch-action:none">
              <canvas width="1000" height="700" style="border-radius:16px;background:#fff"></canvas>
            </div>
            <div class="trace-tools">
              <button type="button" class="btn small ghost btn-sa-clear">🧽 Clear</button>
              <button type="button" class="btn small green btn-sa-done">✅ Done</button>
            </div>
          </div>`;
        const canvas = body.querySelector('canvas');
        const g = canvas.getContext('2d');
        const wrap = body.querySelector('.trace-canvas-wrap');
        const scale = () => wrap.getBoundingClientRect().width / canvas.width;
        shapes = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond'].map(s => {
          const r = 30 + Math.random() * 30;
          return { s, x: Math.random() * canvas.width, y: Math.random() * canvas.height, r, c: '#2f7de1' };
        });
        function drawAll() {
          g.clearRect(0, 0, canvas.width, canvas.height);
          shapes.forEach(sh => {
            g.fillStyle = sh.c;
            g.strokeStyle = '#33385c';
            g.lineWidth = 6;
            const cx = sh.x, cy = sh.y, r = sh.r;
            g.beginPath();
            if (sh.s === 'circle') g.arc(cx, cy, r, 0, Math.PI * 2);
            else if (sh.s === 'square') g.rect(cx - r, cy - r, r * 2, r * 2);
            else if (sh.s === 'triangle') { g.moveTo(cx, cy - r); g.lineTo(cx - r, cy + r); g.lineTo(cx + r, cy + r); g.closePath(); }
            else if (sh.s === 'star') {
              const pts = D.starPoints(cx, cy, r, r * 0.45).split(' ').map(p => p.split(',').map(Number));
              g.moveTo(pts[0][0], pts[0][1]);
              pts.slice(1).forEach(p => g.lineTo(p[0], p[1]));
              g.closePath();
            }
            else if (sh.s === 'heart') {
              g.moveTo(cx, cy + r * 0.8);
              g.bezierCurveTo(cx - r * 1.3, cy - r * 0.1, cx - r * 0.8, cy - r, cx, cy - r * 0.3);
              g.bezierCurveTo(cx + r * 0.8, cy - r, cx + r * 1.3, cy - r * 0.1, cx, cy + r * 0.8);
            }
            else if (sh.s === 'diamond') {
              g.moveTo(cx, cy - r); g.lineTo(cx + r, cy); g.lineTo(cx, cy + r); g.lineTo(cx - r, cy); g.closePath();
            }
            g.fill();
            g.stroke();
          });
        }
        drawAll();
        // draggable shapes
        let drag = null, offset = null;
        function pos(e) {
          const rect = canvas.getBoundingClientRect();
          return [(e.clientX - rect.left) * (canvas.width / rect.width), (e.clientY - rect.top) * (canvas.height / rect.height)];
        }
        canvas.addEventListener('pointerdown', (e) => {
          const [x, y] = pos(e);
          for (let i = shapes.length - 1; i >= 0; i--) {
            const sh = shapes[i];
            const dx = x - sh.x, dy = y - sh.y;
            if (Math.sqrt(dx * dx + dy * dy) < sh.r + 25) {
              drag = sh;
              offset = [dx, dy];
              canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
              return;
            }
          }
          drag = { x, y, r: 40, s: 'circle', c: color }; // stamp a new shape
          shapes.push(drag);
          offset = [0, 0];
          drawAll();
        });
        canvas.addEventListener('pointermove', (e) => {
          if (!drag) return;
          const [x, y] = pos(e);
          drag.x = x - offset[0];
          drag.y = y - offset[1];
          drawAll();
        });
        canvas.addEventListener('pointerup', () => { drag = null; });
        body.querySelectorAll('.sa-shape').forEach(b => {
          b.addEventListener('click', () => {
            A.sfx.click();
            shapes.forEach(sh => { if (!sh.sel) { sh.sel = false; } });
            const s = b.getAttribute('data-shape');
            // next taps stamp this shape
            window._saShape = s;
            body.querySelectorAll('.sa-shape').forEach(x => x.classList.toggle('active', x === b));
          });
        });
        // patch stamp to use selected shape
        const origDown = canvas.onpointerdown;
        canvas.addEventListener('pointerdown', (e) => {
          // choose shape from selection before stamping
          const selShape = body.querySelector('.sa-shape.active');
          if (selShape && !e.target.classList.contains('sa-shape')) {
            const s = selShape.getAttribute('data-shape');
            const [x, y] = pos(e);
            // check if tapping an existing shape (move) vs empty (stamp)
            let hit = false;
            for (const sh of shapes) {
              const dx = x - sh.x, dy = y - sh.y;
              if (Math.sqrt(dx * dx + dy * dy) < sh.r + 25) { hit = true; break; }
            }
            if (!hit) {
              shapes.push({ s, x, y, r: 40, c: color });
              drawAll();
              A.sfx.pop();
            }
          }
        });
        body.querySelectorAll('.pal-swatch').forEach(sw => {
          sw.addEventListener('click', () => {
            A.sfx.click();
            color = sw.getAttribute('data-c');
            body.querySelectorAll('.pal-swatch').forEach(x => x.classList.toggle('selected', x === sw));
          });
        });
        body.querySelector('.btn-sa-clear').addEventListener('click', () => {
          A.sfx.click();
          shapes = [];
          drawAll();
        });
        body.querySelector('.btn-sa-done').addEventListener('click', () => {
          A.sfx.click();
          if (shapes.length >= 2) {
            correctCount++;
            A.sfx.celebrate();
            A.speak('What a wonderful picture!');
            setTimeout(() => advance(container), 900);
          } else {
            A.speak('Add a few more shapes to finish your picture!');
          }
        });
        el.controls.appendChild(nextButton('Skip ▶', () => advance(container)));
        setTimeout(() => A.speak('Tap a shape to pick it, then tap the canvas to place it! Drag shapes to move them.', { force: false }), 400);
        return;
      }

      default:
        infoControls(container, 'Tap Next to continue!', document.createTextNode(''));
    }
  }

  /* ---------- lesson end ---------- */
  function finishLesson(container) {
    if (finished) return;
    finished = true;
    if (window.LLNarration) window.LLNarration.stop();
    const lesson = currentLesson;
    const totalSteps = lesson.steps.length;
    // stars: 3 if ≤1 wrong, 2 if ≤3 wrong, else 1
    const stars = wrongCount <= 1 ? 3 : wrongCount <= 3 ? 2 : 1;
    const beforeBadges = (R.state.badges || []).slice();
    R.recordLesson(lesson.id, stars, wrongCount, correctCount);
    // any brand-new badge earned by this lesson?
    const newBadgeIds = (R.state.badges || []).filter(b => beforeBadges.indexOf(b) === -1);
    const newBadge = newBadgeIds.map(id => D.BADGES.find(b => b.id === id)).filter(Boolean)[0];
    // the next challenge in this subject/area (first not-yet-completed after this one)
    const kinder = D.isKinderClass(R.state.child.className);
    const nextLesson = kinder
      ? (function () {
          const areaId = D.areaForLesson(lesson.id);
          const area = D.KINDER_AREAS.find(a => a.id === areaId);
          const lessons = (area && area.lessons && area.lessons[R.state.child.className] || [])
            .map(id => R.findLesson(id)).filter(Boolean);
          const idx = lessons.findIndex(l => l.id === lesson.id);
          return lessons.slice(idx + 1).find(l => !R.state.lessonRecords[l.id]) || null;
        })()
      : (function () {
          const subjectLessons = R.lessonsFor(lesson.subject, R.state.child.className);
          const idx = subjectLessons.findIndex(l => l.id === lesson.id);
          return subjectLessons.slice(idx + 1).find(l => !R.state.lessonRecords[l.id]) || null;
        })();

    const subj = D.SUBJECTS[lesson.subject];
    const title = stars === 3 ? '🏆 AMAZING! 🏆' : stars === 2 ? '🥳 GREAT JOB! 🥳' : '😊 WELL DONE! 😊';

    // end screen renders immediately; the celebration dances on top of it
    container.innerHTML = `
      <div class="game-end screen-anim">
        <div class="lesson-emoji">${stars === 3 ? '🏆' : stars === 2 ? '🥳' : '😊'}</div>
        <div class="ge-stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
        <div class="ge-title">${stars === 3 ? 'AMAZING!' : stars === 2 ? 'GREAT JOB!' : 'WELL DONE!'}</div>
        <div class="ge-sub">${lesson.title} — you earned ${stars} star${stars === 1 ? '' : 's'}!</div>
        ${newBadge ? `<div class="cel-badge" style="animation:none">🏅 New badge: ${newBadge.name}!</div>` : ''}
        ${nextLesson ? '<p class="lesson-hint">Next challenge coming up… 🚀</p>' : '<p class="lesson-hint">All lessons done in this subject! 🎉</p>'}
        <div class="row center-x">
          <button class="btn small ghost" id="btn-back-subject" type="button">${kinder ? '🧸 More activities' : '📚 More lessons'}</button>
          <button class="btn small ${subj ? subj.colorCss === '#2f7de1' ? 'english' : subj.colorCss === '#f99a1c' ? 'maths' : subj.colorCss === '#2fa96b' ? 'science' : subj.colorCss === '#8b5cf6' ? 'sst' : 'creative' : 'english'}" id="btn-journey" type="button">🗺️ Learning journey</button>
        </div>
      </div>`;
    container.querySelector('#btn-back-subject').addEventListener('click', () => {
      A.sfx.click();
      const areaId = kinder ? D.areaForLesson(lesson.id) : null;
      location.hash = areaId ? '#/area/' + areaId : `#/subject/${lesson.subject}`;
    });
    container.querySelector('#btn-journey').addEventListener('click', () => {
      A.sfx.click();
      location.hash = `#/journey`;
    });
    window.LLApp.updateTopbarStars();

    // 🎉 dancing character + completion tune + confetti; when it ends,
    // automatically move on to the next challenge (unless the child navigated away)
    const fromHash = location.hash;
    window.LLApp.celebrate(title, null, stars, {
      kind: 'lesson',
      badge: newBadge ? newBadge.name : null,
      onClose: () => {
        if (location.hash !== fromHash) return; // child already moved on
        if (nextLesson) location.hash = '#/lesson/' + nextLesson.id;
        else location.hash = kinder ? '#/area/' + (D.areaForLesson(lesson.id) || 'letters') : '#/subject/' + lesson.subject;
      }
    });
  }

  return { play };
})();
