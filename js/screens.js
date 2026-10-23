/* Constella prototype: one render function per screen. Each takes the <main> element.
   M2 builds Welcome, Onboarding (with the Awakening) and Home. Every other screen is still a labelled
   placeholder so the router, tab bar and Demo controls can be checked; later milestones replace them. */
window.C = window.C || {};

C.screens = (function () {
  var el = C.ui.el;
  var icons = C.ui.icons;

  var milestone = {
    train: 'M4', orbits: 'M4',
    shield: 'M5',
    archive: 'M6', exchange: 'M6', missions: 'M6', constellation: 'M6', privacy: 'M6'
  };

  function placeholder(route) {
    return function (main) {
      main.appendChild(el('section', { class: 'screen' },
        el('p', { class: 'eyebrow', text: route.code }),
        el('h1', { text: route.label }),
        el('div', { class: 'panel placeholder' },
          el('p', { text: 'This screen is built in milestone ' + (milestone[route.id] || '?') + '.' }),
          el('p', { class: 'dim', text: 'The shell around it (frame, starfield, tab bar, router, Demo controls) is live.' }))));
    };
  }

  /* ---------- shared helpers ---------- */

  function goalLabel(id) {
    for (var i = 0; i < C.data.goals.length; i++) if (C.data.goals[i].id === id) return C.data.goals[i].label;
    return '';
  }

  function hours(n) { return (Math.round(n * 10) / 10) + ' h'; }

  /* "+3", "−2", "no change": the sign is always in the text. */
  function delta(now, before, unit) {
    var d = Math.round((now - before) * 10) / 10;
    if (d === 0) return 'no change';
    return (d > 0 ? '+' : '−') + Math.abs(d) + (unit || '');
  }

  function button(label, kind, onclick, extra) {
    return el('button', {
      class: 'btn ' + (kind || 'primary'), type: 'button', onclick: onclick,
      disabled: extra && extra.disabled
    }, label, extra && extra.icon ? el('span', { class: 'btn-ic', html: extra.icon }) : null);
  }

  /* The four stats as labelled bars with a level, used on Home and on the Awakening result. */
  function statRows(levels) {
    return el('div', { class: 'stat-list' }, C.data.stats.map(function (def) {
      var lv = levels[def.id];
      var bar = el('div', { class: 'bar', role: 'meter', 'aria-label': def.label + ' level', 'aria-valuemin': 1, 'aria-valuemax': 10, 'aria-valuenow': lv, 'aria-valuetext': 'Level ' + lv + ' of 10' },
        el('div', { class: 'bar-fill', style: 'width:' + (lv * 10) + '%' }));
      return el('div', { class: 'stat-row stat-' + def.cls },
        el('span', { class: 'stat-ic', html: icons[def.icon] }),
        el('div', { class: 'stat-body' },
          el('div', { class: 'stat-top' },
            el('span', { class: 'stat-name', text: def.label }),
            el('span', { class: 'stat-lv', text: 'Level ' + lv })),
          bar,
          el('span', { class: 'stat-line', text: def.line })));
    }));
  }

  /* ---------- S0 Welcome ---------- */

  function welcome(main) {
    var st = C.state.get();
    main.appendChild(el('section', { class: 'screen welcome' },
      el('div', { class: 'well', 'aria-hidden': 'true' },
        el('i', { class: 'ring r1' }), el('i', { class: 'ring r2' }), el('i', { class: 'ring r3' }),
        C.ui.lumen({ size: 132, mood: 'calm' })),
      el('div', { class: 'welcome-text' },
        el('h1', { class: 'wordmark', text: 'Constella' }),
        el('p', { class: 'tagline', text: 'Stay able, together.' }),
        el('p', { class: 'story dim', text: 'Your agent’s convenience is a gravity well. Rise out of it with your crew.' })),
      el('div', { class: 'welcome-actions' },
        button('Begin your Awakening', 'primary big', function () { C.app.go('onboarding'); }),
        st.onboarded ? button('Already awakened? Open Home', 'link', function () { C.app.go('home'); }) : null)));
  }

  /* ---------- S1 Onboarding: goal, Star Map choice, the Awakening, result ---------- */

  var STEP_NAMES = ['Goal', 'Star Map', 'Awakening'];

  function onboarding(main) {
    var st = C.state.get();
    var A = C.data.awakening;
    var ob = {
      step: 0, task: 0,
      name: st.onboarded ? st.user.name : '',
      goal: st.user.goal,
      vis: st.user.visibility,
      women: st.user.womenOnly,
      think: '', maths: ['', '', ''], answer: '', relate: [0, 0, 0],
      held: 0, levels: null
    };
    var wrap = el('section', { class: 'screen onboarding' });
    var timer = null;
    main.appendChild(wrap);

    function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }

    function steps(label, current) {
      var dots = el('div', { class: 'steps', 'aria-hidden': 'true' });
      STEP_NAMES.forEach(function (n, i) {
        dots.appendChild(el('i', { class: 'dot' + (i < current ? ' done' : '') + (i === current ? ' now' : '') }));
      });
      return el('div', { class: 'steps-row' }, dots, el('p', { class: 'small dim', text: label }));
    }

    function heading(text, sub) {
      return el('div', { class: 'step-head' },
        el('h1', { text: text, tabindex: '-1', id: 'obHeading' }),
        sub ? el('p', { class: 'dim', text: sub }) : null);
    }

    function nav(back, next) {
      return el('div', { class: 'nav-row' }, back || el('span'), next);
    }

    /* Radio cards: native radios, so arrow keys and Space just work. */
    function radioCard(name, value, checked, ic, title, line, onchange) {
      var input = el('input', { type: 'radio', name: name, value: value, checked: checked });
      input.addEventListener('change', function () { onchange(value); });
      return el('label', { class: 'choice' }, input,
        el('span', { class: 'choice-face' },
          ic ? el('span', { class: 'choice-ic', html: ic }) : null,
          el('span', { class: 'choice-text' },
            el('span', { class: 'choice-title', text: title }),
            line ? el('span', { class: 'choice-line', text: line }) : null),
          el('span', { class: 'choice-tick', 'aria-hidden': 'true', html: icons.check })));
    }

    /* ----- step 0: goal ----- */
    function stepGoal() {
      var cont = button('Continue', 'primary', function () {
        ob.name = nameInput.value.trim();
        ob.step = 1; draw(true);
      }, { disabled: !ob.goal });
      var nameInput = el('input', {
        class: 'field', type: 'text', id: 'obName', maxlength: '20', placeholder: 'Arjun',
        autocomplete: 'off', spellcheck: 'false', value: ob.name
      });
      var group = el('div', { class: 'choice-grid', role: 'radiogroup', 'aria-label': 'Your goal' },
        C.data.goals.map(function (g) {
          return radioCard('goal', g.id, ob.goal === g.id, icons[g.icon], g.label, '', function (v) {
            ob.goal = v; cont.disabled = false;
          });
        }));
      wrap.appendChild(steps('Step 1 of 3 · ' + STEP_NAMES[0], 0));
      wrap.appendChild(heading('What are you working toward?', 'Pick the one goal you want to do yourself, with other people.'));
      wrap.appendChild(el('div', { class: 'field-block' },
        el('label', { for: 'obName', class: 'field-label', text: 'Your first name' }),
        nameInput));
      wrap.appendChild(group);
      wrap.appendChild(nav(null, cont));
    }

    /* ----- step 1: how you appear on the Star Map ----- */
    function stepVisibility() {
      var group = el('div', { class: 'choice-list', role: 'radiogroup', 'aria-label': 'How you appear on the Star Map' },
        C.data.visibility.map(function (v) {
          return radioCard('vis', v.id, ob.vis === v.id, null, v.label, v.line, function (val) { ob.vis = val; });
        }));
      var women = el('input', { type: 'checkbox', id: 'obWomen', role: 'switch', checked: ob.women });
      women.addEventListener('change', function () { ob.women = women.checked; });
      wrap.appendChild(steps('Step 2 of 3 · ' + STEP_NAMES[1], 1));
      wrap.appendChild(heading('How do you appear on the Star Map?', 'The Star Map shows groups near you in ' + C.data.city.name + '. You decide what they can see.'));
      wrap.appendChild(group);
      wrap.appendChild(el('label', { class: 'switch panel', for: 'obWomen' },
        el('span', { class: 'switch-text' },
          el('span', { class: 'switch-title', text: 'Women-only view' }),
          el('span', { class: 'switch-line', text: 'Off by default. When on, you see and appear in women-only clusters and crews.' })),
        women, el('span', { class: 'track', 'aria-hidden': 'true' })));
      wrap.appendChild(nav(
        button('Back', 'ghost', function () { ob.step = 0; draw(true); }, { icon: icons.back }),
        button('Continue', 'primary', function () { ob.step = 2; ob.task = 0; draw(true); })));
    }

    /* ----- step 2: the Awakening ----- */
    var TASKS = ['thinking', 'doing', 'persevering', 'relating'];

    function taskFrame(index, nextLabel, onNext, canNext) {
      var def = C.data.stats.filter(function (s) { return s.id === TASKS[index]; })[0];
      wrap.appendChild(steps('Step 3 of 3 · Awakening · Task ' + (index + 1) + ' of 4', 2));
      wrap.appendChild(el('p', { class: 'banner', text: A.banner }));
      wrap.appendChild(el('p', { class: 'task-chip stat-' + def.cls },
        el('span', { class: 'stat-ic', html: icons[def.icon] }), el('span', { text: def.label })));
      return button(nextLabel, 'primary', onNext, { disabled: !canNext });
    }

    function taskThinking() {
      var ta = el('textarea', {
        class: 'field area', id: 'obThink', rows: '5', maxlength: '400',
        autocomplete: 'off', autocorrect: 'off', autocapitalize: 'off', spellcheck: 'false',
        'aria-describedby': 'obThinkCount'
      });
      ta.value = ob.think;
      var count = el('p', { class: 'small dim', id: 'obThinkCount' });
      var next = taskFrame(0, 'Next task', function () { ob.task = 1; draw(true); }, false);
      wrap.appendChild(heading('Your own view'));
      wrap.appendChild(el('label', { for: 'obThink', class: 'prompt', text: A.thinking.prompt }));
      wrap.appendChild(ta);
      wrap.appendChild(count);
      function lines() { return ta.value.split('\n').filter(function (l) { return l.trim(); }).length; }
      function refresh() {
        ob.think = ta.value;
        var n = lines();
        count.textContent = 'Lines written: ' + Math.min(n, A.thinking.lines) + ' of ' + A.thinking.lines + '. Press Enter to start a new line.';
        next.disabled = n < A.thinking.lines;
      }
      ta.addEventListener('input', refresh);
      refresh();
      wrap.appendChild(nav(null, next));
    }

    function taskDoing() {
      var next = taskFrame(1, 'Next task', function () { ob.task = 2; draw(true); }, false);
      wrap.appendChild(heading('Quick sums'));
      wrap.appendChild(el('p', { class: 'prompt', text: A.doing.prompt }));
      var list = el('div', { class: 'sum-list' });
      A.doing.questions.forEach(function (q, i) {
        var input = el('input', {
          class: 'field sum', type: 'text', id: 'obSum' + i, inputmode: 'numeric',
          autocomplete: 'off', spellcheck: 'false', maxlength: '6', value: ob.maths[i]
        });
        input.addEventListener('input', function () {
          ob.maths[i] = input.value;
          next.disabled = !ob.maths.every(function (v) { return v.trim() !== ''; });
        });
        list.appendChild(el('div', { class: 'sum panel' },
          el('label', { for: 'obSum' + i, class: 'sum-q', text: q.text + ' =' }), input));
      });
      next.disabled = !ob.maths.every(function (v) { return v.trim() !== ''; });
      wrap.appendChild(list);
      wrap.appendChild(nav(null, next));
    }

    function taskPersevering() {
      var P = A.persevering;
      var started = Date.now();
      var unlocked = false;
      var next = taskFrame(2, 'Next task', function () {
        ob.held = Math.min(P.holdSeconds, (Date.now() - started) / 1000);
        stopTimer();
        ob.task = 3; draw(true);
      }, true);
      next.textContent = 'I’m done with this one';
      var input = el('input', {
        class: 'field sum', type: 'text', id: 'obPuzzle', inputmode: 'numeric',
        autocomplete: 'off', spellcheck: 'false', maxlength: '4', value: ob.answer
      });
      input.addEventListener('input', function () { ob.answer = input.value; });
      var left = el('span', { class: 'timer-num' });
      var fill = el('div', { class: 'bar-fill' });
      var bar = el('div', { class: 'bar timer-bar', role: 'presentation' }, fill);
      var hintBtn = button('Show a hint', 'ghost', function () {
        hintBox.hidden = false; hintBtn.disabled = true;
      }, { disabled: true });
      var hintBox = el('p', { class: 'hint panel', text: 'Hint: ' + P.hint, hidden: true });
      var live = el('p', { class: 'small teal-text', 'aria-live': 'polite' });

      wrap.appendChild(heading('Stay with the hard part'));
      wrap.appendChild(el('label', { for: 'obPuzzle', class: 'prompt', text: P.prompt }));
      wrap.appendChild(el('div', { class: 'sum panel' }, el('span', { class: 'sum-q', text: 'Day number:' }), input));
      wrap.appendChild(el('div', { class: 'panel timer' },
        el('div', { class: 'timer-top' },
          el('span', { class: 'small dim', text: 'Stay with it. A hint unlocks after ' + P.holdSeconds + ' seconds.' }),
          left),
        bar, hintBtn, live));
      wrap.appendChild(hintBox);

      function tick() {
        if (!document.body.contains(wrap)) { stopTimer(); return; }
        var s = (Date.now() - started) / 1000;
        var remain = Math.max(0, Math.ceil(P.holdSeconds - s));
        fill.style.width = Math.min(100, s / P.holdSeconds * 100) + '%';
        left.textContent = remain > 0 ? '0:' + (remain < 10 ? '0' : '') + remain : 'Unlocked';
        if (remain === 0 && !unlocked) {
          unlocked = true;
          hintBtn.disabled = false;
          live.textContent = 'You stayed with it. The hint is unlocked.';
          stopTimer();
        }
      }
      tick();
      timer = setInterval(tick, 250);
      wrap.appendChild(nav(null, next));
    }

    function taskRelating() {
      var next = taskFrame(3, 'Finish the Awakening', finish, false);
      wrap.appendChild(heading('You and other people'));
      wrap.appendChild(el('p', { class: 'prompt', text: A.relating.prompt }));
      function allSet() { return ob.relate.every(function (v) { return v > 0; }); }
      A.relating.statements.forEach(function (text, i) {
        var seg = el('div', { class: 'scale' });
        for (var v = 1; v <= 5; v++) {
          (function (v) {
            var input = el('input', { type: 'radio', name: 'rel' + i, value: String(v), checked: ob.relate[i] === v });
            input.addEventListener('change', function () { ob.relate[i] = v; next.disabled = !allSet(); });
            seg.appendChild(el('label', { class: 'scale-opt' }, input, el('span', { class: 'scale-face', text: String(v) })));
          })(v);
        }
        wrap.appendChild(el('fieldset', { class: 'rate panel' },
          el('legend', { text: text }), seg,
          el('div', { class: 'scale-ends small dim' }, el('span', { text: '1 Not at all' }), el('span', { text: '5 Completely' }))));
      });
      next.disabled = !allSet();
      wrap.appendChild(nav(null, next));
    }

    /* Awakening scoring (prototype values): effort and honesty, checked by the page, nothing generated. */
    function finish() {
      var words = ob.think.trim().split(/\s+/).filter(Boolean).length;
      var thinking = 1 + (words >= 15 ? 1 : 0) + (words >= 30 ? 1 : 0) + (words >= 50 ? 1 : 0);

      var right = 0;
      A.doing.questions.forEach(function (q, i) { if (Number(ob.maths[i].trim()) === q.answer) right++; });
      var doing = 1 + right;

      var solved = Number(ob.answer.trim()) === A.persevering.answer && ob.answer.trim() !== '';
      var persevering = 1 + (ob.held >= 10 ? 1 : 0) + (ob.held >= A.persevering.holdSeconds - 0.5 ? 1 : 0) + (solved ? 1 : 0);

      var sum = ob.relate.reduce(function (a, b) { return a + b; }, 0);
      var relating = 1 + Math.round((sum / 3 - 1) * 0.75);

      ob.levels = { relating: relating, doing: doing, thinking: thinking, persevering: persevering };
      C.state.finishAwakening({
        name: ob.name || 'Arjun', goal: ob.goal, visibility: ob.vis, womenOnly: ob.women, stats: ob.levels
      });
      ob.step = 3; draw(true);
    }

    function stepAwakening() {
      [taskThinking, taskDoing, taskPersevering, taskRelating][ob.task]();
    }

    /* ----- result ----- */
    function stepResult() {
      var rank = C.data.ranks[0];
      wrap.appendChild(el('div', { class: 'result-head' },
        C.ui.lumen({ size: 104, mood: 'bright' }),
        el('h1', { text: 'Awakening complete', tabindex: '-1', id: 'obHeading' }),
        el('p', { class: 'dim', text: (ob.name || 'Arjun') + ', here is where you start.' })));
      wrap.appendChild(el('div', { class: 'panel rank-line' },
        C.ui.rankBadge(56),
        el('div', {},
          el('p', { class: 'small dim', text: 'Starting rank' }),
          el('p', { class: 'rank-name', text: rank.name }))));
      wrap.appendChild(el('div', { class: 'panel' },
        el('h2', { class: 'panel-h', text: 'Your four stats' }),
        statRows(ob.levels)));
      wrap.appendChild(el('div', { class: 'stack' },
        button('See the Star Map', 'primary big', function () { C.app.go('map'); }),
        button('Go to Home', 'link', function () { C.app.go('home'); })));
    }

    function draw(moveFocus) {
      stopTimer();
      wrap.textContent = '';
      main.scrollTop = 0;
      if (ob.step === 0) stepGoal();
      else if (ob.step === 1) stepVisibility();
      else if (ob.step === 2) stepAwakening();
      else stepResult();
      if (moveFocus) {
        var h = document.getElementById('obHeading');
        if (h) { try { h.focus({ preventScroll: true }); } catch (e) { /* older browsers */ } }
      }
    }

    draw(false);
  }

  /* ---------- S2 Home: Status Window ---------- */

  function openMore() {
    var list = el('div', { class: 'more-list' });
    var sheet = null;
    C.data.more.forEach(function (m) {
      list.appendChild(el('button', {
        class: 'more-item', type: 'button',
        onclick: function () { sheet.close(); C.app.go(m.route); }
      },
        el('span', { class: 'more-text' },
          el('span', { class: 'more-title', text: m.label }),
          el('span', { class: 'small dim', text: m.note })),
        el('span', { class: 'more-go', html: icons.next })));
    });
    sheet = C.ui.modal('More', list);
  }

  function home(main) {
    var st = C.state.get();
    var prog = C.state.progress();
    var week = st.week, last = st.lastWeek;
    var goal = goalLabel(st.user.goal);

    /* Header: who, and Lumen in the corner, glowing by today's activity */
    main.appendChild(el('section', { class: 'screen home' },
      el('header', { class: 'home-head' },
        el('div', { class: 'home-who' },
          el('p', { class: 'eyebrow', text: 'Status Window' }),
          el('h1', { text: st.user.name }),
          el('p', { class: 'small dim', text: goal ? 'Working toward: ' + goal : 'No goal chosen yet' })),
        el('div', { class: 'home-tools' },
          el('button', { class: 'pill', type: 'button', onclick: openMore, 'aria-haspopup': 'dialog' },
            el('span', { html: icons.more }), el('span', { text: 'More' })),
          C.ui.lumen({ size: 64, mood: st.activityToday > 0 ? 'bright' : 'dim' }))),

      rankPanel(st, prog),
      el('div', { class: 'panel' },
        el('h2', { class: 'panel-h', text: 'Your four stats' }),
        statRows(st.stats)),
      weekPanel(week),
      el('h2', { class: 'section-h', text: 'Today' }),
      questCard(st),
      meetupCard(),
      echoLine(week, last)));
  }

  function rankPanel(st, prog) {
    var cur = prog.rank, next = prog.next;
    var barText;
    if (!next) barText = 'Top rank reached';
    else if (prog.needsTeaching) barText = st.xp.toLocaleString('en-US') + ' / ' + next.xp.toLocaleString('en-US') + ' XP, plus ' + next.teachingHours + ' teaching hours for ' + next.name;
    else barText = st.xp.toLocaleString('en-US') + ' / ' + next.xp.toLocaleString('en-US') + ' XP to ' + next.name;

    var pips = el('span', { class: 'pips', 'aria-hidden': 'true' });
    C.data.ranks.forEach(function (r, i) { pips.appendChild(el('i', { class: i <= prog.index ? 'on' : '' })); });

    var badge = el('button', {
      class: 'rank-btn', type: 'button',
      'aria-label': 'Rank ' + cur.name + '. Open Constellation and ranks.',
      onclick: function () { C.app.go('constellation'); }
    }, C.ui.rankBadge(72));

    return el('div', { class: 'panel rank-panel' },
      el('div', { class: 'rank-top' },
        badge,
        el('div', { class: 'rank-info' },
          el('p', { class: 'small dim', text: 'Rank ' + (prog.index + 1) + ' of ' + C.data.ranks.length }),
          el('p', { class: 'rank-name', text: cur.name }),
          pips)),
      el('div', { class: 'bar xp-bar', role: 'meter', 'aria-label': 'XP to next rank', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(prog.fraction * 100), 'aria-valuetext': barText },
        el('div', { class: 'bar-fill', style: 'width:' + (prog.fraction * 100).toFixed(1) + '%' })),
      el('p', { class: 'small xp-text', text: barText }),
      el('p', { class: 'small dim', text: 'XP comes only from what you do without your agent and with people. Time in the app earns nothing.' }));
  }

  function weekPanel(week) {
    return el('div', { class: 'panel' },
      el('h2', { class: 'panel-h', text: 'This week' }),
      el('div', { class: 'meter' },
        el('div', { class: 'meter-col' },
          el('p', { class: 'meter-num', text: hours(week.agentHours) }),
          el('p', { class: 'meter-label', text: 'Handed to your agent' })),
        el('div', { class: 'meter-col' },
          el('p', { class: 'meter-num', 'aria-label': 'Unaided ' + week.unaidedScore + ', with agent ' + week.assistedScore },
            el('span', { class: 'sky-text', text: String(week.unaidedScore) }), el('span', { class: 'dim', text: ' / ' }), el('span', { text: String(week.assistedScore) })),
          el('p', { class: 'meter-label', text: 'You vs you with the agent' }),
          el('p', { class: 'meter-sub', text: 'Gap: ' + (week.assistedScore - week.unaidedScore) + ' points' })),
        el('div', { class: 'meter-col together' },
          el('p', { class: 'meter-num big', text: hours(week.togetherHours) }),
          el('p', { class: 'meter-label', text: 'Together hours' }))),
      el('p', { class: 'small dim note', text: 'These numbers stay on your phone.' }));
  }

  function questCard(st) {
    var goal = goalLabel(st.user.goal);
    var done = C.train && C.train.questDoneToday();
    if (C.train) C.train.refreshStreak(); /* a missed day pauses the streak */
    return el('div', { class: 'panel card-row' },
      el('span', { class: 'card-ic ember', html: icons.flame }),
      el('div', { class: 'card-body' },
        el('h3', { text: 'Daily Quest' }),
        el('p', { class: 'small', text: done ? 'Done for today. +' + C.state.XP.quest + ' XP earned.' : goal ? 'A 5-minute rep for “' + goal + '”, without your agent.' : 'A 5-minute rep, without your agent.' }),
        el('p', { class: 'small streak' },
          el('strong', { text: 'Streak: ' + st.streak + (st.streak === 1 ? ' day' : ' days') }),
          el('span', { class: 'dim', text: st.streakPaused ? '. Paused: you missed a day, and it picks up where you left off.' : '. Miss a day and the streak pauses. It never resets.' }))),
      button(done ? 'Open' : 'Start', done ? 'ghost compact' : 'primary compact', function () { C.train.open('quest'); }));
  }

  function meetupCard() {
    var st = C.state.get(), m = C.data.crew.nextMeetup;
    var done = st.crew.checkedIn;
    return el('div', { class: 'panel card-row' },
      el('span', { class: 'card-ic magenta', html: icons.calendar }),
      el('div', { class: 'card-body' },
        el('h3', { text: 'Next crew meet-up' }),
        el('p', { class: 'small', text: st.crew.name }),
        el('p', { class: 'small dim', text: m.place + ', ' + m.when }),
        done ? el('p', { class: 'small teal-text', text: 'Checked in: meeting confirmed' }) : null),
      button(done ? 'Open crew' : 'Check in', 'ghost compact', function () { C.app.go('crew'); }));
  }

  function echoLine(week, last) {
    return el('div', { class: 'echo' },
      el('p', { class: 'small' },
        el('strong', { text: 'Your Echo' }),
        el('span', { class: 'dim', text: ' \u00b7 you vs you last week: together hours ' + delta(week.togetherHours, last.togetherHours, ' h') +
          ' · unaided score ' + delta(week.unaidedScore, last.unaidedScore) +
          ' · agent hours ' + delta(week.agentHours, last.agentHours, ' h') })));
  }

  /* ---------- the screen table ---------- */

  /* Shared with the files that add screens in later milestones (plain scripts, one namespace). */
  C.helpers = { button: button, goalLabel: goalLabel, hours: hours, delta: delta, statRows: statRows };

  var screens = {};
  C.data.routes.forEach(function (r) { screens[r.id] = placeholder(r); });
  screens.welcome = welcome;
  screens.onboarding = onboarding;
  screens.home = home;
  return screens;
})();
