# C2 ADVANCE PLANNING — SHARED BRIEF (read this first)

> Session: Fable C2 Architect, 2026-08-18. Branch `c2-sets-throughput-plan`,
> worktree `/Users/bruce/The Movies - C2 Planning`, base = sealed C1 `main` @ `f294077`.
> **PLANNING ONLY. No production implementation. No file outside `docs/c2-planning/`
> may be created or modified by any planning agent.** The PF1 worktree
> (`/Users/bruce/The Movies - Professional Floor`) and branches
> `professional-floor-v1*` are NEVER touched — PF1 is in flight there.

## Mission

Freeze an implementation-ready campaign charter for
**C2 — SETS, STAGES & PRODUCTION THROUGHPUT + FOUNDING FLIP**, so that when PF1 seals
and the Owner says GO, Opus implementation starts immediately.

Player feeling target: *"I built this movie studio, and I can physically watch it
manufacture multiple movies."*

## Owner laws already decided (binding; from the 2026-08-18 launch order)

1. **Concurrency comes from physical capacity.** The `MAX_CONCURRENT_PRODUCTIONS: 2`
   ceiling (`src/core/tuning.ts:50`, enforced `src/core/actions.ts:332`) is
   transitional. Throughput must emerge from real resources: development/casting
   capacity, writers, stars, crew, stages, Sets, support, layout/travel.
2. **When capacity is unavailable: QUEUE, DON'T MAGICALLY FORBID.** The player must
   know what is waiting, what it needs, what occupies it, and how to relieve the
   bottleneck.
3. **Sets are real production resources** — buildable, placeable, reservable,
   occupiable, genre-weighted, physically used for rehearsal/shooting.
4. **Stages are player-built production capacity.**
5. **Engine state owns reservations and outcomes. Animation is evidence only.**
   (Consistent with standing laws 1–3 in `docs/SHIFT-OPERATIONAL-LAWS.md`.)
6. **The Founding Flip is RATIFIED.** The eventual fresh studio starts with ~Gate,
   Administration/Staff Office, minimal roads/infrastructure, empty buildable land.
   C2 performs the Flip once every required first-movie facility has a legitimate
   build path. If safety requires, recommend C2a (Sets/Stages/Throughput)
   immediately followed by C2b (Founding Flip), before C3.
7. **Premiere Night V1 belongs to C2.** No movie footage yet.
8. **Simulation theater belongs to C2.** Visible activity must correspond to
   authoritative work: people travel because work exists; scenery arrives because a
   production needs it; stages become occupied because filming occurs; queues are
   physically meaningful; wrap releases resources. No decorative screensaver
   population.
9. **Time Model docket:** compare (A) current discrete model, (B) Living Turn —
   the Owner's preferred hypothesis to investigate FIRST, not yet product law,
   (C) continuous simulation. Evidence may defeat B (PF1 charter §11.2).

## Baseline facts (verified this session)

- Canonical `main` = C1 seal `f294077` ("Campaign 1 KEEP"). C1 shipped: unified
  facility identity (nine fixed buildings → founding placements, IDs preserved),
  facility catalog families on the placement engine, Move & Demolish V1
  (player-built only), expandable-property architecture (parcels as data),
  declarative unlock schema (cash-only active), visual warmth pass. Save = **V13**.
- PF1 (Professional Floor v1) is being implemented NOW on
  `professional-floor-v1-fresh` (charter frozen 2026-08-18, canonical). It is
  ui-only: AudioService, cue grammar over `SimStopReason`, prefs, settings, save
  presentation, dialog replacement. **`src/core` untouched in PF1; no V14.**
  C2 planning must assume PF1's charter as the delivered baseline and note
  robustness if a PF1 milestone is KILLED.
- PF1 charter §9/§10 routes to C2: Premiere Night V1; simulation theater; the Time
  Model Ruling Docket; the event-model docket (engine emits no events today — UI
  diffs state; C2 decides ONE model: persisted ledger vs transient emission);
  the authoritative **wrap** transition (shooting → post does not exist today);
  and the recorded C1 seams F2 (unengageable effect buildings), F3
  (demolish-for-refund timing), F4 (whole-board-idle commission eject), the
  480×270/DSF2 below-fold placement, and the `FilmResult.releaseTick`
  off-by-one-week copy.
- Master plan v1.1 (`THE-MOVIES-PARITY-MASTER-PLAN.md`, on main) governs: §6
  (Founding Flip staging + FMJ survival strategy + landmark classification), §7.2
  (C2 scope sentence), §8.2 (headline acceptance), §10 (Owner decisions — note
  amendment: concurrency principle ruled; specifics were "still required" and are
  now partially supplied by the laws above).
- Operational laws: `docs/SHIFT-OPERATIONAL-LAWS.md` (esp. 1–3 engine/world
  boundary; 18–21 save/identity; 22 capacity/occupancy is ONE union; 23
  determinism; 25 structural pins; 27a Soundstage-12 adjacent-plate NO-GO —
  never butt new plates against the Stage 7 painting; 28 process).
  NOTE: its trailer's "Current save = V11" is stale (V13 is current; PF1-M2
  corrects the doc).

## Evidence corpus (read-only, cite precisely)

`/Users/bruce/Desktop/Big Swing Art/`:
- `THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md` — the Bible (35-row parity matrix §38).
- `THE-MOVIES-2005-ORIGINAL-DATA/` — `set_catalog.csv`, `scene_catalog.csv`,
  `facility_catalog.csv`, `original_formulas.json`, `movie_rating_pipeline.json`,
  `ACTIVE-UNRESOLVED-QUESTIONS.csv`, `source_conflicts.csv`, validator
  (74/74 clean per master plan).
- `THE-MOVIES-2005-TECHNICAL-ARTIFACTS/` — `set_definition_schema.csv`,
  `facility_candidates.csv`, `prop_blueprint_schema.csv`, `schema_fields.csv`,
  `dormant_or_unconfirmed_fields.csv` (32/32 clean).
- Prima eGuide, GameFAQs guides, manual PDF, screenshot corpus.
- `PROJECT-STUDIO-COMPARATIVE-DESIGN-REGISTER.md`, source/artifact registers.

**Original numeric values are evidence, not spec** (master plan §11). We rebalance
in our own economy; the *shapes* (schemas, gating patterns, decay families) are the
recoverable truth.

## Repo pointers

- Engine: `src/core/` (pure, seeded RNG only, TUNING constants). Key files:
  `types.ts`, `tick.ts`, `actions.ts`, `operations.ts`, `productionIdentity.ts`,
  `lot.ts`, `placement.ts`, `construction.ts`, `presence.ts`, `save.ts`,
  `tuning.ts`, `worldgen.ts`, `firstFilmJourney.ts`, `studioCalendar.ts`,
  `facilityEffects.ts`, `economyView.ts`.
- UI/world: `ui/src/` (adapter at `ui/src/adapter.ts`; lot renderer
  `ui/src/lot/`; screens).
- Governing docs live in `docs/` (WORLD-FIRST-* contract/closure/evidence trios,
  PRODUCTION-OPERATIONS-V1, SCENERY-LOAD-IN-V1, FACILITIES-CONSTRUCTION-RESEARCH,
  D-17A/B economy, `docs/economy/C1-ECONOMY-SNAPSHOT.md`).
- Campaign logs: `LOT-CONTENT-EXPANSION-LOG.md` (C1), `FIRST-MOVIE-JOURNEY-LOG.md`.
- The repo path contains spaces — always quote paths in commands.

## Planning-agent rules

1. READ-ONLY everywhere except your assigned report file under `docs/c2-planning/`.
2. No implementation, no scaffolding, no TODOs in code, no test edits.
3. Every load-bearing claim cites `file:line` (code) or file+row/section (corpus).
4. Distinguish **observed in code**, **corpus evidence**, and **proposal** — never
   blur them.
5. If you find the brief, master plan, PF1 charter, or code contradicting each
   other: report the contradiction loudly in your report's "risks/gaps" section.
   Do not resolve it silently.
6. Do not launch further research campaigns; answer only your lane's questions.
