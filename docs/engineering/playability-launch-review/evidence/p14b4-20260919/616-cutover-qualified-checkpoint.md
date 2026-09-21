# 616 — Qualified checkpoint: the coordinated P14B.4 core/save/runtime/wire cutover (record 600 → 602 → 600-W → 600-T2/600-T3 → 600-R)

2026-09-21. Claude Code parent. The Owner's ruling on record 578 (record 600: D1 (a), D2 (i-c),
515 §6 (c), 576 fact, C1 closed) reopened engineering; this record closes the checkpoint the
ruling ordered ("Execute the coordinated P14B.4 core/save/runtime/wire cutover"). The candidate
was independently reviewed READ-ONLY by the contract-auditor (600-R, verbatim in
`600-R-review.md`, SHA256 `92161de1965e9935fdc7b1e753d95b8ea5a4b8f5c5ab363bf95ac79e8ba457f6`):
**QUALIFIED WITH RECORD-ONLY ITEMS; no demonstrated defect in source or tests; every remaining
full-core failure classified.** Nothing here is Owner acceptance; the suite is not all-green
(39 classified failures); the rival outcomes family, evaluator 5, seating preference and the
`breakPromisesOnCancel` correction stay open.

## Identity (HEAD `f2192d8b`, clean tree; remote verified after every push)

Base `0af0dabe` (headers after 602) + five writer commits, each cumulative diff byte-equal to the
writer's patch (`600-W-cum-S1…S5.patch`; S5 = `fee048b5…`, the `testedDiffSha256` of 603–607):

| Step | Commit | Content |
| --- | --- | --- |
| S1 core | `47b2bbf4` | `types.ts` live aliases → V30; `promises.ts`: evaluator 4 (masks through `seatedPreFirstTake`/`expectedFirstTakeWeek`/`existingPath`; `reserved + X > nMax − promiseBuffer(nMax)` → FRAGILE at :432; P2 line removed from `NOT_OFFERED_IN_B1`; classless-P2 and tagged-non-P2 refusals; tagged inputs-digest row appended last; full-predicate two-branch mint; `settle` narrowed); `PROMISE_RULES_VERSION = 4` with the law named |
| S3 save | `3b8f5b6a` | `LIVE_SAVE_VERSION = 30`, `makeSave` → `validateSaveV30`/`SaveFileV30`; comments; `legacy-v28-fixtures.ts` two type-only lines (C7) |
| S4 load/runtime | `2cbc3de5` | `session.ts`, `campaign-library.ts`, ui adapter arms, d17 drivers (C6) → `migrateToV30`; `runtime-checkpoint.ts` V30 current envelope, strict V30, prior chain, R05 annotation |
| S2 policy | `a64ac00b` | `authorRivalPromise`: unproven → flexible `leadOrAntagonist` P2 then P1; proven → P1; first ACHIEVABLE attached, same unchanged state for every read |
| S5 wire | `027155e7` | `PROJECTION_VERSION 47`; closed family-discriminated P2 draft (required `seatClass`); nullable `seatClass` on own snapshot/history; `preferredOpportunity` on preferences; one wire→core conversion; disclosure `seatClass` (C4); outgoing46 `584bdd…` → `projection-v46` (C3); generator artifacts regenerated once (C8) |

Then `45d62b30` (evidence 603–607), `be0c3c0b` (608/609), `e9f4962b` (600-T2: 100 test files
+566/−414), `6f9c8006` (610–614), `f2192d8b` (600-T3: eight UI pins 28→30; 615). Seven
substantive commits (five writer, two test-author).

File identities at HEAD (SHA256 prefix / lines): `src/core/promises.ts` `f9f85416…` 1095;
`src/core/types.ts` `3c1cab47…` 2519; `src/core/save.ts` `f20d6317…` 8749;
`src/core/talentMarket.ts` `6b31bc78…` 1485; `bridge/runtime-checkpoint.ts` `14602322…` 1383;
`bridge/schema/bridge-schema.ts` `b69e8907…` 3544; `bridge/promises.ts` `596f15e6…`;
`bridge/contract.ts` `57f66095…`; `bridge/people.ts` `8d9cc924…`;
`bridge/schema/project-studio-bridge.schema.json` `1a61422c…`;
`generated/unity/StudioBridgeDtos.Generated.cs` `5df92d48…` 10087;
`generated/unity/project-studio-bridge.contract-manifest.json` `2eab1ed3…` (schemaId
`sha256:6f6b48805aadcf14d456614d87bf1571eb1ce0d9aa0bc44f604e7976f4f85538`, projection 47,
protocol 4, generator source `17da544b…`). Replay module `src/core/promiseCapacityOwnerReplay.ts`
UNCHANGED at `9e97ffed…` (parent-verified; 515 §6 (c)). Contract identity: rules 4 / Save V30 /
projection 47 / prior registry 35 entries / F10–F11 `53058c23…`.

## Evidence (record-check, one process at a time; all `fixedSource: true`)

| # | On | Result |
| --- | --- | --- |
| 601 | 5e6ac5dc + 600-T diff | reconciled RED baseline 25 failed / 20 passed / 3 todo (unchanged source) |
| 603 / 604 | 0af0dabe + `fee048b5…` | root tsc: exactly the five C2 test residuals; bridge tsc: two designated + `bridge-p14b3-promise-command:155` (moved premise, R-3) |
| 605 / 606 | same | `check:bridge-contract` and `:fixtures` clean |
| 607 | same | live-P2 set + evaluator-5 file: **83 → 12 failed / 181 passed / 1 todo** (12 = 9 `rivalWorlds` + :438 + policy :529 natural premises, 1 evaluator-5 by law) |
| 608 | 45d62b30 | full core BEFORE the sweep: 96 files / 312 failed / 3482 passed / 7 todo (the sweep surface; inherited baseline 89b5ad2 = 22 failed in 7 files) |
| 609 | 45d62b30 | campaign-library 11 timeouts alone (inherited since p13b-s2); prepared-reuse passes alone |
| 610 | e9f4962b | full core AFTER the sweep: **13 files / 39 failed / 3755 passed / 7 todo** = 22 inherited + 2 designated (stale route :234; evaluator-5 :239) + 11 natural + 4 load-only |
| 611 | e9f4962b | the 4 load-only (bridge-supervisor ×3, prepared-reuse ×1) pass alone 35/35 |
| 612 / 613 | e9f4962b | root+UI tsc EXIT 0; bridge tsc EXIT 0 — the OLD designated TS2353 has cleared |
| 614 → 615 | e9f4962b → 6f9c8006 + `f928f68a…` | UI five-file set 8 failed (stale 28-pins since d49cc27) → 45/45 after 600-T3 |

Never cite 610 as all-green (R-9). The 600-T2 seed-scan probe logs (23 files) are archived
under `600-T2-probe-logs/` (R-6 (i)).

## Rulings adopted from 600-R (R-1 … R-9) and the parent's readings

- R-2 (C12): `reserved + X > nMax` → IMPOSSIBLE "promises already made to this person exhaust
  the window" (`promises.ts:422`); `reserved + X > nMax − promiseBuffer(nMax)` → FRAGILE "the
  schedule leaves no spare picture inside the window" (:432-434).
- R-3: the C2 deviation (a third bridge-tsc residual at S5, inherent to the closed wire union)
  was reconciled by 600-T2 §B(iii); not a defect.
- R-4: the G9 class ("rival flexible-first authoring movements") is recorded by name: no pinned
  winner moved (poaching PLAYER event 145 = record 556; `rivalFixture` open 196 / terminal 213 /
  promise-16 P1; `bridge-p14b2-trust` 22/22; trust-chooser test 6 GREEN — the migrated D3 proof
  is the RED→GREEN witness of this cutover); fixture finding F-G9-1 (no natural P1-fallback
  witness on the default seed; `seed-b`/`seed-c` carry one); D.1–D.3 (below). The pre-cutover
  values of the UNPINNED unproven-person settlements at week 208 are not recoverable from any
  record (600-T2 §G).
- R-6: the seed-scan reconciliation of the three natural premises is authorized as the NEXT
  bounded test-author pass under plan T2, with the four conditions of 600-R Q6: its own record
  with the seed-scan evidence; no default-seed assertion dropped and the witness set kept
  required; the `rivalWorlds` SLOTS prerequisite verified on the chosen seed first; the `:438`
  fix a cast choice (the issuer's other bound OPEN beneficiary or an explicit cast), never an
  invented binding. The six live-P2 files change only in that pass. It is not closure of the
  rival outcomes family until the nine cases run GREEN on a recorded seed (26 §2 partial-evidence
  boundary).
- R-8: stale titles/comments (600-R Q2 list), the generator-test comment :663, the
  `p14bf2`/`p14b3` describe titles still saying Save29/projection46, and the 574-R
  `promiseCapacityOwners.ts:8-9` doc fix wait for the next test-author/writer release.

## Owner-visible launch behaviour at rules 4 / Save V30 / projection 47 (600-R Q7; R-5)

Plan law the Owner accepted with record 600 (items 1–6):
1. Fresh P1 and tagged P2 read with the residual buffer: a person holding overlapping
   reservations can read FRAGILE "no spare picture" where rules 3 read ACHIEVABLE (paper
   thresholds ≥ 2 competing reservations at a 28-week window, ≥ 3 at 40, ≥ 4 at 52, ≥ 19 at
   208). No installed control moved.
2. A tagged P2 counts only mask-qualified fixed seats as existing paths/events; a support seat
   on a running picture no longer helps a lead / lead-or-antagonist promise.
3. A classless P2 is refused at a new quote or freeze ("a seat-class promise needs its seat class
   selected (lead, or lead-or-antagonist); without one it is not offered"); on the wire it cannot
   be sent at all (projection-47 grammar → INVALID_COMMAND). A reader-admitted legacy classless
   P2 still reclassifies IMPOSSIBLE at freeze and on cancel (same classification, new sentence).
4. Rules 4 is stamped on every fresh receipt and root; historical roots/receipts untouched.
5. Save V30 is the only writer; every prior save migrates on load; a save holding any tagged
   root cannot be downgraded to V29 or older ("cannot downgrade SaveFileV30 or discard a tagged
   promise predicate"). Because rivals author tagged P2 to unproven persons in every natural
   chain by about week 196, an older build refuses most mid-game saves from this one.
6. Wire: projection 47; the proposal draft's `promise` is a closed union (P2 REQUIRES
   `seatClass`, no default; count-only families take no class); own promise snapshot and
   history rows carry `seatClass` (real class or `null`); preferences carry
   `preferredOpportunity`; competing rows stay whole `UNKNOWN`; Pulse untouched. Runtime:
   outgoing 46 registered as `projection-v46`; prior checkpoints migrate each slot to V30 bytes.

The plan's own delegated hypothesis, "subject to expansion review" (plan :187; not an
Owner-selected rule):
7. Rival authoring order: for a publicly UNPROVEN person a rival authors a flexible
   `leadOrAntagonist` P2 (count 1, full term) when achievable, P1 only as fallback; proven
   persons keep P1. Consequences observed: tagged rival roots to unproven persons in every
   natural chain (default chain promise-10/11/28/29/32/33, one bound at 208; poaching seed
   promise-42/43); rivals earn D3 opportunity against a player P1 for unproven persons; rival
   material digests change. Pinned winners did not move; the P1-fallback branch has no natural
   witness on the default seed.

## Unity / native backlog created (600-R Q8; nothing native touched or built)

1. `StudioMarketProposalPromiseDraftPayload` is now an abstract base with sealed members
   `…CastClassPromiseDraftPayload` (`family` discriminator, `seatClass` `Required.Always`) and
   `…CountPromiseDraftPayload`, plus a family-switching JSON converter; a native composer that
   instantiated the sealed DTO must instantiate a member.
2. Native class selector for P2 (lead / lead-or-antagonist; no default) in the proposal composer.
3. Nullable `seatClass` on own promise snapshot and history rows: render the real class or an
   honest legacy/unknown, never a fabricated lead.
4. `preferredOpportunity` on the preferences snapshot.
5. Projection-47 schema identity `sha256:6f6b4880…` and Save V30 loading; prior 46 checkpoints
   migrate through the registry.
6. Consumer-repo sync of `StudioBridgeDtos.Generated.cs` (`unityGeneratedContractSha256`
   `5df92d48…` is the expectation, not evidence the Unity repo was updated).

## Natural premises left (600-T2 §D, 600-R Q6; the R-6 pass)

- `p14b4-cast-class-outcomes` `rivalWorlds` ×9: the SLOTS prerequisite is met at 212 (P1 roots);
  the missing prerequisite is `genuine` (the only bound tagged root is to a craft worker never
  cast); `seed-b`/`seed-d` carry a genuine tagged lead/antagonist at 215 (their SLOTS unverified).
- `:438`: the fixture's bound roots are promise-0 → t-act-09 and promise-1 → t-act-08 while
  `playerPayload` seats t-act-12/t-act-13 by contract order (t-act-08 third) — fixture
  construction, not the engine.
- `p14b4-cast-class-policy:529` `P1fallback`: needs an incumbent with no unproduced script
  seating the unproven actor in SUPPORT pre-first-take; unreachable on the default seed within
  220 ticks; witnesses on `seed-b`/`seed-c`.

## Record-only items carried

599 (Ruling 2's six textual under-reservations; C5(ii) closed; the four-commit shape for any
future C1 slice); 598-R items 1–10; 574-R items 1–9 (owners header :8-9 doc fix still deferred);
553-R items 1–3; 602 R6 (evaluator-4 parity artifacts: a non-mask running seat is neither event
nor hold, `unproducedScripts` counts `inProduction`; `breakPromisesOnCancel` coupling → 600 §3
step 8 with its own RED; seating preference → own RED); the A5 sentinel correction and the
`p14b1-t4-regressions` classification correction to 600-A §4.3; `promises.ts:90` refusal text
"migrate this state to V29" (frozen, imprecise not wrong); the 600-T2 99-vs-100 file count; the
inherited set (campaign-library timeouts, campaign-isolation, scientist-foundation digests,
r3n1 fixtures, python provenance) unchanged since 89b5ad2; the C1 route-model numbers of 599 are
now measured on a module that did not change.

## Constraints kept

One heavy process at a time; two specialists at most (600-T ∥ 600-A only); one production
writer; profiles unchanged (per-call Opus overrides recorded); the writer never committed; every
commit landed through the index or by the test-author's own exact paths; no cap, tariff, refusal
in force, deadline, timeout, historical fixture or genuine corpus moved; the stale route and the
replay module untouched; Unity/native deferred; no Owner-acceptance claim. One local Git setting
was changed to publish the 9.6 MB full-core log: `git config http.postBuffer 157286400`
(repo-local; no install, hook or permission change).

## Next (bounded, no routine pause)

1. R-6: test-author seed-scan reconciliation of the three natural premises (own record; the six
   live-P2 files; conditions above).
2. Then, under the existing directive, the remaining B4 families: rival P2 outcomes on a
   recorded seed (partial evidence until the nine cases run), the final seating preference
   (`hollywoodPolicy.ts`/`hollywoodTick.ts`, own RED), the `breakPromisesOnCancel` correction
   (26 §2, own RED), the stale-title text pass and the 574-R doc fix at the next release.
3. Evaluator 5 (the joint certificate, UNCERTIFIED → FRAGILE) is a later design; D2 (i-c) says
   the metric and cap are revisited only then. Unity/native stays deferred.
