# P17 Shape A cameo / featured appearances on the P17 candidate (Sprint 11 core slice)

Target T: `/Users/zacheryspector/studio-scratch/p17-continuation-20261027-wt` at `2c50c9df` (tag `p17-sprint10-checkpoint-20261027`).
During this work the branch gained three Bridge commits (`b5c7351f`, `f8aa097a`, `c0489f7c`, HEAD at packaging). They touch only
`bridge/`, `tests/bridge-*` and Bridge fixtures. Every path these patches touch is byte-identical at `2c50c9df` and at `c0489f7c`
(MANIFEST.json `pre_sha256` is the `2c50c9df` blob; `tools/make_patches.py` refuses to package if the working tree differs).

Status: STATIC-UNRUN CANDIDATE. Nothing was compiled or run. Each post-image passed a single-file
`typescript.transpileModule` syntax check (no type check). `git apply --check` passed for SOURCE.patch, TESTS.patch and both
together, read-only, against T.

| Deliverable | Contents |
|---|---|
| `SOURCE.patch` (100 KB) | 19 files under `src/core`: 2 new (`cameo.ts`, `cameoBooking.ts`), 17 edited. No Bridge or ui file. |
| `TESTS.patch` (43 KB) | 4 new files: `tests/p17-cameo-booking.test.ts`, `tests/p17-cameo-seam.test.ts`, `tests/p17-cameo-law.test.ts`, `tests/helpers/p17-cameo-route.ts`. No existing test edited. |
| `postimages/` | Every post-image at its repo path. |
| `MANIFEST.json` | sha256 pre (at `2c50c9df`, null for new files) and post per file, plus each patch's sha256 and size. |
| `tools/make_patches.py` | Regenerates both patches and the manifest from `postimages/`. |

Apply order: SOURCE, then TESTS (disjoint files).

## Save decision: no new save version

The cameo root joins the existing Save50 step under the franchise root's own law. It is additive and absent by default:
`P17_ROOT_KEYS = ['franchises', 'cameos']`, the root is written only by the first booking and never empties (bookings are never
deleted). So:

- A Save49 world still migrates by version alone; no booking, fee or work is inferred from old films.
- `p17DowngradeRefusal` refuses `migrateToV49` and every frozen builder by name while a booking exists
  (`cannot downgrade or discard N recorded cameo booking(s)`); the franchise-only message is unchanged byte for byte.
- `stripP17Roots` strips it for the predecessor proof (`validateSaveV49`) and for `validatedLiveProfessionContext`.
- `validateP17Roots` gains a required `careerEventLeaf` argument; `validateSaveP17` passes save.ts's frozen `v8CareerEvent`
  leaf so a cameo credit is proved by the same validator as every V8 career event.
- Fee and refund rows reuse the existing `freelancerFee` ledger kind (notes `P17 cameo appearance fee …` / `P17 cameo booking
  refund …`), so no ledger kind list, no predecessor reader and no `LEDGER_KIND_PROVES_ENGAGEMENT` entry changes.

## What the slice implements, by contract clause

| Contract clause | Where |
|---|---|
| §2 one capability unlock at week 1872, zero to two guests, `additionalPrincipals` 0, no EraConfig or catalogue change | `cameo.ts featuredCapacity`, `TUNING.P17_CAMEO_*` |
| §2 profession profile table, versioned | `TUNING.P17_CAMEO_PROFILE`, `P17_CAMEO_PROFILE_VERSION` frozen on the booking |
| §3 publicity delta on the OPENING star term once, honest sign; Standing attention once | `cameoPublicityDelta`, `reception.ts computeSegmentAppeal`, `standing.ts starAttention` |
| §3 performance at 0.10, perceived at the forecast, actual frozen at completion, principal-only role fit, never cohesion | `forecast.ts`, `reception.ts computeCraft`, `cameoBooking.resolveCameoWeek` |
| §3 credit: one `cameo` record and one fame pass at weight 0.10 through the career pipeline, at release only | `releaseCareers.ts`, `starPower.buildCameoCareerEvent`, `cameo.attachCameoCareerEvents` |
| §3 a cameo never fulfils a principal or billing promise | guests never enter cast seats, `FilmParticipants`, the production company or first takes (pinned by test) |
| §4 existing film professionals only; studio-aware employment; actual availability; lifecycle with a one-week end | `cameoBooking.cameoQuote` on `busyTalentIds`, `studioEmployerId`, `retirementRecordFor` + `lifecycleRefusal` |
| §4 quote states fee, retained share, basis, readiness risk and disclosures; refuse a changed quote before any write | `cameoQuote`; the greenlight re-runs it and refuses a different fee as stale |
| §4 fee formula with one rounding; charged once at greenlight as a direct production cost; affordability | `cameoFee`, `actions.ts applyGreenlight` (fee rows, `canAfford` includes fees) |
| §4 one week inside real shooting work; a missed, stalled or held week closes with 25% retained and one linked refund | tick step 1.8 `resolveCameoWeek` (`missedWork`, `rightsLoss` from T's `p17RightsHolds`) |
| §4 explicit cancellation, production cancellation, completed work keeps its fee | action `cancelCameoBooking`, `applyCancel` |
| §4 own-employee exit cancels with the refund; a freelance booking survives employment and is disclosed | `cancelExitedEmployeeBookings` at the end of `applyActions` (the tick-tail sweep was removed in Fix 1 as unreachable); `hiringMarketView` label |
| §4 a long assignment never consumes a reserved week; unrelated weeks stay usable | seats (`applyGreenlight`, rival `decide`, Laboratory `assignSeat`) open-ended; writing through `requireWriterTermCoversDraft` over `[week, dueWeek)`; rewrites over `[week, week+1)`; casting pool shows the reservation |
| §4 closure owns the corporate consequence | `studioClosure.prepareStudioClosure`: closure cancels the player's productions terminally, so reserved bookings close under the production-cancellation rule before the money step; the refund joins the closing cash the existing claim distribution pays from |
| §5 persistence, exact joins, refused downgrade | `cameo.validateCameoRoot`, `continuationSave.ts`, `save.ts` |
| Adopted P17 decisions kept | guest fame reaches only the opening and awareness, never critic or audience score. Franchise Recognition and Momentum read the box-office total (`reach01(total)`, `surpriseOf(total, expectedTotal)`), so guest publicity moves them indirectly through the total and nothing else; Fatigue, the property-wide meter a reboot inherits, reads quality alone and is untouched (seam test, Fix 1 case) |

Bookings require the living industry and the engaged economy: the eligibility law reads D-11 employment and the P12 studio
identities, and the D-14 career pipeline is engaged-only. The M0A headless corpus refuses a booking and is byte-identical by
construction (no root, no row, no step).

## Tests and the laws they cover

All new tests build their worlds without state surgery. `p17-cameo-route.ts`: the headless world ticked to week 1871, a studio
founded there by the historical-control route `p15c2-route-l.ts` uses at week 6188 (roster signed in the draft, draft closed,
industry opened by `migration`), then one tick to week 1872. The founding signs two pictures' worth of seated people. The world is
built once at collection, not in a hook, so no hook timeout carries it. No timeout or budget is set or changed.

| Test file | Laws | RED at `2c50c9df` |
|---|---|---|
| `p17-cameo-booking.test.ts` | §2 boundary 1871/1872; zero bookings write no root and keep every byte; fee charged once and equal to an independently computed contract formula; one fee row; basis and profession stamped; principals and participants unchanged; forecast locks the guest; refusals (third guest, credited director and writer, both span edges, same person twice, stale fee, another studio's employee) leave state unchanged; missed week cancels with round(fee·0.25) retained and one refund row; real shooting completes and freezes execution; no payment on completion; no work-history counter; release credit once at weight 0.1 with exact fame before/after; missed guest no credit; guest absent from the V8 list, participants and first takes; cancel before work refunds, after work keeps; explicit cancel once, second/unknown/completed refuse; reserved week blocks a whole-film seat and a same-week booking; another week books; seated principal refused; freelance booking disclosed in the hiring listing and survives signing; own-employee release cancels with refund; Save50 round trip; downgrade refused by name; validator refuses empty root, unknown key, forged fee, foreign studio, false completion. | Yes, by assertion (13 cases). Imports only parent modules; each case opens with an assertion on the booking it needs. |
| `p17-cameo-seam.test.ts` | absent, undefined and empty guest inputs are byte-identical (reception and forecast); publicity raises opening and total while legs, critic, craft, cohesion, audience score, linear starDraw and segment scores stay put; a negative delta lowers the opening; a poor performance lowers craft slightly, cohesion and principal role fit unchanged; publicity never moves the forecast critic bar; Standing attention once, absent delta byte-identical. | 6 cases: 5 RED by assertion; the absent-inputs identity case is GREEN at both by design (the Standing case's absent-delta half is GREEN, its positive-delta half is RED). |
| `p17-cameo-law.test.ts` | constants pinned to the contract table; capability boundary; fee example 162,575 (acting 20, fame 85), positive at zero fame, fame-monotone; retained 40,644; pool zero cases, exact delta with affinity, honest negative displacement, tie order, bound below one; lifecycle ids, quote versions, one refund, completed untouched, idempotent second cancel; obligation interval `[from, until)`. | RED by missing module (`src/core/cameo.ts` is new law), not by assertion. |

### New test cases for the RED run at the parent (`2c50c9df`)

`tests/p17-cameo-booking.test.ts` (expect all 13 RED by assertion):
1. week 1871 has no featured capability; week 1872 books one; zero bookings write no root and keep every byte
2. charges the quoted fee once as a direct production cost, reserves the week, stamps basis and profession, and locks the guest into the forecast
3. refuses a third guest, a credited principal, a week outside the span, the same person twice, a stale fee and another studio's employee, each atomically
4. a booked week with no shooting work cancels once with the 25% retained charge and one linked refund
5. real shooting work in the booked week completes the appearance and freezes its execution; no payment fires and no counter moves
6. the release credits the completed appearance once through the career pipeline at the cameo weight; the missed guest earns nothing
7. cancelling the picture before the work week refunds the unperformed booking once
8. cancelling the picture after the completed week keeps the work and its earned fee
9. an explicit cancellation closes one unperformed booking once; a second, an unknown or a completed one refuses
10. a reserved week blocks a whole-film seat and a second appearance that week; another week books; seated people are not guests
11. a freelance booking is disclosed to a new employer and survives the signing; an own-employee exit cancels with the standard refund
12. round-trips byte for byte and refuses a downgrade by name while a booking exists
13. the validator refuses an empty root, an unknown key, a forged fee, a foreign studio and a completion that never happened

(Cases 4 to 6 share one collection-time route.)

`tests/p17-cameo-seam.test.ts` (expect RED by assertion):
14. publicity raises the opening and the total; legs, critic, craft, cohesion, audience score, linear starDraw and segment scores stay put
15. an off-segment guest who displaces better-fit names lowers the opening honestly; quality is still untouched
16. a poor guest performance lowers craft slightly through castExecution; cohesion and the principals' role fit do not move
17. publicity alone never moves the forecast's quality bar
18. an absent delta is the predecessor expression; a positive delta raises awareness and nothing else (RED on its second half)

Expected GREEN at both: "no field, an explicitly undefined field and an empty execution list resolve identically".

`tests/p17-cameo-law.test.ts`: whole file RED by missing module (11 cases).

The RED-run record should state per-case results from the lane, not this list.

## Draft hunks dropped or changed, and why

| Draft (studio-specialists/p17, package 1370-ar r2) | Disposition |
|---|---|
| Required `cameos` root seeded empty by `initialP17Roots` in worldgen and every migration | Dropped. T's P17 law is a lazy root; an empty root would make every Save49 migration and downgrade change bytes. |
| `quoteToken` (JSON of every quote input) on each request | Replaced by the accepted `fee`. The greenlight re-evaluates every quote input as law at commit (capability, week, retirement, occupancy, employment, actual work) and refuses a changed fee as stale. A token cannot be built by a parent-only RED test, and the fee is the one player-facing number that can move silently. Basis is re-derived and stamped; it changes only by the player's own action in the same batch. |
| `creditCompletedCameoWork` (`workHistory.acting + 1` at completion) | Dropped. `workHistory` counts completed productions per discipline (types.ts:136) and feeds the proven/unproven and profession-transition readers, so a one-week guest week would make a non-actor "proven" in acting. The completion fact is the booking's `completedWeek`; the credit is the cameo career record. This is an interpretation of contract §3 "reconcile acted-work counters": no counter moves, so nothing double-counts. Flag for review. |
| `featuredGuestQuote`, `bridge/session.ts` variants, `bridge-p17-greenlight-variants.test.ts`, ui `careerImpact.ts` | Not adapted: Bridge and ui belong to the disjoint Bridge workhorse and the UI lane. `index.ts` exports nothing new; add `cameoQuote` and the action there when a consumer exists. |
| Draft eligibility: separate seat (with the F05 committed-release exception), writing-due, rival-engagement and research-seat branches | Replaced by T's one availability set `busyTalentIds`, read as open-ended (`ponytail:` marked). Lawful but conservative: a seat on a picture committed to release this week, or a draft due before the work week, over-refuses. |
| Draft `isPlayerStudioAt` (player id `player` before the industry) | Dropped: bookings require the living industry, so the studio is always `hollywood.playerStudioId`. |
| Draft `productionIdentity.ts` walk of booking production ids | Dropped: every booking's production id is already reserved by its fee ledger row (`persistedProductionIds` walks the ledger). |
| Draft hollywoodTick `decide` switching the whole `busy` set to the resolver | Narrowed: a separate reserved set guards seating and, conservatively, the rival writer pick. Rival hiring (`staff`) keeps `busyTalentIds`, as in the draft. |
| Draft rival continuation hold, `ApplyActionsDeps`/rights adapter, `applyCancel` commitment prune | Already dropped in Sprint 10; T's own holds feed `rightsLoss`. |
| Draft release-careers cameo pass ran outside the participants gate | Moved inside it, so the guest's fame moves only where principals' fame moves (engaged films with frozen participants). |
| Draft tests `p17-cameo`, `p17-r2-cameo`, `p17-r2-living`, `p17-r2-managed`, `p17-r2-validate`, the cameo half of `p17-integration` | Replaced by the three new files. The draft's live tests ran on an unemployed M0A world or the mock rights adapter, and imported new modules (no assertion-level RED). No managed front-door case was ported. |
| Rival greedy guest selection (contract §5) | Still deferred, as in the draft (D31): rivals book no guests; they meet the law as the party whose seats and commissions respect a reserved week. |

## Not verifiable without running, precisely

1. **Type check.** Nothing was type-checked. Most likely friction:
   - `new Map(events.map((e) => [key, e]))` tuple inference in `cameo.attachCameoCareerEvents` (the same pattern exists in T).
   - `satisfies` inside the `as const` TUNING object (the draft compiled it at 6510c971).
   - `asserts raw is CameoRoot` called on an index access in `continuationSave.validateP17Cameos`.
   - `as Action` casts in the tests and helper; `as unknown as` casts in the seam test (the draft hit TS2352 on single casts).
   - `noUnusedLocals`: `technology.ts` no longer imports `busyTalentIds`; `continuedScripts.ts` imports `assignmentBlockedTalentIds` in its place.
2. **Route premises** (each throws by name if unmet): the week-1871 founding draft offers 6 seatable actors, 2 directors, 1 writer
   and 2 craft within the 6,000,000 recruitment fund; a free, unretired director and writer with fame above 0 exist at week 1872;
   the hiring listing holds an unemployed, unretired freelancer; cash covers two pictures; the legacy schedule shoots in weeks
   W+4 and W+5; the release tick with `develop: true` writes principals' career events, so the guest's credit is required.
3. **Seam magnitudes.** The Standing case assumes the fixture's awareness delta is not already at its cap; the poor-performance
   case assumes craft is not clamped.
4. **Timing.** About 1,871 headless ticks plus roughly 45 living-industry ticks across the booking file, all at collection. A
   premise failure there fails the whole file loudly. Measure alone if it is slow under lane load; do not add timeouts.
5. **Untested paths, reasoned only** (superseded by Fix 1 below for closure, rights loss, managed work and the tail sweep):
   rival seating and writer pick around a reserved week; `requireWriterTermCoversDraft` and the Laboratory seat guards.
6. **Interactions left as they are:** promise feasibility proofs do not read reserved guest weeks (a reservation can block a seat
   for at most eight weeks); the casting pool omits a reserved person instead of listing them as an unavailable row; filmPackage
   previews do not include guests, so a pre-greenlight preview differs from the locked forecast when guests are booked.
7. **Bridge.** No Bridge file changed. A save holding a booking digests differently; a booking-free save is byte-identical, so
   projection 65's pins are unaffected.

## Fix 1 (against fd2cc2e0; applies at 2b1a5b4b)

`FIX-1.patch` (34,768 bytes, sha256 `aea03efd4dd24756e18a6021e973e1ce21ec3dba0dc9353ebfaf31c50cfe2863`), post-images under
`fix1/postimages/`, per-file pre/post sha256 in `fix1/MANIFEST.json` (pre = the fd2cc2e0 blob; every one is byte-identical
at 2b1a5b4b). Eight files: `src/core/{cameo,cameoBooking,careerLifecycle,tick}.ts`, `tests/p17-cameo-{booking,law,seam}.test.ts`,
`tests/helpers/p17-cameo-route.ts`. `git apply --check` is clean at 2b1a5b4b (T's worktree) and on a fd2cc2e0 export.
Single-file transpile syntax check passes for all eight. Not type-checked or run.

| Item | Resolution |
|---|---|
| TS2375 `cameoBooking.ts(222,3)` | `commitCameoBookings` writes `cameos` only when the root exists (conditional spread), as the franchise code does. |
| S1 franchise wording | Corrected here and in the seam-test header: Recognition and Momentum move only indirectly through the total; Fatigue reads quality alone. New seam case pins it exactly: the meter with a guest equals the meter registered from the guest-free facts with only `total` replaced; Fatigue and its last quality are identical; Momentum differs. |
| S2 stale basis | `CameoBookingRequest` gains `basis` (`'employee' \| 'freelance'`); the greenlight refuses a changed basis by name, after the fee check: `stale cameo quote for X: the basis is now employee, not the accepted freelance; re-quote before booking`. The quote's `basis` is what the player accepts. |
| S3 lifecycle authority | `assignmentRefusal` takes an optional `obligationEndWeekExclusive` (default: the seat's `week + PRODUCTION_TICKS + 1`; the seat's message is unchanged byte for byte). The quote calls `assignmentRefusal(state, id, workWeek, 'actor', workWeek + 1)`; the parallel loop is gone. Every existing caller passes four or fewer arguments, so no behaviour changes for them. |
| S4(a) closure | New live case: the player drained to -1 at 1872 (the p15b drain device, one test ledger row) walks warning and distress to distress week 25; that week it takes the lawful distress loan, is drained to exactly the cheapest free guest's fee, and greenlights the contracted package at zero budget with one booking four weeks out. The ordinary tick closes the studio; the case asserts the booking cancelled `productionCancelled` at the closure week with its refund row, and that `validateSaveP17` (the closure validator's replay) and the save round trip accept the closed world. |
| S4(b) rights loss | Seam case on `resolveCameoWeek` with a real held set (whether or not the clock moved): `rightsLoss`, one refund row. No live route reaches a P17 rights hold at or after 1872 at this checkpoint (it needs a released origin, a sequel in production and a P16 sale or licence lapse mid-production). |
| S4(c) tail sweep | **Removed as unreachable**, not tested. Inside a tick a player employment row ends only by expiry at `endWeekExclusive` (`industryEmployment.ts` expiry and `recordPlayerEmployment`; rival cost-cutting ends rival rows only; closure cancels every booking under `productionCancelled` before it ends rows), and an employee basis requires employment covering the work week. Retirement notice is 52 weeks and the quote refuses work past an announced effective week. Every earlier exit is an action (termination), caught by the tested sweep at the end of `applyActions`. If a future in-tick exit appears, restore the sweep with its case. |
| S4(d) managed work | Seam cases on `resolveCameoWeek`: a stalled picture in its nominal shooting week, a non-shooting advance and a vanished picture each miss and refund; a picture that actually shoots in the booked week completes and keeps the fee. No live managed case: a managed greenlight needs a Development & Casting facility (`operations.ts` allocation refusal), which this route does not build. |
| S5 | Validator forgeries split into five cases sharing one `makeSave`. No timeout changes. |
| S6 | Recorded below as ACCEPTANCE OPEN. |
| N2 | Dead `skills.acting === undefined` check removed. |
| N8 | The law test spells `UNLOCK_WEEK = 1872` locally and no longer imports the route helper. |

Refusal-only paths with no case (as the review allows): rival seating and the rival writer pick around a reserved week
(`hollywoodTick.ts`), the Laboratory and rival research seats (`technology.ts assignSeat`), the writing-interval guard
(`requireWriterTermCoversDraft`), the rewrite guard (`requestScriptRewrite`) and the casting-pool reservation label.

**ACCEPTANCE OPEN: rival guest selection** (contract §5 and §6 item 9; draft D31). Rivals book no guests at this checkpoint.
They meet the law only as the party whose seats and commissions respect a player's reserved week. The rival greedy
selection and its RED item remain open for acceptance.

### New RED-first cases (Fix 1)

| Case | RED at 2c50c9df | At fd2cc2e0 |
|---|---|---|
| booking: an employment change makes the quote stale: a freelancer signed in the same batch refuses as freelance and books as employee | by assertion | **RED by assertion** (the batch books silently as employee) |
| booking: the closure cancels the unperformed booking once with its refund before the money step; the closure validator replays it | by assertion | GREEN expected |
| booking: the validator refuses an empty root / an unknown root key / a forged fee / a foreign studio / a completion that never happened (5 cases, split from one) | by assertion | GREEN expected |
| seam: franchise meters: Recognition and Momentum move only through the total; Fatigue is identical | by assertion (`known.total` equals `plain.total` there) | GREEN expected |
| law: a rights-held picture in the booked week cancels with rightsLoss and one refund row, even if its clock moved | missing module | GREEN expected |
| law: a stalled picture (managed work unallocated) in its nominal shooting week, a non-shooting advance and a vanished picture each miss the work and refund once | missing module | GREEN expected |
| law: a picture that actually shoots in the booked week completes and keeps the whole fee, whatever the nominal schedule said; an unreached week waits | missing module | GREEN expected |

Fix 1 risks, precisely:
- **Closure route premises** (each throws by name, failing only that case; the route is built at collection inside a
  try/catch and rethrown in its case):
  - the drained player reaches distress week 25 within 80 ticks
  - the loan law admits a principal of at least the cheapest free guest's fee
  - the ordinary tick's payroll takes cash below zero from 0
  - the package's principals are still contracted and lifecycle-clear about 33 weeks after 1872
  - `s.concepts[0]` is still greenlightable
- **Closure route cost:** about 33 extra living-industry ticks at collection.
- **Type check:** the helper's `drain` ledger literal mirrors `tests/helpers/p15b-live.ts`, and `{ kind: 'takeLoan', principal }` is a plain `Action`.

## Fix 2 (against 465d49a9)

`FIX-2.patch` (7,781 bytes, sha256 `1ef210f725c0cd369aebd0d7c9b9242e868b4cd149b0522d07a886b6e6378211`), post-images under
`fix2/postimages/`, pre/post sha256 in `fix2/MANIFEST.json`. Two files: `tests/helpers/p17-cameo-route.ts` and
`tests/p17-cameo-booking.test.ts`. No source, law or tuning change. `git apply --check` is clean at 465d49a9 (T's worktree);
single-file syntax check passes. Not run.

**Cause of the r12 failure.** Once the player's cash is negative, the one distress loan is the only inflow, and the walk
spends one week of fixed cost per negative week (r12: about 126,656 a week against a fixed cost of 126,654). At recorded
distress week d the hole is about (d + 7)·O: 8 negative weeks to enter distress, then d − 1 more. The loan is at most 26·O
(`LOAN_MAX_FIXED_COST_WEEKS`). At d = 25 the hole was 32·O (cash −4,052,993; the 3,293,000 loan left −759,993). No lawful
route closes the studio on the tick right after a funded booking:
- the closing tick follows the week whose recorded d is 25, and a booking then meets a hole of 32·O;
- draining less does not help, because every negative week costs the same;
- an earlier loan lifts cover out of `low` (distress turns to recovery) and blocks a second loan for its 52-week term;
- a credit row would invent money.

**The truthful route.** A booking at recorded distress week d is still reserved at closure only if its work week is at least
26 − d weeks out. The span allows at most `PRODUCTION_TICKS` (8), so d ≥ 18. At d = 18 the hole is about 25·O, and the loan
covers it with about one week of fixed cost to spare (expected cash after the loan ≈ 126,600 against the guest fee ≈ 9,503).
The route now:
1. walks to distress week `CORPORATE_CLOSURE_DISTRESS_WEEKS − PRODUCTION_TICKS` (18);
2. takes the loan and drains to exactly the fee;
3. books the cheapest free guest at the last lawful week (booked week + 8);
4. ticks until the closure, at most 8 ticks.

The closure happens in the eighth tick, stamped week booked + 8. That tick runs before the tick that would resolve the
booked week, so the booking is still reserved when the closure cancels it under `productionCancelled`. The validator admits
a production cancellation in the work week (`bookedWeek <= cancelledWeek <= workWeek`).

The case now also asserts that the booking is still reserved on the last open week and that `closureWeek` is booked + 8.
Premise checks keep their names: the distress walk, a free guest, and the loan covering the fee (the message now also
reports the hole). The route ticks 7 fewer weeks before the booking and 7 more after it, so its cost is unchanged.

RED at 2c50c9df: the cameo request is ignored there, so the first assertion (a reserved booking) fails by assertion. The
studio still closes eight ticks later, because the fee is not spent and payroll takes cash negative anyway. Expected GREEN at
465d49a9 with this patch.

## Fix 3 (against e35bbacc, the FIX-2 commit)

`FIX-3.patch` (sha256 and size in `fix3/MANIFEST.json`), post-images under `fix3/postimages/`. `git apply --check` is clean
at e35bbacc (T's worktree); single-file syntax check passes. Not run.

1. `cameo.ts`: the stale JSDoc block above `CameoBookingRequest` is deleted.
2. `cameoBooking.ts`: the quote now passes the greenlight week as `assignmentRefusal`'s assignment week, still with the
   exclusive end `workWeek + 1`. The shared message therefore reads "an assignment taken at week <greenlight week> ending at
   week <workWeek + 1> cannot complete before it". The decision is unchanged, because the refusal reads only the end week
   when an end week is passed. `careerLifecycle.ts` is untouched.
3. Closure route premises, now four, each named and each failing only the closure case:
   - the distress walk
   - the loan covering the fee
   - the zero-budget greenlight (a refusal, for example an expired principal contract or an unavailable concept, is
     rethrown as `premise: the zero-budget greenlight at distress week 18 (week N) refused: <engine message>`)
   - cash below zero on the last open week

   These live in `tests/helpers/p17-cameo-route.ts`, where `closureRoute` builds the greenlight and the walk. That file is
   outside the three files the brief named; item 3 cannot be met without it.
4. `tests/p17-cameo-booking.test.ts`: the forged-save cases build `makeSave(booked)` inside `refuse`, so a failure there
   fails only that case.
