import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { BridgeSession } from '../bridge/session.ts'
import { BRIDGE_SCHEMA, PROJECTION_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { loadBridgeRuntimeCheckpoint, SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS } from '../bridge/runtime-checkpoint.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { applyActions, queryPlacement, stableStringify, tick } from '../src/core/index.js'
import { financeHistory, recordedFinancePeriod, FINANCE_CAPITAL_CONTRIBUTOR_LIMIT } from '../src/core/financeReport.js'

const fixturePath = 'ui/e2e/p11-core-v1/s2-p11-capital-heavy.checkpoint.json'
const oldSchema = 'sha256:204a71924bd8c2e8ae9af47591226894b3e42f62457da3cc20ed6b106ede611a'
function capitalStudio() {
  const raw = readFileSync(fixturePath, 'utf8')
  const manifest = JSON.parse(readFileSync('ui/e2e/p11-core-v1/manifest.json', 'utf8'))
  const fixture = manifest.fixtures.find((row: { id: string }) => row.id === 's2-p11-capital-heavy')
  expect(createHash('sha256').update(raw).digest('hex')).toBe(fixture.files.checkpointSha256)
  expect(JSON.parse(raw).schemaId).toBe(oldSchema)
  return BridgeSession.fromRuntimeCheckpoint(loadBridgeRuntimeCheckpoint(raw).hydrated)
}

describe('P11 recorded facility capital contributors over the real bridge', () => {
  it('hydrates genuine outgoing projection24 and joins four original payments to exact construction events', () => {
    expect(PROJECTION_VERSION).toBe(29)
    expect(SCHEMA_ID).not.toBe(oldSchema)
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(oldSchema)).toBe('projection-v24')
    const session = capitalStudio()
    const before = session.exportRuntimeCheckpoint()
    const response = session.snapshot()
    parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, response)
    const period = response.snapshot.finance.finance.currentPeriod
    const detail = period.capitalContributors
    expect(period.fromWeek).toBe(14)
    expect(period.complete).toBe(true)
    expect(detail.rows).toHaveLength(4)
    expect(detail.recordedAmount).toBe(-5_900_000)
    expect(detail.displayedAmount).toBe(detail.recordedAmount)
    expect(detail.remainingEntries).toBe(0)
    expect(detail.remainingAmount).toBe(0)
    expect(detail.recordedAmount).toBe(period.categories.find(c => c.kind === 'constructionCapex')!.amount)
    for (const row of detail.rows) {
      const ledger = session.gameState.ledger[row.ledgerIndex]!
      expect(ledger).toMatchObject({ kind: 'constructionCapex', constructionProjectId: row.constructionProjectId, amount: row.amount, week: row.week })
      const placed = session.gameState.placement.facilities.find(p => p.projectId === row.constructionProjectId)!
      expect(row.placementId).toBe(placed.id)
      expect(row.facilityId).toBe(placed.facilityId)
      expect(row.buildingId).toBe(`placed-${placed.id}`)
      const event = session.gameState.studioHistory.rows.find(e => e.eventId === row.historyEventId)!
      expect(event).toMatchObject({ kind: 'facilityCommitted', placementId: placed.id, facilityId: placed.facilityId, name: row.name, week: row.week })
    }
    expect(session.exportRuntimeCheckpoint()).toEqual(before)
  })

  it('preserves same-name site identities across periods, completion and history windows', () => {
    const state = capitalStudio().gameState
    const period = recordedFinancePeriod(state, 0, 14, 'all', 'Recorded weeks 0–14')
    const offices = period.capitalContributors.rows.filter(r => r.name === 'Development & Casting Office')
    expect(offices).toHaveLength(2)
    expect(new Set(offices.map(r => r.constructionProjectId)).size).toBe(2)
    expect(new Set(offices.map(r => r.historyEventId)).size).toBe(2)
    expect(offices.map(r => r.week)).toEqual([0, 14])
    let advanced = state
    for (let n = 0; n < 15; n++) advanced = tick(advanced)
    expect(recordedFinancePeriod(advanced, 0, 14, 'all', 'Recorded weeks 0–14').capitalContributors).toEqual(period.capitalContributors)
    const history = financeHistory(advanced)
    const week14 = history.windows[1]!.points.find(p => p.fromWeek === 14)!
    expect(week14.capitalContributors).toEqual(recordedFinancePeriod(advanced, 14, 14, 'week', 'Week 14').capitalContributors)
    expect(stableStringify(state)).toBe(stableStringify(capitalStudio().gameState))
  })

  it('keeps bounded overflow explicit and its signed amounts reconcilable to the category', () => {
    const state = capitalStudio().gameState
    const full = recordedFinancePeriod(state, 0, 14, 'all', 'All').capitalContributors
    const bounded = recordedFinancePeriod(state, 0, 14, 'all', 'All', 2).capitalContributors
    expect(bounded.rows).toEqual(full.rows.slice(0, 2))
    expect(bounded.totalEntries).toBe(5)
    expect(bounded.remainingEntries).toBe(3)
    expect(bounded.displayedAmount).toBe(full.rows.slice(0, 2).reduce((sum, row) => sum + row.amount, 0))
    expect(bounded.remainingAmount).toBe(full.rows.slice(2).reduce((sum, row) => sum + row.amount, 0))
    expect(bounded.displayedAmount + bounded.remainingAmount).toBe(bounded.recordedAmount)
    expect(bounded.recordedAmount).toBe(full.recordedAmount)
    expect(bounded.notice).toContain('Showing 2 of 5')
    const none = recordedFinancePeriod(state, 0, 14, 'all', 'All', 0).capitalContributors
    expect(none.rows).toHaveLength(0)
    expect(none.remainingAmount).toBe(full.recordedAmount)
    expect(recordedFinancePeriod(state, 0, 14, 'all', 'All', 1_000).capitalContributors.rows.length).toBeLessThanOrEqual(FINANCE_CAPITAL_CONTRIBUTOR_LIMIT)
  })

  it('never uses history as amount authority or guesses a demolished site from its title or ledger note', () => {
    const state = capitalStudio().gameState
    const original = recordedFinancePeriod(state, 0, 14, 'all', 'All').capitalContributors
    const demolishedId = state.placement.facilities[1]!.id
    const removed = applyActions(state, [{ kind: 'demolishFacility', demolition: { placementId: demolishedId } }])
    const detail = recordedFinancePeriod(removed, 0, 14, 'all', 'All').capitalContributors
    const row = detail.rows.find(r => r.ledgerIndex === original.rows.find(r => r.placementId === demolishedId)!.ledgerIndex)!
    expect(row.amount).toBe(state.ledger[row.ledgerIndex]!.amount)
    expect(row.name).toBe(state.ledger[row.ledgerIndex]!.note)
    expect(row.placementId).toBeNull()
    expect(row.facilityId).toBeNull()
    expect(row.historyEventId).toBeNull()
    expect(row.buildingId).toBeNull()
    expect(row.identityBasis).toContain('no exact History link')
    expect(detail.recordedAmount).toBe(original.recordedAmount)
    // A same-name office still stands; it must not become the removed payment's link.
    expect(detail.rows.some(r => r.name === 'Development & Casting Office' && r.historyEventId !== null)).toBe(true)
  })

  it('caps a real 26-purchase history at 20 without hiding the remaining payments', () => {
    let state = capitalStudio().gameState
    const origins = Array.from({ length: 30 * 40 }, (_, i) => ({ gx: i % 40, gy: Math.floor(i / 40) }))
    const origin = origins.find(origin => queryPlacement(state, { blueprintId: 'craft-annex', origin }).ok)!
    expect(origin).toBeDefined()
    for (let n = 0; n < 21; n++) {
      state = applyActions(state, [{ kind: 'placeFacility', placement: { blueprintId: 'craft-annex', origin } }])
      const placementId = state.placement.facilities.at(-1)!.id
      state = applyActions(state, [{ kind: 'demolishFacility', demolition: { placementId } }])
    }
    const before = stableStringify(state)
    const period = recordedFinancePeriod(state, 0, 14, 'all', 'All', 1_000)
    const detail = period.capitalContributors
    expect(detail.rows).toHaveLength(FINANCE_CAPITAL_CONTRIBUTOR_LIMIT)
    expect(detail.totalEntries).toBe(26)
    expect(detail.remainingEntries).toBe(6)
    expect(detail.recordedAmount).toBe(period.categories.find(c => c.kind === 'constructionCapex')!.amount)
    expect(detail.displayedAmount + detail.remainingAmount).toBe(detail.recordedAmount)
    expect(detail.notice).toContain('Showing 20 of 26')
    expect(stableStringify(state)).toBe(before)
  })

  it('excludes the checkpoint prefix and keeps partial-period capital coverage honest', () => {
    const state = capitalStudio().gameState
    const firstRecent = state.ledger.findIndex(e => e.kind === 'constructionCapex' && e.week === 14)
    const checkpointCash = state.ledger.slice(firstRecent).reduce((cash, e) => cash - e.amount, state.studio.cash)
    const boundedState = { ...state, cashLedgerCheckpoint: { cash: checkpointCash, ledgerLength: firstRecent },
      studioHistory: { ...state.studioHistory, recordingStartedWeek: 14, rows: [] } }
    const period = recordedFinancePeriod(boundedState, 0, 14, 'retained', 'Retained period')
    expect(period.complete).toBe(false)
    expect(period.openingCash).toBeNull()
    expect(period.closingCash).toBeNull()
    expect(period.capitalContributors.rows).toHaveLength(4)
    expect(period.capitalContributors.rows.every(row => row.ledgerIndex >= firstRecent && row.historyEventId === null)).toBe(true)
    expect(period.capitalContributors.notice).toContain('does not have complete recording coverage')
    expect(period.capitalContributors.recordedAmount).toBe(period.categories.find(c => c.kind === 'constructionCapex')!.amount)
    const unavailable = recordedFinancePeriod(boundedState, 0, 13, 'old', 'Old')
    expect(unavailable.coverage).toBe('unavailable')
    expect(unavailable.capitalContributors.rows).toHaveLength(0)
    expect(unavailable.capitalContributors.notice).toContain('Retained')
  })
})
