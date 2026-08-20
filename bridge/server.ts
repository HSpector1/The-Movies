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
  type RejectedResponse,
  type SaveResponse,
} from './session.ts'
import {
  openBridgeCheckpointStore,
  type BridgeCheckpointStore,
} from './runtime/checkpoint-store.ts'
import {
  createBridgeRuntimeCoordinator,
  type BridgeRuntimeCoordinator,
} from './runtime/runtime-coordinator.ts'

const host = '127.0.0.1'
const requestedPort = Number(process.env.PROJECT_STUDIO_BRIDGE_PORT ?? '4317')
if (!Number.isSafeInteger(requestedPort) || requestedPort < 0 || requestedPort > 65535) {
  throw new Error('PROJECT_STUDIO_BRIDGE_PORT must be an integer from 0 to 65535.')
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

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  let length = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    length += buffer.length
    if (length > 2_000_000) throw new Error('Request body exceeds 2 MB.')
    chunks.push(buffer)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
}

function statusOf(response: CommandResponse): number {
  return response.accepted ? 200 : 409
}

function logResult(
  response: CommandResponse | SaveResponse,
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

function createHttpServer(runtime: BridgeRuntimeCoordinator): Server {
  return createServer(async (request, response) => {
    const started = performance.now()
    try {
      const url = new URL(request.url ?? '/', `http://${host}`)
      if (request.method === 'GET' && url.pathname === '/health') {
        const body = await runtime.read((session): BridgeHealthResponse => {
          const snapshot = session.snapshot()
          return {
            status: 'ok',
            protocolVersion: PROTOCOL_VERSION,
            schemaId: SCHEMA_ID,
            snapshotVersion: SNAPSHOT_VERSION,
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
        try {
          body = await readJson(request)
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
        logResult(
          result.response,
          validation.command.type,
          validation.command.expectedStateRevision,
          result.sessionRolledOver === true ? null : result.firstSeen,
        )
        encodedJson(response, statusOf(result.response), result.responseJson)
        return
      }
      if (request.method === 'POST' && (url.pathname === '/save' || url.pathname === '/load')) {
        let body: unknown
        try {
          body = await readJson(request)
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
          logResult(
            result.response,
            'save',
            validation.control.expectedStateRevision,
            result.sessionRolledOver === true ? null : result.firstSeen,
          )
          encodedJson(response, result.response.accepted ? 200 : 409, result.responseJson)
        } else {
          const result = await runtime.dispatch('load', validation.control)
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
  })
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
  const { store, durable } = await createCheckpointStore()
  let requestFatalShutdown: (() => void) | null = null
  const runtime = await createBridgeRuntimeCoordinator({
    store,
    fatal: (error) => {
      console.error(`[bridge] fatal runtime failure: ${(error as Error).message}`)
      process.exitCode = 1
      requestFatalShutdown?.()
    },
  })
  const server = createHttpServer(runtime)
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
