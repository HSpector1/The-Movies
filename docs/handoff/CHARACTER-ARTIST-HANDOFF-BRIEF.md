# Project: Studio — Character Artist Handoff Brief

**Read this first.** This package hands the Project: Studio "Electric" worker character to a professional
**character artist** + **rigging/technical-art specialist** to correct the remaining human-scale blockers while
preserving the proven procedural pipeline. It is a **finishing correction, not a redesign**.

Frozen checkpoint (do not modify): branch `asset-lab-character-human-artist-handoff`, cut from 05I Iteration-2 HEAD
`8903b1e8bbbc166aa1b74a33167aea964502a1f6` (branch `asset-lab-05i-corrective-character-pass`).

## Owner ruling — the authoritative status of this track

- The **authored-base technical workflow** is accepted as useful **pipeline research**, and the **CC0 provenance
  is accepted** (`CHARACTER-SOURCE-AND-PROVENANCE.md`).
- The **05H character build is rejected** as a production character and is **not authorized for Studio Lot
  integration**. Its blocker-grade defects are already documented in the 05H final owner-review package.
- **05I** was the one authorized bounded corrective attempt. It did **not** resolve the human-scale **face,
  proportions, hands, deformation, and surface quality**, and is **rejected as the production character
  foundation**. Read the "viable worker body" framing below as *what the pipeline demonstrated*, **not** as an
  approved production foundation.
- **No further autonomous or procedural character iteration is authorized.** A qualified human **character
  artist** and a **rigging / weight-paint specialist** are required. This handoff package is the **active**
  character-track artifact.
- **Character integration remains unauthorized.** D1-B remains unstarted unless separately authorized. Asset Lab
  character work remains separate from production `main` — no Asset Lab character commit has ever entered it.
- **Management-camera evidence does not substitute for human-scale inspection.** The 05H management framing
  concealed defects that were blocker-grade at close range; judge this asset at human scale (see
  `CHARACTER-KNOWN-DEFECTS.md`).

Nothing in this package authorizes integration, propagation, merging, or renderer work.

## The situation in one paragraph
Two authorized autonomous corrective iterations (05I Iter 1 + Iter 2) proved that the Blender procedural pipeline
reliably produces a **viable worker body**: a CC0 authored base bound to the shared 65-joint skeleton, complete
fitted garments (hi-vis vest, hard hat, boots, tool belt, radio), proportions slimmed from 05H (only partly
resolved — see `CHARACTER-KNOWN-DEFECTS.md`), a working 3-step LOD chain,
correct materials, and a console-error-free runtime that retargets six shared animation clips. It **cannot** finish
two things: an **appealing face** (vertex-smoothing this realistic CC0 head does not reach an approachable stylized
read; pushing harder produced a "melting" face) and **coherent hands** (the base-mesh inverse-distance hand skinning
collapses fingers/forearms into tendrils on the posed, decimated export). Those two need a human artist.

## What we are asking the specialist to do (primary work)
1. **Face and head sculpt** → approachable stylized management-game worker; softer brow/jaw/nose/cheeks/ears/neck;
   no ogre / superhero / mannequin / photoreal read; **hard-hat-compatible silhouette**.
2. **Hands, wrists, forearms** → repair weighting and deformation; preserve palm, thumb, grouped fingers, wrist and
   forearm volume; eliminate melting / stretching / tendrils / collapse / joint pinch; **validate across all six
   existing clips**.
3. **Minor finishing** → residual boot toe seam; close-range neck fold; proportional balance where needed;
   garment/body clipping introduced by manual corrections.

This is **not** a full character redesign.

## The rest of the package
- `CHARACTER-TECHNICAL-CONTRACT.md` — the hard contracts to preserve (skeleton, bone names, orientation, scale,
  ground, six clips, GLB/LOD/material conventions, runtime compatibility).
- `CHARACTER-KNOWN-DEFECTS.md` — annotated defects with exact evidence image paths.
- `CHARACTER-ACCEPTANCE-TESTS.md` — the visual acceptance tests + required specialist reviews.
- `CHARACTER-SOURCE-AND-PROVENANCE.md` — source assets, the procedural generator, and the CC0 provenance chain.
- `CHARACTER-EXPORT-AND-RUNTIME-GUIDE.md` — how to export, validate, and review in the runtime.
- `CHARACTER-HUMAN-ARTIST-SCOPE-OF-WORK.md` — exact required deliverables + non-goals.
- `EVIDENCE-INDEX.md` — pointers to the existing 05H and 05I proof (no large binaries duplicated).

## Ground rules
Preserve the pipeline; correct only the named blockers. Any **topology, weight, shape-key, or material change must
be explicitly documented**. No new final skeleton or animation library without separate owner authorization. A
validator pass alone is **not** acceptance — the corrected asset must pass Character Art + Rigging + Technical Art +
real-GPU runtime review, then owner visual approval.
