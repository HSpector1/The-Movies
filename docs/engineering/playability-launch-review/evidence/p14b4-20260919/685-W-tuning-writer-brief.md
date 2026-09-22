# 685-W — parent brief: the P14B.5-T production change (sim-core, ONE writer)

Authority: record 683, the Owner's activated ruling 1. You are the ONLY production writer on this
branch right now. The RED regression that defines the requirement is already written and reviewed by
the parent: `tests/p14b5-t-failure-tuning.test.ts` (report `684-T-report.md`).

## The change, in full

`src/core/relationships.ts:72` — `export const RELATIONSHIP_FAILURE_DELTA = 4` becomes `= 5`, and
its doc comment is updated to record what the value now means and where the ruling came from.

That is the whole production change. It is deliberately one constant.

## What you must NOT do

- Do not touch any other constant, in this file or anywhere. `RELATIONSHIP_SUCCESS_DELTA`,
  `RELATIONSHIP_CANCEL_DELTA`, the proximity weights, `RELATIONSHIP_REPEAT_CAP`, both critic scores,
  both drift constants, `RELATIONSHIP_RECENT_CAP`, `RELATIONSHIP_BASELINE`, the tier floors and
  `RELATIONSHIP_RULES_VERSION` all stay exactly as they are.
- Do not bump `RELATIONSHIP_RULES_VERSION`, `LIVE_SAVE_VERSION` (31) or `PROJECTION_VERSION` (48).
  Record 683 states why: the rules version is the TIER RULE revision, the delta is a DRIVER constant,
  the receipt carries no rules version, and the validator pins no delta value. If you believe that
  reasoning is wrong, STOP and tell me rather than bumping anything.
- Do not add a migration, do not restamp any stored driver, do not touch `save.ts`.
- Do not edit ANY test, fixture or helper. Test ownership is independent. If an existing assertion
  fails after your change, report it with the exact file, line and expected-versus-actual; do not fix
  it and do not adjust it.
- Do not add a conflict driver, an Enemies/Nemeses path, a seating refusal, a production penalty or
  anything romance-related. Ruling 1 creates none of them.
- Do not touch rival casting, staffing or seat policy. Ruling 2 forbids it in this step.
- Do not commit. The parent lands commits.

## What the comment should say

Enough that a reader six months from now knows the value is a ruled hypothesis and not an accident:
that a capped repeat cycle nets `RELATIONSHIP_PROXIMITY_LOW + RELATIONSHIP_REPEAT_CAP −
RELATIONSHIP_FAILURE_DELTA`, so at 4 a repeatedly-flopping low-proximity pair still gained a point
per picture and could not reach the Strained band, and at 5 the cycle breaks even and the band opens;
that the pinned relation `RELATIONSHIP_FAILURE_DELTA > RELATIONSHIP_PROXIMITY_LOW` still holds; that
this is PROVISIONAL CANDIDATE TUNING, not settled balance; and the citation (record 683, the Owner
ruling on record 680, measured in 679 / 681 / 682). Keep the existing §5.4 :440-441 citation.

## Verify before you hand back

Run, in this order, and report ACTUAL output for each:

1. `npx vitest run tests/p14b5-t-failure-tuning.test.ts --reporter=basic` — every group must now pass,
   including group 1, which was RED before your change.
2. `npx vitest run tests/p14b5-relationships.test.ts tests/p14b5-save-v31.test.ts tests/bridge-p14b5-relationships.test.ts --reporter=basic`
   — the landed B.5 suite. Every reference to the constant there is by NAME, so this is expected to
   stay green. If anything moves, that is the finding and you report it rather than repairing it.
3. `npm run typecheck` and `npm run typecheck:bridge` — both EXIT 0.

Do not run the full core suite; the parent owns that on fixed source, one heavy process at a time.

## Your handback

`685-W-report.md` in this folder: the exact diff (it should be tiny, quote it in full), the actual
output of all four commands above, anything that moved that you did not expect, and a plain statement
that you changed exactly one production file and no test. If any existing assertion broke, list every
one with file, line and the values, and DO NOT touch it.
