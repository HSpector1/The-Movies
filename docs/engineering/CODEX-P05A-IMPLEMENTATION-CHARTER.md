# Project: Studio — P05A Implementation Charter

**Revision:** `P05A-IMPLEMENTATION-CHARTER-r1-FINAL`
**State:** `READY FOR OWNER AUTHORIZATION`
**Date:** `2026-08-30`
**Package:** Production, Soundstages & Shooting — P05A
**Current authorization:** Documentation handoff only. P05 implementation has not begun and may not begin until the Owner explicitly authorizes it.

## 1. Final entry contract

All launch facts are resolved to immutable values.

| Required fact | Final value |
| --- | --- |
| Owner-accepted P04A.3 TypeScript product | `71521efed5dd113a3911c85410d0729eab13918f` |
| Owner-accepted P04A.3 Unity product | `5076af43fcd6a279f26e15a46a8389689b69db74` |
| P04 documentation-inclusive TypeScript closeout | `4ddb58a38235067e3741a43905e3fc25f414ea0c` |
| Final post-contract-gate TypeScript campaign | `7811377cea1c1b9ddca2c17c626879504b23ed4e` |
| Final post-contract-gate Unity campaign | `29aea89a706a7f0961f5a460afc5bdb4d38d8395` |
| Immutable TypeScript generator/product beneath campaign tip | `56e170a8590e18f0d56a494d8bffb413f2d10924` |
| Immutable Unity consumer/test | `29aea89a706a7f0961f5a460afc5bdb4d38d8395` |
| Schema ID | `sha256:01f15efc8fc33fd810b051242857385ca23b5e1c775b357db1bfe5a70e907e1e` |
| Protocol | `4` |
| Projection | `11` |
| Save | `15` |
| Generated C# SHA-256 | `014a6b128a23b634a33b17643064d992f230295760faa96d790ec03d9256a1b7` |
| Generated C# Git blob in both source commits | `876a6c89b11feae49616ab14476cd4965fe49c2d` |
| Contract-gate attestation | `docs/engineering/attestations/P05A-STATIC-CONTRACT-GATE-01.json`, SHA-256 `180ce7df884e142116bfa2c555fa5ed581a2bc876bb3cfd787e2717ace5cf12c` |
| Visual Direction Package | branch `docs/visual-direction-package-01`; `docs/design/PROJECT-STUDIO-VISUAL-DIRECTION-PACKAGE-01.md` and Builder Annex at `728781dcfdcf32a13d3d3978cdc333b8c9a5e8a7` |

The TypeScript campaign tip includes a later, non-self-referential attestation commit. Contract generation and Unity compilation were attested against already-existing source pair `56e170a…` / `29aea89…`. No wire schema byte changed, so the gate did not bump schema, protocol, projection, or save.

### 1.1 Entry gate

The following prerequisites are complete:

- P04 is Owner-accepted, `KEEP`, and closed.
- CF-08 is `PASS` at the immutable generator/product commit.
- CF-09 is `PASS` against the actual committed Unity consumer.
- the full TypeScript floor and `585 / 585` Unity EditMode floor are green;
- the hostile contract-gate reviewer returned final `ACCEPT` after the one genuine order-determinism blocker was fixed and reverified;
- final readiness and reconnaissance are reconciled to the post-gate pair;
- no mandatory pre-P05 maintenance remains.

One condition remains intentionally outside engineering control: explicit Owner authorization. Before it exists, do not create P05 implementation branches, edit code/assets/schema, start Unity for P05, run a player, or initiate a builder wave.

## 2. Controlling authority

Precedence remains: Owner rulings; Package 05 main design; Builder Annex; final reconnaissance; final readiness; this charter; Visual Direction for presentation only; Unity architecture; accepted P04; current code; static-audit risk evidence. The exact committed citations are:

| Authority | Committed citation |
| --- | --- |
| P04 Owner ruling and durable lessons | `docs/engineering/P04-IMPLEMENTATION-AND-OWNER-PLAYTEST-LESSONS-LEARNED.md@4ddb58a38235067e3741a43905e3fc25f414ea0c` |
| P04 campaign ruling ledger | `docs/campaigns/LIVING-LOT.md@4ddb58a38235067e3741a43905e3fc25f414ea0c` |
| Package 05 main design | `docs/design/CODEX-PRODUCTION-SHOOTING-PACKAGE-05.md@d5653327c17709daea5e17ba00ce164678b9ad43` |
| Package 05 Builder Annex | `docs/design/CODEX-PRODUCTION-SHOOTING-PACKAGE-05-BUILDER-ANNEX.md@d5653327c17709daea5e17ba00ce164678b9ad43` |
| Static contract-gate implementation plan | `docs/engineering/CODEX-P05A-STATIC-CONTRACT-GATE-01-IMPLEMENTATION-PLAN.md@044a3d6a16bd4cb90dd55aec5eecd6bedeedf28d` |
| P05 provisional charter source | `docs/engineering/CODEX-P05A-PROVISIONAL-IMPLEMENTATION-CHARTER.md@044a3d6a16bd4cb90dd55aec5eecd6bedeedf28d` |
| P05 readiness source reconciled by r2 | `docs/engineering/CODEX-P05A-READINESS-GATE-00.md@94285559a0a11466ee036104cf52e56a9f2893ed` |
| P05 reconnaissance source reconciled by r2 | `docs/engineering/CODEX-P05A-IMPLEMENTATION-RECONNAISSANCE.md@9b72981205a90bcac52ff2ab1bb248e9d16edd72` |
| Current-forward static audit | `docs/engineering/CODEX-CURRENT-FORWARD-CODEBASE-STATIC-AUDIT-01.md@ee522834bd134280469eeb3878765e9f575018cf` |
| Unity architecture audit | `docs/engineering/CODEX-UNITY-PRODUCTION-ARCHITECTURE-AUDIT-01.md@8110820d96ddf2089df582bc0a0a92d3d4cf17d9` |
| Unity architecture Builder Annex | `docs/engineering/CODEX-UNITY-PRODUCTION-ARCHITECTURE-AUDIT-01-BUILDER-ANNEX.md@8110820d96ddf2089df582bc0a0a92d3d4cf17d9` |
| P04 implementation reconnaissance | `docs/engineering/CODEX-P04A-IMPLEMENTATION-RECONNAISSANCE.md@44b0c8d0440fd683910d1ecd5a6365eaa49d82fc` |
| P03A.3 UX North Star | `docs/ux/P03A3_UX_ACCEPTANCE_AND_UI_NORTH_STAR.md@39cdef7b14044b11d7f0561b01c27638712e18da` |
| Visual Direction main package | `docs/design/PROJECT-STUDIO-VISUAL-DIRECTION-PACKAGE-01.md@728781dcfdcf32a13d3d3978cdc333b8c9a5e8a7` |
| Visual Direction Builder Annex | `docs/design/PROJECT-STUDIO-VISUAL-DIRECTION-PACKAGE-01-BUILDER-ANNEX.md@728781dcfdcf32a13d3d3978cdc333b8c9a5e8a7` |
| Visual mockup A | `docs/design/mockups/visual-direction-01/A-default-lot.svg@728781dcfdcf32a13d3d3978cdc333b8c9a5e8a7` |
| Visual mockup B | `docs/design/mockups/visual-direction-01/B-building-card.svg@728781dcfdcf32a13d3d3978cdc333b8c9a5e8a7` |
| Visual mockup C | `docs/design/mockups/visual-direction-01/C-casting-workspace.svg@728781dcfdcf32a13d3d3978cdc333b8c9a5e8a7` |
| Visual mockup D | `docs/design/mockups/visual-direction-01/D-stage-states.svg@728781dcfdcf32a13d3d3978cdc333b8c9a5e8a7` |
| Contract-gate attestation | `docs/engineering/attestations/P05A-STATIC-CONTRACT-GATE-01.json@7811377cea1c1b9ddca2c17c626879504b23ed4e` |

The Visual Direction source was supplied by the Owner as local branch `docs/visual-direction-package-01`; the binding identity is each exact `path@728781d…`, not the branch label. The refresh verified that commit object and all six paths. If a future implementation checkout cannot resolve that exact commit, Entry stops; it may not substitute another branch or recollection. Publishing or repointing that separate authority branch is outside this documentation task.

The three final launch documents are co-committed outputs on `codex/p05a-final-refresh-01`. Their pushed commit SHA binds all three paths and is recorded in the external launch response; this charter does not recursively embed its own future commit. Visual mockups remain directional hierarchy references, not pixel-coordinate or simulation contracts.

## 3. Product goal and hard boundary

At normal management distance, the player must immediately understand:

- that a movie is being made;
- where it is being made;
- what phase or operational state it is in;
- who is involved;
- whether it is blocked;
- what, if anything, the player must do.

Production becomes alive, legible, autonomous, locatable, exact-ID driven, and safe across multiple concurrent projects before it becomes cinematic.

P05 includes Production lifecycle truth repair, closed Production/Stage projection, exact-ID N-Stage presentation, visible Stage activity, retained Production workspace, the current existing Production operations, and exactly six Visual Oracle scenarios.

P05 excludes Post editing, release controls, film-outcome systems, performed-week playback, Watch Shoot, Advanced Movie Maker, client work, stunts, reshoots, cinematic capture, global art reskin, HDRP, DOTS, renderer migration, and unrelated static-audit maintenance.

## 4. Permanent engineering and product laws

These laws apply to every wave and report:

1. Technical `KEEP`, green automation, or hostile `ACCEPT` is not Owner acceptance. A player-facing package remains a keep candidate until the Owner completes the named journey and rules.
2. Every representative journey is proved with deterministic synthetic fixtures, a migration/compatibility fixture, and—where real persisted state matters—a private byte-copy of the Owner's real profile. Never mutate the real profile.
3. World anchor → local card → primary action works without rail, dashboard, memo, or other-surface priming. Rails are shortcuts, never hidden prerequisites.
4. A visible enabled action acts or gives an exact visible reason. It never silently no-ops or returns behind an enabled control.
5. A disabled action's adjacent sentence names the exact blocking term and cannot display a satisfied reason.
6. `READY NOW`, `READY TO QUEUE`, and `BLOCKED` are three distinct semantic states. Queueable legal work remains actionable and says what waiting means.
7. Credit, assignment, current presence, Production-company seat, exclusivity, and fee are distinct. A Writer credit alone is none of the latter five.
8. One pure decision function owns every material action's headline, detail, enabled state, and dispatch eligibility. Tests assert the pair, not only the boolean.
9. A transient poll/request term is refreshed at its actual cadence and never permanently latches a control. Removing such a gate is itself a hypothesis that must be measured against dispatch.
10. When a shared mechanism fails, enumerate all sibling consumers. Fix or explicitly disposition each; do not patch only the reported surface.
11. Exact IDs govern Production, project, company, Stage facility, Stage world body, Set, person, task, operation, and intent. Titles, names, array position, first controller, nearest Transform, and visual prominence are never joins.
12. Current ownership beats historical Wrap. A historical Set or receipt cannot claim a current Stage or override a new holder.
13. TypeScript owns lifecycle, blockers, remedies, presence, identity, ordering, and player-law copy. Unity presents the closed truth and fails closed on contradictory identity.
14. One editing owner exists per checkout and collision-prone file. Workers do not merge or move campaign branches.
15. An identical failed simulation or runtime attempt may not be repeated without a new concrete hypothesis. Evidence from every failed attempt is retained.
16. Machine, visual, HID, and Owner proof are separate layers. None substitutes for another.
17. Real HID tooling normalizes and records modifier state before and after every click/key action; unexplained modifier state invalidates the action evidence.
18. Runtime evidence binds exact binary bytes, process ID, owned window identity, source commits, clean trees, schema, fixture, camera, viewport, and artifact hashes.
19. Unreadable, stale, absent, and failed evidence are different states and remain separately visible in reports.
20. Hostile review attacks remedies, comments, reports, proof tools, and assertions—not merely the happy implementation path.
21. No next-package code enters an unaccepted checkpoint. P06/Post remains outside P05.

## 5. Identity, lifecycle, and visual laws

- `Production != Stage != Set`; facility ID and world building ID also remain distinct.
- All active Productions appear, deterministically ordered by exact `productionId`.
- Stage allocation stays TypeScript authority and remains atomic with a standing Set for current-binding workflows. Explicit `requiresSetBinding:false` migration compatibility remains narrow.
- Raw phase never proves current worksite. Reservations plus binding agreement prove current ownership.
- Load-In is an operational beat inside Shooting, not a persisted phase and not Rehearsal.
- A blocked Production never appears hot/Shooting. An active Production never borrows another project's blocker or activity.
- `progress01` is compatibility-only and is not rendered as P05 progress.
- Selecting a Production changes information only. Explicit fresh Locate/Focus may move the camera; snapshot refresh, phase, blocker, Greenlight, Wrap, polling, load, and reconnect do not.
- The lot remains visually dominant. Workspace and overlays support the world rather than replacing it.
- Lifecycle states are visibly distinct; Blocked reads at management distance.
- One truthful Stage/project nameplate follows the exact current holder.
- The N-Stage presenter supports every projected Stage by exact identity. Stage B cannot display Stage A or false permanent status.
- Load-In visibly expresses freight/equipment movement without pretending route simulation is authority.
- Shooting is unmistakable at management distance through restrained Stage-local cues.
- Wrap is bounded and cannot override a new current holder.
- Decorative crew/logistics carry no authoritative ID, staffing, progress, blocker, payroll, or outcome effect and may be configured to zero.

## 6. Implementation branches and ownership

After Owner authorization, create isolated clean worktrees and immediately push:

- TypeScript `wip/p05a-production-shooting-01-ts` from `campaign/living-lot-ts` at `7811377cea1c1b9ddca2c17c626879504b23ed4e`;
- Unity `wip/p05a-production-shooting-01-client` from `campaign/living-lot-client` at `29aea89a706a7f0961f5a460afc5bdb4d38d8395`.

Do not edit campaign branches directly. Verify local equals remote, tracked/untracked cleanliness, correct repositories, Unity project version, and no Project: Studio/Unity process before assigning owners.

### 6.1 Exact collision map

“Exclusive” means one active editor, not merely one conceptual reviewer. For the three sequential collision seams, ownership transfer is explicit: the outgoing owner commits, pushes, records the exact range and test result, leaves the worktree clean, and stops editing; the lead verifies that evidence before assigning the incoming owner. No file is jointly edited during a handoff.

| Owner | Exclusive paths/surface | Forbidden collision |
| --- | --- | --- |
| Lead/integrator | `src/core/operations.ts`, `actions.ts`, `scriptReadModel.ts`, `firstFilmJourney.ts`, `ui/src/engine/adapter.ts`; Unity bridge/client/bootstrap/host/menu/input/navigation; scene/authoring cut; campaign refs | no worker edits these while lead owns them; lead coordinates but does not edit bridge-session/schema/generated files assigned below |
| TypeScript scenery owner | `src/core/sceneryLoadIn.ts`, bounded `tick.ts` seam, focused scenery tests | no schema, UI, bridge, save, allocator redesign |
| TypeScript Production projection owner | `ui/src/lot/snapshot/StudioLotSnapshot.ts`, one bounded Production composition module and tests | no parallel snapshot root; `adapter.ts` integration is lead-only |
| Bridge-session owner | `bridge/session.ts`, optionally one `bridge/snapshot-build-context.ts`, focused bridge tests | sole editor from W0 through its W2 session hookup; then clean committed handoff to lead for review only, not further session edits |
| Generated-contract owner | `bridge/schema/bridge-schema.ts`, `bridge/schema/runtime.ts`, `bridge/schema/canonical.ts`, canonical schema JSON, accepted generator command/tooling, manifests, TypeScript generated DTO/fixtures, and exact Unity generated DTO/fixtures | sole editor for the entire W2 generation transaction; generated paths are never handed to a manual editor; verifier/generator frozen absent proved defect |
| Unity Stage owner | new exact-ID Stage registry/controller/profile fallback and focused tests; bounded existing Stage presenter/effects files | no `StudioBridgePresentation.cs`, client, host, workspace, or body registry |
| Unity presence/activity owner | exact-ID body index, bounded person presenters, Stage-local decoration/logistics | no authority derivation, bridge application, or lifecycle decision |
| Unity workspace owner | new Production workspace controller, UXML/USS, focused tests | consumes existing host; does not edit `StudioWorkspaceHost.cs`, input, menu, camera |
| Visual Oracle owner | deterministic fixtures, P05 proof runner, scenario sidecars, bounded oracle tool | proof cannot repair product code or judge its own images |
| Evidence operator | exact commands, XML/log/image collection, hashes and manifests | no production edit, retry without hypothesis, or visual disposition |
| Documentation owner | final implementation report and campaign ledger after seal | no code and no Owner-verdict invention |

Lead-only Unity collision paths include:

- `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs`;
- `Assets/Studio/Runtime/Presentation/StudioBridgePresentation.cs`;
- `Assets/Studio/Runtime/Presentation/StudioBridgeBootstrap.cs`;
- `Assets/Studio/Runtime/Presentation/UI/StudioWorkspaceHost.cs`;
- `Assets/Studio/Runtime/Presentation/UI/StudioPresentationInputContext.cs`;
- `Assets/Studio/Runtime/Presentation/StudioSystemMenuHud.cs`;
- `Assets/Studio/Runtime/Presentation/StudioSystemMenuContracts.cs`;
- `Assets/Studio/Runtime/Presentation/TycoonCameraController.cs`;
- `Assets/Studio/Runtime/Presentation/StudioCameraDirector.cs`;
- `Assets/Studio/Runtime/Presentation/StudioSelectionManager.cs`;
- `Assets/InputSystem_Actions.inputactions`;
- any necessary scene/prefab/authoring cut.

The final Unity generated DTO/fixture files remain exclusively owned by the Generated-contract owner. The lead may verify, commit-range review, and consume those immutable bytes in protocol/presentation code, but may not edit or recopy them after the generated-contract owner stops. Any regeneration returns ownership to that owner and invalidates dependent proof.

Existing Casting code is reuse/frozen except an explicit lead-owned successor seam. P05 workers may not casually edit `StudioCastingWorkspace`, `StudioCastingInspectorCard`, or P04 proof tools.

## 7. Ordered implementation waves

Every wave ends with a coherent pushed commit, focused evidence, clean tree, exact-range review, and an interface freeze before the next begins. A failed exit condition returns only to the owning wave.

### ENTRY — verify and isolate

- Dependency: explicit Owner authorization.
- Owner: lead/integrator.
- Work: verify the exact campaign pair/remotes/clean trees; create and push both isolated WIP branches; assign file ownership; record Unity version and process absence.
- Tests: read-only SHA/ref/status/remote/schema/attestation checks.
- Stop: wrong SHA, dirty tree, missing attestation, active conflicting process/worktree, or ambiguous owner.
- Exit: exact clean starting pair and owner map recorded; no product file changed.

### WAVE 0 — shared snapshot-build context

- Dependency: Entry.
- Owner: Bridge-session owner; the lead reviews the clean pushed range without editing its files.
- Paths: `bridge/session.ts`; only if proven, one new `bridge/snapshot-build-context.ts`; focused bridge tests.
- Work: compute validated snapshot/projection/serialized/hash facts once per authoritative revision and share them across current consumers without changing semantics.
- Tests: snapshot/intent/save/session/digest equality, mutation isolation, determinism, focused bridge floor, typecheck.
- Stop: schema bytes, command legality, digest/revision law, error surface, or save behavior changes; parallel cache; hidden mutable alias.
- Exit: byte/behavior equivalence plus focused performance/duplication evidence. This is bounded CF-07 folding, not a bridge rewrite.

### WAVE 1 — TypeScript Production truth and scenery correction

- Dependency: W0 interface freeze.
- Owner: TypeScript scenery owner for bounded core; lead owns collision integration.
- Paths: `sceneryLoadIn.ts`, `operations.ts`, `actions.ts`, `tick.ts`, `scriptReadModel.ts`, `firstFilmJourney.ts`, focused existing tests.
- Work: exact provenance classification, due-at-call and next-boundary settlement, once-only event, explicit-grandfather-only Clear, current arrived/reconnect state, and aligned decisions/guidance.
- Preserve: allocator, phase/save/event timestamp law, P04 Greenlight/Writer laws, queue law.
- Tests: due-at-call, remaining-one boundary, current transit, arrived-current reconnect, explicit grandfather, absent/malformed provenance, forged Clear, idempotence, reload, exact event chronology, sibling consumer agreement.
- Stop: current load-in still clears manually; grandfather arm broadens; duplicate event; save field/migration; unrelated scenery/path/vehicle system; P04 law regression.
- Exit: one core legality function/classifier owns all affected producers and command enforcement.

### WAVE 2 — closed Production projection and generated bridge

- Dependency: W1 truth freeze.
- Owners in sequence: TypeScript Production projection owner freezes its non-collision shape; Bridge-session owner performs only the `bridge/session.ts` hookup; Generated-contract owner alone edits schema/tooling and both repositories' generated outputs; lead reviews and integrates the committed ranges without editing those assigned files.
- Paths: `StudioLotSnapshot.ts`, bounded Production composition, `adapter.ts`, `bridge/session.ts`, bridge schema/canonical/runtime, generated outputs and focused tests.
- Work: all-active exact-ID Production rows; closed operational states; exact worksite/Stage/Set/presence/blocker/remedy/operation/Wrap fields; Stage-local collection; projection invariants; exact intents.
- Generated representation: nullable law, structural merge law, abstract discriminated base + sealed members + fail-closed converter. Regenerate only through the accepted command and copy exact bytes to the actual Unity consumer.
- Tests: duplicate/ambiguous IDs, order invariance, same-title isolation, current holder before Wrap, worksite/Locate, closed states, writer semantics, current quote/command unions, new P05 union fixtures, schema and exact-consumer lock.
- Stop: handwritten DTO, self-copy verification, silent incompatible union, inferred C# law, unexplained version bump, save migration without saved-byte change, dirty tree.
- Exit: frozen schema/DTO pair, exact manifest/hash, checker green against immutable committed blobs, Unity consumer commit pushed.

### WAVE 3 — exact-ID N-Stage registry

- Dependency: W2 frozen DTO.
- Owners: Unity Stage owner; lead alone hooks bridge/bootstrap.
- Paths: new registry/tests plus bounded `StudioStageProductionPresentation.cs`; lead-owned bridge application.
- Work: register/unregister each Stage by exact facility/world identity; bind closed Stage truth; neutral fallback for missing/unknown/profile failure; remove singleton/Stage-7/first-controller logic.
- Tests: 0/1/N Stages, duplicate identity, missing body, unknown Stage, same-title projects, holder replacement, Wrap/new-holder precedence, Stage A/B isolation, no scene-wide search.
- Stop: registry decides lifecycle/ownership; title/array/nearest join; one Stage failure suppresses unrelated Stages; scene or assembly restructure.
- Exit: exact-ID Stage controller lookup and independent application proved.

### WAVE 4 — world presentation, activity, presence, and visual hierarchy

- Dependency: W3 registry.
- Owners: Unity Stage and Unity presence/activity owners in non-colliding files; lead integrates.
- Work: distinct Idle/Rehearsal/Load-In/Blocked/Shooting/Wrap presentation, truthful nameplate, exact-ID named bodies, bounded decorative crew, freight/equipment cue, Shooting cue, Wrap release, semantic profile fallback.
- Tests: state mapping, holder-matched people, writer/craft placement, decoration zero/high equivalence, logistics has no gameplay effect, Stage A/B no leakage, blocked management tell, reduced-motion and missing-profile fallback.
- Stop: visual code interprets raw lifecycle; false permanent nameplate; blocked looks hot; craft/Writer fabricated at Stage; global reskin/HDRP/DOTS/renderer or scene rebuild.
- Exit: machine assertions green and management-distance imagery ready for independent Oracle review.

### WAVE 5 — retained Production workspace

- Dependency: W2 projection and W3 exact Stage routes.
- Owners: Unity workspace owner for new content; lead owns host/input/menu/memo/navigation seams.
- Work: all-active deterministic list; exact detail; state rail; worksites/Locate; company/presence; current Stage/Set separated from history; blocker anatomy; current operation; read-only Wrap/Post handoff; wide/narrow/controller/200% text.
- Reuse: one runtime `UIDocument`, code-created `PanelSettings` at 1920×1080/match 0.5, guarded EventSystem/InputSystemUIInputModule, accepted input context, Back/origin, system menu, memo fallback.
- Tests: one pure action decision per control, exact disabled reason, queueable distinction, stale snapshot/intent, row reorder/same title/removal, Locate revalidation, selection stationarity, nested/root Back, Esc order, Save/Load/Quit coexistence, memo hidden fallback, responsive hierarchy.
- Stop: parallel document/router/back/camera stack; display-copy parsing; locally minted intent; selection moves camera; transient poll latch; silent enabled control; Post control.
- Exit: workspace independently operable from world Stage and with generic memo hidden.

### WAVE 6 — Visual Oracle V1

- Dependency: W1–W5 frozen functional boundary.
- Owner: Visual Oracle owner; independent visual reviewer judges images.
- Work: freeze fixture bytes, numeric camera tuples, viewport, scenario sidecars, machine assertions, screenshots, and no-replay scopes for the six scenarios in section 9.
- Tests: scenario determinism, exact IDs, camera stationarity/restoration, semantic roots, artifact completeness/hashes, agent image inspection.
- Stop: seven scenarios, unfrozen camera prose, stale/wrong build/window, proof tool repairs product law, image not opened by reviewer, or sidecar/binary mismatch.
- Exit: all six scenario dispositions accepted; VO-5 isolation remains a variant, not a seventh scenario.

### WAVE 7 — full regression and fresh hostile review

- Dependency: W6 accepted Oracle.
- Owner: lead for floors; one fresh high-capability reviewer, no reviewer-shopping.
- Work: full TS/static/bridge/build floor, exact-consumer check, full noninteractive Unity EditMode, affected packaged machine/visual/HID journeys, hostile review against section 11.
- Stop: any real blocker, weakened assertion, stale evidence, wrong consumer, dirty tree, scope leak, or missing sibling audit.
- Correction law: accept the finding; fix root cause in its owning wave; rerun focused tests and every affected layer; return to the same reviewer for final disposition.
- Exit: green exact final commits, hostile `ACCEPT`, clean pushed WIP branches.

### WAVE 8 — integration, seal, and Owner journey

- Dependency: W7.
- Owner: lead/integrator; Owner alone supplies acceptance.
- Work: exact-range review; fast-forward WIP to campaign branches only after all gates; push; verify remote equals local; bind final binary/process/window/evidence; prepare Owner journey.
- Owner journey: from the lot without rail priming, identify a Production/Stage and state; open the Production workspace; understand and execute one exact current action; observe truthful transition; verify another Stage/project remains isolated; save/load/menu/Back remain usable; observe Wrap/Post handoff without P06 controls.
- Stop: merge commit, force push, history rewrite, main merge, Golden tag, wrong process/window/binary, mutated Owner profile, or any technical report claiming acceptance before the Owner rules.
- Exit: technical `KEEP CANDIDATE — Owner acceptance pending`; only the Owner's explicit verdict may change it to accepted/closed.

## 8. Minimal proof pyramid and invalidation

The charter retains five contractual levels. Level 4 contains three separate runtime gates; they may share a build but may not substitute for one another.

### LEVEL 1 — TypeScript/static truth

Focused and full engine/projection tests, typechecks, schema tests, determinism, save/migration, repository hygiene, browser dependency and 3D audits, build, studio build, packaged graph. Proves simulation/read-model/static laws only.

### LEVEL 2 — generated contract

Generator fixture corpus, schema identity, deterministic regeneration, exact generated diff, actual committed Unity consumer lock, committed-blob attestation, current quote/command regression, P05 union fixtures. Proves wire/DTO agreement only.

### LEVEL 3 — Unity EditMode

Full noninteractive compile/EditMode against the exact final Unity commit and generated-consumer hash, retaining XML/log/command/timing/version. Proves C# behavior and test boundary only.

### LEVEL 4 — runtime gates

- `4M machine`: exact semantic assertions, process/build/window ownership, element-map/sidecar, no visual verdict.
- `4V visual`: actual image bytes opened and judged against the six-scene questions, no HID claim.
- `4H HID`: real normalized input journey with modifiers recorded, exact action effects/refusals, no Owner verdict.

### LEVEL 5 — Owner playtest

The Owner performs the named representative journey on the exact attested build and supplies the only acceptance verdict. Technical reviewers may recommend `KEEP CANDIDATE`; they may not mark Owner acceptance.

### 8.1 Local invalidation law

- TypeScript truth change reruns affected Level 1 tests, dependent Level 2, and only downstream Level 3/4 states whose bytes or semantics changed.
- Schema/generated change invalidates Level 2, full Level 3, and every Level 4 artifact bound to the old contract/build.
- Visual-only Unity change reruns focused Level 3 and affected `4V` scenes; it does not automatically require every TS test or unrelated HID journey.
- Input/control change reruns focused Level 3 and affected `4H`; visual scenes rerun only if visible bytes/behavior changed.
- Proof-tool, camera, viewport, scene, fixture, executable, process, or evidence-format change invalidates only artifacts bound to that identity, plus any dependent review.
- Product code change after a full final floor invalidates that affected final floor.
- Full packaged/HID replay is not required after every minor change. The affected proof layer is determined by dependency evidence, not habit.

## 9. Visual Oracle V1 — exactly six canonical scenarios

### 9.1 Shared exact-ID fixture ledger

| Entity | Exact ID |
| --- | --- |
| Production A | `prod-0000` |
| Production B | `prod-0001` |
| Load-In Production | `prod-0016` |
| Stage A building / facility / Set | `stage-a` / `facility-soundstage-07` / `set-0` |
| Stage B building / facility / Set | `stage-b` / `facility-soundstage-12` / `set-1` |
| Scenery source type | `facility-scenery-shop` |
| Placed Stage facility/body in Load-In fixture | `facility-stage-1` / `placed-1` |
| Placed Scenery facility/body | `facility-scenery-shop-2` / `placed-2` |
| Reserved scenery resource | `facility-scenery-shop-2:0` |
| A Writer credit | `t-p05-writer-a` |
| A Director / Lead / Antagonist / Support / Craft | `t-p05-director-a` / `t-p05-lead-a` / `t-p05-antagonist-a` / `t-p05-support-a` / `t-p05-craft-a` |
| B Director / Lead / Antagonist / Support / Craft | `t-p05-director-b` / `t-p05-lead-b` / `t-p05-antagonist-b` / `t-p05-support-b` / `t-p05-craft-b` |

Opaque intent IDs are emitted fixture outputs bound to session/revision/digest. Sidecars record and validate semantic kind plus exact `productionId`; neither fixtures nor Unity hardcode an intent ID.

Camera IDs are `CAM-MGMT-AB-V1`, `CAM-MGMT-LOADIN-V1`, `CAM-MEDIUM-LOADIN-V1`, `CAM-MEDIUM-A-V1`, `CAM-MEDIUM-B-V1`, and `CAM-CLOSE-A-V1`. Wave 6 freezes complete numeric pose tuples from the accepted camera/proof seam; this charter does not invent scene coordinates. A tuple change invalidates its images.

Every scenario records management and medium screenshots, a Production workspace screenshot, a close screenshot only when it answers a stated question, machine assertions, evidence sidecar, visual-review questions, and explicit no-replay scope.

### 1. Idle Stage

- Authoritative fixture: week `20`; Stage A valid and selectable; no current reservation or holder; `set-0` may stand without implying occupancy.
- Exact IDs: Production none; building `stage-a`; Stage facility `facility-soundstage-07`; optional Set `set-0`.
- Phase/blocker: Idle / none.
- Machine assertions: closed state Idle/Dark; holder/title/company/operation/authoritative people/activity/freight/beacon all absent; exact Stage selectable.
- Screenshots: `CAM-MGMT-AB-V1` management, `CAM-MEDIUM-A-V1` medium, Stage/Production workspace empty-state. Close omitted as not useful.
- Sidecar: exact null holder, Stage tuple, camera/viewport, semantic roots, artifact hashes, build/process/window and contract identities.
- Visual questions: Does available read differently from failed/blocked? Is any crew or activity invented? Is the state legible before opening details?
- No replay: no Greenlight, queue, Shooting, Wrap, HID, or other Stage journey; unaffected scenes do not rerun for Idle-only visual tuning.

### 2. Rehearsal

- Authoritative fixture: week `19`; `prod-0000` owns Stage A and live `set-0`; holder-matched Stage presence is A Director, Lead, Antagonist, and Support. Writer credit does not place a body; craft stays off Stage.
- Exact IDs: `prod-0000`, `stage-a`, `facility-soundstage-07`, `set-0`, `t-p05-director-a`, `t-p05-lead-a`, `t-p05-antagonist-a`, `t-p05-support-a`; Writer credit `t-p05-writer-a` remains attribution only.
- Phase/blocker: `rehearsal` / none.
- Machine assertions: Rehearsal/Preparing occupied-low; exact title/Set/people; no Load-In, Shooting beacon/take, Writer, or craft at Stage.
- Screenshots: shared management, `CAM-MEDIUM-A-V1`, exact Production workspace. Close omitted.
- Sidecar: holder and presence joins, absence assertions, state copy, cameras and artifact hashes.
- Visual questions: Is preparation visible at management distance without overstating filming? Do world and workspace agree on exact project/company/Set?
- No replay: no Director call, load-in, scheduled take, Wrap, or Stage B action; activity-only change reruns this scene and its focused EditMode test.

### 3. Scenery Load-In

- Authoritative fixture: week `20`; `prod-0016`; task `shooting:prod-0016` blocked; held since week `18`; source center `(1,11)`, destination Stage A center `(18,3)`, Manhattan distance `25`, total `3`, elapsed `2`, remaining `1`, arrived false. Placed scenery is `facility-scenery-shop-2` / `placed-2`; exact resource `facility-scenery-shop-2:0`. Director/cast are Stage-bound and `t-p05-craft-a` is at the scenery source.
- Exact IDs: `prod-0016`, task `shooting:prod-0016`, building `stage-a`, Stage facility `facility-soundstage-07`, Set `set-0`, scenery facility/body/resource above. The fixture also carries placed Stage identity `facility-stage-1` / `placed-1` as authored fixture truth; joins remain exact.
- Phase/blocker: persisted `shooting`; operational `LOAD-IN`; exact scenery-load-in blocker. Load-In is never labeled Rehearsal.
- Machine assertions: exact source/destination and `25 / 3 / 2 / 1` math; no current manual Clear intent; no Shooting effects; vehicle path changes cannot change authority.
- Screenshots: `CAM-MGMT-LOADIN-V1`, `CAM-MEDIUM-LOADIN-V1`, Production workspace. Close optional only for a bounded freight/equipment cue.
- Sidecar: geometry/timing source facts, task/blocker, body/resource IDs, route presentation seed, omitted/requested image reason, exact hashes.
- Visual questions: Can the player see where scenery comes from and goes? Does freight clarify the consequence without pretending to simulate roads? Does workspace timing match world truth?
- No replay: no current Clear, no full performed trip, no Stage allocation or inventory simulation, no unrelated Shooting/Wrap journey; route-only art change reruns this scene, not all six.

### 4. Blocked / Waiting

- Authoritative fixture: week `20`; `prod-0000` owns Stage A/`set-0`; Shooting task is `unassigned`; locked Director `t-p05-director-a`; TypeScript emits the exact Director-required blocker and one revision/digest-bound operation.
- Exact IDs: `prod-0000`, `stage-a`, `facility-soundstage-07`, `set-0`, `t-p05-director-a`, exact emitted operation/intent.
- Phase/blocker: `shooting` / Director dispatch required.
- Machine assertions: Waiting/Decision Required; exact effect, cause, consequence, and Call Director; occupied-low only; hot beacon/equipment off; no generic Fix, substitute person, or second operation.
- Screenshots: shared management, `CAM-MEDIUM-A-V1`, blocker/remedy workspace. Close omitted.
- Sidecar: blocker/operation/intent kind and Production ID, disabled/enabled decision terms, semantic roots, exact artifacts.
- Visual questions: Are who, where, why, and action clear without the memo? Does the Stage read blocked instead of Shooting? Is another project's operation absent?
- No replay: no Load-In transit or scheduled take; memo-hidden completeness is machine/HID companion proof, not another visual scenario.

### 5. Shooting, including the required two-Stage isolation variant

- Authoritative base: week `20`; A `prod-0000` owns Stage A/`set-0`; task is scheduled; A Director and three A cast bodies are at Stage A; A craft remains at exact scenery site; no scheduling action remains.
- Required isolation variant inside this same scenario: B `prod-0001` simultaneously owns Stage B/`set-1` in an unassigned Shooting hold with Director `t-p05-director-b`, exact Director blocker/remedy/intent, B company IDs, and B presence. Applying, replacing, or clearing A must leave B truth byte-identical except lawful shared revision metadata.
- Exact IDs: A `prod-0000` / `stage-a` / `facility-soundstage-07` / `set-0` plus A people; B `prod-0001` / `stage-b` / `facility-soundstage-12` / `set-1` plus B people.
- Phase/blocker: A `shooting` scheduled / none; B `shooting` unassigned hold / Director dispatch required.
- Machine assertions: A unmistakably hot; exact company; decorative bodies have no authoritative IDs and may be zero; B receives no A title, Set, person, effect, logistics, blocker, operation, or intent; no generic percent/hidden quality/craft-at-Stage.
- Screenshots: `CAM-MGMT-AB-V1` two-Stage management; `CAM-MEDIUM-A-V1` and `CAM-MEDIUM-B-V1`; `CAM-CLOSE-A-V1` because Shooting coherence is useful close; A and B workspace views.
- Sidecar: `scenarioId` remains the Shooting scenario; the isolation capture uses a variant ID, not another scenario; both exact tuples, tasks, blockers, people, worksite, semantic roots, cameras, artifacts, and isolation assertions are recorded.
- Visual questions: Can a viewer identify both pictures, locations, states, and companies? Is there any cross-Stage leakage? Is Shooting unmistakable without depending on close animation?
- No replay: two-Stage isolation is not a seventh scenario; changing B-only blocked styling reruns this scenario's affected variant and tests, not unrelated Idle/Load-In/Wrap scenes.

### 6. Wrap

- Authoritative fixture: one transition moves `prod-0000` from current Shooting to Wrap at week `21`; Stage A holder, live Set/resource/task/operation, and authoritative people are released; a compatible current-week Wrap receipt remains; Post is next with no P05 operation.
- Exact IDs: historical Production `prod-0000`; building `stage-a`; Stage facility `facility-soundstage-07`; current holder none; `set-0` historical/not current.
- Phase/blocker: Wrap receipt / none.
- Machine assertions: restrained release event; no former company/beacon/current resource/operation/people; exact receipt; no Post gameplay. A machine companion proves a new current holder outranks history without creating another Oracle scenario.
- Screenshots: matched `CAM-MGMT-AB-V1` immediately before/after, `CAM-MEDIUM-A-V1`, read-only workspace. Close only if a bounded release cue needs proof.
- Sidecar: transition before/after identities, released claims, receipt, Post-boundary assertion, matched camera bytes and artifacts.
- Visual questions: Is closure clear and restrained? Are resources and people visibly cleared? Does any P06 control appear? Would new occupancy visually replace the receipt?
- No replay: no Post editing/release/cinematic journey; a Wrap-cue-only change reruns this scene and holder-precedence tests, not all prior lifecycle actions.

### 9.2 Sidecar floor

Every scene sidecar records: manifest version; run/scenario/variant identity; final source commits/trees; build, executable, process, assembly, generated-contract hashes; Unity/OS/runtime; scene/GUID/dependency hashes; authoritative prefab/addressable identities; fixture ID/version/canonical bytes/hash and builder source hash; proof-runner/tool source and compiled hashes plus exact arguments; CF-09 attestation hash; schema/protocol/projection/save; session/revision/digest/week; all exact Production/project/company/Stage/facility/building/Set/person/task/operation/intent IDs; phase/state/blocker/remedy/copy; complete camera and viewport; requested/omitted screenshot reason; machine results; artifact relative paths/hashes/media/dimensions; reviewer identity, image-opened fact, questions, and dispositions.

No visual claim is valid until an independent reviewer opens the actual image bytes.

## 10. Evidence primitive

Use one bounded artifact record and atomic publication seam. It is not a general proof-platform rewrite.

An artifact record includes relative path, SHA-256, byte count, media type, dimensions when applicable, producing command/tool/source hash, run ID, scenario, and status. Write into a private temporary run directory, fsync/close, validate completeness and hashes, then atomically rename/publish the complete run. Never overwrite a prior failed/stale run. An index may point to the current accepted run but is not evidence itself.

Evidence tooling records failed, unreadable, stale, absent, and accepted artifacts distinctly. It cannot default missing assertions to pass.

## 11. Fresh hostile-review questions

One fresh reviewer receives the full final diffs, exact source pair, test/evidence manifests, actual images, fixture corpus, and current authority documents. No reviewer-shopping.

1. Does Unity infer, advance, or repair phase/task/blocker instead of rendering closed TypeScript truth?
2. Does any path assume `stage-a`, Stage A, Stage 7, first controller, nearest Transform, title, name, role, or array position?
3. Can concurrent or same-title projects leak titles, Sets, people, operations, effects, logistics, blockers, remedies, selection, or workspace context across exact IDs?
4. Can historical Wrap paint over a new current holder or same-tick Stage reuse?
5. Are due-at-call, next-boundary, current-arrived, malformed, missing-provenance, and explicit-grandfather scenery cases exact and settled once?
6. Is a worksite fabricated from phase, history, first facility, or fallback when no current owned site exists?
7. Does any P05 surface consume `progress01` or display an invented generic percentage?
8. Can a wrong body/company be selected by title, display name, role, first body, or proximity?
9. If one person appears in conflicting project rows, is physical placement withheld rather than cloned?
10. Are Production, project, company, Stage facility, world body, Set, person, task, and intent IDs mutually validated?
11. Can a blocked picture show hot Shooting effects, or an active picture show another project's blocker/remedy?
12. At management distance, can an unfamiliar viewer see that a movie is being made, where, phase, people, blocker, and action?
13. Can the workspace contradict the world, survive a stale revision incorrectly, parse display copy, mint an intent, silently no-op, or show the wrong disabled reason?
14. Can a transient poll term latch a Production action; were sibling consumers of any repaired mechanism enumerated?
15. Are screenshots/sidecars stale, partial, unreadable, wrong-camera, wrong-viewport, or bound to a wrong build/process/window/schema/commit?
16. Is the attested binary/process/window actually the one tested, with clean committed trees and exact Unity consumer?
17. Does any P05 route expose Post/Release gameplay, Watch Shoot, cinematic capture/timeline, film outcomes, or other P06 scope?
18. Do Locate, Back, Home, Esc, workspace input, system menu, and memo ownership preserve the accepted context/origin law?
19. Can decorative/high-budget activity masquerade as named staffing, identity, progress, blocker resolution, or outcome; does zero-budget presentation remain truthful?
20. Do tests prove the defect classes under reorder, duplicates, stale state, mutation, invalid joins, real-profile copy, and two-Stage isolation—or only the authored happy fixtures?

An upheld finding returns to its single owning wave. Fix root cause, rerun focused and affected floors, retain failure evidence, and obtain final disposition from the same reviewer. The reviewer does not implement fixes or authorize unrelated maintenance.

## 12. Stop conditions

Stop the affected wave and report exact evidence if any of these occurs:

- authority conflict or missing Owner product ruling;
- unexpected schema/save need with no governing law;
- dirty/wrong repository or commit, symlink/path redirection, unpushed dependency, or concurrent editing collision;
- first-member/loosest union behavior, self-comparison, or handwritten generated DTO;
- P04 Greenlight, exact-ID office, Writer, menu, input, Back, memo, or save/load regression;
- silent enabled action, misleading disabled reason, or control latched by transport poll;
- Stage/project/person identity leakage, current/history inversion, or fabricated worksite;
- product logic placed in Unity presentation or proof tooling;
- P06/Post, global renderer/art, or unrelated maintenance scope;
- runtime evidence not bound to exact binary/PID/window or unexplained HID modifiers;
- identical failed runtime attempt proposed without a new hypothesis;
- technical team asked to invent or announce Owner acceptance.

When a blocker is local and governed, correct it in the smallest owning wave and continue through affected proof. When it requires a new Owner decision, preserve coherent pushed work and stop for the Owner; do not infer the ruling.

## 13. Exact final implementation report format

The final P05 technical report uses these headings in this order and fills each with exact immutable values—never provisional labels:

1. `P05 IMPLEMENTATION STATUS` — technical verdict and explicit Owner-acceptance state.
2. `STARTING AUTHORITY` — P04 pair, post-contract-gate pair, schema/protocol/projection/save, design and Visual Direction commits.
3. `IMPLEMENTATION COMMITS` — each TypeScript/Unity wave commit, final WIP and campaign tips, local/remote equality.
4. `PRODUCT LAW` — lifecycle/worksite/scenery/queue/Writer/Stage/Set/presence/Wrap dispositions and any deliberate deviation.
5. `CONTRACT` — schema delta, generated representation, TS/Unity paths, hashes/blobs, exact-consumer result, attestation.
6. `TESTS` — focused and full TypeScript counts, static audits/builds, Unity compile/EditMode exact counts and artifact hashes.
7. `VISUAL ORACLE` — exactly six scenario dispositions, Shooting isolation variant, image/sidecar hashes and reviewer verdict.
8. `PACKAGED MACHINE AND HID` — exact binary/PID/window, fixture/profile-copy identity, normalized modifier record, journey outcome; clearly separate from visual and Owner proof.
9. `HOSTILE REVIEW` — reviewer identity/context, every finding, correction, rerun, and final verdict.
10. `SCOPE AND COLLISIONS` — changed paths, one-owner compliance, sibling-consumer audits, explicit statement that no P06/global maintenance leaked.
11. `EVIDENCE STATUS` — accepted, failed, stale, unreadable, and absent artifacts kept distinct.
12. `REMOTE / WORKTREE STATUS` — exact refs and clean status in every checkout.
13. `OWNER JOURNEY` — exact build and steps offered to the Owner; status remains pending until the Owner rules.
14. `NEXT ACTION` — Owner playtest/decision, or exact blocker.

The report may say `KEEP CANDIDATE — Owner acceptance pending`. It may say `OWNER ACCEPTED` only by quoting and dating an explicit Owner verdict against the exact build.

## 14. Authorization checklist

Engineering prerequisites are satisfied:

- [x] Owner-accepted P04 exact pair recorded.
- [x] CF-08 and CF-09 complete.
- [x] immutable non-self-referential attestation recorded.
- [x] final readiness and reconnaissance exist.
- [x] starting campaign branches and collision owners are exact.
- [x] current schema/protocol/projection/save and actual Unity consumer hash are exact.
- [x] proof pyramid has five contractual levels with machine/visual/HID/Owner separated.
- [x] Visual Oracle contains exactly six scenarios; two-Stage isolation is inside Shooting.
- [x] Visual Direction rulings and no-global-reskin boundary are reconciled.
- [x] no P06 scope entered and no P05 production code began.

The Owner authorization is deliberately not pre-checked or implied. Until the Owner authorizes, this charter is a ready launch package, not an active implementation order.

## 15. Ready-to-send P05 builder handoff

```text
BEGIN P05A BUILDER HANDOFF — USE ONLY AFTER EXPLICIT OWNER AUTHORIZATION

Implement Project: Studio Package 05A — Production, Soundstages & Shooting.

STARTING AUTHORITY
TypeScript campaign/living-lot-ts: 7811377cea1c1b9ddca2c17c626879504b23ed4e
Unity campaign/living-lot-client: 29aea89a706a7f0961f5a460afc5bdb4d38d8395
P04 accepted product pair: 71521efed5dd113a3911c85410d0729eab13918f / 5076af43fcd6a279f26e15a46a8389689b69db74
Schema: sha256:01f15efc8fc33fd810b051242857385ca23b5e1c775b357db1bfe5a70e907e1e
Protocol / projection / save: 4 / 11 / 15
Contract attestation: docs/engineering/attestations/P05A-STATIC-CONTRACT-GATE-01.json
Visual Direction: 728781dcfdcf32a13d3d3978cdc333b8c9a5e8a7

CREATE AND PUSH BEFORE EDITING
wip/p05a-production-shooting-01-ts from the exact TypeScript campaign tip
wip/p05a-production-shooting-01-client from the exact Unity campaign tip
Use isolated clean worktrees. One editing owner per checkout and collision-prone file. Never edit campaign branches directly.

IMPLEMENT IN ORDER
Entry verification; W0 shared snapshot context; W1 TypeScript scenery/Production truth; W2 closed projection/schema/generated actual Unity consumer; W3 exact-ID N-Stage registry; W4 world activity/presence/visual hierarchy; W5 retained Production workspace; W6 exactly-six Visual Oracle; W7 full regression and one fresh hostile review; W8 fast-forward integration and Owner journey.

NON-NEGOTIABLE PRODUCT LAW
TypeScript owns truth. Exact IDs only. World anchor works without rail priming. No visible enabled action silently no-ops. Disabled copy names the exact reason. READY NOW, READY TO QUEUE, and BLOCKED remain distinct. Writer credit is not assignment, presence, company seat, exclusivity, or fee. Current holder beats Wrap history. Stage B never borrows Stage A. No generic progress percentage. Selection does not move the camera; Locate is explicit and Back restores accepted origin/context. System menu, Save/Load/Quit, input context, and memo fallback remain usable. No transient poll latch. Audit sibling consumers. No P06/Post gameplay or global reskin/HDRP/DOTS/renderer migration.

PROOF LAW
Use synthetic, migration/compatibility, and private Owner-profile-copy fixtures where relevant. Keep TypeScript/static, generated contract, Unity EditMode, runtime machine, visual, HID, and Owner evidence distinct. Bind exact binary/PID/window and record normalized HID modifiers. Retain failed/stale/unreadable/absent evidence distinctly. Never repeat an identical failed simulation without a new hypothesis. Do not demand full packaged/HID replay for a change that cannot affect those layers; rerun every affected layer.

STOP
Stop on an authority conflict, ungoverned product decision, identity leak, self-comparison, handwritten DTO, dirty/wrong repository, collision, weakened test, misleading/silent control, stale evidence, P04 regression, P06 leak, or an identical retry without a new hypothesis. Preserve coherent work and report exact evidence. Never invent Owner acceptance.

DELIVER
Use the exact final report format in section 13. Technical completion ends at KEEP CANDIDATE — Owner acceptance pending. The Owner alone accepts and closes P05.

END P05A BUILDER HANDOFF
```
