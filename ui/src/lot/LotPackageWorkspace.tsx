import { useEffect, useRef } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'

type Props = {
  phase: 'editing' | 'committed'
  title: string
  nestedModalOpen: boolean
  onCancel: () => void
  children?: ReactNode
}

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

/**
 * Modal host for the exact Lot-owned Casting → Package handoff.
 *
 * The canonical Assembly remains the decision owner. This host owns only modal
 * containment while the already-mounted Studio Lot stays visible and animated.
 */
export function LotPackageWorkspace({
  phase,
  title,
  nestedModalOpen,
  onCancel,
  children,
}: Props) {
  const layerRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef(onCancel)
  cancelRef.current = onCancel

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousOverscroll = document.body.style.overscrollBehavior
    document.body.style.overflow = 'hidden'
    document.body.style.overscrollBehavior = 'none'
    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.overscrollBehavior = previousOverscroll
    }
  }, [])

  useEffect(() => {
    const layer = layerRef.current
    if (layer === null) return
    const containBackgroundScroll = (event: Event) => {
      if (event.target === layer) event.preventDefault()
      event.stopPropagation()
    }
    layer.addEventListener('wheel', containBackgroundScroll, { passive: false })
    layer.addEventListener('touchmove', containBackgroundScroll, { passive: false })
    return () => {
      layer.removeEventListener('wheel', containBackgroundScroll)
      layer.removeEventListener('touchmove', containBackgroundScroll)
    }
  }, [])

  useEffect(() => {
    if (nestedModalOpen) return
    const dialog = dialogRef.current
    if (dialog === null) return
    queueMicrotask(() => {
      if (
        dialog.isConnected &&
        !dialog.contains(document.activeElement)
      ) {
        visibleFocusable(dialog)[0]?.focus({ preventScroll: true })
      }
    })
  }, [nestedModalOpen, phase])

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (nestedModalOpen || event.defaultPrevented) return
    if (event.key === 'Escape' && phase === 'editing') {
      event.preventDefault()
      event.stopPropagation()
      cancelRef.current()
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
      last.focus({ preventScroll: true })
    } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
      event.preventDefault()
      first.focus({ preventScroll: true })
    }
  }

  return (
    <div
      ref={layerRef}
      className="lot-package-workspace-layer"
      data-testid="lot-package-workspace-layer"
      inert={nestedModalOpen || undefined}
      aria-hidden={nestedModalOpen || undefined}
      onKeyDownCapture={handleKeyDown}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onTouchStart={(event) => {
        if (event.target === event.currentTarget) event.preventDefault()
        event.stopPropagation()
      }}
    >
      <div
        ref={dialogRef}
        className="lot-package-workspace"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lot-package-workspace-title"
        aria-describedby="lot-package-workspace-description"
        tabIndex={-1}
        data-testid="lot-package-workspace"
      >
        <h1 id="lot-package-workspace-title" className="visually-hidden">
          Package {title}
        </h1>
        <p id="lot-package-workspace-description" className="visually-hidden">
          Assemble this picture while the live Studio Lot remains behind the workspace.
        </p>
        {phase === 'editing' && (
          <header className="lot-package-workspace-header">
            <div>
              <span className="lot-package-workspace-eyebrow">LIVE LOT · PACKAGE</span>
              <strong>{title}</strong>
            </div>
            <button
              type="button"
              className="ghost"
              data-testid="lot-package-workspace-close"
              onClick={() => cancelRef.current()}
            >
              Return to live Lot
            </button>
          </header>
        )}
        {phase === 'committed' ? (
          <div
            className="lot-package-workspace-committing"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-testid="lot-package-workspace-committing"
          >
            <span className="lot-package-workspace-eyebrow">GREENLIGHT ACCEPTED</span>
            <h2>Recording {title} with the studio</h2>
            <p>The package is secure. Returning to the live production formation…</p>
          </div>
        ) : children}
      </div>
    </div>
  )
}
