// ── P17 continuation law — five typed lineages, legality, the franchise root, SubProperties, associations ──
//
// Canonical authority: rev02 f2eff635 §5.2 (C6 derived types), §8 (remake/reboot), §9 (SubProperties and
// promotion), §10 (lazy root keyed to the P16 StoryProperty, bounded branches, active-continuity cap,
// legality matrix that never reads R/M/F, no owner field, no kill switch), §11 (associations derived from
// frozen participants; credit scales the awareness input only); charter r2 (1370-ae) §"P16 authority and
// five typed lineages". Owner choices: healthy reboot legal; dormant return is a DirectSequel.
//
// Rights are P16's live readers over the world's own state (rights.ts), never an injected answer and never a
// cached holder: a film's StoryProperty is the P16 property whose work links name it (`resolveTitles`); a main or
// reboot continuity asks `permissionFor` for its R3 use; a spin-off continuity (and the spin-off and hook that open
// one) is parent-bound and asks `branchAuthority` — the parent's spin-off authority — until P16 promotes it
// (1367-O; review P17-02). Stored lineage is provenance, not permission.
//
// Pure: no RNG, no I/O, no state mutation. Every function returns a new root or refuses.

import {
  branchBand,
  composeInheritedAwareness,
  emptyMeter,
  emptyMomentum,
  fatigueAt,
  isContinuityOpen,
  momentumAt,
  qualityOf,
  reach01,
  rebootComparison,
  recognitionReported,
  registerBranchRelease,
  registerRelease,
  remakeComparison,
  seedSubPropertyMeter,
  similarityOf,
  type ContinuationBand,
  type ReleaseFacts,
} from './continuationSignals.js'
import { branchAuthority, permissionFor, resolveTitles } from './rights.js'
import { CAST_WEIGHT, TUNING } from './tuning.js'
import type {
  CastSlot,
  ContinuationType,
  FilmParticipants,
  FilmResult,
  FranchiseBranch,
  FranchiseBranchKind,
  FranchiseMilestone,
  FranchiseProperty,
  FranchiseRoot,
  GameState,
  LineageEdge,
  P17StepRoots,
  PropertyMeter,
  SubProperty,
  SubPropertyKind,
} from './types.js'

export type { ContinuationType, FranchiseBranch, FranchiseProperty, FranchiseRoot, LineageEdge, SubProperty } from './types.js'

// ── the live P16 rights read ──────────────────────────────────────────────────
export type ContinuationUse = 'sequel' | 'remake' | 'spinoff'

/** The P16 R3 use a continuation exercises. A film on a spin-off continuity, the spin-off that opens one and a hook all
 * exercise the parent's `spinoff` authority (parent-bound branch, review P17-02). CONTRACT GAP (P17, retained): P16's
 * R3 uses are sequel/remake/spinoff only, so a prequel and a reboot continue the property under `sequel`. */
export function continuationUseOf(type: ContinuationType, branchKind: FranchiseBranchKind): ContinuationUse {
  if (type === 'spinOff' || branchKind === 'spinoff') return 'spinoff'
  return type === 'remake' ? 'remake' : 'sequel'
}

/**
 * The ONE rights read: null when `studioId` may exercise `use` on `storyPropertyId` this week, else the exact refusal.
 * `state.market.tick` is the week (P16 answers no future week). `coverWeek`, when given, is the picture's earliest
 * release week: a licence that answers must still be in its term then (a dated grant that lapses first refuses here,
 * at the action boundary). A title-held authority has no term.
 */
export function continuationRightsRefusal(
  state: GameState,
  q: { studioId: string; storyPropertyId: string; use: ContinuationUse; branchLabel: string; coverWeek?: number },
): string | null {
  const week = state.market.tick
  const refused = (reason: string) => `${q.studioId} holds no lawful ${q.use} right in ${q.storyPropertyId} at week ${week} (rights: ${reason})`
  let licenceId: string | null
  if (q.use === 'spinoff') {
    const answer = branchAuthority(state, { parentPropertyId: q.storyPropertyId, branch: q.branchLabel }, week)
    if (answer.kind === 'unavailable') return refused(answer.reason)
    if (answer.studioId !== q.studioId) return refused(`noAuthority:${answer.studioId}`)
    licenceId = answer.licenceId
  } else {
    const answer = permissionFor(state, q.studioId, { right: 'R1', propertyId: q.storyPropertyId }, 'R3', { use: q.use }, week)
    if (answer.kind === 'refused') return refused(answer.reason)
    licenceId = answer.licenceId
  }
  if (q.coverWeek === undefined || licenceId === null) return null
  const licence = state.rights.licences.find((l) => l.id === licenceId)
  if (licence === undefined) throw new Error(`continuation: P16 answered with unknown licence ${licenceId}`)
  return q.coverWeek < licence.endWeekExclusive ? null
    : `${q.studioId} holds ${licenceId} on ${q.storyPropertyId} only until week ${licence.endWeekExclusive}; the grant must cover the picture's earliest release week ${q.coverWeek}`
}

export type ReleasedFilmView = { result: FilmResult; audience01: number }

/** The narrow world a quote reads: the live state (the only rights source), its week, the root and public film facts. */
export type ContinuationWorld = {
  state: GameState
  week: number
  franchises: FranchiseRoot
  releasedFilm(productionId: string): ReleasedFilmView | null
  /** A greenlit, unreleased production with a locked forecast exists (Direction G "sufficiently committed"). */
  isLocked(productionId: string): boolean
}

export type ContinuationRequest = {
  type: ContinuationType
  /** DirectSequel/Prequel: the exact released or locked film on the continuity. Remake: the one released film.
   * Reboot: any film of the property (provenance). SpinOff: the released or locked parent film. */
  predecessorProductionId: string
  /** SpinOff only: the authored, named hook. */
  subPropertyId?: string
  /** Optional authored continuity check: refuses when the cited film is not on this branch. */
  branchId?: string
}

export type ProposedPrincipals = { writerId: string; directorId: string; cast: Record<CastSlot, string> }

export type ContinuationQuote =
  | {
      ok: true
      storyPropertyId: string
      type: ContinuationType
      similarity: number
      /** The existing continuity, or null when this greenlight opens a new one (reboot, spin-off). */
      branchId: string | null
      branchKind: FranchiseBranchKind
      subPropertyId: string | null
      /** The P16 R3 use the greenlight exercises (the link use at greenlight). */
      use: ContinuationUse
      predecessorProductionId: string
      recognition: number
      momentum: number
      fatigue: number
      comparison01: number
      continuityCredit: number | null
      inheritedAwareness01: number
      band: ContinuationBand
    }
  | { ok: false; reason: string }

export function emptyFranchiseRoot(): FranchiseRoot {
  return { version: 1, nextOrdinal: 1, properties: [] }
}

/** The root, or the empty root a state without one means (the root is absent until the first property is written). */
export function franchisesOf(state: P17StepRoots): FranchiseRoot {
  return state.franchises ?? emptyFranchiseRoot()
}

/** `state` carrying `root`, or `state` itself while no property exists (absence is the one encoding of "none"). */
export function withFranchises<S extends object>(state: S, root: FranchiseRoot | undefined): S {
  return root === undefined || root.properties.length === 0 ? state : { ...state, franchises: root }
}

function factsOf(view: ReleasedFilmView): ReleaseFacts {
  return {
    installmentId: view.result.productionId,
    week: view.result.releaseTick,
    critic01: view.result.criticScore / 100,
    audience01: view.audience01,
    total: view.result.boxOffice.total,
    expectedTotal: view.result.forecast?.expectedTotal ?? null,
  }
}

export function installmentEdgeFor(root: FranchiseRoot, productionId: string): { property: FranchiseProperty; edge: LineageEdge } | null {
  for (const property of root.properties) {
    const edge = property.installments.find((e) => e.childProductionId === productionId)
    if (edge) return { property, edge }
  }
  return null
}

function branchOf(property: FranchiseProperty, branchId: string): FranchiseBranch {
  const b = property.branches.find((x) => x.branchId === branchId)
  if (!b) throw new Error(`continuation: property ${property.storyPropertyId} has no branch ${branchId}`)
  return b
}

/** An installment in flight: greenlit, unreleased AND still a live locked commitment. A cancelled picture's edge stays
 * as history but holds nothing open — derived from the live production set, never from a stored switch. */
function hasUnreleased(property: FranchiseProperty, branchId: string, isLive: (productionId: string) => boolean): boolean {
  return property.installments.some((e) => e.branchId === branchId && e.releasedWeek === null && isLive(e.childProductionId))
}

/** Open main/reboot continuities (§10): NEW with an installment in flight, or < DORMANT_WEEKS since release. */
export function openContinuityCount(property: FranchiseProperty, week: number, isLive: (productionId: string) => boolean): number {
  let n = 0
  for (const b of property.branches) {
    if (b.kind === 'spinoff') continue
    if (isContinuityOpen(b, hasUnreleased(property, b.branchId, isLive), week)) n++
  }
  return n
}

/**
 * The live rights read of an in-flight continuation (charter r2 "release ... any rights-sensitive resume"): null when
 * the film carries no continuation edge (no edge, or the origin film); otherwise the edge and the refusal P16 gives the
 * PRODUCING studio this week (null while it holds the grant). Never throws on a refusal: a refused picture HOLDS
 * (tick.ts) and disposition stays with the cancellation and claims owner (the player's `cancel`).
 */
export function continuationReleaseAuthority(state: GameState, productionId: string, producingStudioId: string): { edge: LineageEdge; refusal: string | null } | null {
  const found = installmentEdgeFor(franchisesOf(state), productionId)
  if (!found || found.edge.type === 'origin') return null
  const branch = branchOf(found.property, found.edge.branchId)
  return {
    edge: found.edge,
    refusal: continuationRightsRefusal(state, {
      studioId: producingStudioId,
      storyPropertyId: found.property.storyPropertyId,
      use: continuationUseOf(found.edge.type, branch.kind),
      branchLabel: branch.subPropertyId ?? branch.branchId,
    }),
  }
}

/** The productions among `productionIds` whose producing studio lacks the live grant this week, with the refusal:
 * the pictures a tick HOLDS this week (no work, no release) — one rights read per picture per week. */
export function continuationHolds(state: GameState, productionIds: readonly string[], producingStudioId: string): Map<string, string> {
  const holds = new Map<string, string>()
  if (state.franchises === undefined) return holds
  for (const id of productionIds) {
    const read = continuationReleaseAuthority(state, id, producingStudioId)
    if (read !== null && read.refusal !== null) holds.set(id, read.refusal)
  }
  return holds
}

/** The latest released installment on any main/reboot continuity except `excludeBranchId` (a reboot's own): the
 * "most recent prior continuity's last film" a reboot compares against (rev02 §5.3, §8). Ties keep edge order. */
function latestPriorContinuityRelease(property: FranchiseProperty, excludeBranchId: string | null): LineageEdge | null {
  let best: LineageEdge | null = null
  const spinoffBranches = new Set(property.branches.filter((b) => b.kind === 'spinoff').map((b) => b.branchId))
  for (const e of property.installments) {
    if (e.releasedWeek === null || spinoffBranches.has(e.branchId) || e.branchId === excludeBranchId) continue
    if (best === null || e.releasedWeek > best.releasedWeek!) best = e
  }
  return best
}

/** The continuity a film sits on (the BRIDGING_DISCOUNT reads the spin-off parent's continuity, rev02 §11). */
function branchIdOfFilm(property: FranchiseProperty, productionId: string): string {
  const edge = property.installments.find((e) => e.childProductionId === productionId)
  if (!edge) throw new Error(`continuation: ${productionId} is not an installment of ${property.storyPropertyId}`)
  return edge.branchId
}

/** What one continuation read needs: identical facts at the quote and at the release. */
type ContinuationReadFacts = {
  type: ContinuationType
  predecessorProductionId: string
  /** The continuity the film files in; null while the greenlight is still opening a new one (reboot, spin-off). */
  branchId: string | null
  /** The SubProperty whose meter a spin-off continuity reads; null on main/reboot continuities. */
  subPropertyId: string | null
  /** A reboot's own continuity, excluded from its prior-continuity comparison (null at the quote). */
  ownBranchId: string | null
  proposed: ProposedPrincipals | undefined
}
type ContinuationRead = { recognition: number; momentum: number; fatigue: number; comparison01: number; continuityCredit: number | null; inheritedAwareness01: number }

/**
 * THE one composing function (rev02 §5.3 "continuationInputs() owned by the R/M/F core"): the quote and the release
 * both call it, so with nothing intervening the live read equals the locked read, and an intervening release moves the
 * live read through the same arithmetic. Remake: q_ref with the referenced film's real audience view. Reboot:
 * 0.4·remakeComparison against the most recent prior continuity's last film, recomputed at the read, and NO association
 * credit (§11 "Reboot fully resets associations by key-scoping alone"). Spin-off: credit over the cited parent's
 * continuity (BRIDGING_DISCOUNT). Remake: no continuity computation.
 */
function composeContinuationRead(world: ContinuationWorld, property: FranchiseProperty, f: ContinuationReadFacts): ContinuationRead {
  const week = world.week
  const sub = f.subPropertyId === null ? undefined : property.subProperties.find((s) => s.subPropertyId === f.subPropertyId)
  if (f.subPropertyId !== null && sub === undefined) throw new Error(`continuation: ${property.storyPropertyId} has no SubProperty ${f.subPropertyId}`)
  const meter = sub?.meter ?? property.meter
  const momentum = f.branchId === null ? 0 : momentumAt(branchOf(property, f.branchId), week)
  let comparison01 = 0
  if (f.type === 'remake') {
    const ref = world.releasedFilm(f.predecessorProductionId)
    if (ref === null) throw new Error(`continuation: the remake's referenced film ${f.predecessorProductionId} has no public result`)
    comparison01 = remakeComparison(qualityOf(ref.result.criticScore / 100, ref.audience01), week - ref.result.releaseTick)
  } else if (f.type === 'reboot') {
    const prior = latestPriorContinuityRelease(property, f.ownBranchId)
    if (prior !== null) {
      const view = world.releasedFilm(prior.childProductionId)
      if (view === null) throw new Error(`continuation: released installment ${prior.childProductionId} has no public result`)
      comparison01 = rebootComparison(qualityOf(view.result.criticScore / 100, view.audience01), week - prior.releasedWeek!)
    }
  }
  let continuityCredit: number | null = null
  if (f.proposed !== undefined && f.type !== 'remake' && f.type !== 'reboot') {
    const creditBranch = f.type === 'spinOff' ? branchIdOfFilm(property, f.predecessorProductionId) : f.branchId
    if (creditBranch !== null) continuityCredit = continuityCredit_(talentAssociations(property, creditBranch, (id) => world.releasedFilm(id)?.result ?? null), f.proposed)
  }
  const recognition = recognitionReported(meter, week)
  const fatigue = fatigueAt(meter, week)
  return { recognition, momentum, fatigue, comparison01, continuityCredit, inheritedAwareness01: composeInheritedAwareness({ recognition, momentum, fatigue, comparison01, continuityCredit }) }
}

/** A transient property as the lazy mint would write it: main continuity plus the cited predecessor's founding edge. */
function mintedProperty(root: FranchiseRoot, storyPropertyId: string, predecessorId: string, world: ContinuationWorld): FranchiseProperty {
  const n = root.nextOrdinal
  const mainId = `branch-${n}`
  const released = world.releasedFilm(predecessorId)
  let meter: PropertyMeter = emptyMeter(world.week)
  let main: FranchiseBranch = { branchId: mainId, kind: 'main', subPropertyId: null, openedAtWeek: world.week, ...emptyMomentum(world.week) }
  if (released) {
    const facts = factsOf(released)
    meter = registerRelease(meter, facts, { similarity: 0 })
    main = registerBranchRelease(main, facts)
  }
  return {
    storyPropertyId,
    franchiseId: `franchise-${n}`,
    mintedWeek: world.week,
    meter,
    branches: [main],
    installments: [{
      childProductionId: predecessorId,
      parentProductionId: null,
      type: 'origin',
      branchId: mainId,
      similarity: 0,
      // the founding film's greenlight is not a P17 fact: no fabricated provenance
      greenlitWeek: null,
      studioId: null,
      releasedWeek: released ? released.result.releaseTick : null,
    }],
    subProperties: [],
    milestones: [],
  }
}

const refuse = (reason: string): ContinuationQuote => ({ ok: false, reason })

/** The StoryProperty a film belongs to: its edge's property when it is an installment, otherwise the one P16 property
 * whose work links name it. A P16 answer that contradicts the edge, or names several properties, refuses. */
function resolveStoryProperty(world: ContinuationWorld, productionId: string): { ok: true; storyPropertyId: string } | { ok: false; reason: string } {
  const known = installmentEdgeFor(world.franchises, productionId)
  const linked = resolveTitles(world.state).properties.filter((p) => p.workLinks.includes(productionId)).map((p) => p.propertyId)
  if (linked.length > 1) return { ok: false, reason: `P16 links ${productionId} to ${linked.length} properties (${linked.join(', ')})` }
  const p16 = linked[0] ?? null
  if (known && p16 !== null && p16 !== known.property.storyPropertyId) {
    return { ok: false, reason: `P16 links ${productionId} to ${p16}, but the lineage records ${known.property.storyPropertyId}` }
  }
  const storyPropertyId = known?.property.storyPropertyId ?? p16
  if (storyPropertyId === null) return { ok: false, reason: `no P16 StoryProperty links ${productionId}` }
  return { ok: true, storyPropertyId }
}

/**
 * The legality matrix and the one read-model (§10, §5.3). Never mutates. Legality reads rights, predecessor state,
 * branch/SubProperty existence and release weeks — never Recognition, Momentum or Fatigue. The live grant must answer
 * at the greenlight week and, when a licence answers, its term must cover the picture's earliest release week
 * (greenlight + PRODUCTION_TICKS).
 */
export function continuationQuote(
  world: ContinuationWorld,
  args: { studioId: string; productionId: string; request: ContinuationRequest; proposed?: ProposedPrincipals },
): ContinuationQuote {
  const { request } = args
  const predecessorId = request.predecessorProductionId
  if (!(['directSequel', 'prequel', 'remake', 'reboot', 'spinOff'] as const).includes(request.type)) return refuse(`unknown continuation type ${String(request.type)}`)
  if (installmentEdgeFor(world.franchises, args.productionId)) return refuse(`production ${args.productionId} already carries a lineage edge`)
  if (request.subPropertyId !== undefined && request.type !== 'spinOff') return refuse(`a SubProperty is cited on a ${request.type}; only a spinOff cites one`)
  if (request.type === 'spinOff' && request.subPropertyId === undefined) return refuse('a spinOff must cite an explicit named SubProperty')

  const resolved = resolveStoryProperty(world, predecessorId)
  if (!resolved.ok) return refuse(resolved.reason)
  const storyPropertyId = resolved.storyPropertyId

  const released = world.releasedFilm(predecessorId)
  const locked = released === null && world.isLocked(predecessorId)
  if (released === null && !locked) return refuse(`predecessor ${predecessorId} is neither released nor a locked-committed production`)

  const existing = world.franchises.properties.find((p) => p.storyPropertyId === storyPropertyId)
  const property = existing ?? mintedProperty(world.franchises, storyPropertyId, predecessorId, world)
  const predEdge = property.installments.find((e) => e.childProductionId === predecessorId)
  if (!predEdge) return refuse(`${predecessorId} is not an installment of ${storyPropertyId}`)
  if (request.branchId !== undefined && request.branchId !== predEdge.branchId) return refuse(`${predecessorId} is on continuity ${predEdge.branchId}, not ${request.branchId} (cross-branch reference)`)

  const type = request.type
  const similarity = similarityOf(type)
  const week = world.week
  const predBranch = branchOf(property, predEdge.branchId)
  let branchId: string | null = predEdge.branchId
  let branchKind: FranchiseBranchKind = predBranch.kind
  let subPropertyId: string | null = null
  // a film filed in a spin-off continuity reads that SubProperty's meter (sequel family and remake alike)
  const spinoffSub = (): SubProperty | string => {
    const sub = property.subProperties.find((s) => s.subPropertyId === predBranch.subPropertyId)
    if (!sub) return `spin-off continuity ${predEdge.branchId} has no SubProperty`
    if (sub.promotedToStoryPropertyId !== null) return `SubProperty ${sub.subPropertyId} was promoted to ${sub.promotedToStoryPropertyId}`
    return sub
  }

  switch (type) {
    case 'directSequel':
    case 'prequel': {
      if (branchKind === 'spinoff') {
        const sub = spinoffSub()
        if (typeof sub === 'string') return refuse(sub)
        subPropertyId = sub.subPropertyId
      }
      break
    }
    case 'remake': {
      // rev02 §10 matrix: a remake cites any one RELEASED film and never opens a continuity; it files in that film's
      // continuity — including a spin-off's, whose SubProperty meter it then reads
      if (released === null) return refuse(`a remake cites exactly one RELEASED film; ${predecessorId} is not released`)
      if (branchKind === 'spinoff') {
        const sub = spinoffSub()
        if (typeof sub === 'string') return refuse(sub)
        subPropertyId = sub.subPropertyId
      }
      break
    }
    case 'reboot': {
      if (property.branches.filter((b) => b.kind !== 'spinoff').length < 1) return refuse('a reboot needs at least one prior continuity')
      const open = openContinuityCount(property, week, world.isLocked)
      if (open >= TUNING.P17_MAX_OPEN_CONTINUITIES) {
        return refuse(`${open} continuities are open (cap ${TUNING.P17_MAX_OPEN_CONTINUITIES}); a continuity must go quiet for ${TUNING.P17_DORMANT_WEEKS} weeks before a new one opens`)
      }
      branchId = null
      branchKind = 'reboot'
      break
    }
    case 'spinOff': {
      const sub = property.subProperties.find((s) => s.subPropertyId === request.subPropertyId)
      if (!sub) return refuse(`${storyPropertyId} has no SubProperty ${request.subPropertyId}`)
      if (sub.promotedToStoryPropertyId !== null) return refuse(`SubProperty ${sub.subPropertyId} was promoted to ${sub.promotedToStoryPropertyId}`)
      if (branchKind === 'spinoff') return refuse('a spin-off parent must be a main or reboot continuity film (one level of nesting)')
      // rev02 §10: a spin-off branch is a thin pointer to its SubProperty — ONE continuity per hook
      const opened = property.branches.find((b) => b.kind === 'spinoff' && b.subPropertyId === sub.subPropertyId)
      if (opened) return refuse(`SubProperty ${sub.subPropertyId} already has its spin-off continuity ${opened.branchId}; continue it with a directSequel or prequel of one of its films`)
      branchId = null
      branchKind = 'spinoff'
      subPropertyId = sub.subPropertyId
      break
    }
  }

  // The live P16 read, for the use this greenlight exercises on the continuity it files in (P17-02).
  const use = continuationUseOf(type, branchKind)
  const rightsRefusal = continuationRightsRefusal(world.state, {
    studioId: args.studioId, storyPropertyId, use, branchLabel: subPropertyId ?? branchId ?? 'new continuity', coverWeek: week + TUNING.PRODUCTION_TICKS,
  })
  if (rightsRefusal !== null) return refuse(rightsRefusal)

  const read = composeContinuationRead(world, property, { type, predecessorProductionId: predecessorId, branchId, subPropertyId, ownBranchId: null, proposed: args.proposed })
  const meter = subPropertyId === null ? property.meter : property.subProperties.find((s) => s.subPropertyId === subPropertyId)!.meter
  const branchForBand = branchId === null ? { ...emptyMomentum(week) } : branchOf(property, branchId)
  return {
    ok: true,
    storyPropertyId,
    type,
    similarity,
    branchId,
    branchKind,
    subPropertyId,
    use,
    predecessorProductionId: predecessorId,
    recognition: read.recognition,
    momentum: read.momentum,
    fatigue: read.fatigue,
    comparison01: read.comparison01,
    continuityCredit: read.continuityCredit,
    inheritedAwareness01: read.inheritedAwareness01,
    band: branchBand(branchForBand, meter, week),
  }
}

/** The accepted quote's commit: mint the root/property/branch as needed and append the typed edge. */
export function commitContinuationGreenlight(world: ContinuationWorld, quote: ContinuationQuote, args: { studioId: string; productionId: string }): FranchiseRoot {
  if (!quote.ok) throw new Error(`continuation: cannot commit a refused quote — ${quote.reason}`)
  const root = world.franchises
  if (installmentEdgeFor(root, args.productionId)) throw new Error(`continuation: ${args.productionId} already carries a lineage edge`)
  let nextOrdinal = root.nextOrdinal
  let property = root.properties.find((p) => p.storyPropertyId === quote.storyPropertyId)
  const others = root.properties.filter((p) => p.storyPropertyId !== quote.storyPropertyId)
  if (!property) {
    property = mintedProperty(root, quote.storyPropertyId, quote.predecessorProductionId, world)
    nextOrdinal += 1
  }
  let branchId = quote.branchId
  let branches = property.branches
  if (branchId === null) {
    branchId = `branch-${nextOrdinal}`
    nextOrdinal += 1
    branches = [...branches, { branchId, kind: quote.branchKind, subPropertyId: quote.branchKind === 'spinoff' ? quote.subPropertyId : null, openedAtWeek: world.week, ...emptyMomentum(world.week) }]
  }
  const edge: LineageEdge = {
    childProductionId: args.productionId,
    parentProductionId: quote.predecessorProductionId,
    type: quote.type,
    branchId,
    similarity: quote.similarity,
    greenlitWeek: world.week,
    studioId: args.studioId,
    releasedWeek: null,
  }
  const updated: FranchiseProperty = { ...property, branches, installments: [...property.installments, edge] }
  return { ...root, nextOrdinal, properties: sortedProperties([...others, updated]) }
}

function sortedProperties(properties: FranchiseProperty[]): FranchiseProperty[] {
  return properties.sort((a, b) => (a.franchiseId < b.franchiseId ? -1 : a.franchiseId > b.franchiseId ? 1 : 0))
}

/** The live read at release (rev02 §5.3): the SAME composing function the quote ran, over then-current state and the
 * stored edge, before this film's own result. Null for a film with no continuation edge. */
export function continuationInputsAtRelease(world: ContinuationWorld, productionId: string, proposed?: ProposedPrincipals): number | null {
  const found = installmentEdgeFor(world.franchises, productionId)
  if (!found) return null
  const { property, edge } = found
  if (edge.type === 'origin') return null
  const branch = branchOf(property, edge.branchId)
  return composeContinuationRead(world, property, {
    type: edge.type,
    predecessorProductionId: edge.parentProductionId!,
    branchId: edge.branchId,
    subPropertyId: branch.kind === 'spinoff' ? branch.subPropertyId : null,
    ownBranchId: edge.type === 'reboot' ? edge.branchId : null,
    proposed,
  }).inheritedAwareness01
}

/** Exactly one R/M/F update per release. A film with no edge returns the root unchanged (same reference). A continuity
 * whose prior gap was ≥ DORMANT_WEEKS that lands this release with non-negative Momentum mints ONE `activeAgain`
 * milestone (rev02 §10: "detected from the installment list's own gaps and minted as a milestone"). */
export function applyContinuationRelease(root: FranchiseRoot, args: { productionId: string; week: number; result: FilmResult; audience01: number }): FranchiseRoot {
  const found = installmentEdgeFor(root, args.productionId)
  if (!found) return root
  const { property, edge } = found
  if (edge.releasedWeek !== null) throw new Error(`continuation: ${args.productionId} was already released at week ${edge.releasedWeek} (no double credit)`)
  const facts = factsOf({ result: args.result, audience01: args.audience01 })
  const branch = branchOf(property, edge.branchId)
  const released = registerBranchRelease(branch, facts)
  const branches = property.branches.map((b) => (b.branchId === branch.branchId ? released : b))
  let meter = property.meter
  let subProperties = property.subProperties
  if (branch.kind === 'spinoff') {
    // the SubProperty takes Recognition and Fatigue; the parent takes Recognition only (Case B)
    subProperties = subProperties.map((s) => (s.subPropertyId === branch.subPropertyId ? { ...s, meter: registerRelease(s.meter, facts, { similarity: edge.similarity }) } : s))
    meter = registerRelease(meter, facts, { similarity: edge.similarity, recognitionOnly: true })
  } else {
    meter = registerRelease(meter, facts, { similarity: edge.similarity })
  }
  const installments = property.installments.map((e) => (e.childProductionId === edge.childProductionId ? { ...e, releasedWeek: args.week } : e))
  const activeAgain = released.priorGapWeeks !== null && released.priorGapWeeks >= TUNING.P17_DORMANT_WEEKS && momentumAt(released, args.week) >= 0
  const milestones: FranchiseMilestone[] = activeAgain ? [...property.milestones, { milestoneId: 'activeAgain', productionId: args.productionId, week: args.week }] : property.milestones
  return { ...root, properties: root.properties.map((p) => (p === property ? { ...p, meter, branches, installments, subProperties, milestones } : p)) }
}

// ── §9 SubProperties ──────────────────────────────────────────────────────────
export type SubPropertyMint = { storyPropertyId: string; kind: SubPropertyKind; mintedAtProductionId: string; citedTalentIds: readonly string[]; week: number }

/** A film's frozen participant record: a released FilmResult or a locked Production (both carry `participants`). */
export type ParticipantsSource = (productionId: string) => { participants?: FilmParticipants } | null

function castWeightOf(participants: FilmParticipants, talentId: string): number | null {
  for (const slot of ['lead', 'antagonist', 'support'] as const) if (participants.cast[slot].talentId === talentId) return CAST_WEIGHT[slot]
  return null
}

/** An authored hook citing an exact film and, for character/organization hooks, its frozen cast participant(s). */
export function mintSubProperty(root: FranchiseRoot, mint: SubPropertyMint, participantsOf: ParticipantsSource): FranchiseRoot {
  const property = root.properties.find((p) => p.storyPropertyId === mint.storyPropertyId)
  if (!property) throw new Error(`continuation: no franchise for ${mint.storyPropertyId}`)
  if (!property.installments.some((e) => e.childProductionId === mint.mintedAtProductionId)) throw new Error(`continuation: ${mint.mintedAtProductionId} is not an installment of ${mint.storyPropertyId}`)
  const live = property.subProperties.filter((s) => s.promotedToStoryPropertyId === null).length
  if (live >= TUNING.P17_MAX_LIVE_SUBPROPERTIES) throw new Error(`continuation: ${mint.storyPropertyId} already has three live SubProperties`)
  let hookWeight: number
  if (mint.kind === 'character' || mint.kind === 'organization') {
    const participants = participantsOf(mint.mintedAtProductionId)?.participants
    if (!participants) throw new Error(`continuation: ${mint.mintedAtProductionId} has no frozen participant record to cite a participant from`)
    if (mint.citedTalentIds.length === 0 || (mint.kind === 'character' && mint.citedTalentIds.length !== 1)) throw new Error(`continuation: a ${mint.kind} hook cites ${mint.kind === 'character' ? 'exactly one' : 'at least one'} frozen cast participant`)
    if (new Set(mint.citedTalentIds).size !== mint.citedTalentIds.length) throw new Error('continuation: a hook cites each participant once')
    const weights = mint.citedTalentIds.map((id) => {
      const w = castWeightOf(participants, id)
      if (w === null) throw new Error(`continuation: ${id} is not a frozen cast participant of ${mint.mintedAtProductionId}`)
      return w
    })
    hookWeight = Math.min(1, weights.reduce((a, b) => a + b, 0) / weights.length)
  } else {
    if (mint.citedTalentIds.length !== 0) throw new Error(`continuation: a ${mint.kind} hook cites no participant`)
    hookWeight = TUNING.P17_HOOK_WEIGHT_DEFAULT
  }
  const sub: SubProperty = {
    subPropertyId: `sub-${root.nextOrdinal}`,
    kind: mint.kind,
    mintedAtProductionId: mint.mintedAtProductionId,
    citedTalentIds: [...mint.citedTalentIds],
    hookWeight,
    mintedWeek: mint.week,
    meter: seedSubPropertyMeter(property.meter, hookWeight, mint.week),
    promotedToStoryPropertyId: null,
  }
  return { ...root, nextOrdinal: root.nextOrdinal + 1, properties: root.properties.map((p) => (p === property ? { ...p, subProperties: [...p.subProperties, sub] } : p)) }
}

/**
 * The player's hook mint (rev02 §9.1-2 "minted explicitly ... by the player at the parent's greenlight or release ...
 * eligibility = rights not blocked (P16) + exact-record binding + under cap"): the cited film must be released or a
 * locked production; the minting studio must hold the parent's live spin-off authority this week (`branchAuthority`).
 * A hook on a film whose property was never continued mints that property's root first (its founding edge), because a
 * spin-off's matrix row needs the hook to exist before the spin-off greenlight. Refusals throw before anything is written.
 */
export function mintSubPropertyHook(
  world: ContinuationWorld,
  args: { studioId: string; productionId: string; kind: SubPropertyKind; citedTalentIds: readonly string[] },
  participantsOf: ParticipantsSource,
): FranchiseRoot {
  const resolved = resolveStoryProperty(world, args.productionId)
  if (!resolved.ok) throw new Error(`continuation: hook refused — ${resolved.reason}`)
  const refusal = continuationRightsRefusal(world.state, { studioId: args.studioId, storyPropertyId: resolved.storyPropertyId, use: 'spinoff', branchLabel: `hook on ${args.productionId}` })
  if (refusal !== null) throw new Error(`continuation: hook refused — ${refusal}`)
  if (world.releasedFilm(args.productionId) === null && !world.isLocked(args.productionId)) {
    throw new Error(`continuation: hook refused — ${args.productionId} is neither released nor a locked-committed production`)
  }
  let root = world.franchises
  if (!root.properties.some((p) => p.storyPropertyId === resolved.storyPropertyId)) {
    const minted = mintedProperty(root, resolved.storyPropertyId, args.productionId, world)
    root = { ...root, nextOrdinal: root.nextOrdinal + 1, properties: sortedProperties([...root.properties, minted]) }
  }
  return mintSubProperty(root, { storyPropertyId: resolved.storyPropertyId, kind: args.kind, mintedAtProductionId: args.productionId, citedTalentIds: args.citedTalentIds, week: world.week }, participantsOf)
}

export type PromotionDecision = {
  eligible: boolean
  reason: string
  payload: { parentStoryPropertyId: string; subPropertyId: string; meter: PropertyMeter; branchIds: string[]; installmentIds: string[]; encumbrances: string[] } | null
}

/** P17's exact eligibility decision and payload (charter r2 §promotion). P16 alone mints the new StoryProperty; P16 has
 * no promotion producer at this checkpoint, so nothing consumes this and no promoted row can be written (review P17-09). */
export function promotionEligible(root: FranchiseRoot, subPropertyId: string, week: number): PromotionDecision {
  let owner: { property: FranchiseProperty; sub: SubProperty } | null = null
  for (const property of root.properties) {
    const sub = property.subProperties.find((s) => s.subPropertyId === subPropertyId)
    if (sub) { owner = { property, sub }; break }
  }
  if (!owner) return { eligible: false, reason: `no SubProperty ${subPropertyId}`, payload: null }
  const { property, sub } = owner
  if (sub.promotedToStoryPropertyId !== null) return { eligible: false, reason: `already promoted to ${sub.promotedToStoryPropertyId}`, payload: null }
  const branchIds = property.branches.filter((b) => b.subPropertyId === subPropertyId).map((b) => b.branchId)
  const installments = property.installments.filter((e) => branchIds.includes(e.branchId))
  const released = installments.filter((e) => e.releasedWeek !== null)
  const payload = { parentStoryPropertyId: property.storyPropertyId, subPropertyId, meter: sub.meter, branchIds, installmentIds: installments.map((e) => e.childProductionId), encumbrances: [] as string[] }
  if (released.length === 0) return { eligible: false, reason: 'no own release yet', payload }
  if (!(recognitionReported(sub.meter, week) > 0)) return { eligible: false, reason: 'no gated Recognition yet', payload }
  return { eligible: true, reason: 'eligible', payload }
}

// ── §11 associations — derived on read from frozen participants ───────────────
export type AssociationBand = 'iconicLead' | 'signatureDirector' | 'coreEnsemble' | 'recurringSupport' | 'minor'
export type TalentAssociation = { talentId: string; weight: number; appearances: number; dominantRole: keyof typeof TUNING.P17_ROLE_IMPORTANCE; band: AssociationBand }

export function talentAssociations(property: FranchiseProperty, branchId: string, filmById: (id: string) => FilmResult | null): TalentAssociation[] {
  type Acc = { weight: number; appearances: number; byRole: Partial<Record<keyof typeof TUNING.P17_ROLE_IMPORTANCE, number>> }
  const acc = new Map<string, Acc>()
  for (const e of property.installments) {
    if (e.branchId !== branchId || e.releasedWeek === null) continue
    const film = filmById(e.childProductionId)
    const parts = film?.participants
    if (!film || !parts) continue
    const r = reach01(film.boxOffice.total)
    const credits: [string, keyof typeof TUNING.P17_ROLE_IMPORTANCE][] = [
      [parts.writer.talentId, 'writer'],
      [parts.director.talentId, 'director'],
      [parts.cast.lead.talentId, 'lead'],
      [parts.cast.antagonist.talentId, 'antagonist'],
      [parts.cast.support.talentId, 'support'],
    ]
    for (const [talentId, role] of credits) {
      const cur = acc.get(talentId) ?? { weight: 0, appearances: 0, byRole: {} }
      const w = TUNING.P17_ROLE_IMPORTANCE[role] * r
      cur.weight += w
      cur.appearances += 1
      cur.byRole[role] = (cur.byRole[role] ?? 0) + w
      acc.set(talentId, cur)
    }
  }
  const out: TalentAssociation[] = []
  for (const [talentId, a] of acc) {
    if (a.appearances < TUNING.P17_MIN_APPEARANCES_FOR_MAJOR) continue
    const weight = Math.min(a.weight, TUNING.P17_ASSOCIATION_CAP)
    const dominantRole = (Object.entries(a.byRole) as [keyof typeof TUNING.P17_ROLE_IMPORTANCE, number][]).sort((x, y) => y[1] - x[1])[0]![0]
    // CONTRACT GAP (P17): rev02 §11 gives thresholds for ICONIC LEAD (≥1.6), SIGNATURE DIRECTOR (≥1.3) and
    // RECURRING SUPPORT (≥0.3) but none for CORE ENSEMBLE; narrowest reading: ≥0.3 when not support-dominant.
    const band: AssociationBand =
      dominantRole === 'lead' && weight >= TUNING.P17_ASSOCIATION_ICONIC_LEAD_MIN ? 'iconicLead'
      : dominantRole === 'director' && weight >= TUNING.P17_ASSOCIATION_SIGNATURE_DIRECTOR_MIN ? 'signatureDirector'
      : dominantRole === 'support' && weight >= TUNING.P17_ASSOCIATION_RECURRING_MIN ? 'recurringSupport'
      : weight >= TUNING.P17_ASSOCIATION_RECURRING_MIN ? 'coreEnsemble'
      : 'minor'
    out.push({ talentId, weight, appearances: a.appearances, dominantRole, band })
  }
  return out.sort((x, y) => (y.weight - x.weight) || (x.talentId < y.talentId ? -1 : x.talentId > y.talentId ? 1 : 0))
}

/** Σ w·presence / Σ w, presence 1 for the same talent and RECAST_RETENTION otherwise; null with no association. */
export function continuityCredit(associations: readonly TalentAssociation[], proposed: ProposedPrincipals): number | null {
  return continuityCredit_(associations, proposed)
}

function continuityCredit_(associations: readonly TalentAssociation[], proposed: ProposedPrincipals): number | null {
  if (associations.length === 0) return null
  const present = new Set([proposed.writerId, proposed.directorId, proposed.cast.lead, proposed.cast.antagonist, proposed.cast.support])
  let num = 0
  let den = 0
  for (const a of associations) {
    num += a.weight * (present.has(a.talentId) ? 1 : TUNING.P17_RECAST_RETENTION)
    den += a.weight
  }
  return num / den
}
