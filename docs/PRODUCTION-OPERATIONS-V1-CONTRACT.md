# Production Operations V1 Contract

Status: autonomous-marathon implementation contract  
Date: 2026-08-13  
Authority base: accepted D-17B plus Operation Hollywood integration

## Purpose

Replace the player's fire-and-forget eight-week production countdown with the
smallest authoritative operating loop that can support a professional studio
management game. This slice makes phases, facility reservations, a real director
assignment, a scenery blocker, and the shooting decision deterministic and
saveable. It does not attempt to certify macroeconomic balance or finish the
facility/construction game.

## Compatibility boundary

D-17B remains an accepted bounded economy repair. Its corpus, headless agents,
and migrated saves retain the exact legacy countdown unless managed operations
are explicitly activated. This slice does not alter D-17 constants, reception,
standing, theatrical revenue, payroll, overhead, development, FilmShape,
greenlight perception locks, or the six-week run.

SaveFileV1 through SaveFileV7 are frozen. SaveFileV8 adds operations state. A
V7-to-V8 migration records `legacy` mode with no facilities or workflows; it
does not invent production history, reservations, tasks, or construction.

New studios founded through the player UI activate managed operations only
after the founding draft closes. Core/harness callers that use `foundStudio`
alone remain on the legacy path. Activation is legal only for a founded,
economy-engaged studio with an empty production slate.

## Eight-week phase law

`remainingTicks` remains the release clock and `TUNING.PRODUCTION_TICKS` remains
eight. On an on-schedule managed production, the mapping is:

| Remaining ticks | Phase | Scheduled duration |
| ---: | --- | ---: |
| 8 | Development | 1 week |
| 7 | Pre-production | 1 week |
| 6 | Rehearsal | 1 week |
| 5–4 | Shooting | 2 weeks |
| 3–2 | Post-production | 2 weeks |
| 1 | Release Ready | 1 week |
| 0 | Existing release pipeline | — |

The greenlight tick keeps the existing skip-first-tick rule. With every required
decision completed before the next weekly advance, release timing is unchanged.
A blocked production holds its own countdown while the world, contracts,
payroll, overhead, awareness drift, and theatrical runs continue normally.

## Initial facility truth

Activation creates these authoritative capabilities with no new cost:

| Facility | Capability | Capacity |
| --- | --- | ---: |
| Development & Casting | `development-casting` | 2 |
| Soundstage 7 | `soundstage` | 1 |
| Soundstage 12 | `soundstage` | 1 |
| Scenery Shop | `set-scenery` | 2 |
| Post Building | `post` | 2 |

Facilities and reservations are engine state. Allocation is deterministic in
ascending facility ID and slot order, and never overbooks a slot. A soundstage
reservation is retained from Rehearsal through Shooting so the physical stage
identity does not jump between weeks.

Phase requirements are:

- Development and Pre-production: Development & Casting;
- Rehearsal: one Soundstage;
- Shooting: the retained Soundstage plus Scenery Shop;
- Post-production: Post Building;
- Release Ready: no facility reservation.

If a required capability has no free slot, the transition is held with an
authoritative capacity blocker. Reservation changes are atomic: a failed
transition retains the current phase's reservations.

This is infrastructure, not a cash sink. Construction prices, operating costs,
facility quality, upgrades, and expansion choices remain open until measured in
the richer studio.

## Authoritative shooting decision

Entering Shooting creates one task for the production's real locked director
and reserved soundstage.

1. `unassigned`: the director has not been dispatched.
2. Assigning exactly that production's director creates the authoritative
   `scenery-load-in` blocker.
3. Clearing the blocker makes the task `ready`.
4. Calling/scheduling the take makes it `scheduled`.
5. The next weekly tick marks it `completed` and advances the first Shooting
   week. The second Shooting week then advances normally into Post-production.

Illegal or stale actions reject loudly and leave state byte-identical. Task
actions do not touch cash, standing, ledger, market week, or RNG state.

The Hollywood district may animate these facts and emit player intent. Phaser
wall-clock time, actor coordinates, the baked plate, and ambient behavior never
change authoritative task status.

## State and cleanup invariants

- Managed active productions have exactly one workflow; workflows never exist
  without an active production.
- Workflow phase agrees with `remainingTicks`.
- Every reservation references an existing facility, capability, legal slot,
  owning workflow, and current phase.
- No `(facilityId, slot)` pair is reserved twice.
- A Shooting task references its owning production and the production's real
  director; its destination is that production's soundstage reservation.
- Cancel and release remove the workflow and all its reservations.
- Processing order is ascending production ID using plain string comparison.
- No operations transition consumes the simulation RNG stream.

## Player-facing read boundary

React receives an operations read model, never `GameState`. The first Production
Board exposes film title, phase, weeks remaining, current facility, assigned
director, blocker/consequence, and the currently legal command. It must label
the existing cycle break-even assumption as on-schedule when a hold can extend
fixed costs.

For managed productions, Studio Lot locations come from facility reservations:
Development lights Development/Casting, Rehearsal and Shooting occupy the
reserved soundstage, Post lights Production/Post, and Release Ready points to
the theater. Legacy stage assignment remains a labelled presentation fallback.

Hollywood must show an idle studio when no authoritative production exists. It
must not invent Mara Voss, *The Violet Hour*, a shooting phase, scenery counts,
or take completion.

## Explicitly open after V1

- manual scheduling and priority between productions;
- construction, expansion, facility purchase and operating cost;
- facility quality, maintenance, staffing, and upgrades;
- differentiated sets, scripts, casting sessions, rehearsals, edit choices,
  reshoots, and release-date strategy;
- natural size-scaling capital costs and remeasurement of economy residuals;
- replacing the remaining legacy presentation path after migrated-save policy is
  explicitly settled.

No financing, loans, bailouts, restructuring, hard bankruptcy, or failure ladder
is authorized by this contract.
