# 1359-C handback: P15C Wave 2 RED (Legacy integration)

**Status: staged, not run.** I ran no vitest, tsc, node or tsx. I checked types and premises by reading, and read the two JSON fixtures with python3. Scratch tree T = `studio-scratch/1359-red/tree`: base ad4aaa8 (1063ab4f), RED commit a06c0ae on `main`, reference ff889f8 on `ref-1359`.

**Files.** `tests/p15c2-campaign-legacy-integration.test.ts` (new, 42 leaves) and `tests/p15c-wave-r-retention.test.ts` (one guard added). 43 leaves: 40 RED, 3 controls (`legacy-control-late-founding-route-lawful`, `legacy-control-genuine-save38-6240-lawful`, `wave-r-retention-player-concepts`). Five are fixture-pending (C2, C3, C3b, C4, B7). Six turn sibling-gated after GREEN and fail with "SIBLING PENDING" (B2, B4b, B7, C3b, C8b, C10c). Every RED leaf resolves the Wave 2 name first, so it fails by name today.

**Coverage.** §8 A1-A9, B1-B9 and C1-C12 each have a leaf; A2, B4, C2, C3, C4, C8 and C10 have split leaves. D1-D3 moved to Wave 1 (Amendment 3). Amendment 1 adds `legacy-validate-replay` and `legacy-old-law-fixture-v1-validates-after-retune`. Amendment 2 is the Wave R guard. The classification JSON cites every clause by line.

**Fixtures.** G6240 is the genuine Save38 at week 6240 (1052 endurance A), pinned by bytes and sha256. G6240F forges one field (`recordedFromWeek` 0), runs the step, then the full validator. Week 130 is the p14d1 genuine Save42. Route L is a natural late founding: a headless OracleAgent year, idle ticks to 6188, `beginFounding`, ticks to 6241, extended to 6760. The Wave R campaign stops at 450, so route L serves the 6240 leaves; its 180 s and 900 s budgets are unmeasured, and the control logs timings.

**Old-law fixture.** The leaf retunes all fifteen TUNING `LEGACY_*` values at runtime and restores them in `finally`. The live law then builds a different manifest from the same facts, and G6240F still validates because the replay runs `LEGACY_DEFINITIONS['campaign-legacy/v1'].thresholds`. C11 pins those thresholds to TUNING while v1 is current, so a retune without a definition bump fails there.

**Save version.** STEP is `LIVE_SAVE_VERSION`; the leaves resolve `convertV${STEP-1}ToV${STEP}`, `convertV${STEP}ToV${STEP-1}` and `migrateToV${STEP-1}` by name. 43 appears once, as the base's live version (C1 asserts STEP > 43). The reference uses 44 only because it is the next number in scratch; §10 item 4 gives Save44 to slice B.

**Reference run** (in T, one heavy process at a time):
1. RED: `git checkout main && npx vitest run --project core tests/p15c2-campaign-legacy-integration.test.ts tests/p15c-wave-r-retention.test.ts`
2. GREEN: `git checkout ref-1359` (or apply `reference/1359-reference.patch` on main), rerun step 1 plus `tests/p15c1-campaign-legacy.test.ts`, then `npx tsc --noEmit`.
3. Expect at GREEN: everything passes except the five fixture-pending and six sibling-gated leaves. The broad suite will need the usual live-version sweep.

**Names shared with 1356-C.** `src/core/p15Phases.ts` (copied byte-identical: `P15_PHASE_TABLES`, `P15_PHASE_ORDER_VERSION`, `p15PhaseTriple`, `p15PhaseMatches`, `initialP15Sequence`); the root `p15Sequence {version: 1, next}`; phase `p15c.finale`; the capture directory `tests/fixtures/p15/genuine-below-p15-save-step/` and its MANIFEST shape; STEP lookup by name; `/power ranking|p15/i` for a cross-root duplicate. The forged sibling rows follow 1356-A (`powerRanking.snapshots`), 1357-A (`corporateCondition.events`, `loans`) and 1355-A (`sharedMarket.assessments`). Those last two names are not fixed yet. My unfixed names: the table fields (`boundaryWeek`, `postFinaleMode`, `archetypeIds`, `lensIds`, `lensCountKeys`, `bounds`, `domainIds`, `thresholds`, `evaluate`) and the validator message form `campaignLegacy.<dotted path> <rule>`, which C6-C9 pin.

**Undecided.**
- F1: §3.1 gives an authored film `settledWeek` null, and the landed law (campaignLegacy.ts:351) refuses a settled film without a whole week. The reference accepts null for authored films only; Wave 1 fixtures use week 10 and still pass. The parent picks that or a week in §3.1.
- A7 pins the adapter reading a sibling root recorded from B or later as absent, so the manifest agrees with §5.1 item 6.
- C5 needs the Legacy refusal to fire before any sibling or allocator refusal in a shared step.
- A9 and B5 tick a state the save validator refuses (released films cross-check `conceptId`), so "forged states validate first" cannot hold there. The tick's silent profession proof may also reject that state; I have not verified it.
- The concept guard is byte-equal; `renameScreenplay` (actions.ts:2277) can retitle a concept.
- Captures to mint at the last Save43 writer: route L at weeks 6239 and 6240.
- G-P, G-L and the week-8,791 timing stay with the parent.
