import { fetchTodayTasks } from "@/lib/linear";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type TodayIssue = {
	id: string;
	identifier: string;
	title: string;
	url?: string;
};

/** Verify Slack request signature per https://api.slack.com/authentication/verifying-requests-from-slack */
function verifySlackSignature(req: NextRequest, rawBody: string): boolean {
	const ts = req.headers.get("x-slack-request-timestamp") || "";
	const sig = req.headers.get("x-slack-signature") || "";
	const secret = process.env.SLACK_SIGNING_SECRET || "";

	if (!secret || !ts || !sig) return false;

	// Replay protection (5 minutes)
	const now = Math.floor(Date.now() / 1000);
	if (Math.abs(now - Number(ts)) > 60 * 5) return false;

	const base = `v0:${ts}:${rawBody}`;
	const hmac = crypto.createHmac("sha256", secret).update(base).digest("hex");
	const expected = `v0=${hmac}`;

	try {
		// timingSafeEqual throws if lengths differ; handle gracefully
		if (expected.length !== sig.length) return false;
		return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
	} catch {
		return false;
	}
}

function toTodayBlocks(issues: TodayIssue[]) {
	const list =
		issues.length > 0
			? issues
					.map(
						(i, idx) =>
							`:white_large_square: *${idx + 1}.* <${i.url ?? "#"}|${i.title}>`
					)
					.join("\n")
			: "_No open tasks due today_";

	return [
		{
			type: "header",
			text: { type: "plain_text", text: "Today’s Plan", emoji: true },
		},
		{ type: "section", text: { type: "mrkdwn", text: list } },
	];
}

export async function POST(req: NextRequest) {
	// Slack sends x-www-form-urlencoded; we must read the raw body for signature verification
	const rawBody = await req.text();

	if (!verifySlackSignature(req, rawBody)) {
		return NextResponse.json(
			{ ok: false, error: "bad signature" },
			{ status: 401 }
		);
	}

	const params = new URLSearchParams(rawBody);
	const command = (params.get("command") || "").trim();
	const text = (params.get("text") || "").trim();
	// const userId = params.get("user_id") || "";
	// const channelId = params.get("channel_id") || "";
	// const responseUrl = params.get("response_url") || "";

	// --- /coach ---
	if (command === "/coach") {
		const sub = text.split(/\s+/)[0] || "";

		const baseUrl = new URL(req.url).origin;
		const token = process.env.SCHEDULE_TOKEN || "";
		const channel = process.env.SLACK_DEFAULT_CHANNEL_ID || "";
		const teamId = process.env.LINEAR_TEAM_ID || "";

		if (sub === "velocity") {
			await fetch(`${baseUrl}/api/coach/velocity`, {
				method: "POST",
				headers: { Authorization: `Bearer ${token}` },
			}).catch(() => {});
			return NextResponse.json({
				response_type: "ephemeral",
				text: "Posted velocity to the channel.",
			});
		}

		if (sub === "plan") {
			// 1) Fire-and-forget the heavy weekly planner that posts to the channel.
    fetch(`${baseUrl}/api/coach/plan`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postToSlack: true }),
    }).catch((e) => console.error("planner call failed", e));

    // 2) Build a SAFE preview for the ephemeral response
    const MAX_ITEMS = 12;      // prevent too-long lists
    const MAX_TEXT = 2700;     // keep under Slack's ~3k char limit for section text

    // small helper to trim safely for Slack
    const trimForSlack = (s: string, max = MAX_TEXT) =>
      s.length <= max ? s : s.slice(0, max - 20) + " …";

    let blocks: any[] | null = null;
    let previewText = "Planning for this week… I’ll post the full plan shortly.";

    try {
      const { fetchTodayTasks } = await import("@/lib/linear");
      const items = await fetchTodayTasks(teamId);

      // shape: [{ id, title, url? }, ...]
      const shown = (items ?? []).slice(0, MAX_ITEMS);
      const extra = Math.max(0, (items?.length ?? 0) - shown.length);

      if (shown.length) {
        const list = trimForSlack(
          shown
            .map((i, idx) => `• *${idx + 1}.* <${i.url ?? "#"}|${i.title}>`)
            .join("\n")
        );

        const suffix = extra > 0 ? `\n…and *${extra}* more due today.` : "";

        blocks = [
          { type: "section", text: { type: "mrkdwn", text: `*Today (preview)*\n${list}${suffix}` } },
        ];

        previewText = extra > 0
          ? `Here’s a quick preview for today (+${extra} more). I’ll post the full weekly plan shortly.`
          : `Here’s a quick preview for today. I’ll post the full weekly plan shortly.`;
      } else {
        blocks = [
          { type: "section", text: { type: "mrkdwn", text: "_No open tasks due today._\nI’ll post the weekly plan shortly." } },
        ];
        previewText = "No open tasks due today. I’ll post the weekly plan shortly.";
      }
    } catch (e) {
      // If preview fails, we still ACK fast below
      console.error("preview build failed", e);
      blocks = null;
      previewText = "On it — planning now. I’ll post the weekly plan shortly.";
    }

    // 3) Immediate ephemeral reply (valid shape, safe size)
    if (blocks) {
      return NextResponse.json({
        response_type: "ephemeral",
        text: previewText,      // fallback text for clients without blocks
        blocks,
      });
    }
    return NextResponse.json({
      response_type: "ephemeral",
      text: previewText,
    });
		}

		if (sub === "today") {
			// 1) Fetch the list directly so we can show it to you immediately
			const teamId = process.env.LINEAR_TEAM_ID!;
			const issues = (await fetchTodayTasks(teamId)) as TodayIssue[];

			// 2) Build blocks for both ephemeral reply and channel post
			const blocks = toTodayBlocks(issues);

			// 3) Fire-and-forget channel post via our existing endpoint (optional)
			// (If this fails, at least you saw the ephemeral list.)
			await fetch(`${baseUrl}/api/schedule/morning`, {
				method: "POST",
				headers: { Authorization: `Bearer ${token}` },
			}).catch(() => {
				/* ignore */
			});

			// 4) Show the checklist in your Slack client now
			return NextResponse.json({
				response_type: "ephemeral",
				text: issues.length
					? "Here’s your plan for today:"
					: "No open tasks due today.",
				blocks,
			});
		}

		if (sub === "review") {
			// posts the sprint review prompt
			await fetch(`${baseUrl}/api/coach/review`, {
				method: "POST",
				headers: { Authorization: `Bearer ${token}` },
			});
			return NextResponse.json({
				response_type: "ephemeral",
				text: "Posting sprint review prompt… check the channel.",
			});
		}

		// help
		return NextResponse.json({
			response_type: "ephemeral",
			text: "Usage: `/coach plan` | `/coach today` | `/coach review`",
		});
	}

	// --- /today ---
	if (command === "/today") {
		const teamId = process.env.LINEAR_TEAM_ID;
		if (!teamId) {
			return NextResponse.json({
				response_type: "ephemeral",
				text: "Missing LINEAR_TEAM_ID. Set it in your environment variables.",
			});
		}

		const issues = await fetchTodayTasks(teamId);
		const blocks = toTodayBlocks(issues as TodayIssue[]);

		return NextResponse.json({
			response_type: "ephemeral",
			text: issues.length
				? "Here’s your plan for today:"
				: "No open tasks due today.",
			blocks,
		});
	}

	// --- optional stubs that can be expanded later ---
	if (command === "/ask") {
		return NextResponse.json({
			response_type: "ephemeral",
			text:
				text.length > 0
					? `Got it. (Stub) I’d answer:\n> ${text}`
					: "Usage: `/ask <question>`",
		});
	}

	if (command === "/notes") {
		return NextResponse.json({
			response_type: "ephemeral",
			text:
				text.length > 0
					? `Noted (stub). Saved: "${text}"`
					: "Usage: `/notes <quick note>`",
		});
	}

	if (command === "/retro") {
		return NextResponse.json({
			response_type: "ephemeral",
			text:
				text.length > 0
					? `Retro (stub). Logged: "${text}"`
					: "Usage: `/retro <what went well / blockers / next focus>`",
		});
	}

	// Default help for unknown/no command
	return NextResponse.json({
		response_type: "ephemeral",
		text: "Commands: `/today`, `/ask <q>`, `/notes <text>`, `/retro`",
	});
}
