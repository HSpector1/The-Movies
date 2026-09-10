# Project: Studio — Studio Upgrade and Research Catalogue

**OWNER-REQUESTED CATALOGUE DEFINITION · CURRENT OPS REVIEW REQUIRED**
**DOCUMENTATION, INDEPENDENT RESEARCH AND READ-ONLY RECONNAISSANCE ONLY · NO GAMEPLAY IMPLEMENTATION AUTHORIZED**
Validated successor to the Future Ops proposal of 2026-09-10. No new package number. [Review hub](./FACILITY-MODERNIZATION-CURRENT-OPS-REVIEW.md) · [Owner rulings §2.4](./CODEX-P13-P15-OWNER-RULINGS.md#24-p13-owner-direction-amendment--2026-09-10) · [P13 design](./CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13.md) · [Builder Annex](./CODEX-ERAS-TECHNOLOGY-STUDIO-INNOVATION-PACKAGE-13-BUILDER-ANNEX.md) · [facility addendum](./FACILITY-UPGRADES-AND-STUDIO-OVERVIEW-01.md)

## 1. What this document is

The Owner cannot choose investment rules without knowing what is being bought. This catalogue answers, for every candidate: what changes, which operation feels it, what knowledge and what installation it needs, what it costs across its life, and when building another facility or waiting is the better move.

It disposes of all 58 candidates and 16 research briefs in the Future Ops proposal. It is a **destination**, not an implementation order. Nothing here authorizes coding, and no entry is approved tuning.

Three results matter most.

- **Fifty-eight candidates need at most five new building types, plus one serviced ground zone.** Everything else is a module, an equipment purchase, a conversion of an existing body, or authored creative stock. The accepted product has nine buildable blueprints and four facility capabilities; this catalogue adds departments sparingly and puts the growth in modules.
- **Sixteen research briefs shrink to fifteen**, because a reflex mechanism, a high-speed mechanism and a stabilizing mechanism are authored variants of one camera optics and mechanism programme rather than two separate programmes. The three laboratory instrument entries leave the research list entirely, because they are purchases.
- **Every number here is anchored to an accepted value**, so Current Ops can argue with a scale rather than invent 58 prices. The anchors are the nine accepted blueprints, whose capital cost runs $400,000 to $2,400,000, weekly operating cost $2,000 to $9,000, and build time 6 to 20 weeks.

### 1.1 Authority and what is preserved

Every Owner-selected direction in [rulings §2.4](./CODEX-P13-P15-OWNER-RULINGS.md#24-p13-owner-direction-amendment--2026-09-10) is preserved without exception: early cash-funded research with knowledge prerequisites; a fixed commercial-release rollout; named researchers to laboratory capacity; per-project R&D budgets; cooperation or split with diminishing returns; persistent plan queues; retained verified research; inventor pricing; direct purchase without obsolete intermediates; forecast windows becoming concrete public dates; the technology lock at first actual filming; option-B installation cancellation; and supplier commercialization as later scope. Every FUP-001 to FUP-023 requirement and every P13-OD-01 to P13-OD-14 obligation stands unchanged.

**The Owner's latest office direction is carried in full:** a studio may convert Office I directly to Office III without ever owning Office II, and that direct conversion must take substantially longer than II→III under comparable resources. The Owner's 4, 8 and 16 week example is illustrative shape, not approved tuning. §8 works the route out in detail and disposes of the accepted prerequisite that currently blocks it.

Reconnaissance baseline: accepted TypeScript `7ae36b44d99c505246d17dcc37beba94fa59a18a`, accepted Unity `3a9a3f488693aa14431a6aa412d7560df8f30a89`, accepted P11 handoff and receipt `4caf7682b6c427b64f1ffab742f07cb4fddef2b0`. Planning parent `5230f3de685e643ee307264464b2d08d5730140b`, whose own parent is the reviewed facility candidate `7b03e9375c5dd9deed347a6b8300362893a55b61`. No newer planning descendant existed when this branch was cut. The running P12 implementation was neither inspected nor addressed; final P13 engineering must still refresh against accepted P12, the eventual calendar owner and the employment interface.

### 1.2 How to read a disposition

| Disposition | Meaning |
|---|---|
| **RETAINED** | The candidate survives as proposed, with this catalogue's added detail. An entry that absorbs another as a variant is still RETAINED; the change is recorded against the absorbed ID as COMBINED. |
| **REVISED** | The candidate survives with a material change to its shape, route or claim. The change and its reason are stated. |
| **COMBINED** | Folded into another entry as a variant. The source ID is preserved and remains resolvable. |
| **SPLIT** | One candidate becomes two entries because it bundled a capacity purchase with a content or format purchase that must be quoted, queued and cancelled separately. Source ID preserved with an `a`/`b` suffix. |
| **DEPENDENCY-QUALIFIED** | Retained in the destination, but it cannot be sold to the player until a named owning system defines its consumer. The named dependency is the work, not an excuse. |
| **REJECTED** | Not recommended, with the reason and where it goes instead. |

Label discipline follows the amendment: **OWNER-SELECTED PRODUCT DIRECTION** is settled; **IMPLEMENTATION RECOMMENDATION** is this catalogue's proposal; **NUMERICAL/CONTENT HYPOTHESIS** covers every number, class, period and duration below without exception; **LATER COMMERCIALIZATION SCOPE** covers supplier commercialization; **POST-P12 VERIFICATION REQUIRED** marks seams the final reconnaissance must confirm.

### 1.3 Rules that apply to every entry, stated once

The proposal asked for queue behavior, cancellation behavior, cost onset, legacy handling, rival handling and campaign handling on each of 58 entries. Those are uniform and already governed. Repeating them 58 times would invite drift, so they are stated once here and are binding on every entry below.

- **Cost onset.** Capital is charged once at commit; the operating change begins on the advance after the facility becomes operational. Research spending is charged per tick only for usable spend. This is accepted placement behavior and P13 design §16a.1.
- **Queue behavior.** Any entry can be a queued plan with dependencies, an execution authority and an admission policy, per design §12.7. A plan holds nothing and creates no commitment until it executes.
- **Cancellation.** Research follows option 7A: verified work is retained and may seed exactly one restart. Installation follows option 10B: completed work and necessary restoration are paid and only genuinely refundable unused commitments are recovered. Neither is computed from the accepted demolition credit.
- **Identity and legacy.** A conversion keeps the same body, name and history. Old saves keep their purchased Office II and III as real separate bodies with their real charges; nothing is merged, demolished, refunded or granted automatically.
- **Rivals.** Every entry is available to rivals under the same catalogue, prerequisites, costs, staffing and provenance rules, funded from P12 conserved resources.
- **Campaigns.** All state introduced by any entry is campaign-specific. Save and load restore it without rerolling or sharing between campaigns. The multi-campaign save library remains a separate feature.
- **Visual consequence.** Where an entry changes the building's footprint or exterior equipment, the lot shows it; where it changes only interior equipment, the facade may stay. No entry's visual state is ever the authority for its capability.
- **The consumer rule.** No entry ships until at least one real task can be performed, or performed differently, because of it. An effect with no named consumer is not a benefit; it is unfinished work.

## 2. The accepted baseline this catalogue extends

**CURRENT CODE VERIFIED** at `7ae36b44d99c505246d17dcc37beba94fa59a18a`. These are facts about shipped behavior, not proposals.

Nine buildable blueprints exist. Six are capacity-bearing and three are effect-only, which matters because the catalogue's office reconciliation turns on that distinction.

| Blueprint | Capability | Capacity | Capex | Opex/week | Build weeks | Footprint | Instances |
|---|---|---:|---:|---:|---:|---|---|
| Development & Casting Office (the baseline office) | development-casting | 2 | $1,500,000 | $5,500 | 14 | 3×2 | one during founding |
| Development & Casting Annex | development-casting | 1 | $780,000 | $3,500 | 13 | 3×2 | unlimited |
| Development & Casting Hall | development-casting | 2 | $1,400,000 | $6,000 | 20 | 4×3 | unlimited |
| Development Office II | development-casting | 0 | $600,000 | $2,500 | 8 | 3×2 | one |
| Development Office III | development-casting | 0 | $1,200,000 | $4,000 | 12 | 3×2 | one |
| Craft Services Annex | set-scenery | 0 | $400,000 | $2,000 | 6 | 3×2 | one |
| Soundstage | soundstage | 1 | $2,400,000 | $9,000 | 16 | 4×4 | unlimited, numbered |
| Post Building | post | 2 | $1,150,000 | $5,000 | 14 | 3×2 | unlimited |
| Scenery Shop | set-scenery | 2 | $850,000 | $4,000 | 11 | 3×2 | unlimited |

Six further accepted facts constrain the catalogue.

1. **Only four facility capabilities exist:** development-casting, soundstage, set-scenery, post. Every new department either reuses one or requires a new capability value, which is additive save and projection work.
2. **A capacity-zero blueprint never joins the capacity registry.** Completion flips it operational and starts its operating charge, but it offers no slot. Office II, Office III and the Craft Services Annex all work this way, and the registry invariant requires every registered facility to have a positive integer capacity.
3. **Office III is the only blueprint in the catalogue with a prerequisite.** It declares `requires: [{ kind: 'facility', blueprintId: 'development-office-2' }]`, evaluated as "at least one operational placement of that blueprint exists", and the player-facing refusal reads "Requires an operational Development Office II." §8.3 disposes of it.
4. **The requirement type already has a date arm.** `BlueprintRequirement` accepts `{ kind: 'date'; week: number }` alongside facility, structure, rank, certificate and award arms. A commercial-release gate therefore has an existing shape and needs no new concept.
5. **A production reserves capability by phase**, as an exact set rather than a floor: development and pre-production hold development-casting; rehearsal holds soundstage; shooting holds soundstage and set-scenery; post-production holds post; release-ready holds nothing. Three different owners contend for the one development-casting pool: productions, screenplays and casting sessions.
6. **A Set has no geometry.** `StudioSet` carries a mount, a type, quality, novelty, condition and genre weights, but no size. One non-retired Set occupies one stage's mount. This single fact decides the disposition of CAT-011 and CAT-013.

The founding lot supplies five founding bodies and three landmarks. The Casting body deliberately provides no capacity: one shared Development & Casting facility stands at the Development body. The Production/Post body provides both the Post Building and the Scenery Shop. Any estate count must respect that grouping.
## 3. Corrected evidence

The proposal's sources were re-checked independently. Twelve consequential claims were re-verified, eight drawn from film-industry sources and four from comparators. Three stand as stated, two are verified but corrected, four are only partly verified, and three are not verified: the monopack era, the post-production role split, and the optics inference. Each unverified claim is carried as authored extrapolation or dropped, never as evidence. **SOURCE FACT** is what the source establishes; **OWNER GAMEPLAY RULE** is what the Owner has chosen; **IMPLEMENTATION RECOMMENDATION** is what this catalogue proposes. The three are never merged.

| Claim | Verified status | Correction this catalogue applies |
|---|---|---|
| ARRI reflex 35 mm, 1937 | SOURCE VERIFIED | The proposal's "production-ready reflex camera in 1937" is right but must be read narrowly. ARRI records a **1936 prototype** and a **1937 production-ready launch at the Leipzig Fair**. That is a manufacturer's launch, not widespread availability, and the Second World War interrupted civilian supply. CAT-020's earliest research window may open in the 1930s; its commercial-release milestone may not be set to 1937 on this evidence. |
| ARRI quiet portable 35 mm, 1972 | SOURCE VERIFIED, materially qualified | The 1972 ARRIFLEX 35BL was ARRI's first silent 35 mm production camera, but the same page records roughly 33 dB and **a lens blimp still required for silence**; blimpless operation arrives with the 35BL 3 in **1980**. CAT-021 is therefore **two authored generations**, not one: a quieter portable body, then a genuinely blimp-free one. The proposal collapsed them. |
| Technicolor three-strip, 1932 | PARTIALLY VERIFIED, and a strong new finding | The Eastman Museum confirms the 1932 introduction and adds that **only twenty-nine cameras were built between 1933 and 1950**. Three-strip was a scarce **rented** capability, not a purchasable product. CAT-030 gains a third acquisition route accordingly: hire the supplier's package with its personnel. |
| A later single-strip or monopack colour era | **NOT VERIFIED** | Neither retrieved source mentions monopack or a single-strip era; the second cited page returned an error. CAT-031 keeps its place in the destination but its historical framing is **authored extrapolation** until a source is produced. |
| Post-production splits into picture editorial, sound, and grading and delivery | **NOT VERIFIED** | The cited ScreenSkills page returned HTTP 403 on every attempt, in the proposal's pass and again in this one, and was never read. A substitute page consulted during this pass could not be re-identified with a citable locator, so it is withdrawn rather than cited anonymously. The claim has no source. The catalogue keeps CAT-035 and CAT-039 on their own merits, which never depended on it. |
| A major studio advertises differentiated spaces | SOURCE VERIFIED | Pinewood advertises 30 stages, 3 exterior backlots, an underwater stage, 20 cutting rooms and 6 mixing theatres. Self-reported marketing, and the figures **mix Pinewood, Shepperton and Pinewood Toronto**, so they justify differentiated space types and nothing about counts or ratios. |
| ILM StageCraft is more than LED panels | PARTIALLY VERIFIED | The negative half holds and hardware and capture components are named; the software layer was not itemized on the page read. Enough for CAT-045's shape, not for any component list. |
| Newer optics do not universally dominate | **NOT VERIFIED from a citable locator**, inference corrected | The cited Panavision page returned an error. The quotation reached this pass only through a trade reproduction that cannot be cited, so it is not counted as read. Even if it were, it would establish that older series **remain in the rental inventory**, which is availability, not usage share. "Newer optics do not universally dominate" is the proposal's inference and has no volume data behind it. The design consequence, that older equipment stays a lawful choice, rests on the Owner's direction and needs no source. |
| Hollywood Animal cancels technology work | SOURCE VERIFIED | Verified only through the official news API; the rendered article pages returned navigation chrome. The exact wording is "You can now cancel the following processes: creating or upgrading technology, researching story elements, writing a script." Dates could not be confirmed. |
| Moviehouse guide | SOURCE VERIFIED, attribution corrected | It is a **pinned forum topic** in the game's discussion hub. The fetched page did **not** confirm the author is the developer, so the proposal's "publisher-branded guide" overstates it. |
| Blockbuster Inc. build, decorate, clone, expand | PARTIALLY VERIFIED, claim reduced | Developer store copy confirms build, decorate and Set creation. **"Clone" and "expand" are not supported by the source**, and "freeform" is an interpretation. |
| Two Point Hospital research, equipment upgrades, staff abilities, physical expansion | PARTIALLY VERIFIED, claim reduced | Research, staff training and layout are confirmed. **Equipment upgrades are folded into research rather than named separately, and physical expansion of an existing hospital is not described** — the copy points to new hospitals. The proposal's cleanest comparator claim is its weakest. |

Two general rules follow, and they bind the period column of every entry below. A manufacturer's history page evidences what that manufacturer says it shipped, never industry-wide adoption. A first invention date, a first product date and a widespread-availability date are three different facts, and only the third can justify a commercial-release milestone.

## 4. Grouping: 58 candidates, 5 new building types and 1 ground zone

**IMPLEMENTATION RECOMMENDATION.** The proposal's own framing, that these are not 58 buildings, needed a concrete answer. Here it is.

Eight physical department types carry the whole catalogue. Four already exist as accepted capabilities. Four are new, and only three of those are genuinely new bodies on the lot.

| Department | Accepted today? | New capability needed? | Carries |
|---|---|---|---|
| **D1 Development & Casting** | yes, `development-casting` | no | office capacity, development standard, screen-test suite |
| **D2 Research Laboratory** | **no** | yes | researcher seats, instrument modules, integration bay |
| **D3 Soundstage** | yes, `soundstage` | no | acoustic treatment, rigging, Set turnover, size class, LED volume, water tank |
| **D4 Scenery & Construction** | yes, `set-scenery` | no | work bays, miniature shop, prop store and stock |
| **D5 Wardrobe & Make-up** | **no** | yes | fitting stations, collections, prosthetics |
| **D6 Post** | yes, `post` | no | cutting rooms, ADR and Foley, mixing, grading, mastering, storage, compute |
| **D7 Backlot** | **no** | ground, not a building | serviced exterior zone |
| **D8 Support & Services** | partly, craft services today | no for craft; later for the rest | craft services, publicity, archive, screening |

Only six entries need new ground of their own, and five of those are buildings: the Research Laboratory (CAT-005), a larger stage class (CAT-011), the LED volume (CAT-045), the water stage (CAT-049) and the archive vault (CAT-051). The sixth, the backlot zone (CAT-014), is a serviced exterior zone rather than a building, which is why D7 answers **no** in the table above. Every other retained entry is a module on an existing body, an equipment purchase, a conversion of a body the studio already owns, or authored creative stock.

Five kinds of purchase, applied consistently below, replace the proposal's four verbs. The fifth is the one the proposal blurred.

| Kind | What is bought | Scientist needed? | Owning system |
|---|---|---|---|
| **Capacity** | more usable space or seats for work that already exists | no | P09 |
| **Conversion** | a source-to-target change to a body already owned | only where the target technology is not yet commercially available | P09 job, P13 eligibility |
| **Equipment** | a tool or compatible workflow package | research early, or buy at commercial release | P13 route, P11 quote |
| **Creative stock** | authored reusable assets and preparation | no; creative and production staff, never laboratory researchers | Set, wardrobe and property owners |
| **Format or standard** | a delivery or presentation specification the studio can now meet | sometimes | the release and Post owners |

Buying desks never needs a breakthrough. Acting never improves because a room reaches a higher level. Worker protection is never sold as an optional profit upgrade. Administration, finance readability, save slots and navigation are product quality, not research unlocks.

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

A conversion of a body the studio owns should always cost less than building the equivalent new, because the ground, shell and identity are already paid for. Where a proposed conversion price approaches the new-build price, the descriptor is wrong or the conversion is really a rebuild.

### 5.2 Research workload classes

One researcher produces 1.0 work unit per researcher-week. A full four-seat laboratory funded to saturation produces 6.0 units a week. Those two figures come from the Annex fixture and are the only inputs needed.

| Class | Work | One full laboratory, unfunded | One full laboratory, funded | Two cooperating, funded |
|---|---:|---:|---:|---:|
| **W1 small** | 24 units | 6 weeks | 4 weeks | 3 weeks |
| **W2 medium** | 64 units | 16 weeks | 11 weeks | 7 weeks |
| **W3 large** | 144 units | 36 weeks | 24 weeks | 15 weeks |
| **W4 major** | 288 units | 72 weeks | 48 weeks | 30 weeks |

W2 is the existing Annex fixture, so the catalogue and the Annex matrix agree by construction.

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

Periods are expressed as bands, never as exact years, because the accepted product has no calendar and the absolute weekly counter is its only clock. Each entry names the band in which its early-research window may open and the band in which its commercial release may fall. Exact weeks come from the eventual calendar owner (**POST-P12 VERIFICATION REQUIRED**), and a manufacturer's first-product date never becomes a commercial-release milestone by itself.

| Band | Rough era | Evidence status |
|---|---|---|
| **B1** | the silent-to-sound transition | documented |
| **B2** | early colour and the studio system | documented |
| **B3** | widescreen, portable capture, optical effects | documented |
| **B4** | digital editorial, effects and acquisition | documented |
| **B5** | real-time and virtual production | documented as a current offering |
| **B6** | beyond documented technology | **authored extrapolation**, never presented as history |
## 6. The disposition register

All 58 candidates are disposed of below. No candidate is silently dropped. Columns are: the disposition and why; the purchase kind from §4; the exact change and the operation that feels it; the knowledge prerequisite before the installation prerequisite; the capital class and research class from §5; the period band; and one acceptance task that would demonstrate the entry actually works. The rules of §1.3 apply to every row and are not repeated.

### 6.1 D1 Development & Casting

| ID | Disposition | Kind | Exact change, and which operation | Knowledge → installation | Class · research | Band | Acceptance task |
|---|---|---|---|---|---|---|---|
| **CAT-001** | **REVISED.** The accepted catalogue already sells development capacity as two new buildings, the Annex at +1 and the Hall at +2. What it lacks is the in-place route, so this entry becomes the fit-out and, only where real space is missing, the extension. | capacity | +1 shared Development & Casting slot on an existing body. Felt by whichever of the three contending owners is being refused: productions in development or pre-production, original screenplays, or casting sessions. | none → suitable unused floor area on the body, or lawful ground for an extension | K2 · none | any | A screenplay that was refused for capacity starts in the week after completion, and the estate count still shows one building. |
| **CAT-002** | **REVISED.** Not a separate building. Office II becomes a **development standard level recorded on one office body**, beside that body's own capacity. The accepted standalone Office II remains valid and purchasable, and existing ones keep their identity and charge. | conversion | Raises the studio-wide highest development standard to II: +4 first-draft strength input and one extra week on an original screenplay. No audition or capacity change whatever. | none → an eligible office body, idle of all three contending owners | K2 · none | any | Two offices exist, only one at standard II; a draft assessed anywhere in the studio gets the +4, and the baseline body's two slots are still allocatable. |
| **CAT-003** | **RETAINED and detailed.** The Owner's direct I→III route, worked out in §8 with the prerequisite disposition. | conversion | Raises the highest standard to III: +9 strength input replacing II's +4, and two extra weeks on an original screenplay. | none → an eligible office body, idle; §8.3 prerequisite disposition | K3 · none | any | A studio that has never owned Office II converts its office directly to III, the quote shows why it takes twice as long as II→III, and the body keeps its name and history. |
| **CAT-004** | **DEPENDENCY-QUALIFIED** on the casting-evidence owner. The room is easy; comparable retained performance evidence is a new evidence model, and reducing casting uncertainty touches person truth that P10 owns. | equipment | Produces retained, comparable screen-test evidence for a role. It must never manufacture ability or reveal hidden potential. | none → a casting room and the evidence model | K1 · none | B1+ | Two candidates screen-tested for one role produce comparable retained evidence; no hidden attribute is exposed and no rating changes. |

### 6.2 D2 Research Laboratory

**The whole department is blocked on one Owner decision.** No Laboratory blueprint exists in the accepted catalogue; a search of the accepted source finds none. Design §23 already makes the minimal Laboratory and stable Scientist substrate a hard blocker on the P13A checkpoint. Every row here inherits that block, and none of them is a reason to widen it.

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
| **CAT-014** | **RETAINED**, later cinema. Ground, not a building. | capacity, new ground | Makes authored exterior Set types and equipment support available on the lot as an alternative to a covered stage for suitable scenes. | an exterior production method must exist → a selected lot area, serviced | K3 · none | B2+ | A scene authored as exterior-suitable can be scheduled on the backlot while the stages are busy, and a scene that needs a stage still refuses. |

### 6.4 D4 Scenery & Construction

| ID | Disposition | Kind | Exact change, and which operation | Knowledge → installation | Class · research | Band | Acceptance task |
|---|---|---|---|---|---|---|---|
| **CAT-015** | **RETAINED.** First programme. The accepted Scenery Shop is capacity 2 for $850,000 over 11 weeks; the in-place bay is the cheaper route to the same kind of relief. | capacity | +1 concurrent Set construction, repair or load-in. Felt by shooting, which holds set-scenery, and by Set work waiting on the shop. | none → shop floor area or lawful ground | K2 fit-out, K3 another shop · none | any | Two Sets under construction plus a third request: the third starts only after the bay completes. |
| **CAT-016** | **SPLIT.** The proposal bundled a work-method fit-out with a stock of reusable components. They have different owners, different quotes and different cancellation consequences, so they cannot be one card. Source ID preserved. | — | — | — | — | — | — |
| **CAT-016a** | **RETAINED** as the assembly-method fit-out. | conversion | Makes the shop able to build with standardized reusable components. | none → the shop | K1 · none | B1+ | A Set authored as flat-compatible is built with fewer new components in the fitted shop. |
| **CAT-016b** | **RETAINED** as the reusable flat stock. | creative stock | Reduces future eligible Set preparation by reusing actual recorded components. A physical flat is never counted on two Sets at once. | none → storage and the stock records | K1 per batch · none | B1+ | A stored flat used by one standing Set is unavailable to a second; retiring the first releases it. |
| **CAT-017** | **SPLIT**, same reason as CAT-016. Source ID preserved. | — | — | — | — | — | — |
| **CAT-017a** | **RETAINED** as prop workshop and storage capacity. | capacity | +1 concurrent property fabrication or preparation task, and storage for reusable props. | none → floor area | K2 · none | B2+ | A property task waiting on the workshop starts after completion. |
| **CAT-017b** | **DEPENDENCY-QUALIFIED** on property identity and reservation existing. Collecting props with no reservation model would be inventory with no consequence. | creative stock | Adds production-design choices; a reusable prop avoids refabrication only when it is actually free. | property identity and reservation → storage | K1 per commission · none | B2+ | A prop reserved by a standing Set cannot be used by a second production; no bonus follows merely from owning more props. |
| **CAT-040** | **RETAINED**, listed here because a miniature shop is a Scenery module, not an effects building. | capacity, creative stock | Supplies authored miniature environments and the effect shots that consume them, as an alternative to full-size construction for suitable scenes. | none → shop area and fabrication equipment | K2 · none | B2+ | A scene authored as miniature-suitable is produced without a full-size Set, and a scene that is not stays refused. |

### 6.5 D5 Wardrobe & Make-up

A new department. Today no capability covers it; costume and make-up work has no facility of its own.

| ID | Disposition | Kind | Exact change, and which operation | Knowledge → installation | Class · research | Band | Acceptance task |
|---|---|---|---|---|---|---|---|
| **CAT-018** | **DEPENDENCY-QUALIFIED** on a costume and fitting workload existing. Construction cannot train performers or improve characterization. | capacity | +1 concurrent fitting or preparation task when that workload exists. | none → floor area, new capability value | K2 · none | B1+ | A production whose plan includes fittings waits on the department, and a second station clears the wait. |
| **CAT-019** | **RETAINED** as content, conditional on the same workload. | creative stock | Expands credible costume choices and reusable stock for intended settings. No deterministic genre score and no inventory clicking. | none → storage and content records | K1 per collection · none | B2+ | A period production can be dressed from stock; an unsupported setting still needs a commission. |
| **CAT-047** | **RETAINED.** A practical-effects workroom belongs in this department, not with digital effects. | capacity, creative stock | Adds character-transformation options and preparation capacity for eligible projects. | none → floor area and specialist equipment | K2 · none | B3+ | A project authored to need prosthetics can be prepared on the lot rather than refused. |

### 6.6 D6 Post

| ID | Disposition | Kind | Exact change, and which operation | Knowledge → installation | Class · research | Band | Acceptance task |
|---|---|---|---|---|---|---|---|
| **CAT-032** | **RETAINED.** First programme. The accepted Post Building is capacity 2 for $1,150,000 over 14 weeks; a fitted room is the cheaper relief. | capacity | +1 concurrent post slot. Felt directly by wrapped pictures, which release every reservation at shooting's end and then wait holding nothing. | none → floor area or ground | K2 fit-out, K3 another building · none | any | Three wrapped pictures and two post slots: the third starts the week after the room completes. |
| **CAT-028** | **RETAINED.** | equipment | Adds planned dialogue-replacement and constructed-effects capability and capacity for films whose package includes that method. Distinct from production dialogue and from final mixing. | sound method operational → a Post room | K2 · none | B1+ | A film whose package includes replacement dialogue uses the room; one that does not is unaffected, and no already-filming picture changes method. |
| **CAT-029** | **SPLIT.** The proposal bundled mixing capacity with a delivery-format modernization and then asked the card to "show which of the two is purchased", which is the definition of two entries. Source ID preserved. | — | — | — | — | — | — |
| **CAT-029a** | **RETAINED.** First programme. | capacity | +1 concurrent mixing task, and the base capability to finish supported films. | none → a Post room | K2 · none | B1 | A film waiting to mix starts after the theatre completes. |
| **CAT-029b** | **RETAINED** as a format modernization. | format | Lets the studio meet a specific compatible multichannel delivery format. | format known or released → the mixing theatre | K2 · W2, P2 where authored as research | B3+ | A film selecting the multichannel deliverable is legal only with the modernized theatre; the basic deliverable stays available. |
| **CAT-033** | **RETAINED.** | equipment | Supports handling picture and sound together and reduces an identified manual synchronization task. Must not charge again for capability already inside base sound Post. | sound Post operational → a cutting room | K1 · none | B1+ | The named synchronization task shortens; a silent picture's editorial is unchanged. |
| **CAT-034** | **RETAINED.** Digital. | equipment | Enables nondestructive alternate edits and a defined digital editorial workflow; can reduce a modeled revision task. | digital material by capture or an authorized scan, plus storage → a compatible room | K3 · W3, P3 | B4 | A film-originated picture with an authorized scan route uses digital editorial without a digital camera. |
| **CAT-035** | **RETAINED.** Digital. | equipment | Enables a digital finishing and mastering path and its creative controls. No retroactive change to released films. | digital material and the selected production method → a compatible room | K3 · W3, P3 | B4 | A picture finished digitally reaches its deliverable; a released picture is untouched. |
| **CAT-037** | **RETAINED.** Digital. | equipment | Lets distinct editorial tasks share recorded assets safely, supporting extra editors only where the work genuinely divides. | none → Post and its rooms | K2 · none for the hardware; W2, P3 for novel coordination software | B4 | Two editors work on one picture only where its tasks divide; buying storage alone shortens nothing. |
| **CAT-038** | **RETAINED.** Digital. | capacity | Raises simultaneous or aggregate render capacity for real render jobs. Useless on films with no render work. | none → floor area, power, cooling | K3 · none | B4 | A render queue drains faster; a film with no render work is unaffected. |
| **CAT-039** | **DEPENDENCY-QUALIFIED** on the release owner defining the deliverable. Equipment must not smuggle in a distribution business. | equipment, format | Completes an explicitly selected deliverable format and reduces a defined mastering task. | the deliverable format must exist → a Post room | K2 · none | B4 | The selected deliverable is produced; no territory, window or revenue behavior changes. |

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
| **CAT-030** | **REVISED: a third acquisition route.** The Eastman Museum's twenty-nine cameras across seventeen years make three-strip a scarce **rented** capability. Buy-or-develop alone misrepresents it. | equipment, format | Enables a colour production method with its own capture, lighting and processing requirements. Routes: develop early; buy at release; **or hire the supplier's package with its personnel**, which is period-faithful and gives a cash-poor studio a real door. | colour method → capture, lighting and processing chain, or a hire agreement | K3 to buy, K1 per production to hire · W3, P2 | research B2, release later in B2 | Colour is produced by hire without owning a camera, and the hire terms recur per production while ownership does not. |
| **CAT-031** | **RETAINED**, historical framing corrected to authored extrapolation until sourced. | equipment, format | Reduces the specific complexity, media handling or preparation burden of the earlier colour route. | prior colour route → the later workflow | K3 · W3, P1 | B3, framing authored | The named burden falls; storytelling quality does not change. |
| **CAT-041** | **RETAINED**, later cinema. | equipment | Combines recorded elements through a defined optical-effects pipeline. Old footage truth is untouched. | method → elements, processing and Post work | K2 · W3, P1 | B3 | A composited shot is produced from separate elements; a picture without elements gains nothing. |
| **CAT-042** | **RETAINED**, later cinema. | equipment | Allows authored repeatable passes and the multi-element effects that need camera repeatability. | method → rigged stage area, operators, a compositing route | K3 · W3, P2 | B3 | A repeatable-pass shot is legal only with the rig and a compositing route. |

### 6.8 Digital effects and modern production

| ID | Disposition | Kind | Exact change, and which operation | Knowledge → installation | Class · research | Band | Acceptance task |
|---|---|---|---|---|---|---|---|
| **CAT-043** | **RETAINED.** Digital. | equipment | Supports digital element combination and CG-dependent scenes with real artist and render work. Not a universal quality modifier. | method → digital images, storage, artists, compute, a compatible package | K3 · W4, P3 | B4 | A CG-dependent scene consumes artist and render capacity; a scene without CG is unaffected. |
| **CAT-044** | **DEPENDENCY-QUALIFIED** on a production-planning evidence owner. Without one there is no later task to reduce. | equipment | Gives earlier evidence about complex staging and camera plans, reducing named later setup or rework. | none → tools and per-project planning assets | K2 · W3, P3 | B4 | A complex sequence planned in advance shows the named later task reduced; a simple one shows no change. |
| **CAT-045** | **RETAINED.** Modern. A new body, and the catalogue's only K5. | conversion or new body | Supports authored in-camera-background production with coordinated tracking, real-time imagery and lighting. It removes neither practical locations nor all Post. | method → stage geometry, display and tracking, a real-time pipeline, prepared assets, operators | K5 · W4, P3 | B5 | An in-camera-background scene is produced only when assets, tracking and operators are all present; buying panels alone refuses. |
| **CAT-046** | **RETAINED.** Modern. | capacity, equipment | Produces recorded motion and performance data for an explicitly supported digital-character workflow. No synthetic acting skill and no assumed rights. | method → performers, capture equipment, animation processing, final effects work | K3 · W4, P2 | B5 | A digital-character scene consumes capture and animation work; the performer's own record is unchanged. |
| **CAT-036** | **RETAINED.** Digital. | equipment | Enables a digital capture workflow with changed media, ingest and processing requirements. Neither always better-looking nor always cheaper. | method → sensors and media, storage, compatible Post | K3 · W4, P2 | research B4, release later in B4 | A digitally captured picture uses the digital chain end to end; a film-originated picture still needs its scan route. |

### 6.9 D8 Support & Services

| ID | Disposition | Kind | Exact change, and which operation | Knowledge → installation | Class · research | Band | Acceptance task |
|---|---|---|---|---|---|---|---|
| **CAT-048** | **RETAINED AS ACCEPTED**, and its proposed extension is **REJECTED**. The accepted Craft Services Annex already cuts the one-film freelancer fee by 15% for $400,000 over 6 weeks, limited to one instance. The proposal's "genuinely distinct future capacity variants" name no distinct consumer, and a second discount tier would be exactly the stacking the accepted rule forbids. Destination: reconsider only with a proven distinct benefit. | equipment | unchanged accepted behavior | none | accepted | any | The existing behavior is unchanged and a second annex is still refused. |
### 6.10 Connected later capabilities

All ten are **DEPENDENCY-GATED**: retained in the destination, each waiting on an owning system that does not exist. Two carry corrections. None may be quietly folded into P13's first launch, and none is deferred forever.

These rows deliberately carry no purchase kind, no knowledge-versus-installation split and no research class. The gating owner is the system that defines the consumer, and until it exists there is nothing honest to put in those columns. The acceptance task is therefore written conditionally, in the same style as the dependency-qualified entries above: it states what the owning system would have to make demonstrable.

| ID | Gating owner | Exact change when its owner exists | Acceptance task once the owner exists | Correction or note | Class | Band |
|---|---|---|---|---|---|---|
| **CAT-049** | an authored aquatic film method | A specialist tank stage supports explicitly authored aquatic shots with a bounded safe workflow. | An authored aquatic shot is scheduled on the tank stage and completes its bounded safe workflow, and the same shot is refused on an ordinary stage. | Pinewood's advertised underwater stage is verified support for the space type; it says nothing about how a game should cost or schedule it. | K4 or K5 | B3+ |
| **CAT-050** | the stunt system | Dedicated training and preparation space supports actual stunt preparation. | A stunt in an authored plan is prepared in the room and the plan records the preparation, while an unprepared stunt is still possible and still riskier. No protection appears as a purchasable option. | **Correction:** the approved rulings park **stunt and injury systems in P16+**. This entry waits on that placement, not on a facility decision. Basic worker protection is never sold as an optional upgrade. | K2 | B2+ |
| **CAT-051** | the P16+ library and rights system | A controlled archive provides physical preservation and storage capacity for a governed library business. | A titled work the studio owns occupies archive capacity and reloads identically, and a full archive refuses new storage without deleting any history. | Rulings park library and IP transfer in P16+. Nothing may delete game history because a vault fills or a save is loaded. | K3, new body | B2+ |
| **CAT-052** | the same P16+ rights owner | An archive or Post provider gains restoration and reissue preparation for exactly the works the studio owns or has licensed. | A work the studio owns or has licensed is restored and reissued, an unowned work is refused, and no restored work re-enters production past the first-filming lock. | No invented ownership and no automatic revenue. Retrospective restoration is a rights workflow, never a way around the first-filming lock. | K3 | B4+ |
| **CAT-053** | the marketing owner | A trailer and artwork room adds capacity to produce defined marketing materials for actual campaigns. | A named campaign consumes room capacity to produce its defined materials, and a second room raises output capacity without raising demand. | Marketing commitment already exists as an accepted cost at greenlight; the *work* does not. Owning the room must not multiply demand. | K2 | B2+ |
| **CAT-054** | P14 talent and the talent-development owner | Training rooms support costed coaching or role preparation. | A named performer completes costed coaching, the effect appears only where P14 permits, and no credit or fame is created by the room. | Rehearsing manufactures no credits and no fame, and on-set rehearsal still needs its real stage. | K2 | B2+ |
| **CAT-055** | the young-performer programme owner | Governed suitable spaces add support capacity for lawful young-performer participation. | A young performer is admitted to a production only while the governed space is operational, and the space confers no performance advantage. | Mandatory minimum protection is a condition of participation, never a purchasable advantage and never a research gate. | K2 | B1+ |
| **CAT-056** | **P16+, not "P18"** | A compatible stage and workflow support episodic or multicamera work. | An episodic production occupies the compatible stage and completes its workflow, and the studio gains no channel, rights or distribution from owning it. | **Correction:** the proposal cites a "P18 series/platform workflow". No P18 exists in the approved roadmap, which runs P13, P14, P15 and then a P16+ parking lot. The rulings park **television and streaming in P16+**, so this entry is re-pointed there. It grants no channel, rights or distribution. | K3 | B3+ |
| **CAT-057** | a location-filming owner | Field equipment and transport support a bounded off-lot production plan with exact away resources. | An off-lot plan draws exactly its named away resources and is refused when one is missing, with no second simulated city created. | No second simulated city, and location discovery is not laboratory invention. | K2 | B2+ |
| **CAT-058** | P07 reception and audience evidence | A fitted presentation room collects governed test-screening evidence that may inform edit decisions. | A test screening returns governed evidence that may change an edit decision, and never displays exact hidden demand or a profitability promise. | P07 owns reception truth. The room must never reveal exact hidden demand or promise profitability. | K1 | B2+ |

### 6.11 Register summary

Fifty-eight source IDs enter. Two are combined into another entry, three are split into two entries each, and fifty-three stand alone, so **fifty-nine catalogue entries** leave. Every source ID resolves to exactly one place.

| Disposition of the 59 entries | Count | Which |
|---|---:|---|
| **RETAINED**, including those whose period or historical framing was corrected | 35 | 003, 005, 006, 010, 014, 015, 016a, 016b, 017a, 019, 020, 022, 023, 024, 026, 027, 028, 029a, 029b, 031, 032, 033, 034, 035, 036, 037, 038, 040, 041, 042, 043, 045, 046, 047, 048 |
| **REVISED**, a material change to shape, route or claim | 4 | 001 in-place route, 002 standard on a body, 021 two generations, 030 a hire route |
| **DEPENDENCY-QUALIFIED**, retained but not sellable until a named owner defines the consumer | 10 | 004, 009, 011, 012, 013, 017b, 018, 025, 039, 044 |
| **DEPENDENCY-GATED later**, waiting on an owning system | 10 | 049–058 |

| Structural change to source IDs | Count | Which |
|---|---:|---|
| **COMBINED** into CAT-006, source ID preserved and resolvable | 2 | 007 optics variant, 008 compute variant |
| **SPLIT** into two entries, because a capacity purchase was bundled with a content or format purchase | 3 | 016 → 016a and 016b, 017 → 017a and 017b, 029 → 029a and 029b |
| **REJECTED** | 1 | the proposed Craft Services capacity variant inside 048, for naming no distinct consumer; destination is reconsideration on proof of a distinct benefit |

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

Direct I→III takes **twice** as long as II→III, satisfying the Owner's "substantially longer" direction. The Owner's 4, 8 and 16 shape is preserved; the money is this catalogue's proposal.

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
## 9. Paper tests on one fixed resource envelope

**NUMERICAL/CONTENT HYPOTHESIS.** One envelope, E1, is used for every comparison below so the scenarios can be read against each other. Nothing here is a runtime result, a playtest or a claim about enjoyment.

### 9.1 The envelope, and one scale question Current Ops must settle

**Envelope E1.** Cash $3,000,000. The founding estate: a Development & Casting body with 2 shared slots, a Casting body with none, two soundstages at 1 each, and a Production/Post body providing 2 post slots and 2 scenery slots. No laboratory and no researchers. Horizon 52 weeks. Two films in production and one original screenplay in development.

**Scale S1.** Every money figure in the Builder Annex fixture H1 is multiplied by five, and no duration changes. That single uniform multiplier is the whole change, so **every ratio, break-even and dominance conclusion already validated in Annex §4.2 is preserved exactly**; only the absolute money scale moves, toward the one the accepted blueprints establish. Under S1 a researcher costs $2,000 a week, a full four-seat laboratory saturates its budget at $40,000 a week, an older stage's acoustic conversion costs $600,000, and a funded medium research programme costs $528,000 in spend and payroll.

**Why the scale has to move.** That last figure is the whole argument. In H1 the same fully funded medium programme costs $105,600, which is about a quarter of the $400,000 Craft Services Annex, the cheapest accepted building. A multi-year invention programme that costs a quarter of the smallest shed on the lot is not a scale a studio can reason about. Under S1 it costs about 1.3 times that building, which is a proportion the Owner can argue with.

**S1 prices research and equipment, not buildings, and one gap stays open.** Where H1 and an accepted blueprint price the same object, the accepted value governs and S1 is silent. The one object both price is a new soundstage: H1 multiplied by five gives $2,000,000 over 20 weeks, while the accepted `stage-standard` blueprint gives $2,400,000 over 16 weeks. The paper tests below use H1 multiplied by five throughout, because every comparison in them is internal to H1 and substituting one input would break the ratios S1 exists to preserve. Reconciling the two prices belongs to the open scale decision in §11. It changes no conclusion here: converting an owned stage beats building one on both cost and date under either price, by $1,600,000 and seven weeks against the H1 figure and by $2,000,000 and three weeks against the accepted blueprint.

**This is an open scale question, not a silent edit.** The Annex fixture is left at its validated values; this catalogue states S1 and recommends Current Ops adopt it before any tuning, applying the same multiplier to H1 so one scale governs both documents.

Working values used below, all S1: first laboratory $900,000 over 12 weeks at $3,000 a week; acoustic instrument module $350,000 over 5 weeks at $1,200 a week; sound package access $200,000 plus equipment $300,000; older-stage conversion $450,000 site over 9 weeks plus $150,000 installation over 3 weeks; nearly-compatible stage $50,000 site plus the same installation; a new soundstage $2,000,000 over 20 weeks; a camera package $75,000; a Post room fit-out $300,000.

### 9.2 Inventor against commercial buyer, whole life

Both studios end with operational sound on one stage. R01 is a medium workload on the mixed-systems profile: eleven weeks in one fully funded laboratory.

| | Develop early | Wait and buy at release |
|---|---:|---:|
| Laboratory | $900,000 | — |
| Acoustic instruments | $350,000 | — |
| Research spending | $440,000 | — |
| Research payroll over the project | $88,000 | — |
| Deployment on an older stage | $800,000 | $1,100,000 |
| Standing charges on the two new buildings to week 52 | $162,000 | — |
| **Total** | **$2,740,000** | **$1,100,000** |
| Sound operational about | week 26 | week 52 |

The standing charge is the one a paper comparison usually forgets. The laboratory is operational at week 13 and costs $3,000 a week to the horizon, $120,000; the instrument module is operational at week 18 and costs $1,200 a week, $42,000. The buyer owns neither building, so unlike the Annex fixture this charge is not identical across the two columns and cannot be omitted.

**The finding that matters is the marginal one.** Once the laboratory and instruments exist, they serve every later brief, so the honest comparison for this one technology is research spending plus payroll plus deployment against the buyer's deployment: **$1,328,000 against $1,100,000**, a 21% premium for twenty-six weeks of earliness and a permanent capability. The capital and the standing charge are excluded from that figure for the same reason: they buy a department, not this technology. Charge them to the technology and the premium becomes 149%, which is the number to quote to a studio that will research exactly once and then stop.

That 21% depends entirely on one rule this catalogue recommends. **The own-development concession and the prototype credit must not stack on the same quote.** A studio takes whichever single credit is worth more: access waived, or the research prototype counted as the equipment. If both apply at once the inventor's marginal cost falls to $1,128,000, within 2.5% of simply buying, and research becomes very nearly free. Refusing to stack them is the same principle as never billing one item twice, applied to credits.

### 9.3 Five situations

| Situation | What E1 shows | The decision |
|---|---|---|
| **Scarce land** | No lawful ground for a 3×2 building with clearance. A fitted Post room adds a slot for $300,000; a new Post Building costs $1,150,000 and is refused outright for want of ground. | In-place routes are not a convenience here, they are the only legal move. This is what CAT-001, CAT-010, CAT-015 and CAT-032 exist for. |
| **Idle capacity** | Two post slots, one in use. A third slot changes nothing and no eligible work is waiting. | Dominated. The card must say no eligible work is waiting for this resource, and the studio should spend on the actual bottleneck instead. |
| **Busy sole stage** | The stage's film has four weeks left. With admission closed the conversion runs weeks 5 to 16 and the stage is sound-capable at week 17 for $600,000. Building another stage costs $2,000,000, takes 20 weeks and still needs its own installation afterwards, so on nearly-compatible terms it is sound-capable at week 24 for $2,200,000. | Convert after the drain, unless the studio genuinely needs a third stage. Closing admission costs four weeks of stage service and must be shown before approval. |
| **Cash pressure** | The develop-early path commits $2,740,000 of $3,000,000 across the horizon and leaves $260,000 against continuing payroll and the rest of the estate's operating costs. Waiting leaves $1,900,000. | Waiting wins on cash and loses twenty-six weeks. A studio with payroll to meet takes the buy route, which is the point of having both. |
| **Competing research deadlines** | Two medium briefs, one laboratory. Run in sequence: first result week 11, second week 22. Split the four seats two and two: **both** arrive at week 22. | **Splitting one laboratory is always dominated.** Two teams inside one building finish nothing sooner and the first result eleven weeks later. Splitting only means something across two laboratories, and the interface should say so rather than offering a choice that cannot win. |

### 9.4 One laboratory, two laboratories, and the profile that misbehaves

| Arrangement | Mixed-systems brief | Precision-constrained brief |
|---|---:|---:|
| One full funded laboratory | 11 weeks | 11 weeks |
| Two cooperating, both funded | 7 weeks, 1.57× | 8 weeks, **1.375×** |
| One laboratory each, in parallel | both at week 11 | both at week 11 |
| Cooperate on the first, then the second | 7, then 14 | — |

The precision-constrained row is the honest one. Two laboratories on an optical prototype return 1.375×, below the Owner's 1.5 to 1.75 band, because the test sequence and not the headcount sets the date. The player must be told that in the card, not shown a range the project cannot deliver. The representative mixed-systems brief does sit in the band, at 1.57×, which is how the Owner's direction is honored without pretending it holds universally.

### 9.5 Bottlenecks, break-evens and dominated choices

- **The whole-studio bottleneck moves.** Adding development capacity to E1 with two post slots already contended simply relocates the queue to Post. A capacity purchase must name the resource the studio is actually being refused for.
- **Break-even on the office routes.** Staged buys two things for $100,000: III four weeks sooner, and the option to stop at II from week 4 and work at that standard before resuming. Direct wins when neither is worth $100,000, which is the common case for a studio with no original draft ready to assess. Staged wins when the studio will actually use the pause, or when four weeks of III matter more than the cash.
- **Break-even on convert against build another.** Converting an owned stage beats a new stage whenever the studio does not need the extra stage capacity, by **$1,600,000 and seven weeks** in E1. The comparison must count the whole path, because the accepted stage blueprint grants no acoustic capability: a new stage is $2,000,000 over 20 weeks and is then still a silent stage, so on the most generous nearly-compatible terms it needs $200,000 more and three weeks more of installation, reaching $2,200,000 and sound at week 24 against the conversion's $600,000 and week 17. The new stage wins only when the capacity itself is wanted.
- **Dominated: splitting one laboratory**, as shown above.
- **Dominated: the accepted office ladder.** Building Office II and then Office III costs $1,800,000, occupies three plots and leaves $12,000 a week in charges for one standard. Both conversion routes beat it on every axis except that they take the office offline.
- **A balance risk this catalogue does not resolve.** If the two inventor credits stack, developing costs almost exactly what buying costs, and no studio would ever wait. The no-stack rule of §9.2 is the recommended fix; the alternative levers are a smaller equipment concession or a larger research workload, and Current Ops should pick one.

### 9.6 Proofs to run later, documented not run

New capacity is actually reserved and used, not merely counted. The silent path is unchanged. Sound is impossible before every required capability exists, and legal the week after the last one arrives. The first-filming boundary holds in both directions. A queued conversion behind a busy facility starts only when the facility drains, and never claims a date while open-ended holders remain. Duration and charges follow the source state. No double endowment, equipment, discount or royalty. Mixed inherited and new counts are honest. Migration is explicit. The same campaign reloads deterministically and different campaigns share nothing. Real input at real viewports.

## 10. Implementation programmes

Recommendations for Current Ops. No new package numbers, no instruction to any coding lead, and no promise that a programme finishes in one run.

| Programme | Done means | Catalogue scope |
|---|---|---|
| **1. Inventory and office modernization** | Honest mixed inherited and new counts; one shared detail owner; direct I→III and II→III quotes and jobs with capacity and identity preserved; the §8.3 prerequisite disposition applied in authoritative code; real work using an added slot. | CAT-001, 002, 003; every existing building inventoried |
| **2. First integrated research and adoption** | Named staff to laboratory capacity; usable R&D spend with a visible bottleneck; two laboratories cooperating or splitting; retained work across a cancel and restart; a plan queue; an inventor quote with its components; a real sound installation; and a pre-filming method change. | CAT-005, 006, 010, 026, 029a, plus one genuinely independent second brief |
| **3. Production capacity and specialization** | Post and scenery expansion, one stage and Set compatibility improvement, and one useful alternative method, with whole-studio consequences measured rather than asserted. | CAT-015, 032, and selected entries from 011–025, 028, 033, 040 |
| **4. Successive cinema transitions** | Colour, optics and portable capture, and optical effects, each with a real new film-method consumer rather than a date-only unlock. | remaining following and later cinema entries |
| **5. Digital and modern** | A digital material, editorial, finishing and effects path with compute capacity, then selected modern capture and virtual systems. | CAT-006 compute variant, 034–039, 043–046 |
| **6. Separate connected systems** | Only when their owning systems are authorized. | CAT-049–058; supplier commercialization separately |

Inventory does not wait for sound. Office and capacity work needs no researcher. P13's one-laboratory sound checkpoint remains a first proof and delivers none of the multi-laboratory vision. Proving parallel research needs two useful briefs with real consumers, not an empty second queue.

Relative difficulty, not person-hours: inventory reuses existing owners but still needs identity and navigation proof; the office conversion is medium cross-system work; sound is the expensive one because it joins research, capture, Post, staffing, budget, queue and the filming lock; digital pipelines and virtual production are large and need new consumers authored; the P16+ and talent dependencies are separate major systems.

## 11. Genuine product decisions still open

Everything below needs a person, not another document.

1. **The scale.** Adopt S1, or set a different one. Until this is settled no price in either document should be treated as tuning.
2. **Whether the two inventor credits may stack.** §9.2 recommends they may not. This single choice decides whether developing early is a premium strategy or a free one.
3. **The Office III prerequisite.** §8.3 recommends removing it from both routes and gating the new build on availability, knowledge, ground and funds. The alternative keeps the obsolete-purchase chain for new builds.
4. **The Research Laboratory substrate.** Still the hard blocker that design §23 records. The whole of D2 waits on it.
5. **Which dependency-qualified consumers get authored first.** Set size classes decide CAT-011; a setup workload decides CAT-012 and CAT-025; Set turnover work decides CAT-013; a costume workload decides CAT-018; property identity decides CAT-017b; a planning-evidence owner decides CAT-044; a deliverable format decides CAT-039.
6. **Whether a hire route exists for scarce capabilities.** §6.7 recommends it for colour on the strength of twenty-nine cameras in seventeen years. It is a new acquisition route and needs an owner.
7. **Whether P1 briefs may fall below the Owner's band.** This catalogue says yes, with disclosure. The alternative is to author no precision-constrained briefs at all.
8. **Commercial-release milestones per entry.** The bands are recommended; the weeks need the calendar owner.
9. **Supplier commercialization placement.** P16+ remains the default. Current Ops recommends; the Owner approves any departure.

## 12. Evidence index

Research access date 2026-09-10, with the corrections of §3 applied. No game was launched, no private Unity code inspected, no game test run, no proprietary code recovered and no enjoyment proven. No screenshot of Project: Studio is claimed. Every source below keeps the proposal's stable ID and its locator, so each of §3's twelve re-verifications can be checked. Where a page could not be read it says so, and a page that could not be read is never counted as read.

### 12.1 Project sources

| Source | Locator | Read for | Outcome |
|---|---|---|---|
| Accepted TypeScript | [`7ae36b44`](https://github.com/HSpector1/The-Movies/blob/7ae36b44d99c505246d17dcc37beba94fa59a18a/src/core/tuning.ts) | The nine blueprints, the requirement mechanism, the capacity registry, the phase and capability table, the Set model | Read directly; every §2 figure comes from it |
| Accepted Unity | `3a9a3f488693aa14431a6aa412d7560df8f30a89` | — | Not inspected for this pass; no visual claim rests on it |
| Accepted P11 handoff and receipt | [`4caf7682`](https://github.com/HSpector1/The-Movies/blob/4caf7682b6c427b64f1ffab742f07cb4fddef2b0/docs/engineering/P11-TO-P12-PRODUCER-HANDOFF.md) | Quote, commit and refund symbols; the no-invented-reserved-cash law | Read directly |
| Planning parent | [`5230f3de`](https://github.com/HSpector1/The-Movies/tree/5230f3de685e643ee307264464b2d08d5730140b/docs/design) | The Owner-direction amendment this catalogue preserves | Read directly; no newer planning descendant existed when this branch was cut |
| Reviewed facility candidate | `7b03e9375c5dd9deed347a6b8300362893a55b61` | The parent of the planning parent | Read directly |

The running P12 implementation was neither inspected nor addressed. Final P13 engineering must still refresh against accepted P12, the eventual calendar owner and the employment interface.

### 12.2 Film industry

| ID | Source and locator | What it supports here | Retrieval outcome and confidence |
|---|---|---|---|
| I01 | Pinewood Group, Pinewood Studios: https://pinewoodgroup.com/pinewood-studios/ | Differentiated space types on one lot | Read directly. **SOURCE VERIFIED**, self-reported marketing, and the counts mix Pinewood, Shepperton and Pinewood Toronto, so no ratio may be drawn from them |
| I02 | ScreenSkills, Post-production job profiles: https://www.screenskills.com/job-profiles/browse/post-production/ | The proposal's three post-production role families | **Errored on every attempt, HTTP 403, never read.** Re-attempted for this pass with the same result. See §3 |
| I03 | ARRI, The History of ARRI in a Century of Cinema: https://www.arri.com/en/company/the-arri-philosophy/history/the-history-of-arri-in-a-century-of-cinema | The 1936 prototype and 1937 launch; the 1972 ARRIFLEX 35BL at roughly 33 dB still needing a lens blimp; the blimp-free 35BL 3 in 1980 | Read directly. **SOURCE VERIFIED**, manufacturer history, evidencing what ARRI shipped and never industry-wide adoption |
| I04 | George Eastman Museum, Three-Strip Camera: https://www.eastman.org/technicolor/technology/three-strip-camera | The 1932 introduction, and twenty-nine cameras built between 1933 and 1950 | Read through indexed text after a direct error. **PARTIALLY VERIFIED**; the scarcity figure is the strongest new finding of this pass |
| I05 | ASC Museum Minute, Technicolor Three-Strip Camera: https://theasc.com/video/asc-museum-minute-technicolor-three-strip/ | Illumination and process demands of three-strip | Retained from the proposal; supports the capture-plus-lighting-plus-finishing shape, no coefficients |
| I06 | Panavision, Celebrating 70 Years of Optical Innovation: https://www.panavision.com/highlights/highlights-detail/celebrating-70-years-of-optical-innovation | Older optical series remaining in the rental inventory | **The cited page errored.** The quotation reached this pass only through a trade reproduction that cannot be cited here, so it is treated as **NOT VERIFIED FROM A CITABLE LOCATOR**. Nothing in the catalogue rests on it: the design consequence rests on the Owner's direction, not on this source |
| I08 | Industrial Light & Magic, StageCraft: https://www.ilm.com/stagecraft/ | That a virtual-production stage is more than LED panels | Read directly. **PARTIALLY VERIFIED**; hardware and capture components are named, the software layer was not itemized |
| I11 | Museum of the Moving Image, Three-Strip Technicolor Camera: https://movingimage.org/collections/descriptions-for-gallery-objects/three-strip-technicolor-camera/ | The multi-strip era, and the absence of a monopack claim | Read directly. Neither this page nor I04 mentions monopack or a single-strip era, which is why CAT-031's framing is authored extrapolation |

Sources I07, I09, I10 and I12 in the proposal support entries this catalogue did not need to re-verify; they keep their IDs and locators there and are not re-stated as verified here.

**One claim lost its source.** The proposal's post-production split rested on I02, which cannot be read. A substitute page consulted during this pass could not be re-identified with a citable locator, so it is withdrawn rather than cited anonymously, and the three-role-family claim returns to **NOT VERIFIED**. CAT-035 and CAT-039 stand on their own merits and never rested on it.

### 12.3 Comparators

| ID | Source and locator | What it supports here | Retrieval outcome and confidence |
|---|---|---|---|
| G03 | Hollywood Animal, official Steam announcements: https://steamcommunity.com/games/2680550/announcements/detail/688638619235125213 | Cancelling technology work as a first-class action | Verified through the official news API; the rendered pages returned navigation chrome and **dates could not be confirmed**. The exact wording is quoted in §3 |
| G04 | Moviehouse, pinned beginner guide: https://steamcommunity.com/app/1576280/discussions/0/3820782448887392086/ | Preparatory work opening creative choices | Read directly. **Attribution corrected:** it is a pinned forum topic and the page does not confirm developer authorship, so the proposal's "publisher-branded guide" overstates it |
| G05 | Blockbuster Inc. developer page: https://www.indiedb.com/games/blockbuster-inc | Build, decorate and Set creation | Read directly. **Claim reduced:** "clone" and "expand" are not supported by the source and "freeform" is an interpretation |
| G06 | Cities: Skylines II, city services and upgrades: https://www.paradoxinteractive.com/games/cities-skylines-ii/features/city-services-districts-policies | Separating retrofit, extension and new build | Read directly. **Pre-release developer intent, not shipped behavior** |
| G09 | Frontier, Building Your Zoo: https://www.planetzoogame.com/help-centre/player-guides/building-your-zoo | Seats, building capacity and staff as three separate facts | Reached only through an indexed rendering after a direct 403, with a conflicting community figure on centre capacity. **PARTIALLY VERIFIED** |
| G10 | Two Point Hospital, official product page: https://www.playstation.com/en-gr/games/two-point-hospital/ | Research, staff training and layout | Read directly. **Claim reduced:** equipment upgrades are folded into research rather than named separately, and physical expansion of an existing hospital is not described |

G01, G02, G07 and G08 in the proposal are retained at their locators and were not re-verified for this pass.

No source screenshots, manuals or proprietary assets are redistributed. A published description evidences a stated feature, never a hidden formula.
