import { NextRequest, NextResponse } from "next/server";
import { importFromRoadmap } from "@/lib/linear-planner";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const maxDuration = 60;

function json(status: number, body: any) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function readRoadmapFile() {
  const p = path.join(process.cwd(), "weekly-roadmap.md");
  const md = await fs.readFile(p, "utf8");
  return { path: p, md, length: md.length };
}

export async function GET(req: NextRequest) {
  try {
    const { path: p, length } = await readRoadmapFile();
    return json(200, { ok: true, message: "seed-slice alive", roadmapPath: p, roadmapLength: length });
  } catch (err: any) {
    return json(500, { ok: false, error: "failed_to_read_roadmap", details: String(err?.message || err) });
  }
}

export async function POST(req: NextRequest) {
  // Auth
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || token !== (process.env.SCHEDULE_TOKEN || "")) {
    return json(401, { ok: false, error: "unauthorized" });
  }

  const url = new URL(req.url);
  const offset = Number(url.searchParams.get("offset") || "0");
  const limit  = Number(url.searchParams.get("limit")  || "12");
  const dry    = url.searchParams.get("dry") === "1";

  try {
    const { path: p, md, length } = await readRoadmapFile();
    if (dry) {
      // Dry run: parse order/length on the server without creating issues
      // importFromRoadmap returns counts only on mutate path; for dry we just echo file stats
      return json(200, { ok: true, dry: true, roadmapPath: p, roadmapLength: length, offset, limit });
    }

    const res = await importFromRoadmap(md, { todayFirst: true, offset, limit });
    return json(200, { ok: true, roadmapPath: p, offset, limit, ...res });
  } catch (err: any) {
    return json(500, { ok: false, error: "seed_failed", details: String(err?.message || err), offset, limit });
  }
}
