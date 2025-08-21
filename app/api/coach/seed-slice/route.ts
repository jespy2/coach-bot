import { NextRequest, NextResponse } from "next/server";
import { importFromRoadmap } from "@/lib/linear-planner";
import { promises as fs } from "fs";
import path from "path";

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
  const offset = Number(url.searchParams.get("offset") || "0");
  const limit  = Number(url.searchParams.get("limit")  || "60"); // default batch size

  const mdPath = path.join(process.cwd(), "weekly-roadmap.md");
  const md = await fs.readFile(mdPath, "utf8");

  const res = await importFromRoadmap(md, { todayFirst: true, offset, limit });
  return NextResponse.json({ ok:true, ...res });
}
