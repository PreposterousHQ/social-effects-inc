// Playwright on NODE_PATH; LEDGER_BROWSER=chrome uses installed Chrome.
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const canonical='https://socialeffectsnj.com/filmanthropyledger';
const entryIds=fs.readdirSync(root).filter(f=>/^entry-.*\.html$/.test(f)).map(f=>f.slice(6,-5));
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const file=path.resolve(root,'.'+url.pathname);
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end();return;}const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.jpg':'image/jpeg'}[path.extname(file)];res.writeHead(200,{'Content-Type':type||'application/octet-stream'}).end(data);});
});
function sharedDestination(href){
 const url=new URL(href);
 assert.equal(url.protocol,'https:');
 const host=url.hostname;
 const allowed=['www.linkedin.com','twitter.com','www.facebook.com','wa.me','t.me','mail.google.com','www.threads.net'];
 assert.ok(allowed.includes(host),'Recognized sharing service: '+host);
 const direct=url.searchParams.get('url')||url.searchParams.get('u');
 if(direct)return direct;
 const text=url.searchParams.get('body')||url.searchParams.get('text')||'';
 const urls=text.match(/https?:\/\/[^\s]+/g)||[];
 assert.equal(urls.length,1,'One shared destination');
 return urls[0];
}
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,...(process.env.LEDGER_BROWSER?{channel:process.env.LEDGER_BROWSER}:{})});
 try{
  const context=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});
  const page=await context.newPage();page.setDefaultTimeout(15000);page.setDefaultNavigationTimeout(30000);
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  // Share composers are intercepted; these checks do not submit or post anything.
  await context.route('https://**/*',route=>route.fulfill({status:200,contentType:route.request().resourceType()==='stylesheet'?'text/css':'text/html',body:'<!doctype html><title>Share destination test</title>'}));
  await context.addInitScript(()=>{window.__copied=[];Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__copied.push(text);}}});});
  const origin='http://127.0.0.1:'+server.address().port;
  let checked=0,launches=0,copies=0;
  const checkLinks=async(selector,expected,launch)=>{
   const links=page.locator(selector);
   const count=await links.count();assert.ok(count>0,selector);
   for(let i=0;i<count;i++){
    const link=links.nth(i);const href=await link.getAttribute('href');
    assert.equal(sharedDestination(href),expected);checked++;
    if(launch){const [popup]=await Promise.all([context.waitForEvent('page',{timeout:15000}),link.click()]);await popup.waitForLoadState('domcontentloaded');assert.equal(popup.url(),href);await popup.close();launches++;}
   }
  };
  for(const file of ['Filmanthropy_Ledger_v2.html','Filmanthropy_Ledger.html']){
   await page.goto(origin+'/'+file+'?from=preview#hub',{waitUntil:'load'});
   await checkLinks('.share-btn[href^="https:"]',canonical,false);
   await checkLinks('.ledger-share-strip .share-btn[href^="https:"]',canonical,true);
   await page.locator('#copy-link-btn-ledger').click();copies++;
   assert.equal(await page.evaluate(()=>window.__copied.at(-1)),canonical);
   if(file.includes('_v2')){
    await page.locator('.hub-card-essay').click();
    await page.waitForSelector('#essay-view:visible');
   }
   await checkLinks('.inshort-band-footer .share-btn[href^="https:"]',canonical,true);
   await page.locator('#inshort-copy-btn').click();copies++;
   assert.equal(await page.evaluate(()=>window.__copied.at(-1)),canonical);
   for(const id of entryIds){
    await page.evaluate(id=>window.expandEntry(id),id);
    await page.waitForSelector('#ledger-expanded:visible');
    const expected=canonical+'#'+id;
    await checkLinks('.exp-share-cluster a[href^="https:"]',expected,id===entryIds[0]);
    await page.locator('#share-copy').click();copies++;
    assert.equal(await page.evaluate(()=>window.__copied.at(-1)),expected);
    await page.locator('#share-instagram').click();copies++;
    assert.equal(await page.evaluate(()=>window.__copied.at(-1)),expected);
    assert.match(await page.locator('#share-feedback').textContent(),/Paste it in Instagram/);
   }
   console.log(file+': all page and 16 entry sharing destinations and copy controls pass');
  }
  for(const width of [360,390,1440]){
   await page.setViewportSize({width,height:900});
   await page.goto(origin+'/Filmanthropy_Ledger_v2.html#hub',{waitUntil:'load'});
   const footer=page.locator('.ledger-footer');await footer.scrollIntoViewIfNeeded();
   const text=await footer.textContent();assert.ok(!/Wrap It Forward|Sets\. Souls\. Stories\./.test(text));
   assert.deepEqual(await page.locator('.ledger-footer-heading').evaluate(e=>[...e.children].map(e=>e.textContent)),['From Special Effects to Social Effects','The Filmanthropy Ledger']);
   assert.equal(await page.locator('.ledger-share-strip > p').textContent(),'Share the Ledger');
   for(const selector of ['.ledger-footer-art','.ledger-footer-copyright']){
    assert.ok(await page.locator(selector).evaluate(e=>{const r=e.getBoundingClientRect();const p=e.closest('footer').getBoundingClientRect();return Math.abs(r.x+r.width/2-(p.x+p.width/2))<2;}),selector+' centered');
   }
   assert.equal(await page.locator('.ledger-footer-copyright').evaluate(e=>getComputedStyle(e).textAlign),'center');
   await page.locator('.ledger-footer-art').evaluate(e=>e.decode());
   assert.equal(await page.locator('.ledger-footer-art').getAttribute('src'),'social-effects-logo.png','Use Bret’s existing image only');
   assert.equal(await page.locator('.ledger-footer-brand figcaption').textContent(),'Social Effects NJ');
   assert.ok(await page.locator('.ledger-footer-brand').evaluate(e=>{const image=e.querySelector('img').getBoundingClientRect();const caption=e.querySelector('figcaption').getBoundingClientRect();return caption.top>=image.bottom && Math.abs(image.x+image.width/2-(caption.x+caption.width/2))<2;}),'Brand caption centered below original image');
   assert.match(await page.locator('.ledger-footer-art').evaluate(e=>getComputedStyle(e).filter),/drop-shadow/,'Original ring has a visible warm edge treatment');
   assert.ok(await page.locator('.ledger-footer-art').evaluate(e=>e.naturalWidth>0));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(process.env.LEDGER_SCREENSHOTS){fs.mkdirSync(process.env.LEDGER_SCREENSHOTS,{recursive:true});await footer.screenshot({path:path.join(process.env.LEDGER_SCREENSHOTS,'footer-'+width+'.png')});}
   console.log(width+'px: footer hierarchy, centered copyright/artwork, image decode and overflow pass');
  }
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({validatedShareLinks:checked,interceptedComposerLaunches:launches,clipboardActions:copies,siteJavaScriptErrors:errors.length}));
  console.log('No social posts sent. Authentication, app availability and third-party rendered cards are not asserted.');
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
