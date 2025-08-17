/**
 * Checks status of Vercel deployment
    - Rules out networking, DNS or app routing issues
    - Sets up building updtime monitoring later
  * To run:
    -  curl -i https://coach-bot-tau.vercel.app/api/health
    - expected response:  HTTP/2 200
                          ok
 */
export const runtime = "nodejs";

export async function GET() {
  return new Response("ok", { status: 200 });
}