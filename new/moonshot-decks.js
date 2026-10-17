(function () {
  'use strict';
  var viewer = document.getElementById('moonshot-viewer');
  if (!viewer) return;
  var image = document.getElementById('moonshot-slide');
  var previous = document.getElementById('moonshot-prev');
  var next = document.getElementById('moonshot-slide-next');
  var fullscreen = document.getElementById('moonshot-fullscreen');
  var status = document.getElementById('moonshot-deck-status');
  var buttons = Array.from(document.querySelectorAll('[data-moonshot-deck]'));
  var config, selected = 'fiscal', index = 0, revision = 0;
  function controls(busy) {
    viewer.setAttribute('aria-busy', String(busy));
    buttons.forEach(function (button) { button.disabled = busy || !config; });
    previous.disabled = busy || !config || index === 0;
    next.disabled = busy || !config || index === config.decks[selected].slides.length - 1;
    fullscreen.disabled = busy || !config;
  }
  async function show(key, number) {
    var token = ++revision;
    var deck = config.decks[key], slide = deck.slides[number];
    controls(true);
    try {
      var loaded = new Image(); loaded.src = slide.src;
      await loaded.decode();
      if (token !== revision) return;
      selected = key; index = number; image.src = slide.src;
      image.alt = deck.title + ', slide ' + (number + 1) + ' of ' + deck.slides.length + ': ' + slide.title;
      document.getElementById('moonshot-count').textContent = (number + 1) + ' / ' + deck.slides.length;
      document.getElementById('moonshot-large').href = slide.src;
      buttons.forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.moonshotDeck === key)); });
      status.textContent = deck.title + '. Slide ' + (number + 1) + ': ' + slide.title + '.';
    } catch (error) { status.textContent = 'This slide could not load. Try again or open the deck PDF below.'; }
    finally { if (token === revision) controls(false); }
  }
  function move(step) {
    if (!config || viewer.getAttribute('aria-busy') === 'true') return;
    var number = index + step;
    if (number >= 0 && number < config.decks[selected].slides.length) show(selected, number);
  }
  previous.addEventListener('click', function () { move(-1); });
  next.addEventListener('click', function () { move(1); });
  buttons.forEach(function (button) { button.addEventListener('click', function () { if (config) show(button.dataset.moonshotDeck, 0); }); });
  viewer.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
  });
  fullscreen.addEventListener('click', async function () {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await viewer.requestFullscreen(); }
    catch (error) { status.textContent = 'Use Open slide larger to view the slide at full size.'; }
  });
  fetch('/new/moonshot-decks/manifest.json', {cache:'no-store'})
    .then(function (response) { if (!response.ok) throw new Error('Manifest unavailable'); return response.json(); })
    .then(function (data) { config = data; controls(false); })
    .catch(function () { status.textContent = 'Use the PDF link below to read the deck. Slide controls could not load.'; });
})();
