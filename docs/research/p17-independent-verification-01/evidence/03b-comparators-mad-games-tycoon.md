# Comparator Atlas — Mad Games Tycoon (2016) and Mad Games Tycoon 2 (Eggcode)

Scope: P17 franchise/continuation comparator research. Read-only. All claims carry a source line: **source; locator; what it proves; confidence; source-tier**, using the tier vocabulary fixed in `CONTEXT.md`.

## 0. Source inventory and one important correction

- Mad Games Tycoon 1 ("MGT1"): developer Eggcode (formerly "Weappy Studio," a two-brother team, Christian and Stefan), released 2016 (Steam), Steam AppID **341000**.
  source; `/private/tmp/.../evidence/raw/mgt1_news.json` field `appnews.appid`; confirms MGT1 Steam AppID; confidence HIGH; tier DEVELOPER/OFFICIAL.
- Mad Games Tycoon 2 ("MGT2"): developer Eggcode, Early Access Jan 2021, Steam AppID **1342330**.
  source; `/private/tmp/.../evidence/raw/mgt2_news.json` field `appnews.appid`; confirms MGT2 Steam AppID; confidence HIGH; tier DEVELOPER/OFFICIAL.
- **Correction to the pre-fetched cache**: the shared scratchpad's top-level `wiki/` folder (`gamedevtycoon.fandom.com`, pages like `Review_Algorithm_1.4.4.wiki`, `Success_Guild_updated_for_1.7.8.wiki`, `HINTS_GUIDE.wiki`) is **not** a Mad Games Tycoon source. `HINTS_GUIDE.wiki` self-identifies ("This guide will cover all of the parts of **Game Dev Tycoon**") and instructs the reader to rename their in-game studio "**Greenheart**" (Greenheart Games is Game Dev Tycoon's real-world developer) for an achievement — an unambiguous textual fingerprint for the *other*, unrelated Greenheart Games title. Its widely-quoted "40-week sequel penalty" formula (`q -0.4` if a sequel ships <40 weeks after its predecessor, `-0.1` same engine, `+0.2` better engine) belongs to **Game Dev Tycoon**, not Mad Games Tycoon, and is excluded from every claim below.
  source; `/private/tmp/.../scratchpad/p17/wiki/HINTS_GUIDE.wiki` lines 1-4, 70; self-identification as a Game Dev Tycoon guide; confidence HIGH; tier COMMUNITY.
  source; `/private/tmp/.../scratchpad/p17/wiki/allpages.json`, `Engine.json`/`Sequels.json`/etc. all resolve `api.php` calls against `https://gamedevtycoon.fandom.com/api.php`; confirms wiki domain is Game Dev Tycoon's fandom wiki, distinct from `mad-games-tycoon-2.fandom.com` (below); confidence HIGH; tier DEVELOPER/OFFICIAL (platform metadata).
  This also means: **MGT1 has no verified, code-derived "review-score sequel formula" in this evidence set.** Everything said about MGT1's sequel mechanic below comes from Steam guides/patch notes that are unambiguously about MGT1 (confirmed by internal text — mentions of the Eggcode brothers, MGT1's own Steam Community URLs, MGT1 app-store copy), not from the Game Dev Tycoon wiki.
- MGT2's real fan wiki lives at `mad-games-tycoon-2.fandom.com` and is sparse: as of the fetch, its `allpages` index lists only 8 pages total (Cyboo (platform), Employees, Game Genres, Game Review, Mad Games Tycoon 2 Wiki, Main Page, Review Target Table, Studio Level) — **none of them document Sequels, IP, or Franchise**, and the one page fetched for "Category:Game_Mechanics" returned a Cloudflare challenge page, not content.
  source; `/private/tmp/.../evidence/raw/mgt2_fandom_allpages.json`; enumerates the entire MGT2 fan-wiki page index; confidence HIGH; tier COMMUNITY (absence-of-documentation finding).
  source; `/private/tmp/.../evidence/raw/mgt2_fandom_mechanics.html`; Cloudflare "Just a moment…" challenge, zone `mad-games-tycoon-2.fandom.com`; confirms that page was inaccessible, not that it lacks content; confidence HIGH; tier COMMUNITY.
  **Practical consequence**: for MGT2, the developer's *own* Steam "Patchnotes" pinned thread and news-hub posts are the closest thing to an official design doc for the IP/franchise system — there is no wiki-style rulebook. All exact numbers below are triangulated from that patch-note history plus veteran-player Steam Discussions threads (dated, named, quoted) plus two live Steam guide/store fetches done in this session.
- Full timeline evidence used: `evidence/raw/mgt1_news_all.txt` (4,606 lines, full official patch-note/news dump for MGT1), `evidence/raw/mgt2_news_all.txt` (3,500+ lines, same for MGT2), `evidence/raw/patchthread_all.txt` (Eggcode's pinned "Patchnotes" Steam Discussions thread, MGT2), `evidence/raw/thread_ipvalue_all.txt` (88-comment MGT2 thread "IP value, sequels and other related issues," Sep 2021, includes two Eggcode developers replying in-thread), `evidence/raw/thread_boots.txt` (7-comment MGT2 thread "Boots IP," Mar 2024), `evidence/raw/guide_831196886.txt` / `_616265616.txt` / `_604119935.txt` / `_458399932.txt` (four MGT1 Steam Community guides), `evidence/raw/reviews_mgt1.json` / `reviews_mgt2.json` (600 and 1,000 Steam user reviews respectively, via Steam's reviews API).
- **Reddit gap**: the pre-fetched `reddit_search1.json` and `reddit_old_search.html` in the cache both resolved to blocked/login-wall pages ("Welcome to Reddit"), not usable search results, for either game. Live `WebSearch` in this session likewise surfaced only Steam Community results, not r/MadGamesTycoon2 threads, for the sequel/IP queries tried. **No r/MadGamesTycoon2 or Eggcode-forum material could be recovered**; Steam Discussions (which is where this community actually concentrates, per the volume of threads found) substitutes throughout. Noted in Open Gaps.

---

## 1. MAD GAMES TYCOON (2016)

### 1.1 What a "sequel" is, mechanically

MGT1 treats **Sequel** as one checkbox game-type among many (Sequel, Expansion, Addon, Remaster, Budget release, Bundle, Port, MMO/F2P conversion), not as a persistent franchise object. There is no dedicated "IP" entity, no IP rating, no IP history menu, and no franchise-level chart in MGT1 — that entire layer was added later, in MGT2 (§2).
source; `/private/tmp/.../evidence/raw/mgt1_news_all.txt` — a full-text search across all 4,606 lines for `\bIP\b`/`franchise` in a mechanics context returns nothing beyond the phrase "Balance: (Engines license) NPCs..." (engine licensing, unrelated) and zero hits for "franchise"; the single "sequel" mention in the entire patch history is 2019-11-14 marketing copy (below); confidence HIGH; tier DEVELOPER/OFFICIAL (absence finding across full official news corpus).
source; official MGT1 Steam store "About This Game" copy (live-fetched 2026-09-12): does **not** use the words "IP" or "franchise" as named systems, unlike MGT2's store copy (§2.1); it advertises "**More than 100 licenses to base your games on**" and "Want to use an [official] Movie License for your game?" — i.e., MGT1's marketing frames third-party **licenses**, not a first-party **franchise/IP** system, as the headline feature; confidence HIGH; tier DEVELOPER/OFFICIAL.

**Official marketing framing of "sequel" as a repeatable action, not a franchise system**: Eggcode's own 2019 console-launch press release invites players to "create a nifty game and **25 sequels**" — i.e., pitches sequel-making as a volume activity from day one, with no framing device (cooldown, decay, escalating expectation) mentioned at all.
source; `/private/tmp/.../evidence/raw/mgt1_news_all.txt` line ~4604, dated 2019-11-14, "Mad Games Tycoon – now available for consoles"; exact developer marketing copy; confidence HIGH; tier DEVELOPER/OFFICIAL.

### 1.2 Sequel quality effects (what a sequel gets/loses)

A veteran MGT1 Steam Community guide (unambiguously MGT1: it opens by noting "MGT was on hiatus, due to the death of one of the [Eggcode] brothers") documents launch-sales carryover and licensing rules for sequels that are **not** present anywhere in the official patch notes (i.e., day-one, unpatched behavior):

- **Launch stock/momentum carryover**: "Stock 10% sold for a budget/remaster release, or **(hype at launch)%** if just released a sequel." A sequel's initial "pre-sold" stock is scaled by the game's own hype-at-launch value, rather than the flat 10% a budget release or remaster gets — the only mechanism in MGT1 that looks like inherited momentum from being a sequel (as opposed to a fresh, unrelated game).
  source; `/private/tmp/.../evidence/raw/guide_831196886.txt` line 157; describes the initial-sales formula difference between sequel/remaster/budget release types; confidence MEDIUM (single community source, unverified against decompiled code); tier COMMUNITY.
- **Remasters are cosmetic-only, not creative reinventions**: "Remasters are limited to changing engine, features, consoles and languages. The genres, topics and sliders are locked." "Remaster types currently only change the game's name." A whole numbered sequel *chain* can be remastered as a unit ("Bug was fixed that prevented an entire series of sequels from being remastered").
  source; `/private/tmp/.../evidence/raw/guide_831196886.txt` lines 105-109; documents remaster scope and confirms chain-remastering exists as an intended feature; confidence MEDIUM; tier COMMUNITY.
- **Licenses (third-party IP) are a finite, consumable, competed-for resource, and sequels burn another use of the license while remasters do not**: "Licenses[:] Games = how many times you can use it, not how often competitors have." "**Sequels use the licence again, but remasters do not.**" "Check often, so competitors don't buy any good licenses." "Can use them years later, sell with 1 remaining, or forever stash from competitors." "If you cancel development of a game, the license is still deemed used, just like IRL."
  source; `/private/tmp/.../evidence/raw/guide_831196886.txt` lines 226-230; documents license consumption/hoarding rules and the sequel-vs-remaster distinction; confidence MEDIUM; tier COMMUNITY.
  source (corroboration of "licenses are consumed"); `/private/tmp/.../evidence/raw/mgt1_news_all.txt` line 2267/2301 "Bug removed: Licenses were not consumed." (a fix confirming the intended design is that licenses ARE consumed); confidence HIGH; tier DEVELOPER/OFFICIAL.

**No review-score inheritance from a predecessor was found for MGT1.** The mechanism is not "your sequel starts at your prior game's score"; it is closer to "a sequel gets a bigger initial sales pop scaled to hype, and burns a license slot if one is attached." Sequels are also explicitly one of the levers players use to keep money flowing indefinitely, per direct player testimony:
> "There are many ways to keep the money flowing, the best I found was creating sequels to my IP's and the occasional mmo of them."
source; Steam review, recommendationid 222136061, MGT1 (AppID 341000), "up" recommendation; player describing sequels as the dominant money-making loop; URL pattern `https://steamcommunity.com/app/341000/reviews/` (recommendationid 222136061); confidence HIGH (direct quote); tier COMMUNITY.

### 1.3 Fanbase, unlock gating, licenses-as-audience

- MGT1's fanbase is a **single, company-wide pool**, not per-IP, and even veteran players in the guide corpus were unsure whether it silently weighted by genre: "Fanbase increases from goodies, languages, target audience, hype, game points and review score... **Unable to confirm if Fanbase is subdivided by Genre or not, but does feel like it is.**"
  source; `/private/tmp/.../evidence/raw/guide_831196886.txt` lines 128-131; documents fanbase inputs and explicit uncertainty about per-genre subdivision; confidence MEDIUM; tier COMMUNITY.
- **Licenses are how MGT1 represents "franchise ownership & licensed IP,"** not a franchise-scoring system: buyable, finite-use, hoardable/denyable objects covering (per the store page) movies, "books, toys... and sports" style tie-ins, priced and re-offered over time, with an icon shown on any game using one.
  source; official MGT1 Steam store copy (live-fetched): "Want to use an official Movie License for your game?" and "More than 100 licenses to base your games on"; confidence HIGH; tier DEVELOPER/OFFICIAL.
  source; `/private/tmp/.../evidence/raw/mgt1_news_all.txt` lines 836-854 ("Icons for the type of licenses added"; "When choosing a license, you now have the opportunity to replace the name of the game with the License name"; "Added more than 800 licenses. (Thanks to doy)"); confirms an actively expanded, typed, name-substituting licensing catalog; confidence HIGH; tier DEVELOPER/OFFICIAL.
- **Rivals use the identical license market** and can starve the player out of good ones — MGT1 does not give the AI a separate, softer rule: "Check often, so competitors don't buy any good licenses." Rivals also license and sublicense player-made game *engines* on the same terms as the player.
  source; `/private/tmp/.../evidence/raw/guide_831196886.txt` line 228; confidence MEDIUM; tier COMMUNITY.
  source; `/private/tmp/.../evidence/raw/mgt1_news_all.txt` lines 2738/2760 "(Sublicense own engines) Chance of success now is related to the difficulty"; confidence HIGH; tier DEVELOPER/OFFICIAL.
- Named-IP history UI, franchise recognition/momentum/fatigue as three separable stats, spin-offs-as-bounded-SubProperties, remake-vs-reboot distinction, early-greenlight-before-predecessor-release, and cast/talent-continuity bonuses: **none of these exist in MGT1.** The 2016 game's continuation model is exhausted by: {Sequel, Expansion, Addon, Remaster, Budget, Bundle, Port} as flat game-type flags, plus a shared license pool for outside IP.

### 1.4 MGT1 — the six-part analysis

1. **What decision does the mechanic create?** Essentially none at the franchise level — the only real decisions are "which flat game-type checkbox do I tick" and "is a license slot worth spending on this concept." There is no timing decision, no franchise-identity decision, no fan-allocation decision.
2. **What is fun?** The pure sales-volume fantasy ("create a nifty game and 25 sequels") and the license hoarding/denial minigame against rivals (checking the market often so a competitor doesn't snap up a good movie license) are the closest things to real tension.
3. **What becomes tedious/exploitable?** Once a player learns "sequel = same slider settings, new label, bigger initial-hype-scaled sales pop," there is nothing narratively or economically stopping infinite sequel-stamping; the guide corpus treats "sequel spam" as simply optimal, not as a design tension to manage.
4. **Hard-timer optimization?** No — MGT1 has no cooldown, decay, or neglect clock on sequels at all (that only arrives in MGT2). The absence itself is the finding: MGT1 pre-dates the entire "too many/too fast" problem the P17 spec is probing for.
5. **Sequel spam?** Yes, by design and by community consensus — sequels are one of the two or three standard "keep money flowing" levers, with no counter-pressure.
6. **ADOPT / ADAPT / REJECT for Project: Studio** — **REJECT** the MGT1 model wholesale as a target: a flat game-type checkbox with no persistent franchise object, no recognition/momentum/fatigue, and no identity enforcement is the "collapse everything into one Sequel flag" anti-pattern the Owner direction (A) already explicitly rules out. **ADAPT** the *license-as-scarce-shared-resource* idea (finite uses, rival-competed, hoardable, name-substituting) as one input to how Project: Studio should think about "franchise ownership & licensed IP" (P16) interacting with rival legality (Owner K) — the "AI can also buy the license out from under you" tension is a genuinely good, underused idea. **ADAPT** the hype-scaled-launch-stock idea as a cheap, legible analog for "a huge recent hit may make a fast follow-up more attractive" (Owner C) — it is a real, if primitive, precedent for coupling a sequel's opening performance to the parent property's *current* momentum rather than its lifetime average (Owner Q).

---

## 2. MAD GAMES TYCOON 2 (Eggcode)

MGT2 is the far richer comparator: Eggcode built an actual persistent "IP" (their explicit shorthand for "franchise") object over roughly three years of Early Access, iterated on it in public in response to a specific, sustained player argument about "sequel spam," and ultimately shipped something structurally adjacent to — but simpler than — what Project: Studio's Owner has chosen.

### 2.1 Official framing: "IP" *is* "franchise" in Eggcode's own vocabulary

> "Every game is a part of a growing IP (**Intellectual Property/Franchise**), build up the reputation of your IPs into gaming powerhouses that have your fans counting down the days until the next hit."

source; official MGT2 Steam store "About This Game" copy (live-fetched 2026-09-12, AppID 1342330); Eggcode's own headline framing equating "IP" with "Franchise"; confidence HIGH; tier DEVELOPER/OFFICIAL.

> "-Games now have an IP rating. - Do you want to build the next great game franchise? Now you can! The IP rating of a game grows as you release better and better games. If you happen to sweep the Year End awards you'll see your game IP get massive gains and become envy of all the competition! All the big IPs compete on a **top 100 chart**, with the biggest IPs getting boost to their game sales and merchandise sales. There is also an **IP menu listing the history of each of your IPs, and all its stats and awards**."

source; `/private/tmp/.../evidence/raw/mgt2_news_all.txt` line 1728, dated 2022-01-21, "Mad Game Tycoon 2's First Year Anniversary!" (developer year-in-review post summarizing the whole EA feature set); confirms: named IP history UI exists, top-100 cross-company chart exists, IP rating feeds both game sales and merchandise sales; confidence HIGH; tier DEVELOPER/OFFICIAL.

> "So many game types! - In addition to creating your standard games, you can create **sequels, spin-offs** of existing games, GOTY editions, budget versions, game bundles, **remasters**, MMOs, F2P, addons/expansions for games, standalone addons and port your games..."

source; same post as above; confirms MGT2's continuation taxonomy has Sequel and Spin-off as distinct types but **no distinct Remake or Reboot type** — only "Remaster" exists, which the community (below) treats loosely as covering that ground; confidence HIGH; tier DEVELOPER/OFFICIAL. This is a direct structural gap relative to Owner Direction I (Remake vs Reboot as distinct, approved types).

> "-Specialized fan bases - Is your company known for releasing amazing RPGs? Expect to gain a large fan base of RPG fans who want the next great RPG and might be a bit less interested in buying your new Racing game!"

source; same post; confirms fans in MGT2 are specialized **by genre and attached to the company**, not to the individual IP — a structurally different axis from the "IP rating" system described above; confidence HIGH; tier DEVELOPER/OFFICIAL. (Confirmed independently in §2.4 below: fans do not feed IP growth at all.)

### 2.2 The IP system's build history, exact dates, exact wording (patch-note reconstruction)

Reconstructed in date order from the full official patch-note archive (`mgt2_news_all.txt`), cross-checked against the separate pinned Steam Discussions "Patchnotes" thread (`patchthread_all.txt`), which repeats the same text:

| Date | What shipped (verbatim where quoted) |
|---|---|
| 2021-04-14 | "You can now create spin-offs of a main IP." |
| 2021-04-20 | **"IP system added: All games of the IP influence each other."** Hint given in the same note: "For old save games, only the first game is set as the IP. **Successors, remasters, etc. are 'not' added to the IP**" [for legacy saves at the moment of migration]. |
| 2021-04-21 | "The IP rating now drops for bad games." / "The higher the difficulty, the slower the IP rating increases." |
| 2021-05-28 | IP menu revision (shows revenue/sales/awards); "BALANCE: Bonus sales from IP awareness is now scaled according to difficulty." |
| 2021-05-30 | Official "Milestone Update" post: "the ability to remaster older games, port games to other platforms, establish long running game IPs with a full history and create spin-offs of existing IPs has all been added since the start of Early Access." |
| 2021-09-08 | **"Trendsetters are now raising the IP rating." / "IP penalty due to neglect is now related to the difficulty level." / "If you have not released a product for an IP for a long time, the IP rating will drop." / "If you release a product for an IP too many times in a short period of time, the IP rating will increase slower."** — this is the exact patch that formalized both the neglect-decay side and the diminishing-returns-on-spam side of the rule. Also: "'Develop Successors, Spinoffs, etc.': You can now sort the games by IP notoriety." |
| 2021-11-05 | "NPC games now have IPs associated with them, use license, create spinoffs, ports and GOTY editions" — confirms rivals run the *same* IP logic from this point. |
| 2021-12-22 | Fanshop added (merchandise per-IP); "Bonus hype for spin-offs is now taken from the latest game of the IP" — the one explicit **hype-inheritance** rule found: a spin-off's starting hype pulls from its parent IP's most recent entry, not from zero. |
| 2022-01-21 | Anniversary summary post (quoted §2.1); "Companies now have exclusive IPs... over 100 different IPs spanning over the decades that belong to the various [NPC] companies each with a genre, topic and scheduled time of appearance"; "Menu 'Create Spin-Off' and 'My IPs': IPs can now be sorted by 'Neglect'"; "IP tooltips: It now shows how many weeks have passed since the last game for the IP was released." |
| 2022-04-28 to 2023-05-24 | Subsidiaries can be assigned to focus on specific IPs; IPs can be *transferred* between a player's own subsidiaries (an internal ownership-transfer mechanic, pre-dating open buy/sell). |
| 2023-04-20 | **"[B] Buying and selling of IPs — If you need some extra cash, or if there is an IP you would really like to own you have the option to buy and sell IPs."** Same patch: "The value of IPs now scales with the current year." / "BALANCE: The value of IPs can now be up to $200,000,000." / **"IPs can now be archived. This means that the games will no longer be displayed if you want to develop a successor or SpinOff, for example."** |
| 2023-08-24 | Modding hooks exposed for rival IP behavior: `<NpcIPs.txt>` tags `<PLSTATIC>` (sequels forced onto one platform type), `<PLx>` (force target platform), `<EX>` (force exclusive), `<MMO>`/`<F2P>` (force type), `<ROM>`/`<ARA>` (force Roman/Arabic sequel numbering); "Game tooltips: The name of the IP is now displayed." |
| 2024-01-16/17 | "When you develop a sequel, the gameplay features and languages are now automatically carried over from the predecessor" — the first explicit **content-inheritance** rule (not just a rating/hype effect: actual concept fields copy forward); "(NpcGames.txt & NpcIPs.txt) If you add the tag `<NOSPIN>`, no SpinOffs will be created from this game" (mod-level opt-out of spin-off generation, for a specific NPC IP); "3 more slots for IP focus added" for subsidiaries. |

source; `/private/tmp/.../evidence/raw/mgt2_news_all.txt`, all rows above located by grepping `\bIP\b`/`IPs\b` across the full 3,500+-line file and resolving each hit to its nearest preceding `===== YYYY-MM-DD` header (118 total IP-related lines found, table above is the load-bearing subset); confidence HIGH for every exact quoted phrase (verbatim developer patch-note text); tier DEVELOPER/OFFICIAL.
source (corroboration); `/private/tmp/.../evidence/raw/patchthread_all.txt` lines 164, 201, 209, 263-264, 310, 749-750; the same "spin-offs," "IP focus," "sequels have the same platform type," and "name of the IP is now displayed" notes recur verbatim in Eggcode's pinned Discussions thread; confidence HIGH; tier DEVELOPER/OFFICIAL.

**Reading the two 2021-09-08 lines together is the single most load-bearing fact in this file for the P17 spec's specific question about "sequel too soon" logic**: MGT2 does **not** hard-block or flatly reject a too-fast sequel. It applies a **rate penalty** — the same release, done sooner, contributes less to a continuously-tracked rating — which is structurally the "bounded continuous model" the Owner has already chosen (Direction D), not a cooldown gate. Where it diverges from the Owner's model is that MGT2's version is *purely time-based* (a countable clock per IP), with quality only affecting *how much* a given release adds, not *whether* the clock resets or matters — it has no analog to a separate, decaying Momentum term feeding back into the timing math, and no analog to Fatigue rising *faster* for repeated mediocrity specifically (Owner Direction C).

### 2.3 The community-named exact numeric rule ("Sequelitis") and the developer's own stated design trade-off

The clearest, most load-bearing single quote in the whole corpus, from a veteran player answering a stuck newer player ("Boots IP," Mar 2024):

> "**Spin-offs have a 'cooldown' period, during which a spin-off will get much lower IP increase than normal. Sequels have a cooldown of one year, and the IP increase debuff will be much harsher. This is to discourage what some people (myself included) call 'Sequelitis' without making sequels completely useless.**"

source; `/private/tmp/.../evidence/raw/thread_boots.txt` line ~13, Kyouko Tsukino, 11 Mar 2024, thread "Boots IP" (`steamcommunity.com/app/1342330/discussions/0/4289187621814458994/`); the community's own coined term for sequel spam, plus the numeric 1-year threshold and the qualitative claim that spin-offs get a lighter version of the same debuff; confidence HIGH (specific, internally consistent, corroborated independently by a second veteran below), but the exact number is COMMUNITY INFERENCE (not in a patch note verbatim) so labeled; tier COMMUNITY.

A second veteran in the same thread independently arrives at the identical practical number and names the exact UI tell:

> "**12 Month Countdown** - when you release any game for an IP, a box is checked 'further games of this IP contribute almost nothing to IP value'. I use Month 13 as my safety."

source; `/private/tmp/.../evidence/raw/thread_boots.txt`, Sol, 12 Mar 2024; independent corroboration of the ~12-month figure with more mechanical detail (a literal checked/unchecked internal flag); confidence HIGH (cross-corroborated by two independent, detailed veteran accounts); tier COMMUNITY.

Eggcode's own developer ("Panda") explains, in-thread, the actual design trade-off they weighed and the alternative they rejected — this is the single best piece of evidence in this file for "what a real dev team decided about exactly this problem":

> "**Concerning the OP I agree that IPs should drop due to poor quality releases.** I understand not everyone wants the 'challenge' of working around mechanics and systems that go against their desired playstyle... **I had originally suggested a 'second level' to IPs. Something like the 1st 5 'gold stars' are potentially temporary and can be lessened and the next level 'platinum' stars are permanent.** I thought this would placate people who do not want their IPs damaged by allowing them to 'max' them out. **The issue is once you start adding complexity to the solutions both the complexity to implement them and the time to add them increases.** But on the flip side if you simply just add 'well fans get bored if you release too many sequels' you add an **inoperable obstacle** for certain players."

source; `/private/tmp/.../evidence/raw/thread_ipvalue_all.txt` lines ~140-165, Panda [developer], 8 Sep 2021, `steamcommunity.com/app/1342330/discussions/0/3040481812831468073/`; direct developer statement of a rejected two-tier (temporary-vs-permanent) design that is structurally close to Project: Studio's Recognition-(durable)/Momentum-(decaying) split, abandoned for cost/complexity reasons, not because it was thought wrong; confidence HIGH (primary developer quote); tier DEVELOPER/OFFICIAL.

Eggcode independently confirmed, in a *different*, earlier thread three months prior, that the neglect-decay clock had shipped with a bug making it fire too fast, and fixed it — direct evidence the studio treats the timer as tunable, not sacred:

> Byron (reporter, 19 Jun 2021): a game that "**win[s] game of the year and get 89% rating in very hard difficulty**" still saw its IP "**went up to 0.7, but within a matter of weeks it went down to 0.2**," concluding "**There's really no point in having IPs in higher difficulties the way they are handled now**" and directly invoking a real franchise: "**Rockstar doesn't make a new GTA every year.**"
> Eggcode Games [developer] (21 Jun 2021): "**The rating drops too fast (because sometimes the time is not reset)**" and committed to a hotfix.

source; live `WebFetch` of `steamcommunity.com/app/1342330/discussions/0/3076503022325456906/` ("IPs in higher difficulty are broken"), fetched 2026-09-12; direct developer bug acknowledgment plus a player's spontaneous real-franchise analogy (GTA); confidence HIGH; tier DEVELOPER/OFFICIAL (developer reply) / COMMUNITY (player analogy).

### 2.4 What actually moves IP rating, and what does not (community-tested, cross-corroborated)

From the same veteran ("Boots IP," backed by a second veteran's independent testing in the same thread and by an official patch note):

**Moves it:**
- Release frequency for the IP, subject to the ~12-month diminishing-returns clock above (any type — sequel, spin-off, remaster, port, budget release, paid update all count "the same," per §2.5).
- Review quality/rating of each release: "**Ratings matter, a series of 98% game will boost your IP faster than a series of 90% games.**"
- Awards (Game of the Year and category awards) — described as the single fastest lever: "Quick IP gain needs awards."
- The developer's own overall Studio Rating (a multiplier: higher-star studios grow new IPs faster).
- Confirmed officially: "The higher the difficulty, the slower the IP rating increases" and "The value of IPs now scales with the current year" (era-scaling, both sides corroborated independently by a player noting 1970s IP growth "feels" much slower than 2010+).

**Does NOT move it** (explicitly tested and reported by a veteran player, using a controlled infinite-money/fan save to isolate variables):
- **Sales**: "I've tested this by making a run with infinite money, and releasing some IPs on 'bad' platforms... the IPs released on 'bad' consoles grew at the same rate as IPs on the other save."
- **Hype**: "Hype boosts sales. That's it."
- **Fans**: "They'll help you sell more games/consoles, and buy merch for your IP, but none of that affects IP growth... The games sold outstandingly better than games from normal saves, but their IP growth was not noticeably different."
- **Trends**: "a laughable boost to sales, and that's all."

source; `/private/tmp/.../evidence/raw/thread_boots.txt`, Kyouko Tsukino, 11 Mar 2024, full post; deliberate isolated-variable testing methodology described in the player's own words; confidence MEDIUM-HIGH (self-reported testing, not decompiled code, but methodologically explicit and internally consistent); tier COMMUNITY.
source (corroboration on ratings); `/private/tmp/.../evidence/raw/thread_boots.txt`, Kyouko Tsukino reply #3, 13 Mar 2024: "Ratings matter, a series of 98% game will boost your IP faster than a series of 90% games (again, sandbox is useful for testing this kind of stuff.)"; confidence MEDIUM-HIGH; tier COMMUNITY.

This is a structurally important negative finding for Project: Studio: **MGT2's Fans and its IP system are two parallel, largely non-interacting stats**, despite the store copy's rhetorical framing ("fans counting down the days until the next hit"). Community members repeatedly asked Eggcode to couple them and were not answered with a yes:

> "I've always felt that fans should of been tied to IPs... For example, if you release a game with an IP that has 10 million fans, you're going to have more fans to lose and get request from than one with 100,000 fans."

source; `/private/tmp/.../evidence/raw/patchthread_all.txt` lines 1423-1425 (recurs 3× in the concatenated thread dump), undated forum post in Eggcode's pinned Patchnotes thread responding to years of "fan support-call overload" complaints; confidence HIGH (direct quote); tier COMMUNITY. This exact ask — "fan counts per IP" rather than one company-wide pool — is precisely one of the P17 spec's explicit questions, and the honest answer for MGT2, even in its most mature (2024-2026) patch state, is: **not implemented.**

### 2.5 Sequel/spin-off/remaster are functionally interchangeable — the "reskin" exploit, confirmed by both developer-adjacent modding hooks and players

> "**Sequel/Spin-Off - it really doesn't matter. They will add the same IP value, and are functionally the same.** If you're bored with Mega Man and want to make Mega Warriors: Empire Legends XTreme, it will have the same impact as just making Mega Man 9. It will be 'just another game of that IP'. **Mad Games Tycoon 2 doesn't care if you release a sequel, spin-off, or remaster.** Whichever you do will bump your IP and tick the box 'no IP growth from releasing games for 12 months'."

source; `/private/tmp/.../evidence/raw/thread_boots.txt`, Sol, 12 Mar 2024; direct claim (with worked example) that continuation *type* carries no distinct meaning to the IP-growth math beyond a small spin-off-vs-sequel cooldown-severity difference noted by a different veteran in the same thread; confidence MEDIUM-HIGH (asserted plainly, partially disputed by a second veteran who says spin-offs *feel* slightly faster — see next); tier COMMUNITY.
> (Partial counter, same thread) "**I've observed spin-offs letting the IP grow faster than outright sequels** - which is why I abuse the once-a-month release - so I'm not so sure the game really 'doesn't care' what type of game you're releasing for an IP."
source; `/private/tmp/.../evidence/raw/thread_boots.txt`, Kyouko Tsukino, 12 Mar 2024; confidence MEDIUM (anecdotal, contradicts the flat claim above on the margins); tier COMMUNITY.

A player can also simply **rename an IP to dodge its own neglect clock**, per a veteran's explicit workaround in the earlier IP-value thread:

> "You could also just change your IP's name and make it a whole new 'brand' (except for main genre, that is,) if you simply can't have the IP fall... **Turn your The Elder Scrolls 29 into Ultima 1. Because 'why not?'**"

source; `/private/tmp/.../evidence/raw/thread_ipvalue_all.txt` line ~500, Kyouko Tsukino, 11 Sep 2021; confirms IP identity itself carries no enforced continuity — renaming resets player-visible pressure with no in-fiction or mechanical cost; confidence HIGH (direct, specific quote); tier COMMUNITY.

### 2.6 Player-experience quotes — sequel spam and the cooldown, praise and complaint

**Complaints (direct quotes, with source and date):**
1. "**I'm just wondering how to make some panalties for tapping 174 sequels, because today it's possible and effective. And illogical.**" — GrandeLS (as quoted by Red Valour), 8 Sep 2021, thread "IP value, sequels and other related issues." *(`/private/tmp/.../evidence/raw/thread_ipvalue_all.txt` line ~55)*
2. "**It creates a feeling of 'Okay. Do I want to do what I want to do — which is make a new IP for fun. Or should I get this sequel out of the way so I don't have to think about it for another 3 to 4 years.' The mindset of the player should not be 'Let's get this over with' it should be 'Let's have fun.' ... I don't find it fun to release sequel #1000.**" — Dragoon, 11 Sep 2021, same thread. *(line ~495)*
3. "**In this game, releasing chain sequels ... hits you with diminishing returns — at some point, you will get 5.0 IP forever anyway, and systems like this only irritate newer players and intermediate players, as vets know how to work around these kind of systems.**" — Sol, 8 Sep 2021, same thread. *(line ~68)*
4. "**I really hate that IPs drop if left alone for 5 or however many years. How long has it been since the last Elder Scrolls?... Rip their IP rating... What about a game like Stardew Valley though?... Will Stardew Valley 2 become doomed in terms of IP value due to the lack of a sequel / spin-offs? Of course not. The current system is not very fun to work with.**" — Dragoon, 10 Sep 2021, same thread. *(line ~230)*

**Praise (direct quotes):**
1. "**Just addicting to make up game franchises and see which ones become unstoppable monster series with a gazillion spinoffs.**" — Steam review, recommendationid 199263037, MGT2, "up."
2. "**+ Building IPs (porting, sequels, spin-off, remake) so many options... - It would be great if discovered game formulas would transition into new games (otherwise i use the guide too much) - Too much Micro**" — Steam review, recommendationid 182806543, MGT2, "up" (12 helpful votes) — praise for franchise-building breadth paired directly with a tedium complaint about needing an external optimization guide.
3. "**Buying IP rights, releasing ports, remasters, game addons, arcade machines etc, the amount of features and possibilities is mind boggling.**" — Steam review, recommendationid 187308496, MGT2, "up."
4. Satirical/self-aware take on sequel-stacking as a recognizable genre trope: "**Guys I know we're down in profit but space pirates 2 2 the sequel remastered with motion control premium edition is gonna be peak!**" — Steam review, recommendationid 178846954, MGT2, "up."

source (all four complaints); `/private/tmp/.../evidence/raw/thread_ipvalue_all.txt`, as located per-quote above; confidence HIGH (direct quotes, dated, attributed); tier COMMUNITY.
source (all four praise/satire quotes); `/private/tmp/.../evidence/raw/reviews_mgt2.json`, Steam Reviews API dump for AppID 1342330, filtered to `language:english` and keyword-matched; each recommendationid is a stable Steam review identifier resolvable at `https://steamcommunity.com/app/1342330/reviews/`; confidence HIGH (direct quotes); tier COMMUNITY.

### 2.7 Rivals (AI) and the same rule-set

Confirmed structurally symmetric, with the AI on the *same* IP clock and the *same* archive/transfer/buy-sell machinery, plus dedicated modding hooks that only make sense if NPC IPs are simulated with the identical underlying object:

- "NPC games now have IPs associated with them, use license, create spinoffs, ports and GOTY editions." (2021-11-05)
- "**Companies now have exclusive IPs**... They will work more intelligently to build up these IPs with sequels and spinoffs and create competitive games that will increase their value and place on the charts! There exist **over 100 different IPs** spanning over the decades that belong to the various companies each with a genre, topic and scheduled time of appearance." (2022-01-21)
- "BALANCE: NPC companies maximize their IPs faster with increasing difficulty." (2022-01-21) — i.e., the AI's own version of the same clock is explicitly tuned per difficulty, mirroring the player-facing "higher difficulty = slower IP growth" rule inversely (harder for the player, easier/faster for rivals) — a genuine asymmetry, not parity.
- Modding surface `NpcIPs.txt` lets a scenario author force an NPC IP's platform, exclusivity, MMO/F2P status, and even Roman-vs-Arabic sequel numbering, and the `<NOSPIN>` tag can suppress spin-off generation from a specific NPC game — strong indirect evidence the AI's sequel/spin-off creation is a *general* rule applied per-IP, not scripted per opponent.
- A player-reported bug — "**BUG: Closed game studios have bought IPs**" (2024-01-17 patch note, i.e., a company that had already gone out of business was still transacting in the IP market) — is incidental confirmation that NPCs participate in the *same* buy/sell IP market as the player, since the bug is specifically about an NPC in an invalid state still executing that logic.

source; `/private/tmp/.../evidence/raw/mgt2_news_all.txt` lines 1278, 1796-1814, 1899, 3487 (dates as embedded in table §2.2); confidence HIGH for all quoted phrases; tier DEVELOPER/OFFICIAL.
**Caveat**: the *difficulty asymmetry* (rivals ramp IP faster at exactly the difficulty tier where the player's own IP growth is throttled hardest) is stated as a deliberate BALANCE note by the developer, not a player inference — but whether it nets out fair in practice is not verifiable from patch notes alone; flagging as DESIGN INFERENCE, MEDIUM confidence, since no player-side head-to-head measurement of rival IP growth vs. player IP growth at Legendary was found in this evidence set.

### 2.8 MGT2 — the six-part analysis

1. **What decision does the mechanic create?** A genuine release-*scheduling* decision per IP ("do I ship this IP's next entry now, at a fractional-value cost, or hold it to ~13 months for full value") plus a portfolio-breadth decision (how many IPs to run in parallel given development-room capacity), plus (from 2023-04-20 on) a real buy/sell/archive capital-allocation decision.
2. **What is fun?** The "build a stable of 3-10 IPs and watch a top-100 chart" fantasy (explicitly praised, §2.6); the AI-license/IP-market rivalry; the genuine surprise/spectacle of a Game-of-the-Year sweep visibly spiking an IP's rating.
3. **What becomes tedious/exploitable?** Precisely the release-calendar spreadsheet play documented at length in "Boots IP" (players literally build month-by-month, year-by-year release schedules — "Jan: IP 1 / Feb: IP 2 / ... / Jan: IP 1: The Sequel" — to farm the 12/13-month window across 5-10 IPs simultaneously); the flat interchangeability of sequel/spin-off/remaster/port/paid-update as "just another IP-value tick" (§2.5); and the IP-rename escape hatch that voids the neglect clock for free.
4. **Does it create hard-timer optimization?** **Yes, extensively and explicitly documented** — the community's own detailed release-calendar guides (§2.2 table, §2.5, "Boots IP" full thread) are hard-timer optimization by definition: real players plan real years of in-game release dates purely to respect a ~12/13-month per-IP clock.
5. **Does it create sequel spam?** Partially self-limiting by design (diminishing returns after the window, confirmed by three independent veteran accounts converging on the same number) but **not eliminated** — "spam 20-50 games per year" is explicitly described by a veteran as a viable, if labor-intensive, alternative to respecting the cooldown ("If you can push out a game every two weeks, those 24 games will overpower the nerf... It's no fun to spam games like this though" — Sol, `thread_boots.txt`), and the endgame plateau ("you will get 5.0 IP forever anyway") removes any further pressure once an IP is maxed.
6. **ADOPT / ADAPT / REJECT for Project: Studio:**
   - **ADOPT-flavored validation, not a mechanic to copy verbatim**: MGT2's own community debate independently re-derived several pieces of the Owner's already-chosen direction — a rate-based, non-blocking timing penalty rather than a hard gate (Direction D); developers explicitly considering, then rejecting for cost reasons, a two-tier durable/decaying split structurally close to Recognition vs. Momentum (§2.3, Panda's "gold star / platinum star" idea); and a player independently proposing exactly the Owner's chosen "increase expectations, don't just gate timing" framing ("Probably best for the next sequel to somehow increase market expectations for quality, which would make it increasingly difficult to do a good review" — GrandeLS, `thread_ipvalue_all.txt`). This is strong outside validation that the Owner's three-factor model (Recognition/Momentum/Fatigue) is solving a real, previously-litigated design problem, not a speculative one.
   - **ADAPT**: the *hype-inherits-from-latest-entry* rule for spin-offs (§2.2, 2021-12-22) as a narrow, well-scoped precedent for how a SubProperty (Owner Direction J) might inherit a *decaying* Momentum-like quantity from its parent StoryProperty at creation, without inheriting the parent's full Recognition.
   - **ADAPT with a structural fix**: the buy/sell/archive/transfer IP-ownership machinery (§2.2, 2023-04-20 patch; era-scaled value up to a cap) is a workable skeleton for P16's "franchise ownership & licensed IP... IP value over time" ask, but MGT2's version has no rights-expiry concept and no distinction between *owning* a franchise you originated and *licensing* someone else's outside IP (movies/books/sports) — Project: Studio's split between P16 (StoryProperty/rights) and the licensed-IP-purchase idea inherited from MGT1's separate "Licenses" system (§1.3) should be kept distinct, not merged the way MGT2 quietly conflates them under one "IP" umbrella.
   - **REJECT** (structural risks explicitly exposed by this comparator, not a re-litigation of Owner choices): (a) a **purely time-based neglect clock** with no floor tied to the property's own defining-hit history — MGT2's flat ~5-year "abandon it and it drops" rule is the exact "wait one year"-style hard-timer-without-nuance the Owner direction (C, D, H) already forecloses, and this comparator's own player base (Dragoon's Elder Scrolls/Civ/Stardew Valley examples, §2.3) independently demonstrates why it produces absurd results against real franchise patterns; (b) **fans and franchise value as two non-interacting stats** despite marketing language implying they're coupled (§2.4) — Project: Studio should make sure Recognition/Momentum/Fatigue actually consume or produce the same audience-facing numbers P07/P08 read, rather than shipping a second, parallel "vanity" stat the way MGT2's community explicitly diagnosed its own Fans mechanic to be ("Do fans do anything useful, or are they just a vanity metric?", `patchthread_all.txt` line 984); (c) **zero-cost franchise renaming as a neglect-clock bypass** (§2.5) — reinforces the importance of keeping StoryProperty/SubProperty identity a real, referenced object (Owner Direction J, M) rather than a free-text label a player can reset at will; (d) **no distinct Remake/Reboot type** (§2.1) — direct structural confirmation that Owner Direction I (treating Remake and Reboot as legally/mechanically distinct) is *not* something this successful, long-running comparator already solved — Project: Studio would be doing genuinely new design work here, not copying a proven pattern.

---

## 3. Cross-game summary table

| Question | MGT1 (2016) | MGT2 (Eggcode, current) |
|---|---|---|
| Persistent named IP/franchise object? | No — flat game-type flag only | Yes — "IP" object with rating, history menu, top-100 chart |
| Fan count per IP? | Single company pool, uncertain even to players if genre-weighted | Single company pool, split by **genre**, explicitly **not** by IP (confirmed non-effect on IP rating) |
| Sequel timing rule | None found (day-one feature, essentially unpatched in 4,606 lines of notes) | ~12-month per-IP window; diminishing (not zero) return before it, full value at/after it |
| Penalty shape | N/A | Rate-based (soft), not a hard gate/reject — no game is blocked from shipping |
| Quality effect on franchise stat | Not modeled (only initial-sales hype-scaling for sequels) | Direct: higher review score = faster IP-rating growth; awards = biggest single lever |
| Continuation types distinguished | Sequel / Expansion / Addon / Remaster / Budget / Bundle / Port (flat, no franchise weighting) | Sequel / Spin-off / Remaster / GOTY / Budget / Bundle / Port / MMO / F2P / Addon — **no distinct Remake or Reboot** |
| Licensed third-party IP | Yes — large, finite-use, hoardable license catalog (movies/books/sports-style), rival-competed | Yes, same lineage, continued and expanded (comics/board games/toys added later) — kept mechanically separate from the player's own "IP" object |
| Early greenlight before "release" | N/A (no franchise object to greenlight into) | Implicit only — a sequel/spin-off can be developed any time an IP exists; no evidence of a distinct "greenlight before predecessor ships" concept |
| Rivals under the same rules | Yes, for licenses/engines | Yes, explicitly — same IP object, same buy/sell/archive machinery, tunable per-difficulty |
| Community term for the failure mode | none coined | **"Sequelitis"** (player-coined, in active use since at least 2024) |

---

## 4. Open gaps

- **No r/MadGamesTycoon2 or Eggcode-forum content recovered.** Both the pre-cached Reddit fetches and a fresh live `WebSearch` in this session returned only Steam Community results for every sequel/IP/franchise query tried; the pre-fetched Reddit JSON/HTML files were login-walled placeholders, not search results. The Steam Discussions evidence used instead is extensive (88-comment and 7-comment threads with named, dated, in-thread developer replies) and is very likely where this specific community concentrates in practice, but the task's explicit ask for Reddit-specific material is not fulfilled.
- **No decompiled/reverse-engineered exact formula exists for either game in this evidence set** (unlike, e.g., Game Dev Tycoon's well-known community-derived scoring formula, which was mistakenly cached alongside this material and has been explicitly excluded — see §0). All MGT1/MGT2 numeric claims (the ~12-month window, the ~5-year neglect threshold, the diminishing-returns plateau) are veteran-player estimates cross-corroborated across 2-3 independent sources each, not verified source code — labeled COMMUNITY INFERENCE throughout and never promoted to DEVELOPER/OFFICIAL tier even where a developer confirms the *existence* and *direction* of a rule without giving its exact constant.
- **The rival/player IP-growth-rate asymmetry at high difficulty** (§2.7) is stated as intentional by one BALANCE patch note but not independently measured by any player account found in this evidence set; flagged DESIGN INFERENCE/MEDIUM rather than confirmed.
- **MGT1's original (pre-2016-release, Kickstarter-era or early-EA) sequel design intent** was not separately investigated — only the shipped/patched behavior visible in the full retail-era patch-note dump and post-hoc Steam guides. If an earlier design document exists it was not in the cache and was not sought live (out of scope given the volume of directly-relevant shipped-mechanic evidence already available).
- Two of the originally-cached MGT1 assets (`guide_2646360175.html`, a gzip'd Steam guide fetch, and `mgt1_search_sequel.html`) both decompressed to Steam's own rate-limit/error page rather than content; the same guide ID was successfully reached live in this session via `WebFetch` for a different purpose but not re-scraped for its own IP-mechanics content beyond what search-snippet paraphrase surfaced (§2.1 store-copy fetch substituted for it). If more detail from that specific community wiki-style guide is wanted later, it would need a fresh, rate-limit-respecting fetch.
