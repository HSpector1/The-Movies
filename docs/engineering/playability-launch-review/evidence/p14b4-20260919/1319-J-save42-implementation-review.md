# 1319-J: independent implementation review of the Save42 casting-competition production

Independent contract-auditor review (read-only tools: Read, Glob, Grep) of production commit 1b675f75 at HEAD
c6b79ad1. The review text below is persisted verbatim in substance; the parent closed its one untraced item.

Parent note on "What I could not verify", item 1: the queue path is traced. `admitQueuedIntents`
(`src/core/queueAdmission.ts:53-95`) commits each entry through `commitQueuedIntent` (`src/core/actions.ts:1759`),
whose `greenlightScriptProject` branch (`:1798-1807`) calls `applyGreenlightScriptProject(state, …, week, false,
events)`; with `allowQueue` false that reaches `admitOrQueue` → `applyGreenlightScriptProjectNow` (`:2386`) →
`applyGreenlight` (`:2406`), the seam. No parallel admission path exists.

**Verdict: KEEP. Required changes: none.**

## Summary of checks

1. Minting law — MET WITH EVIDENCE. Seam inside `applyGreenlight` after `breakPromisesOnGreenlight`
   (`actions.ts:583-590`); studio from `settled.hollywood?.playerStudioId`, skipped when undefined (precedent
   `applyCancel`, `:621-624`); complete session required (`relationships.ts:365`); per-slot pairs canonical and
   deduplicated before any write (`:369-381`); one driver per pair per production with `ref = production.id`
   (`:383-385`); `RELATIONSHIP_COMPETITION_DELTA = 3` through `driverGain` (`:92`, `:168-171`); new edge
   `sharedProductions 0`, `sharedCompetitions 1` (`:209-222`); existing edge increments and adds the accelerator
   `min(sharedCompetitions - 1, RELATIONSHIP_COMPETITION_REPEAT_CAP)` (`:176-186`, `:391-393`); re-greenlight after
   cancel mints again (production ids never reused); rivals never reach `applyGreenlight` (two call sites, both on
   the player action surface). The studio check inside `recordCastingCompetition` is dead under the single caller;
   harmless defensive style.
2. Copy and dormancy — MET WITH EVIDENCE. `competed for the same role`, `competed again`; dormancy reads "they have
   never worked together" only when `sharedProductions === 0`.
3. Expiry note — MET WITH EVIDENCE. `bridge/finance-upcoming.ts:28-31` restates `rosterAt`
   (`bridge/relationships.ts:105-112`, unexported) and extends it for a future week with the committed-term condition
   `week < (row.endedWeek ?? row.terms.endWeekExclusive)`, the completion 1315-D check 4 ruled lawful; strict
   `currentTier(edge, week) === 'Inseparable'` gate (`:33`); employment order; 1313-A wording; early empty return when
   there is no player studio or relationships root (`:26`).
4. Save42 — MET WITH EVIDENCE. `SaveFileV42`, `LiveSaveFile`, dispatcher "1 through 42 only"; `validateSaveV42`
   validates the era-42 root, then the V41 chain on the era-31 projection; `convertV41ToV42` adds
   `sharedCompetitions: 0` only; `convertV42ToV41` throws "cannot downgrade or discard a casting competition" for any
   nonzero counter or new kind, else projects losslessly; all 38 frozen `migrateToVk` arms (V4-V41) route 42 through
   `convertV42ToV41` (40 `saveVersion === 42` sites = 38 + dispatcher + `migrateToV42`); `validateRelationshipsRoot`
   has two call sites (era 31 default, era 42), so frozen readers keep five kinds; `validatedLiveProfessionContext`
   projects to era 31. The `as unknown as RelationshipEdge[]` cast in the downgrade is the file's established idiom
   for frozen downgrades. No live path leaves `sharedCompetitions` missing.
5. Determinism and purity — MET WITH EVIDENCE. No RNG or clock; named constants, not inlined.
6. Coverage — every law item has an executable leaf except the `state.hollywood === null` clause (`it.skip`,
   `tests/p14b9-casting-competition.test.ts:494`), disclosed by 1315-F and confirmed correct by inspection
   (`actions.ts:588-590`). No item lacks both.

Evidence cross-checked: 1318-R (21/13/1 on unchanged production), 1319-R and 1319-casting-green (34 passed,
1 skipped), 1319b (`--check` exit 0), 1319-T (22 errors, all test files).

Could not verify (read-only role): the queue path byte by byte (closed by the parent note above); the `.gz`
payloads (out of scope); no native or UI claim is made; no re-execution.
