# 1370-AR: 1363 R8 rival-recovery source and 14-file kit landed on the branch

Parent: Claude (Fable 5.1), 2026-10-10 20:25–20:55 CDT. Predecessor: `1bc39fab4fca9e55228c48c8e390f68d182d2674` (`HEAD:src` `13880d9b0ba72aff5d4c5bcf5d12fe682c5de554`, unchanged since AP). The containing commit is the first production source change of the Claude continuation; resolve it with Git.

## What landed

The reviewed R8 recovery source and the guarded 14-file kit (ten test postimages, four genuine fixtures), transplanted whole-file from the frozen `S/1368-save46-swept-proposal-r8/tree` and the explicit landing kit by the R8 specialist with **zero adaptations** (`specialist-package/KIT-INVENTORY.json`: 188 files, 163 modified, 25 added; 1,589 R8 source pins verified). Patch identity: `PATCH-IDENTITY.txt`. Live save version becomes **46** (`LIVE_SAVE_VERSION = 46`), with the recovery's V45→V46 migration tests (`tests/p14d2-save46-migration.test.ts`) in the kit.

Order deviation, recorded: the approved plan lands R8 only after the 1363 ledger is causally admitted. Under the Owner's 2026-10-10 orders ("see how far you can get in game development", "Owner approval not needed for anything, just go make it happen") the parent landed R8 on the wip branch first. The pre-R8 tree remains at `1bc39fab`/`6510c971` for any ledger route; the conditional `main` promotion still waits for the documented 1363/1367-O2 closure conditions. This is not ledger admission.

## Landing gate (production worktree, Node v20.20.2, `GIT_OPTIONAL_LOCKS=0`, formal capture env vars; `landing-gate/`)

| Gate | Result |
| --- | --- |
| `git apply --index` of the specialist patch on 1bc39fab | clean; 188 entries staged |
| MANIFEST sha256 verification of every landed file | 188 ok / 0 mismatch / 0 missing |
| `tsc --noEmit -p tsconfig.json` | exit 0 (72 s) |
| `tsc -p ui/tsconfig.json --noEmit` | exit 0 (106 s) |
| `tsc -p tsconfig.bridge.json` | exit 0 (58 s) |
| `generate-bridge-contract.ts --check`, `…-fixtures.ts --check` | exit 0, 0 (nothing regenerated) |
| Ten kit test files (`kit10.vitest.json`) | **147 / 147 pass** (794 s, single worker) |
| Nine recovery-own files (`recovery-own.vitest.json`) | 210 pass / 1 fail / 2 skip / 2 todo |
| Three files whose diagnostics changed under R8 (`changed3.vitest.json`) | 60 pass / 23 fail |
| Five R8-touched UI test files, `--project ui` (`ui5.vitest.json`) | **45 / 45 pass** |

## Attribution of the 24 landing-gate failures against the pre-R8 baseline (`../1370-ar-claude-takeover-baseline-20261010/core-6510c971-failures.txt`)

All 24 are **SAME identity** (same file and full test name) as failures already present on 6510c971; **0 NEW, 0 GONE**:

- `p14b1-trust-chooser.test.ts` test 6 (1): pre-existing.
- `bridge-p14b5-relationships.test.ts` family 12 R-D5 natural-chain ledger (5): pre-existing identities; four messages **CHANGED** under R8 (ledger lengths now 18 / 41 / 43 / 42 against expected 40 / 48 / 48 / 48). These are the known 40→18 and 48→42 adoption/p13a ledger boundaries of the 1363 investigation; carried as unexplained, not attributed to a cause.
- `p14b4-rival-seating-preference.test.ts` (17): pre-existing `UNEXECUTED natural premise` and witness failures; one control's message **CHANGED** (`ok(s.witness)` → `expect(first.cast)…`), undiagnosed.
- `p14c3-save-v38.test.ts` A01/A02 (1): pre-existing; message **CHANGED** because it embeds the live save version (46 instead of 45), the same class as C20 in 1361-M3.

The specialist's seven-batch run over 167 files (`specialist-tests/`, `specialist-package/REPORT.md` §5) attributes the full per-file union, 2,450 pass / 113 fail / 3 skip / 8 todo, as 109 SAME / 4 CHANGED / 0 NEW / 0 GONE against the same baseline, identical to Codex's independent pairing in `../1370-as-claude-review-and-draft-backup/reviews/r8-results/REPORT.md`.

## Claim limits

Focused landing gate only: the broad core, UI and d16 suites, contracts, migration/save/replay routes and the 1363-V measurement matrix were not run here. The post-landing full core run on the new HEAD is the next predecessor baseline. Timing numbers were taken while five implementation specialists shared the machine. No recorded heavy lane, no lane lock, no source guards. The 113 pre-existing failures remain failures; nothing is relabeled green.
