# 1299-F: parent adoption of the Save30 compatibility neighbor

The parent read the complete A proposal and independent B review, the live test lines 227-230 and the
`LIVE_SAVE_VERSION` declaration (`src/core/save.ts:6538`, literal40). Adopt option (b) only:

- Stage one hunk in `tests/p14b4-save-v30-compatibility.test.ts`: the first leaf's title becomes
  `pins LIVE_SAVE_VERSION to literal40 independently of the value under test` and its single
  `toBe(38)` becomes `toBe(40)`. Record the original title in the old-to-new mapping and prove the
  complete two-line inverse. Every other byte stays exact, including all frozen29/30/38 readers, digest
  pins, synthetic labels, downgrade refusals, purity checks and the default timeout.
- Gate `1300-save-v30-compatibility-runtime`, source-route cap0, one command with no name filter:

```sh
node_modules/.bin/vitest run --project core --no-file-parallelism tests/p14b4-save-v30-compatibility.test.ts
```

Expected collection is36 selected, zero filtered. That count is prospective until the raw result is read.

A: 14,762 bytes / `5a4378279fc8fccb391ddaf3d54de28b9d5ff092e90d45cce340489119bcabcb`.
B: 6,346 bytes / `cf7fcc5a0121dc3f3e71d4da655f91e1aaee92cfc979946ee912f4e7d4e5d352`.

## Required before execution

1. Test-author handback 1299-C: staged postimage under `1299-stage/tests/`, the exact one-hunk patch,
   the inverse proof and a source manifest. The manifest pins the test pre/postimage, `src/core/save.ts`,
   both Vitest configs, A/B/F, the bounded helpers and the nineteen authorized inputs under
   `tests/fixtures/p14/genuine-v29-pre-p2/` (nine gzip/provenance pairs plus `MANIFEST.json`) with nine
   decoded identities matching A's table.
2. An exclusive companion guard for gate1300, written fresh from the reviewed 1297-C shape with its own
   constants and environment variables. The 1297 companion stays frozen to 1298 and is not repurposed.
3. Independent 1299-D review of C and the companion, then parent 1299-E application and publication.
4. Bounded pre(cap0), companion pre, the recorder command, actual bounded post, companion post.

## Compiler decision

No compiler run for these two literals. The closed 1294b root compiler passed on inventory
`eb6c7c5a4af7fd9b2a8861dea8dc21d4cd1af77067369cf0406bf3924cc0432a`, which 1298 reproduced at
`ea46f8b8`. After application the inventory differs by this one test file. The edit changes an `it` title
string and the argument of `toBe`, which Vitest 2.1.9 declares as `<E>(expected: E) => void`
(`node_modules/@vitest/expect/dist/index.d.ts:165`), so no type constraint reads the value. This is
source reasoning, not a compiler result. If the applied patch touches anything else, the parent reassesses.

## Failure policy

Stop at the first failure and attribute it with the masked remainder. No repeat, filter, timeout change,
assertion edit or broader selection follows from a failure. The historical 1100 elapsed time (119,430ms)
is a planning caution only. The deferred five Bridge-waiver leaves and V32 input stay outside this gate.
This adoption executes nothing and releases no gameplay, native or Owner access.
