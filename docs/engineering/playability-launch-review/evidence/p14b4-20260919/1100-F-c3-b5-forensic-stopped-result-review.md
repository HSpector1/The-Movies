# 1100-F — Independent review of the stopped forensic observation

Disposition: **KEEP the recorded STOPPED result and its bounded attribution; no recovered-pin or gameplay qualification.** This is a data/source review of the actual 1066–1069 records, the preserved snapshot and exact mirrored result. No reviewer gameplay, project import, prepared verifier, compiler, test or source mutation was performed.

## Closed execution and artifact authority

All four recorder records identify fixed source `1f4b8429fef335e1fb25bede0b5d2c6014901ba8`, an empty consumed diff and no untracked consumed source, unchanged through closure.

| Record | Actual result | Wrapper duration |
| --- | --- | ---: |
| 1066 snapshot preparation | child 0; 1,660 source files, 1,659 unchanged, eight separate extras | 6.988s |
| 1067 copied graph typecheck | child 0; 384 roots, 724 source files, zero diagnostics; required copied paths and project confinement checked | 33.912s |
| 1068 forensic observation | child 1; STOPPED at arrived week 212, 212 attempted/completed default ticks | 9.562s |
| 1069 final host/copy verification | child 0; all fixed source, copy and extra guards passed | 1.736s |

The snapshot is preserved at `/private/var/folders/3k/tth727z52pg3xftwrl87c5rm0000gn/T/studio-c3-b5-forensic-dmxMOt`. Independent data-only hashing checked every host original and copied source against all **1,660 manifest entries**, and both copies of every one of the **eight extra files**. The exact two-site `hollywoodTick.ts` intervention remains the only source difference: 30,214-byte original `55bccdc4…` versus 29,900-byte transformed `056f90c9…`; the 1,622-byte patch is `c0aeb39e4a9dd651bb896cc6ff22ca2eeb62791f49f797884d3645c2d7d028fb`. The original host source is intact.

The mirrored **584,119-byte manifest**, SHA256 `659e49d1818a98a8e748f25a0507060ae12fc50050eb0198d859399463c7053e`, is literally equal to the snapshot manifest. The mirrored result is also literally equal to the snapshot result: **1,148,663 bytes**, SHA256 `388b1450b3047884a6ddd85c79b646d3e62805c6e186f8b1c91ed316a30ffbb7`. The copied patch equals the manifest's recorded patch text. The snapshot was neither repaired nor deleted.

## Observed first cause

The strict whole-save admissions at weeks **0, 208 and 211** succeeded, with exact byte counts and hashes equal to the independently qualified actual-current 1062 treatment. Independent JSON comparison additionally checked **every per-week receipt-append and work prefix through week 211** against 1062, not merely the two recorded prefix flags. Both recorded 208/211 prefix identities were independently reconstructed and matched.

At week 212, unchanged whole Save38 validation correctly refused the counterfactual state. The error begins with the existing fixed nested wrappers (`validateSaveV37`, then the frozen V36/V35/V34/V33/V32/V31/V30/V28/V27/V26/V25 delegation chain) and ends with:

`Hollywood save: person person-studio-efb645e3-r02-0 has simultaneous active assignments`

The diagnostic at `1100-c3-b5-forensic.ts:266` accepts only a bare, start-anchored Hollywood message. Its subsequent assertion therefore threw `exact current simultaneous-assignment law, not another validation cause` before the diagnostic could mark the refusal as an allowed forensic continuation. The recorded first failure is consequently `whole38-212`; `firstRejectedStateObserved` remains null and the 212 admission has `forensicAllowed: false`. These fields honestly record where the diagnostic stopped. The message-format failure does not establish a production-validation defect, and no frozen reader was relaxed.

Independent reconstruction from the retained productions and unfinished drafts, excluding permanent Writer credits from production occupancy, finds exactly the two recorded collisions:

| Person | Actual production seat | Simultaneous unfinished screenplay |
| --- | --- | --- |
| `person-studio-efb645e3-r02-0` | antagonist, `studio-efb645e3-r01:film:23` | Writer, r01 `script-0024` |
| `person-studio-efb645e3-r01-0` | support, `studio-efb645e3-r02:film:23` | Writer, r02 `script-0024` |

Each conflicting production starts at source week 211; each additional draft was commissioned at 211 and is due at 214. The week-211 preimage has neither collision. Comparison with actual 1062 confirms identical pre-212 occupancy and identical newly committed productions; the counterfactual alone adds those two r01/r02 drafts. The actual treatment retains its ordinary r03/r04 drafts and has no 212 collisions. Permanent production Writer credits stay separate throughout this census.

## Limits and next correction boundary

Only **212 of the planned 416 ticks** ran. `counterfactualStatus` is STOPPED, `gameplayValid` is false, `attributionStatus` is INCOMPLETE, `originalPinsRecovered` is false, and every final comparison is explicitly `finalExecuted: false` / `equal: null`. Partial final arrays and hashes are week-212 observations; even an accidentally equal partial RNG string cannot be reported as a completed week-416 comparison. None of the three held regression pins can change on this evidence.

The independently supported conclusion is narrower: removing the qualified busy-set update recreates the expected duplicate-assignment state at 212 after exact earlier agreement. Whether that intervention accounts for all three week-416 historical digest differences is still unproved.

A separately reviewed diagnostic amendment may recognize the **exact existing wrapper chain plus the unchanged terminal error**, while preserving the bare original form if explicitly contracted. It must reject arbitrary prefixes/suffixes, other validator causes and unsupported persons, and retain all independent same-company production/draft chronology checks. The original driver, snapshot, failure and mirrored result remain frozen. Such a correction is an evidence-tool matcher correction, not authority to relax gameplay validation, repeat automatically or update expected pins. The separate 1105 proposal governs any next source or execution release.
