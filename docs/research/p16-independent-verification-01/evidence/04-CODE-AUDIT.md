# Dossier 04 — READ-ONLY CODE ARCHITECTURE AUDIT of CURRENT/ACCEPTED CODE (P16 research)

Assignment §1 item 4; §2.F, H, I, T. Evidence agent: code audit. Date: 2026-09-11.

All paths below are relative to the export root
`<read-only export of accepted commit 13370d42>/`
(= full tree of the Owner-accepted P12 R05 closeout commit `13370d428f0693f3279732f6f4cc360a7fcaa4df`; `src/` identical to accepted runtime TS `592e926b`). Everything cited from this tree is **CURRENT/ACCEPTED CODE**. Documents under `p13-docs/` are **APPROVED DOCUMENTATION** (P13–P15 docs-only branch, not a descendant of the accepted code). The assignment's §2 direction is **OWNER-SELECTED NEW DIRECTION**. Anything I propose is **FUTURE RECOMMENDATION / INFERENCE** and is labelled as such.

---

## 1. Scope

Answer the ten audit questions (identity primitives, studio registry, finance, films/library, people/contracts, productions, facilities/lot, technology, save/migration/determinism, projection/visibility) strictly from the accepted code, then produce a structural hazard list for P16 (StoryProperty / rights / asset transfer / whole-studio acquisition). No design is reopened here; hazards state an exact code fact, why an acquisition/rights/transfer law would collide with it, and the smallest design-level correction.

Out of scope: original-game corpus, comparators, real-world M&A (other dossiers). Nothing under `ui/` was audited beyond what `bridge/` reads.

## 2. Method and sources consulted

- `grep -n` / `sed -n` / `cat -n` over `src/core/*.ts`, `src/core/data/`, `bridge/*.ts`, `bridge/runtime/*.ts`, `bridge/schema/industry-schema.ts`. No file was edited; no test/build/game/Unity was run; no repository worktree was touched.
- Read in full: `hollywoodTypes.ts`, `hollywood.ts`, `hollywoodStartingData.ts`, `hollywoodValidation.ts`, `hollywoodTick.ts`, `productionIdentity.ts`, `industryEmployment.ts`, `industryCareer.ts`, `economy.ts`, `bridge/industry.ts`, `bridge/schema/industry-schema.ts`. Read in targeted ranges: `types.ts`, `save.ts`, `actions.ts`, `scriptDevelopment.ts`, `screenplay.ts`, `castingSessions.ts`, `operations.ts`, `productionPhases.ts`, `releaseAuthority.ts`, `studioCalendar.ts`, `placement.ts`, `sets.ts`, `construction.ts`, `facilityEffects.ts`, `blueprintRequirements.ts`, `lot.ts`, `tick.ts`, `rng.ts`, `economyView.ts`, `financeReport.ts`, `fixedCostAllocation.ts`, `employment.ts`, `tuning.ts`, `worldgen.ts`, `studioRunRecap.ts`, `bridge/runtime-checkpoint.ts`, `bridge/runtime/campaign-library.ts`.
- Prior-prose cross-checks: `docs/engineering/P12-TO-P13-PRODUCER-HANDOFF.md`, `docs/engineering/P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md` §15, `p13-docs/docs/design/CODEX-P13-P15-LONG-RANGE-ROADMAP.md` §8/§9, `CODEX-P13-P15-OWNER-RULINGS.md` §5, `CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md` §9/§12.3/§13.
- `src/core/data/` contains only `screenplay.ts` (beat templates / title leads) and `wordlists.ts`; nothing identity- or ownership-bearing.
- Web: not needed for a code audit; no web fetch attempted. **Nothing failed.**

Confidence convention: HIGH = verbatim code read at the cited line; MEDIUM = code read plus a small inference; LOW/UNVERIFIED = stated as such.

---

## 3. Findings

### Q1 — Identity primitives

**F1.1 — studioId is minted once from the world seed, with a fixed 1+9 layout.**
- Source: `src/core/hollywood.ts:107-125`.
- Locator: `hollywoodWorldKey` → `stream(seed,'hollywood-v1','identity')…toString(16)` (107-109); player `uniqueIdentity(\`studio-${key}-player\`,taken)` (116); rivals `\`studio-${key}-r${String(index+1).padStart(2,'0')}\`` (121). `uniqueIdentity` (18-23) appends `-1,-2,…` only on collision against the set of talent ids + concept ids (114-115).
- Validator: `hollywoodValidation.ts:72` `'exactly player plus nine reserved studios'`; `:78` `'reserved studio identity differs from its world'` (regex-pins the base id); `:79` `'studio identity collides with an existing person or concept'`.
- Proves: StudioId namespace is world-derived, deterministic, and closed at 10; there is no minting path for an 11th studio and no rename of the id.
- Confidence: HIGH. Prior prose: CONFIRMED (handoff row "Studio identity": "One player plus nine reserved rival IDs").

**F1.2 — talentId / PersonId minting has four schemes, uniqueness checked at load.**
- `t-<role3>-NN` (worldgen, `worldgen.ts:45,516`); `authored-NNNN` (`actions.ts:266-274`); rival entry team `person-${studioId}-${index}` (`hollywood.ts:170`); rival supply `person-${studioId}-supply-${week}-${slot}` (`hollywoodTick.ts:122`), all through `uniqueIdentity`. Load-time uniqueness: `save.ts:2219-2225` `"is duplicated"`.
- Proves: PersonId is global (not studio-scoped) even when its *string* embeds the minting studio; the embedded studio is provenance only. Nothing re-mints a person on employer change.
- Confidence: HIGH. Prior prose (roadmap §9 "PersonId … Employer transfer … cannot copy/remint"): CONFIRMED.

**F1.3 — contractId EMBEDS the employer studioId and the start week, and the validator enforces the exact format.**
- Rival: `hollywoodTick.ts:99,129` `\`${b.studioId}:contract:${person.id}:${week}\``; entry `hollywood.ts:180`. Player mirror: `industryEmployment.ts:30` `\`${owner}:contract:${terms.talentId}:${terms.startWeek}:player-${ordinal}\``.
- Validator: `hollywoodValidation.ts:163` `requireFact(e.contractId===\`${e.studioId}:contract:${e.terms.talentId}:${e.terms.startWeek}${player?\`:player-${ordinal}\`:''}\`,'contract identity differs from actual interval start')`; `:159` `'contract identity collision'`.
- Proves: a contract row cannot change `studioId` without its id becoming invalid. "Contract transfer" cannot be a mutation of `IndustryEmployment.studioId`; it must be end-old-row + new-row (the pattern renewal/replacement already use, `hollywoodTick.ts:100-106`).
- Confidence: HIGH. Prior prose (roadmap §9 lists `ContractId` among "Stable IDs"): QUALIFIED — stable, yes, but not employer-neutral; the id is a function of employer.

**F1.4 — Player production ids `prod-NNNN[-k]`, rival production ids `${studioId}:film:${scriptOrdinal}`; both are reserved against the complete persisted walk.**
- `actions.ts:241-247` (`prod-${startTick padded}` + smallest free `-k`); `hollywoodTick.ts:159` `uniqueIdentity(\`${b.studioId}:film:${Number(ready.id.slice(7))}\`,persistedProductionIds({...state,hollywood:h}))`.
- `productionIdentity.ts:9-101` walks player active/released/runs/ledger/careerEvents/broadcast/coverage/workflows/scriptDevelopment/releaseAuthority/studioEvents/queue/studioHistory AND `hollywood.films/careerEvents/businesses.{productions,projects,development,runs,releaseAuthority,operations}/receipts` (75-98). Comment 4-8: "A production identity remains authoritative after the live Production disappears … Any allocator or cross-domain reservation gate must therefore collide against every persisted consumer."
- `save.ts:1409` validates a production id only as a non-empty string (no format regex) — a rival-format id inside `state.studio.activeProductions` would pass *this* check.
- Proves: production/film identity is globally unique across studios, format-free at the save boundary, and the walk is the ONE place a new identity-bearing root must be added ("in BOTH directions the week it lands", 45-46).
- Confidence: HIGH. Prior prose (roadmap §9 FilmId/productionId preserved through ownership views): CONFIRMED as the *intent*; no ownership view exists yet.

**F1.5 — conceptId: pool `c-NN` (shared world), player-minted `concept-orig-NNNN`, rival-minted `${studioId}:concept:${ordinal}`; concept ownership is implied by container/costed-owner, not by a field.**
- `screenplay.ts:71-90` (`ORIGINAL_CONCEPT_ID_PREFIX`, four-wide ordinal; "Identity is permanent, never recycled, never reformatted" 15-22); `hollywoodTick.ts:183` rival mint; reservation walk `productionIdentity.ts:130-163` (five player roots + blueprints + history + hollywood).
- `FilmConcept` (`types.ts:154-163`) has NO owner/studio field and is a frozen leaf ("never widened (guardrail 00B.4)", `screenplay.ts:24-27`). Player-studio provenance for an original lives on `MovieBlueprint` (`types.ts:1416-1431`: `conceptId, ordinal, mintedWeek, projectId, writerId, generatedTitle, renamedWeek, beats, officeTierAtMint`). Rival ownership is the costed-owner join: `hollywoodValidation.ts:286` `'original screenplay concept has more than one costed owner'` and `:332` `'original screenplay concept has no costed owner'` (via `RivalProjectCosts.conceptId`).
- `screenplay.ts:465-475` rename refusal copy: "Only a screenplay this studio wrote can be retitled. Premises acquired from the market keep the name they came with." — the accepted code already distinguishes *studio-original* (blueprint `ordinal !== null`) from *market-sourced* (pool `c-NN`, `ordinal: null`) material.
- Proves: there is no explicit "who owns this concept" fact; ownership is derivable only from which studio's development array / cost row references it. A StoryProperty cannot be inferred from `FilmConcept` alone without a new root.
- Confidence: HIGH. Prior prose (consumer contract §15: "A P12 concept … is not itself a StoryProperty"): CONFIRMED.

**F1.6 — scriptProjectId is `script-NNNN` where NNNN IS the array index in the OWNER'S `development.projects`; both player and every rival use the same namespace.**
- `scriptDevelopment.ts:64-73` `canonicalScriptProjectId(index)` / `nextScriptProjectId = canonicalScriptProjectId(development.projects.length)`; invariant `:969-971` `project.id === canonicalScriptProjectId(index)`, message `'project at index N must be script-NNNN'`. Rival commission `hollywoodTick.ts:179,204` `ordinal=b.development.projects.length … canonicalScriptProjectId(ordinal)`. The engine *recovers the index from the id string*: `Number(p.id.slice(7))` at `hollywoodTick.ts:44,46,59,151,159,170,241`.
- Proves the handoff claim ("Scope business-local `scriptProjectId` by studio owner and active campaign", `P12-TO-P13-PRODUCER-HANDOFF.md:14`): **CONFIRMED and sharpened** — the id is not merely business-local, it is *position-bound*. Implication for transferring an in-flight project between studios: the id **would collide** (player and rival both have a `script-0003`) AND cannot be carried over even if free, because the receiving studio's invariant requires `id === index`. A transferred script must be re-minted as `script-<receiver's next index>`; the source id survives only as a provenance reference (and `LiveIndustryFilm.scriptProjectId`, `RivalProjectCosts.scriptProjectId`, `MovieBlueprint.projectId` all keep pointing at the *source-scoped* id).
- Confidence: HIGH. Prior prose (roadmap §9 "never infer identity from … array position"): QUALIFIED — accepted code does exactly that for script ids, `conceptOrdinal` (`hollywoodTypes.ts:72`, validated `hollywoodValidation.ts:285`), `activeScriptOrdinals` (`:262`), `activeRunFilmOrdinals` (`:263`) and `activeEmploymentOrdinals`.

**F1.7 — Facility, placement, set, casting-session and release-commitment ids.**
- `PlacedFacility.id` monotonic integer via `StudioPlacement.nextPlacementId` (`types.ts:1042-1057`; `placement.ts:705,743,1046,1092` "ids are never reused"); `facilityId` string from blueprint `facilityIdBase` (numbered instances); rival facilities are literal `${studioId}:development|stage|scenery|post` (`hollywood.ts:98-105`). Sets `'set-'+nextSetId` (`types.ts:1337`; `sets.ts:486,505`). Casting `casting-NNNN` = index (`castingSessions.ts:74-83`). Release commitment `release-commitment-<productionId>` (`types.ts:1529-1536`, `hollywoodValidation.ts:279`). Technology ids: none (see Q8).
- Proves: every per-studio id family is either owner-array-positional (script, casting) or owner-string-prefixed (rival facilities/contracts/concepts/productions). Only PersonId, pool conceptId, and the player's `prod-`/`concept-orig-`/`set-`/placement ids are owner-neutral in form.
- Confidence: HIGH.

**F1.8 — Which fields currently encode "which studio owns/created this".**
Verbatim:
- `FilmIdentity.studioId` (`hollywoodTypes.ts:20-27`) — on every `IndustryFilm`. Validator `hollywoodValidation.ts:141` `'film owner inactive/unknown'`; `:318` `'archived film credit lacks historical employer authority'` requires the credited people to have been employed by *that* `studioId` at commission/announcement week. → **`studioId` here means "created/released by", and the validator binds it to historical employment; it is not a transferable "current owner".**
- `RivalBusiness.studioId` (`:80`), `RivalProjectCosts` (owner by container `b.projects`), `RivalBusiness.productions[]`, `.development.projects[]`, `.runs[]` — **ownership by container position**.
- `IndustryEmployment.studioId` (`:64`) — current employer of a contract interval; also inside `contractId` (F1.3).
- `IndustryReceipt.studioId` (`:96`) + employment `fromStudioId/toStudioId` (`:98`).
- Player side: `state.studio.releasedFilms: FilmResult[]` (`types.ts:291-296`; `FilmResult` 241-265 has **no studioId and no title**), `state.studio.activeProductions`, `state.contracts: Contract[]` (`Contract` 336-343 has **no studioId**), `state.scriptDevelopment.projects` — all **ownership by container**. The industry projection re-derives it: `bridge/industry.ts:56` `studioId:h.playerStudioId`.
- `TalentCareerEvent` (`types.ts:1708-1737`) has `talentId, filmId` but no studio; `HollywoodCredit` (`hollywoodTypes.ts:19`) has no studio.
- Confidence: HIGH. Prior prose (consumer contract §15 "P12 preserves … the exact original creating studio for every work"): CONFIRMED for rival films; **QUALIFIED for player films** (creator studio is implicit in the container, not a stored field).

### Q2 — Studio registry

**F2.1 — `StudioIdentity` has exactly ten fields and NO status/dormant/closed/acquired/successor field.**
- `hollywoodTypes.ts:6-17`: `studioId, role:'player'|'rival', row, name, mark, color, founding, eligibleWeek, enteredWeek, recordedFromWeek`. Validator `hollywoodValidation.ts:75` `exact(s,['studioId','role','row','name','mark','color','founding','eligibleWeek','enteredWeek','recordedFromWeek'])`.
- The only lifecycle is *not entered → entered*: `:91-99`. Post-entry there is no further state.
- Confidence: HIGH. Prior prose (handoff: "Current `StudioIdentity` has no dormant/closed status field"): CONFIRMED.

**F2.2 — Display identity is LOCKED to the starting manifest; the player is hard-named.**
- `hollywoodValidation.ts:82` `requireFact(s.name===template.name&&s.mark===template.mark&&s.color===template.color,'studio display identity differs from starting manifest')`; player `name:'Your Studio', mark:'YOU'` (`hollywood.ts:118`); `bridge/runtime/campaign-library.ts:49` shows `studioName: state.hollywood?.identities[0]?.name`.
- Proves: no rename, no "retain brand as label" relabel, and no player studio name exists in state today. Any label/brand fact must be a new field or root.
- Confidence: HIGH. Prior prose (roadmap §9 "Display names are labels. Every name change is a dated event"): QUALIFIED — no such event or rename path exists in accepted code.

**F2.3 — Every entered rival MUST have a live `RivalBusiness`, and every business keeps operating every week.**
- `hollywoodValidation.ts:331` `requireFact(businesses.size === h.identities.filter(s=>s.role==='rival'&&s.enteredWeek!==null).length,'entry missing business')`; `:205` `'duplicate/unknown business'`. `hollywoodTick.ts:221-288` iterates `for(const b of h.businesses)` unconditionally: staff, decide, operate, release, pay runs, payroll/overhead/opex.
- Proves: there is no representation of "operations ended". An absorbed studio cannot be stopped without (a) removing its business (validator fails) or (b) leaving it running (it keeps hiring and greenlighting).
- Confidence: HIGH. Prior prose (P15 §12.3 dormant/closure lifecycle): NOT IMPLEMENTED (consistent with docs saying so).

**F2.4 — Initialisation and the nine reserved rivals.**
- `HOLLYWOOD_STARTING_MANIFEST.studios` (`hollywoodStartingData.ts:8-38`): Bellwether Pictures (1901, $32M), Rose Lantern Films (1902, $29M), Night Orchard Productions (1906, $23M), Silver Current Pictures (1917, $20M), Marigold Motion Pictures ($24M), Blackthorn Screenworks ($26M), Trailhead Pictures ($34M), Copper Kite Films ($28M), Bright Meridian Studios ($38M). Arrival weeks `RIVAL_ARRIVAL_WEEKS=[0,0,0,0,520,988,1560,1872,2548]` (`calendar.ts:3`), validated `:86`. Entry (`hollywood.ts:139-201`): pays capacity capex once ($1.5M+$2.4M+$0.85M+$1.15M = $5.9M, `:158-160`, tuning 684/697/708/729), signs six people on 208-week terms (`:167-187`), authored rows 1-4 get two pre-campaign films each (`:195-199`), validated as canonical (`hollywoodValidation.ts:113-128`).
- `hollywood.ts:97` comment: "New root only; null is the historical non-player harness, never a native campaign."
- Confidence: HIGH.

**F2.5 — What would be minimally needed to record "independent operations ended / successor owner" without reminting (INFERENCE from F2.1-F2.3).**
- Because `HollywoodState` is `version: 1` with `exact(value,[…18 keys])` (`hollywoodValidation.ts:59-60`) and `StudioIdentity` is `exact(…)`, *any* new field inside `hollywood` requires bumping `hollywood.version` and the validator; the code precedent for additive state is a **new top-level GameState root under a new SaveFile version** (V16 `releaseAuthority`, V17 `studioHistory`, V18 `foundingRegime`, V19 `hollywood`). The smallest shape: one append-only root of dated corporate events keyed by exact `studioId` (`{eventId, week, studioId, kind:'independentOperationsEnded'|'acquired'|'closed', successorStudioId|null, label…}`) + a derived "operating" predicate that (i) `hollywoodTick` consults to skip a business and (ii) `hollywoodValidation.ts:331` consults to permit an entered-but-ended identity without a live business (or with a frozen one). No field on `StudioIdentity` needs to change; `studioId` is never re-minted.
- Confidence: MEDIUM (inference). Prior prose (roadmap §8 `ownershipEvents` root "P16+ only", `:260`; roadmap §9 "closure, acquisition … appends events; none remints the studio"): CONFIRMED as direction.

### Q3 — Finance

**F3.1 — Player cash = `state.studio.cash`, reconciled EXACTLY to `INITIAL_CASH + Σ ledger` (or a V11 checkpoint).**
- `types.ts:291-296` `Studio = {cash, standing, activeProductions, releasedFilms}`; `tuning.ts:70` `INITIAL_CASH: 20_000_000`; invariant `construction.ts:391-437` `'studio cash must equal initial cash plus the ordered ledger'`. Every cash movement writes a typed `LedgerEntry` (`types.ts:352-465`), e.g. `tick.ts:918-931` payroll/overhead, `actions.ts:2713-2722` termination, `placement.ts:739-740`, `sets.ts:506-507`.
- `LedgerKind` is a CLOSED union (`types.ts:390-394`: `production, boxOffice, payroll, signingBonus, termination, freelancerFee, studioRevenue, overhead, publicity, constructionCapex, facilityOpex, facilityDemolitionRefund, setCapex, setMaintenance, setDemolitionRefund`); the finance view is compile-guarded `KIND_FIELD: Record<LedgerKind, keyof FinanceTotals>` (`economyView.ts:456-491`, "a new LedgerKind [is] a type error here until it is given a home"); save validators enumerate kinds per version (`save.ts:953-983`, `:1877-1889`).
- Proves: the ledger/receipt pattern an acquisition payment must use = one signed row per movement with its own `kind`, correlation id, and `note`, added to (a) `LedgerKind`, (b) `KIND_FIELD`/`FinanceTotals`, (c) the version-scoped kind list in `save.ts`, (d) the invariants that prove the row against its subject (precedent: `facilityDemolitionRefund` must share `constructionProjectId` with one prior capex row, `types.ts:436-448`). Cash never moves without a row.
- Confidence: HIGH. Prior prose (handoff "Financial boundaries": "Preserve literal accounting, exact receipts"): CONFIRMED.

**F3.2 — Rival cash = `RivalAccount.cash` with per-year reconciled periods and SIGN-LOCKED, kind-enumerated movements.**
- `hollywoodTypes.ts:47-61`: `RivalMoneyKind = 'capacity'|'signing'|'payroll'|'overhead'|'facilityOpex'|'development'|'production'|'marketing'|'studioRevenue'`; `RivalAccount = {openingBalance, openingBasis:'before-capacity-and-signing', cash, periods[]}`. Mutation only via `moveRivalMoney` (`hollywood.ts:31-42`).
- Validator reconciles every kind to its cause: `hollywoodValidation.ts:220` movements must be `≤0` except `studioRevenue ≥0`; `:226` `openingBalance === template.capital`; `:228-229` `'capacity acquisition not paid exactly once'`; `:236` signing = Σ bonuses; `:238` payroll = Σ person-weeks; `:241` opex = elapsed × capacity opex; `:242` development/production/marketing = Σ project costs; `:245` studioRevenue = Σ `studioRevenueReceived`.
- Proves: a rival cannot receive or pay an acquisition/asset-sale amount today — there is no kind for it, and every existing kind has a closed-form reconciliation rule. P16 must add rival kinds (at least one positive inflow kind and one outflow kind) plus their reconciliation predicates, and bump `hollywood.version`.
- Confidence: HIGH.

**F3.3 — NO debt, loan, liability, obligation, interest, insolvency, valuation, book value or depreciation record exists.**
- `grep -rni "debt|loan|liabilit|obligation|creditor|bankrupt|insolven|book value|depreciat|valuation|net worth"` over `src/core` and `bridge` hits only: `offerObligation` (a *display* of future guaranteed comp, `economyView.ts:302-330`; bridge copy `bridge/finance.ts:81` "Contract guarantees … are not an additional charge and are not subtracted from Cash"), depreciated *refunds* (F3.4), and `studioRunRecap.ts:1003` verbatim: "No recovery mechanic (loans/financing) exists in the current rules."
- Negative cash is allowed and merely flagged: `bridge/finance.ts:83` `runwayState==='inRed'` → "Cash is in the red. … voluntary decisions follow their own affordability rules." `releaseTalent` charges termination without an affordability gate (`actions.ts:2713-2722`).
- Proves: "book net worth" cannot be computed from accepted state (no asset register, no liabilities); the only balance-sheet-like facts are cash, the *net capital* bucket (`construction` = capex − refunds, `economyView.ts:467-472`), and the contract guarantee (`guaranteedComp`, `employment.ts:172-176`).
- Confidence: HIGH. Prior prose (handoff: "Negative Cash alone is not bankruptcy"): CONFIRMED.

**F3.4 — The only asset-realisation logic is a flat depreciated REFUND on demolition/strike, engineered so build-then-sell is always a net loss.**
- `placement.ts:1025-1028` `facilityDemolitionRefund = round(capex × FACILITY_DEMOLITION_REFUND_FRACTION)`; `tuning.ts:1613` `= 0.5`, with the law comment (1598-1604): "strictly less than 1, which is what makes build-then-demolish always a net loss and refund farming impossible. The invariant enforces that bound". Sets: `sets.ts:152-154`, `SET_DEMOLITION_REFUND_FRACTION: 0.35` (`tuning.ts:816`). Refund ledger rows are proved against a prior capex row (`placement.ts:1730-1740` "exact depreciated amount, no earlier than the spend and no later than now").
- Proves: there is no "sell building" verb distinct from demolish, no buyer, no market price — but the *pattern* (positive row correlated to the original capex row; fraction < 1 as an anti-flip law) is a direct precedent for asset sales.
- Confidence: HIGH.

**F3.5 — Ledger/receipt ordering and period pattern.** Player ledger rows carry `week` and are appended in pipeline order within a tick (`tick.ts:24-25` step order 0.5→8); finance history is windowed 13/52 weeks over recorded weeks (`financeReport.ts:33-49`). Rival periods roll per 52-week year (`hollywood.ts:34-37`). Industry receipts are a single monotonic sequence `industry-event-N` with `nextReceipt` high-water mark, no gaps, non-decreasing weeks (`hollywoodValidation.ts:349,353,380-381`). Confidence: HIGH.

### Q4 — Films / library

**F4.1 — What persists for a released film.**
- Player: `FilmResult` (`types.ts:241-265`: `productionId, releaseTick, delivered, cohesion, craft, criticMean/Sigma/Score, reviewVariance, segmentScores, boxOffice{opening,total}, conceptId, directorId, participants?, forecast?`) in `studio.releasedFilms` forever; `TheatricalRun` (`:303-317`) kept as history with `status 'active'|'completed'|'legacyCompleted'`, `cumulativeStudioRevenuePaid`, locked `weeklyGross[]`, `studioShare` (`STUDIO_RENTAL_BLENDED 0.52`, `THEATRICAL_WEEKS 6`, `tuning.ts:413-414`); `studioHistory` `filmReleased{title frozen AT RELEASE}` / `theatricalRunCompleted` (`types.ts:1626-1636`); `careerEvents` six per film; `studioEvents` `premiere`/`wrapped` (Tier D permanent).
- Rival: `LiveIndustryFilm` (`hollywoodTypes.ts:37-45`: `+ scriptProjectId, result: FilmResult, directCommitment, studioRevenueReceived, settledWeek, releaseCommitmentId`) and `AuthoredFilm` (28-36, pre-campaign, `settled: true`). Run canonicalised at load (`hollywoodValidation.ts:306-308`).
- Confidence: HIGH.

**F4.2 — There is NO post-settlement revenue of any kind.**
- Player: `tick.ts:745-775` credits only `run.status==='active'`; on `weekIndex>=totalWeeks` → `'completed'` and nothing thereafter. Rival: `hollywoodTick.ts:262-275` pays `weeklyGross[weekIndex]×studioShare`, sets `settledWeek`, removes the run; validator `:320-322` requires `studioRevenueReceived` of a settled film to equal the canonical run sum exactly.
- Proves: a "library" today is a frozen public record with zero cash flow; any library income is a new system. (Matches Owner direction §2.C "Do not invent perpetual weekly library cash before an owning distribution/media system actually exists".)
- Confidence: HIGH. Prior prose (P15 §9: "current `FilmResult` and production records identify works and outcomes but are not a library, IP-rights, chain-of-title, or ownership model"): CONFIRMED.

**F4.3 — The film ↔ script ↔ concept chain, and the absence of any story/property/title/characters entity.**
- Chain: `FilmConcept.id` ← `ScriptProject.conceptId` (`types.ts:680-700`; `productionId` link set at greenlight `scriptDevelopment.ts:linkScriptProjectToProduction`, status `produced` at release) ← `Production.conceptId` ← `FilmResult.conceptId`; player originals additionally `MovieBlueprint{conceptId, projectId, writerId, generatedTitle, beats[7], officeTierAtMint}` (`types.ts:1416-1431`; `screenplay.ts` law 2: "Every studio-relative fact … lives in the MovieBlueprint row instead"). Rival: `LiveIndustryFilm.scriptProjectId` + `RivalProjectCosts{scriptProjectId, conceptId, conceptOrdinal, productionId}` (`hollywoodTypes.ts:69-78`).
- `FilmConcept` fields (`types.ts:154-163`): `id, title, genre, baselineStrength, originalityRaw, baseNegativeCost, requiredSlots, roleRequirements`. No characters, no setting, no source/author/rights, no owner. `FilmConcept.title` is MUTABLE (player rename, `screenplay.ts:442-475`); only `careerEvents.filmTitle`, `BroadcastItem.template` and `studioHistory.filmReleased.title` freeze the historical title; `bridge/industry.ts:56` shows the *live* concept title for player films.
- Proves: the nearest anchor for a StoryProperty is `conceptId` (globally unique, permanent, never orphaned — "no abandon verb exists", `screenplay.ts:21-22`), with `MovieBlueprint` as the studio-original provenance witness and pool concepts (`c-NN`) as "acquired from the market". Nothing resembling "characters"/"property"/"title entity" exists.
- Confidence: HIGH. Prior prose (consumer contract §15: P16 "must create each property/library identity and origin-work relationship explicitly by exact ID; it may not infer or bulk-mint them"): CONFIRMED as constraint (see Open Question OQ-2).

**F4.4 — Shelved/unproduced scripts ARE persisted, indefinitely, for both player and rivals.**
- Player: `ScriptProject.status` (`types.ts:656-662`) includes `'ready'`; no delete/abandon verb (`screenplay.ts:21`, `actions.ts:2148-2149`); `applyCancel` returns the script to `'ready'` with no refund (`actions.ts:703-728`, `scriptDevelopment.ts:593-612`). Rival: `RivalBusiness.development.projects` keeps every project including `'produced'` (`hollywoodValidation.ts:262` index law), bounded to ≤2 *active*.
- Proves: a "sellable unproduced screenplay" already exists as persisted state with concept/shape/promise/assessment/writer attribution and sunk `RivalProjectCosts.development`; it has no owner field and a position-bound id (F1.6).
- Confidence: HIGH.

### Q5 — People / contracts

**F5.1 — `Contract` is employer-less; employer is the container (`state.contracts` = player) or `IndustryEmployment.studioId`.**
- `types.ts:336-343` `{talentId, annualSalary, signingBonus, startWeek, endWeekExclusive, termWeeks}`; `types.ts:319-322` "Employment/contract/ledger/founding state lives on GameState (studio-relative), NOT on Talent"; `studioEmployerId` (`hollywood.ts:60-65`) resolves player-first then rival interval. Confidence: HIGH.

**F5.2 — Transitions are recorded as `IndustryReceipt kind:'employment'` with `fromStudioId/toStudioId` and a closed reason enum; the reason enum has no transfer/assignment value.**
- `hollywoodTypes.ts:98-99`: reasons `'entry'|'renewal'|'replacement'|'expiry'|'termination'|'player-contract'|'existing-player-contract'`; interval reasons (`:67`) exclude `expiry/termination` (those are end receipts). Validator: `:165` rival intervals may only be `entry|renewal|replacement`, player only `renewal|player-contract|existing-player-contract`; `:358` an end receipt is `expiry` (at `endWeekExclusive`) **or `termination` only for the player studio** (`r.reason==='termination'&&r.studioId===h.playerStudioId`); `:362` a start receipt's `fromStudioId` is the same studio for renewal, else `null` — **there is no cross-studio `fromStudioId≠toStudioId` receipt shape**. Player transitions are mirrored from `state.contracts` by `recordPlayerEmployment` (`industryEmployment.ts:10-35`).
- Proves: a "contract transfers intact to the buyer" event has no lawful receipt today; P16 needs a new reason (e.g. `'assumed'`) with `fromStudioId = seller, toStudioId = buyer`, and the ledger cross-check must be relaxed for it (see F5.4).
- Confidence: HIGH. Prior prose (handoff "P12 records actual employer transitions"): CONFIRMED but limited to same-studio/entry/expiry.

**F5.3 — Termination/notice law: player pays 50 % of remaining guaranteed salary; rivals have NO termination path.**
- `employment.ts:172-180` `terminationCost = round(0.5 × weeklySalary × remainingWeeks)` (`HIRING_TERMINATION_FRACTION 0.5`, `tuning.ts:391`); action `actions.ts:2695-2725` (refused while the person is on an active script task). Rival contracts end only by expiry (`hollywoodTick.ts:296-305`) or early replacement-by-renewal (`:100-104`, validated `:399`). Renewal window 12 weeks (`tuning.ts:390`), rival contract term 208 weeks (`:28`).
- Proves: "release inherited staff under ordinary termination law" (§2.F Q4) is satisfiable *iff* inherited contracts become rows of `state.contracts` (then P10 law applies verbatim); a rival buyer has no equivalent verb (symmetry gap for §2.J).
- Confidence: HIGH.

**F5.4 — One-employer exclusivity is enforced at three layers.**
- Validator: `hollywoodValidation.ts:170` `'overlapping industry employers'` (interval overlap per person across all rows), `:173` `'double employer'` (rival interval vs live player contract), `:174` `'rival stole founding applicant'`. Engine: `employmentStatus` returns `'unavailable'` when `rivalEmployment` matches (`employment.ts:372-380`); rival staffing excludes `state.contracts` and busy ids (`hollywoodTick.ts:108-110`, "no player poaching" `:84`).
- Player-employment ledger coupling: `:397` every player employment row (other than observed/founding) must have a `signingBonus` ledger row at `startWeek` for exactly `−signingBonus` (`'employment start lacks its actual player signing payment'`); `:395` a termination receipt must match a `termination` ledger row.
- Proves: an assumed contract (bonus already paid by the seller) would fail `:397` unless the new reason is exempted — the coupling is by reason code, so the fix is local.
- Confidence: HIGH.

### Q6 — Productions

**F6.1 — What an in-flight production carries.**
- `Production` (`types.ts:225-239`): `id, conceptId, shape, promise, writerId, directorId, craftIds, cast{lead,antagonist,support}, budget{negative,marketing}, startTick, remainingTicks, forecastSnapshot, participants?`. Countdown 8→1 maps to phases (`productionPhases.ts:36-45`); phase capability multiset (`:52-62`: dev/pre → development-casting; rehearsal → soundstage; shooting → soundstage+set-scenery; post → post).
- Player-only companions: `ProductionWorkflow{reservations[{productionId,facilityId,capability,slot,phase}], shootingTask, blocker, bindings{requiresSetBinding, stageFacilityId, setId, lockedNovelty, lockedUplift, heldSinceWeek}}` (`types.ts:569-640`); `ScriptProject.productionId`; `CastingSession` (pre-greenlight, `:774-783`); `ReleaseCommitment` (exists ONLY for a tick-1 `releaseReady` picture; "ABSENCE MEANS UNCOMMITTED", `:1525-1536`) — there are **no committed release dates**, release happens the advance after commitment; `studioCalendar.ts:1-3` is "read-only projection … creates no schedule".
- Rival: same `Production` type with `participants` REQUIRED (`hollywoodValidation.ts:193` `'rival production requires frozen participants'`), a workflow in `b.operations` bound to `${studioId}:stage` etc., `RivalProjectCosts` (paid `development/production/marketing`, `announcedWeek`), `b.releaseAuthority`, at most one production at a time (`hollywoodTick.ts:146` `if(b.productions.length!==0)break`).
- Confidence: HIGH.

**F6.2 — Rival productions are abstract in exactly three ways.**
- (a) `requiresSetBinding` is `false`: `hollywoodTick.ts:166` calls `addManagedProductionWorkflow(b.operations, production, occupied)` with the default `requiresSetBinding=false` (`operations.ts:467-476`), whereas the player greenlight passes `state.nextSetId > 0` → `true` (`actions.ts:643-682`). Therefore rival shooting needs no `StudioSet`, no stage+set atomic composite (`operations.ts:262-316`), no novelty/condition lock.
- (b) No scenery travel: `operateStage` (`hollywoodTick.ts:67-82`) clears `scenery-load-in` immediately ("stage-local scenery has no simulated travel geometry"); the player path computes grid distance between facility bodies (`sceneryLoadIn.ts:183-215`).
- (c) Facilities are four fixed abstract capacity rows validated as immutable (`hollywoodValidation.ts:266-269` `'rival facilities differ from their costed configuration'`), with `facilityPolicy:'configured'` (`:270`), no placement, no property, no sets, no casting sessions, no queue.
- Confidence: HIGH. Prior prose (handoff: "Rival physical operations are abstract, not fabricated room/lot occupancy"): CONFIRMED.

**F6.3 — Could a rival in-flight `Production` be re-parented to the player with its `productionId` preserved? Concrete assessment.**
- Identity: YES in principle — `${studioId}:film:N` is globally unique (F1.4) and the player-side validators do not regex the id (`save.ts:1409`); `persistedProductionIds` already reserves it. Prior-prose "Maintain exact production IDs" (§2.H) is *achievable* for the Production itself.
- What would break (observed facts → inference):
  1. **Workflow reservations name rival facility ids** (`${studioId}:stage`); `operations.ts:906` `'reservation references unknown facility'` fails inside the player's `operations`. Fix: drop the rival workflow and re-allocate from scratch on the player's lot (`addManagedProductionWorkflow`) — which may REFUSE for capacity (`QueueableCapacityRefusal`, `operations.ts:507`) or block on `set-unavailable`.
  2. **Set binding**: a player-side picture greenlit at V14+ carries `requiresSetBinding:true`; a re-parented rival picture would arrive with `false` (grandfather class, `sceneryLoadIn.ts:190-194` "exact `false` has exactly two honest producers"). Either it shoots set-less on the player lot (asymmetry the code currently reserves for migrated saves) or the flag is minted `true` and the picture waits for a set.
  3. **Greenlight ledger evidence**: if the re-parented workflow reserves any *placed* (built) facility, `placement.ts:1815-1818` requires **exactly one `production` ledger row with that `productionId` at `week === production.startTick`**; a rival's `startTick` predates the transfer and no player ledger row exists. Fix: either a new correlation rule for assumed productions or an explicit ledger row kind (e.g. `productionAssumed`) at transfer week with `startTick` re-based (which then collides with `'advanced farther than its startTick permits'`, `:1811-1814`, unless `remainingTicks` is preserved and `elapsedProgress` law is satisfied by the new startTick). This is the single hardest constraint.
  4. **Script linkage**: the rival's `ScriptProject` with `productionId` set must move into `state.scriptDevelopment.projects` under a re-minted `script-NNNN` (F1.6), status `'inProduction'`, `writerId === production.writerId` (`scriptDevelopment.ts:1045-1049`), and for drafting/rewriting scripts the writer must hold a *player* contract (`:1108-1111` `'active project … writer is not contracted'`).
  5. **People**: `Production.participants` is frozen (fine), but `productionCompanyTalentIds` are "busy" and `hollywoodValidation.ts:254` requires *rival* productions' people to be employed by that rival at `startTick`; the player-side `verifyParticipants` (`:188-197`) requires no employer but `claimAssignment` refuses simultaneous assignments. If contracts do NOT transfer, the picture's director/cast become non-employees mid-shoot; the player pipeline has no "freelancer mid-production" law beyond the greenlight-time `freelancer` flag in `FilmParticipant`.
  6. **Costs**: `RivalProjectCosts` (development/production/marketing already paid by the seller) reconcile the seller's `RivalAccount`; removing the project breaks `'development commitments do not reconcile'` (`:242`) unless the rows stay as sunk history. Player-side `FinanceTotals.production` would not include the picture (no `production` row), so fixed-cost allocation (`fixedCostAllocation.ts:151`) and break-even views treat it as free.
  7. **Receipts**: `filmAnnounced` was issued under the seller's `studioId`; `filmReleased`/`filmSettled` (`:373`) require `f.studioId===r.studioId` — a film released by the buyer under a seller-announced production id needs the receipt law to accept announce-by-A / release-by-B.
- Verdict: identity-preserving transfer is FEASIBLE but only as a **re-formation** of the production on the buyer side (new workflow, new script row, new ledger witness, contracts moved), never as a container move. Confidence: HIGH on facts, MEDIUM on the "feasible" inference.

### Q7 — Facilities / lot

**F7.1 — Exactly one player lot; no land market; rival facilities are abstract capacity rows.**
- `GameStateV13.property: PropertyState` singular (`types.ts:1301-1314`); `LotParcel.ownedFromStart: true` with comment "There is no land market this milestone: the studio owns its whole lot from week zero" (`:868-871`); `BlueprintRequirement 'landZone'` evaluates as "Buying land is not part of the game yet." (`blueprintRequirements.ts:66`). `INITIAL_PROPERTY`/`bareLotProperty` in `lot.ts:272,410`. Rival: F6.2(c).
- Confidence: HIGH. Prior prose (§2.G "The Owner does not want multiple playable studio lots"; rulings §5 "physical rival lots" parked): CONFIRMED as current fact.

**F7.2 — No per-facility level/tier field; "tier" is a separate blueprint identity.**
- `PlacedFacility` (`types.ts:1042-1057`) has `blueprintId, status, placedWeek, completesWeek` and nothing else; `FacilityBlueprint` (`:958-1031`) has no level. Tiering exists only as distinct blueprints `development-office-2` / `development-office-3` with "HIGHEST TIER WINS, AND NOTHING STACKS" and `maxInstances: 1` (`facilityEffects.ts:73-101`, `developmentOfficeTier` `:121-125`; `officeTierAtMint` recorded on the blueprint as audit).
- Proves: "target has a higher physical facility upgrade than buyer" (§2.F Q8) has no code counterpart for rivals (fixed four rows, no tiers) and, for the player, an "upgrade" is a building, so the Owner's "physical installations do not magically appear" is trivially the current law.
- Confidence: HIGH.

### Q8 — Technology

**F8.1 — No research/technology state exists; `EraConfig` is a frozen neutral leaf; the research gate is declared but unattainable.**
- `EraConfig = {soundRequired, televisionCompetition, censorship, costScale}` (`types.ts:284-289`); initialised once `{true,false,'none',1.0}` ("neutral era; the three non-costScale fields are inert data", `worldgen.ts:657-663`); only `era.costScale` is read (reception/forecast/candidates). `tick.ts` never writes `era`.
- `BlueprintRequirement {kind:'research'; packId}` (`types.ts:920-921`) evaluates as `'Research is not part of the game yet.'` (`blueprintRequirements.ts:61-67`, `:119-120`); `types.ts:883-889` "five of these kinds name systems that do not exist yet … research in C4".
- `grep -rni "research|technolog|laborator" src/core bridge` → only the above plus comments. No `TechnologyId`.
- Confidence: HIGH. Prior prose (handoff: "P12 has not implemented that technology state or a rival technology tree"): CONFIRMED.

### Q9 — Save / migration / determinism

**F9.1 — Save chain V1…V19; one root per version; frozen validators delegate; no downgrade.**
- `SaveFileV19 = {saveVersion:19, seed, state: GameStateV19, broadcastCache}` (`save.ts:363-368`); `GameStateV19 = GameStateV18 & {hollywood: HollywoodState|null}` (`types.ts:1689-1690`). `validateSaveV19` (`save.ts:7227-7248`) strips `hollywood`, delegates the rest to the frozen `validateSaveV18`, then `validateHollywood(hollywood, frozen.state, sharedLeafValidators)` reusing frozen leaf validators (`v8Concept, v8Contract, v8FilmResult, v8Production, v8TheatricalRun, v8CareerEvent, checkOperationsContext, checkScriptDevelopmentShape`). `convertV18ToV19` = `makeSave(initializeHollywood(state,'migration'))` (`:7250-7253`); `migrateToV13/V14` refuse downgrades (`:7163-7226`). `makeSave` detaches the root by `JSON.parse(JSON.stringify(...))` and `stableStringify` sorts keys (`:6048-6051`, `:398-`).
- Historical precedent for "one additive root per version": V16 `releaseAuthority`, V17 `studioHistory`, V18 `foundingRegime`, V19 `hollywood` (`types.ts:1543-1690`), each with "SaveFileVn remains recursively frozen above" comments.
- Proves what an additive P16 root needs: (i) `GameStateV20 = GameStateV19 & {<root>}`, `SaveFileV20`, `validateSaveV20` delegating to frozen V19 + a strict `exact()`-key root validator; (ii) `convertV19ToV20` that invents nothing (an empty root, or an explicit "origin/migration" witness like `hollywood.origin`/`originWeek`, `hollywoodTypes.ts:109-110`); (iii) refusal of downgrade in every `migrateToVn`; (iv) the identity walks in `productionIdentity.ts` extended "in BOTH directions" if the root carries production/concept ids; (v) `LedgerKind`/`RivalMoneyKind` widening with per-version kind lists (F3.1/F3.2).
- Confidence: HIGH. Prior prose (roadmap §10.1 "One package owns one explicit save-version step at a time … no P15 root may be pre-created as a misleading 'empty future slot'"): CONFIRMED by precedent.

**F9.2 — RNG law: one sim stream (`rngState`, advanced ONLY by reception); everything else uses stateless derived streams keyed by purpose+key; each new system takes a new `RngPurpose`.**
- `rng.ts:12-19` derived `stream(seed,purpose,key)` "never threaded through save"; purposes enumerated `:36-77` (`candidates, agent, forecast, worldgen, migrate, develop, hiring, discovery-v1, casting-v1, presence-v1, screenplay-v1, hollywood-v1`), each added additively with a comment ("versioned ('-v1') so a future recalibration can re-key cleanly", `:44-46`; "KEYED ON THE MINT ORDINAL, NEVER ON A WEEK OR A YEAR", `:59-61`). `tick.ts:27-29` "The ONLY randomness consumed FROM THE SIM STREAM (state.rngState) is in RECEPTION". Rival decisions use `stream(seed,'hollywood-v1',\`${b.studioId}:package:${ordinal}\`)` (`hollywoodTick.ts:155,180`).
- Proves: any P16 stochastic element (e.g. AI bid willingness) must be a new derived purpose (`'ownership-v1'`) keyed on exact ids/ordinals, never on the calendar, never touching `rngState`.
- Confidence: HIGH.

**F9.3 — Event/receipt ordering.** Player: pipeline order fixed (`tick.ts:24-25`), `studioEvents.nextSeq` never rewinds with windowed compaction (`types.ts:1495-1499`, `STUDIO_EVENT_WINDOW_WEEKS 26`), `studioHistory` monotonic `eventId`, routine rows folded after 52 weeks (`studioHistory.ts:44`). Industry: receipts appended in business order within `advanceHollywoodWeek`, then expiry, then chart every 13 weeks (`hollywoodTick.ts:293-316`); rival entry happens at the END of the tick (`tick.ts:1039-1043`). Confidence: HIGH.

**F9.4 — Performance guardrails visible in code (and what is NOT there).**
- Bounded: `activeScriptOrdinals.length<=2` (`hollywoodValidation.ts:259`); one rival production at a time; chart cohorts; studio-event window; history routine folding; campaign library `CAMPAIGN_LIBRARY_MAX_BYTES 256 MiB`, `MAX_RECORDS 32`, `MAX_RECEIPTS 128` (`bridge/runtime/campaign-library.ts:15-17`); runtime checkpoint `maxCheckpointBytes 192 MiB, maxJournalEntries 512, maxJournalBytes 64 MiB` (`bridge/runtime-checkpoint.ts:157-163`) with the verbatim warning: "R05 week8791 measured an exact Save receipt of 49.6 MB and a 133.5 MB single-save outer1 … This capacity rebaseline does not satisfy the original save-growth target."
- UNBOUNDED and never compacted: `hollywood.receipts` (`'receipt sequence cannot be erased or have gaps'`, `:380`), `hollywood.employment`, `hollywood.films`, `hollywood.careerEvents` (6 per film), `state.ledger`, `state.careerEvents`, `RivalAccount.periods`.
- The "≤100 chunks" rule is NOT in accepted code; it is APPROVED DOCUMENTATION only (`CODEX-P13-P15-LONG-RANGE-ROADMAP.md:259,301,794` "immutable chunks of at most 100").
- Confidence: HIGH.

### Q10 — Projection / visibility

**F10.1 — `bridge/industry.ts` exposes only: identities+lanes, film public results, rosters (employer only), announced productions, employment transitions without terms. Rival cash, salaries, budgets, policy, forecasts and future receipts are HIDDEN.**
- Header `:1` "Public, bounded Industry reads. Authoritative IDs and facts only; no private business inputs." Film notice `:50` "future receipts, costs and studio revenue remain private." Employment activity `:93` "Contract terms remain private." Project `:151` "Scheduling and unrevealed development remain private." Page notice `:110` "Public facts only … there is no combined Power score." Schema `bridge/schema/industry-schema.ts:7-12`: `StudioIndustryStudio` carries no cash/valuation; `StudioIndustryFilm` carries `openingGross,totalGross,criticScore,audienceScore,runStatus`; `StudioIndustryPerson` carries `employerStudioId` but no salary.
- Public facts that ARE exposed: film ids/titles/genres/grosses/scores, six-person credits, announced production ids/titles/genres/announcedWeek, current employer per person, entry/founding labels, 13-week standing chart ranks.
- Proves: a "valuation visible to the player" must be computed ONLY from these public facts plus whatever P16 explicitly discloses; using `RivalAccount.cash`, `policy.reserveWeeks`, `RivalProjectCosts` or `forecastSnapshot` would leak private state through the projection ("Wire may select/render eligible typed facts, never … expose hidden ones", handoff). Rival *library* facts (all released films with grosses) are already fully public, so library value can be public by construction; cash and debt are not.
- Confidence: HIGH. Prior prose (handoff "Industry projection exposes only lawful public facts"): CONFIRMED.

---

## 4. STRUCTURAL HAZARD LIST for P16 (observed fact → collision → smallest design-level correction)

Legend: [FACT] = observed code; [INFER] = my inference.

**H1 — Script identity is position-bound and per-owner.**
[FACT] `script-NNNN` = index in the owner's `development.projects` (`scriptDevelopment.ts:64-73, 969-971`; rival `hollywoodTick.ts:44,179,204` and `Number(id.slice(7))`). [INFER] Any transfer of a script/development project between studios (asset sale, acquisition bundle) collides on id and violates the index law. **Correction:** P16 law: transferred scripts are re-minted in the receiver's array; the transfer event records `{sourceStudioId, sourceScriptProjectId, targetScriptProjectId}`; no code may treat `scriptProjectId` as globally unique. (Roadmap §9 "never infer identity from array position" is aspirational here — label QUALIFIED.)

**H2 — `FilmIdentity.studioId` means CREATOR and is bound to historical employment; it must not be reused as OWNER.**
[FACT] `hollywoodValidation.ts:318` proves credits against employment at `f.studioId`; `FilmConcept` is a frozen leaf (`screenplay.ts:24-27`); P15 §13.1 "Do not widen frozen recursive historical leaves merely to add an owner". [INFER] A P16 that mutated `studioId` on transfer would break credit validation and rewrite creator truth (contrary to §2.D). **Correction:** current rights/ownership lives in a NEW root keyed by exact `filmId`/`conceptId` with dated ownership rows; `FilmIdentity.studioId` and the container position of player films are declared *creator-of-record* and never written after release.

**H3 — Player films have no stored creator/owner or frozen title at all.**
[FACT] `FilmResult` has no `studioId`/`title` (`types.ts:241-265`); title is `FilmConcept.title` (mutable by rename); industry shows the live title (`bridge/industry.ts:56`). [INFER] After a transfer or an acquisition of the *player* by a rival (§2.J symmetry) or any rename, "who released this and under what title" must not depend on `state.studio.releasedFilms` membership. **Correction:** P16A creates one explicit library record per released film (`filmId → creatorStudioId, releaseWeek, titleAtRelease`) at migration from exact ids (this is "by exact ID", not inference), and freezes it.

**H4 — `HollywoodState` and `StudioIdentity` are exact-key, version-1 shapes; a status field cannot be "just added".**
[FACT] `hollywoodValidation.ts:59-60, 75`; `HollywoodState.version: 1`. **Correction:** P16 corporate status = a new top-level GameStateV20 root of dated corporate events keyed by `studioId` (roadmap §8 `ownershipEvents`), plus a derived `operating(studioId)` predicate; never a field on `StudioIdentity`.

**H5 — An entered rival must have a business and every business ticks forever.**
[FACT] `hollywoodValidation.ts:331`; `hollywoodTick.ts:221`. [INFER] MODEL A/C/D ("target ceases independent operations") cannot be represented: the business would keep staffing/greenlighting/paying, and its `RivalAccount` reconciliation (`:226-245`) forbids emptying it. **Correction:** define a terminal business state whose tick is skipped and whose account is frozen at settlement, with the reconciliation predicates evaluated only up to `endedWeek`; the P15B "closure-settlement → archived" edge (P15 §12.3) is the natural owner — P16 should consume it rather than mint a second lifecycle (see §5 boundary note).

**H6 — Rival money kinds are closed and sign-locked; player ledger kinds are closed and compile-guarded.**
[FACT] F3.1/F3.2. [INFER] Acquisition price, asset-sale proceeds, license fees, assumed-debt payments have no lawful row on either side. **Correction:** P16B adds symmetric kinds — player `LedgerKind` `'assetSale'|'assetPurchase'|'acquisition'|'licenseFee'` (positive/negative), rival `RivalMoneyKind` `'assetSale'` (≥0) / `'assetPurchase'|'acquisition'` (≤0) — each with a one-line reconciliation rule against the P16 transaction root (precedent: `facilityDemolitionRefund` must match one capex row). Keep them OUT of `production`/`studioRevenue` buckets so P07/P11 finance meaning is preserved.

**H7 — There is no liability record; "debt transfers" (§2.F Q2) has nothing to transfer.**
[FACT] F3.3. [INFER] Book net worth and "assumption purchase" (§2.M option 4) require at least one liability type. **Correction (smallest):** do NOT introduce loans in P16; define "liabilities" for valuation purposes as the two obligations that already exist in state — remaining contract guarantees (`guaranteedComp`) and unpaid committed production costs — and let P11 own any future debt instrument. Assumption purchases then mean "assume contracts", not "assume debt".

**H8 — Contract identity embeds the employer; transfer = end+new row; and the player-side signing-bonus ledger cross-check would refuse an assumed contract.**
[FACT] F1.3, F5.2, F5.4 (`hollywoodValidation.ts:163, 362, 397`). **Correction:** new employment reason `'assumed'` (interval reason and receipt reason), receipt shape `fromStudioId=seller, toStudioId=buyer`, contractId minted under the buyer with `startWeek = transferWeek`, `termWeeks/endWeekExclusive` preserved, `signingBonus: 0` and the ledger cross-check exempted for `'assumed'`. Rival buyers get the same row (symmetry §2.J).

**H9 — A rival production cannot be container-moved; only re-formed (F6.3).**
[FACT] items 1-7 in F6.3. **Correction:** P16C law "active productions transfer by re-formation": keep `productionId`, `conceptId`, `participants`, `budget`, `remainingTicks`, `forecastSnapshot`; discard the seller workflow; re-allocate on the buyer lot at the same phase (may queue/block honestly); write one ledger witness row (`'productionAssumed'`, amount 0 or the assumed remaining cost) whose week becomes the placed-facility evidence week; mint `requiresSetBinding` per the buyer's world. If the buyer is a rival, the abstract path already accepts this.

**H10 — Rival facilities are four immutable abstract rows with fixed capex; "target facilities" have no location, no tier, no sale value except the entry capex.**
[FACT] F6.2(c), F7.2, `'capacity acquisition not paid exactly once'`. [INFER] §2.G option 1 (automatic liquidation at closing) is the only option the state can express without a new facility model; a "remote corporate property as financial asset" (option 3) would need a new record. **Correction:** P16C values target physical plant as a lump `liquidationValue = Σ capex × FACILITY_DEMOLITION_REFUND_FRACTION` (reusing the existing 0.5 law, which already makes flipping a loss) and never instantiates buildings on the buyer lot.

**H11 — No technology state exists (F8.1); "acquired research grants knowledge" has no substrate.**
**Correction:** P16 defines only the *transfer rule* ("knowledge is inheritable; installations are not") as a constraint on P13's future adoption root, and ships nothing technology-specific until P13 exists. Do not pre-create an empty technology slot (roadmap §10.1).

**H12 — Unbounded append-only industry arrays already stress the save budget.**
[FACT] F9.4 (49.6 MB receipt at week 8791; receipts never compacted). [INFER] A P16 ownership root that logs per-film per-week anything, or duplicates film records per owner, compounds this. **Correction:** ownership rows are per *transaction* (dated events), never per week; valuation is a derived read model, never persisted; StoryProperty records are one row per exact concept, created lazily on first transaction/continuation rather than one per film at migration (see OQ-2).

**H13 — The industry projection cache is keyed by `GameState` identity and exposes only enumerated public fields.**
[FACT] `bridge/industry.ts:28-30` WeakMap index; schema closed (`industry-schema.ts`). [INFER] "Valuation visible to the player" must be added as new typed schema fields computed from public facts; nothing may read `RivalAccount`, `policy`, `projects` costs or `forecastSnapshot`. **Correction:** P16 declares the valuation inputs as public-by-law (released films, standing, film count, announced productions, roster size) and adds `cash` only if the Owner elects to make target cash disclosed at diligence — a new disclosure receipt, not a projection leak.

**H14 — `FilmConcept.title` is mutable after release for player originals.**
[FACT] F4.3. [INFER] A StoryProperty "title" must not be the live concept title, or a post-sale rename by the seller changes the buyer's asset. **Correction:** StoryProperty carries its own frozen `titleAtCreation`; rename authority follows current property ownership.

---

## 5. Design implications for P16 (explicitly my INFERENCE unless cited)

1. **StoryProperty anchor = `conceptId`, not `filmId`.** The concept is the one identity shared by script, production, film, run, blueprint and career events (F4.3); it is permanent and never orphaned. A StoryProperty record should be `{propertyId, conceptId, origin:'studio-original'|'market-sourced', creatorStudioId, createdWeek, titleAtCreation}` — the origin distinction already exists implicitly (`MovieBlueprint.ordinal !== null` vs pool `c-NN`, F1.5).
2. **Film Library record = per released `filmId`**, storing `creatorStudioId` (from `FilmIdentity.studioId` or the player container) and `currentRightsHolderStudioId` with dated history; never rewrite `FilmIdentity.studioId` (H2, H3).
3. **Package boundary (§2.T) is consistent with code seams:** P11 owns any new `LedgerKind`/`RivalMoneyKind` and any future debt instrument (H6, H7); P12 owns `StudioIdentity` and the operating predicate (H4, H5 — but the *terminal* edge belongs to P15B's closure-settlement lifecycle, which P16 should trigger for acquisitions rather than duplicate); P14 owns the `'assumed'` employment reason (H8); P13 owns technology adoption and P16 only the inheritance rule (H11); P16A = property/library roots, P16B = transaction root + ledger kinds, P16C = acquisition orchestration reusing the P15B participant-manifest pattern (APPROVED DOCUMENTATION, P15 §12.3). This supports the Future Ops "YES" on the A/B/C split; nothing here argues for a P16D.
4. **Transfer bundle answers grounded in code:** cash → yes, as one `RivalMoneyKind` outflow on the seller and one `LedgerKind` inflow/outflow on the buyer (H6); debt → nothing to transfer today (H7); contracts → end+new `'assumed'` rows, terminable under P10 law once in `state.contracts` (H8, F5.3); active movies → re-formation with preserved ids (H9); facilities → liquidation lump at 0.5 × capex (H10); research → rule only (H11).
5. **Anti-flip already has a code idiom:** every recovery fraction is < 1 and proved by invariant (F3.4). P16B asset sales should reuse "sale value strictly below replacement/creation cost unless a counterparty bid is recorded".
6. **Determinism:** rival willingness/bidding must be a `'ownership-v1'` derived stream keyed on `(studioId, transactionOrdinal)` (F9.2), and every transaction is an idempotent receipt with `eventId` (F9.3).
7. **Visibility:** rival library value is computable from already-public facts; rival cash is not — a disclosed-at-diligence receipt is the only lawful way to show it (H13).

## 6. Open questions

- **OQ-1** Does P16 own the terminal "operations ended" edge for acquisitions, or must P15B's closure-settlement lifecycle land first (H5)? Code has no operating predicate; whichever package adds it must also change `hollywoodValidation.ts:331` and `hollywoodTick.ts:221`.
- **OQ-2** Consumer contract §15 says P16 "may not infer or bulk-mint" properties "from resemblance or presentation data" but must create them "explicitly by exact ID". Does a migration that creates one StoryProperty per existing `conceptId` count as explicit-by-exact-ID (allowed) or bulk-minting (forbidden)? Save-size (H12) favours lazy creation.
- **OQ-3** Should assumed contracts keep the seller's `startWeek` (history-true, but breaks `'unknown person or invalid employment chronology'` `:164` for the buyer's `enteredWeek`) or re-base at transfer week (chronology-true, history in the receipt)?
- **OQ-4** For re-formed productions (H9), which week is the placed-facility evidence week — original `startTick` or transfer week? `placement.ts:1811-1818` cannot accept both today.
- **OQ-5** Is the player studio ever nameable/brandable? Today it is literally `'Your Studio'/'YOU'` (F2.2); "retain brand as label" presupposes a label model that does not exist for either side.
- **OQ-6** Rival termination symmetry: rivals cannot terminate early (F5.3). If a rival buyer inherits staff, does §2.J symmetry require a rival termination verb, or is "let expire" acceptable for AI?

## 7. Source table

| # | Source | Locator | Used for |
|---|---|---|---|
| S1 | `src/core/hollywoodTypes.ts` | 6-17, 19-45, 47-61, 62-68, 69-78, 79-95, 96-103, 105-124 | F1.3, F1.8, F2.1, F3.2, F4.1, F5.2 |
| S2 | `src/core/hollywood.ts` | 18-23, 31-42, 60-65, 98-105, 107-136, 139-201 | F1.1, F1.2, F2.2, F2.4, F3.2 |
| S3 | `src/core/hollywoodStartingData.ts` | 8-38, 46-47 | F2.4 |
| S4 | `src/core/calendar.ts` | 2-3 | F2.4 |
| S5 | `src/core/hollywoodValidation.ts` | 59-60, 72-99, 113-142, 159-180, 188-197, 204-270, 279-332, 349-381, 395-399 | F1.1, F1.3, F1.5, F1.8, F2.1-F2.3, F3.2, F4.2, F5.2, F5.4, F6.1-F6.2, F9.4 |
| S6 | `src/core/hollywoodTick.ts` | 34-47, 67-82, 85-137, 139-210, 213-290, 293-316 | F1.3, F1.4, F1.5, F1.6, F4.2, F5.3, F6.2, F9.2 |
| S7 | `src/core/productionIdentity.ts` | 4-101, 103-163 | F1.4, F1.5, F9.1 |
| S8 | `src/core/industryEmployment.ts` | 10-35 | F1.3, F5.2 |
| S9 | `src/core/industryCareer.ts` | 5-23 | F1.8 |
| S10 | `src/core/scriptDevelopment.ts` | 64-73, 593-612, 969-971, 1045-1049, 1108-1111 | F1.6, F4.4, F6.3 |
| S11 | `src/core/screenplay.ts` | 15-40, 71-90, 442-475 | F1.5, F4.3, F4.4, H14 |
| S12 | `src/core/castingSessions.ts` | 74-83 | F1.7 |
| S13 | `src/core/actions.ts` | 241-274, 636-702, 703-728, 2695-2725 | F1.2, F1.4, F4.4, F5.3, F6.2 |
| S14 | `src/core/types.ts` | 107-131, 154-163, 225-265, 284-296, 303-343, 352-465, 475-495, 569-646, 656-700, 774-783, 864-872, 901-923, 958-1057, 1301-1314, 1336-1357, 1416-1431, 1452-1499, 1529-1536, 1591-1690, 1708-1737 | F1.5, F1.7, F1.8, F3.1, F4.1, F4.3, F5.1, F6.1, F7.1, F7.2, F8.1, F9.1, F9.3 |
| S15 | `src/core/operations.ts` | 255-316, 467-530, 702-770, 906 | F6.2, F6.3 |
| S16 | `src/core/productionPhases.ts` | 36-72 | F6.1 |
| S17 | `src/core/releaseAuthority.ts` / `studioCalendar.ts` | RA 28-45; SC 1-3 | F6.1 |
| S18 | `src/core/sceneryLoadIn.ts` | 183-215 | F6.2, F6.3 |
| S19 | `src/core/placement.ts` | 705, 743, 1025-1028, 1046, 1092, 1730-1740, 1791-1818 | F1.7, F3.4, F6.3 |
| S20 | `src/core/sets.ts` | 152-154, 486, 505 | F1.7, F3.4 |
| S21 | `src/core/construction.ts` | 391-437 | F3.1 |
| S22 | `src/core/economy.ts` | 53-92 | F4.1 |
| S23 | `src/core/economyView.ts` | 112-147, 302-330, 426-500, 610-649 | F3.1, F3.3 |
| S24 | `src/core/financeReport.ts` | 15-60 | F3.5 |
| S25 | `src/core/employment.ts` | 165-204, 339-380 | F5.3, F5.4 |
| S26 | `src/core/tuning.ts` | 28, 57, 70, 390-391, 413-414, 419-420, 684-731, 816, 1598-1613 | F2.4, F3.1, F3.4, F4.1, F5.3 |
| S27 | `src/core/tick.ts` | 24-40, 739-775, 910-953, 1020-1043 | F3.5, F4.2, F9.2, F9.3 |
| S28 | `src/core/rng.ts` | 1-77, 204 | F9.2 |
| S29 | `src/core/facilityEffects.ts` | 1-27, 73-125 | F7.2 |
| S30 | `src/core/blueprintRequirements.ts` | 55-67, 119-120 | F7.1, F8.1 |
| S31 | `src/core/worldgen.ts` | 45, 516, 655-668 | F1.2, F8.1 |
| S32 | `src/core/lot.ts` | 50-52, 272, 410 | F7.1 |
| S33 | `src/core/studioRunRecap.ts` | 1003 | F3.3 |
| S34 | `src/core/studioHistory.ts` | 44 | F9.3 |
| S35 | `src/core/save.ts` | 356-398, 953-983, 1383-1420, 1832-1935, 2219-2300, 4993-5020, 5395-5450, 6048-6080, 7163-7257 | F1.2, F1.4, F3.1, F9.1 |
| S36 | `bridge/industry.ts` | 1, 28-36, 40-56, 63-65, 85-98, 110, 150-151, 173-176 | F1.8, F4.3, F10.1 |
| S37 | `bridge/schema/industry-schema.ts` | 3-17 | F10.1 |
| S38 | `bridge/finance.ts` | 81, 83 | F3.3 |
| S39 | `bridge/runtime-checkpoint.ts` | 157-175, 383-400 | F9.4 |
| S40 | `bridge/runtime/campaign-library.ts` | 14-17, 44-49 | F2.2, F9.4 |
| S41 | `docs/engineering/P12-TO-P13-PRODUCER-HANDOFF.md` | 12-16, 24-33 | prior-prose labels |
| S42 | `docs/engineering/P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md` | 348-376 | F4.3, OQ-2 |
| S43 | `p13-docs/docs/design/CODEX-P13-P15-LONG-RANGE-ROADMAP.md` | 259-260, 267-283, 301, 476-485 | F1.6, F2.5, F9.4 |
| S44 | `p13-docs/docs/design/CODEX-P13-P15-OWNER-RULINGS.md` | 245-266 | scope labels |
| S45 | `p13-docs/docs/design/CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md` | 343-369, 460-496, 508-540 | F4.2, H2, H5 (note: §9 names `src/core/ledger.ts`, `theatrical.ts`, `events.ts` and "save generation is V15" — those files do not exist in the accepted tree and the save is V19; CORRECTED) |

End of dossier.
