# Record 697-T0 — the genuine OUTGOING projection-48 runtime checkpoint is minted

Author: independent test engineer, P14B.6 T0. Brief: `697-T0-projection48-mint-brief.md`.
Scope: one env-gated one-off minter, one fixture directory of three files, this report. No
production file, schema, version constant, existing test, existing helper or existing fixture
changed. Nothing committed. The evidence runner was not invoked.

Amended after the mint under two coordinator decisions: the `publishedRecoverySha` correction and
the archiving of the minter. Read **Amendment, after the mint** before using any hash here; the
checkpoint bytes did not move, the two JSON files did.

**DONE.** `PROJECTION_VERSION` is still 48 and `LIVE_SAVE_VERSION` is still 31 on disk. The
ordering constraint held: these bytes were produced on source where 48 is the running identity,
not a later one wearing a 48 label.

## Identities at mint

| fact | value |
|---|---|
| worktree | `/Users/zacheryspector/The-Movies-headless-program`, branch `wip/headless-program-20260916-ts` |
| observed head | `ab405dbe4c05fc20048b52c86d45c2e50f8deb27` |
| tested source | `caa8cdb39c4f92598777b7b54f84b23cde03cc40` (run 695 base `63688a796ea930…`, tested diff `4c138264597d…`) |
| producer diff `caa8cdb3..ab405dbe` over `src/ bridge/ generated/ ui/ scripts/` | empty; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| closeout authority | `693-p14b5t-tuning-checkpoint.md`, sha256 `3a9c755c39a3ee514cfc7055c1605d82491e08002384d090d4e8f5ad7d8f4392` |
| schema id | `sha256:00c0075bef257634956da7d16d117a145d203047e7169c643156b7971c4c7fec` |
| projection / protocol / save / promise rules / relationship rules | 48 / 4 / 31 / 4 / 1 |
| node | v20.20.2 · vitest 2.1.9 |

## Emitted files

The two JSON files were amended after the mint under the coordinator's decisions below. The
checkpoint was not touched: its bytes are the artifact.

| path | sha256 (current) | bytes | as minted |
|---|---|---|---|
| `tests/fixtures/p14/genuine-projection48-runtime/genuine-projection48-runtime.checkpoint.json.gz` | `7412ec78c1d3265b5e1fa89bc59b0187937121dbd132f0dbd9f923272f156152` | 321641 | unchanged |
| `tests/fixtures/p14/genuine-projection48-runtime/genuine-projection48-runtime.provenance.json` | `23e70da31ac96b2009647d5b0570fc3d5922891dbd3cf3e11a5b8b435361a249` | 10250 | `d07f6a469f55091634aa366e2898234a010f411fe41bfcd5fe784cb11ab90dc7`, 9220 bytes |
| `tests/fixtures/p14/genuine-projection48-runtime/MANIFEST.json` | `a4b580e1d9a55f1043556bc963bca3e6e178dfb278d41139e346bbbfc1ea9a05` | 2967 | `dd46ce020533e503fdee91b9c810c07357bc3845c0dceb920e798b91d12c002f`, 2483 bytes |
| `docs/engineering/playability-launch-review/evidence/p14b4-20260919/697-mint-projection48-minter.test.ts` | `ba7894efc3ff0637db3ae03e756772a35d36b96019292b2f262e5e000e1c5022` | 19867 | archived copy, byte-identical to the executed minter |

Uncompressed checkpoint: sha256 `b04c82747dddc4dec3454fc659e4da409b9022320ae00245847237b1746523c8`,
3269551 bytes. The minter that ran was `tests/bridge-p14b6-mint-projection48.test.ts`, sha256
`ba7894efc3ff0637db3ae03e756772a35d36b96019292b2f262e5e000e1c5022`; that path no longer exists and
the bytes now live at the archived path above.

Inner facts: `sessionId` `p14b6-genuine-outgoing48`, `stateRevision` 1, journal
`[save/save-current-p1, command/commit-withdraw]`, journal digest
`c7e22f654987464a079f898548903a13fe7e2f462395c88a7977719db33659b6`, current slot sha256
`9f26dca8dd9e1b242f2a3e8285f72a17eb100f1fa41a737fc334b6d3e5f6dc8b`, saved slot sha256
`b8e78b47408b2740a01312dff2d98f1a20a756a405bcf530222ddeea3aa77586`, both at week 45, both
`saveVersion` 31, the two slots different bytes. Quote intent id
`intent-v4-0e088f77039c8e07fe59cd7f3785bc0b1af9f5071a87fb89bd6ace00751d5e17`.

## Commands run, in order

1. Collection smoke, no approval variable: `npx vitest run tests/bridge-p14b6-mint-projection48.test.ts --reporter=basic`.
   1 file skipped, 1 test skipped, EXIT 0.
2. The gated mint:
   `STUDIO_MINT_PROJECTION48_APPROVED=ab405dbe4c05fc20048b52c86d45c2e50f8deb27 node_modules/.bin/vitest run tests/bridge-p14b6-mint-projection48.test.ts --minWorkers=1 --maxWorkers=1`.
   1 file passed, 1 test passed, 7008 ms, EXIT 0.
3. The inert proof, same file, no variable: `npx vitest run tests/bridge-p14b6-mint-projection48.test.ts --reporter=basic`.
   1 file skipped, 1 test skipped, EXIT 0.
4. Wrong approval value, `STUDIO_MINT_PROJECTION48_APPROVED=deadbeef`: skipped, EXIT 0, and the run
   printed the disclosure `[p14b6-mint] STUDIO_MINT_PROJECTION48_APPROVED is set but does not equal
   the observed head ("deadbeef" vs "ab405dbe…"); the minter stays INERT.` A wrong value never mints
   and never passes silently.
5. Gated re-run after the artifacts exist: EXIT 1, refused at the tree-cleanliness gate
   (`expected '?? tests/fixtures/p14/genuine-project…' to be ''`, minter line 126), before the world
   was built and before any write. The three files re-hashed byte-identical afterwards.
6. `npx tsc -p tsconfig.bridge.json`: EXIT 0. That project is the one whose `include` covers
   `tests/bridge*.test.ts`; `tsconfig.json` excludes the pattern.

## Round-trip proof

Inside the minter, before the directory was created: `canonicalJson(checkpoint) + '\n'` equals the
encoded string; `gunzipSync(gzipSync(bytes))` equals the encoded string;
`loadBridgeRuntimeCheckpoint(encoded, …)` returns `migratedFromProtocolVersion === null` with the
migration factory never invoked, and re-encodes to the same bytes; a `BridgeSession` rehydrated from
that checkpoint re-exports to the same bytes. After the writes, the minter re-read the `.gz` from
disk, gunzipped it and compared byte for byte, then re-validated both slots with `validateSaveV31`
and asserted `exportSave(validated) === slot`. This is the device at
`src/harness/p14/legacy-v28-fixtures.ts:37-45`.

Independently, outside the minter, from the shipped bytes only:

```
compressedSha256 on disk == provenance                        true   (7412ec78…, 321641 bytes)
uncompressedSha256 after gunzip == provenance                 true   (b04c8274…, 3269551 bytes)
gunzip(gzip(gunzip(file))) == gunzip(file)                    true
sha256(gzip(gunzip(file))) == sha256(file)                    true   (gzip defaults are deterministic here)
MANIFEST.authority == provenance.authority                    true
MANIFEST.fixtures[0] hashes == provenance hashes              true
currentStateDigest == sha256(currentSaveJson)                 true
savedStateDigest  == sha256(savedSaveJson)                    true
currentSaveJson != savedSaveJson                              true
promises identical across the two slots                       true   (promise-0, promise-1)
```

The re-compression matching byte for byte is an observation about this input and node v20.20.2
defaults, not a reproducibility claim for the artifact as a whole. See the limits below.

## The recipe, and what V31 necessarily changes

Reproduced from the projection-47 provenance, which is the only surviving description: the
projection-45, -46 and -47 minters are in no commit (`git log --all -- 'tests/bridge-*mint-projection4*.test.ts'`
is empty) and no minter was in the tree before this one. The projection-45 minter body survives as
evidence at `docs/…/p14b2-20260919/02-mint-projection45.ts`; the projection-46 recipe survives as
prose in `…/b3-preparation/v29-preservation/PROJECTION46-MINTER-BRIEF.md`.

Recipe as executed: `tests/helpers/p14b2-fixtures.ts:retentionFixture().submitted`, the corpus
current-p1 world at week 45, whose sole economic bootstrap is the `fund` helper's disclosed cash
delta with a matching ledger row. One `BridgeSession('p14b6-genuine-outgoing48')`. One real save,
command id `save-current-p1`. One real `quoteMarketProposal` with draft
`{verb:'withdraw', talentId:'t-act-09', termWeeks:null, premiumTier:null}`, then one real
`submitIntent` on that quote's intent id, command id `commit-withdraw`. The withdrawal clears the
current proposal and keeps the unbound promise root, so the two slots share a week and differ in
bytes. Nothing was hand-bound.

**The one necessary difference under V31.** The projection-47 fixture's saved slot was byte-equal to
the archived V30 corpus save `genuine-v30-current-p1` (`b7a32680df6f…`), and its provenance says so.
That equality cannot hold at V31, because `makeSave` now writes a top-level `relationships` root.
The minter measured the gap instead of asserting the old equality:

- The archived V30 corpus save still hashes to `b7a32680df6f0…`, unchanged.
- `exportSave(migrateToV31(importSave(<that V30 save>)))` hashes to `45db56e70003…` and carries
  **0** relationship edges, because `convertV30ToV31` (`src/core/save.ts:8792-8799`) inserts
  `relationships: []`.
- The freshly built V31 world carries **24** edges, identical in both slots, minted from the live
  shared work the retention fixture actually performs.
- Comparing the two states root by root, the V31 saved slot and the archived V30 corpus world differ
  in exactly one top-level state root: `relationships`. Every other root is byte-identical, the
  envelope key set is the same and the seed is the same.

So the recipe reproduced under V31 without substitution, and the entire delta from the 47 world is
the new root. Two further consequences, recorded rather than hidden:

1. `savedSaveSha256` moves from `b7a32680df6f…` (47, V30) to `b8e78b47408b…` (48, V31). Any future
   test that wants the corpus-equality property must compare against the V31 writer's own output,
   not the archived V30 hash.
2. Per record 693, `RELATIONSHIP_FAILURE_DELTA` moved 4 to 5 and a campaign replayed from its seed
   diverges from any archived pre-change relationship value at its first shared failure. These 24
   edges were produced on the post-change source, so they are the tuned values, not the pre-693
   ones. That is why the provenance pins `src/core/relationships.ts` and
   `tests/p14b5-t-failure-tuning.test.ts` in `sourceFiles`: 43 entries, the projection-47 list of 41
   plus those two.

## Deviations from the projection-47 provenance, and why

- `publishedRecoverySha` was minted as `null`. **That was wrong and is corrected below**; it now
  carries `ab405dbe4c05fc20048b52c86d45c2e50f8deb27`, like the 46 and 47 fixtures.
- `authority` gains `testedRunBaseSha` and `testedRunDiffSha256`. The bytes that ship were tested by
  run 695 as an uncommitted candidate on `63688a79`, then landed as `caa8cdb3`. Recording only one
  sha would hide one of those two facts.
- `authority` gains `relationshipRulesVersion: 1`, which did not exist at 47.
- The provenance gains `minterRelativePath`, `minterArchivedRelativePath`, `minterReproduction`,
  `worldBuildMs`, `v31Comparison`, `recipe.compression` and `recipe.reproducibility`. All additive;
  every projection-47 field is present with the same name and meaning, so the four fixtures stay one
  comparable series.
- `recipe.savedSlotIsCorpusWorld` states the V31 equality and states that the V30 hash is not
  comparable, instead of repeating the 47 sentence.
- Compression uses `node:zlib` `gzipSync` defaults, matching the surviving projection-45 minter.
  `legacy-v28-fixtures.ts` uses level 9. The 46 and 47 minters do not survive, so their level is
  unknown and I did not guess it. The level is disclosed in `recipe.compression`.

## What this fixture cannot establish

- **Not byte-reproducible.** Journaled response bytes carry real `processingMs`, so a re-run mints a
  different `uncompressedSha256`. Re-running the minter is not a way to re-derive these bytes, and a
  mismatch on a re-run is not evidence of corruption. The `wx` flags and the cleanliness gate make
  an accidental remint fail rather than overwrite.
- **No migration claim.** These are the outgoing-48 originals. That `projection-v48` migrates
  correctly under projection 49 is exactly what the B.6 compatibility test must prove against these
  bytes; this record proves only that the bytes are genuine, canonical, re-readable and internally
  consistent at 48.
- **No Unity, no native, no visual, no playtest, no Owner acceptance.** Nothing here was rendered or
  run in a player.
- **No schema-registration claim.** `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` does not contain
  `sha256:00c0075b…` and must not until B.6 bumps the projection. The minter asserts its absence as
  a precondition; registering it is the B.6 writer's step, with the literal
  `'sha256:00c0075bef257634956da7d16d117a145d203047e7169c643156b7971c4c7fec' -> 'projection-v48'`,
  and the expected-prior-id list in `tests/bridge-p14b4-runtime47-compatibility.test.ts:40-80` grows
  from 36 to 37 entries at that point.
- **Not a full-core run.** I ran only the minter file and the bridge typecheck. The suite-wide
  baseline from record 695 (9 files / 24 failed / 3944 passed / 8 todo) was not re-established, and
  the 24 known failures are untouched by this work.

## Amendment, after the mint

Both changes are text inside the two JSON files plus a file move. The checkpoint `.json.gz` still
hashes `7412ec78c1d3265b5e1fa89bc59b0187937121dbd132f0dbd9f923272f156152` at 321641 bytes, and every
cross-reference between the three files was re-verified afterwards.

### Correction: the minting head WAS published

I recorded `publishedRecoverySha: null` and a `publicationState` string reading "LOCAL ONLY: the
minting head is on no remote ref". **That string was false.** My test was
`git for-each-ref --contains HEAD refs/remotes`, which answers a question about this worktree's
remote-tracking refs, not about the remote. This worktree has no
`refs/remotes/origin/wip/headless-program-20260916-ts` at all (`git rev-parse --verify` on it fails
with `Needed a single revision`), because the coordinator's push and fetch set `FETCH_HEAD` rather
than a tracking ref here. The authoritative check asks the remote:

```
$ git ls-remote origin wip/headless-program-20260916-ts
ab405dbe4c05fc20048b52c86d45c2e50f8deb27	refs/heads/wip/headless-program-20260916-ts
$ git rev-parse HEAD
ab405dbe4c05fc20048b52c86d45c2e50f8deb27
```

`publishedRecoverySha` is now `ab405dbe4c05fc20048b52c86d45c2e50f8deb27` and `publicationState`
states the verified fact and names the bookkeeping gap that produced the wrong one. One limit stays
in that string: `ls-remote` proves the sha is on the published branch, not when it was pushed. The
coordinator states the push preceded the mint; I did not verify the ordering and the provenance says
so rather than implying I did.

### Decision: the minter is archived under `docs/`, not lost

The 45, 46 and 47 minters were deleted after use and exist in no commit, so none of those three
fixtures is reproducible from this repository. This one is archived byte-identically at
`docs/engineering/playability-launch-review/evidence/p14b4-20260919/697-mint-projection48-minter.test.ts`,
sha256 `ba7894efc3ff0637db3ae03e756772a35d36b96019292b2f262e5e000e1c5022`, 19867 bytes, `cmp` clean
against the executed file. `tests/bridge-p14b6-mint-projection48.test.ts` is deleted, so no suite
collects it and the core file and skip counts return to the 636 / 669 / 695 baseline shape.

I verified the "can never be collected" claim rather than reasoning from the glob. Vitest printed
its own effective configuration when asked for the archived file by name:

```
$ npx vitest run docs/…/697-mint-projection48-minter.test.ts
[core] Config  include: tests/**/*.test.ts
[ui]   Config  include: ui/**/*.test.{ts,tsx}
No test files found, exiting with code 1
```

The same run with `STUDIO_MINT_PROJECTION48_APPROVED` set to the head sha also finds no test file.
Naming the archived path explicitly, with a valid approval, still cannot load or mint. Exit 1 there
is vitest reporting an unmatched filter, not a failing test.

**To reproduce the mint**, copy the archived bytes back to
`tests/bridge-p14b6-mint-projection48.test.ts` first, because that is the path the recorded command
names, then run the recorded command. The provenance carries this as `minterReproduction` beside
`minterRelativePath` and `minterArchivedRelativePath`. The recorded `command` is left exactly as it
ran and was not rewritten to point at the archive.

Consequence to note: `tsconfig.bridge.json` includes `tests/bridge*.test.ts` and nothing under
`docs/`, so the archived copy is no longer typechecked by any project. The `tsc -p tsconfig.bridge.json`
EXIT 0 above remains a true statement about these exact bytes at the time they ran.
