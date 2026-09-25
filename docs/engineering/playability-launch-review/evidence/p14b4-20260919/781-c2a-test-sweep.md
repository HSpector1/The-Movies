# 781 — P14C.2a test-side V33→V34 sweep (TEST-AUTHOR)

Task: mechanical, per-line V33→V34 sweep of the TEST SIDE for the Save V34 /
career-lifecycle bump (`LIVE_SAVE_VERSION` 33→34, new root `careerLifecycle`,
`migrateToV34`/`migrateToLive`, `convertV33ToV34`/`convertV34ToV33`,
`validateSaveV34`). Scope: existing tests only, under
`/Users/zacheryspector/The-Movies-headless-program`. `tests/p14c2a-*.test.ts`
and `tests/helpers/p14c2a-fixtures.ts` belong to the concurrent RED-suite
author and were not touched.

**Status: DONE.** Every test-side type error is fixed. Every touched file has
been run, one file at a time. 100 of 107 touched files are fully green. 7
files carry residual failures; all 7 are classified below by full test name
against the 772 baseline, and none was fixed by changing a behavioural
expectation — 5 files' failures are inherited/pre-existing (class c), and 2
files carry a total of 7 test cases that are a genuine new behavioural
consequence of the retirement/career-lifecycle system (class b), left failing
per the task rule against masking behaviour changes.

## Scope

- 107 files changed under `tests/` (excludes the concurrent author's
  `p14c2a-*` files), **637 insertions(+), 478 deletions(-)** (`git diff
  --numstat tests/`).
- 104 of the 107 are runnable vitest suites and were each run individually
  via `node_modules/.bin/vitest run <file> --minWorkers=1 --maxWorkers=1`.
- 3 are shared, non-suite helper/contract files with no `describe`/`it` of
  their own (`tests/_historicalCurrent.ts`, `tests/contracts/_v14Contract.ts`,
  `tests/helpers/p14b2-fixtures.ts`); each was exercised indirectly through
  every consumer suite that imports it, all of which were run.

## Typecheck before/after

| Check | Before (writer's V34 landing) | After this sweep |
|---|---|---|
| `npm run typecheck` (tests/) | 158 errors | **0** — except 1 pre-existing error in the concurrent author's own `tests/p14c2a-core-lifecycle.test.ts:27` (`'syntheticRecord' is declared but its value is never read`), which is out of scope for this pass and left alone |
| `npm run typecheck:bridge` | 26 errors | **0** |

Both re-verified clean immediately before this handback (2026-09-25, ~20:35
local).

## Root-strip / new-root sites (careerLifecycle)

The real `migrateToV34`/`convertV33ToV34` opens the new root as
`careerLifecycle: initialCareerLifecycle(market.tick)`. Every test-side place
that hand-builds a "the live GameState" object, or strips known roots off one
to compare against an older/frozen shape, needed the same root added or
stripped. Found **7** such sites (6 in the original sweep, 1 more surfaced by
the third verification batch):

| # | File | What changed |
|---|---|---|
| 1 | `tests/_historicalCurrent.ts` | `liftHistoricalState` gains `careerLifecycle: initialCareerLifecycle(state.market.tick)`; `migrateToCurrentControl` now returns `LiveSaveFile` via `migrateToLive`/`LIVE_SAVE_VERSION` (was `SaveFileV33`/`migrateToV33`/hardcoded `33`) |
| 2 | `tests/contracts/_v14Contract.ts` | `projectToV13State`'s root-strip gains a `careerLifecycle.records` non-empty guard (mirrors the existing `talentProvenance` guard) then `delete raw.careerLifecycle` |
| 3 | `tests/facility-move-demolish.test.ts` | asserts `(forgedV11.state.careerLifecycle as {records:unknown[]}).records` is `[]`, then deletes it, before the frozen-V11 comparison |
| 4 | `tests/p13b-r07-save-v25.test.ts` | asserts `stripped.careerLifecycle.records` is `[]`, then deletes it, before the return |
| 5 | `tests/property-state-v13.test.ts` | `withoutTalentProvenanceAndAge` neutralizes `careerLifecycle: {...state.careerLifecycle, boundaryWeek: 0}` — `boundaryWeek` is stamped to the migration tick once and never touched again, so two independently-produced states being compared for structural equality would otherwise differ on this one field even when neither has any retirement record |
| 6 | `tests/p14b5-relationships.test.ts` | `bytes()`'s destructure-strip gains `careerLifecycle: _cl`; `stripRoot()` gets a "stays" comment (code unchanged — it already discards unknown roots generically) |
| 7 | `tests/bridge-owner-ux-projection20-migration.test.ts` | **(new, found in this pass's 3rd verification batch)** the V18→current migration test destructures `after.state` down to `oldRoots` and compares it whole-object against the frozen predecessor; `careerLifecycle` needed adding to the destructure list plus its own `expect(careerLifecycle).toEqual(initialCareerLifecycle(before.state.market.tick))`, exactly mirroring the existing checks for `technology`/`physicalPlans`/`talentMarket`/`firstTakes`/`promises`/`relationships` at each of their own version bumps. Import of `initialCareerLifecycle` added. Confirmed: was silently broken until this fix (3 tests were newly red after the sweep — see "additional fixes" below), now 10/10 pass. |

Three more hand-built LIVE-state literals (not root-strips, but the same
"stamp what the live writer stamps" rule) also gained the root:
`tests/save.test.ts` (`makeState()`), `tests/c2a-m2-sets-save.test.ts` (two
near-identical `liveMigrated` objects), `tests/cash-ledger-checkpoint-v11.test.ts`
(one hand-built object fed to frozen V1–V10 builders).

## Two source-verified behavioural divergences (worth the parent's attention)

1. **Downgrade-guard split (migrateToVn, n<26 vs n∈[26,33]).** Read directly
   from `src/core/save.ts`: `migrateToV26`…`migrateToV33` have `if
   (save.saveVersion === 34) return migrateToVn(convertV34ToV33(save))` —
   they chain safely through an *empty* `careerLifecycle` root and their own
   `'cannot downgrade SaveFileV33'` message is unchanged and correct for V34
   input, because by the time they raise it they've already converted down to
   V33. But `migrateToV8`…`migrateToV25` have an **unconditional** `if
   (save.saveVersion === 34) throw new Error('...cannot downgrade
   SaveFileV34 or discard the career lifecycle root')` placed *before* their
   old V33 arm — a genuinely-live V34 input reaching one of these hits the
   new V34 message, never the old V33 one. This required splitting, not
   uniformly renaming, two test loops:
   - `tests/p14b5-relationships.test.ts` — the `migrateToV29/28/27/26` loop
     kept `.toThrow(/cannot downgrade SaveFileV33/)`; `migrateToV25` alone
     was split out to expect `/cannot downgrade SaveFileV34 or discard the
     career lifecycle root/`.
   - `tests/p13b-s3-save-v23.test.ts` — same divergence, at the
     migrateToV22/V21/V20 boundary.
2. **`validateSaveV34` delegates to `validateSaveV33` after `stripV34Root`**,
   wrapping any inner failure as `` `validateSaveV34: frozen V33 state is
   invalid — ${innerMessage}` ``. Distinguishable inner messages (e.g.
   "technology milestone…") survive as substrings, so `/technology
   milestone/`-style regex assertions needed no change even where the outer
   validator symbol did (`tests/p13a-technology-milestones.test.ts`).

## Additional fixes found only by running the files (not by typecheck)

Typecheck catches type errors, not stale runtime literals. Three rounds of
single-file runs surfaced residual issues typecheck couldn't see:

- **`tests/p14c1-materialized-aging.test.ts`**: my first attempt modified the
  shared `migrateV33()` helper globally to also lift through
  `convertV33ToV34`, which broke two sections that specifically test frozen
  V33-level behaviour (byte-identical V32↔V33 downgrade; V33-level
  save/reload). Reverted `migrateV33()` to its original V33-only behaviour;
  added a separate `liftForTick()`/`migrateForTick()` helper applied only at
  the ~10 call sites that actually need the live lift. Final: 46/46 (writer's
  own baseline: 18 failed / 28 passed).
- **`tests/bridge-p14b8-waiver-surface.test.ts`**: three cached fixture
  builders (`owesTwoState`, `withEdgesState`, `keptAndBrokenState`) cast a
  `convertV32ToV33(...).state` result directly `as unknown as GameState`
  without the new `convertV33ToV34` step — the cast hid the mismatch from
  typecheck entirely. `validateSaveV34: careerLifecycle root missing` fired
  at runtime, inside `bridge/snapshot-build-context.ts`'s digest computation,
  masking the real site. Fixed all three to
  `convertV33ToV34(convertV32ToV33(...))`. Final: 32/32 (was 16 failed after
  the sweep's own renames landed).
- **`tests/bridge-p14b5-relationships.test.ts`**: one call site,
  `const expected = migrateToV33(importSave(prior[slot]))`, was one line away
  from a `expect(expected.saveVersion).toBe(LIVE_SAVE_VERSION)` two lines
  below it — a genuine "moves" line my first pass missed because the
  `typeof migrateToV33` existence check one line above it (which correctly
  *stays*) made the block read as "this function stays." Fixed to
  `migrateToLive(...)`. Final: 13/15 (2 remaining failures below, both
  correctly classified, neither this bug).

## Per-file table

Reason codes: **rename** = mechanical `migrateToV33`→`migrateToLive` /
`validateSaveV33`→`validateSaveV34` / `SaveFileV33`→`SaveFileV34` (value
moves; the frozen V33 functions themselves are untouched and still exist).
**lit33→34** = a bare `saveVersion`/`LIVE_SAVE_VERSION` literal `.toBe(33)` or
`saveVersion: 33` moved to 34. **ceiling** = the "1 through 33 only" /
"unknown saveVersion 34" dispatch-boundary test, moved to "1 through 34
only" / "unknown saveVersion 35". **guard** = a local hand-rolled
`if (x.saveVersion !== 33) throw ...` guard, moved to `!== LIVE_SAVE_VERSION`.
**title** = a stale "(stale title/number corrected post-C.1)" self-reference
in a test's own title text, corrected to post-C.2a/34/35. **root** = the
careerLifecycle root-strip/new-root class (detailed above). **chain** = a
`convertVnToVn+1(...)` chain extended one step further through
`convertV33ToV34`. **R-VERSION** = an existing versioned-comment-chain
convention extended with a new entry. **divergence** = the downgrade-guard
split. **custom** = a bespoke per-file helper (materialized-aging). Most
files carry 2–4 of these at once; only the dominant ones are listed.

| File | +/- | Reason(s) | Result |
|---|---|---|---|
| tests/_historicalCurrent.ts | 8/4 | root, rename | helper (exercised via consumers, all pass) |
| tests/bridge-owner-ux-projection20-migration.test.ts | 7/2 | root | 10/10 |
| tests/bridge-p06-checkpoint-recovery.test.ts | 9/4 | root, lit33→34 | 12/12 (pass, per earlier run) |
| tests/bridge-p07a-w6-result-continuity.test.ts | 3/3 | rename | pass |
| tests/bridge-p08a-w2-history-projection.test.ts | 2/2 | rename | pass |
| tests/bridge-p09a-w5-bare-lot-first-film.test.ts | 2/2 | rename | pass |
| tests/bridge-p10a-w0-people-projection.test.ts | 2/2 | rename | pass |
| tests/bridge-p11-finance.test.ts | 4/4 | rename | pass |
| tests/bridge-p12-campaign-library.test.ts | 3/3 | lit33→34 | **11 failed (c)** |
| tests/bridge-p13-campaign-isolation.test.ts | 2/2 | rename | **1 failed (c)** |
| tests/bridge-p13b-r07-setup.test.ts | 1/1 | lit33→34 | pass |
| tests/bridge-p13b-s3-save-as.test.ts | 2/2 | rename | pass |
| tests/bridge-p13b-s8-rivals.test.ts | 2/2 | lit33→34 | pass |
| tests/bridge-p14a1-market.test.ts | 1/1 | lit33→34 | pass |
| tests/bridge-p14a2-market.test.ts | 7/7 | lit33→34, title | pass |
| tests/bridge-p14a3-world.test.ts | 5/5 | lit33→34, title | pass |
| tests/bridge-p14b1-promises.test.ts | 4/4 | lit33→34, title | pass |
| tests/bridge-p14b2-checkpoint.test.ts | 9/5 | rename, root-like state literal, R-VERSION | pass |
| tests/bridge-p14b2-trust.test.ts | 6/6 | rename | **3 failed (c)** |
| tests/bridge-p14b3-promise-command.test.ts | 8/8 | rename, lit33→34 | pass |
| tests/bridge-p14b4-cast-class.test.ts | 11/9 | chain, root | pass |
| tests/bridge-p14b4-runtime47-compatibility.test.ts | 8/8 | rename, lit33→34, title | pass |
| tests/bridge-p14b5-relationships.test.ts | 8/5 | rename (+1 missed-lift fix), R-VERSION, title | **2 failed (1b, 1c)** |
| tests/bridge-p14b6-d2-withheld-employment-claim.test.ts | 2/2 | rename | pass |
| tests/bridge-p14b6-e714-false-empty-absence-lines.test.ts | 2/2 | rename | pass |
| tests/bridge-p14b6-relationship-read-models.test.ts | 6/6 | rename, title | pass |
| tests/bridge-p14b7-promise-waiver.test.ts | 5/2 | chain | pass |
| tests/bridge-p14b8-waiver-surface.test.ts | 11/8 | chain (missed-lift fix), lit33→34, title | pass |
| tests/bridge-process-restart.test.ts | 2/2 | lit33→34 | pass |
| tests/bridge-runtime-checkpoint.test.ts | 10/10 | lit33→34 (bulk, 9 occ.), title | 65/65 |
| tests/c2a-m2-sets-save.test.ts | 13/6 | root, rename | pass |
| tests/c2a-m3-rename-and-pooling.test.ts | 2/2 | lit33→34 | pass |
| tests/c2a-m3-screenplay-mint.test.ts | 1/1 | lit33→34 | pass |
| tests/cash-ledger-checkpoint-v11.test.ts | 12/8 | root, rename | pass |
| tests/construction-core.test.ts | 5/5 | rename | pass |
| tests/construction-save-v11.test.ts | 6/6 | rename, ceiling | pass |
| tests/contracts/_v14Contract.ts | 9/0 | root | helper (consumers pass) |
| tests/contracts/cross-owner-refusal.contract.test.ts | 9/9 | rename | pass |
| tests/contracts/determinism-floor.contract.test.ts | 4/4 | rename | pass |
| tests/contracts/phase-table-agreement.contract.test.ts | 8/8 | rename | pass |
| tests/contracts/studio-events.contract.test.ts | 1/1 | rename | pass |
| tests/contracts/v14-boundary-guards.contract.test.ts | 1/1 | ceiling | pass |
| tests/contracts/v14-byte-parity.contract.test.ts | 2/2 | rename, lit33→34 | pass |
| tests/d11-cycle2.test.ts | 1/1 | guard | pass |
| tests/d11-employment.test.ts | 5/4 | guard, rename | 36/36 |
| tests/d12-economy.test.ts | 1/1 | guard | pass |
| tests/d14-star-power.test.ts | 4/3 | guard, rename | pass |
| tests/d17-engagement-persistence.test.ts | 1/1 | lit33→34 | pass |
| tests/d17a-adv-migration.test.ts | 2/2 | ceiling | pass |
| tests/d17a-adv-reconciliation.test.ts | 1/1 | lit33→34 | pass |
| tests/d17b-publicity.test.ts | 5/4 | guard | pass |
| tests/d17b-save-v7.test.ts | 2/2 | ceiling | pass |
| tests/facility-move-demolish.test.ts | 9/3 | root, rename | pass |
| tests/film-chronicle.test.ts | 3/3 | lit33→34, silent-skip-guard fix | pass |
| tests/helpers/p14b2-fixtures.ts | 4/4 | rename | helper (consumers pass except the one documented pre-existing failure) |
| tests/legacy-parcel-ground.test.ts | 7/7 | rename | pass |
| tests/p04a2-writer-credit-law.test.ts | 1/1 | lit33→34 | pass |
| tests/p06a-w1-release-authority.test.ts | 11/10 | rename, guard, divergence-adjacent | pass |
| tests/p08a-w0-studio-history.test.ts | 6/6 | rename | pass |
| tests/p09a-w0-founding-regime.test.ts | 7/7 | rename | pass |
| tests/p12-lifecycle.test.ts | 2/2 | rename | pass |
| tests/p12-starting-world.test.ts | 2/2 | rename | pass |
| tests/p13a-causal-core.test.ts | 6/6 | rename | pass |
| tests/p13a-research-employment.test.ts | 3/3 | rename | pass |
| tests/p13a-research-identity.test.ts | 3/3 | rename | pass |
| tests/p13a-rival-adoption.test.ts | 4/4 | rename | pass |
| tests/p13a-save-v20.test.ts | 4/4 | rename | pass |
| tests/p13a-technology-membership.test.ts | 3/3 | rename | pass |
| tests/p13a-technology-milestones.test.ts | 5/5 | rename | pass |
| tests/p13b-r07-save-v25.test.ts | 9/3 | root, ceiling | pass |
| tests/p13b-s1-save-v21.test.ts | 11/11 | rename, R-VERSION comment | pass |
| tests/p13b-s1-scheduler.test.ts | 2/2 | rename | pass |
| tests/p13b-s2-access-identity.test.ts | 5/5 | rename, title | pass |
| tests/p13b-s2-save-v22.test.ts | 10/9 | rename, ceiling, R-VERSION | 12/12 |
| tests/p13b-s2-validation.test.ts | 2/2 | rename | pass |
| tests/p13b-s3-save-v23.test.ts | 11/8 | ceiling, divergence | pass |
| tests/p13b-s3-validation.test.ts | 2/2 | rename | pass |
| tests/p13b-s5-save-v24.test.ts | 5/5 | ceiling | pass |
| tests/p13b-s6-save-v26.test.ts | 5/5 | rename (dynamic-cast), ceiling | pass |
| tests/p13b-s7-announcements.test.ts | 4/4 | rename, title | 6/6 |
| tests/p13b-s8-save-v27.test.ts | 4/4 | ceiling | pass |
| tests/p14a1-save-v28.test.ts | 3/3 | ceiling | pass |
| tests/p14b1-first-take.test.ts | 4/2 | lit33→34, R-VERSION | pass |
| tests/p14b1-promises.test.ts | 3/3 | rename (kept identifier names) | pass |
| tests/p14b1-save-v29.test.ts | 5/5 | ceiling, lit33→34 | pass |
| tests/p14b1-t4-regressions.test.ts | 7/7 | rename, lit33→34 | pass |
| tests/p14b2-setup-wrap-regressions.test.ts | 2/2 | rename | pass |
| tests/p14b3-reservations.test.ts | 5/5 | rename | pass |
| tests/p14b3-rule-revision.test.ts | 17/10 | R-VERSION, root (2 sites), rename | 6/6 |
| tests/p14b4-cancel-causal-proof.test.ts | 3/3 | rename, lit33→34 | pass |
| tests/p14b4-cast-class-outcomes.test.ts | 4/4 | rename | **9 failed (c)** |
| tests/p14b4-material-evidence-core.test.ts | 10/5 | chain, rename (kept type name) | pass |
| tests/p14b4-rival-seating-preference.test.ts | 1/1 | lit33→34 | **3 failed (c)** |
| tests/p14b4-save-v30-compatibility.test.ts | 13/7 | root, rename, title | 36/36 |
| tests/p14b4-started-replay-scenery-commands.test.ts | 2/2 | rename | pass |
| tests/p14b5-relationships.test.ts | 28/10 | root, rename, divergence, guard | **6 failed (b)** |
| tests/p14b5-save-v31.test.ts | 6/4 | chain, title, lit33→34 | pass |
| tests/p14b5-t-failure-tuning.test.ts | 4/4 | rename | pass |
| tests/p14b7-promise-waiver.test.ts | 1/1 | lit33→34 | pass |
| tests/p14b8-waiver-surface-oracle.test.ts | 2/2 | lit33→34 (message-arg form), title | pass |
| tests/p14bf2-acting-discipline.test.ts | 18/11 | R-VERSION, root, rename | pass |
| tests/p14c1-materialized-aging.test.ts | 55/22 | custom (liftForTick/migrateForTick) | 46/46 |
| tests/placement-save-v12.test.ts | 7/7 | rename | pass |
| tests/property-state-v13.test.ts | 16/10 | root, ceiling, rename | pass |
| tests/ruling-a-development-in-play.test.ts | 1/1 | guard | pass |
| tests/save.test.ts | 18/14 | root, rename, title | 10/10 |
| tests/script-projects-save-v9.test.ts | 5/5 | ceiling | pass |

100/107 rows say "pass" or an explicit N/N — all individually run and green.
7 rows are bold with a remaining-failure count; each is fully classified
below.

## Remaining failures — full names, cause class, baseline cross-reference

Baseline file: `docs/engineering/playability-launch-review/evidence/p14b4-20260919/772-c1-final-verification.txt`
(the pre-C.2a heavy-suite run). Classification method: exact full test name
lookup against 772. **(c)** = present as `×` in 772 (inherited, not caused by
this sweep). **(b)** = present as `✓` in 772 (genuinely new regression from
the V34/career-lifecycle bump, confirmed absent from the pre-existing failure
set). No behavioural expectation was changed to make any of these pass or to
hide them.

### Class (c) — inherited / pre-existing, confirmed present in 772

**`tests/p14b4-cast-class-outcomes.test.ts` (9 tests)** — traced to
`rivalWorlds()`/`atFive()`'s 350-tick natural search no longer converging (an
"UNEXECUTED natural rival prerequisites absent by350" assertion, not a
version literal). All 9 full names confirmed `×` in 772:
- `P14B4 genuine submit/settle/take routes, no synthetic commitments > RIVAL: a genuinely naturally authored tagged commitment binds and qualifies through the real scheduled owner transition`
- `P14B4 labeled outcome-owner probes on real bound roots and actual casts > 'rival' 'lead' with actual 'lead' seat: qualification=true`
- `... > 'rival' 'lead' with actual 'antagonist' seat: qualification=false`
- `... > 'rival' 'lead' with actual 'support' seat: qualification=false`
- `... > 'rival' 'leadOrAntagonist' with actual 'lead' seat: qualification=true`
- `... > 'rival' 'leadOrAntagonist' with actual 'antagonist' seat: qualification=true`
- `... > 'rival' 'leadOrAntagonist' with actual 'support' seat: qualification=false`
- `... > rival support qualifies for P1 and shape-legacy count-only P2, not tagged P2`
- `... > rival half-open window counts start, excludes before-start and excludes due`

**`tests/bridge-p14b2-trust.test.ts` (3 tests)** — traced to
`tests/helpers/p14b2-fixtures.ts:198`, `poachingFixture()`. That helper
carries its own in-file comment, from the prior P14C.1 pass, explicitly
documenting this as "DELIBERATELY LEFT FAILING... approved_behavioral_change"
(record 771/770) — pre-existing, not touched or newly broken by this sweep.
All 3 confirmed `×` in 772:
- `P14B.2 group5 — independent promise attention after cases close > raises due at minus8 but not minus9 for an actual player poaching winner with no proposals`
- `... > raises the poaching winner's actual outcome only in its recorded week, once per cause/person`
- `... > does not require any case entry to retain a real promise reminder (explicit read-only case-carrier probe)`

**`tests/bridge-p12-campaign-library.test.ts` (11 tests)** — all fail on
`Test timed out in 5000ms`/`20000ms`, unrelated to any version literal. 772
shows the identical file at "13 tests | 11 failed", and every one of the 11
current failing full names matches a `×` line in 772 exactly (e.g. `R05
independent named campaign transactions > keeps the shipped Save route and
save-before-load consistent with the named record`, `...> durably save dirty
progress while preserving two inactive worlds and failed-write authority`,
etc. — all 11 verified by direct line match, not sampled).

**`tests/bridge-p13-campaign-isolation.test.ts` (1 test)** —
`P13A research authority across named campaign operations > Save As branches
real research, inactive and renamed campaigns stay frozen, and a new
campaign receives none of their authority`, a 60s timeout. Confirmed `×` in
772 at the identical full name.

**`tests/p14b4-rival-seating-preference.test.ts` (3 tests)** — same
350-tick natural-search-non-convergence class as p14b4-cast-class-outcomes
("UNEXECUTED natural premise: no rival film decision on 'seed-b' within 350
ticks..."). All 3 confirmed `×` in 772 at matching full names (772 shows this
file at "22 tests | 13 failed | 1 skipped"; these 3 are among that 13):
- `P14B4 final seating preference — the natural witness (seed-b w211 studio-bc14baf6-r01, record 618 O-T4-1) > search table: the first seed-b decision whose seating matters holds two tagged leadOrAntagonist beneficiaries and one P1 beneficiary in a three-actor pool`
- `... > RED: the real seating serves the maximal DISTINCT-beneficiary count (plan :215-218), the picture is viable and affordable (:223-225), and the real first take then satisfies all three through advancePromisesWeek/qualifyingTakes`
- `... > CONFLICT: the ordinary economic score prefers a two-beneficiary permutation; benefit count wins over score (:216-217) and the real take proves it`

**`tests/bridge-p14b5-relationships.test.ts` — 1 of its 2 remaining
failures** — `family 12 — the R-D5 natural-chain LEDGER (...) > the MOST
EXPOSED shared fixture, poachingFixture (p14b2-fixtures.ts :145-211;
consumers bridge-p14b2-trust, p14b2-fixture-preconditions): the week-208
reasons pin and endedWeek 208 hold, and under D1 no survivor holds a
shared-take counterpart` — same documented pre-existing `poachingFixture()`
issue as `bridge-p14b2-trust.test.ts` above, consumed here too. Class (c).

### Class (b) — genuine new behaviour change from the V34/career-lifecycle bump

**`tests/p14b5-relationships.test.ts` — "family 6" (6 tests)**, all under
`family 6 — D5 IN THE CHOOSER under the D1 roster predicate (scope (5);
companion :116, :120)`:
- `the base (no edge) declines by the tie order: every landed band ties between the two survivors (measured premise)`
- `a CloseFriends counterpart on the player's OFF-CYCLE row (startWeek < W, active at W) settles the case for the player with the D5 sentence as the ONLY reason`
- `the same case at a W where that edge has DRIFTED below Close Friends declines by the tie order`
- `a row CLOSED AT W (the actor signed at 0 for 208 weeks) never counts — the predicate's strict upper end`
- `a row COMMITTED AT W (startWeek === W) never counts — the predicate's strict lower end; the same row one week earlier does`
- ``enemies here` is never read: without a Close Friends counterpart no D5 sentence appears, whatever the value on the record``

All 6 confirmed **`✓`** (passing) in 772 — this is not an inherited failure.
Traced cause: `hiringMarketIds(state, week)` no longer lists an actor at week
207 who is still listed at week 208 (or vice versa across the tested window)
— the writer's disclosed retirement/hiring-market filtering (their own "trap
2": `hiringMarketIds`/`freelancerMarketIds` now drop
finishing/retired/announced people) changes which actor occupies the tested
seat at one of the two probed weeks. Not a version-literal issue; not fixed
here per the task rule against changing behavioural expectations.

**`tests/bridge-p14b5-relationships.test.ts` — 1 of its 2 remaining
failures** — `family 12 — the R-D5 natural-chain LEDGER (...) > seed-b: chain
digests, row counts, churn rosters empty under D1, zero exposed rows through
416; the nine frozen drop templates only` — `expected [...] to have a length
of 48 but got 47`. Confirmed **`✓`** in 772 (was passing pre-C.2a). Same
family as the "family 6" regression above — a natural chain on seed-b that
used to settle 48 rows now settles 47, consistent with the same
retirement-driven hiring-market filtering changing membership in a natural
(not synthetic) run. Recorded, not fixed.

## Summary for the parent

- Typecheck: 158+26 → 0+0 (tests/), 1 unrelated error left untouched in the
  concurrent author's own file.
- 107 files touched, 637/478 line delta, 104 run individually + 3 helpers
  exercised via consumers — all 107 accounted for.
- 100 files fully green. 7 files carry a combined 35 failing test cases, all
  classified by full-name match against the 772 baseline: 28 cases across 5
  files are inherited/pre-existing (class c: two 350-tick natural-search
  non-convergence files, one shared documented `poachingFixture()` issue
  surfacing in two consumer files, one timeout-heavy campaign-library file).
  7 cases across 2 files (both in relationship-history territory) are a
  genuine new behavioural consequence of the retirement/career-lifecycle
  system's hiring-market filtering (class b) — flagged, not fixed.
- Two source-verified, non-obvious behavioural facts about the V34 bump are
  documented above for anyone touching `migrateToVn`/`validateSaveVn` next:
  the downgrade-guard split at the V25/V26 boundary, and `validateSaveV34`'s
  message-wrapping delegation to `validateSaveV33`.
- Nothing was skipped, deleted, or `.todo`'d. No behavioural expectation
  (outcome/count/winner/golden/timeout/threshold) was changed anywhere in
  this sweep to force a pass.
