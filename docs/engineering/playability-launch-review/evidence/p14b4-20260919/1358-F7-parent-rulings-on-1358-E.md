# 1358-F7: parent rulings on 1358-E (slice B production)

[1358-E](1358-E-rel-sliceB-production-handback.md) stages slice B's production in four cumulative steps, written by
reading against RED r5 and checked against r6. The parent copied the four patches into
[1358-stage/](1358-stage/), byte-identical to the scratch files:

| Step | Patch | sha256 (first 16) |
|---|---|---|
| 1, Save44 | `1358-rel-sliceB-production-step1.patch` | a17b2a4e52bfd4b7 |
| 2, the competitions log and Professional Rivals | `1358-rel-sliceB-production-step2.patch` | 76d4427977da1a95 |
| 3, romance | `1358-rel-sliceB-production-step3.patch` | 74ffa04594610fd1 |
| 4, projection 57 | `1358-rel-sliceB-production-step4.patch` | df0c52a33813ff7c |

The generator emulator, the pin grep and the numbered rows sit in [1358-stage/prod-gen/](1358-stage/prod-gen/).

## Rulings on the decisions

1. **D1, runtime lenience on a missing `romance`: accepted.**
   - The types refuse the omission, and the Save44 validator refuses it in any saved state.
   - Engine writes always carry the field (`newEdge`), so only hand-staged test edges lack it.
   - The sweep adds both fields to p14b5's `stagedEdge` and `stage()` (1358-F5 ruling 3).
2. **D2 and D3: accepted.**
3. **D4, no edge-relative week bound in the Save44 validator: accepted.** It matches 1358-F6 ruling 1, which withdraws
   F5's `endedWeek` ≤ `lastEventWeek` bound.

## Rulings on the open questions

4. **Q1, eligibility timing: the writer's reading stands.** The romance write runs after the take's own drivers
   (1358-F §2), so the Friends gate reads the tier those drivers left.
5. **Q2, a Partners pair below Friends: the writer's reading stands.**
   - 1347-F's adopted eligibility note gates growth on Friends or above. It governs every gain, before and after
     formation, and 1358-F's Reading B keeps a pair's own bond from blocking it.
   - 1347-A's non-trigger bullet ("no romance rule reads … the friendship tier after formation") governs the bond's
     life: no tier change ends a bond or moves its ending.
   - So a Partners pair below Friends keeps its bond through shared takes, which re-anchor the track. It gains again
     once it returns to Friends.
6. **Q3 and Q4: accepted.**
   - Only a shared take resets the anchor (1347-A:51).
   - A third party's ending is recorded at either person's formation check (1347-A:56). The check runs on a write
     that can gain.
7. **Q5, the new copy: adopted as provisional.** The P14B playtest brief lists it for the Owner's sign-off:
   - the reason 'they are partners';
   - the expiry sentence;
   - the Mentor sentence, and its fallback for a picture with no concept title on record;
   - the Rivals sentence.
8. **Q6: accepted.** Romance reads null where the retirement-dated tier is unavailable, like the tier. Labels do not
   depend on the tier.

## Next

1. **The RED lands first.**
   - The parent checks r7 (1358-F6) and commits it.
   - The recorded mint 1358-P follows, then the recorded RED.
2. **Dry run 1358-X5.**
   - Each step patch applies on the RED commit with the minted capture.
   - Each run covers the six RED files and the root, UI and Bridge type gates. Step 4 adds
     `npm run generate:bridge-contract -- --check`.
   - The expected reds are 1358-E's "What each step leaves red". After step 4, only rows 56 to 58 stay red, until
     the sweep.
3. **Review 1358-J (independent).**
   - It reads the four steps against the law, 1358-E's row map, these rulings and 1358-F6 ruling 2's Mentor-gate
     item.
   - It may run in parallel with the dry run and lists what the dry run must show.
4. **The fallout measurement and sweep plan.**
   - The parent runs broad core and UI on a scratch tree with step 4 applied, recorded as 1358-M2.
   - The Save44 and projection-57 sweep plan follows from that run, recorded as 1358-N, on the 1344-N model. The
     1358-E pin grep is its candidate list, and `acceptedEvidence` comes first.
