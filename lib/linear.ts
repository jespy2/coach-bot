export async function fetchTodayTasks(): Promise<string[]> {
  const key = process.env.LINEAR_API_KEY;
  const teamId = process.env.LINEAR_TEAM_ID;
  if (!key || !teamId) return ['Connect Linear API to fetch today\'s tasks'];
  const query = `query($tid:String!){ issues(filter:{team:{id:{eq:$tid}}, state:{ name:{ neq:\"Done\" } }}, first:20){ nodes{ title } } }`;
  const res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: { 'Authorization': key, 'Content-Type':'application/json' },
    body: JSON.stringify({ query, variables: { tid: teamId } })
  });
  const json = await res.json();
  return json?.data?.issues?.nodes?.map((n:any)=>n.title) ?? [];
}