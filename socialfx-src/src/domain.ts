import {scenarioIdeas} from './scenario-data.ts';
export type Mode='demo'|'network';
export const lenses=['People','Place','Materials','Money and Ownership','Skills and Capacity','Story and Attention','Legacy'] as const;
export type Lens=typeof lenses[number];
export interface Base {id:string;version:number;updated:string}
export interface Organization extends Base {name:string;roles:string;place:string;needs:string;gifts:string;notes:string;source:string}
export interface Contact extends Base {organizationId:string;name:string;role:string;channel:string}
export interface Membership extends Base {organizationId:string;status:'Invited'|'Participating'|'Paused';plan:string;fee:number}
export interface Resource extends Base {organizationId:string;name:string;category:'Storage'|'Transport'|'Skills'|'Space'|'Equipment';capacity:number;unit:string;from:string;until:string;status:'Tentative'|'Available'|'Unavailable';conditions:string}
export interface Idea extends Base {lens:Lens;title:string;description:string;status:'Exploring'|'Needs discussion'|'Ready to rehearse'}
export interface Allocation {id:string;organizationId:string;quantity:number;received:number;version:number}
export interface Event {id:string;time:string;type:string;detail:string;recordId:string}
export interface Message {id:string;time:string;to:string;text:string}
export interface Production extends Base {stage:'Discovery'|'Design'|'Liaison'|'Story';deadline:string;early:boolean;interest:boolean;storage:boolean;collection:boolean;delivery:boolean;total:number;allocations:Allocation[];fuelCovered:boolean}
export interface Workspace {schema:1;scenarioVersion?:2;mode:Mode;revision:number;organizations:Organization[];contacts:Contact[];memberships:Membership[];resources:Resource[];ideas:Idea[];production:Production|null;events:Event[];messages:Message[]}
export type Command={type:string;id?:string;version?:number;record?:any;quantity?:number;value?:any;note?:string};
const base=(id:string):Base=>({id,version:1,updated:'2026-10-30T12:00:00Z'});
export function initial(mode:Mode):Workspace{
 const w:Workspace={schema:1,mode,revision:0,organizations:[],contacts:[],memberships:[],resources:[],ideas:[],production:null,events:[],messages:[]};
 if(mode==='network')return w;
 w.organizations=[
 ['film','Example Film Company','Production','Monmouth County','A useful, feasible community plan','Furniture, production skills, access and attention'],
 ['college','Example Community College','Education · Recipient','Monmouth County','Student experience and opportunities','Students, teaching expertise, local introductions'],
 ['warehouse','Example Community Warehouse','Nonprofit · Storage · Transport','Central New Jersey','Advance notice, item details and clear schedules','Temporary storage and a van, subject to approval'],
 ['community','Example Community Organization','Nonprofit · Recipient','Monmouth County','Three suitable couches for a community room','Receiving team and community relationships'],
 ['farm','Example Equine Therapy Farm','Nonprofit · Location','New Jersey','Explore a useful lasting structure','Location knowledge and equine expertise']
 ].map(([id,name,roles,place,needs,gifts])=>({...base(id),name,roles,place,needs,gifts,notes:'Fictional rehearsal organization. No real partnership is implied.',source:'Synthetic workshop scenario'}));
 w.contacts=[{...base('contact'),organizationId:'warehouse',name:'Example operations coordinator',role:'Operations',channel:'Conversation · fictional contact'}];
 w.memberships=w.organizations.map(o=>({...base('membership-'+o.id),organizationId:o.id,status:'Invited',plan:'Founding pilot · gift basis',fee:0}));
 w.resources=[{...base('storage'),organizationId:'warehouse',name:'Short-term furniture storage',category:'Storage',capacity:3,unit:'couches',from:'2026-12-07',until:'2026-12-10',status:'Tentative',conditions:'Exercise dates. Space, dimensions, access and unloading need confirmation.'},{...base('van'),organizationId:'warehouse',name:'Community van and driver',category:'Transport',capacity:3,unit:'couches per trip',from:'2026-12-07',until:'2026-12-10',status:'Tentative',conditions:'Exercise dates. Vehicle suitability, driver, loading and both trips need confirmation.'}];
 w.scenarioVersion=2;
 w.ideas=scenarioIdeas.map(([lens,title,description],i)=>({...base('idea-'+i),lens:lens as Lens,title,description,status:'Ready to rehearse'}));
 w.production={...base('unbreakable-spirit'),stage:'Liaison',deadline:'2026-12-10',early:false,interest:false,storage:false,collection:false,delivery:false,total:3,allocations:[],fuelCovered:false};
 return w;
}
export function totals(p:Production){const reserved=p.allocations.reduce((n,a)=>n+a.quantity,0),received=p.allocations.reduce((n,a)=>n+a.received,0);return {reserved,received,remaining:p.total-reserved};}
function requireText(value:unknown,label:string,max=6000){if(typeof value!=='string'||!value.trim()||value.length>max)throw Error(label+' is required and must fit the field.');return value.trim();}
function text(value:unknown,max=6000){if(typeof value!=='string'||value.length>max)throw Error('Use text within the field limit.');return value.trim();}
function whole(n:unknown){if(typeof n!=='number'||!Number.isSafeInteger(n)||n<1||n>1000000)throw Error('Use a whole quantity greater than zero.');return n;}
function date(s:unknown){const d=requireText(s,'Date',10);if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||new Date(d+'T12:00:00Z').toISOString().slice(0,10)!==d)throw Error('Use a valid date.');return d;}
function option<T extends string>(value:unknown,options:readonly T[]):T{if(!options.includes(value as T))throw Error('Choose one of the available options.');return value as T;}
function current<T extends Base>(rows:T[],id:string|undefined,version:number|undefined){const r=rows.find(r=>r.id===id);if(!r)throw Error('Record not found in this workspace.');if(r.version!==version)throw Error('This record changed while you were reviewing it. Reopen the current version.');return r;}
export function apply(input:Workspace,cmd:Command,time=new Date().toISOString(),uid=crypto.randomUUID()):Workspace{
 const w=structuredClone(input);let event={id:uid,time,type:'',detail:'',recordId:cmd.id||uid};
 const stamp=(r:Base)=>{r.version++;r.updated=time;};
 if(cmd.type==='organization'){
  const r=cmd.record;const fields={name:requireText(r.name,'Organization name',200),roles:requireText(r.roles,'Roles',200),place:text(r.place,200),needs:text(r.needs),gifts:text(r.gifts),notes:text(r.notes),source:requireText(r.source,'Source',200)};
  if(cmd.id){const row=current(w.organizations,cmd.id,cmd.version);Object.assign(row,fields);stamp(row);event.type='Conversation updated';}
  else {w.organizations.push({id:uid,version:1,updated:time,...fields});w.memberships.push({id:uid+'-membership',version:1,updated:time,organizationId:uid,status:'Invited',plan:'Founding pilot · gift basis',fee:0});event.type='Conversation recorded';}
  const orgId=cmd.id||uid;
  if(r.contactName?.trim()){const existing=w.contacts.find(c=>c.organizationId===orgId);const contact={name:requireText(r.contactName,'Contact name',200),role:text(r.contactRole||'',200),channel:text(r.channel||'',200)};if(existing){Object.assign(existing,contact);stamp(existing);}else w.contacts.push({id:uid+'-contact',version:1,updated:time,organizationId:orgId,...contact});}
  event.detail=fields.name;
 }else if(cmd.type==='resource'){
  const r=cmd.record;if(!w.organizations.some(o=>o.id===r.organizationId))throw Error('Choose an organization in this workspace.');
  const fields={organizationId:r.organizationId,name:requireText(r.name,'Resource name',200),category:option(r.category,['Storage','Transport','Skills','Space','Equipment']),capacity:whole(r.capacity),unit:requireText(r.unit,'Capacity unit',100),from:date(r.from),until:date(r.until),status:option(r.status,['Tentative','Available','Unavailable']),conditions:text(r.conditions)};
  if(fields.until<fields.from)throw Error('Availability must end on or after its start date.');
  if(cmd.id){const row=current(w.resources,cmd.id,cmd.version);Object.assign(row,fields);stamp(row);}else w.resources.push({id:uid,version:1,updated:time,...fields});
  // Resource changes invalidate rehearsal commitments before allocation.
  if(w.production&&w.production.allocations.length===0){w.production.storage=false;w.production.collection=false;w.production.delivery=false;stamp(w.production);}
  event.type='Availability recorded';event.detail=fields.name+' · '+fields.status+' · '+fields.from+' through '+fields.until;
 }else if(cmd.type==='membership'){
  const r=current(w.memberships,cmd.id,cmd.version);r.status=option(cmd.value,['Invited','Participating','Paused']);stamp(r);event.type='Pilot participation updated';event.detail=w.organizations.find(o=>o.id===r.organizationId)!.name+' · '+r.status;
 }else if(cmd.type==='idea'){
  if(w.mode!=='demo')throw Error('The production Canvas belongs to the rehearsal.');const r=cmd.record;const fields={lens:option(r.lens,lenses),title:requireText(r.title,'Idea title',200),description:text(r.description),status:option(r.status,['Exploring','Needs discussion','Ready to rehearse'])};
  if(cmd.id){const row=current(w.ideas,cmd.id,cmd.version);Object.assign(row,fields);stamp(row);}else w.ideas.push({id:uid,version:1,updated:time,...fields});event.type='Design idea shaped';event.detail=fields.title;
 }else{
  const p=w.production;if(!p||w.mode!=='demo')throw Error('Open the simulation to use this rehearsal action.');if(p.version!==cmd.version)throw Error('The rehearsal changed. Review the latest plan before continuing.');event.recordId=p.id;const t=totals(p);
  if(cmd.type==='stage'){p.stage=option(cmd.value,['Discovery','Design','Liaison','Story']);event.type='Stage selected';event.detail=p.stage;}
  else if(cmd.type==='deadline'){
   if(p.early)throw Error('The earlier collection deadline is already applied.');if(t.reserved)throw Error('Keep the confirmed record. Reset the rehearsal to try another timeline.');p.deadline='2026-12-07';p.early=true;p.storage=false;p.collection=false;p.delivery=false;p.stage='Liaison';event.type='Collection deadline changed';event.detail='December 10 → December 7. Logistics need reconfirmation.';w.messages.push({id:uid,time,to:'Caseworker',text:'Producer update received. Check storage December 7–10, collection December 7 and onward delivery December 10. Availability is a lead, not a booking.'});
  }else if(cmd.type==='interest'){p.interest=true;event.type='Recipient interest recorded';event.detail='Example Community Organization could use up to three couches. Interest is not allocation.';w.messages.push({id:uid,time,to:'Caseworker',text:event.detail});}
  else if(cmd.type==='question'){event.type='Participant question recorded';event.detail=requireText(cmd.note,'Question',1500);w.messages.push({id:uid,time,to:'Caseworker',text:'Recipient question: '+event.detail});}
  else if(['storage','collection','delivery'].includes(cmd.type)){
   if(t.reserved)throw Error('This plan is committed. Start a new rehearsal to explore another arrangement.');
   const key=cmd.type as 'storage'|'collection'|'delivery';if(p[key])throw Error('That confirmation is already recorded.');
   const candidate=w.resources.find(r=>r.category===(key==='storage'?'Storage':'Transport')&&r.status!=='Unavailable'&&r.from<=p.deadline&&r.until>='2026-12-10'&&r.capacity>=p.total);
   if(!candidate)throw Error('No recorded resource covers this exercise window and capacity. Update availability first.');
   p[key]=true;event.type='Simulated '+key+' confirmation';event.detail=candidate.name+' · role-play agreement only';w.messages.push({id:uid,time,to:key==='storage'?'Warehouse partner':'Transport partner',text:event.type+' recorded. Driver, access and handling details assumed checked in the role-play.'});
  }else if(cmd.type==='fuel'){p.fuelCovered=true;event.type='Fuel support confirmed in simulation';event.detail='$60 exercise cost covered by an example sponsor; recipient charge $0.';}
  else if(cmd.type==='allocate'){
   const q=whole(cmd.quantity);if(!p.interest)throw Error('Record recipient interest first.');if(!p.storage||!p.collection||!p.delivery)throw Error('Confirm storage, collection and onward delivery first.');if(!p.fuelCovered)throw Error('Resolve the simulated fuel cost before committing.');if(q>t.remaining)throw Error('That quantity is no longer available.');
   p.allocations.push({id:uid,organizationId:'community',quantity:q,received:0,version:1});event.type='Allocation confirmed in simulation';event.detail=q+' couches → Example Community Organization. Owner release authority assumed for exercise.';
  }else if(cmd.type==='receive'){
   const a=p.allocations.find(a=>a.id===cmd.id);if(!a)throw Error('Choose a confirmed allocation.');const q=whole(cmd.quantity);if(q>a.quantity-a.received)throw Error('Receipt exceeds the outstanding confirmed quantity.');a.received+=q;a.version++;event.type='Simulated receipt acknowledged';event.detail=q+' couches received against allocation '+a.id;if(totals(p).received===p.total)p.stage='Story';
  }else if(cmd.type==='escalate'){event.type='Simulated follow-up';event.detail='Fictional clock advanced: no reply within the agreed window. Caseworker review requested; no real notification sent.';w.messages.push({id:uid,time,to:'Caseworker',text:event.detail});}
  else throw Error('Unknown action.');stamp(p);
 }
 w.events.push(event);w.revision++;return w;
}
export function validateWorkspace(value:unknown,mode:Mode):Workspace{
 const w=value as Workspace;if(!w||w.schema!==1||w.mode!==mode||!Number.isSafeInteger(w.revision)||w.revision<0)throw Error('Saved workspace uses an unsupported format.');
 for(const key of ['organizations','contacts','memberships','resources','ideas','events','messages'] as const){if(!Array.isArray(w[key]))throw Error('Saved workspace is incomplete.');}
 if(w.production){const p=w.production;if(!Array.isArray(p.allocations)||!Number.isSafeInteger(p.total)||p.total<1||totals(p).remaining<0||p.allocations.some(a=>a.quantity<1||a.received<0||a.received>a.quantity))throw Error('Saved rehearsal quantities are invalid.');}
 return w;
}

// Upgrade only untouched seed notes. Preserve user edits, records and exercise history.
export function upgradeScenario(input:Workspace):Workspace{
 if(input.mode!=='demo'||input.scenarioVersion===2)return input;
 const w=structuredClone(input),fresh=initial('demo');
 for(const idea of w.ideas){const replacement=fresh.ideas.find(x=>x.id===idea.id);if(replacement&&idea.version===1)Object.assign(idea,replacement);}
 if(w.production?.stage==='Discovery'&&w.production.version===1)w.production.stage='Liaison';
 w.scenarioVersion=2;
 return w;
}
