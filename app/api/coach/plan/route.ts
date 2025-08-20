// app/api/coach/plan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { applyRoadmap, fetchWeeklyPlan } from "@/lib/linear-planner";

export const runtime = "nodejs";

async function postBlocks(channel:string, title:string, blocks:any[]){
  const token = process.env.SLACK_BOT_TOKEN!;
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
  // simple bearer auth
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || token !== (process.env.SCHEDULE_TOKEN || "")) {
    return NextResponse.json({ ok:false, error:"unauthorized" }, { status:401 });
  }

  // 1) Apply roadmap (labels, dates, normalize, move-today if enabled)
  await applyRoadmap({ reset: false });

  // 2) Build weekly plan blocks
  const weekly = await fetchWeeklyPlan();
  const days = Object.keys(weekly).sort();
  const lines = days.length
    ? days.flatMap(d => {
        const items = weekly[d].map(it => `• ${it.title}`);
        return [`*${d}*`, ...items];
      })
    : ["_No issues scheduled this week_"];

  const blocks = [
    { type: "header", text: { type: "plain_text", text: "Sprint Plan (This Week)", emoji: true } },
    { type: "section", text: { type: "mrkdwn", text: lines.join("\n") } },
    { type: "context", elements: [{ type: "mrkdwn", text: "Use `/coach today` for today’s checklist." }] },
  ];

  // 3) Post to channel (and return the same blocks to the caller)
  const channel = process.env.SLACK_DEFAULT_CHANNEL_ID || "";
  if (channel) {
    await postBlocks(channel, "Sprint Plan (This Week)", blocks);
  }

  return NextResponse.json({ ok:true, blocks });
}
