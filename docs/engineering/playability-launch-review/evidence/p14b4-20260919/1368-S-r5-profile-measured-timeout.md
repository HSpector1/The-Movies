# 1368-S — r5 ledger profiling and measured timeout

The reviewed r5 profiling package ran on published coordinator HEAD `4fcb6eab0d7f60a14842293ef9e65c88241eef3c`. Package manifest SHA-256 `55c993b5f350e5133603aa13c224fa2c62d2304924ade0d075f62cb0c2a4260a`; runner SHA-256 `74ae1b3a965bd1b6034f055d714b066faf8868535d65187638d98ddeb1d5ad47`. Only the attribution probe differs from the frozen r4 ABC arm among its 197 regular arm files; all 188 production files and the original ledger test are byte-identical. The probe retains the 416-week horizon, 300-second Vitest limit, 330-second outer cap, both original seeds, seven full phase snapshots, 417 public save/migration admissions on completion, source and neutrality guards, and the original output fields. Profiling writes cumulative nested timing counters to a separate sidecar. Independent static review SHA-256 `0bdbc78724e4a1c1ee1c822678acf2f56a8b3e1ecd04a8797aba9ff40776b3a6` accepted diagnostic use only.

| Exact r5 mode | Disposition | RESULT SHA-256 |
|---|---|---|
| ABC types | PASS; actual child and recorder 0 | `fa9724bf0742ce21b284ed479ef3816a267f098d2881a29407c9f1228c5ff1f2` |
| ABC clean p13a | PASS; 416 weeks, one test, eight progress/profile rows | `64c942ae10bd4648ee2269a4453980fb0ea77f8e75e289d00874c15aae5225a6` |
| ABC observed p13a | **TIMEOUT**; last complete checkpoint week 260 | `b97e94b3c15526d43bd2895946290909c5fb6335550154b170e973b9bd79d535` |

The types and clean runs had exact fixed-source pre/postflight, matching local/explicit-origin HEAD and index, child/recorder exit 0, exact artifact hashes and verified cleanup without survivors. The clean `data.json` SHA-256 `18f1a6b913061f92a43f0ab432fff159714afadc0e781b62cadf6e923d01c108` is **byte-identical** to the admitted r4 ABC clean output on all 19 fields. The independent same-package gate review SHA-256 `90310a2a4e389a4aa2ccb21bfef46ddef58e141bce5f894eb1e9de4c8598385c` accepted one observed diagnostic after rehashing the 218 package members and all types/clean artifacts. Clean completion took 287.749 seconds at its final week-416 profile checkpoint; that time is a diagnostic observation, not a guaranteed margin or game speed claim.

The observed run consumed the exact r5 types and clean RESULT hashes. It timed out under the unchanged cap: actual Node child exit `-15` after TERM, recorder/wrapper exit `124`, `timedOut=true`, with no reporting errors. All source, HEAD/index, manual, stage and postflight guards stayed exact; cleanup verified the leader reaped and no survivors. Its five paired progress/profile rows end at week 260 (271.380 seconds). `data.json` and Vitest JSON are absent. The observed route therefore has **no 416-week completion, clean/observed parity, protected ledger reconciliation, or three-input comparator admission**. Independent observed audit SHA-256 `e7b4521bc87842711cd96add23a9fd26fd5f8f8d448c3eb352482a21aa914881` accepted the receipt only as exact incomplete timeout evidence.

At week 260 the sidecar measured the following cumulative **exclusive** time, so nested `admit`/`snap` totals are not double counted:

| Function | Clean calls / seconds | Observed calls / seconds |
|---|---:|---:|
| `snap` full-state tagged traversal | 1,648 / 105.170 | 3,516 / 209.726 |
| `admit` outside its nested `snap` calls | 261 / 50.022 | 261 / 45.065 |
| `owners` | 260 / 0.054 | 1,040 / 0.191 |
| `windowFacts` | 0 / 0 | 260 / 0.012 |
| `changedCases` | 260 / 0.005 | 520 / 0.008 |
| Checkpoint wall time | 162.601 | 271.380 |

The observed-minus-clean wall gap at week 260 is 108.779 seconds; the extra `snap` exclusive time is 104.556 seconds. This measured same-package comparison points to repeated full-state traversal as the main observed overhead within the measured functions. The other three indexed/lookup helpers together consume approximately 0.211 seconds observed through week 260, so the r5 lookup-index proposal cannot plausibly cure a timeout of this size. Unmeasured work, GC, profiler overhead and run-to-run machine variation remain outside that attribution; the earlier r4 observed run reached only week 208 at 283.946 seconds and is a distinct execution.

Scratch-only serializer exploration SHA-256 `b9acfec3b7aa2c3655b2036a849b8c0d3f7de0c0aa63f6135cb729601bee3258` found no safe measured speedup to assemble. A direct-stream implementation was byte-equal on its fixtures but slower. A fixed-length-loop implementation preserved bytes on 427 fixtures and an isolated typecheck, but its repeated benchmark was mixed and slower on the large recorded clean sample. A WeakMap shortcut skipped repeated traversal and changed bytes on a legal accessor-mutation fixture; it was rejected. A separate call-site review found only one first-week redundant traversal, not a material remedy. None of these scratch drafts is accepted as an r5 route or production change.

The seventeenth verification archive at `1368-stage/seventeenth-verification/` preserves 304 regular members, 15,300,326 logical bytes and 1,978,621 compressed bytes. Archive SHA-256 `d0ff1fdb5afcf2c9dace670b098ca708f2220f6d73d7821dbc0c2d5bcffe73a2`; manifest SHA-256 `5f71a7e0a55ebc62db54cad64746301e70eec93b28b9b8504a6790293edd1c7d`. It contains all 197 pinned regular arm files (188 production), the profile runner/package, three run leaves, 15 direct formal records, six lane files, independent reviews and exploratory optimizer evidence. Only the `node_modules` symlink and Python cache are excluded. Independent archive REVIEW SHA-256 `8ff13c436e2e1f175053596d5a0dd73faf7c7fc7534d97f30f617298fba9fb26` checked every source and tar member byte; scratch originals remain. No frozen arm, protected pin, production source, deadline, or main branch was changed. Resume by designing and independently verifying a byte-exact, full-traversal performance improvement before another 416-week observed route; do not silently extend the cap, weaken assertions or re-label this timeout as a pass.
