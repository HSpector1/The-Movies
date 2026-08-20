import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
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
  BridgeSession,
  type CommandResponse,
  type RejectedResponse,
  type SaveResponse,
} from './session.ts'

const host = '127.0.0.1'
const requestedPort = Number(process.env.PROJECT_STUDIO_BRIDGE_PORT ?? '4317')
if (!Number.isSafeInteger(requestedPort) || requestedPort < 1 || requestedPort > 65535) {
  throw new Error('PROJECT_STUDIO_BRIDGE_PORT must be an integer from 1 to 65535.')
}

const session = new BridgeSession()

function json(response: ServerResponse, status: number, body: unknown): void {
  const encoded = JSON.stringify(body)
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(encoded),
    'cache-control': 'no-store',
  })
  response.end(encoded)
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

function logResult(response: CommandResponse | SaveResponse, operation: string, expectedRevision: unknown): void {
  const result = response.accepted ? 'accepted' : `rejected:${response.reasonCode}`
  console.log(
    `[bridge] ${new Date().toISOString()} commandId=${response.commandId ?? '-'} ` +
      `expectedRevision=${String(expectedRevision)} operation=${operation} result=${result} ` +
      `revision=${String(response.stateRevision)} durationMs=${response.processingMs.toFixed(3)}`,
  )
}

function validationRejection(
  commandId: string | null,
  reasonCode: RejectionCode,
  message: string,
  started: number,
): RejectedResponse {
  return session.protocolReject(commandId, reasonCode, message, started)
}

const server = createServer(async (request, response) => {
  const started = performance.now()
  const url = new URL(request.url ?? '/', `http://${host}:${String(requestedPort)}`)
  try {
    if (request.method === 'GET' && url.pathname === '/health') {
      const snapshot = session.snapshot()
      const body: BridgeHealthResponse = {
        status: 'ok',
        protocolVersion: PROTOCOL_VERSION,
        schemaId: SCHEMA_ID,
        snapshotVersion: SNAPSHOT_VERSION,
        sessionId: session.sessionId,
        stateRevision: session.stateRevision,
        gameWeek: snapshot.gameWeek,
        stateDigest: snapshot.stateDigest,
      }
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
      const snapshot = session.snapshot()
      const body: BridgeSessionResponse = {
        protocolVersion: PROTOCOL_VERSION,
        schemaId: SCHEMA_ID,
        snapshotVersion: SNAPSHOT_VERSION,
        sessionId: session.sessionId,
        stateRevision: snapshot.stateRevision,
        gameWeek: snapshot.gameWeek,
        stateDigest: snapshot.stateDigest,
      }
      json(response, 200, body)
      return
    }
    if (request.method === 'GET' && url.pathname === '/snapshot') {
      json(response, 200, session.snapshot())
      return
    }
    if (request.method === 'POST' && url.pathname === '/command') {
      let body: unknown
      try {
        body = await readJson(request)
      } catch (error) {
        const rejected = validationRejection(
          null,
          'INVALID_JSON',
          (error as Error).message,
          started,
        )
        logResult(rejected, 'submitIntent', '-')
        json(response, 400, rejected)
        return
      }
      const validation = validateCommand(body)
      if (!validation.ok) {
        const rejected = validationRejection(
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
        )
        json(response, 400, rejected)
        return
      }
      const result = session.command(validation.command)
      logResult(result, validation.command.type, validation.command.expectedStateRevision)
      json(response, statusOf(result), result)
      return
    }
    if (request.method === 'POST' && (url.pathname === '/save' || url.pathname === '/load')) {
      let body: unknown
      try {
        body = await readJson(request)
      } catch (error) {
        const rejected = validationRejection(
          null,
          'INVALID_JSON',
          (error as Error).message,
          started,
        )
        logResult(rejected, url.pathname.slice(1), '-')
        json(response, 400, rejected)
        return
      }
      const validation = validateControl(body)
      if (!validation.ok) {
        const rejected = validationRejection(
          validation.commandId,
          validation.reasonCode,
          validation.message,
          started,
        )
        logResult(rejected, url.pathname.slice(1), '-')
        json(response, 400, rejected)
        return
      }
      if (url.pathname === '/save') {
        const result = session.save(validation.control)
        logResult(result, 'save', validation.control.expectedStateRevision)
        json(response, result.accepted ? 200 : 409, result)
      } else {
        const result = session.load(validation.control)
        logResult(result, 'load', validation.control.expectedStateRevision)
        json(response, statusOf(result), result)
      }
      return
    }
    json(response, 404, { error: 'Not found.' })
  } catch (error) {
    console.error('[bridge] request failure', error)
    json(response, 500, { error: 'Bridge request failed.', message: (error as Error).message })
  }
})

server.listen(requestedPort, host, () => {
  const snapshot = session.snapshot()
  console.log(
    `[bridge] live http://${host}:${String(requestedPort)} protocol=${String(PROTOCOL_VERSION)} ` +
      `snapshot=${String(SNAPSHOT_VERSION)} schema=${SCHEMA_ID}`,
  )
  console.log(
    `[bridge] session=${session.sessionId} revision=${String(snapshot.stateRevision)} ` +
      `week=${String(snapshot.gameWeek)} digest=${snapshot.stateDigest}`,
  )
  console.log(
    `[bridge] snapshotBytes=${String(snapshot.metrics.payloadBytes)} ` +
      `serializationMs=${snapshot.metrics.serializationMs.toFixed(3)}`,
  )
})
