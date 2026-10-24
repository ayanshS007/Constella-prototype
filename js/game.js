/* Constella prototype, M7 "Game layer": the Ascend moment, Lumen's reactions, bars that grow from where you last saw
   them, and the Demo controls "Fill a demo week" and "Trigger Ascend". Plain script, loaded after ui.js.
   Nothing here talks or is generated: Lumen only glows, and XP still goes through C.state.award() only. */
window.C = window.C || {};

C.game = (function () {
  var el = C.ui.el;
  var ASCEND_MS = 1400; /* the whole Ascend moment, kept under 1.5 seconds */
  var ascendNode = null, ascendTimer = null;
  var seen = {}; /* bar fractions as last drawn, so a bar grows from there instead of jumping */

  /* Motion is off with the reduced-motion preference or the Motion switch (Demo controls, Privacy and settings). */
  function still() {
    if (document.body.classList.contains('still')) return true;
    try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }

  /* A line for screen readers only. */
  function announce(text) {
    var host = document.getElementById('srLive');
    if (!host) {
      host = el('div', { id: 'srLive', class: 'sr-only', 'aria-live': 'polite', role: 'status' });
      document.body.appendChild(host);
    }
    host.textContent = '';
    setTimeout(function () { host.textContent = text; }, 50);
  }

  /* ---------- Ascend: a short burst of light, the new rank name and the word "Ascend" ---------- */

  function clearAscend() {
    if (ascendTimer) { clearTimeout(ascendTimer); ascendTimer = null; }
    if (ascendNode && ascendNode.parentNode) ascendNode.parentNode.removeChild(ascendNode);
    ascendNode = null;
  }

  /* Skipped with reduced motion: the rank-up is then a plain message. opts.replay: from the Demo controls. */
  function ascend(rank, opts) {
    if (!rank) return;
    opts = opts || {};
    if (still()) {
      C.ui.toast('Ascend · You are now ' + rank.name + (opts.replay ? '. Motion is off, so the burst is skipped.' : ''), 3800);
      return;
    }
    var phone = document.getElementById('phone');
    if (!phone) return;
    clearAscend();
    ascendNode = el('div', { class: 'ascend', 'aria-hidden': 'true' },
      el('div', { class: 'ascend-rays' }),
      el('div', { class: 'ascend-burst' }),
      el('div', { class: 'ascend-core' },
        C.ui.rankBadge(92),
        el('p', { class: 'ascend-word', text: 'Ascend' }),
        el('p', { class: 'ascend-rank', text: rank.name })));
    phone.appendChild(ascendNode);
    announce('Ascend. You are now ' + rank.name + '.');
    ascendTimer = setTimeout(clearAscend, ASCEND_MS);
  }

  /* ---------- Lumen ---------- */

  /* A Lumen that follows the day's activity and reacts when the user acts. */
  function lumen(size) {
    return C.ui.lumen({ size: size, mood: C.state.lumenMood(), live: true });
  }

  /* After an agent-free or in-person action: every Lumen on screen brightens, with one soft flare. Never a bubble. */
  function react() {
    var mood = C.state.lumenMood();
    var nodes = document.querySelectorAll('.lumen.live');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      C.ui.setLumenMood(n, mood);
      n.classList.remove('react');
      if (!still()) { void n.offsetWidth; n.classList.add('react'); }
    }
  }

  document.addEventListener('animationend', function (e) {
    if (e.target && e.target.classList && e.target.classList.contains('react') && e.animationName === 'lumen-react') e.target.classList.remove('react');
  });

  /* ---------- bars that grow ---------- */

  /* A bar fill that starts where this bar was last drawn and grows to fraction (0 to 1). */
  function growFill(key, fraction) {
    var from = seen[key] !== undefined ? seen[key] : fraction;
    var fill = el('div', { class: 'bar-fill' });
    fill.style.width = (from * 100).toFixed(1) + '%';
    seen[key] = fraction;
    if (from !== fraction) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { fill.style.width = (fraction * 100).toFixed(1) + '%'; });
      });
    }
    return fill;
  }

  function lastSeen(key) { return seen[key]; }

  function forget() { seen = {}; clearAscend(); }

  /* ---------- rewards ---------- */

  /* The toast after an award. A rank-up shows itself as the Ascend moment, so it is not repeated here. */
  function reward(res, message) {
    C.ui.toast(message, 3800);
  }

  /* ---------- Demo controls ---------- */

  /* Jumping in from the Demo controls before the Awakening: use the placeholder user. */
  function ensureUser() {
    var st = C.state.get();
    if (st.onboarded) return;
    C.state.finishAwakening({
      name: st.user.name || 'Arjun', goal: st.user.goal || 'exam', visibility: st.user.visibility, womenOnly: st.user.womenOnly,
      stats: { relating: 2, doing: 3, thinking: 2, persevering: 2 }
    });
  }

  /* Prototype values: the week the walkthrough shows (Section 8). */
  var WEEK = { togetherHours: 4.5, unaidedScore: 63, agentHours: 24, streak: 5, xpCeiling: 560 /* stays inside Nebula */ };

  /* "Fill a demo week": a week of agent-free practice and meet-ups, applied as the actions themselves, so the stats,
     the Constellation and the rank move the way they would have. */
  function fillWeek() {
    ensureUser();
    var st = C.state.get();
    if (st.demoWeek) {
      C.ui.toast('The demo week is already filled. Reset the demo to fill it again.', 3600);
      C.app.go('home');
      return;
    }
    st.demoWeek = true;
    var XP = C.state.XP, crew = C.data.crew, mt = crew.nextMeetup;
    var acts = []; /* { stat, xp, points } */

    function line(id, label, note) {
      var who = C.people.byId(crew.members, id);
      st.constellation.lines.push({ to: id, label: label });
      C.state.addStar(id, who.name, note || label);
    }

    /* Thursday: the crew meet-up, checked in with three members */
    if (!st.crew.checkedIn) {
      st.crew.checkedIn = true;
      ['priya', 'tomas', 'amara'].forEach(function (id) {
        if (st.crew.scanned.indexOf(id) >= 0) return;
        st.crew.scanned.push(id);
        line(id, 'Met at ' + mt.place + ', ' + mt.when, 'Met at ' + mt.place);
      });
      acts.push({ stat: 'relating', xp: XP.meetingHour * mt.hours });
    }
    /* Saturday and Sunday: two more confirmed meetings */
    line('tomas', 'Study table at City Library, Saturday 10 am');
    line('mei', 'Study table at City Library, Saturday 10 am');
    acts.push({ stat: 'relating', xp: XP.meetingHour * 1.5 });
    line('kofi', 'Walk and talk in Riverside Park, Sunday 4 pm');
    acts.push({ stat: 'relating', xp: XP.meetingHour * 1 });
    /* A Landing Mission, done with Amara */
    if (st.completed.missions.indexOf('cook') < 0) {
      st.completed.missions.push('cook');
      line('amara', 'Landing Mission: Cook a family recipe with someone');
      acts.push({ stat: 'relating', xp: XP.mission });
    }
    /* Five Daily Quests and two Solo Flights, marked by Tomás and Mei */
    acts.push({ stat: C.data.train.quest.stat[st.user.goal] || 'doing', xp: XP.quest * 5 });
    acts.push({ stat: 'thinking', xp: XP.flight });
    acts.push({ stat: 'doing', xp: XP.flight });
    C.data.train.flights.markers.forEach(function (n) { C.state.addStar(C.state.starId(n), n, 'Marked your mental maths paper'); });
    /* Two Star Chart questions finished without a hint: Persevering only, no XP */
    acts.push({ stat: 'persevering', xp: 0, points: 40 });

    acts.forEach(function (a) { C.state.award({ xp: 0, points: a.points !== undefined ? a.points : a.xp, stat: a.stat }); });

    st.completed.quests += 5;
    st.completed.flights += 2;
    st.streak = Math.max(st.streak, WEEK.streak);
    st.streakPaused = false;
    st.train.questDay = C.state.dayKey();
    st.week.togetherHours = WEEK.togetherHours;
    st.week.unaidedScore = WEEK.unaidedScore;
    st.week.agentHours = WEEK.agentHours;

    var earned = acts.reduce(function (sum, a) { return sum + a.xp; }, 0);
    var gain = st.xp >= C.data.ranks[2].xp ? 0 : Math.max(0, Math.min(earned, WEEK.xpCeiling - st.xp));
    C.state.award({ xp: gain }); /* one XP total for the week, so the Ascend moment plays once, over Home */
    C.app.go('home');
    C.ui.toast('Demo week filled · ' + WEEK.togetherHours + ' together hours · unaided ' + WEEK.unaidedScore + ' · agent hours ' + WEEK.agentHours, 4200);
  }

  /* "Trigger Ascend": replays the moment for the current rank. From Stardust it first lifts the demo to Nebula. */
  function triggerAscend() {
    ensureUser();
    var st = C.state.get();
    var prog = C.state.progress();
    var rank = prog.rank;
    if (prog.index === 0) {
      rank = C.data.ranks[1];
      st.xp = Math.max(st.xp, rank.xp);
      st.rank = rank.id;
      if (st.ascended.indexOf(rank.id) < 0) st.ascended.push(rank.id);
      C.state.save();
    }
    var r = C.data.routes.filter(function (x) { return x.id === C.app.current(); })[0];
    if (!r || !r.chrome || prog.index === 0) C.app.go(r && r.chrome ? C.app.current() : 'home');
    ascend(rank, { replay: true });
  }

  return {
    ascend: ascend, react: react, lumen: lumen, growFill: growFill, lastSeen: lastSeen, forget: forget,
    reward: reward, fillWeek: fillWeek, triggerAscend: triggerAscend, still: still
  };
})();
