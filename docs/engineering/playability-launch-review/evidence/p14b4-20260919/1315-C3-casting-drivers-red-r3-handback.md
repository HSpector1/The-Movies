# 1315-C3: two remaining test defects fixed in the staged casting-driver RED

Mode STAGE RED (test source only), repo `/Users/zacheryspector/The-Movies-headless-program` at HEAD
`e65012e5c044dee0025428f88d5832f3bb96d211`, branch `wip/headless-program-20260916-ts`. Confirmed via
`git diff --stat d8e90042 e65012e5 -- src/core/relationships.ts src/core/save.ts src/core/actions.ts
bridge/finance-upcoming.ts bridge/relationships.ts tests/helpers/p14b2-fixtures.ts src/core/employment.ts`
that no source file this task cites changed between the 1315-C2 HEAD and this HEAD (the only commit in
between is `e65012e5` itself, the parent's own commit of the 1315-C2/1315-X2/1315-P2 artifacts) — every
source citation from the 1315-C2 handback still applies unchanged. Read `1315-X2-red-r2-dry-run.md` and
`1315-P2-expiry-signing-probe.txt`/`.ts` in full before writing anything. No production code, fixture, or
either frozen directory (`1315-stage`, `1315-stage2`) was touched; the revision is written fresh to
`docs/engineering/playability-launch-review/evidence/p14b4-20260919/1315-stage3/tests/` (all five files
copied from `1315-stage2`, only the two files below edited). No `vitest`/`tsc`/`vite-node`/`node` was run
(hard limit).

`1315-X2-red-r2-dry-run.md` reports tree A (unchanged engine): 22 failed as stated REDs, 9 regression pins
passed, 1 skipped — i.e. every remaining 1315-C2 file was already behaving exactly as designed on the
unchanged engine. Tree B (the parent's Save42 draft): 27 passed, only 4 failed, all traced to the two
defects below (3 leaves in the expiry file for defect 1, 1 leaf in the save-v42 file for defect 2). Neither
defect is a law problem — both are test-route problems, exactly as the coordinator framed them.

## Defect 1 — `p14b9-casting-expiry.test.ts`: signing order (3 leaves)

**Exact edit.** In `deriveCast`, the actor-to-role pairing changed from
`const [antagonist, support, lead, bystander] = actors` to
`const [antagonist, support, bystander, lead] = actors` — i.e. LEAD and BYSTANDER swapped which of the
third/fourth week-0 actors they take. Added a `MEASURED_MAPPING` constant (the exact 1315-P2 mapping:
writer t-wri-05, craft t-cra-09, director t-dir-04, antagonist t-act-24, support t-act-08, bystander
t-act-20, lead t-act-12) and a per-field comparison immediately after deriving `cast`, throwing a named
route-premise error naming the specific mismatched role if the derived mapping ever drifts from it. The
signing order in `world()` (director, antagonist, support, bystander, lead — already the correct order) and
both non-default terms (support 52, lead 60) were already correct and are unchanged.

**Why.** `signContract`'s operating-phase branch re-reads `hiringMarketIds(state)` on the state AS IT
STANDS after every prior signing in the same sequence, and the pool that function samples from shrinks as
each earlier person becomes contracted — so a person visible in the week-0 snapshot can be gone from a
LATER call's re-read. `1315-P2-expiry-signing-probe.ts` measured this directly on `r1314-casting-01` with
this file's exact role mix and term lengths, trying the pairing the 1315-C2 draft used
(`bystander = t-act-12` signed 6th at 208 weeks) implicitly by construction, and the probe's OWN measured
safe order instead signs `t-act-20` sixth (as bystander) and reserves `t-act-12` for LAST (as lead, at 60
weeks) — the exact opposite pairing from what 1315-C2 had. Swapping the pairing to match the probe's
measured order is the fix; no other part of the route needed to change.

**Predicted result per leaf on the unchanged engine, after this revision.** All three leaves in this file
should reach the SAME REDs 1315-X2 already confirmed they reach once the route completes (1315-X2's tree A
already showed the expiry leaves failing as stated REDs, not as route-premise throws — the dry run's own
"every failure is a stated RED" line covers this file). Concretely: the acceptance leaf
(`makeSave`+`validateSave`) should still PASS (unaffected — it only depends on the route completing, not on
the new law); the "names every Inseparable counterpart... in employment order" leaf should FAIL with
`detail` not containing the director's/antagonist's name (RED, `bridge/finance-upcoming.ts` unchanged); the
committed-term-exclusion leaf remains the SAME disclosed non-RED I flagged in the 1315-C2 handback (it is
vacuously true today since NO name appears in `detail` yet, for any reason) — that limitation is
unaffected by this fix and still applies.

## Defect 2 — `p14b9-save-v42.test.ts`: frozen-reader leaf input (1 leaf)

**Exact edit.** Removed the `for (let v = 4; v <= 39; v++)` loop and its `fresh =
makeSave(p13aGeneratedStudio(...))` premise entirely (and the now-unused `p13aGeneratedStudio` import).
Replaced the describe block's single test with three, on the house form
(`tests/p14r3-save-v41.test.ts:294-301`, "frozen readers unchanged (regression pin — already true before
V41 exists)"): two `it()`s calling `validateSaveV41(JSON.parse(acknowledgedRaw()))` /
`validateSaveV41(JSON.parse(releasedRaw()))` directly (the house form's own `JSON.parse(rawText)` pattern,
not `importSave`) asserting neither throws; one `it()` keeping the existing `migrateToV40`/`migrateToV41`
checks on the genuine acknowledged input, unchanged from 1315-C2. Renamed the describe block from "every
frozen reader V1..V41 admits its own version" to "the frozen V41 reader is unchanged after Save42 lands" —
a narrower, now-actually-observable claim.

**Why.** 1315-C2's fix (genuine acknowledged input for V40/41, a FRESH generated-world state for V4..V39)
still failed: the dry run measured that the SAME fresh `p13aGeneratedStudio` state ALSO refuses below V38
— `migrateToV37`: "cannot downgrade or discard profession transition, industry retirement or entrant
authority" — because even a freshly generated (un-ticked) world already carries profession/retirement
history worldgen itself seeds, which pre-V38 saves cannot represent. This means NEITHER of the two inputs
available to this file (the two genuine 1314 fixtures, whose own downgrade boundary is V40; a freshly
generated world, whose downgrade boundary is V38) admits the full V4..V39 range — there is no single lawful
input left to construct for that loop without either fabricating state (against this task's own rules) or
executing to hunt for some OTHER input, which the hard limit forbids. The coordinator's prescribed fix
narrows the claim to what IS observable with the inputs this file legitimately has: that the frozen V41
reader itself — the one thing every genuine input in this file DOES exercise — stays unaffected by Save42
landing, matching the exact "house form" precedent this codebase already uses for the identical situation
one version earlier.

**Predicted result on the unchanged engine, after this revision.** All three `it()`s in the renamed describe
block should PASS on unchanged HEAD, unchanged from before — `validateSaveV41` and `migrateToV40`/
`migrateToV41` are pre-existing, unaffected functions; this was always a regression pin, and remains one.
The fix corrects an unreachable premise (an input version mismatch with no available input), not a law-level
assertion.

## Files touched in `1315-stage3/tests/`

- `p14b9-casting-expiry.test.ts` — edited (defect 1).
- `p14b9-save-v42.test.ts` — edited (defect 2).
- `p14b9-casting-competition.test.ts`, `p14b9-casting-copy.test.ts`, `p14b9-casting-readers.test.ts` —
  copied unchanged from `1315-stage2` (only the "STAGED FILE" header's physical-path line and task label
  updated for bookkeeping; `1315-X2` confirms every leaf in these three already passes on the parent's
  Save42 draft, so no content change was needed or made).

## Summary

Both measured defects fixed in a fresh `1315-stage3` directory (both `1315-stage`/`1315-stage2` untouched):
the expiry file's actor-to-role pairing now matches `1315-P2`'s measured safe signing order exactly, with a
loud route-premise assertion guarding against future drift; the save-v42 file's frozen-reader leaf now pins
only what it can actually observe with the inputs available to it (the frozen V41 reader's own
unaffectedness), on the same house form the codebase already uses one version earlier. No law assertion was
loosened, removed, or newly hard-pinned to reach either fix. The one already-disclosed limitation carried
over from 1315-C2 (the committed-term-exclusion leaf is not yet a RED on unchanged HEAD) is unchanged and
still applies. The parent's next dry run is the concrete next step.
