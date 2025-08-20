// lib/linear-planner.ts
// Roadmap planner used by Slack routes (/coach plan, /coach today) and CLI.
//
// Week 1: PROGRAM_START_DATE (Wednesday 2025-08-20 in your env)
// Weeks 2+: Monday cadence
// Blackout weeks shift later weeks forward by full weeks.

const API = "https://api.linear.app/graphql";

const KEY   = process.env.LINEAR_API_KEY!;
const TEAM  = process.env.LINEAR_TEAM_ID!;
const TZ    = process.env.PLANNER_TIMEZONE || "America/Denver";
const CAP   = Math.max(1, Number(process.env.PLANNER_CAPACITY_PER_DAY || "3"));

const PROGRAM_START = process.env.PROGRAM_START_DATE!; // e.g. "2025-08-20"
const BLACKOUTS = (process.env.BLACKOUT_WEEKS || "")
  .split(",").map(s=>s.trim()).filter(Boolean).sort();

const SRC_NAME  = (process.env.SOURCE_STATE_NAME || "").toLowerCase() || null;
const DST_NAME  = (process.env.DEST_STATE_NAME   || "").toLowerCase() || null;
const NORMALIZE = process.env.NORMALIZE_STATES === "1";

if (!KEY || !TEAM) throw new Error("Set LINEAR_API_KEY and LINEAR_TEAM_ID");
if (!PROGRAM_START) throw new Error("Set PROGRAM_START_DATE=YYYY-MM-DD");

const H = { Authorization: KEY, "Content-Type": "application/json" };
const sleep = (ms:number)=>new Promise(r=>setTimeout(r,ms));

async function gql<T=any>(query:string, variables:Record<string,any> = {}): Promise<T> {
  const r = await fetch(API, { method:"POST", headers:H, body: JSON.stringify({ query, variables })});
  const j = await r.json();
  if (j.errors) {
    console.error("GraphQL errors:", JSON.stringify(j.errors, null, 2));
    throw new Error("GraphQL error");
  }
  return j.data;
}

// --- date helpers ---
function toISO(d: Date){ return d.toISOString().slice(0,10); }
function addDaysISO(iso: string, days: number){
  const d = new Date(iso+"T00:00:00Z");
  d.setUTCDate(d.getUTCDate()+days);
  return toISO(d);
}
function dowUTC(iso:string){ return new Date(iso+"T00:00:00Z").getUTCDay(); } // 0..6
function nextMondayOnOrAfter(iso:string){
  const dow = dowUTC(iso);                 // 1=Mon
  const delta = (1 - dow + 7) % 7;
  return addDaysISO(iso, delta);
}
export function todayISO(tz = TZ){
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year:"numeric", month:"2-digit", day:"2-digit" });
  const p = Object.fromEntries(fmt.formatToParts(now).map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}

// Week 1 = PROGRAM_START (Wed). Week 2 = first Monday on/after PROGRAM_START.
// Weeks 3+ = each Monday; blackout Mondays shift forward by +7 days per blackout <= the seed date.
export function startOfWeekN(weekN:number){
  if (weekN <= 1) return PROGRAM_START;
  const week2Mon = nextMondayOnOrAfter(PROGRAM_START);
  let seed = addDaysISO(week2Mon, 7*(weekN-2));
  const passed = BLACKOUTS.filter(b => b <= seed).length;
  if (passed > 0) seed = addDaysISO(seed, 7*passed);
  return seed;
}
export function windowForWeek(w:number){
  const start = startOfWeekN(w);
  const end   = addDaysISO(start, 6);
  return { start, end };
}

function phaseFromWeek(w:number){
  if (w >=1 && w <=8) return "phase-1";
  if (w >=9 && w <=16) return "phase-2";
  return "phase-unknown";
}

// --- roadmap classification ---
const rules = [
  { week: 16, rx: /\b(final|portfolio|linkedin|wrap[- ]?up|presentation|deploy.*prod(?:uction)?|final project)\b/i },
  { week: 1,  rx: /\btypescript|\bts\b/i },
  { week: 2,  rx: /\bnext(?:\.js)?|app router|rsc\b/i },
  { week: 3,  rx: /\b(recharts|data[- ]?viz|visuali[sz]ation)\b/i },
  { week: 4,  rx: /\bci\/?cd|pipeline|github actions|workflows?\b/i },
  { week: 5,  rx: /\baws|s3|cloudfront|lambda\b/i },
  { week: 6,  rx: /\b(ai|prompt|llm)\b/i },
  { week: 7,  rx: /\bterraform|iac\b/i },
  { week: 8,  rx: /\bcapstone|polish|cleanup|refactor\b/i },
  { week: 9,  rx: /\bjenkins\b/i },
  { week: 10, rx: /\bgithub actions|gha\b/i },
  { week: 11, rx: /\bk8s|kubernetes\b/i },
  { week: 12, rx: /\bhelm|autoscal(e|ing)|deployments?\b/i },
  { week: 13, rx: /\bexam|cert|practice test.*aws\b/i },
  { week: 14, rx: /\bexam|cert|terraform\b/i },
  { week: 15, rx: /\bexam|cert|(jenkins|gha)\b/i },
];
function weekFromTitle(title:string){
  for (const r of rules) if (r.rx.test(title)) return r.week;
  return null;
}
function weekFromExistingLabel(labels:{name:string}[] = []){
  const wk = labels.find(l => /^week-(\d+)$/.test(l.name));
  return wk ? Number(wk.name.split("-")[1]) : null;
}
function rankWithinWeek(title:string){
  const s = (title || "").toLowerCase();
  if (/\b(final|portfolio|linkedin|wrap[- ]?up|presentation|deploy.*prod(?:uction)?|final project)\b/.test(s)) return 95;
  if (/\b(review|read|study|overview|intro|basics)\b/.test(s)) return 10;
  if (/\b(set\s?up|scaffold|init|configure|install|bootstrap)\b/.test(s)) return 20;
  if (/\b(design|plan)\b/.test(s)) return 30;
  if (/\b(implement|build|develop|prototype)\b/.test(s)) return 50;
  if (/\b(integrate|connect)\b/.test(s)) return 55;
  if (/\b(test|validate|verify)\b/.test(s)) return 70;
  if (/\b(optimi[sz]e|polish|cleanup|refactor)\b/.test(s)) return 80;
  return 60;
}

const topicMatchers = [
  { rx: /\b(next(?:\.js)?|app router|rsc)\b/i, labels: ["area:nextjs"] },
  { rx: /\btypescript|\bts\b/i, labels: ["area:typescript","type:review"] },
  { rx: /\bci\/?cd|pipeline|github actions|workflows?\b/i, labels: ["type:ci-cd"] },
  { rx: /\baws|iam|s3|ec2|lambda|cloudformation\b/i, labels: ["area:aws"] },
  { rx: /\bterraform|iac\b/i, labels: ["area:terraform"] },
  { rx: /\b(docker|container|ecs|ecr)\b/i, labels: ["area:containers"] },
  { rx: /\bobservability|cloudwatch|metrics|logs?\b/i, labels: ["area:observability"] },
  { rx: /\bquiz|study|flashcards?\b/i, labels: ["type:study"] },
  { rx: /\bproject|build|prototype|demo\b/i, labels: ["type:project"] },
  { rx: /\btest|simulation|practice exam\b/i, labels: ["type:exam-prep"] },
];
function inferTopicLabels(title:string){
  const set = new Set<string>();
  for (const {rx, labels} of topicMatchers) if (rx.test(title)) labels.forEach(l => set.add(l));
  return [...set];
}

// Effort-aware description
export function detailTemplateFor(title:string, labels:string[] = []){
  const eff = (labels.find(l => /^effort:(S|M|L)$/i.test(l)) || "effort:M").split(":")[1].toUpperCase() as "S"|"M"|"L";
  const map = { S: "≈ 1 hour", M: "≈ 2–3 hours", L: "≈ 4–6 hours" };
  return `## Goal
Describe the concrete outcome for **${title}**.

## Context
Links or background.

## Plan
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

## Definition of Done
- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2

## Timebox
- **Effort**: \`effort:${eff}\`
- **Budget**: ${map[eff]}

## Artifacts
- PR:
- Branch:
- Preview:

_Autogenerated for: ${title}_`;
}

// ---------- Linear mini-API (correct ID!/String! usage) ----------
type IssueNode = {
  id: string;
  identifier: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  url?: string | null;
  labels?: { nodes: { id:string; name:string }[] };
  state?: { id:string; name:string; type:string | null };
};

export async function* listIssues(teamIdID: string, pageSize = 200){
  let after: string | null = null;
  while (true) {
    const q = `query($tid: ID!, $after: String){
      issues(
        filter:{ team:{ id:{ eq:$tid } }, archivedAt:{ null:true } }
        first:${pageSize}
        after:$after
      ){
        pageInfo{ hasNextPage endCursor }
        nodes{
          id identifier title description dueDate url
          labels{ nodes{ id name } }
          state{ id name type }
        }
      }
    }`;
    const d = await gql<{issues:{pageInfo:{hasNextPage:boolean;endCursor:string},nodes:IssueNode[]}}>(q, { tid: teamIdID, after });
    for (const n of d.issues.nodes) yield n;
    if (!d.issues.pageInfo.hasNextPage) break;
    after = d.issues.pageInfo.endCursor;
  }
}

async function getOrCreateLabelId(teamIdID: string, teamIdString: string, name: string){
  const q = `query($tid: ID!, $name:String!){
    issueLabels(first:1, filter:{ team:{ id:{ eq:$tid } }, name:{ eq:$name } }){
      nodes{ id name }
    }
  }`;
  const d = await gql<{issueLabels:{nodes:{id:string;name:string}[]}}>(q, { tid: teamIdID, name });
  const hit = d.issueLabels.nodes[0];
  if (hit) return hit.id;

  const m = `mutation($teamId:String!, $name:String!){
    issueLabelCreate(input:{ teamId:$teamId, name:$name }){ issueLabel{ id name } }
  }`;
  const created = await gql<{issueLabelCreate:{issueLabel:{id:string}}}>(m, { teamId: teamIdString, name });
  return created.issueLabelCreate.issueLabel.id;
}

async function lookupStates(teamIdString: string){
  const q = `query($ts:String!){
    team(id:$ts){ states(first:200){ nodes{ id name position type } } }
  }`;
  const d = await gql<{team:{states:{nodes:{id:string;name:string;position:number;type:string|null}[]}}}>(q, { ts: teamIdString });
  const states = d.team?.states?.nodes || [];

  const byName = (needle:string)=> states.find(s=> s.name.toLowerCase().includes(needle));
  const backlog = byName("backlog") || states.find(s=>s.type==="backlog") || null;
  const todo    = byName("todo")    || states.find(s=>s.type==="unstarted") || states.find(s=>s.type==="triage") || null;

  let source = backlog;
  if (SRC_NAME) source = states.find(s => s.name.toLowerCase().includes(SRC_NAME)) || source;

  let dest = todo;
  if (DST_NAME) dest = states.find(s => s.name.toLowerCase().includes(DST_NAME)) || dest;

  return { backlog: source, todo: dest, all: states };
}

async function updateIssue(id:string, input: any){
  const m = `mutation($id:String!, $input:IssueUpdateInput!){
    issueUpdate(id:$id, input:$input){ success }
  }`;
  const d = await gql<{issueUpdate:{success:boolean}}>(m, { id, input });
  return d.issueUpdate?.success;
}

// ---------- Public planner ops used by Slack ----------

// Apply labels + dates (and optionally normalize/move-today) to ALL issues
export async function applyRoadmap({ reset = false } = {}){
  const teamIdID     = TEAM; // for ID! variables
  const teamIdString = TEAM; // for String variables
  const { backlog, todo } = await lookupStates(teamIdString);
  const tzToday = todayISO(TZ);

  const buckets = new Map<number, IssueNode[]>();
  for await (const it of listIssues(teamIdID)){
    const labels = it.labels?.nodes || [];
    const wk = weekFromExistingLabel(labels) ?? weekFromTitle(it.title) ?? 1;
    if (!buckets.has(wk)) buckets.set(wk, []);
    buckets.get(wk)!.push(it);
  }

  for (const [week, arr] of [...buckets.entries()].sort((a,b)=>a[0]-b[0])){
    arr.sort((a,b)=> rankWithinWeek(a.title) - rankWithinWeek(b.title) || a.identifier.localeCompare(b.identifier));
    const weekStart = startOfWeekN(week);

    for (let i=0;i<arr.length;i++){
      const it = arr[i];
      const labels  = it.labels?.nodes || [];
      const have    = new Set(labels.map(l => l.name));

      const want = new Set<string>([`week-${week}`, phaseFromWeek(week), ...inferTopicLabels(it.title)]);
      const hasEffort = [...have].some(n => /^effort:(S|M|L)$/i.test(n));
      if (!hasEffort) want.add("effort:M");

      const toAddNames = [...want].filter(n => !have.has(n));
      const toRemoveIds = reset
        ? labels.filter(l => /^week-\d+$/.test(l.name) || /^phase-\d+$/.test(l.name) || l.name.toLowerCase()==="phase-3").map(l=>l.id)
        : [];

      const addIds:string[] = [];
      for (const name of toAddNames){
        const id = await getOrCreateLabelId(teamIdID, teamIdString, name);
        addIds.push(id);
        await sleep(25);
      }

      const daySlot = Math.min(Math.floor(i / CAP), 6);   // spread by capacity
      const dueISO  = addDaysISO(weekStart, daySlot);

      const needTemplate = !it.description || !/## Goal/i.test(it.description);
      const finalDesc = needTemplate ? detailTemplateFor(it.title, [...want]) : it.description;

      await updateIssue(it.id, {
        ...(addIds.length ? { addedLabelIds: addIds } : {}),
        ...(toRemoveIds.length ? { removedLabelIds: toRemoveIds } : {}),
        dueDate: dueISO,
        ...(finalDesc !== it.description ? { description: finalDesc } : {}),
      });

      // optional normalize + move-today
      if (NORMALIZE && todo && it.state?.id === todo.id && dueISO !== tzToday && backlog){
        await updateIssue(it.id, { stateId: backlog.id });
      }
      if (dueISO === tzToday && backlog && it.state?.id === backlog.id && todo){
        await updateIssue(it.id, { stateId: todo.id });
      }
    }
  }
}

// Compose a week-at-a-glance (YYYY-MM-DD -> Issue[])
export async function fetchWeeklyPlan(teamIdID = TEAM){
  const weekly: Record<string, { id:string; title:string; url?:string|null }[]> = {};
  const all: IssueNode[] = [];
  for await (const it of listIssues(teamIdID)) all.push(it);

  // Compute target week per issue and its scheduled due date
  const grouped = new Map<number, IssueNode[]>();
  for (const it of all){
    const labels = it.labels?.nodes || [];
    const wk = weekFromExistingLabel(labels) ?? weekFromTitle(it.title) ?? 1;
    if (!grouped.has(wk)) grouped.set(wk, []);
    grouped.get(wk)!.push(it);
  }

  for (const [week, arr] of [...grouped.entries()]){
    arr.sort((a,b)=> rankWithinWeek(a.title) - rankWithinWeek(b.title) || a.identifier.localeCompare(b.identifier));
    const weekStart = startOfWeekN(week);
    for (let i=0;i<arr.length;i++){
      const it = arr[i];
      const daySlot = Math.min(Math.floor(i / CAP), 6);
      const dueISO  = addDaysISO(weekStart, daySlot);
      weekly[dueISO] ??= [];
      weekly[dueISO].push({ id: it.id, title: it.title, url: it.url ?? undefined });
    }
  }

  return weekly;
}

// Move all due-today from “Backlog-like” to “Todo-like”
export async function moveDueToday(){
  const teamIdID     = TEAM;
  const teamIdString = TEAM;
  const { backlog, todo } = await lookupStates(teamIdString);
  if (!todo || !backlog) return;

  const today = todayISO(TZ);
  for await (const it of listIssues(teamIdID)){
    if (it.dueDate === today && it.state?.id === backlog.id){
      await updateIssue(it.id, { stateId: todo.id });
      await sleep(25);
    }
  }
}

// Fetch a tidy list for Slack “today” checklist (after move)
export async function fetchTodayChecklist(){
  const teamIdID = TEAM;
  const today = todayISO(TZ);
  const out: { id:string; identifier:string; title:string; url?:string|null }[] = [];
  for await (const it of listIssues(teamIdID)){
    if (it.dueDate === today){
      out.push({ id: it.id, identifier: it.identifier, title: it.title, url: it.url ?? null });
    }
  }
  // Sort for nicer reading
  out.sort((a,b)=> a.title.localeCompare(b.title));
  return out;
}
