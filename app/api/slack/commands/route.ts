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
