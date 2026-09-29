<!-- 1332-D: independent review (contract-auditor, read-only) of staged repair R3 revision 2 and the 1332-X dry run, saved verbatim by the parent at HEAD b08a6b44 from the agent's final text -->

# Independent Review 1332-D — Staged Retained-Defect Repair R3 (revision 2)

**Verdict: REFINE**

**Scope of this review.** Read-only, Read/Grep/Glob only — no shell, no test execution. All claims below are verified by direct comparison of the patch text against the current, unpatched contents of the three target files in the repo (`tests/bridge-p14b2-checkpoint.test.ts`, `tests/p14b5-relationships.test.ts`, `tests/p14c3-promise-digest-continuity.test.ts`), against the cited production source, and against the archived measurement logs. I did not run vitest/tsc myself; the recorded application and broad-core/UI gates (1332-E) remain the parent's responsibility.

## 1. Scope (rules 1, 5) — MET WITH EVIDENCE

The patch `1332-retained-r3-r2.patch` touches exactly the three authorized files, tests only. Every hunk applies cleanly against the current unpatched source at the cited line numbers — confirmed by direct read: `bridge-p14b2-checkpoint.test.ts:65` (`toEqual` block), `p14b5-relationships.test.ts:72` (import), `:143` (`FROZEN.postTakeDigestStripped`), `:238-256` (`bytes()`), `:546` (`sha(bytes(after))`), and `p14c3-promise-digest-continuity.test.ts:186,194,197` all match byte-for-byte against the patch's "old" context.

No FROZEN/CHECKPOINT pin literal is edited. `postTakeDigestStripped: '9702aa68…'` (`p14b5-relationships.test.ts:143`) keeps its exact value; only its comment gains a citation. `recordedAffectedIds()` (`p14c3-promise-digest-continuity.test.ts:70-85`) is untouched and still asserts `toHaveLength(12)`. The one permitted assertion change (rule 4) is the only removed line in the diff (`toMatchObject({week:208, rulesVersion:4})` at old `:194`); it is replaced by a strictly narrower per-branch check plus a new pre-declared-attribution guard, never a loosening. No other `expect(...)` anywhere in the diff is deleted or weakened.

## 2. Checkpoint `:65` (rule 2) — MET WITH EVIDENCE

`convertV39ToV40` (`src/core/save.ts:10493-10497`) and `convertV40ToV41` (`:10526-10533`), read directly, confirm the added expected values are lift-derived, not literal:
```
firstTakeSubjects: { version: 1, cutoverOrdinal: old.state.firstTakes.length, facts: [] }   // :10496-10497
for (...) period.movements.termination = 0                                                  // :10531
```
The patch's `sourceFirstTakeSubjects`/`sourceBusinesses` consts mirror this exactly and are computed *inside* the existing per-slot `for` loop (confirmed: the hunk's context begins at original line 62, inside `for (const slot of [...])`), so both `currentSaveJson` and `savedSaveJson` recompute from their own `source`, per rule 2. The received values (`cutoverOrdinal 5`, four `termination` keys) appear only in a comment as cross-checks, not as the expectation's source.

Minor non-blocking note: `sourceHollywood = source.state.hollywood as {...}` casts without a null guard, unlike the null-safe treatment given to `hollywood` elsewhere in this same patch (`p14b5-relationships.test.ts`'s `strippedHollywood`). This is safe only because this fixture's `hollywood` is empirically non-null (four termination keys measured) — acceptable for a single fixed-fixture leaf, but worth flagging as an asymmetry in defensiveness.

## 3. Seam digest `:546` + Amendment 2 (rule 3) — MET WITH EVIDENCE

I read `validateFirstTakeSubjects` in full (`src/core/firstTakeSubjects.ts:36-89`, matches the cited range exactly) and traced its branches against this leaf's actual `after` state (tick 61, `prod-0052` still active, film not yet released):

- `eventId` — checked exactly against `state.firstTakes` (`:58`), unconditional.
- `genre` — checked against `takeSubjectOwner(...).concepts.find(...).genre` (`:60-63`), unconditional (concepts never get removed).
- `conceptId`/production agreement — `production = owner.productions.find(...)`; the check `production.conceptId !== fact.conceptId` (`:71,73`) is conditional on the production still existing, but for **this leaf's own state it does** (remainingTicks 5→4, still active), so it genuinely fires.
- `scriptProjectId: null` — is cross-checked indirectly: if a real linked screenplay project existed for this production despite the fact naming `null`, the separate `linkedProject` check (`:72,74-76`) would fail regardless of the earlier null-branch. So a false `null` is caught.
- The one branch that is *not* exercised here is the released-film cross-check (`:78-79`), because the picture hasn't released yet in this leaf — correctly vacuous, not a coverage gap (nothing exists yet to disagree with).

I also confirmed the validator is **not** reachable through the ordinary live-state pipeline once past V40: `validatePromiseRootsForVersion`'s signature is `saveVersion: 29 | 30 | 39 | 40` (`src/core/promises.ts:1553`), called only from the four per-version validators at `:1534-1550`; there is no V41/V42 equivalent, and `validateFirstTakeSubjects` is otherwise called only in `promises.ts:1633` under `saveVersion === 40` and in the unrelated harness file `src/harness/roster-wall/historical-control.ts:67`. So for a state at `LIVE_SAVE_VERSION` (42, as `after` is), the law's own content validator is normally never invoked again — the `bytes()` guard the patch adds is therefore the *only* place in this leaf that checks `firstTakeSubjects`'s real cross-referenced content after a real tick, genuinely closing 1332-B's blocking item 2, not duplicating an existing check.

The `termination` guard (`for (const business of state.hollywood?.businesses ?? []) { for (const period of business.account.periods) { if (period.movements.termination !== 0) throw ... } }`) is a complete characterization of a bare scalar, per 1332-B's own non-blocking note. `strippedHollywood` correctly rebuilds only `movements` minus `termination`, preserving all other structure, and the final `{ ...rest, promises, talentMarket, hollywood: strippedHollywood }` follows the file's own established key-override convention (same pattern already used for `promises`/`talentMarket`). `FROZEN.postTakeDigestStripped`'s literal is unchanged; only its comment gains a citation, matching rule 5.

The cross-tick `cutoverOrdinal` check (`expect(after.firstTakeSubjects.cutoverOrdinal).toBe(pre.firstTakeSubjects.cutoverOrdinal)`, added at `:546`'s leaf just before `sha(bytes(after))`) correctly captures the half of Amendment 2's requirement `bytes()` cannot see (one state at a time).

## 4. Digest continuity `:194` + Amendments 1/F2 (rule 4) — MET WITH EVIDENCE

`commitWinningPromise` (`src/core/talentMarket.ts:1237-1249`) confirmed to write `contractId` and `feasibilityReceipt` together, atomically:
```
return { ...state, promises: state.promises.map((p) => (p.promiseId === id
    ? { ...p, contractId: row.contractId, feasibilityReceipt } : p)) }
```
Grep of `contractId:` across `talentMarket.ts`/`promises.ts` confirms this is the *only* code path that flips an existing promise's `contractId` from `null` to non-null — `promises.ts:756` only sets it `null` at creation, `:1394` only copies an existing value forward for a minted substitute. Combined with the handback's own probe showing all twelve subjects hold `contractId: null` pre-tick, this makes `contractId` a genuinely independent, non-circular signal for the bound/unbound split, as claimed.

`preReceipts` is captured from `original` strictly before `tick()` runs (patch places it directly after `const initial = bytes(original)...` and before `const direct = tick(original, ...)`), matching Amendment 1's "derived from the pre-tick state" requirement. Revision 2 (1332-C2) correctly closes 1332-F2's gap: the unbound path now `toEqual`s the whole `preReceipts.get(id)!` object (not just `{week, rulesVersion}`), and `rulesVersion: 4` is asserted unconditionally on both paths.

Cross-checked the pre-declared attribution guard against `1332-measure/runs/digest-facts-58c89932.log` directly: `promise-3` → `{eventId:'talent-market-event-143', kind:'declined', studioId:null, reasons:['this person could not separate 2 equally ranked proposals.']}`, pre-tick receipt `week:196`; `promise-26` → `{eventId:'talent-market-event-155', kind:'settled', studioId:'studio-de11f27b-r03', reasons:['their studio standing ranked higher','they are the current employer']}`, pre-tick receipt `week:196` — both match the patch's literals exactly, and match 1332-A Attribution 3 verbatim.

The leaf's original requirements are intact and untouched: `recordedAffectedIds()` still returns twelve ids (line 186, unchanged); `directReceipts`/`resumedReceipts` full equality (lines 198-200, unchanged) still runs, and since it spans all twelve ids regardless of branch taken, it transitively re-verifies `resumed`'s own bound/unbound split matches `direct`'s even though the new guard computes `unboundIds` only from `direct`; whole-world `bytes()` equality (lines 201-203, `bytes = exportSave(makeSave(state))`, a completely separate, unstripped function from `p14b5-relationships.test.ts`'s `bytes()`) is unchanged. If the settlement law moves again, both the `toEqual(preReceipts...)` derivation and the hard-pinned `unboundIds`/Attribution-3-facts guard would fail loudly — the leaf does not silently pass.

## 5. Dry run (`1332-X`) vs 1330 — PARTIAL (documentation defect, not a patch defect)

`1332-X-fullcore-rows.json`'s own `byStatus` block reports `"RETAINED-CHANGED": 10`, but `1332-X-retained-r3-dry-run.md`'s prose says *"the six C17 ENOENT rows and the benign exporter row... No other primary changed"* — seven, not ten. I read the raw rows directly: the three omitted rows are `tests/p14c3-canonical-rival-history.test.ts` L1/L2 (marker 55, `cluster_1302: "C3-acceptedEvidence-helper-literal"`) and `tests/p14c3-save-v38.test.ts` (marker 56, `cluster_1302: "C20-migration-purity-new-root"`).

This is very likely harmless: this exact ten-row set (L1/L2 + `p14c3-save-v38` + the six `r3n1-*` ENOENT rows + `world-first-scenery-load-in-provenance`) is the *same* set the precedent review `1327-D-retained-r2-review.md:27` independently counted and confirmed at an earlier HEAD (`43d61806`), already attributed to named pre-existing clusters (C3/C20/C17) unrelated to `firstTakeSubjects`/`hollywood.termination`. So the *substance* of 1332-X's conclusion (R3 introduces no new breakage beyond the precedented scratch-supervisor artifact) is still well-supported. But the **document's own prose does not match its own underlying data**, and "3 gone, 7 new, 7 changed primaries" is not what `1332-X-fullcore-rows.json` actually shows (10 RETAINED-CHANGED). Per the task's own instruction to "re-check the actual selector, measurement units and fixture before trusting counts," this must be corrected before 1332-X is relied upon as an accurate record.

The 7 "new" `bridge-supervisor.test.ts` rows (`tests/bridge-p14b2-checkpoint.test.ts`... no — `bridge-supervisor.test.ts`, markers 19-25, all "Fake Unity did not report started/health/helper") are confirmed via direct row read to be exactly the recurring scratch-environment artifact already named and accepted in `1324-D-retained-r1-review.md:45` and `1327-D:27`; this part of 1332-X's claim is accurate.

## 6. Comment accuracy — mostly MET, one minor citation imprecision (non-blocking)

- `p14b5-relationships.test.ts`'s new import comment cites `validateFirstTakeSubjects (src/core/firstTakeSubjects.ts:36-89)` — exact match to the real function span.
- `promises.ts:1633` citation ("the exact function ... invokes at saveVersion === 40") — exact match: `if (saveVersion === 40) validateFirstTakeSubjects(state)`.
- `talentMarket.ts:1237-1248` citation for `commitWinningPromise` — accurate (function spans 1237-1249; 1248 is the last line of the returned object, 1249 only the closing brace).
- `convertV40ToV41, src/core/save.ts:10526-10533` — exact match (doc comment through closing brace).
- `convertV39ToV40, src/core/save.ts:10490-10497` (in the *checkpoint test's own added comment*, `bridge-p14b2-checkpoint.test.ts` new lines 9-16) — imprecise: the real function starts at `:10493`, not `:10490` (10490-10492 is blank space plus the tail of the *prior* function `validateSaveV40`). The classification JSON's own "cause" field for this same edit correctly cites `:10493-10497`, so the in-code comment and the classification disagree with each other by 3 lines. The quoted code snippet itself is byte-exact either way; this is a citation-precision slip, not a logic error.

## Required changes

1. **Correct `1332-X-retained-r3-dry-run.md`'s summary** to state 10 RETAINED-CHANGED rows (not 7), and explicitly name the 3 omitted rows (`p14c3-canonical-rival-history.test.ts` L1/L2, `p14c3-save-v38.test.ts`), confirming — as 1327-D already did for the identical set — that they are pre-existing, cluster-attributed (`C3-acceptedEvidence-helper-literal`, `C20-migration-purity-new-root`) rows unrelated to this patch, before 1332-E application proceeds on the strength of this record.
2. **Fix the checkpoint test's added comment** (`tests/bridge-p14b2-checkpoint.test.ts`, new lines ~9-11 of the patch) to cite `src/core/save.ts:10493-10497` for `convertV39ToV40`, matching the classification JSON and the real function span, instead of `:10490-10497`.

## Non-blocking notes

- `sourceHollywood = source.state.hollywood as {...}` in the checkpoint test lacks the null guard used elsewhere in this same patch (`p14b5-relationships.test.ts`'s `strippedHollywood`); safe only because this fixture is empirically non-null. Not required to fix (single fixed fixture), but an inconsistency worth the author's awareness.
- The bound-path receipt check (`toMatchObject({week:208, rulesVersion:4})`) still leaves `classification`/`bottleneck` unasserted, even though the archived digest-facts log shows these are constant (`REASONABLY_ACHIEVABLE`/`null`) across all ten bound subjects and could in principle be asserted too. This is explicitly out of 1332-F/F2's adopted scope (only the *unbound* path was the identified defect) and not a new gap introduced by this revision — flagged only as a possible future tightening, not a defect of this repair.

## Return to Fable

**DONE.** Independent review 1332-D, read-only (Read/Glob/Grep only), no changes made. Covered: scope/rules 1&5, checkpoint rule 2, seam-digest rule 3 + Amendment 2 (including validator-branch coverage analysis and confirmation that `bytes()` is the only live-pipeline content check past V40), digest-continuity rule 4 + Amendments 1/F2 (including a `contractId`-assignment-path grep to confirm the split's soundness), the dry run's numeric claim against its own raw data, and comment/citation accuracy. Checks actually run: none (no shell); all verification is direct file reads of current source (`src/core/save.ts`, `src/core/firstTakeSubjects.ts`, `src/core/talentMarket.ts`, `src/core/promises.ts`), the three current test files, the patch/classification JSON, the handbacks, and the archived `1332-measure/runs/digest-facts-58c89932.log` and `1332-X-fullcore-rows.json`. Remaining defects: the two required changes above (both documentation/citation fixes, not test-logic changes). Evidence limits: no test/type-check execution performed myself; the recorded application and broad-core/UI gates (1332-E) remain the parent's responsibility. Next concrete action: parent corrects `1332-X`'s RETAINED-CHANGED count/explanation and the one citation line, then proceeds to application (1332-E) — the staged test patch itself needs no further edits.

**Paths referenced:** `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/{1332-A-unresolved-attribution-and-repair-r3-plan.md,1332-B-r3-plan-review.md,1332-F-parent-r3-plan-adoption.md,1332-F2-parent-r3-handback-adoption.md,1332-C-retained-r3-handback.md,1332-C2-retained-r3-revision.md,1332-X-retained-r3-dry-run.md,1332-X-fullcore-rows.json,1332-X-fullcore-extract.txt,1332-measure/runs/digest-facts-58c89932.log,1332-stage/1332-retained-r3-r2.patch,1332-stage/1332-retained-r3-r2-classification.json,1327-D-retained-r2-review.md,1324-D-retained-r1-review.md}`; `/Users/zacheryspector/The-Movies-headless-program/tests/{bridge-p14b2-checkpoint.test.ts,p14b5-relationships.test.ts,p14c3-promise-digest-continuity.test.ts}`; `/Users/zacheryspector/The-Movies-headless-program/src/core/{save.ts:10480-10538,firstTakeSubjects.ts,talentMarket.ts:1220-1260,promises.ts:130-165,1553-1650}`.
