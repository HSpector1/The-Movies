import { useEffect, useRef } from 'react'
import type { ConstructionCompletionSummary } from '../engine/adapter.ts'

/**
 * The single post-tick Annex completion item. It is deliberately reusable by
 * the weekly, release, and newspaper paths so every first-arrival surface has
 * identical copy, polite atomic announcement, and durable focus ownership.
 */
export function ConstructionCompletionNotice({
  completion,
}: {
  completion: ConstructionCompletionSummary
}) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [completion.projectId, completion.completedWeek])

  return (
    <section
      className="card"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      tabIndex={-1}
      ref={ref}
      data-testid="annex-completion-summary"
    >
      <div className="spread">
        <h2 style={{ margin: 0 }}>Studio development completed</h2>
        <span className="tag fact">Operational</span>
      </div>
      <p style={{ marginBottom: 0 }}>{completion.message}</p>
    </section>
  )
}
