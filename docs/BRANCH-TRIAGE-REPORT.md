# Remote Branch Triage Report

Inventory captured on 2026-08-20 after a non-pruning `git fetch hspector-github`.  The authoritative comparison point is `hspector-github/main` at `5914c84e453461240540184e79b2bd7eafeb647f`.

## Summary counts

| Measure | Count |
| --- | ---: |
| TOTAL REMOTE BRANCHES | 59 |
| ACTIVE | 10 |
| UNIQUE-HISTORY-KEEP | 42 |
| FULLY-MERGED-SAFE-DELETE | 6 |
| UNKNOWN-DO-NOT-TOUCH | 1 |

## PROPOSED SAFE DELETE SET

The following are proposals only.  No branch was deleted or otherwise changed.

- `docs/character-handoff-r2-propagation`
- `docs/character-track-durable-record`
- `docs/governance-reconciliation-pre-c2`
- `docs/handoff-ruling-propagation-lesson`
- `docs/packet-hardening-propagation`
- `parity-master-plan-v1`

## Inventory

`Docs ref` is an exact branch-name search of Markdown tracked by current `main` (including the required root documents). `Not main` means the branch has commits not reachable from `main`; `Unique` is `git rev-list --count main..HEAD`. All three `ancestor` columns are Git reachability checks. `NONE` is mandatory for every non-delete classification.

| Branch | HEAD | Latest date | Latest subject | Ancestor main | Ancestor c2a | Ancestor visual | Not main | Unique vs main | Docs ref | Classification | Reason | Deletion confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- |
| art-adopt-stage-a-h2 | 33eb33ae307904aa3f00db20bc695e40bf46d1e4 | 2026-08-11 | feat(lot): adopt authored Stage A H2 | YES | YES | YES | NO | 0 | YES | UNIQUE-HISTORY-KEEP | Current docs name this production-adoption checkpoint. | NONE |
| art-authored-stage-a-h2-offline-proof | 1fba98e010cf09106ae9f76b118e0bf1c14cb285 | 2026-08-11 | fix(lot): correct authored Stage A H2 runtime read | YES | YES | YES | NO | 0 | YES | UNIQUE-HISTORY-KEEP | Current docs preserve the authored-stage proof trail. | NONE |
| art-d1a-concept-a-player-enablement | 0c6ff3d0ef7d47b50429fbd36bec5d2b7ea492e4 | 2026-08-05 | docs(art): correct Concept A enablement file count | YES | YES | YES | NO | 0 | YES | UNIQUE-HISTORY-KEEP | Referenced art-package checkpoint. | NONE |
| art-d1a-studio-identity-visual-proof | 8e40ebfbed0102c2ff315b5cc6a2ceb0c9117b5a | 2026-08-04 | docs(d1a): correct verified inaccuracies in D1-A art package (documentation only) | YES | YES | YES | NO | 0 | YES | UNIQUE-HISTORY-KEEP | Referenced visual-proof checkpoint. | NONE |
| art-d1b-soundstage-composer-proof | 00dfbe036a622d582f365ce0ce2218ce490e61ab | 2026-08-09 | docs(art): close D1-B adoption review findings | YES | YES | YES | NO | 0 | YES | UNIQUE-HISTORY-KEEP | Referenced D1-B proof and adoption record. | NONE |
| art-fable-authored-environment-spike | 35a689e543bcd6aace0833734d695442704418f7 | 2026-08-10 | docs(art): record the spike's final production outcome (Option D merged as fdfdfea) | NO | NO | NO | YES | 3 | YES | UNIQUE-HISTORY-KEEP | Sealed, documented spike outcome retains unique history. | NONE |
| art-research-open-source-integration-blueprint | 4a79939dea5b282bba9f1e217053037629d28558 | 2026-08-01 | docs(research): open-source art and presentation audit into D1 integration blueprint | NO | NO | NO | YES | 60 | NO | UNIQUE-HISTORY-KEEP | Substantial named research blueprint remains unmerged. | NONE |
| asset-lab-03-hero-soundstage | a4da10c640bb4a2a9fb3f443ed71b4b90e1cb197 | 2026-07-28 | Asset Lab 03: apply final owner review corrections | NO | NO | NO | YES | 7 | NO | UNIQUE-HISTORY-KEEP | Named asset-lab artifact with unique production history. | NONE |
| asset-lab-04-studio-lot | 73905dcccbc5d839e1688d791a1c2ac2357695d0 | 2026-07-28 | Asset Lab 04: create refined studio lot architectural proof | NO | NO | NO | YES | 8 | NO | UNIQUE-HISTORY-KEEP | Named Studio Lot proof retains unique history. | NONE |
| asset-lab-05-blender-pipeline | f4f60b4f94b112976d35f035aa773e7178c955c7 | 2026-07-29 | Asset Lab 05: Blender production-art factory + Scene G vertical slice | NO | NO | NO | YES | 9 | NO | UNIQUE-HISTORY-KEEP | Named pipeline and vertical-slice artifact remains unmerged. | NONE |
| asset-lab-05b-character-rebuild-loop | 4a3ce6ef8bb592f093b4febacef4bd03b5a30d47 | 2026-07-29 | Asset Lab 05B: finalize character LODs and runtime proof | NO | NO | NO | YES | 14 | NO | UNIQUE-HISTORY-KEEP | Named character-proof iteration retains unique history. | NONE |
| asset-lab-05c-character-art-refinement-loop | d912ca1e4d887a9bd26850b06394bb26db0fc38d | 2026-07-29 | Asset Lab 05C: finalize character materials LODs and review scene | NO | NO | NO | YES | 19 | NO | UNIQUE-HISTORY-KEEP | Named character-refinement iteration retains unique history. | NONE |
| asset-lab-05d-character-professionalization-loop | 598c59439f0bd85a0b50c1291e09177be9a3dfd8 | 2026-07-30 | art: 05d iter 12-13 holistic pass + close final-gate majors | NO | NO | NO | YES | 31 | NO | UNIQUE-HISTORY-KEEP | Named professionalization iteration retains unique history. | NONE |
| asset-lab-05e-character-art-cleanup-loop | 6169574a1965b10583f705a4dc5934609553dff9 | 2026-07-30 | Asset Lab 05E review harness: lineups perform Idle_Loop live (cover the 6th required clip) | NO | NO | NO | YES | 41 | NO | UNIQUE-HISTORY-KEEP | Named review-harness artifact retains unique history. | NONE |
| asset-lab-05f-hero-electric-character-proof | 80e8b36e174ffa26d81537288bb357323b85ea5c | 2026-07-30 | Asset Lab 05F: final-gate refinements + hero standards & report | NO | NO | NO | YES | 48 | NO | UNIQUE-HISTORY-KEEP | Named hero-character proof retains unique history. | NONE |
| asset-lab-05g-hero-electric-surgical-correction | ee83d0eb6d6ac57f09812002c90a3846c65e0ba2 | 2026-07-31 | Asset Lab 05G: LODs, runtime harness, validators, evidence + reports | NO | NO | NO | YES | 52 | NO | UNIQUE-HISTORY-KEEP | Named corrective/evidence package retains unique history. | NONE |
| asset-lab-05h-authored-base-character-proof | 9e3c5d7bda39f069b7dac04624584c4fea645332 | 2026-07-31 | Asset Lab 05H: finalize style — soften face, warm skin, add hair (Iteration 4) | NO | NO | NO | YES | 59 | YES | UNIQUE-HISTORY-KEEP | Current handoff docs explicitly preserve this proof checkpoint. | NONE |
| asset-lab-05h-final-owner-review-package | ddfd69fbc22be313f9dbb548c2b16032c9802daa | 2026-08-03 | Asset Lab 05H: final owner-review docs + Art-PM recommendation | NO | NO | NO | YES | 62 | YES | UNIQUE-HISTORY-KEEP | Referenced owner-review package with unique history. | NONE |
| asset-lab-05i-corrective-character-pass | 8903b1e8bbbc166aa1b74a33167aea964502a1f6 | 2026-08-03 | Asset Lab 05I Iteration 2: evidence + final docs + owner index | NO | NO | NO | YES | 66 | YES | UNIQUE-HISTORY-KEEP | Referenced corrective-pass evidence and owner index. | NONE |
| asset-lab-character-human-artist-handoff | 66b44b28d04b2fe0a1cf81abd8153ad0d2c3b1a8 | 2026-08-08 | fix(handoff): harden validator diagnostics and repair semantics | NO | NO | NO | YES | 77 | YES | UNIQUE-HISTORY-KEEP | Active handoff artifact with unique history. | NONE |
| audit-d16-economy-recovery-decision-lab | c679f88d5f6e329e4c8f00bb5c0c11cbd2142a67 | 2026-08-12 | D-16: record Owner rulings and close the milestone (docs only) | YES | YES | YES | NO | 0 | YES | UNIQUE-HISTORY-KEEP | Current docs retain this sealed decision-lab checkpoint. | NONE |
| backup/project-studio-consolidated-2026-07-28 | 7f9fc1dbd44126c4bec1547be1e20e4392555236 | 2026-07-28 | Asset Lab: re-capture at committed HEAD b6130c81 (supersede WIP) | NO | NO | NO | YES | 2 | NO | UNIQUE-HISTORY-KEEP | Explicit backup branch with unique recovery history. | NONE |
| c2-sets-throughput-plan | b60dab0297018978a2e8070f1656d9e9d7cc67fa | 2026-08-18 | docs(c2): r3.2 — encode Owner final pre-GO adjudication (00E): all GO-sheet items RULED; resource-release law; writer speed + bounded pooling; development laws; north-star; target-not-max | NO | YES | YES | YES | 11 | NO | ACTIVE | Recent C2 planning work contained by active C2A/visual lines. | NONE |
| c2a-implementation | 97752d4ed121016b4b203c4231ff7cb28a5c4d87 | 2026-08-19 | docs(c2a-m5x): the correction wave, its budget, its floors and what it did not do | NO | YES | YES | YES | 165 | NO | ACTIVE | Known protected active branch. | NONE |
| codex-github-write-test | 3d6c48710a2edf92dfe420363742cb7176decf50 | 2026-08-13 | test: verify Codex GitHub write access | NO | NO | NO | YES | 1 | NO | UNKNOWN-DO-NOT-TOUCH | One unique test commit; its retention purpose is not documented. | NONE |
| d17-economy-truth-equilibrium | 52c5f0c35a12be7d07c2651626ecbf6838d060cc | 2026-08-12 | D-17A: record Owner acceptance; authorize D-17B (docs only) | YES | YES | YES | NO | 0 | YES | UNIQUE-HISTORY-KEEP | Current docs retain this decision milestone. | NONE |
| docs/character-handoff-d1a-status-correction | 9c0466d7678ad0b42bf2f91cefec2d8b9da32250 | 2026-08-06 | docs(handoff): correct D1-A and D1-B status | NO | NO | NO | YES | 73 | NO | UNIQUE-HISTORY-KEEP | Named handoff correction retains unique history. | NONE |
| docs/character-handoff-owner-ruling | e5a4931b856c38cc5104be35aade4b40eb140116 | 2026-08-06 | docs(handoff): clarify local UAL dependency in provenance | NO | NO | NO | YES | 72 | NO | UNIQUE-HISTORY-KEEP | Named Owner-ruling handoff retains unique history. | NONE |
| docs/character-handoff-packet-hardening | 7603b2f234dfdb11ad6a0691315942c4b16cffac | 2026-08-06 | docs(handoff): disclose UAL dependency and stamp packet identity | NO | NO | NO | YES | 74 | NO | UNIQUE-HISTORY-KEEP | Named hardened handoff packet retains unique history. | NONE |
| docs/character-handoff-packet-r2 | 66b44b28d04b2fe0a1cf81abd8153ad0d2c3b1a8 | 2026-08-08 | fix(handoff): harden validator diagnostics and repair semantics | NO | NO | NO | YES | 77 | YES | UNIQUE-HISTORY-KEEP | Current docs reference this R2 handoff head. | NONE |
| docs/character-handoff-r2-propagation | aadbd63d4e32f27b0b09ddeac1d64f07ed1d98ea | 2026-08-09 | docs(art): tighten R2 propagation wording | YES | YES | YES | NO | 0 | NO | FULLY-MERGED-SAFE-DELETE | Fully reachable from main; no unique commits or current-doc branch reference. | HIGH |
| docs/character-track-durable-record | 1d8d9c8ab638edfc892fbfdad8e1d19eccc05eb7 | 2026-08-05 | docs: reconcile character-track durable record (05H/05I closed, handoff active) | YES | YES | YES | NO | 0 | NO | FULLY-MERGED-SAFE-DELETE | Fully reachable from main; no unique commits or current-doc branch reference. | HIGH |
| docs/governance-reconciliation-pre-c2 | c0c9561bf78f77d81cb23c0bbee6cf3507f79a82 | 2026-08-18 | docs(plan): record RSG ownership in the Master Plan — C2 owns V1, C4 owns the deepening | YES | YES | YES | NO | 0 | NO | FULLY-MERGED-SAFE-DELETE | Fully reachable from main; no unique commits or current-doc branch reference. | HIGH |
| docs/handoff-ruling-propagation-lesson | 7f08cfde9b42169fc3fc0d8b545843252f771e72 | 2026-08-06 | docs: update active handoff and D1-A closure status | YES | YES | YES | NO | 0 | NO | FULLY-MERGED-SAFE-DELETE | Fully reachable from main; no unique commits or current-doc branch reference. | HIGH |
| docs/hollywood-horizon-governance | 85a3caaa98278ba7f17eca1cbd38dba68619816c | 2026-08-18 | docs(governance): correct stale current-save-version claims to V13 in four routing docs | NO | NO | NO | YES | 3 | NO | UNIQUE-HISTORY-KEEP | Named governance correction retains unique current-history commits. | NONE |
| docs/packet-hardening-propagation | 406fd370283bf99131ade999f099c73190646547 | 2026-08-07 | docs: propagate packet-hardened character handoff | YES | YES | YES | NO | 0 | NO | FULLY-MERGED-SAFE-DELETE | Fully reachable from main; no unique commits or current-doc branch reference. | HIGH |
| docs/project-studio-success-blueprint | 8778b7cd39d9b51a385ee54f3b31b46b94235247 | 2026-08-18 | docs(blueprint): incorporate adversarial cross-check findings | NO | NO | NO | YES | 3 | YES | UNIQUE-HISTORY-KEEP | Current canonical blueprint identifies this documentation-only branch. | NONE |
| economy-capital-frontier-fix | a70b00f719e0be3d03a93ecea27d79f46c272d72 | 2026-07-31 | D-13: remove dead code from capital audit harness (typecheck hygiene) | YES | YES | YES | NO | 0 | YES | UNIQUE-HISTORY-KEEP | Current docs preserve this named economy milestone. | NONE |
| economy-capital-risk-reward-audit | 6ebd8f9e07bca40e412d8f1576677fc0fdb57603 | 2026-07-30 | Capital intensity risk/reward audit — read-only balance study | YES | YES | YES | NO | 0 | YES | UNIQUE-HISTORY-KEEP | Current docs preserve this named read-only audit. | NONE |
| first-movie-journey-v1 | 8464f3d96f0b2f89b5ae9f07658228464791e979 | 2026-08-17 | docs(journey): seal the first-movie-journey shift | YES | YES | YES | NO | 0 | YES | ACTIVE | Current docs explicitly identify it as live work. | NONE |
| gate-d-studio-lot-d1 | 889ae0e29715a2ea21755dcb4a466d1c188e2965 | 2026-07-31 | Gate D1: record Studio Lot functional-foundation closure | YES | YES | YES | NO | 0 | YES | UNIQUE-HISTORY-KEEP | Current docs preserve the named Gate D closure. | NONE |
| lot-content-expansion-v1 | f2940775b892266c41c792141078c0bddb0443d1 | 2026-08-18 | docs(c1-m8): SEAL — Campaign 1 KEEP, red-team answered, fix wave verified | YES | YES | YES | NO | 0 | YES | UNIQUE-HISTORY-KEEP | Current plan explicitly preserves the sealed campaign. | NONE |
| main | 5914c84e453461240540184e79b2bd7eafeb647f | 2026-08-20 | Merge pull request #6 from HSpector1/support/readme-quickstart | YES | NO | NO | NO | 0 | YES | ACTIVE | Default protected branch. | NONE |
| operation-hollywood-autonomous-marathon | 2be66562aa9593fee79c370ea7ce6787ac88557f | 2026-08-16 | docs(marathon): seal world-first current best | YES | YES | YES | NO | 0 | YES | UNIQUE-HISTORY-KEEP | Current docs retain this sealed marathon authority and handoff history. | NONE |
| parity-master-plan-v1 | 24fb87bd3fa502ac603387d6440717649137f436 | 2026-08-17 | docs(pm): master plan v1.1 — Owner Amendment incorporated | YES | YES | YES | NO | 0 | NO | FULLY-MERGED-SAFE-DELETE | Fully reachable from main; no unique commits or current-doc branch reference. | HIGH |
| phase-5.1-talent | 3ac66bbbe1f29ecac44c1632ba23952fad8fe61d | 2026-07-26 | Phase 5.1 (cycle 3): legible film assembly — package summary, cards, filters, autopsy compare, Crew | YES | YES | YES | NO | 0 | YES | UNIQUE-HISTORY-KEEP | Current docs preserve this named phase checkpoint. | NONE |
| phase-5.2-economy | 15fa5083321bf6019342635d04fe2cd1a0e6f72b | 2026-07-29 | D-12: record microbudget strategy audit | YES | YES | YES | NO | 0 | YES | UNIQUE-HISTORY-KEEP | Current docs preserve this named phase/audit checkpoint. | NONE |
| phase-5.2-studio-roster | b6f378a37bcc9aeaacc46d7acd166697cc0b5d31 | 2026-07-27 | Phase 5.2A (cycle 3): calibrate custom prospects and add newspaper releases | YES | YES | YES | NO | 0 | YES | UNIQUE-HISTORY-KEEP | Current docs preserve this named phase checkpoint. | NONE |
| phase-5.2-talent-career-impact-v1 | 50b2ff9ec57f3b6a17ebe13c6506817d2b296c09 | 2026-08-03 | D-14: stop tracking an accidentally-committed node_modules symlink | YES | YES | YES | NO | 0 | YES | UNIQUE-HISTORY-KEEP | Current docs preserve this named phase checkpoint. | NONE |
| phase-5.3-studio-run-recap-v1 | d90c45d078a4d93478218781cb60291d5875515b | 2026-08-05 | fix(d15): authoritative affordability — action parity + bare-minimum vs standard film | YES | YES | YES | NO | 0 | YES | UNIQUE-HISTORY-KEEP | Current docs preserve this named phase checkpoint. | NONE |
| professional-floor-v1 | e8462e75b11e7bd11dee36a2dd7a9bf109c93312 | 2026-08-18 | docs(plan): PF1 authorization item reflects charter r2 and pending red-team read | NO | NO | NO | YES | 4 | YES | UNIQUE-HISTORY-KEEP | Current plan calls it read-only historical evidence, never merged. | NONE |
| professional-floor-v1-fresh | 2b75e3d79ab6426ccc2e67cb66ab278f4abb3e48 | 2026-08-18 | docs(pf1): seal HEAD corrected to d95d6a6; decisive gates re-run green at it | YES | YES | YES | NO | 0 | YES | ACTIVE | Current charter explicitly keeps it as the PF1 working branch. | NONE |
| silverline-campus-experiment | bee74495653e91306538af7d58d00a66abb02970 | 2026-08-20 | docs: map Silverline donor transplants | NO | NO | NO | YES | 3 | NO | ACTIVE | Known protected active experiment branch. | NONE |
| studio-lot-spike | 3806ef65cf0949a4b10e22b73ef1d3fb04a47e40 | 2026-07-26 | docs(lot-spike): pass-4 authored-asset pipeline spike — Stage A failed review | NO | NO | NO | YES | 5 | YES | UNIQUE-HISTORY-KEEP | Documented failed-review spike is preserved historical evidence. | NONE |
| support/3d-asset-guardrails | 28608e21cb317e48dc4be21dcb9439a375705a24 | 2026-08-20 | chore: add 3d asset pipeline guardrails | NO | NO | NO | YES | 170 | NO | ACTIVE | Known protected active support branch. | NONE |
| support/3d-visual-regression | a06b4b786f2fdecd79f0488e85b52377dea413af | 2026-08-20 | test: add canonical 3d visual capture harness | NO | NO | NO | YES | 170 | NO | ACTIVE | Known protected active support branch. | NONE |
| support/readme-quickstart | e67178671a51f361cc1d2b5fd76b99391937a656 | 2026-08-20 | docs: finalize contributor quickstart README | YES | NO | NO | NO | 0 | NO | ACTIVE | Known protected active support branch. | NONE |
| tycoon-world-conversion-12h | b58e6f8a92c0022c613b5c1591f734ae6db3453f | 2026-08-17 | docs(shift): seal — tycoon world conversion handoff | YES | YES | YES | NO | 0 | YES | UNIQUE-HISTORY-KEEP | Current docs preserve the sealed conversion handoff. | NONE |
| visual-tycoon-conversion-spike | 75b44fcac36cc1ec0e6f7ccc4dfbe81262906e63 | 2026-08-20 | test: add canonical 3d visual capture harness | NO | NO | YES | YES | 171 | NO | ACTIVE | Known protected active experiment branch. | NONE |

## Notes on ambiguity

`codex-github-write-test` is the sole `UNKNOWN-DO-NOT-TOUCH` branch. It has one commit not reachable from `main`, but neither the commit nor current-main documentation establishes whether the named test ref is a disposable authorization check or a retention checkpoint. No deletion safety is asserted for it.
