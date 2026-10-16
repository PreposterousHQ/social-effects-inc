// Run: NODE_PATH=<path to Playwright packages> node tests/ledger-round-2.cjs
// Requires Playwright with Chromium installed. No site build or dependency install.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const baseline = process.env.LEDGER_BASE || '67dd537a31f91ff0fcb994f3de5654f41f953d7d';
const original = (file, ref = baseline) => execFileSync('git', ['show', ref + ':' + file], {cwd:root, encoding:'utf8', maxBuffer:2e6});
const entries = fs.readdirSync(root).filter(f => /^entry-.*\.html$/.test(f));
const types = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.jpg':'image/jpeg', '.png':'image/png'};
const server = http.createServer((req,res) => {
  let file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!file.startsWith(root + path.sep) && file !== root) {res.writeHead(403).end();return;}
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.endsWith('/')) {res.writeHead(301, {Location:url.pathname + '/' + url.search}).end();return;}
    file = path.join(file, 'index.html');
  }
  fs.readFile(file, (err,data) => {
    if (err) {res.writeHead(404).end();return;}
    res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream'}).end(data);
  });
});
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const origin = 'http://127.0.0.1:' + server.address().port;
  let browser;
  const report = [];
  try {
    console.log('Starting browser checks');
    browser = await chromium.launch({headless:true, ...(process.env.LEDGER_BROWSER ? {channel:process.env.LEDGER_BROWSER} : {})});
    const context = await browser.newContext();
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const goto = page.goto.bind(page);
    page.goto = (url, options = {}) => goto(url, {waitUntil:'domcontentloaded', ...options});
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    // External player availability is reported separately; navigation tests stay deterministic.
    await page.route('https://www.youtube-nocookie.com/**', r => r.fulfill({status:200,contentType:'text/html',body:'<p>External player</p>'}));
    for (const route of ['/ledger', '/eva', '/vinati', '/filmanthropyledger', '/socialeffects', '/Filmanthropy_Ledger.html', ...entries.map(f => '/' + f)]) {
      assert.equal((await fetch(origin + route)).status, 200, route);
    }
    report.push('HTTP 200: legacy /ledger, /eva, /vinati, original Ledger, canonical route, all 16 entry pages');
    console.log(report.at(-1));
    const htmlFiles = execFileSync('git', ['ls-files','*.html'], {cwd:root,encoding:'utf8'}).trim().split('\n');
    for (const file of htmlFiles) {
      const bad = await page.evaluate(html => {
        const doc = new DOMParser().parseFromString(html,'text/html');
        return [...doc.querySelectorAll('nav a, .nav-mobile-overlay a, footer a')]
          .filter(a => /ledger/i.test(a.textContent) && a.getAttribute('href') !== '/filmanthropyledger')
          .map(a => a.outerHTML);
      }, fs.readFileSync(path.join(root,file),'utf8'));
      assert.deepEqual(bad,[],file + ' navigation');
    }
    report.push('Every existing desktop, mobile and footer Ledger navigation link uses /filmanthropyledger');
    console.log(report.at(-1));
    await page.goto(origin + '/Filmanthropy_Ledger_v2.html');
    const protectedSelectors = '.essay-p, .essay-h3, .l-card, .bridge-p, .ledger-v1-record';
    const preserved = await page.evaluate(({before,after,selectors}) => {
      const texts = html => [...new DOMParser().parseFromString(html,'text/html').querySelectorAll(selectors)].map(e=>e.textContent);
      return JSON.stringify(texts(before)) === JSON.stringify(texts(after));
    }, {before:original('Filmanthropy_Ledger_v2.html'),after:fs.readFileSync(path.join(root,'Filmanthropy_Ledger_v2.html'),'utf8'),selectors:protectedSelectors});
    assert.ok(preserved,'Canonical essay, cards, bridge and authorship wording unchanged');
    assert.equal(fs.readFileSync(path.join(root,'assets/ledger-entries.js'),'utf8').replace(/\r\n/g,'\n'),original('assets/ledger-entries.js'));
    assert.equal(fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/\r\n/g,'\n'),original('index.html','9015ddb60b23b1db6a305c3cb802f3e529a96ae3'));
    assert.equal(fs.readFileSync(path.join(root,'data/happening-now.json'),'utf8').replace(/\r\n/g,'\n'),original('data/happening-now.json'));
    assert.ok((await page.locator('.hub-framework').textContent()).includes('Filmanthropy by Design and Regenerative Filmmaking'));
    report.push('Canonical prose and all entry data unchanged; exact required framework phrase preserved');
    console.log(report.at(-1));
    for (const viewport of [{width:1440,height:1000},{width:390,height:844}]) {
      console.log('Checking viewport',viewport.width);
      await page.setViewportSize(viewport);
      const landing = async () => {
        await page.waitForLoadState('load');
        await page.evaluate(() => document.fonts.ready);
        await page.waitForFunction(() => {
          const h=document.getElementById('forerunners').getBoundingClientRect();
          const nav=document.querySelector('body > nav').getBoundingClientRect();
          return h.top >= nav.bottom + 12 && h.top <= nav.bottom + 25;
        }).catch(async e => {
          console.log('Landing diagnostic', page.url(), await page.evaluate(() => ({heading:document.getElementById('forerunners').getBoundingClientRect().toJSON(),nav:document.querySelector('body > nav').getBoundingClientRect().toJSON(),scrollY,margin:getComputedStyle(document.getElementById('forerunners')).scrollMarginTop,view:document.body.dataset.ledgerView})));
          if (process.env.LEDGER_SCREENSHOTS) await page.screenshot({path:path.join(process.env.LEDGER_SCREENSHOTS,'landing-failure.png')});
          throw e;
        });
        assert.equal(await page.locator('#forerunner-grid .l-card').count(),4);
        assert.deepEqual(await page.locator('#forerunner-grid .l-card-name').allTextContents(),['Rock and Wrap It Up!','Film Biz Recycling','EcoSet','Earth Angel']);
        assert.equal((await page.locator('.forerunners-section .ledger-section-sub').textContent()).trim(),"Some of the modern operators who built production's waste and surplus into a working practice.");
      };
      await page.goto(origin + '/filmanthropyledger?check=round2#case-studies');
      await landing();
      assert.ok(page.url().includes('?check=round2#case-studies'));
      await page.goto(origin + '/Filmanthropy_Ledger_v2.html#forerunners');
      await landing();
      await page.goto(origin + '/Filmanthropy_Ledger_v2.html#hub');
      await page.locator('.hub-card-cases').click();
      await landing();
      await page.goto(origin + '/Filmanthropy_Ledger_v2.html#essay');
      await page.getByRole('link',{name:'Browse the Case Studies'}).click();
      await landing();
      await page.locator('[data-entry="fbr"]').press('Enter');
      await page.waitForSelector('#ledger-expanded.is-open');
      assert.match(await page.locator('#exp-name').textContent(),/Film Biz Recycling/);
      await page.keyboard.press('Escape');
      await landing();
      for (const file of entries) {
        const id = file.slice(6,-5);
        await page.goto(origin + '/' + file);
        await page.waitForSelector('#ledger-expanded.is-open');
        assert.equal(new URL(page.url()).hash,'#'+id);
        assert.equal(new URL(page.url()).pathname,'/Filmanthropy_Ledger_v2.html');
      }
      for (const [route,id] of [['/eva','fbr'],['/vinati','skater-girl']]) {
        await page.goto(origin + route);
        await page.waitForSelector('#ledger-expanded.is-open');
        assert.equal(new URL(page.url()).hash,'#'+id);
        await page.getByRole('button',{name:/Back to entries/}).click();
        await landing();
      }
      for (const id of ['fbr','skater-girl']) {
        await page.goto(origin + '/Filmanthropy_Ledger.html#' + id);
        await page.waitForFunction(() => getComputedStyle(document.getElementById('ledger-expanded')).display !== 'none');
        assert.ok((await page.locator('#exp-name').textContent()).length > 0);
      }
      await page.goto(origin + '/ledger');
      await page.waitForURL('**/Filmanthropy_Ledger.html');
      await page.goto(origin + '/Filmanthropy_Ledger_v2.html#hub');
      assert.equal(await page.locator('#hub .playlist-card').count(),2);
      assert.ok(await page.locator('.hub-inner').evaluate(e => e.firstElementChild.classList.contains('hub-ladder')));
      assert.ok(await page.locator('.hub-social-effects').evaluate(e => e.previousElementSibling.classList.contains('hub-ladder')));
      assert.equal(await page.locator('.hub-social-effects a').getAttribute('href'),'/socialeffects');
      assert.equal((await page.locator('.hub-social-effects').textContent()).replace(/\s+/g,' ').trim(),'For more info on Social Effects, Filmanthropy and Our Offerings Please Visit www.socialeffectsnj.com/socialeffects');
      assert.ok(await page.locator('#watch').evaluate(e => e.previousElementSibling.classList.contains('hub-grid')));
      if (process.env.LEDGER_SCREENSHOTS) {
        fs.mkdirSync(process.env.LEDGER_SCREENSHOTS,{recursive:true});
        await page.locator('.hub-ladder').scrollIntoViewIfNeeded();
        await page.screenshot({path:path.join(process.env.LEDGER_SCREENSHOTS,'main-top-'+viewport.width+'.png')});
      }
      assert.match(await page.locator('.hub-card-stories .hub-cta').textContent(),/Submit your stories here/);
      await page.locator('.hub-card-stories').click();
      await page.waitForSelector('.stories-submit:visible');
      assert.equal(await page.locator('.stories-submit').textContent(),'Submit your stories here');
      assert.equal(await page.locator('.stories-submit').getAttribute('href'),'mailto:bret@socialeffectsnj.com?subject=Story%20for%20the%20Filmanthropy%20Ledger');
      if (process.env.LEDGER_SCREENSHOTS) await page.locator('.stories-inner').screenshot({path:path.join(process.env.LEDGER_SCREENSHOTS,'stories-'+viewport.width+'.png')});
      await page.goto(origin + '/Filmanthropy_Ledger_v2.html#hub');
      await page.locator('.hub-card-now').click();
      await page.waitForSelector('#happening-feed .feed-item');
      assert.equal(await page.locator('#happening-now-view iframe').count(),0);
      assert.equal(await page.locator('#watch').isVisible(),false);
      await page.goto(origin + '/Filmanthropy_Ledger_v2.html#watch');
      await page.waitForSelector('#watch:visible');
      assert.equal(await page.locator('body').getAttribute('data-ledger-view'),'hub');
      const players = await page.locator('.playlist-player iframe').evaluateAll(els => els.map(e => ({src:e.src,lazy:e.loading,title:e.title,ratio:e.clientWidth/e.clientHeight})));
      assert.equal(players.length,2);
      assert.deepEqual(await page.locator('.playlist-card h3').allTextContents(),['Videos From the Ledger','New Jersey: News Items']);
      assert.deepEqual(players.map(p => new URL(p.src).searchParams.get('list')),['PLaxLcyba8hZw','PLapgW1onHz3c']);
      players.forEach(p => {assert.equal(p.lazy,'lazy');assert.ok(p.title);assert.ok(Math.abs(p.ratio - 16/9)<0.03);});
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const boxes = await page.locator('.playlist-card').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y};}));
      assert.ok(viewport.width > 700 ? boxes[0].y === boxes[1].y : boxes[0].y < boxes[1].y);
      if (process.env.LEDGER_SCREENSHOTS) {
        fs.mkdirSync(process.env.LEDGER_SCREENSHOTS,{recursive:true});
        await page.locator('#watch').screenshot({path:path.join(process.env.LEDGER_SCREENSHOTS,'watch-'+viewport.width+'.png')});
        await page.goto(origin+'/Filmanthropy_Ledger_v2.html#case-studies');
        await landing();
        await page.screenshot({path:path.join(process.env.LEDGER_SCREENSHOTS,'forerunners-'+viewport.width+'.png')});
      }
      report.push(viewport.width + 'px: redirects, all 16 entry hashes, legacy hashes, Case Studies/Forerunners, keyboard entry/return, responsive 16:9 lazy players pass');
    }
    await page.goto(origin+'/socialeffects?source=ledger#services');
    await page.waitForURL('**/index.html?source=ledger#services');
    report.push('/socialeffects opens the unchanged current homepage and preserves query/hash');

    // Synthetic cases exercise future NJ prioritization without publishing invented news.
    const sample = JSON.parse(fs.readFileSync(path.join(root,'data/happening-now.json'),'utf8')).items[0];
    const fixture = {
      updated:'2026-10-15',
      items:[
        {...sample,id:'fixture-outside-new',production:'TEST outside new',place:'DALLAS, TEXAS',date:'2026-10-15'},
        {...sample,id:'fixture-nj-old',production:'TEST NJ old',place:'NEWARK, NJ, USA',date:'2020-01-01'},
        {...sample,id:'fixture-nj-tagged',production:'TEST NJ tagged',place:'Multiple places',regions:['US-NJ'],date:'2021-01-01'},
        {...sample,id:'fixture-outside-old',production:'TEST outside old',place:'TORONTO, CANADA',date:'2025-01-01'},
        {...sample,id:'fixture-nj-named',production:'TEST NJ named',place:'CAMDEN, NEW JERSEY, USA',date:'2024-01-01'}
      ]
    };
    await page.route('**/data/happening-now.json',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(fixture)}));
    await page.goto(origin+'/Filmanthropy_Ledger_v2.html?nj-priority-test=1#hub');
    await page.locator('#now-fixture-nj-named').waitFor({state:'attached'});
    assert.deepEqual(await page.locator('#happening-feed .feed-item').evaluateAll(els=>els.map(e=>e.id)),['now-fixture-nj-named','now-fixture-nj-tagged','now-fixture-nj-old','now-fixture-outside-new','now-fixture-outside-old']);
    const teasers=await page.locator('#hub-happening-teasers .hub-headline').allTextContents();
    assert.ok(teasers[0].includes('TEST NJ named') && teasers[1].includes('TEST NJ tagged') && teasers[2].includes('TEST NJ old'));
    report.push('Synthetic NJ-priority cases pass: explicit name, NJ abbreviation and US-NJ metadata; newest first within groups; matching hub teasers; source JSON unchanged');
    assert.deepEqual(errors,[],'No site JavaScript errors');
    report.push('No site JavaScript errors. YouTube playback is external and is not asserted by these tests.');
    console.log(report.join('\n'));
  } finally {if(browser)await browser.close();server.close();}
})().catch(err => {console.error(err);process.exitCode=1;});
