# 1304-C: R2 busy-set/founding-draft release refusal — RED handback

Role: test-author (model: Claude Sonnet 5, `claude-sonnet-5`). Mode: IMPLEMENT — staged test
source and evidence only; no live-tree edit, no execution. Worktree
`/Users/zacheryspector/The-Movies-headless-program`, branch `wip/headless-program-20260916-ts`,
published HEAD `993e6b010e7406ea783c2bd5cb420d7fc148aaad`. Nothing under `tests/`, `src/`,
`bridge/`, `ui/`, `generated/`, `scripts/` or any config was created, modified or deleted; no
`vitest`/`tsc`/`node` was run on project code (the JSON neighbor inventory's syntax was checked
with a disposable `python3 -c "json.load(...)"` against my own authored evidence file only — not
project code, not a project tool).

## Files produced (all under `E` = `docs/engineering/playability-launch-review/evidence/p14b4-20260919/`)

| Path | Bytes | SHA-256 |
|---|---:|---|
| `E/1304-stage/tests/p14a1-release-busy-set.test.ts` | 23280 | `b6389ab6d6c4be18eebcac3a9881e97c0d2694c9be5f276f0cb4958cc8434993` |
| `E/1304-stage/tests/bridge-p14a1-release-busy-set.test.ts` | 18985 | `35c8aed54852c83687bec8eb38c67e4e4b18d6231cdee8dae619685497df3a54` |
| `E/1304-release-neighbors.json` | 24428 | `6528cdbda4db9a3be999d408ac172b7d6e363360938250703db08639b0f75614` |
| `E/1304-C-release-busy-set-red-handback.md` | this file | n/a (written last) |

Both `.test.ts` files are written with import paths for their INTENDED destination
(`tests/p14a1-release-busy-set.test.ts` and `tests/bridge-p14a1-release-busy-set.test.ts`, one
level below repo root, beside every other `tests/*.test.ts`) even though they are physically
staged one directory deeper, under `E/1304-stage/tests/`. This is stated explicitly in each
file's own header comment. **They cannot run from their staging location as written** (the
relative imports `../src/...`, `../bridge/...` resolve one level too shallow from there); moving
or copying them to `tests/` is the parent's job at the RED-run gate, not mine.

## Requirement → leaf mapping

Authority read in full: `P14-PREPARATION-COMPANION.md` §3.2, §3.4, §3.6;
`1304-A-release-busy-set-proposal.md` (frozen); `1304-B-release-busy-set-plan-review.md`
(independent KEEP-with-3-amendments); `1304-F-parent-plan-adoption.md` (adopts A with the 4
amendments). Interfaces read (read-only): `src/core/actions.ts` (`applyReleaseTalent` ~:2661,
`applySignContract` founding branch ~:2552, `applyFoundStudio` ~:1193, `applyCancel` ~:588,
`applyGreenlight` ~:290, `applyCommitPictureToRelease` ~:2848), `src/core/employment.ts` (:126
`activeProductionCompanyTalentIds`, :147 `creditedWriterIds`, :161 `busyTalentIds`, :197
`terminationCost`), `src/core/productionPeople.ts`, `src/core/talentMarket.ts:628
releaseDisclosure`, `bridge/contract.ts` (:163 `releaseRefusal`, :187
`contractActionDecisions`, :218 `liveRefusal`, :283-330 `contractQuoteSnapshot`, the "half of
the" line at :303), `bridge/session.ts` (`BridgeSession`, the P10-R1 commit-revalidation branch
~:1683-1690), `bridge/schema/bridge-schema.ts` (:1751 `PROJECTION_VERSION`, :1753-1764
`CONTRACT_REFUSAL_KINDS`, :2109-2146 `StudioContractQuoteSnapshot`, :3758 `BRIDGE_SCHEMA`),
`bridge/schema/dsl.ts` (`object`/`nullable`/`enumeration` — confirms the exact
`$defs.<Name>.properties.<field>.anyOf[0].enum` shape I assert against), and
`bridge/schema/project-studio-bridge.schema.json` (read directly to confirm that shape is real
on the CURRENT generated artifact, not assumed).

| Requirement (companion §3.4 / 1304-A/F) | Leaf(s) | File |
|---|---|---|
| Director/lead/antagonist/support/craft of an active player production: release refused; cash/ledger/contracts/freeAgents/promises/technology unchanged | `describe.each` over the 5 seats, "seated %s of an active player production" | Core |
| Same production, after it releases: release succeeds at `weekly × min(remaining,26)` | "the SAME director, released after the production has released, succeeds…" | Core |
| Research-only seat: still releasable, research pauses as today (R2 explicitly excludes research) | "a person seated only on an active research seat is still releasable…" | Core |
| Founding draft: release refused while `founding !== null`; allowed after `foundStudio` | "founding draft: release is refused…" / "the SAME founding-signed person… succeeds" | Core |
| Credited writer, no active screenplay task: releasable | "the credited writer of the SAME active production… is releasable" | Core |
| `contractActionDecisions` reports `releaseAvailable:false` with the new reason, seated + founding | the two `describe`/`it` groups asserting `decision.releaseAvailable === false` | Bridge |
| Quote and command both refuse with the typed code; no successor | same two groups, `quoted.quote.refusal`, `submit(...)`, `session.gameState`/`stateRevision` checks | Bridge |
| Free/unseated person still quotes the exact disclosure (no over-refusal) | "a free, unseated, non-founding person still quotes the exact disclosure" | Bridge |
| Release confirmation: two exact §3.4 branches, exact dollars, never "half" | the two "release confirmation copy" cases | Bridge |
| Schema leaf: both new codes in the generated enum; `PROJECTION_VERSION` 56 | "schema leaf: PROJECTION_VERSION is 56…" | Bridge |
| Neighbor sweep (existing `releaseTalent` callers, attributed by cause) | full inventory | `1304-release-neighbors.json` |

## Premises each leaf depends on (seed / week / person)

- **Core seated cases**: `buildProductionFixture('1304c-release-busy-set-01')` — a fresh
  `p13aGeneratedStudio` world, a 6-person roster (writer/director/lead/antagonist/support/craft)
  signed via the rotating hiring market (never assumed present at week 0), funded to
  $30,000,000, a `set-grand-ballroom` built on `facility-soundstage-07`, greenlit at whatever
  week the roster finished signing, walked to `remainingTicks === 5` with the shooting task
  `scheduled`. `preReleaseSeated` is that exact state; `released` is the SAME production walked
  (assign → schedule → commit at `remainingTicks === 1` → tick) into `studio.releasedFilms`. A
  `PREMISE` test asserts both halves of this (seated before, cleared after) independently before
  any refusal is asserted, so a fixture failure is distinguishable from a law failure.
- **Research case**: `p13aResearchReady()` (existing harness fixture) → `beginResearch` → one
  tick → release the scientist.
- **Founding cases**: `beginFounding(generateWorld(seed))`, sign exactly
  `FOUNDING_MINIMUMS` (3 actors / 1 director / 1 writer / 1 craft) from the applicant pool,
  capture `duringFounding`; `afterFounding = applyActions(duringFounding, [{kind:'foundStudio'}])`.
  `signedActorId` is the first actor signed.
- **Bridge seated cases**: `founded(seed)` (found + activate studio operations/script
  development/casting sessions — the same helper shape as
  `tests/bridge-p10a-r1-contract-quote.test.ts`), pick one of each of the 6 signed roles,
  greenlight — no Set is built and no ticking happens, because the seat check reads only
  `state.studio.activeProductions`, populated the instant `greenlight` returns.
- **Bridge founding case**: `beginFounding(generateWorld(seed))`, sign one actor from the
  applicant pool, no `foundStudio`.
- **Bridge copy-branch cases**: the cheapest legal contract, mirroring the ALREADY-PROVEN
  `signActor`/disclosure pattern in `tests/p14a1-firing.test.ts` — `p13aGeneratedStudio()` +
  one signed actor at `termWeeks:208` (cap-applies) or `termWeeks:52` advanced to week 45,
  7 weeks remaining (no-cap). No founding, no production, no Set — deliberately the lightest
  fixture that can exercise the copy law, to minimize the risk of an un-executed multi-hundred-
  tick loop timing out or drifting from a proven pattern.

## What is expected RED, and why

Against unchanged production (verified by direct source reading, not by running anything):

- `src/core/actions.ts` `applyReleaseTalent` (~:2661) checks only "no active contract" and "an
  active screenplay task." It never reads `state.founding` and never checks
  `activeProductionCompanyTalentIds`. So every Core `assertRefusedNoop(...)` call (5 seat cases
  + 1 founding case) is RED: the call will NOT throw today, so `toThrow(...)` fails.
- `bridge/contract.ts` `releaseRefusal` (~:163) mirrors the same two-check gap, so every Bridge
  `decision.releaseAvailable === false` / `quoted.quote.refusal === 'seatedOnActiveProduction'`
  / `'foundingDraft'` assertion is RED (today `releaseAvailable` is `true` and `refusal` is
  `null` for these people).
- `bridge/schema/bridge-schema.ts` `CONTRACT_REFUSAL_KINDS` (:1753-1764) does not contain
  `foundingDraft` or `seatedOnActiveProduction`, and `PROJECTION_VERSION` (:1751) is `55`, so the
  schema-leaf test's four assertions are RED.
- `bridge/contract.ts:303`'s consequence template is the single unconditional sentence "…(half
  of the $Y still guaranteed through Week Z)…", so both copy-branch tests' `not.toContain('half')`
  and phrase-substring assertions are RED (the string DOES contain "half", and does NOT contain
  "26 weeks of the … still guaranteed through" or "all N remaining weeks of pay").

Two Core cases and one Bridge case are **not** RED causes and are labeled as such in-file: the
"same production, after release, succeeds" case, the research-seat case and the credited-writer
case are already true today (R2 doesn't touch them) and are included because the plan's own
Tests list names them as paired requirements and because two independent, already-existing tests
(`tests/p04a2-writer-credit-law.test.ts:845`, `tests/p13a-research-employment.test.ts:12-34`)
already witness the identical claim on unchanged production — cited in-file at each case, and in
the neighbor JSON.

## What I could not derive / explicit interpretations

- **No literal Core engine error string** is asserted for either new refusal. The companion
  states the RULE, not a sentence; 1304-A's remedy sentence is scoped to the Bridge layer only.
  Pinning an invented Core string would have silently filled a gap the parent implementer should
  decide. Only the whole-codebase `applyActions: releaseTalent rejected —` prefix (used by every
  other refusal in the same function and file) plus a content keyword (`seated`/`active
  production` or `founding`) are asserted.
- **The Bridge no-cap/cap-applies "Week Z" formatting** is asserted flexibly (raw absolute week
  number OR `campaignDate(...).label`), because the companion's own literal example uses the
  date-label form but 1304-F's amendment 4 does not separately re-confirm that exact
  presentation as binding wire text, and the task brief's own restatement of the requirement
  uses the generic placeholder "Week Z." Pinning one specific format would have been an invented
  choice, not a derived one.
- **`BRIDGE_SCHEMA.$defs` typing**: the schema-leaf test casts `BRIDGE_SCHEMA.$defs` through
  `Record<string, unknown>` to reach `StudioContractQuoteSnapshot.properties.refusal.anyOf[0].enum`.
  I confirmed this exact shape is real by reading `bridge/schema/dsl.ts`'s `object`/`nullable`/
  `enumeration` implementations AND the currently-generated
  `bridge/schema/project-studio-bridge.schema.json` on disk (both produce/contain
  `$defs.StudioContractQuoteSnapshot.properties.refusal.anyOf[0].enum`), but I could not run
  `tsc` to confirm the cast typechecks against `BRIDGE_SCHEMA`'s `as const satisfies JsonSchema`
  type. Flagged for the parent's type-check gate.
- **Stop rule**: no leaf was abandoned. Every state this file needs is reachable through public
  actions on a named seed; nothing was fabricated. The one genuine risk I could not resolve
  without execution is timing/perf drift in the un-executed multi-tick fixtures (see below).

## Un-executed-risk disclosure (explicit, since nothing here was run)

Both `.test.ts` files are RED-authored against a static reading of the source and of three
already-landed precedent fixtures (`tests/helpers/p14c2c-fixtures.ts` `toScheduledTake`,
`tests/p14b1-first-take.test.ts` `buildScheduledPlayerProduction`,
`tests/bridge-p11-finance.test.ts` `releaseFilm`) whose SHAPE (not code) was copied, adapted to
this task's own roster/seed. I could not run `vitest` to confirm the Core file's heaviest fixture
(`buildProductionFixture`, signing 6 people via a rotating-market walk, building a Set, and
walking a production all the way to `releasedFilms`) actually completes within its own guards on
this specific seed — only that each individual step is a real, existing, documented action with a
precedent that performs the identical sequence successfully elsewhere in this tree. This is an
accepted limit of the IMPLEMENT/no-execution contract for this task, not a shortcut I took
knowingly; type/runtime checks (including whether the fixture's bounded guards ever actually
fire) are for the parent's later gate, per the task's own instruction.

## Neighbor summary (full detail in `1304-release-neighbors.json`)

- **48 real `releaseTalent` call sites** found across 27 `tests/*.test.ts` + 2 `ui/src` test
  files (matching 1304-A's own "29 files" claim) + 3 `tests/helpers/*.ts` fixture files, plus one
  more logical site reached only through `BridgeSession.quote()+command()`
  (`tests/bridge-p10a-r1-contract-quote.test.ts`, not caught by a literal-string grep).
- **47 UNAFFECTED** — either the released person was never seated (no `greenlight` in the file/
  test at all, or the target is a writer, or a research seat), or the production they WERE seated
  on had already released or been cancelled (`applyCancel` removes the production from
  `activeProductions` immediately, confirmed by reading `actions.ts:588-611`) before that specific
  release call runs. Two existing files (`tests/p04a2-writer-credit-law.test.ts`,
  `tests/p13a-research-employment.test.ts`) independently corroborate the exact carve-outs my own
  Core RED file exercises.
- **1 NOW REFUSED (flagship finding)**: `tests/bridge-p14b6-relationship-read-models.test.ts:466`
  releases `W1_SEATS.support` ('t-act-13'), the SUPPORT cast seat of production `prod-0052`,
  which is STILL in `state.studio.activeProductions` (remainingTicks 4, never committed to
  release or cancelled) at the moment of that call — traced through
  `tests/helpers/p14b2-fixtures.ts` `retentionFixture()`. Under unchanged production this call
  succeeds (the test's own subsequent assertions pass); under R2 it must throw the new
  `seatedOnActiveProduction` refusal, making every assertion after line 466 unreachable. This is
  a genuine, attributable, real regression the parent implementer needs to handle explicitly (per
  1304-A's own neighbor-attribution rule) — it is reported here, not silently edited.
- **0 COPY_CHANGE**: a targeted grep (`half of the \$`, `termination now`, `.consequence` near
  `half`/`guarantee`) plus a broader substring pass, all manually reviewed, found zero existing
  tests pinning the current "half of the" consequence sentence anywhere in `tests/*.test.ts` or
  `ui/src`.

## Return

**DONE.** Covered requirements: every Core and Bridge leaf named in the task brief, plus the
full neighbor inventory and the flagship regression finding. Paths and hashes above. No live-tree
files were created, modified or deleted; nothing under `tests/`, `src/`, `bridge/`, `ui/`,
`generated/`, `scripts/` or any config was touched; no `vitest`/`tsc`/`node` ran on project code.
Remaining defects/evidence limits: the un-executed-risk disclosure above (fixture timing/perf on
this specific seed, and the `BRIDGE_SCHEMA.$defs` type-cast) — both explicitly for the parent's
RED-run and type-check gates, not resolved here. Next concrete action: 1304-D review of this RED
(and of the neighbor inventory, especially the flagship `bridge-p14b6-relationship-read-models.
test.ts:466` finding), then the parent's actual RED run once these files are copied to `tests/`.
