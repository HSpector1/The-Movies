# 1332-F2: parent adoption of the R3 handback, with one amendment

The parent read [1332-C](1332-C-retained-r3-handback.md), its patch
[1332-retained-r3.patch](1332-stage/1332-retained-r3.patch) (15,107 bytes, sha256 582cde20…) and classification
(11,027 bytes, sha256 65fd70b3…) in full. The patch applies to HEAD ba7a9752 in a temporary index. 1332-C stays
byte-frozen; this record governs where they differ.

## Adopted as reported

- Checkpoint `:65` (rule 2): the expected envelope derives `firstTakeSubjects` from the source's `firstTakes` length
  and adds `termination: 0` to every rival period's movements, citing `save.ts:10490-10497` and `:10526-10533`.
- Seam digest `:546` (rule 3, 1332-F amendment 2): `bytes()` calls the law's own `validateFirstTakeSubjects`
  (`src/core/firstTakeSubjects.ts:36-89`) before stripping the root, and throws on a non-zero stripped `termination`.
  The parent read the validator. It requires:
  - the exact key set and `version` 1;
  - `facts` equal to the complete ordered suffix of `firstTakes` after the cutover (count and each `eventId`);
  - each fact's concept and genre to agree with its owner's concept;
  - its `scriptProjectId` to agree with the owner's screenplay link (or `null` only for the player's stock picture);
  - agreement with the surviving production and any released film.

  With 25 takes and one fact, the suffix rule fixes the cutover at 24. The leaf also checks `version` 1 and an
  unchanged `cutoverOrdinal` across the tick. The parent accepts this as the law-derived content check amendment 2
  asks for; the measured `c-00`/`comedy`/`null` values appear as cross-checks in the comment. `FROZEN` is unchanged.
- Digest continuity `:194` (rule 4): the bound/unbound split reads `contractId`, which `commitWinningPromise` writes
  together with the receipt (`talentMarket.ts:1237-1248`). The unbound set is pinned to exactly `promise-3` and
  `promise-26`, with their week-208 case facts verbatim and week-196 pre-tick receipts.

## Amendment: the unbound receipt is equal in every field

1332-F amendment 1 reads "keeps the receipt it held in the pre-tick state, unchanged (every field equal)". The staged
unbound expectation is `toMatchObject({ week, rulesVersion })` copied from the pre-tick receipt. That form leaves
`classification`, `bottleneck` and `inputsDigest` unchecked, although 1332-C measured the receipt byte-identical to the
pre-tick one (handback lines 89-93). 1332-A rule 4 also asks for rulesVersion 4 on both paths.

The author revises the leaf so that:
- on the unbound path, the post-tick receipt `toEqual`s the pre-tick receipt;
- on both paths, `rulesVersion` is asserted as 4 (the bound path keeps `toMatchObject({ week: 208, rulesVersion: 4 })`).

The author re-runs the file and the root type gate and re-issues the patch, classification and a short revision
record 1332-C2.
