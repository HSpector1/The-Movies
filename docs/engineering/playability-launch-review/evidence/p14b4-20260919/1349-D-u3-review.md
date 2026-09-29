<!-- 1349-D: independent review (contract-auditor, read-only) of 1349-A, saved verbatim by the parent at HEAD 6d5ae7fc from the agent's final text -->

# Independent review 1349-D

**Verdict: ACCEPT**

## Scope
Read-only review of the U3 plan/dry-run `1349-A-u3-identity-fake-view.md`, patch `1349-stage/1349-u3.patch`, and artifacts `1349-X-repro-before.txt`, `1349-X-repro-after.txt`, `1349-X-file-run.txt`, `1349-X-ui-tsc.txt`, `1349-X-root-tsc.txt`, cross-checked against live source at HEAD 19a31f73.

## 1. Cause — MET WITH EVIDENCE
- `ui/src/lot/StudioLotScreen.tsx:4849-4858`: `useEffect` gated on `if (!hollywood || !identityProof || !canvasReady) return`, `setInterval(..., 500)` calling `viewRef.current?.hollywoodPerformance()` at line 4854 with **no** optional chain on the method call itself — matches the stack frame `StudioLotScreen.tsx:4854:37` exactly.
- `ui/src/lot/StudioLotIdentityReview.test.tsx` `spy.Fake` (pre-patch, lines 25-46): confirmed no `hollywoodPerformance` method exists — `setSignageMasked/camera/identityDebug/destroy` are present, the target method is not.
- Count of "21 other fake views define `hollywoodPerformance() { return null }`": `grep -rl "hollywoodPerformance() { return null }" ui/src` returns exactly **21 files**, matching 1349-A's figure precisely. Note this correctly carries forward the 1343-F/1343-J correction (1343-I originally undercounted "eight," 1343-J flagged it, 1343-F corrected to 21) — a proper later-correction-over-older application, not a fresh discrepancy.
- Bonus finding (non-blocking): two other call sites of the same method exist at `StudioLotScreen.tsx:4867` and `:4878` (publicity/gate-candidate effects), also unguarded past `view?.`. Neither fires in this test file — grep for "Hollywood" in the test file returns zero matches, so `publicitySelected`/`gateCandidateIntent` are never set truthy here. The fix incidentally hardens those paths too without being asked to; not a scope concern.

## 2. Reproduction artifacts
- `1349-X-repro-before.txt`: same `TypeError: viewRef.current?.hollywoodPerformance is not a function` at `StudioLotScreen.tsx:4854:37`, printed twice under "Unhandled Errors," `Tests 1 passed | 10 skipped`, `Errors 2 errors`. Probe name `zz-u3 probe: a mounted Lot with the dev flag outlives one 500 ms telemetry tick` matches the doc's description. **MET WITH EVIDENCE.**
- `1349-X-repro-after.txt`: identical run, no "Unhandled Errors" section, `Tests 1 passed | 10 skipped`, no error tally. **MET WITH EVIDENCE.**
- `1349-X-file-run.txt`: `10 tests) ... 10 passed`. Live file has exactly 10 `it(` blocks (lines 90/95/113/126/144/156/167/173/195/215) — count matches. **MET WITH EVIDENCE.**
- Probe accuracy and absence from patch: `grep "zz-u3"` against the live test file returns no matches; the patch's single hunk touches only the fake-view class (see §3). **MET WITH EVIDENCE.**
- **NOT VERIFIED (non-blocking):** neither txt artifact prints a literal shell exit code; the doc's "exits 1" / "exit 0" phrasing is inferred from Vitest's standard convention (nonempty "Errors" section ⇒ nonzero exit), not a captured status line. Reasonable inference, not independently confirmable from these logs alone.
- **NOT VERIFIED (non-blocking):** `1349-X-ui-tsc.txt` and `1349-X-root-tsc.txt` are empty, consistent with a clean `tsc --noEmit` (which is silent on success), but no exit code is captured either. The scratch probe source itself is deliberately not preserved (ephemeral, excluded from the patch by design) — I cannot inspect its exact code, only the doc's paraphrase plus the matching test name/frame in the logs. This is disclosed honestly in the doc as a scratch dry run, not concealed.
- sha256 `ca72f857…` of the patch: unverifiable with my read-only toolset (no hash utility available). Not a defect, just a gap I cannot close.

## 3. Patch — MET WITH EVIDENCE
`1349-stage/1349-u3.patch`: single file, single hunk, `ui/src/lot/StudioLotIdentityReview.test.tsx`, three added lines (two comment lines + `hollywoodPerformance() { return null }`), inserted between the existing `identityDebug()` and `destroy()` members. No other lines touched, no removal, no test/assertion edits, no production or config change.
- `null` handling: `StudioLotScreen.tsx:4855` is `if (next) setHollywoodPerf(next)` — a null return is a pure no-op, exactly the pattern the other two call sites (`:4867-4868`, `:4878-4879`) already assume for their own null-guarded reads.
- Masking risk in this file: none. `grep -i hollywood` against the test file returns zero matches — no leaf in `StudioLotIdentityReview.test.tsx` asserts anything about performance chrome, absence of it, or the new method, so the added no-op cannot suppress or mask any existing assertion in that file. The only observable behavior change is removal of the interval's uncaught throw; every other code path in the file is unreachable by any of the 10 leaves regardless of this change.

## 4. Scoping — MET WITH EVIDENCE
This is a test-double-completeness repair, not a timing or assertion change: the 500 ms interval value, its gating conditions, and every other production line are untouched; no `vi.useFakeTimers`/timer-advance logic changed; no existing `expect(...)` was added, removed, or loosened. The fix brings the one outlier fake view (of 22 total Lot fakes) into parity with the other 21 that already model this method, matching the shape the production `viewRef` contract requires.

## Blocking defects
None.

## Non-blocking notes
- Exit-code claims ("exits 1"/"exit 0") and tsc "exit 0" are inferred from tool convention/empty output rather than a literally captured status in the txt artifacts — worth a one-line caveat in the record if a stricter provenance standard is wanted for this stage, but not disqualifying for a pre-application scratch dry run.
- The scratch probe itself is correctly excluded from the patch and correctly stated as not part of it; its source is not otherwise recoverable from this evidence set, which is expected given its deliberate ephemerality.

## Files referenced
- `/Users/zacheryspector/The-Movies-headless-program/ui/src/lot/StudioLotScreen.tsx` (4849-4858, 4860-4881)
- `/Users/zacheryspector/The-Movies-headless-program/ui/src/lot/StudioLotIdentityReview.test.tsx` (1-229, class at 22-48)
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1349-A-u3-identity-fake-view.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1349-stage/1349-u3.patch`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1349-X-repro-before.txt`, `1349-X-repro-after.txt`, `1349-X-file-run.txt`, `1349-X-ui-tsc.txt`, `1349-X-root-tsc.txt`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1343-I-broad-ui-attribution.md`, `1343-J-u2-gate-attribution-review.md`, `1343-F-parent-response-to-1343-J.md`
