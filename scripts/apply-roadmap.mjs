// scripts/apply-roadmap.mjs
// Labels issues by week/phase/topic, sets due dates from START_DATE/PROGRAM_START_DATE,
// and moves due-today items Source -> Todo. Idempotent; safe to re-run.
//
// ENV (put in .env.local or pass inline):
//   LINEAR_API_KEY=...                (required)
//   LINEAR_TEAM_ID=...                (required)
//   START_DATE=YYYY-MM-DD             (or PROGRAM_START_DATE=YYYY-MM-DD) required unless ONLY_MOVE_TODAY=1
//   DRY_RUN=1                         (preview; no writes)
//   ONLY_MOVE_TODAY=1                 (skip labeling/dating; only move due-today)
//   ITEMS_PER_WEEK=10                 (default 10)
//   TIMEZONE=America/Denver           (default America/Denver)
//   SOURCE_STATE_NAME=Inbox           (optional override if no Backlog column)
//   DEST_STATE_NAME="Todo (Today)"    (optional override for destination column)
//   NORMALIZE_STATES=1                (optional one-time cleanup: push non-today items out of destination)

const API = "https://api.linear.app/graphql";
const KEY = process.env.LINEAR_API_KEY;
const TEAM = process.env.LINEAR_TEAM_ID;
// Accept either START_DATE or PROGRAM_START_DATE
const START_DATE = process.env.START_DATE || process.env.PROGRAM_START_DATE; // YYYY-MM-DD
const DRY_RUN = process.env.DRY_RUN === "1";
const ONLY_MOVE_TODAY = process.env.ONLY_MOVE_TODAY === "1";
const ITEMS_PER_WEEK = Number(process.env.ITEMS_PER_WEEK || "10");
const TZ = process.env.TIMEZONE || "America/Denver";

const SOURCE_STATE_NAME = (process.env.SOURCE_STATE_NAME || "").toLowerCase() || null;
const DEST_STATE_NAME   = (process.env.DEST_STATE_NAME   || "").toLowerCase() || null;
const NORMALIZE_STATES  = process.env.NORMALIZE_STATES === "1";

if (!KEY || !TEAM) {
  console.error("Set LINEAR_API_KEY and LINEAR_TEAM_ID");
  process.exit(1);
}
if (!START_DATE && !ONLY_MOVE_TODAY) {
  console.error("Set START_DATE=YYYY-MM-DD (or PROGRAM_START_DATE) or use ONLY_MOVE_TODAY=1");
  process.exit(1);
}

const H = { Authorization: KEY, "Content-Type": "application/json" };
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));

// ----- Date helpers -----
function todayISO(tz=TZ) {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year:'numeric', month:'2-digit', day:'2-digit'});
  const parts = Object.fromEntries(fmt.formatToParts(now).map(x=>[x.type,x.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
function addDays(iso, days) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0,10);
}
function weekFromIndex(idx, itemsPerWeek=ITEMS_PER_WEEK) {
  return Math.floor(idx / itemsPerWeek) + 1; // 1-based
}
function phaseFromWeek(week) {
  if (week >=1 && week <=8) return "phase-1";
  if (week >=9 && week <=16) return "phase-2";
  return "phase-unknown";
}

// ----- Week focus (for optional description header) -----
const weekFocus = {
  1: "TypeScript Review",
  2: "Next.js Fundamentals",
  3: "DevOps Fundamentals (CI/CD, Pipelines)",
  4: "AWS Basics + IAM",
  5: "Containers (Docker + ECS)",
  6: "Infrastructure as Code (Terraform)",
  7: "Observability (CloudWatch, Logs)",
  8: "Review + Applied Practice",
  9: "Practice Projects & Test Simulations",
  10: "Practice Projects & Test Simulations",
  11: "Practice Projects & Test Simulations",
  12: "Practice Projects & Test Simulations",
  13: "Deep Dives & Final Review",
  14: "Deep Dives & Final Review",
  15: "Deep Dives & Final Review",
  16: "Final Projects, Wrap-Up & Presentation",
};

// ----- Title→Week rules (content-aware assignment) -----
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
function weekFromExistingLabels(labels = []) {
  const wk = labels.find(l => /^week-(\d+)$/.test(l.name));
  return wk ? Number(wk.name.split("-")[1]) : null;
}

// ----- Topic labels -----
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
function inferTopicLabels(title) {
  const out = new Set();
  for (const { rx, labels } of topicMatchers) if (rx.test(title)) labels.forEach(l=>out.add(l));
  return [...out];
}

// ----- GraphQL helpers -----
async function gql(query, variables={}) {
  const r = await fetch(API, { method:"POST", headers:H, body: JSON.stringify({query, variables}) });
  const j = await r.json();
  if (j.errors) {
    console.error("GraphQL errors:", JSON.stringify(j.errors, null, 2));
    throw new Error("GraphQL error");
  }
  return j.data;
}

async function* listIssues(teamId, pageSize = 80) {
  // ID! for IssueFilter.team.id.eq
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
          id
          number
          identifier
          title
          description
          dueDate
          estimate
          labels { nodes { id name } }
          state { id name type }
        }
      }
    }`;
    const d = await gql(q, { teamId, after });
    for (const n of d.issues.nodes) yield n;
    if (!d.issues.pageInfo.hasNextPage) break;
    after = d.issues.pageInfo.endCursor;
  }
}

async function getOrCreateLabelId(teamId, name) {
  // Lookup: team.id.eq expects ID!
  const q = `query($teamId: ID!, $name: String!){
    issueLabels(first: 50, filter:{ team: { id: { eq: $teamId } }, name:{ eq:$name } }) {
      nodes { id name }
    }
  }`;
  const d = await gql(q, { teamId, name });
  const existing = d.issueLabels.nodes[0];
  if (existing) return existing.id;

  // Create: mutation input.teamId expects String!
  const m = `mutation($teamId: String!, $name: String!){
    issueLabelCreate(input:{ teamId:$teamId, name:$name }){
      issueLabel { id name }
    }
  }`;
  const created = await gql(m, { teamId, name });
  return created.issueLabelCreate.issueLabel.id;
}

async function lookupStates(teamId) {
  // Team(id: …) expects String!
  const q = `query($teamId: String!){
    team(id:$teamId){
      states(first: 200) {
        nodes { id name position type }
      }
    }
  }`;
  const d = await gql(q, { teamId });
  const states = d.team.states.nodes;

  const byName = (needle) => states.find(s => s.name.toLowerCase().includes(needle));
  const backlog = byName("backlog") || states.find(s => s.type === "backlog") || null;
  const todo    = byName("todo")    || states.find(s => s.type === "unstarted") || states.find(s => s.type === "triage") || null;

  // Allow explicit overrides via env
  let source = backlog;
  if (SOURCE_STATE_NAME) {
    source = states.find(s => s.name.toLowerCase().includes(SOURCE_STATE_NAME)) || source;
  }
  let dest = todo;
  if (DEST_STATE_NAME) {
    dest = states.find(s => s.name.toLowerCase().includes(DEST_STATE_NAME)) || dest;
  }

  return { backlog: source, todo: dest, all: states };
}

async function updateIssue(id, input) {
  const m = `mutation($id:String!, $input:IssueUpdateInput!){
    issueUpdate(id:$id, input:$input){ success }
  }`;
  const d = await gql(m, { id, input });
  return d.issueUpdate?.success;
}

// ----- Main -----
async function main() {
  const tzToday = todayISO();
  const { backlog, todo } = await lookupStates(TEAM);

  if (!todo) {
    console.error("No Todo-like state found (name includes 'todo' or type unstarted/triage).");
    process.exit(1);
  }
  if (!ONLY_MOVE_TODAY && !START_DATE) {
    console.error("Set START_DATE or PROGRAM_START_DATE to schedule weeks.");
    process.exit(1);
  }

  let index = 0;
  let labeled = 0, moved = 0, dated = 0;

  // Track the next day slot within each week (0..6) to keep dates inside their week
  const weekDayCursor = new Map(); // week -> 0..6

  for await (const it of listIssues(TEAM, 80)) {
    // 1) compute intended week/due date (unless ONLY_MOVE_TODAY)
    let week, dueISO;
    if (!ONLY_MOVE_TODAY) {
      // choose week: existing label → title rule → index fallback
      const wkFromLabel = weekFromExistingLabels(it.labels?.nodes || []);
      const wkFromTitle = weekFromTitle(it.title);
      week = wkFromLabel || wkFromTitle || weekFromIndex(index, ITEMS_PER_WEEK);

      const phase = phaseFromWeek(week);
      const weekLabel = `week-${week}`;
      const phaseLabel = phase;

      // keep dates inside the assigned week (0..6 within that week)
      const cursor = weekDayCursor.get(week) || 0;           // 0..6
      const dayOffset = (week - 1) * 7 + cursor;
      weekDayCursor.set(week, (cursor + 1) % 7);             // advance for next issue in same week

      dueISO = addDays(START_DATE, dayOffset);

      // build label set
      const have = new Set((it.labels?.nodes || []).map(l=>l.name));
      const need = new Set([weekLabel, phaseLabel, ...inferTopicLabels(it.title)]);
      const toAdd = [...need].filter(n => !have.has(n));

      // resolve label ids
      const addedLabelIds = [];
      for (const name of toAdd) {
        const id = await getOrCreateLabelId(TEAM, name);
        addedLabelIds.push(id);
        await sleep(60);
      }

      // patch description with focus stanza (optional)
      let description = it.description || "";
      if (!description.includes("**Roadmap:**") && weekFocus[week]) {
        description = `**Roadmap:** Week ${week} – ${weekFocus[week]}\n\n` + description;
      }

      if (DRY_RUN) {
        const why = wkFromLabel ? "existing label" : (wkFromTitle ? "title rule" : "index");
        console.log(`PLAN ${it.identifier} -> week=${week} (${why}) due=${dueISO} add=[${toAdd.join(", ")}]`);
      } else {
        const input = {
          ...(addedLabelIds.length ? { addedLabelIds } : {}),
          ...(dueISO ? { dueDate: dueISO } : {}),
          ...(description !== it.description ? { description } : {}),
        };
        if (Object.keys(input).length) {
          const ok = await updateIssue(it.id, input);
          if (ok) { if (addedLabelIds.length) labeled++; if (dueISO) dated++; }
          await sleep(120);
        }
      }
    }

    const due = it.dueDate || dueISO;

    // One-time normalization: push anything NOT due today out of destination lane back to source
    if (NORMALIZE_STATES && !DRY_RUN && due !== tzToday && todo && it.state?.id === todo.id) {
      if (backlog) {
        const ok = await updateIssue(it.id, { stateId: backlog.id });
        if (ok) moved++;
        await sleep(100);
      }
    }

    // 2) move due-today from Source(Backlog) -> Todo (strict guard)
    const isDueToday = (it.dueDate || dueISO) === tzToday;
    const inBacklog = !!(backlog && it.state?.id === backlog.id);
    const alreadyTodo = !!(todo && it.state?.id === todo.id);

    if (DRY_RUN) {
      console.log(`MOVE? ${it.identifier}: due=${it.dueDate||dueISO} today=${isDueToday} fromSource=${inBacklog} alreadyDest=${alreadyTodo}`);
    } else if (isDueToday && inBacklog && !alreadyTodo) {
      const ok = await updateIssue(it.id, { stateId: todo.id });
      if (ok) moved++;
      await sleep(120);
    }

    index++;
  }

  console.log(
    DRY_RUN
      ? "Done (plan only)."
      : `Done. Labeled ${labeled} issues, set due dates on ${dated}, moved ${moved} to Todo.`
  );
}

main().catch(e=>{ console.error(e); process.exit(1); });
