// Case sharing must preserve the original entry experience, including old links.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const read=f=>fs.readFileSync(f,'utf8');
const catalog=JSON.parse(read('data/share-cards.json')).items;
const sandbox={window:{}};vm.runInNewContext(read('assets/share-routes.js'),sandbox);
for(const card of catalog.filter(s=>s.kind==='case-study')){
 const target='/ledger/#'+card.sourceId;
 assert.equal(sandbox.window.ledgerShareRoutes[card.sourceId].url,'https://socialeffectsnj.com'+target);
 for(const file of [card.route.slice(1)+'index.html','entry-'+card.sourceId+'.html',...(card.sourceId==='fbr'?['eva/index.html']:card.sourceId==='skater-girl'?['vinati/index.html']:[])]){
  const html=read(file);assert.ok(html.includes('0;url='+target),file+' refresh');
  assert.match(html,new RegExp('window.location.replace\\([\'\"]'+target.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[\'\"]\\)'));
  assert.ok(html.includes(card.image),file+' retains preview image');
 }
 assert.ok(read('ledger/case-studies/index.html').includes('href="'+target+'"'));
 assert.ok(!read('sitemap.xml').includes('<loc>https://socialeffectsnj.com'+card.route+'</loc>'));
}
console.log('All 16 original case destinations, share routes, legacy aliases, preview images and sitemap checks pass.');
