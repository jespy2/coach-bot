// apply-roadmap.mjs
// One-pass script to (1) label by week/phase/topic, (2) set due dates from START_DATE,
// and (3) move issues Backlog -> Todo on their due date.
//
// Usage:
//   LINEAR_API_KEY=xxx LINEAR_TEAM_ID=yyy START_DATE=2025-08-25 node apply-roadmap.mjs
// Optional env:
//   DRY_RUN=1          (don't write changes)
//   ITEMS_PER_WEEK=10  (default 10)
//   TIMEZONE=America/Denver  (affects "today" calculation)
//   ONLY_MOVE_TODAY=1  (skip labeling/dating; just move due-today to Todo)
//
// Notes:
// - Backlog/Todo state ids are looked up by name (case-insensitive contains).
// - Labels are idempotent; missing labels are auto-created.
// - Topic labels inferred from issue title; extend `topicMatchers` as needed.

const API = "https://api.linear.app/graphql";
const KEY = process.env.LINEAR_API_KEY;
const TEAM = process.env.LINEAR_TEAM_ID;
const START_DATE = process.env.PROGRAM_START_DATE; // YYYY-MM-DD
const DRY_RUN = process.env.DRY_RUN === "1";
const ONLY_MOVE_TODAY = process.env.ONLY_MOVE_TODAY === "1";
const ITEMS_PER_WEEK = Number(process.env.ITEMS_PER_WEEK || "10");
const TZ = process.env.TIMEZONE || "America/Denver";

if (!KEY || !TEAM) {
  console.error("Set LINEAR_API_KEY and LINEAR_TEAM_ID");
  process.exit(1);
}
if (!START_DATE && !ONLY_MOVE_TODAY) {
  console.error("Set START_DATE=YYYY-MM-DD");
  process.exit(1);
}

const H = { Authorization: KEY, "Content-Type": "application/json" };
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));

function todayISO(tz=TZ) {
  // Make 'today' in target TZ
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year:'numeric', month:'2-digit', day:'2-digit'});
  const parts = fmt.formatToParts(now).reduce((acc, p)=> (acc[p.type]=p.value, acc), {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function addDays(iso, days) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0,10);
}

function weekFromIndex(idx, itemsPerWeek=ITEMS_PER_WEEK) {
  return Math.floor(idx / itemsPerWeek) + 1; // 1-based week number
}

function phaseFromWeek(week) {
  if (week >=1 && week <=8) return "phase-1";
  if (week >=9 && week <=16) return "phase-2";
  return "phase-unknown";
}

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

// Infer additional labels from titles
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

async function gql(query, variables={}) {
  const r = await fetch(API, { method:"POST", headers:H, body: JSON.stringify({query, variables}) });
  const j = await r.json();
  if (j.errors) {
    console.error("GraphQL errors:", JSON.stringify(j.errors, null, 2));
    throw new Error("GraphQL error");
  }
  return j.data;
}

async function* listIssues(teamId, pageSize = 50) {
  let after = null;
  while (true) {
    const q = `query($teamId: ID!, $after: String) {
      issues(
        filter: {
          team: { id: { eq: $teamId } }
          archivedAt: { null: true }
        }
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
    const nodes = d.issues.nodes;
    for (const n of nodes) yield n;
    if (!d.issues.pageInfo.hasNextPage) break;
    after = d.issues.pageInfo.endCursor;
  }
}

async function getOrCreateLabelId(teamId, name) {
  // 1) Look up by team (ID!) + exact name
  const q = `query($teamId: ID!, $name: String!){
    issueLabels(
      first: 50,
      filter:{ team: { id: { eq: $teamId } }, name:{ eq:$name } }
    ) {
      nodes { id name }
    }
  }`;
  const d = await gql(q, { teamId, name });
  const existing = d.issueLabels.nodes[0];
  if (existing) return existing.id;

  // 2) Create label (mutation expects teamId: String)
  const m = `mutation($teamId: String!, $name: String!){
    issueLabelCreate(input:{ teamId:$teamId, name:$name }){
      issueLabel { id name }
    }
  }`;
  const created = await gql(m, { teamId, name });
  return created.issueLabelCreate.issueLabel.id;
}

async function lookupStates(teamId) {
  const q = `query($teamId: String!){
    team(id:$teamId){
      states(first: 100) {
        nodes {
          id
          name
          position
          type   # backlog | unstarted | triage | started | completed | canceled
        }
      }
    }
  }`;
  const d = await gql(q, { teamId });
  const states = d.team.states.nodes;

  const byName = (needle) =>
    states.find((s) => s.name.toLowerCase().includes(needle));

  const backlog =
    byName("backlog") || states.find((s) => s.type === "backlog");

  const todo =
    byName("todo") ||
    states.find((s) => s.type === "unstarted") ||
    states.find((s) => s.type === "triage");

  return { backlog, todo, all: states };
}

async function updateIssue(id, input) {
  const m = `mutation($id:String!, $input:IssueUpdateInput!){
    issueUpdate(id:$id, input:$input){ success }
  }`;
  const d = await gql(m, { id, input });
  return d.issueUpdate?.success;
}

function inferTopicLabels(title) {
  const out = new Set();
  for (const { rx, labels } of topicMatchers) {
    if (rx.test(title)) labels.forEach(l=>out.add(l));
  }
  return [...out];
}

async function main() {
  const tzToday = todayISO();
  const { backlog, todo } = await lookupStates(TEAM);
  if (!todo) {
    console.error("No Todo-like state (name includes 'todo' or type unstarted/triage).");
    process.exit(1);
  }
  

  let index = 0;
  let labeled = 0, moved = 0, dated = 0;

  for await (const it of listIssues(TEAM, 80)) {
    // 1) compute intended week/due date (unless ONLY_MOVE_TODAY)
    let week, dueISO;
    if (!ONLY_MOVE_TODAY) {
      week = weekFromIndex(index, ITEMS_PER_WEEK);
      const phase = phaseFromWeek(week);
      const weekLabel = `week-${week}`;
      const phaseLabel = phase;

      // due date = START_DATE + (week-1)*7 + (index%ITEMS_PER_WEEK) stagger inside the week
      const intra = index % ITEMS_PER_WEEK;       // 0..9
      const dayOffset = (week - 1) * 7 + (intra % 7); // 0..6 within the week

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
        await sleep(80);
      }

      // patch description with focus stanza (optional)
      let description = it.description || "";
      if (!description.includes("**Roadmap:**") && weekFocus[week]) {
        description = `**Roadmap:** Week ${week} – ${weekFocus[week]}\n\n` + description;
      }

      if (DRY_RUN) {
        console.log(`DRY_RUN label+date #${it.identifier} w${week} ${dueISO} add=${toAdd.join(",")}`);
      } else {
        const input = {
          ...(addedLabelIds.length ? { addedLabelIds } : {}),
          ...(dueISO ? { dueDate: dueISO } : {}),
          ...(description !== it.description ? { description } : {}),
        };
        const ok = Object.keys(input).length ? await updateIssue(it.id, input) : true;
        if (ok) { labeled += addedLabelIds.length ? 1 : 0; dated += dueISO ? 1 : 0; }
        await sleep(120);
      }
    }

    // 2) move due-today from Backlog -> Todo (strict guard)
    const isDueToday = (it.dueDate || dueISO) === tzToday;
    const inBacklog = !!(backlog && it.state?.id === backlog.id);
    const alreadyTodo = !!(todo && it.state?.id === todo.id);

    if (DRY_RUN) {
      console.log(`MOVE? #${it.identifier}: due=${it.dueDate||dueISO} today=${isDueToday} inBacklog=${inBacklog} alreadyTodo=${alreadyTodo}`);
    } else if (isDueToday && inBacklog && !alreadyTodo) {
      const ok = await updateIssue(it.id, { stateId: todo.id });
      if (ok) moved++;
      await sleep(120);
    }


    index++;
  }

  console.log(DRY_RUN
    ? `Done (dry).`
    : `Done. Labeled ${labeled} issues, set due dates on ${dated}, moved ${moved} to Todo.`);
}

main().catch(e=>{ console.error(e); process.exit(1); });
