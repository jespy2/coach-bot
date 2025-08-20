type LinearIssue = {
  id: string;
  identifier: string;
  title: string;
  url?: string;
};

export async function fetchTodayTasks(teamIdEnv?: string): Promise<LinearIssue[]> {
  const key = process.env.LINEAR_API_KEY;
  const teamId = teamIdEnv || process.env.LINEAR_TEAM_ID;

  if (!key || !teamId) {
    return [];
  }

  // Pull common fields including url/identifier so we can deep-link
  const query = /* GraphQL */ `
    query($tid: ID!) {
      issues(
        filter: {
          team: { id: { eq: $tid } }
          state: { name: { neq: "Done" } }
        }
        first: 20
      ) {
        nodes {
          id
          identifier
          title
          url
        }
      }
    }
  `;

  const res = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      Authorization: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { tid: teamId } }),
    // Optional: be gentle with Linear’s WAF
    // @ts-ignore
    cache: "no-store",
  });

  // If the call fails, return an empty list so callers can handle gracefully
  if (!res.ok) return [];

  const json = await res.json().catch(() => ({}));

  const nodes: any[] = json?.data?.issues?.nodes ?? [];

  // Map to our typed shape and keep a safe fallback for url
  return nodes.map((n) => ({
    id: n.id,
    identifier: n.identifier,
    title: n.title,
    url: n.url || (n.identifier ? `https://linear.app/issue/${n.identifier}` : undefined),
  }));
}
