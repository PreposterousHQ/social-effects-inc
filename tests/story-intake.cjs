// Read-only acceptance: real Tally embed, resizing, navigation and fallback.
// Never submits a contribution, uploads a file or sends another notification.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const origin=process.env.COMPANY_ORIGIN||'http://127.0.0.1:61262';
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>{if(e.stack?.includes(origin))errors.push(e.message);});
 for(const width of [1366,390,320]){
  await page.setViewportSize({width,height:900});
  for(const route of ['/ledger/#submit-your-story','/ledger/submit-your-story/']){
   await page.goto(origin+route,{waitUntil:'domcontentloaded'});
   const iframe=page.locator('.story-intake iframe');await iframe.scrollIntoViewIfNeeded();
   const form=page.frameLocator('.story-intake iframe');
   await form.getByRole('textbox',{name:'Tell us about it',exact:true}).waitFor({timeout:60000});
   await form.getByRole('button',{name:'Send for review',exact:true}).waitFor({state:'attached'});
   assert.equal(await form.locator('input[type="file"]').count(),1);
   assert.equal(await form.getByRole('textbox',{name:'Your email (kept private)',exact:true}).count(),1);
   assert.equal(await form.getByRole('radio',{name:'Please contact me before publishing.',exact:true}).count(),1);
   await page.waitForFunction(()=>document.querySelector('.story-intake iframe')?.getBoundingClientRect().height>1000);
   const frame=page.frames().find(f=>f.url().startsWith('https://tally.so/embed/vXjgJ0'));
   assert.ok(await frame.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Form fits '+width);
   const fit=await frame.evaluate(()=>({height:document.documentElement.scrollHeight,viewport:innerHeight}));
   assert.ok(Math.abs(fit.height-fit.viewport)<30,'Dynamic height fits entire form: '+JSON.stringify(fit));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Site fits '+width);
   const fallback=page.locator('.intake-fallback a');assert.equal(await fallback.getAttribute('href'),'https://tally.so/r/vXjgJ0');assert.equal(await fallback.getAttribute('target'),'_blank');
   assert.equal(await page.locator('a[href^="mailto:"]').filter({hasText:/story/i}).count(),0);
   if(process.env.INTAKE_SCREENSHOTS){fs.mkdirSync(process.env.INTAKE_SCREENSHOTS,{recursive:true});await page.locator(route.includes('#')?'#submit-heading':'h1').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.INTAKE_SCREENSHOTS,(route.includes('#')?'ledger':'reader')+'-'+width+'.png')});}
  }
  console.log(width+'px: real embedded text/media form, dynamic height, permission and direct fallback pass.');
 }
 await page.goto(origin+'/ledger/#hub',{waitUntil:'domcontentloaded'});await page.locator('.hub-card-submit').click();await page.locator('#submit-your-story-view').waitFor({state:'visible'});await page.goBack();await page.locator('#hub').waitFor({state:'visible'});await page.goForward();await page.locator('#submit-your-story-view').waitFor({state:'visible'});
 await page.locator('#submit-your-story-view .view-back').click();await page.locator('#hub').waitFor({state:'visible'});
 const offline=await browser.newContext({javaScriptEnabled:false}),p=await offline.newPage();await p.goto(origin+'/ledger/submit-your-story/',{waitUntil:'domcontentloaded'});assert.equal(await p.locator('.intake-fallback a').isVisible(),true);await offline.close();
 assert.deepEqual(errors,[]);console.log('Hub entry, native Back/Forward, Ledger return and script-disabled direct-form fallback pass. No new submissions sent.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
