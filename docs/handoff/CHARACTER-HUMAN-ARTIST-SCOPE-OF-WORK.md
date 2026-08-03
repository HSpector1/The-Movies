# Project: Studio — Human Artist Scope of Work

## Assignment
Correct the remaining human-scale blockers on the Project: Studio "Electric" worker and return a production-ready
character, **preserving the technical contract** (`CHARACTER-TECHNICAL-CONTRACT.md`). This is a finishing correction,
not a redesign. Start from the exported LOD0 GLB (`public/assets/studio/characters/electric_hero_05i.glb`); reference
the CC0 base + rig (`CHARACTER-SOURCE-AND-PROVENANCE.md`).

## Required work
1. **Face & head sculpt** — approachable stylized management-game worker; softer brow/jaw/nose/cheeks/ears/neck;
   hard-hat-compatible silhouette; no ogre/superhero/mannequin/photoreal read.
2. **Hands, wrists, forearms** — repair topology and/or weighting; preserve palm/thumb/grouped-fingers/wrist/forearm
   volume; eliminate melting/stretching/tendrils/collapse/joint-pinch; validate across all six clips.
3. **Minor finishing** — residual boot toe seam; close-range neck fold; proportional balance where needed;
   garment/body clipping introduced by manual corrections.

## Required deliverables (the specialist must return)
- Corrected **source Blender file** (`.blend`) with the working scene.
- Corrected **LOD0**, **LOD1**, **LOD2** meshes.
- **Preserved 65-joint skeleton compatibility** (bone names/hierarchy/orientation/scale/ground unchanged).
- Corrected **face and head**; corrected **hand/wrist/forearm** topology and/or weighting.
- **Stable six-clip deformation** (Idle/Walk/Talk/Kneeling/Pickup/Sitting).
- **Complete material assignments**; **no exposed body geometry through clothing**; **no new accessory instability**.
- **Neutral-pose renders** + **animated deformation evidence** + **matched before/after evidence** (vs the current
  05I "before" in `proof/lab05i/iteration-02/`).
- **Export-ready GLBs** matching the export conventions (`CHARACTER-EXPORT-AND-RUNTIME-GUIDE.md`).
- **Documentation of any topology, weights, shape-key, or material change** (any topology change must be explicit).

## Acceptance
Per `CHARACTER-ACCEPTANCE-TESTS.md`: the visual tests, the hard technical gates, and all four specialist reviews
(Character Art, Rigging, Technical Art, real-GPU runtime) + owner visual approval. A validator pass alone is not
acceptance.

## Non-goals (do NOT)
Full character redesign · new base mesh · new final skeleton · new animations / new animation library · role-wide
propagation · named-talent use · production integration · live-3D renderer proof · sprite-derived proof · D1 / D1-A /
Engine changes · the texture-disposal leak · modifying 05G/05H or prior evidence · opening a PR / merging / force
push. New geometry must be CC0 or owner-owned with documented provenance.

## Handoff note (for whoever commissions this)
This scope is written so a professional character artist + rigging/technical-art specialist can execute without
reverse-engineering the repo. The two autonomous iterations established that the procedural pipeline reliably makes
a viable worker **body/garments/rig** but cannot finish an appealing **face** or coherent **hands** — those are the
two items this scope exists to resolve by hand.
