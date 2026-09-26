# 863 — C.2-RM retirement read models: expansion draft

2026-09-26, parent design work against published `7ca52f87`, while Scientist full
run861 owns unchanged source. This document is a reviewable proposal, not a writer
release, API contract, independent review, or verification result. No source,
schema, test or fixture has changed for C.2-RM. It supersedes821's source facts where
the Scientist checkpoint moved Save36/projection50 to Save37/projection51.

Authority: companion §§6.2/6.4,773's C.2-RM split and §9.1 writing interpretation,
780/806's landed extension law,840's Scientist amendment. Existing privacy,
determinism, historical-reader and runtime-recovery laws remain controlling.

## 1. Player outcome and boundary

An eligible professional's profile explains the retirement window without saying
they have announced. Once a real record exists, profile, active roster, dated
commitments and Market attention report its actual status and effective week.
The employer can discover, quote, submit, revise and withdraw the one final
extension through the existing proposal route. Other studios can read the public
case but cannot offer. A person finishing commitments is identified accurately.
Retired people leave the active roster, remain directly addressable by PersonId,
and have a summary and a paged alumni entry with recorded history intact.

This is one projection step,51→52. Save37, protocol4, lifecycle intent1 and promise4
stay. C.3 profession transitions, new replenishment policy, awards, native Unity,
new financial charges and new lifecycle/relationship game rules are outside it.
Generated C# is part of the wire change; running native Unity is deferred.

Completion requires an independently authored RED, qualified outgoing51 recovery
fixtures, focused GREEN, type/generated checks, independent stable-diff review,
an attributable matched full pass and a recoverable published checkpoint.

## 2. Source findings that constrain the implementation

- `bridge/people.ts` builds every stable person's profile and an active-looking
  roster from all profiles. It has no lifecycle field; unassigned work can display
  `Available` even for an alumnus. Profile/career links currently use the persistent
  PersonId. Career rows are capped at24, so their length is not a career total.
- `bridge/world.ts`, `people.ts` and `market.ts` deliberately hide every latest
  extension case under806. All three exclusions must be replaced together. Merely
  removing one would create a route whose detail is null or call an extension a
  renewal contest. Industry uses the same world-route reader.
- `bridge/contract.ts:marketProposalDraftToEngine` accepts only catalogue terms.
  The core requires `decisionWeek + termWeeks = effectiveWeek + 52`. The decision
  week is the ending employment's boundary and can precede E:52 is not always the
  required term.806's deliberate52–63-week pricing and no-promise rule already exist.
- The only existing dated commitments view is `financeUpcoming`. It is bounded at
  64 rows per13/52-week window. It currently advertises ordinary renewal windows
  using contract dates alone. Retirement cannot become an automatic payment row.
- Industry already supplies paged filmography and employment and resolves persons
  after employment ends. There is no alumni discovery view. Current profiles are
  a full identity dictionary; changing that transport is a separate performance
  concern, not a reason to break existing direct profile links in this slice.
- No recorded awards/honors authority exists in `src/core` or the bridge. Blueprint
  award prerequisites are not personal honors. The honest alumni result is an
  explicit recording gap, not zero awards, a derived rank, or invented biography.
- Relationship tiers drift on read. `relationshipBlockFor` currently uses one week
  both for counterpart disclosure and for `pairChemistry`. Freezing alumni tier
  presentation at retirement must not reuse the historical week for disclosure or
  reveal a former employee who is no longer independently visible today.

## 3. Proposed implementation decisions (bounded review required)

| ID | decision | basis/class |
| --- | --- | --- |
| RM1 | One projection52 for the connected surfaces and proposal correction. | Delegated implementation; avoids inconsistent case links. |
| RM2 | Derive lifecycle facts from `retirementWindow` and `retirementRecordFor`; never infer an announcement from age alone. | Existing law, companion eligibility. |
| RM3 | Use the existing dated-commitment list for calendar disclosure. Add a nonfinancial retirement row with a profile route and the real E. | Proposed reading of the absent-calendar requirement. |
| RM4 | Publish extension cases to every existing case reader, with explicit variant and sole issuer; publish figures only through `caseDisclosure`. | Companion visible-as-discovered plus A.1 privacy. |
| RM5 | Distinguish open extensions from ordinary renewal cases; closed cases keep the variant. | Delegated presentation; an extension is never a contest. |
| RM6 | Keep finishing people visible with explicit state/work wording; remove only retired people from the active People roster. | Obligations-first and companion alumni. |
| RM7 | Add a paged Industry `alumni` discovery view; preserve the existing complete profile dictionary and direct person/film/employment routes. | Delegated bounded read model; no identity deletion. |
| RM8 | Alumni totals name their recorded basis. Reuse authoritative credits/filmography, existing provenance, employment and viewer-scoped promises. | Preservation, no historical backfill. |
| RM9 | Alumni collaborator values read at retiredWeek, while counterpart visibility still reads at the current week. Expose that as-of date. | Companion §6.4 presentation freeze; no change to core relationship law. |
| RM10 | All prose is candidate wording. Use “one final extension”, “finishing commitments” and “retired from [profession]”; never claim industry retirement. | Owner wording and deferred C.3 distinction. |

RM3 needs special scrutiny: retirement announcements are public facts, including
rival people, so the dated list may include all recorded announced/finishing
persons. Such rows have `weeklyOperatingCostChange: null` and cannot imply an own
payroll obligation. Keep existing sorting, windows, bounds and overflow disclosure.
An overdue finishing row retains E and states no final date is known; it does not
predict a release. Retired rows leave the upcoming list. No synthetic event or
read timestamp is persisted. Review must reject a misleading finance/calendar
interpretation before writer release, rather than silently narrowing R2.

RM9's read is feasible under today's one-profession lifecycle: all binding work
clears before retirement and therefore cannot drive a later edge update. This
premise must be tested, not assumed from synthetic retired records. If a lawful
post-retirement edge update is found, do not reconstruct an old tier from a newer
compacted edge or silently change game law. Escalate that concrete conflict.
C.3 must re-evaluate the premise when new-profession work becomes possible.

## 4. Required wire information (the subsequent API contract fixes shapes)

**Profile.** A required lifecycle block with active/announced/finishing/retired
status, profession-window ages and eligibility planning text. Actual record fields
are nullable when no record exists: announced week, effective week, finishing-from
week, retired week, extension-used/extended-from. Date labels come from
`campaignDate`. Eligibility is a planning fact, never an intent prediction.
Publish the interpretation that an announced writer under current contract may
take a writing assignment and finish it if it outlasts E; no new release-date law.

**Roster and Industry person.** A compact lifecycle status/line alongside existing
public identity/work facts. A finishing person's label cannot be `Available` or
`Free agent` without its explicit no-new-work qualification. Retired profiles say
alumnus/retired-from-profession, offer no staffing action and no Locate action.
Roster counts derive from the filtered rows. Industry person/credits/employment
remain resolvable; the alumni page orders by retired week descending, then
PersonId, and uses existing1–50 page-size/request validation conventions.

**Attention.** Distinct retirement-announced, finishing-commitments and own
extension-window causes. Group public retirement news without manufacturing an
actionable rival decision. Preserve ambiguity/blocking priority. When an own open
extension is actionable, the cohort and case deadline must not advertise ordinary
renewal. Announcement attention cannot depend on having a market case: announcement
invalidates ordinary cases and a free agent may never receive an extension case.
Terminal records are history, not perpetual “decision now” alerts. Final API must
state retention/deduplication and ordering using recorded weeks, without adding a
new persisted unread marker or an automatic time-advance stop policy.

**Market.** Explicit `expiry | retirementExtension` variant on list and detail.
For an open extension: sole issuer id, whether the viewer may offer, exact required
term, decision week and ending boundary. Derived terms disappear when the case is
closed; never recompute a second extension from the already-extended record. A
rival's salary, bonus, premium and promise stay UNKNOWN by the same disclosure
reader. Closed extension reasons stay readable through the existing case detail.
The world route opens that same detail and says one final extension, not renewal.

**Proposal.** Admit the exact extension term only for the matching open extension
and eligible issuer. Ordinary catalogue checks stay. Pricing, affordability,
material terms, decision timing, no-promise refusal and settlement remain the
engine's. Quote mutates nothing; commit revalidates current state. The remedy for
an unaffordable fixed-term extension cannot suggest shortening its term. Labels
must show actual start D and end E+52 even when D<E, without inventing a gap.

**Alumni.** Summary exists only for a real retired record: profession, retired
week/date, extension-used fact, actual recorded credit count and its provenance,
last recorded employer if available, recording notices and links to existing
filmography/employment/promise/collaborator evidence. Do not sum the profile's
bounded24 career rows or call absence of evidence “never worked”. Honors explicitly
say unrecorded. Keep numerical relationship strengths and undisclosed counterpart
identities off the wire; show the tier-as-of date with the existing disclosed block.

## 5. Independent acceptance map

| ID | requirement and adversarial control |
| --- | --- |
| RM-A | All five professions' eligibility windows; before-window and eligible-with-no-record profiles do not invent an announcement. Include a genuine lifted old save. |
| RM-B | Natural announcement produces identical weeks/status across profile, roster, commitments and market attention even without an open case; repeated reads leave canonical save unchanged. |
| RM-C | A real held production or writing assignment reaches finishing; the wire shows committed work, overdue E and no predicted completion. Release/cancel leads to real alumni and removes the active roster row. |
| RM-D | Extension discovery produces the same variant/detail through profile, Market and world/Industry route. Own issuer actionable; rival issuer public but read-only; undisclosed figures remain UNKNOWN. |
| RM-E | Required term52 and a genuine D<E off-catalogue term quote/submit/revise/withdraw through BridgeSession. Wrong term, other issuer, no open case, promise and second-extension attempts refuse without mutation. |
| RM-F | Quote versus current-state commit, stale revision, insufficient funds, decision tick, duplicate command replay and save/load preserve the engine's one-use and no-payment-before-settlement laws. |
| RM-G | Accepted, declined, expired and invalidated extensions show accurate terminal history and no fresh opportunity. The old ordinary-expiry path is unchanged. |
| RM-H | Retired profile and all old credit, filmography, employer and promise links resolve to the same PersonId. Credits exceed24 to expose capped-row miscount. Same-name persons remain distinct. |
| RM-I | Alumni pagination, out-of-range page refusal, stable ordering, roster counts and bounded commitment overflow are exact. A terminal record never silently vanishes from history. |
| RM-J | Relationship tier is stable after retirement while current counterpart disclosure changes lawfully; no root/no edge/pre-feature gap remains honest. No core relationship or quality law changes. |
| RM-K | Scientist research retirement/finishing uses the same status fields without leaking rival project, seat, budget, work receipt or capacity counts. The fixed player pool remains unchanged. |
| RM-L | Genuine outgoing51 runtime with distinct current/saved slots and nonempty journal uses the enumerated prior path once; ordinary52 rehydrate/replay is exact, corruption/unknown identity still refuses. |
| RM-M | Cross-campaign isolation for identical PersonIds and Save As branches; no mutable singleton cache. Generated contract/fixtures and both TypeScript boundaries agree with the whole snapshot. |

Synthetic setups must be explicitly labelled and validate as whole live saves.
They supplement natural seams; they do not prove natural discovery, reaching a
retirement, or an old writer's runtime bytes. Existing frozen fixtures and their
expected identities stay byte-identical.

## 6. Order and ownership

1. Close861, compare837 by identity/cause, address new defects and publish the
   Scientist qualification. No C.2-RM source release before that gate.
2. Review this expansion; resolve concrete scope/privacy objections. Fix the API
   shapes, attention retention and exact tests in a subsequent contract.
3. While51 is still current, mint genuinely generated outgoing runtime51 evidence
   on qualified source, including distinct current/saved slots and a journal.
   Record command, source, digest and whole-save validity. No save migration is
   invented for a projection-only change.
4. Independent test owner writes/records RED against unchanged51. Sole production
   writer follows the reviewed contract. Parent owns the single heavy test lane.
5. Focused GREEN, generated/type checks, independent frozen-diff review and matched
   full pass; attribute changed historical pins before maintenance, publish and
   verify the actual GitHub ref. Continue C.3 under its own expansion afterward.

No prior specialists were recreated. The old `c2c_contract_auditor` target is not
resumable in this restarted thread. The Owner explicitly answered “Allow specialists
for the next new task”, in response to the question about fresh C.2-RM specialists
after Scientist verification, at most two concurrent, with separate production/test
ownership. Fresh specialists may therefore be assigned after that verification gate.
No independent C.2-RM review or test ownership is claimed before assignment.

## 7. Outgoing51 fixture preparation notes (unrun)

The preserved genuine V33 Scientist input used by842 is suitable without changing
age, provenance, employment or history. Its compressed SHA256 is
`81a1136a90abc6b0c8ae88684ac379e9f3a6faeafe68b12acd26f3e8b0154714` and its raw
SHA256 is `fda192a00c71fa66284cc51a4e9e5e0a41b409e0919a1c0a050f79cb0904bd2f`.
The input is `tests/fixtures/p14/genuine-v33-c2-corpus/genuine-v33-c2-scientist.json.gz`.
Scientist S1 has already established that the genuine live continuation has no
Scientist retirement record through617, announces618 at age63, and gives E670.
Do not confuse it with the separate synthetic hard-boundary branch's566/618 dates.

After qualification, a new one-shot producer can lift the genuine input with the
unchanged current37 writer and retain validated617/618/669/670 snapshots. Build a real
BridgeSession at669 with a real saved669 slot, submit its published advanceWeek
intent to reach670, and export its runtime51 checkpoint through the actual encoder.
Require an accepted command, distinct saved/current slots, a nonempty real command
journal, correct digests and exact current-schema reopen/duplicate replay. If the
public advance is unavailable, report the actual blocker; do not manufacture a
journal or edit a checkpoint's schema/version. The natural retirement at670 and
the final session command are still UNRUN as a producer in this restart. This
choice makes the saved slot announced and the current slot retired, so the two
real states straddle the lifecycle transition rather than only a quiet week.

The producer must refuse an existing output directory, record its own hash and the
actual source commit, and assert that production still equals697a6039 before and
after. It runs after861 and pending literal repair verification, in the sole heavy
lane, before any52 production change. Publish the generated bytes/manifest and
producer before writer release. Existing runtime50 artifacts remain untouched.
