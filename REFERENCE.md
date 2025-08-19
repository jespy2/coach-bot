# Reference — Daily & Weekly Workflow (Slack‑first)

This is the **single-source handbook** for your AI DevOps Training Assistant. It prioritizes the **Slack integration** for day‑to‑day use, while keeping **CLI scripts** as a backup when you need local repairs.

- **Phases**: `phase-1` (weeks 1–8), `phase-2` (weeks 9–16)  
- **Week boundaries**: **Week 1** starts **Wed 2025‑08‑20**; **Weeks 2–16** start on **Mondays**  
- **Due-date rule**: each issue’s **due date = the start of its assigned week**  
- **Movement rule**: issues move **Backlog → Todo** via the **Planner** (Slack `/coach plan` or `POST /api/coach/plan`)  
- **TZ**: `America/Denver` (change via `PLANNER_TIMEZONE`)

Controlled namespaces: `week-*`, `phase-*`, `area:*`, `type:*`, `effort:S|M|L`, `milestone:capstone`.

---

## 1) Daily & Weekly Playbooks (Slack)

### Daily (Mon–Fri)

1) **Plan the day** (schedule & move today’s items into **Todo**):
   ```
   /coach plan
   ```

2) **Review today’s checklist** (no re‑plan):
   ```
   /coach today
   ```

3) **Work the list**. If **Todo** shows future‑dated items, just re‑run:
   ```
   /coach plan
   ```

> **Tip**: You can automate mornings with the HTTP endpoint `POST /api/schedule/morning` (see “Automation API”). It plans **only if today is empty**, then posts the checklist to Slack.

### Weekly (Monday)

1) **Kick off the week’s plan**:
   ```
   /coach plan
   ```

2) Optional hygiene passes (as needed):
   - Refresh labels/templates/estimates via CLI (see “CLI Backup & Repairs”)
   - Realign due dates if needed (e.g., after anchor changes or outages)

---

## 2) Slack Commands (Cheat Sheet)

> Use in DM with your bot. Some commands support `--dry` to preview (when applicable).

- **Plan & move to Todo**  
  ```
  /coach plan
  ```

- **Show today’s list**  
  ```
  /coach today
  ```

- **Velocity / Review**  
  ```
  /coach velocity
  /coach review
  ```

*(Optional commands you may add later: pin to week, set due date, label/unlabel; current repo primarily exposes the planner & summaries.)*

---

## 3) Automation API (Server)

- **Plan the day** (same outcome as `/coach plan`):
  ```bash
  curl -s -X POST https://<your-app-domain>/api/coach/plan     -H "Authorization: Bearer $SCHEDULE_TOKEN"
  ```

- **Morning schedule** (plan *only if* today is empty, then post checklist to Slack):
  ```bash
  curl -s -X POST https://<your-app-domain>/api/schedule/morning     -H "Authorization: Bearer $SCHEDULE_TOKEN"
  ```

> **Recommended schedule**: Weekdays at **08:00** in `PLANNER_TIMEZONE`.

---

## 4) Environment

Create `.env.local` in the repo root:

```env
# Linear
LINEAR_API_KEY=lin_api_xxx
LINEAR_TEAM_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Program anchors & calendar
PROGRAM_START_DATE=2025-08-20     # Week 1 anchor (Wed); Weeks 2+ auto-start Mon
PLANNER_TIMEZONE=America/Denver   # Affects “today” and week math

# Optional calendar controls (comma-separated ISO dates)
OFF_DATES=                       # e.g. 2025-09-01,2025-11-27
EXTRA_WORK_DATES=                # e.g. 2025-09-07
BLACKOUT_WEEKS=                  # e.g. 2025-11-24

# Planner behavior
PLANNER_CAPACITY_PER_DAY=5       # Max items planner will move/schedule per day
SCHEDULE_TOKEN=sh_xxx            # Bearer for protected endpoints
SLACK_DEFAULT_CHANNEL_ID=C012345 # Where daily posts go (optional)

# Script flags (set per-invocation; listed here for reference)
# DRY_RUN=1
# ONLY_OVERDUE=1
# AUTO_CLASSIFY=1
# INJECT_TEMPLATE=1
# SET_ESTIMATES=1
# OVERRIDE_START_DATE=YYYY-MM-DD
```

> **Compatibility note**: If older scripts expect `START_DATE`, set **both** `PROGRAM_START_DATE` and `START_DATE` to the same value.

---

## 5) CLI Backup & Repairs (local)

All scripts run from repo root and honor `.env.local`. **Dry‑run first**.

### A) Labeling / Templates / Estimates — `scripts/label-roadmap.mjs`

- Repairs `week-*`, `phase-*`, `area:*`, `type:*`, `effort:*`, `milestone:capstone`
- Can auto‑classify `area:*` / `type:*` from titles
- Can (re)generate the detailed description (Goal, Context, Plan, DoD, Timebox, Artifacts)
- Can set time estimates from `effort:*`

**Preview**:
```bash
DRY_RUN=1 node --env-file=.env.local scripts/label-roadmap.mjs
```

**Apply (with helpers)**:
```bash
AUTO_CLASSIFY=1 INJECT_TEMPLATE=1 SET_ESTIMATES=1 node --env-file=.env.local scripts/label-roadmap.mjs
```

### B) Due‑Date Repair — `scripts/fix-due-dates.mjs`

- Realigns due dates to week starts using `PROGRAM_START_DATE`
- Special case: **Week 1 = Wed 2025‑08‑20**, thereafter **Mondays**
- Honors `OFF_DATES`, `EXTRA_WORK_DATES`, `ONLY_OVERDUE`

**Preview**:
```bash
DRY_RUN=1 node --env-file=.env.local scripts/fix-due-dates.mjs
```

**Apply (all)**:
```bash
node --env-file=.env.local scripts/fix-due-dates.mjs
```

**Roll overdue forward only**:
```bash
ONLY_OVERDUE=1 node --env-file=.env.local scripts/fix-due-dates.mjs
```

**Temporary re‑anchor (one‑off)**:
```bash
OVERRIDE_START_DATE=2025-08-20 node --env-file=.env.local scripts/fix-due-dates.mjs
```

### C) Phase Cleanup — `scripts/fix-phases.mjs`

- Removes/repairs stale `phase-3` → `phase-2`
- Ensures phases match assigned weeks

**Preview**:
```bash
DRY_RUN=1 node --env-file=.env.local scripts/fix-phases.mjs
```

**Apply**:
```bash
node --env-file=.env.local scripts/fix-phases.mjs
```

---

## 6) Label & Effort Conventions

- **Phase**: `phase-1` (weeks 1–8), `phase-2` (weeks 9–16)  
- **Week**: `week-N` (N ∈ 1..16)  
- **Area**: `area:frontend`, `area:data-viz`, `area:ci-cd`, `area:aws`, `area:ai`, `area:terraform`, `area:jenkins`, `area:gha`, `area:k8s`, …  
- **Type**: `type:study`, `type:build`, `type:infra`, `type:review`, …  
- **Effort**: `effort:S` (~1h), `effort:M` (~2–3h), `effort:L` (~4–6h)  
- **Milestone**: `milestone:capstone` (week 8)

> The labeling script infers sensible defaults per week (e.g., Week 8 → `type:review`, `milestone:capstone`).

---

## 7) Troubleshooting

- **Todo is empty** → Run `/coach plan` (or POST `/api/coach/plan`)  
- **Dates look off by a day** → Verify `PLANNER_TIMEZONE=America/Denver`, re‑run `fix-due-dates.mjs`  
- **Week 1 wrong** → Confirm `PROGRAM_START_DATE=2025-08-20` (Wed); then `fix-due-dates.mjs`  
- **Too many items moved** → Lower `PLANNER_CAPACITY_PER_DAY`  
- **401 from endpoints** → Check `SCHEDULE_TOKEN` and Authorization header  
- **Stale `phase-3`** → Run `scripts/fix-phases.mjs`  
- **Descriptions/estimates missing** → `INJECT_TEMPLATE=1` and/or `SET_ESTIMATES=1` with `label-roadmap.mjs`

---

## 8) Quick Reference

**Slack (primary):**
```
/coach plan
/coach today
/coach velocity
/coach review
```

**API (automation):**
```bash
curl -s -X POST https://<your-app-domain>/api/coach/plan   -H "Authorization: Bearer $SCHEDULE_TOKEN"

curl -s -X POST https://<your-app-domain>/api/schedule/morning   -H "Authorization: Bearer $SCHEDULE_TOKEN"
```

**CLI (backup):**
```bash
DRY_RUN=1 node --env-file=.env.local scripts/label-roadmap.mjs
DRY_RUN=1 node --env-file=.env.local scripts/fix-due-dates.mjs
DRY_RUN=1 node --env-file=.env.local scripts/fix-phases.mjs
```
