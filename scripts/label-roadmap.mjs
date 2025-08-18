// scripts/label-roadmap.mjs (paginated + estimates + hardened)
const API = "https://api.linear.app/graphql";

const KEY = process.env.LINEAR_API_KEY;
const TEAM = process.env.LINEAR_TEAM_ID;

const ITEMS_PER_WEEK  = Number(process.env.ITEMS_PER_WEEK  || "10");
const PHASE1_WEEKS    = Number(process.env.PHASE1_WEEKS    || "8");
const PHASE2_WEEKS    = Number(process.env.PHASE2_WEEKS    || "8");

const DRY_RUN         = process.env.DRY_RUN === "1";
const AUTO_CLASSIFY   = process.env.AUTO_CLASSIFY === "1";
const INJECT_TEMPLATE = process.env.INJECT_TEMPLATE === "1";
const SET_ESTIMATES   = process.env.SET_ESTIMATES === "1"; // <-- NEW

if (!KEY || !TEAM) {
  console.error("Set LINEAR_API_KEY and LINEAR_TEAM_ID");
  process.exit(1);
}

const H = { "Authorization": KEY, "Content-Type": "application/json" };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function gql(query, variables = {}) {
  while (true) {
    const res = await fetch(API, { method: "POST", headers: H, body: JSON.stringify({ query, variables }) });
    let json;
    try { json = await res.json(); } catch (e) {
      console.error("Linear: non-JSON response", await res.text());
      throw e;
    }
    if (json.errors) {
      const rate = json.errors.some(e => String(e?.extensions?.type||e?.extensions?.code||"").toLowerCase().includes("ratelimit"));
      console.error("Linear GraphQL errors:", JSON.stringify(json.errors, null, 2));
      if (rate) { console.warn("Rate limited; backing off 1500ms…"); await sleep(1500); continue; }
      throw new Error("GraphQL error");
    }
    return json;
  }
}

// ------- Queries/Mutations (ID! types + pagination) -------

// Pull ALL open team issues in createdAt order, 250 per page
async function fetchTeamIssues() {
  const q = `
    query($tid:ID!, $after:String) {
      issues(
        first: 250,
        after: $after,
        orderBy: createdAt,
        filter:{
          team:{ id:{ eq:$tid } },
          state:{ name:{ nin:["Done","Canceled","Duplicate"] } }
        }
      ){
        nodes {
          id number title description estimate
          labels { nodes { id name } }
        }
        pageInfo { hasNextPage endCursor }
      }
    }`;
  const all = [];
  let after = null;
  while (true) {
    const j = await gql(q, { tid: TEAM, after });
    const { nodes, pageInfo } = j.data.issues;
    all.push(...nodes);
    if (!pageInfo?.hasNextPage) break;
    after = pageInfo.endCursor;
    await sleep(150); // be gentle
  }
  return all;
}

const labelCache = new Map();
async function getOrCreateLabel(name) {
  const key = name.toLowerCase();
  if (labelCache.has(key)) return labelCache.get(key);

  if (!labelCache.size) {
    const q = `query($tid:ID!){
      issueLabels(first:200, filter:{ team:{ id:{ eq:$tid }}}){ nodes{ id name } }
    }`;
    const j = await gql(q, { tid: TEAM });
    j.data.issueLabels.nodes.forEach(l => labelCache.set(l.name.toLowerCase(), l.id));
  }
  if (labelCache.has(key)) return labelCache.get(key);

  const m = `mutation($input: IssueLabelCreateInput!){
    issueLabelCreate(input:$input){ issueLabel { id name } }
  }`;
  const r = await gql(m, { input: { teamId: TEAM, name } });
  const id = r.data.issueLabelCreate.issueLabel.id;
  labelCache.set(key, id);
  return id;
}

function weekFromIndex(i0) { return Math.floor(i0 / ITEMS_PER_WEEK) + 1; }
function phaseFromWeek(w) {
  return w <= PHASE1_WEEKS ? 1 : 2;
}

function classify(title) {
  const t = title.toLowerCase();
  const out = [];
  if (/(review|learn|study|read|prep|exam)/.test(t)) out.push("type:study");
  else if (/(deploy|infrastructure|terraform|aws|eks|ecs|cloudwatch|iam|s3|cloudfront|lambda)/.test(t)) out.push("type:infra");
  else if (/(ci|cd|jenkins|github actions|pipeline|build|lint|test)/.test(t)) out.push("type:ci-cd");
  else out.push("type:build");

  if (/(react|next|typescript|chart|recharts|d3|vite|frontend)/.test(t)) out.push("area:frontend");
  if (/(chart|sankey|funnel|donut|scatter|line)/.test(t)) out.push("area:data-viz");
  if (/(ai|llm|prompt|rag|openai|anthropic)/.test(t)) out.push("area:ai");
  if (/(aws|ecs|eks|cloudwatch|iam|s3|cloudfront|lambda|ecr)/.test(t)) out.push("area:aws");
  if (/jenkins/.test(t)) out.push("area:jenkins");
  if (/(github actions|gha)/.test(t)) out.push("area:gha");
  if (/terraform/.test(t)) out.push("area:terraform");
  if (/(k8s|kubernetes|helm)/.test(t)) out.push("area:k8s");

  if (/(review|learn|study|read)/.test(t)) out.push("effort:S");
  else if (/(deploy|infrastructure|terraform|aws|eks|ecs|jenkins|pipeline)/.test(t)) out.push("effort:M");
  else out.push("effort:M");
  return out;
}

function detailTemplateFor(title, extra = []) {
  return `## Goal
What does “done” mean in user-visible terms?

## Context
Why this matters; links (docs, repo paths, PRDs).

## Plan (checklist)
- [ ] Step 1 …
- [ ] Step 2 …
- [ ] Step 3 …

## Definition of Done (acceptance)
- [ ] Demoable (how?)
- [ ] Tests (what?)
- [ ] Docs updated (where?)
- [ ] Screenshots / GIF attached

## Timebox
${extra.includes("effort:S") ? "Effort: S (~1h)" : extra.includes("effort:L") ? "Effort: L (4–6h)" : "Effort: M (2–3h)"}

## Artifacts
Paste links (branch, PR, preview URL, dashboards).

---
_Autogenerated for: ${title}_`;
}

// --- NEW: estimates helpers ---
function effortToHours(effortLabels) {
  if (effortLabels.includes("effort:S")) return 1;
  if (effortLabels.includes("effort:L")) return 6;
  return 3; // default M
}

async function setEstimate(issueId, hours) {
  const m = `mutation($id:String!, $est:Int){ issueUpdate(id:$id, input:{ estimate:$est }){ success } }`;
  const r = await gql(m, { id: issueId, est: Math.max(0, Math.round(hours)) });
  return r.data.issueUpdate.success;
}

async function maybeSetEstimate(issue, labelsSet) {
  if (!SET_ESTIMATES) return;
  if (typeof issue.estimate === "number" && issue.estimate > 0) return;
  const labelNames = Array.from(labelsSet);
  const hours = effortToHours(labelNames);
  await setEstimate(issue.id, hours);
}

async function updateIssue(issueId, { labelIds, description }) {
  const m = `mutation($id:String!,$input: IssueUpdateInput!){
    issueUpdate(id:$id, input:$input){ success }
  }`;
  const input = {};
  if (labelIds) input.labelIds = labelIds;
  if (typeof description === "string") input.description = description;
  const r = await gql(m, { id: issueId, input });
  return r.data.issueUpdate.success;
}

(async function main(){
  const issues = await fetchTeamIssues();
  console.log(`Found ${issues.length} open issues on team ${TEAM}.`);

  let index = 0, labeled = 0;
  for (const it of issues) {
    const week = weekFromIndex(index);
    const phase = phaseFromWeek(week);

    // Start with existing labels on the issue
    const toAdd = new Set((it.labels?.nodes || []).map(l => l.name));

    // Always add these:
    toAdd.add("roadmap");
    toAdd.add(`week-${week}`);
    toAdd.add(`phase-${phase}`);

    // Add derived labels from title
    if (AUTO_CLASSIFY) classify(it.title).forEach(l => toAdd.add(l));

    // --- NEW: set estimate based on effort:* if missing ---
    if (!DRY_RUN) {
      await maybeSetEstimate(it, toAdd);
      await sleep(80);
    }

    // Resolve label IDs
    const labelIds = [];
    for (const name of toAdd) {
      const id = await getOrCreateLabel(name);
      labelIds.push(id);
      await sleep(30);
    }

    // Inject description template if empty
    let desc = it.description || "";
    if (INJECT_TEMPLATE && (!desc || desc.trim().length < 5)) {
      const extras = Array.from(toAdd).filter(l => l.startsWith("effort:"));
      desc = detailTemplateFor(it.title, extras);
    }

    if (DRY_RUN) {
      console.log(`DRY_RUN would label #${it.number}: ${it.title} → [${Array.from(toAdd).join(", ")}]${INJECT_TEMPLATE && (!it.description || it.description.trim().length < 5) ? " + inject template" : ""}${SET_ESTIMATES && (!it.estimate ? " + set estimate" : "")}`);
    } else {
      const ok = await updateIssue(it.id, { labelIds, description: desc });
      if (!ok) console.warn(`Update failed for #${it.number}: ${it.title}`);
      else { labeled++; console.log(`Labeled #${it.number}: week-${week}, phase-${phase}${SET_ESTIMATES ? " (estimate set if missing)" : ""}`); }
      await sleep(120); // be gentle on API
    }

    index++;
  }

  console.log(DRY_RUN ? "Done (dry run)." : `Done. Labeled ${labeled}/${issues.length}.`);
})();
