import {initial, releaseItems, totals, validateWorkspace, type Production, type Workspace} from '../domain.ts';

export const processKey = 'socialfx-v3:process:1';
export const phases = ['Discovery', 'Design', 'Liaison', 'Report'] as const;
export interface ProcessState {
  version: 1;
  phase: number;
  reviewed: boolean[];
  selectedItem: string;
  discovery: string;
  design: string;
  liaison: string;
  workspace: Workspace;
}
export function freshProcess(): ProcessState {
  return {
    version: 1,
    phase: 0,
    reviewed: [false, false],
    selectedItem: 'unbreakable-spirit',
    discovery: 'We want the making of Unbreakable Spirit to help bring mental-health reformation into public life. Land and tiny homes belong in the story. We are inspired to build a lasting community, share suitable surplus, and invite the cast and crew to contribute their gifts.',
    design: 'Route surplus through nonprofits in the filming towns, then across New Jersey. Confirm which costumes and props belong to the production and can be gifted. Arrange voluntary half-day visits or mentoring with participating cast and crew, with the hosts shaping what is welcome.',
    liaison: '',
    workspace: initial('demo')
  };
}
export function parseProcess(raw: string): ProcessState {
  const state = JSON.parse(raw) as ProcessState;
  if (state.version !== 1 || !Number.isInteger(state.phase) || state.phase < 0 || state.phase > 3 ||
      !Array.isArray(state.reviewed) || state.reviewed.length !== 2 || state.reviewed.some(value => typeof value !== 'boolean') ||
      !['discovery', 'design', 'liaison'].every(field => typeof state[field as 'discovery'] === 'string')) {
    throw Error('This saved rehearsal needs to be exported before starting a new one.');
  }
  validateWorkspace(state.workspace, 'demo');
  if (!releaseItems(state.workspace.production).some(item => item.id === state.selectedItem)) throw Error('Saved item group is missing.');
  return state;
}
export function nextAction(item: Production) {
  if (!item.early) return 'deadline';
  if (!item.interest) return 'interest';
  if (!item.storage) return 'storage';
  if (!item.collection) return 'collection';
  if (!item.delivery) return 'delivery';
  if (!item.fuelCovered) return 'fuel';
  const receipt = item.allocations.find(allocation => allocation.received < allocation.quantity);
  if (receipt) return 'receive';
  if (totals(item).remaining) return 'allocate';
  return 'complete';
}
export function processReport(state: ProcessState) {
  const rows = releaseItems(state.workspace.production).map(item => ({
    item: item.label,
    unit: item.unit,
    offered: item.total,
    allocated: totals(item).reserved,
    received: totals(item).received,
    pending: item.total - totals(item).received
  }));
  return {scenario: 'Unbreakable Spirit · $300M pre-production rehearsal',
    budget: {essentialFilmmaking: 100000000, storyAndCommunity: 200000000},
    discovery: state.discovery, design: state.design, liaison: state.liaison,
    reviewed: state.reviewed, rows, events: state.workspace.events,
    context: 'Scripted exercise. All quantities and confirmations are simulated. All film profits support the built community. Recipient charge $0.'};
}
