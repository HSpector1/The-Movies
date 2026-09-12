# P16 Candidate Ruleset — Legibility Lens

**Scope note.** This is one candidate ruleset among several lenses Future Ops is running in parallel. It optimises for the smallest set of rules a player can understand from one screen and a builder can implement without a second registry, a second lot, or a bargaining simulator. It treats assignment §2 items A–T as SELECTED and does not reopen them; where a selected rule creates a structural collision with existing accepted code or approved documentation, the collision and the smallest correction are stated explicitly rather than designed around silently. All dollar figures anywhere in this document are PAPER HYPOTHESES for illustration only.

**Confidence key.** CONFIRMED = evidence and prior prose agree. QUALIFIED = evidence supports it with a caveat. CORRECTED = prior prose said something different and evidence fixes it. SUPERSEDED BY OWNER DIRECTION = the fact is true today but the Owner has already directed a different future. Every recommendation below is an INFERENCE unless flagged otherwise.

---

## 3. StoryProperty and minimal-rights model

**The split.** A released Film and its underlying Story Property are two different things, exactly as real copyright law treats a film as a derivative work whose copyright never absorbs the underlying material (10-rights-law.md, U.S. Copyright Office Circular 14, HIGH/CONFIRMED). Project: Studio has no such split today: `IndustryFilm.studioId` and `FilmResult` both use `productionId` as identity, `FilmConcept` has no owner/rights field, and the code already tells original-vs-market-sourced material apart at the screenplay layer — `isOriginalScreenplay(blueprint)` and `ScreenplayProvenanceView.origin: 'original'|'pool'` (04-code-audit.md, HIGH/NEW, `screenplay.ts:305-345`). That seam is the natural, already-built anchor for "studio-created vs externally sourced."

**Rule (legibility-first).** One StoryProperty identity is minted per original concept at the moment it is greenlit (not at release, so a cancelled production still leaves a legible "unproduced property," and not at commission, which the accepted code does not currently key on) (10-rights-law.md, INFERENCE). It carries:

- an immutable **origin** — studio-original or externally-sourced, reusing the existing screenplay-provenance field (04-code-audit.md);
- an immutable **creator** (studio + credited people) that ownership transfer never rewrites (02-authority-corporate.md, HIS-013/INT-011, HIGH/CONFIRMED: "ownership change never remints a work or erases creator/history");
- a list of the **works** it has produced (Film IDs = production IDs, append-only);
- a single **current holder**, changed only by a dated, append-only transfer event.

**Minimal rights bundle.** The Owner's brief (§2.B) asks for enough granularity to make buying/licensing decisions meaningful without turning rights into clerical work. Every real deal researched — Disney/Marvel, Sony/Spider-Man, Lucas/Fox, DreamWorks/Soros — reduces cleanly to two ownable things and one licensable facet (10-rights-law.md; 08-realworld-ma.md, HIGH/CONFIRMED across nine cases). The legibility lens keeps exactly that, and no more:

1. **Story Property ownership** — the property itself, including the right to make sequels/remakes/spinoffs of it. Continuation authority is *not* a separate ownable thing; it is a facet of owning the property, exactly the way owning a house includes the right to renovate it.
2. **Film/Library ownership** — the released work itself, tradeable independently of the property that spawned it (DreamWorks sold its 59-film library while Viacom kept sequel/merchandising rights: 10-rights-law.md, HIGH/NEW).
3. **One generic Licence instrument** — `{ facet: continuation | crossMedia(P18-only), exclusive: boolean, termWeeks, consideration, reversion week? }`. A property owner can license out continuation authority (Sony/Spider-Man: perpetual so long as a film releases every 5.75 years, HIGH/NEW) without selling the property. No territory, no media sub-splits, no window slicing — every real case and every comparator that shipped rights-as-an-object stopped there (10-rights-law.md §"Design implications").

This is "one instrument over three": Property, Film, and one Licence shape, instead of four separate right-types with their own UI. Cross-media (television, later cross-media exploitation) is deliberately **not** a right anyone can hold or license under P16 — see Rule R06.

**Structural note.** The accepted contract already assigns P16 sole authority to mint "each property/library identity ... explicitly by exact ID; it may not infer or bulk-mint" (02-authority-corporate.md, HIGH/CONFIRMED, consumer contract §15). This ruleset follows that: StoryProperty rows are created lazily, one at a time, at greenlight or at first external purchase — never a bulk migration pass across every historical film.

---

## 4. Film-library value

**What the original never had.** The retail game's only "value" concept, Studio Rating's Capital term, was literal cash in the bank, and the closest thing to a library term — "Movies 24%" — explicitly **decays** ("a town with a staggeringly short memory," Prima p.46) rather than accumulating (01-original-game.md, HIGH/CORRECTED). Pre-release press promised VHS/DVD "further royalties" but it was cut before ship (01-original-game.md, HIGH/NEW). So library value is entirely successor design; nothing here is original parity, and every P16 document must say so.

**What accepted law already forbids.** A released film's economic life ends the week its locked `TheatricalRun` completes; there is no re-release, no home-media window, and P11 explicitly has no depreciation/asset-valuation authority ("Do not invent balance sheet," 03-authority-domains.md, HIGH/CONFIRMED). The assignment's own §2.C brief already anticipates this: "Do not invent perpetual weekly library cash before an owning distribution/media system actually exists."

**Rule.** Library value is a **valuation-only** line, never a cash flow: a displayed "Library (estimated)" figure computed from the count and quality of a studio's owned Story Properties and Films, fed into Studio Valuation (§14) and nowhere else. It never touches the weekly ledger, never feeds Standing (which is explicitly current-reputation-only and already excludes cash/valuation — 09-valuation-finance.md, HIGH/CONFIRMED), and produces no royalty income until a P18 distribution/media system exists to own that cash flow (comparator evidence: Amazon/MGM, Miramax/Netflix, and The Executive's home-entertainment deals all gate library cash behind a distribution channel — 08-realworld-ma.md; 06-comparators-B.md).

**Why this matters for legibility.** A player who sees "Library: $8.2M (estimated)" on one line and "Cash: $340,000" on another understands immediately that the two are different kinds of number. A weekly trickle from old films would instead read as an invisible tax the player can't audit — the opposite of "one screen."

---

## 5. Acquisition operating model (A/B/C/D against the six criteria)

The Owner's brief names Model D — choose Absorb Completely or Absorb + Retain Brand as Label at the moment of closing — as the current Future Ops recommendation. A gap-fill pass confirmed that no prior Future Ops control document actually contains that label; it traces to the assignment text itself (14-gap-future-ops-control-board-verification.md, HIGH/CONFIRMED). It is, however, independently and heavily corroborated by comparator evidence and by a code-level six-criteria table built specifically to test it (13-gap-model-d-six-criteria-evaluation-table.md). That table is reproduced here in full because it demonstrates rather than asserts the choice:

| Criterion | A — Full Absorption | B — Autonomous Subsidiary | C — Absorb + Retain Label | D — Owner Choice (A or C) |
|---|---|---|---|---|
| Player comprehension | HIGH (one outcome) | LOW — three comparators independently call it a "fiction"/tedium (MGT2, Capitalism Lab, Software Inc.: 06-comparators-B.md F14; 05-comparators-A.md) | HIGH (one extra field: brand name) | HIGH (one low-friction choice at closing, comparator-validated by Capitalism Lab's [Acquire]/[Acquire and Merge] click) |
| Historical identity | Preserved via dated events, brand not shown | Preserved, brand operates | Preserved, brand shown (GearCity's "marque": HIGH/CONFIRMED) | Player's choice of which |
| Management burden | LOW **once H5 ships** (see below) | HIGH, unconditionally — the fix that rescues A/C/D structurally cannot apply to B | LOW **once H5 ships** | LOW **once H5 ships**; never inherits B's failure mode because D's menu excludes B by construction |
| Gameplay value | Prize = properties/knowledge/roster | Prize = same, plus an ongoing management minigame nobody in the comparator set enjoyed | Prize = same + a retained-brand credit/history hook | Best of A/C, player's choice |
| AI/rival compatibility | HIGH once H5 ships | Requires a second full AI loop per subsidiary — no comparator ships this without becoming "immovable objects"/scripted-immune (06-comparators-B.md, MGT2) | HIGH once H5 ships | HIGH once H5 ships |
| Save/performance | Bounded (one business record retired) | Unbounded — RivalAccount/production arrays for every never-closing subsidiary compound an already-exceeded save-growth budget (04-code-audit.md, 49.6MB at week 8791) | Bounded | Bounded |

**H5, the single blocking fact.** Every entered rival must have a live `RivalBusiness` that ticks unconditionally forever; the accepted validator hard-requires exactly one live business per entered rival identity with no "operations ended" state (`hollywoodValidation.ts:331`, `hollywoodTick.ts:221-288`, HIGH/CONFIRMED, re-verified independently in 04-code-audit.md, 11-gap..., 13-gap..., and 16-gap...). This single fact governs five of the twenty-four cells above: Models A, C, and D all need one new terminal-business state before they can reach LOW management burden / HIGH AI-compatibility; Model B's own premise (the business keeps operating) means that fix can never rescue it. This is the structural problem stated plainly, per the task's requirement — see §11.9 of the collision list at the end of this document.

**Rule.** At the moment a whole-company acquisition closes, the buyer makes exactly one choice, once: **Absorb Completely** (target's identity is folded in with no visible brand) or **Absorb Operations, Retain Brand as Label** (target's `StudioId`, name, mark, and founding date remain visible on the buyer's own releases as a credited label, with zero independent roster, ledger, lot, or ongoing business). No third choice, no changing the choice later, and a retained label never becomes a second managed studio.

---

## 6. Exact acquisition transfer bundle

Answering assignment §2.F's eight numbered questions directly, grounded in the accepted code's own primitives (03-authority-domains.md, 04-code-audit.md, 08-realworld-ma.md):

**1) Does acquired cash become buyer cash?**
Yes, at par, including if negative. This needs exactly one new typed ledger movement on the buyer's side and one on the target's (accepted `LedgerKind`/`RivalMoneyKind` are both closed unions that must be additively widened — 04-code-audit.md, HIGH/CONFIRMED). Real-world practice supports par transfer for whole-entity purchases (Amazon/MGM assumed and immediately repaid $2.5B of debt as part of an $8.45B headline; GearCity transfers "cash funds" as part of its shipped bundle — 08-realworld-ma.md; 05-comparators-A.md). Price is always quoted **net of** the cash the target carries, so the player never double-pays for cash that is about to become theirs.

**2) Does debt transfer?**
There is no debt instrument in Project: Studio to transfer — no loans, no interest, no credit, and P11-REQ-041 (loans) is explicitly OWNER-BLOCKED (03-authority-domains.md, HIGH/CONFIRMED). What *does* exist and *does* transfer are **typed obligations**: the target's remaining contract guarantees and any committed-but-unspent production cost. "Assumption purchase" (§13) means the buyer takes on these obligations, not a nonexistent loan. If the Owner ever authorizes a P11 debt instrument, it slots into this same "obligations" row without new P16 machinery.

**3) Do employee contracts transfer intact?**
Yes, structurally: end the target's employment row, open an identical new one under the buyer with a new lawful reason (a new value alongside the existing `entry|renewal|replacement|expiry|termination|player-contract` enum), and copy `Contract.signingBonus` **without** re-debiting it — the accepted per-employment signing-bonus ledger cross-check needs an explicit exemption for this reason code (04-code-audit.md, HIGH/CORRECTED). `ContractId` cannot be mutated in place because it embeds the employer's `StudioId`; a new contract row under the new employer, cross-referenced by a `fromStudioId→toStudioId` receipt, is the only lawful shape (03-authority-domains.md). This is legally precedented in P12's own design authority: "sale/assignment" is already a named lawful terminator of exclusive contracts (02-authority-corporate.md, MEDIUM/CONFIRMED).

**4) Can the player release inherited staff afterward under ordinary termination law?**
Yes — no new rule needed. The instant the transfer in (3) lands, inherited staff are ordinary contracted employees under the buyer, subject to the existing law: pay 50% of the remaining guaranteed salary, refused while the person is mid-screenplay (04-code-audit.md, HIGH/CONFIRMED, `employment.ts:172-180`). This priced, symmetric exit is exactly the kind of natural integration friction real deals and comparators both show (TWC: buyer re-offered contracts to about two-thirds of staff; Hollywood Animal: partial-cost-recovery early termination — 08-realworld-ma.md; 06-comparators-B.md).

**5) What happens to active movies?**
They transfer and continue under the buyer, who may finish or cancel each at its ordinary cancellation cost. Because a rival production is not container-bound to a physical set the way a player production is, the transfer is a **re-formation**: mint a new `ProductionWorkflow` under the buyer that preserves the original `productionId`/`conceptId`/participants/remaining-work state, plus one ledger-witness row for the transfer itself (04-code-audit.md, HIGH/QUALIFIED — this is the code's single hardest identity-preservation constraint for rival-to-rival transfer, and it does not arise for rival targets today because rival productions never bind to a placement ledger — 16-gap-rival-ai-acquisition-code-feasibility.md, HIGH/QUALIFIED). Real-world precedent: Disney/Fox inherited an in-progress slate, finished some, cancelled the rest at a $170M write-down (08-realworld-ma.md, HIGH/NEW).

**6) What happens to target facilities if only one lot is actively managed?**
Nothing physical ever appears on the buyer's lot — there is nothing to move. Rival studios today own no buildings at all; they hold four abstract, once-paid capacity rows (`development|stage|scenery|post`) with no blueprint, tier, or footprint (03-authority-domains.md, HIGH/CONFIRMED). At closing, that abstract capacity converts automatically to a one-time cash credit using the exact liquidation rate a player already gets for demolishing a real building (0.5× facility capex, 0.35× for sets, always strictly below 1 — 04-code-audit.md, HIGH/CONFIRMED). This is Owner option 1 (automatic liquidation) applied to an asset class that, for rival targets, is already trivially liquid — see the structural note in §7.

**7) What exactly does acquired research grant?**
Verified, completed knowledge only — never an installed building. The buyer receives a new technology-adoption row at the "ready to adopt" stage, citing the target's original provenance, for every technology the target had *finished* researching (03-authority-domains.md, HIGH/CONFIRMED, per P13's six-fact model). The buyer must still lawfully build and pay for the physical facility body before operating that capability — no teleporting installation. In-flight (not-yet-completed) research does **not** transfer; P13-OD-06 already states in-flight work "never moves across technologies or studios," and this ruleset does not ask the Owner to reopen that (03-authority-domains.md, HIGH/CONFIRMED). Comparator support: Capitalism Lab explicitly separates "physical assets change hands" from "underlying technological capability," making tech-dependent firms non-transferable by design (05-comparators-A.md, HIGH/CONFIRMED) — the inverse confirmation of the same principle.

**8) What happens when target knows a higher physical tier than the buyer owns?**
For rival targets today, this scenario is structurally moot: rivals hold abstract capacity with no tier field, so there is no "higher physical installation" to compare (03-authority-domains.md, HIGH/CONFIRMED, `hollywood.ts:98-105`; `types.ts:864-872`). The only thing that ever travels is the *knowledge* answer from Q7 — the buyer becomes eligible to build Tier III once it has lawfully paid to build it, exactly as if it had researched Tier III itself. **Flag:** if a future rival-facility/rival-lot system is ever authorized, this question becomes live and the answer should still be "knowledge only, buyer builds the physical body" — stated here so that future system inherits the rule rather than reopening it.

---

## 7. Physical property

The Owner's brief lists four alternatives and rejects "another lot-management game." Given §6.Q6/Q8 above, the answer is simple because there is currently nothing to manage: **automatic liquidation at closing** (Owner option 1), using the existing lossy demolition-credit formula, is both the correct rule today and the one that requires zero new mechanics. Options 2 (player chooses what to sell) and 4 (transferable equipment) have no substrate to attach to — there is no per-body equipment inventory in accepted code (03-authority-domains.md, HIGH/SUPERSEDED_BY_OWNER_DIRECTION: the P13/rulings language about `installedEquipment`/`conversionRequirementDescriptor` describes a *recommended future* facility-conversion model, not accepted code). Option 3 (remote property as a pure financial asset) is functionally identical to option 1 for rival targets since the "asset" already has no operations attached to it; the two collapse into one rule. A future remote-lot system (option 5) is explicitly not required now and this ruleset does not build toward it.

**Rule.** At closing, all of a target's physical/capacity assets convert once, automatically, to a cash credit at the standard lossy liquidation rate. Nothing is placed on the buyer's lot. If the target's brand is retained as a label (§5), the label carries no physical footprint either.

---

## 8. Active productions

Answering the Owner's four alternatives directly: (1) active projects transfer and finish under the buyer — **selected**; (2) the buyer additionally gets an ordinary cancel option at the normal cancellation cost, so "transfer and finish" and "buyer chooses" are the same rule, not two; (3) no separate "acquisition-transition owner" state is needed — the re-formation in §6.Q5 lands the production directly under the buyer at the closing week; (4) bankruptcy handles active productions differently, as a distinct per-project auction lot (§13), because a bankrupt estate has no operating buyer to hand a live production to.

**Rule.** Every inherited production keeps its original `productionId`/`conceptId` forever — no duplicate identity is ever minted for the same work, matching Owner principle §2.F and every real-world case researched (RKO, Orion, Relativity, TWC: each kept finished/in-progress films as historically identifiable even as ownership moved — 08-realworld-ma.md, HIGH/CONFIRMED). The buyer may cancel an inherited production at the same write-off cost any studio pays to cancel its own work; there is no special "inherited discount" and no special penalty.

---

## 9. Historical identity/status model

The three worked examples in the Owner's brief —

- **STUDIO BANKRUPTCY** — RKO Pictures — Closed: 1963 Week X
- **ACQUISITION** — Warner Brothers — Acquired by Spector Pictures: 1987 Week X
- **MERGER/ABSORPTION** — United Artists — Independent operations ended: 1995 Week X — Successor owner: Spector Pictures

— read as three different mechanisms, but the legibility answer is that they are **one mechanism with one boolean**. A single `CorporateEvent` record, keyed by the immutable `StudioId` (never reminted — 02-authority-corporate.md, HIGH/CONFIRMED, "StudioId — Mint once ... none remints the studio"), carries:

```
{ studioId, week, kind: 'closed' | 'acquired', successorStudioId?, brandRetained: boolean }
```

- **Closed** (RKO): `kind:'closed'`, no successor. This is P15's own settlement outcome and is explicitly never an alias for `acquired` (02-authority-corporate.md, HIGH/CONFIRMED, P12 §30).
- **Acquired, brand kept** (Warner Brothers): `kind:'acquired'`, `successorStudioId` set, `brandRetained:true` — the display reads "Acquired by Spector Pictures."
- **Merger/absorption, brand dropped** (United Artists): `kind:'acquired'`, `successorStudioId` set, `brandRetained:false` — the display reads "Independent operations ended — Successor owner: Spector Pictures." This is exactly Disney's real "20th Century Studios" pattern (operations absorbed, "Fox" dropped, films still credit the original filmmakers — 08-realworld-ma.md, HIGH/NEW) and matches the assignment's own third example almost verbatim.

**Why one event, one boolean, and not three enum values:** a builder implementing "MERGER/ABSORPTION" as a wholly separate corporate-status kind would need a third code path with its own display rule, its own migration, and its own edge cases, for a distinction that is otherwise identical to "acquired." Collapsing it to a boolean on the same event is the smallest correct model, and it is what CK3's append-only holder-event log already validates for a different domain: "identity never rewritten, holder changes append" (07-comparators-C.md, MEDIUM/CONFIRMED).

**Rule.** No StudioId is ever deleted, renamed away, or reused. Every past film, employee credit, and award stays attributed to the studio that made it, forever, independent of who currently holds the property or the studio's brand (02-authority-corporate.md, HIGH/CONFIRMED, INT-011/INT-012).

---

## 10. Rival M&A

**No player-only superpower.** The same eligibility, pricing, cooldown, and floor rules apply whether the buyer is the player or a rival AI (02-authority-corporate.md, HIGH/CONFIRMED, "no isPlayer multiplier or exemption"). A rival can be a target, a buyer, or both over a campaign.

**When an AI should bid.** Reusing the existing, already-audited pattern for AI decisions (a pure function reading only public facts plus a new derived RNG stream, never `state.rngState` — 04-code-audit.md; 16-gap-rival-ai-acquisition-code-feasibility.md, HIGH/CONFIRMED): a rival bids only when (a) it passes the same affordability check as the player (§17), (b) the target's price is at or below the rival's own private valuation of the target, and (c) the deal would not breach the active-rival floor (§17). This needs the engine's **first-ever** cross-business read (no existing rival decision function reads another business's data today — 16-gap..., HIGH/NEW) and must be explicitly authorized rather than assumed to fall out of existing code.

**Frequency and consolidation.** Every comparator that let rivals buy freely and never fail became either a collecting exercise (MGT2's rivals are "immovable objects" that never go bankrupt — 06-comparators-B.md, HIGH/NEW) or a snowball (Hollywood Animal's cinema purchases: "you will practically destroy every other competitor" — 06-comparators-B.md, HIGH/QUALIFIED). This ruleset avoids both failure modes the same way: the active-rival floor (§17) is a **hard eligibility predicate**, not a soft preference, so the game itself refuses a transaction rather than the Owner having to tune AI behavior to avoid over-consolidating.

**The player is not a target — for now.** No document anywhere in the accepted or approved corpus contemplates a rival hostile-acquiring the player's own studio, and the one comparator that shipped exactly that (Railway Empire) produced the single most-hated failure state found in this research: a rival "simply bought all of my shares and took over the business" and ended the player's game (07-comparators-C.md, MEDIUM/CONFIRMED). "Symmetric transaction law" in this ruleset means the same *rules*, not that the player's own studio is eligible to be bought — see §20 for why that stays a genuine open Owner decision rather than something this ruleset assumes either way.

---

## 11. Asset sales & exploit guards

**What is sellable.** Story Properties; Film/library rights; physical/equipment credits (already sellable via the existing demolition mechanic); a studio's retained brand/label, sold on its own for cash with zero operational transfer (§5, §12). The Owner's list also names "technology/license rights where upstream ownership permits" — this ruleset does not build that in P16A/B/C; it stays exactly where P13 already parks it (03-authority-domains.md, "Later commercialization scope") until the Owner separately charters it.

**One reused idiom for the smallest sales.** The original game's *only* IP transaction — instant sale of an unproduced script to "rival studios" for a disclosed, deterministic price (01-original-game.md, HIGH/CONFIRMED) — is kept, unchanged in spirit, for the smallest case: an unproduced Story Property (one that has never yet produced a Film) may be sold instantly to "the open market" for a shown price. **Released films, whole libraries, and brands are never sold this way** — they require an actual named counterparty (a specific rival, or the estate buyer in a distressed sale), because an anonymous instant-cash sale of a studio's whole history would not survive the "explain it to a friend" test the way "you sold an old unused script" already does.

**Exploit guards, in order of how much mechanism each costs:**

1. **Single holder, append-only log.** Every property/film has exactly one current holder at a time; every transfer is a dated record whose `from` must equal the current holder or it is rejected. No duplicate ownership is representable (10-rights-law.md, INFERENCE, reusing the P16 chain-of-title requirement already in approved documentation).
2. **Rights-in-use lock.** A property or film cannot be sold while an active production is using it, unless the production goes with it or the seller keeps a licence covering that production's life (10-rights-law.md, INFERENCE; MGT2 already ships exactly this: "no IP being traded while a product is on sale" — 10-rights-law.md, HIGH/NEW).
3. **Holdback / vesting.** A newly acquired asset's full appraised value is reachable only after a fixed number of weeks with the new holder, rising from a lower fraction before that — this is a direct transposition of the original's own eight-year Star-tenure vesting rule (01-original-game.md, HIGH/QUALIFIED), so it is not a new idea, only a reused one applied to a new asset class.
4. **Sub-cost price floor.** Every sale price is strictly below the asset's own build/acquisition cost basis, mirroring the demolition-credit invariant that is already `<1` by construction (04-code-audit.md, HIGH/CONFIRMED). This single rule, reused rather than invented, is what stops a buy-low-sell-high loop from ever being profitable purely from ownership churn — GearCity's own flip exploits ("about 7 billion $ from just buying and selling companies") happened specifically because its acquisition cost could fall *below* company equity (05-comparators-A.md, HIGH/CONFIRMED).
5. **Deterministic, shown price.** Every sellable asset shows its Estimated Value before any sale screen — no hidden multiplier a player must reverse-engineer (Owner §2.L; the original already did this for Stars — hover price plus a Finance-screen line, 01-original-game.md, HIGH/QUALIFIED).

No AI-memory or "haircut/premium" heuristic is added on top of these five; they are sufficient and each one reuses an idiom the game (or the original game) already has.

---

## 12. Healthy-studio acquisition

**The four-state model the Owner already wrote is the whole willingness system.** Assignment §2.L's own suggested labels — Not for Sale / Would Listen / Open to Offers / In Distress — are kept verbatim as a public, typed stance on every rival studio, visible at all times, driven by recent performance and P15 condition (never by cash directly, since P15 already forbids inferring distress from cash<0 — 03-authority-domains.md, HIGH/CONFIRMED). This is directly comparator-validated: Football Manager's Desperate/Keen/Curious agent tones, TEW's consecutive-negative-months-plus-personality refusal right, and Big Ambitions' "estimated valuation ... seller can refuse" are the same shape shipped three separate times (07-comparators-C.md, MEDIUM/CONFIRMED each).

**Price.** Ask Price = Studio Valuation (§14) × a published premium band keyed to the stance:

| Stance | Behavior | Illustrative premium band (PAPER) |
|---|---|---|
| Not for Sale | Refuses every offer, any price | — |
| Would Listen | Requires a strong offer | 1.4×–1.8× |
| Open to Offers | Accepts at or above the shown band | 1.1×–1.4× |
| In Distress | Handled by §13, not this table | — |

The band is not a hidden "control premium" formula the player has to discover — it is a shown number next to a shown stance, exactly the pattern GearCity ships (Takeover Price = evaluation share + a premium scaled by profitability, published as pseudo-code in its own manual — 05-comparators-A.md, HIGH/CONFIRMED) and exactly what Damodaran's own finance literature warns against inverting: "there can be no rule of thumb on control premium" as a hidden multiplier, but a *published*, in-game one is fine because the player can see and reason about it (09-valuation-finance.md, HIGH/N/A).

**Naming correction.** What the assignment calls a "control premium" is, in a game where the buyer never gets to run the target as a going concern independently (Model D forecloses that), better named an **independence premium** — the price of talking a studio out of not wanting to sell, not the buyer's private synergy value (09-valuation-finance.md, HIGH/QUALIFIED). This ruleset uses that name throughout to avoid importing real finance's different meaning of "control premium."

**Refusal has a reason and a cooldown.** Every refusal states a plain typed reason ("stance is Not for Sale," "offer below band"); a rejected offer starts a fixed cooldown before the same buyer may approach the same target again (07-comparators-C.md, INFERENCE, generalizing OpenTTD's and FM's shipped patterns).

**What the player sees before offering:** the target's public Studio Valuation, its stance, and (once an offer is on the table) the specific premium band that stance implies. Exact cash, debt-equivalent obligations, and unreleased-project detail stay hidden pre-offer, consistent with the existing rival-privacy law (`bridge/industry.ts` exposes only public facts — 04-code-audit.md, HIGH/CONFIRMED); a small, explicit "due diligence" disclosure at the offer stage is the only new visibility rule this requires, and its exact contents are a genuine remaining decision (§20).

---

## 13. Bankruptcy auction/acquisition

**The structural collision, stated plainly.** The assignment's own §2.M premise — "P15 may decide that a rival becomes bankrupt and its assets enter auction" — describes a step that, as approved, does not exist and cannot happen without a change. P15's closure-settlement is written as *exhaustive*: every touched category resolves (cancelled/settled) or persists only as unowned history; the word "estate" appears zero times anywhere in the P15 package or its Builder Annex, and the word "auction" appears exactly once in the entire corpus, about talent, not assets (02-authority-corporate.md, HIGH/CORRECTED; 11-gap-p15-closure-settlement-estate-auction-reconciliation.md, HIGH/CONFIRMED). Settlement as written leaves **nothing for a P16 transaction to buy.**

**Smallest correction.** No new estate-holding root, no new registry, no reopening of §12.3's settlement invariants. One sentence: *a closure-settlement request first checks whether a P16 acquisition transaction has already cleared at the frozen source revision; if it has, every owner's disposition becomes "assign to acquirer" instead of cancel/release/settle.* This adds exactly one new typed disposition value to the settlement machinery P15 already specifies, and lands on the already-distinct `acquired` terminal label rather than inventing a new one (11-gap..., MEDIUM/NEW). It requires the Owner to authorize a bounded pre-settlement window during which a P16 transaction may claim the estate — see §20; this ruleset does not assume that authorization exists yet.

**Which of the five alternatives.** Given the "explain it in one sentence" test, the legibility answer is the smallest workable pair, matching the real §363 mechanism (asset-free-and-clear, chosen-contract-assumption — 08-realworld-ma.md, HIGH/NEW) without its full legal complexity:

- **Buy the Whole Studio** — pay the Liquidation Value reserve (§14) for everything at once; the studio continues as an acquisition under Model D (§5).
- **Buy Individual Lots** — Story Properties, the film library, the brand, and equipment credits are each priced at their own reserve and can be bought separately by different buyers (rival or player).

No live, multi-round bidding war; no separate "assumption purchase" button, because there is no debt to assume in a §363-style clean sale (§6.Q2) — assumption purchase already lives inside "Buy the Whole Studio" via the ordinary obligations-transfer rule from §6. This collapses the Owner's five listed alternatives into two buttons: whole-lot (Alternatives 2 and 4 merged, since there is no debt to distinguish them) and per-asset (Alternatives 1 and 3 merged, since a clean asset purchase already carries no liabilities by definition). Alternative 5 (Hybrid) is, in effect, what results from offering both buttons at once.

**Active productions in a bankruptcy** are handled per-project, not per-studio (§8, Alternative 4): each finished or in-progress film is its own lot with its own reserve, matching Orion, Relativity, and TWC precedent exactly (08-realworld-ma.md, HIGH/CONFIRMED — "each finished or in-progress film is a separate auction lot with its own reserve").

**Unsold lots** persist in a small, visible "estate catalogue" rather than vanishing — a direct precedent from Acquire's own displaced-shareholder rule (sell now, convert, or hold, never destroyed — 15-gap-board-game-ma-comparators-acquire-18xx.md, HIGH/NEW) — and can be bought later by any studio at the same reserve.

---

## 14. Book Net Worth vs Enterprise Valuation vs Transaction/Auction Price

The assignment flags this as high priority and forbids collapsing the numbers. Comparator evidence agrees emphatically: OpenTTD keeps three separate formulas in its own source code (company value; hostile-takeover price; bankruptcy-offer price — 07-comparators-C.md, HIGH/N/A); Software Inc.'s single blended "company worth" number, patched repeatedly and reset to zero on takeover, is the community's own cited cautionary tale (05-comparators-A.md, MEDIUM/N/A); Amazon's own 10-Q for the MGM deal shows the discipline in the real world — $3.4B booked to content, $4.9B to goodwill, kept as two separate lines rather than one blended "value" (08-realworld-ma.md, HIGH/CONFIRMED).

**The ladder, four numbers, one direction:**

1. **Book Net Worth (BNW)** — an accounting identity, not an opinion: cash (may be negative) + tangible property at its existing lossy recoverable credit + locked scheduled receipts − existing typed obligations. Never includes a forecast, a strategic premium, or Library value. Computable today from P11 rows alone with no new authority (03-authority-domains.md, 09-valuation-finance.md, HIGH/CONFIRMED).
2. **Studio Valuation (SV)** — the plausible value of the operating business: `max(going-concern basis, asset basis)`. Going-concern basis capitalises trailing operating performance; asset basis is BNW plus Library/Story-Property value and a buyer-neutral technology increment. The `max()` is load-bearing: without it, a buyer could liquidate a studio's own tangible assets for more than its going-concern price implied, an arbitrage every comparator's bankruptcy code independently blocks (09-valuation-finance.md, MEDIUM/NEW, Scenario D check).
3. **Transaction Price** — what the buyer actually pays for a healthy target: SV × the independence premium band from its public stance (§12). Deterministic and shown before any offer is placed.
4. **Auction/Liquidation Price** — the clearing price in a distressed sale: reserve = Liquidation Value (BNW's asset basis, no going-concern credit, no independence premium), rising only if a rival bidder actually competes for the same lot (§13).

**One rule against double counting:** every asset lives in exactly one lane. Plant, technology, and brand value sit *inside* the going-concern number while the studio is a going concern, or *inside* the asset-basis number if it is being liquidated — never both. Cash is always counted at par, never capitalised as if it earned a multiple. Library/Story-Property value is counted once, as a strategic add-on to SV, and never also inside a reputation/Standing channel, since Standing is defined to exclude it already (09-valuation-finance.md, HIGH/CONFIRMED).

---

## 15. Real-world lessons

Nine cases were the most decision-relevant for a legibility-first ruleset:

- **Disney/Pixar (2006)** — the creative studio and the film-ownership rights can sit with two different parties; Pixar kept its site and slate while Disney had already owned the sequel rights outright. Lesson: rights ownership and operating-studio identity are genuinely separable concepts, exactly as §3 assumes (08-realworld-ma.md, HIGH/NEW).
- **Disney/Marvel (2009)** and **Disney/Lucasfilm (2012)** — buying a company does not unwind licences its properties already carry (Paramount's Marvel distribution deal survived the sale intact) and a franchise's future creative direction does not transfer even when the property does (Lucas's own sequel outlines were discarded). Lesson: R1 (property) transferring never implies the buyer inherits every downstream commitment automatically — encumbrances travel *with* the property, not away from it (08-realworld-ma.md, HIGH/NEW).
- **Disney/21st Century Fox (2019)** — the real-world Model C: operations absorbed, brand renamed/kept as a label ("20th Century Studios"), the physical lot stayed with the seller, and the inherited slate produced a real write-down ($170M quarterly loss). This is the closest real precedent to the exact Model the Owner selected, and it independently validates §7's "facilities never teleport" and §8's "buyer may cancel inherited projects at cost" (08-realworld-ma.md, HIGH/NEW).
- **Amazon/MGM (2021)** — the cleanest real proof that library value and brand/strategic value are different numbers even inside one purchase-price allocation. Directly supports §14's discipline (08-realworld-ma.md, HIGH/CONFIRMED).
- **DreamWorks/Soros (2006)** — a library sold *separately* from the operating studio, with distribution kept as a term licence and a buy-back clause at a different price years later. Direct precedent for §11's holdback/re-buy pricing discipline (08-realworld-ma.md, HIGH/NEW).
- **The Weinstein Company §363 sale (2018)** — the stalking-horse floor moved *down* (no competing bids), the buyer picked which contracts to assume, and an unpaid producer's back-end claim did not travel with the film because the contract was non-executory. Direct precedent for §13's "no debt to assume in a clean sale" and "people are re-offered, not carried automatically" (08-realworld-ma.md, HIGH/QUALIFIED).
- **Carolco (1995–96)** — a rival bidder (Canal+) beat the stalking horse ($58M vs $47.5M), and the franchise's continuation rights were auctioned as a *separate* lot from the library. Direct precedent for §13's per-lot design and for continuation authority being separately tradable (§3) (08-realworld-ma.md, HIGH/NEW).
- **RKO Pictures** — the exact real-world analogue of the Owner's three worked history examples: library, real estate, name, and remake rights ended up as four separately owned things while authorship credit stayed with RKO throughout. Direct precedent for §9's identity model (08-realworld-ma.md, HIGH/NEW).
- **Control premiums cluster 20–40%** in the real world, rise with rival bidders, and boards refuse regardless of price (Disney rejected Comcast's 2004 bid "as too low") or accept a lower bid for certainty (Fox chose Disney over a higher Comcast cash offer). Direct precedent for §12's refusal-with-reason and premium-band model (08-realworld-ma.md, MEDIUM/CONFIRMED).

---

## 16. Comparator lessons

Across nineteen titles researched (05, 06, 07, 15-comparators dossiers), the pattern that repeats is consistent enough to be treated as near-law for a legibility-first design:

- **Autonomous subsidiaries are the one shipped anti-pattern everyone converges on.** MGT2's are "a fiction" run by a timer; Capitalism Lab's override the player's own decisions; every comparator's community calls them tedious or a pure money faucet (05, 06-comparators). This is the strongest single piece of evidence *against* Model B and *for* Model D (§5).
- **A shipped willingness model is a small, typed, visible thing, not a formula.** GearCity's shareholder vote (health-driven, refusal-regardless-of-price), TEW's stance-plus-relationship, FM's Desperate/Keen/Curious, Big Ambitions' shown-valuation-with-refusal — none of these hide the driver behind a black box (05, 06, 07-comparators). §12 follows this exactly.
- **Partial ownership stakes are a uniformly failed idea.** OpenTTD removed share trading entirely, calling it an "infinite money" exploit that "adds nothing." Blockbuster Inc. had to disable its own stake dividends because the game became too easy. Anno's share system produces unexplained AI retaliation. No comparator's partial-stake system survived scrutiny (07-comparators-C.md, HIGH/CONFIRMED; MEDIUM/CONFIRMED; LOW/NEW). This ruleset does not include partial stakes at all (§17, R35).
- **A transferable asset that gates access to the shared market snowballs without bound.** Hollywood Animal's purchasable cinemas — "buying cinemas is basically the meta" — is the cautionary tale a P16 acquisition prize must never resemble. It is checked directly against Project: Studio's own P15 shared-market design in §17 and found not to apply today, but the principle stands as a permanent constraint on any *future* screen/exhibition-capacity system (06-comparators-B.md, HIGH/QUALIFIED; 12-gap-p15-shared-market-capacity-concentration-check.md, HIGH/CORRECTED).
- **Model C's brand-as-label is a real, playable, shipped pattern**, not a hopeful invention: GearCity's "marque" is exactly this — a brand that "does not operate independently from the company" yet keeps its own reputation lane, and can later be sold, spun off, or restored (05-comparators-A.md, HIGH/CONFIRMED; 13-gap..., HIGH/CONFIRMED). One negative comparator confirms the boundary by counterexample: TEW's parent/child companies keep operating their own roster and shows, which is functionally Model B, not C/D, and is exactly what a "retained label" must never become (18-gap-tew-ix-tape-library-brand-label-verification.md, HIGH/CONFIRMED). The assignment's TEW "tape-library" premise itself does not exist in any TEW title checked and should be dropped (§19).
- **No comparator runs a live, multi-round bidding war for distressed assets.** Every one uses a fixed clearing price, a creditor-priority sale, a paused evaluation window, or a sealed one-shot comparison (05, 07, 08-comparators). §13's two-button design follows this.

---

## 17. Anti-snowball

The Owner's brief explicitly rejects reaching for an artificial M&A cap and asks for the minimum necessary protection. The accepted game's own economy has already **failed** its internal snowball-bound gate even before any M&A exists ("the current brake on snowballing is the death spiral itself," a ~20% cash-share runaway measured independently — 07-comparators-C.md, HIGH/CONFIRMED, `D-16-ECONOMY-RECOVERY-DECISION-LAB.md`). This means P16 acquisition is a positive-feedback amplifier layered on an economy that is not yet self-correcting, and the anti-snowball rules below are not optional polish — they are the minimum load-bearing set:

1. **Active-rival floor (hard eligibility, not a preference).** No acquisition may complete if it would drop the number of independently operating rival studios below three. The floor already exists in approved documentation as an envelope condition (02-authority-corporate.md, HIGH/NEW, "minimum of 3 active AI rivals") — this ruleset turns it into a transaction-blocking predicate with a stated reason, rather than leaving it as an unenforced aspiration.
2. **Affordability check (the actual frequency governor).** A bid or offer is legal only if, after paying and absorbing the target's obligations, the buyer would still hold at least 26 weeks of cash against its own plus the target's combined ongoing commitments. This single rule — not a cap on deal count — is what makes serial acquisition self-limiting: every purchase drains the exact reserve the next purchase's eligibility check depends on (09-valuation-finance.md, INFERENCE).
3. **Independence premium (§12) makes healthy deals structurally expensive.** A buyer's own rational "parts value" ceiling for a one-lot absorber is normally *below* a strong target's Studio Valuation (09-valuation-finance.md, MEDIUM/QUALIFIED, Scenario C arithmetic in §18 below), so the strongest targets are naturally hard to acquire without any artificial cap — the premium band itself is the brake.
4. **Integration friction is priced, not invented.** Releasing inherited staff costs 50% of their remaining guarantee; cancelling an inherited production costs its ordinary write-off; a newly acquired asset cannot reach full resale value for a holdback period (§11). None of these are new numbers — they reuse existing law — but their *sum* is what makes rapid serial acquisition costly in a way the player can see and plan around.
5. **Cooldown after any deal, rejected or completed**, before the same buyer may approach the same (or a similarly sized) target again.
6. **No partial ownership stakes**, per §16 — every comparator that shipped one turned it into a snowball or an exploit with no compensating decision value.
7. **Distress evaporates value; it does not create a discount for the buyer's benefit alone.** A distressed studio's reserve (§13/§14) reflects the same lossy liquidation math a solvent studio would face if it demolished its own assets — the buyer is not rewarded with a special below-market floor beyond what liquidation math already implies.

**No antitrust mechanic is added.** Every real case where a regulator mattered (Fox/Disney's own regulatory-risk calculation) was a target-side consideration already covered by the independence-premium/refusal model in §12, not a separate system. The Owner's own brief treats antitrust as "only if absolutely necessary later" — nothing here shows it is necessary yet.

---

## 18. Package boundary

**P16A/B/C, confirmed and layered.**

| Package | Owns | Depends on |
|---|---|---|
| **P16A — Library, Story Properties & Rights** | StoryProperty/Film Library identity, chain of title, the one Licence instrument, dated ownership history | Nothing beyond P11/P12 as they exist today; can ship first |
| **P16B — Rights & Asset Transactions** | Sale/licence of individual Story Properties, films, brands, equipment credits between two active studios; exploit guards of §11 | P16A + existing P11/P12 typed-receipt plumbing |
| **P16C — Studio Acquisition & Integration** | Whole-studio purchase/auction, the Model-D choice, the transfer bundle of §6, the corporate-history model of §9 | P16A + P16B + the H5 terminal-business-state fix (§5) + the P15B pre-settlement estate gate (§13) + a new P12 employment "assumed" reason |

This split is not invented for this ruleset; it is the shape the assignment itself proposes, and it survives independent scrutiny from four different angles (code-seam fit in 04-code-audit.md; approved-documentation fit in 02-authority-corporate.md; comparator fit in 13-gap...; and the explicit note that no prior Future Ops document states it as settled, only as assignment-originated and now independently corroborated — 14-gap-future-ops-control-board-verification.md, HIGH/QUALIFIED).

**What stays outside P16 entirely.**

- **P16D** — not created. Financing/leverage as an anti-snowball lever stays exactly where it already sits: an Owner-gated P11 decision (P11-REQ-041), not a P16 mechanism. Nothing in this ruleset needs a debt instrument to work (§6.Q2, §17).
- **P17 (sequels/remakes/franchises)** — consumes P16A's exact `StoryProperty.works` list and current continuation-authority holder; it may never mint or infer a property from title, genre, or cast resemblance (02-authority-corporate.md, HIGH/CONFIRMED, consumer contract §15). A sequel is always a *new* concept/script linked to the parent property by an explicit edge — the accepted code's "a concept already owns a screenplay project" rule makes reusing the same concept for a second film structurally impossible (10-rights-law.md, HIGH/QUALIFIED).
- **P18 (television/cross-media)** — consumes only explicit cross-media grants under P16's Licence instrument (§3, Rule R06: forbidden before P18 exists to exercise them). P16 remains the sole author of parties/scope/term/consideration for any such grant even after P18 ships (02-authority-corporate.md, HIGH/CONFIRMED).
- **Co-productions** — stay out. No dossier across nine comparators and the real-world M&A survey found a compelling reason to add shared ownership of a single production between two studios; the Owner has already marked it not-selected, and nothing here reopens that (02-authority-corporate.md, HIGH/CONFIRMED — co-production sits under "Other deferred candidates" in every version of the roadmap examined).

---

## Paper scenarios A–F

All figures are PAPER HYPOTHESES illustrating the rules above, not tuned constants.

### A — Bankrupt small studio (weak cash, modest properties, several employees, no valuable technology)

Assume: cash −$50,000; abstract tangible capacity original cost $2,000,000 (recoverable credit at 0.5× = $1,000,000); 3 small Story Properties appraised at $50,000 each ($150,000 total); 6 employees with combined remaining guarantees of $900,000; no technology of note.

- **Liquidation Value (asset basis):** $1,000,000 (tangible) + $150,000 (properties) − $50,000 (overdraft) = **$1,100,000**.
- **Buy Individual Lots (§13):** a buyer pays roughly $1,100,000 in total across the separate lots, assumes zero obligations, and the six employees are released to the open talent pool by the estate (not carried by the buyer).
- **Buy the Whole Studio (assumption purchase, §6.Q2):** buyer pays a lower cash amount up front (say $250,000) but assumes the $900,000 of employment guarantees; nominal total consideration ($1,150,000) is close to the asset-lot total, but the buyer keeps the roster instead of releasing it to competitors.

**What this demonstrates:** the two-button model from §13 gives a legible trade-off — cheap-now-plus-obligations vs. pay-in-full-and-walk-away-clean — without any bidding mechanism.

### B — Valuable distressed studio (heavy negative cash, valuable library, excellent research, several active productions)

Assume: cash −$5,000,000; recoverable tangible $1,500,000; locked scheduled receipts $500,000; contract guarantees $2,000,000; library appraised strategic value $8,000,000 (5 properties, 40 films); buyer-relative avoided-research value from the target's completed Technology III $2,000,000; two active productions carrying $3,000,000 of sunk, recoverable-in-place committed cost.

- **Book Net Worth** = −5,000,000 + 1,500,000 + 500,000 − 2,000,000 = **−$5,000,000**.
- **Studio Valuation (asset basis, since going-concern is near zero for a distressed target)** = max(0, BNW-style asset floor) + strategic add-ons = $2,000,000 (tangible+receipts) + $8,000,000 (library) + $2,000,000 (buyer-relative tech) ≈ **$12,000,000** buyer-specific ceiling, though a generic (non-tech-seeking) bidder's SV would be closer to **$10,000,000**.
- **Auction/Liquidation reserve** = tangible + receipts only = **$2,000,000**, rising with competing bids toward, but rationally never exceeding, the second-highest bidder's private value — clearing, say, at **$6,500,000** in this example.

**What this demonstrates:** BNW (−$5,000,000), Studio Valuation (~$10–12,000,000), and Auction Price (~$6,500,000) are three genuinely different numbers computed from the same facts, exactly per §14's discipline — none of them is a garbled average of the others.

### C — Healthy rival (profitable, strong brand, valuable properties, does not want to sell)

Assume: Studio Valuation $9,700,000; public stance "Would Listen"; premium band 1.4×–1.8× ⇒ asking range **$13,580,000–$17,460,000**. A buyer's own rational parts-value ceiling for absorbing this target as a one-lot addition (its recoverable tangible plus its properties at buyer-relative, non-duplicated worth) computes to roughly **$6,864,000**.

**What this demonstrates:** the buyer's rational ceiling ($6.86M) sits well below even the low end of the seller's asking range ($13.58M). This is not a bug; it is §17's Rule 3 working exactly as intended — a strong, well-run target is *structurally* hard to acquire at a price that makes sense for the buyer, without any artificial cap. The Owner's brief calls this "control premium"; this ruleset's independence-premium naming makes clear it is the cost of the seller's reluctance, not the buyer's synergy.

### D — Technology target (player buys mainly for research it lacks)

Assume: buyer lacks Technology III; target has it, completed; avoided-research value estimated at $2,000,000; whole-studio purchase price $3,000,000; the physical Tier-III facility body still costs $800,000 capex to build after closing, taking N weeks.

- **Acquisition path total effective cost:** $3,000,000 (purchase) + $800,000 (mandatory build) = **$3,800,000**, available as soon as the build finishes.
- **Organic path total effective cost:** ~$2,000,000 (hypothetical R&D) + $800,000 (build) = **$2,800,000**, but only after however many weeks the research itself would have taken.

**What this demonstrates:** the acquisition path is not "free capability" — it costs *more* in cash than researching it yourself, and it still requires the same physical build afterward. What it buys is **time**, not magic. This is the exact reading of "knowledge transfers, installations do not" the Owner's §2.F direction requires, verified with arithmetic rather than asserted.

### E — Serial acquirer (three studios in ten years)

Walking through three sequential deals against a starting field of nine rivals: after deal #1, active rivals fall from 9 to 8; after deal #2, to 7; each deal also drains the buyer's own affordability buffer (§17 Rule 2) and adds one more retained label or absorbed roster to triage (§8, §11's holdback bookkeeping). By deal #3 (rivals at 6, still comfortably above the floor of 3), the acquirer is carrying three sets of inherited obligations, three holdback timers on inherited assets, and a shrinking pool of remaining targets whose premiums have not fallen — nothing in the rules makes later deals *cheaper*. The concrete exploit this scenario surfaces without a holdback rule: absent §11 Rule 3, the buyer could immediately re-sell a freshly acquired library at its full appraised value for instant profit; **with** the rule, that value is only reachable after the holdback period, closing the loop. If the Owner ever wants a fourth or fifth acquisition to be *harder in principle*, not just *scarcer in targets*, that would be a new decision (a "serial-acquirer wariness" ask-price escalation) explicitly flagged as **not recommended initially** by this ruleset — it adds a second hidden multiplier exactly where §12 tries to keep one visible number (09-valuation-finance.md, "Open questions").

### F — Rival acquires rival (symmetry and history preservation)

Rival A (stance: Open to Offers, distressed) is bought by Rival B under the identical §12/§13 rules a player purchase would use — same affordability check, same premium band, same active-rival-floor predicate. Mechanically this is *cheaper* to build than a player-directed purchase, because both sides already share identical `Production`/`ScriptDevelopment` array shapes and rival facilities never bind to a placement ledger (16-gap-rival-ai-acquisition-code-feasibility.md, HIGH/NEW). Rival A's `StudioId` remains in the fixed registry forever; its films still credit Rival A as creator; a `CorporateEvent{kind:'acquired', successorStudioId: B, brandRetained: true|false}` marks the transaction publicly, exactly as §9 specifies for a player-directed deal. If Rival B is itself later absorbed by Rival C, the chain (A→B→C) stays a dated, walkable sequence of successor pointers — never a rewrite of A's or B's original identity.

**What this demonstrates:** "symmetric transaction law" is not an aspiration bolted on afterward; it falls out of using the same rules and the same append-only history model regardless of which side of the transaction is a player.

---

## 19. Corrections to prior Project: Studio assumptions

- **CORRECTED.** "Movies 24%" in the original Studio Rating is not a form of library value — it explicitly *decays* ("a town with a staggeringly short memory"). Any prior prose treating original-game "reputation" as an ancestor of P16 library value should be corrected (01-original-game.md, HIGH/CORRECTED).
- **CORRECTED.** No document in the accepted or approved corpus contains the word "auction" or "liquidation" in any operative sense; P15's closure-settlement leaves no transferable estate as written. Any prior prose assuming a bankruptcy auction already has a home in P15 needs the §13 correction stated above (02-authority-corporate.md, HIGH/CORRECTED).
- **QUALIFIED / PROVENANCE-ONLY.** Model D, the P16A/B/C split, and the BNW/valuation/premium framing are each independently well-corroborated by this research program, but none of the three is stated in any prior Future Ops control document as a settled recommendation — their authority is the assignment text itself, now corroborated (14-gap-future-ops-control-board-verification.md, HIGH/CONFIRMED for §2.N and §2.E; HIGH/QUALIFIED for §2.T). Future documentation should describe them as assignment-originated and independently validated, not as already-approved prior law.
- **CORRECTED.** `ContractId` embeds the employer `StudioId` and `scriptProjectId` is bound to array position in the *owner's* array — neither is the owner-neutral stable identifier some prior roadmap prose (§9) implied. Contract/script transfer must be modeled as "end old row, mint new row," never as an in-place field mutation (04-code-audit.md, HIGH/CORRECTED).
- **DROPPED, per Gap 8.** The premise that some Total Extreme Wrestling title lets a buyer acquire a rival's "tape library" and retain its brand as a pure, zero-operations label does not exist in either TEW 2020 or TEW IX after an exhaustive search of the official developer's journal; TEW's actual acquisition mechanic (parent/child companies that keep operating) is closer to Model B, the model this ruleset rejects. This premise should not appear in the final report as comparator evidence (18-gap-tew-ix-tape-library-brand-label-verification.md, HIGH/NEW).
- **UNVERIFIED, do not cite.** The widely-repeated claim that Mad Games Tycoon 2 transfers a target's debt to the buyer traces to a 2021 pre-release suggestion-thread post, not shipped behavior; two independent research passes on official sources found no cash/debt handling described at all (17-gap-mgt2-acquisition-cash-debt-transfer-verification.md, HIGH/QUALIFIED). Continue citing GearCity and OpenTTD instead for the cash/debt-transfer design question.
- **CORRECTED (naming).** "Control premium" as used in the assignment's §2.N/§2.O is, in this game's structure, better understood as an **independence premium** (the cost of a target's reluctance to sell), not Damodaran's buyer-side "value of control" (which is typically small for a well-run target) — see §12 (09-valuation-finance.md, HIGH/QUALIFIED).

---

## 20. Genuine remaining Owner decisions ONLY

These are decisions the research program surfaced as still open — not settled §2 items, and not re-litigations of them.

1. **Does the Owner authorize a P15B rival-closure/dormancy-to-closed lifecycle at all?** Without it, "Closed" (§9) has nowhere to attach, and the bankruptcy-estate gate in §13 has no trigger. This is the single largest prerequisite this ruleset depends on and does not assume (11-gap..., HIGH/CONFIRMED as an open item).
2. **Is the player's own studio ever an acquisition target — a "player-sale" ending?** This ruleset explicitly does not build that; every comparator that shipped a symmetric hostile-takeover-of-the-human found it deeply unpopular, but a *voluntary* player-initiated sale is a separate, unresolved question (02-authority-corporate.md; 07-comparators-C.md).
3. **What exact target facts become visible to a bidder before an offer (the "due diligence" disclosure)?** §12 needs a small, explicit list (Studio Valuation and stance, at minimum); the Owner should confirm whether anything more (e.g., active-production count without detail) is disclosed pre-offer, given rival cash/terms are hidden by default today (02-authority-corporate.md, HIGH/QUALIFIED).
4. **Does an in-flight-research successor exception ever get added to P13-OD-06?** This ruleset follows the existing rule (in-flight work never transfers) rather than asking the Owner to reopen it, but the Owner may want a one-time exception at acquisition specifically (03-authority-domains.md, open question).
5. **Does the inventor's price advantage (InventionProvenance's entitlement) pass to an acquirer, or stay with the original inventor forever even after their studio is absorbed?** P13 already names this as an explicitly undecided "later case" (03-authority-domains.md, HIGH/CONFIRMED); this ruleset does not resolve it.
6. **Numeric tuning:** the independence-premium bands (§12), holdback length (§11), cooldown length (§12/§17), and the 26-week affordability buffer (§17) are all paper hypotheses in this document and need an Owner/tuning pass once a package is chartered.
7. **Is a P11 debt instrument ever introduced?** Currently Owner-blocked (P11-REQ-041); if it is ever authorized, it slots into the "obligations" row already reserved for it (§6.Q2, §14) with no new P16 machinery — but the Owner has not been asked whether this ruleset's cash-only design is acceptable as the *permanent* answer, or only the answer "until P11 changes."

---

## 21. Remaining uncertainties

Lower-stakes research gaps that do not block a design decision but should not be silently treated as settled:

- Exactly how a migration should treat existing (pre-P16) films' Story Property ownership — is "creator owns as of the migration week" a permissible baseline, or does every property start "not recorded" until a P16 event? Approved law permits the former only where the fact is *certain* (P12 §17's "derivable, not backfilled" reasoning), and this ruleset assumes the certain case applies to the player's own single-owner history but flags multi-owner rival back-catalogues as less clear (02-authority-corporate.md, open question).
- GearCity's shareholder-vote-to-willingness formula and its acquisition-cooldown-by-size scaling are documented only in prose, not published as exact numbers — useful as a shape reference for §12/§17, not as a numeric source (05-comparators-A.md, open question).
- Hollywood Animal's exact sequel-evaluation inputs remain LOW confidence (site partially blocked); not cited as design authority anywhere above.
- Whether a rival's authored back-catalogue (present at world start, per R05 §2 incumbents) carries Story Property ownership from that authored manifest, or is minted fresh at first P16 transaction — an open interpretation question noted but not resolved by this research (02-authority-corporate.md, open question).
- The exact disclosure boundary for rival financial facts during due diligence (Owner decision #3 above) has design-adjacent sub-questions (does "Open to Offers" show more than "Not for Sale"?) not worked out here.
- Whether unproduced Story Properties should count, even a little, in Studio Valuation (§14) so that hoarding scripts is not entirely free — flagged as a design question in the underlying rights dossier, not resolved here (10-rights-law.md, open question).

---

## RULE LIST (R01–R36)

**Property & rights**

- **R01.** A released Film and its underlying StoryProperty are separate identities; the StoryProperty is minted once, at greenlight, and is never inferred or bulk-created from an existing film's resemblance. *(P16A)*
- **R02.** The minimal rights bundle is exactly two ownable things — StoryProperty and Film — plus one generic Licence instrument (`facet`, `exclusive`, `termWeeks`, `consideration`, optional reversion week). No territory or media sub-splits exist before P18. *(P16A)*
- **R03.** Owning a StoryProperty includes its continuation authority (sequel/remake/spinoff) by default; that authority may be licensed to another studio without selling the property. *(P16A)*
- **R04.** Studio-original material is owned by its creating studio at mint; externally sourced material must be purchased or optioned before use; origin is permanent and recorded per exact ID, never inferred in bulk. *(P16A)*
- **R05.** Ownership transfer never rewrites a StoryProperty's or Film's creator or history; only a separate, dated "current holder" relation changes on transfer. *(P16A)*
- **R06.** Cross-media licensing grants (facet `crossMedia`) are forbidden until a P18 consumer exists to exercise them. *(P16A, consumed by P18)*

**Library value & asset sales**

- **R07.** Library and StoryProperty value are a displayed, historical/strategic valuation line only; they produce zero weekly cash until a P18 distribution system exists to own that cash flow. *(P16A)*
- **R08.** Every sellable asset shows one deterministic "Estimated Value" before any sale is offered — no hidden multiplier. *(P16B)*
- **R09.** An unproduced (never-filmed) StoryProperty may be sold instantly to "the open market" for a disclosed price, reusing the original Star & Script Selling Facility idiom; released Films, whole libraries, and brands always require a named counterparty. *(P16B)*
- **R10.** A newly acquired or licensed asset's full appraised value is reachable only after a fixed holdback period with the new holder, rising from a lower fraction before that, reusing the original game's eight-year Star-tenure vesting shape. *(P16B)*
- **R11.** An asset in active use by a production cannot be sold unless the production transfers with it or the seller retains a licence covering that production's remaining life. *(P16B)*
- **R12.** A retained brand/label may be sold on its own for cash, with zero operational transfer — selling a label never creates a second managed studio for the buyer. *(P16B)*
- **R13.** Every asset-sale price floor sits strictly below the asset's own build/acquisition cost basis, closing any buy-low-sell-high loop that relies purely on ownership churn. *(P16B)*

**Operating model & corporate history**

- **R14.** At closing on a whole-company acquisition, the buyer makes exactly one permanent choice — Absorb Completely or Absorb Operations & Retain Brand as Label — and no autonomous, separately managed subsidiary is ever offered. *(P16C)*
- **R15.** A retained label is a zero-operations relation on the buyer's own studio (name, mark, founding date, acquisition event); it never gets its own roster, ledger, lot, or ticking business. *(P16C)*
- **R16.** Every StudioId is permanent: never reused, renamed away, or deleted. Closure, acquisition, and absorption are dated events appended to it, never a rewrite of it. *(P12, referenced by P16C)*
- **R17.** Corporate status is one event record with one boolean, not three separate mechanisms: `{kind: closed|acquired, successorStudioId?, brandRetained}` — "acquired, brand kept" and "absorbed, brand dropped" differ only in that one field. *(P16C)*
- **R18.** Every past film, employee credit, and award stays attributed to the studio that actually made it, forever, regardless of current property or studio ownership. *(P12/P16A)*

**Transfer bundle**

- **R19.** Acquired cash becomes buyer cash at par (it may be negative); the transaction price is always quoted net of the cash the target carries. *(P16C, via P11 ledger)*
- **R20.** There is no debt instrument to transfer; "assumption purchase" means the buyer takes on the target's existing typed obligations (remaining contract guarantees, committed production cost), not a nonexistent loan. *(P16C, via P11)*
- **R21.** Employee contracts transfer intact under the buyer with identical terms and no re-charged signing bonus; the buyer may then release anyone under the same ordinary termination law every studio already uses. *(P16C, via P12/P14 employment law)*
- **R22.** Active productions transfer and continue under the buyer, who may finish or cancel each at its ordinary cancellation cost; every production keeps its original ID and history, never duplicated. *(P16C)*
- **R23.** A target's abstract operations convert automatically, once, to a cash credit at the standard lossy liquidation rate at closing; nothing physical ever appears on the buyer's own lot. *(P16C, via P09 demolition law)*
- **R24.** Acquired research transfers as verified, completed knowledge only — the buyer gains eligibility to build what the target had already finished researching, and must still pay to build the physical facility itself. *(P16C, via P13)*
- **R25.** A target's in-progress (not-yet-completed) research does not transfer at acquisition. *(P16C, via P13)*

**Valuation ladder & healthy/distressed transactions**

- **R26.** Book Net Worth, Studio Valuation, and the actual Price paid or bid are always shown as three separate numbers, and no asset value is ever counted in more than one of them. *(P16A/B/C, via P11)*
- **R27.** Every healthy studio displays one public stance — Not for Sale / Would Listen / Open to Offers / In Distress — and that stance, not a hidden multiplier, gates whether an offer is even considered. *(P16C)*
- **R28.** A "Not for Sale" target refuses every offer at any price; every other stance has a shown price band; every refusal states a plain reason. *(P16C)*
- **R29.** A healthy target's asking price is its Studio Valuation times a published independence-premium band driven by its stance and recent performance — never an ad hoc multiple. *(P16C)*
- **R30.** A distressed studio's estate is sold through exactly two player-facing choices: buy the whole studio at its Liquidation Value reserve, or buy individual lots (properties, library, brand, equipment) at their own reserves — no live multi-round bidding. *(P16C, gated by a P15B pre-settlement estate window)*
- **R31.** Rival bids use the identical formula, eligibility checks, and cooldown as a player bid; there is no separate rule for an AI buyer. *(P16C)*

**Rival M&A & anti-snowball boundary**

- **R32.** No acquisition may complete if it would drop the number of independently operating rival studios below three; the transaction is refused with a stated reason. *(P16C, via P12 registry floor)*
- **R33.** No acquisition may complete unless the buyer would retain at least 26 weeks of cash against its own plus the target's combined ongoing obligations afterward. *(P16C, via P11)*
- **R34.** A rejected offer, and a completed acquisition, both start a cooldown before the same buyer may approach the same or a similarly sized target again. *(P16C)*
- **R35.** No partial ownership stakes are offered; every comparator that shipped one turned it into a passive-income exploit with no compensating decision value. *(P16B/C — deliberately absent)*
- **R36.** P16 owns exactly StoryProperty/Library/Rights identity (P16A), asset and rights transactions between active studios (P16B), and whole-studio acquisition/integration (P16C); P17 and P18 may only read P16's exact records and never mint or infer a right of their own; co-productions remain out of P16 entirely. *(P16A/B/C boundary law)*
