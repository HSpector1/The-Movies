<!-- 1344-J4: confirmation (read-only) of 1344-M3 r2 against 1344-J3, saved verbatim by the parent -->

# 1344-J4: confirmation of 1344-M3 r2

E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`, S = `/Users/zacheryspector/studio-scratch`. I checked HEAD 93781f43 with the same read-only methods as 1344-J3.

## Verdict: CONFIRMED

r2 fixes both blocking defects and all eleven notes. The residuals below are minor wording points, and none blocks.

## Blocking defects

1. **x3 tree claim: MET.**
   - M3:143 now rests the type-gate clause on the type gates at HEAD 85764cd5. It names the three test files where x3 differs from the applied tree.
   - The checker paragraph (M3:196-198) and the docstring (`1344-M3-check.py:3-4`) say the same.
   - `1344-M3-type-gates-HEAD.txt` is byte-equal to `S/post-s7-queue/typegates-HEAD.txt` (sha256 84775c47…). It shows three `exit 0` and a clean `status: []`, and `queue.meta` logs the run at 21:53:47 CDT, after §7.
   - `git diff --stat 469a9547 85764cd5` over the source paths and configs is empty, so "the gated tree plus docs" holds.
   - The `check.py` diff touches only the docstring. Run in memory, the r2 checker reproduces `1344-M3-check.json` byte for byte.
2. **Node overclaim: MET.**
   - M3:154-180 is rewritten, and M3:121-122 and :148 carry the timing confound.
   - I verified each fact against the recorder JSONs:
     - 1346, 1351 and 1352 ran v20.20.2;
     - the 1353 runs ran v22.23.2 from 18:19:46Z;
     - x3 recorded no version.
   - The duration figures equal 1344-J3 item 9.
   - `1344-stage/s7/out/s7.meta:1` names `/Users/zacheryspector/.nvm/versions/node/v20.20.2/bin/node`.

## Notes

1. Deep-route history: MET, M3:132-135 (see residual a).
2. C20 wording: MET, M3:146 (`:93:49` matches 1344-M's frame).
3. Hygiene wording: MET, M3:74-75 and M3:200-202.
4. GONE reason: MET, M3:69. Core raw line 3656 shows 3 tests passing, as cited, and the 1345-E:30-33 citation is correct.
5. "No new environment row": MET, M3:7, M3:113-115 and M3:148.
6. Recorder times: MET, M3:54-55 and M3:105-106. They match the recorder's 01:08:12.920Z, 02:26:53.412Z, 02:26:57.568Z and 02:39:17.251Z.
7. Exit-code wording: MET, M3:43 and M3:93 (`gates.meta`: "run exit 0").
8. Heavy-lane citations: MET, M3:20 and M3:26-30 (1359-C4:13; 1356-C4:3, :44).
9. 62f14e7: MET, M3:74-75 names it as a scratch commit carried by cec3902c.
10. Reproduce block: MET, M3:184-194. Run in memory with the block's own paths, all five outputs are byte-equal to the committed files. I did not run the block itself, because `mktemp` writes.
11. Unhandled-error line: MET, M3:103-104. 8b984d12 is U3 (1349-E).

## Nothing else changed: MET

The word diff from 85764cd5 to 93781f43 touches only the J3 items, the revision note (M3:9-10) and Next (M3:204-207). Every number in r1 survives, with two exceptions:
- the four run times, now quoted from the recorder;
- "1,192", which left with defect 1's false claim.

## Residuals (non-blocking)

- a. M3:133 tags all four 1344-M2 runs "(Node v20.20.2)". Only the recorded broad run carries a version. The three diagnostic runs in `1344-M2-diag/` (files written 2026-09-30 01:00:14 CDT) record none. Their timing makes v20 likely, but no record shows it.
- b. M3:10 says "No number changed", yet the four run times changed and "1,192" was dropped. "No count changed" would be exact.
- c. M3:148 carries r1 wording that 1344-J3 missed: it calls all four of 1344-M's rows "load rows" and "timing rows". 1344-M:51-55 shows the hygiene ELOOP row came from a stray self-link, so the timing confound does not apply to it.
- d. M3:176 says "1344-K does not." No 1344-K exists yet, so "will not" would state the commitment.
- e. M3:185 has one passive: "are compared".
- f. Outside M3: HANDOFF.md:57, both committed and in the working tree, still says "whose tree equals the applied one". HANDOFF.md:56 still lists §7 and the HEAD type gates as unmeasured.
