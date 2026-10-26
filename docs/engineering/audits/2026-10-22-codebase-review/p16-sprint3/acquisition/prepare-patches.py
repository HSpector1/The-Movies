from pathlib import Path
import difflib
w=Path('/Users/zacheryspector/studio-scratch/p16-rebase-20261024-wt');o=Path(__file__).parent
source='src/core/acquisition.ts';old=(w/source).read_text();new=old.replace('import { guaranteedComp, terminationCost, weeklySalary }','import { guaranteedComp, terminationCost }')
new=new.replace('// Fixed cost and reserve retain their existing rounded-up quote policy.','// The ask rounds the complete premium-plus-cash sum; the reserve rounds the aggregate resulting fixed cost.')
new=new.replace('Math.ceil((libraryValue * (100 + TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT)) / 100) + postExitCash','Math.ceil((libraryValue * (100 + TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT)) / 100 + postExitCash)')
new=new.replace('weeklySalary: weeklySalary(e.terms.annualSalary)','weeklySalary: e.terms.annualSalary / TUNING.TICKS_PER_YEAR')
new=new.replace('    const resultingWeeklyFixedCost = Math.ceil(', '    // Reserve projection sums retained salary rates before rounding; actual payroll/exits keep their own law.\n    const resultingWeeklyFixedCost = Math.ceil(',1)
(o/'source.PROPOSED.patch').write_text(''.join(difflib.unified_diff(old.splitlines(True),new.splitlines(True),fromfile='a/'+source,tofile='b/'+source)))
patch=[]
for name in ['tests/p16-r2-acquisition.test.ts','tests/p16c-acquisition.test.ts']:
 old=(w/name).read_text();new=old
 if 'r2-acquisition' in name:
  new=new.replace('Math.ceil((v.total * (100 + TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT)) / 100) + postExitCash','Math.ceil((v.total * (100 + TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT)) / 100 + postExitCash)')
  new=new.replace("its ask prices the cash that moves at par; money is whole dollars", "its ask is whole dollars and actual cash moves at par")
  new=new.replace("at the ask the buyer\\'s outlay is exactly the premium-adjusted library value, never a windfall", "at the ask the buyer\\'s outlay covers the premium-adjusted library value with less than one dollar of rounding")
  new=new.replace("const valueAsk = Math.ceil(((v.kind === 'available' ? v.total : 0) * (100 + TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT)) / 100)","const premiumValue = ((v.kind === 'available' ? v.total : 0) * (100 + TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT)) / 100")
  new=new.replace('    expect(q.outlay).toBe(valueAsk)','''    expect(q.targetCashBeforeExits).toBe(state.hollywood!.businesses.find(b => b.studioId === r03)!.account.cash)
    expect(Number.isInteger(q.targetCashBeforeExits)).toBe(false)
    expect(q.postExitCash).toBe(q.targetCashBeforeExits - q.exitCharges)
    expect(q.outlay).toBe(theAsk - q.postExitCash)
    expect(q.outlay - premiumValue).toBeGreaterThanOrEqual(0)
    expect(q.outlay - premiumValue).toBeLessThan(1)''')
  new=new.replace('for (const n of [q.targetCashBeforeExits, q.exitCharges, q.postExitCash, q.outlay, q.guarantees, q.resultingWeeklyFixedCost, q.reserveAfter]) expect(Number.isSafeInteger(n), String(n)).toBe(true)', 'for (const n of [q.targetCashBeforeExits, q.postExitCash, q.outlay]) expect(Number.isFinite(n), String(n)).toBe(true)\n    for (const n of [q.consideration, q.ask, q.exitCharges, q.guarantees, q.resultingWeeklyFixedCost, q.reserveAfter]) expect(Number.isSafeInteger(n), String(n)).toBe(true)')
 else:
  new=new.replace('const postExitCash = Math.floor(cash(r03))','const postExitCash = cash(r03)')
  new=new.replace('const ask = Math.ceil((total * (100 + TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT)) / 100) + postExitCash','const ask = Math.max(0, Math.ceil((total * (100 + TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT)) / 100 + postExitCash))')
  marker='    expect(acq.absorptionAsk(total, -10 * total - 1)).toBe(0)'
  new=new.replace(marker,marker+'''\n    // Whole-dollar consent rounds the complete sum, including positive and negative fractional cash.
    expect(acq.absorptionAsk(1, 0.25)).toBe(Math.max(0, Math.ceil(1 * (100 + TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT) / 100 + 0.25)))
    expect(acq.absorptionAsk(10, -1.25)).toBe(Math.max(0, Math.ceil(10 * (100 + TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT) / 100 - 1.25)))
    expect(acq.absorptionAsk(0, -0.25)).toBe(0)''')
  new=new.replace('Math.floor(cash(r03))','cash(r03)')
  new=new.replace('s + Math.round(c.annualSalary / TUNING.TICKS_PER_YEAR)','s + c.annualSalary / TUNING.TICKS_PER_YEAR')
 # Preserve all unrelated downstream law assertions and integer-only quote parsers: they are valid under the approved ask.
 assert new!=old
 patch.extend(difflib.unified_diff(old.splitlines(True),new.splitlines(True),fromfile='a/'+name,tofile='b/'+name))
 (o/Path(name).name).write_text(new)
(o/'tests.PROPOSED.patch').write_text(''.join(patch))
