// Read-only projections of the existing Ledger content for independently shareable URLs.
const assert=require('node:assert/strict');
function element(html,attribute,value){
  html=html.replace(/<!--[\s\S]*?-->/g,'');
  const match=new RegExp('<([a-z][a-z0-9-]*)\\b(?=[^>]*\\b'+attribute+'=["\\\']'+(attribute==='class'?'[^"\\\']*\\b':'')+value+(attribute==='class'?'\\b[^"\\\']*':'')+'["\\\'])[^>]*>','i').exec(html);
  assert.ok(match,'Missing source element: '+attribute+'='+value);
  const start=match.index+match[0].length,tags=new RegExp('<\\/?'+match[1]+'\\b[^>]*>','gi');tags.lastIndex=start;let depth=1,t;
  while((t=tags.exec(html))){depth+=t[0].startsWith('</')?-1:1;if(!depth)return html.slice(start,t.index);}
  throw Error('Unclosed source element: '+value);
}
function withoutElement(html,attribute,value){
  const body=element(html,attribute,value);
  const at=html.indexOf(body);
  const open=html.lastIndexOf('<',at),end=html.indexOf('>',at+body.length)+1;
  return html.slice(0,open)+html.slice(end);
}
const stripTags=s=>s.replace(/<[^>]*>/g,'').trim();
function inline(html){
  // Canonical entry records contain a few deliberate emphasis/link tags and entities.
  assert.ok(!/<(?!\/?(?:a|em|strong|br)\b)/i.test(html),'Unexpected inline content tag');
  assert.ok(!/\son\w+\s*=|javascript:|<a\b[^>]*href\s*=\s*["'](?!https?:\/\/)/i.test(html),'Unsafe inline content');
  return html;
}
function sectionContent(s,{ledger,entries,reports,catalog,esc,chapters}){
  let content;
  if(s.shareKey==='case-studies'){
    const order=Object.keys(entries).sort((a,b)=>ledger.indexOf('data-entry="'+a+'"')-ledger.indexOf('data-entry="'+b+'"'));
    content='<p>Sixteen entries and counting, from over 100 years right through the pioneers of sustainability and modern Filmanthropy and beyond.</p><ol class="story-index">'+order.map(id=>{const e=entries[id],card=catalog.find(s=>s.kind==='case-study'&&s.sourceId===id);return '<li><span class="index-label">'+esc(e.bLabel)+'</span><h2><a href="'+esc(card.route)+'">'+esc(e.name)+'</a></h2><p class="index-caption">'+esc(e.editorial)+'</p><p>'+esc(card.description)+'</p><a class="index-read" href="'+esc(card.route)+'">Read full entry →</a></li>';}).join('')+'</ol>';
  }else if(s.shareKey==='happening-now'){
    let intro=element(ledger,'class','live-feed-inner');
    intro=withoutElement(intro,'id','happening-feed');
    content=intro+'<div class="news-index">'+reports.map(r=>{const card=catalog.find(s=>s.kind==='news'&&s.sourceId===r.id);return '<section><span class="index-label">'+esc(r.place)+' · '+esc(r.date)+'</span><h2><a href="'+esc(card.route)+'">'+esc(r.production)+'</a></h2><p>'+esc(r.summary)+'</p><p class="report-status">'+esc(r.verification.label)+(r.followUp?' · '+esc(r.followUp):'')+'</p><a class="index-read" href="'+esc(card.route)+'">Read report and sources →</a></section>';}).join('')+'</div>';
  }else if(s.shareKey==='essay'){
    let summary=element(ledger,'class','inshort-band');
    summary=withoutElement(summary,'class','inshort-band-footer');
    let essay=element(ledger,'id','opening-essay').replace(/<summary\b[^>]*>[\s\S]*?<\/summary>/gi,'').replace(/<\/?details\b[^>]*>/gi,'');
    const items=[];
    essay=essay.replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/g,(tag,text)=>{const key=stripTags(text).replace(/&#8217;|&rsquo;/g,'’'),chapter=chapters[key];assert.ok(chapter,'Unknown essay chapter: '+key);items.push('<a href="#'+chapter.id+'">'+text+'</a>');return '<h2 id="'+chapter.id+'">'+text+'</h2>';});
    content=summary+'<details class="section-toc"><summary>In this essay</summary><nav aria-label="Essay sections">'+items.join('')+'</nav></details>'+essay;
  }else{
    const view=element(ledger,'id',s.sourceId);
    content=element(view,'class',s.shareKey==='note-on-the-ledger'?'ledger-v1-record-inner':'stories-inner');
  }
  content=content.replace(/<span\b[^>]*class="[^"]*ledger-section-tag[^"]*"[^>]*>[\s\S]*?<\/span>/g,'');
  if(s.shareKey!=='essay'&&s.shareKey!=='case-studies')content=content.replace(/<h2\b[^>]*>[\s\S]*?<\/h2>/,'');
  content=content.replace(/\sstyle="[^"]*"/g,'').replace(/<article\b[^>]*>/g,'<div>').replace(/<\/article>/g,'</div>');
  // Every copied anchor must land on a real static page or on a heading retained here.
  const localIds=new Set([...content.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
  const aliases={hub:'',paths:'',forerunners:'case-studies','rock-and-wrap-it-up':'rawk','film-biz-recycling':'fbr','motion-picture-relief-fund':'mptf','lord-of-the-rings':'hobbiton','slumdog-millionaire':'slumdog','braddock-free-store':'braddock'};
  content=content.replace(/href="#([^"]*)"/g,(tag,key)=>{
    if(localIds.has(key))return tag;
    key=aliases[key]??key;
    const card=catalog.find(s=>s.shareKey===key);
    if(card)return 'href="'+esc(card.route)+'"';
    if(Object.values(chapters).some(c=>c.id===key))return 'href="/ledger/essay/#'+key+'"';
    throw Error('Unresolved source anchor: '+key);
  });
  assert.ok(!/\son\w+=|<script\b|Loading reports|data-entry=/.test(content),'Static section must contain working reader controls');
  return '<div class="section-copy">'+content.replace(/[ \t]+$/gm,'')+'</div>';
}
module.exports={element,sectionContent,inline};
