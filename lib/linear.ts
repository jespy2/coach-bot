type LinearIssue = {
  id: string;
  identifier: string;
  title: string;
  url?: string;
};

// TZ and week schedule
const TZ = process.env.TIMEZONE || "America/Denver";
const WED_START = "2025-08-20";   // Week 1 starts on Wednesday
const FIRST_MONDAY = "2025-08-25"; // Weeks 2+ start on Mondays

// Local helpers (scoped here to avoid conflicts)
function todayISO(tz = TZ) {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
  });
  const p = fmt.formatToParts(now).reduce((a, b) => ((a[b.type] = b.value), a), {} as any);
  return `${p.year}-${p.month}-${p.day}`;
}

// Compute the *current* week label for a given ISO date.
// Week 1: Wed 2025-08-20 .. Sun 2025-08-24
// Weeks 2+: each Monday from 2025-08-25
function currentWeekLabelFor(dateISO: string): string {
  if (dateISO < FIRST_MONDAY) return "week-1";
  const base = new Date(`${FIRST_MONDAY}T00:00:00Z`);
  const t = new Date(`${dateISO}T00:00:00Z`);
  const days = Math.floor((t.getTime() - base.getTime()) / 86400000);
  const weeksSince = Math.floor(days / 7); // 0 => week-2, 1 => week-3, ...
  const weekNum = 2 + weeksSince;
  return `week-${weekNum}`;
}

// ⬇️ Drop-in replacement
export async function fetchTodayTasks(teamId: string) {
  const today = todayISO(TZ);
  const weekLabel = currentWeekLabelFor(today);

  // 1) Look up the label id for the current week (faster filter via id if present)
  const qLabel = /* GraphQL */ `
    query($tid: ID!, $name: String!) {
      issueLabels(first: 1, filter:{ team:{ id:{ eq:$tid } }, name:{ eq:$name } }) {
        nodes { id name }
      }
    }
  `;
  const dLabel = await gql(qLabel, { tid: teamId, name: weekLabel });
  const weekLabelId = dLabel.issueLabels?.nodes?.[0]?.id ?? null;

  // 2) Pull issues due exactly today (keep page size generous; we filter by label in JS)
  const qIssues = /* GraphQL */ `
    query($tid: ID!, $today: TimelessDate, $after: String) {
      issues(
        filter:{
          team: { id: { eq: $tid } }
          archivedAt: { null: true }
          dueDate: { eq: $today }
        }
        first: 100
        after: $after
      ) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id identifier title url
          labels { nodes { id name } }
          state { id name type }
        }
      }
    }
  `;

  let after: string | null = null;
  const out: Array<{ id: string; identifier: string; title: string; url?: string }> = [];

  do {
    const d = await gql(qIssues, { tid: teamId, today, after });
    const nodes = d.issues?.nodes || [];
    for (const n of nodes) {
      // Must belong to the *current* week
      const hasWeek = weekLabelId
        ? n.labels?.nodes?.some((l: any) => l.id === weekLabelId)
        : n.labels?.nodes?.some((l: any) => l.name === weekLabel); // fallback by name
      if (hasWeek) out.push({ id: n.id, identifier: n.identifier, title: n.title, url: n.url });
    }
    after = d.issues?.pageInfo?.hasNextPage ? d.issues.pageInfo.endCursor : null;
  } while (after);

  return out;
}

  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      Authorization: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { tid: teamId } }),
    // Optional: be gentle with Linear’s WAF
    // @ts-ignore
    cache: "no-store",
  });

  // If the call fails, return an empty list so callers can handle gracefully
  if (!res.ok) return [];

  const json = await res.json().catch(() => ({}));

  const nodes: any[] = json?.data?.issues?.nodes ?? [];

  // Map to our typed shape and keep a safe fallback for url
  return nodes.map((n) => ({
    id: n.id,
    identifier: n.identifier,
    title: n.title,
    url: n.url || (n.identifier ? `https://linear.app/issue/${n.identifier}` : undefined),
  }));
}
