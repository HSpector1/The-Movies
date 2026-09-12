# PROJECT: STUDIO — P16 TARGETED INDEPENDENT RESEARCH
# STUDIO EMPIRE, LIBRARY & OWNERSHIP

READ-ONLY RESEARCH AND ANALYSIS ONLY.
NO GAMEPLAY IMPLEMENTATION. NO REPOSITORY EDITS. NO BRANCH CREATION. NO RUNTIME TESTING.
NO PRIVATE CAMPAIGN/PROFILE MUTATION.

You are an independent second reviewer for Future Ops. The Owner has selected a substantial
successor-design direction for P16. Your job is NOT to reopen settled choices merely because
another game or the real industry works differently.

Your job is to:
1. reconstruct what the original The Movies actually supported;
2. research strong management/tycoon comparators;
3. research simplified real film-industry ownership/M&A patterns;
4. inspect Project: Studio's current architecture read-only;
5. determine clean package boundaries;
6. identify structural problems, exploits or missing decisions;
7. recommend simple, legible rules.

## 1. PROJECT CONTEXT / AUTHORITIES
Repository: HSpector1/The-Movies. Read the current Project: Studio long-range planning relevant to:
P15 Corporate Hollywood / Shared Market / Studio Legacy; P13–P15 roadmap; P12 accepted producer
handoff; P13 technology ownership; P14 contracts/employer/career planning; P11 finance; P09
facilities; future P16→P17→P18 ownership / franchise / cross-media boundary.
At minimum: docs/design/CODEX-P13-P15-LONG-RANGE-ROADMAP.md; docs/design/CODEX-P13-P15-OWNER-RULINGS.md;
docs/design/CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15.md;
docs/design/CODEX-CORPORATE-HOLLYWOOD-MARKET-LEGACY-PACKAGE-15-BUILDER-ANNEX.md.
Accepted P12 closeout: 13370d428f0693f3279732f6f4cc360a7fcaa4df; docs/engineering/P12-TO-P13-PRODUCER-HANDOFF.md.
Search for any existing P16 / StoryProperty / rights / library / acquisition / ownership / franchise /
sequel / remake planning before assuming none exists. Do not depend on mutable P13/P14/P15 work.
Distinguish: CURRENT/ACCEPTED CODE; APPROVED DOCUMENTATION; OWNER-SELECTED NEW DIRECTION; FUTURE RECOMMENDATION.

## 2. OWNER-SELECTED P16 DIRECTION (treat as selected unless marked as a research question)

### A. STORY PROPERTY
A released film and its underlying STORY PROPERTY are distinct authoritative subjects. The Story
Property is the durable IP that can later support: sequels; remakes; spinoffs; future television/
cross-media under P18; licensing; sale/transfer. P17 should consume P16 StoryProperty/rights truth
rather than invent sequel or franchise ownership. For studio-created original material, the studio
will normally own the Story Property. Externally sourced material may require purchase or license.
Research the minimum useful StoryProperty/right structure. Avoid unnecessary legal granularity.

### B. RIGHTS GRANULARITY
Rights should be divisible enough to create meaningful buying/licensing decisions but NOT so granular
that rights management becomes clerical work. Investigate a simple initial model. Potential
distinctions: underlying Story Property ownership; film/library ownership; sequel/remake/spinoff
exploitation authority; television/cross-media rights later; time-limited license; exclusive/
nonexclusive rights where genuinely useful. Recommend the smallest useful rights bundle. Do not
create dozens of territory/media sublicenses merely because real law can.

### C. LIBRARY VALUE
Old films and Story Properties retain economic/strategic value. They may contribute to: studio
valuation; M&A; future sequels/remakes; licensing; prestige/history; future distribution/media
systems. Do not invent perpetual weekly library cash before an owning distribution/media system
actually exists. Separate historical value from current cash flow.

### D. INDIVIDUAL RIGHTS / ASSET SALES
The Owner wants the ability to buy and sell individual Story Properties, film/library rights and
appropriate corporate assets. Research: what makes such sales strategically interesting; what
should be permanent; what may be licensed rather than sold; how to preserve historical creator/
producer identity. Ownership transfer NEVER rewrites who originally created/released the film.

### E. ACQUISITION OPERATING MODEL
The Owner DOES NOT want to manage multiple independent studio operations. Research these models:
MODEL A — FULL ABSORPTION: target operating studio closes into buyer; assets/rights/people/projects
transfer lawfully; one studio remains operationally managed.
MODEL B — AUTONOMOUS SUBSIDIARY: target remains independently operated under buyer ownership.
Research but expect this to conflict with Owner preference.
MODEL C — ABSORB OPERATIONS / RETAIN BRAND AS LABEL: target ceases independent operations; buyer
manages one company; acquired brand may survive as a production label.
MODEL D — OWNER CHOICE: at acquisition choose Absorb Completely, or Absorb Operations + Retain Brand
as Label. Current Future Ops recommendation is MODEL D.
Evaluate: player comprehension; historical identity; management burden; gameplay value; AI/rival
compatibility; save/performance complexity. Labels should not become a second separately managed
studio unless Owner later changes direction.

### F. ACQUISITION TRANSFER BUNDLE
Research exactly what should transfer in a WHOLE-COMPANY ACQUISITION. Candidate categories: CASH;
DEBT/LIABILITIES; EMPLOYEE CONTRACTS; ACTIVE PRODUCTIONS; STORY PROPERTIES; FILM/LIBRARY RIGHTS;
EQUIPMENT; LAND; BUILDINGS/FACILITIES; TECHNOLOGY/RESEARCH; BRAND/LABEL; OTHER CONTRACTUAL OBLIGATIONS.
Core principles already selected: PersonId does not change; historical StudioId does not disappear
or get rewritten; original film creator/producer remains historical truth; Story Property/right
ownership may transfer prospectively; completed research/knowledge should be inheritable; physical
upgrades do NOT teleport to the buyer's lot.
Particularly answer: 1) Does acquired cash become buyer cash? 2) Does debt transfer? 3) Do employee
contracts transfer intact? 4) Can player release inherited staff afterward under ordinary termination
law? 5) What happens to active movies? 6) What happens to target facilities if Project: Studio
supports only one actively managed lot? 7) What exactly does acquired research grant? 8) What
happens when target has a higher physical facility upgrade than buyer?
Current design direction for research: KNOWLEDGE TRANSFERS. PHYSICAL INSTALLATIONS DO NOT MAGICALLY
APPEAR. If target knows Technology III and buyer knows Technology II, buyer should gain the verified
knowledge/eligibility for III. Buyer must still lawfully install/build/convert physical providers
unless actual transferable equipment satisfies part of that work. Test this principle.

### G. PHYSICAL PROPERTY AFTER ACQUISITION
The Owner does not want multiple playable studio lots. Alternatives for target real estate/buildings:
1) automatic liquidation at closing; 2) player chooses sell/liquidate selected assets; 3) remote
corporate property exists only as a financial asset; 4) transferable equipment can be removed/sold/
reused; 5) future remote-lot system, but not required now. Recommend one that does not create
another lot-management game. Buildings cannot teleport to the player's current lot.

### H. ACTIVE PRODUCTIONS
The Owner likes the idea that buying a studio may mean inheriting actual films in progress. Research
how best to handle: development projects; scripts; casting; shooting; post-production; committed
release schedules. Determine whether: 1) active projects transfer and finish under the buyer;
2) buyer chooses which to continue/cancel; 3) projects remain temporarily under an acquisition-
transition owner; 4) bankruptcy auctions handle projects differently from healthy acquisition.
Maintain exact production IDs/history. No duplicate film/project identity.

### I. CORPORATE HISTORY
Acquired or bankrupt studios remain permanently searchable. Examples: STUDIO BANKRUPTCY — RKO
Pictures — Closed: 1963 Week X. ACQUISITION — Warner Brothers — Acquired by Spector Pictures: 1987
Week X. MERGER/ABSORPTION — United Artists — Independent operations ended: 1995 Week X — Successor
owner: Spector Pictures. Do NOT rewrite prior films/employees as if buyer employed/created them
historically. Research the cleanest identity/status relation.

### J. RIVAL M&A
Rivals may eventually acquire other studios under the same transaction law. No player-only M&A
superpower. Different strategies are allowed; different legality is not. Research AI/rival
implications: valuation; affordability; anti-snowball; frequency; when an AI should bid; preventing
every healthy rival from immediately consolidating.

### K. SELLING PLAYER ASSETS
The Owner wants asset sales. Sellable categories: Story Properties; film/library rights; equipment;
land/real estate; acquired brands/labels; possibly technology/license rights where upstream
ownership permits. Asset sales may become a recovery mechanism before bankruptcy. Recommend
restrictions that prevent: repeated flip exploits; selling an asset while simultaneously using it
without retained rights; duplicate ownership.

### L. HEALTHY-STUDIO ACQUISITION
Healthy studios ARE potentially purchasable but require a major premium. Research a simple
willingness/price model. Do not use "cross a hidden fixed multiplier and ownership automatically
transfers." A healthy studio should be allowed to reject an offer. Price may influence willingness
strongly. Potential factors: enterprise valuation; control premium; strategic value; recent
performance; independence preference; financial outlook; existing ownership situation. Recommend
what should be visible to the player. Avoid an opaque bargaining simulator.

### M. DISTRESSED / BANKRUPT ACQUISITION
P15 may decide that a rival becomes bankrupt and its assets enter auction. P16 should likely own
actual acquisition/ownership transfer. Alternatives: 1) ASSET AUCTION — buy selected assets
individually; 2) WHOLE-STUDIO AUCTION — buy the entity; 3) CLEAN ASSET PURCHASE — creditors settle
old debt; buyer acquires chosen assets without liabilities; 4) ASSUMPTION PURCHASE — lower price but
buyer assumes specified liabilities/contracts; 5) HYBRID — whole-company or asset lots depending on
bankruptcy state. Determine which is easiest to understand; most fun; most strategically deep; least
likely to create legal/accounting simulation overload.

### N. BOOK NET WORTH VS VALUATION VS TRANSACTION PRICE (HIGH PRIORITY)
Do NOT collapse these into one number. BOOK NET WORTH = accounting assets − accounting liabilities.
STUDIO/ENTERPRISE VALUATION = plausible value of the operating business. TRANSACTION PRICE = what
buyer actually pays. AUCTION PRICE = clearing bid in a distressed sale. Research simple game-
appropriate valuation principles. Potential inputs: book net worth; cash; debt; profitability;
recent revenue; film-library value; Story Properties; technology; brand; current contracts/talent;
active productions. Be careful with double counting. Recommend a transparent structure. Question:
should healthy acquisition begin from enterprise valuation + control premium, while bankruptcy
auction price emerges from bids around liquidation/strategic value? Current Future Ops view:
probably yes. Verify.

### O. HEALTHY ACQUISITION PREMIUM
Healthy studios are expensive because they are not eager to sell. Research real-world and comparator
control-premium patterns only to establish game design principles. DO NOT import real finance
formulas literally. Determine: whether control premium should scale with studio success; whether
strategic assets increase willingness price; whether repeated rejected bids have consequences;
whether a target can simply refuse regardless of price; how much information player should receive.

### P. REAL-WORLD FILM/ENTERTAINMENT M&A CASE STUDIES
Small number of high-value real examples: Disney/Pixar; Disney/Marvel; Disney/Lucasfilm; Amazon/MGM;
other highly relevant acquisitions. Investigate: why buyer wanted target; role of IP/library/brand/
talent; whether target brand remained; whether operations were absorbed or retained; strategic
success/failure risks; what is transferable into a FUN management-game principle. Do not turn
Project: Studio into an SEC simulator. Also examine at least one distressed/bankruptcy entertainment
asset sale if a good well-sourced example exists.

### Q. ORIGINAL THE MOVIES
Independently determine what the retail original actually had concerning: film ownership/library;
scripts; selling scripts; selling Stars; sequel/franchise ownership; remakes; licensing; studio
acquisitions; mergers; rival purchases; bankrupt asset sales; corporate labels/subsidiaries.
Distinguish: SHIPPED RETAIL; PRIMA/MANUAL; CONTEMPORARY PROFESSIONAL; PRE-RELEASE CLAIM; COMMUNITY
MEMORY. Prior Project: Studio research believes acquisition was discussed pre-release but NOT
verified as shipped retail functionality. Verify rather than assume.

### R. MANAGEMENT/TYCOON COMPARATORS
Prioritize: Software Inc.; GearCity; Capitalism Lab; Hollywood Animal; Mad Games Tycoon / Mad Games
Tycoon 2; Game Dev Tycoon; any strong entertainment/studio-management comparator. Look for:
acquiring competitors; subsidiaries; brands; asset sales; company valuations; bankruptcy auctions;
IP/product ownership; licensing; anti-snowball systems. For every useful comparator: mechanic;
player decision created; what players like; what becomes tedious; how AI uses it; snowball risks;
Project: Studio lesson. Use official/developer sources first. Use Reddit primarily for player-
experience criticism.

### S. ANTI-SNOWBALL ANALYSIS
Acquisitions can easily make the richest studio permanently unbeatable. Analyze safeguards that feel
natural rather than arbitrary. Levers: healthy-company control premium; debt needed to finance
deals; integration costs; inherited contracts; inherited debt; temporary integration friction;
physical facility limitations; opportunity cost; diminishing strategic value; rivals bidding at
auction; competing bids; regulatory/antitrust only if absolutely necessary later. Do NOT
automatically recommend artificial M&A caps. Find the minimum necessary protections.

### T. PACKAGE BOUNDARY
Recommend exact ownership among: P11 finance/payment/debt/ledger; P12 immutable StudioId/studio
status/registry; P13 technology/research truth; P14 PersonId/contract/employment transition; P15
distress/bankruptcy eligibility and auction trigger; P16 StoryProperty, rights, ownership and
acquisition transaction; P17 sequels/remakes/franchises; P18 television/cross-media. Evaluate
whether P16 should be: P16A — Library, Story Properties & Rights; P16B — Rights & Asset
Transactions; P16C — Studio Acquisition & Integration. Current Future Ops recommendation is YES.
Identify anything that should instead become P16D or P17/P18. Co-productions are currently NOT
selected. Do not put them back in without compelling evidence.

## 3. PAPER SCENARIOS (small reproducible paper analyses; all numbers are paper hypotheses)
A — BANKRUPT SMALL STUDIO: weak cash; modest Story Property portfolio; several employees; no valuable
technology. Compare asset liquidation vs whole-company purchase.
B — VALUABLE DISTRESSED STUDIO: heavy debt; valuable library; excellent research; several active
productions. Show why book net worth, enterprise value and auction price differ.
C — HEALTHY RIVAL: profitable; strong brand; valuable properties; does not want to sell. Estimate
conceptually how a control premium should function.
D — TECHNOLOGY TARGET: player buys studio primarily for research the player lacks. Verify knowledge
transfer without magical facility upgrades.
E — SERIAL ACQUIRER: player buys three studios in ten years. Identify snowball/exploit problems.
F — RIVAL ACQUIRES RIVAL: ensure player/rival symmetry and history preservation.

## 4. REQUIRED DELIVERABLE — ONE research report with:
1 Executive findings (15–25); 2 Original The Movies ownership/M&A reconstruction; 3 StoryProperty
and minimal-rights recommendation; 4 Film-library/value recommendation; 5 Acquisition operating-
model comparison; 6 Exact acquisition transfer bundle; 7 Physical-property treatment; 8 Active-
production treatment; 9 Historical identity/status model; 10 Rival M&A; 11 Asset sales; 12 Healthy-
studio acquisition; 13 Bankruptcy auction/acquisition; 14 Book Net Worth vs Enterprise Valuation vs
Transaction/Auction Price; 15 Real-world entertainment M&A lessons; 16 Tycoon comparator lessons;
17 Anti-snowball recommendations; 18 Package-boundary recommendation; 19 Corrections to prior
Project: Studio assumptions; 20 Genuine remaining Owner decisions ONLY; 21 Remaining uncertainties.
End with table: | Topic | Original evidence | Comparator / real-world lesson | Owner direction |
Recommended Project: Studio rule | Remaining decision |

SOURCE DISCIPLINE: for material claims identify source; exact locator where possible; what it
proves; confidence HIGH/MEDIUM/LOW; whether prior Project: Studio prose is CONFIRMED / QUALIFIED /
CORRECTED / SUPERSEDED BY OWNER DIRECTION. Do not make repository edits. Do not implement anything.
Do not reopen settled Owner decisions just because another system chose differently. If a selected
rule creates a severe structural problem, explain the exact problem and recommend the smallest
correction. Stop after the report.
