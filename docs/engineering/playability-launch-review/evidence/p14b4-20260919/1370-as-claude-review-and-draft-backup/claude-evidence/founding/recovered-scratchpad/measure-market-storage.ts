// 1365 storage measurement: bytes per persisted assessment row on the rival-only route (seed
// p15a1-w2-market-02, weeks 0..160) and on the held-slate route, as stableStringify writes them.
import { stableStringify, makeSave, exportSave } from '../../../../../Users/zacheryspector/studio-specialists/founding/src/core/save.js'
import { rivalRouteAt, routeAt } from '../../../../../Users/zacheryspector/studio-specialists/founding/tests/helpers/p15a1-market-route.js'
import type { GameState } from '../../../../../Users/zacheryspector/studio-specialists/founding/src/core/types.js'

function report(label: string, state: GameState): void {
  const root = (state as unknown as { sharedMarket: { assessments: Record<string, unknown>[] } }).sharedMarket
  const rows = root.assessments
  const rootBytes = Buffer.byteLength(stableStringify(root))
  const saveBytes = Buffer.byteLength(exportSave(makeSave(state)))
  const perField: Record<string, number> = {}
  for (const row of rows) for (const [key, value] of Object.entries(row)) perField[key] = (perField[key] ?? 0) + Buffer.byteLength(JSON.stringify(value)) + key.length + 3
  const reasonIds = rows.reduce((n, row) => n + (row.reasons as { sourceReleaseIds: string[] }[]).reduce((m, r) => m + r.sourceReleaseIds.length, 0), 0)
  const reasons = rows.reduce((n, row) => n + (row.reasons as unknown[]).length, 0)
  console.log(JSON.stringify({ label, week: state.market.tick, rows: rows.length, rootBytes, saveBytes,
    rootShare: rootBytes / saveBytes, bytesPerRow: rows.length ? rootBytes / rows.length : null, reasons, reasonIds,
    perFieldPerRow: Object.fromEntries(Object.entries(perField).map(([k, v]) => [k, Math.round(v / Math.max(1, rows.length))])) }))
}
report('rival-route', rivalRouteAt(160))
report('held-route', routeAt(160))
