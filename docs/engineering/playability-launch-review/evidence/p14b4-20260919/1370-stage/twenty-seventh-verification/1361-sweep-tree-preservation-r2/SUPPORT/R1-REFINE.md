# Independent static review — 1361 x2/x3 preservation r1

Decision: **REFINE before build or deletion**.

Reviewed `build.py` SHA-256 `09e5834c41c96e2541e20fcfc61a4f7769b003332ca5ace60af408c186c06ded` and `verify.py` SHA-256 `3979d6a10dfa737ab843a0b324bc36aa8e17eb4cc05fe990d268c7b82162c45b`. No bundle was built; no source or Git state was changed. Both actual source repositories were inspected read-only.

## What is sound

- Both source `main` refs match the declared tips; each has exactly the declared `main`, `base`, and `production` refs. Both are unshallow. `git fsck --full --no-reflogs --unreachable` reports no unreachable objects. The builder checks source HEAD, tree, refs, clean tracked/untracked status, symlinks, and ignored file inventory before and after the bundle.
- `git bundle create ... --all` with no exclusion should include the reachable histories of the declared refs. The verifier's empty bare repository `git bundle verify`, bundle header prerequisite check, fresh bare clone, `fsck`, and refs/head/tree comparison are the decisive runtime proof; do not assume completeness from `--all` alone.
- Ignored status currently resolves to seven roots per tree: `art`, `dist`, `docs`, `node_modules`, `scripts/art`, `tests/fixtures`, `tools`. The builder inventories 29 ignored entries and 10,148,910 regular-file bytes per tree, including ignored symlinks, without following them. `tar.add(..., dereference=False)` preserves symlink entries. Segment size limit is 48,000,000 bytes and extras size is checked against the same limit.
- The output is required to be a new directory outside `1361-sweep`. The builder does not remove source trees. The verifier reads staged files and creates only temporary verification repositories.

## Required refinement

The verifier proves that a bare Git history and an extras tar exist, but it does **not** prove that they can be combined into the original clean working tree. Before deleting either source, independently reconstruct a normal checkout from the assembled bundle in a new temporary directory, restore the extras without following links, and compare against the manifest: exact HEAD and tree; exact refs; empty ordinary porcelain status; exact ignored roots/inventory and file hashes; every symlink path/target; and file type/mode where relevant. Reject duplicate or conflicting tar paths and any tar member whose parent is a symlink. This should be in `verify.py` or in a second documented, independently reviewed restore check that runs on both staged and remote-retrieved bytes.

The 15 symlink targets in each tree are absolute paths into `/Users/zacheryspector/The-Movies-headless-program`. Their link texts are preserved, but their targets' contents are not in the extras archive. State this external dependency in the manifest/receipt and check those target paths before deletion. A restored tree on another machine or with a relocated live repo will retain the same symlink text but may have dangling links. Do not claim the whole working environment is self-contained; only the reachable Git history is.

## Publication and deletion gate

After refinement, run the builder only with unchanged exact source pins; record actual manifest and each segment/extras SHA-256. Verify the staged archive; publish files at or below 48,000,000 bytes; independently retrieve by remote commit and reverify bytes plus the full working-tree restore. Recheck source HEAD/tree/refs, clean status, ignored inventory and symlinks immediately before deleting each exact source path. Delete without traversing links, retain sibling logs/patches/root sweep, and measure actual free blocks. A failed check leaves both trees intact. The current source trees total 256,320 KiB allocated, so net free-space gain may be small after storing the bundles.
