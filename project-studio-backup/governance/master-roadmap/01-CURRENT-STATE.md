# Project: Studio — Current State Reconstruction

Reconstructed **read-only** from live git + repo docs, 2026-07-27. Verified against a real test run and a live `git status` on each repo. No repository was modified.

---

## 1. Repositories & worktrees (live git facts)

| Repo / worktree | Branch | HEAD | Tree | Role |
|---|---|---|---|---|
| `/Users/bruce/The Movies` | `phase-5.2-economy` | `0f9e4bd` | **DIRTY, ~32 paths, actively changing** | The sim engine (Engine Room) + M1A UI. Authoritative. |
| `/Users/bruce/The Movies - Studio Lot Spike` | `studio-lot-spike` | `3806ef6` | **clean** | Frozen 2.5D isometric lot spike (Phaser+Vite). Presentation-only; a worktree/branch of main. |
| `/Users/bruce/The Movies - 3D Visual Spike` | `studio-3d-visual-spike` | `591f3aa` | **source clean** (52 dirty files are all re-captured PNGs) | Frozen 3D vertical slice (Three/R3F). Standalone repo, no remote. |
| `/Users/bruce/The Movies - Hybrid Integration Readiness` | — | — | **does not exist** | Gate-D worktree; correctly not yet created. |

**Main branch inventory (local):** `main eb9dd43` · `phase-5.1-talent 3ac66bb` · `phase-5.2-studio-roster b6f378a` · `phase-5.2-economy 0f9e4bd` (checked out) · `studio-lot-spike 3806ef6`.

> ⚠️ **Moving base.** The main working tree's uncommitted D-12 set grew 24 → 30 → 32 during a single session — a parallel sim-track session is editing it live. Any consumer (especially a future Gate-D adapter) must treat main's HEAD and dirty set as **unstable until the owner names a frozen base**.

---

## 2. Sim engine — the Engine Room

### 2.1 Milestones
- **M0A (phases 1–4, headless proving harness): PASS.** Phase 1 → 79 tests; Phase 2 → 164; Phase 3 → 283; Phase 4 (Broadcast core + §14 8-flag harness over 1000 seeds × 2 agents + §15 acceptance) → 320. Every phase audit returned CLEAN / CLEAN-WITH-NOTES. M0A was originally **BLOCKED** on the D-2 standing-differentiation gate; owner ruling **D-6** revised the §6 reputation formulas and M0A.1 made it PASS (all 8 instrumentation flags now pass). A PASS of M0A is explicitly **not** approval for Phase 5.
- **M1A (playable film laboratory, phases 5–6): IN PROGRESS.** Phase-5 UI approved & shipped; **5.1** multi-discipline talent (merged to `main`); **5.2A** studio employment / **D-11** (on `phase-5.2-studio-roster`, unmerged); **Cycle-4A** non-financial UX (committed at `0f9e4bd`); **Cycle-4B = D-12 economy** (in the working tree, uncommitted).
- `main` = `eb9dd43` (Phase-5.1 merge). Everything after 5.1 is on **unmerged branches**, each returned for an owner playtest.

### 2.2 In-flight work — D-12 "Studio Economy & Theatrical Runs"
Coded in the `phase-5.2-economy` working tree, **uncommitted**, contract status *"authored for owner checkpoint review; NOT yet implemented (Commit 2 gated on owner approval)."* What it does:
- Replaces **"Studio Revenue = 100% of box-office gross as a single lump at release"** with a **Blended-Share Theatrical Run**: gross is *conserved* (`Σ weeklyGross = opening × legs`) but paid over **6 weeks**, of which the studio keeps a blended **`STUDIO_RENTAL_BLENDED = 0.52`** rental share.
- Adds a **mandatory Hill fame-saturation** on *opening reach only*: `fameReach(fame) = fame / (fame + 50)`. Calibration proved the share alone can't reorder strategies; the **saturation is what unseats OVR/star dominance**.
- Light weekly overhead (`$15k base + $1.5k/employee`); a **solvency gate** (`canAfford`) that blocks only *voluntary* commitments from going negative (no loans, no game-over — D-1/D-11.5 preserved); a **new `SaveFileV4`** (V1/V2/V3 frozen; `convertV3ToV4` maps old films to legacy full-gross runs).
- **All additive and gated behind `economyEngaged` (≡ `employmentEngaged`)**, so the frozen M0A corpus stays **byte-identical**.
- **Ruling dependency:** D-12.1 lifts the D-11.18 / D-11.20 distribution-economics deferral **for this milestone only**.

New files: `src/core/economy.ts`, `src/core/economyView.ts`, `src/harness/run-economy-balance-study.ts`, `tests/d12-economy*.test.ts`, `ui/src/screens/WeeklySummary.tsx`, `docs/D-12-economy-contract.md`, `docs/D-12-calibration-record.md`. Modified core: `tick.ts` (steps 3.5 weekly revenue / 7.5 overhead), `types.ts`, `save.ts`, `tuning.ts`, `employment.ts`, `reception.ts`, `forecast.ts`, `actions.ts`, `worldgen.ts`, `index.ts`; UI `adapter.ts`, `Dashboard.tsx`, `Assembly.tsx`, `App.tsx`.

### 2.3 Verified test status (real run, not documented)
`npm test` (`vitest run`) on the current dirty D-12 tree, 2026-07-27:

```
Test Files  49 passed (49)
     Tests  767 passed (767)
  Duration  30.38s
```

Signals of note: `d12-economy`, `d12-economy-view`, `d12-fame-isolation`, and all `d11-cycle*` pass → the D-12 tree is **not broken WIP**. `§15.7 full-run replay — byte-identical SaveFile` passes → M0A byte-identity intact. UI test *"NO Broadcast presentation or feed appears anywhere in the UI"* passes → the Phase-6 hard stop is provably honored.
**Caveat:** D-12 *balance* calibration is `[S]` structural-harness only; the `[I]` integrated-engine and `[H]` owner-playtest reruns are **pending** before final D-12 sign-off. Tests passing ≠ economy balance approved.

### 2.4 Known engine facts that shape future presentation
- **Broadcast core is inert in M0A** (surprise ≡ 0 → zero headlines over 20,000 releases). How "surprise" is generated is an **owner product decision owed before any Phase-6 Broadcast presentation** (adding a human player alone doesn't fix it).
- `technical` is pinned at 40 → craft's 15% technical weight is untested until craft hiring arrives in M1A.
- Presentation boundary is disciplined: `ui/src/engine/adapter.ts` is the **only** module importing the core, and only via public `src/core/index.ts`. No component reaches into `src/core`; no formula is duplicated.

---

## 3. Presentation track — the two frozen spikes

### 3.1 2.5D lot spike — `studio-lot-spike @ 3806ef6` (clean, FROZEN at Pass-3)
An isolated Phaser+Vite isometric browser lot that turns the studio into a *place*. Passes 1–3 answered all five research questions YES (a place not a dashboard; buildings as navigation; visible activity; can consume real `GameState` later without owning rules; worth integrating as a Phase-5-plus layer). Renders from a `StudioLotSnapshot`; imports nothing from `src/core`; seeded RNG only.
- **Pass-4 (visual polish) FAILED and was reverted.** An authored SVG→PNG asset pipeline + one sample gate sprite drew an independent verdict *"FAIL — more detailed but not visually better"*: a lone gradient asset clashes with flat-shaded neighbors and "looks like it's from a different game." Root cause is structural — a fair beauty upgrade needs a **whole-scene restyle**, not a single-asset spike. Runtime scene is byte-identical to the approved Pass-3 build; pipeline retained as research record only.
- **Disposition:** keep frozen at Pass-3. Any real beauty pass is a **separate, authorized whole-scene art milestone.**

### 3.2 3D visual spike — `studio-3d-visual-spike @ 591f3aa` (source clean, FROZEN, Gate C PASS)
Isolated 3D vertical slice (React 18 + Three 0.161 + R3F 8 + drei 9, all MIT). Ran as one ~4h54m session (16 commits, 2026-07-26); gates are review checkpoints, not calendar milestones.
- **Gate A (gray-box) PASS:** three-tier camera (overview→production→human-scale) designated a product success and frozen; ~120 fps on owner hardware; snapshot-in/intent-out; deterministic vignette; validated routing.
- **Gate B (low-poly asset survey) PASS:** one coherent CC0 Kenney family works as a **supporting** layer, but **studio identity must be bespoke**; Kenney adults render oversized (2.72 m vs the 1.8 m unit) → normalize the character, don't enlarge buildings.
- **Gate C (coherent Meridian art slice) PASS** (owner, on hardware): reads as a movie studio in <5 s from world visuals alone; hero landmarks are **100% original code-authored** Three.js geometry; crew are normalized Kenney CC0 (background only).
- **Conclusion: USE HYBRID PRESENTATION.** Performance number of record: **~120 fps** on owner hardware (a *budget to protect*, a single vsync-capped eyeball value — not a per-scenario benchmark); headless CI ~7–13 fps is a software floor, never a verdict. The ~974 kB JS bundle must be **lazy-loaded** in any integration.
- **Open gaps:** hero-character quality (Kenney reads "Roblox-ish" — background/supporting only; hero pipeline is future work); **OC-01** camera occlusion (roofs/vans block close views) — recorded, **not started**.

### 3.3 The hybrid keystone
Both renderers satisfy the **same `StudioLotRenderer` interface + `StudioLotSnapshot` contract**, so one snapshot can drive either. This shared contract is the single most reusable artifact and the technical basis for the hybrid plan. **Caveat (retrospective):** the two snapshot *types* are not yet literally unified — the 3D spike trims to 7 buildings and drops 5 fields the 2.5D 9-building type carries; the `GameState→snapshot` adapter was only ever exercised on the 2.5D side. Reconciling the type and exercising the adapter seam is the core Gate-D homework. See `03-CONTRACT-REGISTRY.md §4`.

---

## 4. Art direction — Meridian visual identity (APPROVED)

Concept phase **APPROVED** (via *APPROVED WITH CORRECTIONS* → corrections resolved). Locked visual language: *"a warm, golden-hour, stylized 1940s–50s Hollywood studio you own — legible from a management overview, rewarding to zoom into."* Stylized (Two Point / Tropico legibility + warmer cinematic key), one level of stylization everywhere. Fixed palette (cream stucco `#efe3c6`, terracotta `#b56a4a`, taupe/brass Deco, buff soundstages, sage lawns, signature red `#b8484a`); golden-hour key from upper-left; 1.8 m adult = the scale unit. Eight concept renders live in the Art Direction folder (see `04-EVIDENCE-INDEX.md`).
- **3D implementation remains LOCKED** pending both (a) Phase-5.1 committed **and** (b) formal PM approval of the concept package.
- Open: fresh-reviewer co-sign; formal PM sign-off; deferred hero-panel AI-artifact cleanup. AI concept art is **reference-only** and firewalled — never a runtime/shipped asset.

---

## 5. Hybrid integration (Gate D) — AUTHORIZED but HELD
Decision: **PROCEED to hybrid presentation, but NOT now and NOT big-bang.** Gate D is a bounded, isolated, **deferred-start** readiness spike (unify the contract; extract both renderers into one internal `@studio/lot-presentation` package behind a single interface; wire host-side via a read-only `fromGameState` adapter + feature flag + lazy load) with **zero change to main** until its own review passes.
- **Entry status: AUTHORIZED (deferred start) — NOT STARTED. HELD.** 3 of 6 conditions unmet (moving main; sim track still committing; owner-confirmed frozen base not named). Full compatibility matrix and package plan in `03-CONTRACT-REGISTRY.md`.
- Stop condition: if the fun gate is "no," halt at Gate D — the presentation stays flag-gated and shelved, not wasted.
- **Protection guard (owner ruling R-2026-07-27-B):** the exact-HEAD tripwire is **deprecated** and currently RED (a known false positive on the advancing main track); its structural-isolation replacement is **recorded but blocked** — do not implement while main is dirty or D-12 is active. Exact pins remain valid for the frozen spikes. See `05-RULINGS.md`.

---

## 6. What could still change the current state
- **Owner approval of D-12** (unblocks Cycle-4B commit) — until then the whole `economyView`/`economy`/`SaveFileV4` surface is uncommitted and mutable.
- **[I]/[H] reruns** could force a mechanic change (K, blended share, schedule) — numbers move, read-model *shapes* stay stable.
- **Newspaper/autopsy update** (D-12 §17): must distinguish gross / Studio Revenue / cost / marketing / profit — alters what `NewspaperReveal.tsx` / `Autopsy.tsx` render.
- A parallel sim session continuing to edit main (the moving base) — re-verify HEAD before relying on it.
