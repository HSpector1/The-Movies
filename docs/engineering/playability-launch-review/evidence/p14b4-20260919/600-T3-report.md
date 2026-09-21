# 600-T3 report — UI live-version pins 28 -> 30 (values only)

Role: test-author (600-T3, P14B.4 headless program). Mode: bounded values-only reconciliation.
Worktree: /Users/zacheryspector/The-Movies-headless-program, HEAD e9f4962bfc996ff1eb0f584909f727bd4c1a6132, tree clean under ui/ before edits.
Git use: read-only plus `git diff`. No commit/stash/checkout/reset/add/push.

## Result

DONE. Eight live-writer pins moved 28 -> 30 in exactly the five assigned files. Run: 5 files / 45 passed / 0 failed (precedent count matched). No other file changed.

## Source facts (why 30 is the live value)

- src/core/save.ts:6400-6401: `makeSave(state): SaveFileV30` calls `validateSaveV30({ saveVersion: 30, ... })`; src/core/save.ts:500 `saveVersion: 30`.
- ui/src/engine/adapter.ts:3779 `exportSaveJson` -> `exportCurrentState` (the live writer).
- ui/src/engine/session.ts:39-43 `saveActiveSession` writes `exportSaveJson(state)` to localStorage under ACTIVE_SESSION_KEY (same writer).

## Line table (before -> after)

| File:line | Pinned object | Before | After |
|---|---|---|---|
| ui/src/engine/d17-save-migration.test.ts:131 | exportSaveJson(newFoundedGame) | `toBe(28) // Current writer (P13B-S8): SaveFileV28.` | `toBe(30) // Current writer (P14B.4): SaveFileV30.` |
| ui/src/engine/d17-save-migration.test.ts:155 | exportSaveJson(r.state) after V8 import | `toBe(28)` (no comment) | `toBe(30) // live writer (P14B.4): SaveFileV30.` |
| ui/src/engine/film-chronicle-adapter.test.ts:289 | exportSaveJson(state) | `toBe(28)` (no comment) | `toBe(30) // live writer (P14B.4): SaveFileV30.` |
| ui/src/lot/snapshot/v14SetHolderBoundary.test.ts:46 | exportSaveJson(newGame) | `toBe(28)` (no comment; the two-line comment above it already says "current writer") | `toBe(30) // live writer (P14B.4): SaveFileV30.` |
| ui/src/saves.test.tsx:125 | exportSaveJson(state) | `toBe(28) // live writer (P13B-S8): SaveFileV28.` | `toBe(30) // live writer (P14B.4): SaveFileV30.` |
| ui/src/session.test.tsx:332 | localStorage after saveActiveSession | `toBe(28) // P13B-S8: live saves are SaveFileV28.` | `toBe(30) // P14B.4: live saves are SaveFileV30.` |
| ui/src/session.test.tsx:360 | localStorage after saveActiveSession | `toBe(28) // P13B-S8: live saves are SaveFileV28.` | `toBe(30) // P14B.4: live saves are SaveFileV30.` |
| ui/src/session.test.tsx:387 | parsed localStorage after saveActiveSession | `toBe(28) // P13B-S8: live saves are SaveFileV28.` | `toBe(30) // P14B.4: live saves are SaveFileV30.` |

All eight read the LIVE writer's output (a fresh or current-state export, or the autosave of a just-loaded session). None is a historical fixture's own version. Each file's existing comment style was kept; the four lines that had no trailing comment received the saves.test.tsx style.

## Grep inventory (ui/**/*.test.ts, ui/**/*.test.tsx, after edits)

Patterns: `toBe\((28|29)\)`, `saveVersion:? *(28|29)\b`, `(migrateToV|validateSaveV|makeSaveV|SaveFileV|convertV)(28|29)\b`, `P13B-S8|P14A\.1|\bV2[89]\b|Save2[89]\b`.

Result: zero matches. No other 28/29 live pin exists under ui/.

Remaining non-30 saveVersion references under ui/ (all historical or deliberately invalid; left untouched):

| File:line | Value | Class |
|---|---|---|
| ui/src/saves.test.tsx:187 | 99 | deliberately unknown version, rejection path |
| ui/src/saves.test.tsx:220 | 7 | malformed file (no state), rejection path |
| ui/src/session.test.tsx:319 | 5 | literal V5 envelope from makeSaveV5 |
| ui/src/session.test.tsx:374 | 8 | literal V8 envelope from makeSaveV8 |
| ui/src/lot/world-first-operational-annex-work-presence-fixtures.test.ts:140, :175 | 13 | hand-built V13 fixture literals |
| ui/src/lot/tycoon/expandedPropertyWorld.test.ts:73 | 13 | manifest-pinned frozen SaveFileV13 fixture bytes (sha256-checked) |
| ui/src/engine/d17-save-migration.test.ts:85 | 2 | literal V2 |
| ui/src/engine/d17-save-migration.test.ts:106 | 5 | literal V5 |
| ui/src/engine/d17-save-migration.test.ts:145 | 8 | literal V8 |
| ui/src/engine/adapter.test.ts:335 | 99 | deliberately unknown version, rejection path |

Live pins now at 30 (eight lines, listed above). No others.

## Check run

Command (run once):
`node_modules/.bin/vitest run --project ui --minWorkers=1 --maxWorkers=1 ui/src/saves.test.tsx ui/src/session.test.tsx ui/src/engine/d17-save-migration.test.ts ui/src/engine/film-chronicle-adapter.test.ts ui/src/lot/snapshot/v14SetHolderBoundary.test.ts`

Output: Test Files 5 passed (5); Tests 45 passed (45); Duration 27.03s; started 17:41:04.
Log: /private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/600-T3-run1.log (3526 bytes).
Baseline for comparison: record 614 (8 failed / 37 passed on the same five files at HEAD).

## Artifacts

- Patch: /private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/600-T3.patch (5403 bytes, sha256 f928f68aa88077584ffe7e8bf22c13dcb8872d1a0f0c3c7fe15f6a95a5b5bf81; `git diff HEAD -- ui/`; 5 files, 8 insertions, 8 deletions).
- `git status --porcelain` tracked changes: exactly the five assigned files (M). Pre-existing untracked evidence 610-614 files untouched.

## Evidence limits

- Only the five assigned files were executed. No other ui suite, core suite, typecheck or bridge check ran under this contract.
- The patch is uncommitted in the worktree; landing is the parent's call.
- Comments on four lines that previously had no trailing comment gained one; this is text only and does not change any assertion meaning.
