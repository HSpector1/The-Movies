import {CAMPAIGN_LIBRARY_FORMAT,initialCampaignLibrary,loadCampaignLibrary,encodeCampaignLibrary,withWorkingCampaignCheckpoint,campaignLibrarySnapshot,proposeCampaign,type CampaignLibrary} from './campaign-library.ts'
import type {CampaignRequest,CampaignLibraryResponse,CampaignAcceptedResponse} from '../schema/bridge-schema.ts'
import type {RejectedResponse} from '../session.ts'
import type {FoundingRegime} from '../../src/core/types.js'
import type {
  ControlEnvelope,
  SubmitIntentCommand,
} from '../protocol.ts'
import {
  BridgeRuntimeCheckpointHistoryFullError,
  DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS,
  encodeBridgeRuntimeCheckpoint,
  loadBridgeRuntimeCheckpoint,
  type BridgeRuntimeCheckpointLimits,
  type BridgeRuntimeCheckpointV1,
  type BridgeRuntimeJournalRoute,
} from '../runtime-checkpoint.ts'
import { canonicalJson } from '../schema/canonical.ts'
import {
  BridgeSession,
  type CommandResponse,
  type SaveResponse,
} from '../session.ts'
import { BridgeCheckpointStoreError, type BridgeCheckpointStore } from './checkpoint-store.ts'

export type BridgeRuntimeResponse = CommandResponse | SaveResponse

export type BridgeRuntimeDispatchResult<Response extends BridgeRuntimeResponse = BridgeRuntimeResponse> = {
  response: Response
  responseJson: string
  firstSeen: boolean
  sessionRolledOver?: true
}

export type BridgeRuntimeReadView = Pick<
  BridgeSession,
  'sessionId' | 'stateRevision' | 'runtimeJournalSize' | 'snapshot' | 'protocolReject' | 'quote' | 'industry'
>

export type BridgeRuntimeCoordinatorOptions = {
  store: BridgeCheckpointStore
  fatal: (error: unknown) => void
  /** Test/host override. The returned session must be configured with the supplied limits. */
  createFreshSession?: (limits: BridgeRuntimeCheckpointLimits) => BridgeSession
  checkpointLimits?: BridgeRuntimeCheckpointLimits
  campaigns?: {durable:boolean;regime:FoundingRegime}
}

export class BridgeRuntimeCoordinatorError extends Error {
  readonly code: 'CLOSED' | 'JOURNAL_INVARIANT'

  constructor(code: 'CLOSED' | 'JOURNAL_INVARIANT', message: string) {
    super(message)
    this.name = 'BridgeRuntimeCoordinatorError'
    this.code = code
  }
}

export interface BridgeRuntimeCoordinator {
  campaignLibrary():Promise<CampaignLibraryResponse|null>
  campaign(request:CampaignRequest):Promise<CampaignAcceptedResponse|RejectedResponse>
  read<Result>(reader: (session: BridgeRuntimeReadView) => Result | PromiseLike<Result>): Promise<Result>
  dispatch(
    route: 'command',
    request: SubmitIntentCommand,
  ): Promise<BridgeRuntimeDispatchResult<CommandResponse>>
  dispatch(
    route: 'save',
    request: ControlEnvelope,
  ): Promise<BridgeRuntimeDispatchResult<SaveResponse>>
  dispatch(
    route: 'load',
    request: ControlEnvelope,
  ): Promise<BridgeRuntimeDispatchResult<CommandResponse>>
  close(): Promise<void>
}

function reportFatal(fatal: (error: unknown) => void, error: unknown): void {
  try {
    fatal(error)
  } catch {
    // A fatal observer cannot replace the authority failure that triggered it.
  }
}

function encodeCheckpoint(
  checkpoint: BridgeRuntimeCheckpointV1,
  limits: BridgeRuntimeCheckpointLimits,
): string {
  return encodeBridgeRuntimeCheckpoint(checkpoint, limits)
}

class SerializedBridgeRuntimeCoordinator implements BridgeRuntimeCoordinator {
  private tail: Promise<void> = Promise.resolve()
  private closing = false
  private closed = false
  private closePromise: Promise<void> | null = null
  private poisoned = false
  private poisonReason: unknown

  constructor(
    private session: BridgeSession,
    private readonly store: BridgeCheckpointStore,
    private readonly fatal: (error: unknown) => void,
    private readonly checkpointLimits: BridgeRuntimeCheckpointLimits,
    private library: CampaignLibrary|null=null,
    private readonly campaignOptions: {durable:boolean;regime:FoundingRegime}|undefined=undefined,
  ) {}

  campaignLibrary():Promise<CampaignLibraryResponse|null> {
    return this.enqueue(()=>this.library?campaignLibrarySnapshot(this.library,this.session,this.campaignOptions?.durable??false):null)
  }

  campaign(request:CampaignRequest):Promise<CampaignAcceptedResponse|RejectedResponse> {
    return this.enqueue(async()=>{
      if(!this.library||!this.campaignOptions)return this.session.protocolReject(request.commandId,'STORAGE_UNAVAILABLE','This runtime has no campaign library.')
      let proposal
      try{proposal=proposeCampaign(this.library,this.session,request,this.checkpointLimits,this.campaignOptions.regime)}
      catch(error){return this.session.protocolReject(request.commandId,'SAVE_REJECTED',`Campaign validation failed: ${(error as Error).message}`)}
      if(!('library' in proposal)||proposal.replayed)return proposal.response
      try{await this.store.writeAtomic(await encodeCampaignLibrary(proposal.library))}
      catch(error){
        if(error instanceof BridgeCheckpointStoreError && error.code==='RESTORATION_UNCERTAIN')throw error
        // The accepted store normally restores its original bytes on a failed commit.
        // A failed rollback or lost ownership leaves durability unknown: stop this authority.
        let stored:string|null
        try{stored=await this.store.read()}catch(readError){throw new Error('Campaign storage ownership or recovery is uncertain; runtime stopped for explicit recovery.',{cause:readError})}
        if(stored!==await encodeCampaignLibrary(this.library))throw new Error('Campaign commit outcome is uncertain; runtime stopped. Reload the validated durable library before any further operation.',{cause:error})
        return this.session.protocolReject(request.commandId,'STORAGE_UNAVAILABLE','The campaign write failed and the previous record was preserved. Try saving again after storage is available.')
      }
      this.library=proposal.library;this.session=proposal.session
      return proposal.response
    })
  }

  private async persistWorking(checkpoint:BridgeRuntimeCheckpointV1,saveActive=false):Promise<void> {
    const json=encodeCheckpoint(checkpoint,this.checkpointLimits)
    if(this.library) {
      const next=withWorkingCampaignCheckpoint(this.library,json,saveActive)
      await this.store.writeAtomic(await encodeCampaignLibrary(next))
      this.library=next
    } else await this.store.writeAtomic(json)
  }

  read<Result>(
    reader: (session: BridgeRuntimeReadView) => Result | PromiseLike<Result>,
  ): Promise<Result> {
    return this.enqueue(() => reader(this.session))
  }

  dispatch(
    route: 'command',
    request: SubmitIntentCommand,
  ): Promise<BridgeRuntimeDispatchResult<CommandResponse>>
  dispatch(
    route: 'save',
    request: ControlEnvelope,
  ): Promise<BridgeRuntimeDispatchResult<SaveResponse>>
  dispatch(
    route: 'load',
    request: ControlEnvelope,
  ): Promise<BridgeRuntimeDispatchResult<CommandResponse>>
  dispatch(
    route: BridgeRuntimeJournalRoute,
    request: SubmitIntentCommand | ControlEnvelope,
  ): Promise<BridgeRuntimeDispatchResult> {
    return this.enqueue(async () => {
      const journalSizeBefore = this.session.runtimeJournalSize
      let response: BridgeRuntimeResponse
      try {
        response = this.dispatchToSession(route, request)
      } catch (error) {
        if (error instanceof BridgeRuntimeCheckpointHistoryFullError) {
          return this.rolloverFullSession(request)
        }
        throw error
      }
      const journalSizeAfter = this.session.runtimeJournalSize

      if (journalSizeAfter !== journalSizeBefore && journalSizeAfter !== journalSizeBefore + 1) {
        throw new BridgeRuntimeCoordinatorError(
          'JOURNAL_INVARIANT',
          `Bridge dispatch changed the runtime journal from ${String(journalSizeBefore)} to ` +
            `${String(journalSizeAfter)} entries; expected no change or one append.`,
        )
      }

      const firstSeen = journalSizeAfter === journalSizeBefore + 1
      const responseJson = canonicalJson(response)
      if (firstSeen) {
        const checkpoint = this.session.exportRuntimeCheckpoint()
        const appended = checkpoint.journal.at(-1)
        if (
          appended === undefined ||
          appended.route !== route ||
          appended.commandId !== request.commandId ||
          appended.responseJson !== responseJson
        ) {
          throw new BridgeRuntimeCoordinatorError(
            'JOURNAL_INVARIANT',
            'Bridge dispatch response does not match the newly appended runtime journal entry.',
          )
        }
        await this.persistWorking(checkpoint,route==='save'&&response.accepted)
      }

      return { response, responseJson, firstSeen }
    })
  }

  close(): Promise<void> {
    if (this.closePromise !== null) return this.closePromise
    this.closing = true
    const drained = this.tail
    this.closePromise = drained.then(
      () => this.releaseStore(),
      () => this.releaseStore(),
    )
    return this.closePromise
  }

  private dispatchToSession(
    route: BridgeRuntimeJournalRoute,
    request: SubmitIntentCommand | ControlEnvelope,
  ): BridgeRuntimeResponse {
    switch (route) {
      case 'command':
        return this.session.command(request as SubmitIntentCommand)
      case 'save':
        return this.session.save(request as ControlEnvelope)
      case 'load':
        return this.session.load(request as ControlEnvelope)
    }
  }

  private async rolloverFullSession(
    request: SubmitIntentCommand | ControlEnvelope,
  ): Promise<BridgeRuntimeDispatchResult> {
    const previous = this.session
    const replacement = previous.rolloverRuntime(this.checkpointLimits)
    const previousSnapshot = previous.snapshot()
    const replacementSnapshot = replacement.snapshot()
    if (
      replacementSnapshot.stateRevision !== 0 ||
      replacementSnapshot.stateDigest !== previousSnapshot.stateDigest ||
      replacementSnapshot.gameWeek !== previousSnapshot.gameWeek
    ) {
      throw new BridgeRuntimeCoordinatorError(
        'JOURNAL_INVARIANT',
        'Controlled bridge session rollover did not preserve authoritative state.',
      )
    }
    await this.persistWorking(replacement.exportRuntimeCheckpoint())
    this.session = replacement
    const response = replacement.protocolReject(
      request.commandId,
      'SESSION_MISMATCH',
      'The durable replay journal reached its bound and the bridge opened a new logical session without changing authoritative game state.',
    )
    return {
      response,
      responseJson: canonicalJson(response),
      firstSeen: false,
      sessionRolledOver: true,
    }
  }

  private enqueue<Result>(operation: () => Result | PromiseLike<Result>): Promise<Result> {
    if (this.closing) {
      return Promise.reject(new BridgeRuntimeCoordinatorError(
        'CLOSED',
        'Bridge runtime coordinator is closing or closed.',
      ))
    }

    const result = this.tail.then(async () => {
      if (this.poisoned) throw this.poisonReason
      try {
        return await operation()
      } catch (error) {
        this.poison(error)
        throw error
      }
    })
    this.tail = result.then(
      () => undefined,
      () => undefined,
    )
    return result
  }

  private poison(error: unknown): void {
    if (this.poisoned) return
    this.poisoned = true
    this.poisonReason = error
    reportFatal(this.fatal, error)
  }

  private async releaseStore(): Promise<void> {
    if (this.closed) return
    try {
      await this.store.close()
    } catch (error) {
      this.poison(error)
      throw error
    } finally {
      this.closed = true
    }
  }
}

export async function createBridgeRuntimeCoordinator(
  options: BridgeRuntimeCoordinatorOptions,
): Promise<BridgeRuntimeCoordinator> {
  try {
    const checkpointLimits = options.checkpointLimits ?? DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS
    const checkpointJson = await options.store.read()
    let session: BridgeSession
    let library:CampaignLibrary|null=null
    if(checkpointJson!==null && JSON.parse(checkpointJson).format===CAMPAIGN_LIBRARY_FORMAT) {
      if(!options.campaigns)throw new Error('This runtime does not support the stored named campaign library')
      const loaded=loadCampaignLibrary(checkpointJson,checkpointLimits)
      session=loaded.session;library=loaded.library
      if(loaded.changed)await options.store.writeAtomic(await encodeCampaignLibrary(library))
    } else {
      if(checkpointJson===null)session=options.createFreshSession?.(checkpointLimits)??BridgeSession.createRuntime(checkpointLimits)
      else session=BridgeSession.fromRuntimeCheckpoint(loadBridgeRuntimeCheckpoint(checkpointJson,checkpointLimits).hydrated,checkpointLimits)
      if(options.campaigns) {
        library=initialCampaignLibrary(session,checkpointLimits,checkpointJson)
        session=BridgeSession.fromRuntimeCheckpoint(loadBridgeRuntimeCheckpoint(library.workingCheckpointJson,checkpointLimits).hydrated,checkpointLimits)
        await options.store.writeAtomic(await encodeCampaignLibrary(library))
      } else {
        const encoded=encodeCheckpoint(session.exportRuntimeCheckpoint(),checkpointLimits)
        if(encoded!==checkpointJson)await options.store.writeAtomic(encoded)
      }
    }

    return new SerializedBridgeRuntimeCoordinator(
      session,
      options.store,
      options.fatal,
      checkpointLimits,
      library,
      options.campaigns,
    )
  } catch (error) {
    reportFatal(options.fatal, error)
    try {
      await options.store.close()
    } catch {
      // Preserve the startup error while still making a best effort to release the store lock.
    }
    throw error
  }
}
