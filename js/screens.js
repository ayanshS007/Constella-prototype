/* Constella prototype: one render function per screen. Each takes the <main> element.
   In M1 every screen is a labelled placeholder so the router, tab bar and Demo controls can be checked;
   later milestones replace these one by one. */
window.C = window.C || {};

C.screens = (function () {
  var el = C.ui.el;

  var milestone = {
    welcome: 'M2', onboarding: 'M2', home: 'M2',
    map: 'M3', crew: 'M3', shootingstar: 'M3',
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
          el('p', { text: 'This screen is built in milestone ' + (milestone[route.id] || 'M2') + '.' }),
          el('p', { class: 'dim', text: 'The shell around it (frame, starfield, tab bar, router, Demo controls) is live.' }))));
    };
  }

  var screens = {};
  C.data.routes.forEach(function (r) { screens[r.id] = placeholder(r); });
  return screens;
})();
