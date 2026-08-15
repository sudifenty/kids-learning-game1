/* ==========================================================================
   🌈 LET'S LEARN — validate.js
   Internal activity validator (development + runtime safety net).

   Guarantees the #1 rule of Let's Learn activities:

     WHAT THE CHILD SEES  ==  WHAT THE CHILD IS ASKED  ==  WHAT THE SYSTEM EXPECTS

   - validateAll(): scans the entire curriculum at boot (dev logging only —
     children never see these messages).
   - check(): runtime guard used before rendering any step. If a step fails,
     the lesson player skips it instead of showing a misleading activity.

   Rules enforced:
     count      → visible objects (n) === correct answer, answer ∈ options,
                  options unique & ≥ 1
     find*      → answer ∈ options, options unique
     q / math   → answer ∈ options, options unique & ≥ 0; subtraction a > b;
                  multiplication small enough to visualize (a×b ≤ 30)
     compare    → never a tie
     pattern    → answer ∈ options, options unique
     match      → well-formed pairs, ≥ 2 pairs
     order      → unique items
     trace      → template exists (path matches the displayed symbol)
     colorIt    → template exists
     letter     → letter has picture + sound data
   ========================================================================== */

window.LLValidate = (function () {
  const D = window.LLData;

  function mathAnswer(step) {
    if (step.op === '×') return step.a * step.b;
    if (step.op === '-') return step.a - step.b;
    return step.a + step.b;
  }

  function log(lesson, step, msg, detail) {
    console.error('❌ Activity validation failed', {
      lesson: lesson ? lesson.id : '?',
      step: step ? step.t : '?',
      problem: msg,
      detail: detail || {}
    });
  }

  /* returns array of { msg, detail } issues for one step */
  function check(lesson, step) {
    const errs = [];
    if (!step || !step.t) { errs.push({ msg: 'step has no type', detail: {} }); return errs; }
    const ok = (cond, msg, detail) => { if (!cond) errs.push({ msg, detail }); };
    const uniq = (arr) => new Set(arr).size === arr.length;

    switch (step.t) {
      case 'count':
        ok(Number.isInteger(step.n) && step.n >= 1 && step.n <= 30, 'count: n out of range', { n: step.n });
        ok(Array.isArray(step.options) && step.options.indexOf(step.n) !== -1, 'count: answer not in options', { n: step.n, options: step.options });
        ok(uniq(step.options || []), 'count: duplicate options', { options: step.options });
        ok((step.options || []).every(o => Number.isInteger(o) && o >= 1), 'count: bad option (<1 or non-integer)', { options: step.options });
        break;
      case 'findNumber':
        ok(Array.isArray(step.options) && step.options.indexOf(step.answer) !== -1, 'findNumber: answer not in options', { answer: step.answer, options: step.options });
        ok(uniq(step.options || []), 'findNumber: duplicate options', { options: step.options });
        ok((step.options || []).every(o => Number.isInteger(o) && o >= 0), 'findNumber: bad option', { options: step.options });
        ok((step.options || []).length >= 2, 'findNumber: too few options', { options: step.options });
        break;
      case 'findLetter':
      case 'findShape':
      case 'findColor':
        ok(Array.isArray(step.options) && step.options.indexOf(step.answer) !== -1, step.t + ': answer not in options', { answer: step.answer, options: step.options });
        ok(uniq(step.options || []), step.t + ': duplicate options', { options: step.options });
        ok((step.options || []).length >= 2, step.t + ': too few options', { options: step.options });
        break;
      case 'q':
        ok(typeof step.question === 'string' && step.question.length > 0, 'q: empty question', {});
        ok(Array.isArray(step.options) && step.options.indexOf(step.answer) !== -1, 'q: answer not in options', { answer: step.answer, options: step.options });
        ok(uniq(step.options || []), 'q: duplicate options', { options: step.options });
        ok((step.options || []).length >= 2, 'q: too few options', { options: step.options });
        break;
      case 'math':
        ok(['+', '-', '×'].indexOf(step.op) !== -1, 'math: bad operator', { op: step.op });
        ok(Number.isInteger(step.a) && step.a >= 1, 'math: a invalid', { a: step.a });
        ok(Number.isInteger(step.b) && step.b >= 1, 'math: b invalid', { b: step.b });
        if (step.op === '-') ok(step.a > step.b, 'math: subtraction needs a > b (visual must show a real take-away)', { a: step.a, b: step.b });
        if (step.op === '×') ok(step.a * step.b <= 30, 'math: multiplication too big to visualize (a×b > 30)', { a: step.a, b: step.b });
        const ans = mathAnswer(step);
        ok(ans >= 0, 'math: negative answer', { ans });
        ok(step.options && step.options.indexOf(ans) !== -1, 'math: answer not in options', { ans, options: step.options });
        ok(uniq(step.options || []), 'math: duplicate options', { options: step.options });
        ok((step.options || []).every(o => Number.isInteger(o) && o >= 0), 'math: bad option (<0)', { options: step.options });
        break;
      case 'compare':
        ok(Number.isInteger(step.nA) && step.nA >= 1, 'compare: nA invalid', { nA: step.nA });
        ok(Number.isInteger(step.nB) && step.nB >= 1, 'compare: nB invalid', { nB: step.nB });
        ok(step.nA !== step.nB, 'compare: tie — neither side has more', { nA: step.nA, nB: step.nB });
        break;
      case 'pattern':
        ok(Array.isArray(step.seq) && step.seq.length >= 3, 'pattern: sequence too short', { seq: step.seq });
        ok(Array.isArray(step.options) && step.options.indexOf(step.answer) !== -1, 'pattern: answer not in options', { answer: step.answer, options: step.options });
        ok(uniq(step.options || []), 'pattern: duplicate options', { options: step.options });
        break;
      case 'match':
        ok(Array.isArray(step.pairs) && step.pairs.length >= 2, 'match: needs ≥2 pairs', { n: step.pairs && step.pairs.length });
        ok(step.pairs.every(p => Array.isArray(p) && p.length === 2), 'match: malformed pair', { pairs: step.pairs });
        break;
      case 'order':
        ok(Array.isArray(step.items) && step.items.length >= 2, 'order: needs items', { items: step.items });
        ok(uniq(step.items || []), 'order: duplicate items', { items: step.items });
        break;
      case 'trace':
        ok(!!(D.TRACE_TEMPLATES[step.kind] && D.TRACE_TEMPLATES[step.kind][step.which]), 'trace: template missing (path would not match the symbol)', { kind: step.kind, which: step.which });
        break;
      case 'colorIt':
        ok(!!D.COLORING_TEMPLATES[step.template], 'colorIt: template missing', { template: step.template });
        break;
      case 'letter':
        ok(!!D.LETTER_PICS[step.ch], 'letter: no picture/sound data for letter', { ch: step.ch });
        break;
      case 'media':
        /* catalog presence is checked at runtime by the lesson player */
        break;
    }
    return errs;
  }

  function validateLesson(lesson) {
    const all = [];
    lesson.steps.forEach((s, i) => {
      check(lesson, s).forEach(e => {
        all.push({ lesson: lesson.id, idx: i, msg: e.msg, detail: e.detail });
        log(lesson, s, e.msg, e.detail);
      });
    });
    return all;
  }

  function validateAll() {
    let lessons = 0, steps = 0, bad = 0;
    for (const cls of D.CLASS_ORDER) {
      for (const subj of D.SUBJECT_ORDER) {
        for (const lesson of D.CURRICULUM[cls][subj]) {
          lessons++;
          steps += lesson.steps.length;
          bad += validateLesson(lesson).length;
        }
      }
    }
    console.log(`[LLValidate] ${lessons} lessons, ${steps} steps — ${bad} issue(s)`);
    if (bad) console.error('❌ Fix the activities above before release.');
    else console.log('✅ All activities consistent: question ↔ visual ↔ answer.');
    return bad;
  }

  return { check, validateLesson, validateAll };
})();
