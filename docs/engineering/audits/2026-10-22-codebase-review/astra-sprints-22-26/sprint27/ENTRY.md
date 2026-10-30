# Sprint 27 — the missing Bridge routes for the adopted rights and estate workflows (2026-10-30, 13:49 CDT, entry)

Governing order: the Owner's "PROJECT: STUDIO — OWNER DECISIONS AND BOUNDED SPRINT 27" (pasted into the session at
13:49 CDT; verbatim copy OWNER-ASSIGNMENT-SPRINT-27.txt, sha256 fe3cb958…). One bounded sprint; no Sprint 28, no cleanup
campaign, no optimization program. Native work stays BLOCKED/UNRUN until a capable host exists (a deferral, not an
acceptance of STATIC-UNRUN); the host and toolchain check is not repeated.

## 1. Recovery, once (13:49 CDT)

| Reference | Order | Found | Remote |
|---|---|---|---|
| Engine p18-season-20261028 | 6ddeeb00 | 6ddeeb00, worktree p17-continuation-20261027-wt, clean (HANDOFF.md AUTO block re-stamped by the hook only) | refs/heads/p18-season-20261028 = 6ddeeb00 |
| Records wip/headless-program-20260916-ts | d407374a | d407374a, clean | d407374a |
| Unity sprint15-consumer-20261028 | e7dcfc3 | e7dcfc36, clean | — |
| Mirror p16-retained-writing-20261026 | (preserve) | 1f4a4e2d, clean | 1f4a4e2d |

Nothing newer on any remote. Tag p18-sprint26-candidate-20261030 (object f1c483b3) still names 6ddeeb00 and stays
immutable for the Owner's browser playtest; its launch instructions are the integrated report's §Launch and build (reused,
not repeated here). The Sprint 26 gate (full-tree-s26-r1) is reused as the pre-sprint baseline and is not rerun to begin.
Read: HANDOFF.md items 18 to 22, INTEGRATED-REPORT.md (§Outstanding Owner decisions), sprint25/RESULTS.md (the
minimum-route matrix: no Bridge intent for estate bids or title sale/offers/licences). No lane, lock or freeze was active.
Host facts unchanged (AC power, 7.0 GB free, swap 8 GB with 6.9 GB used).

## 2. Decision B — confirmed by the Owner; ratified, not rewritten

The Owner's text ("genuine TV refund and cancellation-charge balances still outstanding when a studio closes become
estate claims, including agreements cancelled earlier while the studio operated; claim only the remaining unpaid balance;
count prior payments; preserve settled obligations; prevent duplicate claims/payment paths; employment first, TV refunds
second, TV charges third, deterministic ordering; preserve historical closure/v1 records and transaction history") is the
Sprint 23 implementation as committed in 95276c9c:

- src/core/studioClosure.ts lines 406 to 436: under `CLOSURE_LAWS['closure/v2'].TV_CLAIMS`, every cancelled agreement of
  the closing producer with something outstanding, "the ones this closure just published and the ones cancelled earlier
  while operating", yields a `tvRefund` claim for `refundDue − refundPaid` and a `tvCharge` claim for `chargeDue −
  chargePaid`, each "the outstanding part, never a paid amount"; `CLAIM_TIERS` employment 0, tvRefund 1, tvCharge 2 and
  the tiered comparator (tier, then source id, then claim id) order the payment; `settleTvObligations` refuses a
  closure-published agreement, so no second path pays the same debt (tvSettlement.ts `payTvObligationFromEstate`, tvSave.ts
  estate-source admission and the two-way claims-to-agreement join); closure/v1 records keep their own law and are judged by
  it (the validator's per-record `lawVersion`); transactions and ledger rows are appended, never rewritten.
- Evidence reused: sprint23/RESULTS.md §Evidence (110 of 110 in the eleven owning suites on 95276c9c, including the
  positive-closing-cash witness that pays employment in full, the refund half from the estate once with its receipt, ledger
  row and paid figure, and leaves the charge waiting; three forged-creditor refusals; the 70-file affected sweep with zero
  NEW failures) and the Sprint 26 full gate at 6ddeeb00 (0 NEW core failures against the Sprint 21 gate).

Ratification recorded; no source change for decision B in this sprint. The earlier "one line overrules it" reading in
INTEGRATED-REPORT.md §Outstanding Owner decisions item 3 is now closed by this order.

## 3. Design (what the Bridge gains at projection 71)

Established architecture only: Industry views (bridge/industry.ts), quote families (quote → digest-bound minted commit),
displayed intents with the Sprint 20 `confirmation` verdict, the generator and the outgoing-checkpoint registry.

| Route (Sprint 25 matrix gap) | Bridge surface | Core authority (unchanged) |
|---|---|---|
| Estate inspection | Industry view `estates` (`StudioEstatesPage`): open estates with each lot's subjects and titles, minimum, encumbrances, the player's sealed bid and the bid law at the minimum; closed estates with each lot's disposition (sold: amount, buyer; archived), the player's bid outcome with the ceremony's reason, and the closure's P15 claims by kind | `rightsDeskView` (estates, closedEstates), `estateBidRefusal` |
| Bid preparation and submission | quote family `quoteEstateBid` (draft estateId, lotId, amount) → `StudioEstateBidQuoteSnapshot`: refusal by the core's token, minimum, the ceremony week, spendable before and after (read from the core's private successor) → minted `submitEstateBid` commit | `estateBidRefusal`, `submitEstateBid`, `spendableCash`, `postPurchaseReserve` |
| Bid/lot outcome projection | the closed estate row above (won / lost / disqualified with the engine's reason; sold / archived); a rival's sealed bid is never shown | `rightsDeskView.closedEstates` |
| Title-sale prepare/review and make | quote family `quoteRightsOffer` plan `offer` (counterparty, held title, price; the adopted desk behaviour: the player sells a title it holds) → `StudioRightsOfferQuoteSnapshot`: the sale law's token, valuation, encumbrance, holdback, licences in force, the rival's willingness and limit, the expiry the offer will carry, and the decision B consequence (`titleSaleOutcome` verbatim with its digest) → minted `makeRightsOffer` commit, bound to that digest | `saleOfferRefusal`, `rivalWillingness`, `titleSaleOutcome`, `makeRightsOffer` |
| Accept (a held title's sale) | `quoteRightsOffer` plan `accept` on a rival's buy offer: the close law's token and the consequence → minted `acceptRightsOffer`; no one-gesture accept is published for it (`saleReviewRequired`) | `closingRefusal` (via the desk row), `titleSaleOutcome`, `acceptRightsOffer` |
| Accept (a purchase or a licence grant) | one-gesture `acceptRightsOffer` row intent, confirmation=required (money moves at once, the same class as the loan shortcut); also answerable through the quote (no consequence) | `acceptRightsOffer` |
| Reject, withdraw | one-gesture `rejectRightsOffer` and `withdrawRightsOffer` row intents on the `rights` view (`StudioRightsPage`: titles with sale law, valuation, encumbrance, holdback, licences out and live seasons; offers with the close law; licences in; counterparties) | `rejectRightsOffer`, `withdrawRightsOffer` |

Contract: PROJECTION_VERSION 70 → 71; five intent kinds; two quote request/snapshot families; two Industry views; schema
JSON, generated DTOs, manifest and union fixtures regenerated by the generator (never hand-edited); the outgoing70
identity (sha256:aaafd0bd…) registered prior with a genuine capture taken by bridge-step/tools/capture70.ts on a detached
sparse snapshot of 6ddeeb00 (tests/fixtures/bridge/genuine-projection70-runtime, receipt beside the fixture). Test pins
(schema identity, projection, the F10/F11 union bodies) are read from the regenerated manifest and measured by a standalone
run of the generator's pure function before the pins were written, not copied from a failing assertion.

Coordinator readings the Owner may overrule in one line: (a) only sell offers on held titles are published on the make
path (the browser desk publishes nothing else; buy and licence offers stay core-only); (b) the one-gesture purchase accept
is confirmation=required by its verb.

Not done, by order: no native compile, EditMode, PlayMode, build or run; the Unity counterpart receives the regenerated
DTOs and fixtures and two view query helpers, STATIC-UNRUN; no presentation surface is written for the native client.
