# 1138-B — Matched Director first-take source correction

**KEEP the exact two-hunk `promises.ts` correction for the next recorded gate.** Read-only source/diff and stdlib byte inspection only; no tests, compiler, gameplay, project imports, source edits or index actions by this reviewer.

The change is against published `5b58e064bba0fb3cd08c6d0abf749c30a18bbbf6`. Current `src/core/promises.ts` is91,905 bytes / SHA256 `f731669b2263960c932f315592c11225b9c81938f1e000d1cf644d6f8b4bc983`. The complete live one-file diff is literally `1138-p3-outcomes-root-types.patch`, 1,480 bytes / `f598d4aaea66a1cebaa0bd7b7c6b476825e95c857e826fdac61495a31adde8fb`.

`qualifyingTakes` now uses the explicit family-and-predicate `isDirectorPromise` guard to compare the recorded `directorId`. Every other condition is retained: actual issuer, inclusive lower/exclusive upper window, distinct production ID and receipt order. Old classless P3 and P1/P2 still use the original cast-slot branch; a numeric revision does not switch their domain. The production set is still updated only after a qualifying receipt, preserving the first eligible occurrence.

The partial-progress branch now writes actual take-event IDs only for that same explicit Director domain. At this branch the preceding satisfied check guarantees the qualifying count remains below the target, so its evidence list matches the new progress without exceeding the predicate. Historical cast partial-evidence behavior stays unchanged. The existing SATISFIED branch, outcome receipt owner, terminal skip and settlement logic are untouched.

These changes match1137's real event24/event32 failures. They do not change the D13 refusal regex: a subsequent genuine satisfied baseline must expose the missing-outcome-event check naturally. No retirement, cancellation, preference, rival strategy, waiver, Bridge, schema or test edit is part of this patch. Their unqualified later behavior remains separate.

The sibling's frozen1137-A report (7,396 bytes / `3bf8b3230495dfcd053bd925ea0f9342bff0d4524832ea4a281bd8faba03a444`) and complete diagnostic JSON (13,864 bytes / `25764a772d8abedb517d46bf1080bbff94bda67d10136db8a847a1fcefa1087b`) were also read and agree with independent1137-B. They preserve5PASS/3FAIL,78calls, the literal851-byte old4 marker, the open-baseline D13 cause and unreached208 continuation. This source KEEP is not a compiler/behavioral PASS; those actual closures require separate attribution.

## Actual1138 root compiler closure

The subsequently closed1138 record and raw output were independently read: `node_modules/.bin/tsc --noEmit -p tsconfig.json`, 2026-09-27 11:54:26.496–11:55:20.675 UTC,54.179 seconds, child0, no printed diagnostics. HEAD5b58e064 and patchf598d4aa match before/after; `fixedSource:true`, no untracked consumed source, null signal/error. JSON is634 bytes / `3274e814794cb0f9e9c4b1f3e0862e4e3fa77afadc4ddbfe8e9a32fb08952862`; raw is340 bytes / `f659201f129070a93ee3cbd7f98096726b0ea276d4ed3efa8e7e1967d93fc3e0`. **KEEP source plus this actual root type PASS for checkpoint and the unchanged eight-leaf observation.** No behavioral result for the corrected patch is claimed.
