/* LED Matrix Suite — shared nav + TH/EN engine
   Translation strategy: the pages are authored in Thai; switching to EN swaps every
   text node through a normalised dictionary (assets/i18n.js). <pre> is left alone so
   code keeps its layout. Canvas labels go through LMX.t(). */
(function () {
  "use strict";
  var LS = 'lmx_lang';
  var D = window.LMX_EN || {};
  var norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };
  var lang = 'th';
  try { lang = localStorage.getItem(LS) || 'th'; } catch (e) {}

  var orig = new WeakMap();
  var busy = false;
  var listeners = [];

  var PAGES = [
    { href: 'index.html',   key: 'nav_overview' },
    { href: 'system.html',  key: 'nav_system' },
    { href: 'scale.html',   key: 'nav_scale' },
    { href: 'diagram.html', key: 'nav_diagram' }
  ];
  var NAV = {
    nav_overview: ['ภาพรวม', 'Overview'],
    nav_system:   ['ระบบสไลซ์', 'Slicing System'],
    nav_scale:    ['ขยายสเกล', 'Scaling Up'],
    nav_diagram:  ['ผังติดตั้ง', 'Install Map']
  };

  function skip(el) {
    return !el || !!el.closest('pre, code.keep, script, style, #lmxnav');
  }

  function trNode(n) {
    var p = n.parentElement;
    if (skip(p)) return;
    var raw = n.nodeValue;
    var key = norm(raw);
    if (!key || key.length < 2) return;
    if (lang === 'en') {
      var en = D[key];
      if (!en) return;
      if (!orig.has(n)) orig.set(n, raw);
      var next = raw.replace(raw.trim(), en);
      if (n.nodeValue !== next) n.nodeValue = next;
    } else {
      var o = orig.get(n);
      if (o !== undefined && n.nodeValue !== o) n.nodeValue = o;
    }
  }

  function walk(root) {
    if (!root) return;
    busy = true;
    if (root.nodeType === 3) { trNode(root); busy = false; return; }
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = w.nextNode())) trNode(n);
    busy = false;
  }

  function applyTitle() {
    if (!document.title) return;
    if (!applyTitle.th) applyTitle.th = document.title;
    var t = D[norm(applyTitle.th)];
    document.title = (lang === 'en' && t) ? t : applyTitle.th;
  }

  function apply() {
    walk(document.body);
    applyTitle();
    document.documentElement.lang = lang;
    var bar = document.querySelector('#lmxnav .lang');
    if (bar) [].forEach.call(bar.children, function (b) { b.classList.toggle('on', b.dataset.lang === lang); });
    [].forEach.call(document.querySelectorAll('#lmxnav a.lk'), function (a) {
      var k = a.dataset.key;
      if (NAV[k]) a.textContent = NAV[k][lang === 'en' ? 1 : 0];
    });
    // diagram.html ships its own i18n (th/en/zh) — drive it too
    if (typeof window.applyLang === 'function') { try { window.applyLang(lang); } catch (e) {} }
    listeners.forEach(function (f) { try { f(lang); } catch (e) {} });
  }

  function setLang(l) {
    lang = l;
    try { localStorage.setItem(LS, l); } catch (e) {}
    window.LMX.lang = l;
    apply();
  }

  function buildNav() {
    var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var nav = document.createElement('nav');
    nav.id = 'lmxnav';
    var links = PAGES.map(function (p) {
      var on = (p.href.toLowerCase() === here) ? ' on' : '';
      return '<a class="lk' + on + '" data-key="' + p.key + '" href="' + p.href + '">' +
        NAV[p.key][lang === 'en' ? 1 : 0] + '</a>';
    }).join('');
    nav.innerHTML =
      '<div class="in">' +
      '<a class="brand" href="index.html"><span class="dot"></span>LED&nbsp;Matrix <span>Suite</span></a>' +
      '<div class="links">' + links + '</div>' +
      '<div class="lang"><button data-lang="th">ไทย</button><button data-lang="en">EN</button></div>' +
      '</div>';
    document.body.insertBefore(nav, document.body.firstChild);
    nav.querySelector('.lang').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (b) setLang(b.dataset.lang);
    });
    // keep in sync when diagram.html's own bar is used
    var own = document.getElementById('langbar');
    if (own) own.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var l = b.dataset.lang;
      try { localStorage.setItem(LS, l === 'zh' ? 'en' : l); } catch (err) {}
      lang = (l === 'zh') ? lang : l;
      window.LMX.lang = lang;
      var bar = document.querySelector('#lmxnav .lang');
      if (bar) [].forEach.call(bar.children, function (x) { x.classList.toggle('on', x.dataset.lang === l); });
    });
  }

  window.LMX = {
    lang: lang,
    t: function (th) {
      if (lang !== 'en') return th;
      return D[norm(th)] || th;
    },
    onLang: function (f) { listeners.push(f); },
    set: setLang
  };

  function boot() {
    buildNav();
    apply();
    var mo = new MutationObserver(function (muts) {
      if (busy || lang !== 'en') return;
      muts.forEach(function (m) {
        if (m.type === 'characterData') trNode(m.target);
        else [].forEach.call(m.addedNodes, function (n) {
          if (n.nodeType === 1 || n.nodeType === 3) walk(n);
        });
      });
    });
    mo.observe(document.body, { childList: true, characterData: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
