# 797 — P14C.4 test-side V34→V35 sweep (TEST-AUTHOR)

Task: mechanical, per-line V34→V35 sweep of the TEST SIDE for the Save V35 /
career-lifecycle-cohorts bump (`LIVE_SAVE_VERSION` 34→35, `careerLifecycle.cohorts`,
`migrateToV35`/`convertV34ToV35`/`convertV35ToV34`, `validateSaveV35`), the same class
of work 781 did for V33→V34. Scope: existing tests only, under
`/Users/zacheryspector/The-Movies-headless-program`. `tests/p14c4-*` and
`tests/helpers/p14c4-*` belong to the concurrent RED-suite author and were not edited.

**Status: DONE.** Every test-side type error is fixed (both `npm run typecheck` and
`npm run typecheck:bridge` are 0 errors in `tests/`). Every touched file has been run,
one file at a time. 80 of 87 touched files are fully green. 6 files carry residual
failures classified below by full test name against the `787-c2a-full-core.txt`
baseline: 34 test cases across 6 files are inherited/pre-existing (class c, already
failing at 787, before any C.4 source change existed), and 1 test case in 1 file is a
genuine new behavioural consequence of the cohort/youth-floor system (class b), left
failing per the task rule against masking behaviour changes. Two additional issues
surfaced only in the final all-touched-files verification pass and were fixed before
this handback (see "Additional fixes" below); nothing was left broken.

## Scope

- 87 files changed under `tests/` (excludes the concurrent author's `p14c4-*` files
  and `tests/helpers/p14c4-fixtures.ts`), **483 insertions(+), 376 deletions(-)**
  (`git diff --numstat tests/` minus those paths).
- 84 of the 87 are runnable vitest suites and were each run individually via
  `node_modules/.bin/vitest run <file> --minWorkers=1 --maxWorkers=1`.
- 3 are shared, non-suite helper files with no `describe`/`it` of their own
  (`tests/contracts/_v14Contract.ts`, `tests/helpers/p14b2-fixtures.ts`,
  `tests/helpers/p14c2a-fixtures.ts`); each was exercised indirectly through every
  consumer suite that imports it, all of which were run. `tests/_historicalCurrent.ts`
  needed no change this bump — it already reads `migrateToLive`/`LIVE_SAVE_VERSION`
  generically from the prior (V33→V34) sweep, so it carries the bump for free.
- One additional non-modified file, `tests/p14b2-fixture-preconditions.test.ts`, was
  run as a precautionary consumer check of the modified `tests/helpers/p14b2-fixtures.ts`
  (4 passed / 1 failed, class c, see below).

## Typecheck before/after

| Check | Before (writer's C.4 handback, 796 §5) | After this sweep |
|---|---|---|
| `npm run typecheck` (tests/) | 64 error lines in 13 files; 0 in `src/` | **0** |
| `npm run typecheck:bridge` | 8 error lines in 4 `tests/bridge-*` files; 0 in `src/` or `bridge/` | **0** |

Both re-verified clean at the very end of this pass (2026-09-26, ~01:03 local, `date`
command).

## Root-strip / new-root sites (`careerLifecycle.cohorts`)

794 §3 named four strip-list sites that delete the whole `careerLifecycle` root after
asserting `records` is empty; each now ALSO asserts `cohorts` is empty first, mirroring
the existing check:

| # | File | What changed |
|---|---|---|
| 1 | `tests/contracts/_v14Contract.ts` | `projectToV13State`'s strip gains a `cohorts` non-empty guard right beside the existing `records` guard, before `delete raw.careerLifecycle` |
| 2 | `tests/facility-move-demolish.test.ts` | asserts `forgedV11.state.careerLifecycle.cohorts` is `[]` (comment: this world never reaches week 52) before the frozen-V11 comparison |
| 3 | `tests/p13b-r07-save-v25.test.ts` | same `cohorts` emptiness assertion added beside the existing `records` one |
| 4 | `tests/property-state-v13.test.ts` | `withoutTalentProvenanceAndAge` already spreads the whole root (no code change needed); comment added confirming `cohorts` carries through safely because both compared worlds stay under week 52 |

794 S13 (11 claimed, only 10 actually enumerated — see "794 discrepancies" below) named
test callers of `initialCareerLifecycle` needing a per-line decision: does the call mean
"the live V35 root" (no change, `initialCareerLifecycle` now returns `{..., cohorts: []}`
itself) or "exactly the V34 root" (must write the V34 literal directly since the helper
no longer produces that shape)? All 10 enumerated files were live-root cases (no literal
needed); each got an R-VERSION comment addendum recording the decision:
`p14b4-save-v30-compatibility`, `bridge-owner-ux-projection20-migration`,
`p14b3-rule-revision`, `bridge-p06-checkpoint-recovery`, `cash-ledger-checkpoint-v11`,
`bridge-p14b2-checkpoint`, `c2a-m2-sets-save`, `p14bf2-acting-discipline`, plus
`save.test.ts` and `_historicalCurrent.ts` (the latter needed no edit, already generic).

794 S14 (literal lifecycle roots in the C.2a suites) — 17 sites in
`tests/p14c2a-consumers.test.ts` and 8 sites (4 literal + G5's live root) in
`tests/p14c2a-save-and-settlement.test.ts` each gained `cohorts: []`; G1–G4 in the
latter file are genuine FROZEN-V34 envelopes and were built as hand literals instead
of via `makeSave` (which is now the live V35 writer and requires `cohorts` on the
root) — this preserves each case's original intent of exercising the frozen V34
validator, not the live one.

## Two source-verified behavioural facts about the V35 bump (for the parent)

1. **Downgrade-guard split, again.** `migrateToV26`…`migrateToV34` chain safely through
   an empty `cohorts`/`careerLifecycle` (their own `'cannot downgrade SaveFileV34'`
   message is unchanged and correct). `migrateToV8`…`migrateToV25` carry a NEW
   unconditional `if (save.saveVersion === 35) throw ... 'cannot downgrade SaveFileV35
   or discard the cohort receipts'` ahead of their old V34 arm. Split, not uniformly
   renamed: `tests/p14b5-relationships.test.ts` (`migrateToV25` split from the
   `migrateToV29/28/27/26` loop) and `tests/p13b-s3-save-v23.test.ts`
   (`migrateToV22/21/20` split from the safe-chain group) and
   `tests/p06a-w1-release-authority.test.ts` (`migrateToV15`).
2. **`convertV33ToV34(...)` chains needed one more link.** Every test helper that
   builds "the live state" via a fixed `convertVnToVn+1(...)` chain needed
   `convertV34ToV35(convertV33ToV34(...))` wrapped on top: `bridge-p14b4-cast-class`
   (4 sites), `p14b4-material-evidence-core` (`EnvelopeV33` chain), `p14c1-materialized-aging`
   (`liftForTick`), `p14b5-save-v31` (shared `liveEnvelope`, one site fixed all 12
   then-failing tests), `bridge-p14b7-promise-waiver` (1 site, found only via
   `typecheck:bridge`), `bridge-p14b8-waiver-surface` (3 cached-fixture builders:
   `owesTwoState`, `withEdgesState`, `keptAndBrokenState`).

## Additional fixes found only by running every touched file (not by typecheck)

Typecheck catches type errors, not stale runtime literals or titles. The final,
exhaustive single-file run of all 87 touched files surfaced two residual issues after
the main sweep believed itself complete:

- **`tests/bridge-runtime-checkpoint.test.ts`** — one `.toThrow(/canonical V34 save
  bytes exactly/)` regex was never updated; the live writer's message now reads
  "canonical V35 save bytes exactly". Genuine sweep miss (class a), not caught by any
  of the `toBe(34)`/`saveVersion: 34`/`validateSaveV34` greps because the version
  number is embedded in message prose, not a symbol or bare literal. Fixed; re-run
  65/65.
- **`tests/bridge-p14b8-waiver-surface.test.ts`** — a test title still read "...on the
  live Save V34 (stale title corrected post-C.2a)" while its own body asserts
  `saveVersion` 35. Same prose-literal blind spot as above. Fixed to "...Save V35
  (stale title corrected post-C.4, was post-C.2a)"; re-run 32/32.
- A broad `grep -rn "\bV34\b" tests/` (excluding `p14c4-*`) after both fixes turned up
  no further stale prose literals — every remaining hit is either a historical
  R-VERSION comment correctly describing what was true at an earlier bump, or a
  deliberately-frozen V34 fixture/corpus reference.
- **`tests/bridge-process-restart.test.ts`** reported `1 failed | 9 passed (10)` inside
  the 8-way-parallel final verification batch (`SIGKILL restores one durable logical
  bridge session and exact HTTP replay after SIGKILL`-style timing test). Re-run in
  isolation immediately after: **10/10 pass**. Confirmed environmental flake from
  running 8 concurrent vitest batches (load average 20–50 on the box) against a
  SIGKILL/process-restart timing test, not a sweep defect — recorded, not counted as a
  residual failure.

## Process note: two `p14c4-*` files transiently included in a verification batch

A final-verification file list was built via `git status --porcelain tests/`, which
lists changes from both this session and the concurrent RED-suite author sharing this
worktree. That list was not filtered for `p14c4-*` before being split into 8 parallel
batches, so `tests/p14c4-cohorts.test.ts` and `tests/p14c4-save-v35.test.ts` (both
modified by the other agent, never by this one — confirmed no Edit/Write call touched
either path) were executed read-only via `vitest run` inside one batch alongside
legitimate files. Neither file was edited, viewed for content, or relied on for any
classification in this record; their pass/fail output was discarded and is not
reported here. Disclosed per the task's instruction against silent process deviations,
even though the effect was read-only.

## 794 discrepancies found while executing this task

- **S13 says "11 files" but enumerates only 10** (`_historicalCurrent.ts`,
  `save.test.ts`, `p14b4-save-v30-compatibility`, `bridge-owner-ux-projection20-migration`,
  `p14b3-rule-revision`, `bridge-p06-checkpoint-recovery`, `cash-ledger-checkpoint-v11`,
  `bridge-p14b2-checkpoint`, `c2a-m2-sets-save`, `p14bf2-acting-discipline`). No 11th
  caller of `initialCareerLifecycle` was found anywhere in `tests/` outside this list
  and the four §3 strip-list files; the count is off by one, the list itself is
  complete as far as this sweep could verify.
- 794 does not name its own "ceiling" (unknown-saveVersion boundary), "divergence"
  (downgrade-guard split), or "chain" (`convertVnToVn+1` extension) classes by S-number,
  though these follow directly from its own S2/S4/S5 source-side changes. 781's
  predecessor report established these three as their own reason codes for the prior
  bump; the same three recur here and are used the same way. Not a defect in 794, just
  worth flagging so the next bump's inventory names them explicitly instead of leaving
  them implicit.
- Everything else in 794 (the S9–S14 sweep classes, the §3 strip list, the §4
  behavioural-blast-radius forecast) was accurate and matched what running the files
  actually required.

## Per-file table

Reason codes: **rename** = mechanical `validateSaveV34`→`validateSaveV35` /
`GameStateV34`→`GameState` / `SaveFileV34`→`SaveFileV35` (frozen V34 functions
untouched). **lit34→35** = a bare `saveVersion`/`LIVE_SAVE_VERSION` literal `.toBe(34)`
or `saveVersion: 34` moved to 35. **ceiling** = the "1 through 34 only"/"unknown
saveVersion 35" dispatch-boundary test moved to "1 through 35 only"/"unknown
saveVersion 36". **root** = the `cohorts`-emptiness strip-list class (above).
**chain** = a `convertVnToVn+1(...)` chain extended one more step through
`convertV34ToV35`. **divergence** = the downgrade-guard split. **R-VERSION** = an
existing versioned-comment convention extended with a new entry (S13). **S14** =
literal `cohorts: []` added to a hand-built C.2a lifecycle root. **title** = a stale
self-reference in a test's own title corrected. **custom** = bespoke per-file handling
(materialized-aging, G1–G5 frozen-envelope literals). **helper** = a shared non-suite
file exercised via its consumers, not run directly. **defect** = a genuine miss caught
only by the final exhaustive run. **flake** = a parallel-batch timing flake, confirmed
by isolated re-run, not a sweep issue.

| File | +/- | Reason(s) | Result |
|---|---|---|---|
| tests/bridge-owner-ux-projection20-migration.test.ts | 1/1 | R-VERSION | 10/10 |
| tests/bridge-p06-checkpoint-recovery.test.ts | 5/2 | R-VERSION, rename, SaveFileV34→V35 type | 11/11 |
| tests/bridge-p13b-r07-setup.test.ts | 1/1 | rename | 13/13 |
| tests/bridge-p13b-s8-rivals.test.ts | 2/2 | lit34→35 | 17/17 |
| tests/bridge-p14a1-market.test.ts | 1/1 | lit34→35 | 16/16 |
| tests/bridge-p14a2-market.test.ts | 7/7 | lit34→35, title | pass |
| tests/bridge-p14a3-world.test.ts | 5/5 | lit34→35, title | pass |
| tests/bridge-p14b1-promises.test.ts | 4/4 | lit34→35, title | 11/11 |
| tests/bridge-p14b2-checkpoint.test.ts | 2/2 | R-VERSION | 2/2 |
| tests/bridge-p14b2-trust.test.ts | 6/6 | rename | **3 failed (c)** |
| tests/bridge-p14b3-promise-command.test.ts | 8/8 | rename, lit34→35 | 19/19 |
| tests/bridge-p14b4-cast-class.test.ts | 10/8 | chain | 28/28 |
| tests/bridge-p14b4-runtime47-compatibility.test.ts | 1/1 | lit34→35 | 6/6 |
| tests/bridge-p14b5-relationships.test.ts | 1/1 | rename | **2 failed (c)** |
| tests/bridge-p14b6-d2-withheld-employment-claim.test.ts | 2/2 | rename | 2/2 |
| tests/bridge-p14b6-e714-false-empty-absence-lines.test.ts | 2/2 | rename | 7/7 |
| tests/bridge-p14b6-relationship-read-models.test.ts | 3/3 | rename, title | 24/24 |
| tests/bridge-p14b7-promise-waiver.test.ts | 5/2 | chain | 6/6 |
| tests/bridge-p14b8-waiver-surface.test.ts | 11/8 | chain, title (2 rounds — see "Additional fixes") | 32/32 |
| tests/bridge-process-restart.test.ts | 2/2 | lit34→35 | 10/10 (flake once, confirmed clean isolated) |
| tests/bridge-runtime-checkpoint.test.ts | 10/10 | lit34→35 (bulk), defect (see "Additional fixes") | 65/65 |
| tests/c2a-m2-sets-save.test.ts | 6/6 | R-VERSION, rename | 4/4 |
| tests/c2a-m3-rename-and-pooling.test.ts | 2/2 | lit34→35 | 9/9 |
| tests/c2a-m3-screenplay-mint.test.ts | 1/1 | lit34→35 | 8/8 |
| tests/cash-ledger-checkpoint-v11.test.ts | 8/8 | R-VERSION, rename | 10/10 |
| tests/construction-core.test.ts | 5/5 | rename | 12/12 |
| tests/construction-save-v11.test.ts | 6/6 | rename, ceiling | 12/12 |
| tests/contracts/_v14Contract.ts | 6/0 | root | helper (consumers pass) |
| tests/contracts/cross-owner-refusal.contract.test.ts | 9/9 | rename | 3/3 |
| tests/contracts/determinism-floor.contract.test.ts | 4/4 | rename | 3/3 |
| tests/contracts/phase-table-agreement.contract.test.ts | 8/8 | rename | 10/10 |
| tests/contracts/studio-events.contract.test.ts | 1/1 | rename (dynamic string) | 25/25 |
| tests/contracts/v14-boundary-guards.contract.test.ts | 1/1 | ceiling | 36/36 |
| tests/contracts/v14-byte-parity.contract.test.ts | 2/2 | rename, lit34→35 | 6/6 |
| tests/d11-employment.test.ts | 1/1 | lit34→35 | 36/36 |
| tests/d17-engagement-persistence.test.ts | 1/1 | lit34→35 | pass |
| tests/d17a-adv-migration.test.ts | 2/2 | ceiling | pass |
| tests/d17a-adv-reconciliation.test.ts | 1/1 | lit34→35 | pass |
| tests/d17b-publicity.test.ts | 1/1 | rename (comment fix) | pass |
| tests/d17b-save-v7.test.ts | 2/2 | ceiling | pass |
| tests/facility-move-demolish.test.ts | 5/2 | root, rename | 30/30 |
| tests/film-chronicle.test.ts | 3/3 | lit34→35 | 28/28 |
| tests/helpers/p14b2-fixtures.ts | 4/4 | rename | helper (consumers pass; 1 documented pre-existing failure) |
| tests/helpers/p14c2a-fixtures.ts | 21/7 | S14 (return-type fix: `GameStateV34`→`GameState`) | helper (all 3 consumers pass except E1, see below) |
| tests/legacy-parcel-ground.test.ts | 7/7 | rename | 14/14 |
| tests/p04a2-writer-credit-law.test.ts | 1/1 | lit34→35 | 22/22 |
| tests/p06a-w1-release-authority.test.ts | 7/5 | rename, divergence | 14/14 |
| tests/p08a-w0-studio-history.test.ts | 6/6 | rename | pass |
| tests/p09a-w0-founding-regime.test.ts | 7/7 | rename | pass |
| tests/p13a-causal-core.test.ts | 3/3 | rename | 6/6 |
| tests/p13a-technology-milestones.test.ts | 4/4 | rename | pass |
| tests/p13b-r07-save-v25.test.ts | 8/4 | root, rename, ceiling | 8/8 |
| tests/p13b-s2-access-identity.test.ts | 4/4 | rename, title | 14/14 |
| tests/p13b-s2-save-v22.test.ts | 4/4 | ceiling | 12/12 |
| tests/p13b-s3-save-v23.test.ts | 11/8 | ceiling, divergence | 13/13 |
| tests/p13b-s3-validation.test.ts | 2/2 | rename | pass |
| tests/p13b-s5-save-v24.test.ts | 5/5 | ceiling | pass |
| tests/p13b-s6-save-v26.test.ts | 4/4 | ceiling | pass |
| tests/p13b-s7-announcements.test.ts | 3/3 | rename, title | pass |
| tests/p13b-s8-save-v27.test.ts | 4/4 | ceiling | pass |
| tests/p14a1-save-v28.test.ts | 3/3 | ceiling | pass |
| tests/p14b1-first-take.test.ts | 1/1 | lit34→35 | pass |
| tests/p14b1-promises.test.ts | 1/1 | rename | pass |
| tests/p14b1-save-v29.test.ts | 5/5 | ceiling, lit34→35 | pass |
| tests/p14b1-t4-regressions.test.ts | 5/5 | rename, lit34→35 | pass |
| tests/p14b2-setup-wrap-regressions.test.ts | 2/2 | rename | 13/13 |
| tests/p14b3-reservations.test.ts | 5/5 | rename | 9/9 |
| tests/p14b3-rule-revision.test.ts | 7/3 | R-VERSION, rename | 6/6 |
| tests/p14b4-cancel-causal-proof.test.ts | 3/3 | rename, lit34→35 | 22/22 |
| tests/p14b4-cast-class-outcomes.test.ts | 3/3 | rename | **9 failed (c)** |
| tests/p14b4-material-evidence-core.test.ts | 9/5 | chain, rename | 17/17 |
| tests/p14b4-rival-seating-preference.test.ts | 1/1 | lit34→35 | **13 failed (c)** |
| tests/p14b4-save-v30-compatibility.test.ts | 5/2 | R-VERSION, rename, title | 36/36 |
| tests/p14b5-relationships.test.ts | 21/12 | root, rename, divergence, guard | **6 failed (c)** |
| tests/p14b5-save-v31.test.ts | 6/4 | chain, title, lit34→35 | 57/57 |
| tests/p14b5-t-failure-tuning.test.ts | 3/3 | rename | 12/12 |
| tests/p14b7-promise-waiver.test.ts | 1/1 | lit34→35 | 32/32 |
| tests/p14b8-waiver-surface-oracle.test.ts | 2/2 | lit34→35, title | 12/12 |
| tests/p14bf2-acting-discipline.test.ts | 9/5 | R-VERSION, rename | 13/13 |
| tests/p14c1-materialized-aging.test.ts | 21/8 | custom (liftForTick alias chain) | 46/46 |
| tests/p14c2a-consumers.test.ts | 18/17 | S14 (17 literal sites) | 17/17 |
| tests/p14c2a-core-lifecycle.test.ts | 6/6 | S14 (local helper return-type fix) | 13/13 |
| tests/p14c2a-save-and-settlement.test.ts | 34/18 | custom (G1–G4 frozen-V34 literals, G5 moved live), S14 | **1 failed (b)** |
| tests/placement-save-v12.test.ts | 7/7 | rename | 20/20 |
| tests/property-state-v13.test.ts | 15/10 | root (comment), rename, ceiling | 24/24 |
| tests/save.test.ts | 16/13 | root, rename, ceiling, SaveFileV34→V35 | 10/10 |
| tests/script-projects-save-v9.test.ts | 5/5 | ceiling | pass |

80/87 rows are fully green (either explicit N/N or "pass", all individually run).
6 rows are bold with a remaining-failure count; the 7th failing case (E1) sits inside
`tests/p14c2a-save-and-settlement.test.ts`, already listed above. Each is classified
below. `tests/helpers/p14b2-fixtures.ts` and `tests/contracts/_v14Contract.ts` are
non-suite helpers exercised only via consumers.

## Remaining failures — full names, cause class, baseline cross-reference

Baseline file: `docs/engineering/playability-launch-review/evidence/p14b4-20260919/787-c2a-full-core.txt`
(the full-suite run recorded after C.2a landed, before any C.4 source change existed).
Classification method: exact full test name lookup against 787. **(c)** = present as
`×`/`FAIL` in 787 (inherited from C.2a or earlier; not caused by C.4). **(b)** = absent
from 787 (787 shows the file/case passing or not yet existing; genuinely new from the
V35/cohort bump). No behavioural expectation was changed to make any of these pass or
to hide them.

### Class (c) — inherited / pre-existing, confirmed present in 787

**`tests/p14b4-cast-class-outcomes.test.ts` (9 tests)** and
**`tests/p14b4-rival-seating-preference.test.ts` (13 tests)** — the same 350-tick
natural-search non-convergence class 781 already documented against the 772 baseline;
787 (recorded after C.2a) still shows every one of these 22 full names as `FAIL`/`×`,
byte-for-byte the same set 781 reported. Not re-quoted in full here since 787's own
line numbers were checked directly (`787-c2a-full-core.txt:2923-2969` and
`:3022-3144`) and every name matches exactly; see 781 §"Remaining failures" for the
full text of each name.

**`tests/bridge-p14b2-trust.test.ts` (3 tests)** — `poachingFixture()` in
`tests/helpers/p14b2-fixtures.ts`, documented since P14C.1 (record 771/770) as
"DELIBERATELY LEFT FAILING... approved_behavioral_change". Confirmed `FAIL` in 787 at
`:2726`, `:2746`, `:2766` — identical full names to 781's own report.

**`tests/bridge-p14b5-relationships.test.ts` (2 tests)** — `family 12` cases
consuming the same `poachingFixture()`. Confirmed `FAIL` in 787 at `:2786`, `:2805`.

**`tests/p14b5-relationships.test.ts` — "family 6" (6 tests)**, all under
`family 6 — D5 IN THE CHOOSER under the D1 roster predicate (scope (5); companion
:116, :120)`. This is the retirement/hiring-market-filtering consequence 781
originally traced and classified as class (b) relative to the OLDER 772 baseline —
but 787 (recorded after C.2a shipped) already carries all 6 of these as `FAIL` at
`:3157`–`:3222`, so relative to THIS bump's 787 baseline they are inherited, not new.
Reclassified (c) accordingly; not touched.

**`tests/p14b2-fixture-preconditions.test.ts` (1 test, not itself modified — run as a
consumer sanity check of `tests/helpers/p14b2-fixtures.ts`)** — same `poachingFixture()`
issue. Confirmed `FAIL` in 787 at `:2887`.

### Class (b) — genuine new behaviour from the V35/cohort bump

**`tests/p14c2a-save-and-settlement.test.ts` — "E1"** —
`expect(lifecycle.talent.map((t) => t.id)).toEqual(talentBefore)` fails because a
cohort entrant (`person-cohort-52-actor-0`) is appended at week 52 via the youth floor,
matching the writer's own 796 forecast exactly (receipt `{week 52, talentCountBefore 84,
actor 1}`). Confirmed absent from 787 — that file ran fully green (10/10) in 787, before
`isCohortWeek`/cohort entrants existed. Not fixed, per the task rule against changing a
behavioural expectation that C.4 legitimately changes.

## Summary for the parent

- Typecheck: 64+8 error lines → 0+0 (tests/), nothing excluded (the one `p14c4-*`
  typecheck error present at session start disappeared along with its file, owned and
  removed by the concurrent RED author, not by me).
- 87 files touched, 483/376 line delta, 84 run individually + 3 helpers exercised via
  consumers, plus 1 non-modified consumer file run as a sanity check — all accounted
  for.
- 80 files fully green. 6 files carry a combined 35 failing test cases: 34 across 5
  files are inherited/pre-existing (class c, confirmed present in 787 by exact
  full-name match — two 350-tick natural-search-non-convergence files, one shared
  `poachingFixture()` issue surfacing in three consumer files, one
  hiring-market-filtering family already baked into 787). 1 case in 1 file (class b) is
  the disclosed, forecast-matching new cohort-entrant behaviour — flagged, not fixed.
- Two genuine sweep misses were found only by the final exhaustive single-file run
  (not by typecheck): a stale `V34` regex in a thrown-message assertion
  (`bridge-runtime-checkpoint.test.ts`) and a stale `V34` in a test's own title
  (`bridge-p14b8-waiver-surface.test.ts`). Both fixed and re-confirmed green. A third
  apparent failure (`bridge-process-restart.test.ts`, 1/10 inside the 8-way parallel
  final batch) was confirmed a resource-contention timing flake via an isolated
  10/10 re-run, not a defect.
- 794's own S13 list is off by one (says "11 files", enumerates 10); everything else in
  794 checked out against what running the files actually required.
- Nothing was skipped, deleted, or `.todo`'d. No behavioural expectation
  (outcome/count/winner/golden/timeout/threshold) was changed anywhere in this sweep
  to force a pass.

## Commands run (representative; every touched file was run individually at least
once, several twice after the final-pass fixes)

```
node_modules/.bin/vitest run <each of the 84 runnable touched files> --minWorkers=1 --maxWorkers=1
node_modules/.bin/vitest run tests/p14b2-fixture-preconditions.test.ts --minWorkers=1 --maxWorkers=1
node_modules/.bin/vitest run tests/bridge-runtime-checkpoint.test.ts --minWorkers=1 --maxWorkers=1   # re-run after fix
node_modules/.bin/vitest run tests/bridge-p14b8-waiver-surface.test.ts --minWorkers=1 --maxWorkers=1  # re-run after fix
node_modules/.bin/vitest run tests/bridge-process-restart.test.ts --minWorkers=1 --maxWorkers=1       # isolated re-run, confirmed flake
npm run typecheck
npm run typecheck:bridge
git diff --numstat tests/
git status --porcelain tests/
grep -rn -e "toBe(34)" -e "saveVersion: 34" -e "validateSaveV34" -e "GameStateV34" -e "SaveFileV34" tests/ | grep -v "^tests/p14c4-"
grep -rln "convertV33ToV34" tests/ | grep -v "^tests/p14c4-"
grep -rn "\bV34\b" tests/ | grep -v "^tests/p14c4-"
date
```
