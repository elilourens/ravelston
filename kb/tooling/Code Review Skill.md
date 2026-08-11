---
tags: [tooling, claude-code, code-review]
---

# Code Review Skill

The repo has a custom Claude Code skill, `ravelston-code-review`, that reviews changes for bugs and unnecessary complexity. It lives at `.agents/skills/ravelston-code-review/SKILL.md` (discovered via the `.claude/skills` and `.cursor/skills` symlinks) and was adapted from Wordsmith's code-review setup.

## How to run it

**Interactive** — start Claude Code in the repo root and type:

```
/ravelston-code-review              ← review uncommitted changes
/ravelston-code-review PR #4       ← review a PR and comment on it
/ravelston-code-review my-branch   ← review a branch against main
```

**Headless** — from the repo root, no session needed:

```bash
setup/review.sh              # uncommitted changes
setup/review.sh "PR #4"
setup/review.sh my-branch
```

The wrapper runs `claude -p` with `--permission-mode acceptEdits` and pre-approves `gh pr comment` so PR posting doesn't stall on a prompt.

## What it does

1. Works out the scope (working tree, PR, or branch diff vs `main`).
2. Loads domain guidelines — React/Next.js changes pull in the bundled `vercel-react-best-practices` skill.
3. Reviews for bugs, unit errors (Hz/kg/m/s² mix-ups matter in `research/`), over-engineering, symptom-fixes vs root causes, and out-of-diff problems (duplicated helpers, stale enum mirrors, incomplete flag gating).
4. Scores the change 1–10 for risk ("Scary Score") — `scratch/` is reviewed leniently, migrations and anything irreversible get a floor above 5.
5. Recommends tests where meaningful logic lacks them.
6. Outputs the score plus **LGTM** or findings tiered as Critical / Important / Should Fix / Testing, and posts to the PR when given one.

## Not set up (yet)

- **CI reviews on every PR** — needs `.github/workflows/claude-code-review.yml` plus a `CLAUDE_CODE_OAUTH_TOKEN` repo secret (generate with `claude setup-token`). GitHub Actions itself is free for this public repo; model usage bills to the Claude subscription.
- OpenAI keys can't be used — Claude Code only runs Claude models.
