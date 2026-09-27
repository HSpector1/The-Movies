# 1257-L — Strict-reader return typing correction

Actual1258 on published `a96d69bab49cf84b3e87e22a35aa202ba5cebc5e` closed with exit2, fixedSource:true, empty consumed diff/untracked lists and no signal/error. Start21:35:58.207Z, end21:36:31.884Z:33.677 s. Its sole diagnostic is TS2345 at `tests/p14p4p5-receipt-freeze.test.ts:363:17`: the imported save union's state is not narrowed to GameStateV40 by a Vitest identity assertion. No runtime was run. Original1258 raw/record and frozen1257 C/D/source/patch/manifest remain unchanged.

The correction retains the imported value separately and assigns `round` from the actual public `validateSaveV40` return. The identity assertion becomes `expect(round).toBe(imported)`. Import, strict validation, original-object identity, committed-root equality and exact lossless export all remain in the same order with the same number of calls. No cast, changed predicate, new semantic assertion, route, counter, case, pin or timeout is introduced.

This is staged only. Parent applies the single two-line substitution after independent1257-M, publishes, then runs1258b root compiler before1259 Q12. The compiler has not been rerun by the author. The seven-call cap and all original argv remain unchanged. Full inverse substitution recreates all25,474 original bytes exactly; all original protected/input/authority pins still match.

| Artifact | Bytes | SHA256 |
|---|---:|---|
| Original live/frozen source | 25,474 | `548cd0c48e0a30b923c20d9ab6acc962c12537ca439235cc98be197d0f37583e` |
| `1257-type-stage/tests/p14p4p5-receipt-freeze.test.ts` | 25,498 | `c1ee22dec887614a2b1489ca4c1578f670841e11fc0157a67921967674c913d3` |
| `1257-type-narrowing.patch` | 970 | `4cde95b42163d3a9dc1eb3b4978dbd3318acff08857e7865d56cc1a4d1b7b39d` |
| `1257-type-narrowing-source-manifest.json` | 10,464 | `565a01652e442be2f171836e209c9829ac1e070f80b2cd8d43ec3b57c733b34d` |
| `1258-root6-receipt7-types.txt` | 821 | `9a198b64e80f7e60b77ff100cfecd0f2f6c4222835f1b4c12f7752930e3e2758` |
| `1258-root6-receipt7-types.json` | 634 | `3ea1aa856cf1105c62ab6be8c33098c5dd71684b2dfa91b5d8e3a8b2577b88a3` |

Final corrective handback. No live/index changes or project evaluation; prior source-review KEEP is not a compiler pass. Actual corrected compilation and the entire Q12 runtime remain pending.
