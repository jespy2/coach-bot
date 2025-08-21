# Weekly Roadmap (Weeks 1–18)

> **Start Date**: Wed, 2025-08-20

> **Phase 1**: Weeks 1–8 | **Phase 2**: Weeks 9–18

> **Week 1 Start**: Wed | **Other Weeks**: Monday


| Week | Phase   | Start Date | Theme                             |
|------|---------|-------------|-----------------------------------|
| 1    | phase-1 | 2025-08-20 | TypeScript & React Review |
| 2    | phase-1 | 2025-08-24 | Next.js Refresher |
| 3    | phase-1 | 2025-08-31 | Capstone: Project Setup & Repo Config |
| 4    | phase-1 | 2025-09-07 | DevOps: GitHub Actions CI |
| 5    | phase-1 | 2025-09-14 | Capstone: CI Pipeline & Pages Deployment |
| 6    | phase-1 | 2025-09-21 | DevOps: AWS + S3 + CloudFront |
| 7    | phase-1 | 2025-09-28 | Capstone: Observability & Logging |
| 8    | phase-1 | 2025-10-05 | Capstone Polish & Presentation Prep |
| 9    | phase-2 | 2025-10-12 | DevOps: Jenkins Fundamentals |
| 10   | phase-2 | 2025-10-19 | DevOps: GitHub Actions Advanced |
| 11   | phase-2 | 2025-10-26 | DevOps: Kubernetes Basics |
| 12   | phase-2 | 2025-11-02 | DevOps: Helm & Kustomize |
| 13   | phase-2 | 2025-11-09 | DevOps: Monitoring with Prometheus/Grafana |
| 14   | phase-2 | 2025-11-16 | AWS Certification Study: SAA-C03 |
| 15   | phase-2 | 2025-11-23 | Terraform Certification Study |
| 16   | phase-2 | 2025-11-30 | CI/CD Certification Study |
| 17   | phase-2 | 2025-12-07 | Capstone Extensions / Wrap-up |
| 18   | phase-2 | 2025-12-14 | Final Review & Retrospective |

---

## Week 1 — TypeScript & React Review
*Phase: phase-1*

### Task 1: TypeScript & React Review — Review differences between `any`, `unknown`, and `never`
- **Goal**: Deeply understand and apply the concepts from: Review differences between `any`, `unknown`, and `never`.
- **Context**: Part of **phase-1** focused on “TypeScript & React Review.”
- **Plan**:
1. Read TypeScript handbook pages on `any`, `unknown`, and `never`.
2. Create 3–5 code snippets demonstrating safe vs unsafe usage.
3. Refactor an existing function or utility to eliminate an unnecessary `any`.
4. Write brief notes comparing tradeoffs and when to prefer `unknown`.
- **Definition of Done**:
- Notes compare `any` vs `unknown` vs `never` with examples.
- One real code area refactored to remove an unnecessary `any`.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 2: TypeScript & React Review — Create a new Next.js project with TypeScript
- **Goal**: Complete Create a new Next.js project with TypeScript and ensure it aligns with the TypeScript & React Review outcomes.
- **Context**: Part of **phase-1** focused on “TypeScript & React Review.”
- **Plan**:
1. Scaffold a Next.js app with TypeScript (`create-next-app`).
2. Configure `eslint`, `prettier`, and strict TypeScript settings.
3. Add a sample route and simple component demonstrating the week’s theme.
4. Commit initial setup with a meaningful message.
- **Definition of Done**:
- Repo contains a working Next.js + TS scaffold with linting.
- App builds and runs locally; sample page demonstrates theme.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Repo URL
- Commit hash
- Local run instructions

### Task 3: TypeScript & React Review — Sketch dashboard layout wireframes and UI flow
- **Goal**: Produce actionable Sketch dashboard layout wireframes and UI flow to guide implementation.
- **Context**: Part of **phase-1** focused on “TypeScript & React Review.”
- **Plan**:
1. Identify core screens and primary user journeys.
2. Sketch low-fidelity wireframes (paper or tool of choice).
3. Review for accessibility (contrast, focus order, touch targets).
4. Export or snapshot sketches to the repo/wiki.
- **Definition of Done**:
- Wireframes for key screens exported and linked in repo.
- UI flow diagram covers main happy paths and one edge case.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Screenshots/PNG/PDF of wireframes
- Flow diagram

### Task 4: TypeScript & React Review — Read: What is DevOps & why does it matter?
- **Goal**: Extract key takeaways from Read: What is DevOps & why does it matter? and relate them to this week’s theme (TypeScript & React Review).
- **Context**: Part of **phase-1** focused on “TypeScript & React Review.”
- **Plan**:
1. Read the article/paper end-to-end; note unfamiliar terms.
2. Summarize 3–5 insights and how they connect to the theme.
3. Add 1 action item to apply a concept this week.
- **Definition of Done**:
- Summary (5–8 bullet points) committed to notes.
- At least one actionable idea scheduled on the board.
- **Timebox**: 0.5–1.5 hours
- **Artifacts**:
- Notes.md with summary

### Task 5: TypeScript & React Review — Reflect on what went well and what could improve
- **Goal**: Capture learnings and improvement actions based on this week’s work.
- **Context**: Part of **phase-1** focused on “TypeScript & React Review.”
- **Plan**:
1. List 3 things that went well and 3 that can improve.
2. Choose 1 process and 1 technical change to try next week.
3. Post reflection notes to the repo or your planning doc.
- **Definition of Done**:
- Reflection doc with W/WC/Actions committed to repo or shared.
- One experiment queued for next week.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 6: TypeScript & React Review — Pair program a related feature with a peer or assistant
- **Goal**: Co-build a small, working slice while sharing knowledge and validating approach.
- **Context**: Part of **phase-1** focused on “TypeScript & React Review.”
- **Plan**:
1. Schedule a 60–90 minute pairing session with a peer/assistant.
2. Define the tiny slice to implement and acceptance criteria.
3. Alternate driver/navigator roles and record key decisions.
4. Open a PR with notes from the session.
- **Definition of Done**:
- PR merged for the paired slice.
- Short session notes included in the PR or project docs.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 7: TypeScript & React Review — Write tests and type-check one capstone module
- **Goal**: Increase confidence by adding robust test coverage with type safety.
- **Context**: Part of **phase-1** focused on “TypeScript & React Review.”
- **Plan**:
1. Identify the module’s critical paths and edge cases.
2. Add unit tests (Jest + RTL or framework-appropriate).
3. Ensure types catch misuse (e.g., generics, discriminated unions).
4. Run coverage and add missing tests for branches.
- **Definition of Done**:
- Critical paths covered; target coverage agreed (e.g., 80%+ lines).
- Tests passing in CI; types catch misuse.
- **Timebox**: 2–4 hours
- **Artifacts**:
- Test report / coverage summary

### Task 8: TypeScript & React Review — Create or update your task board in Linear
- **Goal**: Complete Create or update your task board in Linear and ensure it aligns with the TypeScript & React Review outcomes.
- **Context**: Part of **phase-1** focused on “TypeScript & React Review.”
- **Plan**:
1. Create or update the project board with clear statuses.
2. Break down this week’s tasks into well-scoped issues.
3. Link issues to PRs and add estimates/owners as needed.
- **Definition of Done**:
- Board reflects current scope with statuses up to date.
- Issues have clear titles, descriptions, and links to PRs.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Board link
- Issue IDs

### Task 9: TypeScript & React Review — Record a 2-minute walkthrough of this week’s capstone progress
- **Goal**: Demonstrate progress and communicate outcomes to stakeholders.
- **Context**: Part of **phase-1** focused on “TypeScript & React Review.”
- **Plan**:
1. Draft a 30-second outline (problem → approach → demo → next steps).
2. Record a 2-minute screen capture with narration.
3. Upload video and link in the README/issue tracker.
- **Definition of Done**:
- 2-minute video uploaded and linked in README/issue.
- Stakeholders can view without access issues.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Video link
- Short outline

### Task 10: TypeScript & React Review — Push and deploy changes via GitHub Actions
- **Goal**: Ship changes through the CI pipeline and verify a healthy deployment.
- **Context**: Part of **phase-1** focused on “TypeScript & React Review.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

## Week 2 — Next.js Refresher
*Phase: phase-1*

### Task 1: Next.js Refresher — Refactor a legacy React component using strong TypeScript typing
- **Goal**: Complete: Refactor a legacy React component using strong TypeScript typing.
- **Context**: Part of **phase-1** focused on “Next.js Refresher.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 2: Next.js Refresher — Add file-based routing and navigation
- **Goal**: Complete: Add file-based routing and navigation.
- **Context**: Part of **phase-1** focused on “Next.js Refresher.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 3: Next.js Refresher — Create a GitHub repo and initial project plan
- **Goal**: Complete Create a GitHub repo and initial project plan and ensure it aligns with the Next.js Refresher outcomes.
- **Context**: Part of **phase-1** focused on “Next.js Refresher.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 4: Next.js Refresher — Set up a basic GitHub Actions workflow for linting
- **Goal**: Complete: Set up a basic GitHub Actions workflow for linting.
- **Context**: Part of **phase-1** focused on “Next.js Refresher.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

### Task 5: Next.js Refresher — Write a README update or technical blog post
- **Goal**: Complete: Write a README update or technical blog post.
- **Context**: Part of **phase-1** focused on “Next.js Refresher.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Notes.md with summary

### Task 6: Next.js Refresher — Pair program a related feature with a peer or assistant
- **Goal**: Co-build a small, working slice while sharing knowledge and validating approach.
- **Context**: Part of **phase-1** focused on “Next.js Refresher.”
- **Plan**:
1. Schedule a 60–90 minute pairing session with a peer/assistant.
2. Define the tiny slice to implement and acceptance criteria.
3. Alternate driver/navigator roles and record key decisions.
4. Open a PR with notes from the session.
- **Definition of Done**:
- PR merged for the paired slice.
- Short session notes included in the PR or project docs.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 7: Next.js Refresher — Write tests and type-check one capstone module
- **Goal**: Increase confidence by adding robust test coverage with type safety.
- **Context**: Part of **phase-1** focused on “Next.js Refresher.”
- **Plan**:
1. Identify the module’s critical paths and edge cases.
2. Add unit tests (Jest + RTL or framework-appropriate).
3. Ensure types catch misuse (e.g., generics, discriminated unions).
4. Run coverage and add missing tests for branches.
- **Definition of Done**:
- Critical paths covered; target coverage agreed (e.g., 80%+ lines).
- Tests passing in CI; types catch misuse.
- **Timebox**: 2–4 hours
- **Artifacts**:
- Test report / coverage summary

### Task 8: Next.js Refresher — Create or update your task board in Linear
- **Goal**: Complete Create or update your task board in Linear and ensure it aligns with the Next.js Refresher outcomes.
- **Context**: Part of **phase-1** focused on “Next.js Refresher.”
- **Plan**:
1. Create or update the project board with clear statuses.
2. Break down this week’s tasks into well-scoped issues.
3. Link issues to PRs and add estimates/owners as needed.
- **Definition of Done**:
- Board reflects current scope with statuses up to date.
- Issues have clear titles, descriptions, and links to PRs.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Board link
- Issue IDs

### Task 9: Next.js Refresher — Record a 2-minute walkthrough of this week’s capstone progress
- **Goal**: Demonstrate progress and communicate outcomes to stakeholders.
- **Context**: Part of **phase-1** focused on “Next.js Refresher.”
- **Plan**:
1. Draft a 30-second outline (problem → approach → demo → next steps).
2. Record a 2-minute screen capture with narration.
3. Upload video and link in the README/issue tracker.
- **Definition of Done**:
- 2-minute video uploaded and linked in README/issue.
- Stakeholders can view without access issues.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Video link
- Short outline

### Task 10: Next.js Refresher — Push and deploy changes via GitHub Actions
- **Goal**: Ship changes through the CI pipeline and verify a healthy deployment.
- **Context**: Part of **phase-1** focused on “Next.js Refresher.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

## Week 3 — Capstone: Project Setup & Repo Config
*Phase: phase-1*

### Task 1: Capstone: Project Setup & Repo Config — Build a form using `useReducer` and controlled components
- **Goal**: Complete: Build a form using `useReducer` and controlled components.
- **Context**: Part of **phase-1** focused on “Capstone: Project Setup & Repo Config.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 2: Capstone: Project Setup & Repo Config — Implement `getStaticProps` and `getServerSideProps`
- **Goal**: Complete: Implement `getStaticProps` and `getServerSideProps`.
- **Context**: Part of **phase-1** focused on “Capstone: Project Setup & Repo Config.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 3: Capstone: Project Setup & Repo Config — Build layout and sidebar shell for the dashboard
- **Goal**: Complete: Build layout and sidebar shell for the dashboard.
- **Context**: Part of **phase-1** focused on “Capstone: Project Setup & Repo Config.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 4: Capstone: Project Setup & Repo Config — Deploy static site to AWS S3 and configure CloudFront
- **Goal**: Ship changes through the CI pipeline and verify a healthy deployment.
- **Context**: Part of **phase-1** focused on “Capstone: Project Setup & Repo Config.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

### Task 5: Capstone: Project Setup & Repo Config — Summarize weekly learning in journal
- **Goal**: Complete: Summarize weekly learning in journal.
- **Context**: Part of **phase-1** focused on “Capstone: Project Setup & Repo Config.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 6: Capstone: Project Setup & Repo Config — Pair program a related feature with a peer or assistant
- **Goal**: Co-build a small, working slice while sharing knowledge and validating approach.
- **Context**: Part of **phase-1** focused on “Capstone: Project Setup & Repo Config.”
- **Plan**:
1. Schedule a 60–90 minute pairing session with a peer/assistant.
2. Define the tiny slice to implement and acceptance criteria.
3. Alternate driver/navigator roles and record key decisions.
4. Open a PR with notes from the session.
- **Definition of Done**:
- PR merged for the paired slice.
- Short session notes included in the PR or project docs.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 7: Capstone: Project Setup & Repo Config — Write tests and type-check one capstone module
- **Goal**: Increase confidence by adding robust test coverage with type safety.
- **Context**: Part of **phase-1** focused on “Capstone: Project Setup & Repo Config.”
- **Plan**:
1. Identify the module’s critical paths and edge cases.
2. Add unit tests (Jest + RTL or framework-appropriate).
3. Ensure types catch misuse (e.g., generics, discriminated unions).
4. Run coverage and add missing tests for branches.
- **Definition of Done**:
- Critical paths covered; target coverage agreed (e.g., 80%+ lines).
- Tests passing in CI; types catch misuse.
- **Timebox**: 2–4 hours
- **Artifacts**:
- Test report / coverage summary

### Task 8: Capstone: Project Setup & Repo Config — Create or update your task board in Linear
- **Goal**: Complete Create or update your task board in Linear and ensure it aligns with the Capstone: Project Setup & Repo Config outcomes.
- **Context**: Part of **phase-1** focused on “Capstone: Project Setup & Repo Config.”
- **Plan**:
1. Create or update the project board with clear statuses.
2. Break down this week’s tasks into well-scoped issues.
3. Link issues to PRs and add estimates/owners as needed.
- **Definition of Done**:
- Board reflects current scope with statuses up to date.
- Issues have clear titles, descriptions, and links to PRs.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Board link
- Issue IDs

### Task 9: Capstone: Project Setup & Repo Config — Record a 2-minute walkthrough of this week’s capstone progress
- **Goal**: Demonstrate progress and communicate outcomes to stakeholders.
- **Context**: Part of **phase-1** focused on “Capstone: Project Setup & Repo Config.”
- **Plan**:
1. Draft a 30-second outline (problem → approach → demo → next steps).
2. Record a 2-minute screen capture with narration.
3. Upload video and link in the README/issue tracker.
- **Definition of Done**:
- 2-minute video uploaded and linked in README/issue.
- Stakeholders can view without access issues.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Video link
- Short outline

### Task 10: Capstone: Project Setup & Repo Config — Push and deploy changes via GitHub Actions
- **Goal**: Ship changes through the CI pipeline and verify a healthy deployment.
- **Context**: Part of **phase-1** focused on “Capstone: Project Setup & Repo Config.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

## Week 4 — DevOps: GitHub Actions CI
*Phase: phase-1*

### Task 1: DevOps: GitHub Actions CI — Review differences between `any`, `unknown`, and `never`
- **Goal**: Deeply understand and apply the concepts from: Review differences between `any`, `unknown`, and `never`.
- **Context**: Part of **phase-1** focused on “DevOps: GitHub Actions CI.”
- **Plan**:
1. Read TypeScript handbook pages on `any`, `unknown`, and `never`.
2. Create 3–5 code snippets demonstrating safe vs unsafe usage.
3. Refactor an existing function or utility to eliminate an unnecessary `any`.
4. Write brief notes comparing tradeoffs and when to prefer `unknown`.
- **Definition of Done**:
- Notes compare `any` vs `unknown` vs `never` with examples.
- One real code area refactored to remove an unnecessary `any`.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 2: DevOps: GitHub Actions CI — Create a new Next.js project with TypeScript
- **Goal**: Complete Create a new Next.js project with TypeScript and ensure it aligns with the DevOps: GitHub Actions CI outcomes.
- **Context**: Part of **phase-1** focused on “DevOps: GitHub Actions CI.”
- **Plan**:
1. Scaffold a Next.js app with TypeScript (`create-next-app`).
2. Configure `eslint`, `prettier`, and strict TypeScript settings.
3. Add a sample route and simple component demonstrating the week’s theme.
4. Commit initial setup with a meaningful message.
- **Definition of Done**:
- Repo contains a working Next.js + TS scaffold with linting.
- App builds and runs locally; sample page demonstrates theme.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Repo URL
- Commit hash
- Local run instructions

### Task 3: DevOps: GitHub Actions CI — Sketch dashboard layout wireframes and UI flow
- **Goal**: Produce actionable Sketch dashboard layout wireframes and UI flow to guide implementation.
- **Context**: Part of **phase-1** focused on “DevOps: GitHub Actions CI.”
- **Plan**:
1. Identify core screens and primary user journeys.
2. Sketch low-fidelity wireframes (paper or tool of choice).
3. Review for accessibility (contrast, focus order, touch targets).
4. Export or snapshot sketches to the repo/wiki.
- **Definition of Done**:
- Wireframes for key screens exported and linked in repo.
- UI flow diagram covers main happy paths and one edge case.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Screenshots/PNG/PDF of wireframes
- Flow diagram

### Task 4: DevOps: GitHub Actions CI — Read: What is DevOps & why does it matter?
- **Goal**: Extract key takeaways from Read: What is DevOps & why does it matter? and relate them to this week’s theme (DevOps: GitHub Actions CI).
- **Context**: Part of **phase-1** focused on “DevOps: GitHub Actions CI.”
- **Plan**:
1. Read the article/paper end-to-end; note unfamiliar terms.
2. Summarize 3–5 insights and how they connect to the theme.
3. Add 1 action item to apply a concept this week.
- **Definition of Done**:
- Summary (5–8 bullet points) committed to notes.
- At least one actionable idea scheduled on the board.
- **Timebox**: 0.5–1.5 hours
- **Artifacts**:
- Notes.md with summary

### Task 5: DevOps: GitHub Actions CI — Reflect on what went well and what could improve
- **Goal**: Capture learnings and improvement actions based on this week’s work.
- **Context**: Part of **phase-1** focused on “DevOps: GitHub Actions CI.”
- **Plan**:
1. List 3 things that went well and 3 that can improve.
2. Choose 1 process and 1 technical change to try next week.
3. Post reflection notes to the repo or your planning doc.
- **Definition of Done**:
- Reflection doc with W/WC/Actions committed to repo or shared.
- One experiment queued for next week.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 6: DevOps: GitHub Actions CI — Pair program a related feature with a peer or assistant
- **Goal**: Co-build a small, working slice while sharing knowledge and validating approach.
- **Context**: Part of **phase-1** focused on “DevOps: GitHub Actions CI.”
- **Plan**:
1. Schedule a 60–90 minute pairing session with a peer/assistant.
2. Define the tiny slice to implement and acceptance criteria.
3. Alternate driver/navigator roles and record key decisions.
4. Open a PR with notes from the session.
- **Definition of Done**:
- PR merged for the paired slice.
- Short session notes included in the PR or project docs.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 7: DevOps: GitHub Actions CI — Write tests and type-check one capstone module
- **Goal**: Increase confidence by adding robust test coverage with type safety.
- **Context**: Part of **phase-1** focused on “DevOps: GitHub Actions CI.”
- **Plan**:
1. Identify the module’s critical paths and edge cases.
2. Add unit tests (Jest + RTL or framework-appropriate).
3. Ensure types catch misuse (e.g., generics, discriminated unions).
4. Run coverage and add missing tests for branches.
- **Definition of Done**:
- Critical paths covered; target coverage agreed (e.g., 80%+ lines).
- Tests passing in CI; types catch misuse.
- **Timebox**: 2–4 hours
- **Artifacts**:
- Test report / coverage summary

### Task 8: DevOps: GitHub Actions CI — Create or update your task board in Linear
- **Goal**: Complete Create or update your task board in Linear and ensure it aligns with the DevOps: GitHub Actions CI outcomes.
- **Context**: Part of **phase-1** focused on “DevOps: GitHub Actions CI.”
- **Plan**:
1. Create or update the project board with clear statuses.
2. Break down this week’s tasks into well-scoped issues.
3. Link issues to PRs and add estimates/owners as needed.
- **Definition of Done**:
- Board reflects current scope with statuses up to date.
- Issues have clear titles, descriptions, and links to PRs.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Board link
- Issue IDs

### Task 9: DevOps: GitHub Actions CI — Record a 2-minute walkthrough of this week’s capstone progress
- **Goal**: Demonstrate progress and communicate outcomes to stakeholders.
- **Context**: Part of **phase-1** focused on “DevOps: GitHub Actions CI.”
- **Plan**:
1. Draft a 30-second outline (problem → approach → demo → next steps).
2. Record a 2-minute screen capture with narration.
3. Upload video and link in the README/issue tracker.
- **Definition of Done**:
- 2-minute video uploaded and linked in README/issue.
- Stakeholders can view without access issues.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Video link
- Short outline

### Task 10: DevOps: GitHub Actions CI — Push and deploy changes via GitHub Actions
- **Goal**: Ship changes through the CI pipeline and verify a healthy deployment.
- **Context**: Part of **phase-1** focused on “DevOps: GitHub Actions CI.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

## Week 5 — Capstone: CI Pipeline & Pages Deployment
*Phase: phase-1*

### Task 1: Capstone: CI Pipeline & Pages Deployment — Refactor a legacy React component using strong TypeScript typing
- **Goal**: Complete: Refactor a legacy React component using strong TypeScript typing.
- **Context**: Part of **phase-1** focused on “Capstone: CI Pipeline & Pages Deployment.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 2: Capstone: CI Pipeline & Pages Deployment — Add file-based routing and navigation
- **Goal**: Complete: Add file-based routing and navigation.
- **Context**: Part of **phase-1** focused on “Capstone: CI Pipeline & Pages Deployment.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 3: Capstone: CI Pipeline & Pages Deployment — Create a GitHub repo and initial project plan
- **Goal**: Complete Create a GitHub repo and initial project plan and ensure it aligns with the Capstone: CI Pipeline & Pages Deployment outcomes.
- **Context**: Part of **phase-1** focused on “Capstone: CI Pipeline & Pages Deployment.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 4: Capstone: CI Pipeline & Pages Deployment — Set up a basic GitHub Actions workflow for linting
- **Goal**: Complete: Set up a basic GitHub Actions workflow for linting.
- **Context**: Part of **phase-1** focused on “Capstone: CI Pipeline & Pages Deployment.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

### Task 5: Capstone: CI Pipeline & Pages Deployment — Write a README update or technical blog post
- **Goal**: Complete: Write a README update or technical blog post.
- **Context**: Part of **phase-1** focused on “Capstone: CI Pipeline & Pages Deployment.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Notes.md with summary

### Task 6: Capstone: CI Pipeline & Pages Deployment — Pair program a related feature with a peer or assistant
- **Goal**: Co-build a small, working slice while sharing knowledge and validating approach.
- **Context**: Part of **phase-1** focused on “Capstone: CI Pipeline & Pages Deployment.”
- **Plan**:
1. Schedule a 60–90 minute pairing session with a peer/assistant.
2. Define the tiny slice to implement and acceptance criteria.
3. Alternate driver/navigator roles and record key decisions.
4. Open a PR with notes from the session.
- **Definition of Done**:
- PR merged for the paired slice.
- Short session notes included in the PR or project docs.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 7: Capstone: CI Pipeline & Pages Deployment — Write tests and type-check one capstone module
- **Goal**: Increase confidence by adding robust test coverage with type safety.
- **Context**: Part of **phase-1** focused on “Capstone: CI Pipeline & Pages Deployment.”
- **Plan**:
1. Identify the module’s critical paths and edge cases.
2. Add unit tests (Jest + RTL or framework-appropriate).
3. Ensure types catch misuse (e.g., generics, discriminated unions).
4. Run coverage and add missing tests for branches.
- **Definition of Done**:
- Critical paths covered; target coverage agreed (e.g., 80%+ lines).
- Tests passing in CI; types catch misuse.
- **Timebox**: 2–4 hours
- **Artifacts**:
- Test report / coverage summary

### Task 8: Capstone: CI Pipeline & Pages Deployment — Create or update your task board in Linear
- **Goal**: Complete Create or update your task board in Linear and ensure it aligns with the Capstone: CI Pipeline & Pages Deployment outcomes.
- **Context**: Part of **phase-1** focused on “Capstone: CI Pipeline & Pages Deployment.”
- **Plan**:
1. Create or update the project board with clear statuses.
2. Break down this week’s tasks into well-scoped issues.
3. Link issues to PRs and add estimates/owners as needed.
- **Definition of Done**:
- Board reflects current scope with statuses up to date.
- Issues have clear titles, descriptions, and links to PRs.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Board link
- Issue IDs

### Task 9: Capstone: CI Pipeline & Pages Deployment — Record a 2-minute walkthrough of this week’s capstone progress
- **Goal**: Demonstrate progress and communicate outcomes to stakeholders.
- **Context**: Part of **phase-1** focused on “Capstone: CI Pipeline & Pages Deployment.”
- **Plan**:
1. Draft a 30-second outline (problem → approach → demo → next steps).
2. Record a 2-minute screen capture with narration.
3. Upload video and link in the README/issue tracker.
- **Definition of Done**:
- 2-minute video uploaded and linked in README/issue.
- Stakeholders can view without access issues.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Video link
- Short outline

### Task 10: Capstone: CI Pipeline & Pages Deployment — Push and deploy changes via GitHub Actions
- **Goal**: Ship changes through the CI pipeline and verify a healthy deployment.
- **Context**: Part of **phase-1** focused on “Capstone: CI Pipeline & Pages Deployment.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

## Week 6 — DevOps: AWS + S3 + CloudFront
*Phase: phase-1*

### Task 1: DevOps: AWS + S3 + CloudFront — Build a form using `useReducer` and controlled components
- **Goal**: Complete: Build a form using `useReducer` and controlled components.
- **Context**: Part of **phase-1** focused on “DevOps: AWS + S3 + CloudFront.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 2: DevOps: AWS + S3 + CloudFront — Implement `getStaticProps` and `getServerSideProps`
- **Goal**: Complete: Implement `getStaticProps` and `getServerSideProps`.
- **Context**: Part of **phase-1** focused on “DevOps: AWS + S3 + CloudFront.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 3: DevOps: AWS + S3 + CloudFront — Build layout and sidebar shell for the dashboard
- **Goal**: Complete: Build layout and sidebar shell for the dashboard.
- **Context**: Part of **phase-1** focused on “DevOps: AWS + S3 + CloudFront.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 4: DevOps: AWS + S3 + CloudFront — Deploy static site to AWS S3 and configure CloudFront
- **Goal**: Ship changes through the CI pipeline and verify a healthy deployment.
- **Context**: Part of **phase-1** focused on “DevOps: AWS + S3 + CloudFront.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

### Task 5: DevOps: AWS + S3 + CloudFront — Summarize weekly learning in journal
- **Goal**: Complete: Summarize weekly learning in journal.
- **Context**: Part of **phase-1** focused on “DevOps: AWS + S3 + CloudFront.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 6: DevOps: AWS + S3 + CloudFront — Pair program a related feature with a peer or assistant
- **Goal**: Co-build a small, working slice while sharing knowledge and validating approach.
- **Context**: Part of **phase-1** focused on “DevOps: AWS + S3 + CloudFront.”
- **Plan**:
1. Schedule a 60–90 minute pairing session with a peer/assistant.
2. Define the tiny slice to implement and acceptance criteria.
3. Alternate driver/navigator roles and record key decisions.
4. Open a PR with notes from the session.
- **Definition of Done**:
- PR merged for the paired slice.
- Short session notes included in the PR or project docs.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 7: DevOps: AWS + S3 + CloudFront — Write tests and type-check one capstone module
- **Goal**: Increase confidence by adding robust test coverage with type safety.
- **Context**: Part of **phase-1** focused on “DevOps: AWS + S3 + CloudFront.”
- **Plan**:
1. Identify the module’s critical paths and edge cases.
2. Add unit tests (Jest + RTL or framework-appropriate).
3. Ensure types catch misuse (e.g., generics, discriminated unions).
4. Run coverage and add missing tests for branches.
- **Definition of Done**:
- Critical paths covered; target coverage agreed (e.g., 80%+ lines).
- Tests passing in CI; types catch misuse.
- **Timebox**: 2–4 hours
- **Artifacts**:
- Test report / coverage summary

### Task 8: DevOps: AWS + S3 + CloudFront — Create or update your task board in Linear
- **Goal**: Complete Create or update your task board in Linear and ensure it aligns with the DevOps: AWS + S3 + CloudFront outcomes.
- **Context**: Part of **phase-1** focused on “DevOps: AWS + S3 + CloudFront.”
- **Plan**:
1. Create or update the project board with clear statuses.
2. Break down this week’s tasks into well-scoped issues.
3. Link issues to PRs and add estimates/owners as needed.
- **Definition of Done**:
- Board reflects current scope with statuses up to date.
- Issues have clear titles, descriptions, and links to PRs.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Board link
- Issue IDs

### Task 9: DevOps: AWS + S3 + CloudFront — Record a 2-minute walkthrough of this week’s capstone progress
- **Goal**: Demonstrate progress and communicate outcomes to stakeholders.
- **Context**: Part of **phase-1** focused on “DevOps: AWS + S3 + CloudFront.”
- **Plan**:
1. Draft a 30-second outline (problem → approach → demo → next steps).
2. Record a 2-minute screen capture with narration.
3. Upload video and link in the README/issue tracker.
- **Definition of Done**:
- 2-minute video uploaded and linked in README/issue.
- Stakeholders can view without access issues.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Video link
- Short outline

### Task 10: DevOps: AWS + S3 + CloudFront — Push and deploy changes via GitHub Actions
- **Goal**: Ship changes through the CI pipeline and verify a healthy deployment.
- **Context**: Part of **phase-1** focused on “DevOps: AWS + S3 + CloudFront.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

## Week 7 — Capstone: Observability & Logging
*Phase: phase-1*

### Task 1: Capstone: Observability & Logging — Review differences between `any`, `unknown`, and `never`
- **Goal**: Deeply understand and apply the concepts from: Review differences between `any`, `unknown`, and `never`.
- **Context**: Part of **phase-1** focused on “Capstone: Observability & Logging.”
- **Plan**:
1. Read TypeScript handbook pages on `any`, `unknown`, and `never`.
2. Create 3–5 code snippets demonstrating safe vs unsafe usage.
3. Refactor an existing function or utility to eliminate an unnecessary `any`.
4. Write brief notes comparing tradeoffs and when to prefer `unknown`.
- **Definition of Done**:
- Notes compare `any` vs `unknown` vs `never` with examples.
- One real code area refactored to remove an unnecessary `any`.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 2: Capstone: Observability & Logging — Create a new Next.js project with TypeScript
- **Goal**: Complete Create a new Next.js project with TypeScript and ensure it aligns with the Capstone: Observability & Logging outcomes.
- **Context**: Part of **phase-1** focused on “Capstone: Observability & Logging.”
- **Plan**:
1. Scaffold a Next.js app with TypeScript (`create-next-app`).
2. Configure `eslint`, `prettier`, and strict TypeScript settings.
3. Add a sample route and simple component demonstrating the week’s theme.
4. Commit initial setup with a meaningful message.
- **Definition of Done**:
- Repo contains a working Next.js + TS scaffold with linting.
- App builds and runs locally; sample page demonstrates theme.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Repo URL
- Commit hash
- Local run instructions

### Task 3: Capstone: Observability & Logging — Sketch dashboard layout wireframes and UI flow
- **Goal**: Produce actionable Sketch dashboard layout wireframes and UI flow to guide implementation.
- **Context**: Part of **phase-1** focused on “Capstone: Observability & Logging.”
- **Plan**:
1. Identify core screens and primary user journeys.
2. Sketch low-fidelity wireframes (paper or tool of choice).
3. Review for accessibility (contrast, focus order, touch targets).
4. Export or snapshot sketches to the repo/wiki.
- **Definition of Done**:
- Wireframes for key screens exported and linked in repo.
- UI flow diagram covers main happy paths and one edge case.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Screenshots/PNG/PDF of wireframes
- Flow diagram

### Task 4: Capstone: Observability & Logging — Read: What is DevOps & why does it matter?
- **Goal**: Extract key takeaways from Read: What is DevOps & why does it matter? and relate them to this week’s theme (Capstone: Observability & Logging).
- **Context**: Part of **phase-1** focused on “Capstone: Observability & Logging.”
- **Plan**:
1. Read the article/paper end-to-end; note unfamiliar terms.
2. Summarize 3–5 insights and how they connect to the theme.
3. Add 1 action item to apply a concept this week.
- **Definition of Done**:
- Summary (5–8 bullet points) committed to notes.
- At least one actionable idea scheduled on the board.
- **Timebox**: 0.5–1.5 hours
- **Artifacts**:
- Notes.md with summary

### Task 5: Capstone: Observability & Logging — Reflect on what went well and what could improve
- **Goal**: Capture learnings and improvement actions based on this week’s work.
- **Context**: Part of **phase-1** focused on “Capstone: Observability & Logging.”
- **Plan**:
1. List 3 things that went well and 3 that can improve.
2. Choose 1 process and 1 technical change to try next week.
3. Post reflection notes to the repo or your planning doc.
- **Definition of Done**:
- Reflection doc with W/WC/Actions committed to repo or shared.
- One experiment queued for next week.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 6: Capstone: Observability & Logging — Pair program a related feature with a peer or assistant
- **Goal**: Co-build a small, working slice while sharing knowledge and validating approach.
- **Context**: Part of **phase-1** focused on “Capstone: Observability & Logging.”
- **Plan**:
1. Schedule a 60–90 minute pairing session with a peer/assistant.
2. Define the tiny slice to implement and acceptance criteria.
3. Alternate driver/navigator roles and record key decisions.
4. Open a PR with notes from the session.
- **Definition of Done**:
- PR merged for the paired slice.
- Short session notes included in the PR or project docs.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 7: Capstone: Observability & Logging — Write tests and type-check one capstone module
- **Goal**: Increase confidence by adding robust test coverage with type safety.
- **Context**: Part of **phase-1** focused on “Capstone: Observability & Logging.”
- **Plan**:
1. Identify the module’s critical paths and edge cases.
2. Add unit tests (Jest + RTL or framework-appropriate).
3. Ensure types catch misuse (e.g., generics, discriminated unions).
4. Run coverage and add missing tests for branches.
- **Definition of Done**:
- Critical paths covered; target coverage agreed (e.g., 80%+ lines).
- Tests passing in CI; types catch misuse.
- **Timebox**: 2–4 hours
- **Artifacts**:
- Test report / coverage summary

### Task 8: Capstone: Observability & Logging — Create or update your task board in Linear
- **Goal**: Complete Create or update your task board in Linear and ensure it aligns with the Capstone: Observability & Logging outcomes.
- **Context**: Part of **phase-1** focused on “Capstone: Observability & Logging.”
- **Plan**:
1. Create or update the project board with clear statuses.
2. Break down this week’s tasks into well-scoped issues.
3. Link issues to PRs and add estimates/owners as needed.
- **Definition of Done**:
- Board reflects current scope with statuses up to date.
- Issues have clear titles, descriptions, and links to PRs.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Board link
- Issue IDs

### Task 9: Capstone: Observability & Logging — Record a 2-minute walkthrough of this week’s capstone progress
- **Goal**: Demonstrate progress and communicate outcomes to stakeholders.
- **Context**: Part of **phase-1** focused on “Capstone: Observability & Logging.”
- **Plan**:
1. Draft a 30-second outline (problem → approach → demo → next steps).
2. Record a 2-minute screen capture with narration.
3. Upload video and link in the README/issue tracker.
- **Definition of Done**:
- 2-minute video uploaded and linked in README/issue.
- Stakeholders can view without access issues.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Video link
- Short outline

### Task 10: Capstone: Observability & Logging — Push and deploy changes via GitHub Actions
- **Goal**: Ship changes through the CI pipeline and verify a healthy deployment.
- **Context**: Part of **phase-1** focused on “Capstone: Observability & Logging.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

## Week 8 — Capstone Polish & Presentation Prep
*Phase: phase-1*

### Task 1: Capstone Polish & Presentation Prep — Refactor a legacy React component using strong TypeScript typing
- **Goal**: Complete: Refactor a legacy React component using strong TypeScript typing.
- **Context**: Part of **phase-1** focused on “Capstone Polish & Presentation Prep.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 2: Capstone Polish & Presentation Prep — Add file-based routing and navigation
- **Goal**: Complete: Add file-based routing and navigation.
- **Context**: Part of **phase-1** focused on “Capstone Polish & Presentation Prep.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 3: Capstone Polish & Presentation Prep — Create a GitHub repo and initial project plan
- **Goal**: Complete Create a GitHub repo and initial project plan and ensure it aligns with the Capstone Polish & Presentation Prep outcomes.
- **Context**: Part of **phase-1** focused on “Capstone Polish & Presentation Prep.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 4: Capstone Polish & Presentation Prep — Set up a basic GitHub Actions workflow for linting
- **Goal**: Complete: Set up a basic GitHub Actions workflow for linting.
- **Context**: Part of **phase-1** focused on “Capstone Polish & Presentation Prep.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

### Task 5: Capstone Polish & Presentation Prep — Write a README update or technical blog post
- **Goal**: Complete: Write a README update or technical blog post.
- **Context**: Part of **phase-1** focused on “Capstone Polish & Presentation Prep.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Notes.md with summary

### Task 6: Capstone Polish & Presentation Prep — Pair program a related feature with a peer or assistant
- **Goal**: Co-build a small, working slice while sharing knowledge and validating approach.
- **Context**: Part of **phase-1** focused on “Capstone Polish & Presentation Prep.”
- **Plan**:
1. Schedule a 60–90 minute pairing session with a peer/assistant.
2. Define the tiny slice to implement and acceptance criteria.
3. Alternate driver/navigator roles and record key decisions.
4. Open a PR with notes from the session.
- **Definition of Done**:
- PR merged for the paired slice.
- Short session notes included in the PR or project docs.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 7: Capstone Polish & Presentation Prep — Write tests and type-check one capstone module
- **Goal**: Increase confidence by adding robust test coverage with type safety.
- **Context**: Part of **phase-1** focused on “Capstone Polish & Presentation Prep.”
- **Plan**:
1. Identify the module’s critical paths and edge cases.
2. Add unit tests (Jest + RTL or framework-appropriate).
3. Ensure types catch misuse (e.g., generics, discriminated unions).
4. Run coverage and add missing tests for branches.
- **Definition of Done**:
- Critical paths covered; target coverage agreed (e.g., 80%+ lines).
- Tests passing in CI; types catch misuse.
- **Timebox**: 2–4 hours
- **Artifacts**:
- Test report / coverage summary

### Task 8: Capstone Polish & Presentation Prep — Create or update your task board in Linear
- **Goal**: Complete Create or update your task board in Linear and ensure it aligns with the Capstone Polish & Presentation Prep outcomes.
- **Context**: Part of **phase-1** focused on “Capstone Polish & Presentation Prep.”
- **Plan**:
1. Create or update the project board with clear statuses.
2. Break down this week’s tasks into well-scoped issues.
3. Link issues to PRs and add estimates/owners as needed.
- **Definition of Done**:
- Board reflects current scope with statuses up to date.
- Issues have clear titles, descriptions, and links to PRs.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Board link
- Issue IDs

### Task 9: Capstone Polish & Presentation Prep — Record a 2-minute walkthrough of this week’s capstone progress
- **Goal**: Demonstrate progress and communicate outcomes to stakeholders.
- **Context**: Part of **phase-1** focused on “Capstone Polish & Presentation Prep.”
- **Plan**:
1. Draft a 30-second outline (problem → approach → demo → next steps).
2. Record a 2-minute screen capture with narration.
3. Upload video and link in the README/issue tracker.
- **Definition of Done**:
- 2-minute video uploaded and linked in README/issue.
- Stakeholders can view without access issues.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Video link
- Short outline

### Task 10: Capstone Polish & Presentation Prep — Push and deploy changes via GitHub Actions
- **Goal**: Ship changes through the CI pipeline and verify a healthy deployment.
- **Context**: Part of **phase-1** focused on “Capstone Polish & Presentation Prep.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

## Week 9 — DevOps: Jenkins Fundamentals
*Phase: phase-2*

### Task 1: DevOps: Jenkins Fundamentals — Build a form using `useReducer` and controlled components
- **Goal**: Complete: Build a form using `useReducer` and controlled components.
- **Context**: Part of **phase-2** focused on “DevOps: Jenkins Fundamentals.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 2: DevOps: Jenkins Fundamentals — Implement `getStaticProps` and `getServerSideProps`
- **Goal**: Complete: Implement `getStaticProps` and `getServerSideProps`.
- **Context**: Part of **phase-2** focused on “DevOps: Jenkins Fundamentals.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 3: DevOps: Jenkins Fundamentals — Build layout and sidebar shell for the dashboard
- **Goal**: Complete: Build layout and sidebar shell for the dashboard.
- **Context**: Part of **phase-2** focused on “DevOps: Jenkins Fundamentals.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 4: DevOps: Jenkins Fundamentals — Deploy static site to AWS S3 and configure CloudFront
- **Goal**: Ship changes through the CI pipeline and verify a healthy deployment.
- **Context**: Part of **phase-2** focused on “DevOps: Jenkins Fundamentals.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

### Task 5: DevOps: Jenkins Fundamentals — Summarize weekly learning in journal
- **Goal**: Complete: Summarize weekly learning in journal.
- **Context**: Part of **phase-2** focused on “DevOps: Jenkins Fundamentals.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 6: DevOps: Jenkins Fundamentals — Pair program a related feature with a peer or assistant
- **Goal**: Co-build a small, working slice while sharing knowledge and validating approach.
- **Context**: Part of **phase-2** focused on “DevOps: Jenkins Fundamentals.”
- **Plan**:
1. Schedule a 60–90 minute pairing session with a peer/assistant.
2. Define the tiny slice to implement and acceptance criteria.
3. Alternate driver/navigator roles and record key decisions.
4. Open a PR with notes from the session.
- **Definition of Done**:
- PR merged for the paired slice.
- Short session notes included in the PR or project docs.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 7: DevOps: Jenkins Fundamentals — Write tests and type-check one capstone module
- **Goal**: Increase confidence by adding robust test coverage with type safety.
- **Context**: Part of **phase-2** focused on “DevOps: Jenkins Fundamentals.”
- **Plan**:
1. Identify the module’s critical paths and edge cases.
2. Add unit tests (Jest + RTL or framework-appropriate).
3. Ensure types catch misuse (e.g., generics, discriminated unions).
4. Run coverage and add missing tests for branches.
- **Definition of Done**:
- Critical paths covered; target coverage agreed (e.g., 80%+ lines).
- Tests passing in CI; types catch misuse.
- **Timebox**: 2–4 hours
- **Artifacts**:
- Test report / coverage summary

### Task 8: DevOps: Jenkins Fundamentals — Create or update your task board in Linear
- **Goal**: Complete Create or update your task board in Linear and ensure it aligns with the DevOps: Jenkins Fundamentals outcomes.
- **Context**: Part of **phase-2** focused on “DevOps: Jenkins Fundamentals.”
- **Plan**:
1. Create or update the project board with clear statuses.
2. Break down this week’s tasks into well-scoped issues.
3. Link issues to PRs and add estimates/owners as needed.
- **Definition of Done**:
- Board reflects current scope with statuses up to date.
- Issues have clear titles, descriptions, and links to PRs.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Board link
- Issue IDs

### Task 9: DevOps: Jenkins Fundamentals — Record a 2-minute walkthrough of this week’s capstone progress
- **Goal**: Demonstrate progress and communicate outcomes to stakeholders.
- **Context**: Part of **phase-2** focused on “DevOps: Jenkins Fundamentals.”
- **Plan**:
1. Draft a 30-second outline (problem → approach → demo → next steps).
2. Record a 2-minute screen capture with narration.
3. Upload video and link in the README/issue tracker.
- **Definition of Done**:
- 2-minute video uploaded and linked in README/issue.
- Stakeholders can view without access issues.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Video link
- Short outline

### Task 10: DevOps: Jenkins Fundamentals — Push and deploy changes via GitHub Actions
- **Goal**: Ship changes through the CI pipeline and verify a healthy deployment.
- **Context**: Part of **phase-2** focused on “DevOps: Jenkins Fundamentals.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

## Week 10 — DevOps: GitHub Actions Advanced
*Phase: phase-2*

### Task 1: DevOps: GitHub Actions Advanced — Review differences between `any`, `unknown`, and `never`
- **Goal**: Deeply understand and apply the concepts from: Review differences between `any`, `unknown`, and `never`.
- **Context**: Part of **phase-2** focused on “DevOps: GitHub Actions Advanced.”
- **Plan**:
1. Read TypeScript handbook pages on `any`, `unknown`, and `never`.
2. Create 3–5 code snippets demonstrating safe vs unsafe usage.
3. Refactor an existing function or utility to eliminate an unnecessary `any`.
4. Write brief notes comparing tradeoffs and when to prefer `unknown`.
- **Definition of Done**:
- Notes compare `any` vs `unknown` vs `never` with examples.
- One real code area refactored to remove an unnecessary `any`.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 2: DevOps: GitHub Actions Advanced — Create a new Next.js project with TypeScript
- **Goal**: Complete Create a new Next.js project with TypeScript and ensure it aligns with the DevOps: GitHub Actions Advanced outcomes.
- **Context**: Part of **phase-2** focused on “DevOps: GitHub Actions Advanced.”
- **Plan**:
1. Scaffold a Next.js app with TypeScript (`create-next-app`).
2. Configure `eslint`, `prettier`, and strict TypeScript settings.
3. Add a sample route and simple component demonstrating the week’s theme.
4. Commit initial setup with a meaningful message.
- **Definition of Done**:
- Repo contains a working Next.js + TS scaffold with linting.
- App builds and runs locally; sample page demonstrates theme.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Repo URL
- Commit hash
- Local run instructions

### Task 3: DevOps: GitHub Actions Advanced — Sketch dashboard layout wireframes and UI flow
- **Goal**: Produce actionable Sketch dashboard layout wireframes and UI flow to guide implementation.
- **Context**: Part of **phase-2** focused on “DevOps: GitHub Actions Advanced.”
- **Plan**:
1. Identify core screens and primary user journeys.
2. Sketch low-fidelity wireframes (paper or tool of choice).
3. Review for accessibility (contrast, focus order, touch targets).
4. Export or snapshot sketches to the repo/wiki.
- **Definition of Done**:
- Wireframes for key screens exported and linked in repo.
- UI flow diagram covers main happy paths and one edge case.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Screenshots/PNG/PDF of wireframes
- Flow diagram

### Task 4: DevOps: GitHub Actions Advanced — Read: What is DevOps & why does it matter?
- **Goal**: Extract key takeaways from Read: What is DevOps & why does it matter? and relate them to this week’s theme (DevOps: GitHub Actions Advanced).
- **Context**: Part of **phase-2** focused on “DevOps: GitHub Actions Advanced.”
- **Plan**:
1. Read the article/paper end-to-end; note unfamiliar terms.
2. Summarize 3–5 insights and how they connect to the theme.
3. Add 1 action item to apply a concept this week.
- **Definition of Done**:
- Summary (5–8 bullet points) committed to notes.
- At least one actionable idea scheduled on the board.
- **Timebox**: 0.5–1.5 hours
- **Artifacts**:
- Notes.md with summary

### Task 5: DevOps: GitHub Actions Advanced — Reflect on what went well and what could improve
- **Goal**: Capture learnings and improvement actions based on this week’s work.
- **Context**: Part of **phase-2** focused on “DevOps: GitHub Actions Advanced.”
- **Plan**:
1. List 3 things that went well and 3 that can improve.
2. Choose 1 process and 1 technical change to try next week.
3. Post reflection notes to the repo or your planning doc.
- **Definition of Done**:
- Reflection doc with W/WC/Actions committed to repo or shared.
- One experiment queued for next week.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 6: DevOps: GitHub Actions Advanced — Pair program a related feature with a peer or assistant
- **Goal**: Co-build a small, working slice while sharing knowledge and validating approach.
- **Context**: Part of **phase-2** focused on “DevOps: GitHub Actions Advanced.”
- **Plan**:
1. Schedule a 60–90 minute pairing session with a peer/assistant.
2. Define the tiny slice to implement and acceptance criteria.
3. Alternate driver/navigator roles and record key decisions.
4. Open a PR with notes from the session.
- **Definition of Done**:
- PR merged for the paired slice.
- Short session notes included in the PR or project docs.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 7: DevOps: GitHub Actions Advanced — Write tests and type-check one capstone module
- **Goal**: Increase confidence by adding robust test coverage with type safety.
- **Context**: Part of **phase-2** focused on “DevOps: GitHub Actions Advanced.”
- **Plan**:
1. Identify the module’s critical paths and edge cases.
2. Add unit tests (Jest + RTL or framework-appropriate).
3. Ensure types catch misuse (e.g., generics, discriminated unions).
4. Run coverage and add missing tests for branches.
- **Definition of Done**:
- Critical paths covered; target coverage agreed (e.g., 80%+ lines).
- Tests passing in CI; types catch misuse.
- **Timebox**: 2–4 hours
- **Artifacts**:
- Test report / coverage summary

### Task 8: DevOps: GitHub Actions Advanced — Create or update your task board in Linear
- **Goal**: Complete Create or update your task board in Linear and ensure it aligns with the DevOps: GitHub Actions Advanced outcomes.
- **Context**: Part of **phase-2** focused on “DevOps: GitHub Actions Advanced.”
- **Plan**:
1. Create or update the project board with clear statuses.
2. Break down this week’s tasks into well-scoped issues.
3. Link issues to PRs and add estimates/owners as needed.
- **Definition of Done**:
- Board reflects current scope with statuses up to date.
- Issues have clear titles, descriptions, and links to PRs.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Board link
- Issue IDs

### Task 9: DevOps: GitHub Actions Advanced — Record a 2-minute walkthrough of this week’s capstone progress
- **Goal**: Demonstrate progress and communicate outcomes to stakeholders.
- **Context**: Part of **phase-2** focused on “DevOps: GitHub Actions Advanced.”
- **Plan**:
1. Draft a 30-second outline (problem → approach → demo → next steps).
2. Record a 2-minute screen capture with narration.
3. Upload video and link in the README/issue tracker.
- **Definition of Done**:
- 2-minute video uploaded and linked in README/issue.
- Stakeholders can view without access issues.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Video link
- Short outline

### Task 10: DevOps: GitHub Actions Advanced — Push and deploy changes via GitHub Actions
- **Goal**: Ship changes through the CI pipeline and verify a healthy deployment.
- **Context**: Part of **phase-2** focused on “DevOps: GitHub Actions Advanced.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

## Week 11 — DevOps: Kubernetes Basics
*Phase: phase-2*

### Task 1: DevOps: Kubernetes Basics — Refactor a legacy React component using strong TypeScript typing
- **Goal**: Complete: Refactor a legacy React component using strong TypeScript typing.
- **Context**: Part of **phase-2** focused on “DevOps: Kubernetes Basics.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 2: DevOps: Kubernetes Basics — Add file-based routing and navigation
- **Goal**: Complete: Add file-based routing and navigation.
- **Context**: Part of **phase-2** focused on “DevOps: Kubernetes Basics.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 3: DevOps: Kubernetes Basics — Create a GitHub repo and initial project plan
- **Goal**: Complete Create a GitHub repo and initial project plan and ensure it aligns with the DevOps: Kubernetes Basics outcomes.
- **Context**: Part of **phase-2** focused on “DevOps: Kubernetes Basics.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 4: DevOps: Kubernetes Basics — Set up a basic GitHub Actions workflow for linting
- **Goal**: Complete: Set up a basic GitHub Actions workflow for linting.
- **Context**: Part of **phase-2** focused on “DevOps: Kubernetes Basics.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

### Task 5: DevOps: Kubernetes Basics — Write a README update or technical blog post
- **Goal**: Complete: Write a README update or technical blog post.
- **Context**: Part of **phase-2** focused on “DevOps: Kubernetes Basics.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Notes.md with summary

### Task 6: DevOps: Kubernetes Basics — Pair program a related feature with a peer or assistant
- **Goal**: Co-build a small, working slice while sharing knowledge and validating approach.
- **Context**: Part of **phase-2** focused on “DevOps: Kubernetes Basics.”
- **Plan**:
1. Schedule a 60–90 minute pairing session with a peer/assistant.
2. Define the tiny slice to implement and acceptance criteria.
3. Alternate driver/navigator roles and record key decisions.
4. Open a PR with notes from the session.
- **Definition of Done**:
- PR merged for the paired slice.
- Short session notes included in the PR or project docs.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 7: DevOps: Kubernetes Basics — Write tests and type-check one capstone module
- **Goal**: Increase confidence by adding robust test coverage with type safety.
- **Context**: Part of **phase-2** focused on “DevOps: Kubernetes Basics.”
- **Plan**:
1. Identify the module’s critical paths and edge cases.
2. Add unit tests (Jest + RTL or framework-appropriate).
3. Ensure types catch misuse (e.g., generics, discriminated unions).
4. Run coverage and add missing tests for branches.
- **Definition of Done**:
- Critical paths covered; target coverage agreed (e.g., 80%+ lines).
- Tests passing in CI; types catch misuse.
- **Timebox**: 2–4 hours
- **Artifacts**:
- Test report / coverage summary

### Task 8: DevOps: Kubernetes Basics — Create or update your task board in Linear
- **Goal**: Complete Create or update your task board in Linear and ensure it aligns with the DevOps: Kubernetes Basics outcomes.
- **Context**: Part of **phase-2** focused on “DevOps: Kubernetes Basics.”
- **Plan**:
1. Create or update the project board with clear statuses.
2. Break down this week’s tasks into well-scoped issues.
3. Link issues to PRs and add estimates/owners as needed.
- **Definition of Done**:
- Board reflects current scope with statuses up to date.
- Issues have clear titles, descriptions, and links to PRs.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Board link
- Issue IDs

### Task 9: DevOps: Kubernetes Basics — Record a 2-minute walkthrough of this week’s capstone progress
- **Goal**: Demonstrate progress and communicate outcomes to stakeholders.
- **Context**: Part of **phase-2** focused on “DevOps: Kubernetes Basics.”
- **Plan**:
1. Draft a 30-second outline (problem → approach → demo → next steps).
2. Record a 2-minute screen capture with narration.
3. Upload video and link in the README/issue tracker.
- **Definition of Done**:
- 2-minute video uploaded and linked in README/issue.
- Stakeholders can view without access issues.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Video link
- Short outline

### Task 10: DevOps: Kubernetes Basics — Push and deploy changes via GitHub Actions
- **Goal**: Ship changes through the CI pipeline and verify a healthy deployment.
- **Context**: Part of **phase-2** focused on “DevOps: Kubernetes Basics.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

## Week 12 — DevOps: Helm & Kustomize
*Phase: phase-2*

### Task 1: DevOps: Helm & Kustomize — Build a form using `useReducer` and controlled components
- **Goal**: Complete: Build a form using `useReducer` and controlled components.
- **Context**: Part of **phase-2** focused on “DevOps: Helm & Kustomize.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 2: DevOps: Helm & Kustomize — Implement `getStaticProps` and `getServerSideProps`
- **Goal**: Complete: Implement `getStaticProps` and `getServerSideProps`.
- **Context**: Part of **phase-2** focused on “DevOps: Helm & Kustomize.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 3: DevOps: Helm & Kustomize — Build layout and sidebar shell for the dashboard
- **Goal**: Complete: Build layout and sidebar shell for the dashboard.
- **Context**: Part of **phase-2** focused on “DevOps: Helm & Kustomize.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 4: DevOps: Helm & Kustomize — Deploy static site to AWS S3 and configure CloudFront
- **Goal**: Ship changes through the CI pipeline and verify a healthy deployment.
- **Context**: Part of **phase-2** focused on “DevOps: Helm & Kustomize.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

### Task 5: DevOps: Helm & Kustomize — Summarize weekly learning in journal
- **Goal**: Complete: Summarize weekly learning in journal.
- **Context**: Part of **phase-2** focused on “DevOps: Helm & Kustomize.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 6: DevOps: Helm & Kustomize — Pair program a related feature with a peer or assistant
- **Goal**: Co-build a small, working slice while sharing knowledge and validating approach.
- **Context**: Part of **phase-2** focused on “DevOps: Helm & Kustomize.”
- **Plan**:
1. Schedule a 60–90 minute pairing session with a peer/assistant.
2. Define the tiny slice to implement and acceptance criteria.
3. Alternate driver/navigator roles and record key decisions.
4. Open a PR with notes from the session.
- **Definition of Done**:
- PR merged for the paired slice.
- Short session notes included in the PR or project docs.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 7: DevOps: Helm & Kustomize — Write tests and type-check one capstone module
- **Goal**: Increase confidence by adding robust test coverage with type safety.
- **Context**: Part of **phase-2** focused on “DevOps: Helm & Kustomize.”
- **Plan**:
1. Identify the module’s critical paths and edge cases.
2. Add unit tests (Jest + RTL or framework-appropriate).
3. Ensure types catch misuse (e.g., generics, discriminated unions).
4. Run coverage and add missing tests for branches.
- **Definition of Done**:
- Critical paths covered; target coverage agreed (e.g., 80%+ lines).
- Tests passing in CI; types catch misuse.
- **Timebox**: 2–4 hours
- **Artifacts**:
- Test report / coverage summary

### Task 8: DevOps: Helm & Kustomize — Create or update your task board in Linear
- **Goal**: Complete Create or update your task board in Linear and ensure it aligns with the DevOps: Helm & Kustomize outcomes.
- **Context**: Part of **phase-2** focused on “DevOps: Helm & Kustomize.”
- **Plan**:
1. Create or update the project board with clear statuses.
2. Break down this week’s tasks into well-scoped issues.
3. Link issues to PRs and add estimates/owners as needed.
- **Definition of Done**:
- Board reflects current scope with statuses up to date.
- Issues have clear titles, descriptions, and links to PRs.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Board link
- Issue IDs

### Task 9: DevOps: Helm & Kustomize — Record a 2-minute walkthrough of this week’s capstone progress
- **Goal**: Demonstrate progress and communicate outcomes to stakeholders.
- **Context**: Part of **phase-2** focused on “DevOps: Helm & Kustomize.”
- **Plan**:
1. Draft a 30-second outline (problem → approach → demo → next steps).
2. Record a 2-minute screen capture with narration.
3. Upload video and link in the README/issue tracker.
- **Definition of Done**:
- 2-minute video uploaded and linked in README/issue.
- Stakeholders can view without access issues.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Video link
- Short outline

### Task 10: DevOps: Helm & Kustomize — Push and deploy changes via GitHub Actions
- **Goal**: Ship changes through the CI pipeline and verify a healthy deployment.
- **Context**: Part of **phase-2** focused on “DevOps: Helm & Kustomize.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

## Week 13 — DevOps: Monitoring with Prometheus/Grafana
*Phase: phase-2*

### Task 1: DevOps: Monitoring with Prometheus/Grafana — Review differences between `any`, `unknown`, and `never`
- **Goal**: Deeply understand and apply the concepts from: Review differences between `any`, `unknown`, and `never`.
- **Context**: Part of **phase-2** focused on “DevOps: Monitoring with Prometheus/Grafana.”
- **Plan**:
1. Read TypeScript handbook pages on `any`, `unknown`, and `never`.
2. Create 3–5 code snippets demonstrating safe vs unsafe usage.
3. Refactor an existing function or utility to eliminate an unnecessary `any`.
4. Write brief notes comparing tradeoffs and when to prefer `unknown`.
- **Definition of Done**:
- Notes compare `any` vs `unknown` vs `never` with examples.
- One real code area refactored to remove an unnecessary `any`.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 2: DevOps: Monitoring with Prometheus/Grafana — Create a new Next.js project with TypeScript
- **Goal**: Complete Create a new Next.js project with TypeScript and ensure it aligns with the DevOps: Monitoring with Prometheus/Grafana outcomes.
- **Context**: Part of **phase-2** focused on “DevOps: Monitoring with Prometheus/Grafana.”
- **Plan**:
1. Scaffold a Next.js app with TypeScript (`create-next-app`).
2. Configure `eslint`, `prettier`, and strict TypeScript settings.
3. Add a sample route and simple component demonstrating the week’s theme.
4. Commit initial setup with a meaningful message.
- **Definition of Done**:
- Repo contains a working Next.js + TS scaffold with linting.
- App builds and runs locally; sample page demonstrates theme.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Repo URL
- Commit hash
- Local run instructions

### Task 3: DevOps: Monitoring with Prometheus/Grafana — Sketch dashboard layout wireframes and UI flow
- **Goal**: Produce actionable Sketch dashboard layout wireframes and UI flow to guide implementation.
- **Context**: Part of **phase-2** focused on “DevOps: Monitoring with Prometheus/Grafana.”
- **Plan**:
1. Identify core screens and primary user journeys.
2. Sketch low-fidelity wireframes (paper or tool of choice).
3. Review for accessibility (contrast, focus order, touch targets).
4. Export or snapshot sketches to the repo/wiki.
- **Definition of Done**:
- Wireframes for key screens exported and linked in repo.
- UI flow diagram covers main happy paths and one edge case.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Screenshots/PNG/PDF of wireframes
- Flow diagram

### Task 4: DevOps: Monitoring with Prometheus/Grafana — Read: What is DevOps & why does it matter?
- **Goal**: Extract key takeaways from Read: What is DevOps & why does it matter? and relate them to this week’s theme (DevOps: Monitoring with Prometheus/Grafana).
- **Context**: Part of **phase-2** focused on “DevOps: Monitoring with Prometheus/Grafana.”
- **Plan**:
1. Read the article/paper end-to-end; note unfamiliar terms.
2. Summarize 3–5 insights and how they connect to the theme.
3. Add 1 action item to apply a concept this week.
- **Definition of Done**:
- Summary (5–8 bullet points) committed to notes.
- At least one actionable idea scheduled on the board.
- **Timebox**: 0.5–1.5 hours
- **Artifacts**:
- Notes.md with summary

### Task 5: DevOps: Monitoring with Prometheus/Grafana — Reflect on what went well and what could improve
- **Goal**: Capture learnings and improvement actions based on this week’s work.
- **Context**: Part of **phase-2** focused on “DevOps: Monitoring with Prometheus/Grafana.”
- **Plan**:
1. List 3 things that went well and 3 that can improve.
2. Choose 1 process and 1 technical change to try next week.
3. Post reflection notes to the repo or your planning doc.
- **Definition of Done**:
- Reflection doc with W/WC/Actions committed to repo or shared.
- One experiment queued for next week.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 6: DevOps: Monitoring with Prometheus/Grafana — Pair program a related feature with a peer or assistant
- **Goal**: Co-build a small, working slice while sharing knowledge and validating approach.
- **Context**: Part of **phase-2** focused on “DevOps: Monitoring with Prometheus/Grafana.”
- **Plan**:
1. Schedule a 60–90 minute pairing session with a peer/assistant.
2. Define the tiny slice to implement and acceptance criteria.
3. Alternate driver/navigator roles and record key decisions.
4. Open a PR with notes from the session.
- **Definition of Done**:
- PR merged for the paired slice.
- Short session notes included in the PR or project docs.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 7: DevOps: Monitoring with Prometheus/Grafana — Write tests and type-check one capstone module
- **Goal**: Increase confidence by adding robust test coverage with type safety.
- **Context**: Part of **phase-2** focused on “DevOps: Monitoring with Prometheus/Grafana.”
- **Plan**:
1. Identify the module’s critical paths and edge cases.
2. Add unit tests (Jest + RTL or framework-appropriate).
3. Ensure types catch misuse (e.g., generics, discriminated unions).
4. Run coverage and add missing tests for branches.
- **Definition of Done**:
- Critical paths covered; target coverage agreed (e.g., 80%+ lines).
- Tests passing in CI; types catch misuse.
- **Timebox**: 2–4 hours
- **Artifacts**:
- Test report / coverage summary

### Task 8: DevOps: Monitoring with Prometheus/Grafana — Create or update your task board in Linear
- **Goal**: Complete Create or update your task board in Linear and ensure it aligns with the DevOps: Monitoring with Prometheus/Grafana outcomes.
- **Context**: Part of **phase-2** focused on “DevOps: Monitoring with Prometheus/Grafana.”
- **Plan**:
1. Create or update the project board with clear statuses.
2. Break down this week’s tasks into well-scoped issues.
3. Link issues to PRs and add estimates/owners as needed.
- **Definition of Done**:
- Board reflects current scope with statuses up to date.
- Issues have clear titles, descriptions, and links to PRs.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Board link
- Issue IDs

### Task 9: DevOps: Monitoring with Prometheus/Grafana — Record a 2-minute walkthrough of this week’s capstone progress
- **Goal**: Demonstrate progress and communicate outcomes to stakeholders.
- **Context**: Part of **phase-2** focused on “DevOps: Monitoring with Prometheus/Grafana.”
- **Plan**:
1. Draft a 30-second outline (problem → approach → demo → next steps).
2. Record a 2-minute screen capture with narration.
3. Upload video and link in the README/issue tracker.
- **Definition of Done**:
- 2-minute video uploaded and linked in README/issue.
- Stakeholders can view without access issues.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Video link
- Short outline

### Task 10: DevOps: Monitoring with Prometheus/Grafana — Push and deploy changes via GitHub Actions
- **Goal**: Ship changes through the CI pipeline and verify a healthy deployment.
- **Context**: Part of **phase-2** focused on “DevOps: Monitoring with Prometheus/Grafana.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

## Week 14 — AWS Certification Study: SAA-C03
*Phase: phase-2*

### Task 1: AWS Certification Study: SAA-C03 — Refactor a legacy React component using strong TypeScript typing
- **Goal**: Complete: Refactor a legacy React component using strong TypeScript typing.
- **Context**: Part of **phase-2** focused on “AWS Certification Study: SAA-C03.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 2: AWS Certification Study: SAA-C03 — Add file-based routing and navigation
- **Goal**: Complete: Add file-based routing and navigation.
- **Context**: Part of **phase-2** focused on “AWS Certification Study: SAA-C03.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 3: AWS Certification Study: SAA-C03 — Create a GitHub repo and initial project plan
- **Goal**: Complete Create a GitHub repo and initial project plan and ensure it aligns with the AWS Certification Study: SAA-C03 outcomes.
- **Context**: Part of **phase-2** focused on “AWS Certification Study: SAA-C03.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 4: AWS Certification Study: SAA-C03 — Set up a basic GitHub Actions workflow for linting
- **Goal**: Complete: Set up a basic GitHub Actions workflow for linting.
- **Context**: Part of **phase-2** focused on “AWS Certification Study: SAA-C03.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

### Task 5: AWS Certification Study: SAA-C03 — Write a README update or technical blog post
- **Goal**: Complete: Write a README update or technical blog post.
- **Context**: Part of **phase-2** focused on “AWS Certification Study: SAA-C03.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Notes.md with summary

### Task 6: AWS Certification Study: SAA-C03 — Pair program a related feature with a peer or assistant
- **Goal**: Co-build a small, working slice while sharing knowledge and validating approach.
- **Context**: Part of **phase-2** focused on “AWS Certification Study: SAA-C03.”
- **Plan**:
1. Schedule a 60–90 minute pairing session with a peer/assistant.
2. Define the tiny slice to implement and acceptance criteria.
3. Alternate driver/navigator roles and record key decisions.
4. Open a PR with notes from the session.
- **Definition of Done**:
- PR merged for the paired slice.
- Short session notes included in the PR or project docs.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 7: AWS Certification Study: SAA-C03 — Write tests and type-check one capstone module
- **Goal**: Increase confidence by adding robust test coverage with type safety.
- **Context**: Part of **phase-2** focused on “AWS Certification Study: SAA-C03.”
- **Plan**:
1. Identify the module’s critical paths and edge cases.
2. Add unit tests (Jest + RTL or framework-appropriate).
3. Ensure types catch misuse (e.g., generics, discriminated unions).
4. Run coverage and add missing tests for branches.
- **Definition of Done**:
- Critical paths covered; target coverage agreed (e.g., 80%+ lines).
- Tests passing in CI; types catch misuse.
- **Timebox**: 2–4 hours
- **Artifacts**:
- Test report / coverage summary

### Task 8: AWS Certification Study: SAA-C03 — Create or update your task board in Linear
- **Goal**: Complete Create or update your task board in Linear and ensure it aligns with the AWS Certification Study: SAA-C03 outcomes.
- **Context**: Part of **phase-2** focused on “AWS Certification Study: SAA-C03.”
- **Plan**:
1. Create or update the project board with clear statuses.
2. Break down this week’s tasks into well-scoped issues.
3. Link issues to PRs and add estimates/owners as needed.
- **Definition of Done**:
- Board reflects current scope with statuses up to date.
- Issues have clear titles, descriptions, and links to PRs.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Board link
- Issue IDs

### Task 9: AWS Certification Study: SAA-C03 — Record a 2-minute walkthrough of this week’s capstone progress
- **Goal**: Demonstrate progress and communicate outcomes to stakeholders.
- **Context**: Part of **phase-2** focused on “AWS Certification Study: SAA-C03.”
- **Plan**:
1. Draft a 30-second outline (problem → approach → demo → next steps).
2. Record a 2-minute screen capture with narration.
3. Upload video and link in the README/issue tracker.
- **Definition of Done**:
- 2-minute video uploaded and linked in README/issue.
- Stakeholders can view without access issues.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Video link
- Short outline

### Task 10: AWS Certification Study: SAA-C03 — Push and deploy changes via GitHub Actions
- **Goal**: Ship changes through the CI pipeline and verify a healthy deployment.
- **Context**: Part of **phase-2** focused on “AWS Certification Study: SAA-C03.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

## Week 15 — Terraform Certification Study
*Phase: phase-2*

### Task 1: Terraform Certification Study — Build a form using `useReducer` and controlled components
- **Goal**: Complete: Build a form using `useReducer` and controlled components.
- **Context**: Part of **phase-2** focused on “Terraform Certification Study.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 2: Terraform Certification Study — Implement `getStaticProps` and `getServerSideProps`
- **Goal**: Complete: Implement `getStaticProps` and `getServerSideProps`.
- **Context**: Part of **phase-2** focused on “Terraform Certification Study.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 3: Terraform Certification Study — Build layout and sidebar shell for the dashboard
- **Goal**: Complete: Build layout and sidebar shell for the dashboard.
- **Context**: Part of **phase-2** focused on “Terraform Certification Study.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 4: Terraform Certification Study — Deploy static site to AWS S3 and configure CloudFront
- **Goal**: Ship changes through the CI pipeline and verify a healthy deployment.
- **Context**: Part of **phase-2** focused on “Terraform Certification Study.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

### Task 5: Terraform Certification Study — Summarize weekly learning in journal
- **Goal**: Complete: Summarize weekly learning in journal.
- **Context**: Part of **phase-2** focused on “Terraform Certification Study.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 6: Terraform Certification Study — Pair program a related feature with a peer or assistant
- **Goal**: Co-build a small, working slice while sharing knowledge and validating approach.
- **Context**: Part of **phase-2** focused on “Terraform Certification Study.”
- **Plan**:
1. Schedule a 60–90 minute pairing session with a peer/assistant.
2. Define the tiny slice to implement and acceptance criteria.
3. Alternate driver/navigator roles and record key decisions.
4. Open a PR with notes from the session.
- **Definition of Done**:
- PR merged for the paired slice.
- Short session notes included in the PR or project docs.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 7: Terraform Certification Study — Write tests and type-check one capstone module
- **Goal**: Increase confidence by adding robust test coverage with type safety.
- **Context**: Part of **phase-2** focused on “Terraform Certification Study.”
- **Plan**:
1. Identify the module’s critical paths and edge cases.
2. Add unit tests (Jest + RTL or framework-appropriate).
3. Ensure types catch misuse (e.g., generics, discriminated unions).
4. Run coverage and add missing tests for branches.
- **Definition of Done**:
- Critical paths covered; target coverage agreed (e.g., 80%+ lines).
- Tests passing in CI; types catch misuse.
- **Timebox**: 2–4 hours
- **Artifacts**:
- Test report / coverage summary

### Task 8: Terraform Certification Study — Create or update your task board in Linear
- **Goal**: Complete Create or update your task board in Linear and ensure it aligns with the Terraform Certification Study outcomes.
- **Context**: Part of **phase-2** focused on “Terraform Certification Study.”
- **Plan**:
1. Create or update the project board with clear statuses.
2. Break down this week’s tasks into well-scoped issues.
3. Link issues to PRs and add estimates/owners as needed.
- **Definition of Done**:
- Board reflects current scope with statuses up to date.
- Issues have clear titles, descriptions, and links to PRs.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Board link
- Issue IDs

### Task 9: Terraform Certification Study — Record a 2-minute walkthrough of this week’s capstone progress
- **Goal**: Demonstrate progress and communicate outcomes to stakeholders.
- **Context**: Part of **phase-2** focused on “Terraform Certification Study.”
- **Plan**:
1. Draft a 30-second outline (problem → approach → demo → next steps).
2. Record a 2-minute screen capture with narration.
3. Upload video and link in the README/issue tracker.
- **Definition of Done**:
- 2-minute video uploaded and linked in README/issue.
- Stakeholders can view without access issues.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Video link
- Short outline

### Task 10: Terraform Certification Study — Push and deploy changes via GitHub Actions
- **Goal**: Ship changes through the CI pipeline and verify a healthy deployment.
- **Context**: Part of **phase-2** focused on “Terraform Certification Study.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

## Week 16 — CI/CD Certification Study
*Phase: phase-2*

### Task 1: CI/CD Certification Study — Review differences between `any`, `unknown`, and `never`
- **Goal**: Deeply understand and apply the concepts from: Review differences between `any`, `unknown`, and `never`.
- **Context**: Part of **phase-2** focused on “CI/CD Certification Study.”
- **Plan**:
1. Read TypeScript handbook pages on `any`, `unknown`, and `never`.
2. Create 3–5 code snippets demonstrating safe vs unsafe usage.
3. Refactor an existing function or utility to eliminate an unnecessary `any`.
4. Write brief notes comparing tradeoffs and when to prefer `unknown`.
- **Definition of Done**:
- Notes compare `any` vs `unknown` vs `never` with examples.
- One real code area refactored to remove an unnecessary `any`.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 2: CI/CD Certification Study — Create a new Next.js project with TypeScript
- **Goal**: Complete Create a new Next.js project with TypeScript and ensure it aligns with the CI/CD Certification Study outcomes.
- **Context**: Part of **phase-2** focused on “CI/CD Certification Study.”
- **Plan**:
1. Scaffold a Next.js app with TypeScript (`create-next-app`).
2. Configure `eslint`, `prettier`, and strict TypeScript settings.
3. Add a sample route and simple component demonstrating the week’s theme.
4. Commit initial setup with a meaningful message.
- **Definition of Done**:
- Repo contains a working Next.js + TS scaffold with linting.
- App builds and runs locally; sample page demonstrates theme.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Repo URL
- Commit hash
- Local run instructions

### Task 3: CI/CD Certification Study — Sketch dashboard layout wireframes and UI flow
- **Goal**: Produce actionable Sketch dashboard layout wireframes and UI flow to guide implementation.
- **Context**: Part of **phase-2** focused on “CI/CD Certification Study.”
- **Plan**:
1. Identify core screens and primary user journeys.
2. Sketch low-fidelity wireframes (paper or tool of choice).
3. Review for accessibility (contrast, focus order, touch targets).
4. Export or snapshot sketches to the repo/wiki.
- **Definition of Done**:
- Wireframes for key screens exported and linked in repo.
- UI flow diagram covers main happy paths and one edge case.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Screenshots/PNG/PDF of wireframes
- Flow diagram

### Task 4: CI/CD Certification Study — Read: What is DevOps & why does it matter?
- **Goal**: Extract key takeaways from Read: What is DevOps & why does it matter? and relate them to this week’s theme (CI/CD Certification Study).
- **Context**: Part of **phase-2** focused on “CI/CD Certification Study.”
- **Plan**:
1. Read the article/paper end-to-end; note unfamiliar terms.
2. Summarize 3–5 insights and how they connect to the theme.
3. Add 1 action item to apply a concept this week.
- **Definition of Done**:
- Summary (5–8 bullet points) committed to notes.
- At least one actionable idea scheduled on the board.
- **Timebox**: 0.5–1.5 hours
- **Artifacts**:
- Notes.md with summary

### Task 5: CI/CD Certification Study — Reflect on what went well and what could improve
- **Goal**: Capture learnings and improvement actions based on this week’s work.
- **Context**: Part of **phase-2** focused on “CI/CD Certification Study.”
- **Plan**:
1. List 3 things that went well and 3 that can improve.
2. Choose 1 process and 1 technical change to try next week.
3. Post reflection notes to the repo or your planning doc.
- **Definition of Done**:
- Reflection doc with W/WC/Actions committed to repo or shared.
- One experiment queued for next week.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 6: CI/CD Certification Study — Pair program a related feature with a peer or assistant
- **Goal**: Co-build a small, working slice while sharing knowledge and validating approach.
- **Context**: Part of **phase-2** focused on “CI/CD Certification Study.”
- **Plan**:
1. Schedule a 60–90 minute pairing session with a peer/assistant.
2. Define the tiny slice to implement and acceptance criteria.
3. Alternate driver/navigator roles and record key decisions.
4. Open a PR with notes from the session.
- **Definition of Done**:
- PR merged for the paired slice.
- Short session notes included in the PR or project docs.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 7: CI/CD Certification Study — Write tests and type-check one capstone module
- **Goal**: Increase confidence by adding robust test coverage with type safety.
- **Context**: Part of **phase-2** focused on “CI/CD Certification Study.”
- **Plan**:
1. Identify the module’s critical paths and edge cases.
2. Add unit tests (Jest + RTL or framework-appropriate).
3. Ensure types catch misuse (e.g., generics, discriminated unions).
4. Run coverage and add missing tests for branches.
- **Definition of Done**:
- Critical paths covered; target coverage agreed (e.g., 80%+ lines).
- Tests passing in CI; types catch misuse.
- **Timebox**: 2–4 hours
- **Artifacts**:
- Test report / coverage summary

### Task 8: CI/CD Certification Study — Create or update your task board in Linear
- **Goal**: Complete Create or update your task board in Linear and ensure it aligns with the CI/CD Certification Study outcomes.
- **Context**: Part of **phase-2** focused on “CI/CD Certification Study.”
- **Plan**:
1. Create or update the project board with clear statuses.
2. Break down this week’s tasks into well-scoped issues.
3. Link issues to PRs and add estimates/owners as needed.
- **Definition of Done**:
- Board reflects current scope with statuses up to date.
- Issues have clear titles, descriptions, and links to PRs.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Board link
- Issue IDs

### Task 9: CI/CD Certification Study — Record a 2-minute walkthrough of this week’s capstone progress
- **Goal**: Demonstrate progress and communicate outcomes to stakeholders.
- **Context**: Part of **phase-2** focused on “CI/CD Certification Study.”
- **Plan**:
1. Draft a 30-second outline (problem → approach → demo → next steps).
2. Record a 2-minute screen capture with narration.
3. Upload video and link in the README/issue tracker.
- **Definition of Done**:
- 2-minute video uploaded and linked in README/issue.
- Stakeholders can view without access issues.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Video link
- Short outline

### Task 10: CI/CD Certification Study — Push and deploy changes via GitHub Actions
- **Goal**: Ship changes through the CI pipeline and verify a healthy deployment.
- **Context**: Part of **phase-2** focused on “CI/CD Certification Study.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

## Week 17 — Capstone Extensions / Wrap-up
*Phase: phase-2*

### Task 1: Capstone Extensions / Wrap-up — Refactor a legacy React component using strong TypeScript typing
- **Goal**: Complete: Refactor a legacy React component using strong TypeScript typing.
- **Context**: Part of **phase-2** focused on “Capstone Extensions / Wrap-up.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 2: Capstone Extensions / Wrap-up — Add file-based routing and navigation
- **Goal**: Complete: Add file-based routing and navigation.
- **Context**: Part of **phase-2** focused on “Capstone Extensions / Wrap-up.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 3: Capstone Extensions / Wrap-up — Create a GitHub repo and initial project plan
- **Goal**: Complete Create a GitHub repo and initial project plan and ensure it aligns with the Capstone Extensions / Wrap-up outcomes.
- **Context**: Part of **phase-2** focused on “Capstone Extensions / Wrap-up.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 4: Capstone Extensions / Wrap-up — Set up a basic GitHub Actions workflow for linting
- **Goal**: Complete: Set up a basic GitHub Actions workflow for linting.
- **Context**: Part of **phase-2** focused on “Capstone Extensions / Wrap-up.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

### Task 5: Capstone Extensions / Wrap-up — Write a README update or technical blog post
- **Goal**: Complete: Write a README update or technical blog post.
- **Context**: Part of **phase-2** focused on “Capstone Extensions / Wrap-up.”
- **Plan**:
1. Clarify desired outcome and acceptance criteria.
2. Do the work in a short, focused branch.
3. Verify with lint/type-check/tests and a quick demo.
4. Document outcome in README or issue tracker.
- **Definition of Done**:
- Outcome is demonstrable (code, doc, or artifact).
- Changes committed and referenced in the tracker.
- **Timebox**: 1–3 hours
- **Artifacts**:
- Notes.md with summary

### Task 6: Capstone Extensions / Wrap-up — Pair program a related feature with a peer or assistant
- **Goal**: Co-build a small, working slice while sharing knowledge and validating approach.
- **Context**: Part of **phase-2** focused on “Capstone Extensions / Wrap-up.”
- **Plan**:
1. Schedule a 60–90 minute pairing session with a peer/assistant.
2. Define the tiny slice to implement and acceptance criteria.
3. Alternate driver/navigator roles and record key decisions.
4. Open a PR with notes from the session.
- **Definition of Done**:
- PR merged for the paired slice.
- Short session notes included in the PR or project docs.
- **Timebox**: 1–2 hours
- **Artifacts**:
- Code changes
- Notes
- Screenshots

### Task 7: Capstone Extensions / Wrap-up — Write tests and type-check one capstone module
- **Goal**: Increase confidence by adding robust test coverage with type safety.
- **Context**: Part of **phase-2** focused on “Capstone Extensions / Wrap-up.”
- **Plan**:
1. Identify the module’s critical paths and edge cases.
2. Add unit tests (Jest + RTL or framework-appropriate).
3. Ensure types catch misuse (e.g., generics, discriminated unions).
4. Run coverage and add missing tests for branches.
- **Definition of Done**:
- Critical paths covered; target coverage agreed (e.g., 80%+ lines).
- Tests passing in CI; types catch misuse.
- **Timebox**: 2–4 hours
- **Artifacts**:
- Test report / coverage summary

### Task 8: Capstone Extensions / Wrap-up — Create or update your task board in Linear
- **Goal**: Complete Create or update your task board in Linear and ensure it aligns with the Capstone Extensions / Wrap-up outcomes.
- **Context**: Part of **phase-2** focused on “Capstone Extensions / Wrap-up.”
- **Plan**:
1. Create or update the project board with clear statuses.
2. Break down this week’s tasks into well-scoped issues.
3. Link issues to PRs and add estimates/owners as needed.
- **Definition of Done**:
- Board reflects current scope with statuses up to date.
- Issues have clear titles, descriptions, and links to PRs.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Board link
- Issue IDs

### Task 9: Capstone Extensions / Wrap-up — Record a 2-minute walkthrough of this week’s capstone progress
- **Goal**: Demonstrate progress and communicate outcomes to stakeholders.
- **Context**: Part of **phase-2** focused on “Capstone Extensions / Wrap-up.”
- **Plan**:
1. Draft a 30-second outline (problem → approach → demo → next steps).
2. Record a 2-minute screen capture with narration.
3. Upload video and link in the README/issue tracker.
- **Definition of Done**:
- 2-minute video uploaded and linked in README/issue.
- Stakeholders can view without access issues.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Video link
- Short outline

### Task 10: Capstone Extensions / Wrap-up — Push and deploy changes via GitHub Actions
- **Goal**: Ship changes through the CI pipeline and verify a healthy deployment.
- **Context**: Part of **phase-2** focused on “Capstone Extensions / Wrap-up.”
- **Plan**:
1. Open a PR, ensure checks pass (lint, type-check, tests).
2. Merge to main and watch the CI/CD pipeline.
3. Smoke-test the deployment and capture a URL/screenshot.
- **Definition of Done**:
- Successful pipeline run visible in CI.
- Deployed URL works; basic smoke-check recorded.
- **Timebox**: 0.5–1 hour
- **Artifacts**:
- Deployed URL
- CI run link
- Screenshot of success

## Week 18 — Final Review & Retrospective

### Task 1: Final Review & Retrospective - Task 1
- **Goal**: Understand and apply final review & retrospective concepts.
- **Context**: Part of phase-2 to reinforce and extend learning.
- **Plan**: Step-by-step implementation of final review & retrospective practices.
- **Definition of Done**: Demonstrable outcome, reviewed and committed to repo.
- **Timebox**: 1–3 hours
- **Artifacts**: Code, notes, screenshots, deployment URLs

### Task 2: Final Review & Retrospective - Task 2
- **Goal**: Understand and apply final review & retrospective concepts.
- **Context**: Part of phase-2 to reinforce and extend learning.
- **Plan**: Step-by-step implementation of final review & retrospective practices.
- **Definition of Done**: Demonstrable outcome, reviewed and committed to repo.
- **Timebox**: 1–3 hours
- **Artifacts**: Code, notes, screenshots, deployment URLs

### Task 3: Final Review & Retrospective - Task 3
- **Goal**: Understand and apply final review & retrospective concepts.
- **Context**: Part of phase-2 to reinforce and extend learning.
- **Plan**: Step-by-step implementation of final review & retrospective practices.
- **Definition of Done**: Demonstrable outcome, reviewed and committed to repo.
- **Timebox**: 1–3 hours
- **Artifacts**: Code, notes, screenshots, deployment URLs

### Task 4: Final Review & Retrospective - Task 4
- **Goal**: Understand and apply final review & retrospective concepts.
- **Context**: Part of phase-2 to reinforce and extend learning.
- **Plan**: Step-by-step implementation of final review & retrospective practices.
- **Definition of Done**: Demonstrable outcome, reviewed and committed to repo.
- **Timebox**: 1–3 hours
- **Artifacts**: Code, notes, screenshots, deployment URLs

### Task 5: Final Review & Retrospective - Task 5
- **Goal**: Understand and apply final review & retrospective concepts.
- **Context**: Part of phase-2 to reinforce and extend learning.
- **Plan**: Step-by-step implementation of final review & retrospective practices.
- **Definition of Done**: Demonstrable outcome, reviewed and committed to repo.
- **Timebox**: 1–3 hours
- **Artifacts**: Code, notes, screenshots, deployment URLs

### Task 6: Final Review & Retrospective - Task 6
- **Goal**: Understand and apply final review & retrospective concepts.
- **Context**: Part of phase-2 to reinforce and extend learning.
- **Plan**: Step-by-step implementation of final review & retrospective practices.
- **Definition of Done**: Demonstrable outcome, reviewed and committed to repo.
- **Timebox**: 1–3 hours
- **Artifacts**: Code, notes, screenshots, deployment URLs

### Task 7: Final Review & Retrospective - Task 7
- **Goal**: Understand and apply final review & retrospective concepts.
- **Context**: Part of phase-2 to reinforce and extend learning.
- **Plan**: Step-by-step implementation of final review & retrospective practices.
- **Definition of Done**: Demonstrable outcome, reviewed and committed to repo.
- **Timebox**: 1–3 hours
- **Artifacts**: Code, notes, screenshots, deployment URLs

### Task 8: Final Review & Retrospective - Task 8
- **Goal**: Understand and apply final review & retrospective concepts.
- **Context**: Part of phase-2 to reinforce and extend learning.
- **Plan**: Step-by-step implementation of final review & retrospective practices.
- **Definition of Done**: Demonstrable outcome, reviewed and committed to repo.
- **Timebox**: 1–3 hours
- **Artifacts**: Code, notes, screenshots, deployment URLs

### Task 9: Final Review & Retrospective - Task 9
- **Goal**: Understand and apply final review & retrospective concepts.
- **Context**: Part of phase-2 to reinforce and extend learning.
- **Plan**: Step-by-step implementation of final review & retrospective practices.
- **Definition of Done**: Demonstrable outcome, reviewed and committed to repo.
- **Timebox**: 1–3 hours
- **Artifacts**: Code, notes, screenshots, deployment URLs

### Task 10: Final Review & Retrospective - Task 10
- **Goal**: Understand and apply final review & retrospective concepts.
- **Context**: Part of phase-2 to reinforce and extend learning.
- **Plan**: Step-by-step implementation of final review & retrospective practices.
- **Definition of Done**: Demonstrable outcome, reviewed and committed to repo.
- **Timebox**: 1–3 hours
- **Artifacts**: Code, notes, screenshots, deployment URLs
