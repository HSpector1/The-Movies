# V5 focused postflight audit

All 1,642 source/input hashes and all preflight pins match independently. Actual/selected HEAD is `5a730f42d5a66d22cba4808b5c642510c2f068bb`, with the manifest-pinned v4 plus CAST_SLOTS tuple correction and test-v2 delta. Actual child/wrapper ended normally with exit 1. No selected runner/Vitest or heavy-lane lock remained.

JSON reports one failed selected positive and two selection-skipped leaves. Duration 13,073.220 ms exceeds the unchanged 5,000 ms budget. The first cause is `continued script: native active production differs from paid greenlight`, at continuedScripts history → carriedProductionAuthority → runMarketBatch → tick:553 → test nativeLifecycle:323.

Unlike the preceding wrapped error, this stack establishes the exact test site: the first `step(committed)` of the final release/replay pair. Therefore genuine first-take completion, countdown-one hold, held save/export/import, wrong-issuer/original-source-project refusal, pre-greenlight-week refusal, both hostile caller-purity checks, release commitment and committed-cancel refusal/purity were reached. The final step did not return; the replay expression on the same line and all subsequent released-film/market/Legacy/rights/money assertions remain unreached.

Correction to the earlier v2 static review: the variable named admitted at this market call is not exclusively a pre-advance production snapshot. The coordinator traced publishOperatedAdvance feeding the zero-count release intermediate into the later batch. The observed failure is consistent with the immutable-history validator correctly rejecting that intermediate as a saved active production. The earlier pre-advance assumption is withdrawn; this audit does not approve weakening that validator. A separate narrowly scoped context-lifetime correction remains pending review.

Release the completed checkpoint freeze to the sole coordinator. No timing acceptance is claimed, and the selected failure is preserved. Reviewer performed no runtime or repository edits.
