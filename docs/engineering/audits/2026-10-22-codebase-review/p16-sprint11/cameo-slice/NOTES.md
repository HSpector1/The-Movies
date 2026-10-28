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
| §4 own-employee exit cancels with the refund; a freelance booking survives employment and is disclosed | `cancelExitedEmployeeBookings` at the end of `applyActions` and in the tick tail; `hiringMarketView` label |
| §4 a long assignment never consumes a reserved week; unrelated weeks stay usable | seats (`applyGreenlight`, rival `decide`, Laboratory `assignSeat`) open-ended; writing through `requireWriterTermCoversDraft` over `[week, dueWeek)`; rewrites over `[week, week+1)`; casting pool shows the reservation |
| §4 closure owns the corporate consequence | `studioClosure.prepareStudioClosure`: closure cancels the player's productions terminally, so reserved bookings close under the production-cancellation rule before the money step; the refund joins the closing cash the existing claim distribution pays from |
| §5 persistence, exact joins, refused downgrade | `cameo.validateCameoRoot`, `continuationSave.ts`, `save.ts` |
| Adopted P17 decisions kept | guest fame reaches only the opening and awareness, never critic or audience score, so franchise quality, Recognition, Momentum and the property-wide Fatigue a reboot inherits never read it (seam test) |

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
5. **Untested paths, reasoned only:** studio closure with a reserved booking; a rights-held picture's booked week
   (`rightsLoss`); managed-operations shooting allocation; rival seating and writer pick around a reserved week; the tick-tail
   employment sweep (only the action-boundary sweep is tested); `requireWriterTermCoversDraft` and the Laboratory seat guards.
6. **Interactions left as they are:** promise feasibility proofs do not read reserved guest weeks (a reservation can block a seat
   for at most eight weeks); the casting pool omits a reserved person instead of listing them as an unavailable row; filmPackage
   previews do not include guests, so a pre-greenlight preview differs from the locked forecast when guests are booked.
7. **Bridge.** No Bridge file changed. A save holding a booking digests differently; a booking-free save is byte-identical, so
   projection 65's pins are unaffected.
