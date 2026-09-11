import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { generateScientist } from '../src/core/worldgen.js'
import { convertV19ToV20, exportSave, importSave, makeSave, makeSaveV18, migrateToV19, migrateToV20, validateSaveV19, validateSaveV20 } from '../src/core/save.js'

const acceptedBytes = gunzipSync(readFileSync(new URL('./fixtures/p13a/accepted-v19.json.gz', import.meta.url))).toString('utf8')
const accepted = () => validateSaveV19(JSON.parse(acceptedBytes))

describe('P13A governed V19 to V20 persistence', () => {
  it('loads the exact accepted product fixture and preserves its history, balances and employment', () => {
    expect(createHash('sha256').update(acceptedBytes).digest('hex')).toBe('dc76a253e706090bb177d1d54c0d1c7742cf1d3c37ff4d13cb5ec559a1e1ad81')
    const old = accepted()
    const before = JSON.stringify(old)
    const save = convertV19ToV20(old)
    expect(save.saveVersion).toBe(20)
    expect(JSON.stringify(old)).toBe(before)
    expect(save.state.technology).toEqual({ version: 1, recordingStartedWeek: old.state.market.tick, projects: [], access: [], adoptions: [], productions: [] })
    expect(save.state.contracts).toEqual(old.state.contracts)
    expect(save.state.ledger).toEqual(old.state.ledger)
    expect(save.state.studio).toEqual(old.state.studio)
    expect(save.state.rngState).toBe(old.state.rngState)
    expect(save.state.era).toEqual({ ...old.state.era, soundRequired: false })
    expect(save.state.talent.map(p => p.id)).toEqual(old.state.talent.map(p => p.id))
    expect(save.state.talent.some(p => p.role === 'scientist')).toBe(false)
    for (const person of save.state.talent) {
      expect(person.workHistory.research).toBe(0)
      expect(Object.values(person.genreExperience.research)).toEqual(Array(6).fill({ actual: 0, perceived: 0 }))
      const original = old.state.talent.find(p => p.id === person.id)!
      const projected = structuredClone(person)
      for (const key of ['skills', 'ceilings', 'devRate', 'workHistory', 'genreExperience'] as const) Reflect.deleteProperty(projected[key], 'research')
      expect(projected).toEqual(original)
    }
    const projectedHollywood = structuredClone(save.state.hollywood)!
    for (const business of projectedHollywood.businesses) for (const period of business.account.periods) {
      expect(period.movements.technologyAdoption).toBe(0)
      Reflect.deleteProperty(period.movements, 'technologyAdoption')
    }
    expect(projectedHollywood).toEqual(old.state.hollywood)
  })

  it('round-trips a migrated V20 world exactly and creates independent state objects', () => {
    const original = accepted()
    const a = migrateToV20(original)
    const b = migrateToV20(original)
    const json = exportSave(a)
    expect(exportSave(migrateToV20(importSave(json)))).toBe(json)
    expect(exportSave(b)).toBe(json)
    expect(a.state).not.toBe(b.state)
    expect(a.state.technology).not.toBe(b.state.technology)
    expect(a.state.talent[0]!.skills.research).not.toBe(b.state.talent[0]!.skills.research)
    const detached = makeSave(a.state)
    expect(detached.state).not.toBe(a.state)
    expect(detached.state.technology.projects).not.toBe(a.state.technology.projects)
  })

  it('keeps the accepted V19 boundary frozen and refuses disguised P13 history', () => {
    const forgedProfile = accepted()
    Object.assign(forgedProfile.state.talent[0]!.skills, { research: {} })
    expect(() => convertV19ToV20(forgedProfile)).toThrow()
    const forgedMoney = accepted()
    Object.assign(forgedMoney.state.hollywood!.businesses[0]!.account.periods[0]!.movements, { technologyAdoption: 0 })
    expect(() => convertV19ToV20(forgedMoney)).toThrow(/exact keys/)
    const forgedRoot = { ...accepted(), state: { ...accepted().state, technology: { projects: [] } } }
    expect(() => validateSaveV19(forgedRoot)).toThrow()
  })

  it('rejects missing research leaves, invalid rival adoption charges and downgrade attempts', () => {
    const save = migrateToV20(accepted())
    const missing = structuredClone(save)
    Reflect.deleteProperty(missing.state.talent[0]!.skills, 'research')
    expect(() => validateSaveV20(missing)).toThrow()
    const money = structuredClone(save)
    const account = money.state.hollywood!.businesses[0]!.account
    account.periods[0]!.movements.technologyAdoption = -1
    account.periods[0]!.closing -= 1
    account.cash -= 1
    expect(() => validateSaveV20(money)).toThrow(/technology|adoption/i)
    expect(() => migrateToV19(save)).toThrow(/cannot downgrade/)
    const scientist = generateScientist(save.seed)
    const researchPerson = { ...save.state, hollywood: null, talent: [...save.state.talent, scientist] }
    expect(() => makeSaveV18(researchPerson)).toThrow(/Scientist/)
  })

  it('validates the source before JSON detachment can erase an invalid leaf', () => {
    const save = migrateToV20(accepted())
    Object.assign(save.state.technology, { hiddenAuthority: undefined })
    expect(() => makeSave(save.state)).toThrow()
  })
})
