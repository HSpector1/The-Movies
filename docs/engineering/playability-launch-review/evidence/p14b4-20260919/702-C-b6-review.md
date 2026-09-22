# 702-C — P14B.6 read-model checkpoint review (contract-auditor, READ-ONLY, no commands run)

**VERDICT: QUALIFIED WITH RECORD-ONLY ITEMS.** No leak of the rival industry graph found on the
profile carrier; the two items below are a prose/authority gap and an untested copy branch, not a
behavioural break of the landed law. Nothing here is Owner acceptance, and nothing here closes the
deferred slices (in-flight `activeSlate` carrier, the natural warning route, the production-quality
modifier). No Unity screen reads any of this yet.

## The eight questions, in order

**Q1 — disclosure. MET WITH EVIDENCE on the profile carrier; DEVIATES (narrow, record-only) on the
casting carrier.** Both call sites enumerated before my Grep/Glob died (see limits): the block reaches
the wire only at `bridge/people.ts:530` and the rows only at `bridge/casting.ts:729-730`.
- `bridge/people.ts:489` fixes the viewer as `state.hollywood?.playerStudioId ?? ''`, never the
  subject's employer, so a rival person's profile discloses only the *player's* employees.
- `bridge/relationships.ts:77-84` restates `src/core/talentMarket.ts:794-801` verbatim — same
  `studioId` filter, same subject exclusion, same strict `startWeek < W && (endedWeek === null || W <
  endedWeek)`. Committed-at-W and closed-at-W are both OFF, and the RED pins both boundaries on one
  engine-built world (`tests/bridge-p14b6-relationship-read-models.test.ts:421-451`).
- Rows iterate `[...disclosed].sort()` (`:137`) — the counterpart set *is* the player roster, so a
  counterpart the player cannot see cannot be constructed. The RED's exact-set completeness/narrowness
  check (`:487-499`) is the strongest pin in the file. `withheld` publishes one boolean sentence with
  no count and no identity (`:150-152`, copy at `:48-51`).
- `bridge/market.ts:201-236` composes labels and a `profileRef` only — no second carrier.
- I could not break the profile path. **The gap is the casting path**, see DEMONSTRATED 1.

**Q2 — leak law. MET WITH EVIDENCE.** `tests/bridge-p14b5-relationships.test.ts:411` carries the seven
probes byte-for-byte as the brief lists them; the surrounding comments are the pre-B.6 662-T2/657-B
amendments. New DTO fields are `counterpartId/counterpartName/tierLabel/sign/drivers/sharedPictures`
and `seatA/seatB/talentIdA/talentIdB/tierLabel/sign/drivers/line` — no probed key form, no
`relationship-edge-` prefix; the `$def` name `StudioRelationshipBlock` never appears as a key
(emitted JSON confirms the key is `collaborators`, `project-studio-bridge.schema.json:11215`, and the
row shape at `:2011-2089`). I did NOT read the generated `.cs` bytes (limits).

**Q3 — 694-C forward constraint. MET WITH EVIDENCE.** Every string the feature can emit: the six copy
constants `bridge/relationships.ts:48-59`, and drivers verbatim from `DRIVER_COPY`
(`src/core/relationships.ts:350-356`) plus `'they have not worked together lately'` (`:373`). No digit
in any of them. `sign` is the tier-rank sign (`src/core/relationships.ts:371`), never a stored delta;
`sharedPictures` is a credit count ruling 3 (ii) names. Nothing restates `driver.delta`.

**Q4 — scope. MET WITH EVIDENCE.** New module is a pure projector over `pairChemistry`,
`firstTakes`, `releasedFilms`, `hollywood.employment`. No driver kind, tuning constant, refusal, RNG
or save state; `LIVE_SAVE_VERSION` stays 31 (`bridge/runtime-checkpoint.ts:60-65` registers the
outgoing projection-48 identity and says so). `greenlightQuoteSnapshot` computes fit, profit range and
demand *before* and independently of the two chemistry fields (`bridge/casting.ts:688-690` vs
`:729-730`); the RED asserts the quote is byte-identical apart from those two fields
(`tests/...:659-665`). No result/forecast/cost path consumes chemistry. `F12_P05_PRODUCTION_SENTINEL`
unchanged (`700-gen-hash.txt:6-7`) is real evidence the change is confined.

**Q5 — the four decisions. MET WITH EVIDENCE.** D1 key is `collaborators` (`people.ts:224,530`;
schema `:2640`). D2 rows/warning only on the quote; screen-test and sign-contract carry `null`
(`casting.ts:629-630, 793-794`) rather than an empty array. D3 no `scope` field (`:2590-2608`). D4
`chemistryOf` (`relationships.ts:67-69`) returns `pairChemistry`'s own no-edge answer without calling
it, and `requireRelationshipsRoot` is untouched. I re-verified the D4 reachability argument
independently at the two points I can reach: every session load runs `migrateToV31`
(`bridge/session.ts:136`), the one unmigrated `importSave` refuses non-V31
(`bridge/runtime-checkpoint.ts:464-470`), and `generateWorld` mints `relationships: []`
(`src/core/worldgen.ts:787`). Defensive-only stands.

**Q6 — sweep. MET WITH EVIDENCE for the items I can see.** R2's new literal in
`tests/bridge-contract-generator.test.ts:687-688` is
`d54e94725f3a8b516493a7a7e1a65727bd3b61019228763a63d8e9facfb9f139`, equal to the probe log
(`700-gen-hash.txt:4-5`, `exitCode 0`, `fixedSource true`); `F12` at `:689` is the unchanged
`78d68a2d…`. Prior-id rosters keep `toEqual` on sorted key lists and gain exactly one id in sorted
position (`700-T2-sweep-report.md:59-73`). R1 was resolved by adding the two required keys with a
`+1` row and `chemistryWarning: null`, and the two `additionalProperties` rejection assertions were
left intact. I did not diff the 28 files myself (limits).

**Q7 — RED honesty. MET WITH EVIDENCE.** S1/S2/S3 are named as staged in the file header
(`tests/...:43-60`), again at the staging helper (`:270-281`) and at the case (`:633-635`); the
natural route is stated untested with the measurement behind it (`698-T1-report.md:95-110`: no fixture
in this repo releases a player picture). Not glossed.

**Q8 — overclaim sweep. Two, both in contract prose, quoted under DEMONSTRATED 1.** The writer report
is otherwise correctly scoped ("A rival-internal pair reaches no DTO **on any profile**",
`699-W-report.md:84`) and states plainly "Nothing here is a native playtest" (`:200`).

## DEMONSTRATED (file, line, contradicting fact)

**1. The wire contract claims a disclosure law the casting carrier does not implement.**
- Claim: `bridge/schema/bridge-schema.ts:248-250` — "A tie is published only when its counterpart is
  independently visible to the player, so a rival-internal pair reaches no DTO"; repeated at `:2638-2639`
  — "A rival-internal pair appears on no DTO anywhere". Same claim in commit `78eadd07`'s message.
- Fact: `bridge/relationships.ts:162-179` applies NO roster or disclosure predicate. It publishes
  `tierLabel`, `sign` and `drivers` for all six seat pairs, and `bridge/casting.ts:729-730` puts them on
  the quote. The only gate upstream is pool membership (`bridge/casting.ts:441-444` checks
  `poolCandidates` only), and a pool member is anyone `available` — player-contracted **or** in the
  freelancer market (`src/core/castingReadModel.ts:134-151, 240-263`). The freelancer market draws from
  `signableUniverse`, which admits an ex-rival employee the moment `rivalEmployment(...) === null`
  (`src/core/employment.ts:356-358, 383-388`), while the edge minted inside the rival's picture survives.
  Seat two such people and the quote publishes a tie where NEITHER is on the player's roster at W — the
  RED's own definition of rival-internal (`tests/...:474`).
- The RED records the opposite as a general truth: `698-T1-report.md:105-107` — "every such pair is
  rival-internal and therefore undisclosed … it can never be seated in a player casting draft". True
  only while both remain rival-employed.
- Why record-only, not NOT QUALIFIED: the blast radius is one reading per pair the *player* seats, both
  ids already in the same DTO, never a third party and never the graph; and ruling 3 (iii) *requires* a
  −1 readout for a proposed seating, so a literal roster filter would delete the warning for freelancer
  seats. The defect is that no authority states the casting disclosure basis and the contract prose
  asserts the wrong one. Fix in the record + the two comments, not in behaviour, unless the Owner rules
  that drivers/tier (as opposed to the one warning sentence) must be withheld for an all-off-roster pair.
- Not demonstrated live: I have no fixture where two edge-sharing ex-rivals sit in one pool, and I ran
  nothing. Treat reachability as unproven, the code path as proven.

**2. `WITHHELD_LINE` can state a false employment fact, and no test covers it.**
`bridge/relationships.ts:49` publishes "Other working ties here are with people you do not employ."
whenever an edge's counterpart is outside `rosterAt`, and `rosterAt` reads only
`state.hollywood?.employment` (`:79`). On a state with `hollywood === null` but live player contracts —
the exact shape the RED's own W6 measures (`tests/...:233-235`, built through
`beginFoundingHistoricalControl`, `tests/contracts/_contractFixtures.ts:1`) — every counterpart is
undisclosed, so a subject holding any edge gets that sentence about people the player *does* employ via
`state.contracts`, and zero rows. Same one-week falsehood for a hire committed at W under the strict
`<`. Families 1/2/3/6 all run on W1/historyFixture (hollywood present); the hollywood-null profile block
is untested. Landed `trustBlockFor` degrades on the same world to a neutral "No record yet"
(`bridge/trust.ts:24`), which is the precedent this line departs from by asserting a fact.

## REFINE (prioritised, not blockers)

1. Two RED cases: the profile block on a hollywood-null world with an edge (pin the line copy), and a
   quote seating two off-roster people who share an edge (pin whatever rule the Owner picks).
2. Record the casting disclosure basis explicitly ("a pair the player proposes is self-disclosing"),
   then correct `bridge-schema.ts:248-250` and `:2638-2639` to scope the claim to the profile block.
   The `78eadd07` message is history — correct it in the checkpoint record, do not rewrite it.
3. Two engine internals are restated in the bridge and will drift silently: `rosterAt`
   (`bridge/relationships.ts:77-84` vs `src/core/talentMarket.ts:794-801`, already flagged by the
   writer) and `SEAT_PAIRS` (`:40-43` vs `src/core/relationships.ts:209-223`, order verified equal, not
   flagged). Close both in a slice that owns `src/core`.
4. `tests/bridge-p14b6-relationship-read-models.test.ts:183` cites `seatPairs` at "relationships.ts
   :390-403"; the real site is `209-223`. Comment only, RED bytes are frozen — fix when it next moves.
5. Usability proposal, not a failure: the wire carries `sign` as a bare −1/0/1 and `sharedPictures` as a
   bare integer with no label. Every client must render them as words or a relationship reads as a
   number on screen. Consider a pre-rendered label the way `line` already is.
6. `chemistry`/`chemistryWarning` are REQUIRED keys (nullable values). Any non-generated producer of a
   casting quote outside `bridge/casting.ts` must emit both. The sweep fixed the two hand-built test
   envelopes; I could not sweep for others (see limits).

## What I could not check, and why

- `701-b6-full-core` is executing and was never available to me. The candidate's whole-suite behaviour
  is therefore unestablished in this review.
- Everything git-level: `src/` byte-equality across `43817117..68fe5985`, tree/patch equality of the
  four writer commits, the leak-law file's zero-diff claim, the `+122/−77` sweep counts and the 28-file
  list. Read-only role, no shell. Parent should run `git diff --stat 43817117..68fe5985 -- src/`
  (expect empty) and diff `tests/bridge-p14b5-relationships.test.ts` for the probe line.
- Grep and Glob failed hard mid-review (`EACCES: posix_spawn 'rg'`) and never recovered. The call-site
  enumeration (two call sites, two carriers) completed *before* that failure; after it I could not do a
  final sweep for other `BridgeCastingQuoteSnapshot` producers, nor read `castingPackageReadModel`'s
  director/craft pool builder — so the director and craftLead pools are assumed, not verified, to carry
  the same availability filter the actor pools do.
- `generated/unity/StudioBridgeDtos.Generated.cs` bytes unread; wire shape judged from the emitted JSON
  plus the recorded `check:bridge-contract` EXIT 0.
- I executed no test, no generator and no native run. A green RED is not usability; a DTO field is not a
  screen; this review is not Owner acceptance.

---

## Parent disposition (added by the parent; not the auditor's text)

ACCEPTED. Two of the auditor's git-level gaps are closed by the parent with a shell, and are PARENT
results, not this review's: `git diff --stat 43817117..68fe5985 -- src/` returns NOTHING, so `src/` is
byte-untouched by B.6; and the leak-law probe line is byte-identical to its pre-B.6 form, only its line
number moving 408 → 411 from content added above it.

**DEMONSTRATED 1 — accepted as a PROSE defect, with one genuine Owner choice isolated.** The behaviour
as landed satisfies ruling 3 (iii), which requires a −1 readout for a seating the player proposes, and
the parent's reading is that a pair the player is actively proposing to seat is SELF-DISCLOSING: the
player chose both people and both ids are already in the request. Withholding their history while still
warning about it would be strictly worse for the player and would gut the feature for freelancer seats.
So the fix is to the two contract comments, which overclaim, and to the record — not to the behaviour.
The residual Owner choice is isolated and does not block B.6 (see the checkpoint record).

**DEMONSTRATED 2 — accepted as a real correctness defect and FIXED, not merely recorded.** A projection
that asserts "people you do not employ" about people the player does employ is a false statement on the
wire. The landed `trust` block's neutral degradation is the right precedent. This gets a RED case first
and then the smallest correct production change.

REFINE 1 and 2 are taken with DEMONSTRATED 1 and 2. REFINE 3, 4, 5 and 6 are carried as record-only with
their owners named.

### The auditor's git-level gaps, closed by the parent

The auditor had no shell and named five things it could not check. Four are now checked. These are
PARENT results on the working tree at `68fe5985`, not the auditor's findings:

1. **`src/` byte-equality.** `git diff --stat 43817117..68fe5985 -- src/` returns NOTHING. B.6 changed
   no engine file. `RELATIONSHIP_FAILURE_DELTA` is exactly as B.5-T landed it.
2. **The commit chain.** Six commits, one concern each: S1 schema `6379e2f9`, S2 projector `78eadd07`,
   S3 casting `0e0c8a75`, S4 wire/projection-49 `ad49031f`, T1 RED `d749b3ea`, T2 sweep `68fe5985`.
   `git diff 68fe5985 -- . ':!docs'` shows only the uncommitted D1 comment correction of record 704 —
   so the landed tree is the reviewed tree.
3. **The leak-law probe line.** BYTE-IDENTICAL across the slice; only its line number moved, 408 → 411,
   from content added above it. Proven by extracting the line at `43817117` and at HEAD and comparing
   the text after stripping the line number. The FILE did change — T2 re-expressed its version-literal
   header (projection 48 → 49, `SCHEMA_ID`, 36 → 37 prior ids) as that sweep is supposed to. The
   distinction matters and the earlier phrasing "the leak law file is untouched" would have been wrong.
4. **The sweep counts.** T2 alone (`d749b3ea..68fe5985`, tests/) = **28 files, +122 / −77** — the
   auditor's figures confirmed exactly. T1 alone (`ad49031f..d749b3ea`) = **one file, +839, no
   deletions**, so the RED was added whole and never edited afterwards by the sweep.

The fifth gap — the candidate's whole-suite behaviour — is NOT closed here. Full core `703` was still
running when this was written. A separate run of `701` was killed by ENOSPC before `record-check` could
write its end metadata; it left `end: null` / `exitCode: null`, which is exactly how the runner is
designed to expose an incomplete run, and it is discarded as INVALID rather than read for counts.
