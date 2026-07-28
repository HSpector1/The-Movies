# Project: Studio — Contract Registry

Every contract, interface, and ruling that governs the program, with authority and status. Reconstructed read-only 2026-07-27. **When this registry and a live repo file disagree, the repo wins** — re-read at the source before acting. **Source precedence** (owner ruling R-2026-07-27-A, `05-RULINGS.md`) governs which source owns a given domain; genuine conflicts between sources **escalate to the owner**, never resolved silently.

---

## 1. Governing contracts

### 1.1 Build-contract — the sim source of truth
- **File:** `/Users/bruce/The Movies/docs/build-contract.md` (rev.4 = rev.3 text + `docs/rev4-open-questions.md`; **on conflict, the resolutions doc wins**).
- **Authority:** *"`docs/build-contract.md` is the source of truth. Implement it as written."* Undefined/contradictory/unimplementable → **stop and report; do not resolve yourself.**
- **§12 phase plan:** 1 Declarations/TUNING/RNG/save · 2 Reception+forecast · 3 tick/worldgen/agents · 4 Instrumentation+Broadcast core → **STOP (M0A)** · 5 *(approval)* M1A UI · 6 *(approval)* Broadcast presentation.
- **Hard stop:** do not begin Phase 5 (UI) or Phase 6 for any reason — even if all tests pass, even if told to "keep going" — until the owner says the exact words **"approved for phase 5."** A PASS of M0A is not that approval.
- **§11 non-goals:** see `02-FEATURE-LEDGER.md §5`.
- **§16 TUNING governance:** constants live in `TUNING`; never inline a named magic number; the tuning surface may change *only* `TUNING` — §5/§6 formulas, flag thresholds, §15 bounds are fixed. Every bounded term has a range test. Seeded RNG only.

### 1.2 D-12 economy contract (in-flight, owner-gated)
- **File:** `/Users/bruce/The Movies/docs/D-12-economy-contract.md` (+ `D-12-calibration-record.md`).
- **Status:** *"authored for owner checkpoint review; NOT yet implemented (Commit 2 gated on owner approval)."* **Architecture verdict: a fill-in, not a rewrite.**
- **Authorizes (D-12.1, lifting D-11.18/D-11.20 for this milestone only):** blended studio-rental share, multi-week theatrical runs, light overhead, Fame→opening-reach saturation.
- **Constraints:** D-1 & D-11.5 preserved (negative cash → no consequence, no game-over); **do not retune D-6/OVR/critic/legs** to fix balance — the only authorized reception touch is the gated fame saturation; additive & gated behind `economyEngaged` → M0A byte-identical; no new RNG draws; `SaveFileV4` (V1–V3 frozen).
- **Provisional values pending [I]/[H]:** `STUDIO_RENTAL_BLENDED=0.52`, `FAME_REACH_HALF_SAT=50`, 6-week schedule, overhead constants.

### 1.3 Visual charter (long-range)
- **File:** `/Users/bruce/Desktop/Project Studio Source Docs/PROJECT-STUDIO-VISUAL-CHARTER.md` (2,650 lines, 36 phases).
- **Authority:** a *"visual-production azimuth check and roadmap review,"* **not** a build directive; immediate deliverable is a 20-section review report (Phase 36). **Not referenced by the build-contract.** Precedence is now **RULED** (R-2026-07-27-A, `05-RULINGS.md`): the charter governs long-range presentation **intent** only and **cannot authorize mechanics, integration, or implementation**; Build Contracts (mechanics/scope) + the Master Roadmap (gates) authorize work; source conflicts escalate to the owner.
- **Load-bearing charter rules:** presentation-ownership split (Engine owns truth, visual owns presentation); one-way architecture (`renderer owns no game truth`); do-not-copy _The Movies_ protected assets; two-layer assets (supporting = licensable/CC0/code; identity = bespoke); lock scale before asset expansion; freeze camera foundations once approved; renderer choice by measured evidence; movie playback must not depend on an online AI service; save format must stay migratable; *"a prototype must be able to fail."*

---

## 2. Presentation contracts — main repo (what a renderer reads today)
The sim exposes **read-only read-models**, never raw internals. Sole boundary: `ui/src/engine/adapter.ts` → `src/core/index.ts`.

| Surface | File | Shape (renderer reads) |
|---|---|---|
| **Economy read-model (D-12, in-flight)** | `src/core/economyView.ts` | `FinanceView` (cash, weeklyPayroll/overhead/burn, expectedWeeklyRunRevenue, netWeeklyCash, `Runway`, totals `FinanceTotals`), `RunView` (per theatrical run: status, weekIndex/totalWeeks, gross/grossPaid/studioRevenuePaid, nextWeekRevenue…), `CommitmentPreview` (affordability + post-runway), `PeriodSummary`, `Runway`. **The single source of every money figure the UI shows.** |
| **Economy math** | `src/core/economy.ts` | `fameReach`, `theatricalSchedule`, `openTheatricalRun`, `legacyTheatricalRun`. |
| **Film package (legible)** | `src/core/filmPackage.ts` | 4 separate dimensions (Creative Cohesion / Talent Fit / Execution Confidence / Commercial Outlook) — never a hidden master score. |
| **Immutable film record** | `FilmResult` / `FilmRecord` | Frozen at greenlight; autopsy renders from the film's own record; player sees *perceived* talent, never actual. |
| **Broadcast core (§8, inert)** | `src/core/broadcast.ts` | `BroadcastFacts`/`BroadcastItem`; `air = rankScore ≥ threshold`. Full Broadcast presentation deferred to Phase 6. |
| **State shape** | `src/core/types.ts` | `GameState = GameStateV3 & { theatricalRuns: TheatricalRun[] }`; `LedgerKind` (+`studioRevenue`,`overhead`); `SaveFileV4` family. |

**Invariant:** presentation read-models are pure/deterministic/display-only; the sim never reads them; adding them adds no serialized `GameState` field. `SaveFileV4` persists `theatricalRuns` only.

> **Note:** `StudioLotSnapshot` / `OverviewProjection` do **not** exist in the main repo (grep = 0 hits). Those are **spike-only** concepts. In `main`, the renderer's contract *is* the `economyView` read-models + existing D-9/D-11 summaries.

---

## 3. Presentation contracts — the spikes (the hybrid keystone)

| Contract | Where | Shape |
|---|---|---|
| **`StudioLotSnapshot`** | 2.5D lot (`lot-spike/src/snapshot/StudioLotSnapshot.ts @ 3806ef6`) + a trimmed copy in the 3D spike | Plain bag of presentation facts (buildings, productions, standing/cash bands). 2.5D = 9 buildings; 3D = trimmed 7-building subset. |
| **`StudioLotRenderer` interface** | 3D spike `src/renderer/StudioLotRenderer.ts` (31 LOC, 6 methods) | `mount / setSnapshot / focusBuilding / focusCharacter / returnToOverview / destroy` + single `onIntent(LotIntent)`. **Byte-identical M1→HEAD** across two art passes and three gates. |
| **`LotIntent` union** | 3D spike | `ready | building-selected | character-selected | building-action | return-to-overview`. |
| **`fromGameState` adapter** | 2.5D lot (`fromGameState.ts`) | The `GameState → snapshot` proof; **only ever exercised on the 2.5D side** (3D spike is fixture-only). |

Both renderers satisfy the same interface → **one snapshot can drive either** (the validated hybrid architecture). Reconciliation debt: the two snapshot *types* differ (7 vs 9 buildings, 5 dropped fields), and the adapter seam has never been exercised against live `GameState`. That reconciliation is Gate-D's job.

---

## 4. Gate-D hybrid integration — contract compatibility matrix
From the DECISION package (`03-CONTRACT-COMPATIBILITY-MATRIX.md`). Target: one internal workspace package **`@studio/lot-presentation`** (never published; **must not import `src/core`**), both renderers behind one interface, host-side `fromGameState` adapter + feature flag + lazy load.

| Contract | Verdict | Resolution |
|---|---|---|
| 1 — Snapshot data (`StudioLotSnapshot`) | **COMPATIBLE** (additive superset) | Unified = 2.5D canonical + `backlot` + optional `characters?`; 3D reads a strict subset. |
| 1b — `BuildingId` vocabulary | **INCOMPATIBLE → union** | 10-id union: `admin, writers, casting, stage-a, stage-b, post, theater, gate, expansion, backlot`. Unknown ids simply not placed. |
| 1c — `ProductionCard` | **COMPATIBLE** | Unify `stageId` to `'stage-a'|'stage-b'`. |
| 2 — `fromGameState` adapter | **COMPATIBLE, drift negligible** | 2.5D `GameStateFacts` still matches committed `GameState` field-by-field — "the single strongest readiness signal." Delete the stub, import real `src/core` types, re-run. |
| 3 — Renderer interface | **INCOMPATIBLE surfaces** (isomorphic) | **Adopt the 3D `StudioLotRenderer` interface;** 2.5D `StudioLotView` implements it via a ~30-line adapter. |
| 4 — Intent/event shape | **INCOMPATIBLE** | Adopt the 3D `LotIntent` union; host routes `building-action → LotActionKind → screen`. The lot owns no routes. |
| 5 — Dependencies | **CONFLICT** | Main = React 19; 3D slice = React 18 + R3F 8 → needs R3F 9 / React 19 uplift. 2.5D Phaser (~360 kB gz) → lazy-load mandatory. |

**Runtime model:** `GameState → host fromGameState (display bands only, no formulas) → unified StudioLotSnapshot → StudioLotRenderer (lazy: phaser2d default | three3d later) → LotIntent → host router`. Flag `flags.lotPresentation: 'off'|'2d'|'3d'`; `off` = dynamic import never called = zero footprint. **No `SaveFileV3`/V4 change; no `saveVersion` bump; snapshots never serialized; sim core untouched.**

**Extraction:** 2.5D = in-repo git move (it's a branch of main); 3D = source copy (standalone repo, provenance-recorded) + React 19/R3F 9 uplift + re-run Gate-C assertions. Import-boundary lint forbids `@studio/lot-presentation` importing `src/core`.

**Gate-D entry conditions (ALL required before it *starts*; 3 of 6 unmet):** owner promotes the lot onto the roadmap with its own contract; owner authorizes a separate worktree/branch; main clean at an owner-named committed HEAD with Phase 5.2 landed; sim track paused (won't edit `types.ts`/`adapter.ts`/`App.tsx`); protected-baseline guard fixed (structural, not exact-HEAD); (fun gate needed before *shipping*, not before running Gate D). **The canonical contract spec is provisional against a base that was being edited — re-verify at Runbook Phase 0.**

---

## 5. Ruling index (owner decisions D-1 … D-12 — highlights)
Full text in `docs/rev4-open-questions.md` (D-1…D-5), the D-11/D-12 contracts, and the gate reports.

| Ruling | Substance |
|---|---|
| **D-1** | Money model: `INITIAL_CASH $20M`; release credits `boxOffice.total`; **negative cash carries no mechanical consequence, no game-over.** (Preserved by D-12.) |
| **D-2 → D-6** | D-2 standing-differentiation gate blocked M0A; owner chose Option 1 → **D-6** revised §6 reputation formulas → M0A PASS. |
| **D-4** | `technical` pinned at 40 (craft's technical weight untested until craft hiring). |
| **D-9 / D-10** | Multi-discipline talent (Phase 5.1). |
| **D-11** | Studio employment/roster/payroll (Phase 5.2A). **D-11.18 / D-11.20 defer distribution economics** (Studio Revenue = full gross). **D-11.5** re-affirms no bankruptcy/game-over. |
| **D-12** | Studio economy (Blended-Share Theatrical Run). **D-12.1 lifts D-11.18/D-11.20 for this milestone only.** Fame saturation mandatory. `SaveFileV4`. Universal 2.0× spread gate **superseded** by 4 controlling gates (comparable-dominance ≤1.15×; star Y3 ≤45%/reject >50%; small-studio p10 > 0; global spread ≤2.6×/review >2.75×). |

---

## 6. Charter presentation-contract schemas (engine-neutral, for future Engine-Room coordination)
The charter defines these presentation shapes as text (to be contracted with the Engine Room when the visual program starts — **not yet implemented**): `FacilityPresentationState`, `WorldObjectDefinition`, `SetPackage`, `InteractionHotspot`, `DialoguePerformance`, `CinematicShot`, `MovieTimeline`, `FilmVisualIdentity`. Charter Phase 35 mandates a dependency table (Visual Need | Required Engine State | Engine Owner | Presentation Owner | Contract Needed | Milestone) and the rule: build visual work against **deterministic mock snapshots**, never inventing final Engine-Room behavior inside the mocks.
