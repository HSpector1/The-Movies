# Asset Lab 05G — Brief

## Assignment

A narrow surgical correction of the Asset Lab 05F Electric hero. The owner reviewed 05F on an Apple M3
and ruled `ASSET LAB 05F — REVISE`: the hero clearly exceeds the 05E worker, but three visible
rejection-level defects remain.

1. Pointed shoulder wedges.
2. A bulky chest-pod vest rather than fitted clothing.
3. Mechanical front and rear pelvis attachments.

**Correct only those three regions.** No broad rebuild; no redesign of the face, hands, boots, skeleton,
animation library, runtime, or population system; no propagation to the other seven roles.

## Constraints (honoured)

- **Additive.** A new hero `electric_hero_05g*.glb`; the 05F hero and all 05E assets stay byte-identical.
- Same accepted pipeline: 65-joint UAL skeleton, the six accepted clips, the Blender authoring pipeline,
  GLB export, LOD generation, Three.js runtime.
- Seeded/deterministic authoring only (no `Math.random`). No external character/clothing/rig/animation
  downloads, no Blender add-ons, no system-wide dependencies, no restricted assets.
- Protected repos (`~/The Movies`, `~/The Movies - Studio Lot Spike`, `~/The Movies - 3D Visual Spike`)
  untouched. Gate D / D1 / OC-01 untouched. No production integration.

## Method

`character_hero_05g.py` begins as a byte-identical copy of the 05F hero, gated by `CORRECT_05G`
(`shoulder`, `vest`, `pelvis`). All flags off = the 05F baseline (the "before"). Each iteration flips one
flag, so before/after is provable in git and renders. Max three iterations. Each: edit → Blender build →
inspect → independent read-only reviewer panel on the actual renders → score → accept/commit. Only the
lead edits files.

## Region plan

- **Iteration 1 — shoulders:** remove the pointed wedge; add a rounded deltoid cap that welds the torso
  shoulder into the sleeve; close the armpit; keep clean deform.
- **Iteration 2 — vest:** rebuild as a thin fitted shell — narrower intentional opening, panels that hug
  the rib cage, real side wrap, restrained bands, no shirt clipping.
- **Iteration 3 — pelvis:** remove the front crotch box and rear belt shelf; one continuous trouser
  silhouette (waist→pelvis→thigh); at most one small hip accessory.

## Pass bar

The hero must read as one continuous stylized worker in fitted workwear: no pointed shoulder fins, no
vest pods, no front crotch box, no rear belt shelf, no detached trouser seat, no rejection-level
interpenetration; all six clips valid; LODs preserve the corrections; Blender/GLB/runtime agree;
performance acceptable; evidence shows 05G exceeds 05F. Stylised and management-game appropriate, not
photoreal or film. See ASSET-LAB-05G-FINAL-REPORT.md for the outcome.
