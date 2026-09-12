# UX-DURABILITY.md — exact immutable excerpts

Source: `HSpector1/The-Movies@45ca33650074ad5413c39fb9d4a5c04cd6571c3a`, `bridge/runtime/runtime-coordinator.ts`. Full Git blob `1a8c94fb686a1f605b13bb61a787e7564214deba`. Source bytes 13365; SHA-256 `d776930efa3d0d37e4ca18e2fcf16b7e8d4f1d795601048a66eb48c54124e560`. Selected original lines only; source facts do not establish native observations.

## Lines 104–126

```text
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
```
