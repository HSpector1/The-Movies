# 1178-A — Actual first Bridge observations

Final author attribution of closed parent runs on published `d2f615b015bfb673b8b69d188d592b710bb9aecb`. Frozen source and all original records remain unchanged. The author performed only source, record and standard-library data reads; no compiler, test, gameplay, probe or source edit.

## Closed gates and scope

| Gate | Actual UTC interval | Wrapper duration | Result |
| --- | --- | ---: | --- |
| 1177 Bridge compiler | 2026-09-27 16:03:31.415Z–16:03:59.999Z | 28.584 s | Child 2; exactly two known production diagnostics, no test diagnostic. |
| 1178 exact three Bridge leaves | 2026-09-27 16:04:24.556Z–16:04:33.392Z | 8.836 s | Child 1; one file, three failed cases; no pass, skip or TODO reported. |

Both records show fixedSource true, the empty consumed diff SHA `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`, no untracked consumed source, unchanged start/end HEAD, and no signal or recorder error. The compiler preflight had a clean whole worktree and matching remote. Runtime preflight matched remote and consumed cleanliness while truthfully listing only four new 1177 evidence files in the whole worktree; it explicitly did not claim a compiler PASS.

Exact runtime argv: `node_modules/.bin/vitest run --project core tests/bridge-p14p3-directing-promises.test.ts`. Vitest reports 3.468 s for the file and 7.68 s total; individual cases are 2.774 s, 0.004 s and 0.687 s. These are execution observations, not a performance or reliability qualification. No unhandled-error block is printed.

## Compiler attribution

The following complete production diagnostic suffix is literally present in both 1175 and 1177. The three original test diagnostics disappeared after the exact two-line 1176 amendment; no broader type gate is claimed. The two production errors remain:

```text
bridge/people.ts(1048,7): error TS2322: Type '"significantCastRole" | "anyCastAppearance" | "directingOpportunity"' is not assignable to type '"significantCastRole" | "anyCastAppearance"'.
  Type '"directingOpportunity"' is not assignable to type '"significantCastRole" | "anyCastAppearance"'.
bridge/promises.ts(111,68): error TS2339: Property 'seatClass' does not exist on type 'CastRoleCountPredicate | DirectorCountPredicate'.
  Property 'seatClass' does not exist on type 'DirectorCountPredicate'.
```

The compiler boundary and runtime first causes are distinct. Vitest collected and ran all three cases despite the known production typing issues; there is no missing-module or malformed-fixture collection failure.

## Reached first causes

| Leaf | First actual cause | Reached before failure | Unreached after failure |
| --- | --- | --- | --- |
| D15 public directing commands | Attached45 quote transport succeeds, but its public verdict is `ok:false`, promise `ok:false`, `IMPOSSIBLE`, against required RA; shared assertion at test153. | Pinned capture manifest/gzip/raw, strict full39/canonical admission, week45/two Ready projects/subject roles; valid closed draft and all seven invalid-wire validation/purity controls; actual quote request/response schema and kind plus unchanged authoritative state/RNG/revision/checkpoint. | Prepared command, actual attachment, duplicate replay, bound52 advances/settlement/payment, stale-intent board-change control and success marker. |
| D16 truthful disclosure | Rethrows the same cached attached45 quote failure. | It invokes the actual attached45 phase; the existing first error is reused without another quote or route. | Engine-owned role disclosure, privacy/history/schema/read purity, preference label, bound52 reminder, waiver, hidden-ID control, synthetic legacy cast wording and success marker. |
| D17 outgoing/runtime | Genuine natural runtime53 enters current decoder, which refuses its V38 current slot: `checkpoint.currentSaveJson: must be a current V39 save, received V38`. | Independent natural208/saved207 raw runtime pin, canonical outer record, actual schema53/protocol4/revision1, two accepted save/command journal rows, exact distinct current/saved slot bytes, both strict frozen38 admissions and digests, journal digest. | Successful53 migration, projection54/registry assertions, reset/current-reload/inner-corruption controls, the second waiver104 runtime, any bound52 dependency and the entire coordinator SaveAs/load/restart/duplicate path. |

D15's quote returned an accepted Bridge response carrying a refusal verdict; the log does not print its complete receipt, bottleneck or digest. No missing field in that omitted receipt is invented here. Static source explains the observed mismatch: `bridge/promises.ts:50` converts the count-only directing wire to `{count}`, while current core `promises.ts:510` requires explicit `directorCount`. That is source-supported attribution, separate from the directly printed `IMPOSSIBLE` verdict. No successful player contract or tagged Bridge root was minted in this run.

D17 stops on the first, natural outgoing checkpoint before its assertions about migration metadata or session factory count. Current Bridge identity still routes this genuine prior capture to the current decoder (`loadBridgeRuntimeCheckpoint:1315`); the printed stack independently identifies that path. Neither the second historical checkpoint nor repaired-hash malformed-slot controls ran. The older runtime artifact itself was successfully proven as frozen38 before the failed current admission.

## Complete diagnostics and frame accounting

There are three failure identities in two printed diagnostic groups: one shared-header D15/D16 block and one D17 block. The shared block supplies one printed tail/caller (D15 at442); it does not supply a separate D16 caller stack. The following blocks retain every printed header, primary line, diff and frame. Complete underlying diagnostics beyond Vitest's own printed abbreviation are not available and are not reconstructed.

Group 1: 2 identity header(s); primary SHA256 `4124f7100f0dec762e5ba48ae30c737b39d9f063fe5d14032ee8a664cc4a217e`; complete printed tail SHA256 `6ebc2b8e3f273b636977b91edf4913e20f3a3bc25b5cae41e86a0e8c5418bd34`. Hash slices are UTF-8 without outer newline characters; internal text is unchanged.

```text
 FAIL |core|  tests/bridge-p14p3-directing-promises.test.ts > P3 public Bridge authority, truthful terms and durable runtime > D15 commits genuine public directing commands with closed private authority
 FAIL |core|  tests/bridge-p14p3-directing-promises.test.ts > P3 public Bridge authority, truthful terms and durable runtime > D16 discloses Director and legacy cast terms truthfully without private inputs
AssertionError: expected { …(24) } to match object { ok: true, …(1) }
(23 matching properties omitted from actual)

- Expected
+ Received

  Object {
-   "ok": true,
+   "ok": false,
    "promise": Object {
-     "classification": "REASONABLY_ACHIEVABLE",
-     "ok": true,
+     "classification": "IMPOSSIBLE",
+     "ok": false,
    },
  }

 ❯ tests/bridge-p14p3-directing-promises.test.ts:153:21
    151|     const beforeRoots = clone(session.gameState.promises)
    152|     const q = quoteMarket(session, proposal(), '1174-proposal-quote')
    153|     expect(q.quote).toMatchObject({ ok: true, promise: { ok: true, cla…
       |                     ^
    154|     const committed = submit(session, q.quote.intentId, '1174-proposal…
    155|     const own = session.gameState.talentMarket.proposals.filter(row =>…
 ❯ memo tests/bridge-p14p3-directing-promises.test.ts:76:23
 ❯ attached45 tests/bridge-p14p3-directing-promises.test.ts:149:10
 ❯ tests/bridge-p14p3-directing-promises.test.ts:442:22
```

Group 2: 1 identity header(s); primary SHA256 `8fbcf30900e9e20ec16851cb9cee8e1851fe3aab39310d7ef73fe87be19ee3be`; complete printed tail SHA256 `44b17c2d16efdad29815aa73eb4c4b70ea3c4acc8c91a30823bfc15439d15b29`. Hash slices are UTF-8 without outer newline characters; internal text is unchanged.

```text
 FAIL |core|  tests/bridge-p14p3-directing-promises.test.ts > P3 public Bridge authority, truthful terms and durable runtime > D17 migrates outgoing53 independently and isolates current54 campaigns
BridgeRuntimeCheckpointError: checkpoint.currentSaveJson: must be a current V39 save, received V38
 ❯ fail bridge/runtime-checkpoint.ts:366:9
    364| 
    365| function fail(path: string, message: string): never {
    366|   throw new BridgeRuntimeCheckpointError(path, message)
       |         ^
    367| }
    368| 
 ❯ validateCanonicalCurrentSave bridge/runtime-checkpoint.ts:489:5
 ❯ hydrateAndEncodeBridgeRuntimeCheckpoint bridge/runtime-checkpoint.ts:1111:23
 ❯ decodeBridgeRuntimeCheckpoint bridge/runtime-checkpoint.ts:1264:20
 ❯ Module.loadBridgeRuntimeCheckpoint bridge/runtime-checkpoint.ts:1315:15
 ❯ qualifyPrior53 tests/bridge-p14p3-directing-promises.test.ts:318:20
 ❯ tests/bridge-p14p3-directing-promises.test.ts:565:5
```

## Actual counters and remaining limits

The exact sole route marker follows (the literal line plus LF hashes to `dc9438e38424373da3ca32f7272ae774fb04af57d5b55dbdce5515a2a94fe6c5`). All six operation counters are zero. Captured45 is complete; actualAttached45 stores its first failure. No bound or waiver phase was started. There was no advancing reservation, advancing dispatch invocation, verified one-week movement, or duplicate dispatch; the separate earlier 45-call capture is immutable input, not replayed gameplay in this run.

```text
1174-P3-BRIDGE-COUNTERS {"reservedAdvanceCommands":0,"verifiedOneWeekAdvances":0,"actualAdvanceDispatchInvocations":0,"sessionAdvanceAttempts":0,"coordinatorAdvanceAttempts":0,"duplicateInvocations":0,"cap":12,"phases":[{"name":"captured45","complete":true},{"name":"actualAttached45","complete":false}]}
```

The four later success markers `1174-P3-WIRE`, `1174-P3-DISCLOSURE`, `1174-P3-PRIOR53` and `1174-P3-RUNTIME` are absent. Their claimed outcomes remain unqualified. Hard12 and three fixed60s leaves remain unchanged; this failure does not authorize added calls, replay, alternate input or assertion weakening.

This run adds no qualification for actual rival staffing, the deferred component UI, query-time104 reminder wording, synthetic old-reader P3 constructions, waiver or runtime migration. The planned coordinator uses an in-memory store and would prove its specified semantics only after being reached; it would not prove native/realdisk/latency behavior. No claim is made that all prior P3 or C3 cases were run on this source. Parent owns the next production and source decisions; this report changes none.

## Frozen identities

| Record | Bytes | SHA256 |
| --- | ---: | --- |
| `1177-p3-bridge-types-preflight.json` | 501 | `8e6f77831b815a780e7b591e32f196b47b650f184f2e4d2e0dd897df6b56e44e` |
| `1177-p3-bridge-types.txt` | 850 | `6ce5230245324b8121d5f7d73e576f1e1d853138896d6808ff35bb18a28e0fb4` |
| `1177-p3-bridge-types.json` | 641 | `a149d1e59cbfeba54de5e0c57d7b02f741c528bca1dc23c4f2d1e18317dfc05f` |
| `1178-p3-bridge-red-preflight.json` | 999 | `5ec02f424478f8762e65de518fd04b251b8f0a73cd9f775128a457e5d139f7fe` |
| `1178-p3-bridge-red.txt` | 4443 | `7908dcd5bffddb0f761c185781d24693c20b620be15c13aca3c132c80514fa54` |
| `1178-p3-bridge-red.json` | 683 | `e4664c36f9239df6d6abd6e4da9c92c439638b0b7010fe8ae1310b0f243e0fbf` |
| `tests/bridge-p14p3-directing-promises.test.ts` | 45268 | `8f086d16818dd3449604f2da2b91ed575b1c5c04e5a656020867d5b140f6872d` |
