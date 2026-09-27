// Independent1105 forensic counterfactual; parent executes once inside the verified copy.
// Invalid continuation is explicit and never constitutes gameplay/save qualification.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'
import { exactAssignmentCollisionPerson } from './1105-c3-b5-assignment-matcher.mjs'
import { p13aGeneratedStudio } from '../../../../../src/harness/p13a/fixtures.ts'
import { tick } from '../../../../../src/core/tick.ts'
import { exportSave, makeSave, stableStringify } from '../../../../../src/core/save.ts'
import { currentTier, RELATIONSHIP_RECENT_CAP } from '../../../../../src/core/relationships.ts'
import type { GameState, Production, ScriptDevelopment, TalentMarketReceipt } from '../../../../../src/core/types.ts'

const SEED = 'p13b-s8-bridge-probe-01'
const CAP = 416, JSON_CAP = 16 * 1024 ** 2, STDOUT_CAP = 32 * 1024
const E = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919'
const HISTORICAL = `${E}/654-T-ledger-raw.json`
const PIN_SOURCE = 'tests/bridge-p14b5-relationships.test.ts'
const OUTPUT = `${E}/1105-c3-b5-forensic-result.json`
const TREATMENT = `${E}/1094-c3-b5-receipt-attribution.json`
const TREATMENT_PIN = { bytes: 748010, sha256: '10620ee9105e1ef2b01c31a576de4dc6a860da4ffff761187431ed9e50abad8a' } as const
const INPUT_PINS = {
  historical: 'b0f348c872cd14bf6db36bffd77c41b56c86e6e56e2bff1688380eda647989f4',
  test: '1f459d4f362bbd080d83147ffda0af94f93ffe2fb04030c9c45ce442de62a397',
} as const
const EXPECTED = {
  terminalRows: 48, settled: 48, declined: 0, expired: 0,
  settlement: 'f8b0d3a7a9d15b30ce65b3b90c291d29189aabd5f445621c7996117b4fd178c2',
  receipts: 'b729a1f33fac085228697a52bb474400b26ca04dab8114f2cd3fa893861186c4',
  employment: 'd4f19ea4618c680f60d9b7f4ea395ddc6813291ed261f939e06c4178a86fe8b1',
  takes: 'e9a1b08f794a9a8aa6645428ce5fbfe60401ed0700424902ee92a5aaa562b9e2',
  rng: '2343039306,887634093,2940629248,1402597496',
} as const
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
const textOrder = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0
const rawIdentity = (value: unknown) => { const raw = JSON.stringify(value); return { bytes: Buffer.byteLength(raw), sha256: sha(raw) } }
const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error)).slice(0, 6000)
const terminal = (row: TalentMarketReceipt) => row.kind === 'settled' || row.kind === 'declined' || row.kind === 'expired'
const terminalTuple = (row: TalentMarketReceipt) => [row.eventId, row.kind, row.week, row.talentId, row.studioId, row.reasons, row.dropped]
type HistoricalRow = { eventId: string; kind: string; week: number; talentId: string; winner: string | null;
  reasons: string[]; dropped: string[] }
type HistoricalSeed = { seed: string; week: number; rows: HistoricalRow[]; settlementDigest: string; prefixDigest: string;
  receiptsDigest: string; employmentDigest: string; takesDigest: string; rng: string }
const historicalTuple = (row: HistoricalRow) => [row.eventId, row.kind, row.week, row.talentId, row.winner, row.reasons, row.dropped]
const FROZEN_REASONS = new Set([
  'their compensation band ranked above the others', 'their term matched what this person prefers', 'they offered an opportunity',
  'their record with this person ranked above the others', 'their studio standing ranked higher', 'they are the current employer',
  'theirs was the only proposal on the table', 'their proposal ranked above the others overall',
])
const FROZEN_DROPS = [
  /^.+ had not entered the industry by the decision week\.$/,
  /^.+'s offer lapsed — this person was already committed elsewhere by the decision week\.$/,
  /^.+'s offer named a start week that no longer matches this decision\.$/,
  /^.+'s offer fell below this person's reservation for that term\.$/,
  /^.+'s terms changed since submission\.$/, /^.+ could not fund the signing bonus\.$/,
  /^.+ had no seat open for this person's role at the decision week\.$/,
  /^.+'s attached promise no longer had a feasible path by the decision week\.$/,
  /^.+ holds a record this person distrusts\.$/,
]

function wholeSave(state: GameState) {
  const started = performance.now(), save = makeSave(state)
  assert.equal(save.saveVersion, 38)
  const raw = exportSave(save)
  return { week: state.market.tick, bytes: Buffer.byteLength(raw), sha256: sha(raw), elapsedMs: performance.now() - started }
}
function terminalObservation(state: GameState, receipt: TalentMarketReceipt) {
  assert.ok(state.hollywood)
  const cases = state.talentMarket.cases.filter(row => row.talentId === receipt.talentId
    && row.closedWeek === receipt.week && row.outcome === receipt.kind)
  assert.equal(cases.length, 1, `one actual dated case for ${receipt.eventId}`)
  const kase = cases[0]!
  const drops = receipt.dropped.map(sentence => {
    const matches = state.hollywood!.identities.filter(row => sentence.startsWith(row.name))
      .sort((a, b) => b.name.length - a.name.length || textOrder(a.studioId, b.studioId))
    assert.ok(matches.length > 0, `dropped issuer is actually named: ${receipt.eventId}`)
    assert.equal(matches.filter(row => row.name.length === matches[0]!.name.length).length, 1, 'unambiguous longest actual studio name')
    return { sentence, studioId: matches[0]!.studioId, name: matches[0]!.name,
      vocabularyMatches: FROZEN_DROPS.flatMap((pattern, i) => pattern.test(sentence) ? [i] : []) }
  })
  const submissions = state.talentMarket.receipts.filter(row => row.kind === 'proposalSubmitted'
    && row.talentId === receipt.talentId && row.week >= kase.openedWeek && row.week <= receipt.week)
  const submitted = [...new Set(submissions.map(row => { assert.ok(row.studioId); return row.studioId }))]
  const dropped = new Set(drops.map(row => row.studioId))
  const survivors = submitted.filter(issuer => !dropped.has(issuer)).map(issuer => {
    // D1's original strict endpoints, not a present roster helper or inferred interval.
    const employment = state.hollywood!.employment.filter(row => row.studioId === issuer
      && row.terms.talentId !== receipt.talentId && row.terms.startWeek < receipt.week
      && (row.endedWeek === null || receipt.week < row.endedWeek))
    const roster = employment.map(row => row.terms.talentId)
    const shared = roster.map(personId => ({ personId, takes: state.firstTakes.filter(take => {
      const seats = [take.directorId, ...Object.values(take.cast)]
      return seats.includes(receipt.talentId) && seats.includes(personId)
    }).map(take => take.eventId) })).filter(row => row.takes.length > 0)
    const tiers = state.relationships.filter(edge => edge.a === receipt.talentId || edge.b === receipt.talentId)
      .filter(edge => roster.includes(edge.a === receipt.talentId ? edge.b : edge.a))
      .map(edge => ({ edgeId: edge.edgeId, counterpart: edge.a === receipt.talentId ? edge.b : edge.a,
        tier: currentTier(edge, receipt.week) }))
    const band = tiers.some(row => row.tier === 'CloseFriends' || row.tier === 'Inseparable') ? 2
      : tiers.some(row => row.tier === 'Enemies' || row.tier === 'Nemeses') ? 0 : 1
    return { issuer, roster, employment: employment.map(row => ({ contractId: row.contractId,
      personId: row.terms.talentId, startWeek: row.terms.startWeek, endWeekExclusive: row.terms.endWeekExclusive, endedWeek: row.endedWeek })),
      sharedTakeCounterparts: shared.map(row => row.personId), sharedTakes: shared, tiers, band }
  })
  const newSentences = receipt.kind === 'settled' ? receipt.reasons.filter(reason => !FROZEN_REASONS.has(reason)) : []
  const winner = survivors.find(row => row.issuer === receipt.studioId)
  const rankingApplicable = receipt.kind === 'settled' && survivors.length >= 2
  const strictlyBest = winner === undefined ? null : survivors.every(row => row === winner || winner.band > row.band)
  return { receipt: structuredClone(receipt), caseIdentity: structuredClone(kase),
    submissionEventIds: submissions.map(row => row.eventId), submittedIssuers: submitted, droppedIssuers: drops,
    survivors, newSentences, churn: receipt.week === 208 || receipt.week === 416,
    exposed: survivors.length >= 2 && survivors.some(row => row.sharedTakeCounterparts.length > 0),
    checks: { vocabulary: drops.every(row => row.vocabularyMatches.length > 0),
      noNewSettlementSentence: newSentences.length === 0,
      roster208: receipt.week !== 208 || survivors.every(row => row.roster.length === 0),
      roster416: receipt.week !== 416 || survivors.every(row => row.roster.every(id => /-supply-265-\d$/.test(id))
        && row.sharedTakeCounterparts.length === 0),
      allBandsNone: survivors.every(row => row.band === 1),
      rankingApplicable, winnerPresent: !rankingApplicable || winner !== undefined,
      sentenceMatchesStrictD5: !rankingApplicable || newSentences.length <= 1 && (newSentences.length > 0) === strictlyBest } }
}

type Assignment = { personId: string; studioId: string; workId: string; role: string; kind: 'production' | 'screenplay' }
function occupancy(state: GameState) {
  assert.ok(state.hollywood)
  const assignments: Assignment[] = []
  const productions: { studioId: string; workId: string; conceptId: string; startWeek: number; directorId: string;
    cast: Production['cast']; craftIds: string[]; writerCredit: string }[] = []
  const drafts: { studioId: string; workId: string; conceptId: string; commissionedWeek: number; dueWeek: number | null;
    status: string; writerId: string; writerIds: string[] }[] = []
  const visit = (studioId: string, work: readonly Production[], development: ScriptDevelopment) => {
    for (const production of work) {
      productions.push({ studioId, workId: production.id, conceptId: production.conceptId,
        startWeek: production.startTick, directorId: production.directorId, cast: { ...production.cast },
        craftIds: [...production.craftIds], writerCredit: production.writerId })
      // Permanent screenplay credit is explicitly not production occupancy.
      const seats: [string, string][] = [[production.directorId, 'director'],
        ...Object.entries(production.cast).map(([seat, id]): [string, string] => [id, seat]),
        ...production.craftIds.map((id): [string, string] => [id, 'craft'])]
      for (const [personId, role] of seats) assignments.push({ personId, studioId, workId: production.id, kind: 'production', role })
    }
    for (const project of development.projects) {
      if (project.status !== 'drafting' && project.status !== 'rewriting') continue
      const writerIds = [...new Set([project.writerId, ...project.writerIds])]
      drafts.push({ studioId, workId: project.id, conceptId: project.conceptId, commissionedWeek: project.commissionedWeek,
        dueWeek: project.dueWeek, status: project.status, writerId: project.writerId, writerIds })
      for (const personId of writerIds) assignments.push({ personId, studioId, workId: project.id, kind: 'screenplay', role: 'writer' })
    }
  }
  visit(state.hollywood.playerStudioId, state.studio.activeProductions, state.scriptDevelopment)
  for (const business of state.hollywood.businesses) visit(business.studioId, business.productions, business.development)
  const byPerson = new Map<string, Assignment[]>()
  for (const row of assignments) byPerson.set(row.personId, [...(byPerson.get(row.personId) ?? []), row])
  return { week: state.market.tick, productions, drafts, assignments,
    collisions: [...byPerson].filter(([, rows]) => rows.length > 1).map(([personId, rows]) => ({ personId, assignments: rows })) }
}
const workKey = (row: { studioId: string; workId: string }) => JSON.stringify([row.studioId, row.workId])
function promiseObservation(state: GameState, receipt: TalentMarketReceipt) {
  assert.ok(state.hollywood)
  const matches = state.promises.filter(row => row.outcomeEventId === receipt.eventId)
  assert.equal(matches.length, 1, `unique actual promise for outcome receipt ${receipt.eventId}`)
  const promise = matches[0]!
  assert.equal(promise.beneficiaryPersonId, receipt.talentId); assert.equal(promise.issuerStudioId, receipt.studioId)
  assert.equal(promise.outcomeWeek, receipt.week); assert.notEqual(promise.outcome, null)
  const evidence = promise.evidenceRefs.map(id => {
    const takes = state.firstTakes.filter(row => row.eventId === id)
    assert.equal(takes.length, 1, `actual first-take evidence ${id}`)
    const take = takes[0]!
    return { take: structuredClone(take), beneficiarySeats: Object.entries(take.cast)
      .filter(([, personId]) => personId === promise.beneficiaryPersonId).map(([seat]) => seat),
      beneficiaryDirects: take.directorId === promise.beneficiaryPersonId,
      issuerMatches: take.studioId === promise.issuerStudioId,
      insideWindow: take.week >= promise.windowStartWeek && take.week < promise.dueWeekExclusive }
  })
  return { receipt: structuredClone(receipt), promise: structuredClone(promise), evidence,
    employment: state.hollywood.employment.filter(row => row.contractId === promise.contractId).map(row => structuredClone(row)),
    lifecycleAtOutcome: { records: state.careerLifecycle.records.filter(row => row.personId === promise.beneficiaryPersonId).map(row => structuredClone(row)),
      changes: state.careerLifecycle.professionChanges.filter(row => row.personId === promise.beneficiaryPersonId).map(row => structuredClone(row)),
      finality: state.careerLifecycle.industryRetirements.filter(row => row.personId === promise.beneficiaryPersonId).map(row => structuredClone(row)) } }
}

type WorkChange = { sourceWeek: number; arrivedWeek: number; productions: ReturnType<typeof occupancy>['productions'];
  unfinishedDrafts: ReturnType<typeof occupancy>['drafts'] }
type ReceiptAppend = { sourceWeek: number; arrivedWeek: number; beforeCount: number; rows: TalentMarketReceipt[] }
type Treatment = { diagnosticStatus: string; attemptedTicks: number; completedTicks: number; arrivedWeek: number
  firstFailure: unknown; guardFailure: unknown; seed: string
  source: { diffSha256: string; trackedSha256: string; untracked: string }
  initial: { counts: { receipts: number; employment: number; takes: number }; receiptRows: TalentMarketReceipt[] }
  admissions: ReturnType<typeof wholeSave>[]; workChanges: WorkChange[]; appendedReceipts: ReceiptAppend[]
  occupancy211212: { sourceWeek: number; arrivedWeek: number; before: ReturnType<typeof occupancy>; after: ReturnType<typeof occupancy> }[]
  promiseOutcomes: ReturnType<typeof promiseObservation>[]
  final: { receipts: TalentMarketReceipt[]; employment: NonNullable<GameState['hollywood']>['employment']; firstTakes: GameState['firstTakes']; rngState: string }
}
type Admission = { week: number; status: 'ACCEPTED' | 'REFUSED'; bytes: number | null; sha256: string | null
  elapsedMs: number; message: string | null; forensicAllowed: boolean; census: ReturnType<typeof occupancy> | null }
function rowIdentity(row: unknown, key: string): string {
  assert.ok(row !== null && typeof row === 'object'); const value = (row as Record<string, unknown>)[key]
  assert.equal(typeof value, 'string'); return value as string
}
function orderedDifference(actual: readonly unknown[], treatment: readonly unknown[], key: (row: unknown) => string) {
  const a = new Map(actual.map((row, index) => [key(row), { index, row }])), b = new Map(treatment.map((row, index) => [key(row), { index, row }]))
  assert.equal(a.size, actual.length); assert.equal(b.size, treatment.length)
  const changedAtIndex = Array.from({ length: Math.max(actual.length, treatment.length) }, (_, index) => index)
    .filter(index => JSON.stringify(actual[index]) !== JSON.stringify(treatment[index]))
    .map(index => ({ index, actual: actual[index] ?? null, treatment: treatment[index] ?? null }))
  return { actualCount: actual.length, treatmentCount: treatment.length, firstDifferingIndex: changedAtIndex[0]?.index ?? null,
    changedAtIndex, changedById: [...a].filter(([id, value]) => b.has(id) && JSON.stringify(value.row) !== JSON.stringify(b.get(id)!.row))
      .map(([id, value]) => ({ id, actual: value, treatment: b.get(id)! })),
    added: [...a].filter(([id]) => !b.has(id)).map(([id, value]) => ({ id, ...value })),
    missing: [...b].filter(([id]) => !a.has(id)).map(([id, value]) => ({ id, ...value })) }
}

async function main() {
  const args = process.argv.slice(2)
  assert.equal(args.length, 2); assert.equal(args[0], '--manifest-sha'); assert.match(args[1]!, /^[a-f0-9]{64}$/)
  const root = realpathSync(fileURLToPath(new URL('../../../../../', import.meta.url)))
  assert.equal(realpathSync(process.cwd()), root, 'execute from the isolated snapshot, never the host workspace')
  const producerPath = fileURLToPath(import.meta.url), producerSha256 = sha(readFileSync(producerPath))
  const outputPath = resolve(root, OUTPUT)
  assert.equal(existsSync(outputPath), false, 'exclusive one-pass forensic result; no retry or cleanup')
  const snapshotGuard = () => JSON.parse(execFileSync(process.execPath, [resolve(root, E, '1105-c3-b5-forensic-verification.mjs'),
    '--snapshot-root', root, '--manifest-sha', args[1]!, '--allow-result', 'false'], { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 })) as {
      marker: string; manifest: { bytes: number; sha256: string }; hostSource: { diff: { sha256: string }; tracked: { sha256: string }; untracked: string } }
  const snapshot = snapshotGuard(); assert.equal(snapshot.marker, 'C3_B5_FORENSIC_SNAPSHOT_VERIFIED')
  const treatmentBytes = readFileSync(resolve(root, TREATMENT)); assert.equal(treatmentBytes.length, TREATMENT_PIN.bytes)
  assert.equal(sha(treatmentBytes), TREATMENT_PIN.sha256)
  const treatment = JSON.parse(treatmentBytes.toString('utf8')) as Treatment
  assert.equal(treatment.diagnosticStatus, 'COLLECTED'); assert.equal(treatment.seed, SEED)
  assert.equal(treatment.attemptedTicks, CAP); assert.equal(treatment.completedTicks, CAP); assert.equal(treatment.arrivedWeek, CAP)
  assert.equal(treatment.firstFailure, null); assert.equal(treatment.guardFailure, null)
  assert.equal(treatment.source.diffSha256, snapshot.hostSource.diff.sha256)
  assert.equal(treatment.source.trackedSha256, snapshot.hostSource.tracked.sha256); assert.equal(treatment.source.untracked, '')
  const historicalBytes = readFileSync(resolve(root, HISTORICAL)), pinSourceBytes = readFileSync(resolve(root, PIN_SOURCE))
  assert.equal(sha(historicalBytes), INPUT_PINS.historical); assert.equal(sha(pinSourceBytes), INPUT_PINS.test)
  const sourceText = pinSourceBytes.toString('utf8'), pinStart = sourceText.indexOf(`  '${SEED}': {`)
  assert.ok(pinStart >= 0); const pinEnd = sourceText.indexOf("\n  '", pinStart + 1); assert.ok(pinEnd > pinStart)
  for (const value of [EXPECTED.settlement, EXPECTED.receipts, EXPECTED.employment, EXPECTED.takes, EXPECTED.rng])
    assert.ok(sourceText.slice(pinStart, pinEnd).includes(value), 'unchanged original pin in the exact seed block')
  const historicalSeeds = JSON.parse(historicalBytes.toString('utf8')) as HistoricalSeed[]
  const matched = historicalSeeds.filter(row => row.seed === SEED); assert.equal(matched.length, 1)
  const historical = matched[0]!, oldTuples = historical.rows.map(historicalTuple)
  assert.equal(historical.week, CAP); assert.equal(oldTuples.length, EXPECTED.terminalRows)
  assert.equal(sha(JSON.stringify(oldTuples)), EXPECTED.settlement)
  assert.equal(historical.settlementDigest, EXPECTED.settlement); assert.equal(historical.receiptsDigest, EXPECTED.receipts)

  const started = performance.now(), startedAt = new Date().toISOString()
  let state: GameState | null = null, attempted = 0, completed = 0, phase = 'initialize'
  let firstFailure: { phase: string; message: string } | null = null, guardFailure: string | null = null
  let firstInvalid: { week: number; message: string; personId: string; assignments: Assignment[] } | null = null
  const admissions: Admission[] = [], terminalRows: ReturnType<typeof terminalObservation>[] = []
  const outcomeRows: ReturnType<typeof promiseObservation>[] = [], appendedReceipts: ReceiptAppend[] = [], workChanges: WorkChange[] = []
  const occupancy211212: Treatment['occupancy211212'] = [], tickTimings: number[] = [], prefixChecks: unknown[] = []
  let initial: Treatment['initial'] | null = null
  const admit = (world: GameState) => {
    const week = world.market.tick, start = performance.now()
    let accepted: ReturnType<typeof wholeSave>
    try { accepted = wholeSave(world) }
    catch (error) {
      const message = errorText(error), census = occupancy(world)
      const observation: Admission = { week, status: 'REFUSED', bytes: null, sha256: null, elapsedMs: performance.now() - start,
        message, forensicAllowed: false, census }
      admissions.push(observation)
      assert.ok(week === 212 || week === 416, 'only the named212/416 assignment refusal can be forensic')
      const personId = exactAssignmentCollisionPerson(message, census.collisions)
      assert.ok(personId, 'exact current simultaneous-assignment law, not another validation cause')
      const collision = census.collisions.find(row => row.personId === personId)
      assert.ok(collision, 'validator person is independently present in simultaneous work')
      const production = collision.assignments.find(row => row.kind === 'production')
      const draft = collision.assignments.find(row => row.kind === 'screenplay')
      assert.ok(production && draft); assert.equal(production.studioId, draft.studioId)
      assert.notEqual(production.workId, draft.workId, 'two actual work identities')
      if (week === 212) {
        assert.equal(firstInvalid, null)
        const p = census.productions.find(row => row.studioId === production.studioId && row.workId === production.workId)
        const d = census.drafts.find(row => row.studioId === draft.studioId && row.workId === draft.workId)
        assert.ok(p && d); assert.equal(p.startWeek, 211); assert.equal(d.commissionedWeek, 211)
        assert.equal(d.status, 'drafting'); assert.ok(d.dueWeek !== null && d.dueWeek >= 212)
        const earlier = occupancy211212.find(row => row.arrivedWeek === 212)!.before
        assert.equal(earlier.collisions.some(row => row.personId === personId), false)
        assert.equal(earlier.productions.some(row => row.workId === p.workId && row.studioId === p.studioId), false)
        assert.equal(earlier.drafts.some(row => row.workId === d.workId && row.studioId === d.studioId), false)
        const current = treatment.occupancy211212.find(row => row.arrivedWeek === 212)
        assert.ok(current); assert.equal(current.after.collisions.length, 0, 'actual treatment212 stays valid')
        firstInvalid = { week, message, personId, assignments: structuredClone(collision.assignments) }
      } else assert.ok(firstInvalid !== null, 'later refusal never invents an earlier invalid continuation')
      observation.forensicAllowed = true
      return
    }
    admissions.push({ ...accepted, status: 'ACCEPTED', message: null, forensicAllowed: false, census: null })
    if (week <= 211) {
      const expected = treatment.admissions.filter(row => row.week === week); assert.equal(expected.length, 1)
      assert.equal(accepted.bytes, expected[0]!.bytes); assert.equal(accepted.sha256, expected[0]!.sha256)
    }
    assert.notEqual(week, 212, 'required first invalid occupancy witness must actually occur')
  }
  try {
    state = p13aGeneratedStudio(SEED); assert.equal(state.market.tick, 0); assert.ok(state.hollywood)
    initial = { counts: { receipts: state.talentMarket.receipts.length, employment: state.hollywood.employment.length,
      takes: state.firstTakes.length }, receiptRows: structuredClone([...state.talentMarket.receipts]) }
    assert.deepEqual(initial, treatment.initial); admit(state)
    for (let index = 0; index < CAP; index++) {
      assert.equal(state.market.tick, index); assert.ok(attempted < CAP)
      const before: GameState = state, beforeReceipts: string = JSON.stringify(before.talentMarket.receipts)
      const beforeCount: number = before.talentMarket.receipts.length, beforeOccupancy = occupancy(before)
      phase = `tick-${index}-to-${index + 1}`; attempted++
      const tickStart = performance.now()
      try { state = tick(state) } // Exactly default development=false; never bypass an engine throw.
      finally { tickTimings.push(performance.now() - tickStart) }
      completed++; assert.equal(state.market.tick, index + 1); phase = `observe-${state.market.tick}`
      assert.ok(state.talentMarket.receipts.length >= beforeCount)
      assert.equal(JSON.stringify(state.talentMarket.receipts.slice(0, beforeCount)), beforeReceipts)
      assert.equal(new Set(state.talentMarket.receipts.map(row => row.eventId)).size, state.talentMarket.receipts.length)
      const appended = state.talentMarket.receipts.slice(beforeCount)
      if (appended.length) appendedReceipts.push({ sourceWeek: index, arrivedWeek: state.market.tick,
        beforeCount, rows: structuredClone([...appended]) })
      for (const receipt of appended) {
        if (terminal(receipt)) { assert.equal(receipt.week, state.market.tick); terminalRows.push(terminalObservation(state, receipt)) }
        if (receipt.kind === 'promiseOutcome') outcomeRows.push(promiseObservation(state, receipt))
      }
      const afterOccupancy = occupancy(state), beforeProductions = new Set(beforeOccupancy.productions.map(workKey))
      const beforeDrafts = new Set(beforeOccupancy.drafts.map(row => JSON.stringify(row)))
      const productions = afterOccupancy.productions.filter(row => !beforeProductions.has(workKey(row)))
      const drafts = afterOccupancy.drafts.filter(row => !beforeDrafts.has(JSON.stringify(row)))
      if (productions.length || drafts.length) workChanges.push({ sourceWeek: index, arrivedWeek: state.market.tick, productions, unfinishedDrafts: drafts })
      if (state.market.tick === 211 || state.market.tick === 212)
        occupancy211212.push({ sourceWeek: index, arrivedWeek: state.market.tick, before: beforeOccupancy, after: afterOccupancy })
      if (state.market.tick <= 211) {
        const receiptPrefix = treatment.appendedReceipts.filter(row => row.arrivedWeek <= state!.market.tick)
        const workPrefix = treatment.workChanges.filter(row => row.arrivedWeek <= state!.market.tick)
        assert.deepEqual(appendedReceipts, receiptPrefix, 'exact actual1062 per-week receipt prefix before intervention effect')
        assert.deepEqual(workChanges, workPrefix, 'exact actual1062 per-week work prefix before intervention effect')
        assert.deepEqual(state.talentMarket.receipts, [...treatment.initial.receiptRows, ...receiptPrefix.flatMap(row => row.rows)])
        if (state.market.tick === 208 || state.market.tick === 211) prefixChecks.push({ week: state.market.tick,
          receipts: rawIdentity(state.talentMarket.receipts), receiptAppends: rawIdentity(appendedReceipts), work: rawIdentity(workChanges), exactTreatment: true })
        if (state.market.tick === 211) assert.deepEqual(occupancy211212[0], treatment.occupancy211212.find(row => row.arrivedWeek === 211))
      }
      if ([208, 211, 212, 416].includes(state.market.tick)) { phase = `whole38-${state.market.tick}`; admit(state) }
    }
    assert.equal(attempted, CAP); assert.equal(completed, CAP); assert.equal(state.market.tick, CAP)
    assert.ok(firstInvalid !== null, 'explicitly invalid forensic route required')
    assert.deepEqual(admissions.map(row => row.week), [0, 208, 211, 212, 416])
  } catch (error) { firstFailure = { phase, message: errorText(error) } }
  try {
    assert.deepEqual(snapshotGuard(), snapshot, 'full host/copied source and explicit extras remain frozen')
    assert.equal(sha(readFileSync(producerPath)), producerSha256)
    assert.equal(sha(readFileSync(resolve(root, TREATMENT))), TREATMENT_PIN.sha256)
  } catch (error) { guardFailure = errorText(error) }

  const complete = firstFailure === null && guardFailure === null && completed === CAP && firstInvalid !== null
  const receipts = state?.talentMarket.receipts ?? [], employment = state?.hollywood?.employment ?? [], takes = state?.firstTakes ?? []
  const tuples = receipts.filter(terminal).map(terminalTuple)
  const actual = { terminalRows: tuples.length, settled: receipts.filter(row => row.kind === 'settled').length,
    declined: receipts.filter(row => row.kind === 'declined').length, expired: receipts.filter(row => row.kind === 'expired').length,
    settlement: sha(JSON.stringify(tuples)), receipts: sha(JSON.stringify(receipts)), employment: sha(JSON.stringify(employment)),
    takes: sha(JSON.stringify(takes)), rng: state?.rngState ?? null }
  const comparisons = Object.entries(EXPECTED).map(([key, expected]) => ({ key, expected,
    actual: actual[key as keyof typeof actual], finalExecuted: complete, equal: complete ? actual[key as keyof typeof actual] === expected : null }))
  const historicalById = new Map(historical.rows.map(row => [row.eventId, historicalTuple(row)]))
  const joined = tuples.map((tuple, index) => ({ index, eventId: tuple[0],
    equalById: stableStringify(tuple) === stableStringify(historicalById.get(String(tuple[0]))),
    equalAtIndex: stableStringify(tuple) === stableStringify(oldTuples[index]) }))
  const weekKey = (row: unknown) => { assert.ok(row && typeof row === 'object'); const r = row as { sourceWeek: number; arrivedWeek: number }; return JSON.stringify([r.sourceWeek, r.arrivedWeek]) }
  const differences = {
    receipts: orderedDifference(receipts, treatment.final.receipts, row => rowIdentity(row, 'eventId')),
    employment: orderedDifference(employment, treatment.final.employment, row => rowIdentity(row, 'contractId')),
    firstTakes: orderedDifference(takes, treatment.final.firstTakes, row => rowIdentity(row, 'eventId')),
    work: orderedDifference(workChanges, treatment.workChanges, weekKey),
    receiptAppends: orderedDifference(appendedReceipts, treatment.appendedReceipts, weekKey),
    promiseOutcomes: orderedDifference(outcomeRows, treatment.promiseOutcomes, row => {
      assert.ok(row && typeof row === 'object'); return rowIdentity((row as { receipt: unknown }).receipt, 'eventId') }),
  }
  const lawChecks = { frozenVocabulary: terminalRows.every(row => row.checks.vocabulary && row.checks.noNewSettlementSentence),
    exactChurnRoster: terminalRows.every(row => row.checks.roster208 && row.checks.roster416),
    d5NoneAndRanking: terminalRows.every(row => row.checks.allBandsNone && row.checks.winnerPresent && row.checks.sentenceMatchesStrictD5),
    relationshipsBounded: state === null ? null : state.relationships.every(edge => edge.recent.length <= RELATIONSHIP_RECENT_CAP
      && edge.sharedSuccesses + edge.sharedFailures <= edge.sharedProductions) }
  const originalPinsRecovered = complete && comparisons.every(row => row.equal)
  const firstWorkDifference = differences.work.changedAtIndex[0] ?? null
  const result = { record: '1105', counterfactualStatus: complete ? 'FORENSIC_COLLECTED' : 'STOPPED', gameplayValid: false,
    gameplayClaim: 'Never a qualified gameplay/save trajectory;212 rejection remains authoritative',
    firstRejectedStateObserved: firstInvalid, seed: SEED, snapshot, producerSha256, treatment: TREATMENT_PIN,
    startedAt, finishedAt: new Date().toISOString(), elapsedMs: performance.now() - started,
    attemptedTicks: attempted, completedTicks: completed, arrivedWeek: state?.market.tick ?? null,
    tickOption: 'exact tick(state), default develop=false', firstFailure, guardFailure,
    initial, admissions, prefixChecks, tickTimings, comparisons, originalPinsRecovered, lawChecks,
    attributionStatus: originalPinsRecovered && joined.every(row => row.equalById && row.equalAtIndex)
      ? 'PINS_RECOVERED_REQUIRES_INDEPENDENT_CAUSAL_REVIEW' : 'INCOMPLETE',
    firstWorkDifference, final: { receipts, employment, firstTakes: takes, rngState: state?.rngState ?? null,
      identities: { receipts: rawIdentity(receipts), employment: rawIdentity(employment), firstTakes: rawIdentity(takes) } },
    historicalTerminal: { tuples: oldTuples, observedTuples: tuples, joined,
      fullHistoricalNonterminalArray: 'UNAVAILABLE; no field-level historical rows invented' },
    differences, treatmentRngComparison: { actual: state?.rngState ?? null, treatment: treatment.final.rngState,
      equal: complete ? state?.rngState === treatment.final.rngState : null },
    appendedReceipts, terminalRows, promiseOutcomes: outcomeRows, workChanges, occupancy211212,
    limits: { maxTicks: CAP, resultBytes: JSON_CAP, stdoutBytes: STDOUT_CAP, variants: 1, extraActions: 0, funding: 0 },
    coverage: ['Only copied busy-set import/comment/loop omitted; all other current source and validator bytes unchanged',
      'Actual1062 current treatment is not rerun; exact0/208/211 accepted bytes and work/receipt prefixes required',
      'Only precise occupancy-backed212/416 validator refusal permits labelled invalid forensic continuation',
      'Engine exceptions stop; no validity repair, validator bypass, adaptive run or automatic expected-pin update',
      'Collection and recovered hashes never authorize a gameplay PASS or ordinary fixture'] }
  const output = JSON.stringify(result, null, 2) + '\n'
  let artifactFailure: string | null = null
  try { assert.ok(Buffer.byteLength(output) <= JSON_CAP); writeFileSync(outputPath, output, { flag: 'wx' }) }
  catch (error) { artifactFailure = errorText(error) }
  const summary = JSON.stringify({ marker: complete && artifactFailure === null ? 'C3_B5_FORENSIC_COLLECTED' : 'C3_B5_FORENSIC_STOPPED',
    gameplayValid: false, output: OUTPUT, outputBytes: Buffer.byteLength(output), outputSha256: artifactFailure === null ? sha(output) : null,
    attemptedTicks: attempted, completedTicks: completed, arrivedWeek: state?.market.tick ?? null, firstInvalid,
    comparisons, originalPinsRecovered, firstFailure, guardFailure, artifactFailure, noGameplayQualification: true })
  assert.ok(Buffer.byteLength(summary) <= STDOUT_CAP); console.log(summary)
  if (!complete || artifactFailure !== null) process.exitCode = 1
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main().catch(error => { console.error(JSON.stringify({ marker: 'C3_B5_FORENSIC_PRECONDITION_FAILURE', gameplayValid: false, message: errorText(error) })); process.exitCode = 1 })
}
