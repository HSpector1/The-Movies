import type { ActionOutcome, CastingProjectView } from '../engine/adapter.ts'
import {
  CastingSlatePlanner,
  type CastingSlate,
  type CastingSlateDraft,
} from '../screens/CastingSlatePlanner.tsx'
import { LotRetainedWorkspace } from './LotRetainedWorkspace.tsx'
import './LotAuditionWorkspace.css'

export type LotAuditionWorkspaceProps = {
  phase: 'editing' | 'committed'
  project: CastingProjectView
  disabled?: boolean
  nestedModalOpen?: boolean
  onCancel: () => void
  onOpenDetails: () => void
  onSlateChange?: (draft: CastingSlateDraft) => void
  onSubmit: (slate: CastingSlate) => ActionOutcome
}

/**
 * Thin retained-Lot host for the canonical camera-test planner. Selection law
 * remains in CastingSlatePlanner; this component owns only dialog framing.
 */
export function LotAuditionWorkspace({
  phase,
  project,
  disabled = false,
  nestedModalOpen = false,
  onCancel,
  onOpenDetails,
  onSlateChange,
  onSubmit,
}: LotAuditionWorkspaceProps) {
  return (
    <LotRetainedWorkspace
      layerClassName="lot-audition-workspace-layer"
      layerTestId="lot-audition-workspace-layer"
      dialogClassName="lot-audition-workspace"
      dialogTestId="lot-audition-workspace"
      titleId="lot-audition-workspace-title"
      descriptionId="lot-audition-workspace-description"
      title={<>Plan camera tests · {project.title}</>}
      description="Plan one camera-test slate while the live Studio Lot remains behind the workspace."
      nestedModalOpen={nestedModalOpen}
      escapeEnabled={phase === 'editing' && !disabled}
      focusVersion={`${phase}:${project.projectId}`}
      initialFocusSelector='[data-testid="lot-audition-workspace-close"]'
      onEscape={onCancel}
    >
      {phase === 'editing' ? (
        <>
          <header className="lot-audition-workspace-header">
            <div className="lot-audition-workspace-identity">
              <span className="lot-audition-workspace-eyebrow">LIVE LOT · CASTING</span>
              <strong>{project.title}</strong>
              <span>Screenplay by {project.writer.name}</span>
            </div>
            <div className="lot-audition-workspace-header-actions">
              <button
                type="button"
                className="ghost"
                disabled={disabled}
                data-testid="lot-audition-workspace-details"
                onClick={onOpenDetails}
              >
                Open full Casting Room details
              </button>
              <button
                type="button"
                className="ghost"
                disabled={disabled}
                data-testid="lot-audition-workspace-close"
                onClick={onCancel}
              >
                Return to live Lot
              </button>
            </div>
          </header>
          <div className="lot-audition-workspace-scroll">
            <CastingSlatePlanner
              project={project}
              disabled={disabled}
              {...(onSlateChange === undefined ? {} : { onSlateChange })}
              onSubmit={onSubmit}
            />
          </div>
        </>
      ) : (
        <div
          className="lot-audition-workspace-recording"
          data-testid="lot-audition-workspace-recording"
        >
          <span className="lot-audition-workspace-eyebrow">CAMERA TESTS ACCEPTED</span>
          <h2>Recording camera tests for {project.title}</h2>
          <p>The exact slate is secure. Returning to live Casting…</p>
        </div>
      )}
    </LotRetainedWorkspace>
  )
}
