# 1348-E: P14B relationship slice A production handback

Role: the single production writer (sim-core). Task: implement relationship slice A (tier law v2 with conflict
evidence, `relationshipsReasonSentence` wired into `chooseProposal`, the Mentor label module) in a scratch tree
against the final RED r4, and hand back per-step cumulative patches.

Status: **PARTIAL, 77/80 on the final RED r4.** The three failing leaves fail on a premise line inside the RED
that the v2 law must break (finding F1). The root type gate exits 2 on two literals in a sibling test file under
the mandated `currentTier` signature (finding F2). The UI and Bridge gates exit 0. I edited no test. Slice A adds
no save version, no projection change and no Bridge or Unity wire change.

## Authority read

- [1340-O](1340-O-owner-rulings-20260929.md): D-1312-1, D-1312-2 (not in slice A), HIS-014.
- [1342-O approved](1342-O-owner-rulings-p14-p18-approved.txt) item 8.
- [1347-A](1347-A-p14b-relationship-rulings-charter.md), [1347-B](1347-B-relationship-charter-review.md),
  [1347-F](1347-F-parent-relationship-charter-adoption.md) (Amendments 1 and 2, the notes, the Addendum). 1347-F
  governs over 1347-A.
- [1348-F2](1348-F2-parent-d5-reason-sentence.md), [1348-F3](1348-F3-parent-slice-a-red-final.md).
- RED reviews [1348-D](1348-D-rel-sliceA-red-review.md), [1348-D2](1348-D2-rel-sliceA-red-r2-review.md),
  [1348-D3](1348-D3-rel-sliceA-red-r4-review.md).

## Base check

- `git rev-parse HEAD` at start: `c4e3bd4b4d20981465ec5addd1af17cbcf348fc0`. Status: two untracked
  `1352-stage` files belonging to the parent.
- HEAD at the end: `5c2ba11a2182f7999d1984848fa12589df428888`. The six commits in between change three files
  under `src tests ui bridge generated scripts` and the configs, all new fixtures in
  `tests/fixtures/p14/genuine-v42-pre-shelving-week93/` (146 insertions). No source file moved.
- Temporary-index apply check at `5c2ba11a`: for each step, `read-tree HEAD`, apply
  `1348-rel-sliceA-red-r4.patch` (sha256 `2c2d2ee8…41d4b6c5`) to the index, then `git apply --cached --check` the
  step patch. All three steps apply cleanly. The real index was never touched.
- In the real repo I wrote only this record and `1348-stage/1348-rel-sliceA-production-step{1,2,3}.patch`.

## Persistence check (done before any code)

File:line citations are at BASE `c4e3bd4b`.

1. **Stored fields computed from the tier law.** Only `RelationshipEdge.peakTier` and `peakTierWeek`
   (`src/core/types.ts:2278-2279`). `writeEdge` writes them (`src/core/relationships.ts:192-204`: the tier at :194,
   the peak at :200-201), and `newEdge` writes them (:209-222: :211, :219). A grep of `src bridge ui scripts` for
   `currentTier|tierOf|peakTier|RELATIONSHIP_RULES_VERSION|tiersOnRoster|pairChemistry` finds only reads beyond
   these: `talentMarket.ts:915` (D5) and `:1196` (`nemesisOnRoster`), `bridge/finance-upcoming.ts:33` (the
   Inseparable note) and `bridge/relationships.ts:27`, `:97` (through `pairChemistry`).
2. **The validator reconciles nothing against the law.** `validateRelationshipsRoot` checks `peakTier` for
   catalogue membership only (`relationships.ts:549`) and `peakTierWeek` for the recording interval only (:550).
   It recomputes no tier from closeness, evidence or a rules version. `save.ts` reaches the root only through
   `validateRelationshipsRoot`, `relationshipsAtV31`, `assertRelationshipsAtV31` and `projectRelationshipsPreV31`
   (`save.ts:57`, :9189-9230, :10407, :10566-10592). `convertV41ToV42` adds `sharedCompetitions: 0` (:10581), so no
   pre-Save42 edge holds evidence. `hollywoodValidation.ts` never reads the root.
3. **The rules version is stored nowhere.** `RELATIONSHIP_RULES_VERSION` appears only at `relationships.ts:38` and
   its re-export `index.ts:1532` ("the chooser receipt carries no rules version", :34-35).
4. **Receipts.** `closeCase` writes settlement `reasons` at `talentMarket.ts:1013`. No validator checks them
   against a sentence list; the receipt validator checks only `dropped` sentences for blanks and amounts (:1570-1579).
   The `nemesisOnRoster` drop copy (:1150) is stored as free text in `dropped`. The wire carries
   `settlementReasons: array(nonEmptyText())` (`bridge/schema/bridge-schema.ts:2588`). A v1-era receipt keeps its
   sentence and a v2 at-odds sentence validates.
5. **Paper calculation on written values.** An engine-minted edge starts at closeness 47 to 56 (baseline 50, first
   driver -3 to +6), so its first peak is Acquaintances or Colleagues under both laws, and a peak only rises.
   Enemies and Nemeses rank below Strained, so v1 and v2 write the same `peakTier` for every engine-minted edge.
   They differ only for a validator-admitted edge whose stored peak sits below Strained, which no engine path
   produces. That difference is prospective at write time; nothing re-validates it.

Conclusion: no stored value is reconciled against the tier law. Slice A needs no era split, no old-law fixture
test and no save version. The validator code is untouched, so old saves validate unchanged. What changes on load
is the read: a Save42 edge with `sharedCompetitions >= 3` and current closeness at or below 30 now reads Enemies or
Nemeses, the ruling's intended effect (1347-A §4: conflict evidence comes from the recorded `sharedCompetitions`).
Witness: `tests/p14b9-save-v42.test.ts` (genuine Save42 fixtures) passes 12/12 on the final tree.

## Method

Scratch tree by the 1327-C method at `c4e3bd4b`:
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/1348-prod/tree`.
It holds an archive of src, bridge, ui, generated, scripts, the package and tsconfig/vitest configs and
AUDIO-PROVENANCE.md, plus tests without fixtures. docs, node_modules, art, tools and tests/fixtures are symlinks.
Run logs sit in the sibling `runs/` directory.

| Scratch commit | Content |
|---|---|
| `8be81ed` | base (`c4e3bd4b` archive) |
| `f049d58` | RED r4 applied |
| `a225ec4` | step 1 |
| `b261454` | step 2 |
| `9571a83` | step 3 |

Each handback patch is `git diff f049d58 <step>`: production only, cumulative, relative to the r4 test commit.

| File | Bytes | sha256 | Files |
|---|---|---|---|
| `1348-stage/1348-rel-sliceA-production-step1.patch` | 5,653 | `a58964565f183bd0d4c3448a51ba7db5dc75a126ff1492e3a061bd9fcd61134f` | relationships.ts +34/-13, index.ts +2 |
| `1348-stage/1348-rel-sliceA-production-step2.patch` | 10,389 | `881989a457a4fa56118033c335d65e274ef83883cb9cd45573099586eff6dfa5` | + talentMarket.ts +11/-7, index.ts +1 |
| `1348-stage/1348-rel-sliceA-production-step3.patch` | 16,265 | `8054086910c337aebee3504fc6f32c5338255ae4a1820435da66a8693f36f49e` | + relationshipLabels.ts (new, 38 lines), professionTransitions.ts +14/-6 |

## Per step

**Step 1: tier law v2.** In `src/core/relationships.ts`: `RELATIONSHIP_RULES_VERSION = 2` with its meaning and the
persistence conclusion in the comment; `export const RELATIONSHIP_CONFLICT_COMPETITIONS = 3`;
`export function hasConflictEvidence(edge: Pick<RelationshipEdge, 'sharedCompetitions'>)`, which returns
`sharedCompetitions >= 3`; `tierOf(closeness, evidence)` reads the Nemeses or Enemies band only with evidence and
Strained otherwise; `currentTier` takes `Pick<RelationshipEdge, 'closeness' | 'lastEventWeek' | 'sharedCompetitions'>`.
`writeEdge` computes the peak from the counted edge's evidence, and `newEdge` from its own counter, so one law
serves the read and the write. Evidence never enters `currentCloseness`, and no driver, counter or delta changed.
`index.ts` re-exports the two new names (the index mirrors every relationships export).

**Step 2: the D5 reason.** In `relationships.ts`:
`export function relationshipsReasonSentence(band: 0 | 1 | 2): string` returns the close-ties sentence for 2 and
the at-odds sentence for 1. Band 0 returns the band-1 sentence, with a comment that 0 is the floor of {0, 1, 2}
and so can never be a decisive winner's band. In `talentMarket.ts`, `chooseProposal` maps the `relationships` key
through a real call, `relationshipsReasonSentence(bands.get(winner)!.relationships as 0 | 1 | 2)`.
`DESCRIPTOR_REASON` loses its `relationships` entry and is typed
`Record<Exclude<DescriptorKey, 'relationships'>, string>`, so no inline copy of the sentence remains. D5's order is
unchanged (1347-F Amendment 2). The `bandsFor` comment now states that the shipped order holds when both are on the
roster, that OPEN 11's enemies-first candidate is not selected, and that rules 2 make `enemies here` reachable.

**Step 3: Mentor.** New `src/core/relationshipLabels.ts`: `MENTOR_FIRST_PICTURES = 3`, type `MentorEvidence`, and
`mentorEvidence(state, actorId)`. It returns null unless a `CohortReceipt` names the actor (1347-F Amendment 1). It
takes the actor's distinct acting first takes up to `state.market.tick` and returns null below three, or when the
first three have different directors. Otherwise it returns `{ directorId, productionIds: [3], entryWeek }`, where
`entryWeek` is the receipt week. It throws if the first take predates the receipt, a state the record cannot hold.
The ordering and de-duplication are the transition law's: I extracted `retainedTransitionEvidence`'s take list
verbatim into `export function distinctActingFirstTakes` in `professionTransitions.ts`, and both callers use it.
That removes the duplicate law. The module is a pure read with no engine consumer and is not in `index.ts` (the
1346-E precedent).

## Test and type output (scratch tree)

Command form: `npm run test:core -- <files>` (the package script `vitest run --project core`) and
`npx --no-install tsc ...`.

| Run | Result | Time | Log (`runs/`) |
|---|---|---|---|
| r4 baseline, three RED files | 26 failed, 54 passed (80): reproduces 1348-X4 | 27.99 s | `red-r4-baseline.txt` |
| after step 1 | 13 failed, 67 passed | 38.58 s | `step1-three.txt` |
| after step 2 | 12 failed, 68 passed | 53.48 s | `step2-three.txt` |
| after step 3 (final) | **3 failed, 77 passed** | 58.20 s | `step3-three.txt` |

Final per file: `p14b10-conflict-evidence` 20/20 (3.2 s); `p14b10-mentor-label` 9/9 (52.2 s; the positive leaf
takes 50.7 s against its declared 30,000 ms budget and passes because the fixture build is synchronous);
`p14b5-relationships` 48/51 (47.3 s).

The three failures, raw:

```text
FAIL tests/p14b5-relationships.test.ts > family 6b ... > a player issuer: both a close tie and an enemy (with conflict evidence) on the roster ...
AssertionError: expected 'Enemies' to be 'Strained'   at tests/p14b5-relationships.test.ts:1043:42
FAIL tests/p14b5-relationships.test.ts > family 6b ... > a player issuer: only the enemy (with conflict evidence) on the roster ...
AssertionError: expected 'Enemies' to be 'Strained'   at tests/p14b5-relationships.test.ts:1055:42
FAIL tests/p14b5-relationships.test.ts > D5 REASON SENTENCE ... > BRANCH 1 over 0 ...
AssertionError: expected 'Enemies' to be 'Strained'   at tests/p14b5-relationships.test.ts:1149:42
```

Two probes, neither of them GREEN evidence, both deleted and the tree verified clean:
- **Premise counterfactual** (`probe-premise-counterfactual.txt`): a disposable copy of the p14b5 file with only
  those three lines flipped to `'Enemies'`, run with `-t "family 6b|D5 REASON SENTENCE"`: 5 passed. Every remaining
  assertion of the three leaves holds on the final tree: the both-present settlement goes to the player with the
  close-ties sentence, and the enemy-only settlement goes to r01 with the at-odds sentence.
- **Wiring injection** (`probe-wiring-injection.txt`): the same copy, with `relationshipsReasonSentence`'s band-1
  return changed to `'INJECTED band-1 sentence'`: the two band-1-over-0 settlement leaves fail with
  `expected [ 'INJECTED band-1 sentence' ] to deeply equal [ Array(1) ]`. The settlement reason reaches the
  receipt through the accessor. I restored the file with `git checkout` in the scratch tree.

Type gates on the final tree:
- root `tsc --noEmit`: **exit 2**, two errors, both `TS2345` in `tests/p14b5-t-failure-tuning.test.ts:295:36` and
  `:373:91`: "Property 'sharedCompetitions' is missing in type '{ closeness: number; lastEventWeek: number; }'" (1 min
  0 s). At step 1 the same two errors appear, plus the expected `TS2307` for the missing `relationshipLabels.js`
  until step 3. Step 2 was not type-checked separately.
- `tsc -p ui/tsconfig.json --noEmit`: exit 0 (54.7 s).
- `tsc -p tsconfig.bridge.json`: exit 0 (1 min 27.6 s).

## Other relationship-reading test files

The grep covered tests importing `src/core/relationships` or `bridge/relationships`, or using `currentTier`, the
settlement reason text or `settlementReasons`, plus the callers of the extracted take list. Each ran once on the
final tree (`final-neighbours-A.txt`: 617 s; `final-neighbours-B.txt`: 269 s).

| File | Final | Base |
|---|---|---|
| tests/p14b9-casting-competition.test.ts | 12 passed, 1 skipped (the pre-existing `it.skip` at :494); the :339 Strained pin holds | |
| tests/p14b5-t-failure-tuning.test.ts | 12/12 at runtime (type errors above) | |
| tests/p14b9-casting-copy.test.ts | 2/2 | |
| tests/p14c3-offmenu-extensions.test.ts | 8/8 | |
| tests/bridge-p14b6-relationship-read-models.test.ts | 24/24 | |
| tests/bridge-p14b6-e714-false-empty-absence-lines.test.ts | 7/7 | |
| tests/bridge-p14b6-d2-withheld-employment-claim.test.ts | 2/2 | |
| tests/bridge-p14b9-casting-expiry.test.ts | 4/4 | |
| tests/bridge-p14b9-casting-readers.test.ts | 4/4 | |
| tests/bridge-p14c3-read-models.test.ts | 10/10 | |
| tests/bridge-p14c3-dual-career-surfaces.test.ts | 3/3 | |
| tests/bridge-p14a1-market.test.ts | 16/16 | |
| tests/bridge-p14a2-market.test.ts | 16/16 | |
| tests/bridge-p14c2rm-proposals.test.ts | 13/13 | |
| tests/bridge-p14b5-relationships.test.ts | 5 failed (family 12 natural-chain ledger) | same 5 |
| tests/bridge-p14b2-trust.test.ts | 8 failed (fixture: "no natural rival-only promise outcome by 240"; "expected 208 to be 52") | same 8 |
| tests/bridge-p14c2rm-retirement.test.ts | 2 failed ("freeze premise: counterpart stays lawfully disclosed") | same 2 |
| tests/p14b1-trust-chooser.test.ts | 1 failed (`expected 'compensation' to be 'opportunity'`), 2 skipped | same 1 |
| tests/p14b2-fixture-preconditions.test.ts | 2 failed (same fixture messages) | same 2 |
| tests/p14b9-save-v42.test.ts | 12/12 | |
| tests/p14c3-transitions.test.ts | 35/35 | |
| tests/p14c3-cohort-transition.test.ts | 9/9 | |
| tests/p14c3-equal-tuple-evidence.test.ts | 4/4 | |
| tests/p14c3-held-actor-evidence.test.ts | 6/6 | |
| tests/p14c3-transition-owner-and-snapshots.test.ts | 3/3 | |
| tests/p14c3-canonical-rival-history.test.ts | 2 failed ("L passive work premise ended without an obligation") | same 2 |

I re-ran every file with a failure at BASE (the r4 commit, whose `src` is the `c4e3bd4b` archive):
`base-neighbours-5.txt` (262.6 s) and `base-canonical-rival.txt` (82.0 s). The 20 failing leaves are the same
leaves at BASE, with identical header lines, first assertion lines and full `Expected`/`Received` strings (the
family 12 digests included). These are pre-existing natural-chain and fixture failures that also appear in
earlier full-core records (for example 1327-X, 1333-I and 1338-I). None comes from slice A.

## Findings against the authority

**F1 (blocking 80/80; RED defect).** Three leaves in the r4-applied `tests/p14b5-relationships.test.ts` assert
`expect(currentTier(enemyEdge, F6.W)).toBe('Strained')` at :1043, :1055 and :1149. The edge they read is staged at
`floor('Enemies')` = 11 with `{ sharedCompetitions: 3 }` (:1038, :1052, :1145) and one week of dormancy. For the
same input, `tests/p14b10-conflict-evidence.test.ts:151` requires `'Enemies'`, as do D-1312-1, 1342-O item 8 and
the brief. No single law satisfies both. The 6b enemy-only and BRANCH 1-over-0 leaves contradict themselves: their
settlement expectation (the player at band 0) requires that same edge to read Enemies. Each line's comment says
"measured at BASE (v1)", and the :1043 comment adds "v2 would read 'Enemies' here". The three reviews did not flag
it. Remedy: a test-author revision r5 changes `.toBe('Strained')` to `.toBe('Enemies')` on those three lines and
updates their comments. The premise counterfactual above shows the rest of each leaf passes on this production.
Production must not accommodate these lines. Reading Strained there would break the Owner ruling and six leaves of
the conflict-evidence file (the tier assertions at :154, :159, :161, :198, :207, :385 and :401).

**F2 (root type gate; test-side consequence of the mandated signature).** `tests/p14b5-t-failure-tuning.test.ts:295`
and `:373` call `currentTier({ closeness, lastEventWeek }, week)`. At runtime the file passes 12/12, because a
missing counter compares as `undefined >= 3`, which is false. Two alternatives:
- (A) Test-author adds `sharedCompetitions: 0` to the two literals in the same r5. The parent's API stays as
  decided, and a caller that forgets the counter gets a compile error.
- (B) Production widens the parameter to an optional `sharedCompetitions`. No test changes, but an omitted
  counter then reads "no evidence" silently.
Recommendation: A. It keeps the brief's exact signature and fails loudly.

**Notes (no action required by slice A):**
- 1347-A §6 item 5 (whether an unmanaged production can seat a cohort entrant without a first take): I read the
  source only. `tick.ts:1132-1142` appends the player's takes and every rival's through one `appendFirstTakes`, and
  cohort entrants exist only from V35, when that path is live. No test here proves it.
- 1347-A §6 item 8 (withhold Mentor on rival pictures until all three are public) is a disclosure rule for the
  slice B Bridge label. The core derivation publishes nothing.
- The `mentorEvidence` week bound is `state.market.tick`. The validator already bounds every take by it.
- Wire and Unity: no schema change. The tier enum already lists Enemies and Nemeses
  (`bridge/schema/bridge-schema.ts:1971`), so those values can now travel in the existing tier field with no
  coordination step. I ran no native test.
- The Mentor positive leaf's 50.7 s against its declared 30 s budget is a fixture-cost fact
  (`cohortThreeFilms`), not a production cost.

## Evidence limits

These are scratch-tree results on `c4e3bd4b` sources. Every patch applies to `5c2ba11a`, and no source file moved
in between. The runs are single samples. No broad suite ran. The "no stored value reconciled" conclusion rests on
the greps and reads cited above plus the Save42 witness file. It is not an exhaustive proof over every save
version's reader.

## Next action

The parent routes F1 and F2 to the test-author as RED r5: five lines in two test files, no production change. Then
the parent re-runs the three RED files, `tests/p14b5-t-failure-tuning.test.ts` and the root type gate on the step 3
patch, and sends the patch to implementation review, which checks the `relationshipsReasonSentence` call.
