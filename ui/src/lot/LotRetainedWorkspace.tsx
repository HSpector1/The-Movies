import { useEffect, useRef } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { getAudioService } from '../audio/audioService.ts'

type Props = {
  layerClassName: string
  layerTestId: string
  dialogClassName: string
  dialogTestId: string
  titleId: string
  descriptionId: string
  title: ReactNode
  description: ReactNode
  nestedModalOpen?: boolean
  escapeEnabled?: boolean
  focusVersion?: unknown
  initialFocusSelector?: string
  onEscape: () => void
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
 * Presentation-only modal containment shared by retained Lot workspaces.
 *
 * The caller owns workflow content, phase, and authority. This host owns only
 * body/background scroll containment, focus trapping, Escape containment, and
 * input-tail isolation while the authoritative Studio Lot remains mounted.
 */
export function LotRetainedWorkspace({
  layerClassName,
  layerTestId,
  dialogClassName,
  dialogTestId,
  titleId,
  descriptionId,
  title,
  description,
  nestedModalOpen = false,
  escapeEnabled = true,
  focusVersion,
  initialFocusSelector,
  onEscape,
  children,
}: Props) {
  const layerRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const escapeRef = useRef(onEscape)
  escapeRef.current = onEscape

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
      if (dialog.isConnected && !dialog.contains(document.activeElement)) {
        const focusable = visibleFocusable(dialog)
        const preferred = initialFocusSelector === undefined
          ? null
          : dialog.querySelector<HTMLElement>(initialFocusSelector)
        const target = preferred !== null && focusable.includes(preferred)
          ? preferred
          : focusable[0] ?? dialog
        // Let the dialog's bounded scroll owner reveal the focused control. At compact
        // layouts a valid target can otherwise own focus while remaining wholly offscreen.
        target.focus()
      }
    })
  }, [focusVersion, initialFocusSelector, nestedModalOpen])

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (nestedModalOpen || event.defaultPrevented) return
    if (event.key === 'Escape' && escapeEnabled) {
      event.preventDefault()
      event.stopPropagation()
      // The workspace closed with nothing committed: the one cancel cue M1 wires.
      getAudioService().playCue('cancel')
      escapeRef.current()
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
      ref={layerRef}
      className={layerClassName}
      data-testid={layerTestId}
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
        className={dialogClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        data-testid={dialogTestId}
      >
        <h1 id={titleId} className="visually-hidden">
          {title}
        </h1>
        <p id={descriptionId} className="visually-hidden">
          {description}
        </p>
        {children}
      </div>
    </div>
  )
}
