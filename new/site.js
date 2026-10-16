(function () {
  'use strict';
  var menu = document.getElementById('site-menu');
  var open = document.querySelector('.site-menu-open');
  if (!menu || !open) return;
  open.addEventListener('click', function () { menu.showModal(); });
  menu.addEventListener('click', function (event) { if (event.target === menu && event.offsetX < 0) menu.close(); });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1200 && menu.open) menu.close(); });

  var pageNames = {
    '/new/': 'Home',
    '/new/our-practice.html': 'Our Practice',
    '/new/offerings.html': 'Presentations & Labs',
    '/new/production-services.html': 'Production Services',
    '/new/film-biz-recycling.html': 'Production Reuse',
    '/new/values.html': 'Values & Vision',
    '/new/team.html': 'About Social Effects NJ',
    '/new/contact.html': 'Contact',
    '/new/moonshot.html': 'the Practical Moonshot',
    '/new/filmanthropy-history.html': 'the History of Filmanthropy',
    '/new/why-filmmaking-is-civic.html': 'Filmmaking & AI',
    '/filmanthropyledger/': 'the Ledger'
  };
  function pagePath(url) {
    return url.pathname.replace(/^\/new(?:\/index\.html)?$/, '/new/').replace(/^\/filmanthropyledger$/, '/filmanthropyledger/');
  }
  function state() {
    return history.state && typeof history.state === 'object' ? history.state : {};
  }
  function remember(update) {
    try {
      var current = state();
      history.replaceState(Object.assign({}, current, {socialEffectsNJ:Object.assign({}, current.socialEffectsNJ, update)}), '');
    } catch (e) { /* Ordinary page links still work when history state is unavailable. */ }
  }
  function savePosition() {
    remember({position:{x:window.scrollX, y:window.scrollY}});
  }
  var returnTo = state().socialEffectsNJ && state().socialEffectsNJ.returnTo;
  if (!returnTo && document.referrer) {
    try {
      var previous = new URL(document.referrer);
      if (previous.origin === location.origin && pageNames[pagePath(previous)] && pagePath(previous) !== pagePath(new URL(location.href))) {
        returnTo = {url:previous.pathname + previous.search + previous.hash, canGoBack:history.length > 1};
        remember({returnTo:returnTo});
      }
    } catch (e) { /* Direct landings retain their explicit parent-page link. */ }
  }
  if (returnTo) {
    try {
      var destination = new URL(returnTo.url, location.origin);
      if (destination.origin === location.origin && pageNames[pagePath(destination)]) {
        document.querySelectorAll('[data-return-link]').forEach(function (link) {
          link.href = destination.pathname + destination.search + destination.hash;
          link.textContent = '← Back to ' + pageNames[pagePath(destination)];
          link.closest('[data-return-nav]').hidden = false;
          link.addEventListener('click', function (event) {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !returnTo.canGoBack || history.length < 2) return;
            event.preventDefault();
            savePosition();
            history.back();
          });
        });
      }
    } catch (e) { /* An invalid stored destination cannot replace a safe fallback. */ }
  }
  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    savePosition();
    if (menu.open) menu.close();
  });
  window.addEventListener('pagehide', function () {
    savePosition();
    if (menu.open) menu.close();
  });
  window.addEventListener('pageshow', function (event) {
    var navigation = performance.getEntriesByType('navigation')[0];
    var saved = state().socialEffectsNJ && state().socialEffectsNJ.position;
    if (!saved || !(event.persisted || navigation && (navigation.type === 'back_forward' || navigation.type === 'reload'))) return;
    function restore() {
      requestAnimationFrame(function () {
        window.scrollTo({left:saved.x, top:saved.y, behavior:'instant'});
      });
    }
    if (document.fonts) document.fonts.ready.then(restore); else restore();
  });
})();
