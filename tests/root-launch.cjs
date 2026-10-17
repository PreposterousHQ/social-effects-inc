// Launch acceptance: approved content, canonical metadata, aliases, link graph,
// article/section sharing, and company/publication returns. Never submits posts.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..');
const base=process.env.LAUNCH_BASE||'0550ec5df559edff9b8280c9fb722f2ac2edb862';
const old=f=>execFileSync('git',['show',base+':'+f],{cwd:root,encoding:'utf8',maxBuffer:3e6}).replace(/\r\n/g,'\n');
const read=f=>fs.readFileSync(path.join(root,f),'utf8').replace(/\r\n/g,'\n');
const pages=fs.readdirSync(path.join(root,'new')).filter(f=>f.endsWith('.html'));
function routes(s){for(const f of pages)s=s.replaceAll('/new/'+f,f==='index.html'?'/':'/'+f);return s.replaceAll('href="/new/"','href="/"').replaceAll('href="/new/#','href="/#').replaceAll('https://socialeffectsnj.com/new/','https://socialeffectsnj.com/').replaceAll('/filmanthropyledger','/ledger').replaceAll('%2Ffilmanthropyledger','%2Fledger');}
for(const f of pages){const live=read(f).replace(/<link rel="canonical"[^>]+>/,'').replace('index, follow','noindex, follow');assert.equal(live,routes(old('new/'+f)),f+': approved company text/layout preserved');}
assert.equal(read('ledger/index.html'),routes(old('filmanthropyledger/index.html')).replaceAll('href="/socialeffects"','href="/"'),'Entire Ledger preserved apart from destinations');
for(const f of ['new/private-decks.js','new/decks/config.json','new/moonshot-decks.js','new/moonshot-decks/manifest.json','assets/ledger-v2.js','assets/ledger-entries.js','assets/ledger-v2.css','CNAME'])assert.equal(read(f),old(f),'Unchanged '+f);
const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost');let file=path.resolve(root,'.'+decodeURIComponent(u.pathname));if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}if(fs.existsSync(file)&&fs.statSync(file).isDirectory()){if(!u.pathname.endsWith('/')){res.writeHead(301,{Location:u.pathname+'/'+u.search}).end();return;}file=path.join(file,'index.html');}fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.json':'application/json','.xml':'application/xml'}[path.extname(file)]||'application/octet-stream'}).end(b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=process.env.COMPANY_ORIGIN||'http://127.0.0.1:'+server.address().port;const browser=await chromium.launch({channel:'chrome',headless:true});try{
const context=await browser.newContext({reducedMotion:'reduce'});
for(const host of ['fonts.googleapis.com','fonts.gstatic.com','cdn.jsdelivr.net'])await context.route('https://'+host+'/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
await context.route('https://www.youtube-nocookie.com/**',r=>r.fulfill({status:200,contentType:'text/html',body:'<title>External player</title>'}));
const p=await context.newPage(),errors=[],failed=[];p.setDefaultTimeout(12000);p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.url().startsWith(origin+'/')&&r.status()>=400)failed.push(r.url());});
const linkTargets=new Set();
for(const f of pages){const route=f==='index.html'?'/':'/'+f;await p.goto(origin+route,{waitUntil:'load'});assert.equal(await p.locator('h1').count(),1);assert.equal(await p.locator('meta[name="robots"]').getAttribute('content'),'index, follow');assert.equal(await p.locator('link[rel="canonical"]').getAttribute('href'),'https://socialeffectsnj.com'+route);assert.equal(await p.locator('meta[property="og:url"]').getAttribute('content'),'https://socialeffectsnj.com'+route);const links=await p.locator('a[href]').evaluateAll(es=>es.map(e=>e.href));for(const url of links){const u=new URL(url);if(u.origin===locationOrigin(origin)){assert.ok(!/^\/new\/.*\.html$|^\/new\/$|^\/socialeffects\/?$|^\/filmanthropyledger\/?$/.test(u.pathname),'No old navigation '+url);linkTargets.add(u.pathname+u.search+u.hash);}}}
function locationOrigin(o){return new URL(o).origin;}
for(const target of linkTargets){const r=await p.request.get(origin+target);assert.equal(r.status(),200,target);}
console.log('12 approved pages: text/layout, indexability, canonical/OG metadata and '+linkTargets.size+' internal destinations pass.');
for(const f of pages){const route=f==='index.html'?'/':'/'+f;await p.goto(origin+'/new/'+(f==='index.html'?'':f)+'?launch=1#saved-place',{waitUntil:'load'});await p.waitForURL(origin+route+'?launch=1#saved-place');}
for(const alias of ['/filmanthropyledger/','/Filmanthropy_Ledger.html','/Filmanthropy_Ledger_v2.html']){await p.goto(origin+alias+'?from=shared#essay',{waitUntil:'load'});await p.waitForURL(origin+'/ledger/?from=shared#essay');assert.equal(await p.locator('body').getAttribute('data-ledger-view'),'essay');}
await p.goto(origin+'/socialeffects/?from=ledger#filmanthropy',{waitUntil:'load'});await p.waitForURL(origin+'/?from=ledger#filmanthropy');
for(const f of fs.readdirSync(root).filter(f=>/^entry-.*\.html$/.test(f))){await p.goto(origin+'/'+f,{waitUntil:'load'});await p.waitForURL('**/ledger/#'+f.slice(6,-5));await p.locator('#ledger-expanded').waitFor();}
for(const [alias,id]of [['eva','fbr'],['vinati','skater-girl']]){await p.goto(origin+'/'+alias+'/',{waitUntil:'load'});await p.waitForURL('**/ledger/#'+id);await p.locator('#ledger-expanded').waitFor();}
console.log('12 /new aliases, legacy publication/company routes, all 16 entries and Eva/Vinati preserve destinations.');
for(const width of [1366,390]){await p.setViewportSize({width,height:900});await p.goto(origin+'/',{waitUntil:'load'});await p.locator('.hero a[href="/ledger"]').click();await p.waitForURL('**/ledger/');await p.locator('.ledger-intro-link a[href="/"]').click();await p.waitForURL(origin+'/');await p.goBack({waitUntil:'load'});await p.waitForURL('**/ledger/');assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
// Old cached /ledger redirects could otherwise bounce back through the filename.
await p.route('**/ledger/',async r=>{if(new URL(r.request().url()).search==='')await r.fulfill({status:200,contentType:'text/html',body:'<script>location.replace("/Filmanthropy_Ledger.html"+location.hash)</script>'});else await r.continue();});
await p.goto(origin+'/ledger/#filmanthropy-and-ai',{waitUntil:'load'});await p.waitForFunction(()=>location.pathname==='/ledger/'&&!location.search&&document.body.dataset.ledgerView==='filmanthropy-and-ai');
assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);console.log('Company ↔ Ledger journeys, native Back, mobile bounds and cached-alias loop bypass pass. No site errors or failed assets.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
