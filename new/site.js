(function () {
  'use strict';
  var menu = document.getElementById('site-menu');
  var open = document.querySelector('.site-menu-open');
  if (!menu || !open) return;
  open.addEventListener('click', function () { menu.showModal(); });
  menu.addEventListener('click', function (event) { if (event.target === menu && event.offsetX < 0) menu.close(); });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1200 && menu.open) menu.close(); });

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
  var leavingViaLink = false;
  // A new interaction cancels a previous link departure that did not navigate.
  ['wheel','touchstart','pointerdown','keydown'].forEach(function (type) {
    window.addEventListener(type, function () { leavingViaLink = false; }, {passive:true});
  });
  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    savePosition();
    // Preserve the stable click position: page exit can reflow fonts before pagehide.
    try {
      var destination = new URL(link.href, location.href);
      leavingViaLink = /^https?:$/.test(destination.protocol) &&
        (destination.origin !== location.origin || destination.pathname !== location.pathname || destination.search !== location.search);
    } catch (e) { leavingViaLink = false; }
    if (menu.open) menu.close();
  });
  window.addEventListener('pagehide', function () {
    if (!leavingViaLink) savePosition();
    if (menu.open) menu.close();
  });
  window.addEventListener('pageshow', function (event) {
    leavingViaLink = false;
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
