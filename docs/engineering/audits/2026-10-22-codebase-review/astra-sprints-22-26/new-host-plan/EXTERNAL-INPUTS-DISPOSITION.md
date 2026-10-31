# External-input dispositions for new-host execution (2026-10-31, 14:25 CDT)

Owner order "PRE-ARRIVAL DEPENDENCY READINESS" (bounded file recovery / records task). Scope: the inputs named in NEW-LAPTOP-IMPLEMENTATION-PLAN.md §1G and §3 M1b-P. Searches already documented in that plan were not repeated; this note records only the sources inspected afterwards and each input's disposition. The new machine has not been inspected and is not called ready.

## P13A review library and the selected research-active checkpoint (M1b-P)

| | |
|---|---|
| Required input | `artifacts/p13a/review-library/generated-review-library.json`, 1,959,182 bytes, SHA-256 e65fe9c9c7da9b2c9cb42046b9c6210243139b01139f349839f2e5a17ee0f8ff (its manifest a3bf03eb…); or the one source record the generator selects: `artifacts/p13a/research-active/generated-laboratory.checkpoint.json`, SHA-256 151c8c14e1ec6f33a9d8f91c4049af00f53c15da1b11bd82e471b194923d1cff, week 261, with its provenance manifest (hashes from scripts/p13a-generate-review-library.ts, scripts/gen-playmode-embedded-wire.mts, docs/evidence/P13A-OWNER-PLAYTEST-ROUTE.md §Provenance, docs/campaigns/P13A-EXECUTION-LOG.md 2026-09-11 21:07 UTC) |
| Recorded origin | `/Users/bruce/The Movies - P13A Synchronized Sound TS/artifacts/p13a/…` on the P13A machine and user account; `artifacts/p13a/` is git-ignored in HSpector1/The-Movies and was never tracked (git log over all local refs: none) |
| Sources inspected this task (none before) | GitHub contents API for `artifacts/` and `artifacts/p13a` on the three P13A-era branches of HSpector1/The-Movies (wip/p13a-synchronized-sound-01-ts, docs/p13a-owner-feedback-closeout-01, docs/p13b-post-p13a-launch-preparation-01): 404, not tracked. HSpector1/project-studio-unity-visual-spike sprint15-consumer-20261028 `Evidence/P13A/`: six Markdown critiques and checkpoints only; the original-run directory `early-2026-09-11T20-17-08-939Z` is absent (404). HSpector1/mac-archive releases archive-2026-10-17, archive-2026-10-18 (no member-list assets) and archive-2026-10-29 (four member lists, downloaded to the session scratchpad and searched); HSpector1/strong-baby local-archive-2026-10-17 (no member-list asset). `/Users` on this Mac holds only `zacheryspector` and `Shared`; no `bruce` account. The newer `review-library-final` library (e3e7bb93…, 2,374,393 bytes) named in the P13A route document is a different file and not the generator's pinned input; it was not found either |
| Candidate containers | archive-2026-10-29 member lists hold top-level scratch directory names only (no paths). Entries that carry the P13A name: in `studio-scratch-1029-g1-13xx.tar.gz` (one part, 442,880,000 bytes, SHA-256 380362a5…) `1369-causal-p13a-original-recorded-runs-r1`, `-r2`, `-r3`, `1369-causal-p13a-original-proposal-r1` to `-r3`, and about twenty review and comparator directories; in `studio-scratch-1029-g2-1370.tar.gz` (one part, 181,729,280 bytes, SHA-256 a2fa286c…) `1370-ebg-p13a-clean-recorded-r4`. Whether any of them contains a copy of either file is unknown: the lists do not descend into directories, and a gzip tar stream cannot be listed or partially extracted without downloading the whole part |
| Verification | none possible without the whole-part download; no file was recovered, generated or substituted; the PlayMode manifest is unchanged |
| Disposition | **MISSING** on every inspected inventory; **ACCESS BLOCKED** for the only candidate containers, because confirming them means downloading and listing a 443 MB and a 182 MB archive part, which this order excludes (no whole scratch-archive restoration) |
| Consequence for new-host execution | M1b-P step (iii) cannot start from an identified file. It needs a separate authorization either to download and list the two archive parts into a staging location outside both checkouts (list only, then extract at most the two named files if present, verify the recorded hashes, retain nothing else), or to skip to step (iv), the bounded current-contract fixture proposal. Until then the 14 of 22 PlayMode files that read the embedded projection-32 wire are expected to stop at the schema check on the new host, and that limit is carried into M1a, M1b, M2 and M3 as written |

## Save48 captures (Sprint 24 journeys, P16 closure tests)

| | |
|---|---|
| Required input | `r04-pre162.save48.json` (cd11f369…, 1,124,940 bytes), `r04-actual163.save48.json` (c17b7aa8…, 1,137,150 bytes), `r04-archived176.save48.json` (94fa74df…, 1,173,791 bytes) and `CAPTURE-MANIFEST.json` (1,343 bytes, SHA-256 e7cf4625a1198ff2…), the disclosed drained-R04 transaction route captured at engine 67077b72 |
| Available source | `/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012/p16-original48-closure-capture-r2-run/` on this Mac (owner-only permissions); bound by the lane env file `studio-scratch/p16-c03-sprint1-20261025/p16-env.sh` (`P16_JOIN_PREC48_*`, `P16_JOIN_CLOSED48_*`). Not in any repository or archive release (by design: never copied into a repository) |
| Verification | all three SHA-256 values re-measured this task and MATCH the manifest and the env file |
| Disposition | **AVAILABLE** (on this Mac only) |
| Consequence | must be transferred to the new host by the Owner (a direct copy of the four files, outside any checkout), then re-bound in the env file and re-hashed before use; absent, the Sprint 24 journeys and the P16 closure tests are MISSING-INPUT there |

## Lane tooling

| | |
|---|---|
| Required input | bind.py, launch.sh, run.sh, compare-full.py, equipment-run-preflight-r3.py, lane-run-r8.sh |
| Available source | records `astra-sprints-22-26/sprint27/lane/sprint27-r2/` holds bind.py, launch.sh, run.sh, compare-full.py (SHA-256 compared with the staging originals this task: identical). equipment-run-preflight-r3.py (3,538 bytes, f10fae24…) and lane-run-r8.sh (3,361 bytes, aff8e974…) existed only in scratch (`1370-astra-takeover-20261012/`, `1370-c0-stage41-heavy-lane-recovery-proposal-r8/`); copied this task into `new-host-plan/lane-tools/` with SHA256SUMS |
| Disposition | **RECOVERED into the records** (all six) |
| Consequence | restore from the records on the new host; launch.sh and the preflight carry this Mac's paths, disk, power and lock thresholds, which must be rewritten for the host before any lane runs |

## Classification baselines

| | |
|---|---|
| Required input | full-tree-s26-r1 `core-including-bridge.json`, sprint20-r3 `bridge-tests.json`, sprint27-r2 `bridge-tests.json` |
| Available source | records: `astra-sprints-22-26/sprint26/lane/full-tree-s26-r1/`, `astra-sprints-17-21/sprint20/lane/sprint20-r3/`, `astra-sprints-22-26/sprint27/lane/sprint27-r2/` (present; the plan's §1G shorthand paths are resolved by this note) |
| Disposition | **AVAILABLE** (in the records) |
| Consequence | none; clone the records branch |

Not done: no whole-archive download, no cleanup, no deletion, no private save touched, no fixture generated, no manifest edited, no engine or Unity change.
