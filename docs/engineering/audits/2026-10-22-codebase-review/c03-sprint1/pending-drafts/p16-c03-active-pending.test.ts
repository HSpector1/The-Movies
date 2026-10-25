// STATIC-UNRUN replacement law for p16-r2-estate.test.ts:43, not an additional acceptance gate.
// Authentic original48 R03 producer captures: their manifest explicitly discloses the earlier
// condition/finance fixture setup. This is NOT a naturally reached campaign closure.
// No capture mutation, manufactured closure/title/run/cash, STABLE reader or deadline override.
import { expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import * as estateApi from '../src/core/estate.js'
import { instrumentRefusal } from '../src/core/assetSale.js'
import { blockingEncumbrance } from '../src/core/licence.js'
import { currentHolder, subjectKey, type RightSubject } from '../src/core/rights.js'
import { convertV48ToV49, makeSave, stableStringify, validateSaveP15B } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'

const R03 = 'studio-aca408ec-r03'
const RUN = { right: 'R2' as const, filmId: `${R03}:film:13` }
const WORK = { right: 'R1' as const, propertyId: `story-property:${R03}:concept:14` }

function r03Prior() {
  const root = process.env.P16_ORIGINAL48_R03_CAPTURE_ROOT
  expect(root, 'existing original48 R03 capture binding').toBeTruthy()
  const manifest = readFileSync(`${root}/CAPTURE-MANIFEST.json`)
  expect(createHash('sha256').update(manifest).digest('hex'))
    .toBe('feb38e3397da84f3e3353207fdc58e339ed98708476968083089cba73e270a2e')
  expect(JSON.parse(manifest.toString()).scope)
    .toBe('existing disclosedcondition/finance R03transaction fixture; notnaturalcampaign')
  const bytes = readFileSync(`${root}/r03-week130.save48.json`)
  expect(createHash('sha256').update(bytes).digest('hex'))
    .toBe('f3a4ba519a87a62f5d170d11709070c2ec986541a1a2913a2f4477d03015d80e')
  const raw = JSON.parse(bytes.toString()), before = stableStringify(raw)
  const predecessor = validateSaveP15B(raw)
  expect(predecessor.saveVersion).toBe(48)
  expect(predecessor.state.market.tick).toBe(130)
  const prior = convertV48ToV49(predecessor).state
  makeSave(prior)
  expect(stableStringify(raw)).toBe(before)
  return prior
}

function offeredInstead(handoff: estateApi.EstateHandoff, state: GameState, subject: RightSubject) {
  // A deliberately invalid request to the actual handoff predicate, not a saved-state fixture.
  // All closure/claim/cash facts remain the authentic producer's arguments.
  return {
    ...handoff,
    lots: [{ lotId: `${handoff.closureId}:encumbered-probe`, subjects: [subject], minimumBid: 0,
      encumbrances: estateApi.lotEncumbranceRefs(state, [subject], handoff.closureWeek) }, ...handoff.lots],
    pending: handoff.pending.filter(p => subjectKey(p.subject) !== subjectKey(subject)),
  }
}

it('actual R03 closure refuses active-run and production lots; both authentic pending titles freeze and archive without sale', () => {
  const prior = r03Prior(), priorBytes = stableStringify(prior)
  expect(blockingEncumbrance(prior, RUN)).toBe('activeRun')
  expect(blockingEncumbrance(prior, WORK)).toBe('activeProduction')
  const player = prior.hollywood!.playerStudioId
  expect(instrumentRefusal(prior, R03, player, 'buy', { kind: 'title', subject: RUN }, 130))
    .toBe('activeRunEncumbrance')
  expect(instrumentRefusal(prior, R03, player, 'buy', { kind: 'title', subject: WORK }, 130))
    .toBe('activeProductionEncumbrance')

  // Observe the real closure call before its estate is published. The spy is pass-through:
  // no removed estate, invented closure, altered handoff or replacement return value.
  const actualOpen = estateApi.openEstate
  let captured: { state: GameState; handoff: estateApi.EstateHandoff; week: number } | undefined
  const spy = vi.spyOn(estateApi, 'openEstate').mockImplementation((state, handoff, week, readers) => {
    if (handoff.studioId === R03) captured = { state, handoff, week }
    return actualOpen(state, handoff, week, readers)
  })
  let opened: GameState
  try { opened = tick(prior) } finally { spy.mockRestore() }
  expect(stableStringify(prior)).toBe(priorBytes)
  expect(captured, 'ordinary current49 closure must publish through openEstate').toBeDefined()
  const { state: phase, handoff, week } = captured!
  expect(week).toBe(131)
  expect(opened.market.tick).toBe(131)
  const closure = opened.studioClosure.closures.find(c => c.studioId === R03)!
  expect(closure).toMatchObject({ closureWeek: 131, estate: { opensWeek: 131, closesWeek: 144 } })
  expect(closure.dispositions).toEqual(expect.arrayContaining([
    expect.objectContaining({ subjectKind: 'production', subjectId: `${R03}:film:14`, status: 'applied' }),
    expect.objectContaining({ subjectKind: 'theatricalRun', subjectId: RUN.filmId, status: 'applied' }),
  ]))
  const phaseBytes = stableStringify(phase)
  const runLot = offeredInstead(handoff, phase, RUN)
  const prodLot = offeredInstead(handoff, phase, WORK)
  expect(estateApi.estateHandoffRefusal(phase, runLot, week)).toBe(`lotEncumbered:activeRun:${subjectKey(RUN)}`)
  expect(estateApi.estateHandoffRefusal(phase, prodLot, week)).toBe(`lotEncumbered:activeProduction:${subjectKey(WORK)}`)
  expect(() => actualOpen(phase, runLot, week)).toThrow(/lotEncumbered:activeRun/)
  expect(() => actualOpen(phase, prodLot, week)).toThrow(/lotEncumbered:activeProduction/)
  expect(estateApi.estateHandoffRefusal(phase, handoff, week)).toBeNull()
  expect(stableStringify(phase)).toBe(phaseBytes)
  expect(handoff.pending).toEqual(expect.arrayContaining([
    { subject: RUN, reason: 'activeRun' }, { subject: WORK, reason: 'activeProduction' },
  ]))
  const record = opened.rights.estates.find(e => e.closureId === closure.closureId)!
  expect(record.origin).toEqual({ kind: 'closure49', closureId: closure.closureId })
  const claims = opened.studioClosure.claims.filter(c => c.closureId === closure.closureId)
    .sort((a, b) => a.sourceContractId < b.sourceContractId ? -1 : a.sourceContractId > b.sourceContractId ? 1
      : a.claimId < b.claimId ? -1 : a.claimId > b.claimId ? 1 : 0)
  expect(claims).toHaveLength(6)
  expect(record.claimsContext).toEqual({ priorityVersion: closure.lawVersion, claimIds: claims.map(c => c.claimId) })
  expect(record.pending).toEqual(expect.arrayContaining([
    { subject: RUN, reason: 'activeRun', status: 'pending' },
    { subject: WORK, reason: 'activeProduction', status: 'pending' },
  ]))
  for (const subject of [RUN, WORK]) expect(currentHolder(opened, subject, week)).toEqual({
    kind: 'holder', holderId: R03, tradeable: false, archived: false, estate: { estateId: record.estateId, lotId: null },
  })
  makeSave(opened)

  // Ordinary D−1 input; public resolveEstate owns the last tick, claims, and archival together.
  const stopped = opened.hollywood!.businesses.find(b => b.studioId === R03)!.productions
  let state = opened
  while (state.market.tick < record.closesWeek - 1) state = tick(state)
  const beforeD = stableStringify(state)
  const closed = estateApi.resolveEstate(state, record.estateId, record.closesWeek)
  expect(stableStringify(state)).toBe(beforeD)
  const after = closed.rights.estates.find(e => e.estateId === record.estateId)!
  expect(after.closedWeek).toBe(144)
  expect(after.pending.every(p => p.status === 'archived')).toBe(true)
  for (const subject of [RUN, WORK]) expect(currentHolder(closed, subject, 144)).toMatchObject({
    kind: 'holder', holderId: `estate:${R03}`, archived: true, tradeable: false,
  })
  expect(closed.rights.transactions.filter(t => t.kind === 'estateSale')).toEqual([])
  expect(closed.hollywood!.businesses.find(b => b.studioId === R03)!.productions).toEqual(stopped)
  expect(closed.studioClosure.closures.find(c => c.closureId === closure.closureId)).toEqual(closure)
  expect(closed.studioClosure.estateEvents.filter(e => e.closureId === closure.closureId && e.kind === 'archival')).toHaveLength(1)
  makeSave(closed)
})
