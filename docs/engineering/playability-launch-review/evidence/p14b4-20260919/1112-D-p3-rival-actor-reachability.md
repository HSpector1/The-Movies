# 1112-D — Rival Actor P3 reachability and bounded strategy proposal

This is a docs-only source finding and proposed refinement to frozen 1112-A/C.
It does not amend their bytes, qualify a fixture, activate P3, or authorize an
implementation. C.3 still closes first. No project code, seed search, gameplay,
compiler or test was executed for this note. The inspected checkout reported
`c1a6654a859e528bd719cd39c62d850a51f59eee`; this is inspection provenance, not a
new source-compatibility gate.

## Finding: the proposed Actor witness has two missing prerequisites

No source-supported complete public-created witness within the proposed 260-call
route has been established. The problem is more specific than “P1 always
beats P3.” Two independent conditions are absent from 1112-A/C's proposed
ordinary primary-Actor rival route.

First, `talentMarket.authorRivalPromise` attaches the first reasonably achievable
candidate. It reads each candidate against the same unchanged state, with count
1 and the full proposed interval. The current proven list is P1; the unproven
list is flexible P2, then P1. 1112-A puts P3 after that complete list for a
primary Actor. When the fresh Director path and generic cast path are both
reasonably achievable, the actual Actor proposal therefore receives P1/P2 and
never reaches P3. There is no automatic later replacement of that promise.

There is a conditional bootstrap obstruction under the proposed shared scalar
arithmetic, not a universal P1-versus-P3 ordering for arbitrary histories:

- Promise authoring skips extension cases. `submitProposal` refuses ordinary
  proposals when the current person has a retirement record. Thus the ordinary
  primary-Actor candidate does not acquire a favorable P3-versus-P1 retirement
  clock merely by approaching retirement.
- With no actual held Director seat at this issuer, the candidate P3 has the
  fresh first-take clock and existing screenplay paths. P1 has those screenplay
  paths plus any actual cast path; rivals have no stock-greenlight term.
- A genuine current rival production starts with eight remaining ticks and
  only counts down or holds. A held cast path's first-event estimate is no
  later than the fresh `from + 5` estimate. Later sequential estimates match.
  The shared buffer leaves monotone residual capacity, and slack is no worse
  for an earlier event. The revision-6 union reserves at least the legacy
  beneficiary-only commitments; after P3 exists, P1 must use that union too.
- A public-created Actor cannot lack an acting profile: Full Custom constructs
  every discipline, and whole-save admission requires them. P1 therefore
  cannot be made nonofferable by omitting acting skills from creator input.

Consequently, when the first ordinary Actor P3 has no issuer-held Director seat,
its reasonably achievable fresh path does not provide a reason to pass over the
earlier generic P1 candidate. Current ordinary rival Director selection only
uses primary Directors, so it cannot create the favorable Actor Director seat
that would bootstrap this exception. Player assignment actions do not edit rival
productions, and the transition catalogue only changes Actor to Director/Writer;
it cannot turn a former primary Director back into Actor while retaining a seat.

Actual held Director work can advantage P3's committed clock or pipeline in
other lawful states; cast-held work can advantage P1. A transitioned Writer with
completed Acting retirement can also separate the domains. Those remain evaluator
controls, but neither proves this primary-Actor rival scenario. Do not generalize
the induction to arbitrary migrated/synthetic Director seats, shorten only one
candidate's window, or invent an existing rival seat.

Second, a rival normally employs only three primary Actors. `RIVAL_TEAM_ROLES`
is Writer, Director, Actor, Actor, Actor, Craft. The ordinary staffing pass fills
those seats. `survivesFreeze` uses `seatsHeldAfter` to enforce the same role cap,
including earlier wins in the same settlement pass. Simultaneous market cases
therefore cannot legitimately manufacture a fourth Actor through an overhire.

Selecting one of those Actors as the promised Director leaves only two ordinary
Actors for the film's three cast slots. A real eligible promised non-Actor could
supply the third, but 1112-A/C specifies no such reachable overlapping promise.
The current film's Writer and Craft are already excluded by uniqueness; silently
reusing either is invalid. An older bound cast promise to the displaced ordinary
Director is a conditional historical possibility, not a guaranteed fact of the
new route. Merely excluding the chosen Director from both cast lists correctly
prevents double seating but does not supply the missing third cast member.

## Proposed delegated refinement

The following two changes are a narrow implementation-policy proposal for parent
and independent review. They are not selected product law or a silent alteration
to the frozen candidate.

1. **Add a history-based Actor candidate-order branch.** A current primary Actor
   with an actual recorded released Directing credit tries P3 first, then the
   unchanged existing cast list. Current primary Directors keep 1112-A's P3-first
   order. All other people keep its cast-first order. Use a real same-person
   released credit from the authoritative player/Hollywood film history; no
   authored skill input, numeric version, speculative aptitude or injected work
   history substitutes for that fact. This is the rival's deterministic offer
   strategy, not a new eligibility threshold or a claim about the person's
   private ambition. An unproven Actor remains eligible for player P3 and for
   any otherwise reachable rival P3 under the common service. The public
   non-Director cast preference and D3 matching remain unchanged.
2. **Supply only the displaced Director as the final P3 cast fallback.** For a
   film whose chosen bound-P3 Director is a primary Actor, retain the current
   promised-cast list and ordinary Actor order, including 1112-C's exclusion of
   that chosen Director. If these provide fewer than three distinct people,
   consider the ordinary primary-Director fallback candidate displaced by that
   P3 choice, once, as the final cast candidate. Require that actual employee's
   acting profile, actual employment at the work week, idle status,
   current-plus-Actor assignment admission (`assignmentRefusal` requested as
   `actor`, so completed former Acting retirement still refuses), all normal
   cast occupancy/admission gates and complete writer/director/craft/cast uniqueness. Do not search a new roster,
   mint a person, buy out a contract, add a seat or bypass a promise reservation.
   A missing or inadmissible displaced Director leaves the ordinary package
   refusal intact. Outside this explicit primary-Actor P3 branch, preserve all
   existing ordinary cast and Director choices byte-for-byte.

This proposal changes two named strategy decisions only; it does not weaken
conservative feasibility. The P3 quote's known staffing/conflict check must use
the actual legal role arrangement the policy can execute. It cannot claim an
available cast trio by counting the beneficiary twice or by assuming a later
hire. The same legal eligibility constraints apply to player and rival work;
these hypotheses concern how the rival chooses among lawful assignments.

The released-credit condition deliberately limits the new candidate-order
branch. It does not introduce a new OVR threshold, change the accepted
has-discipline rule, create a persistent ambition, or reinterpret old promises.
If review instead selects a broader P3-first strategy for every capable Actor,
that is a distinct policy choice to state and test explicitly, not an outcome
inferred from every person having a directing profile. A universal optimal crew
search, changing fixed roster caps, new personal ambition or cross-domain waiver
barter would be additional scope and is not proposed here.

## Future bounded witness and RED obligations

The refinements remove circular prerequisites; they do not prove that an
unexecuted fixed world will meet affordability, competition or pipeline facts.
Keep the one 260-tick rival route and all original first-failure/no-search rules.
Before test source release, freeze one exact public starting world and action
sequence. A candidate chronology is a primary Actor hired by the player on a
real 208-week contract at week 0, credited as Director on an actual player film
before the normal renewal window, then left to the real contest at 208. Up to
52 subsequent ticks remain inside the existing ceiling. This proposes actual
ordinary contract expiry and market recruitment, not early termination or an
assumed existing rival Actor-director seat. If the actual input
cannot lawfully hire at 0 or align a rival expiry/vacancy, this chronology is
unproved; do not shift a clock, edit a contract or substitute another seed.

The public film must use a separate actual Writer, three other distinct cast
members and actual production actions through first take and release. Whole
current-save admission and the same Actor identity/primary role must precede
market assertions. The real released film supplies the new strategy condition; join its exact
Director credit to that person and the actual directing work-history change.
Manual `workHistory` or credit edits are not acceptable. The rival's actual
same-role expiry or deficit, entered status, funds, case dates and ready or
commissioned screenplay must be independently established. A missing pipeline
or a losing/infeasible proposal is a fixture-premise failure, not permission to
attach a rival promise directly.

Within the existing 18 rows, refine D07/D18 subcontrols as follows:

- Observe the real rival proposal's tagged P3, count/window, feasibility receipt
  and material identity. Require an actual settled win, contract/payment and
  binding, then real Director assignment and a qualifying first-take receipt.
  Preserve real refusal if the person prefers another lawful proposal.
- Before that take, prove the beneficiary is still a primary Actor and occurs
  early enough in the actual ordinary Actor sequence that the missing exclusion
  would otherwise select them. Prove both promised and ordinary cast lists
  exclude the chosen Director and that all final seats are distinct.
- Prove the actual displaced primary Director fills only the shortage left by
  the two remaining Actors, is legally assignable to Acting, and is neither the
  film's Writer nor Craft. Preserve the two Actors' existing order. The exact
  film, employment rows, first take and whole-save admission are the positive
  authority, not a fabricated roster discriminator.
- Add zero-tick policy controls for credited Actor P3-first, uncredited Actor's
  unchanged cast-first order, primary Director's declared order, failed
  candidate purity and deterministic promised-Director priority. Preserve
  ordinary unpromised choices. These controls do not stand in for the real
  D07 win/pay/first-take witness.
- Keep precise refusal controls when the displaced Director is busy, lacks a
  lawful Acting assignment or would repeat a seat. Any detached discriminator
  is labelled and begins from an admitted positive; no detached row is claimed
  as natural rival authoring or completed work.

All setup and replay ticks still count toward 260. No extra variant, fallback
seed, funding rescue, production experiment or automatic retry is authorized.
If the fixed positive premise fails, retain it as a failure and attribute the
actual cause before changing the fixture or policy. Existing D01/D02 player
Actor and committed-Director controls remain separate; they cannot be reported
as the missing rival Actor proof.

Source basis: `src/core/promises.ts` (`stockGreenlightAvailable`,
`seatedPreFirstTake`, `expectedFirstTakeWeek`, `retirementQuoteTakeWeek`,
`promiseFeasibility`); `src/core/talentMarket.ts` (`rivalProposalTrigger`,
`seatsHeldAfter`, `survivesFreeze`, `advanceTalentMarketWeek`,
`authorRivalPromise`); `src/core/hollywoodTick.ts` (`staff`, `decide`);
`src/core/hollywoodStartingData.ts` (`RIVAL_TEAM_ROLES`); public custom and
production actions in `src/core/actions.ts`. The companion's §§4.2–4.3 and
Example D preserve discipline eligibility; §2.1.4 preserves the rival seat law.
No frozen 1112-A/B/C text or other source/artifact was edited.
