# 1358-C5: relationship slice B RED r5 handback

Written 2026-10-02 at 00:13 CDT by the slice B test author, under 1358-F4 (rulings on review 1358-D). All line numbers below are r5 lines in the patched files.

## Deliverables

All four files sit in `/Users/zacheryspector/studio-scratch/1358-r2/`.

| File | sha256 |
|---|---|
| `1358-rel-sliceB-red-r5.patch` | `3ca4e3bc7aa08b9091fe604a6702e961745cf3a6ccb277ccd87fff35810894a1` |
| `1358-rel-sliceB-red-r5-classification.json` | `5d97e7411429b953e97a382acd328a878d3105594cd2e6b9bc10bbcf91d5db2d` |
| `1358-P-save43-producer.ts` | `04713f73d9a172f76302a860f3b24af925316155d5b504444de4af9ad6a698a3` (r4's file; r5 leaves it unchanged) |
| `1358-C5-handback.md` | this file; its hash is in the final report |

## Base and apply check

- The real HEAD moved to `85ffc6bc`. That docs commit sits on `975e72a1` and commits 1358-D and 1358-F4. At `b0809602`, `975e72a1` and `85ffc6bc`, the `src`, `bridge`, `ui`, `generated`, `tests` and `scripts` trees carry the same tree ids.
- The patch holds seven files:
  - the producer at E, changing blob `9b2b4a4` (r3) into r4's adopted version, byte for byte as r4 delivered it;
  - five new test files;
  - `tests/p14b5-relationships.test.ts` (blob `1225928`), with r4's family 4 title rename and r5's family 6c.
- `git apply --check --cached -v` passed at `85ffc6bc` and at `975e72a1`. Each check ran under a temporary index at `/Users/zacheryspector/studio-scratch/1358-r2/r5-apply-check.index`, and I removed that file by its literal path after each one.
- I checked that both preimage blobs already existed as loose objects before the check, so the check triggered no lazy fetch.
- The real worktree index kept its mtime (1790915576), its size (1418830 bytes) and its sha256 prefix (`41eb10be77db9d2d`). The object counts stayed at 4157 loose and 25372 packed.
- I started no vitest, tsc, node or tsx process. Python read the X2 JSON, the week-130 V42 fixture and X2's week-284 capture.

## Changes per 1358-F4 item

### Item 1: the Mentor gate

- **Withheld for a rival picture.** `tests/bridge-p14b10-relationship-labels.test.ts:315-333` replaces r4's :280-290.
  - The third picture's first take now names the first rival business.
  - `withoutRelease()` (:256-268) removes the picture from `releasedFilms`, from every studio history row that names it, from its career events and from its theatrical run.
  - Premises: no industry film and no `filmReleased` receipt names the picture, and `mentorEvidence` still names the director.
  - The leaf expects Mentor withheld.
- **Shown for the viewer's own picture.** :335-353 keeps r4's variant, which removes the picture from `releasedFilms` only, with the expectation flipped.
  - Mentor shows, and its evidence contains the picture's concept title (`titleOf()`, :270-276).
  - A premise checks that no other cohort title contains that title.

### Item 2(a): the consequences

- **D5.** `tests/p14b5-relationships.test.ts:1126-1153` adds family 6c, two leaves on the family 6b apparatus.
  - A Partners counterpart at Friends must settle for the player with the close-ties sentence.
  - A Partners pair at Enemies with three competitions loses to r01 with the at-odds sentence. This leaf passes at RED.
  - Both leaves stage through `withEdges`. `stage()` runs the Save43 validator, which refuses the two new keys at RED.
- **`financeUpcoming`.** Bridge :357-378.
  - After `fund()`, a free actor with no retirement record signs at week 150 for 52 weeks, and the world advances to 151.
  - A Partners edge at Friends links that actor to disclosedX.
  - The 52-week window's expiry row must name disclosedX.
- **`pairChemistry`.** `tests/p14b10-romance.test.ts:586-607`.
  - At Strained with Partners, sign must read +1, with exactly one reason the romance-free twin lacks, and that reason holds no digit.
  - At Enemies with conflict evidence, sign must read -1.

### Item 2(b): the non-triggers

Romance :548-582. The write is the release of a flop the pair shot together. It drops (d,l) from Acquaintances 45 to 40, which reads Strained.

At the write week:
- d retires, and that record is d's only retirement record;
- l's employment ends at one rival and starts at another.

The leaf expects the bond unchanged and `romanceStatus` 'partners'.

### Item 2(c): a decayed third-party bond

Romance :458-485.
- (l,z) holds an open bond with value 80, anchored at week 100.
- The leaf searches for the first week that value reads below `ROMANCE_EXIT_THRESHOLD`, which is 338 by the formula, and asserts that week comes before the crossing week, 401.
- A take on (d,l) must then form (d,l) at 401, and (l,z) must record `endedWeek` 338.

### Item 2(d): the twin edge

Romance :530-544 replaces r4's driver-kind and peak checks.
- Apart from `romance`, the touched edge must equal a twin edge staged with `romance: null` under the same touch.
- The leaf passes at RED, and its title carries "[control: passes at RED]".

### Item 3: the Save44 chain and the live route

`tests/p14b10-save-v44.test.ts` adds two leaves. Both read the capture through `genuineV43Raw()` (:90-100).
- :326-336 runs `migrateToLive(importSave(raw))`, then `makeSave`, then `validateSave`. It expects version 44, with empty fields on every edge.
- :338-343 checks that `migrateToV43(convertV43ToV44(v43))` deep-equals a fresh parse of the raw capture.

### Item 4: save-v44 :242

Now at :273, the bond's `endedWeek` is 120.

### Item 5: the mint precedes the recorded RED

- The GENUINE leaf (:149-165) and both item 3 leaves read the capture through `genuineV43Raw()`.
- When the file is absent, its premise message still names the producer.
- The classification gives each of the three leaves its post-mint first message.
- The third-party row records X2's observed `fails`.

### The adopted list

- **Budget.** `BASEWORLD_BUDGET_MS = 120_000` at romance :134.
- **Labels :137-154.** The read takes an edge held in `state.relationships`, so any write through the argument changes the serialized state (check 2, note 6).
- **Competitions-log :211-227.** I removed the `<=` check and its "strictly later" comment. The leaf now asserts:
  - no tick passes between P3a and P3b;
  - P3a's row comes first;
  - both rows carry P3a's week.
- **Titles.**
  - Labels :123 and :129 drop "[control: …]".
  - Romance :409 has a new title, and its pair starts one gain below the threshold, so the leaf checks formation.
- **Note 2.** save-v44 :163-164 strips the new fields and compares the output edges, then compares the output `screenplayShelving` with the input's.
- **Note 3.** save-v44 :169-184.
  - `sharedCompetitions` 3 sits on the V42 save.
  - The leaf runs `convertV42ToV43`, `convertV43ToV44` and `validateSaveV44`.
  - It asserts `hasConflictEvidence` true and `professionalRivalsEvidence` null. The latter comes through the module namespace (:81-82), so it adds no TS2305.
- **Note 4.** save-v44 :313 and :321.
- **Note 5.** save-v44 :191-198 hands each forged-log leaf edge 0's `firstSharedWeek` (8) and `lastEventWeek` (101). The downgrade log row at :312 uses `lastEventWeek`.
- **Note 7.** Romance :446 stages the earlier bond from week - 300 to week - 100, and :519 stages `endedWeek` at week - 200.
- **Note 9.** Bridge :164 requires both rows' `campaignDate` labels in the Rivals evidence.
- **Note 10.** Competitions-log :250-269.
  - Five later shared takes add 9 drivers, which pushes every competition driver out of the eight-driver `recent`.
  - `sharedCompetitions` stays 3, and the log must keep its three rows.
- **Note 11.** Each typeof guard names its constant:
  - romance :166-167, :209-210, :283, :302, :370, :412, :461-463, :493-494, :549 and :643;
  - save-v44 :120-123;
  - labels :64.

## Expected 1358-X3 results

The table assumes X2's week-284 capture sits at `tests/fixtures/p14/genuine-v43-pre-romance/`.

| File | Leaves | Failed | Passed |
|---|---|---|---|
| `tests/p14b10-romance.test.ts` | 37 | 32 | 5 |
| `tests/bridge-p14b10-relationship-labels.test.ts` | 14 | 11 | 3 |
| `tests/p14b10-competitions-log.test.ts` | 7 | 5 | 2 |
| `tests/p14b10-labels.test.ts` | 12 | 12 | 0 |
| `tests/p14b10-save-v44.test.ts` | 22 | 22 | 0 |
| `tests/p14b5-relationships.test.ts` | 53 | 4 | 49 |
| Total | 145 | 86 | 59 |

- **Romance passes:** :269, :514, :530, :633 and :673.
- **Bridge passes:** :167, :219 and :241.
- **Competitions-log passes:** :237 and :242.
- **p14b5 failures:** the three F6 exceptions X2 observed (two in family 2, one in family 5, each "expected [] to deeply equal [ 'studio-aca408ec-r01:film:6' ]") and the family 6c Friends leaf. That leaf fails with "expected 'declined' to be 'settled'".

The classification holds 97 rows. X2 observed the first message in 72 of them, and r5 changes no line before that message. The other 25 are derived by reading and are marked so. Those 25 are the leaves r5 changed or added, plus the three post-mint leaves.

## Type gates

The root gate is `tsc --noEmit -p tsconfig.json`. I expect it to exit 2 with exactly 17 errors:

| Code | Count | Positions |
|---|---|---|
| TS2305 | 10 | labels (47,10) and (48,10); romance (91,3), (91,24), (91,48), (91,77), (92,3), (92,27), (93,47) and (93,81) |
| TS2353 | 5 | romance (618,90), (636,90), (655,92), (656,91) and (667,126) |
| TS2578 | 2 | romance (676,7) and (678,7) |

- Against X2, the romance import errors move by +2, because the header grew two lines.
- The TS2353 and TS2578 errors move by +104.
- The labels positions do not move.

I expect the Bridge gate (`tsconfig.bridge.json`) and the UI gate to exit 0. The new Bridge imports (`financeUpcoming`, `currentTier`, `mentorEvidence`) all exist at HEAD.

## Uncertain items and findings

1. **Save-v44 :273 (item 4).**
   - Week 120 sits inside the week-130 save's recording interval, but after edge 0's `lastEventWeek`, 101.
   - The root law bounds driver weeks by `lastEventWeek` (`src/core/relationships.ts:597`). If the Save44 validator bounds bond weeks the same way, it refuses 120 before it checks the order, and `/romance|bond|order/i` still matches.
   - A week at or below 101 would close that gap. r5 keeps the ruled 120.
2. **Bridge :335-353 (item 1, the kept variant).**
   - The kept variant removes the picture from `releasedFilms` only. Its title then survives in the `filmReleased` history row, the theatrical run and the career events, but in neither `releasedFilms` nor `activeProductions`, where an unreleased picture of the viewer's own would sit. A GREEN that titles pictures from those two lists cannot cite it.
   - A GREEN that reads "public" from the history row passes this leaf without the own-picture rule.
   - The rival leaf removes every release record, so it has neither gap.
3. **Equal weeks (finding for production).** P3b is greenlit in P3a's week (competitions-log :224-226). Save44's "ascending weeks" must therefore admit equal weeks. The forged leaf at save-v44 :201-207 stages 101 and then 8, which still descends strictly.
4. **p14b5 staging (finding for production).** `stagedEdge()` and `stage()` (p14b5 :228 and :235) build edges without `competitions` or `romance`. Under a Save44 validator, `stage()` will need both fields. That work belongs to the slice B production sweep.
5. **Facts derived only by reading:**
   - the "NAME: expected …" format of every named guard;
   - the finance route: an actor listed at week 150, the cash after `fund()`, the 151-202 window, and fewer than 64 rows. X2's capture holds two retirement records in 284 weeks.
   - the title premise in the own-picture leaf;
   - the 6c decline;
   - the three post-mint messages.

   1358-X3 measures all of these.

## Hard rules

- I wrote nothing into the real repo, its index or its stash, and I wrote nothing under a link.
- The r5 edits live in the scratch tree `/Users/zacheryspector/studio-scratch/1358-r2/tree-r4`, committed as tag `slice-b-r5` (76a664c). The patch is `git diff base slice-b-r5`.
- r5 edits no production source.
