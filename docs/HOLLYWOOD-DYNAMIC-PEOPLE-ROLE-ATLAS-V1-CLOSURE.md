# Hollywood Dynamic People Role Atlas V1 Closure

Status: **IMPLEMENTED, VALIDATED, AND CLOSED ON THE AUTONOMOUS MARATHON BRANCH**

Date: 2026-08-14

Branch: `operation-hollywood-autonomous-marathon`

Contract: `b01edc2`

Camera normalization amendment: `0ee129c`

Asset checkpoint: `471c8ef`

Runtime implementation candidate: `66f856c72f2be033768cc435e556563681679d7e`

Evidence: [Hollywood Dynamic People Role Atlas V1 Evidence](./HOLLYWOOD-DYNAMIC-PEOPLE-ROLE-ATLAS-V1-EVIDENCE.md)

## Closure ruling

Hollywood Dynamic People Role Atlas V1 passes its Keep gate. Nine period studio roles now use one
validated four-direction authored atlas in the live Operation Hollywood district while retaining the
same named-person identities, actor counts, routes, stable IDs, DOM semantics, reduced-motion
behavior, snapshot authority, deterministic save state, and procedural failure fallback. Pointer
selection was repaired so visible people take precedence over invisible place zones.

The retained atlas is `384×1152`, 287,917 encoded bytes, 1,769,472 decoded bytes, and has SHA-256
`2790bf72909f0a8b76d2f6d2ca387f68499776ef7db44d847ed03ff28979712b`. Three independent exports
from the committed sources and manifest were byte-identical. Total decoded district, atlas,
fallback, and vehicle textures are 11,096,896 bytes, below the 12 MiB contract ceiling.

**2D Hollywood role-atlas presentation accepted; 05H/05I character production and integration
remain rejected/unauthorized.**

## Truth and behavior boundary

`StudioLotSnapshot` remains the only authoritative scene input. The change is
Engine/save/economy-neutral: no GameState field, SaveFileV11
field, action, task, facility, reservation, economic rule, random draw, or simulation clock changed.
Facing, routes, ambient motion, and atlas frames remain disposable presentation state. Route arrival
cannot advance work.

Original source pixels, full prompts, generation/edit result IDs, hashes, crop boxes, and rights
basis are retained in the repository. The committed pixels are the source authority; image
generation is not a build or runtime dependency. No third-party game art or rejected 05H/05I asset
entered the atlas.

## Acceptance proof

- focused Role Atlas/runtime tests: **37/37 passed**;
- complete repository suite: **157/157 files, 1,876/1,876 tests passed**;
- governed D-16/D-17 harness: **10/10 files, 176/176 tests passed**;
- root and UI TypeScript: **passed**;
- production build: **passed, 132 modules transformed**;
- deterministic exporter replay: **three byte-identical outputs**; and
- final independent Art, asset, runtime, determinism, provenance, and contract reviews:
  **no unresolved P1–P3**.

At 1920×1080, 240 raw post-warm-up frames measured 120 average FPS, 108 FPS 1%-low, 9.3 ms p99,
9.3 ms worst frame, 0.02 ms average update, 0.1 ms worst update, one renderer draw, 33 display
objects, 15 dynamic actors, 10.6 MB decoded textures, and a 281 KB atlas. All governed viewports,
125%-equivalent scaling, maximum zoom, grayscale, a separate deterministic 2.5× contrast-boosted
fit/max-zoom inspection, labels-hidden, reduced-motion, active-production,
invalid-manifest, missing-asset, reload, and return-navigation passes completed without unexpected
console or request failure.

The live director route acknowledged the real Engine `unassigned → blocked` transition and left the
task blocked at arrival. Visual-only lot operations left the complete SaveFileV11 and RNG state
byte-identical. Publicity still persisted the exact real D-17B action result.

## Findings repaired before close

The retained result incorporates review repairs for Security badge text, Camera fallback texture-key
collision, named-person pointer interception, smoothed rather than raw frame telemetry, an RGBA
alpha-only verifier fail-open, and missing role-change/full-route regression coverage.

## Governing boundary

The economic status remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Cash runaway, top-studio economic immortality, the week-208 synchronized roster wall, P5 dominance,
world-led variance, cheap-film purpose, premium-film purpose, remaining menu breadth, and formal G12
timing remain open. No financing, loan, bailout, restructuring, failure ladder, or arbitrary cash
sink was introduced.

## Git and publication boundary

Role Atlas V1 exists only on `operation-hollywood-autonomous-marathon`. Local `main`, accepted
D-17B, and the Hollywood bridge remain at their protected authorities. Nothing was pushed and no
tag was created; autonomous feature closure does not cross the repository's Owner-acceptance tag
boundary.

## Next marathon move

Apply the Owner's world-first ruling. The next operating slice must make the Studio Lot itself a
place where the player can identify an authoritative production blockage, inspect and resolve the
legal command, watch the named person travel, and see the same Engine work resume. Deep management
screens remain available for complexity, but the ordinary interaction begins in and returns to the
same live world.
