import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { fetchTodayTasks } from "@/lib/linear";

export const runtime = "nodejs";

type TodayIssue = {
  id: string;
  identifier: string;
  title: string;
  url?: string;
};

/** Verify Slack request signature per https://api.slack.com/authentication/verifying-requests-from-slack */
function verifySlackSignature(req: NextRequest, rawBody: string): boolean {
  const ts = req.headers.get("x-slack-request-timestamp") || "";
  const sig = req.headers.get("x-slack-signature") || "";
  const secret = process.env.SLACK_SIGNING_SECRET || "";

  if (!secret || !ts || !sig) return false;

  // Replay protection (5 minutes)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(ts)) > 60 * 5) return false;

  const base = `v0:${ts}:${rawBody}`;
  const hmac = crypto.createHmac("sha256", secret).update(base).digest("hex");
  const expected = `v0=${hmac}`;

  try {
    // timingSafeEqual throws if lengths differ; handle gracefully
    if (expected.length !== sig.length) return false;
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

function toTodayBlocks(issues: TodayIssue[]) {
  const list =
    issues.length > 0
      ? issues
          .map(
            (i, idx) =>
              `:white_large_square: *${idx + 1}.* <${i.url ?? "#"}|${i.title}>`
          )
          .join("\n")
      : "_No open tasks due today_";

  return [
    { type: "header", text: { type: "plain_text", text: "Today’s Plan", emoji: true } },
    { type: "section", text: { type: "mrkdwn", text: list } },
  ];
}

export async function POST(req: NextRequest) {
  // Slack sends x-www-form-urlencoded; we must read the raw body for signature verification
  const rawBody = await req.text();

  if (!verifySlackSignature(req, rawBody)) {
    return NextResponse.json({ ok: false, error: "bad signature" }, { status: 401 });
  }

  const params = new URLSearchParams(rawBody);
  const command = (params.get("command") || "").trim();
  const text = (params.get("text") || "").trim();
  // const userId = params.get("user_id") || "";
  // const channelId = params.get("channel_id") || "";
  // const responseUrl = params.get("response_url") || "";

    // --- /coach ---
    if (command === "/coach") {
      const sub = text.split(/\s+/)[0] || "";
  
      const base = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.LOCAL_BASE_URL || "http://localhost:3000";
      const token = process.env.SCHEDULE_TOKEN || "";
  
      if (sub === "plan") {
        // triggers weekly sprint planning immediately
        await fetch(`${base}/api/coach/plan`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        return NextResponse.json({
          response_type: "ephemeral",
          text: "Planning sprint now… check the channel for the plan.",
        });
      }
  
      if (sub === "today") {
        // 1) Fetch the list directly so we can show it to you immediately
        const teamId = process.env.LINEAR_TEAM_ID!;
        const issues = await fetchTodayTasks(teamId) as TodayIssue[];
    
        // 2) Build blocks for both ephemeral reply and channel post
        const blocks = toTodayBlocks(issues);
    
        // 3) Fire-and-forget channel post via our existing endpoint (optional)
        // (If this fails, at least you saw the ephemeral list.)
        await fetch(`${base}/api/schedule/morning`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => { /* ignore */ });
    
        // 4) Show the checklist in your Slack client now
        return NextResponse.json({
          response_type: "ephemeral",
          text: issues.length ? "Here’s your plan for today:" : "No open tasks due today.",
          blocks,
        });
      }
  
      if (sub === "review") {
        // posts the sprint review prompt
        await fetch(`${base}/api/coach/review`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        return NextResponse.json({
          response_type: "ephemeral",
          text: "Posting sprint review prompt… check the channel.",
        });
      }
  
      // help
      return NextResponse.json({
        response_type: "ephemeral",
        text: "Usage: `/coach plan` | `/coach today` | `/coach review`",
      });
    }
  

  // --- /today ---
  if (command === "/today") {
    const teamId = process.env.LINEAR_TEAM_ID;
    if (!teamId) {
      return NextResponse.json({
        response_type: "ephemeral",
        text: "Missing LINEAR_TEAM_ID. Set it in your environment variables.",
      });
    }

    const issues = await fetchTodayTasks(teamId);
    const blocks = toTodayBlocks(issues as TodayIssue[]);

    return NextResponse.json({
      response_type: "ephemeral",
      text: issues.length
        ? "Here’s your plan for today:"
        : "No open tasks due today.",
      blocks,
    });
  }

  // --- optional stubs that can be expanded later ---
  if (command === "/ask") {
    return NextResponse.json({
      response_type: "ephemeral",
      text:
        text.length > 0
          ? `Got it. (Stub) I’d answer:\n> ${text}`
          : "Usage: `/ask <question>`",
    });
  }

  if (command === "/notes") {
    return NextResponse.json({
      response_type: "ephemeral",
      text:
        text.length > 0
          ? `Noted (stub). Saved: "${text}"`
          : "Usage: `/notes <quick note>`",
    });
  }

  if (command === "/retro") {
    return NextResponse.json({
      response_type: "ephemeral",
      text:
        text.length > 0
          ? `Retro (stub). Logged: "${text}"`
          : "Usage: `/retro <what went well / blockers / next focus>`",
    });
  }

  // Default help for unknown/no command
  return NextResponse.json({
    response_type: "ephemeral",
    text: "Commands: `/today`, `/ask <q>`, `/notes <text>`, `/retro`",
  });
}
