# P11A Readiness and Dependency Gate


**Status:** PROVISIONAL — ACTIVE P08–P10 DEPENDENCIES
**Review state:** READY FOR CURRENT OPS PM REVIEW — LOCAL RECON INCORPORATED
**Implementation:** NOT AUTHORIZED FOR IMPLEMENTATION
**Accepted TypeScript base:** `2753e18ba8fb5f65b936c22cde9531646fecc6cd`
**Accepted Unity base:** `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6`
**Starting protocol / projection / save:** `4 / 15 / V16`
**Starting schema:** `sha256:ddce1c399ac4ff58327b296a0600428ac3f3346b84f3639e66e48e53a65fbe99`
**Original P11 research:** `codex/finance-executive-ux-research-11@d6c38546d19fbb23533af496e0f62b9c340b7ce5`
**Active stack:** `OPS-P08P10-20260905-01`; all active work is **UNSEALED FORWARD EVIDENCE**


## 1. Executive verdict

**P11A — Executive Finance Spine V1 remains the recommended next implementation checkpoint after the P08–P10 stack is technically sealed and Owner-accepted.** The recommendation is confirmed, not broadened into a general accounting package.

P11A should answer four ordinary player questions:

1. How much cash does the studio have now?
2. What is the studio currently gaining or losing each week under known commitments?
3. Why did cash change during the last recorded period?
4. What will this specific construction or contract decision do immediately and when its recurring consequence begins?

P11A is not ready to code today because its producer stack is active. Planning is ready for Current Ops PM review now; implementation remains blocked until the final P08–P10 accepted identities and changed seams are known.

## 2. Authority chain

| Authority | Exact identity | Classification | P11 use |
|---|---|---|---|
| Accepted P06/P07 closeout | TS `2753e18ba8fb5f65b936c22cde9531646fecc6cd`; Unity `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6` | OWNER ACCEPTED — KEEP — CLOSED | Binding accepted product base |
| P07 factual handoff | `docs/engineering/P07-TO-P08-FINAL-AUTHORITY-HANDOFF.md` at accepted TS base | Accepted producer contract | Film/result/revenue terminology and exact IDs |
| Original P11 design | `codex/finance-executive-ux-research-11@d6c38546d19fbb23533af496e0f62b9c340b7ce5` | Decision-ready product/design authority; code map stale | Preserve terminology, scope, exclusions and player journey |
| Published P08–P10 planning | `docs/p08-p10-autonomous-stack-launch-01@72ca8e797e5185a5dec13ac4c4311e391b8e96e3` | Current Ops-reviewed planning authority | Dependency and migration expectations |
| Current Ops order | `OPS-P08P10-20260905-01` | Active execution authority for P08–P10 only | Defines producer stack and campaign freeze |
| Coding-agent local recon snapshot | TS `908879a9c5fa73d2015985834e951db84c69ab8a`; Unity `685f113e480ee18ea242ad8a341e7710523f840f`; validated 2026-09-05T08:25:39Z | UNSEALED FORWARD EVIDENCE | P08 Wave 2 committed; P09/P10 not begun; never final P11 base |

## 2.1 Local reconnaissance reconciliation

The local/private-source audit resolved the access gaps without changing implementation:

- accepted TS/Unity refs, contract versions and generated DTO identity were verified;
- P08 WIP had reached Save V17 / Projection 16 at the snapshot;
- the P08 history root is sparse historical interpretation, not a complete accounting ledger;
- P09 and P10 production work had not begun;
- accepted Unity has reusable Administration, WorkspaceHost, result, navigation and DTO ownership, but no accepted Finance workspace or general retained Profile/Roster;
- P11 core appears derivable from existing state and ledger, so no second finance persistence root is currently justified.

The WIP snapshot is evidence for dependency planning only. Final P11 activation still requires the accepted P08–P10 closeout.

## 3. Gate status

| Gate | Current status | What must be true before implementation |
|---|---|---|
| P11 product design exists | **PASS** | Original two P11 documents remain binding |
| P06/P07 accepted base | **PASS** | Use exact accepted pair above |
| P08–P10 planning published | **PASS** | Published docs branch and Current Ops order are recorded |
| P08–P10 implementation | **ACTIVE / UNSEALED** | Core and approved ready extensions reach technical KEEP |
| P08–P10 Owner acceptance | **BLOCKING** | Howard accepts the combined P08–P10 candidate or Current Ops names the accepted rollback boundary |
| Final TS/Unity identities | **BLOCKING** | Full accepted SHAs, product/build distinctions and remote equality recorded |
| Final save/schema/projection/protocol | **BLOCKING** | Exact final values replace placeholders; no guessed bump |
| Final changed paths and owner seams | **BLOCKING** | Changed-path-only refresh against accepted stack |
| Facility Opex recurring selector truth | **STILL PRESENT AT ACCEPTED P07 BASE** | Final stack must be checked; P11 cannot publish complete operating cost/runway until fixed or explicitly blocked |
| P09 construction quote/commit seam | **PLANNED; NOT FINAL** | Reuse final P09 authority; do not create a Finance-owned placement system |
| P10 person/contract routes | **PLANNED; NOT FINAL** | Reuse accepted Profile/Roster/contract owners and exact person IDs |
| Private Unity source preflight | **REQUIRED LATER** | Resolve actual final workspace host, Administration route, DTO cache, focus/back and generated consumer |
| Current Ops implementation order | **NOT ISSUED** | A separate Current Ops authorization must replace the draft banner and fill every placeholder |

## 4. Facility-Opex watch condition: P09 solvency

At accepted P07 source `2753e18ba8fb5f65b936c22cde9531646fecc6cd`:

- `src/core/tick.ts` step 7.6 debits `weeklyPlacementOperatingCost(state.placement)` and appends a `facilityOpex` ledger row for every operational placed facility.
- `src/core/economyView.ts::financeTotals()` and `periodSummary()` correctly include `facilityOpex` in the overhead reporting bucket.
- `weeklyBurn()`, `runway()`, `financeView()`, `commitmentPreview()`, `prospectiveCycleFixedCost()`, and `postSigningRunway()` begin from payroll plus ordinary overhead and omit operational facility Opex.
- `src/core/fixedCostAllocation.ts::ledgerFixedCostByWeek()` also includes only `payroll` and `overhead`, not `facilityOpex`.

**Classification: STILL PRESENT at the accepted P07 base and at the coding-agent recon snapshot.** This is a read-model/accounting projection defect, not a tuning defect. It can understate P09's weekly cost, runway, and cycle feasibility if the active stack later uses those selectors for the mandatory bare-lot solvency proof.

At the recon snapshot, P09 production implementation and its solvency proof had not begun. **NO CURRENT OPS ESCALATION was required.** Preserve this as a mandatory P09 entry/final-solvency guard and a P11 W0 prerequisite. Do not interrupt independent P08 work merely to restate it.

## 5. Recommended P11A core checkpoint

The core technical checkpoint remains:

> Lot cash pulse → select Administration without rail priming → read Cash, complete current Weekly operating cost, signed Net weekly cashflow, and conditional current-pacing Runway → open retained Finance → reconcile one complete recorded period → inspect Payroll, Studio Operations, current obligations and one exact Film Economics record → review one P09-owned construction consequence with immediate capex and later Opex separated → cancel byte-neutrally or commit through the owning system → return to the same Finance and lot context → save/load/reconnect.

### Core includes

- literal Cash;
- complete recurring-cost components;
- signed next-week/current-commitments cashflow;
- conditional current-pacing Runway;
- exact period reconciliation;
- typed cash movement categories;
- Payroll and compact obligations;
- Studio Operations and exact facility links;
- one selected Film Economics view using accepted P07 result truth;
- a shared TypeScript consequence envelope proven first through final P09 construction authority;
- old-save coverage disclosures;
- exact film/person/facility routes;
- retained Administration/Finance world context;
- accessibility and real-input proof.

### Core excludes

- economy retuning;
- loans, investors, taxes or new financial instruments;
- bankruptcy or forced recovery;
- predictive future hits;
- full accounting P&L;
- universal all-in film profit;
- UI-authored financial risk;
- P12 rivals;
- P13+ revenue channels;
- a second construction, contract or history authority.

## 6. Ready-extension ladder

Core is a floor, not the whole P11 vision. After P11A technical KEEP, Current Ops may allow the implementation lead to continue through extensions whose producer facts are final and whose proof stays green.

| Rank | Extension | Activation gate | Player value |
|---|---|---|---|
| 1 | Known-flow Upcoming | P08/P09/P10 publish exact dated facts; no speculative rows | Shows receipts, completions, renewal windows and expiries in one truthful list |
| 2 | Consequence previews for hire, renew, release and Greenlight | Final P10/P04/P07 action owners expose revision-bound quotes | One finance language across major decisions |
| 3 | Full portfolio filters and deep links | P07/P08 film history and final P10 links are stable | Understand capital tied up across several pictures |
| 4 | 13/52-week cash and cost charts with text equivalents | Complete recorded history, bounded query performance | See trend and named causes without spreadsheet overload |
| 5 | Year/era summaries | Measured 120-year history/storage path | Long-run executive memory |

Conditional items such as historic negative/marketing split capture, managerial fixed-cost allocation, and semantic financial-risk labels require separate activation and must not be smuggled into P11A.

## 7. Active-stack dependency classification

| Dependency | Planned | Observed on WIP | Technically proven | Owner accepted | Current classification |
|---|---:|---:|---:|---:|---|
| P08 additive Studio History + Standing receipts | Yes | Yes at recon snapshot TS `908879a9…` × Unity `685f113e…`; Save V17 / Projection 16 | Wave 2 committed; package not sealed | No | UNSEALED FORWARD EVIDENCE; final refresh required |
| P08 Administration/History world route | Yes | Dirty actively owned Unity Wave 3 snapshot only | Not verified by recon | No | Final route and proof remain required |
| P09 bare-lot/endowed regimes | Yes | Preflight design only | No | No | Planned |
| P09 quotePlacement/quoteSet and commit revalidation | Yes | Preflight design only | No | No | Planned; critical P11 dependency |
| P09 operational Opex onset and facility links | Existing engine + planned presentation | Existing accepted engine law; new route pending | Existing law proven before stack; new stack not sealed | Existing law accepted; new route no | Reuse accepted law, refresh final paths |
| P10 public Profile/Roster and exact person routes | Yes | Preflight design only | No | No | Planned |
| P10 contract quote/attention extensions | Conditional in stack | Not observed | No | No | Final scope unknown |

## 8. Original real-Builder follow-up

P09's original real-Builder obligation remains unresolved under `P09-REQ-039`. Decorative site workers are not a real Builder workforce. The current stack does not authorize a new Builder speed formula, capacity law, profession taxonomy or payroll rule merely to claim complete Founding Flip.

P11 treatment:

- If P09/P10 later create a real contracted Builder, P11 naturally includes that person's actual payroll and obligation through the common contract selectors.
- If no real Builder exists, P11 must not invent Builder payroll, hidden labor cost, construction productivity or staffing rows, and must not represent the absent authority as zero. Use `not modeled` or omit the line.
- The Builder question does not block P11A's finance spine; it blocks any claim that P11 presents a complete Builder-cost model or that P09's entire original vision is complete.
- Current Ops should treat the real-Builder system as a separate post-stack product/implementation decision, not as a P11 side effect.

## 8.1 Binding local-recon corrections

- Preserve accepted P07 `Profit` / `Loss` / `Break-even` labels on the P07 result surface. P11 Finance may use Film Contribution with explicit scope and exclusions; silent P07 relabeling is not P11A work.
- P08 Studio History may supply context, significance and recording coverage, but the signed ledger/checkpoint remains the Finance reconciliation authority.
- P11 composes around final P09 quote/intent/receipt and final P10 public Profile/Roster/attention routes; it owns neither domain action.
- Current evidence does not justify a second Finance persistence root.
- Builder economics are absent authority, not zero-cost authority.

## 9. Final changed-path refresh required

After P08–P10 Owner acceptance, Current Ops must require one changed-path-only refresh that records:

1. `FINAL_P08_P10_TS_SHA` and product/docs/build distinctions.
2. `FINAL_P08_P10_UNITY_SHA` and exact generated-consumer identity.
3. `FINAL_P08_P10_SCHEMA_ID`, protocol, projection and save.
4. Exact P08 history/Administration symbols, persistence and retention.
5. Exact P09 placement/set quote, commit, facility, Opex-onset, move/demolition and world-body symbols.
6. Exact P10 person, contract, obligation, Profile/Roster and attention symbols.
7. Exact accepted changed paths and collision owners.
8. Whether the facility-Opex recurring-selector gap remains, is fixed, or is partly fixed.
9. Whether P09's normal-player solvency proof used complete recurring costs.
10. Final TypeScript, bridge, Unity, visual, HID and Owner proof floors.
11. Private Unity source mapping for Administration/Finance workspace, focus, Back, large text and actual screenshot capture.
12. Final requirement dispositions and any extensions already supplied by P08–P10.

## 10. Visible placeholders

```text
FINAL_P08_P10_TS_SHA
FINAL_P08_P10_UNITY_SHA
FINAL_P08_P10_TS_PRODUCT_SHA
FINAL_P08_P10_UNITY_PRODUCT_SHA
FINAL_P08_P10_SCHEMA_ID
FINAL_P08_P10_PROTOCOL_VERSION
FINAL_P08_P10_PROJECTION_VERSION
FINAL_P08_P10_SAVE_VERSION
FINAL_P08_HISTORY_SEAM
FINAL_P09_PLACEMENT_QUOTE_SEAM
FINAL_P09_FACILITY_OPEX_SEAM
FINAL_P10_PERSON_CONTRACT_SEAM
FINAL_P08_P10_CHANGED_PATHS
FINAL_P08_P10_TEST_FLOOR
FINAL_P08_P10_OWNER_ACCEPTANCE
CURRENT_OPS_P11_AUTHORIZATION_ID
```

## 11. Readiness ruling

**Planning:** READY FOR CURRENT OPS REVIEW.
**Implementation:** BLOCKED BY ACTIVE P08–P10 STACK, FINAL REFRESH AND CURRENT OPS AUTHORIZATION.
**Owner decisions before P11A:** NONE under the safe defaults in the decision register.
**Production code changed by this package:** NONE.

POST-P08–P10 OWNER-ACCEPTED CHANGED-PATH REFRESH REQUIRED
