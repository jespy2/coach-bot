// Bulk-label existing Linear issues with week-* and phase-* based on sequence.

const API = "https://api.linear.app/graphql";

const KEY = process.env.LINEAR_API_KEY;
const TEAM = process.env.LINEAR_TEAM_ID;          // e.g., team_abc123
const ITEMS_PER_WEEK = Number(process.env.ITEMS_PER_WEEK || "10");

// Phase schema controls which weeks map to which phase.
// Example: PHASE1_WEEKS=8, PHASE2_WEEKS=8 → weeks 1..8 = phase-1, 9..16 = phase-2, 17+ = phase-3 (if any)
const PHASE1_WEEKS = Number(process.env.PHASE1_WEEKS || "8");
const PHASE2_WEEKS = Number(process.env.PHASE2_WEEKS || "8");

// Feature toggles
const DRY_RUN         = process.env.DRY_RUN === "1";   // preview only
const AUTO_CLASSIFY   = process.env.AUTO_CLASSIFY === "1";
const INJECT_TEMPLATE = process.env.INJECT_TEMPLATE === "1";

if (!KEY || !TEAM) {
  console.error("Set LINEAR_API_KEY and LINEAR_TEAM_ID");
  process.exit(1);
}

const H = { "Authorization": KEY, "Content-Type": "application/json" };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function gql(query, variables = {}) {
  while (true) {
    const res = await fetch(API, {
      method: "POST",
      headers: H,
      body: JSON.stringify({ query, variables })
    });
    const json = await res.json();
    const rate = json?.errors?.some(e =>
      String(e?.extensions?.type || e?.extensions?.code || "").toLowerCase().includes("ratelimit")
    );
    if (!rate) return json;
    console.warn("Rate limited; backing off 1500ms…");
    await sleep(1500);
  }
}

async function fetchRoadmapIssues() {
  // Pull all roadmap issues on the team, ordered by createdAt (import order).
  const q = `
    query($tid:String!) {
      issues(
        first: 500,
        orderBy: createdAt,
        filter: {
          team: { id: { eq: $tid } },
          labels: { some: { name: { eq: "roadmap" } } },
          state: { name: { nin: ["Done","Canceled","Duplicate"] } }
        }
      ) {
        nodes {
          id number title description
          labels { nodes { id name } }
        }
      }
    }`;
  const j = await gql(q, { tid: TEAM });
  return j.data.issues.nodes;
}

const labelCache = new Map();
async function getOrCreateLabel(name) {
  const key = name.toLowerCase();
  if (labelCache.has(key)) return labelCache.get(key);

  // fetch existing labels once
  if (!labelCache.size) {
    const q = `query($tid:String!){
      issueLabels(first:200, filter:{ team:{ id:{ eq:$tid }}}){ nodes{ id name } }
    }`;
    const j = await gql(q, { tid: TEAM });
    j.data.issueLabels.nodes.forEach(l => labelCache.set(l.name.toLowerCase(), l.id));
  }
  if (labelCache.has(key)) return labelCache.get(key);

  // create label
  const m = `mutation($input: IssueLabelCreateInput!){
    issueLabelCreate(input:$input){ issueLabel { id name } }
  }`;
  const r = await gql(m, { input: { teamId: TEAM, name } });
  const id = r.data.issueLabelCreate.issueLabel.id;
  labelCache.set(key, id);
  return id;
}

function weekFromIndex(index0) {
  // index0 is 0-based in createdAt order; week starts at 1
  return Math.floor(index0 / ITEMS_PER_WEEK) + 1;
}
function phaseFromWeek(week) {
  if (week <= PHASE1_WEEKS) return 1;
  if (week <= PHASE1_WEEKS + PHASE2_WEEKS) return 2;
  return 3; // everything beyond goes to phase-3 by default
}

function classify(title) {
  const t = title.toLowerCase();
  const labels = [];

  // type
  if (/(review|learn|study|read|prep|exam)/.test(t)) labels.push("type:study");
  else if (/(deploy|infrastructure|terraform|aws|eks|ecs|cloudwatch|iam|s3|cloudfront|lambda)/.test(t)) labels.push("type:infra");
  else if (/(ci|cd|jenkins|github actions|pipeline|build|lint|test)/.test(t)) labels.push("type:ci-cd");
  else labels.push("type:build");

  // area
  if (/(react|next|typescript|chart|recharts|d3|vite|frontend)/.test(t)) labels.push("area:frontend");
  if (/(chart|sankey|funnel|donut|scatter|line)/.test(t)) labels.push("area:data-viz");
  if (/(ai|llm|prompt|rag|openai|anthropic)/.test(t)) labels.push("area:ai");
  if (/(aws|ecs|eks|cloudwatch|iam|s3|cloudfront|lambda|ecr)/.test(t)) labels.push("area:aws");
  if (/jenkins/.test(t)) labels.push("area:jenkins");
  if (/(github actions|gha)/.test(t)) labels.push("area:gha");
  if (/terraform/.test(t)) labels.push("area:terraform");
  if (/(k8s|kubernetes|helm)/.test(t)) labels.push("area:k8s");

  // effort
  if (/(review|learn|study|read)/.test(t)) labels.push("effort:S");
  else if (/(deploy|infrastructure|terraform|aws|eks|ecs|jenkins|pipeline)/.test(t)) labels.push("effort:M");
  else labels.push("effort:M");

  return labels;
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
  const issues = await fetchRoadmapIssues();
  console.log(`Found ${issues.length} roadmap issues.`);

  let index = 0, labeled = 0;
  for (const it of issues) {
    const thisWeek = weekFromIndex(index);
    const thisPhase = phaseFromWeek(thisWeek);
    const weekLabel = `week-${thisWeek}`;
    const phaseLabel = `phase-${thisPhase}`;

    const toAdd = new Set((it.labels?.nodes || []).map(l => l.name));
    toAdd.add("roadmap");
    toAdd.add(weekLabel);
    toAdd.add(phaseLabel);

    if (AUTO_CLASSIFY) classify(it.title).forEach(l => toAdd.add(l));

    // resolve label IDs
    const labelIds = [];
    for (const name of toAdd) {
      const id = await getOrCreateLabel(name);
      labelIds.push(id);
      await sleep(30);
    }

    let desc = it.description || "";
    if (INJECT_TEMPLATE && (!desc || desc.trim().length < 5)) {
      // pick an effort label for template hint
      const extras = Array.from(toAdd).filter(l => l.startsWith("effort:"));
      desc = detailTemplateFor(it.title, extras);
    }

    if (DRY_RUN) {
      console.log(`DRY_RUN would label #${it.number}: ${it.title} → [${Array.from(toAdd).join(", ")}]${INJECT_TEMPLATE && (!it.description || it.description.trim().length < 5) ? " + inject template" : ""}`);
    } else {
      const ok = await updateIssue(it.id, { labelIds, description: desc });
      if (!ok) console.warn(`Update failed for #${it.number}: ${it.title}`);
      else {
        labeled++;
        console.log(`Labeled #${it.number}: ${weekLabel}, ${phaseLabel}`);
      }
      await sleep(120); // gentle
    }

    index++;
  }

  console.log(DRY_RUN ? "Done (dry run)." : `Done. Labeled ${labeled}/${issues.length}.`);
})();
