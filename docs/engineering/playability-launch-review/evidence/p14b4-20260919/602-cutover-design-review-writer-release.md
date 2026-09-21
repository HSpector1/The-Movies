# 602 — Coordinated cutover: design note (600-A), test reconciliation (600-T, published 39a64ef0) and review (600-B, RELEASE WITH CONDITIONS); parent rulings; writer released

2026-09-21. Claude Code parent. Record 600 §3 steps 2–4 are done; this record adopts the review's
conditions, adds the parent's rulings, and releases the ONE production writer (600-W) on the
reviewed design. Source identity unchanged at `48a43511` before the writer; HEAD `39a64ef0`.

## Dispatch and artifacts (archived verbatim; hashes verified against the workflow journal)

| Artifact | Bytes | SHA256 | Agent |
| --- | ---: | --- | --- |
| `600-A-design-note.md` (sim-core READ-ONLY, 764 lines) | 76169 | `1ff47c3a3b8049959b58c3034a783731df0854ce487e0d6b01eac384163a0ae0` | a08954d374f9a67aa |
| `600-T-report.md` (test-author) | 20183 | `44d8a548372767486e9af1dd2e751f3c2e287f28e6034f92eab4f188e7a7ae9c` | ad2285c279343f9f9 (Opus override on the profile's model, per-call, profile unchanged) |
| `600-B-review.md` (contract-auditor) | 35791 | `1dbc76920f948da94275b741046a3ce397272f36e51fc0d9e373c975dcecb609` | a67df060f0fb2b933 (Opus override, per-call) |

Workflows `wf_fce5bc7b-626` (600-T ∥ 600-A, two specialists, 686748 tokens, 203 tool uses) and
`wf_017b6652-1a0` (600-B alone, 381946 tokens, 112 tool uses). The 600-T diff is the 601 patch
(published with 39a64ef0); the test-author's own `600-T.patch` (tracked diff only) is
`abf28d675d7b36764d7257ea0bd21e66724f0bb9a2d5aef1289ae689aa4fbefd`.

## 600-T (published 39a64ef0; 601 baseline 25 failed / 20 passed / 3 todo on unchanged source)

Fresh pins 3→4 only (`p14bf2-acting-discipline` :98, :120, :133, :151, :193-194, :198, :234, :325,
:332; `p14b3-rule-revision` :98, :144-147, :180); historical 1s untouched; the conflicting-claim joint
case moved verbatim to `tests/p14b4-cast-class-capacity-evaluator5.test.ts` as a LIVE designated
failure with the `rulesVersion 4` pin kept; three comment lines above the unchanged
`!== UNKNOWN_CAP` assertions; trust-chooser test 6 migrated to a real `leadOrAntagonist` P2 (same
seed, weeks, tie shape, winner meaning; no cast, no `@ts-expect-error`; typecheck exit 0). 600-B Q8:
LAWFUL, nothing to fix before the writer.

## 600-A (design) and 600-B (review) — what was adopted

The design is 26 §2–§4 under the record-600 law, five steps S1 core → S3 save → S4 load/runtime →
S2 policy → S5 wire + generator, each a cumulative patch and a bisectable commit, pushed together.
600-B: S1 implements exactly the evaluator-4 law (Q1 MET; nothing from evaluator 5, nothing
missing); S2 matches the plan's delegated hypothesis and the policy RED (Q2); S3/S4 MET, D17
drivers included, fixture type widening lawful (Q3); S5 closed family-discriminated union
supported by the DSL/generator, G1/G2 refused for real reasons (Q4); atomicity facts F-a…F-e
verified, five commits lawful (Q5); nine paper spot-checks consistent (Q6); the sweep and the
moved-premise classes lawful under plan T2 with the G9 class named separately (Q7); frozen list
complete (Q9). Verdict RELEASE WITH CONDITIONS.

Demonstrated (bookkeeping, corrected here): D1 the root-tsc residual list gains
`tests/save.test.ts:229-233`; D2 the S1/S3 acceptance rows are restated after 600-T (C1); D3 the
first S2 stop in trust-chooser test 7 is the spy's draft assertion `:570-575`, test 6 `:360` cannot
move, the policy fixture's nonpair drafts do not overlap (reserved 0).

## Parent rulings (in force for 600-W and after)

- R1. Conditions C1–C12 of 600-B are adopted verbatim (see `600-B-review.md` "Rulings for the
  parent"). In particular: C3 the `584bdd…` → `projection-v46` registry line lands in S5 with
  `PROJECTION_VERSION 47`; C4 the disclosure hunks land in S5; C6 the four D17-driver tokens are
  in S4; C7 `legacy-v28-fixtures.ts` changes exactly two type-only lines; C8 generator once, after
  S5 is frozen, no `--unity-project`.
- R2. Plan :25-27 reading (C12): `reserved + X > nMax` → IMPOSSIBLE (`promises.ts:396`);
  `reserved + X > nMax − promiseBuffer(nMax)` → FRAGILE "the schedule leaves no spare picture
  inside the window" (:403).
- R3. Landing: the writer never commits. After each step it saves the cumulative diff from HEAD
  (`git diff HEAD --binary`) as `600-W-cum-S1.patch` … `600-W-cum-S5.patch`. The parent builds one
  tree per cumulative patch in a temporary index, commits each tree onto the previous with
  `git commit-tree`, verifies the final tree equals the frozen working tree byte for byte, then
  moves the branch and pushes the five commits in one push (C5). No S1–S4-only tree is
  record-checked or run natively.
- R4. The generator (`npm run generate:bridge-contract`) is run by the writer once as its S5
  self-check under this authorization (the parent's runtime handoff of 26 §4); its three owned
  artifacts are part of the S5 tree. The parent re-runs `npm run check:bridge-contract` and
  `npm run check:bridge-contract:fixtures` on the frozen candidate.
- R5. Sequence after the writer (600 §3 steps 6–7, refined by 600-B Q7/C9/C10): (i) parent
  typecheck + generator checks + the six live-P2 files on the frozen candidate under record-check;
  (ii) the five commits landed and pushed; (iii) test-author 600-T2: the 29→30 values-only
  live-version sweep (precedent 6948e31; classes 600-A §4.3), then the meaning pins from evidence
  (byte-identity `p14bf2:303`, `p14b3-rule-revision:109`, `bridge-p14b2-checkpoint:34-37`;
  generator pins `bridge-contract-generator.test.ts:554-560,656-657` to actual bytes), then the
  G9-class movements (rival flexible-first authoring; trust-chooser `:570-575`, `:641-697`; p14b2
  `rivalFixture`/poaching) as a NAMED class re-derived from receipts with the proven/unproven fact
  observed, purposes re-expressed never dropped, natural-witness misses recorded as fixture
  findings; (iv) parent serialized record-checks of every control vs 536/593 and the earlier
  baselines, fixed-source full core then full bridge; (v) 600-R review; (vi) record, headers,
  Unity backlog (abstract draft base + converter; class selector; preference/legacy display;
  V30/47 loading).
- R6. Record-only, carried: evaluator-4 parity artifacts (a non-mask running seat is neither an
  event nor a hold; `unproducedScripts` counts `inProduction` projects as paths) — pre-existing
  rules-3 behaviour, not part of the amended definition; `breakPromisesOnCancel` coupling (600 §3
  step 8); seating preference (own RED later); the plain-English classless-P2 quote sentence
  (REFINE, writer's choice inside the stated meaning); 574-R item 1 header note deferred.

## Constraints restated for 600-W

Writable: `src/core/types.ts`, `src/core/promises.ts`, `src/core/talentMarket.ts`,
`src/core/save.ts`, `src/core/index.ts` (comment), `src/harness/p14/legacy-v28-fixtures.ts` (two
type lines), `src/harness/d16/run-d17b-continuation.ts`, `src/harness/d16/run-d17b-week86.ts`,
`bridge/session.ts`, `bridge/runtime/campaign-library.ts`, `ui/src/engine/adapter.ts`,
`bridge/runtime-checkpoint.ts`, `bridge/schema/bridge-schema.ts`, `bridge/promises.ts`,
`bridge/contract.ts`, `bridge/people.ts`, and the generator's three artifacts through the generator
only. Not writable: everything in 600-A §5 (the V29 validator branch and converters, kernel,
replay, adapter, enumerator, caps, tariffs, timeouts, tests, fixtures, the stale test, refusal
strings in force except the authorized P2 `NOT_OFFERED` replacement). One process at a time;
raw outputs saved; no commits; no Owner-acceptance claim.
