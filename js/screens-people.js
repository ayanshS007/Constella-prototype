/* Constella prototype, M3 "People": S3 Star Map (with the cluster chat), S4 Crew (Signals, code check-in,
   report and block) and S9 Shooting Star. Plain script: adds its screens to C.screens and shares helpers on C.people. */
window.C = window.C || {};

C.people = (function () {
  var el = C.ui.el;
  var icons = C.ui.icons;
  var H = C.helpers;
  var D = C.data;

  /* ---------- small shared helpers ---------- */

  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function initial(name) { return (name || '?').charAt(0).toUpperCase(); }

  function avatar(name, color, size) {
    var a = el('span', { class: 'avatar c-' + (color || 'violet'), 'aria-hidden': 'true', text: initial(name) });
    if (size) { a.style.width = a.style.height = size + 'px'; a.style.fontSize = Math.round(size * 0.42) + 'px'; }
    return a;
  }

  function sheetButtons() { return el('div', { class: 'sheet-actions' }); }

  /* The crew members, with the user first. Blocked members stay in the list but are marked. */
  function crewMembers() {
    var st = C.state.get();
    var me = { id: 'you', name: st.user.name || 'You', color: 'gold', line: 'That is you', me: true };
    return [me].concat(D.crew.members);
  }

  /* ---------- the hold-to-confirm person check ----------
     Hold the button for opts.seconds. Pointer, touch and keyboard (Space or Enter) all work.
     Nothing is read from the user: it only proves a person is pressing. */
  function personCheck(opts) {
    var secs = opts.seconds || 2;
    var label = opts.label || 'Hold for ' + secs + ' seconds';
    var fill = el('span', { class: 'hold-fill', 'aria-hidden': 'true' });
    var text = el('span', { class: 'hold-text', text: label });
    var live = el('p', { class: 'small dim hold-live', 'aria-live': 'polite' });
    var btn = el('button', {
      class: 'hold', type: 'button',
      'aria-label': 'Person check. Press and hold for ' + secs + ' seconds to confirm you are a person.'
    }, fill, text);
    var wrap = el('div', { class: 'person-check' }, btn, live);
    var t0 = 0, timer = null, done = false;

    function reset() {
      if (timer) { clearInterval(timer); timer = null; }
      t0 = 0;
      fill.style.width = '0%';
      btn.classList.remove('holding');
    }

    function finish() {
      done = true;
      reset();
      fill.style.width = '100%';
      btn.classList.add('done');
      btn.disabled = true;
      text.textContent = 'Confirmed: you are a person';
      live.textContent = 'Person check passed.';
      if (opts.onDone) setTimeout(opts.onDone, 450);
    }

    function start() {
      if (done || t0) return;
      t0 = Date.now();
      btn.classList.add('holding');
      live.textContent = '';
      timer = setInterval(function () {
        if (!document.body.contains(btn)) { reset(); return; }
        var p = (Date.now() - t0) / (secs * 1000);
        if (p >= 1) finish(); else fill.style.width = (p * 100).toFixed(1) + '%';
      }, 30);
    }

    function stop() {
      if (done || !t0) return;
      reset();
      live.textContent = 'Let go too early. Hold again for ' + secs + ' seconds.';
    }

    btn.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return;
      try { btn.setPointerCapture(e.pointerId); } catch (err) { /* not needed */ }
      start();
    });
    btn.addEventListener('pointerup', stop);
    btn.addEventListener('pointercancel', stop);
    btn.addEventListener('lostpointercapture', stop);
    btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    btn.addEventListener('keydown', function (e) {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); start(); }
    });
    btn.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') stop(); });
    btn.addEventListener('blur', stop);
    return wrap;
  }

  /* A generated square pattern, mirrored like an identicon. It is not a real QR code and says so. */
  function codePattern(seedText) {
    var n = 9, h = 2166136261;
    for (var i = 0; i < seedText.length; i++) { h ^= seedText.charCodeAt(i); h = Math.imul(h, 16777619); }
    function rand() { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1000) / 1000; }
    var cells = '';
    for (var y = 0; y < n; y++) {
      for (var x = 0; x < (n + 1) / 2; x++) {
        if (rand() < 0.5) {
          cells += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>';
          if (x !== n - 1 - x) cells += '<rect x="' + (n - 1 - x) + '" y="' + y + '" width="1" height="1"/>';
        }
      }
    }
    /* Four star-shaped corner marks, so it cannot be mistaken for a QR code */
    var marks = [[0, 0], [n - 2, 0], [0, n - 2], [n - 2, n - 2]].map(function (p) {
      return '<circle cx="' + (p[0] + 1) + '" cy="' + (p[1] + 1) + '" r="0.95" fill="#F5C451"/>';
    }).join('');
    var node = el('span', { class: 'code-pattern', role: 'img', 'aria-label': 'Your meet-up code, a generated pattern for the demo' });
    node.innerHTML = '<svg viewBox="-0.5 -0.5 ' + (n + 1) + ' ' + (n + 1) + '" focusable="false"><rect x="-0.5" y="-0.5" width="' + (n + 1) + '" height="' + (n + 1) + '" rx="1" fill="#EEF1FF"/><g fill="#1B1745">' + cells + '</g>' + marks + '</svg>';
    return node;
  }

  /* ---------- the demo clock, for Shooting Star ---------- */

  function clockMinutes() {
    var m = /^(\d{1,2}):(\d{2})\s*(am|pm)?$/i.exec(C.state.get().clock || '9:41');
    if (!m) return 9 * 60 + 41;
    var hr = parseInt(m[1], 10) % 12, min = parseInt(m[2], 10);
    var pm = m[3] ? m[3].toLowerCase() === 'pm' : parseInt(m[1], 10) >= 12;
    return (hr + (pm ? 12 : 0)) * 60 + min;
  }

  function timeText(total) {
    total = ((total % 1440) + 1440) % 1440;
    var hr = Math.floor(total / 60), min = total % 60;
    var h12 = hr % 12 === 0 ? 12 : hr % 12;
    return h12 + ':' + (min < 10 ? '0' : '') + min + (hr < 12 ? ' am' : ' pm');
  }

  /* ======================================================================
     S3 Star Map
     ====================================================================== */

  var GOAL_COLOR = { exam: '#8B6CFF', language: '#6FB7FF', instrument: '#F5C451', job: '#FF8A5C', code: '#2ED3C0', cook: '#E25BC9', fit: '#CFE3FF' };
  var NS = 'http://www.w3.org/2000/svg';
  var view = { filter: 'all', hood: null }; /* kept while the app is open */
  var chatLogs = {}; /* messages the user types, per cluster; they stay in memory only */

  function hoodGeometry() {
    var g = D.map.grid;
    return D.map.hoods.map(function (h) {
      var r = h.cell[0], c = h.cell[1];
      var pts = [g[r][c], g[r][c + 1], g[r + 1][c + 1], g[r + 1][c]];
      var cx = 0, cy = 0;
      pts.forEach(function (p) { cx += p[0] / 4; cy += p[1] / 4; });
      return { id: h.id, name: h.name, pts: pts, cx: cx, cy: cy };
    });
  }
  var HOODS = hoodGeometry();

  function hood(id) { return byId(HOODS, id); }

  function clusterPos(c) {
    var h = hood(c.hood);
    return { x: h.cx + c.dx, y: h.cy + c.dy };
  }

  function homePos() {
    var h = hood(D.map.home.hood);
    return { x: h.cx + D.map.home.dx, y: h.cy + D.map.home.dy };
  }

  /* The clusters on screen for the current view: women-only or open, and the goal chip. Always 5 or more people. */
  function visibleClusters() {
    var st = C.state.get();
    return D.map.clusters.filter(function (c) {
      if (c.count < 5) return false; /* never drawn */
      if (c.women !== st.user.womenOnly) return false;
      return view.filter === 'all' || c.goal === view.filter;
    });
  }

  /* The cluster the user belongs to: the nearest one for their goal in this view. */
  function myCluster() {
    var st = C.state.get();
    if (!st.user.goal || st.user.visibility === 'hidden') return null;
    var me = homePos(), best = null, bestD = 1e9;
    D.map.clusters.forEach(function (c) {
      if (c.goal !== st.user.goal || c.women !== st.user.womenOnly) return;
      var p = clusterPos(c), d = Math.hypot(p.x - me.x, p.y - me.y);
      if (d < bestD) { bestD = d; best = c; }
    });
    return best;
  }

  /* People counted in a cluster. Counted-only and Visible both add one; Hidden adds nobody. */
  function shownCount(c) {
    var mine = myCluster();
    return c.count + (mine && mine.id === c.id ? 1 : 0);
  }

  function svgEl(name, attrs) {
    var n = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    for (var i = 2; i < arguments.length; i++) if (arguments[i]) n.appendChild(arguments[i]);
    return n;
  }

  function seeded(seedText) {
    var h = 2166136261;
    for (var i = 0; i < seedText.length; i++) { h ^= seedText.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
  }

  function visLine(vis) {
    if (vis === 'visible') return 'Your first name and goal show in your cluster.';
    if (vis === 'counted') return 'You add 1 to your cluster’s count. Your name stays private.';
    return 'You are not shown or counted.';
  }

  function visLabel(vis) { return byId(D.visibility, vis).label; }

  function drawMap(host, onPick) {
    var st = C.state.get();
    var mine = myCluster();
    var svg = svgEl('svg', {
      viewBox: '0 0 360 408', class: 'map-svg', role: 'group',
      'aria-label': 'Map of ' + D.city.name + ' with clusters of five or more people'
    });
    var defs = svgEl('defs');
    Object.keys(GOAL_COLOR).forEach(function (g) {
      var grad = svgEl('radialGradient', { id: 'glow-' + g });
      grad.appendChild(svgEl('stop', { offset: '0', 'stop-color': GOAL_COLOR[g], 'stop-opacity': '0.75' }));
      grad.appendChild(svgEl('stop', { offset: '0.55', 'stop-color': GOAL_COLOR[g], 'stop-opacity': '0.28' }));
      grad.appendChild(svgEl('stop', { offset: '1', 'stop-color': GOAL_COLOR[g], 'stop-opacity': '0' }));
      defs.appendChild(grad);
    });
    var ringGrad = svgEl('radialGradient', { id: 'glow-me' });
    ringGrad.appendChild(svgEl('stop', { offset: '0.6', 'stop-color': '#EEF1FF', 'stop-opacity': '0' }));
    ringGrad.appendChild(svgEl('stop', { offset: '0.9', 'stop-color': '#EEF1FF', 'stop-opacity': '0.35' }));
    ringGrad.appendChild(svgEl('stop', { offset: '1', 'stop-color': '#EEF1FF', 'stop-opacity': '0' }));
    defs.appendChild(ringGrad);
    svg.appendChild(defs);

    /* Neighbourhoods: faint polygons and labels */
    HOODS.forEach(function (h) {
      var poly = svgEl('polygon', {
        class: 'hood' + (view.hood === h.id ? ' picked' : ''),
        points: h.pts.map(function (p) { return p.join(','); }).join(' ')
      });
      poly.addEventListener('click', function () { view.hood = h.id; onPick(null, h); });
      svg.appendChild(poly);
    });
    svg.appendChild(svgEl('path', { class: 'river', d: 'M296 14 C 286 88, 250 130, 282 204 S 300 312, 268 396' }));
    HOODS.forEach(function (h) {
      var t = svgEl('text', { class: 'hood-name', x: h.cx, y: h.cy - 50 - (h.id === 'northgate' ? 0 : 0), 'text-anchor': 'middle' });
      t.textContent = h.name;
      svg.appendChild(t);
    });

    /* Clusters: glowing groups sized by count */
    var shown = visibleClusters();
    shown.forEach(function (c) {
      var p = clusterPos(c), n = shownCount(c);
      var r = 10 + Math.sqrt(n) * 2.3;
      var isMine = mine && mine.id === c.id;
      var g = svgEl('g', {
        class: 'cluster' + (isMine ? ' mine' : ''), tabindex: '-1',
        transform: 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')'
      });
      g.appendChild(svgEl('circle', { class: 'cl-glow', r: (r * 1.7).toFixed(1), fill: 'url(#glow-' + c.goal + ')' }));
      var rand = seeded(c.id);
      for (var i = 0; i < Math.min(14, 4 + Math.round(n / 5)); i++) {
        var a = rand() * Math.PI * 2, d = (0.55 + rand() * 0.95) * r;
        g.appendChild(svgEl('circle', { class: 'cl-dot', cx: (Math.cos(a) * d).toFixed(1), cy: (Math.sin(a) * d).toFixed(1), r: (0.9 + rand() * 1.3).toFixed(1), fill: GOAL_COLOR[c.goal] }));
      }
      g.appendChild(svgEl('circle', { class: 'cl-core', r: '10.5', fill: '#EEF1FF' }));
      var label = svgEl('text', { class: 'cl-count', y: '4', 'text-anchor': 'middle' });
      label.textContent = String(n);
      g.appendChild(label);
      g.appendChild(svgEl('circle', { class: 'cl-ring', r: (r * 0.95 + 4).toFixed(1) }));
      /* Big invisible target, at least 44 px across */
      var hit = svgEl('circle', { class: 'cl-hit', r: Math.max(22, r + 4) });
      hit.addEventListener('click', function (e) { e.stopPropagation(); view.hood = c.hood; onPick(c, hood(c.hood)); });
      g.appendChild(hit);
      svg.appendChild(g);
    });

    /* You: a soft ring in a rough area, never a pin */
    var me = homePos();
    var ring = svgEl('g', { class: 'me' + (st.user.visibility === 'hidden' ? ' hidden' : ''), transform: 'translate(' + me.x.toFixed(1) + ' ' + me.y.toFixed(1) + ')' });
    ring.appendChild(svgEl('circle', { r: '17', fill: 'url(#glow-me)' }));
    ring.appendChild(svgEl('circle', { class: 'me-ring', r: '11' }));
    var mt = svgEl('text', { class: 'me-text', y: '-18', 'text-anchor': 'middle' });
    mt.textContent = 'You';
    ring.appendChild(mt);
    svg.appendChild(ring);

    host.textContent = '';
    host.appendChild(svg);
  }

  /* ----- the bottom sheet for one cluster ----- */

  function openCluster(c, redraw) {
    var st = C.state.get();
    var mine = myCluster();
    var isMine = mine && mine.id === c.id;
    var n = shownCount(c);
    var names = c.people.map(function (p) { return { name: p[0], focus: p[1] }; });
    if (isMine && st.user.visibility === 'visible') names.unshift({ name: st.user.name, focus: H.goalLabel(st.user.goal), me: true });
    names = names.slice(0, 6);
    var body = el('div', { class: 'cl-sheet' });
    var sheet = null;

    body.appendChild(el('p', { class: 'cl-meta' },
      el('span', { class: 'cl-goal', html: icons[byId(D.goals, c.goal).icon] }),
      el('span', {},
        el('strong', { text: H.goalLabel(c.goal) }),
        el('br'),
        el('span', { class: 'dim', text: hood(c.hood).name + ' · ' + n + ' people nearby' + (c.women ? ' · Women-only cluster' : '') }))));
    if (isMine) {
      body.appendChild(el('p', { class: 'small teal-text', text: 'This is your cluster. ' + visLine(st.user.visibility) }));
    }
    body.appendChild(el('h3', { class: 'sheet-sub', text: 'Who shows their name' }));
    var list = el('ul', { class: 'names' });
    names.forEach(function (p, i) {
      list.appendChild(el('li', { class: 'name-row' },
        avatar(p.name, ['violet', 'teal', 'magenta', 'sky', 'ember', 'gold'][i % 6]),
        el('span', { class: 'name-text' },
          el('span', { class: 'name-first', text: p.me ? p.name + ' (you)' : p.name }),
          el('span', { class: 'small dim', text: p.focus }))));
    });
    body.appendChild(list);
    body.appendChild(el('p', { class: 'small dim', text: 'Only people set to Visible are named. The other ' + Math.max(0, n - names.length) + ' are counted only. Groups under 5 are never shown.' }));

    var actions = sheetButtons();
    actions.appendChild(H.button('Open the cluster chat', 'primary', function () { sheet.close(); openChat(c); }, { icon: icons.next }));
    var asked = C.state.get().people.joinAsked.indexOf(c.id) >= 0;
    var joinBtn = H.button(asked ? 'Request sent' : 'Ask to join a crew', 'ghost', function () {
      var s = C.state.get();
      if (s.people.joinAsked.indexOf(c.id) < 0) s.people.joinAsked.push(c.id);
      C.state.save();
      joinBtn.textContent = 'Request sent';
      joinBtn.disabled = true;
      C.ui.toast('Request sent. A person in the crew will answer it.');
    }, { disabled: asked });
    actions.appendChild(joinBtn);
    body.appendChild(actions);
    sheet = C.ui.modal(H.goalLabel(c.goal), body);
  }

  /* ----- how you appear (the S1 choice, again) ----- */

  function openPrivacy(redraw) {
    var st = C.state.get();
    var sheet = null;
    var list = el('div', { class: 'choice-list', role: 'radiogroup', 'aria-label': 'How you appear on the Star Map' });
    D.visibility.forEach(function (v) {
      var input = el('input', { type: 'radio', name: 'mapvis', value: v.id, checked: st.user.visibility === v.id });
      input.addEventListener('change', function () {
        st.user.visibility = v.id;
        C.state.save();
        redraw();
        C.ui.toast('Star Map: ' + v.label);
      });
      list.appendChild(el('label', { class: 'choice' }, input,
        el('span', { class: 'choice-face' },
          el('span', { class: 'choice-text' },
            el('span', { class: 'choice-title', text: v.label }),
            el('span', { class: 'choice-line', text: v.line })),
          el('span', { class: 'choice-tick', 'aria-hidden': 'true', html: icons.check }))));
    });
    var body = el('div', { class: 'stack' }, list, H.button('Done', 'primary', function () { sheet.close(); }));
    sheet = C.ui.modal('How you appear on the Star Map', body);
  }

  /* ----- the cluster chat ----- */

  function openChat(c) {
    var st = C.state.get();
    var host = document.getElementById('overlayHost');
    if (!host) return;
    var opener = document.activeElement;
    var people = c.people.map(function (p) { return p[0]; });
    var scripted = (D.map.chat[c.goal] || []).map(function (m, i) {
      return { who: people[m[0] % people.length], text: m[1], time: D.map.chatTimes[i] || '' };
    });
    var mine = chatLogs[c.id] || (chatLogs[c.id] = []);
    var root = el('div', { class: 'fullsheet chat', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Cluster chat: ' + H.goalLabel(c.goal) + ', ' + hood(c.hood).name });

    function close() {
      if (root.parentNode) root.parentNode.removeChild(root);
      document.removeEventListener('keydown', onKey);
      if (opener && opener.focus && document.body.contains(opener)) opener.focus();
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);

    var backBtn = el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Close the chat', html: icons.back, onclick: close });
    root.appendChild(el('header', { class: 'chat-head' }, backBtn,
      el('div', { class: 'chat-title' },
        el('h2', { text: H.goalLabel(c.goal) }),
        el('p', { class: 'small dim', text: hood(c.hood).name + ' · ' + shownCount(c) + ' people' + (c.women ? ' · Women-only' : '') }))));
    root.appendChild(el('p', { class: 'chat-strip', role: 'note' },
      el('span', { html: icons.lock }), el('span', { text: 'People only. Agents can’t join this chat.' })));

    var body = el('div', { class: 'chat-body' });
    root.appendChild(body);
    host.appendChild(root);
    backBtn.focus();

    function bubbles(list, log) {
      list.textContent = '';
      list.appendChild(el('p', { class: 'chat-day small dim', text: 'Today' }));
      scripted.forEach(function (m) {
        list.appendChild(el('div', { class: 'msg' },
          avatar(m.who, 'violet', 30),
          el('div', { class: 'msg-bubble' },
            el('p', { class: 'msg-who small' }, el('strong', { text: m.who }), el('span', { class: 'dim', text: ' · ' + m.time })),
            el('p', { text: m.text }))));
      });
      mine.forEach(function (m) {
        list.appendChild(el('div', { class: 'msg me' },
          el('div', { class: 'msg-bubble' },
            el('p', { class: 'msg-who small' }, el('strong', { text: st.user.name || 'You' }), el('span', { class: 'dim', text: ' · ' + m.time })),
            el('p', { text: m.text }))));
      });
      log.scrollTop = log.scrollHeight;
    }

    function showChat() {
      body.textContent = '';
      var log = el('div', { class: 'chat-log', tabindex: '0', role: 'log', 'aria-label': 'Messages' });
      var list = el('div', { class: 'chat-list' });
      log.appendChild(list);
      var input = el('input', {
        class: 'field', type: 'text', maxlength: '240', placeholder: 'Write to the cluster',
        autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Your message'
      });
      var send = el('button', { class: 'btn primary compact', type: 'submit', 'aria-label': 'Send' }, el('span', { class: 'btn-ic', html: icons.send }));
      var form = el('form', { class: 'composer' }, input, send);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var t = input.value.trim();
        if (!t) return;
        mine.push({ text: t, time: 'now' });
        input.value = '';
        bubbles(list, log);
        input.focus();
      });
      body.appendChild(log);
      body.appendChild(el('p', { class: 'chat-note small dim', text: 'Messages stay on this phone in the prototype.' }));
      body.appendChild(form);
      bubbles(list, log);
      input.focus();
    }

    if (st.people.chatVerified) {
      showChat();
    } else {
      body.appendChild(el('div', { class: 'gate' },
        C.ui.lumen({ size: 72, mood: 'calm' }),
        el('h3', { text: 'Quick person check' }),
        el('p', { class: 'dim', text: 'This chat is for people only. Hold the button for 2 seconds to come in. You only do this once.' }),
        personCheck({
          seconds: 2, label: 'Hold the button for 2 seconds',
          onDone: function () { st.people.chatVerified = true; C.state.save(); showChat(); }
        })));
    }
  }

  /* ----- the screen ----- */

  function map(main) {
    var st = C.state.get();
    var root = el('section', { class: 'screen map' });
    main.appendChild(root);

    var mapHost = el('div', { class: 'panel map-panel' });
    var info = el('p', { class: 'map-info small', 'aria-live': 'polite' });
    var listHost = el('div', { class: 'cl-list' });
    var privChip = el('button', { class: 'chip', type: 'button', onclick: function () { openPrivacy(redraw); } });
    var womenChip = el('button', { class: 'chip', type: 'button', role: 'switch', onclick: function () {
      st.user.womenOnly = !st.user.womenOnly;
      C.state.save();
      redraw();
      C.ui.toast(st.user.womenOnly ? 'Women-only view is on' : 'Women-only view is off');
    } });
    var chipHost = el('div', { class: 'chips', role: 'group', 'aria-label': 'Filter by goal' });

    root.appendChild(el('header', { class: 'map-head' },
      el('div', {},
        el('p', { class: 'eyebrow', text: D.city.name }),
        el('h1', { text: 'Star Map' })),
      el('button', { class: 'pill shoot', type: 'button', onclick: function () { C.app.go('shootingstar'); } },
        el('span', { html: icons.shoot }), el('span', { text: 'Shooting Star' }))));
    root.appendChild(el('div', { class: 'chips wrap' }, privChip, womenChip));
    root.appendChild(el('p', { class: 'small dim vis-line', id: 'visLine' }));
    root.appendChild(chipHost);
    root.appendChild(mapHost);
    root.appendChild(info);
    root.appendChild(listHost);

    function pick(c, h) {
      if (c) { openCluster(c, redraw); return; }
      var inHood = visibleClusters().filter(function (x) { return x.hood === h.id; });
      info.textContent = inHood.length
        ? h.name + ': ' + inHood.length + (inHood.length === 1 ? ' cluster' : ' clusters') + ' in view.'
        : h.name + ': Fewer than 5 nearby: hidden for privacy.';
      drawMap(mapHost, pick);
    }

    function drawChips() {
      chipHost.textContent = '';
      var all = [{ id: 'all', label: 'All goals' }].concat(D.goals);
      all.forEach(function (g) {
        chipHost.appendChild(el('button', {
          class: 'chip' + (view.filter === g.id ? ' on' : ''), type: 'button', 'aria-pressed': view.filter === g.id ? 'true' : 'false',
          onclick: function () { view.filter = g.id; view.hood = null; info.textContent = ''; redraw(); }
        }, g.icon ? el('span', { class: 'chip-ic', html: icons[g.icon] }) : null, el('span', { text: g.label })));
      });
    }

    function redraw() {
      privChip.textContent = '';
      privChip.appendChild(el('span', { class: 'chip-ic', html: icons.eye }));
      privChip.appendChild(el('span', { text: 'On the map: ' + visLabel(st.user.visibility) }));
      privChip.setAttribute('aria-haspopup', 'dialog');
      womenChip.textContent = '';
      womenChip.appendChild(el('span', { class: 'chip-ic', html: icons.crew }));
      womenChip.appendChild(el('span', { text: 'Women-only: ' + (st.user.womenOnly ? 'On' : 'Off') }));
      womenChip.setAttribute('aria-checked', st.user.womenOnly ? 'true' : 'false');
      womenChip.classList.toggle('on', st.user.womenOnly);
      document.getElementById('visLine').textContent = visLine(st.user.visibility);
      drawChips();
      drawMap(mapHost, pick);

      var shown = visibleClusters();
      listHost.textContent = '';
      listHost.appendChild(el('h2', { class: 'section-h', text: 'Clusters in view' + (shown.length ? ' (' + shown.length + ')' : '') }));
      if (!shown.length) {
        listHost.appendChild(el('div', { class: 'panel privacy-empty' },
          el('span', { class: 'card-ic violet', html: icons.lock }),
          el('div', { class: 'card-body' },
            el('h3', { text: 'Fewer than 5 nearby' }),
            el('p', { class: 'small dim', text: 'Hidden for privacy. A group only appears on the map when it has 5 or more people.' }))));
      } else {
        shown.slice().sort(function (a, b) { return b.count - a.count; }).forEach(function (c) {
          listHost.appendChild(el('button', { class: 'cl-item panel', type: 'button', onclick: function () { openCluster(c, redraw); } },
            el('span', { class: 'cl-goal', html: icons[byId(D.goals, c.goal).icon] }),
            el('span', { class: 'cl-item-text' },
              el('span', { class: 'cl-item-title', text: H.goalLabel(c.goal) }),
              el('span', { class: 'small dim', text: hood(c.hood).name + ' · ' + shownCount(c) + ' people' + (c.women ? ' · Women-only' : '') })),
            el('span', { class: 'more-go', html: icons.next })));
        });
      }
      listHost.appendChild(el('p', { class: 'small dim', text: 'Groups of fewer than 5 are never drawn or counted. Tap a neighbourhood on the map to check one.' }));
    }
    redraw();
  }

  /* ======================================================================
     S4 Crew
     ====================================================================== */

  function memberName(id) {
    var m = byId(crewMembers(), id);
    return m ? m.name : 'A member';
  }

  function isBlocked(id) { return C.state.get().crew.blocked.indexOf(id) >= 0; }

  /* The two-sided scan. Also used by Landing Missions in a later milestone: pass onConfirmed to react. */
  function openScan(opts) {
    opts = opts || {};
    var st = C.state.get();
    var crew = st.crew;
    var candidates = D.crew.members.filter(function (m) { return !isBlocked(m.id) && crew.scanned.indexOf(m.id) < 0; });
    var body = el('div', { class: 'scan' });
    var sheet = null;
    if (!candidates.length) {
      body.appendChild(el('p', { class: 'dim', text: 'You have scanned everyone who is here and not blocked.' }));
      body.appendChild(H.button('Close', 'ghost', function () { sheet.close(); }));
      sheet = C.ui.modal('Scan a crew member’s code', body);
      return;
    }
    var who = candidates[0];
    var steps = el('ol', { class: 'scan-steps' });
    var step1 = el('li', { class: 'scan-step' }, el('span', { class: 'tick', 'aria-hidden': 'true' }), el('span', { text: who.name + ' scans your code' }));
    var step2 = el('li', { class: 'scan-step' }, el('span', { class: 'tick', 'aria-hidden': 'true' }), el('span', { text: 'You scan ' + who.name + '’s code' }));
    steps.appendChild(step1);
    steps.appendChild(step2);
    var finder = el('div', { class: 'finder', 'aria-hidden': 'true' }, el('i', { class: 'sweep' }), avatar(who.name, who.color, 54));
    body.appendChild(finder);
    body.appendChild(el('p', { class: 'center', text: 'Hold your phone near ' + who.name + '’s code.' }));
    body.appendChild(steps);
    body.appendChild(el('p', { class: 'small dim center', text: 'Demo: the scan is simulated. A real meeting needs both people’s phones.' }));
    sheet = C.ui.modal('Scan a crew member’s code', body);

    function tick(node) { node.classList.add('ok'); node.setAttribute('aria-label', 'Done'); }
    setTimeout(function () { tick(step1); }, 700);
    setTimeout(function () { tick(step2); }, 1400);
    setTimeout(function () {
      sheet.close();
      confirmMeeting(who);
      if (opts.onConfirmed) opts.onConfirmed(who);
    }, 1900);
  }

  /* A confirmed meeting adds together hours and a Constellation line. Hours count once per meet-up. */
  function confirmMeeting(who) {
    var st = C.state.get();
    var m = D.crew.nextMeetup;
    var first = !st.crew.checkedIn;
    st.crew.scanned.push(who.id);
    if (!byId(st.constellation.stars, who.id)) st.constellation.stars.push({ id: who.id, name: who.name, note: 'Met at ' + m.place });
    st.constellation.lines.push({ to: who.id, label: 'Met at ' + m.place + ', ' + m.when });
    if (first) {
      st.crew.checkedIn = true;
      C.state.award({ xp: Math.round(C.state.XP.meetingHour * m.hours), stat: 'relating', together: m.hours });
      C.ui.toast('Meeting confirmed · +' + m.hours + ' together hours · +' + Math.round(C.state.XP.meetingHour * m.hours) + ' XP', 3600);
    } else {
      C.state.save();
      C.ui.toast('Confirmed with ' + who.name + ' · a new line in your Constellation. Hours count once per meet-up.', 3600);
    }
    if (C.app.current() === 'crew') C.app.render('crew', true);
  }

  function openReport(m) {
    var sheet = null, reason = '';
    var send = H.button('Send report', 'primary', function () {
      var st = C.state.get();
      if (st.crew.reported.indexOf(m.id) < 0) st.crew.reported.push(m.id);
      C.state.save();
      sheet.close();
      C.ui.toast('Report sent. A person reads every report.');
      C.app.render('crew', true);
    }, { disabled: true });
    var list = el('div', { class: 'choice-list', role: 'radiogroup', 'aria-label': 'Reason for the report' });
    D.crew.reportReasons.forEach(function (r) {
      var input = el('input', { type: 'radio', name: 'reason', value: r });
      input.addEventListener('change', function () { reason = r; send.disabled = false; });
      list.appendChild(el('label', { class: 'choice' }, input,
        el('span', { class: 'choice-face' }, el('span', { class: 'choice-text' }, el('span', { class: 'choice-title', text: r })),
          el('span', { class: 'choice-tick', 'aria-hidden': 'true', html: icons.check }))));
    });
    sheet = C.ui.modal('Report ' + m.name, el('div', { class: 'stack' },
      el('p', { class: 'dim', text: 'Tell us what happened. Only the report team sees this, not your crew.' }),
      list, send,
      H.button('Cancel', 'ghost', function () { sheet.close(); })));
  }

  function openBlock(m) {
    var sheet = null;
    sheet = C.ui.modal('Block ' + m.name + '?', el('div', { class: 'stack' },
      el('p', { class: 'dim', text: m.name + ' will not see you on the Star Map, cannot send you Signals and cannot be scanned at meet-ups. You can unblock them here.' }),
      H.button('Block ' + m.name, 'danger', function () {
        var st = C.state.get();
        if (st.crew.blocked.indexOf(m.id) < 0) st.crew.blocked.push(m.id);
        C.state.save();
        sheet.close();
        C.ui.toast(m.name + ' is blocked');
        C.app.render('crew', true);
      }),
      H.button('Cancel', 'ghost', function () { sheet.close(); })));
  }

  function openMemberMenu(m) {
    var sheet = null;
    var done = C.state.get().crew.reported.indexOf(m.id) >= 0;
    sheet = C.ui.modal(m.name, el('div', { class: 'stack' },
      el('p', { class: 'dim', text: m.line }),
      H.button(done ? 'Reported' : 'Report ' + m.name, 'ghost', function () { sheet.close(); openReport(m); }, { icon: icons.flag, disabled: done }),
      H.button('Block ' + m.name, 'ghost', function () { sheet.close(); openBlock(m); }, { icon: icons.block })));
  }

  function openSend(preselect) {
    var st = C.state.get();
    var sheet = null, to = preselect || '', plan = '';
    var send = H.button('Send the Signal', 'primary', function () {
      st.crew.signalsSent.push({ to: to, plan: plan, note: note.value.trim() });
      C.state.save();
      sheet.close();
      C.ui.toast('Signal sent to ' + memberName(to));
      C.app.render('crew', true);
    }, { disabled: true });
    function ready() { send.disabled = !(to && plan); }
    var note = el('input', { class: 'field', type: 'text', maxlength: '80', placeholder: 'A short note (optional)', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'A short note' });

    function radios(name, items, label, onPick, current) {
      var wrapEl = el('div', { class: 'choice-list compact', role: 'radiogroup', 'aria-label': label });
      items.forEach(function (it) {
        var input = el('input', { type: 'radio', name: name, value: it.id, checked: current === it.id });
        input.addEventListener('change', function () { onPick(it.id); ready(); });
        wrapEl.appendChild(el('label', { class: 'choice' }, input,
          el('span', { class: 'choice-face' }, it.avatar || null,
            el('span', { class: 'choice-text' }, el('span', { class: 'choice-title', text: it.label })),
            el('span', { class: 'choice-tick', 'aria-hidden': 'true', html: icons.check }))));
      });
      return wrapEl;
    }

    var people = D.crew.members.filter(function (m) { return !isBlocked(m.id); }).map(function (m) {
      return { id: m.id, label: m.name, avatar: avatar(m.name, m.color, 30) };
    });
    var plans = D.crew.plans.map(function (p) { return { id: p.id, label: p.text }; });
    if (preselect) ready();
    sheet = C.ui.modal('Send a Signal', el('div', { class: 'stack' },
      el('p', { class: 'dim', text: 'An invite only a person can open. Their agent sees only that a human signal is waiting.' }),
      el('h3', { class: 'sheet-sub', text: 'Who' }),
      radios('sig-to', people, 'Who to invite', function (v) { to = v; }, preselect),
      el('h3', { class: 'sheet-sub', text: 'Plan' }),
      radios('sig-plan', plans, 'Plan', function (v) { plan = D.crew.plans.filter(function (p) { return p.id === v; })[0].text; }, ''),
      note, send));
  }

  function openSignal(sig) {
    var st = C.state.get();
    var sheet = null;
    sheet = C.ui.modal('Open this Signal', el('div', { class: 'gate' },
      el('span', { class: 'card-ic violet big', html: icons.lock }),
      el('h3', { text: 'A Signal from ' + memberName(sig.from) }),
      el('p', { class: 'dim', text: 'Only a person can open this. Hold the button to show you are one.' }),
      personCheck({
        seconds: 2, label: 'Hold to open',
        onDone: function () {
          if (st.crew.signalsOpened.indexOf(sig.id) < 0) st.crew.signalsOpened.push(sig.id);
          C.state.save();
          sheet.close();
          C.app.render('crew', true);
        }
      })));
  }

  function signalCards() {
    var st = C.state.get();
    var out = el('div', { class: 'stack' });
    D.crew.signalsIn.forEach(function (sig) {
      var opened = st.crew.signalsOpened.indexOf(sig.id) >= 0;
      var reply = null;
      st.crew.signalReplies.forEach(function (r) { if (r.id === sig.id) reply = r.reply; });
      var from = byId(D.crew.members, sig.from);
      var card = el('div', { class: 'panel signal' + (opened ? ' open' : '') },
        el('div', { class: 'signal-top' },
          avatar(from.name, from.color, 36),
          el('div', { class: 'card-body' },
            el('h3', { text: 'Signal from ' + from.name }),
            el('p', { class: 'small dim', text: opened ? 'Opened' : 'Waiting for you' })),
          el('span', { class: 'signal-lock', html: opened ? icons.unlock : icons.lock })));
      if (!opened) {
        card.appendChild(el('p', { class: 'small', text: 'Only a person can open this. Their agent sees only that a human signal is waiting.' }));
        card.appendChild(H.button('Open the Signal', 'ghost', function () { openSignal(sig); }, { icon: icons.lock }));
      } else {
        card.appendChild(el('p', { class: 'signal-plan', text: sig.plan }));
        card.appendChild(el('p', { class: 'small dim', text: '“' + sig.note + '”' }));
        if (reply) {
          card.appendChild(el('p', { class: 'small teal-text', text: reply === 'in' ? 'You said you are in.' : 'You said not this time.' }));
        } else {
          card.appendChild(el('div', { class: 'row-btns' },
            H.button('I’m in', 'primary compact', function () { answer(sig, 'in', from.name); }),
            H.button('Not this time', 'ghost compact', function () { answer(sig, 'out', from.name); })));
        }
      }
      out.appendChild(card);
    });
    st.crew.signalsSent.forEach(function (s) {
      var to = byId(D.crew.members, s.to);
      out.appendChild(el('div', { class: 'panel signal sent' },
        el('div', { class: 'signal-top' },
          avatar(to.name, to.color, 36),
          el('div', { class: 'card-body' },
            el('h3', { text: 'Signal to ' + to.name }),
            el('p', { class: 'small dim', text: 'Sent · waiting for a person to open it' })),
          el('span', { class: 'signal-lock', html: icons.send })),
        el('p', { class: 'signal-plan', text: s.plan }),
        s.note ? el('p', { class: 'small dim', text: '“' + s.note + '”' }) : null,
        el('p', { class: 'small', text: 'Only a person can open this. Their agent sees only that a human signal is waiting.' })));
    });
    return out;
  }

  function answer(sig, reply, name) {
    var st = C.state.get();
    st.crew.signalReplies.push({ id: sig.id, reply: reply });
    C.state.save();
    C.ui.toast(reply === 'in' ? 'You’re in. ' + name + ' will see it.' : 'Sent. ' + name + ' will see it.');
    C.app.render('crew', true);
  }

  function openRename() {
    var st = C.state.get();
    var sheet = null;
    var input = el('input', { class: 'field', type: 'text', id: 'crewName', maxlength: '24', value: st.crew.name, autocomplete: 'off', spellcheck: 'false' });
    function save() {
      var v = input.value.trim();
      if (!v) { C.ui.toast('Give the crew a name'); return; }
      st.crew.name = v;
      C.state.save();
      sheet.close();
      C.app.render('crew', true);
    }
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') save(); });
    sheet = C.ui.modal('Name your crew', el('div', { class: 'stack' },
      el('label', { class: 'field-label', for: 'crewName', text: 'Crew name' }), input,
      H.button('Save', 'primary', save)));
    input.select();
  }

  function crew(main) {
    var st = C.state.get();
    var members = crewMembers();
    var goal = H.goalLabel(st.user.goal) || H.goalLabel('exam');
    var mt = D.crew.nextMeetup;
    var root = el('section', { class: 'screen crew' });
    main.appendChild(root);

    /* Header: the crew name, the goal and six avatars */
    var stack = el('div', { class: 'avatar-stack', 'aria-hidden': 'true' });
    members.forEach(function (m) { stack.appendChild(avatar(m.name, m.color, 34)); });
    root.appendChild(el('header', { class: 'panel crew-head' },
      el('div', { class: 'crew-title' },
        el('p', { class: 'eyebrow', text: 'Your crew' }),
        el('h1', { text: st.crew.name }),
        el('p', { class: 'small dim', text: 'Working toward: ' + goal + ' · ' + members.length + ' members' })),
      el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Rename the crew', html: icons.edit, onclick: openRename }),
      stack));

    /* Next meet-up and check-in */
    var lumen = C.ui.lumen({ size: 56, mood: st.activityToday > 0 ? 'bright' : 'dim' });
    var scanBtn = H.button(st.crew.checkedIn ? 'Scan another member’s code' : 'Scan a crew member’s code', st.crew.checkedIn ? 'ghost' : 'primary', function () {
      openScan({ onConfirmed: function () { /* the screen redraws itself */ } });
    }, { icon: icons.scan });
    root.appendChild(el('div', { class: 'panel meetup' },
      el('div', { class: 'card-row' },
        el('span', { class: 'card-ic magenta', html: icons.calendar }),
        el('div', { class: 'card-body' },
          el('h2', { class: 'panel-h tight', text: 'Next meet-up' }),
          el('p', { text: mt.place + ', ' + mt.when }),
          el('p', { class: 'small dim' }, el('span', { class: 'inline-ic', html: icons.place }), ' ' + mt.note))),
      el('h3', { class: 'sheet-sub', text: 'Check in at the meet-up' }),
      el('div', { class: 'checkin' },
        el('div', { class: 'code-box' },
          codePattern(st.user.name + '|' + mt.when),
          el('p', { class: 'small dim code-cap', text: 'Your code · demo pattern, not a real QR' })),
        el('div', { class: 'checkin-side' },
          el('div', { class: 'lumen-slot' + (st.crew.checkedIn ? ' flash' : '') }, lumen),
          st.crew.checkedIn
            ? el('p', { class: 'small teal-text' }, el('strong', { text: 'Meeting confirmed' }), ' · ' + mt.hours + ' together hours counted')
            : el('p', { class: 'small dim', text: 'Both phones scan each other. That is a together hour: ' + mt.hours + ' h and ' + Math.round(C.state.XP.meetingHour * mt.hours) + ' XP.' }))),
      scanBtn));

    /* Signals */
    root.appendChild(el('div', { class: 'row-head' },
      el('h2', { class: 'section-h', text: 'Signals' }),
      H.button('Send a Signal', 'ghost compact', function () { openSend(); }, { icon: icons.send })));
    root.appendChild(el('p', { class: 'small dim', text: 'Human-only invites. They open with a hold, so an agent cannot read them for you.' }));
    root.appendChild(signalCards());

    /* Members */
    root.appendChild(el('h2', { class: 'section-h', text: 'Members' }));
    var list = el('ul', { class: 'members' });
    members.forEach(function (m) {
      var blocked = isBlocked(m.id);
      var li = el('li', { class: 'panel member' + (blocked ? ' blocked' : '') },
        avatar(m.name, m.color, 40),
        el('div', { class: 'card-body' },
          el('h3', { text: m.me ? m.name + ' (you)' : m.name }),
          el('p', { class: 'small dim', text: blocked ? 'Blocked' : (st.crew.scanned.indexOf(m.id) >= 0 ? 'Met at the last meet-up' : m.line) })));
      if (!m.me) {
        if (blocked) {
          li.appendChild(H.button('Unblock', 'ghost compact', function () {
            st.crew.blocked.splice(st.crew.blocked.indexOf(m.id), 1);
            C.state.save();
            C.ui.toast(m.name + ' is unblocked');
            C.app.render('crew', true);
          }));
        } else {
          li.appendChild(el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Send ' + m.name + ' a Signal', html: icons.signal, onclick: function () { openSend(m.id); } }));
          li.appendChild(el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Report or block ' + m.name, 'aria-haspopup': 'dialog', html: icons.more, onclick: function () { openMemberMenu(m); } }));
        }
      }
      list.appendChild(li);
    });
    root.appendChild(list);

    /* Past meet-ups */
    root.appendChild(el('h2', { class: 'section-h', text: 'Past meet-ups' }));
    var past = el('ul', { class: 'past' });
    D.crew.past.forEach(function (p) {
      past.appendChild(el('li', { class: 'panel' },
        el('p', { class: 'small dim', text: p.when }),
        el('p', {}, el('strong', { text: p.place })),
        el('p', { class: 'small', text: p.note })));
    });
    root.appendChild(past);
    root.appendChild(el('p', { class: 'small dim', text: 'Meet-ups are always in public places. Report and block are one tap away on every member.' }));
  }

  /* ======================================================================
     S9 Shooting Star
     ====================================================================== */

  function shootingStar(main) {
    var st = C.state.get();
    var root = el('section', { class: 'screen shooting' });
    main.appendChild(root);
    var result = el('div', { class: 'shoot-list', 'aria-live': 'polite' });
    var streak = el('div', { class: 'streak-fx', 'aria-hidden': 'true' });
    var started = false;

    var big = el('button', { class: 'shoot-btn', type: 'button', 'aria-label': 'Shooting Star: show public activities in the next 2 hours' },
      el('span', { class: 'shoot-ic', html: icons.shoot }),
      el('span', { class: 'shoot-label', text: 'Shooting Star' }));
    big.addEventListener('click', function () {
      var still = document.body.classList.contains('still') ||
        (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      streak.classList.remove('go');
      if (!still) { void streak.offsetWidth; streak.classList.add('go'); }
      setTimeout(showList, still ? 0 : 700);
    });

    root.appendChild(el('header', { class: 'map-head' },
      el('div', {},
        el('p', { class: 'eyebrow', text: D.city.name }),
        el('h1', { text: 'Shooting Star' })),
      el('button', { class: 'pill', type: 'button', onclick: function () { C.app.go('map'); } },
        el('span', { html: icons.back }), el('span', { text: 'Star Map' }))));
    root.appendChild(el('div', { class: 'shoot-stage' }, streak, big));
    root.appendChild(el('p', { class: 'center dim', text: 'Press for public plans in the next 2 hours. Same list for everyone in your area.' }));
    root.appendChild(result);

    function showList() {
      started = true;
      result.textContent = '';
      var now = clockMinutes();
      result.appendChild(el('h2', { class: 'section-h', text: 'Next 2 hours' }));
      D.map.activities.forEach(function (a) {
        var going = st.people.going.indexOf(a.id) >= 0;
        var count = el('span', { class: 'going-count', text: (a.going + (going ? 1 : 0)) + ' going' });
        var btn = el('button', { class: 'btn compact ' + (going ? 'primary' : 'ghost'), type: 'button', 'aria-pressed': going ? 'true' : 'false', text: going ? 'Going' : 'I’m going' });
        btn.addEventListener('click', function () {
          var on = st.people.going.indexOf(a.id) >= 0;
          if (on) st.people.going.splice(st.people.going.indexOf(a.id), 1); else st.people.going.push(a.id);
          C.state.save();
          showList();
        });
        result.appendChild(el('div', { class: 'panel activity' },
          el('div', { class: 'act-time' }, el('strong', { text: timeText(now + a.offset) }), el('span', { class: 'small dim', text: 'in ' + a.offset + ' min' })),
          el('div', { class: 'card-body' },
            el('h3', { text: a.title }),
            el('p', { class: 'small' }, el('span', { class: 'inline-ic', html: icons.place }), ' ' + a.place),
            el('p', { class: 'small dim' }, 'Hosted by ' + a.host + ' · ', count)),
          btn));
      });
      result.appendChild(el('p', { class: 'small dim', text: 'Public places only. Going earns no XP: XP comes from confirmed meetings.' }));
    }
  }

  var api = {
    personCheck: personCheck, openScan: openScan, codePattern: codePattern,
    avatar: avatar, byId: byId
  };

  C.screens.map = map;
  C.screens.crew = crew;
  C.screens.shootingstar = shootingStar;
  return api;
})();
