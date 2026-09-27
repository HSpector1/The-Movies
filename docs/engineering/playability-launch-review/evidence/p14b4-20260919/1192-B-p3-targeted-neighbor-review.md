# 1192-B — independent D17 and neighbor result review

Final disposition: **KEEP** the actual 1188 compiler and 1189 D17 qualification, together with the specifically passed neighbor cases. **REFINE** the ten failed neighbor expectations under separately reviewed maintenance. These results do not establish an all-green neighbor suite or the remaining P3 obligations. No observed first cause in this batch requires a production correction.

This review independently read the five closed raw logs and recorder JSON files, both preflights, the reached source assertions, and the final author attribution. Verification used source reads and standard-library byte/JSON parsing only; no compiler, test, generator or gameplay was executed. No source, test, index or prior evidence was changed.

## Closed source and execution boundary

All five records start and end at `b3061980bc8f5d128085e86dd67f31f26a310421`, with `fixedSource:true`, empty consumed diff SHA256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`, no untracked consumed source, and null signal/recorder error. The actual argv equals the separately recorded batch preflight, including `--no-file-parallelism` for the three-file 1190 run. There is no unhandled-error section in the runtime logs.

The 1188 preflight records exact remote equality and a clean whole worktree. The later batch preflight truthfully lists only the four newly written 1188 evidence files outside consumed source. These are distinct scopes; no claim of a completely empty whole worktree throughout the batch is needed.

| Record | Closed UTC interval, 2026-09-27 | Wrapper seconds | Actual result |
| --- | --- | ---: | --- |
| 1188 Bridge types | 16:29:52.994–16:30:22.879 | 29.885 | Child0, no compiler diagnostics |
| 1189 D17 only | 16:31:14.165–16:32:51.734 | 97.569 | Child0; 1 PASS, 2 filtered skips |
| 1190 three whole files | 16:32:51.927–16:33:51.403 | 59.476 | Child1; 53 PASS, 6 FAIL / 59 |
| 1191 five waiver selections | 16:33:51.577–16:34:00.038 | 8.461 | Child1; 3 PASS, 2 FAIL, 27 filtered skips |
| 1192 two classless selections | 16:34:00.210–16:34:06.899 | 6.689 | Child1; 2 FAIL, 26 filtered skips |

I independently matched all ten production/generated identities in `1179-p3-production-manifest.json`, including the unchanged generic generated fixture. The current Bridge test remains 45,878 bytes / `dbc4800046353a25d75261604e944b77c05e26c43d79ae4e856e23fb4aabf86d`; the old trust test and pure UI test retain their reviewed identities. There is no production delta behind the corrected D17 oracle.

## D17 qualification

The prior53 marker completes both genuine `208/207` and `104-after/104-before` inputs with zero advances in that compatibility phase. The passing leaf reaches all four separately corrupted inner-slot refusals, independent historical/current admission, correct migration/reset and current no-remigration. It then proves the corrected unnamed-library condition: initial SAVE retains dirty/null active ID/empty named catalogue while current and saved week52 bytes and the bound root agree.

The actual named SaveAs, two coordinator advances, branch SAVE, requireClean LOAD, storage close/restart, independent campaign slots, duplicate replay without writes, exactly one fresh factory, and final cleanup all complete. The runtime marker reports original52, branch54, one fresh factory and two coordinator advances. The final counter marker is exactly:

```json
{"reservedAdvanceCommands":9,"verifiedOneWeekAdvances":9,"actualAdvanceDispatchInvocations":9,"sessionAdvanceAttempts":7,"coordinatorAdvanceAttempts":2,"duplicateInvocations":3,"cap":12,"phases":[{"name":"captured45","complete":true},{"name":"actualAttached45","complete":true},{"name":"actualBound52","complete":true}]}
```

Thus the filtered leaf uses the planned 7+2 advances, three duplicate invocations and three completed caches; the waiver cache is not invoked. Capture45 is loaded, not regenerated. The hard12 ceiling has three unused headroom slots, not three further planned operations.

Vitest reports the leaf PASS at **92.312 seconds**, exceeding its unchanged declared60 seconds; file time92.314, Vitest total96.59 and wrapper97.569 are separate measurements. This is semantic qualification of the in-memory coordinator/store path, not an elapsed-time bound or reliability qualification. D15/D16 and the UI leaf were not rerun: their earlier passes remain separate evidence on preserved bodies. No all-three current-run, real-disk, native-consumer or App-integration claim follows.

## Ten complete neighbor first causes

There are ten distinct printed FAIL identities in ten groups, with no shared multi-header group. I parsed the complete raw groups independently and verified every author's raw-byte span, full diagnostic, primary hash and printed-frame suffix. Same primary text in separate files remains separate evidence.

| Run / first frame | Reached cause | Qualified boundary and masked remainder |
| --- | --- | --- |
| 1190 generator565:25 | F10 expects old `d59e144e…` schema identity; current generated body carries `9c5bba3f…`. | Earlier union structure checks pass. This test explicitly renders the current schema with projection53; later assertions are masked. |
| 1190 generator721:37 | F10 declaration hash differs from old `4ab41413…`. | Its two renders agree before the pin assertion. Earlier fixed loop entries pass; F11 and F12 iterations later in this combined pin loop are unreached. Separate F11/F12 structural leaves pass. A new pin must come from an independently recorded measurement, not this failure text. |
| 1190 runtime47 compatibility181:32 | Actual projection54 versus expected53. | Protocol4 passes first. Save38 and exact prior-registry expectations later in that leaf remain masked. The five other cases pass, including both genuine V29 slots and reset/no-remigration. |
| 1190 schema79:47 | Metadata projection54 versus53. | Recursive object closure passes; later metadata assertions remain masked. |
| 1190 schema340:32 | Current projection54 versus53. | Earlier missing/additional/enum/nullability/int32 controls run. The old24 refusal and subsequent missing-section/legacy-flat controls are not reached. |
| 1190 schema576:29 | Checked-in C# says projection54; expected literal53. | Checked-in JSON equality, schema ID and protocol header pass before this assertion. Later C# member assertions are masked. |
| 1191 waiver751:10 | `DIRECTING_COUNT` passes wire validation, against the former unoffered-family expectation. | P1/P2 validation checks precede it. Remaining P4/P5 loop refusals are masked. Wire acceptance is not evidence that a cross-domain waiver action was accepted. |
| 1191 waiver815:102 | Actual migrated current save39 versus expected38. | Genuine prior49 migration, prior protocol4 path and one fresh factory pass first. Saved-slot literal and final week check remain masked. |
| 1192 save10251:43 → base127 → leaf392 | `validateSaveV38: expected version 38`. | `base()` migrates to live39, performs public withdrawals, then supplies that live carrier to frozen38. The two-viewer privacy assertions never run. Preserve strict old admission; fix the actual current carrier boundary. |
| 1192 history367:65 → leaf426 | Bound P1 history has required `qualifyingRole:"cast"`, absent from the expected object. | Earlier own unbound legacy classless P2 null disclosure passes. This additive history equality stops before its schema/profile/workspace checks and before the later bound classless-P2 variant. |

The 1190 split is generator29P/2F, schema19P/3F and runtime47 compatibility5P/1F. The 1191 actual passes are the count2 P1 substitute quote, accepted same-contract waiver command, and projection-only linked/progress history. These are retained as actual successes, without turning the failed prerequisite or stale current-boundary assertions into successes.

The neighbor selections contain zero-advance source routes, but emit no dedicated tick counter. Their absence of a counter is not reported as a measured numeric gameplay total. No timeout, filter or assertion was changed for these observations.

## Complete large-output and attribution verification

Both large C# received bodies were reconstructed from every `+` blank or `+ ` line beginning at the auto-generated header, joined with LF **without adding another final LF**. The reconstruction preserves all internal blank lines:

- F10 received: 867,401 bytes / `06a8472ef045ec9ec6acccc2f8af3417631717be708af40460188c626a4dfc08`, exactly the current checked-in C# with only `ProjectionVersion = 54` replaced by the test's supplied53.
- Schema-test received: 867,401 bytes / `891b8f971dfcc474d6c083f2f0db54ff972e50ad0664b0a4e15d65e949de422a`, literally equal to the checked-in file.

This is a byte-level read of existing diagnostic data, not a generator execution or a new expected-pin source. Full primary bodies and all printed frames remain in `1192-p3-neighbor-complete-diagnostics.json` (2,002,054 bytes / `d6f06c8b6f951de7e79710e7bb1fd2c5d3344ddfda17b4906d84e9cd36d53608`). My independent parser reproduced all ten exact raw spans and that artifact's separation of primary text from full diagnostic tails, including the two approximately887KB primaries. Only its explicitly documented outer LF trimming is used; no path/line/content normalization or invented Vitest-omitted data is applied.

Final author record cross-checked: `1192-A-p3-targeted-neighbor-attribution.md`, 14,149 bytes / `fe26cf2dba5b82987780049791cb8db323a5e227d8214748e84eceb36542d9db`. Its counts, first causes, raw pins, markers and qualified limits agree with this independent review.

| Record | Raw bytes / SHA256 | JSON bytes / SHA256 |
| --- | --- | --- |
| 1188 | 347 / `dd8e3cc03dd1601910e4eb8f30b296853bf5d3b3cffbc942d08c0e74f99ffb73` | 641 / `be0c303907d26d704c13eddb96228830f87b129b02cb9ecc8a4bb65fb9f975d1` |
| 1189 | 1,899 / `aed79d25bc2e7de7fe5fb05df8fbfed1d94ed49de86e9e482df21d5788cdc664` | 704 / `327030f42a0482bbb113eb4d1b2bea63dde2a460d01d8dd61056a6d2771e0087` |
| 1190 | 1,783,239 / `21fe71972a5d4ccca9289bb1c3e09bbbe2c392c7a81278c84bafe2a9aabab423` | 799 / `65aaa8b84e0b21cf277b52d47f5c8702aa9296e1e2f5512b5f07227fe4d06d51` |
| 1191 | 4,344 / `98541f3894640f1e284a398d890580fc3afbc73cea5ed79ee8947a2a87aa06a5` | 832 / `b582cdd6a9cdf39345188a3ba5f0bce98b81e483b29e63ed300c607fb170916b` |
| 1192 | 3,733 / `b5795b9ce9dc9721bc8c5b6e24f03b5110d1c32d8c844faf020bc6cf09cc7075` | 737 / `245d0e25091e8705e9aaa6bbba1f7d67d089ba6efda4d611d282305e86926e85` |

The result supports narrow current-contract test maintenance and the separately proposed generator measurement. It authorizes no old-reader weakening, fixture rewriting, broad pin refresh or production-policy change. The original failed records, remaining rival staffing/occupancy/slack gaps, broader suites and native deferral remain explicit. This reviewer record is final and frozen; later maintenance or execution requires separate evidence.
