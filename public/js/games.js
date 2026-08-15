/* ==========================================================================
   🌈 LET'S LEARN — games.js
   Educational mini-games: Counting, Memory, Shape Sorter, Color Splash,
   Letter Find, Number Order and Math Pop. All games reinforce learning.
   ========================================================================== */

window.LLGames = (function () {
  const D = window.LLData;
  const A = window.LLAudio;

  /* difficulty by class */
  function classCfg(className) {
    switch (className) {
      case 'baby': return { countRange: [1, 3], memPairs: 3, orderMax: 4, mathMax: 5 };
      case 'middle': return { countRange: [1, 5], memPairs: 4, orderMax: 5, mathMax: 8 };
      case 'top': return { countRange: [1, 10], memPairs: 5, orderMax: 6, mathMax: 10 };
      case 'p1': return { countRange: [1, 15], memPairs: 6, orderMax: 8, mathMax: 15 };
      case 'p2': return { countRange: [1, 20], memPairs: 6, orderMax: 10, mathMax: 20 };
      case 'p3': return { countRange: [5, 25], memPairs: 6, orderMax: 12, mathMax: 30 };
      default: return { countRange: [1, 10], memPairs: 5, orderMax: 6, mathMax: 10 };
    }
  }

  function availableGames(className) {
    const games = [
      { id: 'counting', icon: '🔢', name: 'Counting Game', desc: 'Count the objects!', classes: ['baby', 'middle', 'top', 'p1', 'p2', 'p3'] },
      { id: 'memory', icon: '🧠', name: 'Memory Match', desc: 'Find the pairs!', classes: ['middle', 'top', 'p1', 'p2', 'p3'] },
      { id: 'shapes', icon: '🔷', name: 'Shape Sorter', desc: 'Tap the right shape!', classes: ['baby', 'middle', 'top', 'p1'] },
      { id: 'colors', icon: '🌈', name: 'Color Splash', desc: 'Tap the right color!', classes: ['baby', 'middle', 'top', 'p1'] },
      { id: 'letters', icon: '🔤', name: 'Letter Finder', desc: 'Find the letter!', classes: ['top', 'p1', 'p2', 'p3'] },
      { id: 'order', icon: '🔢', name: 'Number Order', desc: 'Tap numbers in order!', classes: ['p1', 'p2', 'p3'] },
      { id: 'mathpop', icon: '🎈', name: 'Math Balloons', desc: 'Pop the right answer!', classes: ['p2', 'p3'] }
    ];
    return games.filter(g => g.classes.indexOf(className) !== -1);
  }

  function renderGameList(container, className) {
    const games = availableGames(className);
    container.innerHTML = `
      <div class="screen-anim">
        <div class="screen-title">🎮 Let's Play!</div>
        <p class="screen-sub">Short games that help you practice what you learn!</p>
        <div class="card-grid">
          ${games.map(g => `
            <button class="creative-card" data-game="${g.id}" type="button">
              <span class="cr-icon">${g.icon}</span>
              <span class="cr-name">${g.name}</span>
              <span class="cr-sub">${g.desc}</span>
            </button>`).join('')}
        </div>
      </div>`;
    container.querySelectorAll('[data-game]').forEach(b => {
      b.addEventListener('click', () => {
        A.sfx.click();
        location.hash = '#/game/' + b.getAttribute('data-game');
      });
    });
  }

  /* ================= shared round scaffolding ================= */
  function roundFrame(container, cfg) {
    // cfg: { title, round, totalRounds, score } returns object to patch
    container.innerHTML = `
      <div class="screen-anim">
        <div class="game-top">
          <span class="game-round">Round <span class="gr-now">${cfg.round}</span> / ${cfg.totalRounds}</span>
          <span class="game-score">⭐ <span class="gs-num">${cfg.score}</span></span>
          <button class="icon-btn game-quit" type="button" aria-label="Quit game">🏠</button>
        </div>
        <div id="game-body"></div>
      </div>`;
    const body = container.querySelector('#game-body');
    return {
      body,
      quitBtn: container.querySelector('.game-quit'),
      setRound(n) {
        container.querySelector('.gr-now').textContent = n;
      },
      setScore(n) {
        container.querySelector('.gs-num').textContent = n;
      }
    };
  }

  function endScreen(container, cfg, stars, onReplay) {
    container.innerHTML = `
      <div class="game-end screen-anim">
        <div class="ge-stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
        <div class="ge-title">${stars === 3 ? '🎉 Perfect!' : stars === 2 ? '🥳 Great job!' : '😊 Well done!'}</div>
        <div class="ge-sub">${cfg.name} finished! You earned ${stars} star${stars === 1 ? '' : 's'}!</div>
        <div class="row center-x">
          <button class="btn small ghost btn-replay" type="button">🔄 Play again</button>
          <button class="btn small play btn-more" type="button">🎮 More games</button>
        </div>
      </div>`;
    container.querySelector('.btn-replay').addEventListener('click', () => { A.sfx.click(); onReplay(); });
    container.querySelector('.btn-more').addEventListener('click', () => { A.sfx.click(); location.hash = '#/play'; });
  }

  function finish(container, cfg, correct, total, className, gameId, onReplay) {
    const ratio = correct / total;
    const stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
    window.LLRewards.recordGame(gameId, stars);
    // 🎉 dancing character + fanfare, then the results screen
    const title = stars === 3 ? '🎉 PERFECT! 🎉' : stars === 2 ? '🥳 GREAT JOB! 🥳' : '😊 WELL DONE! 😊';
    window.LLApp.celebrate(title, null, stars, {
      kind: 'big',
      onClose: () => endScreen(container, cfg, stars, onReplay)
    });
  }

  /* ================= 1. COUNTING ================= */
  function counting(container, className, gameId) {
    const cfg = classCfg(className);
    const [lo, hi] = cfg.countRange;
    const totalRounds = 6;
    let round = 0, score = 0, wrong = 0;
    const PIC = ['🍎', '🍌', '⭐', '🐤', '🌸', '🎈', '🍓', '🦋', '🐢', '🌼'];

    function playRound() {
      round++;
      const frame = roundFrame(container, { title: 'Counting', round, totalRounds, score });
      frame.quitBtn.addEventListener('click', () => { location.hash = '#/play'; });
      const n = lo + Math.floor(Math.random() * (hi - lo + 1));
      const pic = PIC[Math.floor(Math.random() * PIC.length)];
      const tier = n <= 4 ? '' : n <= 8 ? ' medium' : ' small';
      // answer options: n plus two nearby unique numbers
      const opts = new Set([n]);
      while (opts.size < 3) {
        const cand = n + Math.floor(Math.random() * 5) - 2;
        if (cand >= lo && cand <= hi + 2) opts.add(cand);
      }
      const optArr = D.shuffle([...opts]);
      // build exactly `n` objects — the number the child must count
      const objects = Array.from({ length: n }, () => `<span class="cf-item">${pic}</span>`).join('');
      frame.body.innerHTML = `
        <div class="lesson-stage">
          <div class="lesson-prompt">🔢 Count the ${pic}!</div>
          <div class="count-field${tier}">${objects}</div>
          <div class="lesson-hint" style="margin-top:14px">How many?</div>
          <div class="answer-grid">
            ${optArr.map(o => `<button class="answer-btn" data-n="${o}"><span class="ab-big">${o}</span></button>`).join('')}
          </div>
        </div>`;
      // safety net: what the child SEES must equal the expected answer
      const visible = frame.body.querySelectorAll('.cf-item').length;
      if (visible !== n) {
        console.error('❌ Counting game visual mismatch — visible:', visible, 'expected:', n);
        frame.body.querySelector('.count-field').innerHTML = Array.from({ length: n }, () => `<span class="cf-item">${pic}</span>`).join('');
      }
      const buttons = frame.body.querySelectorAll('.answer-btn');
      buttons.forEach(b => {
        b.addEventListener('click', () => {
          const val = +b.getAttribute('data-n');
          if (val === n) {
            score++;
            A.sfx.correct();
            A.playCelebration('success');
            b.classList.add('correct');
            buttons.forEach(x => x.classList.add('disabled'));
            frame.setScore(score);
            setTimeout(() => { round < totalRounds ? playRound() : finish(container, { name: 'Counting' }, score, totalRounds, className, gameId, () => counting(container, className, gameId)); }, 900);
          } else {
            wrong++;
            A.sfx.wrong();
            b.classList.add('wrong');
            setTimeout(() => b.classList.remove('wrong'), 500);
            A.speak(A.randomEncourage());
          }
        });
      });
      A.speak(`Count the ${pic}. How many are there?`);
    }
    playRound();
  }

  /* ================= 2. MEMORY ================= */
  function memory(container, className, gameId) {
    const cfg = classCfg(className);
    const pairs = cfg.memPairs;
    const EMOJIS = ['🍎', '🚌', '🐱', '⭐', '🌸', '🎈', '🦋', '🐢', '🍌', '🐶', '🌙', '🍓'];
    const chosen = D.shuffle(EMOJIS).slice(0, pairs);
    const deck = D.shuffle(chosen.concat(chosen));
    let flipped = [], matched = 0, moves = 0;

    container.innerHTML = `
      <div class="screen-anim">
        <div class="game-top">
          <span class="game-round">Find the pairs!</span>
          <span class="game-score">Moves: <span class="gs-num">0</span></span>
          <button class="icon-btn game-quit" type="button" aria-label="Quit game">🏠</button>
        </div>
        <div class="memory-grid">
          ${deck.map((e, i) => `<button class="mem-card" data-i="${i}" data-e="${e}" type="button" aria-label="Hidden card"></button>`).join('')}
        </div>
      </div>`;

    const cards = [...container.querySelectorAll('.mem-card')];
    const scoreEl = container.querySelector('.gs-num');
    const quit = container.querySelector('.game-quit');
    quit.addEventListener('click', () => { location.hash = '#/play'; });

    function checkEnd() {
      if (matched === pairs) {
        const stars = moves <= pairs + 2 ? 3 : moves <= pairs + 6 ? 2 : 1;
        window.LLRewards.recordGame(gameId, stars);
        const title = stars === 3 ? '🎉 PERFECT! 🎉' : stars === 2 ? '🥳 GREAT JOB! 🥳' : '😊 WELL DONE! 😊';
        window.LLApp.celebrate(title, null, stars, {
          kind: 'big',
          onClose: () => endScreen(container, { name: 'Memory Match' }, stars, () => memory(container, className, gameId))
        });
      }
    }

    cards.forEach(card => {
      card.addEventListener('click', () => {
        if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
        if (flipped.length === 2) return;
        A.sfx.flip();
        card.classList.add('flipped');
        card.textContent = card.getAttribute('data-e');
        flipped.push(card);
        if (flipped.length === 2) {
          moves++;
          scoreEl.textContent = moves;
          const [a, b] = flipped;
          if (a.getAttribute('data-e') === b.getAttribute('data-e')) {
            setTimeout(() => {
              a.classList.add('matched'); b.classList.add('matched');
              matched++;
              A.sfx.correct();
            A.playCelebration('success');
              flipped = [];
              checkEnd();
            }, 450);
          } else {
            setTimeout(() => {
              a.classList.remove('flipped'); b.classList.remove('flipped');
              a.textContent = ''; b.textContent = '';
              flipped = [];
              A.sfx.wrong();
            }, 750);
          }
        }
      });
    });
    setTimeout(() => A.speak(`Flip the cards and find the matching pairs!`, { force: false }), 300);
  }

  /* ================= 3. SHAPE SORTER ================= */
  function shapes(container, className, gameId) {
    const totalRounds = 6;
    let round = 0, score = 0;
    const POOL = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond', 'oval', 'rectangle'];

    function playRound() {
      round++;
      const frame = roundFrame(container, { round, totalRounds, score });
      frame.quitBtn.addEventListener('click', () => { location.hash = '#/play'; });
      const answer = POOL[Math.floor(Math.random() * POOL.length)];
      const opts = D.shuffle(POOL).slice(0, 3);
      if (opts.indexOf(answer) === -1) opts[Math.floor(Math.random() * 3)] = answer;
      const options = D.shuffle(opts);
      frame.body.innerHTML = `
        <div class="lesson-stage">
          <div class="lesson-prompt">Tap the ${D.SHAPE_NAMES[answer]}!</div>
          <div class="answer-grid">
            ${options.map(s => `<button class="answer-btn shape-option" data-shape="${s}">${D.shapeSVG(s, 84, '')}</button>`).join('')}
          </div>
        </div>`;
      const buttons = frame.body.querySelectorAll('.answer-btn');
      buttons.forEach(b => {
        b.addEventListener('click', () => {
          if (b.getAttribute('data-shape') === answer) {
            score++;
            A.sfx.correct();
            A.playCelebration('success');
            b.classList.add('correct');
            buttons.forEach(x => x.classList.add('disabled'));
            frame.setScore(score);
            setTimeout(() => round < totalRounds ? playRound() : finish(container, { name: 'Shape Sorter' }, score, totalRounds, className, gameId, () => shapes(container, className, gameId)), 900);
          } else {
            A.sfx.wrong();
            b.classList.add('wrong');
            setTimeout(() => b.classList.remove('wrong'), 500);
          }
        });
      });
      A.speak(`Tap the ${D.SHAPE_NAMES[answer]}!`);
    }
    playRound();
  }

  /* ================= 4. COLOR SPLASH ================= */
  function colors(container, className, gameId) {
    const totalRounds = 6;
    let round = 0, score = 0;
    const KEYS = ['red', 'yellow', 'blue', 'green', 'orange', 'purple', 'pink', 'brown'];

    function playRound() {
      round++;
      const frame = roundFrame(container, { round, totalRounds, score });
      frame.quitBtn.addEventListener('click', () => { location.hash = '#/play'; });
      const answer = KEYS[Math.floor(Math.random() * KEYS.length)];
      const opts = D.shuffle(KEYS).slice(0, 3);
      if (opts.indexOf(answer) === -1) opts[Math.floor(Math.random() * 3)] = answer;
      const options = D.shuffle(opts);
      frame.body.innerHTML = `
        <div class="lesson-stage">
          <div class="color-prompt-blob" style="background:${D.COLORS[answer].css}" aria-hidden="true"></div>
          <div class="lesson-prompt">Tap the ${D.COLORS[answer].name} color!</div>
          <div class="row center-x wrap" style="gap:14px">
            ${options.map(c => `<button class="color-option" data-color="${c}" style="background:${D.COLORS[c].css}" aria-label="${D.COLORS[c].name}"></button>`).join('')}
          </div>
        </div>`;
      const buttons = frame.body.querySelectorAll('.color-option');
      buttons.forEach(b => {
        b.addEventListener('click', () => {
          if (b.getAttribute('data-color') === answer) {
            score++;
            A.sfx.correct();
            A.playCelebration('success');
            b.style.outline = '6px solid #35c46b';
            buttons.forEach(x => x.style.pointerEvents = 'none');
            frame.setScore(score);
            setTimeout(() => round < totalRounds ? playRound() : finish(container, { name: 'Color Splash' }, score, totalRounds, className, gameId, () => colors(container, className, gameId)), 900);
          } else {
            A.sfx.wrong();
            b.classList.add('shake');
            setTimeout(() => b.classList.remove('shake'), 500);
          }
        });
      });
      A.speak(`Tap the ${D.COLORS[answer].name} color!`);
    }
    playRound();
  }

  /* ================= 5. LETTER FINDER ================= */
  function letters(container, className, gameId) {
    const totalRounds = 6;
    let round = 0, score = 0;

    function playRound() {
      round++;
      const frame = roundFrame(container, { round, totalRounds, score });
      frame.quitBtn.addEventListener('click', () => { location.hash = '#/play'; });
      const answer = D.LETTERS[Math.floor(Math.random() * D.LETTERS.length)];
      const opts = D.shuffle(D.LETTERS).slice(0, 3);
      if (opts.indexOf(answer) === -1) opts[Math.floor(Math.random() * 3)] = answer;
      const options = D.shuffle(opts);
      frame.body.innerHTML = `
        <div class="lesson-stage">
          <button class="listen-btn" type="button">🔊 Listen</button>
          <div class="lesson-prompt">Find the letter!</div>
          <div class="answer-grid">
            ${options.map(l => `<button class="answer-btn" data-letter="${l}"><span class="ab-big" style="font-size:clamp(3rem,12vw,4.2rem)">${l}</span></button>`).join('')}
          </div>
        </div>`;
      const say = () => A.speak(`Find the letter ${answer}! ${answer} says ${D.LETTER_PICS[answer][2]}, like ${D.LETTER_PICS[answer][1]}!`);
      frame.body.querySelector('.listen-btn').addEventListener('click', () => { A.sfx.click(); say(); });
      const buttons = frame.body.querySelectorAll('.answer-btn');
      buttons.forEach(b => {
        b.addEventListener('click', () => {
          if (b.getAttribute('data-letter') === answer) {
            score++;
            A.sfx.correct();
            A.playCelebration('success');
            b.classList.add('correct');
            buttons.forEach(x => x.classList.add('disabled'));
            frame.setScore(score);
            setTimeout(() => round < totalRounds ? playRound() : finish(container, { name: 'Letter Finder' }, score, totalRounds, className, gameId, () => letters(container, className, gameId)), 900);
          } else {
            A.sfx.wrong();
            b.classList.add('wrong');
            setTimeout(() => b.classList.remove('wrong'), 500);
          }
        });
      });
      setTimeout(say, 400);
    }
    playRound();
  }

  /* ================= 6. NUMBER ORDER ================= */
  function order(container, className, gameId) {
    const cfg = classCfg(className);
    const n = cfg.orderMax;
    const nums = D.shuffle(Array.from({ length: n }, (_, i) => i + 1));
    let idx = 0, mistakes = 0;

    container.innerHTML = `
      <div class="screen-anim">
        <div class="game-top">
          <span class="game-round">Tap in order, 1 to ${n}!</span>
          <span class="game-score">Mistakes: <span class="gs-num">0</span></span>
          <button class="icon-btn game-quit" type="button" aria-label="Quit game">🏠</button>
        </div>
        <div class="order-tray">
          ${nums.map(v => `<button class="order-chip" data-v="${v}" type="button">${v}</button>`).join('')}
        </div>
      </div>`;

    const chips = [...container.querySelectorAll('.order-chip')];
    const scoreEl = container.querySelector('.gs-num');
    container.querySelector('.game-quit').addEventListener('click', () => { location.hash = '#/play'; });

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const v = +chip.getAttribute('data-v');
        if (v === idx + 1) {
          chip.classList.add('picked');
          A.sfx.correct();
            A.playCelebration('success');
          idx++;
          if (idx === n) {
            A.sfx.celebrate();
            const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
            window.LLRewards.recordGame(gameId, stars);
            A.speak(`You ordered all the numbers! ${mistakes === 0 ? 'No mistakes — perfect!' : 'Well done!'}`);
            endScreen(container, { name: 'Number Order' }, stars, () => order(container, className, gameId));
          }
        } else {
          mistakes++;
          scoreEl.textContent = mistakes;
          A.sfx.wrong();
          chip.classList.add('bad');
          setTimeout(() => chip.classList.remove('bad'), 450);
        }
      });
    });
    setTimeout(() => A.speak(`Tap the numbers in order, starting from 1!`, { force: false }), 300);
  }

  /* ================= 7. MATH BALLOONS ================= */
  function mathpop(container, className, gameId) {
    const cfg = classCfg(className);
    const totalRounds = 6;
    let round = 0, score = 0;
    const BALLOON_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899'];

    function balloonSVG(color) {
      return `<svg viewBox="0 0 100 130">
        <ellipse cx="50" cy="52" rx="34" ry="44" fill="${color}" stroke="#33385c" stroke-width="3"/>
        <ellipse cx="38" cy="36" rx="8" ry="13" fill="#fff" opacity="0.4" transform="rotate(-18 38 36)"/>
        <polygon points="44,94 56,94 50,106" fill="${color}" stroke="#33385c" stroke-width="3" stroke-linejoin="round"/>
        <path d="M50 106 Q 42 118 48 128" stroke="#33385c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </svg>`;
    }

    function playRound() {
      round++;
      const frame = roundFrame(container, { round, totalRounds, score });
      frame.quitBtn.addEventListener('click', () => { location.hash = '#/play'; });
      const a = 2 + Math.floor(Math.random() * cfg.mathMax);
      const b = 2 + Math.floor(Math.random() * cfg.mathMax);
      const useSub = className === 'p3' && Math.random() < 0.4;
      const op = useSub ? '-' : '+';
      const ans = op === '+' ? a + b : Math.max(a - b, 0);
      if (op === '-' && a < b) return playRound();
      const wrongs = new Set();
      while (wrongs.size < 3) {
        const cand = ans + Math.floor(Math.random() * 7) - 3;
        if (cand >= 0 && cand !== ans) wrongs.add(cand);
      }
      const balloons = D.shuffle([ans, ...wrongs]);
      const positions = [
        { left: '8%', top: '0%' }, { left: '42%', top: '6%' }, { left: '72%', top: '2%' },
        { left: '22%', top: '52%' }, { left: '58%', top: '48%' }
      ];
      const colors = D.shuffle(BALLOON_COLORS.slice());
      frame.body.innerHTML = `
        <div class="lesson-stage">
          <div class="lesson-prompt">${a} ${op} ${b} = ?  Pop the balloon with the answer!</div>
          <div class="balloon-field">
            ${balloons.map((v, i) => `
              <div class="balloon" data-v="${v}" style="left:${positions[i].left};top:${positions[i].top}">
                ${balloonSVG(colors[i % colors.length])}
                <span class="bl-num">${v}</span>
              </div>`).join('')}
          </div>
        </div>`;
      const bls = frame.body.querySelectorAll('.balloon');
      bls.forEach(bl => {
        bl.addEventListener('click', () => {
          if (bl.classList.contains('popped')) return;
          if (+bl.getAttribute('data-v') === ans) {
            score++;
            bl.classList.add('popped');
            A.sfx.pop();
            A.sfx.correct();
            A.playCelebration('success');
            bls.forEach(x => x.style.pointerEvents = 'none');
            frame.setScore(score);
            setTimeout(() => round < totalRounds ? playRound() : finish(container, { name: 'Math Balloons' }, score, totalRounds, className, gameId, () => mathpop(container, className, gameId)), 900);
          } else {
            A.sfx.wrong();
            bl.classList.add('shake');
            setTimeout(() => bl.classList.remove('shake'), 500);
          }
        });
      });
      A.speak(`${a} ${op} ${b}. Pop the balloon with the answer!`);
    }
    playRound();
  }

  const HANDLERS = { counting, memory, shapes, colors, letters, order, mathpop };

  function play(container, gameId, className) {
    const fn = HANDLERS[gameId];
    if (!fn) { container.innerHTML = '<p>Game not found</p>'; return; }
    fn(container, className, gameId);
  }

  return { renderGameList, play, availableGames };
})();
