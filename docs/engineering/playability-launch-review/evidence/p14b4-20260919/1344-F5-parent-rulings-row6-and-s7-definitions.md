# 1344-F5: parent rulings on S10 row 6 and on the §7 verification's open definitions

Inputs:
- [1344-X10](1344-X10-s10-probe-results.md): row 6 is attributed to shelving with a premise conflict;
- the §7 kit's `NOTES.md` (scratch `/Users/zacheryspector/studio-scratch/1344-s7/`, 20 items that charter §7 leaves
  undefined).

These rulings decide method only. They set no gameplay law and no thresholds.

## Part A. Row 6 (`p14b5-relationships:365-372`, three leaves)

The three leaves passed at 1338. Their frozen witness no longer exists because r01 shelves `script-0006` at week 208
(X10, R1-R5 true). The next r01 take, `film:12` at week 229, fails the leaf's witness conditions.

1. **A test-design revision under review.**
   - The test author replaces the frozen witness with one chosen by a declared, deterministic rule over the current
     chain's receipts: the first take that meets every condition the leaf already states.
   - The 40-tick guard does not widen, and the fixture does not change.
   - If no r01 witness satisfies the conditions inside the guard, the same rule may pick another rival of the same
     fixture inside the same guard.
2. **Declare, review, then probe.** The rule and the expected witness are pre-declared in the S10 form: the assertion,
   the chain, the predicates and a probe. An independent review checks the declaration before the probe runs. Only a
   verified witness is pinned.
3. **If no lawful witness exists** in the fixture inside the guard, the three leaves stay failing with their X10
   attribution. The sweep's closure carries them as a declared exception for the Owner: the shelving law removed the
   natural premise these leaves were written against.

## Part B. §7 definitions (numbered as in the kit's NOTES.md)

### Measures

1. **Retries.** The primary measure is state-changing retries: viable (greenlit), and economic rejection with
   `retryWeek` advanced. Cash-blocked retry attempts from the decide-diag are a secondary measure. Staffing-blocked
   retries are unobservable through public exports (`hollywoodTick.ts:225`); the report says so.
2. **"Films again."**
   - Primary: the first take (`firstTakes`) at or after each shelving's processed week. 1329's stall was a stop in
     filming.
   - Also reported: the greenlight and the release, per shelving and per studio from its first shelving.
   - A same-week greenlight counts.
3. **Industry films against 53.** Primary: `hollywood.films.length` at week 520 against 53. Also reported: films added
   from week 140, against 0. The old tree must reproduce 53 as an anchor.
4. **Shelvings per year.** Buckets of floor(week/52), the rival finance period (`hollywood.ts:44`), plus the most in any
   52-week window, which 1344-F Amendment 3 bounds at four by law.
5. **Cash, films and `firstTakes` per studio.**
   - The 10-week series to week 520 and the week-520 value.
   - `firstTakes` split by `studioId`.
   - Films follow 1329's rival-economy definition, authored films included.

### Horizon and numbering

6. **The 520-week horizon.**
   - 1329's lines stay verbatim for the byte comparison.
   - §7 measures processed weeks 0-519 and the state at tick 520.
   - The fifth rival entering at 520 is listed and excluded from per-studio judgements, because it has no history.
7. **Week numbering.** Events take their receipt week and divergence takes the tick, as the kit does. The first
   difference is expected at the first shelving's week plus one.

### Controls

8. **Control (a).**
   - The control is the leaf as landed: 1344-F3 ruling 4, the week-93 key-sorted state equal byte for byte to the
     genuine e62c944f mint, with identical receipts.
   - The kit's per-tick comparison against ff803032 (`firstDifferentTick`) is a supplementary report. It must show the
     first difference at the first shelving's week plus one.
9. **Control (b).** Both readings are required.
   - (i) Campaigns with no rival industry (`hollywood` null) on both corpus routes, byte-equal across trees.
   - (ii) Over 520 weeks on every candidate route: no shelving receipt names the player, and no shelving key appears on
     the player's development.
10. **Control (c).**
    - Exact equality of every rival account across trees at each route's first shelving.
    - The kit's derived checks at every later shelving.
    - Any positive movement other than studio revenue is listed with its kind and delta, and the parent attributes it.
11. **Control (d).** Two separate vitest processes. The five outputs, the key-sorted final state included, must be byte
    identical.

### Rows

12. **The C8 rows.**
    - §7 re-runs the 42 rows of 1338-I's C8 cluster.
    - `bridge-p14b2-trust:363`, filed under C1 by 1338-I, is carried as a separate natural-route row: reported, and not
      counted in the 42.
13. **The seven UNRESOLVED rows.**
    - §7 adopts 1344-X10's attribution for S10 rows 1-4. Those probes ran on the candidate source and on 1338's source,
      with every gate true.
    - §7 re-runs and attributes the other three.
14. **The standard for "attributed".**
    - A row is attributed when its own chain, run on the candidate and on 1338's source, meets three conditions: it
      reproduces both recorded values (anchors); its state is equal up to the first shelving; and its first moved value
      comes after that shelving and is explained by its receipts.
    - A row whose chain and primary are unchanged across sources keeps its retained cause.
    - Anything else stays open with its measured cause.

### Sources and baselines

15. **The candidate.** The candidate's `src` must equal the sweep's landed HEAD: shelving plus the pure P15 modules over
    ff803032. If production that changes behaviour lands first, §7 stops and the parent re-plans. The queue already
    puts §7 before P15 Wave 2 production.
16. **The decide-diag.** The kit's chooser-spy reproduction, with its self-check against 1329's recorded window, is
    accepted. The 1329 bisect is not re-run.
17. **The 1329 probe defect.** The probe stays verbatim for the byte comparison. The report records the player's issued
    promises and proposals to show the defect is inert.

### Scope and thresholds

18. **Natural routes.** Divergence, movements and attribution cover all four seeds: p13a-core-causal-01, seed-b,
    `p13b-s8-bridge-probe-01` and `p13-public-commercial-adoption`.
19. **Gates.** §7 adopts the sweep's recorded core and UI gates (1344-N step 3, which precede §7) and runs none of its
    own.
20. **Thresholds.**
    - None. The report measures, attributes, and lists for the Owner, without judgement, any behaviour that may concern
      them: retries that never succeed, shelved lists that only grow (v1 has no pruning, 1344-E finding 4), and rival
      cash below zero (P15B scope).
    - These are observations, not failures.
