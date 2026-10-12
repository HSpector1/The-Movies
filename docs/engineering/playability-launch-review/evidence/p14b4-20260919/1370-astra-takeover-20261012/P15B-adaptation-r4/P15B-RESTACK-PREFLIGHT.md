# P15B existing-clone restack preflight — verified read-only

GPT-6.1 Sol specialist,2026-10-12. No source/clone/index/HEAD/ref writes, tests/builds, clone creation, resets, stashes or source-tree copies were performed. Only this scratch note is written. Parent has now committed/pushed/read back actual Save47 **d68d4b13b454922cf84eff5c0c73cae3e780eebe**, source **2bcac39e1c88ba48f24df44e015d3b7b7f5a06af**, production clean (`SAVE47-PUBLICATION.json`). These publication facts are parent-verified; this specialist did not fetch or alter clone refs.

## Exact recovered state

Existing clone: `/Users/zacheryspector/studio-specialists/p15b`; branch `p15b/r2-stacked`; HEAD **8cecf5aa8a7073fdad8a02534fe40d67ba54558e**; HEAD:src **3c18d3546150f5e68ed725ca3b9ea76518b288e5**. One registered worktree, local `.git` common directory, no unmerged entries.138 dirty paths:137 candidate paths plus local-only HANDOFF.md. There are **no untracked nonignored paths**. New files use existing staged/intent-to-add entries and are represented by the complete patch; an empty untracked listing does not mean they can be omitted.

All137 public manifest postimages match actual file bytes, SHA256 and mode. Full working delta, staged delta and porcelain status each match the preserved08:38 originals byte-for-byte. **No uncaptured dirty/source/index/status change found.**

| Preserved artifact | Bytes | SHA256 / verification |
| --- | --- | --- |
| Public `drafts/p15b/SOURCE.patch` |1710235 |`71b7a337bd907dba786bb110cc3ea991aa5605e5192c3fef00a37a5b7ac985a8`; current HEAD→working source diff excludingHANDOFF identical |
| Local `originals/p15b/FULL.patch` |1712880 |`4cbc672f3e5708cdb9fd6378c38ff774d70e149b8f35587f1f9b5b8afd7f20ba`; full current diff identical |
| Local `originals/p15b/INDEX.patch` |1580280 |`03961925af511847ffd64faad26821131e2f6bc82fc6edec740b60b380e1596e`; current staged diff identical |
| Local `originals/p15b/STATUS.txt` |preserved |exact current porcelain match |
| Public `drafts/p15b/BASE.bundle` |385072 |`805e6b70e64424fa0f68778271297ed611953ef08488c661bc7385788fada7f4`; manifest names db3fc572 prerequisite and includes exact local8cecf5aa stack base/generated1364 inputs, not Owner saves |

Public root is `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1370-astra-takeover-20261012/drafts/p15b/`. Local root is `studio-scratch/1370-astra-takeover-20261012/originals/p15b/`; original package cuts remain its `package/`. The package's old134-file PATCH/MANIFEST is not the final137-file source inventory: use the public exact SOURCE.patch plus base bundle, not a stale early cut. Prior r3 gate results and final four-file amendments remain preserved.

Ignored sparse-environment material is outside this source/status inventory. The already identified docs inputs and role-atlas data need exact required-input binding during verification; this preflight neither scans arbitrary ignored data nor claims it is all backed up.

## Nondestructive adaptation proposal — not executed

Reuse this clone after parent explicitly assigns sole adaptation ownership for the published Save47 SHA above. Keep later packages parked. Do not apply the old r1 patch or reset the clone to manufacture a clean gate.

1. Repeat these narrow identity checks immediately before mutation. Refuse any difference from the captured137 source postimages, index/full patches or local-only HANDOFF; preserve any genuinely new work first. The existing INDEX.patch retains original staging boundaries independently from the source reconstruction.
2. Preserve the original dirty draft as a **local-only checkpoint branch/commit** on8cecf5aa. Create `p15b/preserved-r3-20261012` at currentHEAD with the existing dirty tree, leaving former `p15b/r2-stacked` at8cecf5aa. Stage exactly the137 manifest source postimages plus already preserved local-only HANDOFF bytes: the exact138 dirty paths, without rewriting any original content. Verify staged postimages/no extra paths before the local preservation commit. Keep this checkpoint/ref local; its HANDOFF history must not be pushed. This preserves metadata rather than discarding it to make switching possible.
3. Bring the **actual published working ref** into this clone under an explicit remote-tracking ref and verify its advertised SHA equals the parent Save47 readback. Keep older refs/checkpoint/base bundle. Create a new candidate branch from that exact Save47 commit in the same clone using ordinary Git switch after the old dirty draft is committed/preserved. This is an existing-clone checkout, not cloning or a source-tree copy. Do not switch/reset production or another worker's clone.
4. Apply **the verified final SOURCE.patch** with three-way preimage handling to the new Save47 branch. Use `apply --check --3way` first, then `apply --3way --index`; expect conflicts and resolve only assigned candidate paths. This is deliberate adaptation of a hash-bound reviewed draft, not blind replay. The clone retains8cecf5aa objects; fetch/reconstruct its advertised base bundle only if an object is unexpectedly absent. Do not add whole old source trees.
5. Preserve both authorities in conflicts: actual Save47 funding invariants/renewal guard/live helpers/test amendments AND P15B loan/condition/closure producers. Save48 remains48 over actual47; do not allocate49 or change original-era fixtures. Named Save48 block, `validateSaveV47Era` and allocator switch must preserve r7's founding context rather than replacing save.ts wholesale. Reconcile the36 previously identified overlapping changed paths. Keep adopted C10 operating derivation and prospective Legacy/compatibility decisions explicit; do not call disabled end-run hooks complete.
6. Cut a new adapted patch against the exact **actual Save47 predecessor**, with exact per-file manifest and old-source provenance. Review adaptation delta independently before the parent schedules focused prerequisite checks/reproductions and full gate. Never relabel earlier stacked r3 evidence as this new source. Repair only actual actionable findings; retain pending natural-recovery, terminal-Legacy and compatibility proof obligations.

### Concrete command shape after authorization

Every command uses `git -c gc.auto=0 -c maintenance.auto=0 --no-optional-locks -C /Users/zacheryspector/studio-specialists/p15b`. Commands below use the parent's actual published commit; they remain a proposal until sole clone ownership/adaptation is assigned.

- Verify `rev-parse HEAD`, `symbolic-ref --short HEAD`, `status --porcelain=v1 --untracked-files=all`, and the hash-bound `diff --binary HEAD -- . ':(exclude)HANDOFF.md'` against public SOURCE.patch.
- `switch -c p15b/preserved-r3-20261012` at currentHEAD, then stage the explicit138 preserved paths and commit the exact draft locally. Formerbranch stays8cecf5aa; no metadata rewrite is needed to preserve it. Respect any actual hook requirements and the global heavy lane; do not bypass hooks or launch tests implicitly.
- `fetch --no-tags /Users/zacheryspector/The-Movies-headless-program refs/heads/wip/headless-program-20260916-ts:refs/remotes/production/wip-headless-program` then `rev-parse refs/remotes/production/wip-headless-program`; require equality with **d68d4b13b454922cf84eff5c0c73cae3e780eebe** and explicit network remote readback already supplied by parent.
- `switch -c p15b/save48-on-d68d4b13 d68d4b13b454922cf84eff5c0c73cae3e780eebe`, only after clean/preserved local state and confirmed fresh branch name.
- `apply --check --3way <public SOURCE.patch>` then, after inspecting its conflict/preimage result, `apply --3way --index <public SOURCE.patch>`. If apply-check cannot model conflict output, stop at its exact result and review the declared three-way conflicts; do not fall back to fuzzy/plain force application or stale-file overwrite.
- Finish with source/index/postimage inventory, reverse application check of the NEW patch and exact predecessor binding. Parent remains sole production integrator/publisher.

## First actual engineering work after adaptation

The untouched old r3 final gate has one new research-disposition failure that may be a post-closure fixture premise: verify actual closureWeek versus research.startedWeek before changing any validator. The loan reset exists, but no measured borrower restarted filming; use adopted bounded recovery witness map on the actual adapted source. Implement the reviewed prospective actual-closure Legacy producer/catalogue and required proof obligations before claiming player terminal acceptance. Preserve prior failed and negative-control evidence throughout.

This note supplies a practical preservation/checkout/three-way adaptation sequence, not permission to mutate now or to waive gate failures.
