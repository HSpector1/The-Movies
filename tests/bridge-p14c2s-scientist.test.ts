// C.2 Scientist amendment: private Laboratory candidates obey lifecycle withdrawal.
// Uses actual command/tick histories from the independent 840 fixture helper.
import { describe, expect, it } from 'vitest'
import { laboratoryActionSpecs } from '../bridge/laboratory.ts'
import { industryPage } from '../bridge/industry.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import type { IndustryQuery } from '../bridge/schema/industry-schema.ts'
import { retirementRecordFor } from '../src/core/careerLifecycle.js'
import { makeSave } from '../src/core/save.js'
import { SCI, scientistAt, scientistFilm } from './helpers/p14c2s-fixtures.js'

describe('C.2 Scientist private Laboratory disclosure', () => {
  it('S9c announced candidate remains inspectable with actual208-week cap refusal, then retired candidate drops without identity deletion', () => {
    const announced = scientistAt('hardIdle', 566)
    expect(retirementRecordFor(announced, SCI)?.status).toBe('announced')
    const before = JSON.stringify(makeSave(announced))
    const row = laboratoryActionSpecs(announced).find(spec =>
      spec.action.kind === 'recruitScientist' && spec.action.scientistId === SCI)
    expect(row).toBeDefined()
    expect(row).toMatchObject({ enabled: false })
    expect(row!.disabledReason).toMatch(/retirementAnnounced/)
    expect(row!.disabledReason).toContain('618')
    expect(JSON.stringify(makeSave(announced))).toBe(before)
    const retired = scientistAt('hardIdle', 618)
    expect(retirementRecordFor(retired, SCI)?.status).toBe('retired')
    expect(laboratoryActionSpecs(retired).filter(spec => spec.action.kind === 'recruitScientist'
      && spec.action.scientistId === SCI)).toEqual([])
    expect(retired.talent.filter(person => person.id === SCI)).toHaveLength(1)
    expect(laboratoryActionSpecs(retired).some(spec => spec.action.kind === 'recruitScientist'
      && spec.action.scientistId === 't-sci-01' && spec.enabled)).toBe(true)
    const query: IndustryQuery = { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'industryQuery',
      view: 'studios', targetId: null, page: 0, pageSize: 12, lane: 'audienceAwareness', period: 'all',
      requestId: 'c2s-public', sessionId: 'c2s-lab', expectedStateRevision: 0 }
    const publicPage = industryPage(retired, 'c2s-lab', 0, query)
    expect(publicPage.laboratory).toBeNull()
    expect(JSON.stringify(publicPage)).not.toContain('scientistLabel')
  }, 30_000)

  it('S9d real held film seat: finishing Scientist drops from recruit candidates without disturbing retained work', () => {
    const { held } = scientistFilm()
    expect(retirementRecordFor(held, SCI)?.status).toBe('finishing_commitments')
    const before = JSON.stringify(makeSave(held))
    expect(laboratoryActionSpecs(held).filter(spec => spec.action.kind === 'recruitScientist'
      && spec.action.scientistId === SCI)).toEqual([])
    expect(JSON.stringify(makeSave(held))).toBe(before)
  }, 30_000)
})
