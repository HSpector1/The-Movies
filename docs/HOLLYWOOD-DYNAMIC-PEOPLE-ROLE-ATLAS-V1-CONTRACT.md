# Hollywood Dynamic People Role Atlas V1 Contract

Status: autonomous-marathon implementation contract

Date: 2026-08-14

Authority base: the marathon launch order, especially **#21 — DYNAMIC PEOPLE VISUAL UPGRADE**;
the Operation Hollywood north star and engine bridge; accepted D-17B; closed Production Operations
V1, Studio Calendar V1, Development & Casting Annex V1, and Film Chronicle V1; and canonical
Lessons Learned

## Purpose

Raise the weakest visible part of the current Hollywood district: its dynamic people.

The baked 1948 studio world already contains materially convincing workers, stars, executives,
equipment, period clothing, depth, and light. The runtime people layered over it are readable but
remain 54×74 procedural symbols. At the fit camera they communicate activity; at ordinary zoom they
break the world because their geometric bodies, generic faces, flat clothes, and token props do not
share the authored plate's human fidelity.

V1 replaces those generated role textures with one repository-owned, offline-authored,
multi-direction role atlas. It keeps the existing deterministic actor pool and authoritative
snapshot bridge exactly intact.

The intended five-second read is: **these are 1948 studio people doing recognizably different jobs,
and the named people still correspond to the real studio state.**

## Governance boundary

The marathon launch is newer Owner authority and explicitly orders a dynamic-sprite upgrade. It
does not reopen or approve the rejected Asset Lab 05H/05I 3D character foundation.

V1 must not:

- merge, copy, repair, derive from, or resume the rejected 05H/05I Blender character;
- use its mesh, rig, weights, topology, garments, textures, renders, UAL dependency, or specialist
  handoff packet as a production foundation;
- claim that autonomous procedural work repaired the face, skull, body, hand, wrist, forearm,
  deformation, weight-paint, or garment-fit blockers recorded for that track;
- authorize a close-camera hero character, rigged animation system, 3D character pipeline, or
  general character-production program; or
- modify the separate Asset Lab branch or its commissioning record.

V1 also may not copy, trace, or imitate the protected character art of *The Movies*, *The Sims*,
or another commercial game. Genre and period references guide product intent; all shipped pixels
must be new Project: Studio material with recorded authority.

This is a distinct 2D sprite-atlas replacement for the already-integrated Operation Hollywood
actors. It uses new original raster sources created for the current fixed management camera.

## Existing truth boundary stays frozen

`StudioLotSnapshot` remains the only authoritative input to the Hollywood scene. V1 adds no
GameState field, save field, migration, action, task, route, reservation, facility fact, economic
rule, random draw, clock, actor need, or person simulation.

The following existing laws remain unchanged:

- managed people exist only when the snapshot names them;
- stable person IDs own reconciliation, selection, label, and home-slot continuity;
- `director` and `talent` are presentation roles from the current narrow snapshot, not new talent
  disciplines or identity claims;
- ambient actors remain cosmetic and never become roster people;
- the director route begins only after the exact accepted unassigned→blocked Engine transition;
- route arrival never changes a task or advances simulation;
- route points and their depth bands remain authoritative presentation geometry;
- direct-load blocked, ready, scheduled, and completed states paint without replaying a route;
- reduced motion freezes or completes cosmetic motion without changing Engine state; and
- labels, the DOM companion, and semantic destination controls remain the accessible source of
  person, place, production, and action truth.

Facing is disposable presentation state. It is computed only from the current cosmetic movement
vector and is never serialized. Same snapshot and same presentation delta sequence must select the
same frame; a reload may begin from the canonical idle frame without changing any authoritative
fact.

## Exact V1 role set

V1 covers every role texture the existing Hollywood scene already creates, and no new simulated
role:

1. Director
2. Talent
3. Grip
4. Stagehand / carpenter
5. Electrician
6. Camera operator
7. Security
8. Publicity
9. Extra

The atlas must distinguish them primarily through silhouette, period clothes, pose, context, and
equipment, in that order. It must not rely on a tiny badge, floating label, arbitrary color swap,
or stereotype alone.

The role art is representational, not biographical. It may not infer a named person's gender,
ethnicity, age, ability, fame, salary, temperament, employment condition, or hidden skill from a
name, ID, or GameState. V1 may reuse a role appearance for multiple people. Individual body/face/
wardrobe variants remain open.

## Four-direction atlas law

Runtime frames are exactly 96×128 RGBA pixels. The atlas contains nine role rows and four facing
columns in canonical order:

```text
columns: south, east, north, west
rows:    director, talent, grip, stagehand, electrician, camera, security, publicity, extra
```

The runtime atlas is therefore exactly 384×1152 with 36 frames. South is the canonical stationary
frame. East and north are distinct authored views. West is a deterministic horizontal mirror of
the exact East source so left/right identity, scale, and costume cannot drift.

The authored frame is deliberately higher resolution than the generated 54×74 fallback because
the recorded defect appears at closer zoom. Runtime scale must preserve the current approximate
on-lot body height: authored named people use `74 / 128`, ambient people multiply that by their
existing `.9` scale, and Extra multiplies it by the existing `.82` scale. A measured integration
correction may move that common authored ratio only if one value is applied consistently and the
whole-frame comparison records the reason.

Direction selection uses the movement vector only:

- zero vector keeps the supplied fallback direction;
- the larger absolute axis wins;
- vertical ties resolve vertically;
- negative Y is North, positive Y is South;
- negative X is West, positive X is East.

No frame represents a gameplay mood, quality, productivity, fatigue, success, failure, or hidden
trait. V1 has no gait or action animation frames; the current bounded route/ambient position motion
continues to supply movement. Walk cycles and context actions require later evidence.

## Art direction

Every role source is an original three-view 1948 Hollywood studio worker sheet on a removable flat
chroma background. The source views are South, East, and North; the exporter owns the West mirror.

Required qualities:

- human proportions and a grounded, readable full-body silhouette;
- period-correct late-1940s studio clothing rather than modern fashion or generic fantasy costume;
- one role-specific pose or tool whose silhouette survives at approximately 70 rendered pixels;
- warm restrained materials compatible with the authored district's golden-hour palette;
- slightly elevated three-quarter camera language compatible with the fixed management view;
- controlled detail that survives reduction without becoming noise;
- one consistent identity, outfit, equipment set, scale, lighting direction, and ground line across
  the three source views; and
- clean opaque edges with no chroma fringe, watermark, logo, caption, grid, cast shadow, background
  scene, or copyrighted mark.

The atlas receives a small consistent baked contact ellipse during deterministic export. It must
ground the sprite without becoming a second large light source or pretending to be an authoritative
world shadow.

V1 must be judged in the complete live lot at fit camera and at the existing maximum zoom, not as a
turnaround sheet alone. A beautiful isolated figure that becomes noisy, toy-like, too large, too
small, too sharp, or stylistically detached in the district fails.

## Source, provenance, and deterministic export

Repository source belongs under `art/hollywood/people/`. Runtime output belongs under
`ui/public/lot/hollywood/`.

The source manifest records for every role:

- canonical role ID and row;
- source image path and SHA-256;
- exact generation date, built-in image-generation path, and final prompt;
- rights basis plus tracked-source / generated-derivative classification;
- three governed source-view crop boxes;
- frame scale/registration parameters;
- encoded source/output bytes, decoded RGBA bytes, and the exact export command; and
- explicit declaration that no third-party or rejected Asset Lab source entered the image.

The deterministic exporter must:

1. validate source dimensions, RGBA/chroma removal, crop boxes, non-empty alpha, role order, and
   unique source hashes;
2. crop the three exact source views;
3. normalize each opaque figure into its 96×128 frame without stretching;
4. place every foot/ground contact on one governed registration line;
5. add the governed contact ellipse;
6. mirror East to West;
7. compose the canonical 384×1152 atlas;
8. write a runtime JSON manifest containing dimensions, frame map, source hashes, and final atlas
   hash; and
9. reproduce byte-identical PNG and JSON output from the same committed sources and manifest.

It is a separate people-atlas exporter. The current district source manifest is stale relative to
the committed runtime Annex polygons; V1 must not invoke, modify, or couple itself to the district
exporter and must not overwrite `district-manifest.json`.

The project must retain the final selected sources, not only a prompt. Generated image models are
not deterministic asset compilers; the committed pixels are the authority and the exporter is the
deterministic transformation from those pixels.

No network request or image generation occurs in the game, build, tests, or exporter.

## Runtime integration and fallback

The Hollywood scene preloads the one authored spritesheet and validates its exact frame geometry
before use. One pure role/direction mapping owns all frame indices. Managed and ambient actors use
the same mapping.

If the authored atlas is absent or invalid, the scene retains the current nine procedural role
textures as an explicit failure fallback. A failed atlas must not remove people, break input,
change route/depth state, or crash the lot. The fallback is not a player-selectable competing Art
direction and is not used to make the acceptance comparison easier.

Existing tint selection, interactive person hit target, name label, home-slot offsets, scale,
depth, actor pooling, route geometry, publicity effect, vehicle, and district layers remain intact
unless a measured integration defect requires the smallest presentation-only correction.

The performance readout must include decoded atlas bytes rather than continuing to report only the
district layers. Runtime instrumentation may distinguish district and people textures internally,
but the player-facing total must not undercount the new asset.

The atlas decoded cost is exactly `384 × 1152 × 4 = 1,769,472` bytes. District, role atlas, and
generated vehicle/fallback texture accounting must remain below 12 MiB decoded at V1 acceptance.
Under the same accepted fixture the atlas may not increase display-object or dynamic-actor count.

## Information integrity and accessibility

- A sprite can communicate role and direction only. It cannot reveal or imply hidden actual talent
  data.
- Names and authoritative assignments remain ordinary DOM text, not pixels in the atlas.
- Canvas people remain backed by the existing `Named studio people` DOM group and selection panel.
- Pointer selection and DOM selection must still resolve the same person ID.
- Color is not the only role discriminator; silhouette/equipment must survive grayscale inspection.
- Reduced-motion mode preserves the same role/frame identity and all controls.
- There is no flashing or newly required animation.

## Required verification

- exact 384×1152 PNG, 96×128 frames, nine governed roles, four governed directions, and 36 unique
  frame addresses;
- transparent corners, non-empty alpha, bounded opaque coverage, shared foot registration, no
  chroma-key residue, and no pixels outside the governed frame;
- byte-identical exporter replay from committed source pixels and manifest;
- three independent exports into clean temporary directories plus a clean-checkout rebuild;
- source and output SHA-256 verification plus prompt/provenance completeness;
- South/East/North source distinction and exact West=mirror(East) pixel identity;
- deterministic direction selection at cardinal, diagonal, tie, and zero-vector boundaries;
- exact role/frame selection for managed additions, updates, role changes, ambient reversal, and
  the multi-segment director route;
- absent/invalid atlas falls back without losing people, selection, routes, or input;
- same snapshot before/after atlas integration produces byte-identical GameState and RNG state;
- direct-load operations states, route depth changes, reduced motion, same-role home slots,
  publicity, Annex parcel, and semantic navigation regressions remain green;
- full lot comparison at identical save, camera, zoom, viewport, and time with the old procedural
  actor path used only as a control;
- every role inspected at fit camera and maximum allowed zoom for silhouette, clothing, period
  identity, pose, context, equipment, halo, registration, and plate integration;
- a labels-hidden review that still recognizes Director, Talent, Camera, Electrical, Publicity,
  and Security from visual role language, while Grip, Stagehand, and Extra remain non-clone members
  of a coherent crew family;
- grayscale and high-contrast inspection, with role distinction not dependent on hue;
- 1280×720, 1366×768, 1440×900, and 1920×1080 layout inspection;
- 1920×1080 sustained target at or above 50 FPS and hard floor at or above 30 FPS, including worst-
  frame, p99/1%-low frame evidence, update, draw-count, display-object, dynamic-actor, encoded-atlas,
  and truthful decoded-texture evidence;
- no console error or warning in idle, publicity, selected-person, active-production, director-route,
  reduced-motion, reload, and return-navigation paths;
- full UI/repository suite, TypeScript, production build, governed D-16/D-17 harness, and
  `git diff --check`; and
- independent Art/readability, runtime/determinism, provenance/asset, and governance reviews with
  no unresolved P1-P3.

## Keep / kill gate

Keep V1 only if the complete lot is materially more believable at first glance and every role is
readable as a period studio job at ordinary management zoom, while the exact same named people,
Engine tasks, interactions, depth crossings, reduced-motion behavior, and performance floor remain
intact.

Kill or narrow any role asset that:

- looks like a modern fashion render, board-game pawn, pasted photograph, toy, or isolated concept
  sheet after integration;
- loses the role without its color or a DOM label;
- contradicts the fixed camera or light strongly enough to break the plate;
- contains a watermark, logo, text, modern object, chroma halo, crop, floating foot, or material
  artifact;
- makes a named person's art imply a hidden fact the snapshot does not own;
- requires a runtime network/model call or nondeterministic asset selection;
- mutates Engine state or makes animation authoritative; or
- pushes sustained 1920×1080 performance below the 30 FPS hard floor.

A role that fails may retain the existing procedural fallback while the accepted roles continue
only if mixed presentation still passes whole-frame review. Do not lower the gate to force all nine
generated sources to ship.

## Explicitly open after V1

- individual face, body, skin-tone, age, gender-expression, wardrobe, and equipment variants;
- mapping visual identity to persisted person customization;
- walk cycles, idle cycles, gestures, facial animation, lip sync, mocap, or per-frame authoritative
  movement;
- close-camera hero characters, interiors, cutscenes, machinima, trailers, or film playback;
- a rigged 3D character foundation or reconsideration of rejected 05H/05I specialist blockers;
- additional roles beyond the nine already rendered by Hollywood;
- seasonal, decade, production-specific, or department-specific wardrobe evolution;
- authoritative fatigue, morale, relationships, needs, schedules, or physical tasks; and
- Stage 7 interior/threshold work, rival studios, awards, era progression, and all accepted D-17B
  macroeconomy residuals.

The governing economic status remains:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

No financing, loan, bailout, restructuring, acquisition, bankruptcy/failure ladder, arbitrary cash
injection, or arbitrary cash sink is authorized by this contract.

Any V1 acceptance must state exactly:

> **2D Hollywood role-atlas presentation accepted; 05H/05I character production and integration
> remain rejected/unauthorized.**
