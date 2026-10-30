# Sprint 27 — the missing Bridge routes for the adopted rights and estate workflows (2026-10-30, 13:49 CDT to 16:07 CDT, CLOSED)

Entry: ENTRY.md (recovery, the decision B ratification, the design). Owner order: OWNER-ASSIGNMENT-SPRINT-27.txt.
Engine p18-season-20261028: 3d5b8b7a (the routes, projection 71) + b2b4bdd9 (FIX-1 after the independent review) +
18c3e8cf (FIX-2, the last two test pins), all pushed and remote-verified. Unity sprint15-consumer-20261028: e9a0c08 + 4c41676 (regenerated DTOs, the two view queries;
STATIC-UNRUN), pushed. CF09 pair seals PASS: 3d5b8b7a × e9a0c08 (PAIR-VERIFICATION-20261030-sprint27.json) and
b2b4bdd9 × 4c41676 (PAIR-VERIFICATION-20261030-sprint27-fix1.json; projection 71, protocol 4, schema sha256:3ce933d7…,
both generated-contract blobs a8e3226f), each run from the full records checkout with the engine branch freed from the
sparse worktree by ref and re-attached (skip-worktree count 22,366 before and after). Tag p18-sprint27-checkpoint-20261030 at 18c3e8cf (object 4c7d9427), pushed and remote-verified.
The Sprint 26 playtest tag p18-sprint26-candidate-20261030 (6ddeeb00) is untouched; its launch instructions stand
(INTEGRATED-REPORT.md §Launch and build).

## Decision B — ratified (ENTRY.md §2)

The Owner's confirmed reading is the Sprint 23 implementation (studioClosure.ts closure/v2: every cancelled agreement of
the closing producer with something outstanding, including those cancelled earlier while operating, yields claims for the
outstanding parts only, behind every employment claim, refunds before charges, in the tiered deterministic order; one
payment path; v1 records and transactions untouched). Evidence reused from sprint23/RESULTS.md and the Sprint 26 gate.
No source change.

## The routes that now work on the Bridge (§6 report, part 1)

| Sprint 25 gap | Now on the wire | Proven here against the core |
|---|---|---|
| Estate inspection | Industry view `estates`: open estates with each lot's subjects and titles, minimum, encumbrances, the player's sealed bid and the core's bid law; closed estates with each lot's disposition (sold: amount, buyer; archived), the player's bid outcome and the ceremony's reason, the closure's claims by kind | the actual R04 closure (window 163 to 176): every open lot equals `rightsDeskView`; after D the sold lot, the archived lots, the won bid and the claims equal the desk's closed-estate view |
| Bid preparation and submission | quote family `quoteEstateBid` → the core's bid law by name, the minimum, the ceremony week, spendable before and after (the core's private successor) → minted `submitEstateBid` commit | refusals `belowMinimumBid`, `unknownLot`, `unknownEstate`, `duplicateBid`, `estateClosed`, each equal to `estateBidRefusal` on the same state; the lawful commit's estates and cash equal `applyActions` with `submitEstateBid`; a refused quote's id and a stale quote's id are refused `INTENT_NOT_AVAILABLE` |
| Bid and lot outcome projection | the closed estate row (won, lost, disqualified with the engine's reason; sold or archived); a rival's sealed bid is never shown | the ceremony walked to D on the committed state |
| Title sale: prepare, review, make | quote family `quoteRightsOffer` plan `offer` (a held title to a counterparty at a price) → the sale law's token, valuation, encumbrance, holdback, the licences in force, the rival's willingness and limit, the expiry the offer will carry, and the decision B consequence (`titleSaleOutcome` verbatim with its digest) → minted `makeRightsOffer` commit bound to the digest | the natural season route: the quote's consequence (the rival accepts at the boundary, the week's unit lands, the season cancels under cause `rights`) equals the core's disclosure and the real two-week advance; the commit's offers equal the core action's; `duplicateOpenOffer` and `unknownStudio` equal `saleOfferRefusal`; a price above the rival's bid quotes `willing:false` with the limit and a rejected answer |
| Accept (a held title's sale) | `quoteRightsOffer` plan `accept` on a rival's buy offer → the close law's token and the consequence → minted `acceptRightsOffer`; no one-gesture accept is published (`saleReviewRequired`) | the rival's buy offer: no accept intent, a reject intent, the quoted acceptance closes now with the consequence and equals the core action; the guard refuses a null digest and a stale digest with the browser's sentences |
| Accept (a purchase or a licence grant) | one-gesture `acceptRightsOffer` row intent, confirmation=required by its verb; also answerable through the quote (no consequence) | the rival's sell offer: the intent closes exactly as the core action (rights, transactions and cash equal); a purchase beyond the reserve carries the core's `insufficientCashAfterReserve` on the row and the quote, publishes no accept intent and commits nothing |
| Reject, withdraw | one-gesture `rejectRightsOffer` and `withdrawRightsOffer` row intents on the `rights` view (held titles with sale law, valuation, encumbrance, holdback, licences out and live seasons; offers paged newest first with the close law; licences in; counterparties) | each equals the core action; a closed player studio gets no rights intent while both views still read |

Contract: PROJECTION_VERSION 71; five intent kinds; two quote families; two views; outgoing70 (sha256:aaafd0bd…)
registered prior with its genuine capture (bridge-step/tools/capture70.ts on a detached sparse snapshot of 6ddeeb00;
OUTGOING70-RECEIPT.json; tests/fixtures/bridge/genuine-projection70-runtime; pinned in bridge-runtime-checkpoint.test.ts
from the receipt). Generated artefacts by the generator only; pins read from the regenerated manifest, the union bodies and
the older-roster digest measured standalone before the pins were written (local/s27-fix1-older-roster-measure.txt).

## Verification executed here (§6 report, part 2)

| Check | 3d5b8b7a | b2b4bdd9 (FIX-1) |
|---|---|---|
| Typecheck root, Bridge; contract and fixture checks | 0, 0, 0, 0 (local/s27-r1-*, s27-r2-*, s27-r3-*) | 0, 0, 0, 0 (local/s27-fix1-*) |
| tests/bridge-astra27-rights-estate.test.ts (new) | 9 of 9 (local/s27-r3-new.json) | 12 of 12 (local/s27-fix1-focused.json) |
| Focused Bridge files (schema, bridge, generator, runtime-checkpoint, p14b5, astra20, p18-season, rights-parity, p12-industry, l24) | 217 cases: 209 pass; 8 fail = 5 family 12 INHERITED (same by identity as full-tree-s26-r1) + 3 pins moved in FIX-1 | 13 files, 275 cases: 268 pass; 7 fail = 5 family 12 INHERITED + 2 roster pins moved in the same commit (then 7 of 7, local/s27-fix1-rosters.json) |
| Lane sprint27-r1 (bound 3d5b8b7a; lane/sprint27-r1/): root-ui-types 0 (117 s), bridge-types 0, both contract checks 0, bridge-tests 116 files in 2,209 s, integrity 0 | 1,094 of 1,173 (2 todo): against full-tree-s26-r1 and sprint20-r3 NEW 43 (40 "expected 71 to be 70" projection pins, the p14b6 and p14b8 roster counts, the l22 highest-prior pin: the Sprint 20 FIX-1 pin pattern, moved in FIX-1), INHERITED-CHANGED 1 (owner-ux-projection20 "71 to be 53", by value), the remaining 33 failures INHERITED-SAME (family 12, p12 campaign-library timeouts under load, p06 recovery pins, p14b2 fixture premise) | — |
| Lane sprint27-r2 (bound b2b4bdd9; lane/sprint27-r2/): root-ui-types 0 (130 s), bridge-types 0 (49 s), both contract checks 0, bridge-tests 116 files in 2,029 s (15:26:23 to 16:03:19 CDT), final-source-integrity exit 1 because the handoff hook re-stamped HANDOFF.md's AUTO block during the run (the only diff; restored; no source moved) | — | 1,137 of 1,175 (2 todo): against full-tree-s26-r1 and sprint20-r3 NEW 2 (the P14B.2 group 1 exact kinds list and the P4/P5 older-roster count: pins, moved in FIX-2 and green there, local/s27-fix2-pins.json), INHERITED-CHANGED 1 (owner-ux-projection20 "71 to be 53", by value), the other 33 failures INHERITED-SAME (p14b5 family 12 ×5, p14b2 fixture premise and week pins ×8, p12 campaign-library timeouts ×11, p06 recovery pins ×2, p14c2rm freeze premise ×2, p13 isolation and p14c3 runtime timeouts, owner-ux save-version pins ×3); against sprint27-r1 BASELINE-NOT-REPRODUCED 40 (the FIX-1 pins now pass); budgets unchanged |
| FIX-2 (18c3e8cf, test-only: two pins) | — | the two files 2 of 2 clean of pin failures (the eight remaining p14b2 rows are the inherited fixture premise and week pins; local/s27-fix2-pins.log); no lane rerun for two test pins (the r2 gate stands for the source) |
| Independent review | REVIEW.md: ACCEPTABLE WITH FIXES (1 to 3), eleven findings; dispositions there | fixes 1, 2, 3, 6, 7, 9, 10 adopted; 4, 11 not adopted; 5, 8 partly; recorded |
| CF09 pair seal | PASS 3d5b8b7a × e9a0c08 | PASS b2b4bdd9 × 4c41676 |
| Browser journeys, full core and UI gates | not rerun: no browser surface or core law changed; the Sprint 26 gate stands for everything outside the Bridge | — |

Budgets unchanged (core 5,000 ms default, ui 30,000 ms, no override); inherited failures, missing inputs (3, the same
untracked fixtures) and the Sprint 26 baseline preserved.

## What still needs native client implementation (§6 report, part 3)

The wire now carries every §7 minimum route. The native client has: the generated DTOs (projection 71), the generic
displayed-intent list with the confirmation verdict, the quote drivers for the loan and the season, and the two new
read-only view queries. It does not have: a presentation surface for the `rights` or `estates` page; a quote driver for
`quoteRightsOffer` (including the disclosure review before the minted commit) or `quoteEstateBid`; bespoke surfaces for
the acquisition, disclosure and television quotes (generic rendering only, as the Sprint 25 matrix recorded). That is
presentation work for a Unity-capable host and a presentation owner; none of it is started here.

## Exactly what waits for the new laptop

Unity 6000.3 compile of sprint15-consumer-20261028 at 4c41676; EditMode (StudioBridgeGeneratedUnionFixtureTests on the
regenerated fixtures, StudioConfirmedIntentTests, StudioDisplayedIntentTests) and PlayMode; the native build; the CF09
attestation emission (`--attestation-output` with the EditMode result and log); the real-input route verification of the
rights and estate flows against a running Bridge; the Sprint 25 ACCEPTANCE OPEN items. Until then every Unity change of
Sprints 22 to 27 is STATIC-UNRUN, which this order and the previous one say is not native qualification.

## Coordinator readings for the Owner (one line overrules each)

1. The make path publishes sell offers on held titles only (the browser desk's adopted behaviour); buy and licence offers
   stay core-only.
2. The one-gesture purchase or licence-grant acceptance is confirmation=required by its verb (money moves at once, the
   same class as the loan shortcut); the quoted sale acceptance is `none` because the quote is the review.

## Not claimed

Native compile, test, build, run or acceptance; a browser surface change; Owner acceptance; promotion; that the Bridge's
cost of reading the desk on every snapshot is measured on a long campaign (review NIT 8, recorded).
