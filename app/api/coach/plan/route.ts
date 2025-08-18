import { NextRequest, NextResponse } from "next/server";
import { planWeek } from "@/lib/linear-planner";
import { postMessage } from "@/lib/slack";

export async function POST(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.SCHEDULE_TOKEN}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cap = Number(process.env.PLANNER_CAPACITY_PER_DAY || "3");
  const res = await planWeek(cap);

  const lines = res.scheduled.map(s => `• ${s.due} — ${s.title}`);
  
  await postMessage(process.env.SLACK_DEFAULT_CHANNEL_ID || "", [
    "*Sprint Plan (auto)*",
    `Capacity/day: ${cap}`,
    ...lines
  ].join("\n"));

  return NextResponse.json({ ok: true, scheduled: res.scheduled });
}
