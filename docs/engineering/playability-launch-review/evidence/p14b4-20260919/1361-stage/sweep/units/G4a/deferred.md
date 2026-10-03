# Unit G4a deferred lines (1361-N)

Line numbers are HEAD's (the tree before my edits). `rows.json` gives each edited line's new number. P4, P5 and P7 are the probes in the plan's S10 section. "Pending note" means a short comment I added at an S4 insert that says the pin below it is unmeasured at Save45.

## A. Plan lines I did not edit (6)

| Line | Plan item | Reason |
|---|---|---|
| `contracts/v14-boundary-guards.contract.test.ts` :211, :250, :275, :300 | S9? 4, the loose `/cannot downgrade/` pins (1358-F10 ruling 3) | No edit unless the probe shows the P15 refusal newly masking their guard. Their inputs are V1 to V14 envelopes that `makeSaveV1` to `makeSaveV14` build from `legacyWorld`, plus the frozen builders on `inFlight`, a V37-era projection with the roots already stripped. No Save45 step runs on them, and the loose pattern would also match "migrateToV44: cannot downgrade or discard a recorded Power Ranking quarter". M2 never ran them (the suite fails in `beforeAll`), so P4 must confirm they pass. |
| `p14c2b-save-v36.test.ts` :83, :98 | S9? 2 | The first guard sits inside `liveEnvelopeV36(settled)` and `liveEnvelopeV36(atWindow)`, whose innermost step is now `convertV45ToV44` (H's helper, `p14c2b-fixtures.ts:69`). M2 stopped at the helper's old chain with "validateSaveV44: expected version 44" (`m2-core.txt:401546`, `:401565`), so no Save45 message exists. Prediction from the source: "migrateToV44: cannot downgrade or discard a recorded Power Ranking quarter", because the week-52 capture ticks to 92 and 98, past quarters 65, 78 and 91. I added a pending note to each comment block and left both pins. |

## B. Edited lines whose outcome only a run settles

### B1. S9 pins left open on inserted chains (5)

Each line has `convertV45ToV44` innermost and a pending note. The pin is still the 1358-N guard. P4 decides. If it shows the P15 message, the follow-up pin is `/^migrateToV44: cannot downgrade or discard a recorded Power Ranking quarter$/` and the comment moves to the S9 form with the cover named in the pending note.

| Line | Route read from the fixtures | Prediction | Cover of the masked guard |
|---|---|---|---|
| `p14c2rm-writer-continuation` :287 | `finishingWriter`: genesis route (`p13aGeneratedStudio`) to week 312 | P15 refusal | `p14b10-save-v44.test.ts:356` (romance) |
| `p14c3-cohort-transition` :288 | week-2600 capture to week 3283 (`cohortSetup`, `cohortChosen`) | P15 refusal | `p14b10-save-v44.test.ts:356` |
| `p14c3-dual-extensions` :180 | week-103 capture (`dualOrigin`) to week 468 | P15 refusal | `p14b10-save-v44.test.ts:356` |
| `p14c3-offmenu-extensions` :237 | week-103 capture to week 410 (`offmenuSettlement`) | P15 refusal | `p14b10-save-v44.test.ts:356` |
| `p14c3-profession-history` :119 | week-207 capture through week 208, a quarter week (13 x 16), in `actual207` and `step` | P15 refusal | `p14d1-rival-shelving-save-v43.test.ts:226` (shelving rejection count) |

The plan marks all five "unknown". Reading the fixture routes settles the weeks, but no run shows the message, so I did not pin.

### B2. Bare `.toThrow()` probes (2)

Both lines now call `validateSaveV45` and stay bare (1361-F7 ruling 9). P5 must print the thrown message of each case. A case that shows a guard other than its tampered field's gets a pinned pattern in a follow-up edit.

| Line | Cases behind it |
|---|---|
| `p14b1-t4-regressions.test.ts:86`, inside `rejects()` | At least the 15 M2 rows (`rows.json` ids 302 to 316), plus the retained tests that also call `rejects()` |
| `p14c2rm-writer-continuation.test.ts:379` | 32: 4 live callers times 8 malformed-authority cases |

### B3. Must-succeed chains (3)

| Line | Why it should pass | P4 must show |
|---|---|---|
| `contracts/v14-boundary-guards` :63 | `operationsStudio` uses `beginFoundingHistoricalControl`, which holds no industry, and `recordPowerRankingQuarter` returns the state unchanged while `hollywood` is null (`powerRankingArchive.ts:151`). The state also sits at week 2. | The chain returns, and `beforeAll` completes |
| `p06a-w1-release-authority` :406 | `foundedToReleaseReady('p06a-migrate-ready', true)` is the historical-control founding: no industry | The chain returns |
| `p12-starting-world` :55 | A fresh `beginFounding` state at week 0 | The chain returns, then `makeSaveV18` refuses with the pinned message |

### B4. S8 renames that keep their pattern (17)

P5 confirms each pattern still names the guard that fires. `validateSaveV45` hands the stripped state to the V44 chain (`save.ts:10970`), so each message should match Save44's.

`p06a` :459, :465. `p14c2b-save-v36` :137, :146, :158, :171 (M2 passed these, because `makeSave(tampered)` validates and throws the tampered field's guard first). `p14c2rm-writer-continuation` :236, :252, :263, :264, :313. `p14c3-canonical-rival-history` :245, :255. `p14c3-cohort-transition` :278. `p14c3-profession-history` :320, :340, :354.

### B5. Other open outcomes

- `p13b-s8-save-v27` :194. I pinned the P15 message on the strength of :206, which M2 measured. Both leaves build the same `natural` (`advanceTo(p13aGeneratedStudio(NATURAL_SEED), 20)`). M2 never reached :194, because the leaf stops at its version pin at :187. P4 should print it once.
- `contracts/v14-boundary-guards` :322 (S3). The leaf sits behind the suite failure at :63, so no message exists. The expected text is "validateSave: unknown saveVersion 46 (this build handles versions 1 through 45 only)" (`save.ts:5455-5457`).
- `p13b-s8-save-v27` :236 (S3). M2 measured only the old value. The new pattern follows the range text that `validateSave` throws (`save.ts:5455-5457`).

## C. Rows with no edit

The H-owned rows in my files (63 in `p14c2rm-writer-continuation`, 6 in `p14c3-canonical-rival-history`, 9 in `p14c3-cohort-transition`, 12 and 8 in the dual and off-menu files, 15 in `p14c3-profession-history`, 1 in `p14c2b-save-v36`) fail at H's helper pins. My renames sit behind those pins. The 2 retained `p14c3-canonical-rival-history` identities (L1, L2) belong to ruling 8 and get no leaf edit.
