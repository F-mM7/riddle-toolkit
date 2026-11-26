/** 覆面算の探索を画面とは別のスレッドで行い、解を見つけるたびに送る */
import { solveCryptarithm } from './cryptarithmSolver';
import type { WorkerRequest, WorkerResponse } from './types';

/** 画面のスレッドへ応答を1件送る */
const post = (response: WorkerResponse) => self.postMessage(response);

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  if (request.type !== 'solve') return;
  const result = solveCryptarithm(
    request.input,
    request.maxSolutions,
    (solution) => post({ type: 'solution', solution }),
    // 探索を始める前に、外した行を1回だけ送る
    (skipped) => post({ type: 'skipped', errors: skipped })
  );
  if ('errors' in result) {
    post({ type: 'error', errors: result.errors });
  } else {
    post({
      type: 'done',
      count: result.count,
      truncated: result.truncated,
      hasEquations: result.hasEquations,
    });
  }
};
