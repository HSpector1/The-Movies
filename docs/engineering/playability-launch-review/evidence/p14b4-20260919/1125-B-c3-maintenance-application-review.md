# 1125-B — Independent application review

**KEEP: the applied candidate is exactly the source reviewed in 1123-B.** This disposition covers the intended test-file mutation and preservation audit only. Types, the two whole-file runs, and any resulting composite qualification remain separate pending evidence.

Independent read-only Git and standard-library byte analysis checked the actual application records and live files at HEAD `ddf92d8771f028e9df4ed70e2542d1b301c9fc22`:

- The tracked consumed-path list contains exactly **1,661 files** and equals both recorded before/after key sets. No consumed file is untracked or staged.
- All 1,661 live byte identities equal the recorded after inventory. Exactly the 25 manifest paths differ from the before inventory; every one matches its frozen 1123 staged file literally and its recorded candidate hash. The other **1,636 files are byte-identical** to the before inventory, including production, generated output, configuration and unrelated tests.
- The 25 recorded preimages equal the already independently checked 1123 baselines. All five guarded source-review inputs remain exact. No additional patch content, path or fixture change entered the live candidate.
- HEAD is unchanged. The actual raw Git index remains exactly 956,617 bytes / SHA256 `bc360c168a86caf21d99c7b220a7fe2c1fbf5d7847dc0ec3793cc507d3207f00`, matching both application boundaries; this identity refers to the raw index file, not `ls-files --stage` serialization.
- Actual `git diff --no-ext-diff --binary HEAD` over the consumed paths is literally the retained application patch. Its 60,506-byte identity differs from the staged unified patch because Git adds its normal index/context metadata; all live postimages are nevertheless the exact reviewed bytes.

| Retained record | Bytes | SHA256 |
| --- | ---: | --- |
| `1125-c3-maintenance-application.started.json` | 276,354 | `b3f99ca08497ffdfc3552c1a911c121f68b7468637a05a65326c2107fe369c20` |
| `1125-c3-maintenance-application.json` | 277,230 | `e27b86f1c378a8238613a987f192c644d9d39a5bc62e538b4a3e0f95e75670c4` |
| `1125-c3-maintenance-application.patch` | 60,506 | `7cecd7a5411f25c37c7cf75ebc67192abe7d32f66aab98676ed4b1dfbefbcefc` |

The records honestly describe intended source application, not a fixed-source test PASS. The source KEEP, unchanged declarations/timeouts/refusal assertions and bounded setup distinctions in frozen 1123-B still apply without a repeated behavioral audit. The declared verification remains root/UI/Bridge types with the original1052 Bridge dependency guard, then the exact 17-core-file and seven-UI-file argv arrays. Their baseline inventories are 187 and 70 cases; no future result is inferred.

Reviewer performed no application, test, compiler, project import, gameplay, production edit or index mutation. Original full-suite failures and all explicitly retained qualification limits remain unchanged by this application review.
