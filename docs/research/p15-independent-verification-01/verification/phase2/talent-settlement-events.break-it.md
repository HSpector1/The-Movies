# BREAK-IT Adversarial Verification — `talent-settlement-events.md`

**Lens:** adversarial game designer + economist. **Verdict: REFUTED_IN_PART.** Code-citation
fidelity is excellent (every citation I spot-checked resolved to the exact line and matched the
quoted behavior) and the Part 2 notification design is sound, but Part 1's central mechanism —
"closure ends everything, the estate incurs no further obligation" — has a load-bearing gap that
the shipped code proves is real: nothing in the recommendation stops a "closed" rival's business
object from continuing ordinary weekly staffing, screenplay commissioning, and production
greenlighting forever, because the one loop that runs all of that (`advanceHollywoodWeek`) has no
status check anywhere, and the analysis's own §2.9 (which purports to be an exhaustive list of
"additive roots and validator changes required") never names it. A second, independently
demonstrable bug sits in the proposed V20 migration. Both are fixable in one sentence each; the
rest of the document mostly stands.

---

## CONFIRMED PROBLEM 1 (critical) — no gate stops a "closed" business from operating forever

**Claim in the analysis:** §2.6 — "once the fixed settlement receipt commits... the studio's
account stops mutating — no further payroll, no further obligation, nothing owed"; §2.9's table
purports to enumerate every "additive root and validator change required" for direction H, closing
with "the 10-identity invariant... and the 'businesses = entered rivals' invariant... continue to
hold unmodified, because closure is expressed as a status *alongside* an unchanged identity/business
record, never as a removal."

**Why it's wrong:** the analysis is correct that the business record can't be removed
(`hollywoodValidation.ts:331` requires exactly one business per entered rival, forever — removing one
would fail `'entry missing business'`), but it never draws the consequence: that business object
therefore stays in `h.businesses` and keeps getting iterated by
`advanceHollywoodWeek`'s `for (const b of h.businesses) { ... }` loop
(`hollywoodTick.ts`, function starting ~line 213) **every week, unconditionally, forever** — there
is no `if (closed) continue` or status check anywhere in that function, in `staff()`, or in
`decide()`. Concretely, with no new gate:

- `staff()` (`hollywoodTick.ts:85-137`) runs its full six-`RIVAL_TEAM_ROLES` role-fill loop for
  *every* business every week. Since the closure transition ends all of that studio's employment
  intervals, `own=currentEmployees(...)` is empty and every role reads as vacant — so `staff()`
  will generate/hire a **brand-new six-person roster from scratch the very next tick**, sign fresh
  contracts, and pay fresh signing bonuses out of `b.account.cash` (whatever residual balance is
  left). This directly contradicts direction H ("failed studio's talent → free agency"; the failed
  employer never signs anyone again) and the analysis's own §2.6 ("none, after settlement").
- `decide()` (`hollywoodTick.ts:140+`) would keep commissioning new screenplays and greenlighting
  new productions against that same fabricated staff, spending `b.account.cash` on `development`/
  `production`/`marketing` — new obligations the estate has, by the analysis's own definition
  (§2.3), no right to make.
- The unconditional per-business overhead/facility debits
  (`moveRivalMoney(b.account,'overhead',-(TUNING.OVERHEAD_BASE+...),week)` and
  `...'facilityOpex',-rivalCapacityOpex(b),week)`, both inside the same loop) would keep firing too
  — `OVERHEAD_BASE` is a flat weekly charge independent of employee count, so even a business with
  *zero* remaining contracts still bleeds cash weekly under the current code, which is exactly the
  "further obligation" §2.6 says should not exist.

This also collides with the analysis's own estate-completion recommendation (§2.3): the *same* loop
that must be gated off for staffing/greenlighting is the *same* loop that must stay on for the one
committed in-flight production (`advanceManagedProductions`) and the one open run (the
`b.runs` payout block later in the same function) to finish naturally. A blanket "skip this business
entirely once closed" would break §2.3's own estate-completion promise; doing nothing (the
document's current state) breaks §2.6. The document never notices the tension exists.

**Smallest fix:** add one row to §2.9: `advanceHollywoodWeek`'s per-business block gates on
`studioOperatingState[b.studioId]?.status !== 'closed'` around exactly two calls — `staff(...)` and
the `decide(...)` invocation — while leaving `operateStage`, `advanceManagedProductions`, and the
`b.runs` payout loop unconditional (so an already-committed production/run still completes), and
zeroing the `overhead`/`facilityOpex` movements for a closed business with no active production/run
remaining (or, more simply, once its `b.productions` and `b.runs` are both empty). That is a
one-line guard at each of two call sites plus a one-line conditional on the two flat debits — not a
restructuring — but it is a real code change this document needs to name, and currently doesn't.

---

## CONFIRMED PROBLEM 2 (high) — the proposed V20 migration mis-states every not-yet-entered rival as "active"

**Claim in the analysis (§2.9, Migration row):** "`convertV19ToV20` initializes
`studioOperatingState` with every identity `'active'` and no invented pre-migration distress/closure
history... [m]irrors `initializeHollywood(state,'migration')`'s existing no-backfill discipline
(`hollywood.ts:111-136`)."

**Why it's wrong:** I read `hollywood.ts:111-136` — the exact function the analysis cites as its own
precedent. It does the *opposite* of what the analysis proposes: on migration, rivals whose
`eligibleWeek > state.market.tick` get `enteredWeek: null` and **no business object at all**
(`enterRival` is only invoked `if (identity.eligibleWeek <= state.market.tick)`, `hollywood.ts:128-130`).
A save migrated at, say, week 500 (before the 1930/1939/1950/1956/1969 entrant waves) legitimately
has several of the ten `StudioIdentity` rows with `enteredWeek === null` — they have not entered the
industry yet and have no `RivalBusiness`. Marking `studioOperatingState[studioId] = {status:'active',
...}` for **every** identity, as the analysis specifies, would assert that a rival is "active" (i.e.,
operating) before it has ever been founded — a fabricated, invented-history claim (binding law 7,
which the analysis itself invokes for this very row) about a business that does not yet exist. This
is not a hypothetical edge case; it is the *normal* state of most migrated saves, since the entrant
schedule stretches from week 0 to week 2548 (1969).

**Smallest fix:** key `studioOperatingState` only by identities with `enteredWeek !== null` at
migration time (mirror the filter already used everywhere else in this codebase for exactly this
purpose — `hollywoodValidation.ts:331`, `bridge/industry.ts`'s `h.identities.filter(s=>s.enteredWeek
!==null)`), and populate a not-yet-entered rival's entry lazily inside `enterRival` going forward
(set to `'active'` at the moment it actually enters), never in the V20 backfill loop.

---

## PLAUSIBLE PROBLEM 3 (medium) — cancelling an in-progress screenplay strands its writer mid-task, contradicting the game's own D-11.9 precedent

The worked example (rows 9-10) cancels two screenplays "in development" at closure and treats this
as costless and unproblematic because "development spend already sunk... is non-refundable." But
`applyReleaseTalent` (`actions.ts:2694-2707`) — the player's *voluntary* early-release action —
explicitly **refuses** to release a talent who "is [a writer] and must finish that screenplay task
first" (an active `activeScriptWriterAssignments` claim exists for exactly this reason: the engine
already treats "a writer with an in-progress draft" as protected, uncancellable-mid-task work for a
*solvent* employer). The analysis's rows 9-10 assume the opposite for an *insolvent* one — the
screenplay (and implicitly the writer's task) is simply cancelled — without ever citing or
reconciling the D-11.9 precedent it directly contradicts. That may well be the *correct* call
(insolvency is exactly the case where the normal courtesy doesn't apply), but the document presents
it as if there were no tension to resolve, when a real one exists between "protect in-progress
creative work" (an existing, cited design value) and "cancel undeveloped commitments for free."

**Smallest fix:** one sentence in §2.3: "D-11.9's 'finish the screenplay first' guard is a
solvent-employer courtesy on a *voluntary* action; it does not, and should not, bind an *involuntary*
closure — the writer's own remaining stake in the draft is the same non-refundable sunk cost as the
studio's, and forcing the estate to fund a screenplay to completion would be a new, uncommitted
financial commitment exactly of the kind §2.3 elsewhere forbids." Without that sentence, a future
implementer who greps for `activeScriptWriterAssignments` will find a live invariant this design
appears to silently violate and will not know whether that's intended.

---

## PLAUSIBLE PROBLEM 4 (medium) — §12.3's idempotency/atomicity requirement is never addressed (bears directly on the "mid-settlement save/load" edge case)

P15-PACKAGE §12.3, which the analysis cites as its own authority for "P12 commits the registry
transition only inside the same validated candidate," continues in the very same paragraph: **"Duplicate
requests return the existing manifest/receipt, and one failed participant leaves every root
unchanged."** §2.9 never engages with this. Concretely: what happens if the closure transition
(ending N contracts, cancelling M screenplays, emitting `studioClosed`) is requested twice — e.g. a
save is taken mid-tick-pipeline and reloaded, or an orchestrating action is retried after a partial
apply? The document assumes the whole thing is one atomic write (plausible, given this engine's
synchronous-reducer architecture) but never states it, never names which single action/function
boundary the transition is scoped to, and never says what a second `studioClosed` attempt against an
already-closed studio should do (the closed-union receipt table already forbids a duplicate
`eventId`, but that's a different guarantee than "a duplicate *request* is a no-op that returns the
original receipt," which §12.3 explicitly requires).

**Smallest fix:** one sentence stating the closure transition is implemented as a single synchronous
state transition (like `applyReleaseTalent`) so no genuinely "half-closed" save state can exist, plus
a one-line re-entrancy rule: "a closure request against a studio whose `studioOperatingState` is
already `'closed'` is a no-op that returns the existing `studioClosed` receipt, not an error and not a
second receipt."

---

## PLAUSIBLE PROBLEM 5 (medium) — symmetric zero-severance creates a "convenient bankruptcy" incentive for the player half of the design

Part 2's tier table explicitly extends the same zero-severance/write-down rule to a *future* player
closure ("the player's own settlement record... same fact set as above, plus the player's own
remaining obligations written down"). But the player already has a costed, *voluntary* alternative —
`releaseTalent`, at 50% of the remaining guarantee (`tuning.ts:391`, `HIRING_TERMINATION_FRACTION:
0.5`). If closure ever writes the same remaining guarantee down to **zero**, a player carrying one or
more expensive, long (up to 208-week) guaranteed contracts they regret has a rational incentive to
let their studio slide into the terminal state rather than pay the 50% buyout — "bankruptcy" becomes,
from a pure contract-economics standpoint, a *cheaper* way to shed unwanted long guarantees than the
tool built for exactly that purpose. Direction E requires bankruptcy to arrive only after "meaningful
warning and recovery," which is a real safeguard against this being *costless* — the studio itself is
presumably lost or a real setback — but the analysis doesn't acknowledge the interaction at all, and
it directly touches `player-failure.md`'s territory (not reviewed here) without cross-referencing it.

**Smallest fix:** one sentence noting this interaction as a dependency for whichever document settles
the player terminal structure (`player-failure.md` / a future Owner ruling): the player-closure
zero-severance rule is only safe if the terminal state itself is unambiguously worse for the player
than paying every outstanding buyout would have been (never a rational cost-minimization play).

---

## MINOR — cross-document scale inconsistency (worth a coordination note, not a defect in this document)

This document correctly derives, from `hollywood.ts:98-105`, that a rival has exactly **one**
Production Stage (so at most one production in flight, plus rarely one prior release still
finishing) and a single-digit total roster — and uses this to correct direction H's own illustrative
"3 productions affected" language (§5, a good, honest catch). `ma-auction.md`'s Scenario C ("LARGE
FAILED RIVAL... 20 employees, 3 active projects") and its own mock notice ("20 contracted
professionals... 3 productions affected") directly contradict that same capacity ceiling for a rival
of any age. Since this document has the more carefully-sourced capacity citation, the boundaries/
critic pass should reconcile the two rather than let both stand as if a rival could plausibly reach
20 staff and 3 concurrent productions at 592e926's shipped capacity model.

## MINOR — `employerClosed`'s validator disjunct has no ledger cross-check, unlike `termination`

The proposed third disjunct at `hollywoodValidation.ts:357-358` (`r.reason==='employerClosed' ⇒
studioClosed receipt exists ∧ r.week ≤ endWeekExclusive`) carries no ledger-consistency requirement,
unlike `termination`'s mandatory `state.ledger.some(row=>row.kind==='termination'&&...)` match
(`:394-395`). That is correct and necessary for rivals (no ledger exists), but if `employerClosed` is
ever fired for the **player** role (Part 2 anticipates this), the validator as specified would not
verify that the player's books show zero severance paid — an under-specified gap, not a bug, since no
player-closure ledger entry is proposed either way. Worth one clarifying sentence in §2.9.

## MINOR — simultaneous mass free-agency dump is a legible rich-get-richer snowball vector

§2.5 correctly punts "who gets first access to the newly free talent" to P14/M&A, but never names the
underlying economic shape of the problem it's punting: a bankruptcy dumps an entire roster (up to 6+
people) into free agency in the **same week**, which — absent any staggering — favors whichever
surviving studio has the most idle cash at that exact moment (typically the wealthiest), a classic
compounding-advantage dynamic. Worth naming explicitly as a remaining open question for whichever
package settles free-agency competition, rather than leaving the risk fully implicit.

---

## Arithmetic recompute (task requirement: at least 3 rows)

All six contract-week rows in the §2.7 worked table were recomputed independently
(`endWeekExclusive − startWeek` should fall in the valid `termWeeks` range 52-208 per
`types.ts:341`):

| Row | Start wk | End wk (stated) | Computed term | Valid (52-208)? |
|---|---|---|---|---|
| 1 (Director) | 850 | 1058 | 1058−850 = **208** | ✓ |
| 2 (Writer) | 792 | 1000 | 1000−792 = **208** | ✓ |
| 3 (Lead) | 900 | 1108 | 1108−900 = **208** | ✓ |
| 4 (Antagonist) | 950 | 1158 | 1158−950 = **208** | ✓ |
| 5 (Support) | 792 | 1000 | 1000−792 = **208** | ✓ |
| 6 (Craft) | 844 | 1052 | 1052−844 = **208** | ✓ |

No arithmetic errors found — every row is internally consistent (all six happen to sit at the
maximum 208-week/4-year term, which is unrealistic diversity for a staggered-renewal roster but not
a math error; a minor legibility nit, not a defect).

Row 7's production-completion date was also recomputed: settlement week 1000, production at "tick 4
of 8" (`PRODUCTION_TICKS=8`) has 4 ticks remaining; `tick.ts:41`'s own comment confirms
`remainingTicks` decrements by exactly 1 per week, so completion at week 1000+4 = **1004** matches
the stated `filmReleased at wk 1004`. Correct.

Row 8's remaining-run math (week 3 of 6, `THEATRICAL_WEEKS=6`) implies 3 remaining weeks
(4, 5, 6) — the table states "continues weeks 4-6," which is arithmetically consistent (6−3=3
remaining weeks). Correct.

The notice-text counts (6 contracts, 1 production, 1 run, 2 cancelled screenplays) match the table's
row count exactly (rows 1-6 = 6 contracts; 7 = production; 8 = run; 9-10 = screenplays). Correct.

---

## Exploit / edge-case checklist (per the assigned lens)

- **Cancel-and-reannounce / timing dodges:** no exploit found specific to this document's
  recommendations — `contractId`s are keyed per-talent so no collision risk from same-week starts
  (rows 2 & 5 confirmed non-colliding), and cancelled screenplay concepts don't appear reusable.
- **Borrow-to-buy / reset counters:** not directly applicable to this task (owned by `loans.md`);
  the "zero severance" interaction with a rival that borrowed heavily right before failing is a
  `loans.md`/`rival-failure.md` concern this document correctly doesn't attempt to solve, though it
  should note the interaction exists (a studio with no severance liability has no natural brake
  against overcommitting on guarantees right up to insolvency — see Problem 5's player-side mirror).
- **Snowball / hoarding:** see the free-agency mass-dump note above (minor).
- **Legibility ("can a player explain the number/stage in one sentence?"):** the mock notices
  (§3.2) pass this test cleanly — "6 contracted professionals entering free agency... 2 screenplays
  in development cancelled" is a one-breath, fully-sourced sentence. Good.
- **Migration from pre-P15 saves:** CONFIRMED bug, see Problem 2.
- **Player/rival symmetry swap:** PLAUSIBLE incentive gap, see Problem 5.
- **2-studio end state / post-2040:** not meaningfully exercised by this document (correctly deferred
  to `consolidation.md`/`finale-endless.md`); one related observation not previously flagged anywhere:
  because `enteredWeek` never un-sets, a closed studio remains in every future quarterly chart cohort
  forever with a standing frozen at closure — fine as an historical-record choice, but this document
  never states it, and it's the kind of fact a Power-Ranking-cohort design (P15A.2) needs handed to it
  explicitly rather than left implicit.
- **Save/load mid-settlement:** PLAUSIBLE gap, see Problem 4.
- **ID reuse:** no issue found — `PersonId`/`StudioId`/`FilmId` immutability is correctly relied upon
  throughout and not violated by anything proposed here.

---

## Strong points (for the record)

- Every code citation I independently spot-checked (`hollywoodValidation.ts:165, 347-348, 357-358,
  394-395, 399`; `hollywoodTypes.ts`'s 5-kind closed `IndustryReceipt` union; `tuning.ts:391`
  `HIRING_TERMINATION_FRACTION: 0.5`; `employment.ts`'s `terminationCost`; `hollywood.ts:98-105`
  capacity numbers; `save.ts`'s V16-V19 envelope/migration pattern; `bridge/industry.ts`'s headline
  grammar and renewal/entry/existing-player-contract Activity filter) resolved to the exact line and
  matched the claimed behavior byte-for-byte. This is unusually high fidelity.
- Correctly applies the Phase-1 digest's V19-downgrade-refusal correction (V13-V18 only) rather than
  repeating the original overclaim ("every older migrateToVn").
- The choice of `employerClosed` as one new value inside an already-open `reason` enum, rather than a
  new closed-union kind, is well-reasoned and directly grounded in the actual validator structure.
- The greenlit-vs-undeveloped dividing line for production disposition (§2.3) is a genuinely correct
  reading of the codebase's own frozen-participants/prepaid-spend facts.
- §5's self-correction of direction H's own illustrative "3 productions affected" language against
  the actual shipped one-stage-per-rival capacity is an honest, useful catch that a sibling analysis
  (`ma-auction.md`) did not absorb (see the Minor cross-document note above).
- Part 2's tiering and mock notices are internally consistent with the worked example's own counts and
  with the shipped Industry Pulse grammar/filter.

---

## Bottom line

The reasoning about *what should happen* to contracts, productions, and disclosures is largely sound
and unusually well-sourced. The reasoning about *what code has to change to make that true* is
incomplete in a way that matters: as specified, a "closed" rival would keep hiring a fresh staff and
greenlighting new films forever, and the proposed migration would falsely mark not-yet-founded rivals
as "active." Both are one-paragraph fixes, not redesigns, but both must be added before this document
can be treated as the complete implementation-facing spec its own §2.9 claims to be.
