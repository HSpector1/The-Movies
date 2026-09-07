# P08–P10 FINAL VERIFICATION 02 — adjudication, corrections, successor pair, real-input completion

**Authorization:** `OPS-P08P10-FINAL-VERIFICATION-HANDOFF-01` (continuing `OPS-P08P10-CLOSE-GATES-01`
and the two-repairs disposition of 2026-09-06). Implementation ownership was released by the prior
lead (`P08-P10-TWO-REPAIRS-HANDOFF.md`); this record is the successor lead's completion of the
same bounded package: verify the preserved handoff → adjudicate every retained review finding → fix
the confirmed selection/input defects → complete the required real-input journeys on a governed
pair → independent review → deliver for Owner acceptance. No campaign / `main` movement; no P11,
Wire, or Radio; Real Builders remain P09-REQ-039 (separately deferred); no Owner acceptance is claimed.

**Status:** see §0 (kept current; every other section is written once and only appended to).

---

## 0. Status

_(filled at the end of the run — see the final block of this file)_

---

## 1. Handoff verification (2026-09-07, before any edit)

| Check | Result |
|---|---|
| TS worktree `/Users/bruce/The Movies - P08-P10 Stack TS` | branch `wip/p08-p10-autonomous-stack-01-ts` at `277dc48d9cec94d1d3ce992e6afbdb389173a1c0` (the published handoff commit), clean; remote `hspector-github` equal |
| Unity worktree `/Users/bruce/The Movies - P08-P10 Stack Unity` | branch `wip/p08-p10-autonomous-stack-01-client` at `039ece4945c6a313a8f2dc2b75b90181f9662056` (the WIP preservation tip), clean; remote `origin` equal |
| Docs-only tail | `a2baa1d..1ff018c` = 2 docs files; `1ff018c..277dc48` = the handoff doc only (verified with `git diff --stat`) |
| Tested build source | Unity `f760d5d` (parent of the WIP tip) × TS `a2baa1d`; `Builds/macOS/build-manifest.json` binds exactly that (dirty=false both) |
| Player executable on disk | `ab1fa09bfd1b8da00eab32bfc85c9208a53ae460f0c6c92ce70439439e212f1` ✓ (re-hashed); Assembly-CSharp `b647c5b36c382cc8e02e27c460232a315ad5bfddd6eb8215f5ecdfee4aa80777` ✓ |
| Engine bundle | `dist/studio/engine.mjs` = `189326b6fbd769bc9650d0ed43b92c9ba75c78565958f3074f4d5645605d065e` ✓; the Desktop candidate's `engine/engine.mjs` is the same bytes ✓ |
| Older Desktop candidate | `~/Desktop/P08-P10-Combined-Candidate-7b4d8ff-1d304f8` holds player `1358fd1f…` (Unity `1d304f8`) — a DIFFERENT player; never launched by any run in this record (every launcher hashes the exe it starts against the manifest) |
| Handoff prose error | the handoff commit message reverses "engine" and "player" in one sentence; the table above and every manifest/run-binding written here use the roles as listed (player = `ab1fa09b…` → successor `3558ddd4…`; engine = `189326b6…`) |
| Fable processes | none: no Unity player/editor, no `hid-chain`, no `ownerinput`, no proof driver running at start (`ps`); only this session's own CLI keep-awake |
| Frozen refs | `campaign/living-lot-ts` `2753e18ba8fb5f65b936c22cde9531646fecc6cd`, `campaign/living-lot-client` `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6`, TS `main` `c902a704…` — re-read on both remotes, untouched (re-verified after every push) |
| Private evidence | `Evidence/_TWO-REPAIRS-PRESERVATION-20260907/` (review brief, 33 raw attack findings, workflow journal, EditMode XML, logs) read in full; the three retained real-input runs read step by step |
| WIP helper `osReleaseInput` (`039ece4`) | inspected: it shells `Tools/input-state.py release`, an indiscriminate OS-level release of EVERYTHING held — correct for a stale synthetic key, wrong for a human's active key. **Disposition: REPLACED** by the owned-input guard (§3.2); the commit is preserved in history unchanged |

**Successor branches (created from the exact handed-off tips, pushed):**

| Repo | Branch | Base | Remote |
|---|---|---|---|
| TS | `wip/p08-p10-final-verification-02-ts` | `277dc48` | `hspector-github` |
| Unity | `wip/p08-p10-final-verification-02-client` | `039ece4` | `origin` |

The old WIP refs (`…-autonomous-stack-01-ts` @ `277dc48`, `…-autonomous-stack-01-client` @ `039ece4`)
stay as controls. The tested player `ab1fa09b…` is preserved as a control at
`Builds/control-ab1fa09b-f760d5d/` (ignored; with its manifest). Both successor branches were
checked out in the existing worktrees (a fresh Unity worktree would have required a full Library
re-import and would not carry the ignored Evidence/Builds); no other worktree, process, lock, or
profile was touched.

---

## 2. Adjudication of the interrupted review (all 33 retained findings)

The attack phase of workflow `wf_d42f92b7-83a` produced 5 MAJOR / 14 MINOR / 14 NOTE raw claims;
its refute/synthesis phases never ran. Every claim below carries a disposition with the source it was
checked against and how it was reproduced. Terms: **CONFIRMED** (reproduced), **CONFIRMED (doc)**
(a record inaccuracy), **REFUTED**, **WITHDRAWN** (superseded by facts that arrived later).

### 2.1 The five MAJOR claims

| # | Claim | Disposition | Evidence / reproduction | Action |
|---|---|---|---|---|
| A | §2.2 placement row cites exe `ab1fa09b…` for the 20:23:30Z run | **CONFIRMED (doc)** | `Evidence/P09-Placement-Final/p09-valid-placement-20260906T202330Z/{run-binding,build-manifest}.json` bind exe `65dfe3a9…` / Unity `c71ffff` (built 20:22:55Z); the retained final-pair run is `…202606Z` (exe `ab1fa09b…` / `f760d5d`, PASS) with its illegal companion `…202613Z` | Row corrected in `P08-P10-TWO-REPAIRS-2026-09-06.md` §2.2 using the retained actual runs; no new historical binding manufactured |
| B | Five real-input gates NOT RUN / "PENDING" at review time | **CONFIRMED at review time; WITHDRAWN as a gap** | the drives completed later: CONTRACT `hid-20260906T210520Z` exit 0 (PASS); PEOPLE `hid-20260906T203249Z` exit 2 — **the driver posted no world click at all** (its own filters rejected all eight aims: four off the window's left edge after the over-zoom, four under a HUD card; `screenPoint: null` on every attempt); BUILD `hid-20260906T211611Z` exit 2 (3 harness-timing/world-click failures; the commit and exact debit PASSED) | §4 / §4.2 of the two-repairs record rewritten with the actual results; the successor drives in §4 of this record supersede them |
| C | Placed-body occluder omits the drawn roof slab / rising roof | **CONFIRMED** | geometry re-derived (`scratchpad/roof-band-repro2.py` and an independent slab test): at the supported pose (centre+(0,22,−34), 32.9°) a person 5.9–6.8 m (operational) / 2.4–6.0 m (roof band 0.86–0.99) behind the north face is drawn hidden by the slab yet clear of the occluder; in-engine on the PRE-fix code `StudioPlacedBodyOcclusionTests.AnOperationalPlacedBody_HidesThePersonBehindItsDrawnRoofSlab` and `ARoofBandSite_HidesThePersonBehindItsRisingRoofSlab` FAIL (`picked 'p-behind-roof'` / `'p-behind-rising'`; `editmode-runA-oldcode-20260907T125406Z`) | **FIXED** (§3.1): `__OccluderRoof` mirrors the slab drawn this frame; selection envelope reaches the drawn roof top; both cases PASS on the fix |
| D | The 19:51 held-UP-arrow readout has no retained artifact | **CONFIRMED** | no `heldKeys`/`input-state` artifact exists anywhere under `Evidence/` before the 20:26Z sweep log; the only retained evidence of the class-C mechanism is the controlled reproduction on the same exe `1358fd1f…` (`P09-Placement-RootCause/…195458Z` FAIL under the held key → `…195532Z`, `…195538Z` PASS after release) plus the four-quote signature | Limitation preserved verbatim (the historical readout is NOT reconstructed); prospective capture added — every drive now writes `input-state-start.json` / `input-state-end.json` (and `input-state-release-*.json` when a stale key is released) into its evidence dir |
| E | Stage A barrel-roof x-ray is live at the NORMAL management views | **CONFIRMED** | ray derivation on the scene's collider dump (`scratchpad/roof/raytest.py`): from CAM-MGMT-POST-V1, CAM-MGMT-BARE-V1 and the home pose, the chest ray of **12/12** authored Stage A bodies meets no collider (it enters through the collider-free gable or crosses the barrel roof); the independent drawn-geometry oracle agrees (Kay Fenwick hidden by `stage-a` at 113.8 m); in-engine on the REAL scene, pre-fix, `StudioAuthoredRoofOcclusionTests` picks `t-dir-04` through the roof from CAM-MGMT-POST-V1 and from the scene home pose | **FIXED** (§3.1): MeshColliders on the barrel roofs and the gable (gable occluder closes the roof seam); 4/4 authored-roof cases PASS on the fix; doorway-visible control PASS before and after |

### 2.2 MINOR and NOTE claims (in the order of the retained findings file)

| # | Claim (abridged) | Disposition | Evidence / action |
|---|---|---|---|
| M1 | 19:51 readout not retained | = D | as D |
| M2 | P08/P09 run-bindings lack the engine bundle sha (20 of 46) | **CONFIRMED** | launchers now write `engineBundle` + `engineBundleSha256` (Unity `74cef3b`); the successor sweep binds all 46 |
| M3 | "892/892 at c71ffff" bound to a run 30 s before the commit; an intermediate 891/892 undisclosed | **CONFIRMED (doc)** | the intermediate runB (891/892) was the thin-wall control's epsilon issue (M9); the governing runs are the full suite at `f760d5d` (892/892) and now at the build commit `75de360` (899/899) |
| N1 | "verified against the Unity DTOs at f760d5d" wording | **CONFIRMED (doc)** | the check verifies the TS-side generated files; Unity copies are byte-identical — wording noted here |
| N2 | "nine different builds" not reproducible | **CONFIRMED (doc)** | six distinct executables across the two journey dirs; the material disclosure (none on `1358fd1f…`) holds |
| N3 | Baseline dir permissions 755 | **CONFIRMED** | parent and P06 baseline dirs tightened to 700 (local disk; nothing under Git) |
| N4 | ts-floor `clean=0` ambiguous | **CONFIRMED (doc)** | `clean=0` = zero porcelain lines = clean; the manifest's `dirty:false` is authoritative |
| M8 | AWalledSite fails on old code via NRE | **CONFIRMED** | the test now asserts the occluder's presence first (behavioural message); Unity `74cef3b` |
| M9 | AThinWall control capsule overlaps the wall by 0.14 m | **CONFIRMED** | person moved 0.5 m beyond the far face (capsule clear); Unity `74cef3b`; suite 899/899 |
| N5 | No transparency case | **CONFIRMED** (coverage) | no Default-layer transparent occluder exists in the presentation (transparent materials are used only by the build ghost/marks, which carry no collider); Ignore-Raycast path covered; recorded, not tested |
| N6 | Two coverage items assert by source-string | **CONFIRMED** | out of scope; noted |
| M12 | Hoarding rails, board, slab, posts, crew capsules drawn opaque without occluder | **CONFIRMED** | NOT fixed in this bounded repair; disclosed: a person standing inside a hoarded site behind the 2×1.1 m board (or with legs behind a 1.2 m rail from a low pitch) is pickable through those parts; authoritative people do not stand inside sites |
| M13 | No real-input evidence for the PLACED-body occluder | **CONFIRMED** | the P09 real-input fixture places a fresh site (progress 0, no occluder) on a lot with no authoritative people; the placed occluder is proven by EditMode on the real presenter (mass, walls, roof slab, rising roof) and by the sweep's p09 scenarios; real-input facade proof targets the AUTHORED Post (§4) |
| M14 | Human-Scale Inspection deoccluder now treats placed occluders as camera obstacles | **CONFIRMED (by design)** | consistent with authored buildings; disclosed together with the roof consequence (§3.3) |
| N7 | `Physics.autoSyncTransforms` off; occluder activated before posing | **CONFIRMED → FIXED** | pose, then activate (`df79153`) |
| N8 | Occluder centre not asserted; walled-site NRE | **CONFIRMED → FIXED** | `ThePlacedBodyRoofOccluder_MirrorsTheDrawnRoofSlab_InEveryBand` asserts centres for both occluders; M8 |
| N9 | Legacy Annex path is authored art | **CONFIRMED** | out of scope; noted |
| N10 | dimension verdict | n/a | — |
| M19 | Fresh-process read of a held synthetic key not mechanically demonstrated | **CONFIRMED** | wording kept precise ("the player read a stuck axis"); moot for this program's own drives: keys are ledgered and released by owner (§3.2) and every launcher refuses / records held OS input |
| M20 | "every failing run shows FOUR quotes" over-claims | **CONFIRMED (doc)** | accurate statement: every `notOwned`-signature failure shows four quotes and every four-quote run failed; the two 09-05 failures with 0 / 2 quotes were session/launch failures, not placement verdicts |
| M21 | Origin-hold assertion is point-in-time | **CONFIRMED** | accepted residual: the launchers refuse held input at start and the guard ledgers every key it presses |
| N11 | `run-binding.unityCommit` = HEAD at run time | **CONFIRMED** | every launcher now also writes `buildCommit` from the manifest (Unity `74cef3b`); the manifest beside each run remains the binding |
| M23 | Other opaque authored parts without colliders (Stage B loading canopy, Casting awning, elephant-door slabs, construction roof sheets, hedges, imported props) | **CONFIRMED (class)** | NOT fixed in this bounded repair beyond the roofs; the residual list is disclosed exactly as found (the largest: Stage B loading canopy 8×0.45×3.5 m over Reginald Trask's mark at pitches above ~52°) |
| M24 | Placed roof slab | = C | fixed |
| M25 | Squat cylinders keep a CapsuleCollider (fountain basin → r=2.6 sphere), an over-blocker | **CONFIRMED (geometry)** | NOT fixed here (a different class — a VISIBLE person unselectable at the fountain rim from the minimum pitch); disclosed with the exact objects: Administration Fountain Basin (5.2×0.55), Admin Planters (1.55×0.5), Hot Stage Beacon Base (1.1×0.75) |
| N12 | "no real doorstep person was ever inside a collider" inaccurate | **CONFIRMED (doc)** | bodies stand inside the Interior Floor / Foundation Slab colliders (feet ≈ 0.25–0.4 m); harmless for chest/head picks; sentence corrected by this note |
| N13 | Persons never occlude persons | **CONFIRMED** | consistent with the ranking law; a real person drawn behind a decorative extra is pickable through the extra; disclosed |
| N14 | Real-input gates NOT RUN at review time | = B | — |

---

## 3. Corrections

### 3.1 Product (Unity `df79153`, the build source is `75de360` = `df79153` + tools)

| Seam | Change | Why |
|---|---|---|
| `StudioArtFactory.BarrelRoof` / `BarrelGable` | Default-layer `MeshCollider` on the authored roof mesh (exactly as `Wedge` roofs already carry), excluded from the navigation BAKE (`NavMeshModifier ignoreFromBuild`); the Stage A gable's occluder rises to the roof sheet (width+1.8 × 6) — the cream arch trim covers that seam visually and a home-pose ray otherwise slipped between gable and roof | E |
| `StudioLotPlacedBody` / `StudioLotGrowthPresentation.Layout` | second Default-layer box `__OccluderRoof` sized to the slab drawn this frame (finished roof massX+0.4 × 0.3 × massZ+0.4 at height+0.15; rising roof massX+0.2 × 0.3 × massZ+0.2 at height−0.15), absent before the roof band; mass occluder posed before activation; root selection envelope reaches the drawn roof top (height+0.3 operational / height in the roof band) so a click on the roof selects the facility, not nothing | C, N7 |
| `StudioWorkspaceHost` diag (element-map-gated, observation only) | `camera.pose` (position, euler, fov, aspect, pixel size) and `seatedPersonBodyProbe.feet` | lets a proof decide drawn visibility independently of the pick |
| `StudioDrawnGeometryDump` (Editor only) | dumps every enabled MeshRenderer's world triangles + selection envelopes, bound to the scene SHA | the independent oracle's input |

**Scene regeneration (controlled, diff reviewed).** `BuildCanonicalScene` is content-deterministic but
renumbers fileIDs: a no-change regeneration of the committed scene is a 406,148-line `git diff`.
The generated diff was therefore reviewed semantically with `Tools/scene-semantic-diff.py`
(GameObjects by hierarchy path; components with every fileID reference resolved to its target;
scene meshes by name/size/data hash), validated **IDENTICAL** on the no-change regeneration, then
applied to the fixed regeneration: 2643 GameObjects → 0 added, 0 removed, **7 changed** — Barrel Roof,
Front Barrel Gable, Stage B Barrel Roof, Scenery Shop Roof and the two active Trailer Roofs gain
`MeshCollider` + `NavMeshModifier(ignoreFromBuild)`, the Basecamp Honeywagon roof (its state group
strips colliders) gains only the modifier; **4 new meshes** (the roof colliders' authored meshes,
which static batching had folded away). Navigation: all 40 tiles' polygon and vertex data are
byte-identical to the committed bake (parsed tile by tile); the asset differs only in the 16-byte
per-tile hash preceding each tile header (287 bytes). The sealed triangulation did not move.

**EditMode.** New cases: `StudioAuthoredRoofOcclusionTests` (opens the REAL canonical scene; seats the
12 authored Stage A bodies as persons; decides drawn visibility with its own ray/triangle walk over
the Stage A meshes; asks `ResolvePick` from CAM-MGMT-POST-V1, CAM-MGMT-BARE-V1 (190 m requested and
155 m clamped) and the scene's home pose; a low south pose proves the doorway-visible company stays
selectable; a structural case checks every roof occluder) and three placed-body roof cases. Pre-fix:
**6 / 17 FAIL** on exactly the defect cases (`editmode-runA-oldcode-20260907T125406Z`). Post-fix, full
suite at the build commit `75de360`: **899 / 899** (`editmode-final-20260907T131857Z`); after the test
adjustments of `74cef3b`: **899 / 899** (`editmode-final2-20260907T132458Z`).

### 3.2 Real-input harness (Unity `75de360`, `5193986`, `74cef3b` — tools only)

- **Owned input** (`Tools/hid-guard.mjs`): every key the driver presses is ledgered and released on
  completion, error, timeout or abort — only what the driver holds. A synthetic HID event resets the
  OS idle counter (measured: a synthetic move reset `HIDIdleTime` to 329 ms), so foreign — human —
  input is detected as an idle reset the driver did not cause; on detection the drive suspends
  (exit 3), releases its own keys, and never touches a human's keys or clicks into another
  application. Window / backing-scale / frontmost / OS-held-key binding is verified before every
  world click.
- **Launchers**: the OS input state is captured before anything is touched; a held key is released
  only after the owner-idle gate (a stale synthetic key by construction, never a human's) with
  before/after retained; cleanup releases only the driver's ledger (`input-state.py release-keys`);
  stale-source refusal covers the scene file; the drawn-geometry dump is bound to the scene SHA;
  run-bindings carry the guard/oracle/input-state tool hashes, the build commit and the engine hash.
- **Independent visibility** (`Tools/drawn-visibility.py` over `Tools/dump-drawn-geometry.sh`): the
  proof casts its own ray from the published camera pose against the scene's drawn triangles and
  answers hidden/visible and WHICH selectable envelope contains the hiding surface; self-checked
  against the in-engine test (Kay Fenwick hidden by `stage-a` at 113.8 m in both), the Post doorway
  person (visible) and the probe's sample 2 (hidden by `post`).
- **People driver** (`Tools/p10-proof-people.mjs`, rewritten): reactive framing with short arrow
  taps (down+up inside the tool; never a held key a focus flicker can strand), a wider zoom (target
  32 px, not 44), a click only on a still (≥250 ms), in-window, HUD-clear rect read ≤150 ms earlier
  under a verified binding and with the oracle's *visible* verdict; the facade case frames the Post
  actively and clicks only when the oracle says the chest is hidden by a selectable building (the
  host's own probe recorded beside it, never relied upon); every attempt records aim, rect, pose,
  probe, oracle answer, binding and the exact selection read back.
- **Build driver** (`Tools/p09-proof-build.mjs`): the same owned input; the BUILD chip and the
  first-preview commit button are read only once the state is consistent (both failures of the
  two-repairs run were harness timing); the post-Load site re-select is a still, HUD-clear click
  verified against the host's selection.
- The WIP helper `osReleaseInput` (`039ece4`) is not wired: its blind OS-level release is exactly
  what the order forbids for a human's active keys.

### 3.3 Behaviour consequences disclosed (not defects, but changes a reviewer must know)

- **Stage inspection camera (StageSeven profile).** Its deoccluder collides against Default, so the
  barrel roof is now an obstacle for that orbit. The profile's target sits at y≈3.35 inside the
  stage; with distance ≤30 m and pitch ≤42° the camera could previously climb above the roof
  (height > 15 m from pitch ≈23° at 30 m), where it saw only the roof's opaque exterior (the sheet is
  single-sided, outward-facing). Now the deoccluder pulls the camera under the roof so the interior
  stays in view. The entry pose (camera y≈2.05, inside) is unchanged. Recorded as a change; judged an
  improvement consistent with "occlusion follows what is drawn".
- **Human-Scale Inspection deoccluder** likewise treats placed occluders (mass, walls, roof slab) and
  the roofs as obstacles (M14).

---

## 4. Final gate table — successor pair

_(filled as the runtime queue completes; PASS / FAIL / BLOCKED / NOT RUN kept distinct; nothing is
converted across evidence classes)_

### 4.0 Runtime execution trail (append-only; every attempt retained, nothing relabelled)

All runtime work ran behind the desktop safety gate (600 s Owner-idle, console unlocked) from detached,
logged queue runners; the Owner was actively using the machine when the queue was armed, so the first
gate opened at 13:56Z.

| When (UTC) | Stage | Outcome | Cause / disposition |
|---|---|---|---|
| 13:56–14:04 | Oracle sweep, 46 runs (`Evidence/P10-Oracle-Sweep-FinalVerification02/`) | **26 P10 runs (6 scenarios × 4 viewports + Owner-profile copy × 2): exit 0, sidecars complete, every run-binding = exe `3558ddd4…` / build `75de360` / engine `189326b6…`.** 20 P08/P09 runs: the oracle completed (sidecars `complete`) but the launcher aborted at its binding step (`ENGINE_BUNDLE: parameter not set`) before writing `run-binding.json` — an unset-variable bug in the launcher change of `74cef3b` | Launchers corrected (`08b7be4`, `bcc1af9`, `33d551b`: the P08/P09 launchers define and launch the bound engine bundle); the 20 scenarios are re-run as stage 2 into the same sweep directory (`summary-p08p09-rerun.tsv`); the unbound first runs stay on disk as history only |
| 14:14 | PEOPLE drive #1 (`P10-Journey-FinalVerification02/hid-20260907T140457Z`) | **SUSPENDED (exit 3)** 36 s in, 42 injected events, during framing: "OS idle 119 ms but our last event was 1545 ms ago"; player frontmost; OS held nothing | The guard did what the order requires; root cause found later (below): the flag followed the driver's own player activation |
| 14:27 | CONTRACT drive #1 (`P10-Contract-Journey-FinalVerification02/hid-20260907T141542Z`) | **SUSPENDED (exit 3)** 5 events in: "idle 1034 ms but our last event 2175 ms ago" | **False positive, harness:** the driver's un-stamped `ownerinput releasemods` posts modifier key-ups through the HID tap and resets the OS idle counter (measured in isolation: 71 s → 720 ms). Fixed `2a98d6b` (stamped guard event) |
| 14:36 | BUILD drive #1 (`P09-Journey-FinalVerification02/hid-20260907T142558Z`) | **SUSPENDED (exit 3)** after 17 events at the deselect key, with the whole material chain already proven on the successor pair: BUILD chip offered (visible+enabled), Administration card → OPEN BUILD → parcel → catalogue → preview answered **Valid site** with the commit enabled, commit at (11,14) with the exact $1,500,000 debit (20,000,000 → 18,500,000), Esc peels one layer each, real world click selects `placed-1`. Save/Load/post-Load re-select NOT reached | **Harness-caused idle reset:** every flag followed the driver's own `activate()` on the player (activation of Code/Finder does not reset the counter; activating the Unity player evidently can). Fixed `738cafa`: activation is a stamped guard event, performed only when the player is not already frontmost, in the driver and in the launcher's 3-second loop (which now stamps a file the guard reads). All three drives are re-run (stages 3–5) |
| 14:52–15:03 | P08/P09 re-sweep, 20 runs (stage 2, corrected launchers; `summary-p08p09-rerun.tsv`) | **20 / 20 exit 0**, sidecars complete, every run-binding = exe `3558ddd4…` / build `75de360` / engine `189326b6…` (verified per run). Sweep total on the successor pair: **46 / 46** (26 P10 incl. the Owner-profile copy ×2, 12 P09 incl. `p09-valid-placement` and `p09-invalid-placement`, 8 P08) | Gate rows in §4.1 |

---

## 5. Identities

| Item | Value |
|---|---|
| Successor Unity build commit | `75de360e0fe2f1e5e0173cea63d00497c23c3eb3` (clean, dirty=false; = product `df79153` + tools `75de360`) |
| Later Unity tools/tests-only commits (no player change) | `5193986` (executable bits), `74cef3b` (test adjustments, launcher bindings) |
| Successor player executable SHA-256 | `3558ddd457a423308bb605105e9884f7da479658ece168b883d5e0d41bc297bf` (built 2026-09-07T13:19Z, `Builds/macOS/build-manifest.json`) |
| Successor Assembly-CSharp SHA-256 | `5fc346cb28dc4ee6f9ed4405c3feb980e3b484bdab41aec0d9963e4cc05e9230` |
| Engine bundle SHA-256 (unchanged) | `189326b6fbd769bc9650d0ed43b92c9ba75c78565958f3074f4d5645605d065e` (TS product `a2baa1d`; TS repo has no product change in this record — docs only) |
| Canonical scene SHA-256 (built) | `1662991108a1b8cfabe00651c2e8f6be42a33af3313ecb76b058d1bcb08bc9c6` |
| Drawn-geometry dump | `Builds/macOS/drawn-geometry.bin` (255,490 triangles, 1,194 groups, 20 envelopes; bound to the scene SHA above) |
| Schema / protocol / save | `6a2c01fe…` (projection 19) / 4 / V18 — unchanged |
| Control player | `ab1fa09b…` (Unity `f760d5d`) at `Builds/control-ab1fa09b-f760d5d/` |
