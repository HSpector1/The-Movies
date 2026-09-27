# 1086-A — Exact historical cash-control correction

Docs-only proposal after1052, not a source or execution release. The reviewer
read the failed leaf, actual error and frozen-builder guard ordering. Keep the
original1046/1052 records and all ten cash-suite leaf identities. No production,
frozen reader, fixture, clock, timeout or error relaxation is required.

## Observed cause and governing boundary

`tests/cash-ledger-checkpoint-v11.test.ts:348–419` tests ten frozen builders against
an invalid cash checkpoint. Its first input is already an honest historical11
world: `checkpointedLegacyV11` constructs legacy1 with the legacy corpus, admits
strict1, and actually migrates to11. The leaf changes only checkpoint cash and
already asserts strict11's reconciliation error. Its later synthetic live-root
wrapper creates the unrelated missing-research error observed in1052.

`save.ts:6138` first invokes the full38 proof only when actual C.3 fields are
present; then the old builder reaches `assertFrozenBuilderCanProjectV11State`
at5810. That guard tests original checkpoint/ledger/cash facts and emits the
precise semantically-invalid-checkpoint refusal at5867. An originally historical
input must reach this frozen boundary as historical. It need not invent modern
research, placement, industry, aging or career authority merely to satisfy a
modern TypeScript annotation.

## Narrow source correction

Change only the existing failed leaf and any directly required local type/import
within the same file:

1. Preserve the actual `checkpointedLegacyV11` route and source seed. Explicitly
   admit its complete envelope with `validateSaveV11`, retain its original bytes,
   and establish the valid historical substrate before changing one cash field.
   Pass the invalid **original11 state directly** to each frozen V1–V10 builder.
   Remove the synthetic current-carrier object from this one loop; do not remove
   authority from a current state. Keep the exact ten builders and original
   `cannot downgrade or repair a semantically invalid V11 cash-ledger checkpoint`
   expectation. Require every attempted refusal to leave its input unchanged.
   A per-builder valid historical positive is appropriate before its one-defect
   negative; it adds no gameplay and prevents an unrelated refusal substituting
   for the intended cash guard.
2. The redundant-checkpoint branch currently starts from a current38 envelope
   and is unreached in1052. Instead retain the same fresh generated scenario,
   prove it with `makeSave`/`validateSaveV38`, then pass the still-valid state to
   the actual guarded `makeSaveV11`. Require strict11 admission and the original
   absence of `cashLedgerCheckpoint`. Only afterward clone this historical11
   envelope and add the deliberately redundant checkpoint equal to its actual
   cash/ledger length. Require strict11's exact genuine-reconciliation-boundary
   refusal, then send that historical state to the same ten frozen builders and
   retain their exact original cash-guard refusal. Preserve original/negative
   input purity. Do not set saveVersion manually or delete profession roots.
3. Type the local builder list for its honest historical11 input where the real
   signatures permit it, or use individually typed adapters. Do not cast the
   carrier to modern GameState to hide absent current fields. If shared historical
   types require a narrow boundary cast, document that the strict historical
   validator governs it; it cannot bypass a failed whole38 proof.

The fresh generated state's guarded old builder still proves its actual38
authority before projecting to11. Separately, the suite's already passing native
current38/redundant-checkpoint and cash-tampering controls retain current validation
and exact domain messages. This correction does not reclassify a malformed38
input as historical or remove that safeguard. Existing independent C.3 whole38
guard tests remain untouched.

## Bounded verification and limits

After explicit release and frozen-source review, observe only the existing failed
leaf by its exact full/stable title in the same core project, preserving its
unchanged test timeout. Reserve no additional gameplay; both constructions are
zero-tick and existing seeds. Preserve the other101 passing1052 outcomes at their
unchanged inputs and run applicable types for the changed annotation/imports.
The later full gate remains required; do not describe a selected leaf as another
whole102-case run.

If any actual old builder refuses for a different cause before the intended cash
guard, record the exact result and stop the correction. No expected-cause widening,
extra current fields, fabricated history, guard reorder or frozen API change is
authorized by this plan. Static disposition: **KEEP for this bounded historical
substrate correction**, with actual acceptance/refusal results still pending.
