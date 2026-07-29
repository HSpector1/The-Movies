# Asset Lab 05B — Brief

## Purpose
Repair/rebuild the Blender-authored crew-character system. The Lab 05 technical pipeline passed
but the **character visual result was rejected** by the owner on a real Apple M3 GPU. Objective: a
clean, reusable, **stylized** crew-character foundation (management/simulation-game fidelity — think
Two Point tier, not AAA realism) that faces the right way, has a real face and real clothing,
deforms correctly under the approved CC0 animation library, supports role + appearance variation,
exports predictably to GLB, stays performant, and can be regenerated + validated automatically.

## Isolation (unchanged)
- Work only in `/Users/bruce/Project Studio - Asset Lab`, branch
  `asset-lab-05b-character-rebuild-loop` (from Lab 05 baseline `f4f60b4`).
- **Preserved untouched:** Scenes A–F, Blender architecture/props, material library, export
  pipeline, manifests, previous proof, the Lab 05 branch + its evidence.
- **Not touched:** the main game, sim contracts, the frozen 3D spike, the lot spike. Gate D not
  opened. OC-01 not started. No production integration.
- **No new dependencies:** installed Blender 5.2 only; no third-party add-ons, no downloaded
  character models, no new animation library, no global packages. All geometry is original.

## Scope of change
Character source files, character-generation scripts, character materials, character rigs/weights,
character exports/LODs, character runtime loading, Scene G **character** presentation, and the
validation/evidence for this correction. Architecture/props touched only if a character-placement
issue demands a small objective fix.

## Method
Root-cause audit → controlled ≤5-iteration loop (each: inspect → rank defects → one coherent
correction cluster → validate in Blender → export GLB → validate bytes → load in Scene G → capture
evidence → score → two independent read-only reviewers → accept/revert). Base character must pass
before role variants. Do not fake a pass; a partial technical result is not a visual pass.

## Deliverables
New: `character2.py` (builder), coordinate/mesh/face/clothing/rigging/role/LOD standards, iteration
log, performance + owner-review + integration docs, `proof/lab05b/**` evidence, automated character
validation, and `npm run blender:characters:*` commands. Commit accepted iterations separately;
back up the branch to the `backup` remote (non-force). Then stop for Howard's real-GPU review.

See: ROOT-CAUSE-AUDIT · CHARACTER-COORDINATE-STANDARD · ITERATION-LOG (+ standards as each
iteration lands).
