// lib/linear-planner.ts
type LinearIssue = { id: string; title: string; estimate?: number|null };
type LinearState = { id: string; name: string };

const API = "https://api.linear.app/graphql";
const HEADERS = {
  "Authorization": process.env.LINEAR_API_KEY || "",
  "Content-Type": "application/json",
};

function fmt(d: Date) { return d.toISOString().slice(0,10); }

async function gql(query: string, variables: any = {}) {
  const res = await fetch(API, { method: "POST", headers: HEADERS, body: JSON.stringify({ query, variables }) });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

export async function getStates(): Promise<LinearState[]> {
  const q = `
    query($tid:String!){ workflowStates(first:50, filter:{ team:{ id:{ eq:$tid }}}){
      nodes{ id name }
    } }`;
  const d = await gql(q, { tid: process.env.LINEAR_TEAM_ID });
  return d.workflowStates.nodes;
}

export async function getStateIdByName(name: string): Promise<string|null> {
  const states = await getStates();
  return states.find(s => s.name.toLowerCase() === name.toLowerCase())?.id || null;
}

export async function fetchBacklog(limit = 50): Promise<LinearIssue[]> {
  // Backlog = not Done, not In Progress, not Todo(Today); filter by state name
  const q = `
    query($tid:String!,$n:Int!){
      issues(first:$n, filter:{
        team:{ id:{ eq:$tid } },
        state:{ name:{ nin:["Done","In Progress","Todo (Today)","Blocked"] } }
      }, orderBy: updatedAt){
        nodes{ id title estimate }
      }
    }`;
  const d = await gql(q, { tid: process.env.LINEAR_TEAM_ID, n: limit });
  return d.issues.nodes;
}

export async function moveIssuesToState(issueIds: string[], stateId: string) {
  const q = `
    mutation($ids:[String!]!, $stateId: String!){
      issueBatchUpdate(ids:$ids, input:{ stateId:$stateId }){ success }
    }`;
  await gql(q, { ids: issueIds, stateId });
}

export async function setDueDate(issueId: string, dateISO: string) {
  const q = `
    mutation($id:String!,$d:TimelessDate){
      issueUpdate(id:$id, input:{ dueDate:$d }){ success }
    }`;
  await gql(q, { id: issueId, d: dateISO });
}

export async function planWeek(capacityPerDay = 3): Promise<{ scheduled: {id:string; title:string; due:string}[] }> {
  // Mon–Fri scheduling starting next working day
  const today = new Date(); today.setHours(0,0,0,0);
  const days: Date[] = [];
  let d = new Date(today);
  for (let i=0; i<14 && days.length<5; i++) {
    d = new Date(today.getTime() + i*86400000);
    const wd = d.getDay(); // 0 Sun .. 6 Sat
    if (wd>=1 && wd<=5) days.push(new Date(d));
  }
  const todoStateId = (await getStateIdByName("Todo (Today)")) || (await getStateIdByName("Todo")) || "";
  const backlog = await fetchBacklog(100);
  // naive pick: take top N per day
  const picks: {id:string; title:string; due:string}[] = [];
  let idx = 0;
  for (const day of days) {
    for (let i=0; i<capacityPerDay && idx<backlog.length; i++) {
      const issue = backlog[idx++];
      const due = fmt(day);
      picks.push({ id: issue.id, title: issue.title, due });
    }
  }
  // apply due dates & move to Todo(Today)
  for (const p of picks) await setDueDate(p.id, p.due);
  await moveIssuesToState(picks.map(x=>x.id), todoStateId);
  return { scheduled: picks };
}

export async function todayPlan(): Promise<{ items: {title:string; id:string}[] }> {
  const q = `
    query($tid:String!,$today:TimelessDate){
      issues(first:50, filter:{
        team:{ id:{ eq:$tid } },
        dueDate:{ eq:$today },
        state:{ name:{ nin:["Done"] } }
      }){
        nodes{ id title }
      }
    }`;
  const d = await gql(q, { tid: process.env.LINEAR_TEAM_ID, today: fmt(new Date()) });
  return { items: d.issues.nodes };
}
