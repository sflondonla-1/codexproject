import { aiSamples, summarizeAI } from './ai-metrics.js';
const $ = (s) => document.querySelector(s);
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { toast('Storage unavailable. Changes will last for this visit.'); } };
let tasks = read('devspace-tasks', [
  {id:'1',title:'Build dashboard components',project:'devspace',priority:'High',done:false},
  {id:'2',title:'Review authentication pull request',project:'api-service',priority:'Medium',done:false},
  {id:'3',title:'Write unit tests for user service',project:'api-service',priority:'Medium',done:false},
  {id:'4',title:'Update API documentation',project:'docs',priority:'Low',done:true}
]);
if (!Array.isArray(tasks)) tasks = [];
let filter = 'all', toastTimeout;
function toast(message) { $('#toast').textContent=message; $('#toast').classList.add('visible'); clearTimeout(toastTimeout); toastTimeout=setTimeout(()=>$('#toast').classList.remove('visible'),3500); }
$('#today').textContent = new Intl.DateTimeFormat('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date()).toUpperCase();
function renderTasks() {
  const root=$('#tasks'); root.replaceChildren();
  const visible=tasks.filter(t=>filter==='all'||(filter==='done'?t.done:!t.done));
  for(const task of visible){
    const row=document.createElement('div');row.className='task-row'+(task.done?' done':'');
    const check=document.createElement('input');check.type='checkbox';check.className='task-check';check.checked=task.done;check.setAttribute('aria-label','Complete '+task.title);
    check.addEventListener('change',()=>{task.done=check.checked;save('devspace-tasks',tasks);renderTasks();});
    const info=document.createElement('div');info.className='task-info';
    const title=document.createElement('div');title.className='task-title';title.textContent=task.title;
    const project=document.createElement('div');project.className='task-project';project.textContent='▧ '+task.project;info.append(title,project);
    const priority=document.createElement('span');priority.className='priority '+task.priority.toLowerCase();priority.textContent='• '+task.priority;
    const remove=document.createElement('button');remove.className='delete-task';remove.textContent='×';remove.setAttribute('aria-label','Delete '+task.title);remove.addEventListener('click',()=>{tasks=tasks.filter(t=>t.id!==task.id);save('devspace-tasks',tasks);renderTasks();toast('Task deleted');});
    row.append(check,info,priority,remove);root.append(row);
  }
  if(!visible.length){const p=document.createElement('p');p.className='empty';p.textContent=filter==='done'?'No completed tasks yet. One small step at a time.':'You’re all clear. Add a task to get started.';root.append(p);}
  const remaining=tasks.filter(t=>!t.done).length;$('#nav-count').textContent=remaining;$('#task-count').textContent=tasks.length;
}
renderTasks();
for(const button of document.querySelectorAll('[data-filter]'))button.addEventListener('click',()=>{filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('selected',b===button));renderTasks();});
const dialog=$('#task-dialog');for(const id of ['#new-task','#add-task'])$(id).addEventListener('click',()=>{dialog.showModal();$('#task-title').focus();});$('#close-dialog').addEventListener('click',()=>dialog.close());
$('#task-form').addEventListener('submit',e=>{e.preventDefault();const title=$('#task-title').value.trim();if(!title){$('#task-title').setCustomValidity('Enter a task name.');$('#task-title').reportValidity();return;}tasks.unshift({id:crypto.randomUUID(),title,project:$('#task-project').value.trim()||'Personal',priority:$('#task-priority').value,done:false});save('devspace-tasks',tasks);filter='all';document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('selected',b.dataset.filter==='all'));renderTasks();e.target.reset();dialog.close();toast('Task added. Let’s make progress.');});$('#task-title').addEventListener('input',e=>e.target.setCustomValidity(''));
function renderChart(){const last=$('#week').value==='last',hours=last?[2.5,4.1,3,4.8,3.2,1.5,1]:[3.3,5.1,4.2,6.3,4.8,2.2,1.3];$('#plot').replaceChildren();hours.forEach((h,i)=>{const group=document.createElement('div');group.className='bar-group';group.title=`${['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][i]}: ${h} hours of sample focus time`;const a=document.createElement('div');a.className='bar';a.style.height=h/8*100+'%';const b=document.createElement('div');b.className='bar secondary';b.style.height=(h*.63)/8*100+'%';const label=document.createElement('label');label.textContent=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i];group.append(a,b,label);$('#plot').append(group);});$('.chart-footer strong').nextSibling.textContent=last?' You focused on 4 days last week.':' You focused on 5 days this week.';}
$('#week').addEventListener('change',renderChart);renderChart();
let minutes=25,remaining=1500,deadline=0,running=false;
const dayKey=()=>new Date().toLocaleDateString('en-CA');let sessions=read('devspace-sessions',{});
function updateSessions(){const n=sessions[dayKey()]||0;$('#session-count').textContent=`${n} session${n===1?'':'s'} completed today`;}
function drawTimer(){const m=Math.floor(remaining/60),s=remaining%60;$('#timer').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');$('#start-timer').textContent=running?'Ⅱ Pause':remaining<minutes*60?'▶ Resume':minutes===25?'▶ Start focus':'▶ Start break';$('#timer-label').textContent=running?(minutes===25?'ONE THING AT A TIME':'TAKE A BREATHER'):'LET’S MAKE PROGRESS';}
$('#start-timer').addEventListener('click',()=>{if(remaining===0)remaining=minutes*60;running=!running;if(running)deadline=Date.now()+remaining*1000;drawTimer();});
$('#reset-timer').addEventListener('click',()=>{running=false;remaining=minutes*60;drawTimer();});
for(const button of document.querySelectorAll('[data-minutes]'))button.addEventListener('click',()=>{minutes=Number(button.dataset.minutes);running=false;remaining=minutes*60;document.querySelectorAll('[data-minutes]').forEach(b=>b.classList.toggle('selected',b===button));drawTimer();});
setInterval(()=>{if(!running)return;remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));if(!remaining){running=false;if(minutes===25){sessions[dayKey()]=(sessions[dayKey()]||0)+1;save('devspace-sessions',sessions);updateSessions();}toast(minutes===25?'Focus session complete. Take a well-earned break!':'Break complete. Ready for your next session?');}drawTimer();},250);updateSessions();
for(const button of document.querySelectorAll('[data-view]'))button.addEventListener('click',()=>{document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b===button));const view=button.dataset.view;$('#page-name').textContent={overview:'Overview',tasks:'My tasks',focus:'Focus time',activity:'Activity',ai:'AI productivity'}[view];if(view==='overview')window.scrollTo({top:0,behavior:'smooth'});else $('#'+view+'-section').scrollIntoView({behavior:'smooth',block:'start'});});

const dollars = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value);
function renderAI() {
  const data=aiSamples[$('#ai-period').value];
  const stats=summarizeAI(data);
  const metrics=[
    ['Suggestion acceptance', stats.acceptance+'%', `${data.accepted} of ${data.suggestions} suggestions accepted`],
    ['7-day code retention',stats.retention+'%',`${data.retained} of ${data.accepted} accepted suggestions retained`],
    ['First-pass CI checks',stats.firstPass+'%',`${data.firstPass} of ${data.reviewed} AI-assisted PRs`],
    ['Human review / PR',stats.reviewAverage.toFixed(0)+' min',`${data.reviewMinutes} review minutes across ${data.reviewed} PRs`],
    ['AI-assisted tasks',String(data.tasks),'Completed tasks with recorded AI assistance'],
    ['API spend',dollars(data.cost),`${(data.tokens/1000000).toFixed(2)}M input + output tokens`]
  ];
  const root=$('#ai-metrics');root.replaceChildren();
  for(const [label,value,note] of metrics){const card=document.createElement('article');card.className='ai-metric';const name=document.createElement('h4');name.textContent=label;const number=document.createElement('strong');number.textContent=value;const description=document.createElement('p');description.textContent=note;card.append(name,number,description);root.append(card);}
  const table=$('#ai-tools');table.replaceChildren();for(const tool of data.tools){const row=document.createElement('tr');for(const value of [tool.name,tool.tasks,dollars(tool.cost)]){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}table.append(row);}
  const quality=$('#ai-quality-metrics');quality.replaceChildren();for(const [name,value] of [['7-day task rework',`${stats.rework}% (${data.reworked}/${data.tasks} tasks)`],['API cost per completed task',dollars(stats.costPerTask)]]){const line=document.createElement('div');const label=document.createElement('span');label.textContent=name;const number=document.createElement('strong');number.textContent=value;line.append(label,number);quality.append(line);}
}
$('#ai-period').addEventListener('change',renderAI);renderAI();
