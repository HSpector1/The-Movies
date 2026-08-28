# Project: Studio — P05A Readiness Gate 00

**Revision:** P05A-READINESS-GATE-00-r1-PROVISIONAL

**Readiness judgment:** PROVISIONAL READY; P05 execution is currently NO-GO

**Scope:** Static/headless maintenance adjudication and implementation planning only

**Authority base:** TypeScript 9b196f799de969932ca3dfdc1f5bb9ae82819b3f

**Date:** 2026-08-28

## 1. Executive readiness judgment

The smallest safe technical gate between final P04A.2 acceptance and P05 is **two tightly coupled
bridge-contract changes**, not a maintenance campaign:

1. **CF-08:** make union-to-C# generation fail closed or emit an explicitly supported
   discriminated representation; incompatible object members may never be flattened by silently
   selecting the first member.
2. **CF-09:** bind generated-contract verification to the exact, sealed Unity consumer through a
   non-self-referential contract manifest plus a post-commit attestation that records both repository
   SHAs and clean-state evidence.

No third independent pre-P05 change survived the dependency test. A union fixture, member-specific
serializer round-trips, output containment, wrong-root rejection, and exact consumer hashing are
acceptance proofs for CF-08/CF-09, not additional maintenance scope.

The static audit's other proposed pre-P05 work is reclassified:

- CF-07 belongs in P05 Wave 0 because P05 expands the same snapshot/projection assembly seam.
- CF-12 belongs in P05 Wave 1 as the exact-ID body-index foundation consumed by the later N-Stage
  presence work.
- CF-14 contributes only a small evidence primitive and manifest adopter in P05; it does not justify
  a general proof-platform rewrite.
- CF-10 is fixed incrementally when P05 creates risk-bearing Presentation code and typed tests; a
  whole Presentation assembly migration is not a readiness prerequisite.
- CF-03 must be fixed before P07/release, where theatrical settlement is actually consumed. P05
  stops at the Post handoff and neither reads nor changes theatrical settlement.
- CF-04, CF-05, and CF-20 remain real defects, but none is a P05 product or architecture dependency.

This is a planning-ready result, not permission to start P05. The pushed P04A.2 heads are
**UNSEALED FORWARD EVIDENCE**. The Unity handoff at the pushed head is explicitly NOT READY, Owner
acceptance has not been supplied, and the final accepted TypeScript and Unity SHAs do not yet exist.
P05 remains NO-GO until Section 14 is fully satisfied.

Readiness is estimated at **72–80% (central estimate 76%)**. The authority, collision boundary,
two-change gate, and proof plan are defined. The remaining readiness work is: technical P04A.2 seal,
Owner acceptance, final P04A.2 SHAs and changed paths, one bounded changed-path reconciliation around
the two-change static contract gate, final post-gate P05 starting SHAs, and a clean-worktree/worker-
charter check. This percentage measures readiness to begin P05, not P05 implementation progress.

No Unity editor, Unity batchmode, packaged player, bridge, supervisor, browser play task, HID tool, or
screen-control mechanism was used for this adjudication.

## 2. Exact inspected authorities

Authority precedence was applied exactly as instructed: Owner rulings; Package 05 main design;
Builder Annex; final P05 recon when r2 exists; accepted Unity architecture audit; accepted P04
implementation; current code; then static-audit recommendations. Static-audit severity is risk
evidence, not maintenance authorization.

| Authority/evidence | Exact revision or identity | Status and use |
|---|---|---|
| Current Owner readiness brief | This assignment, 2026-08-28 | Controlling scope, classifications, output, and no-runtime law |
| Package 05 main design | d5653327c17709daea5e17ba00ce164678b9ad43:docs/design/CODEX-PRODUCTION-SHOOTING-PACKAGE-05.md | Product law |
| Package 05 Builder Annex | d5653327c17709daea5e17ba00ce164678b9ad43:docs/design/CODEX-PRODUCTION-SHOOTING-PACKAGE-05-BUILDER-ANNEX.md | Builder detail beneath the main design |
| P05A implementation reconnaissance | 9b72981205a90bcac52ff2ab1bb248e9d16edd72:docs/engineering/CODEX-P05A-IMPLEMENTATION-RECONNAISSANCE.md | P05A-RECON-r1-PROVISIONAL; forward plan pending r2 |
| Current forward static audit | ee522834bd134280469eeb3878765e9f575018cf:docs/engineering/CODEX-CURRENT-FORWARD-CODEBASE-STATIC-AUDIT-01.md | Risk evidence adjudicated here |
| Unity Production Architecture Audit | 8110820d96ddf2089df582bc0a0a92d3d4cf17d9:docs/engineering/CODEX-UNITY-PRODUCTION-ARCHITECTURE-AUDIT-01.md | Accepted architecture law |
| P04A final reconnaissance | 44b0c8d0440fd683910d1ecd5a6365eaa49d82fc:docs/engineering/CODEX-P04A-IMPLEMENTATION-RECONNAISSANCE.md | P04 implementation intent and inherited seams |
| Accepted TypeScript starting point | 9b196f799de969932ca3dfdc1f5bb9ae82819b3f | Documentation branch base and accepted campaign authority |
| Accepted Unity starting point | 629090c066a4345acb197193103760cc21a43965 | Accepted Unity authority, inspected read-only |
| UX North Star | /Users/bruce/Downloads/P03A3_UX_ACCEPTANCE_AND_UI_NORTH_STAR.md; SHA-256 d8eca9f3fe7cd61fc2d310ab15d82f3aba9b5ce7e7ae9b34f6d762caaa5f0d82; 31,633 bytes; modified 2026-08-25T21:39:03+0200 | Unversioned local draft; UX direction only beneath committed authority |
| P04A.2 TypeScript WIP | remote branch hspector-github/wip/p04a2-writer-credit-deadlock-ts-20260828 at c42076909b2b3bda3e278c21e87f291097ee7dee | **UNSEALED FORWARD EVIDENCE** |
| P04A.2 Unity WIP | remote branch origin/wip/p04a2-writer-credit-deadlock-client-20260828 at cae21ff4974dde015b510697ee7adf9538574f18 | **UNSEALED FORWARD EVIDENCE**; head is a documentation-only handoff |
| P04A.2 Unity product tip named by handoff | c3f7ff05425d482d9f706ba510c6a731b8dcf79a, parent of cae21ff | **UNSEALED FORWARD EVIDENCE**; product/build source named in P04A2-RESUME.md |
| P04A.2 handoff | cae21ff4974dde015b510697ee7adf9538574f18:P04A2-RESUME.md | Explicit status NOT READY; read-only |
| Inherited P04A.1 resume/handoff | cae21ff4974dde015b510697ee7adf9538574f18:P04A1-OWNER-INPUT-REMEDY-RESUME.md | Read-only seam/proof history; its status block says it is superseded, so it is not current acceptance authority |

The pushed WIP heads were verified against their remotes with read-only remote-ref queries. The WIP
handoff reports three unresolved foreground gates: inherited real-input Journeys A+B fail at the
Casting-open seam, menu Journeys C+D fail at the same seam, and the one-layer Escape journey was not
run. A control build at accepted Unity 629090c failed identically; that is useful forward evidence,
but only the Owner can adjudicate acceptance.

Direct accepted-baseline inspection established:

| Contract fact | Accepted value | P04A.2 WIP observation |
|---|---|---|
| Protocol version | 4 | unchanged |
| Projection/snapshot version | 11 | unchanged |
| Schema ID | sha256:01f15efc8fc33fd810b051242857385ca23b5e1c775b357db1bfe5a70e907e1e | unchanged |
| Current save version | 15 | unchanged |
| TypeScript generated C# SHA-256 | 97dd666de7f8fe447ed24e0fe28e6ba7aa30701cf8bc45e13d60e453d8b9a32f | unchanged |
| Actual Unity generated C# SHA-256 | 97dd666de7f8fe447ed24e0fe28e6ba7aa30701cf8bc45e13d60e453d8b9a32f | unchanged |

These matching hashes prove no cross-repository generated-C# byte drift at the inspected commits;
they do not by themselves prove canonical-schema or DTO semantic correctness. They also do not close
CF-09 because the default automated check still does not bind the actual Unity consumer. The accepted
TypeScript authority is the static audit's b870a71 code plus a documentation-only change, so the
inspected TypeScript findings remain present. Direct inspection at Unity 629090c confirmed the union
workarounds, lack of a Presentation assembly definition, scene-wide writer-body search, and
inconsistent evidence primitives also remain present.

## 3. What remains before P05

Only the following readiness work remains:

1. **P04A.2 technically seals.** Its active lead completes or obtains an Owner ruling on the
   outstanding foreground gates and publishes clean final TypeScript and Unity SHAs.
2. **The Owner accepts P04A.2.** A pushed WIP or technically green subset is not accepted authority.
3. **The r2 changed-path reconciliation begins but remains provisional.** It consumes only the final
   P04A.2 delta plus the accepted-629 seam ledger in Section 9.
4. **The two-change static contract mini-checkpoint lands on the accepted P04A.2 pair.** CF-08 and
   CF-09 must be green before any P05 contract edit.
5. **Only the mini-gate delta is reconciled, then P05A-RECON-r2-FINAL is stamped.** It records both
   the Owner-accepted P04A.2 pair and the clean post-gate P05 starting pair.
6. **The P05 implementation charter pins those starting SHAs, one-owner collision files, and wave
   entry/exit law.**
7. **All implementation worktrees are clean and isolated.**

The following do **not** remain before P05: theatrical-run repair, general contract-set cleanup,
authored-talent allocator cleanup, broad Presentation assembly restructuring, import-cycle cleanup,
browser UI splitting, general evidence-runner migration, pointer-picking optimization, renderer or
Addressables migration, DOTS, Post or release implementation, and full campaign replay.

## 4. Static-audit adjudication table

### 4.1 Final classifications

| Finding | Final classification | Timing ruling |
|---|---|---|
| CF-03 | **D. COMPLETE BEFORE P07 / RELEASE** | Theatrical settlement is downstream of P05 and P06; fix before release is implemented or accepted |
| CF-04 | **E. STANDALONE MAINTENANCE LATER** | Real save-integrity defect, no P05 seam or dependency |
| CF-05 | **E. STANDALONE MAINTENANCE LATER** | Small allocator repair, but unrelated to P05 and currently collides with protected actions.ts |
| CF-07 | **B. FOLD INTO P05 WAVE 0 OR WAVE 1** | Wave 0 single-poll build context; no cross-poll cache |
| CF-08 | **A. MUST FIX BEFORE P05** | First half of the two-change bridge-contract mini-checkpoint |
| CF-09 | **A. MUST FIX BEFORE P05** | Second half of the two-change bridge-contract mini-checkpoint |
| CF-10 | **F. FIX WHEN TOUCHING AREA** | Typed P05 code/tests only; reject wholesale Presentation migration |
| CF-12 | **B. FOLD INTO P05 WAVE 0 OR WAVE 1** | Wave 1 exact-ID body index, later consumed by Stage presence |
| CF-14 | **B. FOLD INTO P05 WAVE 0 OR WAVE 1** | Wave 1 minimum evidence primitive/manifest adopter, not a runner rewrite |
| CF-20 | **F. FIX WHEN TOUCHING AREA** | Fix only when the quote-retention path is owned; P05 adds no quote |

### 4.2 Required finding records

#### CF-03 — Theatrical-run duplicate settlement/invariants

| Required field | Adjudication |
|---|---|
| Final classification | **D. COMPLETE BEFORE P07 / RELEASE** |
| Exact files/symbols | src/core/save.ts: v8TheatricalRun, checkV8LiveState, validateSaveV15; src/core/tick.ts: tick settlement loop; src/core/economyView.ts: runNextWeekRevenue, expectedWeeklyRunRevenue; src/core/studioRunRecap.ts: studioRunRecap, runByProd |
| Exact P05 dependency | **None.** P05 ends at Wrap/Post handoff; it neither creates release rows nor consumes theatrical-run settlement. |
| Why it must/must not precede P05 | The defect can double settlement and let recap collapse contradictory rows, but repairing it before P05 does not de-risk a P05 seam. The correct hard boundary is before P07/release consumes and expands this model. |
| Likely P05 collision | Direct if the repair edits src/core/tick.ts, which P05 Wave 1 changes for scenery arrival. Keep the eventual invariant implementation validator-owned in save.ts and use tick only as a parity test; do not mix the fixes. |
| Player risk | High if malformed/imported state contains duplicate runs: double cash/revenue with one visible recap row. No ordinary P05 path creates the row. |
| Engineering risk | Medium: stronger validation may reject old malformed saves and requires explicit compatibility/error behavior. |
| Recommended implementation shape | Add validator-owned validateTheatricalRunSet after row validation in save.ts. Index runs and releases once by productionId; reject duplicate run IDs; require exact release correlation; enforce model-specific index/status/cumulative-gross/share invariants; preserve explicit model-0 compatibility. Do not change tick logic merely to mask an accepted-state defect. |
| Static/headless tests | V8–V15 mutation fixtures; duplicate run; missing/mismatched release; negative/bounded finance; model-0 compatibility; one accepted production equals one tick credit, one economy contribution, and one recap row. |
| Unity compilation eventually required | No. |
| Runtime simulation required | No; deterministic Node/TypeScript state transitions are sufficient. |
| Estimated effort | 4–8 hours plus compatibility review. |
| Stop condition | Every supported valid fixture round-trips; every incoherent set fails at import/save validation; tick/economy/recap prove one settlement stream per production. |

#### CF-04 — Contradictory contract rows

| Required field | Adjudication |
|---|---|
| Final classification | **E. STANDALONE MAINTENANCE LATER** |
| Exact files/symbols | src/core/save.ts: v8Contract, checkV8LiveState; src/core/employment.ts: activeContract, weeklyPayroll, annualPayroll; src/core/tick.ts: tick payroll/overhead/expiry steps; src/core/actions.ts: applySignContract, applyRenewContract; src/core/types.ts: Contract |
| Exact P05 dependency | **None.** P05 consumes accepted employment/presence truth but does not create, renew, migrate, or reinterpret contract rows. |
| Why it must/must not precede P05 | Double payroll from malformed rows is real, but a separate pre-P05 checkpoint would tighten import law without reducing P05 collision or proof burden. |
| Likely P05 collision | actions.ts is protected by P04A.2 now; otherwise no planned P05 contract-management ownership. |
| Player risk | Duplicate payroll/overhead and contradictory employment display after malformed import or migration. |
| Engineering risk | Medium because a stricter set validator can reject historically accepted malformed saves. |
| Recommended implementation shape | Add validateContractSet after row validation. Index by talentId; require canonical term/end arithmetic, non-negative money/weeks, every retained row to be current-active, at most one retained row per talent, and contract/free-agent consistency. If historical rows must remain, separately change overhead to use the same validated active-contract count; never leave raw state.contracts.length as a divergent charge. |
| Static/headless tests | Duplicate active; expired/future retained row; overlapping range; negative pay; term/end mismatch; active/free-agent contradiction; V8–V15 valid fixture round-trips; payroll/employment/**overhead** parity. |
| Unity compilation eventually required | No. |
| Runtime simulation required | No. |
| Estimated effort | 2–4 hours plus migration-fixture review. |
| Stop condition | Contradictory sets fail closed while every valid legacy fixture and ordinary sign/renew path still saves and produces one payroll interpretation. |

#### CF-05 — Authored-talent ID collision

| Required field | Adjudication |
|---|---|
| Final classification | **E. STANDALONE MAINTENANCE LATER** |
| Exact files/symbols | src/core/actions.ts: authoredTalentId, applyCreateTalent, applyCreateCustomTalent, applyCreateBalancedTalent, withCreatedTalent; src/core/save.ts: talent-ID uniqueness in checkV8LiveState |
| Exact P05 dependency | **None.** P05 joins existing exact talent IDs and does not allocate authored talent. |
| Why it must/must not precede P05 | A reserved-prefix collision can make a valid state unsavable after an ordinary creator action, but P05's presence registry neither creates nor renumbers talent. |
| Likely P05 collision | src/core/actions.ts is an active P04A.2 path and later a narrow P05 scenery path. Mixing allocator work into either increases review scope. |
| Player risk | Low-frequency but severe for the affected state: the next talent creation makes save fail. |
| Engineering risk | Low if the existing production-ID collision-skipping pattern is reused. |
| Recommended implementation shape | Replace count-derived allocation with nextAuthoredTalentId over a Set of all current talent IDs; advance deterministically until unused; preserve the authored prefix and ordering. |
| Static/headless tests | Reserved-prefix collision; multiple occupied ordinals/gaps; deterministic replay; every creator action immediately passes makeSave/export/import. |
| Unity compilation eventually required | No. |
| Runtime simulation required | No. |
| Estimated effort | 1–2 hours. |
| Stop condition | No creator action can emit an existing ID and all creator outputs remain deterministic/saveable. |

#### CF-07 — Repeated bridge validation, serialization, hashing, and projection

| Required field | Adjudication |
|---|---|
| Final classification | **B. FOLD INTO P05 WAVE 0 OR WAVE 1** — Wave 0 |
| Exact files/symbols | bridge/session.ts: authoritativeDigest, snapshotFor, resolveAvailableIntents; ui/src/engine/adapter.ts: exportSaveJson, studioLotSnapshot; src/core/save.ts: makeSaveV15, makeSave, exportSave; bridge/server.ts: createHttpServer health/session/snapshot handlers |
| Exact P05 dependency | P05 materially expands the existing Production projection and available-intent resolution assembled by snapshotFor. Without a shared build context, poll count multiplies the new work. |
| Why it must/must not precede P05 | It should not be a separate gate because P05 owns the same adapter/session cut and must prove byte parity there. Implementing it twice would increase collision. It should precede the P05 projection expansion inside Wave 0. |
| Likely P05 collision | Very high in ui/src/engine/adapter.ts and bridge/session.ts. Both require one integration owner; adapter.ts remains protected until P04A.2 seals. |
| Player risk | Poll-driven latency/GC growth and misleading metrics; not a current authority-correctness failure. |
| Engineering risk | Medium. A mutable or under-keyed cross-poll cache can leak revisions/sessions and is worse than duplication. |
| Recommended implementation shape | Construct one immutable SnapshotBuildContext per response/poll with revision, one validated V15 save, canonical save JSON, digest, and lot projection. Pass it through intent/projection assembly. Add a cheap authorityHead for health/session if it can preserve response law. Measure actual encoded response bytes. **Do not add cross-poll caching in this tranche.** |
| Static/headless tests | Snapshot bytes, intent IDs, digest, and ordering unchanged; validation/projection/hash invocation counts bounded to one per build; both /health and /session exclude full projection; metrics equal actual encoded payload; session/load/command parity. |
| Unity compilation eventually required | No if wire shape is unchanged; yes only if metrics/response schema is deliberately changed, which this tranche should avoid. |
| Runtime simulation required | No. A headless benchmark may measure benefit but is not product acceptance. |
| Estimated effort | 0.5–1.5 focused days. |
| Stop condition | One poll builds one validated context, byte/intent parity is exact, actual-byte metrics are honest, and no cross-poll cache or new invalidation matrix exists. |

#### CF-08 — Union-to-C# generation

| Required field | Adjudication |
|---|---|
| Final classification | **A. MUST FIX BEFORE P05** |
| Exact files/symbols | scripts/generate-bridge-contract.ts: objectShape, csharpType, vocabulary/class emission; bridge/schema/bridge-schema.ts: StudioBridgeQuoteRequest, StudioQuoteSnapshot and future P05 unions; generated/unity/StudioBridgeDtos.Generated.cs; Unity Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs; Assets/Studio/Runtime/Data/StudioBridgeProtocol.cs: StudioBridgeQuoteResponse.NormalizeAndValidate, StudioBridgeJson.Quote; Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs: RequestCastingQuote; Assets/Studio/Tests/EditMode/StudioBridgePlayerWorkflowTests.cs workaround assertion |
| Exact P05 dependency | P05 must extend the closed generated Production contract. Current objectShape explicitly selects candidates[0] for incompatible same-named union properties, so a valid P05 member could disappear or receive the wrong C# type. |
| Why it must/must not precede P05 | Fixing the generator against the current unchanged schema isolates generator correctness from the later P05 schema diff. Combining them would make an incomplete generated DTO harder to diagnose and review. |
| Likely P05 collision | Generated C#, schema, quote consumers, and protocol tests are bridge-integrator files. Work starts only after P04A.2 seals; regenerate once and review the complete diff. |
| Player risk | A field can deserialize incorrectly or vanish at the Unity boundary, causing withheld/wrong actions or presentation after an otherwise valid TypeScript contract change. Current member-specific workarounds reduce today's exposure but do not make generation sound. |
| Engineering risk | Medium–high because changing union emission can alter generated public DTOs and serializer consumers. |
| Recommended implementation shape | Build a member/property/type matrix. Merge only demonstrably compatible optional/null fields and literal discriminant vocabularies. For incompatible fields, either emit a reviewed explicit discriminated representation/member-specific DTO path or fail with the union name, member paths, property, and competing types. Remove reliance on the unsafe aggregate quote DTO where member-specific DTOs already exist. No generic first-member allowlist. |
| Static/headless tests | Negative fixtures for genuinely conflicting primitive, reference, array-item, and nested underlying types; positive fixtures for the same type with differing requiredness/nullability; complete discriminant vocabulary; current compatible-union equality; schema-generation determinism; Newtonsoft strict round-trip for every quote member. |
| Unity compilation eventually required | **Yes.** Compile and run focused EditMode serializer/protocol tests against the regenerated actual consumer. |
| Runtime simulation required | No packaged player or gameplay simulation. |
| Estimated effort | 1–2 focused days. |
| Stop condition | Every incompatible object union either has an explicit tested representation or produces a deterministic diagnostic; all current quote members round-trip; generated output is fully reviewed and Unity compiles. |

#### CF-09 — Verification does not bind the actual Unity consumer

| Required field | Adjudication |
|---|---|
| Final classification | **A. MUST FIX BEFORE P05** |
| Exact files/symbols | scripts/generate-bridge-contract.ts: root, unityProject, unityCsharpPath, checkOrWrite, outputs; package.json: generate:bridge-contract and check:bridge-contract; .github/workflows/bridge-contract.yml: Verify generated bridge contract; TypeScript generated/unity/StudioBridgeDtos.Generated.cs; Unity Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs |
| Exact P05 dependency | P05 changes schema/generated DTOs across two repositories. The repository-local green check can currently coexist with a stale or wrong Unity checkout. |
| Why it must/must not precede P05 | Establishing exact-consumer proof before P05's first schema edit makes every later contract diff mechanically bound to the intended sealed Unity repository. |
| Likely P05 collision | Same bridge-integrator ownership as CF-08. It must use the final P04A.2 Unity SHA, not the current WIP or an uncommitted checkout. |
| Player risk | Unity can run stale contract bytes and fail/withhold valid P05 fields even while TypeScript CI is green. Current hashes match, so this is a proof gap rather than current drift. |
| Engineering risk | Low–medium; primary hazards are wrong-root acceptance, path escape, ambiguous dirty policy, and a manifest sampled after generation rather than bound to it. |
| Recommended implementation shape | Emit a non-self-referential tracked contract manifest containing contract ID, protocol, projection, full schema ID, generated C# SHA-256, and expected relative consumer path. The strict paired-root checker then emits a post-commit checkpoint attestation containing the exact TypeScript SHA, Unity SHA, clean/dirty evidence, resolved roots, and manifest/hash result outside the tracked tree or under an explicit proof-output ignore rule. Require an explicit Unity root; resolve real path; verify ProjectSettings/ProjectVersion.txt and repository identity; enforce output containment; reject dirty/wrong-SHA/wrong-root/stale consumer; retain fast local generation separately. |
| Static/headless tests | Correct sealed root passes; wrong repository, wrong SHA, dirty checkout, missing marker, symlink/path escape, stale C#, altered manifest, and hash mismatch fail; local artifact still checks without a Unity checkout. |
| Unity compilation eventually required | The parity checker alone does not require it; the combined CF-08/09 checkpoint requires one compile/EditMode pass against the verified consumer. |
| Runtime simulation required | No. |
| Estimated effort | 0.5–1 day. |
| Stop condition | A green integration check names both sealed SHAs and cannot pass unless the exact consumer bytes at the contained canonical path equal generated bytes and the manifest hash. |

#### CF-10 — Typed Presentation test boundary

| Required field | Adjudication |
|---|---|
| Final classification | **F. FIX WHEN TOUCHING AREA** |
| Exact files/symbols | Assets/Studio/Runtime/Presentation directory assembly layout; Assets/Studio/Tests/EditMode/Studio.Tests.EditMode.asmdef; StudioCastingGreenlightTests.cs; Presentation/UI/StudioCastingWorkspace.cs: Configure; Presentation/UI/StudioWorkspaceHost.cs configuration; future P05 Stage registry/workspace contracts |
| Exact P05 dependency | P05 needs compiler-checked tests for new Stage truth, exact-ID registry, operation routing, and workspace state. It does **not** need every legacy Presentation type moved into one assembly before work starts. |
| Why it must/must not precede P05 | A wholesale asmdef move can expose dependency cycles and serialized-type assumptions before a feature seam exists. Create a narrow named P05 presentation/testable-core boundary when the first P05 Unity type is authored, then migrate only touched risk-bearing logic. |
| Likely P05 collision | Final P04 host, Casting workspace, bootstrap, menu/input, and tests are protected/integration-owned. New P05 types can be isolated; existing host adapters remain one-owner cuts. |
| Player risk | Reflection/source-text tests can miss composed frame/lifecycle defects. The risk rises with P05 Stage/workspace interactions. |
| Engineering risk | Medium–high for a broad move; low–medium for a new dependency-light Production presentation assembly/core. |
| Recommended implementation shape | Prefer a narrow Studio.Runtime.ProductionPresentation named assembly, or an equivalently typed pure-contract assembly, that depends only on existing named Data/Infrastructure seams and Unity modules. Evidence may observe/test Production seams; Production code must not depend on Evidence. The default Presentation integration layer may consume the typed core. Reference it directly from EditMode tests. Do not migrate unrelated IMGUI/Casting/Stage proof files merely to improve counts. |
| Static/headless tests | Assembly graph/source check; direct typed tests for immutable Stage truth, exact-ID registry, stale clear/replace, owner-matched presence, workspace state, and lifecycle subscriptions; retain only necessary reflection at legacy adapters. |
| Unity compilation eventually required | **Yes**, plus focused EditMode tests. |
| Runtime simulation required | Not for the assembly boundary; composed behavior is covered later by the bounded packaged matrix. |
| Estimated effort | 1–2 days spread across the first P05 Unity seams; no all-at-once migration. |
| Stop condition | All newly added risk-bearing P05 presentation logic is compiler-referenced by tests, no new source-text assertions guard behavior, and unrelated Presentation files remain unmoved. |

#### CF-12 — Scene-wide writer-body searches

| Required field | Adjudication |
|---|---|
| Final classification | **B. FOLD INTO P05 WAVE 0 OR WAVE 1** — Wave 1 |
| Exact files/symbols | Assets/Studio/Runtime/Presentation/StudioWriterPresencePresentation.cs: Update, UpdateNameplate, ResolveBody; StudioBridgePresentation.cs: personSlots, TryGetAuthoritativePersonStableId, CacheSceneObjects, ApplyPeople/SnapshotApplied lifecycle; StudioPersonPresentationSlot.cs; future Stage/person presence registry |
| Exact P05 dependency | P05 must route exact named Production presence to one lot-wide body per talentId. That is the same ownership needed to remove ResolveBody's per-frame FindObjectsByType fallback. |
| Why it must/must not precede P05 | A separate checkpoint would build an index and then replace it during P05 presence work. Build the reusable index in Wave 1 and make later Stage presence consume it. |
| Likely P05 collision | StudioBridgePresentation.cs is integration-only; person body/presence files have one Activity/Presence owner. No work before P04A.2 seal. |
| Player risk | Persistent CPU/GC spikes when a legitimate writer body is missing; larger P05 casts amplify the path. Missing bodies must remain presentation-only, never a production blocker. |
| Engineering risk | Medium: stale bodies, duplicate IDs, late spawn/rebind, session reset, and negative caching must fail closed. |
| Recommended implementation shape | Promote/extend the accepted StudioBridgePresentation.personSlots dictionary as the **single** lot-wide exact-ID person-body index. Add typed body/Transform lookup and explicit refresh/withdraw lifecycle around ApplyPeople/snapshot application. Resolve only an active body whose stable ID matches exactly. Cache a missing result only for the current presentation revision and invalidate on body registration, snapshot application, removal, and session reset. Writer and P05 presence consume this owner; Stage controllers never clone named bodies or create a second registry. |
| Static/headless tests | Duplicate-ID withholding; exact lookup; missing lookup count; repeated missing lookup performs no scene scan; late spawn/rebind; inactive/destroyed removal; snapshot/session invalidation; one body per talentId across two Stages. |
| Unity compilation eventually required | **Yes**, plus focused EditMode tests. |
| Runtime simulation required | No separate runtime gate; the final P05 packaged matrix verifies visible routing. |
| Estimated effort | 0.5–1 day. |
| Stop condition | No steady Update path calls FindObjectsByType for a named body; missing/duplicate/late bodies behave deterministically; two Stage rows cannot create or claim two bodies for one talentId. |

#### CF-14 — Duplicated evidence/artifact provenance and atomic writes

| Required field | Adjudication |
|---|---|
| Final classification | **B. FOLD INTO P05 WAVE 0 OR WAVE 1** — Wave 1 minimum slice |
| Exact files/symbols | Assets/Studio/Runtime/Evidence/StudioRuntimeEvidenceReport.cs: StudioRuntimeCaptureArtifact; StudioRuntimeEvidenceBootstrap.cs: capture/write path and WriteReport; Presentation/StudioStageVisualProofRunner.cs: TryBuildArtifact, DurableCaptureArtifactsPassed, DurableArtifactMatches; StudioPlayerJourneyProofRunner.cs: WriteJsonAtomically; Presentation/UI/StudioUiElementRegistry.cs: Publish, Withdraw, Entries; Presentation/UI/StudioWorkspaceHost.cs: MaybeEmitElementMap; final P04 build-manifest/proof scripts |
| Exact P05 dependency | P05's six-state Visual Oracle must bind screenshots to the exact authority, build, process/run, viewport, and IDs. It does not need a general migration of every old runner. |
| Why it must/must not precede P05 | The primitive is best proven by the new P05 runner that needs it. A standalone proof-platform checkpoint adds migration risk without improving the first consumer. The small utility/manifest contract can land in Wave 1 before visual evidence begins. |
| Likely P05 collision | Existing P04 proof files and element-map paths remain protected until seal. New helpers belong in the existing Studio.Runtime.Evidence assembly; the new P05 runner is the first adopter. |
| Player risk | Indirect but material to acceptance: a stale/truncated/mismatched screenshot can falsely bless a visual state. |
| Engineering risk | Low–medium if limited to low-level durability/provenance; high if giant checkpoint runners are generalized. |
| Recommended implementation shape | Extend the evidence assembly with immutable artifact descriptors containing SHA-256, bytes, dimensions, and media type; same-directory atomic JSON write; bounded read-after-write verification; and a manifest envelope with run ID, authority revision/digest, viewport, and scenario IDs. The envelope must reference/embed the verified CF-09 contract-manifest identity and the final post-gate/P04 process-build attestation; it may copy their values for evidence but may not mint a second SHA/schema authority. Adopt it in the focused P05 runner only. Do not rewrite the Stage runner's journey law. |
| Static/headless tests | Interrupted write; concurrent reader; stale directory; tampered artifact; wrong dimensions/hash; manifest/schema mismatch; path containment; successful atomic reread; one small P05 fixture adopter. |
| Unity compilation eventually required | **Yes**, plus Evidence/EditMode tests. |
| Runtime simulation required | The primitive does not; the six Visual Oracle captures do require one bounded packaged run later. |
| Estimated effort | 0.5–1 day for the P05 slice; broader runner migration remains later maintenance. |
| Stop condition | Every accepted P05 screenshot/report is atomically written, re-read, hash-verified, and bound to one exact run/build/authority/scenario; no legacy runner is migrated without a separate need. |

#### CF-20 — Quote-recency eviction

| Required field | Adjudication |
|---|---|
| Final classification | **F. FIX WHEN TOUCHING AREA** |
| Exact files/symbols | bridge/session.ts: opaqueIntentId, BridgeSession.quote, capPendingQuotes, quotedIntentFor, BridgeSession.command |
| Exact P05 dependency | **None.** Package 05 explicitly forbids a new Production quote; P05 uses current opaque intents. |
| Why it must/must not precede P05 | The fresh-quote eviction bug is real, but sharing a file with P05 intent work is not itself a dependency. Fix when quote retention is owned, not as a hidden P05 deliverable. |
| Likely P05 collision | bridge/session.ts is P05 integration-owned, but resolveAvailableIntents is a different symbol. Keep the change separate unless the same owner deliberately takes the quote path with its full test. |
| Player risk | At the 16-entry cap, a just-refreshed oldest quote can become immediately uncommittable. |
| Engineering risk | Low. Map insertion order must be updated without changing deterministic intent IDs. |
| Recommended implementation shape | Centralize rememberPendingQuote: delete an existing key before set, then evict from the front while size exceeds the cap. |
| Static/headless tests | Exactly 16 entries; refresh oldest; add seventeenth; refreshed intent remains and commits; deterministic ID unchanged; cap remains 16. |
| Unity compilation eventually required | No. |
| Runtime simulation required | No. |
| Estimated effort | 30–60 minutes. |
| Stop condition | Re-quote refreshes recency, cap semantics are deterministic, and the refreshed intent survives the next insertion and commits. |

## 5. Mandatory pre-P05 work

The mandatory work is exactly CF-08 plus CF-09 after P04A.2 seal. It is a bridge-contract safety gate,
not a product or infrastructure wave.

### Entry

- Owner-accepted final TypeScript and Unity SHAs exist.
- Both final worktrees are clean.
- The provisional r2 pass has pinned the accepted P04A.2 protocol, projection, schema ID, save
  version, generated DTO shape, and actual Unity consumer path from changed paths; the document is
  not stamped FINAL until the mini-gate delta is reconciled.
- No active P04A.2 file remains under another lead.

### Implementation shape

1. Add failing generator fixtures for incompatible union properties and complete discriminants.
2. Replace first-member-wins with explicit compatibility analysis.
3. Use member-specific quote DTOs or another reviewed explicit discriminated representation where
   the current aggregate is unsound.
4. Regenerate once; inspect the whole generated diff and every consumer change.
5. Emit the non-self-referential tracked contract-consumer manifest containing contract identity,
   generated hash, and canonical relative consumer path; keep repository SHAs and clean-state
   evidence in a post-commit attestation outside the tracked tree or in an explicitly ignored proof
   directory.
6. Add the exact-root/contained-path/clean-SHA/hash verifier and post-commit checkpoint attestation.
   Add a CI integration checkout only if repository access and credentials are explicitly available;
   the strict paired-worktree gate is mandatory regardless.
7. Run Node generator/schema/protocol tests and strict Newtonsoft member round-trips.
8. Run one future authorized Unity batch compile and focused EditMode protocol suite against the
   manifest-verified consumer. No packaged player, real HID, or Owner playtest is required.

### Likely one-owner paths

- TypeScript bridge integrator: scripts/generate-bridge-contract.ts; focused generator fixtures/tests;
  package.json; .github/workflows/bridge-contract.yml; any new contract-manifest/check script;
  bridge/schema canonical artifacts; generated/unity/StudioBridgeDtos.Generated.cs.
- Unity bridge integrator: Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs;
  Assets/Studio/Runtime/Data/StudioBridgeProtocol.cs only if member-specific use changes;
  focused EditMode protocol/workflow tests.

### Exit

- The generator cannot silently flatten an incompatible union.
- Every current quote member serializes and deserializes strictly.
- The fast repository-local check remains.
- The integration check names both exact sealed SHAs and rejects wrong root, wrong SHA, dirty state,
  path escape, stale output, and manifest/hash mismatch.
- Generated TypeScript-repository and actual Unity-consumer C# bytes match.
- Unity compiles and focused EditMode protocol tests pass.
- The gate-only changed paths are reconciled into the same recon, which is then stamped
  P05A-RECON-r2-FINAL with both the accepted P04A.2 pair and post-gate P05 starting pair.

If the generator correction requires a broad contract redesign, save migration, general bridge
rewrite, or unrelated Unity presentation change, **stop**. Replan the contract representation as a
named blocker; do not expand the mini-checkpoint silently.

## 6. Work folded into P05

For this gate, Wave 1 is a narrow amendment to the provisional recon's scenery-only Wave 1: the
TypeScript scenery owner remains isolated, while independent Unity Activity/Presence and
Proof/Evidence owners may land only the bounded index and evidence primitives below in parallel.
P05A-RECON-r2-FINAL must carry this sequencing explicitly; it is not permission for a general
infrastructure wave.

| Candidate | Exact P05 wave | Exact dependency | Likely files | Single-owner lane | Acceptance law |
|---|---|---|---|---|---|
| Per-poll SnapshotBuildContext | Wave 0, before projection expansion | Prevent richer Production projection and intent assembly from repeating validation/hash/projection in one response | bridge/session.ts; ui/src/engine/adapter.ts; bridge/server.ts; existing tests | Bridge/integration owner | Exact snapshot bytes/digest/intents; one build context per response; no cross-poll cache |
| Exact-ID body/person index | Wave 1 foundation; consumed in Wave 4 | P05 routes holder-matched presence to one body per talentId and must remove scene search | promote StudioBridgePresentation.personSlots with typed body/Transform lookup; StudioWriterPresencePresentation.cs consumes it | Unity Activity/Presence owner; integration file by lead | One existing owner, no parallel registry; exact lookup; duplicate/missing/late lifecycle; zero steady scene searches |
| Stage presentation registry | Wave 4 | Two projected Stages need independent facilityId + buildingId owners and full truth replacement | new StudioStagePresentationRegistry.cs; StudioStageProductionPresentation.cs; StageActivityEffects.cs; StudioBridgePresentation.cs integration | Unity World/Stage owner; bridge application by lead | Duplicate/missing bindings fail at defined granularity; current holder beats history; two controllers stay isolated |
| Stage/person presence registry | Wave 4 after body index and closed projection | Stage row must carry TypeScript-composed presence whose ownerId matches productionId | TS projection composition; StudioProductionRolePresentation.cs; StudioPersonPresentationSlot.cs; index | TS projection owner then Unity Activity/Presence owner | No global rejoin; craft remains Scenery; missing body affects presentation only; cross-Stage duplicate withholds |
| Shared build/evidence manifest, minimum slice | Wave 1 primitive; adopted in Wave 5 | Visual Oracle claims need exact build/run/authority/screenshot binding | Studio.Runtime.Evidence assembly; final P04 manifest scripts; new P05 proof runner | Proof/Evidence owner | Atomic reread; artifact hash/dimensions; reference CF-09 contract identity and final process/build attestation; add only run/scenario/artifact fields; never create a second SHA/schema authority |
| Minimal Visual Oracle V1 | Wave 5 | Package 05 requires six management-distance states and exact identity isolation | new StudioProductionManagementDistanceProofRunner and six state fixtures | Proof owner | Six canonical scenarios only; machine state/ID assertions plus reviewable screenshots; no campaign replay per state |
| Typed Production presentation tests | Wave 1 for the new body-index core; extend in Waves 4 and 6 for Stage/workspace logic | New index/Stage truth/registry/workspace logic needs compiler-checked behavior | narrow named P05 presentation/core assembly if feasible; Studio.Tests.EditMode.asmdef; focused tests | Owning Unity lane; assembly graph by lead | All new risk-bearing P05 logic is typed; no broad migration or new source-text behavior pins |

This fold-in is intentionally narrow. P05 does not acquire a general performance platform, general
body service rewrite, generic proof framework, full test-assembly migration, or cross-poll cache.

## 7. Deferred work

| Work | Destination | Trigger/stop law |
|---|---|---|
| CF-03 theatrical invariants | Before P07/release | Must be green before release/theatrical implementation or acceptance; no P05 coupling |
| CF-04 contract-set invariants | Standalone maintenance later | Take with save/import integrity ownership and V8–V15 fixtures |
| CF-05 talent allocator | Standalone maintenance later | Take separately after P04A.2/P05 actions.ts collisions clear |
| Remaining CF-10 legacy Presentation migration | Fix touched vertical slices only | Never migrate reflection/source tests mechanically for count reduction |
| Remaining CF-14 runner migrations | Fix when a runner is materially changed | Reuse low-level primitive; preserve checkpoint journey law |
| CF-20 quote recency | Quote/session maintenance touch | P05 creates no quote; same file is not sufficient justification |
| Cross-poll snapshot cache | Deferred/reject until measured | Requires immutable revision/session key and complete command/load/rollover invalidation matrix |
| Broad assembly/import/browser UI cleanup | Standalone only if separately authorized and measured | Not a readiness or P05 deliverable |
| Performed-week animation and Watch Shoot | Package 05 follow-up | Explicitly excluded from P05A |
| Post and release gameplay | P06/P07 | P05 stops at read-only handoff |
| Renderer migration, DOTS, broad Addressables rollout | Reject from this gate/P05 | No measured dependency and prohibited scope |

## 8. Proposed pre-P05 mini-checkpoint

**Provisional checkpoint name:** P05A-STATIC-CONTRACT-GATE-01

**Size:** two tightly related changes

**Estimated implementation:** 1.5–3 engineering days plus focused review

**Repositories:** final accepted TypeScript and Unity pair, each in isolated clean worktrees

**Runtime level:** Node/generated-contract checks plus one Unity batch compile/EditMode protocol pass;
no packaged player, foreground session, HID, or Owner playtest

### Change 1 — Sound union generation

- Add negative type-collision fixtures first.
- Merge only proved-compatible fields and full discriminant vocabularies.
- Emit explicit/member-specific representations or fail closed with actionable diagnostics.
- Preserve deterministic generated output and review all current quote consumers.

### Change 2 — Exact-consumer contract lock

- Emit one non-self-referential contract manifest from the canonical schema/generator result.
- Emit exact repository SHAs/clean state only in the post-commit paired-root attestation so the
  committed manifest never contains its own commit SHA; write that attestation outside the tracked
  tree or under an explicit proof-output ignore rule.
- Require the canonical Unity root and expected sealed Unity SHA.
- Verify repository marker, real-path containment, clean-state policy, actual consumer path, and exact
  generated C# SHA-256.
- Always perform the strict paired-root check and retain its attestation. Make CI perform the
  two-repository check only when repository access/credentials are explicitly available.

### Deliberately excluded

- CF-07 snapshot refactor;
- CF-20 quote retention;
- new P05 schema fields;
- save changes;
- broad bridge redesign;
- Unity Presentation changes unrelated to quote serializer compatibility;
- packaged or visual proof.

The checkpoint is complete only as an exact clean TS/Unity SHA pair with a matching contract
manifest and retained post-commit attestation. A green repository-local generated copy alone is not
completion.

## 9. P05 recon r2 refresh checklist

The future refresh changes the existing
docs/engineering/CODEX-P05A-IMPLEMENTATION-RECONNAISSANCE.md to
**P05A-RECON-r2-FINAL**. It begins only after P04A.2 is technically sealed, Owner accepted, and both
final P04A.2 SHAs are supplied. It is one bounded, two-delta reconciliation: first inspect the exact
P04A.2 changed paths against accepted bases 9b196f799de969932ca3dfdc1f5bb9ae82819b3f
and 629090c066a4345acb197193103760cc21a43965 while the recon remains provisional; then land the
CF-08/CF-09 mini-gate and inspect only that gate's changed paths. Stamp r2 FINAL only after recording
the clean post-gate P05 starting pair. This is not a second research cycle.

### Required final inputs

- Owner acceptance statement or ruling.
- Final Owner-accepted P04A.2 TypeScript branch/ref and full SHA.
- Final Owner-accepted P04A.2 Unity branch/ref and full SHA.
- Exact TypeScript changed-path list from 9b196f799de969932ca3dfdc1f5bb9ae82819b3f.
- Exact Unity changed-path list from 629090c066a4345acb197193103760cc21a43965.
- Confirmation whether the accepted Unity SHA includes a documentation-only handoff commit or names
  a separate product/build tip.
- Final clean/dirty evidence for both accepted roots.
- Final technical proof summary and exact test results.
- After the mini-gate: its exact two-repository changed paths, final clean post-gate TypeScript and
  Unity branch refs/full SHAs, checkpoint attestation, and focused proof results.

### Carried-forward accepted-629 seam ledger

Changed-path-only does not mean rediscovering unchanged P04A.1 code. This inspection already pinned
the following accepted-629 seams; r2 carries them forward and reads only a final P04A.2 or mini-gate
path that changes the named owner:

- `StudioWorkspaceHost` owns one runtime-created `UIDocument` and code-created `PanelSettings`, and
  builds its Casting tree in code. Accepted 629 has no generic root router, workspace UXML, or
  `PanelSettings` asset.
- `StudioPresentationInputContext` suspends/restores camera/world input around the workspace;
  standalone setup uses `AssignDefaultActions()` and `Assets/InputSystem_Actions.inputactions`.
  Accepted 629 has no project-owned Global/World/Camera/UI context service.
- `StudioSystemMenuHud` plus `StudioSystemMenuContracts` own Resume/Save Game/Load Game/Quit to
  Desktop, discard confirmation, and cancel layering; save/load dispatch through
  `StudioBridgeClient`, while quit reaches `Application.Quit(0)` after confirmation.
- `StudioBridgeClient` coordinates memo cession through booleans and an intent-kind hash set.
  Accepted 629 has no generic memo-owner registry.
- `StudioWorkspaceHost` owns `OpenCasting`, close/discard, Locate suspension/restoration, and the
  Greenlight receipt/close path. Accepted 629 has no Production open/select successor.
- `StudioSelectionManager`, `StudioCameraDirector`, and `TycoonCameraController` own the accepted
  cancel, inert-selection, explicit Focus/Locate, and navigation-origin/Back path.

If a required seam is neither in this ledger nor in the final delta, r2 records it as absent or
unproved and assigns the smallest P05 extension; it does not broaden the inspection. Every changed
owner is updated from only its final changed path and affected tests.

### Changed-path-only inspection checklist

- [ ] Record final protocol version.
- [ ] Record final projection/snapshot version.
- [ ] Record the full content-derived schema ID, not a prefix.
- [ ] Record final save version and the exact migration set; state explicitly if no P04A.2 migration
  was added.
- [ ] Run check-only or scratch generation from `bridge/schema/bridge-schema.ts`; compare
  `bridge/schema/project-studio-bridge.schema.json`,
  `generated/unity/StudioBridgeDtos.Generated.cs`, and the actual Unity C# consumer. Do not rewrite
  production artifacts during the refresh. List every changed C# DTO type/field/vocabulary/
  nullability/requiredness rule and the exact hashes.
- [ ] Compare against the actual Unity consumer at
  Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs and record byte equality.
- [ ] Pin the final Casting/Greenlight/Production receipt and DTO shape for immediate formation versus
  queued admission.
- [ ] Pin **Writer credit versus active assignment**: credit remains exact and durable, but credit
  alone never establishes busy state, active assignment, company membership, or Stage presence;
  final accepted helpers and `studioPresence` own those claims.
- [ ] Pin the accepted Writer behavior for active company seats, Development/Pre-Production worksite
  presence, Stage presence, writer-busy blockers, and multiple-live-picture credit. Reconcile any
  final P04A.2 exclusion with Package 05's Writer/Director Development/Pre-Production presence law by
  citing the exact Owner ruling; absent such a ruling, name a product-law blocker.
- [ ] Pin actor badges and semantic role source: final SELECTED FOR role and CAST AS role copy must
  come from the exact committed/draft owner appropriate to that surface.
- [ ] Pin final actor **Move** semantics: source role, destination role, displaced actor, refresh
  persistence, stale/session refusal re-arm, and whether it is a Casting draft operation only.
  Confirm it is not manual world movement or a P05 Production assignment.
- [ ] Pin the final UI Toolkit host as it actually exists: root-router existence or absence,
  runtime/asset ownership of `UIDocument` and `PanelSettings`, code-built or UXML workspace tree,
  token/style paths, responsive bands, contained-scroll owner, focus restoration, and semantic test
  hooks. If the accepted-629 baseline remains, state the smallest P05 extension rather than naming a
  generic router or asset as existing.
- [ ] Pin final Input System asset/actions and the actual input-context owner. Record whether
  Global/World/Camera/UI contexts exist or remain absent; then pin UI-capture arbitration, mouse/
  keyboard/controller navigation, submit/cancel, leakage tests, and the smallest P05 extension.
- [ ] Pin system-menu owner and exact Save/Load/Quit/discard routes, capabilities, disabled states,
  modal/Back/Escape precedence, load/session behavior, and tests. P05 must reuse them and create no
  second system menu.
- [ ] Pin the final memo cession/owner mechanism as it actually exists. Record whether a registry API
  exists or the accepted booleans/hash-set remain; list the exact verbs Casting claims and the
  smallest P05 extension needed for Director/schedule/grandfathered-Clear without inventing a
  pre-existing registry.
- [ ] Pin final retained-workspace context and Back coordinator: route, subject ID, subview,
  scroll/focus/modal/opener context, and restoration tests. Prove camera pose remains solely in the
  accepted StudioNavigationOriginTrail/Tycoon camera path.
- [ ] Pin the Casting-to-Production successor or its explicit absence: exact successful-Greenlight
  receipt, exact productionId, workspace close behavior, same lot/camera behavior, open/select route,
  queued non-Production behavior, and all-active tracking impact. If accepted 629's receipt/close-only
  behavior remains, assign the smallest P05 successor rather than claiming one already exists.
- [ ] Pin semantic world owner, Focus/Locate resolver, stable target ID, and stale-target behavior.
- [ ] Pin exact Production presence routing: final TypeScript owner/assignment/credit helpers,
  studioPresence behavior, holder-matched Stage rows, Unity person-body owner, duplicate/missing body
  behavior, and craft-at-Scenery rule.
- [ ] Pin Queue/Facility/Set remedy-owner routes and identify which, if any, final owners publish
  accepted opaque intents. P05 must navigate safely when no intent exists.
- [ ] Pin art/profile resolver availability and every final scene/authoring/profile path affecting
  the N-Stage registry or neutral fallback.
- [ ] Pin evidence-provenance tooling: build manifest, executable/bundle/assembly hashes, exact
  PID/window/run binding, secret scan, element map, atomic report path, screenshot hash/dimensions,
  and retention policy.
- [ ] List every exact changed file relevant to camera, input, selection, bridge, schema, session,
  generated DTOs, save, workspace, system menu, memo ownership, presence, proof, scene, and authoring.
- [ ] List every affected TypeScript Core, bridge, browser, Unity EditMode/PlayMode, continuity,
  packaged, real-input, and Owner test with final counts/results.
- [ ] Resolve every P04A FORWARD ASSUMPTION, PENDING marker, dirty-worktree statement, provisional
  class/path, provisional viewport band, version placeholder, open P04 question, and prior
  validation limitation throughout the recon. Do not append a contradictory final note.
- [ ] If a final P04A.2 change materially alters TypeScript authority, duplicates camera pose,
  omits required host/input/Back/memo ownership, breaks generated compatibility, or conflicts with
  Package 05 law, stop and name the blocker. Do not choose the locally convenient interpretation.
- [ ] After reconciling only the mini-gate delta, change the same document's revision to
  P05A-RECON-r2-FINAL and record both the Owner-accepted P04A.2 pair and clean post-gate P05 starting
  pair. Do not create a second recon file.

The currently observed WIP facts—protocol 4, projection 11, the
sha256:01f15efc8fc33fd810b051242857385ca23b5e1c775b357db1bfe5a70e907e1e schema,
save V15, and matching generated hash—are strong forward evidence only. The refresh must read them
again through check-only generation and the final accepted/gate changed paths.

## 10. Minimal proof pyramid

The proof strategy is deliberately asymmetric: most work is proved without a player; Unity
structural behavior is proved in batch/EditMode; visual states are captured once from deterministic
setups; the Owner plays one bounded end-to-end journey.

| Layer | Required proof | Frequency and invalidation law | Explicit exclusions |
|---|---|---|---|
| **A. TYPESCRIPT / HEADLESS AUTHORITY PROOFS** | Save/import invariants; scenery due-at-call/next-week/grandfathered law; all-active Production projection; worksite/none/withheld; Stage/Set/Production/person identity; blockers/remedies; presence; wrap/current-holder precedence; opaque intents; schema/generator/actual-consumer manifest; restart/reconnect determinism | Run affected focused suites per change; run the full canonical TS/bridge suite at wave exit and final seal | No Unity, screenshots, campaign replay, or browser play task |
| **B. UNITY EDITMODE / STRUCTURAL PROOFS** | Compile; generated protocol validation; typed Stage truth/registry/body index; full replace/clear lifecycle; duplicate/missing identity withholding; UI host/context/Back/input/memo integration; responsive/focus/semantic roots; evidence atomicity | Run focused EditMode per Unity change; full EditMode at Unity wave exit and final seal | No visual acceptance claim from reflection/source text alone; no foreground session |
| **C. VISUAL ORACLE SCENARIOS** | Six canonical state setups in Section 11, exact manifest/IDs, matched management camera, only the screenshot views that answer the visual question | One bounded packaged matrix after world/workspace integration; rerun only a scenario whose authority, presentation, art/profile, camera, viewport, or proof bytes changed | No six full game replays; no automatic approval from pixels; no hundreds of scenarios |
| **D. OWNER PLAYTEST** | One Greenlight-to-Wrap/Post-handoff journey, including explicit Focus/Locate/Back, current operations, readable states, two-picture isolation checkpoint, Save/Load once, and final subjective management-distance judgment | Once after A–C are green; repeat only the affected segment after a scoped fix unless product bytes invalidate the whole journey | No automated agent substitutes for Owner acceptance; no Post gameplay |

Failure invalidation is local by default:

- A TypeScript rule change reruns affected A tests and only downstream B/C scenarios whose projected
  bytes or setup changed.
- A Unity visual-only change does not replay TypeScript history; it reruns affected B tests and the
  relevant C scenario.
- A proof-tool-only change recaptures evidence it affects; it does not force simulation-law replay.
- A build, schema, executable, camera, or scene change invalidates only artifacts bound to the old
  identity, not unrelated headless proofs.

## 11. Visual Oracle scenario matrix

### 11.1 Canonical exact-ID fixture ledger

These are test-owned exact IDs for the P05 matrix. They are never matched by title, array position,
Transform proximity, or a legacy Stage 7 fallback.

| Entity | Exact ID |
|---|---|
| Production A | prod-0000 |
| Production B | prod-0001 |
| Load-in target Production | prod-0016 |
| Stage A world building | stage-a |
| Stage A facility | facility-soundstage-07 |
| Stage A standing Set | set-0 |
| Stage B world building | stage-b |
| Stage B facility | facility-soundstage-12 |
| Stage B standing Set | set-1 |
| Scenery source | facility-scenery-shop |
| VO-3 placed Stage facility/body | facility-stage-1 / placed-1 |
| VO-3 placed Scenery facility/body | facility-scenery-shop-2 / placed-2 |
| Production A Writer credit | t-p05-writer-a |
| Production A Director | t-p05-director-a |
| Production A Lead | t-p05-lead-a |
| Production A Antagonist | t-p05-antagonist-a |
| Production A Support | t-p05-support-a |
| Production A Craft | t-p05-craft-a |
| Production B Director | t-p05-director-b |
| Production B Lead | t-p05-lead-b |
| Production B Antagonist | t-p05-antagonist-b |
| Production B Support | t-p05-support-b |
| Production B Craft | t-p05-craft-b |

Opaque intent IDs remain digest/revision-bound. Each scenario records the exact TypeScript-emitted
value in its manifest and asserts kind + productionId + exact emitted intentId; Unity never constructs
or hard-codes it.

Every scenario records: run/scenario ID; TypeScript/Unity/build/executable hashes; protocol,
projection, schema and save versions; authority session/revision/digest/week; all entity IDs; viewport;
camera pose; semantic roots; screenshot hashes/dimensions.

### VO-1 — Idle Stage

- **Authoritative setup:** Stage A is valid and standing; set-0 may be mounted/standing; no current
  reservation or holder exists for facility-soundstage-07. Production A/B state is irrelevant and
  omitted from this isolated setup.
- **Exact expected IDs:** building stage-a; facility facility-soundstage-07; optional standing Set
  set-0; productionId null.
- **Screenshot views:** ordinary management view with workspace/memo closed, using the exact viewport
  and frozen camera transform later reused by VO-5; selected Stage A inspector. No medium/close shot
  is required.
- **Machine assertions:** closed state Dark/Idle; no holder/title/company/operation/beacon/freight;
  Stage remains selectable; any Set row is exact and does not imply occupancy.
- **Visual question:** Does the Stage read as available and quiet without looking broken or inventing
  crew/activity?
- **Does not replay:** Greenlight, Rehearsal, Shooting, Save/Load, or another Stage.

### VO-2 — Rehearsal / preparation

- **Authoritative setup:** prod-0000 owns facility-soundstage-07 through an exact Rehearsal reservation
  and live binding to set-0. Holder-matched presence contains t-p05-director-a, t-p05-lead-a,
  t-p05-antagonist-a, and t-p05-support-a at Stage A. Writer credit alone does not place
  t-p05-writer-a at the Stage; this fixture's final accepted `studioPresence` row excludes it.
- **Exact expected IDs:** prod-0000; stage-a; facility-soundstage-07; set-0; the four exact Stage
  people above.
- **Screenshot views:** matched management view; medium Stage A view; selected Stage inspector.
- **Machine assertions:** REHEARSAL/PREPARING; occupied-low treatment; no load-in, Shooting beacon,
  take operation, craft-at-Stage, or Writer-at-Stage; exact title/Set/presence.
- **Visual question:** Is autonomous preparation legible as working, distinct from idle, waiting, and
  Shooting?
- **Does not replay:** Greenlight or the countdown from week 8; the fixture loads the validated
  Rehearsal state directly.

### VO-3 — Scenery load-in

- **Authoritative setup:** the headless fixture builds `stage-standard` first at `(23,20)` as
  placement `1` / facility `facility-stage-1` / body `placed-1`, then `scenery-shop` at `(0,11)` as
  placement `2` / facility `facility-scenery-shop-2` / body `placed-2`. Both are operational at week
  16. `prod-0016` enters Rehearsal on facility-soundstage-07/stage-a with set-0 and
  `heldSinceWeek=18` at week 19. After set-1 is struck, set-2 on facility-soundstage-12 and set-3 on
  facility-stage-1 occupy both founding Scenery Shop slots; advancing week 19 gives prod-0016
  reservation `facility-scenery-shop-2:0`. At market tick 20, calling t-p05-director-a produces task
  `shooting:prod-0016`, status `blocked`, blocker `scenery-load-in`. Source body `placed-2` occupies
  `gx 0..2, gy 11..12`, centre `{gx:1,gy:11}`; destination stage-a remains origin `{gx:17,gy:2}`,
  `4x4`, centre `{gx:18,gy:3}`. Manhattan distance 25 yields total 3; called week 18 yields elapsed 2,
  remaining 1, `arrived:false`. Director/cast remain Stage-bound; t-p05-craft-a is at the exact
  placed Scenery site.
- **Exact expected IDs:** prod-0016; task shooting:prod-0016; stage-a;
  facility-soundstage-07; set-0; resource facility-scenery-shop-2:0;
  facility-scenery-shop-2; placed-2; t-p05-craft-a; exact emitted no-Clear intent set and
  `advance-week` journey continuation.
- **Screenshot views:** matched management view; medium view showing Stage/service context; Stage
  inspector containing exact source/destination/weeks. A close prop shot is optional and cannot be
  the sole evidence.
- **Machine assertions:** closed state LOAD-IN; from facility-scenery-shop-2 to
  facility-soundstage-07; distance 25; total 3/elapsed 2/remaining 1; called week 18/current week 20;
  no native/current V14 Clear intent; no Shooting beacon/equipment; cosmetic cue never changes
  authority; exact company sites.
- **Visual question:** Is the spatial logistics consequence legible without claiming the cosmetic
  vehicle path is simulation truth?
- **Does not replay:** the packaged player does not rebuild weeks 0–20, perform road travel, advance
  an extra week, or issue manual Clear. The headless fixture generator supplies the exact validated
  save; no road/path waypoint is authoritative or asserted.

### VO-4 — Blocked / waiting for a current operation

- **Authoritative setup:** prod-0000 owns Stage A/set-0 in Shooting with task unassigned and locked
  Director t-p05-director-a. TypeScript publishes the exact current Director-dispatch operation and
  its digest-bound opaque intent.
- **Exact expected IDs:** prod-0000; stage-a; facility-soundstage-07; set-0;
  t-p05-director-a; exact emitted operation productionId prod-0000.
- **Screenshot views:** matched management view and selected Stage inspector/blocker card.
- **Machine assertions:** DECISION REQUIRED/WAITING treatment; exact effect, cause, consequence and
  Call Director action; occupied-low light only; beacon/equipment off; no substitute Director,
  generic Fix, or second action.
- **Visual question:** Can the player identify the held picture, why it is held, and the one current
  remedy without opening a generic memo?
- **Does not replay:** Casting the Director, Greenlight, prior weeks, or clicking the operation.
  Command acceptance/stale behavior remains headless.

### VO-5 — Shooting

- **Authoritative setup:** prod-0000 owns Stage A/set-0 with task scheduled or completed at the exact
  current Shooting week. Director and three cast IDs are at Stage A; t-p05-craft-a remains at
  facility-scenery-shop. No schedule operation remains current.
- **Exact expected IDs:** prod-0000; stage-a; facility-soundstage-07; set-0;
  t-p05-director-a, t-p05-lead-a, t-p05-antagonist-a, t-p05-support-a; craft ID at Scenery.
- **Screenshot views:** the exact viewport and frozen management-camera transform from VO-1; medium
  Stage A; one close view; selected Stage inspector.
- **Machine assertions:** SHOOTING/hot; beacon/interior/equipment roots active under exact Stage
  truth; correct named company; decorative bodies carry no IDs and may be zero; no repeat schedule
  action, craft-at-Stage, percent, or hidden quality.
- **Visual question:** Is Shooting unmistakably discontinuous from idle at management, medium, and
  close scale even in a still image?
- **Does not replay:** scene/shot chronology, performed-week animation, Watch Shoot, or a second
  schedule command.

### VO-6 — Wrap plus two-Production/two-Stage isolation

- **Authoritative setup A:** prod-0000 owns Stage A/set-0 in Shooting while prod-0001 independently
  owns Stage B/set-1 in a non-advancing Shooting hold with task `unassigned` and its own current
  Director-dispatch operation. Each row contains only its exact company IDs.
- **Authoritative setup B:** one deterministic transition wraps prod-0000, releases its Stage/Set/
  scenery/task, and leaves a compatible current-week Wrap receipt for Stage A. prod-0001 remains the
  current holder of Stage B with the same hold, people, and operation identity apart from lawful
  shared revision/week metadata. Post is next for prod-0000 but P05 exposes no Post controls.
- **Exact expected IDs:** A uses prod-0000/stage-a/facility-soundstage-07/set-0 and
  prod-0001/stage-b/facility-soundstage-12/set-1. B has Stage A holder null and Stage B holder
  prod-0001. Production A company IDs disappear from Stage A; Production B company membership is
  exactly t-p05-director-b, t-p05-lead-b, t-p05-antagonist-b, t-p05-support-b, and t-p05-craft-b;
  its holder-matched Stage-presence IDs and digest-bound Director operation ID must equal the exact
  headless projection and remain isolated to Stage B.
- **Screenshot views:** matched two-Stage management view immediately before and after Wrap; Stage A
  medium/inspector after Wrap; Stage B inspector after Wrap.
- **Machine assertions:** no cross-Stage title, Set, person, state, decoration, or logistics borrowing;
  bounded clearing only on released Stage A; Stage B's exact holder, phase, task, people, and operation
  remain unchanged while shared revision/week metadata may advance; no former company, Shooting
  beacon, retained resource, or P06 control on Stage A. A machine-only companion permutation proves
  same-tick reallocation paints the new current holder over Wrap history.
- **Visual question:** Does Wrap read as a restrained release event while the other exact Production
  remains clearly independent and active?
- **Does not replay:** two full campaign admissions, every prior phase, or Save/Load. Isolation and
  release are seeded/one-transition proofs.

Six scenarios are sufficient. Same-title, reversed allocation, duplicate authority, missing body,
save/reconnect, stale Locate, decoration zero, controller, 200% text, and immediate Stage reuse remain
mandatory machine/EditMode permutations and targeted screenshots only when their visual answer is not
already represented above. They do not create additional canonical Oracle scenarios.

## 12. File ownership/collision map

### 12.1 Preliminary P05 one-owner lanes

| Lane | One-owner paths/symbols | Collision law |
|---|---|---|
| TypeScript scenery correction | src/core/sceneryLoadIn.ts; src/core/operations.ts; src/core/tick.ts; src/core/firstFilmJourney.ts; protected actions.ts/scriptReadModel.ts/adapter.ts integration | One Core owner. No allocator/phase/save refactor. adapter.ts is never shared concurrently. |
| TypeScript Production read model | ui/src/lot/snapshot/StudioLotSnapshot.ts; optional focused productionOperations.ts; adapter projection facts/copy; holder-matched presence composition | One projection owner. Consume presence/queue/theater; do not mutate their canon or create a second projection root. |
| Bridge schema/generation/session | bridge/schema/bridge-schema.ts; canonical JSON; scripts/generate-bridge-contract.ts; generated outputs; bridge/session.ts; bridge tests | Lead/integrator only. Generated C# never handwritten; exact Unity consumer manifest required. |
| Unity Stage registry/world | new StudioStagePresentationRegistry.cs; StudioStageProductionPresentation.cs; StageActivityEffects.cs; exact profile/neutral fallback | One World/Stage owner. StudioBridgePresentation.cs remains lead integration-only. |
| Unity presence/body index | exact-ID index; StudioWriterPresencePresentation.cs; StudioPersonPresentationSlot.cs; StudioProductionRolePresentation.cs; Stage-local decorative/logistics consumers | One Activity/Presence owner. One body per talentId; no per-Stage clones or global first-body fallback. |
| Production workspace | new StudioProductionWorkspaceController.cs, UXML, USS, focused tests within final P04 host | One workspace owner. No parallel host/input/Back/menu/memo; final router integration by lead. |
| Blocker/remedy presentation | TS projection composes facts/copy; workspace renders; bridge lead wires only accepted intents/routes | No Unity legality derivation and no locally minted intent. |
| Proof/Visual Oracle | existing Evidence assembly minimum primitive; new focused management-distance runner and fixtures | One Proof owner. Reports failures to product lanes; references CF-09 contract/build identity and never remints it. |
| Save | No lane by default | Touch src/core/save.ts only if final P04A.2/P05 persistent authority proves a migration is needed. Current derived design needs none. |
| Cross-system integration | Exact shared paths listed immediately below; final authoring/scene/prefab registration | Lead only, never delegated concurrently. |

Exact lead-only shared paths are:

- Assets/Studio/Runtime/Presentation/StudioBridgePresentation.cs
- Assets/Studio/Runtime/Presentation/StudioBridgeBootstrap.cs
- Assets/Studio/Runtime/Presentation/UI/StudioWorkspaceHost.cs
- Assets/Studio/Runtime/Presentation/UI/StudioPresentationInputContext.cs
- Assets/Studio/Runtime/Presentation/StudioSystemMenuHud.cs
- Assets/Studio/Runtime/Presentation/StudioSystemMenuContracts.cs
- Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs
- Assets/Studio/Runtime/Presentation/TycoonCameraController.cs
- Assets/Studio/Runtime/Presentation/StudioCameraDirector.cs
- Assets/Studio/Runtime/Presentation/StudioSelectionManager.cs
- Assets/InputSystem_Actions.inputactions
- Assets/Studio/UI/Resources/StudioUiTokens.uss

Additional lead-only authoring paths are:

- Assets/Studio/Editor/Authoring/StudioLotContext.cs
- Assets/Studio/Editor/Authoring/StudioLotActivityAuthoring.cs
- Assets/Studio/Editor/Authoring/StudioLotLandAuthoring.cs
- Assets/Studio/Editor/Authoring/StudioLotArchitectureAuthoring.cs
- Assets/Studio/Editor/Authoring/StudioLotAuthoring.cs

### 12.2 Active P04A.2 TypeScript paths

Every path in this subsection is **DO NOT TOUCH UNTIL P04A.2 SEALS**:

- src/core/actions.ts
- src/core/candidates.ts
- src/core/castingPackageReadModel.ts
- src/core/employment.ts
- src/core/index.ts
- src/core/presence.ts
- src/core/scriptDevelopment.ts
- src/core/scriptReadModel.ts
- src/core/studioRunRecap.ts
- tests/_p04a2WriterCreditFixtures.ts
- tests/actions.test.ts
- tests/bridge-p04a2-writer-credit-law.test.ts
- tests/p04a2-writer-credit-law.test.ts
- tests/presence-scenario.test.ts
- tests/script-read-model.test.ts
- ui/src/engine/adapter.test.ts
- ui/src/engine/adapter.ts
- ui/src/engine/writer-credit-not-assignment.test.ts
- ui/src/lot/NamedPersonWorkCareerInspectorV1.test.tsx
- ui/src/lot/snapshot/personWork.ts
- ui/src/lot/snapshot/productionCompany.test.ts
- ui/src/lot/snapshot/productionCompany.ts
- ui/src/lot/studio-lot-snapshot.test.ts
- ui/src/screens/assembly-legality.test.tsx
- ui/src/screens/script-projects-edge-ui.test.tsx

### 12.3 Active P04A.2 Unity paths

Every path in this subsection is **DO NOT TOUCH UNTIL P04A.2 SEALS**:

- Assets/Studio/Runtime/Presentation/StudioCastingJourneyProofRunner.cs
- Assets/Studio/Runtime/Presentation/StudioLivingTime.cs
- Assets/Studio/Runtime/Presentation/UI/StudioCastingWorkspace.cs
- Assets/Studio/Runtime/Presentation/UI/StudioCastingWorkspaceContext.cs
- Assets/Studio/Runtime/Presentation/UI/StudioWorkspaceHost.cs
- Assets/Studio/Tests/EditMode/StudioCastingGreenlightTests.cs
- Assets/Studio/Tests/EditMode/StudioCastingJourneyProofRunnerTests.cs
- Assets/Studio/Tests/EditMode/StudioCastingScreenTestTests.cs
- Assets/Studio/Tests/EditMode/StudioCastingWorkspaceP04A1Tests.cs
- Assets/Studio/Tests/EditMode/StudioCastingWorkspaceP04A2Tests.cs
- Assets/Studio/Tests/EditMode/StudioCastingWorkspaceP04A2Tests.cs.meta
- Assets/Studio/Tests/EditMode/StudioLivingTimeTests.cs
- Assets/Studio/UI/Resources/StudioCastingWorkspace.uss
- P04A2-RESUME.md
- Tools/p04a2-proof-journey.mjs

The highest-risk direct P05 collisions are actions.ts, scriptReadModel.ts, adapter.ts, presence.ts,
productionCompany.ts, StudioWorkspaceHost.cs, StudioCastingWorkspaceContext.cs,
StudioCastingWorkspace.cs, StudioLivingTime.cs, and the P04 proof files/conventions. Final r2 must
recompute this list from the final accepted diffs; it must not assume the current WIP is the seal.

## 13. Headless versus runtime execution map

This map describes future authorized work. It does not record activity performed during this
documentation gate.

| Future task | No runtime | Node/TS only | Generated-contract check | Unity batch compile/EditMode | Packaged player | Real HID | Owner playtest |
|---|---:|---:|---:|---:|---:|---:|---:|
| P04A.2/gate changed-path r2 reconciliation | **Yes** | **Yes, check-only** | **Yes, check-only** | No for the refresh itself | No | No | No |
| CF-08 generator hostile fixtures/fix | No | **Yes** | **Yes** | **One focused pass** if C# shape/consumer changes | No | No | No |
| CF-09 actual-consumer manifest/check | No | **Yes** | **Yes** | Covered by paired CF-08 gate | No | No | No |
| CF-07 per-poll context/authority head | No | **Yes** | No unless wire changes, which is discouraged | No | No | No | No |
| P05 scenery root correction | No | **Yes** | No | No | No | No | No |
| Production projection and bridge schema | No | **Yes** | **Yes** | **Yes** after generated DTO cut | No | No | No |
| Stage registry/body index/presence application | No | No | Consume verified DTO | **Yes** | No per small change | No | No |
| Production workspace/blocker/remedy integration | No | No | Consume verified DTO | **Yes** | One later bounded matrix | No per small change | No |
| Evidence primitive/manifest | No | Headless fixture helper if used | Read contract identity | **Yes** | No for utility | No | No |
| Six-scenario Visual Oracle | No | Authority setups generated headlessly | Verify identity | Structural suite already green | **Yes, once** | No; semantic automation is sufficient | No |
| Final input/Focus/Locate/Back smoke | No | No | No | Structural input tests first | **Yes, bounded** | Only if final accepted proof law requires a separate automated real-device claim | No |
| Owner acceptance journey | No | No | Verify manifest only | Must already be green | **Yes, once** | Owner's ordinary input supplies the real interaction | **Yes** |

Every pre-Owner packaged entry above is a phase or fixture switch inside **one bounded packaged
matrix**, not a separate full journey. If final accepted law retains an automated real-device claim,
run only its exact affected input segment within that matrix; do not create another campaign replay.

The intended order is:

1. static/read-only P04A.2 delta reconciliation, still provisional;
2. mini-gate Node/TypeScript and generated-contract proofs;
3. the mini-gate's one focused Unity compile/EditMode pass;
4. static gate-delta reconciliation and r2 FINAL stamp;
5. P05 Node/TypeScript authority and Unity compile/EditMode structural proofs;
6. one bounded packaged Visual Oracle/input matrix;
7. one Owner playtest.

Do not run a full end-to-end replay after each Core, copy, style, registry, or test-helper change.

## 14. GO / NO-GO criteria

### GO — all conditions are mandatory

- P04A.2 is technically sealed.
- The Owner has explicitly accepted P04A.2.
- Final Owner-accepted P04A.2 TypeScript and Unity full SHAs and branch refs are supplied.
- Exact changed paths from 9b196f799de969932ca3dfdc1f5bb9ae82819b3f and
  629090c066a4345acb197193103760cc21a43965 are recorded.
- The CF-08/CF-09 two-change static contract mini-checkpoint is complete as an exact clean TS/Unity
  SHA pair.
- P05A-RECON-r2-FINAL completes Section 9's P04A.2-delta and gate-delta reconciliation and records
  both the accepted P04A.2 authority pair and clean post-gate P05 starting pair.
- Contract protocol/projection/schema/generated hashes and actual Unity consumer parity are green.
- Canonical TypeScript/bridge baseline tests collect and execute in the final environment.
- Final P04 host, Input System contexts, system menu, Save/Load/Quit, workspace Back/context, memo
  owner, Casting-to-Production successor, presence routing, Locate, and proof provenance are pinned.
- Clean isolated P05 implementation worktrees exist at the exact chartered SHAs.
- The collision map names one owner per shared file and preserves every final P04A.2 path until seal.
- A P05 implementation charter fixes wave entry/exit tests, authority precedence, no-go scope, and
  lead-only integration paths.
- No unresolved same-level product-law conflict remains.

### NO-GO — any one condition is sufficient

- P04A.2 remains WIP, technically unsealed, or Owner-unaccepted.
- Final P04A.2 or post-gate SHAs/changed paths are absent, or dirty/uncommitted work is required as
  authority.
- Recon r2 is incomplete or attempts broad research instead of changed-path reconciliation.
- Generator still silently flattens an incompatible object union.
- Generated verification can pass without naming and checking the exact Unity consumer.
- Contract/schema/save/host/input/Back/memo/presence ownership is ambiguous after final refresh.
- Two workers own adapter.ts, bridge/session.ts, generated DTOs, StudioBridgePresentation.cs, the
  final workspace host, or another collision file concurrently.
- A P05 plan requires Unity-side simulation law, title/position/proximity joins, a second host/input/
  camera/Back/memo/bridge store, Post controls, or prohibited maintenance scope.

Unrelated cleanup is not a GO requirement. CF-03/04/05/20, broad assembly cleanup, import cycles,
browser splitting, renderer work, DOTS, and broad Addressables work cannot hold P05 readiness.

**Current adjudicated state:** NO-GO for implementation because P04A.2 is not Owner accepted and the
post-seal mini-checkpoint/r2 refresh cannot yet exist. The readiness plan itself is PROVISIONAL READY.

## 15. Final builder handoff

When the GO criteria become true, the lead should proceed in this order:

1. Freeze the final Owner-accepted P04A.2 TS/Unity pair and record exact diffs.
2. Perform Section 9's P04A.2-delta pass while the existing recon remains provisional.
3. Land P05A-STATIC-CONTRACT-GATE-01 with only CF-08/CF-09.
4. Reconcile only the gate delta, record the post-gate starting pair, and stamp the same recon
   P05A-RECON-r2-FINAL.
5. Charter owners and isolated P05 worktrees at those post-gate SHAs.
6. P05 Wave 0: baseline tests, one per-poll SnapshotBuildContext/cheap authority head, final seam
   preflight.
7. P05 Wave 1: scenery root correction; in parallel, bounded body-index and evidence-primitive
   foundations under separate owners.
8. Continue the existing recon sequence: close Production projection; generated bridge cut; exact
   N-Stage world/presence; six-state management life; retained Production workspace; operations/
   remedies; Wrap/P06 handoff; hostile continuity/responsive proof.
9. Use Section 10's proof pyramid and Section 11's six scenarios. Do not replay the campaign for each
   visual state.
10. Stop at Post ownership. Theatrical settlement is a before-P07 task, not a reason to cross P05's
   boundary.

The lead must preserve these acceptance laws:

- Production, Stage, Set, and Person IDs remain separate and exact.
- Greenlight does not claim a Stage/Set before Rehearsal.
- Native/current Production Operations V14 scenery transit, persisted inside current save V15, has no
  manual Clear; only explicit-grandfathered provenance does.
- Writer credit alone does not establish active assignment, busy state, company membership, or Stage
  presence; final accepted `studioPresence` owns any Development/Pre-Production worksite claim.
- Actor Stage marks use exact Production credits; Casting Move is not world movement.
- Current holder outranks Wrap history.
- Named presence comes from TypeScript and one lot-wide exact-ID body registry.
- Decorative bodies are zero-safe, nonselectable, nonpersistent, and never headcount.
- Selection is inert; only explicit Focus/Locate moves camera; Back restores exact context.
- UI uses final P04 host/input/menu/memo ownership; no duplicate framework.
- P05 presents no progress percent, hidden quality, invented scene/shot, active cancel, Watch Shoot,
  performed-week scheduler, Post control, or Unity-side production law.

No production source, generated artifact, test, scene, asset, active worktree, or Unity project was
changed by this readiness assignment. The only intended committed path is this document.

## 16. POST-P04A.2 FINAL-SHA REFRESH REQUIRED

This document is provisional because final P04A.2 accepted authority is unavailable. After technical
seal and Owner acceptance, the final refresh must:

1. receive the final Owner-accepted P04A.2 TypeScript SHA, Unity SHA, exact changed paths, Owner
   acceptance ruling, and final test/proof results;
2. inspect only those P04A.2 changed paths against accepted bases
   9b196f799de969932ca3dfdc1f5bb9ae82819b3f and
   629090c066a4345acb197193103760cc21a43965, carrying Section 9's accepted-629 seam ledger without
   reopening unchanged paths;
3. execute Section 9's check-only checklist, replace provisional/WIP facts with final accepted facts
   or a named blocker, and leave the existing recon provisionally updated but not stamped FINAL;
4. land the bounded CF-08/CF-09 mini-checkpoint on that accepted pair;
5. receive the mini-gate's exact TypeScript/Unity changed paths, clean post-gate SHAs, checkpoint
   attestation, and focused proof results;
6. inspect only that gate delta, revalidate the collision map, and record the exact versions/schema/
   consumer, Writer/actor semantics, host/input/menu/Save/Load/Quit, memo/Back/successor/presence/
   evidence, changed files, and affected tests required by Section 9;
7. update the existing P05 recon in place to P05A-RECON-r2-FINAL with both the accepted P04A.2 pair
   and post-gate P05 starting pair; and
8. stop if either delta creates a genuine Package 05 conflict or invalidates the proposed
   mini-checkpoint.

No comparator research, historical-branch survey, broad archaeology, Package 05 research replay,
static-audit re-audit, or second reconnaissance document is authorized.

**MANDATORY CHANGED-PATH-ONLY FINAL REFRESH CONTRACT:** P05 MAY NOT START UNTIL FINAL OWNER-ACCEPTED
P04A.2 TYPESCRIPT AND UNITY SHAS, THEIR EXACT CHANGED PATHS, AND FINAL TEST/PROOF RESULTS ARE SUPPLIED;
THE EXISTING RECON MUST FIRST RECONCILE ONLY THAT DELTA AGAINST THE ACCEPTED-629 LEDGER AND REMAIN
PROVISIONAL. AFTER CF-08/CF-09 LANDS, IT MUST RECONCILE ONLY THE MINI-GATE DELTA, RECORD BOTH THE
OWNER-ACCEPTED P04A.2 PAIR AND CLEAN POST-GATE P05 STARTING PAIR, REPLACE EVERY PROVISIONAL FACT,
RECONFIRM THE ONE-OWNER COLLISION MAP, AND ONLY THEN BECOME P05A-RECON-r2-FINAL WITH AN EXPLICIT GO OR
NAMED NO-GO BLOCKER. THIS IS ONE BOUNDED FINAL-SHA RECONCILIATION, NOT A SECOND RESEARCH CYCLE.
