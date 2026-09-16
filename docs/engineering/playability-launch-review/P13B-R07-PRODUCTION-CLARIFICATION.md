# P13B — R07 production clarification and fixture/restart corrections

**Future Ops · 2026-09-16 · Documentation and pinned-source reconnaissance only.**
**Disposition:** R07 has a concrete recommended production specification below; Current Ops/Fable must record its adoption in the existing phase plan before implementation. It is not yet a delivered capability. Independent staffing, queues and other authorized engine work continue. No new research campaign, agent setup or Unity task is requested.

## 1. Authority and current boundary

Current Ops' logic-first transmittal controls the operating sequence: remaining P13B → P14 → P15 → P16 → only supported, sufficiently specified P17/P18 work. The full R3 hybrid UI/UX overhaul and all Unity integration/native acceptance remain **PAUSED / OPEN**, not cancelled or discharged by headless tests. Preserve all eight P13B Ready obligations and the existing [Unity backlog][backlog].

Inspected engine: `877aad57f6c5356724ce4fa47c582800e46571ca`, `wip/headless-program-20260916-ts`. Its [plan][headless] and [progress][progress] report S1/S1b LOGIC VERIFIED · UNITY NOT VERIFIED; S2 has implementation/targeted evidence, with final regression attribution/closeout still pending. S3's expanded local work is not established by this pin. Live source is Save V22 / protocol 4 / projection 34, technology root v3; these are reconnaissance identities, not future version reservations or a paired Unity build. Do not use older V19/V20 assumptions or the stale earlier paragraphs of the continuation record as current contracts.

This note supplies a bounded clarification to the [P13B companion][companion] §§2–4/8, [paper comparison][paper], and [catalogue][catalogue] CAT-011/012/025 and R07. Original-game history is not being re-researched: the recipe, setup units and staging below are **successor design recommendations**, not claims about Lionhead or historical productivity.

## 2. R07: the exact useful task

### Recommended recipe and qualifying Sets

Introduce one authored production-plan recipe, suggested stable ID **`ballroom-reveal-lighting-01`**: **“Ballroom reveal — foreground, entrance and background lighting cues.”** The intended scene moves attention between the entrance and foreground performance while the background remains separately controlled. The production task is **rig, focus/balance and verify those lighting cues for the exact mounted Set**; it is not filming, Set construction, scenery load-in or technology installation.

The recipe is selected as part of the actual production's creative/setup plan through a reviewed engine action. It must be reachable through ordinary project planning, not exclusively by injecting a test-only field. Bind it to an exact production and plan revision. Require a usable standing Set of existing type **`grand-ballroom`**, mounted on the reserved operational soundstage. Its name or genre is not the gate. In [current Sets][sets], genre fit is advisory; this proposal adds eligibility for this explicitly selected recipe only, not a genre restriction on existing films.

The plan must retain this particular scene requirement; omitting its setup while retaining the recipe must refuse admission. A player cannot select the ballroom-reveal scene and then call its lighting “ordinary” merely to skip the preparation. Selecting a simpler scene is a different creative plan, disclosed and revalidated—not the same scene with its delay switched off. Record the chosen recipe and its performed preparation with the film. No numerical quality/appeal reward is added for selecting it.

| Authored setup requirement | Qualifying Set | No operational R07 on bound stage | Operational R07 on bound stage |
|---|---|---:|---:|
| Ballroom reveal / multi-zone cues | Usable `grand-ballroom`; valid size fit | 4 setup units | 2 setup units |
| Ordinary single-zone interior control | Usable `generic-interior` or `apartment-interior`; valid size fit | 1 setup unit | 1 setup unit |
| Legacy production without a new setup-plan record | Existing rules | Existing schedule unchanged | Existing schedule unchanged |

**One setup unit = one eligible authoritative production-work week**, candidate tuning; this is not the research numerator (currently 1/160,000). The equipment removes repeated rig/balance/cue-check work for the specified recipe; it does not double the global production rate. Preserve existing acting/craft/Set-quality inputs, filming duration, Post, release, reputation and revenue formulas. Changed calendar dates may still have their normal downstream effects.

### Exact Set-size relationship; retain CAT-011 without making it a false lighting prerequisite

Represent authored **standard / oversized** Set and stage-acceptance descriptors in the existing Set/placement owners. Legacy Sets and stages remain standard; do not infer size from names, quality, genre or screen pixels. Standard stage accepts standard only; the proposed large stage accepts standard or oversized, still one mounted Set and one production slot. A standing, usable Set with an incompatible mount must never reach admission.

**Recommended sequencing refinement to companion §3:** the standard-sized ballroom recipe supplies the first R07 consumer. Complex lighting is not synonymous with an oversized Set, so it does not require a new large-stage purchase. Add the neutral standard classification with this consumer; keep CAT-011's large-stage/oversized-Set work and companion A12's refusal/acceptance proof explicitly open until their own placement/content disposition is satisfied. This recommendation changes the prerequisite ordering, not their retained scope. Do not mark complete A12 or P13B while that retained requirement has no disposition.

An oversized variant later uses the same lighting rule only if it carries this same multi-zone recipe; size alone grants no lighting benefit. The K4 large-stage body, footprint, prices and oversized content are not silently approved by this note. This separates an implementable standard-stage consumer from an independent size/capacity expansion rather than guessing new geometry.

## 3. One production owner, real gates and preserved locks

**Work owner:** extend [production operations][operations] (`advanceManagedProductions`, phase admission, exact stage/Set bindings), not research, the UI, P09 construction or a second generic job scheduler. Add a bounded setup subtask between completion of normal rehearsal and entry to Shooting for new explicitly planned productions. Preserve the existing rehearsal week; setup is additional, visible work for those new plans. Keep `remainingTicks = 6` / rehearsal while its setup gate remains open; the shared [phase/validation owner][phases] must recognize this substate. Do not stretch the global 8-tick table or change legacy films.

At setup admission, hold the production's existing stage/Set binding, release only what the established phase law releases, and snapshot recipe/version, stageId, setId, size eligibility, required units and exact operational lighting evidence. No extra laboratory, Scientist, crew microassignment or parallel scenery reservation is introduced. Existing shooting scenery/load-in and scheduled-take gates still apply afterward.

Credit at most one unit over each eligible `[w,w+1)` interval, never on selection, queueing, load, or repeated fixed-point sweep visits. Admission at w earns its first unit at w+1. Persist enough bounded task evidence to prove worked weeks and completion once; avoid an extra polling loop. A queued/unadmitted production holds no speculative setup resources. Report normal capacity waiting separately from worked setup time. Preserve the existing sweep order; any change to its derived wait-age calculation needs an explicit shared-owner disposition, not a silent side effect.

**Technology/physical gate for the 2-unit route:** knowledge or commercial availability alone does not qualify. The same campaign/studio must have acquired `lighting-control-01` access and the exact stage must have its completed, non-cancelled P09 `lighting-control-stage` fit-out, supplied-equipment evidence and operational P13 adoption. S5 must provide the per-technology access/equipment/site/install chain; S6 preserves cancellation/restoration. The installed electrical/control module in a Lab is research equipment, not stage capability. Lighting needs no sound method, sound-capture purchase or Post fit-out; [the live catalogue][techcat] correctly gives it `postInstallationId: null`.

Use P09's quote, target availability, commitment, occupancy, completion and restoration rules. If the target cannot be installed while its Set/work occupies it, install before commissioning/binding the Set or use its lawful existing release/strike route—do not waive the check for a fixture. Installing on Stage B never benefits a task bound to Stage A. Construction, delivered-but-uninstalled equipment and cancelled/restoring adoption give no reduced setup.

**Two different locks:** setup workload/equipment provenance is fixed when that setup starts; sound choice still locks only at actual Shooting entry under [technologyProduction][techprod], before the first take. Do not call setup “first filming,” create a `ShootingTask` early, or satisfy a future P14 first-take promise. Enter Shooting only after setup and all existing phase requirements pass; schedule and complete the actual take separately.

Preserve lawful pre-Shooting sound changes/retargeting. Same unchanged binding retains completed setup work. A different stage, Set or incompatible recipe requires a new physical setup instance, while old performed work/costs remain in history; no transfer of prepared lighting to another stage. Recheck the conjunction of sound-chain, Set-size and setup requirements. Do not make a partly worked 4-unit task instantly finish by acquiring technology elsewhere. P09 must refuse conflicting retrofit while the target is reserved. Research cancellation and installation cancellation remain separate from production cancellation; this note grants no new film-cancellation command or universal undo/refund.

**Money:** keep S5's component quotes and normal operating/payroll/production charges. Add no setup surcharge, generic quality bonus, fee discount or duplicate scientist bill. Fewer setup weeks is the benefit; actual cash consequences must be computed by existing owners. Stage reservation continues through filming until its existing release boundary, not merely until setup completes.

## 4. Required engine proof and future client evidence

Recommended exact action contract: extend the production-plan owner with recipe selection/review (semantic name `setProductionSetupRecipe`, final naming delegated), carrying productionId, recipeId and current plan revision; engine derives Set eligibility and workload, never accepts client-supplied work credit. Expose exact task/binding, current/required units, work/wait reason, adoption source and completion evidence. Stale/unknown IDs refuse without substitution; return the same command/receipt correlation as existing reviewed actions.

Preserve bounded setup-start, progress and completion witnesses with production/recipe/version/stage/Set IDs, operational-adoption reference or explicit conventional route, work week and credited/cumulative units. Setup completion is distinct from a P09 installation receipt and from `phaseEntered(shooting)` / first-take completion. Keep terminal provenance through the existing production/film-history owner after the live workflow is removed. No event-history compaction may be the only source of live completion truth.

**Useful matched example (proposed test, not executed):** at setup-ready week 820, the same ballroom-reveal production and matching Sets/cast have satisfied normal rehearsal. Route A uses conventional lighting; Route B has a lawfully researched and installed R07 on its bound stage before 820. With no other capacity block, setup completes 824 versus 822 and permits Shooting that much earlier. Both still require the existing scheduled take. Use a lawful predecessor history and real commands; do not inject operational flags. A shared Post bottleneck may erase the eventual release-date lead, so this is not a guaranteed two-week-earlier revenue claim.

**Control and hostile cases:** ordinary setup completes 821 in both routes; legacy no-record film keeps its old timeline; wrong Set type/size refuses; knowledge-only, Lab-only, wrong-stage, active retrofit and cancelled installation receive no discount. Test occupied-stage competition, changed pre-Shooting sound choice, unchanged-binding save/reload, different-binding restart without recycled physical work, same-week retries, completed-task idempotency, and independent Save As worlds sharing entity IDs. Prove no filming, quality or research-output change. Readable preview → actual setup → Shooting → take → result and R07's two-stage usefulness still require later Unity integration/native verification.

Use the next governed save/projection versions at execution; no V23/projection-35 reservation here. Existing saves receive no invented setup history or extra delay. Rivals reuse the rule through their real production/capacity owners; do not invent player-style lots or gift large-stage capacity. S8 must identify the actual comparable recipe/capacity producer before claiming symmetric use.

## 5. Residual-lighting timing: correct dates, qualified costs

The old paper row's 52 units at research opening week 780 is unreachable. The [published S2 test][doc03test] creates it lawfully: eight funded four-seat weeks from 780 produce 48 units/$320,000 R&D; one zero-ceiling week produces 4 more; **52 verified / 12 remaining at 789**. Neither the research opening 780 nor commercial release 936 changes.

Full-project comparisons remain `[780,832)`. Residual comparisons are `[789,841)` with the same 52-week horizon:

| Residual route | Sound knowledge | Lighting knowledge | Sound / lighting operational (paper S5 schedule only) | R&D in comparison window |
|---|---:|---:|---|---:|
| Cooperate sound, then finish lighting | 796 | 798 | 808 / 802 | $720,000 |
| Split sound and residual lighting | 800 | 791 | 812 / 795 | $520,000 |

The published tests assert the knowledge dates, research spend and idle-person-week differences. This review read them; it did not rerun them. Residual R&D delta remains $200,000; full-project R&D delta $240,000. The $209,000 residual / $253,000 full **all-in differences remain conditional paper results**, including S5 deployment and separate operation assumptions—not isolated runtime totals proved by S2. Preserve the independent Post-onset correction (+$12,000 to both affected paper alternatives); no combined sound-chain onset.

The test hires all eight researchers at 780. For residual `[789,841)`, signing and the nine-week prehistory are sunk, equally excluded in both routes, while employment continues. Do not carry the old within-horizon signing line into these absolute totals. Whole-studio overhead/facility ledger lower bounds do not establish isolated department costs. Compare routes within their stated horizon; do not compare full versus residual totals as identical starting states. No economic-review restart is required.

## 6. “Exactly one restart”: no lifetime gameplay cap

For implementation and acceptance, interpret companion §2's cancelled-row wording as **one resumed instance of the same project, not one permitted restart for its lifetime**. The catalogue's “seed exactly one restart” must not clone retained work into multiple projects or issue multiple inventions. Any stricter reading is an unselected new restriction, not an authority to override delivered P13A behavior.

The current [begin/resume/cancel owner][research] reactivates cancelled projects after eligibility checks and records no restart quota. Keep repeated cancel → restart cycles lawful; retain project identity, verified work, spend and historical receipts; recheck current seats, instruments, date and funding; keep one active instance and at most one completion/access/prototype entitlement. No refunds for consumed research. Acceptance should perform at least two cycles, including save/reload, to prove the alleged quota was not added. This resolves the wording issue, not the separate S6 installation-cancellation policy.

## 7. Handoff disposition and one source concern

**Recommend adoption** of the recipe/task specification and explicit standard-stage sequencing refinement in §§2–4. Recipe details and 4/2/1 units remain provisional authored implementation/content choices; prices, 780/936 and larger-stage tuning are not newly Owner-approved. No new preference question needs to block independent engine work. If Current Ops does not accept decoupling the standard R07 consumer from K4, record that single dependency and finish the retained size/capacity substrate first—do not substitute a generic bonus or another progress bar.

**One material S2/S5 source concern to check at the existing closeout:** in `advanceResearchWeek` at this pin, the completion guard `access.some(...)` and pending `access.findIndex(...)` test `studioId` without `technologyId`. With one access already acquired, the second completed technology can therefore miss its own access grant. This is a source-derived finding, not an executed failure here. Require sound→lighting, lighting→sound and simultaneous completion to produce separate exactly-once access/prototype provenance; reconcile newer worker changes before acting. The generic operational gate also still uses sound-specific stage/Post checks: S5 must generalize it without treating lighting as sound. These are producer implementation checks, not new product decisions.

Return path remains the existing `HEADLESS-PROGRESS.md`, phase plan and `UNITY-INTEGRATION-BACKLOG.md`, updated only by their owner. This note changes no coding branch, performs no game tests and starts no worker. It leaves all full-game UI obligations, S3–S8, P14 first-take/feasibility refresh, P15 failure/settlement ownership, P16 full absorption and later-phase readiness intact. No P15 purchase execution, acquired autonomous studio, or 14-week estate guarantee is restored.

### Pinned source index

All source links below are immutable. Planning branches are not runtime baselines. The original companion/paper archives remain historical; this note records the bounded clarification rather than silently replacing their evidence.

[headless]: https://github.com/HSpector1/The-Movies/blob/877aad57f6c5356724ce4fa47c582800e46571ca/docs/engineering/playability-launch-review/plans/P13B-HEADLESS-PLAN.md
[progress]: https://github.com/HSpector1/The-Movies/blob/877aad57f6c5356724ce4fa47c582800e46571ca/docs/engineering/playability-launch-review/HEADLESS-PROGRESS.md
[backlog]: https://github.com/HSpector1/The-Movies/blob/877aad57f6c5356724ce4fa47c582800e46571ca/docs/engineering/playability-launch-review/UNITY-INTEGRATION-BACKLOG.md
[companion]: https://github.com/HSpector1/The-Movies/blob/673f49835404e262ea651b4fcb8fda5e259d80a6/docs/engineering/p13b-launch-review/02-P13B-DECISIONS-AND-ACCEPTANCE.md
[paper]: https://github.com/HSpector1/The-Movies/blob/673f49835404e262ea651b4fcb8fda5e259d80a6/docs/engineering/p13b-launch-review/03-PAPER-ECONOMICS.md
[catalogue]: https://github.com/HSpector1/The-Movies/blob/e48541b55d8c0825968c4f148996593bdd9f22b6/docs/design/STUDIO-UPGRADE-AND-RESEARCH-CATALOGUE-01.md
[sets]: https://github.com/HSpector1/The-Movies/blob/877aad57f6c5356724ce4fa47c582800e46571ca/src/core/sets.ts#L185-L227
[operations]: https://github.com/HSpector1/The-Movies/blob/877aad57f6c5356724ce4fa47c582800e46571ca/src/core/operations.ts#L1406-L1610
[phases]: https://github.com/HSpector1/The-Movies/blob/877aad57f6c5356724ce4fa47c582800e46571ca/src/core/productionPhases.ts
[techcat]: https://github.com/HSpector1/The-Movies/blob/877aad57f6c5356724ce4fa47c582800e46571ca/src/core/technologyCatalogue.ts
[techprod]: https://github.com/HSpector1/The-Movies/blob/877aad57f6c5356724ce4fa47c582800e46571ca/src/core/technologyProduction.ts
[doc03test]: https://github.com/HSpector1/The-Movies/blob/877aad57f6c5356724ce4fa47c582800e46571ca/tests/p13b-s2-doc03.test.ts
[research]: https://github.com/HSpector1/The-Movies/blob/877aad57f6c5356724ce4fa47c582800e46571ca/src/core/technology.ts#L293-L418
