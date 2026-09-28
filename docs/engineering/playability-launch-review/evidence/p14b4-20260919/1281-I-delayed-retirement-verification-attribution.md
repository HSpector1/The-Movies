# 1281-I — Q21 delayed retirement: actual verification attribution

Q21 passed on published source `4d2aca744f15a73b45589d4d97b717f831209373`. Both compiler and runtime postflights closed with exit 0 and `allGuardsExact: true`. The isolated leaf reached its final retirement comparison after the fixed 59 advances, five accepted mutations and four explicit quotes. There is no failed or masked Q21 assertion in this record. This attribution reads the complete raw output and structured payloads; it adds no execution or source change.

## Closed gates and authority

| Gate | Actual command/result | UTC interval, 2026-09-28 |
| --- | --- | --- |
| [1282 compiler](1282-delayed-retirement-types.json) | `node_modules/.bin/tsc --noEmit -p tsconfig.json`; exit 0, no diagnostics; advance cap 0 | 01:03:27.840–01:04:02.731; **34.891 s** |
| [1283 runtime](1283-delayed-retirement-runtime.json) | `node_modules/.bin/vitest run --project core tests/p14p4p5-delayed-retirement.test.ts -t 'Q21 '`; exit 0, **1 PASS, 0 filtered**, one file; advance cap 59 | 01:04:28.474–01:05:14.076; **45.602 s** recorder |

The exact leaf is `P4/P5 delayed committed witness and actual retirement readmission > Q21 repeats retirement admission at the real witness-delayed release floor`. Vitest reports 40.661 s for the leaf, 40.670 s for the file and 44.55 s total. Its prospectively declared 180,000 ms timeout remains unchanged; this observation supplies no general latency guarantee. Both records use Node v20.20.2, retain empty consumed diffs/untracked lists, `fixedSource: true`, and null signal/error.

Complete primary evidence:

- [Compiler raw](1282-delayed-retirement-types.txt): 340 B, SHA256 `b5555328fbbecb26c958b74c9d804a3a5334c9fd7d4888d841a1eca860c99e8a`; [record](1282-delayed-retirement-types.json): 634 B, `251cf0dd6e650ee02b851ca65b03e17d01890fab262ab8479f546d233e9d63d4`.
- [Runtime raw](1283-delayed-retirement-runtime.txt): 1,854,303 B, SHA256 `e315a4d240e7b53db2a46aab3d41939dda4f705f2595ee030a4b4715b9acd065`; [record](1283-delayed-retirement-runtime.json): 700 B, `1ca54fb6615b64fad10620c558a9c43b3dc7e23ac4841f0abde6d199d75b9b40`.
- The complete 86 LF-preserved `1281-P4P5-` marker lines total 1,853,186 B, SHA256 `9095fa0714ba5a0df4059022cbfb6a5473a809c95839acf46bb6b9f4cf1a7ad4`. This identifies the full payload, including repeated trace/owner data, without duplicating or truncating it here. The complete nonmarker header and tail were also read.

The [compiler preflight](1282-delayed-retirement-types-preflight.json)/[postflight](1282-delayed-retirement-types-postflight.json) and [runtime preflight](1283-delayed-retirement-runtime-preflight.json)/[postflight](1283-delayed-retirement-runtime-postflight.json) preserve the exact published HEAD, all **238 manual pins**, **1,690 consumed source identities**, raw index and stage entries. Independent stdlib readback matched every manual file and declared decoded input, reconstructed the consumed inventory, and compared both gates' full before/after guards. Common identities are: inventory 256,528 B / `9dabf7a4960d19dff74124a8a45fc744764156a598a74b1eb178fec134f4e070`; index 1,136,083 B / `b941fe8c4333adc8da11158b59f22273a63e83d6faef766ee155bc10eedcb723`; stage entries 1,009,034 B / `90a6f91221003008cc5a78b37ffd10f48a226b98634c0920b08dbe7542b089ee`. Both recorder patches are empty. The test remains the reviewed 42,810 B / `d7de5234ff171dc330aa4472bd5482e18a99a86ea1f1dda377f3b107b9acc579` postimage from [1281-C](1281-C-delayed-retirement-source-handback.md) and [1281-D](1281-D-delayed-retirement-source-review.md).

## Actual route, settlement and durable subjects

The input is the unchanged [1171 generated Save39 capture](1171-p3-current45-capture/MANIFEST.json), actual week 45: gzip 86,995 B / `12799a849b0b4aff49cd9707ea8c1b87c64b4e787ff261b2e9cf4b109a953117`, decoded 751,294 B / `e7401f2578a7ad151383ca905df4253c2bbd82d6823c406c28b7e76aa809c5af`. Strict39 identity/export proof preceded genuine migration to current40, with only the declared subject sidecar `{version:1, cutoverOrdinal:19, facts:[]}` added. Actual cash, two Ready scripts, original person/contract/employment/case and all 19 old first-take receipts matched the pinned input. Its generated/funding provenance remains intact; it is not an Owner save. No capture or week0→45 prefix was rerun.

All 59 advances were attempted, reserved, invoked and completed exactly once, continuously **45→104**, with `develop:true`; outside-route attempts were zero. The 59 full trace records equal the final counter replay. All seven caches completed: genuine45, attached45, bound52, greenlit52, rehearsal55, held104 and waived104. Five mutation attempts were accepted after their calendar, input-purity, queue and whole-current admission checks: submit45, attach45, greenlight52, recipe55 and waive104. The raw counter also records four returned explicit quotes, two price reads and two matching settlement observations.

The real 52 settlement selected the player's Focus `authored-0006` proposal. The actual decision-state price—not merely the 45 preview—joined salary **488,081**, bonus **87,855**, employment **[52,156)** and the exact `-87855` signing ledger payment. Contract ID is `studio-de11f27b-player:contract:authored-0006:52:player-32`; settlement receipt is `talent-market-event-3`. The attached P4 drama/allCast/count1 root `promise-0`, window **[52,156)**, retained its identity and bound to this contract. Both separately observed precommit receipts were RA7/week52/digest `66be6cac92397ee5`; the literal first receipt equals the stored bound receipt. Both observation state hashes stayed `b4d96d8be5e606a098cae5b1d2e34d13ac5e27754a98405af17f34d7cb2fcedb`. The observations are equal-valued here, so runtime alone does not distinguish selecting the first from selecting the ranking reread; the reviewed settlement owner supplies that ordering.

Greenlight52 used actual Ready drama `script-0000`, Writer0003, Director0002, Craft0004 and cast lead0006/antagonist0001/support0005 after real contract, availability and profession checks. `prod-0052` started with eight remaining ticks. The recipe action at55 was accepted; setup admission occurred at56 and completed at60. The entire held60 and held104 production/workflow values are identical: remaining5, shooting phase, no blocker, complete four-unit ballroom setup and an **unassigned** shooting task. The player picture never acquired a first-take receipt or release commitment on this route. Bound `promise-0` remained literal through104 with progress0, no evidence and no outcome.

Every advance preserved the old 19-receipt prefix and admitted the complete current save. The actual appended suffix has **25 rival-only** receipts/subjects, events19–43: r04 contributes seven; r01/r02/r03 six each. Each receipt was independently joined to its exact studio, production, Director, cast, concept/genre and single managed project; every cumulative sidecar matched the trace and final payload. The first append occurred at48, the last at102. These are ordinary rival work effects; there is no player suffix take, fabricated subject or rival-offer success claim.

## Four complete quotes and the retirement discriminator

All four receipts use rulesVersion7. Each call's complete request, state bytes/hash and RNG were preserved. The call-through opportunity selector returned exactly the independently enumerated full raw-root/proposal union. The two P5 request objects and their serialized bytes are identical.

| Explicit quote | Actual week | Classification; bottleneck | Inputs digest | Selected union |
| --- | ---: | --- | --- | --- |
| P4 attachment, drama/allCast/count1/[52,156) | 45 | REASONABLY_ACHIEVABLE; null | `285bd77ca6f4d65b` | empty |
| P5 Ready crime `script-0001`, before waiver | 104 | REASONABLY_ACHIEVABLE; null | `f83a6276c698016f` | `promise-0` |
| Self-excluded P4 substitute [144,156) | 104 | REASONABLY_ACHIEVABLE; null | `6e49940332403f7d` | empty |
| Identical P5, after actual waiver | 104 | FRAGILE; `committed reservation timing leaves this opportunity uncertain` | `75f14535d4cf12e8` | `promise-1` |

At actual104, Focus is a primary Actor aged70 with genuine authored entry0/age68 provenance. Current and requested Actor records are identical: hardBoundary announcement104, effective156, status `announced`, no finishing/retired week and no extension. There was no Actor retirement record in earlier trace arrivals. The actual employment still ends156.

The full physical premise is equal before and after waiver. Its all-owner census has five production rows, 53 screenplay rows and no research rows: Focus belongs only to held player `prod-0052`, has no active writing/research assignment, and is not the permanent Writer of the fresh target. Ready crime `script-0001` is byte-meaning identical to the original input project. The six complete resource claims are two workflow facility slots, the whole-stage shooting-task reference, two standing-set mount references and the held set reference. Owner bodies and independent expected rows agree. Separate free development, soundstage12, scenery and post slots remain; this is not an unqualified own-reservation exemption claim.

Physical earliest held take/release are **105/109**. With original P4 window52, the witness permits fresh work109 and P5 take114, leaving66 weeks before due180. Actual Reliable trust and a self-excluded RA preview precede the public waiver. At104 the real waiver marks `promise-0` WAIVED, preserves its stored receipt and contract, links it to open `promise-1`, and gives the successor the same drama/allCast/count1 terms with **[144,156)** and the exact substitute preview receipt. Its outcome joins `talent-market-event-5`, kind `promiseOutcome`, week104, Focus/player and the actual waiver reason. All unrelated state and market fields, prior receipts and RNG remain unchanged; only the asserted promise changes and single outcome receipt are accepted.

The successor's common witness take144 delays release/fresh admission to **148**. Ignoring retirement gives P5 take153 and **27 weeks of slack** before due180, so neither a missed deadline nor inadequate slack explains the observed FRAGILE result. On the unchanged admitted actual104 state, requested Actor admission is null at query109 and147, but at148 returns exactly:

> talent "authored-0006" is retirementAnnounced (effective week 156) — a production seat taken at week 148 cannot release before it (P14C.2a)

The corresponding conservative releases are118/156/157. The independent union excludes the now-WAIVED parent and retains the actual bound/open successor; all membership flags and full selected rows were compared, not just IDs. This qualifies repeating retirement admission at the committed witness's delayed release floor.

## Limits

The last actual state is104. Weeks105/109/114/144/147/148/153/156 are explicit query or derived clock facts, not reached gameplay arrivals. The P5 request uses hypothetical [104,208) terms and is a pure quote; no extension, P5 proposal/attachment, new employment beyond156, shooting schedule, player take, fulfillment or retirement completion is asserted. Whole-save, purity, outcome-link and suffix checks all reached their final assertions, but this single isolated leaf does not qualify the whole suite or remaining P4/P5 policy matrix. Original source, plan, pre-execution receipt-oracle correction and primary records remain unchanged.
