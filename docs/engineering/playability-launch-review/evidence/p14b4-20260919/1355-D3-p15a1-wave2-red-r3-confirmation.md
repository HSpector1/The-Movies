<!-- 1355-D3: confirmation review (contract-auditor, read-only) of 1355-C3 r3 -->

# 1355-D3: confirmation of the P15A.1 Wave 2 RED r3 (1355-C3)

**Verdict: CONFIRMED.**

Read at HEAD 9b16877b (`src` tree db80ca31). I ran no test, node, tsc or script. The r3 patch equals `git diff 4d09e80 main` and passes `git apply --check`; `ref3` is 1356-C reference r2 (e0ecf75) plus 1355-reference-r3.patch. Ph: phases test on `main`; T: main test; P: producer r3.

| Item | Status |
|---|---|
| F5 1, leaf | APPLIED (Ph:23-31) |
| F5 1, reference | APPLIED (`ref3` marketIntegration.ts:164-165, powerRankingArchive.ts:239-240; `p15PhaseMatches` removed) |
| F5 2, one shared step | APPLIED (C3:13-14; T:16-19; both capture leaves flagged `repinAtSiblingLanding`) |
| D2 note, producer proof | APPLIED (P:95-114, :128-129, :138) |

**F5 item 1.** The mock returns `{ ...actual, P15_PHASE_TABLES }` with one added table and replaces nothing else. Ph:63 now fails each wrong validator:
- one pinned to the live version refuses the v2-declared row;
- one that reads the live table ignores the row's version and finds ordinal 1, not 2;
- one that reads a table a helper in `p15Phases.ts` closes over, or that an exported function returns, sees the real module without version 2.

Only a lookup of `P15_PHASE_TABLES[row.phaseOrderVersion]` through the exported binding passes. Frozen table objects survive the spread. `p15PhaseTriple` still reads the internal table, but it serves the write path, and F5 binds validators.

**The producer's proxy suffices for T:761.** On the candidate, the batch assesses every rival release in its release week, and the witness fails any week that misses one. So "assessed within 26 weeks" equals "released in [M, M+25]" there. The proof shows that release on the old writer. The two release weeks match unless post-migration pressure slows the picture's own production. `operateStage` reads only the picture's own workflow (hollywoodTick.ts:78-91), and nothing besides the weekly advance moves `remainingTicks` (1355-F Amendment 1). Pressure moves grosses, cash and Standing (1355-A §4), none of which that path reads. Both runs pair the same picture, because `capturePremise` reads only the capture.

## Notes (non-blocking)
- Record the proven release week in the MANIFEST `facts` so the parent sees the margin to M+25.
- Ph:63 proves the market validator's lookup only. No leaf declares a ranking record under version 2, so F5's rule for the archive waits on 1356-C's RED.
