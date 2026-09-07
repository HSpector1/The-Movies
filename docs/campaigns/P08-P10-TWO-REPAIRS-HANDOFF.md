# P08–P10 CLOSE-GATES two-repairs — HANDOFF (implementation ownership released)

Status: **INCOMPLETE — NOT a final KEEP.** The world-body real-input click gate is UNRESOLVED
(harness/environment class). This document hands the work to the next coding lead with everything
needed to resume. Nothing is claimed proven that is not proven; the automatable gates and the
real-input material actions are green, the world-body real-input clicks are not.

Authorization context: continuation of OPS-P08P10-CLOSE-GATES-01 ("two remaining repairs"). No
campaign/main movement. No P11. Real Builders remain P09-REQ-039 DEPENDENCY-BLOCKED.

---

## 1. Exact source / doc / tool identities (advertised = local, verify after fetch)

| Repo | Branch | Remote | HEAD | Remote HEAD |
|---|---|---|---|---|
| TypeScript | `wip/p08-p10-autonomous-stack-01-ts` | `hspector-github` (HSpector1/The-Movies) | `1ff018c25805e23ba1aa87618d3418afb4719603` | pushed, equal |
| Unity | `wip/p08-p10-autonomous-stack-01-client` | `origin` (HSpector1/project-studio-unity-visual-spike) | `039ece4945c6a313a8f2dc2b75b90181f9662056` | pushed, equal |

- **Unity HEAD `039ece4`** = the WIP preservation commit (§4). Its parents:
  - `f760d5d17db7dba12346781e2181be6502b1c688` — the **build commit** (oracle ghost-origin clamp fix). **The tested player was built from THIS commit, not from HEAD.**
  - `c71ffff862896eb95fabfa949a80509f5ca1104a` — the selection/occlusion + placement-harness repair.
  - `1d304f8…` — prior tip (intermediate candidate's Unity source).
- **TS HEAD `1ff018c25805e23ba1aa87618d3418afb4719603`**; the **engine was built from `a2baa1d9b3ffb2666732dba55823e09cc76c7352`** (the clean commit; `1ff018c` on top is docs-only). Verify `git diff --stat a2baa1d..1ff018c` touches only `docs/`.
- Campaign refs FROZEN, untouched: `campaign/living-lot-ts` `2753e18b…`, `campaign/living-lot-client` `c4c65db4…`. `main` untouched in both repos.

## 2. Exact tested engine / player hashes

| Artefact | SHA-256 | Provenance |
|---|---|---|
| Player executable (`Project Studio - Unity Visual Spike`) | `ab1fa09bfd1b8da00aeab32bfc85c9208a53ae460f0c6c92ce70439439e212f1` | built 2026-09-06T20:25:04Z from Unity `f760d5d`, TS `a2baa1d` |
| Assembly-CSharp.dll | `b647c5b36c382cc8e02e27c460232a315ad5bfddd6eb8215f5ecdfee4aa80777` | same build |
| Engine bundle (`dist/studio/engine.mjs`) | `189326b6fbd769bc9650d0ed43b92c9ba75c78565958f3074f4d5645605d065e` | `npm run build:studio` at TS `a2baa1d`; **byte-identical to the sealed engine** in the intermediate candidate |
| Manifest | `Builds/macOS/build-manifest.json` (Unity repo) | binds all of the above |

The player at HEAD is NOT rebuilt after `039ece4` (a proof-tool WIP change; no product code moved). To rebuild identically: `git checkout f760d5d`, `StudioAutomation.BuildMacOS`, `Tools/p04a1-build-manifest.sh`.

## 3. What is proven (final pair `ab1fa09b…` + engine `189326b6…`) — automatable gates + real-input material actions

| Gate | Result | Evidence |
|---|---|---|
| Unity EditMode (incl. 10 new occlusion cases) | **PASS 892 / 892** at `f760d5d` | `Evidence/_TWO-REPAIRS-PRESERVATION-20260907/editmode/editmode-final-*.xml` |
| New occlusion cases fail on the OLD code | **5 / 19 FAIL** (reviewer's case, envelope-inside, placed x-ray, missing occluder, walled NRE) | `…/editmode/editmode-runA-oldcode-*.xml` |
| TS floor: typecheck, typecheck:bridge, bridge-contract + fixtures, vitest | **PASS 5004 passed / 5 skipped** at `a2baa1d` | `…/logs/ts-floor-two-repairs.log` |
| Generated-contract seal (projection 19) | **PASS** | in the TS floor log |
| Visual Oracle sweep (P10 × 4 viewports + owner copy + P08(8) + P09(12) on projection-19) | **PASS 46 / 46**, every sidecar `complete`, every `run-binding.json` = `ab1fa09b…`/`f760d5d` | `Evidence/P10-Oracle-Sweep-TwoRepairs/summary.tsv` |
| Corrected `p09-valid-placement` (final pair) | **PASS** (2 quotes, origin held (12,14), ok:true) | `Evidence/P09-Placement-Final/p09-valid-placement-20260906T202606Z` (exe `ab1fa09b`) |
| Retained illegal `p09-invalid-placement` (final pair) | **PASS** | `Evidence/P09-Placement-Final/p09-invalid-placement-20260906T202613Z` |
| Owner-profile copy in-memory continuity | **PASS 48 / 48**; original untouched (`d949003e…`) | `…/logs/owner-copy-inmemory-two-repairs.log` |
| Owner-profile copy on the sealed engine | **PASS 11 / 11** | `…/logs/owner-copy-engine-two-repairs.log` |
| Compatibility boundary (p17 engine vs p19 engine) | **PASS** | `…/logs/compat-probe-two-repairs.log`; `Evidence/P10-Compat-Boundary-20260906T202509Z` |
| Real-input CONTRACT material action (P10-R1) | **PASS 0 failures** — renewal committed, $37,375 bonus, revision 0→2 | `Evidence/P10-Contract-Journey-TwoRepairs/hid-20260906T210520Z` |
| Real-input P09 BUILD material action | **committed with exact $1.5M debit** (cash 20M→18.5M) | `Evidence/P09-Journey-TwoRepairs/hid-20260906T211611Z` |

## 4. Successful and UNSUCCESSFUL real-input runs on the final pair

All three drives ran on exe `ab1fa09b…` in owner-idle windows via the detached chain `scratchpad/hid-chain.sh` (preserved at `Evidence/_TWO-REPAIRS-PRESERVATION-20260907/logs/hid-chain-two-repairs.log`).

- **CONTRACT — PASS** (`P10-Contract-Journey-TwoRepairs/hid-20260906T210520Z`, exit 0, 29 steps, 0 failures).
- **PEOPLE — FAIL** (`P10-Journey-TwoRepairs/hid-20260906T203249Z`, exit 2, 19 failures). Roster/filter/OPEN-PROFILE-from-Roster/Save/Load/Menu all PASS; the WORLD-BODY steps FAIL.
- **BUILD — FAIL** (`P09-Journey-TwoRepairs/hid-20260906T211611Z`, exit 2, 3 failures) — but the BUILD ITSELF COMMITTED ($1.5M debit). The 3 failures are all world-click-class.

## 5. Exact remaining failures + current hypotheses

The failing class is **world-body / world real clicks** — never the material action, always the pointer landing on a small/parallax world target under an intermittently-flickering focus. Distinct failures:

1. **PEOPLE step "1." — world person body click → inspector card (8 attempts, then the whole chain 11–17, 32–36).** The seated authoritative person is `t-cra-04` (Miriam Grimaldi, Crew), which ROAMS its authored marks across ~30 m of lot (probe boundsCenter ranged x −33…+1.8, z 24…54) and the click loop over-zooms (`zoomToward(bodyName, 44)`), shrinking the view so the figure walks OUT of the window — probe `chestScreen.x` at click time was 1732, 1766, −4 (off-window). A dropped synthetic keyup also left the camera panning mid-run (`diag.camera.movement:[-1,0]` at step 33), which cleared the navigation origin so BACK TO STUDIO never appeared. **Hypothesis:** the harness, not the product. Product occlusion/selection is EditMode-proven on the exact geometry (§3). Intended fix in §6.
2. **PEOPLE step "3b." — facade-over-hidden-person real click.** "no hidden sample within 180 s": from the wide/oblique boot camera the roaming person was never reported behind a building during the window (the direct-click retries consumed the budget). **Hypothesis:** needs active Post-framing + longer budget once step 1 resolves faster.
3. **BUILD step 5 (BUILD chip aim) and step 37 (post-Load world re-select of `placed-1`).** Same world-click-under-parallax class; the build commit and debit succeeded regardless.

**Root-cause the placement repair already fixed and re-proved:** `p09-valid-placement` failed because a held UP arrow (a dropped synthetic keyup) nudged the ghost off the parcel; it PASSES on the final pair, and `Tools/input-state.py` + launcher refuse/release now guard it. The people/build world-click failures are the SAME environment mechanism (dropped keyup → stuck camera) plus a roaming small target — not yet defeated by the harness.

Terminal-state law (§7 of the order): if the environment genuinely prevents the required real input, report the gate **BLOCKED (environment)** with the exact condition — do **not** claim final KEEP. That determination is NOT yet made; one genuine harness-fix attempt (§6) remains before BLOCKED-vs-PASS can be honestly concluded.

## 6. Partial edit + exact next command

- **Partial edit:** `Tools/p10-proof-people.mjs`, committed as **`039ece4` (WIP INCOMPLETE UNTESTED)**. It adds ONE helper, `osReleaseInput()` (OS-level HID key/button release + verify via `Tools/input-state.py release`), **defined but not called** — inert today, no product change. Diff is the commit body itself.
- **Intended, unfinished rewrite** (for the next lead): in step "1.", keep a WIDE management overview (skip/soften `zoomToward`) so the roaming figure stays in-window; call `osReleaseInput()` after each `frameClearOfUi`; click ONLY a still, in-window rect via the existing `clickWhenStill()` helper; generous retry budget across the walk cycle. In step "3b.", actively frame the Post and extend the observation budget. Strengthen `quietCamera()` with `osReleaseInput()`.
- **Exact next command** (after the edit, in an owner-idle window, from the Unity repo):
  ```
  P10_ENGINE_BUNDLE="$HOME/Desktop/P08-P10-Combined-Candidate-7b4d8ff-1d304f8/engine/engine.mjs" \
    Tools/p10-run-hid-people.sh "$PWD/Evidence/P10-Journey-TwoRepairs"
  ```
  (The launcher waits up to 6 h for a 600 s owner-idle window and refuses under held OS input. Then re-run `p09-run-hid-build.sh` for the two build world-clicks.) The player exe MUST read `ab1fa09b…` (rebuild from `f760d5d` if the harness is the only change — it is, so no rebuild needed).
- Do **not** loosen an assertion, move the person, remove a neighbour, or replace a click with programmatic selection to clear these. If a genuine harness fix still cannot land the click, the gate is BLOCKED (environment), documented — not KEEP.

## 7. Preserved evidence locations

- **Private (git-ignored, durable on disk), Unity repo:**
  - `Evidence/_TWO-REPAIRS-PRESERVATION-20260907/` — logs (ts-floor, owner-copy ×2, compat, oracle-sweep, hid-chain), editmode XML (old-code + final), review brief + attack findings + full workflow journal, and `repro-quote.sh`.
  - `Evidence/P10-Oracle-Sweep-TwoRepairs/`, `Evidence/P09-Placement-Final/`, `Evidence/P10-Journey-TwoRepairs/`, `Evidence/P10-Contract-Journey-TwoRepairs/`, `Evidence/P09-Journey-TwoRepairs/`, `Evidence/P09-Placement-RootCause/` (stuck-key reproduction), `Evidence/P10-Body-Probe-CloseGates/` (the probe the doorstep claim was built on).
  - Owner-profile private baselines: `~/Project Studio Owner Profile Baselines/P10-close-gates-20260906/` (0400/0600; NOT in Git). The real live profile is untouched.
- **Published (Git, TS repo):** `docs/campaigns/P08-P10-TWO-REPAIRS-2026-09-06.md` (root-cause trail + gate table), this handoff, `P08-P10-CLOSE-GATES-DISPOSITIONS.md` (§0.2 supersession).
- **Workflow transcript (durable):** `~/.claude/projects/-Users-bruce/b9153e56-e10b-4b22-a2bd-32411aa663f4/subagents/workflows/wf_d42f92b7-83a/journal.jsonl` (also copied into the preservation dir).
- The intermediate candidate `~/Desktop/P08-P10-Combined-Candidate-7b4d8ff-1d304f8` (player `1358fd1f…`, engine `189326b6…`) is preserved untouched. No successor candidate was assembled (blocked on the world-body gate).

## 8. Interrupted reviewer findings + review status

An adversarial cross-stack review (Workflow `wf_d42f92b7-83a`, brief in the preservation dir) ran the ATTACK phase to completion (28 agents) but the REFUTE and SYNTHESIS phases **failed on a session usage limit** (77 agents errored; resets ~02:40 CEST). **The review is INCOMPLETE and unadjudicated.** The attack phase produced 5 MAJOR / 14 MINOR / 14 NOTE raw claims (unverified; the refute stage that would confirm or kill them did not run). The 5 MAJOR raw claims, with my quick disposition where cheap to check — the next lead must adjudicate all of them:

1. **Record cites the wrong exe for one placement row.** The §2.2 20:23:30Z placement run is exe `65dfe3a9` (Unity `c71ffff`), not the final `ab1fa09b`. TRUE but non-substantive: a final-pair PASS exists at 20:26:06Z on `ab1fa09b`/`f760d5d` (§3). Fix the doc row.
2. **Five real-input gates NOT RUN at review time.** TRUE at review time; they ran afterward (§4): contract PASS, people/build world-clicks FAIL. Now reflected here.
3. **Placed-body occluder does not mirror the drawn ROOF slab.** CONFIRMED real: occluder covers 0..height; the drawn `Roof` (`StudioLotGrowthPresentation.cs:467`) sits at `height+0.15`, 0.3 thick, overhanging ±0.2, and is NOT covered — a person behind the roofline from a high angle can x-ray through the roof. The record's "mirrors exactly what is drawn opaque" OVER-CLAIMS by that 0.3 m band. Same class as the disclosed barrel-roof gap. Substantive; adjudicate severity.
4. **The 19:51 held-UP-arrow OS readout has no retained artifact.** Partly fair: the reproduction (fail-under-held-key then pass-twice-after-release on the SAME exe `1358fd1f`, `Evidence/P09-Placement-RootCause/`) IS the evidence; the raw live key-state print at 19:51 was not saved to a file. Consider capturing `Tools/input-state.py report` into the evidence dir on the next run.
5. **Stage A barrel-roof x-ray may be live at the NORMAL management cameras, not only a "steep" pitch.** UNVERIFIED and potentially the most important: if a person inside Stage A is selectable through its roof/gable from the home or Post frozen cameras, the §1.4 disclosure understates a real player-visible x-ray. This is authored-art collider scope (BarrelRoof/Wedge helpers omit colliders), outside the bounded selection-rule repair, but its SEVERITY must be adjudicated before any KEEP. **Recommend the next lead verify this first** (a focused EditMode case at the frozen cameras with a person inside Stage A).

Full raw findings: `Evidence/_TWO-REPAIRS-PRESERVATION-20260907/review/review-attack-findings.txt`.

## 9. Working-tree state at handoff

Both repos CLEAN (no dirty/untracked) after the WIP commit and doc commit; both pushed; advertised remote HEADs equal local (verify block below). The only intentionally-uncommitted-then-committed item was the partial harness edit (now `039ece4`).
