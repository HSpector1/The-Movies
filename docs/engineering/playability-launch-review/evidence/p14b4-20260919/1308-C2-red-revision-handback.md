# 1308-C2: dry-run-driven revision of the staged R2/R3 RED tests — handback

Independent-test-engineer authored, mode IMPLEMENT (staged test source + evidence only — no
live-tree edit, no execution). Worktree `/Users/zacheryspector/The-Movies-headless-program`,
branch `wip/headless-program-20260916-ts`, HEAD `f72a47e138f0894fbdf217fcf68e527e06a0a461`
(production unchanged since 1308-C). Read in full per the coordinator's instruction:
`E/1308-F-parent-red-adoption.md`, `E/1308-D-combined-red-review.md`,
`E/1308-X-parent-draft-dry-run.md` with `E/1308-X-draft-dry-run.txt`,
`E/1308-Q-scientist-deficit-probe.txt` (and its producer `.ts`), `E/1308-R-prior-roster-probe.txt`
(and its producer `.ts`). No `vitest`/`tsc`/`vite-node`/`node` was run by me. All six required
changes from `E/1308-F-parent-red-adoption.md` are applied below, all measured facts are taken
directly from the parent's own probe outputs (never re-derived by me), and item 7
(`tests/p13b-s7-announcements.test.ts`, and every class-a 1302-I/1303-I row) was **not**
touched, per instruction.

Same write scope as 1308-C: only `E/1308-stage/**` (revised in place) plus this new handback.
`docs/engineering/playability-launch-review/evidence/p14b4-20260919/1308-C-red-revision-handback.md`
(the prior handback) is left untouched, superseded by this file for the six items below.

## Staged files: bytes and sha256 (current, after 1308-C2)

| File | Bytes | SHA-256 | Changed this round? |
|---|---:|---|---|
| `1308-stage/tests/p14a1-release-busy-set.test.ts` | 23226 | `4eb02b8e43cf17dd07b14eb76e9d3ee4dfda97ae2e7a0f6cf615790b93cbf170` | No (11/11 on the draft) |
| `1308-stage/tests/bridge-p14a1-release-busy-set.test.ts` | 21017 | `d8e55f123098bb1327b8ecb041adace9bd080bd69cfe8f7dd0b238f1ce0d7ed1` | **Yes** (item 2) |
| `1308-stage/tests/bridge-p14r2r3-prior55.test.ts` | 12867 | `8673bc3b58cbe658d76c3db254a2e8c38918c8aabb0fea4e050d565ea439f6cb` | **Yes** (item 1) |
| `1308-stage/tests/p14r3-rival-release.test.ts` | 28511 | `ba6ad04787330fe6bf7afd0ad4c84165cce406f2a5fbc7003bd749245062b7ad` | **Yes** (items 3, 6a) |
| `1308-stage/tests/p14r3-save-v41.test.ts` | 29124 | `2c505afb15406153b166b29c6fa39dd1e40ab4b6ac5f52350da914c6bedb544e` | **Yes** (item 5) |
| `1308-stage/tests/p13b-rival-scientist-staffing.test.ts` | 10607 | `54b546af7dbfa6402c14318a4cd915dc79eb274ac4a147ff87c0413468d44d82` | **Yes** (item 4) |
| `1308-stage/neighbors/bridge-p14b6-relationship-read-models.test.ts` | 62894 | `9ffe87d9fd9fb19b3f6c47f282546f85fc5e804ff6ee0c830dc5a4c86f0dc842` | No (its 23 failures on the draft are pre-existing stale pins/scratch ENOENT, unrelated to this revision, per 1308-X's own reading) |

Bytes/sha256 computed via `wc -c` / `shasum -a 256` immediately after writing, 2026-09-28. The
five changed files were diffed with `git show f72a47e1:<path>` (the exact 1308-C committed
bytes) as the "before" side.

---

## Item 1 — `bridge-p14r2r3-prior55.test.ts`: older-roster pin (1308-D required change 1 / 1308-F item 1)

Diff vs the 1308-C committed version: +16/-0 lines, one new import
(`canonicalJson` from `../bridge/schema/canonical.ts`) and one new assertion block inserted
after the existing `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID)` check, before the
`loadBridgeRuntimeCheckpoint` call. Nothing else in the file changed.

Added, mirroring `tests/bridge-p14p4p5-opportunities.test.ts:461-465`'s B55-3 leaf exactly
(same filter/sort/hash technique, independently re-confirmed against
`1308-R-prior-roster-probe.ts`'s own producer source, byte-for-byte identical method):

```ts
const older = [...SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS].filter(([id]) => id !== OLD_SCHEMA)
  .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
expect(older).toHaveLength(43)
expect(sha(canonicalJson(older))).toBe('11ec9999e052d8e6ce6dbdbb08060d57ad3a7dbb45335182c85806c4d88e4e51')
```

**Predicted status:** already-true today (measured identically on the unchanged engine AND the
parent's scratch draft, 1308-R: `olderLength 43` / `olderSha` identical on both; only `total`
differs, 43→44, from the one new entry the draft's increment adds). This is a regression guard,
not a new RED cause — it protects the other 43 pre-existing prior-schema entries from being
silently dropped or reordered while the one new v55 entry is added, exactly as 1308-D
requested.

---

## Item 2 — `bridge-p14a1-release-busy-set.test.ts`: `seatedFixture` fixture-route fix (1308-X defect 1 / 1308-F item 2)

Diff vs the 1308-C committed version: +71/-36 lines. `founded()`/`foundMinimum()` (the
managed-studio route: `beginFounding` → sign `FOUNDING_MINIMUMS` → `foundStudio` →
`activateStudioOperations`/`activateScriptDevelopment`/`activateCastingSessions`) are deleted
entirely, along with the now-unused `FOUNDING_MINIMUMS` import. `seatedFixture` is rebuilt to
reach its active production the SAME way `tests/p14a1-release-busy-set.test.ts` (the companion
Core RED file) does: `p13aGeneratedStudio(seed)` + `signOneOfRole`/`signTeam` (walk the
rotating hiring market for writer/director/3×actor/craft, sign each) + `fundTo(...,
30_000_000)` + `greenlight` directly — no managed-studio activation at all. Three new helpers
(`fundTo`, `signOneOfRole`, `signTeam`, `type Team`) are added, copied in shape from the Core
file's own already-reviewed versions (1304-D "Premise reachability (check 2)... good
practice"). `tick` is newly imported (`../src/core/tick.js`) for `signOneOfRole`'s market-walk
loop. **All five seated leaves' assertions are byte-unchanged** — only the fixture-construction
path changed, per 1308-F's explicit "the five seated leaves keep their assertions."

**Cause (measured, 1308-X-draft-dry-run.txt:30-31,104-114):** `founded()`'s
`activateScriptDevelopment` puts the studio in managed mode, and `applyGreenlight` (via
`requireGreenlightHeader`) then requires an authoritative Ready script project before ANY
greenlight (`src/core/productionAdmission.ts:108`) — this fixture's direct-package draft has
no such project, so every seated leaf's `seatedFixture()` call threw "applyActions: greenlight
rejected — managed studios must greenlight an authoritative Ready script project" before any
R2 assertion ran, on BOTH engines (unchanged and draft alike — a test-side defect, not
something R2's own implementation could fix).

**Predicted status after the fix:** the five seated leaves (director/lead/antagonist/
support/craft) return to being genuine RED against unchanged production, for the SAME reason
1304-D already characterized them (`releaseRefusal` has no seat check today, so
`decision.releaseAvailable` is `true`, the quote accepts, the command commits) — the fixture
now REACHES that assertion instead of throwing earlier. Unverified residual: I could not
execute to confirm the five NEW per-leaf seeds (`1304c-bridge-seated-director` etc., each
distinct from the Core file's own seeds) reliably find all six roles in the hiring market
within `signOneOfRole`'s 60-tick bound — this mirrors an already-validated mechanism (11/11 on
the Core file, same routine, different seed strings) but was not independently re-executed.

---

## Item 3 — `p14r3-rival-release.test.ts`: Scientist-surplus premise week 265→266 (1308-X defect 2 / 1308-F item 3 / 1308-Q)

Diff vs the 1308-C committed version: +39/-18 lines, scoped to (a) the top-of-file header
(new "1308-C2 REVISIONS" paragraph), (b) the "Scientists are never R3-surplus" describe
block's comment and `advanceTo(withPlayerLab, 265)` → `advanceTo(withPlayerLab, 266)` (and the
`atWeek265` variable renamed `atWeek266` throughout that one `it()`), and (c) item 6a below
(the LAW UNDER TEST item 4 rewording). No other leaf changed.

**Cause (measured, 1308-Q-scientist-deficit-probe.txt, unchanged engine, HEAD `7af5412c`):**
"265 r01 sci 0 deficit 4 cashOK true" / "266 r01 sci 4 deficit 0 cashOK true" (and every week
267-420 the same). The sibling file's own "four Scientists seated week 265" header fact is the
RECEIPT week written during the tick that PROCESSES week 265, not the STATE at week 265 before
that tick runs — the state-week premise needed correcting, not the underlying claim.

**Predicted status after the fix:** the leaf's own precondition
(`expect(scientistIds.length).toBeGreaterThan(0)`) now holds at state week 266 (measured, not
assumed); the rest of the leaf (no team-role surplus present, no scientist ends this week, no
rival termination receipt) is unaffected by the week move and stays an already-true regression
witness, same classification as before.

---

## Item 4 — `p13b-rival-scientist-staffing.test.ts`: premise + window week 265→266, 265-270→266-420 (1308-X defect 2 / 1308-F item 4)

Diff vs the 1308-C committed version: +57/-33 lines. Full rewrite of the premise leaf (week
266, not 265) and the deficit-witness leaf (window 266-420, the FULL 1308-Q measured range,
not the previously invented 265-270 sub-window); the affordability definition is also changed
from a `+$2,000,000` margin to the bare `cash > reserve` the parent's own probe used, so this
leaf's "affordable" set matches exactly what was measured rather than diverging with an
independently invented cushion. The mechanism/caveat reasoning (deficit-zero ⇔
`employed>=min(capacity,demanded)`, no-overshoot argument) is unchanged from 1305-C's own
authoring.

**Header now states the expected outcome explicitly, per 1308-F item 4:** "on the measured
route this leaf is EXPECTED TO PASS" — 1308-Q shows deficit 0 for r01 at every state week in
[266,420] with `cashOK` true throughout; the 1305-F hypothesis is NOT witnessed on this route,
and per 1305-F/1308-F no production correction follows from an unwitnessed hypothesis. This is
recorded as an honest, correctly-classified non-RED leaf (a passing witness), not glossed over
or hidden as if it were RED.

**Predicted status:** the precondition leaf (4 Scientists at week 266) is expected to PASS
(measured fact, 1308-Q). The deficit-witness leaf is expected to PASS across the full window
(also measured, 1308-Q shows zero deficit at every week with `cashOK true`) — a genuine,
informative non-witness of the suspected defect, not a broken test.

---

## Item 5 — `p14r3-save-v41.test.ts`: lawful-route replacement for the receipt-only downgrade leaf (1308-X defect 3 / 1308-F item 5)

Diff vs the 1308-C committed version: +69/-21 lines. Three changes:

1. New imports: `terminationCost` (`../src/core/employment.js`), `tick`
   (`../src/core/tick.js`), `advanceTo` (added to the existing `p13aGeneratedStudio` import
   from `../src/harness/p13a/fixtures.js`).
2. New helper `lawfulTerminatedSave()`: `p13aGeneratedStudio()` (default seed) → `advanceTo(22)`
   → the ONE labeled `Talent.role` rewrite of `person-<row2>-5` (`'craft' → 'actor'`, the SAME
   trigger and the SAME week `p14r3-rival-release.test.ts`'s happy-path leaf uses) → one real
   `tick()` → the person's role restored (`'actor' → 'craft'`) → `makeSave`. The rewrite and
   the restoration are labeled TOGETHER as the one synthetic trigger bookending a single real
   engine tick, per 1308-F's own phrasing.
3. **New describe block** ("a genuine rival release (lawful route) validates under V41 with the
   exact charge, and is refused by the frozen V40 reader") asserting: `validateSaveV41` admits
   the save; the row-2 business's period `termination` movement equals
   `-terminationCost(before.terms, 22)`; relabeling `saveVersion` to 40 on the SAME save content
   is refused by `validateSaveV40`. **Replaced leaf**: the receipt-only downgrade tamper (which
   forged a receipt with the matching movement left at 0, on an otherwise-genuine V40→V41
   migration) is deleted and replaced with `expect(() => convertV41ToV40(lawfulTerminatedSave().save)).toThrow(/termination/i)`
   on the SAME lawful-route save. The movement-half downgrade leaf and both `validateSaveV41`
   forgery leaves are **unchanged** (1308-F: "stay").

**Cause (measured, 1308-X-draft-dry-run.txt:15-16,566-581):** the deleted tamper constructed an
employment row ended by a matching receipt but left `movements.termination` at 0 — that
combination is not itself a valid V41 envelope (V41's own reconciliation rule requires a
nonzero movement whenever a termination-reason receipt exists in that period), and every house
`convertVNToVN-1` validates its input before converting (the established idiom), so the
refusal surfaced the VALIDATOR's own interval-consistency failure
("`validateSaveV37: ... Hollywood save: active employment index differs from contract
interval`"), never reaching a `/termination/i` message. This was a genuine construction defect
in the tamper, not a defect in the law under test — the parent's own scratch smoke confirmed
the lawful route validates under V41 and IS refused by name on downgrade.

**Predicted status:** import-level RED for all leaves touching the four new `save.ts` exports
(unchanged reasoning from 1308-C). The two NEW assertions in the "genuine rival release" block
additionally depend on R3's happy-path logic actually existing (same dependency the
`p14r3-rival-release.test.ts` happy-path leaf has) — so on unchanged production this leaf fails
at the import-level boundary exactly like its siblings, and once R2/R3/Save41 all land
together it becomes a real, meaningful assertion of the charge/reconciliation/downgrade chain.

---

## Item 6 — non-blocking header/phrasing corrections (1308-D check 2 / 1308-F item 6)

### 6a — `p14r3-rival-release.test.ts:45-46` (law vs. strategy)

Corrected the "LAW UNDER TEST" item 4 from "R2 binds rivals: a person seated on the rival's
own production/writing/**research** seat cannot be released" to the exact 1305-A quote: "R2
binds rivals: a person seated on the rival's active production or writing for it cannot be
released" (production and writing ONLY), with an added note that the research-seat exclusion
is the STRATEGY's own stricter choice (1305-A: "the strategy is stricter than R2 and never
touches a research seat, so no rival research release handler is needed"), not part of R2's
law. No leaf in the file ever asserted a legal refusal for a research-seated rival release, so
this is a header-accuracy fix only — no assertion changed.

### 6b — tightened phrasing in this handback about `state.relationships` (the neighbor row)

1308-D's check 6 flagged that the 1308-C handback's own two adjacent sentences about the
neighbor fix were individually true but easy to misread together: one said `applyCancel`
"clears the seat ... without touching `state.relationships` or `state.hollywood.employment`,"
and the very next sentence disclosed that `applyCancel` DOES call
`recordCancelledAfterFirstTake`, which writes to `state.relationships`. Both sentences are
correct once parsed carefully (the first is scoped to the seat-REMOVAL step specifically —
the object spread over `studio`/`operations`/`technology`/`scriptDevelopment` — not to
`applyCancel` as a whole), but the juxtaposition reads as if the function never touches
`state.relationships` at all. Restated precisely for this handback and for the record: **the
seat-removal step inside `applyCancel`** (the spread that drops the production from
`state.studio.activeProductions`) does not itself read or write `state.relationships` or
`state.hollywood.employment`. **`applyCancel` as a whole**, however, DOES write to
`state.relationships` via its final call to `recordCancelledAfterFirstTake`
(`src/core/relationships.ts:320-329`, confirmed by full read) whenever the cancelled production
already has a first take — which `prod-0052` does. This is the disclosed
`cancelledAfterFirstTake` side effect already named in the 1308-C handback; it is not asserted
on either way by the neighbor leaf itself (which checks edge EXISTENCE only, never its
tier/closeness/driver content), so it does not affect the leaf's own correctness — only the
handback's prose needed tightening, and no code changed for this item.

The neighbor's staged fix itself (`E/1308-stage/neighbors/bridge-p14b6-relationship-read-models.test.ts`)
is byte-unchanged this round — only this handback's description of it was corrected.

---

## Not touched (per instruction)

`tests/p13b-s7-announcements.test.ts:87` and every class-a row of 1302-I/1303-I — carried to
the later pin sweep, per 1308-F item 7. No file outside `E/1308-stage/**` and this handback was
written or modified.

## What I could not verify

No execution anywhere in this pass (Read/Glob/Grep/Bash-for-hashing only, per mode). Every
"predicted status" above is read from the parent's own probes/dry-run output
(`1308-X-draft-dry-run.txt`, `1308-Q-scientist-deficit-probe.txt`,
`1308-R-prior-roster-probe.txt`) plus source reads at HEAD `f72a47e1`, not an observed run by
me. Specifically not independently re-executed: the five new per-seed `seatedFixture()` calls
in item 2 (residual risk named there); the `lawfulTerminatedSave()` route's actual behavior
once R2/R3 land (depends on the not-yet-written production increment, same as every other
happy-path-dependent leaf in this batch); whether `convertV41ToV40`'s real refusal message on
the lawful route matches `/termination/i` exactly as the parent's scratch smoke reported (I
trust the parent's own measurement, cited above, not independently reproduced).

## Summary

DONE. All six 1308-F items applied in place under
`docs/engineering/playability-launch-review/evidence/p14b4-20260919/1308-stage/`; item 7 left
untouched. Five files changed (bytes/sha256 and diffstats above); two files unchanged
(`p14a1-release-busy-set.test.ts`, the neighbor copy). No file under `tests/`, `src/`,
`bridge/`, or `ui/` was touched; production remains unchanged at HEAD `f72a47e1`.
