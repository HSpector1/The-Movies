# 684-T — parent brief: the P14B.5-T requirement regression (test-author, RED FIRST)

Authority: record 683 (the Owner's activated ruling 1). You write the requirement test. You do NOT
change production. A separate writer changes the constant afterwards, and only after your RED is
reviewed and released.

## The requirement, in one sentence

Under the adopted law, a pair that repeatedly makes pictures together which repeatedly flop must be
able to reach the **Strained** tier; under the old law it could not.

## Hard boundaries

- Do NOT edit anything under `src/`, `bridge/`, `generated/`, `ui/`, `scripts/`, `package.json` or
  any config. Do NOT change `RELATIONSHIP_FAILURE_DELTA` yourself, even temporarily in a committed
  file (a scratch copy outside the repo is fine for your own calibration).
- Do NOT modify any EXISTING test, fixture or helper. This is new test files only, plus — if and
  only if a truly existing assertion becomes false under the new law — a written list of them handed
  to me for a separate decision. Do not pre-emptively "fix" the suite to the new value.
- Do NOT manually force a negative edge into a root and call it a result. Every closeness the
  requirement asserts must come out of the REAL write path: `advanceRelationshipsWeek(state, {takes,
  releases}, week)` and, where a cancel is under test, `recordCancelledAfterFirstTake`.
- Do NOT weaken a validator, enlarge a timeout, or rewrite a historical fixture.
- No `Math.random`, no wall clock, no new RNG.

## What to write

One new file, `tests/p14b5-t-failure-tuning.test.ts`. Import the constants BY NAME and never type
the literal 4 or 5 as the delta anywhere. Every assertion must be phrased so it reads correctly
whatever the constant is — EXCEPT the one requirement group below, which is deliberately written
against the adopted law and is expected to be RED until the writer lands it.

**Group 1 — THE REQUIREMENT (RED now, GREEN after the change).** Drive a repeated-flop chain for one
LOW-proximity pair through the real write path and assert the pair reaches a tier in the negative
band, i.e. `currentTier(edge, week)` returns `'Strained'` and `pairChemistry(...).sign === -1`.
Derive the expected trajectory from the exported constants, not from typed numbers. State in a
comment exactly why this is impossible under the old value (a capped cycle nets
`RELATIONSHIP_PROXIMITY_LOW + RELATIONSHIP_REPEAT_CAP − RELATIONSHIP_FAILURE_DELTA`, which is
positive at 4 and zero at 5) and cite record 683.

**Group 2 — THE POSITIVE CONTROL (green before AND after).** A pair whose shared pictures succeed
still climbs and still reaches the top of the ladder on the same number of pictures as before. The
success driver, the proximity weights and the repeat accelerator are untouched by this change, and
your test must prove that rather than assume it.

**Group 3 — THE NEUTRAL CONTROL (green before AND after).** A picture whose critic score sits in the
neutral band mints no release driver at all, and a pair with no flop is not moved by this change.

**Group 4 — DRIFT IS READ-ONLY AND UNCHANGED.** The grace window, the return horizon and the
"never past the baseline" property are unaffected: a flopped edge below the baseline still drifts
UP toward it, and drift still changes no counter, no `firstSharedWeek` and no `peakTier`.

**Group 5 — REPLAY AND IDEMPOTENCY.** Re-running the same advance from the same pre-state produces a
byte-identical root, and a second advance over the same production id mints nothing twice. `rngState`
is byte-equal before and after every write.

**Group 6 — SAVE AND LOAD ACROSS THE CHANGE.** A root holding historical drivers stamped with the
OLD delta value round-trips through `makeSave` / `validateSaveV31` / `migrateToV31` unchanged, is NOT
restamped, and is not refused. Build that root through the real write path and then assert the stored
driver deltas are preserved verbatim. This is the test that proves the change is prospective.

**Group 7 — NATURAL-WORLD ARM, labelled honestly.** On ONE standard seed (`p13a-core-causal-01`,
`654-T-ledger.md` §B), advance far enough to mint edges and at least one natural flop, and assert
what is TRUE rather than what would be convenient: that the flop driver's stored delta equals
`−RELATIONSHIP_FAILURE_DELTA` at whatever the constant is, and that the resulting closeness is the
pre-flop value minus that constant. Do NOT assert that a natural campaign reaches Strained — the
measurement (records 679/682) shows the four standard seeds do not reach it at the old value, and
whether any reaches it at the new one is a question for the parent's post-row re-run, not for a test.
Label this group `NATURAL WORLD` in its describe block and label groups 1–6 `CONSTRUCTED`.

## Naming, honestly

Every constructed world gets a comment naming its staging: which people, which seats, which weeks,
which deltas are engine-applied. If you construct a partial object cast to `GameState`, say so and
name every field you populate, as `681-b5-closeness-floor-witness.ts` does in its header.

## Your handback

`684-T-report.md` in this folder: the file path, line count, sha256, the exact command to run it,
which groups are RED now and which are GREEN now (run it and report the ACTUAL output, do not
predict), the precise trajectory your requirement group asserts with the arithmetic that produces it,
any EXISTING assertion you believe will become false under the new value (list it, do not change it),
and what your test cannot establish. State plainly that you changed no production file.

Forecast: one new test file, one RED run. No production edit, no commit, no evidence-runner call.
