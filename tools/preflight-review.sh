#!/usr/bin/env bash
# Claude preflight review — runs before `git push` (or via `npm run review:local`).
# Hackathon prototype: gentle on tech, brutal on design/UX/redundancy conflicts.
# Advisory only. Always exits 0 — never blocks the push.

set -uo pipefail

if [[ "${SKIP_PREFLIGHT:-}" == "1" ]]; then
  echo "preflight: SKIP_PREFLIGHT=1, skipping review"
  exit 0
fi

if ! command -v claude &> /dev/null; then
  echo "preflight: claude CLI not found — install with 'npm install -g @anthropic-ai/claude-code', then re-run."
  echo "preflight: skipping review (push proceeding)."
  exit 0
fi

git fetch origin main --quiet 2>/dev/null || true

if git rev-parse --verify origin/main >/dev/null 2>&1; then
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
