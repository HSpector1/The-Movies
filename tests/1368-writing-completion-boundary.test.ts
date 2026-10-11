import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { activeContract } from '../src/core/employment.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { admitted, SEED, snap } from './helpers/1368-rival-writing.js'

// Explicitly authored public-operation boundary control, not the natural rival route.
// Same seed; real original capital, creator provenance, paid signing and 52 ordinary ticks.
// No imported fixture, fund(), clock/terms overwrite or employment/history edit.
describe('paid writing finishes at or before the exclusive employment end', () => {
  let at50: GameState, writerId: string, contractId: string
  beforeAll(() => {
    const genesis = admitted(p13aGeneratedStudio(SEED)), genesisBefore = snap(genesis)
    const created = applyActions(genesis, [{ kind: 'createTalent', talent: {
      name: 'Term Boundary Writer', role: 'writer', age: 40,
      actual: { warmth: 0, gravity: 0, physicality: 0.2 }, potentialTier: 'Steady', workEthic: 55,
    } }])
    expect(snap(genesis)).toBe(genesisBefore); admitted(created)
    writerId = created.talent.at(-1)!.id
    expect(created.freeAgents).toContain(writerId)
    expect(created.talent.at(-1)).toMatchObject({ name: 'Term Boundary Writer', role: 'writer', age: 40 })
    const beforeSign = snap(created)
    const signed = applyActions(created, [{ kind: 'signContract', talentId: writerId, termWeeks: 52 },
      { kind: 'activateScriptDevelopment' }])
    expect(snap(created)).toBe(beforeSign); admitted(signed)
    const terms = activeContract(signed, writerId)!
    expect(terms).toMatchObject({ startWeek: 0, endWeekExclusive: 52, termWeeks: 52 })
    expect(signed.studio.cash).toBe(created.studio.cash - terms.signingBonus)
    expect(signed.ledger.slice(created.ledger.length)).toEqual([
      { week: 0, kind: 'signingBonus', amount: -terms.signingBonus, talentId: writerId, note: 'contract signing bonus' },
    ])
    const interval = signed.hollywood!.employment.find(row => row.studioId === signed.hollywood!.playerStudioId
      && row.terms.talentId === writerId && row.endedWeek === null)!
    expect(interval.terms).toEqual(terms); contractId = interval.contractId
    at50 = admitted(advanceTo(signed, 50))
    expect(activeContract(at50, writerId)).toEqual(terms)
  }, 300_000)

  it.each([50, 51])('public pool commission at %i completes before expiry52 and preserves full admission', (commissionWeek) => {
    let input = structuredClone(at50)
    if (commissionWeek === 51) input = tick(input)
    admitted(input)
    expect(input.market.tick).toBe(commissionWeek)
    expect(activeContract(input, writerId)).toMatchObject({ startWeek: 0, endWeekExclusive: 52 })
    expect(input.careerLifecycle.records.filter(row => row.personId === writerId)).toEqual([])
    const concept = input.concepts[0]!, before = snap(input)
    const commissioned = applyActions(input, [{ kind: 'commissionScript', project: {
      conceptId: concept.id, writerId,
      shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
      promise: { genre: concept.genre, intendedSegments: ['adult', 'prestige'], ranges: {
        intimacy: [-0.4, 0.6], tonalWeight: [0, 0.8], kineticEnergy: [-0.7, 0.2],
      } },
    } }])
    expect(snap(input)).toBe(before); admitted(commissioned)
    const project = commissioned.scriptDevelopment.projects.at(-1)!
    expect(project).toMatchObject({ writerId, commissionedWeek: commissionWeek, dueWeek: commissionWeek + 1, status: 'drafting' })
    expect(project.dueWeek).toBe(commissionWeek === 50 ? 51 : 52) // E−1 and E; equality stays legal.
    expect(project.reservation).not.toBeNull()
    const commissionedBefore = snap(commissioned)
    const completed = tick(commissioned)
    expect(snap(commissioned)).toBe(commissionedBefore); admitted(completed)
    expect(completed.scriptDevelopment.projects.find(row => row.id === project.id)).toMatchObject({
      writerId, status: 'review', dueWeek: null, reservation: null,
    })
    const expired = completed.market.tick === 52 ? completed : tick(completed)
    expect(expired.market.tick).toBe(52); admitted(expired)
    expect(expired.hollywood!.employment.find(row => row.contractId === contractId)).toMatchObject({
      endedWeek: 52, terms: { talentId: writerId, startWeek: 0, endWeekExclusive: 52 },
    })
    expect(expired.hollywood!.receipts.filter(row => row.kind === 'employment' && row.contractId === contractId
      && row.reason === 'expiry' && row.week === 52)).toHaveLength(1)
    expect(expired.scriptDevelopment.projects.find(row => row.id === project.id)).toMatchObject({
      writerId, status: 'review', dueWeek: null, reservation: null,
    })
  }, 300_000)
})
