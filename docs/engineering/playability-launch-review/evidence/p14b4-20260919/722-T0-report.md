# 722-T0 report — genuine outgoing Save V31 fixtures minted (P14B.7 T0)

Role: independent test engineer. Authority: `721-T0-v31-mint-brief.md`. Mode: the brief's own
one-off minter pattern (B.5's `648-mint-final-v30`/`648-mint-support` precedent), read in full
before writing anything, per the brief's instruction. No production file, schema, version
constant, existing test, existing helper or existing fixture was changed. Nothing was committed.
The evidence runner was not invoked. The full suite was not run — only the new minter file, and
one disposable probe (`tests/_zz-probe.test.ts`, deleted before hand-back; see housekeeping below).

**Verdict: DONE.** All 9 fixtures in the 721 roster were minted through real action paths. None
was hand-assembled. No roster item required a substituted or narrowed claim.

## Housekeeping raised mid-task, addressed

1. **`tests/_zz-probe.test.ts` deleted.** It was a throwaway two-line probe (stage/script-mode
   facts) I used to decide the `part-served-p1` route before writing the real builder. Confirmed
   removed (`ls` exit 1) before this report. `tests/` holds no file I did not intend to leave —
   verified with `git status --porcelain` at the end of this task (output below).
2. **`scripts/v31-mint-support.ts` and `tests/bridge-p14b7-mint-v31.test.ts`: REMOVED from the
   tree**, matching the B.5 precedent's own disposition (`scripts/v30-mint-support.ts` and
   `tests/bridge-p14b5-mint-v30.test.ts` do not exist in this tree today; only their archived
   `.executed.ts.txt` copies and the minted fixtures do). Both files were copied byte-for-byte to
   `722-mint-final-v31.executed.ts.txt` / `722-mint-support.executed.ts.txt` in this directory
   BEFORE deletion; their sha256 (below) matches `minterSha256`/`supportSha256` recorded inside
   the mint's own `MANIFEST.json`, so the archived text is provably what actually ran. I am
   recommending removal rather than leaving them tracked, since (a) that is what B.5 did, (b) the
   B.6-style "untracked producer code is forbidden" gate inside my own `gate()` would otherwise
   refuse a re-run of this exact file with a stale env var, and (c) a live `.ts` copy under
   `tests/` is exactly the class of stray file the parent flagged as a baseline hazard. If the
   parent wants them left in place instead (e.g. to inspect before archiving), say so — nothing
   about T0 depends on which state they end up in, since the actual deliverable is the fixture
   corpus plus its two archived text copies.

Final `git status --porcelain` (only the fixture corpus and archived text are mine; the six
modified docs and `723-C` are the parent's own concurrent edits, untouched by me):

```
 M docs/engineering/playability-launch-review/CODEX-START-HERE.md
 M docs/engineering/playability-launch-review/CONTINUATION-STATE.md
 M docs/engineering/playability-launch-review/HEADLESS-PROGRESS.md
 M docs/engineering/playability-launch-review/evidence/p14b4-20260919/00-start.md
 M docs/engineering/playability-launch-review/evidence/p14b4-20260919/720-b7-waiver-expansion.md
 M docs/engineering/playability-launch-review/plans/P14-HEADLESS-PLAN.md
?? docs/engineering/playability-launch-review/evidence/p14b4-20260919/721-T0-v31-mint-brief.md
?? docs/engineering/playability-launch-review/evidence/p14b4-20260919/722-mint-final-v31.executed.ts.txt
?? docs/engineering/playability-launch-review/evidence/p14b4-20260919/722-mint-support.executed.ts.txt
?? docs/engineering/playability-launch-review/evidence/p14b4-20260919/723-C-b7-expansion-audit.md
?? tests/fixtures/p14/genuine-v31-pre-b7/
```

**Version constants verified untouched at the end of this task** (both by direct read and by
`git status --porcelain` reporting no change to either file):
- `src/core/save.ts:6409` — `export const LIVE_SAVE_VERSION = 31 as const;`
- `bridge/schema/bridge-schema.ts:258` — `export const PROJECTION_VERSION = 49 as const`

## Identities at mint (both, as 645-A did for V30, and as the brief required)

| fact | value | how verified |
| --- | --- | --- |
| observed head | `152ee9a4be0502d6a1d1f6cf50573660717b0c98` | `git rev-parse HEAD`, run myself, twice (before and after the mint) |
| last BEHAVIOURAL V31 writer | `caa8cdb39c4f92598777b7b54f84b23cde03cc40` | as given in the brief; used as the pinned `testedSourceSha` |
| last writer of `src/core/save.ts` | `f5310afb5b503362aa90eee1c8090e326b0fd9ea` | `git log -1 --format=%H -- src/core/save.ts`, run myself |
| producer diff `caa8cdb3..HEAD` over `src/` | **EMPTY**, confirmed | `git diff caa8cdb3 152ee9a4 -- src \| wc -l` → 0; `git diff --no-color --no-ext-diff caa8cdb3 152ee9a4 -- src \| shasum -a 256` → `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` (the empty-string SHA-256) |
| closeout authority | `718-b6-checkpoint.md`, sha256 `652d08f304a245de469e4d2a153e4bbab08eab862a1bb819d01839f14f379e7f` | `shasum -a 256`, run myself |
| projection / protocol / save / promise rules / relationship rules | 49 / 4 / **31** / 4 / 1 | read directly from `bridge-schema.ts:258` (49), `bridge-schema.ts:21` (`PROTOCOL_VERSION = 4`), `save.ts:6409` (31), `promises.ts:45` (`PROMISE_RULES_VERSION = 4`), `relationships.ts` (`RELATIONSHIP_RULES_VERSION = 1`) |
| schemaId | `sha256:60af24c58bc4bea8f04e7fc818f8401daeadd87da91252e60cfcf3ee028d8e1b` | taken from `718-b6-checkpoint.md`'s own "after" column (the accepted B.6 value), asserted equal to the live `SCHEMA_ID` import inside the minter's `gate()` — the assertion held (the mint ran) |

The B.6 fact from the brief — "B.6 moved `bridge/` and `generated/` but not `src`" — is why my
`gate()` differs in shape from the V30 precedent's two-rung `testedSourceSha`/`textOnlySourceSha`
pair: there is no intermediate text-only-pass commit in this range to name (the `src` diff between
`caa8cdb3` and HEAD is not "small and comment-only", it is **exactly zero bytes**). I built a
single-rung gate instead: `srcProducerDiffSha256` pinned to the empty-string hash, asserted by
re-computing `git diff --no-color --no-ext-diff caa8cdb3 HEAD -- src` inside `gate()` itself at
mint time (not trusted from this report). This is a deliberate, disclosed adaptation of the
precedent to the actual facts of this range, not a narrowing of what the brief asked me to verify.

## What was produced

- `scripts/v31-mint-support.ts` (support module) — ARCHIVED as
  `722-mint-support.executed.ts.txt`, sha256 `e60fd6ccb303ccf19cb96790f970a9a4c11d82e5f4bd54aa6727ef1914453124`
  (matches `MANIFEST.json`'s `supportSha256`). Removed from the tree after archiving (see
  housekeeping above).
- `tests/bridge-p14b7-mint-v31.test.ts` (the gated one-off minter) — ARCHIVED as
  `722-mint-final-v31.executed.ts.txt`, sha256 `d4a432bc2abfb13d3dd95aa4d589507342456d69140238a624775a2dfb5ee1c2`
  (matches `MANIFEST.json`'s `minterSha256`). Removed from the tree after archiving.
- `tests/fixtures/p14/genuine-v31-pre-b7/` — the 9-fixture corpus: 9 `.json.gz`, 9
  `.provenance.json`, 1 `MANIFEST.json` (19 files total, `ls | wc -l` confirms).

Gate kept exactly as the precedent specified: `STUDIO_MINT_V31_APPROVED=<head sha>` is the ONLY
thing that lets the ONE-SHOT case write anything; absent or mismatched, the gate throws before any
output directory exists (this is asserted inside `gate()`, which the DRY case never calls with a
mismatched value since it was run separately, and which I did not disable or bypass). The DRY case
(no token, no write) was run first and printed every world's facts for inspection; only after
reading that output did I run the ONE-SHOT.

**Command actually run** (exactly the precedent's shape, save name substitution):
```
STUDIO_MINT_V31_APPROVED=152ee9a4be0502d6a1d1f6cf50573660717b0c98 node_modules/.bin/vitest run tests/bridge-p14b7-mint-v31.test.ts --minWorkers=1 --maxWorkers=1
```
Result: `2 passed (2)` (DRY, then ONE-SHOT), `nodeVersion` `v20.20.2`, `startedAt`/`endedAt` inside
`MANIFEST.json`. Node/branch/HEAD/produced-file-byte-identity were all re-checked a SECOND time by
`gate()` itself between world-preparation and file-write (`mintV31Corpus`'s `final` re-gate),
exactly as the precedent does — nothing moved mid-mint.

## The emitted file table (sha256 and byte length, every file)

### The 9 compressed fixtures (`.json.gz`)

| filename | week | raw bytes | gz bytes | uncompressedSha256 | compressedSha256 |
| --- | ---: | ---: | ---: | --- | --- |
| genuine-v31-empty.json.gz | 0 | 383795 | 47272 | d5a5a9ad1d3819436fa47a91b519692506341d36172e9c60b4ea57c9eb57d98d | 449b8a8a34fd73f07d6e1275ffdfdaa7e15c1baef2424dd8a91475cea0fc67ec |
| genuine-v31-bound-open-p1.json.gz | 52 | 753251 | 88981 | 0ff9044f4529b3821efe3be92911bce10768fa03ff08653db2ac4ac0dda000eb | 6b5d54b485cdf661118506dcc26d42fd798fb29721154709a6bd208fd4ab769b |
| genuine-v31-bound-open-p2-lead.json.gz | 52 | 750349 | 88896 | 9b01ca9a91aea1a8022827e9cf748c04b64f25666f407b955d2f59fddbb6b495 | fcf9beaec5cf8e266d8018a979c1a9aa555976b54075e436fc9b9feafbd65018 |
| genuine-v31-bound-open-p2-lead-or-antagonist.json.gz | 52 | 750361 | 88904 | 197c87da5a178a7fab21e1381a7009eaa403d78108ba586ff1dc4267d47b133c | 9489c93cadccd7045fc2e1563e8c0c2d667e0603eff407738b9f06bb9e86ceda |
| genuine-v31-part-served-p1.json.gz | 113 | 1046657 | 119028 | 2a7a34e57b653cba8ad553d7dfc5894a2595b9f44f50eabae823fea34f3681fd | 12d5e642c9d5efc7129530a451e3426f30b4cb68a13b1bdaee17a6cd428e9f08 |
| genuine-v31-kept-and-broken.json.gz | 61 | 821651 | 97081 | 734f671b4617ffb2899ef2326ac8dff00358878be8adbc77f2a2b28d99f010d1 | 57362b7e282d8ba85f377b558fea50397ac134531e02de8159541775f0172841 |
| genuine-v31-rival-current-p1-and-p2.json.gz | 196 | 1156878 | 123732 | cf74ef396cdaad0c383c6840cd954f1f7d1ab518b2282fb95911736d1c25467a | f7086ec899dbb312ca9c23fc2cd98e929415d1a6e0f8e96eaa875c7a4cc97e99 |
| genuine-v31-with-edges.json.gz | 213 | 1156438 | 123641 | eb516760bd9a633906cee2cb9a82c855944cb5448b074d40e77ec72fc20a7054 | 2dce6bfe05f68a20d40f5887171138769848e27c9b147196a59ca6072eb48e6c |
| genuine-v31-distrusted-issuer.json.gz | 70 | 864686 | 100183 | 92dee5918c52c164ca7f4750b861b3c395c70c40cd08ab37045040898d31a958 | 1e800333647b8b270a8eba7f563aeafa40330b4d15e5b598cc83c8a517ddadf4 |

Every `compressedSha256` above was independently recomputed from the files on disk with
`shasum -a 256` (not read back from the manifest) and matches exactly.

### The 9 provenance files + MANIFEST.json

| filename | bytes | sha256 |
| --- | ---: | --- |
| genuine-v31-empty.provenance.json | 6550 | d4de9de7f8196d521f312eff69e54791a318575a6897c5dd0597b0ee0a08cdac |
| genuine-v31-bound-open-p1.provenance.json | 8210 | 84172a3f26ece7ca62af118ed2fc86ce467fba3c12d3b9c9f584776fd8a92905 |
| genuine-v31-bound-open-p2-lead.provenance.json | 7977 | 2d7da970a321d877c87862c156026956b6990811e17c08b77b11c976609a28b8 |
| genuine-v31-bound-open-p2-lead-or-antagonist.provenance.json | 8007 | fd4ebe85d3f5f418014b150bfdc1219cede5972e883614999cc87d32e99b7df2 |
| genuine-v31-part-served-p1.provenance.json | 7819 | 6479268c1a78b8041574c7cfdf938ffd95636f613ef72781b79070972bdbd7e6 |
| genuine-v31-kept-and-broken.provenance.json | 8386 | f5136cfedc68ee79944af5045de88139b4cc4d3f9072dc05d0ba439aab2da3c5 |
| genuine-v31-rival-current-p1-and-p2.provenance.json | 40390 | c4be7c99351608c774e005efeb9dc453ea75f109b0e225bbf50e9c4ddb42ad0b |
| genuine-v31-with-edges.provenance.json | 6631 | 202101fbd6ebebf9121eea97d69c53c99c6b97b59612cee16ab8b2aefc799c62 |
| genuine-v31-distrusted-issuer.provenance.json | 8100 | cc014f4ca8e080480beaabed8c74dcc3be1cc4e11d5da26d7876979a214afe80 |
| MANIFEST.json | 57343 | e48480c30d4dab1775e1728f5e254443dc4343727efb4130ca17cce9166284c7 |

`rootCounts` on every fixture reports `relationshipEdges` as the brief required (V31's own new
relationships root), alongside the carried-forward `promises`/`firstTakes`/`marketReceipts`/`currentProposals`.

## The roster, and what each fixture actually is (all 9 produced; none hand-built)

Every world below was built through `applyActions`/`tick` only — `submitProposal`, `attachPromise`,
`signContract`, `greenlight`, `assignShootingDirector`, `scheduleShootingTake`, `cancel`,
`releaseTalent` — never a hand-written promise, edge, or receipt record. Round-trip was verified
for every fixture inside `prepareV31Corpus`: `exportSave(makeSave(state))` → `validateSaveV31` →
re-export byte-identical → `importSave` → re-validate byte-identical → `BridgeSession.fromSaveJson`
round-trip with `promises`/`firstTakes`/`talentMarket`/`relationships` all deep-equal to the source
state. All of that ran and passed for all 9 fixtures, twice (DRY, then again inside the ONE-SHOT).

1. **`genuine-v31-empty`** — `p13aGeneratedStudio()` untouched. `promises: []`, `firstTakes: []`,
   `relationships: []`.
2. **`genuine-v31-bound-open-p1`** — reused the real, already-existing
   `tests/helpers/p14b2-fixtures.ts:retentionFixture().bound` (two real winning contracts, two
   real bound OPEN `APPEARANCE_COUNT` promises, `contractId !== null`, `outcome === null`).
3. **`genuine-v31-bound-open-p2-lead`** — a fresh real route (copied from the shape of
   `tests/p14b4-cast-class-outcomes.test.ts`, never imported): sign 6 real people, real
   `submitProposal` + `attachPromise` of `LEAD_OR_SIGNIFICANT_ROLE_COUNT` `{kind:'castRoleCount',
   count:1, seatClass:'lead'}` for a renewal window, real freeze binds it. `promiseCastSlots`
   returns `['lead']` for this record — the strongest class, the equality case of the subset test
   720 describes.
4. **`genuine-v31-bound-open-p2-lead-or-antagonist`** — the same route, `seatClass:
   'leadOrAntagonist'`. `promiseCastSlots` returns `['lead','antagonist']` — the middle rung.
5. **`genuine-v31-part-served-p1`** — a bound OPEN `APPEARANCE_COUNT` promise with `predicate.count
   = 2`, ONE real qualifying first take filmed, landing `0 < progress(1) < predicate.count(2)`,
   `outcome: null`. **This is the fixture that surfaced a real engine constraint** (detailed below).
6. **`genuine-v31-kept-and-broken`** — reused `retentionFixture().outcomes` (real first-take
   SATISFIED plus same-week early-termination BROKEN via `releaseTalent` →
   `breakPromisesOnTermination`).
7. **`genuine-v31-rival-current-p1-and-p2`** — a real tick loop (no action beyond `tick` itself)
   from `p13aGeneratedStudio()`, stopping at the first week where the rival's current unbound
   attachments include BOTH `APPEARANCE_COUNT` and `LEAD_OR_SIGNIFICANT_ROLE_COUNT`. That week is
   196 for the default seed — the same week the V30 precedent found, because `authorRivalPromise`
   (`talentMarket.ts`) is unchanged between V30 and V31.
8. **`genuine-v31-with-edges`** — reused `rivalFixture().terminal` (week 213; 27 real relationship
   edges from real shared first takes across the campaign, `sharedProduction`,
   `repeatedCollaboration`, `sharedFailure`, `sharedSuccess`, `cancelledAfterFirstTake` all
   present in `recent` driver rows on sampled edges). `convertV31ToV30` on this exact state was
   NOT exercised by my minter (out of T0's scope), but the code path it would hit
   (`projectRelationshipsPreV31` throwing on a non-empty root) is visible directly in `save.ts` and
   matches 721's claim.
9. **`genuine-v31-distrusted-issuer`** — the fixture the brief flagged as "most likely to resist."
   **This is the second fixture that surfaced a real engine fact**, detailed below.

## Two real engine facts this mint surfaced (not narrowed claims — actual measured behavior)

### (i) A `predicate.count ≥ 2` P1 needs a SECOND existing-pipeline opening, not just the stock door

`promiseFeasibility`'s existing-path test (`promises.ts`, `existingPath = seatedPreFirstTake +
unproducedScripts + (stockGreenlightAvailable ? 1 : 0)`) requires `reserved + X <= existingPath`.
A fresh generated studio's `stockGreenlightAvailable` contributes at most 1 (boolean), and
`unproducedScripts` reads 0 unless the studio has switched `scriptDevelopment.mode` to `'managed'`
via the real `activateScriptDevelopment` action — which I first tried, and which **changes the
`greenlight` admission rule itself**: once managed, `greenlight` refuses anything but a `Ready`
script project (`productionAdmission.ts:106-110`, measured directly:
`applyActions: greenlight rejected — managed studios must greenlight an authoritative Ready script
project`). That is a real, load-bearing side effect of `activateScriptDevelopment`, not a
free extra existing-path credit — using it would have forced every later greenlight in that
fixture through the script pipeline. I did not use that route. Instead I measured that a fresh
studio holds **two** soundstage facilities
(`facility-soundstage-07`, `facility-soundstage-12`), so a real throwaway greenlight that seats the
target pre-first-take (P1's mask is every `CastSlot`, so any seat counts) leaves the SECOND
stage's stock door open: `seatedPreFirstTake(1) + stockGreenlightAvailable(1) = 2`, satisfying
`X=2`. I verified this is re-checked at the freeze too (`talentMarket.ts`'s `attachedFeasibility`
reads `promiseFeasibility` again over the proposal's interval before committing), so the throwaway
had to stay unfilmed through the freeze, and only then was safe to `cancel` (verified
`breakPromisesOnCancel` reads `targetSpecificImpossibility`, a pure time-window test, not an
existing-path one — cancelling it after binding did not break the just-bound promise, given the
90-week due-week margin I used).

**Why this matters beyond the fixture:** 720 §5(c)'s recommendation — a waived promise's
substitute may need only the REMAINING count, not the original — is a count-arithmetic
recommendation and is unaffected by this. But if the eventual writer reuses
`promiseFeasibility` (correctly, in place of `reclassifyPromise` — see below) to judge a
substitute whose remaining count is 2 or more, this existing-path wall is real and will bite: a
studio near the end of a long campaign with only one soundstage in active use, no spare stock
concept, and no committed script will read a 2-count substitute as FRAGILE even when the schedule
window is generous. That is a genuine product-relevant fact for whoever designs the substitute
feasibility check, surfaced by actually building the state rather than by reading the function.

### (ii) `trustDescriptor`'s Distrusted label tolerates a positive driver alongside the negatives — it is NOT "zero positives required"

For `genuine-v31-distrusted-issuer` I bound a `P2-lead` promise FIRST (while the person's trust
in the studio was still undetermined/Reliable-by-fallback), then earned two REAL negative
`cancelledAfterFirstTake` drivers by casting the same person (as `antagonist`, outside the
`lead`-only mask) in two throwaway productions, filming a real take in each, then cancelling each
AFTER the take (`breakPromisesOnCancel` early-returns once `state.firstTakes.some(t =>
t.productionId === cancelled.id)`, measured directly — the bound `lead` promise was never touched).
`trustDescriptor(state, talentId, studioId, week)` read `{label: 'Distrusted', scope: 'person'}` —
but its `drivers` array held **three** rows, not two: the two `cancelledAfterFirstTake` negatives,
plus a `ranToEnd` POSITIVE driver at week 52, from the target's own FIRST 52-week contract running
to its natural end (the renewal that carries the P2-lead promise necessarily starts right where
that first contract ends, by the same submit-then-freeze-at-contract-end pattern every fixture in
this codebase's helper file uses). `label()`'s actual rule
(`promises.ts`) is `negative >= TRUST_DISTRUST_MIN_NEGATIVES(2) && negative > positive` — 2 > 1
holds, so the label is still `Distrusted`, but this is NOT "no positive driver may exist," which
is what a naive reading of "at least two negative drivers" might suggest. This is consistent with
720/723-C's citations (I did not find this contradicts anything either record claims), but it is a
concrete, previously-unmeasured fact about how easily a real campaign produces a MIXED driver set
even for a deliberately-engineered Distrusted fixture — worth keeping in mind for whoever writes
the RED suite's own Distrusted-refusal fixture or assertion, since asserting "only negative
drivers present" would be a false requirement.

## On record 720 / 723-C

The parent's mid-task message reported that an independent read-only audit (723-C) found and the
parent verified three defects in 720, now fixed: `reclassifyPromise` wrongly cited as a shape to
copy for the substitute's feasibility (it passes the promise's own window as the "contract
interval," making both of `promiseFeasibility`'s contract-fit refusals tautological); the
substitute's `feasibilityReceipt` never named as required exact-key output; and no refusal for
waiving a non-`evaluable()` promise. I did not re-derive these — per the parent's instruction I am
not spending T0 effort re-auditing 720 — but I CAN independently corroborate the first one from my
own earlier reading of `promises.ts` (before the parent's message arrived, as part of verifying
720 §3/§4's claims for this report), because I had already read `reclassifyPromise` in full:

```
export function reclassifyPromise(state: GameState, promise: ProfessionalPromise, week: number): PromiseFeasibilityReceipt {
  return promiseFeasibility(state, {
    family: promise.family, issuerStudioId: promise.issuerStudioId, beneficiaryPersonId: promise.beneficiaryPersonId,
    predicate: promise.predicate, windowStartWeek: promise.windowStartWeek, dueWeekExclusive: promise.dueWeekExclusive,
    startWeek: promise.windowStartWeek, termWeeks: promise.dueWeekExclusive - promise.windowStartWeek,
    promiseId: promise.promiseId,
  }, week)
}
```

`startWeek` is set to `promise.windowStartWeek` and `termWeeks` to `dueWeekExclusive -
windowStartWeek`, so `draft.windowStartWeek < draft.startWeek` is `windowStartWeek <
windowStartWeek` (always false) and `draft.dueWeekExclusive > draft.startWeek + draft.termWeeks`
is `dueWeekExclusive > dueWeekExclusive` (always false) — `promiseFeasibility`'s two contract-fit
refusals (`promises.ts` around the `windowStartWeek < startWeek` / `dueWeekExclusive > startWeek +
termWeeks` checks) can never fire through this call shape, exactly as 723-C states. I confirm this
independently; I did not myself catch it as a defect in 720 before the parent's message (I had
verified `reclassifyPromise` exists and re-runs feasibility at an arbitrary week, which is true,
without scrutinizing this specific interval-substitution consequence for the "remaining contract
interval" reuse case) — full credit for the finding belongs to 723-C, not to this report.

**Beyond that, I found no engine fact record 720 §3/§4 gets wrong.** Independently verified before
the parent's amendment message arrived, all against the current source at `152ee9a4`:
- `WAIVED`/`VOIDED` are enumerated `PromiseOutcome` members no path reaches (`types.ts:2173`,
  `promises.ts` comment above `advancePromisesWeek`) — confirmed, no writer sets either.
- `WAIVED` is already on the wire enum (`bridge/schema/bridge-schema.ts:1770`,
  `PROMISE_OUTCOMES = ['SATISFIED', 'BROKEN', 'WAIVED', 'VOIDED']`) — confirmed; publishing it
  needs no projection bump.
- `settle()` (`promises.ts`) is generic over any terminal-outcome write (`progress`,
  `evidenceRefs`, `outcome`, `outcomeCause`, `outcomeEventId`) and appends exactly one
  `promiseOutcome` receipt — confirmed reusable as described.
- `promiseCastSlots` masks match 720's table EXACTLY: count-only P1 → `CAST_SLOTS` (all three,
  weakest), `leadOrAntagonist` → `['lead','antagonist']` (middle), `lead` → `['lead']`
  (strongest, narrowest mask) — confirmed by direct read AND by building fixtures 3/4 above and
  observing exactly these masks govern which cast seat counts.
- `evaluable()` requires `outcome === null && contractId !== null` — confirmed exactly, and
  confirmed in practice: every "bound OPEN" fixture above satisfies it, and `breakPromisesOnCancel`
  / `breakPromisesOnTermination` both gate on it via `evaluable(promise)` before touching anything.
- `attachPromise` requires a CURRENT proposal and throws otherwise, and refuses a second promise on
  an already-carrying proposal — confirmed by direct read; not exercised as a failure path by this
  mint (every promise I attached rode a fresh proposal), so this is a source-read confirmation, not
  an execution one.
- `TRUST_DISTRUST_MIN_NEGATIVES = 2` (`promises.ts:78`) — confirmed by direct read AND by
  execution: fixture 9 needed exactly two negative drivers to cross into Distrusted (measured;
  `diNegatives.length === 2` and the label was still Reliable/Mixed-by-construction before the
  second cancellation — I did not separately snapshot the intermediate one-negative state, but the
  final assertion depends on the real accumulated count, not an assumed one).

## Not exercised (explicitly out of T0's scope)

`waivePromise`, `waiverAccepted`, and any V32 shape do not exist yet and I did not write, stub, or
reference them — T0 is fixture-minting only. I did not run the evidence runner
(`record-check.mjs`) and did not run the full suite; the only suites I ran were the two `it()`
cases inside `tests/bridge-p14b7-mint-v31.test.ts` (now archived) and, before that, the disposable
`tests/_zz-probe.test.ts` (deleted).

## Remaining defects / evidence limits

None found in the mint itself — all 9 fixtures round-tripped cleanly (`exportSave`/`importSave`/
`validateSaveV31`/`BridgeSession` all agreed) and every roster item was produced through real
action paths with no hand-assembled state. The two engine facts in the section above are not
defects in the engine; they are constraints future work (the B.7 writer, and whoever finalizes
720/723-C) should know about, surfaced only because minting made real contact with
`promiseFeasibility`'s existing-path arithmetic and `trustDrivers`' full driver set rather than
reasoning about them from the source alone.

## Next concrete action

None required of me under T0. The parent holds HEAD at `152ee9a4` per their message; publication
(committing the fixture corpus, the two archived `.executed.ts.txt` files, and this report) is
the parent's call, as is the disposition question raised in Housekeeping item 2 above if they
prefer a different outcome than "removed after archiving."
