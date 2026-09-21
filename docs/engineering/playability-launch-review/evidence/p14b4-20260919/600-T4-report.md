# 600-T4 (test-author) — seed-scan reconciliation of the three natural premises (record 616 R-6; 600-R Q6 (i)–(iv))

Status: DONE. HEAD 23d59bdba9c963f68c93727d3d0575e303b4212d (clean at start; Git read-only, no commit/stash/checkout/add).
Patch: `600-T4.patch` = `git diff HEAD -- tests/`, sha256 `267a1aec3e5b32e70aaf0570dd2420da67f550216acd9920d3298d92a26f6b3c`, 127 lines,
2 files: `tests/p14b4-cast-class-outcomes.test.ts` +25/−6, `tests/p14b4-cast-class-policy.test.ts` +21/−3. Nothing under src/, bridge/, ui/,
tests/helpers/, tests/fixtures/, generated/; no timeout, no other test. The temporary probe `tests/zz-600-t4-probe.test.ts` was deleted before
the patch was taken (its source is archived as `600-T4-probe.test.ts.txt`). All logs under
`/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/6ed44184-f9ac-40ba-bf1b-321fc7506549/scratchpad/`.

## A. rivalWorlds seed scan (the :204-234 loop copied verbatim, incl. the in-loop `binding()` assertions) — log `600-T4-scan-A-rival-seed-b-seed-d.log`

| Seed | SLOTS met | GENUINE met | Both | Slot identities (issuer film at remainingTicks 5, no first take) |
|---|---|---|---|---|
| seed-b | w215 (all three at w215, ONE film `studio-bc14baf6-r01:film:23`) | w215 | **w215 (steps 215)** | lead `person-…-r01-4` (actor 28.00) promise-8 LEAD_OR_SIGNIFICANT_ROLE_COUNT `{castRoleCount,1,leadOrAntagonist}` [208,416); antagonist `r01-3` (actor 48.35) promise-6 APPEARANCE_COUNT `{count:1}` [208,416); support `r01-2` (actor 28.00) promise-4 tagged leadOrAntagonist [208,416). genuine = the lead root promise-8 (film 23, slot lead). r02 film 23 also carries three P1 roots at w215 (promise-19/21/17, found later in the same tick). |
| seed-d | w215 (ONE film `studio-17a8b650-r01:film:23`: lead r01-4 promise-8 P1, antagonist r01-3 promise-6 P1, support r01-2 promise-4 P1) | w215 (`studio-17a8b650-r02:film:23` antagonist `r02-2` (actor 28.00) promise-17 tagged leadOrAntagonist) | w215 | — |

Choice: **seed-b** (first candidate; both prerequisites by the same search; the SLOTS prerequisite holds in the strong "one rival film" form,
condition (iii)). Scan bound: 2 of ≤ 8 seeds; no further seed needed. `rivalWorlds()` now calls `p13aGeneratedStudio('seed-b')` with a comment
naming record 616 / 600-T4 and the log. `playerAtFive`, `realPlayerPromise` and every other case keep their own default-seed calls (unchanged).
The default seed's own result is unchanged from 600-T2 D.1 (slots at 212 on P1 roots; genuine never, the only bound tagged root is a craft worker).

## B. `:438` — a cast choice through the existing route — log `600-T4-scan-B-second-beneficiary.log`

Read from the state (fixture `genuine-v29-bound-open-p1` through `validateSaveV29` + `makeSave`, tick 52, issuer `studio-aca408ec-player`):
bound OPEN player roots promise-0 → `t-act-09` (actor 25.17) and promise-1 → `t-act-08` (actor 38.16), both APPEARANCE_COUNT count 1, window
[52,92); active contracts in order `t-wri-03 t-dir-01 t-act-12 t-act-13 t-cra-01 t-act-09[52,104) t-act-08[52,104)`; no active production.
`playerPayload(…,'lead')` (:144-152) fills antagonist/support from that order after excluding only the focus beneficiary → antagonist t-act-12,
support t-act-13, t-act-08 third and never seated. The existing greenlight route accepts t-act-08 as antagonist (probe: `prod-0052`
cast lead t-act-09 / antagonist t-act-08 / support t-act-12). **Which obstacle: playerPayload's contract-order fill is the only obstacle.**

Change: `playerPayload`/`playerToFive` take an optional `prefer: readonly string[]` — the player's cast choice for the complementary seats, in
order, ahead of the contract-order fill; each preferred id must already be an employed non-focus actor on that state (asserted; nothing invented).
The `:438` case reads the issuer's other bound OPEN beneficiaries from `oldBound().state` (`expect(others).toHaveLength(1)` — the frozen fixture's
second focus root), builds through `playerToFive(old.state, old.promiseId, 'lead', others)` and keeps every assertion from :436 on (the `assert.ok(other…)`
prerequisite, the variant, `complete`, DISTINCT own receipts exactly once, idempotent owner passes, the later tick, `live`). It is a choice, not
an invention: no binding, contract, receipt, root or week is created; the person, their contract and their bound root are the fixture's own
bytes (record 17: the fixture is untouched). Default-seed cache `playerAtFive` and all other player cases keep the contract-order cast.

## C. policy `:529` P1fallback — second recorded scan — logs `600-T4-scan-C-policy-seed-b-seed-c.log` (first pass, receipts without bottleneck) and `600-T4-scan-C-policy-seed-b-seed-c-bottleneck.log` (same scan, bottleneck printed)

The :402-495 loop was copied verbatim with all in-loop assertions (read/attach/market spies, state-equality, draft tuple, case/terminal/freeze joins).

| Seed | seen (break at 4) | P1fallback witness | FLEX read | P1 read |
|---|---|---|---|---|
| default (test's own scan, run log) | flexibleP2, neither, provenP1 (220 ticks, no P1fallback) | none (F-G9-1) | — | — |
| seed-b | all four at w196 | w196 `studio-bc14baf6-r03` → `person-studio-bc14baf6-r03-4` (actor, 28.00), root promise-36 | LEAD_OR_SIGNIFICANT_ROLE_COUNT `{castRoleCount,1,leadOrAntagonist}` → FRAGILE "needs a picture not yet commissioned", rules 4, w196 | APPEARANCE_COUNT `{count:1}` → REASONABLY_ACHIEVABLE (bottleneck null), rules 4, w196 |
| seed-c | all four at w196 | w196 `studio-a72efa70-r03` → `person-studio-a72efa70-r03-3` (actor, 28.00), root promise-33 | FRAGILE "needs a picture not yet commissioned" | REASONABLY_ACHIEVABLE |

Other seed-b witnesses (w196): provenP1 r01 → r01-0 (writer 51.56) promise-0; flexibleP2 r01 → r01-2 (actor 28.00) promise-4; neither r03 → r01-2
(FLEX FRAGILE, P1 FRAGILE "needs a picture not yet commissioned"). Scan bound: 2 of ≤ 8 seeds (the zero-count seeds a/e–j are 600-T2's archived
12-seed log, not re-run). Choice: **seed-b** (first candidate; same seed as A, one recorded seed for the pass).

Change: the loop body became `scan(seed?)` (same body, same in-loop assertions, `seen` accumulating; the wrap does not re-indent);
`scan()` runs the default seed first, then `expect([...seen].sort()).toEqual(expect.arrayContaining(['flexibleP2','neither','provenP1']))` pins
that the default seed still carries every witness it carried before; then `scan('seed-b')`; the final `:529` four-witness assertion is unchanged.
Two `console.log` lines print each kind's first witness (seed, week, issuer → person, per-read classification+bottleneck, root) so the recorded
run itself carries the evidence (run log lines 7-10). No week, person or receipt is pinned in an assertion (no magic week).

## Assertions kept vs re-pointed

- outcomes `rivalWorlds` ×9: every assertion kept; ONLY the chain seed moved (`p13aGeneratedStudio()` → `p13aGeneratedStudio('seed-b')`). The
  search, the 350-tick bound, the in-loop `binding()`, the genuine predicate and the throw are byte-identical.
- outcomes `:433-460`: `variant(playerAtFive('lead'), p2('lead'))` → `variant(playerToFive(old.state, old.promiseId, 'lead', others), p2('lead'))`
  plus the `others` derivation and `toHaveLength(1)`; :436-438 and every later assertion unchanged.
- outcomes `playerPayload`/`playerToFive`: new optional trailing parameter, default `[]` → byte-identical behaviour for every existing caller.
- policy `:529`: kept; ADDED the default-seed superset pin; the default scan and its in-loop assertions unchanged; a second scan on seed-b added.
- Dropped: nothing. Timeouts: none touched (the file has none; sync tests run to completion).

## D. Runs (one process at a time; `node_modules/.bin/vitest run --project core <file>`; HEAD 23d59bdb + this diff)

| File | Result | Log |
|---|---|---|
| tests/p14b4-cast-class-outcomes.test.ts | **23 passed / 23**, EXIT 0, 12.3 s (RIVAL genuine 2976 ms; :438 two-beneficiary 385 ms) | `600-T4-run-p14b4-cast-class-outcomes.log` |
| tests/p14b4-cast-class-policy.test.ts | **7 passed / 7**, EXIT 0, 65.6 s (natural-policy case 56.3 s: default 220 ticks + seed-b to w196) | `600-T4-run-p14b4-cast-class-policy.log` |
| tests/p14b4-cast-class-capacity.test.ts | 14 passed / 14, EXIT 0 | `600-T4-run-p14b4-cast-class-capacity.log` |
| tests/p14b4-cast-class-capacity-evaluator5.test.ts | 1 failed (designated :239 FRAGILE vs IMPOSSIBLE, by law) + 1 todo, EXIT 1 — unchanged | `600-T4-run-p14b4-cast-class-capacity-evaluator5.log` |
| `tsc --noEmit` (root, includes tests) | EXIT 0 with the probe present; EXIT 0 again on the clean tree | `600-T4-typecheck.log`, `600-T4-typecheck-final.log` |

Live-P2 arithmetic vs 607/610: outcomes 10 failed → 0; policy 1 failed → 0; the 11 natural-premise failures of record 616 are gone; the two
designated failures (stale route :234, evaluator-5 :239) and the inherited/load-only sets are untouched by this diff.

## Fixture findings / observations (source facts from the scans; not defects)

- O-T4-1 (for the open "final seating preference" RED, 616 Next 2): on seed-b at w215 the rival r01 seats its own two bound TAGGED
  leadOrAntagonist beneficiaries as lead (r01-4, promise-8, qualifies) and SUPPORT (r01-2, promise-4, does not qualify) while the antagonist seat
  holds a count-only P1 beneficiary (r01-3, promise-6, any seat qualifies); the permutation lead r01-4 / antagonist r01-2 / support r01-3 would
  serve 3 of 3 masks instead of 2 of 3. seed-d shows the same shape on r02 film 23 (antagonist r02-2 tagged qualifies, support r02-4 tagged does
  not, lead r02-3 P1). Natural witnesses for the plan :208-222 seating rule, which is not yet law in `hollywoodPolicy.ts`/`hollywoodTick.ts`.
- O-T4-2: on seed-b/seed-d the w215 bound roots are the incumbents' own renewals (r01 → r01-x), unlike the default seed where r02 poached r01's
  people; the rivalWorlds prerequisite is therefore reachable through retention as well as poaching.
- F-G9-1 stands as recorded: the default seed carries no P1fallback within 220 ticks; seed-b and seed-c carry one at w196 through the incumbent r03
  (no unproduced script, unproven actor in SUPPORT pre-first-take) exactly as 600-T2 D.3 derived.

## Evidence limits

- Headless vitest/tsc only; no native, no UI, no full core suite (parent's record-check). The four file runs were made while the untracked probe
  file was present in tests/ (file-scoped commands collected only the named file); the final typecheck is on the clean tree.
- Seeds scanned by me: A seed-b, seed-d; C seed-b, seed-c (both bounded ≤ 8, stopped at the first satisfying seed). The remaining seeds' counts
  are 600-T2's archived log, not re-verified here.
- The nine rival cases now run GREEN on a recorded seed (seed-b) — the R-6 condition for closing the rival outcomes family is met on this
  evidence, but closure is the parent's determination (26 §2 :86-87). Every rival case's states are the search's own clones at w215.
- Witness identities live in comments and stdout, not in assertions; a later law that moves rival cash/authoring may move the seed-b witnesses,
  in which case the search reports "prerequisites absent" honestly rather than a stale pin.
