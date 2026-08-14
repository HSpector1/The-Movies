# World-First Selected Stage 7 Production Detail Handoff & Fresh Return V1 Evidence

Status: **IMPLEMENTED, VALIDATED, AND RETAINED ON THE AUTONOMOUS MARATHON BRANCH**

Date: 2026-08-14

Branch: `operation-hollywood-autonomous-marathon`

Contract authority: `05d2d44b387cdfb9d4daeaffd37902f5ba0c9065`

Implementation authority: `6a3f85f2c991b850f065b4fd81ef60a5974a256a`

## Keep ruling

World-First Selected Stage 7 Production Detail Handoff & Fresh Return V1 passes its bounded Keep
gate.

The retained player loop is:

```text
EXPLICIT PHYSICAL / STATUS / PROBLEM / NATIVE STAGE A INSPECTION
→ EXACT CURRENT STAGE 7 PRODUCTION
→ EXISTING WORLD COMMAND FIRST
→ OPTIONAL OPEN PRODUCTION BOARD DETAILS · <EXACT TITLE>
→ EXACT UNIQUE CURRENT BOARD CARD
→ OPTIONAL EXISTING BOARD COMMAND
→ DIRECT BACK
→ FRESH EXACT STAGE 7 OR NEUTRAL LOT
```

The world remains the discovery, inspection, and primary action surface. Production Board is a
supporting deep-management surface reached only after explicit world provenance proves which film
the player is inspecting. Default Studio Desk orientation, the generic production rail, person
selection, Stage 12, and global Dashboard entry do not expose this handoff.

## Shared Stage 7 authority

One pure `stage7ProductionDetailContext(snapshot)` selector now owns Stage 7 detail identity for
both the Phaser-facing and React-facing paths. It accepts only managed Production Operations with
Engine stage-assignment authority, exactly one `stage-a` operation, and a production ID unique
across the complete operations array.

The selector validates existing projected fields rather than rebuilding production law. It
requires exact rehearsal/shooting phase truth; non-empty production, title, facility, Director,
phase and status identity; safe countdown/progress; closed task, attention, blocker, and command
discriminants; complete optional Lead identity; exact command production identity; and exact
Director identity for `assignShootingDirector`.

Legacy, presentation authority, missing arrays, zero or duplicate Stage 7 rows, duplicate IDs,
Stage 12-only state, wrong phases, malformed fields, half-present Lead identity, and contradictory
blocker/command data return `null`. Array order, same-title films, and prior UI state cannot select
or substitute a production. The selector mutates nothing and consumes no RNG.

`HollywoodScene` uses that same selector for its Stage 7 status, lamp, physical selection, and
host-selection checks. The old first-match presentation seam is gone. Missing or malformed world
authority paints no false outline and emits no selection event; the native Stage A control remains
the complete semantic fallback.

## Explicit world provenance and action priority

`StudioLotScreen` owns a separate transient Stage 7 detail provenance token. It is granted only by
the physical Stage 7 production event, its status/problem affordance, the exact world blocker, the
native Stage A companion, the same-production Scenery & Service continuation, or an exact typed
return from Production Board.

Generic production auto-orientation and selection are deliberately insufficient. Selecting an
unrelated person, building, place, production, publicity context, Annex, or another film's scenery
context clears the token. Removal, release, relocation, replacement, duplicate identity, malformed
truth, authority loss, or studio replacement clears it without selecting a new occupant.

Only exact current provenance exposes the secondary native action:

```text
Open Production Board details · <exact current title>
```

The existing `assignShootingDirector`, `clearSceneryLoadIn`, or `scheduleShootingTake` world command
remains before it in visual, DOM, and keyboard order. When no command is legal, current Stage 7
status remains the primary result and Board detail remains optional.

## Field-exact handoff and Board ownership

At activation, the Lot compares every field that rendered the action with a freshly selected
context from the latest snapshot: production/location identity, title, phase/label, countdown,
progress, facility, Director, optional Lead, task, status, attention, blocker, and command. Any
change calls no navigation owner, clears stale eligibility, announces the change, and focuses fresh
Stage 7 truth or the neutral Lot heading.

After that check, the Lot emits only identity:

```text
{ productionId, locationBuildingId: 'stage-a' }
```

App independently reads `latestStateRef`, rebuilds the current managed Engine snapshot, calls the
same selector, and requires exact identity before opening Dashboard with `focusProductionId`.
Opening and returning are byte-neutral navigation; no cached operation or Board card crosses the
boundary.

Production Board now filters by exact production ID. Exactly one match focuses its current command
or persistent status. Missing or duplicate matches focus the stable Production Board heading.
Title, array order, and first-card position never own focus. Existing Board commands and their
successors are unchanged.

## Typed fresh return

App carries one discriminated transient return arm whose `stage-7-production` variant requires the
exact production ID. Direct **Back to Studio Lot** remounts the Lot against current App-owned state;
the Lot reruns the selector rather than replaying the prior operation.

If the same exact ID remains the unique Stage 7 occupant, return restores fresh inspector copy,
the semantic Stage A context, stable heading focus, and the physical outline when the current
renderer becomes ready. An accepted Board Clear command therefore returns to the real ready-to-
schedule successor, not the blocked pre-navigation record. No prior travel, scenery, take, or
announcement animation is replayed.

If the old ID is absent, released, relocated, replaced, duplicated, malformed, cross-studio, or no
longer uniquely at Stage 7, return lands on the neutral Lot heading. It never selects the new Stage
7 occupant. Unrelated Dashboard child navigation demotes this return arm to ordinary Studio Home;
existing publicity, Annex, selected-building, week-advance, release, and Dashboard paths retain
their prior ownership.

## Input, lifecycle, accessibility, and layout

Pointer/touch identity is latched at the first accepted down boundary and consumed once. A
compatibility `mousedown` after React repaint cannot retarget the pointer gesture. Pointer cancel,
modal suspension, hidden tabs, renderer failure/readiness, dynamic-import failure, selection loss,
and context clearing cancel in-flight identity. Only an actually interrupted pointer/touch gesture
suppresses its later physical compatibility click; a fresh virtual-AT `click(detail=0)` remains
valid.

Enter and Space are owned synchronously on keydown with `preventDefault`, repeat guards, and exact
latest-context validation. A later synthetic click cannot reopen Dashboard. Double-click, mixed
input, callback rejection, and changed snapshots invoke App at most once or fail closed.

The detail action is a native button with the exact title in its accessible name, at least 44 CSS
pixels high, a visible focus ring, and forced-color treatment. Stage 7 title, phase, facility,
status, blocker, and action order remain textual rather than color-only. The semantic Stage A
companion exposes `aria-current` when it owns the exact context without inventing persistent
selected-building state.

Real Chromium acceptance retained complete reachability at 1366×768, 1024×768, 960×540, maximum
world zoom, CSS magnification, and a 480×270 CSS viewport at device scale factor 2 as the effective
200% layout proxy. The living lot remains visible and actionable around the supporting inspector;
the deep-detail action never replaces it with a screen-first list.

Eleven final screenshots under `out/world-first-stage7-production-detail-handoff-v1/` were visually
reviewed. Independent authority, test-gap, and accessibility/visual audits reported no unresolved
P1–P3 findings.

## Deterministic evidence and exact successor

The existing native public-action SaveFileV11 corpus was replayed without modification. Every save
and manifest reported `unchanged`:

| Evidence | SHA-256 |
| --- | --- |
| Stage 7 blocked | `7534518e4db3970bb4ca988b0b0fa78975f5053ee67fd42377f69b80ebe711dc` |
| Stage 7 ready | `6760b72739608e930da84726067685c515d87817cb3793f9d9d37fa9f2063f92` |
| Stage 7 scheduled | `e922f9b7e957388bed7c7674be8c17596245823200e478371dc7ff970458f46b` |
| Stage 7 unassigned in-memory proof | `2b352e3ef1be5ab9d5e0ba0abfbeb6c0a717f5334afe7d6a60ff5a81cef584ca` |
| scenery manifest | `eee8dd476f3117dccc3c48985797e4a248827fb19b5a15d5c8a125b6c04780e4` |
| live-week manifest | `3f06eb81957c5f49fa5be3b8b0d3239e9c3305426b266be19ac5bf224b24905e` |

The browser Board-clear journey asserts that its exported successor is byte-for-byte equal to the
existing ready fixture. Pure handoff, focus, direct Back, renderer rejection, and keyboard journeys
leave the complete serialized state unchanged.

The Annex native generator also replayed byte-identically, retaining Available
`4026c51603afe35605a9d5a71391764cd6dfea3972ef3a8d20ef3b3987dc4652`, script Working
`cb49f61ac81d239b14db744fdc7b37b91ccd507e8f0e4a8fda56e802bd96bdc4`, production Working
`d7213ae7c064ad59ac685a777042b0b237d9ce1c367a9af3b9d754cb25b8044e`, and manifest
`43c40208b58f365c726eb1ddba88359e8ba9be3890b400ab92db9b2c47dba8cf`.

## Performance, assets, and behavior boundary

This navigation slice adds zero textures, atlas frames, display objects, actors, routes,
animations, simulations, or renderer draws. The governed one-production 240-sample structural
reference remains exactly:

```text
display objects:         34
dynamic actors:          15
decoded texture bytes:   11,096,896
renderer draws:          1
```

The milestone changes no Core, GameState, SaveFileV11, schema, migration, adapter business law,
production task/phase/blocker/command, facility/reservation/allocation, economy/publicity tuning,
RNG, ledger, district manifest, exporter, authored/generated art, or Soundstage 12 content.
Protected source/runtime manifest, exporter, concept plate, and district-art hashes remain the
accepted Annex-closure values.

The default headless host remains compositor-contended. No new absolute wall-clock pass is claimed.
The opt-in thresholds remain unchanged at at least 50 average FPS, at least 30 FPS 1%-low, and no
more than 33.4 ms p99/worst. Structural parity is not relabelled as wall-clock certification.

## Final verification

- both TypeScript projects: **passed**;
- focused selector/Scene/Board/Lot/App set: **141/141 tests passed**;
- complete repository suite: **173/173 files, 2,310/2,310 tests passed**;
- governed D-16/D-17 harness: **10/10 files, 176/176 tests passed**;
- final combined Chromium: **35/35 passed** — Lot 20, named person 3, Annex 7, Stage 7 handoff 5;
- deterministic native SaveFileV11 generators/replay: **byte-identical**;
- structural renderer reference: **34 / 15 / 11,096,896 / 1 passed**;
- production build: **passed, 138 modules transformed**;
- `git diff --check` and protected-path non-change gates: **passed**; and
- three independent strict reviews: **no unresolved P1–P3 findings**.

The existing non-fatal large-chunk build advisory remains visible. No new economy, facilities,
construction, or Week-208 corpus is proportional to this presentation/navigation repair.

## Governing boundary

This milestone creates no new command, task, clock, queue, assignment, reroute, cancellation,
workload, facility choice, simulation, save field, second details screen, Stage 12 content, or
same-camera promise. Engine/GameState remains the sole authority; the world exposes existing truth
and the Board supports it when more detail is needed.

The governing status remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Cash runaway, top-studio economic immortality, the week-208 synchronized roster wall, P5
dominance, world-led variance, cheap-film purpose, premium-film purpose, remaining menu breadth,
and formal G12 timing remain open. No financing, loan, bailout, restructuring, failure ladder,
arbitrary cash sink, facility tuning, or macroeconomic certification follows.
