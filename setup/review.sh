#!/usr/bin/env bash
# Run the ravelston-code-review skill headlessly.
#
# Usage:
#   setup/review.sh                 # review unstaged/staged changes
#   setup/review.sh "PR #4"         # review a PR (posts a comment on it)
#   setup/review.sh my-branch       # review a branch vs main
#   setup/review.sh "last 3 commits"
set -euo pipefail

cd "$(dirname "$0")/.."

claude -p "/ravelston-code-review ${*:-}" \
  --permission-mode acceptEdits \
  --allowed-tools "Bash(gh pr comment:*)" \
  --max-turns 40
