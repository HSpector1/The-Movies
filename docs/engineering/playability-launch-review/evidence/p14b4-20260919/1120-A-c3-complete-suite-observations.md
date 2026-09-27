# 1120-A — Complete C.3 core and UI observations

Both required complete suites are closed. This is an execution checkpoint,
not final C.3 qualification, an all-green claim or permission to start P3.
Their producing source is published `6e63f4c82a286dc67271cce0d53a0e586a6b523b`,
which changes only documentation/evidence after the maintained candidate
`d8552a0b7caa9a02da17320a203a923134e093b8`. Both runs used an empty consumed
diff, no untracked consumed source, and identical source at their two ends.
The parent ran them sequentially as the sole heavy executor. Both recorder
records report child1, fixedSource:true, null signal and null error.

| Record | Exact command | Actual UTC interval, 2026-09-27 | Wrapper seconds | Actual results |
| --- | --- | --- | ---: | --- |
| 1100-c3-final-core | `node_modules/.bin/vitest run --project core` | 08:30:52.885–09:41:26.460 | 4,233.575 | 399 files:365 PASS/34 FAIL; 4,685 cases:4,591 PASS/83 FAIL/11 TODO; no unhandled-error markers |
| 1101-c3-final-ui | `npm run test:ui` | 09:42:30.909–09:57:11.194 | 880.285 | 203 files:191 PASS/12 FAIL; 2,695 cases:2,651 PASS/39 FAIL/5 skipped; one unhandled error |

Vitest reports 4,231.76 seconds for core and 878.01 seconds for UI. These
are distinct from wrapper elapsed times and from aggregate collect/test times.
Raw logs and recorder patches are preserved byte for byte.

| Artifact | Bytes | SHA256 |
| --- | ---: | --- |
| 1100-c3-final-core.txt | 683,789 | `5e2e00ea5278d420b318ec0f0c1635f2cb067998acbf9ba7fa1512de54469ac6` |
| 1100-c3-final-core.json | 630 | `7161ad41323aeadf527654d41f78e107ab6c7773dedb4f8ba5fd35ae40acf0f9` |
| 1101-c3-final-ui.txt | 423,106 | `40e4eec4bceea1850c78cb31686ec8fcaf385a4dec68dc7c2c93bdcd611fb645` |
| 1101-c3-final-ui.json | 595 | `0346f4b88d67777f5e9191a42216767dec56e304a9ffec910c56ebb3da83a710` |

Both `.patch` artifacts are empty (SHA256
`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`).
The parent inspected actual closed JSON fields and complete raw summaries.

## Attribution and necessary work

The author and reviewer independently reconcile the closed core against927:
53 retained identical complete primaries, two changed, 28 new and three
vanished. One changed primary is the narrowly recorded scenery exporter
temporary-output suffix. The other is the campaign-library legacy-carrier
age/provenance refusal, replacing its former timeout. Three new identities
are the already recorded canonical L1/L2 premise and R8 timeout. The other25
are newly exposed fixture/version-boundary failures; they are not inherited
failures and do not establish25 new production defects. Full exact identities,
primary bodies, frames and tails belong to1119-A/B and the comparison companion.

At this checkpoint UI attribution is still being completed independently
against713/719. Its one actual unhandled error is
`TypeError: viewRef.current?.hollywoodPerformance is not a function`, with
the printed timer frame in StudioLotScreen.tsx:4854 and origin reported as
StudioLotIdentityReview.test.tsx. Its presence and any match with old evidence
remain separate from the39 failing cases. Counts alone do not establish causes.

The test author owns a separate1123 maintenance candidate for newly exposed
fixture boundaries; the reviewer independently owns its source disposition.
No live correction has been applied or executed at this checkpoint. Preserve
strict current and frozen save admission, entrant and retained-evaluation
authority, original intended assertions, declarations and timeouts. The
reviewed-in-principle alumni remedy may add exactly one actual155→156 tick
for its separately labelled synthetic branch; its natural result must remain
independent of that mutant. Actual staged source review is still required.

After exact attribution, publish this recoverable evidence checkpoint before
applying reviewed repairs. Verify repaired whole files and affected helper
consumers, preserving these original full observations. A test-only composite
must name its actual final source and constituent runs; it must never be
described as another full suite or an all-green run. Any production change
needs its own evidence, independent review and appropriate verification.

The earlier paired gates1118 and five type/generator checks1119-C remain
their actual separate passing/bounded records. Do not repeat endurance or
the complete suites without an actual new verification need. All canonical
Writer, R8, FU1/FU2, mixed-source endurance, native and Owner-acceptance limits
remain. Final C.3 qualification and published1117 outgoing preservation must
precede P3 implementation. P15's three presentation choices are resolved
in1122-A and must not be asked again.
