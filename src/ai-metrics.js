// Illustrative fixtures only; no AI provider or repository telemetry is connected.
export const aiSamples = {
  current: { suggestions: 240, accepted: 168, retained: 142, reviewed: 20, firstPass: 17, reviewMinutes: 360, tokens: 1240000, cost: 18.6, tasks: 31, reworked: 4, tools: [{name:'Coding assistant',tasks:18,cost:9.8},{name:'Review agent',tasks:8,cost:5.1},{name:'Test generation',tasks:5,cost:3.7}] },
  last: { suggestions: 210, accepted: 132, retained: 103, reviewed: 18, firstPass: 14, reviewMinutes: 396, tokens: 980000, cost: 16.2, tasks: 25, reworked: 5, tools: [{name:'Coding assistant',tasks:15,cost:8.5},{name:'Review agent',tasks:6,cost:4.5},{name:'Test generation',tasks:4,cost:3.2}] }
};
export function summarizeAI(data) {
  const percent=(n,d)=>d?Math.round(n/d*100):0;
  return {acceptance:percent(data.accepted,data.suggestions),retention:percent(data.retained,data.accepted),firstPass:percent(data.firstPass,data.reviewed),reviewAverage:data.reviewed?data.reviewMinutes/data.reviewed:0,rework:percent(data.reworked,data.tasks),costPerTask:data.tasks?data.cost/data.tasks:0};
}
