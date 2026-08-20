import type { ReactNode } from 'react'
import { LotRetainedWorkspace } from './LotRetainedWorkspace'
import type { LotCommissionQueueReceipt } from './snapshot/queueAdmission'

type CommittedPresentation =
  | { kind: 'accepted' }
  | { kind: 'queued'; receipt: LotCommissionQueueReceipt }
  | { kind: 'neutral' }

type Props = {
  phase: 'editing' | 'committed'
  title: string
  nestedModalOpen?: boolean
  onCancel: () => void
  onOpenDetails: () => void
  committedPresentation?: CommittedPresentation | undefined
  children?: ReactNode
}

/**
 * Retained presentation shell for the canonical screenplay commission form.
 * Commission legality and mutation remain owned by the shared form and Engine.
 */
export function LotCommissionWorkspace({
  phase,
  title,
  nestedModalOpen = false,
  onCancel,
  onOpenDetails,
  committedPresentation = { kind: 'accepted' },
  children,
}: Props) {
  return (
    <LotRetainedWorkspace
      layerClassName="lot-commission-workspace-layer"
      layerTestId="lot-commission-workspace-layer"
      dialogClassName="lot-commission-workspace"
      dialogTestId="lot-commission-workspace"
      titleId="lot-commission-workspace-title"
      descriptionId="lot-commission-workspace-description"
      title={<>Commission screenplay · {title}</>}
      description="Commission a screenplay while the live Studio Lot remains behind the workspace."
      nestedModalOpen={nestedModalOpen}
      escapeEnabled={phase === 'editing'}
      focusVersion={phase}
      initialFocusSelector='[data-testid="script-concept"]'
      onEscape={onCancel}
    >
      {phase === 'editing' ? (
        <>
          <header className="lot-commission-workspace-header">
            <div className="lot-commission-workspace-identity">
              <span className="lot-commission-workspace-eyebrow">LIVE LOT · DEVELOPMENT</span>
              <strong>{title}</strong>
            </div>
            <div className="lot-commission-workspace-header-actions">
              <button
                type="button"
                className="ghost"
                data-testid="lot-commission-workspace-details"
                onClick={onOpenDetails}
              >
                Open full Writers' Room details
              </button>
              <button
                type="button"
                className="ghost"
                data-testid="lot-commission-workspace-close"
                onClick={onCancel}
              >
                Return to live Lot
              </button>
            </div>
          </header>
          <div className="lot-commission-workspace-scroll">{children}</div>
        </>
      ) : committedPresentation.kind === 'queued' ? (
        <div
          className="lot-commission-workspace-recording"
          data-testid="lot-commission-workspace-recording"
        >
          <span className="lot-commission-workspace-eyebrow">SCREENPLAY QUEUED</span>
          <h2>
            {committedPresentation.receipt.subject.kind === 'market'
              ? `${committedPresentation.receipt.subject.title} joined the Development queue`
              : 'An original screenplay request joined the Development queue'}
          </h2>
          <p><strong>WHAT HAPPENED</strong> The request entered the production queue in Week {committedPresentation.receipt.queuedWeek}.</p>
          <p><strong>WHY IT MATTERS</strong> No writer, room, cash, or screenplay project identity is committed while it waits.</p>
          <p><strong>WHAT NEXT</strong> Return to the live Lot. Advance time or cancel the request; the studio will revalidate it before writing begins.</p>
        </div>
      ) : committedPresentation.kind === 'accepted' ? (
        <div
          className="lot-commission-workspace-recording"
          data-testid="lot-commission-workspace-recording"
        >
          <span className="lot-commission-workspace-eyebrow">SCREENPLAY ACCEPTED</span>
          <h2>Recording {title} with the studio</h2>
          <p>The commission is secure. Returning to live Development…</p>
        </div>
      ) : (
        <div
          className="lot-commission-workspace-recording"
          data-testid="lot-commission-workspace-recording"
        >
          <span className="lot-commission-workspace-eyebrow">STUDIO UPDATED</span>
          <h2>Recording the studio's latest Development state</h2>
          <p>The exact commission result could not be verified for presentation. Returning to the live Lot without claiming a project or commitment.</p>
        </div>
      )}
    </LotRetainedWorkspace>
  )
}
