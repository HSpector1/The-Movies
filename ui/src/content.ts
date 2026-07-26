// Plain-language, player-facing descriptions of the contracted shape dimensions
// and promise axes. These explain the CREATIVE meaning of each choice in
// understandable terms — no raw formula, never "best". Content only; the numeric
// effects all come from the engine (SHAPE_OPTIONS etc.) at render time.

export const OPENING_LABEL = 'Opening'
export const MIDPOINT_LABEL = 'Midpoint'
export const ENDING_LABEL = 'Ending'

export const SHAPE_DESCRIPTIONS: Record<string, { title: string; desc: string }> = {
  // openings
  immediateAction: {
    title: 'Immediate Action',
    desc: 'Open on movement and momentum — grab the room before it settles.',
  },
  slowSetup: {
    title: 'Slow Setup',
    desc: 'Take time to establish people and place before anything happens.',
  },
  mysteryHook: {
    title: 'Mystery Hook',
    desc: 'Open on a question the audience needs answered.',
  },
  // midpoints
  reversal: {
    title: 'Reversal',
    desc: 'The situation flips — what seemed true no longer is.',
  },
  escalation: {
    title: 'Escalation',
    desc: 'Raise the stakes and the tempo through the middle.',
  },
  revelation: {
    title: 'Revelation',
    desc: 'A truth surfaces that recolors everything before it.',
  },
  // endings
  triumph: {
    title: 'Triumph',
    desc: 'A clear, satisfying win — the audience leaves lifted.',
  },
  bittersweet: {
    title: 'Bittersweet',
    desc: 'A win with a cost — warmth and weight together.',
  },
  tragic: {
    title: 'Tragic',
    desc: 'A downfall carried through to its end.',
  },
  ambiguous: {
    title: 'Ambiguous',
    desc: 'Leave the meaning open for the audience to hold.',
  },
}

export const OPENING_OPTIONS = ['immediateAction', 'slowSetup', 'mysteryHook'] as const
export const MIDPOINT_OPTIONS = ['reversal', 'escalation', 'revelation'] as const
export const ENDING_OPTIONS = ['triumph', 'bittersweet', 'tragic', 'ambiguous'] as const

// Promise axes — the three expressive dimensions the studio promises the audience.
export const PROMISE_AXIS_INFO: Record<
  'intimacy' | 'tonalWeight' | 'kineticEnergy',
  { title: string; low: string; high: string; desc: string }
> = {
  intimacy: {
    title: 'Intimacy',
    low: 'Cold / distant',
    high: 'Warm / personal',
    desc: 'How close and personal the film feels — from detached to deeply human.',
  },
  tonalWeight: {
    title: 'Tonal Weight',
    low: 'Light',
    high: 'Heavy / serious',
    desc: 'How heavy the film sits — from light and breezy to grave and serious.',
  },
  kineticEnergy: {
    title: 'Kinetic Energy',
    low: 'Still / quiet',
    high: 'Fast / physical',
    desc: 'How much motion and physical energy the film carries.',
  },
}

// Genre labels (title-case).
export const GENRE_LABELS: Record<string, string> = {
  comedy: 'Comedy',
  drama: 'Drama',
  crime: 'Crime',
  romance: 'Romance',
  horror: 'Horror',
  adventure: 'Adventure',
}
export function genreLabel(g: string): string {
  return GENRE_LABELS[g] ?? g
}
