const API = "https://api.linear.app/graphql";
const HEADERS = {
  Authorization: process.env.LINEAR_API_KEY || "",
  "Content-Type": "application/json",
};

function fmt(d: Date) { return d.toISOString().slice(0,10); }
function mondayOf(d: Date) {
  const x = new Date(d); x.setHours(0,0,0,0);
  const wd = x.getDay(); const diff = wd === 0 ? -6 : 1 - wd;
  x.setDate(x.getDate() + diff);
  return x;
}

async function gql(query: string, variables: any = {}) {
  const res = await fetch(API, { method: "POST", headers: HEADERS, body: JSON.stringify({ query, variables }) });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

/**
 * Fetch issues Done in [from..to] for a team, with estimate.
 */
export async function fetchDoneInRange(teamId: string, fromISO: string, toISO: string) {
  const q = `
    query($tid:ID!, $from:TimelessDate, $to:TimelessDate){
      issues(
        first: 250,
        orderBy: completedAt,
        filter:{
          team:{ id:{ eq:$tid } },
          state:{ name:{ eq:"Done" } },
          completedAt:{ gte:$from, lte:$to }
        }
      ){
        nodes{ id title estimate completedAt }
        pageInfo{ hasNextPage endCursor }
      }
    }`;

  let all:any[] = [], after:string|null = null;
  // Paginate (Linear caps first at 250)
  while (true) {
    const d = await gql(q, { tid: teamId, from: fromISO, to: toISO, after });
    all.push(...d.issues.nodes);
    if (!d.issues.pageInfo?.hasNextPage) break;
    after = d.issues.pageInfo.endCursor;
  }
  return all;
}

/**
 * Group done issues by Monday-of-week (local-ish) and sum estimates.
 */
export function groupVelocityByWeek(issues: { completedAt: string, estimate?: number|null }[]) {
  const buckets: Record<string, number> = {};
  for (const it of issues) {
    const d = new Date(it.completedAt); d.setHours(0,0,0,0);
    const mon = mondayOf(d);
    const k = fmt(mon);
    buckets[k] = (buckets[k] || 0) + (it.estimate || 0);
  }
  return buckets;
}

export function averageVelocity(weeks: number[]): number {
  if (!weeks.length) return 0;
  const sum = weeks.reduce((a,b)=>a+b,0);
  return Math.round((sum / weeks.length) * 10) / 10; // 0.1h precision
}
