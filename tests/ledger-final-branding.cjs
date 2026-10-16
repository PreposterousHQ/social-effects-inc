// Run with Playwright on NODE_PATH; LEDGER_BROWSER=chrome uses installed Chrome.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const oldImage='https://socialeffectsnj.com/social-share.jpg';
const newImage='https://socialeffectsnj.com/social-share-nj-v2.jpg';
const baseline='8ef2d1dac0081d3206e813efbed56379d5e4c3d6';
const tracked=execFileSync('git',['grep','-l','-F',oldImage,baseline,'--','*.html'],{cwd:root,encoding:'utf8'}).trim().split('\n').map(ref=>ref.slice(baseline.length+1));
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');let file=path.resolve(root,'.'+url.pathname);
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.json':'application/json'}[path.extname(file)]||'application/octet-stream'}).end(data);});
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,...(process.env.LEDGER_BROWSER?{channel:process.env.LEDGER_BROWSER}:{})});
 try{
  const page=await browser.newPage({reducedMotion:'reduce'});page.setDefaultTimeout(10000);page.setDefaultNavigationTimeout(30000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const host of ['fonts.googleapis.com','fonts.gstatic.com','cdn.jsdelivr.net','www.youtube-nocookie.com'])await page.route('https://'+host+'/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
  const origin=process.env.LEDGER_ORIGIN||'http://127.0.0.1:'+server.address().port;
  let metaPages=0;
  for(const file of tracked){
   const html=fs.readFileSync(path.join(root,file),'utf8');
   const before=execFileSync('git',['show',baseline+':'+file],{cwd:root,encoding:'utf8',maxBuffer:2e6});
   if(!before.includes(oldImage))continue;
   assert.ok(!html.includes(oldImage),file+' must not retain the old metadata image URL');
   const response=await fetch(origin+'/'+file);assert.equal(response.status,200);
   const checks=await page.evaluate(({html,newImage})=>{
    const doc=new DOMParser().parseFromString(html,'text/html');
    return ['meta[property="og:image"]','meta[name="twitter:image"]'].every(s=>doc.querySelector(s)?.content===newImage)&&doc.querySelector('meta[property="og:image:width"]')?.content==='1200'&&doc.querySelector('meta[property="og:image:height"]')?.content==='630';
   },{html:await response.text(),newImage});
   assert.ok(checks,file+' social metadata');metaPages++;
   if(!['Filmanthropy_Ledger_v2.html','Filmanthropy_Ledger.html'].includes(file))assert.equal(html.replace(/\r\n/g,'\n'),before.replaceAll(oldImage,newImage),'Only metadata image changes in '+file);
  }
  assert.equal(metaPages,22);
  assert.ok(fs.readFileSync(path.join(root,'social-share.jpg')).equals(fs.readFileSync(path.join(root,'social-share-nj-v2.jpg'))),'Legacy image path serves same corrected artwork');
  for(const file of ['social-share.jpg','social-share-nj-v2.jpg']){const image=await fetch(origin+'/'+file);assert.equal(image.status,200);assert.ok(Buffer.from(await image.arrayBuffer()).equals(fs.readFileSync(path.join(root,file))),file+' served bytes match corrected image');}
  for(const file of ['Filmanthropy_Ledger_v2.html','Filmanthropy_Ledger.html']){
   const before=execFileSync('git',['show',baseline+':'+file],{cwd:root,encoding:'utf8',maxBuffer:2e6});
   const after=fs.readFileSync(path.join(root,file),'utf8');
   const preserved=await page.evaluate(({before,after})=>{const texts=html=>[...new DOMParser().parseFromString(html,'text/html').querySelectorAll('.essay-p,.essay-h3,.l-card,.bridge-p,.ledger-v1-record,.ai-article')].map(e=>e.textContent);return JSON.stringify(texts(before))===JSON.stringify(texts(after));},{before,after});
   assert.ok(preserved,'Protected prose unchanged in '+file);
  }
  const dimensions=await page.evaluate(async url=>{const img=new Image();img.src=url;await img.decode();return {width:img.naturalWidth,height:img.naturalHeight};},origin+'/social-share-nj-v2.jpg');
  assert.deepEqual(dimensions,{width:1200,height:630});
  for(const width of [360,390,1440]){
   await page.setViewportSize({width,height:900});
   await page.goto(origin+'/Filmanthropy_Ledger_v2.html#hub',{waitUntil:'load'});
   await page.locator('.ledger-footer').scrollIntoViewIfNeeded();
   const copyright=page.locator('.ledger-footer-copyright');
   assert.equal(await copyright.textContent(),'© 2006 Social Effects NJ');
   assert.equal(await copyright.evaluate(e=>e.previousElementSibling?.textContent),'The Filmanthropy Ledger');
   assert.ok(await copyright.evaluate(e=>{const p=e.getBoundingClientRect();const t=e.previousElementSibling.getBoundingClientRect();return p.top>=t.bottom&&p.top-t.bottom<18&&Math.abs((p.x+p.width/2)-(t.x+t.width/2))<2;}),'Copyright directly under title and centered');
   assert.equal(await copyright.evaluate(e=>getComputedStyle(e).textTransform),'none');
   assert.equal(await page.locator('.ledger-footer-brand figcaption').textContent(),'Social Effects NJ');
   assert.equal(await page.locator('.ledger-footer-art').getAttribute('src'),'social-effects-logo.png');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(process.env.LEDGER_SCREENSHOTS){fs.mkdirSync(process.env.LEDGER_SCREENSHOTS,{recursive:true});await page.locator('.ledger-footer').screenshot({path:path.join(process.env.LEDGER_SCREENSHOTS,'footer-'+width+'.png')});}
   console.log(width+'px: exact 2006 copyright directly under Ledger title, centered; original footer artwork preserved');
  }
  assert.deepEqual(errors,[]);
  console.log(metaPages+' metadata pages: new OG/Twitter image URL, 1200×630, old-path compatibility, preserved copy; no site JavaScript errors');
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error.message);server.close();process.exitCode=1;});
