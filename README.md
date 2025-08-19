  # AI DevOps Training Assistant

A Linear-synced training assistant that auto-labels issues, sets dates from a roadmap, and moves the right work into **Todo** at the right time.

## What this project does

- Applies consistent labels:
  - `week-{N}` (1–16)
  - `phase-1` for weeks **1–8**, `phase-2` for weeks **9–16** (no `phase-3`)
  - `area:*`, `type:*`, `effort:S|M|L`
  - `milestone:capstone` (week 8 or explicitly detected)
- Sets **due dates** from the roadmap:
  - **Week 1 starts on Wednesday 2025-08-20**
  - **Weeks 2–16 start on Mondays**
  - Each issue’s due date = **start of its assigned week**
- Keeps the **Todo** column accurate:
  - Move **today’s** items into Todo, or
  - Move **the whole current week** into Todo
  - Optionally push future-dated items *out* of Todo

## Quick start

1) Create `.env.local`:

    LINEAR_API_KEY=lin_api_xxx
    LINEAR_TEAM_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    START_DATE=2025-08-20           # Week 1 anchor (Wednesday)
    TIMEZONE=America/Denver

2) Preview a full reset (no writes):

    DRY_RUN=1 node --env-file=.env.local scripts/reset-roadmap.mjs

3) Apply labels, dates, and descriptions:

    node --env-file=.env.local scripts/reset-roadmap.mjs

4) Keep Todo accurate (pick one):

   - **Today only**:

         ONLY_MOVE_TODAY=1 node --env-file=.env.local scripts/reset-roadmap.mjs

   - **Entire current week**:

         MOVE_BY_WEEK=1 node --env-file=.env.local scripts/reset-roadmap.mjs

5) Validate schedule:

    node --env-file=.env.local scripts/check-roadmap.mjs

## Scripts

- `scripts/reset-roadmap.mjs` — canonical reset (labels + dates + description + optional movement)
- `scripts/check-roadmap.mjs` — reports due-date vs. expected week windows

## Columns / states

If your team uses custom names, you can override detection:

    SOURCE_STATE_NAME="backlog" DEST_STATE_NAME="Todo (Today)" \
    node --env-file=.env.local scripts/reset-roadmap.mjs

- **Source** defaults to the state named “backlog” or type `backlog`
- **Dest** defaults to a state named “todo” or type `unstarted`/`triage`
