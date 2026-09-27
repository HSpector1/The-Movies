# 1186-A — Targeted Bridge and component verification

Final attribution of the closed parent runs on published `8ede2aefbcc6c423daf9c9d6316a5b0579bbc0e4`. All source, tests, captures and original records remain unchanged. This author read records/source only; no compiler, test, gameplay, probe or source edit was performed.

## Actual closed results

| Gate | UTC interval on 2026-09-27 | Wrapper duration | Actual result |
| --- | --- | ---: | --- |
| 1185 exact Bridge file | 16:18:59.567Z–16:21:12.259Z | 132.692 s | Child 1; one failed file; D15 and D16 pass, D17 fails: 2 PASS / 1 FAIL, no skip or TODO reported. |
| 1186 exact pure UI file | 16:21:12.434Z–16:21:16.984Z | 4.550 s | Child 0; one file / one case PASS, no skip or TODO reported. |

Both records report fixedSource true, empty consumed diff SHA `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`, no untracked consumed source, equal start/end HEAD and no signal/recorder error. Neither raw log contains an unhandled-error block. The parent targeted preflight matched the remote HEAD and consumed cleanliness, and truthfully listed the earlier closed gate evidence as the only whole-worktree changes. UI ran after the Bridge child failed, as the recorded sequential plan explicitly permits.

Exact commands:

```text
node_modules/.bin/vitest run --project core tests/bridge-p14p3-directing-promises.test.ts
node_modules/.bin/vitest run --project ui ui/src/components/ProfessionalPromiseTerms.test.tsx
```

Vitest records D15 at 63.631 s, D16 at 49.537 s and D17 at 13.750 s; Bridge file 126.920 s / Vitest total 131.59 s. D15 is reported PASS despite exceeding its declared 60-second timeout in synchronous work. This is not a latency or timeout-compliance claim, and the source timeout was not raised. UI reports 214 ms for the one case/file and 3.67 s total; these observations do not establish timing reliability.

## Reached assertions and bounded qualification

**D15 PASS.** The pinned actual45 capture is strictly admitted; closed request/negative controls and pure quote succeed. The real public directing quote, prepared command, tagged attachment and exact duplicate replay succeed. Seven actual session advances reach52, with actual player win, contract52→156, payment and binding. The stale-intent control performs a real zero-tick alternate board commitment and proves unchanged authoritative state/RNG/revision on refusal while retaining the protocol's refusal journal. This does not distinguish pending-clear from material-digest internals beyond the declared surface.

**D16 PASS.** Actual own engine disclosure and closed Bridge carriers report Director meaning, other-studio terms remain UNKNOWN, unbound roots stay out of bound history, and the primary Director preference is disclosed. Bound history, profile/case/snapshot rows and privacy/purity assertions pass. The unchanged admitted week52 state supports the explicitly labelled query-time104 reminder control, with directing wording and non-issuer privacy; no world104 was simulated. Actual zero-tick public waiver at52 succeeds, with same-contract successor window53→112, typed original→successor link, receipt/history/read purity and exact duplicate response. The root has zero progress, so this is not the separate core partial-progress waiver claim. Hidden/absent ID refusal equality and the explicitly synthetic old-reader classless P3 controls at scalar4/6 pass: their cast meaning comes from old predicate shape, including the open52/query84 filming reminder; they are not naturally authored historical P3 campaigns.

**D17 partially reached, still FAIL.** Both genuine prior53 variants complete all independent controls: distinct208/207 and104-after/104-before slots, unchanged frozen input authority, actual migration to current39/54, prior53 registration, protocol4, new session/reset journal/revision, state preservation, rejected old command purity and current checkpoint no-remigration. Each variant's current and saved inner-slot age corruption with repaired outer digest is rejected before session creation: four malformed-slot controls in total. The PRIOR53 marker occurs after all of these checks, independently of the bound52 route.

D17 then obtains the actual admitted bound52 state, constructs the in-memory runtime coordinator and completes the initial public SAVE. Its immediately following expectation that the unnamed campaign library is clean fails: actual dirty is true at test577. The real close/finally path runs; no cleanup failure replaces the printed primary. SaveAs original52, both coordinator advances, branch53/54 saves, requireClean load, restart, replay/no-write checks, fresh-factory assertion and final runtime marker remain unreached. This first cause is not a failed Save53 migration and not evidence of a later campaign-isolation defect.

**UI D16 presentation PASS.** The single pure component leaf covers UNKNOWN/own/waiver/history surfaces, same-family Director versus historical classless cast DTO wording, null/lead/lead-or-antagonist class handling, count/plurality and exclusive window text, history progress/Open/SATISFIED, extra runtime private fields never rendered or used, and input purity. It imports no engine/session/helper and performs zero simulation or runtime commands. This proves component presentation only, not App or market workflow integration.

## Complete runtime failure and comparison

Compared with 1178's three failure identities, D15/D16 vanish and now pass. D17 is retained with a changed first primary cause; there are no new failure identities and no identical retained primary failure. The earlier actualV38 decoder refusal is resolved on this source by the completed prior53 controls. Its original record remains intact.

One failure header, one diagnostic group and one printed frame are emitted. The full group is preserved below; there are no hidden frames reconstructed. Primary SHA256 `e8f2a3770944f52d07c129662c8ed72350616d099d4d285b54af76b6334cd671`; complete printed post-header tail SHA256 `e13d20d2f7cd90dbf182766cf3a50eda5598028cb20a60fc58adadf705cf2aa4` (UTF-8, outer LF removed only).

```text
 FAIL |core|  tests/bridge-p14p3-directing-promises.test.ts > P3 public Bridge authority, truthful terms and durable runtime > D17 migrates outgoing53 independently and isolates current54 campaigns
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ tests/bridge-p14p3-directing-promises.test.ts:577:56
    575|     try {
    576|       await runtimeSave(runtime)
    577|       expect((await runtime.campaignLibrary())!.dirty).toBe(false)
       |                                                        ^
    578|       expect((await runtime.campaign(await campaignRequest(runtime, 's…
    579|       const a = library(store).records.find(row => row.label === 'P3 o…
```

Source analysis of the initial library dirty expectation will be sent separately for parent review; this attribution authorizes no test or production edit.

## Exact actual markers and counters

Literal marker plus LF SHA256 `5e8038cb68d84965db7d405c4bba8806c68c5d360b8ad74ecfeb3ae541644e1a`:

```text
1174-P3-WIRE {"week":52,"promiseId":"promise-0","contractId":"studio-de11f27b-player:contract:authored-0006:52:player-32","advancingCommands":7}
```

Literal marker plus LF SHA256 `ea4c41accbadcb1fa48cc5fd4681441f33a52029826fe18eaae033dbb0c5dc90`:

```text
1174-P3-DISCLOSURE {"boundWeek":52,"reminderQueryWeek":104,"waiverWeek":52,"original":"promise-0","successor":"promise-1","extraTicks":0}
```

Literal marker plus LF SHA256 `b8fc7146dd9a59b86b59aaab34ba7178ef92d6fd6ce0729bcee917a054ecafd0`:

```text
1174-P3-PRIOR53 {"slots":["208/207","104-after/104-before"],"ticks":0,"qualified":true}
```

Literal marker plus LF SHA256 `38f41f9e2dd32a37c01189c8082af1c56a829f6ec5457941507455f0637f8697`:

```text
1174-P3-BRIDGE-COUNTERS {"reservedAdvanceCommands":7,"verifiedOneWeekAdvances":7,"actualAdvanceDispatchInvocations":7,"sessionAdvanceAttempts":7,"coordinatorAdvanceAttempts":0,"duplicateInvocations":2,"cap":12,"phases":[{"name":"captured45","complete":true},{"name":"actualAttached45","complete":true},{"name":"actualBound52","complete":true},{"name":"actualWaived52","complete":true}]}
```

All four shared phases complete. Seven advancing commands were reserved, actually dispatched and verified to move one week; all seven belong to the shared session45→52 route. Coordinator advances remain zero. The two duplicate invocations are the successful attachment and waiver replays. The completed earlier45-call capture is only read here and was not regenerated. Hard12 is unchanged, and the three unused planned coordinator-budget slots do not authorize new actions. There is no `1174-P3-RUNTIME` marker.

## Prerequisite static gates

All five recorded gates below passed on this exact source with fixedSource true, empty consumed diff, no untracked consumed source or signal/error. They are compiler/local generation checks, not additional behavioral or Unity/native qualification. The external consumer gate remains deferred.

| Record | Exact command | Wrapper seconds | Child |
| --- | --- | ---: | ---: |
| 1180-p3-bridge-types | `node_modules/.bin/tsc --noEmit -p tsconfig.bridge.json` | 30.303 | 0 |
| 1181-p3-root-types | `node_modules/.bin/tsc --noEmit` | 32.743 | 0 |
| 1182-p3-ui-types | `node_modules/.bin/tsc --noEmit -p ui/tsconfig.json` | 40.598 | 0 |
| 1183-p3-contract-check | `npm run check:bridge-contract` | 1.770 | 0 |
| 1184-p3-fixture-check | `npm run check:bridge-contract:fixtures` | 1.195 | 0 |

The remaining overall boundaries stay explicit: the three-leaf Bridge file is not wholly green; there is no complete-core/UI/neighbors sweep on this candidate, no new rival staffing qualification, no actual week104 Bridge trajectory, and no real-disk/native/reliability claim.

## Frozen record identities

| Artifact | Bytes | SHA256 |
| --- | ---: | --- |
| `1180-p3-bridge-types.json` | 641 | `23315f92b003fe1ed182ef01bdc2b6fdbf5d53b7a0e163159c65ceadbb5dd79d` |
| `1181-p3-root-types.json` | 603 | `6ffa99042187383650fcc1db9795c6b57384184136d24666d965f46b9e881552` |
| `1182-p3-ui-types.json` | 637 | `59131c144258e66b07ff012cafc242a67218827a29ea8826e33747981145ad58` |
| `1183-p3-contract-check.json` | 609 | `d548fcd7c23e4fd17d0c22c1645ffb1348525d159e0d237a5d83159483c30515` |
| `1184-p3-fixture-check.json` | 618 | `f43a80566f0aad019137f741c613909328c4e633d6c7421d2d42a6a50c7cfa2c` |
| `1185-p3-targeted-preflight.json` | 3315 | `71b6b33ce3dee34e402fd30f71df53337f9678406b756777086e2d4433c7f08d` |
| `1185-p3-bridge-candidate.txt` | 3539 | `9ea33735f03d15a57f4b11a1aed3fae941876b5c37fe02b0861f9753046033fd` |
| `1185-p3-bridge-candidate.json` | 683 | `1966fa13c03e4e04218bab93930ac1a9e0ee3d659f0977b9e1f025f439a2f7a4` |
| `1186-p3-ui-terms.txt` | 717 | `a03453e986f25c80ee62a99e696f663b2dfb1f06974f0ee731de41c379446492` |
| `1186-p3-ui-terms.json` | 687 | `e67e7f95f73093851f651e9f29a62678931d61ca5c34a9f89ec645e4f3efb623` |
| `bridge-p14p3-directing-promises.test.ts` | 45268 | `8f086d16818dd3449604f2da2b91ed575b1c5c04e5a656020867d5b140f6872d` |
| `ProfessionalPromiseTerms.test.tsx` | 4931 | `9e3f3bb1b077972cfc4310582f2cd0635eb5c3b1893ea1236bedfa43180b0b06` |
