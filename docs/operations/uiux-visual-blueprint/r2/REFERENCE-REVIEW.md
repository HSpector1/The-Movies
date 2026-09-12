# R2 — what the Lionhead references change

**Owner-directed revision · proposed design / fictional data · not implemented.** [Visual index](README.md).

The Owner rejected the [R1 studio-desk proposal](https://github.com/HSpector1/The-Movies/blob/1c01a4146d513724b6ec3e601bf7be100db1a671/docs/operations/uiux-visual-blueprint/README.md) because it did not sufficiently support finding employees or continuously tracking scripts and films. That criticism changes the default interaction composition. R1 made people a destination and let a large inspector displace studio awareness. R2 places people at the left edge, the picture lifecycle at the right edge, and compact inspection within the lot. Detailed comparison and commitment reviews remain deliberate layers.

## What is visible in the supplied screenshots

These observations are about the supplied stills, not a playtest or claims about every state of the original game. The full reference register below identifies each supplied image by its displayed time; no private source path or borrowed image asset is redistributed.

| Supplied image IDs / time on 2026-08-17 | Directly visible | Consequence for R2 |
| --- | --- | --- |
| R10 11:40:24; R15 11:38:24; R17 11:38:00; R21 11:37:21; R23 11:37:10; R24 11:34:52; R25 11:34:31 | Left portrait/status strip and right film/script strip coexist with the world, from close views to a developed studio overview. | Two stable sides for two questions: who is working/available, and where each picture has reached. Neither disappears for compact inspection. |
| R15 11:38:24; R25 11:34:31 | Several small related information groups surround one selected person. Identity remains central; work/ability/other facts are separate. | A compact exact-person card with optional fact groups, plus a full dossier when needed. No new mood/addiction/relationship simulation is inferred for STUDIO. |
| R10 11:40:24; R17 11:38:00; R19 11:37:40 | Casting work is attached to the Casting building, with named areas for director, lead roles and company/work progress. | A local Casting work-area overlay opens the current person, candidate comparison or retained draft. It does not authorize drop-to-hire or a new assignment rule. |
| R14 11:39:16; R06 12:00:20; R05 12:00:39; R25 11:34:31 | Recruitment choices are presented on a building footprint. A tutorial annotation describes a held mouse gesture; a destination highlights. | Keep the spatial relationship and a visible next destination. STUDIO commitments continue through existing cost/authority reviews; dragging is not implemented in R2. |
| R01 12:02:00; R02 12:01:45; R03 12:01:16; R05 12:00:39; R09 11:59:47; R13 11:39:30 | A corner tool expands into a scrollable facilities menu. Rows show price/ownership; a nearby explanation describes the pointed item. | Build owns a corner catalogue. Cost, footprint and explanation precede placement; the catalogue keeps the world visible. |
| R04 12:00:56; R07 12:00:04 | Footprints/boundaries and movement arrows are on the proposed building position. | Put validity and the uncommitted tool in the world; keep visible Cancel and consequence review. |
| R08 11:59:35; R11 11:59:19; R12 11:40:03; R23 11:37:10 | Small corner controls expand near the tool; the lot remains visible. R12 shows landscape selection. | A corner Build/Studio/Lot cluster replaces R1’s permanent full-width page navigation. Landscape gameplay is not added. |
| R16 11:38:09 | A substantial awards panel overlays the lot, with both rails still present. | Large views can be legitimate for a focused task. Preserve peripheral tracking and exact return; do not turn every inspection into a full sheet. |
| R18 11:37:50; R20 11:37:29; R24 11:34:52 | Warnings and local activity are attached to relevant world subjects; rails remain available. | State, cause and exact destination precede a command. Normal waiting is distinct from action required. |
| R22 11:36:44 | An unidentified park/zoo landscape with no relevant studio interface visible. | Excluded as evidence of The Movies’ button behavior. |

R19 contains image-search controls; R02 contains video-player controls; several images contain publisher watermarks/captions. Those surrounding controls are not treated as game UI. The screenshots establish visual relationships, not timing, hitboxes or hidden command behavior.

## Narrow check against the already published original-game source

The [official manual](https://store.steampowered.com/manual/7900/), printed pp.6–9, confirms that staff groups can be cycled, a card click locates a person, and movie cards change their stage representation. It documents delayed hover information, secondary-click expansion and the lower-corner construction entry. Cash leads to finances. These controls support the Owner’s reading of the stills. No original game was launched, and no additional genre survey was conducted.

The original’s held drag gesture is documented but is not copied into this proposal. R2 uses click/keyboard selection, local review and the existing commitment owner. Its persistent pinned card also stays open after pointer departure, whereas a transient hover preview closes. This is a deliberate accessibility/context adaptation, with a visible Back/More equivalent.

## Accepted STUDIO sources: what exists, what changes

The accepted Unity snapshot already has a [People rail](https://github.com/HSpector1/project-studio-unity-visual-spike/blob/6420a4d91de52db1bffca2988f2c995672e7d53e/Assets/Studio/Runtime/Presentation/StudioPeopleRailHud.cs#L10-L98). It is right-aligned below the film rail, is suppressed for cards/inspection/workspaces, and opens exact Profiles. Its [contract](https://github.com/HSpector1/project-studio-unity-visual-spike/blob/6420a4d91de52db1bffca2988f2c995672e7d53e/Assets/Studio/Runtime/Infrastructure/StudioPeopleRailContracts.cs#L7-L78) caps visible rows at five and explicitly says presence counts are not employee counts. R1 should have given this awareness problem greater weight.

The [accepted production rail](https://github.com/HSpector1/project-studio-unity-visual-spike/blob/6420a4d91de52db1bffca2988f2c995672e7d53e/Assets/Studio/Runtime/Presentation/StudioProductionRailHud.cs#L290-L360) already combines development, production and active released-run projections; [one scroll owner renders grouped sections](https://github.com/HSpector1/project-studio-unity-visual-spike/blob/6420a4d91de52db1bffca2988f2c995672e7d53e/Assets/Studio/Runtime/Presentation/StudioProductionRailHud.cs#L482-L540). R2 preserves that ownership and proposes a more legible persistent presentation. Completed-run records are in an explicitly separate Film library group in this mock; they are never described as active productions or located at a current set.

The historical P06C matrix’s deferred people-strip and pre-P07 release restrictions describe its old phase. They are not current execution authority and do not veto the Owner’s present design direction. Reuse the published [world-first doctrine](https://github.com/HSpector1/The-Movies/blob/e3f51086f070fa06447be11a17e0673f2cbb11ac/docs/design/CODEX-WORLD-FIRST-INTERACTION-BLUEPRINT-01.md) and [comparator research](https://github.com/HSpector1/The-Movies/blob/fe4d22ce60505ccce27543d7201c69d46d42a368/docs/operations/UIUX-PLAYABILITY-COMPARATOR-RESEARCH.md); do not invent a competing game architecture.

**Design inference:** move employee discovery to the left, keep both rails during local inspection, connect selection to a world marker, prioritize local work areas and add role/search controls. **Read-model requirement:** a complete employee list must join authoritative roster membership to public presence and exact Profile/locatable-body records. Missing presence is not unemployment; presence totals are not employment totals. Names and row positions cannot substitute for IDs. R2’s 12 employees, seven active projects and one library record are only self-contained fictional fixtures.

Every new illustration is original SVG/CSS. No Lionhead portrait, frame, icon, manual page or supplied screenshot is used as a prototype asset. The visual target borrows placement and interaction relationships; the rich personal-needs, ranking and economic systems visible in the references are not newly authorized features.
