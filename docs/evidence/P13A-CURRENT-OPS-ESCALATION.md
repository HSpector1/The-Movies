# P13A — Current Ops performance escalation

Implementation is stopped for Current Ops disposition of a reproducible incremental Save/load regression. This is an implementation checkpoint and evidence return, **not a completed P13A candidate or acceptance claim**. No further optimization, native build/playtest or 32-record recovery was started after the completed comparison established the increase.

## Controlling stop rule and missing margin

`OPS-P13A-SYNCHRONIZED-SOUND-20260911-01`, Budget, explicitly includes **“material incremental save/load regression”** among the reasons to stop and return to Current Ops. Companion §7 states: **“Measured incremental P13 save or load cost exceeds the retained P12 figures in §8 by a margin Current Ops sets at activation.”** The supplied activation order does not set a numerical margin. No percentage threshold has been invented or silently treated as approved.

The measured increase is approximately 0.95 seconds per complete Save and 2.40 seconds per load at p95, with entirely disjoint observed ranges. I am escalating that reproducible increase rather than declaring it acceptable because one number is below a different historical workload's reference. Current Ops needs to disposition the measured regression and supply the operative margin before implementation resumes.

## Completed matched comparison

Both sides use actual generated week-6,240 worlds, three named records created through production Save As, the same production checkpoint-store/coordinator boundary, three warmups and 20 measured samples. Each sample resets identical encoded library bytes for its own product. The runs were sequential, with team tests, Unity, builds and native input paused. Ordinary OS page cache and normal GC remain; this is wall-clock evidence, not isolated CPU attribution or a population percentile guarantee.

| Phase | Accepted P12 p95 | P13 p95 | Increment |
| --- | ---: | ---: | ---: |
| Complete Save through durable acceptance | 6,736.149 ms | 7,683.049 ms | **+946.900 ms / +14.057%** |
| Store recovery through first ready snapshot | 13,532.035 ms | 15,935.133 ms | **+2,403.098 ms / +17.759%** |

Save medians are 6,695.293 and 7,643.207 ms; load medians are 13,456.145 and 15,874.095 ms. Save ranges are 6,655.835–6,744.941 versus 7,614.911–7,701.774 ms. Load ranges are 13,420.595–13,545.225 versus 15,853.316–15,936.137 ms. **Every P13 sample exceeds every matched accepted sample for both phases.** Both runs completed with zero errors, unchanged authoritative week/digest and inactive records, and removed owned locks.

The accepted control is exact runtime `592e926bfbf4574df94b38fc8dd594fc5df2ac8d`, not later P12 documentary HEAD. P13's measured runtime graph is `64b8a2beda3c42e13288c88b75577058d02170d4`. The emitted bundles and all input hashes remain exact. P13 ran 17:50:17–18:00:06 UTC; the uncontended accepted repeat ran 18:00:46–18:09:11 UTC on 2026-09-11. The earlier accepted run with background work remains preserved, separately qualified.

P13 Save p95 is below the retained **9,577.754 ms** reference from a different three-record week-8,794 workload. P13 load-ready p95 is above the retained **13,414.888 ms** reference. Those historical values do not negate the matched incremental increase. The probes exclude HTTP, worker startup/message transport, Unity and native input responsiveness. [The full performance report](P13A-PERFORMANCE-EVIDENCE.md) preserves every prior P12 target miss and unmeasured qualification.

Raw artifacts, relative to this TS worktree:

- `artifacts/p13a/performance/p13-final/store-report.json` and `performance-store-binding.json`.
- `artifacts/p13a/performance/p12-quiet/store-report.json` and its source binding/proof files.
- `artifacts/p13a/performance/performance-summary.json` for the computed matched differences.
- Both final generator reports, byte attribution, migration reports and source-equivalence proofs remain under `artifacts/p13a/performance/`.

The accepted final Save is 47,825,995 bytes; P13 is 48,984,542 bytes: **+1,158,547 bytes**. P13 retains 3,586 production-technology records, so this part of storage grows with film count. Migration-only p95 is **507.337 ms**, with original history, balances, contracts, identities and RNG preserved. These are bounded-horizon results. The prepared 32-record recovery has **not run**; no completion or extrapolated timing is claimed for it.

## Preserved implementation and playable evidence

| Worktree | Branch | Current runtime/source checkpoint |
| --- | --- | --- |
| `/Users/bruce/The Movies - P13A Synchronized Sound TS` | `wip/p13a-synchronized-sound-01-ts` | Tested runtime corrections and measured graph: `64b8a2beda3c42e13288c88b75577058d02170d4`. A subsequent documentation/harness checkpoint records this stop; its exact commit accompanies delivery. |
| `/Users/bruce/The Movies - P13A Synchronized Sound Unity` | `wip/p13a-synchronized-sound-01-client` | `608f719381938cc60126d31c7fc172c2b4d1dfb3`, containing explicitly uncompiled/untested follow-up corrections. |

The required Unity comparison was completed before runtime edits: accepted player source `deca39521da1baeca61898d156a43f4ae6a7e035` to later `2bc8d304b79a72bf20fda1d462ec3d96df253992` differed only in legitimate Tools changes. The later identity was the isolated implementation base. Assets, Packages and ProjectSettings were identical. Protected branches and refs were not merged or promoted.

The last actual native task used Unity `c76b27211d3cce488d70bfe3ef48b024da1b44df` and TS `c504233619b20ea81109471800f464a32fce5888`. It demonstrated Howard hiring Otto Salazar, assigning the Laboratory seat, beginning research, moving the estimate with $2,500 funding, observing $40,000 saturate at $10,000 usable funding, and advancing one real week to 1.5 verified units / $10,000 expenditure. Save and clean UI Quit succeeded. That run's stored checkpoint hash is `111a80b7bd004ea9ed23fe9ffdf273b57199fed3c1bb1e91ddee067d0d583d93`.

That observed intermediate player was built at 17:26:45 UTC. Executable SHA-256: `aee100eca3e58d15ea7a6c51390868e71d896d3031cf4b3e4608f36fedfd3a33`; Assembly-CSharp: `6671e4e2928117c1361deb41620dd75a056bb04fe4944fd56710d077a940a9ab`; observed engine: `e6852f83c26ddf973f7593eb80503b23a07820db314e387c8cd5ef9a9928b2b8`; observed worker: `802d625b9058884f26e837ca0588c9477d47db9b84c2fe3e5c8b50e36188273c`. Its original manifest honestly records TS documentation/harness dirtiness at launch. These identify the earlier played bytes, not a player for the later source checkpoint.

Separate early product critiques preserve the failed initial action path and the corrected funded task. The second remains REVISE for the observed Scientist-body/Locate and misleading status/cost/prerequisite issues. Later TS profile/copy fixes pass their focused checks. The native body and stage-status follow-ups at `608f719` have tests written but **no compilation, test run, player build or native proof**. The old player must not be represented as containing them.

## Tests, scope and remaining work

Full core passed 209 files / 2,565 tests; full UI passed 201 files / 2,684 tests with five existing skips. Later scoped checks include 22 profile/presence/expiry tests and nine Laboratory/profile tests, plus TypeScript checks. Counts overlap and retain their source chronology. Earlier native verification includes the 1,118/1,119 EditMode run followed by a passing 52-test correction group, and 7/7 virtual-gamepad PlayMode tests. These are not a green claim for the later uncompiled native checkpoint.

Implemented areas include Scientist person/employment/presence; research/access/adoption/first-filming lock; P09 Laboratory, instruments and exact stage/Post installations; P11 accounting; strict V20 migration; one commercial rival adoption; campaign calendar; closed Laboratory/global studio decisions; and native Laboratory entry. [Correctness review](P13A-CORRECTNESS-REVIEW.md), [technical matrix](P13A-TECHNICAL-ACCEPTANCE-MATRIX.md), and [evidence index](P13A-EVIDENCE-INDEX.md) give paths and proof details.

Remaining after Current Ops disposition: address or explicitly disposition the measured cost; run the prepared 32-record recovery; compile/test/build the native follow-up; verify real Scientist Locate and soundstage states at target viewports; complete the causal-Core and integrated-final product critiques; execute and validate the prepared review library/incoming-V19 native fixtures; seal the final source pair and package. Howard's L9 playtest has not been requested or manufactured. The Owner route document is preparation only, and no final runnable P13A delivery package is claimed.

Execution began about 15:56 UTC. The stop was established about 18:10 UTC, well within the 52-hour capability ceiling; the protected 28-hour reserve remains untouched. All data is generated engineering evidence. No current Owner campaign or named copy was opened, hashed, altered or used as a fixture. No gameplay/native measurement process remains running.
