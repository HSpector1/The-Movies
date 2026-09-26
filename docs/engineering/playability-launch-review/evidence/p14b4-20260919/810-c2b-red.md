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
