# 808 — P14C.2b-T0 corpus minted

Authored under the test-author role contract (`.claude/agents/test-author.md`); roles are not
registered in this session, so this record runs as a general-purpose agent carrying that contract.

Source `68783a8acb53aba4989829a2f6ddf95d8d544bc3` (published; `src/` is the FINAL V35 writer — C.4
closed at record 805 — before any C.2b source change). Minter archived at
`808-mint-v35-c2b-corpus-minter.test.ts` and removed from `tests/` after use, so no suite collects it.
Built on the 774/775/790/791 T0 pattern: three worlds, each built and PROVED by `expect()` before any
byte was written, round-tripped in memory, written with `wx`, then re-read from disk and re-validated
through `validateSaveV35`.

## Commands and outcomes

```
node_modules/.bin/vitest run tests/p14c2b-mint-v35-corpus.test.ts --minWorkers=1 --maxWorkers=1
```
Run without `STUDIO_MINT_V35_C2B_CORPUS_APPROVED` set: 1 test **skipped**, exit 0, 2.79s (2026-09-26
03:27:22–03:27:26 CEST) — confirms the minter is inert by default.

Gate checks (run immediately before the approved attempt): `git status --porcelain` over
`src/ bridge/ generated/ ui/ scripts/ tests/helpers/ tests/fixtures/ package.json package-lock.json`
was empty; `git rev-parse HEAD` was `68783a8acb53aba4989829a2f6ddf95d8d544bc3`; `git ls-remote origin
wip/headless-program-20260916-ts` returned the same sha. (A concurrent, other-owned session was
independently visible in this same working tree at the time — three pre-existing test files carried
uncommitted modifications, and a new evidence file `809-coverage-debt-repair.md` appeared alongside
this record's own 807/808 — all OUTSIDE the gate's protected-path list, matching 790/791's own
precedent for the identical situation; no action taken on any of it, and the gate itself measured
clean regardless.)

```
STUDIO_MINT_V35_C2B_CORPUS_APPROVED=$(git rev-parse HEAD) \
  node_modules/.bin/vitest run tests/p14c2b-mint-v35-corpus.test.ts --minWorkers=1 --maxWorkers=1
```
One approved attempt (2026-09-26 03:27:36 CEST start): PASSED, exit 0, 39.16s (tests 36.41s,
`worldBuildMs` 33500.7ms). All three worlds built, proved, written, re-read and re-validated on the
first try — no failed approved attempt, no re-run needed. `publishedRecoverySha` resolved to the same
sha as `headSha` (`git ls-remote origin wip/headless-program-20260916-ts` returned the minting head),
so `publicationState` reads `PUBLISHED`.

## Files written, with sha256 (verified by re-reading every file from disk after the mint and comparing
`shasum -a 256` against each fixture's own `compressedSha256`; all three matched)

| file | sha256 (compressed) | bytes | save week |
| --- | --- | --- | --- |
| `genuine-v35-c2b-contract-gap-freeagent-expiry.json.gz` | `f35bd6868904b9b6308e27400ce862d503951c904e4e8007ee25003f187ffee4` | 92767 | 52 |
| `genuine-v35-c2b-contract-at-effective-week.json.gz` | `c339695f855e2daf97be959a7a0c75a6ccae72878dc070aef25da4890d694bf3` | 93155 | 52 |
| `genuine-v35-c2b-rival-incumbent-cohorts.json.gz` | `afb89ad0a5f1e972564d1389c800fb544e5082e8a8dddb4bbd5a2a43520e085d` | 566384 | 2600 |

Each has a sibling `.provenance.json` (headSha, publishedRecoverySha, saveVersion 35, minter sha256,
minter archived path, node version, `startedAt`/`endedAt`, command, seed/recipe, and every axis's
measured focus facts), plus one `MANIFEST.json` covering all three. Minter bytes archived at
`808-mint-v35-c2b-corpus-minter.test.ts`; its own sha256
(`92280570adc6661cf02f913da0c2f7da15e33f1969a0387eb82d514acda8bdf7`) is recorded inside every fixture's
provenance (`minterSha256`) and matches the archived copy exactly. Probe bytes archived at
`807-c2b-t0-probe.test.ts.txt`, sha256 `4dc40d12ade2f9da811d6722d0b0a7d1788827a9d1f6dd7e2b8274f717a212fb`.

## Axes minted, by world

**1. `genuine-v35-c2b-contract-gap-freeagent-expiry`** (seed `p14c2b-corpus-01-ade`, week 52)
- **a**: an authored hard-boundary actor (age 70 at week 0) under a 98-week PLAYER contract signed at
  week 0. Announces `hardBoundary` at week 52 (age 71); `E = max(104, 98) = 104` (the contract does
  NOT dominate, since 98 < 104). Contract `endWeekExclusive` 98 falls in `(E-12,E) = (92,104)`. Saved
  at week 52, before `E-12 = 92`. Employer `studio-d7df6c8e-player`; contract row id
  `studio-d7df6c8e-player:contract:authored-0000:0:player-24`; implied extension term
  `104+52-98 = 58` weeks. Decline baseline at week 105: `retired`, `retiredWeek 104`, no active
  contract of any kind.
- **d**: a second authored hard-boundary actor, never given any contract. Announces `hardBoundary` at
  the same week 52, same `E = 104`. Confirmed: no player employment row and no rival employment row in
  force at `E-12 = 92` — structurally, no employer can ever be the sole extension issuer for this
  person (806 §4's discovery predicate has nothing to find). Decline baseline: `retired` at week 104,
  identical shape to axis a's.
- **e**: an unrelated authored director (age 40, far from any retirement window) under a 60-week
  contract. `caseOpenForTalent` is true at week 52; case `status: 'proposals_open'`, `openedWeek 48`
  (`= 60-12`), `decisionWeek 60` — an ordinary, retirement-unrelated renewal-window case, the exact
  shape the future V36 migration must stamp `variant: 'expiry'` onto. `retirementRecordFor` is
  `undefined` for this person, confirming no retirement interaction at all.

**2. `genuine-v35-c2b-contract-at-effective-week`** (seed `p14c2b-corpus-01-bf`, week 52)
- **b**: an authored hard-boundary actor (age 70, week 0) under a 150-week PLAYER contract signed at
  week 0. Announces `hardBoundary` at week 52; because this SAME contract is still in force at
  announcement and outlives `A+52=104`, it determines `E = 150` exactly — the companion draft's own
  literal "no gap, no overlap" case (780 §2). Decision week `150 = E`; implied extension term
  `150+52-150 = 52` weeks (the minimal, literal case). Saved at week 52, before `E-12 = 138`. Decline
  baseline at week 151: `retired`, `retiredWeek 150`.
- **f, weakly**: the same week-52 save is itself a cohort week (`isCohortWeek(52)` true), so
  `careerLifecycle.cohorts` already holds one receipt for week 52 — all-zero `requested`/`personIds`
  in this specific seed (genesis population already meets `COHORT_ACCEPTED_POPULATION` with a young
  member present in every role). `cohorts.length === 1 > 0` satisfies "non-empty," though world 3
  below is the richer pin for this axis.

**3. `genuine-v35-c2b-rival-incumbent-cohorts`** (`advanceTo(p13aGeneratedStudio('p14c2b-corpus-01-c1'),
2600)`, NO player action, NO `fund()` call)
- **c**: found NATURALLY on the FIRST seed tried, with no authored rival hire and no forced
  `enterRival` call. Subject `person-cohort-208-actor-1` was itself minted by a C.4 cohort receipt at
  week 208 (782/793's own replenishment mechanic, closed at 805), later hired by rival
  `studio-25969b11-r01` on a 208-week contract starting week 2496. Announces `hardBoundary` at week
  2566 (age 70); the SAME rival contract, still in force, determines `E = 2704` (ends exactly there —
  another instance of axis b's "no gap" shape, this time under a RIVAL). `E-12 = 2692`; the contract
  (2496→2704) is still in force there. Saved at week 2600, before `E-12`. Implied extension term
  `2704+52-2704 = 52` weeks. Of 10 `hardBoundary` records present at week 2600, this was the one whose
  rival contract was still in force at its own `E-12` (`rivalIncumbentHitCount: 1`). Decline baseline
  at week 2705: `retired`, `retiredWeek 2704`; confirmed NOT seated (`busyTalentIds` false) at the save
  week, so the decline settles straight to `retired`, never `finishing_commitments`.
- **f, richly**: this world's 2600 weeks of natural C.4 replenishment carry 50 total cohort receipts,
  42 of them with real minted entrants (`axisF_cohortsWithEntrants: 42`) — including the very receipt
  (week 208) that minted axis c's own subject. This is the natural, byte-for-byte V36 migration target
  780/806 ask for, far richer than world 2's all-zero receipt.

## "V35-engine continuation facts to E+1" (790's method, applied to C.2b), committed for every axis a/b/c subject

Every subject's provenance carries the DECLINE baseline: continuing the SAVED state under the real,
unmodified V35 engine (no `extensionIssuer`, no `retirementExtension` case variant, nothing C.2b adds
exists anywhere in this corpus's bytes or in `src/`) to `effectiveWeek + 1` via real
`advanceTo()`/`tick()` calls. All four measured subjects (a, d, b, c) settle to `status: 'retired'`
with `retiredWeek === effectiveWeek`, no active player contract and no active rival row — none was ever
seated, so none passes through `finishing_commitments` first. This is what happens with no offer and
no acceptance, which a future C.2b RED must reproduce exactly when nothing extends the person.

## Contradictions / interactions observed against 780/806's assumptions (measured, not fixed)

1. **`createTalent`'s `[18,70]` authoring clamp bounds "author directly at hard boundary" to `actor`
   only** (`actions.ts:778-779`; hard boundary exactly 70). `director`/`writer` (75) and `craft` (72)
   would need further natural ticking past the clamp edge, exactly as 775's own world 1 worked around
   for all four professions. Not needed here: axis d used a second `actor`, and 780 §6.3 names no
   required profession for that axis. Found mid-probe (revision 1 failed on this exact error) and
   corrected before any world was built past it — recorded in 807, not silently discarded.
2. **`TalentMarketCase.contractId` is the SAME `state.hollywood.employment` row id for both player and
   rival contracts** — `industryEmployment.ts`'s `recordPlayerEmployment` mirrors every player signing
   into the identical `employment` array `enterRival` writes to (confirmed by reading both call sites).
   "The contract row id" 780/806 ask this record to capture is therefore one field (`row.contractId`),
   never a separate player-only identifier — used identically for axes a/b (player) and c (rival).
3. **Axis c was reachable on the FIRST seed tried, at a modest 2600-week budget**, markedly easier than
   775's own C.2a-era "rival-in-window" search (which did not land every profession in one seed, under
   the pre-C.4 V33 engine with no population replenishment at all). The C.4 cohort mechanic (closed at
   805) appears to be the reason: it continuously replenishes the population over centuries, giving the
   rival restaffing loop fresh long-lived candidates throughout the whole run.

## What was NOT reached, and why

Nothing measured in 807 was left unreached: all six axes (a-f) were both measured reachable AND minted.
No fallback or authored-population escalation (a `-c2`/`-c3` search seed) was needed — the FIRST natural
seed tried for axis c already contained a hit.

## Verification performed

`git status --porcelain` after this record's work shows only: the two intended new test files (now
both deleted after archiving), the new `tests/fixtures/p14/genuine-v35-c2b-corpus/` directory, and the
new evidence files this task was assigned to write (`807-c2b-t0-measurement.md`,
`807-c2b-t0-probe.test.ts.txt`, `808-c2b-t0-corpus-minted.md`, `808-mint-v35-c2b-corpus-minter.test.ts`),
plus the pre-existing, other-owned concurrent changes noted above (outside this task's protected-path
gate) that this record did not touch and takes no action on. No existing fixture, test, or
`src/`/`bridge/`/`ui/`/`scripts/`/`tests/helpers/` file was touched. Every fixture's on-disk sha256 was
independently recomputed with `shasum -a 256` and compared against its provenance's `compressedSha256`;
all three matched (see table above). Every fixture was additionally re-read from disk and
re-validated through `validateSaveV35` inside the minter itself, plus three further post-write checks
against the re-read state directly (world 1: axis d's record cause; world 2: axis b's effective week;
world 3: the originating cohort actually contains axis c's subject id).

## Approval

`STUDIO_MINT_V35_C2B_CORPUS_APPROVED=68783a8acb53aba4989829a2f6ddf95d8d544bc3` (`= git rev-parse HEAD`
at mint time); `git ls-remote origin wip/headless-program-20260916-ts` returned the same sha both
immediately before and after the approved run, confirmed again at the close of this record's session.

## Next action for the parent

Commit the listed paths (this record's role is test-author/measurement only; it does not commit).
