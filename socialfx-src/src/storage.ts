import { initial, apply, validateWorkspace, upgradeScenario, type Mode, type Workspace, type Command } from './domain';
export const inV2Workspace=location.pathname.startsWith('/socialF(X)/v2/');
const prefix=inV2Workspace?'socialfx-pilot-v2:':'socialfx-pilot-v1:';
export function read(mode:Mode){const raw=localStorage.getItem(prefix+mode);return raw?upgradeScenario(validateWorkspace(JSON.parse(raw),mode)):initial(mode);}
export async function commit(mode:Mode,command:Command){
 if(!navigator.locks)throw Error('This browser does not support safe editing. Use a current Chrome, Edge, Firefox or Safari browser.');
 return navigator.locks.request(prefix+mode,async()=>{const next=apply(read(mode),command);localStorage.setItem(prefix+mode,JSON.stringify(next));return next;});
}
export async function resetDemo(){if(!navigator.locks)throw Error('A browser with Web Locks is required.');return navigator.locks.request(prefix+'demo',async()=>{const fresh=initial('demo');localStorage.setItem(prefix+'demo',JSON.stringify(fresh));return fresh;});}
export function rawBackup(mode:Mode){try{return JSON.stringify(read(mode));}catch{return localStorage.getItem(prefix+mode)||JSON.stringify(initial(mode));}}
