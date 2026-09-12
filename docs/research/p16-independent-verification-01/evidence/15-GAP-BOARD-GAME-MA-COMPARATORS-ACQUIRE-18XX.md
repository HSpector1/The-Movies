# Dossier 15 — Gap Comparator: Board-Game Corporate M&A Mechanics (Acquire, 18xx/1830)

## 1. Scope

Follow-up gap task (gap 5 of the P16 research program): no prior dossier examined a board
game. This dossier researches two well-documented board games built around company
mergers/failure — Sid Sackson's **Acquire** (1962/1964, current edition Renegade Game
Studios 2023) and the **18xx** family, using **1830** as the named reference — and then
compares their mechanics against two specific prior sections: dossier09 §4.2–4.3
(healthy transaction price and auction price) and dossier07 §4 "Synthesis A" (willingness-
to-sell presentation patterns). This is **comparator evidence only**. It does not propose
implementation, does not reopen any Owner-selected P16 direction, and does not touch the
repository, the game, or any campaign data. All Movies/Project Studio material referenced
here is read from the already-produced dossiers, not re-derived from the repo.

Confirmed before starting: `grep -rniE "acquire|18xx|board.?game|sackson|avalon hill"` across
all ten existing dossiers (00–10) returns no hit outside the word "acquisition/acquired" —
this comparator class is genuinely untouched, matching the gap statement.

## 2. Method & sources consulted (with what failed)

**Skim of prior work (required before starting):**
- `dossiers/00-KEY-FINDINGS.md` (index) and `dossiers/09-valuation-finance.md` §3.1 (F1–F13),
  §4.2–4.3 (the exact sections named in the task) — read in full.
- `dossiers/07-comparators-C.md` §4 "Synthesis A" and §3B (Railway Empire, cited by the task
  as the existing 18xx-descendant comparator) — read in full.
- `dossiers/02-authority-corporate.md` (P15 corporate-fate graph `active → warning → distress
  → recovery → active / ↘ dormant → recovery`, and the "no forced sales or acquisition implied"
  ruling) — grepped for the exact P15 ladder text so this dossier does not misstate it.

**Acquire (primary source):**
- Official rulebook, Renegade Game Studios, *Acquire* (design: Sid Sackson), PDF at
  `https://renegadegamestudios.com/content/File%20Storage%20for%20site/Rulebooks/Acquire/Acquire_RGS_Rulebook_WEB.pdf`
  (found via the product page's "Download the rulebook here" link, confirmed official-publisher
  host). WebFetch could not OCR the raw PDF stream ("binary PDF file stream... not readable
  text"); the tool nonetheless saved the binary locally. Recovered as text with local
  `pdftotext -layout` (Homebrew poppler) — this is a mechanical extraction of the exact
  official PDF, not a paraphrase. 16 pages; printed page numbers 6–9 and 12 cited below.
- Design-history secondary source with quoted primary diary/letter material: John/Dale
  Sackson-Friedman family-run `acquisitiongames.com`, "The Origin of the Game of ACQUIRE"
  (`https://www.acquisitiongames.com/index.php/history-of-acquire/the-origin-of-acquire?showall=1`)
  — quotes Sid Sackson's 1964 diary and 3M developer Bill Caruson's letters directly.
- `opinionatedgamers.com`, "How Acquire Became Acquire" — fetched, contained no rules-rationale
  language beyond what acquisitiongames.com already gave; not separately cited.
- `meeplemountain.com/reviews/acquire/` — reviewer commentary (labelled REVIEW, not COMMUNITY).
- BoardGameGeek (`boardgamegeek.com`) — every direct WebFetch of a BGG thread or the BGG XML
  API returned **HTTP 403 Forbidden** (thread pages) or "Unauthorized" (XML API), for both the
  Acquire and 1830 forums. Per the hard rule, one alternate route was tried for each (the BGG
  XML API for 1830; a retry with a different thread for Acquire) — both also failed. The only
  remaining evidence is the search tool's own paraphrase of thread titles/content, which is
  **not a verbatim quote**; anything drawn from it below is explicitly marked
  LOW/UNVERIFIED-VERBATIM.

**18xx / 1830 (primary source):**
- The publisher-named PDF (`fgbradleys.com/.../1830%20Railways%20and%20Robber%20Barons%20-%20rules.pdf`)
  returned HTTP 403 Forbidden to both WebFetch and a direct `curl` with a browser user-agent.
  `web.archive.org` is explicitly disallowed for this tool. **Alternate source used** (per the
  task's own permitted alternates): a full current 1830 rulebook PDF hosted at
  `https://www.lookout-spiele.de/upload/en_1830re.html_Rules_1830-RE_EN.pdf`, copyright line
  "© 2018 Lookout Spiele, Inc. & Francis Tresham. '1830' and the '18XX Plate' mark are
  trademark properties of Francis Tresham," title page "Designed by Francis Tresham,
  Developed by Bruce Shelley et al." — same design/development credit as the Mayfair/Renegade
  "Railways & Robber Barons" line named in the brief. WebFetch again could not read the raw
  PDF stream; recovered with local `pdftotext -layout` (28 pages; section/page numbers cited
  below). **This edition's ruleset is independently cross-confirmed** (see Finding 8) against
  the community-maintained comparison below, so the "which exact printing" question does not
  change any conclusion in this dossier.
- **`fwtwr.com/18xx/rules_difference_list`** ("18xx Rules Difference List," maintained by
  Keith Thomasson, dated on-page "© Keith Thomasson November 9th 2024") — this is the
  "definitive-community 18xx rules reference" the task explicitly names as an acceptable
  alternate to a single rulebook; it is a section-by-section comparison of ~140 18xx titles'
  actual rule text, not a forum. WebFetch twice failed with `ECONNRESET`; recovered by direct
  `curl` + a local HTML-strip (the page is plain HTML, not JS-rendered, so this is a faithful
  mechanical extraction of the same page WebFetch tried to load). Sections 9.4 ("what train
  may a company forced to buy one purchase") and 16 ("Miscellaneous Points," which is where
  the site's own per-game receivership definitions live) were pulled in full.
- `tckroleplaying.com/bg/1830/rules` — a community rules transcription, used only as an early
  cross-check; superseded by the two sources above and not separately cited for claims.

## 3. Findings

### Acquire

**F1. The majority/minority (and, in Tycoon Mode, tertiary) shareholder bonus is a single
public lookup table indexed by chain name and size — not a negotiated price.**
Source: Renegade Game Studios *Acquire* rulebook, p.8, "DISTRIBUTING STOCKHOLDER BONUSES":
"Each player reveals the exact number of stocks they own in the hotel chain that was
acquired. The players with the most, second-most, and third-most stocks are the primary,
secondary, and tertiary stockholders, respectively... The banker pays out bonuses from the
bank according to the stockholder info card." Rulebook p.6: "Stock in the hotel chain that
was acquired" triggers this on every merger, automatically, no dice, no offer/counter-offer.
Proves: Acquire resolves every company-absorption event with one deterministic, fully public
table read (row = chain size, columns = primary/secondary/tertiary bonus), with zero
negotiation. Confidence: HIGH (direct rulebook quote). Prior Project: Studio prose: **NEW**
(no dossier examines this comparator).

**F2. Explicit tie-break rule for the majority holder, and it costs the runner-up, not the
bank.** Source: rulebook p.8, "A TIE," Classic Mode: "If there is a tie for primary
shareholder, add the primary and secondary bonuses together, divide it evenly, and pay the
bonus (rounded up to the nearest hundred) to the tied players. **The secondary shareholder
gets no bonus.**" Tycoon Mode analogue on the same page cascades the same way one rank down.
Proves: Acquire's answer to "who wins a tie for control" is to fund the tie from the *next*
rank's bonus pool (self-financing), never from the bank — a distinct, simple, non-inflationary
tie-break shape. Confidence: HIGH. Prior prose: **NEW**.

**F3. The 2-for-1 conversion is one of three explicit, ordered options for a displaced
shareholder, and the fourth (implicit) option is "wait and hope."** Source: rulebook p.6,
"players with stock in the hotel chain that was acquired must do one or more of the
following... 1. Keep it in hand with the hope that a new hotel chain with the same name will
be founded later in the game. 2. Sell it back to the bank for the price indicated on the info
card... 3. Trade it in. For every two stocks from the acquired hotel chain, you get one stock
in the surviving chain." Order of operations: "Starting with the mergemaker and moving
clockwise" — the player who triggered the merger resolves first, others follow in seating
order (not stake size). Proves: the mechanic that P16 needs — "what happens to a stake in a
now-absorbed entity" — has a three-way, board-published answer in Acquire (cash out at a
published price / convert at a published ratio / hold latent) with an explicit turn-order
resolution rule. Confidence: HIGH. Prior prose: **NEW**; loosely validates dossier07's
inference #11 ("library value is strategic until a channel exists" — a latent, non-cash claim
that can be revived later) from an independent, older source.

**F4. The absorbed chain's headquarters marker is removed and returned to the general
supply; its *name* is not retired — it re-enters the pool of chains that can be founded
again.** Source: rulebook p.6: "Remove the headquarters building from the smaller hotel chain
and return it to the game tray. The smaller hotel chain has been acquired, and its building
tiles are now part of the larger chain." Combined with F3 option 1 ("hope that a new hotel
chain with the same name will be founded later"). Proves: Acquire's version of "does the
brand survive" is **full re-founding**, not a retained label on the surviving entity — the
name goes back into the same pool a brand-new company would be founded from. This is a
materially different shape from Owner Model C/D's "label survives as a production credit on
the absorbing studio." Confidence: HIGH. Prior prose: **NEW** — flagged below as a
non-transferable pattern, not a validation of Model C.

**F5. The rules-rationale for the 2-for-1 trade-in was NOT player legibility — it was
publisher production cost, and the designer himself considered a related mechanic
"illogical."** Source: `acquisitiongames.com`, "The Origin of the Game of ACQUIRE," quoting
3M developer Bill Caruson's Feb 21 1964 letter proposing the no-pre-distribution change that
led to the current founder's-bonus/purchase system: "I am proposing these changes... would be
to permit us to print the stock certificates on lighter weight material, since shuffling at
the beginning of the game would no longer be a factor... This is almost going to be a must if
we are able to produce the game profitably." The same source's synthesis states Sackson and
Caruson "both agreed that giving out stocks before companies are formed is illogical." Sid
Sackson's own March 1 1964 letter (quoted on the same page) analyzes the 2-for-1 trade's
knock-on effect on "the 'disadvantages of unlucky tiles.'" Confidence: MEDIUM (this is a
historical secondary account quoting primary diary/letter text, hosted by a site connected to
the Sackson family/estate rather than 3M/Hasbro/Renegade itself; treat the framing as
reported history, the quotes themselves as reliable). Prior prose: **NEW**. This is an
important caution, not a lesson to copy: Acquire's specific numeric parameters (the 2-for-1
ratio itself) were shaped by 1964 board-game print economics, not by a deliberate legibility
theory — the corpus should credit Acquire's *overall shape* (deterministic table, ordered
resolution, no hidden math) as battle-tested, but not treat its exact ratios as load-bearing
precedent.

**F6. Acquire has no seller agency of any kind — mergers are forced by board geometry, not
chosen or negotiated by an owner.** Source: rulebook pp.5–6 (Merging Hotel Chains): a merger
happens automatically the instant a placed building tile connects two chains; "If the hotel
chains are the same size, the mergemaker gets to decide which chain survives," but no player
ever *owns* a chain in a sense that lets them refuse a merger, name a price, or hold out.
Proves: structurally, Acquire answers a different design question than P16's healthy-
acquisition problem. P16 needs a *willing or unwilling seller who can refuse an offer at any
price* (Owner §L); Acquire has no such actor — there is no "target" that can say no, because
there is no owner of the chain distinct from its many shareholders, and the merger trigger is
purely geometric. Confidence: HIGH (direct rules reading). Prior prose: **N/A** — this is a
correction to the follow-up task's implicit premise that Acquire's payout formula is a
candidate *replacement* for dossier09's willingness/premium-band model; see §4 below.

**F7. Documented reviewer criticism: Classic Mode's two-payout limit makes turn order matter
a lot, and Tycoon Mode's fix for that is itself criticized as an ugly patch.** Source:
`meeplemountain.com/reviews/acquire/`: "In the Classic mode, only two players will get the
payout, making turn order a significant factor in one's success," and, of the Tycoon Mode
tertiary-bonus fix, "the solution goes as smoothly as amputating your arms for weight loss
purposes" [reviewer's own words]. Confidence: MEDIUM (single reviewer, not a forum poll;
labelled REVIEW not COMMUNITY). Prior prose: **NEW**. Design caution: extending a working
minimal formula by one more rank (2 payouts → 3) is exactly the kind of "add one more
band/rank" temptation dossier09's 5-row willingness table could face later, and a
professional reviewer of a 60-year-old, extremely well-tuned game still calls the extension
clumsy — an argument for keeping any such table as small as the current design already is,
not for enriching it.

### 18xx / 1830

**F8. The currently-in-print "1830" ruleset (Bruce Shelley-developed line, matching
"Railways & Robber Barons") has NO receivership mechanic. A company that cannot afford a
mandatory train forces its president to sell personal shares, and if that still fails, the
president goes personally bankrupt and the game ends immediately for everyone.** Source:
1830 rulebook (Lookout Spiele/Tresham ed. 2018, "Developed by Bruce Shelley et al."), p.23,
§6.6.3 "Forced Sales": "If together the railroad and its president do not have enough money
to buy a train, both the railroad and its president put aside all of their money. Then the
president must sell his shares and/or private companies until he raises enough additional
money..."; p.23–24, note: "If the president cannot raise enough money to buy a train, that
player is bankrupt **and the game ends immediately**." p.24, §6.7 "BANKRUPTCY" restates the
same trigger; §7.1 "END OF THE GAME DUE TO BANKRUPTCY": "An 1830 Classic game also ends when
a player goes bankrupt. No further actions may be taken by any player or railroad." Glossary,
p.26: "Bankruptcy: In 1830, bankruptcy occurs when a railroad is forced to purchase a train,
and the railroad money and its president's money (and sellable assets) is not enough to cover
the train's cost." **Independent cross-confirmation:** the fwtwr.com 18xx Rules Difference
List, §9.4, entry "1830 v3": "The cheapest train available in the bank, or a train from
another company at an agreed price not exceeding its face value" — with no receivership
clause, matching this rulebook exactly, and distinct from its own separately listed "1830 v2"
entry (F9). Confidence: HIGH (two independently-sourced primary/reference texts agree).
Prior Project: Studio prose: **N/A** (no prior P:S document makes a claim about 1830 to
confirm/correct). This **corrects the follow-up task's framing**: the specific, currently-sold
1830 rulebook does not contain the receivership mechanic the task asked about; receivership is
an 18xx-family innovation found in *other* titles/editions (F9–F10).

**F9. Formal "receivership" is fully defined for an earlier/alternate 1830 ruleset
("1830 v2") by the same reference, in exact operational detail.** Source: fwtwr.com 18xx
Rules Difference List, Section 16 ("Miscellaneous Points"), "1830 v2" entry (verbatim):
"If a company cannot buy the cheapest train in the bank or bank pool, the bank provides a
loan to cover the shortfall and the company goes into receivership. A company in receivership
is managed by the president. **The manager may not change while the company is in
receivership.** Dividends must be retained and used to pay off the loan, and the company's
train may not be sold. **The president may not sell shares in the company, although other
players may do so.** When the loan is repaid, the company comes out of receivership. If
another player has acquired more shares in the company than the previous president, they
become president at that point." Confidence: HIGH (direct verbatim quote from a named,
dated, long-maintained community reference explicitly permitted by the task as an alternate
to a single rulebook). Prior prose: **N/A** — new comparator. This is the single cleanest
statement of "receivership" found anywhere in this research: one hard financial trigger; an
automatic (not chosen) loan; the incumbent controller keeps day-to-day management but loses
every power that could let them dump or strip the asset (no share sales, no selling the
train); the outside market for the asset's stock stays fully open to everyone else; recovery
is automatic on debt repayment; control can pass to whoever has quietly accumulated more of
the entity, with no vote or negotiation.

**F10. The best-known, most heavily-played receivership implementation in the wider 18xx
family (1848) wires receivership into the game's own length, not just into one company's
fate.** Source: same reference, "1848" entry: "The Bank of England is a company that issues
loans and administers companies in receivership. The game end can be triggered when the fifth
company goes into receivership or when the Bank of England has issued 16 or more loans."
Confidence: HIGH. Prior prose: **N/A**. Shows receivership is not merely a "keep one company
alive" patch; in at least one canonical 18xx title it is itself treated as a leading indicator
of the whole game's approaching end — an economy-wide distress signal, not a private one.

**F11. Receivership's core mechanism — an automatic bank loan — is not portable into
Project: Studio's player-studio economy without reopening a settled Owner prohibition.**
Source: cross-referencing `dossiers/09-valuation-finance.md` F2, itself quoting
`OWNER-RULINGS-HOLLYWOOD-HORIZON.md:64-65`: "The prior prohibition (no financing, loans,
bailouts, restructuring, hard bankruptcy, failure ladder or arbitrary cash sink) remains in
force **for the player's studio** and is unchanged." Proves: the one piece of 18xx
receivership that is genuinely novel relative to what Project: Studio already does (F14) —
the bank-financed bridge loan — is exactly the kind of instrument the Owner has already
foreclosed for the player. Confidence: HIGH (direct quote of an existing, cited Owner
ruling). Prior prose: **CONFIRMED** — this dossier does not discover a new prohibition, it
shows that the one comparator mechanic most people would reach for first (the loan) is
already off the table by existing Owner direction, which the task's brief does not mention.

**F12. 1830's actual anti-hoarding lever is a forced train purchase plus a hard-ordered
forced discard when the train limit shrinks — there is no forced-merger mechanic in 1830
itself.** Source: rulebook p.22, §6.6.2 "Forced Train Purchases": "If a railroad with a legal
train route has no train at the end of its operating turn, it must immediately purchase a
train." §6.6.1 "Excess Trains": "Until a 4-train is purchased, a railroad may own a maximum
of four trains. When the first 4-train is purchased, that maximum number of trains is reduced
to three... If a railroad finds itself with an excess train, the president must choose a
train to discard. A discarded train goes to the Bank Pool and its railroad receives no
payment for it. If multiple railroads must discard at the same time, the trains are
discarded in order of the companies' share values — **with the highest valued railroad
deciding first**." Confidence: HIGH. Prior prose: **N/A**. The follow-up task's framing
("forced mergers/mandatory purchases as an anti-hoarding lever") conflates two different 18xx
tools; 1830 itself demonstrates only the mandatory-purchase/forced-discard half. Forced
mergers of companies (as opposed to forced train purchases) exist in some *other* 18xx titles
(e.g., minor-to-major absorption mechanics in later designs) but were not independently
verified for this dossier and are not claimed here — flagged as an open question below rather
than asserted.

**F13. The rulebook's own stated rationale for one piece of rigor is closing an exploit, not
simplifying arithmetic.** Source: rulebook p.23–24 sidebar note, adjacent to §6.6.3/§6.7:
"Requiring a full sequence of railroad operations after each opportunity to play the stock
market prevents a financial swindle that is too devastating even for 1830. As the rules now
disarm this ploy, you need not worry about it." Confidence: HIGH (direct quote). Prior prose:
**N/A**. This is the closest thing to a "designer/publisher's own rules-rationale" the current
1830 rulebook offers, and it is about exploit-closure, not legibility — a useful calibration
for how much "rationale" a rulebook of this vintage typically states explicitly (very little,
and what exists is about fairness under adversarial play, not teachability).

**F14. 1830's bankruptcy has no asset-disposal step at all — it simply ends the game, and
this is precisely the "instant multiplayer-ending failure" problem Project: Studio has
already, independently, ruled against for its own player.** Source: rulebook glossary p.26
(quoted in F8) plus §7.1; cross-referenced against `dossiers/02-authority-corporate.md:134`,
quoting P15 §12.3: "active → warning → distress → recovery → active / ↘ dormant → recovery,"
with "**PROJECT AUTHORITY VERIFIED:** P12 permits rival failure while protecting the player
campaign from mandatory hard-bankruptcy game-over." Confidence: HIGH. Prior prose:
**CONFIRMED** (not by 1830 itself, which is silent on Project: Studio, but the comparison
confirms the *reasoning* behind the existing P12/P15 direction): the same failure mode that
1830's base ruleset suffers from (a bankrupt player instantly stops the whole table's game)
is the failure mode 18xx receivership was later invented, in other titles, specifically to
avoid — and it is also the failure mode Project: Studio's own Owner ruling already avoids by
a different, already-selected mechanism (recoverable dormancy, not a loan). The comparator
does not change the P16/P15 direction; it independently corroborates why that direction was
right.

**F15. [LOW / UNVERIFIED-VERBATIM — COMMUNITY, search-paraphrase only, direct fetch failed]**
A BoardGameGeek thread titled "1830 bankruptcy rate" reportedly discusses an approximate
"60%," later "~61% for 5-player and 6-player games," rate of games ending via the immediate-
bankruptcy rule; a separate thread is titled "Beginners frustrated with sudden bankruptcy."
Every direct WebFetch of these threads and of the BGG XML API returned 403/Unauthorized (see
§2); this finding rests only on the search tool's own paraphrase of thread titles and
snippets, not a verified verbatim quote, and is reported here only as a directional signal
that the immediate-ending rule is a widely-discussed friction point for the base game — not
as evidence of any specific number. Confidence: LOW/UNVERIFIED. Prior prose: N/A.

## 4. Comparison to dossier09 §4.2–4.3 and dossier07 §4 (as requested)

**Does Acquire's majority/minority payout suggest a simpler alternative to Project: Studio's
proposed premium-band model (dossier09 §4.2, `ASK = SV × band(state)`)?**

No — because it answers a different question, and it is worth being precise about why (F6).
dossier09's model exists to resolve *whether a specific owner will sell their business to a
specific buyer at a specific price*, with the owner able to refuse regardless of price (Owner
§L). Acquire has no such owner: a merger is forced by tile geometry, and the "payout" (F1) is
compensation to *existing shareholders of the losing chain*, not a price paid by a buyer to a
seller — it is structurally closer to a real-world minority-shareholder squeeze-out formula
than to an acquisition offer. So Acquire cannot replace, simplify, or improve the willingness/
premium-band model itself; among every comparator gathered across this whole research
program, it is the *least* applicable to that specific question, because it is the only one
examined with zero seller agency.

What Acquire *does* strongly reinforce is a design property dossier09 and dossier07 already
committed to independently: a **fully public, deterministic, table-driven, no-dice** formula
(dossier09 §4.2: "published per state and per formula version, which is what 'not a hidden
fixed multiplier' requires"; dossier07 Synthesis A, pattern W2, "shown expected valuation +
named premium drivers"). Acquire has run that exact shape — a small public lookup table, read
aloud at the table, no hidden math — for over sixty years without needing revision to its core
formula (F1–F2), which is real, if narrow, evidence *for* keeping dossier09's five-row
willingness table small rather than enriching it, and *against* treating any comparator's
specific numeric ratios (Acquire's 2-for-1; any specific band multiplier) as load-bearing
wisdom, since Acquire's own numbers were shaped by 1964 production economics rather than
legibility theory (F5) and even a modest one-rank extension (Classic → Tycoon) draws
reviewer criticism for the edge cases it creates (F7). The one genuinely reusable pattern is
narrower than "premium model": Acquire's three-way resolution for a displaced minority stake
— cash out now at a published price, convert at a published ratio, or hold latent hoping the
name returns (F3–F4) — is a clean precedent for dossier09 §4.3's own "estate catalogue"
concept (unsold Story Properties remain purchasable later, never vanish), though the
"brand fully re-founds as a new instance" shape (F4) does not map onto Owner Model C/D's
"label survives as a credit on the absorbing studio" and should not be cited as validating it.

**Does 18xx receivership suggest a cleaner automatic distress-state operating policy than
P15's warning/distress/dormant ladder?**

Partially, and only as a refinement of what P15 already claims to do, not a replacement —
and only for a version of "1830" other than the one currently sold (F8–F10). Receivership's
actual shape (F9) is a genuinely clean automatic operating-state change: one hard, auditable
financial test (can the entity cover a specific mandatory obligation from its own means);
automatic entry with no player choice; the incumbent controller keeps running day-to-day
affairs but loses every self-dealing power (cannot sell the distressed entity's shares,
cannot sell its key asset) while the *outside* market for the entity keeps functioning
normally for everyone else; surplus is automatically redirected to recovery rather than paid
out; and exit plus any change of control is fully deterministic, with no vote and no
discretion. That shape is compatible with, and arguably a sharper articulation of, what
dossier07 already recommended for P16 independent of this dossier (design implication #1,
"willingness as a public typed stance... the stance itself, not a hidden multiplier, is what
price moves") and what P15 itself already claims for its `distress` rung. It does **not**
suggest touching the ladder's approved three/four-state shape (`warning → distress →
recovery/dormant`, per `dossiers/02-authority-corporate.md:134`) — this dossier's brief is
explicit that a comparator disagreeing with a shipped/approved shape is not grounds to reopen
it, and dossier07/09 already independently reached a compatible design.

Two things temper any stronger claim. First, receivership's central and most distinctive
tool — an automatic **bank loan** that bridges the shortfall so the entity can keep operating
— is precisely the instrument the Owner has already prohibited for the player's studio
("no financing, loans, bailouts... for the player's studio... unchanged," F11); so the part of
receivership that would most change the player's experience of "distress" cannot be adopted
without reopening a settled ruling, and this dossier does not recommend doing so. Second, the
comparator's real historical lesson is not "receivership is smarter than a ladder" — it is
that **an un-cushioned instant-failure rule is bad for a multiplayer game**, which is exactly
the lesson 1830's own base ruleset teaches by its absence of receivership (F14): a bankrupt
president ends the *entire table's* game immediately, a widely-discussed friction point for
new players (F15, low confidence on specifics). Project: Studio's Owner already independently
reached the same conclusion for the player campaign via a different, already-selected
mechanism (recoverable dormancy, not a loan) — so the comparator **confirms** the existing
P12/P15 direction rather than correcting it, and offers only the non-financial half of
receivership's toolkit (one hard trigger, frozen self-dealing, an open outside market, a
deterministic control handover) as evidence that *whichever* rung eventually carries such
restrictions can do so with a small, precise rule rather than a discretionary or narrative
one — an observation for whoever later specifies the interior of the `distress` rung, not a
proposal to change the rung structure itself.

## 5. Design implications for P16 (explicitly my inference — FUTURE RECOMMENDATION, not
approved scope)

1. Treat both comparators as *confirming* dossier09/dossier07's already-chosen shape (small
   public deterministic table; typed stance, not a hidden multiplier) rather than as sources
   of a new mechanic — this program's two strongest board-game precedents both point back at
   the same design already selected, which is itself useful confirmation.
2. If dossier09's "estate catalogue" for unsold Story Properties (§4.3 step 3) is ever
   detailed further, Acquire's "sell now at a published price, or hold and hope" framing
   (F3) is a clean off-the-shelf phrasing for the player-facing choice at that moment.
3. Do not cite Acquire's 2-for-1 ratio or exact tie-break arithmetic as evidence for any
   specific number in a P16 formula (F5, F7) — cite it only for the *shape* (public, small,
   deterministic).
4. Do not cite Acquire's "brand fully re-founds" behavior (F4) as supporting evidence for
   Owner Model C/D's "label survives as a credit line" — they are different claims about what
   a name means after absorption, and conflating them would misuse this comparator.
5. If and when the interior mechanics of P15's `distress` rung are specified, 18xx
   receivership's non-financial pattern (one hard trigger; frozen self-dealing; open outside
   market; automatic surplus redirection; deterministic control handover) is a precise,
   well-tested template to point to — with the explicit caveat that its financing half (the
   bank loan) is not available without a separate Owner ruling (F11), and that this is an
   observation for that future specification work, not a request to reopen the ladder now.

## 6. Open questions

1. Does any other 18xx title implement a genuine *forced merger of companies* (as opposed to
   a forced train purchase) as an anti-hoarding lever, the way the follow-up task's framing
   assumed? Not independently verified in this pass (F12) — the fwtwr.com comparison surfaces
   candidates (e.g., titles with "may need to be refinanced" or "companies may acquire other
   companies" language, such as 1862EA) but a focused read of one such title's actual rules
   text was out of scope for this dossier and would need its own pass if this specific
   question becomes load-bearing.
2. Which exact retail printing corresponds to "the current Renegade/Hasbro edition" of 1830
   that the follow-up task named — this dossier used a 2018 Lookout Spiele-copyrighted PDF,
   cross-confirmed against an independent community source as materially the same ruleset
   ("1830 v3," no receivership), but did not obtain the literal Mayfair/Renegade-branded PDF
   (blocked at the source named in the task, `fgbradleys.com`, with a 403). Low risk given the
   independent cross-confirmation, but flagged for completeness.
3. The BGG community-criticism evidence for both games (F7 partially, F15 fully) could not be
   verified verbatim because every BoardGameGeek URL returned 403/Unauthorized to this
   session's tools. If BGG access is available through some other channel later, F15 in
   particular should be re-verified before being cited as anything more than a directional
   signal.

## 7. Sources failed

- `https://fgbradleys.com/wp-content/uploads/rules/1830%20Railways%20and%20Robber%20Barons%20-%20rules.pdf`
  — 403 Forbidden (WebFetch and direct `curl` with browser UA).
- `web.archive.org` mirror of the above — disallowed for this tool outright.
- `https://boardgamegeek.com/thread/1108423/beginners-frustrated-sudden-bankruptcy` — 403.
- `https://boardgamegeek.com/thread/2248690/1830-bankruptcy-rate` — 403.
- `https://boardgamegeek.com/xmlapi2/thread?id=1108423` — "Unauthorized."
- `opinionatedgamers.com` "How Acquire Became Acquire" — fetched successfully but contained no
  claim usable beyond what `acquisitiongames.com` already sourced better; not cited above.

## 8. Source table

| # | Source | Type | Used for |
|---|---|---|---|
| S1 | Renegade Game Studios, *Acquire* rulebook PDF (design: Sid Sackson), pp.5–9, 12 | Official/primary | F1–F4, F7 (Classic/Tycoon Mode text) |
| S2 | `acquisitiongames.com`, "The Origin of the Game of ACQUIRE" | Secondary historical, quoting primary diary/letters | F5 |
| S3 | `meeplemountain.com/reviews/acquire/` | Reviewer (labelled REVIEW) | F7 |
| S4 | 1830 rulebook PDF, Lookout Spiele/Tresham ed. 2018, developed by Bruce Shelley et al., pp.22–26 | Official/primary (same design lineage as "Railways & Robber Barons") | F8, F12–F14 |
| S5 | `fwtwr.com/18xx/rules_difference_list` §9.4 and §16 (Keith Thomasson, dated Nov 9 2024) | Definitive-community reference (explicitly permitted by the task) | F8 (cross-confirm), F9, F10 |
| S6 | `dossiers/09-valuation-finance.md` (this program's own prior work) | Internal, already-sourced | F11, §4 comparison |
| S7 | `dossiers/02-authority-corporate.md` (this program's own prior work) | Internal, already-sourced | F14, §4 comparison |
| S8 | `dossiers/07-comparators-C.md` §4 Synthesis A (this program's own prior work) | Internal, already-sourced | §4 comparison |
| S9 | BoardGameGeek threads (titles only, via search-engine paraphrase) | COMMUNITY, UNVERIFIED-VERBATIM | F15 only |
