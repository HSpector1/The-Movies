// P14C.2b T1 — INDEPENDENT RED closeout, family W10: extension cases are EXCLUDED from
// every existing bridge consumer (780 §5.3, 806 §6) — no new read model is added, so a
// person whose latest case is a `retirementExtension` contributes nothing to any
// existing case listing, attention row, world route or promise row, and the one
// renewal-refusal sentence that DOES still mention them names "one final extension",
// never presenting a one-issuer offer as a contest.
//
// Closes 810 §5's disclosed W10 gap: exercising this needs `bridge/*.ts`, whose OWN
// `.ts`-extension imports require `allowImportingTsExtensions` — a flag only
// `tsconfig.bridge.json` sets, gated to `tests/bridge*.test.ts` filenames (confirmed:
// `tests/p14c2b-extension.test.ts` cannot import these without reintroducing ~50
// unrelated TS5097 errors under the plain `tsconfig.json`). This file's name puts it
// under the bridge tsconfig instead.
//
// Built on the GENUINE natural route throughout (795 §8 F5 / this task's own repair):
// migrate a corpus world live, tick to the person's own E-12 so discovery opens the
// real case, and (where settlement itself matters) submit a real lawful proposal and
// tick to the decision week. Nothing here is hand-built.
import { describe, expect, it } from 'vitest'
import { marketPage } from '../bridge/market.ts'
import { marketAttentionRows, marketCaseProjection } from '../bridge/people.ts'
import { personWorldRoute } from '../bridge/world.ts'
import { promiseRowsFor } from '../bridge/promises.ts'
import { renewalRefusal } from '../bridge/contract.ts'
import { caseForTalent } from '../src/core/talentMarket.js'
import { advanceTo, c2bLiveFixture } from './helpers/p14c2b-fixtures.js'

const AXIS_A = {
  fixture: 'genuine-v35-c2b-contract-gap-freeagent-expiry' as const,
  personId: 'authored-0000',
  employerStudioId: 'studio-d7df6c8e-player',
  eMinus12: 92,
}

describe('P14C.2b W10: extension cases are excluded from every existing bridge consumer (806 §6)', () => {
  it('bridge/market.ts: marketPage never lists a retirementExtension case in any bucket', () => {
    const atWindow = advanceTo(c2bLiveFixture(AXIS_A.fixture), AXIS_A.eMinus12)
    const page = marketPage(atWindow, { view: 'market', targetId: null })
    const allRows = [...page.cases.renewalWindow, ...page.cases.settling, ...page.cases.closed.rows]
    expect(allRows.some((r) => r.talentId === AXIS_A.personId), '806 §6: a retirementExtension case must never appear in any market page bucket').toBe(false)
  })

  it('bridge/people.ts: marketAttentionRows raises nothing for a retirementExtension case\'s view', () => {
    const atWindow = advanceTo(c2bLiveFixture(AXIS_A.fixture), AXIS_A.eMinus12)
    const view = caseForTalent(atWindow, AXIS_A.personId, AXIS_A.eMinus12)
    expect(view, 'caseForTalent must find the genuinely-discovered case (it is variant-agnostic)').not.toBeNull()
    const rows = marketAttentionRows(atWindow, view!, AXIS_A.employerStudioId, AXIS_A.eMinus12)
    expect(rows, '806 §6: an extension case must raise no attention row at all').toEqual([])
  })

  it('bridge/people.ts: marketCaseProjection answers null for a person whose latest case is a retirementExtension', () => {
    const atWindow = advanceTo(c2bLiveFixture(AXIS_A.fixture), AXIS_A.eMinus12)
    expect(marketCaseProjection(atWindow, AXIS_A.personId, AXIS_A.employerStudioId, AXIS_A.eMinus12)).toBeNull()
  })

  it('bridge/world.ts: personWorldRoute publishes no market caseRef for a retirementExtension case', () => {
    const atWindow = advanceTo(c2bLiveFixture(AXIS_A.fixture), AXIS_A.eMinus12)
    const route = personWorldRoute(atWindow, AXIS_A.personId, false)
    expect(route.statusLine).toBeNull()
    expect(route.caseRef).toBeNull()
  })

  it('bridge/promises.ts: promiseRowsFor publishes nothing for a retirementExtension case', () => {
    const atWindow = advanceTo(c2bLiveFixture(AXIS_A.fixture), AXIS_A.eMinus12)
    expect(promiseRowsFor(atWindow, AXIS_A.personId, AXIS_A.employerStudioId, AXIS_A.eMinus12)).toEqual([])
  })

  it('bridge/contract.ts: renewalRefusal names the "one final extension", never presenting it as an ordinary contest', () => {
    const atWindow = advanceTo(c2bLiveFixture(AXIS_A.fixture), AXIS_A.eMinus12)
    const talent = atWindow.talent.find((t) => t.id === AXIS_A.personId)
    expect(talent, 'axis a\'s subject must exist').toBeDefined()
    const contract = atWindow.contracts.find((c) => c.talentId === AXIS_A.personId)
    expect(contract, 'the still-active original contract must exist at E-12').toBeDefined()
    const refusal = renewalRefusal(atWindow, talent!, contract)
    expect(refusal?.code).toBe('underMarketCase')
    expect(refusal?.reason).toMatch(/one final extension/i)
  })
})
