// Static publishing for approved sharing records. No database or runtime crawler.
// node scripts/build-sharing.cjs [--check] [--render-images]
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),catalogFile=path.join(root,'data/share-cards.json');
const catalog=JSON.parse(fs.readFileSync(catalogFile,'utf8')),origin=catalog.origin;
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const normalize=s=>s.replace(/\r\n/g,'\n');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sha=b=>crypto.createHash('sha256').update(typeof b==='string'?normalize(b):b).digest('hex');
const entries=vm.runInNewContext(read('assets/ledger-entries.js')+'\nentries');
const reports=JSON.parse(read('data/happening-now.json')).items;
const template=normalize(read('scripts/share-card-template.cjs')),art=fs.readFileSync(path.join(root,'projector-heart.jpg'));
const designFields=['id','cover','section','context','headline','caption','extraCaption','footerLabel','footerUrl'];
const fingerprint=s=>crypto.createHash('sha256').update(JSON.stringify(Object.fromEntries(designFields.map(k=>[k,s[k]??null])))).update(template).update(art).digest('hex');
assert.equal(origin,'https://socialeffectsnj.com','New domains need a separately approved connection/canonical migration.');
const ids=new Set(),routes=new Set(),keys=new Set();
for(const item of catalog.items){
 for(const field of ['id','kind','route','headline','description','section'])assert.ok(typeof item[field]==='string'&&item[field].trim(),field+' required');
 assert.match(item.id,/^[a-z0-9-]+$/);assert.match(item.route,/^\/(?:[a-z0-9-]+\/)*[a-z0-9-]*\/?$/);
 assert.ok(!ids.has(item.id)&&!routes.has(item.route),'Unique IDs/routes');ids.add(item.id);routes.add(item.route);
 if(item.shareKey!==null){assert.ok(!keys.has(item.shareKey),'Unique share keys');keys.add(item.shareKey);}
 if(item.kind==='case-study')assert.ok(entries[item.sourceId],'Missing canonical entry');
 else if(item.kind==='news')assert.ok(reports.some(r=>r.id===item.sourceId),'Missing canonical report');
 else assert.ok(['company','publication'].includes(item.kind),'Unknown item kind');
}
async function renderImages(){
 const http=require('node:http'),{chromium}=require('playwright'),artwork=require('./share-card-template.cjs');
 const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost');if(u.pathname==='/projector-heart.jpg'){res.writeHead(200,{'Content-Type':'image/jpeg'}).end(art);return;}const item=catalog.items.find(s=>u.pathname==='/'+s.id);if(!item){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':'text/html'}).end(artwork(item));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:process.env.LEDGER_BROWSER||'chrome',headless:true});
 try{const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});for(const item of catalog.items){
  // Approved images are reused exactly until a visible card input changes.
  if(item.imageInputHash===fingerprint(item)&&item.image&&fs.existsSync(path.join(root,item.image.slice(1))))continue;
  await page.goto('http://127.0.0.1:'+server.address().port+'/'+item.id,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
  const fit=await page.evaluate(()=>({bottom:document.querySelector('.content').getBoundingClientRect().bottom,footer:document.querySelector('.footer').getBoundingClientRect().top,width:document.documentElement.scrollWidth}));
  assert.ok(fit.bottom+15<fit.footer&&fit.width===1200,item.id+': headline must fit the card');
  const image=await page.screenshot({type:'png'});item.image='/assets/share/'+item.id+'-'+sha(image).slice(0,10)+'.png';item.imageInputHash=fingerprint(item);fs.writeFileSync(path.join(root,item.image.slice(1)),image);
  console.log('Rendered '+item.image+'; review the visual before publication.');
 }}finally{await browser.close();server.close();}
 fs.writeFileSync(catalogFile,JSON.stringify(catalog,null,2)+'\n');
}
const title=s=>s.metadataTitle||s.headline+' | The Filmanthropy Ledger';
const url=s=>origin+s.route;
const fileFor=s=>s.kind==='company'?'index.html':s.kind==='publication'?'ledger/index.html':s.route.slice(1)+'index.html';
const imageAlt=s=>[...new Set([s.headline,s.section,'Social Effects NJ'])].join(' · ');
const fullMeta=s=>({title:title(s),description:s.description,url:url(s),image:origin+s.image,alt:imageAlt(s),type:['case-study','news'].includes(s.kind)?'article':'website',site:s.kind==='company'?'Social Effects NJ':'The Filmanthropy Ledger · Social Effects NJ'});
function patchMeta(html,meta){
 const split=html.indexOf('</head>');assert.ok(split>=0,'HTML head required');let head=html.slice(0,split),body=html.slice(split);
 function replaceTag(pattern,tag){let found=false;head=head.replace(pattern,()=>{if(found)return '';found=true;return tag;});if(!found)head+='\n'+tag;}
 function tag(attr,key,value){replaceTag(new RegExp('<meta\\b(?=[^>]*\\b'+attr+'=["\']'+key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'["\'])[^>]*>','gi'),'<meta '+attr+'="'+key+'" content="'+esc(value)+'">');}
 if(meta.title!==undefined){replaceTag(/<title>[\s\S]*?<\/title>/gi,'<title>'+esc(meta.title)+'</title>');tag('property','og:title',meta.title);tag('name','twitter:title',meta.title);}
 if(meta.description!==undefined){tag('name','description',meta.description);tag('property','og:description',meta.description);tag('name','twitter:description',meta.description);}
 if(meta.url!==undefined){tag('property','og:url',meta.url);replaceTag(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi,'<link rel="canonical" href="'+esc(meta.url)+'">');}
 if(meta.type!==undefined)tag('property','og:type',meta.type);
 if(meta.site!==undefined)tag('property','og:site_name',meta.site);
 if(meta.image!==undefined){tag('property','og:image',meta.image);tag('name','twitter:image',meta.image);tag('property','og:image:width','1200');tag('property','og:image:height','630');tag('name','twitter:card','summary_large_image');tag('property','og:image:alt',meta.alt);tag('name','twitter:image:alt',meta.alt);}
 return head+body;
}
function safeUrl(u){const parsed=new URL(u);assert.ok(['http:','https:'].includes(parsed.protocol),'Safe source URL');return esc(u);}
function shares(s){const encoded=encodeURIComponent(url(s)),text=encodeURIComponent(s.headline+' · The Filmanthropy Ledger · Social Effects NJ.'),links=[['LinkedIn','https://www.linkedin.com/sharing/share-offsite/?url='+encoded],['X','https://twitter.com/intent/tweet?url='+encoded+'&text='+text],['Facebook','https://www.facebook.com/sharer/sharer.php?u='+encoded],['WhatsApp','https://wa.me/?text='+text+'%20'+encoded],['Telegram','https://t.me/share/url?url='+encoded+'&text='+text],['Email','https://mail.google.com/mail/?view=cm&fs=1&su='+encodeURIComponent(s.headline)+'&body='+text+'%20'+encoded]];return '<section class="article-share" aria-labelledby="share-title"><h2 id="share-title">Share this '+(s.kind==='news'?'report':'entry')+'</h2><div class="share-links">'+links.map(([name,href])=>'<a href="'+esc(href)+'" target="_blank" rel="noopener noreferrer" aria-label="Share via '+name+'">'+name+'</a>').join('')+'<button type="button" data-copy-share="'+esc(url(s))+'">Copy link</button></div><p class="share-feedback" role="status" aria-live="polite"></p><noscript><p>Link: <a href="'+esc(url(s))+'">'+esc(url(s))+'</a></p></noscript></section>';}
function article(s){
 let heading,editorial,meta,content,sectionHref;
 if(s.kind==='case-study'){
  const e=entries[s.sourceId];heading=e.name;editorial=e.editorial;meta=e.meta;sectionHref='/ledger/#case-studies';
  content=(e.verdict?.text?'<section><h2>'+esc(e.verdict.label)+'</h2><p>'+esc(e.verdict.text)+'</p></section>':'')+'<h2>The record</h2><dl class="article-stats">'+e.stats.map(([a,b])=>'<div><dt>'+esc(a)+'</dt><dd>'+esc(b)+'</dd></div>').join('')+'</dl>'+e.body.map(p=>'<p>'+esc(p)+'</p>').join('');
  if(e.provenance)content='<p class="report-status">'+esc(e.provenance)+'</p>'+content;
  if(e.quote)for(const q of Array.isArray(e.quote)?e.quote:[e.quote])content+='<blockquote><p>'+esc(q.text)+'</p><cite>'+esc(q.attr)+'</cite></blockquote>';
  if(e.links?.length)content+='<h2>Further reading</h2><ul class="source-list">'+e.links.map(l=>'<li><a href="'+safeUrl(l.url)+'" target="_blank" rel="noopener noreferrer">'+esc(l.label)+'</a></li>').join('')+'</ul>';
 }else{
  const r=reports.find(r=>r.id===s.sourceId);heading=s.headline;editorial=r.production;meta=r.place+' · '+r.date+' · '+r.who;sectionHref='/ledger/#happening-now';
  content='<p class="report-summary">'+esc(r.summary)+'</p><div class="report-status"><p><strong>'+esc(r.verification.label)+'</strong>'+(r.followUp?' · '+esc(r.followUp):'')+'</p></div><h2>Source'+(r.sources.length>1?'s':'')+'</h2><ul class="source-list">'+r.sources.map(source=>'<li><a href="'+safeUrl(source.url)+'" target="_blank" rel="noopener noreferrer">'+esc(source.outlet)+'</a> · '+esc(source.date)+'</li>').join('')+'</ul>';
 }
 const cssHash=sha(read('assets/share-article.css')).slice(0,12),jsHash=sha(read('assets/share-article.js')).slice(0,12);
 const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index, follow"><title></title><link rel="icon" href="/social-effects-logo.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/share-article.css?v='+cssHash+'"><script src="/assets/share-article.js?v='+jsHash+'" defer></script></head><body><a class="skip-link" href="#article">Skip to the story</a><nav class="article-nav" aria-label="Ledger navigation"><a class="article-brand" href="/ledger/">The Filmanthropy Ledger<small>by Social Effects NJ</small></a><div class="article-nav-links"><a class="nav-section" href="'+sectionHref+'">'+esc(s.section)+'</a><a href="/">Social Effects NJ</a></div></nav><main id="article"><header class="article-hero"><span class="eyebrow">'+esc(s.section)+'</span><h1>'+esc(heading)+'</h1><p class="article-editorial">'+esc(editorial)+'</p><p class="article-meta">'+esc(meta)+'</p></header><article class="article-paper">'+content+shares(s)+'</article></main><footer class="article-footer"><a href="/ledger/">The Filmanthropy Ledger</a> · A publication by <a href="/">Social Effects NJ</a><p>© 2006 Social Effects NJ</p></footer></body></html>\n';
 return patchMeta(html,fullMeta(s));
}
async function main(){
 if(process.argv.includes('--check')&&process.argv.includes('--render-images'))throw Error('Choose --check or --render-images');
 if(process.argv.includes('--render-images'))await renderImages();
 for(const s of catalog.items){assert.equal(s.imageInputHash,fingerprint(s),s.id+': card changed; run --render-images and review it');assert.match(s.image,/^\/assets\/share\/[a-z0-9-]+-[a-f0-9]{10}\.png$/);const image=fs.readFileSync(path.join(root,s.image.slice(1)));assert.equal(image.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(image.readUInt32BE(16),1200);assert.equal(image.readUInt32BE(20),630);assert.ok(s.image.endsWith('-'+sha(image).slice(0,10)+'.png'),'Image digest matches filename');}
 const planned=new Map(),company=catalog.items.find(s=>s.kind==='company'),publication=catalog.items.find(s=>s.kind==='publication');
 function modify(file,fn){planned.set(file,fn(planned.has(file)?planned.get(file):read(file)));}
 const companyFiles=fs.readdirSync(root).filter(f=>f.endsWith('.html')&&read(f).includes('class="company-revamp'));
 const companyBridges=fs.readdirSync(path.join(root,'new')).filter(f=>f.endsWith('.html')).map(f=>'new/'+f).concat('socialeffects/index.html');
 for(const f of [...companyFiles,...companyBridges])modify(f,h=>patchMeta(h,{image:origin+company.image,alt:imageAlt(company)}));
 const publicationBridges=['filmanthropyledger/index.html','Filmanthropy_Ledger.html','Filmanthropy_Ledger_v2.html','eva/index.html','vinati/index.html',...fs.readdirSync(root).filter(f=>/^entry-.*\.html$/.test(f))];
 for(const f of publicationBridges)modify(f,h=>patchMeta(h,{image:origin+publication.image,alt:imageAlt(publication)}));
 for(const s of catalog.items){const f=fileFor(s);if(['company','publication'].includes(s.kind))modify(f,h=>patchMeta(h,fullMeta(s)));else planned.set(f,article(s));}
 const routeMap=Object.fromEntries(catalog.items.filter(s=>s.shareKey!==null).map(s=>[s.shareKey,{url:url(s),title:s.headline}]));
 const routeJS='// Generated by scripts/build-sharing.cjs from data/share-cards.json.\nwindow.ledgerShareRoutes=Object.freeze('+JSON.stringify(routeMap).replace(/</g,'\\u003c')+');\n';planned.set('assets/share-routes.js',routeJS);
 modify('ledger/index.html',h=>{const tag='<script src="/assets/share-routes.js?v='+sha(routeJS).slice(0,12)+'" data-share-routes></script>';if(/<script\b[^>]*data-share-routes[^>]*><\/script>/.test(h))h=h.replace(/<script\b[^>]*data-share-routes[^>]*><\/script>/,tag);else h=h.replace('<script>window.LEDGER_V2 = true;</script>',tag+'\n<script>window.LEDGER_V2 = true;</script>');return h.replace(/\/assets\/ledger-v2\.js\?v=[^"']+/,'/assets/ledger-v2.js?v='+sha(read('assets/ledger-v2.js')).slice(0,12));});
 const spielberg=catalog.items.find(s=>s.sourceId==='schindlers-list');if(spielberg)modify('entry-schindlers-list.html',h=>patchMeta(h,fullMeta(spielberg)).replaceAll('/ledger/#schindlers-list',spielberg.route));
 const manifest=catalog.items.map(s=>({id:s.id,kind:s.kind,shareKey:s.shareKey,url:url(s),title:title(s),description:s.description,image:origin+s.image,imageAlt:imageAlt(s),width:1200,height:630,source:s.source}));planned.set('data/share-manifest.json',JSON.stringify({version:1,items:manifest},null,2)+'\n');
 let sitemap=read('sitemap.xml');for(const s of catalog.items.filter(s=>['case-study','news'].includes(s.kind)))if(!sitemap.includes('<loc>'+url(s)+'</loc>'))sitemap=sitemap.replace('</urlset>','  <url><loc>'+url(s)+'</loc></url>\n</urlset>');planned.set('sitemap.xml',sitemap);
 const changed=[];for(const[f,text]of planned){const p=path.join(root,f);if(!fs.existsSync(p)||normalize(fs.readFileSync(p,'utf8'))!==normalize(text)){changed.push(f);if(!process.argv.includes('--check')){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,text);}}}
 if(process.argv.includes('--check')&&changed.length)throw Error('Generated sharing output is stale: '+changed.join(', '));
 console.log(catalog.items.length+' approved cards, '+catalog.items.filter(s=>['case-study','news'].includes(s.kind)).length+' generated articles; '+changed.length+' file(s) '+(process.argv.includes('--check')?'would change.':'updated.'));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
