import { NextRequest, NextResponse } from "next/server";
import { planWeek, fetchWeeklyPlan, currentProgramWeek } from "@/lib/linear-planner";
import { postBlocks } from "@/lib/slack";

export async function POST(req: NextRequest) {
  // Auth
  const expected = `Bearer ${process.env.SCHEDULE_TOKEN}`;
  if (req.headers.get("authorization") !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const channel = process.env.SLACK_DEFAULT_CHANNEL_ID || "";
  const teamId = process.env.LINEAR_TEAM_ID || "";
  const cap = Number(process.env.PLANNER_CAPACITY_PER_DAY || "3");
  const programStart = process.env.PROGRAM_START_DATE || "unset";
  const weekNum = currentProgramWeek(process.env.PROGRAM_START_DATE);

  try {
    // 1) Schedule the week (assign due dates, move to Todo)
    const scheduled = (await planWeek(cap)).scheduled;

    // 2) Build a weekly view (Mon–Fri) after scheduling
    const weekly = teamId ? await fetchWeeklyPlan(teamId) : {};
    const days = Object.keys(weekly).sort(); // YYYY-MM-DD

    const scheduledLines = scheduled.length
      ? scheduled.map(s => `• ${s.due} — ${s.title}`)
      : ["_No items scheduled (blackout week or empty backlog for this week label)._"];

    const weeklyLines = days.length
      ? days.flatMap(d => [`*${d}*`, ...weekly[d].map(it => `• ${it.title}`)])
      : ["_No issues with due dates this Mon–Fri._"];

    const blocks = [
      { type: "header", text: { type: "plain_text", text: `Sprint Plan (Week ${weekNum})`, emoji: true } },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            `*Capacity/day:* ${cap}`,
            `*Program start:* ${programStart}`,
            `*Scheduled (this run):*`,
            ...scheduledLines,
            "",
            "*This week overview (Mon–Fri):*",
            ...weeklyLines
          ].join("\n")
        }
      },
      { type: "context", elements: [{ type: "mrkdwn", text: "Use `/coach today` for today’s checklist." }] }
    ];

    if (channel) await postBlocks(channel, "Sprint Plan", blocks);
    return NextResponse.json({ ok: true, week: weekNum, scheduledCount: scheduled.length });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "plan failed" }, { status: 500 });
  }
}
