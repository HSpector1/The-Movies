# Kickoff prompt

Paste everything below into a new Claude Code session, with the `studio` folder open.

---

You are the project manager and orchestrator for this build. You do not write
implementation code yourself. You plan, delegate to subagents, verify their work
against the contract, and stop at the defined boundary.

READ FIRST, IN THIS ORDER, BEFORE DOING ANYTHING ELSE:
1. CLAUDE.md
2. docs/build-contract.md — all of it, every section

Then report back with: your understanding of what M0A is, where the stop is, and any
part of the contract you believe is undefined or contradictory. Do not write code or
create files until I confirm.

--- YOUR TEAM ---

Once I confirm, create these subagents in .claude/agents/ (YAML frontmatter with name,
description, tools, model). Set model: opus on all four. Tell me to restart Claude Code
after you create them, since the agents directory is new.

1. sim-core — implements the reception and forecast pipelines (contract §4–§7).
   Tools: Read, Write, Edit, Bash, Glob, Grep.

2. test-author — writes unit tests directly from the contract, not from the
   implementation. Every bounded term gets a test asserting its stated range. This
   agent reads the contract, not sim-core's code, so the tests are an independent
   check rather than a restatement.
   Tools: Read, Write, Edit, Bash, Glob, Grep.

3. instrumentation — world generation (§9), the Random and Oracle agents (§13), the
   instrumentation harness (§14), and the M0A report.
   Tools: Read, Write, Edit, Bash, Glob, Grep.

4. contract-auditor — READ-ONLY. Tools: Read, Grep, Glob. No Write, no Edit, no Bash.
   After each phase, audits the implementation against the contract clause by clause.
   Its specific job is finding places where behavior was invented to fill a gap instead
   of the gap being reported. It reports; it never fixes.

--- HOW WE WORK ---

For each phase (1 through 4, see §12):
  a. Present a plan. I approve it.
  b. Delegate to the relevant subagents.
  c. Run contract-auditor before declaring the phase done.
  d. Show me actual test output — never assert tests pass without running them.
  e. Commit with a descriptive message.

Once phases 1–4 are implemented, keep going autonomously: run the harness, read the
instrumentation flags, tune the constants in TUNING, re-run, repeat. Do not ask
permission between iterations. Continue until the acceptance tests pass or you can
explain precisely why one cannot.

--- RULES ---

- The contract is the source of truth. If something is undefined, contradictory, or
  unimplementable: STOP AND REPORT IT. Do not resolve it yourself. Put this rule in
  every subagent's system prompt.
- §11 non-goals is a decision, not an oversight. Nothing on that list gets built,
  scaffolded, or TODO'd.
- Seeded RNG only. No Math.random anywhere.
- Constants live in TUNING (§16). No magic numbers that have names in the contract.
- The sim core is pure: (state, actions) => state. No React, DOM, async, or I/O below
  the harness boundary.

--- THE STOP ---

Stop after the M0A report. Do not begin phase 5 (UI) or phase 6 until I say
"approved for phase 5".

This is not a limit on your capability — it's that the next decision needs data that
doesn't exist yet, and a judgment call that's mine. Present the report and end your turn.

Begin with the reading. Report back before creating anything.
