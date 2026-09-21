# 628 — Qualified checkpoint: the final seating preference (plan :215-236; record 618 NEXT618 (a) → 621 → 619-W → 619-T2 → 619-R)

2026-09-21. Claude Code parent. The rival's final seating preference is LANDED and reviewed
READ-ONLY by the contract-auditor (619-R, verbatim in `619-R-review.md`, SHA256
`57c91efc9fbbcd97…`): **QUALIFIED WITH RECORD-ONLY ITEMS**, conditional on 627, which is now in
(below). No demonstrated defect in source or tests; no unexplained natural-chain movement. Not
Owner acceptance; the rule is the plan's delegated hypothesis "subject to expansion review"
(:187), and three expansion-review questions are put to the Owner in §Owner decisions.

## Identity (HEAD `85d23a8b`, clean tree)

| Commit | Content |
| --- | --- |
| `4baa4d7b` (619-W S1) | `src/core/promises.ts` `promisedCastMasks` (:599-618: bound OPEN, unmet, same issuer, take inside the half-open window, mask intersection, CURRENT offers never count); `src/core/hollywoodPolicy.ts` optional `promisedMasks`, `benefitOf`, comparison `benefit > bestBenefit \|\| (benefit === bestBenefit && score > bestScore)` after the unchanged cash/viability gates; no-member path byte-identical |
| `fc1c7b07` (619-W S2) | `src/core/hollywoodTick.ts` :161-178 initial-cast seam (director/craft by the existing rule; `taken = {writer, director, craft}`; promised members first in employment order; historical first-three when no member; masks passed only when non-empty — 619-B D1) |
| `85d23a8b` (619-T2) | `tests/p14b4-rival-seating-preference.test.ts` (814 lines) re-pinned from receipts and extended (seam law asserted on every row of both seeds; positive seam witness live); `tests/p14b4-cast-class-outcomes.test.ts` comment :211-219 only |

Each writer commit's cumulative diff equals its patch byte for byte (`619-W-cum-S1.patch`
`6646be64…`, `619-W-cum-S2.patch` `eeeb75a2…`). File identities at HEAD: `promises.ts`
`8bfbe36e…` 1116 lines; `hollywoodPolicy.ts` `f2a43e36…` 74; `hollywoodTick.ts` `f6c37fc2…` 365;
the RED `4a480335…` 814; outcomes `1e32f627…` 508. No save, bridge, wire, receipt, RNG, index
export, cap, tariff, timeout, fixture or refusal change; replay module and stale test untouched;
nothing native.

## Evidence (record-check, one process at a time, `fixedSource: true`)

| # | On | Result |
| --- | --- | --- |
| 620 | 62ca561a + the RED | baseline on unchanged source 5 failed / 15 passed / 2 todo |
| 622 | fc1c7b07 | RED after the writer 19 passed / 1 failed / 2 todo — the ONLY failure the default-seed digest :406 (R2 met exactly: G10-b, r01 w208 admits its sole writer r02-0 on promise-12, every row `ok`) |
| 623 | fc1c7b07 | root+UI typecheck EXIT 0 |
| 624 | fc1c7b07 | live-P2 set 1 failed (evaluator-5 by law) / 192 passed / 1 todo |
| 625 | fc1c7b07 | 16 natural-chain control files (B1/B2/B3 sets, bridge-p14b2-trust, bridge-p13b-s8-rivals, p13a-rival-adoption, p14a1-rival-trigger) 177 passed / 2 todo — no pinned control moved |
| 626 | c73b9a3e + 619-T2 | RED 21 passed / 1 todo; outcomes 23/23 |
| 627 | 85d23a8b | **full core 9 files / 24 failed / 3791 passed / 8 todo** (345 files) = the 22 inherited since 89b5ad2 (campaign-library 11, campaign-isolation 1, scientist-foundation 3, r3n1 6, provenance 1) + 2 designated (stale route :234 by 515 §6 (c); evaluator-5 by law). The natural premises (610: outcomes 10, policy 1) and the load-only four are gone. Cleanest full core of the program; never cited as all-green |

## G10 "post-binding rival seating drift" — the ledger (619-R Q4, verbatim in `619-R-review.md`; every landed row `ok`, no UNEXPLAINED movement)

- Default seed `p13a-core-causal-01` (rows < w208 identical): w208 r01 script-0006 → pool
  [r02-0 writer, r02-2, r02-3], no viable package (was film:6); w208 r01 script-0011 → film:11
  lead r02-3 / antagonist r02-2 / support r02-0, first-take-event-45 w213, promise-12/16/18
  SATISFIED (G10-b); w217 r01 film:6 pool [r02-4, r02-2, r02-3], take w222 → promise-20
  SATISFIED (pictures swap weeks); w229/242/255/264 same cast, budget drift downstream; r02
  w208–349 (284 rows) pool [r01-0 writer, r01-2, r01-3], no viable package on both sources
  (pre-existing). Net r01 promise service by w222: 4 of 6 (was 3 of 6); promise-14/22 (sole
  director/craft) OPEN (G-1). `sharedTakeOutcomes()` content moved (12/16/18 on film:11),
  assertion held.
- `seed-b`: w211 r01 film:23 G10-a — same triple, cast a4/a2/a3 (was a4/a3/a2), expected score
  −1,735,081 vs −1,425,536 (309,545 hypothesis cost), promise-4/6/8 SATISFIED at 216; rivalWorlds
  still met on film 23 (lead promise-8 tagged genuine, antagonist promise-4 tagged, support
  promise-6 P1).
- Bridge seed `p13b-s8-bridge-probe-01` (NOT predicted by 619-B; found by 619-T2): w211 BOTH
  rivals seat their sole writer as antagonist — r01 film:23 pool [r02-0 writer, r02-2, r02-3],
  score 1,294,545 vs 2,990,248 (1.70M pool-composition cost; all members generic); r02 film:23
  seats r01-0 holding TAGGED promise-1, benefit 3 @ 2,363,080 vs ordinary benefit 2 @ 3,703,443
  (1.34M chooser cost). The file's cash-derived pins 265/266/276/278/288 held (625 17/17); margin
  unmeasured.
- Adoption seed `p13-public-commercial-adoption`: G10-0 through w530 (digest equal; r05 purchase
  w520; trust-chooser comment literals equal).

## Owner-visible behaviour of this slice (619-R Q5)

1. A rival keeps more of its bound cast promises: promised people are seated first and, among
   viable packages, the billing that serves the most promises wins, at an uncapped expected-score
   cost (309,545; 1.34M; up to 1.70M from pool composition when a weaker promised person displaces
   the third actor).
2. A rival's sole WRITER can appear in a cast seat whenever the ready screenplay was written by
   someone else (the w208/w211 team swaps); he is then busy for the picture's run (measured
   commission stall on the default chain: 0 weeks, because the two-script inventory rule gates
   commissions through w216; the window would bind on a thinner inventory).
3. The order of a rival's pictures can shift (film:11 before film:6): a promised pool with no
   viable package skips that screenplay this week and the loop takes the next ready one; no
   picture was lost on any probed seed (G-2: no ordinary-pool retry — plan :223-225 honoured).
4. G-1 unchanged in law: rival-authored cast promises to a sole director/craft (and to a sole
   writer with no foreign-written script) break at their due week; the seam converted one such
   instance into a kept promise (promise-12).

## Owner decisions for the expansion review (plan :187; nothing adopted now — 619-R ruling 4)

- **R5 — seam ordering.** Keep as landed: "A rival seats anyone on its payroll who holds a bound,
  unmet cast promise from it, including its sole writer when the screenplay was written by
  someone else, ahead of its ordinary actors, and bills the picture to keep the most promises it
  can among viable packages, whatever the expected-score cost; I accept this as the rival
  strategy for now, subject to the expansion review." — or adopt actors-first: "A rival fills
  cast seats from promised actors first and admits a promised writer or other non-actor only when
  fewer than three promised actors are available; a cast promise it made to its sole crew member
  may therefore stay unkept and break at its due week."
- **G-1(A) — authoring exclusion (later, own RED; moves every natural chain after w196 on every
  seed):** "A rival stops authoring cast promises to people whose only lawful role on its pictures
  is a non-cast seat (its sole writer, director or craft worker)."
- **G-2 — ordinary-pool retry:** whether a rival whose promised pool has no viable package should
  retry the ordinary pool the same week (beyond the plan text; record-only until ruled).

## Record-only and REFINE (619-R Q6; carried)

Stale RED titles/comments (:490, :507, :658, :528, :659-660, line refs :22/:96, the seam-witness
comment's unverified seed-c/d claim); 619-A corrections (§4.2 G10-b on the default and bridge
seeds; bridge seed name; "< w208"; scientists only via a case); 621 :9 "698 lines" → 814; the
acting-profile check :169 tautological by type (kept for consistency with the feasibility
owner's has-discipline expression); `poolKnownBefore` coverage count (REFINE); the bridge-seed
writer-busy stall unmeasured; seed-c/seed-d unscanned; r02 default-seed no-viable-package
condition pre-existing; the 616/618 record-only lists unchanged.

## Next (bounded)

NEXT618 (b): the `breakPromisesOnCancel` causal-coupling correction (26 §2; a joint reservation
conflict, unsupported legacy family, protected-path failure or UNCERTIFIED analysis is not
target-specific physical impossibility; replace with the plan's separate target-specific proof
and the cancelled-picture class check; first-take-then-cancel immunity kept) — test-author RED
first, then sim-core design note, review, ONE writer. Then (c) the stale-title text pass + the
574-R doc fix. Evaluator 5 later (D2 (i-c)). Unity/native deferred; no wire change in this slice.
