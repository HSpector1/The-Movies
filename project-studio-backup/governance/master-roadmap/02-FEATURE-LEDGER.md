# Project: Studio — Feature Ledger

A single register of every capability, classified by status. Reconstructed 2026-07-27. Status legend:
**✅ BUILT** (committed/merged) · **🟡 IN-FLIGHT** (coded, uncommitted/unmerged, owner-gated) · **🔵 AUTHORIZED–NOT STARTED** · **🧊 FROZEN SPIKE** (proven in isolation, not integrated) · **⛔ DEFERRED / NON-GOAL** (a decision, not an oversight) · **🌅 LONG-RANGE** (charter horizon).

---

## 1. Engine Room (sim core)

| Capability | Status | Notes |
|---|---|---|
| Declarations, `TUNING`, seeded RNG, save validation (Phase 1) | ✅ BUILT | 79 tests. |
| Reception (§5) + forecast (§7) pipelines | ✅ BUILT | Unit test per bounded term. |
| `applyActions`/`tick`, worldgen (§9), Random+Oracle agents (§13) | ✅ BUILT | Phase 3, 283 tests. |
| Instrumentation (§14) + minimal deterministic Broadcast core (§8) | ✅ BUILT | Phase 4 / M0A, 320 tests. Broadcast core **inert** in M0A (surprise ≡ 0). |
| M0A headless proving harness → **PASS** | ✅ BUILT | After D-6 standing repair (M0A.1). Byte-identical replay holds. |
| Standing/reputation model (D-6 revision) | ✅ BUILT | Fixed D-2 differentiation gate. §5/§6 formula constants are outside `TUNING` and frozen. |
| Multi-discipline talent (Phase 5.1 / D-9, D-10) | ✅ BUILT | Merged to `main` (`eb9dd43`). |
| Studio employment / roster / payroll (Phase 5.2A / D-11) | ✅ BUILT (unmerged) | On `phase-5.2-studio-roster`; returned for owner playtest. |
| Cycle-4A non-financial UX | ✅ BUILT | Committed at `0f9e4bd`. |
| **Studio economy: Blended-Share Theatrical Run (D-12)** | 🟡 IN-FLIGHT | Coded, uncommitted, **gated on owner approval**. 6-week runs, 0.52 blended share, Hill fame-saturation, overhead, solvency gate, `SaveFileV4`. Additive/gated → M0A byte-identical. |

## 2. M1A UI (playable film laboratory)

| Capability | Status | Notes |
|---|---|---|
| Film loop UI: concept → shape → promise → cast → budget → release → autopsy | ✅ BUILT | Phase-5 (owner-approved & shipped). |
| Talent creator; Start/Dashboard/Assembly/ReleaseResult/Autopsy/Saves screens | ✅ BUILT | Via `ui/src/engine/adapter.ts` (sole core boundary). |
| Legible Film Package (4 separate dimensions, never a hidden master score) | ✅ BUILT | Cycle-3, unmerged (`phase-5.1-talent`). |
| Restricted-mode qualitative bands | ✅ BUILT | Owner-authorized capability; not wired into normal play. |
| Finance UX: Dashboard finance card, Release Strategy, WeeklySummary, runway redefinition | 🟡 IN-FLIGHT | D-12 read-models (`economyView.ts`); uncommitted. |
| Newspaper/autopsy gross-vs-Studio-Revenue split (D-12 §17) | 🟡 IN-FLIGHT | Must distinguish gross / revenue / cost / marketing / profit; verify before sign-off. |
| Broadcast presentation + prediction→result→revision cycle (Phase 6) | 🔵 / ⛔ | *Requires approval.* Blocked on the **surprise-model owner decision**. |

## 3. Presentation — spikes (isolated, proven, NOT integrated)

| Capability | Status | Notes |
|---|---|---|
| 2.5D isometric lot (place, navigation, ambient activity, click-inspect) | 🧊 FROZEN SPIKE | `studio-lot-spike @ 3806ef6`, Pass-3. Renderer-neutral `StudioLotSnapshot`. |
| 2.5D authored-asset (SVG→PNG) pipeline | 🧊 (research only) | Pass-4 Stage A **failed review, reverted**. Reusable only under a whole-scene restyle. |
| 3D vertical slice: three-tier camera, deterministic vignette, routing validation | 🧊 FROZEN SPIKE | `studio-3d-visual-spike @ 591f3aa`, **Gate C PASS**. Camera = designated product success. |
| 3D hero identity (code-authored Meridian landmarks) + normalized CC0 crew | 🧊 FROZEN SPIKE | Hero geometry 100% original; crew = background-only. |
| Shared `StudioLotRenderer` interface + `StudioLotSnapshot` contract (hybrid keystone) | 🧊 (contract proven) | Both renderers satisfy it; snapshot *types* not yet literally unified (Gate-D homework). |
| **Hybrid integration** (unified package + host adapter + flag) | 🔵 AUTHORIZED–NOT STARTED | **Gate D, HELD** (3/6 entry conditions). |
| Ship 2.5D "Complementary Studio Overview" to players (Stage B) | 🔵 (later) | Gate E; after Gate D passes **and** the fun gate clears. |
| Selective 3D close-view to players (Stage C) | 🔵 (later) | Follow-on sub-gate after Stage B. |

## 4. Art direction

| Capability | Status | Notes |
|---|---|---|
| Meridian visual identity / concept phase | ✅ APPROVED | Locked palette, golden-hour language, 1.8 m scale sheet. 8 concept renders. |
| Formal PM sign-off + fresh-reviewer co-sign | 🔵 (owed) | A 3D-unlock precondition; not yet recorded. |
| 3D implementation of the concept | ⛔ LOCKED | Until Phase-5.1 committed **and** concept package formally approved. |

## 5. ⛔ Deferred / explicit non-goals (build-contract §11 — a decision, not an oversight)
Do **not** build, scaffold, abstract for, or leave TODOs for:
> chemistry · readable memories · production incidents · contract negotiation · **the lot** · rival studios as agents · awards season · scene composition · screenplay generation · **visual output** · library economics · receivership · `SimulationFlags` · **the studio economy** *(beyond D-12's authorized slice)* · cultural drift · aging & career progression · late promise repositioning · competition modelling · **LLM integration of any kind** · onboarding · tutorial · accessibility · mobile layout.

Items the **D-12 economy contract (§24)** additionally puts out of *its own* scope — i.e. do not pull them into the economy milestone (they are **not** thereby program-level non-goals): persistent scripts & co-writers, script market, filmmaker pitches, facilities, acting school, loans/debt/investors/taxes, streaming/TV/library revenue, acquisitions, rival studios, era progression, **studio-lot integration**, **Gate D hybrid integration**, week-varying studio shares. (Gate D itself is separately **AUTHORIZED–NOT STARTED / HELD** — see §3 and `00 §7`; it is out of scope *for the economy contract*, not forbidden.) Late-game money scarcity is an **accepted, disclosed limitation** — do not add premature money sinks to fix it.

> If any non-goal appears *necessary* for M0A/M1A to work, that is the signal to **stop and report a finding**, not to build it.

## 6. 🌅 Long-range (visual charter horizon — NOT authorized work)
The charter defines a 36-phase visual/3D program and a V0–V9 prototype sequence, none started. Major future capability areas (for orientation only): facility visual-state system · studio-lot structure (authored/configurable/hybrid) · scale lock · full camera grammar · world-object schema · set system & modularity · character pipeline (hero/supporting/background tiers) · rig & retargeting · animation architecture · prop sockets · facial/lip-sync · cinematic camera · scene & movie-creation architecture · timeline sequencer · renderer decision (WebGPU vs WebGL2, evidence-based) · materials/lighting · era progression · talent visual progression · bar/restaurant/rehab/makeover facilities · visible production · film visual identity · movie playback & export · performance budgets (benchmarks A–D) · asset pipeline & provenance. Immediate charter ask is a **20-section review report**, not implementation.
