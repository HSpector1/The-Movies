<!-- 1344-D2: re-review (contract-auditor, read-only) of shelving RED r2, saved verbatim by the parent from the agent's final text; saved late (after 1344-E), the omission noted in 1344-X4 -->

# Independent review 1344-D2

**Verdict: ACCEPT**

Re-review of the r2 shelving RED revision (`$E/1344-stage/1344-shelving-red-r2.patch`, sha256
`3575ee67…`, 1385 lines across four files) against my prior review (1344-D), the parent's response
(1344-F2), and the parent's independent dry run (1344-X3, `1344-X3-red-run.txt`: 51 leaves, 46
failed / 5 passed, 74.0s). I read the full r2 patch text (all four files, including every new/revised
leaf), the r2 classification JSON (51 rows, each carrying a `revision` field), and cross-checked
every failure/pass against the parent's independently reproduced run — they match exactly, leaf for
leaf. I also independently verified the one load-bearing arithmetic claim in the new partial-cashBlocked
test by grepping `hollywoodTick.ts` directly (below). As before, this is read-only static review; I
did not execute anything myself.

## 1. Both of 1344-D's blocking defects — closed

**Blocking 1 (searchIndustryPackages counts).** New `describe('searchIndustryPackages counts
contract (1344-D Blocking 1)')` block, `tests/p14d1-rival-shelving.test.ts:205-308` (file-internal
lines, post-apply). Two leaves:

- Leaf 1 (`:206-253`) uses exactly the spy technique I pointed at
  (`vi.spyOn(hollywoodPolicy, 'chooseIndustryPackage')` around a real `tick()` over the genuine
  week-130 fixture, filtered to `options.lockScreenplay===true && options.key.startsWith(...)`) to
  capture the real `(input, policy, options)` triple `decide()` builds — no reimplementation of the
  private `inputsFor()`. It derives the candidate-universe size from first principles
  (`permutationsOfThree()` — a brute-force generation of all 3! orderings, verified to match
  `hollywoodPolicy.ts`'s private `BILLINGS` exactly — × `TUNING.HOLLYWOOD_NEGATIVE_CHOICES.length` ×
  `marketingMenuFromCapacity(marketingCapacityForInputs(...)).length`, all real, already-exported
  symbols), self-checks it to 54 (a today-passing assertion, not RED-dependent), then asserts
  `searchIndustryPackages(...).choice` equals the real captured `chooseIndustryPackage(...)` result,
  `affordable+unaffordable === expectedCandidateCount`, `viable<=affordable`, and
  `(choice===null)===(viable===0)`. This directly satisfies MY own required-change wording almost
  verbatim, and improves on it (deriving 54 rather than accepting the literal).
- Leaf 2 (`:255-308`) is the partial-cashBlocked construction I said was missing. It replicates
  `chooseIndustryPackage`'s own cost formula over the *real captured* `(input, policy)` to get the
  real cost of all 54 candidates, derives `cashBetween` strictly between the real min/max, and sets
  `cash = reserve + cashBetween` using the real `rivalWeeklyOperatingCost(...) * reserveWeeks`
  formula. I independently verified the load-bearing arithmetic by grepping `hollywoodTick.ts`
  directly:
  `operatingReserve(b,h,week) = rivalWeeklyOperatingCost(b,h,week)*b.policy.reserveWeeks` (line 60)
  and `cashAvailable: b.account.cash - operatingReserve(b,h,week)` (line 229) — confirming
  `cashAvailable = cashBetween` at the next tick exactly as the test assumes. Since `cashBetween` is
  strictly between the real min and max cost, this genuinely produces a *mixed* week: at least the
  cheapest candidate clears the cash gate, at least the dearest is skipped by it — the precise
  "at least one candidate skipped by the cash gate" scenario 1344-A §3.1 describes, not the
  fully-degenerate all-skipped case r1 tested. "No affordable candidate is viable" is established
  logically (viability is cash-independent in `chooseIndustryPackage`'s score formula — I confirmed
  this by re-reading `hollywoodPolicy.ts`: `score`/`holdOperatingMargin` reference only
  `forecast`, `weeklyCost`, `policy`, never `cashAvailable`), from the real, law-independent
  `call.result===null` fact. Sound.
  Minor observation (non-blocking): the "no candidate becomes viable" conclusion is carried forward
  across 3 further ticks without being re-derived at each one; this is safe in practice only because
  1329-A's own measurement establishes the viability gate never binds on this exact seed/route
  through week 520 — an empirical property of the fixture, not something this leaf re-verifies
  in-line. Given the strength of that precedent, this is a nitpick, not a defect.

**Blocking 2 (rivalPromiseProjectCandidates / §6 item 7c).** New export
`talentMarket.rivalPromiseProjectCandidates(state, studioId): ScriptProject[]` (parent's 1344-X2
decision), with an existence guard (`tests/p14d1-rival-shelving.test.ts:196`) and a dedicated
`describe` block at `:776-798`:
- "a shelved screenplay is absent from the candidates" (`:780-788`) marks ordinal 6 shelved via
  `markShelved` and confirms its id is absent from the result.
- "with nothing shelved, the result equals the first two non-produced screenplays by id"
  (`:790-798`) asserts its own route premise explicitly first (`['script-0006','script-0011']`)
  before calling the missing export, so the expected value is derived from real fixture state, not
  invented.
Both are non-vacuous, direct tests of §6 item 7(c), closing the gap 1344-C had honestly disclosed
and deferred.

## 2. 1344-F2's non-blocking notes — addressed

**Test 3's second case (window narrowed 20→5 weeks, premise now asserted),
`tests/p14d1-rival-shelving.test.ts:523-561`.** The revision replaces the unasserted 20-week premise
with an explicitly-checked 5-week one (`clean = greenlitStudios \ stuckReadyStudios`, asserted
`.toBeGreaterThan(0)` before the field check). On the specific question of whether this is still a
*meaningful* control per Amendment 2: yes, but it is now a deliberately *minimal* instance. Per the
recorded trace, every rival's first screenplay greenlights with zero gap (same week it becomes
ready — week 3 for r01/r03, week 4 for r02/r04), and the earliest observed "stuck" event on any
rival's *second* screenplay is r03 at week 5 (inside the window, correctly excluding r03) while
r01/r02/r04's second-screenplay stalls only register from week 6-7 onward (outside the 5-week
window) — so at least one rival (e.g. r01) genuinely has zero stuck-ready events inside weeks 1-5.
This means the surviving "clean" case tests a business with exactly *one* viable evaluation
(an immediate first greenlight), not a sustained multi-evaluation clean run — a real but narrow
instance of "every evaluation is viable." That narrowness is an intrinsic, disclosed property of
this seed at short horizons (every rival's second screenplay genuinely stalls within a handful of
weeks), not a construction shortcut, and the test's own premise-check means a wrong assumption would
fail loudly rather than pass silently. Acceptable; non-blocking note only.

**Three new Save43 validator leaves, `tests/p14d1-rival-shelving-save-v43.test.ts:186-212`.** Count-0
rejection (`:186-192`), a rejection entry naming a non-active/non-ready (produced) ordinal
(`:194-200`), and a shelved entry with `retryWeek<=week` (`:202-212`). Each uses the same
content-specific `.toThrow(/pattern/i)` technique as the five pre-existing validator leaves,
confirmed genuinely failing against the generic "is not a function" message (not vacuous) in the
dry run. Each isolates exactly one violated invariant (verified below under item 5). These close
three validator-boundary gaps I flagged as non-blocking notes in 1344-D.

## 3. The revised leaf and relocated helper — behavior scope confirmed

`markShelved` moved from a closure local to the `shelving-retry` describe block to file scope
(`tests/p14d1-rival-shelving.test.ts:136-159`). I byte-compared the function body against the r1
patch's version: identical, only re-indented one level shallower from the relocation. The five
`shelving-retry` leaves (`:1117-1216`) are unchanged call sites with identical bodies to r1, and the
dry run reproduces identical pass/fail outcomes and reasons for all five — confirmed non-behavioral.
The one revised leaf (test 3 case 2) intentionally changes behavior in exactly the way 1344-F2
authorized (asserts its own premise); the accompanying window narrowing is a disclosed, justified
implementation detail matching 1344-D's own non-blocking suggestion, not an unauthorized scope
change.

## 4. Every leaf fails at RED for the right reason

Cross-checked all 51 rows of `1344-shelving-red-r2-classification.json` against
`1344-X3-red-run.txt` — identical leaf names, pass/fail status, and failure text throughout; no
discrepancy. All 8 new leaves fail for genuine, content-specific reasons (confirmed by reading each
leaf's source: two `TypeError: ... is not a function` after real, passing premise checks; a
`typeof` mismatch for the new export guard; two `candidatesOf(...) is not a function`; three
content-specific `.toThrow(pattern)` mismatches).

On the specific retry-leaf question: `shelving-retry > a viable retry re-enters the slot and
greenlights...` still crashes inside `productionIdentity.ts:111`'s exhaustive switch (unchanged
from r1). I re-confirm this is the *right* RED reason and does not hide the leaf's real assertions.
The four downstream assertions (`activeScriptOrdinals contains 0`; shelved entry removed; a
`filmAnnounced` receipt fired; status is `inProduction`) are substantive and unmodified; they simply
haven't executed yet because a genuine, required precondition — 1344-A §2's own cited fact that
`productionIdentity.ts`'s switch must gain a `screenplayShelved` case — hasn't been met. GREEN must
add that case regardless (it's required by the charter independent of this test), and once it does,
these four assertions become live and will genuinely exercise the retry-viability logic. This is not
a masking defect.

## 5. Hand-built state in the new leaves — validator-consistent, no index/ordinal splices

Checked every hand-built mutation in the 8 new leaves against the charter's §4 invariants:
- Partial-cashBlocked (`:280-308`): mutates only `account.cash` for r01 — a scalar field, no
  index/ordinal touched.
- `rivalPromiseProjectCandidates` "shelved absent" leaf: uses the already-verified `markShelved`
  helper (correctly removes the ordinal from `activeScriptOrdinals`, appends exactly one matching
  receipt at the same week, sets `retryWeek>week` — all validator-consistent, re-confirmed
  identical to my 1344-D review of the same helper).
- The three new validator leaves each isolate exactly one violated invariant while leaving every
  other invariant satisfied: count-0 leaf keeps ordinal 6 active/ready with a matching route premise
  assertion; the non-active/ready leaf keeps ordinal 0's untouched `activeScriptOrdinals`
  membership (naturally absent, since it's genuinely `produced` in the base fixture) and targets
  only the rejection-entry/status mismatch; the `retryWeek<=week` leaf removes ordinal 6 from
  active and appends a real matching receipt (satisfying the missing-receipt and duplicate-receipt
  bullets), isolating only the retry-week bound. No leaf bypasses `activeScriptOrdinals`/ordinal
  consistency in a way that would make its own premise invalid or trip the real validator for an
  unintended reason.

## Non-blocking notes (carried forward / new)

- searchIndustryPackages leaf 2's "still non-viable" inference is carried across 3 ticks without
  re-derivation; safe only because of 1329-A's strong precedent for this exact seed (see above).
- Test 3 case 2 is now a minimal (single-greenlight), not sustained, instance of "every evaluation
  is viable" — an honestly disclosed, seed-intrinsic limitation, not a defect.
- My prior non-blocking note about diffing GREEN's actual field/kind shapes against the tests' local
  future-shape casts (tsc cannot catch a name drift) is restated verbatim in 1344-F2 and should carry
  into the implementation review.

## Next concrete action

No further RED revision needed. Proceed to GREEN production per 1344-A §8 step 4 (sim-core writer):
chooser search / law / receipt / validation / save / reader changes, then the version sweep
(1344-M, still not yet recorded per my 1344-D check — worth the parent confirming it's tracked before
that step), then the §7 verification and implementation review. The implementation review should
specifically diff production's `screenplayShelving`/`IndustryReceipt` shapes against this suite's
local future-shape types, and confirm `productionIdentity.ts`'s new case resolves the retry-leaf
crash cleanly.

## Files referenced

- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-stage/1344-shelving-red-r2.patch`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-stage/1344-shelving-red-r2-classification.json`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-C2-shelving-red-revision.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-F2-parent-response-to-1344-D.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-X3-shelving-red-r2-dry-run.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-X3-red-run.txt`
- `/Users/zacheryspector/The-Movies-headless-program/src/core/hollywoodTick.ts` (lines 60, 229, 274-278 — independently verified `cashAvailable = cash - reserve` formula)
- `/Users/zacheryspector/The-Movies-headless-program/src/core/hollywoodPolicy.ts` (re-confirmed viability score is cash-independent)
