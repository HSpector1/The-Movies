# 1344-D5: review of the S10 pre-declarations

Contract-auditor, read-only, nothing run. Sources as 1344-F4 lists them, `src` at ff05430d, merged tests at a318722.

**Verdict: ACCEPT WITH CHANGES** (section 4).

## 1. Reviewer checks

1. ACCEPT WITH CHANGE. F4 ruling 1: rows 1-4 stay failing and get attributed. Strike part f of rows 1-4 and row 1's reviewer note.
2. ACCEPT (F4 ruling 2). The probe's guard (:11-20) matches the ruling's clauses; `bytes()` has one caller, :596.
3. ACCEPT WITH CHANGE. F4 ruling 4 decides, on the leaf's own terms (R6a, R6b).
4. ACCEPT WITH CHANGE. Run B reads the persisted `screenplayShelving.shelved`, never production. The text it replaces sits at :607-608, not :604-605. Record class ORACLE with talentMarket.ts:1442-1449 and hollywoodTypes.ts:142-145 (F4 ruling 3).
5. ACCEPT (F4 ruling 8: sweep first).
6. ACCEPT. Moot: F4 ruling 1 moves no family-12 pin.
7. ACCEPT. 1344-I-vs1338.json confirms seed-b at :530:54, settled 41 against 48. The sweep's helper (merged :67-76) shifts later lines by 10; 1344-I-compare.py:13 compares primary text, so status holds. LEDGER_SEEDS has four seeds, not three.

## 2. Attribution and probes

The common base holds. `git diff --stat ff803032 HEAD -- src bridge generated` lists 18 `src/core` files; ff803032 is 1338's `sourceSha`; nothing imports the five new modules; `tuning.ts` only adds keys. With nothing shelved, the live differences are the pure recount at hollywoodTick.ts:236 and the count write at :268-274.

Rows 1-4 share three defects:
- C1, no anchor. Nothing checks that the HEAD run reproduces the 1344-I received value and the old-source run reproduces 1338's, so both runs may be chains the leaf never ran. HEAD and old anchors: row 1 d32e68f6…, 9eeb62f6…; row 2 settled 41, the :547 sentence failure; row 3 62c9fd5d…, settled 35; row 4 8a4df62f…, 4a047502….
- C2. Part e says the probes read `S10_OLD_ROWS` and `S10_OLD_LEDGER`. Neither does, and the offline step has no script. Load the old dump in the probe and assert the first differing row's week exceeds the earliest shelving week.
- C3, rows 1-3. Add the 1344-F3 ruling 4 check: tick a plain chain to Ws in both trees and compare sha256 of key-sorted JSON with `screenplayShelving` deleted from every business, per 1344-X6. Equality measures that nothing moved before the shelving. Row 1 d4's budget clause (no cash recorded) and rows 2-4 d3 then explain rather than gate.

Row 1. Mechanism and citations are right (:233, :259, :290, :302); the probe hashes the leaf's own tuple (:495-496). d2 is untestable: `chosen === null` also covers cash-blocked weeks. Use the receipt's `rejections: 13` or record the weekly count.

Rows 2-4. Paths (1)-(3) are right. False pass: the dump drops the `studioId` of declined and expired receipts, which `settlementDigest` hashes (merged :255), plus `subjectStudioId` and `band`. A tuple moved at 208 can hide while the first visible difference follows a later shelving, and d1 passes. Dump `settlementRows(state)` and `rows` verbatim, and every market receipt for d6. For d4, run the leaf's law lines (merged :543-558, :565) in the probe, not a re-pinned leaf. Assert `rel !== null`; :235 swallows an import failure.

Row 5. Sound. The digest compares serialized bytes; a decision change would show outside the stripped key.

Row 6. Sound: the week-208 receipt and no `film:6` before 234 explain the empty :372. The re-pin half has defects:
- R6a. The probe stops at post-tick 236; the leaf's `guard > 40` (:358) reaches 237. A take at 237 would read as a false premise conflict. Tick 41 times.
- R6b, false pass. `takes.find` returns the first r01 take sharing a pair and skips takes between. The leaf fails any other take before the repeat week (:375) and needs a shared pair (:642). Take the first take after 213, then require r01 and a shared pair.
- R6c. d4 and d5 go unasserted: r01's shelving is logged only at 236, after a possible 234 retry. Record shelving and `development.projects.length` per week; assert at post-tick 222 and over processed weeks 208-220. Add the `filmReleased` check at 217, and d6.
- "Expected outcome: none" ignores a post-hold commission at 221. The probe decides.

Row 7. Sound, but Run A compares `JSON.stringify(draft)` with `JSON.stringify(want)`. Production spreads the attachment before the issuer fields (talentMarket.ts:1486-1491); `expectedAuthoringDraft` puts them first (:625-630). Every read logs, and the first line is a key-order artefact. Wrap the existing assertion: `try { expect(draft).toEqual(want) } catch (e) { console.log(...); throw e }`. Word d1 as the probe does, "S is in `shelved` at Wa"; a receipt outlives a retry.

Every probe uses public exports only, without `Math.random`.

## 3. Where they run

No probe needs the real repository or writes `tests/fixtures`. Rows 5 and 6 read genuine saves through the merge tree's `tests/fixtures` symlink into the real repository.
- Rows 1 and 2-4 write wherever `S10_ROWS_OUT` or `S10_LEDGER_OUT` points. Require an absolute path under `/Users/zacheryspector/studio-scratch/1344-sweep/s10/out/` and throw otherwise.
- "Append to a scratch COPY" with a command naming `tests/<file>` edits a swept file. Copy to a new name in the same directory (imports and `import.meta.url` fixtures still resolve), run that path, delete it before x3, and confirm `git status` lists only `dist/`.
- Name the old-source tree: `git archive ff803032 src generated` plus the merge tree's tests, bridge and configs.

## 4. Verdict

ACCEPT WITH CHANGES. Before running, the parent applies C1-C3, the row 1, rows 2-4, R6 and row 7 changes, and the section 3 path rules. Row 5 runs as written.
