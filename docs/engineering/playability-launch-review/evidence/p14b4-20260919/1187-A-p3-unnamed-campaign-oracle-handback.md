# 1187-A — Initial unnamed campaign oracle correction

Final source handback against `8ede2aefbcc6c423daf9c9d6316a5b0579bbc0e4`. The sole change is one D17 assertion block in `tests/bridge-p14p3-directing-promises.test.ts`. No production, existing helper, other test, input, configuration or generated artifact was edited. No compiler, test, gameplay, probe or project import evaluation was performed by the author.

## Actual cause and correction

1185 reached successful natural/waiver prior53 migration and malformed-slot controls, then failed at the initial runtime SAVE's library-dirty assertion. It expected false but observed true. The frozen 1186-A report preserves this result, full diagnostic and all counters; its sole budget wording correction separately retains the full superseded bytes.

The existing campaign contract supports the observed true. `initialCampaignLibrary` starts with no named record when there is no legacy import; `campaignDirty` returns true without an active named record (`bridge/runtime/campaign-library.ts:140`). Low-level SAVE updates the working checkpoint while retaining null activeCampaignId (`withWorkingCampaignCheckpoint:263`); it does not silently create a named campaign. Actual SaveAs is allowed while this draft is dirty and creates/activates the named copy. This is a test prerequisite error, not evidence of a production persistence defect.

The corrected control explicitly requires dirty true, null active ID and empty public campaigns after the same initial SAVE. It validates the stored working checkpoint, both slots at week52 with equal current/saved bytes, and the same actual bound promise. The unchanged first SaveAs is then followed by the clean named-library/actual active-ID assertion. The original later record, state, journal, duplicate/write, branch-save, clean-load and restart checks remain exact.

## Bound and verification selection

Only D17 will be selected after the parent Bridge compiler:

```text
node_modules/.bin/tsc --noEmit -p tsconfig.bridge.json
node_modules/.bin/vitest run --project core tests/bridge-p14p3-directing-promises.test.ts -t D17
```

The selector matches exactly one existing declaration. D17 first runs both independent prior53 controls, then calls its own bound52 cache dependency: captured45 → actualAttached45 → actualBound52. It therefore still performs seven actual session advances even when D15/D16 are filtered. The existing coordinator branch adds two, for expected9 with hard12 and three unused headroom slots. No extra invocation, action, quote route or replay has been added by the oracle correction. The attached command replay plus the planned SaveAs and load replays produce three duplicate invocations if the complete selected route succeeds; the waiver phase is not invoked. All three original60s declaration timeouts and counter logic remain exact. No result or runtime duration is predicted.

All bytes before D17, including the complete D15/D16 bodies and every shared helper, are unchanged. Thus their actual1185 passes and UI1186 pass remain separately recorded prior evidence; the filtered rerun will not claim a new all-three-leaf or complete-core/UI pass. The D15 synchronous63.631s versus declared60s observation remains, and this correction makes no performance/timeout adjustment. Parent plans no repeated root/UI types or generation absent a relevant change; the changed Bridge test belongs to the Bridge compiler graph.

## Frozen identities

The manifest contains the exact old/new block and complete test identities. Reversing this one substitution reconstructs the complete baseline test bytes; the ordered patch includes no other path. Operations/order/IDs, fixture pins, command requests, positive and negative downstream assertions and raw1185 evidence are preserved.

| Artifact | Bytes | SHA256 |
| --- | ---: | --- |
| `test before` | 45268 | `8f086d16818dd3449604f2da2b91ed575b1c5c04e5a656020867d5b140f6872d` |
| `test after` | 45878 | `dbc4800046353a25d75261604e944b77c05e26c43d79ae4e856e23fb4aabf86d` |
| `1187-p3-unnamed-campaign-oracle.patch` | 1622 | `5b85ea88a7cc9ac1bb5b3c1f2e7894a3f147779194cabbf8261fabe2a20175cd` |
| `1187-p3-unnamed-campaign-oracle-manifest.json` | 2823 | `cdd113d08a4ca9a77a84bd446b5ea7badcbdea0d4dc67d647756f9dcd6dac1e0` |
