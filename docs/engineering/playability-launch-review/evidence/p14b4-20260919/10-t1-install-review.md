# Independent B4 T1 exact-install review

2026-09-19. Native `contract-auditor`. **KEEP — exact authorized installation.**
The three installed tests are byte-for-byte reconstructions of their reviewed
drafts with only the authorized two provenance comments and literal pin
substitutions. No assertion, fixture construction, timeout, validator expectation,
import, helper or test body was otherwise changed.

Parent has reported completed push and independent exact remote verification of
preservation checkpoint `a76242f2f4bdfda98e38ec706e3110ad6a9bb957`. This review
does not repeat Git/network verification. The installed comments correctly name
that preservation checkpoint while artifact producer pins retain their ORIGINAL
tested89b5/publishedc06 authority; the identities are not conflated.

## Exact installed identities

| Installed test | SHA256 | Authorized substitutions |
| --- | --- | --- |
| `tests/p14b4-save-v30-compatibility.test.ts` | `15cb4ce0c744a880e7a7eb1a5cb5ada355387ecc70dcf669869daf44e5e7e9ea` | 20: 18 gzip/raw pins plus two producer pins |
| `tests/p14b4-cast-class-outcomes.test.ts` | `498cea29d579d05fe810317d7dc7b93b8da720252d8fdadc3b07922f0815c9a6` | 4: bound-open gzip/raw plus two producer pins |
| `tests/bridge-p14b4-runtime47-compatibility.test.ts` | `910d21b132484605e6f298f5360c7639993a63ba5d6444cbcf349f69c4bcc015` | 0: already reviewed genuine runtime pins |

Each file additionally has exactly these two prepended lines:

```text
// Installed after T0 KEEP and exact remote preservation a76242f2f4bdfda98e38ec706e3110ad6a9bb957.
// Original inert-draft commentary below is retained as provenance; actual RED recorded separately.
```

Original drafts remain unchanged, with SHA256 respectively:

- Save draft: `c6cd44ae4767dc3c15993a150fbb4f23a15e10e9dcbccf2fbb0a1edb42b14bce`.
- Outcome v2 draft: `b1b9a2b81005365ce594edd7e0218904596874e7e3952e608d1da7d78f3e7a1e`.
- Runtime draft: `71478f15faa1fb94b24d4c0ec5dd7d127014bed085cec2a5bb19c339af319966`.

## Independent reconstruction and evidence checks

Read and hashed each ACTUAL nine-corpus gzip, decompressed its bytes, computed
both hashes independently, and checked each against manifest and provenance.
Built expected substitutions from those computed byte hashes, not from the
installed tests or the parent's supplied pin table. Each sentinel occurs exactly
once; the exact 20/4/0 replacement counts were checked. Added only the two fixed
comment lines, then compared the COMPLETE reconstructed file with each installed
file. All comparisons matched; no UNSET sentinel remains in installed content.

The nine-save manifest still hashes to
`77fa32dabb635f4fc839328ac47b07a008b8d26953cff61cf10d1a3dbbb8c1d1`.
Both producer substitutions agree across actual provenance records:
tested `89b5ad2cfc6947ea07fb043ef5b23eba38d7dbde`, published producer
`c06db6eae2a1350317c018c6f108d115dcba7b19`.
The outcome bound-open pins are actual gzip
`48ec1b4474c2d808cae8d689dde74b8695fa5a95f2b51499a384a189e7fb880e`
and raw
`9d1a1ea177f021477fbd73d401e76bbb4a0448a680253082a100c1e5246862d9`.

Rechecked runtime gzip/raw/provenance/manifest against the independently reviewed
artifact identities. Its manifest remains
`f18c475922e70602b6dfe6ac86cd6d448484b4b6aa480abf65733061e41c4de8`.
All 25 producer/recipe/configuration files recorded in runtime provenance retain
their original hashes. Scope is exact installed-file reconstruction and these
recorded producer/artifact checks, not a fresh whole-worktree audit.

## Execution boundary

Parent may proceed with the separately authorized serialized RED on frozen
inputs. This KEEP establishes installation fidelity, not runtime/type correctness
or reached coverage. Planned V30 exports may initially fail at collection/call;
literal Save30/projection47 and class behavior may fail later. Record the actual
boundary reached, and distinguish fixture/typing/interface failures from
behavioral failures. Existing construction guards, strict historical validation,
full-history assertions and default timeouts remain load-bearing.

No production implementation, Save30/projection47 result, complete B4 test scope,
Unity/native/rendering verification or Owner acceptance follows from this review.
Reviewer performed read-only filesystem/crypto/gzip/JSON inspection and this sole
authorized documentation addition; no live source/test/config/artifact changes,
engine imports, tests, probes, typechecks, git/network commands or delegation.
