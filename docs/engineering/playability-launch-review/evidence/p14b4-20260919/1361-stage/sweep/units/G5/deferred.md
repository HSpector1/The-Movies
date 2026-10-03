## Completion addendum — 1361-X7, 2026-10-03

Final input: `patch.diff`. x3 completed clean at `ee289de67e453ce269c98d840a48799265c62993`. All type/generator checks pass; core has exactly the baseline plus the declared 45 and seven supervisor environment failures, UI has no failures, and d16 matches its base 12 exactly. Reached S8 patterns and the cash-ledger S9 pin pass. The managed V13 refusal and nine returning V13 cells were observed without P15 masking. No bare refusal site requires a new G5 pin.

The author-time pending statements below are historical and are superseded by 1361-X7 and the preserved x2 guard observations. No unresolved Save45 sweep failure remains; existing premise/masking limits remain disclosed. Independent final approval and recorded landing gates are separate requirements.

---

# Unit G5 deferred lines (1361-N)

Line numbers are HEAD's. No line moved, so they equal the lines in the edited files. P4 and P5 are the probes in the plan's S9 and S10 sections.

## A. Plan lines I did not edit (2)

| Line | Plan item | Reason |
|---|---|---|
| `tests/cash-ledger-checkpoint-v11.test.ts:381` | S9? 1, the pin `/cannot downgrade or repair a semantically invalid V11 cash-ledger checkpoint/` on the frozen builders over `redundant.state` | M2 never reached it: the leaf stops at :364 (`validateSaveV44` on a V45 envelope). A run is the only way to settle it. I predict the pin stays. The state comes from `makeSaveV11(current.state)`, and `projectStateV11` (`save.ts:5708`) copies named fields only, so `redundant.state` carries no P15 root. `makeSaveV11` itself strips the four empty roots of `current.state` (`save.ts:6197-6200`; `generateWorld` has no industry, so every root is empty). The P15 refusal cannot fire for this input. If P4 shows another guard first, the leaf takes the S9 form: pin the measured first guard and name the test that covers the masked guard. |
| `tests/v14-migration.contract.test.ts:244` | S9? 1, the loose pin `.toMatch(/cannot downgrade/)` in the catch of `makeSaveV13(historical)` | M2 never measured it. The 25 leaves of this file stop in H's `_v14Contract.ts:528` (H rows 843 to 867). Ruling 3 of 1358-F10 and the plan say no edit unless the probe shows the P15 refusal newly masking the intended guard. The cells are founded studios without an industry, so no Power Ranking quarter exists and the frozen V13 builder strips the empty roots. The regex also matches the P15 message ("makeSaveV13: cannot downgrade or discard a recorded Power Ranking quarter"), so a masking refusal would pass silently. P4 must print the thrown message per cell to rule that out. |

## B. Lines I edited whose outcome only a run settles (23, all S8)

Each edit renames `validateSaveV44(` to `validateSaveV45(` and keeps the pattern. M2 stopped every one at "validateSaveV44: expected version 44" (`save.ts:10825`) or never reached it. `validateSaveV45` hands the frozen V44 chain the state without the four roots (`save.ts:10970`), so each pattern should match the tampered field's own guard, as at Save44. P5 must print the thrown message at each line.

| File | Lines | Pattern kept | Guard the plan expects |
|---|---|---|---|
| `c2a-m2-sets-save.test.ts` | :182, :191 | `/both stand on/`, `/has no condition/` | the sets authority at the V16 boundary |
| `cash-ledger-checkpoint-v11.test.ts` | :287, :461, :467, :473, :479 | the V11 checkpoint patterns (`checkpoint must encode a genuine historical reconciliation boundary`, `studio cash must equal the historical checkpoint plus ...`, `construction capex cannot predate ...`) | `src/core/construction.ts:445` (:287) and :463 (:461) |
| `construction-core.test.ts` | :497, :505, :566 | `/cannot reserve the Annex before Week 13/`, `/advanced farther than its startTick permits/`, `/placed-facility reservation disagrees with its authoritative greenlight week/` | `construction.ts:340-360` or `placement.ts:2271` (:497), `placement.ts:2238` (:566) |
| `contracts/cross-owner-refusal.contract.test.ts` | :100 | `toContain(slotKey)` and `/overbooked/i` on the captured message | the cross-owner invariant |
| `contracts/phase-table-agreement.contract.test.ts` | :224, :246, :266 | the exact `must provide exactly ... for <phase>` substring, `/blocker\.targetPhase must be the next scheduled phase/`, `/blocker\.capability is not required by its target phase/` | the shared phase table at the save boundary |
| `legacy-parcel-ground.test.ts` | :365, :404 | `named` (`/stands on ground reserved for the studio's Annex contract/`), `/reserved for the studio's Annex/` | `placement.ts:2066` |
| `p08a-w0-studio-history.test.ts` | :450, :459, :465, :477 | `/ascending eventId/`, `/recording boundary/`, `/after − before/`, `/not a known history kind/` | the P08A history guards |
| `p13a-technology-milestones.test.ts` | :74, :79, :82 | `/technology milestone/`, `/duplicate technology milestone/`, `/invented technology history/` | `src/core/studioHistory.ts:357` (:74) |

Sixteen of the 23 lines sit behind another failure of the same leaf, so M2 shows no message for them: `c2a` :182 and :191 (behind :172), `cash-ledger` :467, :473 and :479 (behind :461), `construction-core:505` (behind :497), `cross-owner-refusal:100` (behind :72), `phase-table-agreement` :224, :246 and :266 (behind :104), `p08a` :450 to :477 (behind :441) and `p13a` :79 and :82 (behind :74). The other seven carry an M2 message that reads "validateSaveV44: expected version 44". `rows.json` carries a `behindRowIds` field for the sixteen.

## C. Outside this unit's edits

- The 12 `p14b2-setup-wrap-regressions` leaves are H rows 328 to 339 (throwing site `helpers/p14b2-fixtures.ts:122`). My two edits in that file (:7 and :27) are the first `validateSaveV44` references they meet after H. `rows.json` lists them under `alsoServesHRowIds`.
- No bare `.toThrow()` site of ruling 9 sits in G5.
