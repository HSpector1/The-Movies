<!-- 1344-D3: re-review (contract-auditor, read-only) of shelving RED r3, saved verbatim by the parent from the agent's final text -->

# Independent review 1344-D3

**Verdict: ACCEPT**

Re-review of the r3 shelving RED revision (`$E/1344-stage/1344-shelving-red-r3.patch`, sha256
`5450bf08…`, tests-only, full diff vs BASE) against the production handback (1344-E, PARTIAL 44/51),
the parent's rulings (1344-F3), the new genuine week-93 input (1344-P2), and the parent's dry run
(1344-X6: 46 fail/5 pass at RED alone; **51/51** over production step 5). I read all seven corrected
leaves directly in the r3 patch text, the r3 classification JSON (51 rows), 1344-E's own probe-based
diagnosis, 1344-C3's revision record, and independently verified the new week-93 fixture's
provenance/MANIFEST on disk and the 1344-P→1344-P2 producer diff. I also independently confirmed the
one load-bearing source fact behind check 2 by re-reading `hollywoodTick.ts`'s `decide()` directly.

## 1. All seven corrections match 1344-F3 and keep (or increase) assertion strength

I traced each correction from 1344-E's diagnosis → 1344-F3's ruling → the actual r3 patch code, and
confirm all three agree and that none loosens an assertion:

1. **Stalled route** (`tests/p14d1-rival-shelving.test.ts:351`, patch line 893): filter tightened
   from `scriptProjectId` alone to `r.studioId === receipt.studioId && r.scriptProjectId ===
   receipt.scriptProjectId` — closes a real cross-studio ID-collision gap
   (`canonicalScriptProjectId(ordinal)` repeats per studio), strictly more precise, not looser.
2. **/3. Staffing-blocked / mixed-sequence** (`:376-436`, `:483-521`): construction corrected from
   "remove one actor" (insufficient — `staff()` runs before `decide()` in the same weekly pass and
   re-hires before `decide()` reads the roster) to "remove one actor **and** drive cash to
   `rivalWeeklyOperatingCost(pre-removal) * reserveWeeks + 1`," which fails the re-hire's own
   affordability gate. Both leaves *add* a `chooseIndustryPackage` spy asserting zero evaluations, on
   top of the pre-existing count-holds-flat check — a strict addition, not a substitution.
4. **Viable control** (`:554-622`): the week-100 comparison was unsound by construction (the
   candidate's own first shelving lands at week 93, before week 100). Replaced with a new genuine
   week-93 input (1344-P2) and a premise now asserted from the candidate's own receipts (zero
   `screenplayShelved` through week 93, at least one within a bounded 16-tick search after) — never a
   hard-coded week.
5. **Promise guard** (`:842,850,863`): all three shelved-receipt checks now filter by `studioId ===
   RIVAL_R01 && scriptProjectId === scriptProjectId`, closing the same class of gap as correction 1 (a
   different, lawfully-shelving screenplay the same week could otherwise break or falsely satisfy the
   guard).
6. **Opportunity paths** (`:923-943`): the leaf now calls the file's own `markShelved(...)` before
   quoting `promiseFeasibility`, and asserts the route premise (`activeScriptOrdinals` no longer
   contains 6) first. This *strengthens* the leaf — previously it quoted an unshelved, still-active
   project, which the r3 record itself correctly flags as a weak, "could-be-vacuous-risk" RED.
7. **Chart output** (`:966-977`): expected value corrected from `produced` count alone to
   `producedCount + authoredCount`, derived directly from `state.hollywood.films` using the same
   predicate the real validator uses (`provenance==='authored-start/v1'` unconditionally, or
   `'simulation/v1'` with `result.releaseTick` before the observation week), with an explicit premise
   check (`authoredCount===2`). This is a correction to match pre-existing, unrelated validator law, not
   a shelving-specific loosening.

## 2. Staffing-blocked construction: the spy is load-bearing, not decorative

I independently re-read `hollywoodTick.ts:200-230` (`decide()`) and confirmed the structural fact the
correction relies on: `chooseIndustryPackage` is called **only** inside
`if(director&&actors.length===3&&craft)` — when staffing fails, the chooser is never invoked at all.
This matters because, per the charter (§3.1), both `staffingBlocked` **and** `cashBlocked` leave the
rejection count unchanged — the pre-existing count-flat assertion alone cannot distinguish which
blocked reason occurred. The added `vi.spyOn(hollywoodPolicy,'chooseIndustryPackage')` assertion
(`expect(evaluated,...).toEqual([])`) is therefore the only thing that actually proves this is a
**staffing**-blocked week rather than a cash-blocked evaluation of the package: `cashBlocked` requires
the chooser to be called and have its candidates skipped internally, while `staffingBlocked` means the
chooser is never reached. The reserve-plus-one cash construction is reasoned soundly in-line (hiring
can only raise, never lower, the weekly operating cost the reserve is priced from, so a re-hire's
`reserveAfterOffer` is never below the pre-removal reserve) and is independently confirmed twice: by
the production writer's own probe P2 (1344-E §5.2) and by the parent's GREEN dry run over step 5
(51/51, including these exact two leaves). Answer: **yes**, the spy genuinely proves no package is
evaluated, and it closes a real discriminating gap the r2 version left open.

## 3. Week-93 control: sound, compares all content, matches the save-level notion of byte identity

- **Premise asserted from receipts**: `expect(shelvedReceiptsOf(state.hollywood!.receipts),...).toHaveLength(0)` before the comparison, and a bounded 16-tick forward search confirming a receipt appears afterward — never a hard-coded week, matching 1344-F3's ruling 4 exactly.
- **Canonical comparison compares all content**: the `canon()` helper recursively sorts object keys (preserving array order) before `JSON.stringify`. This normalizes only key-insertion order and IEEE754 `-0`/`0` — both provably immaterial to persisted content (`JSON.stringify(-0)==="0"`, confirmed both by the test's own comment and independently by the parent's probe, `1344-X6-negative-zero-probe.ts`). Any real value, key, count, or shape difference still fails the check exactly as `toEqual` would. I verified this is not a loosening: the comparison is strictly *content*-preserving, only order/sign-of-zero-agnostic.
- **Equals the save-level notion of byte identity**: since the game's own save format is JSON-serialized, whatever normalization plain `JSON.stringify` performs (key order aside) is exactly what a real `exportSave`/`makeSave` byte comparison would also perform — the canonical-JSON method is a faithful proxy for "byte for byte at the save level," not a weaker substitute. (Minor non-blocking note below on a simpler available alternative.)
- **Producer change scope**: I diffed `1344-P2-save42-week93-producer.ts` against `1344-P-save42-rival-stall-producer.ts` line by line myself. The only differences are exactly `WEEKS` (`[100,130]`→`[93]`), `OUTPUT` directory, the provenance `record`/`plan`/`finding`/`producer` metadata fields, and the removal of a week-130-specific stall assertion that is a direct, necessary consequence of the week-list change — nothing else. This matches 1344-F3's claim ("1344-P with the week list, the output directory and the record fields changed, and nothing else") exactly.
- I independently read `tests/fixtures/p14/genuine-v42-pre-shelving-week93/MANIFEST.json` on disk: gzip 109886 bytes/`14c41c2c…`, decoded 985487 bytes/`c13fb767…` — these match both 1344-F3's stated pins and the test loader's hard-coded `manifestPin93()`/`week93Raw()` pins exactly (`tests/p14d1-rival-shelving-fixtures.ts:69-87`, patch lines 69-87). No fabricated provenance.

## 4. Every corrected leaf still fails at RED for the right reason

Cross-checked the r3 classification JSON's seven revised rows against 1344-C3's own table and the
parent's dry run (1344-X6: 46/5 alone). Six of the seven corrections don't move the RED failure point
at all (they fail on the same earlier missing-export/missing-field premise as before, since the
correction only affects logic reached *after* GREEN exists) — this is expected and correctly
documented as "unaffected by the fix (not reached)." The one exception, `opportunity paths`, now fails
on a **stronger** premise (`REASONABLY_ACHIEVABLE` vs `IMPOSSIBLE` on a project actually shelved by
`markShelved`, rather than on an untouched project) — exactly the intended improvement. No corrected
leaf passes vacuously at RED.

## 5. Hand-built state — validator-lawful, confirmed to survive the next tick

Only corrections 2/3 introduce a *new* hand-built state element (`cash: reserve+1`, layered on the
pre-existing actor-removal mutation); this is a scalar field change with no index/ordinal
inconsistency, and — critically — its ability to survive real ticking without producing an invalid or
crashing state is not merely asserted but **empirically proven twice**: the production writer's own
probe (1344-E §5.2/5.3) and the parent's independent GREEN dry run (51/51 over step 5) both exercise
this exact construction through real `tick()` calls and pass. Correction 6 reuses the `markShelved`
helper, already confirmed validator-lawful in my 1344-D2 review (§5) and re-confirmed here by its
route-premise assertion (`activeScriptOrdinals` no longer contains 6). No leaf bypasses index/ordinal
invariants.

## Non-blocking notes

- **The -0 root-cause correction (1344-X6) doesn't require a test-code change.** 1344-C3's in-line
  comment (patch lines ~1124-1133) still attributes the divergence to unrelated P15A code baked into
  the fixture's mint HEAD; the parent's probe (`1344-X6-negative-zero-probe.ts`) shows this is wrong —
  the `-0` values arise from ordinary live arithmetic (`careerEvents[...].genreExpBefore`,
  `talent[...].genreExperience...perceived`) regardless of which unrelated modules are present, and
  the fixture's mint HEAD is otherwise clean. The *fix* (canonical JSON comparison) is unaffected and
  correct either way. Worth a documentation-only follow-up so a future reader doesn't repeat the
  debunked diagnosis; not a defect in this revision.
- **A simpler, already-precedented alternative existed for the week-93 comparison.** This same test
  suite elsewhere establishes byte-identity via `exportSave(makeSave(...))` string equality (e.g. the
  save/load mid-count leaf). Using that same pattern here (on the stripped states) would have avoided
  hand-rolling a canonical-JSON comparator and made "byte for byte" literal rather than a proxy. The
  chosen method is not incorrect — just more custom than necessary given the precedent already in the
  same file.
- Corrections 2/3's "also independently tightened" post-restoration receipt filter (same studioId+scriptProjectId fix, not one of the seven named) is a reasonable, disclosed, same-cause bonus fix — confirmed consistent with correction 1's reasoning.

## Next concrete action

No further RED revision needed. The two parallel next steps named in 1344-X6 — this re-review (now
complete, ACCEPT) and the implementation review 1344-J of the five production steps — can both
proceed; per 1344-E's own next-steps list, the 1344-M Save43 sweep and the §7 natural-route
verification follow after.

## Files referenced

- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-stage/1344-shelving-red-r3.patch`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-stage/1344-shelving-red-r3-classification.json`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-E-shelving-production-handback.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-F3-parent-rulings-on-1344-E.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-C3-shelving-red-revision.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-X6-shelving-red-r3-dry-run.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-X6-negative-zero-probe.ts`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1344-P2-save42-week93-producer.ts` (diffed by hand against `1344-P-save42-rival-stall-producer.ts`)
- `/Users/zacheryspector/The-Movies-headless-program/tests/fixtures/p14/genuine-v42-pre-shelving-week93/MANIFEST.json` (pins independently re-read and matched)
- `/Users/zacheryspector/The-Movies-headless-program/src/core/hollywoodTick.ts` (lines 200-230, re-confirmed the `actors.length===3` gate that makes the staffing-blocked spy load-bearing)
