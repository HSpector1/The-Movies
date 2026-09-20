# 516 — Independent review of the 515 direction (exact pre-call bills): REFINE, adopted with refinements

2026-09-20. Project `contract-auditor` profile, READ-ONLY (Read/Glob/Grep), model override fable,
observed as Fable 5.1. It read the frozen 505 replay source (`5d4851…2941a`), the actual owners
(`operations.ts`, `occupancy.ts`, `productionPhases.ts`, `technologyProduction.ts`, `sets.ts`,
`boundedStableSort.ts`), 176/162/365, the 514 measurements and the relevant tests, and re-derived
by hand the measured label-2 bill 11193 and label-3 bill 9587 exactly before judging the terms.
Verdict: **REFINE** — qualified KEEP of the C2+C3+C4 direction with four refinements to the
terms and one correction to the verification plan. No defect in the gap finding (§3 of 515).

## Parent addendum — refined scope adopted for the writer (supersedes 515 §4 where different)

1. **No new test.** 515-A's claim that no GREEN control exercises the single Post exit is
   wrong: `tests/p14b4-started-owner-replay.test.ts:259–352` (`weeks === 2`) replays a genuine
   Post 3→2 then 2→1 and asserts calls `[2]→[1]`, projection parity with the real tick
   (releaseReady, reservations `[]`), events exactly `reservationReleased` + `phaseEntered` with
   exact draft and step order, the fixed-hold replacement, and completion within the cap. The
   test-author dispatch planned as 517 is withdrawn. Baselines on the unchanged 505 source
   already exist with fixedSource:true and identical source bytes: 508 (Started six files:
   the 259 case, the n=2 retained-Development control) and 507 (Ready six files: 276 first-take
   label 2/rT7/rT6/admission, the mixed new+retained admission case at
   `p14b4-ready-owner-replay.test.ts:231–236`, the occupied>0 admission case at
   `p14b4-ready-replay-background.test.ts:161–178`, and the 302 stale RED). They are not rerun
   merely because the coordinator changed.
2. **C2 release term.** Replace "one `equality(19)`" with the accepted one-reservation release
   shape already in source at 1362: `40 + 4*equality(19) + 2*keyBill(1,19) + LITERAL.phaseRelease
   + 6` (= 339), because the retained path performs two capability `includes` and two Set
   operations (`productionPhases.ts:161`, `operations.ts:1257–1258`). Workflow/bindings copy
   terms leave releasePhase on this path (no spread at `operations.ts:1264`) but STAY in `enter`
   (replacement copies at 1421/1431 do happen).
3. **C2 counts for the whole slate.** `retainedDevelopment` also selects slates with NEW pictures
   (`sweepBill` 1437 skips `startTick >= week`) and n > 1. Exact raw claims = Σ over ALL workflows
   of their claims; exact occupied for one retained picture = `d.external + Σ(other workflows'
   keys)`. The writer pays reads of every workflow's `reservations.length`, `shootingTask` and
   `bindings.setId` AFTER the existing guards (inside the retained loop after the
   `remainingTicks !== 8` break), or keeps `4*rawOwners` / `3*other` for any row it does not read.
   Retention ×1 (one static `preProduction` requirement); one requirement walk (conservative; the
   retained arm performs zero); keep the 20/140 constants.
4. **C3 unchanged from 515**: phaseTransitions `small(1,0,1) + small(0,0,0)`; releasePhase minus
   the `8*text` term only (copies stay: release spreads happen); update ×2; commonVisits 2.
5. **C4 occupied-key exactness first**: `keyBill(d.external, keyLength)` at rT7 and
   `keyBill(d.external + 1, keyLength)` at rT6, keeping the `+ d.external` term; the requirement
   walk keeps `2*f*(2+equality(19))`, and the handback must state that it covers the soundstage
   `facility.id !== boundSet.mountedOn` compares (5×41 + 2×59 = 323 ≤ 410). The slot 3→2 /
   composite 2→1 reduction (≈665 gross) needs a paid ordered proof that `hasUsableRehearsalSet`
   does not supply; it is OPTIONAL and only with a stated net-positive figure after the proof's
   own cost; default omit. No new `Dimensions` field for a set-id width (that would change
   discovery); if used at all, a paid `work.text(setId)` inside the branch.
   `initialAdmissionBill`: when `indexedClaims + d.external === 0`, price exactly one examined
   slot on an empty Set, `1 × (14 + 106 + keyBill(0) + keyBill(0))` = 230 instead of 896; keep the
   existing bound when occupied > 0.
6. **Placement and identity rules.** Every changed expression is keyed on `retainedDevelopment`,
   `singlePostExit`, the single-early branch or the admission `occupied === 0` arm; every other
   arm (general without the proofs, wrapOnly/singleWrapSlot, restricted) keeps its expressions so
   its bill values AND its calculator self-charges are byte-identical. New paid fact reads sit
   after the existing guards so non-selected branches' measured `used` values do not move.
7. **Predicted values** the writer's handback must state so the re-measurement is an equality
   check: bills 315 / ≈6946 / ≈8100–8280 / ≈8578 / 850 / 7948 / 576 for the seven measured stale
   frames, ≈5668 for the unreached label-8 Post exit (from 9234), and the restricted 708 unchanged.
   Auditor's term-level recount of the whole slice: ≈10.3–10.8k gross; the stale route stays
   RED, with the new boundary expected in the week-9 commit command or week-9 frame.

Next: 517 ONE `sim-core` writer (IMPLEMENT, replay module + handback only), then freeze/hash/
pins, 518 independent actual-delta review, serial fixed-source groups, 514-pattern
measurement with exact restoration, qualified checkpoint, headers, publication.

## Verbatim 516 handback (SHA256 `cec884b39a378f401ebbd707ba6cc4a68ccc70b3c2daedece2d63ed366053d47`)

> **Verdict: REFINE** (qualified KEEP of the C2+C3+C4 direction; four refinements required before the writer brief, one verification-plan correction).
>
> **Status: DONE** (read-only; no file created or modified, no command run, no delegation).
>
> **Model observed:** harness identifies me as Fable 5.1 (`claude-fable-5-1`). The lean-ctx MCP tools named in the user CLAUDE.md were not exposed to this session; only Read/Glob/Grep were available and used.
>
> ## Sources read (absolute paths, ranges)
>
> - `/Users/zacheryspector/The-Movies-headless-program/src/core/promiseCapacityOwnerReplay.ts` 122–444 (Work, LITERAL, sortBill/sorted/find), 640–679 (prepare join invariant 660), 930–1041 (dimensions), 1093–1532 (all bills), 1827–1968 (frame; reserve site 1898), 2300–2399 (initialAdmissionBill), 2400–2580 (admitReady).
> - `/Users/zacheryspector/The-Movies-headless-program/src/core/operations.ts` 80–130, 160–236, 230–427, 540–586, 588–654, 1240–1436, 1480–1502, 1576–1831.
> - `/Users/zacheryspector/The-Movies-headless-program/src/core/occupancy.ts` 60–330, 337–590, 621–649; `src/core/productionPhases.ts` whole; `src/core/technologyProduction.ts` 44–98; `src/core/sets.ts` 85–134, 180–184, 687–782; `src/core/boundedStableSort.ts` whole; `src/core/tuning.ts` 839–840.
> - Records in `docs/engineering/playability-launch-review/evidence/p14b4-20260919/`: `515-stale-route-attribution-direction.md` whole; `176-started-replay-work-contract.md` whole; `514-command-result-probe.md` whole; `514-command-result-stale.txt` sweepBillDone/frameEntry/result lines; 162 and 365 by grep only (key(U,k) definition at 162:91; 365 scope headings).
> - Tests: `tests/p14b4-started-owner-replay.test.ts` whole; `tests/p14b4-ready-replay-first-take.test.ts` whole; `tests/p14b4-started-replay-retained-development.test.ts` whole; `tests/p14b4-ready-replay-stale-target.test.ts` 150–280; `tests/p14b4-started-replay-background-command.test.ts` 60–139, 195–284; `tests/p14b4-ready-replay-background.test.ts` and `tests/p14b4-ready-owner-replay.test.ts` by grep only.
>
> Calibration: I re-derived by hand from the source formulas the measured label-2 bill 11193 (common 1218 + enter 9912 + policyLock 63) and label-3 bill 9587 (common 806 + entries 7511 + releaseCopy 530 + success 740), both exact, using the 514 `Dimensions` record (n1 f5 capacity8 sets2 external0 d28 dp9 t0). The unreached label-8 bill 9234 matches both 515 mirrors component by component (allocationBill 3193, enter 7677, common 1494).
>
> ## Item 1 — C2 retained Development (`retainedDevelopment === true`, sweepBill 1433–1449)
>
> Owner facts, MET WITH EVIDENCE:
> - `releaseCompletedPhase` (operations.ts 1252–1264): `retainedCapabilitiesFor('development','preProduction')` = `['development-casting']` (productionPhases.ts 55–56, 160–161); the single reservation is kept; `released.length === 0` → returns the SAME workflow object (1264), no spread.
> - Compares on that path: `required.includes(capability)` inside the filter (productionPhases.ts 161) AND `retained.includes(reservation.capability)` (operations.ts 1257), plus `claimed.has`/`claimed.add` on a 19-char key (1257–1258). That is TWO string compares and two Set operations, not one `includes`.
> - `enterPhase` 1321: release-side `recordReservationTransition` and `replaceWorkflow` are skipped. Exactly one transition at 1380 with before=[1 key], after=[1 key], both `includes` hit → no event (554–573). `beforePhaseEntered` returns at `phase !== 'shooting'` (technologyProduction.ts 80). Copies that DO happen: `deriveBindings` spread (227), replacement workflow spread (1421), `replaceWorkflow` (576–586), production spread (1431) — all already inside `enter`'s `d.workflowCopy, d.bindingsCopy, d.pCopy, 150` and ×1 `update` (1522–1523).
> - `allocateForPhase` 292 → `occupiedSlots` 242–259 → `resourceClaims` with `{ operations }` only: one claim per reservation (409–423), none for `shootingTask === null` (424), none from 6c because `bound === null` (571–572) — and independently because no soundstage reservation exists (573). Own claim filtered by `claimPasses` (637–646). `requirementsForPhase('preProduction')` has one entry; the retained arm `continue`s at 390 BEFORE the facility walk (394–415), so the walk count on that requirement is 0, not 1.
> - Only possible outcome is success (retained facility always passes `facilities.some` at 382 because `allowsFacility` never excludes `development-casting`, technologyProduction.ts 74–77), so 176 §6 first-call coverage holds with attempts = retainedMoves (already in source 1473).
>
> Term-by-term:
> - `smallTransitionBill(d,1,1,0)` for `transition`: MET. Value 470 vs 1486 (keys 2×(8+106), includes 2×1×1×(2+equality(54)), 0 emitted). Key width: `facility-development-casting:0` = 30 ≤ d.d+26.
> - releasePhase without workflowCopy/bindingsCopy: MET (no spread at 1264). With "one `equality(19)`": DEVIATES (under-reserves the second `includes` and the two Set ops). Lawful replacement: the accepted one-reservation `release` shape at 1362 (`40 + 4*equality(19) + 2*keyBill(1,19) + LITERAL.phaseRelease + 6` = 339), or keep the general constants and substitute `4*equality(19) + 2*keyBill(1,19)` for `8*text` (424).
> - Raw claims = actual reservation count: MET for n=1 with the facts at 1443–1445 (reservations.length 1, task null); `bindings.setId` is sufficient but not necessary. PARTIAL in general: `retainedDevelopment` is also true for slates containing NEW pictures (`startTick >= week` skipped at 1437) whose workflows carry one Development reservation the loop never reads, and for n=2 all-started (retained-development test). Exact claims = Σ over ALL workflows; exact occupied for one retained picture = `d.external + Σ(other workflows' keys)`.
> - Retention ×1: MET (static table, one entry; same basis as `3*capabilityKey` in the accepted single-early bill).
> - `keyBill(0, keyLength)` for the occupied Set at the retained `occupied.add` (389): MET only for n=1 and external=0; general exact form is `keyBill(external + other-workflow keys, keyLength)`.
> - One requirement walk (295 instead of 590): MET, conservative (exact is 0 on the retained arm).
>
> Pre-call facts: phase, reservations.length, capability, task, blocker, setup are already read and paid at 1441–1447. To add (paid): `bindings.setId` (cheap, optional), and for n>1 or any new picture in the slate, every other workflow's `reservations.length`, `shootingTask`, and `setId`/soundstage presence. 176 §5 satisfied if placed inside the retained loop after the existing guards.
>
> Estimate on 514 label 2 (11193): phaseTransitions −1016; releasePhase −375 (precedent shape; −610 with the direction's thin term, which I reject); raw+occupancy 2077→640 −1437; retention 1832→708 −1124 (515-A's "~900 + ~440" double counts, exact combined is 1124); walk −295. Total ≈ −4247 → new bill ≈ 6946. Also lands on the 276 first-take label 2 and, larger, on the n=2 retained control.
>
> ## Item 2 — C3 single Post exit (`singlePostExitProof` 1399–1413, remaining 2→1)
>
> All MET WITH EVIDENCE:
> - `retainedCapabilitiesFor('postProduction','releaseReady')`: `required = []` (productionPhases.ts 60), `['post'].filter(c => [].includes(c))` performs zero string compares; the reservation loop's `retained.includes` on an empty array performs none; `claimed` untouched. Release happens (1264 false → spread of workflow and bindings via `deriveBindings` 227, so the copy terms must STAY in releasePhase; the direction keeps them).
> - First transition (1354): before 1 key, after 0 → one `reservationReleased`, `small(1,0,1)` = 186. `replaceWorkflow` #1 (1356).
> - `allocateForPhase(releaseReady)`: `occupiedSlots` sees the own workflow with 0 reservations and no task; 6c `some(soundstage)` over an empty array → no claim; `requiresSetForPhase` false (`[].includes('soundstage')`); the requirement loop 375 has zero iterations; `allowsFacility` ×5 and the real sort still run (294–299). Always `ok`, so 176 §6 coverage is exact.
> - Second transition (1380): 0/0, no event, `small(0,0,0)` = 20. `replaceWorkflow` #2 (1430). Failure arm 1370 unreachable → update ×2 exact.
> - Sweep visits (1654–1817): round 1 visit → advanced, `released` → `break`; round 2 visit → `settled.has` → `continue`; exit. Exactly 2 outer visits → `commonVisits = 2`.
>
> Estimate on label 8 (9234): phaseTransitions 2972→206 (−2766); releasePhase 799→343 (−456); update 204→136 (−68); common 1494→1218 (−276). Total −3566 → ≈ 5668.
>
> ## Item 3 — C4 single-early and admission
>
> - Occupied-key exactness: MET WITH EVIDENCE. rT7: Development slot released before allocation (retained = [] for preProduction→rehearsal), sole workflow (1254), `setId === null` (1276), own claims excluded → the Set holds exactly `d.external` keys at every `has`/`add`; `keyBill(d.external, keyLength)` is exact (55 at external 0 vs 273). rT6: retained stage key is added at 389 before the set-scenery walk, so the maximum is `d.external + 1` → `keyBill(1,54)` = 164 at external 0. Direction's "0 at rT7 / 1 at rT6" holds for external = 0; the writer must keep the `+ d.external` term.
> - Slots 3→2 and composite 2→1: PARTIAL. Requires a proof that the minimum-id soundstage (the allocator sorts by `compareId`, operations.ts 170–172, 294–299) with capacity > 0 carries a set with `mountedOn === id`, `status === 'standing'`, `condition >= 35` (sets.ts 180–184, tuning.ts 840). `hasUsableRehearsalSet` (1231–1247) returns on the first usable set in SOURCE order and does not establish id order; a paid `less` walk over facility ids (≈2×57 plus bookkeeping) is needed. The saving is 221 (one slot) + 444 (one stage) ≈ 665; net after proof ≈ 0.35–0.5k. Occupied-key exactness alone (−1308) needs no new proof. In this fixture the proof holds (soundstage-07 < soundstage-12, `set-0` mounted on 07, condition 100).
> - Requirement-walk width `equality(19)`: MET with one caveat. The walk at 394–399 compares capabilities (≤19) for every facility, but for soundstage facilities at rT7 it also compares `facility.id !== boundSet.mountedOn` (width d.d). `2*f*(2+equality(19))` = 410 still covers 5×41 + 2×59 = 323, so it is lawful; the writer's handback must state that coverage explicitly.
> - Set-exclusivity claim width at rT6 (~0.15k): OUT OF SCOPE as a new `Dimensions` field (would change `LITERAL.dimensions` and every frame's discovery). Lawful only as a paid `work.text(workflow.bindings.setId)` inside `singleEarlySweepBill`.
> - `initialAdmissionBill`: MET. When `indexedClaims + d.external === 0` (both computed before the bill at 2347–2360, 2530–2535) the owner (`addManagedProductionWorkflow` 621–626 → `allocateForPhase` with no policy) examines exactly one slot on an empty Set: 1 × (14 + 106 + keyBill(0) + keyBill(0)) = 230 vs 896 → −666. Keep the existing bound when occupied > 0 (the ready-replay-background admission with a casting reservation on the same facility takes slot 1, so the owner examines two slots there).
>
> Estimates: label 3 −1308 (occupiedKey) −180 (walk width) [−665 + proof cost, optional] ≈ −1.5k safe, ≈ −2.0k with the ordered proof; label 4 −327 (+ ~0.1k optional set-id width); admission −666.
>
> ## Item 4 — Byte-identical bills elsewhere
>
> MET by construction if every changed expression is keyed on `retainedDevelopment`, `singlePostExit`, the single-early branch, or the admission `occupied === 0` arm; the general/wrapOnly/singleWrapSlot/restricted arms keep their expressions. NOT VERIFIED until the diff exists. One placement rule the brief must state: new paid fact reads must sit after the existing guards (e.g., inside the loop at 1441–1448 after the `remainingTicks !== 8` break), otherwise non-selected branches' calculator self-charges shift and the measured `used` values in the 507–512 groups move even though bill values do not. No discovery, owner, refusal, provenance, drain, cap, span, validator or timeout change is implied by the direction as read.
>
> ## Item 5 — Coverage
>
> - C3: MET. 515-A's statement "C3 is exercised by NO existing GREEN control" is wrong. `tests/p14b4-started-owner-replay.test.ts:259–352`, `weeks === 2` arm: real state at remaining 3 (postProduction, one post reservation, task null), H = week+2; the second frame is remaining 2→1 and satisfies every `singlePostExitProof` guard (n=1, one workflow, startTick < week, remaining 2, task null, one `post` reservation, phase postProduction). Assertions covering the owner outcome: calls `before [2] after [1]` (297–300); `projection.operations` equals the real tick's (301, 309–312: releaseReady, reservations []); events exactly `['reservationReleased','phaseEntered']` with the exact release draft and step ordering after `sweepStarted` (336–347); `fixedHoldReplacements` closes the post hold at the release step (347); completion and cap via `complete()` (168–174). A new 517 test is not needed; pin this case as the C3 protection control (baseline under `record-check.mjs` before the writer, 504 pattern).
> - C2: MET. `tests/p14b4-ready-replay-first-take.test.ts` (label 2, n=1); `tests/p14b4-started-replay-retained-development.test.ts:194–197` (n=2 all-started, `[8,8]→[7,7]`); `tests/p14b4-ready-owner-replay.test.ts:231–236` (`[8,8]→[7,8]`, one started + one NEW picture — the mixed slate from item 1).
> - C4: MET for the selected arms via 276 (rT7/rT6 and admission at occupied 0); the unchanged admission arm via `tests/p14b4-ready-replay-background.test.ts:161–178` (casting reservation on the same facility). No GREEN control with `external > 0` at a single-early frame identified: NOT VERIFIED.
>
> ## Item 6 — Gap statement
>
> No error found. My term-level recount puts C2+C3+C4 at ≈10.3–10.8k gross (515: ≈11.2k; the difference is the release term and the retention double count). C1–C7 remain ≈23–27k against a 31–35k gap; the conclusion that the stale route stays RED under 176 as written stands. I cannot cite a missed lawful candidate ≥5k. Paper expectation after this slice: the label-8 frame completes and the new boundary lands in the week-9 commit command or week-9 frame; the original stale RED is preserved.
>
> ## Defects, ranked
>
> 1. Verification plan: 515-A/§5 step 517 dispatches a test-author for a control that already exists (`tests/p14b4-started-owner-replay.test.ts:259`, weeks=2). Failure it would cause: a wasted dispatch and a duplicate fixture. This corrects 515-A's recommendation.
> 2. C2 releasePhase "one `equality(19)`" under-reserves two compares plus two Set ops (productionPhases.ts 161; operations.ts 1257–1258). Failure: a bill below the source count, contrary to 176 §1. Fix: 1362 shape.
> 3. C2 exact claim/occupied counts stated for n=1 only; the flag also selects mixed slates with unread new-picture workflows (sweepBill 1437) and n>1. Failure: under-reservation on `tests/p14b4-ready-owner-replay.test.ts:231–236` if applied literally. Fix: pay reads of all workflows or keep `4*rawOwners`/`3*other` for unverified rows.
> 4. C4 slot/composite reduction needs an ordered proof `hasUsableRehearsalSet` does not supply; net ≈0.35–0.5k, not 0.67k. Fix: make it optional with a stated net-positive requirement; ship occupied-key exactness first.
> 5. C4 set-exclusivity width must not become a `Dimensions` field (discovery change). Fix: paid `work.text(setId)` in the branch.
> 6. Placement of new paid reads (item 4). Fix: state the rule in the brief and require the writer's handback to list every new `pay` site and its guard.
>
> Observation, not a defect of the direction: the general `retention` term (1207–1208) prices the retained-arm reservation spread `{ ...retained, phase }` (operations.ts 388) only through its constants; the writer must not reduce the 20/140 constants while tightening the counts.
>
> ## Proposals (kept separate)
>
> - Reuse the 1362 `release` expression for the retained-Development release term instead of a new thinner one.
> - For the writer handback, require predicted bill values for the seven measured frames (315 / ≈6946 / ≈8100–8280 / ≈8578 / 850 / 7948 / 576) so the 514-pattern re-measurement can be an equality check.
>
> ## Evidence limits
>
> No execution; every unit figure is hand arithmetic from the source formulas, calibrated on two measured bills (11193, 9587) and the two analysts' 9234. Label-4 and label-8 totals were verified by component, not fully recomputed. 137/162/175/365 read by grep only. Tests other than the four opened were grep'd, not read. Codex logs not opened.
>
> ## Next action for the parent
>
> Issue a short 516 addendum refining the direction per defects 2–6, then the writer brief must contain: the exact term substitutions (C2: `small(1,1,0)`, 1362-shape release, claims/occupied as Σ over ALL workflows with paid reads placed after the 1441–1448 guards, retention ×1, walk ×1; C3: `small(1,0,1)+small(0,0,0)`, releasePhase minus `8*text` only, update ×2, commonVisits 2; C4: `keyBill(d.external (+1 at rT6), keyLength)`, admission `occupied === 0` arm, slot/composite only with a net-positive paid ordered proof), the byte-identical rule for non-selected arms, predicted values for the seven measured frames, and a per-site list of new payments. Replace 517 with pinning four existing controls as baselines under `record-check.mjs` before the writer: `tests/p14b4-started-owner-replay.test.ts` (case at 259), `tests/p14b4-ready-owner-replay.test.ts` (mixed new+retained), `tests/p14b4-started-replay-retained-development.test.ts` (n=2), `tests/p14b4-ready-replay-background.test.ts` (admission with occupied > 0), plus 276 first-take and the 302 stale RED.
