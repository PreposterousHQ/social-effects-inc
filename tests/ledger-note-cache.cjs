// Run with Playwright on NODE_PATH; LEDGER_BROWSER=chrome uses installed Chrome.
// --reproduce confirms the PR #9 failure before asset URLs are versioned.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {createHash} = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const reproduce = process.argv.includes('--reproduce');
const previousRouter = execFileSync('git', ['show', 'baeb532eaed6a2028630b12928970b6fc946785f:assets/ledger-v2.js'], {cwd:root, encoding:'utf8'});
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const file = path.resolve(root, '.' + url.pathname);
  if (!file.startsWith(root + path.sep)) {res.writeHead(403).end();return;}
  // Model the old response retained under the previously unchanged asset URL.
  if (url.pathname === '/assets/ledger-v2.js' && !url.search) {
    res.writeHead(200, {'Content-Type':'text/javascript'}).end(previousRouter);
    return;
  }
  fs.readFile(file, (error, data) => {
    if (error) {res.writeHead(404).end();return;}
    const type = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.jpg':'image/jpeg'}[path.extname(file)];
    res.writeHead(200, {'Content-Type':type || 'application/octet-stream'}).end(data);
  });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({headless:true, ...(process.env.LEDGER_BROWSER ? {channel:process.env.LEDGER_BROWSER} : {})});
  try {
    const page = await browser.newPage({reducedMotion:'reduce'});
    page.setDefaultTimeout(10000);
    await page.route('https://**/*', route => route.fulfill({status:200, contentType:'text/css', body:''}));
    const origin = 'http://127.0.0.1:' + server.address().port;
    for (const width of [1440,390]) {
      await page.setViewportSize({width,height:900});
      await page.goto(origin + '/filmanthropyledger/index.html', {waitUntil:'load'});
      if (!reproduce) {
        for (const [selector, file] of [['script[src*="ledger-v2.js"]','assets/ledger-v2.js'],['link[href*="ledger-v2.css"]','assets/ledger-v2.css']]) {
          const url = await page.locator(selector).evaluate(e => new URL(e.src || e.href).href);
          const digest = createHash('sha256').update(fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n')).digest('hex').slice(0,12);
          assert.equal(new URL(url).searchParams.get('v'), digest, 'Asset version follows its actual content');
        }
      }
      const errors=[];
      page.on('pageerror', error=>errors.push(error.message));
      if (width===390) {
        await page.locator('#nav-hamburger').click();
        await page.locator('#nav-mobile-overlay a[href="#note-on-the-ledger"]').click();
      } else await page.locator('#nav-desktop-center a[href="#note-on-the-ledger"]').click();
      await page.waitForFunction(() => location.hash === '#note-on-the-ledger');
      if (reproduce) {
        assert.equal(await page.locator('body').getAttribute('data-ledger-view'),'hub');
        assert.equal(await page.locator('#note-on-the-ledger-view').isVisible(),false);
        console.log(width+'px: reproduced note menu falling back to opening with previous cached router');
        continue;
      }
      await page.waitForSelector('#note-on-the-ledger-view:visible');
      assert.equal(await page.locator('#hub').isVisible(),false);
      await page.reload({waitUntil:'load'});
      await page.waitForSelector('#note-on-the-ledger-view:visible');
      await page.locator('#note-on-the-ledger-view .view-back').click();
      await page.waitForSelector('#hub:visible');
      assert.deepEqual(errors,[]);
      console.log(width+'px: note menu, direct reload and return pass despite stale unversioned asset');
    }
  } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
