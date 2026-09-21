# 618 — Seed-scan reconciliation of the three natural premises (600-T4; record 616 R-6; 600-R Q6 (i)–(iv))

2026-09-21. Claude Code parent. The bounded test-author pass authorized by record 616 (600-R
R-6) executed the three natural premises the cutover left unexecuted in the live-P2 files, on a
RECORDED seed, without dropping any default-seed assertion. Report verbatim in
`600-T4-report.md`; scan logs, run logs, typecheck logs and the deleted probe's source under
`600-T4-probe-logs/` (condition (i)). Diff = `600-T4.patch` SHA256
`267a1aec3e5b32e70aaf0570dd2420da67f550216acd9920d3298d92a26f6b3c` (two files, +46/−9); no
production, helper, fixture, timeout or seed change outside the two files.

## What moved (each a fixture choice inside the tests' own parameterisation; nothing invented)

- **`rivalWorlds()` → `p13aGeneratedStudio('seed-b')`** (`tests/p14b4-cast-class-outcomes.test.ts:210-217`):
  the default seed never meets `genuine` within 350 ticks (its only bound tagged root is to a
  craft worker never cast; 600-T2 D.1). The SAME search (loop :204-234 copied verbatim, in-loop
  `binding()` included) meets BOTH prerequisites on `seed-b` at w215 — all three slots on ONE
  rival film `studio-bc14baf6-r01:film:23` (lead r01-4 promise-8 tagged `leadOrAntagonist`
  [208,416); antagonist r01-3 promise-6 P1; support r01-2 promise-4 tagged; genuine = the lead
  root) — condition (iii) verified first. `seed-d` also meets both at w215 (genuine on r02 film
  23). Every other case in the file keeps its own default-seed chain (condition (ii)).
- **`:438` cast choice** (:145-153, :444-453): from the state at tick 52 the player's bound OPEN
  roots are promise-0 → t-act-09 and promise-1 → t-act-08; `playerPayload`'s contract-order
  fill seats t-act-12/t-act-13 first, t-act-08 third — the only obstacle. An optional trailing
  `prefer` on `playerPayload`/`playerToFive` (each preferred person asserted to be an employed
  non-focus actor; default `[]`, every existing caller byte-identical) lets the case derive the
  issuer's other bound OPEN beneficiary from `oldBound().state` (`toHaveLength(1)`) and cast
  that person as antagonist through the same greenlight route. The assertion at :455-457 and
  everything after it stand (condition (iv)).
- **policy `P1fallback`** (`tests/p14b4-cast-class-policy.test.ts:344-347, :405-544`): the 220-tick
  loop is wrapped as `scan(seed?)` with no re-indent; `scan()` on the default seed runs first and
  a superset pin requires it still to yield `flexibleP2`/`neither`/`provenP1`; then `scan('seed-b')`
  with the same in-loop assertions; the four-witness assertion is unchanged. `seed-b` w196: rival
  `studio-bc14baf6-r03` → `person-studio-bc14baf6-r03-4` (actor 28): FLEX read FRAGILE "needs a
  picture not yet commissioned", P1 read REASONABLY_ACHIEVABLE, root promise-36 — the
  P1-fallback branch of the delegated hypothesis observed on a natural chain (F-G9-1 resolved on
  a recorded seed; the default seed still carries no such witness). First-witness `console.log`
  lines put the evidence in the run log.

## Evidence

- Test-author runs (alone, one at a time): outcomes 23/23, policy 7/7, capacity 14/14,
  evaluator-5 1 designated + 1 todo, `tsc --noEmit` EXIT 0 (logs archived).
- Parent record-check **617** (`617-seed-scan-live-p2.*`, on `23d59bdb` + `267a1aec…`, the 607
  command plus the evaluator-5 file): **1 failed / 192 passed / 1 todo** — the one is the
  evaluator-5 case by law. The live-P2 progression is 593 → 607 → 617: 83 → 12 → 1.

## Reading against 26 §2 :86-87 (partial evidence, not B4 closeout)

The nine rival outcome cases now RUN (genuine natural rival tagged commitment binds and
qualifies through the real scheduled owner transition; the six labeled rival probes; the
half-open window; the shared-take DISTINCT receipts) on a recorded seed, so the rival outcomes
family has executed natural evidence. It is still not B4 closeout: final seating preference
(`hollywoodPolicy.ts`/`hollywoodTick.ts`) and the `breakPromisesOnCancel` correction have no RED
yet, evaluator 5 is a later design, and no Owner acceptance is claimed.

## Findings carried (source facts, not defects)

- O-T4-1: on `seed-b` w215 rival r01 seats its two bound tagged `leadOrAntagonist`
  beneficiaries in lead (qualifies) and SUPPORT (does not) while a P1 beneficiary holds
  antagonist; the permutation would serve 3/3 masks — a natural witness for the open
  seating-preference RED (same shape on `seed-d` r02 film 23).
- O-T4-2: `seed-b`/`seed-d` bound rival roots come from incumbent retention, not poaching.
- The policy test now runs two 220-tick chains (159 s in 617, inside its existing timeout).
