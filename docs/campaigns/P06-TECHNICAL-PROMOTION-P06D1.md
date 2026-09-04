# P06 — Technical Promotion Ledger (P06D.1 lineage)

> **CURRENT STATUS — P06 OWNER ACCEPTED — CLOSED. Owner verdict: ACCEPTED / KEEP / CLOSED.**
> Acceptance date: 2026-09-04. Recorded 2026-09-04 19:51:49Z (21:51:49 CEST); the actual
> playtest time was not supplied. The Owner passed the combined P06/P07 journey on the preserved
> P07A candidate. The historical technical-promotion and pending-acceptance record below is
> retained; its replay requests are superseded. See the appended closeout for exact authority,
> accepted candidate, and all carried findings. No further P06 replay is required.

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

## Owner acceptance closeout — 2026-09-04

**P06: OWNER ACCEPTED — CLOSED. Owner verdict: ACCEPTED / KEEP / CLOSED.** The explicit
Owner ruling accepts the actual combined P06/P07 normal-player journey. Recording time is
2026-09-04 19:51:49Z (21:51:49 CEST); the Owner did not supply the playtest's clock time.
The technical promotion documented above preceded this acceptance and did not constitute it.
No new comparison, replay, gameplay change, candidate rebuild, main merge, or tag is implied.

### Exact accepted P06 lineage

| Authority | Exact value |
|---|---|
| Accepted P06 TypeScript product/source checkpoint | `050b98ee15d83883b209b4e0700a06e064a4eb60` |
| Last P06 executable TypeScript runtime change | `2240df8e7705fd5ecf84802f352818158380b4a4` |
| P06 TypeScript documentation-inclusive campaign seal | `72217af1fb580d9d3ae7557e2cdb280a6f29eb11` |
| P06 Unity product commit | `23c000a7e0aa1d61d3ad4a620b5dfea7d7ac0bde` |
| P06 Unity clean build/campaign commit | `b0c780bb7abd1c81e1c30b59391b7effb86f490f` |
| Preserved clean P06D.1 candidate | `~/Desktop/P06D1-Clean-Comparison-Candidate-050b98e-23c000a/` |
| P06D.1 executable SHA256 | `7c2213ba732d761c3f7cb23ab28f7ce92edc11105e6ea7ec50dce14bca19e9c3` |
| P06D.1 Assembly-CSharp SHA256 | `33f2e0e84ca5cd5005c4c03d53984c192fa990fe51833007b9bc5ad8b97cdbca` |
| P06D.1 engine SHA256 | `c00cbfd5de82b7d18767458bc66edfcbc966f81c6096f36e67392b22f6f09a42` |
| P06 schema ID | `sha256:71529afdcb8e5cf645ab136efb9685256da0039e86d989bfab97b7b2cc5d9a8b` |
| P06 generated C# contract SHA256 | `cfa72ed9d4bf4262b7691a97446fbefaa8ea830cd7d2bf2e2fb3514368a3e7a9` |
| P06 protocol / projection / save | `4 / 14 / V16` |

The accepted product checkpoint ends with a contract test; it is not the last runtime-source
change. Its four successors through the documentation seal change only documentation. The
Unity clean build commit adds one two-line EditMode-test `.cs.meta` after the Unity product
commit. These identities are verified by Git ancestry and diffs, the preserved
`PRODUCT-IDENTITY.json`, and `player/build-manifest.json`. The generated contract manifest at
the accepted TypeScript checkpoint distinguishes the schema ID from the C# artifact hash;
the earlier record's combined "Generated contract/schema" wording above is historical.

### Actual accepted playtest and candidate

The Owner played `~/Desktop/P07A-Owner-Candidate-a6f4f82-c4c65db/`, executable SHA256
`c3372eb566304a14e599811d3e9872759c134aa703a150e17a25cc02e92ef813`, and accepted both P06
and P07. This is acceptance of the inherited P06D.1 lineage through that combined candidate;
it does not claim the Owner separately replayed the older P06D.1 binary. The exact P07
product, build-bound, technical-seal, and current campaign authorities are recorded separately
in [the acceptance receipt](P07-OWNER-ACCEPTANCE-RECEIPT.md) and [CURRENT-BEST](../../CURRENT-BEST.md).

The lot and grouped rail were understandable; Scripts, Making Movies, Post & Release, and
In Theaters were useful. The physical Production/Post building worked without rail priming.
Release Ready held safely; the Owner committed the exact title without advancing time; the
next authoritative week released it. Rail, cards, workspaces, Talent, Back, Locate, focus,
Menu, and Quit remained usable. Correct-film Details, separate Critics/Audience/Business,
projected/final and gross/revenue distinctions, Save/Load, and completed-run inspection passed
in the combined journey. No universal Movie Quality score or P08 gameplay appeared.

### Findings disposition at acceptance

The following register retains the P06A/P06B/P06C/P06D/P06D.1 findings. Acceptance does not
retroactively turn failed, blocked, or absent evidence into passing evidence. A future-package
classification preserves an option; it does not authorize implementation.

| Finding and evidence | Disposition | Closeout treatment |
|---|---|---|
| P06A F1 waiting glyph rendered as tofu (`P06A-KNOWN-FINDINGS.md`) | FIXED | Font-safe badge shipped and recaptured in P06A. |
| P06A F2 / P06B N2 wrapped picture described as Shooting | FIXED | P06C Priority Zero changed the guidance owner at `2240df8e7705fd5ecf84802f352818158380b4a4`; P06D's `050b98ee15d83883b209b4e0700a06e064a4eb60` pins rail/card/workspace/guidance agreement. The original record misidentified the copy surface; the reproduced defect and fix are preserved in `P06C-FINAL-REPORT.md`. |
| P06A F3 release commitment remains memo-owned; optional dedicated world commitment surface | DEFERRED NON-BLOCKER | Existing exact-title commitment is functional and Owner-accepted. No new commitment surface or ceding of the memo is claimed. |
| P06A F4 locked-display HID blocker | SUPERSEDED | Later P06B/P06D.1 real HID and the combined Owner journey provide the required usable-session evidence; the original blocked run remains recorded. |
| P06B N1 long-title clipping | FIXED | P06B ellipsis shipped; P06D preserves full-title access and exact-ID binding. |
| P06B N3 transient bridge-refresh capture; stale Assembly hash caught in its review | FIXED | Clean capture replaced the transient proof; that report's Assembly hash was corrected before its seal. |
| P06B focus ring not verifiable from static frames | FIXED | P06D introduced distinct selection/focus rings and real HID evidence. |
| P06C rail cap/overflow reachability, title anatomy, and missing mixed-slate hero | FIXED | P06D's one scroll owner, title-first rows, and supplemental hero/scale fixtures closed these items. |
| Production workspace OPEN-panel screenshot absent (`PRODUCTION-WORKSPACE-EVIDENCE.md` in P06D.1) | DEFERRED NON-BLOCKER | Code/USS/EditMode and building select/focus evidence remain; no screenshot is invented. The actual Owner journey now closes the human usability gate without a replay request. |
| Capture attempts encountered an occluded IMGUI open affordance and stale P05 fixture | DEFERRED NON-BLOCKER | Preserve these historical capture limitations. No fixture or layout repair is claimed; the Owner accepted independently usable buildings/workspaces on the combined candidate. |
| P06D hostile observation: People footer wording | DEFERRED NON-BLOCKER | Existing Casting-building Talent route remains; the Owner accepted Talent access. |
| P06D hostile observation: mouse click gives both selection and focus | DEFERRED NON-BLOCKER | Distinct ring meanings and non-activating Tab traversal remain proven; accepted usability does not require changing click behavior. |
| P06D HID's five state-gated BLOCKED steps | SUPERSEDED | The combined representative Owner journey passes the acceptance gate. Historical BLOCKED steps stay BLOCKED; no claim that every earlier fixture covered every action. |
| Original P06D reviewer did not rerun EditMode headlessly | SUPERSEDED | The preserved clean-build 762/762 floor, later P06D.1 provenance review, and Owner acceptance stand. No habitual rerun is needed for documentation. |
| P06D.1 review's index counts, six proof-sidecar index entries, and HID binary identity nits | FIXED | The preserved final report records their corrections; 22 indexed image hashes and all 22 sidecars were checked again read-only at closeout. |
| Casting entry STATUS sentence lacks an authoritative snapshot field | FUTURE PACKAGE | Do not fabricate a sentence from assumptions; preserve `P06D-FINAL-REPORT.md`'s explicit omission. |
| Monetary facts absent from P06 rail/card DTOs | FUTURE PACKAGE | No amounts were fabricated. A later authorized producer change is required before rendering additional facts. |
| Broader building-card/workspace grammar and optional guidance de-emphasis | FUTURE PACKAGE | Preserve remaining `P06B-NEXT-WAVES-BACKLOG.md` / `P06C-NEXT-WAVES-BACKLOG.md` scope; delivered Production CTA/Back/blocker/focus improvements do not claim every proposed convergence. |
| People return-week/per-person Locate, broader roster detail | FUTURE PACKAGE | Presence remains bounded; exact return timing needs an authoritative field. |
| Additional lot-work portrayal and per-stage/multi-stage presenter work | FUTURE PACKAGE | Existing named people and work truth remain; no new simulation or location authority. |
| Optional runway/burn clarity and existing economic-warning scope concerns | FUTURE PACKAGE | Preserve the economic backlog and open macro residuals; no retune or unrelated warning fix was performed. |
| Wider controller/text-size/reduced-motion coverage | FUTURE PACKAGE | Retain the earlier accessibility backlog; successful viewport/keyboard/Owner proofs do not assert unperformed coverage. |
| Casting latch/exact-project defensive hardening proposed in P06B W3 | FUTURE PACKAGE | Preserve the proposal as a follow-up source audit; this closeout does not certify an unexamined repair or reopen accepted gameplay. |
| Rail profiling and possible virtualization for 25+ rows | FUTURE PACKAGE | `P06D-RAIL-PERFORMANCE.md` remains inspection-derived, O(total rows), with no profiler result claimed. |

### Preservation and handoff

P06B, P06C, original P06D, and P06D.1 rollback candidates remain preserved. Their executable
hashes were checked without modifying the candidates: P06B
`130a13a0f19e688fc2bb4b8ba4bd9282430b3d62ecd105f3ff7ad4651d534d49`, P06C
`2c235c390ae7fc8dce28ae62ab7c8e0b8479cac3706523c4200f04bec9f6474a`, original P06D
`076e8c62906de5d7c643f86938439c978523db46e2445a89cd63da0f057d0aee`, and P06D.1 as above.
The clean P06D.1 executable, engine, and Assembly hashes match their manifest; its 22 indexed
image hashes match. Historical candidate README/pending-status files remain untouched.

P06 and P07 are closed. Next: P08A planning/reconciliation through
[the final P07 → P08 factual handoff](../engineering/P07-TO-P08-FINAL-AUTHORITY-HANDOFF.md).
P08 production implementation is **NOT YET AUTHORIZED**. This documentation closeout owns no
Unity/player/engine/bridge/supervisor/proof processes; no gameplay build or proof matrix was launched.
Current repository/process verification is in the closeout acceptance receipt. The lessons are
[P06 implementation and Owner playtest lessons](../engineering/P06-IMPLEMENTATION-AND-OWNER-PLAYTEST-LESSONS-LEARNED.md).
