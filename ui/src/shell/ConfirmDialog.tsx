// ── Confirming a destructive verb (PF1-M3) ───────────────────────────────────
//
// A destructive action is answered WHERE IT STANDS, by two named buttons, in the studio's
// own voice. `window.confirm` did the job for a while and did it badly: OK/Cancel is not
// the vocabulary of the thing being decided, the copy could not be styled or read by the
// product's own tests, and it blocked the whole page to ask.
//
// Cancel is the safe answer, so Cancel takes initial focus and Escape means Cancel. The
// caller supplies both verbs, because "New studio" and "Discard" are not the same sentence.

import { ShellDialog } from './ShellDialog.tsx'

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  cancelLabel = 'Keep this studio',
  onConfirm,
  onCancel,
}: {
  title: string
  body: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <ShellDialog
      titleId="shell-confirm-title"
      descriptionId="shell-confirm-body"
      title={title}
      description={body}
      dialogTestId="confirm-dialog"
      layerTestId="confirm-dialog-layer"
      initialFocusSelector='[data-testid="confirm-dialog-cancel"]'
      onDismiss={onCancel}
    >
      <div className="btn-row">
        <button className="danger" onClick={onConfirm} data-testid="confirm-dialog-confirm">
          {confirmLabel}
        </button>
        <button className="ghost" onClick={onCancel} data-testid="confirm-dialog-cancel">
          {cancelLabel}
        </button>
      </div>
    </ShellDialog>
  )
}
