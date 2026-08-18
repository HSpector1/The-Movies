// ── The shell's own modal dialog (PF1-M3) ────────────────────────────────────
//
// The Lot has a proven modal host (`LotRetainedWorkspace`) which exists to keep the
// authoritative renderer MOUNTED underneath a workspace. Off the Lot there is no renderer
// to protect, so this is the same containment without the world-specific vocabulary:
// focus trap, Escape, background scroll containment, and focus returned to whatever opened
// it. Two callers this milestone — the settings overlay away from the Lot, and the
// new-studio confirmation, which is a destructive verb and must therefore be answered where
// it stands rather than by a browser dialog nobody styled and nobody can test.
//
// It renders in App's own tree, above the routed screen. It is presentation only: it holds
// no game truth, persists nothing, and cannot decide anything on the caller's behalf.

import { useEffect, useRef } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function visibleFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (candidate) =>
      candidate.isConnected &&
      candidate.closest('[inert]') === null &&
      candidate.getAttribute('aria-hidden') !== 'true',
  )
}

export function ShellDialog({
  titleId,
  descriptionId,
  title,
  description,
  dialogTestId,
  layerTestId,
  initialFocusSelector,
  onDismiss,
  children,
}: {
  titleId: string
  descriptionId: string
  title: ReactNode
  description: ReactNode
  dialogTestId: string
  layerTestId: string
  initialFocusSelector?: string
  /** Escape and the scrim answer the SAME way the dialog's own cancel does. */
  onDismiss: () => void
  children?: ReactNode
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const dismissRef = useRef(onDismiss)
  dismissRef.current = onDismiss
  // Captured before the trap moves focus, restored after this dialog is gone: a player who
  // opened settings from the topbar is returned to the topbar, not to the top of the page.
  const openerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const active = typeof document === 'undefined' ? null : document.activeElement
    openerRef.current = active instanceof HTMLElement ? active : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
      const opener = openerRef.current
      if (opener !== null && opener.isConnected) opener.focus({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog === null) return
    queueMicrotask(() => {
      if (!dialog.isConnected || dialog.contains(document.activeElement)) return
      const focusable = visibleFocusable(dialog)
      const preferred = initialFocusSelector === undefined
        ? null
        : dialog.querySelector<HTMLElement>(initialFocusSelector)
      const target = preferred !== null && focusable.includes(preferred)
        ? preferred
        : focusable[0] ?? dialog
      target.focus()
    })
  }, [initialFocusSelector])

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.defaultPrevented) return
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      dismissRef.current()
      return
    }
    if (event.key !== 'Tab') return
    const dialog = dialogRef.current
    if (dialog === null) return
    const focusable = visibleFocusable(dialog)
    if (focusable.length === 0) {
      event.preventDefault()
      dialog.focus({ preventScroll: true })
      return
    }
    const first = focusable[0]!
    const last = focusable[focusable.length - 1]!
    const active = document.activeElement
    if (event.shiftKey && (active === first || !dialog.contains(active))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      className="shell-dialog-layer"
      data-testid={layerTestId}
      onKeyDownCapture={handleKeyDown}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) dismissRef.current()
      }}
    >
      <div
        ref={dialogRef}
        className="shell-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        data-testid={dialogTestId}
      >
        <h2 id={titleId} className="shell-dialog-title">
          {title}
        </h2>
        <p id={descriptionId} className="shell-dialog-description">
          {description}
        </p>
        {children}
      </div>
    </div>
  )
}
