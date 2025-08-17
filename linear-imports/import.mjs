import fs from "node:fs/promises";

const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const LINEAR_TEAM_ID = process.env.LINEAR_TEAM_ID;
const FILE = process.env.LINEAR_FILE || "./linear_ai_devops_roadmap_with_jenkins_placeholder.json";
// resume partway through
const START_INDEX = Number(process.env.START_INDEX || "0");

// Tune pacing here (milliseconds)
const PAUSE_MS = Number(process.env.PAUSE_MS || "8000"); // 8s between issues (safe)
// Max backoff wait when ratelimited
const MAX_BACKOFF_MS = 30000; // 30s

if (!LINEAR_API_KEY || !LINEAR_TEAM_ID) {
  console.error("Set LINEAR_API_KEY and LINEAR_TEAM_ID env vars.");
  process.exit(1);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function gql(query, variables = {}) {
  let attempt = 0;

  while (true) {
    const res = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        "Authorization": LINEAR_API_KEY, // raw token, no "Bearer"
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = await res.json().catch(() => ({}));

    // Detect rate-limit from extensions
    const ratelimited = Array.isArray(json?.errors) && json.errors.some(e => {
      const code = (e.extensions?.code || e.extensions?.type || "").toString().toLowerCase();
      return code.includes("ratelimit");
    });

    if (!ratelimited) return json;

    // Exponential backoff
    const backoff = Math.min(MAX_BACKOFF_MS, 1000 * 2 ** attempt);
    attempt++;
    console.warn(`Rate limited; retrying in ${backoff}ms...`);
    await sleep(backoff);
  }
}

async function ensureLabel(name) {
  if (!name) return null;
  const listQ = `
    query Labels($teamId:String!) {
      issueLabels(filter:{team:{id:{eq:$teamId}}}, first:200) { nodes { id name } }
    }`;
  const list = await gql(listQ, { teamId: LINEAR_TEAM_ID });
  const existing = list?.data?.issueLabels?.nodes?.find(l => l.name === name);

  if (existing) return existing.id;

  const createQ = `
    mutation CreateLabel($input: IssueLabelCreateInput!) {
      issueLabelCreate(input:$input){ issueLabel { id name } }
    }`;
  const created = await gql(createQ, { input: { teamId: LINEAR_TEAM_ID, name } });

  return created?.data?.issueLabelCreate?.issueLabel?.id || null;
}

async function labelIdsFor(names = []) {
  const ids = [];
  for (const n of names) {
    const id = await ensureLabel(n);
    if (id) ids.push(id);
    await sleep(150); // tiny spacing between label ops
  }
  return ids;
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

async function createIssue(issue) {
  // idempotency: skip if an issue with same title already exists
  const exists = await findIssueByTitle(issue.title);

  if (exists) {
    console.log(`Exists #${exists.number}: ${exists.title}`);
    return { ok: true, id: exists.id, number: exists.number, existed: true };
  }

  const labels = Array.isArray(issue.labels) ? issue.labels : [];
  const labelIds = await labelIdsFor(labels);

  const q = `
    mutation CreateIssue($input: IssueCreateInput!) {
      issueCreate(input:$input){ success issue { id number title } }
    }`;
  const input = {
    title: issue.title,
    description: issue.description || "",
    teamId: LINEAR_TEAM_ID,
    dueDate: issue.due_date || null,
    labelIds,
  };
  const j = await gql(q, { input });
  const created = j?.data?.issueCreate?.issue;

  if (!created) {
    console.error("Failed:", issue.title, JSON.stringify(j));
    return { ok: false, error: j };
  }

  console.log(`Created #${created.number}: ${created.title}`);

  return { ok: true, id: created.id, number: created.number };
}

async function main() {
  const body = JSON.parse(await fs.readFile(FILE, "utf8"));
  const issues = body.issues || [];
  const failed = [];

  for (let i = START_INDEX; i < issues.length; i++) {
    const item = issues[i];
    
    try {
      const res = await createIssue(item);
      if (!res.ok) failed.push({ index: i, title: item.title });
    } catch (e) {
      console.error(`Error @ index ${i} (${item.title}):`, e?.message || e);
      failed.push({ index: i, title: item.title, error: e?.message || String(e) });
    }

    // Pacing between issue creations to dodge WAF
    if (i < issues.length - 1) {
      await sleep(PAUSE_MS);
    }
  }

  if (failed.length) {
    await fs.writeFile("failed.json", JSON.stringify(failed, null, 2));
    console.log(`\nWrote failed.json with ${failed.length} items. Re-run later with START_INDEX or a slice file.`);
  } else {
    console.log("\nAll done without failures.");
  }
}

main().catch(e => { console.error(e); process.exit(1); });
