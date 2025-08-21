// Roadmap planner + importer used by Slack routes (/coach plan, /today) and CLI.
//
// Week 1: PROGRAM_START_DATE (Wednesday, e.g. 2025-08-20)
// Weeks 2+: Monday cadence
// Blackout weeks shift later weeks forward by full weeks.

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

// ---------- team resolver (accepts ID, key, or name in LINEAR_TEAM_ID) ----------
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
    const msg = j?.errors?.map((e:any)=>e?.message).join("; ") || `HTTP ${r.status}`;
    throw new Error(msg);
  }
  return j.data;
}

// ---------- date helpers ----------
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

function getWeekStartDates(startDateISO: string, count: number): string[] {
  const dates = [];
  const start = new Date(startDateISO + "T00:00:00Z");
  // Week 1 starts on given date (Wed)
  let current = new Date(start);
  dates.push(toISO(current));
  // Week 2+ start on Monday
  while (dates.length < count) {
    current.setUTCDate(current.getUTCDate() + (8 - current.getUTCDay()) % 7 || 7);
    dates.push(toISO(current));
  }
  return dates;
}

function phaseFromWeek(w:number){
  if (w >=1 && w <=8) return "phase-1";
  if (w >=9 && w <=16) return "phase-2";
  return "phase-unknown";
}

// ---------- roadmap classification ----------
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

// ---------- Effort-aware description ----------
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

// ---------- Linear types ----------
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
type IssuesPage = {
  issues: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: IssueNode[]; };
};
type LabelsPage = { issueLabels: { nodes: { id: string; name: string }[] } };
type StatesPage = { team: { states: { nodes: { id: string; name: string; position?: number; type: string | null }[] } } };
type UpdateIssueResp = { issueUpdate: { success: boolean } };
type CreateLabelResp = { issueLabelCreate: { issueLabel: { id: string } } };

// ---------- Linear mini-API ----------
export async function* listIssues(pageSize = 200){
  const teamIdID: string = await resolveTeamId();
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
    const resp = (await gql(q, { tid: teamIdID, after })) as IssuesPage;
    for (const n of resp.issues.nodes) yield n;
    if (!resp.issues.pageInfo.hasNextPage) break;
    after = resp.issues.pageInfo.endCursor;
  }
}

async function getOrCreateLabelId(teamIdID: string, teamIdString: string, name: string){
  const q = `query($tid: ID!, $name:String!){
    issueLabels(first:1, filter:{ team:{ id:{ eq:$tid } }, name:{ eq:$name } }){
      nodes{ id name }
    }
  }`;
  const labels = (await gql(q, { tid: teamIdID, name })) as LabelsPage;
  const hit = labels.issueLabels.nodes[0];
  if (hit) return hit.id;

  const m = `mutation($teamId:String!, $name:String!){
    issueLabelCreate(input:{ teamId:$teamId, name:$name }){ issueLabel{ id name } }
  }`;
  const created = (await gql(m, { teamId: teamIdString, name })) as CreateLabelResp;
  return created.issueLabelCreate.issueLabel.id;
}

async function lookupStates(teamIdString: string){
  const q = `query($ts:String!){
    team(id:$ts){ states(first:200){ nodes{ id name position type } } }
  }`;
  const data = (await gql(q, { ts: teamIdString })) as StatesPage;
  const states = data.team?.states?.nodes || [];

  const byName = (needle:string)=> states.find(s=> s.name.toLowerCase().includes(needle));
  const backlog = byName("backlog") || states.find(s=>s.type==="backlog") || null;
  const todo    = byName("todo")    || states.find(s=>s.type==="unstarted") || states.find(s=>s.type==="triage") || null;

  let source = backlog;
  if (SRC_NAME) source = states.find(s => s.name.toLowerCase().includes(SRC_NAME)) || source;

  let dest = todo;
  if (DST_NAME) dest = states.find(s => s.name.toLowerCase().includes(DST_NAME)) || dest;

  return { backlog: source, todo: dest, all: states };
}

async function updateIssue(id:string, input: Record<string, any>){
  const m = `mutation($id:String!, $input:IssueUpdateInput!){
    issueUpdate(id:$id, input:$input){ success }
  }`;
  const res = (await gql(m, { id, input })) as UpdateIssueResp;
  return res.issueUpdate?.success;
}

// Create a new issue
async function createIssue(input: {
  teamId: string;
  title: string;
  description?: string;
  labelIds?: string[];
  stateId?: string | null;
  dueDate?: string | null; // YYYY-MM-DD (TimelessDate)
}) {
  const m = `mutation($input: IssueCreateInput!) {
    issueCreate(input: $input) { issue { id identifier title url } }
  }`;
  const res = await gql(m, { input });
  return res?.issueCreate?.issue as { id:string; identifier:string; title:string; url?:string|null } | null;
}

// ---------- Markdown importer ----------
type ParsedTask = {
  week: number | null;         // null for explicit today/tomorrow-only items
  title: string;
  body: string;
  today: boolean;
  tomorrow: boolean;
};

function parseRoadmapMarkdown(md: string): ParsedTask[] {
  const lines = md.split(/\r?\n/);
  const tasks: ParsedTask[] = [];
  let currentWeek: number | null = null;
  let buffer: string[] = [];
  let inTask = false;

  function flush() {
    if (!inTask) return;
    const body = buffer.join("\n").trim();
    const firstLine = body.split("\n")[0] || "";
    const title = firstLine.replace(/^###\s*/, "").trim();

    const low = body.toLowerCase();
    const today = /\b\[?today\]?\b/.test(low) || /\(today\)/.test(low);
    const tomorrow = /\b\[?tomorrow\]?\b/.test(low) || /\(tomorrow\)/.test(low);

    tasks.push({ week: currentWeek, title, body, today, tomorrow });
    buffer = [];
    inTask = false;
  }

  for (const raw of lines) {
    const line = raw.trimRight();

    const wk = line.match(/^##\s*Week\s*(\d+)\b/i);
    if (wk) {
      flush();
      currentWeek = Number(wk[1]);
      continue;
    }

    if (/^###\s+/.test(line)) {
      flush();
      inTask = true;
      buffer = [line];
      continue;
    }

    if (inTask) buffer.push(line);
  }
  flush();
  return tasks;
}

// Create tasks from the markdown, putting [today]/[tomorrow] directly into Todo
export async function importFromRoadmap(
  md: string,
  { todayFirst = true, offset = 0, limit = Number.POSITIVE_INFINITY } = {}
) {
  const teamIdID: string     = await resolveTeamId();
  const teamIdString: string = teamIdID;

  const { backlog, todo } = await lookupStates(teamIdString);
  const weeks = getWeekStartDates(PROGRAM_START, 16);

  const parsed = parseRoadmapMarkdown(md);
  const tzToday = todayISO(TZ);
  const tzTomorrow = addDaysISO(tzToday, 1);

  // Order: today/tomorrow first so /today is immediately useful
  const ordered = todayFirst
    ? [...parsed.filter(t => t.today || t.tomorrow), ...parsed.filter(t => !t.today && !t.tomorrow)]
    : parsed;

  const total = ordered.length;
  const slice = ordered.slice(offset, Math.min(offset + limit, total));

  // ---------- PREWARM LABEL IDS (do once per slice) ----------
  const labelCache = new Map<string, string>();
  async function idFor(name: string) {
    if (labelCache.has(name)) return labelCache.get(name)!;
    const id = await getOrCreateLabelId(teamIdID, teamIdString, name);
    labelCache.set(name, id);
    return id;
  }

  // Precompute label names we’ll need for this slice
  const needed = new Set<string>(["today", "tomorrow", "phase-1", "phase-2"]);
  for (const t of slice) {
    if (t.week && t.week >= 1 && t.week <= 16) {
      needed.add(`week-${t.week}`);
    }
  }
  // Resolve all needed labels once
  for (const n of needed) await idFor(n);

  // Cap per-week at creation time too (planner will also enforce later)
  const weekCounts: Record<number, number> = {};
  let imported = 0;

  for (const t of slice) {
    let dueDate: string | null = null;
    let labelNames: string[] = [];
    let stateId: string | null = backlog?.id ?? null;

    if (t.today) {
      dueDate = tzToday;
      labelNames.push("today");
      stateId = todo?.id ?? stateId;
    } else if (t.tomorrow) {
      dueDate = tzTomorrow;
      labelNames.push("tomorrow");
      stateId = todo?.id ?? stateId;
    } else if (typeof t.week === "number" && t.week >= 1 && t.week <= 16) {
      const wk = t.week;
      const max = wk === 15 ? 20 : 10;
      weekCounts[wk] = (weekCounts[wk] || 0);
      if (weekCounts[wk] >= max) {
        // Overflow: create without week label; planner will push to stretch later if needed
        stateId = backlog?.id ?? null;
      } else {
        labelNames.push(`week-${wk}`, phaseFromWeek(wk));
        dueDate = weeks[wk - 1]; // start of that week
        weekCounts[wk]++;
      }
    }

    const labelIds = labelNames.length ? await Promise.all(labelNames.map(n => idFor(n))) : undefined;

    await createIssue({
      teamId: teamIdString,
      title: t.title,
      description: t.body,
      labelIds,
      stateId,
      dueDate: dueDate ?? undefined,
    });

    imported++;
    await sleep(10); // keep it tiny; label fetches are cached above
  }

  return { imported, total, nextOffset: Math.min(offset + slice.length, total) };
}

// ---------- Public planner ops used by Slack ----------

export type WeeklyPlan = Record<string, { id: string; title: string; url?: string | null }[]>;

// Apply labels + dates (and optionally normalize/move-today) to ALL issues
// Also enforces stretch rules and re-caps week buckets.
// Options:
//   reset: remove week-*/phase-* before reapplying
//   range: [startWeek, endWeek] to process in slices (for timeout avoidance)
export async function applyRoadmap(
  { reset = false, range }: { reset?: boolean; range?: [number, number] } = {}
){
  const teamIdID: string     = await resolveTeamId();
  const teamIdString: string = teamIdID;
  const { backlog, todo } = await lookupStates(teamIdString);
  const weeks = getWeekStartDates(PROGRAM_START, 16);

  const buckets = new Map<number, IssueNode[]>();
  const stretch: IssueNode[] = [];

  for await (const it of listIssues()){
    const labels = it.labels?.nodes || [];
    const text = `${it.title} ${it.description || ""}`.toLowerCase();
    const isStretchy = /jenkins|github actions|gha\b/.test(text);
    const wk = weekFromExistingLabel(labels) ?? weekFromTitle(it.title) ?? null;

    if (isStretchy) {
      stretch.push(it);
      continue;
    }
    const w = wk ?? 1;
    if (!buckets.has(w)) buckets.set(w, []);
    buckets.get(w)!.push(it);
  }

  const entries = [...buckets.entries()].sort((a,b)=>a[0]-b[0]);
  const [startW, endW] = range ?? [1,16];

  for (const [week, arr] of entries){
    if (week < startW || week > endW) continue;

    // sort by "importance" then identifier
    arr.sort((a,b)=> rankWithinWeek(a.title) - rankWithinWeek(b.title) || a.identifier.localeCompare(b.identifier));

    const weekStart = weeks[week - 1];
    const label = `week-${week}`;
    const maxItems = week === 15 ? 20 : 10;

    const inScope = arr.slice(0, maxItems);
    const overflow = arr.slice(maxItems);
    stretch.push(...overflow);

    for (const it of inScope){
      const labels  = it.labels?.nodes || [];
      const have    = new Set(labels.map(l => l.name));
      const want    = new Set<string>([label, phaseFromWeek(week), ...inferTopicLabels(it.title)]);

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
        await sleep(20);
      }

      // Due date = start of week (as requested)
      const dueISO  = weekStart;

      const needTemplate = !it.description || !/## Goal/i.test(it.description);
      const finalDesc = needTemplate ? detailTemplateFor(it.title, [...want]) : it.description;

      await updateIssue(it.id, {
        ...(addIds.length ? { addedLabelIds: addIds } : {}),
        ...(toRemoveIds.length ? { removedLabelIds: toRemoveIds } : {}),
        dueDate: dueISO,
        ...(finalDesc !== it.description ? { description: finalDesc } : {}),
      });

      // Normalize states if requested (keep non-today in backlog-like)
      const tzToday = todayISO(TZ);
      if (NORMALIZE && todo && it.state?.id === todo.id && dueISO !== tzToday && backlog){
        await updateIssue(it.id, { stateId: backlog.id });
      }
      if (dueISO === tzToday && backlog && it.state?.id === backlog.id && todo){
        await updateIssue(it.id, { stateId: todo.id });
      }
    }
  }

  // Process stretch: remove week-*, clear dueDate, add stretch label
  for (const it of stretch){
    const labels = it.labels?.nodes || [];
    const have = new Set(labels.map(l => l.name));

    const toRemoveIds = labels
      .filter(l => /^week-\d+$/.test(l.name))
      .map(l => l.id);

    const addIds: string[] = [];
    if (!have.has("stretch")){
      const id = await getOrCreateLabelId(teamIdID, teamIdString, "stretch");
      addIds.push(id);
    }

    await updateIssue(it.id, {
      ...(addIds.length ? { addedLabelIds: addIds } : {}),
      ...(toRemoveIds.length ? { removedLabelIds: toRemoveIds } : {}),
      dueDate: null,
    });
    await sleep(15);
  }
}

// Compose a week-at-a-glance (YYYY-MM-DD -> Issue[])
export async function fetchWeeklyPlan(): Promise<WeeklyPlan> {
  const weekly: WeeklyPlan = {};
  const all: IssueNode[] = [];
  for await (const it of listIssues()) all.push(it);

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
    // For planning display we still show a spread by CAP, even though dueDate is start-of-week
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
  const teamIdID: string     = await resolveTeamId();
  const teamIdString: string = teamIdID;
  const { backlog, todo } = await lookupStates(teamIdString);
  if (!todo || !backlog) return;

  const today = todayISO(TZ);
  for await (const it of listIssues()){
    if (it.dueDate === today && it.state?.id === backlog.id){
      await updateIssue(it.id, { stateId: todo.id });
      await sleep(25);
    }
  }
}

// Fetch a tidy list for Slack “today” checklist (after move)
export async function fetchTodayChecklist(){
  const today = todayISO(TZ);
  const out: { id:string; identifier:string; title:string; url?:string|null }[] = [];
  for await (const it of listIssues()){
    if (it.dueDate === today){
      out.push({ id: it.id, identifier: it.identifier, title: it.title, url: it.url ?? null });
    }
  }
  out.sort((a,b)=> a.title.localeCompare(b.title));
  return out;
}
