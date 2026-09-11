# P14 post-P12 reconciliation

**PREPARATION PACKAGE · DOCUMENTATION AND READ-ONLY RECONNAISSANCE ONLY · P14 IMPLEMENTATION NOT AUTHORIZED · P13 NOT YET ACCEPTED.** Deliverable A of the P14 preparation package. Index: [P14 preparation review index](./P14-PREPARATION-REVIEW-INDEX.md). Design: [P14 preparation companion](./P14-PREPARATION-COMPANION.md). Rulings: [§3.4 amendment](../design/CODEX-P13-P15-OWNER-RULINGS.md#34-p14-owner-direction-amendment--2026-09-11).

Prepared 2026-09-11 on `docs/p14-post-p12-preparation-01`, documentation parent `4734e40`. One documentation author; seven parallel read-only readers over the accepted source and the accepted registers, one adversarial completeness pass over their reports, and a separate correctness review recorded in companion §9. No game, build, test suite, native input, hook or profile was touched. No P13 branch or worktree was opened.

---

## 0. Method, identities and the rule that produced the classes

**What was read.** The accepted P12 closeout `13370d428f0693f3279732f6f4cc360a7fcaa4df`, whose `src/`, `bridge/` and `ui/` are byte-identical to the accepted TypeScript runtime `592e926bfbf4574df94b38fc8dd594fc5df2ac8d` (verified by `git diff --stat` between the two commits over those trees: empty). Every TypeScript citation below is therefore a runtime citation. The accepted documents read as authority: the P12 R05 Owner acceptance receipt, the P12 → P13 producer handoff, the P12A decision and requirement register (136 rows), the P12A R05 Owner decisions, the P11A register and P11 → P12 handoff, the P08–P10 → P11 handoff, the P08–P10 deferred-not-dropped register, the P10 future-consumer contract and information-visibility table, the P11 → P12 and P12 future-consumer contract, and the accepted D-11/D-12/D-14/D-17 contracts and rulings that own contracts, cash and careers. Original-game evidence was read from the local research corpus the August design hashed (SHA-256s re-verified unchanged).

**What was not read.** Any P13 implementation branch or worktree (off-limits by assignment). The August P10 package documents (`CODEX-STARS-CAREERS-STAFF-PACKAGE-10*`) are not present in either tree; P14 binds to P10's accepted law through the information-visibility table, the future-consumer contract and the register rows instead. Any Unity source beyond the pinned identities the receipt records. Any player profile, campaign library or save file.

**Identities kept distinct.**

| Identity | Value |
|---|---|
| TypeScript runtime (accepted) | `592e926bfbf4574df94b38fc8dd594fc5df2ac8d` |
| P12 documentation closeout | `13370d428f0693f3279732f6f4cc360a7fcaa4df` |
| Published technical evidence | `d4e1915ba075b4e4c1c9a6c880c8b0d4257659c0` |
| Unity observed / source-manifest HEAD | `2bc8d304b79a72bf20fda1d462ec3d96df253992` (private repository; not inspected here) |
| Actual Unity player-build source | `deca39521da1baeca61898d156a43f4ae6a7e035` (private repository; not inspected here) |
| Persistence contract | protocol 4 / projection 29 / inner Save V19 / outer checkpoint 1; library storage format 2 |
| Documentation parent of this branch | `4734e4092d117ef89b7349389ef03bd95fc298c3` |
| August P14 design authority (now stale) | `campaign/living-lot-ts` at `7811377`, Unity `29aea89` |

**The four classes.** **REUSED**: the seam exists at the runtime, with a path and exported symbol you can open, and P14 consumes it as-is. **SHARED GENERALIZATION**: the seam exists but P14 needs a bounded widening that its owner (P10, P11, P12, the production lifecycle, the history owner) performs; the widening is named. **NEW P14 WORK**: nothing exists; P14 builds it in its own additive root. **POST-P13 REFRESH REQUIRED**: the classification is provisional because P13's accepted implementation may move it. A design document naming an interface is not evidence the interface exists; every REUSED row below carries a real path and symbol, and the adversarial pass re-checked the citations.

**Matrix totals.** REUSED 56 · SHARED GENERALIZATION 14 · NEW P14 WORK 17 · POST-P13 REFRESH REQUIRED 8 (§2).

---

## 1. The reconciliation, seam by seam

### 1.1 StudioId ownership

**Finding.** The accepted registry is `HollywoodState.identities`, exactly ten rows (the player at row 0 plus nine reserved rivals), minted once from the campaign seed, with `eligibleWeek`, `enteredWeek` and `recordedFromWeek` separating a reserved future ID from an active employer. The August design's "no accepted rival studio population" is stale.

| Connection | Where it lives | Class | P14 obligation |
|---|---|---|---|
| Studio identity shape | `src/core/hollywoodTypes.ts` `StudioIdentity` 6-17 (`studioId, role, row, name, mark, color, founding, eligibleWeek, enteredWeek, recordedFromWeek`) | **REUSED** | P14 references `studioId` only; it never adds a field (the save validator exact-keys the shape, `src/core/hollywoodValidation.ts` 75, and pins exactly ten identities at 72). |
| Minting | `src/core/hollywood.ts` `initializeHollywood` 111-137; `hollywoodWorldKey` 107-109; player `studio-${key}-player` 116; rivals `studio-${key}-r01..r09` 120-125 | **REUSED** | Never remint; never derive a StudioId from a name. |
| Reserved versus active | `hollywoodValidation.ts` 88-99 ("overdue or partially entered studio"; `recordedFromWeek === enteredWeek`); `enterRival` `hollywood.ts` 139-201 | **REUSED** | A studio with `enteredWeek === null` cannot issue a proposal, employ, or be a case party. P14A.1's rival must be one of the four entered at week 0 or a later-arrived one. |
| Arrival schedule | `src/core/calendar.ts` `RIVAL_ARRIVAL_WEEKS = [0,0,0,0,520,988,1560,1872,2548]` 3; validated element-by-element `hollywoodValidation.ts` 83-86 | **REUSED** | Not a P14 table; P14 fixtures use the accepted weeks. |
| Operating state (dormant / closed) | absent: `StudioIdentity` has no status field (handoff `13370d4` §"Preserved downstream ownership") | **NEW P14 WORK — none**; P15B-gated | The August Annex §C.7 disposition table presupposes a P12 field that does not exist. P14 prepares no disposition manifest until P15B and never creates the field. |

### 1.2 PersonId / employer joins

**Finding.** The join is `IndustryEmployment { contractId, studioId, terms: Contract, endedWeek, reason }` in `HollywoodState.employment`, with `activeEmploymentOrdinals` as the current-employer index and player contracts mirrored in by `recordPlayerEmployment` after every action. The August design's "no general immutable employerStudioId interval ledger" is stale, and its `EmployerIntervalId` is a naming drift: the interval id **is** `contractId`.

| Connection | Where it lives | Class | P14 obligation |
|---|---|---|---|
| Employment interval row | `hollywoodTypes.ts` `IndustryEmployment` 62-68; `contractId` grammar `${studioId}:contract:${talentId}:${startWeek}[:player-${ordinal}]` (`hollywood.ts` 180; `hollywoodTick.ts` 99, 129; `industryEmployment.ts` 30; re-derived and required equal at `hollywoodValidation.ts` 163) | **REUSED** | P14 receipts reference `contractId` as the interval id. No third id grammar. |
| Current-employer index | `hollywoodTypes.ts` `activeEmploymentOrdinals` 116; membership law `hollywoodValidation.ts` 175-177 | **REUSED** | Read through `rivalEmployment` / `studioEmployerId` (`hollywood.ts` 44-65); never mirrored. |
| Player-contract mirror | `src/core/industryEmployment.ts` `recordPlayerEmployment` 10-35, called only from `applyActions` (`src/core/actions.ts` 3019) and initialization (`hollywood.ts` 135); never from `tick.ts`. Player *expiry* is mirrored separately by `finishHollywoodWeek` (`hollywoodTick.ts` 296-304), so only starts, renewals and terminations depend on the post-action mirror | **SHARED GENERALIZATION** | A P14A settlement that runs inside the scheduled tick phase must call `recordPlayerEmployment` explicitly, write the `signingBonus` ledger row the validator demands for a player start (`hollywoodValidation.ts` 392-395) and remove the id from `state.freeAgents` as `applySignContract` does (`actions.ts` 2645). Owner: P12/P10 seam, commissioned by the P14 order. |
| P10 ownership of player contracts | `src/core/types.ts` `Contract` 336-343 (six keys, exact-keyed by `src/core/save.ts` `v8Contract` 1832-1850); `state.contracts` the only mutation target of sign/renew/release (`actions.ts` 2615, 2643, 2688, 2721) | **REUSED** / DO NOT TOUCH | No offer id, employer id or promise reference is added to `Contract`. P14 stores those in its own root by reference. |
| Person identity | `types.ts` `Talent.id` 108; ids `t-act-NN` (`worldgen.ts` 42-48), `person-${studioId}-${index}` / `-supply-${week}-${slot}` (`hollywood.ts` 170; `hollywoodTick.ts` 122), `authored-NNNN` (`actions.ts` 266-274) | **REUSED** | The August law "PersonId never contains role or array position" is restated: PersonIds are opaque immutable strings whose spelling may encode their origin and must never be parsed or reinterpreted. |

### 1.3 One-employer exclusivity

**Finding.** Enforced three ways and validated at save time; the August "no shared multi-studio employment index" is stale.

| Connection | Where it lives | Class | P14 obligation |
|---|---|---|---|
| Player signing gate | `actions.ts` `applySignContract` 2622-2626 (`hiringMarketIds` membership); `employment.ts` `hiringMarketIds` 349-369 excludes rival-employed people; `employmentStatus` 372-383 returns `unavailable` for a rival-employed person | **REUSED** | P14A's player proposal is legal only for a person `hiringMarketIds` or the renewal law would admit. |
| Rival staffing gate | `hollywoodTick.ts` `staff()` `unavailable` set 108-110 (busy ∪ player contracts ∪ founding applicants ∪ every active employment) | **REUSED** | The rival's proposal is legal only for a person outside `unavailable`, except the incumbent's own person in the window. |
| Save-time validation | `hollywoodValidation.ts` 167-174 ("overlapping industry employers", "double employer", "rival stole founding applicant") | **REUSED** | P14 adds no fourth enforcement point; its settlement writes must pass these unchanged. |
| Busy / availability | `employment.ts` `busyTalentIds` 159-164 (= production-company seats ∪ writing assignments ∪ `industryBusyTalentIds` `hollywood.ts` 67-79) | **REUSED** | The one availability predicate for firing refusals, retirement deferral and promise feasibility. |
| Status conflation | `employment.ts` `employmentStatus` 372-383 returns `unavailable` both for rival-employed people and for people merely outside this epoch's market rotation | **REUSED** (hazard) | P14A eligibility reads `rivalEmployment` / `studioEmployerId`, never the status string. |
| Founding-phase hole | `applySignContract` during founding checks applicants and the recruitment fund only (2599-2621); exclusivity there is closed from the rival side (`hollywood.ts` 163; validation 173) | **REUSED** (hazard) | A P14A case never opens during founding; a founding-phase release is legal today and debits cash (see §1.8) — P14 recommends refusing release during the draft. |

### 1.4 Employer intervals and transitions

**Finding.** Half-open `[startWeek, endedWeek ?? endWeekExclusive)` intervals; natural expiry written for every studio by `finishHollywoodWeek`; typed `employment` receipts with `fromStudioId`/`toStudioId`; a validator that **forbids** a cross-studio `from → to` receipt and **forbids** rival termination. A contested move is therefore two unlinked receipts today, and P14's chooser receipt is what links them.

| Connection | Where it lives | Class | P14 obligation |
|---|---|---|---|
| Interval model and expiry | `hollywood.ts` `rivalEmployment` 51-53; `hollywoodTick.ts` `finishHollywoodWeek` 293-316 (expires every active ordinal with `endWeekExclusive <= week`, appends expiry receipts, pushes rival-expired people into `state.freeAgents` 314) | **REUSED** | P14A's settlement phase is inserted at this boundary (see §1.13). |
| Receipt shape | `hollywoodTypes.ts` `IndustryReceipt` 96-103; reasons `entry|renewal|replacement|expiry|termination|player-contract|existing-player-contract`; ids `industry-event-${n}` gapless (validation 344-379) | **SHARED GENERALIZATION** | A market settlement needs a reason the whitelist accepts. Recommended: keep the receipt union closed and record the case outcome in P14's own receipt that references the P12 end and start receipts by `eventId`; if Current Ops prefers a linked `from → to` receipt, that is a P12 validator amendment (`hollywoodValidation.ts` 165, 360-369). |
| Reason whitelist | `hollywoodValidation.ts` 165 (rival rows `entry|renewal|replacement`; player rows `renewal|player-contract|existing-player-contract`) | **SHARED GENERALIZATION** | A rival signing produced by a P14A case must use `replacement` (a lawful re-hire from the free pool) or a new P12-approved reason. |
| Early end law | `hollywoodValidation.ts` 387-402: a terminated row needs the player's exact `termination` ledger row (394-395); any other early end must be a same-studio renewal (399) | **SHARED GENERALIZATION** (hazard) | **The termination row is re-validated with the current formula at every load.** Changing `terminationCost` without versioning the rule makes every existing save that contains a player termination fail to load ("employment termination lacks its actual player payment"). The P14A charter must persist the charge basis (or a rule stamp) on the ledger row or validate presence and sign only. |
| Rival termination | forbidden today (`hollywoodValidation.ts` 358; `RivalMoneyKind` has no `termination`, `hollywoodTypes.ts` 47-48) | **SHARED GENERALIZATION** (Ready, not Core) | Symmetric rival release needs a `termination` movement kind (exact-keyed period shape → governed save step), a reconciliation rule reusing `terminationCost`, an end-reason marker, and a rival decision path through `moveRivalMoney`. |
| Cross-studio transfer | never written; validator refuses `fromStudioId ≠ toStudioId` both non-null (360-369) | **NEW P14 WORK** (the link) | The P14 chooser receipt carries both P12 `eventId`s; P12 state is not changed to express a transfer. |

### 1.5 Current active employers, reserved rivals, fixed arrivals

Covered by §1.1 and §1.2: active employer = `activeEmploymentOrdinals` ∪ live `state.contracts` (the bridge builds its employer map from exactly those two sources, `bridge/industry.ts` 34-36); reserved rivals are not employers; arrivals are fixed per campaign. **All REUSED.** P14 adds one rule: a P14A case may not open for a person whose contract owner is a reserved (unentered) studio, which cannot occur because such a studio cannot hold a contract (`hollywoodValidation.ts` 160).

### 1.6 Rival finance, capacity and project truth

**Finding.** Rivals have finite hidden Cash with nine reconciled movement kinds, weekly payroll/overhead/opex, a reserve policy, one-week decision cadence, fixed four facilities, one production at a time, two active scripts, 208-week contracts renewed at the first window week when solvent, and no offers.

| Connection | Where it lives | Class | P14 obligation |
|---|---|---|---|
| Rival account and movements | `hollywoodTypes.ts` `RivalAccount`/`RivalFinancePeriod`/`RivalMoneyKind` 47-61; `moveRivalMoney` `hollywood.ts` 31-42 (single mutation); validator reconciliation per kind `hollywoodValidation.ts` 219-245 | **REUSED** | A rival proposal's affordability is judged against real Cash and the reserve rule (`hollywoodTick.ts` `operatingReserve` 51-53); a rival signing books `signing`; nothing else is invented. |
| Rival hiring law today | `hollywood.ts` `enterRival` 161-187 (first unreserved person per role or mint); `hollywoodTick.ts` `staff()` 84-137 (renew own people at the first window week at 208 weeks when `cash − bonus ≥ reserve`; fill deficits from own-expired, then first available in `state.talent` order, then mint) | **REUSED** baseline, superseded at the case boundary | Today a solvent rival renews on the first week of the window, so a rival's person **never** reaches a contested expiry. P14A must suspend the incumbent's immediate renewal for a person under a case and route it as the incumbent's proposal (§1.13, companion §2.1). |
| Rival pricing | rivals call the same `offerForTalent` at `HOLLYWOOD_CONTRACT_WEEKS = 208` (`tuning.ts` 28; `hollywoodTick.ts` 97, 125); the per-person jitter is keyed by `talent.id` only (`employment.ts` 236) | **SHARED GENERALIZATION** | For the same person, term and week a rival's terms equal the player's byte-for-byte. "Visible competing terms" therefore need an authored rival-policy term model (term choice and a bounded premium factor) — a policy dimension P12 owns (`RivalBusiness.policy`, `hollywoodTypes.ts` 93-94; register SIM-009). |
| Cadence and policy | `nextDecisionWeek` (`hollywoodTypes.ts` 90; `hollywoodTick.ts` 140-141, 222); `HOLLYWOOD_DECISION_WEEKS = 1` (`tuning.ts` 27); policy `{version: 1, affinities, negativeScale, marketingRatio, reserveWeeks}` exact-keyed and version-pinned (`hollywoodValidation.ts` 208-211) | **REUSED** (cadence); **SHARED GENERALIZATION** (policy) | The rival's proposal decision runs inside its existing weekly decision, not on a second clock. A term-preference or premium knob is a policy version bump plus validator branch, owned by P12. |
| Exported rival-signing primitive | absent: the append/signing/receipt logic is module-private inside `staff()` and `enterRival` | **SHARED GENERALIZATION** | P12 exports one primitive (or refactors `staff()`) that signs a person for a studio with the reserve check, `moveRivalMoney('signing')`, the employment append, the ordinal update and the receipt, so the P14A settlement can call it. |
| Capacity and projects | fixed facilities `hollywood.ts` 98-105; ≤ 1 production, ≤ 2 scripts (`hollywoodTick.ts` 146, 176); auto-accept, auto-commit | **REUSED** | Inputs to symmetric promise feasibility for rivals (P14B). |
| Hidden rival cash / terms | `bridge/industry.ts` exposes identity, roster, paged employment receipts and no terms (61-65, 170-176); `bridge/people.ts` returns `contract: null` for rival-employed people 506-510 | **REUSED** | The no-hidden-data law for P14A's comparison view: salary, bonus and promises of a rival proposal are UNKNOWN. |

### 1.7 Shared authoritative 1920 / 52-week calendar

**Finding.** `campaignDate(week)` maps week 0 to `1920 · Week 1` under `campaign-calendar-1920-52/v1`; `market.tick` remains the only clock and `tick()` its only writer; the calendar delivers no aging (R05 §"No aging").

| Connection | Where it lives | Class | P14 obligation |
|---|---|---|---|
| Date law | `src/core/calendar.ts` `campaignDate`, `CAMPAIGN_CALENDAR_POLICY` 2, 13-21; `historicalDate` 24-31 | **REUSED** | Age = f(birth provenance, `market.tick`), formatted through `campaignDate`; no second date arithmetic. |
| Sole clock | `src/core/tick.ts` `tick` (the P13A companion §1.1 established the single-writer fact and the tick.ts:396 next-week hazard) | **REUSED** | Lifecycle due weeks and case decision weeks are in-state absolute weeks compared against `market.tick`; nothing P14 does inside queue admission may read the clock. |
| Recurring cadence precedent | `hollywoodTick.ts` `finishHollywoodWeek` 293-316 (13-week chart from pure arithmetic on the week plus a stored snapshot) | **REUSED** | Annual retirement checks and cohort schedules copy this shape. |

### 1.8 Employment legality: hiring, renewal, release, expiry

**Finding.** Deterministic ask pricing; a 12-week renewal window; renewal as **immediate replacement** of the running contract; release with a single refusal (active screenplay task) and a lump-sum charge; expiry to `freeAgents` with the production seat intact.

| Connection | Where it lives | Class | P14 obligation |
|---|---|---|---|
| Ask pricing | `employment.ts` `offerForTalent` 227-250, `contractOffer` 253-262, `contractOfferOptions` 266-272; `tuning.ts` 374-387 | **REUSED** | Every proposal references a P10 draft priced here. The anti-exploit floor (companion §3.5) is one `max()` applied when the issuing studio matches a terminated-contract memory; the Full-Custom preview path (`offerForTalent` on a Talent object with no state) stays floor-free. |
| Renewal window and semantics | `employment.ts` `renewalWindowOpen` 201-204; `actions.ts` `applyRenewContract` 2652-2691 (new contract from the current week; remaining old weeks forfeited; renewal bonus paid) | **SHARED GENERALIZATION** | For a person under a P14A case, the incumbent's renewal becomes a proposal settled at expiry rather than an immediate replacement; outside a case the accepted semantics stand. This is the one P10 behavior P14A changes, and it is what makes an expiry contestable. |
| Release | `actions.ts` `applyReleaseTalent` 2694-2724 (refuses only an active screenplay task; charge; `termination` ledger row; contract removed; person to `freeAgents`); ungated by solvency by Owner ruling R3 | **SHARED GENERALIZATION** | Charge law recalibrated per rulings §3.4.1 (2); refusal extended to any busy-set seat (recommendation R2); founding-phase release refused; confirmation copy rewritten (`bridge/contract.ts` 257 is the only hard-coded "half"). |
| Expiry | `tick.ts` 957-970 (contracts with `endWeekExclusive <= newTick` removed; person to `freeAgents`; no cash effect); production keeps the person's id and finishes (`tick.ts` 509-518) | **REUSED** | Retirement's "obligations first" is a new rule on top of this (§1.11): expiry never abandons a seat today and P14 must not either. |
| Hiring market | `employment.ts` `hiringMarketIds` 349-369 (free agents first, then a 13-week-rotated sample of 8) | **REUSED** | A released or expired person is signable by any studio the same week; the market rotation must not gate a case: a case subject is always inspectable and proposable regardless of the rotation sample. |
| Quote route | `bridge/contract.ts` (typed refusals `noActiveContract|renewalWindowClosed|onScreenplayTask|insufficientFunds`; commit-time revalidation) | **REUSED** | P14A.3 proposal intents extend this pattern: the client never prices, chooses or settles. |
| Founding-phase release | `applyReleaseTalent` has no founding check | **REUSED** (hazard) | Recommendation: refuse release during the founding draft. |

### 1.9 Named campaigns, Save As, independent state, stored RNG, checkpoint and migration

**Finding.** A five-layer persistence contract; named campaigns exist only in the bridge/library; Save As re-imports the identical save under a new storage UUID and session, so two campaigns share every entity id; core `GameState` carries no campaign or session id; all accepted caches are keyed by object identity; migration is strict, total and fail-closed; the `hollywood` root is the template for any additive P14 root.

| Connection | Where it lives | Class | P14 obligation |
|---|---|---|---|
| Version constants | `bridge/schema/bridge-schema.ts` `PROTOCOL_VERSION = 4` 19, `PROJECTION_VERSION = 29` 36; `bridge/protocol.ts` `SCHEMA_ID` 35; inner save literal 19 in `src/core/save.ts` `SaveFileV19` 363-367, `validateSaveV19` 7228-7247, `makeSave` 6046-6051, `validateSave` 5000-5019, and hard-coded outside core at `bridge/runtime-checkpoint.ts` 437, `bridge/session.ts` 120, `ui/src/engine/adapter.ts` 3771, `bridge/runtime/campaign-library.ts` 48/127; outer checkpoint 1 `bridge/runtime-checkpoint.ts` 25-26; library format 2 `bridge/runtime/campaign-storage-codec.ts` 18-29 | **REUSED** (and the bump list) | A P14 root wave is one governed inner-save step (from the then-accepted head — the P13A companion §1.8 records that P13 mints `SaveFileV20`, so P14's base is V20 or later) **and** a projection/schema bump with the outgoing `sha256:8b2569b1…` appended to `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` (`runtime-checkpoint.ts` 52-162), because a current-schema checkpoint must carry exactly the live save version (437-441) and no in-place inner-save migration exists. |
| Additive-root template | `types.ts` `GameStateV19 = GameStateV18 & { hollywood }` 1689; strip-and-delegate validator `validateSaveV19` 7228-7247; pure `convertV18ToV19` 7250-7253 → `initializeHollywood(state,'migration')`; downgrade guards `assertFrozenBuilderRetainsHollywood` 5673-5677; recording boundary `origin`/`originWeek` and per-identity `recordedFromWeek` (`hollywoodTypes.ts` 14-16, 108-110; validation 92-99); prior template `studioHistory.recordingStartedWeek` ("NOTHING BEFORE recordingStartedWeek IS RECONSTRUCTED. Old saves say 'Not recorded'", `src/core/studioHistory.ts` 18-19) | **REUSED** as template; **NEW P14 WORK** for P14's roots | P14 adds one top-level key per wave (the `hollywood` root is exact-keyed and version-pinned at `hollywoodValidation.ts` 59-62, so P14 state does not go inside it), a strip-and-delegate validator, a pure convert that seeds empty roots plus a `recordingStartedWeek`, downgrade guards in every older builder, and NOT-RECORDED presentation for anything earlier. |
| Named campaigns / Save As | `bridge/runtime/campaign-library.ts` `CampaignRecord` 18; New Game seed `bridge/session.ts` 1276-1284; Save As re-imports `currentSaveJson` under a new session and storage UUID 229-235; Rename 241-243; Load 236-240; inactive records are inert strings, only `this.session` ticks (`runtime-coordinator.ts` 123) | **REUSED** | All P14 state lives inside `GameState`, so Save As copies it and the lineages diverge naturally. |
| Cache scoping precedent | `WeakMap<GameState,…>` in `bridge/snapshot-build-context.ts` 105 and `bridge/industry.ts` 28; `hollywood.ts` 44 `employmentByPerson` keyed by the employment array object; per-session `pendingQuotes`/`processed` (`session.ts` 1231-1232); `sameNativeCampaignOrigin` treats copies as one origin (`bridge/campaign-origin.ts` 3-7) | **REUSED** law | Any P14 index (due-week buckets, hot relationship edges, feasibility caches) is in-state or a `WeakMap` keyed by the `GameState` object; never a module-level map keyed by `PersonId`, `caseId`, seed or `worldId`. |
| In-state identity for receipts | core has no session/campaign id (`types.ts` 1668-1690); the only in-state identity facts are `seed`, `hollywood.worldId` (pure function of seed) and monotonic counters (`hollywood.nextReceipt`, `studioHistory.nextEventId`) | **REUSED** law | P14 receipts are stamped with week, an in-state monotonic ordinal in the P14 root and foreign in-state ids only. No UUID enters `GameState`. Idempotency of duplicate scheduled delivery is per in-state lineage (the same receipt id legitimately exists in two records). Naming trap: `CastingReservation.sessionId` is a casting-session id, not a bridge session. |
| Stored RNG | `GameState.seed`, `rngState` (sfc32; advanced only by reception in `tick.ts` 27-29, 218, 998); derived streams `stream(seed, purpose, key)` with a closed `RngPurpose` union (`src/core/rng.ts` 37-71, 203-206); rival package/reception use derived `hollywood-v1` streams (`hollywoodTick.ts` 180, 238); rival staffing uses none and depends on `state.talent` order | **REUSED** law | P14A consumes no RNG; never touches `rngState`; never adds a purpose without a reviewed `rng.ts` change; never uses array order, Map/Set order or `PersonId` lexical order to decide a contested choice (P12's own staffing idiom is not a precedent for P14). |
| Null industry root | `types.ts` `GameStateV19.hollywood: HollywoodState | null` 1689; null only for the historical non-player corpus (`hollywoodValidation.ts` 54-57 "a founding campaign requires its industry"); every P12 consumer early-returns on null | **REUSED** law | Every P14 reducer and projection early-returns on `hollywood === null` exactly as P12's do. |
| Governed migration and retries | `bridge/runtime-checkpoint.ts` strict path 1020-1150, prior-schema path 812-1006 (both slots re-imported through `migrateToV19(importSave)`, journal discarded, new session, revision 0); exact retries by `(sessionId, commandId, requestJson)` (`session.ts` 1955-1971); atomic library write (`runtime-coordinator.ts` 106-126; `checkpoint-store.ts` 585-660) | **REUSED** | P14's migration is pure, total over ≤ 32 records × 2 slots + legacy slot, and any refusal presents as a startup fatal (no per-record quarantine exists). It must be proven over a protected copy of the Owner's real multi-record library. |

### 1.10 Industry / History projections

| Connection | Where it lives | Class | P14 obligation |
|---|---|---|---|
| Paged Industry query | `bridge/industry.ts` `industryPage` 108-147 (page/pageSize 1..50; views roster, employment, pulse, history) | **REUSED** | The August "no P14 paging/cursor" is stale; P14A.2 reuses page-based projection over in-save arrays. There is no cold/segmented history store, no persisted cursor and no incremental digest anywhere in the accepted tree: the Annex §G/§M machinery describing them is **NEW P14 WORK** if ever built, and the package recommends projection-level paging instead. |
| Career-event ledgers | `types.ts` `TalentCareerEvent` 1708-1737 (role, billingWeight, before/after facts, reason codes); two ledgers: `GameState.careerEvents` and `HollywoodState.careerEvents`, both produced by `src/core/releaseCareers.ts` `applyReleaseCareers`; merged on the wire by `bridge/people.ts` 367-371 with provenance `recorded/partial/notRecorded/none` | **REUSED** | Relationship and promise evidence is derived from these plus `FilmParticipants` (`types.ts` 217-222) and `HollywoodCredit` (`hollywoodTypes.ts` 19); never from co-presence. |
| Employment history | only `hollywood.receipts` `employment` rows; P08 `StudioHistoryState` has no employment kind (`types.ts` 1604-1650) | **REUSED** | P14 adds no duplicate history portal; the chooser receipt references `industry-event-N` ids. |
| Public disclosure | `bridge/industry.ts` 63-65 ("Credits establish work on a film. They do not establish historical employment."), Pulse suppresses routine renewals/entries 93 | **REUSED** | A contested move is a new material public activity family for Pulse (INT-005); rival terms stay unknown. |
| Credit rows and employer-at-credit | `bridge/industry.ts` 38-39 attaches the *current* employer to every credit row, never the employer at credit time | **REUSED** (hazard) | P14B shared-work evidence joins on `hollywood.employment` intervals by week, never on Industry credit rows. |
| Closed view enumeration | `bridge/schema/industry-schema.ts` 16 (`studios|studio|films|film|person|pulse|history|roster|project|employment`) | **SHARED GENERALIZATION** | A P14 market view changes the canonical schema hash → projection bump; P14A.2 budgets it. |
| History projection | `bridge/history.ts` `historyProjection` 171-183: whole-snapshot, player-only read of `state.studioHistory`; `careerMilestone` is typed (`types.ts` 1648) but has no producer anywhere | **REUSED** (limit) | Neither history home is paged; P14 lifecycle/market rows live in the P14 root and are paged at the projection layer; no P08 history kind is added by P14A. |

### 1.11 Person, career, age and supply seams (P14C)

**Finding.** No aging, retirement, death, removal, apparent age, profession change, development focus, or registration receipt exists; `Talent.age` is a static number (a continuous float for worldgen people, an integer for authored ones) read by three seams; all four disciplines' skills exist on every person, and `careerIdentity()` already distinguishes proven from capable-but-unproven per discipline.

| Connection | Where it lives | Class | P14 obligation |
|---|---|---|---|
| Static age | `types.ts` `Talent.age` 111; written once (`worldgen.ts` 482 continuous `truncatedNormal(38,10,20,70)`; authored 18..70; rival incumbents floored to 28 `hollywood.ts` 174); read by `ageFactor` (`employment.ts` 219-223), `ageRunwayMult` (`talentSummary.ts` 639-646), worldgen seeding; UI floors it (`ui/src/format.ts` 29-31) | **NEW P14 WORK** (birth provenance root) | `legacy_age_anchor` must accept a float; new people receive authored provenance; the stored leaf is preserved and stops being the authority. Rival supply draws age from N(38,10) regardless of year (`worldgen.ts` 544-549) — cohorts must author era-appropriate ages. |
| Professions and disciplines | `types.ts` `CreativeRole` 18, `Discipline` 45, `ROLE_TO_DISCIPLINE` `tuning.ts` 1811-1816; every person carries all four disciplines' skills (`types.ts` `SkillProfiles` 85-93); cross-discipline assignment legal at greenlight (`actions.ts` 284-307); `careerIdentity` proven / capable-but-unproven (`talentSummary.ts` 520-560, `CAPABILITY_OVR_MIN` 60); managed casting and script read models filter `role === 'actor'`/writer (`castingReadModel.ts` 254-255; `scriptReadModel.ts` 912-914) | **REUSED** (eligibility ground); **SHARED GENERALIZATION** (profession change) | Actor → Director / Actor → Writer eligibility reads `careerIdentity`, work history and public potential; the transition itself is a P10-owned `Talent.role` rewrite (no such action exists today) after which the role-filtered read models admit the person naturally. A P13 fifth role is **POST-P13 REFRESH REQUIRED**. |
| Development and aptitude facts | hidden `ceilings`, `devRate`; public `workEthic`, `expectedPotentialTier/Range` (`talentSummary.ts` 454-502); no "development focus" exists | **REUSED** (public facts only) | The August "P10-authored development focus" seam does not exist; P14C reads only the public potential band and career identity. |
| Star Power | `types.ts` `Talent.fame` 114; `src/core/starPower.ts` 67-110 (per-release delta, clamp −4..+10, no weekly decay) | **REUSED** / DO NOT TOUCH | Aging never touches it; the market ask consumes it through `salaryCurve`. |
| Genre experience and fit | per-(discipline, genre) experience grows only by working (`development.ts` 142-156); actor fit is persona-based (`talentSummary.ts` 297-352); no age-driven decay anywhere (`development.ts` 102, 129-133) | **REUSED**; apparent-age fit is **SHARED GENERALIZATION** | P14C publishes an apparent-age fit descriptor; the casting/result owners decide whether to consume it inside their accepted formulas. No decay is built. |
| Supply | `WORLD_CONFIG.talentCount 60`; founding draft 24; rival entry and deficits mint through `generateIndustryTalent` (`worldgen.ts` 544-549) with `uniqueIdentity` (`hollywood.ts` 18-23); `state.talent` append-only and order-load-bearing | **SHARED GENERALIZATION** | The August "P10 identity allocator / registration receipt" does not exist; P12 mints rival people. P14C cohorts reuse the isolated-seed mint idiom through one exported primitive owned by P10/worldgen, append to `state.talent`, and record the cohort receipt in the P14 root. |
| Visibility firewall | `docs/engineering/P10-INFORMATION-VISIBILITY-TABLE.md` (age PUBLIC "no aging law; static"; relationships/aging "not produced"; actual skills, ceilings, devRate, seed HIDDEN) | **REUSED** / DO NOT TOUCH | P14 projections derive interest, trust and classifications only from public evidence; relationship/trust state lives in new roots, never on `Talent` (future-proofing invariant "never write a studio-relative fact onto a shared-world entity"). |

### 1.12 Production and scheduling seams (feasibility, drivers, obligations)

**Finding.** A managed production is a fixed eight-week countdown (development 1, pre-production 1, rehearsal 1, shooting 2, post 2, release-ready 1) that holds on capacity blockers; there is **no forward schedule**; genre is fixed at commission; roles are exactly writer / director / lead / antagonist / support / craft; there is no recast verb and no "extra"; contract expiry leaves the seat intact.

| Connection | Where it lives | Class | P14 obligation |
|---|---|---|---|
| Countdown and phases | `tuning.ts` `PRODUCTION_TICKS 8` 57; `src/core/productionPhases.ts` 36-45 (phase by remaining ticks), 52-61 (capability multiset per phase) | **REUSED** | The feasibility service uses these as the minimum lawful pipeline. First actual filming = the `shooting` phase entry gated at `src/core/operations.ts` 1454-1466 (director assigned, scenery load-in cleared, take scheduled). |
| Pre-greenlight durations | script draft 1 (pool) or 1..6 (original) (`tuning.ts` 858-877; `screenplay.ts` 373-396); rewrite 1; casting session exactly 1 (`tuning.ts` 1664); scenery load-in 1..5 from stage acquisition (`tuning.ts` 808-810) | **REUSED** | |
| Capacity | `types.ts` facilities 554-559; founding plant 2 dev-casting / 2 post / 2 scenery / 2 stages × 1 (`tuning.ts` 617-620; `operations.ts` 71-105); bare-lot founding zero (`operations.ts` 129-152); blueprints with build weeks; `completesWeek` on placed facilities (`types.ts` 1042-1057); no global concurrency cap (`tuning.ts` 58-67) | **REUSED** | Stage-bounded throughput ≤ stage slots × weeks ÷ 3 (rehearsal + 2 shooting); the service derives the bound itself. |
| Forward schedule | absent by contract (`docs/STUDIO-CALENDAR-V1-CONTRACT.md` 132-135; `studioCalendar.ts` 1-3); queued intents hold nothing (`productionQueue.ts` 11-19) | **NEW P14 WORK** (the bound) | The service counts started productions, queued intents, ready/drafting scripts, slot inventory and under-construction completions, and never treats a queued greenlight as a planned start. |
| Committed due weeks | `studioCalendar.ts` commitments 58-114, 445-572 (scriptDue, castingDue, constructionCompletion, theatricalReceipt, contractRenewal, contractExpiry) | **SHARED GENERALIZATION** | Promise due weeks, case decision weeks and retirement effective weeks become new committed commitment kinds in this read model, not a second clock (owner: the calendar read model). |
| Roles and seats | `types.ts` `CastSlot` 19, `FilmParticipantRole` 206, `Production.cast/directorId/writerId/craftIds` 225-239, frozen `FilmParticipants` at engaged greenlight; one role per person per production (`actions.ts` 391-423); no recast verb (`types.ts` 1739-1799) | **REUSED** | "Lead role" = `cast.lead`; antagonist as a qualifying lead is a catalogue decision (companion §4.2). Relationship drivers use casting-session competition and shared seats; "replaced as lead" is not a driver until a recast verb exists. |
| Genre | fixed on `FilmConcept` at commission (`types.ts` 154-163; `actions.ts` 373-378) | **REUSED** | Preferred-genre promises are evaluable at every pre-greenlight status and from queued commission intents. |
| Expiry mid-production | seat kept, person becomes `engagedFreelancer` in status (`employment.ts` 372-383); writer mid-draft can expire (nothing blocks it) | **REUSED** | Retirement's obligations-first rule uses the busy set as its predicate; firing's refusal extends to the busy set (recommendation R2). |

### 1.13 P11 money seams and the settlement insertion point

| Connection | Where it lives | Class | P14 obligation |
|---|---|---|---|
| Termination booking | `actions.ts` 2710-2717 (`termination` ledger row, signed, `talentId`); `financeReport.ts` 13 "Termination payments"; `economyView.ts` 434, 464, 516, 589-593 (folded into `otherCash`; never recurring cost, Upcoming or runway); ungated by solvency (P11-REQ-023) | **REUSED** | The recalibrated charge is booked exactly here; P14 computes nothing else; the finance consequence envelope (`bridge/finance-consequence.ts`) already shows immediate cash change and the drop in guarantees. |
| Obligation over time | absent; P11 adds no finance root (P11A register "No new Finance root"; loans/bankruptcy OWNER-BLOCKED) | **not P14** | A deferred termination liability would be an additive root plus an Owner gate; the package keeps the charge lump-sum. |
| Second affordability owner | forbidden (`canAfford` `employment.ts` 78-85 is the single legality gate; P11 handoff "Finance owns no … affordability rule") | **REUSED** law | The rival's affordability is its reserve rule (strategy), not a copy of `canAfford`. |
| Upcoming commitments | `bridge/finance-upcoming.ts` 9-12 (contractRenewal / contractExpiry rows); `bridge/finance.ts` 80-81 guarantees basis | **SHARED GENERALIZATION** (Ready) | A case decision week may appear as an Upcoming row under the calendar owner; the termination charge replaces the person's guarantee in the week of release. |
| Settlement insertion point | `tick.ts` 893 (`advanceHollywoodWeek`, where `staff()` runs) precedes player expiry at 964-968, scheduled rival entry at 1038-1042 and `finishHollywoodWeek` at 1043; an arriving rival reserves only rows with `endWeekExclusive > week` (`hollywood.ts` 165), so a person whose contract expires exactly at an arrival week is takeable by the arriving rival in that same tick | **NEW P14 WORK** (scheduled phase) | The P14A decision phase is a new fixed-order step inside `tick()` placed so that (a) the incumbent's immediate renewal loop is bypassed for a person under a case, (b) the frozen proposal set is settled before expiry removes the contract, and (c) `recordPlayerEmployment` and the P12 signing primitive are invoked explicitly. The pipeline is documented as insertions-not-reorderings (`tick.ts` 10-38). |

---

## 2. Matrix totals

Counted from the tables of §1 (a row carrying two classes counts once under each), plus §1.5's three prose rows, P14's own roots, and the §3 post-P13 rows.

| Area | REUSED | SHARED GENERALIZATION | NEW P14 WORK | POST-P13 REFRESH REQUIRED |
|---|---:|---:|---:|---:|
| 1.1 StudioId | 4 | 0 | 0 | 0 |
| 1.2 PersonId / employer | 4 | 1 | 0 | 0 |
| 1.3 Exclusivity | 6 | 0 | 0 | 0 |
| 1.4 Intervals / transitions | 1 | 2 | 1 | 0 |
| 1.5 Active / reserved / arrivals | 3 | 0 | 0 | 0 |
| 1.6 Rival finance / capacity | 5 | 3 | 0 | 0 |
| 1.7 Calendar | 3 | 0 | 0 | 0 |
| 1.8 Employment legality | 4 | 2 | 0 | 0 |
| 1.9 Persistence / campaigns / RNG | 7 | 0 | 1 | 0 |
| 1.10 Industry / History | 6 | 0 | 0 | 0 |
| 1.11 Person / age / supply | 5 | 3 | 1 | 0 |
| 1.12 Production / scheduling | 6 | 1 | 1 | 0 |
| 1.13 Money / settlement | 2 | 2 | 1 | 0 |
| P14's own roots (market cases, proposals, chooser receipts, promises, feasibility receipts, trust, relationship edges and history, birth provenance, lifecycle and retirement, transitions, cohorts, P15B disposition seam) | — | — | 12 | — |
| §3 P13 seams (era facts, first-filming seam, durations and capacity, professions, rival movements, persistence base, identities, process-global caches) | — | — | — | 8 |
| **Totals** | **56** | **14** | **17** | **8** |

The adversarial pass found no REUSED row resting on a design document alone and no missing symbol. It corrected four supporting details before publication: the interval id is `contractId` (not a separate `EmployerIntervalId`); PersonIds encode their origin and are opaque rather than "never containing role"; the P10 "registration receipt" and "development focus" seams named in August do not exist; and the "cold history segments / incremental digests" of the Annex are absent machinery.

---

## 3. P13 dependencies: known required contract, post-acceptance refresh required

Technology / P13 state does **not** exist because the P13 plan exists. No P13 branch was inspected. Every row here names what P14 must consume from P13 as a contract and marks it for refresh after P13 Owner acceptance.

| P13 seam | KNOWN REQUIRED CONTRACT (what P14 needs, by reference) | POST-P13 ACCEPTANCE REFRESH REQUIRED |
|---|---|---|
| Era / timeline facts | a public era label and dated milestones by reference, for cohort era-appropriate ages, labor-demand context and profile copy | the actual symbol, root and validator; whether P13 keys eras off `campaignDate(week).year` as its companion §1.1 requires |
| First-filming seam | the accepted "in-flight = first actual filming" boundary (P13 direction 8) as the promise qualifying event and the firing/retirement obligation boundary | whether P13 changed `productionPhases.ts` or the shooting gate at `operations.ts` 1454-1466 |
| Stage durations and capacity | the durations and slot inventory the feasibility service reads | any P13 duration or capability change (laboratory capability, new facility kinds) |
| Professions | the `CreativeRole` / `Discipline` unions and `ROLE_TO_DISCIPLINE` | a fifth role (Scientist) joins the lifecycle, aging, retirement and market law and needs its own retirement window hypothesis and market eligibility rule |
| Rival movements | `RivalMoneyKind` and the period exact-key shape | P13A's authorized `technologyAdoption` movement kind; P14's `termination` kind lands in a separate governed step |
| Persistence | the inner save version, projection and schema id in force | P13's governed migration bumps them; P14's migration base is the then-accepted head, never V19 assumed |
| Identities | accepted runtime, player-build, source-manifest and evidence shas | the P13 closeout's receipt |
| Process-global caches | none may be keyed by seed/worldId/PersonId | verify P13 added none |

P14 designs its seams so that each row is a bounded refresh, not a redesign.

---

## 4. Inherited register rows

Every accepted register row that names P14 or binds it, with the class it takes in P14. Row identifiers are those of the accepted documents at `13370d4`.

| Row | Obligation | Class |
|---|---|---|
| Future-consumer contract §11 (P12A owns employer identity, exclusivity, intervals, allocation, noncompetitive maintenance; competitive cases and offers re-homed to P14A) | P14 consumes employer facts; owns cases | REUSED + NEW |
| Future-consumer contract §8.1 receipt table (`PersonJoinedStudio / PersonLeftStudio`: P12 commits interval state; P14 authors the competitive decision receipt) | P14's receipt links, P12 commits | SHARED GENERALIZATION (receipt reason) |
| Future-consumer contract §13 (P14 owns cases, proposals, lawful knowledge, chooser; P10 person/contract/career; P12 employer state) | ownership matrix | REUSED law; "intermediary" in the row is superseded by rulings §3.4.1 (8) |
| Future-consumer contract "Exact labor depth … open Owner decisions. Their placement is not open." | placement fixed | DO NOT TOUCH |
| Future-consumer contract §15 (P14 may not remint a person, mutate employer truth directly, erase history, infer relationship from co-presence, or smuggle in in-term poaching/buyouts) | prohibitions | REUSED law |
| Future-consumer contract "Payroll, salaries, guarantees, private terms HIDDEN except a later lawful disclosure" | disclosure law authored with the proposal fact | NEW P14 WORK (companion §2.1.5) |
| P12A register GOV-004 (full fantasy culminates through P14/P15/Legacy) | P14 delivers the lost-star test | NEW |
| ID-005, SAF-017 (no employer on `Talent`; no widened frozen leaves) | additive roots only | DO NOT TOUCH |
| ID-012 (typed receipt envelope, family membership staged) | P14 receipts use the envelope | SHARED GENERALIZATION |
| SIM-009 (rival policy dimensions incl. talent continuity) | rival proposal strategy is bounded policy | SHARED GENERALIZATION (policy dimension) |
| LAB-001 … LAB-005 (one identity; contract-ID intervals; exclusivity; protected founding pool and bounded supply; guaranteed contracts preserved until expiry, lawful release or a future explicit break clause) | REUSED | REUSED; "lawful release" already covers the player's firing |
| LAB-006 (one deterministic affordable incumbent-rival renewal; on failure make the person free; no head-to-head bid) | baseline superseded at the case boundary only | REUSED baseline |
| LAB-007 (cross-studio credit exactly once) | REUSED | REUSED |
| LAB-008 / LAB-009 (employer transitions expanded by P14A; competitive offers, contested renewals, bidding, relationships, aging, retirement deferred to P14A; P14 later proves symmetric deterministic offers) | the proof obligation | NEW |
| UX-007 (profile inspect-only; no action without authoritative gameplay) | P14 profile actions need TS authority | SHARED GENERALIZATION |
| UX-011 / SAF-014 (hide salaries, clauses, terms) | constrains the comparison view | REUSED law |
| UX-014 (DECISION only with a live player response window; rival news never BLOCKING; maintenance never invents "you lost") | P14 supplies the window | SHARED GENERALIZATION |
| HIS-007 / SAF-016 (no invented pre-migration relationships) | NOT RECORDED | REUSED law |
| HIS-013 (closure settles contracts; P15B) | disposition manifests only, later | P15B dependency |
| HIS-014 (never persist "archenemy", "greatest rivalry" without definitions) | every classification defined with evidence | NEW (companion §5.3) |
| INT-005 (P14 produces contested labor moves for the Wire) | NEW receipts | NEW |
| INT-007 (P14A owns competitive labor incl. "bidding/poaching") | wording broader than rulings §3.2; in-term poaching stays excluded | NEW, bounded |
| INT-010 / SAF-008 (bankruptcy, closure, churn remain P15B) | DO NOT TOUCH | DO NOT TOUCH |
| PRF-009 (no fabricated bid loss; same-person rival credit once; legal staffing through week 6,240) | proof P14 keeps green | REUSED |
| SAF-005 (active prohibition on competitive bidding in P12A; refresh trigger: P14A authorization) | lifted only by the P14 order | NEW gate |
| SAF-021 (no player-only penalties, hidden rescue top-ups) | firing law symmetric | SHARED GENERALIZATION |
| Register refresh triggers "Final P14A: LAB-008–009; UX-014; INT-005/007; HIS-014" and "Any schema/save/root change" | rows to refresh | POST-P13 REFRESH REQUIRED |
| R05 §"Preserve P11 acceptance; reopening P11 as another feature wave is not authorized" | the charge recalibration is a P10 contract-law change under Owner direction, not a P11 reopen | REUSED law |
| R05 "No aging, era effects" from the calendar | aging is NEW | NEW |
| R05 "No unlimited supply, cloned people or in-term theft"; "No … competitive bidding/poaching" | lifted only at expiry / free-agent cases | NEW, bounded |
| P11A REQ-003, REQ-013, REQ-014, REQ-016, REQ-022, REQ-023, REQ-029, REQ-032 (cash literal; typed Other Cash incl. termination; payroll truth; guarantees not subtracted; affordability is legality; release may take cash negative; Upcoming allowed rows; hire/renew/release previews) | REUSED | REUSED |
| P11A REQ-043 (do not retune the economy) as applied to `HIRING_TERMINATION_FRACTION` | yields to the 2026-09-11 Owner direction (rulings §3.4.2) | superseded for this constant only |
| P11A "No new Finance root"; REQ-041/042 OWNER-BLOCKED | lump-sum charge only | DO NOT TOUCH |
| P11 → P12 handoff "Guarantees are future payroll, not a second debit"; "Finance owns no mutation, RNG, clock, Save or affordability rule"; "Finance adds no persistence root" | REUSED | REUSED |
| P08–P10 → P11 handoff (P10 produces guaranteedRemaining, terminationCost, renewal state; P11 must not duplicate pricing or legality) | same bar for P14 | REUSED / DO NOT TOUCH |
| P08–P10 deferred register P10-REQ-016 (no new Star status; OWNER-BLOCKED) | not a market tier | DO NOT TOUCH |
| P10-REQ-034 (relationships work-derived; no manual friendship grind) | P14B | NEW |
| P10-REQ-035 (morale, stress, burnout) | not P14 | DO NOT TOUCH |
| P10-REQ-036 (aging, retirement, alumni need authoritative time, eligibility, transition, portrait, contract, migration rules) | P14C | NEW |
| P10-REQ-037 (mortality requires explicit Owner law) | P16+ | DO NOT TOUCH |
| P10-REQ-038 (renewable era-aware supply, agents, rival employment, poaching wait for P12/P14) | rival employment delivered by P12; supply and expiry competition NEW; agents superseded | NEW / superseded |
| P10-REQ-039 (Power Rankings) | P15A.2 | DO NOT TOUCH |
| P10 future-consumer contract "P12/P14 may extend employment, rival ownership, aging, retirement, relationships or renewable supply through new authoritative roots; must preserve exact identity and historical credits" | REUSED law | REUSED |
| P12 design package "Selling, firing, unhappiness, and contract-expiry bidding are distinct mechanisms" | firing is its own mechanism | REUSED design law |
| P12 design package "Movement occurs at contract expiry, lawful release, or another future contract mechanism that explicitly permits competing offers" | P14A is that mechanism at expiry | REUSED |
| P12 design package §22 "expected salary … only when a scouting/agent law supplies it" | superseded by the no-agent direction; the disclosure law of companion §2.1.5 replaces it | superseded |
| P12 → P13 handoff "P14/P14A: competitive labor cases/proposals/choice, then separately governed relationships/lifecycle … No in-term theft or inferred relationship from co-presence" | binding | REUSED |

---

## 5. Stale statements in the August P14 design and Annex

Each row names the statement, why it is stale, and what governs now. The August documents are not rewritten; they carry a banner pointing here.

| August statement | Where | Truth at `592e926` | Governs now |
|---|---|---|---|
| Accepted TypeScript authority `7811377`, Unity `29aea89`; "P05 implementation branch is active and unsealed" | design §1, §9; Annex header | runtime `592e926`, closeout `13370d4`, Unity `2bc8d30` / `deca395`; P05–P12 accepted; P13 running | §0 |
| "`src/core/save.ts` supports V1–V15" | design §9; Annex §I | V1–V19 live at V19; migration base for P14 is the then-accepted head | §1.9 |
| "no accepted rival studio population"; "`MarketState.competingSlate` … inert" (rival seam) | design §9; Annex §I | ten identities, four entered rivals at week 0, real rosters; `competingSlate` still inert but no longer the rival seam | §1.1, §1.6 |
| "no general immutable `employerStudioId` interval ledger" | design §9 | `HollywoodState.employment` | §1.2 |
| "no shared multi-studio employment index" | design §9 | `activeEmploymentOrdinals`; three-way enforcement | §1.3 |
| "P11 future authority" for finance quote/consequence | Annex §I | P11 accepted; `bridge/finance-consequence.ts`, `canAfford` | §1.13 |
| "adapter/bridge whole-snapshot pattern; no P14 paging/cursor" | design §9 | paged Industry query exists; page-based, not cursor | §1.10 |
| Career events "in `tick.ts`"; single ledger | design §9; Annex §I | `releaseCareers.ts` shared producer; two ledgers | §1.10 |
| "worldgen produces a finite talent population" | design §9 | bounded, growing through P12 minting | §1.11 |
| `EmployerIntervalId` as a P12 id | design §13.2; Annex §C.3 | the interval id is `contractId` | §1.2 |
| "PersonId … never contains employer, role, name, age, or array position" | design §13.2 | ids encode origin (`t-act-00`, `person-<studio>-<n>`); restated as opaque and immutable | §1.2 |
| "P10 identity allocator/registry … person-registration receipt" | design §13.1, §22; Annex §C.6, §G | absent; P12 mints rival people via `generateIndustryTalent` + `uniqueIdentity` | §1.11 |
| "P10-authored development focus" as a read-only input | design §11 law 16, §15; roadmap §6.2 | absent | §1.11 |
| "History segments immutable after sealing"; "cold-history page/checksum recovery"; "incremental digests" | Annex §G, §M; design §19, §28 | absent machinery; whole-checkpoint sha256 cells and whole-save digests only | §1.10 |
| Browser local-storage caveats | design §19; Annex §M.5 | Node worker-owned file store with explicit 192 MiB / 256 MiB bounds | §1.9, §6 |
| No mention of named campaigns, Save As, session scoping, shared entity ids | design, Annex (absent) | binding handoff law | §1.9 |
| "Duplicate scheduled event delivery is idempotent by durable event/receipt ID" | Annex §G | receipt ids are duplicated across Save As copies; idempotency is per in-state lineage | §1.9 |
| Annex §H.1 step 3's abstract P12 prerequisites | Annex §H.1 | concrete: `activeEmploymentOrdinals`, `employment[].endedWeek`, `employment` receipts, `originWeek` / `recordedFromWeek` | §1.9 |
| Annex §C.7 `priorOperatingState: active|dormant|closed` | Annex §C.7, §D | no such P12 field; P15B seam only | §1.1 |
| `Promise` as a P14 type name | design §12.2; Annex §C.4, §D | `Promise` is already the screenplay promise type (`types.ts` 192) | P14 names its record `ProfessionalPromise` (companion §4.1) |
| Rival "cannot sign someone without an offer record" | design §17 | rivals sign with no offer record today; this is P14A's change and needs the validator extension of §1.4 | §1.4, §1.6 |
| "active employer, contract naturally expires → expiry-phase P14 chooser selects" as a relabel of existing code | Annex §C.3 | rival maintenance runs before player expiry in the same tick and renews at the first window week; the decision phase is a new scheduler step | §1.13 |
| Informational intermediary, agency routing, commission, `intermediary_contacted`, `IntermediaryEngagement`, `IntermediaryPublicDto` | design §2, §11 laws 9–10, §12.1, §14–§17, §23, §26–§27; Annex §A–§E, §K, §L, §N, §Q | superseded by rulings §3.4.1 (8) | rulings §3.4.2 |
| "P14B excludes romance"; "relationship scope remains professional" | design §20, §23, §25 | superseded by rulings §3.4.1 (12)–(13) | rulings §3.4.2 |
| Early release / compensation parked in P14D | design §2, §11 law 9, §16, §23, §25; Annex §B | superseded by rulings §3.4.1 (1)–(3) | rulings §3.4.2 |
| Multi-campaign library "not implemented"; "P05 remains the active workstream" | rulings §2.4, §7 | overtaken by the P12 R05 acceptance | rulings §3.4.2 |

---

## 6. Persistence, isolation and performance findings for P14 state

**Persistence shape.** P14 state is one new top-level key per accepted wave, additive, exact-keyed, version-pinned inside itself the way `HollywoodState.version` is, validated by strip-and-delegate, seeded empty with a `recordingStartedWeek` on migration, guarded against downgrade in every older builder, and accompanied by a projection/schema bump with the outgoing schema id registered as a prior. The anti-exploit floor needs **no** new persisted fact: it is derived from the accepted employment ledger (a player row with `endedWeek < terms.endWeekExclusive` and a `termination` receipt, `industryEmployment.ts` 25), so P14A.1's only new persisted shapes are the market case, its proposals and the chooser receipt.

**Isolation.** Guaranteed structurally, exactly as P12 guarantees it: all P14 authoritative state inside `GameState`; every derived index a `WeakMap` keyed by the `GameState` object or a per-session map dropped on state replacement; receipts stamped with in-state facts only; idempotency scoped to the in-state lineage; no UUID in core. Save As copies of one campaign then carry the same open case, the same promises and the same relationships at the moment of copying and diverge afterwards, which is the correct and only lawful behavior. Nothing P14 stores is keyed by seed or `worldId` because two campaigns share both.

**Migration honesty.** Old saves initialize empty P14 roots and a recording boundary; nothing before it is reconstructed: no prior offers, competitors, promises, trust, relationships, romances, birthdays, retirement decisions or profession changes. `legacy_age_anchor` records the stored age (float or integer) at the migration week with estimated-year precision. The one labeled exception the package puts to the Owner is a truthful *reconstruction of collaboration counts* from existing film credits (companion §7.3 Q3). The recalibrated termination rule must be versioned so that saves carrying a historical termination still load (§1.4).

**Performance.** P12's disclosed qualifications are carried forward verbatim and are not resolved by P14: large-world complete Save p95 **9.58 s** (9,577.75 ms, 20 samples after 3 warmups); native Save response **10.54 s**; **UI-unresponsiveness duration not measured**; load-ready p95 13.415 s; 4.821 GB standalone high-water memory; serialize-plus-digest p95 199.5 ms against a 100 ms target; Hollywood field 37,829,874 bytes against 8 MB; average film 3,146 bytes against 1.5 KB; the 12-active / 48-project / 4,000-film / 50-archived-studio stress and the isolated write-worker handoff unrun; intermittent Reconnecting observations recorded. The mechanisms that make these costs scale with root size are known: every accepted command canonicalizes and SHA-256s the whole save once per state object; the checkpoint is the whole `currentSaveJson` plus `savedSaveJson`; the library re-encodes every record on every write; startup strictly re-imports every record. Consequences the package adopts: no per-week rows and no per-person-per-week evaluation output; due-week queues as in-state buckets so weekly work is O(due events) (PERF-002); relationship edges only after evidence, hot index bounded, cold history paged at the projection layer; settlement as one state transition, not many commands; every P14 root measured in the accepted encoding against the 192 MiB checkpoint and 256 MiB library bounds before the wave seals; the Annex §M stress envelope (2,500 people, 50,000 events, 20,000 intervals, 25,000 retained driver records after compaction) budgeted on top of a baseline that already misses the 8 MB target by roughly 4.7× on the Hollywood field alone. P14A.1 adds one case root and must not measurably move Save p95; P14B/C roots are the ones that need the measurement.

---

## 7. What the refresh settled, and what stays open

**Settled.** The August stop condition of design §31 ("stop if a real rival/employer identity spine, stable person identity, or finance obligation authority is absent") is satisfied: the spine exists. The firing mechanic the Owner cited is exactly `applyReleaseTalent` at 50%. The one existing behavior P14A must change to make an expiry contestable is the incumbent's immediate in-window renewal (player and rival). The persistence template, the isolation law and the disclosure law are all real precedents with symbols.

**Open, for the launch review (not for the Owner).** Whether the case outcome is expressed as a new linked `from → to` P12 receipt or as two unlinked P12 receipts joined by the P14 chooser receipt (recommended: the latter). Whether rival early termination (the `termination` movement kind) is admitted into P14A as Ready work or waits for P14B. Where exactly inside `tick()`'s fixed order the decision phase is inserted. Whether a case may open for a person the rival's own maintenance would otherwise have re-hired from the free pool the week after expiry (recommended: yes, a free agent is always a case subject when at least one studio proposes). The float → integer rule for `legacy_age_anchor`. Whether a P14A intermediate save version is needed if P13 has bumped the inner save (POST-P13).

**Not claimed.** No performance qualification is resolved; no test was run; no P13 seam was verified beyond its published direction; the Unity repositories were not inspected.
