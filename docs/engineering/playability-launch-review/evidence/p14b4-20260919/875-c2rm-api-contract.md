# 875 — C.2-RM exact API and implementation contract

2026-09-26. Supersedes863's proposed shapes and calendar premise, incorporates
independent873 and acceptance reconnaissance874. Source/T0 checkpoint
6d339eba04043bf52824eb1844f259660a9cbd32, actual remote verified; production still
697a6039. Scientist871 qualified. This is a contract for independent RED and the
following sole-writer implementation, not a verification claim.

## Boundary and owners

Projection51→52 once, actual outgoing51 registered under its exact a690e6f9… schema
identity. Save37/protocol4/lifecycle intent1/promise4 unchanged. No core lifecycle,
relationship, compensation, replenishment or transition law changes. Existing pure
Calendar projection and React Calendar routing/copy are in scope to satisfy the
explicit calendar requirement. Generated C# is required; Unity/native deferred.

Parent owns production: bridge/schema/protocol/readers/contract; generated outputs;
src/core/studioCalendar.ts (presentation only); optional shared pure credit/calendar
reader; ui/src/screens/StudioCalendar.tsx and App profile-route adapter. No save,
tick, tuning, reducers or old fixture changes. Independent c2rm_tests owns only new
tests/helpers assigned below. c2rm_contract_review owns read-only review. Parent
owns all test/generator runs, publication and legacy expectation maintenance.

## 1. Lifecycle and alumni DTOs

Every People profile gains required `lifecycle` and nullable `alumni`.
Lifecycle has these exact required fields:

- `status`: active | announced | finishing_commitments | retired (same core names).
- `profession`: existing profession enum; recorded profession when a record exists.
- `eligibleAge`, `hardAge`: integer ages read from retirementWindow, never copied
  tuning. All five live professions have windows after Scientist840.
- `eligible`: boolean age>=eligibleAge; a planning fact, not an intent forecast.
- `line`, `planningLine`: nonempty public text. State explicitly retirement from
  that profession. Planning never claims that reaching the hard age removes them.
- `announcedWeek`, `effectiveWeek`, `finishingFromWeek`, `retiredWeek`: nullable
  nonnegative integer, exact record values or null with no record.
- `announcedLabel`, `effectiveLabel`, `retiredLabel`: nullable campaignDate labels.
- `extensionUsed`: nullable boolean (null without a record).
- `extendedFromWeek`: nullable nonnegative integer, exact record value.

No intent inputs, private research details or guessed future dates. Announced
writers' planning copy preserves773§9.1: a current contracted writer can take new
writing and finish it after E. Finishing copy states no new work/contract may attach
and gives no predicted completion. Eligibility can remain true after retirement;
status, not that planning-age flag, controls availability.

`alumni` exists only for a retired record. Required fields:
`profession`, `retiredWeek`, `retiredLabel`, `extensionUsed`, `recordedCredits`,
`authoredCredits`, `campaignCredits`, `uncapturedFilms`, `creditBasis`,
`recordingNotice`, `honorsNotice`, `lastEmployer`, `filmographyRef`, `employmentRef`.
Counts are nonnegative integers. Count ROLE-CREDIT rows in actual public released
film credits, not distinct films, career-event count or the latest24 profile rows.
Authored credits use authored-start/v1; campaign credits use captured player or
simulated rival credits. Recorded total is their sum. This agrees with the current
Industry creditCount unit and counts two roles on one picture twice, labelled
“recorded credits.” Unknown legacy participants stay unknown; uncapturedFilms is
the existing honest global player-history gap and the notice states its scope.
`recordingNotice` is nullable text; `creditBasis` and `honorsNotice` are nonempty.
Honors explicitly unrecorded; no fabricated zero, rank or years-active biography.

`lastEmployer` is null or `{studioId, studioName, fromWeek, toWeek}` from the last
recorded employment interval, ordered by actual end then existing ordinal. It is
public identity/dates only, no rival salary. `filmographyRef` is
`{view:'person', targetId:PersonId}`; `employmentRef` is
`{view:'employment', targetId:PersonId}`. Existing profile career/collaborators/
viewer-scoped promises remain in place and directly reachable under the same id.
No historical state or receipts are backfilled to populate these facts.

Roster rows gain required `lifecycleStatus`, `lifecycleLine`. Filter only retired
people out of People roster; counts derive from remaining rows. Finishing stays
explicit, including when an unassigned work label would otherwise say Available.
All profile identities remain in the profile dictionary. Retired profile presence
cannot offer Locate or staffing; finishing/retired availability copy is explicit.
Contract expiry remains truthful; ordinary renewal labels/attention are suppressed
when lifecycle leaves no ordinary option. Open final extension uses its own wording.
Do not change core action availability merely to make labels agree.

Industry person rows gain required `lifecycleStatus`, `lifecycleLine`, `retiredWeek`
(nullable). Existing person/film/credit/employment routes remain. Add `view:'alumni'`
to request/response. It returns retired persons in `people`, ordered retiredWeek
descending then PersonId ascending, using existing page/pageSize1–50 validation
and out-of-range refusal. targetId must be null for that list; existing per-person
routes supply detail. No additional full unbounded alumni snapshot list.

## 2. Real Calendar and bounded Finance commitments

Add core Calendar commitment kind `retirement`, with existing CommitmentBase
(`certainty:'committed'`, `week:E`, `ownerId:PersonId`, `occurrenceIndex:0`) plus
`talentId`, `talentName`, `profession`, `status` (announced|finishing_commitments),
`announcedWeek`. Public actual records only. Every announcement is visible in the
Calendar immediately, even E>A+52. Keep overdue finishing at original E; retire
removes upcoming row. E is the recorded retirement boundary, not a guarantee of
final completion: copy names finishing obligations and unknown final completion.
Stable existing date/kind/owner ordering; new kind appended to existing kind order.

React Calendar renders those facts and an Open Profile button. Add a `profile`
Calendar route with talentId; App uses its existing openTalentProfile without
rebuilding person identity or navigating a rival into the player's roster. Preserve
return/focus behavior. The screen's committed-schedule explanation includes public
announced retirement boundaries without implying an automatic charge.

Bridge financeUpcoming gains event kind `retirement` for the same actual public
records, `weeklyOperatingCostChange:null`, profile route and explicit nonfinancial
copy. Keep existing13/52 windows, inclusive W..W+12/W+51,64-row limit, stable sorting
and overflow counts. An E outside the chosen window is correctly absent here while
remaining visible in the Calendar/profile. Overdue finishing rows remain eligible.
Basis/overflow text must account for public retirement facts and profile routes.
No new budget/payroll obligation or silent horizon widening.

Suppress misleading ordinary-renewal rows/labels for announced/finishing/retired
people in People, Finance and Calendar where no ordinary term is available. Retain
actual contract expiry separately. The same holds after an accepted extension:
never advertise a second extension. Calendar staffing-horizon fields/copy must
also avoid presenting an unavailable ordinary window as open; use a lifecycle
qualification if its retained date remains for historical/contract context.

Implementation clarification: reuse contractEndRefusal over published ordinary term
options at max(currentWeek, openingWeek), so a rare still-lawful term ending exactly
at E is not hidden merely because a record exists. Calendar staffing's
`renewalWindowWeek` becomes nullable when no ordinary term can fit; `renewalOpen`
is false in that branch and its UI says ordinary renewal is unavailable while
retaining the exact expiry. This changes presentation, not admission.

## 3. Extension case and command route

Market list rows and profile/selected case blocks gain required
`variant:'expiry'|'retirementExtension'`, `soleIssuerStudioId:string|null` and
`retirementExtension` nullable block. Ordinary cases have null issuer/block.
Extension issuer is the case's actual subject employer, retained even when closed.
The block exists only for an exact OPEN extension and has required:
`issuerStudioId`, `viewerCanOffer:boolean`, `requiredTermWeeks:positive integer`,
`startWeek:D`, `endWeekExclusive:E+52`. D is the existing decisionWeek. Do not
derive a fresh opportunity from E after acceptance; closed extension block is null.
One-issuer labels on every reader; no renewal contest/competing-studio copy.

Remove the extension exclusions from People/Market/world together. World route
continues to link OPEN cases only; closed detail remains in existing latest-case
history. A selected Market case equals its profile marketCase. Existing latest-case
limitation remains; this slice does not promise independent routes to every old case.
Rival prices, bonuses, premium and promises remain UNKNOWN through caseDisclosure.
Review877 adds a specific acceptance control: extension settlement/dropped reasons
must belong to that extension's own opened/closed span and terminal outcome.
Never carry an earlier ordinary case's reasons into an open or differently closed
extension. Correct this in bridge readers; preserve ordinary-case/core behavior.

Proposal catalogue exception is EXACTLY a matching open retirementExtension whose
eligible proposer is the supplied issuer, with term E+52−D. Core proposalDraft/
submitProposal/pricing are the authority; ordinary catalogue terms remain unchanged.
Invalid term/wrong issuer/no case/promise/second-extension attempts cannot mutate.
Quote/submit/revise/withdraw use the existing BridgeSession path. Quote is pure;
commit revalidates current state; stale revision/duplicate/runtime rules remain.
No bonus is paid until settlement. Show start D/end E+52 and exact term, including
the genuine58-week path. Unaffordable fixed-term copy offers lower compensation
or waiting for cash, never shortening the term. No new intent kind or engine law.

## 4. Attention: retention, priority and ordering

Add Market causes `retirementAnnounced`, `finishingCommitments`,
`retirementExtensionOpen`. Scan lifecycle independently of case entries:

- announcement news iff status is not retired and 0<=W−announcedWeek<13;
- finishing information while status=finishing_commitments;
- extension decision only while that exact case is open and viewer is its eligible
  sole issuer. Rival cases remain readable without an own-decision alert.

The13 weeks reuse Industry's recent-news presentation convention. No new persisted
unread state, gameplay rule, automatic advance stop or refusal is introduced.
Deduplicate by cause/PersonId. Keep existing case/promise ordering; append lifecycle
news ordered finishing before announcement, then their recorded event week ascending
and PersonId. Own extension row comes through case attention in existing case order;
there is no competing-proposal cause on an extension. Terminal case history can keep
the existing settlementCompleted cause but no extension-open decision survives.

People's one-per-person cohort priority retains ambiguous work then blocked presence;
own open extension follows as decision, finishing as info, recent announcement as
info, then existing ordinary contract attention for persons without a retirement
record. Lifecycle facts remain on the profile after news ages out. Cohort keys
`retirement-extension`, `finishing-commitments`, `retirement-announced`; labels state
the same facts. This priority is presentation only.

## 5. Retirement-dated collaborators

BridgeRelationshipBlock gains required nullable `asOfWeek`, `asOfLabel` and
`historicalTierNotice`. Active profiles use nulls (ordinary current read).
Retired profiles use retiredWeek/campaignDate, while counterpart disclosure still
uses current W and the existing strict employment predicate. Shared credit counts
and historical links remain current recorded facts, not invented historical totals.

For a disclosed retained edge with lastEventWeek>retiredWeek, a historical tier
cannot be reconstructed. Publish null tier/sign0/empty drivers for that row and
nonempty historicalTierNotice explaining the unavailable retirement-dated tier.
Never emit its later value under an as-of label. Do not inspect hidden edge dates
to disclose a new notice about an undisclosed counterpart. No-root/no-edge cases
retain existing honest distinctions. No edge ids, magnitude, closeness, private
counterpart ids or raw root vocabulary leak onto the DTO.

Natural tests must show retired-subject incident edges unchanged through continued
lawful play and discriminate freeze from current drift across a tier boundary.
A reachable later driver is a real contract conflict; report it before changing
game law. A valid imported newer-edge adversarial shape merely receives the honest
unavailable-history presentation above. C.3 must revisit this premise.

## 6. Acceptance and sequence

874 RM-A..M governs with these refinements: RM-B asserts immediate actual Calendar
parity and honest Finance window exclusion at A; RM-I tests the Finance64-row bound,
actual Calendar discovery and paged alumni; RM-H counts role-credit rows and includes
multi-role credits. Add ordinary-renewal suppression before/open/used-extension,
13-week retention endpoints, and newer-edge history guard. The Scientist617/618/
669/670/runtime51 corpus is preserved by872; future52 prior migration resets old
session/journal authority under the existing enumerated path, independently lifts
both slots and reopens current52 without another migration. New52 command replay
must be exact. Corruption/unknown schema/cross-campaign isolation remain covered.

Independent test ownership: new tests/bridge-p14c2rm-retirement.test.ts,
tests/bridge-p14c2rm-proposals.test.ts, tests/bridge-p14c2rm-runtime.test.ts,
tests/helpers/p14c2rm-fixtures.ts, plus a new Calendar component/core test file if
needed under that owner's followup assignment. No prior tests/fixtures rewritten.
Parent records RED on unchanged51, attributes premise failures before correction,
then releases the sole production writer. No timeout changes or skipped requirements.
Focused GREEN, generated/type checks, independent stable-diff review, matched full
verification and recoverable publication follow. Do not claim rendering/native
acceptance from DTO tests. Continue C.3 only after this bounded qualification.
