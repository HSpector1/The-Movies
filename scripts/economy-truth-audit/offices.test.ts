import { describe, expect, it } from 'vitest'

import {
  OFFICE_SCHEMA_VERSION,
  OFFICE_SEED_COUNT,
  aggregateOffices,
  officeSeed,
  runOfficeCell,
} from './offices.js'

describe('economy truth audit office lens', () => {
  it('uses stable named corpus seeds', () => {
    expect(OFFICE_SEED_COUNT).toBe(100)
    expect(officeSeed(1)).toBe('eta-office-001')
    expect(officeSeed(100)).toBe('eta-office-100')
  })

  it('is deterministic and preserves the Office III marginal comparison', () => {
    const left = runOfficeCell('eta-office-smoke')
    const right = runOfficeCell('eta-office-smoke')
    expect(left).toEqual(right)
    expect(left.schemaVersion).toBe(OFFICE_SCHEMA_VERSION)
    expect(left.included, left.exclusion ?? 'expected smoke cell to be included').toBe(true)

    const aggregate = aggregateOffices([left])
    expect(aggregate.validation.submittedCells).toBe(1)
    expect(aggregate.effects.office3MarginalVsOffice2.interpretation).toContain('marginal Office III')
    expect(aggregate.validation.excludedCells + aggregate.validation.includedCells).toBe(1)

    if (left.included) {
      expect(left.rngIdenticalAtCommission).toBe(true)
      expect(left.none.packageMatched).toBe(true)
      expect(left.office2.packageMatched).toBe(true)
      expect(left.office2Plus3.packageMatched).toBe(true)
      expect(left.none.releaseWeek).not.toBeNull()
      expect(left.office2.facilityCapex).toBeGreaterThan(left.none.facilityCapex ?? 0)
      expect(left.office2Plus3.facilityCapex).toBeGreaterThan(left.office2.facilityCapex ?? 0)
      expect(left.pairedDeltas.office2VsNone?.facilityCapex).toBeGreaterThan(0)
      expect(left.pairedDeltas.office3MarginalVsOffice2?.facilityCapex).toBeGreaterThan(0)
      expect(aggregate.effects.office2VsNone.studioRevenue.comparableSeeds).toBe(1)
      expect(aggregate.effects.office3MarginalVsOffice2.facilityCapex.delta.median).toBeGreaterThan(0)
    }
  })
})
