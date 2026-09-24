# 764 — the C.1 prediction, written BEFORE the writer reports

Written at `fb83f927` while the writer is still working, so this cannot be retrofitted to whatever the
run produces. Prediction 754 was falsified on its case count and the cause was the parent's
arithmetic; that error is corrected here by deriving the baseline from the run rather than from
memory, and by checking the data-driven class that caused it.

## Baseline

Run `755-b8-full-core`, source `3cae7c93`: **10 failed / 347 passed (357) test files; 25 failed /
4060 passed / 8 todo (4093) cases**, 50 distinct failure lines.

`git diff --stat 3cae7c93..HEAD -- tests/` is exactly twelve files: eleven corpus fixture artifacts,
which register no case, and `tests/p14c1-materialized-aging.test.ts`, which registers 45.

## The numbers

| | predicted |
| --- | --- |
| test files | 357 + 1 = **358** |
| cases | 4093 + 45 = **4138** |
| todo | **8**, unchanged |

**The data-driven class that falsified 754 is checked, not assumed.** That was
`bridge-runtime-checkpoint.test.ts:758`, `it.each(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.entries())`,
one case per registered prior identity. **C.1 does not bump the projection, so no prior identity is
registered and that generator adds nothing.** Every other `it.each` over save or migration data was
read: all iterate static fixture lists or literal tuples, and none scales with `LIVE_SAVE_VERSION`.

The writer is forbidden from adding or removing any `it(`, so no other case may appear.

## The prediction that matters, and it is not a count

**I predict a NONZERO and possibly large number of NEW failures in existing tests, concentrated in
assertions on exact money, salary and offer values.** This is C.1's intended consequence, not a
regression, and the reasoning is arithmetic rather than a hunch:

`ageFactor` (`src/core/employment.ts:263-267`) is a smooth quadratic bell, `prime 34`, `spread 22`,
floor `0.85`. It is flat only outside `(12, 56)`. Worldgen draws ages in `[20, 70]`. So **most people
in every world sit inside the live band**, and `offerForTalent` prices them through it.

Contract §12 F3's consequence is that a fresh V33 campaign stores INTEGER ages from genesis: the
validator forces `talent[i].age === ageAt(row, market.tick)`, so `43.40522…` is stored as `43`. Every
in-process world built by `generateWorld` or `p13aGeneratedStudio` therefore prices differently than
it does today, by a small amount, for most of its people.

Expansion 758 Traps 1 and 2 named this in advance: "Every test pinning a fractional age moves" and
"A world ticked far enough will price contracts differently than it does today. That is the intended
consequence." The scale is the part that was never estimated, and this record estimates it as LARGE.

**The disposition, decided now rather than under pressure later.** The writer REPORTS what moved and
adjusts nothing. Re-pinning a moved number is test authoring, it belongs to a test author, it happens
in a separate pass, and it is done from evidence. The Owner's directive is explicit: do not adjust
existing expectations solely to recover old outcomes.

## The falsifiers

1. **A file count other than 358.**
2. **A case count other than 4138.**
3. **Any of run 755's 50 distinct failure NAMES vanishing.** C.1 fixing an inherited failure by
   accident would need explaining, not celebrating.
4. **Any failure inside `tests/p14c1-materialized-aging.test.ts`.** The RED must be 45 of 45. A single
   failing case there means C.1 is not done.
5. **A new failure in a file that derives nothing from `talent.age`.** That is the falsifier that
   separates "the intended economic consequence" from "the writer broke something", and it is the one
   I expect to have to work hardest to evaluate.
6. **Any `it(` added or removed under `tests/` by the writer.** Counted independently by the parent.
7. **A historical hash moving** (contract §12 F4). Reported, never re-pinned.

## What this record does not predict

It does not predict WHICH files move on economics, because that depends on which assertions pin
absolute values rather than relative ones, and no static reading tells me that. The attribution is
done against the run, per file, as B.8's was.

---

## CORRECTION, published BEFORE the affected run (candidate `a04fa398`)

The focused-review addendum (765 §3) created a standing obligation: if a justified regression changes
this record's predictions, the PREDICTION is corrected in the open before the run, never the tests to
preserve a number. This is that correction. The writer has handed back; no full run has been started.

**The counts stand.** 358 files, 4138 cases, 8 todo. Verified two independent ways rather than
asserted: the `it(`/`describe(` diff across `tests/` is 0 added and 0 removed, AND the per-file
call-site count is identical to HEAD in all 104 touched test files.

**Three justified regressions are now NAMED, so they are not falsifier-5 triggers when the run finds
them.** Each is contract-mandated rather than a defect, and none is re-pinned to hide it:

1. **`tests/bridge-p14b4-cast-class.test.ts`, 2 of 28.** The A13 cause has a SECOND instance the audit
   never named: `:414-419` hand-writes `age: 29` / `age: 30` onto a real person and then validates.
   Condition 2 now refuses it — `stored age 29 for t-act-09 disagrees with its provenance, which
   derives 25 at week 45`. The honest fix is a provenance-consistent synthetic age, which is test
   authoring.
2. **`tests/p14b5-relationships.test.ts` family 10, 2 cases.** Structurally invalidated by §6 plus
   §12 F3: a V33-native campaign carries `authored_exact_week` rows and is not downgradable, so the
   "lossless when empty" route those cases exercise no longer exists, and the nearest guard now
   refuses with the materialization message rather than the relationship one.
3. **`tests/p14c1-materialized-aging.test.ts`, 1 case.** The RED's own wrong expectation, per 765 §1.

**Falsifier 5 is re-expressed against that list.** A new failure OUTSIDE the three above, in a file
that derives nothing from `talent.age`, still triggers it. The three above do not.

**One prediction I can now sharpen, and one I cannot.** The economics class remains unbounded and
unattributed until the run produces it; nothing here excuses an individual failure, per 765 §3. But
one repricing is already known and disclosed by the writer rather than discovered: `offerForTalent`
at `hollywood.ts:224` and `hollywoodTick.ts:140` now prices the COMMITTED floored person, so rival
contract pricing moves by a small amount. Nothing was re-pinned for it.

**A rule-design error of mine, recorded because it cost something.** I gave the writer "no added or
removed `it(` lines" as the proxy for "no test authoring". A title is not test authoring, and that
proxy forced the writer to revert 20 title-only bumps and leave titles that now name versions and
ranges their bodies no longer use — for example `p14b5-save-v31:186` still reading "LIVE_SAVE_VERSION
is the literal 32". A misleading title is worse than the risk the rule guarded against. The correct
invariant is the one I actually verified above: the NUMBER of call sites per file is unchanged. The
20 titles go to the test author.

---

## SECOND CORRECTION, again BEFORE the affected run (candidate `b7e3e24a` + the test pass)

**Counts.** The RED gained ONE case (51 call sites against 50), the only call-site change in 30
touched test files; the other 29 are title-only and verified delta-zero per file. Both collection
deaths are fixed. So: **358 files, 4093 + 46 = 4139 cases, 8 todo.**

**Predicted remaining failure classes, named before measurement.** I am deliberately NOT predicting a
total, because the last two attempts to predict a failure count were both wrong and the classes are
what matter:

1. the 25 inherited failures, unchanged
2. **9 in `v14-migration.contract`, a NEW class and the deepest consequence C.1 has produced** — see
   below
3. the natural-chain repricing casualties: `p14b4-rival-seating-preference` (18),
   `p14b4-cast-class-outcomes` (9), `p14b4-cast-class-policy` (1)
4. byte-identical and age-timing casualties in `p14b5-relationships` family 1,
   `bridge-p14b5-relationships` family 12, `d17b-save-v7`, `p13b-r07-save-v25`, `property-state-v13`
5. the 7 timeouts and 6 `ENOENT`, which I expect to CLEAR if they were cause-1 cascades. **That is a
   prediction and its falsifier is their survival.**

## The new class, because it is the most interesting thing C.1 has found

The 9 surviving `v14-migration` failures are each **a single character in a 225,000-character
stringified state: one person's age off by exactly one**, diverging in the first week or two of a
30-week comparison and never in any other field.

**Cause, and it is not a defect.** The T9 contract projects a live V33 state down to a V13 twin and
plays both forward. The twin's ages are ALREADY FLOORED when the root is dropped, so its
re-migration mints a `legacy_age_anchor` from an integer, and its next birthday lands at exactly +52.
The original's anchor keeps its true fraction and crosses earlier or later. **Birthday PHASE is the
information the twin cannot carry**, and it is unrecoverable once the root is stripped.

**Why this does not threaten real saves.** A genuine pre-C2 file on a player's disk holds FRACTIONAL
ages, because worldgen wrote raw gaussians in that era. Migrating it anchors on those fractions and
phase is preserved. Only a twin projected from an already-materialized V33 state loses it, which is
an artifact of how the test builds its twin rather than of the migration law.

Re-expressing that comparison is test authoring and it is not done in this pass. **Recorded, not
adjusted.**

## A characterisation I am correcting rather than repeating

The test author reported the `bridge-p14b5-relationships` family 12, `d17b-save-v7`,
`p13b-r07-save-v25` and `property-state-v13` failures as "pre-existing" and "not previously on
anyone's board". Checked against run 766's own new-failure list: **all four are in it.** They are C.1
ripple effects already attributed at 766, not pre-existing failures and not new discoveries. The
author meant "not caused by my title edits", which is true and which I verified independently — their
diffs in those files are pure string edits inside existing `it(` calls.

---

## THIRD CORRECTION, before the final confirming run (candidate = the repair pass)

**Counts unchanged: 358 files, 4139 cases, 8 todo.** Verified again — the `it(`/`describe(` call-site
count is identical to HEAD in all 20 files the repair pass touched, so no coverage was added or
removed anywhere.

**Predicted failures: 54, ±1.** Derived rather than guessed:

| | |
| --- | --- |
| run 767 | 104 |
| repaired by the two-specialist pass | **−50** |
| **predicted** | **54** |

The −50, per file: `bridge-p05a1` 6, `bridge-p05a3` 4, `v14-migration` 9, `bridge-p14b5-relationships`
4 of 5, `bridge-owner-ux-projection20-migration` 3, `ruling-a-development-in-play` 3,
`p14b4-rival-seating-preference` 5 of 18, `d17b-publicity` 2, `p13b-s1-validation` 2,
`p13b-r07-save-v25` 2, `production-operations-save-v8` 2, and one each from `p13b-s2-validation`,
`bridge-p14b7-promise-waiver`, `facility-move-demolish`, `p13b-s8-finance`, `property-state-v13`,
`p14b7-promise-waiver`, `p14b5-relationships`, `d17b-save-v7`.

**The ±1 is FU-2**, the prepared-reuse timeout, which has now failed in 739 and 755 and passed in 737
and 767. Two of four. Its threshold is still deliberately unmoved.

## The 54 are 24 inherited plus 30 deliberate, and the 30 are the honest residue

**These are NOT unexplained failures and they are NOT repairable by moving a number.** Two causes:

**1. Isolated-population loss — 25 cases** (`p14b4-rival-seating-preference` 13,
`p14b4-cast-class-outcomes` 9, `p14b4-cast-class-policy` 1, `p14b1-trust-chooser` 2). Each test's
natural search depends on a specific subject being capable-but-unproven; under materialized aging
those subjects cross `isProven` before the natural events the search finds ever occur. **Aging only
moves forward, so a wider scan window makes this strictly worse, never better.** Restoring them needs
a new seed, subject or scenario — a redesign, not a repair — and the standing rule forbids relaxing a
selector or widening a tick budget to make an old premise reappear.

**2. The `poachingFixture` cascade — 5 cases** (`bridge-p14b5-relationships` 1, `bridge-p14b2-trust` 3,
`p14b2-fixture-preconditions` 1). **Here the attribution evidence was correct but incomplete, and the
test author found the deeper fact rather than pinning around it.** 771 traced the failure to
`publicPreferredTerm` 52 → 208, which is right; bumping that pin moves the failure one step deeper,
into `assertBinding`. Measured: the fixture's incumbent offers a 208-week term while the player's
promise hard-codes 52. Under the OLD unproven preference, shortest wins and the player won — which is
the premise every consumer of that fixture is built on. Under the NEW proven preference, longest wins,
**the incumbent wins outright and the player's promise is never bound at all.** The author reverted
the attempted fix and left the original pin failing at its correctly-diagnosed line rather than
carrying the failure somewhere harder to find. That is the right call.

## Two repairs flagged as the weakest in the set, accepted with their limits stated

**`_p08HistoryTwins.ts` gained an opt-in `ageResidue` parameter.** Read and checked: it defaults to
false so every other caller keeps strict byte equality; when on, every other byte is still compared in
full with `age` stripped from BOTH sides, and `age` then gets an exact per-person bound —
`native − migrated ∈ {0,1}` with native never behind, ids paired. It replaces "byte-identical
including age" with "byte-identical excluding age PLUS a proven bound", which is a re-expression, not
a relaxation: it still fails if any age moves by two or if the migrated side ever leads.

**`p13b-s8-finance` recasts `authored_exact_week` rows to `legacy_age_anchor` in-test.** At week 0 the
two kinds name the identical anchor, so this constructs a lawful equivalent world — one that entered
by a migration at week 0 — and lets the REAL `migrateToV26` run instead of hand-forging its result.
The test's own subject is money-kind stripping, which the recast does not touch. **It is the weakest
repair in the set** because it hand-builds a provenance row rather than reaching the state by a real
path, and the alternative record 771 suggested — minting the fixture at the old writer — remains open
and was outside this pass's authority.

## Falsifiers

1. a file count other than 358, or a case count other than 4139
2. a failure count outside **53–55**
3. any of the 50 repaired cases still failing
4. any NEW failure not in the 24 inherited and not among the 30 deliberate
5. `tests/p14c1-materialized-aging.test.ts` below 46 of 46
