# 704 — the D1 prose correction, and the one hash it legitimately moves

## What changed and why

Review 702-C DEMONSTRATED 1: the wire contract claimed a disclosure law the casting carrier
does not implement — "A tie is published only when its counterpart is independently visible
to the player, so a rival-internal pair reaches no DTO" (`bridge/schema/bridge-schema.ts`
:248-250) and "A rival-internal pair appears on no DTO anywhere" (:2638-2639).

The claim is true of the PROFILE block and false of the CASTING rows, which apply no roster
predicate (`bridge/relationships.ts:162-179`). The parent accepted the finding as a PROSE
defect, not a behavioural one: ruling 3 (iii) requires the readout for a seating the player
proposes, both people are in the player's own request, and filtering them by roster would
delete the warning for freelancer seats — strictly worse for the player. The disclosure
basis differs by carrier and the contract now says so.

Both edits are COMMENT lines. Proof, run on the working tree:

    git diff -- bridge/schema/bridge-schema.ts | grep -E '^[+-]' | grep -v '^[+-][+-]' \
      | grep -vE '^[+-]\s*(//|\*|/\*\*)'
    (no output — every changed line is a comment line)

Diffstat: 13 insertions, 4 deletions, one file.

## The non-obvious consequence: a comment-only edit MOVES a published hash

`generatorSourceSha256` in `generated/unity/project-studio-bridge.contract-manifest.json` is
NOT a hash of the generator's output. It is a hash of the generator's INPUT BUNDLE, and that
bundle lists the schema module itself:

    scripts/generate-bridge-contract.ts:21-31  GENERATOR_SOURCE_PATHS
      bridge/schema/bridge-schema.ts   <-- the file edited here
      bridge/schema/industry-schema.ts, intent-schema.ts, canonical.ts, dsl.ts
      package.json, package-lock.json
      scripts/bridge-contract-csharp.ts, scripts/generate-bridge-contract.ts

`sourceBundleSha256` (:92-106) reads each path FROM DISK and hashes the bytes, so a comment
changes it. `scripts/bridge-contract-consumer-lock.ts:42-52` carries the same path list for
CF-09, computed `sourceBundleFromCommit` — from the committed tree rather than the worktree.

Therefore `npm run check:bridge-contract` (part of `test:bridge`) FAILS against the committed
manifest until the manifest is regenerated. This is the check behaving correctly: it is
telling the truth about its inputs, and the fix is to regenerate, not to hand-edit the hash.

## The prediction this makes, to be verified before it is believed

A comment cannot reach the emitted schema or the generated C#. So a regeneration must move
`generatorSourceSha256` and NOTHING ELSE. Pinned here BEFORE the run, from the artifacts as
they stand at `68fe5985` plus this uncommitted edit:

| field | value now | expected after regen |
|---|---|---|
| `schemaId` | `sha256:60af24c58bc4bea8f04e7fc818f8401daeadd87da91252e60cfcf3ee028d8e1b` | UNCHANGED |
| `projectionVersion` | 49 | UNCHANGED |
| `protocolVersion` | 4 | UNCHANGED |
| `generatorVersion` | 1 | UNCHANGED |
| `typescriptGeneratedContractSha256` | `c84b5f955ba57ac246cf2fc011a329abcbed385317c9e6a5e1ead9800aa54c48` | UNCHANGED |
| `unityGeneratedContractSha256` | `c84b5f955ba57ac246cf2fc011a329abcbed385317c9e6a5e1ead9800aa54c48` | UNCHANGED |
| `generatorSourceSha256` | `122a6052d037dfca639d985922177b24df313b81b5ba2e0d87efcb380435e7de` | **MOVES** |
| `generated/unity/StudioBridgeDtos.Generated.cs` bytes | `c84b5f95…` | UNCHANGED |
| `generated/unity/tests/StudioBridgeUnionFixtures.Generated.cs` bytes | `be4b1dd1da2e7dc28906b9bad1ab0fa73e32d4dbe69eef344d9aeaf0a697bdb6` | UNCHANGED |
| `tests/bridge-contract-generator.test.ts` F10/F11 `d54e9472…`, F12 `78d68a2d…` | | UNCHANGED (fixture-schema C# hashes, no schema-module input) |

If any row other than `generatorSourceSha256` moves, the edit was not comment-only and this
record is wrong — investigate before committing, do not restamp.

This is the SECOND generator run of the B.6 slice. The first (S4, commit `ad49031f`) carried
the projection 48 -> 49 bump and was run exactly once, as its record states. This one carries
no version change at all; it refreshes an input-bundle hash. Recording both runs so the
"generator run exactly once" discipline is not quietly overstated later.

## Unchanged

No behaviour, no DTO shape, no copy string, no save state, no test expectation. The Owner
decision isolated by 702-C — whether tier and drivers (as opposed to the one warning
sentence) should be withheld for a proposed pair where NEITHER person is on the player's
roster — remains open and does not block B.6.
