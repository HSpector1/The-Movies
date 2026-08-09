// ── Soundstage composer specs (D1-B) ──────────────────────────────────────────
//
// A soundstage is described by ONE typed literal — a StageSpec — which the baker in
// assets.ts turns into a texture. This is deliberately NOT a generalized building-parts
// kit and NOT a content schema: it is a readable parameter object over the modularity
// assets.ts already had (beginBuilding / drawWalls / the roof primitives), covering only
// the axes that actually distinguish one soundstage from another at the management camera.
//
// What lives here: the axes + the stage literals. Nothing draws, nothing imports Phaser,
// so the specs are plain data and unit-testable. Drawing lives in assets.ts.
//
// Scope note (D1-B Checkpoint A): the authorization lists "facade/massing treatment" as an
// axis the spec MAY cover. Stage A has no facade articulation to express, so that axis is
// deliberately ABSENT rather than added as an inert field — it arrives with the Stage B
// variant, and its cost is part of the honest Stage B marginal-cost measurement.

import { COLORS as K } from './palette'

/** The lit/shadow/roof colour family a stage is built from. */
export type StagePalette = {
  /** lit wall face (+gx face at gy=fd) */
  wallRight: number
  /** shadowed wall face (+gy face at gx=fw) */
  wallLeft: number
  /** roof colour at the eave (the first, widest band) */
  roofBase: number
  /** roof shading ramp start — interpolated toward roofShadeTo up the vault */
  roofShadeFrom: number
  /** roof shading ramp end (the crown) */
  roofShadeTo: number
  /** elephant-door face */
  doorFill: number
  /** vertical seams dividing the door leaves */
  doorSeam: number
}

/**
 * Roof form. `kind` is a discriminant from the start so a second form can be added
 * additively for Stage B without reshaping the spec. Only 'barrel' — the vaulted
 * soundstage roof the lot already has — is implemented at Checkpoint A.
 */
export type StageRoofSpec = {
  kind: 'barrel'
  /** vertical rise above the eave, in px; also the texture's headroom (topExtra) */
  rise: number
  /** stacked shrinking rhombi that fake the vault profile */
  bands: number
}

/** The elephant doors on the +gy (front-left) face. */
export type StageDoorSpec = {
  /** inset from each end of the door face, in tiles */
  inset: number
  /** door height as a fraction of the wall height */
  heightFrac: number
  /** number of door leaves; (leaves - 1) vertical seams are drawn */
  leaves: number
}

/** Everything the baker needs to compose one soundstage. */
export type StageSpec = {
  /** texture key the baker registers this stage under */
  key: string
  /** footprint in tiles: fw along +gx, fd along +gy */
  bays: { fw: number; fd: number }
  /** wall height in px (the eave); roof rise sits above it */
  wallH: number
  roof: StageRoofSpec
  doors: StageDoorSpec
  palette: StagePalette
}

/** The buff hangar family the existing soundstage is painted in. */
export const BUFF_STAGE_PALETTE: StagePalette = {
  wallRight: K.buffRight,
  wallLeft: K.buffLeft,
  roofBase: K.buff,
  roofShadeFrom: K.buffLeft,
  roofShadeTo: 0xf3e6c6,
  doorFill: K.stageDoor,
  doorSeam: K.stageDoorSeam,
}

/**
 * The pre-D1-B soundstage, re-expressed as a spec. Every value is transcribed from the
 * original `bakeStage()` (assets.ts @ aadbd63): fw/fd 4, H 78, rise 34, five barrel bands,
 * doors inset 0.7 tiles running to 72% of wall height with four seams (five leaves).
 *
 * This is the BASELINE spec: with the soundstage content flag OFF the lot bakes exactly
 * this, under the original `b-stage` key, for both stages — byte-for-byte the pre-spike lot.
 */
export const LEGACY_STAGE: StageSpec = {
  key: 'b-stage',
  bays: { fw: 4, fd: 4 },
  wallH: 78,
  roof: { kind: 'barrel', rise: 34, bands: 5 },
  doors: { inset: 0.7, heightFrac: 0.72, leaves: 5 },
  palette: BUFF_STAGE_PALETTE,
}

/**
 * Stage A. At Checkpoint A this is the legacy stage re-expressed through the composer —
 * identical geometry under its own key — so that "Stage A through the composer" is provably
 * the lot we already shipped. Stage B's distinct variant is Checkpoint B work.
 */
export const STAGE_A: StageSpec = {
  ...LEGACY_STAGE,
  key: 'b-stage-a',
}

/**
 * Stage B. Checkpoint A ships it as a copy of Stage A under its own key: the composer and
 * the per-stage texture wiring are proven first, and the visual differentiation is the
 * measured Checkpoint B step. It is NOT yet visually distinct — see the Checkpoint A report.
 */
export const STAGE_B: StageSpec = {
  ...LEGACY_STAGE,
  key: 'b-stage-b',
}
