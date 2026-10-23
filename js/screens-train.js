/* Constella prototype, M4 "Training": S5 Train (Daily Quest, Solo Flights, Star Charts) and
   S6 Orbits and Simulators. Plain script: adds its screens to C.screens and shares helpers on C.train.
   Nothing here is generated or read from the user; scores are typed by the person or written by hand in data.js.
   Every timer is a demo-speed timer and says so on screen. XP goes through C.state.award() only. */
window.C = window.C || {};

C.train = (function () {
  var el = C.ui.el;
  var icons = C.ui.icons;
  var H = C.helpers;
  var D = C.data;
  var T = D.train;

  /* ---------- shared helpers ---------- */

  var cleanups = [];
  function cleanup() { while (cleanups.length) cleanups.pop()(); }

  function fmt(s) {
    s = Math.max(0, Math.ceil(s));
    return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
  }

  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function dayKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  function dayGap(fromKey, toKey) {
    var a = fromKey.split('-'), b = toKey.split('-');
    return Math.round((Date.UTC(+b[0], +b[1] - 1, +b[2]) - Date.UTC(+a[0], +a[1] - 1, +a[2])) / 86400000);
  }

  /* Toast after an award. The Ascend moment itself belongs to the game layer (M7). */
  function reward(res, message) {
    C.ui.toast(message + (res && res.rankedUp ? ' · Rank up: ' + res.rankedUp.name : ''), 3800);
  }

  function statLabel(id) { return byId(D.stats, id).label; }

  /* A demo-speed countdown. node holds the label, the number and the bar; start() after the node is on the page. */
  function countdown(secs, label, onDone) {
    var num = el('span', { class: 'timer-num', 'aria-hidden': 'true', text: fmt(secs) });
    var fill = el('div', { class: 'bar-fill' });
    var node = el('div', { class: 'panel timer' },
      el('div', { class: 'timer-top' }, el('span', { class: 'small', text: label }), num),
      el('div', { class: 'bar timer-bar', role: 'presentation' }, fill));
    var t0 = 0, iv = null, finished = false;

    function stop() { if (iv) { clearInterval(iv); iv = null; } }
    function paint() {
      var s = (Date.now() - t0) / 1000;
      var remain = Math.max(0, secs - s);
      fill.style.width = Math.min(100, s / secs * 100).toFixed(1) + '%';
      num.textContent = fmt(remain);
      if (remain <= 0) {
        stop(); finished = true;
        node.classList.add('done');
        if (onDone) onDone();
      }
    }
    function start() {
      t0 = Date.now();
      paint();
      iv = setInterval(function () {
        if (!document.body.contains(node)) { stop(); return; }
        paint();
      }, 200);
      cleanups.push(stop);
    }
    function markDone() { /* a timer that was already finished on an earlier visit */
      finished = true; fill.style.width = '100%'; num.textContent = '0:00'; node.classList.add('done');
    }
    return { node: node, start: start, stop: stop, markDone: markDone, isDone: function () { return finished; } };
  }

  /* Segmented tabs with arrow-key support. onSelect(id, viaKeyboard). */
  function tabs(items, current, onSelect, label) {
    var bar = el('div', { class: 'seg', role: 'tablist', 'aria-label': label });
    items.forEach(function (it, i) {
      var on = it.id === current;
      var b = el('button', {
        class: 'seg-btn' + (on ? ' on' : ''), type: 'button', role: 'tab', id: 'tab-' + it.id,
        'aria-selected': on ? 'true' : 'false', 'aria-controls': 'tabpanel', tabindex: on ? '0' : '-1', text: it.label
      });
      b.addEventListener('click', function () { onSelect(it.id, false); });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        onSelect(items[(i + d + items.length) % items.length].id, true);
      });
      bar.appendChild(b);
    });
    return bar;
  }

  function demoTag(text) { return el('span', { class: 'demo-tag', text: text }); }

  function lineCount(text) { return text.split('\n').filter(function (l) { return l.trim(); }).length; }

  /* A radio card in the same style as onboarding. */
  function radioCard(name, value, checked, title, line, onchange) {
    var input = el('input', { type: 'radio', name: name, value: value, checked: checked });
    input.addEventListener('change', function () { onchange(value); });
    return el('label', { class: 'choice' }, input,
      el('span', { class: 'choice-face' },
        el('span', { class: 'choice-text' },
          el('span', { class: 'choice-title', text: title }),
          line ? el('span', { class: 'choice-line', text: line }) : null),
        el('span', { class: 'choice-tick', 'aria-hidden': 'true', html: icons.check })));
  }

  /* ---------- streak: a missed day pauses it, it never resets ---------- */

  function questDoneToday() { return C.state.get().train.questDay === dayKey(); }

  function refreshStreak() {
    var st = C.state.get();
    var last = st.train.questDay;
    if (last && st.streak > 0 && dayGap(last, dayKey()) > 1 && !st.streakPaused) {
      st.streakPaused = true;
      C.state.save();
    }
  }

  /* ---------- S5 Train ---------- */

  var trainTab = 'quest';
  var quest = { phase: 'idle' }; /* idle, run, ready */
  var flight = { phase: 'pick', skill: '', photo: null, scoreText: '', result: null }; /* pick, run, submit, done */
  var chart = { chapter: '', q: 0, open: false, passageSeen: false, runs: {} };
  var focusTab = '';

  function train(main) {
    cleanup();
    refreshStreak();
    if (quest.phase === 'run') quest.phase = 'idle';
    if (flight.phase === 'run') flight.phase = 'pick';

    var root = el('section', { class: 'screen train' });
    main.appendChild(root);

    function select(id, viaKeyboard) {
      cleanup();
      if (quest.phase === 'run') quest.phase = 'idle';
      if (flight.phase === 'run') flight.phase = 'pick';
      trainTab = id;
      focusTab = viaKeyboard ? id : '';
      draw();
    }

    function draw() {
      cleanup();
      root.textContent = '';
      root.appendChild(el('header', { class: 'train-head' },
        el('p', { class: 'eyebrow', text: 'Train' }),
        el('h1', { text: 'Practise without your agent' }),
        el('p', { class: 'small dim', text: 'XP comes only from agent-free reps. Time in the app earns nothing.' })));
      root.appendChild(tabs([
        { id: 'quest', label: 'Daily Quest' }, { id: 'flights', label: 'Solo Flights' }, { id: 'charts', label: 'Star Charts' }
      ], trainTab, select, 'Training'));
      var panel = el('div', { class: 'tab-body', role: 'tabpanel', id: 'tabpanel', 'aria-labelledby': 'tab-' + trainTab });
      root.appendChild(panel);
      ({ quest: questView, flights: flightsView, charts: chartsView })[trainTab](panel, draw);

      root.appendChild(el('h2', { class: 'section-h', text: 'Practise with people' }));
      root.appendChild(linkCard('Orbits', 'Topic rooms of 4 to 8 people with a human host.', 'crew', function () { C.orbits.open('orbits'); }));
      root.appendChild(linkCard('Simulators', 'A mock interview, a 3-minute talk or a hard conversation, with written feedback from people.', 'train', function () { C.orbits.open('simulators'); }));

      if (focusTab) {
        var t = document.getElementById('tab-' + focusTab);
        if (t) t.focus();
        focusTab = '';
      }
    }
    draw();
  }

  function linkCard(title, line, icon, onclick) {
    return el('button', { class: 'panel link-card', type: 'button', onclick: onclick },
      el('span', { class: 'card-ic violet', html: icons[icon] }),
      el('span', { class: 'card-body' },
        el('span', { class: 'link-title', text: title }),
        el('span', { class: 'small dim', text: line })),
      el('span', { class: 'more-go', html: icons.next }));
  }

  /* ----- Daily Quest ----- */

  function streakLine(st) {
    return el('p', { class: 'small streak-line' },
      el('span', { class: 'inline-ic ember-text', html: icons.flame }),
      el('strong', { text: ' Streak: ' + st.streak + (st.streak === 1 ? ' day' : ' days') }),
      el('span', { class: 'dim', text: st.streakPaused
        ? '. Paused: you missed a day. Finish a quest and it picks up where you left off.'
        : '. Miss a day and the streak pauses. It never resets.' }));
  }

  function questView(body, redraw) {
    var st = C.state.get();
    var goal = H.goalLabel(st.user.goal);
    var rep = T.quest.reps[st.user.goal] || T.quest.fallback;

    body.appendChild(el('div', { class: 'panel quest' },
      el('div', { class: 'row-head' },
        el('h2', { class: 'panel-h tight', text: 'Daily Quest' }),
        demoTag('Demo speed')),
      el('p', { class: 'small dim', text: goal ? 'For your goal: ' + goal : 'Pick a goal on Home to tailor this' }),
      el('p', { class: 'prompt', text: rep }),
      el('p', { class: 'small dim', text: 'The real quest is ' + T.quest.realMinutes + ' minutes. In this demo it runs ' + T.quest.demoSeconds + ' seconds.' }),
      streakLine(st)));

    if (questDoneToday()) {
      body.appendChild(el('div', { class: 'panel done-card' },
        el('span', { class: 'card-ic ember big', html: icons.check }),
        el('div', { class: 'card-body' },
          el('h3', { text: 'Daily Quest done for today' }),
          el('p', { class: 'small', text: '+' + C.state.XP.quest + ' XP earned. Come back tomorrow to keep the streak going.' }))));
      return;
    }

    if (quest.phase === 'idle') {
      body.appendChild(el('p', { class: 'banner', text: 'Put your agent away. This one is just you.' }));
      body.appendChild(H.button('Start the quest', 'primary big', function () { quest.phase = 'run'; redraw(); }));
      return;
    }

    var complete = H.button('Complete the quest · +' + C.state.XP.quest + ' XP', 'primary big', finishQuest, { disabled: quest.phase !== 'ready' });
    var live = el('p', { class: 'small teal-text', 'aria-live': 'polite' });
    var timer = countdown(T.quest.demoSeconds, 'Keep going. Demo speed: ' + T.quest.demoSeconds + ' seconds', function () {
      quest.phase = 'ready';
      complete.disabled = false;
      live.textContent = 'Time. You did the rep yourself. You can complete the quest now.';
    });
    body.appendChild(timer.node);
    body.appendChild(live);
    body.appendChild(complete);
    if (quest.phase === 'ready') timer.markDone(); else timer.start();

    function finishQuest() {
      var s = C.state.get();
      if (questDoneToday()) return;
      s.train.questDay = dayKey();
      s.streak++;
      s.streakPaused = false;
      s.completed.quests++;
      var res = C.state.award({ xp: C.state.XP.quest, stat: 'doing' });
      quest.phase = 'idle';
      reward(res, 'Daily Quest done · +' + C.state.XP.quest + ' XP · streak ' + s.streak + (s.streak === 1 ? ' day' : ' days'));
      redraw();
    }
  }

  /* ----- Solo Flights ----- */

  function applyScore(score) {
    var st = C.state.get();
    var before = st.week.unaidedScore;
    /* Moving average (prototype value 0.3): each paper moves the unaided score a little, never all at once. */
    st.week.unaidedScore = Math.max(0, Math.min(100, Math.round(before * 0.7 + score * 0.3)));
    C.state.save();
    return before;
  }

  function resetFlight() {
    if (flight.photo) { try { URL.revokeObjectURL(flight.photo.url); } catch (e) { /* nothing to revoke */ } }
    flight = { phase: 'pick', skill: '', photo: null, scoreText: '', result: null };
  }

  function flightsView(body, redraw) {
    var st = C.state.get();
    var skill = byId(T.flights.skills, flight.skill);

    body.appendChild(el('div', { class: 'panel' },
      el('div', { class: 'row-head' }, el('h2', { class: 'panel-h tight', text: 'Solo Flights' }), demoTag('Demo speed')),
      el('p', { class: 'small', text: 'Do a real skill on paper, with no agent. Add a photo of your paper, then enter your score or send it for peer marking.' }),
      el('p', { class: 'small dim' }, 'Your unaided score: ', el('strong', { class: 'sky-text', text: String(st.week.unaidedScore) }), ' (each flight moves it as a moving average). +' + C.state.XP.flight + ' XP per flight.')));

    pendingList(body, redraw);

    if (flight.phase === 'pick') {
      var go = H.button('Start the flight', 'primary big', function () {
        flight.phase = 'run'; redraw();
      }, { disabled: !skill });
      body.appendChild(el('div', { class: 'choice-list', role: 'radiogroup', 'aria-label': 'Pick a skill' },
        T.flights.skills.map(function (s) {
          return radioCard('skill', s.id, flight.skill === s.id, s.label, s.task, function (v) { flight.skill = v; go.disabled = false; });
        })));
      body.appendChild(go);
      return;
    }

    if (flight.phase === 'run') {
      body.appendChild(el('div', { class: 'panel' },
        el('p', { class: 'small dim', text: skill.label + ' · stat: ' + statLabel(skill.stat) }),
        el('p', { class: 'prompt', text: skill.task })));
      body.appendChild(el('p', { class: 'banner', text: 'Paper and pen only. Put your agent away.' }));
      var next = H.button('Add my paper', 'primary big', function () { flight.phase = 'submit'; redraw(); }, { disabled: true });
      var live = el('p', { class: 'small teal-text', 'aria-live': 'polite' });
      var timer = countdown(T.flights.demoSeconds, 'Flight timer. Demo speed: ' + T.flights.demoSeconds + ' seconds (real: ' + skill.realMinutes + ' minutes)', function () {
        next.disabled = false;
        live.textContent = 'Time. Now add a photo of your paper.';
      });
      body.appendChild(timer.node);
      body.appendChild(live);
      body.appendChild(el('div', { class: 'row-btns' },
        next,
        H.button('Cancel', 'ghost', function () { flight.phase = 'pick'; redraw(); })));
      timer.start();
      return;
    }

    if (flight.phase === 'submit') {
      submitView(body, redraw, skill);
      return;
    }

    /* done */
    var r = flight.result;
    body.appendChild(el('div', { class: 'panel done-card' },
      el('span', { class: 'card-ic teal big', html: icons.check }),
      el('div', { class: 'card-body' },
        el('h3', { text: 'Flight complete · +' + C.state.XP.flight + ' XP' }),
        el('p', { class: 'small', text: r.text }),
        r.photoUrl ? el('p', { class: 'small dim', text: 'Your photo was kept in memory only and has been discarded.' }) : null)));
    body.appendChild(H.button('Fly again', 'primary', function () { resetFlight(); redraw(); }));
  }

  function submitView(body, redraw, skill) {
    var preview = el('div', { class: 'photo-preview', hidden: !flight.photo });
    var score = el('input', {
      class: 'field', type: 'number', id: 'flScore', min: '0', max: '100', inputmode: 'numeric',
      autocomplete: 'off', placeholder: '0 to 100', value: flight.scoreText
    });
    var saveBtn = H.button('Save my score', 'primary', saveScore, { disabled: true });
    var peerBtn = H.button('Send for peer marking', 'ghost', sendPeer, { disabled: !flight.photo });
    var peerNote = el('p', { class: 'small dim', id: 'peerNote' });

    function validScore() {
      var v = score.value.trim();
      if (v === '') return null;
      var n = Number(v);
      return isFinite(n) && n >= 0 && n <= 100 ? Math.round(n) : null;
    }
    function refresh() {
      flight.scoreText = score.value;
      saveBtn.disabled = validScore() === null;
      peerBtn.disabled = !flight.photo;
      peerNote.textContent = flight.photo ? 'Two members will mark your paper. The mark arrives in a moment in this demo.' : 'Add a photo first: a person needs to see your paper to mark it.';
    }
    function drawPreview() {
      preview.textContent = '';
      preview.hidden = !flight.photo;
      if (!flight.photo) return;
      preview.appendChild(el('img', { src: flight.photo.url, alt: 'Photo of your paper' }));
      preview.appendChild(H.button('Remove photo', 'ghost compact', function () {
        try { URL.revokeObjectURL(flight.photo.url); } catch (e) { /* nothing to revoke */ }
        flight.photo = null; drawPreview(); refresh();
      }));
    }

    var file = el('input', { type: 'file', id: 'flPhoto', accept: 'image/*', class: 'file-input' });
    file.addEventListener('change', function () {
      var f = file.files && file.files[0];
      if (!f) return;
      if (flight.photo) { try { URL.revokeObjectURL(flight.photo.url); } catch (e) { /* nothing to revoke */ } }
      flight.photo = { url: URL.createObjectURL(f), name: f.name };
      drawPreview(); refresh();
    });
    score.addEventListener('input', refresh);

    body.appendChild(el('div', { class: 'panel' },
      el('h2', { class: 'panel-h', text: skill.label + ': add your paper' }),
      el('label', { class: 'btn ghost file-pick', for: 'flPhoto' },
        el('span', { class: 'btn-ic', html: icons.scan }), el('span', { text: 'Add a photo of your paper' }), file),
      el('p', { class: 'small dim', text: 'The photo stays in memory on this screen only. It is not uploaded or saved.' }),
      preview));

    body.appendChild(el('div', { class: 'panel' },
      el('h2', { class: 'panel-h', text: 'Enter your score' }),
      el('div', { class: 'field-block' },
        el('label', { for: 'flScore', class: 'field-label', text: 'Your own score, out of 100' }),
        score),
      saveBtn));

    body.appendChild(el('div', { class: 'panel' },
      el('h2', { class: 'panel-h', text: 'Or send for peer marking' }),
      peerNote, peerBtn));

    drawPreview();
    refresh();

    function finish(text, extra) {
      var s = C.state.get();
      s.completed.flights++;
      var res = C.state.award({ xp: C.state.XP.flight, stat: skill.stat });
      flight.result = { text: text, photoUrl: flight.photo ? flight.photo.url : '' };
      if (flight.photo) { try { URL.revokeObjectURL(flight.photo.url); } catch (e) { /* nothing to revoke */ } flight.photo = null; }
      flight.phase = 'done';
      reward(res, 'Solo Flight done · +' + C.state.XP.flight + ' XP' + (extra || ''));
      redraw();
    }

    function saveScore() {
      var n = validScore();
      if (n === null) return;
      var before = applyScore(n);
      var after = C.state.get().week.unaidedScore;
      finish('You scored ' + n + '. Your unaided score moved from ' + before + ' to ' + after + ' (moving average).', ' · unaided score ' + after);
    }

    function sendPeer() {
      var s = C.state.get();
      s.train.pending.push({ id: 'p' + Date.now(), skill: skill.id });
      finish('Sent to ' + T.flights.markers.join(' and ') + ' for marking. Your unaided score updates when their mark arrives.');
      /* In the demo the mark arrives a few seconds later, if you are still on this screen. */
      var pid = s.train.pending[s.train.pending.length - 1].id;
      var t = setTimeout(function () { collectMark(pid, true); }, 4000);
      cleanups.push(function () { clearTimeout(t); });
    }
  }

  /* A peer mark arriving. The mark itself is pre-written in the data for this demo. */
  function collectMark(id, fromTimer) {
    var st = C.state.get();
    var item = byId(st.train.pending, id);
    if (!item) return;
    var skill = byId(T.flights.skills, item.skill);
    st.train.pending.splice(st.train.pending.indexOf(item), 1);
    applyScore(skill.mark);
    C.ui.toast(T.flights.markers.join(' and ') + ' marked your ' + skill.label.toLowerCase() + ' paper: ' + skill.mark + ' · unaided score ' + st.week.unaidedScore, 3800);
    if (C.app.current() === 'train') C.app.render('train', true);
  }

  function pendingList(body, redraw) {
    var st = C.state.get();
    if (!st.train.pending.length) return;
    var panel = el('div', { class: 'panel' }, el('h2', { class: 'panel-h', text: 'Waiting for peer marks' }));
    st.train.pending.forEach(function (p) {
      var skill = byId(T.flights.skills, p.skill);
      panel.appendChild(el('div', { class: 'pending-row' },
        el('span', { class: 'small', text: skill.label + ' paper, with ' + T.flights.markers.join(' and ') }),
        H.button('Show the mark', 'ghost compact', function () { collectMark(p.id); })));
    });
    panel.appendChild(el('p', { class: 'small dim', text: 'Demo: in the app a mark arrives when two people have marked your paper.' }));
    body.appendChild(panel);
  }

  /* ----- Star Charts ----- */

  function chapterBadges(ch) {
    return el('div', { class: 'badges' },
      el('span', { class: 'badge', text: 'Author: ' + ch.author }),
      el('span', { class: 'badge teal', text: 'Peer reviewed by ' + ch.reviewers.join(' and ') }),
      el('span', { class: 'badge sky', text: 'Openly licensed: ' + ch.licence }));
  }

  function chartsView(body, redraw) {
    var st = C.state.get();
    var ch = byId(T.chapters, chart.chapter);
    if (ch) {
      if (ch.passage && !chart.passageSeen) return passageView(body, redraw, ch);
      return chart.q >= 0 && chart.q < ch.questions.length && chart.open ? questionView(body, redraw, ch) : chapterView(body, redraw, ch);
    }

    body.appendChild(el('div', { class: 'panel' },
      el('h2', { class: 'panel-h', text: 'Star Charts' }),
      el('p', { class: 'small', text: 'Short chapters written by members. Answer before you look, stay with the hard part, and open hints only if you need them.' })));
    T.chapters.forEach(function (c) {
      body.appendChild(el('button', {
        class: 'panel chapter-card', type: 'button',
        onclick: function () { chart.chapter = c.id; chart.q = 0; chart.open = false; chart.passageSeen = false; redraw(); }
      },
        el('span', { class: 'card-body' },
          el('span', { class: 'small dim', text: c.topic + ' · ' + c.questions.length + ' questions' }),
          el('span', { class: 'link-title', text: c.title }),
          chapterBadges(c)),
        el('span', { class: 'more-go', html: icons.next })));
    });

    if (st.train.published.length) {
      var mine = el('div', { class: 'panel' }, el('h2', { class: 'panel-h', text: 'Your chapters' }));
      st.train.published.forEach(function (p) {
        mine.appendChild(el('div', { class: 'pending-row' },
          el('span', { class: 'small' }, el('strong', { text: p.title }), ' · ' + p.licence),
          el('span', { class: 'badge', text: 'Waiting for peer review' })));
      });
      body.appendChild(mine);
    }
    body.appendChild(H.button('Publish a chapter', 'ghost', openPublish, { icon: icons.edit }));
    body.appendChild(el('p', { class: 'small dim', text: 'Anyone can write a chapter. Two members review it before it appears. Publishing earns no XP.' }));
  }

  function backToList(redraw) {
    return H.button('All chapters', 'ghost compact', function () { chart.chapter = ''; chart.open = false; redraw(); }, { icon: icons.back });
  }

  function passageView(body, redraw, ch) {
    body.appendChild(backToList(redraw));
    body.appendChild(el('div', { class: 'panel' },
      el('h2', { class: 'panel-h', text: ch.title }),
      chapterBadges(ch),
      el('p', { class: 'small dim', text: ch.intro }),
      el('blockquote', { class: 'passage', text: ch.passage })));
    body.appendChild(H.button('I have read it. Hide it and start', 'primary', function () { chart.passageSeen = true; redraw(); }));
  }

  function chapterView(body, redraw, ch) {
    body.appendChild(backToList(redraw));
    body.appendChild(el('div', { class: 'panel' },
      el('p', { class: 'small dim', text: ch.topic }),
      el('h2', { text: ch.title }),
      chapterBadges(ch),
      el('p', { class: 'small', text: ch.intro })));
    ch.questions.forEach(function (q, i) {
      var run = chart.runs[q.id];
      var status = run && run.revealed ? 'Answer revealed' : run && run.answer ? 'Your answer is written' : 'Not started';
      body.appendChild(el('button', {
        class: 'panel chapter-card', type: 'button',
        onclick: function () { chart.q = i; chart.open = true; redraw(); }
      },
        el('span', { class: 'card-body' },
          el('span', { class: 'small dim', text: 'Question ' + (i + 1) + ' of ' + ch.questions.length + ' · ' + status }),
          el('span', { class: 'link-title', text: q.text })),
        el('span', { class: 'more-go', html: icons.next })));
    });
  }

  function questionView(body, redraw, ch) {
    var q = ch.questions[chart.q];
    var run = chart.runs[q.id] || (chart.runs[q.id] = { answer: '', hints: 0, timerDone: false, revealed: false });

    body.appendChild(H.button('Back to ' + ch.title, 'ghost compact', function () { chart.open = false; redraw(); }, { icon: icons.back }));
    body.appendChild(el('div', { class: 'panel' },
      el('p', { class: 'small dim', text: ch.title + ' · question ' + (chart.q + 1) + ' of ' + ch.questions.length }),
      el('p', { class: 'prompt', id: 'qText', text: q.text })));

    var answer = el('textarea', {
      class: 'field area', id: 'qAnswer', rows: '3', maxlength: '200', placeholder: 'Write your own answer here',
      autocomplete: 'off', autocorrect: 'off', autocapitalize: 'off', spellcheck: 'false', disabled: run.revealed
    });
    answer.value = run.answer;
    body.appendChild(el('div', { class: 'panel' },
      el('label', { class: 'field-label', for: 'qAnswer', text: 'Your answer. Write it before you reveal anything.' }),
      answer));

    var hintHost = el('div', { class: 'hint-list' });
    var hintBtns = [];
    var revealBtn = H.button('Reveal the answer', 'primary', reveal, { disabled: true });
    var status = el('p', { class: 'small teal-text', 'aria-live': 'polite' });
    var timer = null;

    if (!run.revealed) {
      timer = countdown(T.struggleSeconds, 'Struggle timer. Demo speed: ' + T.struggleSeconds + ' seconds before Hint 1', function () {
        run.timerDone = true;
        status.textContent = 'You stayed with it. Hint 1 is unlocked.';
        refresh();
      });
      body.appendChild(timer.node);
      body.appendChild(status);
    }

    body.appendChild(el('div', { class: 'panel' },
      el('h2', { class: 'panel-h', text: 'Hints' }),
      el('div', { class: 'row-btns' }, [0, 1, 2].map(function (i) {
        var b = H.button('Hint ' + (i + 1), 'ghost compact', function () { run.hints = i + 1; drawHints(); refresh(); }, { disabled: true });
        hintBtns.push(b);
        return b;
      })),
      hintHost,
      el('p', { class: 'small dim', text: 'Hint 1 unlocks when the timer ends. Each hint unlocks the next. The answer unlocks once the timer has ended and you have written your own answer.' })));
    body.appendChild(revealBtn);
    var result = el('div', { class: 'reveal' });
    body.appendChild(result);

    function drawHints() {
      hintHost.textContent = '';
      for (var i = 0; i < run.hints; i++) hintHost.appendChild(el('p', { class: 'hint panel', text: 'Hint ' + (i + 1) + ': ' + q.hints[i] }));
    }

    function refresh() {
      run.answer = answer.value;
      hintBtns.forEach(function (b, i) {
        b.disabled = run.revealed || !run.timerDone || run.hints < i;
        b.setAttribute('aria-pressed', run.hints > i ? 'true' : 'false');
      });
      revealBtn.disabled = run.revealed || !run.timerDone || answer.value.trim() === '';
      revealBtn.hidden = run.revealed;
    }
    answer.addEventListener('input', refresh);

    function drawResult() {
      result.textContent = '';
      if (!run.revealed) return;
      result.appendChild(el('div', { class: 'panel answer-card' },
        el('p', { class: 'small dim', text: 'Your answer' }),
        el('p', { text: run.answer || '(left blank)' }),
        el('p', { class: 'small dim', text: 'The answer' }),
        el('p', { class: 'answer-text', text: q.answer }),
        run.note ? el('p', { class: 'small teal-text', text: run.note }) : null));
      var row = el('div', { class: 'row-btns' });
      if (chart.q > 0) row.appendChild(H.button('Previous', 'ghost', function () { chart.q--; redraw(); }));
      if (chart.q < ch.questions.length - 1) row.appendChild(H.button('Next question', 'primary', function () { chart.q++; redraw(); }));
      else row.appendChild(H.button('Finish the chapter', 'primary', function () { chart.open = false; redraw(); }));
      result.appendChild(row);
    }

    function reveal() {
      if (run.revealed) return;
      run.answer = answer.value;
      run.revealed = true;
      answer.disabled = true;
      var s = C.state.get();
      if (run.timerDone && run.hints === 0 && s.train.nudged.indexOf(q.id) < 0) {
        /* Finished the struggle timer without opening a hint: a nudge to Persevering. No XP. */
        s.train.nudged.push(q.id);
        var lvBefore = s.stats.persevering;
        C.state.award({ xp: 0, points: 20, stat: 'persevering' }); /* prototype value: 20 points, 3 questions per level */
        run.note = 'You stayed with it without a hint. Persevering nudged up' + (s.stats.persevering > lvBefore ? ' to level ' + s.stats.persevering : '') + '.';
        C.ui.toast(run.note, 3800);
      } else if (run.hints > 0) {
        run.note = 'You used ' + run.hints + (run.hints === 1 ? ' hint' : ' hints') + '. That is what they are for. No nudge this time.';
      }
      if (timer) timer.stop();
      drawResult();
      refresh();
    }

    if (run.timerDone || run.revealed) { if (timer) timer.markDone(); } else timer.start();
    drawHints();
    drawResult();
    refresh();
  }

  function openPublish() {
    var sheet = null;
    var title = '', licence = T.licences[0];
    var name = el('input', { class: 'field', type: 'text', id: 'pubTitle', maxlength: '60', placeholder: 'Chapter title', autocomplete: 'off', spellcheck: 'false' });
    var send = H.button('Send for peer review', 'primary', function () {
      var s = C.state.get();
      s.train.published.push({ title: title, licence: licence });
      C.state.save();
      sheet.close();
      C.ui.toast('Sent. Two members review it before it appears in Star Charts.', 3600);
      if (C.app.current() === 'train') C.app.render('train', true);
    }, { disabled: true });
    name.addEventListener('input', function () { title = name.value.trim(); send.disabled = !title; });

    var licences = {
      'CC BY 4.0': 'Anyone may reuse it if they credit you.',
      'CC BY-SA 4.0': 'Anyone may reuse it if they credit you and share alike.',
      'CC0': 'No rights reserved: anyone may reuse it freely.'
    };
    var content = el('div', { class: 'stack' },
      el('p', { class: 'sheet-sub', text: 'Anyone can write a chapter. Choose a licence so others may use it.' }),
      el('div', { class: 'field-block' }, el('label', { class: 'field-label', for: 'pubTitle', text: 'Title' }), name),
      el('div', { class: 'choice-list', role: 'radiogroup', 'aria-label': 'Licence' }, T.licences.map(function (l) {
        return radioCard('licence', l, licence === l, l, licences[l], function (v) { licence = v; });
      })),
      send);
    sheet = C.ui.modal('Publish a chapter', content);
  }

  /* ---------- S6 Orbits and Simulators ---------- */

  var orbTab = 'orbits';
  var orb = { id: '', phase: 'list', view: '', raised: false }; /* list, gate, room */
  var sim = { id: '', phase: 'pick', awarded: false }; /* pick, brief, run, ready, done */

  function orbits(main) {
    cleanup();
    if (sim.phase === 'run') sim.phase = 'brief';
    if (orb.phase === 'room') orb.phase = 'list'; /* leaving the screen leaves the room */
    var root = el('section', { class: 'screen orbits' });
    main.appendChild(root);

    function select(id, viaKeyboard) {
      cleanup();
      if (sim.phase === 'run') sim.phase = 'brief';
      if (orb.phase === 'room') orb.phase = 'list';
      orbTab = id; focusTab = viaKeyboard ? id : ''; draw();
    }

    function draw() {
      cleanup();
      root.textContent = '';
      root.appendChild(el('header', { class: 'train-head' },
        el('p', { class: 'eyebrow', text: 'Train · with people' }),
        el('h1', { text: 'Orbits and Simulators' }),
        el('p', { class: 'small dim', text: 'People only. Agents can’t join these rooms.' })));
      root.appendChild(H.button('Back to Train', 'ghost compact', function () { C.app.go('train'); }, { icon: icons.back }));
      root.appendChild(tabs([{ id: 'orbits', label: 'Orbits' }, { id: 'simulators', label: 'Simulators' }], orbTab, select, 'Orbits and Simulators'));
      var panel = el('div', { class: 'tab-body', role: 'tabpanel', id: 'tabpanel', 'aria-labelledby': 'tab-' + orbTab });
      root.appendChild(panel);
      (orbTab === 'orbits' ? orbitsView : simulatorsView)(panel, draw);
      if (focusTab) {
        var t = document.getElementById('tab-' + focusTab);
        if (t) t.focus();
        focusTab = '';
      }
    }
    draw();
  }

  function seatsLeft(o) { return o.size - o.joined; }

  function orbitsView(body, redraw) {
    var room = byId(T.orbits, orb.id);
    if (room && orb.phase === 'gate') return gateView(body, redraw, room);
    if (room && orb.phase === 'room') return roomView(body, redraw, room);

    body.appendChild(el('div', { class: 'panel' },
      el('h2', { class: 'panel-h', text: 'Topic rooms' }),
      el('p', { class: 'small', text: 'Rooms of 4 to 8 people with a human host. Before you enter, write your own view in three lines.' }),
      el('p', { class: 'small dim', text: 'Orbits earn no XP on their own. Time in a room is not a reward.' })));
    T.orbits.forEach(function (o) {
      body.appendChild(el('div', { class: 'panel orbit-card' },
        el('div', { class: 'card-body' },
          el('h3', { text: o.topic }),
          el('p', { class: 'small' }, 'Host: ', el('strong', { text: o.host })),
          el('p', { class: 'small dim', text: o.when + ' · ' + seatsLeft(o) + (seatsLeft(o) === 1 ? ' seat left' : ' seats left') + ' of ' + o.size })),
        H.button('Join', 'primary compact', function () { orb = { id: o.id, phase: 'gate', view: '', raised: false }; redraw(); })));
    });
  }

  function gateView(body, redraw, room) {
    body.appendChild(H.button('All rooms', 'ghost compact', function () { orb.phase = 'list'; redraw(); }, { icon: icons.back }));
    body.appendChild(el('div', { class: 'panel' },
      el('p', { class: 'small dim', text: room.topic + ' · host ' + room.host + ' · ' + room.when }),
      el('h2', { text: 'Write your own three-line view before you enter.' }),
      el('p', { class: 'small dim', text: 'Your own words, not your agent’s. The room sees your view when you walk in.' })));

    var ta = el('textarea', {
      class: 'field area', id: 'gateView', rows: '5', maxlength: '400',
      autocomplete: 'off', autocorrect: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-describedby': 'gateCount'
    });
    ta.value = orb.view;
    var count = el('p', { class: 'small dim', id: 'gateCount' });
    var enter = H.button('Enter the room', 'primary big', function () { orb.phase = 'room'; orb.raised = false; redraw(); }, { disabled: true });
    function refresh() {
      orb.view = ta.value;
      var n = lineCount(ta.value);
      count.textContent = 'Lines written: ' + Math.min(n, 3) + ' of 3. Press Enter to start a new line.';
      enter.disabled = n < 3;
    }
    ta.addEventListener('input', refresh);
    body.appendChild(el('div', { class: 'panel' },
      el('label', { for: 'gateView', class: 'prompt', text: room.view }),
      ta, count));
    body.appendChild(enter);
    refresh();
  }

  function roomView(body, redraw, room) {
    var st = C.state.get();
    var seconds = 0;
    var clock = el('span', { class: 'timer-num', text: '0:00' });
    var iv = setInterval(function () {
      if (!document.body.contains(clock)) { clearInterval(iv); return; }
      seconds++;
      clock.textContent = fmt(seconds);
    }, 1000);
    cleanups.push(function () { clearInterval(iv); });

    body.appendChild(el('div', { class: 'banner agents-banner' }, el('span', { class: 'inline-ic', html: icons.lock }), ' No agents in this room'));
    body.appendChild(el('div', { class: 'panel' },
      el('p', { class: 'small dim', text: room.when }),
      el('h2', { text: room.topic }),
      el('p', { class: 'small' }, 'Host: ', el('strong', { text: room.host })),
      el('div', { class: 'timer-top room-time' }, el('span', { class: 'small dim', text: 'Session time (demo clock, counts from when you came in)' }), clock)));

    var people = [{ name: room.host, host: true }].concat(room.names.map(function (n) { return { name: n }; })).concat([{ name: st.user.name || 'You', me: true }]);
    var colors = ['violet', 'teal', 'magenta', 'sky', 'ember'];
    var tiles = el('div', { class: 'tiles' }, people.map(function (p, i) {
      return el('div', { class: 'tile panel' },
        C.people.avatar(p.name, p.me ? 'gold' : colors[i % colors.length], 44),
        el('span', { class: 'tile-name', text: p.name + (p.me ? ' (you)' : '') }),
        p.host ? el('span', { class: 'badge', text: 'Host' }) : null,
        p.me && orb.raised ? el('span', { class: 'badge teal', text: 'Hand up' }) : null);
    }));
    body.appendChild(el('div', { class: 'panel' },
      el('h2', { class: 'panel-h', text: people.length + ' people in the room' }), tiles));

    body.appendChild(el('div', { class: 'panel' },
      el('h2', { class: 'panel-h', text: 'Your view' }),
      el('p', { class: 'view-text', text: orb.view.trim() })));

    var hand = H.button(orb.raised ? 'Lower hand' : 'Raise hand', orb.raised ? 'primary' : 'ghost', function () { orb.raised = !orb.raised; redraw(); });
    hand.setAttribute('aria-pressed', orb.raised ? 'true' : 'false');
    body.appendChild(el('div', { class: 'row-btns' }, hand, H.button('Leave the room', 'ghost', function () { orb.phase = 'list'; redraw(); })));
    if (orb.raised) body.appendChild(el('p', { class: 'small teal-text', 'aria-live': 'polite', text: 'Hand raised. ' + room.host + ' will call on you.' }));
  }

  /* ----- Simulators ----- */

  function dots(n) {
    var d = el('span', { class: 'dots', 'aria-hidden': 'true' });
    for (var i = 1; i <= 5; i++) d.appendChild(el('i', { class: i <= n ? 'on' : '' }));
    return d;
  }

  function rubricList(scoreOf) {
    return el('div', { class: 'rubric' }, D.train.rubric.map(function (r) {
      return el('div', { class: 'rubric-row' },
        el('div', { class: 'rubric-text' },
          el('span', { class: 'rubric-name', text: r.label }),
          el('span', { class: 'small dim', text: r.line })),
        scoreOf
          ? el('span', { class: 'rubric-score', 'aria-label': r.label + ' ' + scoreOf(r.id) + ' out of 5' }, dots(scoreOf(r.id)), el('strong', { text: scoreOf(r.id) + '/5' }))
          : el('span', { class: 'small dim', text: '1 to 5' }));
    }));
  }

  function simulatorsView(body, redraw) {
    var f = byId(T.simulators, sim.id);

    if (!f || sim.phase === 'pick') {
      body.appendChild(el('div', { class: 'panel' },
        el('h2', { class: 'panel-h', text: 'Simulators' }),
        el('p', { class: 'small', text: 'Practise a moment that matters, then get written feedback from two people. +' + C.state.XP.simulator + ' XP per session.' })));
      var go = H.button('See the rubric', 'primary big', function () { sim = { id: sim.id, phase: 'brief', awarded: false }; redraw(); }, { disabled: !f });
      body.appendChild(el('div', { class: 'choice-list', role: 'radiogroup', 'aria-label': 'Pick a format' },
        T.simulators.map(function (s) {
          return radioCard('sim', s.id, sim.id === s.id, s.label, s.line, function (v) { sim.id = v; go.disabled = false; });
        })));
      body.appendChild(go);
      return;
    }

    if (sim.phase === 'brief') {
      body.appendChild(H.button('All formats', 'ghost compact', function () { sim.phase = 'pick'; redraw(); }, { icon: icons.back }));
      body.appendChild(el('div', { class: 'panel' },
        el('h2', { text: f.label }),
        el('p', { class: 'small dim', text: f.line }),
        el('p', { class: 'prompt', text: 'Your scenario: ' + f.scenario })));
      body.appendChild(el('div', { class: 'panel' },
        el('h2', { class: 'panel-h', text: 'How you will be marked' }),
        el('p', { class: 'small dim', text: 'Two people score you from 1 to 5 on each line.' }),
        rubricList(null)));
      body.appendChild(el('p', { class: 'banner', text: 'Put your agent away. Speak it out loud.' }));
      body.appendChild(H.button('Start the timer', 'primary big', function () { sim.phase = 'run'; redraw(); }));
      return;
    }

    if (sim.phase === 'run' || sim.phase === 'ready') {
      body.appendChild(el('div', { class: 'panel' },
        el('h2', { text: f.label }),
        el('p', { class: 'prompt', text: f.scenario })));
      var done = H.button('Finish and see feedback', 'primary big', function () { sim.phase = 'done'; redraw(); }, { disabled: sim.phase !== 'ready' });
      var live = el('p', { class: 'small teal-text', 'aria-live': 'polite' });
      var timer = countdown(f.demoSeconds, 'Session timer. Demo speed: ' + f.demoSeconds + ' seconds (real: ' + f.realMinutes + ' minutes)', function () {
        sim.phase = 'ready';
        done.disabled = false;
        live.textContent = 'Time. Your two feedback notes are ready.';
      });
      body.appendChild(timer.node);
      body.appendChild(live);
      body.appendChild(done);
      if (sim.phase === 'ready') timer.markDone(); else timer.start();
      return;
    }

    /* done: two written notes from people, then the XP (once) */
    if (!sim.awarded) {
      sim.awarded = true;
      var s = C.state.get();
      s.completed.simulators++;
      var res = C.state.award({ xp: C.state.XP.simulator, stat: 'relating' });
      reward(res, f.label + ' done · +' + C.state.XP.simulator + ' XP');
    }
    body.appendChild(el('div', { class: 'panel done-card' },
      el('span', { class: 'card-ic teal big', html: icons.check }),
      el('div', { class: 'card-body' },
        el('h3', { text: f.label + ' complete · +' + C.state.XP.simulator + ' XP' }),
        el('p', { class: 'small dim', text: 'Two written notes from people. They are pre-written for this demo.' }))));
    f.notes.forEach(function (n, i) {
      body.appendChild(el('div', { class: 'panel note' },
        el('div', { class: 'note-head' },
          C.people.avatar(n.from, i ? 'sky' : 'magenta', 36),
          el('div', {}, el('strong', { text: n.from }), el('p', { class: 'small dim', text: 'Written feedback' }))),
        el('p', { class: 'note-text', text: '“' + n.note + '”' }),
        rubricList(function (id) { return n.scores[id]; })));
    });
    body.appendChild(H.button('Practise another format', 'ghost', function () { sim = { id: '', phase: 'pick', awarded: false }; redraw(); }));
  }

  /* ---------- the screen table ---------- */

  function open(tab) {
    trainTab = tab || 'quest';
    C.app.go('train');
  }

  C.screens.train = train;
  C.screens.orbits = orbits;

  C.orbits = {
    open: function (tab) { orbTab = tab || 'orbits'; C.app.go('orbits'); }
  };

  return { open: open, refreshStreak: refreshStreak, questDoneToday: questDoneToday };
})();
