# 721-T0 — parent brief: mint the genuine OUTGOING Save V31 fixtures BEFORE the B.7 writer

Authority: the P14 plan's standing slice rule ("genuine fixtures of the outgoing save version
minted at its final writer before any source change") and the P14B.7 expansion, record 720 §7.
This is T0. It must complete before any file touches `LIVE_SAVE_VERSION`.

## Why this must happen first

`LIVE_SAVE_VERSION` is 31 today (`src/core/save.ts:6409`). B.7 bumps it to 32 to carry
`supersededByPromiseId: string | null` on the promise record. Every prior save bump minted genuine
fixtures at the OUTGOING version first: `tests/fixtures/p14/genuine-v29-pre-p2`,
`genuine-v29-pre-b3-evaluator1`, `genuine-v30-pre-b5` all exist. A fixture minted after the bump is
a V32 artifact wearing a V31 label, and the migration chain loses its genuine V31 predecessor.
Mint now, on source where 31 is still live.

## Identities to record (BOTH, as 645-A did for V30)

| fact | value |
| --- | --- |
| observed head | `152ee9a4be0502d6a1d1f6cf50573660717b0c98` (confirm it yourself; do not trust this line) |
| last BEHAVIOURAL V31 writer | `caa8cdb39c4f92598777b7b54f84b23cde03cc40` (B.5-T moved `RELATIONSHIP_FAILURE_DELTA` 4 → 5, which changes edge values inside a V31 save) |
| last writer of `src/core/save.ts` | `f5310afb` |
| producer diff `caa8cdb3..HEAD` over `src/` | expected EMPTY; VERIFY and record the sha256 either way |
| closeout authority | `718-b6-checkpoint.md` |
| projection / protocol / save / promise rules / relationship rules | 49 / 4 / **31** / 4 / 1 |

B.6 moved `bridge/` and `generated/` but not `src/`. If your own check of
`git diff caa8cdb3..HEAD -- src` is NOT empty, stop and report it; do not mint over a surprise.

## The precedent to follow exactly

Read these three in full before writing anything:

- `tests/fixtures/p14/genuine-v30-pre-b5/MANIFEST.json` — the exact manifest shape you must
  reproduce: `authority`, `observedHeadSha`, `sourceFiles` (per-file sha256), `minterSha256`,
  `supportSha256`, `nodeVersion`, `startedAt`, `endedAt`, `campaignSource`, `command`, `scope`,
  and a `fixtures` array whose entries carry `filename`, `provenanceFilename`, `seed`, `week`,
  `saveVersion`, `uncompressedSha256`, `compressedSha256`, `byteLength`, `compressedByteLength`,
  `rootCounts` and `focus`.
- `docs/engineering/playability-launch-review/evidence/p14b4-20260919/648-mint-final-v30.executed.ts.txt`
  — the archived minter that produced that set, byte-identical to what ran.
- `.../648-mint-support.executed.ts.txt` — its support module.

Its command was
`STUDIO_MINT_V30_APPROVED_FINAL=<head sha> node_modules/.bin/vitest run tests/bridge-p14b5-mint-v30.test.ts --minWorkers=1 --maxWorkers=1`,
and the approval variable's VALUE was the observed head sha, so the mint cannot fire by accident.
Keep that gate exactly: your minter is a NO-OP (skipped, not failing) when the variable is absent
or does not match, so it stays inert in every ordinary suite run.

## What to produce

1. `tests/bridge-p14b7-mint-v31.test.ts`, gated on `STUDIO_MINT_V31_APPROVED` equal to the current
   head sha, plus a support module if you need one. Archive both executed copies for the record.
2. `tests/fixtures/p14/genuine-v31-pre-b7/` with one `.json.gz` and one `.provenance.json` per
   fixture, and one `MANIFEST.json`.

## The fixture roster, and why each one earns its place

`rootCounts` must additionally report `relationshipEdges` for this set, because V31's own new root
is the relationships root and the V32 chain has to carry it untouched.

| fixture | what it must contain | what it proves for B.7 |
| --- | --- | --- |
| `genuine-v31-empty` | both V31 roots empty | `convertV31ToV32` opens the new field on nothing and changes nothing |
| `genuine-v31-bound-open-p1` | one BOUND open P1 (`contractId !== null`, `outcome === null`) | the waiver's primary subject; the substitute binds to this `contractId` |
| `genuine-v31-bound-open-p2-lead` | bound open P2, `seatClass: 'lead'` | the STRONGEST class, so no substitute can out-rank it: the equality case of the subset test |
| `genuine-v31-bound-open-p2-lead-or-antagonist` | bound open P2, `seatClass: 'leadOrAntagonist'` | the middle rung, where both a legal upgrade and an illegal downgrade exist |
| `genuine-v31-part-served-p1` | a bound open P1 with `0 < progress < predicate.count` | **the fixture product choice (c) turns on**: whether the substitute's count must meet the REMAINING obligation or the original |
| `genuine-v31-kept-and-broken` | at least one SATISFIED and one BROKEN promise | terminal records must also open `supersededByPromiseId` null, and a terminal promise must never be waivable |
| `genuine-v31-rival-current-p1-and-p2` | rival-authored promises | rival waiver policy is record-only; a rival promise must be untouched by every B.7 path |
| `genuine-v31-with-edges` | relationships root NON-EMPTY | `convertV31ToV30` already refuses when any edge exists; the V32 chain must preserve that refusal, not route around it |
| `genuine-v31-distrusted-issuer` | a studio whose `trustDescriptor(state, person, studio, week).label === 'Distrusted'` for the beneficiary of an OPEN bound promise | the waiver REFUSAL case. `TRUST_DISTRUST_MIN_NEGATIVES` is 2 (`promises.ts:78`), so this needs two negative drivers on that pair |

## Rules that are not negotiable

- **Real actions only.** Generated test campaigns, real save and real action paths, exactly as the
  V30 set was made. `campaignSource` is "generated test campaigns only; never Owner saves".
- **Hand-building a state is forbidden.** If a named fixture cannot be produced through real
  actions, REPORT THAT AS A FINDING and mint the rest. A hand-assembled state is not producer
  evidence and would quietly certify a shape the engine never writes. `genuine-v31-distrusted-issuer`
  is the one most likely to resist; if it does, say exactly which driver you could not reach.
- **Change no production file, no schema, no version constant, no existing test, no existing helper
  and no existing fixture.** `LIVE_SAVE_VERSION` must still read 31 on disk when you finish, and
  `PROJECTION_VERSION` must still read 49.
- **Commit nothing.** The parent owns publication.
- Do not invoke the evidence runner; the parent owns runtime.

## Report

Write `722-T0-report.md` in the same directory: identities at mint, the emitted file table with
sha256 and byte length for every file, the command actually run, anything in the roster you could
not produce and why, and any engine fact you discovered that record 720 gets wrong. Record 720 is a
draft. If minting these states shows one of its claims to be false, that finding is worth more than
the fixtures.
