# Adversarial Verification — `rival-failure.md` — Lens: Authority & Direction Consistency

**Verifier pass, READ-ONLY.** Target: `<scratchpad>/out/phase2/rival-failure.md`.
Checked against: OWNER-SELECTED DIRECTION A–K (`_phase2-script.js` lines 14–27), the analyst TASK prompt for
`rival-failure` (`_phase2-script.js` line 75), `phase1-verify/_DIGEST.md`, `accepted-592e926/` source, and
`authority/P15-PACKAGE.md`.

**Verdict: VERIFIED WITH CAVEATS.** The report's core authority handling is sound — it does not reopen any
settled Owner choice, it does not silently promote a genuinely open research question (Direction I, the §7
population band) into law, its Binding-Law and package-ownership citations check out verbatim against
`P15-PACKAGE.md`, and its `code-*.md`/digest-sourced facts (nine-rival ecosystem, per-studio `Standing`,
closed 5-kind `IndustryReceipt` union, exact-key `StudioIdentity`, no missed-payment event today, the
`cashNegative` UI stop reason) all check out against `accepted-592e926/`. But one finding is a genuine,
confirmed authority-fabrication that must be corrected before this report is relied on, plus two minor
citation-fidelity slips and one uncovered package-law gap.

---

## Finding 1 (MAJOR, CONFIRMED) — a quote attributed to "Direction D's own text" does not exist in the Owner Direction; it is this analyst's own task prompt, misattributed as Owner authority

**Location:** `rival-failure.md` §0.2, lines 54–56:

> "Reconciliation (this report's ruling, since **Direction D's own text** puts the question to whichever
> analyst owns the trigger hierarchy — **"NOT net worth alone unless analysis strongly supports it"**):
> adopt `loans.md`'s stricter rule and correct `player-failure.md`'s table to drop the net-worth disjunct."

**Why this is wrong:** I read the complete OWNER-SELECTED DIRECTION block (A–K, `_phase2-script.js` lines
14–27) in full. Direction D reads in its entirety: *"RIVAL STUDIOS CAN FAIL: healthy → warning → distress
→ severe distress → insolvency/bankruptcy → settlement/auction/closure. One bad movie must not bankrupt a
studio; failure comes from sustained inability to meet real obligations under the same economic law.
StudioId and historic identity NEVER disappear or recycle…"* — it says nothing about net worth, and
delegates no interpretive authority to "whichever analyst owns the trigger hierarchy." The only Direction
letter that even mentions net worth is B, and only in the unrelated context of the Power Ranking's optional
fourth lane.

The quoted phrase **does** exist verbatim — but as part of this analyst's own **TASK prompt** (the
orchestrator's instructions to this analyst, `_phase2-script.js` line 75): *"…what facts (cash-flow test:
missed due obligation; sustained negative net position over a window; covenant/loan default; **NOT net
worth alone unless analysis strongly supports it**)…"*. I confirmed by grep that this string appears
nowhere else in the phase-2 corpus and nowhere in the Owner Direction text — only in the task prompt.

**Why it matters (authority & direction lens):** the report is not merely citing its own assignment; it is
dressing up a task-writer's research hint as if it were the Owner's own settled, binding text ("Direction
D's own text puts the question to…"), and using that manufactured authority to adjudicate a live
disagreement between two sibling analyses (`player-failure.md` vs `loans.md`). That is exactly the kind of
authority-laundering this lens exists to catch: converting a non-binding, analyst-facing research
instruction into apparent Owner law by misattribution. It is mitigated — the report does separately and
correctly list the §0.2 reconciliation as Remaining Owner Decision #1, so the *outcome* is not silently
frozen as final — but the citation itself is false and must not stand as written.

**Corrected statement:** "Direction D contains no ruling on net worth as a trigger. The phrase 'NOT net
worth alone unless analysis strongly supports it' is from this analyst's own task prompt (a research
instruction), not from Owner Direction. The §0.2 reconciliation (dropping the net-worth disjunct) is this
report's own design ruling, made because it is asked to name and settle the one disagreement between
sibling reports — not an Owner-mandated determination — and it is correctly still listed under §9's
Remaining Owner Decisions for that reason." The substance of the reconciliation (Scenarios 3–4's economic
argument that book net worth is a conservative-by-construction, collateral-driven number that would
otherwise penalize the exact leveraged-but-current borrowing behavior Direction F authorizes) is sound and
does not depend on the fabricated citation — only the citation needs to be struck or corrected.

---

## Finding 2 (MINOR, CONFIRMED) — a code quote is paraphrased and presented as if verbatim

**Location:** Sources list and §2 table note: `hollywoodValidation.ts:72`, quoted as `"exactly 10
identities"`.

**Check:** `accepted-592e926/src/core/hollywoodValidation.ts:72` reads:
```
requireFact(studios.size === 10 && h.identities.length === 10,'exactly player plus nine reserved studios')
```
The actual string literal is `'exactly player plus nine reserved studios'`, not `"exactly 10 identities"`.
The substantive fact (exactly 10 identities total, enforced by this line) is correct; the quotation marks
around a paraphrase overstate it as verbatim, which the package's own quote-fidelity rule (≤40 words,
faithful) does not permit.

**Corrected statement:** cite `hollywoodValidation.ts:72` for the invariant "studios.size === 10 &&
h.identities.length === 10, enforced with the message 'exactly player plus nine reserved studios'"; drop
the quotation marks around "exactly 10 identities" or replace with the real string.

---

## Finding 3 (MINOR, CONFIRMED) — citation off by one code section (line, not substance)

**Location:** §3, "per P12's existing privacy law (`bridge/industry.ts:1`: 'future receipts, costs and
studio revenue remain private')".

**Check:** `bridge/industry.ts:1` is the file-header comment (`/** Public, bounded Industry reads.
Authoritative IDs and facts only; no private business inputs. */`). The quoted sentence is real and
verbatim, but it lives at **line 50** (inside the per-run `businessNotice` string for an active theatrical
run), not line 1. Substance (P12's public/private boundary; the rival gets the same treatment) is correct
and independently confirmable elsewhere in the same file (lines 93, 151 carry the same "remain private"
pattern for contract terms and unrevealed development).

**Corrected statement:** cite `bridge/industry.ts:50`, not `:1`, for this quote.

---

## Finding 4 (MODERATE, gap not violation) — migration-origin rivals and Binding Law 7 are never addressed

Binding Law 7 (`P15-PACKAGE.md` §11) and Direction G/D both require that closure/distress/recovery facts
never fabricate a rival's past. The digest (`verify:code-hollywood:completeness-overclaim`, MISSING item)
records the relevant code fact this report does not use: `origin==='migration'` rivals have `founding:
null`, no authored films, enter at `max(eligibleWeek, originWeek)`, and `hollywoodValidation.ts:99` forbids
a fabricated migration past — so a migration-origin rival has no pre-recording financial history to
compute a "26-consecutive-week" or "trailing-52-week surplus" trigger against. `rival-failure.md` never
mentions migration-origin studios (`grep migrat` on the report returns nothing), so its trigger hierarchy
and all eight paper scenarios are implicitly framed against a `origin: 'fresh'` world only. This is not a
stated violation of Law 7 — the report invents no fiction — but it is a real silence on a package-law
constraint this lens was asked to check, and the eventual builder will need an explicit rule for what a
migration-origin rival's pre-migration trailing window defaults to (likely: treat pre-`originWeek` history
as absent rather than zero/negative, per the no-fabrication law) before §2's constants can be implemented
as written.

**Recommendation:** add one line to Uncertainties or Remaining Owner Decisions naming this gap; no
correction to the existing content is required since nothing currently written contradicts Law 7.

---

## What checks out cleanly (for calibration — not exhaustive, this is not the completeness lens)

- **No settled choice reopened.** Every Direction A–K item the report touches (D, F, G, I) is applied, not
  revisited; §7's population-hazard band is explicitly and correctly framed as a calibration check, not a
  floor, honoring Direction G's own "report a severe failure, don't float a floor" instruction verbatim.
- **Binding-law citations are verbatim-accurate.** Spot-checked against `P15-PACKAGE.md`: §16 "Loans,
  bailouts, investors, forced sales, or acquisition are not implied" (exact match); §16 "P12 rival policy
  chooses from that same legal set" (exact match); §17's pre-terminal-symmetric / terminal-asymmetric split
  is correctly preserved rather than flattened into false full symmetry.
- **§10's CONFIRMED/SUPERSEDED labels are correct.** §5.5 "OPEN QUESTION" is confirmed verbatim against
  the authority doc; the §23 "P12's minimum three active AI rivals" row is correctly marked SUPERSEDED BY
  OWNER DIRECTION G, matching the digest's own correction; §16's acquisition clause is correctly marked
  QUALIFIED/PARTIALLY SUPERSEDED rather than fully overturned (Direction I only authorizes eventual
  acquisition ability, not present-tense P15 ownership of the mechanic — the report gets this distinction
  right in §6 and §8).
- **Package ownership matches P15-PACKAGE and sibling reports.** The P11/P15B/P12 split in §8 tracks
  Direction F's own wording ("P11 likely stays authoritative for ledger/debt math; P15B may own distress
  context") almost verbatim, and the settlement-receipt row is a faithful (if compressed) summary of
  `talent-settlement-events.md` §2.9/§4's own P12-mints-inside-P15B-requested-candidate split.
- **Accepted-code facts hold up.** Verified directly against `accepted-592e926/`: `calendar.ts:3`
  `RIVAL_ARRIVAL_WEEKS`; `hollywoodStartingData.ts` capital/reserveWeeks/negativeScale/marketingRatio
  ranges (20M–38M / 12–20 / .94–1.20 / .14–.24, all exact); `hollywood.ts:81-86` cost formula;
  `hollywoodTick.ts` unconditional payroll/overhead/facilityOpex debit and the `operatingReserve` gate;
  `hollywoodTypes.ts` five-kind closed `IndustryReceipt` union and exact-key `StudioIdentity`; the
  `cashNegative` stop reason in `ui/src/engine/adapter.ts`. None of these facts are invented, and none of
  the "ignores code that does exist" risks in the brief materialize.
- **No hidden-subsidy or player-only-exemption language.** §5 explicitly ties remedy selection to Binding
  Law 9 with no rival-only leniency; the terminal asymmetry is correctly attributed to already-accepted P12
  law (§17), not invented here.
- **Source discipline on numbers.** Every scenario in §4 and the §7 hazard table is explicitly labeled
  PROVISIONAL/HYPOTHETICAL, and comparator claims (FM24 staged ladder, OpenTTD's negative-cash-alone-is-
  not-distress framing) match the digest's own corrected versions rather than the pre-verification phase-1
  drafts.

---

## Summary of required corrections

1. **Strike or rewrite the "Direction D's own text… 'NOT net worth alone…'" citation in §0.2.** Attribute
   the quoted phrase to this analyst's own task prompt, not to Owner Direction D; reframe the §0.2 ruling
   explicitly as the analyst's own reconciliation (already listed, correctly, as Owner Decision #1 in §9 —
   only the false citation needs fixing, not the substance).
2. Fix the `hollywoodValidation.ts:72` quotation to the real string `'exactly player plus nine reserved
   studios'` (or drop the quote marks).
3. Fix the `bridge/industry.ts:1` citation to `:50`.
4. Optionally add one line acknowledging that migration-origin rivals (no pre-`originWeek` history,
   `hollywoodValidation.ts:99`'s no-fabrication rule) are out of scope for §2–§4 as written.
