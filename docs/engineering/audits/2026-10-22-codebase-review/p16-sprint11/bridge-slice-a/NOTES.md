# Sprint 11 Bridge slice A: P16-build checkpoints and the franchise read model

Target: `p17-continuation-20261027` at 2c50c9df. Status: STATIC-UNRUN. Nothing here was compiled or run; the hook blocks tsc and vitest in this lane. `git apply --check` passes for SOURCE.patch, TESTS.patch and both together against the clean worktree at 2c50c9df.

## The defect (review S1)

`SCHEMA_ID` hashes the bridge schema alone (`bridge/protocol.ts:35`), and P17 changed no DTO, so the P16 build (a5a66c27, tag p16-technical-checkpoint-20261027) and the P17 build share `sha256:57f12ee2…` (projection 64). A checkpoint the P16 build wrote carries Save49 slots under that id. `loadBridgeRuntimeCheckpoint` sends it down the current-schema path, where `validateCanonicalCurrentSave` refuses it (`bridge/runtime-checkpoint.ts:540-541`, "must be a current V50 save, received V49"). Only prior identities reach `importPriorSaveViaCanonicalChain` (`:926-936`, `migrateToLive`).

## Precedent

Every earlier save bump that left the old schema id in Owner checkpoints moved the projection and registered the outgoing id as prior in the same slice:

- Save48 to Save49 (P16, b2d3d97e): projection 58 to 62, outgoing58 registered (`bridge/runtime-checkpoint.ts:72`, "Actual shipped P15B projection58").
- Save47 to Save48 (P15B, 2c3024e2): projection 57 to 58, outgoing57 registered (`:74`).
- A save bump with no DTO change: Record 840, projection 51 (`bridge/schema/bridge-schema.ts:269-271`): "No DTO field changes; exact schema50 checkpoints migrate both independent slots through the governed prior-schema path in the same slice." The projection literal feeds `$id`, `x-project-studio` and the five `snapshotVersion` consts, so a bump alone moves the identity.
- Genuine-capture rule: outgoing63 went in only with an original-runtime capture (`:61-62` comment, `p16-sprint8/contract64/capture63.ts`, fixture case at `tests/bridge-runtime-checkpoint.test.ts:771-811`). Owner decision 20A forbids registering a prior without a genuine fixture.

## The fix (SOURCE.patch)

1. `bridge/schema/bridge-schema.ts`: `PROJECTION_VERSION` 64 to 65, with the projection comment.
2. `bridge/runtime-checkpoint.ts`: `['sha256:57f12ee28d21aa47c7514afa1c058105a10f10a9e76d400d664e97c23dc90272', 'projection-v64']` at the head of `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS`. A P16-build checkpoint now takes the prior path: envelope and journal structure verified on the original bytes, each slot lifted Save49 to Save50 by `migrateToLive`, digests recomputed, journal reset, new session. A 64 checkpoint the P17 build already wrote (Save50 slots) takes the same path and `migrateToLive` changes nothing. The current-schema refusal stays for a current-65 checkpoint that carries a non-live save. No save version moved.
3. Read model, following the P16 paid-report convention (an Industry view, `bridge/paidReports.ts` routed at `bridge/industry.ts:302`): `view:'franchises'` on `StudioIndustryRequest`/`StudioIndustryResponse`, response member `franchises: StudioFranchisesPage | null`, six new `$defs` in `bridge/schema/industry-schema.ts`, the reader in new `bridge/franchises.ts`, routed in `bridge/industry.ts`. Per property: typed installments (origin and the five types), branches with kind, Momentum (`momentumAt`) and band (`branchBand`), Recognition (`recognitionReported`) and Fatigue (`fatigueAt`) for the property and each SubProperty, reboot legality and refusal, and every choice `continuationQuote` admits for the player studio this week (each film under directSequel, prequel, remake and reboot; each SubProperty as a spin-off from each film). The world is `continuationWorldOf(state)`. Nothing writes. `targetId` must be null.
4. `bridge/schema/project-studio-bridge.schema.json`: post-image produced statically by mirroring `dsl.ts` (`tools` method below). The lane generator must confirm it byte for byte.

No write verb. Greenlight-with-continuation through the Bridge is not a one-line pass-through: the greenlight intent payload has no `continuation` member on the wire, so it needs a schema change, a parser and quote/commit wiring. Deferred to a later slice.

Known ceilings (marked `ponytail:` in `bridge/franchises.ts`): the view lists properties the root already carries, so a film with no continuation yet has no row; each quote runs one `resolveTitles`.

## Literals changed

- `PROJECTION_VERSION`, `SNAPSHOT_VERSION`, `snapshotVersion`, `x-project-studio.projectionVersion`, `$id` URN, `expected literal`, `ProjectionVersion = ` and `INCOMING_PROJECTION`: 64 to 65 in 37 bridge test files (75 mechanical replacements; `bridge-p13b-s2-labs` work counts of 64 untouched).
- Roster: OUTGOING_64 added to the exact prior lists in `bridge-p14b4-runtime47-compatibility`, `bridge-p14b5-relationships` (two lists), `bridge-p14b6-relationship-read-models` and the sorted list in `bridge-runtime-checkpoint`; sizes 52 to 53 in `bridge-p14b6` and `bridge-p14b8-waiver-surface`; `HIGHEST_REGISTERED` and its case moved to projection-v64 in `bridge-stabilization-l22-retired-projections`.
- Older-roster digests (computed): `bridge-p14p4p5-opportunities` 51/`1a452a62…` to 52/`a6666891e226bf8c1180354c7fee318693f13bfa732e4c171024b60434d176dc`; `bridge-p14r2r3-prior55` 51/`9270841e…` to 52/`fa11f1c37a84c87f7ce805e36e27da29fe045c60738a063c52eebe36c26f7b6f`.
- Current schema identity (computed statically): `sha256:d57642ad971a0682ae587c8d9c73fdf8b251f28749dd156e53a5c8487b4e6df8`, in `bridge-p14b5-relationships` and twice in `bridge-contract-generator` (F10 header and `schemaIdentity`).

## Computed versus placeholder

Computed here, with the method checked against the parent first:

- Schema identity: canonical sha256 of the post-image schema JSON. The same script reproduces `57f12ee2…` from the parent's file and confirms it round-trips byte for byte as `canonicalJsonPretty`. Holds only if `check:bridge-contract` reports the post-image schema JSON verified.
- Older-roster digests: `tools/roster-digest.cjs` parses the registry literal, resolves named constants, excludes one era and hashes the sorted pairs. On the parent map it reproduces both current pins (51/`1a452a62…`, 51/`9270841e…`).

Placeholders the coordinator fills from the lane:

- `tests/bridge-contract-generator.test.ts` F10 and F11 declaration-body sha256 (`PLACEHOLDER-P65-F10-…`, `PLACEHOLDER-P65-F11-…`). Only the C# generator renders those bodies. F12 must stay `78d68a2d…`.
- `tests/bridge-runtime-checkpoint.test.ts` genuine capture pins: `PLACEHOLDER-OUTGOING64-COMPRESSED-SHA256`, `-DECODED-SHA256`, `-SLOT-SHA256`, from `OUTGOING64-RECEIPT.json` written by `tools/capture64.ts` run in an immutable a5a66c27 snapshot. Freeze its two outputs at `tests/fixtures/p16/genuine-projection64-runtime/`.
- Generated artifacts outside this slice's file set: `generated/unity/StudioBridgeDtos.Generated.cs` and `generated/unity/project-studio-bridge.contract-manifest.json` (schemaId, projectionVersion 65, generatorSourceSha256, C# sha256). Run `npm run generate:bridge-contract`, then `check:bridge-contract` and `check:bridge-contract:fixtures`. `bridge-schema.test.ts` (`ProjectionVersion = 65` in the C#) and the p14b5 generator-artifact case fail until then. Unity consumer qualification is not claimed.

## Lane order for the coordinator

1. Apply SOURCE.patch and TESTS.patch at 2c50c9df.
2. Capture outgoing64 at a5a66c27 with `tools/capture64.ts`; freeze the fixture; fill the three capture pins.
3. Regenerate the contract; confirm the schema JSON is unchanged by the generator and the manifest schemaId is `d57642ad…`. If not, replace the three identity literals with the generated one.
4. Measure F10/F11 and fill both pins.
5. Run the bridge tests. Expected RED at 2c50c9df (tests only, fixture present): the cases listed below fail by assertion.

## RED-first cases (fail by assertion at 2c50c9df)

- `bridge-runtime-checkpoint`: "accepts a current64 checkpoint with real Save49 slots and lifts each to Save50 with fresh digests (refused as V49 at the parent)". The Save49 bytes come from the real `convertV50ToV49(makeSave(state))`, version-only while no franchise exists; the envelope is the suite's existing `priorProtocol4Bytes`. At the parent the load refuses with "must be a current V50 save, received V49" and `expect(outcome).not.toHaveProperty('refused')` fails. After the fix it pins Save50 slots, the lifted bytes, both recomputed digests (different from the Save49 digests), a reset journal and a current re-open.
- `bridge-runtime-checkpoint`: "accepts the genuine P16-build capture (a5a66c27 public save route) and lifts both Save49 slots to Save50". Same RED mechanism once the capture exists.
- `bridge-p17-franchise-read-model` (new file), three cases: the parent's closed Industry parser refuses `view:'franchises'`, so the `toMatchObject({ ok: true })` assertion fails first in each.
- Existing pins moved to 65 and the roster entries fail by value at the parent.

Guard, green at the parent and after: "still refuses a current-schema checkpoint that carries a non-live Save49 slot, by name, without the prior path".

## New test cases

- tests/bridge-runtime-checkpoint.test.ts, describe "Sprint 11 S1 — P16-build current64 checkpoints with Save49 slots take the governed prior path":
  1. accepts a current64 checkpoint with real Save49 slots and lifts each to Save50 with fresh digests (refused as V49 at the parent)
  2. accepts the genuine P16-build capture (a5a66c27 public save route) and lifts both Save49 slots to Save50 (placeholder pins)
  3. still refuses a current-schema checkpoint that carries a non-live Save49 slot, by name, without the prior path
  4. (generated by the existing `it.each` over the registry) accepts and migrates the enumerated sha256:57f12ee2… (projection-v64) identity
- tests/bridge-p17-franchise-read-model.test.ts, describe "P17 franchise read model on the Bridge Industry route (projection 65)":
  1. publishes the property with its typed lineage, Recognition/Fatigue and each continuity's Momentum from the core readers
  2. lists exactly the continuation choices the core quote admits for the player now, and reboot legality from the same quote
  3. is read-only and guarded: no state or revision change, detached rows, stale revision and non-null target refused, empty before any continuation

The franchise test imports `tests/helpers/p17-route.ts` and `tests/helpers/p16-fixtures.ts` read-only (`mintRoute`, `freshConcept`, `greenlightAs`). It runs one route (eight production ticks plus release) in `beforeAll` under the default hook timeout; no timeout changed.

## Fix 1 (against c0489f7c; tests only)

FIX-1.patch sha256 `7fff1877d4effbf67b039778a1e64e41737989a552d3cad57bc7504ed890bccd`. Files: tests/bridge-p17-franchise-read-model.test.ts, tests/bridge-runtime-checkpoint.test.ts, tests/bridge-contract-generator.test.ts, tests/bridge-p14b5-relationships.test.ts. Post-images in fix1/postimages/. `git apply --check` passes on the worktree at fd2cc2e0, where all four files still match c0489f7c. STATIC-UNRUN.

**Lane failure diagnosis (bridge-green-r5, franchise case 1, line 65).** The read model does not drop rows. Every assertion before line 65 passed: one property, the exact lineage, and `row.recognition === recognitionReported(root.meter, week)`. Line 65 failed because that value is 0. Recognition is quality-gated: `registerRelease` scores `reach01 · q · recognitionGate(q)`, and the gate is 0 for quality q ≤ P17_RECOGNITION_GATE_LO (0.5). The route's origin film sits at or below the gate, so its Recognition is lawfully 0. Fatigue is also 0 because the founding film is exempt (C5). My `> 0` expectation assumed a quality the route does not produce. Choosing a seed whose film clears the gate would need a run, which this lane forbids.

**Test change.** The case still proves a real lineage with a non-trivial meter, now tied to the law rather than a guessed quality:
- Recognition is positive exactly when the origin film's own `qualityOf(critic, audience)` clears the gate.
- The property meter recorded the release (`releaseCount` 1).
- The main continuity's `lastReleaseWeek` equals the origin's release week.
- The continuity's Momentum is non-zero: the release's surprise term, read by `momentumAt`.
The exact-equality assertions against the core readers are unchanged.

**RED base.** The parent for RED is 2c50c9df, not a5a66c27. Every symbol the new cases import exists at 2c50c9df: `convertV50ToV49` (save.ts:704), `continuation.ts`, `continuationGreenlight.ts`, `continuationSignals.ts` (including `qualityOf`), `TUNING.P17_RECOGNITION_GATE_LO`, and `tests/helpers/p17-route.ts` (`freshConcept`, `greenlightAs`). At 2c50c9df each new case therefore fails by assertion:
- the two "accepts" cases fail on `not.toHaveProperty('refused')`;
- the three franchise cases fail on the Industry parser's `{ ok: true }`;
- the new founding case fails on `toThrow`'s message, because the parent refuses the Save49 slot as non-live and loads the Save50 one.
At a5a66c27 they fail by TypeError or a load error, as the coordinator observed. The RED claim applies to 2c50c9df only.

**Review should-fix 1.** I reworded the stale placeholder and "must confirm" comments as measured or confirmed, citing the lane commits:
- tests/bridge-runtime-checkpoint.test.ts (capture pins)
- tests/bridge-contract-generator.test.ts (schema id, and F10/F11 bf9192ac…)
- tests/bridge-p14b5-relationships.test.ts (schema id)

**Review should-fix 3 (inherited limit, recorded rather than widened).** New case in tests/bridge-runtime-checkpoint.test.ts: "refuses a mid-founding P16-build (Save49) or P17-build (Save50) current64 checkpoint on the prior path; the running schema still loads it". It uses the real open-founding runtime (`BridgeSession.createRuntime()`). Both current64 variants are refused with `checkpoint.currentSaveJson: previous protocol-4 production authority cannot contain an open founding draft`, and the same checkpoint under the running schema loads without migration.

The choice: `nativeR05Draft` (runtime-checkpoint.ts:1085-1098) stays R05/P12-only in this slice. A P16 player who saved mid-founding, and a P17-build 64 checkpoint saved mid-founding (which loaded on the current path before projection 65), cannot load until a later slice admits a strictly validated founding draft for projection-v64. The refusal message's word "impossible" (in the older test's name) does not hold for this era, and the new case's comment says so.

**Reviewer note (no code).** `rebootRefusal` passes through the core quote's refusal text verbatim, including P16's `noAuthority:<holderStudioId>`, exactly as the greenlight refusal does. The franchise view therefore names the title holder's studio id when the player lacks the right. The greenlight already discloses that id, so the view adds no new disclosure.
