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
      crew: { name: 'Northgate Orbit' },
      constellation: { stars: [], lines: [] },
      exchange: { taught: 1.0, learned: 0.5 },
      limits: { shieldOn: false, budget: 3, windows: [], nightLockOn: false, nightTime: '23:00', coolingUntil: 0 },
      completed: { quests: 0, flights: 0, missions: [] },
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
