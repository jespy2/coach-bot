// lib/linear-planner.ts
// Roadmap planner + importer used by Slack routes (/coach plan, /today) and CLI.

const API = "https://api.linear.app/graphql";

const KEY   = process.env.LINEAR_API_KEY!;
const TEAM  = process.env.LINEAR_TEAM_ID!;
const TZ    = process.env.PLANNER_TIMEZONE || "America/Denver";
const CAP   = Math.max(1, Number(process.env.PLANNER_CAPACITY_PER_DAY || "3"));

const PROGRAM_START = process.env.PROGRAM_START_DATE!; // e.g. "2025-08-25"
const BLACKOUTS = (process.env.BLACKOUT_WEEKS || "")
  .split(",").map(s=>s.trim()).filter(Boolean).sort();

const SRC_NAME  = (process.env.SOURCE_STATE_NAME || "").toLowerCase() || null;
const DST_NAME  = (process.env.DEST_STATE_NAME   || "").toLowerCase() || null;
const NORMALIZE = process.env.NORMALIZE_STATES === "1";

if (!KEY || !TEAM) throw new Error("Set LINEAR_API_KEY and LINEAR_TEAM_ID");
if (!PROGRAM_START) throw new Error("Set PROGRAM_START_DATE=YYYY-MM-DD");

const H = { Authorization: KEY, "Content-Type": "application/json" };
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// Resolve the real Team ID once (accepts ID, key, or name in LINEAR_TEAM_ID)
let _TEAM_ID: string | undefined;

async function resolveTeamId(): Promise<string> {
  if (_TEAM_ID) return _TEAM_ID;

  // 1) Try as ID
  try {
    const r = await gql(`query($id:ID!){ team(id:$id){ id } }`, { id: TEAM });
    if (r?.team?.id) {
      _TEAM_ID = r.team.id as string;
      return _TEAM_ID;
    }
  } catch {}

  // 2) Try as KEY
  try {
    const r = await gql(
      `query($key:String!){
        teams(first:1, filter:{ key:{ eq:$key } }){ nodes{ id key } }
      }`,
      { key: TEAM }
    );
    const n = r?.teams?.nodes?.[0];
    if (n?.id) {
      _TEAM_ID = n.id as string;
      return _TEAM_ID;
    }
  } catch {}

  // 3) Try as NAME
  const r3 = await gql(`query{ teams(first:50){ nodes{ id key name } } }`);
  const needle = String(TEAM).toLowerCase();
  const pick =
    r3?.teams?.nodes?.find((t:any)=>String(t.name).toLowerCase() === needle) ||
    r3?.teams?.nodes?.find((t:any)=>String(t.name).toLowerCase().includes(needle));
  if (pick?.id) {
    _TEAM_ID = pick.id as string;
    return _TEAM_ID;
  }

  throw new Error(`Could not resolve LINEAR_TEAM_ID (${TEAM}) to a Team ID.`);
}

// ---------- gql ----------
async function gql(query:string, variables:Record<string,any> = {}): Promise<any> {
  const r = await fetch(API, { method:"POST", headers:H, body: JSON.stringify({ query, variables })});
  const txt = await r.text();
  let j: any = {};
  try { j = JSON.parse(txt); } catch {}
  if (!r.ok || j?.errors) {
    console.error("Linear GQL error:", { status: r.status, body: txt });
    throw new Error(j?.errors?.map((e:any)=>e?.message).join("; ") || `HTTP ${r.status}`);
  }
  return j.data;
}

// ---------- linear mini-API ----------
export async function* listIssues(pageSize = 200) {
  const teamIdID: string = await resolveTeamId();
  let after: string | null = null;
  while (true) {
    const q = `query($tid:ID!, $after:String){
      issues(filter:{ team:{ id:{ eq:$tid } }, archivedAt:{ null:true } }
             first:${pageSize} after:$after){
        pageInfo{ hasNextPage endCursor }
        nodes{ id identifier title description dueDate url
          labels{ nodes{ id name } }
          state{ id name type } }
      }}`;
    const resp = await gql(q, { tid: teamIdID, after });
    for (const n of resp.issues.nodes) yield n;
    if (!resp.issues.pageInfo.hasNextPage) break;
    after = resp.issues.pageInfo.endCursor;
  }
}

async function getOrCreateLabelId(teamIdID: string, teamIdString: string, name: string){
  const q = `query($tid:ID!, $name:String!){
    issueLabels(first:1, filter:{ team:{ id:{ eq:$tid } }, name:{ eq:$name } }){ nodes{ id } }
  }`;
  const labels = await gql(q, { tid: teamIdID, name });
  const hit = labels.issueLabels.nodes[0];
  if (hit) return hit.id;
  const m = `mutation($teamId:String!, $name:String!){
    issueLabelCreate(input:{ teamId:$teamId, name:$name }){ issueLabel{ id } }
  }`;
  const created = await gql(m, { teamId: teamIdString, name });
  return created.issueLabelCreate.issueLabel.id;
}

async function lookupStates(teamIdString: string) {
  const q = `query($ts:String!){
    team(id:$ts){ states(first:200){ nodes{ id name type } } }
  }`;
  const data = await gql(q, { ts: teamIdString });
  const states = data.team?.states?.nodes || [];
  const byName = (needle:string)=> states.find(s=> s.name.toLowerCase().includes(needle));
  const backlog = byName("backlog") || states.find(s=>s.type==="backlog") || null;
  const todo    = byName("todo")    || states.find(s=>s.type==="unstarted") || null;
  return { backlog, todo, all: states };
}

// updateIssue, createIssue … (unchanged except they still take string ids)

// ---------- Importer & Planner ----------
export async function importFromRoadmap(md: string, opts={}) {
  const teamIdID: string     = await resolveTeamId();
  const teamIdString: string = teamIdID;
  const { backlog, todo }    = await lookupStates(teamIdString);
  // … rest unchanged, but pass teamIdID/teamIdString into getOrCreateLabelId/createIssue
}

export async function applyRoadmap({ reset=false, range }: { reset?:boolean; range?:[number,number]} = {}) {
  const teamIdID: string     = await resolveTeamId();
  const teamIdString: string = teamIdID;
  const { backlog, todo }    = await lookupStates(teamIdString);
  // … rest unchanged, iterate listIssues() instead of listIssues(teamIdID)
}

export async function fetchWeeklyPlan() {
  const teamIdID: string = await resolveTeamId();
  const weekly: Record<string, any[]> = {};
  const all = [];
  for await (const it of listIssues()) all.push(it);
  // … rest unchanged
}

export async function moveDueToday() {
  const teamIdID: string     = await resolveTeamId();
  const teamIdString: string = teamIdID;
  const { backlog, todo }    = await lookupStates(teamIdString);
  // … rest unchanged
}

// ---------- date helpers ----------
function todayISO(tz: string): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: tz });
}

export async function fetchTodayChecklist() {
  const today = todayISO(TZ);
  const out: any[] = [];
  for await (const it of listIssues()) if (it.dueDate===today) out.push(it);
  return out;
}
