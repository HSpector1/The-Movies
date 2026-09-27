# 1257-M — Independent strict-reader return correction review

KEEP the exact staged L correction for parent application/publication and 1258b compilation before 1259. No project code, compiler, test or gameplay was executed by this reviewer; no live source or index was changed. Frozen C/D and the failed 1258 record remain intact. D's source review missed this type-flow issue and did not establish compiler success.

I read the complete 1258 raw and record. On `a96d69bab49cf84b3e87e22a35aa202ba5cebc5e`, the root compiler closed exit2 at21:36:31.884Z after starting21:35:58.207Z,33.677 seconds, with fixedSource:true, empty consumed diff/untracked lists and null signal/error. Its sole diagnostic is TS2345 at new test363:17: `importSave` returns a historical/current union; a Vitest identity assertion does not narrow `round.state` to GameStateV40. No runtime result or production defect follows.

Raw821B SHA256 `9a198b64e80f7e60b77ff100cfecd0f2f6c4222835f1b4c12f7752930e3e2758`; record634B `3ea1aa856cf1105c62ab6be8c33098c5dd71684b2dfa91b5d8e3a8b2577b88a3`. Preflight/postflight agree on HEAD,1682-file source inventory, all120 manual entries, raw index and NUL stage entries. All120 manual files and supplied decoded-input identities were independently reread and matched.

| Corrective artifact | Bytes | SHA256 |
|---|---:|---|
| `1257-L-type-narrowing-handback.md` | 2,319 | `8c5bf64f36cb27332346c0709fc81ce2044a19c859c814313611f4a54df1d226` |
| `1257-type-stage/tests/p14p4p5-receipt-freeze.test.ts` | 25,498 | `c1ee22dec887614a2b1489ca4c1578f670841e11fc0157a67921967674c913d3` |
| `1257-type-narrowing.patch` | 970 | `4cde95b42163d3a9dc1eb3b4978dbd3318acff08857e7865d56cc1a4d1b7b39d` |
| `1257-type-narrowing-source-manifest.json` | 10,464 | `565a01652e442be2f171836e209c9829ac1e070f80b2cd8d43ec3b57c733b34d` |

All45 manifest identities match. Independent complete substitution, inverse and unified-patch reconstruction prove exactly the two changed lines and reproduce the original25,474B/`548cd0c48e0a30b923c20d9ab6acc962c12537ca439235cc98be197d0f37583e` source. The live target still had that original identity at review.

The correction names the imported union `imported`, assigns `round` from the actual `validateSaveV40(imported)` return, and retains `expect(round).toBe(imported)`. The public validator returns SaveFileV40. There is still one import, one strict validation, the same original-object identity assertion, the same committed-root equality and exact export comparison in the same order. No cast, assertion relaxation, extra validation, changed observer, tick, action, quote, counter, selector, timeout or input is introduced.

No corrective source blocker remains. Seven advances remain the prospective runtime cap; compiler/runtime qualification is pending. This review supersedes the original source's type-readiness only at these two lines and makes no gameplay or stored-receipt claim. Final review without a later appendix.
