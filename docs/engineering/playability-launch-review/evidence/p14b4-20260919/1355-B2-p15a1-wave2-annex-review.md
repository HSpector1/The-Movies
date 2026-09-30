<!-- 1355-B2: verbatim final text of the second independent charter reviewer (contract-auditor, with the P15 annex supplied), saved by the parent on arrival. -->
# Independent review 1355-B2

**Verdict: REFINE**

Scope: `1355-A-p15a1-wave2-charter.md` as amended by `1355-F`/`1355-F2`, checked against the P15 builder annex and package law at `2a7ff0d9` (supplied this pass, unavailable to `1355-B`), `P15-RECONCILIATION-02` §7.2-§7.3, `src/core/sharedMarket.ts`, `tests/p15a1-shared-market.test.ts`, `tests/p15a1-shared-market-harness.test.ts`. `1355-B`'s fact-8 findings are re-affirmed, not re-litigated. Nothing here questions the formula, D-1323-1, or the execution order.

## Blocking defects (required before RED staging proceeds — matches 1355-F2's own gate)

**1. No fixture proves the all-or-none partial-commit invariant for the two-subject case.**
Annex C.1 (lines 91-92) and P15 §12.1 (lines 430-433): "if any subject's P07 preflight/application or any cross-root invariant fails, commit none of it." Annex K.1 (line 733) names `market-second-p07-failure` exactly for this: first subject validates, second P07 application fails, and the authoritative state must contain **no** result/assessment/exposure/event/debit from **either** subject, including the one that already succeeded. `1355-A`'s §7 RED list (lines 227-256) has 18 items; none is this test. RED #5 (`market-due-set-mismatch-fails-closed`, line 235) fails a **forged due set before reception starts** — a different failure mode. The design argument for atomicity ("`tick()` returns one state or throws," §3.1 line 71, reaffirmed by `1355-F` Amendment 2) is architecturally plausible and 1355-B independently verified the pattern exists for the P06A witness, but nobody has shown it holds when the throw originates **inside** the market-factor seam on the *second* of two already-processed subjects — the exact scenario where a candidate object built incrementally across two release sites (player at `tick.ts:575-612`, rival at `hollywoodTick.ts:387`) could leak a partial write if either seam mutates shared state before both complete. This is the single highest-value untested claim in the charter; it is a required RED item, not a design defect, and does not need an Owner question — it is a routine implementation-completeness gap inside the already-authorized contract.

**2. `1355-A`'s persisted shape and RED list do not yet reflect `1355-F2`'s domain-sequence/phase ruling.**
`1355-A` §3.3 (line 108-109) states "no per-row phase fields," which `1355-F2` ruling 3 explicitly supersedes: every P15 native row — including each market assessment — now stores `p15DomainSequence`, `phaseId`, `phaseOrdinal`, `phaseOrderVersion` from `src/core/p15Phases.ts` v1. `1355-F2` itself says "RED staging for P15A.1 Wave 2 waits for 1355-B2" (lines 62-63), so this is expected, not a surprise — but concretely: the persisted `MarketAssessment` shape (§3.3) needs the four new fields added; RED #12 (`market-root-append-canonical`), #14 (`market-validator-reconciles`), and #16 (`market-old-save`) need extension to assert the allocator's `next` state, cross-root distinctness, and phase-triple-vs-table-version validation (annex D.7, L.6 invariant 10). None of this is present in the current §7 list. Separately, annex K.1's `market-phase-catalogue-upgrade` (line 748) — proving a later phase-table version doesn't reorder or reinterpret old rows — has **no** proposed leaf anywhere, even after `1355-F2` created the exact versioned mechanism (`p15Phases.ts`) this fixture is meant to exercise. Proposed leaf: `market-phase-version-immutable` — write assessments under table v1; add a v2 table entry for a new `phaseId`; assert existing rows keep their original `phaseOrdinal`/`phaseOrderVersion` unchanged and still validate; assert a row whose triple doesn't match its declared version's table entry refuses by name (this is exactly what `1355-F2` ruling 4's "matches the table entry of its `phaseOrderVersion`" requires but nothing currently tests).

## Check 1 — the batch-manifest adaptation: lawful choice, with one gap already covered above

Going through the annex's named batch-manifest purposes against `1355-A`'s substitute (film bijection §3.4.3 + law reconciliation §3.4.4, both reading the flat `assessments` array plus live `h.films`/`releasedFilms`):

- **Exact-once membership** — MET WITH EVIDENCE. The bijection check (line 118-120: "every simulated release... has exactly one assessment... and no assessment lacks its film") gives the same guarantee the annex's per-chunk "each exact release/studio/genre/contribution once" wanted, verified against the live release records rather than a separate manifest copy.
- **Count/root/ordered-chain digest integrity** — adapted, arguably strengthened: law reconciliation (line 121-123) re-derives `pressure`/`factor`/both terms/`inputDigest`/`reasons` from scratch and requires deep equality, which is a harder-to-forge check than matching a stored digest (a tamperer must reconstruct the whole formula consistently, not just a hash). Lawful substitute.
- **Bounded aggregates / no repeated co-batch list / linear bytes** — MET WITH EVIDENCE, proven twice: pure-law level (`market-large-batch-linear-storage`, `tests/p15a1-shared-market.test.ts:752-786`, 32 vs 512 members, top-level **and** nested `sourceReleaseIds` bounded, byte ceiling) and Wave 2's RED #18 (persisted-linear, line 254-255).
- **Idempotent commit receipt / no duplicated fact on retry** — NOT IMPLEMENTED, and `1355-A` never states why. Given `tick()` runs exactly once per week from the normal game loop with no visible external retry surface distinct from re-running the whole tick from a reloaded save (which K5 and RED #13 already cover), this is likely a non-issue in this architecture — but the charter should say so explicitly rather than silently dropping the annex requirement. Non-blocking; documentation, not a code gap.
- **Audit paging** — correctly deferred to Wave 3 (annex E.2); not a Wave 2 defect.

**Disposition:** this is a **lawful implementation choice** for every purpose except the partial-commit proof (Blocking 1 above), consistent with the annex's own §U instruction that builders must adapt its conceptual sketches to the accepted source, and with `1355-A`'s own candor in flagging the adaptation for review (§3.3: "review rules on it") rather than asserting silent compliance. No Owner question is needed; D-1323-1 already authorized "the planned P15A.1 implementation sequence," and this is routine implementation detail inside that authorization.

## Check 2 answer — is `1355-A`'s §5 G1 the annex's "run 6,240 weeks before Wave 2" gate? **No.**

Annex Wave 1 (line 684) requires a 6,240-week **expected/hostile harness on the pure law alone**, unintegrated. That gate is satisfied by the already-landed `tests/p15a1-shared-market-harness.test.ts` (verified: normal stream of 9 rivals over 6,240 weeks plus a hostile stream, both pure `assessBatch`/`reduceExposures`, no RNG) — separate from `1355-A`'s own §5 G1, which is a **Wave-2-specific live-economy calibration measurement** over real seeded campaign routes (`p13a-core-causal-01`, `rivalFixture`) to tune thresholds before the factor enters the live economy. Neither the annex nor `1355-A` cross-references this distinction explicitly; worth one clarifying line in the charter, but not a defect — `1346-L`'s own "Wave 1 not closed" note (cited by `1355-A` §1) already correctly gates on "broad recorded core and UI gates," not on this harness proof, which appears to already exist.

## Non-blocking notes

- `market-batch-manifest-corrupt` (K.1) cannot exist as literally named (no manifest to corrupt); its purpose is covered by RED #5 + #14. Recommend the charter say so explicitly rather than leaving the name unaddressed.
- `market-batch-duplicate-retry` and `market-duplicate-command`: no receipt/command-replay concept exists in this architecture at the market layer. Recommend one sentence stating why (no retry surface above `tick()`) rather than silent omission from the RED list.
- `market-cancel-before-release`: 1355-B's own source audit (line 17) found **no active-production cancellation path distinct from shelving** in the current economy — a rival's Release-Ready-bound picture cannot currently be cancelled pre-release at all. If that's accurate, the fixture is vacuously satisfied; the charter should say this rather than leave the K.1 row silently unaddressed.
- `market-legacy-order-adapter`: out of scope for any slice that doesn't do a merged cross-domain query; P15A.1 Wave 2 does none. Should be named as "deferred to the first merged-query slice," not dropped from the ledger.
- K.2 "P08 History links to the assessment but does not recompute it": `1355-A`'s choice to reuse `releaseId` as the shared key between the assessment and the `filmReleased` history row (§3.3, line 106-107) satisfies this without inventing a duplicate foreign key — MET WITH EVIDENCE, a reasonable adaptation, not a gap.
- `1355-F2`'s end-of-tick sequencing rule for the ranking record presumes a per-tick ranking event; P15A.2's own design is quarterly-cadence, so that clause should read as conditional ("when a ranking record is produced this tick"). Cosmetic, not a P15A.1 blocker, and outside this review's primary object.

## K.1 fixture map (23 fixtures)

| Fixture | Disposition |
|---|---|
| market-one-player-one-rival | Wave 1 (landed) + Wave 2 RED #6 |
| market-owner-swap | Wave 1 (landed) + Wave 2 RED #9 |
| market-order-reversal | Wave 1 (landed); law reused unchanged, no separate Wave 2 leaf needed |
| market-same-week-batch | Wave 1 (landed) + Wave 2 RED #6/#7 |
| market-large-batch-linear-storage | Wave 1 (landed) + Wave 2 RED #18 |
| market-batch-manifest-corrupt | Adapted into RED #5 + #14 (no literal manifest); see Check 1 |
| market-second-p07-failure | **MISSING — Blocking 1** |
| market-batch-duplicate-retry | Adapted (K5 + RED #13); non-blocking documentation gap |
| market-batch-save-replay | Wave 2 RED #13 |
| market-id-swap | Wave 1 (landed); reused unchanged |
| market-different-genre | Wave 1 (landed) |
| market-cancel-before-release | MISSING; likely unreachable state — non-blocking, needs a stated rationale |
| market-delay-across-window | Wave 3 (preview) |
| market-decay-boundaries | Wave 1 (landed) |
| market-undisclosed-project | Wave 3 (DTO/UI) |
| market-stale-intent | Wave 3 (preview/cursor) |
| market-old-save | Wave 2 RED #16 |
| market-inflight-save | Wave 2 RED #13 |
| market-duplicate-command | MISSING; non-blocking, needs a stated rationale |
| market-missing-source | Wave 2 RED #5 + #14 |
| market-observer-neutral | Wave 3 (query layer) |
| market-phase-catalogue-upgrade | **MISSING — Blocking 2** (leaf proposed above) |
| market-legacy-order-adapter | Deferred to first merged-query slice; not P15A.1 Wave 2 |

## Next action

Parent amends `1355-A` §3.3/§7 to (a) add the `market-second-p07-failure` RED item, (b) add `p15DomainSequence`/phase-triple fields and validation to the persisted shape and RED #12/#14/#16, (c) add the `market-phase-version-immutable` leaf, and (d) state explicit rationale for the four non-blocking K.1 rows named above. No Owner question is raised by this review. On those amendments landing, RED staging may proceed per `1355-F2`.

**Files read this pass** (absolute paths): `/private/tmp/claude-501/-Users-zacheryspector-The-Movies-headless-program/fda2743f-a621-4100-9f06-e0c38e36295b/scratchpad/P15-annex-2a7ff0d9.md`, `.../P15-package-2a7ff0d9.md`, `.../P15-RECONCILIATION-02-c5b52b4d.md`; `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1355-A-p15a1-wave2-charter.md`, `1355-B-p15a1-wave2-charter-review.md`, `1355-F-parent-p15a1-wave2-charter-adoption.md`, `1355-F2-parent-p15-domain-sequence-ruling.md`; `/Users/zacheryspector/The-Movies-headless-program/src/core/sharedMarket.ts`; `/Users/zacheryspector/The-Movies-headless-program/tests/p15a1-shared-market.test.ts`, `tests/p15a1-shared-market-harness.test.ts` (header/setup only).
