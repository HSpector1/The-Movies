# 1358-F11: parent rulings on the follow-up units after 1358-X6 and the targeted run 1358-X7t

[1358-X6](1358-X6-sweep-r1-dry-run.md)'s message probe found 15 sites where Save44's romance refusal now fires first.
Two follow-up units turned the measurements into edits:
- F1: `p14p3-directing-promises`, `p14p4p5-opportunities`, `p14p4p5-screenplay-status`, `p14r3-save-v41` and
  `p13b-s8-save-v27`;
- F2: the p14c3 chain files, `p14c2b-save-v36`, `p14c2s-scientist-retirement`, `p14c2rm-writer-continuation` and
  `p14c3-save-v38`.

The parent's targeted run 1358-X7t covered their 13 files and probe 2. It ran on 2026-10-02 from 06:27:50 to 06:42:06
CDT; its outputs are in [1358-stage/sweep-r2/x7t/](1358-stage/sweep-r2/x7t/).
- Type gates: 0 errors.
- Generator checks: pass.
- Slice B files: only the three row 6 exceptions fail.
- The 13 files: 5 failures. Three are retained 1348-I identities: C20, D07 and D18. The other two are D13 and D12,
  ruled below.

## What the probes settled

- **Own-era cover holds for every guard the romance refusal now masks.**
  - V41: one staged rival release on a V41 copy of the genuine week-110 capture.
  - V39: that capture downgraded once, and Q03's direct call.
  - V36 extension: the genuine V37 writer pair converted to V36.
  - V27: the engine's rival lab admission on a genuine V26 fixture lifted to V27.
  - The Scientist guard: the genuine V37 week-670 capture.

  Each reaches its own guard's message.
- **The S5 helpers are needed and exact.** At `p14c3-save-v38:87`, Q04 and D14 each compared state holds 24 or 30
  edges with no log row and no track. The comparison is equal once the two empty fields are added.
- **The `screenplayShelved` receipt guard** (`src/core/save.ts:10739-10740`) had lost its only first-guard tests: J7,
  X5 and O3 now meet the romance refusal first.
  - The one leaf aimed at it, `p14d1-rival-shelving-save-v43:251`, was vacuous. Its receipt's `conceptId: 'x'` failed
    the V43 validator at `hollywoodValidation.ts:539` before the guard ran, and `/shelv/i` hid that.
  - With the business's real concept id, it reaches the receipt guard.
- **D13 and D12.** Nine states on the player route hold the P3 Director promise, among them `lifecycleAttached()` at
  week 248. Each holds 19 to 21 romance tracks, and the lawful V40 chain refuses every one of them.

## Rulings

1. **D13 and D12 feed the frozen builders a genuine pre-Save44 capture.**
   - The captures: E's `1221-p4p5-outgoing-capture/director-bound-week52` for D13 and `director-waived-week61` for D12.
     Both are Save39, both hold the promise kind the leaf needs, and both carry no romance or log field.
   - Each reaches V40 through production's `convertV39ToV40` alone, and nothing is stripped (1358-F9 ruling 2). The
     builder assertions are unchanged.
   - The live chain on each route state keeps an S9 assertion pinning the measured refusal.
   - D12's builder loop runs once, on the capture.
2. **`p14d1-rival-shelving-save-v43:251` becomes the receipt guard's own-era cover.** It takes the real concept id and
   pins `/^migrateToV42: cannot downgrade or discard a screenplayShelved receipt$/`. F2 edits it, with leave, in G1's
   file.
3. **The staged own-era inputs for V41 and V27 stand, under 1358-F10 ruling 5.** Each writes only what the engine's
   own code writes, X7t showed both to be valid saves, and nothing is stripped.
4. **G5-new-6** (D14 :438, now :482) pins the measured romance refusal in the S9 form.
5. **A comment that named the masked V39 cover** (`p14b5-relationships:1396`) now names Q11's own-era assertion. It is
   a comment-only parent edit.
6. **The week-93 control** (`p14d1-rival-shelving`, 1358-F10 ruling 9): the genuine input is lifted through
   `convertV43ToV44`. The probe in 1358-X8 confirms that the candidate's week-93 state holds no log row and no track.
7. **The S5 drafts of G3 and G6 land.** For G6's four p14p4p5 files, 1358-M2 showed each diff is exactly the two
   empty fields. The fifth file uses the same capture. G3's eight are decided in 1358-X8.

## Closure findings (no edit in this sweep)

- The p14r3 movement leaf never reaches the V41 guard; `validateSaveV41`'s reconciliation check refuses its input
  first.
- On a valid save, the V41 movement arm (`save.ts:10647`) and the V27 finance arm cannot fire.
- The V36 `extensionUsed` branch has no own-era input that holds a used extension. This is 1344-K's open item.
- N-0468's cases 1-3 and 18 refuse at a record or project guard before the rule their names describe. The pins
  record what they measure.
- The loose-regex leaves that Save43 already masked (1358-F10 ruling 3) now pin the romance refusal. Their older
  guards keep the covers named in their comments.

## Next

1358-X8 is the full dry run of revision r2. It started 2026-10-02 at 06:58:49 CDT, with the sweep patch at sha256
e1f93665… (154 test files, +1,039/-676) and probe 4. The review and the landing follow it.
