# 1299-A — Finite legacy save-compatibility regression proposal

Recommend the parent's option **(b)**: independently review one literal/title correction in the existing Save30 compatibility file, then run its complete **36 cases once, zero filtered, zero engine advances and zero public actions**. This is a proposal, not source or execution release. The separate Bridge waiver candidate is deferred below. No new test, fixture, helper, producer or gameplay route is needed.

Preparation began at `a30f86f2fead8b3f7d9e6b9e3e9cfd5bd10ce323`; the current documentation checkpoint is `ea46f8b873cf74ed4922d70ae6ac71bc71a13db6`. Only scoped source/evidence and the parent's subsequently authorized exact nineteen P14 input files were read. No project import, compiler, test, simulator, Git/index mutation or broad fixture inventory ran.

## Concrete correction and new regression value

`tests/p14b4-save-v30-compatibility.test.ts` is 25,277 bytes / `9da53d5d64e9015d9dca158c112232e8229872b98d39d1ce9d55b7ddb028e48a`. Its first leaf still says literal37 in its title and asserts `expect(LIVE_SAVE_VERSION).toBe(38)`. The actual declaration in `src/core/save.ts:6538` is literal40. Proposed later staged delta, only after A/B adoption:

- Replace that leaf's title with `pins LIVE_SAVE_VERSION to literal40 independently of the value under test`.
- Replace its single `toBe(38)` with `toBe(40)`.

This is a source-proven stale metadata correction, **not an observed runtime failure**. Do not run all36 just to rediscover this constant mismatch, filter the guard out to obtain green, replace the assertion with the imported value, or alter any other expectation. Preserve the original title in the later handback's old→new mapping and prove the complete two-line inverse. Every frozen29/30/38 reader, original digest pin, synthetic-input label, downgrade refusal, purity check and timeout remains exact.

The file's independent `preservesExactly` oracle was updated in1235 for the current migration: strict old29 first, literal29→30 preservation, exact roots/receipts/takes/market and independent count-only digest tuples, then real live migration with the separately derived additive fields and `firstTakeSubjects = {version:1, cutoverOrdinal: old.firstTakes.length, facts:[]}`. It independently admits an expected38 envelope and genuinely migrates that before calling the current writer. The older30→29 lossless downgrade is still asserted; this file does not claim a new40→39 semantic-loss control.

That is material regression value after P4/P5: old classless `PREFERRED_GENRE_OPPORTUNITY` and `SPECIFIC_PROJECT` rows, including genuine underlying open/terminal backing, must remain classless count contracts and retain their original receipts. Arbitrary positive root/receipt numbers must not infer a modern genre/project predicate, seat class or historical subject. The supplied altered-family/version examples are explicitly reader-admitted synthetic variants, not historically authored P4/P5 offers. Tagged P2 shape remains admissible only at its proper boundary, with full old-reader and downgrade refusals.

## Exact collection, counts and costs

After reviewed source application/publication, the sole runtime command proposed is:

```sh
node_modules/.bin/vitest run --project core --no-file-parallelism tests/p14b4-save-v30-compatibility.test.ts
```

| Existing group | Expanded cases |
| --- | ---: |
| Live literal guard + nine genuine corpus migration/downgrade cases | 10 |
| Five count-only CURRENT family variants + five OPEN/SATISFIED/BROKEN family variants + shared-take and actual-support controls | 12 |
| Frozen29 class/tag/nonpositive-version rejection controls | 4 |
| Two explicit P2 classes + four inapplicable families + four malformed P2 shapes | 10 |
| **Total** | **36** |

All cases use pure reader/migration/digest operations on detached historical inputs. **Unique new routes0, advance calls0, action calls0, quote calls0.** These are static call-route bounds, not an instrumented runtime counter. No `tick`, `advanceTo`, `applyActions`, BridgeSession or generated-world helper is imported or invoked by this file. No setup prefix is replayed. The complete success path invokes the existing `preservesExactly` helper56 times (9 genuine +30 current-family/version pairs +15 backed family/status pairs +2 shared/support controls); stop-at-first-failure effects inside a leaf must be attributed honestly.

Direct runtime imports are Node assert/crypto/fs/zlib, Vitest, `math`, `promises`, `save` and `aging`; `types` is type-only. No test or fixture helper import is present. The selected core workspace has no setup-file hook; the UI setup belongs to the unselected UI project. The file's only `beforeAll` checks literal pin syntax and existence of the nineteen declared files. It does not open their contents. `fixture(name)` lazily reads one gzip, its provenance and the common manifest, hashes/decompresses it, proves strict29 admission and raw roundtrip, then caches; all nine names are reached in the full selection. Repeated cases clone the cache. This test neither reads nor executes producer filenames recorded inside provenance.

No explicit timeout is declared in this file; keep its existing default and both Vitest configs unchanged. Historical1100 printed36 tests in119,430ms for this file. That old elapsed time is a planning warning that a zero-advance reader suite can be slow, not a current duration prediction or deadline-compliance claim. Do not raise timeouts, repeat the run, or weaken assertions if another stale premise or semantic failure appears. No extra compiler is necessary merely to infer the two literal/title edits are type-safe; parent can use the already closed root compiler plus exact unchanged-source relation, and owns any further gate decision.

## Authorized input scope and provenance

The parent explicitly authorized bounded content reads/pinning of exactly the nine pairs below and their common `MANIFEST.json` after checking its generated origin. Prefix: `tests/fixtures/p14/genuine-v29-pre-p2/`. For each basename `genuine-v29-<name>`, the only pair is `.json.gz` and `.provenance.json`; the manifest is the nineteenth file. No sibling payload is included.

The complete manifest is39,934 bytes / `77fa32dabb635f4fc839328ac47b07a008b8d26953cff61cf10d1a3dbbb8c1d1`. It and each provenance explicitly say `generated test campaigns only; never Owner saves`, with tested source `89b5ad2cfc6947ea07fb043ef5b23eba38d7dbde`, published/observed `c06db6eae2a1350317c018c6f108d115dcba7b19`, Save29/rules3/protocol4/projection46 and schema `sha256:584bdd8565030f049d548b1af4fcbf8c517ca7c9150016736f632f1ef8fcb98c`.

Stdlib-only reads independently matched all nine manifest/provenance rows, their full authority/observed HEAD, compressed/decoded sizes and hashes, actual version/week/seed, and every focused root's original receipt. The compressed/decoded hashes also match the existing test's literals. This is data inspection, not an execution of any project validator. Historical player routes disclose the explicit funding helper with matching ledger; rival inputs disclose the historical generated rival route/search. These facts describe old creation; neither funding nor those producers/searches are proposed now. The test preserves exact original bytes before lawful migration and labels every later synthetic variation.

| Name | Actual week | Roots / takes | Gzip bytes / SHA256 | Decoded bytes / SHA256 |
| --- | ---: | --- | --- | --- |
| `empty` | 0 | 0 / 0 | 47,265 / `93c925eb5bf5027b963bb8d5222497d7b1325979be0830ea1d4ee41fecf6ab8d` | 383,776 / `2ca7733a9e7d60f13c0fc46d3646e6bb4711962d394523684717a5503afaea6a` |
| `current-p1` | 45 | 2 / 20 | 82,610 / `4947c31baa8cf9b948edd3a75b246df56c6d924e6d624ef1e18591d977f4cca7` | 675,654 / `03017370f16d9d2cf211f5653650a6d41452f73f0e8b96bb4aa154a6a946f4ca` |
| `replaced-p1` | 45 | 3 / 20 | 82,642 / `bfd215039345d8ce223283f1f21e8d16f61113bb0a583bae194c6fa7067263ad` | 676,287 / `7d5dba1e1dcf78c361c42ccfe5637578a33e64e943662a6e201d699656eb9950` |
| `withdrawn-p1` | 45 | 3 / 20 | 82,599 / `4b0d27c32d231b2815853343fe56e8282f9f0b766e9dc41d871f3652c60206ca` | 676,034 / `95a01ac1e86772fc7e0e338fdc167261a244fb09e2b15d8c73e8ba4cd7a0bae7` |
| `bound-open-p1` | 52 | 2 / 20 | 88,103 / `48ec1b4474c2d808cae8d689dde74b8695fa5a95f2b51499a384a189e7fb880e` | 729,829 / `9d1a1ea177f021477fbd73d401e76bbb4a0448a680253082a100c1e5246862d9` |
| `kept-and-broken-p1` | 61 | 2 / 25 | 95,800 / `5ad270aafe913186d0570c3e876f7d76d0108ec73a600c1e9e6c8036c5851654` | 796,283 / `d4ddc01941f4a814cf992ad101a3a03b0b64aaa0043953d2108fa234a0475c4c` |
| `rival-current-p1` | 196 | 48 / 45 | 122,731 / `560f645e0575a031d8a8e4b4320b968fdc2c25c264c05511f0d7cfe9494570d9` | 1,132,766 / `4902a1b2151529336091ffa30c488f2b6f2ecd818add1596eb8f37fbc81cb555` |
| `rival-shared-take-terminal-p1` | 213 | 48 / 46 | 122,548 / `c4065d9c150c7741adb0901625fae787fc6fdd2804daad4803e777df9ed0fa46` | 1,131,090 / `51cb83b5a9cbbc8aa08fdd1e66a269d2e57ff77a98e88d08e134f5d6a16d7918` |
| `refused-p2-count-only-current-draft` | 45 | 3 / 20 | 82,741 / `dedd68ed7a975d362838dbbbc5b32016181052a62d3b82a33dea3d95a63d5497` | 676,337 / `7f7529cb05ab29d2b27bb2855448d2b72e69b5b222b6b351698da0ec7632a253` |

| Exact paired provenance basename | Bytes | SHA256 |
| --- | ---: | --- |
| `genuine-v29-empty.provenance.json` | 4,290 | `6ab685f8b59f6b8a61f3970c9e98a96bf90685c56d948d50c95d5315d4629588` |
| `genuine-v29-current-p1.provenance.json` | 4,956 | `8d971552112afe2c7e02501593b4fca03cd5d72be9d0b021bda20cbb175a0d89` |
| `genuine-v29-replaced-p1.provenance.json` | 6,015 | `67b0c4f3e228e8b26818ca22363040debe8a970d6921e57614869374247ee19e` |
| `genuine-v29-withdrawn-p1.provenance.json` | 6,476 | `fdb410af8e8510cfa61b09eaab5671a52813e1bdcf02a3bb0077c471dd7d61b0` |
| `genuine-v29-bound-open-p1.provenance.json` | 5,495 | `18e72f4320a52739624675ca930348a4e575dafb3f565534fb7e1631de42c781` |
| `genuine-v29-kept-and-broken-p1.provenance.json` | 5,624 | `4c80c68eef0f5f007663f62eb79dbfc891912931044b3901e0f51338f689a9a5` |
| `genuine-v29-rival-current-p1.provenance.json` | 24,691 | `7937653154e52a26ecbcd23fef2b9d171d7fb3ea08b7060827df875bf0a49640` |
| `genuine-v29-rival-shared-take-terminal-p1.provenance.json` | 6,273 | `b032a11a2066c286e105e2d19d72420d6628b956a1a2e218bbbf2bb16b5a1444` |
| `genuine-v29-refused-p2-count-only-current-draft.provenance.json` | 5,239 | `f1dbd042b5ddb4b59880c2d80987aff464a335a773c297bea69a99e1e751ad87` |

## Prior source relationship and bounded verification

The exact1100 record names `6e63f4c82a286dc67271cce0d53a0e586a6b523b`; its full core command exited1 overall, although the compatibility-file line separately reports36 passing cases. That source predates P4/P5 and the later1235 test migration-oracle correction. This proposal does not repeat or adopt the old unfiltered command, extend its overall status to PASS, or reuse its broad access assertions.

1199 and1201 at `972836d552864c926cf1a8848e6234519ecbd0e6` did **not** select this save-compatibility file: they selected schema/generator/runtime metadata and the separate Bridge cast-class file. On that source this test was24,990 bytes / `a4bf17af5e8da91355ab45520a31c0a235db08dc939aa9ff247f1f7181da76a7`. The current25,277-byte file equals its1235 integrated image at `2c9b67fc39ca2598f55eecdb640c53e75a668b64` and the later `4d1fdec8ad8b73e7db01281bef5ed84147d3c63c` image exactly. 1233b compiled the integrated root successfully; that compiler result is not runtime evidence for the56 preservation paths. The current1294b root PASS is likewise type evidence only. I found a concrete changed implementation/test-oracle relation, not a reason to rerun a presently qualified same-source runtime.

The staged correction handback should include an explicit manifest with these19 files/nine decoded identities, the complete test pre/postimage, directly relevant source/config pins, A/B/adoption and the reviewed bounded guard policy/helpers. Parent must freeze that manifest before any run; if its existing main manual list cannot be extended without changing frozen artifacts, use a separately reviewed exclusive companion tied to the same actual source/command/raw and both closed bounded guards. **Do not repurpose or amend1297's frozen companion**, whose exact allowlist and command belong only to1298.

Automatic reads/diffs continue excluding `tests/fixtures/`, `ui/e2e/` and `ui/public/`; only these newly authorized exact P14 files are separate manual inputs. Preserve1296-B/C and the six collection exclusions. Supply this one filename before collection, rather than selecting an unfiltered suite and relying on a name regex. A completed bounded post and actual child result are both necessary; scoped guard equality is not an unrestricted inventory claim. Retain complete first failures and masked checks. No full core/Bridge/UI, Owner/native, gameplay, new material offer, fulfillment or rival-policy result follows from this file.

## Deferred alternatives, not part of this gate

The existing `bridge-p14b8-waiver-surface.test.ts` can later supply five independent leaves without advances: both group2 insufficient-count/no-intent controls and group7(a/b/d) replay-intent, stale-revision and replay-command guards. An exact candidate selector is `P14B\.8 group2 —|a replayed intentId after an accepted command|a stale expectedStateRevision is refused|a replayed commandId returns the FIRST response`:5 selected/27 filtered. Its source accounts five quote requests and six command attempts, including two actual waiver commits on separate clones if their acceptance prerequisites succeed. It lazily loads only the generated V32 owes-two input and genuinely migrates it; other fixture loaders are not invoked by these selected routes. Its fixed contract/history can test old count2 obligations through the new shared material-waiver/Bridge55 surfaces, while excluding group7(c)'s unrelated construction.

1200's earlier5-case PASS selected different metadata/schema leaves, so it does not qualify these five. This candidate needs its own explicit V32 input/provenance review and manual pins before release; no such payload was opened under this plan. It is deferred to keep1299 focused on the current version/history compatibility gap. Existing reservation/cast-capacity files use45+ generated prefixes; the detached capacity kernel has no identified new change to justify repetition. Older waiver-oracle helpers also stop at historical carriers before casting to current, so they need their own source-boundary assessment instead of blanket execution or silent conversion repairs.

Only this proposal was written. No source amendment, new test or execution is released by it.
