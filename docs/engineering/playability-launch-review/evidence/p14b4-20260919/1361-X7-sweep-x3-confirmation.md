# 1361-X7: Save45 sweep x3 confirmation

The final sweep candidate meets 1361-N's dry-run success line. All 18 extra S9 failures from x2 are gone, with no other failure identity or primary message changed after normalizing only the scratch-tree path. This is candidate validation; Save45 has not landed and its recorded gates remain required.

## Identity and execution

- Source archive: repository `8719cde18f7398b8baacab870f1105a0720db6e1`.
- Clean committed candidate: `ee289de67e453ce269c98d840a48799265c62993`, at `/Users/zacheryspector/studio-scratch/1361-sweep/x3/tree`.
- Inputs: reviewed production through `p15c-c-r1`, sibling r2, hygiene comment, then H/G1/G4a/G4b r2 and G2/G3/G5 r1. [Final input hashes](1361-stage/sweep/units/final-candidate-sha256.txt) identify the unit patches.
- Execution: `run-sweep-x.sh x3`, Node v20.20.2, through the single heavy lane, 2026-10-03 15:01:16–16:55:24 CDT. Core ran 15:03:23–16:37:03; UI ended 16:51:18. The tree ended clean.
- [Preserved artifacts](1361-stage/sweep/x3/): metadata, build/type/generator logs, compressed core/UI/d16 output, d16 JSON, attribution and SHA-256 hashes of each original text log. No diagnostic instrumentation is in this candidate.

## Measurements

| Check | Result |
|---|---|
| Root, UI and Bridge type gates | All exit 0 |
| Both generator checks | Exit 0 |
| Core, 448 files | 137 failed, 5,114 passed, 3 skipped, 11 todo (5,265) |
| Core against 1358-I | SAME 78, CHANGED 7, NEW 52, GONE 0 |
| UI, 204 files | 2,692 passed, 5 skipped (2,697); no failures or unhandled errors |
| UI against 1358-I2 | NEW 0; the same 3 historical numpy failures are GONE |
| d16 | 12 failed, 164 passed (176); exactly the baseline identities and full failure messages after scratch-prefix normalization |

[attribute-x3.py](1361-stage/sweep/attribute-x3.py) uses the existing 1321-I/1317-I parsers and 1344-I comparator. The [declared-45 comparison](1361-stage/sweep/x3/attr/x3-declared45.json) checks complete P15A.1 names and primary messages without normalization: all 45 match `1361-stage/x-r3b/1355-leaves-red-at-b-r2.tsv` exactly. The other seven NEW rows are the existing scratch Fake Unity supervisor environment failures.

The seven CHANGED baseline rows remain C20's Save44-to-Save45 version digit and six r3n1 ENOENT paths. Those six already belong to 1358-I and are not counted again as NEW. No retained failure disappeared. The [x2-to-x3 comparison](1361-stage/sweep/x3/attr/x3-vsx2.json) shows precisely 18 removals, no additions, and no changed primary message after replacing only each candidate's absolute tree prefix.

Both named production-stop surfaces pass: `p13a-causal-core` is 8/8 and `contracts/v14-byte-parity.contract` is 6/6. No lawful ticked Power Ranking save is newly refused there.

## Deferred pins and coverage limits

The 17 anchored S9 edits across 11 files are confirmed, including sequential calls and loop variants that x2 stopped before reaching. The writer-continuation suite is 64/64, scientist-retirement 15/15, save-v36 14/14, cohort-transition 9/9, dual-extensions 12/12, off-menu extensions 8/8, profession-history 15/15, transitions 35/35, opportunities 10/10 and save-v41 17/17. Directing-promises retains only its known D07/D18 fixture failures; its revised leaves pass.

The four exact S8 first-guard pins also pass. Save-v38 retains only C20; its mutation leaves pass. Writer-continuation passes across all four callers. Their messages were measured independently by the assertion-preserving x2 guard observer and attributed in [the guard review](1361-stage/sweep/review-guard-messages.md).

Each unit's `deferred.md` and `handback.md` now begins with a completion addendum. Original author observations remain below it as historical provenance. A passing assertion confirms its retained pattern, not every detail of a broader possible message. Cases blocked by a standing fixture premise are not claimed as newly exercised.

The existing limits stay explicit: 15 P14B.1 terminal-premise failures never reach their mutants, 26 frozen workflow-carrier observations first reach existing V14 history guards, and the three H plus one writer S8 cases pin the measured earlier guard rather than claiming isolated coverage of the masked invariant. Own-era coverage limits from the reviewed comments remain unchanged. No production, fixture payload or P15 RED assertion was changed by the sweep.

## Review and next step

The [independent final measured review](1361-stage/sweep/review-x3-final.md) concludes **PROCEED for the sweep landing**, with no unresolved sweep defect. The reviewer independently checked all seven patch hashes, all 417 resulting hunks against the clean candidate, exact failure/message sets, d16 parity and the completion addenda. Prior static sampling and delta/message reviews remain preserved. Recorded gates are still required.

At completion, free disk was 4,059,864 KiB (about 3.87 GiB), below the 5 GiB recorded-run precondition. The six production format-patches are prepared in `/Users/zacheryspector/studio-scratch/1361-land/production/`. After independent approval and satisfying the disk precondition, continue the ordered landing and recorded gates in HANDOFF.md; do not count this dry run as recorded evidence.
