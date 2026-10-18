// Checks the real native embed and failure fallback; never subscribes or posts.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const origin=process.env.COMPANY_ORIGIN||'http://127.0.0.1:61262',post='https://thesyntonytimes.substack.com/p/the-giants-who-did-it-first',archive='https://thesyntonytimes.substack.com/s/social-effects';
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const context=await browser.newContext({reducedMotion:'reduce'}),p=await context.newPage();
 for(const width of (process.env.SUBSTACK_WIDTHS||'1366,768,390,320').split(',').map(Number)){
  await p.setViewportSize({width,height:900});await p.goto(origin+'/ledger/#hub',{waitUntil:'load'});
  await p.waitForFunction(()=>document.body.dataset.ledgerView==='hub');
  const section=p.locator('.ledger-substack');await section.scrollIntoViewIfNeeded();
  const frame=p.frameLocator('.substack-preview iframe');
  await frame.getByRole('link',{name:'The Giants Who Did It First',exact:true}).waitFor({timeout:60000});
  const article=p.frames().find(f=>f.url().includes('/embed/p/the-giants-who-did-it-first'));
  assert.ok(article,'Native article frame loaded');
  await article.waitForLoadState('load');
  await article.evaluate(()=>document.fonts.ready);
  await article.waitForFunction(()=>document.documentElement.scrollWidth<=innerWidth,{},{timeout:20000});
  assert.ok(await article.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Article fits '+width);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Ledger fits '+width);
  assert.equal(await section.locator('.substack-intro > a').getAttribute('href'),archive);
  assert.equal(await section.locator('.substack-intro > a').getAttribute('target'),'_blank');
  assert.ok((await frame.getByRole('link',{name:'Read on Substack',exact:true}).getAttribute('href')).startsWith(post));
  assert.ok(await p.evaluate(()=>document.querySelector('#watch').getBoundingClientRect().bottom<=document.querySelector('#substack').getBoundingClientRect().top),'After playlists');
  assert.equal(await p.locator('.playlist-player iframe').count(),2);
  if(process.env.SUBSTACK_SCREENSHOTS){fs.mkdirSync(process.env.SUBSTACK_SCREENSHOTS,{recursive:true});await p.evaluate(()=>document.fonts.ready);await p.locator('body > nav').evaluate(e=>e.style.visibility='hidden');await section.screenshot({path:path.join(process.env.SUBSTACK_SCREENSHOTS,'substack-'+width+'.png')});await p.locator('body > nav').evaluate(e=>e.style.visibility='');}
  await p.locator('#nav-hamburger').click();await p.locator('#nav-mobile-overlay.open').waitFor();await p.locator('#nav-mobile-overlay a[href="#filmanthropy-and-ai"]').click();await p.locator('#filmanthropy-and-ai-view').waitFor({state:'visible'});assert.equal(await section.isVisible(),false);await p.goBack();await section.waitFor({state:'visible'});
  console.log(width+'px: native article loaded, no overflow, exact section/post destinations, two playlists and Back navigation pass.');
 }
 for(const disabled of [true,false]){
  const fallback=await browser.newContext({javaScriptEnabled:!disabled});if(!disabled)await fallback.route('https://substack.com/embedjs/embed.js',r=>r.abort());
  const page=await fallback.newPage();await page.goto(origin+'/ledger/#hub',{waitUntil:'domcontentloaded'});const section=page.locator('.ledger-substack');
  const link=section.locator('[data-post-link]');assert.equal(await link.isVisible(),true);assert.equal(await link.getAttribute('href'),post);assert.equal(await link.getAttribute('target'),'_blank');assert.equal(await section.getByText('The Giants Who Did It First by Bret Warshawsky',{exact:true}).isVisible(),true);await fallback.close();
 }
 console.log('Script-disabled and blocked-embed article fallback pass. No subscription, post or message sent.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
