// ── Soundstage composer specs (D1-B) ──────────────────────────────────────────
//
// A soundstage is described by ONE typed literal — a StageSpec — which the baker in
// assets.ts turns into a texture. This is deliberately NOT a generalized building-parts
// kit and NOT a content schema: it is a readable parameter object over the modularity
// assets.ts already had (beginBuilding / drawWalls / the roof primitives), covering only
// the axes two authored soundstages actually need.
//
// Per the Checkpoint A ruling, no axis exists unless an authored variant uses it: roof
// COLOURS live inside the roof union (barrel and sawtooth need different ones, and neither
// carries the other's), and `facade` / `doors.lintel` are optional because Stage A has
// neither. Nothing here is inert.
//
// What lives here: the axes + the stage literals. Nothing draws, nothing imports Phaser,
// so the specs are plain data and unit-testable. Drawing lives in assets.ts.

import { COLORS as K } from './palette'

/** The wall + door colour family a stage is built from. Roof colours live on the roof. */
export type StagePalette = {
  /** lit wall face (the +gy face at gy=fd) */
  wallRight: number
  /** shadowed wall face (the +gx face at gx=fw) */
  wallLeft: number
  /** elephant-door face */
  doorFill: number
  /** vertical seams dividing the door leaves */
  doorSeam: number
}

/**
 * Roof form — the primary silhouette differentiator, so each form carries its own colours.
 *
 *  • barrel   — the vaulted hangar roof the lot shipped with (Stage A).
 *  • sawtooth — north-light serrated roof: sloping solid planes alternating with glazed
 *               verticals (Stage B). Period-correct industrial vocabulary, and the most
 *               legible silhouette change available at the management camera.
 */
export type StageRoofSpec =
  | {
      kind: 'barrel'
      /** vertical rise above the eave, px; also the texture headroom */
      rise: number
      /** stacked shrinking rhombi that fake the vault profile */
      bands: number
      /** the widest band, at the eave */
      base: number
      /** shading ramp start, interpolated toward shadeTo up the vault */
      shadeFrom: number
      /** shading ramp end, at the crown */
      shadeTo: number
    }
  | {
      kind: 'sawtooth'
      /** vertical rise above the eave, px; also the texture headroom */
      rise: number
      /** number of teeth across the +gx axis */
      teeth: number
      /** the sloping roof planes */
      solid: number
      /**
       * The fascia closing each tooth against the lit wall plane.
       *
       * This face sits on the +gy elevation, which drawWalls treats as the LIT side, so it
       * must carry a lit tone. The first pass used a shadow tone here and it became the
       * darkest element on the whole elevation — 63 luma below the wall it meets, and below
       * both the slope and the glazing — which read as an unresolved black opening rather
       * than a roof edge.
       */
      fascia: number
      /** the vertical north-light glazing between teeth */
      glazing: number
    }

/** The elephant doors on the lit (+gy) face. */
export type StageDoorSpec = {
  /** inset from each end of the door face, in tiles */
  inset: number
  /** door height as a fraction of the wall height */
  heightFrac: number
  /** number of door leaves; (leaves - 1) vertical seams are drawn */
  leaves: number
  /** optional header beam over the opening — decorative trim, dropped when under-dressed */
  lintel?: { depth: number; color: number }
}

/** Vertical buttress rhythm on the lit face. Absent ⇒ a plain wall (Stage A). */
export type StageFacadeSpec = {
  /** buttress strips, evenly spaced across the face */
  pilasters: number
  /** strip width in tiles */
  width: number
  color: number
}

/** Everything the baker needs to compose one soundstage. */
export type StageSpec = {
  /** texture key the baker registers this stage under */
  key: string
  /** footprint in tiles: fw along +gx, fd along +gy */
  bays: { fw: number; fd: number }
  /** wall height in px (the eave); the roof rise sits above it */
  wallH: number
  roof: StageRoofSpec
  doors: StageDoorSpec
  palette: StagePalette
  facade?: StageFacadeSpec
}

/** The buff hangar family the original soundstage is painted in. */
const BUFF_WALLS: StagePalette = {
  wallRight: K.buffRight,
  wallLeft: K.buffLeft,
  doorFill: K.stageDoor,
  doorSeam: K.stageDoorSeam,
}

/** The pale stucco family already used by Development / Casting / the Theater. */
const CREAM_WALLS: StagePalette = {
  wallRight: K.creamRight,
  wallLeft: K.creamLeft,
  doorFill: K.stageDoor,
  doorSeam: K.stageDoorSeam,
}

/**
 * The pre-D1-B soundstage, re-expressed as a spec. Every value transcribed from the
 * original `bakeStage()` (assets.ts @ aadbd63): fw/fd 4, H 78, rise 34, five barrel bands,
 * doors inset 0.7 tiles running to 72% of wall height with four seams (five leaves).
 *
 * This is the BASELINE spec: with the soundstage content flag OFF the lot bakes exactly
 * this, under the original `b-stage` key, for both stages — the pre-spike lot.
 */
export const LEGACY_STAGE: StageSpec = {
  key: 'b-stage',
  bays: { fw: 4, fd: 4 },
  wallH: 78,
  roof: { kind: 'barrel', rise: 34, bands: 5, base: K.buff, shadeFrom: K.buffLeft, shadeTo: 0xf3e6c6 },
  doors: { inset: 0.7, heightFrac: 0.72, leaves: 5 },
  palette: BUFF_WALLS,
}

/**
 * STAGE A — the lot's original barrel-vault hangar, unchanged.
 * It carries the baseline stage vocabulary: buff stucco, a smooth vaulted roof, and one
 * wide five-leaf elephant door filling the facade. Identical to LEGACY_STAGE but for the key.
 */
export const STAGE_A: StageSpec = {
  ...LEGACY_STAGE,
  key: 'b-stage-a',
}

/**
 * STAGE B — the later, steel-framed stage.
 *
 * Same studio, built in a different decade: same 4×4 footprint, same flat-shaded stucco
 * language, same elephant-door grammar, same lot palette. It differs where the management
 * camera can actually see it:
 *
 *   silhouette / roof   a serrated north-light sawtooth instead of a smooth vault
 *   massing             taller walls (92 vs 78) under a shallower roof (26 vs 34), so it
 *                       reads as an upright box where Stage A reads as a low dome
 *   facade rhythm       three buttress pilasters break the blank wall into bays
 *   large colour field  pale cream stucco + slate roof against Stage A's buff + buff vault
 *   door composition    one narrower three-leaf opening under a brass header beam,
 *                       rather than a single wide five-leaf door
 *
 * The footprint is deliberately unchanged: layout.ts, the stage aprons and the paved
 * loading zones are all authored against 4×4, and moving it would have meant re-authoring
 * placement for no silhouette gain.
 */
export const STAGE_B: StageSpec = {
  key: 'b-stage-b',
  bays: { fw: 4, fd: 4 },
  wallH: 92,
  roof: {
    kind: 'sawtooth',
    rise: 26,
    teeth: 3,
    solid: K.roofFlat,
    // A lit roof edge: 25 luma above the slope it caps and 16 below the wall it meets, so
    // it separates cleanly from both without becoming a void or merging into the stucco.
    fascia: K.wallStuccoR,
    glazing: K.glass,
  },
  doors: {
    inset: 1.2,
    heightFrac: 0.55,
    leaves: 3,
    lintel: { depth: 7, color: K.brass },
  },
  palette: CREAM_WALLS,
  // Expressed structural ribs — a concrete frame against stucco infill. The colour has to
  // sit clear of BOTH wall tones: the first render used the family's own highlight and the
  // ribs vanished, and its shadow tone is literally the shadowed wall face, so neither
  // carries articulation on the lit elevation. Taupe is a lot-palette tone (the
  // Administration family) a full value step below the cream, so the rhythm actually reads.
  facade: { pilasters: 3, width: 0.28, color: K.taupeLeft },
}
