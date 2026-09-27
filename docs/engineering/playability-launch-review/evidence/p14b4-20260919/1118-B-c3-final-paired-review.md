# 1118-B — independent C.3 paired verification review

Status: **KEEP for all six closed paired groups and their bounded attribution; final independent review frozen.** This is the independent reviewer’s record. It does not execute project code or replace the parent’s recorder and the author’s 1118-A attribution. All six records are closed, the detailed remaining failures were independently compared, and the author’s frozen final report was read and checked. These results support proceeding to the separately planned full gates; they do not claim an all-green remaining group or final C.3 qualification.

## Source and exact selection

The published candidate is `d8552a0b7caa9a02da17320a203a923134e093b8`. Each closed prefix record reports that exact start/end HEAD, child exit 0, `fixedSource: true`, no signal/error, no untracked consumed source, and the empty-diff SHA256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`. Each corresponding source patch is empty. Independent data-only checks found all 1,661 live consumed paths byte-identical to the final postinventory already reviewed in 1115-C. The 90 maintained test paths and the 1,571 protected non-target paths therefore retain their separately reviewed identities.

Each recorded command array was compared literally against its corresponding group in `1115-application-01.argv.json` (711,176 bytes; SHA256 `992946fb791f02cddc47acd07448e724b6b5a7b3d1c75a076e5b3ea0588f7297`). This includes the complete metadata wrapper string and selector, not merely the executable or file count. The six argv groups map to 1110 B5, 1086/1052 cash, 1048 metadata, 1049 runtime, 1051 restart, and 1053 remaining61. No new selector, timeout, skip, or case-title change is inferred or authorized by this review.

## Closed prefix

All times below are recorder wall times on 2026-09-27 UTC. These groups overlap other historical selections; their counts must not be added into a purported single full-suite total.

| Record | Actual scope/result | Start → end | Wall time |
| --- | --- | --- | ---: |
| 1089 maintained B5 leaf | 1 PASS; 14 peers filtered | 08:07:50.543 → 08:08:01.157 | 10.614 s |
| 1090 maintained cash leaf | 1 PASS; 9 peers filtered | 08:08:23.740 → 08:08:27.990 | 4.250 s |
| 1091 maintained metadata | 43 PASS, 371 filtered, 414 declared; 30 files | 08:08:54.928 → 08:09:55.902 | 60.974 s |
| 1092 maintained runtime | 111 PASS; all seven selected files | 08:10:40.348 → 08:13:20.901 | 160.553 s |
| 1093 maintained process restart | 10 PASS; whole selected file | 08:14:15.836 → 08:15:36.530 | 80.694 s |

The raw logs contain no detailed FAIL blocks or unhandled-error markers for these five groups. The observed PASS counts reconcile with the selected counts, and their filtered peers remain unexecuted in those commands. The preserved test declaration/title review and exact argv establish the maintained selection; Vitest’s non-verbose output need not print every short passing leaf.

The B5 leaf now reaches all its preserved terminal, settlement, RNG, employment and first-take assertions after the independently justified three-pin update. That is an actual result of the complete selected leaf, unlike its formerly masked tail. Its expected pins derive from the valid 1062 trajectory and the separately labelled invalid 1105 counterfactual causal proof; the counterfactual itself is not admitted gameplay. The cash leaf reaches the exact old cash refusal using the independently admitted historical V11 substrate and preserves its positive and purity controls. Neither selected leaf supplies a whole-file rerun.

The 43-leaf metadata selection has the same selected scope as 1048’s 41 FAIL / 2 PASS observation; the whole runtime selection has the same scope as 1049’s 62 FAIL / 49 PASS; the whole process-restart file has the same scope as 1051’s 1 FAIL / 9 PASS. With unchanged declarations and literal argv, their now-all-PASS totals establish that those formerly failing leaves executed and passed. This is not a disappearance-only inference. It does not qualify the separate C.3 R8 Vitest case, absent from the seven runtime files, or erase its two timeout records.

| Closed artifact | Bytes | SHA256 |
| --- | ---: | --- |
| `1089-c3-maintained-b5-leaf.json` | 859 | `dabc14677ed8ef7b38541991055a45e9a23bc753ea8a546143aff9455a355fae` |
| `1089-c3-maintained-b5-leaf.txt` | 1,225 | `27691920de7fff485b796b1614fa958ce9e4700507acc3a4343ecade3aef2da8` |
| `1090-c3-maintained-cash-leaf.json` | 778 | `09a60262a4355e50c450d4fbcac35a1f50e445e6b3a9875e0a2fdc03233f9ff5` |
| `1090-c3-maintained-cash-leaf.txt` | 960 | `7c8dca5cefee71134763171653d33694bc6ba3d9aed5dc0873bd2c31d6718a63` |
| `1091-c3-maintained-metadata.json` | 2,477 | `5e64cdecc7063ef3fc946f51bd9cd44b184d88291abfbf885aad1ea7cbc660ce` |
| `1091-c3-maintained-metadata.txt` | 19,007 | `ab14c0ae124061d4415ed7c4f7801784538adcb3674e02a7cb17b127f42517f7` |
| `1092-c3-maintained-runtime.json` | 991 | `9b2e326fb40f610418c256592adeabf0b17e56f0dd7dc5e2626b38cecea854f4` |
| `1092-c3-maintained-runtime.txt` | 17,989 | `29899c362de4da7a91f758b80b4d733f33e227f5818ae8d807b8377765711145` |
| `1093-c3-maintained-process-restart.json` | 674 | `02dbf1bce1dceac20175870d877e48365d5a1ce820362a181f97468f3d0c0fdf` |
| `1093-c3-maintained-process-restart.txt` | 1,681 | `3f980a6b4e7990defbb9770e7203cd9862116ecf834a888bd5198123def00ba2` |

## Remaining-scope review — closed 1094

1094 ran from `2026-09-27T08:16:36.835Z` to `2026-09-27T08:24:10.412Z`, 453.577 recorder seconds. The exact 65-element argv (Vitest/run/project/core plus 61 files) equals both the frozen extracted group and the original 1053 command. It closed child 1 with `fixedSource: true`, unchanged d8552a0b HEAD and empty consumed diff, no signal/error or untracked source. The raw Vitest result is **58 passing files / 3 failing files; 944 PASS / 23 FAIL / 2 TODO, 969 cases**. Child 1 remains a failed test process; KEEP refers to the bounded attribution and absence of new first causes, not an all-green claim.

Independent stdlib-only parsing reproduced every one of 1053’s 266 primary-body hashes against 1088-A before comparing the current log. It parsed all 23 current unique project/file/suite/leaf identities in 15 diagnostic blocks, including three shared-header groups. Each header received the complete diagnostic in its group; no duplicate identity, missing printed frame, unhandled marker, or unassigned failure remained. The complete primary body stops before the first printed stack/source frame and trims only outer/line-trailing whitespace. No numeric values, source lines, arbitrary paths or body fragments were normalized away.

The measured identity sets are **NEW 0; CHANGED-primary 0; RETAINED-identical-primary 23; VANISHED-in-executed-scope 243**. The retained set equals exactly the 23 inherited identities in 1088-A. A separate direct parse of the original 927 full raw log yielded 58 total failures, exactly these 23 in the selected 61-file scope, with every selected primary body and first printed frame equal to 1094. The vanished set equals exactly all 243 former NEW identities in 1088-A. All 61 file summaries reconcile independently to 969 cases and the same two source-declared TODO leaves, so those 243 cases executed and passed. This is supported by actual full-file execution, unchanged case declarations, identical argv and the new 944-PASS count; disappearance alone is not the premise. The selected B5 causal-pin case is among those now-passing cases, distinct from the still-failing B5 poaching helper control.

The four distinct retained primary bodies are preserved in full in the raw log:

| Actual retained cause | Leaves | Primary SHA256 | First printed source frame |
| --- | ---: | --- | --- |
| B5 poaching helper: received 208, expected 52 | 1 | `897726ee72b1bcc23f62eb1cbfed19fbcecc39b710a1aaeded7f076300da71d5` | `tests/helpers/p14b2-fixtures.ts:198:48` |
| Cast outcome natural rival prerequisites absent within 350 ticks | 9 | `9925f2fb02a01b203367a97bdb17f50bfb13b3da2a3fd71e51364a303cbb20a1` | `tests/p14b4-cast-class-outcomes.test.ts:247:9` |
| Seating witness lacks two relevant members within 350 ticks | 12 | `6657eee1d3516dbf53a1b3fbd63e911f3352f91737d8bf493d0ef16e739fc4af` | `tests/p14b4-rival-seating-preference.test.ts:343:10` |
| Separate seating r02 met-promise control: falsy assertion displaying `expect(first.cast).toEqual(...)` | 1 | `e8c076c464696333edd1196fa2f0b8c5e07ac0c1d95f2a251593c60eca28a52e` | `tests/p14b4-rival-seating-preference.test.ts:690:12` |

All 23 first printed frames also equal 1053, measured separately from the primary hashes. The full post-header diagnostic tails, including printed stack/source material after outer trimming, match for 22 leaves. The remaining B5 tail preserves the same helper first frame but shifts its downstream caller from `tests/bridge-p14b5-relationships.test.ts:538:46` to `:540:46`. This exact line shift is retained; primary equality does not imply all stack bytes are identical. No failing downstream premise is relabelled executed merely because its setup failure is inherited.

The two source-declared TODOs remain the rival seating same-person intersection construction and the world arrival rival-employee win construction. The per-file reporter calls these two rows “skipped,” while the final test summary correctly identifies two TODOs; they are not repaired cases or newly introduced skips.

| Remaining comparison artifact | Bytes | SHA256 |
| --- | ---: | --- |
| `1094-c3-maintained-remaining.json` | 3,386 | `930d7f5bc0280e0ef97768359f2215d2a693a4019b02141e74f630b66aa064d6` |
| `1094-c3-maintained-remaining.txt` | 149,780 | `9ba742b1368769bb30c6560cbdd8610e43425d8b4ddb942a301c03e07fbf5dc1` |
| `1053-c3-remaining-boundaries-first.txt` | 13,159,523 | `21014d712acfb78fe268fa765a7178d113d234aa35d37cc76e1fdee15e0d1258` |
| `1088-A-c3-remaining-boundaries-attribution.json` | 39,673,403 | `1685a8f3205a5ad4f661392120c40792e71b33c951068817df1d1114d0f2e8ba` |

The original 1053 observation remains 701 PASS / 266 FAIL / 2 TODO across 969 cases. Its failures and masked assertions are preserved alongside this actual later result. The full 927 core and 713 UI baselines, canonical098 L1/L2 no-hire failures, R8 timeouts/standalone distinction, B2 helper controls and parser caveats remain indexed by 1113-A. Final full core/UI qualification and matched attribution remain separate from these paired gates.

## Frozen report cross-check and disposition

The author’s `1118-A-c3-final-paired-attribution.md` is 23,120 bytes, SHA256 `ba0635ee14f3002f7a8a28afa1512e22ca0d38a8f76e0984182d5c7e0e83b923`. Its six source/argv/result records, comparisons and limits agree with this independent review. Data-only checks confirmed that it contains all 23 exact printed identities and their complete primary bodies/hashes, with the downstream B5 frame difference explicitly preserved. No shortened parameter-display title was expanded or invented.

Independently reproduced SHA256 identities of `JSON.stringify(sortedIds)` are `5e98e6f8ea4a5b751c809b9462124733e78d960f676d8fb2eb83e93424427bcb` for all 243 vanished identities and `adf64dc8bc808f407e504f960492d1ba3f5ae253697fad788806f63d7f2b1772` for all 23 retained identities. These are evidence identities only, not replacement gameplay expectations.

No new or changed first cause requires an implementation change from this paired series. The recorded 23 failures, their unmet natural premises, two TODOs, canonical098 and R8 limits remain visible. Types, generated checks, full core and full UI gates require their own closed evidence and final matched attribution. No source/test edit, project execution, compiler or gameplay probe was performed by this review.
