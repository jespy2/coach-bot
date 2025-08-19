// scripts/reset-roadmap.mjs
//
// Roadmap realign, labels+dates+descriptions, with Week 1 starting Wednesday (2025-08-20)
// and Weeks 2..16 starting on Monday.
//
// What it does:
// - Computes week starts as:
//     Week 1: exactly START_DATE (Wednesday, 2025-08-20)
//     Week N>=2: Monday on/before (START_DATE + 7*(N-1))
//   => Due date for each issue = that week's start date.
// - Replaces stale/invalid labels in controlled namespaces: week-*, phase-*, area:*, type:*, effort:*, milestone:capstone
// - Removes any phase-3 (only phase-1 for weeks 1–8, phase-2 for 9–16)
// - Regenerates description with a robust template (Goal, Context, Plan, DoD, Timebox, Artifacts)
// - Optional movement Backlog -> Todo for items due today (or for the current week)
//
// ENV (in .env.local or CLI):
//   LINEAR_API_KEY=...           (required)
//   LINEAR_TEAM_ID=...           (required)
//   START_DATE=2025-08-20        (required; **must be the Wednesday start**)
//   TIMEZONE=America/Denver      (default)
//
//   DRY_RUN=1                    (preview; no writes)
//   APPLY_LABELS=1               (default on)
//   APPLY_DATES=1                (default on)
//   RESPECT_EXISTING_WEEK=0      (default 0 for a clean reset; set 1 later to honor manual week-* labels)
//
//   ONLY_MOVE_TODAY=1            (optional mover: dueDate === today)
//   MOVE_BY_WEEK=1               (optional mover: all issues in current week window)
//   NORMALIZE_STATES=1           (optional: push non-active out of Todo back to Backlog)
//
//   SOURCE_STATE_NAME=backlog    (optional; falls back to type=backlog)
//   DEST_STATE_NAME=todo         (optional; falls back to type=unstarted/triage)

const API = "https://api.linear.app/graphql";
const KEY = process.env.LINEAR_API_KEY;
const TEAM = process.env.LINEAR_TEAM_ID;
const START_DATE = process.env.START_DATE || process.env.PROGRAM_START_DATE; // MUST be 2025-08-20 (Wednesday)
const TZ = process.env.TIMEZONE || "America/Denver";

const DRY_RUN = process.env.DRY_RUN === "1";
const APPLY_LABELS = process.env.APPLY_LABELS !== "0";
const APPLY_DATES  = process.env.APPLY_DATES  !== "0";
const RESPECT_EXISTING_WEEK = process.env.RESPECT_EXISTING_WEEK === "1";

const ONLY_MOVE_TODAY = process.env.ONLY_MOVE_TODAY === "1";
const MOVE_BY_WEEK    = process.env.MOVE_BY_WEEK === "1";
const NORMALIZE_STATES= process.env.NORMALIZE_STATES === "1";

const SOURCE_STATE_NAME = (process.env.SOURCE_STATE_NAME || "").toLowerCase() || null;
const DEST_STATE_NAME   = (process.env.DEST_STATE_NAME   || "").toLowerCase() || null;

if (!KEY || !TEAM) { console.error("Set LINEAR_API_KEY and LINEAR_TEAM_ID"); process.exit(1); }
if (!START_DATE)    { console.error("Set START_DATE=YYYY-MM-DD (use 2025-08-20 for this schedule)"); process.exit(1); }

const H = { Authorization: KEY, "Content-Type": "application/json" };
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));

// ---------- Date helpers ----------
function addDays(iso, days) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0,10);
}
function mondayOnOrBefore(iso) {
  const d = new Date(iso + "T00:00:00Z");
  const dow = d.getUTCDay(); // Sun=0..Sat=6
  const back = (dow + 6) % 7; // 0 if Mon, 1 if Tue, ... 6 if Sun
  d.setUTCDate(d.getUTCDate() - back);
  return d.toISOString().slice(0,10);
}
function todayISO(tz=TZ) {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-CA',{ timeZone: tz, year:'numeric', month:'2-digit', day:'2-digit' });
  const p = Object.fromEntries(fmt.formatToParts(now).map(x=>[x.type,x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}

// Week window computation: Week 1 starts on START_DATE (Wed).
// Week 2 starts on the Monday on/before (START_DATE + 7), which is the immediate following Monday.
// Weeks 3..16 start each subsequent Monday.
function weekStart(week) {
  if (week === 1) return START_DATE;
  return mondayOnOrBefore(addDays(START_DATE, 7*(week-1)));
}
function weekEnd(week) {
  // End = day before next week's start; Week 16 ends at start+6
  if (week === 16) return addDays(weekStart(16), 6);
  const nextStart = weekStart(week+1);
  return addDays(nextStart, -1);
}
function dateInWindow(dateISO, week) {
  const s = weekStart(week), e = weekEnd(week);
  return dateISO >= s && dateISO <= e;
}
function currentWeekIndex(today = todayISO()) {
  for (let w=1; w<=16; w++) {
    if (dateInWindow(today, w)) return w;
  }
  // If before week1 or after week16:
  if (today < weekStart(1)) return 1;
  return 16;
}

// ---------- Roadmap defaults by week ----------
function phaseFromWeek(week) {
  return (week >= 1 && week <= 8) ? "phase-1"
       : (week >= 9 && week <= 16) ? "phase-2"
       : "phase-unknown";
}

const weekDefaults = {
  1:  { area: "area:frontend",  type: "type:study"  }, // TS/JS review
  2:  { area: "area:frontend",  type: "type:build"  }, // Next.js deep dive
  3:  { area: "area:data-viz",  type: "type:build"  }, // Recharts & viz
  4:  { area: "area:ci-cd",     type: "type:infra"  }, // GitHub Actions & pipelines
  5:  { area: "area:aws",       type: "type:infra"  }, // S3/CloudFront/Lambda
  6:  { area: "area:ai",        type: "type:study"  }, // AI/Prompt/LLM
  7:  { area: "area:terraform", type: "type:infra"  }, // Terraform/IaC
  8:  { capstone: true },                               // Capstone polish
  9:  { area: "area:jenkins",   type: "type:infra"  },
  10: { area: "area:gha",       type: "type:infra"  },
  11: { area: "area:k8s",       type: "type:infra"  },
  12: { area: "area:k8s",       type: "type:infra"  }, // Helm/scaling/deploys
  13: { area: "area:aws",       type: "type:study"  }, // AWS cert study
  14: { area: "area:terraform", type: "type:study"  }, // Terraform cert study
  15: { area: "area:ci-cd",     type: "type:study"  }, // Jenkins/GHA cert study
  16: {                        type: "type:review" }   // Wrap-up/retrospective
};

// Title → week helper rules (specific first; tweak if you see outliers)
const titleRules = [
  { week: 8,  rx: /\bcapstone|polish(ing)?\b/i },

  { week: 16, rx: /\b(final|wrap[- ]?up|presentation|retrospective)\b/i },
  { week: 16, rx: /\bportfolio|linkedin\b/i },

  { week: 15, rx: /\b(cert|exam)\s*(study|prep)\b/i },
  { week: 14, rx: /\bterraform\b.*\b(cert|exam)\s*(study|prep)\b/i },
  { week: 13, rx: /\baws\b.*\b(cert|exam)\s*(study|prep)\b/i },

  { week: 12, rx: /\bhelm\b|\b(k8s|kubernetes).*(scale|deploy|rolling|helm)\b/i },
  { week: 11, rx: /\b(k8s|kubernetes)\b/i },

  { week: 10, rx: /\bgithub actions\b.*\b(advanced|matrix|reusable|composite)\b/i },
  { week: 9,  rx: /\bjenkins\b/i },

  { week: 7,  rx: /\bterraform|iac\b/i },
  { week: 6,  rx: /\b(ai|llm|prompt)\b/i },
  { week: 5,  rx: /\baws|s3|cloudfront|lambda|iam|ec2|cloudformation\b/i },
  { week: 4,  rx: /\bci\/?cd|pipeline|github actions|workflows?\b/i },
  { week: 3,  rx: /\b(recharts|chart|graph|visuali[sz]ation|data[- ]?viz)\b/i },
  { week: 2,  rx: /\bnext(?:\.js)?|app router|rsc\b/i },
  { week: 1,  rx: /\btypescript|\bts\b/i },
];

function weekFromTitle(title) {
  for (const r of titleRules) if (r.rx.test(title)) return r.week;
  return null;
}
function weekFromExisting(labels = []) {
  const wk = labels.find(l => /^week-(\d+)$/.test(l.name));
  return wk ? Number(wk.name.split("-")[1]) : null;
}

function areaTypeForWeek(week, title) {
  const def = weekDefaults[week] || {};
  let area = def.area || null;
  let type = def.type || null;

  // Light nudges from title
  if (/jenkins/i.test(title)) area = "area:jenkins";
  if (/github actions|gha/i.test(title)) area = "area:gha";
  if (/k8s|kubernetes|helm/i.test(title)) area = "area:k8s";
  if (/terraform|iac/i.test(title)) area = "area:terraform";
  if (/aws|s3|cloudfront|lambda|iam|ec2|cloudformation/i.test(title)) area = "area:aws";
  if (/recharts|chart|visuali[sz]ation|data[- ]?viz/i.test(title)) area = "area:data-viz";
  if (/typescript|next(?:\.js)?|react/i.test(title)) area = "area:frontend";
  if (/ai|llm|prompt/i.test(title)) area = "area:ai";
  if (/ci\/?cd|pipeline|workflows?|pr review bot/i.test(title)) area = "area:ci-cd";

  if (/review|study|learn|quiz|read/i.test(title)) type = "type:study";
  if (/setup|configure|integrate|implement|dockerize|build|create/i.test(title)) {
    if (!/study|review/.test(type||"")) type = "type:build";
  }
  if (/infra|pipeline|helm|terraform|kubernetes|jenkins|gha/i.test(title)) type = "type:infra";

  const capstone = (week === 8) || /\b(capstone|polish|final project|presentation)\b/i.test(title);
  return { area, type, capstone };
}

// Effort heuristic
function effortFromTitle(title, week) {
  if (week === 8) return "effort:L";
  if (/\b(kubernetes|helm|terraform|deploy|production)\b/i.test(title)) return "effort:L";
  if (/\bsetup|configure|integrate|build|implement|dockerize\b/i.test(title)) return "effort:M";
  if (/\breview|study|learn|quiz|read\b/i.test(title)) return "effort:S";
  return "effort:M";
}

// ---------- Description template ----------
function detailTemplateFor(title, labels = [], extras = {}) {
  // Timebox: infer from labels (effort:S/M/L)
  const effortTag = labels.find(l => /^effort:(S|M|L)$/i.test(l)) || "effort:M";
  const effort = effortTag.split(":")[1].toUpperCase();
  const timebox =
    effort === "S" ? "≈ 1 hour"
    : effort === "L" ? "≈ 4–6 hours"
    : "≈ 2–3 hours";

  const {
    phase = "phase-?",
    week = "?",
    focus = "",
    weekStart = "",
    area = "",
    type = "",
  } = extras;

  return `## Goal
Define what "done" means for this task. Be specific and outcome-focused.

## Context
- Phase: ${phase}
- Week: ${week}${focus ? ` — ${focus}` : ""}
- Week start: ${weekStart}
- Area: ${area || "n/a"}
- Type: ${type || "n/a"}
- Links: (Specs, designs, docs, dashboards)

## Plan
- [ ] Outline the approach
- [ ] Break into sub-tasks
- [ ] Implement core changes
- [ ] Add tests/validation
- [ ] Record notes/findings

## Definition of Done
- [ ] Meets acceptance criteria
- [ ] Tests or verifications complete
- [ ] Docs/README updated (if applicable)
- [ ] Deployed or ready-for-deploy
- [ ] Stakeholder sign-off (if required)

## Timebox
- Target: ${timebox} (${effortTag})
- If exceeding the timebox, pause and leave a note on blockers.

## Artifacts
- PR(s): 
- Branch: 
- Preview/Build: 
- Tickets related:

---

_Autogenerated for: ${title}_`;
}

function ensureDescription(current, { title, phase, week, area, type, effort, weekStartISO }) {
  const focus =
    week === 1 ? "TypeScript & JS Review" :
    week === 2 ? "Next.js Deep Dive" :
    week === 3 ? "Recharts & Visualization Foundations" :
    week === 4 ? "GitHub Actions & Pipelines" :
    week === 5 ? "AWS Basics (S3, CloudFront, Lambda)" :
    week === 6 ? "AI/Prompt/LLM Fundamentals" :
    week === 7 ? "Terraform & IaC" :
    week === 8 ? "Capstone Completion & Polishing" :
    week === 9 ? "Jenkins Pipelines" :
    week === 10 ? "GitHub Actions Advanced" :
    week === 11 ? "Kubernetes Intro" :
    week === 12 ? "Helm, Scaling, Deployments" :
    week === 13 ? "AWS Certification Study" :
    week === 14 ? "Terraform Certification Study" :
    week === 15 ? "CI/CD Certification Study" :
    "Review, Wrap-up, Retrospective";

  // Always regenerate to keep label/description in sync
  const labelsForTimebox = [effort];
  return detailTemplateFor(title, labelsForTimebox, {
    phase, week, focus, weekStart: weekStartISO, area, type
  });
}

// ---------- GraphQL helpers ----------
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
          id identifier title description dueDate
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

async function getAllLabels(teamId) {
  const out = [];
  let after = null;
  while (true) {
    const q = `query($teamId: ID!, $after: String){
      issueLabels(first: 200, filter:{ team: { id: { eq: $teamId } } }, after:$after) {
        pageInfo { hasNextPage endCursor }
        nodes { id name }
      }
    }`;
    const d = await gql(q, { teamId, after });
    out.push(...d.issueLabels.nodes);
    if (!d.issueLabels.pageInfo.hasNextPage) break;
    after = d.issueLabels.pageInfo.endCursor;
  }
  return out;
}

async function getOrCreateLabelId(teamId, name, cache) {
  if (cache.has(name)) return cache.get(name);
  const q = `query($teamId: ID!, $name: String!){
    issueLabels(first: 1, filter:{ team: { id: { eq: $teamId } }, name:{ eq:$name } }) { nodes { id name } }
  }`;
  const d = await gql(q, { teamId, name });
  const existing = d.issueLabels.nodes[0];
  if (existing) { cache.set(name, existing.id); return existing.id; }
  const m = `mutation($teamId: String!, $name: String!){
    issueLabelCreate(input:{ teamId:$teamId, name:$name }){ issueLabel { id name } }
  }`;
  const created = await gql(m, { teamId, name });
  const id = created.issueLabelCreate.issueLabel.id;
  cache.set(name, id);
  return id;
}

async function lookupStates(teamId) {
  const q = `query($teamId: String!){
    team(id:$teamId){
      states(first: 200) { nodes { id name type position } }
    }
  }`;
  const d = await gql(q, { teamId });
  const states = d.team.states.nodes;
  const byName = (needle) => states.find(s => s.name.toLowerCase().includes(needle));
  const backlog = byName("backlog") || states.find(s => s.type === "backlog") || null;
  const todo    = byName("todo")    || states.find(s => s.type === "unstarted") || states.find(s => s.type === "triage") || null;

  let source = backlog;
  if (SOURCE_STATE_NAME) source = states.find(s => s.name.toLowerCase().includes(SOURCE_STATE_NAME)) || source;
  let dest = todo;
  if (DEST_STATE_NAME)   dest   = states.find(s => s.name.toLowerCase().includes(DEST_STATE_NAME))   || dest;

  return { source, dest, all: states };
}

async function updateIssue(id, input) {
  const m = `mutation($id:String!, $input:IssueUpdateInput!){
    issueUpdate(id:$id, input:$input){ success }
  }`;
  const d = await gql(m, { id, input });
  return d.issueUpdate?.success;
}

// ---------- main ----------
async function main() {
  const tzToday = todayISO();
  const { source, dest } = await lookupStates(TEAM);
  if (!dest) {
    console.error("No Todo-like state found (name contains 'todo' or type unstarted/triage).");
    process.exit(1);
  }

  // cache labels
  const cache = new Map();
  for (const l of await getAllLabels(TEAM)) cache.set(l.name, l.id);

  let changed = 0, moved = 0, inspected = 0;

  for await (const it of listIssues(TEAM)) {
    inspected++;

    // ----- choose week -----
    const wkLabel = RESPECT_EXISTING_WEEK ? weekFromExisting(it.labels?.nodes || []) : null;
    const wkTitle = weekFromTitle(it.title);
    let week = wkLabel || wkTitle || 1;
    if (week < 1) week = 1;
    if (week > 16) week = 16;

    const phase = phaseFromWeek(week);
    const { area, type, capstone } = areaTypeForWeek(week, it.title);
    const effort = effortFromTitle(it.title, week);

    // ----- due date: start of week (Wed for week1, Mon otherwise) -----
    const dueISO = weekStart(week);

    // ----- labels (controlled namespaces) -----
    const wanted = new Set([
      `week-${week}`,
      phase,
      area || "",
      type || "",
      effort || "",
      ...(capstone ? ["milestone:capstone"] : []),
    ].filter(Boolean));

    const controlled = ["week-", "phase-", "area:", "type:", "effort:", "milestone:capstone"];
    const keep = new Set(
      (it.labels?.nodes || []).map(l => l.name)
        .filter(name => !controlled.some(p => name.startsWith(p)))
    );
    // Replace phase-3 explicitly if lingering:
    for (const name of [...keep]) {
      if (name === "phase-3") keep.delete(name);
    }

    const finalNames = new Set([...keep, ...wanted]);

    // Resolve label IDs (create if missing)
    const labelIds = [];
    for (const name of finalNames) {
      const id = await getOrCreateLabelId(TEAM, name, cache);
      labelIds.push(id);
      if (!DRY_RUN) await sleep(40);
    }

    // ----- description -----
    const newDesc = ensureDescription(it.description || "", {
      title: it.title, phase, week, area, type, effort, weekStartISO: dueISO
    });

    // ----- write -----
    const input = {};
    if (APPLY_LABELS) input.labelIds = labelIds;
    if (APPLY_DATES)  input.dueDate  = dueISO;
    if (newDesc !== (it.description || "")) input.description = newDesc;

    if (DRY_RUN) {
      console.log(`PLAN ${it.identifier}: week=${week} ${phase} due=${dueISO} labels=[${[...finalNames].join(", ")}]`);
    } else if (Object.keys(input).length) {
      const ok = await updateIssue(it.id, input);
      if (ok) changed++;
      await sleep(120);
    }

    // ----- movement -----
    const wkNow = currentWeekIndex(tzToday);
    const isInCurrentWeek = dateInWindow(dueISO, wkNow);
    const shouldBeActive =
      ONLY_MOVE_TODAY ? (dueISO === tzToday)
      : MOVE_BY_WEEK   ? isInCurrentWeek
      : (dueISO === tzToday);

    const inSource = !!(source && it.state?.id === source.id);
    const inDest   = !!(dest   && it.state?.id === dest.id);

    if (DRY_RUN) {
      console.log(`MOVE? ${it.identifier}: should=${shouldBeActive} inSource=${inSource} inDest=${inDest}`);
    } else {
      if (NORMALIZE_STATES && !shouldBeActive && inDest && source) {
        const ok = await updateIssue(it.id, { stateId: source.id });
        if (ok) moved++;
        await sleep(120);
      }
      if (shouldBeActive && inSource && !inDest) {
        const ok = await updateIssue(it.id, { stateId: dest.id });
        if (ok) moved++;
        await sleep(120);
      }
    }
  }

  console.log(
    DRY_RUN
      ? `Done (plan only). Inspected ${inspected} issues.`
      : `Done. Updated ${changed} issues, moved ${moved}.`
  );
}

main().catch(e=>{ console.error(e); process.exit(1); });
