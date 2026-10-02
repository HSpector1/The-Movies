<!-- 1363-B: independent read-only review of the 1363-A draft charter, written for the parent's adoption record 1363-F. -->

# 1363-B: review of 1363-A, the rival-recovery amendment charter

**Verdict: ADOPT WITH AMENDMENTS (1-12 below).**

Reviewed read-only on 2026-10-02 (`date`: 15:04 CDT). The charter was drafted at 7d582318. HEAD moved during the
review through 32ce0918, 50181e76, 1d4134fc, d98ba43e and c1580d39, all docs commits. `src` is tree 762d8e09 at each,
and `src/core/hollywoodTick.ts` is blob 1c9c523d, so every source line below holds at the charter's anchor and at
c1580d39.

**Method.**
- Read whole: the charter (812 lines), its notes (376), `hollywoodTick.ts`, `hollywoodPolicy.ts`, 1362-O, 1357-F3,
  1357-F2, 1361-F, 1361-F2, 1361-F3, 1360-F3, DECISIONS.md, HANDOFF.md and
  `tests/p14d1-rival-shelving-natural.test.ts`.
- Read in part: 1357-R (most of it), 1340-O, 1342-O and its approved text, 1344-A, 1344-V, 1344-F6, 1344-K, 1352-A,
  1352-F, 1357-A, 1357-B, 1357-X, 1355-A, 1355-C4, 1359-A, 1359-F5, 1359-X4, 1353-F6, 1360-L, 1360-F2, 1361-GP-D, and
  the cited ranges of fifteen `src/core` files and ten test files.
- Ran nothing: no node, vitest, tsc, npm, npx, tsx or vite-node. Git: `rev-parse`, `show`, `cat-file` and
  `log --oneline`. Searches: `/usr/bin/grep` on named files, on `src/`, and on `tests/` with `fixtures` excluded. I
  opened nothing under `tests/fixtures` and no Owner save. Every claim below is source reasoning, not executed proof.

**Summary.** The charter maps every sentence of the Owner's 1357-Q1 text to a clause. It invents no subsidy,
replacement studio, minimum count or survival guarantee, and it reads out production, cash, costs, borrowing and
recovery with "closure due" kept apart from closure. Part A is correct and small. The citations are accurate: of
about 150 checked, two are wrong, both stale line numbers in DECISIONS.md. The amendments fix four defects in Part B:
an exit that cannot fire, a save rule that refuses lawful states, a proposal path that escapes the freeze, and a live
proof the new step must strip. They add one landed leaf the RED misses and close gaps in the save numbering and the
measurement. Each is a text change the parent can fold into 1363-F.

## Amendments, ranked

**1. Say that v1 cost-cutting is terminal, and decide the post-loan restart before re-probe 2 (§4.2, §4.5-§4.7; P1).**
- While cutting, `staff()` fills no slot, so "every own employee becomes surplus" (charter :302-303). `evaluate()`
  needs a seatable director, three actors and craft (`hollywoodTick.ts:214-225`). Once R3 releases any of them, the
  one exit, a greenlight (:371), cannot fire. Under Wave 2 a loan "only extends its runway" (:389-390).
- That is the rival that "can never film again", which §4.7 reason 3 rejects for facilities as "the dormant shell
  that 1352-F superseded" (:419-420; 1352-F :86-87). The charter applies the argument to plant and not to staff.
- **Amend:**
  - (a) State in §4.5 that a rival which releases a team role never films again in v1. It lives on the
    41,500-46,500 floor (1357-R :205-210) until P15B closes it.
  - (b) Make control (e) a stop condition rather than a finding. The no-wait trigger (:296-297) rests on "cannot
    restart", and (e) is the only test of it.
  - (c) Decide before re-probe 2, not in Wave 3, whether a cost-cutting rival that borrows leaves cost-cutting.
    Wave 2 makes loans real, and 1357-F2 ruling 3 (:61-66) already found that a loan which only buys weeks fails
    ruling 3's "meaningful recovery opportunities". One option changes nothing before loans: any non-revenue inflow
    ends cost-cutting. Its risk is a second release round that pays charges and bonuses twice.
  - (d) Tell the Owner (O6, section 8).

**2. Fix the era-46 rule on adoptions (§5, :460-463).**
- The rule forbids a `technologyAdopted` receipt after `since`. A rival's receipt carries the adoption's operational
  week (`technology.ts:609-611`), which comes `deploymentWeeks` after the commitment (`technology.ts:606`;
  `technologyRival.ts:66-69`). An adoption bought before entry and deployed after it is lawful binding work, and the
  rule makes the save refuse it.
- **Amend:** test `technology.adoptions` for a `committedWeek` later than `since`. Define "after `since`" as a later
  week throughout, because `staff()` runs before `decide()` in the entry week (`hollywoodTick.ts:362`, `:369`).

**3. Close the extension-case proposal path (§4.2, :305-306; B2).**
- §4.2 stops proposals through the rival trigger (`talentMarket.ts:1395`, `:698-717`). For a retirement-extension
  case the pass sends the incumbent to `submitProposal` without calling `rivalProposalTrigger` (`:1388-1395`). A
  cutting rival would still propose for its own retiring people. That breaches B2, and §5's "no current proposal
  after `since`" then refuses the save.
- **Amend:** skip a cutting business at the top of the pass (`:1389-1390`) for every case, and add an extension case
  to B2.

**4. Name the live profession proof in the Save46 step (§5, :455-456).**
- `validatedLiveProfessionContext` proves the live state through the V41 chain with the Save43 shelving era
  (`save.ts:10497-10502`). `validateHollywood` checks business keys exactly (`hollywoodValidation.ts:228`), so an
  unstripped `costCutting` key fails the proof. Inside `tick()` that failure is swallowed into `{ kind: 'rejected' }`
  (`liveRetirementWriting.ts:21-26`), the silent path of 1361-F3 ruling 3.
- **Amend:** commit (b) strips `costCutting` in the live proof, as `relationshipsAtV31` drops Save44's fields
  (`save.ts:10498-10501`). The fallout shows the proof passing on a state with a set `since`, the check 1361-F3
  ruling 4 sets for Save45.

**5. Declare the landed leaves Part B moves (§7).**
- `tests/p14d1-rival-shelving.test.ts:483` ("a mixed sequence") fails on my reading.
  - Its three staffing-blocked weeks remove an actor and set cash to reserve + 1 (:504-506). That meets §4.1
    condition 3's fourth bullet: the index is full and both screenplays are staffing-blocked by a slot `staff()` left
    unfilled for cash. r01 holds no production or run at week 130 (its last release on the pre-shelving route is week
    104, 1357-R :238), so r01 enters cost-cutting.
  - The leaf then restores the actor and about 18.4M (:533). The next `staff()` runs R3 over the whole team before
    `decide()`. Every reserve and payback check passes at that cash, so the team goes, each evaluation reads
    `staffingBlocked`, and `expect(count).toBe(i + 1)` (:545) fails in the first week.
- `:385` still passes: at reserve + 1 no release clears R3's reserve check.
- `tests/p14a1-decline-reasons.test.ts` case B (:284-324) is at risk. It drains one rival to 0 at week 207. If that
  rival holds no production, run or draft, it enters cost-cutting, §4.2 withdraws its proposal before the week-208
  settlement, and the four-sentence decline with a "bonus" sentence (:311-316) changes.
- **Amend:** list `:483` in the RED, either with a non-cash staffing block or as a declared law-change re-pin, and
  name case B for the dry run.

**6. Count dormant survivors in re-probe 1's verdict (§8.3, :730).**
- The verdict "follows 1357-A §8's thresholds", which count closure due. Part B cuts a stalled rival's burn to the
  floor and moves its closure due later without a film. The gate can then read Proceed or Flag on survival alone,
  the reading the Owner ruled out (1362-O :44-45).
- **Amend:** at each checkpoint, count entered rivals that are not closure-due and have not greenlit since their
  cost-cutting entry. A Proceed or Flag that depends on them goes to the Owner as such before P15B's RED starts.

**7. Make G-P part of the G-L rerun (§6.8, :628-629).**
- G-L's K3 requires the live manifest to be "byte-identical to G-P's" (1359-A :265-266), so G-L on the 1363 tree
  needs G-P on the same tree. The charter leaves that to the parent.
- G-P r2's tree guard stops without `p15Sequence`, `powerRanking` and `sharedMarket` (1361-F2 :13-16). A G2-Retune
  tree has no `sharedMarket`, so that case needs a ruled variant.
- §6.8 compares against P15C's closure G-L on the Save45 tree (1359-A :282; 1361-F step 10). Make that run a
  precondition of step 10.

**8. Do not fix the step at Save46 (§5, :447-450; §8.1).**
- On a G2 Retune, P15A.1 takes "its own later step" (1361-F2 :31-32). The Owner's third response, recorded after this
  draft, authorizes 1364-A, which the parent orders against 1363 at the same checkpoint (1362-O :255-319, :316-317).
- 1361-F3 ruling 2 (:33-39) sets P15B's frozen-validator and allocator obligations at its later step. A 1363 step in
  between adds a frozen V46 layer that the obligation must cover.
- **Amend:** write "the next free step after Save45 when commit (b) lands" and name the claimants. Add the third
  response to the authority list. Extend 1361-F3 ruling 2 to the step below P15B's.

**9. Attribute promise paths on equal-basis trees only (§6.5, :560-562).**
- 1344-V's attribution rests on states equal until the first shelving, with one source difference (1344-V :223-225).
  The candidate against ff803032 also differs by slices A and B, the P15 roots and, once live, market pressure, so a
  first divergence there names no law.
- **Amend:**
  - Trace the 154 on 469a9547 against ff803032.
  - Measure "under the amended law" with Part A applied to 469a9547 in scratch (the same `hollywoodTick.ts` blob)
    against ff803032.
  - Measure 1363's own moves as candidate against control.
  - Report candidate against ff803032 as totals only, labelled confounded.

**10. Make `unaffordableViable` opt-in (§3.2, :187-188, :196-197).**
- `chooseIndustryPackage(...args)` (`hollywoodTick.ts:233`) is also a locked search (`lockScreenplay: true`, :231).
  "Computed for locked-screenplay searches only" would forecast every skipped candidate on every evaluation,
  greenlights included, which the cost note does not count.
- A rival below its reserve skips all 54 candidates at the cash gate today (`hollywoodPolicy.ts:62`) and forecasts
  none. Under v2 its re-search forecasts up to 54 per refusal. That bears on the 1356 harness's 300,000 ms ceiling
  (1361-F ruling 15).
- **Amend:** only the re-search at `:236` asks for the count, so the chooser path stays byte- and cost-identical.
  1363-V reports tick time against the timing gates.

**11. Name the captures §8.2 and A8 need (:718; :650; :682).**
- `shelving-viable-control` (:553) compares the whole state at week 93 with a genuine pre-shelving mint. If v2
  shelves r04's `script-0005` before week 93, no re-pin restores that identity. The leaf then needs a genuine
  pre-shelving capture before the new first shelving, minted by 1344-P2's producer on an archive of the old tree into
  a new path. The week-93 mint stays.
- A8 needs a Save45 capture that holds a count frozen by v1 cash blocks. With pressure on the Save45 route, r02's
  freeze at 12 near week 247 is not assured. Step 5 should name the search and the capture, minted before Part A
  lands.

**12. Scope the payback rule (§4.2 :328-333; §4.4 :367; B6).**
- X·w ≤ C·Δ keeps the zero-cash week in place only for outflows inside `rivalWeeklyOperatingCost`
  (`hollywood.ts:106-111`). Active research keeps spending while cutting (`rivalResearch.ts:258-262`), and Wave 2's
  installments sit outside it (1357-A :216-221).
- **Amend:** say "under the week's operating cost", fold B6 into B3 as the per-release inequality, and leave the
  route-level claim to control (g).

## Low findings

- `withdrawProposal` writes no receipt (`talentMarket.ts:485-491`; the market receipt kinds at `types.ts:2075-2084`
  have no withdrawal). §4.3's history row should say a proposal leaves without a record, and the tracer must handle a
  submitted proposal that vanishes.
- `DECISIONS.md:133-136` and `:138-142` (§4.7) were right at 7d582318. 1d4134fc inserted 11 lines at :72-82, so they
  are now `:144-147` and `:149-153`.
- §4.7 reason 2 leans on D-17B's ban on "restructuring". The same ban would bar staff release, which the Owner
  authorized as 1357-F3 :45 scoped the route ("shed facilities and release staff"). Rest reason 2 on the inflow
  (1357-R L11) alone.
- §4.1 cites `:118` for a slot left unfilled. A refused renewal leaves the person employed until expiry; only `:159`
  leaves a slot empty.
- A1 says "four existing counts". There are three: `affordable`, `unaffordable` and `viable`.
- §4.5's "this rule is exact" overstates. The reserve falls as contracts expire, so cash can return above it with no
  inflow. The claim holds for a rival that must refill a full team.
- Control (a) must strip `costCutting` and the version stamp to compare arm A+B with arm A. Control (c) and B5 should
  read "Part B adds no positive movement", since Wave 2 adds a positive `loanPrincipal` (1357-A :220).
- §6.1 runs every arm again with pressure off. Control and A+B suffice for attribution and halve that block of heavy
  runs.
- §8.1 step 3 yields to Save45's recorded runs only. "Preserve ... active verification" (1362-O :39) asks it to yield
  to all Save45 heavy work.

## 1. Fidelity to the Owner

- **Mapping.** The 1357-Q1 part (1362-O :23-46) has fourteen sentences. S1-S15 of §1.2 carry each of them, and
  S16-S20 carry items 6 and 7 and the closing line. Every line reference in the table holds.
- **Nothing escalated is invented.**
  - No subsidy: Part B adds no inflow, and `hollywoodValidation.ts:295` still bounds every other kind at zero.
  - No replacement studio, no minimum count, no survival guarantee (§4.4).
  - Facility disposal goes to the Owner as O1 instead of into v1.
- **One product consequence goes undisclosed:** Part B's terminal wind-down (amendment 1). It follows from the route
  the Owner authorized. The Owner chose (a), though, with the parent's stated aim of keeping "meaningful recovery
  opportunities" true (1357-F2 :84-86), so it belongs in front of the Owner (O6).
- **Read-outs.** §6.2 reports production, cash, costs, borrowing and recovery per rival over time, with survival
  counts only beside them. "Closure due" is reported as closure due (§6.2, §8.3). The gate's verdict still needs
  amendment 6.

## 2. Part A, the binding-cash test

- **The claim holds at the cited lines.**
  - `cashAvailable` appears only at the cash gate (`hollywoodPolicy.ts:62`).
  - The viability test compares `score` with `holdOperatingMargin`, and the hold sits on both sides (:69-73), so a
    candidate is viable exactly when its contribution beats the marketing-ratio penalty.
  - The forecast reads the package inputs and a stream built fresh from (seed, `forecast`, key) on every call
    (`forecast.ts:407`; `rng.ts:204-206`). Scoring a skipped candidate therefore moves no stream and gives the verdict
    it would get at any cash.
- **The implementation is right.** One count in `searchIndustryPackages`, filled for skipped candidates that pass the
  same test, and `unaffordableViable > 0` in place of `unaffordable > 0` at `hollywoodTick.ts:236`, implement the
  Owner's distinction (1362-O :26-29). It needs no saved state: the validator checks counts and receipts by bounds
  (`hollywoodValidation.ts:344-367`, `:536-543`) and replays no outcome. Amendment 10 keeps the chooser path
  unchanged.
- **Retries, `retryWeek` and the shelved list.** §3.5 is right. A hopeless due retry now moves `retryWeek` 26 weeks
  out (`:296-297`), so the lowest due entry no longer blocks the rest (`find`, `:287`), and the lists grow faster.
  Ending retries stays with the Owner (O5).
- **The two declared re-pins** (`:255-308`, `:438-460`) pin v1's literal rule and fail under v2. A3 and A4 record the
  Owner's change, not an old result (P6). Part B adds a third (amendment 5).
- **`shelving-viable-control`** is at risk, as the charter says (1357-R :109-110, :368-369). Its remedy needs
  amendment 11.
- **`tests/p14d1-rival-shelving-natural.test.ts`** likely holds. Its leaves pin law invariants only (:4-6, :110-112).
  The four-in-52 bound survives v2:
  - each studio indexes at most two screenplays (`hollywoodTick.ts:301`);
  - a shelving needs 13 counted rejections;
  - the 13-week hold covers the whole studio;
  - its one writer (`hollywoodStartingData.ts:46`) drafts one screenplay at a time.

## 3. Part B, scoped cost-cutting

- **Entry.** The cash-closure trigger is the right family: it reads the rival's own reserve and package gates and
  nothing of P15B's. It needs the `:159`-only slot signal (low findings), the later-week rule (amendment 2), and
  control (e) as a stop condition (amendment 1). It also inherits commission law's single draw: a refused commission
  does not advance the ordinal (`hollywoodTick.ts:305-310`), so one dear concept keeps the path shut. 1363-V should
  print the refused package's cost beside cash.
- **While cutting.** The freeze list matches 1357-R L8, except the extension path (amendment 3). The withdrawal leaves
  no receipt (low findings).
- **Releases.** R3's checks carry over unchanged, which respects the employment-cost and binding-work words. Every
  release pays `terminationCost` (`employment.ts:207-210`), and nobody seated, writing, researching or promised goes
  (`hollywoodTick.ts:180-188`). Keeping R3's reserve check departs from 1357-R L7's "below its reserve" (:354). The
  notes justify that (alternative 2); the charter should say it.
- **The payback rule** is sound arithmetic: at constant burn, X·w ≤ C·Δ is exactly "the zero-cash week comes no
  sooner", and the notes' worked case shows R3 alone can hasten it. Keep it, scoped (amendment 12; P2).
- **Exit.** The single exit is unreachable once a team role goes (amendment 1).
- **Facilities, history and accounting.** No money kind is added. Every movement goes through `moveRivalMoney` as
  `termination` (`hollywood.ts:41-52`), and the validator's termination, payroll and overhead reconciliations stand
  (`hollywoodValidation.ts:251-259`, `:294`, `:312-315`). History holds except for the withdrawal record.
- **No subsidy.** Correct.
- **P15B.** Part B reads no P15 root and adds no second threshold (§4.6), so it duplicates none of the warning,
  distress, loan or closure law. Two effects remain, and §4.6 names both:
  - it pre-empts Wave 3's rival selection for REDUCE_OBLIGATIONS;
  - a rival that cut early meets distress with fewer people, so 1352-A §4.3's two-route rule is even less likely to
    hold (1357-X :122-128). 1363-V reports headcount at each distress entry.
- **Facilities out of v1** is sound on reasons 1 and 4 (the costed-four and laboratory law,
  `hollywoodValidation.ts:303-304`, `:316-323`, `:373-392`; P13B-S8's open cancellation item) and on the inflow half
  of reason 2. Reason 3 is true of the core four but cuts against Part B's own staffing rule (amendment 1). The D-17B
  half of reason 2 should go.

## 4. Save and state

- **The field is necessary.**
  - Entry reads facts that exist only inside the week: this week's labels, `staff()`'s reserve refusals and the
    commission's refusal point.
  - A receipt cannot tell a cost-cutting release from an ordinary R3 one, and a new receipt reason would be a shape
    change anyway.
  - Without stored state the release and re-hire loop opens (notes §6.4). `{version: 1, since}` is the smallest
    correct form, and the week lets validation check commitments after entry.
- **Its validation needs amendments 2 and 4.**
- **Save46 is right in kind:** a separate step after Save45 and before P15B. P15B's RED waits for re-probe 1 on this
  source (1357-F2 :58-60), so a shared step would hold Part B back (P4). The number is not fixed (amendment 8). P15B
  taking the following step still satisfies 1361-F ruling 17's words.

## 5. Measurement

- **Routes, seeds and arms.** Right, with `p15a1-w2-market-01` at 520 and 6,240 weeks as item 7 asks
  (1362-O :196-197). Arm A as Part A's commit in scratch separates the two parts (control f). 1357-P ran three seeds
  to week 6240 in about nine minutes (1357-X :132), so the matrix fits the heavy lane.
- **Controls.** (e) is the most important one and should be able to stop the work (amendment 1). (a) and (c) need the
  wording fixes in the low findings.
- **Low-market problems (§6.4).** Good: base market value, L9's negative-margin share, cycle economics, awareness per
  release and whether a full-pace cycle pays, in one table ordered by market value. It measures and routes, and
  tunes nothing.
- **Promise-path tracer.** The five-step first-divergence chain, with a witnessing receipt per step, is right. The
  basis is not (amendment 9). It stays on 1344-V's four routes and 520 weeks, which honours "no new research
  campaign".
- **Tuning authority.** §6.6 matches D-1329-1: the three shelving constants move only by a tuning amendment with its
  own record and a fresh measurement (1340-O :42-43; 1344-A :129-138), and the charter adds no constant.
- **G-L.** Scheduled as 1361-F2 ruling 5 requires, but K3 needs G-P (amendment 7).

## 6. Sequencing

- **No conflict** with 1360-F3 ruling 5 (no `src` commit before step 4), 1361-F ruling 1 (one writer, step 6),
  ruling 17 (read as in section 4) or 1361-F2 ruling 5 (step 10). Both re-probes come before P15B's live closure, as
  the Owner asks (1362-O :43-46).
- **Gaps.**
  - 1361-F2 ruling 3, 1364-A and 1361-F3 ruling 2 against the fixed Save46 (amendment 8).
  - If Part A lands alone (P5), the last Save45 writer carries Part A. A8's v1 capture must be minted before it, and
    S1-S4's capture after it.
- **Captures and pins.** §8.2's method matches "change or re-mint only the captures actually affected"
  (1362-O :41): genuine saves stay, current-route pins re-mint into new paths, and nothing is re-minted on suspicion.
  - K1, K2 and M0A are rightly expected to hold.
  - The route L readers compute the Legacy manifest from the ticked state
    (`tests/p15c2-campaign-legacy-integration.test.ts:862`) and pin no rival outcome. Their version pins move with
    the Save46 sweep.
  - The item 9 coverage repair edits downgrade pins that a live-version sweep also edits (1362-O :252-253), so the
    parent should order the two.

## 7. Citations

I checked about 150 of the charter's citations, each read at the cited line. Two are wrong, both stale:
- `DECISIONS.md:133-136` and `:138-142` (§4.7): correct at 7d582318; at HEAD c1580d39 they are `:144-147` and
  `:149-153`.

The notes' §5 table agrees with every other reading. Checked and correct, by file:
- `hollywoodTick.ts` :60-62, :102-127, :118, :140-174, :148-157, :159, :175-197, :180-182, :183-184, :185, :187,
  :188, :190-191, :195, :196, :201-336, :225, :226-232, :231, :235-236, :266-268, :270-275, :272, :277-281, :286-298,
  :287, :290, :296-297, :301, :302, :324-327, :361, :362, :363, :367, :369, :414-417, :464-472.
- `hollywoodPolicy.ts` :49-61, :62-74, :66-73, :69-73, :73. `forecast.ts` :11, :407.
- `hollywoodValidation.ts` :62-72, :228, :251-259, :290-292, :294, :295, :303-304, :312-315, :316-323, :344-367,
  :373-376, :536-543, :540.
- `tuning.ts` :28, :30-35, :33, :35, :39-40, :139-140, :415, :486, :1031, :1988, :2094. `employment.ts` :207-210.
  `actions.ts` :2669-2718. `placement.ts` :1341-1344. `save.ts` :6567. `hollywood.ts` :41-52, :145-152.
  `hollywoodStartingData.ts` :11-36.
- `rivalResearch.ts` :113-123, :130-153, :232-255, :258-262. `technologyRival.ts` :19-25, :48. `talentMarket.ts`
  :389-401, :485-491, :698-717, :1112-1135, :1238, :1381-1409, :1395.
- Tests: `p14d1-rival-shelving.test.ts` :206-253, :228-242, :255-308, :438-460, :553;
  `p14d1-rival-shelving-natural.test.ts` :4-6, :8-11, :25, :37-47, :50-54, :56-81, :83-94, :96-108, :110-112,
  :115-127; `p14d1-rival-shelving-fixtures.ts` :7, :92-95; `helpers/p15a1-market-route.ts` :152, :316-340, :499;
  `p15a1-market-integration.test.ts` :430, :467, :738, :748, :816; `p15c2-campaign-legacy-integration.test.ts`
  :824-873; `p14b5-relationships.test.ts` :162-164, :381, :399, :656, :666, :874; `p14c2c-rival-promises.test.ts` :25,
  :34, :49, :60; `p14c3-admission-boundaries.test.ts` :141, :230.
- Records: 1362-O :20-66, :23-46 and all twenty lines in §1.2, :70-72, :79-85, :104-108, :189-199, :214-215,
  :226-232; 1340-O :30-45, :47-57; 1342-O approved text :42-61 and 1342-O :69-72; 1357-R :13, :32-33, :93-94,
  :109-110, :120-128, :140-151, :205-210, :228, :251-343, :314-322, :334-336, :350-358, :368-369; 1357-F3 :9-11,
  :25-27, :45; 1357-F2 :9-37, :57-60, :69-70, :78-95; 1357-X :12, :86-87, :122-128; 1357-A :59, :85, :145-148,
  :208-214, :242, :267, :272-278, :281-282, :333-335; 1352-A :10-31, :53, :66, :96, :132, :148-164; 1352-F :51, :59,
  :86-87; 1344-A :57, :61-62, :67-104, :123-125, :129-138; 1344-V :33-40, :99, :139-142, :214-225, :343-380,
  :393-403, :436, :467-499, :536-540; 1344-F6 :12-16, :38-46; 1344-K :75; 1355-C4 :137, :150, :155, :209-217;
  1355-A :168, :174, :205-208; 1359-A :260-267, :282; 1353-F6 :76-77; 1359-F5 :7-8, :19-28; 1359-X4 :27; 1361-F
  :78-95, :126-127, :132-139; 1361-F2 :26-38, :48-55; 1361-GP-D :93-98; 1360-L :37-38; 1360-F2 :27-33; 1360-F3
  :24-25, :42-45.

## 8. P1-P10 and the Owner questions

| # | Recommended answer | Reason |
|---|---|---|
| P1 | Confirm the three entry conditions with amendment 2's later-week rule and the `:159`-only slot signal. Confirm the greenlight as v1's only exit only with amendment 1's disclosure, and decide the post-loan restart before re-probe 2, not in Wave 3 | Wave 2 makes loans real, and a restart is what turns a loan into a recovery opportunity (1357-F2 ruling 3) |
| P2 | Keep the payback rule as rival policy, scoped (amendment 12) | It uses existing quantities. Without it, R3 alone moves the zero-cash week earlier (notes §6.2), and P15B's distress clock with it (1352-F :51) |
| P3 | Keep v1: no new research commitments, active projects run on, no rival pause | A rival pause is new rival research policy, which P13B-S8 owns (its cancellation item is open, `hollywoodValidation.ts:290-292`). The existing pause already runs at a Scientist's expiry (`hollywoodTick.ts:474-480`), and spend idles when cash falls short (1357-R :224-225). 1363-V should report research spend after entry |
| P4 | A separate step for 1363 | P15B's RED waits for re-probe 1 on this source, so a shared step would hold Part B back. Number it per amendment 8 |
| P5 | Allow Part A to land first, with its own GREEN, fallout and broad gates | It needs no step. Run 1363-V, G-L and re-probe 1 once, after Part B, because the Owner asked for the cost-cutting route before P15B's live closure. Mint A8's v1 capture before Part A lands |
| P6 | Confirm both re-pins as law-change re-pins, and add `:483` (amendment 5) | They pin v1's literal rule, which 1362-O :26-29 changed. A3 and A4 pin the new behaviour on the same genuine input, so 1340-O :44-45 is not engaged |
| P7 | Measure first. Any rule that counts a true cash block toward shelving goes to the Owner | It would reverse the distinction the Owner drew at 1362-O :26-27. D-1329-1's "temporary" cash blockage (1340-O :35) does not let the parent undo a later, specific ruling |
| P8 | The default stands: without a recorded delegation, a change to `tuning.ts:39-40` or the templates is an escalation (O3, O4) | `tuning.ts:28` labels them P12A management policy, and no Owner delegation names them, unlike D-1329-1's three constants and ruling 3's §4.5 values. The parent should check `docs/engineering/P12A-PROVISIONAL-IMPLEMENTATION-CHARTER.md` before 1363-V reports |
| P9 | Yes: a probe author and an independent review, bounded to 1344-V's four routes | Add amendment 9's basis rule to the probe's brief |
| P10 | Yes: name the directory now (for example `tests/fixtures/p15/p15a1-market-pins-1363/`) and keep `p15a1-market-pins/` | Both producers refuse an existing directory (1360-F3 :24-25). If 1355-P cannot write a new path without a code change, that helper change needs its own review (1360-F3 :45) |

**O1-O5 are correctly put.**
- **O1** is a real Owner question. "Respecting ... facilities" (1362-O :31-32) reads two ways against 1357-F3 :45's
  "shed facilities", and a refund is a new positive money kind (1357-R L11). The parent has asked it (HANDOFF :44),
  and v1 rightly does not wait.
- **O2-O5** are product rules that 1363 must not invent, and the charter asks them only with 1363-V's numbers.

**One more question should go to the Owner, as O6,** with control (e)'s result and re-probe 1's numbers: may a rival
that has cut costs restart hiring after a P15B loan, or does it wind down as a non-filming studio until closure? It
blocks P15B's live closure, not 1363. If the parent wants P7's rule, that goes to the Owner as well.
