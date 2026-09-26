# 821 — C.2-RM retirement read models: reconnaissance for the expansion (NOT an expansion, NOT a contract)

Parent, 2026-09-26, at `77c41b02` after the C.2b matched pass. Written so the next owner starts the C.2-RM
expansion from source facts. Every line is SOURCE (read at the cited place) or OPEN (a question the expansion
must answer). Nothing here is decided.

## 1. What the authority requires the player to see (companion `P14-PREPARATION-COMPANION.md` §6.2)

| # | requirement, quoted or closely paraphrased | companion §6.2 paragraph |
| --- | --- | --- |
| R1 | "The window opens a visible planning fact on the profile; it forces nothing." | Eligibility |
| R2 | "Announcement is a public event on the profile, the roster, the calendar's commitments and the Talent Market's attention list." | Intent and announcement |
| R3 | The extension is "submitted through the proposal path as a one-issuer case variant (visible as discovered; proposable by exactly one `StudioId`; no competing studios)". | The one final extension |
| R4 | "the profile gains an alumni summary; every cross-view link still resolves". | What retirement preserves |
| R5 | `finishing_commitments` is "the explicit state" a person enters when a seat is uncleared at E. Showing it is implied by R2's "public event", not quoted. | Obligations first |
| R6 | 773 §8 note 1: C.2-RM discloses the interpretation that an announced writer under contract may take a new writing assignment. | 773 |

## 2. Where the bridge stands today (SOURCE, at `77c41b02`)

- **No bridge read model shows retirement at all**, except C.2b's exclusions and rewordings (`market.ts:74`,
  `contract.ts:148`, `industry.ts:206`). `grep retirement|careerLifecycle|lifecycleStatus|alumni bridge/*.ts`
  finds nothing else.
- **Profile, roster, person attention and market attention** are built in `bridge/people.ts`; the schema
  objects are `StudioPersonProfileSnapshot` (`bridge/schema/bridge-schema.ts:2718`), `StudioRosterSnapshot`
  (`:2794`), `StudioPersonAttentionSnapshot` (`:2352`) and the market attention rows, whose cause enum is
  `MARKET_ATTENTION_CAUSES` (`:2461`: `decisionWeekNear`, `newCompetingProposal`, `termsRevised`,
  `settlementCompleted`, `proposalWouldFail`, `promiseDue`, …). An announcement cause and an extension-window
  cause would be new members.
- **There is no calendar view.** `campaignDate` is imported by several routes, and the only dated-commitments
  list is `bridge/finance-upcoming.ts` ("Known commitments only…", `:53-62`). OPEN: does R2's "calendar's
  commitments" mean that list, a new calendar surface, or is it deferred to Unity?
- **The C.2b extension case is excluded from every case reader** (806 §6, 811 Follow-up) because R3's surface
  was assigned to C.2-RM. **The bridge proposal path accepts only catalogue terms** (811 §6.4), so R3 needs the
  quote and submit routes to carry the one required term `E + 52 − D`.
- **Projection is 50** (`bridge-schema.ts:269`). Any new snapshot field or enum member is a projection step with
  C# regeneration under `generated/` and `check:bridge-contract`. 773 D16 held projection 50 through C.2a by
  deferring exactly this work.

## 3. Questions the expansion must settle (OPEN)

1. One projection step for R1–R5 together, or split (for example R3 alone first, since C.2b's engine path
   already exists and only the bridge blocks the player)?
2. R2's calendar (above).
3. R4's alumni summary content: which facts (years active, final employer, films, awards) come from existing
   authorities without inventing history?
4. How the extension offer reads for a RIVAL's employee: companion R3 says "visible as discovered". Does the
   player see another studio's one-issuer case, or only their own?
5. Whether `finishing_commitments` needs its own profile/roster wording (R5) or reuses an existing busy fact.
6. Every new sentence is CANDIDATE wording; the Owner's direction 10 names the extension ("one final
   extension"), and C.2b's sentences already use that phrase.

## 4. Suggested first steps (the next owner decides)

T0 is likely unnecessary: C.2-RM adds read models, and no save step is expected. OPEN: confirm no read model
needs persisted state. Then an expansion record with a requirement → surface → test map, a review, an API
contract fixing the snapshot shapes and the projection number, a RED, and the writer.
