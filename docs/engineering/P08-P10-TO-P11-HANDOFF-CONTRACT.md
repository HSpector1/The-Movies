# P08–P10 to P11 Handoff Contract

## Current status — accepted-source refresh, 2026-09-09

**P08–P10 OWNER ACCEPTED — KEEP. Final changed-path source refresh complete.**
Authority: `OPS-P08P10-OWNER-CLOSEOUT-01`, documentation/prelaunch only.
Accepted engine build/source `fc1cd0e400337f551ba77d908b614e9dbaab9c9f`
(runtime lineage `4aa3487eebd656958a880d492567fe4d5f379480`), player runtime/build
`761347c77fa59cafaa6ede45f9eeebf3a9dfda98`, later tools
`28dd961e6a230a8d554bd7ab70fb3f766f9cedc9`, technical closeout
`764f27c60f0eb7fac6430a8f897dd80dfdcb178b`; contract **4 / 21 / V18**.

The [accepted-source addendum](P11A-READINESS-AND-DEPENDENCY-GATE.md#accepted-source-addendum--2026-09-09)
is the current source/identity/gate map. Revision 03 text and its observed/PENDING
statements below are retained history, superseded only where this refresh says so.
No gameplay tests, builds, runtime queue or P11 implementation were performed.
AUD-008 remains **STILL PRESENT**, assigned inside P11 W0, not a circular prelaunch
requirement to implement Finance first. Scope ceiling, budget and model settings
remain unchosen; a separate execution order is required.

**Reviewed outcome-first kit publication is BLOCKED:** the exact local
`project-studio-p11-outcome-first-launch-01` archive was not found. The older
revision-02 archive is not a substitute. This is a source-refresh publication,
not a claim to have materialized, applied or reviewed the missing kit. Preserve
all 45 requirements and five extension groups; do not reconstruct the approved
method from the older draft or memory.

### Historical Revision 03 record follows

**Status:** PROVISIONAL — OBSERVED P08–P10 STACK REFRESH (REVISION 03)
**Review state:** READY FOR CURRENT OPS DOCUMENT REVIEW
**Refresh state:** PROVISIONAL OBSERVED-STACK REFRESH COMPLETE · FINAL ACCEPTED-BASE REFRESH PENDING
**Implementation:** P11 IMPLEMENTATION NOT AUTHORIZED
**Accepted P07 baseline:** TS `2753e18ba8fb5f65b936c22cde9531646fecc6cd` · Unity `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6` · 4 / 15 / V16 · schema `sha256:ddce1c399ac4ff58327b296a0600428ac3f3346b84f3639e66e48e53a65fbe99`
**Observed P08–P10 WIP snapshot (this revision):** TS product `7b4d8ffebeb0b7978763780420fdc8542df68b5f` (docs tip `a2baa1d9b3ffb2666732dba55823e09cc76c7352`) × Unity `1d304f89a29ffca160129b705d7d627543adfb4d` (product `57f9ef857a5955a604a56c1526733f2302efabc8`) · 4 / 19 / V18 · schema `sha256:6a2c01feaf02c931a8c41bbf2090f8af003b89a492d77135d7aab2b42a8d3dc9` · inspected 2026-09-06 · OWNER ACCEPTANCE PENDING · UNSEALED
**Final accepted P08–P10 base:** PENDING
**Original P11 research:** `codex/finance-executive-ux-research-11@d6c38546d19fbb23533af496e0f62b9c340b7ce5`
**Revision 02 (immutable):** `90b349a8272f17ad7ea541cdddc777d36c1d861d` · **Hub:** `P11A-READINESS-AND-DEPENDENCY-GATE.md`


## 0. Revision log

| Revision | Change |
|---|---|
| 02 | Produces/consumes/must-not-duplicate per package; status matrix at the 2026-09-05 recon snapshot |
| 03 | "Current evidence" per package rewritten to the observed pair; new §6 per-dependency records (source owner, exact path/symbol/commit, usable public fields, quote/action owner, UI route, inspected proof, missing capability, final-refresh requirement); §7 status matrix updated with evidence classes; placeholders annotated with observed values |

## 1. Purpose

This contract prevents P11 from duplicating P08 History, P09 Construction or P10 People/Contracts. It records what P11 expects, what has actually been observed, and what must be refreshed after Owner acceptance.

## 2. Accepted P07 foundation (unchanged)

`FilmResult.productionId` is the immutable result/wire identity; title resolves through `conceptId`; participants/forecast optional; Critics, Audience and Business separate; Gross, Studio Revenue, direct film commitment and Contribution keep their accepted bases; active totals stay projected until the run settles; released films may have no Locate target; unknown exact-ID selection is never proof by fallback; existing studio events are not a universal event-receipt contract; permanent production-ID reservation must survive retention.

## 3. P08 → P11

**P08 produces** (observed): forward-recorded Studio History with an explicit boundary (`migratedStudioHistory`, `historyRecordedAt`, `notRecordedNotice`); Standing receipts with fact-derived reasons; film, person and facility rows; Administration/History routes; exact event ids.
**P11 consumes:** coverage/provenance; exact routes to film/person/facility records; the Administration owner and retained-navigation grammar.
**P11 must not duplicate:** the ledger inside history; the history root or significance; Standing receipts; seen/unread state; a second timeline; pre-recording history.

**Historical evidence (Revision 02):** at TS `908879a9…` × Unity `685f113e…` P08 Wave 2 had committed Save V17 / Projection 16; Unity Wave 3 dirty.
**Current evidence (observed 2026-09-06):** P08 core sealed at TS `8a23cb3b3c8e9d4780417ca44c60312b1bfd12bc` × Unity `64dab80e4dfd80fc4c0a559bc1a4034c44b5cc9e` (EVIDENCE REPORTED, `docs/campaigns/P08-TECHNICAL-CHECKPOINT.md`); facility rows added at TS `7582d62263cf99557b6e1527ba7bc68c9df80161` (P09-REQ-040); 8/8 P08 oracle re-envelopes pass on the final pair (EVIDENCE REPORTED). No finance milestone row kind exists.

## 4. P09 → P11

**P09 produces** (observed): endowed versus bare-lot regime (`foundingRegime`, V18); blueprint catalogue with `unmet`/`atInstanceLimit`/`neededNow`; placement and Set quotes with legality, cost, time, Opex onset, capacity, reasons; revision-bound commit intents; placement/facility/set identities; construction lifecycle and operational state; world bodies and `buildingId = placed-<placementId>`; normal-player first-film solvency evidence. Move/demolition/refund exist in core only.
**P11 consumes:** the quote verbatim; immediate capex/cash consequence; future Opex and effective week; capacity; exact identities; capital and Opex ledger rows.
**P11 must not duplicate:** placement legality; footprint/collision; construction clock; facility registration; move/demolition action; Set law; bare-lot tuning.

**Current evidence (observed 2026-09-06):** P09 core 9/9 technical KEEP at TS `fee206fa039fa96e29c98108c206f56df1b1bb4c` × Unity `8f30d0ef092feefdcd611875b1cd0b72d761b3f2` (EVIDENCE REPORTED); real-input Build 30/30 on the P09 sealed exe (EVIDENCE REPORTED); latest close-gates Build run `hid-20260906T120537Z` 38/39 on exe `f8f36ea7…` (ARTIFACT INSPECTED); solvency journey test asserts `facilityOpex` debits and exact ledger reconciliation (SOURCE OBSERVED).
**Required final check:** the summary selectors (`weeklyBurn` family) still omit facility Opex (STILL PRESENT); the solvency ledger journey is complete. Both facts must be re-verified at the accepted base.

## 5. P10 → P11

**P10 produces** (observed): stable `talentId` and public Profile/Roster; employment status, active contract (`annualSalary`, `weeklySalary`, `signingBonus`, `startWeek`, `endWeekExclusive`, `termWeeks`, `remainingWeeks`), `guaranteedRemaining`, `terminationCost`, renewal state and published renewal terms; availability and presence with `canLocate`; grouped attention; career rows with P07 result links and P08 history links; the contract quote family (`renewContract`, `releaseTalent`).
**P11 consumes:** exact person/contract route; current salary/payroll basis; remaining guarantee; legal current quote; work/availability context; no-current-location behavior.
**P11 must not duplicate:** person identity; hidden skills/ceilings/RNG; contract pricing or legality; hiring/renewal/release actions; career events; world presence.

**Current evidence (observed 2026-09-06):** P10 technical KEEP for authorized ready scope at the observed pair (EVIDENCE REPORTED); contract quote family at TS `7582d62…` (projection 19); real-input renewal 29 steps / 0 failures, bonus $37,375 quoted and debited, one `signingBonus` ledger row, revision 0 → 1, cancel state-neutral, Save/Load preserves term 104 (ARTIFACT INSPECTED, `evidence/P10-Contract-Journey/p10-hid-contract-report.json`, exe `6bd50de8…`, assembly equal to the candidate's).

## 6. Finance dependency records (observed 2026-09-06)

Each record: **Owner** · **Path/symbol/commit** · **Usable public fields** · **Quote/action owner** · **UI route** · **Inspected proof** · **Missing capability** · **Final-refresh requirement**.

### 6.1 P08 — Administration/History entrance and recording boundary
- Owner: P08. Path: `src/core/studioHistory.ts` (`migratedStudioHistory`, `historyRecordedAt`, `studioHistoryTimeline`), `bridge/history.ts::historyProjection` at TS `7b4d8ff…`; Unity `StudioFoundingCardHud.cs` (Administration card, `[OPEN STUDIO HISTORY]` element name), `StudioWorkspaceHost.OpenStudioHistory(tab, subjectId)` / `OpenFacilityHistory(buildingId)` / `CloseWorkspace` at `1d304f8…`.
- Public fields: `notRecordedNotice`, timeline rows (`eventId`, `week`, `kind`, `significance`, `subjectKind`, `subjectId`, `filmId`, `personId`, `buildingId`, `subjectLocation`), films (`productionId`, `historyRecorded`, `resultAvailable`, `historyEventIds`), people (`talentId`, credits).
- Quote/action owner: none (read-only). UI route: Administration card → History; Film Result detour peels back to History.
- Proof: P08 checkpoint sealed; HID run 3 43/44 (EVIDENCE REPORTED); oracle 8/8 on the final pair (EVIDENCE REPORTED).
- Missing: finance milestone rows; a Finance entrance on the card.
- Final refresh: confirm symbol names and the card's element registry; confirm `[OPEN FINANCE]` can be added without resizing regressions (`AdminOperationsHeightFor`).

### 6.2 P08 — facility/person event adapters
- Owner: P08 (adapters), P09/P10 (subjects). Path: `src/core/actions.ts::withFacilityHistoryRow` (commit/move/demolish), `src/core/tick.ts` (completion), `facilitySubject(placementId, facilityId)`; person rows via `bridge/history.ts` people credits and `bridge/people.ts` `p08HistoryLink`.
- Public fields: facility row `subjectId = facilityId`, `buildingId` when current; person `talentId`.
- UI route: placed building LOT SELECTION → STUDIO HISTORY ▸; Profile → History; History → Profile (`OpenProfileFromHistory`).
- Proof: `tests/bridge-p09a-r2-facility-history-rows.test.ts` (5) and oracle `p10-facility-history`, `p10-person-history` (EVIDENCE REPORTED).
- Missing: nothing P11 needs.
- Final refresh: confirm row kinds unchanged.

### 6.3 P08 — exact-ID navigation, Back context, retained workspace
- Owner: Unity host. Path: `StudioWorkspaceHost.cs` (`OpenProfile(talentId, origin)`, `OpenRoster`, `OpenStudioHistory`, `OpenReleaseResult`, `OpenBuild`, `CloseWorkspace` one-layer peel; `retainedProfileContext`, `profileReturnOrigin`), `StudioSelectionManager.cs`, `StudioLocateAction.cs`, `StudioCameraDirector.TryRestoreNavigationOrigin`.
- Public fields: n/a (presentation). UI route: mutually exclusive workspaces; Back restores origin World/Roster/History.
- Proof: EditMode host tests; real-input Roster/Locate/Back on an earlier product (ARTIFACT INSPECTED, run `hid-20260906T081123Z`); world-body direct click FAIL (harness).
- Missing: a `ProfileOrigin.Finance` (or equivalent) so Back from a Profile returns to Finance.
- Final refresh: confirm the origin enum and peel order.

### 6.4 P09 — placement and Set quotes, opaque commit intents, action ownership
- Owner: P09. Path: `bridge/placement.ts::placementDraftToEngine / placementQuoteSnapshot / PLACEMENT_REJECTION_COPY`, `bridge/setCommission.ts::setCommissionQuoteSnapshot`, `src/core/placement.ts::queryPlacement / commitPlacement`, `bridge/session.ts` (`pendingQuotes`, `quotedIntentFor`, `capPendingQuotes`, `/quote` + `/command`).
- Public fields: `intentId`, `kind: 'placeFacility'`, `commitLabel`, `ok`, `blueprintId`, `name`, `effectSummary`, `origin`, `footprint`, `parcelId`, `cells`, `cellLegality`, `cost`, `weeklyOperatingCost`, `buildWeeks`, `completesOnWeek`, `capability`, `capacityDelta`, `rejections`, `primaryReason`, `unmetRequirements`, `instanceCount`, `maxInstances`, `cashBefore`, `cashAfter`; Set: `cost`, `cashBefore/After`, intent `commissionSet`.
- Quote/action owner: P09 engine (`queryPlacement` re-asked at commit; D-12 affordability). UI route: Administration `[OPEN BUILD]` / HUD BUILD chip → parcel → catalogue → ghost preview → BUILD; Sets dock.
- Proof: `tests/bridge-p09a-w1-placement-quote.test.ts` R1–R7 full-grid sweep; real-input Build 30/30 on the P09 sealed exe; latest close-gates run 38/39 (ARTIFACT INSPECTED); one MINOR client ghost-legality divergence on a re-migrated fixture (EVIDENCE REPORTED).
- Missing: "runway after" and "operating cost after" are not on the quote (P11 composes them from the repaired selectors); no cancel command (none needed).
- Final refresh: confirm field names; confirm the MINOR divergence disposition.

### 6.5 P09 — construction debit and operating-cost onset; site/facility identity and completion
- Owner: P09 engine. Path: `commitPlacement` (ledger `constructionCapex`, `status: 'underConstruction'`), `completeDuePlacements` (→ `operational`), tick 7.6 `weeklyPlacementOperatingCost` (charge on the advance after completion), `expectedWeeklyOperatingCostAt(placement, ledger, week)`; wire `StudioPlacedFacilitySnapshot` (`id`, `blueprintId`, `facilityId`, `parcelId`, `status`, `placedWeek`, `completesWeek`, `weeksRemaining`, `progress01`, `weeklyOperatingCost`).
- UI route: `StudioLotGrowthPresentation` body status ("Operational since Week N" / "Under construction · opens Week N").
- Proof: oracle `p09-office-rising`, `p09-same-week-completion`, `p09-save-load-mid-construction` (EVIDENCE REPORTED). Onset boundary (SOURCE OBSERVED): tick step 1.6 completes due placements before step 7.6 charges the week being advanced from the pre-completion set, so the first `facilityOpex` row carries `week == completesWeek` and is written by the advance that leaves that week — which is what the P09 checkpoint calls "opex first charge on the completion week" and what `expectedWeeklyOperatingCostAt` (`completesWeek <= week`) reconstructs.
- Missing: a per-facility ledger correlation on the wire (ledger `facilityOpex` is one aggregated row per week; per-facility attribution derives from blueprints).
- Final refresh: confirm steps 1.6/7.6 ordering and the boundary sentence above against the accepted tick.
- Observed product changed paths (accepted base → `7b4d8ff…`): 35 files under `src/` and `bridge/` (new `bridge/contract.ts`, `history.ts`, `people.ts`, `placement.ts`, `setCommission.ts`, `src/core/studioHistory.ts`, `lot.ts`; changed `actions.ts`, `placement.ts`, `save.ts`, `tick.ts`, `types.ts`, `session.ts`, schema and generated consumer). `economyView.ts`, `fixedCostAllocation.ts`, `employment.ts`, `sets.ts` unchanged.

### 6.6 P09 — move, demolition, refund; bare-lot/endowed differences; solvency evidence
- Owner: P09. Path: `src/core/placement.ts::moveFacility / facilityMoveRefusal / demolishFacility / facilityDemolitionRefusal / facilityDemolitionRefund`, `actions.ts` `moveFacility` / `demolishFacility` (+ history rows); regime `foundingRegime` on state/save, `BARE_LOT_PROPERTY`, `legacyAnnexOffered`.
- Public fields: `canDemolish` (flag only); `property.regime`; catalogue `unmet`/`neededNow`.
- Quote/action owner: engine; **no wire route** ("P09-R4 … refused until then").
- Proof: core tests for rows (EVIDENCE REPORTED); solvency: `scripts/p09-solvency-preflight.mts` VERDICT SOLVENT and `tests/bridge-p09a-w5-bare-lot-first-film.test.ts` (SOURCE OBSERVED: asserts `facilityOpex` present and exact ledger reconciliation; EVIDENCE REPORTED: floor $8,864,638, release week 37).
- Missing: move/demolish/refund quote family and UI route (P09-R4 authorized ready work remaining).
- Final refresh: record whether P09-R4 landed; if so, add its quote fields to 6.4.

### 6.7 P10 — Profile, Roster, contract sheet, consequence displays, contract attention
- Owner: P10. Path: `bridge/people.ts::peopleProjection` (`BridgePersonProfileSnapshot`, `BridgePersonContractSnapshot`, `BridgeRosterSnapshot`, `BridgePeopleAttentionSnapshot`, `CONTRACT_HORIZONS_WEEKS {12, 26, 52}`), `docs/engineering/P10-INFORMATION-VISIBILITY-TABLE.md`; Unity `StudioProfileWorkspace.cs`, `StudioRosterWorkspace.cs`, `StudioPersonInspectorCard.cs`, `StudioPersonContractContracts.cs`.
- Public fields: identity/profession; perceived OVR and estimate band with wording; employment status; contract fields (§5); `guaranteedRemaining`; `terminationCost`; `renewalOpen`; `renewalLine`; `actions {renewAvailable, renewReason, renewalTerms[], releaseAvailable, releaseReason}`; presence `canLocate` + reason; attention tier/reason/cohort. Hidden never crosses (schema-negative tests, EVIDENCE REPORTED).
- UI route: People strip COMPANY header → Roster; world person → inspector card → Profile; Profile chrome REVIEW RENEWAL / REVIEW EARLY RELEASE → Root-level consequence band.
- Proof: oracle `p10-person-inspector` 22/22 × 4 viewports, `p10-contract-actions` (EVIDENCE REPORTED); real-input contract journey (ARTIFACT INSPECTED).
- Missing: Payroll-total and obligations-total aggregates (P11 composes from the profiles); a Finance origin for Back.
- Final refresh: confirm field names and the attention cohort vocabulary.

### 6.8 P10 — signing, renewal, release actions and bridge routes
- Owner: P10 route over accepted D-11 law. Path: `bridge/contract.ts::contractActionDecisions / contractDraftToEngine / contractQuoteSnapshot`, intent kinds **`renewContract`** and **`releaseTalent`** (`bridge/schema/bridge-schema.ts:1574`); hiring `signContract` via `bridge/casting.ts::signContractQuoteSnapshot`; core `applySignContract`, `applyRenewContract` (→ `signingBonus` row), `applyReleaseTalent` (→ `termination` row).
- Public fields (quote): `intentId`, `kind`, `commitLabel`, `ok`, `verb`, `talentId`, `talentName`, `currentEndWeekExclusive`, `currentRemainingWeeks`, `renewalOpen`, `termWeeks`, `termLabel`, `annualSalary`, `weeklySalary`, `signingBonus`, `newEndWeekExclusive`, `terminationCost`, `guaranteedRemaining`, `cost`, `refusal`, `refusalReason`, `refusalRemedy`, `cashBefore`, `cashAfter`, `affordable`, `consequence`.
- Refusal codes emitted: `noActiveContract`, `renewalWindowClosed`, `onScreenplayTask`, `insufficientFunds` (two declared codes unreachable — reviewer NOTE, EVIDENCE REPORTED).
- Proof: `tests/bridge-p10a-r1-contract-quote.test.ts` (8) (EVIDENCE REPORTED); real-input renewal (ARTIFACT INSPECTED).
- Missing: payroll delta / net weekly / runway after (P11 composes); release real-input proof (only renewal ran through real input).
- Final refresh: confirm identifiers; confirm whether the unreachable enum codes were trimmed.

### 6.9 P10 — person/history links, Back/Locate, location limitations
- Owner: P10 + Unity host. Path: `bridge/people.ts` presence (`canLocate`, `locateReason`), `StudioBridgePresentation.TryGetPersonTalentId`, `StudioLocateAction`, `OpenReleaseResultFromProfile` (Back peels to the exact Profile).
- Proof: Roster Locate/Back real input on an earlier product (ARTIFACT INSPECTED); latest run failed Locate/Back steps (harness focus per close-gates §2.2); world-body direct click FAIL (harness) with the doorstep-rule limitation documented.
- Missing: green real-input Locate/Back on the candidate's product bytes.
- Final refresh: record the accepted classification of these gates.

### 6.10 Cross-cutting — treasury and versions
- `StudioTreasurySnapshot {cash, weeklyBurn, weeklyPayroll, netWeeklyCash, runwayWeeks, runwayInfinite}` from `financeView`/`runway` — facility Opex omitted (STILL PRESENT). Versions: protocol 4, projection 19, save V18, schema `6a2c01fe…`; prior schema identities listed in `bridge/runtime-checkpoint.ts::SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` (the close-gates register reports nineteen; not recounted here). Compatibility boundary probe artifacts present in the candidate (`evidence/P10-Compat-Boundary/`, not parsed by this refresh).

## 7. Status matrix (observed)

| Producer seam | Planned | Source observed | Proof class | Owner accepted | P11 status |
|---|---|---|---|---|---|
| P08 history root/recording boundary | Yes | Yes (`7b4d8ff…`) | EVIDENCE REPORTED (sealed checkpoint; 8/8 re-envelopes) | No | Reuse; refresh after acceptance |
| P08 Administration/History workspace | Yes | Yes (`1d304f8…`) | EVIDENCE REPORTED (HID run 3; oracle) | No | Reuse entrance; add Finance card row |
| P09 bare-lot/endowed regime | Yes | Yes | EVIDENCE REPORTED | No | Reuse |
| P09 `quotePlacement` / `quoteSetCommission` | Yes | Yes | EVIDENCE REPORTED + ARTIFACT INSPECTED (Build run 38/39, earlier exe) | No | Reuse — critical consequence dependency |
| P09 facility Opex onset and exact body routes | Yes | Yes | Existing law accepted; new rows EVIDENCE REPORTED | Law yes; route no | Reuse law; refresh route |
| P09 move/demolish/refund on the wire | Ready ext. | **No** | — | No | MISSING (P09-R4) |
| P10 Profile/Roster | Yes | Yes | EVIDENCE REPORTED + ARTIFACT INSPECTED (earlier product) | No | Reuse |
| P10 contract quote/attention | Conditional | **Yes** (`renewContract`, `releaseTalent`) | ARTIFACT INSPECTED (renewal real input, candidate assembly) | No | Reuse |
| P07 result/run/film economics | Yes | Accepted | Accepted | Yes | Binding |

## 8. Cross-package identity contract (unchanged)

Film/result/run: exact production/result ID. Person/contract: `talentId` + quote identity. Facility/site: placement/project/facility/set ID (`buildingId = placed-<placementId>` is a presentation convention, reviewer NOTE). History: exact event ID + source IDs. Quote/intent: opaque `intentId` + expected revision.

## 9. Persistence and projection handoff (unchanged)

No copied records into a Finance root; nothing persisted by default; no raw unbounded ledger in every snapshot; bounded query for deep history; public player-safe fields only; monotonic attested projection/schema.

## 10. Final refresh placeholders

```text
FINAL_P08_P10_TS_SHA               (observed, not final: 7b4d8ffebeb0b7978763780420fdc8542df68b5f)
FINAL_P08_P10_UNITY_SHA            (observed, not final: 1d304f89a29ffca160129b705d7d627543adfb4d)
FINAL_P08_HISTORY_SEAM             (observed: bridge/history.ts::historyProjection)
FINAL_P09_PLACEMENT_QUOTE_SEAM     (observed: bridge/placement.ts::placementQuoteSnapshot)
FINAL_P09_SET_QUOTE_SEAM           (observed: bridge/setCommission.ts::setCommissionQuoteSnapshot)
FINAL_P09_FACILITY_OPEX_SEAM       (observed: src/core/placement.ts::weeklyPlacementOperatingCost; tick 7.6)
FINAL_P09_WORLD_ROUTE              (observed: StudioLotGrowthPresentation + buildingId placed-<id>)
FINAL_P10_PERSON_PROFILE_SEAM      (observed: bridge/people.ts::peopleProjection; StudioWorkspaceHost.OpenProfile)
FINAL_P10_CONTRACT_QUOTE_SEAM      (observed: bridge/contract.ts; intents renewContract / releaseTalent)
FINAL_P10_ATTENTION_SEAM           (observed: bridge/people.ts attention cohorts)
FINAL_P08_P10_SCHEMA_ID            (observed, not final: sha256:6a2c01fe…)
FINAL_P08_P10_PROTOCOL_VERSION     (observed, not final: 4)
FINAL_P08_P10_PROJECTION_VERSION   (observed, not final: 19)
FINAL_P08_P10_SAVE_VERSION         (observed, not final: V18)
FINAL_P08_P10_OWNER_ACCEPTANCE     (PENDING)
```

## 11. Consumer handoff from P11 (unchanged)

A later accepted P11 may provide exact current cash and recurring pace, typed obligations, action consequence envelopes, bounded finance history/period facts, film/facility/person financial links, and explicit provenance/missing-history status. P12+ may consume these facts; they may not create money, infer private forecasts or reinterpret Contribution as total profit.

FINAL ACCEPTED-BASE CHANGED-PATH REFRESH REQUIRED BEFORE ANY P11 IMPLEMENTATION ORDER
