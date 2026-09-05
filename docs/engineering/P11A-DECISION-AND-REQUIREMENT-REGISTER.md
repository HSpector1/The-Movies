# P11A Decision and Requirement Register


**Status:** PROVISIONAL — ACTIVE P08–P10 DEPENDENCIES
**Review state:** READY FOR CURRENT OPS PM REVIEW — LOCAL RECON INCORPORATED
**Implementation:** NOT AUTHORIZED FOR IMPLEMENTATION
**Accepted TypeScript base:** `2753e18ba8fb5f65b936c22cde9531646fecc6cd`
**Accepted Unity base:** `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6`
**Starting protocol / projection / save:** `4 / 15 / V16`
**Starting schema:** `sha256:ddce1c399ac4ff58327b296a0600428ac3f3346b84f3639e66e48e53a65fbe99`
**Original P11 research:** `codex/finance-executive-ux-research-11@d6c38546d19fbb23533af496e0f62b9c340b7ce5`
**Active stack:** `OPS-P08P10-20260905-01`; all active work is **UNSEALED FORWARD EVIDENCE**


## 1. Purpose

This register accounts for the full original P11 plan without replacing the two design documents. It distinguishes the P11A core from ready extensions, conditional ideas, future dependencies, Owner gates and active prohibitions.

## 2. Coverage summary

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

A rejected feature remains an active prohibition; it is not an irrelevant row. A deferred feature remains part of the plan; it is not silently dropped.

## 3. Full requirement register

| ID | Requirement | Exact source | Present disposition | Dependency / activation | Proof |
|---|---|---|---|---|---|
| `P11-REQ-001` | Finance remains an explainable operating system, not a spreadsheet minigame | Product design `§1` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final truthful selectors | Owner answers Am I okay? Why? What moved? |
| `P11-REQ-002` | Preserve lot heartbeat → Administration → exact Finance detail | Product design `§1, §28` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final Administration/workspace owners | World route, Back and retained context |
| `P11-REQ-003` | Cash is literal and distinct from obligations | Product design `§1 law 1, §8` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Current cash authority | Wording and migration tests |
| `P11-REQ-004` | Theatrical Gross is distinct from Studio Revenue | Product design `§1 law 3, §6, §20` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Accepted P07 | Projection/presentation tests |
| `P11-REQ-005` | Film Contribution is distinct from Net Profit; accepted P07 result labels are not silently rewritten | Product design `§1 law 4, §§20–21, §37` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5`; local recon terminology ruling | **IMPLEMENT IN CORE** | Accepted P07/ledger | Finance copy guards plus P07 regression guard |
| `P11-REQ-006` | Complete recurring-cost projection includes facility Opex without retuning | Product design `§1 truth prerequisite, §5.3, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final P09 facility truth | Selector↔tick↔ledger reconciliation |
| `P11-REQ-007` | Publish complete Weekly operating cost | Product design `§6, §9` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | REQ-006 | Recurring-cost fixtures |
| `P11-REQ-008` | Publish signed Net weekly cashflow on named next-week basis | Product design `§7, §9` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Complete recurring cost + active runs | Positive/negative/steady fixtures |
| `P11-REQ-009` | Publish honest conditional current-pacing Runway | Product design `§10` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | REQ-006–008 | Finite/positive/in-red/unavailable states |
| `P11-REQ-010` | Build compact Administration finance inspector | Product design `§28` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final P08/P09 Administration route | Unity visual/HID |
| `P11-REQ-011` | Build retained Finance workspace | Product design `§29; Builder Annex D` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final workspace host | Focus/Back/resize proof |
| `P11-REQ-012` | Reconcile opening Cash + signed movements = closing Cash | Product design `§11` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Ledger/checkpoint | Exact arithmetic invariants |
| `P11-REQ-013` | Break deep-detail Other Cash into typed rows | Product design `§5.3, §11` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Ledger vocabulary | Signing/freelance/termination completeness |
| `P11-REQ-014` | Expose Payroll as active-contract recurring truth | Product design `§12` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final P10 contracts | Person links and tick parity |
| `P11-REQ-015` | Expose Studio Operations separately from payroll and capital | Product design `§6, §9, §15` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Ordinary overhead + facility Opex | Category reconciliation |
| `P11-REQ-016` | Expose guarantees/obligations without subtracting from Cash | Product design `§8, §14` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final P10 contract truth | Obligation/cash separation |
| `P11-REQ-017` | Expose one film’s direct commitment, receipts and Contribution | Product design `§17–21` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Accepted P07 film/run/ledger | Exact-ID and tense tests |
| `P11-REQ-018` | Centralize Film Economics read model; renderers do not recompute | Product design `§5.2–5.3, §§20–21` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | P07 accepted seams | Cross-surface parity |
| `P11-REQ-019` | Use one TypeScript-authored financial consequence language | Product design `§1 law 6, §24` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final quote/action owners | Review/cancel/stale/commit proof |
| `P11-REQ-020` | Prove consequence contract first with construction | Product design `§1 checkpoint, §16, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final P09 quotePlacement | Immediate cash + later Opex + capacity |
| `P11-REQ-021` | Revision-bind previews and refuse stale/duplicate commits | Product design `§16.3, §24.3, §35.3` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final bridge/session law | Stale and duplicate tests |
| `P11-REQ-022` | Affordability is legality; prudence remains player judgment | Product design `§25` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Owning action law | No advice classifier |
| `P11-REQ-023` | Preserve recoverable negative Cash; do not invent bankruptcy | Product design `§32` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Accepted economy law | In-red journey |
| `P11-REQ-024` | Group finance attention; routine weekly loss is not spam | Product design `§27` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final attention service | Dedup/no-pause/no-camera |
| `P11-REQ-025` | Preserve exact person/facility/film/history navigation | Product design `§11.3, §28.4` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | P08–P10 IDs/routes | Same-name/title/no-location |
| `P11-REQ-026` | Old saves disclose recording boundary; no reconstructed transactions | Product design `§31, §35` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Checkpoint/ledger/P08 provenance | Legacy fixture |
| `P11-REQ-027` | Support multi-film and multi-run isolation by exact production ID | Product design `§22, §34` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | P07 IDs | Reorder/concurrency proof |
| `P11-REQ-028` | Accessible, responsive, non-color-only finance presentation | Product design `§29; Builder Annex` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE** | Final Unity UI framework | Keyboard/controller/200% text |
| `P11-REQ-029` | Add known-flow Upcoming from scheduled facts only | Product design `§23, §29.3, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT AS READY EXTENSION** | Final P08/P09/P10 dated facts | No speculative-hit rows |
| `P11-REQ-030` | Add 13/52-week cash/cost charts with text equivalents | Product design `§30, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT AS READY EXTENSION** | Complete recorded history/query performance | Chart/table parity |
| `P11-REQ-031` | Add year/era summaries for 120-year history | Product design `§31, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT AS READY EXTENSION** | Measured history basis | Long-save size/query proof |
| `P11-REQ-032` | Extend consequence preview to hire, renew, release and Greenlight | Product design `§24, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT AS READY EXTENSION** | Final P10/P04/P07 quote owners | Per-action stale/refusal proof |
| `P11-REQ-033` | Build fuller portfolio filters and film/run deep links | Product design `§22, §29.3, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT AS READY EXTENSION** | P07/P08 histories | N-film performance/identity |
| `P11-REQ-034` | Preserve historic negative/marketing split only if frozen | Product design `§17.3, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **CONDITIONAL** | New future capture fact | No reconstruction; save decision if adopted |
| `P11-REQ-035` | Offer allocated studio operating cost only as a labeled managerial lens | Product design `§19, §21.3, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **CONDITIONAL** | Complete fixed-cost basis + Current Ops/Owner activation | Never canonical profit |
| `P11-REQ-036` | Create semantic financial risk/attention only with TS-authored thresholds | Product design `§26–27, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **CONDITIONAL** | Separate product decision | Reason/threshold proof |
| `P11-REQ-037` | Plan ledger compaction/checkpoints without losing reconciliation | Product design `§31, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **DEFERRED TO NAMED PACKAGE** | Measured storage pressure; future P11 history/compaction package | Reconciliation and migration proof |
| `P11-REQ-038` | Add era/revenue-channel finance only when producing systems exist | Product design `§36, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **DEPENDENCY-BLOCKED** | P13/P16/P18 | Typed channel integration |
| `P11-REQ-039` | Add facility utilization/productivity economics only with authority | Product design `§15.2, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **DEPENDENCY-BLOCKED** | Future P09 utilization law | No presentation-only efficiency |
| `P11-REQ-040` | Canonical all-in film profitability requires Owner ruling | Product design `§21, §38 Owner decisions` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **OWNER-BLOCKED** | Complete allocation law | Cross-film allocation invariants |
| `P11-REQ-041` | Loans/investors/external financing require separate Owner gate | Product design `§33, §38 Owner decisions` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **OWNER-BLOCKED** | Future financing package | No fake disabled tabs |
| `P11-REQ-042` | Bankruptcy/failure or structured recovery requires separate Owner gate | Product design `§32, §38 Owner decisions` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **OWNER-BLOCKED** | P15 corporate fate / future finance law | No implicit terminal state |
| `P11-REQ-043` | Do not retune the economy in P11 | Product design `Header, §2, §38` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **ORIGINALLY REJECTED — ACTIVE SAFEGUARD** | None | Diff and tuning audit |
| `P11-REQ-044` | Do not calculate finance, risk or action legality in Unity | Product design `§1; Builder boundary` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **IMPLEMENT IN CORE — ACTIVE SAFEGUARD** | Generated contract | Mutation and consumer tests |
| `P11-REQ-045` | Do not display Available Cash, reserves or investment-quality advice | Product design `§8, §25, §37` @ `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | **ORIGINALLY REJECTED — ACTIVE SAFEGUARD** | None | Schema/copy lint |

## 4. Decision docket

### A. Genuine Owner decisions required before P11A

**None**, provided Current Ops adopts the safe defaults below. P11A does not require the Owner to decide bankruptcy, loans, canonical profit allocation, or new economy tuning.

### B. Recommendations Current Ops should adopt or reject before issuing P11A

| Decision | Recommendation | Consequence if rejected |
|---|---|---|
| First consequence proof | Keep construction as the first proof and reuse final P09 `quotePlacement`/commit authority | Current Ops must name another already-authoritative action family; do not create parallel construction law |
| P11 save bump | Default to no P11 simulation save bump | Any new persisted finance fact requires a separately justified root/migration |
| Core versus extensions | Seal P11A core, preserve candidate, then continue through activated ready extensions | If Current Ops wants core-only, record every extension as deferred-not-dropped |
| P07 wording | Preserve accepted P07 result surface; use explicit Film Contribution basis in Finance | A terminology harmonization becomes a targeted P07 regression scope, not silent cleanup |
| Finance history | Derive from ledger/checkpoint and link to P08 history; no second finance event ledger | If a new history root is proposed, prove why existing authority is insufficient |
| P09 facility-Opex defect | No current P08 interruption; require complete-basis proof at P09 solvency/final refresh and again before P11 operating cost/runway | Affected KEEP claim cannot stand on incomplete recurring truth |
| Builder follow-up | Keep real Builder as separate post-stack product/implementation decision; absent cost is `not modeled`, not zero | P11 must not invent Builder payroll or productivity |

### C. Routine engineering choices for the implementation lead after authorization

- exact module/type names;
- whether bounded ledger drill-down is a query endpoint or a closed paged projection;
- index/cache structure;
- component decomposition and stylesheet organization;
- chart library versus native drawing, within dependency law;
- exact candidate directory names;
- test fixture names;
- exact projection bump, if monotonic and attested.

These choices may not change finance meaning, persistence, package scope or Owner law.

### D. Local/private-source checks the coding agent must perform

- final private Unity branch equality and changed paths;
- final Administration/WorkspaceHost/focus/Back owners;
- final generated C# consumer and attestation path;
- final P09 quote and P10 contract/profile APIs;
- actual screenshot/HID infrastructure;
- actual Owner profile-copy location and compatibility;
- final active-stack proof/candidate manifests.

### E. Later Owner decisions that do not block P11A

1. Canonical all-in film profit / overhead allocation.
2. External financing, loans, investors or other capital instruments.
3. Bankruptcy, failure, receivership or structured recovery.
4. Semantic financial-health/risk classifier.
5. Whether historic production/marketing split is worth new persistence.
6. Real-Builder workforce, capacity and speed law.

## 5. Original real-Builder obligation

P09-REQ-039 remains preserved. Current evidence does not authorize a Builder profession, payroll, speed multiplier or capacity pool. P11 displays only costs that the accepted simulation actually produces. If Builders become contracted people later, common P10/P11 payroll and obligation views should absorb them without a Builder-specific finance subsystem.

## 6. Activation law

A requirement may enter implementation only when:

- its disposition allows it;
- all producer facts are accepted and exact;
- no unresolved Owner gate remains;
- Current Ops includes it in the implementation ceiling;
- the proof named here remains feasible;
- it does not force P11 to duplicate another package's authority.

POST-P08–P10 OWNER-ACCEPTED CHANGED-PATH REFRESH REQUIRED
