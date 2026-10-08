// Identical diagnostic source is copied into both isolated arms.
// It records the original four JSON.stringify preimages without changing the engine.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { it } from 'vitest'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { tick } from '../src/core/tick.js'
import { drainM0MarketDecisionRows } from '../src/core/talentMarket.js'
import type { GameState } from '../src/core/types.js'


const seed = 'p13a-core-causal-01'
const endWeek = 416
const output = process.env.PREIMAGE_OUTPUT
assert.ok(output && resolve(output) === output, 'PREIMAGE_OUTPUT must be absolute')
mkdirSync(output, { recursive: true })
const sha = (bytes: string) => createHash('sha256').update(bytes).digest('hex')
const encode = (value: unknown) => JSON.stringify(value)
const OBSERVER_SCHEMA = 'c0-external-observer/v1'
const TRACE_SCHEMA = {
  version: OBSERVER_SCHEMA,
  rowCount: 43,
  rows: [
    { kind: 'salary', weeks: [0], source: 'public employment, talent and provenance only',
      identity: ['contractId'], unavailable: ['modern exact age when provenance is absent', 'internal hiring draw and synthetic quote'] },
    { kind: 'film', weeks: [75, 114], source: 'public Hollywood project, screenplay, business and take roots',
      identity: ['week', 'productionId'], unavailable: ['internalPackageSearch', 'internalEconomicRejection'] },
    { kind: 'market', weeks: [207, 208], source: 'public market, promise, employment and business roots',
      identity: ['week', 'talentId'], unavailable: ['internalFreezePredicates', 'internalDescriptorBands', 'internalPairwiseOrder'] },
  ],
  nullMeaning: 'public field or row absent',
  unobservedMeaning: 'internal decision unavailable without separately reviewed source instrumentation',
} as const
const targetContract = 'studio-aca408ec-r01:contract:person-studio-aca408ec-r01-0:0'
const targetPerson = 'person-studio-aca408ec-r01-0'
const targetStudio = 'studio-aca408ec-r01'
const targetFilm = `${targetStudio}:film:10`
const snapshot = (value: unknown) => JSON.parse(JSON.stringify(value)) as unknown
const emitTrace = (file: string, row: unknown) => appendFileSync(file, encode(row) + '\n')

function salaryObservation(state: GameState) {
  const person = state.talent.find(t => t.id === targetPerson)
  const row = state.hollywood!.employment.find(e => e.contractId === targetContract)
  assert.ok(person && row)
  const provenance = (state as any).talentProvenance?.rows?.find((r: any) => r.personId === targetPerson)
  const exactAge = provenance?.kind === 'authored_exact_week' ? provenance.ageAtEntry : person.age
  return { schema: OBSERVER_SCHEMA, kind: 'salary', week: 0, contractId: targetContract,
    talentId: targetPerson, role: person.role, rawAgeAvailable: provenance !== undefined || !('talentProvenance' in state),
    exactAge, storedAge: person.age, provenance: provenance ?? null, termWeeks: row.terms.termWeeks,
    scarcityDraw: 'UNOBSERVED', internalSalaryQuote: 'UNOBSERVED',
    storedAnnual: row.terms.annualSalary, storedSigningBonus: row.terms.signingBonus,
    initialEmployment: state.hollywood!.employment.map(e => ({ contractId: e.contractId, studioId: e.studioId,
      talentId: e.terms.talentId, annualSalary: e.terms.annualSalary, signingBonus: e.terms.signingBonus,
      termWeeks: e.terms.termWeeks, startWeek: e.terms.startWeek, endWeekExclusive: e.terms.endWeekExclusive })) }
}

function filmObservation(state: GameState) {
  const week = state.market.tick
  const hollywood = state.hollywood as any
  const business = hollywood?.businesses?.find((b: any) => b.studioId === targetStudio)
  const project = business?.projects?.[10] ?? null
  const screenplay = business?.development?.projects?.[10] ?? null
  const production = business?.productions?.find((p: any) => p.id === targetFilm) ?? null
  const shell = business?.screenplayShelving
  const relevantReceipts = hollywood?.receipts?.filter((r: any) => r.week === week && r.studioId === targetStudio &&
    (r.kind === 'screenplayShelved' || r.kind === 'filmAnnounced' || r.kind === 'employment')) ?? []
  return { schema: OBSERVER_SCHEMA, kind: 'film', week, studioId: targetStudio, productionId: targetFilm,
    project: snapshot(project), screenplay: snapshot(screenplay),
    activeScriptMember: business?.activeScriptOrdinals?.includes(10) ?? null,
    rejection: snapshot(shell?.rejections?.find((r: any) => r.ordinal === 10) ?? null),
    shelved: snapshot(shell?.shelved?.find((r: any) => r.ordinal === 10) ?? null),
    commissionHoldUntilWeek: shell?.commissionHoldUntilWeek ?? null,
    cash: business?.account?.cash ?? null, production: snapshot(production),
    relevantReceipts: snapshot(relevantReceipts),
    take: snapshot(state.firstTakes.find(t => t.productionId === targetFilm) ?? null),
    internalPackageSearch: 'unobserved', internalEconomicRejection: 'unobserved' }
}

function marketObservation(state: GameState) {
  const week = state.market.tick
  const market = state.talentMarket as any
  const hollywood = state.hollywood as any
  const person = state.talent.find(t => t.id === targetPerson)
  return { schema: OBSERVER_SCHEMA, kind: 'market', week, talentId: targetPerson,
    person: snapshot(person ?? null),
    cases: snapshot(market.cases.filter((c: any) => c.talentId === targetPerson)),
    proposals: snapshot(market.proposals.filter((p: any) => p.talentId === targetPerson)),
    receipts: snapshot(market.receipts.filter((r: any) => r.talentId === targetPerson)),
    promises: snapshot(state.promises.filter(p => p.beneficiaryPersonId === targetPerson)),
    employment: snapshot(hollywood?.employment?.filter((e: any) => e.terms.talentId === targetPerson) ?? []),
    businesses: snapshot(hollywood?.businesses?.map((b: any) => ({ studioId: b.studioId,
      cash: b.account.cash, activeEmploymentOrdinals: b.activeEmploymentOrdinals })) ?? []),
    internalFreezePredicates: 'unobserved', internalDescriptorBands: 'unobserved',
    internalPairwiseOrder: 'unobserved' }
}

const settlement = (state: GameState) => state.talentMarket.receipts
  .filter((r) => r.kind === 'settled' || r.kind === 'declined' || r.kind === 'expired')
  .map((r) => [r.eventId, r.kind, r.week, r.talentId, r.studioId, r.reasons, r.dropped])
const eventContext = (state: GameState, receipt: GameState['talentMarket']['receipts'][number]) => {
  const market = state.talentMarket as unknown as Record<string, unknown>
  const subject = receipt.talentId
  return {
    receipt,
    cases: state.talentMarket.cases.filter((c) => c.talentId === subject),
    proposalReceipts: state.talentMarket.receipts.filter((r) => r.talentId === subject),
    proposals: Array.isArray(market.proposals) ? market.proposals.filter((p: any) => p.talentId === subject) : market.proposals,
    promises: state.promises.filter((p) => p.beneficiaryPersonId === subject),
    person: state.talent.find((p) => p.id === subject),
    employment: state.hollywood!.employment.filter((e) => e.terms.talentId === subject),
    businesses: state.hollywood!.businesses,
  }
}
const writeFinal = (name: string, value: unknown) => {
  const bytes = encode(value)
  writeFileSync(resolve(output, `${name}.json`), bytes, { flag: 'wx' })
  return { sha256: sha(bytes), bytes: Buffer.byteLength(bytes), length: Array.isArray(value) ? value.length : null }
}

it('records the full p13a original digest preimages', () => {
  let state = p13aGeneratedStudio(seed)
  assert.equal(state.market.tick, 0)
  let seenReceipts = 0
  let seenTakes = 0
  const weeklyPath = resolve(output, 'weekly.ndjson')
  const chooserPath = resolve(output, 'terminal-context.ndjson')
  const tracePath = resolve(output, 'trace.ndjson')
  writeFileSync(weeklyPath, '', { flag: 'wx' })
  writeFileSync(chooserPath, '', { flag: 'wx' })
  writeFileSync(tracePath, '', { flag: 'wx' })
  writeFileSync(resolve(output, 'trace-schema.json'), encode(TRACE_SCHEMA), { flag: 'wx' })
  emitTrace(tracePath, salaryObservation(state))
  appendFileSync(weeklyPath, encode({ week: 0, receiptsAppended: [], receipts: state.talentMarket.receipts, employment: state.hollywood!.employment,
    takesAppended: state.firstTakes, firstTakes: state.firstTakes, settlement: settlement(state) }) + '\n')
  for (let step = 1; step <= endWeek; step++) {
    state = tick(state)
    if (step >= 75 && step <= 114) emitTrace(tracePath, filmObservation(state))
    if (step === 207 || step === 208) emitTrace(tracePath, marketObservation(state))
    const receipts = state.talentMarket.receipts
    assert.equal(state.market.tick, step, 'contiguous natural ticks')
    assert.ok(state.talentMarket.receipts.length >= seenReceipts, 'receipt append-only invariant')
    assert.ok(state.firstTakes.length >= seenTakes, 'first-take append-only invariant')
    const addedReceipts = state.talentMarket.receipts.slice(seenReceipts)
    const addedTakes = state.firstTakes.slice(seenTakes)
    appendFileSync(weeklyPath, encode({ week: step, receiptsAppended: addedReceipts, receipts,
      employment: state.hollywood!.employment, takesAppended: addedTakes,
      firstTakes: state.firstTakes, settlement: settlement(state) }) + '\n')
    for (const receipt of addedReceipts) {
      if (receipt.kind === 'settled' || receipt.kind === 'declined' || receipt.kind === 'expired') {
        appendFileSync(chooserPath, encode({ week: step, ...eventContext(state, receipt) }) + '\n')
      }
    }
    seenReceipts = state.talentMarket.receipts.length
    seenTakes = state.firstTakes.length
  }
  const m0Rows = drainM0MarketDecisionRows()
  const m0Path = resolve(output, 'm0-market-decision.ndjson')
  const m0Bytes = m0Rows.map(row => encode(row)).join('\n') + '\n'
  const freeze = m0Rows.filter((row: any) => row.phase === 'freezeStart' && row.week === 208) as any[]
  assert.equal(freeze.length, 1, 'one target freeze decision')
  assert.deepEqual([...new Set(freeze[0]!.detail.submitted.map((entry: any) => entry.proposal.issuerStudioId))].sort(),
    ['studio-aca408ec-r01', 'studio-aca408ec-r02', 'studio-aca408ec-r03'], 'three expected issuers')
  assert.equal(freeze[0]!.detail.submitted.length, 3, 'three target submitted proposals')
  assert.ok(Number.isSafeInteger(freeze[0]!.detail.caseSourceIndex) && freeze[0]!.detail.caseSourceIndex >= 0,
    'source-order target case index')
  assert.equal(freeze[0]!.detail.priorCases.length, freeze[0]!.detail.caseSourceIndex,
    'prior case preimage follows source order')
  assert.ok(m0Rows.some((row: any) => row.phase === 'candidateFeasibility' && row.week === 196), 'target authoring observed')
  assert.ok(m0Rows.some((row: any) => row.phase === 'freezeProposal' && row.week === 208), 'target freeze observed')
  writeFileSync(m0Path, m0Bytes, { flag: 'wx' })
  const final = {
    seed, week: state.market.tick, rngState: state.rngState,
    settlement: writeFinal('settlement', settlement(state)),
    receipts: writeFinal('receipts', state.talentMarket.receipts),
    employment: writeFinal('employment', state.hollywood!.employment),
    takes: writeFinal('takes', state.firstTakes),
    weekly: { sha256: sha(readFileSync(weeklyPath, 'utf8')) },
    terminalContext: { sha256: sha(readFileSync(chooserPath, 'utf8')) },
    freezeObservedInputPreimage: { sha256: sha(encode(freeze[0]!.detail)),
      scope: 'explicit observer freezeStart fields only; not all engine decision inputs' },
    m0: { schema: 'c0-m0-market-decision/v1', sha256: sha(m0Bytes), rows: m0Rows.length },
    trace: { schema: OBSERVER_SCHEMA, sha256: sha(readFileSync(tracePath, 'utf8')), rows: 43,
      schemaSha256: sha(readFileSync(resolve(output, 'trace-schema.json'), 'utf8')) },
  }
  writeFileSync(resolve(output, 'final.json'), encode(final) + '\n', { flag: 'wx' })
}, 600_000)
