# 1315-C4: one verified route edit in the staged casting-driver RED

Mode STAGE RED (test source only), repo `/Users/zacheryspector/The-Movies-headless-program` at HEAD
`e7cd68975178621642a0e22d4c548ea4007d098f`, branch `wip/headless-program-20260916-ts`. Confirmed no
production source changed since 1315-C3's HEAD (`git log --oneline e65012e5..e7cd6897` shows only the
parent's own commit of the 1315-X3 dry-run artifacts). Read `1315-X3-red-r3-dry-run.md` in full before
editing. No production code, fixture, or any earlier staged directory (`1315-stage`, `1315-stage2`,
`1315-stage3`) was touched. No `vitest`/`tsc`/`vite-node`/`node` was run (hard limit).

## Edit

`docs/engineering/playability-launch-review/evidence/p14b4-20260919/1315-stage4/tests/p14b9-casting-expiry.test.ts`,
the shoot-assignment loop in `world()`: replaced `if (n === 0) { ... }` with the measured 1314-P condition,
exactly as the coordinator specified —

```ts
const flow = s.operations.workflows.find((w) => w.productionId === productionId)
if (s.studio.activeProductions.find((p) => p.id === productionId)!.remainingTicks <= 5 && flow?.phase !== undefined
  && flow.shootingTask?.status !== 'scheduled') {
```

— keeping the loop's existing body (the same `assignShootingDirector`/`scheduleShootingTake` pair) and
bound (`n >= 20` throw), and updating the adjacent comment to cite this condition instead of "first pass."
Also updated this file's own header (task/HEAD/staging-path lines, and a new REVISION 1315-C4 paragraph
naming the defect and the fix). No other line in this file changed.

The other four files (`p14b9-casting-competition.test.ts`, `p14b9-casting-copy.test.ts`,
`p14b9-casting-readers.test.ts`, `p14b9-save-v42.test.ts`) were copied byte-identical from `1315-stage3`
into `1315-stage4` — confirmed via `diff -q` against each `1315-stage3` counterpart, no differences.

## Why

`1315-X3` measured that `1315-stage3`'s expiry route called `assignShootingDirector` on the shoot loop's
very first pass, while the picture was still in Development, not Shooting — refused with "productionId
... is not in Shooting." The fix reuses the exact condition `1314-P`/the producer/
`p14b9-casting-competition.test.ts`'s own `greenlightCycle` already use elsewhere in this task's evidence:
assign and schedule only once few enough ticks remain, the operations workflow exists, and its shooting
task is not already scheduled.

## Predicted result (parent-trial-verified per the coordinator's message, `1315-X3`)

- Save42 draft: all three expiry leaves pass.
- Unchanged engine: the "names every Inseparable counterpart... in employment order" leaf fails for its
  stated reason (`detail` does not contain the required names — `bridge/finance-upcoming.ts` unchanged);
  the synthetic-acceptance leaf and the committed-term-exclusion leaf both pass — the latter for the
  disclosed reason already on record since 1315-C2 (it is vacuously true until the naming leaf itself goes
  GREEN, since no name appears in `detail` today for any reason).

No other file's predicted result changes from `1315-C3`'s handback.

## Summary

One route condition fixed in `p14b9-casting-expiry.test.ts`, parent-trial-verified before this staging; the
other four files carried forward byte-identical. Files:
`docs/engineering/playability-launch-review/evidence/p14b4-20260919/1315-stage4/tests/*.test.ts`, handback
at `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1315-C4-casting-drivers-red-r4-handback.md`.
