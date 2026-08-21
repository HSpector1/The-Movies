import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import fs from 'node:fs'
import net, { type Socket } from 'node:net'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { currentProcessIncarnation } from '../bridge/runtime/process-incarnation.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import { parseStudioSupervisorArguments } from '../bridge/supervisor/config.ts'
import {
  prepareSupervisorProfile,
  SupervisorLease,
  type SupervisorLeaseRecord,
} from '../bridge/supervisor/lease.ts'
import { EngineRestartBudget } from '../bridge/supervisor/supervisor.ts'

const ROOT = process.cwd()
const VITE_NODE = path.join(ROOT, 'node_modules', 'vite-node', 'vite-node.mjs')
const SUPERVISOR_ENTRY = path.join(ROOT, 'bridge', 'supervisor', 'cli.ts')
const FAKE_UNITY_ENTRY = path.join(ROOT, 'tests', 'fixtures', 'fake-unity-supervisor.mjs')
const START_TIMEOUT_MS = 20_000
const EXIT_TIMEOUT_MS = 15_000
const MAX_CAPTURE_BYTES = 1_000_000

type ProcessExit = {
  code: number | null
  signal: NodeJS.Signals | null
}

type RunningSupervisor = {
  child: ChildProcess
  profileRoot: string
  stderr: string
  stdout: string
}

type FixtureMessage = {
  event: string
  [key: string]: unknown
}

type ReadyLine = {
  endpoint: string
  protocolVersion: number
  schemaId: string
  sessionId: string
  snapshotVersion: number
}

const temporaryRoots: string[] = []
const trackedChildren = new Set<ChildProcess>()

function temporaryRoot(name: string): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), `studio-supervisor-${name}-`))
  temporaryRoots.push(root)
  return root
}

function appendBounded(previous: string, chunk: Buffer | string): string {
  const combined = previous + chunk.toString()
  if (Buffer.byteLength(combined, 'utf8') <= MAX_CAPTURE_BYTES) return combined
  return combined.slice(-MAX_CAPTURE_BYTES)
}

function waitForExit(child: ChildProcess): Promise<ProcessExit> {
  if (child.exitCode !== null || child.signalCode !== null) {
    return Promise.resolve({ code: child.exitCode, signal: child.signalCode })
  }
  return new Promise((resolve) => {
    child.once('exit', (code, signal) => resolve({ code, signal }))
  })
}

function withTimeout<T>(promise: Promise<T>, milliseconds: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), milliseconds)
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

async function eventually<T>(
  probe: () => T | null | Promise<T | null>,
  message: string,
  milliseconds = START_TIMEOUT_MS,
): Promise<T> {
  const deadline = Date.now() + milliseconds
  while (Date.now() < deadline) {
    const result = await probe()
    if (result !== null) return result
    await new Promise((resolve) => setTimeout(resolve, 25))
  }
  throw new Error(message)
}

async function cleanupChild(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) return
  const exiting = waitForExit(child)
  child.kill('SIGTERM')
  try {
    await withTimeout(exiting, 2_000, 'Child did not exit after SIGTERM.')
  } catch {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL')
    try {
      await withTimeout(waitForExit(child), 2_000, 'Child did not exit after SIGKILL.')
    } catch {
      // The Vitest worker owns the final bounded teardown.
    }
  }
}

afterEach(async () => {
  await Promise.all([...trackedChildren].map(cleanupChild))
  trackedChildren.clear()
  for (const root of temporaryRoots.splice(0)) {
    fs.rmSync(root, { force: true, recursive: true })
  }
})

class FixtureObserver {
  readonly messages: FixtureMessage[] = []
  readonly port: number

  private readonly server: net.Server
  private readonly sockets = new Set<Socket>()

  private constructor(server: net.Server, port: number) {
    this.server = server
    this.port = port
    server.on('connection', (socket) => {
      this.sockets.add(socket)
      socket.setEncoding('utf8')
      let pending = ''
      socket.on('data', (chunk: string) => {
        pending += chunk
        while (true) {
          const newline = pending.indexOf('\n')
          if (newline < 0) break
          const line = pending.slice(0, newline)
          pending = pending.slice(newline + 1)
          const parsed = JSON.parse(line) as FixtureMessage
          if (typeof parsed.event !== 'string') throw new Error('Fixture event is missing its name.')
          this.messages.push(parsed)
        }
      })
      socket.once('close', () => this.sockets.delete(socket))
    })
  }

  static async open(): Promise<FixtureObserver> {
    const server = net.createServer()
    server.listen({ host: '127.0.0.1', port: 0, exclusive: true })
    await withTimeout(
      new Promise<void>((resolve, reject) => {
        server.once('listening', resolve)
        server.once('error', reject)
      }),
      5_000,
      'Fixture observer did not bind.',
    )
    const address = server.address()
    if (address === null || typeof address === 'string') {
      server.close()
      throw new Error('Fixture observer did not obtain a TCP port.')
    }
    return new FixtureObserver(server, address.port)
  }

  waitFor(event: string, milliseconds = START_TIMEOUT_MS): Promise<FixtureMessage> {
    return eventually(
      () => this.messages.find((message) => message.event === event) ?? null,
      `Fake Unity did not report ${event}.`,
      milliseconds,
    )
  }

  send(command: Readonly<Record<string, unknown>>): void {
    const socket = [...this.sockets].find((candidate) => !candidate.destroyed)
    if (socket === undefined) throw new Error('Fake Unity observer is not connected.')
    socket.write(`${JSON.stringify(command)}\n`)
  }

  async close(): Promise<void> {
    for (const socket of this.sockets) socket.destroy()
    if (!this.server.listening) return
    await new Promise<void>((resolve) => this.server.close(() => resolve()))
  }
}

function hostileEnvironment(profileRoot: string): NodeJS.ProcessEnv {
  return {
    ...process.env,
    NO_COLOR: '1',
    PROJECT_STUDIO_BRIDGE_CAPABILITY: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    PROJECT_STUDIO_BRIDGE_PORT: '65534',
    PROJECT_STUDIO_BRIDGE_RUNTIME_DIR: path.join(profileRoot, 'hostile-runtime'),
    PROJECT_STUDIO_BRIDGE_TEST_POST_COMMIT_RESPONSE: '{"action":"drop"}',
    PROJECT_STUDIO_BRIDGE_URL: 'http://127.0.0.1:65534',
    PROJECT_STUDIO_SUPERVISOR_LEASE: 'hostile-lease',
    PROJECT_STUDIO_UNITY_APP: '/hostile/Unity.app',
    PROJECT_STUDIO_UNITY_PROJECT: '/hostile/unity-project',
  }
}

function spawnSupervisor(
  profileRoot: string,
  observer: FixtureObserver,
  mode: 'exit' | 'hold' | 'observe-restart',
  maxEngineRestarts = 3,
  exitCode = 0,
  helper = false,
): RunningSupervisor {
  const unityArguments = [
    '--observer-port',
    String(observer.port),
    '--mode',
    mode,
    '--exit-code',
    String(exitCode),
  ]
  if (helper) unityArguments.push('--helper', 'ignore-term')
  const child = spawn(process.execPath, [
    VITE_NODE,
    '--script',
    SUPERVISOR_ENTRY,
    '--profile-root',
    profileRoot,
    '--unity-executable',
    FAKE_UNITY_ENTRY,
    '--max-engine-restarts',
    String(maxEngineRestarts),
    '--',
    ...unityArguments,
  ], {
    cwd: ROOT,
    env: hostileEnvironment(profileRoot),
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const running: RunningSupervisor = { child, profileRoot, stderr: '', stdout: '' }
  trackedChildren.add(child)
  child.stdout?.on('data', (chunk: Buffer) => {
    running.stdout = appendBounded(running.stdout, chunk)
  })
  child.stderr?.on('data', (chunk: Buffer) => {
    running.stderr = appendBounded(running.stderr, chunk)
  })
  return running
}

function processDiagnostics(process_: RunningSupervisor): string {
  return [
    `pid=${String(process_.child.pid)} exit=${String(process_.child.exitCode)} ` +
      `signal=${String(process_.child.signalCode)}`,
    `stdout:\n${process_.stdout || '<empty>'}`,
    `stderr:\n${process_.stderr || '<empty>'}`,
  ].join('\n')
}

async function expectSupervisorExit(
  process_: RunningSupervisor,
  expectedCode: number,
  milliseconds = EXIT_TIMEOUT_MS,
): Promise<ProcessExit> {
  const result = await withTimeout(
    waitForExit(process_.child),
    milliseconds,
    `Supervisor exit timed out.\n${processDiagnostics(process_)}`,
  )
  trackedChildren.delete(process_.child)
  expect(result, processDiagnostics(process_)).toEqual({ code: expectedCode, signal: null })
  return result
}

function requiredString(message: FixtureMessage, field: string): string {
  const value = message[field]
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Fixture ${message.event}.${field} must be a nonempty string.`)
  }
  return value
}

function requiredInteger(message: FixtureMessage, field: string): number {
  const value = message[field]
  if (!Number.isSafeInteger(value)) {
    throw new Error(`Fixture ${message.event}.${field} must be an integer.`)
  }
  return value as number
}

function parseReadyLine(process_: RunningSupervisor): ReadyLine | null {
  const match = /\[supervisor\] ready endpoint=(http:\/\/127\.0\.0\.1:\d+) protocol=(\d+) snapshot=(\d+) schema=(\S+) session=(\S+)/
    .exec(process_.stdout)
  if (match === null) return null
  return {
    endpoint: match[1] as string,
    protocolVersion: Number(match[2]),
    snapshotVersion: Number(match[3]),
    schemaId: match[4] as string,
    sessionId: match[5] as string,
  }
}

function publishedEnginePids(output: string): number[] {
  return [...output.matchAll(/^\[supervisor\] engine pid=(\d+) incarnation=/gm)]
    .map((match) => Number(match[1]))
}

function isMissingPath(error: unknown): boolean {
  return (error as NodeJS.ErrnoException)?.code === 'ENOENT'
}

function allFiles(root: string): string[] {
  if (!fs.existsSync(root)) return []
  const files: string[] = []
  const visit = (candidate: string, discovered = false): void => {
    let stat: fs.Stats
    try {
      stat = fs.lstatSync(candidate)
    } catch (error) {
      if (discovered && isMissingPath(error)) return
      throw error
    }
    if (stat.isSymbolicLink()) return
    if (stat.isFile()) {
      files.push(candidate)
      return
    }
    if (!stat.isDirectory()) return
    let entries: string[]
    try {
      entries = fs.readdirSync(candidate)
    } catch (error) {
      if (discovered && isMissingPath(error)) return
      throw error
    }
    for (const entry of entries) visit(path.join(candidate, entry), true)
  }
  visit(root)
  return files.sort()
}

function mode(filePath: string): number {
  return fs.statSync(filePath).mode & 0o777
}

function pidIsAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM'
  }
}

function commandLine(pid: number): string {
  if (process.platform === 'linux') {
    try {
      return fs.readFileSync(`/proc/${String(pid)}/cmdline`, 'utf8').replaceAll('\0', ' ')
    } catch {
      // Fall through to the portable POSIX process query.
    }
  }
  const result = spawnSync('/bin/ps', ['-o', 'command=', '-p', String(pid)], {
    encoding: 'utf8',
    env: { LANG: 'C', LC_ALL: 'C', PATH: '/usr/bin:/bin' },
    timeout: 2_000,
  })
  if (result.status !== 0 || result.error !== undefined) {
    throw new Error(`Could not inspect command line for pid ${String(pid)}.`)
  }
  return result.stdout
}

function readJsonRecord(filePath: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null
  } catch {
    return null
  }
}

async function bridgeLock(
  profileRoot: string,
  excludedPid?: number,
  supervisor?: RunningSupervisor,
): Promise<{ filePath: string; pid: number }> {
  return eventually(() => {
    if (
      supervisor !== undefined &&
      (supervisor.child.exitCode !== null || supervisor.child.signalCode !== null)
    ) {
      throw new Error(`Supervisor exited before bridge lock recovery.\n${processDiagnostics(supervisor)}`)
    }
    const candidate = allFiles(profileRoot)
      .find((filePath) => path.basename(filePath) === 'bridge-runtime-v1.json.lock')
    if (candidate === undefined) return null
    const record = readJsonRecord(candidate)
    const pid = record?.pid
    if (!Number.isSafeInteger(pid) || pid === excludedPid) return null
    return { filePath: candidate, pid: pid as number }
  }, 'Bridge checkpoint lock did not expose the owned engine pid.')
}

async function supervisorLease(
  profileRoot: string,
  supervisorPid: number,
): Promise<{ filePath: string; record: Record<string, unknown> }> {
  return eventually(() => {
    for (const filePath of allFiles(profileRoot)) {
      const record = readJsonRecord(filePath)
      if (record === null) continue
      const supervisor = record?.supervisor
      if (
        supervisor !== null &&
        typeof supervisor === 'object' &&
        !Array.isArray(supervisor) &&
        (supervisor as Record<string, unknown>).pid === supervisorPid &&
        typeof (supervisor as Record<string, unknown>).processIncarnation === 'string' &&
        path.basename(filePath) === 'active-supervisor-v1.json'
      ) {
        return { filePath, record }
      }
    }
    return null
  }, 'Supervisor lease did not bind its pid and process incarnation.')
}

function profileContains(root: string, needle: string): string[] {
  return allFiles(root).filter((filePath) => {
    const stat = fs.statSync(filePath)
    if (stat.size > 40 * 1024 * 1024) return false
    return fs.readFileSync(filePath).includes(Buffer.from(needle, 'utf8'))
  })
}

function logFiles(root: string): string[] {
  return allFiles(root).filter((filePath) => filePath.endsWith('.log'))
}

function leaseRecord(
  pid: number,
  processIncarnation: string,
  launchId: string,
): SupervisorLeaseRecord {
  return {
    version: 1,
    launchId,
    launchDirectory: `launch-20260821T000000000Z-${launchId}`,
    startedAt: '2026-08-21T00:00:00.000Z',
    phase: 'starting',
    supervisor: { pid, processIncarnation },
    engine: null,
    unity: null,
    fixedPort: null,
    engineRestarts: 0,
  }
}

describe.sequential('one-command studio supervisor', () => {
  it('tolerates only entries that disappear during a recursive profile scan', () => {
    const root = temporaryRoot('profile-scan-race')
    const stable = path.join(root, 'stable-secret-audit-target')
    const vanishedFile = path.join(root, 'vanished-file')
    const vanishedDirectory = path.join(root, 'vanished-directory')
    const linked = path.join(root, 'linked-secret-audit-target')
    fs.writeFileSync(stable, 'stable')
    fs.writeFileSync(vanishedFile, 'ephemeral')
    fs.mkdirSync(vanishedDirectory)
    fs.writeFileSync(path.join(vanishedDirectory, 'nested'), 'ephemeral')
    fs.symlinkSync(stable, linked)

    const originalLstat = fs.lstatSync.bind(fs)
    let removedDirectory = false
    const lstatSpy = vi.spyOn(fs, 'lstatSync').mockImplementation((candidate) => {
      if (String(candidate) === vanishedFile) fs.unlinkSync(vanishedFile)
      if (String(candidate) === vanishedDirectory && !removedDirectory) {
        const stat = originalLstat(candidate)
        removedDirectory = true
        fs.rmSync(vanishedDirectory, { recursive: true })
        return stat
      }
      return originalLstat(candidate)
    })
    try {
      expect(allFiles(root)).toEqual([stable])
    } finally {
      lstatSpy.mockRestore()
    }

    const accessDenied = Object.assign(new Error('test access denied'), { code: 'EACCES' })
    const failureSpy = vi.spyOn(fs, 'lstatSync').mockImplementation((candidate) => {
      if (String(candidate) === stable) throw accessDenied
      return originalLstat(candidate)
    })
    try {
      expect(() => allFiles(root)).toThrow(accessDenied)
    } finally {
      failureSpy.mockRestore()
    }
  })

  it('fails closed when the Unity app is missing, multiply configured, or control arguments are injected', () => {
    const root = temporaryRoot('config')
    const profileRoot = path.join(root, 'profile')
    const environment = { HOME: root }

    expect(() => parseStudioSupervisorArguments(
      ['--profile-root', profileRoot, '--unity-app', path.join(root, 'missing.app')],
      environment,
      ROOT,
    )).toThrow()

    const app = path.join(root, 'Declared.app')
    const macos = path.join(app, 'Contents', 'MacOS')
    fs.mkdirSync(macos, { mode: 0o700, recursive: true })
    for (const name of ['candidate-one', 'candidate-two']) {
      const candidate = path.join(macos, name)
      fs.writeFileSync(candidate, '#!/bin/sh\nexit 0\n', { mode: 0o700 })
    }
    const infoPlist = path.join(app, 'Contents', 'Info.plist')
    fs.writeFileSync(infoPlist, '<?xml version="1.0"?><plist><dict></dict></plist>')
    expect(() => parseStudioSupervisorArguments(
      ['--profile-root', profileRoot, '--unity-app', app],
      environment,
      ROOT,
    )).toThrow(/declare CFBundleExecutable/)

    fs.writeFileSync(infoPlist, [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<plist version="1.0"><dict>',
      '<key>CFBundleExecutable</key><string>candidate-one</string>',
      '</dict></plist>',
    ].join(''))
    const declared = parseStudioSupervisorArguments(
      ['--profile-root', profileRoot, '--unity-app', app],
      environment,
      ROOT,
    )
    expect(declared.help).toBe(false)
    if (declared.help) throw new Error('Declared Unity app unexpectedly requested help.')
    expect(declared.options.unityExecutable).toBe(
      fs.realpathSync.native(path.join(macos, 'candidate-one')),
    )

    expect(() => parseStudioSupervisorArguments([
      '--profile-root',
      profileRoot,
      '--unity-app',
      app,
      '--unity-executable',
      process.execPath,
    ], environment, ROOT)).toThrow(/exactly one/)

    expect(() => parseStudioSupervisorArguments([
      '--profile-root',
      profileRoot,
      '--unity-executable',
      process.execPath,
      '--',
      '-studioBridgeUrl=http://127.0.0.1:9999',
    ], environment, ROOT)).toThrow(/owned by the studio supervisor/)

    const restartBudget = new EngineRestartBudget(2, 1_000)
    expect(restartBudget.claim(0)).toBe(1)
    expect(restartBudget.claim(0)).toBe(2)
    expect(restartBudget.claim(0)).toBeNull()
    expect(restartBudget.claim(1_000)).toBe(1)
  })

  it('does not count platform-dependent cleanup as another engine publication', () => {
    expect(publishedEnginePids([
      '[supervisor] engine pid=8399 incarnation=linux-proc:boot-id:123',
      '[supervisor] cleanup engine pid=8399 signal=SIGTERM',
      '[supervisor] cleanup unpublished engine pid=8400 signal=SIGTERM',
      '[supervisor] engine pid=8401 was reused; no signal sent',
      '[supervisor] engine pid=8402 incarnation=linux-proc:boot-id:456',
    ].join('\n'))).toEqual([8399, 8402])
  })

  it('recovers stable empty or partial acquisition artifacts without weakening private ownership', async () => {
    for (const [name, contents] of [
      ['empty', ''],
      ['partial', '{"engine":null'],
    ] as const) {
      const root = temporaryRoot(`partial-lease-${name}`)
      const profileRoot = path.join(root, 'profile')
      const layout = prepareSupervisorProfile(profileRoot)
      fs.writeFileSync(layout.activeLeasePath, contents, { mode: 0o600 })

      const lease = await SupervisorLease.acquire(profileRoot)
      try {
        expect(lease.snapshot().supervisor.pid).toBe(process.pid)
        expect(mode(layout.activeLeasePath)).toBe(0o600)
      } finally {
        lease.release()
      }
      expect(fs.existsSync(layout.activeLeasePath)).toBe(false)
    }
  })

  it('never removes a concurrently replaced live lease while reclaiming a stale owner', async () => {
    const root = temporaryRoot('lease-replacement-race')
    const profileRoot = path.join(root, 'profile')
    const layout = prepareSupervisorProfile(profileRoot)
    const stale = leaseRecord(
      2_147_483_647,
      'test-dead-supervisor-incarnation',
      '11111111-1111-4111-8111-111111111111',
    )
    const incarnation = currentProcessIncarnation()
    if (incarnation === null) throw new Error('Current process incarnation is unavailable.')
    const live = leaseRecord(
      process.pid,
      incarnation,
      '22222222-2222-4222-8222-222222222222',
    )
    const liveJson = canonicalJson(live)
    fs.writeFileSync(layout.activeLeasePath, canonicalJson(stale), { mode: 0o600 })

    const originalRename = fs.renameSync.bind(fs)
    const originalUnlink = fs.unlinkSync.bind(fs)
    let replaced = false
    const replaceAtDestructiveBoundary = (): void => {
      if (replaced) return
      replaced = true
      const replacement = path.join(layout.profileRoot, '.concurrent-live-lease')
      fs.writeFileSync(replacement, liveJson, { mode: 0o600 })
      originalRename(replacement, layout.activeLeasePath)
    }
    const renameSpy = vi.spyOn(fs, 'renameSync').mockImplementation((source, destination) => {
      if (String(source) === layout.activeLeasePath) replaceAtDestructiveBoundary()
      originalRename(source, destination)
    })
    const unlinkSpy = vi.spyOn(fs, 'unlinkSync').mockImplementation((filePath) => {
      if (String(filePath) === layout.activeLeasePath) replaceAtDestructiveBoundary()
      originalUnlink(filePath)
    })

    let unexpectedLease: SupervisorLease | null = null
    let failure: unknown = null
    try {
      unexpectedLease = await SupervisorLease.acquire(profileRoot)
    } catch (error) {
      failure = error
    } finally {
      renameSpy.mockRestore()
      unlinkSpy.mockRestore()
    }
    if (unexpectedLease !== null) unexpectedLease.release()

    expect(replaced).toBe(true)
    expect(failure).toBeInstanceOf(Error)
    expect((failure as Error).message).toMatch(/already supervised|ownership changed|live lease/i)
    expect(fs.readFileSync(layout.activeLeasePath, 'utf8')).toBe(liveJson)
    expect(mode(layout.activeLeasePath)).toBe(0o600)
  })

  it('launches only after authenticated readiness and preserves one private profile across distinct logs', async () => {
    const root = temporaryRoot('profile')
    const profileRoot = path.join(root, 'profile')
    const launch = async (): Promise<{
      capability: string
      health: FixtureMessage
      logs: string[]
      ready: ReadyLine
    }> => {
      const observer = await FixtureObserver.open()
      try {
        const supervisor = spawnSupervisor(profileRoot, observer, 'hold')
        const started = await observer.waitFor('started')
        const health = await observer.waitFor('health')
        await observer.waitFor('holding')
        const capability = requiredString(started, 'capability')
        const engine = await bridgeLock(profileRoot)
        const ready = await eventually(
          () => parseReadyLine(supervisor),
          `Supervisor did not publish readiness.\n${processDiagnostics(supervisor)}`,
        )

        expect(started.argvContainsCapability).toBe(false)
        expect(started.ownedLogFilePair).toBe(true)
        expect(requiredString(started, 'endpoint')).toBe(ready.endpoint)
        expect(requiredInteger(health, 'authenticatedStatus')).toBe(200)
        expect(requiredInteger(health, 'unauthenticatedStatus')).toBe(401)
        expect(requiredString(health, 'sessionId')).toBe(ready.sessionId)
        expect(requiredString(health, 'schemaId')).toBe(ready.schemaId)
        expect(requiredInteger(health, 'protocolVersion')).toBe(ready.protocolVersion)
        expect(requiredInteger(health, 'snapshotVersion')).toBe(ready.snapshotVersion)
        expect(
          capability === hostileEnvironment(profileRoot).PROJECT_STUDIO_BRIDGE_CAPABILITY,
        ).toBe(false)
        expect(started.inherited).toEqual({
          bridgePort: null,
          bridgeRuntimeDir: null,
          postCommitResponse: null,
          supervisorLease: null,
          unityApp: null,
          unityExecutable: null,
          unityProject: null,
        })
        expect(supervisor.child.spawnargs.some((argument) => argument.includes(capability))).toBe(false)
        expect(commandLine(supervisor.child.pid as number).includes(capability)).toBe(false)
        expect(commandLine(engine.pid).includes(capability)).toBe(false)
        expect(commandLine(requiredInteger(started, 'pid')).includes(capability)).toBe(false)
        expect(supervisor.stdout.includes(capability)).toBe(false)
        expect(supervisor.stderr.includes(capability)).toBe(false)
        expect(process.env.PROJECT_STUDIO_BRIDGE_CAPABILITY === capability).toBe(false)

        observer.send({ command: 'exit', code: 0 })
        await expectSupervisorExit(supervisor, 0)
        await eventually(
          () => pidIsAlive(engine.pid) ? null : true,
          'Unity exit did not stop the owned bridge process.',
        )
        expect(fs.existsSync(engine.filePath)).toBe(false)
        expect(profileContains(profileRoot, capability)).toEqual([])
        expect(supervisor.stdout.includes(capability)).toBe(false)
        expect(supervisor.stderr.includes(capability)).toBe(false)

        const logs = logFiles(profileRoot)
        expect(logs.length).toBeGreaterThanOrEqual(1)
        expect(logs.some((filePath) => fs.readFileSync(filePath, 'utf8')
          .includes('[REDACTED_CAPABILITY]'))).toBe(true)
        for (const filePath of logs) {
          expect(mode(filePath)).toBe(0o600)
          expect(fs.readFileSync(filePath, 'utf8').includes(capability)).toBe(false)
        }
        return { capability, health, logs, ready }
      } finally {
        await observer.close()
      }
    }

    const first = await launch()
    const second = await launch()
    expect(requiredString(second.health, 'sessionId')).toBe(requiredString(first.health, 'sessionId'))
    expect(requiredString(second.health, 'stateDigest')).toBe(requiredString(first.health, 'stateDigest'))
    expect(requiredInteger(second.health, 'stateRevision')).toBe(requiredInteger(first.health, 'stateRevision'))
    expect(requiredString(second.health, 'runtimeInstanceId'))
      .not.toBe(requiredString(first.health, 'runtimeInstanceId'))
    expect(second.capability === first.capability).toBe(false)
    expect(second.logs.length).toBeGreaterThan(first.logs.length)
    expect(mode(profileRoot)).toBe(0o700)
    for (const directory of allFiles(profileRoot).map(path.dirname)) {
      expect(mode(directory)).toBe(0o700)
    }
  }, 60_000)

  it('restarts a SIGKILLed engine on its fixed port without changing durable authority', async () => {
    const root = temporaryRoot('restart')
    const profileRoot = path.join(root, 'profile')
    const observer = await FixtureObserver.open()
    try {
      const supervisor = spawnSupervisor(profileRoot, observer, 'observe-restart')
      const started = await observer.waitFor('started')
      const health = await observer.waitFor('health')
      const initial = await bridgeLock(profileRoot)
      const ready = await eventually(
        () => parseReadyLine(supervisor),
        `Supervisor did not publish readiness.\n${processDiagnostics(supervisor)}`,
      )
      expect(process.kill(initial.pid, 'SIGKILL')).toBe(true)

      const replacement = await observer.waitFor('replacement', 30_000)
      const restarted = await bridgeLock(profileRoot, initial.pid)
      expect(restarted.filePath).toBe(initial.filePath)
      expect(requiredString(replacement, 'endpoint')).toBe(ready.endpoint)
      expect(requiredString(replacement, 'sessionId')).toBe(requiredString(health, 'sessionId'))
      expect(requiredString(replacement, 'stateDigest')).toBe(requiredString(health, 'stateDigest'))
      expect(requiredInteger(replacement, 'stateRevision')).toBe(requiredInteger(health, 'stateRevision'))
      expect(requiredString(replacement, 'runtimeInstanceId'))
        .not.toBe(requiredString(health, 'runtimeInstanceId'))
      expect(requiredString(started, 'endpoint')).toBe(ready.endpoint)

      await observer.waitFor('holding-after-replacement')
      observer.send({ command: 'exit', code: 0 })
      await expectSupervisorExit(supervisor, 0, 30_000)
      await eventually(
        () => pidIsAlive(restarted.pid) ? null : true,
        'Supervisor did not stop the replacement bridge after Unity exited.',
      )
      expect(fs.existsSync(restarted.filePath)).toBe(false)
      const capability = requiredString(started, 'capability')
      expect(profileContains(profileRoot, capability)).toEqual([])

      const combinedLog = logFiles(profileRoot)
        .map((filePath) => fs.readFileSync(filePath, 'utf8'))
        .join('\n')
      expect(combinedLog).toMatch(/engine.*port=0/i)
      expect(combinedLog).toMatch(new RegExp(`engine.*port=${new URL(ready.endpoint).port}`, 'i'))
    } finally {
      await observer.close()
    }
  }, 60_000)

  it('cancels replacement work when Unity exits during an engine outage', async () => {
    const root = temporaryRoot('outage-shutdown')
    const profileRoot = path.join(root, 'profile')
    const observer = await FixtureObserver.open()
    try {
      const supervisor = spawnSupervisor(profileRoot, observer, 'hold')
      await observer.waitFor('health')
      await observer.waitFor('holding')
      const initial = await bridgeLock(profileRoot)
      expect(process.kill(initial.pid, 'SIGKILL')).toBe(true)
      await eventually(
        () => pidIsAlive(initial.pid) ? null : true,
        'Killed engine leader remained alive.',
      )

      observer.send({ command: 'exit', code: 0 })
      await expectSupervisorExit(supervisor, 0, 20_000)

      const shutdownIndex = supervisor.stdout.lastIndexOf('unity exit ')
      expect(shutdownIndex).toBeGreaterThanOrEqual(0)
      expect(supervisor.stdout.slice(shutdownIndex).includes('engine spawn mode=restart')).toBe(false)
      const enginePids = publishedEnginePids(supervisor.stdout)
      expect(enginePids[0]).toBe(initial.pid)
      for (const pid of new Set(enginePids)) {
        await eventually(
          () => pidIsAlive(pid) ? null : true,
          `Outage shutdown left engine pid ${String(pid)} alive.`,
        )
      }
      expect(allFiles(profileRoot).some((filePath) =>
        path.basename(filePath) === 'active-supervisor-v1.json')).toBe(false)
      const checkpointLock = allFiles(profileRoot).find((filePath) =>
        path.basename(filePath) === 'bridge-runtime-v1.json.lock')
      if (checkpointLock !== undefined) {
        expect(readJsonRecord(checkpointLock)?.pid).toBe(initial.pid)
      }
    } finally {
      await observer.close()
    }
  }, 40_000)

  it('kills a Unity helper that survives TERM before releasing the active lease', async () => {
    const root = temporaryRoot('unity-helper')
    const profileRoot = path.join(root, 'profile')
    const observer = await FixtureObserver.open()
    let helperPid: number | null = null
    try {
      const supervisor = spawnSupervisor(profileRoot, observer, 'hold', 3, 0, true)
      const helper = await observer.waitFor('helper')
      helperPid = requiredInteger(helper, 'pid')
      await observer.waitFor('health')
      await observer.waitFor('holding')
      expect(pidIsAlive(helperPid)).toBe(true)

      observer.send({ command: 'exit', code: 0 })
      await expectSupervisorExit(supervisor, 0, 20_000)
      await eventually(
        () => helperPid !== null && pidIsAlive(helperPid) ? null : true,
        'Unity helper survived owned process-group cleanup.',
      )
      expect(allFiles(profileRoot).some((filePath) =>
        path.basename(filePath) === 'active-supervisor-v1.json')).toBe(false)
      const combinedLog = logFiles(profileRoot)
        .map((filePath) => fs.readFileSync(filePath, 'utf8'))
        .join('\n')
      expect(combinedLog).toMatch(/cleanup unity .*signal=SIGKILL/)
    } finally {
      if (
        helperPid !== null &&
        pidIsAlive(helperPid) &&
        commandLine(helperPid).includes("process.on('SIGTERM'")
      ) process.kill(helperPid, 'SIGKILL')
      await observer.close()
    }
  }, 40_000)

  it('rejects a concurrent owner, shuts down on signal, and reclaims only a stale incarnation', async () => {
    const root = temporaryRoot('lease')
    const profileRoot = path.join(root, 'profile')
    const firstObserver = await FixtureObserver.open()
    const rejectedObserver = await FixtureObserver.open()
    let staleLease: { filePath: string; record: Record<string, unknown> } | null = null
    try {
      const first = spawnSupervisor(profileRoot, firstObserver, 'hold')
      await firstObserver.waitFor('health')
      await firstObserver.waitFor('holding')
      if (first.child.pid === undefined) throw new Error('Supervisor pid is unavailable.')
      staleLease = await supervisorLease(profileRoot, first.child.pid)
      const firstEngine = await bridgeLock(profileRoot)

      const rejected = spawnSupervisor(profileRoot, rejectedObserver, 'exit')
      await expectSupervisorExit(rejected, 1)
      expect(pidIsAlive(first.child.pid)).toBe(true)
      expect(pidIsAlive(firstEngine.pid)).toBe(true)
      expect(rejectedObserver.messages).toEqual([])

      expect(first.child.kill('SIGTERM')).toBe(true)
      await expectSupervisorExit(first, 143)
      await eventually(
        () => pidIsAlive(firstEngine.pid) ? null : true,
        'Signal shutdown left the bridge child alive.',
      )
      expect(fs.existsSync(firstEngine.filePath)).toBe(false)
      expect(fs.existsSync(staleLease.filePath)).toBe(false)
    } finally {
      await firstObserver.close()
      await rejectedObserver.close()
    }

    if (staleLease === null) throw new Error('Supervisor lease was not observed.')
    const staleSupervisor = staleLease.record.supervisor
    if (staleSupervisor === null || typeof staleSupervisor !== 'object' || Array.isArray(staleSupervisor)) {
      throw new Error('Observed supervisor lease owner is malformed.')
    }
    const unrelated = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
      detached: true,
      stdio: 'ignore',
    })
    trackedChildren.add(unrelated)
    if (unrelated.pid === undefined) throw new Error('Unrelated process pid is unavailable.')
    await eventually(
      () => pidIsAlive(unrelated.pid as number) ? true : null,
      'Unrelated process did not start.',
    )
    fs.mkdirSync(path.dirname(staleLease.filePath), { mode: 0o700, recursive: true })
    fs.writeFileSync(staleLease.filePath, JSON.stringify({
      ...staleLease.record,
      engine: {
        kind: 'engine',
        pid: unrelated.pid,
        processGroupId: unrelated.pid,
        processIncarnation: 'test-wrong-child-incarnation',
      },
      supervisor: {
        ...(staleSupervisor as Record<string, unknown>),
        pid: process.pid,
        processIncarnation: 'test-stale-supervisor-incarnation',
      },
    }), { mode: 0o600 })

    const recoveryObserver = await FixtureObserver.open()
    try {
      const recovered = spawnSupervisor(profileRoot, recoveryObserver, 'exit')
      await recoveryObserver.waitFor('health')
      await expectSupervisorExit(recovered, 0)
      expect(pidIsAlive(unrelated.pid)).toBe(true)
      expect(fs.existsSync(staleLease.filePath)).toBe(false)
    } finally {
      await recoveryObserver.close()
    }
  }, 60_000)

  it('bounds engine crash loops and never touches an unrelated process', async () => {
    const root = temporaryRoot('crash-loop')
    const profileRoot = path.join(root, 'profile')
    const observer = await FixtureObserver.open()
    const unrelated = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
      stdio: 'ignore',
    })
    trackedChildren.add(unrelated)
    try {
      const supervisor = spawnSupervisor(profileRoot, observer, 'hold', 2)
      await observer.waitFor('health')
      await observer.waitFor('holding')

      let previousPid: number | undefined
      for (let crash = 0; crash < 3; crash++) {
        const engine = await bridgeLock(profileRoot, previousPid, supervisor)
        previousPid = engine.pid
        await eventually(
          () => supervisor.stdout.includes(`engine ready pid=${String(engine.pid)} port=`)
            ? true
            : null,
          `Replacement engine ${String(engine.pid)} never reached authenticated readiness.`,
        )
        expect(process.kill(engine.pid, 'SIGKILL')).toBe(true)
      }
      await expectSupervisorExit(supervisor, 1, 40_000)
      expect(pidIsAlive(unrelated.pid as number)).toBe(true)
      if (previousPid === undefined) throw new Error('No bridge process was killed.')
      await eventually(
        () => pidIsAlive(previousPid as number) ? null : true,
        'Crash-loop shutdown left the final bridge process alive.',
      )
      const remainingLock = allFiles(profileRoot)
        .find((filePath) => path.basename(filePath) === 'bridge-runtime-v1.json.lock')
      if (remainingLock !== undefined) {
        const stalePid = readJsonRecord(remainingLock)?.pid
        expect(Number.isSafeInteger(stalePid)).toBe(true)
        expect(pidIsAlive(stalePid as number)).toBe(false)
      }

      const combinedLog = logFiles(profileRoot)
        .map((filePath) => fs.readFileSync(filePath, 'utf8'))
        .join('\n')
      expect(combinedLog).toMatch(/restart.*budget|budget.*exhausted/i)
    } finally {
      await observer.close()
    }
  }, 70_000)
})
