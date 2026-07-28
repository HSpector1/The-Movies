// ── Meridian scene-scale standard (metres) ────────────────────────────────────
// ONE unit = 1 metre. The 1.8 m adult is THE reference; everything is authored or
// normalized to these numbers so people never read oversized (Gate-B owner finding:
// the imported Kenney crew rendered ~2.7 m). Values follow the approved scale sheet
// in `01-ART-DIRECTION.md`. Full rationale in docs/M3-SCENE-SCALE.md.

export const SCALE = {
  ADULT: 1.8, // the unit
  DOORWAY: 2.2, // office/bungalow door (~1.2× a person)
  STUDIO_CAR: 1.6, // roof height of a period car
  PRODUCTION_VAN: 2.6, // roof height of the production van/truck
  TRAILER: 3.0, // talent trailer
  EQUIPMENT_CASE: 1.0, // road case / equipment crate
  ELEPHANT_DOOR: 7.0, // soundstage elephant door (a truck passes under)
  GATE_CLEARANCE: 5.0, // gate arch clearance
  SOUNDSTAGE: 13, // dominant mass
  ADMIN: 17, // civic anchor
  WATER_TOWER: 18, // tallest landmark
  PALM: 9, // shade tree
} as const

// The Kenney "Blocky Characters" adult renders ~2.72 m at native scale (its rest-pose
// bounding box; the M2 survey under-called this as a pure Box3 artifact, but on real
// hardware the figure is genuinely oversized). Normalize the ROOT so a standing adult
// ≈ SCALE.ADULT. Owner guidance: "begin with ~0.67, then validate visually." This
// computes to ≈0.662; validated against the reference lineup (m3-scale.html) and tuned
// there if the measured scaled height drifts from 1.8 m.
export const KENNEY_ADULT_NATIVE_HEIGHT = 2.72
export const CHARACTER_ROOT_SCALE = SCALE.ADULT / KENNEY_ADULT_NATIVE_HEIGHT // ≈ 0.662 (~0.67)
