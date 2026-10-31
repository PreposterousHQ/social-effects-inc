import test from 'node:test';
import assert from 'node:assert/strict';
import {apply, totals, releaseItems} from '../src/domain.ts';
import {freshProcess, nextAction, parseProcess, processReport} from '../src/process/model.ts';

test('V3 review and liaison survive reload with distinct offered and received quantities', () => {
  let state = freshProcess();
  state.reviewed = [true, true];
  state.phase = 2;
  while (nextAction(state.workspace.production) !== 'allocate') {
    const item = state.workspace.production;
    state.workspace = apply(state.workspace, {type: nextAction(item), version: item.version});
  }
  const item = state.workspace.production;
  state.workspace = apply(state.workspace, {type: 'allocate', version: item.version, quantity: 4});
  assert.equal(nextAction(state.workspace.production), 'receive');
  state = parseProcess(JSON.stringify(state));
  assert.deepEqual(state.reviewed, [true, true]);
  assert.equal(processReport(state).rows[0].offered, 10);
  assert.equal(processReport(state).rows[0].allocated, 4);
  assert.equal(processReport(state).rows[0].received, 0);
  const allocation = state.workspace.production.allocations[0];
  state.workspace = apply(state.workspace, {type: 'receive', version: state.workspace.production.version, id: allocation.id, quantity: 4});
  assert.equal(nextAction(state.workspace.production), 'allocate');
  assert.equal(totals(state.workspace.production).remaining, 6);
  assert.equal(processReport(state).rows[0].received, 4);
  assert.equal(processReport(state).rows[0].pending, 6);
  assert.equal(releaseItems(state.workspace.production)[1].interest, false);
});

test('V3 rejects an invalid saved phase or missing selected group', () => {
  assert.throws(() => parseProcess(JSON.stringify({...freshProcess(), phase: 5})));
  assert.throws(() => parseProcess(JSON.stringify({...freshProcess(), selectedItem: 'missing'})));
});
