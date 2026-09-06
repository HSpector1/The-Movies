# P11A Readiness and Dependency Gate


**Status:** PROVISIONAL — OBSERVED P08–P10 STACK REFRESH (REVISION 03)
**Review state:** READY FOR CURRENT OPS DOCUMENT REVIEW
**Refresh state:** PROVISIONAL OBSERVED-STACK REFRESH COMPLETE · FINAL ACCEPTED-BASE REFRESH PENDING
**Implementation:** P11 IMPLEMENTATION NOT AUTHORIZED
**Accepted P07 baseline:** TS `2753e18ba8fb5f65b936c22cde9531646fecc6cd` · Unity `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6` · protocol 4 / projection 15 / save V16 · schema `sha256:ddce1c399ac4ff58327b296a0600428ac3f3346b84f3639e66e48e53a65fbe99`
**Observed P08–P10 WIP snapshot (this revision):** TS product `7b4d8ffebeb0b7978763780420fdc8542df68b5f` (branch docs tip `a2baa1d9b3ffb2666732dba55823e09cc76c7352`) × Unity `1d304f89a29ffca160129b705d7d627543adfb4d` · protocol 4 / projection 19 / save V18 · schema `sha256:6a2c01feaf02c931a8c41bbf2090f8af003b89a492d77135d7aab2b42a8d3dc9` · inspected 2026-09-06 20:16Z–20:30Z · **TECHNICAL KEEP FOR AUTHORIZED READY SCOPE — OWNER ACCEPTANCE PENDING — UNSEALED**
**Final accepted P08–P10 base:** PENDING
**Original P11 research:** `codex/finance-executive-ux-research-11@d6c38546d19fbb23533af496e0f62b9c340b7ce5`
**Revision 02 (immutable):** `docs/p11a-launch-package-01@90b349a8272f17ad7ea541cdddc777d36c1d861d`
**Package hub:** this document. Companion documents: `P11A-FINANCIAL-TRUTH-AND-CODE-RECONNAISSANCE.md`, `P11A-PROVISIONAL-IMPLEMENTATION-CHARTER.md`, `P11A-DECISION-AND-REQUIREMENT-REGISTER.md`, `P08-P10-TO-P11-HANDOFF-CONTRACT.md`, `DRAFT-P11A-IMPLEMENTATION-PROMPT.md`


## 0. Revision log

| Revision | Commit | Snapshot basis | Change |
|---|---|---|---|
| 01 | superseded on this branch | accepted P07 base only | Initial package |
| 02 | `90b349a8272f17ad7ea541cdddc777d36c1d861d` | coding-agent local recon, TS `908879a9c5fa73d2015985834e951db84c69ab8a` × Unity `685f113e480ee18ea242ad8a341e7710523f840f`, validated 2026-09-05T08:25:39Z | Incorporated local recon: P08 Wave 2 committed; P09/P10 not begun |
| 03 | `7c96a7a3b482790a06ae84518430e7405ed0627a` (+ this drift note) | observed P08–P10 WIP pair above, inspected 2026-09-06 | Replaced the "P09/P10 not begun" current state with dated, commit-bound observations; froze one compatible TS/Unity pair; reclassified facility Opex (STILL PRESENT); recorded reused versus missing producer interfaces; corrected the cancel and Upcoming rules; added the audit → P11 entry gate (§11) and the final-refresh checklist (§12) |

Revision 02 remains readable at its immutable commit. Its snapshot facts are preserved below as historical evidence, never rewritten.

## 1. Executive verdict

**P11A — Executive Finance Spine V1 remains the recommended next implementation checkpoint after the P08–P10 stack is Owner-accepted.** The recommendation is confirmed, not broadened.

P11A answers four ordinary player questions:

1. How much cash does the studio have now?
2. What is the studio currently gaining or losing each week under known commitments?
3. Why did cash change during the last recorded period?
4. What will this specific construction or contract decision do immediately and when its recurring consequence begins?

Compared with Revision 02, the producer stack has moved from "P08 Wave 2 committed, P09/P10 not begun" to a combined P08–P10 candidate that its own campaign record calls **TECHNICAL KEEP FOR AUTHORIZED READY SCOPE — OWNER ACCEPTANCE PENDING** (`docs/campaigns/P08-P10-CLOSE-GATES-DISPOSITIONS.md` §0.1 at TS `a2baa1d9…`). A KEEP headline is not Owner acceptance and does not waive an incomplete gate. This revision treats it as an **observed** stack: what Finance can reuse is now concrete, what is missing is now exact, and P11 implementation remains blocked until §11 is satisfied.

## 2. Authority chain

| Authority | Exact identity | Classification | P11 use |
|---|---|---|---|
| Accepted P06/P07 closeout | TS `2753e18ba8fb5f65b936c22cde9531646fecc6cd`; Unity `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6` | OWNER ACCEPTED — KEEP — CLOSED | Binding accepted product base |
| P07 factual handoff | `docs/engineering/P07-TO-P08-FINAL-AUTHORITY-HANDOFF.md` at the accepted TS base | Accepted producer contract | Film/result/revenue terminology and exact IDs |
| Original P11 design | `codex/finance-executive-ux-research-11@d6c38546d19fbb23533af496e0f62b9c340b7ce5` (`docs/design/CODEX-FINANCE-EXECUTIVE-UX-PACKAGE-11.md`, `…-BUILDER-ANNEX.md`) | Decision-ready product/design authority; its August code map is stale | Preserve terminology, scope, exclusions, IDs and player journey |
| Published P08–P10 planning | `docs/p08-p10-autonomous-stack-launch-01@72ca8e797e5185a5dec13ac4c4311e391b8e96e3` | Current Ops-reviewed planning authority | Dependency and migration expectations |
| Current Ops execution order | `OPS-P08P10-20260905-01` (`docs/operations/OPS-P08P10-20260905-01-EXECUTION-ORDER.md`, delta `…-CURRENT-OPS-DELTA.md` on the TS WIP) | Active execution authority for P08–P10 only; "Do not begin P11" | Defines producer stack, campaign freeze, §5.4 Builder law |
| Current Ops close-gates order | `OPS-P08P10-CLOSE-GATES-01` (recorded in `docs/campaigns/P08-P10-CLOSE-GATES-DISPOSITIONS.md`) | Active correction order; rejected the earlier "combined candidate READY" claim | Gate table, HID classification, requirement dispositions |
| Revision 02 recon snapshot (historical) | TS `908879a9c5fa73d2015985834e951db84c69ab8a` × Unity `685f113e480ee18ea242ad8a341e7710523f840f`, 2026-09-05T08:25:39Z | HISTORICAL EVIDENCE | P08 Wave 2 only; superseded by §2.2 |
| **Observed P08–P10 WIP snapshot (this revision)** | TS product `7b4d8ffebeb0b7978763780420fdc8542df68b5f` (docs tip `a2baa1d9b3ffb2666732dba55823e09cc76c7352`) × Unity `1d304f89a29ffca160129b705d7d627543adfb4d` | UNSEALED FORWARD EVIDENCE; OWNER ACCEPTANCE PENDING | Producer map, reuse map, missing capabilities; never the final P11 base |
| Preserved combined candidate | `~/Desktop/P08-P10-Combined-Candidate-7b4d8ff-1d304f8/` (player exe `1358fd1f…`, engine `189326b6…`) | Preserved runnable candidate; evidence partially present (§2.2) | Owner playtest target; evidence identity for the audit |
| Final accepted P08–P10 base | **PENDING** | — | The only base P11 may be refreshed against for implementation |

### 2.1 Historical snapshot — Revision 02 local reconnaissance (2026-09-05T08:25:39Z)

Preserved as evidence, not current state: at TS `908879a9…` × Unity `685f113e…` P08 Wave 2 had committed Save V17 / Projection 16; P09 and P10 production had not begun; accepted Unity had reusable Administration, WorkspaceHost, result and navigation owners but no Finance workspace or general Profile/Roster; the facility-Opex omission was STILL PRESENT; no second finance persistence root was justified. Every one of those findings that is still true is restated in §2.2 with the new snapshot; none is carried forward by assumption.

### 2.2 Observed compatible source pair — frozen for this revision

**Why this pair.** The TS WIP tip `a2baa1d9…` and the Unity WIP tip `1d304f89…` are the latest committed tips on 2026-09-06 and they are contract-compatible with each other: both carry projection 19, schema `sha256:6a2c01fe…`, and the byte-identical generated consumer (git blob `4c0a743412040c9ac5a32afd4adee6b85ced50e1` at `generated/unity/StudioBridgeDtos.Generated.cs` in TS and at `Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs` in Unity; manifest sha256 `7eeb17016241ea6f6db1f74aa413304da12835abe059052c5b3943b5f5ff3765`). On the TS side every commit after `475be99b4d445a9fd75a045724240d0b4c541f85` is documentation-only (`git diff --stat 475be99 a2baa1d` touches only `docs/campaigns/`), so the **product** identity is `7b4d8ff…` and the engine bundle built from it is `189326b6fbd769bc9650d0ed43b92c9ba75c78565958f3074f4d5645605d065e`. On the Unity side every commit after `57f9ef857a5955a604a56c1526733f2302efabc8` touches only `Tools/` (real-input driver), so the **product** identity is `57f9ef8…` and the candidate rebuilt at `1d304f8…` carries the same `Assembly-CSharp` sha256 `c21c42a6a3b2d8b33e0b10cddc6d48fc3e56afd0fec41084b8e9675ad0e21e64` as the exe on which the real-input contract journey ran.

| Identity | Observed value | Class |
|---|---|---|
| TS branch tip | `wip/p08-p10-autonomous-stack-01-ts@a2baa1d9b3ffb2666732dba55823e09cc76c7352` (2026-09-06T15:48:46Z) | SOURCE OBSERVED |
| TS product tip | `7b4d8ffebeb0b7978763780420fdc8542df68b5f`; identical game code to `475be99b…` and to `0a641f584ac6dc4c8a812145582a4f97344a8595` (no `src/`, `bridge/`, `generated/`, `ui/src` diff) | SOURCE OBSERVED |
| Unity branch tip = candidate build source | `wip/p08-p10-autonomous-stack-01-client@1d304f89a29ffca160129b705d7d627543adfb4d` (2026-09-06T15:11:26Z) | SOURCE OBSERVED |
| Unity product tip | `57f9ef857a5955a604a56c1526733f2302efabc8` (later commits: `Tools/p10-proof-contract.mjs` only) | SOURCE OBSERVED |
| Protocol / projection / save | 4 / 19 / V18 (`bridge/schema/bridge-schema.ts` `PROTOCOL_VERSION = 4`, `PROJECTION_VERSION = 19`; `src/core/save.ts` `makeSave` → `SaveFileV18`) | SOURCE OBSERVED |
| Schema id | `sha256:6a2c01feaf02c931a8c41bbf2090f8af003b89a492d77135d7aab2b42a8d3dc9` (`$id urn:project-studio:bridge:protocol-4:projection-19`) | SOURCE OBSERVED |
| Generated consumer | blob `4c0a7434…` in both repositories; contract manifest `generated/unity/project-studio-bridge.contract-manifest.json` (blob `1f302ee7…`) | ARTIFACT INSPECTED (byte identity by git blob id) |
| Engine bundle | `189326b6…` (`~/Desktop/P08-P10-Combined-Candidate-7b4d8ff-1d304f8/engine/engine.mjs`, sha256 recomputed 2026-09-06) | ARTIFACT INSPECTED/VERIFIED |
| Player | exe `1358fd1f3f26a3b0384dca4ce28fd0243f9e5b9bd9069263203735ad682dbbd7`, `Assembly-CSharp` `c21c42a6…`, built 2026-09-06T15:38:22Z from Unity `1d304f8` dirty=false (`player/build-manifest.json`) | ARTIFACT INSPECTED |
| Real-input contract exe | `6bd50de87080eb03559db3c74b9614497bf6313d3c41bd6a161aaabb2cfb13db` from Unity `57f9ef8`, TS `0a641f5`; `Assembly-CSharp` `c21c42a6…` == candidate | ARTIFACT INSPECTED/VERIFIED (assembly equality) |
| Reported floors at the pair | TS 373 files / 5004 passed / 5 skipped; Unity EditMode 882/882; CF-09 projection-19 seal PASS; oracle sweep 45/46 | EVIDENCE REPORTED (not re-run by this refresh) |
| Owner acceptance | **PENDING** | OWNER ACCEPTED: NO |

**Limitations of the frozen pair.**

- It is an observed WIP pair, not an accepted base. Nothing here waives the incomplete gates in §11.
- The preserved candidate's `evidence/P09-Build-Journey/` and `evidence/P10-People-Journey/` folders are **empty**; the real-input Build and People runs the close-gates register cites live under the active Unity worktree's `Evidence/P09-Journey-CloseGates/` and `Evidence/P10-Journey-CloseGates/` and were captured on earlier exes (see §3 and the handoff contract §7).
- This refresh ran no tests, no build, no Unity, no bridge and no gameplay. Every floor and journey figure is EVIDENCE REPORTED unless marked ARTIFACT INSPECTED.
- The Owner's durable profile (`d949003e…`) was not opened; "original untouched" claims are EVIDENCE REPORTED.
- The compatible pair may move again before acceptance. This document does not poll the branches further; the final refresh (§12) re-freezes against the accepted identities.
- **Post-freeze drift, observed once at 2026-09-06T20:41Z while verifying that no other refs had moved:** TS WIP tip advanced to `1ff018c25805e23ba1aa87618d3418afb4719603` (20:33Z, docs: "two-repairs … final pair identities, sweep 46/46 — checkpoint before the real-input runs") and Unity WIP tip advanced to `f760d5d17db7dba12346781e2181be6502b1c688` (20:24Z, tools) over `c71ffff8…` (20:22Z, **product**: "fix(selection): occlusion follows what is drawn — no footprint exemption; placed bodies occlude"). The frozen pair above therefore documents the last committed candidate identities at inspection time, not the branch tips; the named precondition on the world-body direct-click gate (close-gates §0.1 finding 1) appears to be in progress. Nothing in this revision was re-derived against those later commits.

## 3. Gate status

| Gate | Revision 02 status | Observed status (2026-09-06, pair §2.2) | What must be true before P11 implementation |
|---|---|---|---|
| P11 product design exists | PASS | **PASS** | The two original P11 documents remain binding |
| P06/P07 accepted base | PASS | **PASS** | Use the exact accepted pair |
| P08–P10 planning published | PASS | **PASS** | Published branch and both Current Ops orders recorded |
| P08 core | Wave 2 committed | **TECHNICAL KEEP (sealed checkpoint)** at TS `8a23cb3b…` × Unity `64dab80e…`; retained on the final pair (8/8 oracle re-envelopes) — EVIDENCE REPORTED | Owner acceptance |
| P09 core | Not begun | **9/9 TECHNICAL KEEP** at TS `fee206fa…` × Unity `8f30d0ef…`; P09 regression 11/12 on the projection-19 re-envelopes (the one failure recorded MINOR as a client ghost-legality artifact) — EVIDENCE REPORTED | Owner acceptance; the MINOR ghost-legality item dispositioned |
| P10 core + authorized ready scope | Not begun | **TECHNICAL KEEP FOR AUTHORIZED READY SCOPE** (person route, Profile, Roster, contract quote family, career/history links, facility history) — EVIDENCE REPORTED; independent cross-stack reviewer verdict recorded in close-gates §0.1 | Owner acceptance |
| Mandatory real-player-input gates | n/a | **INCOMPLETE.** Contract renewal via real input: PASS, 29 steps, 0 failures, exe `6bd50de8…` (ARTIFACT INSPECTED). P09 Build chain: reported PASS; the latest inspected run `hid-20260906T120537Z` reports status `failed`, 1 failing step of 39 (post-Load world re-select), on exe `f8f36ea7…` from Unity `3a737d7…`, whose Build-path product files are unchanged to `57f9ef8` (diff touches only `StudioProfileWorkspace.cs` and the oracle runner). Roster/Locate/Back: reported PASS on run `hid-20260906T081123Z` (Unity `9d2427c…`, 9 product files changed since); the latest run `hid-20260906T125930Z` failed Locate/Back steps (harness focus, per close-gates §2.2). World-body DIRECT click → inspector card: **FAIL (harness/environment)**, product proof down-qualified by the reviewer. | Every mandatory real-input gate green **on the candidate's product bytes**, or Current Ops accepts the recorded classification explicitly |
| P08–P10 Owner acceptance | BLOCKING | **BLOCKING — PENDING** | Howard accepts the combined candidate, or Current Ops names the accepted rollback boundary |
| Final TS/Unity identities | BLOCKING | **BLOCKING — observed values in §2.2 are not final** | Full accepted SHAs, product/build distinctions, remote equality recorded |
| Final save/schema/projection/protocol | BLOCKING | **BLOCKING — observed 4 / 19 / V18 / `6a2c01fe…`** | Final values replace placeholders after acceptance |
| Final changed paths and owner seams | BLOCKING | **OBSERVED** (handoff contract §6); final refresh required | Changed-path-only refresh against the accepted stack |
| Facility Opex recurring selector truth | STILL PRESENT at P07 base | **STILL PRESENT** at `7b4d8ff…` — `src/core/economyView.ts` and `src/core/fixedCostAllocation.ts` are byte-identical to the accepted base; the wire `StudioTreasurySnapshot.weeklyBurn / netWeeklyCash / runwayWeeks` and the Administration card inherit the omission (financial truth §3) | P11 W0 repair authorized and verified, or the affected rows explicitly blocked |
| P09 construction quote/commit seam | PLANNED | **SOURCE OBSERVED — REUSABLE**: `bridge/placement.ts` `placementQuoteSnapshot` (cost, `weeklyOperatingCost`, `buildWeeks`, `completesOnWeek`, `cashBefore/After`, capacity, rejections) + digest-bound `placeFacility` intent; `bridge/setCommission.ts` for Sets | Refresh symbols against the accepted base |
| P10 person/contract routes | PLANNED | **SOURCE OBSERVED — REUSABLE**: `bridge/people.ts` profiles/roster/attention; `bridge/contract.ts` `renewContract` / `releaseTalent` quote family (projection 19); Unity `StudioProfileWorkspace`, `StudioRosterWorkspace`, `StudioWorkspaceHost.OpenProfile/OpenRoster` | Refresh symbols against the accepted base |
| P08 Administration/History route | Dirty Wave 3 only | **SOURCE OBSERVED — REUSABLE**: Administration card `[OPEN STUDIO HISTORY]` / `[OPEN BUILD]` (`StudioFoundingCardHud.cs`), `StudioWorkspaceHost.OpenStudioHistory / OpenFacilityHistory`, `bridge/history.ts` | Refresh symbols against the accepted base |
| Private Unity source preflight | REQUIRED LATER | **PARTIALLY OBSERVED** (owners named in the handoff contract §6); focus/Back/large-text/screenshot capture mechanics not re-verified | Final private preflight on the accepted base |
| Current Ops P11 implementation order | NOT ISSUED | **NOT ISSUED** | A separate Current Ops authorization replaces the draft banner and fills every placeholder |

## 4. Facility-Opex watch condition

**Classification at the observed snapshot: STILL PRESENT** (details and the proposed W0 repair in `P11A-FINANCIAL-TRUTH-AND-CODE-RECONNAISSANCE.md` §3).

- The authoritative tick still charges operational facility Opex at step 7.6 (`src/core/tick.ts` ~line 1008) and writes a `facilityOpex` ledger row.
- `weeklyBurn()` (`src/core/economyView.ts:60`) is still payroll + ordinary overhead; `runway()`, `financeView()`, `commitmentPreview()`, `prospectiveCycleFixedCost()`, `postSigningRunway()` and `ledgerFixedCostByWeek()` still inherit it. Neither file changed between the accepted base and `7b4d8ff…`.
- **New in this revision:** the omission now reaches the player. `StudioTreasurySnapshot` (`bridge/schema/bridge-schema.ts` ~line 780) carries `weeklyBurn`, `netWeeklyCash`, `runwayWeeks`; the post-founding Administration card renders "Weekly burn", "Net weekly" and "Runway" from it (`StudioFoundingCardHud.cs` ~lines 1083–1093). On a bare-lot save with operational placed facilities those three figures understate the actual recurring charge by the facility Opex the tick debits.
- **P09 solvency evidence is not invalidated.** The bare-lot first-film journey (`tests/bridge-p09a-w5-bare-lot-first-film.test.ts`) advances the real engine, asserts a `facilityOpex` ledger kind is present, and asserts final cash equals `INITIAL_CASH` plus every signed ledger row; the §15A preflight (`scripts/p09-solvency-preflight.mts`) models capex at commit and Opex from completion explicitly. That is a complete measured cash-ledger journey; the incomplete summary selector does not touch it.
- **No Current Ops escalation to the running stack is issued here.** The reach to the Administration card is recorded as a material audit finding for Current Ops (register §4.B) and as the P11 W0 prerequisite it always was. Any fix requires its own authorized scope.

## 5. Recommended P11A core checkpoint

Unchanged from Revision 02, with one wording correction (cancel):

> Lot cash pulse → select Administration without rail priming → read Cash, complete current Weekly operating cost, signed Net weekly cashflow, and conditional current-pacing Runway → open retained Finance → reconcile one complete recorded period → inspect Payroll, Studio Operations, current obligations and one exact Film Economics record → review one P09-owned construction consequence with immediate capex and later Opex separated → **cancel (no committed domain action; a read-only quote may already have occurred) or commit through the owning system** → return to the same Finance and lot context → save/load/reconnect.

### Core includes

literal Cash; complete recurring-cost components; signed next-week/current-commitments cashflow; conditional current-pacing Runway; exact period reconciliation; typed cash movement categories; Payroll and compact obligations; Studio Operations and exact facility links; one selected Film Economics view using accepted P07 result truth; a shared TypeScript consequence envelope proven first through P09 construction authority; old-save coverage disclosures; exact film/person/facility routes; retained Administration/Finance world context; accessibility and real-input proof.

### Core excludes

economy retuning; loans, investors, taxes or new financial instruments; bankruptcy or forced recovery; predictive future hits; full accounting P&L; universal all-in film profit; UI-authored financial risk; P12 rivals; P13+ revenue channels; a second construction, contract or history authority.

### Already supplied by producers (REUSED, not new P11 work)

- Construction quote with `cost`, `weeklyOperatingCost`, `buildWeeks`, `completesOnWeek`, `cashBefore`, `cashAfter`, capacity, per-cell legality and refusal copy (P09, `bridge/placement.ts`).
- Contract quote with `signingBonus` / `terminationCost`, `guaranteedRemaining`, `cashBefore`, `cashAfter`, `affordable`, `consequence`, refusal reason/remedy (P10, `bridge/contract.ts`).
- Person contract sheet facts: `annualSalary`, `weeklySalary`, `endWeekExclusive`, `remainingWeeks`, `guaranteedRemaining`, `terminationCost`, renewal state and terms (P10, `bridge/people.ts`).
- Placed-facility public facts: `status`, `placedWeek`, `completesWeek`, `weeksRemaining`, `weeklyOperatingCost` (P09, `StudioPlacedFacilitySnapshot`).
- Exact routes: `OpenProfile(talentId, origin)`, `OpenRoster()`, `OpenStudioHistory(tab, subjectId)`, `OpenFacilityHistory(buildingId)`, `OpenReleaseResult(resultId)`, one-layer Back/Esc grammar (`StudioWorkspaceHost.cs`).
- Facility history rows `facilityCommitted/Completed/Demolished/Moved` and film rows in Studio History (P08 + P09-REQ-040).

## 6. Ready-extension ladder (dependencies refreshed)

| Rank | Extension | Actual dependency at the observed snapshot | Status |
|---|---|---|---|
| 1 | Known-flow Upcoming | Public dated facts exist on the wire: facility `completesWeek` + `weeklyOperatingCost`; contract `endWeekExclusive` + renewal window; run `totalWeeks` / `weeksCredited` / `studioRevenueTotal` (projected) / `studioRevenuePaidToDate`. **No per-week future receipt amount is public**; `studioCalendar()` is core-only and not on the wire | READY subject to the public-information rule (financial truth §10.2); the per-week receipt row is BLOCKED pending a disclosure decision |
| 2 | Consequence previews for hire, renew, release and Greenlight | Renew/release: producer EXISTS (`bridge/contract.ts`, projection 19, real-input proven). Hire: `signContract` quote in `bridge/casting.ts`. Greenlight: P04/P07 casting route intents | READY for renew/release/hire once P11's envelope composes them; Greenlight depends on the existing casting quote shape |
| 3 | Portfolio filters and deep links | P07 results + P08 film rows (`historyRecorded`, `resultAvailable`) + `OpenReleaseResult` | READY |
| 4 | 13/52-week charts with text equivalents | Complete ledger + a bounded query; performance measured on the P08 6,240-week growth fixture (EVIDENCE REPORTED) | READY after core; needs its own bounded-query proof |
| 5 | Year/era summaries | Retained ledger only; P08 folds routine history at 52 weeks, ledger is unfolded | Requires measured storage/query evidence; not blocked by any other extension |

A core checkpoint is a floor, not a ceiling. An independent ready extension is not blocked by an unrelated later one.

## 7. Active-stack dependency classification (observed)

Evidence classes: **SOURCE OBSERVED** (read in git at the pair) · **EVIDENCE REPORTED** (claimed in committed handoffs/registers, not re-run here) · **ARTIFACT INSPECTED/VERIFIED** (a preserved artifact opened and, where marked, its hash recomputed) · **OWNER ACCEPTED** · **NOT VERIFIED**.

| Dependency | Planned | Source | Proof | Owner accepted | Classification |
|---|---|---|---|---|---|
| P08 Studio History root + Standing receipts | Yes | SOURCE OBSERVED: `src/core/studioHistory.ts`, `bridge/history.ts`, save V17 chain | EVIDENCE REPORTED: P08 checkpoint sealed; 8/8 oracle at final pair | No | UNSEALED; reuse |
| P08 Administration/History route | Yes | SOURCE OBSERVED: `StudioFoundingCardHud.cs` card, `StudioWorkspaceHost.OpenStudioHistory` | EVIDENCE REPORTED: HID run 3 43/44 on the P08 sealed exe | No | UNSEALED; reuse |
| P09 bare-lot/endowed regimes | Yes | SOURCE OBSERVED: `foundingRegime` on GameState/Save V18, `BARE_LOT_PROPERTY` | EVIDENCE REPORTED: 12 oracle scenarios; solvency journey | No | UNSEALED; reuse |
| P09 placement/Set quote + commit | Yes | SOURCE OBSERVED: `bridge/placement.ts`, `bridge/setCommission.ts`, session quote map | EVIDENCE REPORTED: R1–R7 sweep test; real-input Build 30/30 on the P09 sealed exe; latest close-gates run 38/39 on `f8f36ea7…` (ARTIFACT INSPECTED) | No | UNSEALED; critical P11 dependency, reuse |
| P09 Opex onset + facility links | Existing law + new route | SOURCE OBSERVED: tick 7.6, `completeDuePlacements`, `expectedWeeklyOperatingCostAt`, `StudioPlacedFacilitySnapshot` | Existing law accepted at P07; new rows EVIDENCE REPORTED | Law yes; route no | Reuse law; refresh route |
| P09 move/demolition/refund | Core only | SOURCE OBSERVED: `moveFacility`, `demolishFacility`, `facilityDemolitionRefund` in core; schema comment "Move/demolish are P09-R4 and are refused until then"; `canDemolish` flag only | Not on the wire | No | MISSING on the wire (P09-R4 AUTHORIZED READY WORK REMAINING) |
| P10 Profile/Roster + exact person routes | Yes | SOURCE OBSERVED: `bridge/people.ts`, `StudioProfileWorkspace.cs`, `StudioRosterWorkspace.cs` | EVIDENCE REPORTED: oracle 22/22 ×4 viewports; real-input Roster route on `a2e808cd…` | No | UNSEALED; reuse |
| P10 contract quote/attention | Conditional | SOURCE OBSERVED: `bridge/contract.ts` (`renewContract`, `releaseTalent`), grouped attention in `bridge/people.ts` | ARTIFACT INSPECTED: real-input renewal 29/29, 0 failures, one ledger row, revision +1 | No | UNSEALED; reuse — **release exists under the identifier `releaseTalent`** |
| P07 result/run/film economics | Yes | Accepted | Accepted | Yes | Binding authority |

## 8. Original real-Builder follow-up

`P09-REQ-039` is **DEPENDENCY-BLOCKED**, corrected back to that disposition by the close-gates register §5 after an earlier "satisfied" sentence was retracted: the 30/30 real-input Build proved the Build **flow**, not a Builder **system**. No Builder formula, worker taxonomy or payroll exists at the observed snapshot. P11 treatment is unchanged: absent Builder economics are `not modeled`, never zero; no Builder payroll or productivity row is invented; the question does not block P11A's finance spine.

### 8.1 Binding corrections carried forward

- Accepted P07 `Profit` / `Loss` / `Break-even` labels stay on the P07 result surface; P11 Finance uses Film Contribution with explicit scope.
- P08 Studio History is sparse context and recording-coverage authority; the signed ledger/checkpoint remains the reconciliation authority. Observed history kinds: `studioFounded`, `standingChanged`, `standingDriftFolded`, `filmReleased`, `theatricalRunCompleted`, `facilityCommitted/Completed/Demolished/Moved` — no finance rows.
- P11 composes around P09 quote/intent/receipt and P10 Profile/Roster/attention/contract routes; it owns no domain action.
- No second Finance persistence root is justified by anything observed.

## 9. Final changed-path refresh required (after Owner acceptance)

1. `FINAL_P08_P10_TS_SHA` and product/docs/build distinctions (observed: product `7b4d8ff…`, docs `a2baa1d9…`).
2. `FINAL_P08_P10_UNITY_SHA` and exact generated-consumer identity (observed: `1d304f8…`, product `57f9ef8…`, DTO blob `4c0a7434…`).
3. `FINAL_P08_P10_SCHEMA_ID`, protocol, projection, save (observed: `6a2c01fe…`, 4, 19, V18).
4. Exact P08 history/Administration symbols, persistence and retention.
5. Exact P09 placement/set quote, commit, facility, Opex-onset, move/demolition and world-body symbols.
6. Exact P10 person, contract, obligation, Profile/Roster and attention symbols.
7. Exact accepted changed paths and collision owners (observed product diff: 35 files under `src/`, `bridge/`; see handoff contract §6.5).
8. Facility-Opex classification (observed: STILL PRESENT).
9. Whether P09's normal-player solvency proof used complete recurring costs (observed: the ledger journey does; the summary selectors do not).
10. Final TypeScript, bridge, Unity, visual, HID and Owner proof floors.
11. Private Unity source mapping for Administration/Finance workspace, focus, Back, large text and screenshot capture.
12. Final requirement dispositions and any extensions already supplied by P08–P10.

## 10. Visible placeholders

```text
FINAL_P08_P10_TS_SHA                 (observed, not final: 7b4d8ffebeb0b7978763780420fdc8542df68b5f)
FINAL_P08_P10_UNITY_SHA              (observed, not final: 1d304f89a29ffca160129b705d7d627543adfb4d)
FINAL_P08_P10_TS_PRODUCT_SHA         (observed, not final: 7b4d8ffebeb0b7978763780420fdc8542df68b5f)
FINAL_P08_P10_UNITY_PRODUCT_SHA      (observed, not final: 57f9ef857a5955a604a56c1526733f2302efabc8)
FINAL_P08_P10_SCHEMA_ID              (observed, not final: sha256:6a2c01fe…)
FINAL_P08_P10_PROTOCOL_VERSION       (observed, not final: 4)
FINAL_P08_P10_PROJECTION_VERSION     (observed, not final: 19)
FINAL_P08_P10_SAVE_VERSION           (observed, not final: V18)
FINAL_P08_HISTORY_SEAM               (observed: bridge/history.ts historyProjection)
FINAL_P09_PLACEMENT_QUOTE_SEAM       (observed: bridge/placement.ts placementQuoteSnapshot)
FINAL_P09_FACILITY_OPEX_SEAM         (observed: src/core/placement.ts weeklyPlacementOperatingCost; tick step 7.6)
FINAL_P10_PERSON_CONTRACT_SEAM       (observed: bridge/people.ts + bridge/contract.ts)
FINAL_P08_P10_CHANGED_PATHS
FINAL_P08_P10_TEST_FLOOR             (reported: TS 5004 passed; EditMode 882)
FINAL_P08_P10_OWNER_ACCEPTANCE       (PENDING)
CURRENT_OPS_P11_AUTHORIZATION_ID     (NOT ISSUED)
```

## 11. Audit → P11 entry gate (compact checklist)

A read-only audit may run before Owner acceptance. Bug fixes found by the audit need their own authorized scope and independent verification. P11 implementation requires **all** of the following; neither a clean audit nor this document authorizes it.

| # | Check | Observed 2026-09-06 | Required state |
|---|---|---|---|
| 1 | Compatible final source, build, contract and evidence identities recorded (TS product, Unity product, exe, assembly, engine bundle, schema, DTO blob) | Observed pair recorded in §2.2; candidate evidence folders for Build/People journeys empty | Final accepted identities; every cited evidence run bound to the candidate's product bytes |
| 2 | Mandatory real-player-input gates complete | Contract renewal PASS (candidate assembly); Build PASS-with-one-step on an earlier exe; Roster/Locate/Back PASS only on an earlier product; world-body direct click FAIL (harness) | All green on the candidate's product bytes, or an explicit Current Ops acceptance of the recorded classification |
| 3 | Private Owner-profile-copy continuity evidence | Reports present: in-memory 48/48, real sealed engine 11/11 (ARTIFACT INSPECTED); original hash untouched EVIDENCE REPORTED | Re-verified on the final base; original never opened for writing |
| 4 | Placement preview versus committed construction truth | Wire quote is a verbatim read of `queryPlacement` (R1–R7 EVIDENCE REPORTED); one client ghost-legality divergence on a doubly-migrated fixture recorded MINOR | Divergence dispositioned; commit path revision-bound and idempotent re-verified |
| 5 | Contract quote/debit/receipt consistency | Renewal: bonus $37,375 quoted = debited; one `signingBonus` ledger row; revision +1; cancel state-neutral (ARTIFACT INSPECTED) | Same for release (`termination` row) on the final base |
| 6 | Exact-ID navigation and usable Back/Locate | `OpenProfile/OpenRoster/OpenStudioHistory/OpenFacilityHistory/OpenReleaseResult` observed; Back peels one layer; Locate gated by `canLocate` | Real-input Locate/Back green on the candidate bytes |
| 7 | Financial selectors versus actual debits | STILL PRESENT: `weeklyBurn` family omits `facilityOpex`; reaches the Administration card | W0 repair authorized and reconciled selector↔tick↔ledger, or affected rows blocked |
| 8 | Final Owner acceptance of the relevant upstream candidate | PENDING | Accepted, with the accepted rollback boundary named |

P11 implementation then also requires: material audit findings resolved; P11 refreshed against the exact resulting source pair (§12); required decisions adopted (register §4); and a separate Current Ops P11 order. If an audit repair changes a dependency, that dependency is refreshed again. Onboarding activation and main promotion are separate from this gate.

## 12. Final-refresh checklist (to be executed once, after acceptance)

- [ ] Re-freeze TS/Unity accepted SHAs, product/build/docs distinctions, remote equality.
- [ ] Recompute exe, assembly, engine bundle, schema id and DTO blob identities; confirm byte identity across repositories.
- [ ] Re-classify facility Opex (FIXED / STILL PRESENT / PARTIALLY FIXED / NOT VERIFIABLE) at the accepted base.
- [ ] Re-map every symbol in the handoff contract §6 against the accepted base; strike any that moved.
- [ ] Re-read the final P08–P10 handoff, close-gates register, hostile reviews and requirement dispositions; update the reuse map.
- [ ] Confirm the real-input gate classification Current Ops accepted, and which evidence runs bind to the accepted product bytes.
- [ ] Confirm Owner-profile-copy migration on the accepted base; never open the original.
- [ ] Replace every placeholder in §10 and in the draft prompt §2; remove "observed, not final" annotations.
- [ ] Re-run the register: mark rows REUSED / IMPLEMENT / BLOCKED against final facts.
- [ ] Update all six documents' headers to the accepted base; keep this revision log.

## 13. Readiness ruling

**Document review:** READY FOR CURRENT OPS DOCUMENT REVIEW.
**Refresh:** PROVISIONAL OBSERVED-STACK REFRESH COMPLETE · FINAL ACCEPTED-BASE REFRESH PENDING.
**Implementation:** P11 IMPLEMENTATION NOT AUTHORIZED.
**Owner decisions before P11A:** NONE under the recommended defaults stated in the register §4.B (Current Ops must adopt them explicitly).
**Production code changed by this package:** NONE.

FINAL ACCEPTED-BASE CHANGED-PATH REFRESH REQUIRED BEFORE ANY P11 IMPLEMENTATION ORDER
