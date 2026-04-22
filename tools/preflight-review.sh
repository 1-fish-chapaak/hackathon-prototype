#!/usr/bin/env bash
# Claude preflight review — runs before `git push` (or via `npm run review:local`).
# Hackathon prototype: gentle on tech, brutal on design/UX/redundancy conflicts.
#
# Behaviour:
#   1. Auto-rebase: if pushing main and the remote has new commits, fetch and
#      `git pull --rebase --autostash` first. Stops on conflict so you can
#      resolve manually.
#   2. Claude review: focused on design / feature redundancy / UX gaps.
#      Advisory only — never blocks the push.
#
# Skip everything with: SKIP_PREFLIGHT=1 git push

set -uo pipefail

if [[ "${SKIP_PREFLIGHT:-}" == "1" ]]; then
  echo "preflight: SKIP_PREFLIGHT=1, skipping rebase + review"
  exit 0
fi

# ── 1. Auto-rebase on main ─────────────────────────────────────────────────

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")

resolve_remote() {
  local r
  r=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null | cut -d/ -f1)
  if [[ -n "$r" ]] && git remote get-url "$r" >/dev/null 2>&1; then
    printf '%s' "$r"; return
  fi
  for cand in hackathon origin; do
    if git remote get-url "$cand" >/dev/null 2>&1; then
      printf '%s' "$cand"; return
    fi
  done
}

REMOTE=$(resolve_remote)

if [[ "$CURRENT_BRANCH" == "main" && -n "$REMOTE" ]]; then
  echo "preflight: fetching ${REMOTE}/main…"
  if ! git fetch "$REMOTE" main --quiet 2>/dev/null; then
    echo "preflight: fetch failed (offline?), skipping rebase."
  else
    BEHIND=$(git rev-list --count "HEAD..${REMOTE}/main" 2>/dev/null || echo "0")
    if [[ "$BEHIND" -gt 0 ]]; then
      printf '\npreflight: local main is behind %s/main by %s commit(s) — rebasing…\n\n' "$REMOTE" "$BEHIND"
      if git pull --rebase --autostash "$REMOTE" main; then
        printf '\npreflight: rebase clean. proceeding.\n'
      else
        cat <<MSG

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  preflight: REBASE CONFLICT — push aborted
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your local commits conflict with new work on ${REMOTE}/main. To resolve:

  1. git status                       # see the conflicted files
  2. <fix the conflict markers>
  3. git add <files>
  4. git rebase --continue
  5. git push                         # this hook runs again

To bail out instead: git rebase --abort
To skip this hook for one push: SKIP_PREFLIGHT=1 git push

MSG
        exit 1
      fi
    else
      echo "preflight: up-to-date with ${REMOTE}/main."
    fi
  fi
fi

# ── 2. Claude design / redundancy / UX review ──────────────────────────────

if ! command -v claude &> /dev/null; then
  echo "preflight: claude CLI not found — install with 'npm install -g @anthropic-ai/claude-code', then re-run."
  echo "preflight: skipping review (push proceeding)."
  exit 0
fi

if [[ -n "$REMOTE" ]] && git rev-parse --verify "${REMOTE}/main" >/dev/null 2>&1; then
  BASE="${REMOTE}/main"
elif git rev-parse --verify origin/main >/dev/null 2>&1; then
  BASE="origin/main"
else
  BASE="HEAD~1"
fi

CHANGED=$(git diff --name-only "$BASE"...HEAD 2>/dev/null || true)
NEW=$(git diff --name-only --diff-filter=A "$BASE"...HEAD 2>/dev/null || true)

if [[ -z "$CHANGED" ]]; then
  echo "preflight: no changes vs $BASE, skipping review"
  exit 0
fi

CHANGED_COUNT=$(printf '%s\n' "$CHANGED" | wc -l | tr -d ' ')

printf '\n'
printf '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
printf '  Claude preflight review · %s file(s) vs %s\n' "$CHANGED_COUNT" "$BASE"
printf '  (set SKIP_PREFLIGHT=1 to skip · ~30-60s)\n'
printf '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n'

# Pipe prompt to claude via stdin so apostrophes/quotes inside the body are
# pure heredoc content (not re-parsed by bash via $(...) substitution).
claude -p <<EOF || echo "preflight: claude exited non-zero (advisory only — push will proceed)"
You are reviewing a HACKATHON PROTOTYPE where multiple pods (teams) push directly to main.
This is a THROWAWAY DEMO. Your bias must match that.

DO NOT raise (be gentle / silent on these):
- Performance, scaling, bundle size, memoization
- Test coverage or missing tests
- Type safety nits, "any" usage, error handling, defensive coding
- Code style, naming, refactor opportunities, file organization
- Accessibility (unless something is genuinely broken to operate)
- Security (mocked-data app, no real secrets, no backend)

DO raise — BRUTALLY and SPECIFICALLY (these cause team friction):

1. **Design conflicts** — new visual choices that contradict what already exists in src/.
   Different colors, typography scales, spacing, component shapes, or card patterns
   from the established bento / charcoal / purple-accent system. Cite the existing
   reference (file:line) AND the diverging new code (file:line).

2. **Feature redundancy** — this push builds something that already exists in src/.
   Two views doing the same job, two ways to navigate to the same place, parallel
   mock data shapes for the same entity, duplicated component logic. Name both
   the existing thing and the new duplicate.

3. **UX / flow gaps** — user can enter a state but cannot exit it cleanly,
   navigation contradicts the existing pattern, a CTA leads nowhere, two screens
   share a name but mean different things, back navigation is broken, modal traps,
   inconsistent empty/loading states across sibling views.

Use Read and Grep on src/ to inspect the existing codebase before judging.
Cite file:line on both sides of every conflict. Be terse — bullet points only,
no preamble, no summary, no closing remarks.

If nothing material conflicts on these three axes, output exactly this single line:
✅ No design / redundancy / UX conflicts detected.

Files changed in this push (vs ${BASE}):
${CHANGED}

New files added:
${NEW:-(none)}
EOF

printf '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
printf '  End preflight · push proceeding\n'
printf '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n'

exit 0
