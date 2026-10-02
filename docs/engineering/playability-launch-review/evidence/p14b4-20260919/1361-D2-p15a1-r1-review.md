# 1361-D2: review of P15A.1 Wave 2 production r1 and the slice 2a r2 delta

An independent, read-only implementation review under 1361-F ruling 21 of the stack in
`/Users/zacheryspector/studio-scratch/1361-prod/tree`: slice 2a r2 (5eccada, `p15a2-r2`) and P15A.1's three commits,
(a) 39d0481 `p15a1-a-r1`, (b) 1074744 `p15a1-b-r1` and (c) c524911 `p15a1-c-r1`. Written on 2026-10-02 from 15:31 CDT
by `date`.

E is `docs/engineering/playability-launch-review/evidence/p14b4-20260919` in the real repository. X is
`/Users/zacheryspector/studio-scratch/1361-prod/x`, the parent's dry runs (1361-X2). Under `src/core/`: MI is
`marketIntegration.ts`, TK `tick.ts`, HT `hollywoodTick.ts`, RC `reception.ts` and PRA `powerRankingArchive.ts`. Every
`file:line` is the blob at `p15a1-c-r1` unless a tag is named.

## Verdict: PROCEED

(c) is the frozen candidate, and P15C may build on it. No finding asks the writer to change (a), (b) or (c).

- **Slice 2a r2** carries R1 to R4 as 1361-F3 wrote them. The `satisfies` tie compiles at every tag and bites in both
  directions. R3's wider walk is sound for all three Save45 roots and moves no message: from r1 to r2 no leaf changed
  status or failure message in 1355, 1356 or 1359 (X/r1 against X/r2s).
- **The split holds.** (a) and (b) change no economic output. At (b) the 1356 harness save grew by exactly 70 bytes
  over 6,240 weeks, the serialized empty root, and the archive kept its 725,757 bytes. K1, K2 and M0A pass. Nothing in
  (a) or (b) reads (c)'s code.
- **(b) can land alone.** Every state (b) writes passes the full validator, a (b) save loads under (c) with no save
  step, and (c) deletes (b)'s one write. I advise restoring 1361-F ruling 13's Retune path under item 3's conditions.
- **The validator, the witness and the seam** match 1355-A §3 as amended, the 1355-F4 `vi.mock` seam and 1355-F5's
  lookup. Every release with P = 0 is bit-identical, by IEEE and by K2.
- **One control gap matters now (F1).** K1's allowed paths omit the end-of-tick talent market, which reads pressured
  cash, Standing and fame in the same tick. K1 passed at week 21 because that week holds no market case, proposal or
  receipt. G2's K3 checks its first pressured week against the same chain, and G2 is running.

Parent actions; none falls to the writer:
1. Before reading G2's K3 row, rule on F1.
2. Before the landing, add the d16 suite to the fallout measurement and schedule F2's fix in the Save45 push.
3. On a G2 Retune, restore ruling 13's path under item 3's conditions.

## Identity

- `base` 1045432, `p15a2-r2` 5eccada, `p15a1-a-r1` 39d0481, `p15a1-b-r1` 1074744, `p15a1-c-r1` c524911, one commit
  each (`git log --decorate`). `p15a2-r1` stays on 1f2495a.
- `git diff base <tag>` hashes to 1361-E2's sha256 for all four patches. The copies in the scratch directory and in
  `E/1361-stage/prod/` match.
- The writer's first build of (c), 2dd41a1, differs from c524911 only on lines that r2 and (b) both edit: the
  literal's `sharedMarket: true` and two comments.
- `base:src` is tree 762d8e09, the same tree as the real repository's `HEAD:src` at fc107749. The five oracle files
  have the same blobs at real HEAD and at (c).

## Findings, ranked

### F1. High, for the parent: K1's chain omits the end-of-tick talent market, and week 21 tests none of it

`k1AllowedPaths` (`tests/helpers/p15a1-market-route.ts:447-475`) follows 1355-A §4's list. The K1 leaf also asserts
`employment` and `activeEmploymentOrdinals` equal (`tests/p15a1-market-integration.test.ts:448`). Neither list covers
the talent market. `advanceTalentMarketWeek` runs inside the same tick, after finalize (TK:1180), and reads three
values the pressured chain moves:
- **Cash.** A rival's proposal must leave its cash at or above its reserve (`src/core/talentMarket.ts:389-401`, the
  test at :398). The player's passes `canAfford`.
- **Standing.** Settlement bands each issuer's Standing mean against the others' with a 5-point tolerance
  (`talentMarket.ts:825-834`, :883).
- **Fame.** A release moves its credited people's fame from its realized total (`src/core/releaseCareers.ts:56`, :60).
  Every price reads fame (`src/core/worldgen.ts:166` through `employment.ts:297` and `talentMarket.ts:371-378`). A
  proposal stores its submission-week quote (`src/core/types.ts:2056-2062`). A settlement writes the contract, the
  employment terms and the bonus ledger row from the decision-week price (`talentMarket.ts:1029-1045`).

The fame channel needs no margin. Any settlement or submission that tick for a person credited on a pressured film
stores a different integer price. The cash and Standing channels flip a decision only near a margin.

**Week 21 tests none of this.** The K1 pin `k1-post-tick-week-21.json.gz` (decoded sha256 f3e27c14…, as its MANIFEST
records) holds no talent-market case, proposal or receipt at week 22. A fresh world's first contracts sit far from
renewal at week 21. K1's pass is robust for this route only, and only because the week holds no market case.

**Where it bites.** G2's K3 requires every path where the pressured state and its factor-1 twin differ to lie in K1's
chain (1361-G2-D:128, citing the probe's P:441-443 and R:259). The G2 review cleared that chain against relationships
alone (`E/1361-G2-D-review.md:199-200`). K3's first pressured week falls after week 520, where renewal cases are
routine. A K3 failure reads Defect (1361-F2 ruling 4.4), and a Defect routes to a production fix and a new G2.

**The reading.** The writer calls this a gap in 1355-A §4's list (1361-E2 O2), and I agree. The tick runs the talent
market on the produced week, after every release, as before. Pressure changes what that step reads, which is what
"later weeks inherit those changes" (1355-A:159) describes. The production does what the charter says.

**For the parent, before reading K3:**
- Rule how to read a K3 failure, or a re-minted K1 failure, whose outside paths all lie in the talent market's
  outputs: `talentMarket.*`, `hollywood.employment` and `activeEmploymentOrdinals`, employment receipts, `contracts`,
  `freeAgents`, the bonus ledger row and a rival's bonus movement.
- My recommendation: amend 1355-A §4 so K1's chain names the end-of-tick talent market for cases whose issuer owns a
  pressured film or whose subject is credited on one. Triage any such K3 difference as that gap, with a recorded
  finding, before any Defect routing.
- A re-mint of the K1 pin (1361-R Part 0 item 8) should keep a K1 week with no open case or carry the amended chain.

### F2. Medium: the d16 discoverability reconstruction absorbs the factor, and its spec runs outside the core suite

`reconstructDiscovery` (`src/harness/d16/driver.ts:1288-1290`) divides the realized opening by `resolveReception`
called with no factor. At (c) a pressured release gives `m = f × disc`, and the field's documented invariant, exactly 1
whenever the spread is 0 (:159-160), fails. d16 worlds are founded, so they carry an industry. The law also lets a
studio's own earlier same-genre release pressure its next one; it excludes only the subject itself
(`src/core/sharedMarket.ts:10-13`; RED 8). The d16 player cadences will meet pressure.

By reading, the sign leaf (`src/harness/d16/driver.test.ts:62`) and the implied-spread leaf (:69) fail at (c) once a
well-supported pressured release draws z above 0.2, since its m is then f < 1. The suite runs under
`src/harness/d16/vitest.d16.config.ts`, outside the `core` project, so 1361-F ruling 20's fallout run will not show
it. Whether the suite passes at `base` is unmeasured.

**The fix, about three lines.** The driver holds the post-tick state at :826-838. Pass the stored factor
(`state.sharedMarket.assessments`, by `releaseId`) into `reconstructDiscovery` and set it as `competitionFactor` on
`inp`. It moves no economy, so a separate `src/harness` commit in the Save45 push keeps c524911 as the frozen G2
identity. The parent should add the d16 config to the fallout measurement.

### F3. Low, on the restored Retune path only: a (b) build would move `recordedFromWeek` past rows a (c) build wrote

(c) takes no save step, so a (c)-era Save45 save carries rows and still loads in a (b)-only build. (b)'s write
(TK:1123 at `p15a1-b-r1`) then moves `recordedFromWeek` past those rows, and the next save refuses "week … is before
recordedFromWeek" (MI:172). The failure is loud, but it lands at save, after the session's play. One line in (b)'s
write that refuses by name when the root holds a row moves it to the first tick. Under the current ruling (b) never
ships alone, and this cannot arise.

### F4. Low, for Wave 3: the autopsy's breakdown omits the factor

`explainRelease` re-resolves the player's release with no factor (`ui/src/engine/adapter.ts:3442`) and shows the stored
box office beside the result, with the note "equals r.opening/r.total by determinism" (:3538). At (c) that note is
false for a pressured release: the shown terms no longer multiply to its opening. The UI tests compare stored to
stored (`ui/src/screens/autopsy-faithful.test.tsx:183-184`) and hold. 1355-A §6 gives the film explanation to Wave 3,
which "shows the stored assessment". The Wave 3 charter should name this site.

### F5. Info: the harness delta cannot be told apart from noise

- `campaignMs`: r1 81,692 (at 13:59); (c) 83,603, (b) 79,889 and r2 78,490, run in that order from 14:51 to 15:03.
- (c) sits 6.5% above r2 and 4.6% above (b). r1 and r2 run identical per-tick code and differ by 4.1%. The three stack
  runs fell in run order.
- (c) also runs a different campaign. Its save is 30,870 bytes smaller than (b)'s although it now carries the
  market's rows, and its archive is 261 bytes smaller.
- By reading, the batch adds per industry week one backward scan over at most 26 weeks of rows (MI:43-51), one law
  call over the week's members, two small maps, the witness's sorts, and an O(N) array copy in weeks with releases
  (MI:99). None of that approaches 0.6 ms a tick.
- 83,603 ms is 28% of the 300,000 ms ceiling. Ruling 15's merged-candidate run, with its Node version and machine
  state recorded, is the measurement to read. Attribution would need alternating runs in one session.

### F6. Info: two notes for the first retune

- `reconcileLaw` takes a week's law from its first row (MI:230) and does not compare `definitionVersion`. The digest
  embeds the definition (`sharedMarket.ts:268`), so a week that mixes eras still refuses, with a digest message. A
  retune that adds a second law should refuse a mixed week by name.
- 1355-A §3.3 marks the append's weekly array copy as a known ceiling with `ponytail:`. MI:99 carries no marker.

### F7. Info: an earlier fallout signature at (b) and (c)

A test that ticks a hand-built industry state without `sharedMarket` now fails at its first tick, by name
(`requireSharedMarket`, MI:26-29). At r2 the same state failed only at a quarter week, with a TypeError (1361-E O2).
The 1361-N plan should expect this in the hand-built-state class that the 33, 4 and 9 test type errors already list.

## The seven review items

### 1. R1 to R4 in slice 2a r2

Correct against 1361-F3 ruling 1.
- **R1** (`save.ts:10871`; :10870 at r2). `satisfies Record<keyof P15StepRoots, true>` refuses a missing key, and
  excess-property checking on the literal refuses an extra one. `P15StepRoots` is a plain object type with two keys at
  r2 and (a) and three at (b) and (c) (`types.ts:2601-2605`), and the literal matches at each tag. The root, UI and
  Bridge gates show 0 `src` errors at r2, (b) and (c) (X/r2s, r2b and r2c `run.meta`). (a) touches neither file. The
  key order keeps r1's, so presence messages and strips keep their order. Every strip follows the list: the
  frozen-builder branch (:6196-6199), the live proof (:10553), the step (:10962-10965) and the down-converter (:10988).
- **R2** (PRA:233-239 and :257-261). The phase check needs the entry of the record's own version and refuses
  `undefined`, after a safe-integer guard. `rank` is compared directly beside `rowFacts`. It is the only nullable field
  `rowFacts` serializes, so R2 closes the one `undefined`-to-`null` hole.
- **R3** (`save.ts:10914-10922`, :10941-10943). Sound. The walk collects every own value under `p15DomainSequence`,
  and the check refuses any that is not a whole number of at least 1. In the three Save45 roots only P15 native rows
  carry the key. Market rows do, and their reasons carry `code`, `sourceReleaseIds` and `value`. Ranking records do,
  and their rows carry none. In r4, the Legacy's official stamp does; its sources carry `highWatermark`, its refs
  `{domainId, id}`, and it reads sibling sequences into `position`. R3 changes no message on a reachable state:
  each root's validator runs first (:10966-10967) and already refuses such a value (MI:156, :180; PRA:230). Its own
  message can appear only for a future root that omits the rule, or in P15B's own run of the check. Numbers are
  collected as before, so the only new refusal is a non-number under the key.
- **R4** (`save.ts:10868-10870`, :10902-10908). The comments say what 1361-F3 asked.

### 2. The commit split (1355-A §8 item 5)

Holds.
- **(a)** adds the optional input (RC:106), the trailing parameter (RC:638), the range check (RC:689-691), the
  `?? 1` (RC:827) and the optional map (HT:358, :415-416). No caller passes a factor or a map at (a). The factor sits
  in the opening product where the constant 1.0 sat (RC:710-716), so a factor of 1 multiplies in the same place and
  order. Every other `computeBoxOffice` caller (forecast, package, agents, harnesses, UI) passes none.
- **(b)** adds the root, its validator, the step's list entries and one tick write. At (b), K1, K2 and M0A pass. The
  harness archive kept 725,757 bytes, and the save grew by 70 bytes, the length of
  `"sharedMarket":{"version":1,"recordedFromWeek":6240,"assessments":[]},`.
- **No dependency on (c).** (b) type-checks and passes its 15 leaves without (c)'s functions. (c) removes (b)'s write
  and TK's `requireSharedMarket` import, and no (b) text survives in TK or MI. MI's validator is byte-identical from
  (b) to (c).
- **The counts.** 1355 climbs 9, 15, 59 with no leaf lost at any tag, matching 1361-E2's row map row for row. 1359's
  40 failures and their first messages are identical at r2, (b) and (c), so P15A.1 moved no 1359 leaf, and 1361-E2 O4
  passes to P15C's dry run.

### 3. (b) alone, and 1361-F2 ruling 3

**The mechanism is sound.** In every tick with an industry, (b)'s write (TK:1123 at `p15a1-b-r1`) sets
`recordedFromWeek` to `currentTick + 1`, the produced week. The bijection then starts at `max(tick, originWeek)`, and
no film carries a release week at or after the tick.
- **Every state (b) writes validates.** World generation, migration and the historical lift write the empty root at
  their own week (`save.ts:10880-10883`). A tick with no industry leaves the root alone. Only `beginFounding`
  (`employment.ts:568-570`) and a migration (`save.ts:8105`) create an industry, both between ticks and with
  `originWeek` at the current tick (`hollywood.ts:174`), so no release predates a covered week. Measured at (b): the
  1356 harness validates its 6,240-week save, and both `market-old-save` capture leaves pass.
- **A (b) save loads under (c) with no step.** (c) changes no type and no `save.ts` line, and its validator is (b)'s.
  Its first batch reads an empty root, so the world gets the 26-week ramp a migrated world gets.
- **(c) removes the (b)-only code.** The append replaces the write (TK:1131), and nothing at (c) rewrites
  `recordedFromWeek`.

**The Legacy on a (b) tree.** r4's adapter and G-P r2 both read a sibling root recorded from week B or later as absent
(`E/1359-stage/1359-p15c-wave2-reference-r4.patch:385-389`; `E/1361-stage/gp/1361-GP-probe-r2.ts:86-91`). On (b) the
root records from the current week, so a campaign that reaches 2040 freezes a Legacy whose market domain reads
`notRecorded`. The validator's re-derivation keeps reading `null` after B (r4 :704-716), which matches. A (b) campaign
past B keeps that frozen `null` under (c). One short of B records the market from its first (c) week.

**Advice: restore 1361-F ruling 13's original Retune path.** 1361-F2 ruling 3 rested on (a) and (b) failing
validation at the first release, and D1 removes that. The original path keeps `sharedMarket` at Save45 and avoids the
fallback's second save step, its new capture and the re-pin of the two capture leaves, which pass at (b). (c) later
needs no step. The conditions:
1. The parent adopts D1 by name. 1355-A §8 item 5's (b) had no tick write.
2. The 44 1355 leaves red at (b) are declared by name from `X/r2b/p15a1.json` as waiting for (c), as ruling 11's
   original text asks.
3. If P15C joins that landing, its production is rebased on (b) and dry-run there, and G-P runs on that tree, as
   ruling 13 already asks. The ruling accepts that a campaign reaching 2040 on a (b) build keeps a Legacy with no
   market lens.
4. F3's guard, or a statement in the landing record that a (c)-era save must not be opened by a (b)-only build.
5. The retuned (c)'s new G2 reads K3 with F1's ruling in place.

### 4. The market validator at (c)

Correct.
- **Shape.** Root exact keys, `version`, `recordedFromWeek` in [0, tick], an array, and no row without an industry
  (MI:131-140). Per row: exact keys, field types and reason shapes (MI:144-165). `ROW_KEYS` and `REASON_KEYS` are
  listed in code-unit order, which `sameKeys` needs.
- **Era.** `Object.hasOwn(LAWS, row.definitionVersion)` (MI:166) refuses `constructor`, `__proto__` and `toString`:
  `LAWS` is a literal with one own key (MI:109). The digest binds each row to its era (F6).
- **Phase lookup.** `P15_PHASE_TABLES[row.phaseOrderVersion]` through the import binding (MI:11, :168), after a
  safe-integer guard (MI:157), with a missing entry refused (MI:169). Under the Ph mock the validator sees v2, while
  `p15PhaseTriple` writes from the module's own v1 table, which 1355-F5 allows for a writer.
- **Ascent.** Strict `(week, releaseId)` with plain `>=` (MI:177-179), the comparator the law sorts members by
  (`sharedMarket.ts:366-368`, :395-397). So `reconcileLaw`'s positional comparison (MI:232-236) lines up row for row.
- **The film bijection** (MI:192-215). Its keys match the batch's. Rival films carry `filmId: p.id` and the concept's
  genre (HT:420-421), the only writer of `simulation/v1` films. Player films key on `productionId`, with the genre from
  `state.concepts`, which no code prunes. The size shortcut at MI:212 is sound: rows are distinct, and each maps to a
  film.
- **The law reconciliation** (MI:220-247). Its window test matches the batch's (MI:226 against MI:47), and its
  exposures come only from stored rows, as the live batch's do.

### 5. The witness and the factor at both call sites

Correct.
- **The sites.** Player inputs take `frozenFactor` (TK:623), which throws for an unfrozen release (MI:84-88), and the
  inputs reach only `resolveReception` (TK:636). Rival releases take the map (TK:947; HT:415-416). `FilmResult` keeps
  `{opening, total}` (RC:847-866), so the assessment alone records the factor.
- **The witness.** `frozenRivalMembers` (HT:341-352) runs before any rival work and before the no-industry return
  (HT:368), matching the map's keys to every rival picture at remainingTicks 1. The per-studio check (HT:404-407) runs
  for every business, since the loop (HT:380) never skips one. Together they make the studios sum to the batch. At (c)
  the 1356 harness ran both for 6,240 weeks without a throw.
- **P = 0.** f(0) = 1 exactly, the factor multiplies where 1.0 did, and the critic draw precedes the seam. K2 measures
  it at (c).
- **K1.** See F1. The pass holds for week 21 on seed `p15a1-w2-market-03` and depends on that week holding no market
  case.

### 6. Determinism and per-tick cost

- **Deterministic by reading.** The law draws nothing and sorts members by plain `<`. Exposures come only from the
  stored root (MI:43-51). The witness sorts its ids, and the append stores the law's order. RED 13's in-flight save
  and replay passes at (c), and the harness's final validation re-derives every assessed week from stored rows. G2's K5
  measures two full runs.
- **Cost.** See F5.

### 7. Readiness for P15C

Ready. Each extension is one edit in one place.
- `P15_ROOT_KEYS` (:10871): add `campaignLegacy: true` inside the literal. R1 then forces `P15StepRoots` to match.
- `P15_DOWNGRADE_REFUSALS` (:10888-10893) holds the market, then the ranking. P15C appends the Legacy last, as 1361-F
  ruling 4 orders.
- `P15_SEQUENCED_ROOTS` (:10909): add `campaignLegacy`.
- `validateSaveV45` (:10966-10968): the Legacy validator goes before `validateP15Allocator`.
- **Tick order.** The market rows take the tick's first numbers at finalize (TK:1131), the ranking record wraps the
  last expression (TK:1179-1180), and P15C's freeze wraps that, as 1361-F ruling 9 and 1355-F2 item 2 order them.
- **Shape.** r4's adapter reads each row's `releaseId`, `studioId`, `week` and `factor` and the root's
  `recordedFromWeek`, all of which (c) writes. The 1359 leaves that count new rows per tick
  (`tests/p15c2-campaign-legacy-integration.test.ts:676-695`, :881) count whatever the allocator handed out, so market
  rows do not break them.

## What I read and ran

- **Records.** 1361-F (rulings 1-13, the rest skimmed), 1361-F2, 1361-F3, 1361-R Parts 0 and 1.2, 1361-E2, 1361-E
  (from its extension points to the end), 1361-D, 1361-X2, 1361-G2-D (the K rows), 1361-G2-F, 1355-A, 1355-F, 1355-F2,
  1355-F4, 1355-F5 and 1355-F6.
- **Code.** The diffs r1 to r2, r2 to (a), (a) to (b) and (b) to (c); MI in full at (c); the seam in RC; TK from step
  2 to step 3 and from finalize to the return; HT's witness and release; the talent market's reads and settlement
  writes; `releaseCareers.ts`; the d16 driver and spec; the UI autopsy; the Legacy reference r4's adapter and validator
  (:370-560, :696-790); and G-P r2's `siblingBefore`.
- **Tests.** T's K1 and K2 leaves (:414-475), the route helper's `kRoute` and `k1AllowedPaths`, and the 1359 leaves
  that read market roots or count rows.
- **Fixtures.** Only `tests/fixtures/p15/p15a1-market-pins/MANIFEST.json` and `k1-post-tick-week-21.json.gz`, decoded
  in memory by python3. Its sha256 matched the MANIFEST.
- **Measurements.** X/r1, r2s, r2b and r2c: `run.meta`, the three tsc outputs, and the vitest JSON and txt, compared
  by python3 that only read files.
- **Tools.** Shell readers, `/usr/bin/grep`, `shasum`, and python3 reading files. No node, vitest, tsc, npm, npx, tsx
  or vite-node ran.
- **Git in the tree:** `log`, `show`, `diff`, `ls-tree` and `cat-file`. **Git in the real repository:** `rev-parse`,
  `log --oneline`, `ls-tree` and `ls-files`.

## Deviations, disclosed

- My first command in the tree ran `git rev-parse HEAD` and `git branch -a`. Both only read refs, but they fall
  outside the tree's listed verbs. No `status`, `add`, `commit` or `checkout` ran anywhere, and I wrote nothing in the
  tree or in the real repository.
- I wrote two ls-tree listings in my scratchpad for the oracle comparison, and this review.
- I read nothing under `/Users/zacheryspector/studio-scratch/1361-g2/`.

## Evidence limits

- No test or type gate ran for this review. Type and behaviour claims rest on reading and on the parent's dry runs.
- F1's likelihood on G2's routes is a reading, not a measurement. F2's failing leaves are a reading of the d16 spec,
  which did not run.
- (a) alone was never measured. Its claims rest on reading and on (b)'s measurement, which contains it.
