// app/api/coach/plan/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  applyRoadmap,
  fetchWeeklyPlan,
  importFromRoadmap,
  type WeeklyPlan,
} from "@/lib/linear-planner";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const maxDuration = 60; // avoids Edge timeouts for Linear calls

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
  // --- Auth first ---
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || token !== (process.env.SCHEDULE_TOKEN || "")) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const reset = url.searchParams.get("reset") === "1";
  const seed  = url.searchParams.get("seed") === "1";

  let imported = 0;

  // --- Optional: seed from weekly-roadmap.md (creates issues) ---
  if (seed) {
    const mdPath = path.join(process.cwd(), "weekly-roadmap.md");
    const md = await fs.readFile(mdPath, "utf8");
    // importFromRoadmap may not return a count in your version; it's fine
    const res: any = await importFromRoadmap(md);
    if (res && typeof res.imported === "number") imported = res.imported;
  }

  // --- Apply roadmap rules (labels/dates/caps/stretch) ---
  await applyRoadmap({ reset });

  // --- Build weekly view for Slack ---
  const weekly: WeeklyPlan = (await fetchWeeklyPlan()) ?? {};
  const days = Object.keys(weekly).sort();
  const lines = days.length
    ? days.flatMap((d) => {
        const items = weekly[d].map((it) => `• ${it.title}`);
        return [`*${d}*`, ...items];
      })
    : ["_No issues scheduled this week_"];

  const blocks = [
    { type: "header", text: { type: "plain_text", text: "Sprint Plan (This Week)", emoji: true } },
    { type: "section", text: { type: "mrkdwn", text: lines.join("\n") } },
    { type: "context", elements: [{ type: "mrkdwn", text: "Use `/today` for today’s checklist." }] },
  ];

  // --- Optionally post to Slack ---
  const channel = process.env.SLACK_DEFAULT_CHANNEL_ID || "";
  if (channel) {
    await postBlocks(channel, "Sprint Plan (This Week)", blocks);
  }

  return NextResponse.json({ ok: true, imported, blocks });
}
