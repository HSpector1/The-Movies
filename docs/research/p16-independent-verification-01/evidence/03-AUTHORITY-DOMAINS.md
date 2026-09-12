# Dossier 03 — Project Authority B: Finance, Facilities, Technology, People/Contracts, History, Film Economics

Evidence agent B · P16 Studio Empire / Library / Ownership research · READ-ONLY · 2026-09-11

Authority classes used throughout:
- **CODE** = CURRENT/ACCEPTED CODE: `p12-accepted/` = full tree of commit `13370d428f0693f3279732f6f4cc360a7fcaa4df` (P12 R05 Owner-accepted closeout; `src/` identical to accepted runtime TS `592e926b`).
- **APPROVED DOC** = APPROVED DOCUMENTATION: `p13-docs/docs/design/` (branch `docs/p13-post-p12-launch-preparation-01` @ `4734e409`) and the accepted engineering handoffs/registers under `p12-accepted/docs/`.
- **PKG** = design packages P07–P12 at their research commits (`pkg-docs/docs/design/`), i.e. product law as accepted for their delivered slices; later Owner rulings and code supersede them where noted.
- **OWNER DIRECTION** = Owner-selected new direction recorded in `CODEX-P13-P15-OWNER-RULINGS.md` (rulings) and the P16 assignment.
- **INFERENCE** = this dossier's reasoning; never authority.

Locators are `file:line` inside the scratchpad exports. All paths below are relative to `<read-only research exports: p12-accepted = commit 13370d42, p13-docs = docs at 4734e409, pkg-docs = P07–P12 design commits>/`.

---

## 0. Scope

Assignment §2.C (library value), §2.F (transfer bundle), §2.G (physical property), §2.H (active productions), §2.K (asset sales), §2.N (book net worth vs valuation vs price) and §2.T (package boundary), restricted to what accepted/approved product law already says in:

(a) P11 Finance; (b) P09 Facilities + the three 2026-09-10/11 facility-modernization docs; (c) P13 Technology; (d) P14 Talent / P10 People / P12 employer truth; (e) P08 History/Standing; (f) P07 Film economics.

Out of scope here: original-game reconstruction (Dossier A), comparators, real-world M&A, P15 distress policy beyond its contract-closure hooks.

---

## 1. Method & sources consulted (with what failed)

- Read in full or by section, with line numbers: P11 package + annex; P11A register; P11→P12 and P12→P13 producer handoffs; P11-to-P12 future-consumer contract §§6, 11–16; P09 package + annex (identity/demolish/land sections); `FACILITY-UPGRADES-AND-STUDIO-OVERVIEW-01.md`; `FACILITY-MODERNIZATION-CURRENT-OPS-REVIEW.md` (ownership table); `STUDIO-UPGRADE-AND-RESEARCH-CATALOGUE-01.md` §§4 (CAT-050–056), 8, 11; P13 package §§2, 2A, 3, 11, 11a, 12, 13, 16, 16a, 18, 22–25 + annex §§3.7, 4, 4.3, 7; P14 package §§2, 3, 13, 25 + annex C.7; P10 package §§14–16; P12 package §§30–33 + annex §§D, E, transition event; P08 package §§6, 7, 18, 19, 23, 24; P07 package §§10, 11, 17, 19–23; roadmap §§8, 9, 20; rulings §§2.4, 4, 5; P15 package §§5.5, 12.3, 16, 17, 25.
- Read the accepted code that those documents cite: `src/core/hollywoodTypes.ts`, `industryEmployment.ts`, `hollywood.ts`, `hollywoodTick.ts`, `types.ts` (Contract, LedgerKind, FilmResult, TheatricalRun, Studio, Standing, StudioOperations/StudioFacility, StudioHistoryEvent, GameStateV19), `employment.ts`, `placement.ts`, `tuning.ts`, `financeReport.ts`. Ran a whole-tree grep for debt/loan/liability/depreciation/net-worth/valuation symbols.
- Cross-checked one original-game claim (Prima "Sell Building… depreciated portion") against `original-corpus/prima_eguide.txt`.
- **No web fetches were required**: every claim in this dossier is a project-authority or accepted-code claim. Nothing failed to open. No git commands were run in the local clone; the scratchpad exports were sufficient.

---

## 2. Findings

Format: **claim** — source · locator · proves · confidence · prior-prose status.

### 2A. P11 Finance — debt, ledger grammar, asset value, negative cash, rival finance, summaries, sales/windfalls

**A1. No debt, loan, credit-line, investor, bond or interest instrument exists in code or approved scope; all are Owner-gated.**
- PKG P11 `pkg-docs/docs/design/CODEX-FINANCE-EXECUTIVE-UX-PACKAGE-11.md:48` — "It does **not** currently contain … loans or other interest-bearing debt instruments, investors, taxes, a bankruptcy ending"; `:102` (does not decide "loans, investors, equity, bonds, taxes, inflation, acquisition …"); `:1299-1304` §33 "No current authority exists for loans, credit facilities, interest-bearing debt instruments, investors, equity, bonds, interest, tax, acquisition, or public markets … makes external financing a separate future product/Owner decision"; `:1466-1470` Owner decisions 1–3.
- APPROVED DOC `p12-accepted/docs/engineering/P11A-DECISION-AND-REQUIREMENT-REGISTER.md:140` (`P11-REQ-041` "Loans/investors/external financing require separate Owner gate … OWNER-BLOCKED … DEFERRED"), `:141` (`P11-REQ-042` bankruptcy/recovery OWNER-BLOCKED, dependency "P15 corporate fate"), `:187-191` §4.E items 2–3.
- CODE: `grep -rniE "\b(debt|loan|liabilit|depreciat|netWorth|valuation)\b" src/core/*.ts bridge/*.ts` → 0 hits (the only "depreciation" is a comment in `src/core/tuning.ts:1601`). `RivalMoneyKind` (`src/core/hollywoodTypes.ts:47-48`) is `capacity|signing|payroll|overhead|facilityOpex|development|production|marketing|studioRevenue` — no debt category.
- Proves: the assignment's "DEBT/LIABILITIES" transfer category and "debt needed to finance deals" anti-snowball lever have **no substrate**; any debt concept is new P16 (or P11-extension) authority requiring the Owner gate already named by P11.
- Confidence HIGH. Prior prose: CONFIRMED (roadmap §20 "debt/investor/equity integration if separately approved", `p13-docs/docs/design/CODEX-P13-P15-LONG-RANGE-ROADMAP.md:702`; P15 §25 `…PACKAGE-15.md:847`).

**A2. Ledger grammar = one signed whole-dollar `LedgerEntry` stream typed by `LedgerKind`; categories are exhaustive and closed.**
- CODE `src/core/types.ts:352-364` (`LedgerKindV10`: production, boxOffice, payroll, signingBonus, termination, freelancerFee, studioRevenue, overhead, publicity), `:378-394` (+constructionCapex, facilityOpex, facilityDemolitionRefund, setCapex, setMaintenance, setDemolitionRefund); `src/core/financeReport.ts:6-14` (`FINANCE_CATEGORIES` player labels, e.g. `facilityDemolitionRefund: 'Facility capital recovered'`).
- PKG P11 `…PACKAGE-11.md:260` ("The ledger uses whole-dollar signed entries… `financeTotals()` reconciles the entire retained ledger"); `:311-332` §6 nomenclature (Cash, Theatrical Gross, Studio Revenue Received/Scheduled, Revenue, Expense, Payroll, Studio Operations, Operating cost, Capital spending/Capital recovered, Direct film commitment, Obligation, Weekly operating cost, Net weekly cashflow, Runway, Film Contribution, Immediate commitment, Budget, Refund, Guaranteed salary obligation).
- P11 annex `…PACKAGE-11-BUILDER-ANNEX.md:770` — "Unknown future ledger kind | compile/schema exhaustiveness | no silent `Other` fallback | projection fails build until mapped".
- Proves: any P16 cash movement (sale proceeds, acquisition price, royalty) must be a **new typed `LedgerKind`** with its own correlation ID; it cannot ride an existing kind.
- Confidence HIGH. Prior prose: CONFIRMED (P11 §36 `:1374` "A future release channel adds a typed revenue category and provenance").

**A3. "Contribution", "Studio Revenue" and "public gross" are three distinct, law-bound numbers; obligations are shown beside cash, never subtracted.**
- PKG P11 `…PACKAGE-11.md:52-55` laws 1, 3, 4; `:806-816` §20 formula (Gross × locked share = Full-run Studio Revenue; Received + Scheduled = Full-run; Full-run − Direct commitment = Film Contribution); `:380` "Do not add `Available Cash`, `Reserved Cash`, or `Cash after all obligations`".
- APPROVED DOC handoff `p12-accepted/docs/engineering/P11-TO-P12-PRODUCER-HANDOFF.md:35` ("Cash may be negative. Guarantees describe existing future payroll and are not subtracted from Cash again"), `:37` (`contribution` "is not a remaining-profit field or studio net profit").
- PKG P07 `…PACKAGE-07.md:528-532` (canonical "Film Contribution = total Studio Revenue − direct committed film cost"; "Final Film Contribution (before studio fixed costs)").
- Proves: a P16 valuation input labelled "profitability" must be built from typed ledger categories or Contribution, and must not be called profit.
- Confidence HIGH. Prior prose: CONFIRMED.

**A4. There is NO asset value, depreciation schedule, book value, net worth or balance sheet; P11 explicitly forbids inventing one.**
- P11 annex `…PACKAGE-11-BUILDER-ANNEX.md:707` — "Facility asset value/depreciation | **Discard / absent** | no authority | Do not invent balance sheet."
- PKG P11 `…PACKAGE-11.md:266` ("Display as Cash, never 'available cash' or net worth"), `:313` (Cash must not be confused with "Net worth"), `:641` §15.1 ("current `construction` totals are **net capital committed/recovered**, not a depreciation schedule or asset valuation"), `:132` (reject calling cash/assets a recovered `Studio Worth`).
- Proves: BOOK NET WORTH (assignment §2.N) does not exist and would be a P16-authored derived read model, not a P11 fact; the only existing "asset-ish" numbers are the ledger's net capital and the demolition/strike credits (see B5).
- Confidence HIGH. Prior prose: N/A (assignment §2.N premise is NEW).

**A5. Negative cash is a recoverable literal state ("In the red"); it is not bankruptcy, triggers no loan/rescue, and only gates *voluntary* commitments.**
- PKG P11 `…PACKAGE-11.md:377` ("It may be positive, zero, or negative under current law"), `:441` (Cash ≤ 0 → `In the red`, "A recovery state, not `-4 weeks`"), `:1056-1058` §25.3, `:1269-1275` §32.1 ("Unavoidable weekly payroll/overhead/facility Opex may take cash negative… Current early-release termination can also take cash negative… There is no authoritative bankruptcy, receivership, loan, bailout, forced sale, or game-over state").
- APPROVED DOC register `:122` (`P11-REQ-023` PROVEN: "no bankruptcy law; `releaseTalent` may take cash negative — REUSED law"); P12→P13 handoff `p12-accepted/docs/engineering/P12-TO-P13-PRODUCER-HANDOFF.md:15` ("Negative Cash alone is not bankruptcy and runway is not an invented distress threshold").
- Proves: "cash" in a transfer bundle can be negative; "distress" for P15/P16 is a separate Owner-approved predicate, not sign of cash.
- Confidence HIGH. Prior prose: CONFIRMED (P15 §12.3 `…PACKAGE-15.md:467-468` "A single negative-cash week cannot skip directly to dormancy").

**A6. Rival finances exist internally (conserved per-rival account) and are HIDDEN by default; rival Contribution/ROI display is NOT YET AUTHORIZED.**
- CODE `src/core/hollywoodTypes.ts:49-61` (`RivalFinancePeriod`, `RivalAccount { openingBalance, cash, periods }`).
- APPROVED DOC future-consumer contract `p12-accepted/docs/engineering/P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md:186-197` §6.4 table (exact rival cash HIDDEN; movements HIDDEN "proof/audit authority, not a player ledger"; rival Studio Revenue/Direct Commitment/Contribution "NOT YET AUTHORIZED for display unless a later disclosure law makes the cost/share basis public"); `:274-276` §9 ("`StoryProperty`, library, ownership, or rights claims before P16 authority" NOT YET AUTHORIZED; ownership change is PUBLIC AFTER EVENT). P12→P13 handoff `:15` ("Preserve literal accounting, exact receipts and hidden rival Cash/salaries/policy/forecasts").
- Proves: a P16 healthy-acquisition valuation shown to the player would need a **new disclosure law** (due diligence) before it may reveal target cash/obligations; the internal data to value a rival exists (cash, obligations via `hollywood.employment`, project costs `RivalProjectCosts`, films with `directCommitment`/`studioRevenueReceived`).
- Confidence HIGH. Prior prose: CONFIRMED.

**A7. Annual/era summaries: only rolling 13/52-week windows exist; calendar-year/era summaries remain IMPLEMENTED-UNPROVEN/BLOCKED even after the P12 calendar.**
- PKG P11 `…PACKAGE-11.md:517` ("Year/era summary | recorded ledger or future compact yearly aggregate | Summarize when scale requires"), `:1254`, `:1263` (compaction not implemented).
- APPROVED DOC register `:130` (`P11-REQ-031` "Calendar/year/era summaries remain BLOCKED by absent authoritative calendar and era boundaries; no invented 52-week years… IMPLEMENTED-UNPROVEN"); P11→P12 handoff `:75`; P12→P13 handoff `:12` ("The calendar does not itself deliver era effects, aging, technology or all P11 annual/era summaries").
- CODE `src/core/financeReport.ts:44-49` (`FinanceHistoryWindow.windowWeeks: 13 | 52`).
- Proves: a valuation input such as "trailing-year revenue" has a 52-week window producer but no calendar-year producer; P16 should define its own bounded window rather than wait for era summaries.
- Confidence HIGH. Prior prose: CONFIRMED.

**A8. Selling buildings = demolition with a flat depreciated credit; there is no "sale", no windfall, and no bailout category.**
- CODE `src/core/tuning.ts:1598-1613` (`FACILITY_DEMOLITION_REFUND_FRACTION = 0.5`; "Deliberately FLAT in V1… the law is that it is strictly less than 1, which is what makes build-then-demolish always a net loss and refund farming impossible… The same fraction applies to a site demolished mid-construction"); `src/core/placement.ts:1026-1028` (`facilityDemolitionRefund = round(blueprint.capex × fraction)`); `src/core/tuning.ts:816` (`SET_DEMOLITION_REFUND_FRACTION: 0.35`).
- PKG P09 `…PACKAGE-09.md:637` (consequence sheet shows "authoritative refund (current facility law: 50% of committed capex)"), `:649` (under-construction removal is still Demolish, same refund/write-off).
- APPROVED DOC facility doc `p13-docs/docs/design/FACILITY-UPGRADES-AND-STUDIO-OVERVIEW-01.md:193` ("Accepted `facilityDemolitionRefund` calculates `round(current blueprint.capex × 0.5)`; it does not look up paid capital… No profitable upgrade/demolition loop").
- P11 §32.1/§33 (A1, A5) — no bailout/forced-sale/windfall; future-consumer contract `:174` item 12 ("no invisible cash reset, rescue top-up… or result-driven balancing entry" for rivals).
- Proves: the only existing liquidation value for physical plant is `0.5 × current blueprint capex` (facilities) / `0.35 × capex` (Sets), computed from the **current catalogue price**, not paid capital; a P16 "liquidation at closing" rule has a ready-made, exploit-hardened floor.
- Confidence HIGH. Prior prose: CONFIRMED; original-game corroboration `original-corpus/prima_eguide.txt:28` ("Sell Building icon to permanently demolish the building and recoup a depreciated portion of its original purchase price") — CONFIRMS P09 §2.1 row (`…PACKAGE-09.md:92`), exact fraction still unrecovered.

### 2B. P09 Facilities — one lot, rival abstraction, facilities/equipment/tiers/conversion/land, sell rule, per-body descriptors, remote property

**B1. There is exactly one physical lot (the player's `property`/`placement` roots); rival "facilities" are four abstract capacity records with no geometry, blueprint, tier or capex history.**
- CODE `src/core/hollywood.ts:98-105` (`rivalStartingFacilities`: `{id:'<studioId>:development', capability:'development-casting', capacity:2}`, stage 1, scenery 2, post 2); `src/core/types.ts:548-559` (`FacilityCapability` = 4 values; `StudioFacility {id,name,capability,capacity}`); `hollywood.ts:88-95` (`rivalCapacityOpex` = flat tuning per capability); `hollywoodTypes.ts:79-95` (`RivalBusiness.operations: StudioOperations`, no placement root).
- APPROVED DOC P12→P13 handoff `:14` ("Rival physical operations are abstract, not fabricated room/lot occupancy… Player facilities retain P09 ownership"); P12 annex `pkg-docs/docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12-BUILDER-ANNEX.md:222` ("Land/stages | player-local physical property | rival-local abstract capacity | no shared land/stages | all geometry"), `:243-244` ("Land | No | player property only | leave alone | Studio Empire maybe | rival lots not rendered"); rulings `p13-docs/docs/design/CODEX-P13-P15-OWNER-RULINGS.md:257` ("physical rival lots" parked P16+).
- Proves: assignment §2.F Q6/Q8 ("target facilities… higher physical facility upgrade than buyer") has **no physical referent for rivals today**: a rival target's estate is `{capability, capacity}` rows plus (later, P13) adoption rows; there are no rival Office II/III, no footprints, no paid-capital records to liquidate.
- Confidence HIGH. Prior prose: CONFIRMED (P12 accepted).

**B2. "Facility" = a `PlacedFacility` with immutable numeric `placementId`, derived string `facilityId`/`constructionProjectId`, blueprint, footprint, capex, weekly Opex; placement IDs never recycle; founding bodies (Gate, Administration, five founding structures) are landmarks/prebuilt, not placements.**
- CODE `src/core/types.ts:958,1042` (`FacilityBlueprint`, `PlacedFacility`); P09 annex `…PACKAGE-09-BUILDER-ANNEX.md:183` ("monotonic numeric placement ID plus derived facility/project collision sets… Placement IDs never recycle"), `:448` (first office = placement `1`, `facility-development-casting-office`, `construction-development-casting-office`).
- PKG P09 `…PACKAGE-09.md:296-317` classification (Gate/Admin PERMANENT LANDMARK; Dev&Casting/Scenery/Soundstage/Post PLAYER-BUILT CORE; Annex/Hall/Office II/III EXPANSION/TIERS), `:913-920` (`nextPlacementId` never rewinds).
- APPROVED DOC facility doc `:72-76`, `:91` ("the authored property has five founding bodies and three landmarks… `post` provides both `facility-post-building` and `facility-scenery-shop`"; provider↔physical-subject links are typed, never inferred).
- Proves: "BUILDINGS/FACILITIES" in a transfer bundle are placement-rooted, lot-bound entities; the doc law already separates *physical subject* (body) from *providers* (capabilities) — the seam an "equipment transfer" would have to respect.
- Confidence HIGH. Prior prose: CONFIRMED.

**B3. "Upgrade tiers I/II/III" today are separate placed bodies (Office II/III are capacity-zero standard buildings; highest-only effect; both keep charging Opex). "Conversion", "installation", "equipment", "portable equipment" are OWNER-DIRECTION concepts defined by descriptors, NOT accepted code.**
- PKG P09 `…PACKAGE-09.md:593-606` §16 ("additional placed facilities, not a universal in-place upgrade verb… The lower-tier body and its weekly operating cost remain… A future in-place renovation needs its own authoritative downtime, cost, identity, reservation, migration, and cancellation law").
- APPROVED DOC catalogue `p13-docs/docs/design/STUDIO-UPGRADE-AND-RESEARCH-CATALOGUE-01.md:382-386` §8.1 ("one office body carrying two independently recorded facts: installed work capacity, and installed development standard… Old saves keep their purchased Office II and III as real bodies with real charges"), `:390-400` §8.2 three costed routes (paper), `:406-416` §8.3 prerequisite disposition (recommendation pending Current Ops).
- Facility doc `:152-161` §6a ("Prerequisites are knowledge, purchases are equipment"; "**Conversion requirement descriptor.** Every conversion quote derives from one authored descriptor for the actual source state → target definition: structure, space, installed equipment, access, compatibility with the target and the affected resource providers"; "**Portable equipment stays a purchase.** Replacing a camera… is an equipment purchase with no building job"; "**Identity.** The same physical identity, name and history are kept where it is truly the same building"); `:165-179` §7 renovation contract (**proposed**); P13 annex `…PACKAGE-13-BUILDER-ANNEX.md:718-721` (`ConversionRequirementDescriptor { sourceStateKey, targetDefinitionId, structure, space, installedEquipment, access, compatibility, affectedProviderIds[] }`).
- Rulings `:101-102` §2.4.1 items 11–12 (inventor pricing; leapfrog purchase with gap-aware conversion) = OWNER-SELECTED.
- Proves: per-body descriptors will exist (`installedEquipment`, `affectedProviderIds`), so a future "equipment transfer" has a named field family to respect — but none of it is implemented; "equipment" as a separable, movable asset class is only implied by "portable equipment stays a purchase".
- Confidence HIGH for status; MEDIUM that the descriptor shape survives implementation. Prior prose: P09 §16 QUALIFIED by Owner direction (conversion now selected); SUPERSEDED BY OWNER DIRECTION for "no in-place upgrade".

**B4. Land: the starting property is finite; land acquisition/expansion is LATER; parcels have stable IDs; no purchase price/zoning exists.**
- PKG P09 `…PACKAGE-09.md:853-867` §28 ("Land acquisition is **LATER**… parcels have stable immutable IDs… no current card promises purchase price, zoning, or expansion unlock"), `:983` (LATER list).
- Proves: "LAND" in a transfer bundle has no priced or transferable representation; only the player's own owned parcels exist.
- Confidence HIGH. Prior prose: CONFIRMED (P12 annex `:244` "Studio Empire maybe").

**B5. Sell/demolish rule: refund = `round(current blueprint capex × 0.5)`, engagement-blocked (fail-closed holders), landmarks never demolishable; renovation must not enlarge the refundable basis.** (See A8.)
- PKG P09 `…PACKAGE-09.md:627-649` §18 (consequence sheet, holders, protected status, "numeric placement ID is never reused"); P09 annex `:187` (`facilityEngagements` "One fail-closed truth across production, tasks, scripts, casting, Sets, legacy").
- Facility doc `:193` ("A renovation needs its own job and versioned installed-standard/cost history, preserving the original eligible paid-capital basis; renovation capex must not silently enlarge it… original eligible basis paid at most once").
- Proves: any P16 liquidation must (i) respect engagement blockers (active productions/sets on the target's… abstract capacity — see B1) and (ii) not double-credit renovation capex.
- Confidence HIGH. Prior prose: CONFIRMED.

**B6. No "remote property" notion exists; the only non-lot property model is the rival abstract `StudioOperations` (capacity + flat Opex).**
- CODE as in B1; PKG P12 annex `:222`, `:243`. Facility doc `:223` ("Rival capacity can later participate through P12/P09 typed adapters under symmetric technology law; this does not require rival 3D lots").
- Proves: assignment §2.G option 3 ("remote corporate property exists only as a financial asset") would be a NEW P16 root; the closest existing precedent is exactly the rival capacity record (id, capability, capacity, flat Opex, `capacity` paid once at entry — `hollywoodTypes.ts:47`, P12→P13 handoff `:15` "Entry pays capacity/signing once").
- Confidence HIGH. Prior prose: N/A.

### 2C. P13 Technology — six facts, knowledge vs installation, keying, closure, provenance

**C1. The six separated facts are Owner-recorded law (2026-09-10) and each has a distinct owner/record.**
- APPROVED DOC P13 `p13-docs/docs/design/CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13.md:125-134` §2A.1 table: (1) Knowledge prerequisites & early-research eligibility → P13 catalogue/timeline; (2) Research progress & completion → P13 research project, "completion makes the studio `readyToAdopt` with own-development provenance"; (3) Public commercial availability → `IndustryTimeline`; (4) Physical installation → "P09 job through the §12.2a interface… on one exact building or equipment subject"; (5) Operational capability → P13 adoption `operational`, "exact providers can supply the capability"; (6) Industry standard → `publicStandard` per use. `:467` (`P13-OD-02` the six facts "stay distinct in state, projections and copy").
- Rulings `:129` (six separated facts = IMPLEMENTATION RECOMMENDATION under Owner direction).
- Confidence HIGH. Prior prose: SUPERSEDED BY OWNER DIRECTION relative to the 2026-08-30 two-route candidate (P13 `:98-99` "Research and wait are the unconditional routes, joined… by a priced purchase route").

**C2. Per-studio "knowledge" = holding prerequisite technologies + a completed research/adoption state; it is keyed by (StudioId, TechnologyId) and stored on the studio, never on the catalogue.**
- P13 `:521` ("A studio may `beginResearch` only when the window is open and it holds every knowledge prerequisite (§13 `prerequisiteTechnologyIds`, which are knowledge, not equipment)"); `:536-543` per-studio lifecycle (`unaware → aware → evaluating → researching|waiting|purchasing → readyToAdopt → adopting → operational`); `:728-733` §13.2 ("Each studio owns P13 adoption, research-work, standard-disposition, and `AdoptionWorkOrder` records keyed to global IDs"); `:687` §12.8 ("Accumulated work belongs to the project, which belongs to (studio, technology)").
- Roadmap `…LONG-RANGE-ROADMAP.md:250` ("`studioTechnology` keyed by `StudioId` + `TechnologyId` | P13 | Adoption is studio-relative").
- P13 annex `…PACKAGE-13-BUILDER-ANNEX.md:306-325` (`TechnologyAdoption { adoptionId, studioId, technologyId, route, status, …, facilityProviderIds[], provenance }`), `:327-345` (`ResearchProject { researchProjectId, studioId, technologyId, accumulatedWork, … }`).
- Proves: "verified research knowledge/eligibility" is a per-studio adoption row at ≥ `readyToAdopt` (or an `operational` row) plus the prerequisite closure; "physical installation" is `adopting → operational` bound to `facilityProviderIds[]` via a P09 job.
- Confidence HIGH. Prior prose: CONFIRMED.

**C3. "Buyer inherits target's verified knowledge/eligibility but not installations" IS expressible in the six facts, as a buyer adoption row at `readyToAdopt` (fact 2 outcome) with no `adopting/operational` (facts 4–5) — but it needs a NEW route/provenance value, because `route`/`routeProvenance` is closed at `research | wait | purchase`.**
- P13 annex `:288` (`allowedRoutes[] // research | wait | purchase (2026-09-10); license only in a later authorized schema`), `:353` (`routeProvenance // research | wait | purchase`); P13 `:523` ("Route provenance therefore records `research`, `wait` or `purchase`, which is also what an inventor-pricing audit needs").
- Facility doc `:223` ("Technology being known or publicly available means eligible to consider installation, not freely installed in every building"); P13 `:579-580` ("Research/public availability never installs equipment freely throughout the estate").
- Proves: the Owner's "KNOWLEDGE TRANSFERS, PHYSICAL INSTALLATIONS DO NOT MAGICALLY APPEAR" principle maps cleanly onto the state model; the cost is one additive enum value (e.g. `acquired`/`succession`) in the P13 catalogue/adoption schema and a rule that the buyer's `readyToAdopt` row cites the target's adoption/provenance ID as evidence.
- Confidence HIGH (expressibility); MEDIUM (that P13 will accept a fourth route rather than a `transferred` entitlement — see C6). Prior prose: NEW.

**C4. In-progress research (accumulated work) is law-bound to its (studio, technology): it "never moves across technologies or studios".**
- P13 `:471` (`P13-OD-06` "retained work never moves across technologies or studios"), `:687` §12.8 ("Retained work can never exceed required work, move to another technology or studio, or exist twice"), `:455` law 26.
- Proves: a **severe structural conflict** with a naive "target's active research projects transfer to buyer". Smallest correction (INFERENCE, §3): inherit only *completed* knowledge (C3) and dispose of in-flight projects through the existing closure disposition (C5); if the Owner wants in-flight work inheritance, P13-OD-06 must be amended with an explicit successor-studio exception, not silently broken.
- Confidence HIGH. Prior prose: CONFIRMED (Owner selection 7A concerns pause/cancel retention within one studio, not cross-studio transfer — rulings `:97`).

**C5. At dormancy/closure P13 already resolves every active research/adoption order through typed dispositions inside the all-owner P12 transition; the disposition vocabulary has no "transfer to successor" value.**
- P13 `:638-643` §12.5 ("For active → dormant/closed requests, P13 preflights every active research project, adoption work order, provider reservation, and pending P11 disposition under one Owner-approved typed rule (`paused`, `cancelled_with_receipt`, or `completed_before_transition`)… P12's registry transition cannot commit until that receipt and all other owner receipts validate in one `GameState` candidate"); `:445` law 21.
- P13 annex `:200` (table row "active studio becomes dormant/closed"), `:415-425` (`P13ParticipantDispositionRow.disposition // entryStandardBaseline | availableNotAdopted | paused | cancelledWithReceipt | completedBeforeTransition | preservedForReentry`), `:436-460` (`P13StudioTransitionParticipantManifest`).
- P15 `…PACKAGE-15.md:481-486` §12.3 ("For dormancy/closure, P13 resolves every active research/adoption order… P10 settles contracts/person references, P11 settles finance, and P12 settles projects/capacity/roster/employer/exclusivity/intervals").
- Proves: MODEL A/C/D absorption ("target operating studio closes into buyer") can reuse the closure manifest machinery verbatim, adding one disposition (e.g. `transferredToSuccessor(studioId)`) per participant; nothing about that exists yet and it is not P15A scope.
- Confidence HIGH. Prior prose: CONFIRMED (roadmap `:259` manifest law).

**C6. "Invention provenance" = `InventionProvenance {technologyId, studioId (inventor), contributingResearchProjectIds, completedWeek, prototypeEquipmentIncluded, entitlementClass}`; the inventor price advantage is an entitlement derived from it; transfer/inheritance of that entitlement is an anticipated LATER case with a reserved enum value, not decided.**
- P13 `:850` (provenance record), `:853` ("**After commercialization.** … Transfer, co-development and inherited entitlement are later cases"), `:1069-1070` §22 ("No future rename, studio ownership change, retirement, or catalogue revision can rewrite the original identity"), `:144` (Later tier: "transfer and co-development entitlement").
- P13 annex `:697-705` (`entitlementClass // ownDevelopment | (later) transferred | coDeveloped`), `:737` (`TechnologyRightsRecord { rightsId, provenanceId, holderStudioId, rightsKind /* privateUse | supplierLicense | outrightSale */ }` — LATER COMMERCIALIZATION SCOPE), `:1009-1011` ("ownership transfer in P16+ must not change a person, studio, technology, film, facility-history, or adoption identity").
- Rulings `:60-64` (technology-rights transfers NOT APPROVED for P13; P16+ default placement); catalogue `:719` OWN-9, `:770` LATER-1.
- Proves: the inventor-price advantage **can** survive an acquisition without rewriting who invented: provenance `studioId` stays the target; the buyer gains a `TechnologyRightsRecord{holderStudioId: buyer}` or an `entitlementClass: transferred` — both sketched, neither approved. Which one is a P16 decision; the rights-record form is the one the commercialization sketch already uses.
- Confidence HIGH for the sketch; LOW for which form is chosen. Prior prose: CONFIRMED (parked P16+).

**C7. Physical installation ownership: P09 owns the job; P13's `AdoptionWorkOrder` is coordinator; P11 the wallet; per-facility Opex begins at `operational`.**
- P13 `:565-571` §12.2a; facility doc `:215` §8 ("P09 owns physical facility identity, placement, conversion job… P13 owns availability, research/wait, adoption episode, capability eligibility/compatibility… P11 supplies cash/ledger/consequence semantics"); `:101` (after-rate begins when body becomes operational).
- Proves: an acquired *installation* could only be inherited as a P09 physical subject on the buyer's lot — which cannot exist for a rival target (B1). Hence "installations do not transfer" is not merely Owner preference; it is the only lawful outcome under current authority.
- Confidence HIGH. Prior prose: CONFIRMED.

**C8. Supplier commercialization / licensing / outright rights sale of a technology are LATER COMMERCIALIZATION SCOPE with P16+ as default placement; "licensing is not original-game parity".**
- P13 `:99-103` (REFUTED as parity), `:869-877` §16a.4 ("Private use (no agreement), outright rights sale (one payment, commercialization rights leave, own use retained) and supplier licensing remain distinguishable"), `:1148-1150` §25 ("acquisition/merger/library transactions, which are P16+ candidates and not original parity").
- Proves: assignment §2.K "possibly technology/license rights where upstream ownership permits" already has a sketched object (rights record; outright sale semantics) and a settled placement default.
- Confidence HIGH. Prior prose: CONFIRMED.

### 2D. People & contracts — P10 terms, P12 employer truth, P14 parking, closure

**D1. Contract model (CODE): `Contract {talentId, annualSalary, signingBonus (paid ONCE at signing), startWeek, endWeekExclusive, termWeeks 52..208}`; the P10 `Contract` has NO id field. Player contracts live on `GameState.contracts` (studio-relative); rival contracts live only in `hollywood.employment`.**
- CODE `src/core/types.ts:336-343`, `:318-322` ("Employment/contract/ledger/founding state lives on GameState (studio-relative), NOT on Talent"), `:491-494` (`founding`, `contracts: Contract[]`, `freeAgents: string[]`).
- Confidence HIGH. Prior prose: CORRECTED — P14 `…PACKAGE-14.md:378` and roadmap `:277` speak of a "P10 `ContractId`"; in accepted code the only contract identity is minted by P12 (D2).

**D2. `ContractId` is minted by P12 code and EMBEDS THE EMPLOYER's StudioId; one-employer exclusivity is a P12 active-employment index; employer transitions are `IndustryReceipt{kind:'employment', fromStudioId, toStudioId, contractId, reason}` with a CLOSED reason enum.**
- CODE `src/core/industryEmployment.ts:30` (`contractId=\`${owner}:contract:${terms.talentId}:${terms.startWeek}:player-${ordinal}\``), `:25` (ending receipt reason `'expiry'|'termination'`), `:29` (`'existing-player-contract'|'renewal'|'player-contract'`); `src/core/hollywood.ts:180` and `hollywoodTick.ts:99,129` (rival `contractId=\`${studioId}:contract:${person.id}:${week}\``); `src/core/hollywoodTypes.ts:62-68` (`IndustryEmployment { contractId, studioId, terms, endedWeek, reason: 'entry'|'renewal'|'replacement'|'player-contract'|'existing-player-contract' }`), `:98-99` (receipt reason adds `'expiry'|'termination'`), `:116` (`activeEmploymentOrdinals`).
- APPROVED DOC P12→P13 handoff `:13` ("P12 records actual employer transitions and paid rival renewal/replacement. One-employer exclusivity remains binding"); P12 annex `:533` ("A durable employer transition needs person ID, prior/new employer (nullable for free), effective week, legal reason, and contract/action reference. Every contract has its own stable ID").
- Proves: "employee contracts transfer intact to the buyer as successor employer" cannot be a mutation of `IndustryEmployment.studioId` (the id string would lie); it must be: end the target row (`endedWeek`), mint a NEW row under the buyer with the **same `terms`** and a NEW `reason` (e.g. `'successor-assumption'`), and emit one receipt `from: target → to: buyer`. For a player buyer the same `Contract` terms must also be appended to `state.contracts` **without re-debiting `signingBonus`** (P11 §13.2 `…PACKAGE-11.md:559` "Signing bonuses… are one-time contract movements"; law at `types.ts:339`).
- Confidence HIGH. Prior prose: CORRECTED (see D1) and CONFIRMED (P12 transition-event doctrine).

**D3. Ordinary termination law (CODE): `terminationCost = round(0.5 × guaranteedComp)`, `guaranteedComp = weeklySalary × remaining weeks`; release is refused for an active screenplay writer; release may take cash negative; result = free agent; the 0.5 is tuning, not law.**
- CODE `src/core/employment.ts:172-180`; `src/core/tuning.ts:390-391` (`HIRING_RENEWAL_WINDOW_WEEKS: 12`, `HIRING_TERMINATION_FRACTION: 0.5`).
- PKG P10 `…PACKAGE-10.md:527` ("authoritative termination-cost tuning computes 50% of the remaining guaranteed salary, and early release is blocked for an active screenplay writer. The percentage is current tuning, not permanent product law"), `:597-613` §16; P11 `…PACKAGE-11.md:603-613` §14.4 (termination "does not apply the ordinary solvency gate, and may take cash negative").
- Proves: assignment §2.F Q4 — YES, inherited staff can be released under ordinary law at 50% of remaining guarantee (a natural, non-arbitrary integration cost); no notice period exists.
- Confidence HIGH. Prior prose: CONFIRMED.

**D4. P14 owns competitive expiring-talent cases only; in-term approaches, negotiated release, buyout/compensation, contract break and tampering are parked as P14D in P16+; "acquisition/merger transfer of workforce or libraries" and "labels, subsidiaries… estate/rights/succession law" are deferred to P16+; "Acquisition… cannot be smuggled into a 'talent transfer' implementation".**
- P14 `…PACKAGE-14.md:69-72`, `:266` law 9, `:357` ("P12A remains the sole owner of current employer ownership… P10 remains the sole owner of contract term records"), `:382` ("Even a retired, unavailable, or future acquired-studio person remains addressable"), `:649` (contract-breaking decision: start with A no in-term break), `:697-705` §25 P16+ list; P14 annex `…PACKAGE-14-BUILDER-ANNEX.md:61`, `:261` ("There is deliberately no P14 `EmploymentHistoryRoot`, current-employer index… Those remain P12A authority").
- Proves: "contract assignment" as a *negotiated* act (consent, compensation, buyout) is P14D/P16+; a *statutory successor-employer transition* at absorption is not a P14 concept at all — it is a P12 employer transition (D2) triggered by a P16 transaction. Both readings are consistent with the docs; the difference is whether consent/compensation law is invoked.
- Confidence HIGH. Prior prose: CONFIRMED.

**D5. At closure P10 "settles contracts/person references" and P14 disposes open cases; P12 §30 says closure "releases or resolves talent under contract law"; "Acquired is a later distinct outcome, never an alias for closed".**
- PKG P12 `…PACKAGE-12.md:881`; P15 `…PACKAGE-15.md:481-486`; P14 annex `:158-167` C.7; P14 `:693`.
- Proves: absorption of a target's roster is a *third* outcome (neither "released to free agency" nor "closed"), which P12 already foresaw as distinct; the P10/P11 participant contract would need a disposition value for "assumed by successor".
- Confidence HIGH. Prior prose: CONFIRMED.

**D6. Original-game "Star & Script Selling Facility" is SOURCE VERIFIED but P14 rules "Do not translate people into saleable inventory. Any transfer/buyout requires contract and consent law; not P14A"; Prima adds an eight-year vesting to full market value.**
- P14 `:142`; P10 `…PACKAGE-10.md:105`; `original-corpus/prima_eguide.txt:519` ("Stars must be with your studio for eight years before they can be sold for full market value… Until then, they'll fetch only a rising fraction").
- Proves: selling *people* is out of the P16 asset-sale list by existing ruling; the original's vesting curve is a usable anti-flip precedent for *assets* (INFERENCE, §3).
- Confidence HIGH. Prior prose: CONFIRMED.

### 2E. P08 History / Standing — how history is recorded; room for corporate events; Standing per studio

**E1. Studio History (CODE) is a player-studio root `studioHistory {recordingStartedWeek, nextEventId, rows}` with a closed event-kind union and a closed subject union (`studio | film | person | facility`); there is no corporate/ownership event kind and no cross-studio history root.**
- CODE `src/core/types.ts:1590-1660` (`StudioHistorySignificance`, `StudioHistorySubject`, `StudioHistoryEvent` kinds: `studioFounded, standingChanged, standingDriftFolded, filmReleased, theatricalRunCompleted, facilityCommitted|Completed|Demolished|Moved, careerMilestone`; `StudioHistoryState`), `:1689-1690` (`GameStateV19 = V18 & { hollywood }`).
- PKG P08 `…PACKAGE-08.md:672-683` §18.2 (timeline content list — no corporate events), `:701` (founding absent in P08A).
- Proves: the assignment's corporate-history examples ("ACQUISITION — … Acquired by …", "MERGER/ABSORPTION … Successor owner") need either (i) new `StudioHistoryEvent` kinds + a new subject kind (`{kind:'studio', studioId}` is currently unparameterised — it means *this* studio), or (ii) a new industry-level root. The roadmap already reserves `CorporateEventId` and `ownershipEvents` for this (E4).
- Confidence HIGH. Prior prose: CONFIRMED.

**E2. Rival/industry history (CODE) = `hollywood.receipts: IndustryReceipt[]` with kinds `studioEntered | employment | filmAnnounced | filmReleased | filmSettled`; `StudioIdentity` has NO status/dormant/closed/acquired field.**
- CODE `src/core/hollywoodTypes.ts:6-17` (`StudioIdentity {studioId, role, row, name, mark, color, founding, eligibleWeek, enteredWeek, recordedFromWeek}`), `:96-103`; P12→P13 handoff `:27` ("Current `StudioIdentity` has no dormant/closed status field; the older contract's vocabulary is a future seam").
- Proves: "historical StudioId does not disappear" is already true structurally (identities array is append-only), but *status* (active/dormant/closed/acquired) is unimplemented and is P12's to commit under P15B/P16 requests (rulings `:220-222`).
- Confidence HIGH. Prior prose: CONFIRMED.

**E3. Standing = three 0–100 channels of *current* studio reputation, persisted per studio (`Studio.standing` for the player, `RivalBusiness.standing` for rivals), explicitly "not an all-time legacy score", and P08/P13 forbid awarding it by anything but release results/publicity/drift.**
- CODE `src/core/types.ts:267-271`, `:291-296` (`Studio {cash, standing, activeProductions, releasedFilms}`); `hollywoodTypes.ts:83` (`RivalBusiness.standing: Standing`).
- PKG P08 `…PACKAGE-08.md:300-309` §6.2 ("Standing means **current studio reputation**… It is not… an all-time legacy score… Do not add a fourth channel"), `:342-354` §7 (Standing "can decline… current only"); P12 annex `:217` ("same values, release update, and drift per studio"); P13 `:443` law 19 ("P13 does not award Standing directly").
- Proves: nothing says Standing is "transferable" — it is a per-StudioId mutable reputation with no transfer producer; a buyer inheriting the target's Standing would require a new Standing mutation source, which P08 §6.1 enumerates as exactly three (`…PACKAGE-08.md:290-294`). The docs therefore support **NOT** inheriting Standing; brand/label value must be expressed elsewhere (a P16 label record), not by copying channels.
- Confidence HIGH (per-studio; three sources); MEDIUM (that no future doc grants inheritance). Prior prose: CONFIRMED.

**E4. Roadmap/rulings reserve the identity and root seams P16 needs: `StudioId` "Mint once. Rename, distress, closure, acquisition, or re-entry appends events; none remints"; `CorporateEventId` listed among stable IDs; `ownershipEvents` root is "P16+ only"; P12 §32 preserves "current owner and original creator as distinguishable relationships… dated ownership history rather than destructive reassignment… room for one film to have multiple future ownership/finance shares".**
- Roadmap `…LONG-RANGE-ROADMAP.md:273-277` §9, `:260` §8; PKG P12 `…PACKAGE-12.md:911-916` §32; future-consumer contract `:359-362` (P12 preserves "immutable studio, film, project, person, and credit identities after closure or ownership change; the exact original creating studio for every work").
- Confidence HIGH. Prior prose: CONFIRMED.

### 2F. P07 Film economics — economic life, long tail, identity, frozen result

**F1. A film's economic life = one locked theatrical run (weekly `weeklyGross[]` × locked `studioShare`), credited automatically each tick, then `status: 'completed'`; after that there is NO further cash flow of any kind.**
- CODE `src/core/types.ts:304-316` (`TheatricalRun`: `weeklyGross[] // locked; Σ = opening×legs`, `studioShare // locked`, `cumulativeStudioRevenuePaid`, `status: 'active'|'completed'|'legacyCompleted'`, "Kept as a HISTORY (never deleted)"); `hollywoodTypes.ts:37-45` (`LiveIndustryFilm {…, directCommitment, studioRevenueReceived, settledWeek}`).
- PKG P07 `…PACKAGE-07.md:464-475` §10.1 ("There are no modeled theater counts, admissions, territory split, distributor negotiation, competition chart, screens, ticket price or manual collection"), `:511-512` ("Run completion changes `Projected` to `Final`… does not require another player action"), `:759`, `:958` (LATER: "IP/library economics, sequels, home media/streaming and era distribution").
- P15 `…PACKAGE-15.md:853` ("home media, television, streaming, territories, and long-tail library revenue" = later systems); P11 register `:137` (`P11-REQ-038` era/revenue-channel finance DEPENDENCY-BLOCKED on P13/P16/P18).
- Proves: **library value is currently zero cash-flow**; assignment §2.C's "do not invent perpetual weekly library cash before an owning distribution/media system exists" is already the binding state, and P18 is the named owner of such channels (future-consumer contract `:394-405`).
- Confidence HIGH. Prior prose: CONFIRMED.

**F2. There is no re-release/reissue/restoration mechanic; the catalogue parks restoration/reissue authority in "the same P16+ rights owner" (CAT-052) and the archive in P16+ (CAT-051).**
- Catalogue `…CATALOGUE-01.md:318-319` (CAT-051 "the P16+ library and rights system… Nothing may delete game history because a vault fills"; CAT-052 "An archive or Post provider gains restoration and reissue preparation for exactly the works the studio owns or has licensed… No invented ownership and no automatic revenue. Retrospective restoration is a rights workflow, never a way around the first-filming lock"); future-consumer contract `:365-366` (P16 owns "restoration and reissue authority").
- Proves: the first cash-bearing "library" mechanic would be a P16 reissue (a *new* run for an *old* FilmId) — which the technology lock (P13 §12.9 `:700-704`) must not be circumvented by.
- Confidence HIGH. Prior prose: CONFIRMED.

**F3. Released-film identity (CODE): `FilmResult.productionId` is the film identity; `filmId === productionId` for live industry films (enforced by throw); `conceptId` and (for live films) `scriptProjectId` are retained; the result is "frozen" = immutable stored outputs (`delivered`, `criticScore`, `segmentScores`, `boxOffice{opening,total}`, optional frozen `participants`/`forecast`), never recomputed from present-day talent.**
- CODE `src/core/types.ts:241-264`; `src/core/hollywoodTick.ts:242` (`filmId:p.id`), `:270` (`if(… film.filmId!==run.productionId) throw new Error('Industry receipt owner mismatch')`); `hollywood.ts:196` (authored historical films `filmId: '<studioId>:historical-film:<index>'`, `studioId` = creating studio); `hollywoodTypes.ts:20-27` (`FilmIdentity {filmId, studioId, conceptId, title, genre, credits}`).
- PKG P07 `…PACKAGE-07.md:840` (Chronicle keeps "future Awards/IP/franchise sections as unavailable/empty extensions, not Package 07 inventions"), `:843` ("never reads current talent to repair frozen history"), `:866` ("Later employment changes do not rewrite the frozen credit or career event").
- P11 §34.1 `…PACKAGE-11.md:1323` ("Join costs and receipts by immutable `productionId`, never title").
- Proves: the durable film subject P16's Film Library/StoryProperty must reference is `productionId` (= `filmId`), with `FilmIdentity.studioId` as the immutable *creating* studio; a *current owner* field does not exist anywhere and must be a P16 relation (E4), never a rewrite of `studioId`.
- Confidence HIGH. Prior prose: CONFIRMED; QUALIFIED for the roadmap's "`FilmId` / `productionId`" pairing — in code they are the same string for simulation films and a distinct authored-film namespace for P12 pre-history films.

**F4. Direct film cost is prepaid at Greenlight (`production` row = negative + marketing, plus `freelancerFee` rows); active productions carry no rolling spend, no "remaining budget", and their historic negative/marketing split is not frozen after the `Production` is gone.**
- PKG P11 `…PACKAGE-11.md:707`, `:717-737` §17; register `:133` (`P11-REQ-034` CONDITIONAL); CODE `types.ts:198` (`Budget {negative, marketing}`), `:225-239` (`Production {id, conceptId, …, budget, startTick, remainingTicks, forecastSnapshot, participants?}`).
- Proves: for assignment §2.H, an inherited active production carries (i) already-sunk direct commitment on the *target's* ledger/`RivalProjectCosts`, (ii) a `Production` with remaining ticks and locked participants, (iii) no future film-specific debit under current law. Transferring it therefore transfers **capacity occupancy + future payroll of its people**, not cash obligations; cost-basis provenance for Contribution would have to be carried across (a P16/P11 correlation rule).
- Confidence HIGH. Prior prose: CONFIRMED.

### 2G. Register of "not original parity / P16+ / ownership / sell / asset" statements in the six domains

| # | Statement | Source · locator | Class |
|---|---|---|---|
| G1 | "acquisition/merger/library transactions, which are P16+ candidates and not original parity" | P13 `…PACKAGE-13.md:1150` | APPROVED DOC |
| G2 | "REFUTED — licensing is not original-game parity" (remains a true source fact; no longer excludes the feature) | P13 `:99-103`, `:150`; rulings `:112` | APPROVED DOC / OWNER DIRECTION |
| G3 | "Inventor pricing… must never be described as original-game parity" | P13 `:855` | APPROVED DOC |
| G4 | "Acquisition is not verified original-game parity and cannot be smuggled into a 'talent transfer' implementation" | P14 `…PACKAGE-14.md:705` | APPROVED DOC |
| G5 | "REFUTED: acquisition was a verified shipped mechanic… Any successor acquisition belongs to P16+ and must never be labeled parity"; "REFUTED: co-production, merger, library/IP ownership transfer, subsidiaries, and labels were verified shipped mechanics" | P15 `…PACKAGE-15.md:254-262` | APPROVED DOC |
| G6 | "The words **Corporate Hollywood** do not authorize acquisitions, mergers, ownership stakes, subsidiaries, co-productions, or library/IP transfers" | rulings `:232-234` §4.2 | OWNER RULING |
| G7 | P16+ parking lot: "acquisitions, mergers, subsidiaries, ownership stakes, valuation, library/IP transfer, and co-productions; advanced mobility and buyouts; patents; technology licensing and royalties…" | rulings `:249-255` §5 | OWNER RULING |
| G8 | P16 candidate list incl. "studio valuation; library/IP ownership transfer; contract assumption and consent; debt/investor/equity integration if separately approved" | roadmap `:693-704` §20 | APPROVED DOC |
| G9 | "`ownershipEvents` / ownership relations — P16+ only. Acquisition, merger, library/IP transfer, co-production rights, and ownership transactions never enter a P15 root" | roadmap `:260` | APPROVED DOC |
| G10 | "P16 owns origin-work relationships, chain of title, rights ownership, rights licensing, restoration and reissue authority, dated ownership history, and ownership transactions and acquisitions where later authorized. It may also later own mergers, valuation, stakes, labels/subsidiaries, co-productions, contract assumption/consent, and multi-party rights/finance shares under a separate Owner charter" | future-consumer contract `:364-370` §15 | APPROVED DOC |
| G11 | "A P12 concept, project, film, title, studio association, credit, or archive entry is not itself a `StoryProperty`… P16 must create each property/library identity… explicitly by exact ID; it may not infer or bulk-mint them" | future-consumer contract `:372-375` | APPROVED DOC |
| G12 | "Do not implement in P12A: acquisitions, mergers, labels/subsidiaries; library valuation/trading…" | P12 `…PACKAGE-12.md:918-925` | PKG |
| G13 | "Acquired is a later distinct outcome, never an alias for closed" | P12 `:881` | PKG |
| G14 | "Loans, bailouts, investors, forced sales, or acquisition are not implied" (distress remedies) | P15 `:619` | APPROVED DOC |
| G15 | "Facility asset value/depreciation — Discard / absent — Do not invent balance sheet" | P11 annex `:707` | PKG |
| G16 | "Sell/demolish… ADAPT. Use Project: Studio's exact 50% facility refund" (original exact refund "not safely recovered") | P09 `…PACKAGE-09.md:92`, `:120` | PKG |
| G17 | "Do not translate people into saleable inventory. Any transfer/buyout requires contract and consent law" | P14 `:142` | APPROVED DOC |
| G18 | "Supplier commercialization is desired later scope, with P16+ the default placement" (OWN-9 / LATER-1); outright rights sale distinguished | catalogue `:719`, `:770`; P13 `:873` | OWNER DIRECTION / APPROVED DOC |
| G19 | "An employer change in P14 and ownership transfer in P16+ must not change a person, studio, technology, film, facility-history, or adoption identity" | P13 annex `:1009-1011` | APPROVED DOC |
| G20 | "Even a retired, unavailable, or future acquired-studio person remains addressable" | P14 `:382` | APPROVED DOC |

### 2H. IDs and roots relevant to ownership (CODE unless marked)

| Identity / root | Owning package | Where it lives in CODE | Shape / rule | P16 relevance |
|---|---|---|---|---|
| `StudioId` (`studioId`) | P12 | `hollywood.identities[].studioId` (`hollywoodTypes.ts:6-17`); `hollywood.playerStudioId` | string; one player + nine reserved rival IDs; no status field | "historical StudioId does not disappear" already structural; status/acquired-by is a new P12-committed field |
| `PersonId` (`talentId`, `Talent.id`) | P10 | `state.talent[]`; referenced by contracts/credits | never reminted (P14 `:375`) | unchanged by acquisition |
| `ContractId` | **P12 (minted)**, terms P10 | `hollywood.employment[].contractId` (`industryEmployment.ts:30`, `hollywood.ts:180`) | `'<studioId>:contract:<talentId>:<week>[:player-<ordinal>]'` — embeds employer | successor employment requires a new row + new `reason`, never in-place re-owning (D2) |
| `Contract` (terms, no id) | P10 | `state.contracts[]` (player only) | `{talentId, annualSalary, signingBonus, startWeek, endWeekExclusive, termWeeks}` | copy terms; do not re-pay signing bonus |
| `EmployerInterval` / transition receipt | P12 | `IndustryEmployment {…, endedWeek, reason}`; `IndustryReceipt kind:'employment'` | closed `reason` enum | add `'successor-assumption'`-class reason |
| `FilmId` / `productionId` | P07 (result) / P12 (industry film) | `FilmResult.productionId`; `IndustryFilm.filmId` (= `productionId` for live films; `'<studioId>:historical-film:<n>'` for authored) | frozen result; `FilmIdentity.studioId` = creating studio | Film Library subject; current-owner relation is NEW (P16) |
| `conceptId` | P03/P12 (`FilmConcept`) | `FilmResult.conceptId`, `Production.conceptId`, `IndustryFilm.conceptId` | studio-scoped for rivals ("`<studioId>:historical-concept:<n>`") | candidate StoryProperty origin-work key, but G11 forbids bulk-minting from it |
| `scriptProjectId` | P03/P09 (`ScriptProject`) / P12 | `LiveIndustryFilm.scriptProjectId`; `FinancePortfolioRow` canonical `scriptProject` | business-local, scoped by studio owner (P12→P13 `:14`) | development-stage asset in §2.H |
| `Production.id` | P05 | `studio.activeProductions[]`, `RivalBusiness.productions[]` | `remainingTicks`, locked `participants`, `budget` | active-production transfer subject (F4) |
| `TheatricalRun.productionId` | P07 | `state.theatricalRuns[]`, `RivalBusiness.runs[]` | locked schedule; history never deleted | in-flight run = scheduled receipts; who receives them post-close is a P16 rule |
| `releaseCommitmentId` | P12 (`StudioReleaseAuthority`) | `LiveIndustryFilm.releaseCommitmentId` | — | committed release schedule (§2.H item "committed release schedules") |
| `placementId` (numeric) / `facilityId` / `constructionProjectId` | P09 | `state.placement.facilities[]`; ledger `constructionProjectId` | never recycled; refund correlates by project id | player-lot only; no rival counterpart |
| `StudioFacility.id` (rival abstract) | P12 | `RivalBusiness.operations.facilities[]` | `'<studioId>:development'` etc.; `{capability, capacity}` | the only "target facilities" that exist today |
| `TechnologyId`, `adoptionId`, `researchProjectId`, `adoptionWorkOrderId`, `provenanceId`, `rightsId` | P13 (APPROVED DOC only; not in code) | roadmap `studioTechnology` keyed `StudioId+TechnologyId` | `route`/`routeProvenance` closed; `entitlementClass` reserves `transferred` | knowledge inheritance = new buyer adoption row; provenance immutable |
| `LedgerEntry` (`kind`, optional `talentId`/`productionId`/`constructionProjectId`) | P11 | `state.ledger[]` (player); `RivalAccount.periods[]` (rival, summarised) | closed `LedgerKind` | acquisition price / sale proceeds / assumed obligations need new kinds + correlation id |
| `StudioHistoryEvent.eventId` | P08 | `state.studioHistory.rows[]` | closed kinds; subjects `studio|film|person|facility` | corporate events need new kind(s) or the reserved `ownershipEvents` root |
| `IndustryReceipt.eventId` | P12 | `hollywood.receipts[]` | `studioEntered|employment|filmAnnounced|filmReleased|filmSettled` | natural home for public "acquired/closed" receipts (PUBLIC AFTER EVENT) |
| `CorporateEventId`, `ownershipEvents` | P16+ (reserved names) | not in code | roadmap `:260`, `:277` | the P16 root |

---

## 3. Design implications for P16 — **INFERENCE (this dossier's reasoning, not authority)**

1. **Book net worth is a derived P16 read model over existing typed facts, not a P11 fact.** The only defensible "accounting asset" numbers that exist are: literal cash; net capital committed/recovered (ledger); the exploit-hardened liquidation credits (`0.5 × current blueprint capex`, `0.35 ×` for Sets); and remaining guaranteed salary as the only typed liability. P16 may *define* BOOK NET WORTH = cash + liquidation credit of plant − remaining guarantees − (any P16 debt) without touching P11, provided it never displays it as "Cash" or "Net worth" on P11 surfaces (A4). For rivals it must be computed from `RivalAccount.cash`, `hollywood.employment` guarantees and abstract capacity (no plant credit exists — B1), and disclosed only under a new due-diligence law (A6).

2. **Debt must enter, if at all, as a new typed obligation family with the Owner gate P11 already named.** No ledger category, no liability record, no interest exists. Recommendation: do not make "DEBT/LIABILITIES" a transfer category in the first P16 slice; treat "liabilities" = remaining contract guarantees + committed production occupancy, which already exist and already transfer with the people/projects (D2, F4). If financing leverage is wanted as an anti-snowball lever, charter it as `P11-REQ-041` activation, not inside P16C.

3. **Cash transfer is trivial; obligations are the real bundle.** "Does acquired cash become buyer cash?" — nothing prevents a signed ledger row (`acquisitionProceeds`-class kind) crediting the buyer with the target's `cash` (which may be negative → the buyer absorbs a negative row). The register discipline (A2) demands a new `LedgerKind` with a `corporateEventId` correlation rather than a `production`/`boxOffice` abuse.

4. **Employee contracts: statutory succession = P12 employer transition with a new reason; NOT P14D.** Because `contractId` embeds the employer (D2), "intact" means *same terms, same person, new employer row, receipt from→to, no new signing bonus, same `endWeekExclusive`*. P14D consent/compensation law is only needed if the Owner later wants talent to be able to refuse the successor. After succession, ordinary release at 50 % of remaining guarantee (D3) is the natural integration cost; flag that the fraction is tuning and that release is refused while a person is an active screenplay writer.

5. **Active productions transfer as (Production + participants + occupancy), cost basis carried by correlation, not by cash.** Direct commitment was prepaid by the target (F4). P16 should copy the `RivalProjectCosts`/ledger correlation into a buyer-visible "acquired direct commitment" so Film Contribution remains honest, and let the run (if released) credit the buyer only from the closing week onward; receipts already paid to the target are history. Because rival productions occupy *abstract* capacity (B1), absorbing them onto the player's physical lot requires a P05 reservation admission — the cleanest rule is "acquired in-flight productions finish in the target's abstract capacity until wrap, then Post/release under the buyer", which avoids teleporting stages and matches P12's "never compete for player's stage" (`…PACKAGE-12-BUILDER-ANNEX.md:243`).

6. **Physical property: automatic liquidation at closing is the only option that reuses existing law without a second lot.** Rival targets have no plant to keep (B1); player-as-target is not a scenario. Recommend assignment §2.G option 1 with the liquidation credit = the abstract capacity's `capacity` entry cost × the facility refund fraction (both exist: `RivalMoneyKind 'capacity'` paid once at entry; `FACILITY_DEMOLITION_REFUND_FRACTION`). Option 3 ("remote property as financial asset") would need a new root modelled on `StudioFacility`; defer unless remote lots are ever wanted. Option 4 ("transferable equipment") should wait for the P13/P09 `ConversionRequirementDescriptor.installedEquipment` field to exist (B3).

7. **Technology: inherit completed knowledge as a new buyer adoption row at `readyToAdopt`, cite the target's provenance, do not move in-flight work.** This satisfies the Owner's "III knowledge transfers, buyer still installs" test exactly (C3), respects P13-OD-06 (C4), and reuses the closure disposition manifest (C5) with one added disposition value. The inventor-price advantage can pass as a `TechnologyRightsRecord{holderStudioId: buyer}` while `InventionProvenance.studioId` stays the target (C6) — which also preserves "who invented" for history. If the Owner wants *in-flight* research to transfer, that is an explicit amendment to P13-OD-06, the smallest form being "retained work may move once, to a successor studio named in an all-owner transition manifest".

8. **Standing does not transfer; brand/label does.** Standing is per-studio current reputation with exactly three mutation sources (E3). A retained label (MODEL C/D) should be a P16 record referencing the dormant/absorbed `StudioId` for display and history, never a copy of channels or a fourth channel.

9. **Corporate history belongs in two places already reserved: a public `IndustryReceipt` kind (rival-visible, PUBLIC AFTER EVENT) and the `ownershipEvents` root keyed by `CorporateEventId`; the player's `studioHistory` may get a `corporate` kind for the player's own transactions.** Do not overload `StudioHistorySubject{kind:'studio'}` (it is self-referential today — E1).

10. **Library value: keep historical value and cash value separate by construction.** Because a completed run is terminal (F1), "library value" in a valuation should be a *strategic* term (count/quality of owned FilmIds and StoryProperties, awards where modelled) with **zero** cash-flow weight until P16's own reissue mechanic (F2) or P18 channels exist. Any reissue is a *new* `TheatricalRun` for an existing `productionId`, with the P13 first-filming lock left untouched.

11. **Asset-sale exploits: reuse the two existing anti-flip rules.** (i) Sale value strictly below acquisition/build cost (the `< 1` refund law, `tuning.ts:1605-1609`); (ii) a vesting curve before full sale value (Prima's eight-year Star rule, D6) can be transplanted to Story Properties/library rights as "rising fraction of appraised value for N years after acquisition". Duplicate ownership is prevented by making the P16 owner relation single-valued per rights bundle and by keeping `FilmIdentity.studioId` immutable (F3).

12. **Package boundary (assignment §2.T).** The evidence supports P16A/B/C as proposed, with these ownership edges: P11 keeps wallet/ledger kinds and any debt gate; P12 keeps StudioId registry, status commit, employer transitions (new reason values are P12 schema); P13 keeps adoption/provenance and adds the transfer disposition; P14D stays parked (only consent/compensation would pull it in); P15 keeps the distress predicate and the closure manifest; P16C consumes that manifest as its absorption transaction. Nothing found here argues for a P16D except *debt/financing*, which is better left as the P11 Owner gate than folded into P16.

---

## 4. Open questions

1. **Route vs entitlement for inherited knowledge (C3/C6).** Does P13 add a fourth `route`/`routeProvenance` value (`acquired`) or express inheritance purely through `entitlementClass: transferred` / `TechnologyRightsRecord`? The docs sketch both; only Current Ops/P13 can dispose.
2. **In-flight research at absorption (C4).** Owner decision: lose it (cancel with receipt, retained work stranded on the dead StudioId) or amend P13-OD-06 with a one-time successor exception.
3. **Successor-employer reason code and player-side mirror (D2).** `recordPlayerEmployment` derives reasons by diffing `state.contracts`; an acquisition path must bypass that diff (or it will label assumed contracts `'player-contract'`). Engineering detail, but it decides whether the transition is recorded truthfully.
4. **Signing-bonus double-charge guard (D2).** Copying `Contract.signingBonus > 0` into the buyer's `state.contracts` must not trigger any signing debit; needs an explicit invariant test.
5. **Where scheduled receipts of an acquired active run go (F1/§3.5).** Closing-week split of `TheatricalRun` payments between target history and buyer cash is undecided by any doc.
6. **Disclosure law for valuation (A6).** Which target facts become visible to a bidder (cash, guarantees, project costs, adoption state) is NOT YET AUTHORIZED; P16 must define it or valuations will be opaque.
7. **Historical negative/marketing split (F4).** If P16 wants acquired films' Contribution shown by component, `P11-REQ-034` (frozen split) must be activated first; otherwise show the combined direct commitment only.
8. **Calendar-year windows (A7).** Trailing-revenue valuation inputs have only 13/52-week producers; whether P16 waits for era summaries or defines its own window.
9. **Does a retained label ever get a Standing view?** P08 forbids a fourth channel and any inheritance producer; if the Owner wants "label prestige", it must be a P16-authored, P08-reviewed presentation, not Standing.

---

## 5. Source table

| Source | Class | Locators used |
|---|---|---|
| `pkg-docs/docs/design/CODEX-FINANCE-EXECUTIVE-UX-PACKAGE-11.md` (P11 @ d6c38546) | PKG | 48, 52-55, 102, 132, 260, 266-268, 311-332, 377, 380, 441, 517, 559, 603-613, 637-641, 707, 717-737, 806-816, 1056-1058, 1254, 1263, 1269-1275, 1299-1306, 1323, 1374, 1410, 1462-1472 |
| `pkg-docs/docs/design/CODEX-FINANCE-EXECUTIVE-UX-PACKAGE-11-BUILDER-ANNEX.md` | PKG | 124-125, 143, 707, 715, 731-732, 770 |
| `p12-accepted/docs/engineering/P11A-DECISION-AND-REQUIREMENT-REGISTER.md` | APPROVED DOC | 122, 130, 133, 137, 140-141, 150, 187-196 |
| `p12-accepted/docs/engineering/P11-TO-P12-PRODUCER-HANDOFF.md` | APPROVED DOC | 27-37, 75 |
| `p12-accepted/docs/engineering/P12-TO-P13-PRODUCER-HANDOFF.md` | APPROVED DOC | 12-15, 27-28 |
| `p12-accepted/docs/engineering/P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md` | APPROVED DOC | 159-176, 186-197, 274-276, 355-375, 394-405, 417 |
| `pkg-docs/docs/design/CODEX-STUDIO-GROWTH-CONSTRUCTION-PACKAGE-09.md` (P09 @ 91ed234c) | PKG | 46, 55, 92, 120, 296-317, 593-606, 627-649, 853-867, 913-920, 983 |
| `pkg-docs/docs/design/CODEX-STUDIO-GROWTH-CONSTRUCTION-PACKAGE-09-BUILDER-ANNEX.md` | PKG | 183, 186-187, 261-262, 448 |
| `p13-docs/docs/design/FACILITY-UPGRADES-AND-STUDIO-OVERVIEW-01.md` | APPROVED DOC (unscheduled; mechanics not approved) | 72-76, 91, 101, 152-161, 165-179, 183-187, 193, 215-227 |
| `p13-docs/docs/design/FACILITY-MODERNIZATION-CURRENT-OPS-REVIEW.md` | APPROVED DOC | 153-176 |
| `p13-docs/docs/design/STUDIO-UPGRADE-AND-RESEARCH-CATALOGUE-01.md` | APPROVED DOC (catalogue; hypotheses labelled) | 318-319, 323, 382-386, 390-400, 406-416, 719, 770 |
| `p13-docs/docs/design/CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13.md` | APPROVED DOC | 86-87, 98-103, 125-134, 144, 150, 166, 177, 443-445, 455-460, 467, 471, 521-526, 536-555, 565-580, 638-643, 687, 700-704, 712-724, 728-733, 850-855, 869-877, 1069-1070, 1148-1150 |
| `p13-docs/docs/design/CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13-BUILDER-ANNEX.md` | APPROVED DOC | 195-203, 288, 306-345, 353, 415-460, 697-741, 996, 1009-1011 |
| `p13-docs/docs/design/CODEX-TALENT-MARKET-RELATIONSHIPS-CAREER-LIFECYCLE-PACKAGE-14.md` | APPROVED DOC | 69-72, 76, 100, 142, 166, 266, 357, 375-382, 649-661, 682-705 |
| `p13-docs/docs/design/CODEX-TALENT-MARKET-RELATIONSHIPS-CAREER-LIFECYCLE-PACKAGE-14-BUILDER-ANNEX.md` | APPROVED DOC | 61, 158-167, 261 |
| `pkg-docs/docs/design/CODEX-STARS-CAREERS-STAFF-PACKAGE-10.md` (P10 @ 6a5d41ec) | PKG | 105, 521-527, 565, 597-613 |
| `pkg-docs/docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12.md` (P12 @ a0739055) | PKG | 167, 869-885, 907-927 |
| `pkg-docs/docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12-BUILDER-ANNEX.md` | PKG | 204, 206, 216-217, 222, 243-244, 533 |
| `pkg-docs/docs/design/CODEX-AWARDS-STANDING-PACKAGE-08.md` (P08 @ 438708c5) | PKG | 284-296, 300-309, 342-354, 672-683, 701, 843-862, 866-885 |
| `pkg-docs/docs/design/CODEX-RECEPTION-BOXOFFICE-PACKAGE-07.md` (P07 @ da031218) | PKG | 464-475, 479-486, 511-512, 520-546, 759, 802-816, 840-843, 866, 958 |
| `p13-docs/docs/design/CODEX-P13-P15-LONG-RANGE-ROADMAP.md` | APPROVED DOC | 241, 250, 259-260, 273-277, 693-704 |
| `p13-docs/docs/design/CODEX-P13-P15-OWNER-RULINGS.md` | OWNER RULING | 60-64, 89-104, 112, 129, 220-222, 232-234, 249-263 |
| `p13-docs/docs/design/CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md` | APPROVED DOC | 246-262, 404, 467-486, 606-627, 841-861 |
| `p12-accepted/src/core/hollywoodTypes.ts` | CODE | 6-17, 19-46, 47-48, 49-61, 62-68, 79-95, 96-103, 105-124 |
| `p12-accepted/src/core/industryEmployment.ts` | CODE | 10-35 (esp. 25, 29-32) |
| `p12-accepted/src/core/hollywood.ts` | CODE | 88-95, 98-105, 180-185, 196 |
| `p12-accepted/src/core/hollywoodTick.ts` | CODE | 99, 129, 242, 270 |
| `p12-accepted/src/core/types.ts` | CODE | 198, 225-239, 241-264, 267-271, 291-296, 304-316, 318-343, 352-364, 378-394, 491-494, 548-559, 642-646, 1590-1660, 1689-1690 |
| `p12-accepted/src/core/employment.ts` | CODE | 172-180 |
| `p12-accepted/src/core/placement.ts` | CODE | 1026-1028 |
| `p12-accepted/src/core/tuning.ts` | CODE | 390-391, 754, 816, 1597-1613 |
| `p12-accepted/src/core/financeReport.ts` | CODE | 6-21, 44-49 |
| whole-tree grep `src/core/*.ts bridge/*.ts` for debt/loan/liability/depreciation/netWorth/valuation | CODE | 0 hits (comment at `tuning.ts:1601` only) |
| `original-corpus/prima_eguide.txt` | PRIMA (developer-reviewed) | 28 (Sell Building, depreciated portion), 519 (Star market value, eight-year vesting) |
| Web | — | none used; nothing failed |
