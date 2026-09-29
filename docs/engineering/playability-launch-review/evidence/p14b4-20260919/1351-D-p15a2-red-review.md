<!-- 1351-D: independent review (contract-auditor, read-only) of the 1351 RED r2, saved verbatim by the parent at HEAD 66ea73c9 from the agent's final text -->

# Independent review 1351-D

**Candidate:** `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1351-stage/1351-p15a2-red-r2.patch` (`tests/p15a2-power-ranking.test.ts`, 895 lines / 30 leaves; `tests/p15a2-power-ranking-harness.test.ts`, 173 lines / 2 leaves — byte-identical to r1's harness file, confirmed by matching git blob hash `207cae3` in both `1351-p15a2-red.patch` and `1351-p15a2-red-r2.patch`), `1351-p15a2-red-r2-classification.json` (32 rows), handbacks 1351-C and 1351-C2.

**Verdict: ACCEPT**

No blocking defects. Independent recomputation of every worked example, rounding case, boundary and cap matched the suite's expected values exactly. Coverage of 1350-A §5 items 2–13/16 and all three 1350-F additions is present and load-bearing, not merely descriptive. The one control-passing leaf is legitimately classified. No vacuity path found for the specific wrong-implementation classes probed (ignoring CRITIC_SHARE, ranking unranked studios, skipping the band, mis-windowing, wrong tie direction, wrong rounding order, banker's rounding).

## 1. Coverage of 1350-A §5 items 2–13, 16 and 1350-F additions

All items MET WITH EVIDENCE except two minor, non-blocking gaps:

- Items 2–4, 6–13, 16: each has at least one directly-cited, arithmetic-backed leaf (verified independently below). 1350-F's three RED additions are all present: band boundaries at 12/13/25/26/cash≤0/zero-fixed-cost (`financial-strength-band-*` leaves, `tests/p15a2-power-ranking.test.ts` ~lines 208–251), the authored-pre-1920/`authoredPreCampaign` Releases exclusion (~line 481), and the founding zero-fixed-cost pin (~line 242).
- Item 1 (`rank-quarter-boundary`) and item 15 (`rank-persistence`): correctly out of scope per the brief (tick cadence / archive persistence are Wave 2). `isPowerRankingWeek` is tested as a pure boundary function only — appropriate substitution.
- Item 7's "RNG stream positions match the control": inapplicable — Wave 1 has no RNG by charter (§3: "uses no RNG"); nothing to test. Not a silent drop.

**Non-blocking gap A** — item 5's second clause ("swapping the IDs of tied studios swaps only their presentation order") is not literally tested. `compute-power-ranking-competition-ranking-1-1-3-and-presentation-order` (~line 579) proves studioId-ascending tie order once; `compute-power-ranking-id-and-owner-swap-symmetry` (~line 604) proves general relabeling symmetry but on non-tied facts. No single leaf combines both (tied pair + ID swap + presentation-order flip). The classification JSON's citation for this leaf (row 19) quotes the full item-5 text without flagging this sub-clause as unaddressed — a citation-precision issue, not a false claim about test content.

**Non-blocking gap B** — item 2's "release and settlement edges tested separately" is only partially realized: the window-tick edge (`compute-power-ranking-window-edge-release-tick-w52-counts-w53-excluded`, ~line 419) and the running/settled transition (`compute-power-ranking-running-film-counts-releases-only-then-films-next-snapshot`, ~line 444) are tested, but not combined at the same window boundary (e.g., an unfinished film released exactly at W−52). Given Wave 1 takes `runEndedByWeek` as an explicit caller-supplied boolean rather than deriving it, this is a minor completeness note, correctly not over-claimed in the classification (row 13 cites only the release-tick clause).

## 2. Independent recomputation

All checked and correct, no wrong expectations or loose tolerances found:

- Worked example (line ~442 area): reach = min(1, 450000/1000000/0.9) = 0.5; raw = 10×(0.5×0.6+0.5×0.5) = 5.5 → 55 tenths. Matches `filmsTenths).toBe(55)`.
- Rounding-order leaf (~line 320, `compute-power-ranking-filmstenths-mean-rounding-order-genuinely-fractional`): per-film tenths 55.49→55, 56.49→56, 58.49→58 confirmed. Method A mean(55,56,58)=169/3=56.33→56; Method B mean(55.49,56.49,58.49)=170.47/3=56.82→57. 56≠57 genuinely discriminates the two orders; matches the coordinator's own worked example.
- Half-up boundary leaf (~line 371): HALFEVEN mean(55,56)=55.5→56 (does not distinguish half-up from banker's). HALFODD mean(60,61)=60.5→61 — banker's rounding would give 60 (even), so this case genuinely pins true half-up. `roundHalfUp = Math.floor(x+0.5)` gives 61 for x=60.5 exactly (no float artifact, both operands exact binary fractions).
- Ranking 1-1-3(-4): ALPHA/ZEBRA 100pts tied→rank 1,1; MID 50pts→rank 3 (1+2 studios strictly greater); LOW 0pts→rank 4 (1+3). Presentation ALPHA,ZEBRA,MID,LOW correct (rank asc, studioId asc on tie).
- Caps: strong-film mean (80+70+60+50)/4=65 unaffected by a 5th (0-tenths) film; release cap 10×min(4,4)/4=100 and 10×min(5,4)/4=100 both correct; tie-break keeps 'D' over 'E' as the parent's adopted decision.
- Window edges: window=[52,104) at W=104; releaseTick=52 (W−52) included, 51 (W−53) excluded, 104 (=W) excluded — right-exclusive upper bound also correctly discriminated (a common off-by-one this leaf would catch).
- Eligibility: `available` false when originWeek(1) > week−52(0); true at exact equality (0===0). Entrant test: threshold W−52=52; EARLY/MID (enteredWeek 0) ranked 1,2; LATE(60)/ABLE(80)/ZOOM(70) unranked, and LATE's 125 points (highest in the cohort) correctly excluded from the ranked comparison — genuinely load-bearing, not just descriptive.
- Band thresholds: weeks=floor(cash/fixedCost); 12→strained, 1250/100=12.5→floor 12→strained (explicitly tests floor, not round), 13/25→stable, 26/100→thriving, cash≤0→inTheRed even at fixedCost=0, fixedCost=0 with cash>0→thriving. All arithmetically correct per 1350-A/F.

No wrong expectation or unjustified loose tolerance found anywhere in the exact-equality (`.toBe`/`.toEqual`) leaves; the only `toBeLessThanOrEqual`/`toBeGreaterThanOrEqual` uses are the harness's bounded-value checks and TUNING's range checks, both appropriately scoped (exact values are pinned elsewhere by fixture leaves).

## 3. Privacy test

`compute-power-ranking-no-private-balance-probe-cash-not-in-payload` (~line 729) checks the serialized snapshot does **not** contain `987654321` (probe cash) **and** does not contain `123456789` (probe `weeklyFixedCost`) — covers both fields named in the task's check. Since Wave 1's `RankingStudio`/row shape has no player/rival distinguishing field at all (verified against the brief's pinned types), "rival rows" and "any row" are structurally identical at this layer; a single studio labeled `'RIVAL'` is an adequate, non-arbitrary proxy. Honors/distress are separately confirmed `notRecorded` with an exact-key-set check (`ROW_KEYS`, ~line 767 area) that would also catch any accidental leaked numeric field riding along on a row. This privacy proof does not yet exercise an actual player-vs-rival Bridge-view context — appropriately, since that distinction doesn't exist until Wave 2.

## 4. Symmetry / determinism / finance independence

Genuine, not decorative:
- `compute-power-ranking-id-and-owner-swap-symmetry` (~line 604) swaps which literal ID string carries which fact set and checks the output follows the facts, not the label — proves no identity special-casing. Minor completeness note: the per-key equality loop checks `ranked, rank, filmsTenths, releasesTenths, pointsTenths, band` but not `releases`/`countedFilmIds`; not a real risk given the other checks, but slightly incomplete.
- `compute-power-ranking-determinism-byte-identical-two-calls` and the harness determinism leaf both JSON-round-trip-clone independent inputs and compare canonicalized (key-sorted) JSON — a legitimate, arguably stricter proxy for "byte-identical" than raw `JSON.stringify` since it's insertion-order agnostic.
- `compute-power-ranking-finance-independence-band-only` (~line 754 area) varies only cash/weeklyFixedCost, asserts the band moves (strained→thriving) while `ranked, rank, filmsTenths, releases, releasesTenths, pointsTenths, countedFilmIds` and row **order** are all unchanged for both studios — a real proof that finance affects only the band, including the "no band sort key" claim.

## 5. The control-passes leaf

`compute-power-ranking-standing-independence-no-standing-field-in-type` legitimately never touches the missing module — it is a fixture-shape structural check, explicitly flagged in both the handback and the classification JSON (row 22) with an honest statement of what it does and does not prove, and a pointer to the sibling production-dependent leaf that does fail at RED and is the actual load-bearing purity proof. This is exactly the disclosure the brief's own pitfall instruction requires. Legitimate.

## 6. Vacuity

Checked specific wrong-implementation classes against the suite; none pass:
- Wrong CRITIC_SHARE (e.g. 0.6) → fails the worked example (would give 56, not 55) and the half-tenth leaf.
- Ranking unranked studios → fails `compute-power-ranking-eligibility-entrant-unranked-lanes-shown-excluded-from-comparison` (LATE's 125 points would wrongly demote EARLY/MID's rank).
- Never computing band → fails `financialStrengthBand` boundary leaves directly (standalone exported function) and the harness's `BAND_LABELS.has(row.band)` check across 480 snapshots.
- Not window-filtering internally → fails the window-edge leaf, which passes in-window and out-of-window films in one call specifically to force internal filtering (this is a genuine, disclosed interpretation call by the test author since the API doesn't literally state who filters — reasonable and the only readable-as-testable interpretation).
- Off-by-one at the window's right edge (inclusive of W) → explicitly caught (`AT-W` film at releaseTick=W is asserted excluded).
- Averaging raw scores before rounding (Method B) → explicitly discriminated and rejected by the C2 leaf.
- Banker's rounding at .5 → explicitly discriminated by the HALFODD case.

## Blocking defects
None.

## Non-blocking notes
1. Add one leaf combining the release-tick window edge with an unfinished (`runEndedByWeek:false`) film at that same boundary, per 1350-A item 2's "settlement edges tested separately" phrase — currently split across two leaves that don't overlap at the boundary tick.
2. Add (or explicitly note as deferred to Wave 2) a leaf that swaps the IDs of a *tied* pair and confirms ranks stay `1,1` while presentation order flips — item 5's second clause is currently only implied by two separate, non-tied tests.
3. `compute-power-ranking-id-and-owner-swap-symmetry`'s per-key loop (line ~604 area) omits `releases`/`countedFilmIds` from its equality check; low risk, cheap to close.
4. Classification JSON row 19's requirement text quotes 1350-A item 5 in full without flagging that the tied-ID-swap sub-clause isn't literally exercised by that leaf — tighten the citation or add the leaf.

## Evidence limits
Read-only review (Read/Glob/Grep). RED execution results (30/32 and 29/30 fail counts, exact `TS2307`/`TS6133` error text, exit codes) are taken from 1351-C/1351-C2's reported command output; I did not re-run `vitest` or `tsc` myself (no Bash tool). Patch apply-cleanliness and git blob hash matching between r1/r2 harness files were verified directly by reading the patch files. All numeric expectations in the tests were independently recomputed by hand from 1350-A §3's formula text, not taken on trust from the test author's comments.
