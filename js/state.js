/* Constella prototype: state, save and load. localStorage is optional; every access is guarded. */
window.C = window.C || {};

(function () {
  var KEY = 'constella-prototype-v1';

  function prefersReducedMotion() {
    try {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) {
      return false;
    }
  }

  /* The seed state. Fields beyond the shell are filled in by later milestones. */
  function seed() {
    return {
      onboarded: false,
      user: { name: 'Arjun', goal: '', visibility: 'counted', womenOnly: false },
      stats: { relating: 1, doing: 1, thinking: 1, persevering: 1 },
      xp: 0,
      rank: 'stardust',
      streak: 0,
      streakPaused: false, /* a missed day pauses the streak; it never drops to zero */
      activityToday: 0, /* agent-free reps today; Lumen brightens when this is above 0 */
      week: { agentHours: 31, assistedScore: 82, unaidedScore: 54, togetherHours: 0.5 },
      lastWeek: { agentHours: 33, assistedScore: 81, unaidedScore: 51, togetherHours: 0 }, /* for Your Echo */
      statPoints: { relating: 0, doing: 0, thinking: 0, persevering: 0 }, /* progress toward the next level of each stat */
      crew: {
        name: 'Northgate Orbit',
        checkedIn: false, /* this meet-up has been confirmed by a two-sided code check */
        scanned: [], /* crew members whose code you have scanned at this meet-up */
        blocked: [], reported: [],
        signalsOpened: [], /* ids of received Signals opened with the person check */
        signalReplies: [], /* [{ id, reply }]; arrays survive a save and load, empty objects would not */
        signalsSent: [] /* [{ to, plan, note }] */
      },
      people: { chatVerified: false, going: [], joinAsked: [] }, /* Star Map and Shooting Star choices */
      constellation: { stars: [], lines: [] }, /* stars: { id, name, note }; lines: { to, label } drawn from you */
      exchange: { taught: 1.0, learned: 0.5 },
      limits: { shieldOn: false, budget: 3, windows: [], nightLockOn: false, nightTime: '23:00', coolingUntil: 0 },
      completed: { quests: 0, flights: 0, simulators: 0, missions: [] },
      train: {
        questDay: '', /* local date (yyyy-mm-dd) of the last Daily Quest; one quest earns XP per day */
        pending: [], /* [{ id, skill, mark }] Solo Flight papers sent for peer marking */
        nudged: [], /* Star Chart question ids that already nudged Persevering, so it cannot be farmed */
        published: [] /* [{ title, licence }] chapters offered for peer review */
      },
      settings: { reducedMotion: prefersReducedMotion() },
      clock: '9:41'
    };
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* Merge saved values over the seed so a stale save never leaves a field missing. */
  function merge(base, saved) {
    if (!saved || typeof saved !== 'object') return base;
    Object.keys(base).forEach(function (k) {
      if (!(k in saved)) return;
      var b = base[k], s = saved[k];
      if (b && typeof b === 'object' && !Array.isArray(b)) {
        base[k] = merge(b, s);
      } else if (typeof s === typeof b) {
        base[k] = s;
      }
    });
    return base;
  }

  var state = seed();

  /* Prototype values (Section 7). Time in the app earns nothing. */
  var LEVEL_POINTS = 60; /* prototype value: XP-event points needed for +1 on a stat */
  var XP = { quest: 20, flight: 30, simulator: 40, meetingHour: 50, teachingHour: 60, mission: 80, appTime: 0 };

  /* The rank for an XP total. Supernova also needs the teaching hours. */
  function rankFor(xp, taught) {
    var ranks = C.data.ranks, found = ranks[0];
    for (var i = 0; i < ranks.length; i++) {
      var r = ranks[i];
      if (xp >= r.xp && (!r.teachingHours || taught >= r.teachingHours)) found = r;
    }
    return found;
  }

  C.state = {
    get: function () { return state; },

    save: function () {
      try {
        window.localStorage.setItem(KEY, JSON.stringify(state));
        return true;
      } catch (e) {
        return false; /* blocked or full: keep state in memory */
      }
    },

    load: function () {
      try {
        var raw = window.localStorage.getItem(KEY);
        if (raw) state = merge(seed(), JSON.parse(raw));
      } catch (e) {
        state = seed();
      }
      return state;
    },

    XP: XP,

    rankFor: rankFor,

    /* Current rank, the next one, and how far along the XP bar the user is (0 to 1). */
    progress: function () {
      var ranks = C.data.ranks;
      var cur = rankFor(state.xp, state.exchange.taught);
      var idx = ranks.indexOf(cur);
      var next = ranks[idx + 1] || null;
      var span = next ? next.xp - cur.xp : 1;
      return {
        rank: cur, index: idx, next: next,
        fraction: next ? Math.max(0, Math.min(1, (state.xp - cur.xp) / span)) : 1,
        needsTeaching: !!(next && next.teachingHours && state.exchange.taught < next.teachingHours)
      };
    },

    /* One reward for agent-free practice or a confirmed meeting. Time in the app never calls this.
       opts: { xp, stat, together (hours), points (stat points when they differ from xp, e.g. a struggle timer with no XP) }. Returns { rankedUp: rank or null } so the game layer (M7) can play Ascend. */
    award: function (opts) {
      var before = rankFor(state.xp, state.exchange.taught);
      state.xp += opts.xp || 0;
      if (opts.together) state.week.togetherHours = Math.round((state.week.togetherHours + opts.together) * 10) / 10;
      if (opts.stat && state.stats[opts.stat] !== undefined) {
        state.statPoints[opts.stat] += opts.points !== undefined ? opts.points : (opts.xp || 0);
        while (state.statPoints[opts.stat] >= LEVEL_POINTS && state.stats[opts.stat] < 10) {
          state.statPoints[opts.stat] -= LEVEL_POINTS;
          state.stats[opts.stat]++;
        }
      }
      state.activityToday++;
      var after = rankFor(state.xp, state.exchange.taught);
      state.rank = after.id;
      C.state.save();
      return { rankedUp: after !== before ? after : null };
    },

    /* The end of the Awakening: save the choices and the starting stat levels. XP stays at 0. */
    finishAwakening: function (result) {
      state.user.name = result.name;
      state.user.goal = result.goal;
      state.user.visibility = result.visibility;
      state.user.womenOnly = result.womenOnly;
      state.stats = result.stats;
      state.xp = 0;
      state.rank = 'stardust';
      state.activityToday = Math.max(state.activityToday, 1); /* the Awakening is an agent-free rep */
      state.onboarded = true;
      C.state.save();
    },

    reset: function () {
      state = seed();
      try { window.localStorage.removeItem(KEY); } catch (e) { /* in-memory only */ }
      return state;
    }
  };
})();
