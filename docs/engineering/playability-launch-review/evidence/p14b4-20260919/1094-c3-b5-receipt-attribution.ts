// Independent1094-A collection, parent execution only. No expected pin is updated.
// One original seed, at most416 tick(state) calls with the actual default option.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'
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
const OUTPUT = `${E}/1094-c3-b5-receipt-attribution.json`
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
const SOURCE = ['src', 'bridge', 'tests', 'generated', 'ui', 'scripts', 'package.json', 'package-lock.json',
  'tsconfig.json', 'tsconfig.bridge.json', 'tsconfig.src.json', 'vitest.config.ts', 'vitest.workspace.ts']
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

function sourceIdentity(root: string) {
  const git = (...args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 ** 2 })
  return { head: git('rev-parse', 'HEAD').trim(), diffSha256: sha(git('diff', '--no-ext-diff', '--binary', 'HEAD', '--', ...SOURCE)),
    trackedSha256: sha(git('ls-files', '--stage', '--', ...SOURCE)),
    untracked: git('ls-files', '--others', '--exclude-standard', '--', ...SOURCE).trim() }
}
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

async function main() {
  assert.equal(process.argv.length, 4, 'one explicit --source-sha argument; no alternate seed, route or output')
  assert.equal(process.argv[2], '--source-sha')
  const expectedHead = process.argv[3]!; assert.match(expectedHead, /^[0-9a-f]{40}$/)
  const root = fileURLToPath(new URL('../../../../../', import.meta.url)), producerPath = fileURLToPath(import.meta.url)
  const outputPath = resolve(root, OUTPUT)
  assert.equal(existsSync(outputPath), false, 'exclusive one-result path; never overwrite or clean')
  const beforeSource = sourceIdentity(root), producerSha256 = sha(readFileSync(producerPath))
  assert.equal(beforeSource.head, expectedHead); assert.equal(beforeSource.untracked, '')
  const historicalBytes = readFileSync(resolve(root, HISTORICAL)), pinSourceBytes = readFileSync(resolve(root, PIN_SOURCE))
  assert.equal(sha(historicalBytes), INPUT_PINS.historical); assert.equal(sha(pinSourceBytes), INPUT_PINS.test)
  const sourceText = pinSourceBytes.toString('utf8'), pinStart = sourceText.indexOf(`  '${SEED}': {`)
  assert.ok(pinStart >= 0)
  const pinEnd = sourceText.indexOf("\n  '", pinStart + 1)
  assert.ok(pinEnd > pinStart)
  const pinBlock = sourceText.slice(pinStart, pinEnd)
  for (const value of [EXPECTED.settlement, EXPECTED.receipts, EXPECTED.employment, EXPECTED.takes, EXPECTED.rng])
    assert.ok(pinBlock.includes(value), 'original current pin is present in its source block')
  const historicalSeeds = JSON.parse(historicalBytes.toString('utf8')) as HistoricalSeed[]
  const matched = historicalSeeds.filter(row => row.seed === SEED); assert.equal(matched.length, 1)
  const historical = matched[0]!, oldTuples = historical.rows.map(historicalTuple)
  assert.equal(historical.week, CAP); assert.equal(oldTuples.length, EXPECTED.terminalRows)
  assert.equal(sha(JSON.stringify(oldTuples)), EXPECTED.settlement)
  assert.equal(historical.settlementDigest, EXPECTED.settlement); assert.equal(historical.prefixDigest, EXPECTED.settlement)
  assert.equal(historical.receiptsDigest, EXPECTED.receipts)

  const started = performance.now(), startedAt = new Date().toISOString()
  let state: GameState | null = null, attempted = 0, completed = 0, phase = 'initialize'
  let firstFailure: { phase: string; message: string } | null = null, guardFailure: string | null = null
  const admissions: ReturnType<typeof wholeSave>[] = [], terminalRows: ReturnType<typeof terminalObservation>[] = []
  const outcomeRows: ReturnType<typeof promiseObservation>[] = []
  const appendedReceipts: { sourceWeek: number; arrivedWeek: number; beforeCount: number; rows: TalentMarketReceipt[] }[] = []
  const workChanges: unknown[] = [], occupancy211212: unknown[] = [], lifecycleChanges: unknown[] = []
  const tickTimings: number[] = []
  let initial: { counts: { receipts: number; employment: number; takes: number }; receiptRows: TalentMarketReceipt[] } | null = null
  try {
    state = p13aGeneratedStudio(SEED)
    assert.equal(state.market.tick, 0); assert.equal(state.seed, SEED); assert.ok(state.hollywood)
    admissions.push(wholeSave(state))
    initial = { counts: { receipts: state.talentMarket.receipts.length, employment: state.hollywood.employment.length,
      takes: state.firstTakes.length }, receiptRows: structuredClone([...state.talentMarket.receipts]) }
    for (let index = 0; index < CAP; index++) {
      assert.equal(state.market.tick, index); assert.ok(attempted < CAP)
      const before: GameState = state, beforeReceipts: string = JSON.stringify(before.talentMarket.receipts), beforeCount: number = before.talentMarket.receipts.length
      const beforeOccupancy = occupancy(before)
      const beforeLifecycle = JSON.stringify(before.careerLifecycle)
      phase = `tick-${index}-to-${index + 1}`; attempted++
      const tickStart = performance.now()
      try { state = tick(state) } // Exact original call: default development=false.
      finally { tickTimings.push(performance.now() - tickStart) }
      completed++; assert.equal(state.market.tick, index + 1)
      phase = `observe-${state.market.tick}`
      assert.ok(state.talentMarket.receipts.length >= beforeCount, 'receipt array cannot shrink')
      assert.equal(JSON.stringify(state.talentMarket.receipts.slice(0, beforeCount)), beforeReceipts, 'every old receipt prefix remains byte-identical')
      assert.equal(new Set(state.talentMarket.receipts.map(row => row.eventId)).size, state.talentMarket.receipts.length)
      const appended = state.talentMarket.receipts.slice(beforeCount)
      if (appended.length) appendedReceipts.push({ sourceWeek: index, arrivedWeek: state.market.tick,
        beforeCount, rows: structuredClone([...appended]) })
      for (const receipt of appended) {
        if (terminal(receipt)) { assert.equal(receipt.week, state.market.tick); terminalRows.push(terminalObservation(state, receipt)) }
        if (receipt.kind === 'promiseOutcome') outcomeRows.push(promiseObservation(state, receipt))
      }
      const afterOccupancy = occupancy(state)
      const beforeProductions = new Set(beforeOccupancy.productions.map(workKey))
      const beforeDrafts = new Set(beforeOccupancy.drafts.map(row => JSON.stringify(row)))
      const productions = afterOccupancy.productions.filter(row => !beforeProductions.has(workKey(row)))
      const drafts = afterOccupancy.drafts.filter(row => !beforeDrafts.has(JSON.stringify(row)))
      if (productions.length || drafts.length) workChanges.push({ sourceWeek: index, arrivedWeek: state.market.tick, productions, unfinishedDrafts: drafts })
      if (state.market.tick === 211 || state.market.tick === 212)
        occupancy211212.push({ sourceWeek: index, arrivedWeek: state.market.tick, before: beforeOccupancy, after: afterOccupancy })
      if (JSON.stringify(state.careerLifecycle) !== beforeLifecycle) {
        // Use the pre-call serialized value, never a possibly shared old object.
        const previous = JSON.parse(beforeLifecycle) as GameState['careerLifecycle']
        const oldRecords = new Map(previous.records.map(row => [JSON.stringify([row.personId, row.profession]), JSON.stringify(row)]))
        lifecycleChanges.push({ sourceWeek: index, arrivedWeek: state.market.tick,
          changedRetirements: state.careerLifecycle.records.filter(row => oldRecords.get(JSON.stringify([row.personId, row.profession])) !== JSON.stringify(row)).map(row => structuredClone(row)),
          newChanges: structuredClone(state.careerLifecycle.professionChanges.slice(previous.professionChanges.length)),
          newEvaluations: structuredClone(state.careerLifecycle.transitionEvaluations.slice(previous.transitionEvaluations.length)),
          newFinality: structuredClone(state.careerLifecycle.industryRetirements.slice(previous.industryRetirements.length)),
          due: structuredClone(state.careerLifecycle.transitionDue) })
      }
      if ([208, 211, 212, 416].includes(state.market.tick)) { phase = `whole38-${state.market.tick}`; admissions.push(wholeSave(state)) }
    }
    assert.equal(attempted, CAP); assert.equal(completed, CAP); assert.equal(state.market.tick, CAP)
  } catch (error) { firstFailure = { phase, message: errorText(error) } }
  try {
    assert.deepEqual(sourceIdentity(root), beforeSource, 'consumed source/HEAD/index drift')
    assert.equal(sha(readFileSync(producerPath)), producerSha256, 'producer drift')
    assert.equal(sha(readFileSync(resolve(root, HISTORICAL))), INPUT_PINS.historical, '654 input drift')
    assert.equal(sha(readFileSync(resolve(root, PIN_SOURCE))), INPUT_PINS.test, 'original expected-pin source drift')
  } catch (error) { guardFailure = errorText(error) }

  // All original final pins are measured independently; a mismatch never masks
  // later employment/takes/RNG. No observed value becomes an assertion input.
  const complete = firstFailure === null && guardFailure === null && completed === CAP
  const receipts = state?.talentMarket.receipts ?? [], employment = state?.hollywood?.employment ?? [], takes = state?.firstTakes ?? []
  const tuples = receipts.filter(terminal).map(terminalTuple)
  const actual = { terminalRows: tuples.length, settled: receipts.filter(row => row.kind === 'settled').length,
    declined: receipts.filter(row => row.kind === 'declined').length, expired: receipts.filter(row => row.kind === 'expired').length,
    settlement: sha(JSON.stringify(tuples)), receipts: sha(JSON.stringify(receipts)), employment: sha(JSON.stringify(employment)),
    takes: sha(JSON.stringify(takes)), rng: state?.rngState ?? null }
  const comparisons = Object.entries(EXPECTED).map(([key, expected]) => ({ key, expected,
    actual: actual[key as keyof typeof actual], finalExecuted: complete,
    equal: complete ? actual[key as keyof typeof actual] === expected : null }))
  const oldByEvent = new Map(historical.rows.map(row => [row.eventId, historicalTuple(row)]))
  const joined = tuples.map((tuple, index) => ({ index, eventId: tuple[0],
    historicalIndex: historical.rows.findIndex(row => row.eventId === tuple[0]),
    equalByEvent: stableStringify(tuple) === stableStringify(oldByEvent.get(String(tuple[0]))),
    equalAtIndex: stableStringify(tuple) === stableStringify(oldTuples[index]) }))
  const kindCounts: Record<string, number> = {}
  for (const receipt of receipts) kindCounts[receipt.kind] = (kindCounts[receipt.kind] ?? 0) + 1
  const people = new Set(outcomeRows.map(row => row.promise.beneficiaryPersonId))
  const lawChecks = { everyTerminalAtChurn: terminalRows.every(row => row.churn), zeroExposed: terminalRows.every(row => !row.exposed),
    frozenVocabulary: terminalRows.every(row => row.checks.vocabulary && row.checks.noNewSettlementSentence),
    exactChurnRoster: terminalRows.every(row => row.checks.roster208 && row.checks.roster416),
    d5NoneAndRanking: terminalRows.every(row => row.checks.allBandsNone && row.checks.winnerPresent && row.checks.sentenceMatchesStrictD5),
    relationshipsBounded: state === null ? null : state.relationships.every(edge => edge.recent.length <= RELATIONSHIP_RECENT_CAP
      && edge.sharedSuccesses + edge.sharedFailures <= edge.sharedProductions) }
  const result = { record: '1094', diagnosticStatus: complete ? 'COLLECTED' : 'STOPPED', seed: SEED,
    source: beforeSource, producerSha256, inputs: INPUT_PINS, startedAt, finishedAt: new Date().toISOString(),
    elapsedMs: performance.now() - started, node: process.version, tickOption: 'exact tick(state), default develop=false',
    attemptedTicks: attempted, completedTicks: completed, arrivedWeek: state?.market.tick ?? null, maxTicks: CAP,
    firstFailure, guardFailure, initial, admissions, tickTimings, comparisons, lawChecks,
    originalRegressionStatus: !complete ? 'UNEXECUTED_TO_END' : comparisons.every(row => row.equal) && Object.values(lawChecks).every(Boolean) ? 'PASS' : 'FAIL',
    final: { receipts, employment, firstTakes: takes, rngState: state?.rngState ?? null,
      identities: { receipts: rawIdentity(receipts), employment: rawIdentity(employment), firstTakes: rawIdentity(takes),
        additionalCanonicalReceiptsSha256: sha(stableStringify(receipts)) },
      kindCounts, orderedEventIds: receipts.map(row => row.eventId) },
    historicalTerminal: { tuples: oldTuples, currentTuples: tuples, joined,
      missingHistoricalEventIds: historical.rows.filter(row => !receipts.some(receipt => receipt.eventId === row.eventId)).map(row => row.eventId),
      original654EmploymentSha256: historical.employmentDigest, original654TakesSha256: historical.takesDigest,
      employmentTakesAuthority: 'Current test pins already incorporate771 repricing;654 older employment/take hashes are not current expectations',
      fullHistoricalNonterminalArray: 'UNAVAILABLE;654 prefixDigest is terminal-only, not an all-receipt prefix' },
    appendedReceipts, terminalRows, promiseOutcomes: outcomeRows, workChanges, occupancy211212, lifecycleChanges,
    finalLifecycleForOutcomePeople: state === null ? null : { records: state.careerLifecycle.records.filter(row => people.has(row.personId)),
      changes: state.careerLifecycle.professionChanges.filter(row => people.has(row.personId)),
      finality: state.careerLifecycle.industryRetirements.filter(row => people.has(row.personId)) },
    limits: { resultBytes: JSON_CAP, stdoutBytes: STDOUT_CAP, extraTicks: 0, extraActions: 0, variants: 1 },
    coverage: ['One current trajectory; no historical engine, alternate seed, funding or retry',
      'Original-order complete arrays retained; canonical receipt hash is only an additional diagnostic',
      'New work is observed at returned weekly boundaries; production Writer credit is not occupancy',
      'No full historical nonterminal array exists in654; no field-level historical difference is invented',
      'COLLECTED means bounded collection/guards, not a passed regression or an authorized new expected pin'] }
  const output = JSON.stringify(result, null, 2) + '\n'
  let artifactFailure: string | null = null
  try { assert.ok(Buffer.byteLength(output) <= JSON_CAP, '16MiB result cap; no truncation'); writeFileSync(outputPath, output, { flag: 'wx' }) }
  catch (error) { artifactFailure = errorText(error) }
  const summary = JSON.stringify({ marker: complete && artifactFailure === null ? 'C3_B5_ATTRIBUTION_COLLECTED' : 'C3_B5_ATTRIBUTION_STOPPED',
    output: OUTPUT, outputBytes: Buffer.byteLength(output), outputSha256: artifactFailure === null ? sha(output) : null,
    attemptedTicks: attempted, completedTicks: completed, arrivedWeek: state?.market.tick ?? null,
    comparisons, lawChecks, firstFailure, guardFailure, artifactFailure,
    regressionStatus: result.originalRegressionStatus, historicalNonterminalRowsAvailable: false })
  assert.ok(Buffer.byteLength(summary) <= STDOUT_CAP)
  console.log(summary)
  if (!complete || artifactFailure !== null) process.exitCode = 1
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main().catch(error => { console.error(JSON.stringify({ marker: 'C3_B5_ATTRIBUTION_PRECONDITION_FAILURE', message: errorText(error) })); process.exitCode = 1 })
}
