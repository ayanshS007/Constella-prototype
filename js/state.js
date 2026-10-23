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
      user: { name: 'Arjun', goal: '', visibility: 'counted', womenOnly: false },
      stats: { relating: 1, doing: 1, thinking: 1, persevering: 1 },
      xp: 0,
      rank: 'stardust',
      streak: 0,
      week: { agentHours: 31, assistedScore: 82, unaidedScore: 54, togetherHours: 0.5 },
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

    reset: function () {
      state = seed();
      try { window.localStorage.removeItem(KEY); } catch (e) { /* in-memory only */ }
      return state;
    }
  };
})();
