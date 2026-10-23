/* Constella prototype: small UI helpers. Icons are inline SVG strings; nothing is fetched. */
window.C = window.C || {};

C.ui = (function () {
  /* el('div', { class: 'x', onclick: fn, 'aria-label': 'y' }, 'text', childNode, ...) */
  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'html') node.innerHTML = v; /* only ever our own icon strings */
        else if (k.indexOf('on') === 0 && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v === true ? '' : v);
      });
    }
    for (var i = 2; i < arguments.length; i++) append(node, arguments[i]);
    return node;
  }

  function append(node, child) {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) { child.forEach(function (c) { append(node, c); }); return; }
    node.appendChild(typeof child === 'object' ? child : document.createTextNode(String(child)));
  }

  /* 24x24 line icons that inherit colour from the text. */
  function svg(inner) {
    return '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      inner + '</svg>';
  }

  var icons = {
    home:   svg('<path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/>'),
    map:    svg('<path d="M12 21s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.8-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/>'),
    crew:   svg('<circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.4"/><path d="M3.5 19c.5-3 2.7-5 5.5-5s5 2 5.5 5"/><path d="M15.5 14.4c2.2.1 4 1.7 4.5 4.6"/>'),
    train:  svg('<path d="M12 3l2.4 5.6L20 9.3l-4.2 3.9 1.2 5.8L12 15.9 7 19l1.2-5.8L4 9.3l5.6-.7z"/>'),
    shield: svg('<path d="M12 3l7 3v5.5c0 4.3-2.9 7.6-7 9.5-4.1-1.9-7-5.2-7-9.5V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>'),
    close:  svg('<path d="M6 6l12 12M18 6 6 18"/>'),

    back:    svg('<path d="M15 5l-7 7 7 7"/>'),
    next:    svg('<path d="M9 5l7 7-7 7"/>'),
    check:   svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    flame:   svg('<path d="M12 3c1 3.5 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 1.5 1 2 1.5 2C10 8 11 5 12 3z"/>'),
    calendar: svg('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>'),
    place:   svg('<path d="M12 21s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.8-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/>'),
    more:    svg('<circle cx="5.5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="18.5" cy="12" r="1.4" fill="currentColor"/>'),

    lock:    svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
    unlock:  svg('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>'),
    shoot:   svg('<path d="M20 4l-3.1 6.2L11 11l5 1 .8 5.5L20 4z"/><path d="M12 12l-8 8M9 9l-4 4M15 15l-4 4"/>'),
    flag:    svg('<path d="M6 21V4M6 5h11l-2 4 2 4H6"/>'),
    block:   svg('<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>'),
    send:    svg('<path d="M4 12 20 4l-4 16-4-7z"/><path d="M12 13l8-9"/>'),
    scan:    svg('<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16"/>'),
    signal:  svg('<path d="M12 3v2M5.6 6.6 7 8M18.4 6.6 17 8"/><path d="M7 14a5 5 0 0 1 10 0v2l1.5 2h-13L7 16z"/><path d="M10 20.5h4"/>'),
    edit:    svg('<path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z"/><path d="M14 7l3 3"/>'),
    eye:     svg('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>'),
    star:    svg('<path d="M12 3l2.4 5.6L20 9.3l-4.2 3.9 1.2 5.8L12 15.9 7 19l1.2-5.8L4 9.3l5.6-.7z"/>'),

    /* goals */
    exam:       svg('<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4"/><path d="M10 14l2 2 3.5-4"/>'),
    language:   svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>'),
    instrument: svg('<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>'),
    job:        svg('<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18"/>'),
    code:       svg('<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>'),
    cook:       svg('<path d="M5 11h14v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><path d="M3 11h18M9 7c0-1.5 1-1.5 1-3M14 7c0-1.5 1-1.5 1-3"/>'),
    fit:        svg('<path d="M6 8v8M3.5 10v4M18 8v8M20.5 10v4M6 12h12"/>'),

    /* stats */
    relating:    svg('<circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.4"/><path d="M3.5 19c.5-3 2.7-5 5.5-5s5 2 5.5 5"/><path d="M15.5 14.4c2.2.1 4 1.7 4.5 4.6"/>'),
    doing:       svg('<path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5z"/>'),
    thinking:    svg('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>'),
    persevering: svg('<path d="M3 19l6-10 4 6 2-3 6 7z"/>')
  };

  /* A short message that fades out by itself. */
  function toast(message, ms) {
    var host = document.getElementById('toastHost');
    if (!host) return;
    var t = el('div', { class: 'toast', text: message });
    host.appendChild(t);
    setTimeout(function () {
      t.classList.add('out');
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 300);
    }, ms || 2600);
  }

  /* A bottom sheet over the phone screen. Returns { close }. */
  function modal(title, content) {
    var host = document.getElementById('overlayHost');
    if (!host) return { close: function () {} };
    var opener = document.activeElement;
    var sheet, scrim;

    function close() {
      if (scrim.parentNode) scrim.parentNode.removeChild(scrim);
      document.removeEventListener('keydown', onKey);
      if (opener && opener.focus) opener.focus();
    }
    function onKey(e) { if (e.key === 'Escape') close(); }

    var closeBtn = el('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Close', html: icons.close, onclick: close });
    sheet = el('div', { class: 'sheet panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      el('div', { class: 'sheet-head' }, el('h2', { text: title }), closeBtn),
      content);
    scrim = el('div', { class: 'scrim', onclick: function (e) { if (e.target === scrim) close(); } }, sheet);
    host.appendChild(scrim);
    document.addEventListener('keydown', onKey);
    closeBtn.focus();
    return { close: close };
  }

  /* Lumen, the companion: a soft orb with two dot eyes and a halo. It never talks and has no speech bubble.
     mood: 'calm' (default), 'bright' (agent-free activity today) or 'dim' (none yet). */
  var lumenCount = 0;
  var MOODS = { calm: 'Lumen, your companion, glowing steadily', bright: 'Lumen, your companion, glowing brightly', dim: 'Lumen, your companion, resting dim' };
  function lumen(opts) {
    opts = opts || {};
    var mood = MOODS[opts.mood] ? opts.mood : 'calm';
    var size = opts.size || 64;
    var id = 'lm' + (++lumenCount);
    var node = el('div', { class: 'lumen ' + mood + (opts.float === false ? '' : ' float'), role: 'img', 'aria-label': MOODS[mood] });
    node.style.width = node.style.height = size + 'px';
    node.innerHTML =
      '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
      '<defs>' +
      '<radialGradient id="' + id + 'h"><stop offset="0" stop-color="#B9A8FF" stop-opacity="0.85"/><stop offset="0.55" stop-color="#8B6CFF" stop-opacity="0.35"/><stop offset="1" stop-color="#8B6CFF" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + id + 'o" cx="0.42" cy="0.38" r="0.7"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.45" stop-color="#D9D0FF"/><stop offset="1" stop-color="#8B6CFF"/></radialGradient>' +
      '</defs>' +
      '<circle class="lm-halo" cx="50" cy="50" r="48" fill="url(#' + id + 'h)"/>' +
      '<g class="lm-rays" stroke="#F5C451" stroke-width="2" stroke-linecap="round"><path d="M50 8v6M50 86v6M8 50h6M86 50h6M20 20l4 4M76 76l4 4M80 20l-4 4M24 76l-4 4"/></g>' +
      '<circle class="lm-orb" cx="50" cy="50" r="24" fill="url(#' + id + 'o)"/>' +
      '<circle class="lm-eye" cx="42" cy="51" r="2.8" fill="#1B1745"/><circle class="lm-eye" cx="58" cy="51" r="2.8" fill="#1B1745"/>' +
      '<circle cx="43" cy="50" r="0.9" fill="#fff"/><circle cx="59" cy="50" r="0.9" fill="#fff"/>' +
      '</svg>';
    return node;
  }

  /* Rank badge: a hexagon with a star. The rank name and pips sit beside it, so rank never relies on the badge alone. */
  function rankBadge(size) {
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var r = i % 2 === 0 ? 17 : 7.5, a = -Math.PI / 2 + i * Math.PI / 5;
      pts.push((36 + r * Math.cos(a)).toFixed(1) + ',' + (37 + r * Math.sin(a)).toFixed(1));
    }
    var node = el('span', { class: 'rank-badge', 'aria-hidden': 'true' });
    node.style.width = node.style.height = (size || 72) + 'px';
    node.innerHTML =
      '<svg viewBox="0 0 72 72" focusable="false">' +
      '<path d="M36 4l28 16v32L36 68 8 52V20z" fill="rgba(245,196,81,0.12)" stroke="#F5C451" stroke-width="2" stroke-linejoin="round"/>' +
      '<polygon points="' + pts.join(' ') + '" fill="#F5C451"/>' +
      '</svg>';
    return node;
  }

  return { el: el, icons: icons, toast: toast, modal: modal, lumen: lumen, rankBadge: rankBadge };
})();
