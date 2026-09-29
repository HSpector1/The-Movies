<!-- 1347-A: drafted read-only by a planning agent at HEAD 6b73e424 from the parent's brief; saved verbatim by the parent (title number filled in, the agent's trailing file list removed). It is the parent's proposal pending review 1347-B and parent adoption. -->

# 1347-A: P14B relationship rulings charter (D-1312-1, D-1312-2, HIS-014, ruling 8)

This is a source-only parent draft at HEAD 6b73e424. Authority: 1340-O:59-90 and 1342-O approved text item 8 (:83-95). This charter does not reopen them. Every number is provisional tuning unless the Owner fixed it.

## 1. Measured source facts

- **Tier law.** `RELATIONSHIP_RULES_VERSION = 1` (`src/core/relationships.ts:38`). The band floors are Nemeses 0, Enemies 11, Strained 31, Acquaintances 45 (:52-54). The only evidence gate is in `tierOf`: `return band === 'Nemeses' || band === 'Enemies' ? 'Strained' : band` (:154). `currentTier` is `tierOf(currentCloseness(edge, week))` (:158-160). As a result, Enemies and Nemeses cannot be reached today.
- **Closeness.** An integer 0..100 with a baseline of 50 (:42). Drift is computed on read: nothing for 52 weeks after `lastEventWeek`, then a linear return to 50 over 260 weeks, from either side (:103-104, :135-140). No Partners exemption and no romance code exist. "Partners" appears only in comments (`types.ts:2240`, `relationships.ts:44`).
- **Drivers.** There are seven kinds (:58-64). `castingCompetitionLost` applies −3 and `repeatedCompetition` applies −min(n−1, 2) (:92-95, :397-401). Both are minted synchronously in `applyGreenlight` (`actions.ts:584-590`) by `recordCastingCompetition` (`relationships.ts:363-406`). They are player-only because rivals hold no casting session (1312-F amendment 1).
- **Dedup rule.** Pairs are canonicalized and de-duplicated per admitted production (:370-381) and are idempotent by (edge, kind, production id) (:224-225, :396). `sharedCompetitions` rises by one per pair per production (:182). Production ids never repeat (`actions.ts:268-270`). A re-greenlight after a cancel gets a new production id and counts again (1313-F amendment 3). `sharedProduction` uses the same rule (:307). Only `castingCompetitionLost` moves `sharedCompetitions`; flops and cancels move `sharedFailures` and `sharedCancellations` (:176-186).
- **History.** The exact counters are never compacted. `peakTier` and `peakTierWeek` rise only on a higher tier (:195-201). `recent` is capped at 8, and older drivers fold into the counters (:109, :202). A driver is `{kind, week, ref, delta}` with no slot (`types.ts:2252-2257`). After eight later drivers, a competition keeps only its count: its date and its slot are gone.
- **Consumers of Enemies and Nemeses.**
  - D5 ranks close ties above `enemies here` (`talentMarket.ts:916-917`), with the comment "precedence when both: OPEN 11, unreachable in B.5" (:914).
  - The `nemesisOnRoster` reservation is at :1196.
  - Chemistry sign is −1 for Strained and below (`relationships.ts:449`), which triggers the casting warning (`bridge/relationships.ts:266-273`).
- **Inseparable expiry note.** `inseparableNote` adds one sentence per Inseparable roster counterpart to the `contractExpiry` row's free-text `detail` (`bridge/finance-upcoming.ts:24-39`, :70). 1313-A §2 says "Partners joins this sentence when the romance track lands."
- **Career history.**
  - `state.firstTakes` holds both player and rival takes (`tick.ts:1134-1137`; `types.ts:2135-2142`).
  - `retainedTransitionEvidence` already builds a person's distinct, ordered acting first takes (`professionTransitions.ts:54-66`). This is the C3 "qualifying pictures" law (942-C3:21-33).
  - Genesis people get age-scaled genre experience and a zero "this run" work counter (`worldgen.ts:513-514`, :536; `talentSummary.ts:523`), so their early careers are not recorded.
  - Authored-start people carry films from before the campaign (`hollywood.ts:235`, :262-266).
  - Cohort entrants, aged 20-29 (`tuning.ts:433`), enter by a dated `CohortReceipt` (`careerLifecycle.ts:360-390`).
- **Versions.** `LIVE_SAVE_VERSION = 42` (`save.ts:6553`) and `PROJECTION_VERSION = 56` (`bridge-schema.ts:283`). The shelving charter takes Save43 and changes no projection (1344-A:106, :111).

## 2. What each ruling requires

**2.1 Conflict evidence (D-1312-1)**
- `conflictEvidence(edge) = edge.sharedCompetitions >= RELATIONSHIP_CONFLICT_COMPETITIONS`.
- One "distinct recorded casting competition" is one `sharedCompetitions` increment, under the §1 rule.
- The tier gate needs no new counter, no new driver kind and no delta at the threshold. The third competition applies exactly the landed −3 and −2.
- For history (ruling 8: "preserve ... conflict events") and for the Rivals label, each edge gains an append-only log, `competitions: {week, ref, slots}[]`. The same helper writes it, one row per competition, where `slots` lists the cast slots the pair contested on that production.

**2.2 Ruling 8, inside `tierOf` (rules version 2)**
- A value in the Enemies or Nemeses band reads that band only when conflict evidence exists; otherwise it reads Strained. Nothing else changes.
- Evidence only unlocks a band. It never moves closeness.
- Recovery works through the existing law. Positive drivers lift closeness out of the band. A pair left alone drifts to baseline and reads Acquaintances, and its evidence is kept (companion §5.5:467).
- Tiers read current closeness and never `peakTier`. A pair that peaked at Inseparable and is now Enemies reads Enemies everywhere.
- D5, when a close tie and an Enemies tie are both on the issuer's roster: change `talentMarket.ts:916-917` so `enemies here` wins. This is OPEN 11's recorded candidate (647-A2:39), under "current hostility governs current consequences" (inferred; see §6 item 1).
- `nemesisOnRoster` and the casting warning become reachable with no further code.

**2.3 Romance (D-1312-2)**

Formation comes from companion §5.4a, which 1312-A held back so the track lands whole.
- **Storage.** Each edge gains `romance: {value, anchorWeek, bonds: {formedWeek, endedWeek|null}[]} | null`.
- **Growth.** At the tick seam, from the week's changes only:
  - From the pair's second shared production, a high-proximity shared take (director-lead or lead-antagonist, :66-67) adds `ROMANCE_PROXIMITY_GAIN`.
  - A shared success adds `ROMANCE_SUCCESS_GAIN`.
  - Both apply only while the friendship tier is Friends or above.
  - Any shared take resets `anchorWeek`.
- **Separation.** Measured as weeks since `anchorWeek`. The value holds for `ROMANCE_GRACE_WEEKS`, then falls linearly to 0 over `ROMANCE_DECAY_WEEKS`, the same shape as `currentCloseness`.
- **Formation.** Happens at the write that brings the value to `ROMANCE_FORMATION_THRESHOLD` or above, provided neither person has an open bond. It appends a bond row.
- **Ending.**
  - The bond ends at the first week the derived value drops below `ROMANCE_EXIT_THRESHOLD`.
  - That week is computed on read. It is written into `endedWeek` once, at the next write that touches the edge (or either person's formation check), before any new driver applies. It is never overwritten.
  - The ending writes no driver and changes no counter, peak or `recent`. The bond row stays. This means no conflict penalty and no erased history.
- **Drift exemption.** Partners are exempt from closeness drift while a bond is open. After the ending, dormancy counts from `max(lastEventWeek, endedWeek)`.
- **Non-triggers.** No romance rule reads employment, retirement or the friendship tier after formation. A retired partner simply stops sharing work, and separation runs on its normal clock.
- **Consequences already selected (§5.6:478-479).** Partners counts as a close tie in D5, still below hostility. It joins the expiry note and adds a chemistry reason. Its sign is +1 unless the tier is Enemies or Nemeses.

**2.4 Labels (HIS-014)**

Labels are derived on read and create no effect.
- **Mentor(D, A).** A is named in a `CohortReceipt`, which is the recorded career start. A's first three distinct acting first takes, ordered and de-duplicated by `retainedTransitionEvidence`'s rule, all have `directorId === D`. The evidence is those three pictures. Genesis people, authored-start people, rival-entry hires and anyone from before V35 have no recorded start, so the label is absent. It is not guessed.
- **Professional Rivals.** At least two `competitions` rows share a slot. Companion §5.3:433 gives the example "Rivals for the lead in 1932 and 1934". The evidence is the two dated rows.
- **How Rivals differs from conflict evidence.**
  - Rivals means two competitions for the same slot kind, and it is only a label.
  - Conflict means three competitions in any slots, and it gates the tier.
  - A pair that contests both lead and support on one production records one competition with two slots.

## 3. Provisional tuning constants

These follow the `relationships.ts` house style ("every number is a named hypothesis", 1313-A). `tuning.ts` holds no relationship constants.

| Name | Value | Rationale |
|---|---|---|
| `RELATIONSHIP_CONFLICT_COMPETITIONS` | 3 | The Owner said "initially three". |
| `ROMANCE_FORMATION_THRESHOLD` | 75 | About six high-proximity pictures with successes after reaching Friends, so most Inseparable pairs stay platonic (§5.4a:453). |
| `ROMANCE_EXIT_THRESHOLD` | 40 | Below formation, as ruled. The wide gap stops bonds flickering between formed and ended. |
| `ROMANCE_PROXIMITY_GAIN` | 10 | Proximity is the main named driver (§5.4a:456). |
| `ROMANCE_SUCCESS_GAIN` | 5 | Secondary driver. |
| `ROMANCE_GRACE_WEEKS` | 104 | A normal gap between pictures ends nothing. |
| `ROMANCE_DECAY_WEEKS` | 260 | Matches the closeness return. A bond at 75 ends about 229 weeks after the last shared picture; a bond at 100 ends after about 263. |

These are Owner definitions, not tuning: Mentor's first 3 pictures and Rivals' 2 same-slot competitions. `RELATIONSHIP_RULES_VERSION` moves to 2.

## 4. Save, projection and Bridge

- **Two slices.**
  - Slice A needs no save step: rules version 2, the D5 precedence change, Mentor (from `firstTakes` plus cohorts) and the conflict reason copy. It can land while shelving holds the save writer.
  - Slice B needs Save44, since Save43 belongs to shelving: the `competitions` log, `romance` and the Rivals label.
- **Save44.**
  - `validateRelationshipsRoot(raw, 44)` checks the log (ascending weeks, distinct refs, a non-empty subset of slots in slot order, `competitions.length ≤ sharedCompetitions`). It also checks romance (value 0..100, bonds in order, only the last one open).
  - It then hands V43 the edges projected to era 42, using the Save42 pattern (`save.ts:10566-10573`).
  - `convertV43ToV44` adds `competitions: []` and `romance: null`. The 44→43 downgrade refuses by name when any log row or romance exists.
- **What old saves show.**
  - Conflict evidence comes from the recorded `sharedCompetitions`, because Save42 recorded those under the same dedup rule.
  - No Rivals label appears until two slotted rows exist after Save44.
  - No Mentor label appears without a cohort receipt.
  - No romance exists. Nothing is reconstructed (Q3).
- **Projection.**
  - Slice A takes projection 57. Slice B takes 58, or both share one bump if they land together.
  - `StudioRelationshipRow` gains `labels: {label: 'Mentor'|'Professional Rivals', evidence: text}[]` and `romance: {status: 'partners'|'ended', sinceLabel, endedLabel|null} | null`.
  - Disclosure is unchanged: rows exist only for counterparts on the viewer's roster (`bridge/relationships.ts:196-209`). Evidence cites only released pictures or the viewer's own. No magnitudes appear, and no key named `"relationships":`.

## 5. RED tests (test-author)

**`p14b10-conflict-evidence`**
- One competition with closeness in the Enemies band reads Strained.
- Two competitions read Strained; three read Enemies; three with closeness at 10 or below read Nemeses.
- A pair with only flops never reads Enemies. Cancel-after-first-take never counts as a competition.
- A re-greenlight after a cancel counts once per production.
- One production with two contested slots is one competition.
- The third competition applies exactly −5, with no new kind and no extra row.
- A conflict pair recovers through positive drivers, and through drift to Acquaintances with the evidence kept.
- Peak Inseparable with current Enemies reads Enemies, D5 0 and sign −1.
- With a close tie and an enemy on the roster, D5 ranks `enemies here`, for both a player and a rival issuer.
- `nemesisOnRoster` is reachable from genuine competitions.
- Rival-only pairs never gain evidence over a bounded natural run.
- No RNG draw.

**`p14b10-romance`**
- Forms at the threshold and is dated once. Does not form below Friends, or when either person has an open bond. A rival pair forms under the same law.
- A shared take resets separation.
- Ends at the derived week. The ending is recorded once and not moved by later events.
- The ending writes no driver or counter and changes no closeness; friendship history stays intact.
- Partners are exempt from drift, and drift resumes from the end week.
- A studio change does not end the bond. Retirement does not end it at the retirement week. A drop to Strained does not end it.
- A re-formation appends a new bond row.

**`p14b10-labels`**
- Mentor: a cohort entrant whose first three pictures share one director gets the label. Two of three gives no label. A genesis person gets none. An authored-start person gets none. A duplicate picture is de-duplicated.
- Rivals: two competitions for the same slot give the label. Lead then support gives none. Two same-slot competitions are not conflict evidence. Three mixed-slot competitions are conflict evidence without Rivals.
- Reading a label leaves the state byte-equal.

**Save44 and Bridge**
- Genuine V43 input migrates with the empty fields.
- V42 competitions count as evidence but give no Rivals label.
- The downgrade is lossless only when both fields are empty; otherwise it is refused. A forged log is refused.
- Labels appear only on disclosed rows. The projection version is pinned.

**Existing pins.**
- These move by ruling and need a review record: `tests/p14b5-relationships.test.ts:507` and `:753` (`RELATIONSHIP_RULES_VERSION` 1).
- These hold, inferred because their worlds reach fewer than three competitions: `:1034` and `tests/p14b9-casting-competition.test.ts:339`.

## 6. Open implementation questions (the parent decides)

1. **D5 with two different counterparts.** Ruling 8 says "Current hostility governs current consequences even where historical friendship exists", but the literal clause speaks to one pair's history. Treating it as selecting OPEN 11's candidate is my inference. I do not read this as an Owner question. If you disagree, that sentence and 647-A2:39 are the text to quote.
2. **When the ending is written.** Write-on-touch is proposed. A due-week bucket (companion §8 precedent) is the alternative if a dated notice must appear in the ending week itself.
3. **Partners chemistry sign when the tier is Strained.** Proposed: +1.
4. **Formation check cost.** Check "no open bond" only at a threshold crossing, not on every gain.
5. **Mentor completeness.** Confirm that no unmanaged production can seat a cohort entrant without writing a first-take receipt. If one can, withhold Mentor for that person.
6. **Player-created talent.** Excluded by default until creation provably records zero prior credits.
7. **Re-greenlight farming.** Counting follows the existing dedup rule by ruling, so cancelling and re-greenlighting one audition repeatedly can reach conflict evidence. It costs money with no refund and only lowers closeness. Record it and leave it unchanged.
8. **Mentor evidence on rival pictures.** Withhold the label until all three pictures are public.

Owner questions: none.
