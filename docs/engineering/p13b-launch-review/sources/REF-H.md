# REF-H — exact source excerpts

Repository: `HSpector1/The-Movies`
Commit: `45ca33650074ad5413c39fb9d4a5c04cd6571c3a`
Path: `src/core/hollywood.ts`
Full source Git blob: `530de36e09e0dec922b4258264a92ec7bd800fe0`
Full source SHA-256: `109da061da50f85658586452d9002ac5c759eabb5562dc68aad853e490b2caef`
Full source bytes: 13031

[Immutable source](https://github.com/HSpector1/The-Movies/blob/45ca33650074ad5413c39fb9d4a5c04cd6571c3a/src/core/hollywood.ts)

Selected lines only. Historical source; instructions and proposed numbers retain their original authority and are not execution orders.

## Original lines 14–44

```text
  RivalMoneyKind, StudioIdentity } from './hollywoodTypes.js'

export const RIVAL_MONEY_KINDS: readonly RivalMoneyKind[] = ['capacity','signing','payroll','overhead',
  'facilityOpex','development','production','marketing','studioRevenue','technologyAdoption']

export function uniqueIdentity(base: string, taken: Set<string>): string {
  let id = base
  for (let suffix = 1; taken.has(id); suffix++) id = `${base}-${suffix}`
  taken.add(id)
  return id
}

export function newFinancePeriod(week: number, opening: number): RivalFinancePeriod {
  return { fromWeek: week, throughWeek: week, opening, closing: opening,
    movements: Object.fromEntries(RIVAL_MONEY_KINDS.map(kind => [kind,0])) as RivalFinancePeriod['movements'] }
}

/** Local working account only. Every committed movement reconciles its period. */
export function moveRivalMoney(account: RivalAccount, kind: RivalMoneyKind, amount: number, week: number): void {
  if (!Number.isFinite(amount) || !Number.isFinite(account.cash + amount)) throw new Error('Nonfinite rival money')
  let period = account.periods[account.periods.length-1]!
  if (Math.floor(week/52) !== Math.floor(period.fromWeek/52)) {
    period = newFinancePeriod(week,account.cash)
    account.periods.push(period)
  }
  account.cash += amount
  period.movements[kind] += amount
  period.closing = account.cash
  period.throughWeek = week
}

```

## Original lines 82–110

```text
export function rivalWeeklyOperatingCost(business: RivalBusiness, hollywood: HollywoodState, week: number): number {
  const contracts = hollywood.activeEmploymentOrdinals.map(i=>hollywood.employment[i]!).filter(row => row.studioId === business.studioId && row.endedWeek === null &&
    row.terms.startWeek <= week && week < row.terms.endWeekExclusive)
  return contracts.reduce((sum,row) => sum + weeklySalary(row.terms.annualSalary),0) +
    TUNING.OVERHEAD_BASE + TUNING.OVERHEAD_PER_EMPLOYEE * contracts.length + rivalCapacityOpex(business)
}

export function rivalCapacityOpex(business: RivalBusiness): number {
  return business.operations.facilities.reduce((sum,f) => {
    switch (f.capability) {
      case 'development-casting': return sum + TUNING.BASELINE_DEVELOPMENT_CASTING_WEEKLY_OPERATING_COST
      case 'soundstage': return sum + TUNING.STAGE_STANDARD_WEEKLY_OPERATING_COST
      case 'post': return sum + TUNING.POST_BUILDING_WEEKLY_OPERATING_COST
      case 'set-scenery': return sum + TUNING.SCENERY_SHOP_WEEKLY_OPERATING_COST
      case 'laboratory': throw new Error('P13A rival capacity cannot contain a Laboratory')
      default: {const unknown: never = f.capability; throw new Error(`Unknown rival capacity: ${String(unknown)}`)}
    }
  },0)
}

/** New root only; null is the historical non-player harness, never a native campaign. */
export function rivalStartingFacilities(studioId:string):RivalBusiness['operations']['facilities'] {
  return [
    {id:`${studioId}:development`,name:'Development & Casting',capability:'development-casting',capacity:2},
    {id:`${studioId}:stage`,name:'Production Stage',capability:'soundstage',capacity:1},
    {id:`${studioId}:scenery`,name:'Scenery Shop',capability:'set-scenery',capacity:2},
    {id:`${studioId}:post`,name:'Post Building',capability:'post',capacity:2},
  ]
}
```
