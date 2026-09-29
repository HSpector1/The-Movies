<!-- 1335-B: independent review (contract-auditor, read-only) of the 1335-A plan and 1335-measure, saved verbatim by the parent at HEAD 59e2666a from the agent's final text -->

# Independent review 1335-B

Verdict: **ACCEPT** — proceed to staging under the 1327-C method. No blocking items. Three non-blocking notes below.

## Method

Read-only, no commands run. I re-derived every measured claim in `1335-A-ui-retained-repair-u1-plan.md` against: the cited source (`src/core/save.ts`, `src/core/talentMarket.ts`, `ui/src/engine/adapter.ts`, `ui/src/App.tsx`, `src/core/types.ts`), the `1335-measure/` probe/diff/run artifacts, the `1331-I-failures.json` cluster tally, and the six touched test files (`WorldFirstWorldInspectorDefault.test.tsx`, `WorldFirstLotNativeCastingReviewApp.test.tsx`, `WorldFirstLotNativeCastingReviewAppAuthority.test.tsx`, `WorldFirstLotNativeNextEventApp.test.tsx`, `livingTurn.scheduler.test.tsx`, `p05a-w2-closed-production.contract.test.ts`). Every line citation in 1335-A that I checked was exact.

## 1. C5 — genuine test defect, not a live-code gap (MET WITH EVIDENCE)

Confirmed from source, not just from the plan's narrative:

- `GameState['hollywood']` is typed `HollywoodState | null` from V19 forward (`src/core/types.ts:1906`, `export type GameStateV19 = GameStateV18 & { hollywood: ... | null }`). `undefined` is never a legal value of a live/migrated state.
- `playerOffer` (`src/core/talentMarket.ts:277-288`) gates on `state.hollywood === null` with an explicit "by law" comment ("the market engages iff `state.hollywood !== null`"). It is a binary null-check, not a defensive `undefined`-guard.
- `loadSave` (`src/core/save.ts:6568`, `return validateSave(save)`) only validates/dispatches by version; it does not migrate. Confirmed by `1335-measure/zz-c5-probe.test.ts.txt` + `c5-probe.txt`: loading the raw Save16 fixture through `loadSave` alone and calling `hiringMarketCards` throws `TypeError: Cannot read properties of undefined (reading 'playerStudioId')` at `talentMarket.ts:288:42` — the exact stack the plan cites, reproduced independently.
- The app's real load path always migrates: `importSaveJson` (`ui/src/engine/adapter.ts:3796`, `return { ok: true, state: migrateToLive(save).state, converted }`) is the only path a player's save ever travels.
- `c5-migrated-copy.diff.txt` / `c5-migrated.txt`: routing both leaves through `migrateToLive(loadSave(raw)).state` (a 1-line change per leaf, no assertion touched) makes the file pass 13/13.

This settles the review question directly: the live code is *not* expected to accept a pre-Hollywood `undefined` state — the type system and the law comment rule it out — so C5 is correctly classified as a test-side defect (bypassing the app's own load path), and the fix restores the leaf's premise without weakening it.

## 2. Budget rules — legitimate, non-weakening, correctly scoped (MET WITH EVIDENCE)

- Per-leaf `30_000` precedent is real: `livingTurn.scheduler.test.tsx:373` is exactly `}, 15_000)`.
- None of the touched leaves assert wall-clock latency. `livingTurn.scheduler.test.tsx:1-13` states explicitly that every in-game pacing assertion is measured against `vi.useFakeTimers()`, "the proof that wall time decides nothing" — the vitest per-test timeout only bounds real CPU time for mount/render, never game pace.
- C2's single-cause, single-line fix is empirically demonstrated end-to-end: `c2-budget-copy.diff.txt` shows one line changed (`})` → `}, 30_000)`) on `WorldFirstWorldInspectorDefault.test.tsx`'s "never lets any place print its blocks out of the canonical order" leaf; `c2-budget.txt` shows 28/28 passing where `c2-solo.txt` showed 1 timeout + 5 "Found multiple elements" cascades. This confirms the C2(7)/C1(1) causal chain, not just asserts it.
- M2 durations cross-verified against `u1-solo-*.txt`: CastingReviewApp "greenlights..." 4594ms, CastingReviewAppAuthority "never lets stale..." 5229ms, NextEventApp "orients a cash stop..." 10317ms (timing out even solo) — all match the plan's cited numbers exactly.
- Excluding `vitest.workspace.ts`/`ui/src/test/setup.ts` is correct: `vitest.workspace.ts` shows `core` = `tests/**/*.test.ts` and `ui` = `ui/**/*.test.{ts,tsx}`, non-overlapping globs, confirming the plan's claim that skipping the core re-run is safe and that a project-wide budget is unnecessary blast radius for 8 identified leaves.
- Fake-timer interaction (asked in Q4): checked directly. `livingTurn.scheduler.test.tsx:204-209` calls `vi.useFakeTimers()` strictly *after* `await screen.findByTestId('studio-lot-screen')` at line 207 (confirmed by the file's own comment at 196-202: "must be awaited before the fake clock exists"). Grepped the other four named files for `useFakeTimers`: no matches in any of them. So the M1 mechanism (extending or pre-awaiting the first `findBy`) has no fake-timer interaction risk in any of the five files — a real risk the plan doesn't discuss in prose but which checks out clean in source.

## 3. C6 — correctly left observed-only (MET WITH EVIDENCE, appropriately conservative)

`WorldFirstWorldInspectorDefault.test.tsx`'s "routes canvas intent and semantic companion activation to the same owner" passing alone at 381ms is confirmed in `c2-solo.txt` line 8. Unlike C5 and C2, there is no dedicated C6 probe in `1335-measure/` (glob of the directory shows only `c5-*`/`c2-*`/`u1-solo-*` — no `c6-*` file). The causal claim (cascade of the preceding leaf's 1331 timeout) is inference from file ordering and a solo-pass, not an isolated repro. The plan discloses this honestly ("the mechanism is inferred... U1 does not edit this leaf... the recorded gate after U1 confirms or refutes this") rather than claiming a fix. That is the right call: touching this leaf without confirming the mechanism risks masking a genuine routing bug (an extra `{ kind: 'dashboard' }` route is a real behavioral divergence, not a query-helper artifact like the C2 rows).

## 4. Completeness (MET WITH EVIDENCE)

Cross-checked against `1331-I-failures.json`'s exact tally (`C1-timeout-5000ms: 7, C6: 1, C2: 7, C3: 6, C4: 4, C5: 2, NEW: 7` = 34):
- C5(2): both rows named and fixed.
- C2(7): all 7 rows named; single root-cause fix demonstrated.
- C1(7, official cluster): all 7 identities located in the plan's M2 list, each with a matching solo duration.
- C6(1): named, correctly deferred.
- NEW(7): decomposes cleanly into StudioLotScreen:930 (1, explicitly excluded and disclosed — confirmed passing 61/61 alone in `u1-solo-StudioLotScreen.txt`, consistent with "intermittent"), the CastingReviewApp first-leaf cold-mount row (1, covered by the M1 rule — confirmed as the file's first test at `WorldFirstLotNativeCastingReviewApp.test.tsx` and matching 1331-I's own "outside every recorded set" reasoning), and 5 `livingTurn.scheduler.test.tsx` cascade rows (all failing at `mountLot`'s `:207` or the bulletin testid at `:476`, immediately downstream of that file's own C1-timeout leaf — matches 1317-I's documented mechanism that "Vitest does not cancel a timed-out async body").
- `mountLot`/render helpers are **not shared**: grepped `async function mountLot|renderLot|mountApp` across `ui/src/lot` — only `livingTurn.scheduler.test.tsx:204` and `livingTurn.parity.test.tsx:107` define `mountLot`; the other three named files use distinct local helpers (`onlyView`, `renderStudio`, etc.). Rule 4's "applies it the same way in every named file" is therefore necessarily a per-file edit, not a single shared-module patch — the plan's file list already reflects this correctly.
- `livingTurn.parity.test.tsx` and `ui/src/screens/StudioCalendar.career.test.tsx` (which appeared in a naive grep of the JSON) are in the **vanished** list, not the current 34 failures — they are historical rows no longer failing (`C7-livingturn-parity-dom-race`, `C8-studiocalendar-stale-v38-literal`), correctly outside U1's scope.

## Non-blocking notes

1. The plan's closing "Expected result" sentence ("the C5 (2), C2 (7), C1 (7) and cascade rows gone... and none new") doesn't itemize the CastingReviewApp M1 first-leaf row or give an exact count for the 5 `livingTurn.scheduler` cascade rows, even though every other bucket gets an exact number. The required classification JSON deliverable will supply this per-row, but I'd ask the handback (1335-C) to also state the explicit pre/post total (34 → 34 − 22 = 12 open, or 11 if the C6 hypothesis holds) so the next recorded-gate reviewer has a numeric target rather than having to reconstruct it.
2. Rule 4's M1 fix will touch some currently-*passing* first leaves (e.g. `WorldFirstWorldInspectorDefault`'s and `WorldFirstLotNativeCastingReviewAppAuthority`'s first mounts) as a preventive, uniform-mechanism measure rather than a reactive one. That's defensible — a timeout increase can't break a passing assertion — but the classification JSON should mark these rows "preventive" vs. "reactive" for the record, since they weren't independently observed failing in 1331.
3. C6's resolution is a hypothesis test, not a guaranteed outcome; the parent should read "C6 gone" in the next recorded gate as confirming or refuting the plan's cause-4 reading, not as something this increment itself fixed.

## Files referenced

- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1335-A-ui-retained-repair-u1-plan.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1335-measure/{zz-c5-probe.test.ts.txt,c5-probe.txt,c5-migrated-copy.diff.txt,c5-migrated.txt,c2-solo.txt,c2-budget-copy.diff.txt,c2-budget.txt,u1-solo-WorldFirstLotNativeCastingReviewApp.txt,u1-solo-WorldFirstLotNativeCastingReviewAppAuthority.txt,u1-solo-WorldFirstLotNativeNextEventApp.txt,u1-solo-livingTurn.scheduler.txt,u1-solo-StudioLotScreen.txt}`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1331-I-broad-ui-attribution.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1331-I-failures.json`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1317-I-broad-ui-attribution.md`
- `/Users/zacheryspector/The-Movies-headless-program/src/core/save.ts:6540-6570`
- `/Users/zacheryspector/The-Movies-headless-program/src/core/talentMarket.ts:260-298`
- `/Users/zacheryspector/The-Movies-headless-program/src/core/types.ts:1906`
- `/Users/zacheryspector/The-Movies-headless-program/ui/src/engine/adapter.ts:3770-3829, 4100-4130, 7250-7274`
- `/Users/zacheryspector/The-Movies-headless-program/ui/src/App.tsx:220-249`
- `/Users/zacheryspector/The-Movies-headless-program/ui/src/test/contracts/p05a-w2-closed-production.contract.test.ts:320-375`
- `/Users/zacheryspector/The-Movies-headless-program/ui/src/lot/livingTurn.scheduler.test.tsx:1-60, 190-250, 355-394`
- `/Users/zacheryspector/The-Movies-headless-program/vitest.workspace.ts`
