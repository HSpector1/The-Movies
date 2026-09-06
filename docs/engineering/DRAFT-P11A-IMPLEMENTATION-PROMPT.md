DRAFT FOR CURRENT OPS REVIEW — NOT AUTHORIZED FOR EXECUTION

**Revision 03 (observed-stack refresh, 2026-09-06).** Observed snapshot: TS product `7b4d8ffebeb0b7978763780420fdc8542df68b5f` (docs tip `a2baa1d9b3ffb2666732dba55823e09cc76c7352`) × Unity `1d304f89a29ffca160129b705d7d627543adfb4d` (product `57f9ef857a5955a604a56c1526733f2302efabc8`) · protocol 4 / projection 19 / save V18 · schema `sha256:6a2c01feaf02c931a8c41bbf2090f8af003b89a492d77135d7aab2b42a8d3dc9` · OWNER ACCEPTANCE PENDING · UNSEALED. Final accepted P08–P10 base: PENDING. Revision 02 immutable at `90b349a8272f17ad7ea541cdddc777d36c1d861d`. Hub: `P11A-READINESS-AND-DEPENDENCY-GATE.md`.

# Project: Studio — P11A Executive Finance Spine V1

This draft must not be sent to an implementation agent until every item of the audit → P11 entry gate (`P11A-READINESS-AND-DEPENDENCY-GATE.md` §11) is satisfied, Current Ops has replaced every placeholder against the final accepted P08–P10 code, the required defaults in the register §4.B are adopted, and a separate Current Ops P11 authorization ID is issued.

## 0. Role and destination

You are the P11 implementation lead for Project: Studio. Build the dependency-ready P11 Finance, Accounting & Executive Decision UX without retuning the economy, inventing accounting truth, duplicating P08/P09/P10, or turning the game into a spreadsheet.

The player should be able to answer:

> Am I okay? Why? Exactly what moved, what is committed, and what will this action do?

Primary route:

```text
LOT HEARTBEAT
→ ADMINISTRATION EXPLANATION
→ RETAINED FINANCE DETAIL
→ EXACT FILM / PERSON / FACILITY OWNER
→ BACK TO THE SAME LIVE LOT CONTEXT
```

## 1. Binding authorities

Read in full:

```text
codex/finance-executive-ux-research-11@d6c38546d19fbb23533af496e0f62b9c340b7ce5
  docs/design/CODEX-FINANCE-EXECUTIVE-UX-PACKAGE-11.md
  docs/design/CODEX-FINANCE-EXECUTIVE-UX-PACKAGE-11-BUILDER-ANNEX.md

docs/p11a-launch-package-01@FINAL_P11_DOCS_SHA
  docs/engineering/P11A-READINESS-AND-DEPENDENCY-GATE.md
  docs/engineering/P11A-FINANCIAL-TRUTH-AND-CODE-RECONNAISSANCE.md
  docs/engineering/P11A-PROVISIONAL-IMPLEMENTATION-CHARTER.md
  docs/engineering/P11A-DECISION-AND-REQUIREMENT-REGISTER.md
  docs/engineering/P08-P10-TO-P11-HANDOFF-CONTRACT.md
```

Also read the accepted P07 handoff, P06/P07 lessons, the final P08–P10 execution handoff (`docs/campaigns/P08-P10-AUTONOMOUS-STACK-HANDOFF.md`), the close-gates register (`docs/campaigns/P08-P10-CLOSE-GATES-DISPOSITIONS.md`), the three technical checkpoints and hostile reviews, `docs/engineering/P10-INFORMATION-VISIBILITY-TABLE.md`, changed paths, candidate manifests and the Owner acceptance receipt.

Treat both earlier snapshots as historical implementation-adjacent evidence only: the 2026-09-05 recon (TS `908879a9…` × Unity `685f113e…`: P08 Wave 2, no P09/P10) and the 2026-09-06 observed pair (TS product `7b4d8ff…` × Unity `1d304f8…`: combined technical KEEP for authorized ready scope, Owner acceptance pending, facility Opex STILL PRESENT). Do not substitute either moving WIP identity for the final accepted stack.

The original P11 design remains in force. This prompt does not narrow its preserved ready extensions or authorize conditional/later features.

## 2. Required final identities

Replace all placeholders before branch creation:

```text
FINAL_P08_P10_TS_SHA
FINAL_P08_P10_TS_PRODUCT_SHA
FINAL_P08_P10_UNITY_SHA
FINAL_P08_P10_UNITY_PRODUCT_SHA
FINAL_P08_P10_PLAYER_SHA256
FINAL_P08_P10_ENGINE_SHA256
FINAL_P08_P10_ASSEMBLY_SHA256
FINAL_P08_P10_GENERATED_CONTRACT_BLOB
FINAL_P08_P10_GENERATED_CONTRACT_SHA256
FINAL_P08_P10_SCHEMA_ID
FINAL_P08_P10_PROTOCOL_VERSION
FINAL_P08_P10_PROJECTION_VERSION
FINAL_P08_P10_SAVE_VERSION
FINAL_P08_P10_CHANGED_PATHS
FINAL_P08_HISTORY_SEAM
FINAL_P09_PLACEMENT_QUOTE_SEAM
FINAL_P09_FACILITY_OPEX_SEAM
FINAL_P10_PERSON_CONTRACT_SEAM
FINAL_P08_P10_TEST_FLOOR
FINAL_P08_P10_OWNER_ACCEPTANCE
FINAL_P11_DOCS_SHA
CURRENT_OPS_P11_AUTHORIZATION_ID
CURRENT_OPS_P11_AUTHORIZATION_DATE
```

Stop if any required identity is unresolved, P08–P10 is not Owner-accepted, or any mandatory real-input gate is neither green on the accepted product bytes nor explicitly accepted by Current Ops in its recorded classification.

Observed values (2026-09-06, NOT final; for orientation only): TS product `7b4d8ffebeb0b7978763780420fdc8542df68b5f`; Unity `1d304f89a29ffca160129b705d7d627543adfb4d` (product `57f9ef857a5955a604a56c1526733f2302efabc8`); player exe `1358fd1f…` / `Assembly-CSharp` `c21c42a6…`; engine bundle `189326b6…`; generated contract blob `4c0a7434…` / sha256 `7eeb1701…`; schema `sha256:6a2c01fe…`; protocol 4; projection 19; save V18; test floor TS 5004 passed, EditMode 882 (EVIDENCE REPORTED).

## 3. Branch and process law

After authorization:

1. Verify both repository identities, exact accepted refs, remotes and upstreams.
2. Use isolated owned worktrees.
3. Create and push empty branches chosen by Current Ops, provisionally:

```text
wip/p11a-executive-finance-01-ts
wip/p11a-executive-finance-01-client
```

4. Do not move campaign branches, main or Golden.
5. Do not clean unrelated worktrees, delete unknown artifacts, kill another session or open the Owner's real profile for writing.
6. Use byte-copies of compatible profiles only.
7. One editing owner per collision-prone file; subagents use disjoint worktrees/read-only review.
8. Commit and push each coherent wave before long proof and context compaction.
9. Maintain a durable P11 handoff with exact refs, tests, candidates, changed paths, blockers and next command.

## 4. Non-negotiable product laws

- TypeScript owns every finance fact, formula, category, quote, legality, forecast, history basis and action result.
- Unity owns layout, formatting, input dispatch, focus and animation only.
- Cash is literal current cash.
- Obligations are shown beside Cash; they are not subtracted into Available Cash.
- One-time construction, Greenlight, signing, termination, publicity and Set repair do not enter recurring Weekly operating cost.
- Payroll, ordinary overhead and operational facility Opex do enter complete recurring cost at their exact authoritative timing.
- Theatrical Gross is not Studio Revenue.
- Received Studio Revenue is not scheduled Studio Revenue.
- Film Contribution is not Net Profit or total studio profitability.
- The accepted P07 result surface may retain its TypeScript-authored `Profit` / `Loss` / `Break-even` labels. P11 must not silently relabel that surface; its own Finance view uses Film Contribution with explicit scope/exclusions.
- `banked to date` and `received to date` are equivalent only when both map to the same accepted paid-to-date field.
- Projected values are not banked/final truth.
- Affordability is legal authority; prudence remains the player's judgment.
- Inspection, sorting, paging and opening Finance consume no RNG and mutate no gameplay.
- Old gaps say Not recorded; never fabricate transactions, splits, people, receipts or titles.
- Exact stable IDs only; no title/name/list-position joins.
- No economy retuning.
- No loans, investors, taxes, credit, bankruptcy or rescue.
- No full accounting P&L, fake ROI, Available Cash, health grade or investment advice.
- No duplicate History, Construction, Contract or Result authority.

## 5. Entry reconnaissance

Before production edits:

1. Re-read final P08–P10 accepted changed paths only and their direct dependencies.
2. Map exact TypeScript finance, ledger, contract, P09 placement/set quote, P08 history and P10 person/contract symbols.
3. Map private Unity Administration, workspace host, route/focus/back, DTO cache, element map and generated consumer.
4. Verify whether accepted `weeklyBurn`, `runway`, `financeView`, `commitmentPreview`, `prospectiveCycleFixedCost`, `postSigningRunway` and `ledgerFixedCostByWeek` include operational facility Opex.
5. Compare actual tick debits and ledger kinds to every proposed read model.
6. Verify P09's final solvency proof used complete recurring facility Opex. At the 2026-09-06 observed pair the bridge-only first-film journey asserts actual `facilityOpex` debits and exact ledger reconciliation (complete measured journey), while `weeklyBurn` and its consumers still omit facility Opex (STILL PRESENT) and that omission reaches `StudioTreasurySnapshot` and the Administration card. Re-verify both facts at the accepted base; do not mistake the observed snapshot for final proof.
7. Verify the P09 quote/commit path is revision-bound, exact-ID and idempotent.
8. Verify P10 current-contract/obligation/profile routes and public information boundary.
9. Resolve whether Finance deep history belongs in the snapshot or a bounded query route; do not append raw full history to every frame. P08 Studio History is context/significance authority, not accounting history; the signed ledger/checkpoint remains the reconciliation source.
10. Confirm no authoritative Builder payroll/capacity exists. If absent, omit it or state `not modeled`; never price it as zero.
11. Record a path/owner/collision matrix and an implementation plan update.

### Mandatory classification of the old facility-Opex defect

Return exactly one:

```text
STILL PRESENT
FIXED
PARTLY FIXED
NOT VERIFIABLE
```

At the accepted P07 base and at the 2026-09-06 observed pair (TS `7b4d8ff…`, `src/core/economyView.ts` byte-identical to the base) the defect was STILL PRESENT: tick step 7.6 charged `facilityOpex`, but `weeklyBurn`, `runway`, `financeView`, `commitmentPreview`, `prospectiveCycleFixedCost`, `postSigningRunway` and `ledgerFixedCostByWeek` omitted it. Do not assume either persistence or repair at the accepted base. The proposed repair is recorded in `P11A-FINANCIAL-TRUTH-AND-CODE-RECONNAISSANCE.md` §3.3.

## 6. Current Ops communication gate

If the final P09 candidate's solvency or founding proof relied on an incomplete recurring selector, pause only the affected P11/P09-dependent acceptance claim and report the evidence to Current Ops. Do not retune, silently compensate, or rewrite P09 history inside P11.

## 7. W0 — complete financial truth

Build or repair one core-owned recurring-cost projection that exactly matches current authority:

```text
Weekly operating cost
= current charged Payroll
+ current charged ordinary studio overhead
+ current charged operational facility Opex
```

Requirements:

- exact founding/engagement timing;
- exact facility completion/Opex onset timing;
- whole-dollar finite values;
- one-time Set repair excluded;
- one-time capital/film/contract/publicity movements excluded;
- no debit or tuning change;
- no duplicate formula in UI/Unity;
- selector↔tick↔ledger mutation guards.

Repair every downstream current-pacing consumer that promises the complete basis, including Runway and consequence previews. Treat the optional fixed-cost allocator separately; do not expose it as film profit.

## 8. W1 — canonical Finance read model

Publish a pure bounded TypeScript projection containing at minimum:

### Health

- literal Cash;
- complete recurring components;
- Weekly operating cost;
- next scheduled Studio Revenue from active runs;
- signed Net weekly cashflow;
- Runway state and exact basis/exclusions.

### Recorded period

- from/to/as-of week;
- opening Cash;
- typed signed movement categories;
- net movement;
- closing Cash;
- coverage/checkpoint status;
- bounded exact rows or a query handle.

### Costs and obligations

- Payroll summary and exact people;
- Studio Operations summary and exact facilities;
- capital movement;
- current guarantees/obligations;
- one-time contract/freelance/termination/publicity rows.

### Film Economics

- exact production/result ID;
- direct film commitment;
- Gross;
- Studio Revenue received and scheduled;
- full-run Studio Revenue;
- Projected or Final Film Contribution;
- explicit exclusions;
- accepted P07 route and provenance.

Do not expose hidden deterministic future values beyond accepted P07 public projection law. Do not label a current concept title as separately frozen history.

## 9. W2 — projection, schema and exact Unity consumer

- Use the smallest additive closed contract.
- Regenerate C#; never hand-edit generated DTOs.
- Validate numeric bounds/finiteness, signs, dates, IDs, coverage states and mutually exclusive projected/final states.
- Preserve CF-08/CF-09 fail-closed behavior.
- Verify exact committed blobs, file hashes, repository/path/commit identities and clean trees.
- Use a bounded query/page for deep ledger history when full snapshot cost is not justified.
- Do not bump protocol unless semantics truly require it.
- Do not bump save unless a new durable fact is separately justified and approved.

## 10. W3 — world-first Administration finance entry

Implement:

```text
Lot heartbeat
→ select physical Administration directly
→ compact finance card
→ Open Finance
```

The compact card shows no more than:

- Cash;
- signed current pace;
- conditional Runway or top current recorded driver;
- Open Finance.

No rail priming, camera hijack, automatic pause or fake attention classifier.

## 11. W4 — retained Finance workspace

Core workspace:

- Overview;
- Costs;
- Films;
- compact current obligations.

Required behavior:

- readable executive hierarchy, not a giant ledger table;
- exact period and history coverage;
- opening + movement = closing above the fold;
- Payroll and Studio Operations separated;
- active/run-complete/legacy film states;
- same-title films and same-name people remain distinct;
- selected tab/filter/scroll/subject survive refresh and Back;
- narrow/full-screen mode preserves the same context;
- keyboard/controller/mouse and 200% text work;
- no color-only meaning;
- actual open-workspace screenshots at required viewports.

## 12. W5 — exact cross-domain routes

- Payroll row → exact P10 Person Profile/contract owner.
- Facility Opex/capital row → exact P09 facility/site owner and optional Locate.
- Film row → exact P07 result/P08 history/Production route according to authoritative state.
- Historical subjects without current location remain inspectable; Locate is absent or disabled with reason.
- Unknown ID never silently opens a fallback and claims success.
- Back restores Finance and then exact Administration/lot origin.

P11 owns none of the destination workflows.

## 13. W6 — financial consequence proof through P09 construction

Reuse final P09 quote/commit authority (observed: `bridge/placement.ts::placementQuoteSnapshot` with `cost`, `weeklyOperatingCost`, `buildWeeks`, `completesOnWeek`, `cashBefore`, `cashAfter`, capacity and rejections; digest-bound `placeFacility` intent registered in the session's `pendingQuotes`). The Finance presentation may compose additional TypeScript finance facts, but may not create placement law.

Show separately:

### Immediate

- capital commitment;
- Cash now;
- Cash after;
- affordability/refusal.

### When operational

- completion week;
- operational facility Opex delta and effective week;
- complete Weekly operating cost after;
- Net weekly cashflow after;
- Runway after, if meaningful;
- capability/capacity.

### Interaction

- review is pure;
- cancel submits no committed domain action and creates no debit, site, employment change or obligation; a legitimate read-only quote request may already have occurred, and that session bookkeeping (`pendingQuotes`, cleared on any accepted command or load) is not durable gameplay state — prove cancel by revision, cash, ledger length, placement/contract state and save bytes, never by the absence of quote traffic;
- material change requires fresh quote;
- submit carries exact quote/intent and expected revision;
- owning authority revalidates;
- duplicate accepted command creates at most one debit/site/receipt;
- no optimistic Unity success/cash animation.

## 14. W7 — migration, reconnect and performance

Prove the actual accepted migration chain on private profile copies:

```text
P07 accepted
→ P08
→ P09
→ P10
→ P11
```

Require:

- current Cash, ledger/checkpoint and obligations survive;
- P08 history remains intact;
- P09 facilities/sites/regime remain intact;
- P10 people/contracts/routes remain intact;
- no fabricated pre-recording financial history;
- no duplicate receipt on load/reconnect/engine replacement;
- opening/filtering/paging does not mutate save/RNG;
- multiple active films/runs/facilities/contracts;
- bounded long-ledger query, snapshot and workspace render performance;
- no whole-save digest or whole-history projection per frame.

## 15. Gate A — P11A core technical KEEP

Require all of:

- focused and full TypeScript floors;
- typechecks/audits/builds;
- schema/generator/exact-consumer checks;
- full Unity EditMode;
- bounded PlayMode/runtime proof where genuinely needed;
- six visual scenarios;
- real input for material interactions;
- private Owner-profile-copy journey;
- fresh independent hostile review with every real finding acted on;
- clean pushed WIP refs;
- exact source/build/contract hashes;
- preserved runnable P11A core candidate and compatible profile copies;
- no campaign/main/Golden movement;
- no Owner-acceptance claim.

## 16. Visual Oracle scenarios

1. Healthy cash / positive or steady current pace.
2. Capital-heavy week with recurring pace shown separately.
3. Ongoing operating deficit or in-red state.
4. Active theatrical income with received/scheduled and projected Contribution.
5. Legacy incomplete-history state.
6. Construction consequence and stale-quote/refusal state.

Tests that an object exists do not substitute for readable actual screenshots.

## 17. Real-input journey

From the physical lot:

1. select Administration without using rail/menu first;
2. open Finance;
3. reconcile the last complete period;
4. open one employee and return;
5. open one facility and return;
6. open one film and distinguish Gross/Revenue/Contribution;
7. open construction consequence;
8. cancel (no committed action; state, revision, ledger and save bytes unchanged; prior quote traffic is not a failure);
9. induce/refuse stale quote;
10. commit deliberately through P09;
11. verify capital now and Opex later;
12. save/load/reconnect;
13. Esc/menu/quit cleanly.

## 18. W8 — ready-extension ladder

After preserving the core candidate, review `P11A-DECISION-AND-REQUIREMENT-REGISTER.md`.

Implement only activated `IMPLEMENT AS READY EXTENSION` rows, in this recommended order:

1. Known-flow Upcoming — list only dates and amounts that are both player-public and authoritatively committed, each with its exact public wire field: facility `completesWeek` + `weeklyOperatingCost` (Opex from the following advance); contract `endWeekExclusive` and renewal-window opening; aggregate next-advance Studio Revenue from active runs and the remaining projected total with remaining week count (P07 `studioRevenueTotal`, `studioRevenuePaidToDate`, `totalWeeks`, `weeksCredited`, `projected`); Set `completesWeek`. A locked internal theatrical schedule is not automatically public: do not list per-week future receipt amounts (not on the wire) unless a separate Current Ops/Owner disclosure decision authorizes it; where a required public fact does not exist, block that row and say so.
2. Hire/renew/release/Greenlight consequence previews — observed producers: `renewContract` / `releaseTalent` quote family (`bridge/contract.ts`), `signContract` quote (`bridge/casting.ts`); Greenlight through the existing casting intents. Search actual action names; do not conclude release is missing because `releaseContract` or `terminateContract` is not the identifier.
3. Full portfolio filters/deep links.
4. 13/52-week cash and cost charts with text equivalents.
5. Year/era summaries.

For each extension:

- producer facts must be accepted;
- Current Ops ceiling must include it;
- no Owner/conditional/dependency block may remain;
- focused and cumulative proof must pass;
- preserve the core candidate;
- do not let one blocked extension stop independent later work unless it is a true dependency.

Do not implement P11-REQ-034 through 042 without their separate gates. Preserve P11-REQ-043 and 045 as active prohibitions.

## 19. Gate B — full ready-scope technical KEEP

Repeat cumulative proof, exact-consumer attestation, visual/HID/private-profile journey, hostile review, clean/push checks and preserve a separate final candidate if its bytes differ from core.

Owner acceptance follows a Current Ops-reviewed playtest. Technical KEEP cannot substitute for it.

## 20. Real-Builder boundary

Do not create a Builder profession, speed/capacity formula, payroll row or productivity result in P11. Display Builder costs only if accepted P09/P10 actually produce them. Absent Builder economics are `not modeled`, not zero. Report the preserved P09-REQ-039 follow-up separately.

## 21. Hostile review axes

Reject for:

- incomplete facility Opex in any complete operating number;
- read-model fix changing tuning/debits;
- Gross/Revenue/Contribution/Profit drift, including an unauthorized relabel of the accepted P07 result surface;
- obligation subtraction from Cash;
- deterministic future truth presented as settled/banked;
- duplicate ledger or obligation;
- stale quote acceptance;
- cancel proof that rejects ordinary read-only quote traffic;
- an Upcoming row that exposes a non-public future receipt or any amount without a public wire field;
- client-side calculations;
- old-save fabrication;
- title/name/list-position joins;
- copied P08/P09/P10 authority;
- fallback route mistaken for requested ID;
- spreadsheet density;
- inaccessible chart/definition;
- alert spam/pause/camera movement;
- accepted P07 semantics silently rewritten;
- economy retuning, loans, bankruptcy, fake ROI or investment advice.

## 22. Final report

Return:

```text
P11A STATUS
TECHNICAL KEEP / PARTIAL / BLOCKED

STARTING ACCEPTED AUTHORITIES
FINAL TS/UNITY SHAS
SAVE / PROTOCOL / PROJECTION / SCHEMA
FACILITY OPEX CLASSIFICATION
CORE REQUIREMENTS IMPLEMENTED
READY EXTENSIONS IMPLEMENTED
PRESERVED BLOCKED/DEFERRED REQUIREMENTS
TYPECHECK / TEST / CONTRACT / UNITY RESULTS
VISUAL ORACLE RESULTS
HID / PRIVATE PROFILE RESULTS
HOSTILE REVIEW
CORE CANDIDATE PATH + HASHES
FULL READY-SCOPE CANDIDATE PATH + HASHES
BRANCH / REMOTE / WORKTREE STATUS
CAMPAIGN / MAIN / GOLDEN STATUS
REAL-BUILDER FOLLOW-UP
OWNER PLAYTEST SCRIPT
KNOWN LIMITATIONS
NEXT ACTION
```

Then STOP. Do not begin P12, move campaigns or claim Owner acceptance.

## 23. Revision log

| Revision | Change |
|---|---|
| 02 | Local recon snapshot referenced as historical evidence; placeholders listed |
| 03 | Banner wording set to the required form; entry gate bound to readiness §11; observed identities listed as non-final orientation; facility-Opex classification updated (STILL PRESENT at the observed pair, reaching the treasury snapshot); cancel rule corrected in §13 and §17; Upcoming public-information rule and observed contract-action identifiers added in §18; two hostile-review axes added |

DRAFT FOR CURRENT OPS REVIEW — NOT AUTHORIZED FOR EXECUTION

FINAL ACCEPTED-BASE CHANGED-PATH REFRESH REQUIRED BEFORE ANY P11 IMPLEMENTATION ORDER
