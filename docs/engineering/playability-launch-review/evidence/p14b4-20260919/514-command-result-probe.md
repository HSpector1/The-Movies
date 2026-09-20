# 514 — Temporary command-result and remaining-cut probes on the frozen 505 source

2026-09-20. Parent-applied, passive, UNMETERED diagnostic on the qualified 505 source
(513), following the archived 500 pattern. No optimization, owner, tariff, cap, timeout,
test or validator changed. No production writer was engaged: the sites are the six archived
500 observations re-expressed against the 505 text plus four analogous sites around the new
command projection. The exact 505 source was restored and hash-verified before any further
source task; no diagnostic remains.

## Exact temporary delta and identities

- Base: commit `1f0b968ca58a52dba417d1b928e1659568321dfc` (HEAD during both runs; its
  replay source is the frozen 505 `5d4851713ff53209b569c813b78a1e22e6b53ab91e27522ceb5a9ee7222a941a`).
- Probed source SHA256 `af3294964623465ef1c5e1d481935b5315a5aa68f3ae7215482dc5befe042f6a`,
  +34/−1 lines, ten `console.log('B4_RESULT_514', …)` sites, each preceded by a
  `TEMPORARY 514` comment. Archived probe patch (record-check capture, identical for both runs)
  `9ee9c96e1735bc938bfae64d0507a48fb25104c4ba3a560860a9b9838fb1a887`.
- Sites: payFailure (inside the original failed-payment branch, before saturation/throw, with
  a captured stack); dimensionsEntry/Done (full `dimensions`); commandDimensionsEntry/Done
  (the 505 `commandDimensions`, Done includes the complete ten-field projection);
  commandEntry/Done (`executeCommand` first payment / after drain); frameEntry; sweepBillDone
  (after `sweepBill` returns, before the owner reservation, with the full `Dimensions`
  record); result (attempt kind/reason/through only). Only the failed-payment one-liner was
  expanded into braces; its comparison, assignment and thrown class are unchanged.
- Runs (serial, `record-check.mjs`, both fixedSource:true, no untracked source):
  first-take 14:27:55.705–14:28:02.295Z exit 0 (PASS incl. kernel);
  stale 14:28:02.590–14:28:08.952Z exit 1 (original `expected 'workLimit' to be
  'commandRefused'` at test line 234).
- Restoration: `git checkout -- src/core/promiseCapacityOwnerReplay.ts` at 14:28:09Z; SHA256
  `5d4851…2941a` verified; `git status` shows only the six 514 evidence files.

## First-take route (`tests/p14b4-ready-replay-first-take.test.ts`)

| Stage | 492 (500 probes) | 505 (514 probes) | Δ |
| --- | --- | --- | --- |
| preparation + admission to week-1 frame | 65795 | 65795 | 0 |
| week-1…4 frames (bills 315, 11193, 9587, 8905) | 65795→137871* | 65795→137871 | 0 |
| assignLockedDirector discovery | 4542 (137904→142446) | 2825 (137928→140753) | −1717 |
| assignLockedDirector whole command | n/a | 7189 (137871→145060) | |
| scheduleTake discovery | 3176 (146852→150028) | 2290 (145183→147473) | −886 |
| scheduleTake whole command | n/a | 3592 (145126→148718) | |
| week-5 frame entry | 151273 | 148718 | −2555 |
| week-5 `dimensions` | 3234 | 4173 | +939 deferred cold discovery |
| week-6 frame entry | 160625 | 159009 | −1616 |
| final producer work (result) | 190818 | 189256 | −1562 |

*492 had no commandEntry probe; its week-4 sweepBillDone 124164 equals the 505 value.
The original test, including the SAME cumulative 200000 kernel assertion, passes again.

## Stale route (`tests/p14b4-ready-replay-stale-target.test.ts`)

| Stage | 492 | 505 | Δ |
| --- | --- | --- | --- |
| to week-1 frame entry | 66333 | 66333 | 0 |
| week-1…4 frame entries | 72350 / 91740 / 116734 | same | 0 |
| assignLockedDirector discovery / whole command | 4542 / n/a | 2825 / 7189 | −1717 |
| scheduleTake discovery / whole command | 3176 / n/a | 2290 / 3592 | −886 |
| week-5 frame entry | 151895 | 149340 | −2555 |
| week-5 `dimensions` | 3234 | 4173 | +939 |
| week-6 / 7 / 8 frame entries | 161247 / 187128 / 196185 | 159631 / 185566 / 194713 | −1616 / −1562 / −1472 |
| week-8 `dimensions` done | 199381 | 197999 | −1382 |
| cut | 199996, request 15, in `frame` BEFORE the setup collector | 199994, request 10, INSIDE `sweepBill` (505 line 1520 via `Work.times` line 294, called from `frame` line 1895) | |
| result | workLimit through (8,0) | workLimit through (8,0) | |

Per-frame cost on 505 (frame entry to next frame entry): week 1 6017 (bill 315); week 2
19390 (bill 11193); week 3 24994 (bill 9587, 16019 after the bill); week 4 21759 (bill 8905,
13735 after); commands week 5 10847; week 5 10291 (bill 850); week 6 25935 (bill 7948, 15250
after); week 7 9147 (bill 576); week 8 cut during the bill. Preparation plus Ready admission
before the first frame is 66333, of which 44454 precedes the first `dimensions` call and
18325 follows it.

## Attribution and limits

- Gross command-discovery saving 2603 on this fixture; 939 reappeared as deferred cold
  discovery in the next full frame, exactly as 503/505/506 warned. Net saving at week-8 entry
  is 1472 (first-take producer 1562). No net figure is a prediction for other fixtures.
- 505 moved the stale boundary past the setup collector and the commitment loop into the
  week-8 `sweepBill`, but the route still needs the remainder of that frame (Post 2→1),
  the week-9 `commitRelease` command with its release-owner bill, the week-9 frame with the
  actual release admission, and the week-10 stale command before the refusal is reached.
  On the 492 profile those stages cost on the order of tens of thousands of units; bounded
  reductions of one to three thousand units each will not close that gap alone. This is a
  measured statement about the remaining route, not a proof of its exact size.
- The single largest measured block is preparation plus Ready admission (66333, a third of
  the cap) followed by the Development/Post frames at 19–26k each; those are the evidence-
  backed attribution targets for the next READ-ONLY analysis. No reduction is adopted here.
- No cap, timeout, assertion, fixture or expected-failure set was changed or is proposed.
