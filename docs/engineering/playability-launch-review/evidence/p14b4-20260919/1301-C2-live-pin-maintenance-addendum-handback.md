# 1301-C2 — live-pin maintenance addendum (parent rule 1c), staged

Continuation of 1301-C under the same authority/exclusions, responding to the parent's decision on
finding 2 and the new parent rule 1c. Model: Claude Sonnet 5. **No live-tree edit was made.** No
`vitest`, `tsc`, `node`, `vite-node`, generator or fixture read was run. HEAD at start and end of
this addendum: `d05ce0554c2295a9177380714fa95dfea7e307fd` (unchanged throughout — confirmed by
`git rev-parse HEAD` and empty `git status --short tests/ ui/ src/ bridge/` before, during and
after).

## Parent rule 1c, as received

In a leaf that forges a current-writer save to an unknown future version and asserts the
dispatcher's refusal: the forged version literal becomes **41** (first version past live 40); the
message regex range becomes `1 through 40`; any `unknown saveVersion 39` in the regex becomes
`unknown saveVersion 41`; a title naming those stale numbers is updated to the same numbers
(old/new recorded). Keep literals, never the imported constant. Do not touch a leaf where the
forged version is intentionally historical or derived from `LIVE_SAVE_VERSION` already (example:
`tests/p14b5-save-v31.test.ts:203-204`, which was never in scope — it builds its regex dynamically
from the live constant and needed no correction).

Live confirmation, read directly: `src/core/save.ts:5405-5417` dispatches `saveVersion` 1 through
40 inclusive (including `if (s.saveVersion === 39) return validateSaveV39(save)`, confirming 39 is
now a known version) and throws only outside that range, with the message
`` `validateSave: unknown saveVersion ${JSON.stringify(s.saveVersion)} (this build handles versions 1 through 40 only)` ``.
Since the dispatch chain has no case for 41, any object with `saveVersion === 41` unconditionally
falls through to that throw regardless of its actual state shape — so the correction is valid
independent of which writer built the base object being forged (`makeSave`, a version-specific
`makeSaveVN`, or a migrated-to-VN helper).

## Scope actually applied: 15 files, not 12

The parent named "your twelve `.toThrow(/…versions 1 through 38 only/)` sites." A full grep of
`tests/` and `ui/src/` for every `validateSave({ ...<something>, saveVersion: 39 })` /
`.toThrow(/unknown saveVersion 39...)` combination (commands below) found **three additional
sites** sharing the exact same pattern and the exact same cause, differing only in that their
`.toThrow()` regex is the shorter `/unknown saveVersion 39/` (no `"...through N only"` suffix), so
they were not part of the twelve originally named:

- `tests/d17a-adv-migration.test.ts:274`
- `tests/d17b-save-v7.test.ts:163`
- `tests/contracts/v14-boundary-guards.contract.test.ts:320`

All three forge a current-writer save (`v6` from `migrateToV6(...)`, `makeSaveV7(toV7(...))`,
`envelopeAt(14)` respectively — none are `LIVE_SAVE_VERSION`-derived) to `saveVersion: 39` and
assert `validateSave(...)` throws `/unknown saveVersion 39/`; `contracts/v14-boundary-guards.contract.test.ts:315-317`'s
own comment states the law explicitly: *"the unknown-version boundary moves the same way it always
does — one past whatever the newest live version now is."* This is the identical 1c pattern, so
they were included (Amendment applied by inclusion, not by unilaterally reinterpreting rule 1c —
flagged here for the parent to confirm or veto). One additional forged-literal site,
`tests/save.test.ts:288` (`const bad = { ...save, saveVersion: 39 } as unknown as SaveFileV14; expect(() => loadSave(bad)).toThrow();`),
has **no message regex at all** (`loadSave` is a thin wrapper over `validateSave`,
`src/core/save.ts:6553-6555`); only its forged literal (39→41) and its paired title
(`tests/save.test.ts:283`) were corrected — there is no regex line to touch.

**Excluded, checked and left alone** (same grep pass, confirmed NOT 1c cases):
- `tests/bridge-p06-checkpoint-recovery.test.ts:288` — forges `saveVersion: 99` inside a runtime
  checkpoint's `currentSaveJson`, asserted via `.rejects.toThrow(/unknown saveVersion 99/)`. 99 is
  not "live+1 at authoring time" (it is nowhere near any live boundary this codebase has had) — an
  intentionally arbitrary, permanently-unknown sentinel. Not touched.
- `tests/migration.test.ts:118-121` — `validateSaveV2` (a specific per-version validator, not the
  general `validateSave` dispatcher) called on `{ ...v2, saveVersion: 7 }` with a bare
  `.toThrow()`; this tests "wrong version passed to a version-specific validator," not "unknown
  future version refused by the dispatcher." Not touched.
- `tests/p14p3-directing-promises.test.ts:324,635` — `saves.validateSaveV38({ ...clone(save), saveVersion: 38 })`,
  a specific validator call (not the general dispatcher) proving Director-promise data is refused
  by the frozen V38 reader (`.toThrow(/predicate|promise/i)`), unrelated to the unknown-future-
  version boundary. Not touched (remains KEEP from the original 1301-C pass).
- `tests/p14b5-save-v31.test.ts:203-204` — the parent's own example of an already-correct site
  (dynamic `LIVE_SAVE_VERSION`-derived regex); confirmed unchanged, never in scope.

## Title edits: the semantic rule used, and where it diverges from a naive digit swap

Several titles carry TWO stale numbers with different roles: one naming *the forged/probed value*
(paired with words like "unknown saveVersion N" / "rejects unknown VN"), and one naming *the
regex's handled-range upper bound* (paired with "the handled range \"1 through N only\""). Rule 1c
was applied by concept, not by literal digit substitution: the forged/probed-value number became
**41**, the handled-range number became **40**, regardless of what specific stale digit the title
currently showed (several titles were already inconsistent with their own leaf's code before this
edit — e.g. a title saying "36" while the code's regex said "38" — a pre-existing drift, not
introduced here). Two ambiguous residual numbers were deliberately **left untouched** because they
do not name either of rule 1c's two corrected facts:
- `tests/property-state-v13.test.ts:941` — "...beyond the **current V37** reader boundary..." — the
  "V37" doesn't correspond to the forged value (39→41) or the range bound (38→40) in this leaf's
  own code; left as pre-existing, unrelated commentary.
- `tests/d17b-save-v7.test.ts:161` — "**V7 through V36** are known, so..." — describes this file's
  own covered migration chain, not the general dispatcher range (this leaf's regex has no
  `"...through N only"` clause to anchor a range correction to); left untouched. Its "boundary is
  now 37" clause *is* the forged-value concept and was updated to 41.

Two titles required larger, more visible jumps that are worth flagging explicitly rather than
letting a mechanical diff hide them:
- `tests/script-projects-save-v9.test.ts:413`: "rejects unknown **V38**..." → "...**V41**..."
- `tests/contracts/v14-boundary-guards.contract.test.ts:318`: "...rejects unknown **V22**" →
  "...**V41**" (the code's own forged literal was already 39, not 22, before this edit — an
  eight-version-old pre-existing title/code drift, now resolved to the current live+1 boundary).

One title was checked and correctly left alone: `tests/construction-save-v11.test.ts:546`
("validates original current input and rejects unknown future versions") carries no numeral at
all naming either fact — recorded as a KEEP row in the addendum classification for completeness,
not silently skipped.

## Counts

| | Count |
|---|---:|
| Files carrying a 1c edit | 15 |
| — already changed by 1301-C (edits layered on the C postimage) | 7 |
| — untouched by 1301-C, now changed for the first time | 8 |
| Total line-edits applied | 44 |
| — forged-literal edits (39→41) | 15 |
| — regex edits (38→40 and/or 39→41) | 14 |
| — combined forged+regex on one physical line | 4 |
| — title edits | 14 |
| — titles considered, left unchanged (no qualifying numeral) | 1 |
| Addendum classification rows | 45 (44 CHANGE + 1 KEEP) |
| — rows superseding an original 1301-C **KEEP** decision | 30 |
| — rows new (not in the original 200-row inventory) | 15 (14 real edits + the 1 KEEP no-op) |
| **Final stage2 files (union of 1301-C's 66 + this addendum's 8 new)** | **74** |

## Deliverables (create-only; none of 1301-C's existing files were modified)

- [`1301-stage2/<path>`](1301-stage2/) — 74 files, the **complete final postimage set**: 59 files
  are 1301-C's postimage copied byte-for-byte unchanged (no 1c edit applies), 7 are 1301-C's
  postimage with 1c edits layered on top, 8 are new (live preimage + 1c edits only, since 1301-C
  never touched them).
- [`1301-live-pin-maintenance-final.patch`](1301-live-pin-maintenance-final.patch) — 94,540 bytes,
  SHA256 `80c6e2ceda54edd42c1a8cf493240ec7d819b399cf86f3d59e57686e4faf3003`. Live HEAD → final,
  all 74 files, one `git diff --no-index` hunk set per file concatenated with the `b/` side
  rewritten to the repo-relative path (same method as 1301-C's original patch). **This is the
  patch the parent should apply**; it supersedes `1301-live-pin-maintenance.patch` (1301-C's
  66-file patch, left in place, unmodified, for provenance only).
- [`1301-live-pin-classification-addendum.json`](1301-live-pin-classification-addendum.json) —
  46,742 bytes, SHA256 `cf646fee030d62e083b5bc791cbde967cac655844495e4f8236fefe8cdbdd615`. 45 rows:
  `path`, `line`, `class` (`"1c-future-version-refusal"`), `kind` (`forged`/`regex`/`combined`/
  `title`), `text` (old line), `decision`, `oldValue`/`newValue`, `reason`, `titleChange`
  (`{old,new}` or `null`), `supersededDecision` (the original 1301-C KEEP decision + reason this row
  overrides, or `null` for a genuinely new row), `newRow` (boolean).

### Delta table — the 15 files this addendum touches (full 66-file 1301-C table is unchanged and stays in `1301-C-live-pin-maintenance-handback.md`)

| File | Origin | Live pre bytes | Live pre SHA256 | Final bytes | Final SHA256 | 1c edits |
|---|---|---:|---|---:|---|---:|
| `tests/construction-save-v11.test.ts` | C+1c | 19084 | `ff0e2da598f8d4d6b6af722f2762415f80b454809a2b8530812862789fd0a191` | 19084 | `966a0b5ff211314daa1720eb6f20a37df6d360607e970729b48ab0e8f0f050d7` | 2 |
| `tests/contracts/v14-boundary-guards.contract.test.ts` | 1c-only | 21425 | `7ee859f97c543f09d41b03dda6decaca5af05a5de6a84f681f5b840b35c7519f` | 21425 | `b7f4d227ef90d3762680c2074175ec8d416b0f0e1bc0c1e3ef6c1e22bc17a9c0` | 2 |
| `tests/d17a-adv-migration.test.ts` | 1c-only | 11686 | `76a1c3089ade0d23f341065d3072e08d43f716e64fc8e148ecb09b783e1951d2` | 11686 | `186b5e98e1d30360422a1c30bd8e9e624d07994b8dcd0c370efd7edb6d00b7a3` | 2 |
| `tests/d17b-save-v7.test.ts` | 1c-only | 15527 | `7e585921a9e1a340bba32420dd0f6078c9e0e9cdd15e8d517d5eda98e8e54d24` | 15527 | `ca5ea8f37ceb1e300706ce61a4d30d97e706e31023c0ca72893eb928bc952ad9` | 2 |
| `tests/p13b-r07-save-v25.test.ts` | 1c-only | 20006 | `9c7c05df2f0beb0bbdbb69e92c6789e5f059d15348d8992a5bf4e0863d927be9` | 20006 | `6a1b4b1e5c6b2a6ada07c8d73120dbc2b04283c74794a105c02836ca201e1ffc` | 3 |
| `tests/p13b-s2-save-v22.test.ts` | C+1c | 13998 | `ee91965dfee31125d0e5cde296f8c4909394619af2e4dcec06b97ffb8f329cdb` | 13998 | `767e9651567327fde1cec3760b4b58457e0a15f775687b6a9db9b6ac64215994` | 2 |
| `tests/p13b-s3-save-v23.test.ts` | C+1c | 8069 | `f2bfd8a18b5382804bf7d71f715e3248fcb14a7ab05a38729074e7a880474334` | 8069 | `14be6fe901de9bd55534b71fa6b11d22e8d37b9c0ccfca084f0e21207082ef54` | 3 |
| `tests/p13b-s5-save-v24.test.ts` | C+1c | 16042 | `6af392dd374dd202208067a29d5b2134ce8e68b44e2d6ecd1237772b3cd15e96` | 16042 | `c4b0c21eb9ab946474dbe9982be43c414df85da724757baa84d209978ba1d0e0` | 3 |
| `tests/p13b-s6-save-v26.test.ts` | C+1c | 24039 | `46e9d7048a148b062bb4f95e09358c6c1aaf3c628a5074b9cb81e33d38e168a3` | 24039 | `d762b42b015f7c22a19b68b5a1c81d83bb06dfaaa5f349f4d944ab59d43dd4e6` | 3 |
| `tests/p13b-s8-save-v27.test.ts` | C+1c | 14877 | `acf21e24e037e05070f461e17b702f37f31d92806e2bcc465f79e1b69a506f26` | 14877 | `d3232b13f84f935aec2a072df71ef2f42afaadcff8d3e67f5030cf2e23c588a6` | 3 |
| `tests/p14a1-save-v28.test.ts` | 1c-only | 21551 | `55d11f4c2f6599c4de2d91a1bc81ea6b3126fe9c443a858e2567829278e6954a` | 21551 | `b7910cb1cb556cb4670f51bc8b46c3f3cdbe6111f5f086ae5398793282122911` | 3 |
| `tests/p14b1-save-v29.test.ts` | 1c-only | 11807 | `f19e90e0121500375d1ad8b043daf2b245d895c55f6ead83c226a567ecbf5a82` | 11807 | `b3dc19be03daba096b5c97a993e5a5e07b6dbf9b0568f101e00231c4bccf0443` | 3 |
| `tests/property-state-v13.test.ts` | C+1c | 42083 | `48b740e25eac42f4f893cfbc015c9dd694dca4e5ae18761be4fe05f01e6fe003` | 42083 | `2bb262a4524f182f5471420d5f17d53d81b98ab0f4101c251bbbe6ce47f9298d` | 3 |
| `tests/save.test.ts` | 1c-only | 19145 | `bf292d456673e1ebb29aee276a263e5236ebddbc25897e41b5605081cbd49eac` | 19145 | `e02e6ae84d046c5696c78b851df57d59fd64749ca0babd5bf8a50e9afd8a847c` | 5 |
| `tests/script-projects-save-v9.test.ts` | 1c-only | 21892 | `db958b87a1b5f097626b813c76063286caf798ca24c2e8d12cd9b363b294d127` | 21892 | `3985ec31ba1f054e6da16f352fe4731b1afaf8a3e9bb0c91d08f49d3dd700bae` | 5 |

("C+1c" = 1301-C already staged this file; the 1c edits above are layered on top of 1301-C's own
postimage, verified below to touch *only* the 1c lines. "1c-only" = 1301-C never staged this file;
`1301-stage2/<path>` is live-HEAD-plus-1c-edits directly. "Live pre bytes/SHA256" here is always
the true live-tree preimage, not 1301-C's postimage, so the final patch below applies against the
live tree regardless of origin.) The other 59 files in `1301-stage2/` are exact byte-for-byte
copies of their 1301-C postimage (see 1301-C's own table for their pre/post identities); confirmed
below.

## Proofs (all commands actually run)

1. **Assert-then-write per edit**: for each of the 44 1c line-edits, the script read the correct
   base (1301-C's postimage for the 7 "C+1c" files, the live file for the 8 "1c-only" files),
   asserted the target line's **entire text** matched byte-for-byte the recorded old line (not a
   fragment count this time, since several lines carry the digits "39" twice — once in the forged
   literal, once in the regex — so a full-line equality assertion was used throughout), then wrote
   the new line. Any mismatch would have raised and stopped before any file was written; none did.
2. **Each stage2 file differs from its C postimage only at 1c lines**: for all 7 "C+1c" files,
   `diff` between `1301-stage/<path>` (1301-C's postimage) and `1301-stage2/<path>` was run and
   shows changed-line counts exactly equal to that file's 1c-edit count in the table above (2, 2,
   3, 3, 3, 3, 3 — sums to 19, matching `7` files' portion of the 44 total; the remaining 25
   edits land on the 8 "1c-only" files, 3+2+2+3+5+5+2+3 = 25; 19+25=44). Spot-checked in full for
   `tests/property-state-v13.test.ts` (shown inline above) and `tests/d17a-adv-migration.test.ts`
   (title + one combined forged+regex line, live→final); every other file's diff was generated the
   same way and is reproducible with the commands below.
3. **`git apply --check` of the final patch from the repository root (read-only)**:
   `git apply --check .../1301-live-pin-maintenance-final.patch` → exit 0 ("FINAL CHECK-OK").
   `git status --short tests/ ui/ src/ bridge/` empty immediately before and after.
4. **Independent forward reproduction**: all 74 files' **live preimages** (fresh copies, not from
   either stage directory) were seeded into a scratch tree; `git apply --unsafe-paths -p1
   1301-live-pin-maintenance-final.patch` there → exit 0. Every one of the 74 resulting files was
   re-hashed and compared to its `1301-stage2/` postimage hash in the table above (and the fuller
   66-file table for the 59 C-only files): **0 mismatches (74/74 exact)**.
5. **Complete inverse**, same scratch tree: `git apply -R -p1
   1301-live-pin-maintenance-final.patch` → exit 0. All 74 files re-hashed and compared to their
   true live-tree preimage hash: **0 mismatches (74/74 exact)** — full round trip verified.
6. **Live tree integrity**: `git status --short` shows only this task's newly created evidence
   paths at every checkpoint (before staging, after staging, after both patch generations, after
   both `apply --check` runs, and at handback time). `git rev-parse HEAD` unchanged
   (`d05ce0554c2295a9177380714fa95dfea7e307fd`) throughout this addendum.

## Commands actually run (this addendum)

```sh
git rev-parse HEAD
git status --short
sed -n '5405,5420p' src/core/save.ts
grep -n "^export function loadSave" src/core/save.ts
grep -rn "unknown saveVersion" tests/ ui/src/
grep -rn "saveVersion: 39\|saveVersion: 38" tests/ ui/src/
sed -n '280,292p;451,459p' tests/save.test.ts
sed -n '112,126p' tests/migration.test.ts
sed -n '280,292p' tests/bridge-p06-checkpoint-recovery.test.ts
python3 <exact-line reads (repr) of every target line in all 15 files, cross-checked against the
         original inventory JSON to classify each as superseded vs. new>
python3 <1c edit application: read base (C postimage or live), assert full old-line equality,
         write 1301-stage2/<path>, open(...,'xb') refuses to overwrite>
python3 <addendum classification JSON generation>
git diff --no-index -- <path> 1301-stage2/<path>     # once per changed file
git apply --check docs/.../1301-live-pin-maintenance-final.patch
git status --short
cp <74 live preimage files> scratchpad/1301c/apply-check-final/<path>
git apply --unsafe-paths -p1 1301-live-pin-maintenance-final.patch     # scratch only
python3 <rehash all 74 scratch files, compare to stage2 postimage hashes>
git apply -R -p1 1301-live-pin-maintenance-final.patch                 # scratch only, inverse
python3 <rehash all 74 scratch files, compare to live preimage hashes>
wc -c / shasum -a 256 <every created evidence file>
```

No `vitest`, `tsc`, `node`, `vite-node`, generator, fixture payload read, Git index/ref mutation,
or commit was run at any point.

## Findings 1, 3, 4 — status unchanged

- **Finding 1** (`tests/bridge-p14c2s-scientist-runtime.test.ts:99-100`): stays KEEP per the
  parent's confirmation — not a literal fix (the defect is which validator is called at line 99);
  the broad run attributes it. Not touched here.
- **Finding 3** (the 1301-F Amendment-3 "line 32" vs. actual line 38 prose reference in
  `tests/p14c3-save-v38.test.ts`): noted; the parent will correct its own F prose in 1301-E. No
  further action taken here.
- **Finding 4**: the title-mismatch example this addendum resolves is
  `tests/p13b-r07-save-v25.test.ts:266`, now corrected above as part of the 15-file 1c set. The
  other finding-4 item — the `expect(x, 'message').toBe(N)` inline message string at
  `tests/bridge-p14b8-waiver-surface.test.ts:817` ("P3: each historical slot reaches actual live
  Save39") — is **not** a future-version-refusal form (it is about `hydrated.currentSave.saveVersion`
  tracking live via `loadBridgeRuntimeCheckpoint`'s governed-prior migration, already corrected to
  `.toBe(40)` by 1301-C); per the parent's instruction it is left listed, not touched.

## Return

DONE for the addendum scope. No live-tree edit was made. Created:
`1301-stage2/` (74 files), `1301-live-pin-maintenance-final.patch`,
`1301-live-pin-classification-addendum.json`, this handback. Next concrete action: independent
review of this addendum alongside 1301-C's original handback, then parent application of
`1301-live-pin-maintenance-final.patch` (superseding the original 66-file patch) and the two broad
gates (1302, 1303) per 1301-F's ordering.
