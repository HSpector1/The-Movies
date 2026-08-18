// Small shared display components. Presentation only — no simulation logic.

import type { ReactNode } from 'react'
import { deltaClass, signed } from '../format.ts'
import {
  readRefusal,
  refusalFamilyId,
  UNTRANSLATED_REFUSAL_DISCLOSURE,
} from '../presentation/refusalVoice.ts'

export function Metric({
  label,
  children,
  testid,
  small,
}: {
  label: string
  children: ReactNode
  testid?: string
  small?: boolean
}) {
  return (
    <div className="metric">
      <span className="label">{label}</span>
      <span className={`value${small ? ' small' : ''} mono`} {...(testid ? { 'data-testid': testid } : {})}>
        {children}
      </span>
    </div>
  )
}

// A 0..100 standing channel with label, meaning, value and a meter bar.
export function StandingBar({
  label,
  meaning,
  value,
  testid,
}: {
  label: string
  meaning: string
  value: number
  testid?: string
}) {
  return (
    <div className="stack" {...(testid ? { 'data-testid': testid } : {})}>
      <div className="spread">
        <strong>{label}</strong>
        <span className="mono">{value.toFixed(0)}</span>
      </div>
      <div className="meter" aria-label={`${label} ${value.toFixed(0)} of 100`}>
        <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      <span className="hint">{meaning}</span>
    </div>
  )
}

// A signed delta with pos/neg/zero color AND a text sign (never color alone).
export function Delta({ value, digits = 1, testid }: { value: number; digits?: number; testid?: string }) {
  const cls = deltaClass(value)
  return (
    <span className={`delta ${cls} mono`} {...(testid ? { 'data-testid': testid } : {})}>
      {signed(value, digits)}
    </span>
  )
}

// Every error the player is shown passes the refusal seam. A message a caller already
// wrote in the studio's own language reads `plain` and renders byte-identically to the
// way it always has; only ENGINE language is translated. That is what makes this the
// safe place to close the 00F leak — no call site can route around it.
export function ErrorBox({ message }: { message: string }) {
  return (
    <div
      className="errbox stack"
      role="alert"
      data-testid="error-box"
      data-refusal={refusalFamilyId(message)}
      style={{ gap: 4 }}
    >
      <RefusalBody message={message} testid="error-box-refusal" />
    </div>
  )
}

// ── RefusalNotice — the player-facing end of the refusal seam ─────────────────
// Renders an ActionOutcome error the way a studio would say it: the fact, the
// reason, and the way forward. Translation lives in `presentation/refusalVoice.ts`
// (data); this component only renders whichever of the three readings comes back.
// A message that is NOT engine language is passed through untouched, so a caller
// that already wrote player copy is never overwritten.
export function RefusalNotice({
  message,
  nameOf,
  testid = 'refusal-notice',
}: {
  message: string
  /** Engine id → the person's name, so no refusal ever shows the player an id. */
  nameOf?: ((talentId: string) => string | undefined) | undefined
  testid?: string
}) {
  return (
    <div
      className="errbox stack"
      role="alert"
      data-testid={testid}
      data-refusal={refusalFamilyId(message)}
      style={{ gap: 4 }}
    >
      <RefusalBody message={message} nameOf={nameOf} testid={testid} />
    </div>
  )
}

/**
 * The refusal's CONTENT without a container, for surfaces that already own their
 * own alert box (the Lot workspace panels). Same three readings, same law: a
 * message that is not engine language is rendered exactly as it was written.
 */
export function RefusalBody({
  message,
  nameOf,
  testid = 'refusal-notice',
}: {
  message: string
  nameOf?: ((talentId: string) => string | undefined) | undefined
  testid?: string
}) {
  const reading = readRefusal(message, { nameOf })
  if (reading.kind === 'plain') return <>{reading.message}</>
  return (
    <>
      <strong data-testid={`${testid}-headline`}>{reading.copy.headline}</strong>
      <span data-testid={`${testid}-detail`}>{reading.copy.detail}</span>
      <span className="hint" data-testid={`${testid}-remedy`}>
        <strong>Remedy:</strong> {reading.copy.remedy}
      </span>
      {reading.kind === 'untranslated' && (
        <details data-testid={`${testid}-raw`}>
          <summary>{UNTRANSLATED_REFUSAL_DISCLOSURE}</summary>
          <span className="mono">{reading.raw}</span>
        </details>
      )}
    </>
  )
}

export function Warn({ children }: { children: ReactNode }) {
  return (
    <div className="warn" data-testid="warn-box">
      {children}
    </div>
  )
}
