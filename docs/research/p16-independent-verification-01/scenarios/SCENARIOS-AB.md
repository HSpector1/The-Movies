> **Superseded in part by [Reconciliation 02](../P16-RECONCILIATION-02.md) (2026-09-12).** This file is the archived run under the earlier rules. Superseded here: the "threshold gate" paragraph (the P15B window is no longer an authorization question — the P15 disposal handoff record is OWNER-SELECTED PRODUCT DIRECTION / NOT YET IMPLEMENTED); Scenario A's whole-company path ($0-floored price, transferred overdraft, "fire everyone" for $600,000 — the corrected ledger is Reconciliation 02 §5.5: no cash transfers on the estate path, guarantees are P15 claims, net outlay $300,000 plus first access to two people) and Rule Gaps A-6/A-7 (closed by default); Scenario B's "$2,500,000 of guarantees … netted" and "$9,000,000 net cash paid" (no netting, no cash transfer; the $13,000,000 bid goes to the estate); every "terminated at 50 %" figure (the P14 26-week-capped charge applies, and only to whoever ends a contract). BNW, liquidation, operating value and transaction price are defined in Reconciliation 02 §5.1. Every number remains a PAPER HYPOTHESIS.

# Paper Scenarios A & B — Independent Verification Pass

**Status of this document.** All dollar figures below are PAPER HYPOTHESES for illustration only; none is a tuned constant. This document runs Scenario A and Scenario B strictly against `design/ruleset-v2.md`'s rule text (R01–R32, §1–§23), independently of `ruleset-v2.md`'s own worked Scenarios A/B (its final section, "Paper scenarios A–F"). Where my arithmetic diverges from that section's, or where I found the source document's own worked arithmetic internally inconsistent, it is called out explicitly and cited by rule ID / section number. This is the smallest useful independent check: build fresh numbers on the stated game scale, run every applicable correction, and report contradictions the self-review pass may not have surfaced.

**Scale anchor.** Rival entry pays a one-time $5.9M capacity capex (00-KEY-FINDINGS.md finding, `src/core/hollywoodStartingData.ts:8-38`, HIGH/CONFIRMED). Both scenarios below are built at a fraction of and up to roughly that scale, per the assignment's instruction.

**Threshold gate that applies to both scenarios (read first).** R26 states its own contingency inline: *"Contingent on Owner authorization of a P15B pre-settlement estate window (§20 decision #1); until granted, no path in this rule is buildable, since approved P15 law settles every category exhaustively with no transferable estate."* Strictly speaking, **neither scenario below is executable today** — approved P15 law leaves no estate for either a bankrupt small studio (Scenario A) or a valuable distressed studio (Scenario B) to pass through. Both scenarios are therefore run *as paper hypotheses conditional on Decision #1 being granted*, exactly as `ruleset-v2.md`'s own worked scenarios do implicitly without saying so. This gate is restated once here rather than in each scenario section, and is treated as a standing qualifier on everything below.

---

## Scenario A — Bankrupt Small Studio ("Ridgeline Pictures")

### Assumptions (explicit inputs, all PAPER HYPOTHESIS)

| Item | Value | Rule basis |
|---|---|---|
| Cash | −$800,000 | P11 fact |
| Tangible capacity, original capex | $3,000,000 | P09 fact |
| Tangible recoverable credit (0.5×) | $1,500,000 | R21 lossy demolition-credit rate |
| Story Properties | 4, no library revenue history, appraised $75,000 each = $300,000 | R06/R07 |
| Active productions | **None** (deliberately excluded — see Rule Gap A-4 below for why this is not realistic) | — |
| Employees | 5, combined remaining guaranteed contracts $1,200,000; combined weekly payroll $15,000/wk | P10/P14 fact |
| Technology | None of note; avoided-research value $0 | R22 |
| Willingness/eligibility posture | Studio is in P15 bankruptcy/estate disposition, not a healthy-acquisition target — R24/R25 (`Willingness State`, independence premium) do **not** apply; R26 governs | R24 scope, R26 |

### Book Net Worth

BNW = Cash + tangible recoverable credit + scheduled receipts − contract guarantees
= −800,000 + 1,500,000 + 0 − 1,200,000
= **−$500,000**

*(Modeling note, not a rule change: BNW's tangible-asset line uses the same P09 recoverable-credit rate as the asset-basis lane of Studio Valuation, because neither P11 nor P09 carries any separate depreciated "book value" for facilities distinct from that liquidation convention — R23 states BNW is "new P16 read-model authority over raw P11/P09 fields," but does not itself define what number stands in for a fixed asset's book value. This is Rule Gap A-1, below.)*

### Studio Valuation (asset basis; going-concern basis is not evaluated — a studio this small and this deep in distress has no meaningful trailing operating cash flow to capitalize)

SV = tangible recoverable ($1,500,000) + Story Property library value ($300,000) + tech gap ($0)
= **$1,800,000**

### Liquidation (asset-lot) path — R26 default

Per R26, each asset is its own lot at "its own liquidation-reserve floor." R21 gives an explicit floor formula for tangible capacity (the 0.5× demolition-credit rate). **No rule gives an equivalent floor formula for a Story Property lot** — R06/R07 define only an ongoing, undiscounted *appraisal* ceiling, never a distress-sale reserve (Rule Gap A-2). For this paper run, reserves are set at full appraisal ($75,000 × 4 = $300,000) as the only number the ruleset actually defines, flagged explicitly as filling a gap rather than applying a rule:

- Tangible lot clears at $1,500,000 (no competing bidder needed — it is the floor itself).
- 4 Story Property lots clear at $75,000 each = $300,000 (assumes at least one bidder per lot at reserve; see Rule Gap A-5 on what happens if none appears).
- **Gross estate proceeds = $1,800,000.**
- Estate pays off the $800,000 overdraft.
- Estate settles the 5 employee contracts under ordinary termination law at 50% of the remaining guarantee (09-valuation-finance.md §5, K7: "unwanted = −0.5 × remaining guaranteed salary (accepted termination law)" — this is the actual P14 termination formula, not a paper invention) = 0.5 × $1,200,000 = $600,000. Employees are released to the open talent pool for any studio, including a later buyer, to hire fresh.
- **Estate net = $1,800,000 − $800,000 − $600,000 = $400,000 surplus**, recorded in history, paid to no party (no rule anywhere in R01–R32 states what happens to a liquidation surplus after obligations are cleared — see Rule Gap A-3; this write-up assumes the surplus is destroyed/not distributed to any rival, consistent with the anti-snowball intent of §17, but that is an inference, not a cited rule).
- A buyer who wants the tangible + all four properties pays **$1,800,000 gross**, inherits nothing else, and must separately re-hire staff at market rates.

### Whole-company purchase path — R26 "whole-entity" path, Model D (R11) at close

R26 states a "separate whole-entity path exists only for a going-concern reorganization," but gives **no reserve formula** for that lot (unlike the asset-lot path, which at least borrows R21's tangible formula) — Rule Gap A-6, arithmetically identical in kind to Rule Gap A-2. This run assumes, as the only floor R17 actually states generally, **reserve = max(BNW, $0) = $0** (BNW is −$500,000 here).

Assume one interested rival bids **$300,000** (a rational private valuation: SV $1,800,000 minus the $1,200,000 of guarantees it will assume ≈ $600,000 ceiling, discounted for integration friction and this target's low strategic value to ≈ $300,000).

Applying R17's corrected formula exactly as stated — *"Transaction Price = (SV excluding target cash × premium/bid) + target cash at par"*, and *"No Transaction Price or Liquidation Reserve is ever negative — floored at $0... any excess negative-cash burden remaining the source estate's/P15's problem, never a silent second charge to the buyer"*:

Transaction Price = $300,000 (bid) + (−$800,000 cash at par) = **−$500,000 → floored at $0.**

So the buyer pays **$0** cash at closing, assumes the $1,200,000 of employee guarantees intact (R19, `signingBonus: 0` on the reissued contracts), and — per R17's own text — the $500,000 of overdraft that the floor prevented from being charged is **not** billed to the buyer. **Rule Gap A-7 (specific and load-bearing): R17 states the principle (buyer is never charged the excess) but not the mechanism.** It does not say whether (a) the buyer's books show the full −$800,000 cash absorbed anyway (just with no negative price to offset it, effectively a gift of $500,000 relative to a literal netting), (b) the estate/P15 writes off $500,000 of the overdraft before transfer so the buyer only actually absorbs $300,000 of negative cash, or (c) some other split applies. These three readings produce different buyer cash positions and are not equivalent — this needs a decision, not just a floor statement.

If the buyer then immediately fires all 5 inherited employees (R19's now-safe "ordinary termination law" path): termination cost = 0.5 × $1,200,000 = $600,000. **Total all-in cost for "assume the whole company, then fire everyone" = $0 (price) + $600,000 (termination) = $600,000**, versus **$1,800,000** to buy the same tangible + properties as clean asset lots. This is not a rule defect by itself — R26's own design intends exactly this kind of legible three-way trade-off (§13; mirrored in `ruleset-v2.md`'s own Scenario A discussion) — but it is highly sensitive to Rule Gap A-6 (undefined whole-entity reserve) and Rule Gap A-7 (undefined floor mechanism): under reading (b) above the buyer's true cost is unchanged from this calculation; under reading (a) the buyer has effectively received a $500,000 windfall with no cited rule explaining where that value came from or why it isn't itself an exploit.

### Cross-check against `ruleset-v2.md`'s own Scenario A (internal-consistency finding)

`ruleset-v2.md`'s own worked Scenario A computes: *"Liquidation Value (asset basis): $1,000,000 (tangible) + $150,000 (properties) − $50,000 (overdraft) = $1,100,000"* — netting the overdraft **directly into** the figure it labels "asset basis." But the same document's §21/§14 restatement of the R17 correction, used to correct its own Scenario B, says the opposite: *"Auction/Liquidation reserve = tangible + receipts, cash excluded from this lane by definition (BNW's asset basis already nets cash separately)."* **These two passages of the same corrected document use inconsistent conventions for the same figure** — Scenario A nets cash into the liquidation/asset-basis figure; the general rule (and Scenario B) says cash must be excluded from that exact lane. This write-up follows the general rule (cash excluded from the liquidation-reserve lane, netted only into BNW) throughout, which is why the $1,800,000 liquidation-proceeds figure above does not subtract the $800,000 overdraft — that subtraction happens only in BNW and in the whole-entity R17 calculation, not twice.

### Does the ruleset handle Scenario A without contradiction?

**No — qualified pass.** The three-path comparison (clean lots / lots + assumed contracts / whole company) is legible and produces a sensible ordering once Rule Gaps A-2, A-6 and A-7 are each filled with *some* explicit number, but none of those three gaps is actually closed by any cited rule text today, and the source ruleset's own worked Scenario A uses a cash-netting convention that contradicts its own general R17 statement. The three-path trade-off itself (§13's stated goal) is achieved in spirit, not yet in a fully specified way.

### Failures found (absurd / exploitable / contradictory)

1. **R26's "whole-entity reorganization" label textually collides with R11's absolute Model-B ban.** In ordinary usage — including the real-world Chapter 11 concept R26's own evidence base cites (08-realworld-ma.md, TWC §363 case) — a "reorganization" means the debtor **continues operating independently** post-process. R11 permanently forbids exactly that outcome (no autonomous subsidiary, ever, ruled out for both healthy and — by extension, since R26 never carves out an exception — distressed acquisitions). As written, an implementer following R26's own text for "the whole-entity path" could stand up a surviving, independently operating entity for a bankrupt studio, silently reopening Model B through the one door (bankruptcy) that R11's healthy-acquisition-framed rationale never explicitly addresses. *Smallest correction: R26's whole-entity path should state explicitly that the acquirer still makes the R11/Model-D choice at close (Absorb Completely or Absorb Operations + Retain Brand as Label) — a reorganization in this ruleset means "the entity's assets and productions survive the closure atomically," never "the entity keeps operating independently of its buyer."*
2. **Internal inconsistency in `ruleset-v2.md` itself** — its own worked Scenario A nets cash into "asset basis"/Liquidation Value; its own §21/§14 restatement (used to fix Scenario B) says cash must be excluded from that lane. One of the two worked examples is following a convention the document's own corrected general rule forbids. (Documentation defect, not a game-breaking exploit, but it means a builder reading only Scenario A as a worked template would implement R17 incorrectly.)

### Rule gaps found (a needed decision no rule covers)

- **A-1.** No rule states what number stands in for a fixed asset's "book value" for BNW purposes, given neither P11 nor P09 tracks a depreciated book-value schedule distinct from the liquidation recoverable-credit rate. BNW's tangible line is, by construction, borrowed from a liquidation convention — worth stating explicitly rather than leaving implicit.
- **A-2.** No reserve/floor formula exists for a Story Property sold as an individual bankruptcy asset lot (R06/R07 define only an ongoing appraisal ceiling, never a distress-sale floor).
- **A-3.** No rule states what happens to a liquidation surplus once the estate's obligations are cleared (destroyed / credited to some registry / other) — this write-up assumes "destroyed, not distributed" as the only anti-snowball-consistent inference, but it is an inference.
- **A-4.** Scenario A as specified by the assignment has no active productions, but any *real* small studio approaching bankruptcy is very likely to have at least one production mid-flight. R04a (production lock on R1/R3 sale) and R20 (transfer-and-finish) both already cover this in principle, but neither is exercised by this scenario as scoped — flagged so this isn't mistaken for "small studios never have this problem."
- **A-5.** R26 says unsold lots "persist... at the reserve set at window close, which may fall once more from continued lack of bidders but never drifts down indefinitely while unsold" — but does not state the *magnitude* of that one-time fall, nor any sunset/write-off path for a lot (exactly this scenario's low-appeal, no-tech, modest-portfolio properties) that never attracts a bid even at the reduced reserve. Left as designed, an estate catalogue can accumulate permanently unsold, functionally worthless lots indefinitely — a save-bloat/UI-clutter risk R32's transaction-frequency guard does not address (R32 bounds repeated *trading*, not permanently *unsold* inventory).
- **A-6.** No reserve formula exists for the whole-entity lot itself (only "a separate whole-entity path exists," no number).
- **A-7.** R17's $0 floor states the principle (never a second charge to the buyer) but not the ledger mechanism for the "excess negative-cash burden" it defers to "the source estate's/P15's problem" — three materially different implementations are all consistent with the rule's own wording (see full discussion above).

---

## Scenario B — Valuable Distressed Studio ("Highland Crest Pictures")

### Assumptions (explicit inputs, all PAPER HYPOTHESIS)

| Item | Value | Rule basis |
|---|---|---|
| Cash | −$4,000,000 (heavy obligations, in P15 distress/warning) | P11 fact |
| Tangible capacity, original capex | $6,000,000 (above the $5.9M rival-entry reference — an established mid-size studio) | P09 fact |
| Tangible recoverable credit (0.5×) | $3,000,000 | R21 |
| Locked scheduled receipts (active TheatricalRuns still paying out) | $600,000 | R04b |
| Contract guarantees (remaining, staff + Stars) | $2,500,000; combined weekly obligations $40,000/wk | P10/P14 |
| Trailing realized operating cash flow (last 52 weeks) | $1,000,000 (positive — the studio's films still earn; its problem is debt load, not creative failure) | R23 |
| Story Property library | 5 films, R1+R2 co-held (the ordinary default case): catalog value $7,500,000. 1 film where R2 was previously sold off to a third party, Highland Crest retains only R1 (continuation authority): franchise-option premium $500,000. 2 shelved/unproduced Story Properties: $0 by default. | R06 (co-holding fix + shelved-valueless default) |
| Technology | **1 completed** technology the buyer lacks; buyer-relative avoided-research value $2,500,000. **Also** one *in-flight, uncompleted* research project the target has sunk $800,000 into — does **not** transfer (R22) and contributes $0 to any buyer's valuation. | R22 |
| Active productions | 3: development ($200,000 sunk, ~20% "complete"), production ($2,000,000 committed, 60% complete), post-production ($1,500,000 committed, 90% complete) | R20 |

### Applying R06's co-holding fix explicitly (this is the case `ruleset-v2.md`'s own Scenario B does not test)

`ruleset-v2.md`'s own Scenario B states its 5 properties/40 films have "none co-holding both R1 and R2 on the same title — so R06's co-holding fix does not change this figure," i.e. it deliberately sidesteps the exact fix it introduced. This scenario runs the fix on purpose:

- 5 co-held titles → **only** the R2/catalog lane counts: $7,500,000. R1's franchise-option premium is **not** added for these (would double-count per R06).
- 1 title with R1 held apart from R2 (R2 sold off previously) → franchise-option premium **is** added: $500,000.
- 2 shelved/unproduced properties → $0 each, by R06's explicit default.

**Library Valuation = $7,500,000 + $500,000 + $0 = $8,000,000.**

### Active-production and in-flight-research value (Rule Gap B-1 — no cited formula exists; paper convention borrowed from 09-valuation-finance.md §5, flagged explicitly as filling a gap, not applying a rule)

09-valuation-finance.md's own K5 constant ("production recoverable work = 0.5 × committed cost × completion") is the only value-conversion convention anywhere in the evidence base for this — and it was **not carried forward into `ruleset-v2.md`'s Rule List** (R20 covers transfer *mechanics* only, never a valuation formula). Using it here as a labeled paper assumption:

- Development: 0.5 × $200,000 × 0.20 = $20,000
- Production: 0.5 × $2,000,000 × 0.60 = $600,000
- Post-production: 0.5 × $1,500,000 × 0.90 = $675,000
- **Active-production buyer-relative value ≈ $1,300,000** (rounded)

In-flight, uncompleted research ($800,000 sunk by the target) contributes **$0** — R22 draws a hard completed/incomplete line with no partial credit.

### Book Net Worth

BNW = Cash + tangible recoverable + scheduled receipts − contract guarantees
= −4,000,000 + 3,000,000 + 600,000 − 2,500,000
= **−$2,900,000**

*(Neither the active-production committed cost nor the in-flight research spend appears in BNW — P11 carries no work-in-progress asset account; money already spent is simply gone from cash, which is already reflected in the depressed cash figure. This is a modeling note, not a rule this document is aware of stating it explicitly — see Rule Gap B-1.)*

### Studio Valuation

R23: SV = max(going-concern basis, asset basis) for the *operating core* (tangible plant vs. capitalized trailing cash flow), **plus** the separable addends (library, tech-gap, active-production value) on top of whichever core wins — this reading is itself an inference this write-up had to make; see Rule Gap B-2 below on why the text is ambiguous about whether library/tech/production sit inside or outside the `max()`.

- Operating core, asset-basis reading: tangible ($3,000,000) + receipts ($600,000) = $3,600,000.
- Operating core, going-concern reading (R23's bounded, non-perpetuity multiple; paper multiple 3.0×, per 09-valuation-finance.md K1): 3.0 × $1,000,000 = $3,000,000.
- **Operating core = max($3,600,000, $3,000,000) = $3,600,000** — for this target, its distress has depressed trailing cash flow below what its physical plant alone would fetch at liquidation-credit rates, an appropriately "asset-rich, income-poor" distressed profile.
- SV = $3,600,000 (core) + $8,000,000 (library) + $2,500,000 (tech gap) + $1,300,000 (active productions)
- **SV = $15,400,000**

### Whole-entity auction (R26 whole-entity path — again undefined reserve, see Rule Gap A-6/B-3)

Reserve = max(BNW, $0) = $0 (BNW is −$2,900,000).

Two rival bidders submit private valuations under R26's sealed one-shot comparison, each independently discounting the $15,400,000 SV ceiling for integration friction and diminishing strategic value (§17): $11,000,000 and **$13,000,000** (winning bid).

Applying R17's corrected formula: Transaction Price = $13,000,000 (bid, excludes cash) + (−$4,000,000 cash at par) = **$9,000,000** net cash the winning bidder actually pays at close. Per R18, the $2,500,000 of contract guarantees transfer intact and are already netted into why the bid landed at $13,000,000 rather than closer to the $15,400,000 ceiling — they are not a second, separate charge.

### The three/four numbers, side by side

| Figure | Value | What it says |
|---|---|---|
| Book Net Worth | **−$2,900,000** | "Worthless, avoid" if read alone |
| Studio Valuation | **$15,400,000** | "Very valuable, pursue" if read alone |
| Whole-entity winning bid (excl. cash) | **$13,000,000** | What the market actually clears at, net of integration-friction/strategic-value discounting below the SV ceiling |
| Transaction Price (net cash paid at close) | **$9,000,000** | The bid, after R17's cash-at-par adjustment |

These four numbers are genuinely different and none is a garbled average of another — directly satisfying §14's core requirement and the assignment's own framing for Scenario B.

### R30 affordability check (does the ruleset stop an under-capitalized bidder from winning?)

Combined weekly obligations post-close ≈ $40,000/wk (target) + $60,000/wk (a plausible bidder's own payroll) = $100,000/wk. R30's reserve requirement = 26 × $100,000 = $2,600,000 minimum **post-close** cash. The winning bidder's pre-close cash must therefore be at least $13,000,000 (bid) + $4,000,000 (absorbing the target's negative cash at par) + $2,600,000 (reserve) ≈ **$19,600,000** — well above the SV ceiling itself. This is the anti-snowball affordability law (§17) working exactly as intended: only a small number of very well-capitalized rivals (or the player, if sufficiently capitalized) could actually close this specific deal. **No contradiction found here — confirmed pass.**

### Does the ruleset handle Scenario B without contradiction?

**Qualified pass, with one concrete internal-consistency failure found in the source document itself.** The four-number ladder computes cleanly and shows genuine divergence once R06's co-holding fix, R22's completed-knowledge-only rule, and R17/R18's netting are all applied together — no contradiction in *this* run. But see Failure B-1 below: `ruleset-v2.md`'s own worked Scenario B is not internally complete.

### Failures found (absurd / exploitable / contradictory)

1. **`ruleset-v2.md`'s own worked Scenario B states a fact it then never uses.** It explicitly lists "two active productions carrying $3,000,000 of sunk, recoverable-in-place committed cost" as a scenario input — directly responsive to the assignment's own requirement that Scenario B include "several active productions" — but its actual BNW/SV/Auction arithmetic (*"Studio Valuation... = $2,000,000 (tangible+receipts) + $8,000,000 (library) + $2,000,000 (buyer-relative tech) ≈ $12,000,000"*) never incorporates that $3,000,000 figure anywhere. The deliverable that was supposed to demonstrate how active productions affect a distressed valuation does not, in fact, demonstrate it. This is the same underlying gap as Rule Gap B-1 (no formula converts production committed-cost/completion into BNW or SV) — but it is also, independently, a completeness defect in the specific document being verified, worth naming on its own.
2. **A valuation cliff-edge at the completed/incomplete research boundary (R22).** Two otherwise-identical distressed targets — one one week from completing an expensive technology, one that never started it — receive **identical** ($0) buyer-relative tech value under R22's hard line, despite the near-complete target having sunk real, mostly-recoverable cost into it. This is not necessarily wrong (simplicity has real value, per the assignment's own instruction against clerical granularity), but it does mean a target's *most* strategically interesting near-term asset (research about to pay off) is systematically invisible to every valuation lane in this ruleset, which seems in tension with the same assignment section's (§2.F) express interest in valuing verified, near-complete capability. Flagged as a design tension, not a hard defect.

### Rule gaps found (a needed decision no rule covers)

- **B-1.** No formula anywhere in R01–R32 converts an active production's committed cost/completion into a BNW or Studio Valuation contribution, despite the assignment (§2.N) explicitly listing "active productions" as an SV input and both paper scenarios requiring them. 09-valuation-finance.md's own K5 convention was proposed but not carried into the final Rule List.
- **B-2.** R23's `max(going-concern basis, asset basis)` does not state whether the separable addends (library, tech-gap, active-production value) sit *inside* each of the two competing lanes (in which case they'd need to be added to both, making the `max()` meaningless whenever they dominate) or *outside* it, added once to whichever lane wins. This write-up assumed the latter (the only internally consistent reading) but the rule text does not say so.
- **B-3.** Same as Rule Gap A-6 — no reserve formula for the whole-entity auction lot; more consequential here since a valuable, actively-producing distressed target is the paradigm case for the whole-entity path rather than fragmenting into asset lots, per R26's own text.
- **B-4.** R08's 52-week anti-flip holdback references "a newly acquired... asset," but does not address the case (exactly this scenario's post-production film) where the asset in question — a released film's R2 — does not exist yet at the moment of acquisition, only becomes sellable weeks or months later when the inherited production finishes. It is undefined whether the holdback clock starts at the acquisition date or the release date.

---

## Summary table

| | Scenario A (bankrupt small studio) | Scenario B (valuable distressed studio) |
|---|---|---|
| Handles without contradiction? | Qualified pass — 3 undefined reserve/mechanism gaps (A-2, A-6, A-7), plus 1 textual contradiction found (R26 "reorganization" vs. R11 Model-B ban) and 1 internal inconsistency in the source document's own worked example (cash-netting convention) | Qualified pass — clean four-number divergence once every correction is applied, but the source document's own worked example omits active-production value entirely from its arithmetic (Failure B-1), and 2 formula gaps (B-1/B-2) had to be filled by inference to complete the run |
| Book Net Worth | −$500,000 | −$2,900,000 |
| Studio Valuation | $1,800,000 (asset basis only) | $15,400,000 |
| Transaction/Auction Price | $0 (whole-company, floored) or $1,800,000 (clean asset lots) | $13,000,000 bid / $9,000,000 net cash paid |
| New failures found beyond `ruleset-v2.md`'s own repair pass | 2 (R26/R11 label contradiction; Scenario A's own cash-netting inconsistency) | 2 (Scenario B's own incomplete arithmetic; R22 valuation cliff-edge) |
| New rule gaps found beyond `ruleset-v2.md`'s own §20 list | 7 (A-1 through A-7) | 4 (B-1 through B-4, two shared with Scenario A) |

All figures above are PAPER HYPOTHESES. All recommendations implied by the "smallest correction" notes are INFERENCE, offered for the Owner's/Future Ops' consideration, not a reopening of any settled §2 direction.
