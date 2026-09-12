# Adversarial Verification — `phase2/ma-auction.md` — LENS: Authority & Direction Consistency

**Verifier role:** independent adversarial check, not the analysis's author. **Target:** `<scratchpad>/out/phase2/ma-auction.md` (265 lines). **Verdict: VERIFIED_WITH_CAVEATS.**

The analysis is well-constructed, correctly treats direction I as settled (it does not reopen the "can the player ever buy a studio" question), applies most of `_DIGEST.md`'s corrections to comp-ma/comp-bankruptcy-loans faithfully (verified line-by-line below), and is careful about CONFIRMED/SUPERSEDED labeling for most prior-P15 text. It also contains real, concrete symmetric-law design (player/rival treated identically for bidding, resale, and rival-to-rival acquisition) and correctly defers loan/debt math and creditor settlement to P11 rather than annexing it. However, three concrete problems survive scrutiny under this lens, one of which undermines the pricing formula (FRP) that every one of the three required scenarios is built on.

---

## Problems (with corrected statements)

### 1. FRP's facility-refund description misstates the shipped code AND overstates a digest-downgraded "P11 law" as settled — HIGH SEVERITY

**Claim (§2, bullet 1):** "Facility refund value uses the code's own rule: `round(blueprint.capex × 0.5)` off the **ledger-recorded** capex row (`placement.ts:1025-1027, 1719-1721`) — not a re-derived 'today's catalog price,' per the P11 handoff law against reconstructing book value from the current blueprint (`P11-TO-P12-PRODUCER-HANDOFF.md:37`)."

**Why wrong, part A (code fact):** This is backwards. The live `demolishFacility()` call site does `const blueprint = blueprintById(placed.blueprintId)` (**today's catalog lookup**) and then `facilityDemolitionRefund(blueprint)` returns `Math.round(blueprint.capex * FACILITY_DEMOLITION_REFUND_FRACTION)` — i.e., **today's blueprint catalog price**, not a stored ledger-recorded historical capex row (`src/core/placement.ts:1026,1066`, confirmed by direct read). The `placement.ts:1719-1745` block the report also cites is an **invariant checker**, not the pricing path — it merely asserts that the ledger's original capex row and today's blueprint happen to agree (true today only because catalog values are frozen at this snapshot). The sibling phase-2 analysis `boundaries-corrections.md` gets this right: "the live demolition refund already violates this narrowly (`placement.ts:1026`)."

**Why wrong, part B (digest correction ignored):** `_DIGEST.md` (`verify:code-finance:source-fidelity`, line 22) explicitly downgrades exactly this citation: *"CLAIM: 'never reconstruct a purchase from today's blueprint price or a title' (P11-TO-P12-PRODUCER-HANDOFF.md:37) is a P11 handoff LAW binding any future book-value reader (rated HIGH). WHY OVERSTATED: ... the report itself notes the live demolition refund is computed from today's blueprint (placement.ts:1026). CORRECTED: ... extending it to future valuation readers is a MEDIUM design inference, not a cited law."* The task brief binds every phase-2 analyst to respect this digest ("you MUST respect its corrections"); ma-auction.md instead re-asserts the overstated, already-refuted reading, without qualification, as the basis for its central pricing primitive.

**Corrected statement:** The shipped `facilityDemolitionRefund`/`demolishFacility` mechanism computes refund from **today's catalog blueprint.capex** (`placement.ts:1026,1066`), not a ledger-recorded historical row — and today the two agree only because the catalog hasn't moved. Building FRP's facility-refund term from the **ledger-recorded** original capex instead is a legitimate and probably better **new design choice** for a bankruptcy/auction context (avoiding a rival that gets refunded at a re-priced catalog value), but it should be stated as a new design decision, not attributed to an existing "P11 handoff law" — a citation `_DIGEST.md` already rated WEAK/REFUTED for exactly this over-extension. (`net-worth.md`, working from the same fact, gets the framing right: "this is a new, explicit design decision for this new read model — not a restatement of the narrower P11-TO-P12 rule.")

### 2. Package-boundary recommendation collides with the "P15D" identifier five sibling analyses already assigned elsewhere — MEDIUM-HIGH SEVERITY

**Claim (§13):** "Adopt: a new package, **P15D — 'Bankruptcy Settlement & Studio Disposal.'**"

**Why wrong:** Across the rest of the phase-2 batch, "P15D" is already the converged name for the **direction-C valuation/net-worth** package, not the M&A/bankruptcy package:
- `boundaries-corrections.md` row 4: "proposed **P15D** ('Studio Value & Legacy Economics')" for the valuation range.
- `net-worth.md`:397,442: "new **P15D — Studio Value & Net Worth**."
- `ranking-vs-value.md`:25-26,249-251: "Studio Net Worth (new, **P15D**)," "Studio Valuation (new, **P15D**)," "Financial Standing band | **new P15D**."
- `loans.md`:213 explicitly reasons about "a *different* P15-numbered slice ... for Direction C's net-worth/valuation display" as a candidate P15D, while ruling out a new package for loans themselves.

Two sibling analyses that touch the M&A boundary question directly left the M&A slice's name deliberately open rather than claiming P15D: `rival-failure.md`:406 and `player-failure.md`:182,306 both write "Undetermined — new **P15D or P16+**, per Direction I's own research" — i.e., they defer the exact letter to ma-auction.md, but ma-auction.md then picks the same letter five other documents have already given to a different, unrelated package (valuation/net worth), producing a corpus with two incompatible definitions of "P15D" that the eventual completeness-critic/Owner synthesis (deliverable §13) will have to reconcile or silently contradict itself on.

**Corrected statement:** Rename the bankruptcy/M&A-settlement package proposed here (e.g., **P15E — "Bankruptcy Settlement & Studio Disposal"**, or fold it as a labeled sub-slice of the existing P15B terminal-ladder package per `boundaries-corrections.md` row 12's own hedge — "P16+ (or a scoped P15D extension...)" — which at least frames it as an *extension* of the valuation P15D rather than a same-named rival package) so the deliverable's package-boundary map (§13) does not carry two different "P15D" definitions forward from its own source analyses.

### 3. A direct quote is misattributed to the wrong authority document — MEDIUM SEVERITY

**Claim (§13, "Why not fold this into P15B directly..."):** "P15B already owns 'very large / high risk... must not be bundled with acquisition transactions' per the prior-wave risk table (**`P15-BUILDER-ANNEX.md` risk register**)."

**Why wrong:** The quote is verbatim, but it is not in `P15-BUILDER-ANNEX.md`. It is the P15B row of the risk table in **`P13-P15-LONG-RANGE-ROADMAP.md:757`**: `| P15B | Very large / high risk | finance completeness, failure experience, project conservation | Must not be bundled with acquisition transactions |`. (`P15-BUILDER-ANNEX.md` has no "risk register"/risk table at all — confirmed by grep across the whole file.) The report's own §15 Sources line does correctly list `P13-P15-LONG-RANGE-ROADMAP.md:...757-759`, so the underlying research is sound; only the in-body attribution sentence points a reader to the wrong document.

**Corrected statement:** "...per the prior-wave risk table (`P13-P15-LONG-RANGE-ROADMAP.md:757`)," not the Builder Annex.

---

## Secondary / lower-severity notes (not counted as full violations)

- **§2 table, Offworld Trading Company row:** "no sale price at all; the loser's income flows to shareholders" undersells that Offworld's actual majority-buyout mechanism (per `_DIGEST.md`'s comp-ma correction, line 261) **is** a priced, escalating per-share purchase (rising price, final-five block, +20%/third-party share) that culminates in the AI-run subsidiary state — the report is right that only the *post-acquisition operating* model is being borrowed and right to reject the share-market pricing elsewhere (§2's Railway Empire row), but the Offworld row's wording could be misread as "Offworld has no acquisition price mechanic," which is false. A one-clause fix ("...once majority is bought via OTC's own escalating per-share mechanism (rejected here, §2), the target has no further sale price...") would close this.
- **§13 dependency list:** the new `StudioIdentity` ownership edge is listed as owned solely by the new package without naming **P12** as a co-authority, even though every authority doc inspected (`P15-BUILDER-ANNEX.md` §A, `P13-P15-LONG-RANGE-ROADMAP.md` §7/Identity table) states P12 is "the sole active/dormant/closed registry and entrant-identity/business-state owner" and "must supply real studio identities." The additive-root technique used (a separate versioned `ownership` root, not a `StudioIdentity` field) is sound and avoids the exact-key-validator problem, but the dependency list in §13 should still name P12 as a required co-signer/coordinator for any root that attaches to a studio identity, consistent with how `P15-BUILDER-ANNEX.md` §C.4 requires a P12-validated participant manifest for other identity-adjacent transitions.

---

## Checked and found CORRECT (strong points — direction/authority handled well)

- Direction I treated as settled and not reopened; the §1 SUPERSEDED-BY-OWNER-DIRECTION bullet correctly separates the *dependency facts* (valuation, contract assumption, rights model — still real costs) from the *"disallow" conclusion* those prior docs drew (now superseded) — exactly the CONFIRMED/SUPERSEDED distinction the method requires.
- OpenTTD `bankrupt_value` loan-exclusion claim matches `_DIGEST.md`'s correction exactly (comp-bankruptcy-loans:completeness-overclaim, "the acquirer does not inherit the loan in the pinned code") — correctly used to ground FRP's "obligations" term.
- OpenTTD leader-first bid-order critique matches the digest's correction of comp-ma's "cannot snowball" claim (comp-ma:completeness-overclaim, line 268) essentially verbatim, and is then correctly carried through to a concrete, hedged recommendation in §7 rather than silently adopted as settled.
- GearCity takeover-price formula reproduces the digest's corrected formula (0.22×Eval+1.3×… / 0.48×Eval+1.75×…) exactly, and is correctly labeled "cited below only as the general shape... not copied numerically" since no share market exists or is proposed for Project Studio — respects the "no fake precision" / no-share-market law.
- Capitalism Lab "Playing Without a Company" correctly downgraded to DEV PREVIEW (not shipped), matching `_DIGEST.md`'s comp-ma:completeness-overclaim correction almost verbatim, including the takeover-vs-bankruptcy split.
- Blockbuster Inc.'s dormancy-with-return pattern (a real, new `_DIGEST.md` MISSING item) is correctly recorded as evidence but explicitly **rejected** as a base pattern because it conflicts with directions D/G's one-way ladder — a good example of not silently importing a conflicting comparator just because it is shipped.
- Football Manager 24's staged distress ladder is correctly restored to CONFIRMED/shipped status per the digest's retraction of the earlier QUALIFIED downgrade, and used consistently in both §7 and §10.
- Films/library never transfer without a P16 rights model — correctly and repeatedly grounded in `P15-PACKAGE.md:539` ("Future acquisition cannot rewrite historical creator/owner facts; this is a P16 requirement, not P15 implementation" — verified verbatim at that line).
- `StudioId` permanence claim (§9) is not just asserted but is directly supported by `P13-P15-LONG-RANGE-ROADMAP.md`'s Identity table (verified at lines 268-278): "Rename, distress, closure, **acquisition**, or re-entry appends events; none remints the studio" — the roadmap already anticipated acquisition as an identity-preserving event, which strengthens rather than merely permits this report's claim.
- Symmetric player/rival law is respected throughout (§7 eligibility filter applies to "any eligible studio"; §9 explicitly derives rival-to-rival acquisition and player resale from the same N-party mechanism rather than special-casing the player) — consistent with `P15-BUILDER-ANNEX.md` M.5 ("Player and rivals use the same pre-terminal predicates... only human-versus-policy selection differs," verified at that section).
- Every dollar figure in Scenarios A/B/C is explicitly labeled PROVISIONAL/HYPOTHETICAL, and loan/debt math is correctly deferred to P11 rather than computed by the proposed package, per direction F's own text.
- The new Capitalism Lab "Acquire Companies Facing Bankruptcy" DLC setting and the GearCity "Monopoly Lawsuits" >75%/0.3%-per-turn ceiling are both genuine, previously-missing (per `_DIGEST.md`) shipped precedents, correctly labeled as DLC/optional rather than base-game, and put to real use in §10's anti-snowball table.

---

## Missing items

- No cross-reference to `P12` as a required co-authority for the `StudioIdentity`-adjacent ownership edge (see secondary note above).
- No acknowledgment that the "P15D" label it claims is already in use elsewhere in the phase-2 corpus for a different package (Problem 2).
- Does not address migration/old-save behavior for a studio that becomes a label mid-campaign (not disqualifying for this lens, but worth the completeness critic's attention since direction/package law elsewhere requires explicit migration handling for every new root).
