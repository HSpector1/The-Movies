# Project: Studio — P06A Readiness Gate 00

**Revision: P06A-READINESS-GATE-00-r2-FINAL**

**State: POST-P05 OWNER ACCEPTANCE — GO FOR AUTHORIZED IMPLEMENTATION**
**Implementation authorization: the Owner's five-day campaign order of 2026-09-01
(P05A.3 ACCEPTED — KEEP; P05 CLOSED; P06 Post/Release + Living Studio Command Layer
explicitly authorized). This gate no longer waits on any P05 fact.**

The r1 provisional gate (imported verbatim at the base of this branch, commit
`1f5c459`; authored at `c74cf79037fe9712247898c340834d0379c8b04c`) refused readiness
because final P05 truth did not exist. It now does. This r2 replaces every
placeholder with the verified final value and adjudicates every dependency against
the actual sealed code, inspected at the accepted pair — not inferred from WIP.

The controlling Package 06 product boundary is unchanged:

> wrap → autonomous Post → Release Ready → explicit `Commit <title> to Release` →
> dispatch acknowledgment → **STOP before P07 result interpretation**

---

## 1. Final authority (all placeholders resolved)

| Authority | Exact final value |
|---|---|
| Package 06 design + Builder Annex | `codex/post-release-research-06` @ `8ccd8acc253901aadaa2175656c1e0f7d1a2df23` (unchanged) |
| **FINAL_P05_TS_SHA** | `a994de38e8f87b8680f5ab4bd6fb62e7b594c5db` (product seal) |
| **FINAL_P05_TS_BRANCH** | `wip/p05a3-casting-roster-liveness-ts`; campaign tip `campaign/living-lot-ts` = `18ab9b6…` (seal + evidence docs; docs-only delta verified by `git diff --name-only`) |
| **FINAL_P05_UNITY_SHA** | `784f2d52e2459f2cf7a12cbde49319f2bb81df6c` |
| **FINAL_P05_UNITY_BRANCH** | `wip/p05a3-casting-roster-liveness-client` = `campaign/living-lot-client` (identical SHA) |
| **FINAL_P05_SCHEMA_ID** | `sha256:0474ceafd6c148f329fe99eac328c79ed0b0caf906e0f7442b7f3cf0fe40cb4f` |
| **FINAL_P05_PROTOCOL_VERSION** | `4` |
| **FINAL_P05_PROJECTION_VERSION** | `13` |
| **FINAL_P05_SAVE_VERSION** | `15` (`SaveFileV15`; `GameStateV15` = `GameStateV14` + one widened event leaf, no new roots) |
| **FINAL_P05_GENERATED_CONSUMER_HASH** | `9c3df11c993f6615e25bb55463008c5d4a45d99bab2de4fe8ee8a0ca44d2f705` — re-verified byte-equal in BOTH repositories at campaign start (TS `generated/unity/…` and Unity `Assets/Studio/Runtime/Data/Generated/…`) |
| **FINAL_P05_CONTRACT_MANIFEST_ID** | `generated/unity/project-studio-bridge.contract-manifest.json` — contractId `project-studio-current-game-unity-bridge`, generatorSourceSha256 `7e91dbc8…`, records exactly the schema/protocol/projection/hash tuple above |
| **FINAL_P05_TEST_COUNTS_AND_SEALING_ARTIFACTS** | TS: 356 files / 4,878 passed / 5 skipped (+ typecheck ×3) at `a994de3`; Unity EditMode 699/699 at `784f2d5` clean tree (`evidence/p05a3-editmode-seal.xml`); floors bound to seal exe `b5108a78…` per `docs/engineering/P05A3-CASTING-ROSTER-LIVENESS-EVIDENCE.md` §8 |
| **FINAL_P05_OWNER_ACCEPTANCE_RECORD** | Owner order 2026-09-01; recorded in `docs/campaigns/LIVING-LOT.md` (commit `f8dbe97`) with the P05 arc; lessons at `docs/engineering/P05-IMPLEMENTATION-AND-OWNER-PLAYTEST-LESSONS-LEARNED.md` (`59d9a2d`) |
| **FINAL_P05_TS_CHANGED_PATHS** / **UNITY_CHANGED_PATHS** | 106 TS paths (`git diff --name-only 71521ef..a994de3`) / 88 Unity paths (`5076af4..784f2d5`); preserved in the campaign handoff evidence. Load-bearing negative facts: `src/core/{operations,save,types,presence,productionPhases}.ts` are byte-unchanged since P04 acceptance; Unity `StudioLivingTime*.cs`, `StudioProductionRailHud.cs`, `StudioLotArchitectureAuthoring.cs` (post/theater bodies) and `StudioSystemMenu*`\* are unchanged by P05A.3 (\*menu contracts last touched P05A.2). |
| Local/remote equality | Verified by `git ls-remote` at campaign start after integration: TS campaign+WIP = `18ab9b6`, Unity campaign+WIP = `784f2d5`; both worktrees porcelain-clean |

### 1.1 The r1 §3.1 handoff packet — item-by-item

All ten items exist: (1) Owner verdict — campaign order + ledger commit; (2) final
branches + SHAs — above; (3) changed paths — above; (4) versions — above; (5)
generated hashes + manifest — above, byte-verified; (6) Wrap handoff and Post seam —
§3 rows below with exact symbols; (7) workspace/rail/person-body/presence/snapshot
owners — §3 rows below; (8) test counts + sealing artifacts — above; (9) P05 visual
oracle manifest — `ui/e2e/p05-visual-oracle-v1/manifest.json` (6 fixtures,
generator-hashed, self-verifying) + evidence-state facts in the r2 recon §9; (10)
clean local/remote proof — above. **No NO-GO item remains.**

---

## 2. Classification vocabulary

Unchanged from r1 (A = delivered by P05 / B = reused from P04 / C = built in P06 W0
/ D = optional / E = defer-reject).

---

## 3. End-of-P05 dependency adjudication — FINAL

Every row was verified against the sealed code by direct inspection during the
campaign's five-lane recon (2026-09-01), with the two highest-risk seams re-read by
the lead first-hand.

| Dependency | Class | Final verdict |
|---|---|---|
| **Authoritative Wrap condition** | A | **DELIVERED.** `src/core/operations.ts` `enterPhase()` (≈line 1099) calls `releaseCompletedPhase()` unconditionally before allocation; emits the ONLY `wrapped` event (`{kind:'wrapped', productionId, stageFacilityId, setId}`, ≈1153) exactly when shooting completes with released resources. |
| **Exact Stage/Set/scenery release** | A | **DELIVERED.** Wrapped waiter shape — `workflow.phase==='shooting'`, `reservations=[]`, `shootingTask=null`, `blocker={kind:'facility-capacity',capability:'post',targetPhase:'postProduction'}`, `remainingTicks` held at 4 — guaranteed by the producing path (`enterPhase`/`allocateForPhase`); the invariant at operations.ts ≈908–928 checks a non-null next-phase blocker only (shape unpinned). Bindings survive as non-occupancy provenance; reception reads them from the pre-advance operations root (tick.ts ≈474). |
| **Exact production ID surviving Wrap** | A | **DELIVERED.** `productionIdentity.ts` unchanged; the closed 14-state `operationalState` (`wrapped-waiting-for-post`, `post-handoff`, `release-ready`) rides `ProductionOperationsState` on the wire keyed by exact id. |
| **Current world owner after Wrap** | A | **DELIVERED with one chartered REPLACE.** Waiting/active Post map to building `post`. But `ui/src/engine/adapter.ts` `managedWorkflowLocation` maps `releaseReady` → `'theater'` and `managedProductionBoardCard.currentFacility` says `'Theater / release desk (no facility reservation)'` — exactly the presentation Package 06 rules against. Chartered as the W1/W2 coordinated REPLACE (ready/committed belong to Production / Post). This is scheduled work, not ambiguity: the current owner is explicit and wrong per new law. |
| **Post facility need / waiting reason** | A | **DELIVERED.** `studioQueueView.ts` (needs/occupiedBy/freesInWeeks/remedies, `CAPABILITY_LABEL.post='Post Building'`, `PHASE_LABEL` incl. `releaseReady='Release Ready'`) + `LotProductionBlockerAnatomy` (effect/cause/consequence/holders/projectedWeeks/remedies). |
| **Exact Post facility identity** | A | **DELIVERED core-side; Unity mapping is chartered W3 work.** Core reservations carry exact facility ids; the browser and Unity currently know only the founding `post` body. `placeFacility`/`demolishFacility` exist, so N Post facilities are reachable. P06A scope ruling (final): the founding `post` body is the world anchor; every row labels its exact core facility id/name separately; placed facilities without authored bodies are the `Locate unavailable — no placed body` case, never first-match. |
| **N-Stage presentation registry** | A | **DELIVERED.** `StudioStagePresentationRegistry.cs` — Register/Unregister/Apply keyed by exact building identity; duplicate ⇒ withhold all claimants; static `ResolveRowByBuildingId` is the single exact-ID resolver; per-presenter exception isolation. This exact shape is the P06 Post-registry template. |
| **N-Post-facility presentation registry** | C | **GREENFIELD, pattern frozen.** No post/theater-specific presentation code exists anywhere in `StudioBridgePresentation.cs` (verified: generic `ApplyBuildingStates` only; the `post` body is a plain `AddSelectable` with a static string). W3 builds `StudioPostPresentationRegistry` + presenter by direct analogy. |
| **Production workspace and Production Rail** | A | **DELIVERED.** `UI/StudioProductionWorkspace.cs` + `StudioProductionWorkspaceContracts.cs` (pure `DecideOperation`/`DecideLocate`, exact kind+productionId intent match, per-frame `MaintainOperationGate` re-gate, `SelectionAfterRebind` pinning) — the model for `ReleaseDecisionState`. Rail (`StudioProductionRailHud.cs`) unchanged since P04A.1; its LSCL evolution is chartered separately. Host `StudioWorkspaceHost.cs` has exactly two mutually-exclusive routes (casting: retained-draft; production: stateless) toggled by `productionRouteOpen` — the third route requires the chartered route-enum refactor, a named integration risk. |
| **Exact-ID person/body index** | A | **DELIVERED as the accepted architecture.** `StudioBridgePresentation.personSlots` (Dictionary talentId→PersonSlot, stale-evicted per `ApplyPeople` pass) + `TryGetAuthoritativePersonStableId` is the one lot-wide index. No standalone registry class exists; P06 consumes this seam and does not invent a second. |
| **Presence routing** | A | **DELIVERED.** `presence.ts` `attendanceForPhase`: `postProduction` → Director + craft (capability `post`); `releaseReady` → nobody, unconditionally (canon comment ≈146-154). |
| **Snapshot-build context** | A | **DELIVERED.** `bridge/snapshot-build-context.ts`: `snapshotBuildContextFor(state)` WeakMap-memoized lazy facts (`saveJson/stateDigest/lotSnapshot/development/casting`). P06 adds a `release()` lazy fact exactly like `casting()`. |
| **Generated-contract gate** | A | **DELIVERED.** CF-08: deterministic union case ordering + generator tests sealed at the static gate (`7811377`/`29aea89`). CF-09: `scripts/verify-bridge-contract-consumer.ts` + `bridge-contract-consumer-lock.ts` performs a genuine two-repository pinned-consumer sha256 verification with attestation modes; `CURRENT_ACCEPTED_SAVE_VERSION=15` is pinned there and must move with the V16 mint. Hashes re-verified byte-equal at campaign start. |
| **Evidence / Visual Oracle manifest** | A | **DELIVERED, one honest gap.** Fixture generator (`scripts/gen-p05-visual-oracle-fixtures.mts`, self-verifying manifest, sessionId=`p05-oracle-<id>`, stateDigest=save sha256), oracle/journey runners with atomic sidecars, and the CF-02 launcher family (exe-sha binding, stale-Assets refusal, evidence-collision refusal, run-binding.json). **Gap:** no `valid/stale/unreadable/absent` artifact-status vocabulary exists in code — the r1 assumption that P05 would ship one was wrong; P06's proof wave authors it fresh (charter W7). |
| **Save/projection/schema versions** | A | **DELIVERED** (§1). Additional binding fact: `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` (bridge/runtime-checkpoint.ts) does NOT yet contain `sha256:0474ceaf…`; the file's own schema-bump law requires appending it (label `projection-v13`) in the same change that mints the P06 schema. Prior-schema migration discards journals and resets revision by design. |
| **Clean P05 accepted branches** | A | **DELIVERED** (§1; integration performed and remote-verified at campaign start). |
| **System menu / Save / Load / Quit owner** | B | **REUSED.** `StudioSystemMenuContracts.DiscardPromptFor` (P05A.2 separable-boolean composition) is the discard-prompt template if ever needed; Production route precedent is no-draft/no-prompt, which Release follows. |
| **Retained workspace host and Back stack** | B | **REUSED** via the chartered third-route refactor (route enum replaces the two-bool toggle; `TryConsumeCancel` and `Maintain*` blocks get route-aware branches). |
| **Bridge client, journal, opaque-intent route** | B | **REUSED.** `ActionsEnabled` = live ∧ !inFlight ∧ !pendingPost ∧ continuity-match. `FindFirstIntent(kind)` survives for legacy verbs only; Release binds exact kind+productionId (the `DecideOperation` pattern). Cede-ownership (`presentIntentOwners`) has no Post/Release membership yet — W5 adds `SetReleaseOwnerPresent` mirroring casting. |
| **Release state, migration, commit intent, committed-only admission** | C | **W0 freeze recorded in the final charter §3** (root shape, action/intent names, V16, both-arm gate law, admission witness, decision tier, projection extension). |
| **Manual Advance / Living Time / Next Event split** | C | **W0 freeze recorded in the final charter §3.** Final P05 facts: the `advanceWeek` intent is published only when `studioDecision(state)===null`, and Unity `RollVerdict.Classify(FindFirstIntent("advanceWeek"))` treats presence as auto-roll permission; no single-week HUD control exists. The chartered split: release-review decision does NOT suppress the manual `advanceWeek` intent; a new projected `automaticWeekRollEligible:false` fact pauses Living Time; Next Event stops at the release decision. |
| **Publicity context route in Release Review** | D | **INCLUDE read-only.** `publicityOffers` already ride the snapshot field-for-field (`LotPublicityOffer`); `marketingLevelsFor`/`Production.budget.marketing` are single-sourced. Zero new engine truth needed. |
| **Richer Post vignettes, preview, era profiles** | D | Unchanged from r1 (after core readability). |
| **Manual editing, invented subphases, result UI, redesigns** | E | Unchanged from r1 (§8 hard exclusions). |

---

## 4. P04+P05 lessons as P06 requirements

The r1 §4 table (18 permanent requirements) stands unchanged and is incorporated by
reference. Add from the P05 closeout (`P05-IMPLEMENTATION-AND-OWNER-PLAYTEST-LESSONS-LEARNED.md`):

| # | New permanent requirement |
|---:|---|
| 19 | Proof worlds must include rosters/economies at and below the legal minimum, not only comfortable fixtures (P05 lesson 1/2). |
| 20 | A blocker may leave a projection only when its replacement demonstrably renders (lesson 3). |
| 21 | Every player-relevant engine capability must be reachable from a visible surface; audit "from where can a player invoke this?" (lesson 4). |
| 22 | The real Owner-profile byte-copy is a mandatory proof layer (lesson 11) — the P06 baseline copy was taken at campaign start (sha256 `d949003e…`, stored read-only outside the repo). |
| 23 | Owner comprehension is a product test; copy must answer what/why/what-next unprompted (lesson 13). |

---

## 5. GO adjudication

Every r1 GO criterion is satisfied **except one, which is explicitly waived
rather than claimed**: the r1 clause requiring the reusable evidence manifest to
already distinguish valid/stale/unreadable/absent artifacts is NOT met — no such
vocabulary exists in either repository (verified). Under the Owner campaign
order — whose proof law requires per-scene state sidecars and forbids blaming
the product for unreadable or stale evidence, which together demand exactly
this vocabulary as P06 proof-wave output — the clause is waived at the gate and
reassigned to W7 as new work; a P06 seal
without it remains a NO-GO at seal time. Every other criterion is satisfied:
P05 sealed AND Owner-accepted (citable);
final SHAs/branches pushed, clean, remote-equal; changed paths supplied; versions +
generated hashes agree under the sealed manifest; Wrap/resource release proven and
invariant-enforced; exact id survives into the closed projection; post-Wrap owner
explicit (with the one chartered REPLACE); waiting/capability/facility facts
projected; N-Stage registry + extension seam pinned; rail/workspace/menu/input
owners pinned; person/body index + presence routing pinned; one snapshot-build
context with a named extension point; Living Time/Next Event seams pinned with the
W0-frozen split; evidence manifest reusable; test counts + sealing artifacts
named; no unresolved P05-dependent placeholder in gate, recon, or charter; and
no unresolved same-level conflict with the Package 06 design/annex — the one
surface-level tension (design §16.3 "must not build the whole portfolio" vs the
LSCL movie rail) is resolved by explicit supersession: the Owner campaign order
§19 authorizes the rail as a bounded presentation layer over existing truth,
and the rail carries active-lifecycle rows only (no released/theatrical/result
rows, which remain P07).

**Adjudication: GO FOR AUTHORIZED IMPLEMENTATION.** Owner authorization exists (the
2026-09-01 five-day campaign order explicitly authorizes P06 implementation), so the
r1 caveat "GO is not automatic authorization" is discharged.

## 6. NO-GO criteria

Retained verbatim from r1 as standing stop conditions during implementation; any
condition becoming true mid-campaign stops the affected wave.

## 7. Disposition

- **Readiness:** GO (this document).
- **P06 implementation:** AUTHORIZED (Owner order 2026-09-01).
- **Package 06 product law:** unchanged.
- **Package 07 work:** prohibited before P06 Owner acceptance.

## 8. Hard exclusions

Unchanged from r1: no manual editing/timeline/subphases; no final-cut score or fake
quality; no duplicate marketing, release fee, date picker, or genre calendar; no
manual archive/export; no P07 result UI; no awards/franchise/IP economy; no renderer
migration/HDRP/DOTS/global reskin.

## 9. r2 validation

This r2 changes only the three P06A launch documents on a documentation branch; no
production, generated, or Unity file changes with it; no runtime/HID activity was
used to produce it (recon was read-only inspection); the future Oracle remains
exactly six scenes; the Package 06 boundary is unchanged.
