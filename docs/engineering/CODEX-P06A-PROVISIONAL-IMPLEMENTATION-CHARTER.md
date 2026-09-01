# Project: Studio — P06A Implementation Charter

**Revision: P06A-IMPLEMENTATION-CHARTER-r1-FINAL**
**State: AUTHORIZED — Owner five-day campaign order, 2026-09-01**

The r1-PROVISIONAL charter (imported verbatim at `1f5c459`, authored at
`c74cf79…`) is superseded by this FINAL revision. Every placeholder is resolved
(readiness gate r2 §1 is the single value table; the r2 recon §6 is the frozen
release-authority design). The Owner's campaign order supplies implementation
authorization; the entry gate below is adjudicated satisfied.

Filename note: this file retains its historical name for continuity; the
revision stamp above, not the filename, carries authority.

---

## 1. Resolved inputs

All `FINAL_P05_*` values: see `CODEX-P06A-READINESS-GATE-00.md` (r2) §1 —
sealed pair `a994de3…`/`784f2d5…`, schema `sha256:0474ceaf…`, protocol 4,
projection 13, save V15, consumer hash `9c3df11c…`, changed paths, test counts,
acceptance record, clean-remote proof. Seam resolutions (wrap handoff, post
facility seam, oracle seam, rail/workspace, person-body, snapshot-build,
living-time/next-event): `CODEX-P06A-IMPLEMENTATION-RECONNAISSANCE.md` (r2)
§1–§5.

## 2. Entry gate — adjudicated

r1 §2.1 items: (1) P05 sealed + Owner-accepted ✓; (2) branches/SHAs/paths/
equality ✓; (3) clean worktrees + manifest binds bytes ✓; (4) versions + hashes
✓; (5) generated-contract gate accepted (CF-08 ordering + tests, CF-09 pinned
two-repo verifier; byte-verified) ✓; (6) wrap condition + resource release +
post-Wrap owner pinned ✓; (7) post facility/waiting/slot/body facts + missing-
body policy pinned ✓; (8) registries/person-body/presence/rail/workspace/host/
input/menu/Back/Locate/living-time/next-event/snapshot/evidence seams pinned ✓;
(9) r2 gate GO + r2 recon placeholder-free ✓; (10) this charter FINAL ✓;
(11) Owner authorization = the 2026-09-01 campaign order ✓; (12) clean isolated
worktrees + one-owner reservations — created at wave start per §5.

### 2.2 Package goal and stopping boundary — unchanged

> wrap → exact Production / Post owner → autonomous active Post → Release Ready
> held uncommitted → explicit exact-ID `Commit <title> to Release` → persisted
> committed state → one dispatch acknowledgment → Save/Load → **STOP before P07
> result interpretation**

### 2.3 Product laws carried into every wave — unchanged from r1

(TypeScript owns state/time/legality/save/RNG; Unity presents and dispatches;
one exact productionId everywhere; world route without rail priming; selection/
open/Back/Hold mutate nothing; ready holds at tick 1; commit advances no time;
committed-only ID-sorted batch; both arms obey the same hold law — the legacy
arm DOES decrement today and is gated the same way, holding without inventing a
workflow; manual Advance stays legal while auto-roll and Next Event stop; six
distinct lifecycle states; one pure ReleaseDecisionState; no silent no-op;
disabled actions name cause+remedy; no poll latching; exact ID beats first/
title/position; Director+craft only at active Post; lot dominant; proof layers
separate; technical KEEP ≠ Owner acceptance.)

## 3. Frozen release-state design

The complete frozen design is r2 recon §6 (persisted V16 `releaseAuthority`
root; `commitPictureToRelease` action + intent; deterministic
`release-commitment-${productionId}` identity; both-arm gate + admission
witness + pre-RNG equality check + atomic prune; decision tier 4
`release-review`; `automaticWeekRollEligible`; manual-advance carve-out for the
release-review decision only; `releaseReview` next-event stop;
`release-committed` operationalState; projection 14 + prior-schema append; no
quote family). That section is the W0 output and is binding on W1–W8.

## 4. File-owner and collision doctrine — FINAL

r2 recon §11 is the ownership table. Named single-file lock points: the
`Action` union + `applyActions` exhaustive switch; `ProductionOperationsCommand`
+ `firstFilmJourney.commandGuidance` (compile-coupled); `operations.ts`
advance arms; `tick.ts` step 2; the V16 mint (one owner);
`StudioWorkspaceHost` route refactor (lead integration). Any shared file
discovered outside the table stops the wave until an owner is named.

## 5. Implementation waves — FINAL

Wave structure, permitted/forbidden work, runtime requirements, stop conditions
and rollbacks carry over from r1 with these final corrections and exact paths.
Isolated worktrees are created from the two new WIP branches
(`wip/p06a-post-release-living-studio-01-ts` from the docs-inclusive TS
campaign tip; `wip/p06a-post-release-living-studio-01-client` from Unity
`784f2d5…`) under durable `/Users/bruce/` paths (the /private/tmp precedent
dies on reboot; the sealed launcher itself warns of this).

### W0 — DONE (this refresh)

Outputs: r2 gate (GO), r2 recon (placeholder-free, design frozen), this FINAL
charter. No production file changed. Storage-shape comparison, decision
priority, save version, intent name, projection root, post-body policy,
manual/automatic split, owners and test-count baselines are all settled above.

### W1 — TypeScript release authority (Core Release owner)

Exact paths (final): `src/core/types.ts` (Action union, `GameStateV16`,
`StudioReleaseAuthority`, `StudioDecisionView` member, `StudioEvent`
`releaseCommitted`), new `src/core/releaseAuthority.ts` (root invariants +
selectors + hold-consequence read model), `src/core/actions.ts`
(`applyCommitPictureToRelease`), `src/core/operations.ts` (BOTH arms gated;
admission witness in `ManagedProductionAdvance`), `src/core/tick.ts` (entry
validation, witness equality before RECEPTION, atomic prune),
`src/core/save.ts` + `src/core/index.ts` (V16 mint + exports),
`src/core/productionIdentity.ts` (commitment coverage),
`src/core/scriptReadModel.ts` (tier 4), `src/core/firstFilmJourney.ts`
(Review/Hold/Commit guidance, site `post`), `src/core/studioCalendar.ts`
(truthful ready/committed release-week semantics),
`src/core/castingPackageReadModel.ts` (`returnWeek` truthful-release-week sweep
— hostile-review F4: a held uncommitted picture's company has NO truthful
return week and must publish the held-for-release fact instead of
`week + remainingTicks`, which would otherwise promise "next week" forever;
committed → next week; wire copies/labels in `bridge/casting.ts` follow),
`ui/src/engine/adapter.ts` (live save wiring, ladder + `releaseReview` stop),
`bridge/session.ts` — live-save arms PLUS the one-line intent-gate carve-out
(publish manual `advanceWeek` when the only unresolved decision is
release-review; hostile-review F7: landing tier 4 without this carve-out in the
same coordinated cutover would strip manual advance from a held studio,
violating §2.3's carried law inside the WIP branch) — and
`bridge/runtime-checkpoint.ts` live-save arms,
`scripts/bridge-contract-consumer-lock.ts` (`CURRENT_ACCEPTED_SAVE_VERSION`
16), plus focused tests (transition truth table; V1–V15→V16 all-ready-
uncommitted; V16 committed round-trip; managed AND legacy hold across weeks;
commit advances nothing; duplicate names existing commitment; witness/orphan/
malformed-zero refusals; reverse-click-order equivalence on admitted ids +
FilmResult/RNG/economy order; same-title isolation; golden batch comparison
against P05 law; checkpoint/journal preservation on the still-current schema).

Forbidden: reception/economy/standing/run changes; new phases/subphases; Unity
or browser presentation (the named adapter seams excepted); preserving
auto-release for imported ready saves.

### W2 — Projection and generated consumer (Contract owner)

Exact paths: `bridge/schema/bridge-schema.ts` (`release-committed` state,
`commitPictureToRelease` intent kind with required non-empty productionId,
release-review projection, `automaticWeekRollEligible`, PROJECTION_VERSION 14),
`bridge/snapshot-build-context.ts` (`release()` fact), `bridge/session.ts`
(intent resolution incl. the release-review manual-advance carve-out;
projection wiring), `bridge/runtime-checkpoint.ts` (append `0474ceaf…` →
`projection-v13` prior), `ui/src/engine/productionOperationsProjection.ts` +
`ui/src/lot/snapshot/StudioLotSnapshot.ts` + `ui/src/lot/snapshot/nextEvent.ts`
(closed-shape extensions; `releaseReview` stop reason),
`ui/src/engine/adapter.ts` location REPLACE (`releaseReady`→`post`; committed→
`post`; board-card copy), generated outputs via `npm run
generate:bridge-contract` + fixtures + `verify:bridge-contract-consumer`
against the pinned Unity consumer. Never hand-edit generated files. CF-08
generator tests must stay green; no same-named cross-member property additions
without a failing-closed generator proof. **Sequencing law (hostile-review
F10):** between W2 (eligibility fact on the wire) and W5 (Living Time consumes
it), a regenerated dev build would auto-roll through release decisions — the
sealed client still treats `advanceWeek` presence as permission — so no
runtime time-behavior proof may run against a P06 build until W5's consumer
lands. Cross-version safety is closed by the schema mint (`SCHEMA_MISMATCH` +
the governed prior-checkpoint path).

### W3 — Production / Post world owner (Unity World owner)

New `Assets/Studio/Runtime/Infrastructure/StudioPostPresentationRegistry.cs`
(+ `IStudioPostPresenter`) copied from the Stage registry shape; new focused
Post inspector/entry-card surface listing exact waiting/active/ready/committed
rows (zero/one/several/stale/disappear per r1 §7 matrix); exact facility
labels; missing/duplicate mapping fails visibly; `Locate` failures explain.
`StudioBridgePresentation.cs` is NOT edited in W3 (registration deferred to W8
integration). Rail-free route proof; no first-match anywhere.

### W4 — Post world life (Unity World owner)

New Post presenter component (idle/waiting/active/ready/committed state roots;
era-neutral occupied cues; exact Director/craft presence via published
presence; deduplicated ready/dispatch cues keyed by the `releaseCommitted`
event identity; text+shape state, colorless-legible). No cast editing, no
machinery-as-authority, no Theater cues before actual release.

### W5 — Release workspace + time consumer (Unity Workspace owner)

New `UI/StudioReleaseWorkspace.cs` (+ UXML/USS) on the Production-route
stateless model; new `Infrastructure/StudioReleaseContracts.cs` — ONE pure
`ReleaseDecisionState` (headline/detail/primary label/enabled/pending/stale/
refusal/remedy) with exact kind+productionId intent match and reason constants;
`COMMIT <TITLE> TO RELEASE` copy; inert first activation; single-flight
dispatch; per-frame re-gate (no poll latching); `StudioLivingTime.cs`/Hud —
consume `automaticWeekRollEligible`, add the one `Advance one week` single-shot;
`StudioBridgeClient.cs` cede addition (`SetReleaseOwnerPresent`) is
inspected/tested here but edited in W8 integration. Narrow/200%/keyboard/
reduced-motion structure. Host route-enum refactor lands in W8 before this
route is wired live; W5 builds against the refactored seam behind the lead's
integration branch.

### W5b — Living Studio Command Layer (Unity Workspace owner, bounded)

The §19 campaign-order surfaces, all read-only over existing truth: rail rows
gain lifecycle vocabulary (DEVELOPMENT/CASTING/PRODUCTION/POST/RELEASE READY/
COMMITTED from `operationalState`), waiting state, attention badge, exact
Locate; one persistent discoverable Talent entry point (existing market/roster
facts; candidates never shown available-now; no contract bypass); building
attention badges (shaped + text, replacing rotated-roof-text reliance); HUD
truthful decision/pause reason; decorative lot-life rules (no IDs, zero-safe).
Research-delta anti-patterns are binding: no spreadsheet rail, no color-only
state, no workspace that erases the lot (retained surfaces keep the visible
lot edge per the annex geometry).

### W6 — Persistence, reconnect, batch-order proof (Proof/Continuity owner)

As r1, with final facts: current-schema checkpoint keeps journal/session
identity through W1; P05-prior checkpoint (post-W2) takes the governed
journal-discard path; both proven on deterministic fixtures AND a copy of the
campaign baseline profile (`/Users/bruce/Project Studio Owner Profile
Baselines/P06-campaign-start-20260901/`, never the durable original);
two-committed + one-held reverse-order equivalence; exactly one
`releaseCommitted` event + one FilmResult per admitted id; mutation-checked
guards.

### W7 — Six-scene visual oracle + real-profile journey (Proof owner)

Exactly six scenes: Idle Production/Post; Wrapped/Waiting for Post; Active
finishing; Release Ready; Committed to Release; Multi-picture contention +
exact-ID isolation. New `scripts/gen-p06-visual-oracle-fixtures.mts` following
the sealed P05 generator format (sessionId `p06-oracle-<id>`); runner scenes on
the `StudioProductionOracleRunner` pattern; launchers copy-adapt the CF-02
family with fresh ports; author the artifact-status vocabulary
(valid/stale/unreadable/absent) fresh — it does not exist yet. Real-profile
journey: Wrap → Post → Ready → Hold → knowing advance → return → Commit →
dispatch → Save/Load → STOP; HID law (cursor park, modifier normalization+
recording, no parallel suites, binding before driving).

### W8 — Integration, hostile review, seal (Lead)

Host route-enum refactor; `StudioBridgePresentation` registration;
`StudioBridgeClient` cede; scene/bootstrap; full floors; one fresh
highest-capability hostile reviewer against the campaign order's 25 rejection
criteria; fix-at-owning-seam; same-reviewer disposition; FF-only campaign
integration; candidate `~/Desktop/P06A-Owner-Candidate-<short-ts>-<short-unity>/`;
report `KEEP CANDIDATE — OWNER ACCEPTANCE PENDING`.

## 6. Proof pyramid and acceptance ledger — unchanged from r1

## 7. P07 handoff gate — unchanged from r1

## 8. Hard exclusions — unchanged from r1

## 9. Charter validation

This FINAL charter: no unresolved placeholder; state AUTHORIZED with the exact
authorization instrument named; every wave has owner/paths/permits/forbids/
tests/runtime/stop/rollback; Oracle six scenes; Owner journey stops before P07;
no hard exclusion in any wave; Package 06 product law unchanged.

---

## Appendix A — The 25 hostile-review rejection criteria (campaign order §28, committed verbatim so W8 is executable from the repository alone)

The W8 fresh reviewer must be asked to reject for:

1. Release Ready still auto-releases without commitment.
2. Commit advances time.
3. Uncommitted movie enters release batch.
4. Duplicate/stale commitment releases twice.
5. Click order changes batch/RNG/economy.
6. Post invents editing subphases.
7. Greenlight outlook is mislabeled final quality.
8. Marketing is charged twice.
9. Production/Post building depends on rail priming.
10. Several movies bind by array position/title.
11. Waiting movie disappears.
12. Wrong Post facility/body.
13. Cast appears editing without authority.
14. Current movie leaks into another row/building.
15. Side rail becomes gameplay authority.
16. Visible action silently no-ops.
17. Disabled reason is wrong.
18. Polling latches Release.
19. P07 results leak into P06.
20. P05 Casting/Talent/Production regresses.
21. Economy is retuned without authority.
22. Screenshots are not exact-binary bound.
23. Real-profile copy was skipped.
24. Comments/reports contradict final code.
25. Proof proves only authored happy fixtures.

Disposition law: fix every genuine finding at the owning seam, rerun affected
proof, return to the SAME reviewer for final disposition. No reviewer-shopping.

## Appendix B — Living Studio Command Layer requirements (campaign order §19, committed so W5b is executable from the repository alone)

Authorized bounded cross-cutting presentation refinement over EXISTING accepted
authority (Development, Casting, Production, Talent, Post, Release Ready). No
new simulation mechanics.

**Movie progress rail** — compact portfolio of every active movie; each exact
row: title, current phase, current department/building, time-or-waiting state
when authoritative, action-required indicator, blocked/queue state, exact
Locate, details/open affordance. Lifecycle vocabulary: DEVELOPMENT / CASTING /
PRODUCTION / POST / RELEASE READY / COMMITTED. No P07 result interpretation, no
generic progress percentage, no spreadsheet overload. Peripheral shortcut
layer; never required before clicking the physical world owner.

**Talent access** — preserve the Casting shortage → Find an Actor route; where
safe, one discoverable persistent Talent entry point owned by an existing world
location or compact side button, exposing contracted people, freelancers,
hiring candidates, busy people, return week, exact current assignment. No broad
HR game; a hiring candidate never appears currently available; no contract-
authority bypass.

**Top HUD** — preserve readable date/week, Pause/1×/2×/4×, cash, truthful
current decision/pause reason. No ungoverned financial forecasts.

**Building attention** — attention belongs to the place that owns the work;
restrained signals for screenplay review, casting shortage/results, production
action, post waiting/ready, hiring opportunity where relevant; no repeated
global alerts.

**Lot life** — people/equipment make existing authoritative work visible;
decorative bodies have no authoritative person ID, carry no payroll/progress/
blocker/outcome meaning, may be reduced to zero without changing simulation,
and never masquerade as named talent.
