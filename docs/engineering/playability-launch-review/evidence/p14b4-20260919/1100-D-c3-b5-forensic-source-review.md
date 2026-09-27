# 1100-D — Independent forensic source review

**KEEP — frozen source is consistent with 1100-A/1100-B.** This is readiness for the parent's separately recorded preparation, copied-source type gate and single bounded diagnostic. No snapshot, compiler, producer or gameplay was executed by this reviewer; no diagnostic result or expected-pin change is qualified here. B/1065 remains the sole heavy process.

## Independently checked source identities

All files are under `docs/engineering/playability-launch-review/evidence/p14b4-20260919/`.

| File | Bytes | SHA256 |
|---|---:|---|
| `1100-c3-b5-forensic.ts` | 34,595 | `c5025008944e1f8ad00b679f1a2db45d466fc3f371e3f1370971db94521ca7b9` |
| `1100-c3-b5-forensic-prepare.mjs` | 6,323 | `b050b141e6121b5bdc5565e7be66e7cb16edc0d610597d3da694143053c31cec` |
| `1100-c3-b5-forensic-typecheck.mjs` | 2,807 | `e8be619e13de9f9522d183a5614c10cff5d55dbfb472b2209708721a1980fa2b` |
| `1100-c3-b5-forensic-verification.mjs` | 8,036 | `c7600e52d2d0da991ea72f681fb0fd7fd850a17724735abe78d83f5f6e552d9a` |
| `1100-c3-b5-forensic-provenance.json` | 357,587 | `c45ac0cc411df724aca1dbc603d622d2b9301a7855c5b6fef32ae6a7b877a1eb` |

Data-only independent hashing matched every one of the manifest's **1,660 source files / 112,446,454 bytes** and its seven explicitly pinned extras. The eighth extra is the manifest itself, whose actual bytes receive a separate pin during preparation; this avoids a circular self-hash. The extra set is exactly the original 1052 driver required by the observer's type import, original 654 terminal evidence, actual 1062 treatment JSON, diagnostic and three helpers, plus provenance. No personal campaign or private asset is an input.

## Isolation and intervention

Preparation requires the actual source SHA, exact tracked inventory and all byte pins before creating one exclusive temporary directory. Each copied path is confined and regular; no Git directory, checkout/reset, clone, Vite transform or hook is created. All source copies except `src/core/hollywoodTick.ts` remain identical. The sole allowed symlink resolves to the existing installed dependencies; complete inventory verification rejects other links/unlisted outputs. Source HEAD/index/diff and separately pinned extras are checked again. Failed preparation retains its directory for inspection rather than deleting it.

I independently applied the two manifest text removals **in memory only**, checked their unique locations/original offsets, generated the exact unified diff, and reversed them back to the entire original file. Original `hollywoodTick.ts` is **30,214 bytes / `55bccdc4e2a0c62c1769ebcaf9e8d72f40cbf30d86729581ecc7d7a2ae93ddbe`**. The hypothetical copy is **29,900 bytes / `056f90c91095eba0fa89905e881e8967928bf8c571da32b6414fc7e6c98a21ac`**; the exact **1,622-byte** patch is `c0aeb39e4a9dd651bb896cc6ff22ca2eeb62791f49f797884d3645c2d7d028fb`. It removes only the `productionCompanyTalentIds` import and its post-greenlight busy-set insertion/comment. The two textual sites constitute one semantic intervention. The strict validator and every other gameplay byte remain current.

The compiler runner parses the copied, unchanged Bridge configuration and adds the copied diagnostic as one root, with `noEmit` required. It checks the diagnostic, observer and original driver are present and that every resolved project file is inside the snapshot; installed dependency files may resolve only under the one shared dependency directory. It records complete-graph identity and required roots within 32 KiB rather than truncating an oversized diagnostic. It evaluates no project module and re-verifies the snapshot/host after compilation.

## Diagnostic validity boundary

The exact seed/default `tick(state)` path is capped at **416 attempts**, one variant, no actions/funding/retry. The actual 1062 treatment is read from the exact **748,010-byte / `10620ee9105e1ef2b01c31a576de4dc6a860da4ffff761187431ed9e50abad8a`** artifact, not rerun. Its complete original pins are read from the unchanged selected-seed test block. The full 654 nonterminal history remains explicitly unavailable.

Before intervention can affect work, the diagnostic requires exact accepted whole-Save38 identities at 0/208/211, initial rows, every per-week receipt/work prefix through 211 and the actual 211 occupancy. Earlier divergence stops. At 212 the whole current validator **must refuse**, and its exact named `simultaneous active assignments` person must independently hold both a production company seat and unfinished writing in the same studio with distinct work IDs. Both work items must originate at source week 211 and be absent before that week. Credited screenplay Writer is separately annotated and excluded from production occupancy. The actual treatment's 212 census must be collision-free.

Only that precise, census-backed 212 refusal permits a labelled invalid continuation. A later 416 refusal requires the same refusal class and an actual production/writing collision; other validation errors stop. A later accepted save does not undo the sticky invalid-history label. No engine exception is swallowed. Full original terminal tuples, all original hashes/counts/RNG, full current-treatment row differences and explicit treatment RNG comparison are retained for later independent causal attribution.

The final status is **FORENSIC_COLLECTED**, always `gameplayValid:false`; it is never gameplay PASS. `originalPinsRecovered` requires all original pins, and even then the status demands independent causal review. An unmatched pin leaves attribution incomplete; collection's process exit is not a waiver. Output is exclusive, at most 16 MiB, summary at most 32 KiB, with source/input guards before writing. Parent must retain the actual manifest/diff, closed compiler/diagnostic records and post-run snapshot verification. Any frozen source correction receives its own attributed review before execution.

**Result boundary:** snapshot creation, actual copied import resolution, compiler success, first refusal, all 416 calls and original-pin recovery are **unexecuted** at this review. The actual qualified current trajectory remains 1062. This source KEEP does not authorize replacing B5 expectations from error text or from recovered hashes alone.

## Frozen handback and recorder launch separation

The frozen 1100-C handback is **8,761 bytes / `6fab7857de7a1e84599d2b4b8c0d8431479f45b4d0251852ccfbfb503ea7df6b`**. Its source identities, eight-extra accounting, early identity table and outcome limitations agree with this review.

KEEP the parent's specified launcher separation: the recorder remains in the host repository for its Git guards; a recorded inline Node launcher receives the literal snapshot root/manifest SHA, uses `spawnSync` on the absolute copied `node_modules/.bin/vite-node` with `--script`, copied diagnostic and manifest arguments, sets only that child's `cwd` to the snapshot, inherits stdio and propagates process error/status. This changes neither copied source nor runtime policy and introduces no hook/transform. The exact actual launcher/arguments must be retained in the recorder. Preparation/type checking stay in the host; the final snapshot verifier and exact-byte evidence mirrors occur after child closure and before HEAD moves. This is an invocation-source assessment, not an executed launch claim.
