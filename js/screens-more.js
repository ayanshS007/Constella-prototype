/* Constella prototype, M6 "The rest": S8 Earth Archive, S10 Light Exchange, S11 Landing Missions,
   S12 Constellation and ranks, S13 Privacy and settings. Plain script: adds its screens to C.screens.
   Nothing here is generated or read from the user. XP goes through C.state.award() only, and only for a taught hour
   (60) or a Landing Mission (80). Learning an hour, reading the Archive and time in the app earn nothing. */
window.C = window.C || {};

C.more = (function () {
  var el = C.ui.el;
  var icons = C.ui.icons;
  var H = C.helpers;
  var D = C.data;

  /* ---------- shared helpers ---------- */

  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function round1(n) { return Math.round(n * 10) / 10; }
  function hrs(n) { return round1(n).toFixed(1) + ' h'; } /* "1.0 h": hours always show one decimal */

  /* "+0.5 h", "−1 h", "0 h": the sign is always in the text. */
  function signed(n) {
    var r = round1(n);
    return (r > 0 ? '+' : r < 0 ? '−' : '') + Math.abs(r) + ' h';
  }

  function head(eyebrow, title, sub) {
    return H.screenHead(eyebrow, title, sub, { label: 'Home', onclick: function () { C.app.go('home'); } });
  }

  var reward = C.game.reward; /* a rank-up plays the Ascend moment by itself */

  function redrawIfOn(route) {
    if (C.app.current() === route) C.app.render(route, true);
  }

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

  /* ======================================================================
     S8 Earth Archive
     ====================================================================== */

  var arch = { cat: 'all' }; /* kept while the app is open */
  var VERDICT_ICON = { keep: 'check', adapt: 'edit', drop: 'close' };

  function verdictBadge(id) {
    var v = D.archive.verdicts[id];
    return el('span', { class: 'verdict v-' + id },
      el('span', { class: 'verdict-ic', html: icons[VERDICT_ICON[id]] }), el('span', { text: v.label }));
  }

  function entryCard(e) {
    var src = e.source ? 'Source: ' + e.source : 'Source: ' + e.sourceNote;
    function row(label, text, cls) {
      return el('div', { class: 'entry-row' },
        el('h4', { class: 'entry-label', text: label }),
        el('p', { class: cls || '', text: text }));
    }
    return el('article', { class: 'panel entry', 'aria-label': e.title + '. ' + D.archive.verdicts[e.verdict].label },
      el('div', { class: 'entry-top' },
        el('div', { class: 'card-body' },
          el('h3', { class: 'entry-title', text: e.title }),
          el('p', { class: 'small dim', text: e.category })),
        verdictBadge(e.verdict)),
      row('What people did', e.people),
      row('What the evidence says now', e.evidence, 'evidence'),
      row('One skill to try', e.skill),
      el('p', { class: 'small entry-source', text: src }),
      el('p', { class: 'small dim entry-proto', text: D.archive.note }));
  }

  function elderCard(c) {
    return el('article', { class: 'panel elder', 'aria-label': c.title },
      el('div', { class: 'elder-top' },
        C.people.avatar(c.by, 'gold', 40),
        el('div', { class: 'card-body' },
          el('h3', { text: c.title }),
          el('p', { class: 'small dim', text: 'Recorded by ' + c.by + ', ' + c.age }))),
      el('p', { class: 'elder-quote', text: '“' + c.line + '”' }),
      el('p', { class: 'small' }, el('strong', { text: 'You need: ' }), c.need),
      el('p', { class: 'small' }, el('strong', { text: 'Tip: ' }), c.tip),
      el('p', { class: 'small dim', text: D.archive.elders.label }),
      H.button('Make it with someone', 'primary', function () {
        mission.focus = c.mission;
        C.app.go('missions');
      }, { icon: icons.next }));
  }

  function archive(main) {
    var A = D.archive;
    var root = el('section', { class: 'screen archive' });
    main.appendChild(root);

    var chipHost = el('div', { class: 'chips wrap', role: 'group', 'aria-label': 'Filter by category' });
    var count = el('p', { class: 'small dim', 'aria-live': 'polite' });
    var list = el('div', { class: 'stack' });
    var chips = {};

    ['all'].concat(A.categories).forEach(function (c) {
      var b = el('button', { class: 'chip', type: 'button', 'aria-pressed': 'false', onclick: function () { arch.cat = c; paint(); } },
        el('span', { text: c === 'all' ? 'All' : c }));
      chips[c] = b;
      chipHost.appendChild(b);
    });

    function paint() {
      Object.keys(chips).forEach(function (c) {
        var on = c === arch.cat;
        chips[c].classList.toggle('on', on);
        chips[c].setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      var shown = A.entries.filter(function (e) { return arch.cat === 'all' || e.category === arch.cat; });
      list.textContent = '';
      shown.forEach(function (e) { list.appendChild(entryCard(e)); });
      count.textContent = (arch.cat === 'all' ? 'All categories' : arch.cat) + ': ' + shown.length + (shown.length === 1 ? ' entry' : ' entries');
    }

    root.appendChild(head('More', 'Earth Archive'));
    root.appendChild(el('p', { class: 'dim', text: A.intro }));
    root.appendChild(el('div', { class: 'panel verdict-key' },
      el('h2', { class: 'panel-h', text: 'How to read an entry' }),
      ['keep', 'adapt', 'drop'].map(function (id) {
        return el('p', { class: 'small key-row' }, verdictBadge(id), el('span', { text: A.verdicts[id].line }));
      })));
    root.appendChild(chipHost);
    root.appendChild(count);
    root.appendChild(list);
    paint();

    root.appendChild(el('h2', { class: 'section-h', text: 'Elder Signals' }));
    root.appendChild(el('p', { class: 'small dim', text: 'Recipes older members have cooked all their lives. ' + A.elders.label + '.' }));
    A.elders.cards.forEach(function (c) { root.appendChild(elderCard(c)); });

    root.appendChild(el('p', { class: 'panel archive-foot center', text: A.footer }));
  }

  /* ======================================================================
     S10 Light Exchange
     ====================================================================== */

  var ex = { tab: 'learn', focusTab: '' };
  var waiting = {}; /* session id -> timer: the other person's rating arrives a moment after yours */

  function balance() {
    var e = C.state.get().exchange;
    return round1(e.taught - e.learned);
  }

  /* Hours already promised to learn from, so two bookings cannot both spend the same hour. */
  function pendingLearn() {
    return C.state.get().exchange.sessions.filter(function (s) { return s.role === 'learn' && s.state !== 'done'; }).length;
  }

  function nextSessionId() {
    var n = 0;
    C.state.get().exchange.sessions.forEach(function (s) { n = Math.max(n, parseInt(String(s.id).replace(/\D/g, ''), 10) || 0); });
    return 's' + (n + 1);
  }

  function openBook(o) {
    var st = C.state.get();
    var sheet = null, place = '', slot = '';
    var learning = o.role === 'learn';
    var tooDeep = learning && balance() - pendingLearn() - 1 < -D.exchange.debtLimit;
    var confirm = H.button('Confirm the booking', 'primary', function () {
      var s = {
        id: nextSessionId(), role: o.role, skill: o.skill, who: o.who, whoId: C.state.starId(o.who), offerId: o.offerId,
        place: byId(D.exchange.places, place).label, slot: slot, state: 'booked', mine: 0, theirs: 0
      };
      st.exchange.sessions.push(s);
      C.state.save();
      sheet.close();
      ex.tab = 'sessions';
      C.ui.toast('Booked: ' + o.skill + ' with ' + o.who + ', ' + slot);
      redrawIfOn('exchange');
    }, { disabled: true });
    function ready() { confirm.disabled = !(place && slot) || tooDeep; }

    var places = el('div', { class: 'choice-list compact', role: 'radiogroup', 'aria-label': 'Where to meet' },
      D.exchange.places.map(function (p) { return radioCard('xplace', p.id, false, p.label, p.note, function (v) { place = v; ready(); }); }));
    var slots = el('div', { class: 'choice-list compact', role: 'radiogroup', 'aria-label': 'When to meet' },
      D.exchange.slots.map(function (t) { return radioCard('xslot', t, false, t, '', function (v) { slot = v; ready(); }); }));

    sheet = C.ui.modal('Book a session', el('div', { class: 'stack' },
      el('p', {}, el('strong', { text: learning ? 'You learn: ' : 'You teach: ' }), o.skill + ', with ' + o.who + '. One hour.'),
      el('p', { class: 'small dim', text: 'Public places and rooms only. Never someone’s home.' }),
      el('h3', { class: 'sheet-sub', text: 'Where' }), places,
      el('h3', { class: 'sheet-sub', text: 'When' }), slots,
      tooDeep ? el('p', { class: 'banner', role: 'status', text: 'Teach an hour first. Your balance can dip ' + D.exchange.debtLimit + ' h below zero at most.' }) : null,
      confirm));
  }

  /* After the demo session: you rate it, then the other person's rating arrives, then the hours move. */
  function openRate(s) {
    var sheet = null, rating = 0;
    var send = H.button('Send my rating', 'primary', function () {
      s.state = 'rated';
      s.mine = rating;
      C.state.save();
      sheet.close();
      scheduleDone(s.id);
      redrawIfOn('exchange');
    }, { disabled: true });
    var seg = el('div', { class: 'scale' });
    for (var v = 1; v <= 5; v++) {
      (function (v) {
        var input = el('input', { type: 'radio', name: 'xrate', value: String(v) });
        input.addEventListener('change', function () { rating = v; send.disabled = false; });
        seg.appendChild(el('label', { class: 'scale-opt' }, input, el('span', { class: 'scale-face', text: String(v) })));
      })(v);
    }
    sheet = C.ui.modal('Rate your session', el('div', { class: 'stack' },
      el('p', { class: 'small dim', text: 'Demo: this is the moment after the session. Both of you rate it, then the hours move.' }),
      el('fieldset', { class: 'rate panel' },
        el('legend', { text: 'How was ' + s.skill + ' with ' + s.who + '? 1 is poor, 5 is great.' }), seg),
      el('p', { class: 'small dim', text: 'Ratings stay between the two of you. They are never shown to anyone else.' }),
      send));
  }

  function scheduleDone(id) {
    if (waiting[id]) return;
    waiting[id] = setTimeout(function () { delete waiting[id]; completeSession(id); }, D.exchange.waitSeconds * 1000);
  }

  /* Both sides have rated: teacher +1 h, learner −1 h. Only a taught hour earns XP. */
  function completeSession(id) {
    var st = C.state.get();
    var s = byId(st.exchange.sessions, id);
    if (!s || s.state !== 'rated') return;
    var done = st.exchange.sessions.filter(function (x) { return x.state === 'done'; }).length;
    s.state = 'done';
    s.theirs = D.exchange.theirRatings[done % D.exchange.theirRatings.length];
    if (s.role === 'teach') {
      st.exchange.taught = round1(st.exchange.taught + 1); /* before award(), which reads the teaching hours for the rank */
      C.state.addStar(s.whoId, s.who, 'Taught ' + s.skill);
      var res = C.state.award({ xp: C.state.XP.teachingHour, stat: 'relating' });
      reward(res, 'Session done · balance +1 h · +' + C.state.XP.teachingHour + ' XP');
    } else {
      st.exchange.learned = round1(st.exchange.learned + 1);
      C.state.addStar(s.whoId, s.who, 'Learned ' + s.skill + ' from ' + s.who);
      C.state.touch(); /* an hour with a person: no XP for learning, but Lumen brightens */
      C.ui.toast('Session done · balance −1 h · learning an hour earns no XP', 3800);
    }
    redrawIfOn('exchange');
  }

  function offerRow(left, body, right) {
    return el('div', { class: 'panel offer-row' }, left, el('div', { class: 'card-body' }, body), right);
  }

  function learnTab(body) {
    var st = C.state.get();
    body.appendChild(el('p', { class: 'small dim', text: 'Book an hour with a member who can teach what you want to learn. An hour you learn comes out of your balance.' }));
    D.exchange.offers.forEach(function (o) {
      var open = st.exchange.sessions.some(function (s) { return s.offerId === o.id && s.state !== 'done'; });
      body.appendChild(offerRow(
        C.people.avatar(o.name, ['violet', 'teal', 'magenta', 'sky', 'ember'][D.exchange.offers.indexOf(o) % 5], 40),
        [el('h3', { text: o.name }),
         el('p', { class: 'small' }, el('strong', { text: 'I can teach: ' }), o.teach),
         el('p', { class: 'small dim' }, el('strong', { text: 'I want to learn: ' }), o.want)],
        H.button(open ? 'Booked' : 'Book', open ? 'ghost compact' : 'primary compact', function () {
          openBook({ role: 'learn', skill: o.teach, who: o.name, offerId: o.id });
        }, { disabled: open })));
    });
  }

  function teachTab(body) {
    var st = C.state.get();
    var offers = st.exchange.offers;
    body.appendChild(el('p', { class: 'small dim', text: 'What you can teach. Each hour you teach adds an hour to your balance and earns ' + C.state.XP.teachingHour + ' XP. Demo: a member asks to learn each skill you list.' }));
    offers.forEach(function (o, i) {
      var asker = D.exchange.askers[i % D.exchange.askers.length];
      var open = st.exchange.sessions.some(function (s) { return s.offerId === o.id && s.state !== 'done'; });
      body.appendChild(offerRow(
        C.people.avatar(asker.name, 'gold', 40),
        [el('h3', { text: o.skill }),
         el('p', { class: 'small', text: asker.name + ' would like to learn this.' })],
        el('div', { class: 'offer-btns' },
          H.button(open ? 'Booked' : 'Teach ' + asker.name, open ? 'ghost compact' : 'primary compact', function () {
            openBook({ role: 'teach', skill: o.skill, who: asker.name, offerId: o.id });
          }, { disabled: open }),
          el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Remove ' + o.skill, html: icons.close, onclick: function () {
            offers.splice(i, 1);
            C.state.save();
            redrawIfOn('exchange');
          } }))));
    });
    if (!offers.length) body.appendChild(el('p', { class: 'panel dim', text: 'You have not listed anything yet. Add one below.' }));

    var input = el('input', { class: 'field', type: 'text', id: 'offerSkill', maxlength: '40', placeholder: 'For example: a bread recipe', autocomplete: 'off', spellcheck: 'false' });
    var add = el('button', { class: 'btn primary compact', type: 'submit', disabled: true }, 'Add');
    var full = offers.length >= 5;
    input.disabled = full;
    input.addEventListener('input', function () { add.disabled = full || !input.value.trim(); });
    var form = el('form', { class: 'panel stack' },
      el('label', { class: 'field-label', for: 'offerSkill', text: full ? 'You can list up to 5 skills. Remove one to add another.' : 'I can teach' }),
      el('div', { class: 'composer' }, input, add));
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var t = input.value.trim();
      if (!t || full) return;
      var n = 0;
      offers.forEach(function (o) { n = Math.max(n, parseInt(String(o.id).replace(/\D/g, ''), 10) || 0); });
      offers.push({ id: 'mine' + (n + 1), skill: t });
      C.state.save();
      C.ui.toast('Added: ' + t);
      redrawIfOn('exchange');
    });
    body.appendChild(form);
  }

  function sessionsTab(body) {
    var sessions = C.state.get().exchange.sessions;
    if (!sessions.length) {
      body.appendChild(el('div', { class: 'panel' },
        el('p', { text: 'No sessions yet.' }),
        el('p', { class: 'small dim', text: 'Book one from Learn or Teach. Sessions happen at a public place or room.' })));
      return;
    }
    sessions.slice().reverse().forEach(function (s) {
      var card = el('div', { class: 'panel session s-' + s.state },
        el('div', { class: 'offer-row' },
          C.people.avatar(s.who, s.role === 'teach' ? 'gold' : 'violet', 40),
          el('div', { class: 'card-body' },
            el('h3', { text: (s.role === 'teach' ? 'You teach: ' : 'You learn: ') + s.skill }),
            el('p', { class: 'small', text: 'With ' + s.who })),
          el('span', { class: 'badge ' + (s.state === 'done' ? 'teal' : s.state === 'rated' ? 'sky' : ''), text: s.state === 'done' ? 'Done' : s.state === 'rated' ? 'Waiting' : 'Booked' })),
        el('p', { class: 'small' }, el('span', { class: 'inline-ic', html: icons.place }), ' ' + s.place + ' · ' + s.slot));
      if (s.state === 'booked') {
        card.appendChild(H.button('Demo: skip to after the session', 'ghost', function () { openRate(s); }));
      } else if (s.state === 'rated') {
        card.appendChild(el('p', { class: 'small teal-text', role: 'status', text: 'You rated it ' + s.mine + '. Waiting for ' + s.who + ' to rate it. The hours move when you have both rated.' }));
      } else {
        card.appendChild(el('p', { class: 'small teal-text', text: 'You rated it ' + s.mine + ' · ' + s.who + ' rated it ' + s.theirs +
          ' · your balance moved ' + (s.role === 'teach' ? '+1 h and you earned ' + C.state.XP.teachingHour + ' XP' : '−1 h') }));
      }
      body.appendChild(card);
    });
  }

  function exchange(main) {
    var st = C.state.get();
    var e = st.exchange;
    var root = el('section', { class: 'screen exchange' });
    main.appendChild(root);
    st.exchange.sessions.forEach(function (s) { if (s.state === 'rated') scheduleDone(s.id); });

    var bal = balance();
    root.appendChild(head('More', 'Light Exchange', 'Hours, not money.'));
    root.appendChild(el('div', { class: 'panel balance' },
      el('p', { class: 'small dim', text: 'Your balance' }),
      el('p', { class: 'balance-num', 'aria-label': 'Balance ' + signed(bal), text: signed(bal) }),
      el('p', { class: 'small', text: 'Taught ' + hrs(e.taught) + ' · Learned ' + hrs(e.learned) })));

    var need = C.data.ranks[C.data.ranks.length - 1];
    var hoursNeeded = need.teachingHours;
    var frac = Math.min(1, e.taught / hoursNeeded);
    var line = hrs(e.taught) + ' of ' + hoursNeeded + ' teaching hours';
    root.appendChild(el('div', { class: 'panel' },
      el('h2', { class: 'panel-h', text: 'Toward ' + need.name }),
      el('div', { class: 'bar', role: 'meter', 'aria-label': 'Teaching hours toward ' + need.name, 'aria-valuemin': 0, 'aria-valuemax': hoursNeeded, 'aria-valuenow': round1(Math.min(e.taught, hoursNeeded)), 'aria-valuetext': line },
        el('div', { class: 'bar-fill', style: 'width:' + (frac * 100).toFixed(1) + '%' })),
      el('p', { class: 'small xp-text', text: line }),
      el('p', { class: 'small dim', text: need.name + ' needs ' + hoursNeeded + ' teaching hours: a supernova seeds new stars. It also needs ' + need.xp.toLocaleString('en-US') + ' XP (prototype value).' })));

    var panel = el('div', { class: 'tab-body', role: 'tabpanel', id: 'tabpanel', 'aria-labelledby': 'tab-' + ex.tab });
    var items = [{ id: 'learn', label: 'Learn' }, { id: 'teach', label: 'Teach' }, { id: 'sessions', label: 'Sessions' + (e.sessions.length ? ' (' + e.sessions.length + ')' : '') }];
    root.appendChild(C.train.tabs(items, ex.tab, function (id, viaKeyboard) {
      ex.tab = id; ex.focusTab = viaKeyboard ? id : '';
      redrawIfOn('exchange');
    }, 'Light Exchange'));
    root.appendChild(panel);
    ({ learn: learnTab, teach: teachTab, sessions: sessionsTab })[ex.tab](panel);
    if (ex.focusTab) {
      var t = document.getElementById('tab-' + ex.focusTab);
      if (t) t.focus();
      ex.focusTab = '';
    }

    root.appendChild(el('p', { class: 'small dim center', text: 'Hours, not money. Nothing here is bought or sold.' }));
  }

  /* ======================================================================
     S11 Landing Missions
     ====================================================================== */

  var mission = { focus: '' }; /* set by an Elder Signal: the mission to bring into view */

  function missionDone(id) { return C.state.get().completed.missions.indexOf(id) >= 0; }

  /* Done only after the two-sided crew code scan from S4. */
  function completeMission(m, who) {
    var st = C.state.get();
    if (missionDone(m.id)) return;
    st.completed.missions.push(m.id);
    var res = C.state.award({ xp: C.state.XP.mission, stat: 'relating' });
    reward(res, 'Mission complete with ' + who.name + ' · +' + C.state.XP.mission + ' XP');
    redrawIfOn('missions');
  }

  function missionCard(m) {
    var done = missionDone(m.id);
    var card = el('article', { class: 'panel mission' + (done ? ' done' : ''), id: 'mission-' + m.id, tabindex: '-1', 'aria-label': m.title },
      el('div', { class: 'card-row' },
        el('span', { class: 'card-ic violet', html: icons[m.icon] }),
        el('div', { class: 'card-body' },
          el('h3', { text: m.title }),
          el('p', { class: 'badges' },
            el('span', { class: 'badge sky', text: 'Can\'t be completed alone' }),
            el('span', { class: 'badge', text: '+' + C.state.XP.mission + ' XP' })))),
      el('p', { text: m.what }),
      el('p', { class: 'small dim', text: m.tip }));
    if (done) {
      card.appendChild(el('p', { class: 'small teal-text mission-done' },
        el('span', { class: 'inline-ic', html: icons.check }), ' Done: scanned with a crew member · +' + C.state.XP.mission + ' XP'));
    } else {
      card.appendChild(H.button('Scan a crew member’s code', 'primary', function () {
        C.people.openScan({ again: true, mission: m.title, onConfirmed: function (who) { completeMission(m, who); } });
      }, { icon: icons.scan }));
      card.appendChild(el('p', { class: 'small dim', text: 'Finish it with a crew member, then scan each other’s codes. Nothing else completes it.' }));
    }
    return card;
  }

  function missions(main) {
    var M = D.missions;
    var root = el('section', { class: 'screen missions' });
    main.appendChild(root);
    var n = M.items.filter(function (m) { return missionDone(m.id); }).length;

    root.appendChild(head('More', 'Landing Missions', M.week + ': ' + n + ' of ' + M.items.length + ' done'));
    root.appendChild(el('p', { class: 'dim', text: 'Things to do in the real world, with another person. Each mission is finished by the same two-sided code scan as a crew meet-up, so it only counts when someone was really there.' }));
    M.items.forEach(function (m) { root.appendChild(missionCard(m)); });
    if (n === M.items.length) root.appendChild(el('p', { class: 'panel center teal-text', text: 'All three done this week. New missions arrive next week.' }));
    root.appendChild(el('p', { class: 'small dim center', text: 'Missions earn XP only when they are completed. Time in the app earns nothing.' }));

    if (mission.focus) {
      var target = mission.focus;
      mission.focus = '';
      var card = root.querySelector('#mission-' + target);
      if (card) {
        card.classList.add('focus');
        setTimeout(function () {
          try { card.scrollIntoView({ block: 'center' }); card.focus({ preventScroll: true }); } catch (e) { /* older browsers */ }
        }, 0);
      }
    }
  }

  /* ======================================================================
     S12 Constellation and ranks
     ====================================================================== */

  var sky = { picked: '' };
  var NS = 'http://www.w3.org/2000/svg';
  var CX = 180, CY = 180;

  function svgEl(name, attrs) {
    var n = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    for (var i = 2; i < arguments.length; i++) if (arguments[i]) n.appendChild(arguments[i]);
    return n;
  }

  function starPos(i) {
    var a = -Math.PI / 2 + i * 2.399963; /* the golden angle spreads stars evenly */
    var r = Math.min(138, 62 + 24 * Math.sqrt(i));
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
  }

  /* What you did with a star: its notes, then each confirmed meeting. */
  function starNotes(star) {
    var lines = C.state.get().constellation.lines.filter(function (l) { return l.to === star.id; }).map(function (l) { return l.label; });
    var notes = [star.note].concat(star.more || []).filter(Boolean).filter(function (n) {
      return !lines.some(function (l) { return l !== n && l.indexOf(n) === 0; }); /* "Met at X" is already in "Met at X, Thursday 6 pm" */
    });
    return notes.concat(lines.filter(function (l) { return notes.indexOf(l) < 0; }));
  }

  function drawSky(host, onPick) {
    var cs = C.state.get().constellation;
    var svg = svgEl('svg', { viewBox: '0 0 360 360', class: 'sky-svg', role: 'group', 'aria-label': 'Your Constellation: you in the centre, with one star for each person' });
    var defs = svgEl('defs');
    var bg = svgEl('radialGradient', { id: 'skybg', cx: '0.5', cy: '0.5', r: '0.7' });
    bg.appendChild(svgEl('stop', { offset: '0', 'stop-color': '#2A2470', 'stop-opacity': '0.9' }));
    bg.appendChild(svgEl('stop', { offset: '0.6', 'stop-color': '#12163F', 'stop-opacity': '0.95' }));
    bg.appendChild(svgEl('stop', { offset: '1', 'stop-color': '#070B1F', 'stop-opacity': '1' }));
    defs.appendChild(bg);
    var glow = svgEl('radialGradient', { id: 'skyglow' });
    glow.appendChild(svgEl('stop', { offset: '0', 'stop-color': '#F5C451', 'stop-opacity': '0.8' }));
    glow.appendChild(svgEl('stop', { offset: '1', 'stop-color': '#F5C451', 'stop-opacity': '0' }));
    defs.appendChild(glow);
    var pg = svgEl('radialGradient', { id: 'skyperson' });
    pg.appendChild(svgEl('stop', { offset: '0', 'stop-color': '#B9A8FF', 'stop-opacity': '0.85' }));
    pg.appendChild(svgEl('stop', { offset: '1', 'stop-color': '#8B6CFF', 'stop-opacity': '0' }));
    defs.appendChild(pg);
    svg.appendChild(defs);
    svg.appendChild(svgEl('rect', { x: '0', y: '0', width: '360', height: '360', rx: '14', fill: 'url(#skybg)' }));

    /* A fixed scatter of faint background stars, so the sky looks the same every time */
    var seed = 1234567;
    function rand() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
    for (var i = 0; i < 46; i++) {
      svg.appendChild(svgEl('circle', { class: 'sky-dot', cx: (rand() * 360).toFixed(1), cy: (rand() * 360).toFixed(1), r: (0.5 + rand() * 1).toFixed(1), opacity: (0.25 + rand() * 0.5).toFixed(2) }));
    }

    /* Lines first, so the stars sit on top. One line per person met; more meetings make it thicker. */
    cs.stars.forEach(function (s, i) {
      var n = cs.lines.filter(function (l) { return l.to === s.id; }).length;
      if (!n) return;
      var p = starPos(i);
      svg.appendChild(svgEl('line', { class: 'sky-line', x1: CX, y1: CY, x2: p.x.toFixed(1), y2: p.y.toFixed(1), 'stroke-width': Math.min(4, 1 + n * 0.8).toFixed(1) }));
    });

    /* You: the central star */
    var pts = [];
    for (var k = 0; k < 10; k++) {
      var r = k % 2 === 0 ? 17 : 7.5, a = -Math.PI / 2 + k * Math.PI / 5;
      pts.push((CX + r * Math.cos(a)).toFixed(1) + ',' + (CY + 1 + r * Math.sin(a)).toFixed(1));
    }
    var me = svgEl('g', { class: 'sky-me' });
    me.appendChild(svgEl('circle', { cx: CX, cy: CY, r: '40', fill: 'url(#skyglow)' }));
    me.appendChild(svgEl('polygon', { points: pts.join(' '), fill: '#F5C451' }));
    var meText = svgEl('text', { class: 'sky-name me', x: CX, y: CY + 34, 'text-anchor': 'middle' });
    meText.textContent = 'You';
    me.appendChild(meText);
    svg.appendChild(me);

    cs.stars.forEach(function (s, i) {
      var p = starPos(i);
      var met = cs.lines.some(function (l) { return l.to === s.id; });
      var g = svgEl('g', {
        class: 'sky-star' + (met ? ' met' : '') + (sky.picked === s.id ? ' picked' : ''), 'data-star': s.id,
        transform: 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')',
        tabindex: '0', role: 'button', 'aria-label': s.name + '. Show what you did together.'
      });
      g.appendChild(svgEl('circle', { r: '24', fill: 'url(#skyperson)' }));
      g.appendChild(svgEl('circle', { class: 'st-ring', r: '13', fill: 'none' }));
      g.appendChild(svgEl('circle', { class: 'st-core', r: '6', fill: '#EEF1FF' }));
      var label = svgEl('text', { class: 'sky-name', y: '26', 'text-anchor': p.x < 52 ? 'start' : p.x > 308 ? 'end' : 'middle', x: p.x < 52 ? '-10' : p.x > 308 ? '10' : '0' });
      label.textContent = s.name;
      g.appendChild(label);
      g.appendChild(svgEl('circle', { class: 'st-hit', r: '24', fill: 'transparent' }));
      g.addEventListener('click', function () { onPick(s.id); });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(s.id); }
      });
      svg.appendChild(g);
    });

    host.textContent = '';
    host.appendChild(svg);
  }

  function constellation(main) {
    var st = C.state.get();
    var cs = st.constellation;
    var prog = C.state.progress();
    var root = el('section', { class: 'screen constellation' });
    main.appendChild(root);

    root.appendChild(head('More', 'Constellation and ranks'));

    /* Rank */
    var next = prog.next;
    var xpLine = next
      ? st.xp.toLocaleString('en-US') + ' XP · ' + Math.max(0, next.xp - st.xp).toLocaleString('en-US') + ' XP to ' + next.name +
        (prog.needsTeaching ? ', plus ' + next.teachingHours + ' teaching hours (you have ' + hrs(st.exchange.taught) + ')' : '')
      : st.xp.toLocaleString('en-US') + ' XP · top rank reached';
    root.appendChild(el('div', { class: 'panel rank-line' },
      C.ui.rankBadge(56),
      el('div', {},
        el('p', { class: 'small dim', text: 'Your rank' }),
        el('p', { class: 'rank-name', text: prog.rank.name }),
        el('p', { class: 'small', text: xpLine }))));

    /* The sky */
    var met = cs.lines.length;
    var skyHost = el('div', { class: 'panel sky-panel' });
    var detail = el('div', { class: 'panel star-detail', 'aria-live': 'polite' });
    root.appendChild(el('h2', { class: 'section-h', text: 'Your sky' }));
    root.appendChild(el('p', { class: 'small dim', text: cs.stars.length + (cs.stars.length === 1 ? ' star' : ' stars') + ' · ' + met + (met === 1 ? ' confirmed meeting' : ' confirmed meetings') }));
    root.appendChild(skyHost);
    root.appendChild(detail);
    root.appendChild(el('p', { class: 'small dim', text: 'Every person you meet, practise with or teach becomes a star. A line joins you to each person you met at a confirmed meeting. Only your own sky: it is never shown to anyone else.' }));

    function showDetail() {
      detail.textContent = '';
      var s = byId(cs.stars, sky.picked);
      if (!s) {
        detail.appendChild(el('p', { class: 'dim', text: cs.stars.length ? 'Tap a star to see the name and what you did together.' : 'No stars yet. Check in at a crew meet-up, practise in a room, or teach an hour, and the first star appears.' }));
        return;
      }
      detail.appendChild(el('div', { class: 'elder-top' },
        C.people.avatar(s.name, 'violet', 40),
        el('div', { class: 'card-body' },
          el('h3', { text: s.name }),
          el('p', { class: 'small dim', text: 'What you did together' }))));
      var ul = el('ul', { class: 'did-list' });
      starNotes(s).forEach(function (t) { ul.appendChild(el('li', { text: t })); });
      detail.appendChild(ul);
    }

    function pick(id) {
      sky.picked = id;
      var nodes = skyHost.querySelectorAll('.sky-star');
      for (var i = 0; i < nodes.length; i++) nodes[i].classList.toggle('picked', nodes[i].getAttribute('data-star') === id);
      showDetail();
    }
    if (!byId(cs.stars, sky.picked)) sky.picked = '';
    drawSky(skyHost, pick);
    showDetail();

    /* The rank ladder */
    root.appendChild(el('div', { class: 'row-head' },
      el('h2', { class: 'section-h', text: 'Rank ladder' }),
      el('span', { class: 'demo-tag', text: 'Prototype values' })));
    var ladder = el('ol', { class: 'ladder' });
    D.ranks.forEach(function (r, i) {
      var reached = i <= prog.index, here = i === prog.index;
      var need = r.xp.toLocaleString('en-US') + ' XP' + (r.teachingHours ? ' and ' + r.teachingHours + ' teaching hours' : '');
      ladder.appendChild(el('li', { class: 'panel rung' + (reached ? ' reached' : '') + (here ? ' here' : '') },
        el('span', { class: 'rung-dot', 'aria-hidden': 'true', html: reached ? icons.check : '' }),
        el('div', { class: 'card-body' },
          el('h3', { text: r.name }),
          el('p', { class: 'small dim', text: i === 0 ? 'Where everyone starts · 0 XP' : need })),
        el('span', { class: 'rung-state small', text: here ? 'You are here' : reached ? 'Reached' : i === prog.index + 1 ? 'Next' : 'Ahead' })));
    });
    root.appendChild(ladder);
    root.appendChild(el('p', { class: 'small dim', text: 'These thresholds are prototype values, not final rules. XP comes only from agent-free practice, confirmed meetings, teaching hours and missions. Time in the app earns nothing.' }));
  }

  /* ======================================================================
     S13 Privacy and settings
     ====================================================================== */

  var NEVER = ['Watches you', 'Reads your agent', 'Shows ads', 'Sells your data', 'Lets sponsors or agents in'];

  function toggleRow(id, title, line, checked, onchange) {
    var input = el('input', { type: 'checkbox', id: id, role: 'switch', checked: checked });
    input.addEventListener('change', function () { onchange(input.checked); });
    return el('label', { class: 'switch panel', for: id },
      el('span', { class: 'switch-text' },
        el('span', { class: 'switch-title', text: title }),
        el('span', { class: 'switch-line', text: line })),
      input, el('span', { class: 'track', 'aria-hidden': 'true' }));
  }

  function openDelete() {
    var sheet = null;
    sheet = C.ui.modal('Delete everything?', el('div', { class: 'stack' },
      el('p', { text: 'This clears your goal, scores, XP, crew choices, Constellation and settings from this phone, and takes you back to the start.' }),
      el('p', { class: 'small dim', text: 'It cannot be undone. Constella keeps nothing anywhere else, so there is nothing left to ask for back.' }),
      H.button('Delete everything', 'danger', function () {
        sheet.close();
        C.app.resetAll(); /* back to the seed state and S0 */
        /* One fresh start for the whole page, so nothing typed in this session (chat messages, photos) stays in memory. */
        try { location.reload(); } catch (e) { /* the reset above already put the app back at S0 */ }
      }),
      H.button('Keep my data', 'ghost', function () { sheet.close(); })));
  }

  function privacy(main) {
    var st = C.state.get();
    var root = el('section', { class: 'screen privacy' });
    main.appendChild(root);

    root.appendChild(head('More', 'Privacy and settings'));

    /* What Constella knows */
    var goal = H.goalLabel(st.user.goal);
    var hood = D.map.hoods.filter(function (h) { return h.id === D.map.home.hood; })[0];
    var know = [
      ['Your goal', goal || 'Not chosen yet'],
      ['Your first name', st.user.name + (st.user.visibility === 'visible' ? ' (shown on the Star Map)' : ' (kept private)')],
      ['A rough area', hood.name + ', ' + D.city.name + '. An area, never a street or a pin.'],
      ['Your availability', 'The times you pick for meet-ups, such as ' + D.crew.nextMeetup.when + '.'],
      ['Your own scores', 'Unaided ' + st.week.unaidedScore + ', with your agent ' + st.week.assistedScore + ', together hours ' + H.hours(st.week.togetherHours) + '. They stay on this phone.']
    ];
    root.appendChild(el('div', { class: 'panel' },
      el('h2', { class: 'panel-h', text: 'What Constella knows about you' }),
      el('dl', { class: 'know-list' }, know.map(function (r) {
        return el('div', { class: 'know-row' }, el('dt', { text: r[0] }), el('dd', { text: r[1] }));
      })),
      el('p', { class: 'small dim', text: 'Nothing else.' })));

    /* What it never does */
    root.appendChild(el('div', { class: 'panel' },
      el('h2', { class: 'panel-h', text: 'What it never does' }),
      el('ul', { class: 'never-list' }, NEVER.map(function (t) {
        return el('li', {}, el('span', { class: 'never-ic', html: icons.block }), el('span', { text: 'Never ' + t.charAt(0).toLowerCase() + t.slice(1) }));
      }))));

    /* Settings */
    root.appendChild(el('h2', { class: 'section-h', text: 'Settings' }));
    var vis = el('div', { class: 'panel stack' },
      el('h3', { text: 'Map visibility' }),
      el('p', { class: 'small dim', text: 'How you appear on the Star Map.' }),
      el('div', { class: 'choice-list', role: 'radiogroup', 'aria-label': 'Map visibility' }, D.visibility.map(function (v) {
        return radioCard('privvis', v.id, st.user.visibility === v.id, v.label, v.line, function (val) {
          st.user.visibility = val;
          C.state.save();
          C.ui.toast('Star Map: ' + v.label);
        });
      })));
    root.appendChild(vis);
    root.appendChild(toggleRow('privWomen', 'Women-only view', 'Off by default. When on, you see and appear in women-only clusters and crews.', st.user.womenOnly, function (on) {
      st.user.womenOnly = on;
      C.state.save();
      C.ui.toast(on ? 'Women-only view is on' : 'Women-only view is off');
    }));
    root.appendChild(toggleRow('privMotion', 'Reduced motion', 'Stops the star twinkle, Lumen’s float and the Ascend burst.', st.settings.reducedMotion, function (on) {
      st.settings.reducedMotion = on;
      C.state.save();
      C.app.applyMotion();
      var demo = document.getElementById('motionSwitch'); /* the Demo controls switch says the same thing, the other way round */
      if (demo) demo.checked = !on;
    }));

    /* Delete everything */
    root.appendChild(el('div', { class: 'panel danger-zone' },
      el('h2', { class: 'panel-h', text: 'Delete everything' }),
      el('p', { class: 'small', text: 'Removes all of it from this phone and starts again from the Welcome screen.' }),
      H.button('Delete everything', 'danger', openDelete, { icon: icons.close })));
  }

  C.screens.archive = archive;
  C.screens.exchange = exchange;
  C.screens.missions = missions;
  C.screens.constellation = constellation;
  C.screens.privacy = privacy;

  return {};
})();
