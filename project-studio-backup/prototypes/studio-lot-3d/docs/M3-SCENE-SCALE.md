# M3 Scene-Scale Standard

The single, documented scale contract for the M3 slice. **One world unit = 1 metre.**
The **1.8 m adult is THE reference**; every asset is authored or normalized to these
numbers so people never read oversized (the Gate-B owner finding). Constants live in
`src/env/scale.ts` — never inline a height that has a name here.

## Standard heights (metres)

| Element | Height | Source / note |
|---|---|---|
| Adult character | **1.8** | the unit |
| Office/bungalow doorway | 2.2 | ~1.2× a person |
| Studio car (roofline) | 1.6 | |
| Production van/truck (roofline) | 2.6 | reads bigger than a person |
| Talent trailer | 3.0 | |
| Equipment / road case | 1.0 | |
| Soundstage elephant door | 7.0 | a truck passes under |
| Gate arch clearance | 5.0 | |
| Soundstage (mass) | 13 | dominant, dwarfs people not the frame |
| Administration (to crown) | 17 | civic anchor |
| Water tower | 18 | tallest landmark |
| Palm / shade tree | 9 | |

These match the approved scale sheet (`01-ART-DIRECTION.md`) and the M1 `layout.ts`
building heights (gate 7, admin 17, soundstage 13, water tower 18) — so the M3 art
pass keeps the M1 footprints and camera unchanged.

## Character normalization (owner's first M3 task — DONE)

The Kenney "Blocky Characters" adult renders **~2.7 m at native scale** (its rest-pose
`Box3`; on real hardware it read dramatically oversized vs vehicles/doorways). Fix: a
uniform **root scale = 1.8 / 2.72 ≈ 0.66** (owner's "~0.67"), applied in the shared
`Crew` component (`src/m3/Crew.tsx`). The rig root is at the feet, so scaling the group
**preserves ground contact** (feet stay at y=0).

### Validation (headless capture — `shots-m3/m3-scale-0{1,2,3}`, assertions in `tools/capture-m3-scale.mjs`)

| Check | Result |
|---|---|
| Adult native height | **2.70 m** |
| Adult normalized height | **1.79 m** (target 1.8, tol ±0.25) ✓ |
| Root scale | **0.66** ✓ |
| Adult < 2.2 m doorway | ✓ |
| Adult < 2.6 m van | ✓ |
| Adult ≥ car roofline (1.6 m) | ✓ (head above the car roof) |
| Ground contact (idle + walk) | ✓ feet on the ground line, no float/sink |
| Console/page errors | none |

Visual confirmation (`m3-scale-01-lineup-idle.png`): the normalized adult is the same
height as the authored 1.8 m marker and reads correctly against the doorway, van, car,
trailer, case, and 7 m elephant door.

## Standing decisions

- **Do NOT enlarge buildings to compensate** for character scale (owner rule). Buildings
  stay at the scale-sheet heights; characters are normalized down.
- **Kenney crew = supporting/background crew** (Gate-B condition), used at the 1.8 m
  unit. Whether they suffice for a human-scale *hero* view is decided at the M3 review.
- Vehicles/props from the Kenney family are scaled to the standard heights above
  (uniform scale to the target roofline), not left at native.

## Still to revalidate in the composed scene (task 12)

Ground contact + shadows + carried-prop scale are validated here. **Route waypoints,
selection bounds, and doorway entry** are revalidated once the normalized crew is placed
into the M1 slice (which owns the authored routing/portals) — they must still pass the
existing route/door assertions after the art pass.
