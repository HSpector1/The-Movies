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

**COMBINED P08–P10 TECHNICAL KEEP FOR AUTHORIZED READY SCOPE — MANDATORY TECHNICAL GATES COMPLETE — OWNER ACCEPTANCE PENDING**
(written 2026-09-07 ≈17:45Z; **independent reviewer's disposition (phase-2 workflow `wf_7957fa0e-1fc`, four
lenses → adversarial refutation → one final reviewer, verbatim in `P08-P10-FINAL-VERIFICATION-02-REVIEW.md`):
the same KEEP wording, conditioned on record corrections that are applied below (§3.3, §3.4, §3.5, §4.0, §4.1
disclosures, §5) and carrying seven exceptions e1–e7 for Current Ops (its §6: placed-facility real-input click,
EditMode-by-timing binding, carried TS-floor evidence + docs-dirty manifest, the un-observed Stage orbit band,
collider-less authored parts, the guard's pre-`3226130` slack, the two dropped CONFIRM clicks with cause not
established). The one MAJOR that pointed at the product (a receipt without authority in `171809Z`) was refuted
from the frames; the two standing MAJORs are harness/record defects, corrected in tools commits `3226130` /
`b81dc0a` / `7e3813a` after the pair-2 runs and disclosed here. Nothing here is Owner acceptance.)

- **Governed final pair (pair 2):** Unity **`574339da31`** (dirty=false) / player **`f678cf539d067ab562d064458f6aef316fe61fabf0ba87cbf2c92e670ca9a9b0`** /
  Assembly-CSharp `75217bf0…` / engine **`189326b6…`** (TS product `a2baa1d`, unchanged) / scene `16629911…` (unchanged, dump bound).
- **Every mandatory gate PASS on pair 2 by real OS input under the owned-input guard** (§4.1 G1–G13): the three
  journeys (PEOPLE `hid-20260907T172822Z` 0 failures; CONTRACT `hid-20260907T173250Z` 0 failures; BUILD
  `hid-20260907T173427Z` 0 failures, and `hid-20260907T172423Z`, every mandated step incl. the post-Load real site re-select), the 46-run oracle sweep,
  the Stage-inspection camera auto-proof, EditMode 900 / 900 with pre-fix controls.
- **Confirmed defects with root-cause fixes:** MAJOR E (Stage A barrel roof / gable x-ray) and MAJOR C (placed-body
  roof slab) — product `df79153` (§3.1); **defect F** (world input dead after the Studio Menu closes — Save / Load /
  Resume — pre-existing since P04A.1, found by the real-input BUILD journey) — product `574339da31` (§3.5). The
  five MAJOR review claims: A refuted (record error, corrected), B remediated (harness), C confirmed + fixed,
  D preserved as a limitation + captured prospectively, E confirmed + fixed (§2.1); all 28 MINOR / NOTE items
  dispositioned (§2.2).
- **Harness truths learned and encoded (§3.4):** the player posts a null HID event every ≈9 s (listen-only witness +
  attribution); the tycoon yaw clamps at ≈90°; world rects are renderer AABBs; HUD panels are unpublished; tool
  hashes are taken at launch. No proof-only advantage was introduced (ordinary taps, wheel, right-drag orbit only).
- **Protected:** campaign refs `2753e18b…` / `c4c65db4…`, `main` `c902a70`, the old WIP refs `277dc48` / `039ece4`, the
  control player `ab1fa09b…`, the intermediate candidate, and the real Owner profile `d949003e…` — all unchanged
  (verified 17:38Z). No P11 / Wire / Radio; Real Builders remain P09-REQ-039.
- **Not done / caveats:** the pair-1 player binary was overwritten by the pair-2 build (hashes + manifests retained);
  the TS worktree was dirty (docs only) when the manifest was written (`typescript.dirty: true`); one pair-1
  run-binding is reconstructed and one carries a hash caveat (§4.0 16:37 / 16:57); the people driver's retries in `172023Z` were clicks into the unpublished PROJECT panel (recorded as
  retries; the counted run `172822Z` landed first time with the pointer over the world); the pair-1 roof-edge probe/oracle disagreement is a NOTE for the reviewer.

---

## 1. Handoff verification (2026-09-07, before any edit)

| Check | Result |
|---|---|
| TS worktree `/Users/bruce/The Movies - P08-P10 Stack TS` | branch `wip/p08-p10-autonomous-stack-01-ts` at `277dc48d9cec94d1d3ce992e6afbdb389173a1c0` (the published handoff commit), clean; remote `hspector-github` equal |
| Unity worktree `/Users/bruce/The Movies - P08-P10 Stack Unity` | branch `wip/p08-p10-autonomous-stack-01-client` at `039ece4945c6a313a8f2dc2b75b90181f9662056` (the WIP preservation tip), clean; remote `origin` equal |
| Docs-only tail | `a2baa1d..1ff018c` = 2 docs files; `1ff018c..277dc48` = the handoff doc only (verified with `git diff --stat`) |
| Tested build source | Unity `f760d5d` (parent of the WIP tip) × TS `a2baa1d`; `Builds/macOS/build-manifest.json` binds exactly that (dirty=false both) |
| Player executable on disk | `ab1fa09bfd1b8da00aeab32bfc85c9208a53ae460f0c6c92ce70439439e212f1` ✓ (re-hashed); Assembly-CSharp `b647c5b36c382cc8e02e27c460232a315ad5bfddd6eb8215f5ecdfee4aa80777` ✓ |
| Engine bundle | `dist/studio/engine.mjs` = `189326b6fbd769bc9650d0ed43b92c9ba75c78565958f3074f4d5645605d065e` ✓; the Desktop candidate's `engine/engine.mjs` is the same bytes ✓ |
| Older Desktop candidate | `~/Desktop/P08-P10-Combined-Candidate-7b4d8ff-1d304f8` holds player `1358fd1f…` (Unity `1d304f8`) — a DIFFERENT player; never launched by any run in this record (every launcher hashes the exe it starts against the manifest) |
| Handoff prose error | the handoff commit message reverses "engine" and "player" in one sentence; the table above and every manifest/run-binding written here use the roles as listed (player = `ab1fa09b…` → successor `3558ddd4…`; engine = `189326b6…`) |
| Fable processes | none: no Unity player/editor, no `hid-chain`, no `ownerinput`, no proof driver running at start (`ps`); only this session's own CLI keep-awake |
| Frozen refs | `campaign/living-lot-ts` `2753e18ba8fb5f65b936c22cde9531646fecc6cd`, `campaign/living-lot-client` `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6`, TS `main` `c902a704…` — re-read on the remotes, untouched (re-verified after every push); the Unity remote advertises no `main` ref at all (its refs are the campaign/WIP branches), so "main untouched" is a TS statement |
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
| C | Placed-body occluder omits the drawn roof slab / rising roof | **CONFIRMED** | geometry re-derived (`scratchpad/roof-band-repro2.py` and an independent slab test): at the supported pose (centre+(0,22,−34), 32.9°) a person 5.9–6.8 m (operational) / 2.4–6.0 m (roof band 0.86–0.99) behind the north face is drawn hidden by the slab yet clear of the occluder; in-engine on the PRE-fix code `StudioPlacedBodyOcclusionTests.AnOperationalPlacedBody_HidesThePersonBehindItsDrawnRoofSlab` and `ARoofBandSite_HidesThePersonBehindItsRisingRoofSlab` FAIL (`picked 'p-behind-roof'` / `'p-behind-rising'`; `editmode-runA-oldcode-20260907T125501Z`; the earlier attempt `…125406Z` did not compile — a `staticBatchRootTransform` reference in the new test — and left no XML) | **FIXED** (§3.1): `__OccluderRoof` mirrors the slab drawn this frame; selection envelope reaches the drawn roof top; both cases PASS on the fix |
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
| M23 | Other opaque authored parts without colliders (Stage B loading canopy, Casting awning, elephant-door slabs, construction roof sheets, hedges, imported props) | **CONFIRMED (class)** | NOT fixed in this bounded repair beyond the roofs; the residual list is disclosed exactly as found (the largest: Stage B loading canopy 8×0.45×3.5 m over Reginald Trask's mark at pitches above ~52°); **added by the phase-1 review:** the Stage A Interior Grid Ceiling (39×0.24×30 at y 14.55) and its five Ceiling Grid Beams are drawn opaque with no collider — from outside they are now masked by the roof/gable occluders (the gable occluder's extension to the roof sheet, 43.8×6 vs the drawn 42×5.75, closes the seam the cream arch trim covers only near the crown and that the ceiling grid and wall tops close visually toward the eaves); from inside the roof void they remain a drawn-opaque non-occluder |
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
byte-identical to the committed bake (parsed tile by tile); the asset differs only in the 16-byte hash block preceding the tile headers (287 bytes across 18 of the 40 tiles, including far-west tiles unrelated to any roof — a build-input hash, not geometry). The sealed triangulation did not move.

**EditMode.** New cases: `StudioAuthoredRoofOcclusionTests` (opens the REAL canonical scene; seats the
12 authored Stage A bodies as persons; decides drawn visibility with its own ray/triangle walk over
the Stage A meshes; asks `ResolvePick` from CAM-MGMT-POST-V1, CAM-MGMT-BARE-V1 (190 m requested and
155 m clamped) and the scene's home pose; a low south pose proves the doorway-visible company stays
selectable; a structural case checks every roof occluder) and three placed-body roof cases. Pre-fix:
**6 / 17 FAIL** on exactly the defect cases (`editmode-runA-oldcode-20260907T125501Z`; the first attempt `…125406Z` failed to compile and produced no XML). Post-fix, full
suite at the build commit `75de360`: **899 / 899** (`editmode-final-20260907T131857Z`); after the test
adjustments of `74cef3b`: **899 / 899** (`editmode-final2-20260907T132457Z`, started 13:25:07Z on the working tree that was committed as `74cef3b` at 13:25:42Z — bound by timing and by the 9-line test diff, not by a HEAD stamp).

**Iteration trail (every EditMode run retained in the session scratchpad `unity/`):** runA `…125406Z` compile error (no XML); runA `…125501Z` pre-fix 17 tests, 6 FAIL (the defect cases); runB `…130410Z` post-fix 26 tests, 2 FAIL (home-pose seam x-ray via the gable/roof gap; the operational roof-slab case picked nothing because the selection envelope stopped at the mass top); runC `…130952Z` 1 FAIL (the seam) → gable occluder extended to the roof sheet; runD `…131408Z` 25/26 and full `…131408Z` 898/899 — the structural roof test's bounds expectation failed on the deliberately taller gable occluder and was widened to judge the gable against the gable AND the roof it crowns (the extension itself is the correction, see §3.1); final `…131857Z` 899/899 at the build commit; final2 `…132457Z` 899/899 after the two test adjustments of `74cef3b`.

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
  single-sided, outward-facing). Now the deoccluder is expected to keep the camera under the roof. The entry pose (camera y≈2.05,
  inside) is unchanged and was observed on pair 2 (G10: entry, frame, return, no displacement). **The orbit band
  at high pitch was NOT observed on either pair** — this paragraph is a disclosure of a predicted behaviour
  change, not a verified improvement (reviewer exception e4 for Current Ops / the Owner playtest).
- **Human-Scale Inspection deoccluder** likewise treats placed occluders (mass, walls, roof slab) and
  the roofs as obstacles (M14).

### 3.4 Harness discovery during the evening runs — the player's own periodic HID null event (tools only)

- **What was seen.** With the Owner away (idle gate lowered to 60 s on the Owner's explicit instruction at
  15:54Z, the human-input guard unchanged), drives kept suspending on "OS idle ≈0.8–1.1 s but our last event
  ≈1.8–2.2 s ago" with the player frontmost and nothing held — the same signature as the unexplained people
  drive #2 of the afternoon. A read-only `HIDIdleTime` sampler showed no resets at all on the quiet desk
  (67 s uninterrupted) and none under `caffeinate -dimsu` alone (74 s), but a **strictly periodic reset every
  ≈9 s while the player ran**, even with no driver at all (the camera auto-proof, which injects nothing).
- **Who posts it.** `Tools/hidwitness` (new; a LISTEN-ONLY `CGEvent` tap at the HID level, writing one JSON
  line per event with the posting process id) identified the source: the **player process itself posts a
  `null` `CGEvent` (type 0, zero deltas) about every 9 s** (`sourcePid` = the player's pid, e.g. 75007 on the
  camera auto-proof, 91686 on the 16:17Z build drive: 8 null events in 75 s). `HIDIdleTime` counts it like a
  touch. Nothing else on the desk posts events; each `ownerinput` invocation also posts one null event
  beside its real event (harmless, before the guard's own stamp).
- **Correction (`hid-guard.mjs`, launchers, drivers).** The launchers now start the witness before the drive
  and retain its log as `hid-witness.jsonl` in the evidence dir (a human's keystrokes are never recorded: for
  a physical device — `sourcePid` 0 — the keycode is masked at the source). On a suspected foreign idle
  reset the guard attributes it from the witness **before** suspending: only the player's own null events →
  benign (counted as `witnessed.playerNullEvents` / `attributedChecks` in the report and logged per check);
  a physical-device event, or any event from a process other than the tool/launcher after the guard's last
  stamp → suspend. **Limitation of that revision (reviewer MAJOR 2):** the witness was consulted only when the
  idle counter looked suspicious, and the counter carries a ≈0.9 s slack after the guard's own injection — a
  physical touch inside that window was neither flagged nor counted (it happened once, in the pair-1 diagnosis
  run of 16:23Z, see §4.0). From `3226130` the guard scans the witness on every check; the pair-2 counted runs
  were audited whole-log after the fact (§4.1 disclosures: 0 physical-device events in all seven). The
  15:56Z and 15:57Z contract suspensions, by contrast, were genuine foreign mouse events (the second spoiled
  the CONFIRM click: the sheet stayed open, uncommitted, and the desk went quiet 11 s later) — the guard was
  right both times.
- **Driver corrections found by the runs (all harness, none product):** (1) `underUiAt` in the people and
  build drivers treated the full-screen UI Document root (`type: UIDocumentRootElement`, whose picking mode is
  published separately) as HUD cover, so the build driver's still-click loop panned for ever; (2) the build
  driver's site click could pass on a selection the commit had already left in place — it now clears the
  selection first and requires the click itself to select; (3) a miss whose pick resolved ANOTHER body
  (`selection=admin`: from the management pose the gate-court site stands behind Administration, and the
  picker is right to refuse the hidden one) now triggers an ordinary orbit — one right-button drag over the
  world, the exact gesture `StudioCameraInput` reads as orbit, added to `ownerinput` as `rightdrag` — and a
  miss that picked nothing triggers an ordinary wheel zoom-out whose sense is measured on Administration's
  published rect (the first zoom-out helper read the target too early and zoomed in four times: run
  `hid-20260907T162344Z`); (4) a people-drive click that did not land is recorded in full as a retry (`missedRetry`), not as a gate
  failure, and the landing click states how many misses preceded it — the gate remains the verified exact
  selection. The reviewer showed that the two pair-2 `172023Z` misses (and the pair-1 `162724Z` ones) were real
  clicks posted into the unpublished PROJECT panel, not misses on a walking figure; the people driver frames into
  the HUD-free zone from `b81dc0a` (after the pair-2 runs).

### 3.5 Confirmed defect F (product, found by the real-input BUILD journey): world input dead after the Studio Menu closes

- **Symptom (successor pair, `hid-20260907T164850Z` / `hid-20260907T165745Z`).** Before the Save, a real
  click selected the fresh site (`selection=placed-1`, step 31/32 of the first run). After Save → Load →
  Resume, the *same* click at the *same* point on a pixel-identical frame selected nothing — and so did a
  control click on Administration (`CONTROL after the Load: a real click on Administration selects it —
  FAIL`), while a real pan tap still moved the published world rects (camera and map alive) and orbit
  drags no longer turned the yaw. The host's own diag at every post-Load click read
  `pointerOverUi: true` with the pointer over open lawn, and the element map read `rootPicking: Position`
  after the Load against `rootPicking: Ignore` before it.
- **Root cause (`StudioWorkspaceHost.SetPanelInputSuppressed`, P04A.1 commit `9e75b5f`, pre-existing).**
  Opening the Studio Menu suppresses the UI Toolkit panel (`root.pickingMode = Ignore`, disabled);
  closing it *restored the root to `PickingMode.Position`* — but a UIDocument root is a pass-through
  container by construction (built with Ignore; the scrim, workspaces and cards pick with their own
  Position mode). A full-screen root at Position makes `StudioCameraInput`'s EventSystem-first check
  report "over UI" everywhere, so after any MENU open + close — Save / Load / Resume included — no world
  click and no orbit reaches the lot until a workspace happens to cycle the root. The existing EditMode
  test `PanelInputSuppression_IsSymmetricAcrossEveryOpenAndClosePath` asserted the defect
  (`NotSuppressed() => pickingMode == Position`). Not caused by the roof corrections (`df79153` touches no
  input routing); the two-repairs BUILD driver's post-Load re-select step (its step 37) did fail and was dispositioned
  as harness timing at the time; the root cause was not pursued until this real-input run isolated it.
- **Fix (product; smallest source-level correction).** `SetPanelInputSuppressed` records the root's
  picking mode when a suppression begins and restores exactly that mode when it ends (the root's own
  default, Ignore, when none was recorded — the unconditional releases in `OnDisable`/`OnDestroy`). The
  symmetry test now judges the restore against the captured baseline; a new regression test
  `PanelInputSuppression_RestoresTheRootsOwnPickingMode_NeverForcesPosition` covers the pass-through
  root (Ignore → Ignore), a self-picking root (Position → Position) and the unconditional release.
  Consequence disclosed: after the fix the root no longer intercepts pointer events itself once the menu
  has closed; every element that should intercept (scrim, workspace roots, cards) still declares
  Position on its own.
- **Rebuild.** A product change → the player is rebuilt from the fix commit, the manifest re-bound, and
  the whole runtime evidence (oracle sweep, camera auto-proof, three journeys) re-run on the new pair;
  the `75de360` pair's runs stay on disk as the record of the diagnosis.

---

## 4. Final gate table — successor pair

_(filled as the runtime queue completes; PASS / FAIL / BLOCKED / NOT RUN kept distinct; nothing is
converted across evidence classes)_

### 4.1 Gate table (pair 2 = Unity `574339da31` / exe `f678cf53…` / engine `189326b6…`; every row names its own pair-2 evidence)

| # | Mandatory gate (order §6 / §12) | Verdict | Evidence (pair 2 unless stated) — what was actually observed |
|---|---|---|---|
| G1 | Visible person: real OS click on the world body → inspector card → OPEN PROFILE reaches the exact person | **PASS** | `Evidence/P10-Journey-FinalVerification02-Rebuild/hid-20260907T172822Z` (0 failures): still, in-window, HUD-clear rect, oracle *visible* before the click, real click, `personInspectorBoundTalentId = t-cra-04`, Profile `profileTalentId = t-cra-04`; also `hid-20260907T172023Z` |
| G2 | Opaque facade over a hidden person → no hidden selection (visibility decided independently of the picker) | **PASS** | same run: the Post framed by real taps; the drawn-geometry oracle (camera pose + scene triangles) said *hidden by `post`* on the click frame and after it; the real click selected `post`, no person card; the host's probe agreed (0 disagreements). Pair-1 NOTE retained: one roof-edge graze with a walking person where probe and oracle disagreed by less than the box margin and no click selected the person (§4.0 16:27) |
| G3 | Roster → filter → select → OPEN PROFILE → Back with context | **PASS** | same run: ROSTER (60 people) → Craft filter → select → OPEN PROFILE exact → Back with the Craft chip still selected |
| G4 | Locate → correct outcome (exact body selected, Roster suspended, camera inspecting, BACK TO STUDIO returns with filter + selection) | **PASS** | same run: `selection = t-cra-04`, `suspended = true`, camera rest after the blend (pose delta 1.4 mm / 0°), BACK TO STUDIO reopened the Roster with the chip and footer intact |
| G5 | Save / Load → navigation + Studio Menu / Resume (people flow) | **PASS** | same run: Save V18 ("Saved."), Load ("Studio loaded.", 60 people, same week), Resume back to the live lot |
| G6 | Bare-lot boot → BUILD chip → Build preview (authority answer) → commit → exact debit and site | **PASS** | `Evidence/P09-Journey-FinalVerification02-Rebuild/hid-20260907T172423Z` (and the clean re-run `hid-20260907T173427Z`, 0 failures, 59 owned events): chip visible+enabled, card → OPEN BUILD, parcel, catalogue, first preview **Valid site** (consistent double read), commit label `BUILD DEVELOPMENT & CASTING OFFICE — $1,500,000`, cash 20,000,000 → 18,500,000, one placement `placed-1` under construction (completes week 14) |
| G7 | Save / Load → correct site re-selection **by a real click** (before the Save and after the Load) | **PASS** (pair 2) — **FAIL on pair 1** (defect F, §3.5) | same runs: pre-Load click selected `placed-1` after three ordinary orbits (the picker rightly refused the site while it stood behind Administration); Save V18; Load restored placement / cash / regime; **control: Administration selectable after the Load**; post-Load click selected `placed-1` (`diag.selectionStableId`). Pair 1: `hid-20260907T164850Z` / `hid-20260907T165745Z` — nothing selectable after the Load (`rootPicking: Position`) |
| G8 | Contract renewal once at the quoted terms + state-neutral cancellation, persisted through Save / Load | **PASS** | `Evidence/P10-Contract-Journey-FinalVerification02-Rebuild/hid-20260907T173250Z` (0 failures) and `hid-20260907T172645Z`: REVIEW RENEWAL sheet with the engine's terms; CANCEL: revision 0 → 0, cash unchanged; 2-year term priced; CONFIRM: receipt "Renewed through Week 144 — $37.4K signing bonus paid.", term 104, end 144, cash 18,196,000 → 18,158,625, one ledger row, revision 1; window closed; Save carries term 104; Load restores it; Profile reads it back |
| G9 | Visual-oracle sweep on ONE compatible pair: 26 P10 (6 scenarios × 4 viewports + Owner-profile copy × 2) + 12 P09 + 8 P08 | **PASS 46 / 46** | `Evidence/P10-Oracle-Sweep-FinalVerification02-Rebuild/summary.tsv`: 46 rows exit 0, 46 sidecars `complete`, every run-binding = exe `f678cf53…` / `574339da31` / engine `189326b6…` |
| G10 | Stage inspection camera under the new roof colliders (§3.3 consequence) | **PASS** | `Evidence/P04A-Camera-Proof-FinalVerification02-Rebuild/camera-autoproof-20260907T171652Z`: 5 transitions blended + settled, target never obscured, camera never displaced, collision mask per contract, presentation-only, no input |
| G11 | MAJOR C / E selection repairs (placed-body roof slab, Stage A barrel roof + gable) | **PASS** | EditMode on the fix commit chain: pre-fix control 6 / 17 FAIL (`editmode-runA-oldcode-20260907T125501Z.xml`), `StudioAuthoredRoofOcclusionTests` + `StudioPlacedBodyOcclusionTests` green, full suite **900 / 900** at `574339da31` (`editmode-fixF-full-20260907T170930Z.xml`); the independent oracle self-check (Kay Fenwick hidden by `stage-a` at 113.8 m) and G2 at runtime |
| G12 | Defect F regression (root picking restored after the Studio Menu) | **PASS** | `StudioSystemMenuTests` 15 / 15 fixed (`editmode-menu-fix-20260907T170624Z.xml`), the new test FAILS on the old host 14 / 15 (`editmode-menu-prefix-control-*.xml`), and G7's post-Load controls at runtime |
| G13 | TS floor / Owner-profile copy / compat-boundary evidence | **PASS (reused, legitimately)** | the engine bundle is byte-identical (`189326b6…`) to the sealed a2baa1d engine every run launched; the TS product is unchanged (docs-only worktree); the Owner-profile copy ran inside G9 (×2) on pair 2 |
| — | Real Builders | **NOT RUN — deferred** | P09-REQ-039, separately deferred by the order; not a gate of this package |

Distinctions kept: an EditMode or oracle proof never stands in for a real-input route (G1–G8 are real OS input under the owned-input guard with the HID witness attributing every idle reset); a debit proves only its own action (G6's debit is not G7); the pair-1 runs are diagnosis history, none of them is counted for a pair-2 gate.

**Disclosures that belong with the table (added after the phase-2 review lenses reported, 2026-09-07 ≈18:10Z):**

- **Whole-log HID witness audit of every pair-2 real-input run** (`hid-witness.jsonl`, all events, not only the
  ones the guard consulted): PEOPLE `172023Z` 171 tool + 18 player-null, `172822Z` 144 + 7; CONTRACT `171809Z`
  233 + 7, `172645Z` 113 + 4, `173250Z` 113 + 4; BUILD `172423Z` 257 + 8, `173427Z` 252 + 8 — **zero events from
  a physical device (`sourcePid` 0) and zero from any other process** in all seven. The guard's ≈0.9 s
  post-injection slack (a physical touch inside it is neither flagged nor counted) therefore masked nothing on
  pair 2; for future runs the guard now consults the witness on every check and the launcher writes this audit
  into the report (tools commit `3226130`, not exercised by the pair-2 runs).
- **The studio clock stood `Paused` in every counted journey** (every fixture checkpoint boots paused and no
  drive pressed a speed control). People still walk under pause (the people driver's misses were on a moving
  figure), buildings do not; the moving-target selection gate (order §5) was met on a walking figure, not on a
  ticking clock. No run pressed 1× / 2× / 4×.
- **EditMode ↔ commit binding.** The XMLs carry no commit id. `editmode-fixF-full-20260907T170930Z` (900 / 900)
  ran on the working tree that `574339da31` committed 35 s later with no intervening edit (`git diff` at commit
  time = the host + test files only); the pre-fix control ran with the host file stashed to its `75de360`
  content and the new tests present. The same content-binding applies to the pair-1 XMLs (`75de360`).
- **CONTRACT `171809Z` (history):** the CONFIRM click was lost — `engine.log` carries no `submitIntent`, the
  sheet stayed open with the button focused (`019-renewal-receipt.png`), the receipt element never appeared,
  and the revision advanced only at the later `load` (a load bumps the revision by design, `171809Z` line 8);
  nothing was displayed that the authority had not recorded.
- **Unpublished HUD panels.** The element map publishes IMGUI buttons, not the PROJECT panel, clock strip or
  roster panel bodies; the build driver frames into a measured HUD-free zone; the people driver did not during the pair-2 runs —
  its misses under the PROJECT panel are recorded as retries and the gate is the landed, verified selection —
  and does so from tools commit `b81dc0a` (after the pair-2 runs, not exercised by them).
- **G13 evidence files:** TS floor / owner-copy / compat outputs are the two-repairs record rows
  (`P08-P10-TWO-REPAIRS-2026-09-06.md` §5 "TS floor", "Owner-profile private copy", "Compatibility boundary")
  produced on engine `189326b6…` (byte-identical to every pair-2 launch); the pair-2 Owner-profile copy runs are
  `Evidence/P10-Oracle-Sweep-FinalVerification02-Rebuild/p10/p10-owner-profile-copy-20260907T171411Z/` (1440×900) and `…171419Z/` (1280×800) — two of the 26 P10 rows, run on the private copy, the real profile `d949003e…` untouched.

### 4.0 Runtime execution trail (append-only; every attempt retained, nothing relabelled)

All runtime work ran behind the desktop safety gate (600 s Owner-idle, console unlocked) from detached,
logged queue runners; the Owner was actively using the machine when the queue was armed, so the first
gate opened at 13:56Z.

| When (UTC) | Stage | Outcome | Cause / disposition |
|---|---|---|---|
| 13:56–14:04 | Oracle sweep, 46 runs (`Evidence/P10-Oracle-Sweep-FinalVerification02/`) | **26 P10 runs (6 scenarios × 4 viewports + Owner-profile copy × 2): exit 0, sidecars complete, every run-binding = exe `3558ddd4…` / build `75de360` / engine `189326b6…`.** 20 P08/P09 runs: the oracle completed (sidecars `complete`) but the launcher aborted at its binding step (`ENGINE_BUNDLE: parameter not set`) before writing `run-binding.json` — an unset-variable bug in the launcher change of `74cef3b` | Launchers corrected (`08b7be4`, `bcc1af9`, `33d551b`: the P08/P09 launchers define and launch the bound engine bundle); the 20 scenarios are re-run as stage 2 into the same sweep directory (`summary-p08p09-rerun.tsv`); the unbound first runs stay on disk as history only |
| 14:14 | PEOPLE drive #1 (`P10-Journey-FinalVerification02/hid-20260907T140457Z`) | **SUSPENDED (exit 3)** 36 s in, 42 injected events, during framing: "OS idle 119 ms but our last event was 1545 ms ago"; player frontmost; OS held nothing | The guard did what the order requires; root cause found later (below): the flag followed the driver's own player activation |
| 14:27 | CONTRACT drive #1 (`P10-Contract-Journey-FinalVerification02/hid-20260907T141542Z`) | **SUSPENDED (exit 3)** 5 events in: "idle 1034 ms but our last event 2175 ms ago" | **False positive, harness:** the driver's un-stamped `ownerinput releasemods` posts modifier key-ups through the HID tap and resets the OS idle counter (measured in isolation: 71 s → 720 ms). Fixed `2a98d6b` (stamped guard event) |
| 14:36 | BUILD drive #1 (`P09-Journey-FinalVerification02/hid-20260907T142558Z`) | **SUSPENDED (exit 3)** after 17 events at the deselect key, with the material action itself proven on the successor pair (nothing else from this attempt counts toward the BUILD gate): BUILD chip offered (visible+enabled), Administration card → OPEN BUILD → parcel → catalogue → preview answered **Valid site** with the commit enabled, commit at (11,14) with the exact $1,500,000 debit (20,000,000 → 18,500,000), Esc peels one layer each, a real world click posted on `placed-1`'s published rect — **but that driver asserted only that the rect stayed published, not the selection; the screenshot shows Administration's card still selected, so the pre-Load world select is NOT proven by this attempt** (corrected by the phase-1 review; the driver now verifies `diag.selectionStableId`). Save/Load/post-Load re-select NOT reached | **Harness-caused idle reset:** every flag followed the driver's own `activate()` on the player (activation of Code/Finder does not reset the counter; activating the Unity player evidently can). Fixed `738cafa`: activation is a stamped guard event, performed only when the player is not already frontmost, in the driver and in the launcher's 3-second loop (which now stamps a file the guard reads). All three drives are re-run (stages 3–5) |
| 14:52–15:03 | P08/P09 re-sweep, 20 runs (stage 2, corrected launchers; `summary-p08p09-rerun.tsv`) | **20 / 20 exit 0**, sidecars complete, every run-binding = exe `3558ddd4…` / build `75de360` / engine `189326b6…` (verified per run). Sweep total on the successor pair: **46 / 46** (26 P10 incl. the Owner-profile copy ×2, 12 P09 incl. `p09-valid-placement` and `p09-invalid-placement`, 8 P08) | Gate rows in §4.1 |
| 15:54 | Owner instruction | The Owner: "You can change it to zero seconds keep going" — the launchers' idle gate lowered from 600 s to **60 s** (not 0: a drive must not start on the Owner's last keystrokes); the human-input guard unchanged; logged in the queue log | Applies to every run below |
| 15:55, 15:57 | CONTRACT drives #2/#3 (`hid-20260907T155553Z`, `hid-20260907T155718Z`) | #2: **SUSPENDED (exit 3)** after step 18 — the whole renewal sequence had already passed (REVIEW RENEWAL sheet, state-neutral CANCEL, 2-year term priced, CONFIRM: receipt, term 104, end week 144, exact $37,375 debit, one ledger row) — on a foreign event 1.1 s after the last owned one. #3: CONFIRM click spoiled (the sheet stayed open, no `renewContract` in `engine.log`), receipt wait timed out, then **SUSPENDED** on a foreign event 11 s after the click | **Genuine foreign mouse input** at the desk (15:56–15:58Z; the desk was then quiet for 67 s by the idle sampler). Guard correct; retried |
| 15:59 | CONTRACT drive #4 (`hid-20260907T155858Z`) | **COMPLETE, 0 failures, 35 owned events**: Roster → attention filter → OPEN PROFILE → REVIEW RENEWAL sheet with the engine's terms → CANCEL state-neutral (revision/cash unchanged) → 2-year term priced → CONFIRM renewed once at the quoted bonus (exact debit, one ledger row, term 104, new end week) → Profile shows the renewed contract, window closed → Save carries it (V18) → Load restores it → Resume → Profile reads it back. Binding exe `3558ddd4…` / build `75de360` / engine `189326b6…`; OS input state clean at start and end | **CONTRACT gate PASS** (§4.1) |
| 16:00, 16:02 | BUILD drives #2/#3 (`hid-20260907T160035Z`, `hid-20260907T160249Z`) | Chip → card → OPEN BUILD → parcel → catalogue → **Valid site** → commit with the exact $1,500,000 debit, Esc peels — all PASS again; **pre-Load site select FAIL** ("no still, in-window, HUD-clear moment in 45 s": the loop panned for ever), Save (V18) and Load PASS, post-Load select FAIL likewise; #2 additionally **SUSPENDED** right after the Load click | #2's suspension and the people drives' below: the player's null event (§3.4). The select failure: driver defect (1) of §3.4 — the UI Document root read as HUD cover |
| 16:05, 16:07 | PEOPLE drives #3/#4 (`hid-20260907T160552Z`, `hid-20260907T160757Z`) | Both **SUSPENDED (exit 3)** at the first world move after framing+zoom (idle ≈0.8 s vs ≈1.77 s), player frontmost, nothing held | The player's null event (§3.4), identified with the witness at 16:12Z; the retry runner was stopped for the diagnosis |
| 16:11 | Stage-inspection camera auto-proof (`Evidence/P04A-Camera-Proof-FinalVerification02/camera-autoproof-20260907T161154Z`) | **COMPLETE (exit 0)** on the successor pair, no input injected: 5 transitions all blended and settled (management → `stage-a` inspection → control return → `admin` inspection → return), 4 shots, target never obscured, camera never displaced (0.0 m), collision mask matches the contract, authority/runtime instance unchanged, presentation-only; `run-binding.json` = exe `3558ddd4…` / build `75de360` / engine `189326b6…` | Runtime evidence for the §3.3 Stage-inspection consequence (phase-1 review MAJOR): the inspection still enters, frames and returns under the new roof colliders |
| 16:17 | BUILD drive #4 (`hid-20260907T161711Z`, witness-attributed guard, root-cover fix) | Commit etc. PASS; **site select FAIL both times**: the click at the still, HUD-clear rect centre resolved `admin` — the site stands behind Administration from that pose (picker right); guard: 5 player null events attributed, 0 foreign, no suspension | Driver defects (2)/(3) of §3.4 → honest clear-before-select + orbit |
| 16:19 | PEOPLE drive #5 (`hid-20260907T161932Z`) | **Every mandated step PASS**: real click on the body landed on the 3rd attempt (the two misses, recorded in full, were clicks into the unpublished PROJECT panel per the reviewer's frame check) → inspector bound `t-cra-04` → OPEN PROFILE exact → Back → facade: framed the Post, oracle-hidden by `post` on the click frame, click selected `post`, no person card, still hidden after → Roster → Craft filter → select → OPEN PROFILE exact → Back with the filter → LOCATE selected the exact body, suspended the Roster, camera quiet → BACK TO STUDIO returned and reopened the Roster with filter and selection intact → Save V18 → Load (same studio) → Resume. 56 owned events, 23 player null events attributed, 0 foreign; OS state clean at end. Report status `failed` only because the two misses counted as failures under the driver of that hour | Evidence for the PEOPLE gates (§4.1); driver correction (4) of §3.4; a clean re-run queued so the report's own status reads `complete` |
| 16:23 | BUILD drive #5 (`hid-20260907T162344Z`) | Commit PASS; site select FAIL (the zoom-out helper read the target rect before the eased zoom settled, judged "not grown", and zoomed IN four times; the enlarged Administration then swallowed the menu clicks: Save/Load steps FAIL in this attempt). **Physical input during this pair-1 diagnosis run (found by the reviewer's whole-log scan):** `hid-witness.jsonl` holds 110 physical-device events (57 trackpad-gesture + 53 mouseMoved, keycodes masked) at 16:24:19.17–19.64Z, 0.56 s after the driver's own click and before its next injection — inside the guard's ≈0.9 s slack, so unflagged and uncounted (`foreignEvents 0`), and the drive continued. Nothing of this run counts toward any gate | Driver defect (3) of §3.4 → zoom sense measured on Administration after `settleCamera`; orbit on an occluded pick |
| 16:27 | PEOPLE drive #6 (`hid-20260907T162724Z`, misses-as-retries driver) | World-body click: **240 s budget exhausted without a still, in-window, drawn-visible moment** (`moving` 871 samples: the figure walked the whole time; 4 landed-nothing misses recorded as retries — clicks into the unpublished PROJECT panel per the reviewer), so inspector/Profile-from-world FAIL in this attempt; facade: the oracle said hidden (the Post's roof edge, hit 88.6 m vs chest 99.8 m), the click at the chest pixel selected **nothing** (no person card, still hidden after) while the host's own probe read `pickAtChest=t-cra-04` on that frame (3 probe/oracle disagreements; see the NOTE below); Roster → Craft → select → OPEN PROFILE → Back with filter, LOCATE exact + suspended Roster, BACK TO STUDIO with filter and selection, Save V18, Load, Resume all PASS; 57 owned events, 0 foreign | Kept as history; the PEOPLE gates are judged on `hid-20260907T161932Z` (§4.1). NOTE for the reviewer: the roof-edge graze — the Post Body box (BoxCollider, layer 0) top face at y 7.6, hit 0.64 m inside its back edge — where the picker and the drawn oracle disagreed by less than that margin while the person walked; no click selected the hidden person |
| 16:33 | BUILD drive #6 (`hid-20260907T163327Z`, orbit-capable driver) | Commit PASS; site select: three ordinary right-drag orbits measured on the published pose (yaw 38.5 → 47.1 → 55.8 → 64.4°, 8.6° per 30 %-width drag) were too few to bring the gate-court site out from behind Administration inside the 45 s budget; a stray Esc with nothing selected then opened the Studio Menu so MENU toggled it closed and Save/Load FAIL in this attempt | Driver: wider drags (60 % width), up to 12 orbits, 150 s budget, Esc only when a selection stands, MENU only when the menu is not already open |
| 16:37 | BUILD drive #7 (`hid-20260907T163708Z`, wide-orbit driver) | Commit PASS; site select: three wide orbits turned the yaw 38.5 → 55.8 → 73.1 → 90.3° (the tycoon yaw then **clamps at ≈90°**), after which every click on the still, zone-framed rect picked **nothing**; Save/Load PASS this time (state-aware Esc/MENU), post-Load select FAIL likewise. **Binding caveat:** the launcher hashed the driver when it wrote `run-binding.json` at the END of the run (16:42:44Z), after the lead had edited the driver (16:41Z), so `driverSourceSha256` names the next revision — disclosed in `run-binding-correction.json` beside it; launchers now hash at launch | History only. Root cause of the "nothing picked" misses found next: the published `world-selectable-*` rect is the screen AABB of every enabled renderer of the body — for a fresh site that includes the floating nameplate — so the rect's centre sits in the air above the 1.6 m pick envelope |
| 16:43 | BUILD drive #8 (`hid-20260907T164348Z`, HUD-free-zone framing) | Commit PASS (the VALID SITE read flickered once: `Valid site` + commit enabled at step 15, the same read a moment later judged false — a harness double-read to fix); site select FAIL: 25 misses, 12 orbits all at the 90.34° clamp (`orbitYaw` before == after), zoom-out a no-op at the overview's far limit (Administration 266 → 266 px) | Driver: aim down the rect's centre line toward the pad (0.5 / 0.3 / 0.18 / 0.1 / 0.4 of the height), orbit reverses direction at the clamp |
| 16:48 | BUILD drive #9 (`hid-20260907T164850Z`, pad-aim driver) | Commit PASS; **pre-Load site select PASS by a real click** after three ordinary orbits (aim 0.5 of the rect, `selection=placed-1` read from `diag`, step 31/32); Save V18 PASS; Load PASS (placement, cash, regime restored); **post-Load select FAIL**: 27 clicks at the identical point on a pixel-identical frame picked nothing; the orbit drags no longer turned the yaw (90.34 → 90.34, both directions) | Diagnosis run queued with controls (§3.5) |
| 16:57 | BUILD drive #10 (`hid-20260907T165745Z`, post-Load controls + host diagnostics) | Commit PASS (VALID SITE now a consistent double read); pre-Load select PASS again (3 orbits); Save/Load PASS; **CONTROL: a real click on Administration after the Load selects nothing** (8 aims); **CONTROL: one real pan tap moves the world rects** (site 357.9 → 398.5 px, Administration 439.7 → 489.7 px — camera and map alive); at every post-Load click the host read `pointerOverUi: true`, `rootPicking: Position` (pre-Load: `Ignore`) → **defect F confirmed (§3.5)**. The launcher's binding step then crashed on a shell/Python boolean literal in the new launch-time-hash fields (fixed); `run-binding.json` for this dir was reconstructed by the lead and says so (`reconstructed: true`) | Product fix + regression test → rebuild → full re-validation on the new pair |
| 17:06–17:10 | Defect F fix → EditMode → rebuild (pair 2) | `StudioSystemMenuTests` 15/15 on the fixed host (`editmode-menu-fix-20260907T170624Z.xml`); **pre-fix control**: the new regression test FAILS on the old host, 14/15 (`editmode-menu-prefix-control-20260907T170851Z.xml`); full EditMode **900/900** (`editmode-fixF-full-20260907T170930Z.xml`); tools committed `d849a43` (harness only), fix committed **`574339da31`** (host + tests only), player rebuilt at that commit with `dirty=false` → **pair 2**: exe `f678cf539d067ab562d064458f6aef316fe61fabf0ba87cbf2c92e670ca9a9b0`, Assembly-CSharp `75217bf0…`, engine unchanged `189326b6…`, scene unchanged `16629911…` (the drawn-geometry dump stays bound). The pair-1 player binary was overwritten in `Builds/macOS/` by this build (its hashes and manifest copies live in every pair-1 evidence dir; the control `ab1fa09b…` is untouched) | Full re-validation on pair 2 queued (`Evidence/*-FinalVerification02-Rebuild/`): sweep 46 → camera auto-proof → CONTRACT → PEOPLE → BUILD |
| 17:11–17:16 | **Pair 2** oracle sweep, 46 runs (`Evidence/P10-Oracle-Sweep-FinalVerification02-Rebuild/`) | **46 / 46 exit 0**, sidecars complete, every run-binding = exe `f678cf53…` / build `574339da31` / engine `189326b6…` (26 P10 incl. the Owner-profile copy ×2, 12 P09, 8 P08) | Gate rows in §4.1 |
| 17:16 | **Pair 2** Stage-inspection camera auto-proof (`Evidence/P04A-Camera-Proof-FinalVerification02-Rebuild/camera-autoproof-20260907T171652Z`) | **COMPLETE (exit 0)**: 5 transitions blended + settled, 4 shots, target never obscured, camera never displaced, collision mask per contract; bound to pair 2 | §4.1 |
| 17:18 | **Pair 2** CONTRACT drive #1 (`P10-Contract-Journey-FinalVerification02-Rebuild/hid-20260907T171809Z`) | Roster → attention filter → Profile → REVIEW RENEWAL sheet → CANCEL state-neutral → 2-year term priced: PASS; **CONFIRM click lost** (button focused, nothing committed: receipt null, revision 0 → 0, cash unchanged — the same signature as the 15:57Z pair-1 attempt, but with the desk provably quiet: 0 foreign witness events), so the renewal, Save-carries-renewal and Load-restores-renewal steps FAIL in this attempt | Cause of the dropped click NOT established (harness pointer timing vs a host per-poll gate — reviewer exception e7); the driver re-clicks CONFIRM once, only while the sheet still stands with the same revision (a landed commit is never repeated). Re-queued |
| 17:20 | **Pair 2** PEOPLE drive #1 (`P10-Journey-FinalVerification02-Rebuild/hid-20260907T172023Z`) | **Every mandated step PASS on pair 2**: real click on the body (after two retries that were clicks into the unpublished PROJECT panel) → inspector bound `t-cra-04` → OPEN PROFILE exact → Back → facade (oracle-hidden by `post` on the click frame, click selected `post`, no person card, probe agreed, 0 disagreements) → Roster → Craft → select → OPEN PROFILE → Back with the filter → LOCATE exact + Roster suspended → BACK TO STUDIO with filter and selection → Save V18 → Load → Resume; 58 owned events, 21 player null events attributed, 0 foreign. One supplementary check failed: the post-Locate drift sample read 9 px on a 67,872 px-wide near rect at human scale (the Locate blend's sub-millimetre settle) | Harness: camera rest after Locate is now judged from the published pose (< 2 cm, < 0.05°), px drift kept as information; a clean re-run queued |
| 17:24 | **Pair 2** BUILD drive #1 (`P09-Journey-FinalVerification02-Rebuild/hid-20260907T172423Z`) | **Every mandated step PASS on pair 2**: BUILD chip offered → Administration card → OPEN BUILD → parcel chooser → catalogue on NEEDED NOW → first preview **Valid site** (consistent double read) → commit of the ONE quoted intent with the exact $1,500,000 debit (20,000,000 → 18,500,000), site `placed-1` under construction → Esc peels one layer each → **pre-Load real site select** (three retries resolved `admin` — the picker rightly refusing the site hidden behind Administration — then three ordinary right-drag orbits; `selection=placed-1` read from `diag`) → Save V18 carries the placement → Load restores placement, cash, regime → **CONTROL: a real click on Administration after the Load selects it (world picking alive — defect F fixed)** → a real pan tap moves the world rects → **post-Load real site select `placed-1`** (first click). 61 owned events, 0 foreign; run-binding: exe `f678cf53…` / `574339da31` / engine `189326b6…`, driver unchanged during the run. The report's own status reads `failed` only because that hour's driver counted the three pre-Load retries as failures | BUILD gates PASS (§4.1); driver accounting aligned with the people driver (misses are retries) and a clean re-run queued |
| 17:26 | **Pair 2** CONTRACT drive #2 (`hid-20260907T172645Z`, CONFIRM re-click driver) | **Every mandated step PASS on pair 2**: attention cohort → OPEN PROFILE exact → REVIEW RENEWAL sheet with the engine's terms → CANCEL state-neutral (revision 0 → 0, cash unchanged) → 2-year term priced → CONFIRM renewed once (receipt, term 104, end week 144, exact $37,375 debit, one ledger row, revision 1) → window closed → Save carries term 104 → Load restores it → Resume → Profile reads it back. One supplementary read flaked: the consequence-sheet step's `commit enabled` flag read false for a frame while the sheet re-quoted (the text itself matched) | CONTRACT gates PASS (§4.1); the sheet read is now a consistent double read; a clean re-run queued |
| 17:28 | **Pair 2** PEOPLE drive #2 (`P10-Journey-FinalVerification02-Rebuild/hid-20260907T172822Z`, pose-based Locate rest) | **COMPLETE, 0 failures, 48 owned events, 0 foreign**: every mandated PEOPLE step again (real body click → inspector `t-cra-04` → OPEN PROFILE → Back → facade hidden by `post`, click selected `post`, probe agreed → Roster → Craft → select → OPEN PROFILE → Back with filter → LOCATE exact + Roster suspended (camera rest: pose delta 1.4 mm, 0°) → BACK TO STUDIO with filter and selection → Save V18 → Load → Resume) | **PEOPLE gates PASS (§4.1)** |
| 17:33–17:35 | **Pair 2** clean re-runs (revalidation-3): CONTRACT `hid-20260907T173250Z`, BUILD `hid-20260907T173427Z` | **CONTRACT COMPLETE, 0 failures, 35 owned events** (sheet read consistent; CONFIRM landed first time); **BUILD COMPLETE, 0 failures, 59 owned events**: chip → card → OPEN BUILD → parcel → catalogue → Valid site → commit exact $1.5M → pre-Load real site select (`placed-1`) → Save V18 → Load → CONTROL Administration selectable after the Load → pan tap moves the rects → **post-Load real site select `placed-1`**; run-bindings bound to pair 2, drivers unchanged during the runs, 0 foreign witness events | **All three journeys COMPLETE with 0 failures on pair 2** (§4.1); evidence index `docs/campaigns/evidence/P08-P10-FINAL-VERIFICATION-02-evidence-index-pair2.json` |
| 18:23 | **Pair 2** PEOPLE proof-of-harness drive (`P10-Journey-FinalVerification02-Rebuild/hid-20260907T182348Z`; NOT a gate — run to exercise the reviewer's conditions §5.2) | **COMPLETE, 0 failures, 69 owned events** under the hardened guard `3226130` (witness scanned on every check), the HUD-free-zone people driver `b81dc0a` and the witness-binary-bound launcher `7e3813a`; the report's `witnessed.audit` block is present: 250 witnessed events = 199 tool + 51 player-null, **0 physical-device, 0 other-process**; 47 idle resets attributed to the player's null events, 0 foreign; the body click landed after 7 recorded retries on the walking figure (zone-framed, pointer over the world); every mandated step passed again | Reviewer §5.2 conditions met once on pair 2; the gate rows above still cite `172822Z` / `173250Z` / `173427Z` |

---

## 5. Identities

| Item | Value |
|---|---|
| **Final successor build commit (pair 2)** | **`574339da31`** (clean, dirty=false) = pair 1 + tools `d849a43` (harness only) + defect F fix `574339da31` (`StudioWorkspaceHost.SetPanelInputSuppressed` + `StudioSystemMenuTests`); built 2026-09-07T17:10:31Z |
| **Final player executable SHA-256 (pair 2)** | **`f678cf539d067ab562d064458f6aef316fe61fabf0ba87cbf2c92e670ca9a9b0`** |
| **Final Assembly-CSharp SHA-256 (pair 2)** | `75217bf0b00da3b3…` (full value in `Builds/macOS/build-manifest.json`) |
| Pair-1 Unity build commit (diagnosis pair, superseded) | `75de360e0fe2f1e5e0173cea63d00497c23c3eb3` (clean, dirty=false; = product `df79153` + tools `75de360`) |
| Later Unity commits after pair 1 | `d849a43` (tools: witness, guard attribution, orbit, drivers, launchers), **`574339da31` (PRODUCT: defect F fix + tests → pair 2)**, `41d94eb` (tools: pair-2 drive corrections), `3226130` (tools: guard whole-stream foreign check + witness audit, after the pair-2 runs), `b81dc0a` (tools: people driver HUD-free-zone framing, after the pair-2 runs). `git diff --stat 75de360..HEAD -- Assets` = `StudioWorkspaceHost.cs` (+24/−2, the fix) + three test files |
| Pair-1 tools/tests-only commits (no player change vs `75de360`) | `5193986` (executable bits), `74cef3b` (test adjustments, launcher bindings), `0bb8323`, `d1715fa`, `9d3e8dc`, `08b7be4`, `bcc1af9`, `33d551b`, `2a98d6b`, `738cafa`, `f0e1dab`, `1cd232f`, `31f981d` (harness guard, launchers, oracle-launcher engine binding, camera auto-proof launcher) — see `git log 75de360..574339da31` |
| Pair-1 player executable SHA-256 (superseded) | `3558ddd457a423308bb605105e9884f7da479658ece168b883d5e0d41bc297bf` (built 2026-09-07T13:19Z; the binary was overwritten by the pair-2 build, its manifest is copied in every pair-1 evidence dir) |
| Pair-1 Assembly-CSharp SHA-256 (superseded) | `5fc346cb28dc4ee6f9ed4405c3feb980e3b484bdab41aec0d9963e4cc05e9230` |
| Pair-2 manifest `typescript.dirty: true` | docs-only: at manifest time `git -C TS status` showed only `docs/campaigns/…` modified (this record and the handoff); the TS product tree is `a2baa1d` unchanged and the engine bundle hash binds it (reviewer exception e3) |
| Pair-2 candidate | `~/Desktop/P08-P10-Combined-Candidate-f536308-574339d/` — `playtest.sh endowed` verified 17:46Z; `PLAYTEST-README.md`; hashed `INVENTORY.sha256` (2,216 files + the docs added at C11); pair-2 gate evidence and pair-1 diagnosis history inside |
| Engine bundle SHA-256 (unchanged) | `189326b6fbd769bc9650d0ed43b92c9ba75c78565958f3074f4d5645605d065e` (TS product `a2baa1d`; TS repo has no product change in this record — docs only) |
| Canonical scene SHA-256 (built) | `1662991108a1b8cfabe00651c2e8f6be42a33af3313ecb76b058d1bcb08bc9c6` |
| Drawn-geometry dump | `Builds/macOS/drawn-geometry.bin` (255,490 triangles, 1,194 groups, 20 envelopes; bound to the scene SHA above). It dumps what is ACTIVE in the raw scene, i.e. the Stage A activity's authored default state (STATE_Shooting decor) — the facade case targets the Post, unaffected; a future case near the basecamp under another stage state would need a state-aware dump |
| Engine bundle launched | every sweep run and drive launched `$HOME/Desktop/P08-P10-Combined-Candidate-7b4d8ff-1d304f8/engine/engine.mjs`, byte-identical (`189326b6…`) to the TS worktree's `dist/studio/engine.mjs`; the P10/HID launchers refuse a mismatch against the manifest, the P08/P09 launchers now do too (`1cd232f`) |
| Real Owner profile | `~/Library/Application Support/Project Studio/bridge-runtime/bridge-runtime-v1.json` = `d949003e…` (unchanged; never opened for writing; hash-checked by the owner-copy engine script and by the phase-1 review) |
| Schema / protocol / save | `6a2c01fe…` (projection 19) / 4 / V18 — unchanged |
| Control player | `ab1fa09b…` (Unity `f760d5d`) at `Builds/control-ab1fa09b-f760d5d/` |
