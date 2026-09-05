# P08 Hostile Review — core checkpoint (independent fresh reviewer, 2026-09-05)

Reviewer: a fresh general-purpose agent given only the read-only brief (`hostile-review-brief`), the two worktrees, the planning authority, and the seal draft. Reviewed pair: TS `8a23cb3b3c8e9d4780417ca44c60312b1bfd12bc`, Unity `9f64006559558ebb04e2b4948ad6b5d5ee956f55` (harness tip `fded233…` appeared during the review). The report is reproduced verbatim below; the builder's disposition of every item is in `P08-TECHNICAL-CHECKPOINT.md` §5 (blocking items) and §9 (non-blocking items). The first verdict was REJECT of the checkpoint AS CLAIMED — the code passed every law tested; the block was the evidence record. Nothing in this file has been edited to soften it.

---

VERDICT: REJECT (the P08 technical checkpoint as claimed). The core code passes every law I could test — the block is a failed required gate and a seal/evidence record that does not match what is on disk. Path back to ACCEPT-WITH-NOTES is short (see end of BLOCKING).

Review state: TS `8a23cb3` (+ untracked seal draft); Unity moved under review from `9f64006` to `fded233` (11:02:56, harness-only, pushed). Owner profile `d949003e…` unchanged before/after every run (mtime Sep 1 21:46).

BLOCKING FINDINGS

1. Required real-HID gate is FAILED, not pending. `Evidence/P08-Journey/hid-20260905T085633Z/p08-hid-journey-report.json`: `"status":"failed","failures":36`, 51 steps = 4 ok / 36 fail / 11 info; `run-binding.json` `"exit":2`, bound to exe `32262dbf…` / Unity `9f64006`. Only Back/Save/Load/"admin bounds after load" passed; every world-entry/History step is `not visible/aimable` or `timed out` (`005-miss-admin-open-history.png` shows "Connecting to your studio…", no week). Execution order §13 lists "real HID building → Standing → History → exact subject → Back → Save/Load" as a required gate; seal §5 `__HID_RESULT__` is unresolved. The builder committed a driver fix (`fded233`, `Tools/p08-proof-journey.mjs` +32) but no re-run exists (`ls Evidence/P08-Journey` = one folder, 10:59).

2. Oracle evidence provenance contradicts the seal narrative (§10: "dirty=false… do not assign a post-build commit retroactively"). `Evidence/P08-Oracle-run2/*/build-manifest.json` (all 8 identical, sha e9f60b50…): exe `fb350cac…`, `unity.sha 04267dd`, `"dirty": true`, built 08:47:24Z — i.e. W3 commit + uncommitted W4 source. Run2's s1 sidecar has no "long lines wrap" assertion at all (older runner, `oracleRunnerSourceSha256 4a9562…`), and the run2 PNGs still show the defect the seal §6.2 says was fixed "→ run 2": `p08-recording-just-begun-standing-awareness.png` and `-overview.png`, `p08-old-save-not-recorded-old-save-notice.png`, `p08-weekly-settling-settling-bounded.png` all clip the WHAT IT MEANS line at the pane edge ("…top of th", "…nob", "It is a re"). The clean run is `P08-Oracle-run4` (08:55Z): exe `32262dbf…`, Assembly-CSharp `f32bb4e0…`, Unity `9f64006` `dirty:false`, 8/8 `complete`, 0 failed assertions, `mutationsSubmitted 0`, wrap assertion passes with diag `history-channel-meaning-line: w=731 h=29`, and the run4 PNGs do wrap. Run3 is an s1-only smoke. The seal must cite run4 as canonical and index runs 1–3 with dispositions (§10 "no six-versus-eight ambiguity"). Also run4/HID manifests record `typescript.dirty: true` (the untracked seal draft) — must be resolved or disclosed before the final manifest.

3. Seal gate figures do not reproduce at HEAD. `docs/campaigns/P08-TECHNICAL-CHECKPOINT.md` §5 and handoff C1 claim growth "save 1,928,459 B; history 573,279 B; 952 rows; 119 folded; timeline 781; 0.296 ms". My two runs of `node_modules/.bin/vite-node scripts/measure-p08-history-growth.mts` are identical to each other and different from the claim: week 6240 → `2,039,441 / 624,990 / 999 rows / 52 unfolded / 118 folded / timeline 829 / 16 films`. `git diff --name-only 15113a0..HEAD -- src/core` is empty and the script is unchanged since C1, so the recorded numbers came from an uncommitted state. (The bound itself holds: 52 unfolded routine rows at every checkpoint; the script's own "two runs print identical numbers" holds.) Same document: "bridge-p08a-w2-history-projection 5/5" — the file has 4 tests (vitest: "4 tests"); §3 counts "14 / 6 / 11" contradict its own enumerations (15 / 7 / 9) and the matrix summary (`P08-P10-FULL-SCOPE-TRACEABILITY-MATRIX.md` §3: 15 core, 7 ready, 3+4 blocked, 2 deferred, 2 rejected); 12 `__PLACEHOLDER__` tokens remain; file is untracked.

To reach ACCEPT-WITH-NOTES: re-run HID on exe `32262dbf…` with the `fded233` driver and get a pass; cite run4 + index runs 1–3; re-record growth from HEAD, fix 4/4 and §3 counts; commit/exclude the seal draft so the manifest is `dirty:false`.

NON-BLOCKING FINDINGS

1. Visual: the enlarged IMGUI Administration card (`StudioFoundingCardHud.cs:1071-1076`, Standing row wraps to 3 lines + button) overlaps the SCRIPTS rail (ghosted "Whispers of Widow" through the card) and in s1 clips the top row of the roster strip ("Actor · Available" under the button) — present in both run2 and run4 `*-admin-card.png`. §6.1's yield fix only covers card-vs-workspace.
2. `bridge/history.ts:204` "Box office returned N% on committed cost" — receipt is frozen at release while the run is active (P08-REQ-011 projected/final tense). Numerically the schedule sums to the same total (`economy.ts:28-48`), so it is tense, not truth.
3. `tick.ts:846-880` records a routine drift receipt for sub-display deltas forever (awareness never reaches the anchor in float): `p08-weekly-settling-settling-bounded.png` shows 25 identical "Awareness 0.0 (35.0 → 35.0) … excess 0.0" rows. Bounded by the fold, but noise. Related: `foldRoutineHistory` (`studioHistory.ts:299-303`) appends summaries after newer rows, so `types.ts` "weeks non-decreasing" (line ~1623) is false after a fold and `appendStudioHistory`'s `lastWeek` guard (`studioHistory.ts:219,228`) is weakened.
4. `assertStudioHistoryInvariants` (`studioHistory.ts:315-348`) never checks `recordingStartedWeek ≤ market.tick`; a forged root fails inside `tick` at `studioHistory.ts:222` instead of at load.
5. `bridge/history.ts:363` mints `buildingId: placed-${placementId}` but Unity binds only the authored `placed-1` body (codex refresh §4.5) — dormant (no facility rows emitted); line 285 dead conditional; `uncapturedFilms` (line 448) is a global count repeated per person.
6. Growth run: 806 of 829 timeline rows at week 6240 are publicity campaigns ('standard'), and the fixture studio stops releasing after 16 films (~week 520) — the 120-year "sparse" measurement is mostly drift/publicity rows.
7. Non-engaged legacy saves get `notRecordedNotice: null` / "Recording since Week 0." while nothing records (`studioHistoryRecording` = `economyEngagedEver`, `studioHistory.ts:373`).
8. `gen-p08-visual-oracle-fixtures.mts:282-285` comment ("through makeSaveV16 at every step") misdescribes the code (imports once, drives a V17 world, strips at 295); outcome is still a lawful old-save shape.
9. `contendedStudio` $200M seed (`tests/_m4Fixtures.ts:175`) is pre-existing and unchanged since base; no P08 assertion depends on it beyond affordability of the $1.2M whisper campaign and `releaseTalent`; every oracle capture shows ~$191M cash.
10. Unity `origin` has no `main` (full `ls-remote --heads`); local Unity `main` = `17572ce`, an ancestor of `c4c65db4`.
11. No EditMode test exercises the keyboard path (`StudioHistoryWorkspace.cs:878-902`); tests assert focusability only. All sidecars `visualReviewStatus: "pending"`.
12. `RenderList` case `TabRecords` (`StudioHistoryWorkspace.cs:503-505`) is unreachable in production (`recordsAvailable: false` hard-coded, `history.ts:462`); gated, not fake.

CLAIMS VERIFIED

- `git log --oneline 2753e18…..HEAD`: 8 commits (72ca8e7…8a23cb3). `git diff --stat …-- src/core/standing.ts`: `47 insertions(+)` only; diff read: `STANDING_FORMULA_VERSION` + `releaseStandingDrivers`, `updateStanding` untouched.
- Three Standing mutation sites, each with a receipt: `tick.ts:783` (+receipt 789-803), `tick.ts:850` (+855-878), `actions.ts:2820-2857`. Other `standing` writes are pre-existing research harness (`src/harness/d16/{counterflow.ts:361,publicity.ts:252}`, present at base, unchanged).
- `npx vitest run tests/p08a-w0-studio-history.test.ts tests/bridge-p08a-w2-history-projection.test.ts` → 13 + 4 passed (17/17).
- Full floor `npx vitest run` → `365 passed (365)`, `4944 passed | 5 skipped`, 120.75 s. `npm run typecheck`, `typecheck:bridge`, `check:bridge-contract` clean.
- DTO: sha256 `8aad2079…` in both repos, git blob `223564d1…` both; `SchemaId sha256:85a6d125…`, `ProjectionVersion 16`; contract files unchanged since `90a3635`/`685f113`. Engine `dist/studio/engine.mjs` = `67fc8a9f…`.
- Real-profile journey: 35 passed / 0 failed; live and baseline-copy hash `d949003e…` before and after.
- Remotes: `hspector-github` `campaign/living-lot-ts` = `2753e18…`, `main` = `c902a704…` (ancestor of base, unchanged), wip = `8a23cb3`; `origin` `campaign/living-lot-client` = `c4c65db4…`, wip = `fded233`. Reflogs show commits only, no resets/force.
- V17 save code read (`save.ts:4817-4896`, migrations 6954-7020): strip-and-delegate validator, strict row keys, `convertV16ToV17` boundary = `market.tick`, downgrades refused V13–V16; H6/H7/H8 tests prove no backfill and forged refusal.
- Unity controller: no camera/network/intent tokens (source scan); Locate only when `subjectLocation == current` and a body resolves (`StudioHistoryWorkspace.cs:276-323`); film routes by exact id (`Contracts.cs:215-233,354-357`); stale ids dropped at `Bind` (lines 182-186); no composite anywhere; no awards/records tab unless the wire says so.
- Law 3 grep of the whole delta: no award/ceremony/progression/rival/radio/wire/legacy-finale implementation; `recordsAvailable: false`.
- Run4 oracle: 8/8 complete, 0 failed, 0 mutations; run1: 7/8 + s8 authoring failure (matches seal §5); PNGs show what the run4 sidecars claim, with the visual defects noted above.

CLAIMS NOT VERIFIABLE

- Unity EditMode 806/806 (W3) and `__EDITMODE_FINAL__`: no results XML from today anywhere on disk; not re-run (batchmode writes into the worktree).
- CF-09 `verify:bridge-contract-consumer --verify-only` PASS: `cf09-w2-report.json` not found; substance (byte-identical DTO/blob/schema) verified independently.
- C0 baseline floors (363/4926, 784/784), player exe/Assembly hashes in the seal (`__EXE_SHA__`/`__ASM_SHA__` — actual: `32262dbf…` / `f32bb4e0…`), candidate package (`__CANDIDATE_PATH__`, none on Desktop), the seal's own growth figures, and any HID PASS.
