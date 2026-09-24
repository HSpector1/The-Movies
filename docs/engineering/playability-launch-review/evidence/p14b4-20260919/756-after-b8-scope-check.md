# 756 — what comes after B.8, checked against the plans rather than assumed

Written during the B.8 confirming run, so no commit lands while `755-b8-full-core` is measuring.
The Owner's continuation packet requires checking each package's actual scope and current upstream
implementation BEFORE beginning it, and forbids inventing scope from package numbers or research
headings. This is that check.

## B.8 is the last P14B slice

Enumerated from the plan rather than inferred: it names `P14B.1` through `P14B.8` and no more. The
slice order is `P14A.1 → A.2 → A.3 → P14B promises/relationships → P14C lifecycle`. So P14B closes
when B.8's verification publishes.

## What remains inside P14 before P14C

These are carried open items, each already on the record and none of them a new invention:

| item | what it is | status |
| --- | --- | --- |
| `p14b4-cast-class-capacity-evaluator5` | a LIVE designated failure: the case expects IMPOSSIBLE and the evaluator returns FRAGILE. One of the 24 inherited failures. | open, real defect |
| evaluator 5 | the kernel evaluator deferred from D2 (i-c) | deferred by design |
| 628 R5 / G-1(A) / G-2 | rival authoring exclusion for sole crew, and siblings; each wants its own RED | carried, marked not blocking |
| 637 | carried alongside the above | carried, not blocking |
| positive-saturation | retained, staffing and seat policy untouched | carried |
| the 6,240-week endurance scenario | 260 weeks is explicitly NOT it; the real scenario has never been run | open obligation |
| 702-C REFINE 3-6 | review refinements from the B.6 cycle | carried |
| the B.6 projection cost | measured but not disposed | carried |
| `rosterAt` / `SEAT_PAIRS` restated in `bridge/relationships.ts` | a duplication noted during B.6 | carried |
| FU-1 | the `ui` suite reliability finding; never returned | open, blocks UI-affecting claims |
| FU-2 | prepared-reuse budget; diagnosed at 741, threshold deliberately NOT moved | open disposition, recommendation recorded |

**Scope guard, read carefully.** The standing constraints exclude an "optimization campaign without
a concrete need". The evaluator-5 DESIGNATED FAILURE is not an optimization campaign: it is a test
asserting IMPOSSIBLE against an evaluator that returns FRAGILE, which is either a defect in the
evaluator or a wrong expectation, and the programme has never established which. That is a concrete
need. An evaluator-5 performance campaign remains excluded.

## P14C — Career Lifecycle, and the authority question that has to be asked

**Actual scope, from the companion §2.3, quoted rather than paraphrased:** materialized aging for
all persistent professionals, the apparent-age seam, profession-specific retirement context,
announced retirement with its own eligibility state, obligations first, the one final one-year
extension as a single-issuer proposal, alumni, deterministic replenishment, profession retirement
distinct from industry retirement, Actor → Director and Actor → Writer, historical continuity.

It attaches to P14A through the `retirement_announced` row of the eligibility table, the extension
proposal, free-agent re-entry after a transition, and the lifecycle eligibility predicate the markets
consult.

**THE AUTHORITY QUESTION, raised because the packet says to check and not to assume.** The
repository's `CLAUDE.md` lists "aging and career progression" under *Not current scope; permanence
undecided*. That same section opens with: "Not current scope **unless explicitly authorized by the
Owner or the current campaign**. Newer Owner authority supersedes historical milestone exclusions."

The current campaign authorizes it. The P14 companion is the package's own preparation document, it
names P14C as one of the three parts of Package 14, the plan's slice order ends at P14C, and the
Owner's continuation packet names "P14C lifecycle obligations" explicitly. So P14C is authorized and
the `CLAUDE.md` line is a superseded historical exclusion, exactly as that section's own preamble
provides for.

Recorded rather than assumed, because proceeding into aging on a silent reading of a document that
lists it as out of scope is precisely the kind of thing that should be visible in the record.

**One inherited ambiguity P14C must settle**, carried from B.7 and restated in B.8's backlog entry:
`WAIVED` requires propose-and-accept, while `VOIDED` would follow automatically from a lifecycle
event. B.7 sharpened that reading but had no authority to confirm it. P14C confirms or rejects it,
and the `VOIDED` branch of the outcome enum is retirement-moot until it does.

## P15 and beyond

`plans/` holds no P15, P16, P17 or P18 file. What exists is characterization inside the P14
companion: P15 is named there as the legacy interpretation and consumption of relationship facts,
restricted to public, career-relevant outcomes. That is not a specification. Before P15 begins it
needs its own scope check against whatever document actually defines it, and the packet's rule
against inventing scope from package numbers applies with full force. Not a blocker for now: P14C
sits between here and there.

## The order this implies

1. Publish B.8's verification and close P14B.
2. The carried P14 obligations above, starting with the evaluator-5 designated failure, because it is
   a live wrong answer inside the inherited failure set rather than a deferral.
3. P14C, expansion written and audited before it begins, on the same rhythm B.7 and B.8 used.
4. P15 only after its actual defining document is found and read.

---

## CORRECTION — the evaluator-5 item is a DESIGNATED failure, not a live wrong answer

This record ranked `p14b4-cast-class-capacity-evaluator5` as the next concrete obligation, on the
reasoning that "a test asserting IMPOSSIBLE against an evaluator that returns FRAGILE is either a
defect in the evaluator or a wrong expectation, and the programme has never established which."

That is wrong, and the file itself says so. Its header (`tests/p14b4-cast-class-capacity-evaluator5.test.ts:1-21`)
records the disposition explicitly:

> DISPOSITION: a LIVE `it(...)`, executable, and a DESIGNATED failure until evaluator 5 lands. …
> A writer never rewrites it; test-author reconciles it from evidence when evaluator 5 is designed.

The programme HAS established which side is which. Evaluator 4 is the class-aware scalar and
correctly returns FRAGILE, because `activePromiseReservations` filters by beneficiary so the
antagonist's bound lead-class claim is invisible to the SUPPORT target's read. The IMPOSSIBLE
expectation is the bounded JOINT CERTIFICATE, which only evaluator 5 can issue. The failure is the
marker of an undesigned evaluator, not a defect in a designed one.

So it is a deferral with an explicit gate, and the gate is "when evaluator 5 is designed". Designing
evaluator 5 is a substantial new design effort, and the standing constraint excludes an evaluator-5
campaign without a concrete need. A documented designated failure is not that need.

**Revised order.** Strike step 2. The carried items above are each marked "not blocking" or carry
their own gate, and none is dependency-ready in the sense the Owner's packet uses. The next
unfinished, dependency-ready SLICE is **P14C**, and the packet names it. FU-1 blocks UI-affecting
acceptance claims only, and P14C's engine work is not one.

1. ~~Publish B.8's verification and close P14B.~~ DONE (`8388d726`).
2. ~~The carried P14 obligations, starting with evaluator 5.~~ **STRUCK, see above.**
3. **P14C**, expansion written and audited before it begins, on the B.7/B.8 rhythm.
4. P15 only after its actual defining document is found and read.

Recorded as a correction rather than edited away, because the mischaracterisation was published.
