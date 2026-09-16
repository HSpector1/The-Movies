# UNITY-INTEGRATION-BACKLOG — work reserved for the replacement laptop

Every headless slice records here: producer/consumer versions, required UI action/feedback, C# binding
changes, exact future compile/render/native tests, and unresolved product choices. Nothing in this file is
verified in Unity. Generated C# produced by the TypeScript generator is text, not a compiled consumer.

## Standing obligations carried from the paused UI branch (unchanged by this window)

- Paused TS UI branch `wip/playability-interaction-01-ts` @ `e2e409e80eccb6a7fd49fa16aa0f750faeb51253`; paused
  Unity branch `wip/playability-interaction-01-client` @ `08c32c47f6faf223068d0999ec4a7a6c90649948`.
- Open rendered/native defects: **F26** (Development review control unreachable under `inspector-fallback` at
  1280×720 @ 100 % after a workspace closes), the card scroll-rect overrun (76 px), the 100 % body scroll not
  observable, Production clamp false for J1 at 1280×720 @ 200 %, Profile explanation 74 px; IMPL-29 / TEST-27
  were running when the laptop became unavailable — their local state is **not recoverable** from published
  work and must be re-derived on the new machine.
- `dense-03p32` genuine 3-action record remains a NAMED DATA DEPENDENCY.
- Last admitted player: Build56 (Unity 288c4ddb / TS 70a8c3ec, projection 31, seal 51, admission 46). Working
  bridge manifest on the pin: protocol 4, projection 32, schema
  `sha256:b3a76d197481175c3a4a615f634cf227ae00b95981625df3f67784b307fc9e5c`.
- Native +5 % Save/load and acknowledgement obligations remain for a matched later run.

## Per-slice entries

### P13B-S1 — full named research staffing (engine)

| Item | Record |
|---|---|
| Producer version | **Save V21 is the live writer** (`makeSave`), technology root v2 (`seats`/`weeks`/`legacy`); engine commits `57980e95` → `b5b2412` → `5a52e1e` → `d74426a`. Bridge protocol 4 / projection 32 unchanged; contract manifest schema `sha256:b3a76d19…` unchanged (`check:bridge-contract` + fixtures PASS at b5b2412). `migrateToV20`/`V19`… refuse a V21 save (no silent downgrade); a V20 save is proved by the frozen v1 validator, then lifted |
| Consumer change | None on the wire. Laboratory page (projection 32) row changes an old client would notice: the single `recruit-<placementId>` row is replaced by **one row per free named candidate** `recruit-<placementId>-<t-sci-NN>` whose intent carries `scientistId` (an old client's stored `recruit-<placementId>` intent is refused as unknown, by design); per-seat `release-<placementId>-<talentId>` rows (`releaseResearchSeat`); `seatLabel` ("Seats assigned: n of 4 … Seated: …"), multi-line `scientistLabel` (one line per seated person), `provenanceLabel` names the completing seats. `scientistId` stays nullable = first unreleased seat |
| Required UI action/feedback | Candidate list of eight named people with a hire row each (offer terms, contract end, "seat retained" when the person still holds a seat); seat list (≤ 4) with per-seat release and per-seat employment status ("contract no longer active" after expiry, rehire of the same id); refusal reasons: four seats occupied, second Laboratory (S1), eight Scientists employed, unemployed person, already holds a seat; auto-pause explanation when no seat is eligible; the "n of 4 seats" count |
| C# binding change | None until S1b adds `seats` (talentId, assignedWeek, releasedWeek, employed) and per-week receipts to `StudioLaboratoryPage` (projection 33); DTO regeneration + paired Unity adoption then |
| Future compile/render/native tests | EditMode: Laboratory workspace binds up to 8 recruit rows + up to 4 release rows and the multi-line scientist label; PlayMode: seat rows/labels at 100 %/200 %, 1280×720 and 1440×900; native A1/A2 (companion §8) on generated worlds: hire/assign four, fifth refusal, expire one, rehire same id, idle salary/overhead; a future player must explicitly pair with Save V21 before loading engine-generated test saves (`CURRENT_ACCEPTED_SAVE_VERSION` in `scripts/bridge-contract-consumer-lock.ts` is still the consumer's attested value and is not bumped by the engine) |
| Migration / integration risks | The old executable (Build56) cannot read V21 saves; keep engine-only candidates away from its live saves (Owner rule). Campaign-library records written by this engine are V21. Evidence generators now stamp `makeSave(state).saveVersion`. Root + ui typecheck now PASS because the r3n1 bridge-class tests moved to `tsconfig.bridge.json`; the Unity-side r3n1 fixtures (`evidence/Playability-Interaction-01/fixtures/r3n1-dense-02*`) are not on this host |
| Unresolved product choices | "exactly one restart" after cancel (proposed, not coded; P13A repeatable-restart law retained). Plan-text reading recorded: "seating mid-project changes n from the next boundary only" = the receipt written at the next tick counts the seat; earlier receipts are immutable |

### P13B-S1b — Laboratory seats read model (bridge projection 33)

| Item | Record |
|---|---|
| Producer version | **Bridge protocol 4 / projection 33**; schema `sha256:9ee4bcff04e06d47fa672f6091d3f9eac98c3a19829260fd9587ab22d06d55f6` (was projection 32 `sha256:b3a76d19…` at the pin); generated TS contract sha `076893b770110d77864504d46f0503aad574b33ede35702c505338e448217c3d`; `BRIDGE_SCHEMA.$id` `urn:project-studio:bridge:protocol-4:projection-33`. Save version unchanged (V21). Engine commit: the S1b commit on this branch |
| Consumer change | Additive DTOs on `StudioLaboratoryPage`: `seats: StudioLaboratorySeat[]` (`talentId`, `name`, `assignedWeek`, `releasedWeek?`, `employed`; every seat row incl. released history, stored order), `receipts: StudioResearchReceipt[]` (last eight worked weeks ascending: `week`, `seatTalentIds`, `spend`, `units` ≥ 1 in 1/20,000 work units), `weekly: StudioResearchWeek` (`ceiling`, `usable`, `seats`, `output` — the CURRENT quote, zero when not active). Labels retained unchanged. `snapshotVersion` literal 33 on every envelope: an unpaired projection-32 client is refused by the schema, by design |
| Required UI action/feedback | Seat rows by id with employment state and history; receipt table (last eight weeks) as the visible "actual advance receipts"; numeric weekly quote beside the labels |
| C# binding change | Three new generated DTO classes + three members on `StudioLaboratoryPage` in `generated/unity/StudioBridgeDtos.Generated.cs` (`ProjectionVersion = 33`); copy/generate into the Unity client (`--unity-project` check), regenerate P11 EditMode fixtures / PlayMode embedded wire for the Laboratory page; the manifest's `unityGeneratedContractSha256` is the required-copy expectation, NOT proof of adoption |
| Future compile/render/native tests | EditMode: DTO round-trip of a projection-33 Laboratory page with 4 seats / 8 receipts; Laboratory workspace binds seat rows + receipts; PlayMode 100 %/200 %; native: seat/receipt rows readable at 1280×720 and 1440×900; a stale projection-32 client must show the refusal, not a blank page |
| Migration / integration risks | Any checkpoint/evidence generated by this engine carries `snapshotVersion` 33; Build56 (projection 31) and the paused Unity branch (32) are both unpaired; `scripts/bridge-contract-consumer-lock.ts` attests the consumer's own values at runtime (not edited) |
| Unresolved product choices | none new |
