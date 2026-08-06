# Project: Studio — Human Artist Scope of Work

## Owner ruling — status of this asset (read before estimating)

This document is written to be accurate **on its own**. If you received only this page, the following is the
governing status.

- **05H provenance was accepted** — the CC0 source chain is verified and commit-safe
  (`CHARACTER-SOURCE-AND-PROVENANCE.md`).
- **The authored-base workflow was accepted** as useful **pipeline research**.
- **The 05H visual build was rejected** as a production character.
- **05I was the authorized bounded corrective milestone.** It contained **two owner-reviewed iterations**
  (Iteration 1 and Iteration 2), the limit established by the 05I brief.
- **05I is rejected as a production character foundation.**
- **Further autonomous procedural correction is stopped.**
- **A qualified human character artist is required.**
- **A qualified rigging and weight-paint specialist is required.**
- **No production or Studio Lot integration is authorized.** D1-A and any subsequent D1-B Studio Lot character
  phase remain unstarted and separately governed.
- The work runs through **staged, repeatable review gates** (`CHARACTER-ACCEPTANCE-TESTS.md`). **No fixed number
  of correction loops is promised or capped, and no single contract pass is guaranteed to reach production
  approval.**

Full ruling and context: `CHARACTER-ARTIST-HANDOFF-BRIEF.md`.

## Assignment
Bring the character to production quality through **substantial specialist correction**, **preserving the technical
contract** (`CHARACTER-TECHNICAL-CONTRACT.md`). The current 05I model is **rejected as a production foundation**.
Assume a hand-authored **face and cranium sculpt**, **hand and forearm topology correction**, a **manual rigging and
weight-paint pass**, **garment refitting where required**, and a **real reduction in body mass** — **not a polish
pass**. Start from the exported LOD0 GLB (`public/assets/studio/characters/electric_hero_05i.glb`); reference the
CC0 base + rig (`CHARACTER-SOURCE-AND-PROVENANCE.md`).

This is **not** a new character concept and **not** a replacement base mesh — but it is substantially more than
finishing.

## Required work
1. **Face & cranial sculpt** — approachable stylized management-game worker. Address **forehead and brow balance**,
   **cheek and jaw mass**, **cranial / skull proportion**, **crown height**, **back-of-head volume**, **silhouette
   beneath the hard hat**, the **neck-to-head transition**, and the **side and rear head silhouette**; softer
   brow/jaw/nose/cheeks/ears/neck; no ogre/superhero/mannequin/photoreal read.
2. **Hands, wrists, forearms** — correct **topology and edge flow** and/or weighting; preserve
   palm/thumb/grouped-fingers/wrist/forearm volume; eliminate melting/stretching/tendrils/collapse/joint-pinch;
   validate across all six clips.
3. **Body mass and human-scale proportions** — the body remains **too bulky** for the intended ordinary
   working-adult result. The 05I slimming was **partial**, and the hi-vis vest masks part of the underlying body
   mass. Reduce **upper-body and shoulder mass** meaningfully at human scale. This is **more than a minor
   proportional nudge**; it does **not** necessarily require discarding the accepted CC0 base mesh.
4. **Manual rigging and weight painting** — repaint the hand/wrist/forearm chain and any joint the sculpt or
   retopology invalidates, to the requirements in `CHARACTER-TECHNICAL-CONTRACT.md`; report joint-by-joint results.
5. **Garment construction and refit** — refit garments where the sculpt or retopology moves the body beneath them;
   keep garments and accessories anchored; resolve garment/body clipping introduced by manual corrections.
6. **Close-range surface defects** — residual boot toe seam; close-range neck fold; close-range facial lumpiness;
   any visible garment seam. Severities, evidence paths and owning disciplines are in `CHARACTER-KNOWN-DEFECTS.md`.

## Required deliverables (the specialist must return)
- Corrected **source Blender file** (`.blend`) with the working scene.
- Corrected **LOD0**, **LOD1**, **LOD2** meshes.
- **Preserved 65-joint skeleton compatibility** (bone names/hierarchy/orientation/scale/ground unchanged).
- Corrected **face and cranial form**; corrected **hand/wrist/forearm** topology and/or weighting; **reduced body
  mass**.
- **Stable six-clip deformation** (Idle/Walk/Talk/Kneeling/Pickup/Sitting) with **joint-by-joint reporting**.
- **Complete material assignments**; **no exposed body geometry through clothing**; **no new accessory instability**.
- **Neutral-pose renders** + **animated deformation evidence** + **matched before/after evidence** (vs the current
  05I "before" in `proof/lab05i/iteration-02/`), at the coverage required per gate in
  `CHARACTER-ACCEPTANCE-TESTS.md`.
- **Export-ready GLBs** matching the export conventions (`CHARACTER-EXPORT-AND-RUNTIME-GUIDE.md`).
- **Documentation of any topology, weights, shape-key, or material change** (any topology change must be explicit).

## Acceptance
Per `CHARACTER-ACCEPTANCE-TESTS.md`: the **staged review gates**, the visual tests, the hard technical gates, and
all four specialist reviews (Character Art, Rigging, Technical Art, real-GPU runtime) + owner visual approval. A
validator pass alone is not acceptance.

Gates are reviewed independently and **may repeat as many times as the evidence requires**. Approval of one gate
does not waive later gates. **No fixed number of review loops is promised**; the Owner's planning expectation is
that **ten or more may reasonably occur**, and fewer or more may occur based on evidence. **A single contract pass
is not guaranteed to reach production approval.** Integration remains unauthorized until **both** final human-scale
approval **and** final management-camera approval have passed.

## Non-goals (do NOT)
New character concept · new base mesh · new final skeleton · new animations / new animation library · role-wide
propagation · named-talent use · production integration · live-3D renderer proof · sprite-derived proof · D1 /
D1-A / D1-B / Engine changes · the texture-disposal leak · modifying 05G/05H or prior evidence · opening a PR /
merging / force push. New geometry must be CC0 or owner-owned with documented provenance.

## Handoff note (for whoever commissions this)
This scope is written so a professional character artist + rigging/technical-art specialist can execute and
**estimate** without reverse-engineering the repo. The procedural pipeline produced a usable **rig, garment system,
LOD chain, materials and runtime** — those are accepted and must not regress. It did **not** produce an acceptable
**face and cranium**, **hand/wrist/forearm chain**, or **body mass**, and the skin-weighting behind the hand
deformation is a base-mesh limit rather than a tuning problem. Price the sculpt, the retopology, the manual
weight-paint pass, the garment refit, and **repeated gated review** — not a polish pass.
