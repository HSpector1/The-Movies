// F0: read-only internal film decision witness plus original four digest preimages.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { it } from 'vitest'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { offerForTalent } from '../src/core/employment.js'
import { salaryCurve } from '../src/core/worldgen.js'
import { stream } from '../src/core/rng.js'
import { TUNING } from '../src/core/tuning.js'


const seed = 'p13a-core-causal-01'
const endWeek = 416
const output = process.env.PREIMAGE_OUTPUT
assert.ok(output && resolve(output) === output, 'PREIMAGE_OUTPUT must be absolute')
mkdirSync(output, { recursive: true })
const filmWitnessPath = resolve(output, 'film-hold-witness.ndjson')
writeFileSync(filmWitnessPath, '', { flag: 'wx' })
const sha = (bytes: string) => createHash('sha256').update(bytes).digest('hex')
const encode = (value: unknown) => JSON.stringify(value)
const OBSERVER_SCHEMA = 'c0-external-observer/v1'
const TRACE_SCHEMA = {
  version: OBSERVER_SCHEMA,
  rowCount: 43,
  rows: [
    { kind: 'salary', weeks: [0], source: 'public employment, talent, provenance and pure offer helpers',
      identity: ['contractId'], unavailable: ['modern exact age when provenance is absent'] },
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
  const term = row.terms.termWeeks
  const lengthFactor = (TUNING.CONTRACT_LENGTH_FACTOR as any)[term] ?? 1
  const draw = stream(state.seed, 'hiring', `offer-${targetPerson}`).next()
  const jitter = 1 + (draw * 2 - 1) * TUNING.CONTRACT_SCARCITY_JITTER
  const ageFactor = (age: number) => {
    const d = (age - TUNING.CONTRACT_AGE_PRIME) / TUNING.CONTRACT_AGE_SPREAD
    return TUNING.CONTRACT_AGE_FACTOR_MIN + (1 - TUNING.CONTRACT_AGE_FACTOR_MIN) * Math.max(0, 1 - d * d)
  }
  const quote = (age: number) => {
    const talent = { ...person, age }
    const unrounded = salaryCurve(talent) * TUNING.CONTRACT_ANNUAL_MULT * lengthFactor * ageFactor(age) * jitter
    return { age, salaryCurve: salaryCurve(talent), ageFactor: ageFactor(age), unrounded,
      calculatedAnnual: Math.round(unrounded), offer: offerForTalent(state.seed, talent, term, 0) }
  }
  return { schema: OBSERVER_SCHEMA, kind: 'salary', week: 0, contractId: targetContract,
    talentId: targetPerson, role: person.role, rawAgeAvailable: provenance !== undefined || !('talentProvenance' in state),
    exactAge, storedAge: person.age, provenance: provenance ?? null, termWeeks: term,
    annualMultiplier: TUNING.CONTRACT_ANNUAL_MULT, lengthFactor,
    agePrime: TUNING.CONTRACT_AGE_PRIME, ageSpread: TUNING.CONTRACT_AGE_SPREAD,
    ageFactorMin: TUNING.CONTRACT_AGE_FACTOR_MIN, scarcityKey: `offer-${targetPerson}`,
    scarcityDraw: draw, jitter, exactAgeQuote: quote(exactAge), flooredAgeQuote: quote(Math.floor(exactAge)),
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
  const final = {
    seed, week: state.market.tick, rngState: state.rngState,
    settlement: writeFinal('settlement', settlement(state)),
    receipts: writeFinal('receipts', state.talentMarket.receipts),
    employment: writeFinal('employment', state.hollywood!.employment),
    takes: writeFinal('takes', state.firstTakes),
    weekly: { sha256: sha(readFileSync(weeklyPath, 'utf8')) },
    terminalContext: { sha256: sha(readFileSync(chooserPath, 'utf8')) },
    trace: { schema: OBSERVER_SCHEMA, sha256: sha(readFileSync(tracePath, 'utf8')), rows: 43,
      schemaSha256: sha(readFileSync(resolve(output, 'trace-schema.json'), 'utf8')) },
    filmHoldWitness: { schema: 'c0-film-hold-witness/v1', sha256: sha(readFileSync(filmWitnessPath, 'utf8')),
      rows: readFileSync(filmWitnessPath, 'utf8').split('\n').filter(Boolean).length },
  }
  writeFileSync(resolve(output, 'final.json'), encode(final) + '\n', { flag: 'wx' })
}, 300_000)
