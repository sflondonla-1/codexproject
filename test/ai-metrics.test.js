import {test} from 'node:test';
import assert from 'node:assert/strict';
import {aiSamples,summarizeAI} from '../src/ai-metrics.js';
test('calculates adoption, quality, review effort, and unit cost from counts',()=>{
 const summary=summarizeAI(aiSamples.current);
 assert.equal(summary.acceptance,70);assert.equal(summary.retention,85);assert.equal(summary.firstPass,85);assert.equal(summary.reviewAverage,18);assert.equal(summary.rework,13);assert.ok(Math.abs(summary.costPerTask-0.6)<1e-10);
});
test('period fixtures reconcile workflow totals and calculate separately',()=>{
 for(const sample of Object.values(aiSamples)){assert.equal(sample.tools.reduce((n,t)=>n+t.tasks,0),sample.tasks);assert.ok(Math.abs(sample.tools.reduce((n,t)=>n+t.cost,0)-sample.cost)<0.001);}
 assert.equal(summarizeAI(aiSamples.last).acceptance,63);
 assert.equal(summarizeAI(aiSamples.last).reviewAverage,22);
});
test('zero activity never produces invalid rates or costs',()=>{
 const result=summarizeAI({suggestions:0,accepted:0,retained:0,reviewed:0,firstPass:0,reviewMinutes:0,tasks:0,reworked:0,cost:0});
 assert.ok(Object.values(result).every(v=>v===0));
});
