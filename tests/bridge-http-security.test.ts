import { spawn, type ChildProcess } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import fs from 'node:fs'
import { request as nodeRequest } from 'node:http'
import { connect } from 'node:net'
import os from 'node:os'
import path from 'node:path'

import { expect, it } from 'vitest'

import {
  PROTOCOL_VERSION,
  SCHEMA_ID,
  type SubmitIntentCommand,
} from '../bridge/protocol.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import {
  selectJourneyIntent,
  type CommandResponse,
  type SnapshotEnvelope,
} from '../bridge/session.ts'

const ROOT = process.cwd()
const VITE_NODE = path.join(ROOT, 'node_modules', 'vite-node', 'vite-node.mjs')
const SERVER_ENTRY = path.join(ROOT, 'bridge', 'server.ts')
const CAPABILITY_HEADER = 'x-project-studio-capability'
const STARTUP_TIMEOUT_MS = 20_000
const HTTP_TIMEOUT_MS = 10_000
const EXIT_TIMEOUT_MS = 10_000
const MAX_CAPTURED_BYTES = 1_000_000

type CapturedProcess = {
  child: ChildProcess
  stdout: string
  stderr: string
}

type RunningBridge = CapturedProcess & {
  baseUrl: URL
  capability: string
}

type RawResponse = {
  status: number
  body: string
}

type RequestSpec = {
  pathname: string
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  body?: string
}

function appendBounded(previous: string, chunk: Buffer | string): string {
  const combined = previous + chunk.toString()
  if (Buffer.byteLength(combined, 'utf8') <= MAX_CAPTURED_BYTES) return combined
  return combined.slice(-MAX_CAPTURED_BYTES)
}

function timeout<T>(promise: Promise<T>, milliseconds: number, message: string): Promise<T> {
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

function spawnBridge(runtimeDirectory: string, capability: string | undefined): CapturedProcess {
  const environment = { ...process.env }
  delete environment.PROJECT_STUDIO_BRIDGE_CAPABILITY
  if (capability !== undefined) environment.PROJECT_STUDIO_BRIDGE_CAPABILITY = capability
  environment.NO_COLOR = '1'
  environment.PROJECT_STUDIO_BRIDGE_PORT = '0'
  environment.PROJECT_STUDIO_BRIDGE_RUNTIME_DIR = runtimeDirectory

  const child = spawn(process.execPath, [VITE_NODE, SERVER_ENTRY], {
    cwd: ROOT,
    env: environment,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const captured: CapturedProcess = { child, stdout: '', stderr: '' }
  child.stdout?.on('data', (chunk: Buffer) => {
    captured.stdout = appendBounded(captured.stdout, chunk)
  })
  child.stderr?.on('data', (chunk: Buffer) => {
    captured.stderr = appendBounded(captured.stderr, chunk)
  })
  return captured
}

function waitForExit(process: CapturedProcess): Promise<{ code: number | null; signal: string | null }> {
  if (process.child.exitCode !== null || process.child.signalCode !== null) {
    return Promise.resolve({ code: process.child.exitCode, signal: process.child.signalCode })
  }
  return new Promise((resolve) => {
    process.child.once('exit', (code, signal) => resolve({ code, signal }))
  })
}

async function stopBridge(process: CapturedProcess | null): Promise<void> {
  if (process === null || process.child.exitCode !== null || process.child.signalCode !== null) return
  const exiting = waitForExit(process)
  process.child.kill('SIGTERM')
  try {
    await timeout(exiting, EXIT_TIMEOUT_MS, 'Bridge did not exit after SIGTERM.')
  } catch {
    process.child.kill('SIGKILL')
    await timeout(waitForExit(process), EXIT_TIMEOUT_MS, 'Bridge did not exit after SIGKILL.')
  }
}

async function startBridge(runtimeDirectory: string): Promise<RunningBridge> {
  const capability = randomBytes(32).toString('base64url')
  const captured = spawnBridge(runtimeDirectory, capability)
  const port = await timeout(new Promise<number>((resolve, reject) => {
    let settled = false
    const inspect = (): void => {
      if (settled) return
      const match = /\[bridge\] live http:\/\/127\.0\.0\.1:(\d+)/.exec(captured.stdout)
      if (match === null) return
      settled = true
      resolve(Number(match[1]))
    }
    captured.child.stdout?.on('data', inspect)
    captured.child.once('error', (error) => {
      if (settled) return
      settled = true
      reject(error)
    })
    captured.child.once('exit', (code, signal) => {
      if (settled) return
      settled = true
      reject(new Error(
        `Bridge exited before startup (code=${String(code)}, signal=${String(signal)}).\n` +
          `${captured.stdout}\n${captured.stderr}`,
      ))
    })
  }), STARTUP_TIMEOUT_MS, 'Bridge startup timed out.')
  return Object.assign(captured, {
    baseUrl: new URL(`http://127.0.0.1:${String(port)}`),
    capability,
  })
}

function rawSocketRequest(bridge: RunningBridge, headers: readonly string[]): Promise<RawResponse> {
  return timeout(new Promise<RawResponse>((resolve, reject) => {
    const socket = connect(Number(bridge.baseUrl.port), bridge.baseUrl.hostname)
    const chunks: Buffer[] = []
    socket.once('connect', () => {
      socket.write([
        'GET /health HTTP/1.1',
        ...headers,
        'Connection: close',
        '',
        '',
      ].join('\r\n'))
    })
    socket.on('data', (chunk: Buffer) => chunks.push(chunk))
    socket.once('error', reject)
    socket.once('end', () => {
      const wire = Buffer.concat(chunks).toString('utf8')
      const [head, body = ''] = wire.split('\r\n\r\n', 2)
      const status = Number(/^HTTP\/1\.1 (\d{3})/.exec(head ?? '')?.[1] ?? 0)
      resolve({ status, body })
    })
  }), HTTP_TIMEOUT_MS, 'Raw security request timed out.')
}

function rawRequest(bridge: RunningBridge, spec: RequestSpec): Promise<RawResponse> {
  return timeout(new Promise<RawResponse>((resolve, reject) => {
    const request = nodeRequest({
      hostname: bridge.baseUrl.hostname,
      port: bridge.baseUrl.port,
      path: spec.pathname,
      method: spec.method ?? 'GET',
      headers: spec.headers,
    }, (response) => {
      const chunks: Buffer[] = []
      response.on('data', (chunk: Buffer) => chunks.push(chunk))
      response.once('end', () => resolve({
        status: response.statusCode ?? 0,
        body: Buffer.concat(chunks).toString('utf8'),
      }))
    })
    request.once('error', reject)
    if (spec.body !== undefined) request.write(spec.body)
    request.end()
  }), HTTP_TIMEOUT_MS, `${spec.method ?? 'GET'} ${spec.pathname} timed out.`)
}

function authorizedHeaders(
  bridge: RunningBridge,
  additional: Record<string, string> = {},
): Record<string, string> {
  return { [CAPABILITY_HEADER]: bridge.capability, ...additional }
}

function parseJson<T>(response: RawResponse): T {
  return JSON.parse(response.body) as T
}

function journeyCommand(snapshot: SnapshotEnvelope): string {
  const intent = selectJourneyIntent(
    snapshot.availableIntents.filter((candidate) => candidate.kind !== 'startConstruction'),
    snapshot.snapshot.journeyNotices.firstFilmJourney,
  )
  if (intent === undefined) throw new Error('Initial snapshot has no Movie journey intent.')
  return canonicalJson({
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId: snapshot.sessionId,
    commandId: 'http-security-command',
    expectedStateRevision: snapshot.stateRevision,
    type: 'submitIntent',
    payload: { intentId: intent.intentId },
  } satisfies SubmitIntentCommand)
}

it('fails closed before opening runtime state when the launch capability is absent or invalid', async () => {
  for (const testCase of [
    { name: 'absent', capability: undefined },
    { name: 'invalid', capability: 'not-a-strong-capability' },
  ] as const) {
    const runtimeDirectory = fs.mkdtempSync(path.join(os.tmpdir(), `bridge-capability-${testCase.name}-`))
    fs.chmodSync(runtimeDirectory, 0o700)
    const process = spawnBridge(runtimeDirectory, testCase.capability)
    try {
      const exit = await timeout(
        waitForExit(process),
        STARTUP_TIMEOUT_MS,
        `Bridge with ${testCase.name} capability did not exit.`,
      )
      expect(exit).toEqual({ code: 1, signal: null })
      expect(process.stderr).toContain(
        'PROJECT_STUDIO_BRIDGE_CAPABILITY must be a canonical 32-byte base64url value.',
      )
      if (testCase.capability !== undefined) {
        expect(process.stdout).not.toContain(testCase.capability)
        expect(process.stderr).not.toContain(testCase.capability)
      }
      expect(fs.readdirSync(runtimeDirectory)).toEqual([])
    } finally {
      await stopBridge(process)
      fs.rmSync(runtimeDirectory, { recursive: true, force: true })
    }
  }
}, 60_000)

it('denies cross-origin and unauthenticated reads and mutations before runtime access', async () => {
  const runtimeDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-http-security-'))
  fs.chmodSync(runtimeDirectory, 0o700)
  const checkpointPath = path.join(runtimeDirectory, 'bridge-runtime-v1.json')
  let bridge: RunningBridge | null = null
  try {
    bridge = await startBridge(runtimeDirectory)
    const health = await rawRequest(bridge, {
      pathname: '/health',
      headers: authorizedHeaders(bridge),
    })
    expect(health.status).toBe(200)
    const healthBody = parseJson<{ runtimeInstanceId: string }>(health)
    expect(healthBody.runtimeInstanceId).toMatch(/^[0-9a-f-]{36}$/)

    const session = await rawRequest(bridge, {
      pathname: '/session',
      headers: authorizedHeaders(bridge),
    })
    expect(session.status).toBe(200)
    expect(parseJson<{ runtimeInstanceId: string }>(session).runtimeInstanceId)
      .toBe(healthBody.runtimeInstanceId)

    const initialRaw = await rawRequest(bridge, {
      pathname: '/snapshot',
      headers: authorizedHeaders(bridge),
    })
    expect(initialRaw.status).toBe(200)
    expect(initialRaw.body).not.toContain(healthBody.runtimeInstanceId)
    const initial = parseJson<SnapshotEnvelope>(initialRaw)
    const commandBody = journeyCommand(initial)
    const deniedBody = canonicalJson({ error: 'Request rejected.' })
    const fillerHeaders = Array.from({ length: 65 }, (_, index) =>
      `X-Filler-${String(index)}: bounded`)
    for (const [protectedTail, expectedStatus] of [
      [['Origin: http://attacker.invalid'], 403],
      [[`${CAPABILITY_HEADER}: ${bridge.capability}`], 401],
      [[`Host: 127.0.0.1:${bridge.baseUrl.port}`], 403],
    ] as const) {
      const overflow = await rawSocketRequest(bridge, [
        `Host: 127.0.0.1:${bridge.baseUrl.port}`,
        `${CAPABILITY_HEADER}: ${bridge.capability}`,
        ...fillerHeaders,
        ...protectedTail,
      ])
      expect(overflow.status).toBe(expectedStatus)
      expect(overflow.body).toBe(deniedBody)
    }
    const attacks: Array<RequestSpec & { expectedStatus: number }> = [
      { pathname: '/snapshot', expectedStatus: 401 },
      {
        pathname: '/contract',
        headers: { [CAPABILITY_HEADER]: randomBytes(32).toString('base64url') },
        expectedStatus: 401,
      },
      {
        pathname: '/health',
        headers: authorizedHeaders(bridge, { host: `localhost:${bridge.baseUrl.port}` }),
        expectedStatus: 403,
      },
      {
        pathname: '/session',
        headers: authorizedHeaders(bridge, { origin: 'http://attacker.invalid' }),
        expectedStatus: 403,
      },
      {
        pathname: '/command',
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: commandBody,
        expectedStatus: 401,
      },
      {
        pathname: '/command',
        method: 'POST',
        headers: {
          [CAPABILITY_HEADER]: randomBytes(32).toString('base64url'),
          'content-type': 'application/json',
        },
        body: commandBody,
        expectedStatus: 401,
      },
      {
        pathname: '/command',
        method: 'POST',
        headers: authorizedHeaders(bridge, {
          host: `localhost:${bridge.baseUrl.port}`,
          'content-type': 'application/json',
        }),
        body: commandBody,
        expectedStatus: 403,
      },
      {
        pathname: '/command',
        method: 'POST',
        headers: authorizedHeaders(bridge, {
          origin: 'http://attacker.invalid',
          'content-type': 'application/json',
        }),
        body: commandBody,
        expectedStatus: 403,
      },
      {
        pathname: '/command',
        method: 'POST',
        headers: authorizedHeaders(bridge, { 'content-type': 'text/plain' }),
        body: commandBody,
        expectedStatus: 415,
      },
      {
        pathname: '/command',
        method: 'POST',
        headers: authorizedHeaders(bridge),
        body: commandBody,
        expectedStatus: 415,
      },
    ]
    for (const attack of attacks) {
      const response = await rawRequest(bridge, attack)
      expect(response.status).toBe(attack.expectedStatus)
      expect(response.body).toBe(deniedBody)
      expect(response.body).not.toContain(bridge.capability)
      expect(response.body).not.toContain(initial.sessionId)
      expect(response.body).not.toContain(initial.stateDigest)
    }

    const unchangedRaw = await rawRequest(bridge, {
      pathname: '/snapshot',
      headers: authorizedHeaders(bridge),
    })
    expect(parseJson<SnapshotEnvelope>(unchangedRaw)).toMatchObject({
      sessionId: initial.sessionId,
      stateRevision: initial.stateRevision,
      stateDigest: initial.stateDigest,
    })

    const acceptedRaw = await rawRequest(bridge, {
      pathname: '/command',
      method: 'POST',
      headers: authorizedHeaders(bridge, { 'content-type': 'application/json; charset=utf-8' }),
      body: commandBody,
    })
    expect(acceptedRaw.status).toBe(200)
    const accepted = parseJson<CommandResponse>(acceptedRaw)
    expect(accepted).toMatchObject({ accepted: true, stateRevision: initial.stateRevision + 1 })
    expect(acceptedRaw.body).toBe(canonicalJson(accepted))
    expect(acceptedRaw.body).not.toContain(bridge.capability)
    expect(acceptedRaw.body).not.toContain(healthBody.runtimeInstanceId)

    const checkpoint = fs.readFileSync(checkpointPath, 'utf8')
    expect(checkpoint).not.toContain(bridge.capability)
    expect(checkpoint).not.toContain(healthBody.runtimeInstanceId)
    expect(bridge.stdout).not.toContain(bridge.capability)
    expect(bridge.stderr).not.toContain(bridge.capability)
    expect(bridge.stdout).not.toContain(healthBody.runtimeInstanceId)
    expect(bridge.stderr).not.toContain(healthBody.runtimeInstanceId)
  } finally {
    await stopBridge(bridge)
    if (bridge !== null) {
      expect(bridge.stdout).not.toContain(bridge.capability)
      expect(bridge.stderr).not.toContain(bridge.capability)
    }
    fs.rmSync(runtimeDirectory, { recursive: true, force: true })
  }
}, 60_000)
