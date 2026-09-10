import {createHash} from 'node:crypto'
import {performance} from 'node:perf_hooks'
import {BRIDGE_CONTRACT, PROTOCOL_VERSION, SCHEMA_ID, SNAPSHOT_VERSION, validateCommand, validateControl, validateCampaign, validateIndustry, validateQuote, type RejectionCode} from '../protocol.ts'
import {canonicalJson} from '../schema/canonical.ts'
import type {BridgeContractResponse, BridgeHealthResponse, BridgeSessionResponse} from '../schema/bridge-schema.ts'
import type {CommandResponse, QuoteResponse, RejectedResponse, SaveResponse} from '../session.ts'
import type {BridgeRuntimeCoordinator, BridgeRuntimeDispatchResult} from './runtime-coordinator.ts'
import type {PostCommitResponseTestGate} from '../testing/post-commit-response-gate.ts'
import {WORKER_MAX_REQUEST_BYTES, WORKER_MAX_RESPONSE_BYTES, type RuntimeWorkerRequest, type RuntimeWorkerReply} from './worker-contract.ts'
type ServerResponse = { reply: RuntimeWorkerReply | null; destroy: () => void }
function encodedJson(response: ServerResponse, status: number, encoded: string): void {
 if (Buffer.byteLength(encoded, 'utf8') > WORKER_MAX_RESPONSE_BYTES) throw new Error('Runtime response exceeds the bounded transfer allowance.')
 response.reply={status,body:new TextEncoder().encode(encoded),disposition:'respond'}
}
function json(response:ServerResponse,status:number,body:unknown):void { encodedJson(response,status,canonicalJson(body)) }
async function readJson(request:RuntimeWorkerRequest):Promise<{body:unknown;utf8Sha256:string}> {
 if(request.bodyError)throw new Error(request.bodyError)
 const body=request.body??new Uint8Array()
 if(body.byteLength>WORKER_MAX_REQUEST_BYTES)throw new Error('Request body exceeds 2 MB.')
 const bytes=Buffer.from(body.buffer,body.byteOffset,body.byteLength)
 const utf8Sha256=createHash('sha256').update(bytes).digest('hex')
 if(request.requestUtf8Sha256!==undefined&&utf8Sha256!==request.requestUtf8Sha256)throw new Error('Request transport digest differs from the original body.')
 try{return {body:JSON.parse(bytes.toString('utf8')),utf8Sha256}}catch{throw new Error('Request body is not valid JSON.')}
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

export async function executeRuntimeWorkerRequest(runtime:BridgeRuntimeCoordinator,request:RuntimeWorkerRequest,runtimeInstanceId:string,postCommitResponseTestGate:PostCommitResponseTestGate):Promise<RuntimeWorkerReply> {
 const response:ServerResponse={reply:null,destroy(){this.reply={status:503,body:new Uint8Array(),disposition:'drop'}}}
 const handleRequest=async():Promise<void>=>{
  const started=request.startedEpochMs-performance.timeOrigin
  try {
      const url: {pathname:string} = {pathname:request.route}
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
      if(request.method==='GET' && url.pathname==='/campaigns') {
        const library=await runtime.campaignLibrary()
        json(response,library?200:503,library??{error:'Campaign library unavailable'})
        return
      }
      if(request.method==='POST' && url.pathname==='/industry') {
        let body:unknown
        try{body=(await readJson(request)).body}
        catch(error){json(response,400,await validationRejection(runtime,null,'INVALID_JSON',(error as Error).message,started));return}
        const validation=validateIndustry(body)
        if(!validation.ok){json(response,400,await validationRejection(runtime,validation.commandId,validation.reasonCode,validation.message,started));return}
        const result=await runtime.read(s=>s.industry(validation.request))
        json(response,'type' in result?200:409,result)
        return
      }
      if(request.method==='POST' && url.pathname==='/campaigns') {
        let body:unknown
        try{body=(await readJson(request)).body}
        catch(error){json(response,400,await validationRejection(runtime,null,'INVALID_JSON',(error as Error).message,started));return}
        const validation=validateCampaign(body)
        if(!validation.ok){json(response,400,await validationRejection(runtime,validation.commandId,validation.reasonCode,validation.message,started));return}
        const result=await runtime.campaign(validation.request)
        json(response,result.accepted?200:409,result)
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
      json(response, 503, { error: 'Bridge runtime unavailable.' })
    }
  }

 await handleRequest()
 if(response.reply===null)throw new Error('Runtime route did not produce a response.')
 return response.reply
}
