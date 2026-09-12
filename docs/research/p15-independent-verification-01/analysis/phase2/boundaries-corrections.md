# P15 Package-Boundary Map, Corrections Table, and Remaining Owner Decisions

**Package:** P15 (Corporate Hollywood, Shared Market & Studio Legacy) — Analyst pass, Phase 2
**Base code:** TypeScript `592e926` (Owner-accepted 2026-09-11) at `scratchpad/accepted-592e926/`
**Scope of this report:** deliverable sections 13 (ownership map), 14 (corrections table), 15 (remaining
Owner decisions), 16 (uncertainties) only. It does not re-derive market formulas, ranking weights, or
finale content — those are other analysts' lanes; this report cites their conclusions only where a
boundary or a correction depends on them.
**Method:** every ownership recommendation states what it adopts, what it rejects, which package owns
it, and what documented ruling must be superseded by a new recorded Owner ruling before a builder may
act. Every correction is graded CONFIRMED / QUALIFIED / CORRECTED / SUPERSEDED BY OWNER DIRECTION
against the Phase-1 verification digest (`out/phase1-verify/_DIGEST.md`), which this report treats as
authoritative where it conflicts with an original Phase-1 report.

---

## 1. Ownership map

Table columns: **Capability | Owning package | Reason (one line) | Upstream truth consumed | Additive
root / validator / schema seam at 592e926 | Documentation prerequisite (must be superseded by a new
recorded ruling)**. Package vocabulary: P11 / P12 / P14 / P15A / P15A.2 / P15B / P15C / proposed **P15D**
/ P16+.

| # | Capability | Owning package | Reason | Upstream truth consumed | Seam at 592e926 | Doc. prerequisite |
|---|---|---|---|---|---|---|
| 1 | **Market pressure** (genre + release-window competition, decay) | **P15A** | Already the Owner-approved re-homing target for P12C; A2/A3 in prior-claims are CONFIRMED APPROVED (RULINGS §4.1) | P12 disclosed release schedule, P07 result boundary | New versioned formula input applied *before* result commit, never after (`P15-PACKAGE.md:602-604`); candidate seam is `releaseAuthority.ts`/`receptionVerdict.ts`, **not** `theatrical.ts` (absent) | None new — already authorized; only the exact window/curve is open (§3 below) |
| 2 | **Power Ranking** (quarterly, multi-lane, financial lane research question) | **P15A.2** | Placement law untouched by the new direction (B1 CONFIRMED); only its factor set gained a financial lane | P15A history, P08 honors (Standing), P12 delivery/output facts, and — if a financial lane is adopted — a P11 net-worth read model (#3) | Must be specified *against* the shipped `bridge/industry.ts` Studio Charts (four lanes, competition-rank tie rule, `rank/priorRank/movement`), which already occupies this UI real estate and uses **dense-vs-competition** tie rules that conflict with the P15 candidate (`bridge/industry.ts:66-84`; `industry-schema.ts:3`) | P15-PACKAGE.md §23 "Power Ranking definition" row (three lanes, no financial lane) needs a superseding ruling to admit lane 4 |
| 3 | **Net worth read model** (book value only) | **P11** (new authorized capability; display consumed by P15A.2/P15D) | It is literal accounting truth (cash + capex history + salvage fractions), which is P11's domain by the project's own provenance law, not a P15 computation | `state.ledger`, `ConstructionProject.capex` (V11 legacy annex record), demolition/strike salvage fractions (0.5 facility / 0.35 set) | No committed root exists; must not "reconstruct a purchase from today's blueprint price" per the P11 handoff rule (`P11-TO-P12-PRODUCER-HANDOFF.md:37`) — the live demolition refund already violates this narrowly (`placement.ts:1026`), so a book-net-worth reader must be built on *recorded* capex, not blueprint price | New P11-REQ needed (not blocked by P11-REQ-041/042, which name loans/bankruptcy specifically, not book value) |
| 4 | **Valuation range** (estimated sale-value band, explicitly not book value) | **proposed P15D** ("Studio Value & Legacy Economics") | Owner ruling C explicitly wants this *now*, but warns book ≠ enterprise/sale value; it needs earnings history + a labelled multiple, which is design work beyond a read model | #3's book net worth, P11 trailing operating surplus, P15B distress state (a distressed studio's range should visibly compress) | Entirely new; no seam exists. Must always be shown as a **labelled range with its formula**, never a single "worth" number (comp-ranking §6(b) lesson, citing OpenTTD/GearCity's book-vs-price separation) | P15-PACKAGE.md §25 "P16+" bullet "studio and library valuation" and RULINGS §5 parking must be superseded |
| 5 | **Loans / debt ledger** | **P11** (task brief's own expectation; confirmed by finance-logic.md §0) | A loan is a new financial instrument with scheduled obligations — P11's literal-accounting law, not a P15 mutation/affordability owner (HANDOFF "Financial boundaries") | `state.ledger`, weekly tick debit order, `canAfford`/`insufficientFunds` gates | None exists (`grep loan\|debt` in `src/core/*.ts` returns nothing — F is greenfield, prior-claims F4); must post as a **known obligation beside Cash**, never a silent subtraction (ROADMAP §5.3) | P11-REQ-041 (OWNER-BLOCKED) must be re-opened by a new Owner ruling; D-16 R10 and D-17B §8 (`docs/D-17B-OWNER-AUTHORIZATION.md:37-38`) explicitly prohibit loans and must be superseded |
| 6 | **Distress conditions / remedies** (warning → distress → severe distress) | **P15B** | Direction D/E now authorizes this; the existing 4-stage annex ladder shape survives, only the terminal end changes | P11 obligations/runway (#5), P12 registry state, rival cash-reserve gate that already stalls voluntary commitments below `operatingReserve` (`hollywoodTick.ts:98,126,156,176`) | No `dormant`/`distress`/`warning` field exists on `StudioIdentity` (exact-key validated, `hollywoodValidation.ts:75`) or `RivalBusiness` (`:204`) — any new field is a **versioned, additive** change, not a patch | P15-BUILDER-ANNEX §C.3 ladder wording (forbidden shortcuts) stays useful evidence, not law, until recorded; OWNER-RULINGS-HOLLYWOOD-HORIZON.md §3 "no financing, loans, bailouts, restructuring, hard bankruptcy, or failure ladder" for the **player** must be superseded (Owner direction E) |
| 7 | **Rival closure settlement** | **P15B** | D4/D5 CONFIRMED: settlement invariants and no-identity-death are unchanged by the new direction, only the ladder's late stages are richer | P11 finance, P12 registry/projects/StudioIdentity, P10 contracts, P14 talent (P14 unimplemented — needs an explicit "P14 absent" disposition) | Extends the closed `IndustryReceipt` union (5 kinds today: `studioEntered/employment/filmAnnounced/filmReleased/filmSettled`, `hollywoodTypes.ts:96-103`) with new kinds (`closed`, `settled`, etc.) — a versioned schema change, plus a new `origin`/status vocabulary on `StudioIdentity` | P15-PACKAGE.md §23 "rival closure" row ("entrant floor" clause) needs correction per #14 below; the rest of the row already reads as Owner-approved |
| 8 | **Player terminal experience** | **P15B** (new slice, separately gated per P15-PACKAGE §23 "blocks only a player-terminal slice") | Direction E reverses the single most-repeated prior P15 law; needs its own experience + settlement-policy ruling | Same ladder as #6/#7, plus P10/P11/P12/P14 all-owner settlement manifest if the player studio ever actually closes | `employment.ts:74-86` currently has zero terminal code; `adapter.ts`'s `cashNegative` stop reason (`:2563`, fires `:2791-2792`) is the only existing code that reacts to a cash-sign crossing and is the natural pre-terminal-warning UI seam, not a terminal mechanism | OWNER-RULINGS-HOLLYWOOD-HORIZON.md §3 ("no-hard-bankruptcy... applies to the player's studio... unchanged") is the single ruling direction E most directly revises and must be recorded as superseded before this slice starts |
| 9 | **Talent free-agency settlement** | **P12** now (H1 CONFIRMED: P12 settles roster/employer/exclusivity via typed dispositions); **P14** inherits ownership once implemented | It is exactly a P12 employer-interval-end plus a P10 contract disposition, which P12 already has the pattern for | `industryEmployment.ts` (35 lines today), `industryCareer.ts` | No mass-termination-on-closure code path exists; needs a new typed employment-end reason (today's reasons: `entry/renewal/replacement/expiry/termination/player-contract/existing-player-contract`, `hollywoodTypes.ts:98`) plus a P14-absent disposition until P14 lands | HANDOFF "Employment" (L13) governs; no ruling blocks this, but the "P14 absent" gap needs an explicit interim rule |
| 10 | **Industry notices** (the "X DECLARES BANKRUPTCY" high-visibility announcement) | **P15B** (policy of *when/what* triggers a big notice), consuming **P12**'s existing Industry Pulse surface | The activity-feed mechanism is P12-owned and shipped (`bridge/industry.ts:183-186`, "Grouped material activity for the last 13 campaign weeks"); P15B decides which distress/closure events are big enough to break through it | `IndustryReceipt` union (#7), the P12 activity feed's existing grammar ("X joins Hollywood", "X releases Y", "Contract terms remain private") | P15 attention tiers (`P15-PACKAGE.md §21` INFO/ATTENTION/DECISION/BLOCKING) do not currently enumerate closure or talent-release — needs an added tier row, not a new mechanism | None blocking; P08-style disclosure-threshold law (P12A register UX-010, "distress becomes public only after an authoritative disclosure threshold") should be cited as the design constraint |
| 11 | **Bankruptcy asset auction** (Stage 1: rival-only, event-driven, frozen-price lot) | **P15B** | Comp-ma.md's Stage-1 model needs only a frozen formula price and a settlement event — no valuation model, no finance model; it *consumes* closure rather than creating a new ownership system | P15B closure-eligible state (#7), P11 conserved finance | New: a settlement receipt type carrying an asset lot (films/library rights, unexpired contracts with consent, optionally the studio name as a dormant label) offered in merit order with a short window | RULINGS §4.2 "Corporate-title clarification" (Corporate Hollywood implies no acquisition authority) must be read as satisfied by direction I, but needs recording; ANNEX Q14/PKG §29 HQ11 hostile-review gate needs rewording, not deletion |
| 12 | **Label / subsidiary acquisition** (Stage 2: whole-studio purchase of a distressed rival, kept as a persistent label) | **P16+** (or a scoped **P15D** extension if the Owner wants it inside the P15 window — see open decision §3) | Needs an ownership *edge* on `StudioIdentity` that persists indefinitely (not a one-time settlement), a formula price, and ongoing bounded-autonomy operation — materially more machinery than Stage 1 | #4 valuation range, #11's settlement law, P12 registry | `StudioIdentity` has no ownership-holder field; adding one is an additive/versioned change with permanent identity implications (`StudioId` never reminted — D5/H2 CONFIRMED) | P13-P15-OWNER-RULINGS §4.2 and §5 (acquisitions/subsidiaries parked P16+) is *loosened* by direction I but not placed inside P15 by default — Owner must rule on package boundary (open decision §3) |
| 13 | **Healthy M&A** (Stage 3: voluntary studio-to-studio purchase between healthy studios) | **P16+** | Needs a full valuation model, refusal function, cooldown, and (per comp-ma §6.2) is the only stage where antitrust/regulatory flavor becomes meaningful | #4, #12, P14 talent/contract law | None; furthest from any existing seam | Same as #12; RULINGS §4.2/§5 must be superseded only if the Owner explicitly wants Stage 3 inside P13-P15 scope, which nothing in the new direction requires |
| 14 | **Consolidation policy** (no automatic replacement; report severity rather than floor) | **P15B** design commitment; **P12** keeps authoring the fixed arrival calendar | G-cluster CONFIRMED SUPERSEDED: every "minimum three active AI rivals" / "prevents an empty century" text is a preliminary recommendation, never Owner-approved law, and is now explicitly rejected | P12's fixed `RIVAL_ARRIVAL_WEEKS = [0,0,0,0,520,988,1560,1872,2548]` (`calendar.ts:3`) — unchanged and preserved verbatim | No floor logic exists in `src/core/hollywood*.ts` today (grep for minimum/floor: none) — nothing to remove, only a design commitment not to add one | P15-PACKAGE.md §23 "later entrants / active-rival floor" row and ROADMAP §19.3 "prevents an empty century" language must be recorded as superseded; note the actual P12A-law source (SIM-015) only ever said "roughly 6–10... not Owner law" — the "minimum three" wording traces to the *older* P12 design doc, not an Owner ruling |
| 15 | **2040 finale** | **P15C** | Untouched by the direction except that failed/closed rivals must now appear in it (J4 CONFIRMED) | All durable P07/P08/P11/P12/(P14) history, Legacy archetype evidence limits (`P15-PACKAGE.md §22`) | Entirely new; `"2040"` appears only in five code comments today (`tuning.ts:1236`, `productionIdentity.ts:49`, `screenplay.ts:11`, `rng.ts:61`, `data/screenplay.ts:196`) | None blocking; J1/J2 already OWNER APPROVED |
| 16 | **Endless Sandbox mode** | **P15C** (same package, later checkpoint — a one-time mode transition after the frozen finale per §12.4) | K-cluster CONFIRMED SUPERSEDED: the Owner has now decided (K), where prior text said "undecided... may not silently authorize" | The frozen 2040 finale manifest (#15); must never rewrite it (K rule) | No mode-transition event exists | P13-P15-OWNER-RULINGS §4.3 "Post-2040 Endless Mode remains undecided. P15 may not silently create or authorize it." must be recorded as superseded by direction K (an explicit, not silent, decision) |
| 17 | **Phase-order catalogue prerequisite** (`phaseId`/`phaseOrdinal`/`phaseOrderVersion`) | **Cross-cutting scheduler infrastructure — no P15 sub-package owns it** | It is a binding prerequisite the P15 package doc itself imposes on every new P15 material event (`P15-PACKAGE.md §18.1`) and the roadmap names it as scheduler-owned (`P13-P15-LONG-RANGE-ROADMAP.md §11.0`, lines 324-333) | The tick/phase engine (P07-era), not any P15 data | **Confirmed by direct grep at 592e926: zero hits for `phaseOrdinal`, `phaseOrderVersion`, or `phaseId` in `src/` or `bridge/`.** The prerequisite is unmet | ROADMAP §15 preamble states that without it, a P15 slice "stops at reconnaissance" — this is not a ruling to supersede but a build item to schedule (or a waiver the Owner must grant explicitly, accepting `phasePrecision: not_recorded`/`legacy_phase_unspecified` for everything shipped before it exists) |

### Notes on the two hardest boundary calls

**Net worth vs. valuation range (#3/#4).** The Owner's own ruling (C) warns against conflating these, and
the evidence supports keeping them owned by different packages: book net worth is a *summation of
recorded facts* (P11's job everywhere else in this project), while a valuation range is an *interpretive
estimate* that needs a methodology, a caveat, and — per Owner direction — must never read as a
Wall-Street simulator. Comp-ranking.md's value-presentation table (OpenTTD: book value graphed, sale
price shown only in the offer dialog; GearCity: Evaluation vs. floored market cap vs. acquisition
premium, three numbers, three contexts) is the strongest available precedent for keeping them visually
and computationally separate. Recommendation: P11 owns and exposes literal book net worth as a read
model available to any consumer; a new P15D content package owns the *display* of both the financial
Power-Ranking lane (if adopted) and any valuation range, so that one package is accountable for not
letting "worth" bleed into "power."

**M&A package boundary (#11-#13).** Owner direction I explicitly asks the research to find "the best
package boundary and shape," not to assume all of M&A belongs in P15. The comp-ma.md staged model
already answers this: Stage 1 (bankruptcy asset auction) is a *consequence of closure*, small enough
to belong inside P15B alongside settlement; Stages 2-3 (label acquisition, healthy M&A) require a
persistent ownership edge and a valuation model that is a materially larger system than anything else
in P15A/B/C. Recommendation: P15B owns Stage 1 only; Stages 2-3 stay P16+ unless the Owner explicitly
wants label persistence pulled forward — see open decision §3.5.

---

## 2. Corrections table

Consolidated from `prior-claims.md` (118... actually 160 machine-counted rows across topics A-M),
every Phase-1 report's own corrections section, and the verification digest. Deduplicated to the
substantively distinct claims; citation-only line-number slips are merged into their parent row unless
the mislocation itself changes evidentiary weight. Ordered: (I) direction-collision supersessions —
the highest-consequence corrections, since they change what P15 *is*; (II) code-currency corrections;
(III) original-game corrections; (IV) comparator corrections; (V) code-seam and citation nuances that
change how a builder must read the shipped surface.

### I. Direction-collision supersessions (what the new Owner direction actually overturns)

| # | Prior claim (doc §) | Verdict | Evidence | Consequence |
|---|---|---|---|---|
| 1 | Player has no mandatory hard-bankruptcy game-over; terminal law must be "called asymmetric," never symmetric (`P15-PACKAGE.md §11 law 5, §16-17`; `OWNER-RULINGS-HOLLYWOOD-HORIZON.md §3`) | **SUPERSEDED BY OWNER DIRECTION** (E) | prior-claims D2/D9/E1-E4/E7-E8 collision cluster; direction E text | Player studio can now ultimately fail with warning + recovery first; the *pre-terminal* symmetry principle and remedy-family law (equal eligibility/cost/timing for player and rival) **survive unchanged** — only the terminal boundary reverses |
| 2 | "Minimum three active AI rivals" / active-rival floor prevents "an empty century" (`P15-PACKAGE.md §23`, ROADMAP §19.3) | **SUPERSEDED BY OWNER DIRECTION** (G) | prior-claims D10-D13, D18-19, D22, G1, G4-G5, G7 | No automatic replacement studios; consolidation is acceptable emergent history; report severity, do not silently floor. **Was never Owner-approved law to begin with** — it was a PRELIMINARY RECOMMENDATION (see row 47 below) |
| 3 | "Loans, bailouts, investors, forced sales, or acquisition are not implied" (`P15-PACKAGE.md §16`); debt/equity parked P16+ (§25; RULINGS §5) | **SUPERSEDED BY OWNER DIRECTION** (F, I, C) | prior-claims B4-5, B8, B13, C1-2, F1-2 | Loans now in scope (simple system, P11-owned math); valuation now in scope now (§1 #3-4); the constraints that **survive**: literal P11 accounting (obligations beside cash, never secretly subtracted), hidden rival cash stays private absent a new disclosure rule, symmetric remedy law |
| 4 | "Corporate title grants no acquisition/merger/stake/subsidiary/co-production authority; those remain P16+" (`P13-P15-OWNER-RULINGS §4.2`) | **QUALIFIED, not fully superseded** | direction I: "eventual ability... do NOT assume the whole M&A system belongs in core P15" | The clarification's *substance* stands (Corporate Hollywood alone still authorizes nothing); direction I only removes the *permanent* framing and asks for a scoped boundary — see §1 #11-13 |
| 5 | Post-2040 Endless Mode "remains undecided. P15 may not silently create or authorize it" (`P13-P15-OWNER-RULINGS §4.3`) | **SUPERSEDED BY OWNER DIRECTION** (K) | prior-claims K1-2, K5-6, K9 | Decided: Endless Sandbox, must not rewrite the frozen 2040 Legacy. ROADMAP §21's eight design questions (catalogue supply, entrant/retirement generation, era presentation, market normalization, awards cadence, balance, save compatibility, achievements) remain **open**, not answered by the decision to have the mode at all |
| 6 | Power Ranking definition = three lanes only (commercial/prestige/delivery), explicitly excludes cash/valuation (`P15-PACKAGE.md §23`, §12.2) | **SUPERSEDED BY OWNER DIRECTION** (B), partially | prior-claims B4-5, B8; digest confirms no financial lane exists in shipped `bridge/industry.ts` lanes either | A fourth (financial) lane, a separate Valuation board, or a partial hybrid are all still open — see §3 below; "never reads Standing... or a client calculation" as an engineering rule likely survives even if the *category* (financial strength) is re-admitted |
| 7 | Settlement invariants ("projects, obligations, contracts, people, films, identity and public history resolve or persist explicitly") apply only inside P12's already-allowed rival-failure law (`P15-PACKAGE.md §12.3`) | **CONFIRMED, unchanged** | direction D/H confirm rather than collide | "Auction" (direction D/I) is a *new* settlement mode layered on an unchanged invariant, not a replacement for it |

### II. Code-currency corrections (research written against `7811377`/save V15, now checked against `592e926`)

| # | Prior claim (doc §) | Verdict | Evidence | Consequence |
|---|---|---|---|---|
| 8 | Accepted TypeScript base is `7811377` (PKG/ANNEX/ROADMAP headers) | **CORRECTED** | Accepted runtime is `592e926` (P12-R05 acceptance receipt, 2026-09-11); Unity build `deca3952` | Every "current code" claim below this line must be re-based; this alone invalidates roughly a third of the L-section of prior-claims.md as written |
| 9 | "Accepted save generation is V15" (`P15-PACKAGE.md:362`) | **CORRECTED** | Live inner save is **V19** (`save.ts:363` `SaveFileV19`; V16 `releaseAuthority`, V17 `studioHistory`, V18 `foundingRegime`, V19 `hollywood` added since) | Any P15 additive root is a **V20** step; see row 22 for the exact downgrade-refusal pattern it must follow |
| 10 | `src/core/ledger.ts`, `src/core/theatrical.ts`, `src/core/events.ts` are existing seams (`P15-PACKAGE.md:352,356,358`; annex `:607,610`) | **CORRECTED (path)** | None of the three files exists at 592e926. Ledger = `state.ledger` type family (`types.ts:352-465`) written by `tick.ts`/`actions.ts`/`placement.ts`/`sets.ts`; theatrical-run law = `economy.ts:53-92`+`tick.ts:743-775`+`studioRunRecap.ts`+`studioWeekTheater.ts`+`releaseAuthority.ts`; event roots = `studioEvents.ts`+`studioHistory.ts` | Any P15 doc still citing these three paths as "existing" will send a builder to files that do not exist |
| 11 | "Rival studios/projects absent at accepted base; P12 designed only" (`P15-PACKAGE.md:359`); "accepted code 592e926 has no rival studio... anywhere" repeated verbatim by one Phase-1 report as a fresh grep result | **CORRECTED — strongly** | 592e926 ships a **nine-studio fictional rival ecosystem**: `StudioIdentity(role player\|rival)`, `RivalBusiness`, `RivalAccount`, scheduled arrivals `RIVAL_ARRIVAL_WEEKS=[0,0,0,0,520,988,1560,1872,2548]` (`calendar.ts:3`), rival film output with genre affinities, and a chart recomputed every 13 weeks (`hollywoodTick.ts:306-313`) | Do not describe rivals as a P15 greenfield build; P15 extends an existing, Owner-accepted ecosystem — the gap is a *shared market law* (competition, saturation, failure), not rival existence |
| 12 | "Three Standing channels... P12 must generalize Standing per studio; P15 never blends" (`P15-PACKAGE.md:355`) — and prior-claims' own first-pass flag that per-studio Standing was probably **not** generalized | **CORRECTED** | `RivalBusiness.standing: Standing` (`hollywoodTypes.ts:83`), updated per rival by the same `updateStanding` on `filmReleased` (`hollywoodTick.ts:19,250`, drift `:277-278`); `HollywoodChartSnapshot` rows carry per-studio standing (`:104`) | P12 already delivered per-studio Standing; only the "Standing is not rank" *law*, not the data, obstructs a Standing-sourced Power Ranking lane |
| 13 | "Current code has no authoritative rival market, Power Ranking, corporate-state, acquisition, co-production, or 2040 finale model" (`P15-PACKAGE.md:368-369`) | **QUALIFIED** | Still true for Power Ranking/corporate-state/acquisition/finale; but `bridge/industry.ts` ships **Studio Charts**: a query-time, per-lane rank/priorRank/movement over four lanes (`audienceAwareness, industryPrestige, commercialConfidence, output`; `industry-schema.ts:3`), recomputed live and quarterly-snapshotted | This is a **standing-derived rank display already in front of players**; P15A.2 must be specified relative to it (reconcile, retire, or relabel it), not designed as if the slot were empty. It is a query-time, unpersisted, unversioned read model (in tension with the P12 annex's own "do not recompute in the client or after every release," `BUILDER-ANNEX.md:350`) |
| 14 | No Industry Pulse / activity-feed surface exists yet ("future P15 surface," `P15-BUILDER-ANNEX.md:885-894`) | **QUALIFIED** | An **Industry Pulse view already exists** on the bridge (`bridge/industry.ts:183-186`, 13-week grouped activity, notice: "Grouped material activity for the last 13 campaign weeks. Routine phase changes and ordinary renewals are omitted.") | Any P15 notice mechanism (§1 #10) **extends**, does not create, this surface |
| 15 | Phase-order catalogue (`phaseId`/`phaseOrdinal`/`phaseOrderVersion`) is a binding P15A.1 prerequisite (`P15-PACKAGE.md §18.1`; ROADMAP §11.0) | **CONFIRMED unmet** | Direct grep of `src/` and `bridge/` at 592e926: zero hits for all three symbols | The prerequisite is real and outstanding; a P15 build either schedules this infrastructure first or the Owner explicitly waives it (§1 row 17) |
| 16 | competitionFactor / competingSlate are inert placeholders (`P15-PACKAGE.md:353-354`) | **CONFIRMED** | `reception.ts:679 const competitionFactor = 1.0`; `worldgen.ts:645 competingSlate: []` | Still true at 592e926 — this is the actual gap P15A must fill, distinct from row 11's rival-existence correction |
| 17 | "P08 Awards / Standing / History... consumes awards" (`P15-PACKAGE.md:41,142`) | **QUALIFIED** | Standing and History are implemented; Awards remain a stub only (`blueprintRequirements.ts:62-66`, "Awards are not part of the game yet.") | Any Power-Ranking "prestige/honors" lane sourced from Awards has no data yet; a Standing-sourced honors lane is the only currently-fed option |
| 18 | "P15B cannot infer debt, valuation, insolvency, or an acquisition price from the present ledger; P11's runway selectors are incomplete" (ROADMAP §5.3) | **QUALIFIED** | P11-REQ-006/007/009 are now PROVEN; `weeklyBurn` already includes facility Opex (`economyView.ts:69-72`). The runway is complete on its stated (constant-burn) basis, but remains a *display selector*, not authority (`employment.ts:73-76`), because it still ignores scheduled obligations and has no due-payment concept | The dependency statement is still directionally true (no debt/valuation/insolvency truth exists), but its stated *reason* (incomplete arithmetic) is stale; the real reason is a missing liabilities register, not a bug |
| 19 | "Rivals cannot receive secret cash" (`P15-PACKAGE.md:397`) | **CONFIRMED** | Only rival inflow is `studioRevenue` via `moveRivalMoney` (`hollywoodTick.ts:267`); validated every period (`hollywoodValidation.ts:221-226`) | Still true; any loan/rescue mechanism for rivals must go through this same reconciled path |
| 20 | `StudioIdentity` has no dormant/closed status field (`P12-TO-P13-PRODUCER-HANDOFF.md:27`) | **CONFIRMED** | `hollywoodTypes.ts:6-17` — exact-key type, no status field beyond `enteredWeek`/`recordedFromWeek` | Any distress/closure state is a **new field**, and because the identity is exact-key validated (`hollywoodValidation.ts:75`) and version-pinned (`hollywoodValidation.ts:209` for policy; save V19 for the root), it is a versioned/additive change, never an in-place widen |
| 21 | "Every older migrateToVn refuses to downgrade V19" | **CORRECTED** | Only `migrateToV13`-`migrateToV18` carry an explicit `"cannot downgrade SaveFileV19"` throw (`save.ts:7072,7139,7147,7160,7176,7202`); `migrateToV12` (`:7046`) only names versions 13-18, **not 19** — a V19 save fed to `migrateToV12` falls through and fails with a non-specific shape error, not a clear refusal | A P15 V20 step must mirror the same pattern (add explicit "cannot downgrade V20" refusals to `migrateToV13`...`migrateToV19` only), not assume the whole chain is already covered |
| 22 | (New pattern documented here for the builder) The V19 additive-root pattern | **CONFIRMED — reference pattern for any P15 root** | `validateSaveV19` (`save.ts:~7248`) checks `Object.hasOwn(raw,'hollywood')`, throws `'Hollywood root missing'` if absent, then delegates the rest to the frozen `validateSaveV18` unchanged; `convertV18ToV19` calls `initializeHollywood` | A P15 V20 root follows the same shape: one new top-level key, a presence check, delegation to the frozen V19 validator for everything else, and the six-migration downgrade-refusal pattern from row 21 |
| 23 | `StudioIdentity` / `RivalBusiness` / rival `policy` are freely extensible objects | **CORRECTED** | All three are **exact-key validated**: `exact(s,['studioId','role','row','name','mark','color','founding','eligibleWeek','enteredWeek','recordedFromWeek'])` (`hollywoodValidation.ts:75`); `exact(b,[...13 keys...])` (`:204`); `exact(b.policy,['version','affinities','negativeScale','marketingRatio','reserveWeeks'])` with `b.policy.version === 1` pinned (`:208-209`) | Any new field on any of these three (a distress status, a loan balance, an ownership edge) requires updating the exact-key list **and** is therefore a versioned change with a migration story, not a quiet addition |
| 24 | `IndustryReceipt` is an open/extensible event log | **CORRECTED** | It is a **closed union of exactly five kinds** (`studioEntered\|employment\|filmAnnounced\|filmReleased\|filmSettled`, `hollywoodTypes.ts:96-103`) | Closure/distress/settlement/loan events are new union members — a schema change, and every downstream consumer that switches on `kind` needs updating |
| 25 | Campaign-library storage accepts arbitrary save shapes | **CONFIRMED (pattern, not a correction)** | `campaign-library.ts:26` — the same exact-key pattern (`Object.keys(value).length!==keys.length \|\| ...throw`) governs the campaign-library envelope | A new save root or campaign metadata field must also update this second, independent exact-key gate |

### III. Original-game corrections (verified against manual/Prima/GameFAQs plain-text extractions)

| # | Prior claim | Verdict | Evidence | Consequence |
|---|---|---|---|---|
| 26 | "Original hard bankruptcy: pre-release wording conflicts with retail-source silence" (implying retail sources say nothing) | **CORRECTED** | Retail sources are **not silent**: manual printed pp.6-7 ("can go into the red... won't be able to build new sets or add certain facilities"; `manual.txt:126-130`) and Prima's "Building in Debt" exception list, printed **p.14** (PDF p.15, not p.13; `prima.txt:769-777`) both affirmatively describe a non-terminal build-lockout state | Reword any P15 text: "the original shipped a documented soft-debt / spending-lockout state, not a bankruptcy mechanic" — silence is not the right frame |
| 27 | Pre-release GameSpot preview: studio "goes bust" (2004-02-23, Andrew Park) foreshadowed a bankruptcy mechanic | **CONFIRMED as pre-release only, dated precisely** | Wayback capture confirms "at least until the studio goes bust," refers to the *player's* studio; GameSpot's 2005-08-19 Updated Impressions already describes the shipped debt-lockout instead — the promise was **abandoned before ship**, not merely unverified | Label this PRE-RELEASE PROMISE, superseded by the shipped mechanic, never a design anchor |
| 28 | Prima Studio Rating weights cited to "pp.45-46" | **CORRECTED (page precision, load-bearing)** | Capital/Movies/Stars 24% each are printed **p.46** (PDF idx 47); Lot Prestige 14% is **p.47** (PDF idx 48); Awards 14% is **p.51** (PDF idx 52, `prima.txt:3181-3182`) — Prima's printed-page footers are one page behind the PDF index throughout | Cite as "pp.46/47/51," not "45-46" — Awards in particular is four pages later than most prior citations placed it |
| 29 | "Capital" (24% of Studio Rating) is a valuation/wealth concept | **CONFIRMED, with correction** | Capital = **literal cash-in-bank**, scored on a nonlinear $50,000-$1,600,000 scale (concave, 50%-point near $300k; "keep more than $1,600,000 in the bank"; `prima.txt:2793-2809`) — never a net-worth or sale-value figure | Any Power-Ranking financial lane modeled on "Capital" should model it as **liquidity/cash strength**, not valuation — reinforces the §1 #3/#4 package split |
| 30 | "Ten-slot Studio Charts including the player" | **CORRECTED — inference, not a stated fact** | Prima states nine named rivals with authored windows (`prima.txt` rival table, printed p.51/PDF 52); "ten slots" is player-plus-nine, an inference from a single 1958 screenshot (nine visible rows), not verbatim text; Prima elsewhere says charts "get longer and longer as more studios enter" (`prima.txt:3163-3164`), in tension with a fixed ten-slot frame | Treat "ten-slot" as LOW confidence; do not cite it as a retail-shipped fixed chart size |
| 31 | Awards factor (14% of Studio Rating) is a cumulative lifetime tally | **CORRECTED** | Awards score from **the most-recent ceremony only** ("won at the most recent award ceremony," `prima.txt:3183-3186`, printed p.51) | This is new supporting evidence that the original already had a *momentum/recency* design in its comparative composite — relevant to Owner direction B's "recent commercial performance" lane and the digest's M11 finding that the Movies factor also decays |
| 32 | Lifetime Honors: Gold/Platinum are a clean two-tier system | **CORRECTED — internal Prima conflict, already logged in-project** | Prima p.14/PDF15 (printed, summary chapter) claims **three** Lifetime Achievement tiers including one for "getting a studio to 2005"; the detailed Awards chapter, printed **p.80** (PDF 81), describes only **two** scored tiers and states nothing is awarded for merely reaching 2005; the project's own `lifetime_honors.csv` notes already record this exact conflict, with detailed-chapter-over-summary as the resolution rule | For any 2040 finale/Legacy framing that cites the original's tier structure, use the p.80 two-tier reading and flag the p.14 summary as an internal Prima inconsistency, not a third source |
| 33 | No original-game evidence connects debt to the game's own data model, only to prose | **CORRECTED — new evidence** | The recovered technical artifact register records `availableindebt=1` as a per-blueprint flag on exactly the core-loop facilities (community-mod-derived schema, `THE-MOVIES-2005-TECHNICAL-ARTIFACT-REGISTER.md:49`, `TECH-SCHEMA-004`) — matching Prima's exception list | TECHNICAL ARTIFACT / community-mod tier, not retail-official, but it corroborates that the original's *data model* — not just its prose — had a debt-aware gate; strengthens (does not replace) the manual/Prima evidence in row 26 |
| 34 | "No inspected source establishes rival bankruptcy/closure/replacement" | **CONFIRMED** | Grep of manual/Prima/both GameFAQs FAQs/gamepressure for bankrupt/bust/out-of-business/close-down/takeover: no relevant hits at any tier including the Stunts & Effects manual and community wikis | Rival closure (direction D) is confirmed successor design with **zero** original-game parity claim available or needed |

### IV. Comparator corrections (modern games — re-verified against primary sources this pass)

| # | Prior claim | Verdict | Evidence | Consequence |
|---|---|---|---|---|
| 35 | Football Manager comparator "covers transfer/finance context only"; atlas has "no management-sim distress comparator" | **CORRECTED (retracted)** | The official FM24 feature page (fetched, HTTP 200) documents a genuine staged ladder: negative-transfer-budget inbox item → board takes control after an agreed period and sells players → administration news item with net-debt/P&L graphs and withdrawn transfer funds → PFA transfer embargo until wages are repaid → a Company Voluntary Agreement letting an insolvent club keep operating | FM24 **is** a legitimate official warn→typed-remedy→escalation→administration comparator; only the 9-point-deduction/repeat-administration specifics remain community-tier |
| 36 | OpenTTD: a hostile takeover/company purchase transfers the target's loan to the acquirer | **CORRECTED** | At the pinned commit, `DoAcquireCompany` only transfers assets and deletes the company; `CmdBuyCompany` charges a price computed from `CalculateCompanyValue(c, false)` (loan **excluded**) or `CalculateHostileTakeoverValue` (which *prices in* the loan as part of the takeover cost); no `current_loan +=` line exists anywhere in `economy.cpp`/`company_cmd.cpp` outside the player's own borrow command | Any "auction"/acquisition design (§1 #11-12) should price debt into the transaction, not silently transfer a loan balance to the buyer |
| 37 | Capitalism Lab "Playing Without a Company" is a shipped, viable continuation pattern supporting a no-mandatory-game-over design | **CORRECTED** | The page describes the **upcoming Billionaire Life DLC** ("(In Development)" on the official forum index; developer's own words "the upcoming Billionaire Life DLC") — a pre-release feature preview, not shipped behavior | Downgrade to DEVELOPER PRE-RELEASE FEATURE PREVIEW; Offworld Trading Company's shipped AI-run subsidiary (Designer Notes #17, 2016) remains the only confirmed shipped example of this pattern |
| 38 | Capitalism Lab's bankrupt-rival acquisition offer ("distressed companies are cheap") is base-game/baseline behavior | **CORRECTED** | It exists only under the optional **"Acquire Companies Facing Bankruptcy"** new-game setting inside the Banking and Finance DLC | This is still a genuine shipped instance of the §1 #11 Stage-1 shape, just opt-in-DLC tier rather than baseline — cite it that way |
| 39 | Civ VII's "grab Legacy Path achievements during One More Turn" lesson (from 1.2.0) still describes current behavior | **CORRECTED** | Civ VII 1.4.0 "Test of Time" (2026-05-19 patch) replaced Legacy Paths with **Triumphs**; the underlying lesson (continuation preserves achievement/legacy progress) survives — "One More Turn after winning" is reconfirmed in 1.4.0 notes — but the specific mechanic name is stale | Cite Civ VII only for the general lesson (progress possible during continuation), not for "Legacy Paths" as a current noun |
| 40 | (New comparator, previously entirely absent from the atlas) Rival bankruptcy with a bounded return | **NEW EVIDENCE — should be added to the comparator register** | **Blockbuster Inc.** (2024), official 1.9.0 patch notes (2024-10-28): "Rival studios can go bankrupt, pausing operations for a year before returning"; Studio Charts show active/bankrupt status and a bankruptcy count; shares in a bankrupt studio are lost | This is the closest shipped precedent for a bounded, non-permanent rival dormancy-with-return — directly relevant to the open dormancy question (§3.6) and should be cited alongside OpenTTD/GearCity in any P15B ladder design |
| 41 | GearCity takeover-price formula = "1.1x evaluation (unprofitable) / 1.2x evaluation × (1+EPS/10), share price ×1.75" | **CORRECTED** | Official wiki source: `((1.1×Eval/Shares_Needed)/5 + 1.3×PricePerShare)×Shares_Needed×Difficulty` (EPS<-0.5) or `((1.2×Eval/Shares_Needed)/2.5 + 1.75×PricePerShare)×Shares_Needed×(1+EPS/10)×Difficulty` otherwise — the prior citation dropped the `/5` and `/2.5` divisors, overstating the evaluation component roughly 2.5-5× | Any future formula citation for P16+ must use the corrected divisors; the qualitative "premium over market" conclusion is unaffected |
| 42 | Offworld Trading Company anti-snowball = "double price for third-party-held shares" | **CORRECTED** | That was the **abandoned initial design** (Designer Notes #17); the shipped system is a rising per-share price, a final-five-share block purchase, and +20% per third-party-held share | Cite only the shipped mechanic for any P16+ healthy-M&A design |
| 43 | Simutrans player-ranking ties break on the prior year | **CORRECTED** | Code compares `years_back − 1`, i.e. the **more recent** year; with "This Year" selected there is no year tie-break at all | Minor, but relevant if P15A.2's tie rule is ever compared to Simutrans as a precedent |

### V. Seam and citation nuances (change how a builder must read the shipped surface)

| # | Prior claim | Verdict | Evidence | Consequence |
|---|---|---|---|---|
| 44 | "Insolvent rival becomes a de facto zombie... no event, no signal" | **CORRECTED** | Every voluntary rival commitment is already gated on `cash − reserve` (`hollywoodTick.ts:98,126,156,176`; commission reserve computed at `:197`); as the roster drains, expiring contracts surface publicly today as "contract ended" activity rows (`bridge/industry.ts:93`) | There is already an indirect public signal and a real stall threshold (below `operatingReserve`, 12-20 weeks of cost); P15B's "warning" stage is a **labelling and disclosure** layer on an existing mechanism, not new plumbing from zero |
| 45 | "No code anywhere reacts to the player's cash crossing zero" | **CORRECTED** | The presentation stop ladder already treats a negative-cash crossing as a governed event: `adapter.ts`'s `'cashNegative'` stop reason (`:2563`, fires at `:2791-2792` when `after.cash<0 && before.cash>=0`), alongside the `SIM_CAP=520` batch guard | This is the natural P15B pre-terminal-warning UI seam — it stops an advance-loop, it does not gate anything financially, but it is exactly where a "you are now in the red" notice would attach |
| 46 | "cash<0 unlocks nothing, locks nothing, nothing changes" | **CORRECTED** | At `cash<0`, `canAfford` already refuses **every** positive-cost voluntary commitment (greenlight, signing/renewal, publicity, placement, set commission/repair) via `after = cash − amount < 0` for any `amount>0`; only zero-cost mutations pass | The original's manual-described build-lockout (row 26) already has a partial code analogue today — P15B's Distress stage should be understood as *formalizing and disclosing* this existing lockout, not inventing a new one |
| 47 | "Minimum three active AI rivals" is P12 Owner law | **CORRECTED — traced to source, downgraded** | The actual source is the P12A decision register, SIM-015: "Use three rivals for bounded P12A proof; treat roughly 6-10 active AI rivals as later operating target and 12 as stress, **not Owner law**"; PERF-001 repeats the 6-10/12 envelope | It was always a design/benchmark bound, never Owner-approved law — which makes direction G's removal a smaller correction than the prior documents' phrasing implied |
| 48 | "Rival zero-employee weekly burn is ~38,500" cited as *the* rival burn rate | **CORRECTED — floor only** | 38,500 = `OVERHEAD_BASE` 15,000 (`tuning.ts:419`) + facility opex 9,000+5,000+4,000+5,500 = 23,500 (`tuning.ts:686,699,710,731`); while the six 208-week entry contracts run, payroll + `1,500`/employee overhead (`tuning.ts:420`) add on top | Do not use 38,500 as a steady-state distress threshold input — it is a lower bound only |
| 49 | Greenlight gates on "expected operating margin beats holding" | **CORRECTED** | The actual gate (`hollywoodPolicy.ts:59-60`) is a **preference-adjusted score** (expected margin minus a marketing-ratio preference cost) versus the hold margin, not the raw margin | No change to conclusions, but any P15B rival-policy extension must hook the adjusted score, not raw margin |
| 50 | `SET_WEEKLY_MAINTENANCE_COST: 0` is an unverified original-game claim | **CORRECTED — verifiable, and the code comment is stale** | Verified locally: `TECH-SCHEMA-001 purchasecost=44444, annualcost=0, dailyrate=0` (community-mod-derived register); but `tuning.ts:749-753`'s own comment claiming the zero is "charged through the ordinary weekly path, and invariant-checked" is **false** — no reference outside `tuning.ts` exists | Flag the comment as stale in any future finance work; the zero itself is a named, deliberate placeholder consistent with the original |
| 51 | (New, unflagged before) `RivalMoneyKind` has a "development" category that is fully wired | **CORRECTED — second named zero found** | `'development'` is declared and validated (`hollywoodTypes.ts:48`; `hollywoodValidation.ts:242`) but **no code path ever moves money into or out of it** (grep: zero `moveRivalMoney(...,'development',...)` call sites) | A second dormant/placeholder financial category exists beside `SET_WEEKLY_MAINTENANCE_COST`; any P15B rival-side loan/investment design should decide whether to activate this slot or add a new one |
| 52 | `Object.hasOwn`/exact-key validators make P15 additions structurally hard to add safely | **CONFIRMED as the correct reading, restated precisely** | See row 23 — three independent exact-key gates (`StudioIdentity`, `RivalBusiness`, rival `policy`) plus the closed `IndustryReceipt` union (row 24) plus the save-envelope exact-key gate (row 9/22) plus the campaign-library exact-key gate (row 25) | Any P15 field/event/root touches **up to six** independent validators; a builder's task list should enumerate all six explicitly rather than "update the type" |
| 53 | D-16 lab's insolvency-absorption measurement is cited at `docs/D-16-ECONOMY-RECOVERY-DECISION-LAB.md:98` | **CORRECTED (citation)** | The sentence ("Insolvency is mechanically absorbing while anyone is employed... weekly self-transition 99.69%...") is at **line 100**; `:98` is a section heading | Substance unaffected, but the underlying measurement was taken pre-P12/pre-D-17A/B on a different base and is not re-verified numerically at 592e926 — see uncertainties §4 |
| 54 | `bridge/industry.ts` "there is no combined Power score" notice is at line 117 | **CORRECTED (citation, load-bearing)** | Verbatim text — *"Public facts only. Standing channels and film measures have separate meanings; there is no combined Power score."* — is at **line 110** (the `IndustryPage` result literal); `:117` is the `period==='recent'` output-lane branch | P15A.2 must explicitly reconcile with this exact shipped sentence, which a builder should be able to find on the first try |
| 55 | `src/core/newspaper.ts:30` carries the masthead "The Silver Screen Gazette" | **CORRECTED (trivial)** | `NEWSPAPER_MASTHEAD = 'The Silver Screen Gazette'` is at line **31**; `:30` is a comment | No substantive effect |

---

## 3. Genuine remaining Owner decisions

Only decisions the new direction leaves open and that materially change scope, package boundary, or
tuning. Ordered roughly by how many downstream rows in §1 they block.

### 3.1 Exact shared-market window and decay curve (blocks #1)
**Options:** same-week batch only; ~4-week window (current working assumption); a full quarter;
run-overlap (actual theatrical-run intersection) instead of a fixed window.
**Recommendation:** keep the ~4-week working assumption as PROVISIONAL and let P15A.1's bounded
two-release checkpoint (already Owner-approved, A2) measure it empirically before fixing the constant;
the original gives no recoverable window/curve numbers at all (M3/M9 CONFIRMED — Prima states *that*
saturation existed, never *how fast*), so there is no parity anchor to defer to.
**Blocks:** the exact P15A.1 formula choice (§1 #1), which the package doc itself calls the one item
that blocks the whole checkpoint (`P15-PACKAGE.md §23`).

### 3.2 Financial lane vs. separate Valuation/Net-Worth board (blocks #2, #4)
**Options:** (a) a fourth Power-Ranking lane scored from #3's book net worth; (b) a wholly separate
"Studio Value" board beside Power Ranking, never blended into it; (c) a partial hybrid — a *coarse*
financial band (e.g., Strong/Stable/Strained/Critical) inside Power Ranking, with the actual number
only on the separate board; (d) no financial signal in Power Ranking at all, valuation shown only on
its own screen.
**Recommendation:** (c). Comp-ranking.md's synthesis is explicit that every comparator which shows
wealth and power on the *same* surface (a blended composite) invites exactly the "fancy number that
doesn't matter" dismissal (MGT2) or the cash-defines-everything reading the Owner wants to avoid ("do
not assume wealthiest = most powerful"); every comparator that keeps them on *separate* surfaces
(OpenTTD graph vs. league table; GearCity Evaluation vs. Market Cap; Capitalism Lab Corporate Rankings
vs. Billionaires list) reads as more legible. A coarse band satisfies "financial strength represented
somewhere meaningful" without re-introducing a blended composite.
**Blocks:** the exact Power-Ranking lane/band definition (§1 #2) and whether P15D (§1 #4) is a
required package or an optional later one.

### 3.3 Disclosure of rival financial condition (blocks #2, #6, #10)
**Options:** fully private (status labels only — "in distress," no numbers); a banded public proxy
(e.g., the coarse band from §3.2, no exact figures); full public disclosure once a rival enters
Distress or worse; full public disclosure always (parity with OpenTTD, which makes every company's
detailed rating and value public).
**Recommendation:** banded proxy, private until Distress, full disclosure only inside a closure/auction
settlement event (where a figure becomes load-bearing for #11's frozen price). This matches P12's
existing law that rival Cash/salaries/policy/forecasts stay hidden (`ANNEX F.2`) and P12A's disclosure-
threshold rule (UX-010: "distress becomes public only after an authoritative disclosure threshold").
**Blocks:** the financial Power-Ranking lane/band (§3.2), the industry-notice content (§1 #10), and
whether a "public gross ≠ Cash/Contribution/profit" line (already project law) needs an explicit
exception for the closure/auction moment.

### 3.4 Player terminal structure (blocks #8)
No pre-existing labeled A/B/C/D exists in the authority docs; these are candidate structures
synthesized from the comparator evidence for the Owner to choose among:
- **A — Revised-protected continuity.** Add loans/distress/recovery, but the player studio still
  never legally closes; the worst state is permanent, disclosed Administration ("lose control, keep
  the studio" — D-16 R10's own phrase). Closest to the *pre*-direction-E baseline, now applied past
  the point where a rival would have closed.
- **B — Recoverable administration floor (no hard game-over ever).** Same as A, formalized as the
  named terminal stage of the 4-5-stage ladder (finance-logic.md §2.3: Stable→Warning→Distress→
  Administration→Dormancy), where Dormancy for the player is *always* re-enterable, never archived.
- **C — Full symmetric closure.** The player studio can actually close/settle/archive exactly like a
  rival (true parity with direction D's rival ladder), ending that campaign identity; continuation, if
  any, is a new studio or a Legacy-dossier-only epilogue.
- **D — One authored second chance, then true closure.** A single, disclosed, non-repeatable rescue
  event before Administration can become terminal (Anno 1800's Archibald Blake pattern; Game Dev
  Tycoon's one bailout), after which Structure C applies.
**Recommendation:** **B**, matching D-16 R10's own philosophy ("KEEP THE STUDIO, LOSE CONTROL") most
literally and requiring the least new machinery (no settlement/archive/talent-release manifest for
the *player* case, since the studio never actually stops existing) — while still satisfying direction
E's demand that "negative cash = game over" never be the mechanism and that warning/recovery come
first. **C is the most consequential option** (it requires the full P10/P11/P12/P14 settlement
manifest applied to the player, which nothing else in the project currently exercises) and should not
be adopted without a dedicated design pass; note that the original's own reception ("nearly impossible
to actually lose," IGN 2005-11-09, contemporary professional tier) was read as a forgiving strength,
not a flaw, which weakly favors B/D over C.
**Blocks:** §1 #8 entirely; whether a P10/P11/P12/P14 settlement manifest is ever exercised against
the player identity.

### 3.5 Loan product count and whether interest accrues on negative cash (blocks #5)
**Options:** one product (a single capped revolver, replacing the silent overdraft — OpenTTD pattern);
2-3 fixed-tier amortizing products unlocked by scale (Cities: Skylines/Two Point Hospital pattern);
a research-gated credit ladder (Hollywood Animal pattern); a fuller multi-instrument stack (bonds,
IPO, credit rating — GearCity/Capitalism Lab pattern).
**Recommendation:** the 2-3 fixed-tier amortizing set from finance-logic.md §3.6 (Operating line,
Facility mortgage, Production bridge), each a *known obligation beside Cash* with a published rate and
term — no credit-rating simulation, no revolving-balance gaming. **Interest should accrue on any
negative cash the moment loans exist**, converting the current silent, interest-free overdraft into a
named, capped, interest-bearing line (finance-logic.md §3.5); this is also the only way to give the
warning ladder (§1 #6) a real object to point at, since today nothing "falls due."
PROVISIONAL illustration (finance-logic.md `loan_tables.py`, HYPOTHETICAL, not tuning): a $5,000,000
Facility-mortgage tier at 8%/10yr costs $13,976/week — nearly doubling the $15,000 `OVERHEAD_BASE`;
a $1,000,000 Operating-line tier at 8%/5yr costs $4,669/week, about 31% of base overhead. These are
scale checks only, illustrating that even the smallest proposed tier is already felt against current
tuning (`INITIAL_CASH` $20,000,000, `OVERHEAD_BASE` $15,000/week).
**Blocks:** §1 #5's exact schema (how many rate/term/security fields a loan object needs) and whether
a rescue-tier loan (finance-logic.md's Tier D, "creditor-dictated," available only in Distress) is in
scope for P15B's remedy-family list.

### 3.6 Whether rivals borrow, symmetrically (blocks #5, #6)
**Options:** rivals never borrow (only the player can — an explicit, disclosed asymmetry); rivals
borrow under the identical product/covenant law via deterministic P12 policy (full symmetry, matching
the project's existing remedy-family symmetry law); rivals borrow only as part of an authored rescue
event (Hollywood Animal's rival-head-borrows-from-player pattern — a *relationship* event, not a
generic product).
**Recommendation:** full symmetry (same tiers, deterministic selection policy) for the pre-terminal
ladder, since the project already commits to identical eligibility/cost/timing/effect for player and
rival remedies (`P15-PACKAGE.md §17`); an asymmetric loan product would be the first remedy-family
exception and would need its own justification.
**Blocks:** whether §1 #5's schema needs a `studioId`-agnostic design from day one.

### 3.7 Auction bidder order and eligibility (blocks #11)
**Options:** merit order by an existing public metric (OpenTTD: highest performance rating first);
player-first refusal (GearCity pattern); simultaneous sealed offers; no player eligibility at all
(assets go to an abstract market sink, avoiding any ownership-transaction question).
**Recommendation:** player-first refusal within a short window, then merit order among remaining rival
studios (blends GearCity's shipped pattern with OpenTTD's precedent while keeping the player experience
central) — but flag that OpenTTD's actual rotation asks the *best-performing* company first, which is
a leader-first, not an anti-snowball, rule; if the design goal is to prevent the strongest rival from
compounding its lead via cheap asset lots, an explicit weighting away from the current leader may be
needed.
**Blocks:** §1 #11's settlement receipt shape (who is a legal party to the transaction).

### 3.8 M&A package placement for Stage 2 (label acquisition) (blocks #12)
**Options:** P16+ in full (recommended default in §1); a scoped P15D extension that ships label
persistence (name/mark/history continuity) without full valuation machinery, reusing #4's range as the
price input; deferred indefinitely pending P16+ prioritization.
**Recommendation:** default to P16+ as stated in §1, but flag that if the Owner wants *any* acquisition
capability inside the P15 window, Stage 2 (not Stage 3) is the cheapest version — it needs only a price
formula and an ownership edge, not a refusal function, cooldown, or antitrust flavor.
**Blocks:** whether a "buy studios" feature ships alongside the 2040 finale or only after it.

### 3.9 Dormancy's existence between insolvency and closure (blocks #6, #7)
**Options:** keep dormancy as a genuine non-terminal branch (recoverable, indefinite, preserved
identity — the P15-BUILDER-ANNEX's existing model); drop it, going straight from severe distress to
insolvency/closure for rivals; keep it only as the *player's* terminal floor (§3.4 option B) and give
rivals a bounded dormancy-with-return instead (the newly-found Blockbuster Inc. one-year-pause pattern,
row 40).
**Recommendation:** the third option — dormancy survives as the player's permanent floor (B) and as a
**bounded**, disclosed rival state with an automatic return-or-close resolution after a fixed window,
rather than an indefinite rival limbo. This directly uses the one shipped precedent found for exactly
this shape (Blockbuster Inc.'s one-year pause-then-return) and avoids an open-ended "zombie rival"
state nothing in the evidence base recommends.
**Blocks:** the closure state machine's exact transition set (§1 #6/#7).

### 3.10 Whether the player can fail post-2040 (blocks #8, #16)
**Options:** yes, identically to pre-2040 (no special-casing); no, the player is protected once the
Legacy dossier is frozen (a "victory lap" reading); yes, but only inside Endless Sandbox, never inside
the frozen historical campaign proper (a moot distinction, since the frozen campaign has already ended
by definition).
**Recommendation:** yes, identically — Endless Sandbox explicitly "must not rewrite the frozen Legacy"
(K), which already means a post-2040 failure cannot retroactively change the 1920-2040 interpretation;
protecting the player from the consequences of their own post-2040 play would be an unmotivated special
case nothing in the direction asks for.
**Blocks:** whether Endless Sandbox needs any terminal-law carve-out at all (likely: no).

### 3.11 Whether awards ceremonies continue post-2040 (blocks #16)
**Options:** continue on the same quinquennial cadence, generating new (non-canon, clearly labelled)
winners; freeze at the last pre-2040 ceremony and never generate another; continue only if the Owner
authors post-2040 content (which K explicitly says is not required to enable continued play).
**Recommendation:** continue procedurally, explicitly labelled as post-Legacy/non-canonical, consistent
with lesson L7 (comp-finale.md: "do not fabricate future history; procedural must be labelled less-
tested and non-historical") and with K's requirement that Endless not need authored content. No
original-game or comparator source resolves whether the original's own ceremonies fired past 2005
(orig-ending.md open uncertainty #1) — this is a clean-slate design choice, not a parity question.
**Blocks:** whether Power Ranking / honors-lane inputs keep flowing after 2040 (§1 #2).

### 3.12 Whether a monopoly consequence exists (blocks #14)
**Options:** none — direction G already forbids an artificial *floor*, and nothing requires a
*ceiling* either; a soft ceiling (diminishing marginal Power-Ranking/financial-lane returns at extreme
dominance, no hard cap); a hard consequence modeled on GearCity's shipped **Monopoly Lawsuits**
(>75% global market share can trigger a lawsuit that fines 0.3%/turn or breaks the company apart).
**Recommendation:** none required for P15A/B/C; log this as an explicit open question for whichever
package eventually owns consolidation's long-tail consequences (possibly P15D or P16+), since it only
becomes relevant if Stage 2/3 acquisitions (§1 #12-13) are ever authorized and a single studio could
plausibly absorb most of the industry. Comp-ranking.md's own finding is that the *player complaint*
pattern (Transport Fever 2, Railway Empire, OpenTTD) is about **unopposed dominance being boring**, not
about the absence of a mechanical brake — so a *competence* fix (better rival AI, working distress/
recovery) addresses the actual complaint more directly than an anti-monopoly law would.
**Blocks:** nothing in P15A/B/C directly; relevant only if §1 #12/#13 are authorized.

---

## 4. Remaining uncertainties (no source could close these)

1. **Original genre-saturation exposure window and decay curve.** Prima confirms saturation existed
   ("the more tired of the genre the public will get," p.58) but gives no window, no curve shape, and
   no numbers anywhere in the manual, Prima, or either GameFAQs FAQ. The ~4-week P15A working value
   (§3.1) has no parity anchor and must be authored/tuned, not recovered.
2. **Exact opening rival count and any RNG in rival arrival timing.** Prima's rival table plus the
   1925 walkthrough target ("get into fifth place") narrows this to four pre-1920 rivals, but no
   source states whether the original's arrival years were fixed-authored or randomized within a
   window; irrelevant to Project: Studio's own fixed calendar (§1 #14), but relevant to how confidently
   any "original parity" claim about entrant cadence can be made.
3. **Whether any hidden executable bankruptcy remnant existed in the shipped binary.** Retail text
   sources establish only a soft-debt lockout; no inspected source (nor this project's technical
   artifact registers, checked only for the `availableindebt` flag) can prove or disprove a dormant
   binary-level bankruptcy code path. Absence of textual evidence is not proof of absence in the
   executable.
4. **Original Sandbox starting-money bounds.** The commonly repeated $100k/$1M/$10M/$100M list is
   community-synthesis only (TV Tropes-tier); no manual, Prima, or FAQ page gives numeric Sandbox
   starting-money options. Not load-bearing for P15, since Project: Studio's economy is already
   untethered from the original's constants, but flagged so it is never cited as retail-verified.
5. **D-16 lab's insolvency-absorption measurements (99.69% weekly self-transition, week-208 cliff)
   have not been numerically re-verified at 592e926.** They were taken on `main@33eb33a` before P09
   facilities, D-17A/B, and P12; the underlying *mechanism* (mandatory tick debits push cash negative
   unconditionally, `canAfford` refuses voluntary spend below zero) is confirmed unchanged, but the
   specific percentages are not re-run against current tuning constants.
6. **Whether a P15 V20 root's performance profile is acceptable.** The P12-R05 acceptance receipt
   records Save p95 9.58s, serialize+digest p95 199.5ms, and ~37.8MB Hollywood storage per save at
   current scale; the P15-PACKAGE's 16-studio/20k-film and 64-studio/100k-film endurance fixtures were
   never run against 592e926. A P15 root adds to an already-measured-heavy save; no evidence bounds
   the added cost.
7. **GameSpot's full retail walkthrough (page 2) and the IGN/Eurogamer/PC Gamer 2005 previews remain
   partially unfetched** (live URLs 403/paywalled; some Wayback captures found, some not) across
   multiple Phase-1 lanes. Every negative finding sourced to "no inspected retail source" in this
   report rests on the local plain-text extractions plus whatever was independently re-fetched by the
   verification pass — not on a complete retail corpus.
8. **Whether the Federal Reserve's non-participation in the December 2025 OCC/FDIC leveraged-lending-
   guidance rescission changes anything material for the covenant reference points in §3.5.** It does
   not change the illustrative 6× Debt/EBITDA reference point used in finance-logic.md, but the
   regulatory picture (OCC/FDIC rescinded, Fed did not) is unsettled as of this writing and is cited
   here only as a real-world texture note, not as project-governing law.
9. **Whether the shipped `bridge/industry.ts` Studio Charts tie rule (competition ranking: 1-1-3) or
   the P15 candidate's dense-tie rule is the Owner's actual preference for Power Ranking**, given that
   the two now sit on the same screen real estate and currently disagree; no Owner text resolves this,
   and it was out of scope for this report to recommend a specific formula (see the ranking-analysis
   lane's own deliverable).
10. **Whether "P14 absent" dispositions for talent free-agency settlement (§1 #9) should be a
    temporary stand-in that P14 later replaces, or a permanent P12-owned fallback even after P14
    ships.** No authority doc anticipates building P15B settlement before P14 exists; this project
    sequencing question was outside every Phase-1 report's brief.

---

*Sources: `out/phase1/{orig-economy,orig-rivals,orig-ending,code-finance,code-hollywood,
code-standing-history-save,comp-bankruptcy-loans,comp-ma,comp-ranking,comp-finale,finance-logic,
prior-claims}.md`; `out/phase1-verify/_DIGEST.md`; `authority/{P15-PACKAGE,P15-BUILDER-ANNEX,
P13-P15-OWNER-RULINGS,P13-P15-LONG-RANGE-ROADMAP,P12-R05-OWNER-ACCEPTANCE-RECEIPT,
P12-TO-P13-PRODUCER-HANDOFF}.md`; `accepted-592e926/{src/core/hollywoodTypes.ts,
hollywoodValidation.ts,save.ts,calendar.ts,tuning.ts,reception.ts,worldgen.ts,economyView.ts,
studioRunRecap.ts,blueprintRequirements.ts}`; `accepted-592e926/bridge/industry.ts`,
`bridge/schema/industry-schema.ts`, `bridge/runtime/campaign-library.ts`;
`accepted-592e926/docs/{OWNER-RULINGS-HOLLYWOOD-HORIZON,D-16-OWNER-RULINGS,D-17B-OWNER-AUTHORIZATION,
engineering/P11A-DECISION-AND-REQUIREMENT-REGISTER}.md`.*
