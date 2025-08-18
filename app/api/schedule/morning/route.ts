import { NextRequest, NextResponse } from "next/server";
import { todayPlan } from "@/lib/linear-planner";
import { postMessage } from "@/lib/slack";

export async function POST(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.SCHEDULE_TOKEN}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items } = await todayPlan();
  const text = items.length
    ? ["*Morning Plan (7:30)*", ...items.map((t,i)=>`${i+1}. ${t.title}`)].join("\n")
    : "*Morning Plan (7:30)*\nNo open tasks due today";

  await postMessage(process.env.SLACK_DEFAULT_CHANNEL_ID || "", text);
  return NextResponse.json({ ok: true, count: items.length });
}
