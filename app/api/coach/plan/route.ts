// app/api/coach/plan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { applyRoadmap, fetchWeeklyPlan, importFromRoadmap } from "@/lib/linear-planner";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const maxDuration = 60; // avoid Vercel edge timeout

async function postBlocks(channel: string, title: string, blocks: any[]) {
  const token = process.env.SLACK_BOT_TOKEN!;
  if (!token) throw new Error("SLACK_BOT_TOKEN not set");
  await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ channel, text: title, blocks }),
  });
}

export async function POST(req: NextRequest) {
  // 0) Auth first so we don't do work if unauthorized
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || token !== (process.env.SCHEDULE_TOKEN || "")) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const url   = new URL(req.url);
  const reset = url.searchParams.get("reset") === "1";
  const seed  = url.searchParams.get("seed")  === "1";

  let imported = 0;

  // 1) Optional: import from weekly-roadmap.md (creates issues)
  if (seed) {
    const mdPath = path.join(process.cwd(), "weekly-roadmap.md");
    const md = await fs.readFile(mdPath, "utf8");
    await importFromRoadmap(md); // today/tomorrow -> Todo; weekly -> week-N + due start-of-week
    // We don't have a count returned from importFromRoadmap; if you want, you can modify it to return one.
    imported = 1; // signal that we seeded (for debugging/reporting)
  }

  // 2) Apply roadmap rules: week caps, due dates, stretch, templates, etc.
  await applyRoadmap({ reset });

  // 3) Build weekly view for Slack
  const weekly = await fetchWeeklyPlan();
  const days = Object.keys(weekly).sort();
  const lines = days.length
    ? days.flatMap((d) => {
        const items = weekly[d].map((it: any) => `• ${it.title}`);
        return [`*${d}*`, ...items];
      })
    : ["_No issues scheduled this week_"];

  const blocks = [
    { type: "header", text: { type: "plain_text", text: "Sprint Plan (This Week)", emoji: true } },
    { type: "section", text: { type: "mrkdwn", text: lines.join("\n") } },
    { type: "context", elements: [{ type: "mrkdwn", text: "Use `/today` for today’s checklist." }] },
  ];

  // 4) Post to default Slack channel (optional)
  const channel = process.env.SLACK_DEFAULT_CHANNEL_ID || "";
  if (channel) {
    await postBlocks(channel, "Sprint Plan (This Week)", blocks);
  }

  return NextResponse.json({ ok: true, imported, blocks });
}
