# Save46 recovery B+C implementation map

Prepared 2026-10-04 against published Save45 source `2eaa697effc38538c37da28b486786ce267a2284`. Authority: adopted 1363-A with 1363-F, 1363-A2, and 1367-H. This is implementation preparation for the parent sole production writer, not new law, implementation approval or runtime evidence. Part A consumes no save step; B+C together consume46. C RED handback remains explicitly incomplete.

## Existing insertion seams

| Owner | Current location and minimal change |
|---|---|
| Live state types | `src/core/types.ts:2326,2608`: introduce GameStateV46 and move the live alias from45. Preserve historical envelope versions and runtime exactness; do not turn older readers into permissive current readers merely because shared TypeScript aliases overlap. |
| Hollywood shape | `hollywoodTypes.ts:57-71,103-139`: add costCutting to the live rival shape, exactly one facilityDemolitionRefund money kind, and the adopted facilityDisposed receipt fields. Keep original receipts/plans and global event IDs. No second archive or facility lifecycle. |
| Initializers | `hollywood.ts:24,35-52,189-206`: extend current money-kind/new-period construction and fresh/scheduled rival initialization with zero refund and null since. Old historical initialization paths must produce their own era's shape or be explicitly converted, not silently acquire new facts. |
| Envelope/writer | `save.ts:636-640,688,5455-5457,6586-6594,10226`: add SaveFileV46 to union/dispatch; move LiveSaveFile, LIVE_SAVE_VERSION, makeSave and migrateToLive. Preserve validate-before-detach. Unknown-version sentinel becomes47; update only intended live pins after measurement. |
| Validator wrapper | `save.ts:10962-10999`: add public46 and private era-aware45 descent. The public45 entry remains explicitly old era. V46 checks its exact new authority while retaining all P15 root validation and the one existing allocator check. Recovery adds no P15 sequenced root, so do not add corporateCondition or alter allocator scope here. |
| Hollywood validator | `hollywoodValidation.ts:72-77,228,245-323,373-391` and receipt switch: exact business keys and money-kind/receipt sets must depend on explicit era arguments. Add B restrictions, exact new positive-money whitelist and receipt/period/body reconciliation. Preserve every older sign law, four-core configuration, research provenance and chronology. |
| Policy/mutation | `hollywoodTick.ts:94-198,201-336,360-370,434-436`: observe B entry only at real decisions; no new commitment while already cutting; R3 restrictions and recomputed charges remain. Insert C after decision and before that week's facility opex, without a second staffing/decision pass. |
| Plant producers | `rivalResearch.ts:121-177,200-213,268-317`: retain real paid plan/receipt authority and two historical body-plan limit. Shared eligibility and atomic disposal use existing roots; completion skips lawful tombstones rather than rematerializing bodies. |
| Market/technology | `talentMarket.ts:485-491,1389-1422`; `technologyRival.ts:19-79`; `rivalResearch.ts:113-123,213-262`: suppress new commitments and withdraw proposals before settlement, including retirement-extension cases. Active work and lawful completion of prior commitments continue. Compare adoption commitment weeks, not later operational dates. |

Only research-laboratory bodies are eligible. Use existing `facilityDemolitionRefund(blueprintById('research-laboratory'))`; current450,000 is source arithmetic, not a new cash grant. Installed instruments, retained research references and real dependencies remain protected. Body plan status stays started after completion/disposal.

## Explicit era descent: do not lose either flag

Carry two independently named controls, `rivalCostCutting` and `rivalFacilityDisposal`, through private validators. A small trailing typed era object or two trailing default-false arguments is an implementation choice; every old public wrapper must supply/default false. Neither flag may be inferred from keys or receipts in an untrusted envelope.

The existing shelving flag identifies the complete path to extend. At current offsets:

1. Public46 -> private45 (`10962`) -> private44 (`10822`) -> private43 (`10772`) -> `validateSaveV42Era` (`10728`). Add private wrappers where current public calls otherwise discard context; preserve public old-era entry behavior.
2. `proveProfessionSave` (`10528`) -> `validateSaveV37WithProfession` (`10468`) -> `validateSaveV36WithPolicy` (`10382`) -> V35 (`10157`) -> V34 (`9948`) -> V33 (`9653`) -> V32 (`9428`) -> V31 (`9325`) -> V30 (`9247`).
3. V30 strips V29 roots and enters `validateSaveV28WithWriting` (`9039`) -> `validateSaveV27WithLaw` (`8939`) -> V26 (`8776`) -> V25 (`8563`) -> V24 (`8384`) -> `validateSaveV19WithPolicy` (`8057`) -> `validateHollywood` (`8084-8099`). Keep the existing termination, retirement-writing, profession, directing-promise and shelving controls unchanged alongside recovery flags.

Review both declaration and every call edge. A flag present at public46 but absent at any intermediate edge produces either a swallowed live-proof refusal or an impermissibly relaxed old reader. Test old public45/44/43/41 and the earlier explicit boundaries independently; do not rely only on the live round trip.

### Direct profession proof is a separate entry

`validatedLiveProfessionContext` (`save.ts:10550-10555`) currently builds an internal V41 view by stripping P15 roots and reducing relationships while enabling shelving. Extend that internal view to remove only each business's costCutting key. Retain real account cash, every refund movement, facilityDisposed receipts, retained body plans and the absent body. Call `proveProfessionSave` with `rivalCostCutting=false`, `rivalFacilityDisposal=true`, and carry that exact pair down to Hollywood. This is a trusted internal validation context, not public acceptance of Save46 fields as a V41 envelope.

The disposal validator must work when the cutting key is intentionally absent in that proof view. Eligibility at mutation time requires cutting; persisted disposal history cannot require current since to remain nonnull forever, since a lawful subsequent greenlight or future P15B principal clears it. Validate retained provenance, exact refund, chronology and finance without inventing an unrecorded past episode. Actual public46 additionally validates the real current cutting shape and constraints.

Call the proof directly on admitted cutting states both with and without disposal. Assert retained authority and input immutability; tick's caught failure cannot qualify S6. Review the complete Hollywood descent, not just the stripping helper.

## Accounting and historical authority

- Add null since and zero movement to all migrated historical finance periods, not just the current one. Do not alter opening/closing/cash or create receipts. New ordinary periods include the key at zero.
- `facilityDisposed` uses the existing Hollywood receipt envelope/allocator and exact `(studioId, facilityId)` plus body-plan uniqueness. It retains commitment/operational receipts and paid plan/quote. A standing body and tombstone cannot coexist; neither may an operational body vanish without its lawful tombstone.
- Only the new disposal era permits positive facilityDemolitionRefund. Reconcile the sum of exact eligible-body refunds with the correct period movement. Original researchCapacity stays spent; instruments are not included in a body refund. No generalized positive movement or finance reset.
- Laboratory opex is `max(0,min(T,D)-O)` weeks for a disposed body, versus `max(0,T-O)` for a held body. Core and retained-instrument terms remain unchanged. At D=O, zero lab weeks are due; test year-boundary period placement and original histories.
- `completeRivalPlans` currently treats absent body as unfinished materialization. Skip only a matching validated disposal tombstone; do not delete the started plan, mint a second operational receipt, free its historical ordinal or authorize a replacement lab.

## Migration and downgrade order

1. Validate the genuine45 input with the unchanged public45 reader before cloning. Add only null cutting and zero refund keys; validate46 afterward. `migrateToV46` and live migration are idempotent on46. No retrospective entry/disposal/receipt/refund.
2. Validate a46 input before downward projection. Strip only if every since is null, all refund movements zero and no disposal receipt exists. Otherwise name the discarded authority. Do not recreate a body or erase money/history. Exact ordering/messages are implementation contracts still requiring the missing independent S5 cases; do not let a since refusal masquerade as disposal coverage.
3. Add46 handling to every older `migrateToVn` dispatch using the one governed46->45 conversion before the existing chain. Do not merely add migrateToV45 and leave lower entry points to reject or relabel46 inconsistently.
4. Extend frozen-builder refusal/projection at `assertFrozenBuilderRetainsHollywood` (`save.ts:6193`) and the relevant retained-Hollywood checks. The current function handles P15 first and can otherwise pass recovery-bearing Hollywood into an older proof. Null/zero recovery fields may strip through a validated, shared lossless law; real authority must refuse by name. Preserve existing P15 refusal/sentinel behavior once recovery is empty. Do not duplicate a permissive strip that bypasses the real downgrade guard.
5. Keep all public older envelope validators strict about new business keys, movement and receipt. Inspect frozen builder/type aliases and current callers during fallout rather than sweeping old-world behavior to live46 indiscriminately.

## Lawful V27 staging compatibility

The existing public `admitRivalPlans` is deliberately used on validated V27-era state in `tests/p13b-s8-save-v27.test.ts:218-222` and the reviewed 1367 own-era addition under1358-F10/F11. It cannot unconditionally dereference costCutting. Preserve that historical boundary's exact old behavior through an explicit compatible producer context/wrapper, while `admitRivalPlansInWeek` and actual live46 admission always enforce cutting. If an optional context is chosen, make the default and every live caller explicit; absence of a recovery field must not let malformed live46 bypass validation. No missing-field failure re-pin is authorized.

This compatibility applies to the public staged admission seam, not to accepting a new-era receipt in a public V27 reader. The current C natural/full-state controls always require actual46 admission. Keep the new own-era V27 test as an independent old-source-shape regression check.

## Minimal ordered implementation and remaining REDs

1. Adopt reviewed B/C interfaces and diagnostic ordering; complete critical missing save REDs. Freeze predecessor identity and preserve a genuine45 capture before46 is enabled.
2. Add46 types/initializers, era-aware owner validation and the entire private proof chain. Implement null/zero migration and guarded downgrade consistently across entry points. Keep behavior unexposed until the coherent slice is complete.
3. Integrate B entry, restrictions and sequential R3 release law with valid controls. Preserve old public producer staging. Implement C shared eligibility, atomic money/receipt/body mutation, completion tombstones and opex boundaries together.
4. Run intended RED/GREEN only after the parent authorizes execution, then independent implementation review, fallout/capture attribution, type/generator/broad gates and required1363-V/G-P/G-L sequence. Save45 G-L is a precondition of the integrated comparison; no natural witness is assumed.

Missing evidence/REDs remain material: genuine45 migration capture, up-migration idempotence and exact historical preservation, separately attributable since/refund/tombstone downgrade cases, old-public-reader rejection and mixed internal-era proof flags, every lower migration/frozen-builder path, and explicit V27 producer compatibility. Invalid refund-without-receipt mutants do not supply a valid standalone financial downgrade witness.

C handback additionally retains C3 valid dependency/adoption and operational-instrument controls, C4 retained-status/released-seat/reservation variants, C5 retained-instrument/multi-period cases, C6 unrelated pending-plan continuation, remaining C7 authority/period mutants, C8 valid ordering route, and C9 real retained-team restart/unfunded staffing behavior. Two naturally bare labs are not established: the second admission requires first-lab occupied history that protects that first body indefinitely. Preserve this limit rather than erase history. B's full market/research suppression controls and inherited mixed-sequence correction also need valid measured premises. Full46 admission before any exact guard assertion remains mandatory.

No runtime, test/typecheck, fixture payload access or scan, source edit, git/index mutation or nested agent was used. Only this authorized scratch map was written.
