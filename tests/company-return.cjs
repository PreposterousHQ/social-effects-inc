// Native Back/Forward and reading-position restoration, without footer return panels.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost');let file=path.resolve(root,'.'+u.pathname);if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.json':'application/json'}[path.extname(file)]||'application/octet-stream'}).end(data);});});
(async()=>{await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin=process.env.COMPANY_ORIGIN||'http://127.0.0.1:'+server.address().port;const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({reducedMotion:'no-preference'});page.setDefaultTimeout(10000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 async function ready(){assert.equal(await page.locator('.return-bottom,.return-strip,[data-return-nav]').count(),0);await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
 async function atPosition(y){try{await page.waitForFunction(y=>Math.abs(scrollY-y)<3,y,{timeout:3000});}catch(e){throw Error('Expected scroll '+y+', received '+await page.evaluate(()=>scrollY)+' at '+page.url());}}
 for(const width of [1366,390,320]){
  await page.setViewportSize({width,height:900});
  await page.goto(origin+'/our-practice.html',{waitUntil:'load'});await ready();const historyLink=page.locator('main a[href="/filmanthropy-history.html"]');await historyLink.scrollIntoViewIfNeeded();await ready();const aY=await page.evaluate(()=>scrollY);assert.ok(aY>1000);
  await historyLink.click();await page.waitForURL('**/filmanthropy-history.html');await ready();
  // A second page lets the test verify a complete return chain, not a single Home link.
  await page.locator('.site-footer a[href="/contact.html"]').scrollIntoViewIfNeeded();const bY=await page.evaluate(()=>scrollY);await page.locator('.site-footer a[href="/contact.html"]').click();await page.waitForURL('**/contact.html');await ready();
  await page.goBack({waitUntil:'load'});await page.waitForURL('**/filmanthropy-history.html');await ready();await atPosition(bY);
  await page.goBack({waitUntil:'load'});await page.waitForURL('**/our-practice.html');await ready();await atPosition(aY);
  await page.goForward({waitUntil:'load'});await ready();await atPosition(bY);
  await page.goBack({waitUntil:'load'});await ready();await atPosition(aY);
  await page.reload({waitUntil:'load'});await ready();await atPosition(aY);
  if(width!==1366){await page.locator('.site-menu-open').click();await page.locator('#site-menu .menu-more summary').click();await page.locator('#site-menu a[href="/offerings.html"]').click();await page.waitForURL('**/offerings.html');await ready();await page.goBack({waitUntil:'load'});await page.waitForURL('**/our-practice.html');await ready();await atPosition(aY);assert.equal(await page.locator('#site-menu').evaluate(e=>e.open),false);}
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.goto(origin+'/',{waitUntil:'load'});await ready();const serviceLink=page.locator('.hero .button-gold');await serviceLink.scrollIntoViewIfNeeded();await ready();const homeY=await page.evaluate(()=>scrollY);await serviceLink.click();await page.waitForURL('**/our-practice.html');await ready();assert.equal(await page.locator('#the-whole').count(),1);await page.goBack({waitUntil:'load'});await page.waitForURL('**/');await ready();await atPosition(homeY);

  await page.goto(origin+'/',{waitUntil:'load'});await ready();assert.match(await page.locator('.company-intro-band p').textContent(),/as a foundation and an LLC/);await page.locator('.hero .hero-actions .button-gold').click();await page.waitForURL('**/our-practice.html');await ready();await page.locator('.page-hero .button-gold').click();await page.waitForURL('**/contact.html#exploration-call');await ready();await page.waitForFunction(()=>{const y=document.getElementById('exploration-call').getBoundingClientRect().top;return y>=90&&y<120;});assert.equal(await page.locator('#exploration-booking').getAttribute('target'),'_blank');assert.equal(await page.locator('#exploration-booking').getAttribute('href'),'https://calendly.com/bret-bretwarshawsky/20-minute-exploratory-call');assert.match(await page.locator('#exploration-call h2').textContent(),/20-minute/);
  if(process.env.COMPANY_SCREENSHOTS){fs.mkdirSync(process.env.COMPANY_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.COMPANY_SCREENSHOTS,'return-booking-'+width+'.png')});}
  console.log(width+'px: two-level native Back/Forward, exact reading positions/reload, menu closure and homepage-to-booking route pass without footer panels.');
 }
 assert.deepEqual(errors,[]);console.log('Footer return panels are absent; browser reading-position restoration and booking remain intact. No site JS errors.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
