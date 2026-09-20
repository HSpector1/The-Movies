# 561 — Enumerator RED amended by the test-author (typecheck annotations; addition (iii) constructed lawfully)

2026-09-20. Claude Code parent. The writer's hand-back (560-W, record 560 §3) left two test-side
items outside its writable range: root `npm run typecheck` failed on two TS7022 lines inside the
RED (`:305-306`, the natural-chain loop's `production`/`workflow` locals), and the RED's addition
(iii) case self-reported UNCONSTRUCTIBLE because its single commission was admitted at once
(a second Development & Casting slot was free). The test-author (561-T) fixed both inside
`tests/p14b4-owner-enumerator-slice.test.ts` ONLY; the writer's two candidate files are
byte-unchanged (`c0be83a9…`, `5514d847…`).

## What changed (parent-verified `git diff`: `23 insertions(+), 15 deletions(-)`, one file)

- SHA256 `56df4c5ba8ae9cd2bc1d0fe3720b3ba921ac02d2f82b5d7b417b2800703875ac` (775 lines, record 558)
  → `b9da9b766f251670a602e4cd51125bfc78d1736f69f56756ec75431a01c110d3` (783 lines, 61308 bytes).
- Item 1 (typecheck): the type import gains `ProductionWorkflow`; `:305-306` become
  `const production: Production | undefined = …` and `const workflow: ProductionWorkflow | undefined = …`.
  No assertion changed.
- Item 2 (addition (iii), 555-B Q7): option (a) — the queue is built by three real commands
  through `applyActions` on the admitted-this-week state at the SAME tick: the fixture writer's
  commission fills the last Development & Casting slot (admitted, queue empty, one project
  minted), a market writer is signed (`signContract`, 52 weeks, tick unchanged), and that
  writer's second commission is the one queueable refusal (`scriptDevelopment.ts:311`) the front
  door admits to the queue (`actions.ts:1634-1645`): `productionQueue` matches
  `[{ kind: 'commissionScript', queuedWeek: now }]` with nothing minted. Two fixture
  preconditions guard it loudly (`assert.ok(concepts.length >= 2, 'UNCONSTRUCTIBLE…')`,
  `assert.ok(writer, 'UNCONSTRUCTIBLE…')`). The pinned block from
  `expect(queued.productionQueue).toHaveLength(1)` to the end of the case is byte-identical to the
  installed RED (producer cut `unsupportedContext` / `current queue may admit new work`; both
  flags incomplete; FRAGILE / UNCERTIFIED_BOTTLENECK / UNCERTIFIED / domainIncomplete; claims
  complete; `activeProductions` unchanged). No synthetic queue entry.
- The test-author's temporary probe body was spliced in for one probe run and restored from a
  hashed backup (`56df4c5b…`) before the final edit; the parent grepped the installed file for
  `PROBE`, `occupancy.js` and `productionQueue.js` residue (none).

## Test-author's own runs (not evidence; one process at a time)

- `node_modules/.bin/vitest run --project core tests/p14b4-owner-enumerator-slice.test.ts`
  21:32:11–21:32:20Z, exit 0, `Tests 45 passed (45)`.
- `npm run typecheck` (root + UI) 21:32:20–21:33:29Z, exit 0, no diagnostics.
- Bridge typecheck not run by the test-author (parent run 568).

The parent's fixed-source runs carrying this amendment are in record 560 (562–573).

## Note on the writer hand-back file

561-T reported that `560-W-report.md` did not exist in the scratchpad at dispatch time; the
parent had saved only the writer's logs then and wrote the verbatim hand-back file afterwards
(now present). The test-author worked from the logs and the assignment text, which agree with
the hand-back.

## 3. Verbatim test-author hand-back (561-T)

As returned, unedited (embedded raw because the hand-back carries its own code fences, as in record 558 §3).

## 561-T result: DONE

Model observed: Fable 5.1 (`claude-fable-5-1`), as reported by the harness.

Authority note: the 560-W hand-back file named in the assignment (`…/scratchpad/560-W-report.md`) does NOT exist; only the writer's logs exist (`560-W-enumerator-run1.log`, `560-W-enumerator-run2-verbose.log`, `560-W-typecheck.log`, `560-W-typecheck-ui.log`). I worked from those logs plus the assignment text; both agree with what I observed (44/45, the two TS7022 lines, the UNCONSTRUCTIBLE throw at :614).

### Worktree identity
- HEAD `036ad231291cb65848f20f11b686858fe0d8da56`, branch `wip/headless-program-20260916-ts`.
- Writer's candidate untouched, hashes unchanged before/after: `src/core/promiseCapacityEnumerator.ts` `c0be83a91cf15e5bbf779e9336a697bd19c0b65d95f660866ad85d5c80c697d6`; `src/core/promiseCapacityOwners.ts` `5514d847ef969f026abcd3c8fb5b61e47bbc24bd3d0e5a05139571c2cd6f5820`.
- `tests/p14b4-owner-enumerator-slice.test.ts` SHA256 BEFORE `56df4c5ba8ae9cd2bc1d0fe3720b3ba921ac02d2f82b5d7b417b2800703875ac` (775 lines) → AFTER `b9da9b766f251670a602e4cd51125bfc78d1736f69f56756ec75431a01c110d3` (783 lines, 61308 bytes). `git diff --numstat`: 23 insertions, 15 deletions, this one file only. `git status --short`: ` M src/core/promiseCapacityOwners.ts`, ` M tests/p14b4-owner-enumerator-slice.test.ts`, `?? src/core/promiseCapacityEnumerator.ts`.
- No Git, no network, no installs; no `src/**` edit; no other test file touched.

### What changed (exact hunks; full diff artifact at `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/561-T-test-file.diff`, 5541 bytes)

Item 1 (typecheck): two annotations plus one type import; no assertion changed.
```
@@ -45,5 +45,5 @@
-import type { CastSlot, GameState, ProfessionalPromise, Production } from '../src/core/types.js'
+import type { CastSlot, GameState, ProfessionalPromise, Production, ProductionWorkflow } from '../src/core/types.js'
@@ -303,6 +303,6 @@ function naturalChain(w: World): Chain {
-    const production = state.studio.activeProductions.find((p) => p.id === film.id)
-    const workflow = state.operations.workflows.find((row) => row.productionId === film.id)
+    const production: Production | undefined = state.studio.activeProductions.find((p) => p.id === film.id)
+    const workflow: ProductionWorkflow | undefined = state.operations.workflows.find((row) => row.productionId === film.id)
```

Item 2 (addition (iii)): OPTION (a) taken — the queue is constructed lawfully. Hunk `@@ -601,17 +601,25 @@`: the title's trailing clause is rewritten (leading law clause kept verbatim), the 12 lines from `const concept = …` through the third `UNCONSTRUCTIBLE` throw are replaced by a 7-line observed-facts comment and 11 lines of real commands; the pinned block from `expect(queued.productionQueue).toHaveLength(1)` to the end of the case is BYTE-IDENTICAL to the RED (producer attempt `{ kind: 'cut', reason: 'unsupportedContext', detail: 'current queue may admit new work' }`, producer omissions contain the string, both flags incomplete, `FRAGILE`/`UNCERTIFIED_BOTTLENECK`/`UNCERTIFIED`/`domainIncomplete`, kernel omission `'unsupportedContext: current queue may admit new work'`, `claims.coverage.claimsAndHolds === 'complete'`, `queued.studio.activeProductions` equal to `immediate`'s). New construction, verbatim:
```
    const concepts = immediate.concepts.filter((c) => !immediate.scriptDevelopment.projects.some((p) => p.conceptId === c.id))
    assert.ok(concepts.length >= 2, 'UNCONSTRUCTIBLE: the fixture has fewer than two uncommissioned concepts to commission')
    const filled = applyActions(immediate, [{ kind: 'commissionScript', project: commissionPayload(immediate, w.writerId, concepts[0]!.id) }])
    expect(filled.productionQueue).toEqual([]) // slot 1 was free: admitted at once, not queued
    expect(filled.scriptDevelopment.projects).toHaveLength(immediate.scriptDevelopment.projects.length + 1)
    const writer = hiringMarketIds(filled, filled.market.tick).map((id) => filled.talent.find((p) => p.id === id)).find((p) => p?.role === 'writer')
    assert.ok(writer, 'UNCONSTRUCTIBLE: no second writer in the hiring market at now (a second commission needs an idle writer)')
    const signed = applyActions(filled, [{ kind: 'signContract', talentId: writer.id, termWeeks: 52 }])
    expect(signed.market.tick).toBe(now)
    const queued = applyActions(signed, [{ kind: 'commissionScript', project: commissionPayload(signed, writer.id, concepts[1]!.id) }])
    expect(queued.productionQueue).toMatchObject([{ kind: 'commissionScript', queuedWeek: now }])
    expect(queued.scriptDevelopment.projects).toHaveLength(filled.scriptDevelopment.projects.length) // nothing minted while queued
```
The two `assert.ok` guards are fixture preconditions that pass on this fixture (28 uncommissioned concepts; writer `t-wri-11` in the market); the case no longer contains a permanently throwing branch. No synthetic queue entry; all three commands go through `applyActions`.

### Observed facts that decided option (a) (probe run `…/scratchpad/561-T-probe-run1.log`, 2026-09-20T21:30:09Z–21:30:15Z, temporary probe body spliced into the (iii) case and then restored from a hashed backup `…/scratchpad/561-T-original.test.ts.bak` = `56df4c5b…`)
- On `naturalChain(w).immediate`: `now = tick = 45`; D&C facilities `[{ id: 'facility-development-casting', capacity: 2 }]` (`TUNING.FOUNDING_DEVELOPMENT_CASTING_CAPACITY: 2`, tuning.ts:632; operations.ts:90); occupied D&C slots `facility-development-casting:0` by `production:prod-0045` (the admitted picture's development workflow reservation, occupancy.ts:409-421); `freeGateSlot` = `{ facilityId: 'facility-development-casting', slot: 1 }`; both scripts `script-0000` (inProduction) and `script-0001` (ready) have `reservation: null` (occupancy.ts:441 skips them); `productionQueue.length 0`; `castingSessions.mode 'legacy'`; hiring market at tick 45: `actor:t-act-27, writer:t-wri-11, actor:t-act-17, craft:t-cra-01, actor:t-act-00, actor:t-act-21, actor:t-act-01, writer:t-wri-00`; 28 uncommissioned concepts (`c-02`, `c-03`, …).
- Commission A (`t-wri-03` = w.writerId, `c-02`): admitted at once; queue 0; `freeGateSlot` null; projects 3. This is why the RED's single commission never queued.
- `signContract` `t-wri-11` 52w at tick 45: tick stays 45; queue 0; free null.
- Commission B (`t-wri-11`, `c-03`): `productionQueue` = `[{ kind: 'commissionScript', ordinal: 0, queuedWeek: 45 }]`; projects still 3 (nothing minted); activeProductions 1; tick 45.
- Law lines: the queueable refusal is `scriptDevelopment.ts:311` (`throw new QueueableCapacityRefusal('script development: commission rejected — no Development & Casting slot is available')`, reached only after the writer-busy refusal at :289-298); the front door converts exactly that error via `admitOrQueue` (`actions.ts:1634`, instanceof check :1645); the producer's cut is `promiseCapacityOwnerReplay.ts:624` (`if (source.productionQueue.length > 0) contextCut(work, 'unsupportedContext', 'current queue may admit new work')`), thrown before any later context check.
- Enumerator output on `queued` (probe): attempts `[{ kind: 'cut', traceKey: 'enumerator:started', through: { week: 45, step: 0 }, reason: 'unsupportedContext', detail: 'current queue may admit new work', provenance: [] }]`; producer omissions `['unsupportedContext', 'current queue may admit new work']`; enumeration `{ existingCalendars: 'incomplete', allOwnerTraces: 'incomplete', omissions: [] }`; classified `FRAGILE` / `bounded capacity analysis could not certify this schedule` / kernel `{ status: 'UNCERTIFIED', reason: 'domainIncomplete', workUsed: 807, omissions: ['current queue may admit new work', 'unsupportedContext', 'unsupportedContext: current queue may admit new work'] }`. Every pinned expectation holds without loosening.
- Rejected alternatives (observed): greenlight of `script-0001` on `filled` throws at the door `greenlight talent "t-dir-04" is already engaged in an active production (exclusivity, M16)` (staffing exclusivity precedes the slot); a casting-session start would need six distinct non-busy actor candidates (`assertCastingSlateLaw`/`assertCastingSlateEligibility`, castingSessions.ts:121-169) and `castingSessions.mode` is `legacy` on this fixture.

### Checks actually run (one process at a time, worktree root)
- `node_modules/.bin/vitest run --project core tests/p14b4-owner-enumerator-slice.test.ts` — START 2026-09-20T21:32:11Z, END 21:32:20Z, `EXIT 0`. Verbatim: ` ✓ |core| tests/p14b4-owner-enumerator-slice.test.ts (45 tests) 5339ms` / ` Test Files  1 passed (1)` / `      Tests  45 passed (45)` / `   Start at  23:32:12` / `   Duration  8.34s (transform 1.76s, setup 0ms, collect 2.43s, tests 5.34s, environment 0ms, prepare 91ms)`. Log: `…/scratchpad/561-T-vitest-run1.log`.
- `npm run typecheck` (`tsc --noEmit && tsc -p ui/tsconfig.json --noEmit`) — START 2026-09-20T21:32:20Z, END 21:33:29Z, `EXIT 0`, no diagnostics. Log: `…/scratchpad/561-T-typecheck.log`.
- Earlier probe-only run (temporary body, since removed): `-t "PROBE 561-T"` 1 passed | 44 skipped, EXIT 0 (`…/scratchpad/561-T-probe-run1.log`). Verified afterwards: no `PROBE`, `occupancy.js` or `productionQueue.js` residue in the installed file.
- NOT run: `typecheck:bridge` (the writer's log shows a pre-existing failure in `tests/bridge-p14b4-cast-class.test.ts(364,20)` unrelated to this file and outside my scope; not re-verified), the broader core suite, any UI/native test.

### Evidence limits / remaining notes
- Source facts (line citations) were read from the worktree; the enumerator's behaviour on a queued state is a native vitest result on the writer's uncommitted candidate, not a review of that candidate's correctness.
- The fixture precondition "a writer is in the hiring market at tick 45" is deterministic under the seeded RNG but is fixture-specific; if `p13aGeneratedStudio`'s market law changes, the case fails loudly at the `assert.ok(writer, 'UNCONSTRUCTIBLE…')` guard rather than passing spuriously.
- Scratchpad artifacts (all under `…/scratchpad/561-T-*`): `561-T-original.test.ts.bak`, `561-T-probe-body.txt`, `561-T-splice.py`, `561-T-probe-run1.log`, `561-T-final-body.txt`, `561-T-final-edit.py`, `561-T-test-file.diff`, `561-T-vitest-run1.log`, `561-T-typecheck.log`.

Next concrete action for the parent: review the hunks; if accepted, the writer/coordinator stages `tests/p14b4-owner-enumerator-slice.test.ts` together with the enumerator candidate for the 561 record (I made no commit).
