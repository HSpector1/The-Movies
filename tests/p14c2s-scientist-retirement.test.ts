// Independent requirement tests for Owner 773 §10 / bounded record 840.
// Genuine corpus bytes are never edited. Explicit age-only synthetic variants
// isolate 62/72; employment, research, film work and extensions are real actions.
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { retirementRecordFor, retirementWindow } from '../src/core/careerLifecycle.js'
import { activeContract, busyTalentIds } from '../src/core/employment.js'
import { importSave, makeSave, migrateToLive, migrateToV35, migrateToV36 } from '../src/core/save.js'
import { openMarketCaseFor, submitProposal } from '../src/core/talentMarket.js'
import { eligibleSeatIds, researchCandidates } from '../src/core/technology.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, exhaustedScientistPool, labId, owner, project, saveRoundTrip, SCI, SCI_END,
  scientistAt, scientistFilm, scientistSupply, scientistWorld } from './helpers/p14c2s-fixtures.js'

const record = (state: GameState) => retirementRecordFor(state, SCI)
const bytes = (state: GameState) => JSON.stringify(makeSave(state))

describe('C.2 Scientist retirement: literal eligibility, hard announcement and obligations', () => {
  it('S0 the configured Scientist window is eligible62/hard72', () => {
    expect(retirementWindow('scientist')).toEqual({ start: 62, hard: 72 })
  })

  it('S1 genuine V33 continuation: recent employment prevents age62 announcement566, idle age63 announces618', () => {
    const initial = scientistWorld()
    const historical = initial.hollywood!.employment.find(row => row.terms.talentId === SCI)!
    expect(historical).toMatchObject({ terms: { startWeek: 260, endWeekExclusive: 468 }, endedWeek: 468 })
    const at62 = scientistAt('genuine', 566)
    expect(at62.talent.find(t => t.id === SCI)!.age).toBe(62)
    expect(record(at62), '[260,468) still intersects the 104-week horizon [462,566]').toBeUndefined()
    const before = scientistAt('genuine', 617)
    expect(record(before)).toBeUndefined()
    const announced = tick(before)
    expect(record(announced)).toMatchObject({ profession: 'scientist', intentRulesVersion: 1,
      cause: 'idleInWindow', ageAtAnnouncement: 63, announcedWeek: 618, effectiveWeek: 670, status: 'announced' })
    expect(announced.hollywood!.employment.find(row => row.contractId === historical.contractId)).toEqual(historical)
    expect(announced.talentProvenance.rows.find(row => row.personId === SCI)).toEqual(
      initial.talentProvenance.rows.find(row => row.personId === SCI))
    expect(saveRoundTrip(announced).careerLifecycle).toEqual(announced.careerLifecycle)
  }, 30_000)

  it('S2 SYNTHETIC age/provenance -1 year only: 61 is ineligible; literal62 announces with full notice', () => {
    const at61 = scientistAt('eligible62', 566)
    expect(at61.talent.find(t => t.id === SCI)!.age).toBe(61)
    expect(record(at61)).toBeUndefined()
    const before = scientistAt('eligible62', 617)
    expect(record(before)).toBeUndefined()
    const after = tick(before)
    expect(record(after)).toMatchObject({ cause: 'idleInWindow', ageAtAnnouncement: 62,
      announcedWeek: 618, effectiveWeek: 670, status: 'announced' })
    expect(bytes(saveRoundTrip(after))).toBe(bytes(after))
  }, 30_000)

  it('S3 SYNTHETIC +10 years, real rehire/research: busy72 forces announcement, not removal; current binding determines E', () => {
    const before = scientistAt('hardResearch', 565)
    expect(record(before)).toBeUndefined()
    expect(activeContract(before, SCI)).toMatchObject({ startWeek: 520, endWeekExclusive: SCI_END })
    expect(project(before)).toMatchObject({ status: 'active', startedWeek: 565, verifiedWork: 0 })
    expect(busyTalentIds(before).has(SCI)).toBe(true)
    const after = tick(before)
    expect(record(after)).toMatchObject({ cause: 'hardBoundary', ageAtAnnouncement: 72,
      announcedWeek: 566, effectiveWeek: SCI_END, status: 'announced', retiredWeek: null })
    expect(activeContract(after, SCI)).toEqual(activeContract(before, SCI))
    expect(project(after)).toMatchObject({ status: 'active', verifiedWork: 1, expenditure: 0 })
    expect(project(after).weeks).toHaveLength(1)
    expect(project(after).weeks[0]).toMatchObject({ week: 565, seatTalentIds: [SCI], spend: 0 })
    expect(project(tick(after))).toMatchObject({ status: 'active', verifiedWork: 2 })
    const frozen = bytes(after)
    expect(() => submitProposal(after, { talentId: SCI, issuerStudioId: owner(after), termWeeks: 208, premiumTier: 1.1 })).toThrow(/retirementAnnounced/)
    expect(bytes(after)).toBe(frozen)
    expect(bytes(saveRoundTrip(after))).toBe(frozen)
  }, 30_000)

  it('S4 SYNTHETIC +10 years, no rehire: hard announcement566 gives full52-week notice to618 and retains identity', () => {
    const before = scientistAt('hardIdle', 565)
    expect(activeContract(before, SCI)).toBeUndefined()
    expect(record(before)).toBeUndefined()
    const after = tick(before)
    expect(record(after)).toMatchObject({ cause: 'hardBoundary', ageAtAnnouncement: 72,
      announcedWeek: 566, effectiveWeek: 618, status: 'announced' })
    expect(() => applyActions(after, [{ kind: 'recruitScientist', laboratoryFacilityId: labId(after), scientistId: SCI }])).toThrow(/retirementAnnounced/)
    const retired = advanceTo(after, 618)
    expect(record(retired)).toMatchObject({ status: 'retired', retiredWeek: 618, finishingFromWeek: null })
    expect(retired.talent.filter(t => t.id === SCI)).toHaveLength(1)
    expect(retired.talent.find(t => t.id === SCI)).toMatchObject({ name: before.talent.find(t => t.id === SCI)!.name, role: 'scientist' })
    expect(project(retired).seats).toEqual(project(before).seats)
  }, 30_000)

  it('S5 real pause567/resume716 leaves unfinished work at728: expiry retires and pauses without deleting or charging retained work', () => {
    const before = scientistAt('hardResearch', 727)
    expect(project(before)).toMatchObject({ status: 'active', verifiedWork: 13, expenditure: 0 })
    expect(project(before).weeks.map(row => row.week)).toEqual([565, 566, ...Array.from({ length: 11 }, (_, i) => 716 + i)])
    expect(busyTalentIds(before).has(SCI)).toBe(true)
    const after = tick(before)
    expect(record(after)).toMatchObject({ effectiveWeek: SCI_END, status: 'retired', retiredWeek: SCI_END, finishingFromWeek: null })
    expect(activeContract(after, SCI)).toBeUndefined()
    expect(busyTalentIds(after).has(SCI)).toBe(false)
    expect(eligibleSeatIds(after, project(after))).toEqual([])
    expect(project(after)).toMatchObject({ status: 'paused', verifiedWork: 14, expenditure: 0, completedWeek: null })
    expect(project(after).seats).toEqual(project(before).seats)
    expect(project(after).weeks.slice(0, -1)).toEqual(project(before).weeks)
    const later = tick(saveRoundTrip(after))
    expect(project(later)).toEqual(project(after))
    expect(later.ledger.filter(row => row.week >= SCI_END &&
      (row.kind === 'researchSpend' || row.kind === 'researchPayroll'))).toEqual([])
    const replacement = applyActions(later, [
      { kind: 'recruitScientist', laboratoryFacilityId: labId(later), scientistId: 't-sci-01' },
      { kind: 'assignResearchScientist', laboratoryFacilityId: labId(later), scientistId: 't-sci-01' },
      { kind: 'resumeResearch', projectId: project(later).id },
    ])
    const continued = tick(replacement)
    expect(project(continued).verifiedWork).toBe(15)
    expect(project(continued).weeks.slice(0, -1)).toEqual(project(after).weeks)
    expect(project(continued).weeks.at(-1)!.seatTalentIds).toEqual(['t-sci-01'])
    expect(project(continued).seats.find(seat => seat.talentId === SCI)).toEqual(project(after).seats[0])
    expect(record(continued)).toEqual(record(after))
  }, 30_000)

  it('S6 incumbent-only final extension settles728 to780 once; retained research stays paused until explicit resume', () => {
    const atWindow = scientistAt('hardResearch', 716)
    expect(openMarketCaseFor(atWindow, SCI)).toMatchObject({ variant: 'retirementExtension', subjectStudioId: owner(atWindow) })
    const rival = atWindow.hollywood!.identities.find(identity => identity.studioId !== owner(atWindow) && identity.enteredWeek !== null)!
    const untouched = bytes(atWindow)
    expect(() => submitProposal(atWindow, { talentId: SCI, issuerStudioId: rival.studioId,
      termWeeks: 52, premiumTier: 1.1 })).toThrow(/retirementAnnounced/)
    expect(bytes(atWindow)).toBe(untouched)
    const offered = submitProposal(atWindow, { talentId: SCI, issuerStudioId: owner(atWindow), termWeeks: 52, premiumTier: 1.1 })
    const before = advanceTo(offered, 727)
    const beforeBytes = bytes(before)
    const extended = tick(before)
    expect(record(extended)).toMatchObject({ announcedWeek: 566, effectiveWeek: 780, status: 'announced',
      extensionUsed: true, extendedFromWeek: SCI_END, retiredWeek: null })
    expect(activeContract(extended, SCI)).toMatchObject({ startWeek: SCI_END, endWeekExclusive: 780 })
    expect(project(extended).weeks.slice(0, -1)).toEqual(project(before).weeks)
    expect(project(extended)).toMatchObject({ status: 'paused', verifiedWork: 14, expenditure: 0, completedWeek: null })
    // 840 / 846: the pre-market next-week staffing check pauses the project
    // before the extension binds. A new employment interval does not auto-resume.
    expect(bytes(tick(saveRoundTrip(before)))).toBe(bytes(extended))
    expect(bytes(before)).toBe(beforeBytes)
    const waiting = tick(saveRoundTrip(extended))
    expect(waiting.market.tick).toBe(729)
    expect(project(waiting)).toEqual(project(extended))
    expect(waiting.ledger.filter(row => row.week === 728 && row.kind === 'researchSpend')).toEqual([])
    // Paused R&D is not free employment: the accepted contract still pays payroll.
    expect(waiting.ledger.some(row => row.week === 728 && row.kind === 'researchPayroll' && row.amount < 0)).toBe(true)
    const resumed = applyActions(waiting, [{ kind: 'resumeResearch', projectId: project(waiting).id }])
    const worked = tick(resumed)
    expect(worked.market.tick).toBe(730)
    expect(project(worked)).toMatchObject({ status: 'active', verifiedWork: 15, expenditure: 0 })
    expect(project(worked).weeks.slice(0, -1)).toEqual(project(extended).weeks)
    expect(project(worked).weeks.at(-1)).toMatchObject({ week: 729, seatTalentIds: [SCI], spend: 0 })
    const again = advanceTo(extended, 768)
    expect(openMarketCaseFor(again, SCI)).toBeUndefined()
    expect(() => submitProposal(again, { talentId: SCI, issuerStudioId: owner(again), termWeeks: 52, premiumTier: 1.1 })).toThrow(/retirementAnnounced/)
    const finished = advanceTo(again, 780)
    expect(record(finished)).toMatchObject({ effectiveWeek: 780, status: 'retired', retiredWeek: 780, extensionUsed: true })
    expect(finished.talentMarket.cases.filter(kase => kase.talentId === SCI && kase.variant === 'retirementExtension')).toHaveLength(1)
  }, 30_000)

  it('S7 real Scientist craft seat admitted at E-9 remains finishing across held take; actual cancel frees obligations then retirement', () => {
    const f = scientistFilm()
    expect(f.ready.market.tick).toBe(719)
    expect(project(f.held).status).toBe('paused')
    expect(record(f.held)).toMatchObject({ status: 'finishing_commitments', effectiveWeek: SCI_END,
      finishingFromWeek: SCI_END, retiredWeek: null })
    expect(activeContract(f.held, SCI)).toBeUndefined()
    expect(busyTalentIds(f.held).has(SCI)).toBe(true)
    expect(f.held.studio.activeProductions.find(p => p.id === f.productionId)!.craftIds).toContain(SCI)
    expect(bytes(tick(saveRoundTrip(f.held)))).toBe(bytes(tick(f.held)))
    const cancelled = applyActions(f.held, [{ kind: 'cancel', productionId: f.productionId }])
    const unchanged = bytes(cancelled)
    expect(() => applyActions(cancelled, [f.greenlight])).toThrow(/finishingCommitments/)
    expect(bytes(cancelled)).toBe(unchanged)
    const retired = tick(saveRoundTrip(cancelled))
    expect(record(retired)).toMatchObject({ status: 'retired', retiredWeek: 729, finishingFromWeek: SCI_END })
    expect(retired.talent.find(t => t.id === SCI)!.role).toBe('scientist')
    expect(project(retired)).toEqual(project(f.held))
  }, 30_000)

  it('S8 real save/import/replay is identical across announcement and expiry, without mutating the source', () => {
    for (const [from, to] of [[565, 566], [566, 567], [727, 728]] as const) {
      const state = scientistAt('hardResearch', from)
      const before = bytes(state)
      const continuous = advanceTo(state, to)
      const replay = advanceTo(saveRoundTrip(state), to)
      expect(bytes(replay)).toBe(bytes(continuous))
      expect(bytes(state)).toBe(before)
      expect(replay.talentProvenance).toEqual(continuous.talentProvenance)
      expect(replay.hollywood!.employment).toEqual(continuous.hollywood!.employment)
      expect(project(replay)).toEqual(project(continuous))
    }
  }, 30_000)
})

describe('Scientist supply is measured; no replacement policy is invented', () => {
  it('S9 retired identity is retained/refused; default recruit skips it to next legal fixed-pool identity', () => {
    const initial = scientistWorld()
    const before = scientistAt('hardIdle', 618)
    expect(record(before)?.status).toBe('retired')
    const frozen = bytes(before)
    expect(() => applyActions(before, [{ kind: 'recruitScientist', laboratoryFacilityId: labId(before), scientistId: SCI }])).toThrow(/retiredFromProfession/)
    expect(bytes(before)).toBe(frozen)
    const after = applyActions(before, [{ kind: 'recruitScientist', laboratoryFacilityId: labId(before) }])
    expect(activeContract(after, SCI)).toBeUndefined()
    expect(activeContract(after, 't-sci-01')).toMatchObject({ startWeek: 618, endWeekExclusive: 826 })
    expect(record(after)).toEqual(record(before))
    expect(after.talent.filter(person => person.id === SCI)).toHaveLength(1)
    expect(after.talent.filter(person => person.id === 't-sci-01')).toHaveLength(1)
    const measured = [initial, scientistAt('hardIdle', 566), before, after].map(scientistSupply)
    expect(measured.every(row => row.rawIds.length === 8)).toBe(true)
    expect(measured[0]!.materializedIds).toEqual([SCI])
    expect(measured[0]!.latentIds).toHaveLength(7)
    expect(measured[2]!.recruitableIds).not.toContain(SCI)
    expect(measured[3]!.playerEmployedIds).toEqual(['t-sci-01'])
    expect(measured[3]!.latentIds).toHaveLength(6)
    console.log('C2s bounded Scientist supply (latent ids have no historical age)', JSON.stringify(measured))
    const initialIds = new Set(initial.talent.map(person => person.id))
    const newScientists = after.talent.filter(person => person.role === 'scientist' && !initialIds.has(person.id))
    const cohortIds = new Set(after.careerLifecycle.cohorts.flatMap(cohort => [...cohort.personIds]))
    expect(newScientists.filter(person => cohortIds.has(person.id))).toEqual([])
    console.log('C2s new Scientist identities, fixed-pool versus pre-existing rival deficit path', JSON.stringify(
      newScientists.map(person => ({ personId: person.id, fixedPlayerPool: researchCandidates(after).some(candidate => candidate.id === person.id),
        provenance: after.talentProvenance.rows.find(row => row.personId === person.id),
        employmentStudios: [...new Set(after.hollywood!.employment.filter(row => row.terms.talentId === person.id).map(row => row.studioId))] }))))
  }, 30_000)

  it('S9b SYNTHETIC materialized age71 pool, real8 contracts: all retired at728 means zero supply, not eight employed or a ninth person', () => {
    const state = exhaustedScientistPool()
    const supply = scientistSupply(state)
    expect(supply.rawIds).toEqual(Array.from({ length: 8 }, (_, index) => `t-sci-${String(index).padStart(2, '0')}`))
    expect(supply.materializedIds).toEqual(supply.rawIds)
    expect(supply.latentIds).toEqual([])
    expect(supply.statuses.every(row => row.status === 'retired')).toBe(true)
    expect(supply.playerEmployedIds).toEqual([])
    expect(supply.recruitableIds).toEqual([])
    expect(supply.lifecycleTermHireableIds).toEqual([])
    const before = bytes(state)
    let refusal = ''
    try { applyActions(state, [{ kind: 'recruitScientist', laboratoryFacilityId: labId(state) }]) }
    catch (error) { refusal = (error as Error).message }
    expect(refusal).toMatch(/no .*Scientist|no .*candidate|none .*available|no .*available|cannot.*recruit/i)
    expect(refusal).not.toMatch(/already employs.*eight/i)
    expect(bytes(state)).toBe(before)
    expect(state.talent.some(person => person.id === 't-sci-08')).toBe(false)
    expect(bytes(saveRoundTrip(state))).toBe(before)
    console.log('C2s bounded exhausted materialized pool; no replacement decision', JSON.stringify(supply))
  }, 30_000)
})

describe('Scientist retirement persistence has an explicit semantic version boundary', () => {
  it('S10 no Scientist record: live37 writes and V36 downgrade preserves exact state bytes without time, RNG or history changes', () => {
    const state = scientistWorld()
    const before = bytes(state)
    const live = makeSave(state)
    expect(live.saveVersion).toBe(37)
    const old = migrateToV36(live)
    expect(old.saveVersion).toBe(36)
    expect(JSON.stringify(old.state)).toBe(JSON.stringify(live.state))
    const lifted = migrateToLive(old)
    expect(lifted.saveVersion).toBe(37)
    expect(JSON.stringify(lifted.state)).toBe(JSON.stringify(live.state))
    expect(bytes(state)).toBe(before)
  })

  it('S10 actual Scientist record: live37 accepts, V36 and prior downgrade refuse without stripping obligations/history', () => {
    const state = scientistAt('hardResearch', 566)
    expect(record(state)?.profession).toBe('scientist')
    const live = makeSave(state)
    expect(live.saveVersion).toBe(37)
    const before = JSON.stringify(live)
    expect(importSave(before)).toEqual(live)
    expect(() => migrateToV36(live)).toThrow(/Scientist|scientist|downgrade/)
    expect(() => migrateToV35(live)).toThrow(/Scientist|scientist|downgrade/)
    expect(JSON.stringify(live)).toBe(before)
    expect(bytes(state)).toBe(before)
  })

  it('S10 frozen public34/35/36 readers still refuse the Scientist law, independently of the live tuning table', () => {
    const state = scientistAt('hardIdle', 566)
    expect(record(state)?.profession).toBe('scientist')
    const before = bytes(state)
    for (const version of [34, 35, 36]) {
      // Reader-only schema mutations, NOT historical fixtures or governed
      // downgrades. No such object is played/exported. Each negative control
      // first validates the WHOLE old-shaped envelope without the Scientist row.
      const envelope = JSON.parse(before)
      envelope.saveVersion = version
      if (version < 36) {
        for (const row of envelope.state.careerLifecycle.records) {
          delete row.extensionUsed
          delete row.extendedFromWeek
        }
        for (const kase of envelope.state.talentMarket.cases) delete kase.variant
      }
      if (version === 34) delete envelope.state.careerLifecycle.cohorts
      const control = structuredClone(envelope)
      control.state.careerLifecycle.records = control.state.careerLifecycle.records.filter(
        (row: { personId: string }) => row.personId !== SCI)
      expect(() => importSave(JSON.stringify(control)), `V${version} whole-envelope shape control`).not.toThrow()
      expect(() => importSave(JSON.stringify(envelope)), `V${version} is frozen film-only law`).toThrow(/Scientist record/)
    }
    expect(bytes(state)).toBe(before)
  })

  it('S10 amended live validator still refuses age, provenance, notice, cap, extension and exact-key corruption independently', () => {
    const state = scientistAt('hardResearch', 566)
    expect(record(state)?.profession).toBe('scientist')
    const live = makeSave(state)
    expect(live.saveVersion).toBe(37)
    const before = JSON.stringify(live)
    type MutableEnvelope = { state: { talentProvenance: { rows: Record<string, unknown>[] },
      careerLifecycle: { records: Record<string, unknown>[] } } }
    const cases: [string, (row: Record<string, unknown>, envelope: MutableEnvelope) => void, RegExp][] = [
      ['recorded age', row => { row.ageAtAnnouncement = 71 }, /age|provenance/],
      ['provenance', (_row, envelope) => {
        const provenance = envelope.state.talentProvenance.rows.find(row => row.personId === SCI)!
        provenance.ageAtEntry = Number(provenance.ageAtEntry) + 1
      }, /age|provenance/],
      ['short notice', row => { row.effectiveWeek = 617 }, /52|notice/],
      ['binding cap', row => { row.effectiveWeek = 727 }, /contract|interval|binding|past|cap/],
      ['unearned extension', row => { row.extensionUsed = true; row.extendedFromWeek = 676 }, /extension|settled/],
      ['unknown key', row => { row.scientistBypass = true }, /exactly|unknown/],
      ['missing key', row => { delete row.retiredWeek }, /exactly|missing/],
    ]
    for (const [name, change, reason] of cases) {
      const tampered: MutableEnvelope = JSON.parse(before)
      const row = tampered.state.careerLifecycle.records.find(candidate => candidate.personId === SCI)!
      change(row, tampered)
      expect(() => importSave(JSON.stringify(tampered)), name).toThrow(reason)
    }
    expect(JSON.stringify(live)).toBe(before)
    expect(bytes(state)).toBe(before)
  })
})
