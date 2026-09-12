# REF-P — exact source excerpts

Repository: `HSpector1/The-Movies`
Commit: `4734e4092d117ef89b7349389ef03bd95fc298c3`
Path: `docs/engineering/P13A-DECISIONS-AND-ACCEPTANCE-COMPANION.md`
Full source Git blob: `ada153753b0f2d8346b9d45eef93a1ff33407c5a`
Full source SHA-256: `307f25c763e2a27a8f8208680c42a4b76e37c4b53bfc125d3c16ecdf41197c99`
Full source bytes: 172860

[Immutable source](https://github.com/HSpector1/The-Movies/blob/4734e4092d117ef89b7349389ef03bd95fc298c3/docs/engineering/P13A-DECISIONS-AND-ACCEPTANCE-COMPANION.md)

Selected lines only. Historical source; instructions and proposed numbers retain their original authority and are not execution orders.

## Original lines 406–458

```text
## 2. Recommended scope, and the conditions for activating it

**This section recommends. It grants no implementation authority.** Current Ops decides activation; P13 coding needs a separate execution order.

**The execution boundary this package proposes is P13A Core.** It is not authorization for the Ready tier. Core carries every capability that settled Owner direction already assigns to it, including retained verified research progress, which stays in Core even though producing a first successful sound film never requires a cancellation. Ready is preserved in §2.4 by name, owner, acceptance condition and next bounded placement, as the next bounded execution rather than deleted scope. The three product critiques therefore read: an early playable slice, a completed causal Core, then the integrated final P13A Core candidate.

### 2.1 Reuse the existing tiers rather than inventing new ones

Design §2A.2 already carries a Core / Ready / Later table and the recommended order after P13A. This package activates that table rather than competing with it. Owner rulings §2.1 already bound P13A to "one synchronized-sound transition, one Research Laboratory, one Scientist assignment, research versus wait, one rival consequence, and one Production/world consequence", which is the outcome-first slice this assignment describes. Nothing below widens that boundary.

### 2.2 Recommended resequencing: bring the native entry forward

Design §26 sequences P13A.1 headless core, P13A.2 upstream consequence integration, P13A.3 bounded read side and world route. **Recommendation: move a thin native lot/workspace entry out of A.3 and into the first playable gate.** The reason is the review model, not taste: the three product critiques inspect actual screens and tasks, so the first critique cannot be satisfied by a headless core, and a slice that reaches a reviewer only at A.3 defers all product feedback past two thirds of the work. The correctness content of A.1 does not move; only the point at which a person can reach it.

The refresh says this is cheap. `bridge/industry.ts`'s `industryPage` is one entry-gated, ID-joined, session- and revision-pinned projection that already produces every lawful public fact P13 needs, and the Unity client already rejects on eight-field mismatch with `sessionId` and `expectedStateRevision` pinned. A research view is a new view value on an existing, proven surface, which per F7 is a protocol change and not a new architecture.

### 2.3 Core, recommended for activation

| Capability | Activation condition |
|---|---|
| Early-research window with knowledge prerequisites (design §12.1a) | PREQ-1 to PREQ-8 built, plus PREQ-9's receipt. The `research` requirement kind already exists as a live-refusing stub, so the gate is a three-edit activation, not a new mechanism |
| One named researcher with continuing payroll | New role, seat and ledger member against four closed unions; governed Save V19 migration. **Core seats exactly one Scientist**, so Core's own sound brief runs **43 funded weeks** at 1.5 units a week, not the four-seat fixture's 11 (§4.4) |
| Per-project R&D budget ceiling with disclosed marginal benefit and bottleneck (§12.6, §16a.1) | Fixture values only, all labelled hypothesis |
| Retained verified work across pause and cancel (§12.8) | PREQ-9's receipt shape defined; restart seeds exactly once. Owner direction 7A makes this unconditional, so it is Core even though a first sound film need never cancel anything |
| The technology lock at first actual filming (§12.9) | Seam is REUSED at `operations.ts:1233`; the locked loadout is new |
| Wait-for-commercial-release purchase route (§12.1a) | A new P09 catalogue row gated on a `{kind:'date'}` requirement at **campaign week 416** (§4.4). `capex > 0` and `buildWeeks >= 1` are hard catalogue invariants, so an instant zero-week grant is not expressible and must not be faked |
| One rival consequence, by the commercial route | The rival buys at the released milestone and installs on capacity it already owns. Must not add rival capacity, and carries no recurring rival operating change in P13A. The debit books to a new `technologyAdoption` movement kind through the governed V19 migration, never to `development` or `capacity`. See §4.1 |
| A thin native lot/workspace entry | New view value on `industryPage`; protocol bump |

### 2.4 Ready, recommended next, preserved by name

**Ready is the next bounded execution, not deleted scope.** Nothing below is dropped or folded into Core. Where Core independently requires an element for its own reason, Core's requirement governs and the Ready row narrows to what Core does not already need.

| Ready requirement | Owner | Accepted when | Next bounded placement |
|---|---|---|---|
| Staffing to full laboratory capacity | P13 with the staffing owner | Four seats are assignable, a fifth is refused with the seat count and a remedy, and payroll charges per seat whether or not a project uses the person | P13B, directly after P13A Core. Core seats one researcher, so Core's brief runs 43 weeks; the seats Ready adds are what buy it back to 11, which is **32 weeks for $12,000** (§4.4) |
| Multi-laboratory cooperation and splitting, with diminishing returns | P13 | Two laboratories on one brief produce the summed researcher output times a concentration factor of **0.75–0.875**, never the Owner's 1.5–1.75× total, and splitting two equal briefs is compared against sequencing on the same fixture | P13B, gated on a second authored brief with a real consumer (§4.3) |
| Persistent plan queues with dependencies and an admission policy | P09 scheduling | A queued plan survives save and load, admission refuses an unsatisfiable dependency, and nothing queued reserves a resource it has not started | P13B. PREQ-10; not needed for a first sound film |
| Broader gap-aware conversion quotes, and direct purchase without obsolete intermediates | P13 with P09 | A studio two generations behind is quoted the direct step and is billed for no obsolete intermediate | P13B |
| Forecast precision: windows becoming concrete public dates, and replacement disclosure beside purchases (design §16a.3) | P13 with the industry-disclosure owner | A window narrows to a date only from facts already public, `StudioIndustryTendency` keeps its no-forecast disclaimer, and a purchase quote discloses what the purchase replaces | P13B |
| Option-B installation cancellation | P09 physical with P11 | Cancellation pays completed work and necessary restoration and recovers genuinely refundable unused commitments, through the one existing refund path | P13B. Core carries retained *research* work (PREQ-9); installation cancellation is a different thing and stays Ready |
| Decomposed inventor pricing with prototype credit | P13 under design §16a.2 | A component quote shows access, equipment, site adaptation and installation charged once each, the prototype credited once, and no quote running negative | P13B. Core needs the four components only for the single first installation |
| Symmetric rival research, and rivals out-investing the player | P13 with the Hollywood owner | A rival funds research on rival laboratory capacity and can reach a technology before the player, under the same catalogue and release law, with recurring rival operating consequences reconciled honestly | P13B, priced with the rival capacity save-schema change and migration it requires (§4.1) |

**A parallel-research proof needs two genuinely useful briefs, not an empty second queue.** Cooperation and splitting cannot be demonstrated against one brief and a placeholder: the catalogue's §9.4 fixtures show that the answer turns on whether seats sit idle and on whether the first or the last completion date carries the value, and neither question exists without a real second consumer. Activating this tier therefore depends on authoring a second brief with a real consumer, which is the first item of the §4 sequence for OPEN-2.

### 2.5 Later, placement and terms pending

Supplier commercialization and its terms, transfer and co-development entitlement, exclusivity, early supplier launch. Equipment rental and a hire route for scarce capabilities stay unselected later scope (catalogue LATER-2 and LATER-5). None is a prerequisite of the first research experience.

### 2.6 Necessary sound work, and what is not a launch prerequisite

Required: acoustic treatment on one stage, the recording package, compatible capture, sound-capable Post. Not a launch prerequisite and not to become one: My Buildings, ordinary office renovation, broad upgrade families, and any 2→3-slot tuning. The catalogue's corrected accounting at `e48541b` is retained with its disclosed limitations, and its closed correction is not reopened.
```

## Original lines 497–559

```text
| **PREQ-1** | Research Laboratory substrate | P09 owner, sequenced by Current Ops | none | A laboratory blueprint exists in the P09 catalogue and passes `assertBlueprintCatalogInvariants` |
| **PREQ-2** | Laboratory body carrying seats | P09 | PREQ-1 | `completeDuePlacements` grants the capability; a fifth `FacilityCapability` arm is added **and** `rivalCapacityOpex`'s no-default lookup is fixed in the same change |
| **PREQ-3** | Researcher employment record, wage, payroll charge | staffing owner with P10 | none | A new role widens `CreativeRole`/`Discipline`; a new `LedgerKind` member charges payroll whether or not a project uses the person |
| **PREQ-4** | Per-project seat assignment honoring caps | P13 | PREQ-2, PREQ-3 | A fifth assignment is refused with the seat count and a remedy |
| **PREQ-5** | Per-project budget with saturation ceiling | P13 under design §16a.1 | PREQ-3 | Spend above the usable amount is never charged; the bottleneck is named |
| **PREQ-6** | Acoustic instrument module as a purchasable body | P09 | PREQ-2 | A brief blocked for want of instruments proceeds after installation; another discipline stays blocked |
| **PREQ-7** | Invention provenance record | P13, design §16a.2 already defines it | none | A component quote shows prototype equipment billed once |
| **PREQ-8** | Installation jobs respecting the dependency chain | P09 physical, P11 onset | PREQ-1, PREQ-6 | Operating charge starts at completion per §1.10, never during work |
| **PREQ-9** | Retained work across cancel and restart | P13 | none for the receipt itself; PREQ-10 only for queue-driven cancellation | Not needed for a first sound film to be *legal*, but the capability sits in **Core** per §2.3, because Owner direction 7A makes retained work unconditional. A first sound film simply never exercises it |
| **PREQ-10** | Plan queue with admission policy | P09 scheduling | none | Not needed for a first sound film, and not in Core. **Ready** |

---

## 4. Genuine decisions

Five. Everything else is settled direction or engineering. No decision below asks whether laboratories, scientists, staffing or budgets should exist. D1 and D3 are answered in full in §4.1 and §4.2 rather than left as a choice for the implementation lead.

| | Decision | Recommendation |
|---|---|---|
| **D1** | **What "one rival consequence" is allowed to be.** A rival's capacity is frozen three ways and `rivalCapacityOpex` has no default arm, so the obvious consequence, a rival building a laboratory, costs a save-schema change and a migration inside P13A. | **The rival buys and installs; it does not research.** It takes the commercial route at the released milestone, on the soundstage capacity it already owns, under the same catalogue, release, compatibility, adoption and installation law as the player. Rival research, rival laboratories and out-investing the player are preserved as Ready work with their schema change priced there. The purchase is booked to a dedicated `technologyAdoption` movement kind, never to `development`. Stated in full, with the two disclosed asymmetries, in **§4.1**. |
| **D2** | **OPEN-4, per-entry commercial-release weeks.** The calendar exists and does not deliver technology, so these are now a P13 recommendation rather than a wait. | **Pinned for synchronized sound only: `researchable` at campaign week 260 (`1925 · Week 1`), `available` at week 416 (`1928 · Week 1`).** Recommended in full in **§4.4**, which also recalculates the Core schedule against them. The full per-entry table stays Ready. The milestone gate belongs before `commitStudioEvents`, not beside the rival gate. |
| **D3** | **OPEN-5, the absolute money scale, and which weekly rate governs.** The catalogue used the §5.1 K2 floor of $1,200 while the cheapest accepted building charges $2,000 and H1 implies $5,000. The catalogue publishes all three and the sign of its result holds at every one. | **One named candidate scale, not a menu: S1-A, S1 capital with accepted-floor operating.** Every value P13A needs is set out in **§4.2**, with one meaningful alternative (S1-U) and the difference between them. These are candidate tuning, provisional and subject to implementation review and playtest. |
| **D4** | **The silent-era opening.** Every new 1920 campaign is seeded `soundRequired: true` while the field is inert. When P13 makes era live, does a 1920 campaign start sound-required, as the data says, or silent, as the design assumes? | **Silent.** Correct the seed as part of P13's era activation, with a governed migration, and add a proof that a 1920 campaign can produce a lawful silent film with no sound capability anywhere. |
| **D5** | **Which year the lot shows.** The shipped web lot renders a hardcoded `1948` while the campaign's own date is 1920 Week 1. | Take the year from `campaignDate` and retire `LOT_ERA_KEY`. Presentation only; no simulation law changes. |

### 4.1 D1 in full: how a rival lawfully obtains synchronized sound in P13A

**In P13A the rival buys. It does not research.** The one rival consequence is an adoption outcome reached by the commercial route:

- the rival uses the commercial wait and purchase route, at the same released milestone the player's wait route uses;
- it installs synchronized sound on the soundstage capacity it already owns, and gains no new or upgraded capacity;
- it obeys the same global catalogue entry, commercial-release week, compatibility requirement, adoption rule and installation law as the player;
- it does not research, because it has no research capacity, and P13A simulates no rival research.

**Why it cannot research inside P13A, in code, not in prose.** A rival's plant is frozen three ways at once: the facility list must byte-match `rivalStartingFacilities` (`hollywoodValidation.ts:267-269`, else every existing save refuses to load), `movements.capacity` must equal the four-capex sum exactly (`:228-229`), and `facilityOpex` reconciles in closed form as `-elapsed * rivalCapacityOpex(b)` (`:241`), where `rivalCapacityOpex` is a four-arm object lookup with no default (`hollywood.ts:88-96`). `RivalBusiness` is key-exact at 14 keys (`:204`) and carries no attachment point for per-studio technology state (`hollywoodTypes.ts:79-95`). Giving a rival a laboratory therefore costs a save-schema change and a migration, which is exactly the cost this package refuses to hide inside P13A.

**How the purchase is paid: a dedicated `technologyAdoption` movement kind.** *(Corrected on Current Ops' Revision 3 direction. The earlier recommendation routed the debit through the existing `development` kind to avoid a persisted field. That was wrong on the code as well as on the accounting, and the code reason is the stronger one.)*

**Why `development` is not available, in code.** `movements.development` is not an unused slot. `hollywoodValidation.ts:242` pins it: `for (const kind of ['development','production','marketing'] as const) requireFact(close(movements[kind]!, -b.projects.reduce((sum,p)=>sum+p[kind],0)), ...)`. Every rival project is minted with `development: 0` at `hollywoodTick.ts:208` and nothing ever writes it, so the pinned target is exactly zero and no `moveRivalMoney(...,'development',...)` call exists anywhere in the accepted runtime. A technology debit there does not merely make the category's meaning false; it **throws `'development commitments do not reconcile'`** at the next validate or save, unless someone invents a matching screenplay-development cost to balance it, which is the fabrication Current Ops forbids. `capacity` is closed the same way and harder: `hollywoodValidation.ts:228-229` pins it to the exact four-capex sum of the starting facilities.

**The recommendation, with its requirements.** Add one movement kind, `technologyAdoption`, to `RivalMoneyKind` (`hollywoodTypes.ts:47-48`) and to `RIVAL_MONEY_KINDS` (`hollywood.ts:15-16`), and carry it through the governed P13 Save V19 migration:

- **Zero-initialize it on every legacy finance period.** `hollywoodValidation.ts:219` runs `exact(p.movements, RIVAL_MONEY_KINDS)`, and `exact` throws unless the key **count** matches, so every `RivalFinancePeriod` in every accepted save refuses to load the moment the union grows. Writing `technologyAdoption: 0` into each one satisfies it and disturbs nothing else: `:221` checks `opening + sum(movements) === closing` per period and `:224` checks the total against cash, and adding zero preserves both exactly. New periods need no special case, because `hollywood.ts:27` already builds `movements` from `RIVAL_MONEY_KINDS` with every kind at zero.
- **Reconcile it against the authoritative P13 adoption receipt**, in its own clause beside `:242` and *not* inside that loop. The three kinds in that loop reconcile against `b.projects`, which are film projects; a technology adoption is not one, and adding it to the loop would require faking a film project to carry the cost.
- **Respect the sign bound, and know what it bounds.** `:220` bounds every kind except `studioRevenue` to `<= 0`, but it bounds each finance period's *accumulated* total, not each movement: the loop runs over the stored `p.movements` accumulator, and `moveRivalMoney` itself checks only finiteness (`hollywood.ts:32`) before `period.movements[kind] += amount` (`:39`). Periods are 52-week buckets aligned to week 0 (`:34`), so under the 1920/52 calendar one finance period is one campaign year. A purchase debit is therefore always legal, and a refund credit throws only where it would carry that campaign year's `technologyAdoption` total above zero, which is every refund landing in a year with no offsetting adoption debit. P13A's rival purchase is a one-time debit, so neither the bound nor the reconciliation binds anything today. Both are real constraints on Ready's option-B cancellation for rivals, and what must refuse an unreceipted refund is the per-kind reconciliation clause above rather than the sign bound. That tier must price both.
- **Do not use `capacity`, do not use `development`, do not touch `state.ledger`** (the player's single accounting authority, design §16a.1), and **do not infer rival research spending from the new kind**. It records an adoption, and the P13A rival does not research.

**This is a persisted-shape change, and the package says so rather than hiding it.** `RivalFinancePeriod.movements` is an accepted P12 structure, so widening it is broader than adding a P13 root, which is what the §6 plan otherwise anticipates. Current Ops' Revision 3 authorizes exactly this one key. §7's escalation criterion is corrected to match: that one key inside the governed V19 migration proceeds, and a rival capacity schema change, a new key on `RivalBusiness` or `RivalAccount`, or any second movement kind still stops and returns to Current Ops. The migration proof is §6's proof 7.

**The one asymmetry, disclosed rather than papered over.** The player's converted stage takes a recurring weekly operating change from the week its installation completes. A rival cannot take a recurring change in P13A: `facilityOpex` is recomputed in closed form over every week since entry from the *current* rate, so a mid-campaign rate change retroactively invalidates every prior week rather than only future ones. **The rival's P13A adoption therefore carries a one-time cost and no recurring operating change**, and no report, acceptance task or release note may present the two routes as financially identical. Recurring rival operating consequences belong to Ready, with the reconciliation change and migration priced there.

**A second asymmetry, from the same place.** Rival facilities carry no `blueprintId`, `LotCell`, placement row, construction project or `StudioSet` (§1.3), so the rival's installation is an adoption recorded against abstract managed capacity, not the player's P09 placement job with its reservations and completion. The *law* both obey is the same; the *physical job* is the player's alone. A proof that compares the two must compare eligibility, release week, compatibility and outcome, never job progress.

**What the rival's route must still prove.** The adoption is public only through the existing disclosure gate: the entered-studio filter in `bridge/industry.ts` (a name resolved by `studioId` without that filter would publish a reserved rival as an adopter, §1.7), an announcement receipt minted by the Hollywood owner rather than by the bridge, and a `StudioIndustryTendency` row that keeps its no-forecast disclaimer. The rival's throughput bounds are validated and must not move: one production at a time, at most two active screenplays, soundstage capacity 1.

**What P13A may and may not claim.** It may claim that one catalogue entry, one release week and one installation law govern the player and a rival alike, and that a player who waits forfeits the lead the research route produces, which at P13A Core's single Scientist is **113 weeks** against the pinned milestones (§4.4) and not the E1 fixture's eleven. Both the waiting player and the rival are gated on the same release week, so **P13A must not claim that a waiting player falls behind the rival**: what it demonstrates is a forfeited lead, not a lost race. **It may not claim symmetric research, because the rival did not research.** Symmetric rival research and the ability for a rival to out-invest the player are preserved in §2.4 by name, owner, acceptance condition and next bounded placement, and are proven there, on rival laboratory capacity, with the schema change and migration paid honestly.

### 4.2 D3 in full: the recommended P13A candidate economic scale

**Read this first.** Every value below is **candidate tuning**. It reaches playable cash, duration and decisions, which is what makes it tuning rather than illustration, and it is provisional and subject to implementation review and playtest. None of it is approved tuning, and the Owner's 2026-09-11 record that the five-times scale remains a hypothesis stands. What this section removes is the menu: an implementation lead should build against one coherent scale, not choose between four rates. **It amends nothing at `e48541b`.** The catalogue published its headline figures at the $1,200 K2 floor and published the other rates beside them as a sensitivity, leaving the choice to ENG-1 and ENG-7. Choosing one here exercises that open decision; it does not reopen the closed catalogue correction, and the catalogue's own numbers stand as published.

#### A. Recommended: candidate scale **S1-A**, S1 capital with accepted-floor operating

```

## Original lines 631–637

```text
### 4.3 OPEN-2, the order in which additional catalogue consumers are authored

**OPEN-2, which additional catalogue consumers are authored first**, is answered with a sequence rather than returned as a list. Recommended order, cheapest real consumer first: Set size classes for CAT-011, then a setup workload for CAT-012 and CAT-025, then Set turnover for CAT-013, then a costume workload for CAT-018, then property identity for CAT-017b, then a deliverable format for CAT-039, then a planning-evidence owner for CAT-044. Each unblocks one named entry, and none is a first-sound dependency.

### 4.4 D2 in full: the pinned synchronized-sound milestones, and the one-Scientist Core schedule

**Why this section exists, stated before its numbers.** Two borrowed inputs sat under §4.2. Its schedule funds **four** Scientists, while owner rulings §2.1 bound P13A to **one** Scientist assignment and §2.4 keeps staffing to capacity in Ready, so the package was publishing a full-capacity result where a Core result belongs. Its release week was a paper assumption inside a 52-week envelope, not a campaign date. This section pins the campaign milestones, then recalculates Core against them with one assigned Scientist. **§4.2's rates do not change and its envelope figures stand as published**; what changes is which schedule P13A Core is allowed to quote.
```
