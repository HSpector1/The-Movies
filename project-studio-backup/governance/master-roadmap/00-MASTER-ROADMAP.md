# Project: Studio — Master Roadmap

**Authoritative program plan. Read this first.**
Compiled 2026-07-27 from local evidence (git state, the sim repo, the frozen presentation spikes, the hybrid-integration decision package, the 3D-spike retrospective, the approved art direction, and the final-product visual charter). Reconstructed to let a fresh terminal or collaborator orient **without any conversational memory**.

> This is a **governance / reconciliation document**. It authorizes no work. Every "next" here is gated on an owner decision recorded in [§7](#7-what-is-authorized--held--forbidden-right-now) and [§8](#8-decisions-owed-by-the-owner). When this document and a repo's own contract disagree, **the repo's contract wins** — flag the disagreement, do not resolve it silently.

Package contents (this folder):
| File | Purpose |
|---|---|
| `00-MASTER-ROADMAP.md` | **This file** — program plan, numbering decoder, current position, hard decisions, gates, decisions owed. |
| `01-CURRENT-STATE.md` | Reconstructed current state of every repo & track (branch/HEAD/clean-dirty, milestones, verified tests). |
| `02-FEATURE-LEDGER.md` | What is built / in-flight / authorized-not-started / deferred (non-goals) / long-range. |
| `03-CONTRACT-REGISTRY.md` | Every contract & interface: build-contract, D-12 economy, presentation read-models, StudioLotSnapshot/Renderer, the Gate-D compatibility matrix, ruling index. |
| `04-EVIDENCE-INDEX.md` | Where truth lives — every source location, its authority, and read/write status. |
| `05-RULINGS.md` | **Owner rulings ledger** — explicit rulings quoted verbatim, newest first. Authoritative; overrides any other doc on conflict. |

---

## Source precedence — the meta-rule (owner ruling R-2026-07-27-A)

Before reading anything below, know **which source governs which question**. Per owner ruling, each governs its own domain; genuine conflicts are **escalated to the owner, never resolved silently** (full text + application notes: `05-RULINGS.md`):

1. **Accepted Build Contracts** → currently authorized simulation mechanics + implementation scope.
2. **Visual Charter** → long-range presentation intent, visual identity, final-product aspiration — and it **does not** independently authorize mechanics, integration, or implementation.
3. **Master Roadmap** (this package) → sequencing, proof milestones, dependencies, authorization gates.
4. **CURRENT-STATE** → what presently exists in repos + what is in flight.

Only the **Build Contracts** (mechanics/scope) and the **Roadmap** (gates) authorize work; the **Charter** never does. On a genuine conflict between sources: **stop and return it to the owner** — do not pick a winner.

---

## 1. What Project: Studio is

A **modern spiritual recreation and expansion of Lionhead Studios' _The Movies_** (2005): construct and operate a physical studio, watch the lot grow, populate it with talent and crew, develop scripts, cast, rehearse, build and use sets, watch filming, shape the movie, manage star careers, market and release, and see a visible legacy. Internal studio identity name: **Meridian Pictures**.

The build splits cleanly into two owned tracks. Keeping them separate is the load-bearing architectural decision of the whole program.

```
                 AUTHORITATIVE ENGINE STATE   ← Engine Room owns ALL sim truth
                          │
                 SHARED PRESENTATION DOMAIN    ← read-only projection + player intents
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
      OVERVIEW PROJECTION        3D PROJECTION
              ▼                       ▼
        2.5D / UI VIEW          3D / CINEMATIC VIEW
```

- **Engine Room** (the sim core, repo `/Users/bruce/The Movies`) owns money, ratings, schedules, capacity, staffing, talent state, production progress, outcomes. Pure `(state, actions) => state`; seeded RNG only; no React/DOM/I/O below the harness boundary.
- **Presentation** renders a read-only snapshot and returns player intentions. **The renderer owns no game truth.** A shared presentation domain does **not** require every renderer to consume an identical final snapshot (this is what makes a 2.5D overview and a 3D cinematic view coexist over the same data).

---

## 2. The numbering decoder (READ THIS — five independent numbering systems)

The single largest source of confusion for a fresh terminal. These do **not** map onto each other:

| # | System | Where it lives | Meaning of its numbers |
|---|---|---|---|
| **A** | **Build-contract phases 1–6** | `The Movies/docs/build-contract.md` §12 | Sim engine build order. **1–4 = M0A headless (DONE).** 5 = M1A UI *(needs approval)*. 6 = Broadcast presentation *(needs approval)*. The **"approved for phase 5" hard stop** lives here. |
| **B** | **Milestone track M0A → M1A → M0B → V1** | `The Movies/ROADMAP.md`, `HANDOFF.md` | Product milestones. **M0A** = phases 1–4 (PASS). **M1A** = the playable film laboratory (phases 5–6); this is the milestone actually in progress. Its gate is the **"is it fun?" owner playtest**. |
| **C** | **Owner rulings D-1 … D-12** | `docs/rev4-open-questions.md`, `docs/D-12-economy-contract.md` | Cross-cutting design decisions. E.g. D-6 (standing repair, unblocked M0A), D-11 (studio employment), **D-12 (studio economy, in flight)**. |
| **D** | **Presentation gates: Concept → Lot Passes 1–4 → 3D Gates A/B/C → Gate D → Gate E** | Desktop packages + the two spike repos | Separate throwaway presentation experiments. Concept phase **APPROVED**; 2.5D lot frozen at **Pass-3** (Pass-4 failed review); 3D spike **Gates A/B/C all PASS**; **Gate D** (hybrid integration readiness) **AUTHORIZED but HELD**; Gate E (ship) is later. |
| **E** | **Charter phases 1–36 + prototype sequence V0–V9** | `PROJECT-STUDIO-VISUAL-CHARTER.md` | The **long-range** final-product visual/3D program. **Not started.** The charter's own immediate ask is a 20-section *review report*, not a build. |

**Rule of thumb:** "Phase 5" almost always means system **A** (the sim UI hard-stop) *or* the milestone-track UI work under **B**. "Gate D" is system **D** only. "V4" is ambiguous — it usually means **SaveFileV4** (a D-12 save-schema bump), *not* charter prototype **V4** (character/animation proof). Disambiguate before acting.

---

## 3. Current position — one-screen snapshot

*(Full detail in `01-CURRENT-STATE.md`. Verified live 2026-07-27.)*

| Track | State |
|---|---|
| **Sim engine (main repo)** | Branch `phase-5.2-economy` @ `0f9e4bd`, **DIRTY (~32 paths, actively changing).** The **D-12 "Studio Economy & Theatrical Runs"** milestone is coded in the working tree but **uncommitted and gated on owner approval** (contract status: *"NOT yet implemented"*). |
| **Tests** | **GREEN — 49 files / 767 tests pass, 0 fail** (real `vitest run` on the current D-12 tree, 2026-07-27). D-12 economy tests pass; M0A byte-identity holds; the "no Broadcast in UI" guard passes. |
| **Milestone** | M0A **PASS** (phases 1–4). M1A **in progress** (Phase-5 UI shipped; 5.1 talent; 5.2A employment/D-11; 5.2A Cycle-4A committed; **Cycle-4B = D-12 economy in flight**). `main` = `eb9dd43` (Phase-5.1 merge); later work sits on unmerged branches. |
| **2.5D lot spike** | `studio-lot-spike` @ `3806ef6`, **clean.** Frozen at **Pass-3**; Pass-4 authored-asset upgrade **failed independent review and was reverted**. |
| **3D visual spike** | `studio-3d-visual-spike` @ `591f3aa`, **source clean** (only re-captured PNGs dirty). **Gates A/B/C all PASS** on owner hardware (~120 fps). Conclusion: **USE HYBRID PRESENTATION.** |
| **Art direction** | Meridian concept phase **APPROVED** (warm golden-hour 1940s–50s Hollywood; locked palette & 1.8 m scale sheet). 3D implementation **still LOCKED** pending Phase-5.1 committed + formal PM approval. |
| **Hybrid integration (Gate D)** | **AUTHORIZED but HELD** — 3 of 6 entry conditions unmet; the authorized worktree does **not** exist (correct). |
| **Charter (visual program)** | Long-range guide only. **No V-sequence work started.** |

---

## 4. The hard decisions (preserved — change only on recorded owner evidence)

### Product & presentation
- Project: Studio is a **modern spiritual recreation and expansion** of _The Movies_.
- **Preserve** the original's warmth, readability, charm, living-studio fantasy, visible filmmaking, talent personalities, set variety, era progression, and finished-movie payoff.
- **Do not copy** original protected production assets.
- **Do not** turn the game into photorealistic architectural visualization, a sterile dashboard, a walking simulator, or a generic asset-pack scene.
- Visual North Star (charter): *stylized, not photoreal; colorful without childish; readable from a management camera; expressive in close-up; a warm "living studio diorama."* Approved identity: **"a warm, golden-hour, stylized 1940s–50s Hollywood studio you own."**

### Architecture
- The **Engine Room owns all authoritative simulation truth.**
- **Presentation renders read-only state and returns player intentions.**
- **The renderer owns no simulation truth.**
- A shared presentation domain **does not require every renderer to consume an identical final snapshot.**
- One-way pipeline: `ENGINE STATE → ADAPTER → IMMUTABLE SNAPSHOT → RENDERER/UI/AUDIO/CINEMATIC → PLAYER INTENT → ENGINE COMMAND`. Animation/materials/effects may *represent* sim state but must never *become* a second source of it.
- Sim core stays pure; **seeded RNG only, no `Math.random` anywhere**; constants live in `TUNING`; every bounded term has a range test.

### Presentation strategy (from the 3D spike + hybrid decision)
- **USE HYBRID PRESENTATION**: a 2.5D / renderer-neutral overview as the default, with **selective 3D for close production moments**. Ship staged: **2.5D "Complementary Studio Overview" first (behind a flag), 3D close-view later.**
- **Full-3D migration is REJECTED** ("replace the main app" trap).
- Any presentation layer is **additive, flag-gated, lazy-loaded**, imports nothing from `src/core`, and **never changes the save format** (snapshots are transient, never serialized).

---

## 5. How the tracks relate (the program spine)

1. **Prove the game is real (Engine Room).** Phases 1–4 → M0A (done). Then M1A: make it *playable and fun* through the UI. D-11 (employment) and **D-12 (economy)** are M1A operating-layer milestones that make money and staffing *matter per decision*.
2. **Prove the game can look right (Presentation), in isolation, without touching the sim.** Concept art (approved) → 2.5D lot spike → 3D spike (Gate C PASS) → the recommendation to go hybrid.
3. **Only after the management loop is judged fun** do the two tracks converge, via **Gate D** (a read-only adapter + unified contract + flag), and only then **Gate E** ships the overview to players. The charter's 36-phase visual program is the horizon beyond that.

The **fun gate** (a human playing M1A and wanting to open it again) is the hinge: it gates both D-12 final sign-off *feel* and the shipping of any presentation layer. It is answered by a person, not a model or a test.

---

## 6. Governance findings (things a fresh terminal must know / owner should resolve)

1. **The main sim tree is a *moving base*.** Uncommitted D-12 paths grew 24 → 30 → 32 during this session — a parallel sim-track session is actively editing it. Do **not** assume a stable HEAD or dirty set. This is exactly the "moving main" hazard the retrospective and Gate-D docs warn about; it is one reason Gate D is HELD.
2. **The protection guard is deprecated by owner ruling and currently RED.** `The Movies - 3D Visual Spike/tools/verify-protected.mjs` pins main at an exact HEAD (`0f9d23d`); main legitimately advanced to `0f9e4bd`, so it prints `✗ protected baseline drift`. Owner ruling **R-2026-07-27-B** deprecates the exact-HEAD check and specifies a **structural-isolation replacement** (six requirements — see `05-RULINGS.md`), but **forbids implementing it while main is dirty or D-12 is actively changing relevant files** — both true now — so the replacement is **recorded but deferred/blocked**. Exact pins remain valid for the genuinely frozen spikes. This retires the false-positive tripwire *in principle*; the Gate-D entry-condition-#2 block persists until the replacement exists **and** the moving base clears.
3. **Charter framing nuance.** The task brief describes the visual charter as *"not an immediate implementation contract."* That characterization is **directionally correct** (it is long-range and its immediate ask is a review), but the exact phrase does **not** appear in the charter. The charter's own words: it is a *"visual-production azimuth check and roadmap review,"* *"not a blank-slate art-direction exercise,"* and *"Do not begin a broad implementation pass until this review is complete."*
4. **Charter vs build-contract authority — RESOLVED (owner ruling R-2026-07-27-A).** Source precedence now governs: Build Contracts own authorized mechanics + scope; the Visual Charter owns long-range presentation *intent* only and **cannot authorize mechanics, integration, or implementation**; the Master Roadmap owns sequencing + gates. The charter never greenlights a build — a V-sequence start needs a build-contract/roadmap gate, not the charter's authority. Genuine source conflicts escalate to the owner, never resolved silently. (See the "Source precedence" meta-rule above and `05-RULINGS.md`.)
5. **"Approved for phase 5" vs reality.** The build-contract's literal hard stop ("do not begin phase 5 until the owner says the words *approved for phase 5*") still stands in the docs, yet Phase-5 UI, 5.1, 5.2A, and D-12 already exist on branches — each authorized by its *own* later owner ruling (Phase-5 directive, D-9/D-10, D-11, D-12). The program is past that original gate; the gate that now matters is the **owner playtest / fun gate** and per-milestone owner approvals.
6. **Concept-phase co-sign still open.** The art-direction review passed, but the reviewer also authored the brief; a **fresh human reviewer co-sign** is recommended and not yet recorded. Formal PM approval of the concept package (one of the two 3D-unlock preconditions) is likewise not recorded.
7. **Brief truncation.** The task brief this package answers **terminated after the §2 architecture diagram**. Structure here follows the brief's title (Program Plan / Current State / Feature Ledger / Contract Registry). If later sections specified a different deliverable format, reconcile against them.

---

## 7. What is authorized / held / forbidden right now

**Authorized & in progress (owner-gated per milestone):**
- D-12 economy milestone — coded, awaiting the owner checkpoint that "Commit 2" is gated on ([I] integrated-engine + [H] playtest reruns still pending).

**Authorized but HELD (do not start):**
- **Gate D — Hybrid Integration Readiness Spike.** Deferred-start, in a *new* worktree that must not exist yet. Blocked on: owner-named clean Phase-5.2 base HEAD; sim track confirmed paused; lot promoted onto the roadmap with its own contract. 3 of 6 entry conditions unmet.

**Not started (correctly):**
- **OC-01** (3D camera-occlusion) — recorded non-blocking backlog.
- Charter prototype sequence **V0–V9** and any 3D implementation.
- Any hero-character pipeline (Kenney crew is background-only).

**Forbidden without explicit new owner authorization:**
- Merging any spike or presentation layer into `main`, or touching `src/core` from a renderer.
- Full-3D migration; expanding the whole studio; shipping a player-facing 3D flow.
- Any change to the save format for presentation; introducing `Math.random`.
- Building any **§11 non-goal** (see `02-FEATURE-LEDGER.md` — includes *the lot, visual output, the studio economy beyond D-12's authorized slice, rival studios, awards, era progression, LLM integration*, etc.).

---

## 8. Decisions owed by the owner

**Blocking now:**
- **Approve (or revise) the D-12 economy contract** so Cycle-4B can commit. Sub-items: confirm `FAME_REACH_HALF_SAT` (K=50) and `STUDIO_RENTAL_BLENDED` (0.52) after the [I]/[H] reruns; the runway-reserve question (current-commitments-only vs include planned greenlight).
- **Name the clean Phase-5.2 base HEAD** and **confirm the sim track is paused** if/when Gate D is to proceed.

**Blocking the next milestone:**
- **Fun gate**: play M1A; decide whether the management loop earns continued investment (and thus whether any presentation layer ships).
- **Formal PM sign-off of the Meridian concept package** + a fresh-reviewer co-sign (a 3D-unlock precondition).

*(Resolved 2026-07-27: charter-vs-build-contract authority — owner ruling R-2026-07-27-A, `05-RULINGS.md`. The charter cannot authorize work; only Build Contracts + Roadmap gates do.)*

**Safe to defer:**
- Gate D start; Gate E (ship Stage B overview); OC-01; hero-character pipeline; the charter's 20-section visual review; late-game money-scarcity design (D-12 accepts the runaway as a known, disclosed limitation).
- The **protection-guard structural replacement** (owner ruling R-2026-07-27-B) — **blocked** until main is clean and D-12 has landed; do not implement before then, and only in an explicitly authorized spike-tooling session.

---

*Evidence provenance for every claim above is indexed in `04-EVIDENCE-INDEX.md`. This document was produced read-only; no repository was modified.*
