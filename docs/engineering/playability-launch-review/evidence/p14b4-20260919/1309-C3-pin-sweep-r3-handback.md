# 1309-C3: Save41/projection56 pin-sweep r3 — handback

Task 1309-C3, mode STAGE REVISION (test source only). Coordinator-assigned base HEAD `b65fd4bd`.
The real repo has since advanced 5 commits (current tip `c2f344d3`, unrelated 1315-series casting
work by another writer) — expected in a shared multi-agent repo; `b65fd4bd` is still a real
ancestor of current HEAD (`git merge-base --is-ancestor b65fd4bd HEAD` → true), so the assigned
reference commit is unambiguous and unaffected. Per the explicit instruction, **no git worktree was
used this time.** Method: `git archive b65fd4bd | tar -x` into two plain scratch directories
(`1309c3-b` = pristine, untouched; `1309c3-a` = same content, then r2's own patch applied with
POSIX `patch -p1 --batch`, then every ruling 1–6 edit applied directly with the Edit tool / `sed`).
The cumulative unified diff was built with `diff -ruN` between the two plain directories (via `a`/
`b` symlinks so the patch carries standard `a/`/`b/` path prefixes). `git apply --check` was run
against the assigned `b65fd4bd`, not the live working tree, using an isolated `GIT_INDEX_FILE`
pointing at a temp index built with `git read-tree b65fd4bd` and `git apply --check --cached` — no
checkout, no worktree, no mutation of the real repo's index or working files. Exit 0. No project
code was executed (no vitest/tsc/vite-node/node on project code); only `git`, `diff`, `patch`,
`grep`, `sed`, and Python (`json`/`re`, stdlib only) were used, all on scratch copies.

## Deliverables

- `1309-stage3/1309-pin-sweep-r3.patch` — one cumulative unified diff against HEAD `b65fd4bd`, 140
  files, `git apply --check` clean (verified against a temp index built from `b65fd4bd`, not the
  live tree — see Reproduction).
- `1309-stage3/1309-pin-sweep-r3-classification.json` — 536 rows: 487 carried forward verbatim
  from `1309-stage2/1309-pin-sweep-r2-classification.json`, 49 new rows tagged `X1`–`X6` (or a
  combined tag like `X1+X2` where one hunk mixes two rulings in the same file, e.g. a version
  literal and a termination fix landing in the same function). **Methodology change from r2/C2's
  convention:** rather than hand-typing `old_text`/`new_text`, I reconstructed the true pre-r3
  baseline (`1309c3-postr2` = pristine `b65fd4bd` with r2's own patch applied fresh) and generated
  every new row mechanically from `diff -U0` hunks between that baseline and my final edited copy,
  one row per contiguous hunk. A validator then confirmed every row's `old_text` is byte-present in
  the pre-r3 file and every row's `new_text` is byte-present in the final file — **0 failures across
  all 49 rows** (script and its JSON intermediate preserved in the scratchpad, see Reproduction).
  This caught and fixed 6 rows where my first hand-typed pass had used a shorthand/paraphrased
  `old_text` (e.g. `"..."` truncation, or assuming a single-line construct that was actually split
  across two lines) — none of those 6 affected the actual `.patch` file, only the classification
  JSON's own self-description of it.
- This handback.

## Counts per ruling

| Ruling | What | New rows | Files (of which new-to-r3) |
|---|---|---:|---:|
| 1 | Save41 fallout: `termination: 0` built via the law at every site sharing the construction | 20 | 10 (1 new: `p14b4-save-v30-compatibility.test.ts`) |
| 2 | Missed live pins → 41/56; historical captures keep their numbers | 14 | 6 (4 new: `bridge-p14b2-trust.test.ts`, `p14p4p5-opportunities.test.ts`, plus 2 new sites inside already-ruling-1-touched files) |
| 3 | `futureSave()`: `validateSaveV39` now calls the live validator; `convertV39ToV38` unchanged | 4 | 1 |
| 4 | `bridge-p14b1-promises.test.ts:322` gains `qualifyingRole: 'cast'` | 1 | 1 |
| 5 | Trust-chooser `proven` restated from `isProven`, not `publicPreferredOpportunity` | 2 | 1 (shared file with ruling 6) |
| 6 | Witness coverage matches the measured census; unproven branches become an open coverage finding or a cited other-seed source | 8 | 2 |

(Rows sum to 49 because 3 files carry a combined `X1+X2` tag for hunks that mix both rulings; the
"files" column counts each physical file once even when it carries two ruling tags.)

## Ruling 1 — every new site found by my grep, with inclusion/exclusion reasoning

Fixed (10 files, all now build the expected migrated state via a local `withRivalTermination`
helper instead of a bare `...old.state` spread): the two bridge files already named in the prior
ruling (`bridge-p14p3-directing-promises.test.ts`, `bridge-p14p4p5-opportunities.test.ts`), the
seven plain files already fixed before this handback's compaction boundary
(`p14p4p5-casting-reservation.test.ts`, `p14p4p5-scenery-capacity.test.ts`,
`p14p4p5-delayed-retirement.test.ts`, `p14p4p5-queued-project-outcome.test.ts`,
`p14p4p5-cross-owner.test.ts`, `p14b3-rule-revision.test.ts`, `p14bf2-acting-discipline.test.ts`),
and **one genuinely new site my own proactive grep found**: `tests/p14b4-save-v30-compatibility.test.ts:206`
(a `migrateToLive`→`toEqual({ ...migrated.state, ... })` comparison inside its shared
`preservesExactly()` helper, reached by all three of the file's corpus cases) — this file carried
**zero** rows in any prior sweep pass and was found only by grepping every `tests/` file for the
`toEqual({ ...X.state,` construction directly, independent of the failure log.

Checked and excluded, with the specific reason each is a true negative:
- `tests/bridge-p14b4-cast-class.test.ts:77`, `tests/p14b4-material-evidence-core.test.ts:82` —
  both migrate via `migrateToV31`, never crossing the V40→V41 boundary at all.
- `tests/bridge-owner-ux-projection20-migration.test.ts:166` — a different migration boundary
  (`era.soundRequired`), no `hollywood.businesses` field in that comparison.
- `tests/p13a-rival-adoption.test.ts`, `tests/p12-lifecycle.test.ts` — every state compared is
  native/live (built via `generateWorld`/`tick`, never migrated from a stale pre-V41 save), so
  `termination` is already present on both sides of every comparison; confirmed by reading each
  call site in full, not just grep.
- `tests/p14r3-save-v41.test.ts` — this is the **law's own authoritative test** for the
  `termination: 0` addition itself; it already asserts the field key-by-key and predates/defines
  the behavior other files must match. Not a defect.
- `tests/bridge-p14r2r3-prior55.test.ts` — parses a frozen, byte/sha256-pinned historical fixture
  captured before R2/R3 landed; its `saveVersion: 40` pins are correct historical facts about that
  frozen fixture, not a live comparison.
- Ten more files matched a broader `firstTakeSubjects` grep but use only narrow single-field
  comparisons (`expect(state.firstTakeSubjects).toEqual({...})`), never a full-state spread —
  confirmed individually by reading context, e.g. `p14p4p5-finishing-material.test.ts:114-133`
  compares `market.tick`, `firstTakes`, `promises`, `careerLifecycle.*` etc. as separate assertions,
  none of which touch `hollywood.businesses`.

## Ruling 2 — new sites beyond the 4 explicitly named

Named (fixed): `bridge-p14b3-promise-command.test.ts:509-511`,
`bridge-p14p3-directing-promises.test.ts:109` (was `:98` in the pre-patch numbering the ruling
cited), `bridge-p14p4p5-opportunities.test.ts:73` (was `:62`), and the two `PROJECTION_VERSION`/
`PROTOCOL_VERSION` literals in those same two files (originally cited `:568`/`:457`; my copies'
cumulative line numbers had already drifted from r2's own earlier edits in the same files, verified
by direct `grep -n` on final content per my own "never trust a stated line number" rule, not by
recomputing the citation).

New, found by a broad `PROJECTION_VERSION).toBe(`/`LIVE_SAVE_VERSION).toBe(`/`saveVersion).toBe(4`
sweep of every file in `tests/`+`bridge/`, each individually confirmed live (not historical) by
reading its call site:
- `tests/bridge-p14p3-directing-promises.test.ts:259` — `migrateToLive(variant)` inside
  `legacyClassless()`, a **synthetic** old-reader-compatibility construction, still genuinely fed
  through the live migration chain each call; `.toBe(40)` → `.toBe(41)`.
- `tests/bridge-p14b2-trust.test.ts:137-140` — `PROJECTION_VERSION`, `LIVE_SAVE_VERSION`,
  `BRIDGE_SCHEMA.$id`, `BRIDGE_SCHEMA['x-project-studio'].projectionVersion`, all four hardcoded
  against the live symbols in one pin-test (`describe('P14B.2 group1 — projection46, unchanged
  Save29/intents...'`) whose own title text is even further stale than its body — title left
  untouched (out of ruling-2's literal-pin scope; flagged, not fixed, see below).
- `tests/bridge-p14b2-trust.test.ts:466` — `validateSaveV41(JSON.parse(saved.saveJson))` on a
  **freshly-saved** session inside the same file's V29-roundtrip test; `.toBe(40)` → `.toBe(41)`.
- `tests/p14p4p5-opportunities.test.ts:284` — `JSON.parse(bytes(admittedGenre))` where `bytes()` is
  `exportSave(makeSave(state))` on a live, in-memory-built state (`admittedGenre`), not a frozen
  fixture; `.toBe(40)` → `.toBe(41)`.
- `tests/p14b4-save-v30-compatibility.test.ts:241-242` — a **sentinel** test
  (`it('pins LIVE_SAVE_VERSION to literal40 independently of the value under test'`) whose own
  title states its purpose is to track the live value; `.toBe(40)` → `.toBe(41)`, title text
  updated to `literal41` to match.

**Found but NOT fixed — flagged as an unresolved, separate finding:**
`tests/bridge-owner-ux-projection20-migration.test.ts:65` — `expect(PROJECTION_VERSION).toBe(53)`,
same defect *pattern* as the sites above (a literal pinned against the live symbol). I did not fix
this one because I have no evidence it is "behind the same loaders" the ruling names: it never
appears in either r2 dry-run log extract (checked both `1309-X2-sweep-r2-rerun-with-docs-extract.txt`
and `...-targets-run-extract.txt` — neither `✓` nor `❯` lists this file at all, meaning it was not
part of that 131-file target run and its actual current pass/fail status is genuinely unmeasured,
not confirmed-green), and its own test name/scenario ("Owner UX outgoing projection20 migration")
shares no label with the "D15"/"B55-1" loaders the ruling names (confirmed `B55-1` is a literal
substring of `bridge-p14p4p5-opportunities.test.ts`'s own test title, so I read that phrase as
naming specific test scenarios, not a generic code path). Fixing it would be scope expansion beyond
what ruling 2 authorizes; reported here instead per "expose the gap."

## Ruling 3, 4, 5 — brief confirmation

- **Ruling 3**: `tests/helpers/p14p3-fixtures.ts`'s `futureSave()` now returns
  `validateSaveV39: (input) => steps.validateSaveV41(input)` (name kept, value now the live
  validator) and keeps `convertV39ToV38` as the existing chain
  (`convertV39ToV38(convertV40ToV39(convertV41ToV40(input)))`). Also confirmed (no action needed):
  `tests/p14p3-directing-promises.test.ts:321`'s `.toBe(40)` literal, which my own r2-phase handback
  had reported as still-broken, was **already** `.toBe(41)` in the r2-patched baseline — a stale
  claim in my own prior report, now corrected here rather than silently repeated.
- **Ruling 4**: `tests/bridge-p14b1-promises.test.ts:322` — added `qualifyingRole: 'cast',` between
  `count:` and `seatClass:`, matching the file's own established convention at the same leaf.
- **Ruling 5**: `tests/p14b1-trust-chooser.test.ts` gained `isProvenPerson(state, talentId)`, a
  verbatim restatement of the unexported `isProven` (`src/core/talentMarket.ts:756-759`,
  `careerIdentity` from `src/core/talentSummary.ts:542`) — the exact same expression the file's own
  `findUnproven`/`findProven` helpers already used. Replaced the buggy
  `publicPreferredOpportunity(input, proposal.talentId) === 'anyCastAppearance'` proxy (which
  returns `'directingOpportunity'`, not `'anyCastAppearance'`, for **every** director regardless of
  `isProven`) at its one use site inside `scanNaturalRivalAuthoring`. **Verified**, not just
  asserted: the r2 dry-run's actual measured failure for both "test 7" cases in this file
  (`1309-X2-sweep-r2-rerun-with-docs-extract.txt` lines ~279-330) shows the real authoring law tried
  `APPEARANCE_COUNT` (the proven P1) first while the test predicted `LEAD_OR_SIGNIFICANT_ROLE_COUNT`
  (the unproven flexible P2) — exactly the signature of this bug, confirming the fix targets the
  actual observed defect, not a hypothetical one. `tests/p14b4-cast-class-policy.test.ts`'s
  `realProven` (line 67-71) was independently re-confirmed to already use the identical direct
  restatement — no change needed there for ruling 5.

## Ruling 6 — witness coverage, in detail

Applied the Q2 census (`E/1309-Q2-rival-authoring-census.txt`: 72 rival authorings over 220 weeks
on the default seed, **every one proven, none unproven**) to both files that assert natural
witness coverage:

**`tests/p14b1-trust-chooser.test.ts`** — the `flexible` (unproven flexible-P2-achievable) and
`negativeUnproven` (unproven zero-attachment) witnesses were REQUIRED but are structurally
unattainable within 220 weeks on the default seed (0 unproven authorings occur at all). Dropped
both from the required-witness set (completion condition and final assertions), following the
file's own pre-existing convention for exactly this situation (the adjacent P1-FALLBACK branch was
already handled this way: "has NO natural witness on this chain — recorded as a fixture finding,
never synthesized here"). Wrote an explicit "OPEN COVERAGE FINDING" comment block citing the census
by path, and separately cited a genuine other-seed demonstration that DOES exist —
`tests/p14b4-cast-class-policy.test.ts`'s own `scan('seed-b')` — while being explicit that it does
**not** stand in for a witness of this test's own specific per-read assertions (different harness),
so extending `scanNaturalRivalAuthoring` to a second seed remains a real, undone option, not a
completed fix. The 3 remaining witnesses (`firstWriter`, `firstActor`, `negativeProven`) are all
well-attested in the census (writer-proven: 12 occurrences; actor-proven-achievable-first: 12;
proven zero-attachment: 46) and require no further change.

**`tests/p14b4-cast-class-policy.test.ts`** — found and fixed a real labeling bug, not just a
stale-requirement problem: the `'neither'` witness was only ever recorded when `!proven`
(`if (!proven) seen.add('neither')`), but the census shows **all 46** of the measured zero-attachment
outcomes are proven (none unproven exist at all) — so on the current widened law this scan's
`seen` set could never actually contain `'neither'`, no matter how long it ran. Removed the
`!proven` gate (now records regardless of proven status). Separately, the widened law's Director
candidate is a real, census-attested natural witness (`'DIRECTING_COUNT'`, 2 occurrences,
`director|proven|...chosen=DIRECTING_COUNT`) that the file's own comment explicitly and
consciously excluded ("the widened list can also choose a Director... this test does not name as a
required witness") — promoted it to required. Updated the default-seed-only interim assertion from
`expect.arrayContaining(['flexibleP2', 'neither', 'provenP1'])` to the exact
`['DIRECTING_COUNT', 'neither', 'provenP1']` (matching the r2 dry run's own actual measured failure
output for this exact assertion: `AssertionError: expected [ 'DIRECTING_COUNT', 'provenP1' ] to
deeply equal ArrayContaining{…}` — the `'neither'` gap in that received array is exactly the
labeling bug above), the early-exit threshold from `seen.size === 4` to `=== 5`, and the final
(post-`seed-b`) assertion from a 4-element to a 5-element set. The seed-b citation for `flexibleP2`/
`P1fallback` was independently verified against the archived probe log
(`600-T4-probe-logs/600-T4-scan-C-policy-seed-b-seed-c-bottleneck.log:9,11`), not merely quoted from
the existing in-file comment.

## Anything I could not settle without execution

- Whether the corrected `tests/p14b1-trust-chooser.test.ts` scan actually completes within 220
  weeks and whether its `firstActor` "unconditional positive" assumption
  (`observed.reads[0]!.receipt.classification === 'REASONABLY_ACHIEVABLE'` for the **first**
  chronological actor witness) holds — the census gives aggregate counts (12
  achievable-first-actor vs 24 fragile-first-actor occurrences) but not their week-by-week order,
  and this assumption is not named by any of the 6 rulings, so I did not touch it. If the actual
  first-chronological actor on this seed turns out to be a fragile-first case, this specific
  assertion would newly fail; flagged here rather than guessed at.
- `tests/bridge-owner-ux-projection20-migration.test.ts:65` (above) — same defect pattern, real
  finding, deliberately not included in this patch pending a scope decision.
- I did not attempt a fresh, from-scratch grep of literally every `.test.ts` file for every
  possible stale-literal pattern beyond `PROJECTION_VERSION`/`LIVE_SAVE_VERSION`/`saveVersion`/the
  termination construction; only files reachable from the named sites' context, the `firstTakeSubjects`
  grep, and the explicit version-literal sweep were checked.
- No suite was run (native or otherwise); I cannot confirm the corrected files are GREEN, only that
  each fix targets a specific, independently-traced defect (either the r2 dry run's own measured
  failure text, or direct source-code reasoning against `src/core/save.ts`/`talentMarket.ts`).

## Reproduction

```
cd /Users/zacheryspector/The-Movies-headless-program
GIT_INDEX_FILE=/tmp/verify.index git read-tree b65fd4bd
GIT_INDEX_FILE=/tmp/verify.index git apply --check \
  docs/engineering/playability-launch-review/evidence/p14b4-20260919/1309-stage3/1309-pin-sweep-r3.patch \
  --cached
rm -f /tmp/verify.index
```
Exit 0, no output. Confirmed against `b65fd4bd` specifically (not the live working tree, which has
moved on); the real repo's index/working files were never touched by this check.

Built in plain scratch directories (`git archive b65fd4bd | tar -x`), no `git worktree`:
`1309c3-b` (pristine), `1309c3-a` (r2's own patch applied via `patch -p1 --batch`, then every
ruling 1–6 edit applied directly), and `1309c3-postr2` (a second pristine copy with only r2's patch
applied, reconstructed specifically to give the classification JSON's new rows an accurate
pre-r3 baseline instead of the raw pre-r2 one). The classification-generation scripts
(`build_classification_v2.py`, `finalize_classification.py`) and their intermediate
(`r3_hunk_rows.json`) are preserved in this session's scratchpad for re-running against a fresh
build if the parent wants to reproduce rather than just apply the frozen patch.
