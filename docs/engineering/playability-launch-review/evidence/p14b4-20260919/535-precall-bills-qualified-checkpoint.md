# 535 — Qualified checkpoint: exact pre-call bills (517 + 526) on fixed source

2026-09-20. Claude Code parent. Corrected candidate replay source
`d5f8cb7171f602df76b2115819e7e63320b84b4f7e602fb5811ad57984b1eb22` (2797 lines), protected
patch (record-check capture over the source paths, production only, +70/−13)
`add13897e0d5346b5e3b81bbc10c840d0114462f1fff521cc0335f6e4e8b51b5`, base HEAD
`df0533c6fac18ec5027231500d80050d800fd3b5`. No test, fixture, cap, timeout, validator,
owner, kernel, discovery, save, projection or schema file changed; the 40 pinned test,
kernel and owner files are byte-identical before and after (parent pin check).

## Chain of authority for this slice

515 (two independent READ-ONLY analyses; adopted direction C2+C3+C4) → 516 (independent
direction review REFINE, adopted with refinements; no new test needed, 507/508 are the
baselines) → 517 (ONE sim-core writer, frozen `65cf1bf1…c697e`) → 518 (independent
actual-delta review REFINE: one rT6 width correction; every other term KEEP; both 112-node
lump bounds recounted with 40+ nodes headroom) → 526 (ONE sim-core correction, one hunk)
→ 527 (bounded re-review KEEP). Record-only items carried: 518 defects 2–3, 527 defect 4
(rT7 stage-count conditionality, pre-existing), citation shifts.

## Fixed-source verification — serial, one process at a time, all fixedSource:true

Pre-correction candidate `65cf1bf1…` (protected patch `44e54ca7…4745`): 519 Ready 17 PASS +
sole stale FAIL, 520 Started 28 PASS, 521 typecheck PASS, 522 adjacent 203 PASS, 523 bridge
sole OLD TS2353, 524 facts/lookup 7 PASS (15:56:51–16:00:28Z); 525 probes measured every
517 prediction exactly. Retained as evidence; superseded by the corrected candidate below.

Corrected candidate `d5f8cb71…` (protected patch `add13897…`), every start/end identity and
interval mechanically verified, complete raw output and JSON read:

| Check | UTC interval | Actual result | Baseline 507–512 on 505 |
| --- | --- | --- | --- |
| 528 six Ready files | 16:28:33.610–16:28:50.082 | 17 PASS; sole original stale-after-release FAIL at `tests/p14b4-ready-replay-stale-target.test.ts:234` (`expected 'workLimit' to be 'commandRefused'`) | identical |
| 529 six Started files | 16:28:50.317–16:29:07.445 | 28 PASS (incl. the 504 control and the 259 single-Post-exit case) | identical |
| 530 root + UI typecheck | 16:29:07.638–16:30:35.439 | PASS | identical |
| 531 seventeen adjacent/caller files | 16:30:46.577–16:31:25.584 | 203 PASS | identical |
| 532 bridge types | 16:31:25.770–16:31:56.091 | exit 2; sole OLD future-P2 kind TS2353 at `tests/bridge-p14b4-cast-class.test.ts(364,20)` | identical |
| 533 facts + employment lookup | 16:31:56.284–16:32:04.081 | 7 PASS | identical |

255 focused passes; no new failure or diagnostic; not a whole-suite pass.

## Measured effect (534, passive probes, exact restoration verified)

| Frame | 505 (514) | 526 (534) |
| --- | ---: | ---: |
| 2 retained Development bill | 11193 | 6861 |
| 3 single-early rT7 bill | 9587 | 8099 |
| 4 single-early rT6 bill | 8905 | 8578 |
| 8 single Post exit bill | not reached | 5668 |
| 1 / 5 / 6 / 7 bills | 315 / 850 / 7948 / 576 | identical |
| first-take producer work | 189256 | 182925 (kernel headroom 17,075) |
| stale cut | 199994 inside week-8 `sweepBill` | 197631 at the week-8 owner reservation, requesting 5765, 2369 left |

Every bill matched its pre-stated prediction; unchanged arms carry a constant `used`
delta, so their payment sequences are byte-identical. The original 276 first-take test with
its shared 200000 kernel assertion passes. The original 302 stale route remains RED at the
recorded boundary; nothing was weakened and no fit is claimed. Measured saving to the
refusal ≈ 9.9k on this fixture (6543 − 212 to the week-8 entry, 3566 on the week-8 bill).

## Standing items

- OWNER / Current Ops decision item (515 §6, unchanged): under 176 as written and the
  existing tariffs the 302 stale route is not shown to fit 200000; remaining LIKELY ≈ 22k
  after this slice. Options recorded there; the parent has not touched caps, tariffs, tests
  or the control.
- Next bounded lawful reductions, all unadopted until measured: C1 calculator execution
  structure (≈ 8–11k, bills byte-identical required, diffuse review), C5 static-domain
  widths (≈ 2–2.5k), C6 fixed-schema hold copy price (≈ 1.5k), C7 already-sorted detection
  (≈ 1.5k); C9/C10 need Owner authority.
- No Unity, native, save, projection or Owner-acceptance claim. Unity backlog updated.
