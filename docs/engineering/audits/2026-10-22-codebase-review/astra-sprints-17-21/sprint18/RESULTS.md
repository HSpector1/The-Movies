# Sprint 18 — usable, honest rights and television transactions (2026-10-29, 10:40 to 11:55 CDT, CLOSED)

Decisions B and C (../ENTRY.md) and assignment §4; the plan is ENTRY.md in this folder. Candidate fe47314f, then FIX-1 61c858b9 (review items, REVIEW.md) on p18-season-20261028 (parent ac697d84, the Sprint 17 checkpoint), both pushed. Checkpoint: 61c858b9, tag p18-sprint18-checkpoint-20261029 (pushed; remote tag object 9697ccec).

## What the player can now do (browser client, real commands)

- Open the **Rights desk** from the Dashboard (button `open-rights-desk`; App view `rightsDesk`). It lists the titles the studio holds with the core's valuation, the sale law's standing (encumbrance, resale holdback), live seasons produced on each and licences granted; open offers to and from the studio with the closing law; licences held; every other studio with the diligence and acquisition laws; open estates with their lots and the bid law.
- **Sell a title** (`makeRightsOffer`): choose the buyer (permitted buyers first; the submission law's refusal shown and the review disabled otherwise) and price; the desk shows the core's own willingness at today's valuation (assetSale.ts `rivalWillingness`, including the most that rival would pay). "Review the sale" shows, before any binding control exists, the engine's own outcome (decision B; FIX-1 after review finding 1): the plan is applied on a private copy and the week advanced until the offer is answered and the season has met its boundary rule. The copy names the answer (the rival accepts at the week boundary and the title moves, or declines with the core's reason), the week of work the season does first (units credited, a milestone earned), then the cancellation at week t + 2 under cause `rights` with the settlement as written (refund due and paid, charge due and paid, anything left owed), or the delivery the sale cannot cancel, or the season's own final boundary. "Confirm the offer" sends the digest snapshotted at the review; the adapter recomputes the outcome and refuses when it differs. Back never transacts.
- **Answer offers**: accept (a buy of a held title shows the same disclosure first, closing now), reject, withdraw.
- **Request a full disclosure** of another studio (`requestDueDiligence`, the fee shown), **quote and close an acquisition** (`absorbStudio` with the core's dated quote; the quote text names consideration against the ask, outlay, retained contracts, productions that would be cancelled, reserve after, affordability), **submit a sealed estate bid** (`submitEstateBid`).
- Every refusal is the core's sentence voiced in the player's words with the raw note behind a disclosure; a refused action stays refused, never replaced by a cancellation.

## Decision C on the season card

A season cancelled at the final boundary reads: "Cancelled at week F (cancelled at the final delivery boundary): the season could not be delivered: n of 12 units were credited by the final week F; its distribution licence stays in force through week L, with nothing deliverable under it" (or "ended at week L"). When all twelve units were credited and the master still could not be accepted, the copy says so and that the record keeps no further reason (none is invented). The cancellation classification and receipt semantics are unchanged.

## Source

- src/core/rightsDesk.ts (new): `rightsDeskView`, `titleSaleConsequences(state, subject, closingWeek)`, `titleSaleConsequencesDigest`, `saleOfferRefusal`, `playerHolds`; exports at the end of the P18 section of src/core/index.ts. Pure reads over the P16 roots and the P18 season view; every refusal is the existing law's string.
- ui/src/engine/rights.ts (new): the adapter actions with the decision B digest check; `SaleClosing` ('now' for accepting a rival's buy offer, 'boundary' for the player's own sell offer, read from rightsTick.ts and tick.ts order); `saleWillingness`; `rightsRefusalVoice`.
- ui/src/screens/RightsDesk.tsx (new); ui/src/screens/Dashboard.tsx (one prop, one button); ui/src/App.tsx (view kind, render block on `runSeasonAction`); ui/src/components/P18Season.tsx (decision C copy).
- Tests: tests/astra18-rights-desk.test.ts (3; the disclosed cancellation equals the engine's outcome on the s14 W3 route), ui/src/screens/astra18-rights-desk-ui.test.tsx (5; the desk's disclosure equals the engine two real ticks later, a stale disclosure is refused and nothing transacts, the deadline copy on a starved season), ui/e2e/astra18-rights-desk.spec.ts (Chrome journey on the constructed season world, labelled: disclosure request, sale reviewed and confirmed, two real weeks, the season cancelled at the disclosed week).

## Evidence

| Item | Result |
|---|---|
| Red at the parent ac697d84 | the new modules do not exist there (missing-module red, stated as such); the ui test's first run on the candidate failed by assertion on the willingness copy (local/astra18-ui-r1-red-copy.json), the journey's first run by a wrong assertion on the settlement line (local/astra18-e2e-r1-red-assertion.json): both were test-side corrections, no source rule changed |
| Core test at the candidate | 3 of 3 pass, 12.6 s (local/astra18-core-r1-at-worktree.json); `npm run -s typecheck` exit 0 |
| ui test at the candidate | 5 of 5 pass (local/astra18-ui-r3-green.json) |
| Chrome journey at the candidate | 1 of 1 pass, 23.3 s in installed Google Chrome (local/astra18-e2e-r2-green.json); screenshots astra18-1-sale-disclosure, astra18-2-offer-open, astra18-3-season-cancelled (ui/screenshots, gitignored; copied below when the lane ends) |
| Lane sprint18-r1 (studio-scratch/astra-20261029/sprint18-r1, bound fe47314f, 2268 manifest entries; lane/sprint18-r1/) | 10:54:13 to 11:02:50 CDT. root-ui-types exit 2 on one test-only type narrowing in the new ui test (fixed in FIX-1); focused core 12 files 106 of 106; focused ui 2 files 14 of 14; four Chrome journeys pass (smoke, P17, P18, rights desk); integrity 0 |
| Independent review of fe47314f (REVIEW.md) | NEEDS CHANGES: one blocking finding (the disclosure projected from the current week and ignored the season's week of work before the title moves), six SHOULD FIX, twelve NITs. All fixed or superseded in FIX-1 61c858b9 except finding 19 (accepted as is) |
| FIX-1 at 61c858b9 (local) | core test 8 of 8 (local/astra18-core-r2-fix1-green.json: the sell-offer boundary case with the week's unit, two units with the milestone earned, eleven units delivered, the eve of the final week, a declined price, an accepted buy offer, a refused plan), ui test 6 of 6 (local/astra18-ui-r5-fix1-green.json), Chrome journey 1 of 1 (local/astra18-e2e-r4-fix1-green.json), `npm run -s typecheck` exit 0 |
| Lane sprint18-r2 (studio-scratch/astra-20261029/sprint18-r2, bound 61c858b9; lane/sprint18-r2/) | 11:26:47 to 11:46:10 CDT. root-ui-types 0; focused core 12 files 111 of 111; FULL ui project 2763 tests, 2755 passed, 3 failed, 5 skipped: compare-full.py NEW 0 against sprint14 full-tree-r4 (INHERITED-SAME 3: the two known 30 s load timeouts in WorldFirstLotNativeNextEventApp and WorldFirstStudioHome and the topbar-focus case that passed at 27.0 s in full-tree-s17-r1 and timed out again here; its audit note called that pass not durable); four Chrome journeys pass; integrity 0. The full core gate is deferred to the Sprint 21 integration milestone: the core delta is one new module (rightsDesk.ts, imported only by index.ts) plus index exports |

## P18 gaps against the contract (§6–§7)

- Deadline copy: done (decision C, above).
- Licence after cancellation: done; the card reads the distribution licence's standing from the rights root (`distribution.licenceId`); cancellation is not revocation and the copy says nothing is deliverable.
- Creditor priority of published TV obligations in P15 closure: **one concrete Owner question** (below). Today `cancelTvSeasonsAtClosure` publishes the frozen refund and charge with the closure id and pays nothing (tvSettlement.ts), as the contract requires; `settleTvObligations` then refuses because the estate owns them. P15's claims list (studioClosure.ts, `ClosureClaim.kind: 'employment'`, paid in ascending contract id then claim id) has no class for these obligations, so they are recorded, unpaid and never distributed. The contract states the rule only as "P15's claim priority decides"; it does not state the class or rank.

## Owner question (Sprint 18)

Which claim class and rank do a closed studio's published television refund (U0) and cancellation charge (K) take in the P15 closure queue? Options: (a) record them as a new claim kind paid after every employment claim (pro rata between U0 and K or refund first, as the operating-studio rule orders); (b) rank them with employment claims by the agreement id in the same ascending order; (c) keep them recorded and unpaid (the present behaviour), stated as an accepted limit. Recommended: (a), refund first, because the contract already orders refund before charge for an operating studio and never lets the agreement outrank people. Not implemented in this sprint; the question is the deliverable.

## Claims

- LANDED: the Rights desk, the engine's-own-outcome disclosure, the decision C copy, source-bound at 61c858b9; reviewed (NEEDS CHANGES, all fixed in FIX-1); lane r2 typecheck 0, focused core 111 of 111, full ui zero NEW, four Chrome journeys; checkpoint tag p18-sprint18-checkpoint-20261029.
- MEASURED (constructed, labelled): the disclosed outcome equals the engine's on the season world in the core test (seven cases against the real sequence), in the ui test (two real ticks) and in Chrome (two real weeks); the Dashboard season card's deadline copy on a starved season.
- NOT COVERED (stated, REVIEW.md): estate bidding and an absorption close in the browser (no open estate, no affordable target on the season world); a real R2 film-title sale; the accepted-buy-offer path through the screen (rivals make no offers to the player today; the adapter path is tested in the core); an unanswered offer; a licence-produced season (none exists while R4_CONSUMER_LIVE is false).
- DEFERRED: the full core gate, to the Sprint 21 integration milestone (stated above).
- NOT CLAIMED: Owner acceptance; promotion to main; that the creditor-priority question is resolved (it is the Owner's).
