# UX-CAMPAIGNS.md — exact immutable excerpts

Source: `HSpector1/project-studio-unity-visual-spike@6420a4d91de52db1bffca2988f2c995672e7d53e`, `Assets/Studio/Runtime/Presentation/StudioSystemMenuHud.Campaigns.cs`. Full Git blob `0ffc640b70c96e9fa0c3ed415496558206590abf`. Source bytes 17397; SHA-256 `04a00e34ab3c6e36612a0f0657ee5a04e78eed64bb95d095b7d14cb87aa285ea`. Selected original lines only; source facts do not establish native observations.

## Lines 17–99

```text
        private StudioCampaignRequest quitCampaignRequest;
        private readonly System.Collections.Generic.HashSet<string> campaignElements = new();
        private void MaintainCampaignMenu()
        {
            if (campaignSubscribedClient != client)
            {
                if (campaignSubscribedClient != null) { campaignSubscribedClient.CampaignCompleted -= OnCampaignCompleted; campaignSubscribedClient.CampaignFailed -= OnCampaignFailed; }
                campaignSubscribedClient = client;
                if (client != null) { client.CampaignCompleted += OnCampaignCompleted; client.CampaignFailed += OnCampaignFailed; }
            }
            if (Layer != StudioSystemMenuLayer.Menu) WithdrawCampaignElements();
            if (client == null) return;
            if (libraryRefreshQueued && client.RefreshCampaignLibrary()) libraryRefreshQueued = false;
            if (armedCampaign == null) return;
            if (client.SubmitCampaign(armedCampaign)) { if (quitAfterCampaignSave) quitCampaignRequest = armedCampaign; armedCampaign = null; ResultMessage = "Saving campaign changes…"; return; }
            if (Time.realtimeSinceStartup - campaignArmedAt < 8f) return;
            armedCampaign = null; quitAfterCampaignSave = false; ResultMessage = "The campaign operation could not start. Refresh the library and retry.";
        }
        private void OnCampaignFailed(string message) { ResultMessage = message; if(client?.CampaignUnresolved!=true) { quitAfterCampaignSave = false; quitCampaignRequest = null; } }
        private void OnCampaignCompleted(StudioCampaignAcceptedResponse receipt)
        {
            ResultMessage = receipt.message;
            selectedCampaign = receipt.campaignId;
            if (receipt.operation == "newGame" || receipt.operation == "load" || receipt.operation == "saveAs" || receipt.operation == "discard") DiscardTransientDrafts();
            if (quitAfterCampaignSave && quitCampaignRequest?.commandId == receipt.commandId && quitCampaignRequest.operation == receipt.operation)
            { quitAfterCampaignSave = false; quitCampaignRequest = null; DoQuit(); }
        }
        private StudioCampaignSummary SelectedCampaign()
        { foreach (var c in client?.CampaignLibrary?.campaigns ?? Array.Empty<StudioCampaignSummary>()) if (c.id == selectedCampaign) return c; return null; }
        private void ArmCampaign(StudioCampaignRequest request)
        {
            if (armedCampaign != null || client?.CampaignBusy == true || client?.CampaignUnresolved == true) return;
            campaignDialog = null; campaignDraft = null; armedCampaign = request; campaignArmedAt = Time.realtimeSinceStartup;
            ResultMessage = "Waiting for the studio to finish its current request…";
        }
        private StudioCampaignRequest Operation(string operation) => new() { operation = operation, unsavedDisposition = "requireClean",
            sessionId=client?.CampaignLibrary?.sessionId,expectedStateRevision=client?.CampaignLibrary?.stateRevision??0,
            expectedCatalogueRevision=client?.CampaignLibrary?.catalogueRevision??0,expectedActiveCampaignId=client?.CampaignLibrary?.activeCampaignId };
        private void BeginCampaign(string operation)
        {
            var selected = SelectedCampaign();
            var draft = Operation(operation);
            if (operation == "rename" || operation == "delete" || operation == "load")
            {
                if (selected == null) { ResultMessage = "Select the exact named campaign first."; return; }
                draft.campaignId = selected.id;
            }
            if (operation == "newGame" || operation == "saveAs" || operation == "rename")
            {
                campaignDraft = draft; campaignDialog = "name";
                campaignName = operation == "rename" ? selected.label : "";
                GUI.FocusControl("campaign-name-input"); return;
            }
            if (operation == "delete") { campaignDraft = draft; campaignDialog = "delete"; return; }
            ReviewLeave(draft);
        }
        private void ReviewLeave(StudioCampaignRequest draft)
        {
            if(draft.operation=="saveAs"&&HasUncommittedDraft){campaignDraft=draft;campaignDialog="copy-draft";return;}
            if ((draft.operation == "newGame" || draft.operation == "load") && (client?.CampaignLibrary?.dirty == true || HasUncommittedDraft))
            { campaignDraft = draft; campaignDialog = "unsaved"; return; }
            ArmCampaign(draft);
        }
        private void ConfirmName()
        {
            if (campaignDraft == null) return;
            campaignDraft.label = campaignName;
            if (campaignDraft.operation == "saveAs")
                foreach (var c in client?.CampaignLibrary?.campaigns ?? Array.Empty<StudioCampaignSummary>())
                    if (string.Equals(c.label, campaignName.Trim(), StringComparison.OrdinalIgnoreCase))
                    { campaignDraft.overwriteCampaignId = c.id; campaignDialog = "overwrite"; return; }
            ReviewLeave(campaignDraft);
        }
        private void CampaignQuit()
        {
            var library=client?.CampaignLibrary;
            if(library==null||library.sessionId!=client?.Current?.sessionId||library.stateRevision!=client?.Current?.stateRevision||library.stateDigest!=client?.Current?.stateDigest)
            {libraryRefreshQueued=true;ResultMessage="Refreshing current save status before Quit. Retry once the library is ready.";return;}
            if (client?.CampaignLibrary?.dirty == true || HasUncommittedDraft) { campaignDialog = "quit-unsaved"; return; }
            QuitClicked();
        }
        private bool CampaignButton(string name, string label, Rect local, bool enabled, Action action)
        {
```

## Lines 180–215

```text
            }
            else if(campaignDialog=="copy-draft")
            {
                GUI.Label(new Rect(x,y,width,120*s),"Save As copies all current simulation progress and opens the copy. Uncommitted casting or commission form drafts are not saved and will be discarded. Continue?",messageStyle);y+=135*s;
                CampaignButton("campaign-copy-confirm","Copy progress and discard form drafts",new Rect(x,y,width,row),true,()=>ArmCampaign(campaignDraft));y+=row+10*s;
            }
            else if(campaignDialog=="delete"||campaignDialog=="overwrite")
            {
                GUI.Label(new Rect(x,y,width,85*s),campaignDialog=="delete"?"Only this selected named record will be deleted. If it is active, the current world remains open as an unnamed draft.":"This replaces the selected record with CURRENT progress. The active source record is preserved. Cancellation changes nothing.",messageStyle);y+=96*s;
                CampaignButton("campaign-destructive-confirm",campaignDialog=="delete"?"Delete this campaign":"Overwrite this campaign",new Rect(x,y,width,row),true,()=>{campaignDraft.confirmDestructive=true;if(campaignDraft.operation=="saveAs")ReviewLeave(campaignDraft);else ArmCampaign(campaignDraft);});y+=row+10*s;
            }
            else
            {
                GUI.Label(new Rect(x,y,width,95*s),"Save keeps the latest simulation in the active named record. Discard leaves that record at its last save. Uncommitted form drafts are discarded when leaving.",messageStyle);y+=110*s;
                var hasName=client?.CampaignLibrary?.activeCampaignId!=null;
                CampaignButton("campaign-leave-save",hasName?"Save and continue":"Name this campaign with Save As first",new Rect(x,y,width,row),hasName,()=>{
                    if(campaignDialog=="quit-unsaved"){quitAfterCampaignSave=true;ArmCampaign(Operation("save"));}
                    else{campaignDraft.unsavedDisposition="save";ArmCampaign(campaignDraft);}
                });y+=row+10*s;
                CampaignButton("campaign-leave-discard","Discard and continue",new Rect(x,y,width,row),true,()=>{
                    if(campaignDialog=="quit-unsaved"){
                        var discard=Operation("discard");discard.confirmDestructive=true;quitAfterCampaignSave=true;ArmCampaign(discard);
                    }
                    else{campaignDraft.unsavedDisposition="discard";ArmCampaign(campaignDraft);}
                });y+=row+10*s;
            }
            CampaignButton("campaign-cancel","Cancel",new Rect(x,y,width,row),true,()=>{campaignDialog=null;campaignDraft=null;quitAfterCampaignSave=false;});
        }
        private void UnsubscribeCampaignMenu()
        {
            if(campaignSubscribedClient!=null){campaignSubscribedClient.CampaignCompleted-=OnCampaignCompleted;campaignSubscribedClient.CampaignFailed-=OnCampaignFailed;campaignSubscribedClient=null;}
            WithdrawCampaignElements();
        }
        private void WithdrawCampaignElements()
        {
            foreach(var name in campaignElements)StudioUiElementRegistry.Withdraw(name);campaignElements.Clear();
```
