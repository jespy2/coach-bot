# Coach Bot Starter (Lite)
Minimal Next.js API routes + Linear + Slack + Supabase + OpenAI stubs.

## Quick start
1) `npm i`
2) copy `.env.example` to `.env.local` and fill values
3) `npm run dev` to run locally
4) Deploy to Vercel and set env vars there

Routes:
- POST /api/schedule/morning  -> posts daily plan to Slack (requires LINEAR + SLACK envs)
- POST /api/slack/commands    -> handles /ask, /notes, /retro (optional)
- POST /api/ingest            -> add notes to Supabase (optional)
