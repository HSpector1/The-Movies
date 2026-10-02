# 1358-F5: parent rulings on 1358-C5's two uncertain items

[1358-C5](1358-C5-rel-sliceB-red-r5-handback.md) left two leaves uncertain and named two production findings. The
parent sent these rulings to the test author on 2026-10-02 while [1358-X3](1358-X3-rel-sliceB-red-r5-dry-run.md)
measured r5. The author answered with r6, [1358-C6](1358-C6-rel-sliceB-red-r6-handback.md).

## Rulings

1. **Save-v44 :273, the out-of-order bonds.** The staged `endedWeek` satisfies every plausible bound, so the bond
   order is the leaf's only defect:
   - at or below edge 0's `lastEventWeek` (101), because a touch writes the ending and moves `lastEventWeek`, so a
     valid state keeps `endedWeek` at or below it;
   - at or after the bond's formation week;
   - inside the save's recording interval.

   A comment names the week and the bounds.
2. **The own-picture Mentor variant (Bridge :335-353).** The leaf restages the viewer's own unreleased picture as a
   real picture in production: in `activeProductions`, with its first take recorded, and with no release, no
   theatrical run and no release history row. Mentor then shows, and its evidence cites the picture by the title the
   production carries. If no lawful staging exists in the fixture, the author drops the variant, keeps the rival leaf
   and says why.
3. **The two production findings go to the production writer, not into the tests.**
   - Save44's log weeks are non-decreasing: P3a and P3b share a week.
   - After Save44, p14b5's `stage()` needs the two new fields, which falls to the pin sweep.

## Outcome

r6 ([1358-stage/1358-rel-sliceB-red-r6.patch](1358-stage/1358-rel-sliceB-red-r6.patch), sha256 212b7980…) applies
all three. It found a lawful staging for ruling 2: a tick spy captures the route's own state before the third
release. Next: a short parent run of the six files with the type gates (1358-X4), and confirmation review 1358-D2.
