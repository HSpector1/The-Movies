// ── The cash readout (PF1-M2) ────────────────────────────────────────────────
//
// The studio's money travels to its new figure instead of teleporting. Four rules make
// that a presentation flourish rather than a second source of truth:
//
//   1. FIXED DURATION. The count takes the same time whether one week passed or forty
//      (operational law 3: skipped weeks are not narrated, and a batch that took the
//      engine forty ticks is still ONE stop). It is never week-paced.
//   2. THE AUTHORITATIVE FIGURE IS ALWAYS IN THE DOM. `data-testid="lot-cash"` holds
//      the real, final, formatted number at every instant — including mid-count. The
//      travelling digits live in a SEPARATE, `aria-hidden` overlay that is unmounted the
//      moment the count finishes. So the accessible name, any live region that quotes
//      it, and every assertion against it read the truth and only the truth; the
//      animation cannot lie about the studio's money even for one frame.
//   3. REDUCED MOTION MEANS NO ANIMATION AT ALL — not a faster one. The overlay is never
//      created, and the readout swaps instantly, exactly as it does today.
//   4. IT NEVER RUNS ON ARRIVAL. The first commit establishes the baseline; a count only
//      happens when an authoritative figure the player already saw is replaced by a
//      different one. A reload paints its cash silently and still.
//
// Per-frame text is written straight to the overlay node. React re-renders exactly twice
// per count (start and settle) and the world re-renders not at all.

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * The whole count, in milliseconds. Named because the contract is the NUMBER being fixed,
 * not the value: 500ms is long enough to read as movement and short enough that the next
 * click never waits for it.
 */
export const CASH_COUNT_UP_MS = 500

/** The topbar's exact money format — unchanged from the literal it replaces. */
export function formatLotCash(cash: number): string {
  return `${cash < 0 ? '-' : ''}$${Math.abs(Math.round(cash)).toLocaleString('en-US')}`
}

/** Ease-out: the figure arrives rather than stops. Pure, deterministic, no clock of its own. */
function ease(t: number): number {
  return 1 - (1 - t) * (1 - t)
}

type Count = { from: number; to: number; key: number }

export function CashReadout({
  cash,
  reducedMotion,
}: {
  cash: number
  reducedMotion: boolean
}) {
  const settled = formatLotCash(cash)
  const seenRef = useRef<number>(cash)
  const keyRef = useRef(0)
  const [count, setCount] = useState<Count | null>(null)
  const overlayRef = useRef<HTMLSpanElement | null>(null)
  const frameRef = useRef<number | null>(null)

  // Decide whether this authoritative figure earns a count. Runs only when `cash` (or the
  // motion signal) actually changes, so a re-render for any other reason never restarts one.
  useEffect(() => {
    const from = seenRef.current
    seenRef.current = cash
    if (from === cash) return
    if (
      reducedMotion ||
      !Number.isFinite(from) ||
      !Number.isFinite(cash) ||
      typeof requestAnimationFrame !== 'function'
    ) {
      setCount(null)
      return
    }
    keyRef.current += 1
    setCount({ from, to: cash, key: keyRef.current })
  }, [cash, reducedMotion])

  // Drive it. `useLayoutEffect` so the overlay's first text is written before paint and the
  // player never sees an empty slot; the rAF timestamp is the only clock, and it is
  // presentation-only — nothing observable by the engine, a save, or a test depends on it.
  useLayoutEffect(() => {
    if (count === null) return
    const node = overlayRef.current
    if (node === null) return
    node.textContent = formatLotCash(count.from)
    let start: number | null = null
    const step = (now: number) => {
      if (start === null) start = now
      const t = Math.min(1, (now - start) / CASH_COUNT_UP_MS)
      if (t >= 1) {
        frameRef.current = null
        setCount(null)
        return
      }
      node.textContent = formatLotCash(count.from + (count.to - count.from) * ease(t))
      frameRef.current = requestAnimationFrame(step)
    }
    frameRef.current = requestAnimationFrame(step)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [count])

  return (
    <span className="lot-cash-slot" data-counting={count === null ? undefined : 'true'}>
      <span className="lot-cash" data-testid="lot-cash">
        {settled}
      </span>
      {count !== null && (
        <span key={count.key} ref={overlayRef} className="lot-cash-countup" aria-hidden="true" />
      )}
    </span>
  )
}
