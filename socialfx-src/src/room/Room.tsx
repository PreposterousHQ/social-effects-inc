import {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {releaseSpecs} from '../domain';
import {ScenarioBrief} from '../Scenario';
import './room.css';

type Item = typeof releaseSpecs[number];
type ItemId = Item['id'];
const routes = ['direct', 'hold', 'ask'] as const;
type Route = typeof routes[number];
const responses = ['confirm', 'follow'] as const;
type Response = typeof responses[number];
type Run = {step: number; item: ItemId; route: Route; response: Response; note: string};
const first: Run = {step: 0, item: 'unbreakable-spirit', route: 'direct', response: 'confirm', note: ''};
const key = 'socialfx-v2:screening-room:1';
const chapters = ['Call sheet', 'Choose a gift', 'Find a route', 'Make the call', 'Debrief'];
const localOffers: Record<ItemId,{direct:number; hold:number; voice:string; check:string}> = {
  'unbreakable-spirit': {direct:4, hold:8, voice:'Our community rooms can use four couches on Monday. Our receiving crew needs the dimensions before the truck leaves.',check:'dimensions and a loading crew'},
  clothes: {direct:3, hold:5, voice:'We can sort three boxes on Monday. Tell us the sizes so we can match the clothing with families who asked for it.',check:'the packing list and sizes'},
  cars: {direct:1, hold:2, voice:'We can take one car for our outreach program. Our coordinator needs to see the transfer papers before pickup.',check:'vehicle transfer documents and a suitable transporter'},
  equipment: {direct:1, hold:1, voice:'Our training program could use the equipment lot. Can the crew tell us what is in it and demonstrate safe use?',check:'an itemized release and a safe-use handover'},
  misc: {direct:1, hold:1, voice:'We can meet the crew and sort the mixed lot. We need an inventory before agreeing to take it.',check:'a sorted list and confirmation of condition'}
};
function amount(item: Item, count: number) {
  const singular: Record<ItemId,string>={'unbreakable-spirit':'couch',clothes:'box of clothes',cars:'car',equipment:'equipment lot',misc:'miscellaneous lot'};
  return count+' '+(count===1?singular[item.id]:item.unit);
}
function loadRun(): Run {
  try {
    const r=JSON.parse(localStorage.getItem(key)||'null');
    if(r && Number.isInteger(r.step) && r.step>=0 && r.step<chapters.length && releaseSpecs.some(s=>s.id===r.item) && routes.includes(r.route) && responses.includes(r.response) && typeof r.note==='string') return r;
  } catch { /* An unavailable browser store still allows an in-memory rehearsal. */ }
  return {...first};
}
function Room(){
  const [run,setRun]=useState(loadRun);
  const [brief,setBrief]=useState(false);
  const [saveError,setSaveError]=useState(false);
  const reset=useRef<HTMLDialogElement>(null);
  const heading=useRef<HTMLHeadingElement>(null);
  const item=releaseSpecs.find(s=>s.id===run.item)!;
  const offer=localOffers[item.id];
  const capacity=run.route==='direct'?offer.direct:offer.hold;
  const scheduled=run.route!=='ask' && run.response==='confirm'?capacity:0;
  const remaining=item.total-scheduled;
  useEffect(()=>{
    try {localStorage.setItem(key,JSON.stringify(run));setSaveError(false);}
    catch {setSaveError(true);}
  },[run]);
  useEffect(()=>{window.scrollTo(0,0);heading.current?.focus({preventScroll:true});},[run.step,brief]);
  function advance(patch:Partial<Run>={}){setRun(current=>({...current,...patch,step:current.step+1}));}
  function replay(){reset.current?.close();setRun({...first});setBrief(false);}
  const offerText = run.route==='direct'?offer.voice:run.route==='hold'
    ? 'We can hold '+amount(item,capacity)+' from Monday until Thursday. Before we reserve that space, who will handle the second trip?'
    : 'Our capacity changes weekly. We can send a short update today if you tell us which details would help.';
  return <div className="room">
    <header><a className="brand" href="./">Social FX <b>V2</b></a><nav aria-label="Room navigation"><button onClick={()=>setBrief(!brief)}>{brief?'Return to rehearsal':'Film brief'}</button><a href="./workspace/">Full workspace ↗</a></nav></header>
    <main>
    {brief?<article className="brief"><p className="kicker">PRODUCTION DOSSIER / 01</p><h1 ref={heading} tabIndex={-1}>Unbreakable Spirit</h1><ScenarioBrief/><button className="action" onClick={()=>setBrief(false)}>Return to rehearsal →</button></article>:<>
    <div className="ribbon"><span><i/> FACILITATOR SCREEN</span><span>NEW JERSEY &nbsp; / &nbsp; FICTIONAL REHEARSAL</span></div>
    <div className="stage">
    <section className="scene" aria-labelledby="scene-title"><p className="kicker">FILMANTHROPY BY DESIGN &nbsp; / &nbsp; {chapters[run.step].toUpperCase()}</p>
    <h1 id="scene-title" ref={heading} tabIndex={-1}>{['Unbreakable Spirit','What’s leaving the set?','The set wraps early.','The partner replies.','What did we learn?'][run.step]}</h1>
    {run.step===0&&<><p className="lead">You’re in pre-production on a $300 million feature. The script calls for land, a village of tiny homes, and sets that can keep serving their hosts after filming.</p><p>Gather the producer, the local partners and the people who know how things move. Rehearse one release together. Each decision changes what the next person hears.</p><button className="action" onClick={()=>advance()}>Begin the rehearsal →</button></>}
    {run.step===1&&<><p className="lead">Producer, choose one gift from the release manifest. Ask someone in the room to speak for an organization that could use it.</p><div className="choices">{releaseSpecs.map(s=><button key={s.id} onClick={()=>advance({item:s.id})}>{amount(s,s.total)} <span>→</span></button>)}</div></>}
    {run.step===2&&<><blockquote><small>PRODUCER · MONDAY CALL</small>“We have to clear the set on December 7, three days earlier than planned. Where can {amount(item,item.total)} go?”</blockquote><p>Choose who Social FX should call first. These are example offers for the room to test.</p><div className="choices"><button onClick={()=>advance({route:'direct'})}>Call the local recipient <span>→</span></button><button onClick={()=>advance({route:'hold'})}>Ask about temporary storage <span>→</span></button><button onClick={()=>advance({route:'ask'})}>Request a capacity update from the network <span>→</span></button></div></>}
    {run.step===3&&<><blockquote><small>{run.route==='direct'?'RECIPIENT':run.route==='hold'?'STORAGE PARTNER':'NETWORK PARTNER'} · SIMULATED REPLY</small>“{offerText}”</blockquote><p>{run.route==='ask'?'Decide how the coordinator should follow up before the set clears.':run.route==='direct'?'Ask the room to confirm '+offer.check+'. In this exercise the sponsor can cover transport.':'The sponsor can cover transport. Confirm the driver for both trips and the receiving contact for Thursday.'}</p><div className="choices"><button onClick={()=>advance({response:'confirm'})}>{run.route==='ask'?'Request a voice update with capacity and dates':'Role-play agreement and schedule '+amount(item,capacity)} <span>→</span></button><button onClick={()=>advance({response:'follow'})}>{run.route==='ask'?'Ask a coordinator to call the partner':'Leave the offer open for a coordinator'} <span>→</span></button></div></>}
    {run.step===4&&<><div className="result"><b>{scheduled} / {item.total}</b><span>{run.route==='hold'?'scheduled for temporary storage':'scheduled for direct handoff'} in this rehearsal</span></div><p className="lead">{run.route==='ask'?(run.response==='confirm'?'A capacity update has been requested in the role-play.':'A coordinator will call the partner in the role-play.'):run.response==='follow'?'The partner’s offer is open for follow-up.':run.route==='hold'?'Storage is scheduled through Thursday. The team must still confirm the final recipient.':'The recipient and production have agreed on a direct handoff.'}</p><p>{remaining?amount(item,remaining)+' still need a route.':'The entire selected group has a route.'} Receipt is confirmed when the goods arrive. The recipient pays $0.</p><label htmlFor="room-note">What should Social FX remember for the next call?</label><textarea id="room-note" maxLength={2000} value={run.note} placeholder="Capture the room’s observation…" onChange={e=>setRun({...run,note:e.target.value})}/><button className="action" onClick={()=>reset.current?.showModal()}>Replay the rehearsal ↻</button></>}
    </section>
    <aside><p className="kicker">PRODUCTION / 01</p><h2>Call sheet</h2><dl><dt>Feature budget</dt><dd>$300 million</dd><dt>Essential filmmaking</dt><dd>$100 million</dd><dt>Story + community</dt><dd>$200 million</dd></dl><p className="kicker">SET RELEASE</p><ul>{releaseSpecs.map(s=><li key={s.id} className={run.step>=2&&run.item===s.id?'lit':''}>{amount(s,s.total)}</li>)}</ul><button className="plain" onClick={()=>setBrief(true)}>Read the full film brief ↗</button></aside>
    </div>
    <footer><div className="progress" aria-label={'Step '+(run.step+1)+' of 5'}>{chapters.map((name,i)=><span key={name} className={i<=run.step?'on':''} title={name}/>)}<b>{run.step+1} / 5</b></div>{run.step>0&&<button onClick={()=>setRun({...run,step:run.step-1,note:''})}>← Back</button>}{run.step>0&&<button onClick={()=>reset.current?.showModal()}>Reset rehearsal</button>}</footer>
    </>}
    <div className="colophon"><span>{saveError?'Progress is available for this visit only.':'Scripted workshop exercise · saved in this browser'}</span><a href="../">Compare with V1 ↗</a></div></main>
    <dialog ref={reset}><h2>Start a fresh rehearsal?</h2><p>This clears the room’s current choices and debrief note.</p><button onClick={()=>reset.current?.close()}>Keep this run</button> <button className="action" onClick={replay}>Start again</button></dialog>
  </div>;
}
createRoot(document.getElementById('root')!).render(<Room/>);
