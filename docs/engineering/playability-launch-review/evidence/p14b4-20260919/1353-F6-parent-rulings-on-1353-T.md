# 1353-F6: parent rulings on 1353-T (the P15C Legacy retune)

[1353-T](1353-T-p15c-legacy-tuning-amendment.md) retunes `artistic-voice` and `commercial-engine`, which G-P found
held by no studio on either seed ([1359-X4](1359-X4-p15c-gp-probe-results.md),
[1359-F5](1359-F5-parent-response-to-1359-X4.md)). It proposes critic 60, a hit line of 50 and a share floor of 20,
and bumps the definition to `campaign-legacy/v2`. It leaves four decisions to the parent (its §6.1, §6.3, §7.2 and
§7.3).

The parent reproduced 1353-T's tables on 2026-10-02 with
[1353-T-holders.py](1353-stage/t/1353-T-holders.py): both `check:` lines print, and every row of §2.2, §4 and §6.1
matches. The record, its scripts and the probe outputs now sit in [1353-stage/t/](1353-stage/t/), byte-identical to
the scratch copies 1353-T §9 hashes.

## Rulings

1. **The hit line is 49, not 50.** 1353-T's other two values stand: critic 60 and share floor 20.
   - P15A.1 Wave 2 multiplies every gross by a shared-market factor, and no record fixes whether it lands before or
     after P15C Wave 2. The line has to hold under either order.
   - At 50, 1353-T §6.1's first-order estimate leaves `commercial-engine` unheld: r06 reaches 83 of the 84 hits it
     needs. G-P would then fail on the tree that ships, and the definition would bump a second time.
   - The parent measured the pool's rate at each line on seed-b with `dist.json` and the 1355-G1 factors, share floor
     20:

     | Hit line | Grosses | Rival releases at the line | Floor ÷ pool rate | Holders (margin) |
     |---|---|---:|---:|---|
     | 50 | as run | 321 of 1,952 (16.4%) | 1.22 | r06 +9 |
     | 50 | times the 1355-G1 factors | 267 (13.7%) | 1.46 | none: r06 −1 |
     | **49** | as run | 353 (18.1%) | 1.11 | r06 +15, r07 +3 |
     | **49** | times the 1355-G1 factors | 297 (15.2%) | 1.31 | r06 +6 |

   - Under the factors, a line of 49 asks more of a holder than 50 asks on today's tree (1.31 against 1.22). Without
     them it still asks 1.11 times the pool's rate, and the count floor of 5 binds below 25 releases.
   - The hit line gives up no anchor. v1 took 90 from a pooled percentile (1353-A :192), and 1353-T's 50 rests on
     roundness. The critic line keeps its shipped anchor, the critic band "hit" from 60 (`receptionVerdict.ts:34`).
   - The comment at `tuning.ts:1047` states the measure and cites 1353-T and this record, for example: "a hit grosses
     at least 49% of baseMarketValue; 18.1% of seed-b's rival releases as run, 15.2% under shared-market pressure
     (1353-T; 1353-F6)".
   - 1353-T §6.1's contingency becomes the value, and nothing stays in reserve. A later G-P that finds an archetype
     held by none in every seed returns §5.5 to retuning under 1359-A §9.
2. **The definition becomes `campaign-legacy/v2`, and `LEGACY_DEFINITIONS` keeps v1.**
   - `tuning.ts:1040-1041` bumps the definition on any change. 1359-A §5.1 says "A v2 adds an entry and leaves v1
     untouched", and 1359-F says "`campaign-legacy/v1` stays reachable by the validator after any retune".
   - v1 is landed law: Wave 1 landed it ([1353-L](1353-L-p15c1-wave1-landing.md)), and the landed p15c1 tests pin
     it. No save will store a v1 manifest, because G-P gates Wave 2 production and v1 fails G-P. The entry costs one
     frozen row, and it gives the era guard a real retune to test: the RED leaf
     `legacy-old-law-fixture-v1-validates-after-retune` (r5 :1829) now retunes v1 to v2, the case 1359-F's old-law
     fixture describes.
   - Dropping v1 would leave the era guard a single entry and make C11 invent an older era. The parent keeps the
     smaller change.
3. **P15C Wave 2 RED r6 carries the test consequences.** One author revises
   [r5](1359-stage/1359-p15c-wave2-red-r5.patch) to r6:
   - C11 `legacy-definition-era-guard`: the live pin reads `campaign-legacy/v2` with 60, 49 and 20. v1's fifteen
     literals stay as the frozen v1 entry, and the after-retune leaf retunes v1 to v2.
   - Any other r5 leaf that restates 70, 90 or 25 as live values, or places a fixture against them, moves the same
     way. The author lists each with its old and new value and checks that every fixture stays on its side of 60, 49
     and 20.
   - `tests/p15c1-campaign-legacy.test.ts` (Wave 1, landed) moves in the same RED, so its pins fail at the RED commit
     and pass at production:
     - the title (:1), the restated literals (:313, :317, :318), the definition (:336) and the bounded-terms leaf
       (:1894, :1898, :1899);
     - the comments at :382, :629-630 and :642-643, rewritten to the new arithmetic;
     - the fixture at `(HIT + 5)%` of `BMV`, which becomes 54%.
   - The producer ([1359-X3](1359-X3-p15c-producer-r4-dry-run.md), r4) changes only if a captured value depends on
     the three keys or the definition string. The author says which, with the lines.
   - The classification declares each moved pin with its RED outcome and first message. Review 1359-D5 confirms r6
     against this ruling before the P15C mint and the recorded RED.
4. **P15C Wave 2 production carries the values.** It applies 1353-T §7.1 with 49 at `:1047`, and §7.2: law :1 and
   :72 name v2, and `LEGACY_DEFINITIONS` holds a frozen entry for each of v1 and v2. The values do not land on their
   own before Wave 2.
5. **G-P runs again before production, at least twice.**
   - First, once the recorded broad gates free the heavy lane: the unchanged 1359-GP probe on a scratch tree at HEAD
     with 1353-T §7.1 (49 at `:1047`) and §7.2 applied, on 1359-X4's two seeds, after a 20-week smoke. The parent
     records it as 1353-X4.
   - Expected: `artistic-voice` held by 0 and 2 (r06, r07); `commercial-engine` by 0 and 2 (r06, r07); every other
     row as 1359-X4. A different count means the tree or 1353-T's reimplementation differs, and the parent stops.
   - Again before P15C Wave 2 production on any tree that carries P15A.1 Wave 2 production or a 1357-Q1 change
     (1359-F5 ruling 4).
6. **The Owner playtest brief carries 1353-T §6.3.** The idle player releases nothing, so no player distribution backs
   these values. The brief asks the Owner to judge both archetypes in play.
7. **Review 1353-U** is independent and read-only. It works 1353-T §8's checklist, with item 7 replaced by a check of
   ruling 1's arithmetic and reasons, and items 10-11 read with rulings 1-4.

## Order

1. 1353-U now, while the recorded broad gates run.
2. After the gates: G-P on v2 (ruling 5, first run), recorded as 1353-X4.
3. P15C RED r6 after 1353-U's verdict, then 1359-D5.
4. The P15C mint and recorded RED keep their place, after slice B's Save44 production.
