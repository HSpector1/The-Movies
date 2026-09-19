# Independent runtime46 preservation artifact review

2026-09-19. Native `contract-auditor`.

**KEEP — genuine outgoing runtime46 artifact and completed corrected mint.**
Independent byte/provenance/slot/journal inspection supports the completed05
evidence. Together with the separate nine-save review06, the requested outgoing
artifacts now exist and have passed bounded independent review. Preservation
publication and exact remote verification remain pending; this is not B4
implementation, forward-migration verification, Unity/native verification or
Owner acceptance.

## Exact artifact identities

Corpus: `tests/fixtures/p14/genuine-projection46-runtime`.

| Artifact | SHA256 |
| --- | --- |
| Uncompressed checkpoint bytes | `e344be06db6794e9d1523c036befb4180595564ef8a3fb6e6062328e477e7699` |
| `genuine-projection46-runtime.checkpoint.json.gz` | `3db0599c6e183140b79c83880eb967dde37aecc0d178a85d192283893ea0cc34` |
| `MANIFEST.json` | `f18c475922e70602b6dfe6ac86cd6d448484b4b6aa480abf65733061e41c4de8` |
| `genuine-projection46-runtime.provenance.json` | `1bc6d6a2ca7a05ad6fd8fc89d308de42225477c98b33781a428f9690926c1935` |
| Saved inner V29 JSON | `03017370f16d9d2cf211f5653650a6d41452f73f0e8b96bb4aa154a6a946f4ca` |
| Current inner V29 JSON | `281663eeb15c5da0c63b005e956c6b7392ab05690652e9f52c1636f88a80817e` |
| Executed corrected minter archive05 | `58e3a9554026089616f96c309cc4dc1ad6b909c87936c9c129165fb77c96c5b6` |

Independently decompressed the actual gzip and hashed both compressed and raw
bytes. Raw size is 3,183,529 bytes; gzip size is 301,302 bytes. Manifest and
provenance agree on every fixture field and authority field. The directory
contains exactly the named gzip, provenance and manifest: no extra output.

Authority is tested source `89b5ad2cfc6947ea07fb043ef5b23eba38d7dbde`, qualified
publication `c06db6eae2a1350317c018c6f108d115dcba7b19`, Save29, promise rules3,
protocol4/projection46 and schema
`sha256:584bdd8565030f049d548b1af4fcbf8c517ca7c9150016736f632f1ef8fcb98c`.
The recorded observed HEAD agrees with that publication. All 25 recorded
producer/recipe/configuration hashes match current files. The qualified B-F2
closeout hash remains
`6f6e425314107a7f0050739becb5f97adede58de94d7631a6f5bf25de8abfc81`.

## Actual slots, retained history and journal

Parsed both actual inner saves independently of parent check07. Both are V29 at
week45, with two identical promise roots and identical first takes, market
receipts and RNG state. Saved state has two current proposals; current state has
one. Comparing the COMPLETE inner save envelopes shows exactly one gameplay
change: removal of the issuing player's proposal for `t-act-09`/`promise-0`.
No other field differs. The historical root remains unbound OPEN with its exact
rules3 achievable receipt recorded at week45; withdrawal did not invent a
contract, outcome, replacement receipt or first take.

The saved JSON is BYTE-IDENTICAL to the separately preserved nine-save
`genuine-v29-current-p1.json.gz` raw contents, not merely a matching selected
root. The nine-save manifest still hashes to
`77fa32dabb635f4fc839328ac47b07a008b8d26953cff61cf10d1a3dbbb8c1d1`.
All nine gzip/raw hashes were rechecked, and all 19 prior corpus files also match
their original input-patch blob identities as described below.

Outer session `p14b4-genuine-outgoing46` has revision1 and exactly two journal
entries: `save-current-p1` on route `save`, then `commit-withdraw` on route
`command`. Both canonical requests use expected revision0 and the exact session,
protocol and schema. Their accepted responses have revisions0 and1 respectively.
The save response contains the exact saved-slot JSON/digest; the command response
names the exact current digest. Its `submitIntent` payload joins the provenance's
actual quote intent ID. No quote-only journal entry was invented.

Independently recomputed current/saved SHA256 digests and the canonical journal
digest (`1db0ff145cc82b8451499709c51f37c53afc41f9a7fc8facf435b1b9aa2ff5b0`).
Checked canonical outer bytes, including their trailing newline, and canonical
request/response JSON. These are lightweight data checks, not a substitute
implementation of the engine validators.

## Completed execution and bounded source attribution

Actual command05 ran only the corrected minter with one worker, on c06db6e:
`2026-09-19T21:20:17.677Z`–`2026-09-19T21:20:36.544Z`, exit0,
signal/error null. The raw log reports one file / one test PASS, Vitest16.16s,
with no failed-suite or unhandled-error diagnostics. The raw footer exactly
matches completed metadata. Artifact construction timestamps fall within that
command interval.

- Metadata05 SHA256:
  `bc9a56b32f17a87fe6db16aede3521bb0be725634c3ef5f4fd96b1040701f3e6`.
- Raw05 SHA256:
  `87eaa2665790f4149c40bf28ffaaad4022201f78a5fe70650574ec7ffb9c6318`.
- Independently hashed recorded start patch:
  `9f77e23ebb3594b131209a3d1f9b92461bdfeabb016d43cba91ebd9b069d504c`.
- End patch hash recorded identically in metadata and raw footer:
  `1d2735912cc16e675458aeaaf57822acaf8ebcc81b016178bb3d916626f3cf16`.

The broad recorder correctly remains `fixedSource:false`: fixtures lie inside
its protected paths. Its source SHA stays c06db6e at both endpoints, and the
untracked-path difference is EXACTLY the three newly generated runtime outputs.
Independently parsed all 22 start-patch file entries and recomputed each Git blob
identity from actual bytes using filesystem/crypto only: the three operational
inputs and all 19 existing nine-corpus files are unchanged. This includes the
corrected runtime minter and original V29 entry/helper. No git command was run
by this reviewer; no claim is made of independently regenerating the end patch.

Read the executed archive's guards: before any output writes it strictly
validates/canonically re-exports both V29 slots, compares each COMPLETE slot to
its OWN expected state's governed writer bytes, loads the current46 checkpoint
without migration, reopens it, verifies exact re-encoding, retries the original
revision0 command against the actual journal and verifies unchanged checkpoint
bytes afterward. The successful actual05 command establishes those assertions
passed; the reviewer did not rerun them. Both producer/minter gates and the
exclusive-output checks also preceded the writes. Parent derived check07 agrees
with the independently checked facts and was not the sole oracle.

## Retained failed attempt and remaining gates

Failed attempt02 remains a failed attempt, not silently replaced. Its raw SHA256
is `e757dfab425e956ecf9971d945b8b05f4f18788ddd0c785281be91e524d01ef7`, and its
original executed entry remains
`de0758b107f82fef55eff1f3e97f94c47859d216f3c9e50b85b0eb79cf3a50b6`.
Reconciliation03 and independent review06 remain present. Their narrow
signed-zero premise correction changed no producer, validator, fixture,
timeout or original inert draft; completed05 is the separate corrected result.

Keep these raw bytes/provenance/archives immutable. Parent must finish the
preservation records, safely remove only archived temporary operational
entries/helpers from discovery, commit, push and verify exact remote publication
before treating the preservation release gate as complete. Future projection47 /
Save30 migration must exercise these genuine prior bytes; it has not run here.
Native UI/UX, rendering, Unity execution and Owner acceptance remain deferred.

Reviewer activity: read-only source/evidence inspection and filesystem/crypto/
gzip/JSON parsing, plus this sole authorized documentation addition. No engine
imports, test/probe/typecheck/runtime execution, git commands, source/test/config
edits, artifact mutation, commits, network or delegation.
