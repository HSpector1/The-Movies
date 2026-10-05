# Recovery G-P / G-L / K3: smallest reuse map

Read-only inventory, no new driver or runtime. `S` is `/Users/zacheryspector/studio-scratch`; `E` is the repository's `docs/engineering/playability-launch-review/evidence/p14b4-20260919`. Exact existing driver hashes are in `SOURCE-PINS.json`. This updates the stale post-release status in `S/1363-measurement-prep/IMPLEMENTATION-MAP.md` without editing that preserved map.

## Authority and immutable comparisons

1363-A §6.8 requires the two recorded natural routes on the tree carrying recovery. 1363-F ruling 7 makes G-P **and** G-L mandatory on the same final candidate; K3 compares their canonical manifests. Its P5 row says these run once after Part B (now integrated A+B+C under A2), not once for each transient arm. 1361-F6 ruling 3 separately requires seed-b save/reader costs at 6240, 8791 and after an actual post-2040 player release.

Accepted original source: `d5e2dad1e23183f1a94fe7b7d30e65ed88617f34`, src `88d0197645b3a5bd69d73ebff0c5c1c9ff0aa837`, identical production to original `2eaa697e`. Current F6-quality/recovery source must never be mislabeled as that original. The final recovery commit is not yet landed: fill its actual full HEAD/src identity when parent freezes it; do not bind this map to the coordinator's Save45 HEAD.

| Accepted original evidence | Result retained as the comparison base |
| --- | --- |
| `E/1367-K-save45-legacy-performance.md`; `E/1367-stage/gl-natural-r1/{gl.json,run.meta,INDEPENDENT-REVIEW.md}`; original `S/1361-gl-runs/natural-r1` | Both natural seeds reach 6240; historical G-P and same-state independent adapter match live manifest; caps pass, no retune trigger. Seed-b natural extension reaches 8791, official unchanged. Combined writer + extra-reader medians 5684.208 / 10882.878 ms; bytes 33,541,463 / 41,261,217. |
| `E/1368-C-postrelease-accepted-and-recovery-green.md`; `E/1368-stage/third-verification/reviews/DELAYED-POSTRELEASE-MEASURED.md`; `S/1368-postrelease-run-01/{RUN.json,binding.json,out/RESULT.json}` | Accepted genuine seed-b delayed operation: release tick 6249, arrived state 6250; seven paid 208-week contracts, 187,894 signing bonuses. Three paired save timings before operation at 6240 and after release; combined medians 6121.251 / 4639.524 ms, bytes 33,033,972 / 33,084,716. Official unchanged, actual ten-week replay exact. 624.459 seconds, child 0, no timeout. |

The second result closes the original-source requirement. Do not rerun or overwrite `1368-postrelease-run-01`, its output or its five `E/1368-original45-delayed-postrelease-r1*` recorder files. Its different controller/engagement route does not replace the two natural routes. These timings are report-only call measurements, not a full Bridge budget pass or a causal claim that release makes validation faster.

## Reuse, with the exact changes still needed

| Existing driver | Reuse and required recovery binding |
| --- | --- |
| `E/1361-stage/gp/1361-GP-probe-r2.ts` | Authority for the independent facts adapter and G-P report. Do not run wholesale unchanged: it explicitly refuses live campaignLegacy and carries obsolete pre-production bridges. Its adapter is already extracted below. No 1359 absent-root probe revival. |
| `S/1361-gl-prep/1361-GL-independent-adapter.ts`, provenance `GP-SOURCE.txt` | Reuse the reviewed independent extraction. It reads actual source facts and never reads campaignLegacy or calls the production fact adapter. Refresh any actual type/era seam explicitly, not by removing recovery data. |
| `S/1361-gl-runs/natural-r1/probe/1361-GL-probe.ts` (same method as prep) | Reuse one natural pass per seed: `p13aGeneratedStudio(seed)` then default public tick, seeds `p13a-core-causal-01` and `seed-b`, exactly 6240; seed-b continues to 8791. Refresh Save45 guard and additional reader to actual Save46. At the same reached 6240 state independently adapt/build and retain both G-P and live G-L outputs. Replace historical-GP equality as a PASS requirement with same-candidate independent equality; retain historical comparison as attributed differences, never normalize recovery effects away. |
| `S/1361-gl-prep/run-1361-gl-natural.sh` | Reuse exclusive path/symlink refusal, exact archive identity, Node 20.20.2, power logging, caffeinate, 5 GiB guard, pre/post source checks and artifact pins. Bind a NEW recovery root, reviewed copied probe/adapter and same-source G-P evidence. Current wrapper/reference are Save45-pinned and are not a ready recovery command. |
| `S/1368-postrelease-run-01/probe/postrelease.ts`; original source `S/1368-postrelease-prep-v3`; `run-delayed.py` | Reuse the accepted delayed public-operation method in a NEW recovery package: genuine seed-b genesis + fresh industry, unengaged default ticks to 6240, then actual paid market signing/activation and unchanged direct-package/default ticks to first actual release within 6344. Refresh every explicit original HEAD/src/Save45/validator/artifact label to frozen final recovery identity/Save46. Preserve all payment, public codec, frozen-official, saved-boundary replay and three-pair timing checks. Do not replace actual failure with the original release date or assume 6249 repeats. |

The smallest candidate K3 work is the existing same-state independent rebuild in the natural G-L pass, with separately retained candidate G-P and G-L canonical evidence; no second simulation is needed merely to derive identical facts from the same route boundary. The parent must review that output split as fulfillment of both G-P/G-L, not report the old reference as candidate G-P. All candidate identity, package/config/runtime/helper hashes and generated inputs must be pinned; exclusive new destinations and the recorder's five artifacts remain mandatory.

## Existing command interfaces (inventory, not executable recovery commands)

From the isolated gating tree, original G-P documented:

```bash
PROBE_TREE_HEAD=<pinned-candidate> PROBE_WEEKS=6240 PROBE_SEEDS=p13a-core-causal-01,seed-b ./node_modules/.bin/vite-node ../probe/1361-GP-probe-r2.ts
```

The natural wrapper interface is:

```bash
bash S/1361-gl-prep/run-1361-gl-natural.sh <full-accepted-head> <new-run-leaf>
```

Its child is `PROBE_TREE_HEAD=<pin> <archive>/tree/node_modules/.bin/vite-node --root <archive>/tree <archive>/probe/1361-GL-probe.ts`, with stdout/stderr going to the exclusive output. Both commands require the recovery changes above; do not invoke their original Save45 files against Save46.

The accepted delayed wrapper interface is `python3 S/1368-postrelease-prep-v3/run-delayed.py --head <dependency-head> --prep-manifest-sha256 <reviewed-pin>`. It invokes the five-file recorder and an exclusive child, whose actual command is:

```bash
node <repo>/node_modules/vite-node/vite-node.mjs --config <run>/probe/vite.config.ts --script <run>/probe/postrelease.ts
```

The child receives `P1368_OUTPUT=<new-output>` and `P1368_BINDING=<new-binding.json>`. Existing runner hardcodes original archive/root/stem and refuses output reuse; a separately reviewed recovery copy must refresh these. Keep its 7200-second operational bound and fixed 6344 route cap unless separate authority changes them. Parent controls the one-heavy lane and actual absolute paths; no command above was run here.

## Candidate events and acceptance still outstanding

1. Freeze final integrated recovery source; strict-check refreshed reused drivers and prove exact source/helper bindings before runs.
2. Natural 6239→6240 actual freeze for each seed: save live stamped official, same-state independent G-P manifest, full canonical/hash comparison stripping **only** legacySnapshotId, p15DomainSequence, phaseId, phaseOrdinal and phaseOrderVersion. Report source/domain tables, each archetype's held/notHeld/notRecorded lists, stamped/unstamped bytes and full freeze-tick/adapter/law timings.
3. Preserve structural cap law (16 domains, fixed 10 studios, 8 archetypes, 12 lenses, 12 refs per side/lens, 4 count keys). About 140 KB is an estimate, not an invented hard byte ceiling. Compare original versus recovery holders and explain changed real facts. Any all-studios/all-seeds or zero-holders/evaluated-archetype trigger remains a finding under the adopted retune route even if K3 and process exit pass; retain absent-P15B resilient-survivor exemption.
4. Seed-b natural 6240 and 8791: three sequential makeSave + additional live-reader pairs and serialization byte sizes outside timers. Prove official bytes remain unchanged through extension. Separate actual Bridge/harness ceilings from these report-only measurements.
5. Separate recovery delayed-player route: reach genuine 6240 original freeze, perform actual paid operations, find first actual player release by 6344, measure reached boundary with same three-pair protocol, preserve frozen official and exact action replay. Unattained event is a finding, not an authority to mutate funds or extend the route.
6. Independently review outputs/guards and write final dispositions. None of these recovery events is discharged by accepted original45 evidence or by the shorter natural520 recovery measurement. Later enabled shared-market and real P15B-loan re-probes stay separately governed; no new route or product rule is introduced here.
