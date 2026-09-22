668-B contract-audit — READ-ONLY, HEAD 8e03ff97, /Users/zacheryspector/The-Movies-headless-program. No edits, no commands run. All findings are source reads plus re-reads of the parent's archived logs.

## VERDICT

**PRODUCTION PATH: COMPLETE.** No src/, bridge/ or ui/src/ path can hand a state carrying the `relationships` root to a pre-V31 validator or converter without the governed strip. The V31 chain is complete and correctly ordered. All eight new failures are test-side moved premises; **zero production defects**. Disposition on this finding: KEEP the writer's V31 chain; the eight failures are the test-author's to re-express.

## Production-path checks (each with evidence)

**MET WITH EVIDENCE — the V31 strip is symmetric with the V29/V30 precedent.**
`/Users/zacheryspector/The-Movies-headless-program/src/core/save.ts:8759-8762` `stripV31Root` removes exactly `relationships`; `:8770-8783` `validateSaveV31` checks root presence (`:8775`), runs the root's own validator (`:8776`), then hands `validateSaveV30` the *stripped* state (`:8778`). Structurally identical to `stripV29Roots` (`:8616-8631`) / `validateSaveV29` (`:8637-8651`) and to `validateSaveV30`'s own strip (`:8722`). Nesting is correct: V31 strips `relationships` once, V30 then strips `firstTakes`/`promises` before V28 sees anything.

**MET WITH EVIDENCE — `convertV31ToV30` asks the projection BEFORE validating.**
`save.ts:8808-8819`: `projectRelationshipsPreV31(rawState)` at `:8811` on the *raw* state, inside try/catch, wrapping the failure as a DOWNGRADE refusal (`:8813`), and only then `validateSaveV31(save)` at `:8815`. Byte-for-byte the `convertV29ToV28` device (`:8684-8695`). `projectRelationshipsPreV31` (`/Users/zacheryspector/The-Movies-headless-program/src/core/relationships.ts:479-485`) throws when any edge is held.

**MET WITH EVIDENCE — `convertV30ToV31` opens the root EMPTY, recomputes nothing.**
`save.ts:8792-8798`: validate source, insertion-order clone, `{ ...oldState, relationships: [] }`. No backfill. Independently corroborated by the failing projection20 diff at `666-b5-full-core.txt:5612` (`+ "relationships": Array []` — exactly one key gained, nothing else moved).

**MET WITH EVIDENCE — dispatch, sentinel, LIVE_SAVE_VERSION, makeSave.**
`save.ts:5295` dispatches 31 → `validateSaveV31`; `:5297` sentinel reads "versions 1 through 31 only"; `:6409` `LIVE_SAVE_VERSION = 31`; `:6413-6418` `makeSave` stamps 31 and validates **before** the stringify detach.

**MET WITH EVIDENCE — the ~18 downgrade throws and the four route lines.**
V31 refusal throws in `migrateToV8/9/10/11/12/13/14/15/16/17/18/19/20/21/22/23/24/25` — 18 exactly (`save.ts:7330, 7356, 7381, 7407, 7431, 7458, 7537, 7557, 7582, 7610, 7648, 7755, 7837, 7865, 7918, 7981, 8205, 8846`), each placed above its V30/V29 sibling in the same order the V30 bump used. Four route lines through `convertV31ToV30`: `:8370` (V26), `:8522` (V27), `:8604` (V28), `:8703` (V29); plus the direct `:8749` in `migrateToV30` and `:8824-8825` `migrateToV31`. `migrateToV4/5/6/7` need no new line: they guard with `if (save.saveVersion > N) throw` (`:7263`, `:7284`, `:7300`, `:7317`), which already refuses 31 loudly.

**MET WITH EVIDENCE — every live load/save route is on V31.**
Loads: `bridge/session.ts:136` (`importSaveJsonCurrent`, used by `fromSaveJson:1354` and `fromRuntimeCheckpoint:1378`), `bridge/runtime-checkpoint.ts:854` (`importPriorSaveViaCanonicalChain`), `bridge/runtime/campaign-library.ts:48` and `:127`, `ui/src/engine/adapter.ts:3796` plus the two legacy affordances `:3808`/`:3822` (both now end at `migrateToV31`), `src/harness/d16/run-d17b-continuation.ts:183`, `src/harness/d16/run-d17b-week86.ts:124`. Writes: every writer funnels through `ui/src/engine/adapter.ts:3779-3781` → `exportCurrentState` (`save.ts:6436-6438`) → `makeSave` → `validateSaveV31`; consumers are `bridge/runtime-checkpoint.ts:858`, `bridge/snapshot-build-context.ts:118`, `bridge/proof.ts:230/258`, `ui/src/engine/session.ts:43`, `ui/src/screens/Saves.tsx:47`.

**MET WITH EVIDENCE — no prior-checkpoint path validates a live state at its own older projection.**
`bridge/runtime-checkpoint.ts:447` types the current envelope as `SaveFileV31`; `:449-471` `validateCanonicalCurrentSave` imports, then hard-refuses anything but 31 (`:462-464`) and re-checks byte canonicality (`:465`). The prior-protocol path reads the old save through the same canonical chain and *up* to V31, never down.

**MET WITH EVIDENCE — no partially built root can reach a save/validate path.**
The single mint seam is inside the tick tail, between `appendFirstTakes` and `advancePromisesWeek` (`src/core/tick.ts:1117-1122`), and returns one fully built state; no save or validate call exists inside the tick. The cancel seam is synchronous inside `applyCancel` (`src/core/actions.ts:600-603`), composed with `breakPromisesOnCancel` and returning one state. Both mint functions run the loud root guard (`relationships.ts:265`, `:315` → `requireRelationshipsRoot`, `:98-102`).

**MET WITH EVIDENCE — `makeSave` on a root-less state throws clearly.**
`save.ts:8775`: `validateSaveV31: relationships root missing`. Order matters and is right: `makeSave` validates at `:6414` *before* `JSON.parse(JSON.stringify(...))` at `:6417`, so a literal `relationships: undefined` cannot be silently deleted by stringify — `Object.hasOwn` passes, then `validateRelationshipsRoot` fails with `state.relationships is not an array` (`relationships.ts:394-395`). `GameState` also requires the field (`src/core/types.ts:2279`) and `worldgen.ts:787` opens it.

**PARTIAL, pre-existing, currently unreachable — frozen builders have no `relationships` retention guard.**
`makeSaveV1…V18` project *positively* (`save.ts:5548-5610` `projectStateV11`, `:5646-5651`, `:5676-5691`, `:6357-6375`), so a newer root is dropped rather than refused. There is no `assertFrozenBuilderRetains…` for `physicalPlans` (V23), `talentMarket` (V28), `firstTakes`/`promises` (V29) or `relationships` (V31) — only the six asserts at `save.ts:5704, 5803, 5860, 5901, 5998, 6033`. **This is a class inherited from V23, not a P14B.5 regression, and it is closed today:** every frozen builder calls `assertFrozenBuilderRetainsHollywood` (`:6033-6038`), which refuses any state with a living industry, while both edge-mint seams return unchanged when `state.hollywood === null` (`relationships.ts:266`; `actions.ts:600-603`). No state that can hold an edge can reach a frozen builder. The one production consumer, `src/harness/roster-wall/historical-control.ts:11` (`makeSaveV18 as makeSave`), is additionally guarded on both sides: `liftV18Control:13-24` opens `relationships:[]` and `historicalHashState:31-33` refuses to discard a non-empty root. Recommendation only, not a defect.

**MET WITH EVIDENCE — `src/core/index.ts` exports.** `validateSaveV31`/`migrateToV31` (`:1303-1304`), `SaveFileV31` (`:1346`), `GameStateV31` (`:102`), `makeSave`/`LIVE_SAVE_VERSION` (`:1169-1170`), and the whole relationships surface (`:1441-1455`).

**MET WITH EVIDENCE — the frozen fixture generator cannot emit a mislabelled file.** `src/harness/p14/legacy-v28-fixtures.ts:47` still refuses anything that does not re-validate as 28, even though its `emit` signature (`:40`) was widened to accept `SaveFileV31`.

## Per-file ruling: MOVED PREMISE vs PRODUCTION DEFECT

All five: **MOVED PREMISE (test-side)**. None is a defect.

1. **tests/facility-move-demolish.test.ts:798-841** — MOVED PREMISE. The test forges a V11 envelope by `JSON.parse(exportSave(makeSave(razed)))` then hand-deleting every root newer than V11 and restamping `forgedV11.saveVersion = 11`. Its own stated law is at `:804-806` — "strip the V14 roots too, so the REFUND ROW is the first violation this forgery contains. A forgery that trips a newer closed-world rule first proves nothing about the guard under test." `relationships` is one more such root, and the unknown-field refusal at `save.ts` V11's exact-keys law **is the correct law for the input as currently forged** (`666-b5-full-core.txt:24672`: `validateSaveV11: state has unknown field "relationships"`). Nothing here implies a live state should not be forgeable that way — no production code rewrites a save's version literal; this is a test-only forge. Re-expression follows the file's own V29 device at `:828-832`: assert `[]` first, then delete. Caveat for the test-author: if `studioWithOperationalAnnex('m3a-boundary')` ever held an edge, the honest re-expression is a refusal assertion (the `makeSaveV12` pattern at `:794-796`), not a delete — I did not read that fixture.
2. **tests/p14b1-first-take.test.ts:285-286** — MOVED PREMISE. The test hand-builds `{ saveVersion: 29, seed, state: afterFirstWeek, ... }` from a LIVE state and feeds it to `validateSaveV29`. V29's strip removes only `firstTakes`/`promises`, so the live `relationships` root reaches the V12 exact-keys floor (`666:24748`). The premise "a live state can be validated at V29" was always version-bound; it moved at the V31 bump. Live equivalent is `validateSaveV31`/`makeSave`.
3. **tests/p13b-r07-save-v25.test.ts (2 failures, lines 211 and 221)** — MOVED PREMISE. `asV25Envelope` (`:149-171`) reconstructs a V25 envelope from a live state and already deletes `talentMarket` (`:165`) and, after asserting emptiness, `firstTakes`/`promises` (`:167-170`). It lacks the identical three lines for `relationships`. Chain bottoms out at `validateSaveV12: state has unknown field "relationships"` (`666:24718`, `:24733`). Same sweep class as the P14A.1/P14B.1 lines directly above it.
4. **tests/bridge-owner-ux-projection20-migration.test.ts (3 failures)** — MOVED PREMISE, and the expectation is built from a **frozen fixture**, not a live builder: `before.state` comes from `p20-before-hire.checkpoint.json.gz` / `p20-after-hire.checkpoint.json.gz` (`:25-30`), pinned to the independent historical schema literal at `:23`. The destructure at `:120` omits `relationships`, so `oldRoots` carries 31 keys against the frozen 30 at `:135`. The sweep already updated `:119` to `expect(after.saveVersion).toBe(31)` and missed the destructure. The one-key diff at `666:5612` is **positive evidence for the writer**: the governed V30→V31 step added exactly `relationships: []` and moved nothing else. Re-expression: destructure `relationships` out and assert `[]`, matching `:128-129`.
5. **tests/bridge-p13b-r07-setup.test.ts:587** — MOVED PREMISE, plain values-only sweep miss. `expect(parsedSaveVersion).toBe(30) // the CURRENT live version` against `LIVE_SAVE_VERSION = 31`. The test's own comment names the law it rests on, and that law now reads 31.

## Conditions the parent must add to the checkpoint record

1. **Record the eight new failures as a designated test-author sweep class, not a writer defect**, naming the exact fix per file. They are a continuation of 662-T2/T2b's values-only sweep (which touched `bridge-owner-ux-projection20-migration.test.ts:119` and stopped short of `:120`), not a new defect class.
2. **Record the production-path verdict as scoped to today's callers**: the frozen-builder silent-projection gap is closed by `assertFrozenBuilderRetainsHollywood` plus the `hollywood !== null` precondition on both mint seams, not by a `relationships`-specific guard. Any future frozen-builder caller that can pass a living-industry state would reopen it — and would reopen it for `physicalPlans`/`talentMarket`/`firstTakes`/`promises` at the same moment.
3. **Do not treat 663 (118/118 RED), 664 (EXIT 0) or 665 (1 failed / 323 passed) as closure of the full-core delta.** 666 remains 14 files / 32 failed until the five files are re-expressed; the 665 control set carries the same `p14b1-first-take` item.
4. Optional, for the test-author brief: `tests/p13b-r07-save-v25.test.ts:149` `asV25Envelope` now strips four generations of roots by hand. A shared "strip to version N" test helper would stop this recurring at V32 — a proposal, not a defect.

## Counts re-checked, not trusted

`666-b5-full-core.txt:24887-24888` = 14 failed / 335 passed files; 32 failed / 3924 passed / 8 todo. Baseline `636-cancel-full-core.txt:2574-2741` = the same nine files, 24 failures (bridge-p12-campaign-library 11, bridge-p13-campaign-isolation 1, p13a-scientist-foundation 3, r3n1 x3 files 2 each, world-first-scenery 1, p14b4-cast-class-capacity-evaluator5 1, p14b4-ready-replay-stale-target 1), none of them one of the five new files. Delta = exactly 5 files / 8 failures, all one class. `665-b5-natural-chain-controls.txt:921-922` = 1 failed / 323 passed / 4 todo over 24 files. Parent's "four route lines" is correct (the four that route *through* `convertV31ToV30`); `migrateToV30:8749` is a fifth, direct line.

## Sources read

`src/core/save.ts` (V29/V30/V31 blocks 8600-8860, dispatch 5255-5300, builders 5548-6060/6227-6420, migrate refusals 7256-8250), `src/core/relationships.ts` (80-485), `src/core/tick.ts:1100-1123`, `src/core/actions.ts:596-604`, `src/core/index.ts` (export surface), `bridge/session.ts`, `bridge/runtime-checkpoint.ts` (440-471, 820-930), `bridge/runtime/campaign-library.ts`, `ui/src/engine/adapter.ts:3770-3825`, `src/harness/roster-wall/historical-control.ts`, `src/harness/roster-wall/player-policy.ts:648-680`, `src/harness/p14/legacy-v28-fixtures.ts:1-60`, the five failing test files, and evidence `636`, `665`, `666` under `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/`.

## Evidence limits

I ran nothing — no vitest, no typecheck, no probe. Every runtime claim is either source reading or a re-read of the parent's archived logs. I did not read `663`/`664`/`667` bodies (only the parent's summary and, for 667, nothing); I did not inspect the nine baseline failures' causes (out of scope); I did not read the `studioWithOperationalAnnex` or `legacyRehearsingWorld` fixtures, so the "assert `[]` then delete" re-expressions are recommended shape, not verified-empty content. No UI/visual-craft surface is in this task, so no screen-family or usability assessment is claimed. This is an independent technical assessment, not Owner acceptance.

## Next concrete action

Hand the five files to the test-author as one designated sweep item (five edits: four strip/destructure additions following each file's own emptiness-assert-then-delete device, one literal 30→31 at `tests/bridge-p13b-r07-setup.test.ts:587`), then re-run full core and expect the 636 baseline's 9 files / 24 failures.