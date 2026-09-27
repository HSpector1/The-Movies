# 1105-A — B5 forensic stop: exact validator-wrapper amendment

Docs-only disposition/proposal. Read the preserved1068/1069 records, mirrored1100 result and unchanged current validator sources; no project import, compiler, gameplay, copy, rerun, test/source modification or pin update. All original1100 source, artifacts and temporary snapshot remain frozen. Parent's C endurance lane takes precedence.

## Observed failure and preserved limits

1068 closed exit1/fixedSource:true on `1f4b8429fef335e1fb25bede0b5d2c6014901ba8`, empty consumed-source diff, 2026-09-27 04:28:56.270–04:29:05.832Z. It completed exactly212 default `tick(state)` calls and stopped during whole Save38 admission at212. It did **not** continue an invalid world or reach416. The original producer remains34,595 bytes/SHA `c5025008944e1f8ad00b679f1a2db45d466fc3f371e3f1370971db94521ca7b9`.

The mirrored result `1100-c3-b5-forensic-result.json` is1,148,663 bytes/SHA `388b1450b3047884a6ddd85c79b646d3e62805c6e186f8b1c91ed316a30ffbb7`. Its `counterfactualStatus: STOPPED`, `attributionStatus: INCOMPLETE`, `firstRejectedStateObserved: null` and212 admission `forensicAllowed: false` accurately show that the diagnostic never passed its exception gate. The admission separately retains the actual refusal/census. Null in the former field does not mean Save38 accepted212.

Whole-save0/208/211 bytes and hashes match actual1062 exactly. Work/receipt prefixes at208 and211 likewise record `exactTreatment: true`. At212 the validator names `person-studio-efb645e3-r02-0`; direct census records that person's antagonist seat in `studio-efb645e3-r01:film:23` and unfinished writing on `script-0024` for the same studio. It independently records the second collision for `person-studio-efb645e3-r01-0`, seated as support on the other studio's film23 and writing its script0024. These are occupied seats plus writing work; permanent Writer credit remains separate.

1069 final verification closed exit0/fixedSource:true at04:29:16.259Z. It verified the retained snapshot manifest584,119 bytes/SHA `659e49d1818a98a8e748f25a0507060ae12fc50050eb0198d859399463c7053e`, all1,660 copied source files,1,659 unchanged files, eight explicit extras, and the one copied busy-set intervention. Source recovery and provenance passed. This does not turn the stopped diagnostic into completed causality evidence.

## Exact error and its source

The212 admission's complete `message`, without surrounding quotes or newline, is:

```text
validateSaveV37: state is invalid — validateSaveV36: frozen V35 state is invalid — validateSaveV35: frozen V34 state is invalid — validateSaveV34: frozen V33 state is invalid — validateSaveV33: frozen V32 state is invalid — validateSaveV32: frozen V31 state is invalid — validateSaveV31: frozen V30 state is invalid — validateSaveV30: frozen V28 state is invalid — validateSaveV28: frozen V27 state is invalid — validateSaveV27: frozen V26 state is invalid — validateSaveV26: frozen V25 state is invalid — validateSaveV25: frozen V24 state is invalid — Hollywood save: person person-studio-efb645e3-r02-0 has simultaneous active assignments
```

The diagnostic's `wholeSave` calls `makeSave` before export (`1100-c3-b5-forensic.ts:63`). The error originates in validation before detachment or canonical serialization; it is not a serialization difference. Its source chain is fixed and directly explains every frame:

| Source | Contribution |
| --- | --- |
| `save.ts:6522`, `:10203–10216` | makeSave → validateSaveV38 → proveSaveV38 → privateV37. Neither makeSave nor V38 wraps this thrown error. |
| `save.ts:10161` | Adds `validateSaveV37: state is invalid — `. |
| `save.ts:10082,9870,9668,9380,9161,9066` | Adds, outer to inner, V36/frozen35, V35/frozen34, V34/frozen33, V33/frozen32, V32/frozen31 and V31/frozen30 frames. |
| `save.ts:8999` | V30 delegates directly to frozenV28; adds V30/frozen28. No V29 frame is lawful on this path. |
| `save.ts:8805,8710,8571,8392` | Adds V28/frozen27, V27/frozen26, V26/frozen25 and V25/frozen24 frames. |
| `save.ts:8170–8181,7884–7907` | PrivateV24 delegates directly to privateV19, which invokes validateHollywood after its lower-state proof. These frames do not catch/wrap the Hollywood error. There is no V24/V23/V22/V21/V20/V19 textual prefix in this message. |
| `hollywoodValidation.ts:23,201–205` | `claimAssignment` detects the already claimed actual person; `requireFact` throws the exact `Hollywood save: person <id> has simultaneous active assignments` suffix. |

Read-only measured `src/core/save.ts`:462,983 bytes/SHA `7d05eb0e4d9921e72cf2889eabc77fc96372f743366d33a05884343c9cde3ace`; `src/core/hollywoodValidation.ts`:51,673 bytes/SHA `bd10c4637d2ada3e610464dc82cabfb856a367be9f48752d4a7bd030d098d1bf`. These unchanged files are copied/proved by1100's manifest. The intervention touches only the copied hollywoodTick busy-set import/comment/loop.

The harness at1100 line266 instead anchors a pattern to the **bare** Hollywood error. The leading literal `^Hollywood save:` cannot match any of the actual full-chain refusals. Its following `assert.ok(match, 'exact current simultaneous-assignment law, not another validation cause')` produced the recorded firstFailure. This is a false negative in the diagnostic adapter, not a different gameplay cause and not permission to relax Save38.

## Proposed strict matcher, preserving all causal gates

Use the twelve literal wrapper frames above as one fixed prefix, with exact spelling, order, spaces and U+2014 dashes. Do not derive an accepted prefix by slicing the new runtime error, stripping arbitrary `validateSave` clauses, matching `.*`, accepting a generic suffix/substring, or normalizing whitespace.

Recommended matcher: from the already independently enumerated `census.collisions`, require **exactly one** row for which the complete error string is equal to:

`fixedTwelveFramePrefix + 'Hollywood save: person ' + row.personId + ' has simultaneous active assignments'`.

Then use that exact matched row/person ID for the existing production/draft checks. Full string equality rejects extra leading/trailing bytes, including a trailing newline; it avoids the special end-before-final-newline behavior of a bare JavaScript `$` anchor. It does not hardcode the observed212 person's ID or assume the same person remains the first reported at416. A different actual416 person is eligible only when that boundary's current direct census proves the same precise assignment conflict under the existing guards.

Unchanged mandatory gates:

- Only whole-save refusal boundaries212 or416 may enter this branch. Whole0/208/211 admissions, exact saved hashes and all existing treatment-prefix checks still run first; any mismatch stops.
- The message-named person must hold distinct actual production and unfinished screenplay identities at the same studio. At212, both new work records must have actually begun at211, be absent from the prior211 census, and the draft must be drafting with the existing due bound. Current1062's212 census remains collision-free.
- At416 any refused save needs the same exact wrapper/suffix and its own current direct census. An accepted416 save cannot erase the earlier invalid trajectory. A different validator cause, missing census witness, source/input drift or thrown tick stops.
- All admission messages remain verbatim. The continuation stays `gameplayValid:false`; successful raw collection may report only `FORENSIC_COLLECTED`. All original terminal/count/receipt/employment/take/RNG comparisons and exact row/work/outcome attribution remain; no recovered pin becomes automatic maintenance authority.

Before any new gameplay, prepare a separate bounded **data-only** matcher verification for parent execution. Its positive uses the immutable1068 recorded message and census; its refusal cases include the bare suffix, omitted/duplicated/reordered wrapper, extra prefix or suffix, trailing newline, changed punctuation, a different Hollywood law, and an unknown/noncolliding person. Verify exactly one full-message match and preserve the actual original refusal bytes. This test of harness parsing does not execute simulation or certify the downstream collision gates.

## Why a separately reviewed corrected pass is justified

1100-A explicitly allowed one bounded counterfactual and prohibited automatic extra seeds, feature disabling or follow-up counterfactuals. That rule worked:1068 stopped at the unrecognized error and performed no continuation. It must not be re-described as an automatically retriable run, or resumed from a manufactured serialized212 checkpoint.

The proposed exception is one **new, explicitly reviewed harness-correction protocol**. The unanticipated difference is fully explained by unchanged source literals before any416 result exists. It changes no seed, game action, intervention, validator, tick option, causal comparison, permitted underlying failure or desired pin. Consequently a fresh bounded pass can answer the original unanswered causal question without choosing a different counterfactual to chase the result. It still requires the parent's separate source release and independent review; this document itself authorizes no retry.

If adopted, create separately named1105 diagnostic/preparation/typecheck/verification/provenance sources and one exclusive new temporary snapshot/result. Preserve every1100 original file and the first snapshot. Required mechanical differences are the new names/output/manifest identities and their cross-pins; the sole diagnostic behavior change is the strict full-wrapper matcher. Freeze a complete bounded diff and prove reversal to the original producer/helper bytes after removing only these reviewed changes. All1,660 source inputs,1,659 unchanged copies, eight explicitly enumerated extras, copied-module original/transformed hashes, exact semantic intervention and original treatment1062 identity remain the same. Record the new actual host HEAD and its byte-identical consumed source, rather than pretending a docs-only later checkpoint is the old HEAD; freeze that host identity throughout the new preparation/compiler/run/guard series.

The corrected pass starts fresh at0 on the same one seed, follows exact default `tick(state)`, and retains the416-call maximum,0/208/211/212/416 admissions,2000-file/256MiB copy limits, one16MiB exclusive result,32KiB stdout and no action/funding/alternate scenario/cleanup. The212 completed calls from1068 remain separately counted; a successful corrected pass would add at most416 calls (628 across the two recorded attempts), not be reported as a single416-call campaign. Parent alone executes, after the current endurance lane closes. No current treatment rerun is needed.

Stop after that separately approved pass with no automatic further variant. A new unrelated failure or unrecovered old pin leaves attribution incomplete. Only completed comparisons and independent causal review can justify a narrowly scoped future B5 pin amendment. Until then original B5 pins, current production fix,1093/1096 stages and all C.3 qualification records remain unchanged.

**Disposition:** the stopped result is a preserved harness false negative with a source-proved wrapper cause. Recommend the narrow separately reviewed correction above; retain no gameplay-valid or completed416 claim from1068.
