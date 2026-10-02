# 1359-X6: the P15C Wave 2 RED on the Save44 base (revision r8), with its producer

Relationship slice B made Save44 live ([1358-L](1358-L-rel-sliceB-landing.md)). 1359-F6 ruling 5 orders two things
before the P15C mint and recorded RED:
- the RED moves its base-version pin to the base it lands on;
- the parent re-runs the declaration check on that base.

This record does both.
- **Revision r8** moves `BASE_LIVE_SAVE_VERSION` to 44 and changes nothing else that runs.
- **Same results on both bases.** The parent ran r7 on the last Save43 commit and r8 on the Save44 HEAD. Every leaf of the
  RED gives the same status and the same first message on both bases, and every leaf matches the r7 classification.
- **The root type gate** is clean at Save44.
- **The producer** 1359-P r4 mints route L's two captures on the Save44 base.

The same run produced [1355-X5](1355-X5-p15a1-red-r4-on-save44.md) and
[1356-X4](1356-X4-p15a2-red-r4-on-save44.md).

## Revision r8 (the parent's)

[1359-p15c-wave2-red-r8.patch](1359-stage/1359-p15c-wave2-red-r8.patch), sha256
2a5df9771b2c77388e8d756a77323f6acb9cea8c55bf7eef26b984120520616b, differs from r7 (e3ccde79…) in four lines, each
replaced in place, so every hunk header stands:

| r7 patch line | r7 | r8 |
|---|---|---|
| :840-841 (comment) | "Today STEP is 43, so those leaves run the Save43 functions" | "Today STEP is 44, so those leaves run the Save44 functions" |
| :944 (doc comment) | "The live version at this RED's base 1063ab4f" | "The live version at this RED's base, Save44 since relationship slice B (1358-L)" |
| :945 | `const BASE_LIVE_SAVE_VERSION = 43` | `const BASE_LIVE_SAVE_VERSION = 44` |

- **Where the constant is read.** Only `legacy-root-fresh` (integration file, r7 patch :1614) reads it:
  "the Legacy root arrives in a save step above this base".
- **At the RED commit** the leaf fails on its first assertion, the missing root, so its classified first message stands.
- **At the GREEN** the leaf now requires P15C's own save step above Save44. Under r7, Save44 alone would have satisfied
  it.
- **The classification** stays r7's ([1359-p15c-wave2-red-r7-classification.json](1359-stage/1359-p15c-wave2-red-r7-classification.json)):
  r8 changes no row's expectation. Two of its texts describe the Save43 base they were measured on, and they stand as
  history:
  - `legacy-control-late-founding-route-lawful` ("route L is lawful at Save43");
  - `legacy-root-downgrade`, which names `migrateToV42` and `convertV42ToV43`, Save43's step functions. On Save44 the
    leaf finds `migrateToV43` and `convertV43ToV44` by name, and its first message is unchanged.

## How the run went

- **Script.** [run-p15-reds-save44.sh](1359-stage/x6/run-p15-reds-save44.sh), alone in the heavy lane, on 2026-10-02
  from 11:14:21 to 11:21:19 CDT, Node v20.20.2 ([run-meta.txt](1359-stage/x6/run-meta.txt)).
- **Bases.** One fresh scratch tree per base, from a repository archive:
  - OLD is 65515b66, the last commit before slice B's production (Save43);
  - NEW is 1706d844, the Save44 HEAD.
- **Tree layout.** `tests/fixtures` was a real directory of links.
- **Per RED.** Each RED was applied alone, because all three create `tests/helpers/p15-roots.ts`. Then came its test
  files with JSON output, the root type gate, and a reset to the base. P15C ran r7 on OLD and r8 on NEW.
- **Comparison.** [check-p15-save44.py](1359-stage/x6/check-p15-save44.py) compared each run with its classification and
  OLD with NEW leaf by leaf ([check.txt](1359-stage/x6/check.txt)). The parent removed the trees afterwards.

## Results

| Base | RED | Tests | Root type gate |
|---|---|---|---|
| OLD 65515b66 (Save43) | r7 | 40 failed, 76 passed (116) | 17 errors, all in slice B's RED files (`p14b10-romance` 15, `p14b10-labels` 2), which slice B's production resolves |
| NEW 1706d844 (Save44) | r8 | 40 failed, 76 passed (116) | exit 0, no error |

- **Against the classification.** All 116 classified leaves have their expected status on both bases. Every failing
  leaf's first message matches `firstMessageAtRed`. No leaf is missing or unclassified.
- **OLD against NEW.** Every leaf's status and first message are identical.
- **Against 1359-X5.** The totals equal r7's at its own base (40 and 76).
- **Outputs.** [old-1359.json](1359-stage/x6/old-1359.json), [new-1359.json](1359-stage/x6/new-1359.json), the text
  outputs and the type-gate files sit beside them.

## The producer on the Save44 base

[run-p15-producers-save44.sh](1359-stage/x6/run-p15-producers-save44.sh) repeats 1359-X3's dry run on 1706d844
([producers.log](1359-stage/x6/producers.log)).
- **Inputs.** The producer is 1359-P r4 (sha256 78c1d105…), over RED r8 in a tree with a real `tests/fixtures/p15`.
- **Not a mint.** Nothing was written to the repository.
- **Exit 0.** It wrote route L's captures at weeks 6239 and 6240 ([x6-route-l-MANIFEST.json](1359-stage/x6/x6-route-l-MANIFEST.json),
  [1359-p-dry.txt](1359-stage/x6/1359-p-dry.txt)):

  | Capture | 1359-X3 (Save43) | 1359-X6 (Save44) |
  |---|---|---|
  | `saveVersion` | 43 | 44 |
  | week 6239, gzip bytes | 68,024 | 68,078 |
  | week 6240, gzip bytes | 77,999 | 78,045 |
  | route, headless to 6188 | 2,278 ms | 2,146 ms |
  | route, industry 6188 to 6241 | 4,924 ms | 4,369 ms |

- **What changed.** The weeks and the route are unchanged. The bytes grow by slice B's two edge fields.

## What follows

- P15C's RED (r8) can land on the Save44 base. Its mint, 1359-P r4, runs at that base after the RED commit (1359-F6
  ruling 5), and its recorded RED follows.
- The landing order and the `p15-roots.ts` merge come from the records. The parent compiles them before the first P15
  RED lands.
- The P15C reference r4 mints Save44 itself. It must retarget to Save45 before any reference run on this base.
