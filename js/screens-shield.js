/* Constella prototype, M5 "Limits": S7 Shield (Gravity Shield, Night Lock, Co-pilot Unlock), the Night Lock card
   and the Night Watch screen. Plain script: adds its screens to C.screens and shares helpers on C.shield.
   Limits apply only when the person switches them on. Nothing here earns XP, reads anything or talks.
   Every wait runs at demo speed (one minute is one second) and says so on screen. */
window.C = window.C || {};

C.shield = (function () {
  var el = C.ui.el;
  var icons = C.ui.icons;
  var H = C.helpers;
  var D = C.data;
  var S = D.shield;

  var nw = { room: null, focus: '' }; /* Night Watch: the room you are in, and what to scroll to on arrival */
  var cleanups = [];
  function cleanup() { while (cleanups.length) cleanups.pop()(); }

  /* ---------- small helpers ---------- */

  function L() { return C.state.get().limits; }
  function secs(min) { return min * S.secondsPerMinute; }
  function fmt(s) {
    s = Math.max(0, Math.ceil(s));
    return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
  }
  function demoNote(min) { return min + ' minutes · demo speed: ' + secs(min) + ' seconds'; }
  function member(id) { return C.people.byId(D.crew.members, id); }
  function approver() { return member(S.approver).name; }
  function hoursText(n) { return (Math.round(n * 10) / 10) + ' h a day'; }

  function nightMinutes() {
    var p = L().nightTime.split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }
  function nightLabel() {
    for (var i = 0; i < S.nightTimes.length; i++) if (S.nightTimes[i].id === L().nightTime) return S.nightTimes[i].label;
    return '11 pm';
  }
  function isLate() { var m = C.people.clockMinutes(); return m >= nightMinutes() || m < 5 * 60; }

  function exceptionLeft() { return Math.max(0, (L().exceptionUntil - Date.now()) / 1000); }
  function coolingLeft() { return Math.max(0, (L().coolingUntil - Date.now()) / 1000); }

  /* off | starting (cooling-off) | active | paused (an exception from a crew member) */
  function shieldState() {
    var l = L();
    if (!l.shieldOn) return 'off';
    if (exceptionLeft() > 0) return 'paused';
    return coolingLeft() > 0 ? 'starting' : 'active';
  }
  /* off | waiting (on, before the night time) | holding (on and it is late) | paused */
  function nightState() {
    var l = L();
    if (!l.nightLockOn) return 'off';
    if (exceptionLeft() > 0) return 'paused';
    return isLate() ? 'holding' : 'waiting';
  }

  function lift(which) {
    var l = L();
    if (which === 'shield') { l.shieldOn = false; l.coolingUntil = 0; } else l.nightLockOn = false;
    if (!l.shieldOn && !l.nightLockOn) l.exceptionUntil = 0;
    C.state.save();
  }
  function grantException() {
    L().exceptionUntil = Date.now() + secs(S.exceptionMinutes) * 1000;
    C.state.save();
  }
  function limitName(which) { return which === 'shield' ? 'Gravity Shield' : 'Night Lock'; }

  function redrawShield() {
    if (C.app.current() === 'shield') C.app.render('shield', true);
  }

  function badge(text, cls) { return el('span', { class: 'badge' + (cls ? ' ' + cls : ''), text: text }); }

  /* The same switch markup as onboarding, without the panel box. */
  function toggle(id, title, line, checked, disabled, onchange) {
    var input = el('input', { type: 'checkbox', id: id, role: 'switch', checked: checked, disabled: disabled });
    input.addEventListener('change', function () { onchange(input); });
    return el('label', { class: 'switch flat', for: id },
      el('span', { class: 'switch-text' },
        el('span', { class: 'switch-title', text: title }),
        line ? el('span', { class: 'switch-line', text: line }) : null),
      input, el('span', { class: 'track', 'aria-hidden': 'true' }));
  }

  /* A countdown driven by timestamps, so it survives leaving the screen. Returns the node; update() repaints it. */
  function stampBar(label, leftFn, totalSecs, tickers) {
    var num = el('span', { class: 'timer-num', 'aria-hidden': 'true' });
    var fill = el('div', { class: 'bar-fill' });
    var node = el('div', { class: 'timer-box' },
      el('div', { class: 'timer-top' }, el('span', { class: 'small', text: label }), num),
      el('div', { class: 'bar timer-bar', role: 'presentation' }, fill));
    function update() {
      var left = leftFn();
      num.textContent = fmt(left);
      fill.style.width = Math.min(100, Math.max(0, (1 - left / totalSecs) * 100)).toFixed(1) + '%';
    }
    update();
    tickers.push(update);
    return node;
  }

  /* ---------- Co-pilot Unlock: wait it out, or ask a crew member ---------- */

  /* A sheet that offers both ways to lift a limit early. after() runs once the limit is lifted or paused. */
  function openUnlock(which, after) {
    var name = limitName(which);
    var done = false;
    var waitSlot = el('div', { class: 'stack' });
    var askSlot = el('div', { class: 'stack' });
    var sheet = null;
    var waiting = null;

    function finish(message) {
      if (done) return;
      done = true;
      sheet.close();
      C.ui.toast(message, 3800);
      if (after) after();
    }

    var askBtn, waitBtn;

    waitBtn = H.button('Start the wait', 'ghost', function () {
      waitBtn.disabled = true; askBtn.disabled = true;
      waiting = C.train.countdown(secs(S.coolingMinutes), 'Cooling-off: ' + demoNote(S.coolingMinutes), function () {
        if (!document.body.contains(waiting.node)) return;
        lift(which);
        finish('You waited it out. ' + name + ' is off.');
      });
      var stop = H.button('Stop waiting', 'link', function () {
        waiting.stop();
        waitSlot.removeChild(waiting.node); waitSlot.removeChild(stop);
        waitBtn.disabled = false; askBtn.disabled = false;
      });
      waitSlot.appendChild(waiting.node);
      waitSlot.appendChild(stop);
      waiting.start();
    });

    askBtn = H.button('Ask ' + approver(), 'ghost', function () {
      waitBtn.disabled = true; askBtn.disabled = true;
      var status = el('p', { class: 'small', 'aria-live': 'polite', text: 'Asking ' + approver() + '. A person has to say yes.' });
      askSlot.appendChild(status);
      setTimeout(function () {
        if (!document.body.contains(status)) return;
        grantException();
        finish(approver() + ' approved a ' + S.exceptionMinutes + '-minute exception');
      }, S.approveSeconds * 1000);
    });

    var box = el('div', { class: 'stack unlock' },
      el('p', { class: 'sheet-sub', text: name + ' is on because you chose it. To lift it early, pick one way.' }),
      el('div', { class: 'panel stack' },
        el('h3', { text: 'Wait it out' }),
        el('p', { class: 'small dim', text: 'A ' + S.coolingMinutes + '-minute cooling-off (demo speed: ' + secs(S.coolingMinutes) + ' seconds). When it ends, ' + name + ' is off.' }),
        waitBtn, waitSlot),
      el('div', { class: 'panel stack' },
        el('h3', { text: 'Ask a crew member' }),
        el('p', { class: 'small dim', text: approver() + ' can approve a ' + S.exceptionMinutes + '-minute exception. ' + name + ' comes back after it. (Demo: ' + approver() + ' answers after ' + S.approveSeconds + ' seconds.)' }),
        askBtn, askSlot));
    sheet = C.ui.modal('Co-pilot Unlock', box);
  }

  /* ======================================================================
     S7 Shield
     ====================================================================== */

  function shield(main) {
    cleanup();
    var root = el('section', { class: 'screen shield' });
    main.appendChild(root);
    var sig = '';

    function signature() { return shieldState() + '|' + nightState(); }

    function draw() {
      cleanup();
      root.textContent = '';
      sig = signature();
      var tickers = [];
      var l = L();
      var gs = shieldState(), ns = nightState();
      var gLocked = gs === 'active' || gs === 'paused';
      var nLocked = ns === 'holding' || ns === 'paused';

      /* header and the top line */
      root.appendChild(H.screenHead('Shield', 'Limits you set', 'Only what you switch on. Nothing here earns XP.'));

      var anyOn = l.shieldOn || l.nightLockOn;
      var on = [];
      if (l.shieldOn) on.push('Gravity Shield');
      if (l.nightLockOn) on.push('Night Lock');
      root.appendChild(el('div', { class: 'panel limits-top' + (anyOn ? ' on' : '') },
        el('span', { class: 'card-ic big ' + (anyOn ? 'teal' : 'violet'), html: anyOn ? icons.lock : icons.unlock }),
        el('div', { class: 'card-body' },
          el('p', { class: 'limits-line', text: anyOn ? 'Limits are on: ' + on.join(' and ') + '.' : 'Limits are off. Nothing changes until you switch one on.' }),
          el('p', { class: 'small dim', text: anyOn ? 'You set these. Lifting one early needs a wait or a crew member.' : 'Constella never turns a limit on for you.' }))));

      root.appendChild(gravityPanel(l, gs, gLocked, tickers));
      root.appendChild(nightPanel(l, ns, nLocked));
      root.appendChild(unlockPanel(gs, ns));

      root.appendChild(el('p', { class: 'small dim shield-foot', text: 'Constella can only pause your agent on phones that allow it. It never reads your agent\'s data.' }));
      root.appendChild(el('p', { class: 'small dim shield-foot', text: 'Prototype: the Shield is simulated here. Waits run at demo speed (one minute is one second).' }));

      var iv = setInterval(function () {
        if (!document.body.contains(root)) { clearInterval(iv); return; }
        if (signature() !== sig) { C.app.render('shield', true); return; } /* a cooling-off ended or an exception ran out */
        tickers.forEach(function (t) { t(); });
      }, 250);
      cleanups.push(function () { clearInterval(iv); });
    }

    /* ----- Gravity Shield ----- */

    function gravityPanel(l, gs, locked, tickers) {
      var stateBadge = { off: badge('Off'), starting: badge('Starting', 'sky'), active: badge('On', 'teal'), paused: badge('Paused', 'ember') }[gs];
      var frozen = gs !== 'off'; /* settings change only while the limit is off */

      var sw = toggle('gsSwitch', 'Gravity Shield',
        gs === 'off' ? 'Starts after a ' + S.coolingMinutes + '-minute cooling-off (demo speed: ' + secs(S.coolingMinutes) + ' seconds).' : 'Switch off to cancel or lift it.',
        l.shieldOn, false, function (input) {
          if (input.checked) {
            l.shieldOn = true;
            l.coolingUntil = Date.now() + secs(S.coolingMinutes) * 1000;
            C.state.save();
            draw();
            C.ui.toast('Cooling-off started. Gravity Shield begins in ' + secs(S.coolingMinutes) + ' seconds.');
          } else if (shieldState() === 'starting') { /* changing your mind before it starts is free */
            lift('shield');
            draw();
            C.ui.toast('Gravity Shield cancelled. Nothing changed.');
          } else {
            input.checked = true; /* it is in force: lifting it goes through Co-pilot Unlock */
            openUnlock('shield', draw);
          }
        });

      var out = el('output', { class: 'range-out', for: 'gsBudget', text: hoursText(l.budget) });
      var range = el('input', {
        type: 'range', id: 'gsBudget', class: 'range', min: '0.5', max: String(S.budgetMax), step: '0.5', value: String(l.budget),
        disabled: frozen, 'aria-valuetext': hoursText(l.budget)
      });
      range.addEventListener('input', function () {
        l.budget = parseFloat(range.value);
        out.textContent = hoursText(l.budget);
        range.setAttribute('aria-valuetext', hoursText(l.budget));
      });
      range.addEventListener('change', function () { C.state.save(); });
      var perDay = C.state.get().week.agentHours / 7;

      var chips = el('div', { class: 'chips wrap', role: 'group', 'aria-label': 'Agent-free windows' }, S.windows.map(function (w) {
        var onNow = l.windows.indexOf(w.id) >= 0;
        var chip = el('button', {
          class: 'chip' + (onNow ? ' on' : ''), type: 'button', 'aria-pressed': onNow ? 'true' : 'false', disabled: frozen
        }, el('span', { text: w.label + ' · ' + w.name }));
        chip.addEventListener('click', function () {
          var i = l.windows.indexOf(w.id);
          if (i >= 0) l.windows.splice(i, 1); else l.windows.push(w.id);
          C.state.save();
          draw();
        });
        return chip;
      }));

      var status = null;
      if (gs === 'starting') {
        status = el('div', { class: 'limit-status' },
          stampBar('Cooling-off · ' + demoNote(S.coolingMinutes), coolingLeft, secs(S.coolingMinutes), tickers),
          el('p', { class: 'small dim', text: 'It takes effect when the timer ends. Switch it off now to cancel, at no cost.' }));
      } else if (gs === 'active') {
        status = el('div', { class: 'limit-status' },
          el('p', { class: 'small' }, el('strong', { text: 'In force: ' }), hoursText(l.budget) + ' with your agent' + windowsText(l) + '.'),
          H.button('Lift it early', 'ghost compact', function () { openUnlock('shield', draw); }, { icon: icons.unlock }));
      } else if (gs === 'paused') {
        status = el('div', { class: 'limit-status' },
          stampBar('Exception · ' + demoNote(S.exceptionMinutes), exceptionLeft, secs(S.exceptionMinutes), tickers),
          el('p', { class: 'small dim', text: 'Gravity Shield is paused. It comes back by itself when the timer ends.' }));
      }

      return el('div', { class: 'panel limit g-' + gs },
        el('div', { class: 'limit-head' },
          el('span', { class: 'card-ic violet', html: icons.shield }),
          el('div', { class: 'card-body' },
            el('h2', { text: 'Gravity Shield' }),
            el('p', { class: 'small dim', text: 'Cap what you hand to your agent each day.' })),
          stateBadge),
        sw,
        status,
        el('div', { class: 'field-block' },
          el('div', { class: 'range-top' },
            el('label', { class: 'field-label', for: 'gsBudget', text: 'Daily agent budget' }), out),
          range,
          el('p', { class: 'small dim', text: 'This week you handed over ' + C.helpers.hours(C.state.get().week.agentHours) + ', about ' + hoursText(perDay) + '.' })),
        el('div', { class: 'field-block' },
          el('span', { class: 'field-label', id: 'gsWinLabel', text: 'Agent-free windows' }),
          chips,
          el('p', { class: 'small dim', text: l.windows.length ? 'Your agent stays quiet in these windows.' : 'None chosen. Pick the times you want to do things yourself.' })));
    }

    function windowsText(l) {
      if (!l.windows.length) return '';
      var names = S.windows.filter(function (w) { return l.windows.indexOf(w.id) >= 0; }).map(function (w) { return w.label + ' ' + w.name.toLowerCase(); });
      return ', agent-free ' + names.join(', ');
    }

    /* ----- Night Lock ----- */

    function nightPanel(l, ns, locked) {
      var stateBadge = { off: badge('Off'), waiting: badge('On', 'teal'), holding: badge('Holding now', 'sky'), paused: badge('Paused', 'ember') }[ns];

      var sw = toggle('nlSwitch', 'Night Lock',
        'Switch on to make late nights calmer. It starts at ' + nightLabel() + '.',
        l.nightLockOn, false, function (input) {
          if (input.checked) {
            l.nightLockOn = true;
            C.state.save();
            draw();
            C.ui.toast('Night Lock is on from ' + nightLabel() + '.');
          } else if (nightState() === 'holding' || nightState() === 'paused') {
            input.checked = true;
            openUnlock('night', draw);
          } else { /* it is not in force yet, so switching it off is free */
            lift('night');
            draw();
            C.ui.toast('Night Lock is off.');
          }
        });

      var times = el('div', { class: 'chips wrap', role: 'group', 'aria-label': 'Night Lock starts at' }, S.nightTimes.map(function (t) {
        var onNow = l.nightTime === t.id;
        var chip = el('button', { class: 'chip' + (onNow ? ' on' : ''), type: 'button', 'aria-pressed': onNow ? 'true' : 'false', disabled: locked, text: t.label });
        chip.addEventListener('click', function () { l.nightTime = t.id; C.state.save(); draw(); });
        return chip;
      }));

      var buy = toggle('nlBuy', 'No self-improvement purchases late at night',
        'Courses, programs and upgrades wait until morning.', l.nightNoBuy, locked, function (input) {
          l.nightNoBuy = input.checked;
          C.state.save();
        });

      var who = ['priya', 'tomas', 'amara'].map(member);
      var share = el('div', { class: 'offer' },
        el('h3', { text: 'Share any offer with a crew member in one tap' }),
        el('p', { class: 'small dim', text: 'Example of an offer that can arrive late at night:' }),
        el('p', { class: 'offer-box', text: '“Tonight only: a speaking course, half price.” (example)' }),
        el('div', { class: 'row-btns' }, who.map(function (m) {
          return H.button('Send to ' + m.name, 'ghost compact', function () {
            C.ui.toast('Sent to ' + m.name + '. Nothing was bought.');
          });
        })));

      var status = null;
      if (ns === 'holding') {
        status = el('div', { class: 'limit-status' },
          el('p', { class: 'small' }, el('strong', { text: 'Holding now: ' }), 'it is ' + C.state.get().clock + ' and your companion voice is resting.'),
          H.button('Open the Night Lock card', 'ghost compact', function () { showNightCard(); }));
      } else if (ns === 'paused') {
        status = el('div', { class: 'limit-status' },
          el('p', { class: 'small dim', text: 'Paused by a crew member\'s exception. It comes back by itself.' }));
      }

      return el('div', { class: 'panel limit n-' + ns },
        el('div', { class: 'limit-head' },
          el('span', { class: 'card-ic violet', html: icons.lock }),
          el('div', { class: 'card-body' },
            el('h2', { text: 'Night Lock' }),
            el('p', { class: 'small dim', text: 'Calmer late nights, set by you.' })),
          stateBadge),
        sw,
        status,
        el('div', { class: 'field-block' },
          el('span', { class: 'field-label', text: 'Starts at' }), times),
        el('ul', { class: 'night-list' },
          el('li', {}, el('span', { class: 'inline-ic', html: icons.lock }), ' Companion voice off after ' + nightLabel())),
        buy,
        share);
    }

    /* ----- Co-pilot Unlock ----- */

    function unlockPanel(gs, ns) {
      var gOn = gs !== 'off', nOn = ns !== 'off';
      var buttons = [];
      if (gOn) buttons.push(H.button('Lift Gravity Shield early', 'ghost', function () { openUnlock('shield', draw); }, { icon: icons.unlock }));
      if (nOn) buttons.push(H.button('Lift Night Lock early', 'ghost', function () { openUnlock('night', draw); }, { icon: icons.unlock }));
      return el('div', { class: 'panel stack' },
        el('div', { class: 'limit-head' },
          el('span', { class: 'card-ic magenta', html: icons.crew }),
          el('div', { class: 'card-body' },
            el('h2', { text: 'Co-pilot Unlock' }),
            el('p', { class: 'small dim', text: 'A limit you set can still be lifted early, in one of two ways.' }))),
        el('ul', { class: 'night-list' },
          el('li', {}, 'Wait out the ' + S.coolingMinutes + '-minute cooling-off (demo speed: ' + secs(S.coolingMinutes) + ' seconds).'),
          el('li', {}, 'Or ask a crew member. ' + approver() + ' approves a ' + S.exceptionMinutes + '-minute exception.')),
        buttons.length ? el('div', { class: 'row-btns' }, buttons) : el('p', { class: 'small dim', text: 'No limit is on, so there is nothing to unlock.' }));
    }

    draw();
  }

  /* ======================================================================
     The Night Lock card (the simulated 11:30 pm event)
     ====================================================================== */

  var nightCardNode = null;

  function setInert(on) {
    ['view', 'tabbar'].forEach(function (id) {
      var n = document.getElementById(id);
      if (!n) return;
      if (on) n.setAttribute('inert', ''); else n.removeAttribute('inert');
    });
  }

  function closeNightCard() {
    if (nightCardNode && nightCardNode.parentNode) nightCardNode.parentNode.removeChild(nightCardNode);
    nightCardNode = null;
    setInert(false);
  }

  function showNightCard() {
    if (nightCardNode) return;
    var host = document.getElementById('overlayHost');
    if (!host) return;
    var clock = C.state.get().clock;
    var actions = el('div', { class: 'night-actions' });
    var live = el('p', { class: 'small dim night-live', 'aria-live': 'polite' });
    var heading = el('h2', { id: 'nightTitle', tabindex: '-1', text: 'Night Lock is on. Your companion voice is resting.' });
    var wait = null;

    function leave(route, focus) {
      closeNightCard();
      nw.room = null; nw.focus = focus || '';
      C.app.go(route);
    }

    function show() {
      actions.textContent = '';
      live.textContent = '';
      actions.appendChild(H.button('Join a Night Watch room', 'primary big', function () { leave('nightwatch', 'rooms'); }));
      actions.appendChild(H.button('Your local crisis line', 'ghost big', function () { leave('nightwatch', 'crisis'); }));
      actions.appendChild(H.button('Ask a crew member to unlock', 'ghost big', ask));
      actions.appendChild(H.button('Wait ' + S.coolingMinutes + ' minutes', 'ghost big', startWait));
    }

    function ask() {
      actions.textContent = '';
      var status = el('p', { class: 'night-wait', 'aria-live': 'polite', text: 'Asking ' + approver() + '. A person has to say yes.' });
      actions.appendChild(status);
      setTimeout(function () {
        if (!document.body.contains(status)) return;
        grantException();
        closeNightCard();
        C.ui.toast(approver() + ' approved a ' + S.exceptionMinutes + '-minute exception', 3800);
        redrawShield();
      }, S.approveSeconds * 1000);
    }

    function startWait() {
      actions.textContent = '';
      wait = C.train.countdown(secs(S.coolingMinutes), 'Waiting ' + demoNote(S.coolingMinutes), function () {
        if (!document.body.contains(wait.node)) return;
        lift('night');
        C.app.setClock('11:40 pm');
        closeNightCard();
        C.ui.toast('You waited it out. Night Lock is off. Switch it back on in Shield any time.', 4200);
        redrawShield();
      });
      actions.appendChild(wait.node);
      actions.appendChild(H.button('Never mind', 'link', function () { wait.stop(); show(); }));
      live.textContent = 'Nothing is lost by waiting. You can still pick another way at any time.';
      wait.start();
    }

    show();

    nightCardNode = el('div', { class: 'nightcard', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'nightTitle' },
      el('span', { class: 'night-moon', 'aria-hidden': 'true' }),
      C.ui.lumen({ size: 84, mood: 'dim' }),
      el('div', { class: 'night-text' },
        el('p', { class: 'small dim', text: clock }),
        heading,
        el('p', { class: 'dim', text: 'Nothing here is urgent. Pick whatever feels right.' })),
      actions, live);
    host.appendChild(nightCardNode);
    setInert(true);
    try { heading.focus({ preventScroll: true }); } catch (e) { /* older browsers */ }
  }

  /* The Demo control "Set time to 11:30 pm". */
  function setLateTime() {
    var l = L();
    C.app.setClock(S.lateClock);
    l.exceptionUntil = 0; /* a fresh evening: an earlier exception has run out */
    C.state.save();
    if (!l.nightLockOn) {
      C.ui.toast('It is ' + S.lateClock + '. Night Lock is off, so nothing changes. Switch it on in Shield.', 4200);
      C.app.go('shield');
      return;
    }
    if (!isLate()) {
      C.ui.toast(S.lateClock + ' is before your Night Lock time (' + nightLabel() + ').', 4200);
      C.app.go('shield');
      return;
    }
    redrawShield();
    showNightCard();
  }

  /* ======================================================================
     Night Watch
     ====================================================================== */

  function nightWatch(main) {
    cleanup();
    var root = el('section', { class: 'screen nightwatch' });
    main.appendChild(root);
    var focus = nw.focus;
    nw.focus = '';

    function draw() {
      cleanup();
      root.textContent = '';
      root.appendChild(H.screenHead('Shield · Night Watch', 'Night Watch', 'Quiet late-night rooms with a person hosting. Agents can\'t join. Joining earns no XP.',
        { label: 'Shield', onclick: function () { nw.room = null; C.app.go('shield'); } }));

      var room = nw.room && S.rooms.filter(function (r) { return r.id === nw.room; })[0];
      if (room) roomView(room);
      else listView();
    }

    function listView() {
      root.appendChild(el('h2', { class: 'section-h', text: 'Open tonight' }));
      S.rooms.forEach(function (r) {
        var left = r.size - r.joined;
        root.appendChild(el('div', { class: 'panel orbit-card' },
          el('span', { class: 'card-ic violet', html: icons.star }),
          el('div', { class: 'card-body' },
            el('h3', { text: r.topic }),
            el('p', { class: 'small dim', text: r.when }),
            el('p', { class: 'small', text: r.line }),
            el('p', { class: 'small dim', text: 'Host: ' + r.host + ' · ' + left + (left === 1 ? ' seat' : ' seats') + ' left' })),
          H.button('Join', 'primary compact', function () { nw.room = r.id; C.state.touch(); draw(); document.getElementById('view').scrollTop = 0; })));
      });

      var c = S.crisis;
      var link = el('a', { href: c.url, target: '_blank', rel: 'noopener noreferrer', text: c.site });
      var title = el('h2', { id: 'crisisTitle', tabindex: '-1', text: c.title });
      var card = el('div', { class: 'panel crisis' + (focus === 'crisis' ? ' picked' : ''), id: 'crisis' },
        el('div', { class: 'limit-head' },
          el('span', { class: 'card-ic big teal', html: icons.signal }),
          el('div', { class: 'card-body' }, title, el('p', { text: c.line + ' ' }, link))),
        el('p', { class: 'small dim', text: c.note }));
      root.appendChild(card);

      if (focus) {
        var target = focus === 'crisis' ? card : root.querySelector('.orbit-card');
        setTimeout(function () {
          if (!target) return;
          target.scrollIntoView({ block: 'center' });
          if (focus === 'crisis') { try { title.focus({ preventScroll: true }); } catch (e) { /* older browsers */ } }
        }, 0);
        focus = '';
      }
    }

    function roomView(room) {
      var st = C.state.get();
      var seconds = 0;
      var clock = el('span', { class: 'timer-num', text: '0:00' });
      var iv = setInterval(function () {
        if (!document.body.contains(clock)) { clearInterval(iv); return; }
        seconds++;
        clock.textContent = fmt(seconds);
      }, 1000);
      cleanups.push(function () { clearInterval(iv); });

      root.appendChild(el('div', { class: 'banner agents-banner' }, el('span', { class: 'inline-ic', html: icons.lock }), ' No agents in this room'));
      root.appendChild(el('div', { class: 'panel' },
        el('p', { class: 'small dim', text: room.when }),
        el('h2', { text: room.topic }),
        el('p', { class: 'small' }, 'Host: ', el('strong', { text: room.host })),
        el('p', { class: 'small', text: room.line }),
        el('div', { class: 'timer-top room-time' }, el('span', { class: 'small dim', text: 'Time in the room' }), clock)));

      var people = [{ name: room.host, host: true }].concat(room.names.map(function (n) { return { name: n }; })).concat([{ name: st.user.name || 'You', me: true }]);
      var colors = ['violet', 'teal', 'magenta', 'sky', 'ember'];
      root.appendChild(el('div', { class: 'panel' },
        el('h2', { class: 'panel-h', text: people.length + ' people in the room' }),
        el('div', { class: 'tiles' }, people.map(function (p, i) {
          return el('div', { class: 'tile panel' },
            C.people.avatar(p.name, p.me ? 'gold' : colors[i % colors.length], 44),
            el('span', { class: 'tile-name', text: p.name + (p.me ? ' (you)' : '') }),
            p.host ? el('span', { class: 'badge', text: 'Host' }) : null);
        }))));
      root.appendChild(H.button('Leave the room', 'ghost', function () { nw.room = null; draw(); }));
    }

    draw();
  }

  C.screens.shield = shield;
  C.screens.nightwatch = nightWatch;

  return { setLateTime: setLateTime, showNightCard: showNightCard, closeNightCard: closeNightCard };
})();
