# 1263-H — independent release-stamp correction review

FINAL KEEP for the exact G test correction and parent-only requalification. This supersedes D's readiness assessment for the one missed release-stamp oracle; original C/D, source, plans and failed evidence remain immutable. No production change is justified. Corrected Q15 has not run.

I independently read the complete 1264/1265 records and raw output, parsed all 27 complete marker lines, compared every advance's accumulated subject suffix, checked the source owner, and cross-read final G. Execution source was `9f33653d6d177752267d7244ff03de9cfff1fea3`: root compiler PASS35.725s; Q15 FAIL1/0filtered, recorder13.578s, leaf9.115s. Both records retain fixedSource, empty consumed diff, no untracked source and null signal/error. Pre/post and cross-gate guards agree: 1,684 source files, 153 manual identities, raw index and NUL stage entries. The recorded inventory and current files were independently rehashed before correction application.

The sole failure is test322: expected film releaseTick65, actual64. `tick.ts:197` takes currentTick from the input, `:629` stores it on the film, and `:1077` returns currentTick+1. The actual final advance64→65 therefore correctly returns state65 containing film64. G changes only the expected film stamp; the attained state65, take61 and commitment64 assertions remain.

All 13 advances, five accepted public actions and seven caches completed. The player take61/event24 has the genuine stock null-project fact; the final mixed suffix contains eight facts, seven rival and one player, following the unchanged 20-receipt prefix. Every advance, including returned65, already passed strict40 admission and suffix checks. Line322's film comparison failed before assertions323 onward: final participants/concept/null-fact joins, explicit take61-prefix comparisons and repeated final admission/trace/action checks remain unexecuted. Independent agreement of their printed data does not turn those masked assertions into test passes. G and parent L retain the complete failure and chronology.

I rehashed all 59 manifest file rows and the decoded immutable Save31 input. Exact single replacement, complete inverse and unified-hunk reconstruction pass; all bytes outside `releaseTick: 65` → `releaseTick: 64` are identical. All later assertions, input pins, declarations, 60s timeout, action/advance guards and production are preserved.

| Frozen artifact | Bytes | SHA256 |
|---|---:|---|
| G handback | 11,322 | `920f02d64a9fcfb00797ee3ad60f3dcb6932e85b4b33e96e69995f9480559fd4` |
| Original live/C-stage test | 25,170 | `9222330c3734325fb934c2d98c684cb3b71eaa3611c4748c5accbeb963e6ebd3` |
| Corrected staged test | 25,170 | `060ac12b20b2cce1310d940589c2a9e886a8be0dbbbd904036fe6d5e848ebed8` |
| Correction patch | 1,140 | `91846140da9ba1f0ec75a2f881ebf08030a127740c1ee8c3d1adb8d39892dcbc` |
| Correction manifest | 13,229 | `aecf5919d946eed14862e9dab876a18084046235fe986e43f63b58bf904f7f12` |
| Failed runtime raw | 120,421 | `0f3bb6492419946b52318952f5dd0f564011a02a8fd51997a0748a1c4e8f027f` |
| All 27 original LF marker lines | 118,066 | `43a9aefbfc2cabca9cde6e612a36d2936584ee8f4117260d605fe7110288f422` |

The complete printed failure at raw bytes[119156,120236) is 1,080B / `7d3519b2cbdbab2aaa9ddf07c0ac1027df8304817ea8536a6de644fb96c1a2cc`, independently checked against G. Parent L is 29,177B / `8deae25f665d2c92a33bcbf05f04c167aa3a798a1ca3ff780551dc1702d23bfb`.

After exact application/publication, retain the manifest's 1264b root compiler cap0 and 1265b same isolated `Q15 ` command, hard13 advances/five actions/zero quotes. This requalifies the failed case without changing its route. Generated historical funding provenance, no prefix replay, and the absence of new P4/P5 outcome or full-suite qualification remain explicit. Reviewer used source/stdlib reads only and wrote only this review.
