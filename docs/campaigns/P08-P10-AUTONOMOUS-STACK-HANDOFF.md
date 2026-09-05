# P08–P10 Autonomous Stack — Execution Handoff (live, append-only)

**Authorization:** `OPS-P08P10-20260905-01` · **Campaign policy:** `CAMPAIGNS_FROZEN_UNTIL_P08_P10_OWNER_ACCEPTANCE`
**Delta:** `docs/operations/OPS-P08P10-20260905-01-CURRENT-OPS-DELTA.md` · **Preflight:** `docs/engineering/CODEX-P08-P10-AUTONOMOUS-STACK-CURRENT-REFRESH.md`

## CURRENT STATE (rewritten at every checkpoint; history below is append-only)

| Item | Value |
|---|---|
| Package / wave | **P08A — Wave 3 (Unity `StudioHistoryWorkspace` + inspector card + host route) IN PROGRESS**; Waves 0/1/2 committed |
| TS WIP `wip/p08-p10-autonomous-stack-01-ts` | worktree `/Users/bruce/The Movies - P08-P10 Stack TS`; remote `hspector-github` |
| Unity WIP `wip/p08-p10-autonomous-stack-01-client` | worktree `/Users/bruce/The Movies - P08-P10 Stack Unity`; remote `origin`; tip `685f113e480ee18ea242ad8a341e7710523f840f` (Wave 2 DTO sync) |
| Save / protocol / projection | **V17** (new `studioHistory` root) / 4 / **16** (schema id `sha256:85a6d125…`; CF-09 PASS TS `90a3635e` × Unity `685f113e`) |
| Accepted base (frozen) | TS `2753e18ba8fb5f65b936c22cde9531646fecc6cd` · Unity `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6` |
| `FINAL_DOCS_SHA` | `72ca8e797e5185a5dec13ac4c4311e391b8e96e3` |
| TS WIP tip | `90a3635e175013d2b3833c389bdebe985e1babf2` (Wave 2) ← `15113a026213fdcb575d5905fa6a8d312d37fe74` (Wave 0/1) |
| Next concrete command | Unity Wave 3: add `Assets/Studio/Runtime/Presentation/UI/StudioHistoryWorkspace.cs` (+ USS, inspector card, host route) → EditMode run `-runTests -testPlatform EditMode` → commit/push → Wave 4 proofs |

## CHECKPOINT HISTORY (append-only)

### C0 — 2026-09-05 — publication + preflight
- Inputs verified: ZIP `887f4a57…`, execution pack `189075a0…`, manifest `cfa8eed4…`, patch `929c0187…`, 35 docs byte-identical.
- Published `docs/p08-p10-autonomous-stack-launch-01` @ `72ca8e797e5185a5dec13ac4c4311e391b8e96e3` (parent = accepted base); local == upstream == advertised.
- WIP pair created/pushed empty at the accepted pair and verified; TS WIP fast-forwarded to the docs commit; order + delta committed `5e01714866134552eb28ad6fb7753b598f5df123`; preflight refresh committed `bf85336c987b7bae8606099ca5e1e8d7661073bd`.
- Baseline floors at the WIP tip: TS 363 files / 4926 passed / 5 skipped; core+ui+bridge tsc clean; Unity EditMode 784/784 (fresh worktree import).
- No process, worktree, or profile belonging to another session was touched; the Owner's durable profile (`d949003e…`) is read-only to this program.

### C1 — 2026-09-05 — P08A Wave 0/1 (TypeScript) — COMPLETE at `15113a026213fdcb575d5905fa6a8d312d37fe74`
- NEW `src/core/studioHistory.ts` (additive `studioHistory` root, sink, significance classifier, exact-once append, deterministic routine fold, invariants, selectors).
- Receipts at all three Standing mutation sites (`tick.ts` release + drift; `actions.ts` publicity); founding landmark; `filmReleased` / `theatricalRunCompleted` rows; `standing.ts` gains `STANDING_FORMULA_VERSION` + `releaseStandingDrivers` (no formula change).
- Save V17: `validateSaveV17` (strip-and-delegate to V16 + strict root validation), `convertV16ToV17` (recording begins at the migration week; nothing reconstructed), `migrateToV17`, downgrade guards, `makeSave → V17`; adapter/bridge chains; `CURRENT_ACCEPTED_SAVE_VERSION = 17`.
- Test cutover of live-version pins (the same mechanical cutover every prior bump made); reload-continuity twins now compare the V16 projection + the forward history boundary (`tests/_p08HistoryTwins.ts`) because a migrated world's history lawfully differs from a native one.
- Focused proof `tests/p08a-w0-studio-history.test.ts`: 13/13.
- Full floor at `15113a02`: 364 files / 4939 passed / 5 skipped; core+ui+bridge tsc clean. Pushed; local == upstream.
- 6,240-week growth measurement (`scripts/measure-p08-history-growth.mts`, disclosed $50B solvency-floor fixture, NOT a product claim): save 1,928,459 B, history 573,279 B, 952 rows (routine capped at 52 unfolded + 119 folded summaries), timeline 781, avg tick 0.296 ms — bounded and explained by the 52-week fold.

### C2 — 2026-09-05 — P08A Wave 2 (projection 16 on the wire) — COMPLETE at TS `90a3635e175013d2b3833c389bdebe985e1babf2` × Unity `685f113e480ee18ea242ad8a341e7710523f840f`
- NEW `bridge/history.ts` `historyProjection(state)`: Standing channels + receipts with fact-derived reason lines (releaseResult / publicity / awarenessDrift / settled fold), non-routine timeline, every durable P07 film record (`historyRecorded`, `resultAvailable`), captured people only, `notRecordedNotice` for saves whose recording began after founding.
- `PROJECTION_VERSION 15 → 16`, canonical `$id …projection-16`, schema id `sha256:85a6d125960dce49b4775f842d7b56d7360c81cef3638cd819057c79c99f0236`; projection-15 id appended to `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` (schema-bump law); lazy `history()` fact in the snapshot build context.
- Generated contract regenerated (`generated/unity/StudioBridgeDtos.Generated.cs` sha256 `8aad2079…`, git blob `223564d1…`) and landed byte-identical in the Unity WIP with normalize partials + `StudioHistoryTestFixtures.EmptyHistoryProjection()` wired into the three existing fixture builders.
- Floors: TS 365 files / 4944 passed / 5 skipped, tsc + bridge tsc clean; Unity EditMode 784/784. CF-09 `verify:bridge-contract-consumer --verify-only` PASS (report `cf09-w2-report.json`, both blobs `223564d1…`).
- Campaign branches and `main` unchanged; Owner profile untouched; no acceptance claimed.

