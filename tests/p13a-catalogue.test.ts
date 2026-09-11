import {describe,it,expect} from 'vitest'
import {TECHNOLOGY_CATALOGUE,validateTechnologyCatalogue} from '../src/core/technologyCatalogue.js'

describe('P13A L0 synchronized-sound catalogue',()=>{
  it('has one stable reachable entry, actual physical prerequisites and ordered public dates',()=>{
    expect(()=>validateTechnologyCatalogue()).not.toThrow()
    expect(TECHNOLOGY_CATALOGUE.map(entry=>entry.id)).toEqual(['synchronized-sound'])
    expect(TECHNOLOGY_CATALOGUE[0]).toMatchObject({capability:'synchronized-dialogue',researchableWeek:260,commercialWeek:416})
  })
  it('refuses duplicate/cyclic/unreachable or undated authoring',()=>{
    const entry=TECHNOLOGY_CATALOGUE[0]!
    expect(()=>validateTechnologyCatalogue([entry,entry])).toThrow('duplicate')
    expect(()=>validateTechnologyCatalogue([{...entry,prerequisiteTechnologyIds:['synchronized-sound']}])).toThrow('cyclic')
    expect(()=>validateTechnologyCatalogue([{...entry,instrumentBlueprintId:'not-authored'}])).toThrow('unreachable')
    expect(()=>validateTechnologyCatalogue([{...entry,commercialWeek:259}])).toThrow('dated')
  })
})
