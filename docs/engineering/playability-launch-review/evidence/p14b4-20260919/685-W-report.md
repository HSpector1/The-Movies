# 685-W — writer report: P14B.5-T, `RELATIONSHIP_FAILURE_DELTA` 4 → 5

Authority: brief `685-W-tuning-writer-brief.md`, record 683 (the Owner's activated ruling 1 on
record 680). Source at start: `63688a79` on `wip/headless-program-20260916-ts`. Uncommitted, as
instructed — the parent lands commits.

## Files changed

**Exactly one production file: `src/core/relationships.ts`. No test, fixture, helper, bridge,
generated, ui or script file was touched.** `git status` also shows a pre-existing modification to
`docs/.../plans/P14-HEADLESS-PLAN.md` and several untracked records (683, 684-T ×2, 685-W brief,
687 draft, `tests/p14b5-t-failure-tuning.test.ts`); none of those is mine, all were present or
appeared outside this writer's edits.

`git diff --stat` for this writer's change:

```
 src/core/relationships.ts | 10 +++++++++-
 1 file changed, 9 insertions(+), 1 deletion(-)
```

The constant now sits at `src/core/relationships.ts:80` (it moved from :72 because the new doc
comment is eight lines above it). No version constant moved: `RELATIONSHIP_RULES_VERSION` is still
1, `LIVE_SAVE_VERSION` still 31, `PROJECTION_VERSION` still 48, and no migration was added.

## The diff, in full

```diff
diff --git a/src/core/relationships.ts b/src/core/relationships.ts
index 9f459e12..5d993e91 100644
--- a/src/core/relationships.ts
+++ b/src/core/relationships.ts
@@ -69,7 +69,15 @@ export const RELATIONSHIP_REPEAT_CAP = 3
  * (647-B ruling (ii) on OPEN 5): `RELATIONSHIP_FAILURE_DELTA > RELATIONSHIP_PROXIMITY_LOW`,
  * so a released flop nets a low-proximity pair below where it stood before the take. */
 export const RELATIONSHIP_SUCCESS_DELTA = 5
-export const RELATIONSHIP_FAILURE_DELTA = 4
+/** PROVISIONAL CANDIDATE TUNING, 4 → 5, not settled balance: a capped repeat cycle
+ * nets `RELATIONSHIP_PROXIMITY_LOW + RELATIONSHIP_REPEAT_CAP − RELATIONSHIP_FAILURE_DELTA`,
+ * so at 4 a repeatedly-flopping low-proximity pair still GAINED a point per picture and
+ * could never reach the Strained band; at 5 the cycle breaks even and the band opens.
+ * The pinned relation above still holds (5 > 2). Record 683 (the Owner ruling on record
+ * 680, finding 1 option (b)), measured in 679 / 681 / 682. Driver constant, not part of
+ * `RELATIONSHIP_RULES_VERSION`: it applies prospectively at write time and no stored
+ * `delta: -4` is restamped. */
+export const RELATIONSHIP_FAILURE_DELTA = 5
 /** §5.4 :445 "small". */
 export const RELATIONSHIP_CANCEL_DELTA = 2
 /** The release thresholds on `FilmResult.criticScore` (0..100, always present —
```

The existing §5.4 :440-441 / 647-B (ii) comment on the success-and-failure pair is kept verbatim
above `RELATIONSHIP_SUCCESS_DELTA`; the new block is additive and sits directly on the failure
constant.

## Record 683's "no version step" reasoning: checked, not disputed

The brief asked me to stop if I thought it wrong. I verified the two load-bearing claims before
editing and they hold on this source:

- `relationships.ts:31-36` documents `RELATIONSHIP_RULES_VERSION` as the TIER RULE revision (value
  bands plus the §5.3 evidence condition). The delta is not part of that rule.
- `validateRelationshipsRoot` (`relationships.ts:389-471`) validates a driver's delta with
  `integer(driver.delta, ...)` only — `Number.isSafeInteger`, no value pin, no sign pin. Every
  historical `delta: -4` stays valid unrestamped.

No disagreement; nothing was bumped.

## Commands run — actual output

`vitest` was invoked through the repository's own installed binary (`./node_modules/.bin/vitest`,
v2.1.9), which is the same binary `npx vitest` resolves to here and cannot fetch a package. Each
command was run alone, one heavy process at a time. The full core suite was NOT run (parent owns it).

### 1. `./node_modules/.bin/vitest run tests/p14b5-t-failure-tuning.test.ts --reporter=basic`

```
 RUN  v2.1.9 /Users/zacheryspector/The-Movies-headless-program

 ✓ |core| tests/p14b5-t-failure-tuning.test.ts (12 tests) 1600ms
   ✓ CONSTRUCTED group 5 — REPLAY AND IDEMPOTENCY on the real carrier world > the same advance from the same pre-state writes a byte-identical root, and a second advance over the same production id mints nothing twice 807ms
   ✓ NATURAL WORLD group 7 — one standard seed, what is TRUE and nothing more > the first natural shared failure stores exactly −RELATIONSHIP_FAILURE_DELTA and moves closeness by exactly that 495ms

 Test Files  1 passed (1)
      Tests  12 passed (12)
   Start at  17:58:01
   Duration  4.76s (transform 1.71s, setup 0ms, collect 2.41s, tests 1.60s, environment 0ms, prepare 164ms)

EXIT=0
```

12 passed / 0 failed, as the brief predicted. Group 1, RED before the change, is green.

### 2. `./node_modules/.bin/vitest run tests/p14b5-relationships.test.ts tests/p14b5-save-v31.test.ts tests/bridge-p14b5-relationships.test.ts --reporter=basic`

Tail (the run prints every passing case; nothing failed, so no failure block exists):

```
 ✓ |core| tests/bridge-p14b5-relationships.test.ts (15 tests) 64410ms
   ✓ family 12 — the R-D5 natural-chain LEDGER ... > p13a-core-causal-01: chain digests, row counts, churn rosters empty under D1, zero exposed rows through 416; the nine frozen drop templates only 12016ms
   ✓ family 12 ... > seed-b: ... 14836ms
   ✓ family 12 ... > p13b-s8-bridge-probe-01: ... 8061ms
   ✓ family 12 ... > p13-public-commercial-adoption: ... 5472ms
   ✓ family 12 ... > the MOST EXPOSED shared fixture, poachingFixture (p14b2-fixtures.ts :145-211 ...): the week-208 reasons pin and endedWeek 208 hold, and under D1 no survivor holds a shared-take counterpart 3462ms

 Test Files  3 passed (3)
      Tests  118 passed (118)
   Start at  17:58:11
   Duration  69.64s (transform 5.96s, setup 0ms, collect 10.08s, tests 149.40s, environment 1ms, prepare 751ms)

EXIT=0
```

3 files / 118 passed / 0 failed. Nothing moved. The 683 prediction holds: every reference to the
constant in this suite is by NAME, the family-4 staged pair still reads Strained (45 − 5 = 40 where
it read 45 − 4 = 41), and the four natural-chain D5 ledger seeds show the same zero exposed rows
and the same nine frozen drop templates.

### 3. `npm run typecheck`

```
> project-studio-core@0.1.0 typecheck
> tsc --noEmit && tsc -p ui/tsconfig.json --noEmit

EXIT=0
```

### 4. `npm run typecheck:bridge`

```
> project-studio-core@0.1.0 typecheck:bridge
> tsc -p tsconfig.bridge.json

EXIT=0
```

## Anything unexpected

Nothing moved that the brief did not predict. Two observations for the record, neither a defect:

1. `docs/engineering/playability-launch-review/evidence/p14b4-20260919/681-b5-closeness-floor-witness.ts`
   asserts the OLD law at :91, :96 and around :143-158 and would now fail if executed. Per the brief
   it is the frozen old-law witness: I did not open it for edit and did not run it. It is a
   `vite-node` evidence probe under `docs/`, outside the vitest globs, so no suite result depends on
   it — confirmed by run 2 and by both typechecks passing.
2. An untracked `687-p14b6-expansion-draft.md` appeared in this evidence folder during the run. Not
   written by this writer.

## Statement

I changed exactly one production file, `src/core/relationships.ts`: one constant value (4 → 5) and
one added doc comment. I edited no test, no fixture, no helper, no evidence probe, and I did not
commit. No existing assertion broke.
