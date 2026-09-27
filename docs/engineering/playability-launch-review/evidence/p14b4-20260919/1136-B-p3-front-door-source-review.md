# 1136-B — Initial P3 production source review

**REFINE one old-builder guard; otherwise KEEP the bounded initial implementation scope.** This is a read-only source and closed-record review, not a behavioral qualification. No compiler, test, simulation, project import, source edit or index action was performed by this reviewer. The parent owns the five production paths and subsequent corrections.

## Frozen candidate and actual compiler

The recorded candidate is HEAD `95a9abc2c5c5ffc53dc1639da19da510304ac2da` with the five-file production patch `1136-p3-front-door-root-types.patch`, 79,366 bytes / `c9c7af77c4dbead9f347ff6cccc258fe4479e5456b20b2f6ece9d4d6549d724e`. Its scope is `src/core/{types,promises,save,index,talentMarket}.ts`.

1136 actually ran `node_modules/.bin/tsc --noEmit -p tsconfig.json`, 2026-09-27 11:41:32.246–11:42:05.072 UTC, 32.826 seconds, child 2. Pre/post HEAD and patch identities match; `fixedSource:true`, no untracked consumed source, signal or recorder error. All fourteen printed TS2345/TS2322/TS2339 diagnostics concern older test/helper boundaries or the now-wider predicate type. No production diagnostic was printed. This is a failed compiler gate, not a production type PASS; the separately owned exact-path maintenance must be reviewed and a later gate recorded.

| Record | Bytes | SHA256 |
| --- | ---: | --- |
| `1136-p3-front-door-root-types.json` | 634 | `7076b585cb3ba897fb7d52524e9f94c687253f03c4341bdcbce03557fbf599ea` |
| `1136-p3-front-door-root-types.txt` | 3,778 | `106e04252975cda0611f5151babb9a772de3ce3bebedb55dfc4fc12abd883472` |

## Required correction

At the reviewed `save.ts:6147`, `assertFrozenBuilderRetainsHollywood` invokes whole Save39 proof only when `careerLifecycle` has `transitionBoundaryWeek`. The preceding implementation used the true return of `assertProfessionHistoryDowngrade`, whose detection covers **any** of `TRANSITION_ROOT_FIELDS` (all six C3 fields).

Consequently, removing only `transitionBoundaryWeek` from otherwise existing/empty current scaffolding can bypass whole-current admission: the later downgrade helper detects the remaining C3 fields and returns true, but that return is now ignored. With Hollywood null, an older builder can then reach its projection before the missing current authority is proved. This is a source-established loss of the existing malformed-current guard; no constructed state was executed here.

Retain the intended order—whole39 proof, explicit retained Director-predicate loss refusal, then C3 and other historical loss guards—but trigger whole39 on the established **any C3 field** detection. This does not permit new tagged authority in old readers or require reordering historical defaults. The dispatch error at `save.ts:5409` also still says versions 1 through 38; update that factual text to 39. These findings were sent to the parent before another compiler/run.

## Reviewed initial behavior

- `ProfessionalPromiseV39` is an additive explicit `directorCount` member; frozen V29/V30/V32 and V38 state types retain their old meanings. Fresh classless P3 quote/attachment refusal is explicit. New Director roots record the actual revision-6 attachment receipt; material digests carry the new tag.
- The revision selector first excludes terminal, abandoned, own-ID and nonoverlapping rows, then takes the beneficiary-or-issuer union and deduplicates by promise ID. The selected rows feed the revision decision, positive remaining-count subtraction and full reservation digest. A relevant same-issuer/different-person Director commitment is visible. The old scalar branch retains its original tuple/arithmetic; revision 5 is not reused.
- The new domain uses the beneficiary's directing profile and actual pre-first-take Director seat. Existing current-global and explicitly requested profession retirement facts both remain represented. Managed stock is excluded only in selected revision 6, including scoped P1/P2; old revision 4 retains its historical stock behavior. No skill threshold, primary-role gate, timing constant or preference strategy was added.
- Private validation carries the invocation-local `directingPromises` policy from whole39 through V37, V36, V35, V34, V33, V32, V31 and V30. Every public numbered historical reader keeps the false default. V30 selects the actual V39 promise validator before handing the stripped shared lower state to the unchanged V28 chain. V32 successor-link validation still occurs before removing that one later field.
- Whole39 validates provenance/profession authority and the complete delegated save, without stripping a Director tag into a cast predicate. Director root/receipt revision, exact predicate fields/family, contract lower/upper window, distinct qualifying Director evidence, progress/evidence agreement and terminal evidence joins are checked in the current policy. The frozen cast/count rules remain separate. This review does not claim new WAIVED-domain validation is completed before its later D12 evidence.
- Forward38→39 proves frozen38 and detaches without rewriting stored state. Reverse39→38 proves whole39, refuses every retained explicit Director predicate, then passes the unchanged detached payload through public strict38. Scalar revision6 alone is neither erased nor blanket-refused. All 35 explicit old target migrations V4–V38 route a39 input through that guarded reverse boundary. Current old builders require the correction above to preserve their prior malformed-scaffolding coverage.
- `promiseCastSlots` returns no cast slot for the new domain and `promisedCastMasks` excludes it. The waiver entry path explicitly refuses a new Director original or substitute, preventing a newly available quote from minting a cast-shaped substitute before D12. `talentMarket` changes only predicate typing and null seat-class disclosure for this domain; no preference or rival-authoring change is present.

## Deliberate limits and prior RED cross-check

`qualifyingTakes` still implements the old cast qualification, so an explicit Director predicate currently produces no qualifying cast evidence. Partial progress/evidence updates, Director cancellation/retirement outcomes, preference, rival work, same-domain waiver and Bridge/projection54 are deliberately not represented as finished. Their absence does not invalidate the matching first front-door/migration step; later reached failures must determine the next bounded implementation.

The sibling's frozen `1135-A-p3-first-slice-red-attribution.md` (9,902 bytes / `c1737a16c7bc52e33c999ecd89c369117c16b7591c1a952700c9e90e44f7b5c3`) agrees with this reviewer's prior 1135-B independent attribution. Its complete diagnostics file is 16,955 bytes / `af3add963f8d8cfbf49ab01f8fdc110ba869794ca0115d622084c6fdffb96ade`. Eight failures were five primary groups after 45 actual calls, including four declarations sharing the cached tagged-quote failure. D04's printed diff omits the bottleneck; it is not additional printed evidence. Bound52, films and the later Save39 negative families remain unreached at that RED.

The single full revision-4 marker remains 851 bytes / `182cf54d3a2fbb8bb2fc55cf74e97e220923d634ef454b816d3770d12dcb055e`. Subsequent actual output must be compared literally, including full drafts, receipts and RNG; source inspection is not a substitute for that preservation observation. No passing behavioral result is asserted here.

## Correction recheck — final source disposition

**KEEP the corrected initial five-file production scope for its next recorded compiler/behavioral observation.** The original finding and failed1136 gate above remain preserved.

The parent imported the existing `TRANSITION_ROOT_FIELDS` and triggers whole39 proof on any non-null object carrying any of those six fields, including a malformed array carrier. This restores the previous detection extent while keeping whole39 → explicit P3-loss → C3-loss ordering. The unknown-version text now correctly says through39. In-memory string reversal of exactly these three edits reconstructs the previously reviewed save file byte-for-byte: 468,448 bytes / `1e04875b6fa473fe588f243f198b747319aa65a65721fd4f6d8219ec1a64314e`. No code was evaluated.

Corrected `src/core/save.ts`: 468,540 bytes / `296fd66ffdb8f2905548ecff988f5f453fe060da8e1c729a07a3f99e061b27b7`. The five-path `git diff --no-ext-diff --binary HEAD -- ...` is 80,113 bytes / `14bb3a1eebe518d4efa4b8d846407f1b5bf7f3f0a9a48e46ff1036c0c4868fd5`. All other production paths retain the reviewed candidate. This source KEEP does not claim the earlier failed compiler or any downstream test has passed. The fourteen-diagnostic maintenance is a separate test-source appendix/review boundary when frozen.
