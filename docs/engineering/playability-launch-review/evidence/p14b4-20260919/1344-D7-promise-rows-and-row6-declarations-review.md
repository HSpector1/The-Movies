# 1344-D7: review of the r2d promise-row and r3 row-6 declarations

Contract-auditor, read-only, nothing run, merge tree unopened. Sources: the repository at c9405c3e (`src` db80ca31, the
merge tree's), ff803032 via `git show`, the fixture bytes (gzcat). Staged files equal the scratch copies
the runbooks append.

| Unit | Verdict |
|---|---|
| A, rows 8-11 (promise-148) | **ACCEPT WITH CHANGES**: change A1 adds one recorded field; every gate runs as written |
| B, row 6 re-witness | **ACCEPT**: the probe may run as written |

## A. Rows 8-11

**1. Attribution: sound.**
- `git diff --stat ff803032 HEAD -- src` lists 18 core files. The P15 modules import only each other; `tuning.ts` removes
  no line.
- With nothing shelved, `shelvedScriptIds` is empty (`hollywoodTypes.ts:142-145`); `decide()` adds only
  `screenplayShelving` writes (`hollywoodTick.ts:265`, `:272-274`) and branches that need a shelving (`:276-299`, `:302`).
- `convertV42ToV43` starts every count at zero (`save.ts:10678-10685`) and all nine businesses decide from 2600 (fixture
  bytes), so no shelving precedes 2612 (`tuning.ts:33`).
- Corrections 1-3 hold (`1344-I-vs1338.json:5101-5125`: R1-R3 at `:25:42`; `:5821`: N10 at `:22:17`).
- Cosmetic slip, row 11 f: the `:148` call needs any open bound promise to PERSON, from any issuer (`promises.ts:1028`,
  `:954`).

**2. Predicates: concrete and sufficient.**
- C1 head is x2's SATISFIED/1 (`1344-X8-core-extract.txt:863-943`); C1 old is 1338's passing `:25`, `:37`, `:40-41`,
  `:141-152`.
- P3 hashes 96 states per top-level key through `stableStringify`, shelving stripped, and requires the first difference
  at exactly Ws + 1. Any earlier movement from another cause fails it.
- P4 admits only a post-hold commission or a due retry. The old chain has neither, and P5 shows it stalled through 2695.
  A wrong attribution breaks P3, P4 or P5.

**3. Probe: no false pass found.**
- `stableStringify` and `assignmentRefusal` exist at ff803032 (`save.ts:673`, `careerLifecycle.ts:113`). No
  `Math.random`. `s10Out` confines writes to `r2d/out` (block `:22-29`). Copies are deleted and status checked.
- REPIN cannot appear once C1 head holds. SATISFIED is terminal (`promises.ts:820-825`, `:1016-1017`, `:1028`), so R1
  fails `:37`, R2 the helper's `:114`, R3 `:65` and N10 `:148`.

**4. Premise conflict or re-witness.**
- Premise conflict is the right reading. F5 Part A governs row 6; extending it is the parent's call.
- The bytes hold one candidate. The only open bound rival promises at 2600 are promise-146 to 150, all r01's; every
  other open promise has a null `contractId` and is never evaluated. PERSON holds the only announced retirement; every
  other record retired by 2581.
- promise-146 and 147 go to a writer and a director aged 73, hard edge 75 (`tuning.ts:431-432`). They announce at 2653
  or later, so effective is at least 2705 (`careerLifecycle.ts:222`) and admission closes at 2697 or later (`:117`), past
  the leaves' 2696. The actors of 149 and 150 (62, 65) are employed and below 70, so neither trigger applies.
- A promise authored and bound on the chain could add a candidate. The probe lists only r01's (block `:266-268`).
- A search is feasible on this run's chain. **Rule:** the first promise, by cutoff week then id, that a rival business of
  this fixture issued (r01 first), bound and open with progress 0 at post-tick Wc − 1, where Wc = effectiveWeek − 8 ≤
  2696, and VOIDED by the tick into Wc (`promises.ts:1049-1057`, the only VOIDED writer). Its issuer holds no production
  at Wc − 1 (`:27`), and that week's pass calls `assignmentRefusal(beneficiary, Wc − 1, 'actor')` (`:148`, `:152`).
  Predicted: NONE.
- A witness would change PERSON, PROMISE, the contract, 2566 and R1's terminal list, so it needs its own declaration.

**Change A1** (recorded, never gating). The head run writes `outcome.rewitness`: every rival-issued bound promise
VOIDED in 2601-2696, across `final` and the 2696 state that `s10RivalLines` already ticks, ordered by the rule, each with
its issuer's productions at Wc − 1. Step 4 reports NONE or the first entry, giving the parent F5 A3's evidence from
one run.

## B. Row 6

**5. NONE: correctly derived.** Lines are the repository's (a318722's); 6935ea5 adds 25 (r2a patch).
- Guard: iterations 0-40 tick to post 197-237; iteration 41 throws (`:357-358`).
- Alone in its week: `:372` compares the week's takes with `[repeatTake]`, and post 229 holds r01's `film:12` and r02's
  `film:14` (`row6.json:1090-1124`).
- Shared pair (`:641-642`): `film:12` shares r02-1|r02-3, r02-1|r02-2 and r02-3|r02-2 with `film:11`; `film:14`
  (r01-1 to r01-4) shares none.
- Fallback: `:375` forbids a take in every week before the repeat except 213 and 217, so only T1's week can hold any
  studio's witness. r02's take there fails both tests, and nothing lands in 230-237.
- r2 correction: right. A repeat at 214-216 ends the loop before 217, `atRelease` stays unset, and the six-key check
  throws (`:378-380`). The r2 rule admitted those weeks (r2 row 6 block `:85`); R5 makes that moot.
- P2 ends the rule at a take in 217, which the leaf ignores: stricter than F5 A1, and P_SIM then fails loudly.
  Acceptable.

**Predicates and probe.**
- A0 anchors the run to the r2 record, takes and films. X10 settled the attribution, so B needs no old anchor or state
  equality.
- G4 holds by construction: `appendFirstTakes` stamps the produced week (`tick.ts:1138-1142`), which the r2 record
  stored as `post`.
- P_SIM replays `:357-380` and `:641-642` over every rival take. A lawful take the rule missed turns it false, so NONE
  cannot pass falsely.
- No RNG, public exports only, writes confined to `row6/out` (block `:9-15`), copy removed, status checked.
