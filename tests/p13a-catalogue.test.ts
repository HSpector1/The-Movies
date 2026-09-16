import {describe,it,expect} from 'vitest'
import {TECHNOLOGY_CATALOGUE,validateTechnologyCatalogue} from '../src/core/technologyCatalogue.js'

describe('P13A L0 synchronized-sound catalogue',()=>{
  it('keeps the synchronized-sound entry stable, reachable and dated (the single-entry law was superseded by P13B-S2, plan §S2 test 1)',()=>{
    expect(()=>validateTechnologyCatalogue()).not.toThrow()
    expect(TECHNOLOGY_CATALOGUE.map(entry=>entry.id)).toEqual(['lighting-control-01','synchronized-sound'])
    expect(TECHNOLOGY_CATALOGUE.find(entry=>entry.id==='synchronized-sound')).toMatchObject({capability:'synchronized-dialogue',researchableWeek:260,commercialWeek:416})
  })
  it('refuses duplicate/cyclic/unreachable or undated authoring',()=>{
    const entry=TECHNOLOGY_CATALOGUE[0]!
    expect(()=>validateTechnologyCatalogue([entry,entry])).toThrow('duplicate')
    expect(()=>validateTechnologyCatalogue([{...entry,prerequisiteTechnologyIds:[entry.id]}])).toThrow('cyclic')
    expect(()=>validateTechnologyCatalogue([{...entry,instrumentBlueprintId:'not-authored'}])).toThrow('unreachable')
    expect(()=>validateTechnologyCatalogue([{...entry,commercialWeek:259}])).toThrow('dated')
  })
})
