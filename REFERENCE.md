# 🚀 Coach-Bot Reference Workflow

## 📅 Daily Workflow

* **Morning (7:30 AM job or manual):**

  1. Run `fix-due-dates.mjs` with `ONLY_OVERDUE=1` to roll forward any overdue issues.

     ```bash
     export LINEAR_API_KEY="your_key"
     export LINEAR_TEAM_ID="your_team"
     export ONLY_OVERDUE=1
     node scripts/fix-due-dates.mjs
     ```
  2. Run `label-roadmap.mjs` to apply labels, estimates, and velocity tracking:

     ```bash
     export ITEMS_PER_WEEK=10
     export PHASE1_WEEKS=8
     export PHASE2_WEEKS=8
     export SET_ESTIMATES=1
     node scripts/label-roadmap.mjs
     ```
  3. Check Slack `/coach today` to see today’s plan.

* **Throughout the day:**

  * Update progress in Linear issues as you work.
  * Use `/coach focus` in Slack to get your next priority item.
  * Use `/coach done` when completing an issue.

* **End of day:**

  * Optional: Run `/coach summary` for a daily recap.
  * Push changes to Linear to keep velocity tracking accurate.

---

## 📆 Weekly Workflow

* **Monday morning:**

  * Run `/coach plan` in Slack for the week’s breakdown.
  * Verify due dates are aligned with your availability.

* **Friday afternoon:**

  * Use `/coach reflect` to review progress.
  * Decide if you’ll work extra days over the weekend.

---

## 💬 Slack Commands

* `/coach today` → shows tasks due today.
* `/coach plan` → shows tasks for the week.
* `/coach focus` → next priority item.
* `/coach summary` → recap of completed/remaining items.
* `/coach reflect` → weekly review.

---

## 💻 CLI Essentials

* **Relabel roadmap (with estimates):**

  ```bash
  export SET_ESTIMATES=1
  node scripts/label-roadmap.mjs
  ```

* **Fix overdue due dates (daily run):**

  ```bash
  export ONLY_OVERDUE=1
  node scripts/fix-due-dates.mjs
  ```

* **Force full realignment (rare):**

  ```bash
  unset ONLY_OVERDUE
  node scripts/fix-due-dates.mjs
  ```

* **Shift anchor start date (ad hoc):**

  ```bash
  export OVERRIDE_START_DATE="2025-09-01"
  node scripts/fix-due-dates.mjs
  ```

---

## 🛠️ Troubleshooting

**Issue:** Seeing Phase 3 labels
➡ Cause: Script defaulted to generating beyond Phase 2.
➡ Fix: Re-run `label-roadmap.mjs` with `PHASE1_WEEKS` and `PHASE2_WEEKS` set correctly.

**Issue:** GraphQL error about `addLabelIds`
➡ Cause: Wrong mutation fields.
➡ Fix: Use `addedLabelIds` and `removedLabelIds` instead.

**Issue:** Due dates assigned to weekends or vacation days
➡ Fix: Set environment variables:

```bash
export OFF_DATES="2025-09-05,2025-11-27"
export EXTRA_WORK_DATES="2025-09-14"
node scripts/fix-due-dates.mjs
```

---

## 🌴 Taking Days Off

When taking a day off, add it to `OFF_DATES` and re-run fixer:

```bash
export OFF_DATES="2025-09-05"
export ONLY_OVERDUE=1
node scripts/fix-due-dates.mjs
```

➡ Tasks will roll to the next valid workday.

---

## 💪 Working Extra Days (e.g., Weekend)

When working on a weekend or holiday, add to `EXTRA_WORK_DATES`:

```bash
export EXTRA_WORK_DATES="2025-09-14"
export ONLY_OVERDUE=1
node scripts/fix-due-dates.mjs
```

➡ Tasks can be assigned to that extra day.

---

## 🔑 Best Practices

* Keep `PROGRAM_START_DATE` as your “true” program anchor.
* Use `OVERRIDE_START_DATE` only for temporary shifts.
* Always dry-run before applying (`export DRY_RUN=1`).
* Let Slack be your daily driver; use CLI mainly for realignments.
