import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { initializeHollywood } from '../src/core/hollywood.js'
import { exportSave, importSave, makeSave, migrateToV20, validateSaveV19, validateSaveV20 } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { technologyMilestoneDrafts } from '../src/core/technologyMilestones.js'
import type { GameState } from '../src/core/types.js'
import { generateWorld } from '../src/core/worldgen.js'

const milestones = (state: GameState) => state.studioHistory.rows.filter(row => row.kind === 'technologyMilestone')
const accepted = () => validateSaveV19(JSON.parse(gunzipSync(readFileSync(new URL('./fixtures/p13a/accepted-v19.json.gz', import.meta.url))).toString('utf8')))

describe('P13A dated public technology history', () => {
  const states = new Map<number, GameState>()
  beforeAll(() => {
    const generated = generateWorld('p13a-dated-history')
    let state = initializeHollywood(applyActions({ ...generated, economyEngagedEver: true }, [{ kind: 'activateStudioOperations' }]), 'fresh')
    while (state.market.tick < 417) {
      state = tick(state)
      if ([259, 260, 261, 415, 416, 417].includes(state.market.tick)) states.set(state.market.tick, state)
    }
  }, 30_000)

  it('records each exact reached date in the authoritative tick before returning its committed state', () => {
    expect(milestones(states.get(259)!)).toEqual([])
    const research = milestones(states.get(260)!)
    expect(research).toHaveLength(1)
    expect(research[0]).toMatchObject({ kind: 'technologyMilestone', technologyId: 'synchronized-sound',
      milestone: 'researchable', week: 260, significance: 'major', subjects: [{ kind: 'studio' }] })
    expect(milestones(states.get(261)!)).toEqual(research)
    expect(milestones(states.get(415)!)).toEqual(research)
    const released = milestones(states.get(416)!)
    expect(released).toHaveLength(2)
    expect(released[1]).toMatchObject({ technologyId: 'synchronized-sound', milestone: 'commercialRelease', week: 416, significance: 'major' })
    expect(milestones(states.get(417)!)).toEqual(released)
    // Research history remains permanent well beyond the routine folding window.
    expect(released[0]).toEqual(research[0])
    expect(released[1]!.eventId).toBeGreaterThan(released[0]!.eventId)
  })

  it('round-trips both boundaries exactly and resumes without duplicating the permanent events', () => {
    for (const week of [259, 260, 415, 416]) {
      const state = states.get(week)!
      const json = exportSave(makeSave(state))
      const restored = migrateToV20(importSave(json)).state
      expect(exportSave(makeSave(restored))).toBe(json)
      expect(milestones(tick(restored))).toEqual(milestones(states.get(week + 1)!))
    }
  })

  it('never backfills after migration, skips dates not actually reached, and leaves the frozen V19 vocabulary closed', () => {
    const migrated = migrateToV20(accepted())
    expect(milestones(migrated.state)).toEqual([])
    const state = states.get(259)!
    expect(technologyMilestoneDrafts(state, 416)).toEqual([])
    expect(technologyMilestoneDrafts({ ...state, technology: { ...state.technology, recordingStartedWeek: 260 } }, 260)).toEqual([])
    expect(technologyMilestoneDrafts({ ...states.get(416)!, technology: { ...state.technology, recordingStartedWeek: 416 } }, 417)).toEqual([])
    expect(technologyMilestoneDrafts({ ...state, hollywood: null }, 260)).toEqual([])
    const old = accepted()
    Object.assign(old.state.studioHistory, { nextEventId: 1, rows: [{ ...milestones(states.get(260)!)[0]!, eventId: 0 }] })
    expect(() => validateSaveV19(old)).toThrow(/kind/)
  })

  it('rejects invented dates, unknown facts, wrong significance or subjects, duplicates, and pre-recording history', () => {
    const save = makeSave(states.get(416)!)
    for (const change of [
      { technologyId: 'imaginary-sound' }, { milestone: 'adopted' }, { week: 261 },
      { significance: 'routine' }, { subjects: [] },
    ]) {
      const forged = structuredClone(save)
      Object.assign(milestones(forged.state)[0]!, change)
      expect(() => validateSaveV20(forged)).toThrow(/technology milestone/)
    }
    const duplicated = structuredClone(save)
    duplicated.state.studioHistory.rows = [...duplicated.state.studioHistory.rows,
      { ...milestones(duplicated.state)[0]!, eventId: duplicated.state.studioHistory.nextEventId++ }]
    expect(() => validateSaveV20(duplicated)).toThrow(/duplicate technology milestone/)
    const preRecorded = structuredClone(save)
    preRecorded.state.technology.recordingStartedWeek = 260
    expect(() => validateSaveV20(preRecorded)).toThrow(/invented technology history/)
  })
})
