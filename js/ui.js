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
    close:  svg('<path d="M6 6l12 12M18 6 6 18"/>')
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

  return { el: el, icons: icons, toast: toast, modal: modal };
})();
