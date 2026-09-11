import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { busyTalentIds, freelancerMarketIds, hiringMarketIds, offerForTalent, weeklyPayroll } from '../src/core/employment.js'
import { withResearchFoundation } from '../src/core/researchPeople.js'
import { careerIdentity, roleOVR } from '../src/core/talentSummary.js'
import { generateScientist, generateWorld } from '../src/core/worldgen.js'
import { SKILL_ORDER } from '../src/core/tuning.js'

// Independently emitted from an archive of the accepted product 592e926bfbf4574d
// (whole src/core dependency tree), before this implementation. Only the P13
// additive research profile is removed from the candidate comparison. The D4
// soundRequired correction is excluded explicitly and proved separately below.
const ACCEPTED = [
  ['p13a-person-regression-1', '16857a2609206c58bfb34ba3be7b67d95276e5c96048c5674cb5987aa8a94a17'],
  ['p13a-person-regression-2', 'd71583f6fc04af2d251e2010ca6725e6bcc0104fb727d3735155aa5235df01b8'],
  ['m0a-0001', '7517c0d01eb928245e2101752932b99ccd3444f2ca6848a6badf579ef2fb51c4'],
] as const

function acceptedPerson(person: ReturnType<typeof generateScientist>) {
  const copy = structuredClone(person)
  for (const key of ['skills', 'ceilings', 'devRate', 'genreExperience', 'workHistory'] as const) {
    Reflect.deleteProperty(copy[key], 'research')
  }
  return copy
}

describe('P13A Scientist identity and employment foundation', () => {
  it.each(ACCEPTED)('preserves accepted people, concepts, market, era and RNG for %s', (seed, digest) => {
    const state = generateWorld(seed)
    const data = { talent: state.talent.map(acceptedPerson), concepts: state.concepts, market: state.market, era: { televisionCompetition: state.era.televisionCompetition, censorship: state.era.censorship, costScale: state.era.costScale }, rngState: state.rngState }
    expect(createHash('sha256').update(JSON.stringify(data)).digest('hex')).toBe(digest)
    expect(state.talent).toHaveLength(60)
    expect(state.era.soundRequired).toBe(false)
  })

  it('adds no historical experience, career credit, wage or identity to a legacy person', () => {
    const legacy = acceptedPerson(generateWorld('p13a-neutral-person').talent[0]!)
    const copy = structuredClone(legacy)
    const migrated = withResearchFoundation(legacy)
    expect(legacy).toEqual(copy)
    expect(acceptedPerson(migrated)).toEqual(legacy)
    expect(migrated.workHistory.research).toBe(0)
    expect(Object.values(migrated.genreExperience.research)).toEqual(Array(6).fill({ actual: 0, perceived: 0 }))
    expect(Object.values(migrated.skills.research)).toEqual(Array(6).fill({ actual: 1, perceived: 1 }))
    expect(withResearchFoundation(migrated)).toEqual(migrated)
  })

  it('generates a deterministic real Scientist with the full person profile and zero career claims', () => {
    const person = generateScientist('p13a-scientist', 'scientist-one')
    expect(generateScientist('p13a-scientist', 'scientist-one')).toEqual(person)
    expect(generateScientist('p13a-scientist', 'scientist-two').name).not.toBe(person.name)
    expect(person.name.trim()).not.toBe('')
    expect(person.role).toBe('scientist')
    expect(Object.keys(person.skills.research)).toEqual(SKILL_ORDER.research)
    expect(person.skill).toBe(roleOVR(person, 'research'))
    expect(careerIdentity(person).primary).toBe('research')
    expect(careerIdentity(person).identityDisciplines).toEqual([])
    expect(Object.values(person.workHistory)).toEqual([0, 0, 0, 0, 0])
  })

  it('reuses a six-field P10 contract at $2,000/week, including weeks without assignment', () => {
    const original = generateWorld('p13a-scientist-contract')
    const scientist = generateScientist(original.seed)
    const state = { ...original, talent: [...original.talent, scientist] }
    expect(hiringMarketIds(state)).toEqual([...hiringMarketIds(original), scientist.id])
    expect(freelancerMarketIds(state)).toEqual(freelancerMarketIds(original))
    for (const term of [52, 104, 208]) {
      expect(offerForTalent(state.seed, scientist, term, 0).annualSalary).toBe(104_000)
    }
    const employed = applyActions(state, [{ kind: 'signContract', talentId: scientist.id, termWeeks: 104 }])
    expect(Object.keys(employed.contracts[0]!).sort()).toEqual(['annualSalary', 'endWeekExclusive', 'signingBonus', 'startWeek', 'talentId', 'termWeeks'])
    expect(weeklyPayroll(employed)).toBe(2_000)
    expect(weeklyPayroll(employed, 103)).toBe(2_000)
    expect(weeklyPayroll(employed, 104)).toBe(0)
    expect(busyTalentIds(employed).has(scientist.id)).toBe(false)
  })
})
