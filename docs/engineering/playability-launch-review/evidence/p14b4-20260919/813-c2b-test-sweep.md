# 813 — P14C.2b test-side V35→V36 sweep (TEST-AUTHOR)

Task: mechanical, per-line V35→V36 sweep of the TEST SIDE for the Save V36 /
retirement-extension bump (`LIVE_SAVE_VERSION` 35→36, the single final extension,
`convertV35ToV36`/`convertV36ToV35`/`migrateToLive`, `validateSaveV36`), the same
class of work 797 did for V34→V35. Scope: `tests/**` under
`/Users/zacheryspector/The-Movies-headless-program`, sweep started at HEAD
`25e8fc11`. RED author's `tests/p14c2b-*`, `tests/bridge-p14c2b-*` and
`tests/helpers/p14c2b-fixtures.ts` were neither edited nor run throughout (excluded
from every command below).

**Status: DONE**, subject to two disclosed residual failures classified below (one
class (b), inherited-class (c) matches confirmed byte-for-byte against 787/805/809).

## HEAD moved under me (disclosed, no impact on this sweep)

Mid-sweep, HEAD advanced from `25e8fc11` to `8599f5f7` via three commits from the
writer/coordinator ("C.2b resume", "T1 repaired (810 §8/§9) + matched-pass
prediction (814)", "source review 815 + Follow-up 2"). Checked directly:
`git diff --stat 25e8fc11 HEAD -- src bridge ui scripts` shows exactly one file,
`bridge/contract.ts` (+3, a term-label wording fix unrelated to anything I touch —
confirmed no file in my 89 touches references `contractTermLabel`).
`git diff --stat 25e8fc11 HEAD -- tests/` shows only the RED author's own paths
(`tests/p14c2b-extension.test.ts`, `tests/p14c2b-save-v36.test.ts`,
`tests/helpers/p14c2b-fixtures.ts`, plus a new `tests/bridge-p14c2b-extension.test.ts`
— all excluded from my scope). Nothing I swept was touched by another writer.

## Scope

`git diff --numstat -- tests ':(exclude)tests/p14c2b-*' ':(exclude)tests/bridge-p14c2b-*' ':(exclude)tests/helpers/p14c2b-fixtures.ts'`
→ **89 files, 545 insertions(+), 376 deletions(-)**.

## Typecheck (both clean, re-verified at the end)

| Check | Before this sweep | After this sweep |
|---|---|---|
| `npm run typecheck` (tests/, excl. p14c2b) | 27 error lines in 19 files | **0** |
| `npm run typecheck:bridge` (tests/, excl. p14c2b) | 10 error lines in 5 files | **0** |

Both re-verified clean at 05:38–05:39 CEST 2026-09-26, after every fix below.
`git status --porcelain generated/` empty throughout.

## T8 helpers (812 §T8, the four named helpers)

- `tests/helpers/p14c4-fixtures.ts` `c4LiveFixture` — now routes through
  `migrateToLive` (was `convertV34ToV35`), carrying every V36 key the live engine
  requires.
- `tests/helpers/p14c4-fixtures.ts` `liveEnvelope` — builds the LIVE (V36) envelope
  via `validateSaveV36`, then converts DOWN to V35 via `convertV36ToV35`, so C.4's
  own V35-cohort suite (`p14c4-save-v35.test.ts`) keeps testing the frozen V35
  validator directly. None of C.4's worlds ever open a retirement extension, so
  `convertV36ToV35` always succeeds.
- `tests/helpers/p14c2a-fixtures.ts` `syntheticRecord` — returns `RetirementRecordV36`,
  defaulting `extensionUsed: false, extendedFromWeek: null`.
- `tests/helpers/p14c2a-fixtures.ts` `withSyntheticCareerLifecycle` / `initialSyntheticRoot`
  — param/return type moved `CareerLifecycleRootV35` → `CareerLifecycleRootV36`.

**Ambiguity found and resolved**: `syntheticRecord` is shared by LIVE consumers
(everywhere it feeds `withSyntheticCareerLifecycle`+`tick()`) and by THREE genuinely
FROZEN-V34 consumers in `tests/p14c2a-save-and-settlement.test.ts` (G1, G3, G4 — hand
-build a `GameStateV34` fed straight to `validateSaveV34`, never through `makeSave`).
Making `syntheticRecord` always add the V36 keys broke G1/G4 (`validateSaveV34`'s
exact-key check correctly refuses the two extra keys it has never heard of). Added a
local `frozenRecord()` wrapper in that file (strips the two V36 keys back off) and
applied it at all 5 `syntheticRecord(...)` call sites inside G1/G3/G4. G1/G3/G4/G5
all pass now (confirmed 10/10 in that file).

## Strip-list assertions added (812 §3, all 7 sites)

Each now asserts no record has `extensionUsed === true` and no case has
`variant === 'retirementExtension'` before the whole root is discarded:
`tests/contracts/_v14Contract.ts` (talentMarket + careerLifecycle strips),
`tests/facility-move-demolish.test.ts` (same two), `tests/p13b-r07-save-v25.test.ts`
(same two), `tests/p14c1-materialized-aging.test.ts` (careerLifecycle
destructure-strip), `tests/p14b5-relationships.test.ts` (careerLifecycle
destructure-strip inside the shared `bytes()` digest helper), `tests/p14a1-save-v28.test.ts`
(comment only — the existing `market.cases` emptiness check already covers it),
`tests/p14b1-save-v29.test.ts` (new explicit check; currently vacuous since this
V28-era fixture predates `variant` entirely, but present per the rule).

## Divergence class (downgrade-guard split, recurs every bump)

Every `migrateToVN` guard chain gained a new unconditional V36 arm AHEAD of its V35
one (measured directly from `src/core/save.ts`, e.g. `migrateToV20`/`migrateToV25`/
`migrateToV15` all check `saveVersion === 36` before `=== 35`). Three files assert
the arm-priority message and needed the new text:
- `tests/p14b5-relationships.test.ts` (`migrateToV25` on a genuinely-live V36 input;
  message moved from "cannot downgrade SaveFileV35..." to "...SaveFileV36...
  retirement extension")
- `tests/p13b-s3-save-v23.test.ts` (`migrateToV22`/`migrateToV21`/`migrateToV20`)
- `tests/p06a-w1-release-authority.test.ts` (`migrateToV15`)

## Chain class (recurs every bump)

Every test helper building "the live state" via a fixed `convertVnToVn+1(...)` chain
needed `convertV35ToV36(...)` wrapped on top, PLUS two silent (typecheck-invisible)
instances found only by auditing every `convertV34ToV35(`/`convertV33ToV34(` call
site directly (these used loosely-typed `Envelope`/`as unknown as GameState` casts
that hide the mismatch from `tsc`):
- `tests/p14b4-material-evidence-core.test.ts` (`EnvelopeV33`/`validateStateV33` alias
  + the `actualTakeInput` chain)
- `tests/p14b5-save-v31.test.ts` (local `liveEnvelope` const)
- `tests/bridge-p14b4-cast-class.test.ts` (4 sites)
- `tests/bridge-p14b7-promise-waiver.test.ts` (1 site)
- **`tests/p14c1-materialized-aging.test.ts`** `liftForTick` — SILENT: stopped at
  `convertV34ToV35`, cast through a loosely-typed local `Envelope` type, so `tsc`
  never saw the mismatch; `tick()` on the result would throw on a record missing
  `extensionUsed`. Found only by reading every `liftForTick`/`convertV3xToV3y`
  call site by hand.
- **`tests/bridge-p14b8-waiver-surface.test.ts`** (3 sites: `owesTwoState`,
  `withEdgesState`, `keptAndBrokenState`) — SILENT: same pattern, `as unknown as
  GameState` casts; this file also carries NO `tsc` coverage at all (excluded by
  the bridge tsconfig glob, disclosed in its own header comment), so only running
  it could have caught this.

## T7 (hand-built V36 shapes)

- Records gaining `extensionUsed`/`extendedFromWeek`: via `syntheticRecord` (covers
  every live caller in `p14c2a-consumers.test.ts` (17 sites) and
  `p14c2a-core-lifecycle.test.ts` transparently — confirmed both pass untouched,
  since that file only reads engine-produced records via `toMatchObject`, never
  hand-builds one), plus direct object-literal fixes in
  `tests/p14b3-rule-revision.test.ts`, `tests/p14bf2-acting-discipline.test.ts`,
  `tests/p14b4-save-v30-compatibility.test.ts`, `tests/bridge-p14b2-checkpoint.test.ts`,
  and `tests/p14c2a-save-and-settlement.test.ts` G5 (talentMarket needed the same
  normalization the moment the state is actually saved via `makeSave`, even though
  `tick()` alone never reads `variant`).
- Cases gaining `variant: 'expiry'`: `tests/p14b1-trust-chooser.test.ts`,
  `tests/p14b4-cast-class-policy.test.ts`, `tests/p14b5-relationships.test.ts`,
  `tests/bridge-p14b5-relationships.test.ts` (hand-built `TalentMarketCase` pushed
  into `state.talentMarket.cases`; type moved to `TalentMarketCaseV36`).
- **A second, EASY-TO-MISS instance of the T7 case pattern**: multiple
  "byte-identical through the migration, except this ONE additive field" tests
  compare a live `makeSave`/`migrateToLive` output (cases now carry `variant`)
  against a hand-built expected object (built from raw/parsed JSON, no `variant`).
  Found and fixed in 5 places by grepping every `talentMarket).toEqual(`/
  `JSON.parse(exportSave(governed))` comparison in the diff, not just the ones
  typecheck or the first pass caught: `tests/bridge-p14b2-checkpoint.test.ts`,
  `tests/bridge-p14b4-runtime47-compatibility.test.ts`,
  `tests/bridge-p14b5-relationships.test.ts` (family 11),
  `tests/p14b3-rule-revision.test.ts` (two separate assertions in the same test —
  the second one was missed on the first pass and only surfaced by actually running
  the file), `tests/p14bf2-acting-discipline.test.ts` (same two-assertion pattern),
  `tests/p14b4-save-v30-compatibility.test.ts` (same two-assertion pattern, also
  only surfaced by running the file — shared by all 20 cases via the `preservesExactly`
  helper, so one fix cleared all 20).
- A byte-identity "CANNOT-MOVE" control needed the same treatment for a different
  reason: `tests/p14b5-relationships.test.ts`'s shared `bytes()` digest helper
  strips `relationships`/`careerLifecycle` and `promises[].supersededByPromiseId`
  before hashing; `talentMarket.cases[].variant` is the same kind of pure additive
  field and was moving the pinned SHA-256 (`FROZEN.postTakeDigestStripped`) for no
  behavioural reason. Stripped `variant` there too, alongside `supersededByPromiseId`.

## T1/T2/T3 (value-only sweep)

- T1 (`toBe(35)`/`saveVersion: 35`/`!== 35`): ~80 lines across ~50 files moved to 36.
  Every site was a live-writer check; none was a genuine frozen-V35 fixture except
  `tests/p14c4-save-v35.test.ts`'s own D1/D3/D4/D5 suite (see below) and one
  accurate historical R-VERSION comment in `tests/p13b-s3-save-v23.test.ts:106`
  (left as written — it describes history, not the current arm order).
- T2 (sentinel `saveVersion: 36` forged as "unknown"): moved to 37 in 16 genuine
  sentinel-forge sites across 13 files; `tests/bridge-p14b2-checkpoint.test.ts:66`'s
  `saveVersion: 36` is NOT a sentinel (the correct current live number in an
  expected-shape literal) and was left alone.
- T3 (`versions 1 through 35 only`): moved to `...36 only` everywhere the sentinel
  moved; titles updated ("stale number corrected post-C.2b").

## p14c4-save-v35.test.ts (special per-line handling)

- D1/D3 (frozen V34→V35/V35→V34 boundary tests): unaffected, nothing V36-shaped
  enters.
- D2 ("the live boundary moved through 35"): both literals moved to 36, title
  corrected.
- D4 (tampering suite): stays on `validateSaveV35`/`liveEnvelope`, now correctly
  converting DOWN from the live V36 state.
- D5 ("save/load mid-year... continuing... byte-for-byte"): reload now goes
  through `validateSaveV36` directly (not `liveEnvelope`), since continuing to
  tick needs every V36 key `readExtensionUsed` requires.

## Residual failures — full names, class, evidence

### Class (b) — genuine new C.2b behaviour, left FAILING

**`tests/bridge-p14b5-relationships.test.ts` — "family 12 — the R-D5 natural-chain
LEDGER... > seed-b: chain digests, row counts, churn rosters empty under D1, zero
exposed rows through 416; the nine frozen drop templates only"** —
`expected [...] to have a length of 47 but got 48`. Record 809 (before C.2b existed)
measured and pinned this control at exactly 47 rows. Verified the pin is NOT stale
by extracting the pre-implementation commit `8e84bb59` (`git archive` into
`/private/tmp/claude-501/pre-c2b-baseline`, `node_modules` symlinked, run in
isolation): **the identical test, unmodified, passes with 47 rows at that baseline**
(`family 12 seed-b ✓`, only the pre-existing `poachingFixture` case fails there,
matching 809's own 14/15 report exactly). Under current HEAD (C.2b implemented) the
same test now measures 48. This matches 812 §4's own blast-radius forecast exactly:
"C.2b changes behaviour in every industry world where an employee who announced
retirement is still employed at E−12 and the employer bids... common in long rival
worlds"; seed-b is precisely such a long natural industry chain reading employment/
receipts hundreds of weeks out. Not fixed — the pin would need re-measuring against
the new true value, which is the parent's/writer's call, not a test-side sweep
decision.

### Class (c) — inherited, confirmed present in 787/805, byte-identical match

- **`tests/bridge-p14b2-trust.test.ts`** — group5, 3 tests (`raises due at minus8...`,
  `raises the poaching winner's actual outcome...`, `does not require any case
  entry...`) — `poachingFixture()` (documented since P14C.1, records 771/770,
  `approved_behavioral_change`). Confirmed identical error
  (`expected 208 to be 52`, same file/line `p14b2-fixtures.ts:198:48`) at 805.
- **`tests/bridge-p14b5-relationships.test.ts`** — family 12, "poachingFixture" case
  — same fixture, same error, confirmed identical at 805 (line 2878) and NOT among
  809's 8 already-repaired cases.
- **`tests/p14b1-trust-chooser.test.ts`** — 2 tests, both matching 811's own
  explicit note ("`p14b1-trust-chooser` fails identically at HEAD"): `expected
  'compensation' to be 'opportunity'`; `search premise failed... within 220 weeks`.
- **`tests/p14b4-cast-class-outcomes.test.ts`**, **`tests/p14b4-cast-class-policy.test.ts`**,
  **`tests/p14b4-rival-seating-preference.test.ts`** — the 350-tick natural-search
  non-convergence family 781/797 already documented; every failing test name in
  this run's output was cross-checked present as `×` in 805 (e.g. "RIVAL: a
  genuinely naturally authored tagged commitment binds...", "observes flexible-first,
  actual P1 fallback...", "search table: the first seed-b decision...").

### Flake (not a defect, confirmed by isolated re-run)

**`tests/bridge-process-restart.test.ts`** — 2 SIGKILL/timing tests timed out at
60000ms inside the 8-way-parallel batch (load contention from running 8 concurrent
vitest processes), the exact same class 797 documented for this file. Re-run in
isolation immediately after: **10/10 pass** (61.8s total). Confirmed environmental
flake, not a sweep defect, exactly as 797 found for the same file.

## Commands run (representative)

```
npm run typecheck                 # 27→0 errors under tests/ (excl. p14c2b)
npm run typecheck:bridge          # 10→0 errors under tests/ (excl. p14c2b)
git diff --numstat -- tests ':(exclude)tests/p14c2b-*' ':(exclude)tests/bridge-p14c2b-*' ':(exclude)tests/helpers/p14c2b-fixtures.ts'
  # 89 files, 545 insertions(+), 376 deletions(-)
node_modules/.bin/vitest run <each of the 89 touched files> --minWorkers=1 --maxWorkers=1
  # 8-way parallel batch, full run + targeted re-runs after each fix
git archive 8e84bb59 | tar -x -C /private/tmp/claude-501/pre-c2b-baseline
  # pre-implementation baseline extraction for the class (b) discrimination above
node_modules/.bin/vitest run tests/bridge-p14b5-relationships.test.ts --minWorkers=1 --maxWorkers=1
  # run at the pre-implementation baseline: 14/15 (matches 809 exactly)
node_modules/.bin/vitest run tests/bridge-process-restart.test.ts --minWorkers=1 --maxWorkers=1
  # isolated re-run: 10/10 pass, confirms the flake
git status --porcelain generated/   # empty throughout
date
```

Final diff sha256 (`git diff -- tests ':(exclude)tests/p14c2b-*' ':(exclude)tests/bridge-p14c2b-*' ':(exclude)tests/helpers/p14c2b-fixtures.ts' | shasum -a 256`):
`042ca2c4b3544103071606a620ab3d81c318a421a5b80cfb824df6ac8ef07176`, re-verified
unchanged after the isolated flake re-run (`date`: 2026-09-26 05:56 CEST).

## Summary for the parent

- Typecheck: 27+10 error lines → 0+0 (tests/), nothing excluded except the RED
  author's own p14c2b files (counted, not read, per instruction).
- 89 files touched, +545/−376, all individually run at least once (several twice
  or three times after fixes).
- Two silent (typecheck-invisible) "chain" bugs found only by auditing every
  conversion call site by hand: `p14c1-materialized-aging.test.ts`'s `liftForTick`
  and `bridge-p14b8-waiver-surface.test.ts`'s three fixture builders (the latter
  file carries no `tsc` coverage at all).
- One residual class (b) failure, positively discriminated against the
  pre-implementation baseline (not assumed): `bridge-p14b5-relationships.test.ts`
  family 12 seed-b, 47→48 rows, matching 812 §4's own forecast.
- All other residual failures are confirmed byte-for-byte identical to entries
  already present in 787/805 (class c) or an established timing flake (797's
  precedent), none touched.
- No test was deleted, `.todo`'d, or had a behavioural expectation loosened to
  force a pass anywhere in this sweep.
