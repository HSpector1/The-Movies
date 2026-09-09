# P11A Decision and Requirement Register

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
**Observed P08–P10 WIP snapshot (this revision):** TS product `7b4d8ffebeb0b7978763780420fdc8542df68b5f` (docs tip `a2baa1d9b3ffb2666732dba55823e09cc76c7352`) × Unity `1d304f89a29ffca160129b705d7d627543adfb4d` · 4 / 19 / V18 · schema `sha256:6a2c01feaf02c931a8c41bbf2090f8af003b89a492d77135d7aab2b42a8d3dc9` · inspected 2026-09-06 · OWNER ACCEPTANCE PENDING · UNSEALED
**Final accepted P08–P10 base:** PENDING
**Original P11 research:** `codex/finance-executive-ux-research-11@d6c38546d19fbb23533af496e0f62b9c340b7ce5`
**Revision 02 (immutable):** `90b349a8272f17ad7ea541cdddc777d36c1d861d` · **Hub:** `P11A-READINESS-AND-DEPENDENCY-GATE.md`


## 0. Revision log

| Revision | Change |
|---|---|
| 02 | Full 45-row register; decision docket with safe defaults |
| 03 | Added the "Producer status (observed 2026-09-06)" column so REUSED versus NEW work is visible per requirement; no ID, source, disposition or count changed; docket §4.B gained the recommended defaults for time basis, Upcoming public data, terminology, persistence, selected extension scope, the cancel rule, and the treasury-understatement finding; §4.D updated to the observed owners; §4.E gained the per-week receipt disclosure decision |

## 1. Purpose

This register accounts for the full original P11 plan without replacing the two design documents. It distinguishes the P11A core from ready extensions, conditional ideas, future dependencies, Owner gates and active prohibitions, and now records which requirements the observed P08–P10 stack already fulfils.

## 2. Coverage summary (unchanged)

| Disposition | Count |
|---|---:|
| Implement in core, including active safeguards | 29 |
| Implement as ready extension | 5 |
| Conditional | 3 |
| Deferred to named future work | 1 |
| Dependency-blocked | 2 |
| Owner-blocked | 3 |
| Originally rejected — active safeguard | 2 |
| **Total** | **45** |
| **Unmapped** | **0** |

A rejected feature remains an active prohibition; a deferred feature remains part of the plan.

## 3. Full requirement register

Column 7, "Producer status (observed 2026-09-06)", classifies what the observed pair already supplies: **REUSED** = P11 consumes it, no new authority; **NEW** = P11 must build it; **unchanged** = nothing observed alters the Revision 02 row. Evidence class is SOURCE OBSERVED unless marked EVIDENCE REPORTED.

| ID | Requirement | Exact source | Present disposition | Dependency / activation | Proof | Producer status (observed 2026-09-06) |
|---|---|---|---|---|---|---|
| `P11-REQ-001` | Finance remains an explainable operating system, not a spreadsheet minigame | Product design `§1` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final truthful selectors | Owner answers Am I okay? Why? What moved? | core; producers supply no finance summary — NEW |
| `P11-REQ-002` | Preserve lot heartbeat → Administration → exact Finance detail | Product design `§1, §28` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final Administration/workspace owners | World route, Back and retained context | Administration card + `StudioWorkspaceHost` route/Back grammar — REUSED entrance; Finance card row NEW |
| `P11-REQ-003` | Cash is literal and distinct from obligations | Product design `§1 law 1, §8` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Current cash authority | Wording and migration tests | `treasury.cash` on the wire — REUSED |
| `P11-REQ-004` | Theatrical Gross is distinct from Studio Revenue | Product design `§1 law 3, §6, §20` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Accepted P07 | Projection/presentation tests | P07 result fields — REUSED |
| `P11-REQ-005` | Film Contribution is distinct from Net Profit; accepted P07 result labels are not silently rewritten | Product design `§1 law 4, §§20–21, §37` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5`; local recon terminology ruling | **IMPLEMENT IN CORE** | Accepted P07/ledger | Finance copy guards plus P07 regression guard | P07 `contribution`/`resultLabel` — REUSED; Finance restatement NEW |
| `P11-REQ-006` | Complete recurring-cost projection includes facility Opex without retuning | Product design `§1 truth prerequisite, §5.3, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final P09 facility truth | Selector↔tick↔ledger reconciliation | `weeklyPlacementOperatingCost` + tick 7.6 exist; `weeklyBurn` omits it — **STILL PRESENT**, W0 NEW |
| `P11-REQ-007` | Publish complete Weekly operating cost | Product design `§6, §9` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | REQ-006 | Recurring-cost fixtures | no complete selector — NEW (W0) |
| `P11-REQ-008` | Publish signed Net weekly cashflow on named next-week basis | Product design `§7, §9` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Complete recurring cost + active runs | Positive/negative/steady fixtures | `treasury.netWeeklyCash` exists but understated — NEW after W0 |
| `P11-REQ-009` | Publish honest conditional current-pacing Runway | Product design `§10` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | REQ-006–008 | Finite/positive/in-red/unavailable states | `treasury.runwayWeeks/runwayInfinite` exists but understated — NEW after W0 |
| `P11-REQ-010` | Build compact Administration finance inspector | Product design `§28` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final P08/P09 Administration route | Unity visual/HID | Administration card exists (`StudioFoundingCardHud.cs`) — REUSED host; `[OPEN FINANCE]` NEW |
| `P11-REQ-011` | Build retained Finance workspace | Product design `§29; Builder Annex D` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final workspace host | Focus/Back/resize proof | no Finance workspace; `StudioWorkspaceHost` retained-context grammar — REUSED host; workspace NEW |
| `P11-REQ-012` | Reconcile opening Cash + signed movements = closing Cash | Product design `§11` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Ledger/checkpoint | Exact arithmetic invariants | `periodSummary`, ledger, `CashLedgerCheckpoint` — REUSED; reconciliation view NEW |
| `P11-REQ-013` | Break deep-detail Other Cash into typed rows | Product design `§5.3, §11` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Ledger vocabulary | Signing/freelance/termination completeness | ledger kinds typed incl. `signingBonus`, `termination`, `freelancerFee`, `publicity` — REUSED |
| `P11-REQ-014` | Expose Payroll as active-contract recurring truth | Product design `§12` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final P10 contracts | Person links and tick parity | `weeklyPayroll`; person contract snapshot `weeklySalary` — REUSED |
| `P11-REQ-015` | Expose Studio Operations separately from payroll and capital | Product design `§6, §9, §15` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Ordinary overhead + facility Opex | Category reconciliation | `weeklyOverhead` + per-facility `weeklyOperatingCost` on the wire — REUSED components; view NEW |
| `P11-REQ-016` | Expose guarantees/obligations without subtracting from Cash | Product design `§8, §14` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final P10 contract truth | Obligation/cash separation | `guaranteedRemaining` per person on the wire — REUSED; compact aggregate NEW |
| `P11-REQ-017` | Expose one film’s direct commitment, receipts and Contribution | Product design `§17–21` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Accepted P07 film/run/ledger | Exact-ID and tense tests | P07 result fields; `committedCost`; ledger by `productionId` — REUSED |
| `P11-REQ-018` | Centralize Film Economics read model; renderers do not recompute | Product design `§5.2–5.3, §§20–21` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | P07 accepted seams | Cross-surface parity | no central Film Economics read model — NEW |
| `P11-REQ-019` | Use one TypeScript-authored financial consequence language | Product design `§1 law 6, §24` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final quote/action owners | Review/cancel/stale/commit proof | P09/P10 quote snapshots share the shape (intentId, cost, cashBefore/After, consequence) — REUSED shape; Finance envelope NEW |
| `P11-REQ-020` | Prove consequence contract first with construction | Product design `§1 checkpoint, §16, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final P09 quotePlacement | Immediate cash + later Opex + capacity | `placementQuoteSnapshot` (cost, Opex, `completesOnWeek`, capacity, cash after) — REUSED |
| `P11-REQ-021` | Revision-bind previews and refuse stale/duplicate commits | Product design `§16.3, §24.3, §35.3` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final bridge/session law | Stale and duplicate tests | digest-bound intents, `pendingQuotes` cleared on command/load, revision guard, `STALE_REVISION`/`INTENT_NOT_AVAILABLE` — REUSED |
| `P11-REQ-022` | Affordability is legality; prudence remains player judgment | Product design `§25` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Owning action law | No advice classifier | `canAfford` (D-12) re-asked at commit — REUSED |
| `P11-REQ-023` | Preserve recoverable negative Cash; do not invent bankruptcy | Product design `§32` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Accepted economy law | In-red journey | no bankruptcy law; `releaseTalent` may take cash negative — REUSED law |
| `P11-REQ-024` | Group finance attention; routine weekly loss is not spam | Product design `§27` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final attention service | Dedup/no-pause/no-camera | P10 grouped attention tiers (`info/attention/decision/blocking`) — REUSED pattern; finance attention NEW and bounded |
| `P11-REQ-025` | Preserve exact person/facility/film/history navigation | Product design `§11.3, §28.4` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | P08–P10 IDs/routes | Same-name/title/no-location | `OpenProfile/OpenRoster/OpenStudioHistory/OpenFacilityHistory/OpenReleaseResult`, `canLocate` — REUSED |
| `P11-REQ-026` | Old saves disclose recording boundary; no reconstructed transactions | Product design `§31, §35` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Checkpoint/ledger/P08 provenance | Legacy fixture | `CashLedgerCheckpoint`; P08 `notRecordedNotice` — REUSED |
| `P11-REQ-027` | Support multi-film and multi-run isolation by exact production ID | Product design `§22, §34` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | P07 IDs | Reorder/concurrency proof | P07 `productionId` identity — REUSED |
| `P11-REQ-028` | Accessible, responsive, non-color-only finance presentation | Product design `§29; Builder Annex` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final Unity UI framework | Keyboard/controller/200% text | Unity UI Toolkit workspaces with responsive proofs at 4 viewports (EVIDENCE REPORTED) — REUSED framework |
| `P11-REQ-029` | Add known-flow Upcoming from scheduled facts only | Product design `§23, §29.3, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT AS READY EXTENSION** | Final P08/P09/P10 dated facts | No speculative-hit rows | ALLOWED rows: facility `completesWeek`/Opex, contract end/renewal weeks, aggregate next-week and remaining projected Studio Revenue; per-week receipts BLOCKED pending disclosure decision |
| `P11-REQ-030` | Add 13/52-week cash/cost charts with text equivalents | Product design `§30, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT AS READY EXTENSION** | Complete recorded history/query performance | Chart/table parity | ledger complete after boundary; bounded query NEW |
| `P11-REQ-031` | Add year/era summaries for 120-year history | Product design `§31, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT AS READY EXTENSION** | Measured history basis | Long-save size/query proof | ledger only (P08 folds routine history at 52 weeks) — measurement NEW |
| `P11-REQ-032` | Extend consequence preview to hire, renew, release and Greenlight | Product design `§24, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT AS READY EXTENSION** | Final P10/P04/P07 quote owners | Per-action stale/refusal proof | renew/release producers EXIST (`bridge/contract.ts`, real-input proven); hire via `signContract` quote; Greenlight via casting intents — REUSED producers |
| `P11-REQ-033` | Build fuller portfolio filters and film/run deep links | Product design `§22, §29.3, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT AS READY EXTENSION** | P07/P08 histories | N-film performance/identity | P07 results + P08 film rows + `OpenReleaseResult` — REUSED |
| `P11-REQ-034` | Preserve historic negative/marketing split only if frozen | Product design `§17.3, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **CONDITIONAL** | New future capture fact | No reconstruction; save decision if adopted | no frozen split producer — unchanged |
| `P11-REQ-035` | Offer allocated studio operating cost only as a labeled managerial lens | Product design `§19, §21.3, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **CONDITIONAL** | Complete fixed-cost basis + Current Ops/Owner activation | Never canonical profit | `ledgerFixedCostByWeek` omits facility Opex — unchanged, CONDITIONAL |
| `P11-REQ-036` | Create semantic financial risk/attention only with TS-authored thresholds | Product design `§26–27, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **CONDITIONAL** | Separate product decision | Reason/threshold proof | no TS thresholds — unchanged |
| `P11-REQ-037` | Plan ledger compaction/checkpoints without losing reconciliation | Product design `§31, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **DEFERRED TO NAMED PACKAGE** | Measured storage pressure; future P11 history/compaction package | Reconciliation and migration proof | P08 measured growth (EVIDENCE REPORTED) — unchanged |
| `P11-REQ-038` | Add era/revenue-channel finance only when producing systems exist | Product design `§36, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **DEPENDENCY-BLOCKED** | P13/P16/P18 | Typed channel integration | no producer — unchanged |
| `P11-REQ-039` | Add facility utilization/productivity economics only with authority | Product design `§15.2, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **DEPENDENCY-BLOCKED** | Future P09 utilization law | No presentation-only efficiency | no utilization law — unchanged |
| `P11-REQ-040` | Canonical all-in film profitability requires Owner ruling | Product design `§21, §38 Owner decisions` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **OWNER-BLOCKED** | Complete allocation law | Cross-film allocation invariants | Owner ruling absent — unchanged |
| `P11-REQ-041` | Loans/investors/external financing require separate Owner gate | Product design `§33, §38 Owner decisions` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **OWNER-BLOCKED** | Future financing package | No fake disabled tabs | Owner ruling absent — unchanged |
| `P11-REQ-042` | Bankruptcy/failure or structured recovery requires separate Owner gate | Product design `§32, §38 Owner decisions` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **OWNER-BLOCKED** | P15 corporate fate / future finance law | No implicit terminal state | Owner ruling absent — unchanged |
| `P11-REQ-043` | Do not retune the economy in P11 | Product design `Header, §2, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **ORIGINALLY REJECTED — ACTIVE SAFEGUARD** | None | Diff and tuning audit | safeguard; P09 envelope is provisional WIP tuning, not P11 scope — unchanged |
| `P11-REQ-044` | Do not calculate finance, risk or action legality in Unity | Product design `§1; Builder boundary` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE — ACTIVE SAFEGUARD** | Generated contract | Mutation and consumer tests | client renders quotes verbatim; no client pricing (reviewer-verified, EVIDENCE REPORTED) — REUSED discipline |
| `P11-REQ-045` | Do not display Available Cash, reserves or investment-quality advice | Product design `§8, §25, §37` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **ORIGINALLY REJECTED — ACTIVE SAFEGUARD** | None | Schema/copy lint | safeguard — unchanged |

## 4. Decision docket

### A. Genuine Owner decisions required before P11A

**None**, provided Current Ops adopts the defaults in §4.B. P11A does not require the Owner to decide bankruptcy, loans, canonical profit allocation, economy tuning, or the per-week receipt disclosure (deferred to §4.E).

### B. Recommendations Current Ops should adopt or reject before issuing P11A

| Decision | Recommendation | Consequence if rejected |
|---|---|---|
| First consequence proof | Keep construction first; reuse `bridge/placement.ts` `placementQuoteSnapshot` + digest-bound `placeFacility` intent | Name another already-authoritative family; no parallel construction law |
| P11 save bump | None by default | Any new persisted finance fact needs a separately justified root/migration |
| Core versus extensions | Seal core, preserve candidate, then activated extensions; independent extensions not blocked by later ones | If core-only, record each extension deferred-not-dropped |
| P07 wording | Preserve the P07 result surface; Finance uses Film Contribution with explicit basis | Harmonization becomes a targeted P07 regression scope |
| Finance history | Derive from ledger/checkpoint; link to P08 rows; no second ledger | A new root must prove existing authority insufficient |
| **Financial time basis (new)** | Adopt the four classes in financial truth §4.0: recorded past (ledger range), current recurring (the next advance's charge), next-period effects (named week, "from the following advance" where the tick law charges one advance later), conditional estimate ("at current pace") | Every headline number must still state its own basis explicitly |
| **Terminology (new)** | "Weekly operating cost" for the complete recurring figure; wire field `weeklyBurn` retained until an additive complete-basis field ships; Studio Revenue ≠ Theatrical Gross; Film Contribution ≠ profit; "Runway at current pace" | Copy lint must encode whichever terms are adopted |
| **Upcoming public data (new)** | ALLOWED rows only (facility completion + Opex onset; contract end/renewal weeks; aggregate next-week and remaining projected Studio Revenue with remaining week count; Set completion); per-week future receipt rows BLOCKED pending §4.E | Block the extension entirely, or take the disclosure decision first |
| **Cancel rule (new)** | Cancel = no committed domain action, no debit/site/employment change/obligation; a read-only quote may already exist; proof checks revision, cash, ledger length, state, save bytes — not the absence of quote traffic | Proof that rejects ordinary preview traffic is refused at hostile review |
| **Persistence (new, confirming)** | No new Finance root; observed additive roots (`studioHistory`, `foundingRegime`) are producers | — |
| **Selected extension scope (new)** | Core → Upcoming (ALLOWED rows) → renew/release/hire previews (producers exist) → portfolio → charts → era summaries, each independently gated | Record deviations as deferred-not-dropped |
| P09 facility-Opex defect | STILL PRESENT; require complete-basis proof at the final refresh and before P11 publishes operating cost/runway | Affected P11 rows blocked |
| **Treasury understatement on the P08–P10 candidate (new finding for Current Ops)** | The observed Administration card renders "Weekly burn / Net weekly / Runway" from `StudioTreasurySnapshot`, which omits facility Opex on lots with operational placed facilities. Recommend Current Ops decide whether this is corrected inside the P08–P10 cycle (own authorized scope + independent verification) or carried as a documented limitation until P11 W0 | If neither, the accepted candidate ships an understated displayed pace on bare-lot saves |
| Builder follow-up | Separate post-stack decision; `P09-REQ-039` DEPENDENCY-BLOCKED (close-gates §5 correction); absent cost is `not modeled` | P11 must not invent Builder payroll |

"No new Owner decision needed under these recommended defaults" holds only if Current Ops adopts the defaults above explicitly.

### C. Routine engineering choices for the implementation lead after authorization

Unchanged: module/type names; query endpoint versus paged projection; index/cache structure; component decomposition; chart library within dependency law; candidate directory names; fixture names; exact projection bump (observed next: 20) if monotonic and attested. None may change finance meaning, persistence, package scope or Owner law.

### D. Local/private-source checks still needed (observed owners named; final verification pending)

- final Unity branch equality and changed paths against the accepted base (observed product tip `57f9ef8…`, tools-only after);
- `StudioWorkspaceHost` focus/Back owners, `StudioFoundingCardHud` Administration card sizing (`AdminOperationsHeightFor`), large-text and screenshot capture mechanics;
- generated consumer path `Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs` and the CF-09 attestation script;
- `bridge/placement.ts`, `bridge/setCommission.ts`, `bridge/contract.ts`, `bridge/people.ts` symbol stability;
- real-input harnesses (`Tools/p09-run-hid-build.sh`, `Tools/p10-run-hid-contract.sh`, `Tools/p10-run-hid-people.sh`) and their exe/assembly/engine binding;
- Owner profile-copy location and compatibility (`scripts/p10-owner-profile-copy.mts`, original never opened);
- candidate manifests: fill the empty `evidence/P09-Build-Journey/` and `evidence/P10-People-Journey/` folders or record where that evidence is preserved.

### E. Later decisions that do not block P11A

1. Canonical all-in film profit / overhead allocation.
2. External financing, loans, investors or other capital instruments.
3. Bankruptcy, failure, receivership or structured recovery.
4. Semantic financial-health/risk classifier.
5. Whether the historic production/marketing split is worth new persistence.
6. Real-Builder workforce, capacity and speed law.
7. **Whether per-week future theatrical receipts of an active run become player-public information** (blocks only the per-week Upcoming row).
8. Whether move/demolish/refund routes (P09-R4) reach the wire before or after P11 (affects only the facility consequence previews beyond construction).

## 5. Original real-Builder obligation

`P09-REQ-039` remains DEPENDENCY-BLOCKED; the close-gates register §5 retracted an earlier "satisfied" sentence. Current evidence does not authorize a Builder profession, payroll, speed multiplier or capacity pool. P11 displays only costs the accepted simulation actually produces.

## 6. Activation law

Unchanged: a requirement enters implementation only when its disposition allows it, all producer facts are accepted and exact, no Owner gate remains, Current Ops includes it in the ceiling, its proof stays feasible, and it does not duplicate another package's authority. Rows marked REUSED still require the final refresh to confirm the symbol survived acceptance.

FINAL ACCEPTED-BASE CHANGED-PATH REFRESH REQUIRED BEFORE ANY P11 IMPLEMENTATION ORDER
