# 📘 Coach-Bot Starter Lite

Coach-Bot Starter Lite is a lightweight automation toolkit that helps structure your **study roadmap, Linear issues, and weekly coaching workflow**. It labels tasks, injects templates, manages phases, and enforces consistency for your dev/DevOps training journey.

---

## 🚀 Features

* **Automatic labeling** of issues with:

  * `roadmap`, `week-X`, `phase-X`
  * Effort estimates (`effort:S/M/L`)
  * Type/area classifiers (e.g., `type:ci-cd`, `area:aws`)
* **Template injection** for missing issue descriptions.
* **Phase enforcement**: prevents drift into `phase-3` unless explicitly allowed.
* **Dry-run mode** for safe previews before applying changes.

---

## ⚙️ Setup

### Prerequisites

* Node.js (>= 18)
* A Linear API key (with read + write scope)

### Environment Variables

Create a `.env` file or export in your shell:

```bash
export LINEAR_API_KEY="lin_api_xxx"
export LINEAR_TEAM_ID="team-id-uuid"
export ITEMS_PER_WEEK=10
export PHASE1_WEEKS=8
export PHASE2_WEEKS=8
export AUTO_CLASSIFY=1
export INJECT_TEMPLATE=1
export SET_ESTIMATES=1
```

---

## 🛠️ Scripts

### Label Roadmap

Preview labels before applying:

```bash
export DRY_RUN=1
node scripts/label-roadmap.mjs
```

Apply labels:

```bash
unset DRY_RUN
node scripts/label-roadmap.mjs
```

### Fix Phases

Corrects `phase-3` drift back into `phase-2`:

```bash
node scripts/fix-phases.mjs
```

---

## 📅 Workflow

* **Weekly**: run `label-roadmap.mjs` to tag new issues and inject templates.
* **Cleanup**: run `fix-phases.mjs` on Friday before coach sync.
* **Slack**: share weekly progress, snippets, and reminders with `/remind`.

---

## 🔧 Troubleshooting

* **Error: `addLabelIds` not defined** → use `addedLabelIds`/`removedLabelIds`.
* **Rate limits** → add sleeps between requests.
* **Phase-3 drift** → run `fix-phases.mjs`.
* **Missing estimates** → ensure `SET_ESTIMATES=1` is set.

---

## 📄 License

MIT — free to use and extend.

---

## 🙌 Contributing

1. Fork the repo
2. Add scripts or tweak classifiers/templates
3. PRs welcome — especially for new automation helpers!

---

## 💡 Pro Tips

* Always test new runs with `DRY_RUN=1` first.
* Customize `classify()` in `label-roadmap.mjs` for your stack.
* Adjust `ITEMS_PER_WEEK` as your workload changes.
