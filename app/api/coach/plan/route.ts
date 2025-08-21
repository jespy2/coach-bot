// app/api/coach/plan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { applyRoadmap, fetchWeeklyPlan } from "@/lib/linear-planner";

export const runtime = "nodejs";
export const maxDuration = 60; // give Linear import time

async function postBlocks(channel: string, title: string, blocks: any[]) {
  const token = process.env.SLACK_BOT_TOKEN!;
  if (!token) throw new Error("SLACK_BOT_TOKEN not set");
  await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      channel,
      text: title,
      blocks,
    }),
  });
}

export async function POST(req: NextRequest) {
  // simple bearer auth
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || token !== (process.env.SCHEDULE_TOKEN || "")) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    );
  }

  // if ?reset=1 then clear/reseed roadmap
  const reset = req.nextUrl.searchParams.get("reset") === "1";
  await applyRoadmap({ reset });

  // fetch weekly grouped issues for Slack
  const weekly = await fetchWeeklyPlan();
  const days = Object.keys(weekly).sort();
  const lines = days.length
    ? days.flatMap((d) => {
        const items = weekly[d].map((it: any) => `• ${it.title}`);
        return [`*${d}*`, ...items];
      })
    : ["_No issues scheduled this week_"];

  const blocks = [
    {
      type: "header",
      text: { type: "plain_text", text: "Sprint Plan (This Week)", emoji: true },
    },
    { type: "section", text: { type: "mrkdwn", text: lines.join("\n") } },
    {
      type: "context",
      elements: [
        { type: "mrkdwn", text: "Use `/coach today` for today’s checklist." },
      ],
    },
  ];

  // post to default Slack channel if configured
  const channel = process.env.SLACK_DEFAULT_CHANNEL_ID || "";
  if (channel) {
    await postBlocks(channel, "Sprint Plan (This Week)", blocks);
  }

  return NextResponse.json({ ok: true, blocks });
}
