import type { ReactNode } from 'react'
import { LotRetainedWorkspace } from './LotRetainedWorkspace'
import type { LotGreenlightQueueReceipt } from './snapshot/queueAdmission'

type CommittedPresentation =
  | { kind: 'accepted' }
  | { kind: 'queued'; receipt: LotGreenlightQueueReceipt }
  | { kind: 'neutral' }

type Props = {
  phase: 'editing' | 'committed'
  title: string
  nestedModalOpen: boolean
  onCancel: () => void
  committedPresentation?: CommittedPresentation | undefined
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
  committedPresentation = { kind: 'accepted' },
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
      {phase === 'committed' && committedPresentation.kind === 'queued' ? (
        <div
          className="lot-package-workspace-committing"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-testid="lot-package-workspace-committing"
        >
          <span className="lot-package-workspace-eyebrow">GREENLIGHT QUEUED</span>
          <h2>{committedPresentation.receipt.title} is waiting for a Development &amp; Casting room</h2>
          <p><strong>WHAT HAPPENED</strong> The package entered the greenlight queue in Week {committedPresentation.receipt.queuedWeek}.</p>
          <p><strong>WHY IT MATTERS</strong> No production identity, budget, cast, crew, or room is committed while it waits.</p>
          <p><strong>WHAT NEXT</strong> Return to the live Lot. Advance time or cancel the request; the studio will revalidate the package before forming the picture.</p>
        </div>
      ) : phase === 'committed' && committedPresentation.kind === 'accepted' ? (
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
      ) : phase === 'committed' ? (
        <div
          className="lot-package-workspace-committing"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-testid="lot-package-workspace-committing"
        >
          <span className="lot-package-workspace-eyebrow">STUDIO UPDATED</span>
          <h2>Recording the studio's latest Package state</h2>
          <p>The exact result could not be verified for presentation. Returning to the live Lot without claiming a greenlight or production identity.</p>
        </div>
      ) : children}
    </LotRetainedWorkspace>
  )
}
