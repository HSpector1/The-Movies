# 782-A — bounded contract review of the C.4 draft (contract-auditor, read-only), summarized by the parent

Reviewer: contract-auditor role contract through a general-purpose agent (roles not registered in this
session), model Sonnet, Read-only as required (it reports Glob/Grep unavailable and used direct Reads; no
Bash). Returned 2026-09-25 before 20:10 CEST (commit `c851afa3`; an earlier draft of this line said ≈21:45, a guessed clock, corrected against the commit time). It could not resolve `plans/P14-HEADLESS-PLAN.md` or 773/777 by path
and corroborated them through the committed source's citations — recorded as an evidence limit.

VERDICT: REFINE.
1. Authority classes R1–R9 correctly labeled; the era-dependence gap is disclosed, not hidden.
2. DEMONSTRATED DEFECT: companion §6.5 ("P12's two mint sites call the same primitive"), §7.2 R21 ("all
   minting … through one exported primitive") and §2.5 are not met by a third standalone `mintCohortTalent`;
   and supplying an age requires changing `generateTalent` (`worldgen.ts:449-550`, age drawn at `:490`), so
   byte-identity for existing callers must be argued.
3. Determinism/isolation sound (per-id isolated seed, `uniqueIdentity` against `state.talent`).
4. C.2a interaction benign (provenance at append; free agents listed first and uncapped; idle horizon
   irrelevant at entrant ages).
5. Preference: the demonstration should report population and free-agent-list growth, since "hiring
   market non-empty" is near-satisfied by construction once cohorts exist.
6. V35 shape consistent with the V34 precedent.
