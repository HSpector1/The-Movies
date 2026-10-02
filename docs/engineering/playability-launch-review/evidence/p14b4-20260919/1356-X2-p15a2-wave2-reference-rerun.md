# 1356-X2: parent reference re-run of the P15A.2 slice 2a RED r3

**Script.** `/Users/zacheryspector/studio-scratch/1356-x2/run-1356-X2.sh`. It is 1356-X's script with the RED r3 patch,
run alone in the heavy lane on a fresh scratch tree from repo HEAD af315499. Patches:
- RED r3 [1356-p15a2-wave2-red-r3.patch](1356-stage/1356-p15a2-wave2-red-r3.patch) (sha256 95ac4605…, from
  [1356-C3](1356-C3-p15a2-wave2-red-r3-handback.md));
- the unchanged reference (83cb2a59…).

| Run | Result | Expected |
|---|---|---|
| RED, 2 files | 69 failed, 2 passed (71) | 69 RED, 2 controls pass |
| Reference, 2 files | 70 passed, 1 failed (71) | 70 pass; the capture leaf fails |
| Harness alone, reference | 1 passed; `campaignMs` 65,404 under the 300,000 ms ceiling | passes |

- The one reference failure is `rank-root-migration-genuine-below-step-capture`: "RED: no genuine capture below the P15
  save step". That capture mints at the last Save43 writer.
- `rank-validate-cadence-boundary` now passes, with cases (a) to (d) running; r3 changed cases (a) and (d). The
  other leaves r3 changed also pass at the reference in the full-file run: `rank-adapter-pre-origin`,
  `rank-step-cadence-founded-midgame-none-at-origin-plus-one` and `rank-fixed-cost-player-zero-while-founding`.
- The harness proof line matches 1356-X except for timings: 6,240 weeks, 480 records, archive 725,757 bytes,
  `makeSaveMs` 825, `validateSaveMs` 317.

**Next.** [1356-F4](1356-F4-parent-ruling-on-1356-C3.md) rules on r3's founding route. A confirmation review follows.
