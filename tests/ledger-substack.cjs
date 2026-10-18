// Acceptance: approved linked subscriber chat, no private messages embedded.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const origin=process.env.COMPANY_ORIGIN||'http://127.0.0.1:61262',chatUrl='https://substack.com/chat/group/040c8908-4a54-4103-bf1f-2ce11d96c0e9';
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{
const p=await b.newPage({reducedMotion:'reduce'});
for(const width of [1366,768,390,320]){
 await p.setViewportSize({width,height:900});await p.goto(origin+'/ledger/#substack',{waitUntil:'load'});await p.evaluate(()=>document.fonts.ready);
 const section=p.locator('.ledger-substack'),card=p.locator('.substack-chat-card');await section.scrollIntoViewIfNeeded();
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(await card.getAttribute('href'),chatUrl);assert.equal(await card.getAttribute('target'),'_blank');assert.equal(await card.getAttribute('rel'),'noopener noreferrer');
 assert.equal(await section.locator('iframe').count(),0);assert.equal(await p.locator('script[src="https://substack.com/embedjs/embed.js"]').count(),0);assert.equal(await p.locator('.playlist-player iframe').count(),2);
 assert.ok(await p.evaluate(()=>document.querySelector('#watch').getBoundingClientRect().bottom<=document.querySelector('#substack').getBoundingClientRect().top));
 if(process.env.SUBSTACK_SCREENSHOTS){fs.mkdirSync(process.env.SUBSTACK_SCREENSHOTS,{recursive:true});await p.addStyleTag({content:'body>nav{display:none!important}'});await section.screenshot({path:path.join(process.env.SUBSTACK_SCREENSHOTS,'chat-'+width+'.png')});await p.locator('style').last().evaluate(e=>e.remove());}
 await p.locator('#nav-hamburger').click();await p.locator('#nav-mobile-overlay.open').waitFor();await p.locator('#nav-mobile-overlay a[href="#filmanthropy-and-ai"]').click();await p.locator('#filmanthropy-and-ai-view').waitFor({state:'visible'});await p.goBack();await section.waitFor({state:'visible'});console.log(width+'px: chat invitation, exact destination, two playlists, menu/Back and no overflow pass.');
}
const next=p.waitForEvent('popup');await p.locator('.substack-chat-card').click();const chat=await next;await chat.waitForLoadState('domcontentloaded');await chat.getByText('Only subscribers to A Civil Rights Moviement for the Soul can access this chat.',{exact:true}).waitFor();assert.ok(p.url().endsWith('/ledger/#substack'));await chat.close();
console.log('Chat opens separately with subscriber access requirement; Ledger retained. No account, subscription or message changed.');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
