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
| Producer version | Save V21, technology root v2 (pending this slice); bridge protocol 4 / projection 32 unchanged in S1 |
| Consumer change | None on the wire in S1. Laboratory page labels change text only (`seatLabel`, `scientistLabel`, action rows for assign/release). `scientistId` remains nullable and carries the first unreleased seat |
| Required UI action/feedback | Seat list with named people, per-seat employment status, assign/release per person, recruit per candidate, refusal reasons for seat cap and second Lab |
| C# binding change | None until S1b adds `seats` to `StudioLaboratoryPage` (projection 33) |
| Future compile/render/native tests | EditMode: laboratory workspace binds new action rows; PlayMode: seat rows at 100 %/200 %; native A1/A2 (companion §8) on generated worlds |
| Unresolved product choices | "exactly one restart" after cancel (proposed, not coded) |
