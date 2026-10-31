import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
function plain(value) {
  return String(value).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}
function flatten(value) {
  if (typeof value === 'string') return plain(value);
  if (Array.isArray(value)) return value.map(flatten).join(' ');
  if (value && typeof value === 'object') return Object.values(value).map(flatten).join(' ');
  return '';
}
export async function buildKnowledge() {
  const docs = [];
  function add(title, url, text, kind = 'Public website') {
    const body = plain(text);
    for (let start = 0; start < body.length; start += 2600) {
      docs.push({title, url, kind, text: body.slice(start, start + 3000)});
    }
  }
  for (const [path, title] of [['ledger/essay/index.html', 'A Living Record — the Filmanthropy essay'], ['filmanthropy-history.html', 'History of Filmanthropy'], ['our-practice.html', 'Social Effects practice'], ['moonshot.html', 'The Moonshot — separate billion-dollar thought experiment'], ['ledger/filmanthropy-and-ai/index.html', 'Filmanthropy and AI']]) {
    add(title, 'https://socialeffectsnj.com/' + path.replace(/index.html$/, ''), await read(path));
  }
  const entries = vm.runInNewContext(await read('assets/ledger-entries.js') + '\nentries', {}, {timeout: 1000});
  for (const [id, entry] of Object.entries(entries)) add(entry.name, 'https://socialeffectsnj.com/ledger/#' + id, flatten(entry), 'Ledger case study');
  for (const entry of JSON.parse(await read('data/happening-now.json')).items) add(entry.title || entry.production, 'https://socialeffectsnj.com/ledger/news/' + entry.id + '/', flatten(entry), 'Happening now');
  for (const entry of JSON.parse(await read('data/deeper-dives.json')).items) add(entry.articleTitle, entry.sourceUrl, flatten(entry.summary), 'Linked article summary — full article not indexed');
  return {version: 1, coverage: 'Public Social Effects essay, practice, history, case studies, news and linked article summaries. Full Substack archive is not indexed.', docs};
}
