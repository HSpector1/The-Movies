# 121 — bounded staffing-owner extraction plan review

**KEEP as implementation guidance**, with the precisions below. No policy or import-cycle blocker found. This is not implementation, test evidence or owner-adapter completeness approval.

Reviewed118 SHA256:
`f51debf358229440fbb80b0d31b49afb89e231ba2df4020315efc22c850fccdc`.

Read the complete plan, relevant actions/employment/script-development owners, fee dependencies, narrow runtime import graph and prior owner13/14. No files, runtime, probes, Git mutations, network or delegation.

## Supported boundaries

- **Module placement:** `productionAdmission → scriptDevelopment → productionQueue/occupancy → officeConversion/tuning` introduces no actions/queueAdmission back-edge in the inspected graph. Keep employment facts caller-supplied and other imports type-only.
- **Header facts:** The proposed view supplies the actual information used by `actions.ts:335–390` and the existing `screenplayFactsMatch` signature. Preserve assessed Ready and exact screenplay facts, existing audition acknowledgement, founding, concept and genre checks in their present order. Operations mode must not become an additional header gate.
- **Assignment law:** Preserve has-discipline eligibility, distinct cast and same-production role uniqueness. Writer credit remains included in identity/discipline/uniqueness but excluded from engaged occupancy and freelancer labour.
- **Busy predicates:** Greenlight’s production-plus-active-writing union at470–471 remains distinct from commissioning’s broad `busyTalentIds`, including industry and active contracted research. The freelancer market independently uses the broader eligibility filter; narrow greenlight availability alone cannot establish freelancer status.
- **Commission staging:** The lazy facts preserve founding → person → writing profile → current contract → broad busy. Do not evaluate busy early, reuse this law for rewrite, or change the existing verb/error labels. Shared lookup remains available to the separate raw lookup call sites.
- **Commit scope:** Forecast, fees, solvency, ledger, production identity, queue handling and screenplay linking remain outside the lower helper. Returned staffing is neither an admission commitment nor a future employment entitlement.

## Required implementation precisions

1. **Readonly craft result:**118 returns `readonly T[]`, while `ReceptionInputs.craftHires` at `reception.ts:76` requires `Talent[]`. Create a fresh local array at the action boundary. Do not cast away readonly or expand this extraction into reception API changes. Generic results otherwise preserve the actual full caller type.

2. **Preserve both diagnostic orders:** Person/profile resolution currently runs writer → director → cast slots → craft array (`actions.ts:393–411`). The later all-role duplicate diagnostic runs writer → director → craft → cast (`430–445`). Engaged occupancy/labour uses director → cast → craft. These are deliberately different orders;118’s wording must not collapse them.

## Freelancer precollection assessment

The original loop at560–576 interleaves each seat’s eligibility check with its fee calculation. Precollecting all freelancers changes **read timing**, but preserves meaningful action outcomes on well-formed state:

- `freelancerFee` reads salary and the operational craft-annex multiplier, then rounds once.
- Its inspected dependencies contain no intentional eligibility/refusal gate and mutate nothing.
- Earlier fee entries are only local, uncommitted values when a later seat is refused.
- Keeping the ordered freelancer result preserves fee arithmetic and ledger order on successful admission.

Therefore the proposed collection is acceptable within that stated boundary. Do **not** claim identical getter access, incidental TypeError precedence or deep-malformed-input read order. Keep forecast before the engaged craft/labour gates, and the actual freelancer-market read after the craft gate even when all seats are contracted.

## Verification limits

Independent tests should preserve literal refusal sequencing, caller-specific busy semantics, half-open current contracts, full-person generic inference and actual fee/ledger outcomes. The ongoing parent baseline is not claimed completed here. Actual extraction, strict typing, regression execution, admission-week facts and real trace enumeration remain separate gates.
