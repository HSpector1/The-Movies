// ── D-17A/T6 — discoverability exposure, with its numbers ─────────────────────
// The D-13 mechanic multiplies a film's OPENING by a governed, clipped factor when the
// package lacks reach support. The player used to be told this in prose, with no figures:
// not how short the support was, not how wide the band could get, not what it did to the
// range already on screen.
//
// PURE display. `exposure` is the ENGINE's own rule (`discoveryExposure`, the same
// computation `resolveReception` applies), passed in by the adapter. The band bounds are
// read from the selector's own `floor`/`ceil` — never hardcoded here, so a D-17B
// recalibration of DISC_FLOOR/DISC_CEIL moves this copy automatically.
//
// INFORMATION DISCIPLINE: no realized draw, no probability claim beyond the clip bounds the
// engine actually enforces. "Can land anywhere between" is exactly what is known.

import type { DiscoveryExposureView } from '../engine/adapter.ts'
import { money, pct } from '../format.ts'

export function DiscoveryExposureLine({
  exposure,
  expectedOpening,
  testid = 'discovery-exposure',
}: {
  exposure: DiscoveryExposureView
  /** the forecast's expected opening, when the surface has one — enables the dollar band. */
  expectedOpening?: number | undefined
  testid?: string
}) {
  const mult = (m: number) => `${m}×`
  if (!exposure.exposed) {
    return (
      <p className="hint" data-testid={testid} style={{ margin: 0 }}>
        <strong>Reach-supported.</strong> Reach support {pct(exposure.reachSupport)} meets the{' '}
        {pct(exposure.threshold)} this film needs, so its opening carries no discoverability
        variance.
      </p>
    )
  }
  return (
    <p className="reason" data-testid={testid} style={{ margin: 0 }}>
      <strong>Discoverability exposure.</strong> Reach support {pct(exposure.reachSupport)} is
      below the {pct(exposure.threshold)} this film needs to open reliably ({pct(exposure.shortfall)}{' '}
      short). Its opening turnout can land anywhere between {mult(exposure.floor)} and{' '}
      {mult(exposure.ceil)} the expected level
      {expectedOpening !== undefined
        ? ` — worst case ${money(expectedOpening * exposure.floor)}, best case ${money(
            expectedOpening * exposure.ceil,
          )} against an expected ${money(expectedOpening)}`
        : ''}
      . Awareness, marketing and cast draw are what move reach support.
    </p>
  )
}
