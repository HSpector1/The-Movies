import { appendFileSync, existsSync, watch } from 'node:fs'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { parentPort, workerData } from 'node:worker_threads'

if (parentPort === null) throw new Error('This fixture must run as a worker.')

const eventFile = join(workerData.runtimeDirectory, 'worker-events.jsonl')
function record(event, extra = {}) {
  appendFileSync(eventFile, `${JSON.stringify({ event, ...extra })}\n`, { mode: 0o600 })
}

function respond(id) {
  const body = new TextEncoder().encode('{ "message": "Café 🎬", "spacing": true }\n')
  parentPort.postMessage({ kind: 'response', id, reply: { status: 200, body, disposition: 'respond' } }, [body.buffer])
  if (body.byteLength !== 0) throw new Error('The fixture response buffer was not transferred.')
  record('responded')
}

const held = []
let released = false
function releaseOneIfRequested() {
  if (released || held.length === 0 || !existsSync(join(workerData.runtimeDirectory, 'release-one'))) return
  released = true
  const id = held.shift()
  record('released', { id })
  respond(id)
}
const watcher = watch(workerData.runtimeDirectory, (_event, filename) => {
  if (filename === 'release-one') releaseOneIfRequested()
})

record('started')
parentPort.postMessage({
  kind: 'ready',
  ready: {
    ...workerData.expectedContract,
    runtimeInstanceId: workerData.runtimeInstanceId,
    durable: false,
    sessionId: 'runtime-worker-fixture-session',
    stateRevision: 0,
    gameWeek: 0,
    stateDigest: 'fixture-digest',
    payloadBytes: 0,
    serializationMs: 0,
  },
})

parentPort.on('message', (message) => {
  if (message.kind === 'close') {
    record('closed')
    watcher.close()
    parentPort.postMessage({ kind: 'closed' })
    parentPort.close()
    return
  }
  if (message.kind !== 'request') throw new Error('Unknown fixture message.')
  const { id, request } = message
  record('request', { route: request.route })
  if (request.route === '/load') {
    held.push(id)
    releaseOneIfRequested()
    return // Remains pending until the fixture releases it or the process exits.
  }
  if (request.route === '/save') process.exit(7)

  if (request.route === '/command') {
    const deadline = performance.now() + 450
    // Deliberate synchronous CPU stall confined to the worker thread.
    while (performance.now() < deadline) {}
  }
  respond(id)
})
