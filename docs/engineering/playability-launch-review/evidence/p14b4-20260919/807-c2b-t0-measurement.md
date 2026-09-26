# 807 — P14C.2b-T0 corpus reachability, measured

Authored under the test-author role contract (`.claude/agents/test-author.md`); roles are not
registered in this session, so this record runs as a general-purpose agent carrying that contract.

Source `68783a8acb53aba4989829a2f6ddf95d8d544bc3` (published; `src/` is the FINAL V35 writer — C.4
closed at record 805 — before any C.2b source change). Probe archived at
`807-c2b-t0-probe.test.ts.txt`. Run alone by positional filename, three revisions (one failing
authoring error, corrected before any world was built past it), never inside a suite pass. It asserts
nothing about the product — every axis fact is printed only. Removed from `tests/` after use, so no
suite collects it.

Record 780 §6.3 (folded in by the parent's §6 amendment after C.4 landed first) names six axes (a-f)
for the C.2b single-final-extension fixture corpus. This record establishes by BUILDING them which are
reachable and what each world actually contains, before the minter (808) commits bytes. Three seeds:
`p14c2b-corpus-01-ade` (axes a, d, e), `p14c2b-corpus-01-bf` (axis b, plus a weak axis-f fact),
`p14c2b-corpus-01-c1` (axes c and f, richly).

Commands run (all identical positional-filename invocations):
```
node_modules/.bin/vitest run tests/p14c2b-t0-probe.test.ts --minWorkers=1 --maxWorkers=1
```
Three executions: revision 1 (2026-09-26 03:19:27 CEST start, 38.41s, exit 0, 1 passed) used a writer
authored at age 75 for axis d, which FAILED at `createTalent`'s own `[18,70]` age clamp
(`src/core/actions.ts:778-779`) — caught immediately by the test's own natural error path, not
silently absorbed. Revision 2 (03:21:09, 4.02s, exit 1, 1 failed) is that failure, captured for the
record rather than discarded. Revision 3 (03:21:46, 94.04s tests 91.02s, exit 0, 1 passed) replaces
the writer with a SECOND actor (same hard boundary as axis a, 70, authorable directly) for axis d, and
adds the axis-c decline-baseline rebuild and a bonus axis-f richness check on world 2's week-104
cohort. `git status --porcelain` and `git rev-parse HEAD` were checked before and after this record's
whole session (03:19–03:24 CEST): HEAD stayed `68783a8a...`, and the only working-tree change was the
new untracked probe file itself.

## A correction found by the probe (not guessed)

The first content revision authored the axis-d subject as a writer at age 75, assuming a writer's own
D1 hard boundary (75, `TUNING.RETIREMENT_WINDOWS.writer.hard`) could be authored directly there. It
cannot: `createTalent` clamps every authored age to `[18,70]` (`actions.ts:778-779`, "age out of
range"), so only `actor` (hard boundary exactly 70) can be authored AT its own hard boundary in one
step; `director`/`writer` (75) and `craft` (72) would need further natural ticking past the clamp
edge to reach theirs. Revision 3 uses a second `actor` for axis d instead — reachable in the SAME
week-52 birthday as axis a, and structurally identical to 790/791's own "Authored Quick Actor" no-
contract pattern.

## Summary table

| axis | route | reachable | measured |
| --- | --- | --- | --- |
| a | authored hard-boundary actor (age 70, week 0) + a 98-week PLAYER contract signed at week 0 (already in force at announcement, but not the E-determining one) | YES | announced week 52 (age 71, cause hardBoundary); E = 104; E−12 = 92; contract `endWeekExclusive` 98 ∈ (92,104); implied extension term 104+52−98 = 58 weeks; saved at week 52 (< 92) |
| b | same recipe, contract term 150 weeks instead of 98 (the contract IS the E-determining one) | YES | announced week 52; E = max(104,150) = 150; E−12 = 138; contract `endWeekExclusive` 150 = E exactly; implied extension term 150+52−150 = 52 weeks (the literal "no gap" case); saved at week 52 (< 138) |
| c | NATURAL population only — no authored rival hire, no forced `enterRival` call: a fresh generated world (`p13aGeneratedStudio`, no player action), `advanceTo(2600)` | YES, on the FIRST seed tried | subject `person-cohort-208-actor-1` — itself a C.4 cohort entrant minted at week 208, later hired by rival `studio-25969b11-r01` on a 208-week contract starting week 2496; announced hardBoundary at week 2566 (age 70); E = max(2618, 2704) = 2704 (the rival contract, still in force, determines E: ends exactly at E); E−12 = 2692; contract still in force there (started 2496, ends 2704); implied extension term 52 weeks; world saved at week 2600 (< 2692); 94 total lifecycle records existed by then, 10 of them `hardBoundary`, and this was the only one whose rival contract was still in force at its own E−12 |
| d | the SAME `-ade` world's second authored actor: age 70, week 0, NEVER given any contract | YES | announced week 52 (age 71, cause hardBoundary), same E = 104 as axis a; confirmed NO player employment row and NO rival employment row in force at E−12 = 92 (`hasAnyEmploymentAtEMinus12: false`) — structurally, C.2b discovery (806 §4) requires an employer in force at `E−12`; none exists, so no case can ever open for this person |
| e | the SAME `-ade` world's third authored person: director, age 40 (far from any retirement window), 60-week contract signed week 0 | YES | `caseOpenForTalent` true at week 52; case status `proposals_open`, `openedWeek` 48 (= 60−12, `HIRING_RENEWAL_WINDOW_WEEKS`), `decisionWeek` 60 — an ordinary, retirement-unrelated renewal-window case, exactly the shape the future V36 migration must stamp `variant: 'expiry'` onto |
| f | (weak) world `-bf`'s own week 52 (a cohort week, `isCohortWeek(52)` true) already carries one `CohortReceipt` — `careerLifecycle.cohorts.length === 1` — though this specific receipt's `requested`/`personIds` are all zero (genesis population already meets `COHORT_ACCEPTED_POPULATION` with a young member in every role); (rich) world `-c1`'s week-2600 state carries MANY receipts across 2600 weeks of natural replenishment, including non-empty ones (axis c's own subject was itself minted by one, at week 208) | YES (both ways) | `-bf` week 104 checked too: still all-zero (`requested` 0/0/0/0, `personIds: []`) — the genesis population in this seed simply never falls behind before week 150; `-c1` demonstrably has non-empty receipts (see axis c) |

## Decline baseline (790's method, applied here): every V35-engine continuation to E+1, no C.2b code anywhere

For a, b, c and d, `advanceTo(saved, effectiveWeek + 1)` under the real, unmodified V35 engine (no
`extensionIssuer`, no `retirementExtension` case variant exists anywhere in this file or in `src/`):
every one of the four subjects settles to `status: 'retired'`, `retiredWeek === effectiveWeek`, with no
active player contract and no active rival row at `effectiveWeek + 1` — none of them was seated
(`busyTalentIds`), so none passes through `finishing_commitments` first. This is the DECLINE baseline
780 X7 names: what happens with no offer and no acceptance, which a future C.2b RED must reproduce
exactly when nothing extends the person.

## Contradictions / interactions observed against 780/806 (measured, not judged)

1. **780 §6.3's phrasing implies per-axis worlds; three suffice, by design.** "One world may carry
   several axes" (780 §6.3's own closing clause) is exercised deliberately here: `-ade` carries a, d
   and e together (three unrelated authored subjects, one save), and `-c1` carries c and f together
   (the axis-c subject IS a cohort-minted person). Nothing in 780/806 is contradicted by combining
   them; no axis's proof depends on isolation from another.
2. **Axis c was reachable on the FIRST seed tried, with no forced hire.** 775's own C.2a "world 2"
   (rival-in-window) needed no forced `enterRival` either, but did not land every profession in one
   seed. Here, a single `p13aGeneratedStudio` seed ticked to week 2600 already contains a natural
   rival-incumbent hard-boundary case — the C.4 cohort mechanic (closed at 805) continuously
   replenishes the population, giving the rival restaffing loop fresh candidates across the whole
   2600-week run, which appears to make this specific natural conjunction (hard boundary reached
   while continuously rival-employed) markedly easier to find post-C.4 than it would have been under
   the C.2a-only V33 engine 775 measured.
3. **`createTalent`'s `[18,70]` authoring clamp (`actions.ts:778-779`) bounds every "author directly
   at the hard boundary" recipe to `actor` only** (hard boundary exactly 70); `director`/`writer`
   (75) and `craft` (72) hard-boundary subjects would need further natural ticking past the clamp to
   reach their own hard boundary, exactly as 775's own world 1 already worked around for its four
   professions (age 70 authored, then ticked forward). Not pursued further for axis d once a second
   `actor` was confirmed sufficient — 780 §6.3 names no required profession for axis d.
4. **`TalentMarketCase.contractId` is a genuine `state.hollywood.employment` row id for BOTH player
   and rival contracts** (`industryEmployment.ts`'s `recordPlayerEmployment` mirrors every player
   signing into the same `employment` array `enterRival` writes to, confirmed directly by reading
   both call sites before relying on it) — so "the contract row id" 780/806 ask this record to
   capture is the SAME field (`row.contractId`) regardless of employer kind, never a separate
   player-only identifier.

## Standing qualification

These are measurements at `68783a8acb53aba4989829a2f6ddf95d8d544bc3` on the three listed seeds. Byte
counts, specific ids, specific ages and specific weeks are properties of these seeds and are not laws.
No baseline was touched: no `record-check.mjs`, full-core or `test:ui` run occurred in the probe's
window, and only the single-file probe command above was ever run (never inside a suite pass).
