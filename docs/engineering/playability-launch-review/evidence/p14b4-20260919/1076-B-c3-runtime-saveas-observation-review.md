# 1076-B — Independent standalone R8 review

Provisional source disposition: **KEEP, pending author freeze and final identity
check**. This review executes no gameplay, producer, compiler or test. The
standalone observation is separate evidence: original1033 and1043 Vitest R8
timeouts remain failed, even if this observation subsequently completes.

The reviewer compared the driver with all original R8 assertions in
`tests/bridge-p14c3-runtime.test.ts:250` and its request, codec and store helpers.
It retains the same public coordinator sequence and actual default limits:

1. Strictly admit the pinned genuine37 PRE207 bytes, migrate through the actual
   live path and prove the resulting whole38 state without changing it.
2. Start the actual coordinator against an isolated in-memory store, Save As
   A207, advance once and verify both actual208 profession choices.
3. Save As distinct B208 with complete matching current/saved slots and a new
   session. Replay the exact request and require the same response, zero extra
   store writes, identical durable bytes, exactly two records and unchanged A207.
4. Advance B once to209, issue the actual SAVE command, require a clean campaign
   catalogue and equal current/saved209 slots. Preserve the captured B208 record
   separately and require B209 to differ from it.
5. Load A207 with `requireClean`, preserve B209, close the actual coordinator,
   restart it against the captured durable contents, and check both exact records,
   active/saved207, distinct session authority and journal command isolation.
6. Close the restarted coordinator and confirm all input/source/producer guards
   before emitting a successful completion marker.

No direct tick, synthetic production state, replacement fixture, test helper,
retry, fallback trajectory, reduced checkpoint limit, destructive disposition
or native filesystem campaign is introduced. Each actual advance is reserved
before dispatch, with a hard maximum of two invocations and an exact two-completed
requirement for success. The injected store implements the real coordinator's
read/writeAtomic/close interface; it does not establish real-disk crash durability.

Each distinct inspected library/checkpoint string goes through the actual codec,
then an exact-byte cache avoids repeated inspection-only decoding. Production
startup/restart and transactions still run their own actual validation. Cached
decoded state is read only. The driver retains every original R8 assertion;
canonical comparison of the replay response preserves structural equality of
the JSON wire response without depending on JavaScript property order.

Phase markers distinguish coordinator operations from request/snapshot/codec
inspection. Those timings can identify where work was spent in this observation;
they establish neither the five-second Vitest requirement nor a product latency
budget. Both prior timeout results and the original case remain unchanged.

HEAD, consumed-source diff and untracked source are captured and rechecked; the
immutable corpus manifest, compressed/raw hashes and producer bytes are pinned.
Failure or cleanup/guard failure prevents the final success marker and yields
exit1. Bounded stdout includes phase status, two advance counters, boundary
digests and explicit scope limits rather than full campaign state. Early startup
guard failures also cannot produce a successful completion claim.

The reviewer suggested an additional zero-gameplay factory counter: one initial
fresh-session call, unchanged after durable restart. Source at
`bridge/runtime/runtime-coordinator.ts:308` calls that factory only when storage
is null; the actual named-library branch instead loads retained authority.
This is an extra diagnostic guard, not a substitute for retained-record checks.

Final author identity and actual parent-run results are pending below.

## Final frozen-source affirmation

Final source disposition: **KEEP for the bounded standalone observation**.
The reviewer reread the complete frozen driver and handback and independently
matched their SHA-256 identities:

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `1076-c3-runtime-saveas-observation.ts` | 18,769 | `bfd541c4e7785f960095724b309689aba9a085cc2827ac8830740525d0072806` |
| `1076-A-c3-runtime-saveas-observation-handback.md` | 3,747 | `b91c35c1129d9e5a51f545853ea72bad46e72070aafe894569f9912a03f978e7` |

The proposed factory counter is now implemented: it increments only in the
provided fresh-session factory, must equal one after actual durable restart,
and is included in the final bounded output. The assertion is evaluated before
success and does not add an operation, codec call or gameplay tick. All original
R8 requirements, two-advance reservation, actual default limits, strict input
admission, close/restart lifecycle and final drift/cleanup gates remain present.

This closes the static review only. Parent-run completion and phase observations
remain unmeasured here; the original two Vitest timeout failures are preserved.

## Recorded1050 result and bounded final disposition

The reviewer read the complete raw observation and its closure metadata, then
independently totalled the recorded phase rows without executing the driver.
The parent run started `2026-09-27T02:04:08.103Z` and closed
`02:04:36.929Z`: **28.826 seconds** including the wrapper. It exited0 with no
signal/error and `fixedSource:true`, the exact pinned `e6475aca…` HEAD, an empty
consumed-source diff and no untracked source. The producer retained its frozen
`bfd541c4…` identity and reported all source/input guards unchanged.

The final marker is `R8_ALL_ORIGINAL_ASSERTIONS_COMPLETED`, with exactly two
reserved and two completed advances, one fresh-session factory call, and null
failure, cleanupFailure and guardFailure. All31 phase rows are PASS; the final
phase array agrees exactly with the independently emitted PHASE_END rows.
The full Save As/replay/SAVE/clean-load/restart assertions therefore completed,
including both actual208 choices, exact A207/B208/B209 record distinctions,
duplicate no-write behavior and restored A207 authority isolated from B209.

| Recorded timing scope | Count | Aggregate seconds |
| --- | ---: | ---: |
| Operations | 11 | 13.623 |
| Inspections | 20 | 11.579 |
| Driver elapsed through final guards | — | 25.392 |
| Recorded wrapper | — | 28.826 |

Within operations, actual coordinator restart took3.678 seconds, the two advance
dispatches2.320 and1.989, clean Load A1.523, Save As B1.284, initial startup1.000,
SAVE B0.983 and Save As A0.844. Duplicate Save As returned in0.232 milliseconds
and the exact no-write assertion passed. These are observations from one run,
not latency guarantees or comparative performance results. In particular,
“inspection” includes actual runtime snapshot/catalogue reads as well as
evidence codec work; subtracting all11.579 seconds as test-only overhead would
be unsupported. The phase data alone does not justify a production optimization.

Default limits remained maxCheckpointBytes201326592, maxJournalEntries512 and
maxJournalBytes67108864. Cleanup closed the actual restarted coordinator. The
store was injected memory storage using real coordinator/codec operations;
neither native operation nor real-disk/crash durability was observed.

Final bounded disposition: **KEEP — standalone semantic observation passed**.
The original1033 and1043 Vitest R8 timeouts remain FAIL. The original test's
five-second limit was neither changed nor met by this separate observation;
no new full-suite, latency or endurance qualification is claimed.
