// Package approved public deck snapshots; never change source Google permissions.
// Input JSON outside this repo: {fiscal:{title,pdf,slides:[{file,title}]},engine:{...}}.
// Export the two approved source PDFs, render JPEGs at 1600px, then run:
// node scripts/package-moonshot-decks.cjs <private-input.json>
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
if (!process.argv[2]) throw Error('Provide the approved snapshot input JSON path.');
const input = JSON.parse(fs.readFileSync(path.resolve(process.argv[2]), 'utf8'));
const destination = path.join(root, 'new/moonshot-decks');
const manifest = {version:1, exported:new Date().toISOString().slice(0,10), decks:{}};
function hash(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex').slice(0,10); }
for (const key of ['fiscal', 'engine']) {
  const deck = input[key];
  if (!deck || !deck.title || !Array.isArray(deck.slides) || !deck.slides.length) throw Error('Incomplete approved deck: ' + key);
  fs.mkdirSync(path.join(destination, key), {recursive:true});
  const pdf = fs.readFileSync(path.resolve(deck.pdf));
  if (pdf.subarray(0,5).toString() !== '%PDF-') throw Error('Invalid PDF: ' + key);
  const pdfName = key + '-' + hash(pdf) + '.pdf';
  fs.writeFileSync(path.join(destination, pdfName), pdf);
  const slides = deck.slides.map(function (slide, index) {
    const bytes = fs.readFileSync(path.resolve(slide.file));
    if (!slide.title || bytes[0] !== 255 || bytes[1] !== 216) throw Error('Invalid slide: ' + key + ' ' + (index + 1));
    const name = String(index + 1).padStart(2,'0') + '-' + hash(bytes) + '.jpg';
    fs.writeFileSync(path.join(destination, key, name), bytes);
    return {src:'/new/moonshot-decks/' + key + '/' + name, title:slide.title};
  });
  manifest.decks[key] = {title:deck.title, pdf:'/new/moonshot-decks/' + pdfName, slides:slides};
}
fs.writeFileSync(path.join(destination, 'manifest.json'), JSON.stringify(manifest,null,2) + '\n');
const file = path.join(root, 'new/moonshot.html');
let html = fs.readFileSync(file, 'utf8');
html = html.replace(/(<img id="moonshot-slide" src=")[^"]+/, '$1' + manifest.decks.fiscal.slides[0].src);
const description = manifest.decks.fiscal.title + ', slide 1 of ' + manifest.decks.fiscal.slides.length + ': ' + manifest.decks.fiscal.slides[0].title;
html = html.replace(/(<img id="moonshot-slide"[^>]* alt=")[^"]+/, function (_, prefix) { return prefix + description.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;'); });
html = html.replace(/(<span id="moonshot-count" aria-live="polite">)[^<]+/, '$1' + '1 / ' + manifest.decks.fiscal.slides.length);
html = html.replace(/(<a class="text-link" href=")[^"]+(" target="_blank" rel="noopener noreferrer">Deck 1 PDF)/, '$1' + manifest.decks.fiscal.pdf + '$2');
html = html.replace(/(<a class="text-link" href=")[^"]+(" target="_blank" rel="noopener noreferrer">Deck 2 PDF)/, '$1' + manifest.decks.engine.pdf + '$2');
fs.writeFileSync(file, html);
console.log('Packaged both public decks. Review the diff and remove obsolete unreferenced snapshots in the update PR.');
