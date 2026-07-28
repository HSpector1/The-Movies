// Pure formatting helpers for the UI (no simulation logic; display only).

export function money(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`
  return `${sign}$${abs.toFixed(0)}`
}

export function moneyExact(n: number): string {
  const sign = n < 0 ? '-' : ''
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`
}

export function score(n: number, digits = 1): string {
  return n.toFixed(digits)
}

// Player-facing Star Power — always a WHOLE number (round). The simulation keeps the
// authoritative fractional value (sorting/RNG/reception read it); this is presentation
// only (D-11.A A5). Centralized so no screen re-formats Star Power locally.
export function starPower(n: number): string {
  return String(Math.round(n))
}

// Player-facing age — COMPLETED whole years (floor). Never rounds up before a birthday
// (D-11.A A5). The simulation keeps the authoritative value. Centralized.
export function ageYears(n: number): string {
  return String(Math.floor(n))
}

export function pct(n: number, digits = 0): string {
  return `${(n * 100).toFixed(digits)}%`
}

export function signed(n: number, digits = 1): string {
  const s = n.toFixed(digits)
  return n > 0 ? `+${s}` : s
}

export function axis(n: number): string {
  return n.toFixed(2)
}

export function deltaClass(n: number): 'pos' | 'neg' | 'zero' {
  if (n > 0.0005) return 'pos'
  if (n < -0.0005) return 'neg'
  return 'zero'
}

// Plain-language descriptions for shape / promise / band, so no raw formula is
// shown to the player.
export function bandLabel(band: 'weak' | 'mixed' | 'strong'): string {
  return band === 'weak' ? 'Weak' : band === 'mixed' ? 'Mixed' : 'Strong'
}

export function confidenceLabel(c: 'low' | 'medium' | 'high'): string {
  return c === 'low' ? 'Low confidence' : c === 'medium' ? 'Medium confidence' : 'High confidence'
}

const FACTOR_LABELS: Record<string, string> = {
  castFame: 'Star power in the cast',
  roleFit: 'Cast fits the roles well',
  directorSkill: 'Strong director',
  scriptStrength: 'Strong script',
  shapeAffinity: 'Shape favors key segments',
  segmentTaste: 'Matches an audience taste',
  culturalTiming: 'Good cultural timing',
  unknownLead: 'Lead is not yet a known draw',
  untestedDirectorGenre: 'Director untested in this genre',
  noSegmentHistory: 'No track record with these segments',
  vaguePromise: 'The promise is vague',
}
export function factorLabel(key: string): string {
  return FACTOR_LABELS[key] ?? key
}

const SEGMENT_LABELS: Record<string, string> = {
  youngAdult: 'Young Adult',
  family: 'Family',
  adult: 'Adult',
  prestige: 'Prestige',
}
export function segmentLabel(id: string): string {
  return SEGMENT_LABELS[id] ?? id
}
