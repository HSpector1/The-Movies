<!-- 1330-J: independent review (contract-auditor, read-only) of 1330-I, saved verbatim by the parent at HEAD 58c89932 from the agent's final text -->

# Independent review 1330-J

**Subject:** `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1330-I-broad-core-attribution.md` (untracked draft) and its data `1330-I-failures.json` (committed at 58c89932).

**Scope/method:** Read-only, via Read/Grep only, no commands executed. I cross-checked every factual claim in 1330-I against the underlying JSON run records, the raw 15,967,082-byte log (searched with Grep, never loaded whole), and the 1327 series (plan/handback/amendment/dry-run/review) that this gate is meant to reflect.

## Verdict: **KEEP**

No blocking defects found. Every quantitative and identity-level claim in 1330-I checked out exactly against independently re-derived evidence (not just re-stated from upstream documents). Two non-blocking notes below.

## Checklist results

**1. Run identity — MET WITH EVIDENCE.**
- `1330-r2-broad-core-preflight.json:583` `"head": "350f9db50d77f5f9695b76de6ac7ba593c84df44"`, `:2140` `"remote": "350f9db5..."` — equal, confirms "HEAD equal to the remote at preflight."
- `1330-r2-broad-core.json:1596-1602`: `"exitCode": 1`, `"sourceShaAtEnd": "350f9db5..."`, `"testedDiffSha256AtEnd": "e3b0c442..."` (the SHA-256 of the empty string — confirms "empty tested diff"), `"fixedSource": true`.
- `1330-r2-broad-core-postflight.json:2145-2157`: raw block `bytes: 15967082`, `sha256: 819b1984e9be9e5179718fc1aaa25c429574127f226bed4085ad1485549fd980`; patch block `bytes: 0`, `sha256` = same empty-string hash; `"allGuardsExact": true`. All three independent sources (postflight, the run record, and 1330-I-failures.json's own `raw` block) agree byte-for-byte on the raw path/bytes/sha256.
- `1330-r2-broad-core-collection-preflight.json`: `trackedCoreTests: 428`, `excluded` = the 6 named 1296-A files, `allowlistCount: 422`, `proof` states no excluded path overlaps the allowlist.
- `1330-r2-broad-core-collection-postflight.json`: `reportedFiles: 422`, `equalsAllowlist: true`, `excludedSeen: []`, `missing: []`, `unexpected: []`.
All of these match 1330-I's Run-identity paragraph verbatim.

**2. Tally — MET WITH EVIDENCE.** Raw log `1330-r2-broad-core.txt:42085-42086`:
```
 Test Files  24 failed | 398 passed (422)
      Tests  82 failed | 4599 passed | 3 skipped | 11 todo (4695)
```
Matches 1330-I's stated tally exactly. "No unhandled error; no suite fails to load" confirmed — `grep -i unhandled`, `failed to load`, `Cannot find module`, `SyntaxError` all return zero matches in the raw.

**3. Set comparison with 1325 — MET WITH EVIDENCE.**
- I grepped both `1325-I-failures.json` and `1330-I-failures.json` for the 11 named identities (bridge-contract-generator F10 + positive-output; bridge-runtime-checkpoint V15; facility-move-demolish law19; p13b-r07-save-v25 ×2; p14c2s-scientist-retirement S10; p14c3-canonical-rival-history K1-K4). All 11 are present as failing rows in 1325 and appear only in 1330's `"vanished"` array (not in 1330's `"rows"`) — confirmed gone.
- Changed-primary rows: 1330-I-failures.json's only 4 `RETAINED-CHANGED` rows (vs 1316) are L1 (`:995`), L2 (`:1009`), `p14c3-save-v38` (`:1037`), and the benign exporter (`:1163`). I confirmed `p14c3-save-v38`'s primary text was already identical at 1325 (`1325-I-failures.json` shows the same `saveVersion 42 vs 38` message), so it correctly drops out of the "changed vs 1325" count, leaving exactly 3 (L1, L2, benign exporter) — matching 1330-I's claim precisely, not a shortcut.
- Benign exporter: 1325's primary ends `...studio-scenery-export-ZD4QZX`, 1330's ends `...studio-scenery-export-bF6ZqY` — differs only in the temp-dir suffix, exactly as claimed.
- Gone set vs 1327-X: identical (C12 2, C15 5, C3 K1-K4) — confirmed by direct comparison of the two documents' named rows.
- No `bridge-supervisor` row in 1330-I-failures.json (`grep` → no matches); in the raw log the file shows `✓ |core| tests/bridge-supervisor.test.ts (14 tests) 110416ms` at line 1179 — passes in the real repo run, confirming the scratch-tree-only 7-row artifact correctly does not appear here.

**4. Retained tally by cluster — MET WITH EVIDENCE.** I grepped `cluster_1302` with line numbers and restricted counting to lines inside the `"rows"` array only (< line 1167, before `"vanished"` begins), to avoid conflating the current-failure list with the cumulative-since-1316 vanished list (a distinction the underlying data makes but that is easy to get wrong). Exact per-cluster counts inside `"rows"`: C8=42, UNRESOLVED=10, inherited-1100=9, C17=6, C16=5, C3=3, C15=2, C16b=2, C1=1, C20=1, benign=1 — sum 82. Matches 1330-I's stated tally exactly, cluster by cluster. The C3 three are lines 268 (`bridge-p14c3-runtime` R8), 996 and 1010 (L1, L2) — confirmed to be exactly R8/L1/L2 as claimed. The C15 two are lines 240/254, both `bridge-p14c2rm-retirement` rows — confirmed.

**5. Overclaim/support check — MET WITH EVIDENCE.**
- No GREEN/acceptance/closure language anywhere in 1330-I; it states only "Repair R2 removes 11 failing identities... and introduces none," which is what the evidence shows.
- Seven R2-touched files: `grep 'FAIL.*<file>'` across the raw log returns matches only for `p14c3-canonical-rival-history.test.ts` (L1 at line 41880, L2 at line 41881); zero FAIL lines for `bridge-contract-generator`, `bridge-runtime-checkpoint`, `facility-move-demolish`, `p14c2s-scientist-retirement`, `p13b-r07-save-v25` — confirming "pass" for those five and "fails only L1 and L2" for the sixth.
- Helper-consumer claim: I grepped `tests/` for `p14c3-canonical-rival-fixtures` myself and found two matches — `tests/p14c3-canonical-rival-history.test.ts` (the real code importer) and `tests/fixtures/p14/genuine-v38-pre-p3/MANIFEST.json:3557` (a provenance hash-listing entry, not a TypeScript import). 1330-I's wording ("no other importer") is accurate and correctly worded to exclude this non-code match.

## Non-blocking notes (not defects in 1330-I)

1. 1327-C's own consumer-sweep phrasing ("`grep -rl` ... finds exactly one consumer") would, if re-run today, also surface the MANIFEST.json hash-listing match. 1330-I doesn't repeat that phrasing and uses the more precise "importer," so this is not a defect in 1330-I — only a note for anyone reusing 1327-C's looser wording as a template later.
2. I did not independently diff `1321-I-attribution.py` against its prior invocation to confirm byte-identity ("unchanged" is asserted by the task framing); I instead validated its output indirectly and strongly via exact cluster-count arithmetic (82 = 93 − 11, matching per-cluster) and direct identity-text matches against 1325/1327-X, which would be very unlikely to align this precisely if the classification logic had silently changed.

## Files referenced
`docs/engineering/playability-launch-review/evidence/p14b4-20260919/1330-I-broad-core-attribution.md`, `1330-I-failures.json`, `1330-r2-broad-core.json`, `1330-r2-broad-core.txt`, `1330-r2-broad-core-preflight.json`, `1330-r2-broad-core-postflight.json`, `1330-r2-broad-core-collection-preflight.json`, `1330-r2-broad-core-collection-postflight.json`, `1325-I-broad-core-attribution.md`, `1325-I-failures.json`, `1327-A-retained-defect-repair-r2-plan.md`, `1327-C-retained-r2-handback.md`, `1327-C2-retained-r2-revision.md`, `1327-F-parent-r2-handback-adoption.md`, `1327-D-retained-r2-review.md`, `1327-X-retained-r2-dry-run.md`, `1327-X-fullcore-rows.json`; and `tests/fixtures/p14/genuine-v38-pre-p3/MANIFEST.json:3557` (checked in the live repo tree).

Note: I noticed an MCP "Claude Docs" tool-instruction block injected into this session's environment. It is unrelated to this read-only review task and I did not act on it (no docs/artifact tools were available or used).
