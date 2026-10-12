// A: the r4 verification's forgery forms (B1-B10, A, C, D, B5c) re-tried against r6.
import { out, judge, rules, weekZeroFounded, injectSecondGrant, keepLandmarks, withFund, landmarks, fundOf, TUNING } from './probe-common.ts'

for (const seed of ['p1364-second-grant-01', 'fixverify-r6-02']) {
  out('\n===== seed', seed)
  const { founded, week30 } = weekZeroFounded(seed)
  const { open, closed } = injectSecondGrant(week30)
  out('premise closed: landmarks/fund/origin', [landmarks(closed), fundOf(closed), closed.hollywood.origin])
  const observed = (s: any) => withFund(s, (f) => { f.provenance = 'observed-open-draft' })
  const redated = { ...closed, studioHistory: { ...closed.studioHistory, rows: keepLandmarks(closed, (w) => w !== 30).studioHistory.rows.map((r: any) => (r.kind === 'studioFounded' ? { ...r, week: 30 } : r)) } }
  const forms: [string, any][] = [
    ['B1 open second draft (landmark 0 kept)', open],
    ['B3 closed second grant, landmarks [0,30]', closed],
    ['B4 closed, own week-30 landmark removed', keepLandmarks(closed, (w) => w !== 30)],
    ['B9 week-0 founded campaign with a draft re-opened, null fund', { ...week30, founding: { applicantIds: [], budget: TUNING.HIRING_FOUNDING_BUDGET, spentBonus: 0 } }],
    ['B5 = A: week-0 landmark deleted, opened kept', keepLandmarks(closed, (w) => w !== 0)],
    ['B5b: week-0 landmark re-dated to 30, second dropped', redated],
    ['B6 = C: every landmark deleted, opened', keepLandmarks(closed, () => false)],
    ['D = B7: every landmark deleted, relabelled observed', observed(keepLandmarks(closed, () => false))],
    ['B5c: week-0 landmark deleted, relabelled observed', observed(keepLandmarks(closed, (w) => w !== 0))],
    ['B10: open second draft, every landmark deleted', keepLandmarks(open, () => false)],
    ['B10c: open second draft, every landmark deleted, relabelled observed', observed(keepLandmarks(open, () => false))],
  ]
  for (const [label, s] of forms) {
    judge(label, s)
    out('   rules', rules(s))
  }
  void founded
}
