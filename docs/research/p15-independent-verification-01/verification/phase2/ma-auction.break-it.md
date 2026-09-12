# Adversarial verification — §9 Bankruptcy Auction & M&A (`phase2/ma-auction.md`)

**Lens:** BREAK IT (adversarial game designer + economist). **Verifier role:** independent, read-only. **Date:** 2026-09-12.

**Verdict: VERIFIED WITH CAVEATS.** The core deliverable survives adversarial pressure — the FRP formula, the six-shapes-collapse-to-four-mechanics finding, the StudioId-permanence argument, and the P15D package-boundary recommendation are all sound and mostly code-grounded exactly (not just approximately). But the guardrail layer (§10) that is supposed to prevent the very snowball §11 names as "biggest risk" has real, exploitable holes as specified, one genuine arithmetic error survives in Scenario B, and two named edge-case categories (player/rival symmetry swap, save/load mid-settlement) are not actually worked through despite being named as scope. None of this overturns the recommendation; all of it needs fixing before anyone builds against this document.

---

## 1. Arithmetic recompute (three-plus rows, as required)

I independently recomputed the load-bearing rows rather than spot-checking the totals.

| Row recomputed | Report's figure | My recompute | Verdict |
|---|---|---|---|
| Scenario A: 2×facility capex (Craft Services Annex 400,000 + Dev Office II 600,000) → 50% refund | $500,000 | 1,000,000 × 0.5 = **$500,000** — confirmed against `tuning.ts` (`CRAFT_ANNEX_BLUEPRINT.capex: 400_000`; Development Office II `capex: 600_000`) | Correct |
| Scenario A: FRP before/after debt (500,000 + 70,000 + 80,000; − 150,000) | $650,000 / $500,000 | 500,000+70,000+80,000 = **650,000**; −150,000 = **500,000** | Correct |
| Scenario B: 6-facility mix capex (2×Standard Soundstage 2,400,000 + Post 1,150,000 + Scenery 850,000 + D&C Hall 1,400,000 + Baseline D&C 1,500,000) | ≈9,700,000 → $4,850,000 refund | 4,800,000+1,150,000+850,000+1,400,000+1,500,000 = **9,700,000 exactly** (not merely "≈" — it is exact against real `tuning.ts` constants); ×0.5 = **$4,850,000** | Correct, and better-grounded than the report's own "≈" hedge admits |
| **Scenario B: Set refund, illustrative capex ≈6,100,000 at the shipped 35% fraction** | **$2,150,000** | 6,100,000 × 0.35 = **$2,135,000** | **ERROR — off by $15,000 (0.7%)** |
| Scenario B: BV identity (Facility + Set + Cash = given $22,000,000) | 4,850,000+2,150,000+15,000,000 = 22,000,000 | Using the corrected set refund: 4,850,000+**2,135,000**+15,000,000 = **21,985,000**, a $15,000 shortfall against the task's own given $22M assets figure | The "cash/receivables" row was silently back-solved as a plug to hit the given total using the *wrong* set-refund number; the plug itself is legitimate method, the arithmetic feeding it isn't |
| Scenario C: BV (3,400,000+525,000+500,000) | $4,425,000 | 3,400,000+525,000+500,000 = **$4,425,000** | Correct |
| Scenario C: haircut % (13,575,000 / 18,000,000) | 75.4% | 13,575,000/18,000,000 = 0.75417 → **75.4%** | Correct |
| Scenario B: haircut % (8,000,000 / 30,000,000) | 26.7% | 8,000,000/30,000,000 = 0.2667 → **26.7%** | Correct |

**Problem 1 (arithmetic).** Scenario B's set-refund row multiplies $6,100,000 by 0.35 and reports $2,150,000; the correct product is $2,135,000. Because the "cash/receivables" row is then defined as *whatever plugs the gap to the task's given $22,000,000 total assets*, the error is load-bearing: it silently overstates the plugged cash figure by $15,000 and makes the BV identity check appear to close when it doesn't, under the correct multiplication. **Smallest fix:** restate the set-refund row as $2,135,000 and the cash/receivables row as $15,015,000 (both change; the illustrative facility mix and headline $22M/$30M figures are untouched). This is a $15k/$22M (0.07%) error with no effect on any downstream shape verdict in Scenario B (Shape 4's $0–$1 nominal / 26.7% haircut reading is materially unchanged either way), but "recompute the arithmetic yourself" is exactly this task's job, and a PROVISIONAL-labelled table that doesn't actually multiply out is a paper-scenario report's one job.

---

## 2. Structural/game-design problems (ranked by severity)

### Problem 2 — the acquired-ownership model glosses over an already-existing, fixed `role` field it never examines

§9 claims a subsidiary/label acquisition is "additive... No existing root is touched," resting entirely on adding a new `ownership` save root. But `StudioIdentity` — the exact type the report's own §1 cites for "no status field" — already carries `role: 'player' | 'rival'` as a field (`hollywoodTypes.ts:6-17`, confirmed by direct read), and nothing in the codebase excerpts the report cites shows this literal ever transitioning. The report only works the forward direction (player acquires a rival, label stays `role: 'rival'`, ticks on the existing AI loop — this part is actually *consistent*, and is quietly the real reason "autonomous-only" Shape 5 is cheap). It never works the reverse, symmetric direction the task explicitly asks for ("player/rival symmetry swap"): a rival acquiring the player's *failed* studio (a live case under direction E, "player studio can ultimately fail"). If `role` really is fixed at mint and everything downstream (input handling, UI ownership, which loop ticks a studio) branches on it, then "rival buys the failed player" is not a same-shape acquisition at all — it requires either (a) a role transition nothing in this report or its cited code supports, or (b) discarding the player's specific state (see Problem 3) and re-minting the studio as a plain `role:'rival'` account under new control, which is *not* additive-only and is not what §9 claims.

**Smallest fix:** add one paragraph to §9 stating explicitly whether `role` transitions on an ownership change or stays fixed, and if fixed, what "player studio acquired by a rival" concretely becomes (recommendation: it becomes a `role:'rival'` account going forward — the human loses control, which is the correct read of player bankruptcy under direction E — and the report should say so instead of treating "symmetric law" as self-evident).

### Problem 3 — §8's facility-transfer rule is explicitly asymmetric; the reverse direction and the infeasible-placement case are both unaddressed

§8: rivals get facilities "as abstract capacity"; the player gets them "as physical placements" (`PlacedFacility`, with real grid footprint/clearance/road-access requirements — confirmed in `tuning.ts`, e.g. `STAGE_STANDARD_FOOTPRINT_WIDTH/DEPTH`, `CLEARANCE`, `requiresRoadAccess`). Two cases this asymmetry creates are never worked:

- **Player acquires, lot has no room.** If the player's buildable lot cannot fit an acquired rival's facility count (a five-facility target bought by a player with a small built-out lot), the report is silent on what happens to the excess: forced sale, partial acceptance, blocked bid, or a UI dead end.
- **Rival acquires the player's failed studio.** The player's assets are specific, coordinate-placed `PlacedFacility` records on a grid; a rival account has no lot concept at all (`hollywood.ts:98-105`, confirmed: rivals get a flat capability/capacity array with no coordinates). Converting a physical lot into an abstract capacity tally is not "the same mechanism run the other way" — it is a lossy, one-way collapse the report never states as a rule.

Given §9's own headline claim ("no new mechanic, only the symmetric-law discipline the codebase already enforces elsewhere") is the load-bearing argument for calling rival-to-rival and later-resale "free," this gap matters: the codebase is demonstrably *not* symmetric between player and rival facility representation, so "falls out for free" is asserted, not shown, for exactly the direction the task's lens asks to stress (player/rival symmetry swap).

**Smallest fix:** state both conversion rules explicitly — (a) rival-acquires-player: collapse `PlacedFacility` instances to their capability/capacity tally, discard coordinates, no data loss beyond position (which the historical record doesn't need); (b) player-acquires-rival: cap the transfer at the player's actual buildable footprint at auction time, auto-refunding (at the existing 50% facility rate, same ledger path as demolition) any acquired capacity units that cannot be placed.

### Problem 4 — the anti-snowball "cash-only, no borrowed money above LTV" rule is not mechanically enforceable as written

§7 and §10 both state buyers must fund an acquisition with "cash-only, no borrowed money above LTV." Cash is fungible: once direction F's loan proceeds land in a studio's cash balance, there is no way to determine which dollars in that balance are "borrowed" versus "earned" at the moment of a bid. A studio that took a loan for facility construction last quarter and has since earned back an equivalent amount in ticket revenue is, under any dollar-tracing reading of this rule, indistinguishable from one that borrowed specifically to fund the bid — the rule as stated cannot actually be checked by any state the report proposes keeping. This is precisely the "borrow-to-buy" exploit category the task asks this lens to hunt for, and as specified the guardrail meant to close it doesn't have a mechanism.

**Smallest fix:** replace the fund-tracing formulation with a balance-sheet snapshot check performed at bid time: buyer's *total* outstanding loan principal, including any assumed in the same transaction, may not exceed a fixed fraction of the buyer's own FRP-equivalent net worth, post-acquisition. This is checkable from state the report already keeps (loan principal, FRP components) and needs no purpose-tagging of individual loans.

### Problem 5 — the recommended cooldown is scoped to "per-buyer" but subsidiary labels are, by §9's own design, separate accounts — the exact "reset counter" exploit the task names

§10 recommends a cooldown "per-buyer, per-N-weeks." §9 establishes that an acquired label becomes "another `RivalBusiness`-shaped account with its own three Standing channels" carrying "an `ownedBy` pointer." If the cooldown counter lives on that account rather than on the ultimate controlling `StudioId`, a buyer can make one acquisition directly, then route every subsequent acquisition through whichever label it most recently acquired (each of which starts with its own fresh, never-yet-used cooldown clock), defeating the "per-buyer" throttle entirely without touching the buyer's own account. This is a reset-counter exploit that follows directly from a mechanism the report itself designs two sections earlier, and it is not mentioned.

**Smallest fix:** define "buyer" for cooldown purposes as the root of the ownership chain (follow every `ownedBy` pointer to its ultimate controller), and apply one shared cooldown clock to every acquisition made by that root or any label it controls, not one clock per account.

### Problem 6 — no deterministic tie-break for the recommended "sealed simultaneous offers" default, despite deterministic rival AI

§7 recommends sealed-simultaneous bidding as the default order rule specifically because it removes first-mover advantage. But rival AI in this codebase is rule-driven and deterministic (established fact, preamble), so multiple eligible rivals independently applying the *same* bid-formation rule to the *same* target FRP will very plausibly submit identical bids (e.g., every solvent, eligible rival bids exactly FRP, since nothing in the report gives a rival any reason to bid above book). A sealed-bid mechanism with no tie-break, under deterministic identically-programmed bidders, has ties as the modal outcome, not an edge case, and the report specifies none.

**Smallest fix:** add one explicit deterministic tie-break to §7 (e.g., lowest/earliest `StudioId` — i.e., founding-order seniority, which is already a stable, already-minted field) so a tie never needs to be broken by anything nondeterministic.

### Problem 7 — no stated bidding-window length; an instant-resolution auction structurally favors deterministic AI over the human player

Direction I is framed as an ability the *player* gains. Sealed-simultaneous bidding is fairest only if every eligible party, including a human who has to notice the industry notice (§6) and decide, gets the same window to respond. The report never states how long an auction stays open before it resolves. If resolution happens within the tick the notice fires, a deterministic AI (no reaction time) will out-bid a human every time on every contested target, silently converting "the player can eventually buy other studios" into "the player can buy studios no rival wanted" — the opposite of the strategic-interest verdict §11 gives Shape 5.

**Smallest fix:** state that the settlement/auction stage — already a named stage in direction D's failure ladder — is itself the bidding window, with a stated minimum length in weeks (tuning, not law) during which the notice stands and bids are accepted, resolving only at window close, never same-tick.

### Problem 8 — the "biggest snowball risk" is named but its terminal case (last remaining rival) is never actually resolved

§11 correctly identifies that a well-capitalized buyer chaining near-zero Shape-4 purchases with leader-first order and no §10 guardrails "can roll up the ecosystem faster than the authored 9-rival arrival schedule populates it," and calls this the severe failure direction G wants reported rather than floored. But the report stops at naming the risk; it never states the actual terminal rule for the case the task's own lens instructions name by number ("2-studio end state"): does the game block a bid that would reduce independently-operated active studios (excluding the buyer) to zero, or allow it and simply let the shared market (direction A) go dark? `consolidation.md` is the sibling analysis that owns this question by the phase's own task assignment, but `ma-auction.md` is the one that defines the guardrails that would need to implement whatever rule is chosen, and it never cross-references that analysis or states an interim position.

**Smallest fix:** add one sentence either stating the terminal rule directly (recommended: block a bid that would leave zero independent active studios, surfacing direction G's severe-failure notice instead of completing the transaction) or explicitly deferring to and citing `consolidation.md`'s answer, so the two documents don't silently disagree by omission.

### Problem 9 — no persisted state for an in-flight sealed-bid auction; "save/load mid-settlement" is named in scope but not worked

§9 lists exactly three additive save-root additions: an ownership edge, per-label Standing, and a greenlight-policy field. None of them is a pending-auction/pending-bid record. But §7's recommended default (sealed-simultaneous offers) inherently requires *collecting* bids from every eligible party before resolving — a process that, combined with Problem 7's minimum-window requirement, can plausibly span a save/load boundary. The report is silent on what a save taken between "notice fired" and "auction resolved" contains.

**Smallest fix:** pick one of two minimal answers and state it: either (a) resolve the auction synchronously within a single tick once the window closes, so no bid-collection state ever needs to survive a save (simplest, and compatible with the additive-root list as already written), or (b) add a fourth, short-lived additive root for open auctions if a genuinely multi-tick collection window (Problem 7) is adopted instead.

### Problem 10 — internal inconsistency: Scenario A's Shape 1 notes contradict §3's own contracts rule

§3's ownership-shapes table states Shape 1 (asset-only liquidation) contracts are "terminated at 50% cost (**no assumption possible**)" — correct, since Shape 1 by definition has no buyer to assume anything. §4 Scenario A's Shape 1 note then reads "$350,000 if all 5 are terminated rather than **expired/assumed**," which implies assumption is a live alternative under Shape 1. It isn't, by the report's own §3 rule.

**Smallest fix:** drop "/assumed" from the Scenario A Shape 1 note; under Shape 1 the only two outcomes are termination (50% cost) or running to natural contract expiry.

---

## 3. Missing items (named in scope, not worked through)

- **Post-2040 / Endless Sandbox continuity for P15D's own guardrails.** The report never states whether the cooldown, monopoly ceiling, and eligibility filter (§10) continue unchanged after the 2040 finale, or whether acquisition events in Endless Sandbox need the separate dated post-2040 record set `finale-endless.md`'s task requires. One sentence would close this; right now it is simply absent.
- **Serviceability check for Shape 3 (assumption of debt) on the buyer's own solvency.** The report correctly downgrades Shape 3 to "reject as a presented option" whenever debt exceeds assets (Scenarios B/C), but never asks whether a Shape-3 deal that *is* offered (Scenario A, debt < assets) could itself push the buyer onto the failure ladder the instant the assumed debt lands on its books. Low priority given the report's own conclusion that Shape 3 is rarely a sound choice, but the check is absent, not just deferred.
- **Migration edge case beyond "additive root."** The additive-save-root answer for *new-game* ownership state is solid and correctly reuses the established V16→V19 pattern (see strong points). But the report doesn't say what a *pre-P15D* save's rivals default to for the new `ownership` field on first load (presumably "no owner, `ownedBy: null`" — almost certainly correct and cheap, but never stated, and "presumably" isn't the standard this task set for itself elsewhere).

---

## 4. Strong points (survive adversarial pressure)

- The facility-refund figures are not merely "sized to the code's scale," as claimed — for Scenarios B and C they are **exact** sums of real `tuning.ts` catalog constants (9,700,000 and 6,800,000 respectively, verified line-for-line against `STAGE_STANDARD_CAPEX`, `POST_BUILDING_CAPEX`, `SCENERY_SHOP_CAPEX`, `DEVELOPMENT_CASTING_HALL_BLUEPRINT.capex`, `BASELINE_DEVELOPMENT_CASTING_CAPEX`), and Scenario A's facility total (1,000,000) is likewise exact against the Craft Services Annex and Development Office II blueprints. Given one arithmetic slip exists elsewhere (§1 above), this precision is worth crediting explicitly rather than assuming.
- StudioId permanence and the "no library transfer until P16 rights model exists" rule are both correctly grounded in the codebase and authority docs, and correctly treated as hard constraints rather than design choices — this closes the "ID reuse" edge case cleanly.
- The report is honest about Shape 3's economics in the exact scenario where a less careful analysis would paper over it (Scenarios B/C both state a rational buyer "pays nothing and still needs an inducement, or refuses," rather than presenting the shape as viable).
- The package-boundary recommendation (P15D) is scoped defensively — "P15D reads these, it does not compute them" for the valuation/loan/contract dependencies it doesn't own — which is the right instinct for containing scope creep, and Problems 2–9 above are fixes *within* that boundary, not arguments against it.
