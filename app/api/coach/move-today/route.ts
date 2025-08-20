// app/api/coach/move-today/route.ts
import { NextRequest, NextResponse } from "next/server";
import { moveDueToday, fetchTodayChecklist } from "@/lib/linear-planner";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || token !== (process.env.SCHEDULE_TOKEN || "")) {
    return NextResponse.json({ ok:false, error:"unauthorized" }, { status:401 });
  }

  await moveDueToday();
  const issues = await fetchTodayChecklist();

  const list = issues.length
    ? issues.map((i, idx) => `:white_large_square: *${idx + 1}.* <${i.url ?? "#"}|${i.title}>`).join("\n")
    : "_No open tasks due today_";

  const blocks = [
    { type: "header", text: { type: "plain_text", text: "Today’s Plan", emoji: true } },
    { type: "section", text: { type: "mrkdwn", text: list } },
  ];

  return NextResponse.json({ ok:true, blocks });
}
