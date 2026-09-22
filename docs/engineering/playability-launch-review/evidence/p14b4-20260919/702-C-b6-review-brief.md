# 702-C — parent brief: the P14B.6 read-model checkpoint review (contract-auditor)

Authority: the Owner's activated ruling 4 (record 683) and the P14B.6 expansion (record 687). You are
READ-ONLY. One bounded pass. Do not re-audit P14B.5, P14B.5-T or their evidence. Hand the review back
as text; the parent writes the file.

## The candidate

Four bisectable writer commits on `43817117`, each tree byte-equal to its cumulative patch:
`6379e2f9` S1 schema · `78eadd07` S2 projector · `0e0c8a75` S3 casting · `ad49031f` S4 wire.
Then `d749b3ea` (the RED and records) and `68fe5985` (the values-only sweep).
New production file: `bridge/relationships.ts`. Changed: `bridge/schema/bridge-schema.ts`,
`bridge/people.ts`, `bridge/casting.ts`, `bridge/runtime-checkpoint.ts`, and the three generator
artifacts. `src/` IS UNTOUCHED — verify that.

## The questions, in order

**Q1 — Does the DISCLOSURE rule actually hold?** This is the slice's whole risk. Records 679/682
measured that nearly every relationship edge on the standard seeds is RIVAL-INTERNAL, so a leak here
publishes the entire rival industry graph. The rule: a tie publishes only when its counterpart is
independently visible to the player, on the PLAYER's roster at W under the landed predicate
`terms.startWeek < W && (endedWeek === null || W < endedWeek)`, subject excluded. Read
`bridge/relationships.ts` and every call site. Then try to BREAK it: find any path — profile of a
rival person, roster row, casting quote, market page, industry page, any nested DTO — where a
rival-internal pair, or a counterpart the player cannot otherwise see, reaches the wire. Check both
predicate boundaries (a row committed AT W and a row closed AT W are both OFF). If you find a leak,
this checkpoint is NOT QUALIFIED.

**Q2 — Is the leak law intact and unamended?** `tests/bridge-p14b5-relationships.test.ts` probes
`'"closeness":', '"edgeId":', 'relationship-edge-', '"recent":', '"relationships":',
'"lastEventWeek":', '"peakTier":'` against a stringified DTO. Confirm the probe list is byte-identical
to its pre-B.6 form (the parent found only its line number moved, 408 → 411). Then check the NEW DTOs
for the same class of leak, including the generated C# and the emitted schema JSON.

**Q3 — Is the 694-C forward constraint honoured?** A resumed campaign's `recent` can hold BOTH `-4`
and `-5` `sharedFailure` rows on one edge. Nothing may render a delta as a magnitude anywhere, or the
same event class shows two different numbers. Check every string the block and the casting rows can
emit, including `pairChemistry`'s reason copy. Any digit in any driver string is a DEFECT.

**Q4 — Did B.6 stay inside its scope?** Ruling 4 forbids new relationship drivers, policy and tuning,
and says B.6 **must not invent a quality modifier**. Confirm: no new driver kind, constant, policy,
refusal, save state or RNG; `LIVE_SAVE_VERSION` still 31; `src/core/relationships.ts` byte-unchanged;
no chemistry value reaches any production-result, forecast, quote or cost path. A chemistry READOUT is
not evidence any result law consumes chemistry — check that nothing quietly wired one.

**Q5 — Are the four parent decisions correctly landed?** D1 the profile DTO key is `collaborators`,
not `relationships` (the parent's own first brief was wrong here and the RED caught it). D2 chemistry
and the warning hang on the casting QUOTE snapshot only. D3 no `scope` field. D4 a rootless state
emits the counts-only form without calling `pairChemistry` and without weakening
`requireRelationshipsRoot`. The writer answered D4 by arguing no live path can deliver a rootless
state — verify that argument independently (both `GameState` producers, every load route, and the one
unmigrated `importSave`).

**Q6 — Is the sweep values-only?** 28 test files, +122/−77. Check that no assertion was weakened,
retargeted, deleted or turned from an exact-set equality into a size or `toContain` check; that the
prior-id rosters kept `toEqual` on sorted key lists and grew by exactly one id in sorted position;
and that the two non-version regressions (R1 the union envelope, R2 the F10/F11 identities) were
resolved as recorded rather than bent. For R2 specifically: the pin's discipline is that the value is
computed once by the generator, never by the test against itself. The parent re-derived it through
`700-gen-hash-probe.ts` under record-check (`700-gen-hash.txt`); confirm the test's new literal equals
that log's value and that `F12_P05_PRODUCTION_SENTINEL` was NOT touched.

**Q7 — Is the RED honest, and is what it cannot establish recorded?** Families, staged inputs, and in
particular: the casting warning's Strained edge is STAGED, and the natural route is untested because
no fixture in this repository releases a player picture. Confirm that limitation is stated plainly and
not glossed.

**Q8 — Overclaim sweep.** Anything claiming native, visual, Unity, playtested, Owner-accepted, a
completed relationship feature, a balance result, or that a chemistry readout proves a chemistry
effect? Quote it.

## Verdict

QUALIFIED / QUALIFIED WITH RECORD-ONLY ITEMS / NOT QUALIFIED, then DEMONSTRATED defects (file, line,
the exact fact that contradicts the claim), then REFINE, then what you could not check and why.
Under 130 lines. The parent's full core run (`701-b6-full-core`) is executing and will not be
available to you; say so under what you could not check.
