# P06 — Technical Promotion Ledger (P06D.1 lineage)

**Recorded: 2026-09-04 by Owner ruling (P06D.2 handoff).**

## P06 TECHNICAL STATUS: TECHNICALLY PROMOTED — P06D.1 LINEAGE
## P06 OWNER STATUS: OWNER GAMEPLAY ACCEPTANCE PENDING

> This is a **technical promotion only**. It is **NOT** Owner gameplay acceptance. Do **not** write
> OWNER ACCEPTED, CLOSED, GOLDEN, or FINAL PRODUCT ACCEPTED anywhere until the Owner actually plays
> (`P06-FUTURE-OWNER-ACCEPTANCE.md`). The P06D.1 lineage was chosen as the **technical winner** of the
> P06B/P06C/P06D comparison lineage based on the clean re-seal; the Owner did not have time to run the
> comparison/playtest.

## Promoted lineage (fast-forward only; no squash/rewrite/merge-to-main; no Golden tag)

| Repo | Campaign branch | Was | Now (P06D.1 tip) | Push |
|---|---|---|---|---|
| TypeScript (`hspector-github`) | `campaign/living-lot-ts` | `04b67ec` | **`72217af1fb580d9d3ae7557e2cdb280a6f29eb11`** | `04b67ec..72217af` FF, local==remote |
| Unity (`origin`) | `campaign/living-lot-client` | `18a2887` | **`b0c780bb7abd1c81e1c30b59391b7effb86f490f`** | `18a2887..b0c780b` FF, local==remote |

`main` (`c902a704`) untouched. No merge commit, no rebase, no force-push.

## Authoritative P06D.1 identities
- TS product commit: `050b98ee15d83883b209b4e0700a06e064a4eb60`
- TS documentation/handoff tip (= campaign tip): `72217af1fb580d9d3ae7557e2cdb280a6f29eb11`
- Unity product commit: `23c000a7e0aa1d61d3ad4a620b5dfea7d7ac0bde`
- Unity branch tip / clean build source (= campaign tip): `b0c780bb7abd1c81e1c30b59391b7effb86f490f`
- Player exe: `7c2213ba732d761c3f7cb23ab28f7ce92edc11105e6ea7ec50dce14bca19e9c3`
- Engine bundle: `c00cbfd5de82b7d18767458bc66edfcbc966f81c6096f36e67392b22f6f09a42`
- Assembly-CSharp: `33f2e0e84ca5cd5005c4c03d53984c192fa990fe51833007b9bc5ad8b97cdbca`
- Generated contract/schema: `71529afdcb8e5cf645ab136efb9685256da0039e86d989bfab97b7b2cc5d9a8b` · protocol 4 · projection 14 · save V16

## Why technical promotion was allowed
- Clean re-seal (built from clean committed trees; `unityDirty=false`, `typescriptDirty=false`; engine bundle reproduced byte-exact)
- TypeScript floor **4905** passed
- Unity EditMode **762**
- canonical Post/Release Oracle **6/6**
- supplemental UX oracle **2/2**
- real-profile-copy journey **25/25**
- real owner-input **HID PASS**
- **Retina/fullscreen** true physical-native proof (3456×2234)
- clean provenance (product vs documentation SHAs separated; sidecars hash-verified)
- fresh reviewer **15/15 PASS, 0 blockers**

## Known non-blocker (Owner should inspect at eventual playtest)
- **Production-workspace open-panel pixel capture remains absent.** The behavior (persistent action strip,
  one primary CTA, blocker/danger callout, forward-outranks-Back) is **code + USS + EditMode proven** and the
  building is **world/HID select+focus reachable** on the clean binary. Only the *open-panel screenshot* is
  missing (IMGUI/People-strip-occluded open affordance + a stale P05 fixture). The Owner should look at this
  live during acceptance.

## Rollback candidates — preserved (do not delete; hashes verified pre- and post-promotion)
- P06B `~/Desktop/P06B-Owner-Candidate-48c419d-18a2887/` — exe `130a13a0…`
- P06C `~/Desktop/P06C-Comparison-Candidate-d66b7ab-438feb2/` — exe `2c235c39…`
- Original P06D `~/Desktop/P06D-Comparison-Candidate-050b98e-23c000a/` — exe `076e8c62…`
- P06D.1 `~/Desktop/P06D1-Clean-Comparison-Candidate-050b98e-23c000a/` — exe `7c2213ba…`

## Next
Owner performs `P06-FUTURE-OWNER-ACCEPTANCE.md` (~10–15 min) when available → ACCEPT P06 or report the exact
failing step. P07 readiness/reconnaissance/charter proceeds now on the promoted campaign tips
(`docs/engineering/CODEX-P07A-*`). No P07 gameplay until its readiness gate proves the package is ready and
all P06 boundaries remain intact.
