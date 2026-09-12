# P15 Deliverable §9 — Bankruptcy Auction & M&A: Paper Scenarios and Package Boundary

**Analyst role:** independent, read-only paper-design review. **Date:** 2026-09-11.
**Scope:** direction I ("eventual ability to buy other studios") worked through three PROVISIONAL numeric scenarios on the code's scale, six ownership shapes, bidder-order options, transfer rules, subsidiary/label operability, anti-snowball guardrails, and a recommended package boundary. Nothing here is implemented, scheduled, or original-game parity — acquisition was a pre-release-only promise (P15-PACKAGE.md line 254, REFUTED as shipped).

All dollar figures below are **PROVISIONAL / HYPOTHETICAL**, sized to the accepted code's real constants (facility/set catalog, overhead, termination fraction) but invented for this exercise. Every comparator claim is stated at the confidence the phase-1 verification pass left it at; corrections from `_DIGEST.md` are applied and flagged.

---

## 1. What this report inherits from phase 1 (CONFIRMED / QUALIFIED / CORRECTED)

- **CONFIRMED** — no retail source for The Movies (2005) establishes acquisition, merger, subsidiary, or library transfer; only script/Star selling and a soft "in debt" build lock exist (manual.txt:125-131,429; Prima p.14 (PDF p.15), corrected from the phase-1 report's "p.13"). Any M&A here is successor invention.
- **CONFIRMED** — the accepted code (592e926) has no ownership, valuation, closure, or debt model. `StudioIdentity` carries no status field (`hollywoodTypes.ts:6-17`); rivals can run cash negative forever with no floor, no event, no exit (`hollywood.ts:31-41`, `hollywoodTick.ts:98,126,176,280-282`); `IndustryReceipt` is a closed 5-kind union (`studioEntered, employment, filmAnnounced, filmReleased, filmSettled`, `hollywoodTypes.ts:96-103`); save is V19 with a uniform additive-root migration pattern (any new M&A state is a new versioned root, `save.ts:7228-7257`).
- **SUPERSEDED BY OWNER DIRECTION** — every prior-P15 line that reads acquisition as flatly "disallow / P16+ only / not implied" (P15-PACKAGE.md:99-100, 293, 402, 619, 676, 797, 849, 886; P13-P15-LONG-RANGE-ROADMAP.md:215, 260, 693-703; P15-BUILDER-ANNEX.md:37, 45, 129) is superseded by direction I. The **dependency list** those lines give (valuation, contract assumption, ownership/IP history, rights model) is **CONFIRMED** as real cost, not as an absolute ban — it now gates a *boundary decision* (§13), not a yes/no.
- **QUALIFIED** — comp-ma.md §7's claim that "the cost estimate of the smallest slice is smaller than the package implies" survives verification (the digest did not refute it) and is the load-bearing argument for §13 below.
- **CORRECTED** — comp-ma.md's "Stage 1 cannot snowball because prices are formula-frozen" is REFUTED_IN_PART: OpenTTD's own rotation asks the **best-performing** company first (`HandleBankruptcyTakeover`, descending `performance_history`), a leader-first rule that can itself snowball. A frozen price protects against *overpaying*; it does nothing about *who gets first, repeated access*. §7 below treats bid order as a separate, unresolved design axis.
- **CORRECTED** — Capitalism Lab's "Playing Without a Company" continuation-after-loss (cited in comp-ma.md §2.3/§5/§6.2 as OFFICIAL/HIGH shipped precedent) is an **unshipped Billionaire Life DLC preview** ("In Development" per the developer's own forum index), and even within that preview only the *takeover* path continues the company AI-run — the *bankruptcy* path still liquidates. The shipped continuation-after-loss precedent in the evidence set is narrower than reported: Offworld's AI-run subsidiary (Designer Notes #17, 2016, DEV STATEMENT) and OpenTTD's single-player "there is no THE-END" asymmetry (`economy.cpp:606-611`, SHIPPED CODE) are the two that actually ship. This does not overturn P12's no-mandatory-hard-bankruptcy law for the player (direction E already settles that independently) but it weakens the citation base for "loss-without-elimination is a well-trodden pattern" — it is a two-example pattern, not a five-example one.
- **CORRECTED** — GearCity's takeover-price formula as reported (1.1x/1.2x of evaluation) understated the market-value term and overstated the evaluation term by 2.5-5x; the corrected formula (`gm_stocks`, raw wiki) is `(0.22×Eval + 1.3×PricePerShare×SharesNeeded)×Difficulty` (distressed) or `(0.48×Eval + 1.75×PricePerShare×SharesNeeded)×(1+EPS/10)×Difficulty` (healthy). This is a share-market formula that does not translate to Project Studio (no share market exists or is proposed); it is cited below only as the general shape "book component + market-value-of-control premium," not copied numerically.
- **NEW, MISSING from phase 1** — Capitalism Lab ships an **official** "Acquire Companies That Are Facing Bankruptcy" game setting (Banking and Finance DLC, live since v6.5.20, 2020): a window asks the player whether to acquire a company on the brink, paused, captioned "Distressed companies are cheap." This is a real shipped Stage-1-shaped precedent, strictly stronger evidence than the retracted DLC-preview citation it displaces.
- **NEW, MISSING from phase 1** — GearCity ships an official **"Monopoly Lawsuits"** setting: over 75% global market share can trigger a lawsuit that breaks up the company or fines it (0.3%/turn). This is the concrete shipped analogue for the task's "monopoly ceiling" anti-snowball tool (§10).
- **NEW, MISSING from phase 1** — Blockbuster Inc. (2024) ships rival bankruptcy that **pauses operations for a year, then the studio returns**; shares held in a bankrupt studio are lost; a bank-loan payoff option exists. This is evidence that "rival fails, then resumes" is a shippable genre pattern — but it directly **conflicts** with directions D/G (a one-way ladder ending in closure/settlement, no automatic revival) and is **rejected** as a base pattern for Project Studio; it is recorded only because it is the closest shipped precedent for a *dormancy* state, which P15B already owns as vocabulary (`ID-011`, `HIS-013`) independent of M&A.

---

## 2. The frozen price basis (Frozen Reference Price, FRP)

Every shape below prices off one reference number, built entirely from figures the code already produces or that direction F adds (loans), never from a share market:

> **FRP = Σ(facility refund value) + Σ(set refund value) + cash on hand − outstanding obligations**

- Facility refund value uses the code's own rule: `round(blueprint.capex × 0.5)` off the **ledger-recorded** capex row (`placement.ts:1025-1027, 1719-1721`) — not a re-derived "today's catalog price," per the P11 handoff law against reconstructing book value from the current blueprint (`P11-TO-P12-PRODUCER-HANDOFF.md:37`). For rivals, "facility" means their abstract capacity slots (Development & Casting, one Production Stage, Scenery Shop, Post Building — `hollywood.ts:98-105`), priced the same way, since rivals have **no physical lot** to place or demolish.
- Set refund value uses the shipped `× 0.35` strike fraction (`sets.ts:600-627`, `tuning.ts:816`).
- Outstanding obligations = any loan principal (direction F) plus, only where contracts are being terminated rather than transferred, the shipped 50% termination fraction (`employment.ts:172-180`, `tuning.ts:391`).
- FRP explicitly **excludes** the film library — historical creator/owner facts are immutable and there is no rights/chain-of-title model yet (P16+ per every authority doc inspected); a buyer under any shape gets facilities/cash/name/label, never the films.

| Comparator | What it froze | Adopted into FRP? |
|---|---|---|
| OpenTTD `bankrupt_value` | assets + cash, **loan excluded**, frozen at offer time, not per-bidder | Yes — FRP's "asset + cash" core and its freeze-at-offer discipline |
| GearCity bankrupt purchase | steep discount from book, **debt stays attached** ("not supposed to be a good deal") | Yes, but only for Shape 3 (§4) — FRP's baseline does not attach debt by default |
| Railway Empire rising share price | marginal share cost escalates toward ~150% of value | **Rejected** — no share market exists or is proposed; nothing to escalate |
| Offworld subsidiary run by AI | no sale price at all; the loser's income flows to shareholders | Adopted for Shape 5's *operating* model, not its price |
| Capitalism Lab "Acquire Companies Facing Bankruptcy" | a paused, captioned offer at a below-market quoted price (formula undisclosed) | Adopted as the **UX shape** (a pausing, captioned, one-decision prompt), not a formula |

---

## 3. Six ownership shapes (generic)

| Shape | Price | Debt | Contracts | Active projects | Ongoing operation |
|---|---|---|---|---|---|
| 1. Asset-only liquidation | Σ facility+set refund value, sold piecemeal; no buyer required | paid off first from proceeds (secured) | terminated at 50% cost (no assumption possible) | struck/cancelled | none — identity closes |
| 2. Whole-studio auction | FRP (debt already settled through the sale) | extinguished before sale | transfer with consent, or run to expiry, no termination cost | transfer as-is | buyer's choice: fold in or relabel |
| 3. Assumption of debt | Σ facility+set refund value + cash (buyer also takes the loan) | **transfers**, buyer now pays interest | transfer with consent | transfer as-is | buyer's choice |
| 4. Clean purchase after creditors settle | max(0, FRP); creditor recovers pro-rata up to FRP if FRP < debt | **extinguished** (creditor absorbs the haircut) | transfer with consent | transfer as-is | buyer's choice |
| 5. Subsidiary/label continuation | FRP × a going-concern premium (PROVISIONAL, not GearCity's formula) | assumed as part of the going-concern deal | continue unchanged, no termination event | continue unchanged | **label persists**, own P08 Standing channel, autonomous greenlight (§9) |
| 6. Absorption into buyer | ≈ Shape 2's price | extinguished before sale | transfer with consent or expire, then buyer's own roster absorbs the rest | fold into buyer's pipeline or cancel | identity closes as a decision-maker; historical record persists (StudioId never disappears) |

Shapes 2 and 6 share a price mechanic; they differ only in **post-sale intent** (keep the label distinct vs. fold it away) — a real finding: the task's six requested shapes collapse to **four distinct price mechanics** (liquidate / clean sale / debt-attached sale / going-concern premium) crossed with **two post-sale states** (label persists vs. label closes as an operator). Shape 4 is the only mechanically sound path when book equity is negative (Scenario B, C below); Shape 3 is included for completeness but is flagged below as economically degenerate whenever debt exceeds assets.

---

## 4. Scenario A — Small failed studio

2 facilities (Craft Services Annex 400,000 capex / Development Office II 600,000 capex), 1 small set (200,000 capex), 5 employees, 3 films in library, little debt.

| Component | PROVISIONAL value | Basis |
|---|---|---|
| Facility refund (2 × 50%) | $500,000 | catalog capex 1,000,000 (`tuning.ts:958-959`, Craft Services Annex `:1037-1038`) |
| Set refund (35%) | $70,000 | 200,000 capex, illustrative |
| Cash on hand | $80,000 | illustrative — nearly depleted, the reason it failed |
| **FRP before debt** | **$650,000** | |
| Loan principal | −$150,000 | "little debt" per prompt |
| **FRP after debt** | **$500,000** | |
| Termination liability if all 5 released | $150,000 | 5 × ~$60,000 avg remaining guarantee × 50% (`employment.ts:172-180`) |

| Shape | Price to buyer | Notes |
|---|---|---|
| 1. Asset-only liquidation | estate nets $500,000 pre-termination, $350,000 if all 5 are terminated rather than expired/assumed | positive at every step — the "easy" case |
| 2. Whole-studio auction | $500,000 | clean, single lot, no termination trigger |
| 3. Assumption of debt | $650,000 cash + assume $150,000 loan | economically ≈ Shape 2 since debt < assets here; only interesting when debt is large (Scenarios B/C) |
| 4. Clean purchase after creditors settle | $500,000 (creditor paid in full, no haircut needed) | identical to Shape 2 because equity is positive |
| 5. Subsidiary/label continuation | not applicable — the studio is already **failed**, not merely distressed; label continuation requires acquiring *before* the terminal step (see Scenario B) | |
| 6. Absorption into buyer | $500,000 | ≈ Shape 2, buyer intends to fold facilities in rather than keep the name |

**Read:** Scenario A is the case where every shape produces the same clean number, because assets exceed debt. It is the scenario to build and test first.

---

## 5. Scenario B — Valuable distressed studio

Strong brand/Standing, 6 facilities, 12 contracts, 40-film library, $30,000,000 debt vs. $22,000,000 assets (given headline figures).

| Component | PROVISIONAL value | Basis |
|---|---|---|
| Facility refund (6 facilities, illustrative mix: 2×Standard Soundstage + Post Building + Scenery Shop + Development & Casting Hall + Baseline Development & Casting, capex ≈ 9,700,000) | $4,850,000 | `tuning.ts:684,686,697,699,708,710,729,731` |
| Set refund (active slate, illustrative capex ≈ 6,100,000) | $2,150,000 | 35% |
| Cash / receivables | $15,000,000 | illustrative balance for the rest of the given $22M |
| **BV (= given assets)** | **$22,000,000** | |
| Loan principal | −$30,000,000 | given |
| **FRP (net equity)** | **−$8,000,000** | insolvent on book |
| Termination liability if all 12 released | ≈$3,600,000 | 12 × ~$600,000 avg remaining guarantee × 50% |

| Shape | Price to buyer | Notes |
|---|---|---|
| 1. Asset-only liquidation | creditor recovers $22,000,000 of $30,000,000 owed (73.3 cents on the dollar), nothing left for equity or severance | ordinary bankruptcy outcome; brand value destroyed with the identity's operating status |
| 2. Whole-studio auction | **infeasible as a clean sale** — buyer would have to fund the $8M shortfall to clear the loan before taking title | |
| 3. Assumption of debt | **structurally negative price**: buyer takes $22M of assets and $30M of debt — a rational buyer pays nothing and still needs an $8M inducement, or refuses | this is GearCity's "not supposed to be a good deal" made explicit; the game must not present this shape as if it were free equity |
| 4. Clean purchase after creditors settle | **$0-$1 nominal** — creditor is paid $22,000,000 pro-rata (a $8,000,000 haircut, 26.7% loss), buyer receives a debt-free shell | the only mechanically sound "buy it" path for this scenario, matching GearCity's real $1-plus-liabilities bankrupt purchases, minus the attached debt |
| 5. Subsidiary/label continuation | requires acquiring **before** insolvency (i.e., during Warning/Distress, while the business is still a going concern) — price = FRP-at-that-earlier-moment (likely still positive) **plus a brand/Standing premium that book value does not capture** | see structural note below |
| 6. Absorption into buyer | same $0-$1 nominal as Shape 4, buyer folds facilities in and does not keep the label | |

**Structural note (direction C early-warning, confirmed by this scenario, no correction needed to the direction itself):** Scenario B is built to prove exactly what direction C already warns about — book net worth (here, $22M of refund-value assets) is not enterprise value. A "strong brand/Standing" studio's real acquisition value to a buyer is mostly *not* captured by FRP, which only counts refundable physical/abstract capacity and cash. If Shape 5 (label continuation) is ever priced using FRP alone, every prestige acquisition will look absurdly cheap or, once debt is netted in, worthless — the opposite of the intended "valuable" read. The smallest correction: Shape 5's premium should be sourced from the **same** financial-strength/Standing read model direction B and C already require (a Power-Ranking-adjacent number the player already sees, not a bespoke M&A valuation engine), so the premium is legible and auditable rather than invented per-acquisition. This ties directions B, C, and I together and is itself the strongest argument for the package boundary in §13: **Shape 5 pricing cannot be built before the direction-C valuation read model exists**, but Shapes 1/2/4 (liquidation and clean-shell purchase) need nothing beyond FRP and can be built independently.

---

## 6. Scenario C — Large failed rival

Many films, 20 employees, 3 active projects, big liabilities.

| Component | PROVISIONAL value | Basis |
|---|---|---|
| Facility refund (illustrative 4 facilities: 2×Standard Soundstage + Post Building + Scenery Shop, capex 6,800,000) | $3,400,000 | catalog |
| Set refund (3 active in-flight productions, illustrative capex 1,500,000) | $525,000 | 35%, only if struck rather than continued |
| Cash on hand | $500,000 | thin — consistent with "big liabilities" driving the failure |
| **BV** | **$4,425,000** | |
| Loan principal | −$18,000,000 | "big liabilities" |
| **FRP** | **−$13,575,000** | deeply insolvent |
| Termination liability, 20 employees | ≈$6,000,000 | 20 × ~$600,000 avg remaining guarantee × 50% |
| Weekly overhead at failure | $45,000 general (15,000 + 1,500×20) + facility opex | `hollywoodTick.ts:279-282`, `tuning.ts:419-420` |

| Shape | Price to buyer | Notes |
|---|---|---|
| 1. Asset-only liquidation | creditor recovers $4,425,000 of $18,000,000 (24.6 cents on the dollar); severance for 20 goes unpaid or is absorbed by the settlement law, same as any unsecured claim | the harsh default when no bidder appears |
| 2. Whole-studio auction | infeasible clean, same shortfall logic as B | |
| 3. Assumption of debt | structurally negative by ~$13.6M — reject as a presented option | |
| 4. Clean purchase after creditors settle | $0-$1 nominal, creditor takes a 75.4% haircut | mechanically sound path |
| 5. Subsidiary/label continuation | not applicable — scenario is explicitly **failed**, not distressed | |
| 6. Absorption into buyer | $0-$1 nominal, buyer decides per active project whether to continue (inherits sunk set capex as a going concern) or cancel (strikes the set for the 35% refund, cancels associated contracts at 50% termination) | the 3 active projects are the one genuinely new transfer question this scenario raises: "continue" vs "liquidate" per project, not just per studio |

**Industry notice, modeled on the task's own example (direction H):**

> "MERIDIAN STUDIOS DECLARES BANKRUPTCY — 20 contracted professionals entering free agency — 3 productions affected — assets entering settlement/auction — historical profile preserved."

This is a receipt/notice question, not a price question: it requires one new `IndustryReceipt` kind (the union is currently closed at 5, `hollywoodTypes.ts:96-103`) and a Pulse/newspaper renderer, reusing the existing typed-receipt → activity → Pulse path already present for `filmReleased` (`code-standing-history-save.md §4`) rather than inventing a new channel.

---

## 7. Who may bid, and in what order

The task lists four alternatives to OpenTTD's leader-first rotation. These are **two orthogonal axes**, not four competing options:

**Eligibility filter (always on, regardless of order):** "any eligible studio with sufficient cash and no distress state" — cash-only (direction F: no borrowing above a loan-to-value cap to fund an acquisition, so a buyer cannot leverage itself into the seller's fate), and excluded while in Warning+ (mirrors Football Manager's transfer-embargo-under-administration pattern, CONFIRMED shipped per the digest's retraction of the earlier "QUALIFIED" downgrade of that comparator — FM24's official feature page documents a real staged ladder with an embargo stage).

**Order rule (pick one):**

| Rule | Pro | Con | Verdict |
|---|---|---|---|
| Leader-first (OpenTTD) | simple; matches the "rich get richer" flavor Owner explicitly tolerates (direction G: "consolidation is acceptable/desirable emergent history") | repeatedly favors one studio; only the monopoly ceiling (§10) prevents runaway dominance | **viable if paired with a monopoly ceiling** — not rejected outright, since Owner wants consolidation as history |
| Worst-first | actively counteracts consolidation, keeps the ecosystem level | works against the Owner's stated tolerance for consolidation; no comparator ships this | not recommended |
| Sealed simultaneous offers | fairest; no first-mover advantage; identical whether player or AI bids | needs a bidding-decision model for every eligible studio each auction, not just one | **recommended default** — most legible, least snowball-prone, cheapest to reason about even though costlier to simulate than a single "ask the top one" call |
| Player-last | guarantees no perception of favoritism | GearCity does the opposite on purpose (charges the player *more*, not less, "to fix player exploits") — asymmetric-but-fair is an alternative worth keeping open | present as a variant, not the default |

**Recommendation:** eligibility filter mandatory; sealed-simultaneous as the default order rule; leader-first offered as an explicit, Owner-visible alternative because it is the one that best matches the "consolidation as emergent history" instruction. This is a genuine open Owner decision (§14), not resolved here.

---

## 8. What transfers

| Asset class | Transfers? | Basis |
|---|---|---|
| Facilities | Yes — **as abstract capacity** for a rival buyer (no physical lot exists for rivals, `hollywood.ts:98-105`); **as physical placements** if the player is ever the buyer (the code's `PlacedFacility` model) | code fact |
| Contracts | Only with **consent**, or left to run to natural expiry; never force-transferred | direction rule, matches P14's contract law |
| Active projects | Buyer's choice per project: continue as a going concern, or liquidate (strike set at 35% refund + terminate any dedicated contracts at 50%) | Scenario C |
| Debt | Depends on shape: extinguished (Shapes 1/2/4/6) or assumed (Shapes 3/5) | §3 |
| Films/library | **Never**, until a P16 rights/chain-of-title system exists. Historical creator/owner facts are immutable; "current rights holder" is a concept that does not exist in code today. A "library" transfer is not possible — the buyer gets facilities/cash/name/label only | P15-PACKAGE.md:539, CONFIRMED by all inspected authority docs |
| Employees not on assumed contracts | free agency (direction H) | |

---

## 9. StudioId permanence and subsidiary/label operability

The acquired `StudioId` **must** remain historically distinct — this is a hard requirement (direction D), and it is cheap to satisfy: `StudioId` is already minted once and never reminted for rename/distress/closure events (`P13-P15-LONG-RANGE-ROADMAP.md:273`), so an acquisition is simply one more append-only event on the same identity, not a new mint.

Operating as a subsidiary/label needs three concrete additions, all additive to the existing model:

1. **An ownership edge on `StudioIdentity`**, carried on its own versioned save root (the same additive pattern every prior root used, V16→V19; a new root would be `GameStateV20 = GameStateV19 & { ownership: ... }` per `save.ts:7250-7257`'s established shape). No existing root is touched.
2. **P08 Standing per label** — no new Standing model is needed. `updateStanding()` already operates per `RivalBusiness` (`standing.ts:143-207`); a label is simply another `RivalBusiness`-shaped account with its own three Standing channels, now carrying an `ownedBy` pointer instead of being a free-standing rival.
3. **A greenlight policy.** Two shapes exist in the comparator set: **autonomous** (the label keeps running its existing rival AI `policy` — genre affinities, `negativeScale`, `marketingRatio`, `reserveWeeks`, `hollywood.ts:156-157` — unchanged; the owner just collects/owes its cash flows, matching Railway Empire's "keep it operating" and Offworld's AI-run subsidiary), or **player-directed** (the owner approves/vetoes each new production, matching Software Inc.'s "task-driven" subsidiary mode). Autonomous reuses code that already exists end to end; player-directed is a second full decision loop (effectively a second studio to manage) and is the single biggest scope item in the whole task. **Recommendation: ship autonomous-only** inside any P15-adjacent slice; player-directed greenlight is P16+ scope.

Later sale by the player and rival-to-rival acquisitions both fall out for free once the ownership edge and FRP exist as a general N-party mechanism rather than a player-only one: reselling a label is the same auction with the current owner as seller, and rival-to-rival acquisition is the same auction with a rival as buyer — no new mechanic, only the symmetric-law discipline the codebase already enforces elsewhere ("player and rivals use the same... law," `P15-BUILDER-ANNEX.md:945`).

---

## 10. Anti-snowball protections

| Protection | Comparator evidence | Recommended for Project Studio |
|---|---|---|
| Price premium over book for a healthy target | RT2 vote-priced merger; GearCity player premium (added post-hoc, DEV STATEMENT) | only relevant to Stage 3 (healthy M&A), out of scope here |
| Cooldown between acquisitions (same buyer) | RT2 once-a-year merger rule (designed in, OFFICIAL) | recommended — per-buyer, per-N-weeks, cheap to enforce |
| Health-based refusal | GearCity shareholder-vote health dependence | already covered by the eligibility filter (§7): no bidding while in Warning+ |
| Cash-only, no borrowed money above LTV | direction F (loans exist but are capped) | recommended — prevents a leveraged buyer from using acquisition debt to fund the *next* acquisition |
| Monopoly ceiling | **GearCity "Monopoly Lawsuits": >75% global market share triggers a lawsuit that can break up the company or fine it (0.3%/turn)** (NEW evidence, corrects a phase-1 gap) | recommended — the one guardrail that lets leader-first bidding (§7) coexist with Owner's "consolidation is acceptable/desirable" instruction without risking a single-studio endgame; ceiling metric should be sourced from the same financial-strength/Power-Ranking lane as §5's valuation premium, not a bespoke count |
| No acquisitions while Warning+ | Football Manager's transfer embargo under administration (CONFIRMED shipped, corrects the phase-1 "QUALIFIED" downgrade) | recommended, already folded into the eligibility filter |

---

## 11. Verdicts

- **Easiest to understand:** Shape 4, clean purchase after creditors settle. One number ($0 to a small residual), no attached debt, no ongoing obligation — the buyer's mental model matches OpenTTD's "one formula, one dialog" exactly.
- **Most strategically interesting:** Shape 5, subsidiary/label continuation. It is the only shape that produces ongoing decisions (greenlight policy), ongoing history (its own Standing channel, its own releases under its own name), and later resale — the pattern comp-ma.md §5 already identified as the evidence-backed source of "fun without a finance sim" (GearCity marques, Offworld AI-run subsidiaries), now grounded in Scenario B's brand-value tension.
- **Biggest snowball risk:** not any single shape's price formula (each is individually fair-by-construction) but the **absence of a cross-acquisition rate limiter**. A well-capitalized buyer repeatedly clearing Shape-4 purchases at near-zero price, with leader-first bid order and no cooldown/LTV cap/monopoly ceiling, can roll up the ecosystem faster than the authored 9-rival arrival schedule populates it — directly undermining direction G's "no artificial floor, report a severe failure rather than silently adding one" instruction, since a snowballing buyer would be the *cause* of that severe failure, not an external threat to guard against. §10's combination (cash-only/LTV cap + cooldown + monopoly ceiling) is the recommended answer, all three sourced from mechanisms that already have shipped precedent.

---

## 12. Phase-1 staged progression vs. the Owner's fantasy

Phase-1's comp-ma.md proposed Stage 1 (bankruptcy asset offer, rival-only) → Stage 2 (whole-studio label purchase) → Stage 3 (healthy M&A), all parked as "P16+ parking lot, not P15 scope" design notes. Direction I changes the premise the staging was written under (Owner now wants *eventual* player access, not zero access), so the staging needs re-evaluation, not replacement:

- **Stage 1 holds up well** as the smallest, cheapest slice — this report's Shapes 1/2/4 need nothing beyond FRP (§2), the closure event P15B already owns, and the debt/loan math direction F already assigns elsewhere. The one correction from §1 is that "cannot snowball" needs replacing with "needs the §10 guardrails," since the frozen-price property alone does not prevent repeated-access snowballing.
- **Stage 2 needs splitting**, which phase 1 did not do. "Label continuation with autonomous policy" (§9) is nearly as cheap as Stage 1 — it reuses the existing rival AI and Standing machinery wholesale. "Label continuation with player-directed greenlight" is a materially larger feature (a second decision loop) that phase 1's single "Stage 2" bucket obscured. These two halves belong in different packages.
- **Stage 3 (healthy M&A) still does not belong in the same wave as Stage 1.** It needs a valuation model the player can manipulate (exactly what direction C warns against building carelessly), true negotiation/refusal logic, and antitrust flavor — none of which any of the three scenarios above required. Nothing in this report's evidence argues for pulling Stage 3 forward; it argues for **not leaving Stage 1 and the autonomous half of Stage 2 stranded behind it**.

---

## 13. Package boundary recommendation

**Adopt: a new package, P15D — "Bankruptcy Settlement & Studio Disposal."**

| In P15D | Stays P16+ ("Studio Empire & Ownership Transactions," already named in the roadmap) |
|---|---|
| FRP computation (§2) for closed/insolvent rivals only | Voluntary healthy-studio M&A (Stage 3) — no bankruptcy predicate |
| Shapes 1, 2, 4, 6 (liquidation, clean sale, absorption) | Shape 5 with **player-directed** greenlight (a second decision loop) |
| Shape 5 with **autonomous-only** greenlight, reusing existing rival AI policy and Standing machinery | Any acquisition-price premium beyond FRP that is not sourced from an already-existing P15 read model |
| StudioIdentity ownership edge (new versioned save root) | The film/library/rights transfer question generally (blocked on a P16 rights model regardless of package) |
| The industry-notice `IndustryReceipt` kind and Pulse renderer (direction H) | Antitrust/regulatory flavor beyond the monopoly-ceiling guardrail |
| §7's eligibility filter and a chosen order rule | Stock/share markets of any kind (rejected outright by every comparator's own history, §2) |
| §10's cooldown/LTV-cap/monopoly-ceiling guardrails | |
| Later resale of an owned label (free once the ownership edge exists) | |
| Rival-to-rival acquisition under the same law | |

**Dependencies P15D consumes but does not own:** P15B's closure/terminal-ladder trigger (direction D/E); direction F's loan/debt math and the creditor-haircut settlement math (owned by P11 per the direction's own text, "P11 likely stays authoritative for ledger/debt math"); P14's contract-consent law for transferred employment; and, for Shape 5's brand premium only (§5), a direction-C valuation/net-worth read model and direction-B's financial-strength Power-Ranking lane — **P15D reads these, it does not compute them**, which is why Shape 5's premium is explicitly deferred until those sibling P15 slices exist, even though Shape 5's *operating* mechanics (autonomous label, Standing channel) do not need to wait.

**Why not fold this into P15B directly, or leave it all in P16+:** P15B already owns "very large / high risk... must not be bundled with acquisition transactions" per the prior-wave risk table (`P15-BUILDER-ANNEX.md` risk register) — that caution is CONFIRMED and is exactly why this report recommends a *separate* P15D rather than growing P15B's scope. Leaving all of it in P16+ satisfies no part of direction I; the evidence above shows a genuinely small, self-contained slice (Shapes 1/2/4/6 plus autonomous Shape 5) exists that needs nothing P15's other slices are not already building.

---

## 14. Remaining Owner decisions

1. Bid order: leader-first (matches "consolidation as emergent history") vs. sealed-simultaneous (fairest, no snowball flavor) vs. an explicit player-priority-at-premium variant (GearCity's asymmetric-but-fair pattern) — §7.
2. Whether Shape 5 (label continuation) is authorized for P15D now with autonomous-only greenlight, or held entirely for P16+ alongside player-directed greenlight — §9, §13.
3. The monopoly-ceiling threshold and consequence (fine vs. forced divestiture vs. blocked bid) and what "market share" means in a genre-and-window market with no screens — §10.
4. Whether the player is eligible as a Stage-1 buyer from day one of P15D, or only after a separate confirmatory ruling (this report assumes yes, since that is the concrete form direction I's "eventual ability" takes at the smallest scale, but it is stated nowhere as settled).
5. Cooldown length and LTV cap numbers (both left as tuning, not law, per every comparator's own "exact numbers are tuning" pattern).

---

## 15. Sources (this report's own additions beyond the inherited phase-1/digest citations already named inline above)

- Capitalism Lab "Acquire Companies That Are Facing Bankruptcy" (Banking and Finance DLC, official page, live since v6.5.20/2020) — capitalismlab.com/acquire-companies-facing-bankruptcy.
- GearCity official wiki `gamemanual:new_game_settings`, "Monopoly Lawsuits" (>75% share, 0.3%/turn fine or breakup) — wiki.gearcity.info.
- Football Manager 24 official feature page (footballmanager.com/features/smarter-transfers-squad-building-and-finance) — staged distress ladder: negative-transfer-budget inbox item → board control/forced sales → administration (net debt/P&L graphs, transfer funds withdrawn) → players'-association transfer embargo → Company Voluntary Agreement.
- Blockbuster Inc. (Super Sly Fox, 2024) official Steam patch notes, appid 1793090, v1.9.0 (2024-10-28): rival bankruptcy with a one-year pause then return; shares in a bankrupt studio lost; bank-loan payoff option.
- Accepted code 592e926: `src/core/hollywoodTypes.ts:6-17,96-103`; `src/core/hollywood.ts:31-42,98-105,151-188,156-157`; `src/core/hollywoodTick.ts:98,126,176,279-282,295-306`; `src/core/placement.ts:1025-1027,1719-1745`; `src/core/sets.ts:151-154,506-512,600-627`; `src/core/tuning.ts:391,419-420,684-731,816,958-1038,1350-1562,1599-1613`; `src/core/employment.ts:70-80,172-180`; `src/core/standing.ts:143-207`; `src/core/save.ts:7228-7257`.
- Authority: P15-PACKAGE.md:99-100,254,293,402,539,619,676,797,849,886; P13-P15-LONG-RANGE-ROADMAP.md:215,260,273,693-703,757-759,773; P15-BUILDER-ANNEX.md:37,45,129,151,608,945.
- Phase-1 verification digest `_DIGEST.md` lines under `verify:comp-ma:*` and `verify:comp-bankruptcy-loans:*` — all corrections applied are cited inline in §1.
