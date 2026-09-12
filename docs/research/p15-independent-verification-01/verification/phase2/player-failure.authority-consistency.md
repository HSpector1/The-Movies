# Verification Memo — `phase2/player-failure.md`
**Lens:** Authority & Direction Consistency
**Verifier date:** 2026-09-12
**Verdict: VERIFIED WITH CAVEATS**

The analysis is unusually careful with code citations (spot-checked ~12 file:line references
against `accepted-592e926` — `employment.ts:70-80` `canAfford`, `tick.ts:919-946` unconditional
debits, `studioRunRecap.ts:991-992/1003/1005` `classifyRecovery`, `actions.ts:2693-2723`
`applyReleaseTalent`, `placement.ts:1025-1027`/`tuning.ts:1599-1613` demolition-refund flatness,
`adapter.ts` `cashNegative`, `campaign-library.ts`, and quotes from
`OWNER-RULINGS-HOLLYWOOD-HORIZON.md` §3, `P11A-DECISION-AND-REQUIREMENT-REGISTER.md:140-141`,
`P15-PACKAGE.md` §12.3/law 5/law 6, and `P12A-R05-OWNER-DECISIONS-AND-ACCEPTANCE.md:118` — every
one checked out verbatim, all quotes within the 40-word limit) and it correctly refuses to treat
"insolvent"/negative-cash as itself a failure state, matching Direction E's explicit prohibition
("Do not silently choose 'negative cash = game over'"). However, four problems survive scrutiny
against the Owner direction, the accepted-code facts, and (now that it exists) the sibling
`rival-failure.md`, which was written specifically to reconcile this file against the shared law.

---

## Violations found

### 1. (MAJOR) Book Net Worth used as a stand-alone Severe-Distress trigger — violates the task's own rule and is now explicitly refuted by the coordinating document

**§2's trigger table** lists Severe Distress as reachable by *either* "4 missed weekly
obligations… within a rolling 13-week window, **OR** book net worth negative for 26 consecutive
weeks." The player-failure task text (this same TASKS entry) explicitly imports the rival-model's
method rule: triggers should be "cash-flow test: missed due obligation; sustained negative net
position over a window; covenant/loan default; **NOT net worth alone unless analysis strongly
supports it**." No such support is offered for the 26-week branch beyond the bare table row — no
worked scenario, no argument for why sustained negative book net worth alone (with every
instalment current) should escalate a studio.

This has since been directly adjudicated: `phase2/rival-failure.md` §0.2, written to be "the
canonical trigger hierarchy for the whole P15 bankruptcy slice," identifies this exact clause as
"the one disagreement" with `loans.md` §3.7 (whose load-bearing rule is "acceleration… is the
**only** event that may hand the P15B condition machine a 'Warning' trigger sourced from finance…
**Nothing else in finance may originate a Warning**") and rules **against** `player-failure.md`:
*"adopt `loans.md`'s stricter rule and correct `player-failure.md`'s table to drop the net-worth
disjunct… Book Net Worth remains real and useful… but it does not, by itself, move a studio's
stage."* The reconciler's own reasoning (Scenario 3: a heavily leveraged, fully-current, profitable
studio can carry negative book net worth for years purely from conservative collateral haircuts)
is the "analysis strongly supports it" bar the original clause needed and never cleared.

**Corrected statement:** drop "OR book net worth negative for 26 consecutive weeks" from the
Severe-Distress/Event-of-Default trigger. Only a missed instalment (4-in-13-weeks) or a covenant
breach (leverage/coverage, not book net worth) may originate a finance-sourced escalation. Book Net
Worth stays a disclosed, legible figure in the Distress panel (Direction C), not a trigger input.

### 2. (MODERATE) The six-stage ladder's provenance is mischaracterized — treats Owner-dictated language as analyst-derived, then lists it as still open

§2 presents the ladder as **"the smallest correction"** to *P15-PACKAGE §12.3's existing diagram*
(`active → warning → distress → recovery → active ↘ dormant → recovery`), captioned "Recommended
six-name ladder (keeps the four inherited names, adds two)." Two problems:

- **The arithmetic is wrong even on its own terms.** Of §12.3's five named states (active, warning,
  distress, recovery, dormant), only *warning* and *distress* are literally kept; *active* is
  renamed *healthy*, *dormant* is dropped as a formal ladder stage entirely, and *recovery* is
  demoted from a named box in the chain to a return arc. Three new named stages are added (severe
  distress, insolvency, bankruptcy), not two.
- **More importantly, this is not really a derived recommendation at all.** Owner Direction D
  states, verbatim: *"healthy → warning → distress → severe distress → insolvency/bankruptcy →
  settlement/auction/closure."* That is the ladder, word for word (Direction E asks for the same
  law applied symmetrically to the player). `rival-failure.md` §0.1 gets this right — "This is also
  the Owner's own literal wording in Direction D" — but `player-failure.md` never says so; it
  frames the names as flowing from P15-PACKAGE §12.3 plus comparator reasoning (OpenTTD, Prison
  Architect, MGT2), which is true only for the *pre-terminal shape*, not for the stage *names*
  themselves, which the Owner already settled.

The consequence is concrete: **Remaining Owner Decision #2** ("Approve the six-stage ladder and its
names… or direct different naming/state count") asks the Owner to re-approve wording the Owner
already dictated in Direction D — exactly the "silently... reopen a settled choice" failure mode
this lens exists to catch, just inverted (treating settled text as still pending rather than
treating open tuning as settled).

**Corrected statement:** the stage *names* are Direction D/E law, not a recommendation — say so.
Genuinely open is only (a) the exact PROVISIONAL durations/thresholds at each transition, and (b)
whether "insolvency" and "bankruptcy," which Direction D writes as one slash-joined term, are best
built as two sequential stages (as this report does, reasonably, to host the bounded rescue window)
or as a single stage — that interpretive choice should be named as such, not folded silently into
"kept the inherited names."

### 3. (MODERATE) Circular authorization claim for Book Net Worth, now doubly unsupported

§9's corrections table relabels `finance-logic.md` §1.5's caution — *"Book Net Worth… still a P11
read-model change and thus needs its own authorization; nothing here authorizes it"* — as
**CORRECTED**, on the ground that *"Direction C's explicit requirement for a meaningful,
understandable net-worth display, **plus this section's use of Book Net Worth as a §2 trigger
input**, together constitute the authorization that report withheld judgment on."*

This is circular: the report cites its *own* proposed use of Book Net Worth as evidence that the
use is authorized. Direction C authorizes a **display**, not a specific mechanical role in a
failure ladder — what basis, disclosure rule, and mechanical use Book Net Worth gets is exactly the
open research question posed to `net-worth.md` and (per Finding 1) the specific trigger use cited
here has since been rejected by the coordinating document. The justification for "CORRECTED" no
longer exists even on the report's own terms.

**Corrected statement:** relabel this row **QUALIFIED**, not CORRECTED: Direction C authorizes
*building and displaying* a Book Net Worth read-model; it does not by itself resolve what that
figure is used for mechanically (trigger vs. disclosure-only) — that remains for `net-worth.md`/
Owner synthesis, and per Finding 1 the trigger use is now the *rejected* option.

### 4. (MINOR-MODERATE) Ignores two established code facts this lens was asked to check

- **Closed `IndustryReceipt` union.** §5/§7 recommend "settlement receipts fire" for the player's
  contracts/talent → free agency and assets → settlement, but the word "IndustryReceipt" never
  appears in the file, and nowhere does it note that `IndustryReceipt` is a **closed, five-kind
  union** (`hollywoodTypes.ts:96`) that a player-bankruptcy settlement mechanism would need to
  extend additively. `rival-failure.md` §0.1, addressing the *symmetric* rival case, explicitly
  names the fix ("new receipt kinds `studioClosed` and `projectCancelled`; a new root
  `studioOperatingState`, **not a widened `StudioIdentity`**" — also correctly respecting the
  exact-key-validated `StudioIdentity` fact). `player-failure.md`'s own §6 proposes only a
  `campaign-library` `recordStatus` field and never states the parallel constraint for the player's
  own settlement receipts/identity status, despite Direction E requiring the same settlement
  machinery for the player that Direction H requires for rivals.
- **`cashNegative` UI stop reason.** The accepted code already treats a cash crossing from ≥0 to
  <0 as a governed event (`ui/src/engine/adapter.ts`, stop reason `cashNegative`, fires at the
  exact crossing) — the digest calls this "the natural P15B pre-terminal-warning seam." The
  analysis's own preamble lists this as an established fact, but the body of the report (§2's
  ladder, §3's warning clocks) never mentions it or states how the new Warning/Distress ladder
  relates to this already-shipped stop-reason behavior (superseded? kept as a legacy UI pause
  alongside the new non-terminal states? repurposed as the Warning-stage notice trigger?). This is
  a live open question the report should have named rather than silently left unaddressed.

---

## Checked and found consistent (no violation)

- Does **not** reopen Direction A/B/C/D/F/G/I/J/K without cause; touches C and F only as the task
  requires and does not silently convert F's "simple loan system" into anything beyond what
  `loans.md` independently designs.
- Correctly and repeatedly labels prior text CONFIRMED / SUPERSEDED BY OWNER DIRECTION per §9,
  and the §0 "documentation-amendment-before-any-charter" framing is not an overreach — it is
  the task's own explicit instruction ("must be superseded by a recorded Owner ruling before any
  charter (documentation change, not code)"), reproduced almost verbatim from the TASKS prompt.
- `P11-REQ-041`/`042` "requires separate Owner gate" language is quoted correctly and the
  characterization of Direction E as satisfying that gate is textually apt (the register itself
  uses that exact phrase for both rows).
- No player-only exemption is smuggled in; no hidden rival subsidy claim; no retroactive-fiction
  claim about migrated saves; StudioId/film/person "no identity death" (P15-PACKAGE law 6) is
  correctly treated as already-settled and unamended.
- Package-ownership rows (P11 = ledger/Book-Net-Worth-as-selector, P15B = condition ladder/remedy/
  terminal event, P15C = postmortem reducer reused with a new entry point, P12 = save-record-status
  field and identity law) are consistent with the Producer Handoff's authority table and with
  `loans.md`'s own P11/P15B split — this part of the ownership analysis needs no correction beyond
  routing Finding 1's dropped trigger.

---

## Net assessment

Core recommendation (extend the pre-terminal P15-PACKAGE §12.3 shape with one new terminal branch;
reuse `classifyRecovery`/`reasons[]`; C→B terminal structure; postmortem dossier via the same P15C
reducer) is sound, well-sourced, and does not reopen settled direction. The four findings above are
real but narrow and correctable: one design element (the net-worth trigger) should be dropped —
which the sibling document has already done on the record — one framing (ladder provenance /
Decision #2) should be corrected to stop asking the Owner to re-bless already-dictated names, one
corrections-table label should be downgraded from CORRECTED to QUALIFIED, and two established code
facts should be explicitly addressed rather than left silent. None of this invalidates the report's
central design; all of it is fixable without new research.
