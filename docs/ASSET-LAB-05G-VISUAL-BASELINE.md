# Asset Lab 05G — Visual Baseline (the 05F "before" state)

With all `CORRECT_05G` flags off, `character_hero_05g.py` builds a **byte-identical copy of the accepted
05F hero**. The baseline renders in `proof/lab05g/baseline/` are therefore the honest "before" state that
every 05G correction is measured against. tris(LOD0)=9,876, height=1.819 m, 65 joints.

The three owner-cited defects, as observed directly in the baseline renders (not from memory):

## A. Shoulders — pointed wedges

In the natural idle/arms-down pose (`05g-pose-idle-3q.png`) the shoulders come to an angular, slightly
pointed peak; the sleeve cap reads as a separate tube butted against the torso rather than flowing out
of it. This is the pose the owner actually judges, so the defect is most visible there (the T-pose grid
partly hides it).

## B. Vest — two padded chest pods

`05g-vest-side.png` shows the vest standing proud of the chest as a thick slab (~1.4 cm projection).
`05g-front.png` shows a wide central V splitting it into two bulbous panels, reinforced by two bright
reflective bands — reads as flotation/armor, not fitted hi-vis.

## C. Pelvis — mechanical attachments

`05g-pelvis-front.png` / `05g-lowerbody.png`: a hip block wider than the legs (a lateral shelf on each
hip), a dark central crotch gusset hanging like a diaper flap, and a side pouch box.
`05g-pelvis-back.png`: a horizontal belt shelf across the rear waist above the trouser seat.

## Passed regions (frozen — not touched by 05G)

Technical pipeline, animation stability, LOD stability, runtime consistency, improved hands, improved
boots, management-distance readability, face/head/hair/hat, neck, skeleton. These were accepted at 05F
and remain byte-identical in 05G.

## Evidence map

`proof/lab05g/baseline/` holds the full before-state set (front/back/left/right/3q/3q-rear, shoulder,
vest, pelvis-front/back/side, lowerbody, face, and all six posed clips), plus the 05F-vs-05G comparison
shots (which, at baseline, show identical left/right characters — confirming 05G==05F before any
correction).
