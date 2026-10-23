/* Constella prototype: router, tab bar, starfield, Demo controls, start-up. */
window.C = window.C || {};

C.app = (function () {
  var el = C.ui.el;
  var routesById = {};
  C.data.routes.forEach(function (r) { routesById[r.id] = r; });

  var DEFAULT_ROUTE = 'welcome';
  var current = null;

  /* ---------- starfield (fixed seed, so it looks the same every time) ---------- */

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeStars(host, count, seed) {
    var rand = mulberry32(seed);
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var size = 1 + rand() * 1.6;
      var dot = document.createElement('i');
      dot.className = 'star' + (rand() < 0.12 ? ' warm' : '');
      dot.style.left = (rand() * 100).toFixed(2) + '%';
      dot.style.top = (rand() * 100).toFixed(2) + '%';
      dot.style.width = dot.style.height = size.toFixed(2) + 'px';
      dot.style.setProperty('--o', (0.35 + rand() * 0.6).toFixed(2));
      dot.style.setProperty('--d', (3 + rand() * 5).toFixed(1) + 's');
      dot.style.animationDelay = (-rand() * 8).toFixed(1) + 's';
      frag.appendChild(dot);
    }
    host.appendChild(frag);
  }

  /* ---------- tab bar ---------- */

  function buildTabbar() {
    var bar = document.getElementById('tabbar');
    bar.textContent = '';
    C.data.tabs.forEach(function (t) {
      bar.appendChild(el('button', {
        class: 'tab', type: 'button', 'data-tab': t.id,
        onclick: function () { go(t.route); }
      },
        el('span', { class: 'tab-icon', html: C.ui.icons[t.id] }),
        el('span', { class: 'tab-label', text: t.label })));
    });
  }

  function markTab(route) {
    var tabs = document.querySelectorAll('#tabbar .tab');
    for (var i = 0; i < tabs.length; i++) {
      var on = tabs[i].getAttribute('data-tab') === route.tab;
      tabs[i].classList.toggle('active', on);
      if (on) tabs[i].setAttribute('aria-current', 'page'); else tabs[i].removeAttribute('aria-current');
    }
  }

  /* ---------- router ---------- */

  function routeFromHash() {
    var id = (location.hash || '').replace(/^#\/?/, '').split('?')[0];
    return routesById[id] ? id : null;
  }

  function go(id) {
    if (routeFromHash() === id) render(id); /* same hash: hashchange would not fire */
    else location.hash = '#/' + id;
  }

  /* keepScroll: redraw the same screen in place (after a Signal, a block, a check-in) without jumping to the top. */
  function render(id, keepScroll) {
    var route = routesById[id] || routesById[DEFAULT_ROUTE];
    var main = document.getElementById('view');
    var top = keepScroll && current === route.id ? main.scrollTop : 0;
    current = route.id;
    if (!keepScroll && C.shield) C.shield.closeNightCard(); /* a new screen never sits under a stale Night Lock card */
    main.textContent = '';
    main.scrollTop = 0;
    try {
      C.screens[route.id](main);
    } catch (e) {
      main.appendChild(el('div', { class: 'panel placeholder', text: 'This screen could not be drawn.' }));
      if (window.console) console.error(e);
    }
    if (top) main.scrollTop = top;
    document.getElementById('phone').classList.toggle('no-chrome', !route.chrome);
    document.title = route.label.split(':')[0] + ' · Constella';
    markTab(route);
    markDemo(route.id);
    if (!keepScroll) try { main.focus({ preventScroll: true }); } catch (e) { /* older browsers */ }
  }

  function onHashChange() {
    var id = routeFromHash();
    if (!id) { location.replace('#/' + DEFAULT_ROUTE); return; }
    if (id !== current) render(id); /* start-up already drew this route */
  }

  /* ---------- motion ---------- */

  function applyMotion() {
    document.body.classList.toggle('still', !!C.state.get().settings.reducedMotion);
  }

  /* ---------- clock ---------- */

  function applyClock() {
    var t = document.getElementById('statusTime');
    if (t) t.textContent = C.state.get().clock;
  }

  function setClock(text) {
    C.state.get().clock = text;
    C.state.save();
    applyClock();
  }

  /* Back to the seed state and the Welcome screen. Used by Reset demo and by Delete everything (S13). */
  function resetAll(message) {
    C.state.reset();
    applyMotion(); applyClock();
    var motion = document.getElementById('motionSwitch');
    if (motion) motion.checked = !C.state.get().settings.reducedMotion;
    if (message) C.ui.toast(message);
    go(DEFAULT_ROUTE);
    closeDemoOnPhone();
  }

  /* ---------- Demo controls ---------- */

  function markDemo(id) {
    var btns = document.querySelectorAll('#demo [data-route]');
    for (var i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute('data-route') === id;
      btns[i].classList.toggle('active', on);
      if (on) btns[i].setAttribute('aria-current', 'true'); else btns[i].removeAttribute('aria-current');
    }
  }

  function buildDemo() {
    var panel = document.getElementById('demo');
    panel.textContent = '';

    var jump = el('div', { class: 'demo-list' });
    C.data.routes.forEach(function (r) {
      jump.appendChild(el('button', {
        class: 'demo-btn', type: 'button', 'data-route': r.id,
        onclick: function () { go(r.id); closeDemoOnPhone(); }
      }, el('span', { class: 'code', text: r.code }), el('span', { text: r.label })));
    });

    var motion = el('input', { type: 'checkbox', id: 'motionSwitch', role: 'switch' });
    motion.checked = !C.state.get().settings.reducedMotion;
    motion.addEventListener('change', function () {
      C.state.get().settings.reducedMotion = !motion.checked;
      C.state.save();
      applyMotion();
      if (current === 'privacy') render('privacy', true); /* its Reduced motion switch follows this one */
    });

    function later(label, milestone) {
      return el('button', {
        class: 'demo-btn action', type: 'button', disabled: true,
        title: 'Arrives in milestone ' + milestone
      }, el('span', { text: label }), el('span', { class: 'code', text: milestone }));
    }

    function action(label, onclick) {
      return el('button', { class: 'demo-btn action', type: 'button', onclick: onclick }, el('span', { text: label }));
    }

    var reset = el('button', {
      class: 'demo-btn danger', type: 'button',
      onclick: function () { resetAll('Demo reset'); }
    }, el('span', { text: 'Reset demo' }));

    panel.appendChild(el('p', { class: 'demo-note', text: 'Demo controls: not part of the app' }));
    panel.appendChild(el('h2', { class: 'demo-h', text: 'Jump to a screen' }));
    panel.appendChild(jump);
    panel.appendChild(el('h2', { class: 'demo-h', text: 'Scenes' }));
    panel.appendChild(el('div', { class: 'demo-list' },
      later('Fill a demo week', 'M7'),
      action('Set time to 11:30 pm', function () { closeDemoOnPhone(); C.shield.setLateTime(); }),
      later('Trigger Ascend', 'M7')));
    panel.appendChild(el('h2', { class: 'demo-h', text: 'Display' }));
    panel.appendChild(el('label', { class: 'demo-switch', for: 'motionSwitch' },
      el('span', { text: 'Motion' }), motion, el('span', { class: 'track', 'aria-hidden': 'true' })));
    panel.appendChild(reset);
  }

  function closeDemoOnPhone() {
    var panel = document.getElementById('demo');
    if (panel.classList.contains('open')) toggleDemo(false);
  }

  function toggleDemo(force) {
    var panel = document.getElementById('demo');
    var btn = document.getElementById('demoToggle');
    var open = typeof force === 'boolean' ? force : !panel.classList.contains('open');
    panel.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.textContent = open ? 'Close' : 'Demo';
  }

  /* ---------- start-up ---------- */

  function start() {
    C.state.load();
    applyMotion();
    applyClock();
    makeStars(document.getElementById('pageStars'), 170, 20400);
    makeStars(document.getElementById('phoneStars'), 70, 7731);
    buildTabbar();
    buildDemo();
    document.getElementById('demoToggle').addEventListener('click', function () { toggleDemo(); });
    window.addEventListener('hashchange', onHashChange);
    if (!routeFromHash()) location.replace('#/' + DEFAULT_ROUTE); /* replace keeps Back from landing on an empty hash */
    render(routeFromHash() || DEFAULT_ROUTE);
  }

  /* Scripts are loaded with defer, so the DOM is ready by the time this runs. */
  start();

  return { go: go, render: render, current: function () { return current; }, toggleDemo: toggleDemo, setClock: setClock, applyMotion: applyMotion, resetAll: resetAll };
})();
