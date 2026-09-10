import {createHash,randomUUID,timingSafeEqual} from 'node:crypto'
import {createServer,type IncomingMessage,type Server,type ServerResponse} from 'node:http'
import {performance} from 'node:perf_hooks'
import {BRIDGE_CONTRACT,PROTOCOL_VERSION,SCHEMA_ID,SNAPSHOT_VERSION} from './protocol.ts'
import {canonicalJson} from './schema/canonical.ts'
import {createRuntimeWorker,type RuntimeWorkerClient} from './runtime/worker-client.ts'
import {WORKER_MAX_REQUEST_BYTES,WORKER_RESPONSE_TIMEOUT_MS,type RuntimeWorkerRoute} from './runtime/worker-contract.ts'
import {prepareRuntimeWorkerEntry} from './runtime/worker-entry-path.ts'
import {POST_COMMIT_RESPONSE_TEST_ENV} from './testing/post-commit-response-gate.ts'
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

async function readBody(request:IncomingMessage):Promise<Uint8Array> {
 const chunks:Buffer[]=[];let length=0
 for await(const chunk of request){const buffer=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk);length+=buffer.length;if(length>WORKER_MAX_REQUEST_BYTES)throw new Error('Request body exceeds 2 MB.');chunks.push(buffer)}
 return Buffer.concat(chunks)
}
function createHttpServer(runtime:RuntimeWorkerClient,boundary:HttpBoundary):Server {
 const handleRequest=async(request:IncomingMessage,response:ServerResponse,expectContinue:boolean):Promise<void>=>{
  const startedEpochMs=performance.timeOrigin+performance.now()
  try {
   const rejected=inspectBoundary(request,boundary)
   if(rejected){rejectAtBoundary(request,response,rejected);return}
   if(expectContinue){rejectAtBoundary(request,response,{status:403});return}
   const url=new URL(request.url??'/',`http://${host}`)
   if(request.method==='GET'&&url.pathname==='/contract'){json(response,200,{schemaId:SCHEMA_ID,contractJson:canonicalJson(BRIDGE_CONTRACT)});return}
   const getRoutes=['/health','/session','/snapshot','/campaigns']
   const postRoutes=['/industry','/campaigns','/command','/quote','/save','/load']
   if(!((request.method==='GET'&&getRoutes.includes(url.pathname))||(request.method==='POST'&&postRoutes.includes(url.pathname)))){json(response,404,{error:'Not found.'});return}
   let bytes:Uint8Array|undefined,bodyError:string|undefined
   if(request.method==='POST'){try{bytes=await readBody(request)}catch(error){bodyError=(error as Error).message}}
   // Body/header deadlines stay bounded at15s; a completed authenticated request may await a durable worker receipt for60s.
   request.socket.setTimeout(WORKER_RESPONSE_TIMEOUT_MS)
   const reply=await runtime.request({route:url.pathname as RuntimeWorkerRoute,method:request.method as 'GET'|'POST',startedEpochMs,...(bytes?{body:bytes,requestUtf8Sha256:createHash('sha256').update(bytes).digest('hex')}:{ }),...(bodyError?{bodyError}:{})})
   if(reply.disposition==='drop'){response.destroy();return}
   if(response.destroyed)return
   response.writeHead(reply.status,{'content-type':'application/json; charset=utf-8','content-length':reply.body.byteLength,'cache-control':'no-store','x-content-type-options':'nosniff'})
   response.end(Buffer.from(reply.body.buffer,reply.body.byteOffset,reply.body.byteLength))
  }catch(error){console.error(`[bridge] request unavailable: ${(error as Error).message}`);if(!response.headersSent)json(response,503,{error:'Bridge runtime unavailable.'});else response.destroy()}
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

async function main():Promise<void> {
 const capabilityDigest=loadCapabilityDigest(),runtimeInstanceId=randomUUID()
 const configuredRuntimeDirectory=process.env.PROJECT_STUDIO_BRIDGE_RUNTIME_DIR?.trim()
 const runtimeDirectory=configuredRuntimeDirectory?configuredRuntimeDirectory:null
 const configuredRegime=process.env.PROJECT_STUDIO_NEW_GAME_REGIME?.trim()
 if(configuredRegime!==undefined&&configuredRegime!==''&&configuredRegime!=='endowed'&&configuredRegime!=='bare-lot')throw new Error("PROJECT_STUDIO_NEW_GAME_REGIME must be 'endowed' or 'bare-lot'.")
 const regime=configuredRegime==='bare-lot'?'bare-lot':'endowed'
 const testGateEnvironment=process.env[POST_COMMIT_RESPONSE_TEST_ENV];delete process.env[POST_COMMIT_RESPONSE_TEST_ENV]
 const prepared=await prepareRuntimeWorkerEntry(import.meta.url)
 let requestFatalShutdown:(()=>void)|null=null
 let runtime:RuntimeWorkerClient
 try{runtime=await createRuntimeWorker({entryUrl:prepared.entryUrl,runtimeDirectory,regime,runtimeInstanceId,...(testGateEnvironment!==undefined?{testGateEnvironment}:{}),fatal(error){console.error(`[bridge] fatal runtime failure: ${error.message}`);process.exitCode=1;requestFatalShutdown?.()}})}catch(error){await prepared.release();throw error}
 const server=createHttpServer(runtime,{capabilityDigest})
 let stopping:Promise<void>|null=null
 const shutdown=(exitCode:number):Promise<void>=>{
  if(stopping)return stopping
  process.exitCode=Math.max(typeof process.exitCode==='number'?process.exitCode:0,exitCode)
  stopping=new Promise<void>(resolve=>{if(!server.listening)resolve();else server.close(()=>resolve())}).then(()=>runtime.close()).finally(()=>prepared.release())
  return stopping
 }
 const requestShutdown=(code:number):void=>{void shutdown(code).catch(error=>{console.error(`[bridge] shutdown failed: ${(error as Error).message}`);process.exitCode=1})}
 requestFatalShutdown=()=>requestShutdown(1)
 process.once('SIGINT',()=>requestShutdown(0));process.once('SIGTERM',()=>requestShutdown(0))
 try{await new Promise<void>((resolve,reject)=>{const onError=(error:Error):void=>{server.off('listening',onListening);reject(error)};const onListening=():void=>{server.off('error',onError);resolve()};server.once('error',onError);server.once('listening',onListening);server.listen(requestedPort,host)})}catch(error){await shutdown(1);throw error}
 const address=server.address();if(address===null||typeof address==='string'){await shutdown(1);throw new Error('Bridge did not receive a TCP listener address.')}
 const snapshot=runtime.ready
 console.log(`[bridge] live http://${host}:${String(address.port)} protocol=${String(PROTOCOL_VERSION)} snapshot=${String(SNAPSHOT_VERSION)} schema=${SCHEMA_ID}`)
 console.log(`[bridge] session=${snapshot.sessionId} revision=${String(snapshot.stateRevision)} week=${String(snapshot.gameWeek)} digest=${snapshot.stateDigest} checkpoint=${snapshot.durable?'durable':'memory-only'}`)
 console.log(`[bridge] snapshotBytes=${String(snapshot.payloadBytes)} serializationMs=${snapshot.serializationMs.toFixed(3)}`)
 server.on('error',error=>{console.error(`[bridge] listener failure: ${error.message}`);requestShutdown(1)})
}
void main().catch((error:unknown)=>{console.error(`[bridge] startup failed: ${(error as Error).message}`);process.exitCode=1})
