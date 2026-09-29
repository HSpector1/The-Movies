# 1327-F: parent adoption of the R2 handback, with one amendment

The parent read [1327-C](1327-C-retained-r2-handback.md), its patch (sha256 c9a6d421…) and classification (sha256
03f8042c…) in full. 1327-C stays byte-frozen; this record governs where they differ.

## Adopted as reported

- C15: four files fixed (5 rows); the `bridge-p14c2rm-retirement` pair stays untouched under rule 6. Its measured
  cause is the natural trust law: at week 208 the director's case is declined with "Your Studio holds a record this
  person distrusts." (`src/core/talentMarket.ts:1149`, `:1193`) after the fixture's own two cancelled takes.
- The S10 block of `p14c2s-scientist-retirement` strips `sharedCompetitions`, `firstTakeSubjects` (non-empty on that
  world) and the `termination` movement key unconditionally. The parent accepts the author's reading: the block states
  "Reader-only schema mutations, NOT historical fixtures or governed downgrades. No such object is played/exported"
  and already deletes six live `careerLifecycle` roots with content unconditionally. The independent review rules on it.
- C3: the down-projection edit at `tests/helpers/p14c3-canonical-rival-fixtures.ts:187` (K1-K3 pass). L1/L2 stay
  untouched: `canonicalHired()` now reaches an industry-retirement finality with cause `noCatalogue`
  (`src/core/professionTransitions.ts:167`) before any Writer vacancy for the canonical subject, a natural-chain
  drift for a later repair with its own attribution.
- C12: both pins from the recorded 1328 output; schema identity from the checked-in manifest.

## Amendment: K4's live validator selection (1320-A class S1)

K4 (`tests/p14c3-canonical-rival-history.test.ts:232-257`) validates `makeSave(canonicalChosen().loaded)`, a live
envelope, and three detached mutants of it with `validateSaveV38` at `:233`, `:245`, `:255` and `:256`. `makeSave`
writes `saveVersion` 42, so `validateSaveV38` throws "expected version 38" (`src/core/save.ts:10385`) before any
mutant cause is reached. This is the S1 class the Save42 sweep applied everywhere else ("`validateSaveV41(` on a live
envelope … becomes `validateSaveV42(`"); the C3 memo masked this file from that sweep. `validateSaveV37(old)` at `:235`
reads a genuine V37 capture and stays.

The author revises the patch to select `validateSaveV42` at those four sites (and the import), measures what each
mutant now refuses with, and keeps each expected cause unless the live validator names it differently, in which case
the expectation names the measured message with its source line (S8). If a mutant is no longer refused, the author
stops on K4 and reports.
