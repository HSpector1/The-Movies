# Explicit pre-recovery admission: old-era period boundary

Scratch-only test proposal and production-seam recommendation. No source, index or HEAD changes; no Node, tests, typecheck, fixture payload access/scans or nested agents. Published source remains `2eaa697effc38538c37da28b486786ce267a2284`. Existing drafts and historical inputs are preserved unchanged. The recorded UI/verification lane is not touched.

Inspected the fixed Part B commitments proposal (`production.patch` SHA `b4303c5670ccf3ad289102a7b3f6f949af6f84782290b888e2b8e08c6fb0642e`), combined shape proposal (`de39b307c6d66521f22c615fed0845ba2a2faa7e001a9c46d36b924d695ed048`), their handbacks, current `rivalResearch.ts`, `hollywood.ts`, own-era validation source and authorized `tests/p13b-s8-save-v27.test.ts`. Narrow `git show` inspection established archived `ce6945d58257f70c1b222a8c00e06038db73f6e4` has the actual V26 writer/reader and original tick.

## Finding

The new `'pre-recovery'` admission argument only bypasses the live cutting guard. Both modes still call `admitFor`, which books real plan cost through `moveRivalMoney`. On a different year from the last period's `fromWeek`, that money owner constructs a new period with current `RIVAL_MONEY_KINDS`.

That leaks **two** later keys into V27: `termination` already added by Save41, and `facilityDemolitionRefund` from the proposed Save46 shape. The issue is not fixed by removing only the new refund key. Public V27's own money roster contains neither. An existing-period admission changes the existing `researchCapacity` entry without rebuilding its roster, which explains why the named week309/793/795 old controls do not exercise this boundary.

This is a source-grounded latent compatibility problem, not a measured failure. No claim is made that every proposed control remains affordable or that the required historical capture already exists.

## Proposed additive REDs

`old-era-period-red.patch` adds only `tests/p13b-s8-old-era-period.test.ts`.

1. A same-period positive control reads only the already named `legacy-v26-sound-mid-deployment-309.json.gz`, verifies its existing raw SHA `11ef05be4131d3d3c4a19484f31e79cb50fa1936868f96ace7d0d18ea86e2d72`, admits public26, performs actual migration to27, admits public27, then invokes actual `admitRivalPlans(..., 'pre-recovery')`. It requires real paid started laboratory plans and matching commitment receipts, exact debit, old period count/key roster, input immutability and a valid public27 output/codec roundtrip. It strengthens control admission without altering the original test/input.
2. The year-boundary leaf consumes a separately hash-bound genuine V26 week312 capture. It takes the same public26→27 path and actual admission, requiring each charged owner to have a previous-year period before the call. The real charge must append exactly one period at312, preserve every earlier period byte-for-byte in canonical comparison, debit exactly the actual admitted plan costs, and keep the exact 14-key V27 roster. Both later keys and cost-cutting remain absent. Public27 validation and export/import must pass afterward. No period, cash, receipt, plan or clock is manufactured by the test.

All controls validate first. Missing capture/environment is a prerequisite failure. A route that has no affordable real plan or does not carry the required previous-year account fails `UNMET VALID PREMISE`, not the intended new-period RED. The actual key roster assertion is the target: the uncorrected live period constructor should leak the later keys when this genuine boundary premise holds. That outcome must be measured, not assumed.

## Missing genuine boundary capture: bounded method only

No payload was inspected and no existing authorized week312 capture has been established. This package does **not** include or claim a completed capture producer. Before executing the second leaf, parent must separately prepare/review a bounded archived-source producer using the established archive runner pattern:

- Generating engine: immutable full source from `ce6945d58257f70c1b222a8c00e06038db73f6e4`, with every archived source file checked against that commit's blob and independently recorded archive digest. Do not substitute current tick or label current HEAD as the historical generating HEAD. Record current producer/validation HEAD separately.
- Sole input: `tests/fixtures/p13b/legacy-v26-sound-mid-deployment-309.json.gz`, raw SHA above. Record its actual gzip hash and the exact existing provenance-file hash separately when authorized. No fixture directory discovery or other payloads.
- Validate the input with archived public26 and unchanged current public26. Run **exactly three** original `tick(state)` calls, from309 to312, validating the actual archived writer output at each boundary. No develop override, state repair, cash adjustment, roster manipulation, root stripping or skipped week. The old engine does not have rival research; do not pretend it can produce a V27 rival plan. The later explicit V27 staging boundary owns that real admission in the test.
- Serialize at312 through the archived `makeSave`/`exportSave`, admit it with both public26 readers, and verify the original state stayed unchanged. Require the bound/period premise and real potential admission only through the subsequently reviewed staging test; do not forge affordability if it is absent.
- Proposed exclusive output named before mint: `/Users/zacheryspector/studio-scratch/1363-old-era-period-capture-01`. Payload: `genuine-v26-sound-mid-deployment-week312.json.gz`, plus `MANIFEST.json` and `RESULT.json`. Reject any existing output, including dangling symlink, and preserve failures. This name is preparation, not approval or evidence of minting.
- Manifest format required by the consumer: `1363-old-era-period-capture/v1`; `generatingHead` is the archived SHA; `producerSha256`; `archivedSourceFilesSha256`; `sourceSaveVersion:26`; `startWeek:309`; `ticks:3`; `week:312`; `inputRawSha256`; and `capture:{name,gzipSha256,rawSha256}`. The producer should additionally record actual input/provenance hashes, original archive and current validation identities, source/index pre/post guards, route, versions, output bytes and elapsed time. Externally pin manifest, producer, archive digest and output gzip hashes; a self-consistent manifest alone is insufficient.
- Exact execution failure is distinct from an absent route premise. Three ticks is the bound; no extended search is implied. No runnable archive producer or execution is authorized by this test-only handback.

The second leaf requires `P1363_OLD_PERIOD_CAPTURE_ROOT`, `P1363_OLD_PERIOD_MANIFEST_SHA256`, `P1363_OLD_PERIOD_CAPTURE_SHA256`, `P1363_OLD_PERIOD_PRODUCER_SHA256` and `P1363_OLD_PERIOD_ARCHIVE_SHA256`. Values must come from reviewed generation and independent recorded hashes, not invented placeholders committed as facts.

## Recommended minimal production seam

Keep the existing money owner as the only place that changes cash, opening/closing totals and movement values. Give its period-construction path an explicit finance policy supplied by the caller, with the current live policy as the default. Thread a narrowly named frozen **V27** policy from the explicitly historical admission boundary through `admitFor` to that owner; only new periods need its roster. The frozen roster includes all V27 research kinds but excludes both later keys. Keep live `admitRivalPlansInWeek` and actual Save46 calls on the live policy with mandatory cutting checks. Do not change sign/refund/termination validation or globally shrink `RIVAL_MONEY_KINDS`.

The current label `'pre-recovery'` by itself does not distinguish V27 from V41–45. The presently authorized save-bearing staging route is explicit V27; document that contract or refine the parameter to name27. If a different historical finance era is later needed, enumerate that admitted caller and its actual roster rather than inferring era from missing fields. A typed policy/period-factory parameter is a local design choice; the exact public signature remains the parent's decision. Tests here use the already proposed `'pre-recovery'` label so existing draft interfaces remain unchanged during review.

Do not strip generated fields from all output accounts after booking, copy live periods under an older envelope, or infer live permissiveness from missing costCutting. A correctly selected historical period constructor prevents the wrong fields from existing in the first place, while existing valid periods retain their exact original facts.

One existing smoke leaf in `p13b-s8-save-v27.test.ts` passes a genuine V26 state directly to `admitRivalPlans` and only checks that a result exists. That leaf does not establish a valid post-admission V26 or V27 save. The new positive control explicitly lifts first; it does not repair or silently reinterpret the old leaf. Parent must account for that smoke caller when formalizing the narrow historical boundary, preserving its declared purpose or explicitly reviewing an input migration. The other staged receipt leaf already lifts to27. The unlanded 1367 own-era addition also lifts to27 and must retain its reviewed valid control.

Remaining gates: parent review, independent test review, separately reviewed capture producer and real archived mint, typecheck and intended RED measurement, then the parent's minimal coherent implementation and GREENs with live-period/scheduled-entry/old-reader fallout. None of those results is claimed here.
