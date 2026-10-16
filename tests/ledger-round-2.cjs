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
    const context = await browser.newContext({reducedMotion:process.env.LEDGER_MOTION || 'reduce'});
    const page = await context.newPage();
    const watchdog = setTimeout(async () => {
      console.error('Browser regression exceeded fifteen minutes at', page.url());
      setTimeout(() => process.exit(1), 3000).unref();
      await browser.close();
      server.close();
      process.exitCode = 1;
    }, 900000);
    watchdog.unref();
    page.setDefaultTimeout(10000);
    page.setDefaultNavigationTimeout(30000);
    const goto = page.goto.bind(page);
    page.goto = async (url, options = {}) => {
      console.log('Navigate', new URL(url).pathname + new URL(url).hash);
      const response = await goto(url, {waitUntil:'domcontentloaded', ...options});
      console.log('Loaded', new URL(page.url()).pathname + new URL(page.url()).hash);
      return response;
    };
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    // Third-party resources are checked separately; navigation/layout use fallbacks
    // so a slow font CDN or player cannot hold the local regression open.
    await page.route('https://www.youtube-nocookie.com/**', r => r.fulfill({status:200,contentType:'text/html',body:'<p>External player</p>'}));
    for (const host of ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net']) {
      await page.route('https://' + host + '/**', r => r.fulfill({status:200,contentType:'text/css',body:''}));
    }
    for (const route of ['/ledger', '/eva', '/vinati', '/filmanthropyledger', '/socialeffects', '/Filmanthropy_Ledger.html', ...entries.map(f => '/' + f)]) {
      assert.equal((await fetch(origin + route)).status, 200, route);
    }
    report.push('HTTP 200: legacy /ledger, /eva, /vinati, original Ledger, canonical route, all 16 entry pages');
    console.log(report.at(-1));
    const htmlFiles = execFileSync('git', ['ls-files','*.html'], {cwd:root,encoding:'utf8'}).trim().split('\n');
    for (const file of htmlFiles) {
      const bad = await page.evaluate(({html, ledgerPage}) => {
        const doc = new DOMParser().parseFromString(html,'text/html');
        return [...doc.querySelectorAll('nav a, .nav-mobile-overlay a, footer a')]
          .filter(a => /ledger/i.test(a.textContent) && a.getAttribute('href') !== '/filmanthropyledger' && !(ledgerPage && ['#hub','#note-on-the-ledger'].includes(a.getAttribute('href'))))
          .map(a => a.outerHTML);
      }, {html:fs.readFileSync(path.join(root,file),'utf8'), ledgerPage:file === 'Filmanthropy_Ledger_v2.html'});
      assert.deepEqual(bad,[],file + ' navigation');
    }
    report.push('Companion Ledger links use /filmanthropyledger; the Ledger identity returns to its opening view');
    console.log(report.at(-1));
    await page.goto(origin + '/Filmanthropy_Ledger_v2.html');
    const protectedSelectors = '.essay-p, .essay-h3, .l-card, .bridge-p, .ledger-v1-record';
    const preserved = await page.evaluate(({before,after,selectors}) => {
      const texts = html => [...new DOMParser().parseFromString(html,'text/html').querySelectorAll(selectors)].map(e=>e.textContent);
      return JSON.stringify(texts(before)) === JSON.stringify(texts(after));
    }, {before:original('Filmanthropy_Ledger_v2.html'),after:fs.readFileSync(path.join(root,'Filmanthropy_Ledger_v2.html'),'utf8'),selectors:protectedSelectors});
    assert.ok(preserved,'Canonical essay, cards, bridge and authorship wording unchanged');
    assert.equal(fs.readFileSync(path.join(root,'assets/ledger-entries.js'),'utf8').replace(/\r\n/g,'\n'),original('assets/ledger-entries.js'));
    const approvedCompanyCopy = original('index.html','9015ddb60b23b1db6a305c3cb802f3e529a96ae3').replace('every production leaves its community more whole than it found it','every production gifts its communities as much as possible and leaves them more whole than it found it');
    assert.equal(fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/\r\n/g,'\n'),approvedCompanyCopy,'Only the exact approved company sentence changes');
    assert.equal(fs.readFileSync(path.join(root,'data/happening-now.json'),'utf8').replace(/\r\n/g,'\n'),original('data/happening-now.json'));
    assert.ok((await page.locator('.hub-framework').textContent()).includes('Filmanthropy by Design and Regenerative Filmmaking'));
    const aiPreserved = await page.evaluate(source => {
      const doc = new DOMParser().parseFromString(source, 'text/html');
      return JSON.stringify([...doc.querySelectorAll('.article-body p')].map(e=>e.textContent)) ===
        JSON.stringify([...document.querySelectorAll('.ai-article p')].map(e=>e.textContent));
    }, original('why-filmmaking-is-civic.html', '4131839f2e65e4a8cdb64f0069564afef86e2741'));
    assert.ok(aiPreserved, 'Existing AI article paragraphs preserved verbatim');
    assert.equal(fs.readFileSync(path.join(root,'why-filmmaking-is-civic.html'),'utf8').replace(/\r\n/g,'\n'), original('why-filmmaking-is-civic.html', '4131839f2e65e4a8cdb64f0069564afef86e2741'));
    report.push('Canonical prose and all entry data unchanged; exact required framework phrase preserved');
    console.log(report.at(-1));
    for (const viewport of [{width:1440,height:1000},{width:390,height:844}].filter(v=>!process.env.LEDGER_WIDTH || String(v.width)===process.env.LEDGER_WIDTH)) {
      console.log('Checking viewport',viewport.width);
      await page.setViewportSize(viewport);
      const landing = async () => {
        console.log('Check Forerunners landing');
        await page.waitForLoadState('load');
        await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 5000))]));
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
        console.log('Forerunners landing passed');
      };
      if (!process.env.LEDGER_FOCUS_NEW) {
      await page.goto(origin + '/filmanthropyledger?check=round2#case-studies');
      await landing();
      assert.ok(page.url().includes('?check=round2#case-studies'));
      await page.goto(origin + '/Filmanthropy_Ledger_v2.html#forerunners');
      await landing();
      await page.goto(origin + '/Filmanthropy_Ledger_v2.html#hub');
      await page.locator('.hub-card-cases [data-section-link]').first().click();
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
      }
      await page.goto(origin + '/Filmanthropy_Ledger_v2.html#hub');
      assert.equal(await page.locator('#hub .playlist-card').count(),2);
      assert.equal(await page.locator('#hub .hub-ladder, .hub-social-effects').count(),0);
      assert.equal(await page.locator('#welcome-heading').textContent(), 'How far can the gift of a film reach?');
      assert.equal(await page.locator('.ledger-intro-link a').getAttribute('href'),'/socialeffects');
      assert.equal((await page.locator('.ledger-intro-link').textContent()).replace(/\s+/g,' ').trim(),'For more about what we mean by Filmanthropy, Filmanthropy by Design and Regenerative Filmmaking, and to explore our work and offerings, visit Social Effects.');
      assert.deepEqual(await page.locator('.hub-grid > .hub-card h3').allTextContents(), ['The Essay','Filmanthropy and AI','The Case Studies','Stories from the Field','Happening Now','Submit Your Story']);
      const cards = await page.locator('.hub-grid > .hub-card').evaluateAll(els => els.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width};}));
      if (viewport.width >= 720) {
        assert.equal(cards[0].y,cards[1].y,'AI in first row');
        assert.equal(cards[3].x,cards[5].x,'Submission directly under firsthand stories');
        assert.equal(cards[4].y,cards[5].y,'Aligned last row');
      } else assert.ok(cards.every((card,i)=>i===0 || card.y > cards[i-1].y),'Six cards stack in reading order');
      assert.equal(await page.locator('.hub-case-features a[href="/eva"]').count(),1);
      assert.equal(await page.locator('.hub-case-features a[href="/vinati"]').count(),1);
      for (const [route,id] of [['/eva','fbr'],['/vinati','skater-girl']]) {
        await page.locator('.hub-case-features a[href="'+route+'"]').click();
        await page.waitForSelector('#ledger-expanded.is-open');
        assert.equal(new URL(page.url()).hash,'#'+id);
        await page.locator('#ledger-expanded a.exp-back[href="#hub"]').click();
        await page.waitForSelector('#ledger-top:visible');
      }
      await page.locator('.hub-card-ai').click();
      await page.waitForSelector('#filmanthropy-and-ai-view:visible');
      assert.equal(await page.locator('.ai-article p').count(),10);
      assert.match(await page.locator('#ai-heading').textContent(), /Human and Civic/);
      assert.equal(await page.locator('.ai-inner a[href="#essay-why-now"], .ai-inner a[href="why-filmmaking-is-civic.html"]').count(),0);
      assert.equal(await page.locator('.ledger-v1-record').isVisible(),false,'No repeated record below AI');
      if (viewport.width <= 1250) {
        await page.locator('#nav-hamburger').click();
        await page.locator('#nav-mobile-overlay a[href="#note-on-the-ledger"]').click();
        assert.equal(await page.locator('#nav-mobile-overlay').getAttribute('aria-hidden'),'true');
      } else await page.locator('#nav-desktop-center a[href="#note-on-the-ledger"]').click();
      await page.waitForSelector('#note-on-the-ledger-view:visible');
      assert.equal(await page.locator('.ledger-v1-record').isVisible(),true);
      assert.match(await page.locator('.ledger-v1-record').textContent(),/A note on authorship/);
      assert.equal(await page.locator('#filmanthropy-and-ai-view').isVisible(),false);
      if (process.env.LEDGER_SCREENSHOTS) {
        fs.mkdirSync(process.env.LEDGER_SCREENSHOTS,{recursive:true});
        await page.screenshot({path:path.join(process.env.LEDGER_SCREENSHOTS,'note-'+viewport.width+'.png')});
      }
      await page.goBack();
      await page.waitForSelector('#filmanthropy-and-ai-view:visible');
      await page.goto(origin + '/Filmanthropy_Ledger_v2.html#note-on-the-ledger');
      await page.waitForSelector('#note-on-the-ledger-view:visible');
      assert.ok(await page.locator('#note-on-the-ledger-view .view-back').evaluate(e=>e.getBoundingClientRect().top>=document.querySelector('body > nav').getBoundingClientRect().bottom),'Back link clears fixed header');
      await page.locator('#note-on-the-ledger-view .view-back').click();
      await page.waitForFunction(()=>document.body.dataset.ledgerView==='hub');
      assert.equal(await page.locator('.ledger-v1-record').isVisible(),false,'No repeated record below hub');
      assert.ok(await page.locator('.welcome-explore').evaluate(e=>e.getBoundingClientRect().height>=44));
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Opening fits viewport');
      await page.locator('.ledger-brand').click();
      await page.waitForFunction(()=>document.body.dataset.ledgerView==='hub' && scrollY < 2);
      await page.locator('#watch').scrollIntoViewIfNeeded();
      await page.locator('.ledger-brand').click();
      await page.waitForFunction(()=>scrollY < 2);
      assert.ok(await page.locator('#watch').evaluate(e => e.previousElementSibling.classList.contains('hub-grid')));
      if (process.env.LEDGER_SCREENSHOTS) {
        fs.mkdirSync(process.env.LEDGER_SCREENSHOTS,{recursive:true});
        await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
        await page.screenshot({path:path.join(process.env.LEDGER_SCREENSHOTS,'main-top-'+viewport.width+'.png')});
        await page.locator('body > nav').evaluate(e => { e.style.visibility = 'hidden'; });
        try {
          await page.locator('.hub-grid').screenshot({path:path.join(process.env.LEDGER_SCREENSHOTS,'six-paths-'+viewport.width+'.png')});
        } finally {
          await page.locator('body > nav').evaluate(e => { e.style.visibility = ''; });
        }
      }
      assert.match(await page.locator('.hub-card-stories p').textContent(),/Personal, firsthand accounts/);
      await page.locator('.hub-card-stories').click();
      await page.waitForSelector('#stories-from-the-field-view:visible');
      await page.locator('#stories-from-the-field-view .stories-submit').click();
      await page.waitForSelector('#submit-your-story-view:visible');
      assert.equal(await page.locator('.ledger-v1-record').isVisible(),false);
      assert.equal(await page.locator('#submit-your-story-view .stories-submit').getAttribute('href'),'mailto:bret@socialeffectsnj.com?subject=Story%20for%20the%20Filmanthropy%20Ledger');
      if (process.env.LEDGER_SCREENSHOTS) await page.locator('#submit-your-story-view .stories-inner').screenshot({path:path.join(process.env.LEDGER_SCREENSHOTS,'submit-'+viewport.width+'.png')});
      await page.locator('.ledger-brand').click();
      await page.waitForSelector('#hub:visible');
      await page.locator('.hub-card-submit').click();
      await page.waitForSelector('#submit-your-story-view:visible');
      if (viewport.width <= 1250) {
        await page.locator('#nav-hamburger').click();
        await page.waitForSelector('#nav-mobile-overlay.open');
        assert.equal(await page.locator('#nav-hamburger').getAttribute('aria-expanded'),'true');
        await page.keyboard.press('Shift+Tab');
        assert.ok(await page.locator('.nav-mobile-cta-item').evaluate(e=>e===document.activeElement),'Mobile focus stays inside menu');
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#nav-hamburger').getAttribute('aria-expanded'),'false');
        assert.ok(await page.locator('#nav-hamburger').evaluate(e=>e===document.activeElement));
        await page.locator('#nav-hamburger').click();
        await page.locator('#nav-mobile-overlay a[href="#filmanthropy-and-ai"]').click();
        await page.waitForSelector('#filmanthropy-and-ai-view:visible');
        assert.equal(await page.locator('#nav-mobile-overlay').getAttribute('aria-hidden'),'true');
        assert.equal(await page.locator('body').evaluate(e=>e.style.overflow),'');
        if (process.env.LEDGER_SCREENSHOTS) await page.screenshot({path:path.join(process.env.LEDGER_SCREENSHOTS,'ai-'+viewport.width+'.png')});
      } else {
        await page.locator('#nav-desktop-center a[href="#filmanthropy-and-ai"]').click();
        await page.waitForSelector('#filmanthropy-and-ai-view:visible');
      }
      await page.goto(origin + '/Filmanthropy_Ledger_v2.html#hub');
      await page.locator('.hub-card-now').click();
      await page.waitForSelector('#happening-feed .feed-item');
      assert.equal(await page.locator('.ledger-v1-record').isVisible(),false);
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
      report.push(viewport.width + 'px: ' + (process.env.LEDGER_FOCUS_NEW ? 'focused new paths, menus and article navigation' : 'redirects, all 16 entry hashes, legacy hashes, Case Studies/Forerunners, keyboard entry/return') + ', responsive 16:9 lazy players pass');
    }
    await page.goto(origin+'/socialeffects?source=ledger#services');
    await page.waitForURL('**/index.html?source=ledger#services');
    report.push('/socialeffects opens the approved company homepage and preserves query/hash');

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
    report.push('No site JavaScript errors. External players/font CDNs are substituted; live playback/font delivery is not asserted by these tests.');
    console.log(report.join('\n'));
  } finally {if(browser)await browser.close();server.close();}
})().catch(err => {console.error(err);process.exitCode=1;});
