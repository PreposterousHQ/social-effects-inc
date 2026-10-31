import {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {apply, releaseItems, totals, type Command} from '../domain';
import {ScenarioBrief} from '../Scenario';
import {freshProcess, nextAction, parseProcess, phases, processKey, processReport, type ProcessState} from './model';
import '../room/room.css';
import './process.css';

const phaseCopy = [
  ['Open the possibility.', 'Research, inspiration and an invitation to imagine together.'],
  ['Give the ideas a shape.', 'Agree what the production wants to offer, why, and what needs arranging.'],
  ['Bring the people together.', 'Work as the caseworker. Turn the design into practical agreements.'],
  ['Tell what happened.', 'Bring the original intention, the coordination and the outcomes into one record.']
];
const calls: Record<string, {role: string; quote: string; task: string; button: string}> = {
  deadline: {role: 'Producer', quote: 'Our collection date has moved from December 10 to December 7. Can the network help us adapt?', task: 'Receive the change and reopen the logistics plan.', button: 'Simulate the earlier collection date'},
  interest: {role: 'Community organization', quote: 'These could support our programs. Let’s check suitability and how many we can use.', task: 'Record interest before promising goods.', button: 'Record simulated recipient interest'},
  storage: {role: 'Storage partner', quote: 'We can hold this group through December 10. Let’s agree access, capacity and handling.', task: 'Check the matching storage resource for this item group.', button: 'Confirm simulated storage'},
  collection: {role: 'Transport partner', quote: 'We can collect on December 7 with the right vehicle, driver and loading support.', task: 'Check suitable transport for this item group and agree pickup.', button: 'Confirm simulated collection'},
  delivery: {role: 'Recipient and driver', quote: 'We can arrange the final trip for December 10. Who will receive the goods?', task: 'Agree onward delivery and the receiving team.', button: 'Confirm simulated onward delivery'},
  fuel: {role: 'Supporting sponsor', quote: 'We can cover the agreed transport and handling cost. The recipient receives the gift without a charge.', task: 'Resolve the practical cost with the sponsor in the role-play.', button: 'Record simulated cost support'},
  allocate: {role: 'Caseworker', quote: 'The recipient and logistics are ready. How much of this group shall we allocate?', task: 'Choose a quantity, including a partial allocation.', button: 'Confirm simulated allocation'},
  receive: {role: 'Recipient', quote: 'The agreed delivery has arrived. Let’s acknowledge what we received.', task: 'Record receipt against the outstanding allocation.', button: 'Acknowledge simulated receipt'}
};
function load() {
  try {
    const raw = localStorage.getItem(processKey);
    return {state: raw ? parseProcess(raw) : freshProcess(), error: ''};
  } catch (error) {
    return {state: freshProcess(), error: (error as Error).message};
  }
}
function Process() {
  const [loaded] = useState(load);
  const [state, setState] = useState<ProcessState>(loaded.state);
  const [error, setError] = useState(loaded.error);
  const [blocked, setBlocked] = useState(Boolean(loaded.error));
  const [quantity, setQuantity] = useState(1);
  const [brief, setBrief] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const items = releaseItems(state.workspace.production);
  const selected = items.find(item => item.id === state.selectedItem)!;
  const counts = totals(selected);
  const action = nextAction(selected);
  const call = calls[action];
  const receipt = selected.allocations.find(allocation => allocation.received < allocation.quantity);
  const report = processReport(state);
  useEffect(() => {
    if (blocked) return;
    try { localStorage.setItem(processKey, JSON.stringify(state)); }
    catch { setError('Your browser could not save this update. Export the rehearsal to keep it.'); }
  }, [state, blocked]);
  useEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus({preventScroll: true});
  }, [state.phase, brief]);
  function go(phase: number) {
    setBrief(false);
    setState(current => ({...current, phase}));
  }
  function review(phase: number) {
    setState(current => ({...current, reviewed: current.reviewed.map((value, index) => index === phase ? true : value), phase: phase + 1}));
  }
  function act(type: string, extra: Partial<Command> = {}) {
    if (blocked) return;
    try {
      const workspace = apply(state.workspace, {type, itemId: selected.id, version: selected.version, ...extra});
      setState({...state, workspace});
      setError('');
      setQuantity(1);
    } catch (problem) { setError((problem as Error).message); }
  }
  function exportFile(raw = false) {
    const content = raw ? localStorage.getItem(processKey) || JSON.stringify(state) : JSON.stringify({report, rehearsal: state}, null, 2);
    const url = URL.createObjectURL(new Blob([content], {type: 'application/json'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'social-fx-v3-rehearsal.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <div className={'room process phase-' + state.phase}>
    <header><a className="brand" href="./">Social FX <b>V3</b></a><nav aria-label="Process tools"><button onClick={() => setBrief(!brief)}>{brief ? 'Return to process' : 'Film brief'}</button><a href="../v2/">Compare V2 ↗</a></nav></header>
    <main>
      <div className="ribbon"><span><i/> THE FILMANTHROPY PROCESS</span><span>UNBREAKABLE SPIRIT · PREPARED SIMULATION</span></div>
      <nav className="phase-nav" aria-label="Four phases">{phases.map((phase, index) => <button key={phase} aria-current={!brief && state.phase === index ? 'step' : undefined} onClick={() => go(index)}><span>0{index + 1}</span><strong>{phase}</strong><small>{index < 2 ? state.reviewed[index] ? 'Reviewed together' : 'Prepared for review' : index === 2 ? 'Caseworker rehearsal' : 'Intention to outcome'}</small></button>)}</nav>
      {error && <div className="problem" role="alert">{error} <button onClick={() => exportFile(blocked)}>Export saved rehearsal</button></div>}
      {brief ? <article className="brief"><h1 ref={heading} tabIndex={-1}>The shared film brief.</h1><ScenarioBrief/><button className="action" onClick={() => setBrief(false)}>Return to the process →</button></article> : <>
      <section className="phase-heading"><p className="kicker">0{state.phase + 1} / {phases[state.phase].toUpperCase()}</p><h1 ref={heading} tabIndex={-1}>{phaseCopy[state.phase][0]}</h1><p className="lead">{phaseCopy[state.phase][1]}</p></section>
      {state.phase === 0 && <>
        <div className="process-columns"><section className="process-panel discovery-intro"><p className="kicker">BRET’S OPENING CONVERSATION</p><h2>What could the making make possible?</h2><p>Share the history of giving in film and what inspires you about it. Show how a production can leave behind more than a story, from useful materials and gifted time to a whole place that continues serving people.</p><blockquote>“Here’s what I’ve been finding. What catches your imagination? Is there anything you already do, or something you’d love to explore together?”</blockquote><p>Invite a first response. An instinct, a small idea or a possibility can be enough to begin.</p><details><summary>Research and examples to bring into the room</summary><p>Use the Ledger’s history and field examples, then share the larger Unbreakable Spirit vision. Ask what resonates with this production and the communities it touches.</p><div className="source-links"><a href="/ledger/" target="_blank" rel="noreferrer">The Filmanthropy Ledger ↗</a><a href="/moonshot.html" target="_blank" rel="noreferrer">The larger Moonshot vision ↗</a></div><p className="caption">The Moonshot essay explores a different funding scale. This exercise uses the $300 million film brief.</p></details></section>
        <section className="process-panel"><p className="kicker">PREPARED CLIENT RESPONSE</p><h2>The story already carries a purpose.</h2><p>For Unbreakable Spirit, this conversation has happened. The team wants to help catalyze mental-health reformation and build a lasting community through making the film.</p><label htmlFor="discovery-note">What emerged from discovery</label><textarea id="discovery-note" value={state.discovery} maxLength={6000} onChange={event => setState({...state, discovery: event.target.value})}/><p className="caption">Review this together, or adjust the response as you practice the conversation.</p></section></div>
        <div className="handoff"><p><strong>Carry into design</strong><br/>The intention, the first ideas, the people they could serve and what the production wants to explore.</p><button className="action" onClick={() => review(0)}>Review discovery & enter design →</button></div>
      </>}
      {state.phase === 1 && <>
        <p className="phase-context">The initial design is prepared. Review the intended gifts, add specifics and identify the agreements the caseworker will need.</p>
        <div className="design-grid">
          <section className="process-panel"><p className="kicker">PLACES THAT CONTINUE</p><h2>Land, homes and whole sets.</h2><p>The script requires land and tiny homes. Find a willing host community and design the village to serve its county and people across New Jersey seeking a route out of psychiatric institutions. Sets, a barn and community spaces can keep serving their hosts.</p><p className="caption">Liaison work includes the host’s needs, local support, land, ownership, approvals and continuing operations.</p></section>
          <section className="process-panel"><p className="kicker">MATERIAL GIFTS</p><h2>The set release.</h2><ul className="inventory">{items.map(item => <li key={item.id}><b>{item.total}</b><span>{item.total === 1 ? item.unit?.replace(/lots$/, 'lot') : item.unit}</span></li>)}</ul><p className="caption">Confirm ownership and release authority. Clothes and props intended for a hire or prop house need their agreed return route.</p></section>
          <section className="process-panel"><p className="kicker">TIME, SKILLS AND CARE</p><h2>A half-day can matter.</h2><p>Participating actors and skilled crew offer voluntary half-day visits, mentoring or talks with local organizations. Plan around the host’s wishes, the participants and the filming schedule. Some visits can be private.</p><p className="caption">Liaison work includes a suitable host, a clear invitation, scheduling and how the people involved want the visit handled.</p></section>
          <section className="process-panel"><p className="kicker">MONEY AND CONTINUITY</p><h2>Make the film well. Sustain what stays.</h2><p><strong>$100M</strong> covers essential filmmaking. <strong>$200M</strong> serves the script through choices that also benefit communities. All film profits support maintaining and expanding the built set and community.</p><details><summary>Practice a different financial idea</summary><p>A client might suggest “10% of box office for a cause.” Capture the idea, then agree the meaning of that share, who receives it and how it is funded. Add it to your design notes as a proposal to discuss.</p></details><p className="caption">Gifted director or DP time can free budget. Grassroots outreach carries awareness in this scenario.</p></section>
        </div>
        <section className="process-panel notes"><label htmlFor="design-note">The design to carry into liaison</label><textarea id="design-note" value={state.design} maxLength={6000} onChange={event => setState({...state, design: event.target.value})}/></section>
        <div className="handoff"><p><strong>Carry into liaison</strong><br/>Specific intended gifts, recipients to approach, timing, responsibilities and open questions.</p><button className="action" onClick={() => review(1)}>Review design & enter liaison →</button></div>
      </>}
      {state.phase === 2 && <>
        <p className="phase-context">You are the caseworker for the interactive set release. Work through one item group at a time, playing the conversations with the people in the room.</p>
        <div className="item-tabs" role="group" aria-label="Set release groups">{items.map(item => <button key={item.id} aria-pressed={selected.id === item.id} onClick={() => {setState({...state, selectedItem: item.id}); setQuantity(1);}}>{item.total} {item.label}<small>{totals(item).received} received in exercise</small></button>)}</div>
        <div className="process-columns liaison-columns"><section className="process-panel current-call">
          <div className="call-heading"><p className="kicker">{selected.label?.toUpperCase()} / NEXT CONVERSATION</p><button className="plain" disabled={blocked} onClick={() => act('restart')}>Reset this group ↻</button></div>
          {action === 'complete' ? <><h2>This group has arrived.</h2><p>Receipt of all {selected.total} {selected.unit} is acknowledged in the exercise. Choose another group or review the report.</p><button className="action" onClick={() => go(3)}>Open the report →</button></> : <>
          <p className="role-label">{call.role}</p><blockquote>“{call.quote}”</blockquote><p>{call.task}</p>
          {action === 'allocate' && <label className="quantity">Quantity to allocate<input type="number" min={1} max={counts.remaining} value={quantity} onChange={event => setQuantity(Number(event.target.value))}/></label>}
          <button className="action" disabled={blocked} onClick={() => act(action, action === 'allocate' ? {quantity} : action === 'receive' ? {id: receipt!.id, quantity: receipt!.quantity - receipt!.received} : {})}>{call.button} →</button>
          </>}
          <p className="caption">Scripted role-play with example organizations. Confirmations and messages are recorded in this browser.</p>
        </section><aside className="process-panel plan-summary"><p className="kicker">THE CASEWORKER’S PLAN</p><h2>{selected.total} {selected.unit}</h2><p>{selected.detail}</p><ol>{[['Recipient interest', selected.interest], ['Temporary storage', selected.storage], ['Collection', selected.collection], ['Onward delivery', selected.delivery], ['Cost support', selected.fuelCovered]].map(([label, ready]) => <li key={String(label)}><span>{label}</span><b>{ready ? 'Agreed in exercise' : 'To arrange'}</b></li>)}</ol><p>{counts.reserved} allocated · {counts.received} received · recipient charge $0</p><button onClick={() => go(1)}>← Revisit the design</button></aside></div>
        <details className="process-panel notes"><summary>Caseworker notes and conversation record</summary><label htmlFor="liaison-note">What needs another conversation?</label><textarea id="liaison-note" maxLength={6000} value={state.liaison} onChange={event => setState({...state, liaison: event.target.value})}/>{state.workspace.events.slice().reverse().map(event => <p className="event" key={event.id}><strong>{event.type}</strong><br/>{event.detail}</p>)}</details>
        <div className="handoff"><p><strong>Carry into report</strong><br/>What was agreed, what arrived, what is still open and what the next conversation needs.</p><button className="action" onClick={() => go(3)}>Review the report →</button></div>
      </>}
      {state.phase === 3 && <>
        <div className="report-intro"><p>The report grows as you work through liaison. Review the intention alongside the recorded activity, then decide what the next conversation should be.</p><button onClick={() => exportFile()}>Download rehearsal report ↓</button></div>
        <section className="process-panel table-wrap"><table><caption>Simulated set-release outcomes</caption><thead><tr><th>Item group</th><th>Offered</th><th>Allocated</th><th>Received</th><th>Awaiting receipt</th></tr></thead><tbody>{report.rows.map(row => <tr key={row.item}><th scope="row">{row.item}</th><td>{row.offered}</td><td>{row.allocated}</td><td>{row.received}</td><td>{row.pending}</td></tr>)}</tbody></table></section>
        <div className="process-columns"><section className="process-panel"><p className="kicker">INTENTION TO DESIGN</p><h2>What we set out to do.</h2><h3>Discovery</h3><p className="preserve">{state.discovery}</p><h3>Design</h3><p className="preserve">{state.design}</p></section><section className="process-panel"><p className="kicker">WHAT NEEDS CONTINUING</p><h2>Keep the thread alive.</h2><p>Land, tiny homes, lasting sets, gifted visits and financial commitments remain in the wider design. Their agreements and outcomes can be added as those workstreams develop.</p><p className="preserve">{state.liaison || 'Caseworker notes will appear here as you add them in Liaison.'}</p><p className="caption">{state.workspace.events.length} recorded exercise events. Equipment and miscellaneous quantities are lots with contents to be listed.</p><button className="action" onClick={() => go(2)}>Return to liaison →</button></section></div>
      </>}
      </>}
      <div className="colophon"><span>V3 process rehearsal · {blocked ? 'export saved data to recover' : 'saved in this browser'}</span><button onClick={() => dialog.current?.showModal()}>Reset all V3 practice</button></div>
    </main>
    <dialog ref={dialog}><h2>Begin this practice again?</h2><p>This restores the prepared discovery, design and all set-release exercises. Download your current report if you want to keep it.</p><button onClick={() => exportFile(blocked)}>Download current practice</button><div className="dialog-actions"><button onClick={() => dialog.current?.close()}>Keep practicing</button><button className="action" onClick={() => {setState(freshProcess()); setBlocked(false); setError(''); setQuantity(1); setBrief(false); dialog.current?.close();}}>Reset V3 practice</button></div></dialog>
  </div>;
}
createRoot(document.getElementById('root')!).render(<Process/>);
