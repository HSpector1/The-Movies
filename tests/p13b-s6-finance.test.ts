// ── P13B-S6 test 6: refund line in the calendar year of the refund week,
// prior-year capex historical ────────────────────────────────────────────────
//
// Requirement-derived from "S6 — Option-B installation cancellation..." task
// expansion, "Tests" item 6, and the "Delegated implementation decisions"
// bullet: "the finance report shows refunds as their own line in the calendar
// year of the refund week, never as a retroactive edit of the year the capex
// was paid; the report's yearly capex totals stay historical."
//
// RED-by-design: see tests/p13b-s6-receipts.test.ts's header for the full
// statement of the process rule this file follows. `recordedFinancePeriod`
// (src/core/financeReport.ts) and `campaignDate` (src/core/calendar.ts) are
// REAL, EXISTING, version-agnostic functions — `recordedFinancePeriod` takes
// an explicit `[fromWeek, toWeekInclusive]` window, so a calendar-YEAR window
// is built directly from `campaignDate`'s own `year=1920+floor(week/52)` law
// rather than needing a new "yearly report" producer. `FINANCE_CATEGORIES`
// (a `Record<LedgerKind, string>`) requires a label for every `LedgerKind`,
// so the mere existence of a `constructionRefund` category row is itself
// gated on the new ledger kind existing — this file's RED cause is still the
// single import of `cancellationQuote`, never a missing label.
//
// MEASURED (throwaway vite-node probe against this file's own fixture, not
// guessed): committing the sound adoption at week 303 lands in calendar year
// 1925 (`campaignDate(303).year === 1925`; year 1925 spans weeks [260,312)).
// Cancelling the stage project at week 313 (elapsed 10 of 12 — still
// `underConstruction`, since its completesWeek is 315) lands in calendar year
// 1926 (weeks [312,364)), genuinely crossing the year boundary without any
// invented week. The stage's own `constructionCapex` row is exactly -675,000
// (site 450,000 + installation 150,000 + capture 75,000) at week 303; no other
// capex event touches this world in [260,364) besides the Post's own -300,000
// row, also at week 303 (same year, unrelated to this test's own project).

import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { campaignDate } from '../src/core/calendar.js'
import { recordedFinancePeriod } from '../src/core/financeReport.js'
import { advanceTo } from '../src/harness/p13a/fixtures.js'
import { s6SoundReady } from '../src/harness/p13b/s6-fixtures.js'
// RED-by-design: src/core/installationCancellation.ts does not exist yet.
import { cancellationQuote } from '../src/core/installationCancellation.js'

describe('P13B-S6 finance: refund lands in the refund week\'s own calendar year (test 6)', () => {
  it('the constructionRefund line appears only in the calendar year of the CANCEL week; the CAPEX year is unaffected before and after cancellation', () => {
    const { state: committed, stageProjectId } = s6SoundReady() // committed week 303, year 1925
    expect(campaignDate(303).year).toBe(1925)
    expect(campaignDate(313).year).toBe(1926)

    const capexYear = { from: 260, to: 311 } // calendar year 1925
    const refundYear = { from: 312, to: 363 } // calendar year 1926

    const beforeCancel = advanceTo(committed, 313)
    // Sanity: the stage capex row is real, dated in 1925, and this is the
    // premise the whole test depends on.
    const y1925Before = recordedFinancePeriod(beforeCancel, capexYear.from, capexYear.to, 'y1925-before', 'CY1925 before cancel')
    const stageCapexRowBefore = y1925Before.capitalContributors.rows.find(r => r.constructionProjectId === stageProjectId)!
    expect(stageCapexRowBefore.amount).toBe(-675_000)
    expect(y1925Before.categories.find(c => c.kind === 'constructionRefund')).toBeUndefined()

    const cancelled = applyActions(beforeCancel, [{ kind: 'cancelInstallation', projectId: stageProjectId } as never])
    const cancelWeek = cancelled.market.tick
    expect(cancelWeek).toBe(313)
    const quote = cancellationQuote(beforeCancel, { projectId: stageProjectId })
    // elapsed 10 of 12: site[0,9) completed (450,000 paid); installation[9,12)
    // inProgress 1 of 3 (50,000 paid, 100,000 refunded); capture (zero-week,
    // authored after installation) unstarted since installation has not
    // completed (75,000 refunded). Refund = 100,000 + 75,000 = 175,000.
    expect(quote.refund).toBe(175_000)

    // "prior-year capex historical": year 1925's capex category is IDENTICAL
    // before and after the cancellation — the refund never retroactively edits
    // the year the capex was paid.
    const y1925After = recordedFinancePeriod(cancelled, capexYear.from, capexYear.to, 'y1925-after', 'CY1925 after cancel')
    const stageCapexRowAfter = y1925After.capitalContributors.rows.find(r => r.constructionProjectId === stageProjectId)!
    expect(stageCapexRowAfter.amount).toBe(stageCapexRowBefore.amount)
    expect(y1925After.categories.find(c => c.kind === 'constructionCapex')!.amount)
      .toBe(y1925Before.categories.find(c => c.kind === 'constructionCapex')!.amount)
    expect(y1925After.categories.find(c => c.kind === 'constructionRefund')).toBeUndefined() // the refund week is NOT in this year

    // The refund lands as its own line in 1926 — the calendar year of the
    // cancel/refund week — never merged into 1925's totals.
    const y1926 = recordedFinancePeriod(cancelled, refundYear.from, refundYear.to, 'y1926', 'CY1926')
    const refundCategory = y1926.categories.find(c => c.kind === 'constructionRefund')
    expect(refundCategory).toBeDefined()
    expect(refundCategory!.amount).toBe(quote.refund)
    expect(refundCategory!.entryCount).toBe(1)
  })
})
