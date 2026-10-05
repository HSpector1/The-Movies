// Strict three-way acceptance candidate, not a search or a promised healthy campaign.
import { beforeAll, expect, it } from 'vitest'
import { publicResearch277, researchCommitments, admitPublicResearchFixture } from './helpers/1368-public-research-boundary.js'
import { tick } from '../src/core/tick.js'
import { stableStringify } from '../src/core/save.js'

beforeAll(() => { publicResearch277() }, 120_000)

it.each(['replacement', 'project', 'seat'] as const)('B public migration277 blocks new %s against a real idle positive', kind => {
  const { input, control } = publicResearch277(), bytes = stableStringify
  const b = input.hollywood!.businesses.find(b => {
    if (b.costCutting.since !== null || b.productions.length || b.runs.length
      || input.talentMarket.proposals.some(p => p.issuerStudioId === b.studioId)) return false
    const before = researchCommitments(input, b.studioId), after = researchCommitments(control, b.studioId)
    if (kind === 'replacement') return after.employment.slice(before.employment.length).some(e => e.reason === 'replacement')
    if (kind === 'project') return after.projects.length > before.projects.length
    return after.seats.length > before.seats.length
  })
  expect(b, `UNMET FIXED277 PREMISE: idle null-since ${kind} positive under actual unchanged quotes; no fallback`).toBeDefined()
  const id = b!.studioId, old = researchCommitments(input, id), candidate = structuredClone(input)
  candidate.hollywood!.businesses.find(row => row.studioId === id)!.costCutting.since = 277
  admitPublicResearchFixture(candidate)
  const before = bytes(candidate), next = tick(candidate)
  admitPublicResearchFixture(next); expect(bytes(candidate)).toBe(before)
  const after = researchCommitments(next, id)
  expect(after.employment.map(e => e.contractId)).toEqual(old.employment.map(e => e.contractId))
  expect(after.plans.map(p => p.id)).toEqual(old.plans.map(p => p.id))
  expect(after.adoptions.map(a => [a.id, a.committedWeek])).toEqual(old.adoptions.map(a => [a.id, a.committedWeek]))
  expect(after.projects.map(p => [p.id, p.startedWeek])).toEqual(old.projects.map(p => [p.id, p.startedWeek]))
  expect(after.seats.map(s => [s.projectId, s.talentId, s.assignedWeek])).toEqual(old.seats.map(s => [s.projectId, s.talentId, s.assignedWeek]))
}, 120_000)
