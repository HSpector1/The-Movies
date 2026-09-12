# R3 provenance and evidence boundaries

[Visual index](README.md). This continues the existing reviewer session and **docs/uiux-whole-game-review-01**, whose remote/local starting head was **e564d236407cb3616ebc597713d5b9fa7d60b38a**. No duplicate assignment or reviewer fleet was created. The previous audit, R1 and R2 remain intact. Only a new focused design directory and the current visual entry point change.

## Exactly what was read and reused

The completed Opus package was fetched from GitHub at **6b2a659bcaa1e577c8d90a10aae390e3855a2985**, not a floating branch. Retrieved bytes were verified against their Git blob identities. Read: [00-INDEX](https://github.com/HSpector1/The-Movies/blob/6b2a659bcaa1e577c8d90a10aae390e3855a2985/docs/operations/uiux-opus-r2-independent-review/00-INDEX.md), [DESIGN](https://github.com/HSpector1/The-Movies/blob/6b2a659bcaa1e577c8d90a10aae390e3855a2985/docs/operations/uiux-opus-r2-independent-review/DESIGN.md), [HANDOFF](https://github.com/HSpector1/The-Movies/blob/6b2a659bcaa1e577c8d90a10aae390e3855a2985/docs/operations/uiux-opus-r2-independent-review/HANDOFF-TO-CODEX.md), [RESEARCH-ORIGINAL-GAME](https://github.com/HSpector1/The-Movies/blob/6b2a659bcaa1e577c8d90a10aae390e3855a2985/docs/operations/uiux-opus-r2-independent-review/RESEARCH-ORIGINAL-GAME.md), [CHECKER](https://github.com/HSpector1/The-Movies/blob/6b2a659bcaa1e577c8d90a10aae390e3855a2985/docs/operations/uiux-opus-r2-independent-review/CHECKER.md), plus source/design files and existing comparisons. Inspected original manual and Steam crops, K1 and CMP-01/05/06; rendered the exact previous app locally for the matched Backlot rail and known-issue reproduction. No new broad survey, video sampling or game playtest was conducted.

The user's focused request controls scope. The supplied Future Ops review was read as a report of findings to reproduce; its claims were not assumed to be native defects or broader authorization. The original [whole-game assignment](https://github.com/HSpector1/The-Movies/blob/9e03e4754c569538bf47d95e27d493ce6d28e5d1/docs/operations/UIUX-WHOLE-GAME-INDEPENDENT-REVIEW-BRIEF.md) and [visual follow-up](https://github.com/HSpector1/The-Movies/blob/c9ad874a7c8d6010d80ef87313e21ea9f016f99a/docs/operations/UIUX-VISUAL-DESIGN-SECOND-PASS-BRIEF.md) remain the historical assignment context; this pass is deliberately narrower.

| Reused element | Disposition |
| --- | --- |
| Backlot design.css → backlot.css, data.js, portraits.js, lot.js, lot-r2.svg | Verbatim selective copies at the exact Opus commit. Prior review ownership retained in comments. No merge of its branch. |
| app.js → backlot.js | Selected helper/rendering prefix; no original input/render bootstrap. Removed the unsafe Production Office→Production Post alias; allow exact fictional record lookup beyond the visible early roster. The new controller overrides picture/person views and navigation. |
| World / broader art | Same original Opus lot and provisional portrait drawings, warm material and type direction. No new lot, portrait or broad UI direction. |
| Stage artwork | Six newly authored original SVGs. All geometry/material gradients editable; no Lionhead pixels or fonts copied into the game mock. |
| Original manual pp.6–7 crop | Exact existing Opus reference excerpt, kept in `reference/` and shown only in the research comparison. Attribution remains Lionhead *The Movies* (2005) manual. Not a runtime game asset or a claim of redistribution rights for production. |
| Backlot comparison crop | Newly rendered from exact retrieved Opus app, at 1440×900 with the same world/fixture. No current source was overwritten. |
| R2 facts | Existing fictional identities, phases, candidate values and Mara/Celia employment examples retained. Other people's missing facts remain unavailable. Additional busy IDs/titles exercise the same categorical states only. |

[File-level upstream hashes and copy status](source-reuse.json). Unbacked decorative rank badges, studio rank, cash delta, season label and event pins are omitted from the new canvas rather than presented as real production data. Their untouched illustrative fields remain in the verbatim upstream fixture; they are not displayed or made interactive. The ordinary year ruler, current week/year and static cash fixture remain for art continuity.

## Four evidence classes

**Observed reference stills:** compact framed stage objects and left/right tracking are visible in the supplied/published captures. A still does not establish hover, click, drag, animation or return semantics.

**Published research / source findings:** Opus's O-03 documents stage-image swaps and its manual references; O-04 documents person-card interaction. Those are reused published claims, not new firsthand gameplay observations by this reviewer. Existing accepted-source seams come from the pinned original audit and R2 routing. This pass makes no new claim about currently delivered native builds.

**Design inference:** the hybrid card, visible title/state, filtering and library separation adapt those references to STUDIO's existing discrete states. They are recommendations for review, not evidence of implementation or task-success improvement.

**Observed prototype evidence:** the author and one reused bounded read-only checker actually rendered and navigated isolated local HTML in fresh Chrome contexts with HTTP(S) blocked. [Checks and limits](REVIEW.md). No game launch, native input, real campaign/Profile, bridge or personal browser profile was used. No native game validation was performed.
