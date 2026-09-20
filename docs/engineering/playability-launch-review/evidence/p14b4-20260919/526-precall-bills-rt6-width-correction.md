# 526: rT6 requirement-walk width correction (518 defect 1)

Role: sim-core, IMPLEMENT, sole production writer. Model observed: Fable 5.1 (claude-fable-5-1).
Worktree `/Users/zacheryspector/The-Movies-headless-program`, HEAD `df0533c6fac18ec5027231500d80050d800fd3b5`.
Files written: `src/core/promiseCapacityOwnerReplay.ts` and this record. No Git, no network, no vitest.

## Source identity

| | SHA256 | lines | bytes |
| --- | --- | ---: | ---: |
| before (frozen 517 candidate, verified before editing) | `65cf1bf1a66c3cc91c819ac7f5402527ca677900002c90ca3e58d443f9ac697e` | 2796 | |
| after (526) | `d5f8cb7171f602df76b2115819e7e63320b84b4f7e602fb5811ad57984b1eb22` | 2797 | 156856 |

## Diff (one hunk: the 1353–1356 comment and line 1359)

```diff
@@ -1351,12 +1351,13 @@
   }
   const slotSearch = work.calc(16).times(slots,
     work.calc(32).plus(5, keyConstruction, work.calc(8).times(2, occupiedKey)))
-  // The two requirement walks include all nonmatching facilities too; their
-  // operands are phase-table capabilities, and 7's mounted-stage id compares
-  // on the two stages fit the second, unexecuted walk's allowance. Sticky
-  // retention also does the exact facilities.some check and copies its row.
+  // The two requirement walks include all nonmatching facilities too. At 7 the
+  // operands are phase-table capabilities, and the mounted-stage id compares on
+  // the two stages fit the second, unexecuted walk's allowance. At 6 sticky
+  // retention's exact facilities.some compares facility IDS of width up to d
+  // and copies its row, so that frame's walk is priced at text, not capabilityText.
   const requirements = work.calc(64).plus(30, work.calc(16).times(3, capabilityKey),
-    work.calc(16).times(2 * d.f, 2 + capabilityText), 2 * capabilityText,
+    work.calc(32).times(2 * d.f, 2 + (shooting ? text : capabilityText)), 2 * capabilityText,
     reservationCopy, shooting ? 6 + keyConstruction + occupiedKey : 0)
```

`text` (line 1308, `equality(d.d)`) and `shooting` (line 1270) are already in scope. No other line changed; no `work.pay` added.

## Prepayment form: (a) `calc(32)`

Argument tree at the new 1360: `2`, `*`, `d`, `.f`, `2`, `+`, `shooting`, `?:`, `text`, `capabilityText` = 10 static nodes, 9 executed on either frame, within the 16-node allowance of `calc(32)`.

Form (b) rejected as specified. The existing `pay(12)` at 1342 covers 6 nodes. Line 1343 already executes 4 (`shooting` read, branch, `sceneryCapacity` read or the paid `calc(8).times` call, binding write). The hoist `const walkWidth = shooting ? text : capabilityText` executes 4 more (`shooting` read, branch, one arm read, binding write): 8 against 6, spare −2. Making (b) lawful needs `pay(12)` to become `pay(16)` on 1342, a second line change the assignment forbids.

Side effect of (a): the replay's own meter (`work.used`, emitted as `preparationWork` and printed as `used` in the B4_RESULT probe lines) grows by 16 on each single-early frame (labels 3 and 4; one caller at 1445, once per sweep week), so cumulative `used` reads +16 after week 3 and +32 after week 4 against the 517 candidate. No test pins `preparationWork` numerically (grep of `src/**/*.test.ts`). Bill values are unaffected.

## Predicted values (514 `Dimensions`: d 28 → text 57, capabilityText 39, f 5)

Paper arithmetic, not measured:

- rT7 (label 3, `shooting === false`): walk term stays 2·5·(2+39) = 410; bill stays **8099**.
- rT6 (label 4, `shooting === true`): walk term becomes 2·5·(2+57) = 590, +180; requirements 1028 → 1208, allocation 5292 → 5472, entries 5953 → 6133, bill 8398 → **8578** (516's expectation).
- Labels 1/2/5/6/7/8 and rT1 unchanged: 315 / 6861 / 850 / 7948 / 576 / 5668 / 708. Admission 3913 unchanged.

Coverage at rT6: executed compare work on this fixture ≈ 322 (518's figure: 176 retained-arm id compares before `facility-soundstage-07` + 146 set-scenery walk) against the new bound 590; guarded-domain worst case ≈ 521 (295 id compares at width text + 205 capability compares + 21) ≤ 590. The rT7 static bound is unchanged at 405 ≤ 410.

## Typecheck (the one authorized run)

```
> project-studio-core@0.1.0 typecheck
> tsc --noEmit && tsc -p ui/tsconfig.json --noEmit

exit: 0
```

## Status

SOURCE FROZEN; write ownership yielded.

Next parent action: re-freeze the 526 hash `d5f8cb71…1eb22` (2797 lines) and pins; bounded 527 re-review of this hunk; serial groups 528–533; 534 passive re-measurement with equality required on 315 / 6861 / 8099 / **8578** / 850 / 7948 / 576, 5668 on the unreached Post exit, 708 restricted, 3913 admission, noting the +16 per single-early frame in `used`.
