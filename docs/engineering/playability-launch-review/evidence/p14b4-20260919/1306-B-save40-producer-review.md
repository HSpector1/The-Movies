# 1306-B — independent review of the Save40 outgoing-fixture producer

Independent contract-auditor review (read-only tools: Read, Glob, Grep) of the reviewed draft
[1306-save40-outgoing-producer.ts](1306-save40-outgoing-producer.ts) (4,188 B / `a1468490…`), persisted verbatim by the
parent. The parent's revision implementing the required changes is `1306-save40-outgoing-producer-r2.ts`.

KEEP WITH REQUIRED CHANGES (REFINE)

Verdict: REFINE — access, admission and anti-overwrite mechanics are sound and correctly reuse the retired-1117-pattern lessons (1296-B), but one of the two inputs does not verifiably deliver the "research kinds" coverage the task requires, and the producer's own claimed route for that input contradicts the only measured natural-route documentation for its seed.

Required changes

1. **`E/1306-save40-outgoing-producer.ts:18,53`** — the `genuine-v40-r3-research-week265` input's route comment says `no player action`, but the only measured natural-route facts for seed `p13b-s8-bridge-probe-01` (`tests/bridge-p13b-s8-rivals.test.ts:26-44`, "probed 2026-09-18 via `npx vite-node`... never invented") were produced by `p13aGeneratedStudio` **`commitPlacement`'d with one player Research Laboratory at week 0**, then advanced to week 265. The producer's `facts` object (lines 41-46) records only week/rivals/financePeriods/activeRivalEmployment/rivalTerminationReceipts — no research-kind fact (`RIVAL_RESEARCH_RECEIPT_KINDS` counts, `state.technology.projects.length`) is asserted or even recorded. A run that produced zero rival research activity would still pass silently, defeating the stated purpose (task check 4: "research kinds"). Source read of `interests()` (`src/core/rivalResearch.ts:97-105`) suggests the omission is *likely* harmless — the "one inventor" gate blocks a rival only when some other studio already holds an active competing project, and without a player lab there is no player project to compete — but this is reasoning, not proof, and I have no Bash/vite-node to confirm. Fix: either reproduce the exact measured route (add the `commitPlacement` call) or add self-verifying facts/assertions that research-kind receipts and technology projects actually exist in the produced state, and name the route accurately either way.

2. **Missing player-termination coverage.** Both inputs use "no player action," so neither exercises the pre-existing player `MoneyKind` `'termination'` (`src/core/types.ts:369`, "early-release termination cost debited at release"), which is the *same string* as the new `RivalMoneyKind` `'termination'` proposed in 1305-A (`hollywood.ts:24-26`). This is the same class of same-name collision `tests/bridge-p13b-s8-rivals.test.ts:60-75` had to name and test explicitly for `researchSpend`. Recommend adding a labeled third input (or extending one existing input) with one genuine public player release, or an explicit call that this collision is out of scope for Save41 persistence specifically (the two maps are structurally distinct, so risk may be confined to Bridge/finance-report code) rather than leaving it silently unaddressed.

3. **Recommended, non-blocking:** `P14_SAVE40_PRODUCER_HEAD` (lines 26-27) is validated only by regex shape, never cross-checked against the real `git rev-parse HEAD`, unlike 1117's self-verifying `assert.equal(before.head, run.expectedHead)` (`1117-p3-outgoing-preservation.ts:231`). The outer recorder independently pins the real HEAD in its own `.json`, but nothing cross-checks that against what gets permanently baked into the fixture's own `provenance.json`/`MANIFEST.json`. A single `execFileSync('git',['rev-parse','HEAD'])` call touches no fixture/Owner data, so it does not reintroduce the exhaustive-hashing pattern 1296-B retired.

Findings by check item

1. **Access — MET WITH EVIDENCE.** Imports only `bridge/protocol.ts`, `src/harness/p13a/fixtures.ts`, `src/core/save.ts`; no fixture payload, no Owner data, no broad hashing. Writes only to the new `tests/fixtures/p14/genuine-v40-pre-r3/` (confirmed `tests/fixtures/p14/` already exists), with `mkdirSync(recursive:false)`, an `existsSync` pre-check, and `{flag:'wx'}` on every file write.
2. **Genuineness — MET WITH EVIDENCE.** Both states come only from `p13aGeneratedStudio`/`advanceTo` (public harness, `src/harness/p13a/fixtures.ts:9-17`), no state surgery. `makeSave` already validates+detaches (`save.ts:6542-6547`); the producer's extra `validateSaveV40` and the `exportSave(importSave(raw))===raw` check together reproduce 1117's JSON-round-trip validation pattern correctly.
3. **Determinism/single-shot — MET WITH EVIDENCE, RNG determinism NOT VERIFIED (no execution available).** `elapsedMs` confirmed provenance-only, not in `raw`/`gz`. `LIVE_SAVE_VERSION===40` and directory-exists guards both present and correctly ordered before any write.
4. **Fitness — PARTIAL.** See required changes 1-2 above; week-110 baseline coverage is reasonable and low-risk.
5. **Execution plan — MET WITH EVIDENCE.** Output path is under an automatically-excluded prefix (`tests/fixtures/`) in both `run-bounded-source-c2.mjs:22` and `run-bounded-source-guards.py:14`, so it cannot break `fixedSource`/`allGuardsExact`, and contains no `*.test.ts` so vitest collection is unaffected.
6. **TypeScript/vite-node — MET WITH EVIDENCE.** All imports used, `.ts` extensions match 1117 precedent, no top-level await needed (fully synchronous), no unused locals.

Could not verify: RNG/environment determinism of `generateWorld`/`tick` by execution; whether rival research activity actually occurs at week 265 without the player's lab placement; whether the parent's future manual-allowlist gate will correctly pin the new files.

## Follow-up review of r2 (same reviewer, verbatim)

Revision reviewed: `1306-save40-outgoing-producer-r2.ts` (6,947 B / `b64bc202976fbb59c1a062580712741b7e319d764e722d3bfa439248e3c88e46`).

KEEP. No required change.

Verification of the four points:

1. Week 265: `commitPlacement(p13aGeneratedStudio('p13b-s8-bridge-probe-01'), {blueprintId:'research-laboratory', origin:{gx:0,gy:9}})` (r2 lines 35-36) is byte-identical in blueprintId/origin to `p13aLaboratorySlice`'s own call in `src/harness/p13a/fixtures.ts:19`, matching the measured S8 route (`tests/bridge-p13b-s8-rivals.test.ts:26-44`). `RIVAL_RESEARCH_RECEIPT_KINDS` (`hollywoodTypes.ts:121-122`) is confirmed as the exact five kinds; r2 line 73 counts each and line 77 asserts every count > 0 plus `rivalTechnologyProjects > 0` (filtered by `ResearchProject.studioId !== playerStudioId`, `technologyTypes.ts:40-42`). Confirmed correct.

2. Week 110: `hiringMarketIds(state, 0)` then `.find(role==='actor')` (r2 lines 26-27) matches `tests/p14a1-firing.test.ts:101-103`'s idiom exactly. `signContract` at week 0 for 208 weeks, `releaseTalent` at week 60 (r2 lines 28-29). Traced `applyReleaseTalent` (`src/core/actions.ts:2661-2699`): writes a `LedgerEntry{kind:'termination'}` synchronously; the receipt is written later by `recordPlayerEmployment` (`industryEmployment.ts:10-35`) during a subsequent weekly tick, using `reason: week===endWeekExclusive?'expiry':'termination'` — since release week 60 ≠ endWeekExclusive 208, this yields exactly one `reason:'termination', studioId:playerStudioId` receipt. `advanceTo(state,110)` runs enough ticks for this reconciliation to land. Both counts should be exactly 1 as asserted (r2 line 76). `rivalTerminationReceipts===0` still asserted (line 78, unaffected by this route).

3. `execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim()===head` (r2 line 52) now cross-checks the real HEAD before any write. Resolves the earlier gap.

4. Diff is scoped to: five new imports (all used: `execFileSync`, `applyActions`, `hiringMarketIds`, `commitPlacement`, `RIVAL_RESEARCH_RECEIPT_KINDS`, plus a type-only `GameState`), the two `build()` route functions, four new `facts` fields, two route-specific assertions, and `input.route` replacing the old inline template string. Everything else (version/overwrite guards, exclusive-create writes, export/import/gzip round trips, MANIFEST, console output) is unchanged. `commitPlacement`/`hiringMarketIds` signatures confirmed at `placement.ts:764` / `employment.ts:400`.

Refusal/collision check: `applyReleaseTalent` has exactly two refusal paths — no active contract, or an active script-writer assignment (`actions.ts:2672-2675`). Neither applies to an Actor. No case check exists in this path (unlike `renewContract`'s `caseOpenForTalent`), so an open case cannot block it; a promise, if any, is broken as a lawful side effect (`breakPromisesOnTermination`), not a refusal. A renewal case would not plausibly be open this early (week 60 of a 208-week contract) regardless. Confirmed: not refusable, no collision risk.

## Second follow-up review of r3 (same reviewer, verbatim)

Revision reviewed: `1306-save40-outgoing-producer-r3.ts` (7,092 B / `91d829715a00d1343ff42ae64f7d9a1302c532efb5c65be842a207545c8b078e`), after the r2 premise failure recorded in [1306-C](1306-C-producer-premise-failure.md).

KEEP. No required change.

(1) Diff scope confirmed by full line-by-line comparison of r2 and r3: only the researchRoute comment (2 lines to 3 lines, explaining the 265 to 280 move and citing 1306-C), the `advanceTo(...)` argument (265 to 280), the INPUTS entry name/route string (`week265` to `week280`, and the embedded `advanceTo(265)` to `advanceTo(280)` in the route text), the `endsWith('week265')` to `endsWith('week280')` condition, and the `producer` path string (`r2.ts` to `r3.ts`) changed. Every other line (imports, id/json/out helpers, LIVE_SAVE_VERSION/head/git-rev-parse/existsSync/mkdirSync guards, the full facts object, all other assertions, MANIFEST/console.log) is byte-identical modulo the one-line shift from the added comment. I did not run `git diff` myself (no Bash), so I cannot independently confirm the literal hunk count of 5, but the content-level scope matches the claim exactly with nothing extra.

(2) Confirmed correct. `tests/bridge-p13b-s8-rivals.test.ts:199`'s own `WEEK277` comment lists `instrumentOperational`/`researchSeatAssigned`(265), `laboratoryCommitted`(266), `researchCompleted`(276) as already present by week 277, and `laboratoryOperational` for r01's first lab landed at week 12 (file header, line ~29-30), so all five kinds are present by 277; week 280 is a safe two-week margin past that and past the second lab's `laboratoryOperational`(278). `technology.ts:324` updates a project's status in place via `projects.map(p => p===project ? change(p) : p)` — completed projects are never removed from `state.technology.projects`, only mutated, confirmed by `ResearchStatus` including `'completed'` (`technologyTypes.ts:3`). So `rivalTechnologyProjects > 0` holds.

(3) Per 1306-C's own report, the week-110 route's premises (exactly one player termination ledger row and receipt) were empirically verified true on the actual failed run, not merely reasoned. No other latent premise-class error found.
