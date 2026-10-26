# Sprint 5: recovery of the three missing r3n1 checkpoints

Status: original inputs unavailable through the inspected local references. No checkpoint was recovered, fabricated, regenerated, copied or hydrated. This report records a bounded read-only investigation under the Owner's Sprints 5–16 authorization. The coordinator remains the repository writer and runtime owner.

## Required original paths

All paths below are relative to the engine repository:

- `evidence/Playability-Interaction-01/fixtures/r3n1-dense-02/generated-r3n1-dense-02.checkpoint.json`
- `evidence/Playability-Interaction-01/fixtures/r3n1-dense-02p31/generated-r3n1-dense-02p31.checkpoint.json`
- `evidence/Playability-Interaction-01/fixtures/r3n1-dense-02p32/generated-r3n1-dense-02p32.checkpoint.json`

They are absent from disk and the candidate index. Their original producer reports are also absent from the referenced `evidence/Playability-Interaction-01/entry/` directory. The known engine convergence checkout `/Users/zacheryspector/The Movies - Unity Production Convergence 80H` exists, but neither its lowercase `evidence/Playability-Interaction-01/` nor its uppercase `Evidence/Playability-Interaction-01/` directory exists. No recursive private-save search was performed there.

## Exact provenance and available hashes

| Original input | Recorded identity and producer |
| --- | --- |
| `r3n1-dense-02` | SHA-256 `bd64bbeb1dce2f39455e20ee1b562f1d16c464bd76d907624fe7774e8d251005`; 126,547 bytes; week 21. Original producer/report: `entry/generate-r3n1-dense-02.ts` and `entry/generate-r3n1-dense-02-report.md`. |
| `r3n1-dense-02p31` | Projection 31 migration-only sibling of the immutable original, with no actions or ticks. Original producer/report: `entry/generate-r3n1-dense-03.ts` and `entry/generate-r3n1-dense-03-report.md`. No full checkpoint hash was found in the inspected references. |
| `r3n1-dense-02p32` | Projection 32 migration-only sibling of the immutable original, with no actions or ticks. Recorded SHA-256 prefix only: `a16839b7…`. Original producer/report: `entry/generate-r3n1-dense-04.ts` and `entry/generate-r3n1-dense-04-report.md`. No full checkpoint hash was found in the inspected references. |

Full original hash source: `docs/engineering/playability-launch-review/06-FABLE-ADOPTION-AND-FRESH-SESSION-HANDOFF.md:2138` and `:2180–2186`. The latter records the source `native-post-start-run16`, three real `commissionScript` actions and two engine ticks, ending at week 21 with the offered `resolveProductionBlocker` / `scheduleShootingTake` decision on `prod-0015` preserved. It records immutable creation with `wx`, mode 0600, and cash remaining positive. These are historical provenance statements, not evidence that the bytes exist on this host.

Projection 31 producer/migration source: `tests/r3n1-stale-schedule-take-02p31.test.ts:4–14`; actual required checkpoint path at `:105`. Projection 32 source: `tests/r3n1-stale-schedule-take-02p32.test.ts:12–23`; actual required checkpoint path at `:96`. The base test names its generator and report at `tests/r3n1-stale-schedule-take-02.test.ts:4–12`, and loads its checkpoint at `:98`.

Projection 32 hash-prefix source: `docs/engineering/playability-launch-review/CONTINUATION-STATE.md:6015–6017`, recording DATA-07, dense-02p32 prefix `a16839b7…` and TS refusal proof commit `71ce3aa7`. That entry also names the distinct dense-03p32 missing dependency; it is not a substitute for these three inputs.

## Inspected recovery manifests

The existing authorized recovery guide was read at:

`/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012/GAME-ICLOUD-RESTORE-r1.md`

The guide requires archive hash verification, restoration into a fresh temporary directory with sufficient space, verification against the manifest, and restoration only of required missing original paths. Existing files must be compared and preserved. It is not authorization to fabricate replacements or download unrelated material.

Only metadata from these two exact manifests was inspected:

- `/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012/GAME-ICLOUD-ARCHIVE-MANIFEST-r1.json`
- `/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012/GAME-ICLOUD-ARCHIVE-MANIFEST-r2.json`

Neither manifest contains `r3n1-dense-02`, `generate-r3n1-dense-02` or `Playability-Interaction-01`. Therefore these two known archives provide no manifest-authorized restoration path for the missing checkpoints. Neither archive payload was opened, extracted or downloaded.

## Existing absence evidence and precise residual

`docs/engineering/playability-launch-review/HEADLESS-PROGRESS.md:2559` records the three fixture families as git-ignored local inputs remaining on the old laptop, with six ENOENT assertion failures and the explicit historical classification “ENVIRONMENT: not recoverable here.” `docs/engineering/playability-launch-review/UNITY-INTEGRATION-BACKLOG.md:1050` independently records that the Unity-side r3n1 fixtures are not on this host.

The original full-gate failures remain missing-input failures, not tested functionality. Their staleness laws are not proved by an ENOENT or by a newly generated current-schema world. Recovery requires the original three-fixture package and its original producer reports from the old machine or a specifically identified original backup. Verify the full known base hash and recover the sibling full hashes/provenance before admitting those bytes. No broader archive or private-save search is justified by the inspected manifests alone.

Heavy execution remains independently blocked by the coordinator's measured disk readiness and exclusivity requirements. No intensive runtime, generator, Git mutation or repository write was performed by this investigator. This external report is the only authorized write for this recovery assignment.
