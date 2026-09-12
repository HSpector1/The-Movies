# P16 Corrected Decision Register (2026-09-12)

**Status:** INDEPENDENT RESEARCH — DOCUMENTATION ONLY · NOT OWNER ACCEPTANCE · FUTURE OPS REVIEW REQUIRED. Produced by [`P16-RECONCILIATION-02.md`](P16-RECONCILIATION-02.md); it replaces report §20 ("Genuine remaining Owner decisions ONLY") at `5239dc7a`, whose eight items are dispositioned below. Classes follow the P15 discipline: **A** surviving invariant (binds, nobody acts) · **B** Owner direction already given — recording it is a documentation task · **C** implementation / tuning recommendation (charter author, launch review, playtest) · **D** genuine unresolved product choice (Owner) · **E** optional later feature (nothing requires it; not presented as pending). **SELECTED / NOT YET IMPLEMENTED** = OWNER-SELECTED PRODUCT DIRECTION / NOT YET IMPLEMENTED / PRODUCER CONTRACT AND EXECUTION AUTHORIZATION REQUIRED.

## 1. Owner direction in force for P16 (class B — record, do not re-ask)

| ID | Direction | Source | P16 consequence |
|---|---|---|---|
| B-1 | **Full absorption** is the initial acquisition model: one operating studio; no autonomous subsidiary; no retained operating label; acquired `StudioId` and history permanent; dated acquisition / end-of-independent-operations event; assets, lawful IP/rights and verified research transfer according to the deal; knowledge transfers, buildings do not; a priority opportunity to retain talent, not ownership of people | Owner decision relayed 2026-09-12 | report §5, §6, §9; reconciliation §4 |
| B-2 | **Eventual ability to buy other studios**; package boundary and shape open; acquisition is successor design, never parity | P15 Direction I | P16 owns executable transactions; P15 owns failure/settlement and the disposal handoff (P15 RECONCILIATION-02 §1.3) |
| B-3 | **No artificial floor on the rival population; no replacement studios**; authored arrivals preserved; report a severe consolidation rather than floor it silently | P15 Direction G | R29 withdrawn; no replacement-entrant dependency (reconciliation §2) |
| B-4 | **Loans** (ordinary interest-bearing borrowing; loans only) | P15 Direction F | SELECTED / NOT YET IMPLEMENTED; P16 reads P11 loan facts when they exist (reconciliation §3.2) |
| B-5 | **Rivals and the player can genuinely fail** under one law; bounded rescue → failure → settlement → preserved history; talent to free agency, no lost people | P15 Directions D, E, H, J | SELECTED / NOT YET IMPLEMENTED; the H5 terminal state and the P15 handoff record are prerequisites, not decisions (reconciliation §3.3) |
| B-6 | **Early-termination charge** `weekly × min(remaining, 26)` | P14 amendment 2026-09-11 | the only exit charge in any P16 ledger (reconciliation §5) |
| B-7 | Assignment §2 selections: no multiple playable lots; a healthy studio may reject an offer; a major premium; library contributes to valuation, not invented cash; minimum necessary anti-snowball protection, no artificial caps; co-productions excluded from P16A–C | assignment brief §2 | unchanged |
| B-8 | P16 → P17 → P18 documentation-ownership allocation; P16 sole author of StoryProperty / rights / library truth | accepted contract §15 (`13370d42`) | recording it in the P16 charter is a documentation task (was report §20-8) |

## 2. Surviving invariants (class A)

Identity permanence (`StudioId`, `PersonId`, `FilmId`, `productionId`, `conceptId` never reminted); `FilmIdentity.studioId` = creator forever; no retroactive fiction; one law for player and rivals; Standing is per-business and never transfers; every consequence has a source; versioned additive roots; P10/P12/P14 ownership boundaries (`contractId` is P12-minted and employer-bound; `PersonId`/contract truth in P10/P14); P11 never invents a balance sheet.

## 3. Implementation recommendations (class C — charter / launch review / playtest; none is an Owner question)

| ID | Recommendation | Where |
|---|---|---|
| C-1 | Priority retention window in the closing tick (continuation on identical terms; fresh P14A offer; or nothing); default = continue up to capacity; lawful refusal per P14A/P14B; residual work binds a continued production's seated participants through release | reconciliation §4.2–§4.4; R19′, R33 |
| C-2 | Guarantees are never netted from a price; exits at the P14 charge, once, by whoever ends the contract; estate claims per P15 | reconciliation §5.2–§5.3; R18′ |
| C-3 | Four numbers distinct — book (P11, guarantees beside it), liquidation (refund basis), operating value (unfloored, display only), transaction price — with the seller's Ask on a reservation basis | reconciliation §5.1; R23 |
| C-4 | Loans priced once at face (principal + accrued interest), repaid or assumed under the same law; extinguished by P15 settlement on the estate path; Rescue loans never finance a purchase | reconciliation §3.2 |
| C-5 | Affordability: ~26 weeks of post-close reserve; P15 leverage caps when loans exist; no bidding in Warning or worse; size-scaled and per-target cooldowns; continued headcount ≤ usable capacity | R30′ |
| C-6 | Distressed paths entered only through the P15 disposal handoff record; clean lots at liquidation-basis reserve; whole-estate lot absorbs at closing; sealed one-shot comparison; unsold lots only until the estate archives (≤ 14 weeks) | R26′; reconciliation §3.3 |
| C-7 | No operating studio is acquired without consent; the player's studio reads `NotForSale` by construction in the initial slice; a failed player estate is disposed under the same law | R16′ |
| C-8 | Automatic liquidation of target facilities into a one-time credit at the refund fractions; nothing physical moves; land excluded until a land market exists | R21 (relabelled RECOMMENDATION) |
| C-9 | Rights of a studio whose estate has archived stay unowned history ("archived, not for sale"); no free claim | R05 default (was report §20-6) |
| C-10 | Transaction-disclosed due diligence: a costed, dated event disclosing the target's exact book figures and every contract's terms, charge and market ask, recorded as a receipt and counted as an approach for cooldown | R27; P15 RECONCILIATION-02 §3.5 (was report §20-5) |
| C-11 | Acquired knowledge transfers as a new adoption row citing provenance; installations do not; the inventor price-advantage entitlement is personal to the inventing `StudioId` and does not transfer unless P13 later rules otherwise | R22 (was report §20-3) |
| C-12 | Capacity-refused inherited productions cancel at the ordinary write-off; otherwise continue-or-cancel per project | R20 (relabelled RECOMMENDATION) |
| C-13 | Transaction order: sealed simultaneous offers resolved at window close with a deterministic tie-break; the player is an eligible bidder under the same law | P15 D11 handed to P16 → closed as C |
| C-14 | AI acquirer and AI seller policies (whether a rival bids; which contracts it continues) are P12 authoring; the first cross-business read is charter-authorized and symmetric (same due-diligence event as the player) | report §10, §21 |
| C-15 | StoryProperty mint point at Greenlight; four rights; one Licence instrument; single holder; 52-week holdback; sub-cost floor; minimum inter-transaction interval | R01–R09, R32 (unchanged) |
| C-16 | Numeric constants (premium bands, holdback, reserve weeks, reserve steps, tolerance in AI retention policy) | playtest |
| C-17 | Record in the P16C charter its dependencies: H5 terminal state; P15 handoff record and settlement order; P11 loan read models (if shipped); P14A proposal law; P12 "sale/assignment" reason value | planning |

## 4. Genuine unresolved product choices (class D)

**None blocking any P16 slice.** Every item the report at `5239dc7a` listed as an Owner decision is now B (recorded direction), C (recommendation with a default) or E (optional). If the Owner wishes to promote a class-C default to a decision, the two most consequential are C-1 (the retention default when the player takes no action) and C-9 (archived estates' rights stay unowned).

## 5. Optional later features (class E — not pending, not asked)

Retained brand as a zero-operations label (R10–R12); a player-initiated sale ending / inbound offers to the player; partial ownership or equity stakes; co-productions; a dominance guard; a claim mechanism for archived estates' rights; a second-bidder primitive for ordinary asset sales; a remote-lot system; investors, external financing, bailouts, acquisition financing beyond the P15 loan law.

## 6. Disposition of report §20 (at `5239dc7a`)

| §20 item | Was | Now |
|---|---|---|
| 1 Authorize a P15B terminal slice and estate window (yes/no; gate vs. catalogue) | Owner decision | B-5 SELECTED / NOT YET IMPLEMENTED; interface = P15 handoff record (C-6); the "catalogue" reading is bounded by the estate's ≤ 14-week life |
| 2 Whether a debt instrument is ever authorized | Owner decision | B-4 SELECTED / NOT YET IMPLEMENTED (loans only); not re-asked |
| 3 Inherited inventor entitlement | Owner decision | C-11 default; P13's to raise |
| 4 Where contract assumption is chartered (P12 vs. P14D) | Owner decision | planning: retention uses P14A's proposal law plus a P16 window (C-1); P14D not involved |
| 5 Due-diligence disclosure of private finance facts | Owner decision | C-10 |
| 6 Orphan-IP backlog | Owner decision | C-9 |
| 7 ≥3 floor vs. replacement entrants | Owner decision | withdrawn — B-3 |
| 8 Ratify P16→P17→P18 numbering | Owner decision | B-8 documentation task |
| (§17) talent cherry-picking | "live Owner decision" | resolved by B-1: the retention window is a choice of specific people (C-1) |
| (R16) voluntary player-sale ending | "not-yet-authorized Owner decision" | E |
