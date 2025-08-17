import { NextRequest, NextResponse } from "next/server";
import { fetchTodayTasks } from "@/lib/linear";
import { postBlocks } from "@/lib/slack";

export const runtime = "nodejs";

type TodayIssue = {
  id: string;
  identifier: string;
  title: string;
  url?: string;
};

function toChecklistBlocks(issues: TodayIssue[]) {
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
    {
      type: "header",
      text: { type: "plain_text", text: "Morning Plan ☀️", emoji: true },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Date:* <!date^${Math.floor(
          Date.now() / 1000
        )}^{date_pretty} {time}|today>\n*Focus:* Top due items from Linear`,
      },
    },
    { type: "divider" },
    { type: "section", text: { type: "mrkdwn", text: list } },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "Mark done in Linear. Use `/today` to fetch again.",
        },
      ],
    },
  ];
}

export async function POST(req: NextRequest) {
  // --- simple bearer auth ---
  const auth = req.headers.get("authorization") || "";
  const token = process.env.SCHEDULE_TOKEN || "";
  if (!auth.startsWith("Bearer ") || auth.slice(7) !== token) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const channel = process.env.SLACK_DEFAULT_CHANNEL_ID;
  const teamId = process.env.LINEAR_TEAM_ID;
  if (!channel || !teamId) {
    return NextResponse.json(
      { ok: false, error: "missing SLACK_DEFAULT_CHANNEL_ID or LINEAR_TEAM_ID" },
      { status: 500 }
    );
  }

  // Fetch issues from Linear (expects [{ id, identifier, title, url? }])
  const issues = (await fetchTodayTasks(teamId)) as TodayIssue[];

  // Build and post blocks
  const blocks = toChecklistBlocks(issues);
  await postBlocks(channel, "Morning Plan", blocks);

  return NextResponse.json({ ok: true, count: issues.length });
}
