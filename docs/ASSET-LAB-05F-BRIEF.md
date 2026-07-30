# Asset Lab 05F — Hero Crew Character Proof (Brief)

## The one narrow question
> Can the current original Project: Studio Blender pipeline produce ONE genuinely convincing stylized
> game character at human-review distance — without replacing the skeleton, animation library, export
> pipeline, or runtime?

## What this is / is not
- **Is:** one additive, hero-quality **Electric** character (`Char_ElectricHero`, source
  `blender/studio_pipeline/character_hero.py`) built on the accepted 05E pipeline, rebuilding the
  regions the owner rejected at human scale. A direct A/B against the accepted 05E Electric.
- **Is NOT:** a role-wide propagation, a population rebuild, or any production integration. The other
  seven 05E roles and the 05E Electric GLBs are untouched.

## Starting baseline (verified)
Branch `asset-lab-05e-character-art-cleanup-loop` @ `6169574`; new work on
`asset-lab-05f-hero-electric-character-proof` branched from it. Backup remote `HSpector1/The-Movies`.

## 05E Electric — owner-confirmed defects (the targets), on a real M3 through the review harness
A inflated safety vest (three rings + rigid rails) · **B rear pelvis / trouser seat = detached diaper
shell (most important)** · C front crotch mechanical protrusion · D shoulder/sleeve wedges · E thin/
flat hands · F block-like boots · G flat generic face · H bent poses expose the modeling.

## Approach (isolation-safe)
`character_hero.py` is separate from `character2.py` (05E source — untouched). It reuses the strong 05E
constructs (lofted torso, tube arms, face) and the low-level primitives (SkinnedBuilder, loft, tube,
materials, the 65-bone rig), and **rebuilds the weak regions as intentional continuous surfaces**,
one region per iteration (max 6): pelvis/trousers → vest → shoulders/hands → boots → deformation →
face/materials/LODs. Each iteration: build → neutral render → six-clip deformation → specialist review
(≥1 technical + ≥1 visual) → score → accept/revise/revert → commit.

## Locked (not reopened)
Rig forward −Y at identity, 65 joints, six accepted clips, coordinate + GLB export conventions, no
voxel-remesh body, no painted-region fake clothing, 0 unweighted / 0 bad-sum, LOD skeleton/height
consistency, deterministic generation, no external asset dependency, no add-ons.

## Pass bar
The hero must **clearly exceed the 05E Electric at human scale** (continuous seat, fitted vest,
integrated shoulders, intentional hands, real work boots, believable face) while keeping every technical
invariant and staying additive. It does not need to be photorealistic. Verdict scale: FAIL / CONDITIONAL
PASS / PASS WITH NOTES / PASS → then Howard's real-GPU (M3) review. No propagation without separate
owner authorization.
