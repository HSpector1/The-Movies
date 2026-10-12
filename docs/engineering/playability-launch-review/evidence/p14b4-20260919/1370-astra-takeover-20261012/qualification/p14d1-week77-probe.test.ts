// Bounded supplement; original p14d1 leaf and its historical pins remain unchanged.
// K4 is an isolated in-memory ZERO-PENALTY NEGATIVE CONTROL, never live-law evidence.
import { expect, it } from '/Users/zacheryspector/The-Movies-headless-program/node_modules/vitest/dist/index.js'
import { tick, TUNING } from '/Users/zacheryspector/studio-specialists/founding/src/core/index.ts'
import * as save from '/Users/zacheryspector/studio-specialists/founding/src/core/save.ts'
import { p13aGeneratedStudio } from '/Users/zacheryspector/studio-specialists/founding/src/harness/p13a/fixtures.ts'
import { validatePowerRankingArchive } from '/Users/zacheryspector/studio-specialists/founding/src/core/powerRankingArchive.ts'
import { genuineV42Week77 } from '/Users/zacheryspector/studio-specialists/founding/tests/p14d1-week77-fixture.ts'
import { validateLiveSave, downgradeLiveTo45 } from '/Users/zacheryspector/studio-specialists/founding/tests/helpers/live-era.ts'

const canon = (v: any): any => Array.isArray(v) ? v.map(canon)
  : v !== null && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, canon(v[k])])) : v
const projected = (state: any) => {
  const { powerRanking, p15Sequence, sharedMarket, campaignLegacy, ...rest } = state
  return { ...rest, relationships: (rest.relationships ?? []).map((e: any) => ({ ...e, competitions: [], romance: null })),
    hollywood: rest.hollywood === null ? null : { ...rest.hollywood, businesses: rest.hollywood.businesses.map((b: any) => {
      const { screenplayShelving, ...old } = b; return old
    }) } }
}
const shelves = (s: any) => s.hollywood.receipts.filter((r: any) => r.kind === 'screenplayShelved')

it('measures actual v2 week77 shelving, replay and historical zero-penalty control without editing campaign facts', () => {
  const genuine = genuineV42Week77(), original = save.stableStringify(genuine)
  const historic = save.convertV43ToV44(save.convertV42ToV43(genuine)).state
  const run = (label: string) => {
    let state = p13aGeneratedStudio('p13a-core-causal-01')
    let firstProducedWeek: number | null = null
    for (let i = 0; i < 77; i++) {
      state = tick(state)
      if (firstProducedWeek === null && shelves(state).length) firstProducedWeek = state.market.tick
    }
    expect(state.market.tick).toBe(77)
    const before = save.stableStringify(state), envelope = save.makeSave(state)
    expect(validateLiveSave(envelope)).toBe(envelope)
    const rows = state.sharedMarket.assessments
    expect(rows.length, 'nonvacuous market batches').toBeGreaterThan(0)
    if (label === 'actual-r7-v2') expect(rows.some(r => r.factor < 1), 'actual economic pressure exists').toBe(true)
    else expect(rows.every(r => r.factor === 1), 'K4 has unit factors only').toBe(true)
    const wire = save.exportSave(envelope)
    const reloaded = save.migrateToLive(save.importSave(wire)).state
    expect(save.stableStringify(reloaded)).toBe(before)
    let direct = state, reload = reloaded, firstLater: number | null = null
    for (let i = 1; i <= 16; i++) {
      const n = shelves(direct).length
      direct = tick(direct); reload = tick(reload)
      expect(save.stableStringify(reload)).toBe(save.stableStringify(direct))
      if (firstLater === null && shelves(direct).length > n) firstLater = direct.market.tick
    }
    expect(save.stableStringify(state)).toBe(before)
    // Never strip recorded recovery facts to force a historical downgrade.
    let comparison: Record<string, unknown>
    try {
      for (const b of envelope.state.hollywood!.businesses) {
        expect((b as any).costCutting).toEqual({ version: 1, since: null })
        for (const p of b.account.periods) expect((p.movements as any).facilityDemolitionRefund).toBe(0)
      }
      expect(envelope.state.hollywood!.receipts.some(r => (r.kind as string) === 'facilityDisposed')).toBe(false)
      const era45 = downgradeLiveTo45(envelope)
      save.validateSaveV45(era45)
      expect(era45.state.relationships.every(e => e.competitions.length === 0)).toBe(true)
      if (label === 'actual-r7-v2') expect(era45.state.sharedMarket.assessments).toEqual([])
      else {
        // 1355-A K4: validated unit-factor P15 root may be omitted from the
        // comparison value. The envelope and its authoritative history stay intact.
        expect(era45.state.sharedMarket.assessments.length).toBeGreaterThan(0)
        expect(era45.state.sharedMarket.assessments.every(r => r.factor === 1)).toBe(true)
      }
      expect(era45.state.campaignLegacy.official).toBeNull()
      expect(era45.state.campaignLegacy.endOfRun).toBeNull()
      validatePowerRankingArchive(era45.state as any)
      save.validateP15Allocator(era45.state as any, 'week77 bounded control')
      comparison = { admitted: true, equalAfterExistingProjection: JSON.stringify(canon(projected(era45.state))) === JSON.stringify(canon(projected(historic))), receiptsEqual: save.stableStringify(state.hollywood!.receipts) === save.stableStringify(historic.hollywood!.receipts) }
    } catch (e) { comparison = { admitted: false, missingPremise: e instanceof Error ? e.message : String(e) } }
    const measurement = { label, definition: 'p15a1-market-v2', penalty: TUNING.SHARED_MARKET_FACTOR_MAX_PENALTY,
      week: 77, shelvesThrough77: shelves(state).length, firstProducedWeek, firstNewShelfWithinNext16ProducedWeek: firstLater,
      zeroThrough77AndNext16Witness: shelves(state).length === 0 && firstLater !== null, replay16ByteEqual: true, comparison }
    console.info('WEEK77_MEASUREMENT ' + JSON.stringify(measurement))
    return measurement
  }
  expect(TUNING.SHARED_MARKET_FACTOR_MAX_PENALTY).toBe(0.15)
  const live = run('actual-r7-v2')
  const tuning = TUNING as unknown as { SHARED_MARKET_FACTOR_MAX_PENALTY: number }
  const old = tuning.SHARED_MARKET_FACTOR_MAX_PENALTY
  let control: ReturnType<typeof run>
  try { tuning.SHARED_MARKET_FACTOR_MAX_PENALTY = 0; control = run('K4-zero-penalty-negative-control') }
  finally { tuning.SHARED_MARKET_FACTOR_MAX_PENALTY = old }
  expect(TUNING.SHARED_MARKET_FACTOR_MAX_PENALTY).toBe(0.15)
  expect(save.stableStringify(genuine)).toBe(original)
  console.info('WEEK77_QUALIFICATION ' + JSON.stringify({ actualLiveRouteCovered: live.zeroThrough77AndNext16Witness,
    historicalControlExact: control!.comparison.equalAfterExistingProjection === true,
    continuingGap: live.zeroThrough77AndNext16Witness ? null : 'Original zero-through77/next16 premise moved; measured route is not a waiver',
    scope: '93 generated weeks per law; 16 replay weeks per law; not full K4 6240-week qualification' }))
  // These control assertions close causal attribution only if the historical
  // comparison is actually admitted and exact; a printed gap is not clearance.
  expect(control!.comparison.admitted, 'K4 historical comparison admitted').toBe(true)
  expect(control!.comparison.equalAfterExistingProjection, 'K4 exact historical root-stripped equality').toBe(true)
  expect(control!.comparison.receiptsEqual, 'K4 exact historical receipt equality').toBe(true)
  // Preserve the original bounded viable premise as a real assertion, after diagnostics.
  expect(live.shelvesThrough77, 'original zero-shelving-through-week77 premise').toBe(0)
  expect(live.firstNewShelfWithinNext16ProducedWeek, 'original next16 visible shelving witness').not.toBeNull()
}, 30_000)
