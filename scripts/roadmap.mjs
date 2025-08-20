// scripts/roadmap.mjs
// Unified roadmap tool: apply | check | reset | move-today
//
// Uses your env keys:
//
// # Linear
// LINEAR_API_KEY=...
// LINEAR_TEAM_ID=4cd82011-5b94-4ebe-ae89-c6038f2a26ac
//
// # Slack (not required for this script)
// SLACK_BOT_TOKEN= 
// SLACK_SIGNING_SECRET= 
// SLACK_DEFAULT_CHANNEL_ID= 
//
// # Planner
// PROGRAM_START_DATE=2025-08-20        // Week 1 start (NOTE: 2025-08-20 is a Wednesday)
// BLACKOUT_WEEKS=2025-11-24,2025-12-22  // whole weeks to skip (Mondays); later weeks shift forward
// SCHEDULE_TOKEN=                       // not used here
// PLANNER_CAPACITY_PER_DAY=3            // tasks/day target (spread within week)
// PLANNER_DEFAULT_EST_HOURS=1.5         // not used here; kept for parity
// PLANNER_TIMEZONE=America/Denver
//
// # Optional (column overrides + cleanup)
// SOURCE_STATE_NAME=Backlog
// DEST_STATE_NAME=Todo
// NORMALIZE_STATES=1                    // push non-today items out of DEST back to SOURCE
//
// # Utility
// DRY_RUN=1                             // preview only (no writes)
// ACTION=apply|check|reset|move-today   // default: apply
//
// Run examples:
//   node --env-file=.env.local scripts/roadmap.mjs
//   ACTION=check node --env-file=.env.local scripts/roadmap.mjs
//   ACTION=reset node --env-file=.env.local scripts/roadmap.mjs
//   ACTION=move-today node --env-file=.env.local scripts/roadmap.mjs

const API   = "https://api.linear.app/graphql";
const KEY   = process.env.LINEAR_API_KEY;
const TEAM  = process.env.LINEAR_TEAM_ID;

const PROGRAM_START = process.env.PROGRAM_START_DATE;      // e.g., "2025-08-20" (Wed)
const TZ            = process.env.PLANNER_TIMEZONE || "America/Denver";
const CAPACITY      = Math.max(1, Number(process.env.PLANNER_CAPACITY_PER_DAY || "3"));
const BLACKOUTS     = (process.env.BLACKOUT_WEEKS || "")
  .split(",").map(s => s.trim()).filter(Boolean).sort();

const DRY           = process.env.DRY_RUN === "1";
const ACTION        = (process.env.ACTION || "apply").toLowerCase();

const SRC_NAME      = (process.env.SOURCE_STATE_NAME || "").toLowerCase() || null;
const DST_NAME      = (process.env.DEST_STATE_NAME   || "").toLowerCase() || null;
const NORMALIZE     = process.env.NORMALIZE_STATES === "1";

// --- guards
if (!KEY || !TEAM) {
  console.error("Set LINEAR_API_KEY and LINEAR_TEAM_ID");
  process.exit(1);
}
if (!PROGRAM_START && (ACTION === "apply" || ACTION === "reset" || ACTION === "check")) {
  console.error("Set PROGRAM_START_DATE=YYYY-MM-DD (Week 1 start; 2025-08-20 is a Wednesday).");
  process.exit(1);
}

// --- helpers
const H = { Authorization: KEY, "Content-Type": "application/json" };
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
async function gql(query, variables={}) {
  const r = await fetch(API, { method:"POST", headers:H, body: JSON.stringify({query, variables}) });
  const j = await r.json();
  if (j.errors) { console.error("GraphQL errors:", JSON.stringify(j.errors, null, 2)); throw new Error("GraphQL error"); }
  return j.data;
}

function toISO(d){ return d.toISOString().slice(0,10); }
function addDaysISO(iso, days){
  const d = new Date(iso+"T00:00:00Z");
  d.setUTCDate(d.getUTCDate()+days);
  return toISO(d);
}
function dowUTC(iso){ return new Date(iso+"T00:00:00Z").getUTCDay(); } // 0=Sun..6=Sat
function nextMondayOnOrAfter(iso){
  const dow = dowUTC(iso); // 1=Mon
  const delta = (1 - dow + 7) % 7;
  return addDaysISO(iso, delta);
}
function todayISO(tz = TZ){
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year:"numeric", month:"2-digit", day:"2-digit" });
  const p = Object.fromEntries(fmt.formatToParts(now).map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}

// Week 1 = PROGRAM_START (Wed). Week 2 = first Monday on/after PROGRAM_START.
// Weeks >=3 = Monday cadence; BLACKOUT_WEEKS (Mondays) shift all later weeks by +7 days per blackout passed.
function startOfWeekN(weekN){
  if (weekN <= 1) return PROGRAM_START;

  const week2Mon = nextMondayOnOrAfter(PROGRAM_START);
  let seed = addDaysISO(week2Mon, 7*(weekN-2));

  // shift for blackout Mondays that are <= seed
  const passed = BLACKOUTS.filter(b => b <= seed).length;
  if (passed > 0) seed = addDaysISO(seed, 7*passed);
  return seed;
}
function windowForWeek(w){
  const start = startOfWeekN(w);
  const end   = addDaysISO(start, 6);
  return { start, end };
}
function inWindow(dateISO, {start, end}){
  return !!dateISO && dateISO >= start && dateISO <= end;
}

function phaseFromWeek(w){
  if (w >=1 && w <=8) return "phase-1";
  if (w >=9 && w <=16) return "phase-2";
  return "phase-unknown";
}

// Roadmap detection (keep “final/portfolio” last-week; rest map to their themes)
const roadmapRules = [
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
function weekFromTitle(title){
  for (const r of roadmapRules) if (r.rx.test(title)) return r.week;
  return null;
}
function weekFromExistingLabel(labels = []){
  const wk = labels.find(l => /^week-(\d+)$/.test(l.name));
  return wk ? Number(wk.name.split("-")[1]) : null;
}

// Rank within a week for nicer ordering (study/setup early; deploy/final late)
function rankWithinWeek(title){
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

// Topic labels
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
function inferTopicLabels(title){
  const set = new Set();
  for (const {rx, labels} of topicMatchers) if (rx.test(title)) labels.forEach(l => set.add(l));
  return [...set];
}

// Description template (effort-aware)
function detailTemplateFor(title, labels = []){
  const eff = (labels.find(l => /^effort:(S|M|L)$/i.test(l)) || "effort:M").split(":")[1].toUpperCase();
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

// --- Linear GraphQL (types that match the API)
async function* listIssues(teamIdID, pageSize=200){
  let after = null;
  while (true) {
    const q = `query($tid: ID!, $after: String){
      issues(
        filter:{ team:{ id:{ eq:$tid } }, archivedAt:{ null:true } }
        first:${pageSize}
        after:$after
      ){
        pageInfo{ hasNextPage endCursor }
        nodes{
          id identifier title description dueDate estimate url
          labels{ nodes{ id name } }
          state{ id name type }
        }
      }
    }`;
    const d = await gql(q, { tid: teamIdID, after });
    for (const n of d.issues.nodes) yield n;
    if (!d.issues.pageInfo.hasNextPage) break;
    after = d.issues.pageInfo.endCursor;
  }
}
async function getOrCreateLabelId(teamIdID, teamIdString, name){
  const q = `query($tid: ID!, $name:String!){
    issueLabels(first:1, filter:{ team:{ id:{ eq:$tid } }, name:{ eq:$name } }){
      nodes{ id name }
    }
  }`;
  const d = await gql(q, { tid: teamIdID, name });
  const hit = d.issueLabels.nodes[0];
  if (hit) return hit.id;

  const m = `mutation($teamId:String!, $name:String!){
    issueLabelCreate(input:{ teamId:$teamId, name:$name }){ issueLabel{ id name } }
  }`;
  const created = await gql(m, { teamId: teamIdString, name });
  return created.issueLabelCreate.issueLabel.id;
}
async function lookupStates(teamIdString){
  const q = `query($ts:String!){
    team(id:$ts){ states(first:200){ nodes{ id name position type } } }
  }`;
  const d = await gql(q, { ts: teamIdString });
  const states = d.team?.states?.nodes || [];

  const byName = (needle)=> states.find(s=> s.name.toLowerCase().includes(needle));
  const backlog = byName("backlog") || states.find(s=>s.type==="backlog") || null;
  const todo    = byName("todo")    || states.find(s=>s.type==="unstarted") || states.find(s=>s.type==="triage") || null;

  let source = backlog;
  if (SRC_NAME) source = states.find(s => s.name.toLowerCase().includes(SRC_NAME)) || source;

  let dest = todo;
  if (DST_NAME) dest = states.find(s => s.name.toLowerCase().includes(DST_NAME)) || dest;

  return { backlog: source, todo: dest, all: states };
}
async function updateIssue(id, input){
  const m = `mutation($id:String!, $input:IssueUpdateInput!){
    issueUpdate(id:$id, input:$input){ success }
  }`;
  const d = await gql(m, { id, input });
  return d.issueUpdate?.success;
}

// --- actions
async function actionCheck(teamIdID){
  const counts = new Map();
  let idx = 0;

  console.log("== Due date mismatches (issue not within expected week window) ==");
  for await (const it of listIssues(teamIdID)){
    const labels = it.labels?.nodes || [];
    const wkLbl  = weekFromExistingLabel(labels);
    const wkTit  = weekFromTitle(it.title);
    const expectedWeek = wkLbl || wkTit || 1; // avoid index fallback (keeps deterministic)

    const win = windowForWeek(expectedWeek);
    const ok  = inWindow(it.dueDate, win);
    if (!ok) {
      console.log(`${it.identifier} | ${it.state?.name||""} | due=${it.dueDate||"(none)"} | expected week=${expectedWeek} (${win.start}..${win.end}) | title="${it.title}"`);
    }
    counts.set(expectedWeek, (counts.get(expectedWeek)||0)+1);
    idx++;
  }

  console.log("\n== Counts by expected week ==");
  [...counts.entries()].sort((a,b)=>a[0]-b[0]).forEach(([w,c])=>console.log(`Week ${w}: ${c}`));
}

async function actionApplyOrReset(teamIdID, teamIdString, { reset = false } = {}){
  const { backlog, todo } = await lookupStates(teamIdString);
  if (!todo) { console.error("No Todo-like state (name includes 'todo' or type unstarted/triage)."); process.exit(1); }
  const tzToday = todayISO(TZ);

  // Bucket by computed week, then sort by rank
  const buckets = new Map(); // week -> [issues]
  for await (const it of listIssues(teamIdID)){
    const labels = it.labels?.nodes || [];
    const wk = weekFromExistingLabel(labels) ?? weekFromTitle(it.title) ?? 1;
    if (!buckets.has(wk)) buckets.set(wk, []);
    buckets.get(wk).push(it);
  }

  let labeled=0, dated=0, moved=0, touched=0;

  for (const [week, arr] of [...buckets.entries()].sort((a,b)=>a[0]-b[0])){
    // Stable order: rank, then identifier
    arr.sort((a,b)=> rankWithinWeek(a.title) - rankWithinWeek(b.title) || a.identifier.localeCompare(b.identifier));

    const weekStart = startOfWeekN(week);

    // Assign day slots with capacity (CAPACITY tasks per day). Day = floor(i / CAPACITY), clamped 0..6
    for (let i=0;i<arr.length;i++){
      const it = arr[i];
      const labels  = it.labels?.nodes || [];
      const have    = new Set(labels.map(l => l.name));

      // desired labels
      const want = new Set([`week-${week}`, phaseFromWeek(week), ...inferTopicLabels(it.title)]);
      const hasEffort = [...have].some(n => /^effort:(S|M|L)$/i.test(n));
      if (!hasEffort) want.add("effort:M"); // default

      const toAddNames = [...want].filter(n => !have.has(n));
      const toRemoveIds = reset
        ? labels.filter(l => /^week-\d+$/.test(l.name) || /^phase-\d+$/.test(l.name) || l.name.toLowerCase()==="phase-3").map(l=>l.id)
        : [];

      const addIds = [];
      for (const name of toAddNames){
        const id = await getOrCreateLabelId(teamIdID, teamIdString, name);
        addIds.push(id);
        await sleep(35);
      }

      // date assignment using capacity-based spreading
      const daySlot = Math.min(Math.floor(i / CAPACITY), 6);  // 0..6
      const dueISO  = addDaysISO(weekStart, daySlot);

      // description template injection if missing
      const needTemplate = !it.description || !/## Goal/i.test(it.description);
      const finalDesc = needTemplate ? detailTemplateFor(it.title, [...want]) : it.description;

      if (DRY){
        console.log(`PLAN ${it.identifier}: week=${week} due=${dueISO} +[${toAddNames.join(", ")}] -[${toRemoveIds.length}]`);
      } else {
        const ok = await updateIssue(it.id, {
          ...(addIds.length ? { addedLabelIds: addIds } : {}),
          ...(toRemoveIds.length ? { removedLabelIds: toRemoveIds } : {}),
          dueDate: dueISO,
          ...(finalDesc !== it.description ? { description: finalDesc } : {}),
        });
        if (ok){ touched++; if (addIds.length) labeled++; if (dueISO) dated++; }
        await sleep(80);
      }

      // optional normalize + move-today
      if (!DRY){
        if (NORMALIZE && todo && it.state?.id === todo.id && dueISO !== tzToday && backlog){
          const ok = await updateIssue(it.id, { stateId: backlog.id });
          if (ok) moved++;
          await sleep(60);
        }
        if (dueISO === tzToday && backlog && it.state?.id === backlog.id && todo){
          const ok = await updateIssue(it.id, { stateId: todo.id });
          if (ok) moved++;
          await sleep(60);
        }
      }
    }
  }

  console.log(DRY
    ? "Done (dry-run)."
    : `Done. Updated ${touched} issues; labeled ${labeled}, set due dates on ${dated}, moved ${moved}.`);
}

async function actionMoveToday(teamIdID, teamIdString){
  const { backlog, todo } = await lookupStates(teamIdString);
  if (!todo) { console.error("No Todo-like state."); process.exit(1); }
  const tzToday = todayISO(TZ);
  let moved = 0;

  for await (const it of listIssues(teamIdID)){
    if (it.dueDate === tzToday && backlog && it.state?.id === backlog.id){
      if (DRY){
        console.log(`DRY move ${it.identifier} -> Todo`);
      } else {
        const ok = await updateIssue(it.id, { stateId: todo.id });
        if (ok) moved++;
        await sleep(50);
      }
    }
  }
  console.log(DRY ? "Done (dry)." : `Done. Moved ${moved} issues to Todo.`);
}

// --- main
(async function main(){
  const teamIdID     = TEAM; // usable as ID!
  const teamIdString = TEAM; // usable as String!

  if (ACTION === "check")       return actionCheck(teamIdID);
  if (ACTION === "move-today")  return actionMoveToday(teamIdID, teamIdString);
  if (ACTION === "reset")       return actionApplyOrReset(teamIdID, teamIdString, { reset:true });
  // default
  return actionApplyOrReset(teamIdID, teamIdString, { reset:false });
})().catch(e => { console.error(e); process.exit(1); });
