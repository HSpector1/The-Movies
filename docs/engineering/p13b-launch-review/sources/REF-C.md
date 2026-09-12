# REF-C — exact source excerpts

Repository: `HSpector1/The-Movies`
Commit: `e48541b55d8c0825968c4f148996593bdd9f22b6`
Path: `docs/design/STUDIO-UPGRADE-AND-RESEARCH-CATALOGUE-01.md`
Full source Git blob: `20f2099dbac56ba38693ea62c7458a00becd6408`
Full source SHA-256: `bbc1eed10a74966197852387fcce1c1bb6c7c2345d73b5b9ba7602eee7526374`
Full source bytes: 145669

[Immutable source](https://github.com/HSpector1/The-Movies/blob/e48541b55d8c0825968c4f148996593bdd9f22b6/docs/design/STUDIO-UPGRADE-AND-RESEARCH-CATALOGUE-01.md)

Selected lines only. Historical source; instructions and proposed numbers retain their original authority and are not execution orders.

## Original lines 137–199

```text
## 5. Anchored scales, so nobody invents 58 prices

**NUMERICAL/CONTENT HYPOTHESIS throughout.** Every class below is a band, and every band is anchored to an accepted value so Current Ops can move the scale rather than argue 58 times.

### 5.1 Capital classes

| Class | What it is | Capital | Work weeks | Operating change | Anchor |
|---|---|---:|---:|---:|---|
| **K1** | fit-out or equipment module | $60,000–$250,000 | 1–4 | +$300–$1,200 | deliberately below every accepted capex, so equipment never reads as construction |
| **K2** | room conversion or instrument suite | $250,000–$700,000 | 4–10 | +$1,200–$2,500 | floor sits below the cheapest accepted building, the $400,000 Craft Services Annex |
| **K3** | major conversion or large module | $700,000–$1,500,000 | 10–16 | +$2,500–$5,000 | brackets the Post Building at $1,150,000 and 14 weeks |
| **K4** | new specialist building | $1,500,000–$3,000,000 | 16–24 | +$5,000–$9,000 | brackets the Soundstage at $2,400,000, 16 weeks and $9,000 |
| **K5** | major new plant | $3,000,000–$6,000,000 | 24–40 | +$9,000–$18,000 | above everything accepted; reserved for the LED volume and comparable plant |

**Conversion is usually cheaper than building, and not always.** Ground, shell and identity are already paid for, so a conversion's capital normally sits below the equivalent new build, and where a proposed conversion price approaches the new-build price the descriptor is wrong or the work is really a rebuild. One thing reverses the price itself and two more reverse the decision, and a quote has to show all three. A conversion takes a working body out of service, while a new build on free ground takes nothing out of service. A conversion that strips and replaces services is doing new-build work inside an old shell, and should be priced as such. A conversion adds no capacity, so a studio that needs the capacity is not comparing two prices for one good.

Upgrading in place, extending, building another and waiting are four live alternatives on every quote. §9.2, §9.3 and §9.5 cost conversion, new build and waiting in money on the same envelope. An extension is costed by class band only, because no accepted blueprint prices one: it falls in K2 or K3 above and carries its own ground test. The quote shows it beside the other three with that qualification visible, rather than dropping it for being harder to price.

### 5.2 Research workload classes

One researcher produces 1.0 work unit per researcher-week. A full four-seat laboratory funded to saturation produces 6.0 units a week. Those two figures come from the Annex fixture and are the only inputs needed.

| Class | Work | One full laboratory, unfunded | One full laboratory, funded | Two cooperating, funded |
|---|---:|---:|---:|---:|
| **W1 small** | 24 units | 6 weeks | 4 weeks | 3 weeks |
| **W2 medium** | 64 units | 16 weeks | 11 weeks | 7 weeks |
| **W3 large** | 144 units | 36 weeks | 24 weeks | 15 weeks |
| **W4 major** | 288 units | 72 weeks | 48 weeks | 30 weeks |

W2 is the existing Annex fixture, so the catalogue and the Annex matrix agree by construction.

**Two different facts limit how many seats a brief can actually use, and both are missing implementation.** A brief's **useful staffing limit** is the number of researchers its own work can absorb, authored per brief. A studio's **equipment cap** belongs to the estate rather than the brief: one instrument module serves one project's bench, so a single module supports that project at its full staffing limit, while a second concurrent project needing the same module cannot start until the first releases it. Seats beyond the lower of the two produce nothing and must never be charged as though they did.

**This catalogue authors no limit below four.** Every brief in §7 is costed at a full four-seat laboratory, which is what makes the workload classes above, the §9.2 schedule and the Annex fixture agree. The P1 precision-constrained briefs R02, R04, R05 and R10 are the obvious candidates for a lower limit, since a pace set by one test sequence is not hurried by a fifth pair of hands, but adopting one would double those briefs' class durations, and that cascade has to be priced before anyone authors it. §9.4 shows what the mechanism does when a limit or a cap bites, across seven fixtures; it does not claim that one bites today. **IMPLEMENTATION RECOMMENDATION**, and a dependency of the laboratory substrate rather than a new system.

### 5.3 Parallel profiles, and the corrected concentration law

The proposal was right that one universal multiplier is wrong, and right about the arithmetic. This catalogue adopts it.

A project has a **parallel fraction** `p`: the share of its work that additional teams can genuinely take. With `n` cooperating laboratories the total speedup is `1 / ((1 − p) + p/n)`, and the concentration factor is that speedup divided by `n`.

| Profile | Example brief | `p` | Two labs, total | Concentration factor c(2) | Three labs, total | c(3) |
|---|---|---:|---:|---:|---:|---:|
| **P1 precision and test constrained** | optical or specialized mechanical prototype | 0.55 | 1.38× | 0.690 | 1.58× | 0.526 |
| **P2 mixed systems** | synchronized sound; quiet portable camera | 10/13 ≈ 0.769 | **1.625×** | **0.8125** | 2.05× | 0.684 |
| **P3 broad parallel** | digital editorial, effects and software | 0.85 | 1.74× | 0.870 | 2.31× | 0.769 |

**The correction, stated plainly.** The Owner's 1.5–1.75× is the **total output of two cooperating laboratories relative to one**. It is not the concentration factor. Once both laboratories' researcher output has been summed, the factor applied to that sum is **0.75 to 0.875**. Applying 1.5 to 1.75 to the summed output instead would produce roughly 3× to 3.5×, which is not what the Owner asked for. The total-speed target and the factor must keep different names in every document, projection and test.

The Owner's band corresponds exactly to a parallel fraction between 0.667 and 0.857. P2 and P3 sit inside it. **P1 sits below it deliberately**, because a project whose pace is set by one test sequence cannot be hurried by hiring, and the player must see that reason rather than a pretended range. Any brief authored at P1 is a disclosed exception; the representative mixed-systems project always honors the Owner's direction.

### 5.4 Period bands

Periods are expressed as bands, never as exact years. **The shared calendar now exists**, as a delivered P12 producer: `campaignDate()` maps week 0 to 1920 Week 1 under `campaign-calendar-1920-52/v1`, and `market.tick` stays authoritative ([P12 to P13 producer handoff, `13370d4`](https://github.com/HSpector1/The-Movies/blob/13370d428f0693f3279732f6f4cc360a7fcaa4df/docs/engineering/P12-TO-P13-PRODUCER-HANDOFF.md)). The same handoff records that the calendar does not itself deliver technology, so a clock existing does not supply a release week. Each entry therefore still names the band in which its early-research window may open and the band in which its commercial release may fall. Exact weeks are now a **P13 recommendation against the delivered calendar** rather than a wait for its owner to appear, OPEN-4, and a manufacturer's first-product date never becomes a commercial-release milestone by itself. This catalogue read the published handoff only; deeper reconnaissance of the accepted calendar code belongs to the launch-preparation assignment.

| Band | Rough era | Evidence status |
|---|---|---|
| **B1** | the silent-to-sound transition | documented |
| **B2** | early colour and the studio system | documented |
| **B3** | widescreen, portable capture, optical effects | documented |
| **B4** | digital editorial, effects and acquisition | documented |
| **B5** | real-time and virtual production | documented as a current offering |
| **B6** | beyond documented technology | **authored extrapolation**, never presented as history |
```

## Original lines 213–232

```text
### 6.2 D2 Research Laboratory

**The whole department is blocked on one missing substrate, and not on an Owner decision.** No Laboratory blueprint exists in the accepted catalogue; a search of the accepted source finds none. Design §23 already makes the minimal Laboratory and stable Scientist substrate a hard blocker on the P13A checkpoint. Every row here inherits that block, and none of them is a reason to widen it. The Owner settled the department's existence on 2026-09-11, so what is owed is the implementation and its dependencies. They are listed as PREQ-1 to PREQ-10 in §11.3 and assigned to Current Ops to sequence, with the substrate itself as PREQ-1, formerly OPEN-1. Nothing in D2 is waiting on the Owner.

| ID | Disposition | Kind | Exact change, and which operation | Knowledge → installation | Class · research | Band | Acceptance task |
|---|---|---|---|---|---|---|---|
| **CAT-005** | **RETAINED**, inheriting the substrate block. | capacity | Raises the number of named researchers who may work in one laboratory. Seats are not output and not a project count: an empty seat lowers what a budget ceiling can buy, as design §12.6 requires. | none → the approved Laboratory body | K2 fit-out, K4 a new laboratory · none | any | A four-seat laboratory refuses a fifth assignment with the seat count and a remedy; hiring two researchers into empty seats raises usable spend and shortens the estimate. |
| **CAT-006** | **RETAINED as a family, absorbing CAT-007 and CAT-008.** Three separate entries described one thing: a discipline-specific instrument module that removes a named missing-test blocker and raises test capacity. One family with variants is one quote shape, one queue behavior and one card. | equipment | Removes a specific missing-instrument blocker and raises concurrent test capacity for briefs that need that discipline. Never a general research percentage. | none → laboratory floor area and power | K2 · none | acoustic and electronic B1; optics B2; compute B4 | A sound brief blocked for want of acoustic instruments proceeds after the acoustic variant is installed, while an optics brief remains blocked. |
| **CAT-007** | **COMBINED into CAT-006** as the optics and imaging variant. Source ID preserved and resolvable. | equipment | see CAT-006 | — | — | B2 | see CAT-006 |
| **CAT-008** | **COMBINED into CAT-006** as the computational variant. Source ID preserved. The proposal's own warning stands: buying computers must not accelerate acoustic hardware integration. | equipment | see CAT-006 | — | — | B4 | A compute purchase shortens a digital brief and leaves a sound brief's estimate unchanged. |
| **CAT-009** | **DEPENDENCY-QUALIFIED** on the research work model carrying a test capacity distinct from seats. Without that, this entry is indistinguishable from CAT-005 and must not be sold. | capacity | Raises how many prototypes can be integrated or tested at once. Only helps when teams are waiting for a bay rather than for people. | none → laboratory or a compatible shared room | K2 · none | B1+ | Two projects at the integration stage with one bay show one waiting on the bay, not on staff; a second bay clears it. |

### 6.3 D3 Soundstage

| ID | Disposition | Kind | Exact change, and which operation | Knowledge → installation | Class · research | Band | Acceptance task |
|---|---|---|---|---|---|---|---|
| **CAT-010** | **RETAINED.** First programme, and the physical half of the sound transition. | conversion | Makes one stage eligible for its part of a synchronized-dialogue chain. Felt by shooting, which reserves soundstage and set-scenery together. Wall treatment alone grants no sound capability and no quality. | sound method known or commercially released → the stage, idle of its production, its mount and its Set | K2 nearly compatible, K3 substantially older · none of its own | B1 | A treated stage plus a recording package plus sound-capable Post makes a sound production legal; the same stage without the package still refuses. |
| **CAT-011** | **DEPENDENCY-QUALIFIED**, and the dependency is sharper than the proposal states. A `StudioSet` carries **no geometry at all**, so a larger stage has no consumer whatever until Set size classes exist. Retained in the destination; not sellable before that. | capacity, new body | Accommodates an explicitly larger or taller Set specification. It does not let two unrelated films shoot at once; one non-retired Set holds one stage's mount. | Set size classes must exist → ground and structure | K4 · none | B2+ | A Set authored as oversized is refused on a standard stage and accepted on the large one, and the large stage still hosts exactly one Set. |
| **CAT-012** | **DEPENDENCY-QUALIFIED** on a modeled setup workload. Today no phase carries a rigging or setup task to reduce. | conversion | Supports specified lighting and rigging setups and reduces a named setup workload where one is measured. | none → the stage; loading and clearance descriptors | K2 · none | B2+ | A production whose plan includes the heavy rigging setup shows a shorter named setup task on the rigged stage and the ordinary one elsewhere. |
| **CAT-013** | **DEPENDENCY-QUALIFIED** on Set dismantle and load-in being modeled as work. The Set lifecycle today is under-construction, standing and retired, with a completion week; there is no separate turnover task to shorten. | conversion | Reduces the named dismantle and load-in work for compatible reusable Sets, releasing a busy stage sooner. | none → the stage and compatible Set interfaces | K2 · process study, W1, P1 | B2+ | Striking a compatible Set on a fitted stage frees the mount measurably sooner than on an unfitted one; an incompatible Set gets no benefit. |
```

## Original lines 274–287

```text
### 6.7 Camera, lighting and sound equipment

These sit with no department of their own: they are studio equipment packages deployed to the stages and Post rooms that consume them.

| ID | Disposition | Kind | Exact change, and which operation | Knowledge → installation | Class · research | Band | Acceptance task |
|---|---|---|---|---|---|---|---|
| **CAT-020** | **RETAINED**, period corrected. A 1936 prototype and a 1937 manufacturer launch do not make a commercial-release milestone. | equipment | Enables the authored framing and focus workflow of reflex capture, touching a real shot or preparation constraint. | reflex method known or released → a camera package the studio owns | K1 · W2, P1 | research B2, release later in B2 | A production using the reflex workflow gains the authored setup change; another production gains nothing. |
| **CAT-021** | **REVISED into two generations**, on the corrected evidence. The 1972 silent portable still needed a lens blimp; blimp-free operation is a later, separate advance. Collapsing them hid a real upgrade. | equipment | Generation 1: portable synchronized capture with a blimp constraint. Generation 2: genuinely blimp-free portable capture, opening tighter and more mobile setups. | sound chain operational; the method known or released → camera package and operators | K1 each · W3, P2 | gen 1 research B3, gen 2 later in B3 | A mobile scene authored as blimp-intolerant is refused with generation 1 and legal with generation 2. |
| **CAT-022** | **RETAINED.** | equipment, format | Unlocks a chosen widescreen presentation path with framing and delivery requirements. A current package may satisfy the prerequisites without buying older lenses. | method known or released; a compatible finish → optics and capture | K2 · W3, P1 | B3 | A widescreen picture is legal only with both capture and matching finish; buying optics alone refuses. |
| **CAT-023** | **RETAINED**, later cinema. | equipment | Enables specified slow-motion or special capture shots. The higher resource use belongs to those shots only. | method known or released → a camera module | K1 · W2, P1 | B3 | A picture with the special shot consumes more stock; a picture without it consumes normally. |
| **CAT-024** | **RETAINED**, later cinema. | equipment | Enables authored smooth moving shots and the operator capability they need. No generic production speed. | method known or released → rig and trained operators | K1 · W2, P1 | B3 | A shot authored as stabilized is available; the ordinary rig still refuses it. |
| **CAT-025** | **DEPENDENCY-QUALIFIED** on lighting and setup being modeled. Later variants must never silently drop their physical requirements. | equipment | Changes specified lighting and setup requirements, heat or load, or location suitability where those are modeled. | method known or released → the package | K1 · W2, P2 | B2+ | A named setup requirement changes; nothing unmodeled improves. |
| **CAT-026** | **RETAINED.** First programme, and the anchor of the whole first research family. | equipment | Lets an eligible film record synchronized dialogue with compatible camera, stage and Post support. | sound method researched early or bought at release → acoustic treatment where required, camera compatibility, sound-capable Post, crew | K2 · **W2, P2** | research B1, release later in B1 | The full chain makes a sound film legal; removing any one link refuses with the exact missing element. |
| **CAT-027** | **RETAINED.** | equipment | Supports separately manageable sound sources and portable recording, enabling defined recording and mixing workflows. | sound operational → package and Post channels | K2 · W3, P2 | B3 | A production using multiple sources produces the defined channels; a single-source production is unchanged. |
```

## Original lines 344–377

```text
## 7. What the research department actually researches

Fifteen briefs, not sixteen. R08 folds into R02, because a reflex mechanism, a high-speed mechanism and a stabilizing mechanism are three authored variants of one optical and mechanical camera programme rather than two separate programmes. Separately, the three laboratory instrument entries were never research at all; they are purchases. Each brief produces prototype or method results, followed by separately costed deployment, and each may have a commercial acquisition alternative once its release milestone passes.

**A brief is a heading, not a single project.** Several briefs cover more than one separately researched project, so a brief's class and profile cells give the span its targets cover and the per-entry row in §6 governs each project. Where a target carries no research class at all in §6, it is a purchase reached through the brief's family rather than a project inside it: CAT-039 is the case, which is why it is named in the deliverable-format decision of §11 and not in R14's target list.

| Brief | Targets | Work being done | Class · profile | Band |
|---|---|---|---|---|
| **R01 Synchronized production sound** | 026, 010, 029a | Recording and synchronization components, acoustic tests, Post integration | W2 · P2 | B1 |
| **R02 Camera optics and mechanism** *(absorbs the proposal's R02 and R08)* | 020, 023, 024 | One selected mechanism per authored variant: reflex viewing, high-speed capture, or stabilization. Never all three from one unlock. | W2 · P1 | B2–B3 |
| **R03 Colour production process** | 030 | Capture, colour separation, media and finishing workflow | W3 · P2 | B2 |
| **R04 Simplified colour workflow** | 031 | Reduces an explicitly authored burden of the prior process | W3 · P1 | B3 |
| **R05 Widescreen optical method** | 022 | Compatible optics, capture and delivery checks | W3 · P1 | B3 |
| **R06 Quiet portable capture** | 021, both generations | Mechanical, acoustic and electronic integration; the blimp-free generation is a second project, not a free upgrade | W3 · P2 | B3 |
| **R07 Lighting and control** | 025 | Efficient source and control package with production compatibility | W2 · P2 | B2 |
| **R09 Portable and multitrack sound** | 027 | Capture, storage, synchronization and mixing interfaces | W3 · P2 | B3 |
| **R10 Optical effects pipeline** | 041 | Registration, element combination, finishing integration | W3 · P1 | B3 |
| **R11 Motion-control capture** | 042 | Repeatable mechanical and control system | W3 · P2 | B3 |
| **R12 Nonlinear editorial workflow** | 034, 037 | Software, media organization, editorial integration | W2–W3 · P3 | B4 |
| **R13 Digital effects and rendering** | 043, 044; consumes 038 | Algorithms, tools, pipeline coordination | W3–W4 · P3 | B4 |
| **R14 Digital acquisition and finishing** | 036, 035 | Capture electronics, imaging, media, finishing compatibility | W3–W4 · P2–P3 | B4 |
| **R15 Performance capture** | 046 | Sensors and tracking, calibration, usable animation data | W4 · P2 | B5 |
| **R16 Real-time virtual production** | 045 | Tracking, low-latency imagery, display and lighting, capture integration | W4 · P3 | B5 |

Begin with one broad named researcher role and equipped laboratories. Introduce specialty fit only when it creates an explainable choice. Never ask the player to assign a microphone task: domain decomposition belongs inside the automatic work model.

### 7.1 Two prerequisite graphs

The **knowledge graph** says what a team must know to investigate an advance. The **installation graph** says what a developed or purchased system physically needs to operate. A commercial product embodies prerequisites its buyer never invented, which is exactly why a current package can replace an obsolete intermediate purchase.

- **Sound:** eligible research or commercial access → recording and synchronization package + compatible capture + necessary stage treatment + basic sound Post → operational sound production. Replacement dialogue and advanced mixing are additional capabilities, never mandatory for a first sound film.
- **Digital editorial:** material available digitally, by digital capture **or** an authorized scan route, + storage + edit system + operator → digital edit. A film-originated picture can therefore use digital Post without a digital camera.
- **Virtual production:** suitable stage + display and tracking + real-time pipeline + prepared assets + operators → eligible virtual production. Panels create no assets and replace no scenery work.

```

## Original lines 378–420

```text
## 8. Office I to III: the concrete design

### 8.1 Capacity and standard are two facts on one body

**IMPLEMENTATION RECOMMENDATION.** The accepted product has a capacity-bearing baseline office and two capacity-zero standard buildings. That is not three versions of one thing, and pretending otherwise would lose capacity or double an effect. The successor is **one office body carrying two independently recorded facts**: installed **work capacity**, and installed **development standard**. It may be expanded, modernized, or both.

The studio-wide highest-operational-standard rule and its evaluation timing are unchanged until separately approved. A lower-standard office keeps supplying capacity while another body supplies the higher standard. A renovation that takes the only high-standard provider offline must disclose the effect on work not yet assessed, and no completed screenplay is ever rewritten.

Old saves keep their purchased Office II and III as real bodies with real charges. Nothing merges, demolishes, refunds or grants capacity automatically.

### 8.2 The three routes, costed

**NUMERICAL/CONTENT HYPOTHESIS, fixture O1.** Converted-body charges are derived only from accepted values: the placed baseline office charges $5,500 a week, the accepted standard increments are $2,500 for II and $4,000 for III, so a converted placed body pays $8,000 at II and $9,500 at III. The founding Development body has no separately modeled charge, so it pays the increment alone.

| Route | Capital | Weeks the office is offline | Ends as | Standard available from |
|---|---:|---:|---|---|
| **(a) Accepted new-build ladder:** build Office II, then Office III | $1,800,000 | 0, the office keeps working | three bodies, paying $5,500 + $2,500 + $4,000 = $12,000 a week, on three plots | week 8 for II, week 20 for III |
| **(b) Staged conversion:** I→II, then II→III | $1,350,000 | 12, in two windows of 4 and 8 | one body at III | week 12 for III if run back to back; week 4 for II only if the studio pauses, and every week of that pause delays III by a week |
| **(c) Direct conversion:** I→III | $1,250,000 | 16, in one window | one body at III | week 16 |

Direct saves **$100,000** against staged and spares one mobilization. It costs **four more weeks** to reach III, week 16 against week 12. The staged route's interim II standard is an option, not a free extra: run back to back the body is offline continuously to week 12 and never operates at II, and a studio that does pause to use it delays III week for week. Neither route dominates. A studio with an original screenplay it can get assessed in a deliberate pause at II takes the staged route, and so does one that simply wants III four weeks sooner; a studio short of cash, or with no draft in that window, takes the direct one. The accepted ladder is the worst of the three on every axis except that it never interrupts the office, which is exactly why the Owner objected to it.

Direct I→III takes **twice** as long as II→III, satisfying the Owner's "substantially longer" direction. This catalogue keeps the 4, 8 and 16 shape the Owner used as an example on 2026-09-10, and the Owner confirmed on 2026-09-11 that those weeks are illustrative and **not approved tuning**; the money is this catalogue's proposal and is not approved either. What the fixture is actually for is the ordering, which a change of scale does not disturb: direct costs less than staged, reaches III later, and is available to a studio that has never owned an Office II.

The difference between routes is authored source-to-target work, never a penalty for skipping a tier. A studio converting a body that already has II's services and layout is doing less work than one starting from an unmodified office, and the quote must show which descriptors apply.

### 8.3 Disposition of the accepted prerequisite

**This is the explicit disposition the assignment requires.** Accepted behavior declares, on Office III alone, `requires: [{ kind: 'facility', blueprintId: 'development-office-2' }]`, evaluated as at least one operational Office II placement, and refuses with "Requires an operational Development Office II."

**Recommendation, for Current Ops to approve before any coding:**

1. **The conversion route does not consult it.** A source-to-target conversion of an owned body to standard III is gated by the target's own availability, the body's eligibility and idleness, space and funds. Owning an obsolete building is not a gate. This is the Owner's direct route.
2. **The new-build route drops the facility requirement and gains target gates.** Replace the requirement with what actually justifies a standard III building: the standard's availability, the studio's knowledge where the catalogue says knowledge is needed, lawful ground and funds. Keeping an ownership prerequisite on a *new building* is the same obsolete-purchase chain in another costume.
3. **The requirement type already supports the replacement.** `BlueprintRequirement` has a `date` arm, so an availability gate needs no new concept, and the change is one blueprint's `requires` list plus its refusal copy.
4. **Nothing is done in the client.** The refusal exists in authoritative code and must be changed there, never bypassed in presentation.
5. **Legacy is untouched.** Studios that already built Office II keep it, its charge and its plot. This change removes a requirement; it grants nothing.

The alternative, keeping the prerequisite for new builds only, is coherent but leaves a player who wants a second standard III building buying an Office II first. That is the behavior the Owner rejected, so it is not recommended.

### 8.4 What research has to do with any of this

Nothing. No office route requires a Scientist. Research staff do not accelerate building work, and construction staffing and speed remain the owning system's future rule. P09's separate Builder obligation is untouched by this catalogue: real Builder hiring, count, speed and wages remain required for the full P09 flip, and their exact formula stays tuning work.
```

## Original lines 701–775

```text
## 11. Decision register

**Five classes, kept apart on purpose, and being listed here approves nothing.** A recommendation stays a recommendation until Current Ops or the Owner disposes of it, and nothing in the Owner's 2026-09-11 response, or in the reconciliation direction that followed it, is to be read as approving anything it does not name.

**Reclassified on 2026-09-11, second pass.** The Owner has settled that laboratories, named researchers, staffing to building capacity and research budgets exist. Their missing foundations are therefore **implementation prerequisites for Current Ops to sequence**, not unresolved product approval, and they now have their own class in §11.3 rather than sitting among questions that need a person. Two IDs moved and both stay resolvable: **OPEN-1 is now PREQ-1**, and **OPEN-3 is now LATER-5**, because a hire route for a scarce capability is the same later proposed scope as equipment rental under LATER-2 and neither is selected. No ID was reused and no requirement was dropped.

### 11.1 Owner direction already settled — do not ask again

| | Settled direction | Durable record |
|---|---|---|
| **OWN-1** | Early cash-funded research with knowledge prerequisites and a fixed commercial-release rollout | rulings §2.4 |
| **OWN-2** | Laboratories, named researchers, staffing to building capacity and per-project research budgets are selected product direction. What is open is the missing implementation and its dependencies, below, never whether they should exist | rulings §2.4 and §2.5 item 3 |
| **OWN-3** | Researchers and laboratories may cooperate on one project or split across projects, and neither arrangement is universally better | rulings §2.5 item 2; §9.4 |
| **OWN-4** | Two maximum-capacity laboratories on one project produce about 1.5–1.75× one laboratory | rulings §2.4. This catalogue reads that band as a **total** rather than as the concentration factor, which is the catalogue's own correction and not an Owner statement; §5.3 |
| **OWN-5** | Legitimate inventor benefits coexist when they concern different costs. No expense is credited twice, and usable equipment already produced and paid for is never charged again | rulings §2.5 item 1; §9.2 |
| **OWN-6** | Direct Office I→III conversion, with no Office II ever purchased. Under comparable conditions it takes substantially longer than II→III | rulings §2.4 and §2.5 item 5; §8 |
| **OWN-7** | Renovation need not be cheaper than new construction. Upgrading in place, extending, building another and waiting all stay live alternatives | rulings §2.5 item 4; §5.1, §9.3, §9.5 |
| **OWN-8** | Persistent plan queues, retained research progress, option-B installation cancellation, gap-aware conversion quotes, and direct purchase without obsolete intermediates | rulings §2.4 |
| **OWN-9** | Supplier commercialization is desired later scope, with P16+ the default placement | rulings §2.4, §5 |

### 11.2 Engineering and tuning recommendations — Current Ops disposes

Every row is a recommendation **pending disposition**. None is approved by appearing here, and none needs the Owner's time unless Current Ops refers it up.

| | Recommendation | Note |
|---|---|---|
| **ENG-1** | **One scale across both documents**: apply scale S1's uniform multiplier to the Annex fixture so the catalogue and the Annex stop carrying two money scales, §9.1. This is the mechanical half; the absolute level a shipped game uses is OPEN-5, and the Owner recorded on 2026-09-11 that the five-times figure is a hypothesis, not approved tuning | Two objects are priced twice and both are disclosed in §9.1. A new soundstage: $2,000,000 over 20 weeks under H1×5 against the accepted blueprint's $2,400,000 over 16. A converted stage's weekly operating change: $5,000 under H1×5 against the §5.1 K2 floor of $1,200 used throughout §9.2 to §9.5. The accepted or accepted-anchored value governs in both, and §9.7 carries the sensitivity: the second choice moves the existing-department horizon result from $7,200 to $113,600 without changing its sign |
| **ENG-2** | **New-build Office III prerequisite removal**, §8.3: drop the operational-Office-II requirement from both routes and gate a new build on the standard's availability, knowledge, lawful ground and funds | kept as a recommendation pending disposition at the Owner's instruction |
| **ENG-3** | **Below-target research-scaling exceptions**, §5.3: P1 precision-constrained briefs return about 1.375× for two laboratories, below the Owner's band, and say so in the card | kept as a recommendation pending disposition at the Owner's instruction |
| **ENG-4** | **Per-brief parallel profiles P1–P3**, §5.3, in place of one universal multiplier | |
| **ENG-5** | **Useful staffing limits and equipment caps as authored facts**, §5.2. No brief is set below four today; the P1 briefs are named as the candidates | adopting a limit below four doubles that brief's class duration, so the cascade must be priced first. §9.4 shows what the mechanism does |
| **ENG-6** | **Component-level inventor quote lines** at the S1 scale, §9.2: access, equipment, site adaptation and installation, each charged once, never negative | the accounting rule behind it is settled under OWN-5; only the numbers are open |
| **ENG-7** | **Capital classes K1–K5, workload classes W1–W4 and period bands B1–B6**, §5 | |
| **ENG-8** | **The department's fixed cost as the balance lever**, §9.5, rather than any restriction on credits | |
| **ENG-9** | **The illustrative 4, 8 and 16 office weeks**, §8.2, kept from the Owner's 2026-09-10 example | the Owner confirmed on 2026-09-11 that those weeks are not approved tuning |

### 11.3 Implementation prerequisites — Current Ops sequences these, and none of them needs Owner approval

**This is what OWN-2 points at.** The Owner has selected laboratories, named researchers, staffing to capacity and per-project budgets. What is owed is the implementation and its dependencies. Nothing in this table asks whether the department should exist, and nothing in it is a question for the Owner. The last column separates **what the first sound film actually needs** from what the wider catalogue needs later, so Current Ops can sequence the checkpoint without carrying the rest.

| | Prerequisite | Depends on | Needed before the first sound film is legal |
|---|---|---|---|
| **PREQ-1** | The **Research Laboratory substrate**, the hard blocker design §23 records. Formerly OPEN-1; reclassified because the Owner settled the department, leaving the substrate an engineering dependency rather than a product question | a coding lead, sequenced by Current Ops | **yes**, the whole of D2 inherits it |
| **PREQ-2** | A laboratory as a **placeable and convertible body carrying seats** | PREQ-1 | **yes** |
| **PREQ-3** | **Researcher employment records, wages and a payroll charge** | the staffing system | **yes** |
| **PREQ-4** | **Per-project seat assignment** honoring the §5.2 useful staffing limit and equipment cap | PREQ-2 and PREQ-3 | **yes** |
| **PREQ-5** | A **per-project budget with the saturation ceiling**, where spend above the usable amount is never charged | the one accounting authority of design §16a.1 | **yes** |
| **PREQ-6** | The **instrument module as a purchasable equipment body**, CAT-006, whose absence blocks the brief rather than slowing it | PREQ-2 | **yes**, the acoustic variant |
| **PREQ-7** | An **invention provenance record carrying the prototype-equipment fact**, so §9.2's component quote can be produced | nothing new; design §16a.2 already defines it | **yes** |
| **PREQ-8** | **Installation jobs that respect the §9.2 dependency chain**, including the §7.1 sound-Post and compatible-capture requirements and the operating-charge onset of §9.1 | P09 physical work, P11 cost onset | **yes** |
| **PREQ-9** | **Work accumulation retained across cancel and restart** | PREQ-10 | no; programme 2 scopes it, a first sound film does not need it |
| **PREQ-10** | The **plan queue** with its admission policy | P09 scheduling | no; the same |

### 11.4 Genuinely unresolved product choices — these need a person

Three remain. The first is about **additional catalogue consumers**, which is a different subject from the first-sound prerequisites above and must not be merged with them.

| | Question | Who decides |
|---|---|---|
| **OPEN-2** | **Which dependency-qualified consumers are authored first.** None of these is a first-sound dependency; each unblocks a later catalogue entry: Set size classes for CAT-011; a setup workload for CAT-012 and CAT-025; Set turnover for CAT-013; a costume workload for CAT-018; property identity for CAT-017b; a planning-evidence owner for CAT-044; a deliverable format for CAT-039 | Owner, or a named design owner |
| **OPEN-4** | **Commercial-release weeks per entry.** The shared calendar now exists as a delivered P12 producer and the same handoff records that it does not deliver technology, so this is no longer a wait for a calendar owner to appear. It is a **P13 recommendation** owed against the delivered calendar, and then a disposition | P13 recommends; Current Ops or the Owner disposes |
| **OPEN-5** | **The absolute money scale.** ENG-1 is the recommendation; adopting a scale, or refusing this one, is the Owner's call. The five-times figure and the §5.1 class bands are both hypotheses, and §9.1 records where they disagree | Owner |

### 11.5 Later features that do not block current preparation

Nothing here needs a decision now, and nothing here is selected by being listed.

| | Later scope | Condition |
|---|---|---|
| **LATER-1** | **Supplier commercialization**: the terms, pricing and package placement of licensing an owned technology. The *direction* is settled under OWN-9; only these remain, and they remain unselected | P16+ is the default placement; Current Ops recommends and the Owner approves any departure |
| **LATER-2** | **Equipment rental** instead of purchase | later proposal, not selected |
| **LATER-3** | **CAT-049 to CAT-058**, the ten dependency-gated entries | each waits on its own owning system's authorization |
| **LATER-4** | **Talent, contract and rival-studio systems** that several entries would eventually touch | separate major systems, out of scope here |
| **LATER-5** | **A hire route for scarce capabilities**, §6.7 and CAT-030's three-strip evidence. Formerly OPEN-3. It is the same proposed scope as LATER-2, so it is held with it rather than treated as an open Owner question, and neither is selected | later proposal, not selected; a separate selection would be needed to open it |

```
