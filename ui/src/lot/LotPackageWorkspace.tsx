import type { ReactNode } from 'react'
import { LotRetainedWorkspace } from './LotRetainedWorkspace'

type Props = {
  phase: 'editing' | 'committed'
  title: string
  nestedModalOpen: boolean
  onCancel: () => void
  children?: ReactNode
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
  return (
    <LotRetainedWorkspace
      layerClassName="lot-package-workspace-layer"
      layerTestId="lot-package-workspace-layer"
      dialogClassName="lot-package-workspace"
      dialogTestId="lot-package-workspace"
      titleId="lot-package-workspace-title"
      descriptionId="lot-package-workspace-description"
      title={<>Package {title}</>}
      description="Assemble this picture while the live Studio Lot remains behind the workspace."
      nestedModalOpen={nestedModalOpen}
      escapeEnabled={phase === 'editing'}
      focusVersion={phase}
      onEscape={onCancel}
    >
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
            onClick={onCancel}
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
    </LotRetainedWorkspace>
  )
}
