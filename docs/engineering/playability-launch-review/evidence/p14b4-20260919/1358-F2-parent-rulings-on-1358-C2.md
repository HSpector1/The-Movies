# 1358-F2: parent rulings on the slice B RED r2 handback (1358-C2)

[1358-C2](1358-C2-rel-sliceB-red-r2-handback.md) carries 1358-F §1-§3 into RED r2 over the slice A candidate at HEAD
469a9547, which includes the Save43 pin sweep. The author ran nothing, because the heavy lane was locked for the recorded
gates and §7. The handback names four open points and two defects outside the brief. The parent rules on each, and the
author makes them as r3 before the dry run 1358-X, so 1358-X measures r3.

## 1. A romance write materializes separation first

1347-A §2.3 gives separation "the same shape as `currentCloseness`". The closeness write materializes drift before it
applies a delta (`writeEdge`, `src/core/relationships.ts:207-224`: "drift materialized first, then the delta"). A romance
write therefore runs in this order:
1. record any derived ending in `endedWeek` (§2.3, "before any new driver applies");
2. read `currentRomanceValue(romance, writeWeek)`;
3. add the week's gain, if any;
4. clamp to 0..100;
5. set `anchorWeek` to the write week.

Under any other order, one shared take would restore a decayed track in full.

- The low-proximity leaf (`tests/p14b10-romance.test.ts:319` at r2) stages its anchor 200 weeks back and expects the
  staged 50 after the touch. Under this ruling it reads 32, so it could never pass at GREEN. r3 moves its anchor inside
  `ROMANCE_GRACE_WEEKS`, so the leaf tests what its title says: no gain, and the anchor resets.
- r3 adds one leaf that pins the order. It uses a high-proximity touch with a gain on a track anchored outside the
  grace period, so the three possible orders give three values: restore then gain 60, materialize then gain 42, gain
  then decay 38. Every expected value is an expression over the named constants.

## 2. The ending computed on read stops the drift exemption

The author read "endedWeek" in 1358-F §3 to include an ending computed on read before any write records it. That
reading stands. 1347-A §2.3 says the ending week "is computed on read", and §5 says recording it "changes no
closeness". Without it, the read would jump at the derived ending and jump back when a write recorded it. The leaf at
:483 stays.

## 3. The two guards in the ending leaf

The guards at :398-399 stay. Without them, the leaf blames its fixture for a missing API, the defect class of r1 F3.3
that 1358-F §4 accepted as fixed.

## 4. The `baseWorld()` budget

1348-F4 item 3: never keep a limit that cannot fire. The first `baseWorld()` caller builds the world inside a 5 s
default that Vitest 2.1.9 cannot fire on a synchronous body.
- `baseWorld()` stays memoized, one build per file.
- r3 self-times the build. A named error fires once it passes `PROVISIONAL_BASEWORLD_BUDGET_MS` = 120,000 ms. r1
  measured 25-32 s for a comparable week-400 advance (1358-C F3.2).
- 1358-X measures the build and sets the final number.
- Any Vitest timeout left on a synchronous leaf carries the 1356-F5 note that it is not a budget.

## 5. The producer's placement

`1358-P-save43-producer.ts` imports with five `../` and sets `ROOT` the same way. From `E/1358-stage` those resolve
under `docs/`, so the run fails before it writes anything. The parent publishes the producer in E itself, as
`E/1358-P-save43-producer.ts`, where the imports resolve, as `1344-P2` does. r3 updates the producer's provenance path
and the GENUINE leaf's message (`tests/p14b10-save-v44.test.ts:126`) to name that path. The staged copy stays as the r1
record.

## 6. The stale describe titles

The growth and drift describes still say "Proposed seam" and "Proposed API". The RED is unrecorded, so no baseline
identity depends on them. r3 renames them to state the ruled seam and API. The classification records the lineage
(`renameOldIdentity`, `renameNewIdentity`).

## 7. Two points from the r3 report, for r4 after 1358-X

The author made items 1-6 as r3 ([1358-C3](1358-C3-rel-sliceB-red-r3-handback.md)) and named two more:
- **`rosterWorld()`** in `tests/bridge-p14b10-relationship-labels.test.ts` has the same defect as item 4. Its first
  caller builds the world inside the 5 s default (r1 measured 13.5 s for its group). It gets the item 4 treatment:
  memoized, self-timed, with a named error past its budget.
- **The third-party leaf** passes at RED without testing anything. Its staged value is NaN, and `toBe` compares NaN
  with NaN by `Object.is`. It gets the guard the other leaves carry, so it fails at RED by name and passes at GREEN
  only if a third party's open bond blocks growth.

r4 makes both changes and sets the final `baseWorld()` and `rosterWorld()` budgets from 1358-X's measurements.

## Next

1. r3 from the author: done (1358-C3).
2. The parent's dry run 1358-X on r3:
   - every slice B RED file;
   - the build times of `baseWorld()` and `rosterWorld()`;
   - the root, UI and Bridge type gates;
   - the producer's dry run from E in a tree without symlinked roots.
3. r4 per item 7, with the measured budgets.
4. Review 1358-D.
