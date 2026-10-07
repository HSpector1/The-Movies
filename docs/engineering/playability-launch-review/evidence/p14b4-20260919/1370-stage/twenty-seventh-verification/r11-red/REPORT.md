# Independent r11 RED matrix

Decision: **REFINE. Do not launch r11 TYPES_ONLY or clean leaves.** This review is confined to the frozen r11 package, its exact command template, and synthetic Python inputs. No game, TypeScript, Node, Vitest, or heavy lane ran.

## Frozen inputs

* `MANIFEST.json`: `889bee8d3065d1e46e712326b926b9972b0965bdf41311861208223eba32716a`
* `runner.py`: `7b2f6f02558fc57d97546017b2d3c09ea97db4285c559bb75a1b1f419d0cdd47`
* `outer.py`: `e5070b2509f4c43ddf4a01ef7a758ddda18dc2daf1b9156daba1d1518dc4b900`
* `kit/full-state-neutrality.test.ts`: `e00c174dbe5a1d5295acd39ec1977e261f67e2352911d9e1bcd1ff892bcfcc1d`
* exact command template: `f35fa4912e53ede553c89f14025128ef6c51d56f800b081bdc220dff697fbf0f`
* adopted operational amendment: `4c36a23e0d311fd58344a6e411e5d3c2373f6f923cfb0a84af44fdb674375b95`

## Synthetic execution and result

`/Users/zacheryspector/studio-scratch/r11-red-synthetic.py` extracts only `gzip_member_rows` and `verify_clean` from the frozen `runner.py` AST and executes them with Python's `zlib`. It creates 417 independent gzip members in a temporary directory, each with one newline-terminated JSON row numbered 0 through 416, the AG p13a role/seed and save version 45, eight expected progress weeks, a one-pass Vitest JSON, and a summary whose compressed and raw byte counts/SHA-256 match the synthetic data. It then mutates one condition at a time. This is a direct exercise of the verifier, not of the observer or game.

The verifier rejected a corrupted gzip CRC, a truncated final member, trailing junk, an extra member, a missing member, reordered first two members, wrong raw and compressed summary SHA-256 values, asserted total raw/compressed bounds, changed row role, changed row seed, changed save version, and an inconsistent elementary proof count. The member reader rejects these before or during the full 417-row pass. Static inspection confirms the 16 MiB member bound and 2 GiB running raw bound; the synthetic suite did not allocate a 2 GiB capture.

**Material gap:** The otherwise complete synthetic capture was accepted even though every row's `save.state` was `{"INVALID":"deliberately falsified"}`, `originalStateSha256` and `serializedSaveSha256` were `000...000`, and `owner` was `{"INVALID":"false"}`. These fields are never checked by `verify_clean`. The test's captured `originalState` may also be absent, and `marketReceiptCount`, `industryReceiptCount`, and `rng` are not checked there. The row's `emptyProof` counts can be falsified consistently with each other while disagreeing with the underlying state. Recomputing both summary digests after altering rows therefore makes this forged leaf pass the independent artifact verifier. The source test builds real rows when it runs, but the post-run verification does not independently establish that the stored rows still represent its state/save/owner/proof fields. The adopted amendment requires checking all original admission/proof fields.

## Required refinement

1. From each decompressed row, require the complete field set with the expected types and check `save.state` structurally equals `originalState`; `rng` equals the state's RNG; receipt counts equal actual state arrays; and `emptyProof` counts and representation shape derive from actual business/account/period objects. Reject `facilityDisposed` receipts. Reconstruct the owner projection from state and compare it to `owner`. This also catches mutually consistent but false proof counters.
2. Authenticate `originalStateSha256` against the exact JavaScript `JSON.stringify(originalState)` bytes and `serializedSaveSha256` against the exact source `exportSave(save)` bytes. Python `json.dumps` is not guaranteed byte-identical to JavaScript for all numbers, Unicode, and key handling. Use a reviewed JavaScript/TypeScript readback helper on the pinned runtime if exact recomputation cannot be proven in Python, and keep the helper under the package inventory. Do not silently substitute a different serialization.
3. Preserve existing CRC, ordered count, per-row and total bounds, dual byte/digest checks, fresh r11 types receipt, package/source/remote/runtime guards, AC/disk/log limits, wall caps, and process cleanup. Reissue the package as a new version with new hashes and independent RED/static review; keep this failed r11 design review labeled REFINE.

## Static negative matrix and limits

The exact command blocks require a static review receipt tied to manifest, runner, outer, and command SHA-256; no stale r4 types receipt occurs in them. A clean leaf's `verify_r11_types_admission` requires a fresh all-four-leaf r11 observed receipt plus matching target/outer results and exact r11 manifest hash. The runner's package inventory, Git HEAD/source-tree/clean-status/remote checks and pinned runtime guard reject drift before execution; AC and disk pre/post checks, a continuous outer disk/log/power monitor, and cleanup survivor failure logic are present. These are static assessments only: inducing remote, power, disk, runtime, log, or process failures would disturb the shared environment and was outside this independent synthetic review. The four types and clean leaves remain unrun.
