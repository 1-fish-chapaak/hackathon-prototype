# Collaborator Guide — hackathon-prototype

This guide tells you everything you need to make changes, open a PR, and get
them deployed. It's also written so you can paste the **Appendix** into a fresh
Claude Code session and have it pick up the context immediately.

---

## 1. What this repo is

- **Stack:** React + TypeScript + Vite (frontend-only, mocked data — no backend, no real API keys needed).
- **Repo:** https://github.com/1-fish-chapaak/hackathon-prototype
- **Branch model:** `main` is the deployable branch. Every push to `main` auto-deploys to Cloud Run.
- **Live URL:** https://hackathon-demo-ujihgyhrpa-uc.a.run.app
- **GCP project:** `gen-lang-client-0250661731` · region `us-central1` · service `hackathon-demo`
- **Source repo (do not push to):** `1-fish-chapaak/auditify-copilot` (the upstream this was forked from). This repo is the demo/hackathon variant — keep changes here.

---

## 2. One-time setup

### 2.1 Tools you need

```bash
# macOS (Homebrew)
brew install git gh node@22

# verify
git --version
gh --version
node --version   # >= 22
npm --version
```

You do **not** need `gcloud` or `docker` locally — the pipeline handles all GCP/Docker work.

### 2.2 Authenticate to GitHub

```bash
gh auth login                    # pick GitHub.com, HTTPS, login with browser
gh auth status                   # confirm you're logged in
```

You need **write access** to `1-fish-chapaak/hackathon-prototype`. Ask the repo owner to add you as a collaborator if `git push` is rejected.

### 2.3 Clone

```bash
git clone https://github.com/1-fish-chapaak/hackathon-prototype.git
cd hackathon-prototype
npm install
```

### 2.4 Run locally

```bash
npm run dev          # http://localhost:5173 (Vite default)
npm run build        # production build → dist/
npm run lint         # eslint
```

The app uses mocked data from `src/data/mockData.ts` — there is nothing to configure.

---

## 3. Day-to-day workflow

### 3.1 Pick up latest

```bash
git checkout main
git pull origin main
```

### 3.2 Create a feature branch

**Always branch off `main`.** Don't commit directly to `main` — open a PR so the Claude reviewer can run.

```bash
git checkout -b your-name/short-description
# examples:
#   git checkout -b alex/add-export-button
#   git checkout -b sam/fix-sidebar-overflow
```

### 3.3 Make changes, commit

```bash
# stage specific files (avoid `git add .` so you don't sweep up junk)
git add src/components/path/to/File.tsx

# commit with a clear message: what + why (one line is fine for small changes)
git commit -m "fix: sidebar overflow on narrow viewports

The flex container was overflowing on <1024px because the icon column
was set to fixed width instead of flex-shrink:0."
```

Commit style: short imperative subject (`fix:`, `feat:`, `chore:`, `docs:`, `refactor:`), optional body explaining *why* (not *what* — the diff shows what).

### 3.4 Push and open a PR

```bash
git push -u origin HEAD            # first push of the branch
# subsequent pushes: just `git push`

gh pr create --fill                # opens browser to confirm
# or scripted:
gh pr create --title "fix: sidebar overflow" --body "Fixes overflow at <1024px viewport widths."
```

### 3.5 What happens after you open the PR

Two automated checks run in parallel:

| Check | When | What it does | Where to see it |
| --- | --- | --- | --- |
| **Claude PR Review** | PR opened, new commits, or `@claude` comment | Reads the diff, comments inline on issues that will break things | "Checks" tab on the PR + inline comments |
| **Deploy to Cloud Run** | Only on push to `main` (i.e. after merge) | Builds Docker image, pushes to Artifact Registry, deploys to `hackathon-demo` | "Actions" tab + Cloud Run console |

**To re-run the Claude review** on a PR (e.g. after addressing comments), drop a comment on the PR mentioning `@claude` and it'll re-review.

### 3.6 Merge

Once the Claude review is green-ish (it's advisory, not blocking) and a human collaborator approves:

```bash
gh pr merge --squash --delete-branch
# or use the GitHub UI "Squash and merge"
```

The merge to `main` triggers the deploy workflow automatically — usually live in **~2 minutes**.

---

## 4. The pipeline in detail

Two GitHub Actions workflows live in `.github/workflows/`:

### 4.1 `deploy.yml` — push to main → Cloud Run

```
push to main
   │
   ▼
checkout
   │
   ▼
google-github-actions/auth   ← keyless (Workload Identity Federation)
   │
   ▼
docker build  ──►  docker push to Artifact Registry
   │                 us-central1-docker.pkg.dev/<project>/cloud-run-source-deploy/hackathon-demo
   ▼
gcloud run deploy hackathon-demo
   │
   ▼
new revision live at https://hackathon-demo-ujihgyhrpa-uc.a.run.app
```

**Auth model:** GitHub Actions exchanges its OIDC token with GCP via Workload Identity Federation. **No GCP service-account key is stored in GitHub.** Only repos under the `1-fish-chapaak` GitHub org/user can use it (enforced by attribute condition).

You should not need to touch anything in `deploy.yml` for normal feature work.

### 4.2 `claude-review.yml` — Claude reviews your PR

Uses the official `anthropics/claude-code-action`. Authenticates with the `CLAUDE_CODE_OAUTH_TOKEN` repo secret (already configured). The reviewer prompt focuses on **what will break** — regressions, type errors, broken UI flows, missed edge cases.

To customize the review prompt, edit the `prompt:` block in `.github/workflows/claude-review.yml` and open a PR.

### 4.3 `cloudbuild.yaml` (optional, for local use)

Lives at the repo root. Lets you trigger a build manually from your laptop:

```bash
# requires gcloud installed and authenticated to gen-lang-client-0250661731
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=SHORT_SHA=$(git rev-parse --short HEAD) \
  --region=us-central1
```

The pipeline does **not** use this file — it's only for ad-hoc builds.

---

## 5. Verifying / debugging deploys

### 5.1 Watch a deploy in progress

```bash
gh run watch --repo 1-fish-chapaak/hackathon-prototype
# or list recent runs:
gh run list --repo 1-fish-chapaak/hackathon-prototype --limit 10
```

### 5.2 Confirm the live revision

```bash
# requires gcloud + access to the GCP project
gcloud run services describe hackathon-demo \
  --region us-central1 --project gen-lang-client-0250661731 \
  --format="value(status.url,status.latestReadyRevisionName,spec.template.spec.containers[0].image)"
```

Or just:

```bash
curl -sS -o /dev/null -w "HTTP %{http_code}\n" https://hackathon-demo-ujihgyhrpa-uc.a.run.app/
```

### 5.3 View Cloud Run logs

```bash
gcloud run services logs read hackathon-demo \
  --region us-central1 --project gen-lang-client-0250661731 --limit 100
```

Or in the console: https://console.cloud.google.com/run/detail/us-central1/hackathon-demo/logs?project=gen-lang-client-0250661731

### 5.4 Rolling back

Cloud Run keeps every revision. To roll back:

```bash
# list revisions
gcloud run revisions list --service=hackathon-demo \
  --region=us-central1 --project=gen-lang-client-0250661731

# point 100% traffic at a previous revision
gcloud run services update-traffic hackathon-demo \
  --to-revisions=hackathon-demo-00001-xyz=100 \
  --region=us-central1 --project=gen-lang-client-0250661731
```

(Replace `hackathon-demo-00001-xyz` with the revision name from the list.)

---

## 6. Common gotchas

- **Don't push directly to `main`.** It deploys immediately and skips Claude review. If you do this by accident, fix forward with another PR.
- **Don't commit `node_modules/`, `dist/`, or `.serena/`.** All are in `.gitignore`. Use `git status` before committing.
- **Don't add real API keys.** This is a mocked-data demo. If you find yourself wanting `process.env.SOMETHING_KEY`, talk to the team first — secrets handling isn't set up.
- **The deploy SA can't push to other GCP services.** It only has `run.admin` + `artifactregistry.writer` + `iam.serviceAccountUser` + `logging.logWriter` + `storage.admin` on this project. Don't try to use it for anything else.
- **Claude review is advisory, not blocking.** A failing/critical review doesn't block merge — you and a human reviewer decide.
- **`origin` points to this repo.** If you're working from a clone of the upstream `auditify-copilot`, add `hackathon` as a separate remote (`git remote add hackathon https://github.com/1-fish-chapaak/hackathon-prototype.git`) — don't push experimental work to the upstream by accident.

---

## 7. Asking for help from Claude

If you've installed Claude Code (`npm install -g @anthropic-ai/claude-code`), you can `cd` into the repo and ask it for help on any task. The appendix below is a self-contained briefing — paste it as your first message in a fresh Claude session and it'll have the full context.

---

## Appendix — paste this into a fresh Claude Code session

> I'm working on the hackathon-prototype repo. Here's the context you need:
>
> **Repo:** https://github.com/1-fish-chapaak/hackathon-prototype (cloned locally; you're already in it).
> **Stack:** React 18 + TypeScript + Vite. Frontend-only. All data is mocked in `src/data/mockData.ts` — no backend, no real API calls.
> **Local dev:** `npm run dev` (port 5173). Build: `npm run build`. Lint: `npm run lint`.
>
> **CI/CD:**
> - Every push to `main` triggers `.github/workflows/deploy.yml`, which builds the Docker image, pushes it to Artifact Registry, and deploys to Cloud Run service `hackathon-demo` in GCP project `gen-lang-client-0250661731` (us-central1). Live URL: https://hackathon-demo-ujihgyhrpa-uc.a.run.app
> - Every PR triggers `.github/workflows/claude-review.yml`, which runs `anthropics/claude-code-action` to review the diff. You can re-trigger it by commenting `@claude` on the PR.
> - Auth from GitHub Actions to GCP is via Workload Identity Federation — no service-account keys stored anywhere.
>
> **Branch rules:**
> - Branch off `main`, never commit directly to `main`. Open a PR.
> - Use `git add <specific files>` rather than `git add .`. Don't commit `node_modules/`, `dist/`, or `.serena/`.
> - Conventional commit prefixes: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`. Subject is imperative; optional body explains *why*.
>
> **Don't:**
> - Push to `main` directly (skips review and instantly deploys).
> - Add real API keys or secrets — the app is mocked-data only.
> - Touch the upstream repo (`1-fish-chapaak/auditify-copilot`) — this repo is the hackathon fork.
> - Touch the production stack at `auditify.platform.irame.ai` — that's a different deployment entirely.
>
> Help me with the task below. Use the existing components and mocked data shape; follow the project's existing patterns. Run `npm run lint` and `npm run build` before claiming the task is done.
>
> **My task:** <describe what you want to do here>

---

## Where the pipeline files live

- `.github/workflows/deploy.yml` — Cloud Run deploy
- `.github/workflows/claude-review.yml` — Claude PR reviewer
- `cloudbuild.yaml` — manual `gcloud builds submit` config (not used by CI)
- `Dockerfile` — multi-stage build (node:22-alpine → nginx:alpine on port 8080)
- `nginx.conf` — SPA routing config

If something breaks, start by reading the failing GitHub Actions log
(`gh run view --log-failed --repo 1-fish-chapaak/hackathon-prototype <run-id>`)
before changing config.
