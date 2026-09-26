// P14C.2b family W10, maintained under875/917 after recorded916 RED. C.2-RM
// supersedes806's exclusions: the actual open extension is discoverable in
// Market, People and World, with one eligible issuer and an own decision alert.
// Extension promises remain absent, and the ordinary renewal refusal still
// names "one final extension", never an ordinary competing-studio contest.
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

describe('P14C.2b W10: extensions are discoverable through existing bridge consumers (875 §3–4)', () => {
  it('bridge/market.ts: marketPage lists the exact open extension once with its sole issuer and fixed term', () => {
    const atWindow = advanceTo(c2bLiveFixture(AXIS_A.fixture), AXIS_A.eMinus12)
    const page = marketPage(atWindow, { view: 'market', targetId: null })
    const allRows = [...page.cases.renewalWindow, ...page.cases.settling, ...page.cases.closed.rows]
    expect(allRows.filter((r) => r.talentId === AXIS_A.personId)).toEqual([expect.objectContaining({
      talentId: AXIS_A.personId, variant: 'retirementExtension', soleIssuerStudioId: AXIS_A.employerStudioId,
      retirementExtension: { issuerStudioId: AXIS_A.employerStudioId, viewerCanOffer: true,
        requiredTermWeeks: 58, startWeek: 98, endWeekExclusive: 156 },
    })])
  })

  it('bridge/people.ts: marketAttentionRows raises the exact sole issuer’s extension decision without a competing-proposal alert', () => {
    const atWindow = advanceTo(c2bLiveFixture(AXIS_A.fixture), AXIS_A.eMinus12)
    const view = caseForTalent(atWindow, AXIS_A.personId, AXIS_A.eMinus12)
    expect(view, 'caseForTalent must find the genuinely-discovered case (it is variant-agnostic)').not.toBeNull()
    const rows = marketAttentionRows(atWindow, view!, AXIS_A.employerStudioId, AXIS_A.eMinus12)
    expect(rows).toEqual([expect.objectContaining({ talentId: AXIS_A.personId, cause: 'retirementExtensionOpen' })])
    expect(rows.some(row => row.cause === 'newCompetingProposal')).toBe(false)
  })

  it('bridge/people.ts: marketCaseProjection exposes the exact person’s open extension and agrees with selected Market detail', () => {
    const atWindow = advanceTo(c2bLiveFixture(AXIS_A.fixture), AXIS_A.eMinus12)
    const detail = marketCaseProjection(atWindow, AXIS_A.personId, AXIS_A.employerStudioId, AXIS_A.eMinus12)
    expect(detail).toMatchObject({ variant: 'retirementExtension', soleIssuerStudioId: AXIS_A.employerStudioId,
      retirementExtension: { issuerStudioId: AXIS_A.employerStudioId, viewerCanOffer: true,
        requiredTermWeeks: 58, startWeek: 98, endWeekExclusive: 156 } })
    expect(marketPage(atWindow, { view: 'market', targetId: AXIS_A.personId }).selected?.marketCase).toEqual(detail)
  })

  it('bridge/world.ts: personWorldRoute links the exact open extension and names the final extension', () => {
    const atWindow = advanceTo(c2bLiveFixture(AXIS_A.fixture), AXIS_A.eMinus12)
    const route = personWorldRoute(atWindow, AXIS_A.personId, false)
    expect(route.statusLine).toMatch(/final extension/i)
    expect(route.caseRef).toEqual({ view: 'market', targetId: AXIS_A.personId })
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
