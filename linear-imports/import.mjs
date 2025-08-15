import fs from "node:fs/promises";

const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const LINEAR_TEAM_ID = process.env.LINEAR_TEAM_ID;
const FILE = process.env.LINEAR_FILE || "../../data/roadmaps/linear_ai_devops_roadmap_with_jenkins_placeholder.json";
const START_INDEX = Number(process.env.START_INDEX || "0");

if (!LINEAR_API_KEY || !LINEAR_TEAM_ID) {
  console.error("Set LINEAR_API_KEY and LINEAR_TEAM_ID env vars.");
  process.exit(1);
}

const body = JSON.parse(await fs.readFile(FILE, "utf8"));
const issues = body.issues || [];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function gql(query, variables = {}) {
  let attempt = 0;
  while (true) {
    const res = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: { "Authorization": LINEAR_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables })
    });
    const json = await res.json();
    // Linear sometimes returns rate limit as 400 with extension type ratelimited
    const ratelimited = json?.errors?.some(e => (e.extensions?.type || e.extensions?.code || "").toString().toLowerCase().includes("ratelimit"));
    if (!ratelimited) return json;
    // backoff: 1s, 2s, 4s, 8s, 16s (cap)
    const delay = Math.min(16000, 1000 * Math.pow(2, attempt));
    attempt++;
    console.warn(`Rate limited; retrying in ${delay}ms...`);
    await sleep(delay);
  }
}

async function findIssueByTitle(title) {
  const q = `
    query FindIssue($teamId:String!, $title:String!) {
      issues(filter:{ team:{id:{eq:$teamId}}, title:{eq:$title} }, first:1) {
        nodes { id number title }
      }
    }`;
  const j = await gql(q, { teamId: LINEAR_TEAM_ID, title });
  return j?.data?.issues?.nodes?.[0] || null;
}

const labelCache = new Map();
async function ensureLabel(name) {
  const key = `${LINEAR_TEAM_ID}:${name}`;
  if (labelCache.has(key)) return labelCache.get(key);

  const findQ = `
    query Labels($teamId:String!) {
      issueLabels(filter:{team:{id:{eq:$teamId}}}, first:200) { nodes { id name } }
    }`;
  const found = await gql(findQ, { teamId: LINEAR_TEAM_ID });
  const labels = found?.data?.issueLabels?.nodes || [];
  const existing = labels.find(l => l.name === name);
  if (existing) { labelCache.set(key, existing.id); return existing.id; }

  const createQ = `
    mutation CreateLabel($input: IssueLabelCreateInput!){
      issueLabelCreate(input:$input){ issueLabel { id name } }
    }`;
  const created = await gql(createQ, { input: { teamId: LINEAR_TEAM_ID, name } });
  const id = created?.data?.issueLabelCreate?.issueLabel?.id || null;
  if (id) labelCache.set(key, id);
  return id;
}

async function createIssue(issue) {
  // idempotency by title
  const exists = await findIssueByTitle(issue.title);
  if (exists) {
    console.log(`Exists #${exists.number}: ${exists.title}`);
    return { ok: true, id: exists.id, number: exists.number };
  }

  // map labels
  const labelIds = [];
  if (Array.isArray(issue.labels)) {
    for (const name of issue.labels) {
      const id = await ensureLabel(name);
      if (id) labelIds.push(id);
      await sleep(50); // tiny spacing to be gentle
    }
  }

  const q = `
    mutation CreateIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) { success issue { id number title } }
    }`;
  const input = {
    title: issue.title,
    description: issue.description || "",
    teamId: LINEAR_TEAM_ID,
    dueDate: issue.due_date || null,
    labelIds
  };
  const j = await gql(q, { input });
  const created = j?.data?.issueCreate?.issue;
  if (created) {
    console.log(`Created #${created.number}: ${created.title}`);
    return { ok: true, id: created.id, number: created.number };
  } else {
    console.error("Failed:", issue.title, JSON.stringify(j));
    return { ok: false, error: j };
  }
}

const failed = [];
for (let i = START_INDEX; i < issues.length; i++) {
  const issue = issues[i];
  const res = await createIssue(issue);
  if (!res.ok) failed.push({ index: i, title: issue.title });
  // gentle pacing to avoid tripping WAF
  await sleep(150);
}

if (failed.length) {
  await fs.writeFile("failed.json", JSON.stringify(failed, null, 2));
  console.log(`\nWrote failed.json with ${failed.length} items. You can retry them later.`);
} else {
  console.log("\nAll done without failures.");
}