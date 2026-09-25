# 773-A — bounded contract review of 773 (contract-auditor, read-only), verbatim

Reviewer: contract-auditor role contract run through a general-purpose agent (project roles are not in
this session's registry; disclosed), model Sonnet per the profile. Source `f2d862d7`. Returned
2026-09-25 ≈18:05 CEST, 48 tool uses, read-only. The parent's verification and decisions are 773 §9.

VERDICT: REFINE (not REWORK — no demonstrated defect blocks RED; several amendments should land in the
record before the test-author locks fixtures).

1. Authority classes: no hypothesis presented as Owner law, no product policy invented under
   "delegated". The §3 class column is non-uniform (D5, D7–D12, D16 cite the companion instead of naming
   a class). D10 is a larger interpretive leap than admitted: §6.2 lists "P10 contract end … receipt" in
   the settlement write-set; 773 reads it as satisfied by the pre-existing expiry plus D7's cap.
2. Writer inventory verified exact (`actions.ts:2484`, `:2556`; `talentMarket.ts:327`, `:955`, `:996`;
   `hollywoodTick.ts:110-119`, `:147`; `hollywood.ts:187`, `:241`). Unnamed indirect site:
   `actions.ts:2857` `recruitScientist` → `applySignContract`. Gap: new WRITING assignments
   (`applyCommissionOriginalScreenplay`, `applyAssignScreenplayWriter`, rival `decide()` commission) are
   not addressed. Research seats cleared (Scientist-only; no Scientist window).
3. Tick placement MET WITH EVIDENCE (`tick.ts:1000-1145`); capturing birthdays before `materializeAges` is
   necessary, not just sufficient.
4. Trap 7 verified for the player path (`promises.ts:407-409`, cited as `:415`); rival half "NOT
   VERIFIED — no rival-authored-promise code path currently exists".
5. Test map: add the writing-assignment case; `recruitScientist` path low priority.
6. V34 root: no `eventId`; at-most-one-record needs a documented amendment path before C.3.

Prioritized amendments: (1) writing assignments; (2) an eventId; (3) name `recruitScientist`; (4) a
rival-promise case; (5) uniform class column; (6) flag D10's reading.
