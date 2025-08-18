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

function getBaseUrl() {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.LOCAL_BASE_URL || "http://localhost:3000";
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

  // 1) First try: fetch issues due today
  let issues = (await fetchTodayTasks(teamId)) as TodayIssue[];

  // 2) If none, auto-run planner and retry once
  if (issues.length === 0) {
    try {
      const base = getBaseUrl();
      const resp = await fetch(`${base}/api/coach/plan`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      // Ignore non-200—fallback still posts "no tasks" gracefully
      if (!resp.ok) {
        console.warn(`[morning] planner call failed: ${resp.status} ${await resp.text()}`);
      }
    } catch (e) {
      console.warn(`[morning] planner call error: ${(e as Error).message}`);
    }

    // Re-fetch after planner attempt
    try {
      issues = (await fetchTodayTasks(teamId)) as TodayIssue[];
    } catch (e) {
      console.warn(`[morning] re-fetch after planning failed: ${(e as Error).message}`);
    }
  }

  // 3) Build and post blocks
  const blocks = toChecklistBlocks(issues);
  await postBlocks(channel, "Morning Plan", blocks);

  return NextResponse.json({ ok: true, count: issues.length });
}
