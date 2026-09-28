# 1309-C2: Save41/projection56 pin-sweep revision — handback

Task 1309-C2, mode STAGE REVISION (test source only). Repo base HEAD `ae85c0ea` at assignment;
the branch HEAD moved twice during this task (to `2f669293` then `d8e90042`) via unrelated
concurrent commits — a coordinator checkpoint (docs only) and the other concurrent test-author's
own `1315-stage` work (new draft files under that evidence sub-directory only). Neither touched
any `tests/`/`src/`/`bridge/`/`ui/` path this task edits; re-confirmed with
`git diff --stat <old> <new> -- tests/` after each move. `git apply --check` was re-run against
the final HEAD (`d8e90042`) and passes. No `tests/`, `src/`, `bridge/`, `ui/` file was edited
directly in the assigned worktree; every edit was made in a disposable `git worktree add --detach`
checkout under the scratchpad, never committed, used only to generate the unified diff and the
classification rows, then left in place for reproduction (see Reproduction below) and can be
removed by the parent or on request. No project code was executed — no vitest/tsc/vite-node/node
on project code; only `git apply --check` (non-mutating) and read-only `git`/`grep`/`sed` were
used.

## Deliverables

- `1309-stage2/1309-pin-sweep-r2.patch` — one cumulative unified diff against HEAD, 139 files,
  `git apply --check` clean.
- `1309-stage2/1309-pin-sweep-r2-classification.json` — 487 rows: 405 carried forward from
  `1309-stage/1309-pin-sweep-classification.json` (409 minus item 8's 4 rows), 82 new rows for
  1309-F changes 1–9. Two independent programmatic validators were run against the final worktree
  and the pristine base (scripts and their output preserved under the scratchpad worktree
  directory listed in Reproduction): every row's `old_text` first line is present in the pristine
  file at that path, every row's `new_text` first line is present in the final file, and (for my
  82 new rows specifically) each row's declared `line` matches the final file's actual line
  exactly. The 20 remaining line-number "mismatches" the stricter validator reports are **all**
  among the 405 carried-forward rows, in six files I never touched
  (`bridge-p14b4-runtime47-compatibility`, `bridge-p14b5-relationships`,
  `bridge-p14b6-relationship-read-models`, `bridge-runtime-checkpoint`, `p06a-w1-release-authority`,
  `p13b-s3-save-v23`) — this is a **pre-existing property of 1309-C's own classification
  convention** (each row's `line` is the row's own original pre-patch position; a `git apply`
  applies by content-context matching, not by that literal number, so an earlier `insert_after`
  row in the same file legitimately leaves a later row's stated line stale). Not a defect I
  introduced or need to fix; flagged for the record since a reviewer diffing my convention against
  1309-C's might otherwise read it as new breakage.
- This handback.

## Counts per change (1309-F numbering: F1–F9)

| Change | What | Rows | Files |
|---|---|---:|---:|
| F1 | Item 8 swap reverted (folded into F6's leaf rewrites below — no separate rows; the 4 original item-8 rows are simply absent) | 0 | 0 |
| F2 | `bridge-p14c3-runtime.test.ts:178` fix + its import line (merged into the carried-forward item-3 row for that line, tagged `3+F2`) | 1 new + 1 merged | 1 |
| F3 | Item 3 extended to the residual `validateSaveV40(` population | 59 | 23 |
| F4 | `tests/helpers/p14p3-fixtures.ts` `futureSave()` — chain, not rename | 1 | 1 |
| F5 | `bridge-p14b3-promise-command.test.ts:157-166` comment rewritten (folded into the F6 engineRefused row) | 0 separate (see F1+F5+F6 row) | 0 |
| F6 | Item 8 retitled to P3 law — two leaves | 3 | 2 |
| F7 | Item 8b — `FAMILY_REFUSAL` and the waiver-surface refusal text | 3 | 2 |
| F8 | Item 9 — derived candidate list, trust-chooser test 7 (both leaves) + cast-class-policy natural rival policy leaf | 13 | 2 |
| F9 | Item 10 adopted as proposed | 2 | 1 |

409 (1309-C) − 4 (item 8) + 82 (new) = 487 total rows, 139 distinct files (up from 115).

## Change 6 (item 8, retitled to P3 law) — the two leaves

**`tests/bridge-p14b1-promises.test.ts` group 4 leaf.** Reverted item 8's swap; family stays
`DIRECTING_COUNT`. Traced `bridge/promises.ts:47-58` (`corePredicateOf` always builds a clean
`{kind:'directorCount',count}` for this family) into `src/core/promises.ts:553-571`: every
`DIRECTING_COUNT`-specific shape refusal is a pass-through once `director===true`, so the draft
reaches `REASONABLY_ACHIEVABLE` for this fixture. Measured, not merely inferred: running the
**original**, pre-1309-C leaf (`DIRECTING_COUNT`, unmodified) against the current source produced
`1302-p4p5-broad-core.txt:15753-15762` — `AssertionError: expected true to be false` at the old
`expect(quote.ok).toBe(false)` line. The revised leaf now asserts `quote.ok===true`, that the
message is not the retired `'not offerable: a directing promise is not offered in this slice'`,
and that a second identical quote is deep-equal (determinism) — no classification literal pinned,
per the ruling ("the run has not measured one").

**`tests/bridge-p14b3-promise-command.test.ts` "each material promise field…" leaf, `engineRefused`
variant.** Family stays `DIRECTING_COUNT`; the refusal is now reached by construction, not by
family choice: `dueWeekExclusive: base.promise!.windowStartWeek + base.termWeeks! + 1`. Traced
step by step against `src/core/promises.ts:537-577` with `director=true`: `notOffered` (undefined
for this family) → skip; `opportunityPredicateRefusal('DIRECTING_COUNT', {kind:'directorCount',
count:1})` → `null` (the function's own first line, `!genre && !project && !isOpportunityPredicate`,
is true) → skip; the two `DIRECTING_COUNT`-shape checks at :558-561 both pass because family is
`DIRECTING_COUNT` and the predicate carries only `kind`/`count`; the `LEAD_OR_SIGNIFICANT_ROLE_COUNT`
and opportunity-only checks at :566-571 don't apply (`director===true`); the integer-count check
passes (`count:1`); the window-order check passes (`windowStartWeek===startWeek`, both 52 by this
fixture's own established convention — the same `payload()` literal every other leaf in this file
already relies on); and `dueWeekExclusive(105) > startWeek+termWeeks(104)` fires
`'the due week falls outside the proposed contract'` at :575-577, **before** the person-lookup or
feasibility-engine pipeline runs. Confirmed wire-valid: `bridge/schema/bridge-schema.ts:1832-1836`
(`StudioMarketProposalDirectorPromiseDraftPayload`) requires only
`family`/`count`/`windowStartWeek`/`dueWeekExclusive` — no `seatClass`/`genre`/`scriptProjectId` —
and `dueWeekExclusive` is an unbounded `nonNegativeInteger()`. Expected message updated to
`'not offerable: the due week falls outside the proposed contract'` (the leaf's own existing
`'not offerable: '` prefix convention, from `bridge/promises.ts:156`). The 157-166 comment block is
rewritten to state this new premise, keeping the file's established citation style.

No stop-report was needed for change 6 — a wire-valid, reachable refusal exists for both leaves.

## Change 8 (item 9) — derived candidate list

Restated `authorRivalPromise` (`src/core/talentMarket.ts:1441-1488`) verbatim inside both test
files, computed from public state at test-run time, never a pinned literal:

```
window = { windowStartWeek: proposal.startWeek, dueWeekExclusive: proposal.startWeek + proposal.termWeeks }
p1 = { family:'APPEARANCE_COUNT', predicate:{count:1}, ...window }
flexible = { family:'LEAD_OR_SIGNIFICANT_ROLE_COUNT', predicate:{kind:'castRoleCount',count:1,seatClass:'leadOrAntagonist'}, ...window }
directing = { family:'DIRECTING_COUNT', predicate:{kind:'directorCount',count:1}, ...window }
directingFirst = person.role==='director' || (person.role==='actor' &&
  (a released film this person directed exists, OR a hollywood film credits them as director))
cast = proven ? [p1] : [flexible, p1]
candidates = directingFirst ? [directing, ...cast] : [...cast, directing]
projects = rival business's own development.projects, status!=='produced', sorted by id, sliced to 2
seatClass = proven ? 'allCast' : 'leadOrAntagonist'
projectCandidates = projects -> {family:'SPECIFIC_PROJECT', predicate:{kind:'projectOpportunity',count:1,seatClass,scriptProjectId}}
genreCandidates = projects' distinct concept genres -> {family:'PREFERRED_GENRE_OPPORTUNITY', predicate:{kind:'genreOpportunity',count:1,seatClass,genre}}
candidates.push(...(proven ? [...genreCandidates, ...projectCandidates] : [...projectCandidates, ...genreCandidates]))
```

**`tests/p14b1-trust-chooser.test.ts` test 7 (both leaves).** The existing spy (`scanNaturalRivalAuthoring`,
which transparently wraps `promiseFeasibility` and records every call `authorRivalPromise` actually
makes, in order, for a real natural authoring) already gave me the real candidate *sequence as
lived*, so I did not need to predict feasibility outcomes — only the *shape* of each candidate,
which the spy now checks call-by-call against `expectedRivalCandidates(input, proposal, proven)`.
`RivalAuthoringObservation` gained a `candidates` field, computed once per submission from the
first read's `input` (the spy already asserts every later read of the same submission sees the
identical `input` reference, so computing once and reusing is sound). The witnesses this leaf
already names are relocated **by scan condition, not by array index**:
- `firstWriter` — unaffected: a writer's `directingFirst` is always `false` (role is neither
  `'director'` nor `'actor'`), so `candidates[0]` is always the cast-list's own first entry.
- `firstActor` — the old check hardcoded `observed.proven ? 'APPEARANCE_COUNT' : 'LEAD_OR_SIGNIFICANT_ROLE_COUNT'`
  as "the" first-read family. I replaced it with `observed.candidates[0]!.family` /
  `.predicate` — the computed list's own first entry — so the witness stays correct even if
  `directingFirst` happens to hold for this specific actor (in which case the first candidate is
  `directing`, not the cast list). **Not settled without execution:** I could not run the 220-week
  scan to confirm whether the naturally-found "first actor" witness on the default seed ever has a
  real directing credit; the fix is correct either way, but I have not measured which branch this
  fixture actually takes.
- `flexible` — the gate now additionally requires `observed.reads[0]!.draft.family ===
  'LEAD_OR_SIGNIFICANT_ROLE_COUNT'` (not just "index 0 succeeded"), so a directing-first unproven
  witness (if one ever occurs) cannot be silently misfiled as the flexible witness.
- `negativeProven` / `negativeUnproven` — the "no read achieved" length check moved from a
  hardcoded `1`/`2` to `observed.candidates.length`; `negativeUnproven`'s family-sequence
  assertion moved from the hardcoded 2-entry array to `observed.candidates.map(c => c.family)`.
- A stale, now actively-wrong 2-candidate formula
  (`observed.proven || chosenIndex === 1 ? 'APPEARANCE_COUNT' : 'LEAD_OR_SIGNIFICANT_ROLE_COUNT'`)
  was deleted from `assertOriginalAuthoring` — it was already redundant with the `toMatchObject`
  family/predicate check a few lines above, and would misreport `chosenIndex===1` as
  `'APPEARANCE_COUNT'` even when the actual second candidate is now `directing` for a proven
  person.

**`tests/p14b4-cast-class-policy.test.ts` natural rival policy leaf.** Same restatement, in this
file's own local idiom: a new `expectedRivalCandidates(input, talentId, issuerStudioId, proven)`
reuses the file's already-existing `person()` helper and `P1`/`FLEX` consts (no new helper beyond
what the file already has the pattern for). `realProven` here is **already an exact mirror** of
`isProven` (`src/core/talentMarket.ts:756-759`, `age>=30 || careerIdentity(...).identityDisciplines.length>0`) —
unlike trust-chooser's `publicPreferredOpportunity(...)==='anyCastAppearance'` proxy (which returns
`'directingOpportunity'`, not `'anyCastAppearance'`, for a director-role person regardless of
`isProven`), so this file carries **no** director-role proxy blind spot. `expectedCount` (the
number of `promiseFeasibility` calls a submission should make) changed from the old
`!proven && classification!==ACHIEVABLE ? 2 : 1` binary to `chosenIndex===-1 ? candidates.length :
chosenIndex+1`, derived from where in the actual `calls` array the achievable read landed. The
`kind` label used only for `console.log` witness lines (never an assertion) was widened from a
proven-binary ternary to check the actually-chosen family first, falling back to the raw family
name for a Director/opportunity attach this leaf doesn't require as one of its 4 named witnesses.

**Not independently verified without execution (both files):** whether the widened candidate list
changes the actual *number of ticks* needed to find each of the required witnesses within the
220-week scan bound, or whether a witness that existed under the old law disappears under the new
one. Per the ruling, I did not widen either scan bound to compensate for a hypothetical miss — if
a witness no longer occurs within the leaf's existing bound, that is a fact only a real run can
surface, and is exactly the kind of finding this restatement is designed to expose rather than
paper over.

## Sites where 1309-D's classification of a live envelope turned out wrong on my read

None. I independently re-read every one of the 23 files / 59 sites (my count is higher than
1309-D's "~45" estimate because it includes the necessary import-line edits alongside the call
sites, matching item 3's own established convention) before editing, and every site traced to a
genuinely live envelope (`makeSave(...)`, a session save/export round trip, or an explicit
`LIVE_SAVE_VERSION` stamp) — no exception. Change 3 asked for a `keep` row wherever a site turned
out historical; none did, so no `keep` rows appear in the classification. The two purpose-built
R2/R3 files 1309-D already excluded by name (`tests/p14r3-save-v41.test.ts`,
`tests/bridge-p14r2r3-prior55.test.ts`) were not touched and are outside the 23-file list entirely.

## Discovered gaps — not fixed, explicitly reported (out of this task's assigned scope)

- **`tests/p14p3-directing-promises.test.ts` (the `futureSave()` caller file) has its own residual
  defects F4's fix does not reach**, because F4's assigned scope is the helper file only
  (`tests/helpers/p14p3-fixtures.ts`). Read the caller file's own call sites: line 321
  (`const save = saves.makeSave(state); expect(save.saveVersion).toBe(40)`) is a live envelope with
  a stale numeric literal — squarely item-3/item-1 territory, but not named by either 1309-D's
  23-file list or this task's F4 scope. More structurally: several call sites (line 322/634,
  `expect(api.validateSaveV39(save)).toBe(save)` / `.toBe(valid)`) assert **reference identity**
  between the chain's output and the original live envelope. Every `convertVNNToVMM` in
  `src/core/save.ts` deep-clones (`JSON.parse(JSON.stringify(...))`) before returning — confirmed
  directly at `convertV41ToV40`/`convertV40ToV39` (`src/core/save.ts:10453,10490`) — so a genuine
  multi-step chain can **never** return the same object reference it was given. F4's fix is correct
  per the ruling's own instruction ("chain, not rename"), but it does not and cannot make these
  specific `.toBe(save)`-style assertions pass; they need a caller-file fix (loosen to `.toEqual`,
  or assert on content) that is outside this task's scope. **This is a regression that remains even
  once F4's own assigned edit lands and the requested test set otherwise passes.**
- **`tests/bridge-p14p4p5-opportunities.test.ts:457-464`** (the `'B55-3…'` test) reads the live
  `PROJECTION_VERSION`/`BRIDGE_SCHEMA.$id`/`SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` constants
  directly and pins `.toBe(55)`, `'…projection-55'`, `toHaveLength(42)` — all stale (live value is
  56, one more prior id registered). This file carries **zero** classification rows in 1309-C's
  original item-1 pass (confirmed: filtered the frozen classification.json by path, found none),
  so it was never in scope for the 1301-row sweep either. Not fixed — outside my assigned change
  list (only `:36,471,476,477` were cited for this file), flagged as an additional residual.
- **`tests/bridge-p14p3-directing-promises.test.ts:323`** carries the identical pattern
  (`expect(PROJECTION_VERSION).toBe(55)` inside a similarly-named migration test) — same cause,
  same scope boundary, not fixed.
- **`tests/bridge-p14b3-promise-command.test.ts:509-511`** (inside the "quote→commit→real winning
  expiry…" test) reads `LIVE_SAVE_VERSION`/`PROJECTION_VERSION`/`validated.saveVersion` from a
  genuinely live `saveSlot(completed)` round trip and pins `.toBe(40)`/`.toBe(55)`/`.toBe(40)` —
  also stale, also carrying zero item-1 classification rows for this exact trio, also outside my
  cited `:38,86,136,358,503` scope (those are the `validateSaveV40(` call sites only). Not fixed.
- **`tests/p14b8-waiver-surface-oracle.test.ts:41`** (header table, "DIRECTING_COUNT count 2 ->
  rule 9, … — a directing promise is not offered in this slice") is now stale prose beside the
  corrected `:241` assertion — not touched, matching the established convention of leaving
  narrative "measured" comments alone when only the assertion itself was in scope (same treatment
  1309-C gave item 2's "moves coherently to38" message text). The adjacent `:240` comment ("this
  string being REACHABLE through rule 9") remains accurate unchanged: `waiverAccepted`'s own rule
  order (`src/core/promises.ts:1275-1326`) still delegates to `promiseFeasibility` at exactly one
  point (its own final check), regardless of which inner `promiseFeasibility` branch produced the
  bottleneck string — so "rule 9" in this file's own numbering is still the right label for the
  refusal, whichever specific sentence it carries.

## Anything I could not settle without execution

- Item 9's exact feasibility verdicts (which specific candidate in the computed list is actually
  `REASONABLY_ACHIEVABLE` for a given natural witness) — not needed, since both leaves now compare
  against the spy's own observed reads rather than predicting classifications, but I could not
  confirm the 220-week scan still finds all required witnesses under the widened list without
  running it.
- Whether `directingFirst` is ever `true` for the naturally-scanned "first actor" witness in
  `p14b1-trust-chooser.test.ts` (affects nothing correctness-wise post-fix, but I don't know which
  branch the fixture actually exercises).
- Whether the four discovered-gap files above (`p14p3-directing-promises.test.ts`,
  `bridge-p14p4p5-opportunities.test.ts`, `bridge-p14p3-directing-promises.test.ts`,
  `bridge-p14b3-promise-command.test.ts`) have *other* residual stale pins beyond the ones I found
  by reading context around my assigned sites — I did not do an exhaustive fresh sweep of every
  file in the repo; only the files this task's change list named, plus whatever I noticed
  incidentally while reading surrounding context.
- The R2/R3 GREEN gate itself, the broad core and UI reruns, and any native/Unity behavior — none
  attempted, none claimed.

## Reproduction

```
cd /Users/zacheryspector/The-Movies-headless-program
git apply --check docs/engineering/playability-launch-review/evidence/p14b4-20260919/1309-stage2/1309-pin-sweep-r2.patch
```
Exit 0, no output; re-run and confirmed clean at final HEAD `d8e900423f39ecb68b956cef5d8ce767734e4ca6`.
This patch was built in a disposable `git worktree add --detach` checkout (detached at `ae85c0ea`,
frozen 1309-C patch applied via `git apply`, then every F1–F9 edit made directly with Edit/sed,
never committed) so the assigned repo's own `tests/`/`src/`/`bridge/`/`ui/` trees were never
touched; the worktree has since been removed (`git worktree remove --force`) now that the patch
and classification JSON are captured as durable artifacts under `1309-stage2/`. The row-assembly
script (`build_classification_r2.py`) and the two validators
(`validate_classification.py` checks every row's `old_text`/`new_text` first line is present in
the pristine/final file respectively; `validate_lines.py` additionally checks each of my 82 new
rows' declared `line` against the final file exactly) are preserved in this session's scratchpad
for re-running against a fresh worktree if the parent wants to reproduce the build rather than
just apply the frozen patch. Apply for real only after 1309-D2 review, per 1309-F's own Order
section — not done here.
