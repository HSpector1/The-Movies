# P08–P10 Foundation Recovery 01

Authorization: **OPS-P08P10-FOUNDATION-RECOVERY-01**.

**VERIFICATION IN PROGRESS — G6 BUILD-CHIP ENTRY REPAIR AND SUCCESSOR PROOF PENDING. OWNER ACCEPTANCE PENDING.**

The bounded foundation repairs, affected interaction journeys, exact46-case oracle sweep and candidate launch have evidence on player957ebcc and engine91e760f. Integrated review found that original G6 explicitly requires BUILD-chip entry, whereas Build03 used Administration. The bare-lot capture and four failing layout regressions demonstrate PROJECT obscuring that chip. A narrow chip placement/input-containment repair is in progress; its successor player and required integrated verification are still pending. Preserved957 evidence is not proof of the changed player. The 5c15d1d55aff88b53be862185a1a5176ba276735 report remains the correct historical PARTIAL / BLOCKED checkpoint; its idle-timeout retry launched nothing. This record does not grant Owner acceptance.

## Authority, ownership and preserved lineage

Implementation/runtime ownership was released in TS handoff 1b5eb8f08c81c7d9c639058c3e28b21b9c1f8e84, docs/campaigns/P08-P10-FINAL-VERIFICATION-02-HANDOFF.md. The lead read that handoff, its verification record/review and immutable audit b07a99c6da6dc703d61ddf1f71ae2aadd5c50449 before editing. Both released worktrees were clean and were reused to preserve Unity Library and ignored evidence. Root is the sole runtime/input lead. Assigned owners implemented bounded recovery seams earlier; during this resumed verification root is the sole writer, with disjoint read-only independent reviewers.

| Repository | Owned child branch | Exact parent |
|---|---|---|
| HSpector1/The-Movies | wip/p08-p10-foundation-recovery-01-ts | 1b5eb8f08c81c7d9c639058c3e28b21b9c1f8e84 |
| HSpector1/project-studio-unity-visual-spike | wip/p08-p10-foundation-recovery-01-client | 7e3813adfdf88b25bb3fe5b1f4711108a424a21c |

Unity product/build 574339da31faaef06e116701e54a58440a4e7a20 is an ancestor of the released tools tip and recovery lineage. The earlier roof/world-selection repairs and Studio Menu picking-mode restoration remain present. The additional Stage interior roof/ceiling repairs below are part of this recovery, not retrospectively attributed to the outgoing build.

Campaign refs remain TS2753e18ba8fb5f65b936c22cde9531646fecc6cd and Unityc4c65db464ef9abcf3bdcc088f5c8a47cc9081b6. Main and final-verification refs remain controls. P06/P07 historical Owner acceptance remains intact; P08–P10 Owner acceptance is pending. No onboarding, P11, Wire, Radio, new economy or Builder implementation was introduced.

## Actual compatible runtime pair

| Identity | Exact value |
|---|---|
| Engine source | 91e760f328adcfd62de6ae576dcb959612af09e3 |
| Engine SHA-256 | 419024a8a70ce84c15fbe0d3e1419610c2259f1740992475943f7b8d0eb035f6 |
| Player build source | 957ebcce91b604256b76bfb461c5468ee5f1a010 |
| Final Unity tools | 48ebc80c74208d08c4ca8ccef1442a2c5aebcfc4 |
| Player executable SHA-256 | 00d97e5447820f93113516ea736a81e2b28cca63d7f75c25f1f19633f67f41f3 |
| Studio.Runtime.Data.dll SHA-256 | 000880bde0b2c8e9174da05dd90c0c2eac57d01a57159e68959ed4a8ff591c35 |
| Assembly-CSharp.dll SHA-256 | a4d4b95458862df834965012e72c75cd34ecf37ae0e8ed53e56ecfbb060bb561 |
| Protocol / projection / inner save | **4 / 20 / V18** |
| Schema identity | sha256:d3338cb713385cc23414e6a17293a5900871764f0eeaed19698e17634e74740b |
| Actual consumed generated DTO SHA-256 | 843e18b0c1767de6a6dcc35047ccddb3dab77fcbdd46dbca8555975704092520 |
| Canonical scene SHA-256 | 11d839354a7d55bff097be1d99a66caf05df0f3ae2149e1dec1a74d77b2f2286 |

Unity6000.3.22f1 built the player at 2026-09-08T01:52:08Z; the manifest was generated at 01:52:48Z. Source was clean at the required 933-test EditMode run and build. The manifest's TS checkout identity bb317c782ee50de8bb6414bc98713cd0632d35e8 is the clean documentation/fixture-tool context. Its explicit engineSourceSha names 91e760f, engineRebuilt=false, and the carried source manifest hash is fbe1332094b0104b04938f1fa6f8a65692994842973909015c1656428224d34f. Do not confuse that checkout with a rebuilt engine.

Later Unity commits change proof tools only. Actual engine, executable, both managed assemblies, DTO and scene bytes were independently checked. No artifact was rebuilt for documentation or packaging. Historical dirty=true manifests are retained unchanged.

## Audit dispositions

### AUD-001 — accepted P06 checkpoint compatibility

**Reproduced and repaired.** The accepted P06 receipt and independently frozen source `050b98ee15d83883b209b4e0700a06e064a4eb60` establish projection14 schema `sha256:71529afdcb8e5cf645ab136efb9685256da0039e86d989bfab97b7b2cc5d9a8b`. The successor loader omitted this accepted predecessor. `bridge/runtime-checkpoint.ts` now registers that exact identity through the existing governed migration, also registering the outgoing projection19 boundary for the projection20 change. It does not accept arbitrary identities or rewrite a user's header to bypass validation.

The **inner gameplay save**, **outer runtime checkpoint**, explicit saved slot, current slot and response journal are separate. The existing migration preserves current and explicit saved gameplay independently, preserves a null saved slot, starts the governed new session at revision0, retires incompatible response bytes and persists the migrated checkpoint before exposing authority.

`tests/bridge-p06-checkpoint-recovery.test.ts` uses independently identified accepted predecessor fixtures: the actual Ready fixture and an actual P06 production checkpoint whose current state differs from its explicit Ready saved slot and whose journal has two entries. Fixture provenance includes original raw SHA-256 values. The 11 tests cover both slots, null/non-null saved slot, session/journal reset, meaning through V16→V18, second restart stability and unknown/future rejection. This is not an allowlist compared with its own entries.

On the actual new engine, `packaged-p06-recovery-02/report.json` records **20/20** passing assertions, including byte/mtime-preserving rejection and a stable second restart. `current-boundary-03/report.json` records **8/8** forward/backward compatibility cases with separately preserved old engines. Old engines refuse unsupported newer checkpoints without writing; the new engine migrates registered predecessors and preserves its current format on restart. The earliest matrix attempt failed because the probe expected a different rejection phrase; the engine correctly rejected. That failed proof-tool attempt remains retained.

### AUD-002 — post-expiry hiring and explicit clock recovery

**Reproduced and repaired; final-pair complete runtime journey independently verified.** The legal fixture generator uses ordinary founding, contracting, screenplay, production, waiting and release actions. It reaches Week105 with expired contracts, no Ready screenplay, sufficient earned cash and an active theatrical run. No cash injection, forced screenplay, automatic renewal or modified contract expiry creates the fixture.

- The existing Casting inspector's **FIND TALENT** route now opens a standalone market without a Ready project. The ordinary market publishes eligible professions and uses the existing quote→contract authority. Project-specific casting remains exact-ID bound.
- Nullable Casting draft/quote project association represents standalone hiring. Production/camera-test commands still require their exact Ready project; founding restrictions remain enforced.
- Commissioning prefers an available contracted Writer, then another person the core legally permits to write. It does not invent a mandatory primary-role Writer rule.
- The no-picture commission guidance no longer removes otherwise legal explicit time advancement. Founding/release decisions and intentional pause remain authoritative. The player must choose a clock action.

Bridge tests cover Writer and Actor hiring, one contract/debit, commissioning and explicit receipts/construction progression, alongside founding and exact-project refusals. The retained Ready-project market's Actor-only presentation is inherited and is not presented as universal hiring access.

Actual input on the initial recovery player exposed two additional blockers at the same owning boundary: fractional theatrical cash violated integer quote-display fields, and Unity's semantic validator rejected an explicitly null project on a sign-contract quote. The corrected engine rounds only outgoing Casting display money, consistent with the other quote producers; raw cash, affordability and authoritative debits retain their prior meaning. The Unity parser permits explicit null only for signing; missing/blank IDs and production kinds still fail. Actual before/after response fixtures and full-envelope tests cover both defects, including fractional admitted/queued greenlight quotes. Two pre-fix wire tests fail; all 38 focused protocol tests pass after repair.

Final-pair R15 independently demonstrates Week105→106 explicit advance/pause with expired contracts, no Ready project and active theatre; standalone FIND TALENT; exact t-wri-04/Gene Zaleski 52-week hire; exactly one $135,706 signing debit; normal Development commission of script-0001 using that person; explicit Week107 advance/pause; actual Save→Load→Resume. Complete current and explicit saved gameplay objects agree after Load at revision5/week107. The successful R08 prefix remains historical and is not relabeled as complete.

### AUD-003 — retained Casting market refresh

**Reproduced and repaired, host-path tests pass.** Ordinary `StudioBridgeClient.ApplySnapshot` → `StudioWorkspaceHost.OnSnapshotApplied` now binds current market candidates, rotation week and relevant offer validity as well as project data. It preserves the exact project, roles, budgets, slate and retained workspace context. Candidate removal/offer expiry closes the invalid offer; a pending commit's response remains governed by its original intent. Closing/reopening is not required.

`StudioFoundationRecoveryTests` applies ordinary snapshots through the real client/host path, checks removed/new candidates and rotation date, and compares the retained draft/context. These are host-path automated tests, not claimed OS-input reproduction of market rotation.

### AUD-005 and e7 — actual button liveness and CONFIRM diagnosis

**Reproduced and repaired; actual host/frame/button tests and final-pair material-action input pass.** The host now refreshes actual Casting action gates each frame, so a real arm duration expiring or polling availability changing false→true can re-enable controls without a new revision. Render and dispatch share their reasons and retain `ActionsEnabled`, pending-action, quote and arm guards.

The Profile's fixed contract sheet exposed an adjacent confirmed gate defect: its frame code queried the old scrolling pane for CONFIRM after the button had moved to the fixed band. The frame now refreshes the actual button with the same disabled reason used by dispatch. A blocked activation displays its current reason. Profile CONFIRM has no Casting arm-window mechanic.

The regression harness uses actual host frames and displayed Button callbacks, real elapsed arm time and unchanged-revision polls. It does not force a private timer or claim that direct BindMarket/Commit calls prove wiring. Final-pair R15 additionally records the same SIGN button and quote at unchanged revision: disabled during `ActionsEnabled=false`, re-enabled when availability returns, then real pointer-down and exactly one handler/dispatch.

Optional observation-only action traces record pointer/down/up/click target and rect, focus, enabled state, quote/arm/pending/host gates, handler, dispatch and authoritative response. The contract proof classifies retained attempts; it cannot retry a new gameplay command while a response is uncertain. Contract05 independently closes the complete cancellation/renewal journey and current CONFIRM diagnosis. The two historical dropped CONFIRM clicks remain cause-unknown. The unsupported “sheet moved” explanation is not retained.

| Deferred item | Explicit owner / disposition |
|---|---|
| AUD-004 | Core committed-cancellation integrity; defer to core action/save owner before exposing cancellation. No newly demonstrated serious ordinary-command path. |
| AUD-006/007 | Malformed-import validation; save-validation owner. |
| AUD-008 | Recurring-cost forecast; assigned to P11 W0. No P11 work performed. |
| AUD-009 | Quote-cache recency; bridge quote-cache owner. |
| AUD-010 | Historical proof entry imports; not needed by this recovery, not repaired. |

No broad audit was repeated. P00 numbering is not a gate. Real Builders remains the separately preserved P09-REQ-039 obligation.

## Additional confirmed interaction repairs and diagnoses

The actual Profile entry buttons exposed a retained disabled-state defect: an unchanged-revision poll could leave REVIEW RENEWAL/REVIEW EARLY RELEASE disabled after authority became available. Unity1937e2e704779fe5ebc2a1fbb991968e8519917d refreshes those actual controls from the shared render/dispatch predicates before the contract-sheet frame early return. Three meaningful pre-fix product failures became passing host/frame/button tests; two initial harness errors and the intermediate compiler failure are preserved separately.

Stage02/03 captures demonstrated two ordinary inspection obstructions. The StageA BarrelRoof collider was single-sided for interior-to-camera rays. Unityadd57969e5f28e6b4f50669ab8f47aabeae72f2a gives only that roof collision two-sided coverage. The subsequently exposed opaque Interior Grid Ceiling lacked matching camera collision. The final scene adds its exact BoxCollider and a navigation-build exclusion. No rendered art, camera-range redesign, global physics law or broad collider cleanup was introduced.

Clean final EditMode contains 933 passing tests, including actual inspection-pipeline coverage and two retained bad camera poses as negative controls. Stage05 provides the required runtime range and visual review. Independent comparison preserves the exact 255,490-triangle multiset, all20 selection envelopes and baked NavMesh bytes against both intermediate controls. The triangle multiset hash is f0e4184476407734af3cdbba9a9e88673945a1ddaffa1d215e6097a5f0ac9c03; NavMesh SHA-256 is 8326fa21409bf7d38dc09179ac3ec4b857bc71f51282057769d8968d623b9deb. The dump excludes nine people renderers; this comparison is geometry preservation, not a general camera verdict.

Historical dropped CONFIRM clicks remain cause-unknown. Current Contract03/05 traces join exact target, actual enabled state, focus, handler, dispatch and authoritative response; SIGN evidence is not used as a substitute. Contract03 also explains a separate REVIEW miss: enabled down, then a poll disabled the control before completion. Contract04 shows disabled down, then recovery before up. Both have no quote/action at the missed entry. These are traced disabled-input conditions, not an enabled-at-both-ends no-op or a retained latch.

The Contract driver now stops when a sheet/CANCEL prerequisite fails. An explicitly recorded, at-most-one REVIEW retry is permitted only after the observed disabled polling condition, unchanged exact person/session/revision and proven clear quote/request/post/commit state. Unknown phases, malformed/partial traces, nested quote evidence, enabled unexplained completion and uncertain authority refuse retry. CONFIRM retry/idempotency law is unchanged. The isolated diagnosis floor is15 passing tests; retained trace replays are labeled as replay, not new input.

## Current Ops e1–e7 dispositions

| Exception | Final disposition |
|---|---|
| e1 | Accepted combined placed-building occlusion evidence retained; no redundant placed-occluder scene. Actual Build/world-selection regressions run on the final pair. |
| e2 | Historical EditMode timing limitation retained. Final clean, commit-stamped suite:933/933. |
| e3 | Carry engine-specific floors only for exact unchanged91e760f/419024 bytes and relevant source. Historical docs-dirty disclosure preserved. Final changed-player journeys are separately bound. |
| e4 | Stage05 independently reviewed bounded PASS: full supported orbit/pitch/distance exercise and exact return. Not waived; limitations below remain explicit. |
| e5 | Specifically enumerated hoarding, small-prop, canopy and cylinder authoring residuals deferred. No perfect-selection-geometry claim. |
| e6 | Historical pair-2 evidence retained by independent whole-log review. New runs use corrected guard, isolated negative cases and complete native witness review. |
| e7 | Current correctly targeted enabled CONFIRM path independently traced; historical two clicks remain unresolved. No unsupported “sheet moved” explanation. |

## Final integrated technical gates

Definitions derive from docs/campaigns/P08-P10-FINAL-VERIFICATION-02.md §4.1 and its independent review, with the later Current Ops rulings above.

Evidence paths below are relative to the owned Unity repository unless stated otherwise.

| Gate | Requirement | Final-pair evidence / disposition |
|---|---|---|
| Recovery / AUD-002 | Legal expired-contract/no-project hire, commission, clock, Save/Load | PASS: Foundation-Recovery-04-HID/hid-20260908T021520Z (R15), independently reviewed. |
| G1 | Visible person body → inspector → exact Profile | PASS: People04 exact Miriam/t-cra-04. |
| G2 | Drawn-hidden person point selects opaque facade, no person | PASS: G2-only retake hid-20260908T023408Z; timing caveat below. |
| G3 | Roster filter/selection/Profile/Back | PASS: People04 Craft filter and exact retained person. |
| G4 | Locate exact body, suspend, settle, retained return | PASS: People04; reviewed motion0.224mm/0° over1.5s. |
| G5 | People Save/Load/Menu/Resume | PASS: People04; specified navigation/Save V18/week/count evidence, not general full-save integrity. |
| G6 | Bare-lot BUILD chip → preview → one exact site/debit | OPEN: Build03 proves Administration entry and downstream placement; original chip entry remains pending the narrow repair and successor runtime proof. |
| G7 | Site before Save/after Load, Administration selectable | PASS: Build03, exact placed-1 and post-Load Administration/pan controls. |
| G8 | Open/cancel quote, one renewal, Save/Load, E7 | PASS: Contract05 hid-20260908T025330Z, independently reviewed; no retry needed. |
| G9 | Exact46 oracle rows, P10 26 including private2, P09 12, P08 8 | PASS: 46 cases / 115 captures / 669 recorded assertions, complete bindings and clean window; separate qualified visual review below. |
| G10 | Roof-affected Stage range, useful framing, return | PASS: Stage05, separate independent visual-review receipt. |
| G11 | Authored/placed roof selection | Clean automated floors and final G2; final46 sweep machine checks PASS with separately recorded visual limits. |
| G12 | Menu picking-mode restoration | Clean automated floors and final Build03 post-Load selection/control PASS. |
| G13 | TS/bridge/compatibility/private continuity floors | Non-input PASS; both private-copy player cases independently verified and inspected. |

People04 is Evidence/Foundation-Recovery-People/hid-20260908T021658Z, and its overall FAILED1 remains unchanged: no fully qualified G2 click within300s. Its reviewed G1/G3–G5 components compose with the separate G2-only COMPLETE0 retake on byte-identical runtime manifests/fixture. The retake sent exactly one facade click selecting post. Its reported84.3ms map age is at JS qualification,119ms before native down; reported coordinate281,214 rounds actual280,214. Bracketing drawn visibility and the broad Post facade support G2; exact physical-down freshness is not claimed.

Build03 is Evidence/Foundation-Recovery-Build/hid-20260908T023524Z. The actual bare-lot route commits one $1,500,000 construction debit, cash20,000,000→18,500,000, exact placed-1 at gate-court-west origin11,14, completionWeek14. Full current/saved objects agree after Save/Load. Two pre-Save aims hit Administration before ordinary orbiting and the site hit. No BUILD-chip visibility/activation is claimed. Null summary cash/nudge fields are superseded by detailed steps and authoritative journal evidence, not silently filled.

Stage05 is Evidence/Foundation-Recovery-Stage-Range/hid-20260908T015822Z. Eleven captures cover pitch−8→42, distance9→30, full360° yaw, recovered interior and Back. Management return delta is0m/0°. Raw visualReview.pending is preserved; independent-visual-review.json supplies the separate review. The set/floor remains recognizable and movement/return recover. High180 is partly dominated by the authored Apartment Ceiling Edge; far/mid framing retains overhead obstruction. This is a bounded1440×900 range/usefulness/no-demonstrated-trap PASS, not ideal composition at every angle or an untested viewport guarantee.

## Oracle visual and proof limits

Three disjoint independent reviewers inspected all115 actual captures: P10 public24cases/64images, P09 12/26, P08 8/19 and private2/6. They independently checked exact bindings and appropriate case assertions; the whole46-case window has3,708 complete records,46 exact admitted player identities/ACKs, one closing bookkeeping null and no physical, unknown, foreign or actionable player events. The gate is the defined46-case compatible-pair sweep, not a certification that every informal VisualQuestion was captured or every control is unobstructed. Original sidecars' visualReviewStatus.pending remains untouched; independent-oracle-review.json supplies the separate review.

- At1280×800, Company HUD covers the entire OPEN CASTING button in the public hiring-entrance capture, while FIND TALENT is partly exposed. Clock/header overlap is also visible. This is an image-demonstrated small-display layout issue reported for Current Ops/presentation-owner triage; a blocked FIND TALENT route or input failure is not demonstrated. The complete recovery journey is proved at1440×900. No new waiver or broad HUD repair is inferred.
- P10 captures show Profile before scrolling to career links or after returning from Result/cancelling the release sheet. Release consequences, career-link and Result-screen visual legibility are not established by those pictures. The shortage return capture likewise is not an image of the filtered Roster. Programmatic navigation assertions remain separate.
- P09 Administration roofs obscure some footprint markers and the restored site frame. Distinct construction phases and due-week world labels are not established; dueWeek14 appears in workflow text. Reconnect/SaveLoad-named oracles boot separate fixture views; Build03 supplies the actual interaction/persistence proof.
- P08 twin rows have identical title and release-week labels. Two runner assertions check non-null labels or target-row existence/shared title while using stronger distinction/exact-ID wording. Their wording overclaims the assertion. It is retained as a proof-quality limitation, not accepted as exact-result-ID evidence.

These limitations are not hidden by successful shell exits and do not prove new money, save or ordinary progression failures. Follow-up should target the small-display entrance/header composition and the specific missing/weak oracle observations; no broad audit or redesign is proposed.

## Cumulative floors and evidence integrity

Scratch evidence root: /tmp/studio-foundation-recovery-01.hVpIA1/.

| Check | Evidence / actual result |
|---|---|
| TS Vitest | final-ts-vitest-03.log:375 files,5026 passed,5 unchanged conditional audio skips; clean91e760f. |
| Typechecks / contracts / fixtures | final-typecheck-02.log, final-typecheck-bridge-02.log, final-contract-check-02.log, final-contract-fixtures-check-02.log:PASS. |
| Actual Unity DTO consumer | contract-consumer-verification-02.json; consumed DTO bytes unchanged and rehashed on final pair. |
| Wire/parser | Before33/35, two intended failures; after38/38. Runtime.Data.dll exact bytes checked. |
| Packaged P06 migration | packaged-p06-recovery-02/report.json:20/20. |
| Current/older boundaries | current-boundary-03/report.json:8/8. |
| Private Owner-copy engine continuity | owner-copy-engine-recovery-02.log:11/11 on419024; only sanitized receipt published. |
| Final Unity EditMode | unity-final-editmode-07.xml/.log:933/933, zero skips, clean957ebcc,01:51:04–01:51:15Z. |
| Final player build | unity-recovery-player-build-05.log; ceiling-rebuild-source-01.json; ceiling-rebuild-binding-01.json. |
| Input/window guard isolated negatives |171 cases retained after tightened focus validation; isolated replay is not physical-input proof. |
| Stage driver pure logic |13 tests, separate from runtime/capture review. |
| Strict oracle verifier |11 isolated negative cases; actual46 sweep verdict separately required. |
| Renewal-entry/CONFIRM diagnosis | contract-entry-inert-04.log:15/15; earlier failing tooling test retained. |
| Geometry/navigation preservation | final-geometry-nav-independent-review.json; exact independently compared triangles/envelopes/NavMesh. |

The guard retains the60-second idle threshold, unlocked-session checks, exact posting/admitted PID attribution, held-input ledger and continuous listen-only witness. Physical/unrecognized input remains sticky foreign even next to injection or activation. Exact inert helper companions—including narrowly authenticated leading and one bound-player-interposed cases—supply neither acknowledgement nor held-input authority. Missing/malformed witness evidence fails closed. Unknown-event suspension is not evidence that the Owner interfered.

The oracle window has its own60-second unlocked admission, bounded3-minute preflight, held-input refusal, one witness across cases/gaps, exact pre-exec PID handshake and controlled process-group shutdown on suspension. No input journey or heavy build runs alongside it. Every expected row, individual exit, report, capture and pair binding must pass the strict verifier; shell exit0 alone is insufficient.

## Retained attempts and limits

Every original raw report/log remains unchanged. Successful later evidence is separately bound; no old-engine/player run is renamed as final-pair proof. Paths below abbreviate the existing Evidence/Foundation-Recovery-* parents; launcher logs are retained in the scratch root.

| Attempt | Actual outcome / narrow explanation |
|---|---|
| R01–R07 | Initial recovery pair. R01/R02 stop on helper companions before gameplay; R03 clock prefix then companion suspension; R04 market-open driver visibility predicate failure; R05 missing activation acknowledgement; R06 missing mouse-up acknowledgement with separate cleanup up; R07 actual standalone quote wire/semantic defect, subsequently repaired. |
| R08 | Player3824957; reviewed hire/commission/SIGN prefix, then leading-helper-null guard suspension. Not complete recovery. |
| R09 | 5c15 checkpoint: preflight exit9 after1,800s without60s idle; no runtime/input launched. Retrospective preflight receipt is labeled as such. |
| R10 | Player3824957; leading-helper-null suspension, preserved. |
| R11 | hid-20260907T232933Z: complete recovery PASS on player3824957, historical after later player changes. |
| R12 | hid-20260908T004206Z: FAILED3 on e7d1c50; hire valid, commission click did not complete. Exact event-time cause remains unresolved; no fresh-command retry. |
| R13 | hid-20260908T005008Z: FAILED1 due missing pane sample; later complete gameplay/SaveLoad components retained. Optional passive observer failed to attach; empty observer file supplies no evidence. |
| R14 | hid-20260908T021224Z: final-pair FAILED3; hire/commission/Save succeeded, Load target lookup missing and no Load click. Bounded coherent lookup corrected in proof tool. |
| R15 | hid-20260908T021520Z: final-pair COMPLETE0, full recovery/SaveLoad independently reviewed. |
| People01 | hid-20260907T233130Z: player3824957 FAILED2 for Load lookup. Historical G2 and navigation components retained. |
| People02 | hid-20260907T234124Z: root ABORT143 after body aim overlapped PROJECT HUD and committed fixture-only Annex780,000. No final PASS; abort receipt and actual effects retained. Driver HUD exclusion corrected. |
| People03 | hid-20260908T000051Z: player3824957 FAILED1, no qualified facade click; other navigation/SaveLoad components retained. |
| People04 | hid-20260908T021658Z: final-pair FAILED1, no qualified G2 click in300s. Independently accepted G1/G3–G5 components. |
| People G2 retake | hid-20260908T023408Z: final-pair G2-only COMPLETE0; separate composite review, explicit timing/rounding limits. |
| Build01 | hid-20260908T000851Z: SUSPENDED3 on structural helper-null attribution; initial Admin mis-aim and downstream failures retained. |
| Build02 | hid-20260908T001900Z: complete historical player3824957 PASS; not relabeled as final build. |
| Build03 | hid-20260908T023524Z: final-pair COMPLETE0; two pre-Save Admin hits explicitly recorded before site selection. |
| Contract01 | hid-20260908T002100Z: SUSPENDED3; confirmed Profile entry latch, then strict companion suspension. Apparent CANCEL neutrality without a sheet is invalid. |
| Contract02 | hid-20260908T004043Z: historical e7d1c50 complete PASS and traced CONFIRM; preserved actual pair. |
| Contract03 | hid-20260908T023753Z: final-pair FAILED5. First REVIEW disabled by polling before click completion; missing-sheet cascade and invalid CANCEL-neutral row. Later one renewal/SaveLoad/E7 components independently supported. |
| Contract04 | hid-20260908T024952Z: final-pair FAILED2; REVIEW down occurred while disabled, recovered by up. Strict diagnosis stopped without quote, CANCEL or CONFIRM. |
| Contract05 | hid-20260908T025330Z: final-pair COMPLETE0; real cancellation, one renewal/debit, SaveLoad and exact CONFIRM trace. No diagnostic retry used. |
| Stage01 | hid-20260908T004635Z: missing/stale map after entry; two captures, FAILED2. Bounded fresh-map lookup corrected. |
| Stage02 | hid-20260908T005222Z: FAILED2 at driver time budget; high views independently exposed the black outer roof. |
| Stage03 | hid-20260908T011000Z: mechanics COMPLETE0 on add5796, but independent visual FAIL for opaque grid ceiling. Never accepted from flags alone. |
| Stage04 | hid-20260908T015359Z: final-pair FAILED1/exit2; exact pre-click binding found Code frontmost, no Stage click sent. Earlier framing-key recipient unproved, no foreign input and no Owner-interference inference. Focus validation tightened. |
| Stage05 | hid-20260908T015822Z: final-pair mechanics COMPLETE0 plus separate bounded visual PASS over11 actual captures. |

Tool corrections preserve strict input ownership and product dispatch guards. Inert tests, native helper tests, programmatic oracles, actual HID and visual inspection remain separate evidence layers. The known façade publication-age caveat and old uncertain clicks are not hidden by later success.

## Independent integrated review

Integrated review of957 found original G6 chip entry unproven; all other component outcomes retain their stated limits. New player verification and final integrated review are pending.

## Candidate, publication and protected state

The new candidate is /Users/bruce/Desktop/P08-P10-Foundation-Recovery-Candidate-91e760f-957ebcc/. It contains the tested player/engine, nine public disposable fixture entry points, exact build manifest and selected non-private proof. Private Owner-copy saves, screenshots, tokens and sensitive logs are excluded. Packaging does not rebuild runtime artifacts.

The actual candidate launcher was verified with recovery through the independently reviewed single-player window. It created a new private disposable runtime, received a lot snapshot and rendered52 advancing map/frame samples over8,057ms. Root inspected the actual owned-window capture: READY, pausedWeek105, active theatre and no-contracted-writer guidance. Complete current gameplay meaning equals the source fixture. The monitor then deliberately stopped only its admitted player; actual launcher exit143 is recorded as controlled termination, followed by drained engine/player group and clean witness finalization. The launcher now defaults to the proved1440×900 window. Launch01 remains preserved; Launch02 verifies that final default with only observation/owned-PID diagnostic options. This does not prove all entry modes or continuous connection under every condition.

Verified command:

    '/Users/bruce/Desktop/P08-P10-Foundation-Recovery-Candidate-91e760f-957ebcc/playtest.sh' recovery

Launcher SHA-256: 79557a25ff680b2fc0f4e2e526fbf27c8ba905286abdf9b80637f47b542ffeb9. Actual verification source SHA-256: 7ec2082ef20b67927fb2377863d68edf69c9a9a52e278c724760abbf92c7c0e8. The latter is preserved as an audit artifact alongside its sanitized receipt and capture. It retains exact-PID pre-exec admission,60s idle/unlocked law and whole-window witness; normal Owner invocation sets neither diagnostic option.

Protected controls remain:

- P08-P10-Combined-Candidate-f536308-574339d (playerf678cf… / engine189326…).
- P08-P10-Foundation-Recovery-Candidate-feb5e58-286bb9e (initial wire-failure pair).
- P08-P10-Foundation-Recovery-Candidate-91e760f-3824957 (published5c15 PARTIAL checkpoint; unchanged).
- P08-P10-Foundation-Recovery-Control-91e760f-e7d1c50 and Control-91e760f-add5796 (intermediate tested player controls).

The missing historical pair-1 executable3558ddd4… remains **UNAVAILABLE**. No replacement original evidence was manufactured. The real Owner profile remains in its original location; authorized testing uses protected baseline copies. The final control recheck reports2,218/2,218 original-control and350/350 historical-PARTIAL inventory entries without mismatch; the original Owner profile hash remains d949003e1874406170bfd3e7c8f4c6dc2dc92d24bb125376c435cdf21eec8b4b. Protected remote refs were reread without movement. A final post-publication process/inventory check follows.

Publication changes documentation/proof tools only after the clean build; PUBLICATION.json records the final report commit/blob/hash after remote-byte verification. INVENTORY.sha256 covers every candidate file except itself and is verified after the report/publication copy.

## Owner playtest and triage

After technical completion, run the verified candidate launcher with recovery: explicitly advance/pause; open Casting/FIND TALENT; review and sign one affordable hire; commission a screenplay; advance/pause; Save/Load and confirm both person and screenplay remain. Then use endowed/contracts/barelot entry points to inspect a person, Profile/Roster/Locate/Back, orbit Stage and return, review/cancel/commit one contract, and build/select/save/load one site through Administration.

These entries use disposable copies; closing the player ends its owned engine. Current Ops retains triage of deferred audit/e5 work. Owner acceptance remains pending.
