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
| Clean baseline result (bridge stage, pin) | **50/54 files, 540/554 tests** (`test-bridge.txt`, 14:02–14:50, contended by this session's S1 runs): the 4 failing files are all per-test timeouts — `bridge-p12-campaign-library` ×11, `bridge-p13-campaign-isolation` ×1, `bridge-runtime-checkpoint-prepared-reuse` ×1, `bridge-runtime-worker` ×1 (the last two passed in our quiet matched bridge stage). Baseline chain end 14:50:56 CEST. The whole baseline directory is committed at the S1 closeout. |
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
| P13B-S1 full named staffing | Engine: `57980e95` (WIP) → `b5b2412` (type fixes, V21 sweep, staffing green) → `5a52e1e` (tests 3–10) → `d74426a` (audit fixes; **production source of record**) → `4e83d44` (docs) → T9 commit (eight test-expectation fixes only, no source). Live save: **V21** (V22 is S2's planned change). Bridge protocol 4 / projection 32, manifest schema unchanged (`check:bridge-contract` + fixtures PASS at b5b2412 and in the matched bridge stage) | Requirement tests (plan §S1 1–10), all on generated worlds: `p13b-s1-staffing` 5/5 (RED 13:02 before implementation → GREEN 13:50), `p13b-s1-scheduler` 13/13, `bridge-p13b-s1-identity` 1/1 (same-name pair, seed `p13b-identity-0049`), `p13b-s1-save-v21` 8/8 (three frozen V20 fixtures + accepted V19 → V21, downgrade refusals, campaign isolation), `p13b-s1-validation` 7/7 (each forged message confirmed). Read-only audit at b5b2412: no false refusals, 23 invariants confirmed, 3 findings fixed in d74426a. **Matched full pass on a quiet host at d74426a** (`evidence/p13b-s1-20260916/06–07`, same flags as the pin baseline): core 217/225 files, 2625/2647 tests (32 m); bridge stage 53/55 files, 544/555 (18 m). Failing set = the pin's inherited set (`r3n1-*` ENOENT fixtures ×6, `p13a-scientist-foundation` digests ×3, scenery-provenance Pillow ×1, `bridge-p12-campaign-library` ×10 identical per-test 5/20 s timeouts at pin and ours — `11`) plus `bridge-p13-campaign-isolation` ×1: 60 s per-test budget vs a 71.6 s body on ours and 75.5 s at the pin (`13`; the pin's one solo pass was a timer race) — **inherited host speed, ours 5 % faster**; plus one stale V20 message expectation in `bridge-runtime-checkpoint` fixed after the core stage (green in the bridge stage and in `08`). Eight test-expectation files moved to the V22/V21 unknown-version sentinel: `08` 189/189 on the final source. Typechecks bridge + root + ui PASS on the final source (`10`). Read-side cost probe `12`: Laboratory page +18 ms (eight per-candidate recruit preflights), V21 validation not slower than V20 | **LOGIC VERIFIED · UNITY NOT VERIFIED** — S1 only; not P13B completion, not Owner acceptance. Consumer work reserved in `UNITY-INTEGRATION-BACKLOG.md` | delegated implementation + provisional tuning (S1-A/B candidate: $10k/seat, 4 seats/Lab, 8 Scientists/studio; not Owner-approved balance) | 6 h + 2.5 h / **≈3.4 h wall (12:50–16:05 incl. plan, baseline reads, agents, matched pass)** | S1b (projection 33 seats read model) → S2 per the plan expansions of 2026-09-16 |
| P13B-S1b Laboratory seats read model (bridge projection 33) | the S1b commit on this branch (engine unchanged; bridge schema/page + generated artifacts) | RED `evidence/p13b-s1b-20260916/00` 8/8 at aa0ccce before implementation (test-author) → GREEN 8/8 (`01`, coordinator rerun). sim-core verification: schema + generator + bridge 71/71, bridge-P13 17/17, projection pins 67/67; `check:bridge-contract` + fixtures verified; new schemaId `sha256:9ee4bcff…`, projection 33, protocol 4; bridge tsc PASS; root tsc PASS for every committed file (the in-flight S2 test files are excluded from this commit) | **LOGIC VERIFIED · UNITY NOT VERIFIED** — DTO change pending paired Unity adoption (backlog S1b entry) | delegated implementation decision (additive members; projection bump per README law) | 2 h + 1 h / ≈0.6 h wall (16:10–16:45) | S2-T1…T3 (sim-core, dispatched 16:45) with tests 1–4 already RED (`tests/p13b-s2-*.test.ts`, test-author) |

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
