# Fable agent setup — smoke test receipt

Run 2026-09-13 in a fresh Claude Code session from this setup worktree
(`~/The Movies - Fable Agent Setup`, branch `chore/fable-agent-setup-01`),
per `docs/operations/fable-team/SETUP-RECEIPT.md` and the Owner-provided
`02-SMOKE-TEST-PROMPT.md` (sourced from `~/Desktop/STUDIO-FABLE-AGENT-KIT.zip`).
One-agent registration smoke test only. No gameplay execution, research campaign,
native input, builds, or source editing were performed.

## Step 1 — agent registration

This session's own agent-type listing (surfaced by the harness at session start,
not something this session queried after the fact) named all six project-local
custom subagents as available for delegation, by exact name:
`contract-auditor`, `instrumentation`, `sim-core`, `test-author`, `uiux-designer`,
`unity-ui` — each shown with its own description and tool allowlist distinct from
the built-in `general-purpose`/`Explore`/`Plan` agents. This is registration
evidence beyond file existence: the harness would not list a project-local agent
by name with its own frontmatter-derived tools/description unless it had actually
loaded `.claude/agents/*.md` in this worktree.

Per the prompt's constraint, `claude agents` / `/agents` were not used as a
cross-version check (current versions repurpose `claude agents` for background
sessions; `/agents` may be a wizard only on older versions) — the installed
version's actual mechanism (the Agent tool's own agent-type listing) was used
instead.

## Step 2 — contract-auditor invocation

Exactly one `contract-auditor` custom subagent was invoked (via the Agent tool,
`subagent_type: "contract-auditor"`), not a general-purpose substitute, not
parent self-review, and not a separate `claude` process launched via shell.

- **Tool allowlist granted:** `Read, Glob, Grep` only — no Bash, Write, Edit,
  network, or delegation tool. Matches the frontmatter in
  `.claude/agents/contract-auditor.md` and the MODE READ_ONLY assignment given.
- **Scope given:** read only `FABLE-COORDINATOR.md` and the six
  `.claude/agents/*.md` files in this worktree — not the whole repository.
- **Result: PASS.** The subagent confirmed, with file/line references:
  - The "full UI/UX overhaul → remaining P13B, if still open → P14 → P15 → P16"
    sequencing is present verbatim in `FABLE-COORDINATOR.md:15-16`.
  - The 1A desktop-first / 2B optional lawful dragging with ordinary
    alternatives / 3A contextual-help-only / 4B selective-attention bundle is
    present verbatim at `FABLE-COORDINATOR.md:48-51`.
  - "One production writer by default, one integration owner, one native-input
    slot" is present verbatim at `FABLE-COORDINATOR.md:28-29`.
  - Staged execution authorization (task-specific escalation as a stated
    coordinator decision) is present at `FABLE-COORDINATOR.md:25`; the
    no-automatic-advancement property is implied via `FABLE-COORDINATOR.md:17-18`
    rather than stated in those exact words — flagged as a minor non-literal
    paraphrase, not a substantive mismatch.
  - All six agent files carry distinct, correct frontmatter. `uiux-designer.md`
    and `unity-ui.md` both declare `model: opus`, consistent with
    `FABLE-COORDINATOR.md:21`.
  - No concrete mismatch was found against any of the four checked requirement
    areas.

## Step 3 — model verification

**Configured (declared) model defaults per agent frontmatter:**
contract-auditor = sonnet, instrumentation = sonnet, test-author = sonnet,
sim-core = opus, uiux-designer = opus, unity-ui = opus.

**Actual executing model for the contract-auditor invocation above:**
CONFIGURED SONNET / ACTUAL MODEL NOT EXPOSED. The Agent tool's result for this
invocation reported only token usage, tool-call count, and duration — no
runtime model identity field. No `/tasks`-equivalent metadata exposing the
effective model was consulted or available to this session; nothing was
fabricated in its place, and private logs were not inspected to manufacture a
verification. This matches the caveat already recorded in
`SETUP-RECEIPT.md` ("Effective runtime models are NOT VERIFIED YET").

## What this does NOT prove

Six agent files present plus one successful `contract-auditor` invocation
proves that role's registration and read-only tool restriction, and that
`FABLE-COORDINATOR.md` currently reads consistently against the four checked
requirement areas. It does **not** test the other five role workflows
(`sim-core`, `test-author`, `instrumentation`, `uiux-designer`, `unity-ui`),
does not confirm any of their write/Bash-capable tool grants behave as
described in practice, does not confirm actual model identity for any of the
six, and is not a product-acceptance or gameplay-readiness check.

## Changed-path summary

Only one file was written by the parent session, as authorized:
- `docs/operations/fable-team/SMOKE-TEST-RECEIPT.md` (this file, new)

No other file was staged, committed, pushed, or modified. No profile was
edited. No other specialist was launched. No game program, build, test, or
native input was started.

## Result

**FABLE AGENT SETUP VERIFIED** (one-agent registration smoke test scope only;
five other role workflows and actual executing-model identity remain untested
and unverified).
