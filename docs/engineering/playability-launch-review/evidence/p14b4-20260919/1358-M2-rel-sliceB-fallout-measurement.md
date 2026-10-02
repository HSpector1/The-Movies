# 1358-M2: slice B production fallout, measured in scratch (step 4 r2 on the landed RED)

[1358-F7](1358-F7-parent-rulings-on-1358-E.md) Next 4 and [1358-F8](1358-F8-parent-response-to-1358-J.md) ruling 5
ordered this measurement. It runs the whole suite and the four §7 natural routes on HEAD 5245072a plus production
step 4 r2, with no test edit. It gives the sweep ([1358-N](1358-N-save44-pin-sweep-plan.md)) its fallout list.

**Every failure outside the 1348 baseline traces to a Save44 or projection-57 pin, a shared helper's pin, or a known
environment row.** The natural routes keep every §7 measure. Outside the relationship root, each final state equals
the slice A run's byte for byte.

## How it ran

- **Script.** [run-1358-M2.sh](1358-stage/m2/run-1358-M2.sh), alone in the heavy lane under `HEAVY-LANE-LOCK`, on
  2026-10-02 from 02:48:24 to 04:35:16 CDT, Node v20.20.2 ([m2-meta.txt](1358-stage/m2/m2-meta.txt)).
- **Tree.** An archive of HEAD 5245072a (RED r8 at 650e963a, capture minted at 4ad8e0f7) with step 4 r2 applied (sha256
  2004b500…). `docs`, `node_modules`, `art`, `tools` and `tests/fixtures` were linked, and nothing was written under a
  link.
- **Order:**
  1. the three type gates;
  2. both generator checks;
  3. core over the 440 files of [core-list.txt](1358-stage/m2/core-list.txt): 1348-M's 435 plus slice B's five RED
     files;
  4. UI;
  5. the four §7 natural routes with the 1344-s7 kit, runs `m2-*`.
- **Attribution:**
  - [1321-I-attribution.py](1321-I-attribution.py) and [1317-I-attribution.py](1317-I-attribution.py) read the raw
    outputs;
  - [1344-I-compare.py](1344-I-compare.py) compares them with [1348-I](1348-I-core-failures.json) (85 core
    identities) and [1348-I2](1348-I2-ui-failures.json) (3 UI rows).

## Type gates and generator checks

- **Type gates.** Root, UI and Bridge give exactly 1358-X5's step-4 errors: 46, 2 and 2, all in test files
  ([m2-tsc.txt](1358-stage/m2/m2-tsc.txt)).
- **Generator checks.** `check:bridge-contract` and `check:bridge-contract:fixtures` both exit 0.

## Core: 879 failed, 4,162 passed, 39 skipped, 11 todo (5,091)

Against 1348-I: **SAME 71, CHANGED 14, NEW 795, GONE 0** ([m2-core-vs1348I.json](1358-stage/m2/m2-core-vs1348I.json)).

- **The NEW rows by first message:**

| Kind | Rows | Source |
|---|---:|---|
| `expected 44 to be 43` | 353 | live-version pins, most in shared helpers (`acceptedEvidence`, the history-boundary and second-episode pins) |
| `validateSaveV43: expected version 43` | 302 | the frozen V43 validator on a live envelope (S1) |
| projection 57 against 56 | 40 | P1 |
| `competitions is missing` | 21 | staged or minted edges without the new field (S6) |
| unknown saveVersion | 4 | S3 sentinels |
| Other Save44 or projection-57 kinds | 67 | roster sizes (P2), sentinels now refused by `validateSaveV44` (S3), live calls under `not.toThrow` (S1), strict V42 shapes (S6), whole-state comparisons (S5), C# and schema pins (P1), a shape control (S7) |
| `Fake Unity did not report …` | 7 | `bridge-supervisor`, the scratch-tree artifact of 1320-X |
| 30 s timeout | 1 | `bridge-runtime-worker` |

- **114 NEW rows sit in files without census rows.**
  - 105 fail at a shared helper's pin (`expected 44 to be 43`, or `validateSaveV43` inside the p14c2rm and p14c2c
    helpers), which group H edits. Among them are slice B's rows 59-61, the six `p14b10-mentor-label` leaves, and the
    `bridge-p14c2rm`, `p14c2c` and `bridge-p14c3` read-model files.
  - One is the suite-level failure of `contracts/v14-boundary-guards`, a G5 file whose identity carries the suite
    suffix.
  - The other 8 are the environment rows above.
- **CHANGED (14):**
  - Seven retained identities now stop at a Save44 pin before their 1348 primary: `bridge-p14b2-trust`, two in
    `bridge-p14c2rm-retirement`, `bridge-p14c3-runtime`, `p14c3-admission-boundaries`, and two in
    `p14c3-canonical-rival-history`. The sweep should restore each one's 1348 primary.
  - C20 (`p14c3-save-v38`) embeds the live version, which now reads 44 (1358-F9 ruling 7).
  - Six `r3n1-stale-schedule-take-02*` rows are C17 `ENOENT` rows. Each primary differs only in the scratch path.
- **What M2 decides for the sweep:**
  - **The four p14p4p5 S5 comparisons fail as expected.** They are `casting-reservation` Q20, `delayed-retirement` Q21,
    `queued-project-outcome` Q23 and `scenery-capacity` Q24. In each, the diff is exactly `"competitions": []` and
    `"romance": null` on every one of the 24 edges (48 changed lines). G6's per-file helper draft settles them
    (1358-F9 ruling 6).
  - **Most other measure rows go to the sweep dry run.** In this unswept tree their leaves stop at an earlier version or
    projection pin, so M2 cannot reach their comparisons or first guards.
  - **The `p14d1-rival-shelving` week-93 control fails** (census :561, assertion :604). The assertion compares whole
    canonical JSON strings, so this output cannot show whether the candidate holds a log row or a romance track besides
    the two new fields. A probe decides it before the follow-up unit edits it.

## UI: 16 failed, 2,676 passed, 5 skipped (2,697)

Against 1348-I2: **CHANGED 3, NEW 13** ([m2-ui-vs1348I2.json](1358-stage/m2/m2-ui-vs1348I2.json)).

- **CHANGED:** the three numpy rows of `authored-rgba-export`. Each primary differs only in the scratch path.
- **NEW:**
  - 8 are live-version pins in the five UI files of group G4.
  - 3 in `StudioCalendar.career` reach the `acceptedEvidence` pin through a shared helper.
  - `StudioLotScreen` "moves Hollywood keyboard focus …" is 1344-M2's pre-existing intermittent.
  - `WorldFirstAnnexConstruction` "keeps the semantic Annex context …" fails at :584 (`annexHostSelections`: expected
    1, got 2). Step 4 changes no `ui` file, so this is a candidate intermittent. The sweep dry run re-measures it.

## The four §7 natural routes

Each route ran 520 weeks with integrity 0. The comparison is with [1348-X7](1348-X7-rel-sliceA-natural-routes.md)'s
`h-*` runs, slice A at HEAD ([m2-routes-vs1348X7.json](1358-stage/m2/m2-routes-vs1348X7.json)).

| Route | ms (h, m2) | Edges | Log rows | Romance tracks | Open bonds | Edges that differ without the two fields |
|---|---|---:|---:|---:|---:|---:|
| p13a-core-causal-01 | 35,460, 25,823 | 30 | 0 | 15 | 3 | 0 |
| seed-b | 50,151, 44,586 | 32 | 0 | 18 | 5 | 3 |
| p13b-s8-bridge-probe-01 | 52,716, 43,857 | 42 | 0 | 26 | 4 | 0 |
| p13-public-commercial-adoption | 42,735, 37,487 | 33 | 0 | 18 | 4 | 0 |

- **Unchanged:**
  - `natural-chain.jsonl` and `rival-economy.jsonl` are byte-identical on all four routes;
  - in `s7.json`, only `meta` differs; industry films, studios, the player, the series, control C and integrity are
    equal;
  - outside the relationship root, each final state equals the h run's.
- **What moves:**
  - `weekly.jsonl` differs only in each week's state digest, from week 8.
  - No edge holds a log row at week 520 on any route.
  - seed-b's three changed edges (6, 18 and 23) each hold an open bond, formed at weeks 81, 117 and 171. Their closeness
    stays higher (91 to 95, 90 to 100, 94 to 100) through step 3's drift exemption for a bonded pair.

## Owed: the snapshot measurement (1358-F8 ruling 5)

The §7 probe builds no Bridge snapshot, so this run cannot answer 1358-J findings 11 and 12. A snapshot probe
(`/Users/zacheryspector/studio-scratch/1358-m2/snap/`) closes the gap. It reruns the four routes and builds the people
projection at every week, on the step-4 commit and on the base. It records each build's time and any thrown message.
It runs in the heavy lane after the sweep dry run 1358-X6, and its result is added here.

## Outputs

[1358-stage/m2/](1358-stage/m2/) holds:
- the type-gate, generator and UI outputs;
- the core output, gzipped (`m2-core.txt.gz`, 13,945,335 bytes raw);
- the attribution and comparison JSON;
- the route logs and the run script.

The route kit's own outputs stay in `/Users/zacheryspector/studio-scratch/1344-s7/out/m2-*`.
