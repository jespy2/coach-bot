// scripts/check-roadmap.mjs
// Read-only verifier: compares issues in Linear to your 16-week roadmap.
// No writes. Prints a simple report with mismatches.
//
// ENV: LINEAR_API_KEY, LINEAR_TEAM_ID, START_DATE (or PROGRAM_START_DATE), TIMEZONE (default America/Denver)

const API = "https://api.linear.app/graphql";
const KEY = process.env.LINEAR_API_KEY;
const TEAM = process.env.LINEAR_TEAM_ID;
const START_DATE = process.env.START_DATE || process.env.PROGRAM_START_DATE; // YYYY-MM-DD
const TZ = process.env.TIMEZONE || "America/Denver";

if (!KEY || !TEAM) {
  console.error("Set LINEAR_API_KEY and LINEAR_TEAM_ID");
  process.exit(1);
}
if (!START_DATE) {
  console.error("Set START_DATE=YYYY-MM-DD (or PROGRAM_START_DATE)");
  process.exit(1);
}

const H = { Authorization: KEY, "Content-Type": "application/json" };

// ---- helpers ----
function addDays(iso, days) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0,10);
}
function weekFromIndex(idx, itemsPerWeek = 10) {
  return Math.floor(idx / itemsPerWeek) + 1;
}
function phaseFromWeek(week) {
  if (week >=1 && week <=8) return "phase-1";
  if (week >=9 && week <=16) return "phase-2";
  return "phase-unknown";
}

// Roadmap title→week rules (content-aware)
const roadmapRules = [
  { week: 1,  rx: /\btypescript|\bts\b/i },
  { week: 2,  rx: /\bnext(?:\.js)?|app router|rsc\b/i },
  { week: 3,  rx: /\bci\/?cd|pipeline|github actions|workflows?\b/i },
  { week: 4,  rx: /\baws|iam|s3|ec2|lambda|cloudformation\b/i },
  { week: 5,  rx: /\b(docker|container|ecs|ecr)\b/i },
  { week: 6,  rx: /\bterraform|iac\b/i },
  { week: 7,  rx: /\bobservability|cloudwatch|metrics|logs?\b/i },
  { week: 8,  rx: /\breview|applied practice|refactor\b/i },
  { week: 9,  rx: /\b(simulation|mock|practice test|sample exam)\b/i },
  { week: 10, rx: /\b(simulation|mock|practice test|sample exam)\b/i },
  { week: 11, rx: /\b(simulation|mock|practice test|sample exam)\b/i },
  { week: 12, rx: /\b(simulation|mock|practice test|sample exam)\b/i },
  { week: 13, rx: /\bdeep dive|advanced\b/i },
  { week: 14, rx: /\bdeep dive|advanced\b/i },
  { week: 15, rx: /\bdeep dive|final review\b/i },
  { week: 16, rx: /\bfinal|production|wrap[- ]?up|presentation|deploy.*production|final project\b/i },
];

function weekFromTitle(title) {
  for (const rule of roadmapRules) if (rule.rx.test(title)) return rule.week;
  return null;
}
function weekFromExisting(labels = []) {
  const wk = labels.find(l => /^week-(\d+)$/.test(l.name));
  return wk ? Number(wk.name.split("-")[1]) : null;
}

async function gql(query, variables={}) {
  const r = await fetch(API, { method:"POST", headers:H, body: JSON.stringify({query, variables}) });
  const j = await r.json();
  if (j.errors) {
    console.error("GraphQL errors:", JSON.stringify(j.errors, null, 2));
    throw new Error("GraphQL error");
  }
  return j.data;
}

async function* listIssues(teamId, pageSize=200) {
  let after = null;
  while (true) {
    const q = `query($teamId: ID!, $after: String) {
      issues(
        filter: { team: { id: { eq: $teamId } }, archivedAt: { null: true } }
        first: ${pageSize}
        after: $after
      ) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id identifier title dueDate
          state { id name type }
          labels { nodes { id name } }
        }
      }
    }`;
    const d = await gql(q, { teamId, after });
    for (const n of d.issues.nodes) yield n;
    if (!d.issues.pageInfo.hasNextPage) break;
    after = d.issues.pageInfo.endCursor;
  }
}

function windowForWeek(w) {
  // 7-day window starting at START_DATE + 7*(w-1)
  const start = addDays(START_DATE, (w-1)*7);
  const end   = addDays(start, 6);
  return { start, end };
}

function inWindow(dateISO, { start, end }) {
  return dateISO >= start && dateISO <= end;
}

(async function main() {
  const issues = [];
  let idx = 0;
  for await (const it of listIssues(TEAM)) {
    const labels = it.labels?.nodes || [];
    const wkLabel = weekFromExisting(labels);
    const wkTitle = weekFromTitle(it.title);
    const wkIndex = weekFromIndex(idx, 10);
    const expectedWeek = wkLabel || wkTitle || wkIndex;

    const win = windowForWeek(expectedWeek);
    const okDue = it.dueDate ? inWindow(it.dueDate, win) : false;
    const expectedPhase = phaseFromWeek(expectedWeek);

    issues.push({
      id: it.id,
      identifier: it.identifier,
      title: it.title,
      state: it.state?.name || "(no state)",
      dueDate: it.dueDate || "(none)",
      expectedWeek,
      expectedPhase,
      windowStart: win.start,
      windowEnd: win.end,
      weekFromLabel: wkLabel || null,
      weekFromTitle: wkTitle || null,
      weekFromIndex: wkIndex,
      dueOk: okDue,
    });
    idx++;
  }

  // Print mismatches first
  const mismatches = issues.filter(i => !(i.dueOk));
  if (mismatches.length) {
    console.log("== Due date mismatches (issue not within expected week window) ==");
    for (const m of mismatches) {
      console.log(
        `${m.identifier} | ${m.state} | due=${m.dueDate} | expected week=${m.expectedWeek} (${m.windowStart}..${m.windowEnd}) | title="${m.title}"`
      );
    }
  } else {
    console.log("All issue due dates are within their expected week windows ✅");
  }

  // Small summary
  const byWeek = new Map();
  for (const i of issues) byWeek.set(i.expectedWeek, (byWeek.get(i.expectedWeek)||0)+1);
  console.log("\n== Counts by expected week ==");
  [...byWeek.entries()].sort((a,b)=>a[0]-b[0]).forEach(([w,c])=>{
    console.log(`Week ${w}: ${c}`);
  });

  console.log("\nChecked", issues.length, "issues. START_DATE =", START_DATE, "TZ =", TZ);
})().catch(e=>{ console.error(e); process.exit(1); });
