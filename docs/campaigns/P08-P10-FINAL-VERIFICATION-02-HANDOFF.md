# P08–P10 FINAL-VERIFICATION-02 — release handoff (2026-09-07 ≈18:45Z)

**Order:** CURRENT OPS — PRESERVE THE NEW CANDIDATE AND YIELD. Implementation and runtime ownership of the
P08–P10 close-gates package is released by the FINAL-VERIFICATION-02 lead to the foundation-recovery lead.
Nothing below is Owner acceptance. Full record: `P08-P10-FINAL-VERIFICATION-02.md`; independent review
(verbatim): `P08-P10-FINAL-VERIFICATION-02-REVIEW.md`; campaign checkpoint C11: `P08-P10-AUTONOMOUS-STACK-HANDOFF.md`.

## Branch tips (pushed; worktrees clean; remotes equal)

| Repo | Branch | Tip |
|---|---|---|
| TS `HSpector1/The-Movies` (remote `hspector-github`), worktree `/Users/bruce/The Movies - P08-P10 Stack TS` | `wip/p08-p10-final-verification-02-ts` | `d3df780852073b654ddf0869408a9b1f63b19a17` + this handoff commit (see `git log -1`) — docs only on top of the preserved WIP `277dc48d9cec94d1d3ce992e6afbdb389173a1c0` |
| Unity `HSpector1/project-studio-unity-visual-spike` (remote `origin`), worktree `/Users/bruce/The Movies - P08-P10 Stack Unity` | `wip/p08-p10-final-verification-02-client` | `7e3813adfdf88b25bb3fe5b1f4711108a424a21c` on top of the preserved WIP `039ece4945c6a313a8f2dc2b75b90181f9662056` |

## Build-source commits of the candidate (pair 2)

| Artifact | Source commit | Hash |
|---|---|---|
| Player `Project Studio Visual Spike.app` | Unity **`574339da31faaef06e116701e54a58440a4e7a20`** (dirty=false; built 2026-09-07T17:10:31Z) | exe `f678cf539d067ab562d064458f6aef316fe61fabf0ba87cbf2c92e670ca9a9b0`, Assembly-CSharp `75217bf0b00da3b3…` (full value in the manifest) |
| Engine `engine.mjs` (sealed projection 19) | TS product **`a2baa1d9b3ffb2666732dba55823e09cc76c7352`** (unchanged through this campaign; the manifest's `typescript.sha` `f5363083…` is the docs-only worktree head at manifest time, `typescript.dirty: true` = docs-only) | `189326b6fbd769bc9650d0ed43b92c9ba75c78565958f3074f4d5645605d065e` |
| Scene / drawn-geometry dump | `Assets/Studio/Scenes/StudioLot.unity` at `574339da31` (unchanged since `df79153`) | scene `1662991108a1b8cfabe00651c2e8f6be42a33af3313ecb76b058d1bcb08bc9c6` |

Product commits in the chain: `df79153` (roof occluders, MAJOR C/E) and `574339da31` (defect F: UI root picking mode
restored after the Studio Menu). Everything else on the Unity branch is tools/tests only.

## Later tool / documentation commits (after the pair-2 build; no player change)

- Unity tools: `41d94eb` (pair-2 drive corrections), `3226130` (HID guard whole-stream foreign check + witness audit),
  `b81dc0a` (people driver HUD-free-zone framing), `7e3813a` (witness binary hash bound at launch). Earlier tools-only
  commits `75de360`…`d849a43` are listed in the record §5.
- TS docs: `c7935ea`, `286f6fb`, `6632cae`, `f536308`, `22e82bb`, `d3df780`, and this handoff.

## Candidate and evidence paths (preserve; do not rebuild or alter in place)

- **Candidate:** `/Users/bruce/Desktop/P08-P10-Combined-Candidate-f536308-574339d/` — `player/` (app + `build-manifest.json`
  + `drawn-geometry.bin(.json)`), `engine/engine.mjs`, `saves/` (the eight fixture checkpoints; **no Owner profile copy is
  in the candidate** — the Owner-profile private-copy runs are inside the sweep evidence and the real profile
  `d949003e…` was never opened for writing), `docs/` (record, review, campaign handoff, prior records), `proof/` (harness
  tools), `evidence/` (below), `playtest.sh` (verified 17:46Z), `PLAYTEST-README.md`, `CANDIDATE.json`,
  `INVENTORY.sha256` (2,218 files; `shasum -a 256 -c INVENTORY.sha256` all OK at 18:38Z).
- **Pair-2 gate evidence (the runs every gate is judged on)** — canonical copies under the Unity worktree (git-ignored)
  `/Users/bruce/The Movies - P08-P10 Stack Unity/Evidence/`, mirrored in the candidate `evidence/`:
  `P10-Oracle-Sweep-FinalVerification02-Rebuild/` (46 runs) → `sweep-pair2`;
  `P04A-Camera-Proof-FinalVerification02-Rebuild/camera-autoproof-20260907T171652Z` → `camera-autoproof-pair2`;
  `P10-Journey-FinalVerification02-Rebuild/hid-20260907T172822Z` (gate run; `hid-20260907T182348Z` = proof-of-harness)
  → `people-journey-pair2`; `P10-Contract-Journey-FinalVerification02-Rebuild/hid-20260907T173250Z` → `contract-journey-pair2`;
  `P09-Journey-FinalVerification02-Rebuild/hid-20260907T173427Z` → `build-journey-pair2`;
  index `docs/campaigns/evidence/P08-P10-FINAL-VERIFICATION-02-evidence-index-pair2.json`.
- **Pair-1 diagnosis history** (never counted for a gate, never relabelled): `Evidence/*-FinalVerification02/` →
  candidate `evidence/pair1-*-history` (incl. `pair1-build-history-defectF`); EditMode XMLs → `evidence/editmode/`;
  scene regeneration diff → `evidence/scene-regeneration/`; the two-repairs preservation set
  `Evidence/_TWO-REPAIRS-PRESERVATION-20260907/`.
- **Controls untouched:** control player `ab1fa09b…` at `Builds/control-ab1fa09b-f760d5d/`; previous candidate
  `~/Desktop/P08-P10-Combined-Candidate-7b4d8ff-1d304f8/` (player `1358fd1f…`).
- **Superseded pair-1 binary — UNAVAILABLE, not preserved:** the `75de360` player (exe `3558ddd457a4…`, Assembly
  `5fc346cb28dc…`) was overwritten in `Builds/macOS/` by the pair-2 build. Its hashes and manifest copies live in every
  pair-1 evidence dir; it can only be rebuilt from `75de360`, not byte-guaranteed.

## The seven review exceptions and Current Ops disposition

Raised by the independent reviewer (`…-REVIEW.md` §6), recorded for Current Ops; **no disposition has been issued to
this lead — all seven stand PENDING with Current Ops**: e1 placed-facility occluder proven by EditMode/oracle/sweep
+ the authored-Post real-input facade (no real-input placed-facility click); e2 EditMode XMLs bound to `574339da31`
by timing (≤4 min) and commit content, not a stamped re-run; e3 TS-floor / Owner-copy / compat logs carried from
`a2baa1d` on the byte-identical engine, plus the docs-only `typescript.dirty:true` manifest; e4 whether the
Stage-inspection orbit band (§3.3) must be observed before acceptance; e5 collider-less authored / hoarding parts and
squat-cylinder over-blockers as a separately scheduled authoring item; e6 pair-2 real-input gates accepted on the raw
witness logs (0 physical events, scanned whole) without re-running under the `3226130` guard (exercised once by the
proof-of-harness drive `hid-20260907T182348Z`); e7 the two dropped CONFIRM clicks (`171809Z`, pair-1 `155718Z`) with
cause not established.

## Outstanding foundation-audit work (not started by this lead)

1. Input-routing foundation: an audit of every path that suppresses or hands back UI/world input beyond the Studio
   Menu (discard confirmations, Locate suspension, workspace open/close) for the defect-F pattern — only
   `SetPanelInputSuppressed` was corrected.
2. Element-map foundation: IMGUI panel bodies (PROJECT panel, clock strip, roster, LOT SELECTION) are unpublished;
   the drivers compensate with a measured zone — the host could publish them.
3. Dropped CONFIRM click cause (host per-poll actions-paused gate vs harness pointer timing) — e7.
4. EditMode result ↔ commit stamping (M3 class recurred three times) — a tooling foundation item — e2.
5. Collider-less authored parts, hoarding, squat cylinders (M12 / M23 / M25) — e5.
6. Stage-inspection orbit band observation at high pitch (§3.3) — e4.
7. Real-input placed-facility occlusion click (M13) — e1.
8. Real Builders — P09-REQ-039, separately deferred.

## Release

Owned processes: none running at release (verified); synthetic input: the owned-input ledger is empty and the OS
reports no held key or button, so nothing was posted to release. The Owner's keep-awake and unrelated applications
were not touched. Campaign refs `2753e18b…` / `c4c65db4…`, `main` `c902a704…`, the old WIP refs, the controls and the
real Owner profile `d949003e…` re-read unchanged at 18:29Z. No campaign/main movement, onboarding activation or P11.

**IMPLEMENTATION AND RUNTIME OWNERSHIP RELEASED TO THE FOUNDATION-RECOVERY LEAD.**
