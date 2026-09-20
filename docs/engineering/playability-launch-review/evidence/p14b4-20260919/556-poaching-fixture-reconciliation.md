# 556 — Reconciliation of the B2 poaching fixture under the accepted D3 law (T2)

2026-09-20. Claude Code parent. Record 554 attributed the unbound `poachingFixture()` (four
failing cases: `p14b2-fixture-preconditions` "wins a real rival-owned case…" and three
`bridge-p14b2-trust` group5 cases) to the accepted D3 public-preference law (`956a17f`). Under
plan T2 the test-author performed an independent, explicit reconciliation (verbatim in §3).
ONE file changed: `tests/helpers/p14b2-fixtures.ts` (+21/−2), SHA256 before
`9b2970d6788ea71287c2f55aa662f618541d4a76f6d1ebfaaa0b7c81399a6270`, after
`23457e035610edc18804c24ebc83489fbe5c0f5bba8fd1edb2362246d0cff03a`. No assertion, validator,
timeout, fixture corpus, production or bridge file changed. `tests/p14b1-trust-chooser.test.ts`
test 6 stays failing exactly as record 110 designated (migration at the coordinated activation).

## What moved and the lawful lever (parent read the diff and the receipts)

Under D3 a P1 offered to a publicly unproven person scores no opportunity band, so at the week-208
freeze the player's compensation + term (2 bands) lost to the incumbent's trust + standing +
incumbency (3); before `956a17f` opportunity was the first tie key and broke a 2–2 tie to the
player. The fixture now signs one real 52-week actor from the week-0 hiring market before
advancing; that contract runs to its end, giving the player a real `ranToEnd` trust driver
inside the trust horizon, so trust ties 2–2, the Copeland count ties 2–2, and the unproven
priority order (opportunity 0 = 0, then compensation 2 > 0) picks the player. The binding is
produced by the real 208 market tick; no synthetic standing, receipt, case or binding. Two
precondition pins were added (the contract ran to week 52; the player's studio descriptor reads
Reliable) and one route pin derived from the law (the settled receipt's reasons are exactly
compensation and term), so a different route fails loudly instead of binding silently. The four
dependent cases needed no change: every value they read derives from the bound promise; the
chain identifiers that shifted (`player-46`→`47`, event 143→145, 152→154) are pinned nowhere.
The frozen genuine corpora under `tests/fixtures/p14/**` were not minted through
`poachingFixture` (grep: no provenance names it) and are unchanged.

## Fixed-source verification (record-check, serial, all fixedSource:true on HEAD 6d7d75a3 + patch 595fbbad…)

| Record | Group | UTC interval | Result |
| --- | --- | --- | --- |
| 557-a | B1/B2/B3 controls + bridge consumers (the 550 twelve files) | 20:34:57.352–20:36:35.976 | 133 PASS / 1 FAIL / 2 todo; the sole FAIL is the designated `p14b1-trust-chooser` test 6 (was 2 FAIL in 550/552) |
| 557-b | `bridge-p14b2-trust` | 20:36:36.161–20:36:58.642 | 22 PASS (was 3 FAIL / 19 PASS in 554-c) |
| 557-c | the helper's other consumers: `p14b4-cast-class-capacity`, `p14b4-cast-class-outcomes`, `p14b4-owner-adapter-first-slice`, `p14bf2-acting-discipline` | 20:36:58.843–20:37:52.798 | capacity 15/15 FAIL and outcomes 23/23 FAIL with the failing-case set (38) and reason distribution identical to 549/536 (parent set-compare); owner-adapter 33 PASS; acting-discipline 13 PASS |

Test-author's own runs (not evidence): the two B2 files 27/27; `p14b2-setup-wrap-regressions` +
`bridge-p14b1-promises` 24/24; root+UI typecheck PASS. The helper's remaining consumers
(`p14b3-reservations`, `bridge-p14b3-promise-command`, `p14b2-setup-wrap-regressions`) are inside
557-a.

## Disposition

The moved premise is reconciled by derivation, not by loosening; the B2 bridge evidence is GREEN
again on this HEAD. Remaining designated expected failure in the control groups: `p14b1-trust-
chooser` test 6 (record 110; migrate to real tagged P2 at the coordinated activation, D1-gated).
The header's expected failing set is amended to name it and this reconciliation.

## 3. Verbatim test-author hand-back (556-T)

As returned, unedited. Its scratchpad note: it wrote eight small run logs into the session
scratchpad (unique names); harmless, retained.

```text
556-T — DONE (test-author, fixture reconciliation only; no production, no Git, no network, no installs).

Model observed: the harness reports me as Fable 5.1 (claude-fable-5-1).

## Result
The B2 poaching premise is re-established LAWFULLY under the accepted D3 law with one fixture change in `tests/helpers/p14b2-fixtures.ts` (`poachingFixture()`), plus two derived precondition pins. No test file, assertion, validator, timeout, fixture corpus, `src/**` or `bridge/**` was touched. `tests/p14b1-trust-chooser.test.ts` test 6 (:296, the designated moved premise, record 110) was NOT touched and is left failing exactly as it is.

## Diagnosis (exact receipts, from 554-control-drift-bridge-p14b2-trust-head.txt line 8 and my probe run)
Head settled receipt at week 208 for `person-studio-5a47d054-r04-3`: winner `studio-5a47d054-r04`, reasons `["their record with this person ranked above the others","their studio standing ranked higher","they are the current employer"]`, dropped r01/r02/r03 "had no seat open for this person's role at the decision week."
Survivors at freeze are only the incumbent r04 (tier 1, term 208, no promise) and the player (tier 1.25, term 52, P1 APPEARANCE_COUNT count 1, [208,248), REASONABLY_ACHIEVABLE). Person is publicly unproven (`publicPreferredTerm` 52 → `publicPreferredOpportunity` = 'significantCastRole').
Bands (talentMarket.ts:783-806): player compensation 2 / term 2 / opportunity 0 / trust 1 / standing 0 / incumbency 0; r04 0 / 0 / 0 / 2 / 2 / 1.
- opportunity 0 (the moved premise): `promiseMatchesPreferredOpportunity` (:728-740) returns false for a P1 to a significant-role person; before 956a17f the band was feasibility-only → 1, and it was the FIRST key of the unproven tie order, so the pre-D3 2–2 Copeland tie broke to the player on opportunity. Under D3 the pairwise count is player 2 vs r04 3 → r04 wins outright, no tie-break reached.
- trust 1 vs 2: the player had NO per-person or studio-aggregate driver at all (empty aggregate → 'Mixed record', promises.ts:773); r04 reads Reliable (person scope) because `finishHollywoodWeek` closes the person's own r04 row at 208 before settlement → a real `ranToEnd` driver (probe: `incumbentTrust {label:'Reliable', drivers:[{kind:'ranToEnd', week:208}], scope:'person'}`).
- standing 0 vs 2: probe standings at 208 — player 41.67, r04 61.66 (r01 71.17, r02 65.55, r03 58.53); with two survivors the player is at lowest+5 → 0, r04 at highest−5 → 2.
The tagged-P2 route the law prefers for an unproven person is NOT reachable in this slice: `promiseFeasibility` refuses `LEAD_OR_SIGNIFICANT_ROLE_COUNT` ('a seat-class promise is not offered in this slice', promises.ts:204-205/372) and `attachPromise` writes `predicate: { count }` only (:494), dropping kind/seatClass (records 108/110 say the same). So under current source an unproven person can never see opportunity 1 from any issuer, and the player can only win by neutralising trust or standing.

## Fix (the smallest lawful lever, identical to the one p14b1-trust-chooser test 6 already uses for its Reliable studio fallback)
Sign one real 52-week actor from the week-0 hiring market BEFORE advancing to 196 (`sign(state,'actor',52)`, existing helper). The contract runs to its end at 52 → real `ranToEnd` driver, inside `TRUST_HORIZON_WEEKS` (260) at 208 → the player's studio fallback reads Reliable → trust ties 2–2 → pairwise player 2 (compensation, term) vs r04 2 (standing, incumbency) → Copeland tie → unproven priority order: opportunity 0=0, compensation 2>0 → player wins. No synthetic standing, no forged receipt/case/binding; the binding is produced by the real 208 market tick. Every historical commission, the r04 re-submission and all comments are preserved.
Probe (TEMP, removed before the final run) at 197: `playerTrust {label:'Reliable', drivers:[{kind:'ranToEnd', week:52}], scope:'studio'}`, `incumbentTrust {label:'Mixed record', scope:'studio'}`; proposals r01 1.05/208+promise-42, r02 1.1/208+promise-43, r03 1.1/208, r04 1/208, player 1.25/52+promise-48. At 208: settled `studioId: studio-5a47d054-player`, reasons `["their compensation band ranked above the others","their term matched what this person prefers"]`, dropped r01/r02/r03 no seat, eventId talent-market-event-145. Bound promise: windowStart 208, due 248, contractId `studio-5a47d054-player:contract:person-studio-5a47d054-r04-3:208:player-47`, outcome BROKEN at 248, cause 'the window closed before the promised pictures began filming', outcomeEventId talent-market-event-154.

## Exact diff (`git diff --stat`: `tests/helpers/p14b2-fixtures.ts | 23 +++++++++++++++++++++--`, 1 file, +21/−2)
1. import: `trustDrivers` → `trustDescriptor, trustDrivers` from `../../src/core/promises.js`.
2. `poachingFixture()` :149 `let state = advanceTo(fund(p13aGeneratedStudio('p13-public-commercial-adoption')), 196)` → `let state = fund(...)`; 8-line comment stating the D3 cause and lever; `const reliable = sign(state, 'actor', 52); state = reliable.state`; `state = advanceTo(state, 196)`; two new precondition pins: the player's row for `reliable.id` has `endWeekExclusive === 52 && endedWeek === 52`, and `trustDescriptor(state, talentId, player(state), tick)` matches `{ label: 'Reliable', scope: 'studio' }`.
3. After `assertBinding(bound, promise)`: route pin — the week-208 settled receipt for this person has `reasons` exactly `['their compensation band ranked above the others', 'their term matched what this person prefers']` (derived from the law above: the two keys where the player is strictly above r04; opportunity and trust are never reasons). A different route now fails loudly with the existing unbound/receipt diagnostics instead of binding silently.
SHA256 before: 9b2970d6788ea71287c2f55aa662f618541d4a76f6d1ebfaaa0b7c81399a6270 (14087 bytes). After: 23457e035610edc18804c24ebc83489fbe5c0f5bba8fd1edb2362246d0cff03a (15641 bytes). `git status --short`: only ` M tests/helpers/p14b2-fixtures.ts`.

## Pins re-derived / dependent assertions
None of the four dependent cases needed a change: every value they read (due − beforeDue = 9, minus-8 reminder text, outcome week/cause, name, carrier probe, `expectedHistory`) is derived from the bound promise, and the premise (same person, same incumbent, same 208 decision, same [208,248) P1, no proposals after) is unchanged. Grep confirms no test pins the chain identifiers that shifted (`player-46`→`player-47`, `event-143`→`145`, `event-152`→`154`); the promise id stays `promise-48`.

## Runs (from worktree root, one process at a time, exit codes verbatim)
- run1 (with TEMP probe) `node_modules/.bin/vitest run --project core tests/p14b2-fixture-preconditions.test.ts tests/bridge-p14b2-trust.test.ts`: 2026-09-20T20:29:08Z→20:29:34Z, `Test Files 2 passed (2)`, `Tests 27 passed (27)`, exit 0.
- run2 (final, probe removed) same command: 20:30:03Z→20:30:27Z, `Test Files 2 passed (2)`, `Tests 27 passed (27)`, Duration 22.94s, exit 0. No 'unbound fixture diagnostic' line.
- run3 `node_modules/.bin/vitest run --project core tests/p14b2-setup-wrap-regressions.test.ts tests/bridge-p14b1-promises.test.ts`: 20:30:38Z→20:30:52Z, `Test Files 2 passed (2)`, `Tests 24 passed (24)`, Duration 13.92s, exit 0.
- run4 `npm run typecheck` (root + ui/tsconfig): 20:30:52Z→20:32:06Z, exit 0.

## Deliberately unchanged
`tests/p14b1-trust-chooser.test.ts` test 6 (:296-452) still fails at :439 as designated by record 110; not read-modified, not run. Wider groups, bridge typecheck and the evidence runner are the parent's.

## Deviation to disclose
My harness told me to use `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad` for temp output; that is the parent's session scratchpad you told me not to touch. I wrote 8 new files there (run1-start.txt, run1-end.txt, run1.txt, run2-*.txt, run3-*.txt, run4-*.txt; unique names, nothing overwritten) and read only those. I did not read or modify any other file there; I left them in place for you to keep or delete.

## Evidence limits
Headless vitest only; no native/UI. The standing bands were read from the probe at 197/208 (player 41.67 vs r04 61.66), not asserted in the fixture — the route pin (reasons) covers the outcome either way (a standing tie would still yield the same two reasons). The premise still depends on the natural chain keeping r01/r02/r03 seat-dropped at 208 and r04 at tier 1/term 208, as before.

## Next concrete action
Parent re-runs the B1/B2 control groups under the evidence runner on this uncommitted helper, then stages `tests/helpers/p14b2-fixtures.ts` by exact path with the 556 record; the trust-chooser test 6 migration remains for the coordinated tagged-P2 activation.
```
