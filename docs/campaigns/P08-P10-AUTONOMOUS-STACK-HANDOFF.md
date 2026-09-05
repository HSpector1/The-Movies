# P08–P10 Autonomous Stack — Execution Handoff (live, append-only)

**Authorization:** `OPS-P08P10-20260905-01` · **Campaign policy:** `CAMPAIGNS_FROZEN_UNTIL_P08_P10_OWNER_ACCEPTANCE`
**Delta:** `docs/operations/OPS-P08P10-20260905-01-CURRENT-OPS-DELTA.md` · **Preflight:** `docs/engineering/CODEX-P08-P10-AUTONOMOUS-STACK-CURRENT-REFRESH.md`

## CURRENT STATE (rewritten at every checkpoint; history below is append-only)

| Item | Value |
|---|---|
| Package / wave | **P08A — Wave 0/1 (history root + receipts + V17) IN PROGRESS** |
| TS WIP `wip/p08-p10-autonomous-stack-01-ts` | worktree `/Users/bruce/The Movies - P08-P10 Stack TS`; remote `hspector-github` |
| Unity WIP `wip/p08-p10-autonomous-stack-01-client` | worktree `/Users/bruce/The Movies - P08-P10 Stack Unity`; remote `origin`; untouched since base `c4c65db4…` |
| Save / protocol / projection | **V17** (new `studioHistory` root) / 4 / 15 (projection bump pending Wave 2) |
| Accepted base (frozen) | TS `2753e18ba8fb5f65b936c22cde9531646fecc6cd` · Unity `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6` |
| `FINAL_DOCS_SHA` | `72ca8e797e5185a5dec13ac4c4311e391b8e96e3` |
| Next concrete command | `cd "/Users/bruce/The Movies - P08-P10 Stack TS" && npx vitest run` (full floor green) → commit Wave 0/1 → Wave 2 projection |

## CHECKPOINT HISTORY (append-only)

### C0 — 2026-09-05 — publication + preflight
- Inputs verified: ZIP `887f4a57…`, execution pack `189075a0…`, manifest `cfa8eed4…`, patch `929c0187…`, 35 docs byte-identical.
- Published `docs/p08-p10-autonomous-stack-launch-01` @ `72ca8e797e5185a5dec13ac4c4311e391b8e96e3` (parent = accepted base); local == upstream == advertised.
- WIP pair created/pushed empty at the accepted pair and verified; TS WIP fast-forwarded to the docs commit; order + delta committed `5e01714866134552eb28ad6fb7753b598f5df123`; preflight refresh committed `bf85336c987b7bae8606099ca5e1e8d7661073bd`.
- Baseline floors at the WIP tip: TS 363 files / 4926 passed / 5 skipped; core+ui+bridge tsc clean; Unity EditMode 784/784 (fresh worktree import).
- No process, worktree, or profile belonging to another session was touched; the Owner's durable profile (`d949003e…`) is read-only to this program.

### C1 — 2026-09-05 — P08A Wave 0/1 (TypeScript) — in progress
- NEW `src/core/studioHistory.ts` (additive `studioHistory` root, sink, significance classifier, exact-once append, deterministic routine fold, invariants, selectors).
- Receipts at all three Standing mutation sites (`tick.ts` release + drift; `actions.ts` publicity); founding landmark; `filmReleased` / `theatricalRunCompleted` rows; `standing.ts` gains `STANDING_FORMULA_VERSION` + `releaseStandingDrivers` (no formula change).
- Save V17: `validateSaveV17` (strip-and-delegate to V16 + strict root validation), `convertV16ToV17` (recording begins at the migration week; nothing reconstructed), `migrateToV17`, downgrade guards, `makeSave → V17`; adapter/bridge chains; `CURRENT_ACCEPTED_SAVE_VERSION = 17`.
- Test cutover of live-version pins (the same mechanical cutover every prior bump made); reload-continuity twins now compare the V16 projection + the forward history boundary (`tests/_p08HistoryTwins.ts`) because a migrated world's history lawfully differs from a native one.
- Focused proof `tests/p08a-w0-studio-history.test.ts`: 13/13.
