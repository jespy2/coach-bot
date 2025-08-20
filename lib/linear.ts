// lib/linear.ts

// ===== Types =====
export type LinearIssue = {
  id: string;
  identifier: string;
  title: string;
  url?: string;
};

// ===== Env / Config =====
const API = "https://api.linear.app/graphql";
const KEY = process.env.LINEAR_API_KEY || "";

// Timezone (use your repo’s env key)
const TZ = process.env.PLANNER_TIMEZONE || "America/Denver";

// Program schedule
// Week 1 starts on this Wednesday (e.g. 2025-08-20); Weeks 2+ start on each Monday after that.
const WED_START = process.env.PROGRAM_START_DATE || "2025-08-20";

// ===== Date Helpers =====
function dateToISO(d: Date) {
  return d.toISOString().slice(0, 10);
}
function isoToDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`);
}

function nextMondayAfter(iso: string): string {
  // Find the first Monday strictly AFTER the given date (for Week 2 start)
  const d = isoToDate(iso);
  // advance at least 1 day to be "after"
  d.setUTCDate(d.getUTCDate() + 1);
  while (d.getUTCDay() !== 1) {
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return dateToISO(d);
}

function todayISO(tz = TZ) {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/**
 * Compute the *current* week label for a given ISO date.
 * - Week 1: Wed PROGRAM_START_DATE .. the following Sunday
 * - Weeks 2+: each Monday (the first Monday strictly *after* PROGRAM_START_DATE)
 * Returns "week-N".
 */
export function currentWeekLabelFor(dateISO: string): string {
  const firstMonday = nextMondayAfter(WED_START);

  // Before the program start => clamp to week-1
  if (dateISO < WED_START) return "week-1";

  // From WED_START up to (but not including) firstMonday is week-1
  if (dateISO < firstMonday) return "week-1";

  // Weeks 2+ roll every 7 days starting from firstMonday
  const base = isoToDate(firstMonday); // Monday start of Week 2
  const t = isoToDate(dateISO);
  const days = Math.floor((t.getTime() - base.getTime()) / 86400000);
  const weeksSince = Math.floor(days / 7); // 0 => week-2, 1 => week-3, ...
  const weekNum = 2 + weeksSince;
  return `week-${weekNum}`;
}

// ===== GraphQL Helper =====
async function gql<T = any>(query: string, variables: Record<string, any>): Promise<T> {
  if (!KEY) throw new Error("Missing LINEAR_API_KEY");

  const res = await fetch(API, {
    method: "POST",
    headers: {
      Authorization: KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    // be gentle with WAF/caching
    // @ts-ignore
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.errors) {
    // eslint-disable-next-line no-console
    console.error("Linear GraphQL error:", JSON.stringify(json?.errors || { status: res.status }, null, 2));
    throw new Error("Linear GraphQL request failed");
  }
  return json.data as T;
}

// ===== Public API =====

/**
 * Fetch issues due *today* (in PLANNER_TIMEZONE) that also belong to the *current* week.
 * - Uses $tid: ID! for team filter.
 * - Paginates up to 100 per page.
 */
export async function fetchTodayTasks(teamId: string): Promise<LinearIssue[]> {
  if (!teamId) return [];

  const today = todayISO(TZ);
  const weekLabel = currentWeekLabelFor(today);

  // 1) Look up the label id for the current week (prefer id for faster comparisons)
  const qLabel = /* GraphQL */ `
    query($tid: ID!, $name: String!) {
      issueLabels(
        first: 1
        filter: { team: { id: { eq: $tid } }, name: { eq: $name } }
      ) {
        nodes { id name }
      }
    }
  `;
  const dLabel = await gql(qLabel, { tid: teamId, name: weekLabel });
  const weekLabelId: string | null = dLabel?.issueLabels?.nodes?.[0]?.id ?? null;

  // 2) Pull issues due exactly today (we’ll filter to the current week via labels)
  const qIssues = /* GraphQL */ `
    query($tid: ID!, $today: TimelessDate, $after: String) {
      issues(
        filter: {
          team: { id: { eq: $tid } }
          archivedAt: { null: true }
          dueDate: { eq: $today }
        }
        first: 100
        after: $after
      ) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          identifier
          title
          url
          labels { nodes { id name } }
          state { id name type }
        }
      }
    }
  `;

  const out: LinearIssue[] = [];
  let after: string | null = null;

  do {
    const d = await gql(qIssues, { tid: teamId, today, after });
    const nodes = d?.issues?.nodes ?? [];

    for (const n of nodes) {
      const labels = n?.labels?.nodes ?? [];
      const inWeek = weekLabelId
        ? labels.some((l: any) => l.id === weekLabelId)
        : labels.some((l: any) => l.name === weekLabel); // fallback by name if id not found

      if (inWeek) {
        out.push({
          id: n.id,
          identifier: n.identifier,
          title: n.title,
          url: n.url || (n.identifier ? `https://linear.app/issue/${n.identifier}` : undefined),
        });
      }
    }

    const pageInfo = d?.issues?.pageInfo;
    after = pageInfo?.hasNextPage ? pageInfo.endCursor : null;
  } while (after);

  return out;
}

/**
 * Optional helper: find a “Todo-like” state (by name or type).
 * Useful if your API route wants to move items before listing them.
 */
export async function resolveTodoState(teamId: string): Promise<{ id: string; name: string } | null> {
  const q = /* GraphQL */ `
    query($teamId: String!) {
      team(id: $teamId) {
        states(first: 100) {
          nodes { id name type }
        }
      }
    }
  `;
  const d = await gql(q, { teamId });
  const states: Array<{ id: string; name: string; type: string }> = d?.team?.states?.nodes ?? [];

  const byName = (needle: string) => states.find((s) => s.name.toLowerCase().includes(needle));
  return (
    byName("todo") ||
    states.find((s) => s.type === "unstarted") ||
    states.find((s) => s.type === "triage") ||
    null
  );
}

/**
 * Optional helper: move a set of issues to a given state.
 */
export async function moveIssuesToState(issueIds: string[], stateId: string): Promise<void> {
  if (!issueIds.length) return;

  const m = /* GraphQL */ `
    mutation($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) { success }
    }
  `;

  for (const id of issueIds) {
    await gql(m, { id, input: { stateId } }).catch(() => {});
    // tiny spacing to be polite
    await new Promise((r) => setTimeout(r, 80));
  }
}
