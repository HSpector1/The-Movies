# P17 review — shared context for all agents (READ-ONLY TASK)

HARD RULES (apply to every agent):
- READ-ONLY research. NO repository edits, NO branch creation/checkout/switch, NO builds, NO test runs, NO runtime launches, NO player campaign/profile mutation. Do not `git checkout`, `git switch`, `git stash`, `npm`, `pnpm`, `node` against the repo. Do not touch anything under ~/Library or the player's campaigns/profile.
- Repository: /Users/bruce/The Movies (working tree is on an unrelated branch; do NOT rely on the working tree). Read files at the accepted P12 closeout commit with:
    git -C "/Users/bruce/The Movies" show 13370d428f0693f3279732f6f4cc360a7fcaa4df:<path>
  zsh GOTCHA: `$C:path` is mangled by zsh modifiers — always write `${C}:path` or the literal hash.
  Roadmap docs live on remote branch hspector-github/codex/p13-p15-long-range-research-01:
    git -C "/Users/bruce/The Movies" show hspector-github/codex/p13-p15-long-range-research-01:docs/design/CODEX-P13-P15-LONG-RANGE-ROADMAP.md
- Original-game evidence corpus (read-only): "/Users/bruce/Desktop/Big Swing Art/" — official manual PDF, Prima Official eGuide PDF, two GameFAQs guides, gamepressure guide, THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md (898k, community/AI-compiled synthesis: cite it as SECONDARY, verify against primary), THE-MOVIES-2005-SOURCE-REGISTER.md, THE-MOVIES-2005-ORIGINAL-DATA/*.csv|json, THE-MOVIES-2005-TECHNICAL-ARTIFACTS/*.csv.
  Plain-text extractions of the PDFs already exist at:
    /private/tmp/claude-501/-Users-bruce/3f469c9d-8c5a-4e57-b351-5828c7e97a45/scratchpad/corpus/*.txt
  (movies_manual_english.txt = OFFICIAL MANUAL; The_Movies_Prima_Official_eGuide.txt = DEVELOPER-REVIEWED PRIMA; the two GameFAQs txts = COMMUNITY; gamepressure = CONTEMPORARY PROFESSIONAL/COMMUNITY).
- Web research is allowed and expected (load WebSearch/WebFetch via ToolSearch "select:WebSearch,WebFetch"). Prefer official/developer sources first; use Reddit/Steam/community for PLAYER-EXPERIENCE criticism and treat community mechanic descriptions cautiously.
- Write your full findings to the output file you are given (under the scratchpad p17/ folder), then return the structured summary. The report writer will read your file.

SOURCE DISCIPLINE (mandatory for every major claim):
  source; exact locator (file:line, page, URL, section); what it proves; confidence HIGH/MEDIUM/LOW; and a source-tier label from:
  SHIPPED RETAIL | OFFICIAL MANUAL | DEVELOPER-REVIEWED PRIMA | CONTEMPORARY PROFESSIONAL SOURCE | PRE-RELEASE PROMISE | COMMUNITY INFERENCE | DEVELOPER/OFFICIAL (for comparators) | OBSERVED HISTORY (for real franchises) | DESIGN INFERENCE.
  Never promote pre-release claims to parity with shipped retail. Separate observed historical pattern from game-design inference.

OWNER-SELECTED P17 DIRECTION (do NOT reopen these; stress-test and correct minimally only where a serious structural problem exists):
  A. Continuation types: DIRECT SEQUEL, PREQUEL, FILM SPIN-OFF, REMAKE, REBOOT (TV/cross-media spin-offs = P18). Don't collapse all into "Sequel".
  B. Successful properties start with an audience: inherited recognition/awareness/marketing leverage/fan attention BUT higher expectations and bigger reputational downside. No automatic sequel quality bonus.
  C. Three separate factors, NOT one FranchiseScore: RECOGNITION (slow, durable), MOMENTUM (fast, decays to neutral), FATIGUE/OVEREXPOSURE (repeated mediocre output raises it faster than repeated excellent output). Good releases add excitement; failures reduce it; timing alone is not bad; no "wait one year" rule; a huge recent hit may make a FAST follow-up MORE attractive.
  D. No hard sequel cooldown. Bounded continuous model: recent positive Momentum rewards timely exploitation; mediocre similar oversupply raises Fatigue; market crowding stays P15; production capacity/opportunity cost is real.
  E. Flops may receive continuations if rights are controlled; legality never gated on commercial success; warn the player; bad bets allowed.
  F. Talent continuity matters by FRANCHISE IMPORTANCE of the association (iconic lead, major supporting, recurring antagonist, signature director, major recurring creative), not a generic same-cast bonus. Recasting lawful. P14 = person/contract/relationship authority; P17 consumes public franchise-role association + continuity history. Prevent mandatory cast lock-in, tiny-role oversized effects, unavoidable escalating salary demands.
  G. Early continuation greenlight before predecessor release once predecessor sufficiently committed; intentionally risky; no hidden future reception info; rivals make equivalent bets.
  H. Type-specific timing: sequels/prequels/spin-offs no arbitrary wait; remakes face redundancy/comparison pressure if very recent, dormancy/nostalgia helps, no 20-year lock; reboots restart continuity, keep StoryProperty recognition, useful when continuity stale/damaged/dormant/confusing.
  I. Remake vs Reboot are DISTINCT (approved). Remake retells a specific earlier film (direct comparison matters). Reboot restarts continuity from same StoryProperty as a new bounded branch. Avoid continuity-law complexity with little gameplay value.
  J. Spin-offs use bounded named SubProperties (character/organization-team/location/major concept) referencing a parent StoryProperty; P18 may reuse. Not every fictional noun is IP.
  K. Rivals obey the same franchise/rights law; compact rival decision-making; outcome legality not player-only.
  L. Rights may transfer mid-franchise under P16; historical films stay attributed to original studio; current rights owner controls future continuations; no historical rewrite.
  M. Lightweight persistent Franchise identity/object (FranchiseId, StoryPropertyId, installments, branches, SubProperties, current rights owner ref, Recognition, Momentum, Fatigue, recent activity, key recurring talent associations, milestones). Not a second production-management system.
  N. Bounded branching: main continuity, reboot continuity, small number of spin-off branches. No spaghetti graphs.
  O. Crossovers = LATER P17 scope (Marvel-style attractive). Not a first-checkpoint dependency.
  P. Franchises never permanently unusable: ACTIVE / COOLING / DORMANT / REVIVAL CANDIDATE / ACTIVE AGAIN. Rights still govern legality.
  Q. Historical weighting: recent performance matters strongly; older defining hits retain long-term Recognition; no full lifetime average.
  R. Economics/talent consequences are INDIRECT (budget approval willingness, financing confidence, expected revenue, talent interest/salary expectations, marketing efficiency, expectations). P17 mints no cash and changes no salary. P11 finance, P14 people/contracts, P15 market.
  S. No manual "Kill Franchise" button; dormancy by inactivity; P16 may sell rights.
  T. Optional acting slots expand over eras (early: Lead/Antagonist/Support; later: Additional Principal; later: Additional Principal 2; later: Featured/Cameo). Not approved dates. A two-character drama must remain legal in 1995. More slots = capacity, not requirement.
  U. Cameo vs principal role classes (PRINCIPAL/SUPPORTING/FEATURED/CAMEO) to be researched; fame ≠ acting skill; famous non-actors (musicians, athletes, TV personalities) can cameo for publicity/attention value; prevent cameo spam.

PACKAGE OWNERSHIP: P07 film reception/outcome; P11 money/budget/forecast; P13 era/technology/production capability; P14 people/contracts/relationships/Fame; P15 shared market/release competition; P16 StoryProperty/rights/ownership/transfers/licensing; P17 franchise/continuation state (recognition, momentum, fatigue, branches, expectations, franchise history interpretation); P18 television/streaming/cross-media. P17 must NEVER invent rights because a movie exists. No duplicate formulas across packages.

PROJECT: STUDIO ARCHITECTURE FACTS ALREADY ESTABLISHED (verify locators if you cite them):
- src/core/types.ts:19  `CastSlot = 'lead' | 'antagonist' | 'support'` (exactly three principal acting seats); FilmConcept.requiredSlots: CastSlot[] (types.ts:161) — worldgen.ts:614 and screenplay.ts:194 always set all three.
- src/core/tuning.ts:1657 `CAST_WEIGHT = { lead: 1.0, antagonist: 0.6, support: 0.35 }`.
- Talent.fame = 0..100 STAR POWER separate from skills/OVR (types.ts:114); CreativeRole = writer|director|actor|craft (types.ts:18).
- reception.ts:493-507 starDraw = 100·clamp(Σ CAST_WEIGHT·fame/100 / Σ CAST_WEIGHT); fame Hill-saturated on OPENING reach when engaged; starDraw enters segment appeal at 0.25 weight (reception.ts:520,533).
- standing.ts:62-78 starAttention = mean of the three cast fames → secondary audienceAwareness contributor; Standing = audienceAwareness / industryPrestige / commercialConfidence (P08 owns).
- FilmResult (types.ts:241-275) is permanent with conceptId, directorId, immutable participants (FilmParticipants writer/director/cast/craft), locked forecast.
- P12 rivals: bounded seeded policy weights (register SIM-009) including future "franchise" choices as dormant dimension.
- Future consumer contract §15 (docs/engineering/P11-TO-P12-AND-P12-FUTURE-CONSUMER-CONTRACT.md:348-405) and register rows INT-011/INT-012/INT-013/SAF-009/HIS-014 define P16/P17/P18 boundaries: P17 keyed to exact P16 StoryProperty ID; may not infer StoryProperty from title/genre/cast/release order/studio/concept/presentation; contract §15 already lists "franchise trust, heat, fatigue, identity, reach" and "legacy sequels" and "Story DNA" as P17-owned vocabulary.
- Persistence: protocol 4 / projection 29 / inner Save V19; Save p95 9.58s large-world — save/projection size is a real constraint.
