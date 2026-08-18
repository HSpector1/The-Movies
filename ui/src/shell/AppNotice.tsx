// ── The studio's own voice (PF1-M3) ──────────────────────────────────────────
//
// THE BROWSER NEVER SPEAKS FOR THE STUDIO. `alert()` was the last place this product let a
// browser chrome dialog answer for it: unstyled, unspeakable in the studio's register,
// untestable without stubbing a global, and blocking — which quietly made a modal dialog a
// load-bearing part of several dispatch paths.
//
// Two notices live here and they are deliberately different animals:
//
//   AppNotice — one refusal or one unavailable thing, said once. It survives the action
//   that produced it and expires on the next one (the M2 epoch), and the player may dismiss
//   it sooner. Nothing is written down when it goes.
//
//   PersistenceNotice — the studio is not being saved. That is not news, it is a CONDITION,
//   so it does not expire, cannot be dismissed, and stays until a later autosave succeeds.
//   Anything less would let the product imply a save it never made.
//
// Both sit outside the routed screen tree, so both take the same background-inert boundary
// as the recovery banners: a retained workspace or the Profile drawer must remain the only
// programmatic owner while it is open, not merely the only pointer-visible one.

export function AppNotice({
  message,
  background = false,
  onDismiss,
}: {
  message: string
  background?: boolean
  onDismiss: () => void
}) {
  return (
    <div
      className="card app-notice"
      data-testid="app-notice"
      role="alert"
      inert={background || undefined}
      aria-hidden={background || undefined}
    >
      <div className="spread">
        <span data-testid="app-notice-message">{message}</span>
        <button className="ghost" onClick={onDismiss} data-testid="app-notice-dismiss">
          Dismiss
        </button>
      </div>
    </div>
  )
}

/**
 * The copy is the whole point: it states the fact, the reason, and the way forward, and it
 * is true of BOTH failures it covers — a full quota and storage that is unavailable at all
 * (private mode). It never claims a save succeeded, and it offers no "retry" the shell
 * cannot honestly promise: the export IS the way to keep the studio.
 */
export const PERSISTENCE_FAILURE_MESSAGE =
  'This studio is not being written down — the vault will not take it. Export a print to keep what you have.'

export function PersistenceNotice({ background = false }: { background?: boolean }) {
  return (
    <div
      className="card app-persistence-notice"
      data-testid="persistence-notice"
      role="alert"
      inert={background || undefined}
      aria-hidden={background || undefined}
    >
      <span>{PERSISTENCE_FAILURE_MESSAGE}</span>
    </div>
  )
}
