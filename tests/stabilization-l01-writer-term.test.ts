// Stabilization 2026-10-22, audit finding L-01 (PROD-01 ≡ PEOPLE-02).
//
// A paid draft must finish inside its writer's term. `completeDueScriptWork` runs at the entry
// of the due week's advance, before that advance expires contracts, so `dueWeek <=
// endWeekExclusive` is the exact bound (the rival commission guard in hollywoodTick.ts applies
// the same one). Before the fix, a multi-week ORIGINAL commissioned late in the term was admitted,
// the contract expired mid-draft, and the next tick entry, every later action and `makeSave`
// threw `active project … writer is not contracted`: a campaign with no remedy.
//
// Same construction as tests/1368-writing-completion-boundary.test.ts (a real creator, a real
// 52-week signing, natural ticks); that file keeps the one-week pool case where equality stays legal.
import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { activeContract } from '../src/core/employment.js'
import { makeSave } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { admitted, SEED, snap } from './helpers/1368-rival-writing.js'
import { originalCommission } from './helpers/p14c2rm-writer-fixtures.js'

const END = 52

describe('L-01: an original draft cannot be commissioned past its writer\'s paid term', () => {
  let at44: GameState, writerId: string
  beforeAll(() => {
    const genesis = admitted(p13aGeneratedStudio(SEED))
    const created = applyActions(genesis, [{ kind: 'createTalent', talent: {
      name: 'Term Boundary Original Writer', role: 'writer', age: 40,
      actual: { warmth: 0, gravity: 0, physicality: 0.2 }, potentialTier: 'Steady', workEthic: 55,
    } }])
    writerId = created.talent.at(-1)!.id
    const signed = applyActions(created, [{ kind: 'signContract', talentId: writerId, termWeeks: END },
      { kind: 'activateScriptDevelopment' }])
    expect(activeContract(signed, writerId)).toMatchObject({ startWeek: 0, endWeekExclusive: END })
    at44 = admitted(advanceTo(signed, 44))
  }, 300_000)

  it('premise: an original draft starts from more than one week, so a late commission outlasts the term', () => {
    expect(TUNING.SCRIPT_DRAFT_WEEKS_BASE).toBeGreaterThanOrEqual(2)
    expect(TUNING.SCRIPT_DRAFT_WEEKS_MAX).toBeLessThanOrEqual(8)
  })

  it('refuses the commission at E−1 by name, and the world stays admitted and saveable', () => {
    const input = admitted(advanceTo(at44, END - 1))
    expect(activeContract(input, writerId)).toMatchObject({ endWeekExclusive: END })
    expect(input.careerLifecycle.records.filter((row) => row.personId === writerId)).toEqual([])
    const before = snap(input)
    expect(() => applyActions(input, [originalCommission(writerId)]))
      .toThrow(/commissionOriginalScreenplay rejected — writer "[^"]+" is contracted through week 52 but this draft would be due at week 5[3-9]/)
    expect(snap(input)).toBe(before)
    expect(input.scriptDevelopment.projects.filter((row) => row.writerIds.includes(writerId))).toEqual([])
    // The refusal leaves a lawful world: the next advance and a save both succeed.
    const next = admitted(tick(input))
    expect(next.market.tick).toBe(END)
    expect(activeContract(next, writerId)).toBeUndefined()
    expect(() => makeSave(next)).not.toThrow()
  })

  it('admits the same commission while the term still covers the draft, and the draft completes before expiry', () => {
    const before = snap(at44)
    const commissioned = admitted(applyActions(at44, [originalCommission(writerId)]))
    expect(snap(at44)).toBe(before)
    const project = commissioned.scriptDevelopment.projects.at(-1)!
    expect(project).toMatchObject({ commissionedWeek: 44, status: 'drafting' })
    expect(project.writerIds).toContain(writerId)
    expect(project.dueWeek).not.toBeNull()
    expect(project.dueWeek!).toBeLessThanOrEqual(END)
    // Natural ticks through expiry: the draft reaches review, the contract expires, every state admits.
    let state = commissioned
    while (state.market.tick < END) state = admitted(tick(state))
    expect(state.scriptDevelopment.projects.find((row) => row.id === project.id)).toMatchObject({ status: 'review', dueWeek: null })
    expect(activeContract(state, writerId)).toBeUndefined()
    expect(() => makeSave(state)).not.toThrow()
  }, 30_000)
})
