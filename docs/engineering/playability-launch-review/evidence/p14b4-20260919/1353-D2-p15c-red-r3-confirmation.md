<!-- 1353-D2: verbatim final text of the independent RED confirmation reviewer (contract-auditor), saved by the parent on arrival. -->
# Independent review 1353-D2

**Verdict: ACCEPT**

Confirmation pass on `1353-stage/1353-p15c-red-r3.patch` (cumulative vs BASE `37d70170…`) against `1353-C3-p15c-red-review-fixes.md`, `1353-F3-parent-response-to-1353-D.md`, and the charter chain (`1353-A`, `1353-F`, `1353-B`, `1353-F2`). No blocking defects found. All three items from my prior REFINE (`1353-D`) are correctly closed.

## Blocking defect from 1353-D — closed, re-verified independently

**Audience-institution qualifying cardinality.** I independently re-derived the decade partition `decade = floor((1920 + floor(week/52)) / 10)` from the charter's own formula (1353-F §5.3 amendment 3, "Amendments to §5.3" item 3) against `ALLSTAR_WEEKS = [10,20,25,530,540,1060,1070,1580,1590,1595]` at patch line 1163. Result: decades `{192: weeks 10/20/25}, {193: 530/540}, {194: 1060/1070}, {195: 1580/1590/1595}` — matches the handback's table exactly. Since every film in `buildAllStarFacts` carries `audienceScore: 80` uniformly (line 1179), every within-decade tie resolves purely by the charter's common tie-break, which I confirmed is real text at `1353-A-p15c-finale-legacy-charter.md:154`: "Ties in a list go by release week, then ID (`<`)." Applying it: decade 192 → earliest week 10 → `A1FILM-0`; 193 → `A1FILM-3`; 194 → `A1FILM-5`; 195 → earliest of 1580/1590/1595 → `A1FILM-7`. The strengthened leaf (patch lines 1281–1286) asserts exactly `qualifying.length === LEGACY_AUDIENCE_MIN_DECADES` (4), the set `{A1FILM-0, A1FILM-3, A1FILM-5, A1FILM-7}`, and `contrary === []`. I confirmed `contrary` must be empty: `LEGACY_DECADE_MIN_RELEASES=2` and `LEGACY_AUDIENCE_LIKED_MIN=57` (charter §5.5, lines 190/193) are both cleared by every decade here (2–3 releases each, all liked at 80), so there is no eligible-but-unliked decade left to produce a contrary ref. This closes exactly the gap I found in `1353-D` (a wrong "push every liked film" implementation would have produced `qualifying.length === 10`, now caught).

## Note 1 (N−1 vs N for every MIN threshold) — closed, isolation verified

Read all four new leaves (patch lines 820–917). Each isolates only the named constant:
- `audience-institution` (line 820): 3 vs 4 decades, all liked at score 80 (clear of the "exactly half" edge `amendment-1` already owns) — genuinely fails only on decade count.
- `genre-specialist` (line 853): all-comedy fixtures at `n=7` vs `n=8` — majority is 100% both times, so only `n ≥ LEGACY_GENRE_MIN_FILMS(8)` is under test; non-vacuous (a wrong implementation ignoring `n` would pass both).
- `commercial-engine` (line 872): `h=4` vs `h=5`, all settled hits at 100% share both times — isolates `h ≥ LEGACY_MIN_FILMS(5)` only, since `s=h` here makes the share clause trivially true regardless of `h`.
- `talent-foundry` (line 894): `creditedCampaign` (line 776) gives each person exactly `LEGACY_FOUNDRY_MIN_CREDITS(10)` credits independently; 2 vs 3 people is the only variable — isolates `LEGACY_FOUNDRY_MIN_PEOPLE(3)` cleanly, and the `qualifyingCount` convention (2 and 3, reported even at `notHeld`) matches the pre-existing `artistic-voice` N−1 leaf's convention.

All four expectations match the charter table (1353-A:160-165) and each N−1 case is non-vacuous for the stated reason.

## Note 2 (GUARD_TIMEOUT_MS) — closed, diff-verified

I line-diffed `1353-stage/1353-p15c-red-r2.patch` against `r3.patch` for `tests/p15c-wave-r-retention.test.ts` myself (I did not rely on the handback's stated hash, which I cannot recompute without shell access). Lines 102–317 of r2 and 119–334 of r3 are byte-identical (`byId`, `describe`, all six `it()` bodies). The only differences are the header prose (r2 lines 1-60 → r3 lines 1-77, adding the 1353-D/1353-F3 rationale) and the constant itself: `120_000` → `180_000` (r2:78 → r3:95). Every guard still `await campaignRun()`s as its first statement (confirmed for all six). On honesty of the 180s figure against the 189.9s isolated-under-load number: the header (r3 lines 67–77) explicitly discloses both numbers and explains the isolated figure comes from a different, cost-repaying methodology not representative of the real six-guard run — the same reasoning `1353-D` itself already used to clear `120,000` as "not dishonest" despite the larger gap to 189.9s. `180,000` is strictly safer than what was already accepted. Not a defect.

## Classification / no-vacuous-pass / no-production-code

- `1353-stage/1353-p15c-red-r3-classification.json`: manually counted 72 rows (6 `control-passes` + 66 `fails`), matches the handback's claim exactly. All 4 new leaves present with correct `redStatus: fails` / `Module-load failure`.
- Cross-checked against the parent's Part B dry run in this record's own prompt (66/66 fail, 65 on module-load, 1 on `tuning-legacy-bounded-terms`'s value mismatch) — the classification JSON's per-leaf reasons reconcile exactly (65 entries read "Module-load failure…", one reads the genuine `TUNING` mismatch). No discrepancy.
- Patch diff headers confirm only two files touched, both under `tests/`: no production code (`src/…`) in the patch.

## Evidence limits (read-only role)

No shell access: I did not execute `vitest`, `tsc`, or `shasum` myself. My confirmation rests on direct source reading of both patches (byte-level diff done by inspection, not tooling), the charter text, and the parent-supplied dry-run/classification artifacts, which independently reconcile with each other. This is sufficient for a source-and-derivation review; it is not a native test execution.

## Next concrete action
None blocking. Release `1353-C3`'s RED suite to Wave 1 production (`src/core/campaignLegacy.ts`) per `1353-A` §10, as `1353-D`'s original "next action" already anticipated once this one assertion landed.
