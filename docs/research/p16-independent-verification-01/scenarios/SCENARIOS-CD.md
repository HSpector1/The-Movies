# P16 Paper Scenarios C & D — Worked Verification Under Ruleset v2

**What this is.** An independent second-reviewer run of assignment §3 Scenarios C and D strictly
against `design/ruleset-v2.md` (the Phase-3 repaired ruleset), checking each scenario for internal
contradiction, exploitability, and rule gaps, with reproducible paper arithmetic. **All dollar
figures in this document are PAPER HYPOTHESES** — round numbers in the game's existing dollar scale
(the one hard anchor point in accepted code is rival entry capacity capex = $5.9M,
`src/core/hollywood.ts:158-160`, cited at 00-KEY-FINDINGS.md:215/04-code-audit.md:103) — not tuned
constants and not a claim about any specific rival's actual state. No Owner-selected direction from
assignment §2 is reopened; where the ruleset already flags an item as a genuine Owner decision, this
document reports that rather than resolving it.

Every rule cited below is ruleset-v2.md's own text (§ numbers refer to ruleset-v2.md sections; R‑IDs
refer to its Rule List, §"RULE LIST (R01–R32)"). Evidence locators inside those rules trace back to
the numbered dossiers as ruleset-v2.md itself cites them; this document does not re-derive evidence,
only applies it.

---

## SCENARIO C — Healthy rival ("does not want to sell")

**Setup (PAPER HYPOTHESIS).** Rival "Rival H": profitable, one modest recent dip, strong brand,
valuable library, family-controlled (low deal appetite). Facts as stated for this scenario only:

| Fact | Value | Lane |
|---|---|---|
| Cash | $3.0M | BNW + SV (at par) |
| Locked scheduled receipts (active TheatricalRun payouts owed) | $0.5M | BNW + SV |
| Tangible plant, book value (cost less depreciation) | $4.0M | BNW only |
| Tangible plant, recoverable/demolition credit (0.5× recorded capex, R21) | $3.0M | SV asset-basis lane only |
| Existing typed obligations (contract guarantees + committed production cost) | $1.0M | BNW (liability) + R18 netting |
| Story Properties: 5 films where Rival H co-holds both R1+R2 | catalog (R2) lane only, $2.0M combined | SV — R06-corrected |
| Story Properties: 2 unproduced properties held as R1 only (no R2 to co-hold against) | franchise-option premium, $0.3M each = $0.6M | SV |
| Recent realized annual operating cash flow | $1.0M | input to bounded OV term |
| Willingness State | **Reluctant** (one loss year in the smoothed multi-period window; independence-preference trait "family-founded") | R24 |
| Independence-premium band for Reluctant | 1.4×–1.8× | R25 (ruleset-v2 §12 Scenario C band) |

### Mechanism walkthrough

**Book Net Worth (accounting identity, R23 — "no properties, no OV, no forecasts").**
BNW = Cash + Receipts + Book Tangible − Obligations = 3.0 + 0.5 + 4.0 − 1.0 = **$6.5M**.

**Studio Valuation, SV = max(GC, AB) (R23).**
Library Valuation applies the R06 correction explicitly: the 5 co-held films contribute only their
R2/catalog value ($2.0M — R1's franchise-option premium is *not* separately added on top, closing
the double-count the naive "count each once" reading would otherwise produce); the 2 R1-only
properties add their franchise-option premium in full because R1 is held apart from R2. Library
Valuation = 2.0 + 0.6 = **$2.6M**.
Going-concern OV term (R23 correction — bounded, non-perpetuity: a short explicit multiple on
recent realized operating cash flow, no terminal-value growth assumption): $1.0M × 4 = **$4.0M**.
- GC = OV + Cash + Receipts + Library = 4.0 + 3.0 + 0.5 + 2.6 = **$10.1M**
- AB = Cash + Receipts + Liquidation Tangible + Library = 3.0 + 0.5 + 3.0 + 2.6 = **$9.1M**
- SV = max(GC, AB) = **$10.1M**

**Transaction (Ask) Price (R17 + R25 + R18, reconciled as one transaction).**
`Transaction Price = (SV excluding target cash × premium band) + target cash at par − existing typed
obligations at full value`, floored at $0 (R17). SV excl. cash = 10.1 − 3.0 = 7.1.
- Ask (low, 1.4×) = 7.1 × 1.4 + 3.0 − 1.0 = 9.94 + 3.0 − 1.0 = **$11.9M**
- Ask (high, 1.8×) = 7.1 × 1.8 + 3.0 − 1.0 = 12.78 + 3.0 − 1.0 = **$14.8M**

**Buyer's rational ceiling (BPV, one-lot absorption, buyer-relative — R08/R09 evidence base's own
term, not a rule ID; not shown to the player, R07/R12's "no hidden multiplier" governs only the
*seller's* shown figures).**
Cash 3.0 + Receipts 0.5 + Liquidated tangible 3.0 (R21, credited to buyer as cash, nothing physical
transfers) + Library at 60% buyer-relative usefulness (2.6 × 0.6 = 1.6) + wanted-staff retention
value 0.5 − unwanted-staff ordinary-termination cost 0.2 − obligations inherited regardless of price
1.0 = **$7.4M**.

**Three numbers, side by side:** BNW **$6.5M** / SV **$10.1M** / Ask (Transaction Price) **$11.9M–$14.8M**
/ Buyer's own rational ceiling **$7.4M**. All four are genuinely different figures from the same
facts, exactly as §14/R23 requires — no collapsing, no double count. The buyer's rational ceiling
sits below even the low end of the seller's Ask range, which is R25's intended structural outcome
(the seller is pricing a going-concern surplus the one-lot buyer cannot keep, since the plant is
liquidated rather than operated at absorption, R21) — not a bug, and not something this document
recommends correcting.

### What the willingness/premium model shows the player (R24, R27)

- **Always public, pre-offer:** the Willingness State label (`Reluctant`) and its two disclosed
  drivers — recent performance/Standing trend (one loss year in the smoothed window) and the
  independence-preference trait. This matches R24's corrected scope exactly.
- **Not public pre-offer:** any P15-condition-derived component of the state. Per R24's authority
  correction, this remains withheld until the player opens the R27 due-diligence event — Rival H is
  not distressed in this scenario, so the point is moot here, but the rule is exercised as written.
- **Once a due-diligence event is opened (R27):** a bounded, dated snapshot is disclosed — the SV
  figure and its lane breakdown, at a one-time modest cash cost, and opening it itself starts the
  same per-(buyer, Rival H) cooldown a rejected offer would (closing the "open, read, close, repeat"
  free-scouting loop the R27 exploit-moderate correction targeted).
- **Once an offer is formally opened:** the published Ask figure (or, before that, the band and the
  formula version, per R07/R12's "no hidden multiplier" discipline extended by analogy from asset
  sales to whole-studio Asks). An offer below Ask is refused with a stated reason ("offer below
  band") rather than a bare "no."
- **Never shown to the player as a target-side fact:** the buyer's own BPV. That figure is the
  buyer's private computation, not something the target discloses — nothing in R07/R12/R24 requires
  or permits the seller UI to reveal it, so there is no leak here.

### Repeated rejected bids

R24: "every refusal states a plain typed reason... and starts a cooldown" (paper: 26 weeks, dossier
09 §4.2's own worked pattern, F27). Mechanically: player bids $10.0M (below the $11.9–14.8M Ask) →
refused, reason = offer-below-band shortfall shown → cooldown starts → player may not re-approach
Rival H until the cooldown elapses → after 26 weeks, player may bid again; if Rival H's own
independent performance trend has not changed the state, the same Ask range applies and a repeat
below-Ask bid is refused again, on a fresh cooldown of the same fixed length.

**No rule anywhere in R01–R32 makes the *n*-th rejection different from the 1st** — no escalating
cooldown, no hardening of the willingness state, no relationship-damage penalty tied to bid count.
This is a genuine **rule gap**, not a contradiction: assignment §2.O explicitly asks "whether
repeated rejected bids have consequences," and the honest current answer under ruleset-v2 is *only
the flat, fixed-length cooldown, repeated identically every time* — the willingness state moves only
from Rival H's own performance/condition, never from how many times it has been approached. This is
a defensible design (comparators do not model "wearing down" a healthy target — GearCity's health
gate and Football Manager's stance both key off the target's own state, never approach-count,
§16), but it is worth stating explicitly as an open, undecided refinement rather than silently
assuming the ruleset already answers it. Recommended smallest closure if the Owner wants one:
either leave it exactly as documented here (a legitimate "no" answer), or add one clause — an
Nth consecutive rejection (same buyer, same target, no intervening state change) extends the
cooldown by a fixed increment — without inventing a new hidden multiplier. Not adding this is not a
structural defect; it is a **remaining uncertainty**, logged here rather than assumed.

### Can the target refuse regardless of price?

**Yes, but only in one state.** `NotForSale` (R24) refuses every offer "at any price" — this is the
literal, unconditional refusal-regardless-of-price case, matching Disney's 2004 rejection of
Comcast "as too low" (price alone did not move the board) and the real-world control-premium
evidence R25 already cites. For the other three states (`Reluctant | Open | Willing`), refusal is
conditioned on price, not absolute: the merged-ruleset §12 prose ruleset-v2 carries forward unchanged
("Every other refusal states a plain typed reason ('offer below band'...)") establishes that an
offer meeting or exceeding the published Ask is not refused — it is accepted. So the accurate,
non-contradictory answer is: **a target in `Reluctant/Open/Willing` cannot refuse an offer at or
above its own published Ask; only `NotForSale` is a true refuse-at-any-price state.** This matches
assignment §2.L's own instruction ("Price may influence willingness strongly... a healthy studio
should be allowed to reject an offer") without over-reading it as "always refusable" — the Owner's
instruction is satisfied by the `NotForSale` state existing at all, not by every state being immune
to a sufficiently high bid.

**Minor documentation gap (not a rule-list defect):** the "offer ≥ Ask is accepted deterministically"
mechanism is stated in ruleset-v2's carried-forward §12 prose and in the underlying evidence
(09-valuation-finance.md §4.2, "the target accepts any offer ≥ ASK; deterministic; no dice") but is
not restated as its own sentence inside R24 or R25's Rule List text — both rules define the label
set and the price formula but not the acceptance predicate itself. This is a wording completeness
gap worth closing when R24/R25 are next touched, not a substantive ambiguity: no other passage
contradicts it, and this document confirms it by inspection.

### Scenario C verdict

- **Handles the scenario without contradiction:** Yes. BNW/SV/Ask are computed from a single
  consistent set of facts with no double count (R06/R23 applied), the R17 cash-netting-then-add-back
  order is followed exactly once (not applied twice, avoiding the OpenTTD mixed-convention exploit
  R17's own correction closes), and the willingness/price windows are independently smoothed (R24/R25)
  so no single manufactured event moves both the gate and the price together.
- **Failure found:** none. The buyer's rational ceiling sitting below the seller's Ask floor is the
  intended structural anti-snowball outcome (§17), not an absurd or exploitable result.
- **Rule gap found:** repeated-rejected-bid consequences beyond the flat fixed cooldown are
  unaddressed by any rule (see above) — logged as a remaining uncertainty, not assumed answered.
- **Documentation gap found:** the offer-≥-Ask-accepts predicate lives in carried-forward prose and
  evidence, not in R24/R25's own Rule List sentences — a completeness note, not a contradiction.

---

## SCENARIO D — Technology target (buyer wants research it lacks)

**Setup (PAPER HYPOTHESIS, adapted from ruleset-v2's own worked Scenario D and dossier
09-valuation-finance.md's fuller "Northlight" example — both are consistent with each other and
with R22).** Buyer holds Technology II. Target "Rival T" has completed Technology III. Whole-studio
purchase price: $3.0M. Buyer's own organic path to Technology III: $2.0M of research plus a $0.8M
physical build. Target is a **rival** studio — under current accepted code, rival studios hold only
an abstract `{capability, capacity}` record with a flat weekly Opex and no tier/footprint/blueprint
field (03-authority-domains.md §B1/B6, 00-KEY-FINDINGS.md:77) — so this scenario's own physical
detail ("a Tech III stage on the target's lot") is itself illustrative, not a claim that such a
stage exists in any addressable rival record today (see "Abstract capacity vs. real lot" below).

### The six separated facts, walked through explicitly (R22; evidence 03-authority-domains.md §2C)

| # | Fact | Owner/record | State before acquisition (target) | State before acquisition (buyer) | State after acquisition (buyer) |
|---|---|---|---|---|---|
| 1 | Knowledge prerequisites & early-research eligibility | P13 catalogue/timeline | met | met (has Tech II, presumably a II→III prerequisite chain) | met (unchanged — eligibility was never the blocker) |
| 2 | Research progress & completion | P13 research project → `readyToAdopt` | complete, own-development provenance | not started/partial | **new buyer adoption row at `readyToAdopt`, citing the target's provenance as evidence** — this is the one fact that actually transfers |
| 3 | Public commercial availability | `IndustryTimeline` | irrelevant to this transfer — a global fact, not studio-scoped | same global fact | unchanged (global; acquisition cannot buy or sell this) |
| 4 | Physical installation | P09 job, on one exact building/equipment subject | target had (per this scenario's illustrative framing) an installed Tech III stage | none | **none — no installation transfers; this fact starts over at zero on the buyer's lot** |
| 5 | Operational capability | P13 adoption `operational`, bound to `facilityProviderIds[]` | operational (bound to the target's own facility, which does not exist on the buyer's lot) | not operational | not operational until the buyer separately completes fact 4 |
| 6 | Industry standard | `publicStandard` per use | whatever the global standard state is | same | unchanged (global, not a per-studio acquirable fact) |

This is the direct, rule-by-rule answer to the assignment's "verify knowledge transfer without
magical facility upgrades": **only fact 2 (and, derivatively, fact 1's continued eligibility) is
what an acquisition actually grants.** Facts 4 and 5 do not move — the buyer's `TechnologyAdoption`
row lands at `readyToAdopt`, never at `adopting`/`operational`, and R22 requires the buyer to run an
ordinary P09 build job to advance past that point, exactly as if it had researched Technology III
itself. Facts 3 and 6 are global and were never studio-scoped to begin with, so "acquiring" them is
a category error the ruleset correctly never entertains.

### Reproducible arithmetic

- **Acquisition path total effective cost** = $3.0M (purchase) + $0.8M (mandatory P09 build, fact 4,
  unchanged whether the capability was bought or researched) = **$3.8M**, available as soon as the
  build finishes.
- **Organic path total effective cost** = $2.0M (research, facts 1→2) + $0.8M (build, fact 4) =
  **$2.8M**, but only after however many weeks the research itself would have taken.
- **What is actually purchased is time, not capability-for-free**: the acquisition path costs *more*
  cash ($3.8M vs $2.8M, a $1.0M premium) and still requires the identical physical build afterward.
  This is the exact, arithmetic-verified reading of the Owner's §2.F direction ("KNOWLEDGE
  TRANSFERS. PHYSICAL INSTALLATIONS DO NOT MAGICALLY APPEAR") rather than an assertion of it.
- **Book Net Worth vs. Studio Valuation vs. Transaction Price, applied to this target:** BNW is an
  accounting identity over the target's own cash/tangible/obligations and, per R23, contains no
  technology value at all (technology is explicitly "shown only in the buyer's private panel," never
  a BNW input). SV (seller-side, public) also excludes any buyer-specific technology-gap premium —
  R22/R23 keep the avoided-research value strictly inside the *buyer's private* BPV figure, never
  inside the publicly shown SV the seller's Ask is based on. So the $3.0M purchase price in this
  scenario is not "SV plus a technology premium" as a rule — it is whatever SV × the applicable
  willingness band computes to (per §12/R25, using this target's own cash/library/performance facts,
  not shown here in full since the scenario's point is the technology mechanic, not the price
  derivation, which Scenario C above already demonstrates in full). The **technology value only
  enters the buyer's own private accept/reject arithmetic (BPV)**, exactly as R22/R23's "buyer-relative,
  never in SV" discipline requires — this is itself a verification that the rule holds without
  contradiction: a technology-rich but otherwise unremarkable target does not get an inflated public
  Ask just because one particular buyer happens to want its research.

### Abstract capacity vs. the buyer's real lot — where it actually matters

This is the sharpest finding of this scenario. Per 03-authority-domains.md §B1/B6 (00-KEY-FINDINGS.md:77,
confirmed against accepted code `hollywood.ts:88-105`, `types.ts:548-559`): a rival's "facility"
today is **not** a placed, tiered, footprint-bearing body — it is four abstract capacity rows with a
flat Opex and no blueprint/tier/capex history. Only the *player's own* lot has real `PlacedFacility`
records (B2/B3). Consequently:

- **R21's "target physical/capacity assets automatically liquidate at closing" is currently a
  near-no-op for a rival target** (R21's own text says so explicitly: "currently near-moot for rival
  targets, who hold only abstract capacity with no tier/footprint field"). There is, today, no
  addressable "Tech III stage" object on a rival studio's record to liquidate, credit, or refuse to
  transfer — the demolition-credit-style liquidation this document computed above for Scenario C's
  tangible plant is likewise a *paper* number applied to an abstract capacity figure, not a real
  placed-body appraisal.
- **This means fact 4 (physical installation) is, for a rival target specifically, not merely
  "does not transfer" but "has no addressable representation to transfer or not transfer."** The
  Owner's "installations do not magically appear" principle is *trivially* satisfied for rival
  acquisitions today — not because the rule is doing work, but because there is nothing physical on
  the target side for the rule to have to stop. R22 states this uniformity is intentional and
  forward-looking ("write the eligibility-not-installation rule generally so it is correct the
  moment rival facilities gain tiers... explicitly document that it is currently a near-no-op").
  This document independently confirms that framing is accurate and not overclaimed.
- **Where it will matter:** once rival facilities gain a real tier/footprint model (a change this
  ruleset does not itself make — R21's own forward-looking carve-out is explicit that this is future
  scope), the buyer's *own* real lot becomes the actual constraint the assignment is asking about:
  even after the buyer's `TechnologyAdoption` row reaches `readyToAdopt` via inheritance, the P09
  build job for fact 4 must still target one of the buyer's own placed facility bodies (or a new
  one), subject to the buyer's own footprint, reservation, and engagement-blocking law (B2/B5) —
  never the target's now-liquidated-or-abstract body. In other words, the target's abstract capacity
  is not consumed by the transfer at all today; the buyer's own real lot is where the actual
  post-acquisition work happens, exactly as the $0.8M build-cost line in the arithmetic above already
  assumes. **No failure or contradiction is produced by this gap** — it is a scope boundary the
  ruleset correctly names rather than silently assumes past.

### The inventor-price entitlement question

Evidence: `InventionProvenance {technologyId, studioId (inventor), contributingResearchProjectIds,
completedWeek, prototypeEquipmentIncluded, entitlementClass}` is immutable — "no future rename,
studio ownership change... can rewrite the original identity" (03-authority-domains.md §C6,
00-KEY-FINDINGS.md:85). `entitlementClass` reserves an as-yet-unapproved `transferred` value; a
sketched-but-not-approved `TechnologyRightsRecord{holderStudioId, rightsKind}` is the mechanism by
which a buyer *could* inherit the inventor's price advantage without rewriting who invented it.
Owner rulings explicitly mark "technology-rights transfers NOT APPROVED for P13; P16+ default
placement" (dossier 03 §C6 citing rulings `:60-64`).

**R22, as written in ruleset-v2, does not resolve this.** R22 states that acquired research/technology
"grants only verified, completed knowledge... the buyer must still lawfully build/install the
physical facility," which answers facts 1–2 and 4–5 cleanly, but it is **silent on entitlementClass/
TechnologyRightsRecord** — i.e., silent on whether *this specific buyer*, having acquired Rival T,
also inherits whatever inventor-price advantage (a discounted future price for supplying/being
supplied the technology, per the commercialization sketch) Rival T's own `InventionProvenance` would
otherwise confer only on Rival T. This is not a contradiction inside R22 — R22 simply does not speak
to it — and it is **already correctly identified as a genuine, still-open Owner decision** in
ruleset-v2 §20/merged-ruleset §20 item 5: *"What entitlement, if any, does an acquirer inherit from
a target's `InventionProvenance` (the technology-invention price advantage)? P13 explicitly lists
this as an undecided 'later case.'"* This document's contribution is to confirm, by running the
scenario end to end, that the gap is real and load-bearing (Scenario D cannot be fully specified
without an answer) rather than a cosmetic omission — and that the two shapes already sketched in the
evidence (a `transferred` entitlementClass vs. a separate `TechnologyRightsRecord{holderStudioId:
buyer}`) are both compatible with R22/R15's "never rewrite who invented" invariant, so whichever the
Owner picks, `InventionProvenance.studioId` stays Rival T forever regardless.

### Scenario D verdict

- **Handles the scenario without contradiction:** Yes, for the five of six facts R22 actually
  speaks to (1, 2, 4, 5, and the global facts 3/6 by correctly not addressing them at all). The
  "knowledge transfers, installations do not" principle is not merely asserted but verified
  arithmetically (organic $2.8M vs. acquired $3.8M, both requiring the identical $0.8M build) and
  structurally (the six-fact table above shows exactly one fact, #2, actually changes hands).
- **Failure found:** none. No rule produces an absurd, free, or exploitable result — the acquisition
  path is strictly more expensive in cash than the organic path, which is the correct incentive
  shape (buying research trades cash for time, never cash for a free capability).
- **Rule gap found (genuine, not newly invented by this document):** the inventor-price entitlement
  question — already logged as Owner Decision #5 in ruleset-v2 §20 — is real and this scenario
  cannot be fully closed without it; R22 is correctly silent rather than wrongly silent, since
  P13 itself has not approved either candidate mechanism.
- **Scope note, not a rule gap:** the "abstract capacity vs. buyer's real lot" distinction is
  already correctly flagged as near-moot for rival targets by R21/R22's own text; this document
  confirms that framing holds up under a worked scenario rather than only in the abstract, and
  clarifies that the buyer's *own* lot — never the target's — is where the post-acquisition P09
  build actually lands, both today and under any future rival-tier model.

---

## Cross-scenario summary

| | Scenario C (Healthy rival) | Scenario D (Technology target) |
|---|---|---|
| BNW | $6.5M | not fully modeled (out of scope for the technology point; R23 excludes tech from BNW regardless) |
| SV (public) | $10.1M | not fully modeled; R22/R23 confirm technology value never enters SV |
| Transaction/Ask Price | $11.9M–$14.8M | $3.0M (given) |
| Buyer's private ceiling (BPV) | $7.4M (below Ask — deal does not clear at Ask) | technology gap valued only inside BPV, per R22/R23 |
| Ruleset handles without contradiction | Yes | Yes |
| Failure found | None | None |
| Rule gap found | Repeated-rejected-bid consequence beyond flat cooldown (remaining uncertainty, not previously logged in this exact framing) | Inventor-price entitlement transfer (already Owner Decision #5 — this document confirms it is load-bearing) |
| Documentation-only gap | Offer-≥-Ask acceptance predicate lives in carried-forward prose, not restated in R24/R25's own Rule List text | none additional |

Both scenarios confirm the ruleset's own repair-log claims for the rules they exercise (R06, R17,
R18, R21, R22, R23, R24, R25) without requiring any new correction beyond what ruleset-v2.md itself
already states. No Owner-selected direction from assignment §2 is reopened by this analysis.
