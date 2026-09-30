# 1348-F4: parent rulings on the slice A production handback (1348-E)

[1348-E](1348-E-rel-sliceA-production-handback.md) returned PARTIAL. The three-step production passes 77 of the 80
leaves, and the writer edited no test.

## 1. Three RED premises pin the old law (test defect)

Three leaves of `tests/p14b5-relationships.test.ts` (family 6b and the companion-copy block, lines 1043, 1055 and 1149
after r4) assert `currentTier(edge) === 'Strained'` for a pair at closeness 11 with 3 competitions. Two carry the
comment "measured at BASE (v1)". Under v2, which the Owner ruling, 1347-F and `tests/p14b10-conflict-evidence.test.ts:151`
require, that pair reads Enemies. Two of the leaves' own settlement expectations only hold when it does. No law can
pass both, and the parent read the lines to confirm it. Four reviews (1348-D to D3, and the parent's dry runs)
missed it, because every one of those leaves already failed at RED for another reason.

Ruling: RED r5 changes the three premises to `'Enemies'`. The first leaf was a control that passed at RED. It now
fails at RED on its tier line, and its classification changes to match.

Lesson: when a leaf fails at RED, a later assertion can hide an intermediate premise that pins the old law. Reviews
of a law change grep the RED for literal outputs of the changed function (`'Strained'`, the old version) and check
each against the new law.

## 2. Two type errors from the required counter

`tests/p14b5-t-failure-tuning.test.ts:295` and `:373` build edges without `sharedCompetitions`, which the v2
`currentTier` signature requires. Option A, as the writer recommends: RED r5 adds `sharedCompetitions: 0` to both
edges. The signature stays strict, so any caller that omits the counter fails to compile. It does not read quietly as
"no evidence".

## 3. The Mentor positive leaf runs past its budget

It took 50.7 s against a 30 s budget. It passes only because its fixture builds synchronously, and a Vitest timeout
fires only at a yield point. The budget is therefore a false statement. RED r5 either builds the Mentor fixture once
per file (`beforeAll`) so every leaf stays within budget, or it states an honest budget with the measured time and a
written reason. It never keeps a limit that cannot fire.

## 4. The unrequested shared helper

To avoid copying the ordering rule, step 3 moved the first-take ordering out of `retainedTransitionEvidence` into
`distinctActingFirstTakes` in `professionTransitions.ts`. The parent accepts it provisionally. The implementation
review must show it preserves behaviour: the transition suites give identical results at BASE and on the candidate,
and the moved lines compare equal, whitespace aside.

## Next

RED r5 (1348-C5), then a parent dry run over step 3. The writer's probes predict 80 of 80 and a clean root type gate.
Then implementation review 1348-J and landing.
