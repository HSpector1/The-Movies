// Small shared display components. Presentation only — no simulation logic.

import type { ReactNode } from 'react'
import { deltaClass, signed } from '../format.ts'

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

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="errbox" role="alert" data-testid="error-box">
      {message}
    </div>
  )
}

export function Warn({ children }: { children: ReactNode }) {
  return (
    <div className="warn" data-testid="warn-box">
      {children}
    </div>
  )
}
