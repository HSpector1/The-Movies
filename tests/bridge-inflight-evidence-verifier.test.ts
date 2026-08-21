import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import {
  PROTOCOL_VERSION,
  SCHEMA_ID,
  type ControlEnvelope,
  type SubmitIntentCommand,
} from '../bridge/protocol.ts'
import {
  decodeBridgeRuntimeCheckpoint,
  encodeBridgeRuntimeCheckpoint,
  type BridgeRuntimeJournalRoute,
} from '../bridge/runtime-checkpoint.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import {
  BridgeInFlightEvidenceError,
  verifyBridgeInFlightEvidence,
} from '../bridge/testing/in-flight-evidence-verifier.ts'
import { BridgeSession, createBridgeInitialState } from '../bridge/session.ts'

type MarkerRecord = Record<string, unknown>

type FixtureReport = {
  runtimeInstanceId: string
  initialRuntimeInstanceId: string
  schemaVersion: number
  status: string
  failure: string
  sessionId: string
  finalRevision: number
  finalWeek: number
  finalDigest: string
  savedDigest: string
  restoredDigest: string
  inFlightRecoveryComplete: boolean
  inFlightInitialSessionId: string
  inFlightInitialRevision: number
  inFlightInitialDigest: string
  inFlightExpectedFinalRevision: number
  inFlightRuntimeReplacements: number
  inFlightTransportOutages: number
  inFlightRetryCount: number
  inFlightRecoveredCount: number
  engineOutageObserved: boolean
  actionsDisabledDuringOutage: boolean
  lastProjectionRetainedDuringOutage: boolean
  engineRestartDetected: boolean
  authorityStableAcrossRestart: boolean
  tornReadCount: number
  recoveredPosts: Array<{
    route: string
    commandId: string
    requestSha256: string
    responseSha256: string
    revisionBefore: number
    revisionAfter: number
    digestBefore: string
    digestAfter: string
  }>
}

type EvidenceFixture = {
  root: string
  report: FixtureReport
  postCommit: Record<BridgeRuntimeJournalRoute, MarkerRecord>
  replay: Record<BridgeRuntimeJournalRoute, MarkerRecord>
  logPaths: Record<'command' | 'save' | 'load' | 'final', string>
  write: () => void
}

const temporaryRoots: string[] = []
const postCommitPrefix = '[bridge:test] post-commit '
const replayPrefix = '[bridge:test] replay '

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

function sha256Utf8(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

function accepted<Response extends { accepted: boolean; message: string }>(response: Response): Response {
  if (!response.accepted) throw new Error(`Fixture operation was rejected: ${response.message}`)
  return response
}

function makeFixture(extraJournalEntry = false): EvidenceFixture {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'project-studio-inflight-evidence-'))
  temporaryRoots.push(root)
  const logs = path.join(root, 'logs')
  const runtime = path.join(root, 'runtime')
  fs.mkdirSync(logs)
  fs.mkdirSync(runtime)

  const sessionId = 'inflight-evidence-session'
  const session = new BridgeSession(createBridgeInitialState('inflight-evidence'), sessionId)
  const initial = session.snapshot()
  const intent = initial.availableIntents[0]
  if (intent === undefined) throw new Error('Fixture has no legal intent.')

  const commandId = 'inflight-evidence-command'
  const commandRequest: SubmitIntentCommand = {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId,
    commandId,
    expectedStateRevision: initial.stateRevision,
    type: 'submitIntent',
    payload: { intentId: intent.intentId },
  }
  const commandResponse = accepted(session.command(commandRequest))
  const afterCommand = session.snapshot()

  const saveId = 'inflight-evidence-save'
  const saveRequest: ControlEnvelope = {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId,
    commandId: saveId,
    expectedStateRevision: afterCommand.stateRevision,
  }
  const saveResponse = accepted(session.save(saveRequest))

  const loadId = 'inflight-evidence-load'
  const loadRequest: ControlEnvelope = {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId,
    commandId: loadId,
    expectedStateRevision: afterCommand.stateRevision,
  }
  const loadResponse = accepted(session.load(loadRequest))
  const final = session.snapshot()

  if (extraJournalEntry) {
    accepted(session.save({
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId,
      commandId: 'inflight-evidence-extra-save',
      expectedStateRevision: final.stateRevision,
    }))
  }

  const checkpointText = encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint())
  const checkpoint = decodeBridgeRuntimeCheckpoint(checkpointText).checkpoint
  const entries = Object.fromEntries(checkpoint.journal.slice(0, 3).map((entry) => [entry.route, entry])) as
    Record<BridgeRuntimeJournalRoute, typeof checkpoint.journal[number]>
  const responses = {
    command: commandResponse,
    save: saveResponse,
    load: loadResponse,
  }
  const ids = { command: commandId, save: saveId, load: loadId }

  const makePostCommit = (route: BridgeRuntimeJournalRoute): MarkerRecord => {
    const entry = entries[route]
    const response = responses[route]
    return {
      action: 'hold',
      commandId: ids[route],
      committedSessionId: sessionId,
      committedStateDigest: response.stateDigest,
      committedStateRevision: response.stateRevision,
      event: 'post-commit-response',
      nonce: `nonce-${route}`,
      requestUtf8Sha256: sha256Utf8(entry.requestJson),
      responseJsonSha256: sha256Utf8(entry.responseJson),
      route,
      version: 1,
    }
  }
  const postCommit: Record<BridgeRuntimeJournalRoute, MarkerRecord> = {
    command: makePostCommit('command'),
    save: makePostCommit('save'),
    load: makePostCommit('load'),
  }

  const makeReplay = (route: BridgeRuntimeJournalRoute): MarkerRecord => ({
      commandId: ids[route],
      event: 'post-commit-replay',
      requestUtf8Sha256: postCommit[route]['requestUtf8Sha256'],
      responseJsonSha256: postCommit[route]['responseJsonSha256'],
      route,
      version: 1,
    })
  const replay: Record<BridgeRuntimeJournalRoute, MarkerRecord> = {
    command: makeReplay('command'),
    save: makeReplay('save'),
    load: makeReplay('load'),
  }

  const report: FixtureReport = {
    runtimeInstanceId: 'runtime-final',
    initialRuntimeInstanceId: 'runtime-initial',
    schemaVersion: 5,
    status: 'complete',
    failure: '',
    sessionId,
    finalRevision: final.stateRevision,
    finalWeek: final.gameWeek,
    finalDigest: final.stateDigest,
    savedDigest: final.stateDigest,
    restoredDigest: final.stateDigest,
    inFlightRecoveryComplete: true,
    inFlightInitialSessionId: sessionId,
    inFlightInitialRevision: initial.stateRevision,
    inFlightInitialDigest: initial.stateDigest,
    inFlightExpectedFinalRevision: initial.stateRevision + 2,
    inFlightRuntimeReplacements: 3,
    inFlightTransportOutages: 3,
    inFlightRetryCount: 3,
    inFlightRecoveredCount: 3,
    engineOutageObserved: true,
    actionsDisabledDuringOutage: true,
    lastProjectionRetainedDuringOutage: true,
    engineRestartDetected: true,
    authorityStableAcrossRestart: true,
    tornReadCount: 0,
    recoveredPosts: (['command', 'save', 'load'] as const).map((route) => ({
      route: `/${route}`,
      commandId: ids[route],
      requestSha256: postCommit[route]['requestUtf8Sha256'] as string,
      responseSha256: postCommit[route]['responseJsonSha256'] as string,
      revisionBefore: route === 'command' ? initial.stateRevision : initial.stateRevision + 1,
      revisionAfter: route === 'load' ? initial.stateRevision + 2 : initial.stateRevision + 1,
      digestBefore: route === 'command' ? initial.stateDigest : final.stateDigest,
      digestAfter: final.stateDigest,
    })),
  }

  const logPaths = {
    command: path.join(logs, 'bridge-1-command-hold.log'),
    save: path.join(logs, 'bridge-2-save-hold.log'),
    load: path.join(logs, 'bridge-3-load-hold.log'),
    final: path.join(logs, 'bridge-4-final-replay.log'),
  }
  const write = (): void => {
    fs.writeFileSync(path.join(root, 'bridge-inflight-recovery-proof.json'), JSON.stringify(report, null, 2))
    fs.writeFileSync(path.join(runtime, 'bridge-runtime-v1.json'), checkpointText)
    fs.writeFileSync(
      logPaths.command,
      `${postCommitPrefix}${canonicalJson(postCommit.command)}\n`,
    )
    fs.writeFileSync(
      logPaths.save,
      `${replayPrefix}${canonicalJson(replay.command)}\n` +
        `${postCommitPrefix}${canonicalJson(postCommit.save)}\n`,
    )
    fs.writeFileSync(
      logPaths.load,
      `${replayPrefix}${canonicalJson(replay.save)}\n` +
        `${postCommitPrefix}${canonicalJson(postCommit.load)}\n`,
    )
    fs.writeFileSync(logPaths.final, `${replayPrefix}${canonicalJson(replay.load)}\n`)
  }
  const fixture = { root, report, postCommit, replay, logPaths, write }
  fixture.write()
  return fixture
}

describe('bridge in-flight native evidence verifier', () => {
  it('binds exactly three Unity receipts to commit markers, replay bytes, and the checkpoint', () => {
    const fixture = makeFixture()
    const result = verifyBridgeInFlightEvidence(fixture.root)

    expect(result).toMatchObject({
      event: 'bridge-inflight-evidence-verified',
      finalStateDigest: fixture.report.finalDigest,
      finalStateRevision: fixture.report.finalRevision,
      journalEntries: 3,
      postCommitMarkers: 3,
      replayMarkers: 3,
      sessionId: fixture.report.sessionId,
      version: 1,
    })
    expect(result.recoveredPosts.map((post) => post.route)).toEqual(['command', 'save', 'load'])
    expect(canonicalJson(result)).not.toContain(fixture.root)
  })

  it('rejects a byte-different semantic retry even when command identity still matches', () => {
    const fixture = makeFixture()
    fixture.replay.command['requestUtf8Sha256'] = 'f'.repeat(64)
    fixture.write()

    expect(() => verifyBridgeInFlightEvidence(fixture.root)).toThrow(/exact byte digest/)
  })

  it('rejects response hashes forged consistently by both marker producers and Unity', () => {
    const fixture = makeFixture()
    const forged = 'e'.repeat(64)
    fixture.postCommit.save['responseJsonSha256'] = forged
    fixture.replay.save['responseJsonSha256'] = forged
    const save = fixture.report.recoveredPosts.find((post) => post.route === '/save')
    if (save === undefined) throw new Error('Fixture omitted save proof.')
    save.responseSha256 = forged
    fixture.write()

    expect(() => verifyBridgeInFlightEvidence(fixture.root)).toThrow(/exact byte digest/)
  })

  it('rejects duplicate, missing, and extra-schema markers', () => {
    const duplicate = makeFixture()
    fs.appendFileSync(
      duplicate.logPaths.final,
      `${replayPrefix}${canonicalJson(duplicate.replay.load)}\n`,
    )
    expect(() => verifyBridgeInFlightEvidence(duplicate.root)).toThrow(/exactly three replay markers/)

    const missing = makeFixture()
    fs.writeFileSync(missing.logPaths.command, '[bridge] ordinary log line\n')
    expect(() => verifyBridgeInFlightEvidence(missing.root)).toThrow(/exactly three post-commit markers/)

    const extraSchema = makeFixture()
    fs.writeFileSync(
      extraSchema.logPaths.final,
      `${replayPrefix}${canonicalJson({ ...extraSchema.replay.load, leaked: true })}\n`,
    )
    expect(() => verifyBridgeInFlightEvidence(extraSchema.root)).toThrow(/exact closed schema/)
  })

  it('rejects noncanonical and incomplete marker lines', () => {
    const noncanonical = makeFixture()
    const encoded = canonicalJson(noncanonical.replay.load).replace('{', '{ ')
    fs.writeFileSync(noncanonical.logPaths.final, `${replayPrefix}${encoded}\n`)
    expect(() => verifyBridgeInFlightEvidence(noncanonical.root)).toThrow(/canonical JSON/)

    const incomplete = makeFixture()
    fs.writeFileSync(
      incomplete.logPaths.final,
      `${replayPrefix}${canonicalJson(incomplete.replay.load)}`,
    )
    expect(() => verifyBridgeInFlightEvidence(incomplete.root)).toThrow(/not newline-complete/)
  })

  it('rejects duplicate Unity routes and incomplete report counts', () => {
    const duplicate = makeFixture()
    duplicate.report.recoveredPosts[1]!.route = '/command'
    duplicate.write()
    expect(() => verifyBridgeInFlightEvidence(duplicate.root)).toThrow(/duplicates route command/)

    const incomplete = makeFixture()
    incomplete.report.inFlightRecoveredCount = 2
    incomplete.write()
    expect(() => verifyBridgeInFlightEvidence(incomplete.root)).toThrow(/counts are incomplete/)
  })

  it('rejects extra durable journal authority and a mismatched final checkpoint digest', () => {
    const extraJournal = makeFixture(true)
    expect(() => verifyBridgeInFlightEvidence(extraJournal.root)).toThrow(/exactly three journal entries/)

    const wrongAuthority = makeFixture()
    wrongAuthority.report.finalDigest = 'd'.repeat(64)
    wrongAuthority.write()
    expect(() => verifyBridgeInFlightEvidence(wrongAuthority.root)).toThrow(
      /final, saved, and restored digests must match exactly/,
    )
  })

  it('uses a dedicated fail-closed error without embedding the evidence root', () => {
    const fixture = makeFixture()
    fixture.report.status = 'complete-ish'
    fixture.write()

    let observed: unknown
    try {
      verifyBridgeInFlightEvidence(fixture.root)
    } catch (error) {
      observed = error
    }
    expect(observed).toBeInstanceOf(BridgeInFlightEvidenceError)
    expect((observed as Error).message).not.toContain(fixture.root)
  })
})
