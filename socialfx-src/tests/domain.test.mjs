import test from 'node:test';
import assert from 'node:assert/strict';
import {initial,apply,totals,validateWorkspace,upgradeScenario,releaseItems} from '../src/domain.ts';
const command=(w,type,extra={})=>apply(w,{type,version:releaseItems(w.production).find(p=>p.id===(extra.itemId||'unbreakable-spirit'))?.version,...extra},'2026-10-30T12:00:00Z',crypto.randomUUID());
function ready(){let w=initial('demo');for(const type of ['deadline','interest','storage','collection','delivery','fuel'])w=command(w,type);return w;}
test('sample scenario and personal network are separated',()=>{assert.equal(initial('demo').organizations.length,5);assert.equal(initial('network').organizations.length,0);assert.equal(initial('network').production,null);});
test('a deadline change invalidates previous logistics confirmations',()=>{let w=initial('demo');w=command(w,'storage');w=command(w,'collection');w=command(w,'deadline');assert.equal(w.production.storage,false);assert.equal(w.production.collection,false);assert.equal(w.production.deadline,'2026-12-07');assert.equal(w.messages.length,3);});
test('allocation requires recipient, logistics and fuel support',()=>{assert.throws(()=>command(initial('demo'),'allocate',{quantity:1}),/interest/);let w=ready();w.production.fuelCovered=false;assert.throws(()=>command(w,'allocate',{quantity:1}),/fuel/);});
test('partial allocation cannot exceed quantity; receipt closes only its portion',()=>{let w=ready();w=command(w,'allocate',{quantity:9});assert.equal(totals(w.production).remaining,1);assert.throws(()=>command(w,'allocate',{quantity:2}),/no longer available/);const id=w.production.allocations[0].id;w=command(w,'receive',{id,quantity:1});assert.equal(totals(w.production).received,1);assert.notEqual(w.production.stage,'Story');assert.throws(()=>command(w,'receive',{id,quantity:9}),/exceeds/);w=command(w,'allocate',{quantity:1});w=command(w,'receive',{id,quantity:8});w=command(w,'receive',{id:w.production.allocations[1].id,quantity:1});assert.equal(w.production.stage,'Story');});
test('stale commands do not repeat an allocation',()=>{const w=ready(),version=w.production.version;const next=command(w,'allocate',{quantity:2});assert.throws(()=>apply(next,{type:'allocate',version,quantity:2}),/changed/);assert.equal(totals(next.production).reserved,2);});
test('missing resource availability prevents confirmation',()=>{let w=initial('demo');const r=w.resources[1];w=command(w,'resource',{id:r.id,version:r.version,record:{...r,status:'Unavailable'}});assert.throws(()=>command(w,'collection'),/No recorded resource/);});
test('invalid inputs do not mutate original state',()=>{const w=ready();for(const q of [0,-1,1.5,NaN,11])assert.throws(()=>command(w,'allocate',{quantity:q}));assert.equal(totals(w.production).reserved,0);});
test('organization conversation creates canonical contact and zero fee membership',()=>{const w=command(initial('network'),'organization',{record:{name:'Test Organization',roles:'Nonprofit · Storage',place:'NJ',needs:'Chairs',gifts:'Van',notes:'Introduction pending',source:'Conversation',contactName:'Test Person',contactRole:'Coordinator',channel:'Phone'}});assert.equal(w.organizations.length,1);assert.equal(w.contacts[0].organizationId,w.organizations[0].id);assert.equal(w.memberships[0].fee,0);assert.equal(w.events.length,1);});
test('questions persist as simulation records with provenance',()=>{const w=command(initial('demo'),'question',{note:'Could delivery be after 10?'});assert.match(w.messages[0].text,/after 10/);assert.match(w.events[0].detail,/Could delivery be after 10/);});
test('malformed snapshots are rejected instead of silently reset',()=>{assert.throws(()=>validateWorkspace({schema:999},'demo'));const w=ready();w.production.allocations=[{quantity:11,received:0}];assert.throws(()=>validateWorkspace(w,'demo'),/invalid/);});

test('scenario upgrade preserves edited notes, contacts and rehearsal progress',()=>{
 const w=ready();delete w.scenarioVersion;
 w.ideas[0].version=2;w.ideas[0].description='My workshop notes';
 w.ideas[1].description='Old seeded discovery text';
 const upgraded=upgradeScenario(w);
 assert.equal(upgraded.ideas[0].description,'My workshop notes');
 assert.match(upgraded.ideas[1].description,/fixed requirements/);
 assert.deepEqual(upgraded.archivedRehearsals[0].production,w.production);
 assert.equal(upgraded.production.total,10);
 assert.equal(upgraded.production.interest,false);
 assert.deepEqual(upgraded.contacts,w.contacts);
 assert.deepEqual(upgraded.archivedRehearsals[0].events,w.events);
 assert.deepEqual(upgradeScenario(upgraded),upgraded);
 assert.equal(w.ideas[1].description,'Old seeded discovery text');
 assert.equal(upgradeScenario(initial('network')).production,null);
});
test('untouched old rehearsal enters coordination without erasing records',()=>{
 const w=initial('demo');delete w.scenarioVersion;w.production.stage='Discovery';
 const updated=upgradeScenario(w);
 assert.equal(updated.production.stage,'Liaison');
 assert.equal(updated.scenarioVersion,3);
 assert.equal(updated.organizations.length,w.organizations.length);
});

test('set release has the requested quantities and independently tracked lots',()=>{
 const items=releaseItems(initial('demo').production);
 assert.deepEqual(items.map(p=>[p.id,p.total]),[['unbreakable-spirit',10],['clothes',5],['equipment',1],['cars',3],['misc',1]]);
});
test('each item can complete and reset without changing another item or network records',()=>{
 let w=initial('demo');
 for(const itemId of ['unbreakable-spirit','clothes','equipment','cars','misc']){
  const before=structuredClone(w),amount=releaseItems(w.production).find(p=>p.id===itemId).total;
  for(const type of ['deadline','interest','storage','collection','delivery','fuel'])w=command(w,type,{itemId});
  assert.throws(()=>command(w,'allocate',{itemId,quantity:amount+1}),/no longer/);
  w=command(w,'allocate',{itemId,quantity:amount});
  const item=releaseItems(w.production).find(p=>p.id===itemId);
  w=command(w,'receive',{itemId,id:item.allocations[0].id,quantity:amount});
  assert.equal(releaseItems(w.production).find(p=>p.id===itemId).stage,'Story');
  w=command(w,'restart',{itemId});
  const reset=releaseItems(w.production).find(p=>p.id===itemId);
  assert.equal(reset.total,amount);assert.equal(reset.interest,false);assert.equal(reset.deadline,'2026-12-10');assert.equal(reset.fuelCovered,false);assert.equal(reset.storage,false);assert.equal(reset.collection,false);assert.equal(reset.delivery,false);assert.deepEqual(reset.allocations,[]);
  assert.deepEqual(w.organizations,before.organizations);
  for(const other of releaseItems(w.production).filter(p=>p.id!==itemId)){
   const prior=releaseItems(before.production).find(p=>p.id===other.id);
   const {items:ignoreA,...a}=other;const {items:ignoreB,...b}=prior;
   assert.deepEqual(a,b);
  }
  // Replaying still works after the reset is serialized and reopened.
  w=validateWorkspace(JSON.parse(JSON.stringify(w)),'demo');
  w=command(w,'interest',{itemId});
 }
});
test('furniture transport cannot satisfy a car transport requirement',()=>{
 let w=initial('demo');w.resources=w.resources.filter(r=>r.releaseItemId!=='cars');
 assert.throws(()=>command(w,'collection',{itemId:'cars'}),/No recorded resource/);
 w=command(w,'collection');assert.equal(w.production.collection,true);
});
test('reset restores an unavailable example resource and rejects stale actions',()=>{
 let w=ready();const resource=w.resources[1];
 w=command(w,'resource',{id:resource.id,version:resource.version,record:{...resource,status:'Unavailable'}});
 const version=w.production.version;w=command(w,'restart');
 assert.throws(()=>apply(w,{type:'interest',version}),/changed/);
 w=command(w,'collection');assert.equal(w.production.collection,true);
});
