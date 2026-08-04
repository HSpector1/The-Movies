// ── Studio Identity Manifest (D1-A) ──────────────────────────────────────────────
//
// A PRESENTATION-ONLY description of the studio's visual identity: name treatment,
// emblem, palette, signage labels, marquee. It is data the Phaser lot paints — it is
// NOT simulation state. Deliberately, this type has NO field for stage occupancy,
// production titles, weeks, money, release state, unlocks, or player decisions; those
// come only from the StudioLotSnapshot. Changing a manifest field just repaints the
// identity; it can never change what the sim is doing.
//
// D1-A ships ONE concept (A — Golden Age Deco) plus the untouched D1 baseline. Concepts
// B/C are reserved for owner-authorized expansion; the shape below already supports them.
// The default review identity is provisional review content, not final franchise branding.

/** Hex colours as Phaser 0xRRGGBB numbers (canvas), never functional-state colours. */
export type IdentityPalette = {
  primary: number // brass / gold — the identity's "hero" accent
  secondary: number // charcoal — deep structural tone
  accent: number // burgundy — signage/marquee highlight
  light: number // cream — sign faces, lettering
  dark: number // near-black — plaque grounds, shadow
  neutral: number // warm stone — trims
  positive: number // release / good news (paired ALWAYS with icon+text, never colour-only)
  warning: number // financial-pressure attention (paired ALWAYS with icon+text)
}

/** Per-destination signage labels. Mirrors the canonical BUILDING_LABELS but is a
 * manifest concern so a rename never touches scene code. */
export type IdentitySignage = {
  gateLabel: string
  stageALabel: string
  stageBLabel: string
  postLabel: string
  theaterLabel: string
  administrationLabel: string
  castingLabel: string
  developmentLabel: string
  expansionLabel: string
}

/** How the procedural emblem is drawn. Original geometry only — no external art. */
export type IdentityEmblem = {
  geometry: 'crest' | 'seal' | 'monogram' | 'spotlight'
  lineWeight: number
  inset: number
  /** How the accent colour is applied ('rays' | 'ring' | 'bar' | 'plain'). */
  accentMode: string
}

/** Theater marquee treatment. Motion is decorative and freezes under reduced motion. */
export type IdentityMarquee = {
  borderStyle: 'deco' | 'industrial' | 'modern'
  /** Bulbs per edge (0 = none). Deterministic; a phase runs only when motion is allowed. */
  bulbDensity: number
  reducedMotionMode: 'static'
}

export type StudioIdentityManifest = {
  id: string
  displayName: string
  shortName: string
  monogram: string
  palette: IdentityPalette
  signage: IdentitySignage
  emblem: IdentityEmblem
  marquee: IdentityMarquee
}

// ── Default provisional review content (name only — not final branding) ────────────
const DEFAULT_DISPLAY_NAME = 'PROJECT STUDIO'
const DEFAULT_SHORT_NAME = 'PS Studios'
const DEFAULT_MONOGRAM = 'PS'

const CANONICAL_SIGNAGE: IdentitySignage = {
  gateLabel: DEFAULT_DISPLAY_NAME,
  stageALabel: 'STAGE A',
  stageBLabel: 'STAGE B',
  postLabel: 'PRODUCTION / POST',
  theaterLabel: 'THEATER',
  administrationLabel: 'ADMINISTRATION',
  castingLabel: 'CASTING',
  developmentLabel: 'DEVELOPMENT',
  expansionLabel: 'FOR EXPANSION',
}

/** Concept A — GOLDEN AGE DECO. Refined geometric crest; cream / charcoal / burgundy /
 * muted gold; horizontal stage plaques; elegant, restrained marquee. Strongest prestige
 * read and connection to classic studio history. Original — imitates no commercial studio. */
export const CONCEPT_A_GOLDEN_AGE: StudioIdentityManifest = {
  id: 'concept-a-golden-age-deco',
  displayName: DEFAULT_DISPLAY_NAME,
  shortName: DEFAULT_SHORT_NAME,
  monogram: DEFAULT_MONOGRAM,
  palette: {
    primary: 0xc9a24a, // muted gold / brass (== product --accent)
    secondary: 0x2b2822, // charcoal
    accent: 0x7c2e35, // deep burgundy
    light: 0xf1e6cc, // cream
    dark: 0x171310, // near-black plaque ground
    neutral: 0xbdb08e, // warm stone trim
    positive: 0x4bbf7a, // release good-news (icon+text always paired)
    warning: 0xd98a3a, // financial-pressure amber (icon+text always paired)
  },
  signage: CANONICAL_SIGNAGE,
  emblem: { geometry: 'crest', lineWeight: 2, inset: 3, accentMode: 'rays' },
  marquee: { borderStyle: 'deco', bulbDensity: 7, reducedMotionMode: 'static' },
}

/** Which identity the lot renders. 'baseline' = untouched D1; 'concept-a' = the identity
 * layer; 'fallback' = identity attempted but degraded to the base presentation (proof that
 * no navigation or state is lost when identity rendering fails). */
export type IdentityMode = 'baseline' | 'concept-a' | 'fallback'

/** Registry of shippable concepts (D1-A: Concept A only; B/C reserved). */
export const IDENTITY_CONCEPTS: Record<string, StudioIdentityManifest> = {
  'concept-a': CONCEPT_A_GOLDEN_AGE,
}

/** The active manifest for a review mode. baseline/fallback carry the manifest too (so the
 * fallback can still label with the canonical names) but the scene renders them plainly.
 * D1-A ships only Concept A, so every mode resolves to it; B/C will branch here. */
export function manifestFor(_mode: IdentityMode): StudioIdentityManifest {
  return CONCEPT_A_GOLDEN_AGE
}

/** Hex helper: 0xRRGGBB → "#rrggbb" for Phaser Text colours. */
export function hex(n: number): string {
  return '#' + (n & 0xffffff).toString(16).padStart(6, '0')
}
