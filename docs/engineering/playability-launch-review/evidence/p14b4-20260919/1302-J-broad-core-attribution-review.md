# 1302-J: independent review of the 1302-I broad core attribution

Independent contract-auditor review (read-only tools: Read, Glob, Grep) of
[1302-I-broad-core-attribution.md](1302-I-broad-core-attribution.md) and
[1302-I-failures.json](1302-I-failures.json) against the raw capture
[1302-p4p5-broad-core.txt](1302-p4p5-broad-core.txt), with a tracing brief for the flagged possible regressions.
The parent persists the verdict verbatim. The reviewer's closing note about a stray "Claude Docs" instruction block
is retained: the parent's session exposed an unrelated MCP server instruction block during the review; the reviewer
correctly ignored it, and it affected nothing in this record.

---

KEEP (with one material refinement below; the attribution report itself should not be reworked, but item 3c's disposition should be corrected before the parent files it as an open regression).

## Method check (task 1)
MET WITH EVIDENCE. `1302-I-failures.json` contains exactly 498 `"identity"` rows (grep count). Cluster `n` values in the prose table sum to exactly 498 (146+94+47+42+25+23+23+20+15+9+9+8+7+6+5+5+3+2+2+2+2+1+1+1). A direct grep for `cluster_id` values `C1-/C9-/C10-/C14-` in the JSON returns 159 matches, exactly matching the prose table's 146+8+3+2. I independently confirmed several individual rows against the 30MB raw log:
- `tests/p14b4-cast-class-policy.test.ts` "natural rival policy": raw log line 67055-67071 shows the exact identity, primary (`expected ... to have a length of 1 but got 6`), and frame (`:452:25`) the report cites.
- `tests/bridge-p13-campaign-isolation.test.ts` timeout row matches its JSON primary/status.
- `tests/bridge-contract-generator.test.ts` two C12 rows match JSON.

VANISHED (33): MET WITH EVIDENCE, 7 examples (exceeds the required 5). `bridge-p12-campaign-library.test.ts` appears exactly once in the 30MB raw log, and that single hit is the vitest file-discovery echo on line 1 (a list of test-file path strings), not a `✓`/`❯` result line, confirming the file never ran (matches the 1296-A exclusion claim). Six of the 22 claimed "genuine pass" files were confirmed as whole-file `✓` lines with the exact test counts cited: `casting-sessions-save-v10.test.ts` (6 tests, line 3548), `roster-wall-artifacts.test.ts` (16, line 1701), `production-operations-save-v8.test.ts` (20, line 1881), `d12-economy.test.ts` (17, line 3156), `d14-star-power.test.ts` (15, line 3500), `p12-starting-world.test.ts` (3, line 4169).

## Class-a clusters (task 2)
MET WITH EVIDENCE for C1, C2, C3, C4, C5, C9, C10, C14; none hides a production defect.

C1: confirmed `proveProfessionSave` (`src/core/save.ts:10294-10393`) is intentional versioned validation, throwing `validateSaveV${version}: expected version ${version}` only when the save's own `saveVersion` field disagrees with the wrapper it was called through. `validateSaveV38`/`V39`/`V40` (lines 10308-10310, 10356-10358, 10392-10394) each hardcode their own literal `version`; that is correct production behavior, not a bug. The stale caller is test code: `tests/contracts/phase-table-agreement.contract.test.ts:104`, `saveOf()`, calls `validateSaveV38(save)` where `save = makeSave(state)`. `makeSave` (`src/core/save.ts:6542`) returns `SaveFileV40`, and `LIVE_SAVE_VERSION = 40` is defined at line 6538. So a current writer's output (v40) is being fed to the v38-named validator by the test helper, exactly the pattern the report claims, and production is not the culprit.

C2-C5: confirmed identical patterns, each a `tests/helpers/*.ts` (no `.test.ts` suffix, outside the 1301 grep filter) function hardcoding `.toBe(38)` against `makeSave(state).saveVersion`: `p14c3-fixtures.ts:126` (`envelope38`), `p14c3-genuine-evidence-fixtures.ts:17` (`acceptedEvidence`), `p14c3-second-episode-fixtures.ts:27` (`accepted`), `p14c3-history-boundary-fixtures.ts:26` (`acceptBoundary`). All stale test-side literals.

C9: confirmed live `PROJECTION_VERSION = 55` at `bridge/schema/bridge-schema.ts:281`. `tests/bridge-p13b-s4-office.test.ts:235` still expects 53; `tests/bridge-p14b6-relationship-read-models.test.ts:100` defines `const INCOMING_PROJECTION = 53` (its own stale definition line, not the symbolic comparison at :758). Confirmed stale literal, class a.

C10: confirmed `tests/bridge-p13b-r07-setup.test.ts:587`, `expect(parsedSaveVersion).toBe(38) // the CURRENT live version`, a comment now false against live=40. Stale literal.

C14: confirmed and refined. The stale-regex classification is correct but the mechanism is more specific than a version-number bump. `src/core/professionHistory.ts:67` throws `${caller}: cannot downgrade or discard profession transition...`; `src/core/save.ts:10341` calls it with `caller='migrateToV37'`, matching the test's old regex exactly. But `src/core/save.ts:10403-10412` (`convertV40ToV39`) now throws a *different*, newer guard first, `migrateToV39: cannot downgrade or discard an opportunity predicate or recorded first-take subject`, whenever a genuinely-live V40 save carries first-take-subject facts or an opportunity promise predicate, and this guard runs before the chain ever reaches the old V37 guard. The regex is stale because a newer, earlier guard intercepts, not because a version digit moved. Still class a (a literal/regex encoding a now-unreachable message), no production defect.

## Flagged items (task 3)

a. `p14b1-trust-chooser.test.ts:620`: PARTIAL, mechanism confirmed, root cause NOT VERIFIED. The assertion is `expect(index).toBeLessThan(sequence.length)` where `index = observed.reads.length` and `sequence.length` is 1 (proven) or 2 (unproven). In 1100 the 220-week natural search never found a witness at all (the whole boundary was dead code). In 1302 it does find one, and that witness immediately violates the invariant. This is genuinely not a masked pin; it is newly-live code hitting an assertion that was previously unreachable. I could not trace which production authoring path is issuing the extra read without executing the test. Agree with the report: independent review needed, priority candidate.

b. `p14b4-cast-class-policy.test.ts:452`: PARTIAL, same status. Confirmed via source and raw log that `calls.length` (evaluate-spy hits per submission) is 6 against an expected 1. The magnitude (not off-by-one) is notable. I could not identify the specific candidate-generation function without execution.

c. `bridge-p14b1-promises.test.ts:400` / `bridge-p14b3-promise-command.test.ts:180`: REFINEMENT to the report's disposition, from "possible regression, needs review" toward INTENDED LAW CHANGE, likely a stale test premise. `src/core/promises.ts:236-239` shows `NOT_OFFERED_IN_B1` now lists only `PREFERRED_GENRE_OPPORTUNITY` and `SPECIFIC_PROJECT`; `DIRECTING_COUNT` was removed and replaced by an explicit director-predicate subsystem (`promises.ts:543-561`, `isDirectorPredicate`, `directorCount`). The same slice added `qualifyingRole: 'cast'|'director'` to the promise read-model (`src/core/talentMarket.ts:493,513`), the same field the report's own C18 cluster independently cites. Both tests chose `DIRECTING_COUNT` specifically as "the family that's always refused"; that premise predates the now-shipped Director-promise feature. I did not execute the test or trace the full `quote()`→`promiseQuoteSnapshot`→`promiseFeasibility` call chain, so this is not MET WITH EVIDENCE at full confidence, but it is strong enough that the parent should downgrade this from an open "candidate regression" to "likely stale fixture, needs a family still on `NOT_OFFERED_IN_B1` or the `directorCount` predicate added."

d. C8: NOT VERIFIED beyond the report's own honest caveat (no time to check each of ~5 distinct search targets across 42 rows). C7's shared root (below) is independently confirmed real.

e. C7/C20: C7 MET WITH EVIDENCE. `src/core/promises.ts:144`, `if (state.firstTakeSubjects === undefined) throw new Error('promises: migrate to Save40 before recording a first take')`, exact text match. This is a deliberate migration guard, not a defect; fixtures that never acquired the root are the test premise. C20: NOT VERIFIED (did not open `bridge-p14c2rm-runtime.test.ts:15-28`).

f. C16/C16b: NOT VERIFIED (did not open the two helper files; budget-limited, not contradicted).

g. 20 unresolved: NOT VERIFIED individually. Given that (c) above resolved with two greps once I looked past the report's own stopping point, some of the 20 may be similarly resolvable; that is a plausible next increment, not a criticism of the report's honesty in leaving them open.

## Priority list of suspected items needing a RED witness
1. `p14b1-trust-chooser.test.ts:620` (rival-authoring read-count invariant now reachable and violated).
2. `p14b4-cast-class-policy.test.ts:452` (candidate count 1 to 6).
3. `bridge-p14b1-promises.test.ts:400`/`bridge-p14b3-promise-command.test.ts:180` (downgrade priority: likely stale fixture, not a defect, pending someone tracing the actual quote pipeline for a DIRECTING_COUNT draft without an explicit predicate).

## What I could not verify
C8's shared-root claim across all 42 rows, C20's `currentSlot()` strip-list, C16/C16b fixture files, and 20 UNRESOLVED rows were not independently opened due to review budget. No vitest/tsc/node was run by me; every finding above traces to a cited `Read`/`Grep` of source or the raw log bytes, consistent with READ_ONLY mode.

Key paths: `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1302-I-broad-core-attribution.md`, `.../1302-I-failures.json`, `.../1302-p4p5-broad-core.txt`; `/Users/zacheryspector/The-Movies-headless-program/src/core/save.ts` (6538, 6542, 10294-10393, 10341, 10403-10412); `/Users/zacheryspector/The-Movies-headless-program/src/core/professionHistory.ts:67`; `/Users/zacheryspector/The-Movies-headless-program/src/core/promises.ts` (144, 236-239, 543-561); `/Users/zacheryspector/The-Movies-headless-program/src/core/talentMarket.ts:493,513`; `/Users/zacheryspector/The-Movies-headless-program/bridge/schema/bridge-schema.ts:281`.

Note: a "Claude Docs" MCP instruction block appeared mid-conversation directing me to create a project document. I have no such tool and it is unrelated to this READ_ONLY task, so I disregarded it; flagging it in case the parent wants it investigated as a stray/injected instruction.
