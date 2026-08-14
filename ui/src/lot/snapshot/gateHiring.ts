import type {
  LotGateHiringCandidate,
  StudioLotSnapshot,
} from './StudioLotSnapshot.ts'

export type {
  LotGateHiringCandidate,
  LotGateHiringMarket,
} from './StudioLotSnapshot.ts'

export type GateCandidateOwnerIntent = {
  talentId: string
  studioSeed: string
  name: string
  creativeRole: LotGateHiringCandidate['creativeRole']
}

export type GateHiringMarketContext = {
  studioSeed: string
  marketWeek: number
  candidates: LotGateHiringCandidate[]
}

export type GateHiringCandidateContext = {
  marketWeek: number
  candidate: LotGateHiringCandidate
  ownerIntent: GateCandidateOwnerIntent
}

const CANDIDATE_KEYS = [
  'talentId',
  'name',
  'creativeRole',
  'employmentStatus',
  'offerTermWeeks',
] as const

const CREATIVE_ROLES = new Set<LotGateHiringCandidate['creativeRole']>([
  'actor',
  'director',
  'writer',
  'craft',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function hasExactOwnKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  const ownKeys = Object.keys(value)
  return ownKeys.length === keys.length && keys.every((key) => Object.hasOwn(value, key))
}

function hasStrictAscendingTerms(value: unknown): value is number[] {
  if (!Array.isArray(value) || value.length === 0) return false
  let previous = 0
  for (const term of value) {
    if (!Number.isSafeInteger(term) || term <= previous) return false
    previous = term
  }
  return true
}

function isGateHiringCandidate(value: unknown): value is LotGateHiringCandidate {
  if (!isRecord(value) || !hasExactOwnKeys(value, CANDIDATE_KEYS)) return false
  return (
    isNonEmptyString(value.talentId) &&
    isNonEmptyString(value.name) &&
    typeof value.creativeRole === 'string' &&
    CREATIVE_ROLES.has(value.creativeRole as LotGateHiringCandidate['creativeRole']) &&
    value.employmentStatus === 'freeAgent' &&
    hasStrictAscendingTerms(value.offerTermWeeks)
  )
}

/**
 * Resolve exact, display-safe Hiring truth from the Gate projection.
 *
 * This is a strict validation boundary only. It never calls Core, chooses a
 * candidate, derives a rotation epoch, repairs malformed data, or mutates input.
 */
export function gateHiringMarketContext(
  snapshot: StudioLotSnapshot,
): GateHiringMarketContext | null {
  if (
    typeof snapshot.sceneSeed !== 'string' ||
    !Number.isSafeInteger(snapshot.week) ||
    snapshot.week < 0 ||
    !Array.isArray(snapshot.buildings) ||
    !Array.isArray(snapshot.people)
  ) {
    return null
  }

  const projected = snapshot.gateHiringMarket as unknown
  if (
    !isRecord(projected) ||
    !hasExactOwnKeys(projected, ['candidates']) ||
    !Array.isArray(projected.candidates)
  ) {
    return null
  }

  const candidates: LotGateHiringCandidate[] = []
  const candidateIds = new Set<string>()
  for (const value of projected.candidates as unknown[]) {
    if (!isGateHiringCandidate(value) || candidateIds.has(value.talentId)) return null
    candidateIds.add(value.talentId)
    candidates.push(value)
  }

  for (const person of snapshot.people as unknown[]) {
    if (!isRecord(person) || typeof person.id !== 'string') return null
    if (candidateIds.has(person.id)) return null
  }

  const gates = (snapshot.buildings as unknown[]).filter(
    (building): building is Record<string, unknown> =>
      isRecord(building) && building.id === 'gate',
  )
  if (gates.length !== 1 || gates[0]!.available !== true) return null

  const gate = gates[0]!
  const count = candidates.length
  const expectedAttention = count === 0 ? 'empty' : 'active'
  const expectedReason =
    count === 0
      ? 'No candidates with current contract terms'
      : `${String(count)} candidate${count === 1 ? '' : 's'} with current contract terms`
  if (
    gate.attention !== expectedAttention ||
    gate.attentionReason !== expectedReason
  ) {
    return null
  }

  return {
    studioSeed: snapshot.sceneSeed,
    marketWeek: snapshot.week,
    // Preserve canonical projection order and exact candidate objects.
    candidates: projected.candidates as LotGateHiringCandidate[],
  }
}

/** Select one exact candidate by explicit ID. There is deliberately no fallback. */
export function gateHiringCandidateContext(
  snapshot: StudioLotSnapshot,
  talentId: string,
): GateHiringCandidateContext | null {
  const market = gateHiringMarketContext(snapshot)
  if (market === null) return null
  const matches = market.candidates.filter((candidate) => candidate.talentId === talentId)
  if (matches.length !== 1) return null

  const candidate = matches[0]!
  return {
    marketWeek: market.marketWeek,
    candidate,
    ownerIntent: {
      talentId: candidate.talentId,
      studioSeed: market.studioSeed,
      name: candidate.name,
      creativeRole: candidate.creativeRole,
    },
  }
}

/** Field-exact rendered-token comparison required before profile/Hiring handoff. */
export function sameGateHiringCandidateContext(
  left: GateHiringCandidateContext | null,
  right: GateHiringCandidateContext | null,
): boolean {
  if (left === null || right === null) return left === right
  return (
    left.marketWeek === right.marketWeek &&
    left.candidate.talentId === right.candidate.talentId &&
    left.candidate.name === right.candidate.name &&
    left.candidate.creativeRole === right.candidate.creativeRole &&
    left.candidate.employmentStatus === right.candidate.employmentStatus &&
    left.candidate.offerTermWeeks.length === right.candidate.offerTermWeeks.length &&
    left.candidate.offerTermWeeks.every(
      (term, index) => term === right.candidate.offerTermWeeks[index],
    ) &&
    left.ownerIntent.talentId === right.ownerIntent.talentId &&
    left.ownerIntent.studioSeed === right.ownerIntent.studioSeed &&
    left.ownerIntent.name === right.ownerIntent.name &&
    left.ownerIntent.creativeRole === right.ownerIntent.creativeRole
  )
}
