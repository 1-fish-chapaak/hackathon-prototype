# Collaborator Guide — hackathon-prototype

Multiple pods (teams) work on this repo in parallel, each from their own
Claude Code CLI session, pushing directly to `main`. The risks are NOT
technical (this is a mocked-data demo) — the risks are **stepping on each
other's design**, **building the same thing twice**, and **breaking the
shared user flow**. The Claude preflight catches all three before you push.

This guide is also designed to be pasted into a fresh Claude Code session —
see the [Appendix](#appendix--paste-this-into-a-fresh-claude-code-session).

---

## 1. What this repo is

- **Stack:** React 18 + TypeScript + Vite. Frontend-only, all data mocked in `src/data/mockData.ts`.
- **Repo:** https://github.com/1-fish-chapaak/hackathon-prototype
- **Live URL:** https://hackathon-demo-ujihgyhrpa-uc.a.run.app
- **Branch model:** **direct push to `main`**. Every push auto-deploys to Cloud Run in ~2 min.
- **Don't touch:** the upstream `1-fish-chapaak/auditify-copilot`, and the production stack at `auditify.platform.irame.ai`.

---

## 2. One-time setup

### 2.1 Tools

```bash
# macOS
brew install git gh node@22

# Claude Code CLI (required for the preflight review)
npm install -g @anthropic-ai/claude-code
claude --version

# Auth Claude CLI to your account (one-time)
claude          # opens browser to log in
```

### 2.2 GitHub access

```bash
gh auth login                    # GitHub.com → HTTPS → browser
gh auth status                   # confirm
```

You need write access to `1-fish-chapaak/hackathon-prototype`. Ask the repo owner if `git push` is rejected.

### 2.3 Clone and bootstrap

```bash
git clone https://github.com/1-fish-chapaak/hackathon-prototype.git
cd hackathon-prototype
npm install
npm run setup-hooks         # ★ enables the Claude preflight on git push
```

`setup-hooks` configures `core.hooksPath=.githooks` so the pre-push hook runs
the preflight every time you `git push`. Run it once per clone.

### 2.4 Run locally

```bash
npm run dev          # http://localhost:5173
npm run build        # production build → dist/
npm run lint
```

---

## 3. The pod workflow

### 3.1 The full loop

```
┌──────────────────────────────────────────────────────────────────┐
│  in your Claude CLI session, in the repo                         │
└──────────────────────────────────────────────────────────────────┘
            │
            ▼
   pull main, make changes, commit
            │
            ▼
   git push                                 ←── pre-push hook fires
            │
            ▼
   ┌────────────────────────────────────┐
   │  AUTO-REBASE                       │
   │  fetch origin/main, pull --rebase  │
   │  (only if you are behind)          │
   └────────────────────────────────────┘
            │  (stops on conflict — you resolve, then `git push` again)
            ▼
   ┌────────────────────────────────────┐
   │  CLAUDE PREFLIGHT REVIEW           │
   │  · design conflicts vs main        │
   │  · feature redundancy              │
   │  · UX / flow gaps                  │
   │  (~30-60s, advisory, never blocks) │
   └────────────────────────────────────┘
            │
            ▼
   push completes → GitHub
            │
            ▼
   .github/workflows/deploy.yml runs
            │  (any in-flight older deploy is cancelled —
            │   the newest commit always wins)
            ▼
   Cloud Run hackathon-demo updated   ~2 min total
            │
            ▼
   https://hackathon-demo-ujihgyhrpa-uc.a.run.app
```

### 3.2 The preflight, in detail

When you `git push`, the hook runs `tools/preflight-review.sh`, which does
two things in order:

**Step 1 — auto-rebase.** Fetches `<remote>/main` and, if your local main is
behind, runs `git pull --rebase --autostash` to stack your work on top of
whatever other pods pushed. If the rebase is clean, the script keeps going.
If the rebase hits a conflict, the script aborts the push with instructions:
resolve the markers, `git add`, `git rebase --continue`, then `git push` again.

**Step 2 — Claude review.** Calls the Claude CLI with a prompt focused on
**three axes only**:

1. **Design conflicts** — new colors / typography / spacing / card patterns
   that contradict the established bento + charcoal + purple-accent system.
2. **Feature redundancy** — building something already in `src/`. Two views
   for the same job, parallel mock-data shapes for the same entity, duplicate
   component logic.
3. **UX / flow gaps** — dead-end states, broken back button, "two screens
   with the same name doing different things", CTAs that lead nowhere.

**Explicitly NOT raised:** perf, scaling, type-nits, tests, "best practices",
refactor suggestions, accessibility-unless-broken, security. This is a demo.

The output appears directly in your terminal. The push **always proceeds**
(advisory only). You and your Claude session decide whether to address the
findings now, fix-forward in a follow-up commit, or ignore them.

### 3.3 Skipping the preflight

For a doc-only commit or an emergency fix (skips **both** the rebase and the
Claude review — you become responsible for the rebase):

```bash
SKIP_PREFLIGHT=1 git push
```

Or run the Claude review on demand without pushing (no rebase in this mode):

```bash
npm run review:local
```

### 3.4 Daily commands

```bash
# pull latest
git checkout main && git pull origin main

# work locally — your Claude CLI does the editing
# ... commits with `git commit -m "feat: ..."` ...

# push (preflight runs automatically)
git push
```

That's the whole flow. **No PRs, no branches, no waiting** — just commit + push.
Pods that want extra eyes can still open a PR (see §4) and the same review
runs there as a comment.

### 3.5 Commit style

Short imperative subject, optional body explaining *why* (not *what* — the diff
shows what):

```
feat: add risk register inline filter chip
fix: sidebar collapse no longer hides the Settings link
chore: bump rive-app to 4.27.3
docs: clarify preflight skip in CONTRIBUTING
```

Prefixes: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`.

---

## 4. Optional: opening a PR

You don't need to, but if you want a second opinion before merging:

```bash
git checkout -b your-name/short-description
# ... commits ...
git push -u origin HEAD
gh pr create --fill
```

The same Claude review runs as a PR comment via `.github/workflows/claude-review.yml`.
Merging the PR to `main` triggers the deploy.

You can re-run the review on a PR by commenting `@claude` in the PR thread.

---

## 5. The pipeline files

| File | Purpose | Triggers when |
| --- | --- | --- |
| `tools/preflight-review.sh` | Auto-rebase onto remote main, then run the focused Claude review (design / redundancy / UX). Aborts on rebase conflict so you resolve before pushing. | You run `git push` (after `npm run setup-hooks`) — or `npm run review:local` (review only, no rebase) |
| `.githooks/pre-push` | Calls the preflight from git's hook system | Same |
| `.github/workflows/deploy.yml` | Build Docker → push to Artifact Registry → deploy to Cloud Run. **`cancel-in-progress: true`** so a newer push kills any in-flight older build — the live revision always matches the latest tip of main. | Push to `main` |
| `.github/workflows/claude-review.yml` | Same focused review, posted as PR comment | PR opened / `@claude` comment |
| `cloudbuild.yaml` | Manual `gcloud builds submit` config (not used by CI) | Only if you run it explicitly |
| `Dockerfile` + `nginx.conf` | Multi-stage node:22-alpine → nginx:alpine on :8080 | Used by deploy and cloudbuild |

### 5.1 Auth model (FYI, you don't need to touch it)

GitHub Actions auths to GCP via **Workload Identity Federation** — no service
account keys exist anywhere. Only repos under `1-fish-chapaak` can use the
deploy SA `gh-actions-deploy@gen-lang-client-0250661731.iam.gserviceaccount.com`.

The Claude PR reviewer auths via the `CLAUDE_CODE_OAUTH_TOKEN` repo secret.

---

## 6. Verifying / debugging

```bash
# what's the latest deploy doing?
gh run list --repo 1-fish-chapaak/hackathon-prototype --limit 5
gh run watch --repo 1-fish-chapaak/hackathon-prototype

# is the live site up?
curl -sS -o /dev/null -w "HTTP %{http_code}\n" https://hackathon-demo-ujihgyhrpa-uc.a.run.app/

# (requires gcloud) what revision is live?
gcloud run services describe hackathon-demo \
  --region us-central1 --project gen-lang-client-0250661731 \
  --format="value(status.latestReadyRevisionName,spec.template.spec.containers[0].image)"
```

Roll back via Cloud Run revisions:

```bash
gcloud run revisions list --service=hackathon-demo --region=us-central1 --project=gen-lang-client-0250661731
gcloud run services update-traffic hackathon-demo \
  --to-revisions=hackathon-demo-00001-xyz=100 \
  --region=us-central1 --project=gen-lang-client-0250661731
```

---

## 7. Common gotchas

- **You skipped `npm run setup-hooks`.** No preflight ran on your push. Re-run it once per clone.
- **Don't commit `node_modules/`, `dist/`, or `.serena/`.** All in `.gitignore`. Use `git add <specific files>`, not `git add .`.
- **Don't add real API keys.** Mocked-data demo only. No `.env`, no secrets.
- **The deploy auto-fires on every main push, including doc-only changes.** That's fine (Docker build is fast and cached) but be aware. If two pushes race, the older deploy is **cancelled mid-flight** so the newest commit wins.
- **Two pods edit the same file → real git merge conflict.** The preflight tries to rebase you onto remote main automatically. If the rebase is clean, your push proceeds. If it conflicts, the push aborts with a message telling you to fix the markers, `git add`, `git rebase --continue`, then `git push` again (the hook runs once more on the merged result). To bail: `git rebase --abort`.
- **Preflight told you about a conflict — what now?** Talk to the other pod in your team channel before fixing forward. The whole point of the review is to surface coordination issues you'd otherwise discover at demo time.

---

## Appendix — paste this into a fresh Claude Code session

> I'm working on the **hackathon-prototype** repo (cloned locally, you're already in it).
>
> **Stack:** React 18 + TypeScript + Vite. Frontend-only. All data mocked in `src/data/mockData.ts` — no backend, no real API calls, no secrets.
>
> **Pod workflow:** multiple teams push directly to `main` from their Claude CLI sessions. No PRs required. Every push to `main` auto-deploys to Cloud Run in ~2 min.
>
> - Repo: https://github.com/1-fish-chapaak/hackathon-prototype
> - Live URL: https://hackathon-demo-ujihgyhrpa-uc.a.run.app
> - GCP project: `gen-lang-client-0250661731` · region `us-central1` · service `hackathon-demo`
>
> **Pre-push preflight (already enabled if `npm run setup-hooks` was run):** when you `git push`, `tools/preflight-review.sh` first **auto-rebases** you onto remote main if you are behind (aborting the push on a rebase conflict so you resolve manually), then shows a Claude review focused on **design conflicts**, **feature redundancy**, and **UX/flow gaps**. The Claude review is advisory and never blocks. Skip both with `SKIP_PREFLIGHT=1 git push`. Run review on demand with `npm run review:local`. The deploy workflow is set to **`cancel-in-progress: true`** so a newer push always wins — the live revision matches the latest tip of main.
>
> **Review priorities (mirror these in your own thinking before pushing):**
> 1. Design conflicts — does this contradict the existing bento / charcoal / purple-accent design system? Different colors/typography/spacing/shapes from what's already in `src/components/`?
> 2. Feature redundancy — does this duplicate something already in `src/`? Same view, same data shape, parallel navigation path?
> 3. UX / flow gaps — can the user enter this state and not exit? Does navigation contradict the existing app pattern? Dead-end CTAs?
>
> **Explicitly DO NOT optimize for:** performance, bundle size, test coverage, type strictness, error handling, refactoring, accessibility-unless-broken, security. This is a throwaway demo.
>
> **Conventions:**
> - Branch off `main` if you want a PR; otherwise commit directly to `main` and push.
> - `git add <specific files>`, not `git add .`. Don't commit `node_modules/`, `dist/`, `.serena/`.
> - Conventional commit prefixes: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`. Imperative subject, optional body explaining *why*.
> - Run `npm run lint` and `npm run build` before pushing.
> - Read `CONTRIBUTING.md` for the full workflow.
>
> **My task:** <describe what you want to do>
