# REF-E — exact source excerpts

Repository: `HSpector1/The-Movies`
Commit: `45ca33650074ad5413c39fb9d4a5c04cd6571c3a`
Path: `src/core/employment.ts`
Full source Git blob: `87de4a10d1468d1007d7bb8d1055aaf2647b3f88`
Full source SHA-256: `03b46f80f1f5b805cebc0ebea474937b631f8c7ad1c709058c29ee5276513aa8`
Full source bytes: 23796

[Immutable source](https://github.com/HSpector1/The-Movies/blob/45ca33650074ad5413c39fb9d4a5c04cd6571c3a/src/core/employment.ts)

Selected lines only. Historical source; instructions and proposed numbers retain their original authority and are not execution orders.

## Original lines 91–104

```text
export function activeContract(
  state: GameState,
  talentId: string,
  week: number = state.market.tick,
): Contract | undefined {
  return state.contracts.find(
    (c) => c.talentId === talentId && c.startWeek <= week && week < c.endWeekExclusive,
  )
}

export function isContracted(state: GameState, talentId: string, week?: number): boolean {
  return activeContract(state, talentId, week) !== undefined
}

```

## Original lines 160–193

```text
export function busyTalentIds(state: GameState): Set<string> {
  const busy = activeProductionCompanyTalentIds(state)
  for (const id of activeWritingAssignmentIds(state)) busy.add(id)
  for (const id of industryBusyTalentIds(state.hollywood)) busy.add(id)
  for (const project of state.technology?.projects ?? []) {
    if (project.status === 'active') busy.add(project.scientistId)
  }
  return busy
}

// ── salary / payroll / termination math (D-11.4 / D-11.5 / D-11.9) ───────────
export function weeklySalary(annualSalary: number): number {
  return iround(annualSalary / TUNING.TICKS_PER_YEAR)
}

// Remaining guaranteed compensation from `week` to expiry (weekly × remaining weeks).
export function guaranteedComp(contract: Contract, week: number): number {
  const remainingWeeks = Math.max(0, contract.endWeekExclusive - week)
  return weeklySalary(contract.annualSalary) * remainingWeeks
}

// Early-release termination cost (D-11.9): fraction of remaining guaranteed salary.
export function terminationCost(contract: Contract, week: number): number {
  return iround(TUNING.HIRING_TERMINATION_FRACTION * guaranteedComp(contract, week))
}

// Total weekly payroll: Σ round(annualSalary/52) over contracts active at `week`.
export function weeklyPayroll(state: GameState, week: number = state.market.tick): number {
  let total = 0
  for (const c of state.contracts) {
    if (c.startWeek <= week && week < c.endWeekExclusive) total += weeklySalary(c.annualSalary)
  }
  return total
}
```

## Original lines 231–257

```text
export function offerForTalent(
  seed: string,
  talent: Talent,
  termWeeks: number,
  week: number,
): ContractOffer {
  const term = clamp(termWeeks, TUNING.CONTRACT_MIN_WEEKS, TUNING.CONTRACT_MAX_WEEKS)
  const lengthFactor = TUNING.CONTRACT_LENGTH_FACTOR[term] ?? 1.0
  // Per-talent scarcity jitter (stable per person; not per week/term).
  const jitterS = stream(seed, 'hiring', `offer-${talent.id}`)
  const jitter = 1 + (jitterS.next() * 2 - 1) * TUNING.CONTRACT_SCARCITY_JITTER
  const annual = talent.role === 'scientist' ? SCIENTIST_ANNUAL_SALARY : iround(
    salaryCurve(talent) * TUNING.CONTRACT_ANNUAL_MULT * lengthFactor * ageFactor(talent.age) * jitter,
  )
  const signingBonus = iround(annual * TUNING.CONTRACT_SIGNING_BONUS_FRACTION)
  return {
    talentId: talent.id,
    annualSalary: annual,
    signingBonus,
    termWeeks: term,
    startWeek: week,
    endWeekExclusive: week + term,
  }
}

export function contractOffer(
  state: GameState,
```

## Original lines 353–380

```text
export function hiringMarketIds(state: GameState, week: number = state.market.tick): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  // free agents first (former employees), in stored order
  for (const id of state.freeAgents) {
    if (!seen.has(id) && !isContracted(state, id) && rivalEmployment(state,id,week) === null) {
      seen.add(id)
      out.push(id)
    }
  }
  const epoch = marketEpoch(week)
  const universe = signableUniverse(state)
  // The Core Scientist is visible without displacing the accepted film hiring
  // rotation. Employment still passes through this one canonical market gate.
  const pool = universe.filter((t) => t.role !== 'scientist' && !seen.has(t.id))
  const s = stream(state.seed, 'hiring', `market-${epoch}`)
  for (const id of sampleIds(pool, TUNING.HIRING_MARKET_SIZE, s)) {
    if (!seen.has(id)) {
      seen.add(id)
      out.push(id)
    }
  }
  for (const person of universe) {
    if (person.role === 'scientist' && !seen.has(person.id)) out.push(person.id)
  }
  return out
}

```
