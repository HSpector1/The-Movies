# 1098-A — D observation capacity and proposed lossless recording amendment

**Finding:** the frozen producer has no credible capacity margin for D. Completed
A supports **600** prospective D read groups. Applying A's observed row sizes to
that schedule projects **17,115,650–18,053,334 bytes**, against the unchanged
**16,777,216-byte** observation-file cap. This is an empirical feasibility
finding, not an executed D result or a mathematical lower bound on every possible
timing/page representation. Do not launch D assuming the current format fits.

The narrowly proposed remedy is lossless interning of repeated lifecycle `focus`
payloads in newly recorded observations. A file-only, in-memory demonstration
reconstructed every original A observation byte exactly and saved9,703,598 bytes.
No artifact, producer, loader, test, staging file or production source was changed.
No project module was imported/evaluated; no gameplay, compiler or test ran here.

## Closed authority and measurements

A (`1052-c3-endurance-A-observer-fixed`) closed PASS at
2026-09-27T03:25:02.045Z:6240 actual ticks/attempts,1072 commands,121 read groups,
122 releases,75 attachments and3 runtime samples. Source HEAD is
`aa9acec52f4e6a393358cedd2f72689f0476938e`, consumed diff empty, tracked identity
157,398 bytes/SHA
`74251acc61847dd183e5c429cfce36db9d39860d38f3de23cfbe7116b93d6181`.
The unchanged producer is66,372 bytes/SHA
`f7d19d39218b9570b3be65a14a0e3cd0a346dd06be1beb283a9bdcc830dfff4d`.

| Closed file | Bytes | SHA256 |
| --- | ---: | --- |
| metadata.json | 1,129,358 | `3762178bb4a542b5f10014a55c78fead6bbfbbf2e4cecd70659cb69becc6163d` |
| observations.jsonl | 13,032,982 | `87dd429a8b513393c5fdf2daebc64bf51cf08263ddc4ef840597001d9c29ccc7` |
| commands.jsonl | 352,939 | `d27e0ff3d1ed7132f0b68a2619b3b98123591f319a3a29fe3a3a4cb1f1c8e93c` |
| checkpoints.jsonl | 1,199,831 | `131baf9c5300afbe78d62e19df3600f0da01b992e6fd9ddbbb8831ab500d39d2` |
| failure.json | 312 | `d75501444f64994b3d8e4cf959d2e38e46e7bada0b53f273fb2c8e9bd87ec845` |

A has exactly10 persistent files totaling40,480,386 bytes. Its metadata pins
the complete nine-file inventory excluding itself, including retained3120/6240
authority and all three runtime libraries. Those existing pins and bytes remain
authoritative; no rewritten metadata or converted A log is proposed.

Every observation byte, including its newline, was counted from the closed file:

| Kind | Rows | Bytes |
| --- | ---: | ---: |
| lifecycle-boundary | 2,090 | 10,518,323 |
| read-observation | 121 | 1,196,212 |
| tick-timing | 6,240 | 922,550 |
| release | 122 | 204,484 |
| actual-people-append | 100 | 74,684 |
| timing | 368 | 43,984 |
| actual-cohort | 120 | 27,069 |
| runtime-observation | 3 | 26,400 |
| promise-feasibility | 76 | 19,276 |
| **Total** | **9,240** | **13,032,982** |

Read rows range8,678–10,234 bytes, mean9,886.049586777, median9,830. The source
allows state-dependent pages/selected profiles and ordinal-dependent read order,
film lane and history period. Actual timings have variable numeric spelling.
The observed minimum is therefore **not** a proof of a universal D minimum.

## Exact prospective schedule from the completed trace

The frozen driver resets the weekly command allowance, checks D's first actual
`nextStudioDecision` in each52-week block before replay, then executes that
week's baseline commands. A's policy performs `decide()` before ordinary weekly
hiring/renewal/film/promise actions. Its startup has17 accepted commands, the
first16 at0; the remaining startup set command does not manufacture an earlier
hidden decision. Every actual trace week containing a `decision-*` command has
that command first. No decision is masked behind an earlier nondecision command.

The trace contains538 decision commands across416 distinct weeks. Taking the
first such week per52-week block yields119 blocks; only block3 (weeks156–207)
has none. Their exact weeks are:

```text
4,55,107,211,263,315,367,419,471,523,575,626,679,731,783,835,887,938,
991,1043,1095,1147,1199,1250,1303,1355,1407,1459,1511,1562,1615,
1667,1719,1771,1823,1874,1926,1979,2031,2083,2135,2186,2238,2291,
2343,2395,2447,2499,2551,2603,2655,2707,2759,2811,2863,2915,2967,
3019,3071,3123,3175,3227,3279,3331,3383,3435,3487,3539,3591,3643,
3695,3747,3799,3851,3902,3954,4007,4059,4111,4163,4214,4266,4319,
4371,4423,4475,4526,4578,4631,4683,4735,4787,4838,4890,4943,4995,
5047,5099,5151,5203,5255,5307,5359,5411,5463,5515,5567,5619,5671,
5723,5775,5827,5879,5931,5983,6035,6087,6139,6191
```

None is divisible by13. Thus, conditional on the required identical replay and
pure reads, D has481 regular groups at0,13,...,6240 plus119 decision groups,
**600 total**, with no coalescing. The frozen theoretical cap remains601. These
are source/trace-derived prospective weeks, not observations from an executed D.

D replays commands and does not invoke A's policy. Consequently A's76
`promise-feasibility` rows do not recur. D also omits A's three runtime samples
and runtime-authority timings. A recorded no policy-only `availability` rows.
Tick, release, cohort, identity-append and lifecycle facts should recur under the
required authority equivalence; elapsed timing spellings remain variable.

## Capacity arithmetic and limits of the estimate

Removing all A read rows, generic timing rows, runtime rows and policy-only
promise-feasibility rows leaves11,747,110 bytes. This base retains A's actual
6,240 tick-timing rows, so its timing bytes are a proxy, not a promised D size.

D records1,323 generic timing rows:2 initial exports,481 scheduled exports,
119 decision exports,121 checkpoint hashes and600 after-read exports. For the
estimate, decision exports use scheduled-export sizes plus one byte for the
longer phase name; the119 decision observation wrappers likewise add one byte
each. Initial export bytes remain the measured239. Relevant observed phase
sizes are scheduled123/mean125.033057851/maximum126, checkpoint103/106.347107438/
107 and after-read125/126.950413223/128.

For each scenario, estimated bytes are:

```text
11,747,110 + 600*readSize + 119
 + 239 + 481*scheduledSize + 119*(scheduledSize+1)
 + 121*checkpointSize + 600*afterReadSize
```

| Observed-size scenario | Estimated D bytes | Over16MiB |
| --- | ---: | ---: |
| All applicable observed minima | 17,115,650 | 338,434 |
| Applicable observed means | 17,843,275 rounded | 1,066,059 rounded |
| All applicable observed maxima | 18,053,334 | 1,276,118 |

These are sensitivity scenarios, not statistical confidence bounds or exact
future results. D's additional weeks and changed ordinal parity can alter page
counts; every inspection and tick has new timings. The256KiB per-group ceiling
alone cannot establish16MiB aggregate feasibility. Even the deliberately small
observed-size scenario exceeds the cap, so assuming enough room is unsupported.
No reliable future duration follows from byte estimates or A's elapsed time.

## Narrow lossless format proposal — not implemented

The2,090 lifecycle rows contain10,328,762 raw serialized `focus` bytes but only
121 distinct exact serialized payloads totaling591,151 bytes. The same two focus
people's full skills/history/retirement facts are repeated when unrelated
industry lifecycle roots change. Preserve all those facts and every boundary.

A deterministic candidate encoding was evaluated **only in memory over the
closed log**, using standard-library byte/JSON operations:

1. Keep every non-lifecycle line byte-identical.
2. Extract each lifecycle line's final `,"focus":<raw JSON>}\n` suffix. Assign
   first-seen IDs `focus-0`, `focus-1`,... by exact raw JSON byte equality.
3. Before first use, emit exactly
   `{"kind":"focus-definition","id":"focus-N","focus":<raw JSON>}\n`.
   Preserve the original boundary prefix and replace only its suffix with
   `,"focusRef":"focus-N"}\n`.
4. Decode in order: require every definition unique and every reference already
   defined; elide definitions and reinsert the exact retained raw JSON suffix.

The candidate has9,361 physical rows and3,329,384 bytes, SHA
`2c1a9f08b3f5ee20189db844ee16f85fd1787ff006d1febd65c3af550ce8436c`.
Decoding produced exact byte equality with all13,032,982 original bytes and SHA
`87dd429a8b513393c5fdf2daebc64bf51cf08263ddc4ef840597001d9c29ccc7`.
No converted file was written. Savings are9,703,598 bytes after all definition
and reference syntax. Logical row count/order, weeks, root names/counts, every
focus value and all timing precision survive unchanged. This is an encoding
demonstration, not qualification of a new producer or D.

Subtracting those measured redundant-focus savings from the three D scenarios
gives7,412,052 /8,139,677 /8,349,736 bytes. This supplies substantial empirical
margin while retaining the original caps; actual future recording still must
enforce them and fail on first exceeded bound.

If adopted, confine encoding to the artifact recording boundary, leaving the
entire Endurance implementation unchanged. Preflight the complete definition+
reference append together before any write, retaining16MiB compact,256KiB
individual read result,10-file,256MiB authority and1GiB directory limits. Keep
exclusive creation, first failure, final PASS write ordering and complete
inventory checks. Bound the dictionary by the existing observation byte budget;
refuse malformed/unknown/duplicate definitions or references. Record an explicit
format version in new metadata. Add no file, omitted event, rounded timing,
different read schedule or game-state transformation.

## Required source-equivalence and reference protocol amendment

The existing `loadReference` requires exact same producer identity. A new encoder
necessarily changes that identity, so the original loader must not be quietly
relaxed or old A metadata rewritten. Adoption needs an explicit reviewed new
recording/reference protocol with these gates:

1. Preserve the original f7d19d39 source bytes and completed A artifacts exactly.
   Use a separately named/pinned producer revision. Keep its own pre/post source
   and producer identities and the existing baseline/predecessor sequence.
2. Record an exact, bounded patch containing only the artifact encoder/format
   metadata and explicitly enumerated legacy-reference admission code. Reversing
   **only those listed hunks** in memory must reconstruct the original66,372-byte
   source and SHA f7d19d39 in full. Reject any unlisted change. This is a required
   future mechanical proof, not a proof already performed on unwritten code.
3. Independently require byte identity of the entire original `class Endurance`
   segment through the blank line before `function loadReference`: byte offsets
   `[13364,56657)`,43,293 bytes, SHA
   `3c356493a0515e88a75ca945d0ed2d0b0daed1a4b2414aeee811a531fc96ae8d`.
   The complete-source reconstruction additionally protects creators, initial
   endowment, caps, command policy, replay, timing/read schedule, comparison,
   stop behavior and source guards outside that class. Observer and all consumed
   project sources must match A's exact tracked/diff identities above.
4. The **only currently eligible legacy reference** is the completed A directory
   and exact metadata SHA listed above, producer f7d19d39, variant A and the
   recorded seed/source/schema. Validate its full actual inventory against its
   unchanged metadata, every file byte pin, PASS/failure-null state,6240 ticks,
  6240 attempts and all original authority/trace requirements. No arbitrary
   old producer, failed run or merely matching schema is eligible. New-format
   references retain exact same-new-producer checks. Any future original-format
   B/C eligibility needs its own closed PASS metadata/inventory pins and explicit
   reviewed registration; none is claimed here.
5. Record original reference lineage separately from the executing producer;
   never label differing producers identical. Preserve A as the original
   qualification, then run only the remaining B/C/D work in original sequence
   under the approved compatibility protocol. No rerun of completed unchanged A
   merely to reformat evidence. Keep canonical complete-save/per-root equality
   and retained0/3120/6240 literal authority comparisons unchanged.
6. Verify the lossless codec by exact reconstruction, malformed-input refusal,
   unchanged append cap behavior and final inventory/closure rules before its
   use. Do not normalize historical promise receipts or the retained953 parity
   defect. No latency/native/normal-profitability claim follows.

Until that amendment is approved, implemented, independently reviewed and
qualified, f7d19d39 remains the frozen producer and no compatibility exemption
exists. This document proposes no cap increase and claims no executed D result.
