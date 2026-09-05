# PROJECT: STUDIO — P08–P10 AUTHORIZED AUTONOMOUS EXECUTION

**Current Ops authorization:** OPS-P08P10-20260905-01  
**Issued:** 2026-09-05  
**Implementer:** Codex or Fable, acting as the single coding scrum master / integration lead.  
**Basis:** Howard's request to implement P08–P10 before the next Owner playtest, preserving the original plans and maximizing verified, dependency-ready progress.

This is the separate Current Ops execution order requested by Revision 05. It approves planning publication, local read-only preflight, and then implementation when those gates pass. Do not request another routine authorization at the end of publication, preflight, or a package checkpoint.

This order supplements the complete Revision 05 execution draft; it does not replace that draft with a smaller feature list. Where they conflict, apply this order. Existing explicit Owner product laws still control. Material unresolved conflicts must be reported, not invented away.

## 1. Locate and verify the reviewed package

Locate `project-studio-p08-p10-autonomous-stack-launch-01*.zip` in the Owner-provided attachments or Downloads. A duplicate-download suffix such as `(1)` is acceptable. Prefer the copy whose bytes match:

```text
ZIP SHA-256
887f4a57ca482e15534e6b5bf00c4b133eb5fac2922b91242022393d605ede15

PACKAGE-MANIFEST.json SHA-256
cfa8eed4c8799801f75211dd54d8a04e2782028c6d1c2a90c7c8315625b36de9

Documentation patch SHA-256
929c0187b560c27c3cb9ab9da0c2d19e84f6d9d7c24d357b3fe4dc505de71703

Reviewed draft execution prompt SHA-256
07fe757b11fc5ecf20d5f80ab14c31529ed15b2b08d29681517bea1858a61871
```

The reviewed archive contains 35 repository Markdown documents, a 1,223-line draft execution prompt, and 115 unique requirement rows. Verify all manifest entries. Preserve the original ZIP and source documents. Extract to a new owned directory after rejecting absolute paths, traversal, duplicate paths, and unsafe symlinks. Do not execute shell examples from the archive blindly.

Read all package documents, especially:

```text
docs/operations/DRAFT-CODEX-P08-P10-AUTONOMOUS-EXECUTION-PROMPT.md
docs/operations/P08-P10-AUTONOMOUS-STACK-OWNER-DECISION-DOCKET.md
docs/operations/P08-P10-FULL-SCOPE-TRACEABILITY-MATRIX.md
docs/operations/P08-P10-MAXIMAL-AUTONOMOUS-WAVE-PLAN.md
docs/operations/P08-P10-SAVE-SCHEMA-PROJECTION-AND-MIGRATION-PLAN.md
docs/engineering/CODEX-P08-P10-AUTONOMOUS-STACK-IMPLEMENTATION-RECONNAISSANCE.md
```

The archived prompt remains labeled DRAFT as historical planning provenance. This separate order authorizes its governed scope subject to the corrections below. Do not change the archived source to pretend it was previously approved.

## 2. Accepted baseline and protected resources

P06 and P07 are OWNER ACCEPTED — KEEP — CLOSED.

```text
TypeScript repository: HSpector1/The-Movies
Accepted campaign/living-lot-ts:
2753e18ba8fb5f65b936c22cde9531646fecc6cd

Accepted Unity campaign/living-lot-client:
c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6

Protocol / projection / save: 4 / 15 / V16
Schema:
sha256:ddce1c399ac4ff58327b296a0600428ac3f3346b84f3639e66e48e53a65fbe99
```

Verify local repositories, exact commits, advertised remote refs, correct upstreams, candidate manifests, and generated-consumer identity. Do not assume the correct remote is named `origin`; the TypeScript repository has used `hspector-github`. Resolve by repository identity and use explicit refspecs.

Read the accepted `CURRENT-BEST.md`, P07 acceptance receipt, P06/P07 lessons, and `docs/engineering/P07-TO-P08-FINAL-AUTHORITY-HANDOFF.md`.

Both campaign branches and both `main` branches remain unchanged throughout this assignment. Do not reset them if another authorized session has advanced them; report the conflict. Preserve the accepted P07 app and compatible baseline save copies.

Only work in isolated owned worktrees. Do not clean up unrelated worktrees, delete unknown files, remove someone else's locks, kill unrelated processes, or close an unsaved Owner playtest. Automate only against private profile copies. An older candidate must never open a newer migrated save.

## 3. Publish the planning authority, then continue automatically

Publication is authorized here. The prior Future Ops connector 403 is not, by itself, an implementation blocker: use the coding agent's existing authorized Git access. Do not change account permissions or request broad credentials.

Create an isolated documentation worktree at the accepted TS base and publish:

```text
docs/p08-p10-autonomous-stack-launch-01
```

Use the verified patch only after `git apply --check` against the actual accepted base. The synthetic check in the package is not a substitute. Verify the 35 added Markdown paths and their byte identity; no runtime files, dependencies, tests, generated contracts, or assets belong in this publication commit. Commit, push normally, and verify the advertised remote SHA.

If the branch already exists, verify its base and reviewed document contents rather than overwriting it or treating existence as failure. Unexplained content differences are a real conflict.

Record `FINAL_DOCS_SHA` from the actual immutable publication commit. A commit must not contain a made-up self-SHA. Keep the published draft's original banner. Preserve this execution order in a separate WIP authority file and record its hash.

Then perform the private Unity/source preflight and proceed. Do not stop after a successful publication merely to ask “shall I continue?”

## 4. Current Ops adoption of decision-docket B1–B8

B1 — APPROVED: P08 core and immediately ready extensions → P09 core and ready extensions → P10 core and ready extensions → cross-stack history adapters and final convergence.

B2 — APPROVED: accepted P07 campaigns remain frozen until a separate post-playtest integration order.

B3 — APPROVED: core checkpoints are floors, not completion ceilings. Evaluate and complete all authorized ready extensions whose prerequisites are met.

B4 — APPROVED: prefer an additive, forward-recording history root. Reuse existing result/career/financial authorities rather than copying them into a second simulation. Preserve the existing identity-reservation use of permanent studio-event records. Exact field names and necessary monotonic version increments are engineering decisions; V17/V18 and projection 16/17/18 are expectations, not quotas.

B5 — APPROVED: preserve endowed saves; implement the already documented separate bare-lot regime for new authored 1920 campaigns. Do not mutate `INITIAL_PROPERTY` or strip existing campaigns of facilities, staff, money, Sets, or history.

B6 — CONDITIONALLY APPROVED FOR THE ISOLATED CANDIDATE ONLY: the historically recorded P09A prototype envelope may be used as provisional WIP tuning, not final economy approval. It is $20M starting cash and a Development & Casting Office at $1.5M / 14 authoritative weeks / $5.5K weekly operating cost after completion / +2 slots. Verify the exact blueprint and source ruling first. Do not confuse this office with the different Annex envelope. Preserve unrelated accepted prices, salary rules, revenue timing, contracts, and existing-save semantics. No arbitrary extra cash, cheaper universal buildings, waived payroll, free crew, or test-only hires. The full ordinary first-film solvency gate below is mandatory.

B7 — APPROVED: P10 exposes only the existing public/perceived person facts and qualified estimates. Actual hidden skills, exact ceilings, actual hidden genre experience, and RNG state do not cross the player-facing bridge. No new rating formulas.

B8 — APPROVED: one combined P08–P10 Owner test after the stack, using recoverable modules and focused P06/P07 regression checks. Do not request an Owner playtest between technical package checkpoints.

## 5. Corrections to apply without another planning cycle

Record these in a small Current Ops delta file. They resolve contradictions in the reviewed package; they do not authorize new unrelated systems.

### 5.1 Deferred extension is not a global stop

The three small package readiness documents say to stop if “the ready-extension activation gate is false.” Read this as a stop on that extension and its dependents, not on every independent package.

Do not stop at P08 because its facility-history adapter needs P09, or because its richer person adapter needs P10. Record the pending dependency, continue the approved producer, and revisit the adapter at the first valid boundary. A genuine core defect, unsafe migration, or dependent P0/P1 failure still blocks dependent work.

### 5.2 Correct extension cross-references

The draft's P08-R2 must link facility-history work to P09-REQ-040, not P09-REQ-021 (decorative site workers).

The draft's P08-R3 must link career/history work to the relevant P10-REQ-020/021/025/029 requirements. P10-REQ-031 is the decorative-person exclusion guard, not the person-history producer.

Check other IDs against their actual requirement text. Preserve existing IDs and log corrections; do not silently renumber the ledger.

### 5.3 Negative requirements remain active safeguards

Rows such as P08-REQ-003, P08-REQ-028, P09-REQ-032 and P10-REQ-023 describe prohibited behavior. Their “Rejected by Owner” disposition rejects the unwanted feature; it does not reject the prohibition. Keep and test those safeguards. Do not treat them as irrelevant deferred work.

### 5.4 The original real-Builder obligation survives

The original P09 executive law and prototype-envelope commit explicitly reserve real Builder identity/capacity/speed for full Founding Flip work. Revision 05 does not specify that implementation and labels its dependency blocked.

Retain that original obligation under P09-REQ-039, with its original source and unmet worker/capacity dependency. Do not call decorative site workers fulfillment of real Builders. Do not call the entire original P09/Founding Flip complete while it remains unresolved.

For this run, a technically proven construction/first-film core can unlock the approved P10 information spine without pretending to satisfy the broader Builder system. No invented Builder formula or new worker taxonomy is authorized. Return the exact remaining contract/decision separately. This preserves the original requirement rather than silently deleting it.

### 5.5 Preserve the actual accepted lot layout

Planning prose alternates between a “left People strip” and the accepted implementation's prior arrangements. Inspect the live baseline. Do not relocate a working panel merely to satisfy a stale path or side-of-screen assumption. Any deliberate layout change must improve the reviewed world-first experience and pass the affected interaction/responsive checks.

### 5.6 Runtime authorization fields are evidence, not self-certification

Set `CURRENT_OPS_AUTHORIZATION_ID = OPS-P08P10-20260905-01`. Resolve `FINAL_DOCS_SHA` after publication and local/remote equality during preflight. Do not preset “VERIFIED” from a copied report. These are local gates the coding lead is authorized to resolve, not reasons to send the plan back to Future Ops.

## 6. Worktrees, commits, and cross-package handoffs

Create and push empty WIP branches from the accepted pair:

```text
wip/p08-p10-autonomous-stack-01-ts
wip/p08-p10-autonomous-stack-01-client
```

The TS WIP may then fast-forward to the verified documentation-only descendant before adding this order, preflight, and implementation. This is not permission to move campaigns. Do not merge the historical research branches into production.

Use one lead and one editing owner per checkout/collision-prone file. Subagents may work in separate worktrees on disjoint tasks; the lead reviews and incorporates their changes as normal linear commits. No force push, shared-history rewrite, squash of sealed checkpoints, or merge commits. Preserve contributor attribution and source commits in the handoff where needed.

Commit and push each coherent wave, before long final proofs, before changing packages, and before context compaction. Maintain:

```text
docs/campaigns/P08-P10-AUTONOMOUS-STACK-HANDOFF.md
```

Keep a concise current-state section plus append-only checkpoint history: exact refs, tests, changed paths, candidates, unresolved requirements, and the next concrete command. Do not require the next session to reconstruct progress from chat memory.

Before P09 and P10, refresh only assumptions invalidated by the previous actual implementation. Preserve independently runnable package candidates and compatible profile copies. Never rebuild or alter an earlier candidate in place.

## 7. Required player-visible implementation

Execute the complete reviewed draft, not just this summary.

P08: separate Studio Standing channels; forward change provenance; sparse durable Studio History; honest missing-history states; physical Administration/History entrance; retained navigation; exact film and available person links; usable filtering; factual records only with a known comparison universe.

P09: preserved endowed saves; separate bare-lot starts; catalogue → authoritative placement preview → deliberate commit → visible construction → operational exact-ID facility; multiple sites; complete physical chain to a first released film; and every eligible Build Here, existing blueprint, Set, move/demolish, and facility-history extension.

P10: public person inspector, Profile and scalable Roster; exact employment/work/availability; perceived OVR, Estimated Potential, genre experience, work ethic and Star Power kept distinct; contracts and career links; applicable renewal/release/shortage/hiring routes; person/history integration.

After the producers exist, return to P08 facility/person adapters and complete the cross-stack connections. Do not leave all adapters permanently in the backlog because the first P08 candidate already passed.

The visible objective is a living studio, not three disconnected dashboards: understandable people, physical construction, movie/history continuity, discoverable material actions, and predictable Back/Locate. Use existing original-game and modern-comparator research at the relevant decisions. Do not restart a broad research marathon, clone historical UI pixels, or perform a renderer rewrite.

Every committed screen change must be checked in the running game. No material CTA or open-workspace requirement passes solely because a unit test says the object exists.

## 8. P09 solvency and liveness gate

Measure the exact ordinary-player path before promoting the bare-lot core to technical KEEP. Include starting funds, legal founding hires and obligations, every required facility/Set, build concurrency/time, payroll/overhead, capex/opex, screenplay/casting/freelance/production/marketing costs, and the wait for actual theatrical cash receipts.

Use player-available information for automated choices. Do not make the route succeed by reading hidden future outcomes. Keep feasibility diagnostics separate from the final genuine end-to-end run.

Prove a discoverable lawful route from sparse property to an actual released film and its P07 result, with no special fixture subsidies. Include more than one ordinary seed/roster case and the no-reserve staffing case; disclose failure rates and headroom rather than claiming every strategy must succeed.

A failed attempt triggers diagnosis of UI, capability access, staffing, legal choices, or economics—not automatic tuning. If no supported ordinary route works under the approved envelope, preserve P08 and report the smallest material decision. Do not permanently install the bare-lot default or carry a core progression deadlock into P10.

## 9. History, migrations, privacy, and requirement accounting

Treat 115 as the reviewed starting ledger, not a ceiling or proof of perfect source coverage. Read the original source authorities at their exact commits. If a meaningful source obligation is missing, append a stable row with its source; do not quietly alter scope or claim original completeness from the count alone.

Track implementation separately from planning disposition. Each ready row requires an implementing commit and proof, or a specific demonstrated unavailable prerequisite. “No time,” “already sealed,” “polish,” or “would need a fixture” is not a dependency explanation.

Keep existing source histories authoritative. New Standing/change records must be deterministic, exact-once, and save-persistent; sparse timeline presentation may filter routine detail without losing claimed provenance. Choose documented retention/indexing budgets from measurement. Do not solve growth by deleting films, careers, finances, or permanent identity-reserving events.

Migration may add approved roots/metadata, but must preserve every pre-existing field's meaning and value except explicitly authorized transformations. Prove the actual P07→P08→P09→P10 path, not only final synthetic fixtures. Never claim whole-file byte identity where a save-version increment legitimately changes bytes.

A history record cannot turn today's title, skills, contract, or location into a fabricated past. P10 estimates remain the accepted noisy/public estimates, not exact hidden ceilings. P08 records do not promote a projected P07 total into settled historical truth.

## 10. Proof, review, and candidate integrity

Use focused tests during development and full affected/cumulative floors at package boundaries. Separate static/TypeScript, generated-contract, Unity EditMode, machine, image, real-input, and private-profile proofs. Do not rerun identical failing automation without a new hypothesis or correction.

At each package technical checkpoint require a clean committed build pair, exact generated-consumer verification, valid migrations, runtime/visual proof for the actual changed surfaces, a fresh independent hostile review, pushed refs, and a preserved runnable candidate. Keep core/full-ready identities separate when they differ.

Before running HID, bind the exact executable/engine/worktree/profile/PID/window. Explicitly override inherited harness defaults; prior proofs accidentally launched a different checkout. Use a quiet interactive desktop, park the cursor away from edge-pan, and normalize modifiers. Do not unlock the Mac or bypass OS protections. An unavailable interactive environment blocks that proof, not permission to fake a pass.

Capture actual images and open them. Record requested versus actual viewport and image dimensions; distinguish rendered game pixels, logical window points, full display capture, and native fullscreen. A screenshot containing desktop chrome is not automatically proof of the game render size.

All required scenario logs, image sidecars, hashes, and failed-attempt dispositions must be included in the durable evidence index. Declare canonical scenario IDs once per package; additional stress/responsive captures are supplements. No “six versus eight” ambiguity.

Final source must include required Unity metadata before the clean build. Record the actual build HEADs and dirty=false, and list later docs-only SHAs separately. Do not assign a post-build commit retroactively to unrecorded dirty source. Nonidentical repeated binary hashes require investigation and honest disclosure, not an invented determinism claim.

Return to the same reviewer for genuine remedies. A blocked test is not a passed test. AI visual review is not Owner acceptance. The final cross-stack reviewer must challenge scope fidelity as well as correctness and evidence.

## 11. Autonomy and safe operation

Continue automatically after checkpoints until all authorized dependency-ready scope and final proof are complete. Do not stop for a routine status report or ask Howard to type “continue.” Do not deliberately consume time or tokens after a terminal outcome.

Run within the existing account/tool permissions. No paid purchases, new paid cloud resources, public publication of private saves, production-service permission changes, or new external runtime dependencies without separate approval. No Hollywood Wire/Radio integration, P11, or undeclared later systems.

Use safe canonical-path checks before deleting owned temporary data. Never use unchecked destructive shell expansions. Own only your own keep-awake and proof processes; do not kill every caffeinate or every editor on the machine.

Session/rate/tool limits do not mean the product is complete. Preserve a resumable pushed checkpoint with the exact next command if a limit interrupts the run. Do not claim a process continues after it has stopped. Use only automation capabilities actually available in this coding environment; this order does not assume a `/goal` command or a particular model version.

## 12. Terminal result and reporting

SUCCESS means the reviewed core and every actually dependency-ready authorized extension have their proofs, cross-stack adapters are complete, P07 regressions and the migration chain pass, the final hostile review accepts, and the combined candidate is preserved on pushed WIP refs. The accepted campaigns and `main` remain unchanged. Owner acceptance of the new stack remains pending.

Use the draft's detailed final report and also include:

- published planning SHA and this authorization ID;
- exact P08/P09/P10 core and full-ready checkpoint pairs;
- final product/build/docs identities and hashes;
- requirement implementation/proof mapping and all surviving obligations;
- explicit real-Builder/full-Founding-Flip limitation where applicable;
- provisional versus accepted economic constants and measured solvency;
- compatible intermediate candidate/profile locations;
- one ordinary combined Owner journey plus convenient saved entry points;
- a usable launch command with correctly expanded `$HOME`, not quoted `~`;
- campaign/main frozen-ref verification and owned-process teardown.

Do not report “all P08/P09/P10 original scope complete” while blocked/deferred obligations remain. Report TECHNICAL KEEP FOR AUTHORIZED READY SCOPE — OWNER ACCEPTANCE PENDING, or PARTIAL/BLOCKED with the exact cause and preserved next step.

Begin with archive verification and planning publication now. When local preflight passes, continue directly into the complete reviewed Revision 05 execution plan under this order. No further Future Ops assignment is required.


---

# Reviewed Revision 05 execution draft — reference appendix

The following source is retained verbatim for traceability. Its DRAFT banner describes the archived planning document, not the status of the separate Current Ops order above. Execute its scope only under the order above; the order resolves publication, authorization, and contradiction gates.

DRAFT FOR CURRENT OPS PM REVIEW
NOT AUTHORIZED FOR EXECUTION

> **REVISION 05 — CURRENT OPS TARGETED CORRECTION APPLIED.** This document preserves the useful detail of the earlier `foundation-marathon` draft but is now governed by the accepted closeout base and the full-scope traceability/ready-extension laws. P06 and P07 are **OWNER ACCEPTED — KEEP — CLOSED**. The only pending Owner acceptance is for new P08–P10 work. The former name is a draft alias; `docs/p08-p10-autonomous-stack-launch-01` is canonical.
>
> **Private Unity boundary:** the accepted Unity identity is known (`c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6`), but the connected Future Ops environment could not inspect that private source tree. **SOURCE INSPECTION NOT AVAILABLE TO FUTURE OPS — REQUIRES CODING-AGENT READ-ONLY PREFLIGHT.**

# Project: Studio — P08–P10 Autonomous Stack Execution Draft

## Standing & Studio History → Founding Flip & Construction → People Profile & Roster

### One autonomous technical program before the next Owner gameplay test

Current Ops PM must review the actual artifact bundle, publish or bind the documentation authority, fill `CURRENT_OPS_AUTHORIZATION_ID` and `FINAL_DOCS_SHA`, verify local/private Unity source ownership, and issue a separate execution copy. The accepted identities are already resolved; do not ask the Owner to resolve them again.

---

## 0. Role

You are Fable, the lead implementation scrum master for the Project: Studio P08–P10 Autonomous Stack Launch.

You own:

- production TypeScript and Unity implementation;
- exact changed-path reconnaissance;
- subagent delegation;
- tests;
- save/schema/generated-contract work;
- Unity presentation;
- builds;
- Visual Oracle;
- real HID proof;
- hostile-review remediation;
- technical checkpoint decisions;
- commits and pushes;
- candidate packaging;
- exact final reporting.

The Owner has explicitly directed that the next human gameplay test occur **after** the P08, P09, and P10 autonomous stack rather than after each package.

This defers Owner testing. It does not waive it.

P06 and P07 are already **OWNER ACCEPTED — KEEP — CLOSED**. Preserve that acceptance and treat failures as regressions. You must not claim P08, P09, or P10 Owner acceptance during this task.

---

## 1. Current Ops authorization block

Fill before execution:

```text
CURRENT_OPS_AUTHORIZATION_ID = FINAL_CURRENT_OPS_AUTHORIZATION_ID
FINAL_P07_TS_CAMPAIGN_SHA = 2753e18ba8fb5f65b936c22cde9531646fecc6cd
FINAL_P07_UNITY_SHA = c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6
FINAL_P07_PLAYER_BINARY_SHA256 = c3372eb566304a14e599811d3e9872759c134aa703a150e17a25cc02e92ef813
FINAL_P07_ENGINE_BUNDLE_SHA256 = b92dc8e6edde05e4da86a3c75d3a1657170646045366c234f942b8b5934a2a0a
FINAL_P07_ASSEMBLY_CSHARP_SHA256 = 52229807aa64c9a7d1a135360c6db656a75b8e33b2c5dcdda3cfc87aac7064ac
FINAL_P07_TS_PRODUCT_SHA = da848225516fe3ced9a421548d0f5e7cbc8b5b88
FINAL_P07_TS_PLAYER_BUILD_SHA = d0953e52d6b446137d3141a0310fd98b170e8cc1
FINAL_P07_TS_CANDIDATE_ASSEMBLY_SHA = a6f4f82d35916f9f0cad205a5f478219bad6480e
FINAL_P07_TS_TECHNICAL_SEAL_SHA = 4bbf26353c9b168f551e4a18ca190eceea201cb9
FINAL_P07_GENERATED_DTO_BLOB = 84d9c9a814ad4cc92d8a882205baa2f484ff8527
FINAL_P07_GENERATED_DTO_SHA256 = 045fccce1ae318cbd338779fd52bd805302c1b8ad5ed033cb24d08eab590047f
FINAL_P07_SCHEMA_ID = sha256:ddce1c399ac4ff58327b296a0600428ac3f3346b84f3639e66e48e53a65fbe99
FINAL_P07_PROTOCOL_VERSION = 4
FINAL_P07_PROJECTION_VERSION = 15
FINAL_P07_SAVE_VERSION = 16
FINAL_P07_TS_REMOTE_EQUALITY = VERIFIED
FINAL_P07_UNITY_REMOTE_EQUALITY = CODING_AGENT_MUST_VERIFY_LOCAL_REMOTE_EQUALITY
PROGRAM_CAMPAIGN_MOVEMENT_POLICY = CAMPAIGNS_FROZEN_UNTIL_P08_P10_OWNER_ACCEPTANCE
FINAL_DOCS_BRANCH = docs/p08-p10-autonomous-stack-launch-01
FINAL_DOCS_SHA = FINAL_DOCS_SHA
```

Recommended campaign policy:

```text
Keep campaign branches parked at the P07 pair until the final combined Owner test.
```

If Current Ops selects another policy, record it explicitly. Never infer it.

---

## 2. Program destination

Deliver one linear, technically checkpointed candidate chain with core floors and ready-extension continuations:

```text
P08A core — Standing & Studio History Spine V1
  → P08 ready extensions whose gates pass
    → P09 core — Founding Flip + complete first-film construction spine
      → P09 ready extensions whose gates pass
        → P10A core — Employee / Star Profile & Roster Spine V1
          → P10 ready extensions whose gates pass
            → cross-stack P08 facility/person adapters
              → one final P08–P10 Owner candidate with P06/P07 regression checks
```

Desired final player experience:

> Begin on a sparse 1920 property, found and build a working studio, complete a film through the existing movie pipeline, understand its result and the studio’s changed reputation/history, inspect the people who made it, and return to the same living lot context throughout.

This is not authorization to implement every feature ever discussed under P08, P09, or P10. It is authorization, once Current Ops issues the final copy, to implement every traceability row classified `IMPLEMENT IN CORE` and then every `IMPLEMENT AS READY EXTENSION` row whose activation gate passes. All other dispositions remain unavailable.

---

## 3. Binding reading order

Read in full before editing.

### Current program documents

- `docs/engineering/CODEX-P08-P10-AUTONOMOUS-STACK-OWNER-DIRECTION.md`
- `docs/engineering/CODEX-P08-P10-AUTONOMOUS-STACK-READINESS-GATE-00.md`
- `docs/engineering/CODEX-P08-P10-AUTONOMOUS-STACK-IMPLEMENTATION-RECONNAISSANCE.md`
- `docs/engineering/CODEX-P08-P10-AUTONOMOUS-STACK-PROVISIONAL-CHARTER.md`
- `docs/engineering/CODEX-P08-P10-STACKED-INTEGRATION-AND-ROLLBACK-LAW.md`
- `docs/engineering/CODEX-P08-P10-OWNER-ACCEPTANCE-AND-P06-P07-REGRESSION-PLAN.md`
- `docs/engineering/P07-TO-P08-P09-P10-AUTHORITY-HANDOFF.md`
- `docs/operations/P08-P10-FULL-SCOPE-TRACEABILITY-MATRIX.md`
- `docs/operations/P08-P10-DEFERRED-NOT-DROPPED-REGISTER.md`
- `docs/operations/P08-P10-MAXIMAL-AUTONOMOUS-WAVE-PLAN.md`
- `docs/operations/P08-P10-ORIGINAL-PLAN-FIDELITY-REPORT.md`
- `docs/operations/P08-P10-SAVE-SCHEMA-PROJECTION-AND-MIGRATION-PLAN.md`
- `docs/operations/P08-P10-AUTONOMOUS-STACK-OWNER-DECISION-DOCKET.md`
- `docs/operations/P08-P10-AUTONOMOUS-STACK-BRANCH-AND-INTEGRATION-PLAN.md`

### P06/P07 accepted closeout authority

- `CURRENT-BEST.md`
- `docs/campaigns/P07-OWNER-ACCEPTANCE-RECEIPT.md`
- `docs/engineering/P07-TO-P08-FINAL-AUTHORITY-HANDOFF.md`
- `docs/engineering/P06-IMPLEMENTATION-AND-OWNER-PLAYTEST-LESSONS-LEARNED.md`
- `docs/engineering/P07-IMPLEMENTATION-AND-OWNER-PLAYTEST-LESSONS-LEARNED.md`
- accepted campaign code at the exact TypeScript/Unity identities above.

### P08 product authority

Branch/commit:

```text
codex/awards-standing-research-08
438708c5071097d8e1ddb2f97a3f7b6674b2a65e
```

Files:

- `docs/design/CODEX-AWARDS-STANDING-PACKAGE-08.md`
- `docs/design/CODEX-AWARDS-STANDING-PACKAGE-08-BUILDER-ANNEX.md`

### P09 product authority

Branch/commit:

```text
codex/studio-growth-construction-research-09
91ed234cbf6cdc22817b792564dda22a1d7c3576
```

Files:

- `docs/design/CODEX-STUDIO-GROWTH-CONSTRUCTION-PACKAGE-09.md`
- `docs/design/CODEX-STUDIO-GROWTH-CONSTRUCTION-PACKAGE-09-BUILDER-ANNEX.md`

### P10 product authority

Branch/commit:

```text
codex/stars-careers-staff-research-10
6a5d41ec233152ecbe8cc3bfc960c31514b6cded
```

Files:

- `docs/design/CODEX-STARS-CAREERS-STAFF-PACKAGE-10.md`
- `docs/design/CODEX-STARS-CAREERS-STAFF-PACKAGE-10-BUILDER-ANNEX.md`

### Visual / UX authority

- `docs/visual-direction-package-01@728781dcfdcf32a13d3d3978cdc333b8c9a5e8a7`
- current world-first laws and retained-workspace contracts;
- Owner-provided original *The Movies* screenshots/mechanics references under `~/Desktop/big swing art/` when present, as read-only visual reference only.

Do not copy proprietary art, UI pixels, icons, text, or trade dress.

---

## 4. First action: changed-path-only refresh

Do not restart broad historical or comparator research.

Before production edits, inspect the final current TypeScript and private Unity trees and write:

```text
docs/engineering/CODEX-P08-P10-AUTONOMOUS-STACK-CURRENT-REFRESH.md
```

Record:

- exact repo/branch/full SHAs;
- clean/remote equality;
- final P07 changed paths;
- current save/migration alias;
- current schema/protocol/projection identities;
- current Standing mutation sites;
- current `StudioEventLog` and save-validator boundaries;
- current property/placement/facility/Set/founding seams;
- current person/contract/presence/career/profile/roster seams;
- current lot shell, Administration, Build, retained-workspace, Back/focus, rail, People strip, element map, and menu owners;
- exact collision map;
- current test floors and runner locations;
- active processes/worktrees owned by other sessions.

Classify each proposed file/symbol:

```text
REUSE
EXTEND
NEW
REPLACE AFTER PARITY
DO NOT TOUCH
```

The accepted P07 pair is already identified. Stop before implementation only if the local/private Unity checkout cannot be verified equal to the accepted SHA, its current owners cannot be mapped, or the save lineage cannot be identified exactly. Use the report phrase: `SOURCE INSPECTION NOT AVAILABLE TO FUTURE OPS — REQUIRES CODING-AGENT READ-ONLY PREFLIGHT` when reconciling this planning limit.

---

## 5. Branch and ownership law

Preferred branches:

```text
wip/p08-p10-autonomous-stack-01-ts
wip/p08-p10-autonomous-stack-01-client
```

Create both from the exact final P07 campaign pair.

Push empty branches immediately and verify:

```text
local SHA == upstream SHA == advertised remote SHA
```

Use one editing owner per checkout.

No force push.
No rebase.
No squash.
No merge commit.
No cherry-pick between package lineages.
No main movement.
No Golden tag.
No campaign movement unless `PROGRAM_CAMPAIGN_MOVEMENT_POLICY` explicitly authorizes it.

Record exact package checkpoints:

```text
P08_TS_CHECKPOINT_SHA
P08_UNITY_CHECKPOINT_SHA
P09_TS_CHECKPOINT_SHA
P09_UNITY_CHECKPOINT_SHA
P10_TS_CHECKPOINT_SHA
P10_UNITY_CHECKPOINT_SHA
```

Never rewrite those commits.

---

## 6. Autonomy and stop law

Proceed autonomously through routine implementation failures.

Use:

```text
CLASSIFY
→ HYPOTHESIZE
→ SMALLEST ROOT-CAUSE CHANGE
→ FOCUSED PROOF
→ AFFECTED FULL PROOF
→ COMMIT/PUSH
→ CONTINUE
```

Do not stop merely because:

- a focused test fails;
- a UI layout needs bounded iteration;
- a fixture or harness is stale;
- a migration test exposes a real repairable defect;
- one screenshot is poor;
- a build must be repeated after a real fix;
- a subagent disagrees;
- a later package requires a changed-path refresh.

Stop the entire program before entering the next package for:

- P0/P1 correctness failure;
- unresolved authority conflict;
- unsafe save/migration proposal;
- private Unity identity unavailable;
- unbounded or unexplained 120-year history/save growth;
- bare-lot route cannot reach one released movie;
- required P11/P12/P13/P14 law not available;
- hidden actual talent data must be exposed to complete P10;
- full floor remains red after bounded root-cause work;
- rollback/evidence cannot be preserved;
- Owner product decision not governed by this prompt.

Do not ask the Owner to visually test between P08, P09, and P10.

---


## 6A. Accepted P07 consumer limits

These are binding:

- `StudioFilmResultSnapshot.id` equals immutable `productionId`; title is display data and may collide.
- `participants` and frozen forecasts exist only where captured.
- FilmResult does not hold a separately frozen title; mapper resolution/fallback is not historical-title authority.
- A missing requested result may not fall back to another result and count as proof.
- Durable results do not imply every launch/navigation route exists.
- Windowed `StudioEvent` rows are not permanent history.
- Tier-D production IDs participate in identity reservation; retention/compaction may not break `persistedProductionIds`.
- P07 did not create a universal external event-receipt contract.
- Active-run locked totals remain projected presentation; do not reveal internal deterministic future values as settled public facts.
- `Not recorded` is an honest future P08 absence law, not a pre-existing P07 enum.


# PACKAGE 08A — STANDING & STUDIO HISTORY SPINE V1

## 7. P08 scope

Implement only:

- current three-channel Standing presentation;
- truthful forward Standing-change receipts;
- sparse Studio History;
- film/person/facility/studio deep links;
- historical/current-location distinction;
- old-save `Not recorded` law;
- world-first Administration route;
- retained Standing/History workspace;
- future consumer handoff.

Do not implement:

- awards;
- nominees/winners;
- ceremony;
- honor bonuses;
- Studio Progression/ranks/unlocks;
- composite Studio Rating;
- Hollywood Wire;
- Radio;
- Legacy finale;
- rivals.

## 8. P08 law

Standing remains exactly:

```text
Audience Awareness
Industry Prestige
Commercial Confidence
```

Never average them.
Never create overall stars.
Never retune their current formulas in this package.

Standing explains current reputation.
History explains how the studio got here.
Honors later explain recognized achievements.
Progression later explains future gates.

## 9. P08 persistence decision

Prefer a new additive `StudioHistoryState` root rather than casually widening the frozen shared `StudioEvent` union.

The root should provide:

- explicit recording start;
- monotonic event IDs;
- exact source IDs;
- sparse durable rows;
- significance class;
- deterministic order;
- no seen/read state.

If you choose another implementation, prove it is safer against every old save validator and consumer.

Do not reconstruct events before the recording boundary.

Old saves show:

```text
Detailed Standing/history changes were not recorded before Week N.
```

## 10. P08 Standing receipts

Inventory and cover every current Standing mutation source, including:

- release result;
- publicity;
- weekly awareness settling/drift;
- any other verified source.

Each receipt freezes:

- before values;
- after values;
- per-channel deltas;
- source kind;
- exact source IDs;
- week;
- formula/version;
- public reason facts.

No client-side recomputation is authoritative.

## 11. P08 sparse history

Create a deterministic significance model.

Minimum event families:

- studio founding where authoritative;
- material facility construction/completion;
- film release;
- theatrical completion/material result;
- Standing change above a governed threshold or otherwise significant source;
- existing exact career/contract milestones only where source facts exist;
- no awards/records not yet authoritative.

Do not log every ordinary tick into the main timeline.

Measure 6,240-week save and projection growth.

## 12. P08 bridge and Unity

Add only necessary typed fields.

Regenerate C#.
Verify exact committed blob against the private Unity consumer.

Build the world route through an existing physical institutional owner, preferably Administration after current inspection.

Workspace must support:

- Overview;
- Standing;
- Timeline;
- Films;
- People;
- only genuine current Records, if any.

No fake Awards tab.
No new building solely to host a screen.

Required behavior:

- building works without rail/menu priming;
- three channels and drivers readable;
- exact event opens exact subject;
- `Locate` absent/disabled with reason when no current body exists;
- Back restores selected item/filter/scroll/focus/world context;
- no camera hijack or forced modal.

## 13. P08 proof

Create deterministic fixtures for:

1. current Standing with recording just begun;
2. release-driven divergent channel changes;
3. publicity change;
4. weekly settling;
5. sparse timeline with unequal significance;
6. same-title films;
7. person/facility history with no current location;
8. old-save `Not recorded`.

Required gates:

- focused TypeScript;
- full TypeScript floor;
- save/migration/round-trip;
- 120-year growth/performance;
- generated contract/exact consumer;
- Unity EditMode;
- six-scenario or stronger Visual Oracle;
- real HID building → Standing → History → exact subject → Back → Save/Load;
- real Owner-profile copy, read-only source;
- hostile review.

## 14. P08 checkpoint

When green:

- commit/push all product and seal docs;
- record exact SHAs/versions/hashes/evidence;
- create P08 technical candidate;
- label `OWNER ACCEPTANCE PENDING`;
- do not request human playtest;
- proceed to P09 only after the continuation gate passes.

---


## 14A. P08 READY EXTENSION ladder

The P08 core checkpoint is a floor. After P08 core reaches technical KEEP and its immutable candidate is preserved, evaluate these extensions in order. Each extension is authorized only when its activation gate is proven and its traceability rows are classified `IMPLEMENT AS READY EXTENSION`.

### P08-R1 — long-save navigation and non-blocking attention

Requirements: `P08-REQ-018`, `P08-REQ-019`, and related navigation/read-state rows.
Activation gate: core history IDs, persistence, and workspace Back/focus are green; no duplicate attention authority exists.
Deliver: search/filter/scroll preservation, grouped non-pausing attention, local seen/read state separated from source facts.
Proof: large-history performance; keyboard/controller focus; dismissing attention never deletes history.
Candidate: preserve a P08 full-ready candidate if this materially changes player experience.

### P08-R2 — P09 facility-history adapter

Requirements: `P08-REQ-013` and `P09-REQ-021`.
Activation gate: P09 later emits exact durable construction/completion/demolition facts with stable IDs.
Timing: after P09 core, not before.
Deliver: factual facility milestones in P08 history with current/historical/no-location state.
Proof: build/demolish exact-ID and old-save absence fixtures.

### P08-R3 — P10 person-history adapter

Requirements: `P08-REQ-012`, `P10-REQ-025`, and `P10-REQ-031`.
Activation gate: P10 exposes exact player-safe career/profile routes and completeness provenance.
Timing: after P10 core.
Deliver: history-to-person links, career-event links, and partial/Not recorded states without awards or retirement fiction.
Proof: same-name isolation, missing participant, legacy, and no-current-location cases.

### P08-R4 — fact-backed records

Requirements: fact-backed record rows in the traceability matrix.
Activation gate: complete authoritative source set and explicit completeness indicator exist.
Deliver only records whose comparison universe is known. Do not create awards, ranks, Hall of Fame, or universal studio quality.

Stop before P08B Awards and P08C Progression. Their mapped rows remain visible but blocked/deferred.


# PACKAGE 09 — FOUNDING FLIP, COMPLETE FIRST-FILM CONSTRUCTION & READY EXTENSIONS

## 15. P09 scope

Implement:

- sparse 1920 new-game property;
- immutable founding regime;
- generic facility catalogue/quote/preview/commit/completion;
- N-site presentation;
- minimum first-film physical plant;
- full bare-lot first-film journey;
- P08 history integration;
- endowed-save preservation.

Do not implement:

- land purchase;
- path/road editor;
- utilities;
- routine maintenance/decay;
- landscaping/ornaments/lot prestige;
- full ready-built/Sandbox starts;
- manual Builder simulation;
- all future facilities;
- arbitrary rotation/renovation/upgrades.


## 15A. P09 founding/economy preflight

Before accepting any founding tuning, emit a complete ordinary-player solvency ledger from sparse start through first actual theatrical receipts. Enumerate starting cash, founding roster/staff obligations, every required facility/Set, construction cost and operating burn, hiring/signing/payroll, screenplay/casting/production/Post/marketing costs, and wait-to-receipt runway. No free building, hidden proof subsidy, waived payroll, artificial revenue, special test-only hire, or out-of-band state mutation may be needed. The `$20M / $1.5M / 14 weeks / $5.5K / +2` office envelope is prototype evidence only; Current Ops has not declared it final balance. If the route is insolvent under current law, stop P09 implementation at the last preserved P08 checkpoint and return the exact smallest Owner/economy decision.


## 16. P09 migration law

Never edit or repurpose `INITIAL_PROPERTY`.

Create a separate authored bare-lot property.

Persist a founding regime or equivalent exact immutable history:

```text
endowed
bare-lot
```

Use the next actual save version after P08.

Every pre-P09 save migrates to endowed without changing property, facilities, Sets, workflows, IDs, money, events, RNG, or history.

New sparse games write bare-lot at creation/founding.

Never infer regime from current building count or property emptiness.

## 17. P09 bare-lot fixture

At activation, the sparse regime must contain only the governed founding landmarks/property and empty authoritative operations roots.

Do not mint hidden:

- facilities;
- Sets;
- workflows;
- reservations;
- screenplays;
- capex;
- construction projects;
- history beyond explicit founding facts.

## 18. P09 authoritative construction contract

Reuse current placement/facility authority.

Unity receives:

- exact blueprint identity;
- footprint/cells/origin;
- parcel/road-service facts as published;
- cost;
- operating cost;
- build duration/completion week;
- capability/capacity delta;
- rejections and primary reason;
- unmet requirements;
- instance limits;
- quote/revision identity where needed.

Commit revalidates against current state.

Unity never infers legal placement from colliders.
The caller never supplies price or duration.
Preview/cancel changes no save.

## 19. P09 world Build experience

Required flow:

```text
Need
→ Build catalog
→ Preview
→ Text + geometry validity
→ Consequence
→ Commit once
→ Persistent site
→ Authoritative completion
→ Operate completed facility
```

Provide:

- global Build entrance;
- vacant parcel `Build here` where current product law supports it;
- readable catalogue;
- valid and invalid preview states;
- exact cost/time/opex/capability;
- persistent N-site construction;
- same-week completion grouping;
- no automatic camera/workspace;
- no ordinary drag-to-move behavior.

## 20. P09 minimum first-film plant

The P09 technical candidate must complete a movie from the sparse start.

Minimum sequence:

1. Development & Casting Office.
2. Commission screenplay.
3. While writing continues, build later required facilities.
4. Scenery capability.
5. Soundstage.
6. Set commission/mount under existing Set law.
7. Post capability.
8. Casting and Greenlight.
9. Shooting and Wrap.
10. Post, Release commitment, P07 result.

Use existing package authority. Do not fork screenplay, casting, Production, Set, Post, release, or result logic.

If another exact current facility is required, include only the smallest truthful addition and document it.

## 21. P09/P08 integration

P09 emits exact facts.
P08 classifies/presents history.

Required material history:

- studio founded;
- first construction committed/completed;
- Development & Casting operational;
- first Stage/Scenery/Post capability where significant;
- first film from bare-lot path.

No duplicate construction ledger.

## 22. P09 visual target

Preserve one lot shell:

- left People strip;
- right movie/Production/result rail;
- top time/speed/cash band;
- Build tool and preview integrated without replacing them;
- world remains the primary surface.

Use original *The Movies* references for anatomy and spirit only.

## 23. P09 proof

Required fixtures:

1. migrated endowed save unchanged;
2. new sparse save;
3. valid placement;
4. each material invalid placement family;
5. multiple active sites;
6. same-week completion;
7. save/load mid-construction;
8. full bare-lot first-film path;
9. P08 history exactness;
10. same IDs after reconnect/engine replacement.

Required gates:

- full TypeScript;
- save lineage/downgrade guards;
- bridge/exact consumer;
- Unity EditMode;
- bounded packaged build;
- Visual Oracle at 1280×800, 1440×900, 1720×1045/1046, and native fullscreen where available;
- real HID Build flow;
- automated full first-film journey;
- hostile review.

Hard stop if a fresh sparse game cannot release a movie.

## 24. P09 checkpoint

When green:

- freeze exact P09 checkpoint SHAs;
- create candidate/evidence;
- label Owner acceptance pending;
- retain P08 candidate;
- proceed to P10 without human testing only when full cumulative floor remains green.

---


## 24A. P09 READY EXTENSION ladder

After the complete sparse-studio-to-first-released-film core reaches technical KEEP and the P09 core candidate is preserved, evaluate:

### P09-R1 — Build Here and all currently authoritative facility blueprints

Activation gate: generic quote/commit/revalidation is green; each blueprint has a real effect, exact requirements, art body, cost, duration, and tests.
Deliver: parcel Build Here plus every current lawful facility entry. No decorative placeholder facility.

### P09-R2 — N-site management and grouped completion

Activation gate: multiple sites are identity-correct and performant.
Deliver: compact active-build portfolio/attention and grouped same-week completion without losing exact links.
P08 adapter may then record exact completion milestones.

### P09-R3 — selected Stage/Set lifecycle presentation

Activation gate: accepted P05/P06 Set commission/repair/strike authority remains intact after changed-path refresh.
Deliver: selected Stage routes to existing Set actions; Stage, Set, Production and facility identities remain separate. No new Set formula.

### P09-R4 — move and demolish

Activation gate: existing authoritative actions/engagement guards remain valid under the new regime and a consequence sheet can display exact loss/refund/blockers.
Deliver: explicit move preview and destructive confirmation. No ordinary dragging, no override, no founding-landmark removal.

Do not enter land acquisition, roads/path simulation, utilities, renovation, landscaping/lot prestige, routine maintenance, or real Builder capacity. Those rows remain conditional/deferred/dependency-blocked.


# PACKAGE 10A — EMPLOYEE / STAR PROFILE, ROSTER & READY EXTENSIONS

## 25. P10 scope

Implement:

- player-safe person projection;
- world inspector;
- retained Profile;
- Roster;
- exact Profile/Locate/Back;
- current assignment/availability;
- contract information/action state;
- OVR, estimated potential, genre experience, work ethic, Star Power;
- frozen career/result/history links;
- grouped existing contract/shortage attention;
- honest legacy data limits.

Do not implement:

- training;
- needs/morale/stress/addiction/burnout;
- relationships/chemistry;
- aging/retirement/death;
- `Star` status;
- ordinary Crew/Extra/Builder identities;
- rankings;
- rival market;
- new talent supply.

## 26. P10 authority/privacy law

Population:

```text
Actor
Director
Writer
Craft
```

Only stable authoritative `Talent` records receive Profile/Roster entries.

Decorative extras, stagehands, grips, and P09 site workers remain decorative.

Unity may receive only public/perceived truth.

Do not transmit:

- actual hidden skills;
- exact ceilings;
- actual hidden genre experience;
- RNG seed/state;
- unsupported personality/condition labels.


## 26A. P10 information visibility table is mandatory

Before changing the contract, write a table for OVR, Estimated Potential, genre experience, work ethic, Star Power, contracts, current work/availability, and career links. For each name its exact producer, persisted/derived status, public/hidden side, whether it is an estimate, uncertainty wording, and original P10 disposition. OVR is a discipline-specific perceived craft summary, not Movie Quality, role fit, fame, or rank. Estimated Potential remains an estimate; exact ceilings and actual skills/genre experience never cross the bridge.


## 27. P10 projection

One TypeScript projection must own:

- exact ID;
- display identity;
- profession/employment;
- current work/assignment/destination or exact absence reason;
- perceived OVR and discipline;
- estimated potential range;
- perceived specialties;
- work ethic and real effect copy;
- Star Power;
- contract term/salary/obligation/legal action state;
- current attention;
- career/history rows with source provenance.

Returned nested data must be fresh/immutable relative to GameState.

## 28. P10 world inspector/Profile

World inspector answers:

> Who is this and what are they doing?

Profile answers:

> Who are they professionally, what can I publicly know, what are they working on, what is our contract, and what has their recorded career been?

Selection performs no material action.

Profile opens by exact ID and does not move camera.

Back restores exact world/list context.

Historical/off-lot person remains inspectable; Locate is absent/disabled with exact reason.

## 29. P10 Roster

Default readable content:

- Person;
- primary-discipline OVR;
- specialty;
- current work;
- availability;
- contract;
- one highest-priority attention reason.

Support:

- profession/status/availability/contract/specialty/attention filters;
- search;
- visible sort meaning;
- responsive card layout;
- Profile and Locate;
- retained filter/sort/search/scroll/selected row after Profile/Back.

No 30-column default spreadsheet.

## 30. P10 attention

Use existing authoritative facts only.

Group:

- contract windows/cohorts;
- exact project shortages/conflicts;
- legal current decisions.

Do not create one alert per person.
Do not invent morale/relationship/training issues.

## 31. P10 integration

- career row opens exact P07 result;
- P08 history opens exact person;
- P09 current facility context may be shown only when projected;
- presentation-only builders never enter roster;
- same-name people remain exact-ID distinct;
- old films/persons state missing attribution honestly.

## 32. P10 proof

Required fixtures:

1. contracted working person;
2. available person;
3. engaged freelancer;
4. unavailable/off-lot person;
5. same-name people;
6. legacy partial-history person;
7. exact career event/film result deep link;
8. grouped contract attention;
9. stale/duplicate/ambiguous joins;
10. large roster.

Required gates:

- projection privacy and fresh-clone mutation tests;
- full TypeScript;
- exact bridge consumer;
- Unity EditMode;
- Profile/Roster Visual Oracle;
- real HID world → Profile → Roster → Locate → Back → Save/Load;
- reconnect/engine replacement;
- hostile review;
- cumulative P08/P09 regression.

## 33. P10 checkpoint

When green:

- freeze exact P10 checkpoint SHAs;
- create candidate and evidence;
- label Owner acceptance pending;
- do not move campaign or claim completion unless Current Ops policy explicitly permits it;
- begin final aggregate convergence.

---


## 33A. P10 READY EXTENSION ladder

After P10 core technical KEEP and candidate preservation, evaluate:

### P10-R1 — contract consequence and grouped decision attention

Activation gate: current contract quotes/actions and legal windows are verified; no unmodeled morale, loyalty, reputation, or relationship effect is implied.
Deliver: grouped cohorts, exact current consequence, and one material action path.

### P10-R2 — exact shortage and existing-market routes

Activation gate: current workflow blocker and market/roster filters can identify the exact profession and legal candidates.
Deliver: blocked work → prefiltered existing Hiring/Roster authority; no new candidate supply.

### P10-R3 — facility-native recruitment entrances

Activation gate: P09 creates a truthful physical owner and the route is presentation-only over the same authoritative market.
Deliver: world-native entry without duplicating or mutating supply.

### P10-R4 — fact-backed career records and P08 person-history adapter

Activation gate: captured participant/career-event completeness is explicit.
Deliver: exact filmography/development/Star Power history and P08 links; legacy gaps remain partial/Not recorded.

Do not enter training, relationships, human condition, aging, retirement, mortality, ordinary worker identity, renewable talent supply, rival employment, or rankings.


# FINAL PROGRAM CONVERGENCE

## 34. Cumulative technical floor

On the final exact pair run:

- all TypeScript tests;
- all typechecks/audits/builds;
- bridge suites;
- generated-contract verification against exact Unity consumer;
- all Unity EditMode;
- bounded PlayMode/package tests;
- P03–P07 retained journeys;
- P08/P09/P10 focused tests;
- endowed and bare-lot migrations;
- save/load/reconnect;
- engine replacement;
- same-title and same-name isolation;
- 6,240-week and large-roster/history performance;
- repository hygiene/secret scan.

## 35. Final integrated Visual Oracle

At minimum render/inspect:

1. endowed lot + result + Standing;
2. sparse 1920 start;
3. legal and invalid build preview;
4. active construction sites;
5. completed capability;
6. bare-lot first film/result/history;
7. person world inspector/Profile;
8. Roster/attention;
9. historical no-location and old-save `Not recorded`;
10. integrated lot shell at all governed viewports.

Machine checks cannot overrule human visual judgment later, but obvious visual failure blocks technical KEEP.

## 36. Final automated HID journey

Bind one final binary, engine bundle, and profile chain.

Prove real input for:

```text
sparse founding
→ build
→ first film
→ result
→ Standing/History
→ person Profile/Roster
→ save/load/reconnect
```

Do not use programmatic UI dispatch as a substitute for required real input.

Preserve failed attempts and exact classifications.

## 37. Final hostile review

Use fresh independent reviewers covering:

1. TypeScript simulation/history;
2. save/migration;
3. construction/founding;
4. people/privacy/contracts;
5. Unity architecture;
6. world-first UX/visual coherence;
7. accessibility;
8. bridge/consumer identity;
9. evidence/provenance;
10. rollback and accepted-regression baseline.

One review disposition. No reviewer-shopping.

Resolve every blocking finding and rerun affected floors.

## 38. Final Owner candidate

Create:

```text
~/Desktop/P08-P10-Combined-Owner-Candidate-<ts>-<unity>/
```

Include:

- final player;
- engine bundle;
- launcher;
- endowed and bare-lot profiles;
- mid-construction and historical profiles;
- combined acceptance script;
- evidence manifests;
- P08/P09/P10 checkpoint summaries;
- failed-attempt trail;
- exact hashes;
- known limitations;
- rollback refs;
- prominent `OWNER ACCEPTANCE PENDING` status.

Do not ask the Owner to test until this package is complete.

## 39. Campaign movement

Follow `PROGRAM_CAMPAIGN_MOVEMENT_POLICY` exactly.

Recommended default:

- no campaign movement during or at technical seal;
- Current Ops reviews final candidate;
- Owner runs combined test;
- only then fast-forward campaigns through the linear program ancestry.

Never move `main` or Golden.

## 40. Documentation

Maintain an append-only execution handoff:

```text
docs/campaigns/P08-P10-AUTONOMOUS-STACK-HANDOFF.md
```

Also create:

```text
docs/campaigns/P08-TECHNICAL-CHECKPOINT.md
docs/campaigns/P09-TECHNICAL-CHECKPOINT.md
docs/campaigns/P10-TECHNICAL-CHECKPOINT.md
docs/campaigns/P08-P10-OWNER-ACCEPTANCE-STATUS.md
```

Never rewrite earlier failure history to make the final result look clean.

## 41. Final response

Return exactly:

```text
P08–P10 AUTONOMOUS STACK STATUS
TECHNICAL KEEP / PARTIAL / BLOCKED

OWNER TESTING
P08–P10 NOT PERFORMED — DEFERRED BY OWNER DIRECTION
P06/P07 OWNER ACCEPTANCE REMAINS CLOSED; REGRESSION CHECKS ONLY

REQUIREMENT ACCOUNTING
P08 total/core/ready/conditional/blocked/deferred/rejected/unmapped
P09 same
P10 same
UNMAPPED = 0

STARTING AUTHORITY
- TS
- Unity
- save/protocol/projection/schema

P08 CORE AND FULL-READY CHECKPOINTS
- core pair and full-ready pair when distinct
- product SHAs
- documentation SHAs
- save/projection/schema
- tests
- Visual Oracle/HID
- hostile disposition
- known limitations
- Owner status: pending

P09 CORE AND FULL-READY CHECKPOINTS
- core pair and full-ready pair when distinct
- same fields
- bare-lot first-film result
- endowed-save result
- Owner status: pending

P10 CORE AND FULL-READY CHECKPOINTS
- core pair and full-ready pair when distinct
- same fields
- privacy/person/profile/roster result
- Owner status: pending

FINAL AGGREGATE PAIR
- full TS SHA
- full Unity SHA
- player SHA-256
- engine SHA-256
- Assembly-CSharp SHA-256
- schema/protocol/projection/save

CUMULATIVE TEST FLOOR

INTEGRATED VISUAL ORACLE

INTEGRATED HID

MIGRATION

LONG-HORIZON PERFORMANCE

CAMPAIGN MOVEMENT

ROLLBACK CHECKPOINTS

OWNER CANDIDATE PATH

COMBINED PLAYTEST PATH

PRODUCTION CHANGES
exact changed paths by package

KNOWN LIMITATIONS

NEXT ACTION
Current Ops PM reviews the technical candidate. The Owner then completes P08–P10 acceptance plus focused P06/P07 regression checks. No P11 or later implementation begins before that disposition.
```

Then stop.

Do not begin P11.
Do not claim Owner acceptance.
