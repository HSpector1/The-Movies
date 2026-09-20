# 132 — pre-sweep background release: constructibility boundary

2026-09-20. READ-ONLY source analysis / inert test design. No runtime, probe,
typecheck, Git/network, source/test edit or delegation. Only this note is written.
Read125/126 and unchanged productionPhases, operations, tick, screenplay/casting,
queue owners and relevant existing fixtures. Did NOT inspect mutable actions or
the new productionAdmission implementation. Parent owns execution/publication.

## Finding

**126's chronology correction is valid, but its requested due-writing/casting →
same-slot waiting-production grant DURING the sweep is not constructible for a
lawful125 already-started-only slate under the current phase graph.** This is a
fixture-scope contradiction, not permission to drop background occupancy or move
its release to the arrived-week first-take boundary.

The exact same-slot handoff is constructible as a candidate through a NEW queued
greenlight AFTER the sweep. That is a later Ready/queue extension, expressly not
implemented by125. No queued intent is an already-started production or person hold.

## Source proof (not an observed test result)

| Existing owner | Consequence |
|---|---|
| `scriptDevelopment.ts:181–220` and `castingSessions.ts:225–265` allocate only `development-casting` reservations, with exact facility/slot keys. | Their due release cannot free a soundstage, scenery crew or Post slot. A facility has its own capability; matching numeric slot alone is not shared-resource identity. |
| `productionPhases.ts:40–80`: countdown8 Development and7 Pre-production both require development-casting;6 Rehearsal requires stage;5/4 Shooting stage+scenery;3/2 Post;1 Release Ready. Next phases never return backwards. | The only sweep edge requesting development-casting is8→7. Every lawful already-started Development picture already owns its required slot. |
| `operations.ts:348–388` sticky retention carries the exact reservation into the next phase; `releaseCompletedPhase` at1242 retains the intersection. |8→7 cannot migrate to a newly freed writing/casting slot or become a waiter for it. A picture blocked at7 may already have released its dev slot, but its target is Rehearsal/stage, not a reacquisition of Development. |
| `productionPhases.ts:194–220` reachable-capacity blocker derives only7→stage,6→scenery,4→Post; `operations.ts:1766–1792` targets the countdown successor. | No lawful started production can carry a new-development-slot wait during the sweep. Hand-removing an8-clock reservation or redirecting a later workflow to Development would invent an inadmissible history. |
| `operations.ts:584–653` adds a production workflow and acquires its initial phase capacity BEFORE successful greenlight; capacity failure is a queueable refusal. | A picture waiting for its initial dev slot is not already greenlit. There is no existing empty Development workflow to sneak into125. |
| `tick.ts:251–277` resolves due work atw+1, then336 supplies the released script/casting roots to the managed sweep. `tick.ts:388–415` admits queued intents only afterward, with the arrived-week clock. `queueAdmission.ts:52–96` revalidates and commits the actual verb. | Correct temporal sequence is pre-sweep background release → sweep → possible queued greenlight. There is no command/greenlight/person reuse inserted between internal steps. |

`completeDueScriptWork`447–490 and `completeDueCastingSessions`408–435 clear the
actual reservation/due field and return Review. They do not emit a fabricated
production reservation-release event. A trace can record their exact original
reservation endpoint and original due-week provenance at the ordered pre-sweep
step, but must not claim a nonexistent durable StudioEvent or Ready acceptance.

126 remains authoritative: close player due occupancy at its actual logical
pre-sweep step `(w,k)`, retaining due/completion weekw+1 in provenance; takes remain
`(w+1,0)`. Absence of a same-capability sweep consumer does not justify assigning
all changes the take timestamp. Keep the rival exception: existing
`hollywoodTick.ts:257,316` sweeps before its writing completion.

## Correct first-tranche test candidate

Use `_p04a2WriterCreditFixtures.buildScenario(SEED).deadlock` and the real
`greenlightA` command. This is the disclosed historical-control founding route,
not ordinary natural play; commissions/hires/ticks/credit/production are real.
At the resulting current weekw, screenplayB is actually drafting, duew+1, with
one dev reservation; newly greenlit A owns the OTHER dev slot. Guard both exact
keys, due, empty queue, all actual joins and no source mutation—never assign them.

One actual reference advance has the following independent expectations:

- B's original reservation ends before the managed sweep; its author-owned due
  provenance staysw+1. Its actual reference state becomes Review, not Ready.
- The sweep receives external occupancy without B's dev key. A retains its own
  DIFFERENT dev key. Since A started atw, skip-first-tick keeps its countdown8;
  no new dev grant, take, production or identity can be invented.
- A subsequent lawful8→7 advance, if inside the settled replay support/cuts,
  retains A's same key rather than migrating to B's freed slot.
- A transparent real-owner call-through observation or settled trace provenance
  must pin release-before-sweep order, not merely compare endpoint occupancy.
  Exact executable instrumentation waits for the replay interface; this note
  invents no API or guessed trace step number.

This does NOT supply126's impossible same-slot sweep handoff. It tests the real
pre-sweep release and sticky-retention boundary without fabricating a consumer.
For within-sweep SAME-slot reuse, preserve the separate stage-wrap→stage-waiter
law: `c2a-m4-release-law.test.ts::walkToTheWrapWeek` uses real productions with a
disclosed one-Post-slot control. Its separate A/W/B fairness case clones clocks
and hand-builds workflows, so remains a controlled owner test, never a genuine
staffed campaign. Neither is a writing/casting release substitute.

## Later exact same-dev-slot candidate (UNEXECUTED, outside125)

Use existing `contendedStudio` / `advance` / `nextCommissionOrNull` / `freeSlate`
/ `freePackage`, retaining their historical-control founder and explicit200m
cash/ledger bootstrap. After the two real pictures have left their dev slots:

1. Keep two actual unstarted Ready projects. Actually commission a different
   unused concept with an idle contracted writer: it occupies the first free dev
   key. Start a real audition for Ready projectB: it occupies the other key.
2. Queue greenlight of DISTINCT Ready projectA with the genuinely idle free
   package. AuditionB is not A's unacknowledged casting gate. Guard both duew+1
   reservations, distinct projects/keys, complete capacity use and the actual
   queue row; no workflow or production exists for queued A yet.
3. Tick once. Both due background reservations release before sweep. Existing
   pictures never acquire dev; queue admission then forms A at the arrived week.
   Assert its real development reservation equals the earlier first dev key,
   releases precede this AFTER-sweep grant, A remains countdown8, and its actual
   startTick/due-week provenance are not restamped to an earlier internal step.

Existing helpers make this a finite source-backed recipe, NOT a reached witness.
Strictly guard current two-slot/free-crew/market/status premises and the actual
minimum-key selection. Do not weaken them if the conjunction fails. The simpler
p04a3 one-dev-slot override plus real draftingB/queuedReadyA is also a controlled
configuration route, but not evidence of an unmodified natural lot.

Recommendation: retain126's semantic correction, qualify its impossible sweep
fixture demand with this phase proof, use the first-tranche real-background/
retention control, and carry the exact queued handoff as an explicit later test.
Do not expand125 or weaken its nonempty-queue cut just to force this discriminant.
