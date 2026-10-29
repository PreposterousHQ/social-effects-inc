// Exercise the production entry controls against both direct and in-Ledger histories.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('assets/ledger-v2.js','utf8');
const close=source.match(/window\.closeExpanded = function \(\) \{([\s\S]*?)\n  \};/)[1];
const move=source.match(/function moveEntry\(direction\) \{([\s\S]*?)\n  \}/)[1];
for(const state of [null,{ledgerEntry:true,returnHash:'#case-studies'},{unrelated:true}]){
 const calls=[],context={window:{},currentEntry:'skater-girl',ENTRY_ORDER:['earth-angel','skater-girl','sing-sing'],routeHash:initial=>calls.push(['route',initial]),history:{state,replaceState(next,unused,url){this.state=next;calls.push(['replace',url]);},back(){throw Error('Entry close must not navigate out of the Ledger');}}};
 vm.createContext(context);
 vm.runInContext('function moveEntry(direction){'+move+'}\nwindow.closeExpanded=function(){'+close+'};',context);
 vm.runInContext('moveEntry(1); currentEntry="sing-sing"; moveEntry(-1); window.closeExpanded();',context);
 assert.deepEqual(calls.filter(c=>c[0]==='replace').map(c=>c[1]),['#sing-sing','#skater-girl','#case-studies']);
 assert.equal(context.history.state,null);
 assert.equal(calls.at(-1)[0],'route');
}
console.log('Direct-entry, pagination and existing-history return controls stay in the case list.');
