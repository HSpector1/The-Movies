import { Worker } from 'node:worker_threads'
import {PROTOCOL_VERSION,SCHEMA_ID,SNAPSHOT_VERSION} from '../protocol.ts'
import { WORKER_MAX_PENDING_REQUESTS, WORKER_MAX_REQUEST_BYTES, WORKER_MAX_RESPONSE_BYTES, WORKER_RESPONSE_TIMEOUT_MS, type RuntimeWorkerConfiguration, type RuntimeWorkerOutput, type RuntimeWorkerReady, type RuntimeWorkerReply, type RuntimeWorkerRequest } from './worker-contract.ts'

export type RuntimeWorkerOptions = RuntimeWorkerConfiguration & { entryUrl: URL; fatal: (error: Error) => void }
export type RuntimeWorkerClient = { ready: RuntimeWorkerReady; request: (request: RuntimeWorkerRequest) => Promise<RuntimeWorkerReply>; close: () => Promise<void> }

export async function createRuntimeWorker(options: RuntimeWorkerOptions): Promise<RuntimeWorkerClient> {
  const { entryUrl, fatal, ...configuration } = options
  const worker = new Worker(entryUrl, { workerData: {...configuration,expectedContract:{protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,snapshotVersion:SNAPSHOT_VERSION}}, env: { PATH: process.env.PATH ?? '/usr/bin:/bin', LANG: 'C', LC_ALL: 'C', ...(process.env.NODE_ENV!==undefined?{NODE_ENV:process.env.NODE_ENV}:{}) } })
  let serial = 0, closing = false, closedAcknowledged = false, exited = false, readySeen = false
  let failure: Error | null = null, closePromise: Promise<void> | null = null
  let resolveReady!: (ready: RuntimeWorkerReady) => void, rejectReady!: (error: Error) => void
  let resolveExit!: () => void
  const readyPromise = new Promise<RuntimeWorkerReady>((resolve, reject) => { resolveReady = resolve; rejectReady = reject })
  const exitPromise = new Promise<void>((resolve) => { resolveExit = resolve })
  const pending = new Map<number, { resolve: (reply: RuntimeWorkerReply) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout>; timedOut: boolean }>()
  const fail = (error: Error): void => {
    if (failure !== null) return
    failure = error; rejectReady(error)
    for (const item of pending.values()) { clearTimeout(item.timer); item.reject(error) }
    pending.clear()
    try { fatal(error) } catch { /* The failure observer cannot revive this authority. */ }
  }
  worker.on('error', fail)
  worker.on('exit', (code) => {
    exited = true
    if (!closing || !closedAcknowledged || code !== 0) fail(new Error(`Runtime worker exited unexpectedly (${String(code)}); restart the engine process to recover its durable authority.`))
    for (const item of pending.values()) { clearTimeout(item.timer); item.reject(new Error('Runtime worker closed before delivering the response.')) }
    pending.clear(); resolveExit()
  })
  worker.on('message', (message: RuntimeWorkerOutput) => {
    if (!message || typeof message !== 'object') { fail(new Error('Malformed runtime worker message.')); return }
    if (message.kind === 'ready') {
      const ready=message.ready
      if(readySeen||!ready||ready.protocolVersion!==PROTOCOL_VERSION||ready.schemaId!==SCHEMA_ID||ready.snapshotVersion!==SNAPSHOT_VERSION||ready.runtimeInstanceId!==configuration.runtimeInstanceId||typeof ready.sessionId!=='string'||!Number.isSafeInteger(ready.stateRevision)||!Number.isSafeInteger(ready.gameWeek)||typeof ready.stateDigest!=='string'||!Number.isFinite(ready.serializationMs)||!Number.isSafeInteger(ready.payloadBytes)){fail(new Error('Runtime worker readiness does not match this engine contract.'));return}
      readySeen=true;resolveReady(ready);return
    }
    if (message.kind === 'fatal') { fail(new Error(message.message)); return }
    if (message.kind === 'closed') { closedAcknowledged = true; return }
    if (message.kind !== 'response' && message.kind !== 'request-error') { fail(new Error('Unknown runtime worker message.')); return }
    const item = pending.get(message.id)
    if (!item) return // A timed-out HTTP request never cancels its already-dispatched mutation.
    pending.delete(message.id); clearTimeout(item.timer)
    if(item.timedOut)return
    if (message.kind === 'request-error') { item.reject(new Error(message.message)); return }
    const reply = message.reply
    if (!reply || !Number.isInteger(reply.status) || reply.status < 100 || reply.status > 599 || !(reply.body instanceof Uint8Array) || reply.body.byteLength > WORKER_MAX_RESPONSE_BYTES || !['respond', 'drop'].includes(reply.disposition)) {
      const error = new Error('Malformed runtime worker response.'); item.reject(error); fail(error); return
    }
    item.resolve(reply)
  })
  const startupTimer = setTimeout(() => fail(new Error('Runtime worker did not validate startup before its deadline.')), WORKER_RESPONSE_TIMEOUT_MS)
  let ready: RuntimeWorkerReady
  try { ready = await readyPromise } catch (error) {
    // Startup failure may be reported while the owner is releasing its file lock. Give that cleanup a bounded exit path.
    let cleanupTimer:ReturnType<typeof setTimeout>|undefined
    try{await Promise.race([exitPromise,new Promise<void>(resolve=>{cleanupTimer=setTimeout(resolve,5_000)})])}finally{if(cleanupTimer)clearTimeout(cleanupTimer)}
    if(!exited)await worker.terminate();throw error
  } finally { clearTimeout(startupTimer) }
  return {
    ready,
    request(request) {
      if (failure || closing || exited) return Promise.reject(failure ?? new Error('Runtime worker is closing.'))
      if (pending.size >= WORKER_MAX_PENDING_REQUESTS) return Promise.reject(new Error('Runtime worker request capacity reached; retain unresolved commands for exact retry.'))
      if (request.body && request.body.byteLength > WORKER_MAX_REQUEST_BYTES) return Promise.reject(new Error('Runtime request body exceeds 2 MB.'))
      const id = ++serial
      // Copy the bounded input once into an owned transferable allocation; the caller may retain its exact retry bytes.
      const body = request.body ? new Uint8Array(request.body) : undefined
      return new Promise<RuntimeWorkerReply>((resolve, reject) => {
        const timer = setTimeout(() => { const item=pending.get(id);if(item)item.timedOut=true;reject(new Error('Runtime response deadline exceeded; command outcome remains unresolved.')) }, WORKER_RESPONSE_TIMEOUT_MS)
        // A timed-out waiter still counts toward work capacity until the worker actually finishes or exits.
        pending.set(id, { resolve, reject, timer, timedOut:false })
        try { worker.postMessage({ kind: 'request', id, request: { ...request, ...(body ? { body } : {}) } }, body ? [body.buffer] : []) }
        catch (error) { pending.delete(id); clearTimeout(timer); reject(error as Error); fail(error as Error) }
      })
    },
    close() {
      if (closePromise) return closePromise
      closing = true
      closePromise = (async () => {
        if (!exited) worker.postMessage({ kind: 'close' })
        let timer: ReturnType<typeof setTimeout> | undefined
        try {
          await Promise.race([exitPromise, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Runtime worker did not release its authority before the shutdown deadline.')), WORKER_RESPONSE_TIMEOUT_MS) })])
          if (!closedAcknowledged || failure) throw failure ?? new Error('Runtime worker ended without confirming store closure.')
        } catch (error) { if (!exited) await worker.terminate(); throw error }
        finally { if (timer) clearTimeout(timer) }
      })()
      return closePromise
    },
  }
}
