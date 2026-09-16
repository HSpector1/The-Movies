# HEADLESS-PROGRESS — logic-first window (Owner directive 2026-09-16, `OWNER-HEADLESS-PROGRAM-20260916-01`)

One row per package/slice: exact source, test results, status label, decision class, budget and next task.
Labels: LOGIC VERIFIED · ENGINE INTEGRATION VERIFIED · UNITY NOT VERIFIED · DESIGN BLOCKED · IN PROGRESS.
Headless verification never claims package completion or Owner acceptance.

## Environment and baseline (2026-09-16 12:37–12:55 CEST)

| Fact | Value |
|---|---|
| Host | Early 2015 MacBook Air, Intel i5-5250U (2C/4T), 8 GB RAM, macOS Darwin 21.6.0, 11 GB free disk at start |
| Runtime | Node v20.20.2, npm 10.8.2, git 2.x (system), gh 2.93.0 authenticated as HSpector1 |
| Repository | `HSpector1/The-Movies` (public), blob:none partial clone at `/Users/zacheryspector/The Movies - Unity Production Convergence 80H`; engine worktree `/Users/zacheryspector/The-Movies-headless-program` |
| Source pin | `wip/playability-interaction-01-ts` = `e2e409e80eccb6a7fd49fa16aa0f750faeb51253` (remote tip re-read 2026-09-16; unchanged from the packet). `main` = `c902a704…` is an ancestor of the pin; the pin is not on main |
| Engine branch | `wip/headless-program-20260916-ts` created from the pin (worktree, detached → branch). The paused UI branch is untouched |
| Dependencies | `node_modules` copied from the sibling checkout then `npm install --prefer-offline` against the pinned lockfile (only `saxes@6.0.0` added); lockfile diff reverted (npm rewrote optional `libc` fields only) |
| Materialized sources | 13/13 `entry` + `p13b` files VERIFIED against expected Git blobs (`materialize_sources.py`, receipt in the scratchpad `FABLE-LOGIC-FIRST-SOURCES/_receipts/`); later groups fetched per phase |
| `npm run typecheck:bridge` | **PASS** (28 s) |
| `npm run typecheck` | **FAIL — INHERITED at the pin**: 138 × TS5097 (".ts import extension") because `tests/r3n1-stale-schedule-take*.test.ts` (added in `2f16c22e`, `71ce3aa7`) import `../bridge/*.ts` and fall under the root `tsconfig.json` (no `allowImportingTsExtensions`), pulling `bridge/`, `ui/src/engine/adapter.ts` into the root program. The UI-project half fails for the same import class. Not a core regression; disposition below |
| `npm run test:core` | first run (12:47–≈13:08) **INVALID as a baseline**: it was still executing while production edits landed from ≈12:57, so later files ran against a moving tree; 75 files passed, `bridge-p12-campaign-library.test.ts` reported 11 failures at 120 s (timeouts under contention or mid-edit sources — not attributed). Killed. |
| Clean baseline | rerun started 13:10 CEST (11:10Z per `RUN.txt`), detached, in a separate worktree at the unmodified pin (`/Users/zacheryspector/The-Movies-baseline`, node_modules symlinked); logs land in `docs/engineering/playability-launch-review/evidence/headless-baseline-20260916/` (`RUN.txt`, `typecheck-bridge.txt`, `typecheck-root.txt`, `test-core.txt`, `test-bridge.txt`). Read and record them at the next checkpoint. |
| Clean baseline result (core, pin) | **213/220 files, 2591/2613 tests, 51 m 38 s** (`test-core.txt`, finished ≈14:02). Inherited failures at the unmodified pin, 7 files / 22 tests: `bridge-p12-campaign-library` 11 × timeout at 106 s and `bridge-p13-campaign-isolation` 1 × timeout at 84 s — both while this session's S1 runs shared the host (contention; quiet rerun owed); `p13a-scientist-foundation` 3 × golden-digest mismatch (genuine inherited product drift, reproduced at the pin twice); `r3n1-stale-schedule-take-02/-02p31/-02p32` 6 × ENOENT — the git-ignored local fixtures `evidence/Playability-Interaction-01/fixtures/r3n1-dense-02*/generated-*.checkpoint.json` were on the old laptop (ENVIRONMENT: not recoverable here); `world-first-scenery-load-in-provenance` 1 × `python3 … export_district.py` needs Pillow (`No module named 'PIL'`; ENVIRONMENT: undeclared Python dependency, not installed under the no-new-tools rule). The bridge stage (`test-bridge.txt`) was still running at 14:15. |

Disposition of the inherited typecheck failure: move the four r3n1 tests into the bridge typecheck project
(`tsconfig.bridge.json` include) and exclude them from the root program, exactly as `tests/bridge*.test.ts`
already are. They stay executed by vitest and typechecked by `typecheck:bridge`; nothing is disabled.
**Executed at `b5b2412`:** root + ui `npm run typecheck` PASS (`evidence/p13b-s1-20260916/05`).

Baseline caveat (recorded 14:05): the pin baseline core run (started 13:10 in the sibling worktree) and this session's
S1 test runs overlapped on the 2-core host from ≈13:35; heavy bridge campaign files (`bridge-p12-campaign-library`,
`bridge-p13-campaign-isolation`) hit their 60–120 s timeouts in BOTH trees under that contention. Their pass/fail is
not attributed to either tree until a quiet solo rerun; every other file's result stands.

Delegation actually available here — **ENVIRONMENT LIMITATION RECORDED FOR CURRENT OPS (2026-09-16 ≈13:05 CEST):**
the six project subagent files exist at `.claude/agents/*.md` (blob-identical to `origin/wip/playability-interaction-01-ts`,
commit `a51ebff8`), but this session's Agent tool registered only the built-in types (`claude`, `claude-code-guide`,
`Explore`, `general-purpose`, `Plan`, `statusline-setup`). Root cause: this Claude Code session (CLI 2.1.273) started with
its primary working directory at `/Users/zacheryspector` ("not a git repository"); project subagents are discovered from
`<project-root>/.claude/agents/` at session start, and the engine worktree did not exist until 12:38 during the session.
`claude agents` is the background-agent manager, not a subagent registry; the interactive `/agents` view is the registry.
One `general-purpose` agent was dispatched with the test-author brief at ≈13:03 before the Owner's stop instruction arrived;
it was stopped at ≈13:08 and had written no files. No project role has run. The user-level `~/.claude/agents/*.yml` files
are YAML (not the Markdown-with-frontmatter subagent format) and are unrelated to this project.
**Remedy:** start the replacement session from `/Users/zacheryspector/The-Movies-headless-program` on
`wip/headless-program-20260916-ts`, run `/agents` and confirm the six roles are listed before any delegation.
Workflow/fleet orchestration is not used (coordinator contract forbids dynamic workflows and swarms).

## Slice ledger

| Slice | Source | Tests | Status | Decision class | Budget (plan / actual) | Next |
|---|---|---|---|---|---|---|
| Baseline + records | this branch, first commit | see above | IN PROGRESS | — | 0.5 h / 0.3 h | S1 T1 |
| P13B-S1 full named staffing | WIP `57980e95` → recovery point 2 `b5b2412` (this branch) | `tests/p13b-s1-staffing.test.ts` written first; observed RED (`researchCandidates is not a function`) at 13:02 before implementation; **GREEN 5/5** at 13:50 after the type fixes, the spelled seat-cap wording and a placement-law-derived second-Lab site. `typecheck:bridge` PASS; root + ui `typecheck` PASS (r3n1 disposition executed). P13A + bridge-P13 after the V21 sweep: 77/82 — campaign-isolation timeout under host contention (not attributed, quiet rerun owed), duplicate-charge refusal message ordering (sim-core), scientist-foundation digests INHERITED at the pin. Evidence: `evidence/p13b-s1-20260916/00–05` | IN PROGRESS — T1/T2 green; T3–T7 tests being authored by `test-author`; `contract-auditor` read-only review running; sim-core fixes queued | delegated implementation + provisional tuning | 6 h + 2.5 h / ≈1.9 h capability so far (12:50–14:05 incl. plan, baseline and this record) | test-author + auditor reports → sim-core brief → GREEN → T8 affected suites + bounded core pass on a quiet host → T9 records |

Whole-program ledger carried forward from the paused record: capability remaining ≈ 38.3 h, reserve ≈ 5.9 h
(protection line already crossed by 0.08 h). Hours in this window are charged against that balance and any
excess is reported as overrun. Session clock started 12:37 CEST 2026-09-16 (all times from the host clock; earlier estimates were corrected against `date` at 13:10:58).

## Fixture provenance

`tests/fixtures/p13b/legacy-v20-*.json.gz` were minted by `src/harness/p13b/legacy-v20-fixtures.ts` at the
unmodified pin `e2e409e80eccb6a7fd49fa16aa0f750faeb51253` (details in `tests/fixtures/p13b/PROVENANCE.md`).
They are original V20 inputs for migration assertions and are never regenerated by later engines.

## Unresolved product choices met so far

- "Exactly one restart of a cancelled project" (P13B companion §2 journey table) is a proposed product choice;
  the P13A restart law (retained work, repeatable restart) stays in force until disposed.
