# 757 — P14B.8 QUALIFIED CHECKPOINT: the waiver's player surface

Source `c368e6b1` (implementation) verified by run `755-b8-full-core` at `3cae7c93`, which is that
source plus one docs-only commit. `fixedSource: true`, empty tree diff at both ends (patch 0 bytes).
Span `4a268feb..3cae7c93`.

## 1. The player behaviour this slice completed

A studio that can no longer keep an open promise could, before B.8, reach the waiver only through a
TypeScript function call. It can now do the whole thing:

> select an open promise → propose a substitute → receive an accurate quote or the specific refusal
> → confirm → see the original marked WAIVED and the replacement recorded beside it, with the typed
> link between them.

All eight clauses of the completion condition at 744 §2 are met and tested. The suite is
`tests/bridge-p14b8-waiver-surface.test.ts` (32) and `tests/p14b8-waiver-surface-oracle.test.ts`
(12): **44 passed (44)**, verified by the parent on the finished tree, not taken from the writer's
report.

## 2. Identities

| | before | after |
| --- | --- | --- |
| projection | 49 | **50** |
| schema id | `sha256:60af24c5…` | **`sha256:e2d354dcbae1a6dc93a2367756512c14243b11be202a26107de0c81a4f3e0698`** |
| prior roster | 37 | **38** (`60af24c5…` registered as `projection-v49`) |
| save version | 32 | 32, UNMOVED |
| promise rules | 4 | 4, UNMOVED |
| protocol | 4 | 4, UNMOVED |

`git status src/` is EMPTY. B.7 moved the save without moving the wire; **B.8 is its exact mirror,
moving the wire without moving the save**, and no engine law moved in either direction.

The registration rode the SAME commit as the bump, as 45/46/47/48 all did. The genuine outgoing
artifact was minted BEFORE the bump (`4cba7090`) while 49 was still the running identity and its
schema was not yet a prior.

## 3. The finding that justified auditing this slice

Neither `waiverAccepted` nor `waivePromise` compares a promise's `issuerStudioId` to anything.
`waivePromise` resolves by id alone and ids are `promise-<index>`, sequential and enumerable.

**Measured, not argued.** On `genuine-v31-with-edges`, `waiverAccepted` returns NULL for a
rival-issued `promise-1`, and `waivePromise` settles the rival's promise WAIVED and mints
`promise-48` bound to the rival's own employment contract. 48 promises become 49 and the player's
studio is named nowhere. `trustDrivers` mints nothing for WAIVED so the rival's trust does not move,
and the viewer-scoped read models filter the rows out, so nothing surfaces.

B.8 creates the first client route to that verb, so B.8 owes the gate. It lives in
`bridge/promises.ts` and nowhere else, refuses at the quote AND again at the commit, and answers a
rival's id exactly as it answers an unknown one, so the response never confirms the promise exists.

That engine null also settled the refusal's SHAPE, which the expansion had left open: there is no
engine sentence to publish, so the refusal cannot be an accepted `ok:false` quote the way every
other family's is. It is `ENGINE_REJECTED`.

## 4. Verification

Run `755-b8-full-core`, `fixedSource: true`, exit 1 (failures present, as expected).

| | run 739 (B.7) | run 755 (B.8) | predicted (754) |
| --- | --- | --- | --- |
| test files | 10 failed / 345 passed (355) | **10 failed / 347 passed (357)** | 9 failed / 348 passed (357) |
| cases | 25 failed / 4010 passed / 8 todo (4043) | **25 failed / 4060 passed / 8 todo (4093)** | 24 failed / 4055 passed / 8 todo (4087) |

**The failure-NAME set is IDENTICAL to run 739: 50 distinct failure lines in both, ZERO new, ZERO
vanished.** That is the instrument the prediction named, and it held exactly.

**The prediction was falsified on the counts, and the cause is the parent's arithmetic, not the
run.** Attributed per file rather than waved at:

| source | cases |
| --- | --- |
| run 739 baseline | 4043 |
| `4a268feb`, B.7's own gap closure, landed AFTER run 739 | +5 (`p14b7-promise-waiver` 28 → 32, `bridge-p14b7-promise-waiver` 5 → 6) |
| `bridge-runtime-checkpoint.test.ts` 64 → 65 | +1 |
| B.8's two new files | +44 |
| **total** | **4093** |

The `+1` is the one worth naming. `bridge-runtime-checkpoint.test.ts:758` is
`it.each(Array.from(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.entries()))`, one case per registered
prior identity. Registering `projection-v49` therefore adds exactly one case, from a four-line data
edit with no new `it()` anywhere. The writer authored no test, which was checked directly: added and
removed `it(` lines across every swept file are 5 and 5, all title renumberings.

Prediction 754 predicted 4087 because it used run 739's total as the baseline without accounting for
the five cases B.7's own gap closure added after that run, and without anticipating the data-driven
case. Recorded as a parent error.

### The five named falsifiers

1. **A new failure name that is not FU-2** — none. CLEAN.
2. **An inherited failure that vanishes** — none. CLEAN.
3. **A file count other than 357** — 357. CLEAN.
4. **A case count other than 4087** — 4093. **TRIGGERED**, attributed above.
5. **Any failure inside a swept file** — none. The 10 failing files and the 37 test files B.8 touched
   have an EMPTY intersection. CLEAN, and this is the falsifier that would have unmade the parent's
   own residue verification.

### Residue, run by the parent rather than accepted from the writer

All eight grep classes return ZERO: `PROJECTION_VERSION).toBe(49)`, `SNAPSHOT_VERSION).toBe(49)`,
`snapshotVersion).toBe(49)`, `projectionVersion).toBe(49)`, `ProjectionVersion = 49`,
`projectionVersion: 49`, bare `toBe(49)`, and any `49` inside a `toThrow` regex. Every surviving
`60af24c5…` reference reads as OUTGOING or prior. `git status tests/fixtures/` is EMPTY: no minted
evidence moved, and the per-line split held, with `bridge-runtime-checkpoint.test.ts` keeping its
frozen comment at `:974` while its roster assertion gained the new id.

Typecheck root 0, `tsconfig.bridge.json` 0, `ui/tsconfig.json` 0. `npm run check:bridge-contract`
verified all three generated artifacts against the running identity.

## 5. FU-2 recurred, and record 741 is confirmed rather than falsified

The 25th failure is the same prepared-reuse timeout, same test, at **20305ms against the 20000ms
budget**. The file's total cost is stable across runs: 177669ms here against 180289ms in run 739, a
1.5% difference. Record 741 diagnosed the operation at 13328-14278 ms alone with contention
multiplying that file 1.67x-1.74x against a budget only 1.412x the operation cost, so the crossing
point sits inside ordinary contention. A 305ms overshoot is exactly that, and not a regression.

**Tally across recent full runs: failed in 739, failed in 755, passed in 737.** Two of three. That
strengthens the recorded recommendation to align this budget to the repository's own restart-class
convention of `60_000` (`bridge-process-restart.test.ts`, observed to 21929ms and passing), which
would make `20000` no longer the outlier. **The threshold was again NOT moved**: the Owner said
retain it, and nothing since has changed that instruction. The disposition stays open.

## 6. What this checkpoint does not claim

- **UNITY NOT VERIFIED.** 44 green cases is a wire claim, not a playtest. The bump regenerated the
  C# DTOs and the backlog entry records the consumer changes, but no Unity control exists for the
  waiver and none was run.
- **The `ui` project was NOT run.** FU-1 has not returned and no UI-affecting claim rests on this.
- **The 24 other inherited failures are untouched and none is B.8's.** One of them,
  `p14b4-cast-class-capacity-evaluator5`, is a live wrong answer rather than a deferral and is named
  as the next concrete obligation at record 756.
- **Three disclosed coverage limits carried from B.7 are unchanged**: the natural waiver route, rule
  3, and the rules 4/5 separation.
- **One disclosed limit specific to B.8**: rule 7's `- progress` term is pinned at the ENGINE by
  group13 on `part-served-p1` and proven by injection at 743, but is not exercised through the
  PLAYER SURFACE, because the only fixture with a remaining obligation above 1 sits at progress 0
  and M16 exclusivity caps the count at 2 (record 747). Recorded at that narrower scope rather than
  as an impossibility.
- **One deliberate non-fix**: the quote-time preflight publishes its error raw, so a throw there
  would carry the `promises:` namespace. Unreachable by construction, because `waiverAccepted`
  checks every condition `waivePromise` throws on, ahead of it; curating it would hide a real fault;
  and all four sibling families behave the same way.

## 7. Errors this slice caught, listed because a checkpoint that hides them is worth less

- The **rival-waiver hole**, found by the audit before implementation.
- The parent's **"excluded twice over"** claim about `outcomeEventId`, false and caught before any
  checkpoint carried it.
- The parent's **A13**, which stated rule 6's subset test backwards and would have led a reader to
  drop the P2 family as untestable.
- The parent's **sweep inventory**, which keyed on the symbol `PROJECTION_VERSION` and missed four
  other spellings of the same fact. The writer then found three more classes that even the corrected
  inventory lacked. Static enumeration found 42 of 45 version sites and 3 of 4 row-shape sites; the
  generalisation now on the record is that **a version sweep is not finished until every test
  touching the bumped surface has RUN.**
- The parent's **case-count arithmetic** in prediction 754, above.

LOGIC VERIFIED · UNITY NOT VERIFIED.
