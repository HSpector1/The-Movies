# Project: Studio — Character Acceptance Tests

The corrected asset is accepted only after it passes ALL of the following. **A validator pass alone is insufficient.**
Judge primarily at **human-review distance**; management-distance readability does not cure human-scale defects.

## Visual acceptance tests (each must read correctly)
Static, neutral pose + neutral light AND runtime light:
- **Face:** front · side · three-quarter — approachable stylized worker; no ogre/superhero/mannequin/photoreal read.
- **Neck transition** — smooth from jaw to collar (no accordion fold).
- **Shoulders** — natural width; no collapse, no detached sleeve, no underarm sail.
- **Arms · wrists · palms · thumbs · grouped fingers** — correct volume; **no melting/stretching/tendrils/collapse**.
- **Boots · hard hat · hair · vest · shirt** — complete, fitted, no exposed body through clothing, no gaps/seams.

Animation — inspect the SAME items above under every clip:
- **Idle · Walk · Talk · Kneeling · Pickup · Sitting** — stable face/head; clean neck/shoulder/arm/wrist/hand
  deformation; no clipping, no accessory instability (belt/radio/hat/hair), correct foot/boot ground contact, clean
  loop continuity.

LOD + lighting + distance:
- **LOD0 / LOD1 / LOD2** — each preserves the corrected silhouette and materials (no LOD material swap, no collapse).
- **Neutral light** AND **runtime light** — material reads correctly under both (skin warm, garments as fabric).
- **Human-review distance** AND **management distance** — legible; the human-review views are the binding ruling.

## Hard technical gates (must all pass)
- Skeleton exactly **65 joints**; bone names/hierarchy/orientation/scale/ground unchanged.
- All six clips deform with no explosion/collapse/regression.
- Complete material assignments; no exposed body geometry through clothing; no new accessory instability.
- LOD0 ≤ 26,000 tris; monotonic LODs; height ∈ [1.70, 1.95] m; face on −Y; feet grounded.
- **05G and 05H assets remain byte-unchanged.**
- `tsc --noEmit` clean; `vite build` clean; runtime capture **console-error-free**; `node tools/validate-05i.mjs`
  (or a successor validator) passes.

## Required reviews (all four + owner)
1. **Character Art review** — facial appeal, worker proportions, silhouette, role readability, garment readability.
2. **Rigging review** — shoulders, neck, sleeves, hands/wrists/forearms, feet/boots, all six clips.
3. **Technical Art review** — skin/material assignment, normals, LOD material consistency, neutral-vs-runtime light,
   topology/weight change documentation.
4. **Real-GPU runtime review** — load on real hardware (Apple GPU / Metal), all six clips, three distances,
   console-error-free, no melting/clipping at human scale.
5. **Owner visual approval** — final human-scale decision.

## Deliver matched before/after evidence
For each acceptance view, provide a **before (current 05I) vs after (corrected)** matched pair (same camera,
lighting, pose, animation frame, scale, background, renderer). The current 05I "before" set is in
`proof/lab05i/iteration-02/` (see `EVIDENCE-INDEX.md`).
