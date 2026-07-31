// ── Lot layout — an intentionally composed studio lot ─────────────────────────
// Not procedurally scattered: buildings, roads, a central courtyard, landscaping
// and expansion pads are placed by hand on a logical grid. The scene reads this
// data and paints it. Grid convention: +gx runs down-right, +gy runs down-left.

import type { BuildingId } from '../snapshot/StudioLotSnapshot'
import { BUILDING_TEX } from './assets'

export const LOT_W = 24 // tiles along gx
export const LOT_D = 22 // tiles along gy

export type Rect = { x0: number; y0: number; x1: number; y1: number }

export type PlacedBuilding = {
  id: BuildingId
  texKey: string
  gx: number // origin tile (back corner of footprint)
  gy: number
  fw: number
  fd: number
  label: string
  blurb: string
}

export type PropPlacement = {
  texKey: string
  gx: number
  gy: number
  /** deterministic jitter magnitude in tiles (scene applies via seeded rng) */
  jitter?: number
}

/** Per-stage anchors for the production-activity dressing (apron, gear, crew). */
export type StageApron = {
  /** ground point directly in front of the stage doors */
  door: { gx: number; gy: number }
  /** where the equipment cluster sits */
  gear: { gx: number; gy: number }
  /** small crew loiter points */
  crew: { gx: number; gy: number }[]
  /** where a production vehicle parks when the stage is active */
  park: { gx: number; gy: number }
}

// Stage door faces are the +gy side of each 4x4 stage (see assets.bakeStage).
export const STAGE_APRONS: Record<'stage-a' | 'stage-b', StageApron> = {
  'stage-a': {
    door: { gx: 17, gy: 6 },
    gear: { gx: 15.7, gy: 6.5 },
    crew: [
      { gx: 18.1, gy: 6.4 },
      { gx: 17.1, gy: 6.7 },
      { gx: 16.4, gy: 6.9 },
    ],
    park: { gx: 19, gy: 6.6 },
  },
  'stage-b': {
    door: { gx: 17, gy: 13 },
    gear: { gx: 15.7, gy: 13.5 },
    crew: [
      { gx: 18.1, gy: 13.4 },
      { gx: 17.1, gy: 13.7 },
      { gx: 16.4, gy: 13.9 },
    ],
    park: { gx: 19, gy: 13.6 },
  },
}

// Footprints come from the baked textures so placement and art never disagree.
function fp(id: keyof typeof BUILDING_TEX): { fw: number; fd: number } {
  const t = BUILDING_TEX[id]
  return { fw: t.fw, fd: t.fd }
}

/** The nine addressable buildings, placed. Stage A/B share the stage texture. */
export function placedBuildings(): PlacedBuilding[] {
  return [
    {
      id: 'admin',
      texKey: BUILDING_TEX.admin.key,
      gx: 9,
      gy: 2,
      ...fp('admin'),
      label: 'Administration',
      blurb: 'The front office. Studio standing, cash, and the week at a glance.',
    },
    {
      id: 'writers',
      texKey: BUILDING_TEX.writers.key,
      gx: 3,
      gy: 3,
      ...fp('writers'),
      label: 'Development',
      blurb: 'Where pictures begin. Develop and assemble a new film.',
    },
    {
      id: 'casting',
      texKey: BUILDING_TEX.casting.key,
      gx: 3,
      gy: 9,
      ...fp('casting'),
      label: 'Casting / Talent',
      blurb: 'Browse and sign the talent who will carry your pictures.',
    },
    {
      id: 'stage-a',
      texKey: BUILDING_TEX.stage.key,
      gx: 15,
      gy: 2,
      ...fp('stage'),
      label: 'Stage A',
      blurb: 'A working soundstage. Whatever is shooting here, shoots here.',
    },
    {
      id: 'stage-b',
      texKey: BUILDING_TEX.stage.key,
      gx: 15,
      gy: 9,
      ...fp('stage'),
      label: 'Stage B',
      blurb: 'The second stage. Dark until a second picture is greenlit.',
    },
    {
      id: 'post',
      texKey: BUILDING_TEX.post.key,
      gx: 16,
      gy: 16,
      ...fp('post'),
      label: 'Production / Post',
      blurb: 'Cutting, scoring, and finishing. Review pictures in the pipeline.',
    },
    {
      id: 'theater',
      texKey: BUILDING_TEX.theater.key,
      gx: 3,
      gy: 15,
      ...fp('theater'),
      label: 'Theater',
      blurb: 'The house lights dim. View recently released films.',
    },
    {
      id: 'gate',
      texKey: 'p-gate',
      gx: 9,
      gy: 19,
      fw: 1,
      fd: 3,
      label: 'Studio Gate',
      blurb: 'The front gate. Every studio needs an entrance worth arriving at.',
    },
    {
      id: 'expansion',
      texKey: '', // no building — a marked open pad
      gx: 8,
      gy: 15,
      fw: 4,
      fd: 3,
      label: 'Future Expansion',
      blurb: 'Reserved for future studio growth. Not available in D1.',
    },
  ]
}

// ── ground zoning ─────────────────────────────────────────────────────────────

export const ROADS: Rect[] = [
  { x0: 12, y0: 0, x1: 13, y1: 21 }, // spine road: production access, separates districts
  { x0: 0, y0: 7, x1: 23, y1: 8 }, // cross avenue
  { x0: 9, y0: 15, x1: 10, y1: 21 }, // studio boulevard: the gate → plaza approach (2-wide)
]

export const PLAZA: Rect[] = [
  { x0: 7, y0: 10, x1: 11, y1: 14 }, // central courtyard the boulevard runs into
]

// Paved aprons directly in front of each soundstage's doors (loading zones).
export const APRONS: Rect[] = [
  { x0: 15, y0: 6, x1: 18, y1: 6 }, // stage-a
  { x0: 15, y0: 13, x1: 18, y1: 13 }, // stage-b
]

export const PATHS: Rect[] = [
  { x0: 9, y0: 5, x1: 9, y1: 10 }, // admin → courtyard
  { x0: 5, y0: 5, x1: 5, y1: 9 }, // writers → casting
  { x0: 5, y0: 14, x1: 9, y1: 14 }, // theater → courtyard
]

export const EXPANSION_PADS: Rect[] = [
  { x0: 8, y0: 15, x1: 11, y1: 17 }, // graded dirt pad (matches expansion building blurb)
]

// ── landscaping & dressing ────────────────────────────────────────────────────
// Placed relative to the composition: palms line the entry drive, hedges frame the
// courtyard, lamps follow the roads, the water tower stands behind the stages.

/** Always-present greenery and dressing — the lot's permanent bones. */
export function landscaping(): PropPlacement[] {
  const props: PropPlacement[] = []

  // iconic water tower behind the stages (the lot's landmark)
  props.push({ texKey: 'p-tower', gx: 21, gy: 5 })

  // palms lining the studio boulevard up to the gate — the approach
  for (let gy = 15; gy <= 20; gy += 1.7) {
    props.push({ texKey: 'p-palm', gx: 8.2, gy, jitter: 0.1 })
    props.push({ texKey: 'p-palm', gx: 10.8, gy, jitter: 0.1 })
  }

  // hedges framing the courtyard corners
  for (const [gx, gy] of [
    [6.4, 9.4],
    [11.6, 9.4],
    [6.4, 14.6],
    [11.6, 14.6],
  ] as const) {
    props.push({ texKey: 'p-hedge', gx, gy })
  }

  // courtyard furniture
  props.push({ texKey: 'p-bench', gx: 7.6, gy: 11.4 })
  props.push({ texKey: 'p-bench', gx: 11.2, gy: 12.6 })
  props.push({ texKey: 'p-planter', gx: 7.5, gy: 13, jitter: 0.05 })
  props.push({ texKey: 'p-planter', gx: 11.4, gy: 11, jitter: 0.05 })

  // lamp posts along the cross avenue
  for (let gx = 2; gx <= 22; gx += 4) props.push({ texKey: 'p-lamp', gx, gy: 6.4 })
  // lamp posts flanking the boulevard
  for (let gy = 9; gy <= 20; gy += 3.5) {
    props.push({ texKey: 'p-lamp', gx: 8.4, gy })
    props.push({ texKey: 'p-lamp', gx: 10.6, gy })
  }

  // planters + a directional sign flanking the admin forecourt
  props.push({ texKey: 'p-planter', gx: 8.4, gy: 5.4 })
  props.push({ texKey: 'p-planter', gx: 11.6, gy: 5.4 })
  props.push({ texKey: 'p-sign', gx: 11.4, gy: 9 })

  // a few palms softening the west lawn
  props.push({ texKey: 'p-palm', gx: 6.5, gy: 6.5, jitter: 0.15 })
  props.push({ texKey: 'p-palm', gx: 2.4, gy: 12.5, jitter: 0.15 })

  // guard booth + flanking palms at the studio gate (the arrival)
  props.push({ texKey: 'p-booth', gx: 11.2, gy: 20.2 })
  props.push({ texKey: 'p-palm', gx: 7.4, gy: 20.6, jitter: 0.05 })
  props.push({ texKey: 'p-palm', gx: 11.9, gy: 18.4, jitter: 0.05 })

  return props
}

/**
 * Extra dressing shown only when the studio is doing well (established/prestige).
 * This is authored environmental storytelling, not a global tint: premiere
 * banners on the boulevard, a studio flag, café life in the plaza, lusher beds.
 */
export function establishedDressing(): PropPlacement[] {
  return [
    // premiere banners flanking the boulevard approach
    { texKey: 'p-bannerpole', gx: 8.4, gy: 16.5 },
    { texKey: 'p-bannerpole', gx: 10.6, gy: 16.5 },
    { texKey: 'p-bannerpole', gx: 8.4, gy: 13 },
    { texKey: 'p-bannerpole', gx: 10.6, gy: 13 },
    // studio flag on the admin forecourt
    { texKey: 'p-flag', gx: 10, gy: 5.2 },
    // café life in the plaza
    { texKey: 'p-umbrella', gx: 7.7, gy: 12 },
    { texKey: 'p-umbrella', gx: 11.3, gy: 13.4 },
    // lusher planting
    { texKey: 'p-planter', gx: 6.6, gy: 11 },
    { texKey: 'p-planter', gx: 12.4, gy: 14 },
    { texKey: 'p-palm', gx: 13.4, gy: 3, jitter: 0.12 },
  ]
}
