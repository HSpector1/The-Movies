# P00–P07 Accepted Foundation Audit 01

Authorization: **OPS-P00P07-FOUNDATION-AUDIT-01**. Independent read-only review, 2026-09-07.

## Executive verdict

The bounded source audit is complete; overall coverage is **PARTIAL** because P00's package identity could not be resolved and private runtime, visual, real-input and binary evidence were outside this review. Two new high-impact paths were reproduced in isolated memory: a valid P06 checkpoint cannot open in accepted P07, and a legal expired-staffing trajectory leaves the client unable to commission, hire or advance time. Both were immediately reported to Current Ops. Other findings below distinguish recoverable client defects, a core-only cancellation defect, known import/economy defects, and a broken proof entry point.

**P06/P07 Owner acceptance remains recorded. This is neither a release verdict nor certification that the foundation is bug-free.** Current Ops owns triage; low-priority coverage gaps do not become gates on the active candidate. Production code changed: **NONE**. Active runtime work interrupted: **NO**. Campaign/main/implementation refs moved by this audit: **NO**.

## Exact authority and lineage

| Identity | Inspected value / evidence |
|---|---|
| Accepted TypeScript repository | `HSpector1/The-Movies` |
| Frozen documentation-inclusive TS snapshot | **`2753e18ba8fb5f65b936c22cde9531646fecc6cd`** |
| Accepted Unity repository | `HSpector1/project-studio-unity-visual-spike` |
| Frozen Unity source | **`c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6`** |
| Accepted protocol / projection / save | **4 / 15 / V16** |
| Last TS runtime/contract change | `da848225516fe3ced9a421548d0f5e7cbc8b5b88` |
| Advertised accepted branches at audit entry | `campaign/living-lot-ts` = frozen TS; `campaign/living-lot-client` = frozen Unity; no difference |
| Historical main | `c902a704eb948cc576083d0973c8c23e59937dc1`; not used as the integrated audit target |
| Current generated DTO Git blob | `84d9c9a814ad4cc92d8a882205baa2f484ff8527` |
| Actual TS/Unity DTO bytes | Both 342,078 bytes; SHA-256 `045fccce1ae318cbd338779fd52bd805302c1b8ad5ed033cb24d08eab590047f` |
| Actual TS/Unity union fixture bytes | Both 44,592 bytes; SHA-256 `be4b1dd1da2e7dc28906b9bad1ab0fa73e32d4dbe69eef344d9aeaf0a697bdb6` |
| Schema identity | `sha256:ddce1c399ac4ff58327b296a0600428ac3f3346b84f3639e66e48e53a65fbe99` |

The [acceptance receipt](https://github.com/HSpector1/The-Movies/blob/2753e18ba8fb5f65b936c22cde9531646fecc6cd/docs/campaigns/P07-OWNER-ACCEPTANCE-RECEIPT.md#L18-L55) distinguishes runtime, test/docs, build-manifest, packaging and technical-seal identities. Git history independently resolves the receipt's introducing commit to `2753e18…`. `git diff --name-status da848225… 2753e18…` contains only documentation, tests, proof scripts and fixtures; `git diff --quiet da848225… 2753e18… -- src bridge generated ui/src` succeeds. This establishes runtime-source equality, not a fresh verification of private executable bytes. The receipt's reported build hashes and past passing counts remain **reported historical evidence**, not rerun results.

The six requested documents all resolved and were read: `CURRENT-BEST.md`, the P07 receipt, final P07→P08 handoff, and P04/P06/P07 lessons. The [final handoff](https://github.com/HSpector1/The-Movies/blob/2753e18ba8fb5f65b936c22cde9531646fecc6cd/docs/engineering/P07-TO-P08-FINAL-AUTHORITY-HANDOFF.md) controls the accepted result/identity/financial/history interpretation. The provisional P07 charter is read with later execution decisions and Owner closeout, not as an outstanding acceptance veto.

Prior static audit retrieved separately for deduplication: [CODEX-CURRENT-FORWARD-CODEBASE-STATIC-AUDIT-01.md at `ee522834bd134280469eeb3878765e9f575018cf`](https://github.com/HSpector1/The-Movies/blob/ee522834bd134280469eeb3878765e9f575018cf/docs/engineering/CODEX-CURRENT-FORWARD-CODEBASE-STATIC-AUDIT-01.md). It is not in the accepted checkout; its exact referenced commit was available. No old source pair was substituted for the accepted game.

## Coverage map

Package numbering was derived from documents. **P00 could not be mapped to a named accepted package** after searching accepted tracked documentation and cited foundational package references. No claim that P00 means saves, engine, or another invented category is made. Those foundation systems were nevertheless inspected at the integrated accepted source pair. Package 01 below is the World-First Interaction Blueprint, distinct from the later document also named Visual Direction Package 01.

| Documented system/package | Authoritative owner → consumers | Existing tests/guards inspected | Coverage and known risks |
|---|---|---|---|
| P00 label unresolved; inherited foundation | Core save/migrations, employment, identity, weekly batch → bridge and client | Save V1–V16 tests, checkpoint/replay/store tests, permanent-ID and snapshot-isolation tests | Focused consequential source review; no numbered-package completeness claim |
| P01 World-First Interaction Blueprint / CP9 founding | Core founding minimums and opaque intents → Gate/Admin/client | `bridge-founding`, minimum-founding fixtures, existing world-entry guards | Minimum staffing and later continuation traced; no fresh pixel/input proof. Blueprint at `e3f51086f070fa06447be11a17e0673f2cbb11ac`, `docs/design/CODEX-WORLD-FIRST-INTERACTION-BLUEPRINT-01.md`; accepted CP9 adoption in `LIVING-LOT.md:870–1093` |
| P02 World Selection, Navigation and Context Interaction / CP10A spine | Exact IDs, selection/navigation owners → cards/workspaces | Host/navigation/source/reflection guards and ordinary refresh paths | Focus/select/activation and Back/Locate sampled. Package at `a4795ff72a9a790e1cbda06deefd4b76a91df2b0`, `docs/design/CODEX-WORLD-INTERACTION-PACKAGE-02.md`; adoption at `LIVING-LOT.md:1095–1819` |
| P03A Development from the Lot | `scriptDevelopment`, `scriptReadModel`, `bridge/development`, quote/session → Development UI | `bridge-development`, script save/decision tests | Writer availability, quote expiry and exact project selection; accepted package section starts `LIVING-LOT.md:1825` |
| P04 Casting / Camera Tests / Package / Greenlight | `castingPackageReadModel`, `bridge/casting`, actions → Casting workspace/host | Writer-credit/greenlight law, bridge casting, screen-test/host tests | Optional tests, distinct acting seats, exact IDs, transient gating; prior fixes deduplicated against lessons |
| P05 Production/Shooting, P05A.1 queueing, P05A.3 roster liveness | Core queue/admission/occupancy/operations → production board and Unity | Minimum-founding, queue/admission, screenplay/seat and resource guards | Ordinary staffing, debit timing, reservations, Wrap, cancellation; charter at `b1d506df9ff9c5981f5acc6990daf8a056739901`, accepted entry/evidence/lessons in snapshot |
| P06 Post and deliberate release; P06B/C/D convergence | `releaseAuthority`, weekly batch, Post resources → release workspace/rail | Release-authority and same-subject agreement tests, economy audit | Safe hold, no-time commitment, next-week exact release, capacity; final charter/recon and known register read |
| P07 Reception / Release Outcomes / Box-Office Result Truth | `receptionVerdict`, ledger, adapter `filmResultView` → actual DTO/result workspace | W6 continuity, result channel and generated-contract guards | Critics/Audience/Business separation, projected/paid/final, history and retained results; private binaries not checked |

Foundational system map: save/version validators → UI import and durable current/saved slots → save/migration/checkpoint tests → predecessor schema and malformed collection risks; session/revision/journal → Unity transport → retry/reconnect guards → quote recency and refusal display risks; core actions/queue/resource law → projections/workspaces → legal-player and slot tests → client entry/refresh gaps; ledger/weekly settlement → financial/result selectors → reconciliation tests → known missing facility Opex and malformed duplicate streams.

## Method and access limitations

One lead and three disjoint read-only reviewers used isolated sparse Git repositories under `/tmp/studio-p00p07-audit-01.sMJk5i/`. Source on disk stayed at the accepted pair. Successor objects were fetched without checkout, solely for the final changed-file reconciliation. No active implementation checkout, index, dependencies, generated output, private profile, OS input/focus/settings, keep-awake process, or runtime queue was accessed or changed. No Unity, packaged player, bridge, proof server, or supervisor was launched. No dependencies were installed and no heavy suite/build was run.

Inspected pure TypeScript core, session and checkpoint functions were invoked in memory using installed Node 22.23.0 and an audit-only source loader. Scripts were written outside product source. These are **minimal audit reproductions**, not added product tests or full game launches. A Node 26 transform attempt failed before product logic. The portable appendix loader initially needed canonicalization of the Mac /tmp symlink; it was corrected and all three appendix scripts were rechecked. The successful Node 22 outputs are the evidence. Git/source/path checks and standard-library file hashes were also used.

Private Unity source access succeeded. Unity source coverage is available; compiled/runtime/visual coverage remains partial by authorization. GitHub clones do not provide private saves, ignored evidence or accepted player bytes. No claim is made to have inspected those. No separately attached historical P08–P10 reports were available as attachments here; the one exact committed successor handoff described below was used for bounded reconciliation, without adopting old review verdicts as current status.

## Prioritized findings

Severity uses consequence and actual reachability: P1 high; P2 moderate; P3 low. A malformed-import-only trigger and a core-only action are identified explicitly. “Confirmed reproduction” refers to the tested function boundary, not desktop input.

| ID | Finding | Severity | Confidence | Accepted-base status |
|---|---|---|---|---|
| P00P07-AUD-001 | Valid P06 durable checkpoint refused by accepted P07 | P1 | Confirmed isolated reproduction | NEW |
| P00P07-AUD-002 | Expired staffing after last release leaves no client recovery/time route | P1 | Confirmed core/bridge reproduction; client source trace | NEW |
| P00P07-AUD-003 | Retained Casting omits ordinary market refresh | P2 | Source-demonstrated | NEW |
| P00P07-AUD-004 | Core cancellation after release commitment leaves an unsavable orphan | P2 | Confirmed isolated reproduction; no player control | NEW |
| P00P07-AUD-005 | Casting buttons retain disabled state after transient gates clear | P2 | Source-demonstrated | KNOWN OPEN |
| P00P07-AUD-006 | Duplicate imported theatrical run receives double settlement | P2 | Confirmed malformed-import reproduction | KNOWN OPEN: CF-03 |
| P00P07-AUD-007 | Duplicate imported employment row increases payroll | P2 | Confirmed malformed-import reproduction | KNOWN OPEN: CF-04 |
| P00P07-AUD-008 | Burn/runway/net-cash selectors omit charged facility Opex | P2 | Confirmed isolated reproduction | KNOWN OPEN: C2-E0 G-B |
| P00P07-AUD-009 | Freshly requoted oldest intent is evicted at cache capacity | P3 | Confirmed isolated reproduction | KNOWN OPEN: CF-20 |
| P00P07-AUD-010 | Committed P07 profile-proof entry point imports nonexistent paths | P3 | Source/path-demonstrated | NEW proof-artifact defect |

## P00P07-AUD-001 — P07 cannot open a valid durable P06 profile

**ID:** P00P07-AUD-001

**System / package ownership:** Durable checkpoint schema migration at the P07 projection-14→15 contract mint; inherited P04 existing-profile compatibility law. Gameplay save remains V16.

**Exact repository / commit:** `HSpector1/The-Movies` / `2753e18ba8fb5f65b936c22cde9531646fecc6cd`.

**File / symbol / line range:** `bridge/runtime-checkpoint.ts:53–104` (`SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS`, especially final row at 100–104); `:1155–1196` (`loadBridgeRuntimeCheckpoint`); `:960–977` (`hydrateBridgeRuntimeCheckpoint` schema gate); `bridge/runtime/runtime-coordinator.ts:269–308` (startup load and fatal path). Test gap: `tests/bridge-runtime-checkpoint.test.ts:909–948` pins exactly thirteen identities through projection13. The fixture is `ui/e2e/p06-visual-oracle-v1/s4-release-ready.checkpoint.json:1`.

**Expected behavior:** A valid shipped prior-protocol-4 profile must migrate via the governed prior-schema path, preserving current and explicit save slots, issuing a new logical session and discarding incompatible old response bytes. `docs/engineering/P04-IMPLEMENTATION-AND-OWNER-PLAYTEST-LESSONS-LEARNED.md:100–116` records this exact prior-profile startup failure and its enumerated-map remedy; `bridge/runtime-checkpoint.ts:85–104` states the outgoing-schema append law. `docs/engineering/CODEX-P07A-EXECUTION-HANDOFF.md:65–86` records P07's projection14→15 bump. The P07 receipt identifies accepted P06 schema `sha256:71529afdcb8e5cf645ab136efb9685256da0039e86d989bfab97b7b2cc5d9a8b` and accepted P07 schema `sha256:ddce1c399ac4ff58327b296a0600428ac3f3346b84f3639e66e48e53a65fbe99`.

**Observed / traceable behavior:** P07's allowlist ends at projection13 and contains no P06 projection14 identity. `loadBridgeRuntimeCheckpoint` therefore falls into the current-schema decoder for the valid P06 checkpoint. That decoder throws `checkpoint.schemaId: does not match the running TypeScript bridge schema`. The coordinator reports fatal and closes storage before writing or opening a session.

**Trigger / preconditions:** Open an existing, valid P06 durable runtime profile using accepted P07. This is a legitimate shipped predecessor state. The reproduction uses the actual checked-in P06 release-ready checkpoint unchanged; its journal is empty and current slot contains a valid V16 week-23 game. No private Owner profile was inspected or inferred from the fixture.

**Player impact:** The existing studio cannot start through the normal durable-profile startup path. Both current and explicitly saved authority are inaccessible through that startup. The observed failure does **not** overwrite the checkpoint or destroy the embedded gameplay save; no loss claim is made.

**Evidence:** Isolated direct call on the unchanged accepted-repository fixture fails with the exact schema error. `importSave(fixture.currentSaveJson)` independently succeeds. Canonical JSON bytes were checked. As a diagnostic control only, the same empty-journal fixture with only its outer schema header changed in memory to P07's current header is accepted, demonstrating the remaining checkpoint content passes validation. An in-memory coordinator/store probe observed `{read:1,write:0,close:1,fatal:1}`. Actual function execution is reproduced; packaged startup/visual behavior is source-traced, not runtime-replayed.

The complete checkpoint/coordinator probe is `save-probe.mjs` in the reproduction appendix.

**Severity:** P1 / high: an ordinary upgrade from the immediate accepted predecessor prevents the existing player studio from starting; fail-closed storage avoids overwrite.

**Confidence:** **CONFIRMED REPRODUCTION** at pure checkpoint-loader/coordinator boundaries; full packaged startup consequence **SOURCE-DEMONSTRATED**.

**Known-finding status:** **NEW** P07 compatibility omission, a recurrence of the P04 failure class. The historical P04 missing-old-schema instance itself was already fixed. No accepted P07 register read identifies this missing projection14 hash.

**Smallest likely owning seam:** P07 schema-mint transaction's outgoing-identity registration and its completeness guard. Recommendation only: preserve the existing governed migration; do not rewrite profiles or treat the gameplay V16 version as the runtime compatibility version.

**Required regression test:** Load a frozen accepted P06 checkpoint under P07 through `createBridgeRuntimeCoordinator` with an in-memory store. Cover null/non-null explicit saved slots and opaque prior response journal. Assert migration succeeds, current and saved V16 bytes remain unchanged, old journal discarded exactly once, new session/revision0, current P07 checkpoint reopens without repeated migration. Assert the outgoing accepted schema identity is derived/independently pinned rather than only comparing the map with its stale existing list.

**Current-stack status:** **STILL PRESENT AT EXACT COMMIT** `a2baa1d9b3ffb2666732dba55823e09cc76c7352`, source only; see the bounded reconciliation below. No successor execution or runtime-verified fix claimed.

## P00P07-AUD-002 — Exhausted contracts and no Ready screenplay leave a funded studio with no player recovery or advancing week

**ID:** P00P07-AUD-002

**System / package ownership:** Employment/commissioning/hiring integration inherited by P03 Development and P04/P05 Casting; P06 hold/release exposes a legal late-game trigger. Owning seam is bridge available-intent policy and Unity's project-bound post-founding market. This is one combined liveness finding, not separate findings for the missing clock, inaccessible hire, and trapped theatrical receipts.

**Exact repository / commit:** TS `HSpector1/The-Movies@2753e18ba8fb5f65b936c22cde9531646fecc6cd`; Unity `HSpector1/project-studio-unity-visual-spike@c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6`.

**File / symbol / line range:**

- `src/core/tick.ts:921–935`: expiry removes ended contracts and appends free agents.
- `src/core/scriptReadModel.ts:643–661,719–725`: commission writers require active contract; zero produces `no-writers`.
- `src/core/actions.ts:2003–2025`: `requireCommissionableWriter` enforces that contract rule.
- `src/core/firstFilmJourney.ts:475–548`: `noPictureView` returns `next.kind='commission'` even when the commission is blocked.
- `bridge/session.ts:454–506`: founding signs the actual 104-week terms and has no operating fallback; `:666–714` emits a commission only with a legal writer; `:897–899` returns before an advance-week intent for commission guidance; `:947–973` explicitly permits manual holding at Release Ready.
- `src/core/castingPackageReadModel.ts:688–697`: package board contains only current Ready packages.
- Unity `Assets/Studio/Runtime/Presentation/UI/StudioCastingWorkspace.cs:4970–4979`: hiring-market entry requires nonnull context/project plus shortage decision; `:1771–1773` exposes the market only within that workspace; `:1090–1120` closes its layers when project is missing.
- Unity `Assets/Studio/Runtime/Presentation/UI/StudioWorkspaceHost.cs:1064–1081,1091–1100`: binding resolves the exact existing project; no-project state does not fabricate one. `Assets/Studio/Runtime/Presentation/StudioPeopleRailHud.cs:231–234`: TALENT merely locates Casting.

**Expected behavior:** P05 accepted lessons 4 (`P05-IMPLEMENTATION-AND-OWNER-PLAYTEST-LESSONS-LEARNED.md:40–44`) require an actual player route for existing player-relevant engine capabilities, with signContract as its explicit example. Lessons 5–7 require useful shortage/remedy truth. P06 accepted lesson 3 and the final P07 handoff permit holding before deliberate release; `docs/D-12-economy-contract.md` §11–12 permits time/recovery even when poor, and this reproduction retains nearly $7.9m. A legal contracting remedy should be reachable independently of first possessing the screenplay that needs that contract.

**Observed / traceable behavior:** At Week 105, after the last film releases following ordinary contract expiry, the studio has no contracts, zero active productions, zero Ready Casting projects, and no commissioning candidates. Its only published intent is Annex construction. The Unity hiring route requires a Ready Casting project, so the available, affordable core hiring remedy cannot be reached. The commission-oriented journey also suppresses advanceWeek, trapping the newly opened theatrical run after its opening receipt. Taking the sole offered Annex action charges $780,000 and leaves `availableIntents=[]`, with completion due Week 118 and no advancing week.

**Trigger / preconditions:** Real generated seed `p00p07-audit-contract-expiry`; found at exact legal minimum (3 Actors, 1 Director, 1 Writer, 1 Craft) using the same 104-week terms emitted by bridge founding. No artificial cash injection. Commission/accept one screenplay, select legal contracted company and the first published negative/marketing menu options, drive normal production decisions to Release Ready at Week 9. Keep it safely on hold through Week 104 (manual hold is an explicitly emitted intent). All six founding contracts expire. Commit the exact film and advance once to release at Week 105. No other unproduced screenplay exists. This long hold is an economical witness; the required state is equally the last-film release after contracts expire during a continuing campaign. No fabricated save state is needed.

**Player impact:** Ordinary supported actions can leave a funded saved studio unable to start another screenplay, renew/sign through normal surfaces, advance construction, or collect later theatrical receipts. It is not a shortage of cash and not a demand to invent loans or relax actor/writer law. Save/reload retains the same blocked state. No claim of irreversible save data loss; returning to an earlier save or intervention outside ordinary client controls may escape it.

**Evidence:** Audit artifact `gameplay-probe.mjs`, invoked with `/opt/homebrew/Cellar/node@22/22.23.0/bin/node --disable-warning=ExperimentalWarning gameplay-probe.mjs`; exit 0 in ~0.3s. Uses accepted source directly via audit loader. Its initial production progression is pure-core action/tick execution with the same legal payloads; bridge snapshots establish published control availability, and the final Annex is submitted through actual in-memory `BridgeSession.command`. No network/runtime service.

```text
readyWeek=9
week=105, cash=7895754.951760456, contracts=0
liveProductions=0, readyCastingProjects=0, commissionWriters=0
commissionBlockers=["no-writers"]
availableIntentKinds=["startConstruction"]
activeTheatricalRuns=1
legalCoreHire: t-act-21, bonus=143720, canCommissionAfter=true
sole construction command accepted=true, week=105
cash=7115754.951760456, availableIntentKinds=[]
Annex status=underConstruction, completesWeek=118
```

The direct counterfactual hire is an existing legal engine action and immediately restores `commission.canStart=true`; it proves both affordability and the hidden remedy. Import/export validates the actual generated state before and after the trigger. **Reachability detail:** all talent have writing skills; an Actor can lawfully write. This finding does not claim a primary-role Writer is universally required, nor that the internally named `signActor` conversion only accepts Actors. The failure is access to any usable contracting route when no Ready project exists.

**Severity:** P1 / High — reachable progression dead end with substantial cash, no engine ban or intended economic trap; later in normal play, not a fresh-start inevitability.

**Confidence:** CONFIRMED REPRODUCTION (pure-core and in-memory bridge); actual Unity control dependency is SOURCE-DEMONSTRATED. No HID/visual claim.

**Known-finding status:** NEW consequential no-project/contract-expiry path; shares the known historical hidden-hiring defect class, while P05A3's specific Actor shortage with a Ready project is already fixed. The missing clock and inaccessible hire are consolidated here as one recovery-path defect.

**Smallest likely owning seam:** Existing hiring/renewal access and no-picture bridge progression policy. Recommendation only: make the existing recovery action reachable without a Ready project; reconcile manual clock availability with authoritative activity rather than a commissioning guide alone. No new economy mechanic is needed.

**Required regression test:** Start from exact minimum founding terms/no extra cash, persist through actual expiry and last-film release, assert player-visible route to an affordable current hire and then a legal commission. Include an active theatrical run and an Annex start; assert a single ordinary Advance Week remains reachable and pays/completes according to authority. Do not repair test state with direct `signContract` and call that proof of the client route. Later scheduled packaged test must click the actual market/recovery surface without a pre-existing Ready Casting project.

**Current-stack status:** STILL PRESENT AT EXACT COMMIT — source trace at TS `a2baa1d9b3ffb2666732dba55823e09cc76c7352` / Unity `75de360e0fe2f1e5e0173cea63d00497c23c3eb3`. P10 adds pre-expiry renewal and a project-bound FIND TALENT entrance, but not the post-expiry/no-project recovery; details below. No successor runtime reproduction.

## P00P07-AUD-003 — Ordinary Casting refresh omits the market bind

**ID:** P00P07-AUD-003

**System / package ownership:** Unity retained Casting workspace host; P05A.3 casting / roster liveness extension to P04 workspace.

**Exact repository / commit:** `HSpector1/project-studio-unity-visual-spike@c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6`; `HSpector1/The-Movies@2753e18ba8fb5f65b936c22cde9531646fecc6cd`.

**File / symbol / line range:**

- Unity `Assets/Studio/Runtime/Presentation/UI/StudioWorkspaceHost.cs`: `BindCastingWorkspace` 1064–1081 versus `OnSnapshotApplied` 1405–1448.
- Unity `Assets/Studio/Runtime/Presentation/UI/StudioCastingWorkspace.cs`: `BindMarket` 1023–1037; candidate removal guard 1146–1158; `DecideShortage` 4697–4718; `FindHiringCandidate` 4729–4736; `RenderTalentMarket` 4790–4816.
- TS `bridge/casting.ts` 348–357; `src/core/castingPackageReadModel.ts` 598–630; `src/core/employment.ts` 338–376 (epoch-dependent hiring IDs).

**Expected behavior:** The P05A.3 evidence document (`docs/engineering/P05A3-CASTING-ROSTER-LIVENESS-EVIDENCE.md` 85–105) defines the market as the published hiring candidates, offer terms, and authoritative rotation week, while retaining the player's casting context. The host's `BindCastingWorkspace` comment and actual initial bind require the market facts beside every rebind. P06 lessons 45–48 require screens to agree for the same subject and revision.

**Observed / traceable behavior:** Opening Casting calls `BindCastingWorkspace`, which refreshes treasury, market candidates, rotation week, current week, project and expiry notices. `OnSnapshotApplied` instead duplicates only treasury/project/expiry binding; it never calls `BindMarket`. The workspace stores the market facts and continues to render and decide from these cached fields. Rebinding the current project does not update them. Even its guard intended to close an offer after a candidate leaves the market searches the stale cached market, so it cannot detect that departure. New bridge responses do contain the fresh market; the omission is in the actual Unity host.

**Trigger / preconditions:** Have a valid Ready Casting project and keep the retained Casting workspace open across an ordinary authoritative market change: e.g. market epoch rotation (every 13 weeks) or a signing/removal while still using that casting context. At an epoch change, the next snapshot has different market candidates and the next refresh week, while the workspace retains its former candidates/date. No fabricated GameState is required. A more deterministic future integration test can supply two valid consecutive snapshots to the actual host with a retained project ID and changed published market.

**Player impact:** The actor-shortage remedy can display departed/now-ineligible hires, omit newly available actors, or say that a past week is when new candidates will arrive. Retrying a stale candidate is refused by the authoritative quote path; the audit does not establish unauthorized signing, duplicate debit, or durable state damage. Closing and reopening the entire casting workspace repairs this view by running the complete bind, but ordinary refresh and Back between its market sublayers do not. This obstructs the shipped staffing remedy inside a retained Casting draft and creates contradictory current-world guidance. The full reopen is not a demonstrated draft-preserving recovery; opening Casting creates a new context (`StudioWorkspaceHost.cs:451–465`).

**Evidence:** Complete static producer → snapshot → missing host binding → cached list/decision trace above. `rg -n 'BindMarket' Assets/Studio/Runtime/Presentation/UI/StudioWorkspaceHost.cs` returns only the call inside `BindCastingWorkspace`; `OnSnapshotApplied` has no call to that helper. Inspection confirmed cache replacement occurs only in `BindMarket` and candidate lookup/render uses the cached array. No runtime or visual reproduction claimed.

**Severity:** P2 / moderate: recoverable stale ordinary interaction and availability guidance; actor acquisition requires an undocumented full workspace reopen to recover after the affected refresh.

**Confidence:** SOURCE-DEMONSTRATED.

**Known-finding status:** NEW against the reviewed registers. Related to snapshot freshness generally, but not the known history entrance or poll-gating defects.

**Smallest likely owning seam:** The host's duplicate snapshot binding path. Recommend making ordinary refresh apply the same current market facts as initial binding while preserving the existing in-flight greenlight disappearance behavior. No implementation performed.

**Required regression test:** Exercise the actual host `OnSnapshotApplied` with an open casting context: old→new market candidates, old→new rotation/current week, and an open offer whose candidate disappears. Assert newly available actor appears, departed actor disappears, offer closes correctly, and exact project/role/slate/draft survives. Current `StudioCastingMarketP05A3Tests` directly invokes `BindMarket` (32, 53, 69, 133, 163, 183, etc.; helper 298–301), bypassing the missing host call, so its market assertions cannot catch this wiring omission.

**Current-stack status:** STILL PRESENT AT EXACT COMMIT `75de360e0fe2f1e5e0173cea63d00497c23c3eb3`, source only; see the bounded reconciliation below. No successor runtime or visual verification.

## P00P07-AUD-004 — Core cancellation after release commitment returns a state that cannot save or advance

**ID:** P00P07-AUD-004

**System / package ownership:** Core cancellation plus P06 release commitment and V16 save invariant.

**Exact repository / commit:** TS `HSpector1/The-Movies@2753e18ba8fb5f65b936c22cde9531646fecc6cd`.

**File / symbol / line range:** `src/core/actions.ts:747–768` (`applyCancel`), `:2860–2870` (public dispatch), `:2975–2982` (resource-only final invariant); `src/core/releaseAuthority.ts:130–188` (`assertReleaseAuthorityInvariants`); `src/core/tick.ts:164–173` (entry invariant); `ui/src/presentation/refusalVoice.ts:23–27` (explicit absence of player cancel control).

**Expected behavior:** Existing cancel law at `actions.ts:743–746` accepts cancellation of an active production with no refund; P06 authority invariant I3 (`releaseAuthority.ts:134–139`) requires every commitment to refer to an active ready production. Whatever committed-cancel policy owns the decision, a public accepted action must either refuse neutrally or return a save/tick-valid state. The audit does not choose whether commitment should make cancellation illegal.

**Observed / traceable behavior:** `applyCancel` removes the active production and workflow but spreads unchanged `releaseAuthority`. `applyActions` returns normally. The surviving commitment is orphaned, so the next tick and next save both throw.

**Trigger / preconditions:** Generate the real minimum founded managed world described in AUD-002, drive its exact picture to Ready, commit it, then invoke the supported public core `cancel` action for that production. Before cancel both states export/import successfully. No forged state is used. **Reachability limitation:** no accepted Unity/bridge or browser cancel-production control was found; the product itself documents this absence. The reproduced trigger requires the public core API, not ordinary clicks. This is not the ordinary player deadlock in AUD-002.

**Player impact:** An API caller adopting the accepted cancellation outcome cannot save/advance it. The save validator blocks writing the invalid result; no on-disk corruption or loss of the previous valid save was reproduced. Lower practical exposure than AUD-002 because current clients do not publish production cancellation.

**Evidence:** Same pure-source artifact and exit 0. `prod-0001` is committed, then canceled; activeProductions length 0 and commitments length 1. Exact errors:

```text
tick: releaseAuthority row for "prod-0001" is an orphan — no such active production
validateSaveV16: releaseAuthority row for "prod-0001" is an orphan — no such active production
```

**Severity:** P2 / Moderate — public action violates durable-state validity; current player-interface reachability is absent.

**Confidence:** CONFIRMED REPRODUCTION, pure-core only.

**Known-finding status:** NEW in the inspected known registers; not a duplicate of historical production-ID reuse, which the current allocator guards.

**Smallest likely owning seam:** `applyCancel` and release authority's policy/invariant boundary; refuse the action or reconcile its commitment atomically according to existing authority. No fix implemented.

**Required regression test:** Exact legal ready→commit→cancel sequence. Assert either a neutral explicit refusal or a result that passes save/export/import and tick. Include a sibling committed film to ensure exact-ID isolation. Do not only fabricate an orphan and assert validators reject it.

**Current-stack status:** STILL PRESENT AT EXACT COMMIT — source trace at TS `a2baa1d9b3ffb2666732dba55823e09cc76c7352`; relevant behavior unchanged. No successor runtime reproduction.

## P00P07-AUD-005 — Casting buttons retain disabled state after transient gates clear

**ID:** P00P07-AUD-005

**System / package ownership:** P04 screen-test workspace, P05A.3 signing sibling, host frame maintenance.

**Exact repository / commit:** `HSpector1/project-studio-unity-visual-spike@c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6`; governing P04 lessons in `HSpector1/The-Movies@2753e18ba8fb5f65b936c22cde9531646fecc6cd`.

**File / symbol / line range:** `StudioCastingWorkspace.cs` quote acceptance 1477–1503, maintain 1455–1475, arm property 1578–1579, slate start gate 2423–2426, review continue 2592–2594, signing footer 4952–4959, sign-maintain 5085–5103; `StudioWorkspaceHost.cs` Update 137–161; `StudioBridgeClient.cs` actions gate 130–133, ApplySnapshot 1308–1318; `StudioSnapshotStateCache.cs` unchanged revision path 125–135; `StudioFoundingCardHud.cs` arm law 48–51. All Unity paths are under `Assets/Studio/Runtime/Presentation/UI/` except client/cache under `Infrastructure/` and founding HUD under `Presentation/`.

**Expected behavior:** P04 lessons L-06 at line 506: any enabled-state term varying faster than render events must be reapplied per frame; L-04/05 require an enabled action to act/explain and a disabled action to name its real blocker. The P04 lessons known-open register at 562–565 explicitly names `casting-slate-start` and `casting-review-continue` as uncorrected siblings.

**Trigger / preconditions:** Pause time with a legal six-read slate and a current quote; ordinary polling continues at the same revision.

**Observed / traceable behavior:** Pause time; complete a legal six-read slate; allow a current quote to arrive. Quote acceptance resets `slateArmedAtRealtime` to now and immediately renders; `ScreenTestCommitArmed` is false for the first 0.7 seconds, so the button is disabled. When 0.7 seconds passes, neither `MaintainScreenTestQuote` nor the host's per-frame gate maintenance reapplies the slate button gate. Unchanged snapshot polls produce `delta.applied=false`, so no SnapshotApplied rebind repairs it. The button stays disabled until a separate local rerender or changed-authority event. The review-continue and signing footer similarly sample `ActionsEnabled` only at rendering; a quote/render coinciding with an ordinary snapshot poll can leave them disabled after the poll ends. Quote requests have their own in-flight flag and may overlap polling.

**Player impact:** A legal optional camera-test path can appear unavailable indefinitely while paused; review/signing actions have the same transient-to-persistent disable risk. This is a recoverable interaction dead end, not proof of permanent game progression deadlock: the player can trigger another render, leave/reopen, or resume/change authority; camera tests remain optional. No visual or real-input reproduction claimed.

**Evidence:** `StudioCastingScreenTestTests.CommitQuote_OnlyWhenArmed_ExactlyOnce` (174–209) proves direct method dispatch, then forces private `slateArmedAtRealtime=float.NegativeInfinity` via `SetArmedNow` (873–876) and directly invokes `CommitScreenTestQuote`; it does not assert the actual button becomes enabled by ordinary frame updates. `StudioCastingMarketP05A3Tests.DisabledSignPrimary_AlwaysSpeaksItsReason_NeverGreysInSilence` (208–231) establishes disabled+reason only, never true-after-poll recovery. These tests are useful for their claimed method laws, but not proofs of UI liveness.

**Severity:** P2 / moderate, recoverable interaction blockage.

**Confidence:** SOURCE-DEMONSTRATED.

**Known-finding status:** KNOWN OPEN (same documented P04 root, with confirmed arm-timer mechanism and P05A.3 signing sibling).

**Smallest likely owning seam:** Host/workspace frame refresh of casting action gates.

**Required regression test:** actual Button enabled state after real arm duration and after false→true ActionsEnabled with unchanged revision; normal click dispatches once, no manual private-clock forcing or rebind.

**Current-stack status:** STILL PRESENT AT EXACT COMMIT `75de360e0fe2f1e5e0173cea63d00497c23c3eb3`, source only; see the bounded reconciliation below. No successor runtime or visual verification.

## P00P07-AUD-006 — Duplicate imported theatrical run receives double settlement

**ID:** P00P07-AUD-006

**System / package ownership:** Inherited save validation and theatrical settlement, consumed by P07 results.

**Exact repository / commit:** `HSpector1/The-Movies` / `2753e18ba8fb5f65b936c22cde9531646fecc6cd`.

**File / symbol / line range:** `src/core/save.ts:2005–2064` (`v8TheatricalRun`) and `:2260–2268` (independent per-row loop inherited by V16); `src/core/tick.ts:703–723` (credits every active row); `ui/src/engine/adapter.ts:3661–3663` (`filmResultView` selects first matching run); `src/core/economyView.ts:94–100` (sums runs).

**Expected behavior:** One released production has one settlement stream; P07's exact production identity and paid-to-date result facts remain consistent. Existing rule `tick.ts:703–704` explicitly says a release is paid exactly once; prior CF-03 documents stronger cross-row validation as unresolved.

**Observed / traceable behavior:** The V16 import accepts an exact duplicate of a valid active run. Each duplicate is paid independently next week; film result view reads the first match, so its per-film received figures conceal the extra cash credit.

**Trigger / preconditions:** A **deliberately malformed imported save**, made by duplicating the `active` row from checked-in P07 `s3-p07-active-run.save.json`; subsequent ordinary `tick`. No ordinary supported command generating duplicate rows has been found or alleged. Valid current-state production/release fixtures remain valid.

**Player impact:** Persisted double Studio Revenue for one production and disagreement between treasury/ledger and single-film result facts.

**Evidence:** `importSave` accepts duplicate run for `prod-0700`; following tick emits two `studioRevenue` rows for that film versus one in the unchanged control, and cash rises by an extra `899515.5041775703`. The complete control/duplicate comparison is in the appendix `save-probe.mjs`.

**Severity:** P2 / medium in this bounded audit because observed entry requires malformed import; financial consequence is high. Prior static audit rated the wider CF-03 P1. Do not describe this as a normal retry exploit.

**Confidence:** **CONFIRMED REPRODUCTION**.

**Known-finding status:** **KNOWN OPEN**, duplicate of CF-03 at `ee522834bd134280469eeb3878765e9f575018cf`; not a new P07 finding.

**Smallest likely owning seam:** Current save cross-row theatrical-run invariants, preserving explicit legacy model0 semantics.

**Required regression test:** Reject duplicate active run production IDs at import; compare one ID across next-tick ledger, treasury, received result projection and run; retain legitimate legacy-completed/no-run migration cases. Other incoherent-row aspects of old CF-03 were source-inspected but not re-probed exhaustively here.

**Current-stack status:** **STILL PRESENT AT EXACT COMMIT** `a2baa1d9b3ffb2666732dba55823e09cc76c7352`, at the unchanged validation seam, source only; see the bounded reconciliation below. No successor execution or runtime-verified fix claimed.

## P00P07-AUD-007 — Duplicate imported employment row increases payroll

**ID:** P00P07-AUD-007

**System / package ownership:** Inherited employment/save validation; ordinary overhead/payroll consumers. No new financial design proposed.

**Exact repository / commit:** `HSpector1/The-Movies` / `2753e18ba8fb5f65b936c22cde9531646fecc6cd`.

**File / symbol / line range:** `src/core/save.ts:1797–1824` (`v8Contract`) and `:2250–2254` (independent contract validation); `src/core/employment.ts:88–95` (`activeContract`) and `:188–193` (`weeklyPayroll`); `src/core/actions.ts:2564–2571` (`applySignContract` rejects already contracted talent).

**Expected behavior:** Existing sign law refuses a second active employment contract for the same person; employment lookup and payroll describe the same authoritative engagement. Prior CF-04 identifies missing contract collection invariants.

**Observed / traceable behavior:** V16 accepts two identical active contracts for one talent. Employment lookup returns the first; payroll sums both.

**Trigger / preconditions:** **Deliberately malformed imported save**, duplicating `contracts[0]` in the valid checked-in P07 active-run fixture. Ordinary sign actions are correctly guarded; no player command/retry route creating the duplicate is alleged.

**Player impact:** Inflated weekly payroll for one person and inconsistent employment/financial interpretation.

**Evidence:** Duplicating the active `t-act-22` contract is accepted and `weeklyPayroll` increases by `26210`. The complete probe is in the appendix `save-probe.mjs`.

**Severity:** P2 / medium for observed malformed-import reachability; prior CF-04 rated the broader issue P1.

**Confidence:** **CONFIRMED REPRODUCTION**.

**Known-finding status:** **KNOWN OPEN**, duplicate of CF-04 at `ee522834bd134280469eeb3878765e9f575018cf`.

**Smallest likely owning seam:** Cross-row contract validator at accepted save boundary; do not change command-specific affordability or termination laws.

**Required regression test:** Duplicate-active and conflicting-overlap imports rejected, with exact employment/payroll agreement; legitimate historic fixtures still migrate. Other old CF-04 monetary/term coherence aspects were not independently exhaustively reproduced.

**Current-stack status:** **STILL PRESENT AT EXACT COMMIT** `a2baa1d9b3ffb2666732dba55823e09cc76c7352`, at the unchanged validation seam, source only; see the bounded reconciliation below. No successor execution or runtime-verified fix claimed.

## P00P07-AUD-008 — Known facility operating costs still disappear from projected weekly burn and its dependent selectors

**ID:** P00P07-AUD-008

**System / package ownership:** Inherited D-12/D-17A financial selectors and C2a G-B truth-repair seam, consumed by bridge treasury/lot and P03–P07 management surfaces.

**Exact repository / commit:** TS `HSpector1/The-Movies@2753e18ba8fb5f65b936c22cde9531646fecc6cd`.

**File / symbol / line range:** `src/core/economyView.ts:44–63` weeklyOverhead/weeklyBurn; `:125–126` runway; `:159–177` commitmentPreview; `:215–229,244–257` prospective cycle cost/break-even; `:340–373` postSigningRunway; `:618–638` financeView. Actual charge `src/core/tick.ts:899–919`; `bridge/session.ts:602–611` treasuryOf; `ui/src/engine/adapter.ts:2478–2479,4400–4439,7199,7574–7580,7857` finance card, payroll runway, lot warning/cash band.

**Expected behavior:** `docs/D-12-economy-contract.md` §16 current-commitments runway includes existing recurring expenses. Accepted C2 charter explicitly identifies G-B facility Opex as invisible to weeklyBurn/runway (`CAMPAIGN-2-SETS-THROUGHPUT-CHARTER.md:1080–1085`); `docs/economy/C2-E0-BASELINE.md:173–198` already quantifies it. The modern selector comments call weeklyBurn the actual-charge basis.

**Observed / traceable behavior:** Tick correctly charges operational placements on the next advance after completion. weeklyBurn still adds only payroll and base/per-contract overhead. Every downstream selector using that burn reports too little spending and too much runway; cycle-inclusive break-even understates ongoing costs over its stated horizon. This is one shared omitted input, not multiple new bugs.

**Trigger / preconditions:** Use AUD-002's lawful funded ready film at Week 9; start the existing Annex and hold 13 weeks to its operational Week 22. Next advance has no release or contracting changes. No cash adjustment/forged state.

**Player impact:** Current spending/treasury forecasts understate actual drain by every operational placement's aggregate Opex; runway and low-runway warnings may arrive late. Current cash, voluntary immediate affordability, already-paid film contribution, and retrospective totals are not thereby wrong.

**Evidence:** Confirmed pure-source output:

```text
Week 22: payroll 81,169 + ordinary overhead 24,000 = shown weeklyBurn 105,169
facilityOpex 3,500; actual next-week cash debit 108,669
shown runway 137; same current-cost formula with actual charge 133
bridge treasury cash 14,475,930, weeklyBurn 105,169, netWeeklyCash -105,169,
runwayWeeks 137, runwayInfinite=false
```

**Exact affected/excluded surfaces:** `weeklyBurn`, `runway`, `commitmentPreview.postWeeklyBurn/postRunway`, `postSigningRunway`, `prospectiveCycleFixedCost`, `cycleInclusiveBreakEvenGross`, `financeView.netWeeklyCash/runway`, bridge treasury, adapter payroll runway, and lot low-runway/cash-band derivations inherit it. `weeklyOverhead` correctly mirrors the separate tick §7.5 component; calling that component by itself is not a second defect. `financeTotals` maps `facilityOpex` to overhead (`economyView.ts:464–470`), and `periodSummary` handles it (`:541–547`), so actual ledger history is included. `filmCommittedCost` purposely excludes studio-wide costs. Casting intentionally omits burn/runway under its hidden-truth contract (LIVING-LOT:2559); this is not missing casting payload. `setMaintenance` is immediate repair capital/maintenance spending (`sets.ts:551–576`), not a weekly debit, and should not be added as a recurring term by this audit.

**Severity:** P2 / Moderate — systematically misleading recurring-cost forecasts; actual debits and financial transaction rules remain correct.

**Confidence:** CONFIRMED REPRODUCTION.

**Known-finding status:** KNOWN OPEN, deduplicated against C2-E0 G-B and C2 charter; not a new facility-Opex discovery. The baseline's historical 19.2% is not asserted for every current estate; this witness has a 3,500/week gap.

**Smallest likely owning seam:** The single current-cost basis in `economyView.weeklyBurn`, with the tick's founded/engaged/operational timing intact. No tuning, new allocation law, or production patch proposed.

**Required regression test:** Found/construct legally; at the under-construction, just-completed, operational, and demolished boundaries compare public burn to the next tick's actual recurring debit under unchanged contracts/release state. Assert bridge treasury and dependent runway use it. Retain correct retrospective finance aggregation tests.

**Current-stack status:** STILL PRESENT AT EXACT COMMIT — source trace at TS `a2baa1d9b3ffb2666732dba55823e09cc76c7352`; relevant behavior unchanged. No successor runtime reproduction.

## P00P07-AUD-009 — Freshly requoting the oldest intent does not protect it from immediate cache eviction

**ID:** P00P07-AUD-009

**System / package ownership:** P03/P04 bridge quote lifecycle; shared transient quote cache.

**Exact repository / commit:** `HSpector1/The-Movies@2753e18ba8fb5f65b936c22cde9531646fecc6cd`.

**File / symbol / line range:** `bridge/session.ts:273–278` (`opaqueIntentId`), `:1375–1378` (`quotedIntentFor`), `:1423–1428` (`capPendingQuotes`), `:1477–1494,1505–1522` (`quote` insertion), `:1322–1336` (commit refusal).

**Expected behavior:** A freshly returned quote should remain committable under its unchanged state/revision until its documented invalidation or cache eviction policy applies consistently. Prior audit CF-20 identifies this same recency defect; the cache comment calls the oldest quote least likely to be committed. This finding does not demand durable quote storage or unlimited retention.

**Observed / traceable behavior:** Repeating an identical draft returns the same intent ID. `Map.set` updates its value without refreshing insertion order. With 16 cached drafts, refreshing the oldest and requesting one new draft deletes the just-refreshed quote. Submitting it returns `INTENT_NOT_AVAILABLE` although gameplay state and revision have not changed.

**Trigger / preconditions:** One session, 16 distinct valid drafts, requote draft 0, then quote draft 16 before committing draft 0. The probe varies three valid promise-center indices to obtain distinct legal commission drafts. Multiple abandoned/refreshing workspaces can exercise the shared cache; no corrupted save or running-service probe is used. Normal single-draft interaction does not require this sequence.

**Player impact:** A newly displayed valid quote can require another review/requote. No duplicated money, resource reservation, or durable mutation occurred. Rejected-command journal bookkeeping is permitted and was not classified as gameplay mutation.

**Evidence:** `bridge-probe.mjs` ran against the accepted source with installed Node 22.23.0, exit 0. Assertions: all first 16 quotes accepted; refreshed ID equals original ID; 17th accepted; digest unchanged; refreshed commit refused with `INTENT_NOT_AVAILABLE`; digest still unchanged. No production test file was added. The complete reproducer is in the audit appendix.

**Severity:** P3 / low, bounded recoverable quote invalidation. **Confidence:** CONFIRMED REPRODUCTION at in-memory `BridgeSession`.

**Known-finding status:** KNOWN OPEN; exact duplicate of prior CF-20, not a new root cause.

**Smallest likely owning seam:** Pending-quote insertion/recency bookkeeping. Recommendation only; preserve deterministic IDs, state binding and capacity.

**Required regression test:** Exactly 16 legal drafts → refresh oldest → add one → commit refreshed. Assert oldest unrefreshed entry is the evicted one, unchanged gameplay state during quoting, and exactly one effect on successful commit.

**Current-stack status:** STILL PRESENT AT EXACT COMMIT `a2baa1d9b3ffb2666732dba55823e09cc76c7352`, source only. The bounded session diff adds quote families while retaining the same map insertion/cap behavior. No successor execution.

## P00P07-AUD-010 — The committed P07 profile-proof command imports nonexistent module paths

**ID:** P00P07-AUD-010

**System / package ownership:** P07 W7 proof artifact, not gameplay implementation.

**Exact repository / commit:** `HSpector1/The-Movies@2753e18ba8fb5f65b936c22cde9531646fecc6cd`.

**File / symbol / line range:** `scripts/p07-real-profile-journey.mts:9–16`, advertised command and three local imports. Historical result claims: `docs/engineering/CODEX-P07A-EXECUTION-HANDOFF.md:192` and P07 receipt `:140–147`.

**Expected behavior:** The committed proof entry point's advertised repository-root command must resolve its shipped modules. P04 lessons L-10/L-11 require proof to bind to the actual source/artifact; a private historical successful run is not proof that a subsequently committed entry point is executable.

**Observed / traceable behavior:** The script lives in `scripts/` but imports `./ui/src/engine/adapter.ts`, `./src/core/index.ts`, and `./bridge/release.ts`. Relative module resolution anchors these paths under `scripts/`, where all three are absent. The actual modules exist one level above. Working-directory selection does not change relative import semantics.

**Trigger / preconditions:** Attempt the documented `node_modules/.bin/vite-node scripts/p07-real-profile-journey.mts` in a clean accepted checkout with the documented dependencies. Module resolution fails before the intended profile journey can run. This audit did not install dependencies or execute that private-profile script.

**Player impact:** None directly. A reviewer cannot reproduce the recorded proof via its committed command; future verification can silently drift toward an untracked working copy or an amended entry point unless the discrepancy is recorded. This does **not** prove the historical 30/30 result was fabricated or wrong, and it does not revoke Owner acceptance.

**Evidence:** Standard-library path inspection of the literal imports produced:

```text
scripts/ui/src/engine/adapter.ts: absent; ui/src/engine/adapter.ts: present
scripts/src/core/index.ts: absent; src/core/index.ts: present
scripts/bridge/release.ts: absent; bridge/release.ts: present
```

**Severity:** P3 / low, reproducibility defect in the proof layer. **Confidence:** SOURCE-DEMONSTRATED (including filesystem path checks), not a gameplay or private-profile execution result.

**Known-finding status:** NEW in the reviewed registers; separate from the runtime checkpoint gap. The same script also imports only the inner gameplay save, explaining why its intended journey would not test that outer checkpoint migration.

**Smallest likely owning seam:** Committed proof entry-point imports and reproducible invocation. No script edited.

**Required regression test:** Resolve/load the actual committed entry point in a clean isolated source checkout with an explicitly supplied nonprivate fixture; exercise its real import path before claiming journey completion. Preserve old evidence and do not relabel its bytes.

**Current-stack status:** STILL PRESENT AT EXACT COMMIT `a2baa1d9b3ffb2666732dba55823e09cc76c7352`; the script is byte-unchanged from accepted P07. This says nothing about separate newer P08–P10 drivers.

## Known, duplicate, fixed and unconfirmed dispositions

The detailed known findings above are carried forward once each. Facility Opex is one omitted cost basis; quote eviction is CF-20; duplicate runs and contracts are CF-03/04; casting action gates are the P04 sibling-site root. No additional finding count is inferred from their dependent screens.

| Topic | Disposition and evidence |
|---|---|
| P04 original existing-profile startup failure | ALREADY FIXED IN ACCEPTED BASE for its historical hashes; AUD-001 is the later P07 omission of the immediate P06 identity, not a claim that the P04 repair never worked |
| P04 Writer credit prevents greenlight / repeated freelancer charge | ALREADY FIXED IN ACCEPTED BASE: readiness and action guards now separate credit from active labour; `writer-credit-not-assignment`, `p04a3-greenlight-law`, and nonvacuous salary-sum tests inspect both branches |
| P04 Casting Office `projects[0]` / Greenlight render-only gate | Historical fixes present; current market binding and other gate siblings are separately traced, not a relabeling of these repaired instances |
| P05A.3 two actors for three seats | ALREADY FIXED IN ACCEPTED BASE for Ready-project shortage/hiring; AUD-002 exercises the uncovered no-Ready-project state |
| CF-08 C# object-union first-member generation; CF-09 actual consumer binding | ALREADY FIXED IN ACCEPTED BASE: explicit compatible/discriminated-union handling and pinned consumer verifier exist; actual consumed DTO/fixture hashes match. No current schema drift finding |
| CF-07 repeated bridge derivation / proposed mutable snapshot cache | Per-state build context now shares immutable derivations; served envelopes are copied. Existing isolation tests mutate served values and compare fresh independent state. No external cached-authority mutation path demonstrated |
| P06 wrapped-as-shooting guidance F2; memo-only release observation F3 | Historical register entries superseded by later P06C/D and accepted P07 authority; no new defect from old prose alone |
| P07 separate history entrance | KNOWN accepted limitation: records persist inside FILM HISTORY but P07 has no always-visible independent entry after all active runs leave. Successor source provides an Administration → History → exact result route; see reconciliation. No deleted-film/data-loss claim |
| Negative cash, termination affordability, hold costs | INTENDED / NOT A DEFECT: new commitments, termination, ongoing work and hold have action-specific laws. P06's historical cash recovery path is distinct from AUD-002's funded missing control route |
| Gross / Studio Revenue / direct film contribution; Critics/Audience/Business | Inspected producers and consumer preserve their distinct bases. Missing studio-wide allocations are not invented into direct contribution. Legacy no-run/full-gross and absent historical participants/forecasts follow the accepted handoff |
| CF-05 authored talent ID collision | KNOWN OPEN, SOURCE-DEMONSTRATED; not newly reproduced. `actions.ts:303–313,994–1006` counts authored rows rather than all occupied IDs; `save.ts:2186–2193` permits a non-authored imported `authored-0000` but rejects the creator's later duplicate. Trigger requires the prior report's specifically imported reserved-prefix ID, not natural world generation. Smallest seam remains allocator collision skipping; needed regression is accepted reserved-ID import → each creator action → immediate save roundtrip. Successor source at `a2baa1d9…` retains the same allocator. Prior CF-05 contains the full original finding; this is a source-status check, not another new finding |
| P04 cross-picture Writer-credit / active-seat projection exclusivity | KNOWN OPEN; targeted reproduction still required here. `adapter.ts:6644–6701` unconditionally reserves Writer IDs in `globallyAssignedTalentIds`; `ui/src/lot/snapshot/productionCompany.ts` has the corresponding gate. A writing-capable Actor may legally author A and act in B; the source's unreachable-by-playing comment is not accepted as proof. No completed ordinary two-film witness was obtained; this audit does not add a confirmed company-disappearance claim |
| Malformed V16 release-commitment event sequence/time | Bounded validation gap, consequential impact INCONCLUSIVE: `save.ts:4732–4769` strips `releaseCommitted` before inherited event validation and misses global sequence/time checks. An intentionally malformed row at `seq=nextSeq=52`, week24 in a week23 fixture is accepted; a legal next commitment then shares seq52. No legitimate producer of the initial malformed row, player progression failure or displayed result error established. Suggested regression: interleaved event kinds with duplicate/out-of-order/future sequence rejection. The unchanged V16 validation seam remains in successor source. This lower-priority observation is not a new ordinary-profile corruption claim |
| P07 heading overlap, blocked-run aggregate PASS, five-of-six bundled Oracle folders | Known deferred/evidence limitations in receipt and lessons; no visual/real-input confirmation attempted. Separately retained sixth same-title scenario is reported historical evidence, not inspected local evidence |

## Test quality and proof limits

Passing tests support only what they exercise. The consequential gaps are causal and specific:

1. **Outer checkpoint migration omitted.** P07 W6 tests current V16 gameplay import/continuation, not the P06 runtime envelope. The prior-schema test iterates the implementation's list and pins the same stale thirteen hashes. The execution handoff calls migration trivial because there is no V17; outer schema identity still changed. AUD-001 uses an actual frozen predecessor checkpoint, not a recreated current fixture.
2. **Minimum roster does not prove an ordinary route.** `p05a3-minimal-founding-liveness.test.ts:40` supplies $50m and `:134–159` directly signs a Director to repair its test state. Those assertions can prove core staffing law, not client hiring access or late expiry recovery. AUD-002 uses the actual minimum/no added cash and checks the emitted bridge actions.
3. **Workspace methods bypass missing host wiring.** Casting market tests call `BindMarket` directly. They cannot detect that `OnSnapshotApplied` omits it. The screen-test test forces the private arm timestamp and directly calls `CommitScreenTestQuote`; it does not observe the real Button becoming enabled after elapsed time and polling.
4. **Financial expectations mirror the incomplete helper.** `d12-economy-view.test.ts:112–115` and `d17a-economy-selectors.test.ts:130` assert payroll + ordinary overhead. Placement tests separately prove the correct Opex debit. Neither compares the public burn with that debit in the same operational estate. Both can pass despite AUD-008.
5. **Forged invariant failures do not cover legal transition failures.** P06's orphan tests reject a hand-made orphan, but do not test ready → commit → cancel. AUD-004 creates the invalid state through accepted core actions.
6. **The recorded journey's committed entry point is broken.** AUD-010 is a proof-driver defect; it is not an automatic product defect or a disproof of private historical runs.

Positive supporting coverage: bridge replay tests bind full request envelopes and session identity; the audit's real financial signing command replays byte-for-byte without a second contract/debit, including after checkpoint restoration. Cross-session reuse refuses before cached response lookup, and a changed payload with the same command ID refuses. Queue tests distinguish capacity-only deferral from actual illegality and revalidate admission without early cash/talent reservation. P07 W6 has independent continuation, exact same-title ID, retained-run and pure-projection assertions. None of these suites was rerun wholesale.

Proof launchers were read, not invoked. Some defaults refer to named development worktrees/engine bundles (for example `Tools/p04a1-proof-launch.sh:13` and `Tools/p07-run-visual-oracle.sh:20`); they are not safe generic commands for this audit checkout. Existing CF-02 build-binding guards matter. No current result was assembled from incompatible build pairs. Historical failed/blocked runs remain failed/blocked; the receipt's newer accepted G journey is a distinct record.

## One bounded current-stack reconciliation

The final source-only check captured expected branch tips **once**: TS `6632cae665dca3a936b1d6783a8a510de439d3e4`, Unity `738cafaf11d69bd770832d7c85ae43a4691f449c`. Those moving documentation/tool tips were **not** combined as a presumed tested product pair.

Instead, [the exact handoff at TS `6632cae…`, §5](https://github.com/HSpector1/The-Movies/blob/6632cae665dca3a936b1d6783a8a510de439d3e4/docs/campaigns/P08-P10-FINAL-VERIFICATION-02.md#L207-L220) explicitly binds:

- TypeScript engine source/build binding: **`a2baa1d9b3ffb2666732dba55823e09cc76c7352`**.
- Unity player source/build binding: **`75de360e0fe2f1e5e0173cea63d00497c23c3eb3`**.
- Reported engine SHA-256 `189326b6fbd769bc9650d0ed43b92c9ba75c78565958f3074f4d5645605d065e`, player SHA-256 `3558ddd457a423308bb605105e9884f7da479658ece168b883d5e0d41bc297bf`, protocol/projection/save 4/19/V18.

The abbreviated TS binding was resolved to its full commit using GitHub. This is a compatible immutable source-pair checkpoint documented by the active lead, not a claim that the active queue is complete. The handoff's status/final gates remain in progress. Only findings' relevant changed files and necessary new recovery/history consumers were read. No successor source was executed, no binary was inspected, and no later branch tip was chased. **Current runtime-verification status remains pending/not checked by this audit.**

| Finding | Status at that exact pair | Narrow evidence |
|---|---|---|
| AUD-001 | STILL PRESENT at TS `a2baa1d9…`, source | Checkpoint allowlist jumps projection13 →15 and adds later hashes; it still omits P06 projection14. The same selection/refusal path remains |
| AUD-002 | STILL PRESENT at TS `a2baa1d9…` / Unity `75de360e…`, source | P10 adds useful pre-expiry renewal, but `bridge/contract.ts:92–99` requires an active contract. `session.ts:938` retains the commission early return. `StudioWorkspaceHost.OpenCastingMarket:719–725` and Casting inspector still require an actionable project for FIND TALENT. Post-expiry/no-project recovery is not supplied |
| AUD-003 | STILL PRESENT at Unity `75de360e…`, source | Complete bind at host `:1860–1877`; ordinary snapshot handler `:2392–2466` still omits market. New Roster detour supplies another recovery rebind, not ordinary refresh |
| AUD-004 | STILL PRESENT at TS `a2baa1d9…`, source | Cancel body unchanged; commitment orphan invariant remains. Still no ordinary production-cancel surface |
| AUD-005 | STILL PRESENT at Unity `75de360e…`, source | Host Update refreshes Greenlight/production gates, not slate/review/signing gates; unchanged-revision cache path remains |
| AUD-006/007 | STILL PRESENT at TS `a2baa1d9…` **validation seams**, source | Frozen per-row validators and complete V8 live validator unchanged; V18→V17→V16 delegation adds history/regime checks, not run/contract collection uniqueness. Duplicate-credit/payroll probes were not rerun on successor |
| AUD-008 | STILL PRESENT at TS `a2baa1d9…`, source | `economyView.ts` byte-unchanged |
| AUD-009 | STILL PRESENT at TS `a2baa1d9…`, source | Same deterministic ID / Map insertion / oldest deletion; newer quote families use the shared cache |
| AUD-010 | STILL PRESENT at TS `a2baa1d9…`, source | Profile-proof script byte-unchanged; newer drivers outside this finding |
| Known independent history entrance | FIXED AT EXACT COMMIT — **source only**, Unity `75de360e…` with TS `a2baa1d9…` | Admin `StudioFoundingCardHud:1095–1107` → host History → exact result; `bridge/history.ts:404–412` includes durable released films, even without newly recorded chronology. Runtime repair not verified here |

## Recommended triage and later runtime cases

Recommendations are for Current Ops scheduling, not repair orders to the active lead:

1. **Existing-profile access and funded progression:** triage AUD-001/002 first. Later open a private copy of a real accepted P06 profile, check current/explicit saved slots and a second restart. Separately reproduce no-contract/no-Ready-project recovery through actual controls, with both theatrical receipts and an Annex waiting for time. Verify existing hiring/clock rules; no new economy system is needed.
2. **Ordinary Casting interaction:** schedule AUD-003/005 host regressions and a later real-input case. Keep an exact Ready project/slate open across a market rotation; newly eligible people appear, departed offers close, role/draft survives. While paused, wait past the arm delay and finish a snapshot poll; the actual visible Button must become usable and dispatch once.
3. **Save/action integrity:** assign AUD-004 to its small core seam before exposing cancellation. Triage existing CF-03/04/05 import cases under explicit compatibility policy. Assert exact IDs across import, ledger, treasury and result, not only totals or independently valid rows.
4. **Known financial truth:** if scheduling AUD-008, compare projected burn with actual next-week recurring ledger charges at construction completion, operational and demolished boundaries. Preserve direct-film contribution scope and action-specific affordability.
5. **Proof and lower-priority follow-up:** retain AUD-009/010 for their owning seams. A later paired runtime test should verify the successor's independent History entrance after all runs finish and after Save/Load. Target Writer-credit-on-A/acting-on-B company presence and truthful blocked return dates without broadening into a redesign.

Two plausible interaction cases remain **REPRODUCTION REQUIRED**, not additional confirmed findings: (a) Locate suspends workspace rebinding and returning may show old production/casting truth until another changed snapshot; test blocked→ready or auditioning→review while suspended (`StudioWorkspaceHost:764–809,1409`); (b) earlier blocked-phase candidate `returnWeek` is a conditional core estimate but renders as “Returns Week N”; test exact candidate and revision (`castingPackageReadModel:305–340`, Unity Casting workspace `:2100–2112`). Neither was claimed as visually reproduced.

## Disposition

Audit investigation/report complete within the four-hour limit; overall coverage remains partial as stated. No further production work is authorized or implied. Stop for **Current Ops triage**.

- **PRODUCTION CODE CHANGED: NONE**
- **ACTIVE RUNTIME WORK INTERRUPTED: NO**
- **CAMPAIGN / MAIN / IMPLEMENTATION REFS MOVED: NO**
- Publication target: `docs/p00-p07-foundation-audit-01`, one documentation commit directly on the frozen accepted TS snapshot. The final delivery supplies and independently verifies the resulting commit and document bytes; this document does not invent its own future Git hash.

## Reproduction appendix

The following audit-only scripts can be placed together **outside** an isolated source checkout. `AUDIT_TS_ROOT` is a file URL to the exact accepted checkout, e.g. `file:///tmp/isolated/ts`. Use an already available Node 22.23.0 or compatible built-in transform; this audit installed nothing. Run each probe separately. These scripts invoke pure source functions and never open a product listener, GUI, profile, or proof server. They are documentation artifacts, not changes to the product test suite.

### audit-loader.mjs

```js
// Audit-only loader. No product files are written; only relative source imports
// from this immutable isolated checkout are transformed with Node's built-in TS support.
import { registerHooks, stripTypeScriptTypes } from 'node:module';
import { readFileSync, existsSync, realpathSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = pathToFileURL(realpathSync(new URL(process.env.AUDIT_TS_ROOT + '/'))).href + '/';
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && specifier.endsWith('.js') && context.parentURL?.startsWith(root)) {
      const target = new URL(specifier.slice(0, -3) + '.ts', context.parentURL);
      if (existsSync(target)) return nextResolve(target.href, context);
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith(root) && url.endsWith('.ts')) {
      return { format: 'module', shortCircuit: true,
        source: stripTypeScriptTypes(readFileSync(fileURLToPath(url), 'utf8'), { mode: 'transform', sourceUrl: url }) };
    }
    return nextLoad(url, context);
  }
});
```

### save-probe.mjs

```js
import './audit-loader.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const base = new URL(process.env.AUDIT_TS_ROOT + '/');
const core = await import(new URL('src/core/index.ts', base));
const source = readFileSync(new URL('ui/e2e/p06-visual-oracle-v1/s4-release-ready.checkpoint.json', base), 'utf8');
const fixture = JSON.parse(source);
console.log(JSON.stringify({fixtureSchemaId: fixture.schemaId, saveVersion: JSON.parse(fixture.currentSaveJson).saveVersion, fixtureSession: typeof fixture.sessionId}));
const checkpoint = await import(new URL('bridge/runtime-checkpoint.ts', base));
const { SCHEMA_ID } = await import(new URL('bridge/protocol.ts', base));
const { canonicalJson } = await import(new URL('bridge/schema/canonical.ts', base));
assert.equal(source, canonicalJson(fixture)+'\n');
assert.equal(fixture.journal.length, 0);
const schemaOnlyControl = checkpoint.loadBridgeRuntimeCheckpoint(canonicalJson({...fixture, schemaId:SCHEMA_ID})+'\n');
assert.equal(schemaOnlyControl.hydrated.currentSave.saveVersion,16);
console.log(JSON.stringify({probe:'same empty-journal fixture with current schema header (control only)',result:'ACCEPTED'}));
try {
  checkpoint.loadBridgeRuntimeCheckpoint(source);
  console.log('P06 checkpoint unexpectedly loaded');
  process.exitCode = 1;
} catch (error) {
  assert.match(error.message, /checkpoint.schemaId: does not match the running TypeScript bridge schema/);
  console.log(JSON.stringify({probe:'P06 fixture into P07 loader', result:'REFUSED', error:error.message}));
}
const save = core.importSave(fixture.currentSaveJson);
assert.equal(save.saveVersion,16);
console.log(JSON.stringify({probe:'embedded V16 gameplay save',result:'VALID',week:save.state.market.tick}));
const { createBridgeRuntimeCoordinator } = await import(new URL('bridge/runtime/runtime-coordinator.ts',base));
const counts={read:0,write:0,close:0,fatal:0};
await assert.rejects(createBridgeRuntimeCoordinator({
  store:{checkpointPath:'audit-in-memory-only',read:async()=>{counts.read++;return source},writeAtomic:async()=>{counts.write++},close:async()=>{counts.close++}},
  fatal:()=>{counts.fatal++}
}),/checkpoint.schemaId: does not match/);
assert.deepEqual(counts,{read:1,write:0,close:1,fatal:1});
console.log(JSON.stringify({probe:'in-memory startup coordinator with original P06 fixture',result:'FATAL_BEFORE_WRITE',counts}));
const invalid = structuredClone(save);
invalid.state.studioEvents.rows.push({kind:'releaseCommitted',productionId:'malformed-audit-probe',seq:invalid.state.studioEvents.nextSeq,week:invalid.state.market.tick+1});
const accepted = core.importSave(JSON.stringify(invalid));
console.log(JSON.stringify({probe:'malformed releaseCommitted outside nextSeq and future week',result:'ACCEPTED',nextSeq:accepted.state.studioEvents.nextSeq,inserted:accepted.state.studioEvents.rows.at(-1)}));
const committedMalformed = core.applyActions(accepted.state,[{kind:'commitPictureToRelease',productionId:accepted.state.studio.activeProductions[0].id}]);
const committedMalformedSave = core.makeSave(committedMalformed);
const duplicateSequences=committedMalformedSave.state.studioEvents.rows.filter(r=>r.seq===52);
assert.equal(duplicateSequences.length,2);
console.log(JSON.stringify({probe:'ordinary exact-film commit after malformed import',result:'SAVE_ACCEPTS_DUPLICATE_EVENT_SEQUENCE',rows:duplicateSequences}));

// Malformed-import probes, deliberately fabricated to check the validation boundary.
// No ordinary command route creating either duplicate is alleged.
const activeSave = core.importSave(readFileSync(new URL('ui/e2e/p07-visual-oracle-v1/s3-p07-active-run.save.json',base),'utf8'));
const duplicateRunSave = structuredClone(activeSave);
const run = duplicateRunSave.state.theatricalRuns.find(r=>r.status==='active');
assert.ok(run);
duplicateRunSave.state.theatricalRuns.push(structuredClone(run));
const duplicateRunState = core.importSave(JSON.stringify(duplicateRunSave)).state;
const controlWeek = core.tick(activeSave.state);
const duplicatedWeek = core.tick(duplicateRunState);
const controlCredits = controlWeek.ledger.slice(activeSave.state.ledger.length).filter(e=>e.kind==='studioRevenue' && e.productionId===run.productionId);
const duplicateCredits = duplicatedWeek.ledger.slice(duplicateRunState.ledger.length).filter(e=>e.kind==='studioRevenue' && e.productionId===run.productionId);
assert.equal(controlCredits.length,1);
assert.equal(duplicateCredits.length,2);
console.log(JSON.stringify({probe:'CF-03 duplicate imported active run',result:'ACCEPTED_AND_DOUBLE_CREDITED',productionId:run.productionId,controlCreditCount:controlCredits.length,duplicateCreditCount:duplicateCredits.length,extraCash:duplicatedWeek.studio.cash-controlWeek.studio.cash}));
const duplicateContractSave = structuredClone(activeSave);
const contract = duplicateContractSave.state.contracts[0];
duplicateContractSave.state.contracts.push(structuredClone(contract));
const duplicateContractState = core.importSave(JSON.stringify(duplicateContractSave)).state;
console.log(JSON.stringify({probe:'CF-04 duplicate imported contract',result:'ACCEPTED',talentId:contract.talentId,extraPayroll:core.weeklyPayroll(duplicateContractState)-core.weeklyPayroll(activeSave.state)}));
```

### gameplay-probe.mjs

```js
// Read-only audit reproduction against immutable accepted source; no runtime/service.
import './audit-loader.mjs';
import assert from 'node:assert/strict';
const base = new URL(process.env.AUDIT_TS_ROOT + '/');
const core = await import(new URL('src/core/index.ts', base));
const fixtures = await import(new URL('tests/contracts/_contractFixtures.ts', base));
const { BridgeSession } = await import(new URL('bridge/session.ts', base));

export function readyFilm() {
  let state = fixtures.minimalManagedStudio('p00p07-audit-contract-expiry');
  const writer = fixtures.contractedByRole(state, 'writer')[0];
  state = core.applyActions(state, [{kind:'commissionScript', project:fixtures.commissionPayload(state,state.concepts[0].id,writer.id)}]);
  const projectId = state.scriptDevelopment.projects[0].id;
  state = core.tick(state);
  state = core.applyActions(state, [{kind:'acceptScript',projectId}]);
  const project = core.castingPackageReadModel(state).projects.find(p => p.projectId === projectId);
  const actors = fixtures.contractedByRole(state,'actor');
  state = core.applyActions(state,[{kind:'greenlightScriptProject',production:{projectId,
    directorId:fixtures.contractedByRole(state,'director')[0].id,
    craftIds:[fixtures.contractedByRole(state,'craft')[0].id],
    cast:{lead:actors[0].id,antagonist:actors[1].id,support:actors[2].id},
    budget:{negative:project.negativeOptions[0].amount,marketing:project.marketingOptions[0].amount}}}]);
  for(let step=0;step<25;step++) {
    if(state.studio.activeProductions[0].remainingTicks === 1) return state;
    for(let guard=0;guard<8;guard++) {
      const d=core.nextStudioDecision(state);
      if(d?.kind !== 'productionOperation') break;
      state=core.applyActions(state,[d.command]);
    }
    state=core.tick(state);
  }
  throw Error('Could not reach Release Ready');
}

let state=readyFilm();
const id=state.studio.activeProductions[0].id;
const readyWeek=state.market.tick;
core.importSave(core.exportSave(core.makeSave(state)));
const committed=core.applyActions(state,[{kind:'commitPictureToRelease',productionId:id}]);
core.importSave(core.exportSave(core.makeSave(committed)));
const canceled=core.applyActions(committed,[{kind:'cancel',productionId:id}]);
assert.equal(canceled.studio.activeProductions.length,0);
assert.equal(canceled.releaseAuthority.commitments.length,1);
for(const [boundary,fn] of [['tick',()=>core.tick(canceled)],['save',()=>core.exportSave(core.makeSave(canceled))]]) {
  assert.throws(fn,/orphan/);
  try{fn()}catch(e){console.log(JSON.stringify({probe:'cancel-after-commit',boundary,error:e.message}));}
}

// Release Ready explicitly permits holding without a time cap. No cash injection,
// hand-edited contracts, private profile, or fabricated world is used.
while(state.market.tick<104) state=core.tick(state);
assert.equal(state.contracts.length,0);
const expiredSnapshot=new BridgeSession(state,'audit-expired-hold').snapshot();
assert(expiredSnapshot.availableIntents.some(i=>i.kind==='advanceWeek'));
assert(expiredSnapshot.availableIntents.some(i=>i.kind==='commitPictureToRelease'));
state=core.applyActions(state,[{kind:'commitPictureToRelease',productionId:id}]);
state=core.tick(state);
core.importSave(core.exportSave(core.makeSave(state)));
const session=new BridgeSession(state,'audit-last-film-expired-contracts');
const snapshot=session.snapshot();
const commission=core.scriptProjectsReadModel(state).commission;
const casting=core.castingPackageReadModel(state);
assert.equal(commission.writers.length,0);
assert.equal(casting.projects.length,0);
assert(!snapshot.availableIntents.some(i=>['advanceWeek','signContract','signFoundingContract','commissionScreenplay','commissionOriginalScreenplay'].includes(i.kind)));
const candidate=core.hiringMarketIds(state)[0];
assert(candidate);
const offer=core.contractOfferOptions(state,candidate)[0];
const recovered=core.applyActions(state,[{kind:'signContract',talentId:candidate,termWeeks:offer.termWeeks}]);
assert.equal(core.scriptProjectsReadModel(recovered).commission.canStart,true);
console.log(JSON.stringify({probe:'last-film-after-contract-expiry',readyWeek,week:state.market.tick,cash:state.studio.cash,contracts:state.contracts.length,
  liveProductions:state.studio.activeProductions.length,readyCastingProjects:casting.projects.length,commissionWriters:commission.writers.length,
  commissionBlockers:commission.blockers.map(b=>b.kind),availableIntentKinds:snapshot.availableIntents.map(i=>i.kind),
  activeTheatricalRuns:state.theatricalRuns.filter(r=>r.status==='active').length,
  legalCoreHire:{talentId:candidate,bonus:offer.signingBonus,canCommissionAfter:true}}));

const construction=snapshot.availableIntents.find(i=>i.kind==='startConstruction');
assert(construction);
const built=session.command({protocolVersion:snapshot.protocolVersion,schemaId:snapshot.schemaId,
  sessionId:session.sessionId,commandId:'audit-build-last-option',expectedStateRevision:session.stateRevision,
  type:'submitIntent',payload:{intentId:construction.intentId}});
assert.equal(built.accepted,true);
assert.deepEqual(built.availableIntents,[]);
console.log(JSON.stringify({probe:'only-visible-option-does-not-recover',accepted:built.accepted,
  week:built.gameWeek,cash:session.gameState.studio.cash,availableIntentKinds:built.availableIntents.map(i=>i.kind),
  construction:session.gameState.placement.facilities.map(f=>({status:f.status,completesWeek:f.completesWeek}))}));

let estate=readyFilm();
estate=core.applyActions(estate,[{kind:'startDevelopmentCastingAnnex'}]);
const finishes=estate.placement.facilities[0].completesWeek;
while(estate.market.tick<finishes) estate=core.tick(estate);
const burn=core.weeklyBurn(estate);
const opex=core.weeklyPlacementOperatingCost(estate.placement);
const next=core.tick(estate);
const charged=estate.studio.cash-next.studio.cash;
assert.equal(charged,burn+opex);
assert(opex>0);
const treasury=new BridgeSession(estate,'audit-opex').snapshot().treasury;
console.log(JSON.stringify({probe:'known-facility-opex-omission',week:estate.market.tick,
  payroll:core.weeklyPayroll(estate),baseOverhead:core.weeklyOverhead(estate),shownWeeklyBurn:burn,
  facilityOpex:opex,actualNextWeekDebit:charged,shownRunway:core.runway(estate).weeks,
  actualCurrentCostRunway:Math.floor(estate.studio.cash/charged),treasury}));
```

### bridge-probe.mjs

```js
import './audit-loader.mjs';
import assert from 'node:assert/strict';
const base = new URL(process.env.AUDIT_TS_ROOT + '/');
const { BridgeSession, createBridgeInitialState } = await import(new URL('bridge/session.ts', base));
const { PROTOCOL_VERSION, SCHEMA_ID } = await import(new URL('bridge/protocol.ts', base));
const { canonicalJson } = await import(new URL('bridge/schema/canonical.ts', base));
const { decodeBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint } = await import(new URL('bridge/runtime-checkpoint.ts', base));
const { developmentProjection } = await import(new URL('bridge/development.ts', base));
const session = BridgeSession.createRuntime();
const intent = session.snapshot().availableIntents.find(i => i.kind === 'signFoundingContract');
assert.ok(intent);
const request = { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId,
  commandId: 'audit-sign-1', expectedStateRevision: session.stateRevision, type: 'submitIntent', payload: { intentId: intent.intentId } };
const first = session.command(request);
assert.equal(first.accepted, true);
const after = session.snapshot().stateDigest;
const afterContracts = session.gameState.contracts.length;
const replay = session.command(request);
assert.equal(canonicalJson(first), canonicalJson(replay));
assert.equal(session.snapshot().stateDigest, after);
assert.equal(session.gameState.contracts.length, afterContracts);
assert.equal(session.command({...request, payload:{intentId:'different'}}).reasonCode, 'COMMAND_ID_REUSE');
assert.equal(session.command({...request, sessionId:'different-session'}).reasonCode, 'SESSION_MISMATCH');
const restored = BridgeSession.fromRuntimeCheckpoint(decodeBridgeRuntimeCheckpoint(encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint())));
assert.equal(canonicalJson(restored.command(request)), canonicalJson(first));
assert.equal(restored.snapshot().stateDigest, after);
console.log(JSON.stringify({probe:'founding financial command retry, envelope conflict, cross-session, checkpoint replay', result:'PASS', contractsAdded:afterContracts, stateRevision:session.stateRevision}));

const qsession = new BridgeSession(createBridgeInitialState('p03a-quote-market'), 'audit-quote-session');
const board = developmentProjection(qsession.gameState).board;
assert.ok(board);
const concept = board.commission.concepts[0];
const writer = board.commission.writers.find(w=>w.available);
assert.ok(concept && writer);
const drafts = [];
for(let a=0;a<3;a++) for(let b=0;b<3;b++) for(let c=0;c<3;c++) drafts.push({ source:'market',conceptId:concept.id,genre:null,writerId:writer.id,
  opening:'slowSetup', midpoint:'revelation', ending:'bittersweet',intendedSegments:['adult','prestige'],intimacyCenter:a,tonalWeightCenter:b,kineticEnergyCenter:c });
const quote=(index)=>qsession.quote({protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,sessionId:qsession.sessionId,commandId:'audit-q-'+index,
  expectedStateRevision:qsession.stateRevision,type:'quoteCommission',draft:drafts[index]});
const digestBefore = qsession.snapshot().stateDigest;
const quotes = drafts.slice(0,16).map((_,i)=>quote(i));
assert.ok(quotes.every(q=>q.accepted));
const refreshed = quote(0);
assert.equal(refreshed.accepted,true);
assert.equal(refreshed.quote.intentId,quotes[0].quote.intentId);
assert.equal(quote(16).accepted,true);
assert.equal(qsession.snapshot().stateDigest,digestBefore);
const rejected = qsession.command({protocolVersion:PROTOCOL_VERSION,schemaId:SCHEMA_ID,sessionId:qsession.sessionId,
  commandId:'audit-commit-refreshed',expectedStateRevision:qsession.stateRevision,type:'submitIntent',payload:{intentId:refreshed.quote.intentId}});
assert.equal(rejected.accepted,false);
assert.equal(rejected.reasonCode,'INTENT_NOT_AVAILABLE');
assert.equal(qsession.snapshot().stateDigest,digestBefore);
console.log(JSON.stringify({probe:'CF-20 cap16 -> refresh oldest -> add17 -> commit refreshed',result:'KNOWN DEFECT REPRODUCED',reasonCode:rejected.reasonCode,durableGameplayUnchanged:true}));
```

### Invocation and retained outcome

```sh
AUDIT_TS_ROOT=file:///tmp/isolated/ts node --disable-warning=ExperimentalWarning save-probe.mjs
AUDIT_TS_ROOT=file:///tmp/isolated/ts node --disable-warning=ExperimentalWarning gameplay-probe.mjs
AUDIT_TS_ROOT=file:///tmp/isolated/ts node --disable-warning=ExperimentalWarning bridge-probe.mjs
```

All three probes exited 0 using installed Node 22.23.0 against accepted TS. Assertions deliberately expect the identified defects. Their important outcomes are recorded under each finding; bridge signing/replay controls also passed. Re-execution after a repair should change the defect-expecting assertions rather than preserving a failing product behavior as the intended rule.
