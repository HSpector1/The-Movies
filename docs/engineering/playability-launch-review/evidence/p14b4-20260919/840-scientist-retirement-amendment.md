# 840 — bounded Scientist retirement amendment

Design on frozen C.2c source 84f1d9a8bf283ca06a3fe5235e475238a04f57e5 while full
run 837 owns the heavy slot. NO Scientist production change yet. This is the next
authorized slice, not a whole-project audit or a new replacement-policy decision.

## Authority and selected law

773 §10: Owner approved Scientists retiring on the craft window, eligible from 62,
hard boundary 72, PROVISIONAL TUNING. The hard boundary forces an ANNOUNCEMENT, not
removal. Reuse the existing birthday-only intent, 104-week recent-employment and
record-span test, minimum 52-week notice, E=max(A+52, binding ends), capped new
contracts/production work, obligations-first settlement and single final extension.
Do not change compensation, research output, film staffing disciplines or C.4 supply.

The generic intent algorithm remains version1: this amendment configures the
previously untuned profession. Historical version1 film records remain byte-exact.
New save version37 explicitly distinguishes the newly accepted Scientist lifecycle
law; it is not legitimate to widen the historical V34–36 reader by changing a
live tuning table that those readers currently call.

## Persistence and runtime decision (delegated technical boundary)

- GameStateV37 retains the V36 field shape; the versioned semantic law changes.
  LiveSaveFile/makeSave/migrateToLive move to37. No extra history, backdated event,
  replacement counter or synthesized Scientist announcement is added on conversion.
- Freeze the V34 reader's windows (four film professions, Scientist null) and intent
  version1 locally. Historical public V34/V35/V36 entry points retain that policy.
- Separate private validation entry points from public frozen readers. An explicit
  lifecycle-window policy is threaded through the existing V36→V35→V34 validation
  delegation. Only live V37 validation supplies the amended five-profession policy.
  Do not infer policy from mutable state fields or expose a flag that lets a caller
  widen a public frozen reader. Exact-key, age/provenance, notice, status, binding
  caps, cohort receipts and extension consistency checks all still execute.
- V36→V37 clones/preserves the complete state and validates it under the live law;
  future ordinary birthdays may announce, but conversion itself advances no time
  or RNG and emits no new records. Existing announcements, extensions, promises,
  identities, provenance, research receipts and ordering remain unchanged.
- A downgrade to36 is allowed only if the state has no Scientist retirement record
  and the frozen36 validator accepts it without changing state. Otherwise refuse
  explicitly. Route every earlier downgrade through this check, never strip a
  Scientist record or bypass its extension/obligations. Keep earlier downgrade rules.
- Projection must move 50→51 even with no new DTO field: current runtime checkpoint
  decoding requires the live save version. Register the genuine outgoing schema50
  identity in the SAME slice so its independent current/saved Save36 slots use the
  governed prior-schema migration. Existing 824 runtime50 fixture is genuine and
  predates edits; additionally mint an aged-Scientist Save36/runtime fixture at this
  outgoing source after 837 finishes and BEFORE production changes. Never relabel.
- Use the generator and check generated C#/schema/fixtures. Protocol stays4, promise
  rules4. C.2-RM will be a separate subsequent projection step with its own outgoing
  runtime preservation; no retirement DTOs are smuggled into this slice.

## Actual obligations and recruitment seams

SOURCE: employment.busyTalentIds includes an active research seat only while an
active player contract exists. technology.advanceProjectWeek pauses research when
the next week lacks an employed seat, preserving verified work, expenditure, every
work receipt and the seat. At E the capped contract expires; research alone does
not hold retirement past E or continue unpaid. Another employed Scientist may
continue that same retained project under existing law. No research-completion
promise is invented by this amendment.

A Scientist already has acting/craft/directing/writing disciplines in the genuine
fixture. An actual production seat can therefore test finishing_commitments across
E without grafting skills or waiving work. Hold the real take/release gate and let
the existing production owner finish/cancel before lifecycle settlement retires.

An accepted extension may find research already paused by the pre-settlement
next-week employment check. This also exists for ordinary renewal: do not add an
automatic resume policy here. Preserve work and use the existing explicit resume.

SOURCE: researchCandidates yields eight stable t-sci-00…07 identities, reusing
materialized people. Default recruit currently takes the first without an active
player contract, so a retired first identity would block the verb despite a later
legal candidate. Fix ONLY default selection to skip lifecycle-capped 208-week
candidates, using contractEndRefusal. Explicit named retired requests still resolve
the retained identity and refuse with the shared lifecycle reason, without mutation.
When no candidate can be recruited, do not falsely say all eight are employed.
The laboratory listing drops finishing/retired candidates using the shared withdrawn
set; announced candidates remain inspectable with their actual term-cap refusal.
No replacement identity, extra slot, alternate term or supply policy is added.

SOURCE correction to the old handoff's shorthand: C.4 supplies film professions
only, but rivals ALREADY have a Scientist supply path. hollywoodTick.staff fills
real rivalScientistDemand, reuses lawful people, and may generate a new Scientist
on deficit if the rival can afford the existing contract/reserve. Preserve this
pre-existing path and its append/provenance gate. Do not claim global Scientist
supply is limited to the player's eight named candidates.

## Independent behavioral matrix

Test author must label genuine worlds versus in-memory synthetic variants and
validate the entire save, not merely the modified record. No old fixture bytes or
recorded employment/first-take/research history may be rewritten.

| ID | Construction and expected behavior |
|---|---|
| S1 | Genuine V33 Scientist world at520, explicitly migrated to live: t-sci-00 turns62 at566 but recent contract[260,468) intersects[462,566], so no announcement. At618 age63 it is idle and announces, E670. |
| S2 | Labelled -1-year age/provenance variant of that world, with materialized age and due cache reconciled/whole-save validated: age61 at566 stays active, literal age62 at618 announces E670. Do not label it historical. |
| S3 | Labelled +10-year variant: real recruit520 ends728; real research begins565. Birthday566 age72 forces announcement while busy, E728, not removal; work continues through the existing employment boundary. |
| S4 | Same hard-boundary age variant without recruitment: A566/E618, full notice, identity retained. |
| S5 | Research-only expiry at728: contract ends, Scientist retires, project pauses with all work/receipts/seats retained; no new work charged after E. |
| S6 | Real extension case716, issuer-only tier1.10 offer, settlement728→E780, exactly once. Preserve research work; explicitly resume if old ordering paused it. |
| S7 | Actual Scientist production seat admitted at E−9, unscheduled hold through E: finishing_commitments, no new assignment, ordinary release/cancel then retirement. Do not run active research concurrently with the film seat. |
| S8 | Save/replay before announcement, at announcement, E and extension; deterministic outcomes, unchanged source, stable identities/provenance/old records. |
| S9 | Explicit retired candidate refuses without mutation; default recruitment skips that identity for the next lawful fixed-pool person. Exhausted pool reports availability honestly. Private laboratory rows drop withdrawn candidates. |
| S10 | Historical V34/V35/V36 Scientist-record refusal retained; actual live37 Scientist record accepted; age/provenance, notice, cap, extension and unknown/missing-key mutations each still refuse. |
| S11 | Genuine outgoing runtime50 current/saved weeks migrate independently, preserve payload history, get the governed fresh logical session, and do not pretend old journal responses are current-schema evidence. |

S2/S3 alter only explicitly synthetic age/provenance inputs, not historical
employment or research receipts. At budget0 the existing Scientist yields work;
the source-predicted S3 project remains incomplete at E, so it exercises retention.
Predictions must be scored against observed output, not copied into fixtures.
PRE-RUN ARITHMETIC CORRECTION: budget0 yields1 verified unit per Scientist/week.
Continuous begin565 would complete629, so S5 instead uses real begin565, pause567,
resume716 and expiry728 (14 units). It changes no rule or historic work receipt.

## Measured supply, not a replacement decision

Use the fixed genuine Scientist world and a bounded fixed-seed research fixture,
before/after each real announcement, retirement and default recruitment. Report:
raw stable-pool8; materialized versus latent identities; active/announced/finishing/
retired; exact lifecycle-term-hireable candidates; active player/rival employment;
occupied/eligible research seats; preserved work; new rival deficit-supply identities
versus C.4 entrants. Verify that a replacement is never the retired PersonId revived.
Exercise all eight retained player identities to a bounded exhaustion state using
honestly labelled legal test inputs, and report zero supply if that is the result.
Do not manufacture a ninth candidate. No 6240-week ACTIVE-play claim is authorized
by this bounded supply measurement; longer-term player replenishment remains an
isolated product choice if the measurement shows a need.

## Sequence and verification

1. Finish fixed-source C.2c run837, compare822, publish qualification.
2. Independent review of this bounded contract; preserve outgoing aged Scientist36
   and runtime50 artifacts using actual producer code and recorded provenance.
3. Independent RED on old production; version tests use existing public import,
   makeSave and migrateToLive interfaces so failure is behavior, not missing imports.
4. One sim-core production writer; independent tests/review; no nested workers.
5. Focused behavioral/migration/recruitment/laboratory checks, type/schema/fixture
   checks, matched wider run. Preserve A4/G4 historical fixtures; reconcile only the
   live A4 expectation after approved-law attribution, retaining frozen G4 refusal.
6. Publish recoverable results and exact restart; update Unity backlog and continue
   C.2-RM. Never commit or change consumed inputs during a recorded run.

No unresolved Owner choice blocks this amendment. The technical save/policy choice
above is delegated; any concrete defect in it must be resolved before the writer.
