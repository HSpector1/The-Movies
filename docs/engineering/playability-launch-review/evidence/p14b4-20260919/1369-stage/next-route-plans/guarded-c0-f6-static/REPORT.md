# C0+G and F6+G source-role proposal — static assembly only

**Disposition:** two new, source-pinned scratch candidates assembled for independent review. No types, tests, simulation, runner, or heavy mode was run. Neither candidate is admitted for execution. The C0 source/kit and the tracked repository were not edited.

## Inputs and inventories

The governing causal preflight report SHA-256 is `de2e60f15fe7471f0afda235093539377e581fca1fcb5d6c2587e5629dc4d07f`; reviewed G production patch SHA-256 is `2a4ea2dc9b0fd87c211c9cf600d9691081f158fa45982ce42dcada4b703de058`. Both were rehashed before assembly. C0 starts from the frozen `1368-ledger-arms-04/C0/tree`, whose original `SOURCE-PINS.json` SHA-256 is `00d4b886c0acbeb64ebc413348427723c7b5dcf0fbbce845fceb4a149d4d3a7f`; all 197 actual regular files matched those pins before and after assembly. F6 source is extracted byte-for-byte from Git commit `2253bcb128f6c4d3593982703289b746d3fcf171`, whose `src` Git tree is `13880d9b0ba72aff5d4c5bcf5d12fe682c5de554`. Its 188 paths exactly match C0's 188 production paths. Before G, only `src/core/campaignLegacy.ts` and `src/core/save.ts` differ between C0 and F6.

Each new tree contains 197 regular files: 188 `src/` files and nine copied C0 kit files (`package.json`, `package-lock.json`, three `tests/` files, two TS configs, two Vitest configs). The original `node_modules` symlink target is preserved. Every kit byte is identical to frozen C0. Both `tests/1368-ledger-original.ts` files retain the original protected seed pins and natural 416-week horizon. These are copied source-role trees, not new versioned runners or source-qualified execution packages: the kit's embedded old arm/source bindings must be revised and independently checked in a future runner proposal before either role can run.

Candidate inventories and per-file SHA-256 manifests are `C0+G-SHA256.json` (SHA `d2a43a5a133fc8c05ce0c812fa7f9aadd6adfa90613c866ef604b5ab7c64ca2c`) and `F6+G-SHA256.json` (SHA `b2c4ae3fd872f8457e7f9fa2a5fbe87fc00fe19d15cf1d09846dd7b786547285`). Production-only manifests are `C0+G-SRC-SHA256.json` (SHA `2795baf0c76067c7dbc7a0bbac6e2645794e731533aebe4357f64021ffaf9aa2`) and `F6+G-SRC-SHA256.json` (SHA `3faf5143a279a87973f83478b2d4ee8b38f42d31522f7c9e234137bbf7f4385b`). `INVENTORY.json` (SHA `aa068d2d22b7396d8aa97ba7e387143da23d2d7497a6df204bd99fb85d909e04`) records source origins, counts, and exact changed-path lists. All candidate files were rehashed after writing against their manifests.

## Complete regular-file classification and bounded diffs

| Edge | Changed production files | Unchanged production files | Unchanged kit files | Exact patch SHA-256 |
|---|---:|---:|---:|---|
| C0 → C0+G | 1 (`hollywoodTick.ts`) | 187 | 9 | `c2bd9e788e37f21348b0e3e02532e3d9c28f64c4198b53d9c0eb2f6e150408be` |
| F6 → F6+G | 1 (`hollywoodTick.ts`) | 187 | 9 | `c2bd9e788e37f21348b0e3e02532e3d9c28f64c4198b53d9c0eb2f6e150408be` |
| C0+G → F6+G | 2 (`campaignLegacy.ts`, `save.ts`) | 186 | 9 | `7be9bbd6b99e828824679d12303e2f73bd56dc5490d72409bbbd9215e65e0a03` |

The three full unified diffs are `C0-to-C0+G.patch`, `F6-to-F6+G.patch`, and `C0+G-to-F6+G.patch`. No added/deleted/renamed regular files occur. The first two patches are byte-identical because the tick preimages are identical. The `node_modules` symlink is identical in both candidates and excluded from regular-file hashes.

G adds one `currentEmployees` terms lookup after `draftWeeks`, then returns from the existing `decide` function when `week + draftWeeks > writerTerms.endWeekExclusive`. Equality proceeds. It occurs before `weeklyCost`, reserve, package choice, and commission. It retains the plain early-return shape of C0 and F6; it does not introduce `commissionStop` in those roles. The `employees` array is itself derived from `currentEmployees(h,b.studioId)` in that function, so the lookup is over the same active employment set. The non-null assertion still deserves a static reviewer check for unusual duplicate or inconsistent employment state. No writer reselection, renewal assumption, money, save, schema, import, or output change was added.

The entire C0+G→F6+G diff has three comment edits and one executable edit. `save.ts` changes comments only. `campaignLegacy.ts` changes two comments and inserts `if (!isRow(lens)) refuse(lat, 'must be an object')` before `exactKeys` in campaign legacy validation. `isRow` requires a non-null, non-array object. The executable F6 behavior is therefore a malformed-lens validation refusal; this edge cannot be called strictly comment-only or assumed to change normal ledger play. No simulation was run to verify normal-state neutrality.

## Assumptions, stop conditions, and independent review

The static source role assumes the frozen C0 kit is the right scaffold while preserving its old pins and 416-week horizon; it does not treat that kit as a qualified C0+G/F6+G runner. The guard is interpreted as refusing a commission that would finish after the writer's current term, with work due exactly at term end allowed. This interpretation follows the reviewed G patch. There is no unresolved semantic ambiguity found in these first two insertions; any reviewer finding that the active employment lookup or boundary semantics differ is a **STOP** before new runner assembly or simulations.

Independent reviewer questions:

1. Does the four-line insertion in each exact tick preimage preserve the plain-return control flow, and is the `currentEmployees` lookup guaranteed to find the selected paid writer for all valid states?
2. Does equality at `endWeekExclusive` remain allowed, while the strict-greater case refuses before any package, cost, or commission side effect? Does creating local chooser/concept values before the guard introduce any observable state effect?
3. Is the guarded C0→F6 full-file delta accurately limited to malformed campaign-lens validation plus comments, with no changed valid-state behavior on either diagnostic seed?
4. Do the 197-file inventory, copied nine-file kit, per-file hashes, and three bounded patches exactly match the two candidate trees and immutable origins? Are the old embedded source/arm pins clearly barred from execution until a separately versioned runner and formal type gates exist?

No causal outcome, guard observation, protected digest reconciliation, or execution qualification is claimed.
