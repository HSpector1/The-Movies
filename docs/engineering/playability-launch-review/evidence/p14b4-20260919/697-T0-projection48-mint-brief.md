# 697-T0 — parent brief: mint `genuine-projection48-runtime` BEFORE the B.6 writer (test-author)

Authority: the P14 plan's P14B.6 expansion (record 687; Owner ruling 4 of record 683) and its HARD
ORDERING CONSTRAINT. This is T0 and it must complete before any file touches `PROJECTION_VERSION`.

## Why this must happen first

`PROJECTION_VERSION` is 48 today (`bridge/schema/bridge-schema.ts:240`). B.6 bumps it to 49 and
registers the outgoing schema id as `projection-v48`. Every prior bump minted a genuine runtime
checkpoint at the OUTGOING version first — `tests/fixtures/p14/genuine-projection45-runtime`,
`genuine-projection46-runtime`, `genuine-projection47-runtime` all exist. If the fixture is minted
after the bump it is a projection-49 artifact wearing a 48 label, and the compatibility chain loses
its genuine 48 predecessor. Mint now, on source where 48 is still live.

## The precedent to follow exactly

`tests/fixtures/p14/genuine-projection47-runtime/genuine-projection47-runtime.provenance.json`
records how its own fixture was made. Read it in full. Key facts:

- The minter was a ONE-OFF env-gated TEST file, `tests/bridge-p14b5-mint-projection47.test.ts`,
  removed from the tree after use (no minter remains today — confirm that yourself).
- Its command was
  `STUDIO_MINT_PROJECTION47_APPROVED=<head sha> node_modules/.bin/vitest run tests/bridge-p14b5-mint-projection47.test.ts --minWorkers=1 --maxWorkers=1`
  and the approval variable's VALUE was the observed head sha, so the mint cannot fire by accident.
- Its recipe: `tests/helpers/p14b2-fixtures.ts:retentionFixture().submitted` (the corpus current-p1
  world), an explicit fund helper cash delta with a matching ledger, then real save / real quote and
  commit withdrawal actions. `campaign: "generated test campaign, never Owner save"`.
- It emitted THREE files: `<name>.checkpoint.json.gz`, `<name>.provenance.json` and `MANIFEST.json`,
  with `minterSha256`, `sourceFiles` hashes, node version, timestamps, the schema id, the projection
  / protocol / save versions, both uncompressed and compressed sha256 and byte lengths, and the
  session/week/journal facts.

## What to produce

1. `tests/bridge-p14b6-mint-projection48.test.ts` — the minter, gated on
   `STUDIO_MINT_PROJECTION48_APPROVED` equal to the current head sha, a NO-OP (skipped, not failing)
   when the variable is absent or wrong, so it is inert in every ordinary suite run. Model it on what
   the 47 provenance describes; keep the SAME recipe and the same emitted-file shape so the four
   fixtures form one comparable series.
2. `tests/fixtures/p14/genuine-projection48-runtime/` containing the three files, with the
   provenance carrying the CURRENT identities: `projectionVersion` 48, `saveVersion` 31 (not 30 —
   V31 landed in B.5), the live schema id from `bridge/schema/bridge-schema.ts`, `protocolVersion` as
   the source states it, `promiseRulesVersion` 4, and the P14B.5-T closeout as the authority
   (`693-p14b5t-tuning-checkpoint.md`, with its sha256).
3. `697-T0-report.md` in the evidence folder: the exact command you ran, the emitted shas and byte
   lengths, the recipe you used and any place it necessarily differs from the 47 recipe (V31 exists
   now; `relationships` is a real root; say exactly what that changes), a re-read proof that the
   gzip round-trips byte-stable, and what this fixture CANNOT establish.

## Hard boundaries

- Do NOT change `PROJECTION_VERSION`, `LIVE_SAVE_VERSION`, any schema, any production file under
  `src/`, `bridge/`, `generated/`, `ui/` or `scripts/`, or any existing test, fixture or helper.
- Do NOT delete or modify the 45/46/47 fixtures.
- Never read or copy anything under the Owner's home directory outside this worktree. The campaign is
  generated in-process: `campaign: "generated test campaign, never Owner save"`.
- Fail loud. If the recipe cannot be reproduced under V31, say so precisely and stop rather than
  substituting a different world quietly.
- Do not commit. Do not invoke the evidence runner. The parent owns both.

## Forecast

One minter file, one fixture directory of three files, one report. One gated run plus one ordinary
suite run to prove the minter is inert without its variable.
