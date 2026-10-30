# Sprint 27 — independent review of 3d5b8b7a (2026-10-30, 14:30 to 14:37 CDT)

Reviewer: one read-only Opus 5.5 subagent briefed on the frozen commit 3d5b8b7a (parent 6ddeeb00), the Owner's §3
text, the browser counterpart (ui/src/screens/RightsDesk.tsx, ui/src/engine/rights.ts) and the core laws. It ran no
tests (vitest writes caches); it recomputed the fixture and manifest hashes itself. Verdict: ACCEPTABLE WITH FIXES (1, 2, 3).

## Findings and dispositions

| # | Severity | Finding (file) | Disposition |
|---|---|---|---|
| 1 | SHOULD FIX | tests/bridge-astra27-rights-estate.test.ts: the decision B guard is exercised only for the sell-offer plan; no test for an acceptance with a null or stale digest, for an accept-plan quote refused by the desk's close law, or for a closed player (no rights intents, views still read) | ADOPTED in FIX-1: three cases added, each against the core on the same state |
| 2 | SHOULD FIX (low) | bridge/rightsDesk.ts, StudioRightsOfferQuoteSnapshot: the accept-plan quote never names the instrument, so a licence buy offer would read as a title sale (cannot happen today: rivals start no offers and R4 grants are closed; the contract outlives that) | ADOPTED in FIX-1: `instrument` (nullable StudioRightsInstrument) added; `playerSells` true only for a title |
| 3 | SHOULD FIX (low) | bridge/rightsDesk.ts rightsPage: `titles` is paged but `offers` (every offer ever made or received) returns whole, breaking the bounded-read rule the television view keeps | ADOPTED in FIX-1: the offers (the list that grows) are paged newest first; the held titles ride whole and the notice says so |
| 4 | NIT | session.ts resolveRightsIntents applies the one-gesture accept directly rather than through rightsOfferDraftApply | NOT ADOPTED: the intent exists only when `saleReviewRequired` is false, is re-resolved on the live state and digest-bound; routing it through the guard would add a second code path for a case that owes no disclosure. Recorded |
| 5 | NIT | zero/false placeholders on refused or unknown paths (spendableBefore/reserve without an industry; price 0 and playerSells false for an unknown offer; resaleHoldback false for a title not held) | PARTLY ADOPTED in FIX-1: the comment names them as non-figures beside `ok:false`; the shapes stay (the absorption and loan snapshots behave the same way). Recorded |
| 6 | NIT | licence `use` as free text widens the core's closed LicenceScope | ADOPTED in FIX-1: enumeration of the core's R3_USES and R4_USES |
| 7 | NIT | three Bridge-worded refusals (unknownOffer token; the stale and null digest sentences differ from the browser's) | ADOPTED in FIX-1: the core's own `rights: unknown offer <id>` sentence; the browser's two sentences verbatim |
| 8 | NIT | cost: titleSaleOutcome runs twice per quote; rightsDeskView built on every snapshot and command for the intents; a corrupt closed estate now fails every snapshot (loudly) | PARTLY ADOPTED in FIX-1: the quote reuses its disclosure; the per-snapshot desk read and the loud failure are recorded, not changed (no performance campaign is authorized) |
| 9 | NIT | tests pin a title string, a claim count and a test-side cash subtraction; several refusal tokens asserted as bare strings; "refused quote never commits" passes for any unregistered id | ADOPTED in FIX-1: cash compared with the core's successor; tokens compared with the core law on the same state; the rejection code asserted. The title and count stay as readable premise pins beside the core comparisons |
| 10 | NIT | tests/bridge-astra20-intent-confirmation.test.ts founding-world loop would expect `none` for an acceptRightsOffer option; the Sprint 22 doc comment detached from its constant | ADOPTED in FIX-1 |
| 11 | NIT | an accept-plan quote on the player's own offer shows the player as counterparty (the core refuses it anyway) | NOT ADOPTED: display fields of a refused quote. Recorded |

## Verified by the reviewer (one line each, from its report)

No figure or refusal computed in the Bridge; the sell law and close law are the sources of each refusal; no refused quote
registers a commit; `saleReviewRequired` is exactly the browser's rule and sell offers always disclose; the disclosed digest
is server-held and the commit recomputes it; pending quotes are digest-bound and cleared on every command; duplicates are
the core's; the purchase accept is `required` by verb and quote-minted commits `none`; a closed player gets no intents while
the views still read; the wire unions are closed with disjoint discriminators and the claims enumeration equals the core's;
PROJECTION_VERSION moved once; the outgoing70 capture's identity, head and hashes agree with the parent manifest and the
receipt; the generated C# matches the manifest; the pin comments say how they were measured; existing views and intent
ordering are unchanged.
