---
name: ravelston-code-review
description: >
  Concise, high-signal code review for the Ravelston repo. Reviews recent changes
  for bugs, unnecessary complexity, and convention adherence. Use when asked to
  review code, check a PR, or provide coding guidance.
context: fork
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git log:*), Bash(git show:*), Bash(gh pr view:*), Bash(gh pr diff:*), Bash(gh pr comment:*), Skill, Agent
---

# Ravelston Code Review

Review code changes for bugs AND unnecessary complexity. Both matter equally.

**Guiding mental model — leaves can be hacky, roots cannot.** Picture the codebase as a tree. *Leaves* — peripheral, feature-specific code — can tolerate pragmatic shortcuts; a hacky leaf is cheap to fix and contained. *Stems and roots* — shared infrastructure, data models, anything many things depend on — must not be polluted. Calibrate scrutiny accordingly.

**Repo layout** (all paths relative to repo root; base branch is `main`):

- `marketing-site/` — public marketing website
- `app/` — the companion app for the sensor hardware
- `research/` — sensor research, signal processing, simulation experiments (mostly Python and Markdown)
- `scratch/` — throwaway prototypes; review leniently — flag only outright bugs the author would want to know about, never style or structure
- `setup/` — environment and tooling setup scripts

## Step 1: Identify Scope

Determine what to review based on `$ARGUMENTS`:

- **No arguments** — Review unstaged and staged changes (`git diff` + `git diff --cached`)
- **`PR #123`** or a PR URL — Fetch the PR diff with `gh pr diff`
- **A branch name** — Review changes vs main (`git diff main...<branch>`)
- **Free-text description** — Interpret the intent and run the appropriate git commands

Always run `git log --oneline -10` for recent commit context.

## Step 2: Load Domain Guidelines

Based on the changed files, invoke the relevant guideline skills using the `Skill` tool:

- **React / Next.js code** (`marketing-site/**/*.tsx?`, `app/**/*.tsx?` when the app is web-based) → invoke `/vercel-react-best-practices`

Invoke all that apply before starting the review. (As the repo grows domain conventions of its own — sensor data pipelines, BLE protocols, app architecture — add guideline skills alongside this one and route to them here.)

## Step 3: Analyze the Code

Review each changed file for two categories:

**Bugs & correctness**: logic errors, null/undefined/None handling, async consistency, off-by-one and unit errors (the research code deals in Hz, kg, m/s² — mixed units are a real hazard here), security issues (input validation, secrets in code, unauthenticated endpoints), dead code, missing test coverage for meaningful new logic.

**Convention adherence**: Check the changed code against the guidelines loaded in Step 2, plus the repo's own README and any CLAUDE.md. For each guideline loaded, iterate through its checklist item-by-item and explicitly check whether the diff violates each item — passive scanning misses violations that require checking against a specific convention.

**Necessity & simplicity (review the approach, not just the code)**: Don't stop at checking that the diff is internally correct — step back and ask whether it is the *minimal* solution. Flag as `important`:

- A new mechanism, abstraction, or subsystem that **layers on top of a simpler change which already addresses the root cause**. If correcting the actual faulty parameter (a wrong constant, a too-short timeout, a missing guard) resolves the issue, the extra machinery is redundant and should be deleted, not debugged into correctness.
- A fix applied at a single call site when the underlying defect affects several call sites — push it down to the shared layer.

**Root cause vs symptom**: For any bug-fix change, identify the root cause and ask *"does this change remove that cause?"* Flag as `important` a change that only patches a symptom when a root-cause fix is feasible and not materially harder — and say what the root-cause fix would be. A symptom-level mitigation is sometimes legitimate but must be explicitly justified and ideally paired with a root-cause follow-up.

**Don't vandalise core code paths**: New features must be integrated using the established patterns of the surrounding code — not bolted on with ad-hoc `if`/`else` branches along the path of least effort. Flag as `important` any change that special-cases a new feature into a shared path instead of following the existing integration pattern, and point to the pattern it should have used.

**Boolean parameters used for internal control flow are a code smell**: A boolean argument that switches what a function does internally should usually be separate functions, an enum/`Literal`, or polymorphism. The tell-tale is a bare `do_thing(..., True)` call site where the literal carries no meaning. Flag as `important`.

**Out-of-diff sweeps — the diff is not the unit of correctness.** The sweeps below share one failure mode: the new code is internally correct and passes its tests, yet the thing it is wrong *about* lives in a file the diff never shows. Each requires opening unchanged files — treat every trigger as a standing obligation to go read outside the diff.

- **Reuse & duplication sweep**: When the diff adds a helper, utility, converter, or module performing a *generic, reusable* transformation, actively search the repo for an existing equivalent before accepting it. Grep by capability, not by name. If an equivalent exists, flag as `important` and point at the canonical module to reuse.
- **Enum / registry fan-out sweep**: When the diff adds a member to a central enum, constant registry, or discriminated set of allowed values, verify every surface that hand-maintains a parallel representation of that set was updated (mirror types, dispatch tables, config maps, serialization/label maps). A stale subset mirror neither fails the type checker nor breaks existing tests — the new option is just silently unavailable. Grep for the enum name and its members' string values across the repo.
- **Feature-flag / config gating sweep**: When a change is gated behind a flag or config default, verify the gating is *complete* — trace every shared function the diff modifies and confirm each new behaviour is inside the gated branch, checking *all* callers, not just the new one.
- **Sibling-consistency sweep**: When the diff adds a function alongside existing siblings (a batch twin of a per-row function, a second implementation of a pilot pattern), open the sibling and compare the two signatures parameter by parameter. The recurring leak is a new entry point that pushes onto its callers something its siblings keep inside.

**Test scrutiny**: Apply the same scrutiny to added or substantially modified tests. Self-check: would the test still pass if the function it names were replaced with `raise NotImplementedError` / `throw new Error("unimplemented")`? If yes, flag it as `CATEGORY: guideline, SEVERITY: important`. Sweep changed test files for:

- **Implementation-coupled assertions** — assertions on exact log strings, verbatim metric names, private methods/attributes, call order of internal collaborators, or source text. *Fix:* assert the observable behaviour, not the choreography.
- **Trivial / tautological tests** — a test that never invokes the function it claims to cover; asserting a mock returns what it was configured to return; constant-equals-itself assertions; sole assertion `x is not None` where a concrete value is checkable. *Fix:* call the function under test and assert on its output, or delete the test.

Quote the offending line in the finding.

## Step 3b: Calculate Scary Score

Assign a **Scary Score (1-10)** indicating how likely this change is to cause real problems.

| Score | Description | Examples |
|-------|-------------|----------|
| **1-2** | Trivial, isolated | Typos, copy changes, comments, test-only changes, anything in `scratch/` |
| **3-4** | Low risk, contained | Single-component UI changes, new utilities with tests, research experiments |
| **5-6** | Moderate risk | New API endpoints, business logic changes, database/query changes, changes to shared components, signal-processing changes that alter computed results |
| **7-8** | High risk | Authentication/authorization, payment/billing, data migrations, error handling in critical paths, firmware/sensor-protocol changes that are hard to roll back once devices ship |
| **9-10** | Extreme risk | Infrastructure/deployment changes, schema migrations, anything touching user data integrity |

**Hard floor — irreversible changes score above 5**: schema migrations, external API contract changes, state-machine transitions existing data relies on, and (once hardware exists) anything baked into shipped firmware or on-device data formats.

**Risk amplifiers**: large blast radius, no test coverage, silent failure modes, concurrency, external dependencies. **Risk mitigators**: complete flag gating (verify with the gating sweep first), comprehensive tests, isolated scope, easy rollback, low-traffic path.

## Step 3c: Recommend Test Coverage

Include these as findings (CATEGORY: `testing`, SEVERITY: `important`) when warranted:

- **New utilities, hooks, or pure functions with meaningful logic** — flag if no corresponding test.
- **New API endpoints or service functions** — flag if added without tests.
- **Signal-processing / estimation code in `research/` promoted into `app/`** — recommend regression tests pinning known input→output pairs from the simulation results before the code leaves research.
- **Scary score >= 7** — strongly recommend running the full relevant test suite before merging.
- **Meaningful logic changed without corresponding test updates** — flag as `important`.

Use the test commands the touched package actually defines (check its `package.json` / `pyproject.toml` / Makefile) rather than assuming a runner.

## Step 3d: Dispatch Specialized Review Agents

If the `pr-review-toolkit` plugin agents are available, launch up to 4 in parallel using the `Agent` tool (with `run_in_background: true`); if they are not available, skip this step.

**Always dispatch these three:** `silent-failure-hunter`, `pr-test-analyzer`, `code-reviewer`. **Conditionally dispatch:** `type-design-analyzer` — only when the diff introduces new Pydantic models or new TypeScript types/interfaces.

Pass each agent the full diff context. Wait for all dispatched agents to complete before proceeding, then map each agent's findings to the standard FINDING format below.

## Step 4: Compose Raw Findings

List every potential finding AND the scary score using this exact format. This is internal — it gets passed to the formatter, not shown to the user.

**Scary Score Block** (exactly once, at the top):

```
SCARY_SCORE: [1-10]
SCARY_RATIONALE: [2-3 sentences explaining the score]
```

**Finding Blocks** (one per issue found):

```
FINDING: [short title]
FILE: [path:line]
CATEGORY: bug | guideline | testing
SEVERITY: critical | important | speculative
DESCRIPTION: [full reasoning — be verbose here, it's internal]
```

Severity guide:
- **critical**: Definite bug that produces wrong behavior today, OR a violation with serious consequences (security, data integrity)
- **important**: Correctness issue or clear convention violation that would warrant requesting changes in a PR review
- **speculative**: Theoretical issues. Purely cosmetic or subjective preferences with no guideline backing should be omitted entirely.

Do NOT output anything to the user yet.

## Step 5: Dispatch to Formatter

Call the `Agent` tool with `subagent_type: "general-purpose"` and `model: "haiku"`. Pass a prompt containing your raw findings and the formatting rules below. The prompt you send must follow this structure exactly:

<formatter_prompt_template>
You are a code review formatter. You receive raw findings and produce final output. You have NO access to the source code — work only with what's provided.

## Raw Findings

[paste SCARY_SCORE block and all FINDING blocks from Step 4 here]

## Filtering Rules

Drop any finding with SEVERITY "speculative". Keep all "critical", "important", and "testing" findings regardless of PR size.

## Output Format

ALWAYS start with the Scary Score line, then the rest of the review.

**Scary Score: [N]/10** — [one sentence rationale from SCARY_RATIONALE]

If no findings survive filtering, follow the scary score with:

**LGTM**

If findings survive, follow the scary score with this template (only include tiers that have findings):

### Critical

**[Short title]** — `file/path.ts:42`

[One to three sentences. What's wrong, why, how to fix.]

### Important

**[Short title]** — `file/path.ts:99`

[One to three sentences. What's wrong, why, how to fix.]

### Should Fix

**[Short title]** — `file/path.ts:77`

[One to three sentences. Convention violations that aren't bugs but should be addressed. Cite the specific guideline.]

### Testing

**[Run/Write]: [Short title]** — `file/path.ts` (or general)

[One to three sentences. What to run or write, why it matters for this change. Prefix with Run for executing existing tests, Write for recommending new test coverage.]

## Hard Constraints

- Output ALWAYS starts with `**Scary Score: N/10**` line.
- After the scary score line: either `**LGTM**` or findings starting with `### Critical`, `### Important`, `### Should Fix`, or `### Testing`.
- Output ends with the last sentence of the last finding (or **LGTM** if no findings). NOTHING after it.
- No title. No summary. No preamble. No "Here is my review". No "Overall". No verdict. No sign-off. No praise.
- Never include a tier header with no findings under it.
- Never include a tier other than Critical, Important, Should Fix, or Testing.
- Be concise but thorough — use as many sentences as needed to clearly explain each finding.
</formatter_prompt_template>

## Step 6: Output

Your final output is EXACTLY what the Agent tool returned. Do not add a title, summary, preamble, sign-off, or any other text before or after it. Always print it to stdout.

## Step 7: Post to the PR

Self-posting the review is all this step does, so a caller can disable it wholesale without suppressing your output.

**The caller decides who publishes, and the caller's instruction always wins.** If whoever invoked you said not to post — or said it publishes your final message for you — stop here; a self-post would duplicate their comment.

Otherwise, when the user gave a PR number or URL, post the review on that PR with `gh pr comment`. Default to posting when the caller said nothing either way.

## User Arguments

- `/ravelston-code-review` — Review unstaged/staged changes
- `/ravelston-code-review PR #123` — Review a specific PR
- `/ravelston-code-review branch-name` — Review changes on a branch vs main
- `/ravelston-code-review <free text>` — Interpret intent (e.g., "last 3 commits")
