# REF-F — exact source excerpts

Repository: `HSpector1/The-Movies`
Commit: `45ca33650074ad5413c39fb9d4a5c04cd6571c3a`
Path: `src/core/placement.ts`
Full source Git blob: `795fe1f3564a308a188d735baba88958b3d7d0b7`
Full source SHA-256: `68b54b237fd1c3c16f536a2deb2eaa6fc890d7ca812c13324b0521de423201a5`
Full source bytes: 106643

[Immutable source](https://github.com/HSpector1/The-Movies/blob/45ca33650074ad5413c39fb9d4a5c04cd6571c3a/src/core/placement.ts)

Selected lines only. Historical source; instructions and proposed numbers retain their original authority and are not execution orders.

## Original lines 375–391

```text
/** Σ weekly operating cost of every OPERATIONAL placed facility. */
export function weeklyPlacementOperatingCost(placement: StudioPlacement): number {
  let total = 0
  for (const facility of placement.facilities) {
    if (facility.status !== 'operational') continue
    const blueprint = blueprintById(facility.blueprintId)
    if (blueprint === null) {
      throw new Error(`placement: operating cost references unknown blueprint "${facility.blueprintId}"`)
    }
    total += blueprint.weeklyOperatingCost
  }
  return total
}

/**
 * The regime a commit requires: managed operations AND managed placement AND an
 * engaged economy AND a founded studio. This is deliberately NOT a
```

## Original lines 780–844

```text
export function queryFacilityInstallation(state: GameState, request: FacilityInstallationRequest): FacilityInstallationQuote {
  const blueprint = blueprintById(request.blueprintId)
  const target = state.operations.facilities.find((facility) => facility.id === request.targetFacilityId)
  const rejections: FacilityInstallationRefusal[] = []
  if (!placementRegimeReady(state)) rejections.push('regimeNotReady')
  if (blueprint?.installationTargetCapability === undefined) rejections.push('unknownInstallation')
  if (target === undefined) rejections.push('unknownTarget')
  else if (blueprint?.installationTargetCapability !== target.capability) rejections.push('incompatibleTarget')
  if (installationTargetBody(state, request.targetFacilityId) === null) rejections.push('targetHasNoBody')
  if (state.placement.facilities.some((placed) => placed.installation?.targetFacilityId === request.targetFacilityId && placed.blueprintId === request.blueprintId)) {
    rejections.push('alreadyInstalled')
  }
  // A standing idle set is compatible with adaptation; live work and set construction are not.
  // Completed modules keep a destruction hold but do not prevent a different module's work.
  const holders = facilityEngagements(state, request.targetFacilityId).filter((held) => {
    if (held.kind === 'set') {
      const set = state.sets.find((candidate) => candidate.id === held.holderId)
      if (set?.status === 'standing') return false
    }
    if (held.kind === 'installation') {
      return state.placement.facilities.some((placed) => placed.projectId === held.holderId && placed.status === 'underConstruction')
    }
    if (held.kind === 'research') {
      return state.technology.projects.some((project) => project.id === held.holderId && project.status === 'active')
    }
    return true
  })
  if (holders.length > 0) rejections.push('targetEngaged')
  const availability = blueprint === null ? null : evaluateBlueprintRequirements(state, blueprint, FACILITY_BLUEPRINTS)
  if (availability !== null && !availability.available) rejections.push('requirementsUnmet')
  const cost = blueprint?.capex ?? 0
  if (!canAfford(state, cost).ok) rejections.push('insufficientFunds')
  return {
    ok: rejections.length === 0, blueprintId: request.blueprintId, targetFacilityId: request.targetFacilityId,
    cost, buildWeeks: blueprint?.buildWeeks ?? 0, completesOnWeek: state.market.tick + (blueprint?.buildWeeks ?? 0),
    weeklyOperatingCost: blueprint?.weeklyOperatingCost ?? 0,
    components: blueprint?.installationComponents ?? [], rejections, holders, unmetRequirements: availability?.unmet ?? [],
  }
}

/** Atomic P09 physical-work commit; a refused or stale request is byte-neutral. */
export function commitFacilityInstallation(state: GameState, request: FacilityInstallationRequest): GameState {
  const quote = queryFacilityInstallation(state, request)
  if (!quote.ok) return state
  const blueprint = blueprintById(request.blueprintId)!
  const body = installationTargetBody(state, request.targetFacilityId)!
  const id = state.placement.nextPlacementId
  const placed: PlacedFacility = {
    id, blueprintId: blueprint.id, origin: { ...body.origin }, parcelId: body.parcelId, cells: [],
    facilityId: deriveIdentity(blueprint.facilityIdBase, id, takenFacilityIds(state)),
    projectId: deriveIdentity(blueprint.projectIdBase, id, takenProjectIds(state)),
    placedWeek: state.market.tick, completesWeek: quote.completesOnWeek, status: 'underConstruction',
    installation: { targetFacilityId: request.targetFacilityId },
  }
  return {
    ...state,
    studio: { ...state.studio, cash: state.studio.cash - quote.cost },
    ledger: [...state.ledger, { week: state.market.tick, kind: 'constructionCapex', amount: -quote.cost,
      constructionProjectId: placed.projectId, note: blueprint.ledgerNote }],
    placement: { ...state.placement, nextPlacementId: id + 1, facilities: [...state.placement.facilities, placed] },
  }
}

/** Sequential phase disclosure derives from the one committed P09 completion clock. */
export function facilityInstallationPhase(placed: PlacedFacility, currentWeek: number): string | null {
```

## Original lines 869–895

```text
export function completeDuePlacements(
  placement: StudioPlacement,
  operations: StudioOperations,
  arrivalWeek: number,
): PlacementCompletion {
  if (placement.mode !== 'managed' || placement.facilities.length === 0) {
    return { placement, operations, completed: [] }
  }
  const due = placement.facilities
    .filter((facility) => facility.status === 'underConstruction' && facility.completesWeek <= arrivalWeek)
    .sort((a, b) => a.id - b.id)
  if (due.length === 0) return { placement, operations, completed: [] }

  if (operations.mode !== 'managed') {
    throw new Error('tick: a placed facility cannot complete outside managed operations')
  }
  const facilities = [...operations.facilities]
  const completedIds = new Set<number>()
  const completed: PlacedFacility[] = []
  for (const facility of due) {
    if (facility.completesWeek < arrivalWeek) {
      throw new Error(
        `tick: placed facility ${String(facility.id)} missed its committed completion week ${String(facility.completesWeek)}`,
      )
    }
    if (facilities.some((existing) => existing.id === facility.facilityId)) {
      throw new Error(
```

## Original lines 1049–1063

```text

  // FAIL-CLOSED. An underConstruction site cannot hold an engagement, and is
  // still asked, because "it cannot happen" is exactly the assumption that stops
  // being true without anyone noticing.
  const holders = facilityEngagements(state, placed.facilityId)
  // Core has no physical-installation cancellation/disposition law. Keep its
  // durable capex/opex proof and the exact target attached until that law exists.
  if (placed.installation !== undefined) holders.push({
    kind: 'installation', facilityId: placed.facilityId, holderId: placed.projectId,
    activity: 'installed equipment retained on its exact facility',
  })
  if (holders.length > 0) {
    return {
      refusal: {
        code: 'facilityEngaged',
```

## Original lines 1178–1214

```text
export function demolishFacility(
  state: GameState,
  request: FacilityDemolitionRequest,
): GameState {
  if (facilityDemolitionRefusal(state, request) !== null) return state
  const placed = state.placement.facilities.find(
    (candidate) => candidate.id === request.placementId,
  )
  if (placed === undefined) return state // unreachable: the refusal probe passed
  const blueprint = blueprintById(placed.blueprintId)
  if (blueprint === null) return state // unreachable: same

  const refund = facilityDemolitionRefund(blueprint)
  const entry: LedgerEntry = {
    week: state.market.tick,
    kind: 'facilityDemolitionRefund',
    amount: refund,
    constructionProjectId: placed.projectId,
    note: FACILITY_DEMOLITION_LEDGER_NOTE,
  }

  const operations: StudioOperations =
    placed.status === 'operational'
      ? {
          ...state.operations,
          facilities: state.operations.facilities.filter(
            (facility) => facility.id !== placed.facilityId,
          ),
        }
      : state.operations

  return {
    ...state,
    studio: { ...state.studio, cash: state.studio.cash + refund },
    ledger: [...state.ledger, entry],
    operations,
    placement: {
```
