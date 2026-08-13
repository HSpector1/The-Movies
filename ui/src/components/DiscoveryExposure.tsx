// ── D-17A/T6 — discoverability exposure, with its numbers ─────────────────────
// The D-13 mechanic multiplies a film's OPENING by a governed, clipped factor when the
// package lacks reach support. The player used to be told this in prose, with no figures:
// not how short the support was, not how wide the band could get, not what it did to the
// range already on screen.
//
// PURE display. `exposure` is the ENGINE's own rule (`discoveryExposure`, the same
// computation `resolveReception` applies), passed in by the adapter. Every bound is read
// off the selector — never hardcoded here.
//
// D-17A FIX-PASS — three corrections:
//   1. REGIME. `reception.ts:643` zeroes the discoverability spread when the economy is not
//      engaged, so the multiplier is identically 1 there. The selector now reports
//      `engaged`/`exposed` honestly and this block renders nothing on that path — the same
//      gating the marketing block already had (`mktEff.engaged`).
//   2. BAND. The band shown is the one the engine can actually produce at the forecast's own
//      z (DISC_FORECAST_LOW_Z = 1.28): exp(∓spread·z), clipped. Quoting the hard 0.3x/1.8x
//      clips for every exposed package overclaimed by orders of magnitude — a 2% shortfall's
//      real band is [0.99x, 1.01x] — and contradicted the ForecastDisplay directly above it,
//      whose low edge is computed from that same spread. The clips are named only when the
//      band actually reaches them.
//   3. BOUNDARY. "Reach support 45% is below the 45% this film needs (0% short)" was
//      self-contradictory rounding. Within one point of the threshold both figures render to
//      one decimal, so the sentence can never contradict itself.
//
// INFORMATION DISCIPLINE: no realized draw, no probability claim beyond the band the engine
// enforces at its own stated z.

import type { DiscoveryExposureView } from '../engine/adapter.ts'
import { money } from '../format.ts'

/** A multiplier for display: two decimals, trailing zeros trimmed (0.85x → "0.85×"). */
const mult = (m: number): string => `${Number(m.toFixed(2))}×`

/**
 * Percentages for the support-vs-threshold sentence, rendered at ENOUGH PRECISION that the two
 * cannot come out equal. Zero decimals normally; one when they are within a point; two if even
 * that still collapses them (a support of 0.4499 renders "45.0%" at one decimal, which is how
 * "45% is below 45%" got on screen in the first place). Two decimals is the cap — beyond that
 * the shortfall is negligible and the sentence below says so instead of quoting a band.
 */
function supportPair(support: number, threshold: number): { support: string; threshold: string } {
  for (const d of [0, 1, 2]) {
    const s = `${(support * 100).toFixed(d)}%`
    const t = `${(threshold * 100).toFixed(d)}%`
    if (s !== t || d === 2) return { support: s, threshold: t }
  }
  /* c8 ignore next */
  return { support: `${support * 100}%`, threshold: `${threshold * 100}%` }
}

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
  // Not engaged ⇒ the engine applies a multiplier of exactly 1. There is no exposure and no
  // "reach-supported" reassurance to give either: the mechanic simply is not running.
  if (!exposure.engaged) return null

  const p = supportPair(exposure.reachSupport, exposure.threshold)
  if (!exposure.exposed) {
    return (
      <p className="hint" data-testid={testid} style={{ margin: 0 }}>
        <strong>Reach-supported.</strong> Reach support {p.support} meets the {p.threshold} this
        film needs, so its opening carries no discoverability variance.
      </p>
    )
  }
  // A shortfall small enough that the band the engine can produce is inside ±1% of the expected
  // opening. Quoting "between 1× and 1×" there would be noise dressed as a warning.
  if (exposure.bandHigh - exposure.bandLow < 0.01) {
    return (
      <p className="hint" data-testid={testid} style={{ margin: 0 }}>
        <strong>Reach support is marginal.</strong> Reach support is {p.support} against the{' '}
        {p.threshold} this film needs to open reliably &mdash; a shortfall this small leaves the
        opening within 1% of its expected level either way.
      </p>
    )
  }
  const clipNote =
    exposure.clippedLow || exposure.clippedHigh
      ? ` That band runs into the engine's hard ${mult(exposure.floor)}/${mult(exposure.ceil)} clip.`
      : ''
  return (
    <p className="reason" data-testid={testid} style={{ margin: 0 }}>
      <strong>Discoverability exposure.</strong> Reach support is {p.support} against the{' '}
      {p.threshold} this film needs to open reliably. Its opening turnout can land anywhere
      between {mult(exposure.bandLow)} and {mult(exposure.bandHigh)} the expected level
      {expectedOpening !== undefined
        ? ` — worst case ${money(expectedOpening * exposure.bandLow)}, best case ${money(
            expectedOpening * exposure.bandHigh,
          )} against an expected ${money(expectedOpening)}`
        : ''}
      .{clipNote} Awareness, marketing and cast draw are what move reach support.
    </p>
  )
}
