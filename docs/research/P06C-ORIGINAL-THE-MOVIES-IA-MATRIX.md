# P06C §6 — Original *The Movies* (2005) → Project: Studio — Information-Architecture Comparison Matrix

Bounded comparison (§6). Sources: the P06/P06B reference-delta docs (Lane A: official Manual pp.6-22,
Prima eGuide — base game only, no web browsing, **no pixels/trade dress**), the TS sim core, and the
visual-direction doc. Every "already does" claim is grounded in an in-repo file (cited). No assets copied.

## Matrix

| Original pattern | Purpose | What Project: Studio already does | What to adapt | What to reject |
|---|---|---|---|---|
| **Right-side script/movie cards** — small cards, one per picture, stage icon + one plain status line, genre glyph; **never a progress bar** (Manual p.6) | A persistent, glanceable home for every in-flight movie at the edge of the world | Living-Studio movie rail: per-picture rows keyed on `productionId` with `phase`/`attention`/`taskStatus`/`blocker`/`weeksRemaining` (`docs/research/P06B-LIVING-STUDIO-UX-REFERENCE-DELTA.md`; `StudioProductionRailHud.cs`, `StudioMovieRailContracts.cs` Max=6) | Row = lifecycle word + one human status line + genre glyph; group/collapse when crowded rather than shrink | Tiny cramped cards, the "add columns" spreadsheet failure, and any **naked % progress bar** |
| **Screenplay stage** — script/typewriter icon, "screenplay" wording | Show a movie exists before it shoots | `ProductionPhase 'development'`/`'preProduction'` + Script Projects; `PHASE_LABEL.development='Development'` (`src/core/studioCalendar.ts`; `src/core/types.ts`) | Reference-shape lifecycle glyph (folded-corner sheet), text at first use | Any copied original script/typewriter art |
| **Filming stage** — camera icon, "in the process of being filmed…" (Manual p.6) | Distinguish active shooting from other phases | `ProductionPhase 'rehearsal'`/`'shooting'`; projected to the soundstage (`src/core/presence.ts`; `src/core/studioWeekTheater.ts`) | Camera glyph + one-line human status; six-phase indicator that freezes + "Held N weeks" on stall | Percentage-of-completion readouts (no-percentage law) |
| **Completed / unreleased** — finished movie "whizzes away" to the Production Office (Prima p.43) | Punctuate the handoff from making to shipping | `postProduction → releaseReady`; release `authorityState` ready-uncommitted; committed shows only "releases next studio week" (`src/core/types.ts`) | One deduplicated, restrained wrap/dispatch cue marking ownership transfer | Camera fly-throughs / animated film-can travel |
| **Released / earning** — post-release chart-rank badge + pulsing "$" (Manual p.6) | Keep money-making titles in view | Released films are permanent state (`releasedFilms: FilmResult[]`, `src/core/types.ts`); theater marquee surfaces `latestReleaseTitle` (`docs/art/D1-A-VISUAL-DIRECTION.md`) | The *principle* only — a released movie stays a known object; surface via marquee, not the active rail | Earning/rank badges on the rail now — released/box-office/rank rows are **P07 scope; the rail is active-lifecycle only** |
| **Persistent movie identity** — one movie stays the same identifiable object through the studio | Continuity: the player tracks *their* picture, not a phase | Single canonical id `subjectId = filmId = productionId` (`src/core/broadcast.ts`); selected row pinned on refresh; released disappears **by exact id, never title/index/geometry** | Keep exact-id isolation as the binding law for the rail | Identity derived from title, list position, or screen geometry |
| **Details / info affordance** — right-click info bubble; blocked sets shown **red inside the movie's own info** (Manual pp.6,8,12) | On-demand depth without leaving the world | Labeled-box inspectors (STATUS / WHY IT WAITS / COMPANY / STAGE & SET, one fact per line); blocker anatomy pairs cause + one remedy; rail row = select/inspect + explicit Locate | Select/inspect + Locate replace right-click/drag; blocker "receipt" adjacent to its control, never detached | Drag-to-carry; a bare dash for an absent fact (say "No production assigned") |
| **People / Stars awareness** — rail time-shared Stars/Crew; star cards w/ 4-state activity icon + "flash the changed stat" (Prima pp.6-7,73) | Keep important people in peripheral awareness | People projected to the building of their current work each week (`src/core/presence.ts`, `attendanceForPhase`); a **compact persistent Talent entry point** is the W3/§14 target. An always-on People/Stars strip was DEFERRED at P06B — **partial** | Role-tiered info depth (richer facts for Actors) is fine; add a *compact* awareness surface (§14) | A full left roster rail as an HR game; per-person invented state |
| **Physical department ownership** — each life-stage owned by a specific building/department; finished film → Production Office (Prima pp.10-12,43) | Space *is* the pipeline — buildings tell the story | Each `ProductionPhase` maps to a `FacilityCapability` (`development-casting`/`soundstage`/`set-scenery`/`post`); a `FacilityReservation` binds `productionId + facilityId + capability + phase` (`src/core/presence.ts`; `src/core/types.ts`); building cards W4/§15 | Camera-independent shaped **state** badges + text on buildings (idle vs shooting), replacing painted-on roof text | Original building/roof art + type-only color code; spatial drag-drop hiring/assignment |

## The single RETAINED PRINCIPLE
**One named movie remains visible as it moves through the studio** — the same picture, identified by its
stable `productionId`, stays a continuously trackable object from screenplay through shooting, wrap, and
release, rather than dissolving into an anonymous phase.

## What must be REJECTED (explicit)
- Historical pixels, icons, trade dress — reproduce reference *shapes* only, never assets.
- Draggable film cans / drag-to-carry — replaced by select/inspect + explicit **Locate**.
- Tiny cramped cards + the spreadsheet-of-columns failure — group/collapse, progressive disclosure.
- Manual/Prima archive lookup as the details path — depth lives in in-world labeled inspectors.
- Proprietary art of any kind (roof-text look, chart badges, star-card art, camera fly-throughs).
- Corollaries: **no naked % progress bars**; **no released/box-office/rank/earning rows on the active
  rail** (P07).

## Honesty note
People/Stars awareness is the one weak row: the sim *places* people correctly (`presence.ts`), but an
always-on peripheral People/Stars UI strip was deferred at P06B — recorded as **partial**, addressed as
the bounded §14 surface, not invented. This matrix directly informs §7–§8 (rail grouping + row anatomy)
and §14–§15 (people + building cards).
