// Operator test: DECK_TEST_PASSWORD_FILE must name a private file outside this repository.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const password=fs.readFileSync(process.env.DECK_TEST_PASSWORD_FILE,'utf8').trim();
const config=JSON.parse(fs.readFileSync(path.join(root,'new/decks/config.json'),'utf8'));
const key=crypto.pbkdf2Sync(password,Buffer.from(config.salt,'base64'),config.iterations,32,'sha256');
function open(file, data){const bytes=data||fs.readFileSync(path.join(root,file));assert.equal(bytes.subarray(0,5).toString(),'DECK1');const d=crypto.createDecipheriv('aes-256-gcm',key,bytes.subarray(5,17));d.setAAD(Buffer.from(file));d.setAuthTag(bytes.subarray(-16));return Buffer.concat([d.update(bytes.subarray(17,-16)),d.final()]);}
let verified=0;
for(const [id,deck] of Object.entries(config.decks)){
  const manifest=JSON.parse(open(deck.manifest));assert.equal(manifest.title,deck.title);
  assert.equal(manifest.slides.length,{lab:15,corporate:12,education:16}[id]);
  for(const slide of manifest.slides){const jpeg=open(slide.file);assert.equal(jpeg.subarray(0,3).toString('hex'),'ffd8ff');assert.ok(slide.text.trim());verified++;}
  const changed=Buffer.from(fs.readFileSync(path.join(root,deck.manifest)));changed[changed.length-20]^=1;assert.throws(()=>open(deck.manifest,changed));
}
assert.equal(verified,43);assert.ok(config.iterations>=600000);
function scan(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())scan(p);else{const b=fs.readFileSync(p);assert.equal(b.includes(Buffer.from(password)),false,'No public password');if(/\.(html|js|json)$/.test(p))assert.ok(!/docs\.google\.com\/presentation/.test(b.toString()),'No source-deck URL in public viewer');if(/\.(pdf|png|pptx|txt)$/.test(p)&&p.includes(path.sep+'decks'+path.sep))throw Error('Plain deck export in public assets');}}}scan(path.join(root,'new'));
const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost');let f=path.resolve(root,'.'+u.pathname);if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return;}if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');fs.readFile(f,(e,b)=>{if(e){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':{'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.jpg':'image/jpeg'}[path.extname(f)]||'application/octet-stream'}).end(b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=process.env.COMPANY_ORIGIN||'http://127.0.0.1:'+server.address().port;const browser=await chromium.launch({headless:true,channel:'chrome'});try{
  const page=await browser.newPage({reducedMotion:'reduce'});page.setDefaultTimeout(15000);
  const errors=[],sent=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{sent.push({url:r.url(),body:r.postData()});});
  for(const width of [1366,390,320]){
    await page.setViewportSize({width,height:900});await page.goto(origin+'/new/offerings.html',{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.locator('iframe').count(),0);assert.equal(await page.locator('#deck-unlock').isVisible(),true);assert.equal(await page.locator('#deck-controls').isVisible(),false);
    assert.ok(await page.locator('#presentation-overview').isVisible(),'Page outside viewer is public');
    for(const id of ['education','corporate','lab']){await page.locator('[data-deck="'+id+'"]').click();await page.waitForFunction(()=>!document.querySelector('[data-deck]').disabled);assert.equal(await page.locator('#deck-heading').textContent(),config.decks[id].title);assert.equal(await page.locator('#deck-slide').getAttribute('src'),config.decks[id].cover);assert.equal(await page.locator('#deck-slide-text').textContent(),'');}
    assert.ok(!sent.some(r=>r.url.endsWith('.bin')),'No encrypted content requested before password');
    await page.locator('#deck-password').fill('deliberately-wrong-password');await page.locator('#deck-unlock button').click();await page.waitForFunction(()=>!document.querySelector('#deck-unlock button').disabled);assert.match(await page.locator('#deck-error').textContent(),/password did not unlock/);assert.equal(await page.locator('#deck-controls').isVisible(),false);assert.equal(await page.locator('#deck-password').inputValue(),'');
    await page.locator('#deck-password').fill(password);await page.locator('#deck-unlock button').click();await page.waitForFunction(()=>!document.querySelector('#deck-controls').hidden&&!document.querySelector('#deck-unlock button').disabled);
    assert.equal(await page.locator('#deck-unlock').isVisible(),false);assert.equal(await page.locator('#deck-password').inputValue(),'');assert.equal(await page.locator('#deck-prev').isDisabled(),true);
    for(const id of ['lab','corporate','education']){
      if(id!=='lab')await page.locator('[data-deck="'+id+'"]').click();
      await page.waitForFunction(()=>document.querySelector('#deck-viewer-shell').getAttribute('aria-busy')==='false');
      const count={lab:15,corporate:12,education:16}[id];
      assert.equal(await page.locator('[aria-pressed="true"]').count(),1);assert.equal(await page.locator('.degree-status').isVisible(),id==='education');
      for(let n=1;n<=count;n++){
        if(n>1){await page.locator('#deck-next').click();await page.waitForFunction(()=>document.querySelector('#deck-viewer-shell').getAttribute('aria-busy')==='false');}
        assert.equal(await page.locator('#deck-count').textContent(),n+' / '+count);await page.waitForFunction(()=>document.querySelector('#deck-slide').naturalWidth===1600);assert.ok((await page.locator('#deck-slide-text').textContent()).trim());
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Viewer fits '+width);
      }
      assert.equal(await page.locator('#deck-next').isDisabled(),true);
      await page.locator('#deck-viewer-shell').focus();await page.keyboard.press('ArrowLeft');await page.waitForFunction(()=>document.querySelector('#deck-viewer-shell').getAttribute('aria-busy')==='false');assert.equal(await page.locator('#deck-count').textContent(),(count-1)+' / '+count);
    }
    await page.locator('#deck-lock').click();assert.equal(await page.locator('#deck-controls').isVisible(),false);assert.equal(await page.locator('#deck-transcript').isVisible(),false);assert.equal(await page.locator('#deck-slide-text').textContent(),'');assert.equal(await page.locator('#deck-slide').getAttribute('src'),config.decks.education.cover);
    if(process.env.COMPANY_SCREENSHOTS){fs.mkdirSync(process.env.COMPANY_SCREENSHOTS,{recursive:true});await page.locator('.deck-section').screenshot({path:path.join(process.env.COMPANY_SCREENSHOTS,'protected-decks-'+width+'.png')});}
    await page.reload({waitUntil:'domcontentloaded'});assert.equal(await page.locator('#deck-unlock').isVisible(),true);assert.deepEqual(await page.evaluate(()=>[localStorage.length,sessionStorage.length]),[0,0]);
    assert.ok(!sent.some(r=>r.url.includes(password)||r.body?.includes(password)),'Password never transmitted');
    sent.length=0;console.log(width+'px: covers, wrong-password rejection, all 43 slides, deck switches, keyboard, bounds, re-lock and locked reload pass.');
  }
  assert.deepEqual(errors,[]);
  assert.ok(!sent.some(r=>r.url.includes(password)||r.body?.includes(password)),'Password never transmitted');
  console.log('All encrypted assets authenticate; modified ciphertext rejected. No plaintext exports, source URLs or password in /new.');
}finally{key.fill(0);await browser.close();server.close();}})().catch(e=>{console.error(e.message);server.close();process.exitCode=1;});
