import { NextRequest, NextResponse } from "next/server";
import { postMessage } from "@/lib/slack";

export async function POST(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.SCHEDULE_TOKEN}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await postMessage(process.env.SLACK_DEFAULT_CHANNEL_ID || "", [
    "*Sprint Review*",
    "• What was planned vs done?",
    "• Biggest block(er)?",
    "• What will change next sprint?"
  ].join("\n"));

  return NextResponse.json({ ok: true });
}
