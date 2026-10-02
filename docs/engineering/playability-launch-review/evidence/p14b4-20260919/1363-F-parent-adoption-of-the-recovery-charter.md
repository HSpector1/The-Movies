# 1363-F: parent adoption of 1363-A, the rival-recovery amendment charter

[1363-B](1363-B-charter-review.md) reviewed the draft charter [1363-A](1363-A-rival-recovery-amendment-charter.md)
read-only (2026-10-02, 15:04 CDT; `src` tree 762d8e09 throughout).
- **Verdict:** ADOPT WITH AMENDMENTS (1 to 12).
- **Fidelity:** every sentence of the Owner's 1357-Q1 text maps to a clause. The charter invents no subsidy,
  replacement studio, minimum count or survival guarantee, and it reports "closure due" apart from closure.
- **Citations:** of about 150 checked, two were stale (DECISIONS.md, below).

The parent adopts 1363-A as amended here. The RED author and the production writer read 1363-A with these rulings,
and a ruling here wins where the two differ.

## Rulings on the amendments

1. **Cost-cutting is terminal in v1, and the charter says so** (amendment 1).
   - **The fact.** Part B starts only when the rival cannot fund new development and has no production or run
     (§4.1). Before P15B's loans no inflow exists, so its cash only falls. While it cuts, `staff()` fills no slot,
     and R3 can release a director, an actor or craft. A greenlight, the only exit (§4.5), then cannot fire.
   - **(a) Disclose.** §4.5 states that a cutting rival in v1 never films again. It pays the 41,500-46,500 weekly
     floor (1357-R :205-210) until P15B's law closes it.
   - **(b) Control (e) becomes a stop condition.** A false-positive entry on any measured route stops the work and
     returns to the parent, because the no-wait trigger rests on "cannot restart".
   - **(c) The post-loan restart goes to the Owner as O6,** answered before re-probe 2. It does not block 1363.
     The parent's recommendation is in the Owner section.
2. **Adoption receipts** (amendment 2). §5's era rule tests `technology.adoptions` for a `committedWeek` later than
   `since`, never the receipt's operational week. "After `since`" means a later week everywhere, since `staff()`
   runs before `decide()` in the entry week.
3. **The extension-case proposal path** (amendment 3). A cutting business is skipped at the top of the market pass
   (`talentMarket.ts:1389-1390`) for every case, and B2 adds a retirement-extension case.
4. **The live profession proof** (amendment 4). Commit (b) strips `costCutting` in `validatedLiveProfessionContext`
   (`save.ts:10497-10502`), as that proof drops Save44's fields. The fallout run shows the proof passing on a state
   with a set `since`. Without the strip, `tick()` swallows the refusal (1361-F3 ruling 3).
5. **Two landed leaves move** (amendment 5).
   - `tests/p14d1-rival-shelving.test.ts:483` ("a mixed sequence") enters cost-cutting on its reserve + 1 setup and
     fails at :545 in the first week.
     - The RED keeps that leaf's subject, counting under staffing blocks, by a block that is not cash.
     - A new leaf pins Part B's entry on the original cash setup.
     - The input edit is declared as such in the RED's classification.
   - `tests/p14a1-decline-reasons.test.ts` case B (:284-324) is named for the dry run, since its drained rival may
     enter cost-cutting before the week-208 settlement.
6. **Dormant survivors are counted** (amendment 6). At each re-probe 1 checkpoint, 1363-V counts entered rivals that
   are not closure-due and have not greenlit since entering cost-cutting. A Proceed or Flag that depends on them goes
   to the Owner as such before P15B's RED starts (1362-O :44-45).
7. **G-P runs with G-L** (amendment 7).
   - G-L's K3 needs the live manifest byte-identical to G-P's (1359-A :265-266), so step 10 runs G-P and G-L on
     the same 1363 tree.
   - P15C's closure G-L on the Save45 tree is a precondition of step 10, as the comparison base.
   - On a tree without `sharedMarket` (a G2 Retune), G-P's tree guard reads the roots that tree carries.
     `run-1361-gp.sh` takes the expected roots line as its second argument for that case.
8. **The step number is not fixed** (amendment 8).
   - §5 and §8.1 read "the next free step after Save45 when commit (b) lands" in place of Save46.
   - The claimants are P15A.1's Retune fallback (only on a G2 Retune), 1364-A (the late-founding correction the
     Owner authorized after this draft; [1362-O](1362-O-owner-response-20261002.md) third section) and 1363. The
     parent orders them when each is ready, with one production writer.
   - 1361-F3 ruling 2's P15B obligation covers every frozen layer between Save45 and P15B's own step.
   - The authority list adds the Owner's third response.
9. **Promise paths are attributed on equal-basis trees** (amendment 9).
   - The 154 promise movements are traced on 469a9547 against ff803032.
   - "Under the amended law" means Part A applied to 469a9547 in scratch (the same `hollywoodTick.ts` blob) against
     ff803032.
   - 1363's own moves are measured as candidate against control.
   - Candidate against ff803032 is reported as totals only, labelled confounded.
10. **`unaffordableViable` is opt-in** (amendment 10). Only the re-search at `hollywoodTick.ts:236` asks for the
    count. The chooser path at :233 stays byte- and cost-identical. 1363-V reports tick time against the 1356
    harness ceiling (1361-F ruling 15).
11. **The captures are named before Part A lands** (amendment 11).
    - If v2 shelves r04's `script-0005` before week 93, `shelving-viable-control` needs a genuine pre-shelving capture
      before the new first shelving. 1344-P2's producer mints it on an archive of the old tree into a new path. The
      week-93 mint stays.
    - Step 5 names A8's Save45 capture, one that holds a count frozen by v1 cash blocks, and the search that finds
      it. Both are minted before Part A lands.
12. **The payback rule is scoped** (amendment 12). §4.2 and §4.4 say the rule keeps the zero-cash week in place
    "under the week's operating cost". Research spend and Wave 2 installments sit outside it. B6 folds into B3 as the
    per-release inequality, and control (g) carries the route-level claim.

## Low findings, adopted

- §4.3's history row says a withdrawn proposal leaves without a receipt (`talentMarket.ts:485-491`). The promise
  tracer handles a submitted proposal that vanishes.
- §4.7's DECISIONS.md citations read `:144-147` and `:149-153`.
- §4.7 reason 2 rests on the inflow (1357-R L11) alone. The D-17B "restructuring" argument goes, because it would bar
  staff release, which the Owner authorized (1357-F3 :45).
- §4.1's slot signal cites `:159` only. A refused renewal at `:118` leaves the person employed until expiry.
- A1 says three counts: `affordable`, `unaffordable` and `viable`.
- §4.5 drops "this rule is exact". The reserve falls as contracts expire, so cash can rise above it with no inflow.
- Control (a) strips `costCutting` and the version stamp before comparing arm A+B with arm A. Control (c) and B5 read
  "Part B adds no positive movement".
- §4.2 states that keeping R3's reserve check departs from 1357-R L7's "below its reserve" (:354), with the notes'
  reason.
- §6.1's pressure-off block runs control and A+B only.
- §8.1 step 3 yields to all Save45 heavy work, not only its recorded runs (1362-O :39).
- 1363-V prints the refused package's cost beside cash at each entry, research spend after entry, and headcount with
  remedy counts at each distress entry.

## P1 to P10

| # | Ruling |
|---|---|
| P1 | The three entry conditions stand with ruling 2's later-week rule and the `:159` slot signal. The greenlight stands as v1's only exit with ruling 1's disclosure. The post-loan restart is O6 |
| P2 | Keep the payback rule as rival policy, scoped by ruling 12 |
| P3 | v1 keeps active research running, admits no new commitment and adds no rival pause. A pause is P13B-S8's research policy |
| P4 | 1363 takes its own step, numbered by ruling 8 |
| P5 | Part A may land first with its own GREEN, fallout and broad gates. 1363-V, G-P with G-L, and re-probe 1 run once, after Part B. A8's v1 capture is minted before Part A lands |
| P6 | Both declared re-pins are law-change re-pins, since 1362-O :26-29 changed the rule they pin. Ruling 5 adds `:483` |
| P7 | Measure first. Any rule that counts a true cash block toward shelving goes to the Owner, because it would reverse 1362-O :26-27 |
| P8 | Without a recorded delegation, a change to `tuning.ts:39-40` or the templates is an escalation (O3, O4). The parent checks `docs/engineering/P12A-PROVISIONAL-IMPLEMENTATION-CHARTER.md` before 1363-V reports |
| P9 | A probe author and an independent review, bounded to 1344-V's four routes, with ruling 9's basis rule in the brief |
| P10 | The new pin directory is `tests/fixtures/p15/p15a1-market-pins-1363/`, and `p15a1-market-pins/` stays. If 1355-P cannot write a new path without a code change, that helper change gets its own review (1360-F3 :45) |

## For the Owner

O1 (rival facility disposal) is already asked. O2 to O5 go to the Owner with 1363-V's numbers. One question joins
them:

**O6. After a P15B loan, may a rival that cut costs hire again and film?** Needed before re-probe 2; it does not
block 1363.
- **Without a rule,** the loan only extends the runway of a studio that can never film. 1357-F2 ruling 3 already found
  that a loan which only buys weeks fails "meaningful recovery opportunities".
- **The parent recommends yes:** a loan principal ends cost-cutting, and the ordinary `staff()` and `decide()` laws
  resume. The cost is a second round of hiring and, if cash falls again, a second round of termination charges.
  The payback rule and R3's checks still govern those releases.

## What changes in the schedule

Nothing before the Save45 landing. 1363's RED, production and measurement follow 1363-A §8.1 with rulings 7 and 8,
after Save45 and in the order the parent sets against 1364-A.
