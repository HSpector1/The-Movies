# 1308-D2: independent re-review of the 1308-C2 revision

Independent contract-auditor re-review (read-only tools: Read, Glob, Grep) at HEAD 7cd74ed3, persisted verbatim by the
parent. Parent disposition in 1308-E: the stale physical-location header comment in the Bridge file is corrected on
landing; the handback's "three leaves" slip is noted, not edited.

---

# Verdict: KEEP

The 1308-C2 revision applies all six items from 1308-F correctly, with assertions that trace to real production facts I independently re-derived from source (not merely re-trusted from the handback). No required changes block the RED gate. Two cosmetic, non-blocking issues are noted below.

## Findings per check

### Check 1 — Each 1308-F item 1–6 applied exactly, nothing else changed

Verified directly against the current staged file contents (not a git diff — see "What I could not verify"):

- **Item 1** (`bridge-p14r2r3-prior55.test.ts:150-153`): exact older-roster pin present — `filter(([id]) => id !== OLD_SCHEMA)`, sorted, `toHaveLength(43)`, hash `11ec9999e052d8e6ce6dbdbb08060d57ad3a7dbb45335182c85806c4d88e4e51`. Matches 1308-F item 1 and 1308-R verbatim. **MET WITH EVIDENCE.**
- **Item 2** (`bridge-p14a1-release-busy-set.test.ts:173-193`): `seatedFixture` rebuilt on `p13aGeneratedStudio` + `signTeam`/`signOneOfRole` + `fundTo` + direct `greenlight`; no `activateScriptDevelopment` call anywhere in the file. The five `describe.each` seated leaves (lines 228-258) read as standard/untouched bodies. **MET WITH EVIDENCE**, with one residual noted below.
- **Item 3** (`p14r3-rival-release.test.ts:332`): `advanceTo(withPlayerLab, 266)`, variable renamed `atWeek266` throughout. **MET WITH EVIDENCE.**
- **Item 4** (`p13b-rival-scientist-staffing.test.ts:101,96,111-130`): premise at week 266, window `266..420`, affordability `business.account.cash > reserve` (no cushion). **MET WITH EVIDENCE** — see check 3.
- **Item 5** (`p14r3-save-v41.test.ts:191-207,339-352,372-375`): lawful-route helper + new describe block + replaced downgrade leaf; movement-half downgrade leaf (363-370) and both forgery leaves (378-411) are present and untouched in shape. **MET WITH EVIDENCE** — see check 2.
- **Item 6a** (`p14r3-rival-release.test.ts:55-58`): LAW UNDER TEST item 4 now reads "R2 binds rivals: a person seated on the rival's active production or writing for it cannot be released" — production/writing only, exactly the 1305-A quote. **MET WITH EVIDENCE.**
- **Item 6b**: I independently confirmed the underlying production facts the handback's restated prose relies on — `src/core/relationships.ts:320-329` (`recordCancelledAfterFirstTake`) and `src/core/actions.ts:588,623` (`applyCancel` calls it conditionally, only when a first take exists). The restated text is accurate. No code changed for this item (handback's own claim); I could not diff the neighbor file's bytes (see limits).
- **Item 7** (not touched): confirmed via `Glob` on `1308-stage/tests/*.ts` — exactly the six named files, no `p13b-s7-announcements.test.ts`.

One minor, pre-existing prose inaccuracy in `1308-C2-red-revision-handback.md:21`: "three leaves now use it [lawfulTerminatedSave]" — the actual file shows exactly **two** call sites (`p14r3-save-v41.test.ts:341` and `:373`). Cosmetic, doesn't affect the test code.

### Check 2 — Save41 lawful-route leaf

`lawfulTerminatedSave()` (`p14r3-save-v41.test.ts:191-207`) is labeled precisely as "the one synthetic trigger" bookending a single real tick (comment block 178-190). Assertions:
- `period.movements.termination` equals `-expectedCharge` where `expectedCharge = terminationCost(before.terms, WEEK)` (line 206, asserted line 346) — matches 1305-A's charge law at the release week.
- Frozen V40 refuses the relabeled save (`:348-350`, `validateSaveV40(relabeled).toThrow()`).
- Downgrade refuses `/termination/i` (`:374`, `convertV41ToV40(save).toThrow(/termination/i)`).

**Cannot pass on unchanged production** — I independently confirmed via source grep: `src/core/save.ts:6538` `export const LIVE_SAVE_VERSION = 40 as const`, and no `validateSaveV41`/`convertV40ToV41`/`convertV41ToV40`/`migrateToV41` exports exist anywhere in `save.ts`. `lawfulTerminatedSave()` itself uses only pre-existing exports (`p13aGeneratedStudio`, `advanceTo`, `tick`, `terminationCost`, `makeSave`) and succeeds. The **first failing expression** in this specific leaf is `p14r3-save-v41.test.ts:342`, `const validated = validateSaveV41(save as never)` — `validateSaveV41` is a named import bound to `undefined` per vite/vitest's missing-named-export semantics, so this call throws `TypeError: validateSaveV41 is not a function`. This is more precise than the handback's own generic "import-level RED" phrasing but confirms it. **MET WITH EVIDENCE.**

Also worth noting: the companion lawful-route downgrade leaf (`:372-375`) does technically get a throw on unchanged production (calling `undefined` as a function also throws), but the thrown message ("...is not a function") does not match `/termination/i`, so `toThrow(/termination/i)` itself is the failing assertion there, not "did not throw."

### Check 3 — Scientist witness

`p13b-rival-scientist-staffing.test.ts:101` (`advanceTo(..., 266)`) and `:96` (`WINDOW_END = 420`) match 1308-Q exactly. The affordability formula at `:119-123` (`business.account.cash > reserve`, `reserve = rivalWeeklyOperatingCost(...) * reserveWeeks`) is byte-identical to the producer probe `1308-Q-scientist-deficit-probe.ts:14-15`. The deficit assertion (`:124-127`) only runs `if (affordable)` and fails exactly when `deficit !== 0`, i.e., exactly when an affordable rival holds fewer Scientists than `min(capacity, demanded)`. **MET WITH EVIDENCE.**

### Check 4 — Bridge seatedFixture route

Confirmed: `seatedFixture` (`bridge-p14a1-release-busy-set.test.ts:173-193`) reaches an active production via `p13aGeneratedStudio` + `signTeam` + `fundTo` + direct `applyActions([{kind:'greenlight',...}])` — no `founded()`/`activateScriptDevelopment` anywhere in the file, so no Ready-script-project gate is hit. The five seated leaves' bodies (`:234-258`) read as the standard shape (decision check, quote check, remedy-string check, command-refusal check, no-successor check) consistent with what 1304-D would have reviewed. **MET WITH EVIDENCE**, with one now-resolved residual: the C2 handback itself flagged (lines 94-98) that it could not confirm the five new per-seed `signOneOfRole` market-walks would reliably find all six roles within the 60-tick bound. The parent's own subsequent `1308-X2-draft-dry-run.txt` (committed after C2, at current HEAD `7cd74ed3`) shows all 10 leaves of this file passing on the scratch draft, which requires all five seed-specific `seatedFixture()` constructions to have succeeded. **This closes that residual** — worth flagging explicitly since the C2 handback's own text still reads as an open risk.

### Check 5 — Type safety and destination paths

Manual read-through (no `tsc` run — I have no Bash/shell access) of all five changed files found no unused imports/locals/params and no `exactOptionalPropertyTypes` violations I could identify (e.g., `termWeeks: null` in `bridge-p14a1-release-busy-set.test.ts:243` is typed `nullable(integer(...))` in `bridge/schema/bridge-schema.ts:1867/2128/2176`, so `null` — not `undefined` — is a legal literal there, no conflict). The one destructuring-for-omission pattern (`p14r3-save-v41.test.ts:264`, `const { termination: _t, ...rest } = period.movements`) is TypeScript's documented exemption for unused bindings paired with an object-rest sibling, so it does not trip `noUnusedLocals`.

**Destination paths**: four of five files correctly self-report their physical staging location as `.../1308-stage/tests/`. One does not: `bridge-p14a1-release-busy-set.test.ts:6-7` still reads "physically staged at ... `p14b4-20260919/1304-stage/tests/`" — the actual, `Glob`-confirmed location is `.../1308-stage/tests/bridge-p14a1-release-busy-set.test.ts`. This is a stale comment carried from the file's original 1304-C authoring; it was not introduced by 1308-C2 (the item-2 diff was scoped to the fixture-construction body, not this header) and the file's stated **intended destination** (`tests/bridge-p14a1-release-busy-set.test.ts`) is correct throughout. Non-blocking, but a real inaccuracy the parent should fix before or when moving files into `tests/`.

### Check 6 — Per-file RED/pass prediction

I corroborated the following against production source directly (`bridge/schema/bridge-schema.ts:281` → `PROJECTION_VERSION = 55`; `bridge/contract.ts:163-180` → `releaseRefusal` checks only `noActiveContract`/`onScreenplayTask`, no seat/founding check; `src/core/save.ts:6538` → `LIVE_SAVE_VERSION = 40`), not just re-stated from the handback:

- **`bridge-p14r2r3-prior55.test.ts`** (1 leaf): RED. First failing expression: `:135` `expect(PROJECTION_VERSION).toBe(56)` (actual 55).
- **`bridge-p14a1-release-busy-set.test.ts`** (10 leaves): schema leaf RED at `:215` (`PROJECTION_VERSION` 55≠56); 5 seated leaves RED at `:239` (`decision.releaseAvailable` true≠false, confirmed via `releaseRefusal` source read); founding leaf RED at `:264` (same); cap/no-cap copy leaves RED at `:309`/`:340` (`.not.toContain('half')` — current copy at `bridge/contract.ts:303` unconditionally contains "half," per file header); the "free, unseated" leaf (`:282-292`) is a **regression witness that passes today**.
- **`p14r3-rival-release.test.ts`**: happy-path leaf (`:189`) is genuinely RED, first failing at `:231` (`period.movements.termination` undefined, `RivalMoneyKind` doesn't carry the key yet). The "condition (b)" (`:253`) and "condition (a)" (`:269`) leaves **pass on unchanged production too, but vacuously** — since no release mechanism of any kind exists yet, "the person is kept" trivially holds; this is expected RED-first behavior, not a defect, but worth naming precisely since it means these two leaves are not yet discriminating tests. "Scientists are never R3-surplus" (`:330`) and "no rival exceeds role targets" (`:381`) are genuine **regression witnesses passing today** (confirmed by 1308-Q against the truly unchanged HEAD `7af5412c`, not just the scratch draft).
- **`p14r3-save-v41.test.ts`** (17 leaves): all leaves that call one of the four missing exports fail at that call site with a `TypeError` (undefined-as-function), e.g. `:224` (`validateSaveV41`), `:235/239` (`migrateToV41`), `:252/287/290` (`convertV40ToV41`), `:342` (see check 2), `:357/364/369` (`convertV41ToV40`), `:381/393` (`convertV40ToV41`), `:422` (`migrateToV41`). The two "live boundary"/"stamps 41" leaves (`:210-217`) fail on plain `expect` mismatches (40≠41), not on a missing export. The "frozen readers unchanged" pair (`:294-301`) is a genuine **regression witness passing today**.
- **`p13b-rival-scientist-staffing.test.ts`** (2 leaves): both **pass on unchanged production already** — 1308-Q measured this directly against HEAD `7af5412c` (genuinely unmodified, not the scratch draft), showing 4 Scientists/deficit 0 throughout `[266,420]`.

## What I could not verify

- No `git show`/`git diff` was available to me (Read/Glob/Grep only, no Bash), so I could not do a byte-level diff of the five changed files against the exact 7af5412c committed bytes. My "nothing else changed" confirmation rests on reading the full current content of each file and finding it consistent with the described scope, plus cross-checking the specific cited line ranges — not an independent diff.
- I did not run `tsc`, `vitest`, or `vite-node` myself; all execution evidence cited (X, X2, Q, R, P) is the parent's own, read and cross-checked by me against production source where feasible, not re-executed.
- I did not compute/verify the sha256 hashes claimed in the C2 handback's bytes/sha256 table (no hashing tool available to me); I trust those as reported.
- The neighbor file (`1308-stage/neighbors/bridge-p14b6-relationship-read-models.test.ts`) was read only enough to confirm the item-6b citation; its 23 pre-existing failures (stale pins, ENOENT) were not re-investigated — out of scope for this revision per 1308-F item 7.
