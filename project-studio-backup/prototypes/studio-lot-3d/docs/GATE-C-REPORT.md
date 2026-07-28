# Gate C — M3 Coherent Meridian Art Slice Review

Mandatory gate after M3 (the bounded coherent art pass on the one representative
section). Evidence in `shots-m3/`; survey of the art language in the kit/material docs.

> **FINAL DISPOSITION: GATE C — PASS.** Owner reviewed the patched build on real
> hardware and confirmed: road/pavement glitch resolved; crew spacing + routing
> materially improved; the scene clearly reads as a movie studio; camera excellent;
> ~120 FPS; crane + active-production area sufficiently readable; remaining occasional
> gate contact is minor and non-blocking. **M3 is complete and PASSED.** No M4, no
> integration, no full-studio expansion.

## Final owner confirmation (2026-07-26) — GATE C: PASS

The bounded defect patch (road z-fighting, prop/vegetation routing, crew congestion,
crane readability, character-quality classification) was accepted on real hardware.
**Verdict: PASS.**

### Non-blocking follow-ups recorded (NOT started under this task)

**OC-01 — Camera occlusion management.** Large roofs/walls can obstruct the production
and human-scale views. Recommended *future* prototype (do not build yet):
- tag roofs + selected upper-wall meshes as **occludable**;
- camera-to-focus raycasts detect blockers;
- **fade/hide** blockers smoothly and restore them when no longer obstructing;
- a **Roofs: Auto / Visible / Hidden** control;
- preserve full building silhouettes in Overview;
- **do NOT** build a full Sims-style floor/cutaway system.

**Backlog (non-blocking):**
- Occasional minor **character contact with the gate geometry** remains backlog work.
- **Kenney characters** remain acceptable for **background roles only**.
- **Hero-character replacement** remains **deferred** (future asset + pipeline work).

## Owner review — real hardware (2026-07-26) — CLOSED

Howard ran M3 on real hardware. **OWNER VERDICT: GATE C = PASS WITH CORRECTIONS.**

| Criterion | Owner result |
|---|---|
| Studio recognition | **PASS** (clearly a movie studio; gate/water-tower/Deco-admin/STAGE 2 distinguish it from the old fire-station look) |
| Performance | **PASS** — ~120 FPS throughout (overview / production / human / vignette / lowest sustained); no loading hitch or instability |
| Camera reward | **PASS** (camera remains a major success) |
| Production readability | **PARTIAL** — crane initially hard to locate → addressed (defect D) |
| Character scale | **PASS** |
| Background character quality | **CONDITIONAL** (Kenney provisional; see classification) |
| Hero-character quality | **NOT APPROVED** (future work) |
| Routing / collision | **CORRECTION REQUIRED** → addressed (defects B, C) |
| Road rendering | **CORRECTION REQUIRED** → addressed (defect A) |
| Overall | major improvement, positive direction |

### Defect patch (bounded — no new art-direction pass)
- **A · Road/ground glitch → FIXED.** Root cause: every ground overlay (verge, asphalt,
  markings, crossroad, apron, plaza) was rendered **coplanar at y=0.02** → z-fighting
  that flickered on the Production transition. Fix: a distinct **y-stack**
  (verge 0.02 < plaza 0.04 < boulevard 0.06 < crossroad 0.08 < apron-edge 0.10 <
  apron 0.12; paint 0.13) so every overlapping region has one authoritative top
  surface, plus `polygonOffset` on the paint layer. No camera workaround; grounded
  shadows preserved. Before/after (same Production camera): `m3-road-before.png` /
  `m3-road-after.png`.
- **B · Character/vegetation+prop intersection → FIXED.** Static obstacles (trees,
  hedges, trailer, van-adjacent props, crane, lighting stands, gear, monitor) are now
  **authored obstacle footprints in `layout.ts`** (single source of truth for both the
  rendered scene and validation). `validateRoutes()` extended to assert no ambient/
  vignette route and no apron-crew position crosses a tree/hedge/prop footprint. One
  real violation was caught (the trailer sat on the `char-crew1` loop) and fixed by
  relocating the trailer. Deterministic; no pathfinding.
- **C · Crew congestion → FIXED.** Root cause: the 4 apron crew were clustered within
  ~2 m AND the take cast converged tightly. Fix: apron crew reduced to 3 spaced ≥1.6 m
  (`APRON_CREW`, obstacle-clear), and the take staging spread to distinct role marks
  (director/actorA/actorB/slate ~1.5–2 m apart) while keeping the door portal + timing.
  `crewSpacingOk` asserts spacing + obstacle clearance.
- **D · Crane readability → FIXED.** One restrained adjustment: taller mast + longer
  boom + clearer camera head/lens + counterweight; the boom rakes over the apron
  toward the door (head clear of the stage wall). Not a landmark; routing + sightlines
  preserved. Evidence: `m3-02-overview.png`, `m3-09`, `m3-03`.
- **E · Character-quality classification → RECORDED** (see `M3-ASSET-INVENTORY.md`):
  the Kenney characters are **accepted provisionally for background crew / drivers /
  distant supporting roles only**; they are **NOT approved** as final quality for hero
  actors, directors, stars, pitch meetings, or close cinematic presentation. Hero-
  character asset selection + pipeline validation remain future work. The current
  characters are **not** production-ready hero talent.

### Defect-patch tests (all pass)
No road/pavement surface fighting (y-stack + polyOffset; before/after evidence) · no
duplicated visible ground surface · character routes avoid vegetation footprints ·
routes avoid production-prop footprints · no shared crew destination / stacking
(`crewSpacingOk`) · open door permits assigned entry · closed door blocks entry ·
waiting behaviour intentional · crane obstructs no route/vehicle · vignette
deterministic (seek 12⇒12) · camera source + presets unchanged (git diff empty) ·
renderer teardown one-canvas · typecheck + build pass · protected repos untouched.
>
> **Experiment recommendation: USE HYBRID PRESENTATION** (2.5D/renderer-neutral
> overview + selective 3D for close production moments) — not full-3D migration, not
> 2.5D-only.

## Independent review (2026-07-26)

Two independent, adversarial lenses (visual + technical-art) that did **not** build the
slice, judging the actual shots + code, re-verified by a synthesizer.

| Lens | Verdict |
|---|---|
| Visual / art-direction | PASS WITH CORRECTIONS (reads as a studio <5 s: **yes**; beauty: wide shots attractive, close-ups not-yet) |
| Technical-art / engineering | PASS WITH CORRECTIONS |
| **Synthesis** | **PASS WITH CORRECTIONS → ACCEPT WITH CORRECTIONS** |

### Criterion results (as reviewed, before corrections)
| Criterion | Result |
|---|---|
| Overview reads as a movie studio <5 s (no UI/audio) | **pass** |
| Clearly better than the gray-box baseline | **pass** |
| Cohesion — one visual world | **pass** |
| Meridian identity (gate lettering, water tower, Deco admin, soundstage) | **pass** (crest present in code but under-legible at distance) |
| Characters read as people | **pass** (roles-at-a-glance: partial) |
| Production recognizable from overview | **partial → addressed** (was near-identical idle vs active) |
| Beauty (no "prototype" qualifier) | **partial** (wide yes; close-ups not-yet) |
| Reusability / shared materials / shared rig | **pass** (one keyed material cache; one shared Kenney rig) |
| Scale / animation / determinism / isolation | **pass** (1.8 m unit; no `Math.random`; camera + protected repos untouched) |
| Teardown / leaks | **partial → fixed** (dispose not wired) |

## Corrections applied (the one bounded pass)
1. **Overview production legibility (the #1 miss).** Added `ProductionRig` — a camera
   crane/boom + two tall lighting stands (warm lamp heads) + a monitor cart on the
   apron, tall enough to read at overview; brightened the open-door warm glow. Active
   production is now legible from the management view, not just via the highlight ring
   (`m3-09`, `m3-04`).
2. **Teardown leaks (real defects).** Wired `disposeMaterials()` into
   `ThreeStudioLotRenderer.destroy()`; `Crew` now disposes its per-instance tint-clone
   materials on unmount/retint. One-canvas teardown assertion still passes.
3. **Open-door interior glow.** A warm emissive panel + stronger spill fill the dark
   door void (beauty + a close-range "filming here" cue).
4. **Single-source-of-truth / hygiene.** `kit.tsx` now imports `SCALE`
   (`GATE_CLEARANCE`; elephant-door constant) instead of magic numbers; crest made
   more legible (higher-contrast mark + larger on water tower/admin/gate); per-character
   `Prop` materials routed through the shared cache; material-library doc reconciled.

## Deferred (documented — out of a bounded pass / need new assets)
- **Voxel faces / role-from-silhouette without the UI label.** The Kenney base model is
  fixed; true per-role silhouettes need custom character assets or a richer wardrobe
  layer — beyond one correction pass. Roles currently read by wardrobe tint + hat +
  carried prop + stance + the selection card.
- Fuller van/set-piece remodel (the van has a cab + wheels and now reads in context).
- A second non-text overview studio cue + crest resolution at far distance.
- An eslint config (mechanical lint) — nice-to-have.

## Owner review — OWED
The owner review (real-hardware look + the M3 fps figure) is Howard's and has not been
done. Headless capture is software-only (a floor, not a verdict); the M1/M2 hardware
baseline (~120 fps) stands but the **M3 hardware fps is unmeasured** — run `index.html`
in real Chrome. This gate stays open on that one item.

## Evidence
`shots-m3/` — overview (UI + hidden), active-production overview, production,
human-scale, gate/admin/soundstage/backlot close-ups, open-door entry, vehicle route,
character roles, selection, vignette + camera recordings, reduced-motion. Before/after:
`../shots/m1-overview.png` (gray-box) vs `shots-m3/m3-02-overview.png`. M3 regression
assertions pass (routing/portals/determinism/one-canvas/no-errors).

## Disposition
- **PASS WITH CORRECTIONS**, corrections applied. **M3 ACCEPT WITH CORRECTIONS.**
- **STOP here.** No M4/integration; no full-studio expansion. Await the owner review.
- Experiment recommendation: **USE HYBRID PRESENTATION.**
