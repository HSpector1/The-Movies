// S8 test5: real earned rival RESEARCH divergence preserves pure S7 disclosure.
// Fixture repair: original p13b-s8-nonleak-01 minted invalid lab/seats/history.
// Genuine accepted1368 p13a-core-causal-01 week267 is publicly migrated45→current.
// Only current r01 sound budget40000→20000 for worked267, then40000 restored at268, is CONSTRUCTED, not naturally chosen
// policy or a public rival command. Both fully admitted arms earn all later facts
// through ordinary full develop:true ticks. No standalone half-phase research.
import { beforeAll, describe, expect, it } from 'vitest'
import { performance } from 'node:perf_hooks'
import { accepted45 } from './helpers/1368-recovery-witnesses.js'
import { makeSave, stableStringify, validateSaveV50 } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { researchWeekQuote, studioContext } from '../src/core/technology.js'
import { technologyEntry } from '../src/core/technologyCatalogue.js'
import { technologyAnnouncements, technologyForecast } from '../src/core/technologyDisclosure.js'
import { isOperatingStudio } from '../src/core/operatingState.js'
import type { GameState } from '../src/core/types.js'

const PROJECT = 'studio-aca408ec-r01:research:synchronized-sound'
const RIVAL = 'studio-aca408ec-r01'
const bytes = (value: unknown) => stableStringify(value)
const options = { develop: true } as const
function project(state: GameState) {
  const found = state.technology.projects.find(p => p.id === PROJECT)
  expect(found, 'actual accepted267 research project prerequisite').toBeDefined()
  return found!
}
function business(state: GameState) {
  const found = state.hollywood!.businesses.find(b => b.studioId === RIVAL)
  expect(found, 'actual named rival business prerequisite').toBeDefined()
  return found!
}
function admit(state: GameState) {
  const before = bytes(state)
  const saved = makeSave(state)
  expect(validateSaveV50(saved)).toBe(saved)
  expect(bytes(state)).toBe(before)
}
function normalized(state: GameState) {
  return { ...state, technology: { ...state.technology, projects: state.technology.projects.map(p =>
    p.id === PROJECT ? { ...p, budgetPerWeek: null } : p) } }
}
function shared(state: GameState) {
  return { studio: state.studio, contracts: state.contracts, ledger: state.ledger,
    operations: state.operations, placement: state.placement, market: state.market,
    era: state.era, rngState: state.rngState, access: state.technology.access,
    adoptions: state.technology.adoptions, chart: state.hollywood!.chart }
}
function earned(state: GameState) {
  const p = project(state)
  return { status: p.status, verifiedWork: p.verifiedWork, expenditure: p.expenditure,
    startedWeek: p.startedWeek, completedWeek: p.completedWeek, seats: p.seats, weeks: p.weeks, legacy: p.legacy }
}
function spend(state: GameState) {
  return business(state).account.periods.reduce((sum, p) => sum + p.movements.researchSpend, 0)
}
function disclosure(state: GameState) {
  return { lighting: technologyForecast(technologyEntry('lighting-control-01'), state.market.tick),
    sound: technologyForecast(technologyEntry('synchronized-sound'), state.market.tick),
    announcements: technologyAnnouncements(state.market.tick) }
}
function readPure(state: GameState) {
  const before = bytes(state), out = disclosure(state)
  expect(bytes(state)).toBe(before)
  return out
}
function advancePair(a: GameState, b: GameState, target: number, started: number): [GameState, GameState] {
  while (a.market.tick < target) {
    expect(b.market.tick).toBe(a.market.tick)
    // Never advance either actual player terminal. No funding/closure deferral.
    if (!isOperatingStudio(a, a.hollywood!.playerStudioId) || !isOperatingStudio(b, b.hollywood!.playerStudioId))
      throw new Error(`PREREQUISITE: player closed before non-leak target${target} at${a.market.tick}`)
    if (performance.now() - started > 30_000) throw new Error('30-second existing route budget exceeded')
    const at = a.market.tick
    a = tick(a, options); b = tick(b, options)
    expect(a.market.tick).toBe(at + 1); expect(b.market.tick).toBe(at + 1)
  }
  expect(a.market.tick).toBe(target); expect(b.market.tick).toBe(target)
  admit(a); admit(b)
  return [a, b]
}
function endpoint(a: GameState, b: GameState) {
  expect(a.market.tick).toBe(b.market.tick)
  expect(a.operations).toEqual(b.operations)
  expect(a.placement).toEqual(b.placement)
  expect(project(a).weeks.find(w => w.week === 267)?.spend).toBe(40_000)
  expect(project(b).weeks.find(w => w.week === 267)?.spend).toBe(20_000)
  expect(bytes(earned(a))).not.toBe(bytes(earned(b)))
  expect(project(a).expenditure).not.toBe(project(b).expenditure)
  expect(bytes(readPure(a))).toBe(bytes(readPure(b)))
}

describe('P13B-S8 non-leak: admitted one-week budget counterfactual retains earned rival research divergence (test5)', () => {
  let original267: GameState, constructed267: GameState, actual268: GameState, constructed268: GameState
  let base: GameState, rivalResearchVariant: GameState
  let originalBytes: string, constructedBytes: string
  let restored268: GameState, restored268Bytes: string, constructed268Bytes: string
  let qA: ReturnType<typeof researchWeekQuote>, qB: ReturnType<typeof researchWeekQuote>
  beforeAll(() => {
    const started = performance.now()
    const captured = accepted45('research')
    expect(captured.row.rawSha256).toBe('2b27ca1517b8fcf5329b4742e329e252dfb40fe2dbafe3868244bd6f81b0f3b1')
    original267 = captured.current.state
    expect(original267.seed).toBe('p13a-core-causal-01'); expect(original267.market.tick).toBe(267)
    expect(project(original267)).toMatchObject({ studioId: RIVAL, technologyId: 'synchronized-sound',
      status: 'active', budgetPerWeek: 40_000, verifiedWork: 12, expenditure: 80_000 })
    expect(project(original267).seats.filter(s => s.releasedWeek === null)).toHaveLength(4)
    expect(isOperatingStudio(original267, RIVAL)).toBe(true)
    expect(business(original267).costCutting.since).toBeNull()
    admit(original267) // Genuine input admission BEFORE constructing the current-policy counterfactual.
    constructed267 = { ...original267, technology: { ...original267.technology,
      projects: original267.technology.projects.map(p => p.id === PROJECT ? { ...p, budgetPerWeek: 20_000 } : p) } }
    originalBytes = bytes(original267); constructedBytes = bytes(constructed267)
    expect(constructedBytes).not.toBe(originalBytes)
    expect(bytes(normalized(constructed267))).toBe(bytes(normalized(original267)))
    admit(constructed267) // Failure aborts setup BEFORE any tick.
    qA = researchWeekQuote(original267, project(original267), studioContext(original267, RIVAL))
    qB = researchWeekQuote(constructed267, project(constructed267), studioContext(constructed267, RIVAL))
    expect(qA.spend).toBeGreaterThan(qB.spend); expect(qB.spend).toBeGreaterThan(0)
    expect(qA.output).toBeGreaterThan(qB.output); expect(qB.output).toBeGreaterThan(0)
    expect(qA.output).toBeLessThan(technologyEntry('synchronized-sound').work - 12)
    expect(qB.output).toBeLessThan(technologyEntry('synchronized-sound').work - 12)
    expect(bytes(original267)).toBe(originalBytes); expect(bytes(constructed267)).toBe(constructedBytes)
    expect(shared(constructed267)).toEqual(shared(original267))
    expect(readPure(constructed267)).toEqual(readPure(original267))
    expect(isOperatingStudio(original267, original267.hollywood!.playerStudioId)).toBe(true)
    expect(isOperatingStudio(constructed267, constructed267.hollywood!.playerStudioId)).toBe(true)
    actual268 = tick(original267, options); admit(actual268)
    expect(bytes(original267)).toBe(originalBytes)
    constructed268 = tick(constructed267, options); admit(constructed268)
    expect(bytes(constructed267)).toBe(constructedBytes)
    expect(actual268.market.tick).toBe(268); expect(constructed268.market.tick).toBe(268)
    // Measured one-week intervention: current policy returns to40k without rewriting earned267 facts.
    expect(project(constructed268)).toMatchObject({ status: 'active', budgetPerWeek: 20_000 })
    constructed268Bytes = bytes(constructed268)
    restored268 = { ...constructed268, technology: { ...constructed268.technology,
      projects: constructed268.technology.projects.map(p => p.id === PROJECT ? { ...p, budgetPerWeek: 40_000 } : p) } }
    expect(bytes(normalized(restored268))).toBe(bytes(normalized(constructed268)))
    expect(bytes(constructed268)).toBe(constructed268Bytes)
    admit(restored268) // Refusal stops BEFORE any restored-policy tick.
    restored268Bytes = bytes(restored268)
    ;[base, rivalResearchVariant] = advancePair(actual268, restored268, 780, started)
    expect(bytes(constructed268)).toBe(constructed268Bytes)
    expect(bytes(restored268)).toBe(restored268Bytes)
    endpoint(base, rivalResearchVariant)
    expect(bytes(original267)).toBe(originalBytes); expect(bytes(constructed267)).toBe(constructedBytes)
  }, 30_000)

  it('precondition: same-week admitted arms differ only in current rival research budget initially, retaining earned research divergence at780', () => {
    expect(bytes(normalized(constructed267))).toBe(bytes(normalized(original267)))
    expect(constructed267).not.toEqual(original267)
    expect(rivalResearchVariant.market.tick).toBe(base.market.tick)
    expect(bytes(earned(rivalResearchVariant))).not.toBe(bytes(earned(base)))
    expect(rivalResearchVariant.operations).toEqual(base.operations)
    expect(rivalResearchVariant.placement).toEqual(base.placement)
    expect(rivalResearchVariant.technology.access).toEqual(base.technology.access)
    expect(rivalResearchVariant.technology.adoptions).toEqual(base.technology.adoptions)
    expect(rivalResearchVariant.hollywood!.chart).toEqual(base.hollywood!.chart)
    // Keep the original780 access/adoption/chart invariants; measurement is
    // still required. Retained earned history, not active-at780, is required.
    expect(shared(constructed267)).toEqual(shared(original267))
    expect(shared(constructed268)).toEqual(shared(actual268))
  })

  it('real full research week earns positive unequal verifiedWork/expenditure and rival debits without changing player/shared roots', () => {
    for (const [input, next, quote] of [[original267, actual268, qA], [constructed267, constructed268, qB]] as const) {
      expect(project(next).verifiedWork - project(input).verifiedWork).toBe(quote.output)
      expect(project(next).expenditure - project(input).expenditure).toBe(quote.spend)
      expect(project(next).weeks.at(-1)).toMatchObject({ week: 267, spend: quote.spend })
      expect(spend(next) - spend(input)).toBe(-quote.spend)
    }
    expect(project(actual268).verifiedWork).toBeGreaterThan(project(constructed268).verifiedWork)
    expect(project(actual268).expenditure).toBeGreaterThan(project(constructed268).expenditure)
    expect(shared(constructed268)).toEqual(shared(actual268)) // Includes player's actual cash/ledger after full ticks.
    expect(readPure(constructed268)).toEqual(readPure(actual268))
    expect(bytes(original267)).toBe(originalBytes); expect(bytes(constructed267)).toBe(constructedBytes)
  })

  it('lighting forecast (windowed) is byte-identical across the research-divergent states at week780', () => {
    const a = readPure(base).lighting, b = readPure(rivalResearchVariant).lighting
    expect(b).toEqual(a); expect(JSON.stringify(b)).toBe(JSON.stringify(a))
    expect(a).toEqual({ kind: 'window', fromWeek: 884, toWeek: 988 })
  })

  it('technologyAnnouncements(780) is byte-identical (no research row, seat count or spend published)', () => {
    const a = readPure(base).announcements, b = readPure(rivalResearchVariant).announcements
    expect(b).toEqual(a); expect(bytes(b)).toBe(bytes(a)); expect(a).toEqual([])
  })

  it('advanced independently to900, earned research divergence persists while pure forecasts/announcements remain byte-identical', () => {
    const started = performance.now(), beforeA = bytes(base), beforeB = bytes(rivalResearchVariant)
    const [base900, variant900] = advancePair(base, rivalResearchVariant, 900, started)
    endpoint(base900, variant900)
    expect(bytes(base)).toBe(beforeA); expect(bytes(rivalResearchVariant)).toBe(beforeB)
    const a = readPure(base900), b = readPure(variant900)
    expect(b.lighting).toEqual(a.lighting); expect(bytes(b.lighting)).toBe(bytes(a.lighting))
    expect(a.lighting).toEqual({ kind: 'exact', commercialWeek: 936, announcedWeek: 884 })
    expect(b.announcements).toEqual(a.announcements); expect(bytes(b.announcements)).toBe(bytes(a.announcements))
    expect(a.announcements).toEqual([{ technologyId: 'lighting-control-01', week: 884 }])
    expect(bytes(constructed268)).toBe(constructed268Bytes)
    expect(bytes(restored268)).toBe(restored268Bytes)
    expect(bytes(original267)).toBe(originalBytes); expect(bytes(constructed267)).toBe(constructedBytes)
  }, 30_000)
})
