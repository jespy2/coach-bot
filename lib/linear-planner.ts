// ----- Types -----
type LinearIssue = { id: string; title: string; estimate?: number | null };
type LinearState = { id: string; name: string };

export type WeeklyItem = { id: string; title: string; dueDate: string };
export type WeeklyPlan = Record<string, WeeklyItem[]>; // keyed by YYYY-MM-DD

// ----- GraphQL base -----
const API = "https://api.linear.app/graphql";
const HEADERS = {
  Authorization: process.env.LINEAR_API_KEY || "",
  "Content-Type": "application/json",
};

function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function gql(query: string, variables: any = {}) {
  const res = await fetch(API, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

// ----- Workflow state helpers -----
export async function getStates(): Promise<LinearState[]> {
  const q = `
    query($tid:ID!){
      workflowStates(first:50, filter:{ team:{ id:{ eq:$tid }}}){
        nodes{ id name }
      }
    }`;
  const d = await gql(q, { tid: process.env.LINEAR_TEAM_ID });
  return d.workflowStates.nodes;
}

export async function getStateIdByName(name: string): Promise<string | null> {
  const states = await getStates();
  return (
    states.find((s) => s.name.toLowerCase() === name.toLowerCase())?.id || null
  );
}

// ----- Backlog fetchers -----
/** Generic backlog (not Done/In Progress/Todo/Blocked) ordered by updatedAt */
export async function fetchBacklog(limit = 50): Promise<LinearIssue[]> {
  const q = `
    query($tid:ID!,$n:Int!){
      issues(
        first:$n,
        filter:{
          team:{ id:{ eq:$tid } },
          state:{ name:{ nin:["Done","In Progress","Todo (Today)","Todo","Blocked"] } }
        },
        orderBy: updatedAt
      ){
        nodes{ id title estimate }
      }
    }`;
  const d = await gql(q, { tid: process.env.LINEAR_TEAM_ID, n: limit });
  return d.issues.nodes;
}

/** Backlog limited to a specific week label (e.g., week-3), ordered by createdAt */
export async function fetchBacklogForWeek(
  teamId: string,
  weekNum: number
): Promise<LinearIssue[]> {
  const weekLabel = `week-${weekNum}`;
  const q = `
    query($tid:ID!,$label:String!){
      issues(
        first:200,
        filter:{
          team:{ id:{ eq:$tid } },
          labels:{ some:{ name:{ eq:$label } } },
          state:{ name:{ nin:["Done","Canceled","Duplicate"] } }
        },
        orderBy: createdAt
      ){
        nodes{ id title estimate }
      }
    }`;
  const d = await gql(q, { tid: teamId, label: weekLabel });
  return d.issues.nodes;
}

// ----- Mutations -----
export async function moveIssuesToState(issueIds: string[], stateId: string) {
  if (!issueIds.length || !stateId) return;
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

// --- Estimates (hours) helpers ---

export async function setEstimate(issueId: string, estimateHours: number) {
  const q = `
    mutation($id:String!, $est:Int){
      issueUpdate(id:$id, input:{ estimate:$est }){ success }
    }`;
  await gql(q, { id: issueId, est: Math.max(0, Math.round(estimateHours)) });
}

/** Sum of estimates (hours) for a set of issues */
export function sumEstimates(issues: { estimate?: number | null }[]) {
  return issues.reduce((acc, i) => acc + (i.estimate || 0), 0);
}

// ----- Date/week helpers (program start, blackout weeks, weekdays) -----
function mondayOf(d: Date) {
  const x = new Date(d);
  const day = x.getDay(); // 0 Sun .. 6 Sat
  const diff = day === 0 ? -6 : 1 - day; // back to Monday
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseISODate(s: string) {
  return new Date(`${s}T00:00:00`);
}

function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function getBlackoutMondays(): string[] {
  const raw = (process.env.BLACKOUT_WEEKS || "").trim();
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

/**
 * Compute the "program week number" for 'today' counting from PROGRAM_START_DATE,
 * skipping any weeks whose Monday is listed in BLACKOUT_WEEKS.
 * Week numbers start at 1.
 */
export function currentProgramWeek(
  startISO = process.env.PROGRAM_START_DATE
): number {
  const start = startISO ? parseISODate(startISO) : new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Week 1 = week containing PROGRAM_START_DATE
  const firstMonday = mondayOf(start);
  const thisMonday = mondayOf(today);

  const blackout = new Set(getBlackoutMondays());
  let count = 0;
  for (let d = new Date(firstMonday); d <= thisMonday; d.setDate(d.getDate() + 7)) {
    const mondayStr = fmtDate(d);
    if (blackout.has(mondayStr)) continue; // skip blackout week entirely
    count++;
  }
  return Math.max(1, count);
}

/**
 * Generate up to 5 working days (Mon–Fri) for the current week,
 * starting from 'startFrom' (e.g., Tue for first partial week),
 * returning [] if the entire week is a blackout.
 */
function workingDaysThisWeek(startFrom?: Date): Date[] {
  const anchor = startFrom ? new Date(startFrom) : new Date();
  anchor.setHours(0, 0, 0, 0);

  const thisMon = mondayOf(anchor);
  const weekMonStr = fmtDate(thisMon);
  const blackout = new Set(getBlackoutMondays());
  if (blackout.has(weekMonStr)) return []; // entire week off

  const days: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(thisMon);
    d.setDate(thisMon.getDate() + i);
    if (startFrom && d < anchor) continue; // handle Tue start in Week 1
    days.push(d);
  }
  return days;
}

// ----- Weekly planning (week-label aware + blackout + Tue start) -----
export async function planWeek(
  capacityPerDay = Number(process.env.PLANNER_CAPACITY_PER_DAY || 3)
): Promise<{ scheduled: { id: string; title: string; due: string }[] }> {
  const teamId = process.env.LINEAR_TEAM_ID!;
  const weekNum = currentProgramWeek(process.env.PROGRAM_START_DATE);

  // Fetch only issues for the current week label
  const backlog = await fetchBacklogForWeek(teamId, weekNum);

  // Determine start day for this week
  // Week 1 starts from PROGRAM_START_DATE (could be Tue); subsequent weeks start Monday.
  const startFrom =
    weekNum === 1 && process.env.PROGRAM_START_DATE
      ? parseISODate(process.env.PROGRAM_START_DATE)
      : new Date();
  startFrom.setHours(0, 0, 0, 0);

  // Build the working days list (skips blackout weeks)
  const days = workingDaysThisWeek(startFrom);
  if (days.length === 0) {
    // blackout week → do not schedule anything
    return { scheduled: [] };
  }

  // Pick N items/day from the week-specific backlog
  const picks: { id: string; title: string; due: string }[] = [];
  let idx = 0;
  for (const day of days) {
    for (let i = 0; i < capacityPerDay && idx < backlog.length; i++) {
      const issue = backlog[idx++];
      picks.push({ id: issue.id, title: issue.title, due: fmt(day) });
    }
  }

  // Apply due dates & move to "Todo (Today)" (fallback to "Todo")
  const todoStateId =
    (await getStateIdByName("Todo (Today)")) ||
    (await getStateIdByName("Todo")) ||
    "";

  for (const p of picks) await setDueDate(p.id, p.due);
  await moveIssuesToState(
    picks.map((x) => x.id),
    todoStateId
  );

  return { scheduled: picks };
}

// ----- Morning (today) plan -----
export async function todayPlan(): Promise<{ items: { title: string; id: string }[] }> {
  const q = `
    query($tid:ID!,$today:TimelessDate){
      issues(
        first:50,
        filter:{
          team:{ id:{ eq:$tid } },
          dueDate:{ eq:$today },
          state:{ name:{ nin:["Done"] } }
        }
      ){
        nodes{ id title }
      }
    }`;
  const d = await gql(q, {
    tid: process.env.LINEAR_TEAM_ID,
    today: fmt(new Date()),
  });
  return { items: d.issues.nodes };
}

// ----- Weekly plan (read-only view of due dates Mon–Fri) -----
/**
 * Return Monday 00:00 and Friday 23:59 as TimelessDate strings (YYYY-MM-DD).
 * (We use local TZ only to choose the week window; Linear TimelessDate is TZ-agnostic.)
 */
function startOfWeekLocal(tz = process.env.PLANNER_TIMEZONE || "America/Denver") {
  // tz is not used directly here (no Intl/TZ math); it's for future enhancement.
  const now = new Date();
  const day = now.getDay(); // 0=Sun..6=Sat
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon);
  mon.setHours(0, 0, 0, 0);

  const fri = new Date(mon);
  fri.setDate(mon.getDate() + 4);
  fri.setHours(23, 59, 59, 999);

  const f = (d: Date) => d.toISOString().slice(0, 10);
  return { mon: f(mon), fri: f(fri) };
}

export async function fetchWeeklyPlan(teamId: string): Promise<WeeklyPlan> {
  const { mon, fri } = startOfWeekLocal();
  const query = `
    query($tid:ID!, $from:TimelessDate, $to:TimelessDate) {
      issues(
        first: 200,
        filter: {
          team: { id: { eq: $tid } },
          state: { name: { nin: ["Done", "Canceled", "Duplicate"] } },
          dueDate: { gte: $from, lte: $to }
        },
        orderBy: dueDate
      ) {
        nodes { id title dueDate }
      }
    }`;
  const res = await fetch(API, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      query,
      variables: { tid: teamId, from: mon, to: fri },
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));

  const items: WeeklyItem[] = (json.data?.issues?.nodes ?? [])
    .filter((n: any) => !!n.dueDate)
    .map((n: any) => ({ id: n.id, title: n.title, dueDate: n.dueDate }));

  // group by dueDate (YYYY-MM-DD)
  const map: WeeklyPlan = {};
  for (const it of items) {
    map[it.dueDate] = map[it.dueDate] || [];
    map[it.dueDate].push(it);
  }
  return map;
}
