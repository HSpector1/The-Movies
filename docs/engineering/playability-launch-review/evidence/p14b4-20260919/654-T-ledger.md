# 654-T — P14B.5 T1 natural-chain ledger (R-D5 pre-declaration, measured)

Source identity: worktree /Users/zacheryspector/The-Movies-headless-program, task HEAD 74bd325b (clean tree at start); the
parent's docs-only header commit 8708d6a9 landed during authoring (`git diff --stat 74bd325b..8708d6a9 -- src bridge
generated ui scripts package.json 'tests/*.ts' tests/helpers tests/fixtures` is EMPTY), so every measurement here holds at
both. Nothing under src/, bridge/, generated/, tests/fixtures/ or any existing test changed; the only working-tree
change is the three new untracked test files.
Measured 2026-09-22 with node v20.20.2 on unchanged source (vite-node probe `scratchpad/probe-ledger.ts`, raw output
`scratchpad/654-T-ledger-raw.json`; the same routine is installed as family 12 in
tests/bridge-p14b5-relationships.test.ts and re-runs on every pass).

## A. Classes (plan "Natural-chain exposure and reconciliation classes", restated under 647-B D1/R2/A2)

- Roster-at-W predicate (647-B D1, plan scope (5)): a row of the issuer counts iff
  `terms.startWeek < W && (endedWeek === null || W < endedWeek)`, subject excluded; a row the pass committed at W
  (`startWeek === W`) and a row `finishHollywoodWeek` closed at W (`endedWeek === W`) are both OFF the roster.
- Survivors of a settlement: the distinct issuers with a `proposalSubmitted` receipt on the case (week in
  [openedWeek, W]) minus the issuers named by the receipt's `dropped` sentences (each mapped to its studio by name).
- EXPOSED (R-D5-SETTLE necessary condition): >= 2 survivors AND some survivor holds a roster member at W who shares a
  first take (director/lead/antagonist/support) with the subject. An edge exists only from a shared take (scope
  (2a); release/cancel drivers only move an existing edge), so with no shared-take counterpart on any survivor's
  roster every D5 band reads `none` and the receipt cannot move. NOT EXPOSED otherwise.
- After T2 the installed routine also recomputes the D5 band per survivor from `state.relationships` via
  `currentTier(edge, W)` at the settlement week and asserts (647-B R2): the D5 sentence (the one settled reason
  outside the eight frozen sentences) is present iff the winner's band strictly exceeds every other survivor's.

## B. Per-seed summary (416 ticks from `p13aGeneratedStudio(seed)`; churn = settlement week 208 or 416)

| seed | role | rows | settled/declined/expired | rows at 208 | rows at 416 | churn rows with a non-empty survivor roster | rows with a shared-take counterpart | EXPOSED |
|---|---|---|---|---|---|---|---|---|
| p13a-core-causal-01 | default | 40 | 16/8/16 | 24 | 16 | 0 | 0 | 0 |
| seed-b | seating/outcomes witness seed | 48 | 48/0/0 | 24 | 24 | 15 (all at 416: r01's four supply-265 rows) | 0 | 0 |
| p13b-s8-bridge-probe-01 | the bridge seed (plain campaign) | 48 | 48/0/0 | 24 | 24 | 10 (all at 416: r01's four supply-265 rows) | 0 | 0 |
| p13-public-commercial-adoption | adoption seed (B.1 T1 ruling (v); D3/poaching seed) | 48 | 36/12/0 | 24 | 24 | 6 (all at 416: r01's four supply-265 rows) | 0 | 0 |

Findings.
1. The synchronized churns SETTLE at 208 and 416 on all four seeds (every settlement receipt sits at one of the
   two); the plan's "404" is the week the second-cycle cases OPEN (renewal window 12 weeks before 416). Off-cycle
   settlements (player contracts, replacements, staggered rival rows): NONE occur on these four plain campaigns
   through 416 (the player signs nobody; every rival row is 0->208, 208->416 or 416->624 except r01's four
   `replacement` rows 265->473).
2. D1 CONFIRMED at 208: on every seed, every survivor of every 208 settlement has an EMPTY roster under the
   predicate (every counterpart row is closed AT W, every same-pass commit starts AT W). The churn receipts at 208
   are NOT exposed — the corrected prediction holds; the draft's inverted prediction does not.
3. The off-cycle class exists and is measured: at 416, r01 on seed-b / the bridge seed / the adoption seed holds
   four rows active under the predicate (`person-studio-*-r01-supply-265-6..9`, reason `replacement`, 265->473 —
   the P13 research-supply hires). None of those people shares a first take with any subject, so the 416 rows
   are NOT exposed either.
4. Therefore ZERO receipts on the four seeds are R-D5-exposed through week 416, and the four chain digests (B and
   §C tables below) MUST NOT MOVE at T2. R-ORDER-VALUE and R-VERSION movements touch no receipt. Any moved digest
   at T3 is a defect to attribute, never a re-pin.
5. `rngState` at 416 per seed is pinned (no RNG in B.5; the sim stream is untouched).

## C. Fixture-derived chains consumed by the engine RED (measured on unchanged source)

- `genuine-v30-first-take-at-five` (week 60, seed p13a-core-causal-01 with player actions): assign + schedule + one
  tick mints `first-take-event-24` at 61 for prod-0052 (director t-dir-01; lead t-act-09, antagonist t-act-12,
  support t-act-11; writer t-wri-03 excluded by scope); rngState after the take tick
  `2598418427,508725886,1318803286,3129010527` (unchanged by the take week); post-tick state digest with the
  `relationships` key removed `6403ac2bb1dd59249db054732115f9227a104f5f2afd9f699e9f89d393388d21`; the picture
  reaches Release Ready at 64, `commitPictureToRelease` at 64, released in the tick to 65 with `releaseTick` 64
  and criticScore 50.742615604806076 (which branch of the success/failure edges it falls in is decided by the
  hypothesis constants at T2, the RED branches on them); rngState after the release tick
  `3273107727,1382938971,2227203681,3129010529`. A cancel at 61 (take exists) leaves promise-0 SATISFIED; a cancel
  at 60 (no take) leaves promise-0 OPEN (outcome null) under the frozen promise law.
- `genuine-v30-rival-current-p1-and-p2` (week 196): post-migration rival takes/releases on the unchanged chain —
  r01 film:11 take @213, release @217 (releaseTick 216, criticScore 44.1); film:6 take @222, release @226
  (rt 225, cs 46.6); film:12 take @234 / release @238 (cs 52.0); film:13 take @247 / release @251 (cs 63.7).
  No other take between 196 and 222. The 208 churn on this campaign is a settlement week; its receipts are not
  D5-exposed (no shared-take counterpart can be on a survivor's roster at 208 under D1), so these weeks are
  pinned as premises, not searched for.

## D. Named controls and their consumers

- `poachingFixture` (tests/helpers/p14b2-fixtures.ts :145-211; direct consumers `tests/bridge-p14b2-trust.test.ts`,
  `tests/p14b2-fixture-preconditions.test.ts`): the week-208 settled receipt's reasons pinned byte-for-byte
  (:200-201 `['their compensation band ranked above the others', 'their term matched what this person prefers']`),
  the subject's r04 row `endedWeek === 208` (:204). Measured under D1 at 208: r04's roster is EMPTY; the player's
  roster is exactly ONE row, the writer signed at 196 (:171), who shares no first take with the subject
  (the player filmed nothing on that campaign). Prediction: DOES NOT MOVE at T2 (installed as a control in the
  bridge RED, family 12).
- The other cached fixtures of the helper (`retentionFixture` :62, `historyFixture` :128, `rivalFixture` :215) and
  their consumers (the thirteen files the expansion lists) are pre-declared by the same rule: none pins a
  settlement that a D5 band could move (retention/history settle the player's own renewals with the player as the
  sole or dominating bidder; rivalFixture reads promise outcomes, not a contested settlement); not measured here.
- The B.2 T3 controlled D3 case (tests/p14b1-trust-chooser.test.ts :305): survivors player + r04 (incumbent) at
  208; the player's only row on that campaign ends at 52, r04's rows close AT 208 — both rosters EMPTY under D1
  (measured on the family-6 base built the same way: r04 roster [] at 208, the player's roster holds only the
  rows the test itself signs). Its equal-band premise survives (647-B Q5); no re-expression needed.

## E. Family-6 base premise (the RED's controlled staging, measured on unchanged source; `scratchpad/f6.probe.test.ts`)

`p13-public-commercial-adoption`, subject person-studio-5a47d054-r04-3 (age 29.8 at 208: unproven), incumbent r04.
Player signs t-act-23 for 52 weeks at 0 (ranToEnd at 52 -> Reliable fallback), t-act-22 for 208 weeks at 0
(closed AT 208), t-act-10 for 156 weeks at 60 (60->216, ON the roster at 208). Pre-market 196 input captured;
case + discovery injected first (settles first at 208, every rival seat vacant); five proposals at tier 1, 208
weeks; IMPOSSIBLE attachments on r02/r03/r04 (dropped `promiseNotFeasible`); player standing := r01's.
Trust at 208: player Reliable, r01 Reliable. RESULT at 208 (control, no edge): `declined`, reasons
`["this person could not separate 2 equally ranked proposals."]`, dropped 3 -> every landed band ties between the
player and r01. D1 rosters at 208: player [t-act-10 player-contract 60-216], r01 [], r04 [].
The treated branches (CloseFriends edge subject<->t-act-10 -> player settles with the D5 sentence only; drifted
edge / closed-at-W counterpart t-act-22 / committed-at-W counterpart signed inside the 208 pass -> decline;
counterpart signed at 207 -> settles) are RED until T2.

## F. Per-seed settlement rows (receipt-derived; survivors as issuer:rosterAtW:sharedTakeCounterparts)

### p13a-core-causal-01

settlementDigest 706e54c6ec9728df1664025982ebbafeb0fc36afb245b6bd0b983305f6a10a77
receiptsDigest af8c4d1325ecb350dbc07fbf2f762dd8257db04075b8030bf7bd975b4cb2a766
employmentDigest 09bcc35ba327579ac63dd1ed63535b23cbc8ff55b25fd9597a2872a819f08750
takesDigest 8af116b1687ed210c02953b5b506456e638a64482e8042b0e549b0d57e428694
rngState(416) 2598418427,508725886,1318803286,3129010527
rows 40 (settled 16, declined 8, expired 16); exposed 0; first exposed week: none

| week | eventId | kind | subject | subjectStudio | winner | survivors (issuer:rosterAtW:sharedTakeCounterparts) | class |
|---|---|---|---|---|---|---|---|
| 208 | talent-market-event-96 | settled | r01-0 | r01 | r02 | r01:0:0 r02:0:0 r03:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-97 | settled | r01-1 | r01 | r02 | r01:0:0 r02:0:0 r03:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-98 | settled | r01-2 | r01 | r02 | r01:0:0 r02:0:0 r03:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-99 | settled | r01-3 | r01 | r02 | r01:0:0 r02:0:0 r03:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-100 | settled | r01-4 | r01 | r02 | r01:0:0 r02:0:0 r03:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-101 | settled | r01-5 | r01 | r02 | r01:0:0 r02:0:0 r03:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-102 | settled | r02-0 | r02 | r01 | r01:0:0 r03:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-103 | settled | r02-1 | r02 | r01 | r01:0:0 r03:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-104 | settled | r02-2 | r02 | r01 | r01:0:0 r03:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-105 | settled | r02-3 | r02 | r01 | r01:0:0 r03:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-106 | settled | r02-4 | r02 | r01 | r01:0:0 r03:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-107 | settled | r02-5 | r02 | r01 | r01:0:0 r03:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-108 | settled | r03-0 | r03 | r03 | r03:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-109 | settled | r03-1 | r03 | r03 | r03:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-110 | settled | r03-2 | r03 | r03 | r03:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-111 | settled | r03-3 | r03 | r03 | r03:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-112 | declined | r03-4 | r03 | - | (none) | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-113 | declined | r03-5 | r03 | - | (none) | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-114 | declined | r04-0 | r04 | - | (none) | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-115 | declined | r04-1 | r04 | - | (none) | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-116 | declined | r04-2 | r04 | - | (none) | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-117 | declined | r04-3 | r04 | - | (none) | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-118 | declined | r04-4 | r04 | - | (none) | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-119 | declined | r04-5 | r04 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-148 | expired | r01-0 | r02 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-149 | expired | r01-1 | r02 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-150 | expired | r01-2 | r02 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-151 | expired | r01-3 | r02 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-152 | expired | r01-4 | r02 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-153 | expired | r01-5 | r02 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-154 | expired | r02-0 | r01 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-155 | expired | r02-1 | r01 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-156 | expired | r02-2 | r01 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-157 | expired | r02-3 | r01 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-158 | expired | r02-4 | r01 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-159 | expired | r02-5 | r01 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-160 | expired | r03-0 | r03 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-161 | expired | r03-1 | r03 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-162 | expired | r03-2 | r03 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-163 | expired | r03-3 | r03 | - | (none) | NOT EXPOSED (<2 survivors) |

### seed-b

settlementDigest f9622a876a73673591f4016b5fe80ab708bbec30e330a423d3d82729b0ec678c
receiptsDigest 8e791d65d1a54ee73a8c7a2debbfed272a0f144f240040d074118a337edeb871
employmentDigest ba5ab89e481264e8d6a57d32f07ac49902bcc36b65a1df14722f85c573f0b13a
takesDigest c81d90211a2b917681e8c816c85df567a2139dda9372d3cd608615f9e23c805d
rngState(416) 1640490702,2161102015,891615888,2071390822
rows 48 (settled 48, declined 0, expired 0); exposed 0; first exposed week: none

| week | eventId | kind | subject | subjectStudio | winner | survivors (issuer:rosterAtW:sharedTakeCounterparts) | class |
|---|---|---|---|---|---|---|---|
| 208 | talent-market-event-120 | settled | r01-0 | r01 | r01 | r01:0:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-121 | settled | r01-1 | r01 | r01 | r01:0:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-122 | settled | r01-2 | r01 | r01 | r01:0:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-123 | settled | r01-3 | r01 | r01 | r01:0:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-124 | settled | r01-4 | r01 | r01 | r01:0:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-125 | settled | r01-5 | r01 | r01 | r01:0:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-126 | settled | r02-0 | r02 | r02 | r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-127 | settled | r02-1 | r02 | r02 | r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-128 | settled | r02-2 | r02 | r02 | r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-129 | settled | r02-3 | r02 | r02 | r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-130 | settled | r02-4 | r02 | r02 | r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-131 | settled | r02-5 | r02 | r02 | r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-132 | settled | r03-0 | r03 | r03 | r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-133 | settled | r03-1 | r03 | r03 | r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-134 | settled | r03-2 | r03 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-135 | settled | r03-3 | r03 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-136 | settled | r03-4 | r03 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-137 | settled | r03-5 | r03 | r03 | r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-138 | settled | r04-0 | r04 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-139 | settled | r04-1 | r04 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-140 | settled | r04-2 | r04 | r03 | r03:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-141 | settled | r04-3 | r04 | r03 | r03:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-142 | settled | r04-4 | r04 | r03 | r03:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-143 | settled | r04-5 | r04 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-276 | settled | r01-0 | r01 | r04 | r01:4:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-277 | settled | r01-1 | r01 | r04 | r01:4:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-278 | settled | r01-2 | r01 | r01 | r01:4:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-279 | settled | r01-3 | r01 | r01 | r01:4:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-280 | settled | r01-4 | r01 | r01 | r01:4:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-281 | settled | r01-5 | r01 | r04 | r01:4:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-282 | settled | r02-0 | r02 | r02 | r01:4:0 r02:0:0 r03:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-283 | settled | r02-1 | r02 | r02 | r01:4:0 r02:0:0 r03:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-284 | settled | r02-2 | r02 | r02 | r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 416 | talent-market-event-285 | settled | r02-3 | r02 | r02 | r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 416 | talent-market-event-286 | settled | r02-4 | r02 | r02 | r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 416 | talent-market-event-287 | settled | r02-5 | r02 | r02 | r01:4:0 r02:0:0 r03:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-288 | settled | r03-0 | r03 | r03 | r01:4:0 r03:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-289 | settled | r03-1 | r03 | r03 | r01:4:0 r03:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-290 | settled | r03-2 | r04 | r04 | r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 416 | talent-market-event-291 | settled | r03-3 | r04 | r04 | r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 416 | talent-market-event-292 | settled | r03-4 | r04 | r04 | r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 416 | talent-market-event-293 | settled | r03-5 | r03 | r03 | r01:4:0 r03:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-294 | settled | r04-0 | r04 | r01 | r01:4:0 | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-295 | settled | r04-1 | r04 | r01 | r01:4:0 | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-296 | settled | r04-2 | r03 | r03 | r03:0:0 | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-297 | settled | r04-3 | r03 | r03 | r03:0:0 | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-298 | settled | r04-4 | r03 | r03 | r03:0:0 | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-299 | settled | r04-5 | r04 | r01 | r01:4:0 | NOT EXPOSED (<2 survivors) |

### p13b-s8-bridge-probe-01

settlementDigest f8b0d3a7a9d15b30ce65b3b90c291d29189aabd5f445621c7996117b4fd178c2
receiptsDigest b729a1f33fac085228697a52bb474400b26ca04dab8114f2cd3fa893861186c4
employmentDigest 6e39a55cbf70e669ac5b27e1d845a6279057ead6b2922c526d25a45f605043ae
takesDigest df029e65f83f015c0efe36258b36444c9c0f30e61e9d732b791d13a4d8d6da75
rngState(416) 2343039306,887634093,2940629248,1402597496
rows 48 (settled 48, declined 0, expired 0); exposed 0; first exposed week: none

| week | eventId | kind | subject | subjectStudio | winner | survivors (issuer:rosterAtW:sharedTakeCounterparts) | class |
|---|---|---|---|---|---|---|---|
| 208 | talent-market-event-120 | settled | r01-0 | r01 | r02 | r01:0:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-121 | settled | r01-1 | r01 | r02 | r01:0:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-122 | settled | r01-2 | r01 | r02 | r01:0:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-123 | settled | r01-3 | r01 | r02 | r01:0:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-124 | settled | r01-4 | r01 | r02 | r01:0:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-125 | settled | r01-5 | r01 | r02 | r01:0:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-126 | settled | r02-0 | r02 | r01 | r01:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-127 | settled | r02-1 | r02 | r01 | r01:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-128 | settled | r02-2 | r02 | r01 | r01:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-129 | settled | r02-3 | r02 | r01 | r01:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-130 | settled | r02-4 | r02 | r01 | r01:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-131 | settled | r02-5 | r02 | r01 | r01:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-132 | settled | r03-0 | r03 | r03 | r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-133 | settled | r03-1 | r03 | r03 | r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-134 | settled | r03-2 | r03 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-135 | settled | r03-3 | r03 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-136 | settled | r03-4 | r03 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-137 | settled | r03-5 | r03 | r03 | r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-138 | settled | r04-0 | r04 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-139 | settled | r04-1 | r04 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-140 | settled | r04-2 | r04 | r03 | r03:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-141 | settled | r04-3 | r04 | r03 | r03:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-142 | settled | r04-4 | r04 | r03 | r03:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-143 | settled | r04-5 | r04 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-276 | settled | r01-0 | r02 | r02 | r01:4:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-277 | settled | r01-1 | r02 | r01 | r01:4:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-278 | settled | r01-2 | r02 | r02 | r01:4:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-279 | settled | r01-3 | r02 | r02 | r01:4:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-280 | settled | r01-4 | r02 | r02 | r01:4:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-281 | settled | r01-5 | r02 | r01 | r01:4:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-282 | settled | r02-0 | r01 | r01 | r01:4:0 r03:0:0 r04:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-283 | settled | r02-1 | r01 | r02 | r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 416 | talent-market-event-284 | settled | r02-2 | r01 | r01 | r01:4:0 r03:0:0 r04:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-285 | settled | r02-3 | r01 | r01 | r01:4:0 r03:0:0 r04:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-286 | settled | r02-4 | r01 | r01 | r01:4:0 r03:0:0 r04:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-287 | settled | r02-5 | r01 | r02 | r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 416 | talent-market-event-288 | settled | r03-0 | r03 | r03 | r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 416 | talent-market-event-289 | settled | r03-1 | r03 | r03 | r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 416 | talent-market-event-290 | settled | r03-2 | r04 | r03 | r03:0:0 | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-291 | settled | r03-3 | r04 | r03 | r03:0:0 | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-292 | settled | r03-4 | r04 | r03 | r03:0:0 | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-293 | settled | r03-5 | r03 | r03 | r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 416 | talent-market-event-294 | settled | r04-0 | r04 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-295 | settled | r04-1 | r04 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-296 | settled | r04-2 | r03 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-297 | settled | r04-3 | r03 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-298 | settled | r04-4 | r03 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-299 | settled | r04-5 | r04 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |

### p13-public-commercial-adoption

settlementDigest c034f2fb5a8e5f454a475020cec9de1ac764d742ce121a6cd8d2bc3b641eb544
receiptsDigest be7310b6d73124dab34723644f7cf16c52a4b193e67a4b85d9c20e7f60e47850
employmentDigest bb775d62c37d48e48af30811a69c86e117d89c63166bd1af4d73df1b3c16fc97
takesDigest 3867855dd105c2fff8389e9dc76b56d7ecc43f9722419de3e85423a84b087094
rngState(416) 3069080245,1730081600,660681499,2741201056
rows 48 (settled 36, declined 12, expired 0); exposed 0; first exposed week: none

| week | eventId | kind | subject | subjectStudio | winner | survivors (issuer:rosterAtW:sharedTakeCounterparts) | class |
|---|---|---|---|---|---|---|---|
| 208 | talent-market-event-120 | settled | r01-0 | r01 | r01 | r01:0:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-121 | settled | r01-1 | r01 | r01 | r01:0:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-122 | settled | r01-2 | r01 | r01 | r01:0:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-123 | settled | r01-3 | r01 | r01 | r01:0:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-124 | settled | r01-4 | r01 | r01 | r01:0:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-125 | settled | r01-5 | r01 | r01 | r01:0:0 r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-126 | settled | r02-0 | r02 | r02 | r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-127 | settled | r02-1 | r02 | r02 | r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-128 | settled | r02-2 | r02 | r02 | r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-129 | settled | r02-3 | r02 | r02 | r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-130 | settled | r02-4 | r02 | r02 | r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-131 | settled | r02-5 | r02 | r02 | r02:0:0 r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-132 | settled | r03-0 | r03 | r03 | r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-133 | settled | r03-1 | r03 | r03 | r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-134 | settled | r03-2 | r03 | r03 | r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-135 | settled | r03-3 | r03 | r03 | r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-136 | settled | r03-4 | r03 | r03 | r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-137 | settled | r03-5 | r03 | r03 | r03:0:0 r04:0:0 | NOT EXPOSED (all rosters empty at W) |
| 208 | talent-market-event-138 | settled | r04-0 | r04 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-139 | settled | r04-1 | r04 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-140 | settled | r04-2 | r04 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-141 | settled | r04-3 | r04 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-142 | settled | r04-4 | r04 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |
| 208 | talent-market-event-143 | settled | r04-5 | r04 | r04 | r04:0:0 | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-228 | settled | r01-0 | r01 | r01 | r01:4:0 r02:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-229 | settled | r01-1 | r01 | r01 | r01:4:0 r02:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-230 | settled | r01-2 | r01 | r01 | r01:4:0 r02:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-231 | settled | r01-3 | r01 | r01 | r01:4:0 r02:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-232 | settled | r01-4 | r01 | r01 | r01:4:0 r02:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-233 | settled | r01-5 | r01 | r01 | r01:4:0 r02:0:0 | NOT EXPOSED (off-cycle rows, no shared take) |
| 416 | talent-market-event-234 | settled | r02-0 | r02 | r02 | r02:0:0 | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-235 | settled | r02-1 | r02 | r02 | r02:0:0 | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-236 | settled | r02-2 | r02 | r02 | r02:0:0 | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-237 | settled | r02-3 | r02 | r02 | r02:0:0 | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-238 | settled | r02-4 | r02 | r02 | r02:0:0 | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-239 | settled | r02-5 | r02 | r02 | r02:0:0 | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-240 | declined | r03-0 | r03 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-241 | declined | r03-1 | r03 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-242 | declined | r03-2 | r03 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-243 | declined | r03-3 | r03 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-244 | declined | r03-4 | r03 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-245 | declined | r03-5 | r03 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-246 | declined | r04-0 | r04 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-247 | declined | r04-1 | r04 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-248 | declined | r04-2 | r04 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-249 | declined | r04-3 | r04 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-250 | declined | r04-4 | r04 | - | (none) | NOT EXPOSED (<2 survivors) |
| 416 | talent-market-event-251 | declined | r04-5 | r04 | - | (none) | NOT EXPOSED (<2 survivors) |
