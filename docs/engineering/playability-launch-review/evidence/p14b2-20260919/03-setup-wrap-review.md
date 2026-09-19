# P14B.2-F1 — inherited completed-setup save defect

Native contract-auditor read-only review, persisted by parent, 2026-09-19.
Source: `e37cd2330be8c9129b0193a2bf8e84258e851307`; no B2 production edit yet.
Verdict: **KEEP the diagnosis/correction direction; stable independent RED owed.**

Parent read completed raw probe `02a`: actual first-take → next-tick fixture save
fails through V29 → frozen V25 at `validateProductionSetup`. Before/after hashes
of its two untracked test sources match, but those source bytes were not retained
in `02a`'s empty tracked patch. Preserve that reproducibility limit. Later probes
retain full source snapshots; a focused fresh RED will establish the fix baseline.
The author reports `02c` reproduces week 61→62, Post phase, null live stage binding
versus the completed setup's recorded stage 07. Author will hand back stable proof.

## Source conflict and durable witness

`productionSetup.ts:360` unconditionally compares the recorded setup stage to
current occupancy. `operations.ts:1239–1274` deliberately releases the stage when
shooting finishes while retaining setup/Set history. `save.ts:8110` applies the
same validator through V25. Holding the stage or deleting completed setup would
discard or contradict existing physical/work history.

Use the permanent `studioEvents` **wrapped** event: `operations.ts:1334–1339`
records exact production/stage/Set before Post allocation. `studioEvents.ts:64–75`
classifies it permanent and compaction at 231–238 retains it. First-take receipts
do not prove wrap/release and do not exist in genuine V25 inputs. Windowed
phase/setup events must not become required historical proof; `studioHistory`
is a separate projection and unnecessary here.

Two validator modes:

1. Before wrap: keep exact live stage/Set agreement.
2. After wrap: allow the released stage only for completed setup with matching
   permanent wrap (same production, recorded stage and Set), completion no later
   than wrap and wrap no later than current week. Keep retained Set identity and
   require a released stage; a past wrap must not excuse a different current stage.

Do not gate solely on phase: wrapped work waiting for Post remains `shooting`
with no stage/task. Preserve existing operations invariants and every units/date/
revision/recipe/route/adoption/equipment/prior-work check.

## Independent regression contract before implementation

- Real selected setup → scheduled first take → wrap → Post: unchanged completed
  setup, released stage, successful save/load.
- Wrapped but Post-blocked: same proof without restoring occupancy.
- Retain post-wrap workflow beyond event window; compact/round-trip without Tier-W
  setup or phase events, preserving permanent wrap proof.
- Separately remove/corrupt matching wrap, stage, Set and production reference:
  each rejected; unfinished setup and invalid completion/wrap ordering rejected.
- Rehearsal/active shooting detached from actual binding still rejected. Existing
  forged lighting/provenance and genuine historical fixtures remain verified.

## Delegated technical reconciliation, not new gameplay policy

R07's old plan literally forbids a record on a post-Shooting workflow, conflicting
with retained setup history and unchanged stage-release law. Explicitly distinguish
new setup selection/admission (pre-Shooting only) from already completed historical
evidence retained after wrap. The correction must neither schedule setup in Post
nor invent past work. No new save shape/version, chooser law or UI behavior.
This inherited prerequisite is separate from B2's read-model implementation and
does not reclassify the completed T4 full-run results.
