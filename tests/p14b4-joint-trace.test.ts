// Installed independent95 plus ONLY author107's reviewed ordering delta; original95 preserved.
// INERT / UNEXECUTED. Intended tests/p14b4-joint-trace.test.ts.
// Independent detached finite domains: contracts49/56/89/90/91/94, matrix92.
// No engine save, owner replay, film history or production admission is forged.
import assert from 'node:assert/strict'
import { describe, expect, it } from 'vitest'
import { searchPromiseCapacity, searchPromiseCapacityTraces } from '../src/core/promiseCapacityKernel.js'
import type {
  Boundary, CapacityKernelInput, DemandKey, FixedHold, Hold, HoldReplacement,
  JointOwnerTrace, JointTraceCapacityInput, JointTraceCapacityResult,
  JointTracePath, JointTracePicture, JointTraceWitness, PriorClaim, PriorProfile, Slot,
} from '../src/core/promiseCapacityKernel.js'

const ANY = ['lead', 'antagonist', 'support'] as const
const FLEX = ['lead', 'antagonist'] as const
const LEAD = ['lead'] as const
const b = (week: number, step = 0): Boundary => ({ week, step })
const window = (startWeek = 0, dueWeekExclusive = 40) => ({ startWeek, dueWeekExclusive })
const compare = (a: Boundary, z: Boundary) => a.week < z.week ? -1 : a.week > z.week ? 1
  : a.step < z.step ? -1 : a.step > z.step ? 1 : 0
const sorted = (values: readonly string[]) => [...values].sort()
const key = (value: DemandKey) => JSON.stringify(value)
function freeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child)
    Object.freeze(value)
  }
  return value
}
type Piece = { path: JointTracePath; holds: readonly Hold[] }
function personHold(id: string, path: string, person: string, from: Boundary, until: Boundary): Hold {
  return { holdId: id, ownerKey: `owner:${path}`, ownerPathKey: path,
    subject: { kind: 'person', personId: person }, from, until }
}
function resourceHold(id: string, path: string, resourceKey: string, slot: number,
  from: Boundary, until: Boundary): Hold {
  return { holdId: id, ownerKey: `owner:${path}`, ownerPathKey: path,
    subject: { kind: 'resource', resourceKey, slot }, from, until }
}
function event(path: string, take: Boundary | null, cast: JointTracePicture['cast'], options: {
  existing?: boolean; start?: Boundary; release?: Boundary | null;
  holdUntil?: Boundary; holds?: readonly Hold[]
} = {}): Piece {
  const start = options.start ?? b(take === null ? 8 : Math.max(0, take.week - 1))
  const release = options.release === undefined ? b(take === null ? 14 : take.week + 1) : options.release
  const until = options.holdUntil ?? release ?? b(40)
  return { path: { kind: 'jointTracePicture', jointTraceKey: '', key: path, pathKey: path,
    issuerId: 'local', existingPath: options.existing ?? true, greenlight: start,
    firstTake: take, personRelease: release, cast, staffingWitnessKey: `finite-staffing:${path}`,
    ownerFactRefs: [`finite:${path}:calendar`, `finite:${path}:cast`],
    additionalHolds: [], holdReplacements: [] },
  holds: options.holds ?? ANY.map((slot) => personHold(`${path}:${slot}`, path, cast[slot], start, until)) }
}
function bg(path: string, holds: readonly Hold[] = [], existing = true): Piece {
  return { path: { kind: 'jointTraceBackground', jointTraceKey: '', pathKey: path, issuerId: 'local',
    existingPath: existing, ownerFactRefs: [`finite:${path}:background`] }, holds }
}
function trace(name: string, pieces: readonly Piece[], replacements: readonly HoldReplacement[] = [],
  extras: readonly Hold[] = []): JointOwnerTrace {
  return { kind: 'jointOwnerTrace', traceKey: name, ownerFactRefs: [`finite:${name}:commands`, `finite:${name}:sweep`],
    paths: pieces.map(({ path }) => path.kind === 'jointTracePicture'
      ? { ...path, jointTraceKey: name, key: `${name}/${path.key}` }
      : { ...path, jointTraceKey: name }),
    fixedHoldReplacements: replacements,
    additionalHolds: [...pieces.flatMap((piece) => piece.holds), ...extras] }
}
function prior(promiseId: string, personId: string, mask: PriorClaim['mask'] = LEAD,
  remaining = 1, start = 0, due = 40): PriorClaim {
  return { promiseId, issuerId: 'local', personId, membership: 'current', mask,
    window: window(start, due), remaining }
}
function input(traces: readonly JointOwnerTrace[], overrides: Partial<JointTraceCapacityInput> = {}): JointTraceCapacityInput {
  return { mode: 'jointOwnerTraces', now: b(0), horizonEndWeek: 40, issuerId: 'local',
    target: { promiseId: null, personId: 'T', mask: LEAD, window: window(),
      state: 'unbound', count: 1, actualQualifiedCount: 0 },
    priorClaims: [], foreignDebits: [], fixedHolds: [], traces,
    coverage: { claimsAndHolds: 'complete', existingCalendars: 'complete', allOwnerTraces: 'complete', omissions: [] },
    preparationWork: 0, limits: { claims: 32, units: 64, alternatives: 1024, work: 200000, span: 220 }, ...overrides }
}
function target(source: JointTraceCapacityInput, patch: Partial<JointTraceCapacityInput['target']>): JointTraceCapacityInput {
  return { ...source, target: { ...source.target, ...patch } }
}
function profile(units: number, cuts: readonly (readonly [number, number])[]): PriorProfile {
  return { existingUnits: units, cumulativeByBoundary: cuts.map(([week, count]) => ({ boundary: b(week), units: count })) }
}
function debits(source: JointTraceCapacityInput) {
  return source.foreignDebits.filter((d) => d.issuerId !== source.issuerId && d.personId === source.target.personId
    && d.promiseId !== source.target.promiseId && d.remaining > 0
    && d.sourceWindow.dueWeekExclusive > Math.max(source.now.week, source.target.window.startWeek)
    && d.sourceWindow.startWeek < source.target.window.dueWeekExclusive)
}
const sameSubject = (a: Hold, z: Hold): boolean => a.subject.kind === 'person'
  ? z.subject.kind === 'person' && a.subject.personId === z.subject.personId
  : z.subject.kind === 'resource' && a.subject.resourceKey === z.subject.resourceKey && a.subject.slot === z.subject.slot

// A checker of ONE returned proof against literal facts, not an optimizer or
// trace enumerator. Crucially, its ledger does NOT depend on credited pictures.
function checkWitness(source: JointTraceCapacityInput, witness: JointTraceWitness, targetUnits: number,
  expectedProfile?: PriorProfile, achievable = false): void {
  const matches = source.traces.filter((row) => row.traceKey === witness.traceKey)
  expect(matches).toHaveLength(1)
  const chosen = matches[0]!
  expect(witness.ownerFactRefs).toEqual(sorted(chosen.ownerFactRefs))
  expect(sorted(witness.executedPathKeys)).toEqual(sorted(chosen.paths.map((row) => row.pathKey)))
  expect(new Set(witness.executedPathKeys).size).toBe(chosen.paths.length)
  expect(witness).not.toHaveProperty('selectedAlternativeKeys')
  const effective = new Map(source.fixedHolds.map((hold) => [hold.holdId, { ...hold }]))
  const replaced = new Set<string>()
  for (const replacement of chosen.fixedHoldReplacements) {
    const original = source.fixedHolds.find((hold) => hold.holdId === replacement.holdId)
    assert.ok(original)
    assert.ok(original.replaceableFrom)
    expect(chosen.paths.filter((row) => row.pathKey === original.ownerPathKey)).toHaveLength(1)
    expect(replaced.has(original.holdId)).toBe(false)
    replaced.add(original.holdId)
    expect(compare(replacement.newUntil, original.replaceableFrom)).toBeGreaterThanOrEqual(0)
    expect(compare(replacement.newUntil, original.until)).toBeLessThanOrEqual(0)
    effective.set(original.holdId, { ...original, until: replacement.newUntil })
    expect({ ...effective.get(original.holdId), until: original.until }).toEqual(original)
  }
  for (const original of source.fixedHolds.filter((hold) => !replaced.has(hold.holdId))) {
    expect(effective.get(original.holdId)).toEqual(original)
  }
  const holds: readonly Hold[] = [...effective.values(), ...chosen.additionalHolds]
  expect(new Set(holds.map((hold) => hold.holdId)).size).toBe(holds.length)
  expect(sorted(witness.effectiveHoldIds)).toEqual(sorted(holds.map((hold) => hold.holdId)))
  for (const hold of chosen.additionalHolds) if (hold.ownerPathKey !== null) {
    expect(chosen.paths.filter((row) => row.pathKey === hold.ownerPathKey)).toHaveLength(1)
  }
  for (let i = 0; i < holds.length; i++) for (let j = i + 1; j < holds.length; j++) {
    const a = holds[i]!, z = holds[j]!
    if (!sameSubject(a, z) || compare(a.from, a.until) === 0 || compare(z.from, z.until) === 0) continue
    expect(compare(a.from, z.until) < 0 && compare(z.from, a.until) < 0,
      `compulsory conflict ${a.holdId}/${z.holdId}`).toBe(false)
  }
  const horizon = b(Math.max(source.horizonEndWeek, source.target.window.dueWeekExclusive,
    ...source.priorClaims.map((p) => p.window.dueWeekExclusive)))
  for (const row of chosen.paths) if (row.kind === 'jointTracePicture' && row.personRelease === null) {
    const start = compare(source.now, row.greenlight) > 0 ? source.now : row.greenlight
    for (const person of Object.values(row.cast)) {
      let cursor = start
      const segments = holds.filter((hold) => hold.ownerPathKey === row.pathKey
        && hold.subject.kind === 'person' && hold.subject.personId === person)
        .sort((a, z) => compare(a.from, z.from) || compare(a.until, z.until))
      for (const segment of segments) {
        if (compare(segment.until, cursor) <= 0) continue
        if (compare(cursor, horizon) >= 0) break
        expect(compare(segment.from, cursor)).toBeLessThanOrEqual(0)
        cursor = segment.until
      }
      expect(compare(cursor, horizon)).toBeGreaterThanOrEqual(0)
    }
  }
  type Demand = { demandKey: DemandKey; personId: string; mask: readonly Slot[];
    window: JointTraceCapacityInput['target']['window']; units: number }
  const demands: Demand[] = [
    { demandKey: ['target'], personId: source.target.personId, mask: source.target.mask, window: source.target.window, units: targetUnits },
    ...source.priorClaims.map((p): Demand => ({ demandKey: ['prior', p.promiseId], personId: p.personId,
      mask: p.mask, window: p.window, units: p.remaining })),
    ...debits(source).map((d): Demand => ({ demandKey: ['foreignDebit', d.promiseId], personId: d.personId,
      mask: ANY, window: source.target.window, units: d.remaining })),
  ]
  const paid = new Map(demands.map((d) => [key(d.demandKey), 0]))
  const personPaths = new Set<string>(), credited = new Set<string>()
  const targetEvents: JointTracePicture[] = [], priorTakes: Boundary[] = []
  for (const credit of witness.credits) {
    const demand = demands.find((d) => key(d.demandKey) === key(credit.demandKey))
    assert.ok(demand)
    const row = chosen.paths.find((path) => path.pathKey === credit.pathKey)
    assert.ok(row && row.kind === 'jointTracePicture')
    assert.ok(row.firstTake, 'background/null continuations earn no credit')
    expect(row.cast[credit.slot]).toBe(demand.personId)
    expect(demand.mask).toContain(credit.slot)
    expect(row.firstTake.week).toBeGreaterThanOrEqual(demand.window.startWeek)
    expect(row.firstTake.week).toBeLessThan(demand.window.dueWeekExclusive)
    const personPath = JSON.stringify([demand.personId, row.pathKey])
    expect(personPaths.has(personPath)).toBe(false)
    personPaths.add(personPath); credited.add(row.key)
    paid.set(key(demand.demandKey), paid.get(key(demand.demandKey))! + 1)
    if (credit.demandKey[0] === 'target') targetEvents.push(row)
    else if (row.existingPath) priorTakes.push(row.firstTake)
  }
  for (const demand of demands) expect(paid.get(key(demand.demandKey))).toBe(demand.units)
  expect(sorted(witness.creditedPictureKeys)).toEqual(sorted([...credited]))
  targetEvents.sort((a, z) => compare(a.firstTake!, z.firstTake!) || Number(z.existingPath) - Number(a.existingPath))
  expect(witness.targetTakeBoundaries).toEqual(targetEvents.map((row) => row.firstTake))
  if (expectedProfile !== undefined) {
    const cuts = source.traces.flatMap((t) => t.paths.flatMap((row) =>
      row.kind === 'jointTracePicture' && row.existingPath && row.firstTake !== null ? [row.firstTake] : []))
      .filter((cut, i, all) => all.findIndex((other) => compare(cut, other) === 0) === i).sort(compare)
    expect({ existingUnits: priorTakes.length, cumulativeByBoundary: cuts.map((boundary) => ({ boundary,
      units: priorTakes.filter((take) => compare(take, boundary) <= 0).length })) }).toEqual(expectedProfile)
  }
  if (achievable) {
    const x = source.target.state === 'bound' ? Math.max(0, source.target.count - source.target.actualQualifiedCount) : source.target.count
    expect(targetUnits).toBe(x + Math.ceil(x / 3))
    expect(targetEvents.slice(0, x).every((row) => row.existingPath)).toBe(true)
    expect(source.target.window.dueWeekExclusive - targetEvents[x - 1]!.firstTake!.week).toBeGreaterThanOrEqual(8)
  }
}
function run(source: JointTraceCapacityInput): JointTraceCapacityResult {
  expect(typeof searchPromiseCapacityTraces).toBe('function')
  const before = structuredClone(source)
  const result = searchPromiseCapacityTraces(freeze(source))
  expect(source).toEqual(before)
  expect(Number.isSafeInteger(result.workUsed)).toBe(true)
  expect(result.workUsed).toBeGreaterThanOrEqual(0)
  expect(result.workUsed).toBeLessThanOrEqual(source.limits.work)
  expect(result).not.toHaveProperty('outcome')
  if (result.status === 'CERTIFIED_ACHIEVABLE') checkWitness(source, result.witness, result.bufferDemand, result.priorOptimum, true)
  if (result.status === 'PROVEN_FRAGILE') {
    const x = source.target.state === 'bound' ? Math.max(0, source.target.count - source.target.actualQualifiedCount) : source.target.count
    checkWitness(source, result.countWitness, x, result.reason === 'achievableProbeFailed' ? result.priorOptimum : undefined)
  }
  return result
}
function certified(source: JointTraceCapacityInput, expected: PriorProfile) {
  const result = run(source)
  expect(result.status).toBe('CERTIFIED_ACHIEVABLE')
  if (result.status !== 'CERTIFIED_ACHIEVABLE') throw new Error('expected complete protected trace certificate')
  expect(result.priorOptimum).toEqual(expected)
  return result
}
function fragile(source: JointTraceCapacityInput, reason: 'priorPathProtection' | 'achievableProbeFailed', expected: PriorProfile) {
  const result = run(source)
  expect(result.status).toBe('PROVEN_FRAGILE')
  if (result.status !== 'PROVEN_FRAGILE') throw new Error('expected lawful count trace, not false impossibility')
  expect(result.reason).toBe(reason); expect(result.priorOptimum).toEqual(expected)
  return result
}
function impossible(source: JointTraceCapacityInput) {
  expect(run(source)).toMatchObject({ status: 'PROVEN_IMPOSSIBLE', scope: 'jointOfferOnly' })
}
function invalid(source: unknown) {
  // Missing entry is RED, not a vacuous passing validator-refusal assertion.
  expect(typeof searchPromiseCapacityTraces).toBe('function')
  const before = structuredClone(source)
  // Deliberate internal-validator boundary probe, NOT a cast of engine facts.
  expect(() => searchPromiseCapacityTraces(freeze(source) as JointTraceCapacityInput)).toThrow()
  expect(source).toEqual(before)
}
function reverse(source: JointTraceCapacityInput): JointTraceCapacityInput {
  return { ...source, target: { ...source.target, mask: [...source.target.mask].reverse() },
    priorClaims: [...source.priorClaims].reverse().map((p) => ({ ...p, mask: [...p.mask].reverse() })),
    foreignDebits: [...source.foreignDebits].reverse(), fixedHolds: [...source.fixedHolds].reverse(),
    traces: [...source.traces].reverse().map((t) => ({ ...t, ownerFactRefs: [...t.ownerFactRefs].reverse(),
      paths: [...t.paths].reverse().map((p) => ({ ...p, ownerFactRefs: [...p.ownerFactRefs].reverse() })),
      fixedHoldReplacements: [...t.fixedHoldReplacements].reverse(), additionalHolds: [...t.additionalHolds].reverse() })),
    coverage: { ...source.coverage, omissions: [...source.coverage.omissions].reverse() } }
}

const castT = (suffix: string) => ({ lead: 'T', antagonist: `${suffix}:a`, support: `${suffix}:s` })
function splitTraces() {
  return input([
    trace('early', [event('P', b(10), castT('P')), bg('Q', [], false)]),
    trace('future', [bg('P'), event('Q', b(24), castT('Q'), { existing: false })]),
  ])
}
function releaseDomain(): JointTraceCapacityInput {
  const held: FixedHold = { ...personHold('W:T', 'W', 'T', b(8), b(30)), replaceableFrom: b(10) }
  return target(input([trace('released', [bg('W'), event('G', b(18), castT('G'),
    { existing: false, start: b(15), release: b(22) })], [{ holdId: 'W:T', newUntil: b(14) }])],
  { now: b(10), horizonEndWeek: 30, fixedHolds: [held] }), { window: window(15, 30) })
}
function fullLedger(): JointTraceCapacityInput {
  const fixed: readonly FixedHold[] = [
    { ...personHold('F:T', 'F', 'T', b(8), b(40)), replaceableFrom: b(10) },
    { ...resourceHold('F:stage', 'F', 'stage', 0, b(8), b(40)), replaceableFrom: b(10) },
    { ...personHold('F:F1', 'F', 'F1', b(8), b(14)), replaceableFrom: null },
    { ...personHold('F:F2', 'F', 'F2', b(8), b(14)), replaceableFrom: null },
    { ...resourceHold('other:stage', 'other-path', 'stage', 1, b(10), b(40)), replaceableFrom: null },
  ]
  const f = event('F', null, { lead: 'T', antagonist: 'F1', support: 'F2' }, {
    start: b(8), release: b(14), holds: [resourceHold('F:post', 'F', 'post', 0, b(12), b(14))],
  })
  const g = event('G', b(18), { lead: 'T', antagonist: 'A', support: 'B' }, { start: b(15), release: b(22) })
  const q = event('Q', b(28), castT('Q'), { existing: false, start: b(25), release: b(32) })
  const pieces = [f, bg('W', [personHold('W:writer', 'W', 'writer', b(10), b(16))]),
    { ...g, holds: [...g.holds, resourceHold('G:stage', 'G', 'stage', 0, b(15), b(20)),
      resourceHold('G:post', 'G', 'post', 0, b(20), b(22))] },
    { ...q, holds: [...q.holds, resourceHold('Q:stage', 'Q', 'stage', 0, b(25), b(30)),
      resourceHold('Q:post', 'Q', 'post', 0, b(30), b(32))] }]
  const replacements = [{ holdId: 'F:T', newUntil: b(14) }, { holdId: 'F:stage', newUntil: b(12) }]
  return target(input([trace('a-ledger', pieces, replacements), trace('z-equivalent', pieces, replacements)],
    { now: b(10), fixedHolds: fixed, priorClaims: [prior('A', 'A', FLEX, 1, 15), prior('B', 'B', ANY, 1, 15)] }),
  { window: window(15, 40) })
}
function knownTakeUnknownRelease(until = 40): JointTraceCapacityInput {
  return input([trace('retained', [event('K', b(18), { lead: 'T', antagonist: 'A', support: 'U' },
    { start: b(8), release: null, holdUntil: b(until) })])], { now: b(10), horizonEndWeek: 20 })
}
function foreignDomain(): JointTraceCapacityInput {
  return input([trace('shared', [event('P', b(10), { lead: 'A', antagonist: 'T', support: 'U' }),
    event('R', b(20), castT('R')), event('Q', b(28), castT('Q'), { existing: false })])],
  { priorClaims: [prior('local-A', 'A')], foreignDebits: [{ promiseId: 'foreign-T', issuerId: 'foreign', personId: 'T',
    membership: 'current', sourceWindow: window(39, 60), remaining: 1 }] })
}

describe('joint traces: exclusive executions and compulsory uncredited context', () => {
  it('never splices existing X in one trace with the spare in another', () => {
    const source = splitTraces()
    const result = fragile(source, 'achievableProbeFailed', profile(0, [[10, 0]]))
    expect(result.countWitness.executedPathKeys).toHaveLength(2)
    expect(result.countWitness.creditedPictureKeys).toHaveLength(1)
    impossible(target(source, { count: 2 }))
  })
  it('keeps every null/background path and mandatory hold while only G/Q earn four credits', () => {
    const result = certified(fullLedger(), profile(2, [[18, 2]]))
    expect(sorted(result.witness.executedPathKeys)).toEqual(['F', 'G', 'Q', 'W'])
    expect(result.witness.effectiveHoldIds).toHaveLength(17)
    expect(sorted(result.witness.creditedPictureKeys)).toEqual([
      `${result.witness.traceKey}/G`, `${result.witness.traceKey}/Q`,
    ])
    expect(result.witness.credits).toHaveLength(4)
    expect(result.witness.credits).toEqual(expect.arrayContaining([
      { demandKey: ['prior', 'A'], pathKey: 'G', slot: 'antagonist' },
      { demandKey: ['prior', 'B'], pathKey: 'G', slot: 'support' },
      { demandKey: ['target'], pathKey: 'G', slot: 'lead' },
      { demandKey: ['target'], pathKey: 'Q', slot: 'lead' },
    ]))
  })
  it('a genuine mathematical non-picture continuation releases its own suffix without a film credit', () => {
    const source = releaseDomain()
    const result = fragile(source, 'achievableProbeFailed', profile(0, []))
    expect(sorted(result.countWitness.executedPathKeys)).toEqual(['G', 'W'])
    expect(result.countWitness.credits).toEqual([{ demandKey: ['target'], pathKey: 'G', slot: 'lead' }])
    const noRelease = { ...source, traces: [trace('retained-writing', [bg('W')])] }
    impossible(noRelease)
  })
  it('uncredited other-owner overlap cannot be hidden by a credit subset', () => {
    const source = releaseDomain()
    const other: FixedHold = { ...personHold('other:T', 'other', 'T', b(15), b(19)), replaceableFrom: null }
    invalid({ ...source, fixedHolds: [...source.fixedHolds, other] })
  })
  it('trace replacement keeps exact ownership, immutable prefix and single replacement identity', () => {
    const source = releaseDomain(), t = source.traces[0]!
    const bad: unknown[] = [
      { ...source, traces: [{ ...t, paths: t.paths.filter((p) => p.pathKey !== 'W') }] },
      { ...source, traces: [{ ...t, fixedHoldReplacements: [...t.fixedHoldReplacements, ...t.fixedHoldReplacements] }] },
      { ...source, traces: [{ ...t, fixedHoldReplacements: [{ holdId: 'W:T', newUntil: b(9) }] }] },
      { ...source, traces: [{ ...t, fixedHoldReplacements: [{ holdId: 'W:T', newUntil: b(31) }] }] },
      { ...source, fixedHolds: [{ ...source.fixedHolds[0]!, ownerPathKey: 'unrepresented-owner' }] },
      { ...source, fixedHolds: [{ ...source.fixedHolds[0]!, ownerPathKey: null }] },
      { ...source, fixedHolds: [{ ...source.fixedHolds[0]!, replaceableFrom: null }] },
    ]
    for (const candidate of bad) invalid(candidate)
  })
})

describe('joint trace94: known take, unknown release and effective-horizon coverage', () => {
  it('retains a known take with path-owned occupancy through H40 despite raw horizon20', () => {
    const source = knownTakeUnknownRelease()
    const result = fragile(source, 'achievableProbeFailed', profile(0, [[18, 0]]))
    expect(result.countWitness.credits).toEqual([{ demandKey: ['target'], pathKey: 'K', slot: 'lead' }])
    expect(source.traces[0]!.paths[0]).toHaveProperty('personRelease', null)
    expect(source.traces[0]!.additionalHolds.every((hold) => hold.until.week === 40)).toBe(true)
  })
  it('missing H40 tail is an input error even with no second event or overlapping hold', () => {
    const source = knownTakeUnknownRelease(20)
    expect(source.traces[0]!.paths).toHaveLength(1)
    invalid(source)
  })
  it('adjacent path-owned segments cover H; an internal gap does not', () => {
    const source = knownTakeUnknownRelease(), t = source.traces[0]!
    const original = t.additionalHolds.find((hold) => hold.subject.kind === 'person' && hold.subject.personId === 'T')!
    const others = t.additionalHolds.filter((hold) => hold.holdId !== original.holdId)
    const split = (secondStart: number) => ({ ...source, traces: [{ ...t, additionalHolds: [...others,
      { ...original, holdId: 'K:T:early', until: b(20) },
      { ...original, holdId: 'K:T:late', from: b(secondStart) },
    ] }] })
    fragile(split(20), 'achievableProbeFailed', profile(0, [[18, 0]]))
    invalid(split(21))
  })
  it('another/null path hold is not this unknown-release picture’s required occupancy', () => {
    const source = knownTakeUnknownRelease(), t = source.traces[0]!
    for (const ownerPathKey of ['W', null]) {
      const paths = [...t.paths, { ...bg('W').path, jointTraceKey: t.traceKey }]
      invalid({ ...source, traces: [{ ...t, paths, additionalHolds: t.additionalHolds.map((hold) =>
        hold.subject.kind === 'person' && hold.subject.personId === 'T' ? { ...hold, ownerPathKey } : hold) }] })
    }
  })
  it('full H coverage and ordinary second-owner overlap are separate checks', () => {
    const source = knownTakeUnknownRelease(), t = source.traces[0]!
    const extra = bg('later-work', [personHold('later:T', 'later-work', 'T', b(30), b(31))])
    invalid({ ...source, traces: [{ ...t, paths: [...t.paths, { ...extra.path, jointTraceKey: t.traceKey }],
      additionalHolds: [...t.additionalHolds, ...extra.holds] }] })
  })
  it('local prior due extends H, while retained foreign source due does not', () => {
    const short = target(knownTakeUnknownRelease(20), { window: window(10, 20) })
    invalid({ ...short, priorClaims: [prior('A', 'A', ANY, 1, 10, 40)] })
    const complete = target(knownTakeUnknownRelease(40), { window: window(10, 20) })
    fragile({ ...complete, priorClaims: [prior('A', 'A', ANY, 1, 10, 40)] }, 'achievableProbeFailed', profile(1, [[18, 1]]))
    // Both target and token need T, but K is only one person/path. This lawful
    // count failure also proves source due60 did NOT force occupancy to60.
    impossible({ ...short, foreignDebits: [{ promiseId: 'foreign-T', issuerId: 'foreign', personId: 'T',
      membership: 'bound', sourceWindow: window(19, 60), remaining: 1 }] })
  })
  it('uncertain earlier-release choices do not turn an observed count into proved FRAGILE', () => {
    const source = knownTakeUnknownRelease()
    expect(run({ ...source, coverage: { ...source.coverage, allOwnerTraces: 'incomplete',
      omissions: ['earlier release choice not exhausted'] } })).toMatchObject({ status: 'UNCERTIFIED', reason: 'domainIncomplete' })
  })
  it('preparation exhaustion wins before malformed-coverage validation, without repair or unmetered work', () => {
    const source = knownTakeUnknownRelease(20)
    const result = run({ ...source, preparationWork: 64, limits: { ...source.limits, work: 64 } })
    expect(result).toMatchObject({ status: 'UNCERTIFIED', reason: 'workLimit', workUsed: 64 })
    invalid(source)
  })
})

describe('joint traces: global prior optimum, equivalent traces and common cuts', () => {
  it('does not combine per-trace labels: later reallocation is prior-protection FRAGILE', () => {
    const source = input([
      trace('early', [event('P', b(10), { lead: 'A', antagonist: 'U', support: 'V' }), bg('R'), bg('Q', [], false)]),
      trace('later', [event('P', b(10), castT('P')), event('R', b(18), { lead: 'A', antagonist: 'R1', support: 'R2' }),
        event('Q', b(24), castT('Q'), { existing: false })]),
    ], { priorClaims: [prior('A', 'A')] })
    const result = fragile(source, 'priorPathProtection', profile(1, [[10, 1], [18, 1]]))
    expect(result.countWitness.traceKey).toBe('later')
    expect(result.countWitness.credits).toEqual(expect.arrayContaining([
      { demandKey: ['prior', 'A'], pathKey: 'R', slot: 'lead' },
      { demandKey: ['target'], pathKey: 'P', slot: 'lead' },
    ]))
  })
  it('keeps equivalent optimal traces searchable and retains cuts from unchosen traces', () => {
    const q = event('Q', b(24), castT('Q'), { existing: false })
    const source = input([
      trace('a-bad-first', [event('P', b(10), { lead: 'A', antagonist: 'U', support: 'T' }), bg('R'), q]),
      trace('z-good-later', [event('P', b(10), { lead: 'T', antagonist: 'A', support: 'U' }), bg('R'), q]),
      trace('middle-late-prior', [bg('P'), event('R', b(12), { lead: 'A', antagonist: 'R1', support: 'R2' }), bg('Q', [], false)]),
    ], { priorClaims: [prior('opaque-prior-z', 'A', FLEX)] })
    const result = certified(source, profile(1, [[10, 1], [12, 1]]))
    expect(result.witness.traceKey).toBe('z-good-later') // sole trace with a lawful protected B
    expect(result.witness.credits).toContainEqual({ demandKey: ['prior', 'opaque-prior-z'], pathKey: 'P', slot: 'antagonist' })
    expect(run(reverse(source))).toEqual(result)
  })
})

describe('joint traces: exact same-assignment X/B, existing qualification and slack', () => {
  it('future-only B cannot borrow the existing X certificate from a different trace', () => {
    const source = input([
      trace('existing-only', [event('P', b(10), castT('P')), bg('Q', [], false), bg('R', [], false)]),
      trace('future-pair', [bg('P'), event('Q', b(20), castT('Q'), { existing: false }),
        event('R', b(30), castT('R'), { existing: false })]),
    ])
    fragile(source, 'achievableProbeFailed', profile(0, [[10, 0]]))
  })
  it.each([22, 23])('the Xth existing take at%i has exactly eight or seven weeks slack', (take) => {
    const source = target(input([trace('slack', [event('P', b(take), castT('P')),
      event('Q', b(28), castT('Q'), { existing: false })])]), { window: window(0, 30) })
    if (take === 22) certified(source, profile(0, [[22, 0]]))
    else fragile(source, 'achievableProbeFailed', profile(0, [[23, 0]]))
  })
  it('bound4 minus actual3 needs X1/B2; unbound4 ignores evidence; fulfilled is not an outcome', () => {
    const base = input([trace('bound', [event('P', b(10), castT('P')), event('Q', b(24), castT('Q'), { existing: false })])])
    const bound = target(base, { promiseId: 'bound-T', state: 'bound', count: 4, actualQualifiedCount: 3 })
    const result = certified(bound, profile(0, [[10, 0]]))
    expect(result.remaining).toBe(1); expect(result.bufferDemand).toBe(2)
    impossible(target(bound, { state: 'unbound' }))
    expect(run(target(bound, { actualQualifiedCount: 4 }))).toMatchObject({ status: 'ALREADY_MET', remaining: 0 })
  })
  it('four remaining units need six events, not a rounded-down spare from another trace', () => {
    const pieces = [8, 16, 24, 32, 40, 48].map((week, i) => event(`P${i}`, b(week), castT(`P${i}`), { existing: i < 4 }))
    const source = target(input([trace('six', pieces)], { horizonEndWeek: 64 }), { count: 4, window: window(0, 64) })
    const expected = profile(0, [[8, 0], [16, 0], [24, 0], [32, 0]])
    expect(certified(source, expected).bufferDemand).toBe(6)
    fragile({ ...source, traces: [trace('five', pieces.slice(0, 5))] }, 'achievableProbeFailed', expected)
  })
})

describe('joint traces: foreign tokens remain shared distinct-seat planning obligations', () => {
  it('one-week source overlap withholds the full token without consuming the other beneficiary seat', () => {
    const source = foreignDomain(), result = certified(source, profile(2, [[10, 2], [20, 2]]))
    expect(result.witness.credits).toContainEqual({ demandKey: ['prior', 'local-A'], pathKey: 'P', slot: 'lead' })
    expect(result.witness.credits).toContainEqual({ demandKey: ['foreignDebit', 'foreign-T'], pathKey: 'P', slot: 'antagonist' })
    expect(result.witness.credits.filter((credit) => credit.demandKey[0] === 'target').map((credit) => credit.pathKey).sort()).toEqual(['Q', 'R'])
    const removed = trace('without-R', [event('P', b(10), { lead: 'A', antagonist: 'T', support: 'U' }),
      event('Q', b(28), castT('Q'), { existing: false })])
    fragile({ ...source, traces: [removed] }, 'achievableProbeFailed', profile(2, [[10, 2]]))
    fragile({ ...source, foreignDebits: [{ ...source.foreignDebits[0]!, remaining: 2 }] },
      'achievableProbeFailed', profile(3, [[10, 2], [20, 3]]))
  })
  it('irrelevant foreign rows stay neutral under exact49/56 membership filters', () => {
    const source = input([trace('neutral', [event('P', b(10), castT('P')), event('Q', b(24), castT('Q'), { existing: false })])])
    const d = foreignDomain().foreignDebits[0]!
    for (const debit of [{ ...d, personId: 'other' }, { ...d, issuerId: 'local' }, { ...d, remaining: 0 },
      { ...d, sourceWindow: window(40, 60) }, { ...d, sourceWindow: window(0, 10) }]) {
      const candidate = debit.sourceWindow.dueWeekExclusive === 10 ? target(source, { window: window(10, 40) }) : source
      const result = certified({ ...candidate, foreignDebits: [debit] }, profile(0, [[10, 0]]))
      expect(result.witness.credits.every((credit) => credit.demandKey[0] === 'target')).toBe(true)
    }
  })
})

describe('joint traces: global completeness and proof distinctions', () => {
  it('a complete saturated global prior profile permits a known B trace despite unexhausted future choices', () => {
    const source = foreignDomain()
    const partial = { ...source, coverage: { ...source.coverage, allOwnerTraces: 'incomplete' as const,
      omissions: ['future-only commissions not exhausted; existing calendars are complete'] } }
    certified(partial, profile(2, [[10, 2], [20, 2]]))
    for (const coverage of [
      { ...partial.coverage, existingCalendars: 'incomplete' as const, omissions: ['future work may delay or change an existing picture'] },
      { ...partial.coverage, claimsAndHolds: 'incomplete' as const, omissions: ['mandatory background occupancy is not known'] },
    ]) expect(run({ ...partial, coverage })).toMatchObject({ status: 'UNCERTIFIED', reason: 'domainIncomplete' })
  })
  it('the saturated upper profile deduplicates physical paths across equivalent trace variants', () => {
    const pieces = [event('P', b(10), { lead: 'A', antagonist: 'T', support: 'U' }),
      event('Q', b(24), { lead: 'A', antagonist: 'Q1', support: 'Q2' }, { existing: false }),
      event('R', b(32), castT('R'), { existing: false })]
    const source = target(input([trace('first', pieces), trace('second', pieces)], {
      priorClaims: [prior('A', 'A', ANY, 2)], coverage: { claimsAndHolds: 'complete', existingCalendars: 'complete',
        allOwnerTraces: 'incomplete', omissions: ['future-only choice domain not exhausted'] },
    }), { mask: ANY })
    // Both occurrences of P are ONE physical existing opportunity for A.
    const result = certified(source, profile(1, [[10, 1]]))
    expect(result.witness.credits.filter((credit) => credit.demandKey[0] === 'prior')).toHaveLength(2)
    expect(result.witness.credits).toContainEqual({ demandKey: ['prior', 'A'], pathKey: 'Q', slot: 'lead' })
  })
  it('zero-prior optimum is identically zero even if existing calendars remain unexhausted', () => {
    const source = input([trace('known-B', [event('P', b(10), castT('P')),
      event('Q', b(24), castT('Q'), { existing: false })])], {
      coverage: { claimsAndHolds: 'complete', existingCalendars: 'incomplete', allOwnerTraces: 'incomplete',
        omissions: ['unknown future choices can also change existing calendars'] },
    })
    certified(source, profile(0, [[10, 0]]))
    expect(run({ ...source, coverage: { ...source.coverage, claimsAndHolds: 'incomplete' } }))
      .toMatchObject({ status: 'UNCERTIFIED', reason: 'domainIncomplete' })
  })
  it('partial failed X/B proves neither complete count impossibility nor FRAGILE', () => {
    for (const source of [input([]), splitTraces()]) {
      expect(run({ ...source, coverage: { ...source.coverage, existingCalendars: 'incomplete', allOwnerTraces: 'incomplete',
        omissions: ['unobserved lawful trace may contain additional target events'] } }))
        .toMatchObject({ status: 'UNCERTIFIED', reason: 'domainIncomplete' })
    }
    impossible(input([]))
  })
})

describe('joint traces: one global size/preparation/work budget and canonical permutations', () => {
  it('counts headers plus occurrences, but counts shared claim rows/units only once', () => {
    const pieces = [event('P', b(10), { lead: 'T', antagonist: 'A', support: 'U' })]
    const source = input([trace('first', pieces), trace('second', pieces)], { priorClaims: [prior('A', 'A', FLEX)] })
    const exact = { ...source, limits: { ...source.limits, claims: 2, units: 3, alternatives: 4 } }
    fragile(exact, 'achievableProbeFailed', profile(1, [[10, 1]]))
    for (const limits of [{ ...exact.limits, claims: 1 }, { ...exact.limits, units: 2 }, { ...exact.limits, alternatives: 3 }]) {
      expect(run({ ...exact, limits })).toMatchObject({ status: 'UNCERTIFIED', reason: 'sizeLimit' })
    }
  })
  it('empty headers and background rows cannot evade the governed1024-row ceiling', () => {
    const empties = Array.from({ length: 1025 }, (_, i) => ({ ...trace(String(i), []), ownerFactRefs: ['f'] }))
    expect(run(input(empties))).toMatchObject({ status: 'UNCERTIFIED', reason: 'sizeLimit' })
    const oneBg = { ...trace('0', [bg('W')]), ownerFactRefs: ['f'] }
    expect(run(input([oneBg, ...empties.slice(1, 1024)]))).toMatchObject({ status: 'UNCERTIFIED', reason: 'sizeLimit' })
    //1023 headers plus one background =1024. Other proof/work limits remain
    //governed; specifically do not report an exceeded ROW ceiling here.
    expect(run(input([oneBg, ...empties.slice(1, 1023)])))
      .not.toMatchObject({ status: 'UNCERTIFIED', reason: 'sizeLimit' })
  })
  it('an exhausted preparation budget cannot reset at a fresh trace or validation phase', () => {
    const source = fullLedger()
    for (const preparationWork of [64, 65]) {
      expect(run({ ...source, preparationWork, limits: { ...source.limits, work: 64 } }))
        .toMatchObject({ status: 'UNCERTIFIED', reason: 'workLimit', workUsed: 64 })
    }
  })
  it.each([1, 64, 2048, 200000])('all nonempty collection reversals preserve the ENTIRE result at cap%i', (work) => {
    const base = fullLedger()
    const source = { ...base, limits: { ...base.limits, work },
      foreignDebits: [
        { promiseId: 'irrelevant-z', issuerId: 'foreign', personId: 'other-z', membership: 'current' as const,
          sourceWindow: window(16, 40), remaining: 1 },
        { promiseId: 'irrelevant-a', issuerId: 'foreign', personId: 'other-a', membership: 'bound' as const,
          sourceWindow: window(16, 40), remaining: 1 },
      ], coverage: { ...base.coverage, omissions: ['z complete-domain annotation', 'a complete-domain annotation'] } }
    const result = run(source)
    expect(run(reverse(source))).toEqual(result)
    if (work === 200000) {
      expect(result.status).toBe('CERTIFIED_ACHIEVABLE')
      if (result.status !== 'CERTIFIED_ACHIEVABLE') throw new Error('governed finite baseline must certify')
      expect(result.priorOptimum).toEqual(profile(2, [[18, 2]]))
    }
    // No speculative threshold is prescribed for the intermediate2048 cap.
  })
  it('a literal4096-character provenance leaf proves normalization exhaustion below2048', () => {
    const base = fullLedger()
    for (const work of [1, 64, 2048]) {
      const source = { ...base, traces: base.traces.map((t) => ({ ...t, ownerFactRefs: ['x'.repeat(4096)] })),
        limits: { ...base.limits, work } }
      const result = run(source)
      expect(result).toEqual({ status: 'UNCERTIFIED', reason: 'workLimit', workUsed: work,
        omissions: ['normalization work limit'] })
      expect(run(reverse(source))).toEqual(result)
    }
  })
  it('admitted huge counts/windows cannot trigger unbounded expansion or a guessed negative proof', () => {
    const source = input([], { coverage: { claimsAndHolds: 'complete', existingCalendars: 'incomplete',
      allOwnerTraces: 'incomplete', omissions: ['finite choice domain not expanded'] } })
    const huge = Number.MAX_SAFE_INTEGER
    for (const candidate of [target(source, { count: huge }), target(source, { window: window(0, huge) }),
      { ...source, priorClaims: [prior('huge-A', 'A', LEAD, huge)] }]) {
      const result = run(candidate)
      expect(result.status).toBe('UNCERTIFIED')
      if (result.status !== 'UNCERTIFIED') throw new Error('no complete domain or independent hard bound')
      expect(['sizeLimit', 'domainIncomplete']).toContain(result.reason)
    }
    for (const limits of [{ ...source.limits, claims: 33 }, { ...source.limits, units: 65 },
      { ...source.limits, alternatives: 1025 }, { ...source.limits, work: 200001 }, { ...source.limits, span: 221 }]) {
      invalid({ ...source, limits })
    }
  })
})

describe('joint traces: exact tags, identities and separation from optional49 mode', () => {
  it('rejects mixed modes, per-picture hold fields and impossible background shape', () => {
    const source = releaseDomain(), t = source.traces[0]!
    const picture = t.paths.find((row) => row.kind === 'jointTracePicture')!
    const background = t.paths.find((row) => row.kind === 'jointTraceBackground')!
    const bad: unknown[] = [
      { ...source, mode: 'optionalAlternatives' }, { ...source, alternatives: [] },
      { ...source, traces: [{ ...t, kind: 'somethingElse' }] },
      { ...source, traces: [{ ...t, paths: [{ ...background, kind: undefined }, picture] }] },
      { ...source, traces: [{ ...t, paths: [{ ...background, jointTraceKey: 'not-this-trace' }, picture] }] },
      { ...source, traces: [{ ...t, paths: [background, { ...picture, additionalHolds: t.additionalHolds }] }] },
      { ...source, traces: [{ ...t, paths: [background, { ...picture, holdReplacements: t.fixedHoldReplacements }] }] },
      ...[{ cast: castT('fake') }, { firstTake: null }, { personRelease: null }, { greenlight: b(8) }, { key: 'not-a-film' }]
        .map((extra) => ({ ...source, traces: [{ ...t, paths: [{ ...background, ...extra }, picture] }] })),
    ]
    for (const candidate of bad) invalid(candidate)
  })
  it('refuses duplicate and contradictory identities without confusing conditional trace variants', () => {
    const source = splitTraces(), a = source.traces[0]!, z = source.traces[1]!
    const aPicture = a.paths.find((row) => row.kind === 'jointTracePicture')!
    const zPicture = z.paths.find((row) => row.kind === 'jointTracePicture')!
    const bgP = z.paths.find((row) => row.pathKey === 'P')!
    const bad: unknown[] = [
      { ...source, traces: [a, a] },
      { ...source, traces: [{ ...a, paths: [...a.paths, aPicture] }, z] },
      { ...source, traces: [{ ...a, paths: [...a.paths, { ...bg('P').path, jointTraceKey: a.traceKey }] }, z] },
      { ...source, traces: [a, { ...z, paths: [bgP, { ...zPicture, key: aPicture.key }] }] },
      { ...source, traces: [a, { ...z, paths: [{ ...bgP, existingPath: false }, zPicture] }] },
      { ...source, traces: [a, { ...z, paths: [{ ...bgP, issuerId: 'foreign' }, zPicture] }] },
      { ...source, traces: [{ ...a, additionalHolds: [...a.additionalHolds, a.additionalHolds[0]!] }, z] },
      { ...source, fixedHolds: [
        { ...a.additionalHolds[0]!, replaceableFrom: null }, { ...a.additionalHolds[0]!, replaceableFrom: null },
      ] },
    ]
    for (const candidate of bad) invalid(candidate)
    //fullLedger intentionally reuses each conditional additional hold ID in
    //two distinct traces; that is lawful because no ledger is merged.
    certified(fullLedger(), profile(2, [[18, 2]]))
  })
  it('old entry refuses explicit trace-mode misuse, while a genuine old49 input remains unchanged', () => {
    const source = splitTraces()
    expect(() => searchPromiseCapacity(freeze(source) as unknown as CapacityKernelInput)).toThrow()
    const old: CapacityKernelInput = { now: b(0), horizonEndWeek: 40, issuerId: 'local', target: source.target,
      priorClaims: [], foreignDebits: [], alternatives: [], fixedHolds: [], preparationWork: 0, limits: source.limits,
      coverage: { claimsAndHolds: 'complete', existingAlternatives: 'complete', allAlternatives: 'complete', omissions: [] } }
    expect(searchPromiseCapacity(freeze(old))).toMatchObject({ status: 'PROVEN_IMPOSSIBLE', scope: 'jointOfferOnly' })
    invalid(old)
  })
})
