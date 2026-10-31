import {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {apply, releaseItems, totals, type Command} from '../domain';
import {freshProcess, nextAction, parseProcess, processReport, type ProcessState} from '../process/model';
import './wizard.css';
import {Bucky} from './Bucky';

const steps = [
  {phase:'Discovery', title:'What could the making of your film make possible?', body:'Begin with a conversation. Share what excites you about the ways filmmaking can give to people and places.', next:'Let’s explore'},
  {phase:'Discovery', title:'Share a possibility.', body:'A film can leave behind a useful place, a new skill, a relationship or a gift. Bring one example from your research into the conversation.', next:'Invite a response'},
  {phase:'Discovery', title:'What catches your imagination?', body:'“Is there something you already do, or something you would love to explore?” For this rehearsal, the Unbreakable Spirit team’s response is already here.', field:'discovery', next:'Carry this intention forward'},
  {phase:'Design', title:'Let’s give that intention a shape.', body:'The initial design for Unbreakable Spirit is prepared. We’ll review it a piece at a time.', next:'Review the film’s needs'},
  {phase:'Design', title:'The movie still needs to be made well.', body:'Of the $300 million scenario budget, $100 million is reserved for essential filmmaking, including salaries, permits and the craft of production.', next:'Look at what the rest can make possible'},
  {phase:'Design', title:'Spend for the story and the community.', body:'The other $200 million serves the script through choices that also benefit the community. Gifted professional time can free more of that budget for other uses.', next:'Consider what stays behind'},
  {phase:'Design', title:'The story needs land and tiny homes.', body:'Find a willing host community. Shape the village with its future residents and local partners so it can serve people in its county and across New Jersey.', next:'Consider the set release'},
  {phase:'Design', title:'Which things can have another life?', body:'The prepared release includes 10 couches, 5 boxes of clothes, various equipment, 3 cars and miscellaneous items. Confirm what belongs to the production and can be gifted.', next:'Consider people’s gifts'},
  {phase:'Design', title:'A person’s time can be a gift.', body:'Some participating actors and crew offer a half-day visit, talk or mentoring session. The host helps shape what would be welcome, including whether a visit stays private.', next:'Consider continuity'},
  {phase:'Design', title:'Support what continues after the film.', body:'All film profits in this scenario support maintaining and expanding the built set and community. Awareness grows through grassroots relationships and the story.', next:'Review the design'},
  {phase:'Design', title:'What should the caseworker carry forward?', body:'These prepared design notes hold the intentions you’ll work through with the partners. You can adjust them as you practice.', field:'design', next:'Begin liaison'},
  {phase:'Liaison', title:'Choose one gift to coordinate.', body:'You are the caseworker. Choose one item group for this run.', next:'Start the conversations'},
  {phase:'Liaison', title:'Bring the plan into agreement.', body:'', next:'Continue'},
  {phase:'Report', title:'What has happened so far?', body:'', next:'Reflect on the experience'},
  {phase:'Report', title:'What should we remember?', body:'Capture something the next conversation or the platform should make easier.', field:'liaison', next:'Finish this run'},
  {phase:'Report', title:'A thread to keep building on.', body:'Your intentions, design notes and simulated activity are saved together in this browser.', next:'Practice again'}
] as const;
type Run = {version:1; index:number; process:ProcessState};
const key = 'socialfx-v4:guided:1';
function fresh(): Run {return {version:1, index:0, process:freshProcess()};}
function load() {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {run:fresh(), error:''};
    const run = JSON.parse(raw) as Run;
    if (run.version !== 1 || !Number.isInteger(run.index) || run.index < 0 || run.index >= steps.length) throw Error('Saved practice could not be opened.');
    run.process = parseProcess(JSON.stringify(run.process));
    return {run, error:''};
  } catch {return {run:fresh(), error:'Saved practice could not be opened. Download it before starting again.'};}
}
const calls: Record<string,{title:string;body:string;button:string}> = {
  deadline:{title:'The collection date has changed.',body:'The producer calls. Everything must leave the set on December 7, three days earlier than planned.',button:'Record the earlier collection date'},
  interest:{title:'Could these support your programs?',body:'The community organization is interested. In the room, discuss whether the items suit its needs before confirming that interest.',button:'Record recipient interest'},
  storage:{title:'Where can they stay until delivery?',body:'The example storage partner has capacity through December 10. Agree access, handling and the storage window in the role-play.',button:'Confirm storage in the exercise'},
  collection:{title:'Who can collect from the set?',body:'Agree the vehicle, driver, loading support and collection time. Cars have their own vehicle transporter in this exercise.',button:'Confirm collection in the exercise'},
  delivery:{title:'Who will make the final trip?',body:'The driver and recipient agree delivery on December 10. Make sure someone can receive the items.',button:'Confirm onward delivery'},
  fuel:{title:'Who supports the practical cost?',body:'An example sponsor agrees to cover transport and handling. The recipient pays $0.',button:'Record the cost support'},
  allocate:{title:'How much should we allocate?',body:'The interest and logistics are agreed in this exercise. Choose a quantity to allocate.',button:'Confirm this allocation'},
  receive:{title:'Have the gifts arrived?',body:'The recipient acknowledges the outstanding delivery in the role-play. Record that receipt.',button:'Acknowledge receipt'},
  complete:{title:'This group has arrived.',body:'The simulated receipt is complete. Let’s look back at the intention and what happened.',button:'Review the outcome'}
};
function Wizard() {
  const [loaded] = useState(load);
  const [run,setRun] = useState(loaded.run);
  const [error,setError] = useState(loaded.error);
  const [blocked,setBlocked] = useState(Boolean(loaded.error));
  const [quantity,setQuantity] = useState(1);
  const title = useRef<HTMLHeadingElement>(null);
  const step = steps[run.index];
  const selected = releaseItems(run.process.workspace.production).find(item=>item.id===run.process.selectedItem)!;
  const action = nextAction(selected);
  const current = run.index===12?calls[action]:null;
  const counts = totals(selected);
  const field = 'field' in step?step.field:null;
  useEffect(()=>{if(blocked)return;try{localStorage.setItem(key,JSON.stringify(run));}catch{setError('Your browser could not save this update. Download your practice to keep it.');}},[run,blocked]);
  useEffect(()=>{window.scrollTo(0,0);title.current?.focus({preventScroll:true});},[run.index,action]);
  function next() {
    setRun(current=>({...current,index:Math.min(current.index+1,steps.length-1)}));
  }
  function act() {
    if(blocked)return;
    if(action==='complete'){next();return;}
    try {
      const receipt = selected.allocations.find(allocation=>allocation.received<allocation.quantity);
      const extra:Partial<Command> = action==='allocate'?{quantity}:action==='receive'?{id:receipt!.id,quantity:receipt!.quantity-receipt!.received}:{};
      const workspace = apply(run.process.workspace,{type:action,itemId:selected.id,version:selected.version,...extra});
      setRun({...run,process:{...run.process,workspace}});setQuantity(1);setError('');
      if(action==='receive')setRun(current=>({...current,index:13}));
    }catch(problem){setError((problem as Error).message);}
  }
  function download() {
    const content = blocked?localStorage.getItem(key)||JSON.stringify(run):JSON.stringify({report:processReport(run.process),practice:run},null,2);
    const url=URL.createObjectURL(new Blob([content],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download='social-fx-v4-practice.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function reset() {setRun(fresh());setQuantity(1);setError('');setBlocked(false);}
  const context = JSON.stringify({phase:step.phase,step:run.index+1,title:current?.title||step.title,prompt:current?.body||step.body,selectedItem:selected.label,discovery:run.process.discovery,design:run.process.design});
  return <div className={'wizard phase-'+step.phase.toLowerCase()}><main>
    <p className="step-label">{step.phase} · {run.index+1}</p>
    <h1 ref={title} tabIndex={-1}>{current?.title||step.title}</h1>
    <p className="prompt">{current?.body||step.body}</p>
    {field&&<textarea className="response" aria-label={step.title} maxLength={6000} value={run.process[field]} onChange={event=>setRun({...run,process:{...run.process,[field]:event.target.value}})}/>}
    {run.index===11&&<div className="gift-choices" role="group" aria-label="Choose a gift">{releaseItems(run.process.workspace.production).map(item=><button aria-pressed={item.id===selected.id} key={item.id} onClick={()=>setRun({...run,process:{...run.process,selectedItem:item.id}})}>{item.total} {item.total===1?item.unit?.replace(/lots$/,'lot'):item.unit}</button>)}</div>}
    {run.index===12&&action==='allocate'&&<label className="quantity">Quantity<input aria-label="Quantity to allocate" type="number" min={1} max={counts.remaining} value={quantity} onChange={event=>setQuantity(Number(event.target.value))}/></label>}
    {run.index===13&&<p className="outcome"><b>{counts.received} of {selected.total}</b><span>{selected.unit} received in the exercise</span><small>{selected.total-counts.received} still to receive · recipient pays $0</small></p>}
    {error&&<p role="alert" className="error">{error} <button onClick={download}>Download saved practice</button></p>}
    {blocked?<button className="next" onClick={reset}>Start fresh practice</button>:<button className="next" onClick={run.index===15?reset:run.index===12?act:next}>{current?.button||step.next} →</button>}
    <div className="small-actions">{run.index>0&&<button onClick={()=>setRun({...run,index:run.index-1})}>← Back</button>}{run.index===15&&<button onClick={download}>Download the record ↓</button>}</div>
  </main><Bucky context={context}/></div>;
}
createRoot(document.getElementById('root')!).render(<Wizard/>);
