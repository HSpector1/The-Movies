# Independent F6 replay wrapper review

Reviewed wrapper SHA256: `a1988a4f690a33f3eb0a1724303481c668c34e19ce952a3e5d5dd07f56355798`.

Disposition: one narrow correction requested before approval: enforce the actual postflight process exit status. Other bounded changes look consistent with the stated recording scope.

## Required correction

The wrapper logs `$?` after running run-bounded-source-guards.py post, but does not retain or require that process status to be zero. Its later assertion `record['exitCode']==post['exitCode']==0` checks the test child twice: the guard script copies the recorder child exitCode into postflight JSON at line 66. That field is not the guard's process exit status.

Immediately capture `post_rc=$?` after the post guard command, use it in the log, and explicitly require it to equal zero after the capture post-hash check. Retain the existing fixedSource/allGuardsExact/child-exit assertions. Normally guard failures happen before postflight is written and are caught by the later read; the explicit status check also handles failures after writing and matches the requested contract directly.

## Confirmed scope

- MODE is forced to f6-replay; positional arguments refuse. The selected new stem is 1361-f6-replay-recorded; old unreachable mode branches do not expand execution scope.
- The payload contains exactly the two-leaf new consumer plus the four existing P15C files. It requests one worker with no deadline changes or retry. Test counts of 121 existing plus 2 new remain an expected inventory to verify after execution, not a measured result of this review.
- The recorder still writes exactly its JSON, patch, text, preflight JSON and postflight JSON. Capture checks only read the two named input files and append pin results to the existing scratch recorded.log; they create no sixth recorder artifact.
- Pre/post pin checks name the exact consumer paths. MANIFEST.json is pinned to `ed8bc9f4ae53694ddb88c3ca190957bfe68194c4f6affb18ef7a3d8a9e575b0a`; compressed capture to `ba6b451afe8e533157f1a6aa6ce297895309ef6c782d442c4980bdd61712a275`. Both final-file and ancestor symlinks refuse. The payload is not decompressed by the wrapper. Pin authenticity remains bound to the parent's capture/provenance evidence; I did not read fixture bytes to re-establish those hashes.
- This separate check correctly avoids extending the historical guard's manual P14-only input allowlist. Existing remote/source/disk/preflight/index/manual guards are unchanged from the supplied predecessor.
- Postflight is attempted even when the test child fails. Capture post-hash runs afterward, and child exit zero plus fixedSource/allGuardsExact are required before successful completion.

The inherited header still describes a multi-mode script, although this wrapper accepts no arguments; updating that comment would improve clarity but does not change behavior. Existing output existence checks are inherited; this review does not claim broader hardening of the original recorder.

No replay, test, Node execution, fixture payload read, source/index mutation or wrapper modification was performed. Parent reported bash syntax validation; this review used static diff, source inspection and wrapper hashing only.

## Final corrected revision

Final reviewed SHA256: `c659475a2dc0a67aecec7f1d386b2a1f5a318eb1d6a834d501360e651406141e`.

Disposition: PROCEED with the bounded recorded F6 replay wrapper. The sole required correction is resolved: post_rc is captured immediately after the guard command, logged without replacement by another command status, and explicitly required to be zero after the capture post-hash. Fixed-source, exact-guard and zero test-child assertions remain. All scope and measurement limits above still apply. This approves execution preparation, not an unperformed replay result.
