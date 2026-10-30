// ── P17 franchise root validator — leaf-exact, loud, exact-joined ───────────────────────────────────────
//
// Rev02 §10: the P17 root is validated leaf-exact at the save boundary and joins the identity walks; ids are minted
// from a monotonic ordinal; milestones are a closed enum. Every row must be one a lawful producer of THIS checkpoint
// writes — a null exercising studio, a stale ordinal, a parent outside the property or an installment P16 does not link
// to its StoryProperty refuses by name. Standalone (no save.ts helpers) so the save module can import it without a cycle.

import { CAST_WEIGHT, TUNING } from './tuning.js'
import type { FilmParticipants, FranchiseRoot } from './types.js'

type Rec = Record<string, unknown>
const isRecord = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v)
function fail(label: string, message: string): never {
  throw new Error(`${label}: ${message}`)
}
function rec(v: unknown, label: string): Rec {
  if (!isRecord(v)) fail(label, 'object required')
  return v
}
function arr(v: unknown, label: string): unknown[] {
  if (!Array.isArray(v)) fail(label, 'array required')
  return v
}
function exactKeys(v: Rec, keys: readonly string[], label: string): void {
  const have = Object.keys(v).sort().join(',')
  const want = [...keys].sort().join(',')
  if (have !== want) fail(label, `expected exactly keys [${want}] but found [${have}]`)
}
function num(v: unknown, label: string, opts: { int?: boolean; min?: number; max?: number } = {}): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) fail(label, 'finite number required')
  if (opts.int && !Number.isInteger(v)) fail(label, 'integer required')
  if (opts.min !== undefined && v < opts.min) fail(label, `must be at least ${opts.min}`)
  if (opts.max !== undefined && v > opts.max) fail(label, `must be at most ${opts.max}`)
  return v
}
function numOrNull(v: unknown, label: string, opts: { int?: boolean; min?: number; max?: number } = {}): number | null {
  return v === null ? null : num(v, label, opts)
}
function str(v: unknown, label: string): string {
  if (typeof v !== 'string' || v.length === 0) fail(label, 'non-empty string required')
  return v
}
function strOrNull(v: unknown, label: string): string | null {
  return v === null ? null : str(v, label)
}
function enumOf<T extends string>(v: unknown, values: readonly T[], label: string): T {
  if (typeof v !== 'string' || !(values as readonly string[]).includes(v)) fail(label, `must be one of ${values.join('|')}`)
  return v as T
}
function bool(v: unknown, label: string): boolean {
  if (typeof v !== 'boolean') fail(label, 'boolean required')
  return v
}
/** The ordinal of a minted id `${prefix}-N`. */
function ordinalOf(id: string, prefix: string, label: string): number {
  const m = new RegExp(`^${prefix}-([1-9][0-9]*)$`).exec(id)
  if (m === null) fail(label, `${id} is not a minted ${prefix} id (${prefix}-N)`)
  return Number(m[1])
}

/** What the rest of the (already validated) save tells the P17 root. */
export type P17ValidationContext = {
  productionIds: ReadonlySet<string>
  /** `market.tick` of the save. */
  week: number
  /** The player's industry studio id: the only studio with a P17 producer at this checkpoint. */
  playerStudioId: string
  /** The release week of a public film (player library or living-industry simulation film); undefined until released. */
  releaseWeekOf: (productionId: string) => number | undefined
  /** The frozen participant record of a released film or a locked production, when one exists. */
  participantsOf: (productionId: string) => FilmParticipants | undefined
  /** The production/film ids P16 links to a StoryProperty (its resolved work links). */
  worksOf: (storyPropertyId: string) => ReadonlySet<string>
}

const METER_KEYS = ['bestScore', 'residualScoreSum', 'peakInstallmentId', 'rPeak', 'fatigue', 'fatigueUpdateWeek', 'fatigueLastQuality', 'releaseCount', 'firstFilmExempt'] as const
function validateMeter(v: unknown, label: string): Rec {
  const m = rec(v, label)
  exactKeys(m, METER_KEYS, label)
  num(m.bestScore, `${label}.bestScore`, { min: 0 })
  num(m.residualScoreSum, `${label}.residualScoreSum`, { min: 0 })
  strOrNull(m.peakInstallmentId, `${label}.peakInstallmentId`)
  num(m.rPeak, `${label}.rPeak`, { min: 0, max: 100 })
  num(m.fatigue, `${label}.fatigue`, { min: 0 })
  num(m.fatigueUpdateWeek, `${label}.fatigueUpdateWeek`, { int: true, min: 0 })
  numOrNull(m.fatigueLastQuality, `${label}.fatigueLastQuality`, { min: 0 })
  num(m.releaseCount, `${label}.releaseCount`, { int: true, min: 0 })
  bool(m.firstFilmExempt, `${label}.firstFilmExempt`)
  return m
}

const EDGE_TYPES = ['directSequel', 'prequel', 'remake', 'reboot', 'spinOff', 'origin'] as const
const BRANCH_KINDS = ['main', 'reboot', 'spinoff'] as const
const SUB_KINDS = ['character', 'organization', 'location', 'concept'] as const
const MILESTONE_IDS = ['activeAgain'] as const

type Edge = { child: string; parent: string | null; type: (typeof EDGE_TYPES)[number]; branchId: string; greenlitWeek: number | null; releasedWeek: number | null; label: string }
type Branch = { id: string; kind: (typeof BRANCH_KINDS)[number]; subPropertyId: string | null; openedAtWeek: number; raw: Rec; label: string }

export function validateFranchiseRoot(raw: unknown, label: string, ctx: P17ValidationContext): asserts raw is FranchiseRoot {
  const root = rec(raw, label)
  exactKeys(root, ['version', 'nextOrdinal', 'properties'], label)
  if (root.version !== 1) fail(label, 'version must be 1')
  const nextOrdinal = num(root.nextOrdinal, `${label}.nextOrdinal`, { int: true, min: 1 })
  // every mint consumes exactly one ordinal and nothing is ever deleted: the ordinals in use are exactly 1..next−1
  const ordinals = new Map<number, string>()
  const claim = (n: number, owner: string, at: string): void => {
    if (n >= nextOrdinal) fail(at, `${owner} uses ordinal ${n}, at or beyond nextOrdinal ${nextOrdinal}`)
    if (ordinals.has(n)) fail(at, `${owner} reuses ordinal ${n} of ${ordinals.get(n)}`)
    ordinals.set(n, owner)
  }
  const seenProperty = new Set<string>()
  const seenChild = new Set<string>()
  const properties = arr(root.properties, `${label}.properties`)
  if (properties.length === 0) fail(`${label}.properties`, 'an empty franchise root is written as absence: the root appears with its first property')
  properties.forEach((p, i) => {
    const pl = `${label}.properties[${i}]`
    const prop = rec(p, pl)
    exactKeys(prop, ['storyPropertyId', 'franchiseId', 'mintedWeek', 'meter', 'branches', 'installments', 'subProperties', 'milestones'], pl)
    const storyPropertyId = str(prop.storyPropertyId, `${pl}.storyPropertyId`)
    if (seenProperty.has(storyPropertyId)) fail(pl, `duplicate storyPropertyId ${storyPropertyId}`)
    seenProperty.add(storyPropertyId)
    const franchiseId = str(prop.franchiseId, `${pl}.franchiseId`)
    const franchiseOrdinal = ordinalOf(franchiseId, 'franchise', `${pl}.franchiseId`)
    claim(franchiseOrdinal, franchiseId, `${pl}.franchiseId`)
    const mintedWeek = num(prop.mintedWeek, `${pl}.mintedWeek`, { int: true, min: 0, max: ctx.week })
    const meter = validateMeter(prop.meter, `${pl}.meter`)

    // ── branches: one main continuity, minted with the property under the same ordinal ──
    const branches = new Map<string, Branch>()
    arr(prop.branches, `${pl}.branches`).forEach((b, j) => {
      const bl = `${pl}.branches[${j}]`
      const branch = rec(b, bl)
      exactKeys(branch, ['branchId', 'kind', 'subPropertyId', 'openedAtWeek', 'momentum', 'momentumUpdateWeek', 'lastReleaseWeek', 'priorGapWeeks'], bl)
      const id = str(branch.branchId, `${bl}.branchId`)
      if (branches.has(id)) fail(bl, `duplicate branchId ${id}`)
      const kind = enumOf(branch.kind, BRANCH_KINDS, `${bl}.kind`)
      const ordinal = ordinalOf(id, 'branch', `${bl}.branchId`)
      if ((j === 0) !== (kind === 'main')) fail(bl, 'the property has exactly one main continuity, its first branch')
      if (kind === 'main') {
        if (ordinal !== franchiseOrdinal) fail(bl, `the main continuity is minted with its property as branch-${franchiseOrdinal}`)
      } else {
        claim(ordinal, id, `${bl}.branchId`)
      }
      const sub = strOrNull(branch.subPropertyId, `${bl}.subPropertyId`)
      if ((kind === 'spinoff') !== (sub !== null)) fail(bl, 'a spinoff branch names its SubProperty and no other branch does')
      const openedAtWeek = num(branch.openedAtWeek, `${bl}.openedAtWeek`, { int: true, min: mintedWeek, max: ctx.week })
      num(branch.momentum, `${bl}.momentum`)
      num(branch.momentumUpdateWeek, `${bl}.momentumUpdateWeek`, { int: true, min: 0 })
      numOrNull(branch.lastReleaseWeek, `${bl}.lastReleaseWeek`, { int: true, min: 0 })
      numOrNull(branch.priorGapWeeks, `${bl}.priorGapWeeks`, { int: true, min: 0 })
      branches.set(id, { id, kind, subPropertyId: sub, openedAtWeek, raw: branch, label: bl })
    })
    if (branches.size === 0) fail(pl, 'a property has its main continuity')
    const main = [...branches.values()][0]!
    if (main.openedAtWeek !== mintedWeek) fail(main.label, `the main continuity opens with its property (week ${mintedWeek})`)

    // ── installments: append-only lineage, the origin first, every parent written before its child ──
    const edges: Edge[] = []
    const byChild = new Map<string, Edge>()
    arr(prop.installments, `${pl}.installments`).forEach((e, j) => {
      const el = `${pl}.installments[${j}]`
      const edge = rec(e, el)
      exactKeys(edge, ['childProductionId', 'parentProductionId', 'type', 'branchId', 'similarity', 'greenlitWeek', 'studioId', 'releasedWeek'], el)
      const branchId = str(edge.branchId, `${el}.branchId`)
      const branch = branches.get(branchId)
      if (branch === undefined) fail(el, `names branch ${branchId}, which the property does not have`)
      const child = str(edge.childProductionId, `${el}.childProductionId`)
      if (seenChild.has(child)) fail(el, `duplicate installment ${child}`)
      seenChild.add(child)
      if (!ctx.productionIds.has(child)) fail(el, `childProductionId ${child} is not a persisted production`)
      // the P16 join (review P17-01): every installment is a work P16 links to this StoryProperty, so a continuation can
      // never sit under a title P16 gave a clean property of its own
      if (!ctx.worksOf(storyPropertyId).has(child)) fail(el, `${child} is not a P16 work of ${storyPropertyId}`)
      const parent = strOrNull(edge.parentProductionId, `${el}.parentProductionId`)
      const type = enumOf(edge.type, EDGE_TYPES, `${el}.type`)
      const studioId = strOrNull(edge.studioId, `${el}.studioId`)
      const greenlitWeek = numOrNull(edge.greenlitWeek, `${el}.greenlitWeek`, { int: true, min: mintedWeek, max: ctx.week })
      const releasedWeek = numOrNull(edge.releasedWeek, `${el}.releasedWeek`, { int: true, min: 0, max: ctx.week })
      const similarity = num(edge.similarity, `${el}.similarity`, { min: 0, max: 1 })
      if (type === 'origin') {
        if (j !== 0) fail(el, 'the origin edge is the property\'s first installment, and there is one')
        if (parent !== null || studioId !== null || greenlitWeek !== null) fail(el, 'an origin edge names no parent, no exercising studio and no greenlight week (the founding film is not a P17 greenlight)')
        if (branchId !== main.id) fail(el, 'the origin edge sits on the main continuity')
        if (similarity !== 0) fail(el, 'the origin edge has similarity 0')
      } else {
        if (j === 0) fail(el, 'the property\'s first installment is its origin edge')
        if (parent === null) fail(el, `a ${type} names its parent`)
        if (greenlitWeek === null) fail(el, `a ${type} records its greenlight week`)
        if (studioId === null || studioId !== ctx.playerStudioId) fail(el, `a ${type} records the player studio that greenlit it; found ${String(studioId)} (no other studio has a continuation route at this checkpoint)`)
        const expected = (TUNING.P17_SIMILARITY as Record<string, number>)[type]
        if (similarity !== expected) fail(el, `similarity ${similarity} is not the ${type} similarity ${String(expected)}`)
        const parentEdge = byChild.get(parent)
        if (parentEdge === undefined) fail(el, `parent ${parent} is not an earlier installment of ${storyPropertyId}`)
        const parentBranch = branches.get(parentEdge.branchId)!
        if (type === 'directSequel' || type === 'prequel' || type === 'remake') {
          if (parentEdge.branchId !== branchId) fail(el, `a ${type} files in its parent's continuity ${parentEdge.branchId}, not ${branchId}`)
        } else if (type === 'reboot') {
          if (branch.kind !== 'reboot' || parentEdge.branchId === branchId) fail(el, 'a reboot opens its own reboot continuity')
        } else {
          if (branch.kind !== 'spinoff' || parentBranch.kind === 'spinoff') fail(el, 'a spinOff opens a spin-off continuity from a main or reboot film')
        }
        if (type === 'reboot' || type === 'spinOff') {
          if (edges.some((x) => x.branchId === branchId)) fail(el, `a ${type} opens continuity ${branchId}; it cannot join one`)
          if (branch.openedAtWeek !== greenlitWeek) fail(el, `continuity ${branchId} opened at week ${branch.openedAtWeek}, not at its ${type}'s greenlight week ${greenlitWeek}`)
        }
      }
      // the release fact is the film's own: exactly its public release week, or null while it has none
      const actual = ctx.releaseWeekOf(child)
      if (releasedWeek !== (actual ?? null)) fail(el, `releasedWeek ${String(releasedWeek)} is not ${child}'s public release week ${String(actual ?? null)}`)
      const record: Edge = { child, parent, type, branchId, greenlitWeek, releasedWeek, label: el }
      edges.push(record)
      byChild.set(child, record)
    })
    if (edges.length === 0) fail(pl, 'a property records its origin edge')
    for (const branch of branches.values()) {
      if (branch.kind !== 'main' && !edges.some((e) => e.branchId === branch.id)) fail(branch.label, `continuity ${branch.id} was opened by no reboot or spinOff`)
      // the continuity's running facts are reads of its own release weeks
      const weeks = edges.filter((e) => e.branchId === branch.id && e.releasedWeek !== null).map((e) => e.releasedWeek!).sort((a, b) => a - b)
      const last = weeks.length === 0 ? null : weeks[weeks.length - 1]!
      const gap = weeks.length < 2 ? null : last! - weeks[weeks.length - 2]!
      if (branch.raw.lastReleaseWeek !== last) fail(branch.label, `lastReleaseWeek ${String(branch.raw.lastReleaseWeek)} is not the continuity's last release week ${String(last)}`)
      if (branch.raw.priorGapWeeks !== gap) fail(branch.label, `priorGapWeeks ${String(branch.raw.priorGapWeeks)} is not the gap between its last two releases ${String(gap)}`)
      if (branch.raw.momentumUpdateWeek !== (last ?? branch.openedAtWeek)) fail(branch.label, 'momentumUpdateWeek is the continuity\'s last release week (its opening week before one)')
      if (last === null && branch.raw.momentum !== 0) fail(branch.label, 'a continuity with no release carries no Momentum')
    }

    // ── SubProperties: authored hooks on exact films and frozen cast participants ──
    const subs = new Map<string, Rec>()
    arr(prop.subProperties, `${pl}.subProperties`).forEach((s, j) => {
      const sl = `${pl}.subProperties[${j}]`
      const sub = rec(s, sl)
      exactKeys(sub, ['subPropertyId', 'kind', 'mintedAtProductionId', 'citedTalentIds', 'hookWeight', 'mintedWeek', 'meter', 'promotedToStoryPropertyId'], sl)
      const id = str(sub.subPropertyId, `${sl}.subPropertyId`)
      if (subs.has(id)) fail(sl, `duplicate subPropertyId ${id}`)
      claim(ordinalOf(id, 'sub', `${sl}.subPropertyId`), id, `${sl}.subPropertyId`)
      const kind = enumOf(sub.kind, SUB_KINDS, `${sl}.kind`)
      const minted = str(sub.mintedAtProductionId, `${sl}.mintedAtProductionId`)
      if (!byChild.has(minted)) fail(sl, `mintedAtProductionId ${minted} is not an installment of the property`)
      const cited = arr(sub.citedTalentIds, `${sl}.citedTalentIds`).map((t, k) => str(t, `${sl}.citedTalentIds[${k}]`))
      if (new Set(cited).size !== cited.length) fail(sl, 'a hook cites each participant once')
      let hookWeight: number
      if (kind === 'character' || kind === 'organization') {
        if (cited.length === 0 || (kind === 'character' && cited.length !== 1)) fail(sl, `a ${kind} hook cites ${kind === 'character' ? 'exactly one' : 'at least one'} frozen cast participant`)
        const participants = ctx.participantsOf(minted)
        if (participants === undefined) fail(sl, `${minted} has no frozen participant record to cite a participant from`)
        const weights = cited.map((tid) => {
          const slot = (['lead', 'antagonist', 'support'] as const).find((x) => participants.cast[x].talentId === tid)
          if (slot === undefined) fail(sl, `cited talent ${tid} is not a frozen cast participant of ${minted}`)
          return CAST_WEIGHT[slot]
        })
        hookWeight = Math.min(1, weights.reduce((a, b) => a + b, 0) / weights.length)
      } else {
        if (cited.length !== 0) fail(sl, `a ${kind} hook cites no participant`)
        hookWeight = TUNING.P17_HOOK_WEIGHT_DEFAULT
      }
      if (sub.hookWeight !== hookWeight) fail(sl, `hookWeight ${String(sub.hookWeight)} is not the cited participants' weight ${hookWeight}`)
      num(sub.mintedWeek, `${sl}.mintedWeek`, { int: true, min: mintedWeek, max: ctx.week })
      const subMeter = validateMeter(sub.meter, `${sl}.meter`)
      if (subMeter.firstFilmExempt !== false) fail(`${sl}.meter`, 'a SubProperty meter carries no first-film exemption (C5)')
      // promotion is a P16 act (rev02 §9.5): no producer at this checkpoint writes one
      if (sub.promotedToStoryPropertyId !== null) fail(sl, 'promotedToStoryPropertyId must be null: SubProperty promotion is a P16 act with no producer at this checkpoint')
      subs.set(id, subMeter)
    })
    if (subs.size > TUNING.P17_MAX_LIVE_SUBPROPERTIES) fail(pl, `${subs.size} live SubProperties exceed the cap of ${TUNING.P17_MAX_LIVE_SUBPROPERTIES}`)
    const spinoffOf = new Map<string, string>()
    for (const branch of branches.values()) {
      if (branch.kind !== 'spinoff') continue
      if (!subs.has(branch.subPropertyId!)) fail(branch.label, `spinoff branch ${branch.id} names an unknown SubProperty`)
      if (spinoffOf.has(branch.subPropertyId!)) fail(branch.label, `SubProperty ${branch.subPropertyId} already has spin-off continuity ${spinoffOf.get(branch.subPropertyId!)}`)
      spinoffOf.set(branch.subPropertyId!, branch.id)
    }

    // ── meters: release counts and peaks are reads of the installment list ──
    const releasedOn = (pred: (e: Edge) => boolean): Edge[] => edges.filter((e) => e.releasedWeek !== null && pred(e))
    const spinoffBranchIds = new Set([...branches.values()].filter((b) => b.kind === 'spinoff').map((b) => b.id))
    if (meter.firstFilmExempt !== true) fail(`${pl}.meter`, 'the property meter keeps its first-film exemption flag')
    if (meter.releaseCount !== releasedOn((e) => !spinoffBranchIds.has(e.branchId)).length) fail(`${pl}.meter`, 'releaseCount is the number of released main/reboot installments')
    if (meter.peakInstallmentId !== null && !releasedOn((e) => e.child === meter.peakInstallmentId).length) fail(`${pl}.meter`, `peakInstallmentId ${String(meter.peakInstallmentId)} is not a released installment of the property`)
    for (const [subId, subMeter] of subs) {
      const branchId = spinoffOf.get(subId)
      const own = branchId === undefined ? [] : releasedOn((e) => e.branchId === branchId)
      if (subMeter.releaseCount !== own.length) fail(`${pl}.subProperties.${subId}.meter`, 'releaseCount is the number of released films on its spin-off continuity')
      if (subMeter.peakInstallmentId !== null && !own.some((e) => e.child === subMeter.peakInstallmentId)) fail(`${pl}.subProperties.${subId}.meter`, `peakInstallmentId ${String(subMeter.peakInstallmentId)} is not a released film of its spin-off continuity`)
    }

    // ── milestones: closed enum, append-only, each a reading of its continuity's own gaps (rev02 §10) ──
    const milestoneFilms = new Set<string>()
    let lastWeek = -1
    arr(prop.milestones, `${pl}.milestones`).forEach((m, j) => {
      const ml = `${pl}.milestones[${j}]`
      const milestone = rec(m, ml)
      exactKeys(milestone, ['milestoneId', 'productionId', 'week'], ml)
      enumOf(milestone.milestoneId, MILESTONE_IDS, `${ml}.milestoneId`)
      const productionId = str(milestone.productionId, `${ml}.productionId`)
      const week = num(milestone.week, `${ml}.week`, { int: true, min: 0, max: ctx.week })
      if (milestoneFilms.has(productionId)) fail(ml, `duplicate milestone for ${productionId}`)
      milestoneFilms.add(productionId)
      if (week < lastWeek) fail(ml, 'milestones are appended in week order')
      lastWeek = week
      const edge = byChild.get(productionId)
      if (edge === undefined || edge.releasedWeek !== week) fail(ml, `${productionId} is not an installment released at week ${week}`)
      const earlier = edges.filter((e) => e.branchId === edge.branchId && e.releasedWeek !== null && e.releasedWeek < week).map((e) => e.releasedWeek!)
      const previous = earlier.length === 0 ? null : Math.max(...earlier)
      if (previous === null || week - previous < TUNING.P17_DORMANT_WEEKS) fail(ml, `activeAgain needs a prior gap of at least ${TUNING.P17_DORMANT_WEEKS} weeks on continuity ${edge.branchId}`)
    })
  })
  for (let n = 1; n < nextOrdinal; n++) {
    if (!ordinals.has(n)) fail(`${label}.nextOrdinal`, `nextOrdinal ${nextOrdinal} skips ordinal ${n}: every minted ordinal names a persisted id`)
  }
}
