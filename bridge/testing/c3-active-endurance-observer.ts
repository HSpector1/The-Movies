// Current53 endurance observations. No gameplay; caller owns policy and output.
import assert from 'node:assert/strict'
import { createHash, randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'
import { performance } from 'node:perf_hooks'
import type {
  ByteIdentity, ObservationTiming, ObservationFailure,
  ReadObservationRequest, ReadObservationResult,
  RuntimeObservationRequest, RuntimeObservationResult,
} from '../../docs/engineering/playability-launch-review/evidence/p14b4-20260919/1052-c3-active-endurance-driver.ts'
import { BridgeSession } from '../session.ts'
import { PROTOCOL_VERSION, PROJECTION_VERSION, SCHEMA_ID, type ControlEnvelope } from '../protocol.ts'
import { BRIDGE_SCHEMA, type CampaignRequest, type BridgeMarketPage } from '../schema/bridge-schema.ts'
import { parseWireValue } from '../schema/runtime.ts'
import { canonicalJson } from '../schema/canonical.ts'
import { peopleProjection } from '../people.ts'
import { marketPage, MARKET_CLOSED_PAGE_SIZE, MARKET_HISTORY_PAGE_SIZE } from '../market.ts'
import type { IndustryQuery, IndustryPage } from '../schema/industry-schema.ts'
import { studioCalendar } from '../../src/core/studioCalendar.ts'
import { exportSave, makeSave, validateSaveV38 } from '../../src/core/save.ts'
import {
  DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS as DEFAULT_LIMITS,
  loadBridgeRuntimeCheckpoint, type BridgeRuntimeJournalEntryV1,
} from '../runtime-checkpoint.ts'
import { openBridgeCheckpointStore, type BridgeCheckpointStore } from '../runtime/checkpoint-store.ts'
import { CAMPAIGN_LIBRARY_MAX_BYTES, CAMPAIGN_LIBRARY_MAX_RECORDS,
  loadCampaignLibrary, encodeCampaignLibrary } from '../runtime/campaign-library.ts'
import { createBridgeRuntimeCoordinator, type BridgeRuntimeCoordinator,
  type BridgeRuntimeDispatchResult } from '../runtime/runtime-coordinator.ts'

const CURRENT_SCHEMA = 'sha256:d59e144e4077f669804ca87dd6184ef23bd44c9d93e44eb795f2b66350926a4d'
const COMPACT_LIMIT = 256 * 1024
const textIdentity = (text: string): ByteIdentity => ({
  bytes: Buffer.byteLength(text, 'utf8'), sha256: createHash('sha256').update(text).digest('hex'),
})
const jsonIdentity = (value: unknown): ByteIdentity => textIdentity(canonicalJson(value))
const shortError = (error: unknown) => (error instanceof Error ? error.message : String(error)).split('\n')[0]!.slice(0, 1000)
const cmp = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0
function assertInput(saveJson: string, saveSha256: string, week: number): void {
  assert.equal(PROTOCOL_VERSION, 4); assert.equal(PROJECTION_VERSION, 53); assert.equal(SCHEMA_ID, CURRENT_SCHEMA)
  assert.equal(textIdentity(saveJson).sha256, saveSha256, 'captured complete-save SHA')
  const admitted = validateSaveV38(JSON.parse(saveJson))
  assert.equal(admitted.state.market.tick, week)
  assert.ok(exportSave(admitted) === saveJson, 'observer requires canonical current38 bytes')
  assert.ok(admitted.state.hollywood, 'endurance requires actual Hollywood authority')
}
function assertCompact(value: unknown): void {
  assert.ok(Buffer.byteLength(JSON.stringify(value), 'utf8') <= COMPACT_LIMIT, 'observer compact result exceeds256KiB')
}
function noPrivateCareer(value: unknown): void {
  const keys = new Set(['inputs', 'inputsDigest', 'actingWitnesses', 'contextWitness', 'witnesses',
    'ceilings', 'magnitude', 'annualSalary', 'signingBonus'])
  const walk = (part: unknown): void => {
    if (!part || typeof part !== 'object') return
    if (Array.isArray(part)) { part.forEach(walk); return }
    for (const [key, child] of Object.entries(part)) {
      assert.ok(!keys.has(key), 'private career key: ' + key); walk(child)
    }
  }
  walk(value)
}
function marketPrivacy(value: BridgeMarketPage, viewerStudioId: string): void {
  if (!value.selected) return
  for (const proposal of value.selected.comparison) {
    if (proposal.issuerStudioId !== viewerStudioId) {
      assert.equal(proposal.disclosure, 'undisclosed')
      assert.equal(proposal.annualSalary, 'UNKNOWN'); assert.equal(proposal.signingBonus, 'UNKNOWN')
      assert.equal(proposal.premiumTier, 'UNKNOWN'); assert.equal(proposal.promise, 'UNKNOWN')
    }
  }
  for (const employer of value.selected.history.employers) if (employer.studioId !== viewerStudioId) {
    assert.equal(employer.own, false)
    assert.equal(Object.hasOwn(employer, 'annualSalary'), false)
    assert.equal(Object.hasOwn(employer, 'signingBonus'), false)
  }
}

export function observeC3EnduranceReads(request: ReadObservationRequest): ReadObservationResult {
  const input = textIdentity(request.saveJson)
  const counts = { snapshots: 0, people: 0, calendars: 0, industry: 0, market: 0, profilesChecked: 0 }
  const reads: Array<ReadObservationResult['reads'][number]> = []
  const timings: ObservationTiming[] = []
  let failure: ObservationFailure | null = null, phase = 'input', isolatedAfter: ByteIdentity | null = null
  let privacyChecks = 0, schemaChecks = 0
  const measured = <T>(name: string, fn: () => T): T => {
    phase = name; assert.ok(timings.length < 64)
    const began = performance.now()
    try { return fn() } finally { timings.push({ phase: name, kind: 'inspection', elapsedMs: performance.now() - began }) }
  }
  const reserve = (key: keyof typeof counts, cap: number) => { assert.ok(counts[key] < cap, key + ' bound'); counts[key]++ }
  const record = (key: string, surface: string, value: unknown, elapsedMs: number,
    extra: Partial<ReadObservationResult['reads'][number]> = {}) => {
    assert.ok(reads.length < 28, 'projection-call record bound')
    reads.push({ key, surface, targetId: null, page: null, pageSize: null, totalRows: null,
      pageCount: null, rows: 0, repeated: false, identity: jsonIdentity(value), elapsedMs, ...extra })
  }
  try {
    measured('strict-input', () => assertInput(request.saveJson, request.saveSha256, request.week))
    assert.ok(request.focusPersonIds.length <= 2)
    assert.equal(new Set(request.focusPersonIds).size, request.focusPersonIds.length)
    const session = measured('isolated-import', () => BridgeSession.fromSaveJson(request.saveJson))
    const state = session.gameState
    assert.ok(measured('isolated-before', () => exportSave(makeSave(state))) === request.saveJson)
    const assertReadBoundary = (name: string): void => {
      const after = measured('isolated-after/' + name, () => exportSave(makeSave(state)))
      isolatedAfter = textIdentity(after)
      assert.ok(after === request.saveJson, 'complete isolated state unchanged after ' + name)
    }
    // One public discovery read establishes the finite query subjects in both orders.
    reserve('people', 1)
    const peopleAt = performance.now()
    const people = measured('public-people', () => peopleProjection(state))
    record('people', 'people', people, performance.now() - peopleAt, { rows: people.profiles.length })
    assertReadBoundary('public-discovery')
    const selected = [...request.focusPersonIds]
    for (const id of selected) assert.ok(people.profiles.some(p => p.talentId === id), 'supplied focus has a public profile')
    const ordered = [...people.profiles].sort((a, b) => cmp(a.talentId, b.talentId))
    for (const predicate of [
      (p: typeof ordered[number]) => p.professionCareer.professionRetirements.length > 0,
      (p: typeof ordered[number]) => p.employment.contract !== null,
    ]) {
      const next = ordered.find(p => !selected.includes(p.talentId) && predicate(p))
      if (next) selected.push(next.talentId)
    }
    assert.ok(selected.length <= 4)
    for (const id of selected) {
      reserve('profilesChecked', 4)
      const profile = people.profiles.find(p => p.talentId === id)!
      schemaChecks++; parseWireValue(BRIDGE_SCHEMA.$defs.StudioPersonProfileSnapshot, profile)
      noPrivateCareer(profile.professionCareer); privacyChecks++
    }
    const parity = request.ordinal % 2 === 0
    const query = (view: IndustryQuery['view'], key: string, targetId: string | null = null,
      extra: Partial<IndustryQuery> = {}): IndustryQuery => ({
      protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
      requestId: 'c3-read-' + request.ordinal + '-' + key, expectedStateRevision: session.stateRevision,
      type: 'industryQuery', view, targetId, page: 0, pageSize: 25, lane: 'recent', period: 'all', ...extra,
    })
    const base = [
      query('studios', 'studios', null, { lane: parity ? 'audienceAwareness' : 'output' }),
      query('alumni', 'alumni'),
      query('films', 'films', null, { lane: parity ? 'recent' : 'critics', period: parity ? 'all' : 'live' }),
      query('pulse', 'pulse'),
      query('history', 'history', state.hollywood!.playerStudioId, { period: parity ? 'all' : 'recent' }),
    ]
    const publicQueries = selected.slice(0, 2).flatMap((id, i) => [
      query('person', 'person-' + i, id), query('employment', 'employment-' + i, id),
    ])
    const industryRead = (q: IndustryQuery, repeated = false): IndustryPage => {
      reserve('industry', 18)
      const at = performance.now()
      const page = measured('industry/' + q.view + '/' + q.page + (repeated ? '/repeat' : ''), () => session.industry(q))
      assert.ok('type' in page && page.type === 'industryPage', 'Industry query returns an industryPage')
      schemaChecks++; parseWireValue(BRIDGE_SCHEMA.$defs.StudioIndustryResponse, page)
      const rows = q.view === 'studios' ? page.studios : q.view === 'alumni' ? page.people
        : q.view === 'films' || q.view === 'person' ? page.films : page.activities
      assert.ok(rows.length <= 25, 'sampled primary page bound')
      for (const row of page.activities) if (row.careerKind !== undefined) {
        noPrivateCareer(row); privacyChecks++
        assert.ok(row.week <= request.week && request.week - row.week < 13)
      }
      record(q.requestId + '/page' + q.page + (repeated ? '/repeat' : ''), 'industry/' + q.view, page,
        performance.now() - at, { targetId: q.targetId, page: q.page, pageSize: q.pageSize,
          pageCount: page.pageCount, totalRows: page.totalRows, rows: rows.length, repeated })
      return page
    }
    const marketRead = (id: string | null, page: number, historyPage: number): BridgeMarketPage => {
      reserve('market', 6)
      const at = performance.now()
      const value = measured('market/' + (id ?? 'closed') + '/' + page + '/' + historyPage,
        () => marketPage(state, { view: 'market', targetId: id, page, historyPage }))
      schemaChecks++; parseWireValue(BRIDGE_SCHEMA.$defs.StudioMarketPage, value)
      marketPrivacy(value, state.hollywood!.playerStudioId); privacyChecks++
      assert.equal(value.cases.closed.pageSize, MARKET_CLOSED_PAGE_SIZE)
      assert.ok(value.cases.closed.rows.length <= 20)
      if (value.selected) {
        assert.equal(value.selected.history.pageSize, MARKET_HISTORY_PAGE_SIZE)
        assert.ok(value.selected.history.employers.length <= 10)
      }
      const total = id === null ? value.cases.closed.total : value.selected?.history.total ?? 0
      const size = id === null ? 20 : 10
      record('market/' + (id ?? 'closed') + '/' + page + '/' + historyPage, 'market', value,
        performance.now() - at, { targetId: id, page: id === null ? page : historyPage,
          pageSize: size, pageCount: Math.ceil(total / size), totalRows: total,
          rows: id === null ? value.cases.closed.rows.length : value.selected?.history.employers.length ?? 0 })
      return value
    }
    const groups = [
      () => {
        let first: string | null = null
        for (let n = 0; n < 2; n++) {
          reserve('snapshots', 2); const at = performance.now()
          const value = measured('snapshot/' + n, () => session.snapshot())
          schemaChecks++; parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeSnapshotResponse, value)
          record('snapshot/' + n, 'snapshot', value, performance.now() - at, { repeated: n === 1 })
          const { serializationMs, ...metrics } = value.metrics
          assert.ok(Number.isFinite(serializationMs) && serializationMs >= 0, 'actual snapshot serialization timing')
          // Each invocation measures fresh telemetry; all other response fields
          // remain exact, including payloadBytes. Preserve raw identities above.
          const text = canonicalJson({ ...value, metrics })
          if (first === null) first = text
          else assert.ok(text === first, 'same-authority repeated snapshot exact fields except serializationMs')
        }
      },
      () => {
        reserve('calendars', 1); const at = performance.now()
        const value = measured('calendar', () => studioCalendar(state))
        const expected = [
          ...state.careerLifecycle.professionChanges.map(r => ({ id: r.id, week: r.week })),
          ...state.careerLifecycle.industryRetirements.map(r => ({ id: 'industry-retirement:' + JSON.stringify(r.personId), week: r.week })),
        ].filter(r => r.week <= request.week && request.week - r.week < 13)
          .sort((a, b) => b.week - a.week || cmp(a.id, b.id))
        assert.deepEqual(value.careerEvents.map(r => ({ id: r.eventId, week: r.week })), expected)
        value.careerEvents.forEach(row => { noPrivateCareer(row); privacyChecks++ })
        record('calendar', 'calendar', value, performance.now() - at, { rows: value.careerEvents.length })
      },
      () => {
        const descriptors = request.order === 'forward' ? base : [...base].reverse()
        for (const q of descriptors) {
          const first = industryRead(q)
          if (first.pageCount > 1) industryRead({ ...q, page: 1 })
          if (q.view !== 'studios') {
            const again = industryRead(q, true)
            assert.ok(canonicalJson(again) === canonicalJson(first), 'same Industry query exact repeat')
          }
        }
        for (const q of request.order === 'forward' ? publicQueries : [...publicQueries].reverse()) industryRead(q)
      },
      () => {
        const main = marketRead(null, 0, 0)
        if (main.cases.closed.total > 20) marketRead(null, 1, 0)
        const ids = selected.slice(0, 2)
        for (const id of request.order === 'forward' ? ids : [...ids].reverse()) {
          const first = marketRead(id, 0, 0)
          if (first.selected && first.selected.history.total > 10) marketRead(id, 0, 1)
        }
      },
    ]
    for (const [index, group] of (request.order === 'forward' ? groups : [...groups].reverse()).entries()) {
      group()
      assertReadBoundary('group-' + index)
    }
    const after = measured('isolated-after', () => exportSave(makeSave(state)))
    isolatedAfter = textIdentity(after)
    assert.ok(after === request.saveJson, 'complete isolated state unchanged by public reads')
  } catch (error) { failure = { phase, message: shortError(error) } }
  const result: ReadObservationResult = { status: failure === null ? 'PASS' : 'FAIL', failure,
    week: request.week, input, isolatedAfter, counts, reads, privacyChecks, schemaChecks, timings }
  try { assertCompact(result) } catch (error) {
    result.status = 'FAIL'; result.failure = { phase: 'compact-result', message: shortError(error) }
  }
  return result
}

export async function observeC3EnduranceRuntime(request: RuntimeObservationRequest): Promise<RuntimeObservationResult> {
  const input = textIdentity(request.saveJson), timings: ObservationTiming[] = []
  const boundaries: Array<RuntimeObservationResult['boundaries'][number]> = []
  const requests: Array<RuntimeObservationResult['requests'][number]> = []
  const storeCounts = { reads: 0, writes: 0, closes: 0, readMs: 0, writeMs: 0, closeMs: 0 }
  let phase = 'input', failure: ObservationFailure | null = null, cleanupFailure: string | null = null
  let dispatchAttempts = 0, firstSeen = 0, replayed = 0, campaignAttempts = 0, reopenCount = 0
  let rolloverCount = 0, freshSessionCalls = 0
  let runtime: BridgeRuntimeCoordinator | null = null, store: BridgeCheckpointStore | null = null
  let storeOpen = false
  const activeRuntime = (): BridgeRuntimeCoordinator => { assert.ok(runtime); return runtime }
  const activeStore = (): BridgeCheckpointStore => { assert.ok(store); return store }
  let expectedJournal: BridgeRuntimeJournalEntryV1[] = []
  const fatalErrors: string[] = []
  const decoded = new Map<string, ReturnType<typeof loadCampaignLibrary>>()
  const checkpoints = new Map<string, ReturnType<typeof loadBridgeRuntimeCheckpoint>>()
  const checkpoint = (raw: string) => {
    const old = checkpoints.get(raw)
    if (old) return old
    const value = loadBridgeRuntimeCheckpoint(raw, DEFAULT_LIMITS)
    checkpoints.set(raw, value); return value
  }
  const measured = async <T>(name: string, kind: ObservationTiming['kind'], fn: () => T | Promise<T>): Promise<T> => {
    phase = name; assert.ok(timings.length < 64, 'runtime timing bound')
    const began = performance.now()
    try { return await fn() } finally { timings.push({ phase: name, kind, elapsedMs: performance.now() - began }) }
  }
  const wrappedStore = (real: BridgeCheckpointStore): BridgeCheckpointStore => ({
    checkpointPath: real.checkpointPath,
    async read() {
      storeCounts.reads++; const began = performance.now()
      try { return await real.read() } finally { storeCounts.readMs += performance.now() - began }
    },
    async writeAtomic(text) {
      assert.ok(Buffer.byteLength(text, 'utf8') <= CAMPAIGN_LIBRARY_MAX_BYTES)
      storeCounts.writes++; const began = performance.now()
      try { await real.writeAtomic(text) } finally { storeCounts.writeMs += performance.now() - began }
    },
    async close() {
      storeCounts.closes++; const began = performance.now()
      try { await real.close(); storeOpen = false } finally { storeCounts.closeMs += performance.now() - began }
    },
  })
  const open = async () => {
    const real = await openBridgeCheckpointStore(request.checkpointPath,
      { runtimeRoot: request.runtimeRoot, maxBytes: CAMPAIGN_LIBRARY_MAX_BYTES })
    storeOpen = true; store = wrappedStore(real)
    runtime = await createBridgeRuntimeCoordinator({
      store, campaigns: { durable: true, regime: 'endowed' },
      fatal: error => { fatalErrors.push(shortError(error)) },
      createFreshSession: limits => {
        freshSessionCalls++; assert.equal(freshSessionCalls, 1, 'restart cannot fall back to fresh campaign')
        assert.deepEqual(limits, DEFAULT_LIMITS)
        return BridgeSession.fromSaveJson(request.saveJson, undefined, limits)
      },
    })
  }
  const boundary = async (label: string) => {
    assert.ok(store); assert.ok(boundaries.length < 12, 'runtime boundary bound')
    const raw = await store.read(); assert.ok(raw, 'actual stored library required')
    let loaded = decoded.get(raw)
    if (!loaded) {
      loaded = await measured(label + '/decode-library', 'inspection', () => loadCampaignLibrary(raw, DEFAULT_LIMITS))
      assert.equal(loaded.changed, false, 'current sample must reopen without migration')
      const reencoded = await measured(label + '/actual-encode-library', 'inspection',
        () => encodeCampaignLibrary(loaded!.library))
      assert.ok(reencoded === raw, 'actual compressed library round trip is exact')
      decoded.set(raw, loaded)
    }
    const library = loaded.library
    const cells = [library.workingCheckpointJson, ...library.records.map(r => r.checkpointJson),
      ...(library.legacyCheckpointJson === null ? [] : [library.legacyCheckpointJson])]
    const packed = JSON.parse(raw) as { libraryVersion: number; workingCheckpointJson: { decodedBytes: number; sha256: string };
      records: Array<{ checkpointJson: { decodedBytes: number; sha256: string } }>;
      legacyCheckpointJson: { decodedBytes: number; sha256: string } | null }
    assert.equal(packed.libraryVersion, 2)
    const packedCells = [packed.workingCheckpointJson, ...packed.records.map(r => r.checkpointJson),
      ...(packed.legacyCheckpointJson === null ? [] : [packed.legacyCheckpointJson])]
    assert.equal(cells.length, packedCells.length)
    let decodedCellsBytes = 0
    for (let i = 0; i < cells.length; i++) {
      const id = textIdentity(cells[i]!); decodedCellsBytes += id.bytes
      assert.equal(packedCells[i]!.decodedBytes, id.bytes)
      assert.equal(packedCells[i]!.sha256, id.sha256)
      const accepted = checkpoint(cells[i]!)
      assert.equal(accepted.migratedFromProtocolVersion, null)
      assert.ok(accepted.hydrated.checkpoint.currentSaveJson === request.saveJson, 'complete sampled current bytes')
      assert.ok(accepted.hydrated.checkpoint.savedSaveJson === request.saveJson, 'complete sampled explicit-save bytes')
      assert.equal(accepted.hydrated.currentSave.state.market.tick, request.week)
      assert.equal(accepted.hydrated.savedSave?.state.market.tick, request.week)
    }
    assert.ok(decodedCellsBytes <= 1024 * 1024 * 1024)
    const working = checkpoint(library.workingCheckpointJson).hydrated.checkpoint
    assert.deepEqual(working.journal, expectedJournal, 'actual journal ordered request/response text')
    const journalBytes = working.journal.reduce((n, row) => n + Buffer.byteLength(canonicalJson(row), 'utf8'), 0)
    assert.ok(journalBytes <= DEFAULT_LIMITS.maxJournalBytes)
    assert.ok(working.journal.length <= DEFAULT_LIMITS.maxJournalEntries)
    assert.equal(fatalErrors.length, 0, 'runtime fatal callback')
    boundaries.push({ phase: label, encodedLibrary: textIdentity(raw), decodedCellsBytes,
      workingCheckpoint: textIdentity(library.workingCheckpointJson),
      currentSave: textIdentity(working.currentSaveJson),
      savedSave: working.savedSaveJson === null ? null : textIdentity(working.savedSaveJson),
      journalEntries: working.journal.length, journalBytes, recordCount: library.records.length,
      receiptCount: library.receipts.length, sessionId: working.sessionId, revision: working.stateRevision })
    return { raw, library, working }
  }
  const control = async (): Promise<ControlEnvelope> => {
    assert.ok(runtime)
    return runtime.read(session => ({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
      sessionId: session.sessionId, expectedStateRevision: session.stateRevision, commandId: randomUUID() }))
  }
  const oneDispatch = async (route: 'save' | 'load', envelope: ControlEnvelope, label: string) => {
    assert.ok(runtime); assert.ok(dispatchAttempts < 8, 'eight actual runtime attempts maximum'); dispatchAttempts++
    const reply = await measured<BridgeRuntimeDispatchResult>(label, 'operation', () => route === 'save'
      ? runtime!.dispatch('save', envelope) : runtime!.dispatch('load', envelope))
    if (reply.firstSeen) firstSeen++
    else if (!reply.sessionRolledOver && reply.response.accepted) replayed++
    requests.push({ phase: label, route, commandId: envelope.commandId, accepted: reply.response.accepted,
      firstSeen: reply.firstSeen, rolledOver: reply.sessionRolledOver === true,
      request: jsonIdentity(envelope), response: textIdentity(reply.responseJson) })
    if (reply.sessionRolledOver) {
      rolloverCount++; assert.ok(rolloverCount <= 1, 'at most one actual rollover/retry')
      assert.equal(reply.response.accepted, false); assert.equal(reply.firstSeen, false)
      expectedJournal = []
      const after = await boundary(label + '/rollover')
      assert.notEqual(after.working.sessionId, envelope.sessionId)
      assert.equal(after.working.stateRevision, 0)
      assert.equal(after.working.journal.length, 0)
    } else if (reply.response.accepted && reply.firstSeen) {
      expectedJournal.push({ route, commandId: envelope.commandId,
        requestJson: canonicalJson(envelope), responseJson: reply.responseJson })
    }
    return reply
  }
  const freshDispatch = async (route: 'save' | 'load', label: string) => {
    let envelope = await control()
    let reply = await oneDispatch(route, envelope, label)
    if (reply.sessionRolledOver) {
      envelope = await control(); reply = await oneDispatch(route, envelope, label + '/one-retry')
      assert.equal(reply.sessionRolledOver, undefined, 'second rollover is outside sampled bound')
    }
    assert.equal(reply.response.accepted, true, label + ' accepted'); assert.equal(reply.firstSeen, true)
    return { envelope, reply }
  }
  try {
    await measured('strict-input', 'inspection', () => assertInput(request.saveJson, request.saveSha256, request.week))
    assert.equal(request.variant, 'A'); assert.ok([0, 3120, 6240].includes(request.week))
    assert.ok(isAbsolute(request.runtimeRoot) && isAbsolute(request.checkpointPath), 'absolute isolated paths required')
    const local = relative(resolve(request.runtimeRoot), resolve(request.checkpointPath))
    assert.ok(local.length > 0 && !local.startsWith('..') && !isAbsolute(local), 'sample below its exclusive root')
    assert.equal(existsSync(request.checkpointPath), false, 'refuse an existing sample artifact')
    await measured('coordinator-initialize', 'operation', open)
    await boundary('initialized')
    const catalogue = await activeRuntime().campaignLibrary(); assert.ok(catalogue)
    const saveAs: CampaignRequest = { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, type: 'campaign',
      commandId: randomUUID(), sessionId: catalogue.sessionId, expectedStateRevision: catalogue.stateRevision,
      expectedCatalogueRevision: catalogue.catalogueRevision, expectedActiveCampaignId: catalogue.activeCampaignId,
      operation: 'saveAs', campaignId: null, label: 'C3 endurance sample ' + request.week,
      overwriteCampaignId: null, confirmDestructive: false, unsavedDisposition: 'requireClean' }
    assert.equal(campaignAttempts, 0); campaignAttempts++
    const created = await measured('save-As-sample', 'operation', () => activeRuntime().campaign(saveAs))
    assert.equal(created.accepted, true)
    const saved = await boundary('sample-saved')
    assert.equal(saved.library.records.length, 1); assert.equal(saved.library.receipts.length, 1)
    assert.equal(saved.library.receipts[0]!.commandId, saveAs.commandId)
    assert.equal(saved.library.receipts[0]!.requestJson, canonicalJson(saveAs))
    assert.equal(canonicalJson(saved.library.receipts[0]!.response), canonicalJson(created))
    const recordId = saved.library.records[0]!.id
    assert.equal(saved.library.activeCampaignId, recordId)
    const s1 = await freshDispatch('save', 'Save-S1')
    const beforeReplay = await boundary('after-S1'), writes = storeCounts.writes
    const repeated = await oneDispatch('save', s1.envelope, 'Save-S1-exact-retry')
    assert.equal(repeated.response.accepted, true); assert.equal(repeated.firstSeen, false)
    assert.equal(repeated.sessionRolledOver, undefined)
    assert.ok(repeated.responseJson === s1.reply.responseJson, 'original exact response replay')
    assert.equal(storeCounts.writes, writes); assert.ok(await activeStore().read() === beforeReplay.raw)
    await freshDispatch('save', 'Save-S2')
    await boundary('after-S2')
    const l1 = await freshDispatch('load', 'Load-L1')
    const beforeClose = await boundary('before-close')
    assert.equal(beforeClose.library.records[0]!.id, recordId)
    await measured('close-before-reopen', 'operation', () => activeRuntime().close()); runtime = null
    assert.equal(storeOpen, false)
    assert.equal(reopenCount, 0); reopenCount++
    await measured('actual-disk-reopen', 'operation', open)
    const reopened = await boundary('reopened')
    assert.ok(reopened.raw === beforeClose.raw, 'current disk reopen preserves exact library bytes')
    assert.equal(reopened.working.sessionId, beforeClose.working.sessionId)
    assert.equal(reopened.library.activeCampaignId, recordId)
    assert.ok(reopened.library.records[0]!.checkpointJson === beforeClose.library.records[0]!.checkpointJson)
    const reopenedWrites = storeCounts.writes
    const replay = await oneDispatch('load', l1.envelope, 'Load-L1-replay-after-reopen')
    assert.equal(replay.response.accepted, true); assert.equal(replay.firstSeen, false)
    assert.equal(replay.sessionRolledOver, undefined)
    assert.ok(replay.responseJson === l1.reply.responseJson, 'reopened exact Load response')
    assert.equal(storeCounts.writes, reopenedWrites)
    const final = await boundary('final')
    assert.ok(final.raw === reopened.raw, 'replay leaves persisted library bytes exact')
    assert.equal(freshSessionCalls, 1); assert.equal(fatalErrors.length, 0)
    assert.equal(campaignAttempts, 1); assert.equal(reopenCount, 1)
    assert.ok(dispatchAttempts <= 8); assert.ok(boundaries.length <= 12)
    assert.equal(textIdentity(request.saveJson).sha256, request.saveSha256)
  } catch (error) { failure = { phase, message: shortError(error) } }
  finally {
    try {
      if (runtime) await measured('finally-close', 'operation', () => runtime!.close())
      else if (storeOpen && store) await measured('finally-store-close', 'operation', () => store!.close())
      assert.equal(storeOpen, false, 'actual store closed')
    } catch (error) { cleanupFailure = shortError(error) }
  }
  const result: RuntimeObservationResult = { status: failure === null && cleanupFailure === null ? 'PASS' : 'FAIL',
    failure, cleanupFailure, week: request.week, input, checkpointPath: request.checkpointPath,
    dispatchAttempts, firstSeen, replayed, campaignAttempts, reopenCount, rolloverCount, freshSessionCalls,
    actualTicks: 0, limits: { maxCheckpointBytes: DEFAULT_LIMITS.maxCheckpointBytes,
      maxJournalBytes: DEFAULT_LIMITS.maxJournalBytes, maxJournalEntries: DEFAULT_LIMITS.maxJournalEntries,
      maxLibraryBytes: CAMPAIGN_LIBRARY_MAX_BYTES, maxRecords: CAMPAIGN_LIBRARY_MAX_RECORDS,
      maxDecodedLibraryBytes: 1024 * 1024 * 1024 },
    boundaries, requests, store: storeCounts, timings }
  try { assertCompact(result) } catch (error) {
    result.status = 'FAIL'; result.failure = { phase: 'compact-result', message: shortError(error) }
  }
  return result
}
