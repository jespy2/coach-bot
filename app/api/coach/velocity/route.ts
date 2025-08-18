import { NextRequest, NextResponse } from "next/server";
import { fetchDoneInRange, groupVelocityByWeek, averageVelocity } from "@/lib/velocity";
import { postBlocks } from "@/lib/slack";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const expected = `Bearer ${process.env.SCHEDULE_TOKEN}`;
  if (req.headers.get("authorization") !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teamId = process.env.LINEAR_TEAM_ID || "";
  const channel = process.env.SLACK_DEFAULT_CHANNEL_ID || "";

  // Last 6 completed weeks
  const today = new Date(); today.setHours(0,0,0,0);
  const to = today.toISOString().slice(0,10);
  const fromDate = new Date(today); fromDate.setDate(today.getDate() - 7*6);
  const from = fromDate.toISOString().slice(0,10);

  const done = await fetchDoneInRange(teamId, from, to);
  const grouped = groupVelocityByWeek(done);
  const entries = Object.entries(grouped).sort(([a],[b]) => a.localeCompare(b)); // by week
  const values = entries.map(([,v]) => v);
  const avg = averageVelocity(values);

  const lines = entries.length
    ? entries.map(([weekMon, hours]) => `• *${weekMon}* — ${hours}h`)
    : ["_No completed issues in the last 6 weeks._"];

  const capDay = Number(process.env.PLANNER_CAPACITY_PER_DAY || "3");
  const capWeek = capDay * 5;

  const blocks = [
    { type: "header", text: { type: "plain_text", text: "Velocity (last 6 weeks)", emoji: true } },
    { type: "section", text: { type: "mrkdwn", text: lines.join("\n") } },
    { type: "context", elements: [
      { type: "mrkdwn", text: `*Average:* ${avg}h/week • *Current capacity target:* ${capWeek}h/week (${capDay}h/day)` }
    ]}
  ];

  if (channel) await postBlocks(channel, "Velocity", blocks);
  return NextResponse.json({ ok: true, avg, weeks: entries });
}
