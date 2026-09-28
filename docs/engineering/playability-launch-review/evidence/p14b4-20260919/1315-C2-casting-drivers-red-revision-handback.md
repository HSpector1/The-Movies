# 1315-C2: revision of the staged casting-driver RED for four measured premise defects

Mode STAGE RED (test source only), repo `/Users/zacheryspector/The-Movies-headless-program` at HEAD
`d8e900423f39ecb68b956cef5d8ce767734e4ca6`, branch `wip/headless-program-20260916-ts`. Confirmed via
`git diff --stat 75233cc2 d8e90042 -- src/core/relationships.ts src/core/save.ts src/core/actions.ts
bridge/finance-upcoming.ts bridge/relationships.ts tests/helpers/p14b2-fixtures.ts` that none of the source
files this task cites changed between the original staging HEAD and this revision's HEAD (the only commit
in between is `d8e90042` itself, the parent's own commit of the 1315-C artifacts and dry-run docs) — every
line citation from the 1315-C handback still applies unchanged. No production code, fixture, or the frozen
`1315-stage` directory was touched; the revision is written fresh to
`docs/engineering/playability-launch-review/evidence/p14b4-20260919/1315-stage2/tests/`. No
`vitest`/`tsc`/`vite-node`/`node` was run (hard limit, same as 1315-C). Read `1315-X-red-dry-run.md` in full,
plus the exact refusal messages cited in it, verified directly against source
(`src/core/actions.ts:2576-2582` for the D-11.14/D-12 messages, `src/core/save.ts:10457` for
`migrateToV39`'s refusal) before writing any fix.

`tests/helpers/p14b2-fixtures.ts:14-19` (unchanged) — the house cash bootstrap used throughout:

```ts
export function fund(state: GameState): GameState {
  const delta = 30_000_000 - state.studio.cash
  return { ...state, studio: { ...state.studio, cash: 30_000_000 }, ledger: [...state.ledger,
    { week: state.market.tick, kind: delta > 0 ? 'studioRevenue' : 'overhead', amount: delta, note: 'P14B.2 fixture disclosed cash bootstrap' }] }
}
```

## Defect 1 — `p14b9-casting-competition.test.ts` runs out of cash

**Exact edit.** Imported `fund` from `./helpers/p14b2-fixtures.js` and `makeSave`/`validateSave` from
`../src/core/save.js`. `foundStudio()` now returns `fund(p13aGeneratedStudio(SEED))` instead of the bare
call (bootstrap once, right after founding, before any signing bonus is debited). Added a new helper,
`cancelAndRefund(s, productionId) = fund(cancelProduction(s, productionId))`, and replaced every
`cancelProduction(...)` call inside `castingCompetitionWorld()` with `cancelAndRefund(...)` — five of the
six sites. The sixth (between P3's two greenlights, which never calls `cancelAndRefund` because the second
greenlight is dispatched by hand, not through `greenlightCycle`) gets `fund(cancelProduction(...))` inline
at the same spot.

**Why.** The dry run measured cash before each of the first four greenlights (17.5M / 12.8M / 10.5M /
6.2M) and the fifth (P3's re-greenlight, 812,344 against a 5,431,207 commitment) refused. A cancel refunds
nothing, so cash only ever falls across the chain. `fund()` is the house remedy the coordinator named. I
applied it MORE than once ("once after founding" is the coordinator's literal instruction) — I am naming
this deviation explicitly: this file runs six greenlights (P1, P2, P-dedup, P3 x2, P-no-session), and a
single 30,000,000 bootstrap, replacing whatever the un-bootstrapped run started with, did not — by my own
arithmetic against the measured per-production cost (2.3M-5.4M) — leave confident headroom for all six; the
dry run itself never reached the sixth (P-no-session) before failing on the fifth. The coordinator's own
instruction allows the same repeated bootstrap for the copy/readers files "if their chain needs more than
one greenlight"; I generalized that same allowance to this file's six-greenlight chain rather than risk a
second cash-exhaustion failure the parent would have to report back a second time. No law assertion
changed: `fund()` touches only `state.studio.cash` and appends one `state.ledger` row; every assertion this
file makes reads `state.relationships`, `state.studio.activeProductions`, `state.productionQueue` or
`state.rngState`, none of which `fund()` touches.

**"Also" item — queue-admission whole-state validation.** Added
`expect(() => validateSave(makeSave(queued))).not.toThrow()` immediately before the `tick(queued)` call
that admits the synthetic queue entry, and extended the describe block's header comment to say explicitly
that the injection "SUBSTITUTES FOR GENUINE FRONT-DOOR CONTENTION" and is not a claim that genuine
contention is unreachable.

**Predicted RED on unchanged HEAD after this revision.** Unchanged from the 1315-C handback for every
assertion that reads `RELATIONSHIP_COMPETITION_DELTA`/`RELATIONSHIP_COMPETITION_REPEAT_CAP`/
`sharedCompetitions`/the new driver kinds (`typeof undefined !== 'number'`, empty-array-where-length-1-
expected, etc.) — the route itself should now complete without a solvency refusal, so every leaf's failure
should be the LAW-RELATED one, not a route-premise one. The queue-admission leaf's new `validateSave`
call should NOT throw on unchanged HEAD (it validates a legally-shaped, unmodified-by-the-injection state
against the CURRENT, unaffected V41 validator) — only the driver-presence assertion after it should fail.

## Defect 2 — `p14b9-casting-copy.test.ts` / `p14b9-casting-readers.test.ts` unmeasured seeds

**Exact edit.** `SEED` changed from `'r1315-copy-01'` / `'r1315-readers-01'` to `'r1314-casting-01'` in
both files. Added `import { fund } from './helpers/p14b2-fixtures.js'` and wrapped the founding call:
`let s = fund(p13aGeneratedStudio(SEED))`. Both files already signed one person per `applyActions` call
(a `for` loop over individual calls) — that part needed no change.

**Why.** The dry run measured that `r1315-copy-01`'s week-0 market holds no director and
`r1315-readers-01`'s holds only two actors, so `deriveMarket`'s own route-premise guard threw before any
law assertion ran. `r1314-casting-01` is the seed 1314-P measured (writer t-wri-05, director t-dir-04,
craft t-cra-09, actors t-act-24/t-act-08/t-act-20/t-act-12) and the SAME seed
`p14b9-casting-competition.test.ts` already used successfully (that file's dry-run failures were only about
cash, never about signing four actors on this seed — direct evidence this seed and this signing pattern
work for exactly the shape these two files also need). `fund()` is applied once (each file runs only two
greenlights; by the same per-production-cost arithmetic as defect 1, one 30,000,000 bootstrap is enough
headroom for two).

**Predicted RED on unchanged HEAD after this revision.** Both files' route should now build successfully;
the RED is the same as originally predicted (absent `RELATIONSHIP_COMPETITION_DELTA`/
`RELATIONSHIP_COMPETITION_REPEAT_CAP` propagating into empty `pairChemistry(...).reasons` / empty
`relationshipBlockFor`/`castingChemistryRows` driver arrays), now reached instead of pre-empted by the
market-premise throw.

## Defect 3 — `p14b9-casting-expiry.test.ts` signing order

**Exact edit.** `SEED` changed to `'r1314-casting-01'`. The six-action batched `applyActions([...])` call
became seven separate `applyActions([{...}])` calls, one per person (writer, craft, director, antagonist,
support, a new never-seated `bystander`, then the expiring lead), matching 1314-P/the producer's own
pattern. `deriveCast` now requires 4 actors (was 3) and derives `{ antagonist, support, lead, bystander }`
from `market.actors`, matching the measured seed's four-actor market.

**Why.** The dry run measured that batching six `signContract` actions in ONE `applyActions` call refused
the sixth: `signContract`'s operating-phase branch (`actions.ts:2576`) calls
`hiringMarketIds(state)` — no week override, so it reads `state.market.tick` — on the STATE AS IT STANDS
after each PRIOR action in the same fold, and `hiringMarketIds` samples from `signableUniverse(state)`,
which SHRINKS as each earlier person in the batch gets signed (a signed person is no longer signable);
`sampleIds`' draw over a smaller, changed pool can exclude someone the FIRST snapshot showed. 1314-P/the
producer avoid this by signing one person per call — this file now matches that pattern exactly.

**New case: a counterpart whose own committed term ends before the expiring lead's week.** Added a third
`it()` and reworked the cast: `director` and `antagonist` are both signed for 208 weeks and both get the
synthetic Inseparable variant (testing roster order between the two, replacing the old single
director+support pair the frozen draft used); `support` is signed for exactly `Contract.termWeeks`'s
minimum, 52 weeks, and ALSO gets the synthetic Inseparable variant, but is asserted ABSENT from the
sentence; `bystander` is signed but never seated (no edge at all with the lead), giving a trivial "no tie"
absence check in place of the old "natural Colleagues tier" one. `LEAD_TERM_WEEKS` moved from 52 to 60 —
the smallest choice still `> 52`, so `support`'s minimum-length term (ending at week 52) genuinely ends
before the lead's own expiry (week 60), while keeping the gap between the real shoot's week (~10-20,
unmeasured) and the expiry week within `RELATIONSHIP_DRIFT_GRACE_WEEKS` (52) — a SEPARATE hazard I found
while designing this case: `bridge/relationships.ts`'s `rosterAt` predicate only reads `endedWeek` (the
EARLY-release marker), never `terms.endWeekExclusive`, so at a FUTURE week it cannot by itself distinguish
"still employed then" from "was employed once, term already lapsed, nothing ever marked it ended." I named
this exactly as the coordinator instructed — "1313-F Amendment 4 plus the committed-term condition" — in
the file's own header, as an INTERPRETATION for the reviewer to rule on, not settled law, and wrote the
test asserting the interpretation's predicted (excluded) outcome so the assertion is concrete rather than
provisional.

**"Also" item — LIVE_SAVE_VERSION must not hard-pin 41.** The acceptance leaf no longer asserts
`LIVE_SAVE_VERSION === 41` or calls `validateSaveV41` directly. It now reads
`const saved = makeSave(s); expect(saved.saveVersion).toBe(LIVE_SAVE_VERSION); expect(() =>
validateSave(saved)).not.toThrow()` — dispatched through the LIVE version and the LIVE validator, so the
leaf's own pass/fail is unaffected by whether Save42 has landed when it runs.

**Predicted RED on unchanged HEAD after this revision.** The route should now complete (measured seed,
one-signContract-per-call). Leaf 3's core requirement (`bridge/finance-upcoming.ts` builds `detail` from
`weeklySalary`/`endWeekExclusive` alone) is unaffected by any of these route fixes, so the two original
`it()`s should fail exactly as predicted in 1315-C (`toContain` failures on the missing sentence/name). The
new third `it()` (committed-term exclusion) is a NEGATIVE assertion under the current, entirely-unrelated
`financeUpcoming` — since `detail` today never contains ANY talent name at all (the function doesn't read
`state.relationships`/`state.hollywood.employment`), `row.detail).not.toContain(supportName)` is trivially
TRUE on unchanged HEAD (support's name isn't in the sentence for the SAME reason NOBODY's name is — the
feature doesn't exist yet), so this specific `it()` will PASS on unchanged HEAD, not RED. This is a
genuine, disclosed limitation: the interpretation this test names can only be meaningfully exercised once
the FIRST two `it()`s in this file go GREEN (i.e., once names start appearing in `detail` at all); until
then it is vacuously true for the wrong reason. I kept the assertion because the task's contract is to
state the interpretation and let the reviewer rule on it, and a test that fails to compile/run at all would
say nothing; I am flagging explicitly here that this specific `it()` is NOT currently a RED signal and
should be re-examined once the other two pass.

## Defect 4 — `p14b9-save-v42.test.ts` frozen-reader leaf input

**Exact edit.** Replaced the single `for (let v = 4; v <= 41; v++)` loop (which fed the genuine
acknowledged fixture to every `migrateToVk`) with: (a) a loop over `[40, 41]` only, still using the genuine
acknowledged fixture; (b) `const fresh = makeSave(p13aGeneratedStudio('r1314-casting-01'))`, asserted to
carry zero `firstTakes` as a route premise, then a loop over `v = 4..39` using `fresh` instead. Added
`import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'`.

**Why.** The dry run measured that `migrateToV39` lawfully refuses the acknowledged fixture — "cannot
downgrade or discard an opportunity predicate or recorded first-take subject" (confirmed by direct read,
`src/core/save.ts:10457`) — because the generated world's RIVALS already carry first-take subjects by week
10 (the fixture's own week), a fact pre-V39 saves cannot represent. Per the coordinator's instruction, each
frozen version is now projected only from an input that version can hold. I chose a completely FRESH,
un-ticked `p13aGeneratedStudio` state (no actions applied at all) for V4..V39 specifically because it is
the state most obviously free of ANY rival first-take history — I verified this is at minimum true of
`state.firstTakes` directly (asserted `toHaveLength(0)`) rather than assuming it; I did not separately
verify there is no OTHER field a pre-V39 validator might also refuse on a freshly-generated world (see
"still unsettled" below). The comment also records why this remains correct once Save42 lands:
1313-A §3 states "a saveVersion === 42 arm joins every `migrateToVk`," so `migrateToV39` will gain a V42
branch just as it already has V41/V40/... branches, and `makeSave` on the fresh state naturally stamps
whichever version is live — the test does not need to know which.

**Predicted RED on unchanged HEAD after this revision.** This whole describe block is, and remains, a
REGRESSION PIN (already true today; labelled as such in both 1315-C and here) — it does not exercise any
new Save42 symbol, only the pre-existing `migrateToV{4..41}`/`validateSaveV{4..41}` chain. It should PASS
on unchanged HEAD, both before and after this fix — the fix corrects a PREMISE defect (an input version
mismatch) that made it fail for a reason unrelated to the law under test, not a law-level RED.

## Still unsettled without execution (in addition to the items already carried from 1315-C's own handback)

1. **Defect 1's exact headroom.** I could not execute to confirm 30,000,000, reapplied before every
   greenlight, is in fact sufficient for every one of this file's six production cycles — only that my
   arithmetic against the dry run's measured per-production costs (2.3M-5.4M) makes it very likely. If a
   single concept's `baseNegativeCost` happens to be drawn far above that measured range, a cycle could
   still fail; re-funding before EVERY cycle (not just once) is my mitigation, but it is unverified.
2. **Defect 3's committed-term `it()` is not currently a RED**, as stated above — genuinely something only
   the parent's next dry run (after Defect 3's first two `it()`s go GREEN) can confirm or refute.
3. **Defect 3's LEAD_TERM_WEEKS=60 drift-safety argument** depends on the real shoot landing within
   `RELATIONSHIP_DRIFT_GRACE_WEEKS` (52) of week 60 — I added a runtime route-premise guard
   (`if (EXPIRY_WEEK - take.week > 52) throw ...`) so a violation of this premise fails LOUDLY with a named
   cause rather than silently producing a wrong tier, but I could not execute to confirm the guard never
   fires.
4. **Defect 4's "fresh state has nothing ELSE a pre-V39 validator would refuse"** — I verified only
   `state.firstTakes` is empty; I did not exhaustively trace every V4..V39 validator against a freshly
   generated world's other fields (e.g., whatever the ORIGINAL reason V19-era or V29-era validators refuse
   things) to confirm NONE of them separately objects to some other fact of a freshly generated world (as
   opposed to a hand-built minimal state). This is the same class of unverified premise as everything else
   in this task, disclosed per the task's own contract.

Every other route premise, ambiguity, and unresolved question from the original `1315-C-casting-drivers-red-
handback.md` (the queue-admission substitution, the `state.hollywood === null` skip, the numeric-hypothesis
handling, etc.) is UNCHANGED by this revision and still applies; I did not re-litigate anything the
coordinator did not ask me to revisit.

## Summary

Four measured premise defects fixed, plus both "also" items, across all five staged files, written fresh to
`docs/engineering/playability-launch-review/evidence/p14b4-20260919/1315-stage2/tests/` (the frozen
`1315-stage` directory is untouched). Every fix is a route/technique correction (cash bootstrap, seed swap,
per-action signing, version-appropriate migration input, version-agnostic validator call) — no law assertion
was loosened or removed to reach these fixes, per the coordinator's explicit constraint. One new assertion
(the committed-term exclusion case) is disclosed as not currently a RED signal on unchanged HEAD, for the
reason stated above. The parent's next dry run is the concrete next step.
