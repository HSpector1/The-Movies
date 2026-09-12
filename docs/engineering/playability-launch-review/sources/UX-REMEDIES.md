# UX-REMEDIES.md — exact immutable excerpts

Source: `HSpector1/The-Movies@45ca33650074ad5413c39fb9d4a5c04cd6571c3a`, `ui/src/engine/productionOperationsProjection.ts`. Full Git blob `89d3c4ff9f0ae40e02bd3a7615816ae78f9ee0d6`. Source bytes 31462; SHA-256 `ec9af32d5bf8ddfb05db9b32b85d309e67b591f92af66d805c208b83d89af0a8`. Selected original lines only; source facts do not establish native observations.

## Lines 290–367

```text

function remedyRoutes(remedies: readonly StudioQueueRemedy[]): LotProductionRemedyRoute[] {
  const routes: LotProductionRemedyRoute[] = []
  for (const remedy of remedies) {
    switch (remedy.kind) {
      case 'build-blueprint':
        routes.push({
          kind: remedy.catalog === 'set' ? 'open-scenery-shop' : 'open-queue',
          label: remedy.label,
          setId: null,
          holderId: null,
          freesInWeeks: null,
        })
        break
      case 'repair-set':
        routes.push({
          kind: 'open-set',
          label: `Repair ${remedy.setName}`,
          setId: remedy.setId,
          holderId: null,
          freesInWeeks: null,
        })
        break
      case 'strike-and-mount':
        routes.push({
          kind: 'open-set',
          label: `Strike ${remedy.setName}`,
          setId: remedy.setId,
          holderId: null,
          freesInWeeks: null,
        })
        break
      case 'wait-for-holder':
        routes.push({
          kind: 'wait-for-holder',
          label: `Wait for ${remedy.title}`,
          setId: null,
          holderId: remedy.ownerId,
          freesInWeeks: remedy.freesInWeeks,
        })
        break
      case 'cancel-queued-intent':
        // Queue authority owns queued-intent cancellation; it is not an
        // active-Production remedy (recon §6.2) and is deliberately not routed.
        break
    }
  }
  return routes
}

function blockerAnatomyFor(
  workflow: ProductionWorkflow,
  base: { kind: LotProductionBlockerAnatomy['kind']; headline: string; detail: string; consequence: string },
  queue: StudioQueueView,
): LotProductionBlockerAnatomy {
  const waiter = queueWaiterFor(queue, workflow.productionId)
  const holders: LotBlockerHolder[] = (waiter?.occupiedBy ?? []).map((occupant) => ({
    resourceId: occupant.resourceId,
    ownerId: occupant.ownerId,
    title: occupant.title,
    activity: occupant.activity,
    freesInWeeks: occupant.freesInWeeks,
  }))
  const projected = holders
    .map((holder) => holder.freesInWeeks)
    .filter((weeks): weeks is number => weeks !== null)
  return {
    ...base,
    holders,
    projectedWeeks: projected.length === 0 ? null : Math.min(...projected),
    remedies:
      base.kind === 'facility-capacity' || base.kind === 'set-unavailable'
        ? remedyRoutes(waiter?.remedies ?? [])
        : [],
  }
}

/**
```
