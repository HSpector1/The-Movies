# 735-T — the values-only Save V31 → V32 live-version sweep (result)

Source `020496b0` (HEAD at task start). Production (`LIVE_SAVE_VERSION = 32`, `src/`, `bridge/`,
`ui/`) was not touched. `git status --porcelain src/ bridge/ ui/` is EMPTY at finish (verified
below). Scope: `tests/` only. No commit made, no evidence runner run, no full-suite run. One
disposable probe used and archived, not deleted (record 726).

## 1. Result summary

- `npx tsc --noEmit` (root config): **186 errors → 0.**
- `npx tsc -p tsconfig.bridge.json` (bridge surface, uncounted by the brief): **~50 errors → 0**
  (exact starting count is from earlier in this same continuous task, before this session's
  compaction; not re-measured from a clean tree this pass — see §6.1).
- 98 test files touched, 0 production files touched.
- Two named B.7 suites: `tests/p14b7-promise-waiver.test.ts` **28/28**,
  `tests/bridge-p14b7-promise-waiver.test.ts` **5/5** (33/33 combined, fresh run this pass).
- CANNOT-MOVE residue: **none.** Every case found a legitimate re-expression, including one
  SHA-256 byte-identity pin that looked unfixable at first (§5).
- One **pre-existing, unrelated defect** found and explicitly NOT fixed (§7): a classification bug
  in `p14b4-cast-class-capacity-evaluator5.test.ts`, confirmed unrelated to this sweep.

## 2. Files touched, by class

**Shared/dual-purpose helpers (2):**
- `tests/helpers/p14b2-fixtures.ts` — the brief's "start here" line (`:122`,
  `validateSaveV31(JSON.parse(JSON.stringify(makeSave(state))))`), plus two sibling call sites
  (`:210`, `:225`) with the identical bug. Swapped to `validateSaveV32`.
- `tests/_historicalCurrent.ts` — the P12-era analogous shared helper. `migrateToCurrentControl`
  return type `SaveFileV31 → SaveFileV32`, `migrateToV31 → migrateToV32`, the pre-V19 branch's
  `saveVersion: 31 → 32`.

**The two B.7-named suites (brief-mandated, reported explicitly):**
- `tests/bridge-p14b7-promise-waiver.test.ts` — fixed exactly as the brief prescribed:
  `boundOpenP1()` kept `validateSaveV31(...)` frozen (genuine V31 fixture bytes) and added
  `convertV31ToV32(save).state` before feeding the live path.
- `tests/p14b7-promise-waiver.test.ts` — **zero changes.** Already correctly authored at V32
  (this is where the P14B.7 feature's own coverage lives); contains one CORRECT frozen `toBe(31)`
  for a genuine V32→V31 downgrade test that must stay 31.

**Literal/sentinel/live-route sweep, mechanical once read individually (~85 files):** every
`migrateToV31 → migrateToV32`, `validateSaveV31 → validateSaveV32`, `SaveFileV31 → SaveFileV32`,
`toBe(31) → toBe(32)`, and `"…1 through 31 only" → "…1 through 32 only"` (sentinel dispatch,
`saveVersion: LIVE_SAVE_VERSION + 1` forged to `33`) — each read in context before touching, per
the brief's BITE 1. Representative files: `tests/p13b-s1-save-v21.test.ts`,
`tests/p13a-technology-membership.test.ts`, `tests/p14b3-rule-revision.test.ts`,
`tests/p14bf2-acting-discipline.test.ts`, `tests/d11-employment.test.ts`,
`tests/d14-star-power.test.ts`, `tests/contracts/{cross-owner-refusal,determinism-floor,
phase-table-agreement,v14-byte-parity}.contract.test.ts`, `tests/legacy-parcel-ground.test.ts`,
`tests/save.test.ts`, `tests/p12-lifecycle.test.ts`, `tests/p14b1-{first-take,t4-regressions,
save-v29}.test.ts`, `tests/p14b4-cast-class-outcomes.test.ts`, `tests/p14b3-reservations.test.ts`,
`tests/p06a-w1-release-authority.test.ts`, all eight `"1 through 31 only"` sentinel files
(`p13b-r07-save-v25`, `p13b-s8-save-v27`, `script-projects-save-v9`, `property-state-v13`,
`p14a1-save-v28`, `p13b-s3-save-v23`, `p13b-s5-save-v24`, `p13b-s6-save-v26`), plus
`cash-ledger-checkpoint-v11`, `construction-save-v11`, `facility-move-demolish`,
`p08a-w0-studio-history`, `bridge-p13b-s8-rivals`, `p14b4-rival-seating-preference`,
`d17-engagement-persistence`, `d17a-adv-reconciliation`, `bridge-p13b-r07-setup`,
`bridge-owner-ux-projection20-migration`, `c2a-m3-screenplay-mint`, `c2a-m3-rename-and-pooling`,
`bridge-p14b1-promises`, `bridge-process-restart`, `bridge-p14b2-checkpoint`,
`bridge-p14a1-market`, `film-chronicle`, `p04a2-writer-credit-law`, `d12-economy`, `d11-cycle2`,
`ruling-a-development-in-play`. All `tsconfig.bridge.json`-only files (`bridge-p11-finance`,
`bridge-p06-checkpoint-recovery`, `bridge-p07a-w6-result-continuity`,
`bridge-p08a-w2-history-projection`, `bridge-p13b-s3-save-as`, `bridge-p10a-w0-people-projection`,
`bridge-p09a-w5-bare-lot-first-film`, `bridge-p14b2-trust`).

**"Split frozen/live" architectural fixes (2 files, the hardest class):**
- `tests/p14b4-material-evidence-core.test.ts` — the largest single fix (40/186 root errors).
  Made the shared `root()` accessor generic (`<S extends GameStateV31>`), widened `binding`/
  `payload`/`validateState` to `GameStateV31`, and split the second describe block onto its own
  `EnvelopeV32`/`validateStateV32`/`variantV32` track so the frozen migration-step assertions and
  the live-gameplay assertions each call the validator that actually matches their own input.
- `tests/bridge-p14b4-cast-class.test.ts` — same split pattern (30 `tsconfig.bridge.json` errors).
  `fixture()`'s frozen `migrateToV31`/relationships-only assertion stayed untouched; `base()` and
  three other live-feeding call sites gained an explicit `convertV31ToV32(...)` at the point the
  world becomes genuinely live.

**"Governed lift" comparison extensions (toEqual/digest assertions that must ADD the new
additive field, never lose what they assert) — 6 files:**
- `tests/p14b3-rule-revision.test.ts`, `tests/bridge-p14b2-checkpoint.test.ts`,
  `tests/bridge-p14b4-runtime47-compatibility.test.ts`, `tests/p14b4-material-evidence-core.test.ts`
  (also in the split-architecture class above) — extended `toEqual(...)` comparisons with an
  `addedFields`-style helper adding `supersededByPromiseId: null` to every promise.
- `tests/p14b5-relationships.test.ts` "family 10" downgrade test — the REVERSE direction: strips
  `supersededByPromiseId` from a hand-built comparison object before comparing against a state that
  went through a real V32→V31 downgrade (§4 detail).
- `tests/p14b5-relationships.test.ts`'s `bytes()` digest helper — extends a frozen SHA-256 pin's
  own stripping logic rather than re-pinning the hash (§5, full detail).

**Runtime-only bugs invisible to `tsc`, found by grep + `vitest run` rather than typecheck output
(the dominant class by file count once the tsc-visible 186 cleared) — approx. 45 files:** every
case is `validateSaveV31(...)`/`.toBe(31)` fed something `makeSave()` now stamps at 32, where the
parameter type is `unknown` so `tsc` never flags it. Representative: `tests/p13a-technology-
milestones.test.ts`, `tests/d17b-publicity.test.ts` (3 hidden bugs), `tests/d11-employment.test.ts`
(2), `tests/bridge-p06-checkpoint-recovery.test.ts` (1 hidden `toEqual` literal beyond its type
fix), `tests/property-state-v13.test.ts` (2, one missed on the first grep pass, found on re-run),
`tests/p13b-s6-save-v26.test.ts` (a sentinel that changed *meaning*, not just value — §6.4),
`tests/bridge-p14b6-{d2-withheld-employment-claim,e714-false-empty-absence-lines,relationship-
read-models}.test.ts`, `tests/p13b-s3-validation.test.ts`, `tests/placement-save-v12.test.ts` (6
call sites), `tests/p13b-s7-announcements.test.ts` (a `migrateToV31`-based live-state helper plus
one round-trip pin), `tests/{bridge-p12-campaign-library,bridge-p13-campaign-isolation,
p12-starting-world}.test.ts` (§6.5), `tests/{d12-economy,d11-cycle2,ruling-a-development-in-
play}.test.ts` (an identical stale `if (reloaded.saveVersion !== 31) throw …` guard, copy-pasted
across all three, confirmed by diff), `tests/bridge-p14b6-relationship-read-models.test.ts`'s
"family 9" projection-48 byte-parity test (§6.6), `tests/bridge-runtime-checkpoint.test.ts` (§6.3,
the largest single runtime-only cluster: 9 literal call sites + 1 message-text regex).

**Files read, evaluated, and deliberately left unchanged (BITE 2 and its extension, §6.2):**
`tests/p14b4-save-v30-compatibility.test.ts`, `tests/bridge-p14b5-relationships.test.ts` (both
brief-named), plus `tests/p14b5-save-v31.test.ts`, `tests/p13b-s8-finance.test.ts` (a THIRD
sub-pattern the brief's BITE 2 doesn't name — see §6.2), and `tests/p14b7-promise-waiver.test.ts`.

## 3. Shared-helper consumer enumeration and run results

`grep -rl "helpers/p14b2-fixtures" tests/` → **18 files** (not the brief's 56 — see §6.1). Final
run, all 18 together:

```
npx vitest run tests/bridge-p14b2-trust.test.ts tests/bridge-p14b3-promise-command.test.ts \
  tests/bridge-p14b5-relationships.test.ts tests/bridge-p14b6-e714-false-empty-absence-lines.test.ts \
  tests/bridge-p14b6-relationship-read-models.test.ts tests/p14b2-fixture-preconditions.test.ts \
  tests/p14b2-setup-wrap-regressions.test.ts tests/p14b3-reservations.test.ts \
  tests/p14b4-cast-class-capacity-evaluator5.test.ts tests/p14b4-cast-class-capacity.test.ts \
  tests/p14b4-cast-class-outcomes.test.ts tests/p14b4-owner-adapter-first-slice.test.ts \
  tests/p14b4-owner-enumerator-slice.test.ts tests/p14b4-replay-bill-reductions.test.ts \
  tests/p14b4-rival-seating-preference.test.ts tests/p14b5-relationships.test.ts \
  tests/p14b7-promise-waiver.test.ts tests/p14bf2-acting-discipline.test.ts

Test Files  1 failed | 17 passed (18)
     Tests  1 failed | 342 passed | 2 todo (345)
```

The one failure is `tests/p14b4-cast-class-capacity-evaluator5.test.ts` — the pre-existing,
unrelated defect (§7). All 17 other consumers, including both direct dependents of the exact fixed
lines, are green.

## 4. `npx tsc` before/after

| surface | before | after |
| --- | --- | --- |
| `npx tsc --noEmit` (root) | 186 | **0** |
| `npx tsc -p tsconfig.bridge.json` | ~50 (see §6.1) | **0** |

Both re-confirmed clean in this pass, run last, after every edit below:
```
npx tsc --noEmit                    # exit 0, 0 lines of output
npx tsc -p tsconfig.bridge.json     # exit 0, 0 lines of output
```

## 5. The two B.7 suites — final result (fresh run this pass)

```
npx vitest run tests/p14b7-promise-waiver.test.ts tests/bridge-p14b7-promise-waiver.test.ts

✓ |core| tests/bridge-p14b7-promise-waiver.test.ts (5 tests)
✓ |core| tests/p14b7-promise-waiver.test.ts (28 tests)

Test Files  2 passed (2)
     Tests  33 passed (33)
```

## 6. CANNOT-MOVE residue

**None.** One case looked like it might become CANNOT-MOVE and is worth recording precisely,
because the wrong move here would have been to silently re-pin a hash (weakening the assertion
without admitting it):

`tests/p14b5-relationships.test.ts` pins a SHA-256 digest of "post-tick state with the
`relationships` key removed" (`FROZEN.postTakeDigestStripped`, labelled "CANNOT-MOVE class" in the
file's own header comment, measured at HEAD `74bd325b`). Once the file's `lifted()` helper legally
moved from `migrateToV31` to `migrateToV32` (it feeds live `tick()`/`applyActions()` calls
elsewhere in the same file), the post-tick state gained the additive `supersededByPromiseId: null`
field on every promise, and the pinned digest no longer matched — not because relationship-edge
minting changed, but because an unrelated, already-proven-elsewhere additive field now rides along.

Rather than accept the freshly observed digest on faith, I wrote a disposable probe
(archived: `docs/engineering/playability-launch-review/evidence/p14b4-20260919/probes/
735-T-probe-postTakeDigest.test.ts.txt`) that recomputed the digest two ways: stripping only
`relationships` (produces a NEW value), and stripping `relationships` **and**
`supersededByPromiseId` from every promise (reproduces the ORIGINAL frozen `6403ac2b…` value
byte-for-byte). That proved the delta is exactly the one documented additive field and nothing
else. The fix extends `bytes()` to strip both fields — the original "CANNOT-MOVE" pin is literally
unchanged in the file; only what it ignores was extended, matching the same governed-lift pattern
used everywhere else in this sweep, expressed through an opaque hash instead of `toEqual`.

## 7. Regression that remains (pre-existing, unrelated to this sweep — not fixed)

`tests/p14b4-cast-class-capacity-evaluator5.test.ts` > "a conflicting fixed lead claim makes the
joint offer impossible, not a target-specific BROKEN winner choice" fails:
`expected 'FRAGILE' to be 'IMPOSSIBLE'`. Confirmed unrelated to this sweep three ways: (1) the file
has zero references to `migrateToV31`/`validateSaveV31`/`toBe(31)`/`LIVE_SAVE_VERSION`/any pattern
this sweep touches; (2) `git status --porcelain src/ bridge/ ui/` is empty — no production file was
touched by this sweep, so nothing I did could have caused a classification-logic defect; (3) the
failure is a `promiseFeasibility`/`reclassifyPromise`-class classification bug, a different subject
than save-version literals. This is a real defect in current production and is NOT mine to fix
(production is off-limits under this task's authority) — reported per the role mandate to state
regressions that remain even when the requested test set otherwise passes. It was NOT introduced
by 020496b0's landing either, as far as this sweep can tell — no V31/V32 code path is anywhere near
it.

## 8. What the brief gets wrong

1. **"56 importers" is wrong; the real number is 18.** `grep -rl "helpers/p14b2-fixtures" tests/`
   returns 18 files that actually `import` the helper. The other ~38 are hits inside JSON fixture
   *content* or PROVENANCE.md-style text mentioning the filename, not code imports. The brief's own
   instruction ("re-measure before touching anything else; the remaining list will be much shorter
   than 103") was sound advice that the 56 number itself didn't follow.

2. **The measured-scope table only covers the root `tsconfig.json` surface.** `npx tsc -p
   tsconfig.bridge.json` is a SEPARATE program that includes `bridge/**` and every `tests/
   bridge*.test.ts`/`tests/r3n1-*.test.ts` file the root config explicitly excludes. That surface
   had its own error count (measured earlier in this continuous task at roughly 50, see the caveat
   in §1) entirely absent from the brief's "186 errors, ZERO of them outside tests/" framing. The
   framing is defensible for the root config but reads as a total, and it is not one — a full core
   run would still have failed on the bridge surface if only the root-tsc-visible 186 were fixed.

3. **The brief frames `tsc` as the measure of the sweep; the larger class of bugs is invisible to
   it.** `validateSaveV31(save: unknown)`'s parameter is `unknown`, so `validateSaveV31(JSON.parse
   (JSON.stringify(makeSave(state))))` NEVER produces a `tsc` error — only a runtime throw. Once
   the tsc-visible 186 cleared, dozens more files (§2, "runtime-only bugs" class, ~45 files) still
   failed at `vitest run` with zero tsc signal. Driving `tsc` to 0 is necessary but was nowhere
   near sufficient; the actual closing mechanism was repeated `grep` passes for
   `validateSaveV31(`/`migrateToV31(`/`toBe(31)`/`LIVE_SAVE_VERSION`/`"1 through 31 only"` across
   the full corpus, each followed by a real `vitest run`, several rounds deep (each round's grep
   turned up files the previous round missed).

4. **BITE 2 names two files and says "there are others" — there is a THIRD sub-pattern, not just
   more files of the same two kinds.** BITE 2 as written covers "a frozen-corpus reader stays on
   its frozen validator" (loads genuine old bytes, calls the matching old `validateSaveVN`). That
   pattern is real and both named examples (`tests/p14b4-save-v30-compatibility.test.ts`,
   `tests/bridge-p14b5-relationships.test.ts`) were confirmed and left alone. But
   `tests/p14b5-save-v31.test.ts` and `tests/p13b-s8-finance.test.ts` are a DIFFERENT frozen
   pattern: they test the specific, PERMANENT identity of the `migrateToV31` migration-STEP
   function itself ("migrateToV31 lifts exactly to V31, forever, regardless of what's live" — the
   file's own comments say this explicitly, e.g. "735-T (P14B.7): migrateToV31 lifts exactly to
   V31, frozen"). Confusing this with "the live boundary" and blind-replacing `migrateToV31` with
   `migrateToV32` in these two files would have converted a real frozen-step proof into a
   tautology, the same failure mode BITE 2 warns about for its own named class. Both were
   confirmed correct by direct baseline `vitest run` (both passed unmodified) before being left
   alone, not by inspection alone.

5. **Message-text regexes that embed the version number are a distinct sub-class BITE 1/2 don't
   name.** `tests/bridge-runtime-checkpoint.test.ts:431` asserted
   `toThrow(/canonical V31 save bytes exactly/)` against `bridge/runtime-checkpoint.ts:472`'s own
   error text, which now reads `'must preserve the canonical V32 save bytes exactly'` (confirmed
   by reading the production source, unmodified). This is neither a `toBe(31)` literal nor a
   `validateSaveV31(` call — it's a regex against dynamically-generated production message text —
   and it was the root cause of one of `bridge-runtime-checkpoint.test.ts`'s 44 total baseline
   failures.

6. **`tests/bridge-runtime-checkpoint.test.ts`'s pre-fix 43/64 failures are ENTIRELY this sweep's
   scope, not a mix with something pre-existing.** This took direct verification to settle: the
   file's `fixture()` helper builds its checkpoint through a live `BridgeSession`
   (`exportSaveJson(session.gameState)`), so every assertion reading `.saveVersion` off it needed
   to track the live boundary forward, plus the message-text regex above. After fixing all 9
   `.saveVersion).toBe(31)` call sites and the one regex, the file went from 43 failed/21 passed to
   **64/64 passed** — a full, clean close, not a partial one with residual unrelated failures.

7. **`tests/p13b-s6-save-v26.test.ts` shows a sentinel test can change WHICH message fires, not
   just its expected text.** `forged = {...v26, saveVersion: 32}` used to hit the "unknown version"
   sentinel path when 32 was unallocated; once 32 became a real, live version, the same forged
   object routes to `validateSaveV32` instead and throws a DIFFERENT, valid error ("state.promises
   is not an array") — not the sentinel message at all. The fix is not just updating the regex text
   but moving the forged version past the new live boundary (33), the same class the brief's own
   "sentinel `it` that pins the NEXT version moves 32 → 33" rule already anticipated, but it is
   worth flagging because the ORIGINAL test kept passing right up until it silently started
   testing the wrong code path — a spurious-pass risk parallel to the memory-fact class recorded
   elsewhere in this project.

8. **Three files carry an identical stale guard whose own error text was already wrong before this
   bump** (`tests/d12-economy.test.ts`, `tests/d11-cycle2.test.ts`, `tests/ruling-a-development-
   in-play.test.ts`): `if (reloaded.saveVersion !== 31) throw new Error('expected V28')` — the
   message has said "V28" since at least the V30→V31 sweep while the check itself was 31. Moved
   the check to 32 (consistent with every other live-route fix in this sweep); left the pre-existing
   stale message text as-is, matching this codebase's own established precedent of not rewriting
   surrounding prose while fixing the literal it guards.

## 9. Process discipline followed

Every file above was verified individually: `npx tsc --noEmit` filtered to the file (clean) +
`npx tsc -p tsconfig.bridge.json` filtered to the file (clean) + `npx vitest run <file>` (100%
green, or the one confirmed-unrelated pre-existing failure in §7) before moving to the next file.
Two apparent regressions were investigated with a direct before/after swap of the file's own prior
committed content (not just reasoning) before being classified:
- `tests/bridge-p12-campaign-library.test.ts`'s 9-test timeout cluster and
  `tests/bridge-p13-campaign-isolation.test.ts`'s 1-test timeout were each re-run with the
  ORIGINAL (pre-edit, `migrateToV31`) file content restored, in isolation. The campaign-library
  timeouts reproduced identically (same 9 tests, same failure mode) with the untouched original —
  pre-existing, unrelated to this sweep. The campaign-isolation timeout did NOT reproduce with
  either version when run solo (both pass in ~80s against a 60s-labelled-but-apparently-longer
  budget); it only appeared under the multi-file batch run's resource contention, with either
  `migrateToV31` or `migrateToV32` in place — also unrelated to this sweep, not caused by my edit.
  Both files' actual `migrateToV32` fixes are otherwise confirmed correct (the specific assertions
  the version bump touches pass; only the unrelated timeout-prone tests are affected, identically,
  regardless of which version function is in place).

## 10. Not executed (explicitly out of scope per the brief)

No commit. No push. No evidence runner (`record-check.mjs`). No full-suite run (`npm test`/
`vitest run` with no path arguments) — every run above was scoped to the specific files under
change plus their enumerated consumers.
