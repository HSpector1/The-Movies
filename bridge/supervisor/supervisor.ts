import { randomBytes } from 'node:crypto'
import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { TextDecoder } from 'node:util'

import {
  BRIDGE_SCHEMA,
  PROTOCOL_VERSION,
  SCHEMA_ID,
  SNAPSHOT_VERSION,
} from '../protocol.ts'
import { canonicalJson } from '../schema/canonical.ts'
import type { BridgeHealthResponse } from '../schema/bridge-schema.ts'
import { parseWireValue } from '../schema/runtime.ts'
import { inspectProcessIncarnation } from '../runtime/process-incarnation.ts'
import {
  assertSafeUnityArguments,
  createMinimalChildEnvironment,
  type StudioSupervisorOptions,
} from './config.ts'
import { BoundedRedactingLineLog } from './bounded-log.ts'
import {
  inspectSpawnedProcess,
  SupervisorLease,
  type SupervisorProcessReference,
} from './lease.ts'

export const ENGINE_STARTUP_TIMEOUT_MS = 20_000
export const ENGINE_HEALTH_TIMEOUT_MS = 3_000
export const CHILD_SHUTDOWN_TIMEOUT_MS = 5_000
export const MAX_HEALTH_RESPONSE_BYTES = 16 * 1024
export const ENGINE_RESTART_WINDOW_MS = 60_000

const ENGINE_LIVE_LINE = /^\[bridge\] live http:\/\/127\.0\.0\.1:([1-9]\d{0,4}) protocol=(\d+) snapshot=(\d+) schema=(sha256:[0-9a-f]{64})$/
const CAPABILITY_HEADER = 'x-project-studio-capability'

type ChildExit = {
  code: number | null
  signal: NodeJS.Signals | null
  error: Error | null
}

type ManagedChild = {
  child: ChildProcess
  reference: SupervisorProcessReference
  exit: Promise<ChildExit>
}

type ManagedEngine = ManagedChild & {
  health: BridgeHealthResponse
}

type LifecycleOutcome =
  | { kind: 'abort' }
  | { kind: 'engine'; exit: ChildExit }
  | { kind: 'unity'; exit: ChildExit }

type ReadyLine = {
  port: number
}

class SupervisorStartAbortedError extends Error {
  constructor() {
    super('Supervisor startup was interrupted.')
    this.name = 'SupervisorStartAbortedError'
  }
}

export class EngineRestartBudget {
  private attempts = 0

  constructor(
    readonly maximumRestarts: number,
    readonly windowMs: number = ENGINE_RESTART_WINDOW_MS,
  ) {
    if (!Number.isSafeInteger(maximumRestarts) || maximumRestarts < 0 || maximumRestarts > 10) {
      throw new Error('Engine restart maximum must be an integer from 0 through 10.')
    }
    if (!Number.isSafeInteger(windowMs) || windowMs <= 0) {
      throw new Error('Engine restart window must be a positive integer.')
    }
  }

  claim(healthyRuntimeMs: number): number | null {
    if (!Number.isFinite(healthyRuntimeMs) || healthyRuntimeMs < 0) {
      throw new Error('Engine healthy runtime must be a non-negative duration.')
    }
    if (healthyRuntimeMs >= this.windowMs) this.attempts = 0
    if (this.attempts >= this.maximumRestarts) return null
    this.attempts++
    return this.attempts
  }
}

function systemCode(error: unknown): string | undefined {
  return (error as NodeJS.ErrnoException | null)?.code
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted === true) throw new SupervisorStartAbortedError()
}

function isAborted(signal?: AbortSignal): boolean {
  return signal?.aborted === true
}

function rejectWhenAborted(signal?: AbortSignal): Promise<never> {
  if (signal === undefined) return new Promise<never>(() => {})
  if (signal.aborted) return Promise.reject(new SupervisorStartAbortedError())
  return new Promise<never>((_resolve, reject) => {
    signal.addEventListener(
      'abort',
      () => reject(new SupervisorStartAbortedError()),
      { once: true },
    )
  })
}

function processGroupPresence(processGroupId: number): 'absent' | 'present' | 'unverifiable' {
  try {
    process.kill(-processGroupId, 0)
    return 'present'
  } catch (error) {
    if (systemCode(error) === 'ESRCH') return 'absent'
    if (systemCode(error) === 'EPERM') {
      const members = inspectOwnedProcessGroupMembers(processGroupId)
      return members === null ? 'unverifiable' : members.length === 0 ? 'absent' : 'present'
    }
    return 'unverifiable'
  }
}

function inspectOwnedProcessGroupMembers(processGroupId: number): number[] | null {
  if (typeof process.getuid !== 'function') return null
  const result = spawnSync('/bin/ps', ['-axo', 'pid=,pgid=,uid=,state='], {
    encoding: 'utf8',
    env: { LANG: 'C', LC_ALL: 'C', PATH: '/usr/bin:/bin' },
    maxBuffer: 1024 * 1024,
    timeout: 2_000,
  })
  if (result.error !== undefined || result.signal !== null || result.status !== 0) return null
  const members: number[] = []
  for (const line of result.stdout.split('\n')) {
    const match = /^\s*(\d+)\s+(\d+)\s+(\d+)\s+(\S+)\s*$/.exec(line)
    if (match === null || Number(match[2]) !== processGroupId) continue
    if (Number(match[3]) !== process.getuid()) return null
    if ((match[4] as string).startsWith('Z')) continue
    members.push(Number(match[1]))
  }
  return members
}

function signalOwnedProcessGroup(processGroupId: number, signal: NodeJS.Signals): void {
  try {
    process.kill(-processGroupId, signal)
    return
  } catch (error) {
    if (systemCode(error) === 'ESRCH') return
    if (systemCode(error) !== 'EPERM') throw error
  }
  const members = inspectOwnedProcessGroupMembers(processGroupId)
  if (members === null) throw new Error(`Cannot verify process group ${String(processGroupId)}.`)
  for (const pid of members) {
    try {
      process.kill(pid, signal)
    } catch (error) {
      if (systemCode(error) !== 'ESRCH') throw error
    }
  }
}

async function waitForProcessGroupExit(processGroupId: number, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs
  do {
    const presence = processGroupPresence(processGroupId)
    if (presence === 'absent') return true
    if (presence === 'unverifiable') {
      throw new Error(`Cannot verify process group ${String(processGroupId)}.`)
    }
    await delay(50)
  } while (Date.now() < deadline)
  return false
}

function withTimeout<Result>(promise: Promise<Result>, timeoutMs: number, message: string): Promise<Result> {
  return new Promise<Result>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(message)), timeoutMs)
    promise.then(
      (value) => {
        clearTimeout(timeout)
        resolve(value)
      },
      (error: unknown) => {
        clearTimeout(timeout)
        reject(error)
      },
    )
  })
}

function assertFile(filePath: string, label: string): string {
  const stat = fs.lstatSync(filePath)
  if (stat.isSymbolicLink() || !stat.isFile()) {
    throw new Error(`${label} must be a real regular file: ${filePath}`)
  }
  return fs.realpathSync.native(filePath)
}

function childExitPromise(child: ChildProcess): Promise<ChildExit> {
  return new Promise((resolve) => {
    let spawnError: Error | null = null
    let settled = false
    child.once('error', (error) => {
      spawnError = error
      if (child.pid === undefined && !settled) {
        settled = true
        resolve({ code: null, signal: null, error })
      }
    })
    child.once('exit', (code, signal) => {
      if (settled) return
      settled = true
      resolve({ code, signal, error: spawnError })
    })
  })
}

async function waitForSpawn(child: ChildProcess, label: string): Promise<number> {
  await new Promise<void>((resolve, reject) => {
    const onSpawn = (): void => {
      child.off('error', onError)
      resolve()
    }
    const onError = (error: Error): void => {
      child.off('spawn', onSpawn)
      reject(new Error(`${label} failed to spawn: ${error.message}`, { cause: error }))
    }
    child.once('spawn', onSpawn)
    child.once('error', onError)
  })
  if (child.pid === undefined) throw new Error(`${label} did not receive a process ID.`)
  return child.pid
}

function attachChildOutput(child: ChildProcess, log: BoundedRedactingLineLog): void {
  child.stdout?.on('data', (chunk: Buffer) => log.write('stdout', chunk))
  child.stderr?.on('data', (chunk: Buffer) => log.write('stderr', chunk))
  child.stdout?.once('end', () => log.endStream('stdout'))
  child.stderr?.once('end', () => log.endStream('stderr'))
}

function closeLogs(logs: readonly (BoundedRedactingLineLog | null)[]): unknown[] {
  const errors: unknown[] = []
  for (const log of logs) {
    try {
      log?.close()
    } catch (error) {
      errors.push(error)
    }
  }
  return errors
}

function parseReadyLine(line: string, expectedPort: number | null): ReadyLine | null {
  const match = ENGINE_LIVE_LINE.exec(line)
  if (match === null) {
    if (line.startsWith('[bridge] live ')) {
      throw new Error(`Bridge emitted a malformed live line: ${line}`)
    }
    return null
  }
  const port = Number(match[1])
  if (
    !Number.isSafeInteger(port) ||
    port <= 0 ||
    port > 65535 ||
    Number(match[2]) !== PROTOCOL_VERSION ||
    Number(match[3]) !== SNAPSHOT_VERSION ||
    match[4] !== SCHEMA_ID
  ) throw new Error('Bridge live line does not match the compiled supervisor contract.')
  if (expectedPort !== null && port !== expectedPort) {
    throw new Error(
      `Restarted bridge selected port ${String(port)} instead of pinned port ${String(expectedPort)}.`,
    )
  }
  return { port }
}

function strictHealthResponse(value: unknown): BridgeHealthResponse {
  const health = parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeHealthResponse, value)
  if (
    health.protocolVersion !== PROTOCOL_VERSION ||
    health.snapshotVersion !== SNAPSHOT_VERSION ||
    health.schemaId !== SCHEMA_ID ||
    !/^[0-9a-f]{64}$/.test(health.stateDigest)
  ) throw new Error('Bridge health response does not match the compiled runtime contract.')
  return health
}

async function requestHealth(
  port: number,
  capability: string,
  signal?: AbortSignal,
): Promise<BridgeHealthResponse> {
  throwIfAborted(signal)
  return await new Promise<BridgeHealthResponse>((resolve, reject) => {
    const request = http.request({
      agent: false,
      headers: {
        accept: 'application/json',
        [CAPABILITY_HEADER]: capability,
      },
      host: '127.0.0.1',
      method: 'GET',
      path: '/health',
      port,
      protocol: 'http:',
      timeout: ENGINE_HEALTH_TIMEOUT_MS,
    }, (response) => {
      const contentTypes = response.rawHeaders.reduce<string[]>((values, name, index, headers) => {
        if (index % 2 === 0 && name.toLowerCase() === 'content-type') {
          values.push(headers[index + 1] ?? '')
        }
        return values
      }, [])
      if (
        response.statusCode !== 200 ||
        contentTypes.length !== 1 ||
        contentTypes[0] !== 'application/json; charset=utf-8'
      ) {
        response.resume()
        reject(new Error(`Authenticated bridge health returned HTTP ${String(response.statusCode)}.`))
        return
      }
      const chunks: Buffer[] = []
      let length = 0
      response.on('data', (chunk: Buffer) => {
        length += chunk.length
        if (length > MAX_HEALTH_RESPONSE_BYTES) {
          response.destroy(new Error('Bridge health response exceeded its byte bound.'))
          return
        }
        chunks.push(chunk)
      })
      response.once('error', reject)
      response.once('end', () => {
        try {
          const text = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks))
          const parsed = JSON.parse(text) as unknown
          const health = strictHealthResponse(parsed)
          if (canonicalJson(health) !== text) {
            throw new Error('Bridge health response is not canonical JSON.')
          }
          resolve(health)
        } catch (error) {
          reject(error)
        }
      })
    })
    const onAbort = (): void => {
      request.destroy(new SupervisorStartAbortedError())
    }
    signal?.addEventListener('abort', onAbort, { once: true })
    request.once('close', () => signal?.removeEventListener('abort', onAbort))
    request.once('timeout', () => request.destroy(new Error('Bridge health request timed out.')))
    request.once('error', reject)
    request.end()
  })
}

async function authenticateReadyBridge(
  port: number,
  capability: string,
  signal?: AbortSignal,
): Promise<BridgeHealthResponse> {
  const deadline = Date.now() + ENGINE_HEALTH_TIMEOUT_MS
  let lastError: unknown = new Error('Bridge health was not attempted.')
  do {
    throwIfAborted(signal)
    try {
      return await requestHealth(port, capability, signal)
    } catch (error) {
      if (error instanceof SupervisorStartAbortedError) throw error
      lastError = error
      await Promise.race([delay(50), rejectWhenAborted(signal)])
    }
  } while (Date.now() < deadline)
  throw new Error('Bridge failed its strict authenticated health handshake.', { cause: lastError })
}

async function terminateManagedChild(
  managed: ManagedChild | null,
  report: (message: string) => void,
): Promise<void> {
  if (managed === null) return
  const inspection = inspectProcessIncarnation(managed.reference.pid)
  const initialGroupPresence = processGroupPresence(managed.reference.processGroupId)
  if (initialGroupPresence === 'unverifiable') {
    throw new Error(`Cannot verify ${managed.reference.kind} process group during cleanup.`)
  }
  if (inspection.status === 'absent' && initialGroupPresence === 'absent') {
    await managed.exit
    return
  }
  if (inspection.status === 'unverifiable') {
    throw new Error(
      `Cannot verify ${managed.reference.kind} process ${String(managed.reference.pid)} during cleanup.`,
    )
  }
  if (
    inspection.status === 'verified' &&
    inspection.incarnation !== managed.reference.processIncarnation
  ) {
    report(
      `${managed.reference.kind} pid=${String(managed.reference.pid)} was reused; no signal sent`,
    )
    return
  }
  report(
    `cleanup ${managed.reference.kind} pid=${String(managed.reference.pid)} signal=SIGTERM`,
  )
  try {
    signalOwnedProcessGroup(managed.reference.processGroupId, 'SIGTERM')
  } catch (error) {
    throw new Error(`${managed.reference.kind} SIGTERM failed.`, { cause: error })
  }
  if (await waitForProcessGroupExit(
    managed.reference.processGroupId,
    CHILD_SHUTDOWN_TIMEOUT_MS,
  )) {
    await managed.exit
    return
  }
  try {
    report(
      `cleanup ${managed.reference.kind} pid=${String(managed.reference.pid)} signal=SIGKILL`,
    )
    try {
      signalOwnedProcessGroup(managed.reference.processGroupId, 'SIGKILL')
    } catch (killError) {
      throw new Error(`${managed.reference.kind} SIGKILL failed.`, { cause: killError })
    }
    const groupExited = await waitForProcessGroupExit(
      managed.reference.processGroupId,
      CHILD_SHUTDOWN_TIMEOUT_MS,
    )
    if (!groupExited) throw new Error(`${managed.reference.kind} did not stop after SIGKILL.`)
    await managed.exit
  } catch (error) {
    throw new Error(`${managed.reference.kind} cleanup failed.`, { cause: error })
  }
}

async function terminateUnpublishedChild(
  child: ChildProcess,
  exit: Promise<ChildExit>,
  kind: 'engine' | 'unity',
  report: (message: string) => void,
): Promise<void> {
  const pid = child.pid
  if (pid === undefined) {
    await exit
    return
  }
  const groupPresence = processGroupPresence(pid)
  if (groupPresence === 'unverifiable') {
    throw new Error(`Cannot verify unpublished ${kind} process group ${String(pid)}.`)
  }
  if (groupPresence === 'absent') {
    await exit
    return
  }
  report(`cleanup unpublished ${kind} pid=${String(pid)} signal=SIGTERM`)
  signalOwnedProcessGroup(pid, 'SIGTERM')
  if (!(await waitForProcessGroupExit(pid, CHILD_SHUTDOWN_TIMEOUT_MS))) {
    report(`cleanup unpublished ${kind} pid=${String(pid)} signal=SIGKILL`)
    signalOwnedProcessGroup(pid, 'SIGKILL')
    if (!(await waitForProcessGroupExit(pid, CHILD_SHUTDOWN_TIMEOUT_MS))) {
      throw new Error(`Unpublished ${kind} process group did not stop.`)
    }
  }
  await exit
}

function exitDescription(exit: ChildExit): string {
  if (exit.error !== null) return `spawn-error=${exit.error.message}`
  return `code=${String(exit.code)} signal=${exit.signal ?? '-'}`
}

function signalExitCode(signal?: AbortSignal): number {
  return signal?.reason === 'SIGHUP'
    ? 129
    : signal?.reason === 'SIGINT'
      ? 130
      : signal?.reason === 'SIGTERM'
        ? 143
        : 1
}

export async function runStudioSupervisor(
  options: StudioSupervisorOptions,
  signal?: AbortSignal,
): Promise<number> {
  const capability = randomBytes(32).toString('base64url')
  const earlyEvents: string[] = []
  const lease = await SupervisorLease.acquire(options.profileRoot, (message) => {
    earlyEvents.push(message)
  })
  let provisionalSupervisorLog: BoundedRedactingLineLog | null = null
  let provisionalEngineLog: BoundedRedactingLineLog | null = null
  let provisionalUnityLog: BoundedRedactingLineLog | null = null
  let engineLineObserver: ((stream: 'stderr' | 'stdout', line: string) => void) | null = null
  try {
    provisionalSupervisorLog = new BoundedRedactingLineLog(
      path.join(lease.launchDirectory, 'supervisor.log'),
      capability,
    )
    provisionalEngineLog = new BoundedRedactingLineLog(
      path.join(lease.launchDirectory, 'engine.log'),
      capability,
      undefined,
      (stream, line) => engineLineObserver?.(stream, line),
    )
    provisionalUnityLog = new BoundedRedactingLineLog(
      path.join(lease.launchDirectory, 'unity.log'),
      capability,
    )
  } catch (error) {
    const cleanupErrors = closeLogs([
      provisionalUnityLog,
      provisionalEngineLog,
      provisionalSupervisorLog,
    ])
    try {
      lease.release()
    } catch (releaseError) {
      cleanupErrors.push(releaseError)
    } finally {
      lease.abandonOwnerLock()
    }
    if (cleanupErrors.length > 0) {
      throw new AggregateError(
        [error, ...cleanupErrors],
        'Supervisor log initialization failed and rollback was incomplete.',
      )
    }
    throw error
  }
  if (
    provisionalSupervisorLog === null ||
    provisionalEngineLog === null ||
    provisionalUnityLog === null
  ) throw new Error('Supervisor log initialization did not complete.')
  const supervisorLog = provisionalSupervisorLog
  const engineLog = provisionalEngineLog
  const unityLog = provisionalUnityLog
  const report = (message: string): void => {
    supervisorLog.event(message)
    process.stdout.write(`[supervisor] ${message}\n`)
  }
  for (const message of earlyEvents) report(message)
  report(`launch=${lease.snapshot().launchId} profile=${lease.layout.profileRoot}`)

  let engine: ManagedEngine | null = null
  let unity: ManagedChild | null = null
  let engineRecovery: ManagedChild | null = null
  let unityRecovery: ManagedChild | null = null
  let unpublishedCleanupFailure: unknown = null
  let fixedPort: number | null = null
  let previousRuntimeInstanceId: string | null = null
  let engineRestartAttempt = 0
  let engineReadyAt = 0
  const restartBudget = new EngineRestartBudget(options.maxEngineRestarts)
  let cleanupPromise: Promise<void> | null = null

  const startEngine = async (
    restart: boolean,
    startSignal: AbortSignal | undefined = signal,
  ): Promise<ManagedEngine> => {
    throwIfAborted(startSignal)
    const requestedPort = fixedPort ?? 0
    report(
      `engine spawn mode=${restart ? 'restart' : 'initial'} requestedPort=${String(requestedPort)}`,
    )
    const viteNodeEntry = assertFile(
      path.join(options.repositoryRoot, 'node_modules', 'vite-node', 'vite-node.mjs'),
      'vite-node entry',
    )
    const serverEntry = assertFile(
      path.join(options.repositoryRoot, 'bridge', 'server.ts'),
      'bridge server entry',
    )
    let resolveReady!: (ready: ReadyLine) => void
    let rejectReady!: (error: unknown) => void
    let readySettled = false
    const readyPromise = new Promise<ReadyLine>((resolve, reject) => {
      resolveReady = resolve
      rejectReady = reject
    })
    void readyPromise.catch(() => {})
    engineLineObserver = (stream, line) => {
      if (stream !== 'stdout' || readySettled) return
      try {
        const parsed = parseReadyLine(line, fixedPort)
        if (parsed !== null) {
          readySettled = true
          resolveReady(parsed)
        }
      } catch (error) {
        readySettled = true
        rejectReady(error)
      }
    }
    throwIfAborted(startSignal)
    const child = spawn(process.execPath, [viteNodeEntry, serverEntry], {
      cwd: options.repositoryRoot,
      detached: true,
      env: createMinimalChildEnvironment(process.env, {
        PROJECT_STUDIO_BRIDGE_CAPABILITY: capability,
        PROJECT_STUDIO_BRIDGE_PORT: String(requestedPort),
        PROJECT_STUDIO_BRIDGE_RUNTIME_DIR: lease.layout.bridgeRuntimeRoot,
      }),
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    })
    const exit = childExitPromise(child)
    attachChildOutput(child, engineLog)
    void exit.then((result) => {
      if (!readySettled) {
        readySettled = true
        rejectReady(new Error(`Bridge exited before readiness: ${exitDescription(result)}`))
      }
    })
    let reference: SupervisorProcessReference | null = null
    try {
      const pid = await waitForSpawn(child, 'TypeScript engine')
      reference = await inspectSpawnedProcess('engine', pid)
      engineRecovery = { child, reference, exit }
      lease.update({ engine: reference, engineRestarts: engineRestartAttempt })
      report(`engine pid=${String(pid)} incarnation=${reference.processIncarnation}`)
      const ready = await Promise.race([
        withTimeout(
          readyPromise,
          ENGINE_STARTUP_TIMEOUT_MS,
          'Bridge did not emit a complete valid live line before the startup deadline.',
        ),
        rejectWhenAborted(startSignal),
      ])
      engineLineObserver = null
      if (fixedPort === null) {
        fixedPort = ready.port
        lease.update({ fixedPort })
      }
      const health = await Promise.race([
        authenticateReadyBridge(ready.port, capability, startSignal),
        rejectWhenAborted(startSignal),
      ])
      throwIfAborted(startSignal)
      if (
        previousRuntimeInstanceId !== null &&
        health.runtimeInstanceId === previousRuntimeInstanceId
      ) throw new Error('Restarted engine reused its process-scoped runtime identity.')
      previousRuntimeInstanceId = health.runtimeInstanceId
      report(
        `engine ready pid=${String(pid)} port=${String(ready.port)} protocol=${String(health.protocolVersion)} ` +
          `snapshot=${String(health.snapshotVersion)} schema=${health.schemaId} session=${health.sessionId}`,
      )
      return { child, reference, exit, health }
    } catch (error) {
      engineLineObserver = null
      let cleanupError: unknown = null
      try {
        if (reference === null) await terminateUnpublishedChild(child, exit, 'engine', report)
        else await terminateManagedChild({ child, reference, exit }, report)
      } catch (terminationError) {
        cleanupError = terminationError
        if (reference === null) unpublishedCleanupFailure = terminationError
      }
      if (cleanupError === null) {
        engineRecovery = null
        try {
          lease.update({ engine: null })
        } catch (leaseError) {
          cleanupError = leaseError
        }
      }
      if (cleanupError !== null) {
        throw new AggregateError(
          [error, cleanupError],
          'Engine startup failed and its owned process cleanup was incomplete.',
        )
      }
      throw error
    }
  }

  const startUnity = async (): Promise<ManagedChild> => {
    throwIfAborted(signal)
    const safeArguments = assertSafeUnityArguments(options.unityArguments)
    report(`unity spawn executable=${options.unityExecutable}`)
    const child = spawn(options.unityExecutable, ['-logFile', '-', ...safeArguments], {
      cwd: options.unityWorkingDirectory,
      detached: true,
      env: createMinimalChildEnvironment(process.env, {
        PROJECT_STUDIO_BRIDGE_CAPABILITY: capability,
        PROJECT_STUDIO_BRIDGE_URL: `http://127.0.0.1:${String(fixedPort)}`,
      }),
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    })
    const exit = childExitPromise(child)
    attachChildOutput(child, unityLog)
    let reference: SupervisorProcessReference | null = null
    try {
      const pid = await waitForSpawn(child, 'Unity client')
      reference = await inspectSpawnedProcess('unity', pid)
      unityRecovery = { child, reference, exit }
      lease.update({ phase: 'running', unity: reference })
      throwIfAborted(signal)
      report(`unity pid=${String(pid)} incarnation=${reference.processIncarnation}`)
      return { child, reference, exit }
    } catch (error) {
      let cleanupError: unknown = null
      try {
        if (reference === null) await terminateUnpublishedChild(child, exit, 'unity', report)
        else await terminateManagedChild({ child, reference, exit }, report)
      } catch (terminationError) {
        cleanupError = terminationError
        if (reference === null) unpublishedCleanupFailure = terminationError
      }
      if (cleanupError === null) {
        unityRecovery = null
        try {
          lease.update({ unity: null })
        } catch (leaseError) {
          cleanupError = leaseError
        }
      }
      if (cleanupError !== null) {
        throw new AggregateError(
          [error, cleanupError],
          'Unity startup failed and its owned process cleanup was incomplete.',
        )
      }
      throw error
    }
  }

  const cleanup = (): Promise<void> => {
    if (cleanupPromise !== null) return cleanupPromise
    cleanupPromise = (async () => {
      const errors: unknown[] = []
      try {
        lease.update({ phase: 'stopping' })
      } catch (error) {
        errors.push(error)
      }
      try {
        await terminateManagedChild(unity ?? unityRecovery, report)
        unity = null
        unityRecovery = null
        lease.update({ unity: null })
      } catch (error) {
        errors.push(error)
      }
      try {
        await terminateManagedChild(engine ?? engineRecovery, report)
        engine = null
        engineRecovery = null
        lease.update({ engine: null })
      } catch (error) {
        errors.push(error)
      }
      if (unpublishedCleanupFailure !== null) errors.push(unpublishedCleanupFailure)
      if (errors.length === 0) {
        try {
          lease.release()
        } catch (error) {
          errors.push(error)
        }
      }
      if (errors.length > 0) {
        throw new AggregateError(errors, 'Studio supervisor cleanup failed.')
      }
      report('cleanup complete')
    })()
    return cleanupPromise
  }

  const finishUnityExit = async (
    activeUnity: ManagedChild,
    unityExit: ChildExit,
  ): Promise<number> => {
    report(`unity exit ${exitDescription(unityExit)}; engine shutdown follows`)
    await terminateManagedChild(activeUnity, report)
    unity = null
    unityRecovery = null
    lease.update({ unity: null, phase: 'stopping' })
    return unityExit.error === null && unityExit.signal === null
      ? unityExit.code ?? 1
      : 1
  }

  try {
    if (isAborted(signal)) return signalExitCode(signal)
    engine = await startEngine(false)
    engineReadyAt = Date.now()
    report(
      `ready endpoint=http://127.0.0.1:${String(fixedPort)} protocol=${String(PROTOCOL_VERSION)} ` +
        `snapshot=${String(SNAPSHOT_VERSION)} schema=${SCHEMA_ID} session=${engine.health.sessionId}`,
    )
    if (isAborted(signal)) return signalExitCode(signal)
    unity = await startUnity()

    const abortOutcome = signal === undefined
      ? new Promise<LifecycleOutcome>(() => {})
      : new Promise<LifecycleOutcome>((resolve) => {
        if (signal.aborted) resolve({ kind: 'abort' })
        else signal.addEventListener('abort', () => resolve({ kind: 'abort' }), { once: true })
      })

    while (engine !== null && unity !== null) {
      const activeEngine = engine
      const activeUnity = unity
      const outcome = await Promise.race<LifecycleOutcome>([
        activeEngine.exit.then((exit) => ({ kind: 'engine', exit })),
        activeUnity.exit.then((exit) => ({ kind: 'unity', exit })),
        abortOutcome,
      ])
      if (outcome.kind === 'abort') {
        report(`shutdown requested reason=${String(signal?.reason ?? 'abort')}`)
        return signal === undefined ? 1 : signalExitCode(signal)
      }
      if (outcome.kind === 'unity' || activeUnity.child.exitCode !== null || activeUnity.child.signalCode !== null) {
        const unityExit = outcome.kind === 'unity' ? outcome.exit : await activeUnity.exit
        return await finishUnityExit(activeUnity, unityExit)
      }

      report(`engine exit ${exitDescription(outcome.exit)}`)
      await terminateManagedChild(activeEngine, report)
      engine = null
      engineRecovery = null
      lease.update({ engine: null })
      let healthyRuntimeMs = Math.max(0, Date.now() - engineReadyAt)
      let lastRestartFailure: unknown = outcome.exit.error
      const restartAbort = new AbortController()
      const forwardShutdown = (): void => restartAbort.abort(signal?.reason)
      if (isAborted(signal)) forwardShutdown()
      else signal?.addEventListener('abort', forwardShutdown, { once: true })
      void activeUnity.exit.then((exit) => restartAbort.abort({ kind: 'unity', exit }))
      while (engine === null) {
        if (restartAbort.signal.aborted) {
          if (isAborted(signal)) return signalExitCode(signal)
          return await finishUnityExit(activeUnity, await activeUnity.exit)
        }
        const attempt = restartBudget.claim(healthyRuntimeMs)
        healthyRuntimeMs = 0
        if (attempt === null) {
          throw new Error(
            `Engine restart budget exhausted within ${String(ENGINE_RESTART_WINDOW_MS)} ms.`,
            lastRestartFailure === null ? undefined : { cause: lastRestartFailure },
          )
        }
        engineRestartAttempt = attempt
        lease.update({ engineRestarts: engineRestartAttempt })
        const backoffMs = Math.min(2_000, 200 * (2 ** (engineRestartAttempt - 1)))
        report(
          `engine restart attempt=${String(engineRestartAttempt)}/${String(options.maxEngineRestarts)} ` +
            `pinnedPort=${String(fixedPort)} backoffMs=${String(backoffMs)}`,
        )
        try {
          await Promise.race([delay(backoffMs), rejectWhenAborted(restartAbort.signal)])
        } catch (error) {
          if (!(error instanceof SupervisorStartAbortedError)) throw error
          if (isAborted(signal)) return signalExitCode(signal)
          return await finishUnityExit(activeUnity, await activeUnity.exit)
        }
        try {
          engine = await startEngine(true, restartAbort.signal)
          engineReadyAt = Date.now()
        } catch (error) {
          if (error instanceof SupervisorStartAbortedError) {
            if (isAborted(signal)) return signalExitCode(signal)
            return await finishUnityExit(activeUnity, await activeUnity.exit)
          }
          lastRestartFailure = error
          report(`engine restart failed attempt=${String(engineRestartAttempt)} ${(error as Error).message}`)
        }
      }
      signal?.removeEventListener('abort', forwardShutdown)
    }
    throw new Error('Supervisor lifecycle ended without a terminal child outcome.')
  } catch (error) {
    if (error instanceof SupervisorStartAbortedError && signal?.aborted === true) {
      report(`shutdown requested reason=${String(signal.reason ?? 'abort')}`)
      return signalExitCode(signal)
    }
    report(`fatal ${(error as Error).message}`)
    throw error
  } finally {
    let cleanupError: unknown = null
    try {
      await cleanup()
    } catch (error) {
      cleanupError = error
    } finally {
      lease.abandonOwnerLock()
      engineLineObserver = null
      const closeErrors = closeLogs([engineLog, unityLog, supervisorLog])
      if (cleanupError !== null && closeErrors.length === 0) throw cleanupError
      if (cleanupError !== null || closeErrors.length > 0) {
        throw new AggregateError(
          cleanupError === null ? closeErrors : [cleanupError, ...closeErrors],
          'Studio supervisor finalization failed.',
        )
      }
    }
  }
}
