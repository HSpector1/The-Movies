import { spawn, type ChildProcess } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { expect, it } from 'vitest'

import {
  PROTOCOL_VERSION,
  SCHEMA_ID,
  type ControlEnvelope,
  type SubmitIntentCommand,
} from '../bridge/protocol.ts'
import { decodeBridgeRuntimeCheckpoint } from '../bridge/runtime-checkpoint.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import {
  selectJourneyIntent,
  type CommandResponse,
  type SaveResponse,
  type SnapshotEnvelope,
} from '../bridge/session.ts'
import { exportSave } from '../src/core/index.js'

const ROOT = process.cwd()
const VITE_NODE = path.join(ROOT, 'node_modules', 'vite-node', 'vite-node.mjs')
const SERVER_ENTRY = path.join(ROOT, 'bridge', 'server.ts')
const STARTUP_TIMEOUT_MS = 20_000
const HTTP_TIMEOUT_MS = 10_000
const EXIT_TIMEOUT_MS = 10_000
const MAX_CAPTURED_LOG_BYTES = 1_000_000

type ProcessExit = {
  code: number | null
  signal: NodeJS.Signals | null
}

type CapturedLogs = {
  stdout: string
  stderr: string
}

type RunningBridge = {
  child: ChildProcess
  baseUrl: string
  capability: string
  logs: CapturedLogs
}

type RawHttpResponse = {
  status: number
  body: string
}

function appendBounded(previous: string, chunk: Buffer | string): string {
  const combined = previous + chunk.toString()
  if (Buffer.byteLength(combined, 'utf8') <= MAX_CAPTURED_LOG_BYTES) return combined
  return combined.slice(-MAX_CAPTURED_LOG_BYTES)
}

function diagnostics(label: string, bridge: RunningBridge | null): string {
  if (bridge === null) return `${label}: process was not started.`
  return [
    `${label}: pid=${String(bridge.child.pid ?? 'unknown')} exitCode=${String(bridge.child.exitCode)} ` +
      `signal=${String(bridge.child.signalCode)}`,
    `${label} stdout:\n${bridge.logs.stdout || '<empty>'}`,
    `${label} stderr:\n${bridge.logs.stderr || '<empty>'}`,
  ].join('\n')
}

function timeout<T>(promise: Promise<T>, milliseconds: number, message: () => string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message())), milliseconds)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error: unknown) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

function waitForExit(child: ChildProcess): Promise<ProcessExit> {
  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve({ code: child.exitCode, signal: child.signalCode })
  }
  return new Promise<ProcessExit>((resolve) => {
    child.once('exit', (code, signal) => resolve({ code, signal }))
  })
}

async function signalAndWait(
  bridge: RunningBridge,
  signal: NodeJS.Signals,
  milliseconds = EXIT_TIMEOUT_MS,
): Promise<ProcessExit> {
  const exiting = waitForExit(bridge.child)
  if (bridge.child.exitCode === null && bridge.child.signalCode === null) {
    if (!bridge.child.kill(signal)) {
      throw new Error(`Failed to send ${signal} to bridge pid ${String(bridge.child.pid)}.`)
    }
  }
  return timeout(
    exiting,
    milliseconds,
    () => `Bridge did not exit after ${signal}.\n${diagnostics('bridge', bridge)}`,
  )
}

async function cleanupBridge(bridge: RunningBridge | null): Promise<void> {
  if (bridge === null || bridge.child.exitCode !== null || bridge.child.signalCode !== null) return
  try {
    await signalAndWait(bridge, 'SIGTERM', 2_000)
  } catch {
    if (bridge.child.exitCode === null && bridge.child.signalCode === null) {
      bridge.child.kill('SIGKILL')
      try {
        await timeout(waitForExit(bridge.child), 2_000, () => 'Bridge cleanup timed out.')
      } catch {
        // The bounded test timeout will still terminate the owning Vitest worker.
      }
    }
  }
}

async function startBridge(runtimeDirectory: string, capability: string): Promise<RunningBridge> {
  const logs: CapturedLogs = { stdout: '', stderr: '' }
  const child = spawn(process.execPath, [VITE_NODE, SERVER_ENTRY], {
    cwd: ROOT,
    env: {
      ...process.env,
      NO_COLOR: '1',
      PROJECT_STUDIO_BRIDGE_CAPABILITY: capability,
      PROJECT_STUDIO_BRIDGE_PORT: '0',
      PROJECT_STUDIO_BRIDGE_RUNTIME_DIR: runtimeDirectory,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const bridge: RunningBridge = { child, baseUrl: '', capability, logs }

  const started = new Promise<number>((resolve, reject) => {
    let settled = false
    const finish = (operation: () => void): void => {
      if (settled) return
      settled = true
      child.off('error', onError)
      child.off('exit', onExit)
      operation()
    }
    const inspect = (): void => {
      const match = /\[bridge\] live http:\/\/127\.0\.0\.1:(\d+)/.exec(logs.stdout)
      if (match === null) return
      const port = Number(match[1])
      if (!Number.isSafeInteger(port) || port < 1 || port > 65_535) {
        finish(() => reject(new Error(`Bridge reported invalid port ${String(match[1])}.`)))
        return
      }
      finish(() => resolve(port))
    }
    const onError = (error: Error): void => finish(() => reject(error))
    const onExit = (code: number | null, signal: NodeJS.Signals | null): void => {
      finish(() => reject(new Error(
        `Bridge exited before startup (code=${String(code)}, signal=${String(signal)}).\n` +
          diagnostics('bridge', bridge),
      )))
    }
    child.on('error', onError)
    child.on('exit', onExit)
    child.stdout?.on('data', (chunk: Buffer) => {
      logs.stdout = appendBounded(logs.stdout, chunk)
      inspect()
    })
    child.stderr?.on('data', (chunk: Buffer) => {
      logs.stderr = appendBounded(logs.stderr, chunk)
    })
  })

  let port: number
  try {
    port = await timeout(
      started,
      STARTUP_TIMEOUT_MS,
      () => `Bridge startup timed out.\n${diagnostics('bridge', bridge)}`,
    )
  } catch (error) {
    await cleanupBridge(bridge)
    throw error
  }
  bridge.baseUrl = `http://127.0.0.1:${String(port)}`
  return bridge
}

async function request(
  bridge: RunningBridge,
  pathname: string,
  method: 'GET' | 'POST' = 'GET',
  body?: string,
): Promise<RawHttpResponse> {
  const abort = new AbortController()
  const timer = setTimeout(() => abort.abort(), HTTP_TIMEOUT_MS)
  try {
    const init: RequestInit = {
      headers: { 'x-project-studio-capability': bridge.capability },
      method,
      signal: abort.signal,
    }
    if (body !== undefined) {
      init.body = body
      init.headers = {
        ...init.headers,
        'content-type': 'application/json',
      }
    }
    const response = await fetch(`${bridge.baseUrl}${pathname}`, init)
    return { status: response.status, body: await response.text() }
  } catch (error) {
    throw new Error(
      `${method} ${pathname} failed: ${(error as Error).message}.\n${diagnostics('bridge', bridge)}`,
      { cause: error },
    )
  } finally {
    clearTimeout(timer)
  }
}

function parseJson<T>(response: RawHttpResponse): T {
  return JSON.parse(response.body) as T
}

async function snapshot(bridge: RunningBridge): Promise<SnapshotEnvelope> {
  const response = await request(bridge, '/snapshot')
  expect(response.status).toBe(200)
  return parseJson<SnapshotEnvelope>(response)
}

function journeyCommand(
  current: SnapshotEnvelope,
  commandId: string,
): { request: SubmitIntentCommand; body: string } {
  const intent = selectJourneyIntent(
    current.availableIntents.filter((candidate) => candidate.kind !== 'startConstruction'),
    current.snapshot.journeyNotices.firstFilmJourney,
  )
  if (intent === undefined) {
    throw new Error(`No Movie journey intent is available at revision ${String(current.stateRevision)}.`)
  }
  const request: SubmitIntentCommand = {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId: current.sessionId,
    commandId,
    expectedStateRevision: current.stateRevision,
    type: 'submitIntent',
    payload: { intentId: intent.intentId },
  }
  return { request, body: canonicalJson(request) }
}

function control(
  current: SnapshotEnvelope,
  commandId: string,
): { request: ControlEnvelope; body: string } {
  const request: ControlEnvelope = {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId: current.sessionId,
    commandId,
    expectedStateRevision: current.stateRevision,
  }
  return { request, body: canonicalJson(request) }
}

it('restores one durable logical bridge session and exact HTTP replay after SIGKILL', async () => {
  const runtimeDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'project-studio-bridge-process-'))
  fs.chmodSync(runtimeDirectory, 0o700)
  const checkpointPath = path.join(runtimeDirectory, 'bridge-runtime-v1.json')
  const lockPath = `${checkpointPath}.lock`
  let first: RunningBridge | null = null
  let restarted: RunningBridge | null = null
  const productLaunchCapability = randomBytes(32).toString('base64url')

  try {
    first = await startBridge(runtimeDirectory, productLaunchCapability)
    const firstHealthRaw = await request(first, '/health')
    expect(firstHealthRaw.status).toBe(200)
    const firstRuntimeInstanceId = parseJson<{ runtimeInstanceId: string }>(firstHealthRaw)
      .runtimeInstanceId
    const initial = await snapshot(first)
    expect(initial.stateRevision).toBe(0)

    const firstCommand = journeyCommand(initial, 'process-restart-command-1')
    const firstCommandRaw = await request(first, '/command', 'POST', firstCommand.body)
    expect(firstCommandRaw.status).toBe(200)
    const firstCommandResponse = parseJson<CommandResponse>(firstCommandRaw)
    if (!firstCommandResponse.accepted) throw new Error(firstCommandResponse.message)
    expect(firstCommandRaw.body).toBe(canonicalJson(firstCommandResponse))
    expect(firstCommandResponse.stateRevision).toBe(initial.stateRevision + 1)

    const afterFirstCommand = await snapshot(first)
    const save = control(afterFirstCommand, 'process-restart-save')
    const saveRaw = await request(first, '/save', 'POST', save.body)
    expect(saveRaw.status).toBe(200)
    const saveResponse = parseJson<SaveResponse>(saveRaw)
    if (!saveResponse.accepted) throw new Error(saveResponse.message)
    expect(saveRaw.body).toBe(canonicalJson(saveResponse))
    expect(saveResponse.stateRevision).toBe(afterFirstCommand.stateRevision)

    const afterSave = await snapshot(first)
    const laterCommand = journeyCommand(afterSave, 'process-restart-command-2')
    const laterCommandRaw = await request(first, '/command', 'POST', laterCommand.body)
    expect(laterCommandRaw.status).toBe(200)
    const laterCommandResponse = parseJson<CommandResponse>(laterCommandRaw)
    if (!laterCommandResponse.accepted) throw new Error(laterCommandResponse.message)
    expect(laterCommandRaw.body).toBe(canonicalJson(laterCommandResponse))
    expect(laterCommandResponse.stateRevision).toBe(afterSave.stateRevision + 1)

    const afterLaterCommand = await snapshot(first)
    const load = control(afterLaterCommand, 'process-restart-load')
    const loadRaw = await request(first, '/load', 'POST', load.body)
    expect(loadRaw.status).toBe(200)
    const loadResponse = parseJson<CommandResponse>(loadRaw)
    if (!loadResponse.accepted) throw new Error(loadResponse.message)
    expect(loadRaw.body).toBe(canonicalJson(loadResponse))
    expect(loadResponse.stateRevision).toBe(afterLaterCommand.stateRevision + 1)
    expect(loadResponse.stateDigest).toBe(saveResponse.stateDigest)

    const beforeCrash = await snapshot(first)
    expect(beforeCrash).toMatchObject({
      sessionId: initial.sessionId,
      stateRevision: loadResponse.stateRevision,
      stateDigest: loadResponse.stateDigest,
    })
    expect(fs.existsSync(checkpointPath)).toBe(true)
    expect(fs.existsSync(lockPath)).toBe(true)

    const persistedBeforeCrash = fs.readFileSync(checkpointPath, 'utf8')
    expect(persistedBeforeCrash).not.toContain(first.capability)
    expect(persistedBeforeCrash).not.toContain(firstRuntimeInstanceId)
    expect(first.logs.stdout).not.toContain(first.capability)
    expect(first.logs.stderr).not.toContain(first.capability)
    expect(first.logs.stdout).not.toContain(firstRuntimeInstanceId)
    expect(first.logs.stderr).not.toContain(firstRuntimeInstanceId)
    const hydrated = decodeBridgeRuntimeCheckpoint(persistedBeforeCrash)
    expect(hydrated.checkpoint.journal.map((entry) => [entry.route, entry.commandId])).toEqual([
      ['command', firstCommand.request.commandId],
      ['save', save.request.commandId],
      ['command', laterCommand.request.commandId],
      ['load', load.request.commandId],
    ])
    expect(hydrated.checkpoint.journal.map((entry) => entry.requestJson)).toEqual([
      firstCommand.body,
      save.body,
      laterCommand.body,
      load.body,
    ])
    expect(hydrated.checkpoint.journal.map((entry) => entry.responseJson)).toEqual([
      firstCommandRaw.body,
      saveRaw.body,
      laterCommandRaw.body,
      loadRaw.body,
    ])
    expect(hydrated.currentSave.saveVersion).toBe(14)
    expect(exportSave(hydrated.currentSave)).toBe(hydrated.checkpoint.currentSaveJson)
    expect(hydrated.savedSave?.saveVersion).toBe(14)
    expect(hydrated.savedSave === null ? null : exportSave(hydrated.savedSave))
      .toBe(hydrated.checkpoint.savedSaveJson)
    expect(hydrated.checkpoint.currentSaveJson).toBe(hydrated.checkpoint.savedSaveJson)
    expect(hydrated.checkpoint.currentStateDigest).toBe(hydrated.checkpoint.savedStateDigest)
    expect(hydrated.checkpoint.currentStateDigest).toBe(loadResponse.stateDigest)
    expect(saveResponse.saveJson).toBe(hydrated.checkpoint.savedSaveJson)

    const killed = await signalAndWait(first, 'SIGKILL')
    expect(killed).toEqual({ code: null, signal: 'SIGKILL' })
    expect(fs.existsSync(lockPath)).toBe(true)

    restarted = await startBridge(runtimeDirectory, productLaunchCapability)
    expect(restarted.capability).toBe(first.capability)
    const restartedHealthRaw = await request(restarted, '/health')
    expect(restartedHealthRaw.status).toBe(200)
    const restartedRuntimeInstanceId = parseJson<{ runtimeInstanceId: string }>(restartedHealthRaw)
      .runtimeInstanceId
    expect(restartedRuntimeInstanceId).not.toBe(firstRuntimeInstanceId)
    const restored = await snapshot(restarted)
    expect(restored).toMatchObject({
      sessionId: beforeCrash.sessionId,
      stateRevision: beforeCrash.stateRevision,
      stateDigest: beforeCrash.stateDigest,
    })

    const replayCases = [
      { pathname: '/command', body: firstCommand.body, expectedStatus: 200, expected: firstCommandRaw.body },
      { pathname: '/save', body: save.body, expectedStatus: 200, expected: saveRaw.body },
      { pathname: '/command', body: laterCommand.body, expectedStatus: 200, expected: laterCommandRaw.body },
      { pathname: '/load', body: load.body, expectedStatus: 200, expected: loadRaw.body },
    ] as const
    for (const replay of replayCases) {
      const response = await request(restarted, replay.pathname, 'POST', replay.body)
      expect(response.status).toBe(replay.expectedStatus)
      expect(response.body).toBe(replay.expected)
      const authority = await snapshot(restarted)
      expect(authority).toMatchObject({
        sessionId: restored.sessionId,
        stateRevision: restored.stateRevision,
        stateDigest: restored.stateDigest,
      })
    }

    const conflictingRoute = canonicalJson({
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: restored.sessionId,
      commandId: firstCommand.request.commandId,
      expectedStateRevision: restored.stateRevision,
    } satisfies ControlEnvelope)
    const conflictRaw = await request(restarted, '/save', 'POST', conflictingRoute)
    expect(conflictRaw.status).toBe(409)
    expect(parseJson<CommandResponse>(conflictRaw)).toMatchObject({
      accepted: false,
      reasonCode: 'COMMAND_ID_REUSE',
      sessionId: restored.sessionId,
      commandId: firstCommand.request.commandId,
      stateRevision: restored.stateRevision,
      stateDigest: restored.stateDigest,
    })
    expect(await snapshot(restarted)).toMatchObject({
      sessionId: restored.sessionId,
      stateRevision: restored.stateRevision,
      stateDigest: restored.stateDigest,
    })
    expect(fs.readFileSync(checkpointPath, 'utf8')).toBe(persistedBeforeCrash)
    expect(restarted.logs.stdout).not.toContain(restarted.capability)
    expect(restarted.logs.stderr).not.toContain(restarted.capability)
    expect(restarted.logs.stdout).not.toContain(restartedRuntimeInstanceId)
    expect(restarted.logs.stderr).not.toContain(restartedRuntimeInstanceId)

    const graceful = await signalAndWait(restarted, 'SIGTERM')
    expect(graceful).toEqual({ code: 0, signal: null })
    expect(fs.existsSync(lockPath)).toBe(false)
  } catch (error) {
    throw new Error(
      `${(error as Error).message}\n\n${diagnostics('first bridge', first)}\n\n` +
        diagnostics('restarted bridge', restarted),
      { cause: error },
    )
  } finally {
    await cleanupBridge(restarted)
    await cleanupBridge(first)
    fs.rmSync(runtimeDirectory, { recursive: true, force: true })
  }
}, 60_000)
