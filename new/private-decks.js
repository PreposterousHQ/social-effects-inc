(function () {
  'use strict';
  var shell = document.getElementById('deck-viewer-shell');
  if (!shell) return;
  var form = document.getElementById('deck-unlock');
  var input = document.getElementById('deck-password');
  var image = document.getElementById('deck-slide');
  var status = document.getElementById('deck-status');
  var error = document.getElementById('deck-error');
  var controls = document.getElementById('deck-controls');
  var prev = document.getElementById('deck-prev');
  var next = document.getElementById('deck-next');
  var text = document.getElementById('deck-slide-text');
  var transcript = document.getElementById('deck-transcript');
  var buttons = Array.from(document.querySelectorAll('[data-deck]'));
  var key = null, config = null, selected = 'lab', manifest = null, index = 0;
  var sequence = 0, blobURL = null, loading = false;
  var decoder = new TextDecoder(), encoder = new TextEncoder();
  var configPromise = get('/new/decks/config.json').then(function (r) { return r.json(); }).then(function (data) { config = data; return data; });
  configPromise.catch(function () { error.textContent = 'The presentations could not load. Please reload the page to try again.'; });
  async function get(url) {
    var response = await fetch(url, {credentials:'omit', referrerPolicy:'no-referrer', cache:'no-store'});
    if (!response.ok) throw new Error('Could not load the presentation. Please try again.');
    return response;
  }
  async function decrypt(file, unlockKey) {
    var bytes = new Uint8Array(await (await get(file)).arrayBuffer());
    if (decoder.decode(bytes.slice(0,5)) !== 'DECK1') throw new Error('The presentation file is unavailable. Please try again.');
    return crypto.subtle.decrypt({name:'AES-GCM', iv:bytes.slice(5,17), additionalData:encoder.encode(file)}, unlockKey, bytes.slice(17));
  }
  function busy(value) {
    loading = value;
    shell.setAttribute('aria-busy', String(value));
    form.querySelector('button').disabled = value;
    buttons.forEach(function (b) { b.disabled = value; });
    prev.disabled = value || index === 0;
    next.disabled = value || !manifest || index === manifest.slides.length - 1;
  }
  function clearSlide() {
    image.removeAttribute('src');
    if (blobURL) URL.revokeObjectURL(blobURL);
    blobURL = null;
    text.textContent = '';
    transcript.open = false;
  }
  function cover() {
    clearSlide();
    if (config) { image.src = config.decks[selected].cover; image.alt = config.decks[selected].title + ' cover preview'; }
  }
  async function showSlide(n, token, unlockKey) {
    var slide = manifest.slides[n];
    clearSlide();
    status.textContent = 'Loading slide ' + (n+1) + '…';
    var plain = await decrypt(slide.file, unlockKey);
    if (token !== sequence || !key) return;
    blobURL = URL.createObjectURL(new Blob([plain], {type:'image/jpeg'}));
    image.src = blobURL;
    image.alt = manifest.title + ', slide ' + (n+1) + ' of ' + manifest.slides.length;
    text.textContent = slide.text;
    index = n;
    document.getElementById('deck-count').textContent = (n+1) + ' / ' + manifest.slides.length;
    status.textContent = 'Slide ' + (n+1) + ' of ' + manifest.slides.length + '. ' + manifest.title + '.';
  }
  async function loadSelected(token, unlockKey) {
    var data = JSON.parse(decoder.decode(await decrypt(config.decks[selected].manifest, unlockKey)));
    if (token !== sequence) return;
    if (data.version !== 1 || !Array.isArray(data.slides) || !data.slides.length) throw new Error('This presentation could not load.');
    manifest = data;
    key = unlockKey;
    await showSlide(0, token, unlockKey);
    if (token !== sequence) return;
    form.hidden = true; controls.hidden = false; transcript.hidden = false;
    shell.classList.add('is-unlocked');
  }
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (loading) return;
    var token = ++sequence;
    error.textContent = ''; input.removeAttribute('aria-invalid'); busy(true);
    status.textContent = 'Unlocking the proposal decks…';
    try {
      if (!crypto.subtle) throw new Error('Please use a current browser with a secure HTTPS connection.');
      await configPromise;
      var material = await crypto.subtle.importKey('raw', encoder.encode(input.value), 'PBKDF2', false, ['deriveKey']);
      var salt = Uint8Array.from(atob(config.salt), function (c) { return c.charCodeAt(0); });
      var unlockKey = await crypto.subtle.deriveKey({name:'PBKDF2', hash:'SHA-256', salt:salt, iterations:config.iterations}, material, {name:'AES-GCM', length:256}, false, ['decrypt']);
      input.value = '';
      await loadSelected(token, unlockKey);
    } catch (e) {
      if (token !== sequence) return;
      key = null; manifest = null; cover();
      error.textContent = e.name === 'OperationError' ? 'That password did not unlock these slides. Please try again.' : e.message;
      input.setAttribute('aria-invalid', 'true'); input.focus(); status.textContent = 'Proposal deck locked.';
    } finally { input.value = ''; if (token === sequence) busy(false); }
  });
  buttons.forEach(function (button) {
    button.addEventListener('click', async function () {
      if (loading) return;
      var token = ++sequence;
      selected = button.dataset.deck; index = 0; manifest = null;
      error.textContent = '';
      try {
        await configPromise;
        var deck = config.decks[selected];
        document.getElementById('deck-heading').textContent = deck.title;
        document.querySelector('.deck-caption').textContent = deck.caption;
        document.querySelector('.degree-status').hidden = selected !== 'education';
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
        cover();
        if (key) { busy(true); await loadSelected(token, key); }
        else status.textContent = 'Proposal deck preview. Enter the password to view the slides.';
      } catch (e) { error.textContent = 'This presentation could not load. Please try another deck or reload.'; }
      finally { if (token === sequence) busy(false); }
    });
  });
  async function move(delta) {
    if (loading || !key || !manifest || index+delta < 0 || index+delta >= manifest.slides.length) return;
    var token = ++sequence; busy(true); error.textContent = '';
    try { await showSlide(index+delta, token, key); }
    catch (e) { error.textContent = 'That slide could not load. Please try again.'; }
    finally { if (token === sequence) busy(false); }
  }
  prev.addEventListener('click', function () { move(-1); });
  next.addEventListener('click', function () { move(1); });
  shell.addEventListener('keydown', function (event) {
    if (event.target.matches('input,textarea') || !key) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
  });
  document.getElementById('deck-lock').addEventListener('click', function () {
    sequence++; key = null; manifest = null; index = 0;
    cover(); controls.hidden = true; transcript.hidden = true; form.hidden = false;
    shell.classList.remove('is-unlocked'); error.textContent = ''; input.value = ''; input.removeAttribute('aria-invalid');
    status.textContent = 'Proposal deck locked.'; busy(false); input.focus();
  });
  document.getElementById('deck-fullscreen').addEventListener('click', async function () {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await shell.requestFullscreen(); }
    catch (e) { status.textContent = 'Full screen is unavailable in this browser. You can continue here.'; }
  });
})();
