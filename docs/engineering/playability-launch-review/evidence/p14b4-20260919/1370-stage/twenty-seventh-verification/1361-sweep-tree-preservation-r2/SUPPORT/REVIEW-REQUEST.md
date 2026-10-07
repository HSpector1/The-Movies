# 1361 x2/x3 tree preservation r2 — independent review request

R1 static review at `/Users/zacheryspector/studio-scratch/1370-1361-sweep-tree-preservation-static-review-r1/REPORT.md` was **REFINE**. This r2 proposal is separate from, and leaves unchanged, r1. No full bundle was built and no source tree, evidence branch, or Git state was edited for r2.

`build.py` SHA-256 `7fd06d6bd8555409d7e1bdefee3f2afce1731d8f1b4e23c8a99d21fdd04f1688`.

`verify.py` SHA-256 `078130d2a23a50d2b4153056dfabaf2a8d2bda1afd185d9bbe0faa5be747c801`.

Both parse with Python AST. Read-only source-state checks found each source at the pinned HEAD/tree, clean, with 15 absolute symlinks and 29 ignored entries. A three-entry synthetic extras tar restored a regular file and absolute symlink exactly and rejected both an existing-path conflict and symlink conflict. No production run or full bundle was executed.

## R1 issue closed in design

The builder now records all ignored file modes and the exact `.git/info/exclude` bytes/hash. It records every absolute symlink's path, target, file/directory type, and live-repository dependency; a missing or outside-repository target fails the build. The Git bundle remains a complete-history, `--all`, no-exclusion bundle split into <=48,000,000-byte segments. The ignored extras tar preserves the copied fixture, `scripts/art`, `dist`, and links without traversing targets. The manifest expressly says the archived Git history is self-contained but the live-repository symlink targets are external dependencies.

The independent verifier rejects archive path traversal, duplicate members, unknown members, conflicts with tracked checkout paths, and any member whose parent is a symlink. It validates member bytes and modes, joins the bundle, proves no prerequisites against an empty bare repository, then clones a **normal working checkout** in an isolated temporary directory. After checking refs, HEAD/tree, and `git fsck`, it restores the original Git exclude file and ignored extras without following links. It then requires ordinary Git status to be clean and compares exact ignored roots, all ignored entry types/modes/bytes, every symlink path/target, and all 15 external live-repository dependencies against the manifest. It rejects Python optimized mode so assertions cannot be disabled.

## Pins and bounded publication gate

| Unit | Private HEAD | HEAD tree | Allocated source size |
| --- | --- | --- | ---: |
| x2 | `838dce0218d5c940cdcfd57e01232fbcd1082bf0` | `0165274ffeedc3783ef215e68b773b7e8a6b5410` | 128,168 KiB |
| x3 | `ee289de67e453ce269c98d840a48799265c62993` | `d8b993bb0c078613baa07313f7845367d5e90829` | 128,152 KiB |

Independent review should inspect both scripts, especially tar path/mode handling, the restored checkout and Git exclude behavior, absolute symlink dependencies, and segment size. If accepted, build to a new scratch output directory; run verifier on staged output; publish all files and hashes to the evidence branch; retrieve by remote commit into a separate location; rerun the verifier there. Immediately before deletion, recheck each original source HEAD/tree/refs, ordinary clean status, ignored inventory, links and dependencies. Remove only the two exact `tree` directories with no symlink traversal, leaving sibling logs, patches and attribution intact. A failure at any step retains both trees.

Current free space was 4,242,900 KiB, **213,548 KiB** below the 4.25 GiB preflight. The two trees occupy 256,320 KiB, but bundle/extras storage and APFS sharing reduce actual net recovery. Measure `df` after each bounded removal; do not infer clearance from `du` alone.
