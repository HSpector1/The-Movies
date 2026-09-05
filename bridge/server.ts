import { createHash, randomUUID, timingSafeEqual } from 'node:crypto'
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'

import {
  BRIDGE_CONTRACT,
  PROTOCOL_VERSION,
  SCHEMA_ID,
  SNAPSHOT_VERSION,
  validateCommand,
  validateControl,
  validateQuote,
  type RejectionCode,
} from './protocol.ts'
import { canonicalJson } from './schema/canonical.ts'
import type {
  BridgeContractResponse,
  BridgeHealthResponse,
  BridgeSessionResponse,
} from './schema/bridge-schema.ts'
import {
  type CommandResponse,
  type QuoteResponse,
  type RejectedResponse,
  type SaveResponse,
  BridgeSession,
} from './session.ts'
import {
  openBridgeCheckpointStore,
  type BridgeCheckpointStore,
} from './runtime/checkpoint-store.ts'
import type { FoundingRegime } from '../src/core/index.js'
import {
  createBridgeRuntimeCoordinator,
  type BridgeRuntimeCoordinator,
  type BridgeRuntimeDispatchResult,
} from './runtime/runtime-coordinator.ts'
import {
  loadPostCommitResponseTestGate,
  type PostCommitResponseTestGate,
} from './testing/post-commit-response-gate.ts'

const host = '127.0.0.1'
const capabilityHeader = 'x-project-studio-capability'
const capabilityBytes = 32
const maxHeaderBytes = 16 * 1024
const maxHeadersCount = 64
const maxRequestsPerSocket = 100
const headersTimeoutMs = 5_000
const requestTimeoutMs = 15_000
const keepAliveTimeoutMs = 2_000
const socketIdleTimeoutMs = 15_000
const connectionsCheckingIntervalMs = 1_000
const requestedPort = Number(process.env.PROJECT_STUDIO_BRIDGE_PORT ?? '4317')
if (!Number.isSafeInteger(requestedPort) || requestedPort < 0 || requestedPort > 65535) {
  throw new Error('PROJECT_STUDIO_BRIDGE_PORT must be an integer from 0 to 65535.')
}

type HttpBoundary = {
  capabilityDigest: Buffer
}

type BoundaryRejection = {
  status: 401 | 403 | 415
}

class MemoryCheckpointStore implements BridgeCheckpointStore {
  readonly checkpointPath = '<memory-only>'
  private contents: string | null = null

  async read(): Promise<string | null> { return this.contents }
  async writeAtomic(text: string): Promise<void> { this.contents = text }
  async close(): Promise<void> {}
}

function encodedJson(response: ServerResponse, status: number, encoded: string): void {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(encoded),
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  })
  response.end(encoded)
}

function json(response: ServerResponse, status: number, body: unknown): void {
  encodedJson(response, status, canonicalJson(body))
}

function loadCapabilityDigest(): Buffer {
  const capability = process.env.PROJECT_STUDIO_BRIDGE_CAPABILITY
  delete process.env.PROJECT_STUDIO_BRIDGE_CAPABILITY
  if (capability === undefined || !/^[A-Za-z0-9_-]{43}$/.test(capability)) {
    throw new Error(
      'PROJECT_STUDIO_BRIDGE_CAPABILITY must be a canonical 32-byte base64url value.',
    )
  }
  const decoded = Buffer.from(capability, 'base64url')
  if (decoded.length !== capabilityBytes || decoded.toString('base64url') !== capability) {
    throw new Error(
      'PROJECT_STUDIO_BRIDGE_CAPABILITY must be a canonical 32-byte base64url value.',
    )
  }
  return createHash('sha256').update(capability, 'utf8').digest()
}

function rawHeaderValues(request: IncomingMessage, name: string): string[] {
  const values: string[] = []
  for (let index = 0; index < request.rawHeaders.length; index += 2) {
    if (request.rawHeaders[index]?.toLowerCase() === name) {
      values.push(request.rawHeaders[index + 1] ?? '')
    }
  }
  return values
}

function hasValidCapability(request: IncomingMessage, expectedDigest: Buffer): boolean {
  const values = rawHeaderValues(request, capabilityHeader)
  const presented = values.length === 1 ? values[0] : ''
  const presentedDigest = createHash('sha256').update(presented, 'utf8').digest()
  const digestMatches = timingSafeEqual(expectedDigest, presentedDigest)
  return values.length === 1 && digestMatches
}

function hasJsonContentType(request: IncomingMessage): boolean {
  const values = rawHeaderValues(request, 'content-type')
  if (values.length !== 1) return false
  return values[0]?.split(';', 1)[0]?.trim().toLowerCase() === 'application/json'
}

function inspectBoundary(
  request: IncomingMessage,
  boundary: HttpBoundary,
): BoundaryRejection | null {
  // Hash every presented credential before deciding so secret comparison is fixed-length.
  const authorized = hasValidCapability(request, boundary.capabilityDigest)
  const tooManyHeaders = request.rawHeaders.length / 2 > maxHeadersCount
  const expectedHost = request.socket.localAddress === host && request.socket.localPort !== undefined
    ? `${host}:${String(request.socket.localPort)}`
    : ''
  const hosts = rawHeaderValues(request, 'host')
  const validHost = hosts.length === 1 && hosts[0] === expectedHost
  const hasOrigin = rawHeaderValues(request, 'origin').length !== 0
  const validContentType = request.method !== 'POST' || hasJsonContentType(request)

  if (!authorized) return { status: 401 }
  if (tooManyHeaders || !validHost || hasOrigin) return { status: 403 }
  if (!validContentType) return { status: 415 }
  return null
}

function rejectAtBoundary(
  request: IncomingMessage,
  response: ServerResponse,
  rejection: BoundaryRejection,
): void {
  request.resume()
  response.shouldKeepAlive = false
  response.setHeader('connection', 'close')
  json(response, rejection.status, { error: 'Request rejected.' })
}

type ReadJsonResult = {
  body: unknown
  utf8Sha256: string
}

async function readJson(request: IncomingMessage): Promise<ReadJsonResult> {
  const chunks: Buffer[] = []
  let length = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    length += buffer.length
    if (length > 2_000_000) throw new Error('Request body exceeds 2 MB.')
    chunks.push(buffer)
  }
  const bytes = Buffer.concat(chunks)
  try {
    return {
      body: JSON.parse(bytes.toString('utf8')) as unknown,
      utf8Sha256: createHash('sha256').update(bytes).digest('hex'),
    }
  } catch {
    throw new Error('Request body is not valid JSON.')
  }
}

async function postCommitResponseDisposition(
  gate: PostCommitResponseTestGate,
  route: 'command' | 'save' | 'load',
  commandId: string,
  requestUtf8Sha256: string,
  result: BridgeRuntimeDispatchResult,
  response: ServerResponse,
): Promise<boolean> {
  const disposition = await gate.afterDispatch({
    route,
    commandId,
    requestUtf8Sha256,
    result,
  })
  if (disposition !== 'drop') return false
  response.destroy()
  return true
}

function statusOf(response: CommandResponse): number {
  return response.accepted ? 200 : 409
}

function logResult(
  response: CommandResponse | SaveResponse | QuoteResponse,
  operation: string,
  expectedRevision: unknown,
  firstSeen: boolean | null,
): void {
  const result = response.accepted ? 'accepted' : `rejected:${response.reasonCode}`
  const disposition = firstSeen === null ? 'transient' : firstSeen ? 'first-seen' : 'replay'
  console.log(
    `[bridge] ${new Date().toISOString()} commandId=${response.commandId ?? '-'} ` +
      `expectedRevision=${String(expectedRevision)} operation=${operation} result=${result} ` +
      `revision=${String(response.stateRevision)} disposition=${disposition} ` +
      `durationMs=${response.processingMs.toFixed(3)}`,
  )
}

function validationRejection(
  runtime: BridgeRuntimeCoordinator,
  commandId: string | null,
  reasonCode: RejectionCode,
  message: string,
  started: number,
): Promise<RejectedResponse> {
  return runtime.read((session) => session.protocolReject(commandId, reasonCode, message, started))
}

function createHttpServer(
  runtime: BridgeRuntimeCoordinator,
  boundary: HttpBoundary,
  runtimeInstanceId: string,
  postCommitResponseTestGate: PostCommitResponseTestGate,
): Server {
  const handleRequest = async (
    request: IncomingMessage,
    response: ServerResponse,
    expectContinue: boolean,
  ): Promise<void> => {
    const started = performance.now()
    try {
      const boundaryRejection = inspectBoundary(request, boundary)
      if (boundaryRejection !== null) {
        rejectAtBoundary(request, response, boundaryRejection)
        return
      }
      if (expectContinue) {
        rejectAtBoundary(request, response, { status: 403 })
        return
      }
      const url = new URL(request.url ?? '/', `http://${host}`)
      if (request.method === 'GET' && url.pathname === '/health') {
        const body = await runtime.read((session): BridgeHealthResponse => {
          const snapshot = session.snapshot()
          return {
            status: 'ok',
            protocolVersion: PROTOCOL_VERSION,
            schemaId: SCHEMA_ID,
            snapshotVersion: SNAPSHOT_VERSION,
            runtimeInstanceId,
            sessionId: session.sessionId,
            stateRevision: snapshot.stateRevision,
            gameWeek: snapshot.gameWeek,
            stateDigest: snapshot.stateDigest,
          }
        })
        json(response, 200, body)
        return
      }
      if (request.method === 'GET' && url.pathname === '/contract') {
        const body: BridgeContractResponse = {
          schemaId: SCHEMA_ID,
          contractJson: canonicalJson(BRIDGE_CONTRACT),
        }
        json(response, 200, body)
        return
      }
      if (request.method === 'GET' && url.pathname === '/session') {
        const body = await runtime.read((session): BridgeSessionResponse => {
          const snapshot = session.snapshot()
          return {
            protocolVersion: PROTOCOL_VERSION,
            schemaId: SCHEMA_ID,
            snapshotVersion: SNAPSHOT_VERSION,
            runtimeInstanceId,
            sessionId: session.sessionId,
            stateRevision: snapshot.stateRevision,
            gameWeek: snapshot.gameWeek,
            stateDigest: snapshot.stateDigest,
          }
        })
        json(response, 200, body)
        return
      }
      if (request.method === 'GET' && url.pathname === '/snapshot') {
        json(response, 200, await runtime.read((session) => session.snapshot()))
        return
      }
      if (request.method === 'POST' && url.pathname === '/command') {
        let body: unknown
        let requestUtf8Sha256: string
        try {
          const parsed = await readJson(request)
          body = parsed.body
          requestUtf8Sha256 = parsed.utf8Sha256
        } catch (error) {
          const rejected = await validationRejection(
            runtime,
            null,
            'INVALID_JSON',
            (error as Error).message,
            started,
          )
          logResult(rejected, 'submitIntent', '-', null)
          json(response, 400, rejected)
          return
        }
        const validation = validateCommand(body)
        if (!validation.ok) {
          const rejected = await validationRejection(
            runtime,
            validation.commandId,
            validation.reasonCode,
            validation.message,
            started,
          )
          logResult(
            rejected,
            'submitIntent',
            typeof (body as { expectedStateRevision?: unknown })?.expectedStateRevision === 'number'
              ? (body as { expectedStateRevision: number }).expectedStateRevision
              : '-',
            null,
          )
          json(response, 400, rejected)
          return
        }
        const result = await runtime.dispatch('command', validation.command)
        if (
          await postCommitResponseDisposition(
            postCommitResponseTestGate,
            'command',
            validation.command.commandId,
            requestUtf8Sha256,
            result,
            response,
          )
        )
          return
        logResult(
          result.response,
          validation.command.type,
          validation.command.expectedStateRevision,
          result.sessionRolledOver === true ? null : result.firstSeen,
        )
        encodedJson(response, statusOf(result.response), result.responseJson)
        return
      }
      if (request.method === 'POST' && url.pathname === '/quote') {
        // P03A/P04A: a quote (commission OR casting) is a pure read plus a
        // session-transient mint. It mutates no game state, advances no
        // revision, and is never journaled, so it rides the read path rather
        // than the dispatch/journal path.
        let body: unknown
        try {
          const parsed = await readJson(request)
          body = parsed.body
        } catch (error) {
          const rejected = await validationRejection(
            runtime,
            null,
            'INVALID_JSON',
            (error as Error).message,
            started,
          )
          // The body never parsed, so no request `type` is known yet.
          logResult(rejected, 'quote', '-', null)
          json(response, 400, rejected)
          return
        }
        const validation = validateQuote(body)
        if (!validation.ok) {
          const rejected = await validationRejection(
            runtime,
            validation.commandId,
            validation.reasonCode,
            validation.message,
            started,
          )
          // The envelope failed validation before its `type` could be trusted.
          logResult(rejected, 'quote', '-', null)
          json(response, 400, rejected)
          return
        }
        const quoted = await runtime.read((session) => session.quote(validation.quote))
        logResult(quoted, validation.quote.type, validation.quote.expectedStateRevision, null)
        json(response, quoted.accepted ? 200 : 409, quoted)
        return
      }
      if (request.method === 'POST' && (url.pathname === '/save' || url.pathname === '/load')) {
        let body: unknown
        let requestUtf8Sha256: string
        try {
          const parsed = await readJson(request)
          body = parsed.body
          requestUtf8Sha256 = parsed.utf8Sha256
        } catch (error) {
          const rejected = await validationRejection(
            runtime,
            null,
            'INVALID_JSON',
            (error as Error).message,
            started,
          )
          logResult(rejected, url.pathname.slice(1), '-', null)
          json(response, 400, rejected)
          return
        }
        const validation = validateControl(body)
        if (!validation.ok) {
          const rejected = await validationRejection(
            runtime,
            validation.commandId,
            validation.reasonCode,
            validation.message,
            started,
          )
          logResult(rejected, url.pathname.slice(1), '-', null)
          json(response, 400, rejected)
          return
        }
        if (url.pathname === '/save') {
          const result = await runtime.dispatch('save', validation.control)
          if (
            await postCommitResponseDisposition(
              postCommitResponseTestGate,
              'save',
              validation.control.commandId,
              requestUtf8Sha256,
              result,
              response,
            )
          )
            return
          logResult(
            result.response,
            'save',
            validation.control.expectedStateRevision,
            result.sessionRolledOver === true ? null : result.firstSeen,
          )
          encodedJson(response, result.response.accepted ? 200 : 409, result.responseJson)
        } else {
          const result = await runtime.dispatch('load', validation.control)
          if (
            await postCommitResponseDisposition(
              postCommitResponseTestGate,
              'load',
              validation.control.commandId,
              requestUtf8Sha256,
              result,
              response,
            )
          )
            return
          logResult(
            result.response,
            'load',
            validation.control.expectedStateRevision,
            result.sessionRolledOver === true ? null : result.firstSeen,
          )
          encodedJson(response, statusOf(result.response), result.responseJson)
        }
        return
      }
      json(response, 404, { error: 'Not found.' })
    } catch (error) {
      console.error(`[bridge] request unavailable: ${(error as Error).message}`)
      if (!response.headersSent) json(response, 503, { error: 'Bridge runtime unavailable.' })
      else response.destroy()
    }
  }
  const server = createServer({
    connectionsCheckingInterval: connectionsCheckingIntervalMs,
    headersTimeout: headersTimeoutMs,
    insecureHTTPParser: false,
    keepAliveTimeout: keepAliveTimeoutMs,
    maxHeaderSize: maxHeaderBytes,
    requestTimeout: requestTimeoutMs,
    requireHostHeader: true,
  }, (request, response) => {
    void handleRequest(request, response, false)
  })
  // Node truncates rawHeaders when maxHeadersCount is positive, which could hide a
  // protected header after the limit. Parse the size-bounded complete set, then fail closed.
  server.maxHeadersCount = 0
  server.maxRequestsPerSocket = maxRequestsPerSocket
  server.setTimeout(socketIdleTimeoutMs, (socket) => socket.destroy())
  server.on('checkContinue', (request, response) => {
    void handleRequest(request, response, true)
  })
  return server
}

async function createCheckpointStore(): Promise<{ store: BridgeCheckpointStore; durable: boolean }> {
  const runtimeDirectory = process.env.PROJECT_STUDIO_BRIDGE_RUNTIME_DIR?.trim()
  if (runtimeDirectory === undefined || runtimeDirectory.length === 0) {
    return { store: new MemoryCheckpointStore(), durable: false }
  }
  return {
    store: await openBridgeCheckpointStore(
      join(runtimeDirectory, 'bridge-runtime-v1.json'),
      { runtimeRoot: runtimeDirectory },
    ),
    durable: true,
  }
}

async function main(): Promise<void> {
  const capabilityDigest = loadCapabilityDigest()
  const runtimeInstanceId = randomUUID()
  const configuredRuntimeDirectory = process.env.PROJECT_STUDIO_BRIDGE_RUNTIME_DIR?.trim()
  const postCommitResponseTestGate = loadPostCommitResponseTestGate(
    configuredRuntimeDirectory !== undefined && configuredRuntimeDirectory.length > 0,
  )
  const { store, durable } = await createCheckpointStore()
  let requestFatalShutdown: (() => void) | null = null
  // P09 §16: a FRESH runtime (no checkpoint in the runtime directory) may be
  // created as a sparse 1920 bare-lot campaign by explicit configuration. An
  // existing checkpoint is never touched by this: the regime is exact history
  // written once at world creation.
  const configuredRegime = process.env.PROJECT_STUDIO_NEW_GAME_REGIME?.trim()
  if (configuredRegime !== undefined && configuredRegime !== '' && configuredRegime !== 'endowed' && configuredRegime !== 'bare-lot') {
    throw new Error("PROJECT_STUDIO_NEW_GAME_REGIME must be 'endowed' or 'bare-lot'.")
  }
  const newGameRegime: FoundingRegime = configuredRegime === 'bare-lot' ? 'bare-lot' : 'endowed'
  const runtime = await createBridgeRuntimeCoordinator({
    store,
    createFreshSession: (limits) => BridgeSession.createRuntime(limits, newGameRegime),
    fatal: (error) => {
      console.error(`[bridge] fatal runtime failure: ${(error as Error).message}`)
      process.exitCode = 1
      requestFatalShutdown?.()
    },
  })
  const server = createHttpServer(
    runtime,
    { capabilityDigest },
    runtimeInstanceId,
    postCommitResponseTestGate,
  )
  let stopping: Promise<void> | null = null
  const shutdown = (exitCode: number): Promise<void> => {
    if (stopping !== null) return stopping
    const currentExitCode = typeof process.exitCode === 'number' ? process.exitCode : 0
    process.exitCode = Math.max(currentExitCode, exitCode)
    stopping = new Promise<void>((resolve) => {
      if (!server.listening) resolve()
      else server.close(() => resolve())
    }).then(() => runtime.close())
    return stopping
  }
  requestFatalShutdown = () => { void shutdown(1) }

  try {
    await new Promise<void>((resolve, reject) => {
      const onError = (error: Error): void => {
        server.off('listening', onListening)
        reject(error)
      }
      const onListening = (): void => {
        server.off('error', onError)
        resolve()
      }
      server.once('error', onError)
      server.once('listening', onListening)
      server.listen(requestedPort, host)
    })
  } catch (error) {
    await runtime.close()
    throw error
  }

  const address = server.address()
  if (address === null || typeof address === 'string') {
    await shutdown(1)
    throw new Error('Bridge did not receive a TCP listener address.')
  }
  const snapshot = await runtime.read((session) => session.snapshot())
  console.log(
    `[bridge] live http://${host}:${String(address.port)} protocol=${String(PROTOCOL_VERSION)} ` +
      `snapshot=${String(SNAPSHOT_VERSION)} schema=${SCHEMA_ID}`,
  )
  console.log(
    `[bridge] session=${snapshot.sessionId} revision=${String(snapshot.stateRevision)} ` +
      `week=${String(snapshot.gameWeek)} digest=${snapshot.stateDigest} ` +
      `checkpoint=${durable ? 'durable' : 'memory-only'}`,
  )
  console.log(
    `[bridge] snapshotBytes=${String(snapshot.metrics.payloadBytes)} ` +
      `serializationMs=${snapshot.metrics.serializationMs.toFixed(3)}`,
  )

  process.once('SIGINT', () => { void shutdown(0) })
  process.once('SIGTERM', () => { void shutdown(0) })
  server.on('error', (error) => {
    console.error(`[bridge] listener failure: ${error.message}`)
    void shutdown(1)
  })
}

void main().catch((error: unknown) => {
  console.error(`[bridge] startup failed: ${(error as Error).message}`)
  process.exitCode = 1
})
