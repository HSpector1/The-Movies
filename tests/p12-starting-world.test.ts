import { describe, expect, it } from 'vitest'
import { beginFounding, generateWorld, makeSave, exportSave, importSave, migrateToV20, makeSaveV18 } from '../src/core/index.js'
import { enterRival } from '../src/core/hollywood.js'
import { persistedConceptIds, persistedProductionIds } from '../src/core/productionIdentity.js'

describe('R05 canonical starting history and genuine migration', () => {
  it('opens four established distinct businesses with settled canonical history and protected applicants', () => {
    const base=generateWorld('r05-opening')
    const world=beginFounding(base)
    const h=world.hollywood!
    expect(h.businesses).toHaveLength(4)
    expect(h.films).toHaveLength(8)
    expect(new Set(h.businesses.map(b=>b.account.openingBalance)).size).toBe(4)
    expect(world.rngState).toBe(base.rngState)
    expect(base.hollywood).toBeNull()
    const employees=h.employment.map(e=>e.terms.talentId)
    expect(new Set(employees).size).toBe(24)
    expect(employees.some(id=>world.founding!.applicantIds.includes(id))).toBe(false)
    for(const f of h.films) {
      expect(f.provenance).toBe('authored-start/v1')
      expect(f.credits).toHaveLength(6)
      expect(f.credits.every(c=>world.talent.some(t=>t.id===c.talentId))).toBe(true)
      expect(persistedProductionIds(world).has(f.filmId)).toBe(true)
      expect(persistedConceptIds(world).has(f.conceptId)).toBe(true)
    }
    const bytes=exportSave(makeSave(world))
    expect(exportSave(migrateToV20(importSave(bytes)))).toBe(bytes)
    expect(exportSave(makeSave(beginFounding(world)))).toBe(bytes)
  })
  it('migrates at each old state own week with empty company histories and exact player state', () => {
    for(const week of [0,519,520,987,988,1560,1872,2548]) {
      const old=generateWorld('r05-legacy')
      old.market.tick=week
      const frozen=makeSaveV18(old)
      const original=exportSave(frozen)
      const migrated=migrateToV20(frozen)
      expect(migrated.state.hollywood!.films).toEqual([])
      expect(migrated.state.hollywood!.businesses.length).toBe(4+[520,988,1560,1872,2548].filter(w=>w<=week).length)
      expect(migrated.state.hollywood!.identities.filter(s=>s.role==='rival'&&s.enteredWeek!==null).every(s=>s.enteredWeek===week)).toBe(true)
      expect(migrated.state.studio).toEqual(old.studio)
      expect(migrated.state.rngState).toBe(old.rngState)
      expect(exportSave(frozen)).toBe(original)
      expect(exportSave(migrateToV20(migrated))).toBe(exportSave(migrated))
    }
  })
  it('refuses early entry and malformed or duplicate authored history without repairing it', () => {
    const state=beginFounding(generateWorld('r05-refusal'))
    expect(()=>enterRival(state,state.hollywood!.identities[5]!.studioId,'scheduled')).toThrow()
    expect(()=>makeSaveV18(state)).toThrow(/cannot downgrade/)
    const saved=makeSave(state)
    const duplicate=structuredClone(saved)
    duplicate.state.hollywood!.films.push(duplicate.state.hollywood!.films[0]!)
    expect(()=>exportSave(duplicate)).toThrow(/duplicate|collision/)
    const corrupt=structuredClone(saved)
    const film=corrupt.state.hollywood!.films[0]!
    if(film.provenance==='authored-start/v1') film.released.year=1920
    expect(()=>exportSave(corrupt)).toThrow()
    const unknown=JSON.parse(exportSave(saved));unknown.state.hollywood.futureWinner='scripted'
    expect(()=>importSave(JSON.stringify(unknown))).toThrow(/exact keys/)
  })
})
