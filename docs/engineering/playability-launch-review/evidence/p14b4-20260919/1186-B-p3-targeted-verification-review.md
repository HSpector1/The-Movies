# 1186-B — Independent targeted Bridge/component verification

**KEEP the bounded results; REFINE the initial D17 dirty-state oracle.** Independently read all seven closed records and complete raw logs, their three preflights, actual markers, frozen tests and the relevant campaign-library source. Five static gates pass; D15/D16 and the separate pure UI leaf pass; D17 completes prior53 qualification then fails before SaveAs. The three-leaf Bridge file remains failed. No execution, source/test edit or index action was performed by this reviewer.

All records use published `8ede2aefbcc6c423daf9c9d6316a5b0579bbc0e4`, fixed source/HEAD, empty consumed diff, no untracked source and null signal/recorder error. The initial preflight records matching remote and clean whole worktree. Later preflights truthfully list only newly produced evidence docs and preserve consumed cleanliness. The recorded plan explicitly permits independent UI observation after a Bridge test failure.

| Gate | Exact scope | Wrapper elapsed | Closed result |
|---|---|---:|---|
|1180|Bridge `tsc --noEmit -p tsconfig.bridge.json`|30.303s|PASS, no diagnostics|
|1181|Root `tsc --noEmit`|32.743s|PASS, no diagnostics|
|1182|UI `tsc --noEmit -p ui/tsconfig.json`|40.598s|PASS, no diagnostics|
|1183|`check:bridge-contract`|1.770s|PASS, three local generated outputs verified|
|1184|`check:bridge-contract:fixtures`|1.195s|PASS, local generic fixture verified|
|1185|Exact three Bridge leaves|132.692s|child1; D15/D16 PASS, D17 FAIL|
|1186|Exact one pure UI leaf|4.550s|child0; one PASS|

1185 ran16:18:59.567–16:21:12.259 UTC;1186 followed16:21:12.434–16:21:16.984. No unhandled-error section appears. D15 is reported PASS at63.631s despite its unchanged declared60s timeout and synchronous work; **no timeout-compliance, latency or reliability claim follows**. D16 is49.537s, D17 is13.750s; Bridge file126.920s and Vitest131.59s differ from recorder elapsed. UI’s case214ms/total3.67s likewise describe this observation only.

## Qualified behavior and remaining masks

D15 completes the actual public directing quote, closed/private-field controls, prepared attachment, duplicate replay, seven advances45→52, player settlement/employment/payment and tagged root binding. Marker identifies `promise-0` and contract `studio-de11f27b-player:contract:authored-0006:52:player-32`. The real zero-tick board move/stale-intent refusal passes with its exact journal/state preservation; pending-clear versus digest internals remain deliberately indistinguishable.

D16 completes own engine/Bridge role disclosure, actual other-studio privacy, bound profile/case/snapshot history, primary-Director preference, and pure read controls. Its actual52 waiver creates successor `promise-1` on the same contract with window53→112 and duplicate replay. This is zero-progress waiver coverage. Query104 is presentation over unchanged week52, not simulated104. Synthetic strict-old-reader classless P3 at scalar4/6 retains cast meaning, including open52/query84 wording; these are labelled compatibility constructions. Hidden/absent-ID refusals match. The pure UI leaf separately proves UNKNOWN/own/history/waiver DTO rendering, counts/classes/exclusive windows, stored-role wording, private-field exclusion and input purity; it does not mount the App or qualify a market workflow.

D17’s PRIOR53 marker follows **both** genuine runtime variants and every preceding assertion: distinct natural208/207 and after/before-waiver104 slots, strict39 state-preserving lifts, registered53/current54/protocol4, fresh session and reset revision/journal, foreign-command rejection purity, current reload without remigration, and all four individually corrupted inner-age slots rejected after outer digest repair without session creation. These are independent zero-tick positives and negatives, not inferred from the later failure.

D17 then obtains bound52, creates the in-memory coordinator and accepts its initial public SAVE. The first failed expectation is test577:56, `dirty` expected false but received true. This is the sole failure header/primary/printed frame. Its finally-close completes without replacing that primary. First SaveAs, both coordinator advances, named branch saves, clean LOAD, restart/replay/no-write checks, factory assertion and final runtime marker remain unreached.

The marker records exactly7 reserved/7 invoked/7 verified advances, all session, coordinator0, duplicates2; captured45/attached45/bound52/waived52 caches all complete. The old45-tick capture was only read. Two planned coordinator calls remain to reach expected9; the hard12 cap has separate three-call headroom, not three planned coordinator calls. Relative1178, D15/D16 failure identities vanish, D17’s cause changes from V38 decoding to this library expectation, and no new failure identity appears.

## Source-supported D17 disposition

`initialCampaignLibrary` with no legacy import creates `records:[]` and `activeCampaignId:null`. `campaignDirty` explicitly returns true for an unnamed draft. `withWorkingCampaignCheckpoint` updates only working checkpoint bytes when no active record exists, even after an accepted session SAVE; SaveAs is the operation that establishes a named savepoint. Therefore the initial clean expectation is incorrect, and this result supplies no production-library defect.

The narrow correction should prove unnamed dirty/null active/empty records, independently inspect full working current/saved52 equality and the same P3 root after SAVE, then assert named cleanliness after the existing first SaveAs. No extra operation, tick, timeout, route or production change is required. Later runtime behavior remains to be observed; the correction must not relabel this original failed record.

## Evidence pins

| Record | Bytes | SHA256 |
|---|---:|---|
|1180 JSON|641|`23315f92b003fe1ed182ef01bdc2b6fdbf5d53b7a0e163159c65ceadbb5dd79d`|
|1181 JSON|603|`6ffa99042187383650fcc1db9795c6b57384184136d24666d965f46b9e881552`|
|1182 JSON|637|`59131c144258e66b07ff012cafc242a67218827a29ea8826e33747981145ad58`|
|1183 JSON|609|`d548fcd7c23e4fd17d0c22c1645ffb1348525d159e0d237a5d83159483c30515`|
|1184 JSON|618|`f43a80566f0aad019137f741c613909328c4e633d6c7421d2d42a6a50c7cfa2c`|
|1185 raw|3,539|`9ea33735f03d15a57f4b11a1aed3fae941876b5c37fe02b0861f9753046033fd`|
|1185 JSON|683|`1966fa13c03e4e04218bab93930ac1a9e0ee3d659f0977b9e1f025f439a2f7a4`|
|1186 raw|717|`a03453e986f25c80ee62a99e696f663b2dfb1f06974f0ee731de41c379446492`|
|1186 JSON|687|`e67e7f95f73093851f651e9f29a62678931d61ca5c34a9f89ec645e4f3efb623`|

All seven recorded patches are empty. Rehashed Bridge test remains45,268B/`8f086d16818dd3449604f2da2b91ed575b1c5c04e5a656020867d5b140f6872d`; UI test4,931B/`9e3f3bb1b077972cfc4310582f2cd0635eb5c3b1893ea1236bedfa43180b0b06`. Static-gate logs were read in full; successful compiler/check commands do not substitute for runtime coverage. Remaining core/rival/matrix, full-suite, hosted UI, disk/native and timing limitations remain explicit.

Cross-checked final1186-A,11,790B/`e1d11f19104e41458ef6830f9dcf18703facede84ec203c3189eb920f64ea501`. The identified budget-wording error is corrected there; complete original11,297B/`497222bf1882506b2ffff9521bf046c3d79119d7f5236bdf59866f9da49640ff` is retained as its `.superseded.md` artifact. Independently compared both: only the budget sentence and explicit revision note differ, with every quoted raw/marker block unchanged. No remaining attribution discrepancy found. Final review frozen; no delayed appendix planned.
