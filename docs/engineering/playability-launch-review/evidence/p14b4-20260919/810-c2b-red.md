# 810 — P14C.2b T1: independent RED (test-author)

Task: P14C.2b T1, the INDEPENDENT RED for the single final retirement extension. Role:
test-author, running as a general-purpose agent carrying that contract
(`.claude/agents/test-author.md`) — the project's roles are not registered in this
session. Authority: `780-c2b-extension-expansion.md` (X1-X11, §2's delegated reading, §5,
§6) and `806-c2b-api-contract.md` (§1-§9, especially §8's five amendments after review
`806-A-c2b-contract-audit.md`), which is the surface tested. Corpus: `807-c2b-t0-measurement.md`,
`808-c2b-t0-corpus-minted.md`, `tests/fixtures/p14/genuine-v35-c2b-corpus/`. Precedent:
`795-c4-red.md` §8 (migrate-first, non-empty-set, no bare `.toThrow()` on a total-throw
scaffold).

Worked EXCLUSIVELY in the isolated detached worktree
`/Users/zacheryspector/The-Movies-c2b-red-scaffold`, HEAD `ddd88d3c03ade20560acee1f8158be38f06b8b9c`
(confirmed clean before and after — `git status --short` shows only this record and the
three new test/helper files). Never opened, read or ran anything under
`/Users/zacheryspector/The-Movies-headless-program` (the concurrent writer's worktree).
Git: read-only (`git status --short`, `git rev-parse HEAD`) only. Times below are from
`date` (host clock, CEST), run 2026-09-26 03:50-04:04.

**Status: DONE**, with three disclosed coverage gaps (W10 fully, W4/W7/W8 partially — §5).
Every other requirement ID (W1-W9, W11, S1-S4, P1) is mapped to at least one case below.
7 cases legitimately PASS against the scaffold (JUSTIFIED, §4, matching the C.4 RED's own
precedent for a disclosed non-discriminating premise); every other case FAILS for missing
behaviour, probed and attributed in §3.

## 1. Files, sha256, line counts

| file | sha256 | lines |
| --- | --- | --- |
| `tests/p14c2b-extension.test.ts` | `fd30f8cdccaff67d3b8a56f973836127f0f6d85288f92afe9cc75887d9f8b3a2` | 453 |
| `tests/p14c2b-save-v36.test.ts` | `4b99a896e67dc1faa0253498baf3a7295a8a7d6e7fc4ab68fc83d3cd43d7d9a2` | 186 |
| `tests/helpers/p14c2b-fixtures.ts` | `613ac2f092ead81cdf32475fa2042f80f88910dd373bd3be1faf832067719702` | 146 |

Plus this record. `git status --short` at close shows exactly these four new paths — no
existing test, helper, fixture or production file was touched.

## 2. Requirement map -> case

| id | file | case(s) |
| --- | --- | --- |
| W1 | extension | W1a, W1b, W1c (natural tick, axis c), W1d, W1e |
| W2 | extension | W2a, W2b, W2c, W2d, W2e |
| W3 | extension | W3a, W3b |
| W4 | extension | W4a, W4b (PARTIAL — §5) |
| W5 | extension | W5a, W5b, W5c |
| W6 | extension | W6a, W6b |
| W7 | extension | W7a, W7b (PARTIAL — §5) |
| W8 | extension | W8a, W8b (PARTIAL — §5) |
| W9 | extension | W9a (natural tick, axis c), W9b |
| W10 | — | NOT COVERED (§5) |
| W11 | extension | W11a |
| S1 | save-v36 | `it.each` over all 3 corpus worlds |
| S2 | save-v36 | lossless, refused (extensionUsed), refused (case variant) |
| S3 | save-v36 | baseline-must-validate, second case, extensionUsed-without-settled, extendedFromWeek mismatch, no-contract-at-new-E |
| S4 | save-v36 | `LIVE_SAVE_VERSION===36`, `makeSave` stamps 36, replay determinism |
| P1 | extension | P1a (58wk prices as 52wk), P1b (catalogue terms golden) |

Case counts: `tests/p14c2b-extension.test.ts` = 28 (5+5+2+2+3+2+2+2+2+1+2, one `describe`
per requirement letter). `tests/p14c2b-save-v36.test.ts` = 14 (3-way `it.each` for S1, plus
11 `it`s). 42 cases total.

## 3. RED runs — this scaffold worktree, HEAD `ddd88d3c`

Each file run alone: `node_modules/.bin/vitest run tests/<file> --minWorkers=1 --maxWorkers=1`.
Never run inside a suite pass. `node_modules/.bin/tsc --noEmit -p tsconfig.json` accepted
both files and the helper with zero errors (run repeatedly through authoring; final run
2026-09-26 04:02:55-04:03:27 CEST, exit 0).

| file | result | duration | exit |
| --- | --- | --- | --- |
| `tests/p14c2b-extension.test.ts` | **21 failed / 28** (7 passed, all JUSTIFIED — §4) | 14.10s | 1 |
| `tests/p14c2b-save-v36.test.ts` | **14 failed / 14** | 4.86s | 1 |

**Failure attribution — every failure probed; zero caused by a typo or an unlawful
construction.**

| cause | count | cases |
| --- | --- | --- |
| direct throw from a scaffolded C.2b export (`extensionIssuer`, `commitRetirementExtension`, `advanceLifecycleIntent`, `advanceLifecycleSettlement`, `openMarketCaseFor`, `convertV35ToV36`, `convertV36ToV35`, `validateSaveV36`), unconditional on this scaffold | 21 | extension: W1a,W1b,W1d,W1e,W5a,W5c,W7a,W8b,W11a (9); save-v36: S1x3, S2-lossless, S2-refused-extensionUsed, S2-refused-caseVariant, S3-baseline, S3-second-case, S3-extensionUsed-no-settled, S3-extendedFromWeek, S3-no-contract, S4-replay (12) |
| wrong-cause throw: `submitProposal`'s unconditional early guard (`talentMarket.ts:415-416`) fires before the 806 §8.3 narrowing exists, so a lawful incumbent proposal is refused with the generic `retirementAnnounced` sentence instead of being accepted (or, for a bad term/insufficient reserve, instead of the SPECIFIC typed refusal 806 names) | 4 | W2a, W3a, W3b, W9b |
| assertion mismatch: the case/behaviour is simply ABSENT because 806 §4's discovery pass is not wired into `advanceTalentMarketWeek` (no natural route can ever produce it) | 2 | W1c, W9a |
| assertion mismatch: `marketEligibility` still returns `proposers: []` for an announced person — it does not yet consult `extensionIssuer` (806 §4) | 1 | W2e |
| assertion mismatch: settlement still drops the (otherwise lawful) proposal at the UNAMENDED `retirementCap` gate — 806 §5(a)'s admission carve-out and §5(b)'s `belowRetirementReservation` drop do not exist yet, so both the equal-to-reservation accept and the below-reservation-specific decline reason are wrong today | 3 | W4a, W4b, W5b |
| assertion mismatch: `attachPromise` does not yet refuse on a `retirementExtension` case (806 §8.4) — it succeeds where it must throw | 1 | W8a |
| constant mismatch: `LIVE_SAVE_VERSION`/`makeSave` still stamp 35; the 58-week extension term still prices via `CONTRACT_LENGTH_FACTOR[58] ?? 1.0` (the 806 §8.5 pricing cliff) | 3 | S4 (`LIVE_SAVE_VERSION`, `makeSave`), P1a |

## 4. Seven justified passes — not gaps (778/795's own precedent)

- **W2b, W2c, W2d, W7b** (a non-incumbent studio, the incumbent before the window opens,
  the incumbent after the case closes, and the former incumbent after a modeled
  extension-used state, are all refused): today's unconditional `submitProposal` early
  guard (`talentMarket.ts:415-416`) already refuses EVERY proposer for ANY announced
  record, for ANY week, so these four sentences hold both before and after 806 §8.3 lands
  — kept as regression guards (778's own P1-style precedent), not removed. Non-vacuity is
  proved by W2a/W3a/W3b/W9b, which isolate the exact same guard FAILING to admit the one
  case 806 requires it to admit.
- **W6a, W6b** (decline/no-offer leaves E unchanged): nothing about the decline path needs
  new C.2b behaviour — `advanceCareerLifecycleWeek`'s existing settlement/`retire()` logic
  is untouched by 806, and W6a replays 807/808's own measured decline baseline exactly.
  Kept as a regression pin; non-vacuity is proved by W5a/W5b/W5c, which show the ACCEPT
  path (the one 806 actually changes) failing today.
- **P1b** (every catalogue term's price is unchanged): 806 §8.5 explicitly promises this
  ("nothing changes for them") as the OTHER half of the same fix P1a shows failing; a
  golden captured NOW, at this exact scaffold (2026-09-26, HEAD `ddd88d3c`), so a future
  run that diverges is a real regression, not a moving target.

## 5. Requirements not fully covered, and why

- **W10 (bridge exclusion) — NOT COVERED in either file.** Exercising it means importing
  `bridge/market.ts`/`bridge/people.ts`, which import their OWN dependencies with
  `.ts`-extension specifiers requiring `allowImportingTsExtensions` — a flag only
  `tsconfig.bridge.json` sets, gated to files matching `tests/bridge*.test.ts`
  (`tsconfig.json`'s own `exclude` list). Confirmed directly: adding either bridge import
  to `tests/p14c2b-extension.test.ts` reintroduces ~50 `TS5097` errors across `bridge/`
  and `ui/`, none in this suite's own code, and the task both fixes this file's name
  (not `tests/bridge-p14c2b-*.test.ts`) and requires `tsc --noEmit -p tsconfig.json` clean
  for "your files." Renaming the file or editing `tsconfig.json` are both outside this
  task's WRITE list; left for the parent as a `tests/bridge-p14c2b-market-exclusion.test.ts`
  file (checked under `tsconfig.bridge.json`) or a tsconfig change. Documented in-file at
  the point W10 would have appeared.
- **W4's "the trust and Nemeses refusals still apply"** — not independently isolated.
  `survivesFreeze`'s check order runs `retirementCap` BEFORE `issuerDistrusted`/
  `nemesisOnRoster`; with `retirementCap` unamended, any synthetic Distrust/Nemeses setup
  would still be masked by the (wrong) cap drop, so a dedicated case could only ever show
  "declined for retirementCap" regardless of trust state — not a genuine discriminator
  today. Deferred to the writer's own post-landing verification, or a follow-up RED once
  806 §5(a) exists.
- **W7's "the extended year obeys D7/D9 and can end in `finishing_commitments`"** — the
  cap half is covered indirectly (W5b's new-contract-ends-at-new-E assertion IS the cap);
  a dedicated "seated at the new E+52, becomes `finishing_commitments` not `retired`" case
  was not independently constructed — it would re-verify ALREADY-UNCHANGED C.2a
  busy/finishing logic (`advanceCareerLifecycleWeek`'s existing `retire()` branch) under a
  hand-built live production seat, a large, low-marginal-value construction given that
  logic is untouched by 806. The discovery-side "never opens a second case" enforcement
  (the actual mechanism behind "no chain") is likewise not independently reachable — no
  discovery entry point is exported to call directly, and natural ticking never reaches it
  (assertion of absence is vacuous either way; W7a instead tests the READ side, that
  `extensionIssuer` reports no issuer once used).
- **W8's `authorRivalPromise` "never authors one" for an extension** — not independently
  reachable. `authorRivalPromise` (private) is only invoked in the SAME tick as a FRESH
  rival `submitProposal` success (`talentMarket.ts:1296-1312`); since that submission
  cannot yet succeed (806 §8.3's narrowing is unimplemented), the function is never
  reached for a `retirementExtension` case on this scaffold by any route. The `attachPromise`
  half (W8a) IS covered directly.

## 6. Ambiguities where 780/806 admit two readings — resolved by MEASURING/the contract text, not guessing

1. **780 §2's delegated reading (a) vs. alternatives (b)/(c)** for when the extension case
   opens given a contract ending before E: NOT a live ambiguity at RED time — 806 §4
   commits explicitly to reading (a) ("its decision week is that contract's
   `endWeekExclusive`"), so every case here follows 806, not 780's own open question.
   Noted for completeness since 780 itself flags it as under review.
2. **806 §8.2's tamper wording has no established precedent** (unlike `validateSaveV34`'s
   own field-naming convention, which C.4's D4 regexes could anchor on): S3's four
   cause-specific regexes (`/one extension case|at most one|second/i`,
   `/settled/i`, `/extendedFromWeek|effectiveWeek/i`, `/terms|contract|effectiveWeek/i`)
   are REASONED GUESSES grounded in 806 §8.2's own prose, not read from any real V36
   validator source (795's own D4 precedent for this exact situation). Flagged here in
   case the writer's actual wording differs enough that a regex needs a follow-up
   adjustment — a test-side fix, not a defect.
3. **"A second extension case for the same person"**: 806 §8.2 says "at most one extension
   case per person ever" (a PERSON-level fact), while 806 §7 item 2's discovery dedupe key
   is `(contractId, variant)` (a CONTRACT-level fact). S3's second-case tamper uses a
   DISTINCT, made-up `contractId` for the same `talentId`, so it unambiguously exercises
   the person-level rule rather than merely re-triggering the (unrelated) contract-level
   dedupe. Both readings should be refused by a correct validator; the distinct-contractId
   construction was chosen as the cleaner, more clearly-a-tampering case.

## 7. Next action for the parent

- Treat §3's two scaffold-worktree runs as the authoritative RED evidence.
- Once the writer's implementation lands and is committed, re-run both files expecting
  GREEN except where a genuinely-corrected regex/expectation is needed (S3's cause-name
  regexes, §6 item 2, are reasoned guesses; flagged there in case the writer's actual
  wording differs).
- W10 needs either a `tests/bridge-p14c2b-*.test.ts` file (checked under
  `tsconfig.bridge.json`) or a tsconfig change before it can be authored; not this task's
  call to make.
- This task did not commit; the parent copies these files into the main tree.

## 8. Repair (2026-09-26 04:17-04:40 CEST), against implementation HEAD `8cf6bed2`+

Moved to the MAIN worktree `/Users/zacheryspector/The-Movies-headless-program`, HEAD
`8cf6bed21104faa9ca876e745fdcc35ab40d7930`, per the coordinator's repair task. Touched
ONLY the three files this task owns, plus one new file (`tests/bridge-p14c2b-extension.test.ts`,
closing the W10 gap) and this record. Never opened `src/`/`bridge/` diffs or record 811;
every source file read was the PUBLISHED, committed text at this HEAD, read only to align
a regex or a signature with the real, landed API — never to retune an expected VALUE
toward what it produces (778's rule). Git: read-only throughout (`git status --short`,
`git rev-parse HEAD`).

**Status: DONE.** All 8 traced failures (F1-F3) resolved; two further test-construction
bugs found and fixed while PROBING the repair itself (§8.3, not scaffold gaps, not
implementation defects). W10 closed in full (a new bridge-tsconfig file, six cases across
all five named bridge consumers). W8's rival-promise half closed (now genuinely
reachable). W4's trust/Nemeses sub-clause and W7's finishing_commitments/seat sub-clause
remain open, as measured `it.todo`s with reasons (§8.4) — the coordinator's own fallback
for "if now reachable lawfully."

### 8.1 Root causes, verified independently, and the fix applied

| finding | verified how | fix |
| --- | --- | --- |
| F1 (W1c, W9a, D2 makeSave, and every other case that ticks or saves a corpus world) | `GameState` is now V36 live (806 §9 landed: `types.ts` — `export type GameState = GameStateV36`). Confirmed by running the ORIGINAL files unchanged: `tsc` reported 2 real errors in `p14c2b-fixtures.ts` (a raw V35 state cannot satisfy `GameStateV36`'s required `extensionUsed`/`variant` fields), and at runtime `convertV35ToV36`/ticking under the live engine either type-refused or (once cast around) silently produced a record lacking `extensionUsed`, which the writer's own discovery predicate (`extensionUsed === false`) still reads as false for `undefined`, masking the real question. | Added `c2bLiveFixture(name)` (migrates a corpus V35 fixture live via `convertV35ToV36(liveEnvelope(...))` before any tick/save). `c2bFixture` itself now returns the explicit RAW `GameStateV35` type (never handed to a live-engine tick/save directly). Every case that ticks or saves a corpus world now calls `c2bLiveFixture`. |
| F2 (W5b) | Ran the ORIGINAL W5b against `8cf6bed2`: `cashBefore - settled.studio.cash` measured 227729 against an expected 14297 (a ~16x mismatch). Read `commitPlayerWinner` (`talentMarket.ts:978-1003`) directly: the ledger carries exactly one `signingBonus` row, dated at the decision week — the REST of the delta is 12 weeks (E-12 -> decision week) of ordinary payroll/overhead, unrelated to the bonus. | The bonus is now measured through the LEDGER's own `signingBonus` row (exactly one, for this person, dated at the decision week), never against the total cash delta. Its amount is cross-checked against an INDEPENDENT re-derivation through the same shared, EXPORTED pricing entry settlement itself uses (`playerOffer`, re-read at the settlement week) x the 1.10 tier x the signing-bonus fraction — never against `draft.signingBonus` (a stale submission-week quote) and never against `proposalPriceAt` (private, would have meant reading and copying an implementation number). |
| F3 (S3 baseline + its four tamper cases) | The original baseline was `synthesizeV36` plus hand-grafted record/case/contract fields. Ran it against `8cf6bed2`: `validateSaveV36` refused it ("frozen V35 state is invalid — ..."), confirming the graft was not itself a lawful V36 state by the REAL validator's own lights (a hand-typed contract literal disagreed with some frozen-chain invariant the graft never modeled). | Rebased on a GENUINE V36 state: migrate axis a live, have the player submit the lawful extension at E-12 through the real `submitProposal`, tick to the decision week. This baseline validates cleanly (see §8.2) — confirming the ORIGINAL refusal was a graft-construction defect, not an implementation one. Each tamper is now a ONE-FIELD mutation of this genuine state, and its regex is read from `validateRetirementExtensions` (`save.ts:9844-9897`) directly: `/at most one|second retirementExtension/i`, `/settled retirementExtension case/i`, `/weeks before its effective week/i` (replaces the original's `/extendedFromWeek|effectiveWeek/i`, which did not discriminate from the fifth tamper below), `/exactly one must/i` (replaces `/terms|contract|effectiveWeek/i`, same reason — BOTH original messages contain the words "effective week", so neither regex told the two tampers apart). |

### 8.2 The genuine S3 baseline validates cleanly — no implementation defect

Per the coordinator's own instruction ("If the genuine baseline is ALSO rejected, that is
an implementation defect: report it with the message, and do not work around it."): the
genuine, naturally-produced baseline (`genuineSettledBaseline()` — axis a migrated live,
a lawful 58-week/1.10-tier extension submitted at week 92, settled at week 98) validates
through `validateSaveV36` with **zero** exceptions, against `8cf6bed2`. No workaround was
needed and none was applied.

### 8.3 Two further test-construction bugs found while probing the repair (not scaffold gaps, not implementation defects)

1. **W8c (new case), first draft:** searched for ANY promise with
   `beneficiaryPersonId === personId` and asserted none existed — FAILED even though the
   implementation is correct, because axis c's own subject carries an EARLIER,
   already-`SATISFIED` promise from a PRIOR rival contract (`windowStartWeek` 2080, a
   completely different, long-closed employment). Probed directly (the actual object was
   printed: `promiseId: "promise-132"`, `outcomeCause: "the promised pictures began
   filming inside the window"`, dated to 2085 — nothing to do with the 2704-week
   extension). Fixed: narrowed the search to `p.windowStartWeek >= AXIS_C.effectiveWeek`,
   which only a promise minted on THIS extension could satisfy.
2. **W5b, first draft (this IS finding F2, traced independently before the coordinator's
   own message named it — recorded here as the probing step, not a second defect):** the
   `cashBefore/cashAfter` total-delta comparison failed by exactly the payroll/overhead
   margin described in §8.1; fixed the same way, by reading the ledger and an
   independent price re-derivation instead of a raw balance subtraction.

### 8.4 Gaps closed, and gaps still open with measured reasons

**Closed:**
- **W10** (bridge exclusion): `tests/bridge-p14c2b-extension.test.ts` (new, under
  `tsconfig.bridge.json`), six cases — `bridge/market.ts` (case rows), `bridge/people.ts`
  (attention rows AND `marketCaseProjection`), `bridge/world.ts` (`personWorldRoute`),
  `bridge/promises.ts` (`promiseRowsFor`), `bridge/contract.ts` (`renewalRefusal`'s "one
  final extension" wording) — every file the coordinator named, all six genuinely
  exercised (migrate live, tick to E-12) and all six pass against the implementation,
  fail on the scaffold (§8.5).
- **W8's rival-promise half:** `authorRivalPromise`'s own guard
  (`openMarketCaseFor(...)?.variant === 'retirementExtension'`, `talentMarket.ts:1402`)
  is now reachable through the natural tick route (axis c, migrated live, ticked straight
  through to its own effective week) since `submitProposal`'s narrowing landed — added as
  W8c.

**Still open, disclosed with reasons (the coordinator's own "otherwise a measured
`it.todo`" fallback):**
- **W4c** (trust/Nemeses still drop an extension proposal): now STRUCTURALLY reachable
  (`retirementCap` no longer masks `issuerDistrusted`/`nemesisOnRoster` in
  `survivesFreeze`'s order, since 806 §5a landed), but constructing a genuine Distrust or
  Nemeses relationship needs 2+ real negative trust drivers minted against the SPECIFIC
  incumbent studio — no exported "mint a driver" entry exists, and every existing
  precedent (e.g. `genuine-v31-distrusted-issuer`) is a DIFFERENT corpus world with no
  retirement facts at all. Left `it.todo` with this reasoning in-code.
- **W7c** (a person seated on a production past the NEW effective week finishes it,
  `finishing_commitments`, rather than retiring): grepped `finishing_commitments` and
  `finishing` across every `p14c2a-*.test.ts` file for a reusable live-seat construction
  — zero hits. The underlying branch is pre-existing, unchanged C.2a logic
  (`advanceCareerLifecycleWeek`'s own `retire()` call), so a dedicated case would mostly
  re-verify already-tested machinery under a large, purpose-built production setup. Left
  `it.todo` with this reasoning in-code. The CAP half (D7/D9) is covered indirectly by
  W5b's own contract-shape assertion (the new contract ends exactly at the new E).

### 8.5 Runs (each file alone, `--minWorkers=1 --maxWorkers=1`, never in a suite)

**Against the implementation** (main worktree, HEAD `8cf6bed2`+, 2026-09-26 04:34-04:40 CEST):

| file | result |
| --- | --- |
| `tests/p14c2b-extension.test.ts` | **0 failed / 31** (29 passed, 2 `it.todo` — §8.4) |
| `tests/p14c2b-save-v36.test.ts` | **0 failed / 14** (14 passed) |
| `tests/bridge-p14c2b-extension.test.ts` (new) | **0 failed / 6** (6 passed) |

**Against the scaffold** (disposable detached worktree `/Users/zacheryspector/The-Movies-c2b-recheck`,
created via `git worktree add --detach ... ddd88d3c`, `node_modules` symlinked, repaired
files copied in, removed with `git worktree remove --force` immediately after,
2026-09-26 04:37-04:38 CEST):

| file | result | dominant cause |
| --- | --- | --- |
| `tests/p14c2b-extension.test.ts` | **28 failed / 31** (1 legitimate pass: P1b, the SAME golden pin as the original RED, untouched by this repair; 2 `it.todo`) | `not implemented (P14C.2b)` throws (`convertV35ToV36`/`extensionIssuer`/etc. do not exist on the scaffold), or the 806 §8.5 pricing-cliff constant mismatch (P1a) |
| `tests/p14c2b-save-v36.test.ts` | **14 failed / 14** | `not implemented (P14C.2b)` throws from the V36 save stubs |
| `tests/bridge-p14c2b-extension.test.ts` | **6 failed / 6** | `not implemented (P14C.2b)` propagated from `c2bLiveFixture`'s `convertV35ToV36` call, before any bridge function is even reached |

Every changed or added case therefore discriminates: it passes against the
implementation (§ above) and fails on the scaffold `ddd88d3c` (this table) — the ONE
exception, P1b, is a golden pin that was ALWAYS designed to hold on both (806 §8.5's own
"nothing changes for them" promise), unchanged by this repair.

### 8.6 Files after repair

| file | sha256 | lines |
| --- | --- | --- |
| `tests/p14c2b-extension.test.ts` | `1bea487998cfcc2b6e53e7ab2b8825e3ae30f202486b77cec20754739cfec85b` | 442 |
| `tests/p14c2b-save-v36.test.ts` | `f44de8887fc0c6e00165591a80a61b641367da500bf6545bfddfd199ed16741d` | 167 |
| `tests/bridge-p14c2b-extension.test.ts` (new) | `081da2d9b039140d12f9e8b143a4bb73abb4bc489f9dc98cec0232c5f32b0229` | 78 |
| `tests/helpers/p14c2b-fixtures.ts` | `750e5fb3a776f2f93a93708e3aaf92b5d42598b5766aa0ade2a61903db10ad7a` | 82 |

`node_modules/.bin/tsc --noEmit -p tsconfig.json` reports zero errors attributable to any
of the first two files or the helper (27 PRE-EXISTING errors remain across OTHER,
unrelated test files mid-transition to V36 — none touched here). `node_modules/.bin/tsc
--noEmit -p tsconfig.bridge.json` reports zero errors attributable to the new bridge
file (10 pre-existing errors remain across other bridge test files, none touched here).

### 8.7 Genuine implementation defects found: NONE

Every disagreement between this suite and `8cf6bed2` traced to either a bug in this
suite's OWN construction (§8.1 F1-F3, §8.3 — all fixed) or a gap this task explicitly
left open with measured reasoning (§8.4). No case surfaced behaviour that disagreed with
780/806 AS THEY STAND at `8cf6bed2`'s own authority; the genuine S3 baseline (§8.2)
validated cleanly on the first try.

## 9. Next action for the parent (supersedes §7)

- Treat §8.5's runs as the authoritative, current evidence; §3's original scaffold-only
  runs remain the historical RED record.
- W4c and W7c are `it.todo` with reasons written in-code (§8.4); either needs a
  purpose-built fixture (a Distrust/Nemeses corpus world combined with a retirement
  window; a live production seat spanning an extended effective week) outside this
  task's own corpus and budget.
- This task did not commit; the parent copies these files (plus the new bridge file)
  into wherever they belong next.

**Concurrent activity noted, not acted on (matching 808's own precedent for the
identical situation):** at close, `git status --short` showed HEAD had advanced to
`b4b47070` (from `8cf6bed2`, the writer's own continued presentation work), plus ~14
pre-existing `M` test files this task never touched and one new evidence file
(`814-c2b-matched-pass-prediction.md`) neither authored nor read by this task — all
outside this task's own file list. All four of this task's own files were re-verified
byte-identical to §8.6's recorded sha256 (nothing else wrote to them), and all three
suites were re-run once more at the new HEAD `b4b4707039f875afb0457b9a635b719accf1efaf`
(2026-09-26 04:42-04:44 CEST): unchanged results, still 0 failed / 31 (2 todo), 0 failed
/ 14, and 0 failed / 6 respectively, and both `tsc` invocations still report zero errors
attributable to this task's files.
