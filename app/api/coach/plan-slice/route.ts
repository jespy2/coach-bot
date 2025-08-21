import { NextRequest, NextResponse } from "next/server";
import { applyRoadmap } from "@/lib/linear-planner";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // Auth
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || token !== (process.env.SCHEDULE_TOKEN || "")) {
    return NextResponse.json({ ok:false, error:"unauthorized" }, { status:401 });
  }

  const url = new URL(req.url);
  const reset = url.searchParams.get("reset") === "1";
  const start = Number(url.searchParams.get("start") || "1");
  const end   = Number(url.searchParams.get("end")   || "16");

  await applyRoadmap({ reset, range: [start, end] });
  return NextResponse.json({ ok:true, range:[start, end] });
}
