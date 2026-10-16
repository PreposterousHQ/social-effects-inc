(function () {
  'use strict';
  var menu = document.getElementById('site-menu');
  var open = document.querySelector('.site-menu-open');
  if (!menu || !open) return;
  open.addEventListener('click', function () { menu.showModal(); });
  menu.addEventListener('click', function (event) { if (event.target === menu && event.offsetX < 0) menu.close(); });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1200 && menu.open) menu.close(); });
})();
