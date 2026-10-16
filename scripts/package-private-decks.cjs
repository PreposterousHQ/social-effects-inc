// Package approved exports. Plain exports and the password must stay outside this repository.
// Usage: node scripts/package-private-decks.cjs PRIVATE_INPUT_JSON PRIVATE_PASSWORD_FILE
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const repo = path.resolve(__dirname, '..');
const out = path.join(repo, 'new', 'decks');
const outsideRepo = file => { const p = path.resolve(file); if (p === repo || p.startsWith(repo + path.sep)) throw Error('Private inputs must be outside the public repository.'); return p; };
const input = JSON.parse(fs.readFileSync(outsideRepo(process.argv[2]), 'utf8'));
const password = fs.readFileSync(outsideRepo(process.argv[3]), 'utf8').trim();
if (password.length < 20) throw Error('Use a randomly generated password of at least 20 characters.');
const salt = crypto.randomBytes(16), iterations = 600000;
const key = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
const usedIVs = new Set();
function seal(publicPath, data) {
  const iv = crypto.randomBytes(12);
  if (usedIVs.has(iv.toString('hex'))) throw Error('Duplicate IV');
  usedIVs.add(iv.toString('hex'));
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from(publicPath));
  const packet = Buffer.concat([Buffer.from('DECK1'), iv, cipher.update(data), cipher.final(), cipher.getAuthTag()]);
  fs.writeFileSync(path.join(repo, publicPath.slice(1)), packet);
}
fs.mkdirSync(out, {recursive:true});
const config = {version:1, salt:salt.toString('base64'), iterations, decks:{}};
for (const [id, deck] of Object.entries(input.decks)) {
  if (!['lab','corporate','education'].includes(id) || !deck.slides.length) throw Error('Invalid deck input');
  fs.mkdirSync(path.join(out, id), {recursive:true});
  const publicBase = '/new/decks/' + id;
  const slides = deck.slides.map((slide, i) => {
    const publicPath = publicBase + '/slide-' + String(i + 1).padStart(2, '0') + '.bin';
    seal(publicPath, fs.readFileSync(outsideRepo(slide.file)));
    return {file:publicPath, text:slide.text, width:slide.width, height:slide.height};
  });
  const manifest = publicBase + '/manifest.bin';
  seal(manifest, Buffer.from(JSON.stringify({version:1, title:deck.title, slides})));
  fs.copyFileSync(outsideRepo(deck.slides[0].file), path.join(out, id, 'cover.jpg'));
  config.decks[id] = {title:deck.title, caption:deck.caption, manifest, cover:publicBase+'/cover.jpg'};
}
fs.writeFileSync(path.join(out, 'config.json'), JSON.stringify(config, null, 2) + '\n');
key.fill(0);
console.log('Packaged three encrypted decks. Only their cover thumbnails are public. Password was not printed or copied to the repository.');
