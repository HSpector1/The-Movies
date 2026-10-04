# 1367-H: allocate Save46 to recovery Parts B and C

Parent allocation, 2026-10-04, under adopted 1363-A2 §5 and the approved remainder plan. Live published HEAD is `2eaa697effc38538c37da28b486786ce267a2284`; `src/core/save.ts` declares `LIVE_SAVE_VERSION = 45`, and `src/core/types.ts` aliases `GameStateV45`. Save45 production has landed. One production writer remains authoritative.

Allocate **Save46** to the combined recovery Parts B+C shape. Part A changes no persisted shape and requires no save step. The reviewed frozen-capture producers, named-lens guard and tests-only coverage repairs consume no save version. Late founding (1364), subsequent market/closure and later product steps follow this recovery step; they receive their own allocation against the actual predecessor when reached. No parallel writer may consume Save46.

Save46 carries only the adopted recovery additions: each rival's `costCutting: {version: 1, since: number | null}`, the exact `facilityDemolitionRefund` movement and `facilityDisposed` receipt authority, era-specific validation/migration, and the required live profession-proof plumbing. Preserve Save45 and all older public readers. Up-migration creates null/zero facts only. Down-migration refuses actual cutting or disposal authority it cannot preserve; it must not recreate a demolished body or erase a refund.

Use explicit `rivalCostCutting` and `rivalFacilityDisposal` era controls internally. A live profession proof strips cost-cutting only from its internal historical view while retaining actual disposal receipts, absent bodies and refund accounting under the explicit disposal era. This is not acceptance of new fields by an old public save reader.

This is an allocation for independently authored REDs and the next production slice, not an assertion that Save46 exists or passes. Source stays unchanged during the recorded Save45 gates. Genuine predecessor capture, intended RED measurement, single-writer implementation, coherent accounting/persistence integration, independent review and all required verification remain prerequisites to landing. Do not expose an incomplete disposal feature between these steps.
