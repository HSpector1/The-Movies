<!-- 1344-D: independent review (contract-auditor, read-only) of the 1344 RED, saved verbatim by the parent at HEAD 3abed41c from the agent's final text -->

# Independent review 1344-D

**Verdict: REFINE**

Scope: read-only re-review of the staged RED patch for the rival-shelving law and Save43
(`$E/1344-stage/1344-shelving-red.patch`, its classification JSON, the 1344-C handback, the
parent's independent dry run `1344-X2`/`1344-X-red-run.txt`), against authority `1340-O` D-1329-1,
`1344-A` (as amended by `1344-F`), and the RED brief. I read every line of the three new test files
and the shared fixture loader (via the patch text), the classification JSON (43 rows), the parent's
independently reproduced run log, the genuine fixture MANIFEST/provenance, and the existing
`chooseIndustryPackage`-spy precedent in `tests/helpers/p14p3-fixtures.ts`. I did not execute any
tests myself (no shell available to me); my confirmation that RED is genuine rests on the parent's
independent re-run (`1344-X-red-run.txt`, 67s wall time, 38 failed/5 passed), which I cross-checked
line-by-line against `1344-shelving-red-classification.json` and found to match exactly (same
failure texts, same 5 control-passing leaf names). I did not decompress fixture payloads; I read
only `MANIFEST.json` and the week-130 `.provenance.json`, whose sha256/byte pins match the loader's
hard-coded pins in `tests/p14d1-rival-shelving-fixtures.ts` exactly.

## Headline

This is careful, high-quality RED work. Every one of the 38 failing leaves fails for a documented,
verified, non-generic reason (mostly route-premise assertions or content-specific error-message
patterns designed to reject the "undefined function" TypeError that a naive `.toThrow()` would
accept vacuously). The 5 control-passing leaves are honestly classified and — I independently
verified this by reading their bodies — will genuinely discriminate a wrong retry implementation at
GREEN (below). Tests 1 and 11 are receipts-derived, not magic-week pins. The type-gate technique
does not create meaningful vacuous-pass risk for this suite's specific assertions. Two real,
already partly self-disclosed coverage gaps against 1344-A §6 keep this from being a clean ACCEPT.

## Coverage of 1344-A §6 (as amended by 1344-F)

| # | Requirement | Status | Where |
|---|---|---|---|
| 1 | shelving-stalled-route | MET WITH EVIDENCE | `tests/p14d1-rival-shelving.test.ts:135-199` (file-internal lines, patch lines 613-677) |
| 2 | shelving-blocked-weeks-hold | MET WITH EVIDENCE (staffing, running-production, mixed) / PARTIAL (cashBlocked sub-case, see Blocking 1) | `:202-319` |
| 3 | shelving-viable-control (Amendment 2) | MET WITH EVIDENCE | `:322-358` |
| 4 | shelving-commission-hold | MET WITH EVIDENCE | `:361-400` |
| 5 | shelving-retry (5 sub-bullets, Amendment 1) | MET WITH EVIDENCE, all 5 sub-bullets present | `:403-529` |
| 6 | shelving-promise-guard | MET WITH EVIDENCE | `:532-584` |
| 7 | shelving-feasibility-readers | MET WITH EVIDENCE for (a) unproducedScripts/digest and (b) impossible path; **MISSING** for (c) `authorRivalPromise` | `:587-627` (digest+path); gap disclosed `:586-594` |
| 8 | shelving-chart-output | MET WITH EVIDENCE | `:630-654` |
| 9 | save-v43-shelving | MET WITH EVIDENCE (migration, mid-count continuity, 5 validator rejections + control, 3 down-conversion refusals + control) | `tests/p14d1-rival-shelving-save-v43.test.ts` (whole file) |
| 10 | shelving-player-symmetry | MET WITH EVIDENCE (legitimate RED-time control) | `tests/p14d1-rival-shelving.test.ts:657-666` |
| 11 | shelving-natural-route (Amendment 3, 4 bullets) | MET WITH EVIDENCE, matches Amendment 3 exactly, no film-count pin | `tests/p14d1-rival-shelving-natural.test.ts:49-106` |
| 12 | determinism | MET WITH EVIDENCE | `tests/p14d1-rival-shelving-natural.test.ts:116-121` |

## Blocking defects

**1. `searchIndustryPackages`'s affordable/unaffordable/viable counts contract is not directly
tested anywhere, and the decide-level proxy tests only exercise the degenerate all-unaffordable
case, not the classification's general (partial) form.**
Requirement: 1344-A §3.1 lines 57 and 63-65 — cashBlocked is defined as "**at least one** candidate
was skipped by the cash gate and no candidate was viable," and "the chooser gains a pure search that
also reports the numbers of affordable, unaffordable and viable candidates." The RED brief pins the
exact shape: `searchIndustryPackages(input, policy, options): { choice, affordable, unaffordable,
viable }` (`brief-1344-shelving-red.md:12`).
The only test touching this is `cashBlocked weeks (cash below every candidate) leave the rejection
count unchanged` (`tests/p14d1-rival-shelving.test.ts:236-258`, patch lines 714-736), which sets
`account.cash = 0`. Its own comment says why: "every ... candidate exceeds cashAvailable, so
`chooseIndustryPackage` sees **zero** affordable candidates." That is the fully-degenerate instance
of the rule (all 54 candidates skipped, so "no candidate was viable" is vacuously true because none
were even considered) — not the partial mix the charter's wording explicitly allows for (some
skipped by cash, remainder considered and non-viable). This is exactly Finding 1, which the RED
handback disclosed honestly (`1344-C-shelving-red-handback.md:220-225`) and which the parent
explicitly deferred to this review (`1344-X2-shelving-red-dry-run-and-decisions.md:22`, "Left to
review 1344-D, which judges whether the decide-level tests suffice"). My judgment: decide-level
coverage is sufficient to validate `decide()`'s branching for the specific constructed scenarios
(staffingBlocked and the all-unaffordable cashBlocked case are both genuinely, non-vacuously
tested), but it is **not** sufficient to verify the counts contract itself, and it cannot catch an
implementation bug in which a partially-cash-constrained, partially-non-viable week is
misclassified as `economicRejection` instead of `cashBlocked`.
**Required change:** add a direct test comparing `searchIndustryPackages(x)` against the existing,
exported `chooseIndustryPackage(x)`, using the identical technique already precedented in this
codebase — `vi.spyOn(hollywoodPolicy, 'chooseIndustryPackage')` inside a real `tick()` over the
genuine week-130 fixture (which reliably reaches `economicRejection` weeks per test 1's own route
premise) to capture the real `(input, policy, options)` arguments without reimplementing the private
`inputsFor()` helper (see `tests/helpers/p14p3-fixtures.ts:833,887-896`, `rivalStep`'s
`packageSpy`/`originalPackage` pattern). Then assert, on the captured args: `searchIndustryPackages(...).choice`
deep-equals `chooseIndustryPackage(...)`; `affordable + unaffordable` equals the fixed candidate
universe size (54, per `1344-A §1`); `viable <= affordable`; and `(choice === null) === (viable === 0)`.
This is additive and does not require rewriting any of the existing 43 leaves; it can land alongside
the already-planned 1344-C2 revision.

**2. Test 7(c) — `authorRivalPromise` excludes shelved screenplays — is not covered by this
candidate.**
Requirement: 1344-A §6 item 7 (lines 157-158): "...is not offered by `authorRivalPromise`."
The gap is honestly disclosed in the patch itself (`tests/p14d1-rival-shelving.test.ts:586-594`,
patch lines 1064-1072) and in the handback (`1344-C-shelving-red-handback.md:226-237`). The parent
has already decided the fix — export `rivalPromiseProjectCandidates(state, studioId): ScriptProject[]`
from `talentMarket.ts` and test it directly (`1344-X2-shelving-red-dry-run-and-decisions.md:23-25`,
"Revision 1344-C2 tests it directly") — but **1344-C2 has not been staged**: I globbed the evidence
directory and confirmed no `1344-C2*` file exists yet. This is not a defect in 1344-C's honesty (it
is properly disclosed, not silently dropped, and the exploratory probes behind the disclosure — 0
`SPECIFIC_PROJECT` promises in 80 genesis weeks, 0 in the week 130-230 renewal window — are
themselves a real, useful finding), but it is a real gap in what this candidate delivers against
§6 item 7 today.
**Required change:** land and independently re-review 1344-C2 (the `rivalPromiseProjectCandidates`
direct test) before this RED slice is treated as complete against 1344-A §6.

Neither defect requires touching any of the 41 already-verified leaves; both are additive.

## Answers to the specific check items

**1. Coverage of tests 1-12** — see table above. Test 2's economic/staffing/cash distinction: the
staffingBlocked and running-production sub-cases are well-constructed, genuine, non-contrived
(staffingBlocked removes one of r01's three employed actors so no seatable triple exists; the
running-production case uses the *genuine* week-100 fixture where r01 already has a production
in-flight, no fixture editing needed). The cashBlocked sub-case is real but degenerate — see
Blocking 1.

**2. Test 3 HEAD-equality soundness / vacuity** — sound, not vacuous. Case 1
(`tests/p14d1-rival-shelving.test.ts:322-343`) independently re-derives the genesis-to-week-100 route
via `HARNESS_GENESIS()` + 100 live ticks and compares full-state structural equality (`toEqual`,
not a truthy check) against the genuine, independently-minted week-100 fixture migrated by
`convertV42ToV43`, with only the new `screenplayShelving` key stripped and receipts compared
un-stripped. Since 1329-A's own measurement places the stall's start at "about week 110," no
shelving is expected inside this 100-week window (confirmed by the receipts-equality assertion,
which would fail if one occurred), so this is a genuine differential test of "the law is a pure,
inert addition before it activates," not a vacuous pass. Case 2 (Amendment 2's narrower scoped
form, parent-accepted per `1344-X2:29-30`) is defensible but relies on an unasserted implicit premise
(zero economic rejections for the greenlighting studio's *other* active slot across the full
20-week window) — plausible given the charter's own account of early-game viability, but not
independently verified inside the test. Non-blocking note (see below).

**3. The 5 control-passing leaves** — legitimate, not masking. I read all five test bodies directly:
"no retry before retryWeek" (a due-in-100-weeks entry, ticked 3× — a buggy "always retry"
implementation would fire and fail this), "no retry without a free slot" (a synthetic third
shelved-and-due entry while both real slots stay full — a buggy capacity-ignoring retry would fire),
and "at most one retry per decision" (two due entries with both slots cleared — a buggy
both-at-once implementation would push `changed` to 2, failing `toBeLessThanOrEqual(1)`) each
construct a state where BASE's `tick()` provably never touches the hand-inserted field, and each
encodes a concrete, non-trivial assertion that a wrong GREEN implementation of the corresponding
§3.4 clause would violate. Player-symmetry and determinism are standard "vacuous-today,
meaningful-once-the-law-exists" regression guards, correctly labeled as such. None were altered to
force a RED status.

**4. Type-gate vacuity risk** — no required change. The `as unknown as X` casts only bypass tsc's
*static* structural check at the read boundary; at runtime, a genuine field/kind-name mismatch in
GREEN would surface as `undefined` propagating into a concrete `expect(...).toBe(<value>)` /
`.toEqual(<object>)` / `.toHaveLength(<n>)` assertion, which fails loudly rather than passing. I
traced this through the specific risk patterns (`.rejections.find(...)?.count`, `shelvedReceiptsOf`
filtering by literal `kind==='screenplayShelved'`, `.toEqual(EMPTY_SHELVING)`) and found no case
where a shape mismatch would coincidentally satisfy the expected value. One caveat worth a review
reminder (non-blocking): because tsc cannot catch a field-name drift here, the GREEN implementation
review should explicitly diff the production `RivalBusiness.screenplayShelving`/`IndustryReceipt`
shapes against this file's local future-shape types before/at GREEN, since that specific
verification is not automatic.

**5. Finding 1 sufficiency** — insufficient as delivered; direct test required. See Blocking 1 for
the concrete minimal test, grounded in the pinned API shape (`brief-1344-shelving-red.md:12`) and
the existing `chooseIndustryPackage`-spy precedent I located at
`tests/helpers/p14p3-fixtures.ts:833,887-896`.

**6. Receipts-derived pins (tests 1, 11)** — MET WITH EVIDENCE. Test 1's `shelvingWeek` is set from
`before.market.tick` only when a fresh `screenplayShelved` receipt is found in the diff
(`tests/p14d1-rival-shelving.test.ts:150-158`, patch lines 629-634); its rejection-count
cross-checks read `TUNING_FUTURE.HOLLYWOOD_SHELVE_AFTER_REJECTIONS` rather than a literal 13. Test
11 derives every week/studioId directly off `shelvedReceiptsOf(finalState.hollywood!.receipts)`
(`tests/p14d1-rival-shelving-natural.test.ts:53,59,86,99`) and the 13-week commission-guard window
reads `TUNING_FUTURE.HOLLYWOOD_SHELVE_COMMISSION_HOLD_WEEKS` rather than a hardcoded 13. No magic
weeks found.

**7. Vacuity elsewhere** — none found beyond Blocking 1/2's coverage gaps (which are absence, not
false-positive tests). All 38 fails are content-specific and matched exactly by the parent's
independent re-run.

## Non-blocking notes

- Save43 validator boundary coverage is thorough (6 validator + 4 down-conversion tests) but does
  not independently test: a rejection entry naming a non-active/non-ready ordinal, a rejection
  count of 0, or `retryWeek <= week`. Given the effort already invested and that some of these are
  hard to construct as naturally-arising states, this is low-priority polish, not required.
- `shelving-promise-guard`'s "settlement" is simulated by direct field mutation rather than routed
  through the real promise-settlement path — a reasonable, disclosed scoping choice (the guard
  under test is the shelving law's own promise check, not the pre-existing settlement mechanism).
- Test 3 case 2's "zero economic rejections in the first 20 weeks" premise (Amendment 2, parent
  decision #4) is plausible but not independently asserted inside the test; if the chosen studio's
  *other* active slot happens to accumulate a rejection in that window, this leaf will fail at
  GREEN for a route reason rather than a law defect. Consider asserting the premise explicitly or
  narrowing the window to right after the observed greenlight.
- `shelving-natural-route`'s "commission" detection (`development.projects.length` growth between
  weekly snapshots) is an honest, disclosed proxy in the absence of a dedicated commission receipt
  kind — reasonable given effort constraints.
- Out of my assigned scope but worth flagging for the parent: `1344-A §8` step 2 ("Measurement of
  the Save43 sweep, `1344-M`") has no corresponding record in the evidence directory yet (globbed,
  none found). Not a defect in 1344-C, since the charter's §4 frames the version sweep as its own
  later production step, but the parent should confirm this is still tracked before GREEN's sweep
  step.

## Next concrete action

Land the direct `searchIndustryPackages`-vs-`chooseIndustryPackage` comparison test (Blocking 1) and
the already-planned 1344-C2 `rivalPromiseProjectCandidates` test (Blocking 2), then re-run the full
RED suite once more (should remain 38+N failed / 5 passed) before GREEN production begins. The
existing 43 leaves should be preserved as-is; nothing here requires rework of the substantial
verified work in `tests/p14d1-rival-shelving.test.ts`, `tests/p14d1-rival-shelving-save-v43.test.ts`,
`tests/p14d1-rival-shelving-natural.test.ts`, or `tests/p14d1-rival-shelving-fixtures.ts`.
