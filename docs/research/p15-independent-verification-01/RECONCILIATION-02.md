# P15 Independent Verification — Reconciliation 02 (Future Ops review disposition, 2026-09-12)

**Status:** DOCUMENTATION ONLY · NO PRODUCTION AUTHORIZATION · RESEARCH, NOT OWNER AUTHORITY · **NOT implementation-ready preparation.**
**What this is:** the one bounded reconciliation Future Ops requested after reviewing the report's executive findings, §15 and summary table. It answers the eight numbered sections of the disposition in order, cites the report section that already resolved a point where one does, and exposes the supporting calculation (all reproduced by [`calculations/reproduce.py`](calculations/reproduce.py) → [`calculations/OUTPUT.md`](calculations/OUTPUT.md), sections 8–13 added for this pass).
**What it is not:** not a new research campaign, not a charter, not an amendment of any approved ruling, not an instruction to the P13/P14/P16/P17 workers. Where the report is corrected, the correction is bounded and the original text is preserved in the package (`evidence/`, `analysis/`, `verification/` are untouched).
**Companion:** [`P15-INDEPENDENT-VERIFICATION-REPORT.md`](P15-INDEPENDENT-VERIFICATION-REPORT.md) (the full report; its bounded edits for this pass are listed in §8 below) · [`INDEX.md`](INDEX.md).

**Labels used here (same discipline as the report's reading guide):**
`[OWNER DIRECTION]` the 2026-09-11 direction A–K as relayed · `[P16 DECISION]` the Owner's subsequent full-absorption decision as relayed by Future Ops on 2026-09-12 · `[FUTURE OPS DISPOSITION]` a process disposition in the 2026-09-12 review (not Owner product direction) · `[CODE]` accepted TypeScript at `592e926`, `file:line` · `[RECOMMENDATION]` researcher proposal · `[PROVISIONAL]` illustrative number · `[OPTIONAL PROPOSAL]` a new feature idea that nothing requires.

---

## 1. Reconciliation against the latest Owner direction

### 1.1 What is preserved unchanged `[OWNER DIRECTION]`

Genre plus release-window competition (report §3); quarterly, transparent Power Ranking (§4); meaningful financial-strength / net-worth information (§4); genuine player and rival failure with recovery opportunities (§5, §6); interest-bearing loans (§7); no artificial replacement studios and no minimum rival population (§10); preserved authored future rival arrivals (`RIVAL_ARRIVAL_WEEKS`, `calendar.ts:3` `[CODE]`, §10); talent entering free agency on permanent closure (§8); a prominent industry-wide bankruptcy notice (§5, finding 17); ceremony plus evidence-linked Legacy dossier (§11.1–11.2); frozen official 1920–2040 Legacy and a subsequent Endless Sandbox (§11.3). Nothing in this reconciliation moves any of these.

### 1.2 The P16 decision and what it supersedes in the report `[P16 DECISION]`

The Owner's subsequent P16 decision, as relayed: **full absorption** — one operating studio to manage; no autonomous acquired subsidiary; no retained operating production label; acquired `StudioId` and history preserved permanently; a dated acquisition / end-of-independent-operations event; transferable assets, lawful IP/rights and verified research included according to the deal; knowledge transfers but physical buildings/upgrades do not teleport; a priority opportunity to retain talent, not ownership of people.

Consequences for the report, applied in this pass:

| Report text | Disposition |
|---|---|
| "Autonomous label" / "subsidiary or label continuation" as part of a first disposal slice (finding 15, §9.1 shape 5, §9.3 greenlight-policy bullet, §9.4, §13 row 7, old §15 D12, summary-table M&A row) | **Superseded for initial acquisitions.** Labels are no longer presented as an unresolved Owner choice anywhere in the package; the material stands only as archived analysis of an `[OPTIONAL PROPOSAL]` that the Owner has not selected. |
| "P15D — Bankruptcy Settlement & Studio Disposal" as a package that would *execute* purchases (finding 15, §9.4, §13 row 7) | **Withdrawn as a package recommendation.** Ownership is re-stated in §1.3 below: P15 owns failure/settlement eligibility and the disposal handoff; P16 owns executable ownership/acquisition transactions. The name "P15D" is retained only as the label of that earlier recommendation so the phase-2 lane files remain traceable; no package is renumbered or presented as approved. |
| §9.1 shapes 1–6 and §9.2 scenarios A–C | Retained as **analysis** of price mechanics that P16's researcher may reuse or discard; the Frozen Reference Price (FRP) is retained as a **settlement fact** P15 can compute (§1.3). |
| §9.3 bidding order, cooldown, dominance guard, "what transfers" | Retained as analysis; these are P16 transaction questions (see §2.3 rows D11, D13). |

### 1.3 Ownership boundary `[RECOMMENDATION]`

| P15 owns (failure / settlement eligibility and the disposal handoff) | P16 owns (executable ownership / acquisition transactions) |
|---|---|
| The shared distress ladder, clocks, remedies, Insolvency window, terminal event (report §5–6) | Offers, bidding, order rule, tie-break, closing |
| The settlement week: contract endings, wage priority, recorded unpaid claims, conserved-work disposition, free-agency release (§8; §5 below) | The ownership edge on a versioned root; the dated acquisition / end-of-independent-operations event |
| The **disposal handoff record**: a settlement fact stating what the estate holds (assets at recorded value, cash, conserved work in flight, outstanding claims), the FRP as a frozen reference, and the bounded window during which a transaction may close before release (§5.5 below) | Absorption mechanics: what transfers according to the deal (assets, lawful IP/rights, verified research), knowledge transfer without teleporting buildings, permanent preservation of the acquired `StudioId` and history |
| Eligibility facts a transaction may read: public stage, band, whether a studio is in its Insolvency window, whether it has closed | The priority opportunity to retain talent (exercised only before release — §5.6 below), due-diligence disclosure for a specific transaction (§3.5 below) |
| Notices: bankruptcy notice (INFO, pinned), window clocks | Transaction notices and deadlines (DECISION-tier) |

P15 never executes a purchase; P16 never decides that a studio has failed.

### 1.4 The bounded estate `[RECOMMENDATION]`

A **bounded estate** is the closed studio's residual state between the terminal event and archive. It is **not** an autonomous subsidiary and cannot become one:

- it **originates nothing** — no new screenplays, greenlights, marketing, signings, or hires (`staff()`/`decide()` in `advanceHollywoodWeek` must be gated off for a closed studio, `hollywoodTick.ts:222` `[CODE]`; the report's §5.4 already names this seam);
- it **completes only work that was already funded** and only if it can carry the residual cost (the support test in §5.4 below);
- it **ends by construction**: the longest conserved item is a production at tick 1/8 followed by a 6-week run — `PRODUCTION_TICKS 8` + `THEATRICAL_WEEKS 6` `[CODE]` — so an estate lives at most 14 weeks after the terminal event and then archives;
- its receipts go to the estate (claims), never to a going concern; its results are recorded to the closed `StudioId`'s history; it has no Standing consequences (it left the live cohort at closure) and no rank row after closure.

---

## 2. Authority and decision classification

### 2.1 Reconciling executive findings 1 and 4

Finding 1 says the prior research's "binding design laws … all survive"; finding 4 lists written rulings the Owner's direction now contradicts. Both are correct because they speak about different kinds of text, and the report is amended (finding 1) to say so:

- **Design laws** are invariants about *how* any mechanic must behave: one market, one law; sources for every consequence; Standing is not rank; no identity death; no retroactive fiction; no hidden subsidy; conserved endowments; versioned additive roots. None conflicts with any Owner direction and all survive (class **A** below).
- **Restrictions** are scope prohibitions about *whether* a mechanic exists: no player loans, no player bankruptcy, acquisitions parked, minimum three rivals, Endless undecided. Those are what the Owner's direction supersedes (class **B**).

### 2.2 The five classes

| Class | Meaning | Who acts | Examples |
|---|---|---|---|
| **A. Surviving invariants** | design laws already in accepted documents that every new mechanic must obey; also directions the Owner has already given in "law" form | nobody — they bind | one law for player and rival (Owner: "under the same law"); identity permanence; no retroactive fiction; the player can fail post-2040 because the same law simply continues |
| **B. Old restrictions explicitly superseded by the Owner** | written prohibitions or "undecided" markers the direction overrides | whoever records the ruling — a **documentation task**, not a request for re-approval | Horizon §3 player no-loans/no-bankruptcy; REQ-041 (loans); REQ-042; P15 §16/§17/§23 rows; roadmap §19.3/§21 rows; rulings §4.3 Endless "undecided"; the "minimum three rivals" floor |
| **C. Implementation / tuning recommendations** | how to build within the direction; constants; archive mechanics; event ordering; presentation details | charter authors and playtest | window taper, stage windows, loan caps, band thresholds, C→B terminal structure, competition ties, frozen-marker mechanism, bounded event order |
| **D. Genuine unresolved product choices** | choices the direction does not settle and that materially change what the player experiences | Owner | see §9 — four items, one of them P16's |
| **E. Optional later features** | ideas nothing requires; not prerequisites; not to be presented as pending decisions | nobody until someone proposes a charter | distress interest on negative cash; voluntary bankruptcy; post-bankruptcy new-company play; named dormant state; label continuation; severance weeks; rival capacity growth; late-entrant pack; dominance guard |

### 2.3 Disposition of all 22 original "Owner decisions" (Desktop report §15, IDs D1–D22; published §15 numbers in the second column)

| ID | Published §15 # | Topic | Class | Disposition | Now lives at |
|---|---|---|---|---|---|
| D1 | 1 | Shared-market tuning envelope (4-week window; taper; reach-scaled contribution / OQ2; saturation stock) | **C** | "≈ 4 weeks" is Owner direction (A); taper, stock and reach scaling are tuning. OQ2 was already the accepted package's own P15A.1 "exact first formula" decision (P15 §23 "market formula" row) — not a new one. | §7 below; report §3 |
| D2 | 2 | Where financial strength appears beside the creative rank (Model D vs an alternative) | **D** | Genuine: the direction says "somewhere meaningful" and no more. Model D remains a recommendation; a compact alternative (Model E) is given in §3.4. | §3.4; §9 |
| D3 | 3 | Public disclosure of rival financial condition | **D** (narrowed) | Genuine for the **public** tier only (band / stage / public proxy). Transaction-specific disclosure is P16's and "never dollars" is **not** a permanent restriction on it (§3.5). | §3.5; §9 |
| D4 | 4 | Power Ranking honors lane before Awards exist; tie rule; whether a sum is published | **D / C / C** | Honors-lane source is genuine (an interim Standing source bends law 3); tie rule = implementation (match the shipped competition rule); sum = implementation (no sum while any lane is NOT RECORDED, §3.6). | §3.6; §9 |
| D5 | 5 | Player terminal structure (A/B/C/D) | **C** | C→B is the implementation of Directions E ("can ultimately fail after warning and recovery") and J ("every failure is acknowledged evidence"); described plainly in §5.1. Not a re-approval request. | §5.1; report §6.5 |
| D6 | tuning list | Stage constants | **C** | Tuning, checked against the sensitivity band of §6.1. | report §15 tuning list |
| D7 | 8 | Loan product set and rate basis | **C + E** | Studio Loan + Rescue implement Direction F (C). **Interest on sustained negative cash is a new overdraft/penalty proposal — class E, not authorized, separated in §4.1.** Era base rate vs fixed real rate = tuning (C). | §4.1; report §7.2 |
| D8 | 7 | Do rivals borrow? | **A + C** | The *law* is shared and already directed ("under the same law"): rivals **may** borrow under identical terms (A). Whether and when a rival *chooses* to borrow is P12 policy authoring (C), a strategic-willingness parameter, not an Owner decision. | §4.5 |
| D9 | 9 | Dormancy as a named public state | **E** | The suspend-new-commitments posture already exists (the reserve gate `[CODE]`); a *named* public state with return is optional. | — |
| D10 | 10 | Severance / guarantee write-down on closure | **C + E** | The write-down is a **proposed special rule** stated explicitly in §5.3 (claim recorded, unpaid never shown as paid) — C. A severance-weeks abstraction is optional — E. | §5.3 |
| D11 | 13 | Auction bidder order; player eligibility | **D — P16's** | Genuine, but a transaction question owned by P16; listed for traceability only and not decided here. | §9 (deferred to P16) |
| D12 | 15 | Package placement of labels | **B → E** | Superseded by the P16 full-absorption decision; label continuation is at most an optional later feature and is **not** presented as an open Owner choice. | §1.2 |
| D13 | 14 | Dominance guard | **E** | Optional acquisition-eligibility rule for P16; recommended against as a general mechanic. No floor, no ceiling is required. | — |
| D14 | 16 | Consolidation safeguards | **C + E** | New-game disclosure "this industry may consolidate" = C (zero mechanic cost). Rival post-entry capacity growth = **E, new upstream P12 work, not authorized, not a P15A prerequisite** (§6.3 compares with and without). Late-entrant pack = E. | §6.3 |
| D15 | 17 | Post-2040 rules | **A + C** | "Player can still fail post-2040" follows from A (same law continues; §7.4). Ceremonies/ranking continuing, a separate Endless record set, and era policy pending P13's contract are C. | §7.4 |
| D16 | dependencies | Frozen-archive mechanism; "continue" after terminal bankruptcy | **C + E** | Engine-level in-checkpoint marker = C (archive mechanics). New post-bankruptcy play modes = E (§5.2). | §5.2; §7.4 |
| D17 | dependencies | Phase-order catalogue | **C** `[FUTURE OPS DISPOSITION]` | Prepare only the event-order specification the selected slice needs and its critical boundaries (§7.3); the repository-wide catalogue campaign is not a prerequisite merely because roadmap §11.0 named one. | §7.3 |
| D18 | 18 | Ratify pre-terminal symmetry | **A** | Already in the Owner direction ("under the same law"); recording it is documentation. | supersession table row 9 |
| D19 | 6 | Net worth as a failure trigger | **C** | Design rule: never alone; negative cash alone never terminal (§4.4). | §4.4 |
| D20 | 12 | "Engineered" rival failure | **C** | Deliberately timing a legitimate release against a rival is competitive play. The non-competitive vectors (fake announcements, free spam, asymmetric rules) are already closed by law (§6.4). Not an Owner decision. | §6.4 |
| D21 | 11 | Voluntary bankruptcy declaration | **E** | New optional proposal, not a prerequisite; if ever added it must not discharge guarantees more cheaply than the 50 % buyout. | — |
| D22 | dependencies | Recording the direction | **B** (documentation) | A documentation task for whoever records the ruling; the package-local supersession table (§2.4) is the input. Not a request for the Owner to approve the direction again. | §2.4 |

Published-§15 rows not in the Desktop list: none — the published version had already merged D6/D16/D17/D22 into its tuning/dependency lists; they are re-listed above under their original IDs.

### 2.4 Package-local supersession table (for later integration — nothing is amended here; shared central rulings are not touched concurrently with the P14 planner)

Locators are `path @ commit, section, line(s)`. Lines for the Horizon, P11A, D-16 and D-17B documents are at the documentation parent `13370d42`; P15 package lines at `2a7ff0d9`; rulings/roadmap at `137ab603`; P12A register at `592e926`.

| # | Old locator | Old text (abridged) | Controlling direction | Effect |
|---|---|---|---|---|
| 1 | `docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md` @13370d42 §3 ll. 56–65 | "The prior prohibition (no financing, loans, bailouts, restructuring, hard bankruptcy, failure ladder or arbitrary cash sink) remains in force for the player's studio and is unchanged." | Directions E (player can fail after warning/recovery) and F (interest-bearing loans) | Superseded **in part**: loans, failure ladder and hard bankruptcy for the player. **Bailouts and arbitrary cash sinks remain excluded** — not in the direction. §3's rival sentence already permitted rival failure. |
| 2 | `docs/engineering/P11A-DECISION-AND-REQUIREMENT-REGISTER.md` @13370d42 l. 140, `P11-REQ-041` | "Loans/investors/external financing require separate Owner gate — OWNER-BLOCKED" | Direction F | The gate has been exercised for **loans only**; investors and external financing remain blocked. |
| 3 | same, l. 141, `P11-REQ-042` | "Bankruptcy/failure or structured recovery requires separate Owner gate — OWNER-BLOCKED" | Directions D, E | The gate has been exercised for player and rival failure with recovery first. |
| 4 | `docs/D-16-OWNER-RULINGS.md` @13370d42 l. 52, R10 | "KEEP THE STUDIO, LOSE CONTROL … No D-17 implementation of loans, credit lines, co-financing, … hard bankruptcy, or a forced restructuring ladder." | Directions E, F | The D-17 scope exclusion is historical (D-17 closed). The **standing philosophy** is superseded in part (loans, hard bankruptcy, a failure ladder — each with recovery first); credit lines, co-financing, investors, bailouts and passive/library revenue remain unauthorized. |
| 5 | `docs/D-17B-OWNER-AUTHORIZATION.md` @13370d42 §4 ll. 37–42 | NOT AUTHORIZED list: loans; … hard bankruptcy; soft-failure ladder; forced restructuring; acquisition; rival studios; … | (charter-scoped) | **Survives as written** — it bounds a closed charter. No forward effect; the direction's items need their own charters. Listed so nobody reads it as a standing prohibition. |
| 6 | `docs/design/CODEX-P13-P15-OWNER-RULINGS.md` @137ab603 §4.2 ll. 132–136 | "Corporate Hollywood does not authorize acquisitions, mergers, ownership stakes, subsidiaries … remain P16+" | Direction I + P16 decision | Superseded **in permanence only**; the substance survives: P15's title authorizes nothing, transactions are P16's, and **subsidiaries are not selected** (full absorption). |
| 7 | same §4.3 ll. 138–144 | "OWNER DECISION OPEN: … player/rival closure asymmetry; … post-2040 mode. Post-2040 Endless Mode remains undecided. P15 may not silently create or authorize it." | Directions E (both can fail, same law) and K (Endless Sandbox) | Both decisions are now made; recording them closes the rows. "P15 may not silently authorize" is honoured — the authorization is explicit Owner direction. |
| 8 | same §5 ll. 147–165 | P16+ parking lot: "acquisitions, mergers, subsidiaries, ownership stakes, valuation, library/IP transfer …" | Direction C (net worth/value displayed) + I + P16 decision | **Valuation display** leaves the parking lot (P11 read models, P15A.2 presentation); acquisitions stay P16 (consistent); subsidiaries stay parked (not selected). |
| 9 | `docs/design/CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md` @2a7ff0d9 §16 l. 619 | "Loans, bailouts, investors, forced sales, or acquisition are not implied." | Directions F, I | Superseded for **loans** and **acquisition**; bailouts, investors and forced sales stand exactly as written. |
| 10 | same §17 ll. 652–654 | "the player has no mandatory hard-bankruptcy game-over … call this terminal law asymmetric" | Direction E | Superseded: terminal law is symmetric with recovery first; the pre-terminal symmetry text (same predicates, same remedy families) is confirmed, not changed (D18). |
| 11 | same §23 l. 800 (and the "rival closure" row's "entrant floor") | "deterministic bounded eligibility with P12's minimum three active AI rivals" | Direction G | Superseded: no floor, no replacements; authored arrivals preserved unchanged. |
| 12 | same §23 "acquisition" row | "defer to P16+ Studio Empire & Ownership Transactions" | Direction I + P16 decision | Destination consistent (P16); permanence superseded. |
| 13 | same §23 "player closure / bankruptcy asymmetry" row | "retain P12's no-mandatory-hard-bankruptcy law" | Direction E | Superseded. |
| 14 | same §23 "Power Ranking definition" row | "three 0–10 lanes … unweighted 0–30 sum, dense ties … excludes Standing, cash/valuation" | Direction B ("financial strength somewhere meaningful") | Superseded **in part**: finance is presented beside (or, under Model E, as its own rank) — never inside the creative lanes; sum/ties are tuning. |
| 15 | same §23 "Endless Mode" row | "Owner chooses after finale prototype; no default" | Direction K | Superseded: Endless Sandbox selected. |
| 16 | `docs/design/CODEX-P13-P15-LONG-RANGE-ROADMAP.md` @137ab603 §19.3 ll. 671–687 rows Acquisition / Rival closure / Player closure / Later entrants–active-rival floor / Endless Mode | as in rows 11–15 | Directions E, G, I, K | Superseded as in rows 11–15; the "active-rival-floor proof" clause of the rival-closure row falls away. |
| 17 | same §21 ll. 729–741 | "No P13–P15 document assumes option 3 [Endless]." | Direction K | Option 3 is selected; the row's list of what Endless must answer (catalogue supply, era presentation, …) **survives** as the checklist for the Endless slice. |
| 18 | same §11.0 ll. 326–340 | "The accepted core weekly scheduler … owns one immutable, versioned `AuthoritativePhaseOrderCatalogue` … Every new material event persists `phaseId`, `phaseOrdinal`, `phaseOrderVersion`." | `[FUTURE OPS DISPOSITION]` 2026-09-12 §7 — **not** Owner product direction | Not superseded. Its `legacy_phase_unspecified` / `phasePrecision: not_recorded` mechanism (ll. 334–340) is the honest way a bounded slice records order before a catalogue exists; the repository-wide catalogue campaign is not a prerequisite for the selected slice (§7.3). |
| 19 | `docs/engineering/P12A-DECISION-AND-REQUIREMENT-REGISTER.md` @592e926 l. 114, SIM-015 | "6–10 active AI rivals as later operating target … not Owner law … later P15B mass-failure floor proof remains deferred" | Direction G | The floor proof is no longer applicable; SIM-015 already says the target was never Owner law. `P12A-PRE-READINESS-AND-DEPENDENCY-GATE.md` l. 40 is the same statement. |

---

## 3. Financial value and Power Ranking

### 3.1 Four value concepts, kept distinct `[RECOMMENDATION]`

| Concept | Question | Made of | Who computes | Consumed by |
|---|---|---|---|---|
| **Book Net Worth** (recorded value) | what does the ledger say the studio owns minus what it owes? | cash + Σ recorded asset value − loan principal − accrued unpaid interest | P11 read model over ledger truth | display; band inputs; settlement facts |
| **Estimated liquidation / collateral value** | what could be recovered by selling everything today under the game's own refund law? | cash + Σ facility capex × 0.50 + Σ set capex × 0.35 − debt (`tuning.ts` refund fractions `[CODE]`) | P11 | loan collateral (LTV); FRP at settlement |
| **Estimated operating-studio value** | what might the business be worth as a going concern? | [3, 6] × three-year trailing operating surplus (floored at 0) + cash − debt, **unfloored** (§3.3) | P11 formula, P15A.2 presentation | display only — no mechanic |
| **Actual transaction / auction price** | what did someone pay? | a closed P16 transaction | P16 | history; the acquisition event |

The report's §4.1 already keeps the first and third apart; this table adds the second and fourth explicitly.

### 3.2 The "cash + 50 % facility capex + 35 % set capex − debt" model is a discounted valuation assumption, not book accounting

Purpose: it is the **liquidation basis** — the only asset value the accepted game already makes real (the demolition/strike refund fractions). Choosing it for Book Net Worth means the book can never overstate what the studio could actually recover, and it needs no depreciation model that does not exist. It is a *choice of basis*, not approved accounting: a **cost basis** (100 % of recorded capex) is the conventional alternative and is shown side by side in `OUTPUT.md §8`. Under either basis the identity BNW = cash + assets − debt holds on every row; the bases differ only in *when* the 50 % haircut is recognised (at purchase under LIQ, at sale under COST) — the total over the asset's life is identical. Which basis P11 adopts is a class-**C** accounting-policy choice for the P11 charter, disclosed in the panel ("assets marked at recoverable value"), not an Owner decision unless the Owner wants to make it one.

### 3.3 Purchase → ownership → depreciation/resale → sale, with no double counting (`OUTPUT.md §8`, `[PROVISIONAL]`)

| Week | Event | Cash | Debt | Asset (LIQ) | BNW (LIQ) | What moved |
|---|---|---|---|---|---|---|
| 0 | opening | 20,000,000 | 0 | 0 | 20,000,000 | — |
| 1 | borrow $5M | 25,000,000 | 5,000,000 | 0 | 20,000,000 | cash and debt **together**; BNW unchanged |
| 2 | build $2.4M soundstage | 22,600,000 | 5,000,000 | 1,200,000 | 18,800,000 | cash → asset at 50 %; the haircut is recognised **once**, here |
| 54 | 52 instalments of $13,976 | 21,873,249 | 4,660,095 | 1,200,000 | 18,413,154 | cash −726,751 = interest 386,846 (BNW falls by exactly this) + principal 339,905 (debt falls by exactly this) |
| 55 | depreciation | — | — | — | — | none exists at 592e926; if an age curve ships, the asset column and BNW move by the same amount, cash and debt untouched |
| 56 | demolish, refund $1.2M | 23,073,249 | 4,660,095 | 0 | 18,413,154 | proceeds = book → no gain/loss; a P16 sale at a *price* ≠ book would recognise price − book once |
| 57 | repay $4,660,095 | 18,413,154 | 0 | 0 | 18,413,154 | cash and debt together; BNW unchanged |

Cash, asset value, sale proceeds and debt each appear exactly once: proceeds replace the asset (never add to it), repayments retire debt (never count as expense), interest is the only loan flow that reduces BNW.

**The floor is removed.** The report (§4.4, finding 8) floored Estimated Studio Value at Book Net Worth. That floor is withdrawn: an estimated operating value **below** book is legitimate information ("worth more liquidated than operated" — the declining or asset-heavy studio), and distress, encumbrances (debt) and unwanted obligations (Guaranteed Obligations, Wind-Down Position) must remain representable rather than masked by a floor. The range is now shown unfloored with one of two labels: "operating value below book" (whole range below) or "range straddles book". `OUTPUT.md §5` and `§8` show both cases (e.g., the rich-but-declining studio: BNW $42.0M, operating value $34.5–39.0M). The earlier "arbitrage" concern belongs to a transaction system, where the actual price — not the estimate — governs.

### 3.4 Model D stays a recommendation; one compact alternative `[RECOMMENDATION]`

- **Model D** (report §4.2): three creative lanes → rank; a **Financial Standing band** (Thriving/Stable/Leveraged/Strained/Distressed) in the same row that can never move the rank and is never ordered.
- **Model E — two ranks, one table:** beside the creative Power Rank, a separately ordered **Financial Strength rank** (1…N, with its own movement arrow) computed from a published, capped formula over **public** inputs only — e.g., trailing-three-year gross of disclosed releases (already public industry facts at 592e926) and the public band — never from private cash or debt. The two ranks are never combined into a third number; Standing and Legacy are untouched. What it buys: a real comparison ("#2 creatively, #5 financially") the band cannot express. What it costs: a second ordering that reads as a wealth leaderboard at small cohorts (three rows disclose by subtraction), and a public-proxy formula that can disagree with a studio's true balance sheet (a hot leveraged studio ranks high on public grosses while privately Strained — which is why the band must still be shown beside it).
- Either model satisfies "somewhere meaningful"; neither replaces Standing or Legacy. The choice is the genuine product decision D2 (§9).

### 3.5 Disclosure tiers — public information vs information disclosed for a transaction `[RECOMMENDATION]`

| Tier | Who sees | What | Recorded how |
|---|---|---|---|
| **Own studio** | the player | exact Book Net Worth, Obligations, Wind-Down, operating-value range, loan schedule, band inputs — with full breakdowns | ledger read models |
| **Public** | everyone, every rival's row | public stage (Warning+ after the disclosure threshold), the Financial Standing band, and — under Model E — a public-proxy rank; **no dollars** | quarterly snapshot |
| **Transaction-disclosed** | eligible counterparties in a specific P16 transaction (bidder in a disposal handoff window, acquirer in due diligence) | exact book figures of the target for that transaction, recorded as a disclosure receipt so the disclosure is itself an event | P16 receipt |

"Never dollars for rivals" is therefore a rule about the **public** tier only. It is not a permanent restriction on P16 due diligence, and the report's §4.4 "Disclosure" paragraph is amended to say so.

### 3.6 Unavailable lanes: NOT RECORDED is never zero `[RECOMMENDATION]`

At 592e926 the honors lane has no data (Awards are a stub; P08B blocked); P13 technology and P14 relationships do not exist. Rules: a lane with no recorded source renders as **NOT RECORDED**, never 0; the rank is computed **over available lanes only** and the row states it ("ranked on 2 of 3 lanes — Honors not recorded"); **no sum is published while any lane is NOT RECORDED** (a two-lane sum is a different scale from a later three-lane sum and would silently break comparability); when a lane becomes available at week W the ranking formula version increments, earlier snapshots keep their version tag and are never recomputed (law 7). The same rule applies to every "not recorded" domain in the dossier (report §11.2). No award, rights or technology value is ever invented to fill a lane.

---

## 4. Loans and the failure ladder

### 4.1 What is selected direction and what is a new proposal

- `[OWNER DIRECTION F]` ordinary interest-bearing borrowing that must be repaid and can contribute to bankruptcy → the **Studio Loan** and the ladder-offered **Rescue loan** implement it (report §7.2).
- `[OPTIONAL PROPOSAL — class E]` **automatic interest on sustained negative cash** (report §7.2 "rule change", finding 11). This is a separate overdraft/penalty proposal: it creates an obligation without any borrowing decision. It is **not** authorized by Direction F, is separated from the loan products in the report by this pass, and **must never convert a legacy negative balance into an undisclosed loan** — if it is ever adopted, its clock starts at zero on the first tick after migration like every other counter (report §5.2 rule vi). Without it, the exploit it targets ("overdraft beats borrowing") is bounded by the existing law: negative cash refuses every voluntary commitment (`canAfford` `[CODE]`) and, sustained, satisfies the debt-free Distress path (§4.4).

### 4.2 Every proposed obligation, in one table `[RECOMMENDATION; numbers PROVISIONAL]`

| Mechanism | What creates the obligation | Principal | Interest | Due | Amount actually paid | Unpaid balance | Cure | Consequence of default |
|---|---|---|---|---|---|---|---|---|
| **Studio Loan instalment** | an explicit borrowing decision (player action / P12 policy branch) | drawn amount, amortized weekly over 260 or 520 weeks | balance × weekly rate, charged **once per week** | every week from draw+1 | the scheduled instalment A if cash ≥ A after that week's unconditional debits; otherwise 0 (an instalment is all-or-nothing, so the fact is discrete) | balance (includes any capitalized interest); arrears = count of uncured misses | pay every currently-missed instalment | 4 uncured misses in a rolling 13 weeks → Event of Default (Severe Distress) |
| **Missed instalment** (capitalization) | a scheduled instalment not paid | none new — the unpaid principal portion is **already in the balance** | that week's interest is added to the balance (capitalized) | — | 0 | balance rises by that week's interest only | as above; after cure the loan re-amortizes over its remaining term | the miss is an append-only fact; it feeds the credit grade even after cure |
| **Rescue loan** | offered by the ladder in Distress+; accepted by the player or by P12 policy | ≤ 13 weeks of fixed costs (payroll + overhead + Opex + existing service) | heaviest spread; same weekly charge | weekly, ≤ 156 weeks | as Studio Loan | as Studio Loan | as Studio Loan; cross-default with the Studio Loan | as Studio Loan |
| **Covenant breach** (leverage / coverage / minimum cash) | not an obligation — a published test evaluated on a trailing 13-week average | — | — | — | — | — | test passes again over the same window (8-week cure period) | opens Warning; never money |
| **Acceleration** | an uncured Event of Default at the end of the 13-week Insolvency window | whole balance | any post-acceleration default rate is a separate `[PROVISIONAL]` proposal | at once | whatever the settlement pays (pro rata) | recorded as `writtenOff`, never deleted | none — terminal | settlement |
| **Distress interest on negative cash** `[OPTIONAL PROPOSAL E]` | 8 sustained weeks of negative cash | none (no principal exists) | base rate on the negative balance, weekly | weekly | debited like overhead | none — it is an expense, not a debt | cash ≥ 0 | none directly; feeds the debt-free Distress path only through cash |
| **Debt-free failure path** | not an obligation — a sustained condition (§4.4) | — | — | — | — | — | condition clears over the rolling window | Insolvency window → Bankruptcy |

### 4.3 The reconciled loan ledger (`OUTPUT.md §9`)

$5,000,000 at 8 % for 10 years: A = $13,975.98/week. Weeks 1–4 paid; weeks 5–8 missed; week 8 is the fourth uncured miss inside 13 weeks → Event of Default; week 9 cures (4 × A arrears + the current instalment = $69,879.92) and the loan re-amortizes at A′ = $13,976.59.

| Check | Result |
|---|---|
| borrowing increases cash and debt together | `OUTPUT.md §8` week 1: +5,000,000 / +5,000,000, BNW unchanged |
| principal repayment reduces both | §8 week 54: cash −726,751, of which 339,905 principal reduces debt by exactly 339,905 |
| interest charged once | every ledger row charges balance × r once; the missed weeks add that interest to the balance and nothing else |
| missed principal not added a second time | week 5 balance rises by $7,653.55 (the interest), not by $13,975.98 |
| capitalization, fees and refinancing do not duplicate | after cure the balance is $4,917,768.13 vs $4,917,553.90 on the on-time path: the whole cost of four missed weeks is **$216.67** of extra interest — no fee, no default rate, no second principal. The refinance fee (report §7.2) is charged only on a *functional* refinance and once per event |
| balance identity | principal + Σ interest − Σ paid = ledger balance on every row |
| cure restores status without erasing history | arrears → 0 and status → current at week 9; the four missed-instalment facts remain in history and feed the credit grade (spread on the next loan) |
| migration | every counter starts at zero at the first tick after upgrade; existing negative balances are **not** reinterpreted as loans or as misses; a save years in the red still walks the whole ladder from Warning |

### 4.4 The debt-free failure path, precisely `[RECOMMENDATION; constants PROVISIONAL]`

Negative cash or negative Book Net Worth **alone never moves a stage**. The path for a studio with no loan uses the shipped classifier (`classifyRecovery`, `studioRunRecap.ts:962–1006` `[CODE]`): `severe` = a standard-budget film is unaffordable **and** no active run is paying **and** net weekly cash < 0 **and** runway is finite; `noNormalProduction` = even the cheapest package is unaffordable.

1. **Warning:** `constrained`-or-worse in ≥ 4 of the last 6 weeks, or cash < 8 weeks of fixed costs in ≥ 4 of the last 6 — no clock.
2. **Distress:** `severe`-or-`noNormalProduction` in ≥ 13 of the last 16 weeks — no clock; remedy menu open.
3. **Event-of-Default equivalent:** Distress in ≥ 26 of the last 32 weeks **and** no improving trend (trailing 13-week net cash flow ≤ 0). A studio with negative cash but an active run paying out is never `severe`, so "negative cash" by itself cannot reach this step.
4. **Insolvency window:** 13 weeks, visible clock, remedies imposed, Rescue offered if eligible.
5. **Bankruptcy** if uncured; settlement the same week (§5).

Every test is a rolling-window majority; a lucky week does not reset it; a cure is sustained recovery over the same window.

### 4.5 Eligibility: investment loan vs rescue; shared law vs rival willingness `[RECOMMENDATION]`

- **Studio Loan eligibility** is computed on trailing **operating** surplus — loan proceeds are financing rows (`loanProceeds`), never revenue — so borrowing cannot raise it; coverage divides surplus by *existing plus proposed* service, so each loan lowers it; LTV is on book-after-salvage, so a dollar of proceeds spent on facilities adds at most $0.50 of collateral. The borrow → build → borrow chain therefore converges (`OUTPUT.md §10`: $3.0M → $0.9M → $0.27M …, limit 1.43 × the first cap) and coverage binds long before that (`§2`: at 8 %/10 yr a $1.5M-surplus studio hits 3× coverage at ≈ 2.3× leverage).
- **Rescue eligibility** is deliberately different: it is offered, not requested; only in Distress+; sized to ≤ 13 weeks of fixed costs; requires that post-draw projected coverage *improves* (scheduled receipts in flight — `pipelineRunRevenue` `[CODE]` — count); **one Rescue per distress episode**, re-armed only after ≥ 260 consecutive Healthy weeks. So it is neither impossible (any Distress+ studio with in-flight receipts or fixed costs under the cap qualifies) nor an unlimited bailout (one, bounded, priced, repayable, identical for rivals).
- **Shared law vs willingness (D8):** the *law* — terms, caps, default, ladder — is one and identical for player and rivals (class A). *Whether a rival borrows* is a P12 policy parameter (draw a Studio Loan when projected weeks-to-reserve-exhaustion ≤ N and the caps allow; accept an offered Rescue when eligible and coverage improves) — an authored strategic-willingness dial, already differentiated by the authored spread (`reserveWeeks` 12–20, `negativeScale` 0.94–1.20 `[CODE]`), and the thing that decides whether consolidation actually happens (report §10). Class C, not an Owner decision.

All constants remain `[PROVISIONAL]` recommendations supported by the paper scenarios (report §5.3, §7.3; `OUTPUT.md §1–2, §9–10`), not questions for the Owner.

---

## 5. Terminal failure and talent settlement

### 5.1 C → B, plainly `[RECOMMENDATION implementing Directions E and J]`

1. **Bounded rescue opportunity:** the 13-week Insolvency window with a visible clock, imposed remedies and (if eligible) one Rescue loan.
2. **Failure if uncured:** the terminal Bankruptcy event fires at window end.
3. **Actual settlement / end of studio operations:** the same settlement week as a rival — contracts end, talent is released, claims are recorded, conserved work goes to the bounded estate, assets and cash go to creditors or into the disposal handoff. **The company genuinely fails.** The player no longer operates a studio in that campaign.
4. **Preserved history and postmortem:** the `StudioId`, films, people, receipts and chart rows remain forever; the Legacy dossier opens immediately with an early trigger substituted for `2040-eligible` (same P15C reducer). The dossier is a *record of* the failure; it does not prevent it, soften it or continue it.

### 5.2 Separate things that must not be conflated

| Mode | Status |
|---|---|
| Normal continuation after the 2040 finale (Endless Sandbox) for a studio that is **operating** at the finale | `[OWNER DIRECTION K]` — selected |
| Viewing history after a bankruptcy (the archive and dossier stay browsable) | part of §5.1 step 4 — a view, not a play mode |
| Starting another campaign | already exists (new game); unaffected |
| Founding another studio in the same world after bankruptcy | `[OPTIONAL PROPOSAL E]` — not required; constrained by the ten-identity validator (report §6.6) |
| Continuing as an employee | `[OPTIONAL PROPOSAL E]` — not required; no shipped precedent (Capitalism Lab's is unshipped) |

Endless Sandbox **never** lets an already-bankrupt company operate indefinitely: it continues an operating campaign past 2040 under the same law, including the same failure law (a studio bankrupt after 2040 gets the same terminal path, recorded in the Endless record set, and the frozen 2040 Legacy is untouched).

### 5.3 Ordinary firing vs bankruptcy settlement — the write-down is a proposed special rule `[RECOMMENDATION]`

- **Ordinary P14 firing** (solvent employer): the existing law — `HIRING_TERMINATION_FRACTION 0.5` buyout of the remaining guarantee `[CODE]`, paid in cash, recorded as paid. Untouched.
- **Bankruptcy settlement** (proposed special rule): at the settlement week every open contract at the closed studio ends (`expiry` if due; new reason `employerClosed` otherwise). Wages accrued to the settlement week are **paid first** from estate cash. Each contract's remaining guarantee becomes a **recorded unpaid claim** on the estate (a `claim` receipt with the amount and the `PersonId`), paid **pro rata** from whatever estate cash remains after wages and conserved-work costs; the unpaid remainder is recorded as **unpaid** — never as paid, never deleted — and stays visible in both the studio's and the person's history ("owed $X by [studio] at closure; $Y paid, $Z unpaid"). This is the write-down: a documented shortfall, not an erasure.
- A severance-weeks abstraction is `[OPTIONAL PROPOSAL E]`; the original game had none.
- If voluntary bankruptcy (D21, class E) is ever added, it must not discharge a guarantee more cheaply than the 50 % buyout, or failing becomes the cheap way to shed contracts.

### 5.4 Estate productions: what can actually be completed `[RECOMMENDATION]`

Facts at 592e926: a rival's negative and marketing budgets are debited **in full at greenlight** (`hollywoodTick.ts:169` `[CODE]`); the player's greenlight likewise debits negative + marketing + film salaries up front (`actions.ts:16` `[CODE]`); participants are **frozen at greenlight** (`hollywoodTick.ts:165`) so the result never reads the live roster; a production counts down `remainingTicks` from `PRODUCTION_TICKS 8` on the studio's stage capacity; a theatrical run pays out for `THEATRICAL_WEEKS 6` and costs nothing further.

| Item | Remaining funding | Facilities | People | Authoritative completion path | Estate rule |
|---|---|---|---|---|---|
| Theatrical run in progress | none needed; it *pays* | none | none | P07 frozen run pays weeks k…6 | **always completes**; receipts to the estate |
| Greenlit production, tick k/8 | negative + marketing already sunk; residual = (8 − k) weeks × (`OVERHEAD_BASE` + capacity Opex) — overhead only, payroll ends at release | the studio's own stage (abstract capacity for rivals; a placed stage for the player) — must remain in the estate, i.e., not yet sold in the handoff | frozen participants (already released as people; their credit is fixed) | production completes → release → run | **support test:** estate cash after wage priority ≥ residual overhead → completes under the estate; **otherwise suspended** (`productionSuspended` receipt), included in the disposal handoff, and if nothing closes within the handoff window → **cancelled** (`projectCancelled`: the sunk budget is lost, no result is fabricated, no credits are minted, the concept persists as a cancelled fact) |
| Screenplay in development (no `productionId`) | not funded | — | writer already released | — | **cancelled** (`projectCancelled`) |
| Scheduled but not started | not funded | — | — | — | cancelled |

No production is ever free: the residual overhead is a real debit from estate cash, and an estate that cannot pay it does not complete the film. No ghost studio: with the run and production bounds above, an estate archives ≤ 14 weeks after the terminal event.

### 5.5 Talent release: employment vs residual project commitment `[RECOMMENDATION]`

At the settlement week a released person has (a) **no employment** (`employerClosed`/`expiry`; enters `freeAgents` under the ordinary hiring law, P14 rules when P14 exists); (b) possibly a **residual project commitment** — a frozen participation in an estate production that is still counting down. The commitment is a credit fact, not a job: it does not block hiring (the person's work is already recorded in the frozen participants), it does not pay (their pay for it was part of the sunk budget or of the wage claim), and it resolves when the estate production releases or is cancelled. `PersonId`, exact history, outstanding work and normal P14 availability rules are preserved; no `PersonId` is ever re-minted (`hollywoodValidation.ts` `[CODE]`).

### 5.6 Acquisition priority vs free agency `[RECOMMENDATION]`

- **Before terminal release:** an acquisition that closes during the Insolvency window (or, if P16 defines one, during a bounded disposal handoff window that precedes the release week) transfers the studio's contracts *before* they end. P16's "priority opportunity to retain talent" is exercised **in that same tick, before free agency** — nobody is ever employed by two studios and nobody is released and then reserved.
- **After the settlement week has released talent:** those people are ordinary free agents. A buyer of the estate's assets acquires assets, not people, and **cannot retroactively reserve, reclaim or acquire them**.
- The one sequencing requirement this places on P15: the settlement week must publish the release *after* any transaction that closed in the same tick has been applied (transaction → retention → release), and the disposal handoff record must state the release week so a buyer knows the deadline.

**Genuinely unresolved settlement choices (labelled):** none that block P15 preparation. One is P16's: whether a *suspended* estate production may be transferred to an acquirer who completes it (the support test makes it well-defined; whether P16 wants it is P16's).

---

## 6. Consolidation and major events

### 6.1 Failure-hazard analysis as a sensitivity study (`OUTPUT.md §11`, `[PROVISIONAL]`)

No replacements, no resurrection, no target survivor count. A constant annual terminal hazard *p* is an assumption used to bracket outcomes; the real hazard is emergent from the ladder and rival policy. With the authored arrival years 1920 ×4, 1930, 1939, 1950, 1956, 1969 (exposures to 2040 of 120, 120, 120, 120, 110, 101, 90, 84, 71 years):

| p / yr | E[survivors] at 2040 (exact exposures) | E[survivors] if the failure law only starts in 1970 (70 yr each) | P(no survivors) | P(≤ 1) | P(≤ 2) |
|---|---|---|---|---|---|
| 0.1 % | 8.11 | 8.39 | 0.0 % | 0.0 % | 0.0 % |
| 0.2 % | 7.31 | 7.82 | 0.0 % | 0.0 % | 0.0 % |
| 0.5 % | 5.36 | 6.34 | 0.0 % | 0.4 % | 2.6 % |
| 1.0 % | 3.22 | 4.45 | 1.8 % | 11.0 % | 31.8 % |
| 2.0 % | 1.18 | 2.19 | 27.9 % | 66.7 % | 90.0 % |
| 5.0 % | 0.07 | 0.25 | 93.5 % | 99.8 % | 100 % |

Reading: expected survivors and the probability of an empty Hollywood are different questions — at 1 %/yr the expectation is ~3 survivors yet a 1-in-55 campaign ends with none and one in nine with at most one; at 2 %/yr more than a quarter of campaigns end empty. The report's "0.2–1 %" band (§5.5, finding 12) is a check to run in playtest, not a target; the exact-exposure figures here replace the report's uniform-120-year approximation (which overstated attrition for the later entrants). A save that receives the failure law mid-campaign has shorter exposure still (third column).

### 6.2 Free-agent supply: cumulative stock vs newly released (`OUTPUT.md §12`)

Two facts change the picture the report's §10 table painted: each rival staffs exactly **six** roles (`RIVAL_TEAM_ROLES`, `hollywoodStartingData.ts:46` `[CODE]`), and when no free agent of a needed role exists a rival **mints** a new person (`hollywoodTick.ts:120–124` `[CODE]`) — so supply is elastic upward and minting stops while the pool holds that role. Consequences: (i) the number *newly released by a particular closure* is six (a rival) or the player's roster; (ii) the *cumulative* idle pool is a stock drained only by hires, so it grows with each closure and never shrinks by itself; (iii) a snapshot of "vacancies vs available people" therefore says nothing about a permanent collapse — salaries come from the offer law (`offerForTalent`), not from pool size, and the pool's growth is a **legibility** issue (named people idle for decades) before it is a difficulty one. The report's finding 13 and §10 are amended to say "legibility risk" rather than "collapse".

### 6.3 Rival capacity growth: with and without `[OPTIONAL PROPOSAL E — new upstream P12 work; not authorized; not a P15A prerequisite]`

| Active rivals | Closures | Newly released | Demand today (6 per rival + player 12) | Demand if every survivor had grown +6 roles (illustrative) | Idle pool if nobody re-hires |
|---|---|---|---|---|---|
| 9 | 0 | 0 | 66 | 120 | 0 |
| 6 | 3 | 18 | 48 | 84 | 18 |
| 4 | 5 | 30 | 36 | 60 | 30 |
| 2 | 7 | 42 | 24 | 36 | 42 |
| 1 | 8 | 48 | 18 | 24 | 48 |

Without growth the surviving field's demand falls one-for-one with closures and the idle stock accumulates; with growth the survivors absorb part of each closure. Growth is the emergent sink the report recommends, **but it is new P12 scope** (rivals have entry-time capacity only at 592e926) — a dependency to state in any P15B charter, not something P15 may assume.

### 6.4 Competitive timing is not an exploit `[RECOMMENDATION]`

Deliberately timing a legitimate, marketed release against a rival's anchor genre is competitive play under one shared law — the report's §3 sentence asking the Owner whether "engineered rival bankruptcy" is sanctioned is withdrawn (D20 → class C). What the law must close instead, and already does: **fake announcements** (pressure exists only from batch-frozen releases; previews are non-authoritative and refresh in place — P15 package §12.1); **free spam** (contribution scaled by disclosed public reach with a per-(studio, genre, window) clamp before the shared aggregate); **asymmetric rules** (the same formula, caps and clamp apply to every studio). Nothing protects a rival from fair competition.

### 6.5 Bankruptcy notice: prominence vs deadline `[RECOMMENDATION]`

The industry-wide bankruptcy notice is INFO-tier, **pinned and persistent** (it stays in the Industry Pulse and on the lot-level pulse until the player dismisses it, never auto-expiring inside the quarter it fired; it does not pause the game). Any **actionable** opportunity that the same event opens — a disposal handoff window, a retention window — is a *separate* DECISION-tier item with its own visible deadline and pause. When the deadline passes, the actionable item is removed and the information notice updates its text ("auction closed W##"); an expired opportunity is **never** shown as live merely because the information notice did not pause.

---

## 7. Market, ordering and finale

### 7.1 The taper, completely, and how the two lanes avoid double counting (`OUTPUT.md §13`, `[PROVISIONAL]`)

- **Window lane** (the "≈ 4-week window", Owner direction A; shape is tuning): a rival same-genre release at week R weighs 1.00 in week R, 0.55 in R+1 and R+2, 0.20 in R+3, and leaves the window at R+4.
- **Saturation stock** (longer memory): at R+4 the release **hands off** — it enters the per-genre stock at its last window weight (0.20), decays with a 13-week half-life, and is retired at R+26.
- **No double counting by construction:** a release is counted in exactly one lane in any week (window for [R, R+4), stock for [R+4, R+26)); the hand-off at equal weight makes the profile continuous (1.00 / 0.55 / 0.55 / 0.20 / 0.20 / 0.19 / 0.18 … / 0.065 at R+25 / 0). Total exposure-weeks per unit contribution = 4.96 (2.30 in the window, 2.66 in the stock). Contribution is scaled by disclosed public reach and clamped per (studio, genre, window) before aggregation. Pressure explanations name the lane ("2 known releases within 4 weeks" vs "7 comedies in the past 26 weeks").

### 7.2 Launch effects vs ongoing-run effects; order-independence; no retrospective rewrites

- **At launch only:** market pressure is evaluated **once**, at the atomic P12 release batch, from lawful public facts — the pre-batch window/stock state plus the other releases in the same batch (self-excluded) — and is consumed by the P07 reception verdict as one frozen input. Every release in a batch sees the same pre-batch state and each other at weight 1.00, so **same-week handling is order-independent** by construction.
- **Ongoing runs are never touched:** a P07 theatrical run is frozen once started (P15 package law: preserve P07 frozen runs); a later release changes only *its own* assessment and the state that *future* batches read. No previously recorded outcome is ever recomputed.
- **Pre-P15 saves** cold-start every exposure and stock at zero from a `recordedFromWeek` boundary (law 7).

### 7.3 Event order — only what the selected slice needs `[RECOMMENDATION; FUTURE OPS DISPOSITION applied to D17]`

For the P15A.1 slice the necessary within-week order is: (1) P12 release batch frozen → (2) market assessment computed from pre-batch state + batch with self-exclusion → (3) P07 reception verdict consumes the assessment → (4) window/stock state advanced and archived. Critical boundaries: upstream, the P12 release commit; downstream, the P07 result boundary (`releaseAuthority.ts` / `receptionVerdict.ts`, a reconnaissance question — report §16.4). For the later loan/ladder slices: receipts in → unconditional debits (payroll, overhead, Opex, loan instalment) → missed-instalment fact → stage evaluation → remedies and notices → any same-tick transaction → release. Each slice records its own domain-local phase identity for its events using the roadmap's existing `phasePrecision` mechanism (§11.0 ll. 334–340) so a later catalogue can absorb them; the repository-wide catalogue campaign is not a prerequisite for the slice (supersession table row 18). Report §13 row 11 and finding 3 are amended accordingly.

### 7.4 Finale and Endless — preserved, with two clarifications

Preserved from report §11: the engine-level frozen Legacy boundary (an in-checkpoint marker the load/tick path refuses to advance); evidence-linked history (records before prose; every sentence resolves to a dated record); unavailable-domain disclosures as first-class "not recorded" content; a separate post-2040 record set. Clarifications: (i) the player can still fail post-2040 because the **same law continues** (class A), not because of a new rule; (ii) **future-era policy** (freeze at the last authored era by default; a generic repeatable stub or a disclaimed procedural future only if separately authorized) is a recommendation **pending P13's upstream catalogue contract** — it is not, and must never become, fabricated future history.

---

## 8. Publication record and bounded checks

**Branch:** `docs/p15-independent-verification-01` (continued; the only publication for this assignment). **Documentation parent:** `13370d428f0693f3279732f6f4cc360a7fcaa4df` (P12 R05 Owner-acceptance closeout). Current main was not used as accepted-runtime authority; the accepted TypeScript runtime remains `592e926`.

**Bounded edits made to the report in this pass** (each preserves the original analysis; nothing in `evidence/`, `analysis/`, `verification/` changed): header pointer to this document; finding 1 (laws vs restrictions); finding 3 and §13 row 11 (bounded event order, not a repo-wide catalogue prerequisite); finding 8 and §4.4 (operating-value floor removed; discount basis labelled; disclosure tiers); finding 11 and §7.2 (distress interest separated as an optional proposal); finding 13 and §10 (legibility, not collapse; six-role rosters; minting); finding 15, §9.4, §13 row 7 and finding 20 (P15 eligibility/handoff vs P16 transactions; "P15D" withdrawn as a package recommendation); §3 (the "engineered bankruptcy" Owner question withdrawn); §5.2 and §6.4 (voluntary declaration labelled optional); §6.5 (C→B plain statement); §8 (claims recorded, unpaid never shown as paid; estate support test); §11.3 (Endless does not revive a bankrupt studio); §6.6 (post-terminal "continue" is an optional proposal, not open); §7.3 ownership line (distress interest qualified); §15 (replaced by the class-D list with a pointer to §2.3 here); the summary table's "Remaining choice" cells re-stated per §2.3 and its Loans cell qualified; the header's local working-tree path neutralized.

**Checks:** one bounded read-only Sonnet check (disposition coverage, numerical consistency, completeness/links, label discipline) ran before publication: `reproduce.py` output byte-identical to `OUTPUT.md`; every quoted figure in §3.3, §4.3, §6.1, §6.3, §7.1 and the report's amended finding 13 / §10 independently re-derived and matched; six narrow leftovers in the report (two unqualified class-E mentions, one "genuinely open" sentence, the summary-table cells, one local path) were fixed before commit; verdict PASS WITH NOTES. The exact commit, remote head and changed-path list (all under `docs/research/p15-independent-verification-01/`) are in `INDEX.md` and the delivery message.

---

## 9. Only genuine remaining product choices (class D)

| ID | Choice | Options | Researcher recommendation | Owner of the decision |
|---|---|---|---|---|
| D2 | How financial strength is shown beside the creative Power Rank | Model D (band beside the rank, never ordered) · Model E (a separately ordered public-proxy Financial Strength rank beside it) | Model D; Model E if the Owner wants a comparable financial ordering | Owner (P15A.2) |
| D3 | Public disclosure tier for rival financial condition | public stage only · stage + band · stage + band + public-proxy rank | stage + band | Owner (P15A.2 / P15B) — transaction-tier disclosure is P16's and unaffected |
| D4a | Honors lane before Awards exist | NOT RECORDED until P08B · explicitly labelled interim source from the frozen `industryPrestige` Standing channel | NOT RECORDED (the interim source bends "Standing is not rank") | Owner (P15A.2) |
| D11 | Transaction order rule and player eligibility as bidder | sealed simultaneous · leader-first with guard · player-premium | sealed simultaneous | **P16** — listed for traceability only; not decided in P15 preparation |

Everything else in the original 22 is A (already law), B (documentation), C (planning/tuning) or E (optional), per §2.3.

---

## 10. Evidence and calculations still unverified

1. All constants in §4–§7 are `[PROVISIONAL]`; the arithmetic is reproduced, the values are not evidence-derived beyond comparator ranges.
2. The survivorship table assumes independent, constant per-studio hazards; correlated failure waves (genre-anchor clustering, report §10) would raise P(no survivors) at a given expectation and are not modelled.
3. The free-agent stock/flow uses six roles per rival and a 12-person player roster as illustrations; player roster size varies and P14's market rules do not yet exist.
4. The P07 result-boundary seam (`releaseAuthority.ts`/`receptionVerdict.ts`) for the launch-time assessment remains a reconnaissance question (report §16.4).
5. Whether the residual estate overhead should include capacity Opex for a rival whose "capacity" is abstract is an implementation detail of the support test, not verified against a running build (no builds or runtime tests were permitted).
6. Report §16's list stands unchanged.
