const API = "https://api.linear.app/graphql";
const KEY = process.env.LINEAR_API_KEY;
const TEAM = process.env.LINEAR_TEAM_ID;
if (!KEY || !TEAM) { console.error("Set LINEAR_API_KEY and LINEAR_TEAM_ID"); process.exit(1); }

const H = { Authorization: KEY, "Content-Type": "application/json" };
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));

async function gql(q, v={}) {
  const r = await fetch(API, { method:"POST", headers:H, body: JSON.stringify({query:q, variables:v})});
  const j = await r.json();
  if (j.errors) { console.error("GraphQL errors:", JSON.stringify(j.errors, null, 2)); throw new Error("GraphQL error"); }
  return j.data;
}

async function getLabelId(name){
  const q=`query($tid:ID!){ issueLabels(first:200, filter:{ team:{id:{eq:$tid}}}){ nodes{ id name }}}`;
  const d=await gql(q,{tid:TEAM});
  const hit=d.issueLabels.nodes.find(l=>l.name.toLowerCase()===name.toLowerCase());
  if (hit) return hit.id;
  const m=`mutation($input:IssueLabelCreateInput!){ issueLabelCreate(input:$input){ issueLabel{ id name }}}`;
  const r=await gql(m,{input:{teamId:TEAM, name}});
  return r.issueLabelCreate.issueLabel.id;
}

async function fetchIssuesWithLabel(labelName){
  const q=`query($tid:ID!,$after:String,$label:String!){
    issues(first:250, after:$after, orderBy:createdAt,
      filter:{ team:{id:{eq:$tid}}, labels:{ some:{ name:{ eq:$label }}}})
    { nodes{ id number title } pageInfo{ hasNextPage endCursor } }}`;
  const all=[]; let after=null;
  while(true){
    const d=await gql(q,{tid:TEAM, after, label:labelName});
    all.push(...d.issues.nodes);
    if(!d.issues.pageInfo.hasNextPage) break;
    after=d.issues.pageInfo.endCursor;
    await sleep(120);
  }
  return all;
}

async function relabel(toPhase2=true){
  const phase3Id = await getLabelId("phase-3");
  const phase2Id = await getLabelId("phase-2");
  const victims = await fetchIssuesWithLabel("phase-3");
  console.log(`Found ${victims.length} issues labeled phase-3.`);
  for (const it of victims) {
    const m=`mutation($id:String!,$input:IssueUpdateInput!){
      issueUpdate(id:$id, input:$input){ success }}`;
    const input = toPhase2
      ? { addedLabelIds:[phase2Id], removedLabelIds:[phase3Id] }
      : { removedLabelIds:[phase3Id] };
    await gql(m,{id:it.id, input});
    console.log(`Fixed #${it.number}: removed phase-3${toPhase2?" → added phase-2":""}`);
    await sleep(120);
  }
  console.log("Done.");
}

relabel(true).catch(e=>{console.error(e); process.exit(1);});
