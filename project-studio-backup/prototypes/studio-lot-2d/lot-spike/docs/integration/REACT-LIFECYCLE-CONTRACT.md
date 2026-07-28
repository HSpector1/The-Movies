# React Mount / Unmount Contract

How a React host should wrap `StudioLotView` (the actual public API at commit
`8c5a18b`). The lot itself is framework-neutral (plain DOM + Phaser); this wrapper
lives host-side. Pseudocode only — do not implement here.

## The actual public API (from `src/StudioLotView.ts`)

```ts
new StudioLotView({
  parent: HTMLElement,            // mount element, must have non-zero CSS size
  snapshot: StudioLotSnapshot,    // initial facts
  onSelect?:   (sel: SelectionInfo | null) => void,
  onAction?:   (e: LotActionEvent) => void,
  onCharacter?:(info: CharacterInfo | null) => void,   // optional atmosphere
  onActivity?: (text: string | null) => void,          // optional atmosphere
  onReady?:    () => void,
})

view.setSnapshot(snapshot)   // feed new facts over time
view.select(id) / view.clearSelection() / view.triggerAction(id)
view.resetCamera() / view.camera(preset)
view.destroy()               // tears down the Phaser game + canvas
// test-facing: forceVignette, pauseVignettes, seekVignette,
//              firstInspectableScreen, getDebugState, recreate
```

## Required hosting behavior

| Concern | Requirement |
|---------|-------------|
| Instance count | **Exactly one** `StudioLotView` per mounted panel. One Phaser game, one canvas. |
| Construction timing | After the mount ref exists and has non-zero size. Booting is async (game `ready` → scene add); `onReady` fires on first paint. |
| Snapshot updates | Call `view.setSnapshot(next)` when the host's snapshot changes — **do not** recreate the view. It reconciles in place (no actor/tag/display-object leak; asserted). |
| Callback freshness | Callbacks are captured at construction. To avoid stale closures, either keep handlers stable (`useCallback`/refs) or route through a ref the wrapper reads. **Do not** re-`new` the view just to update a handler. |
| Resize | Handled internally (`Scale.RESIZE` + camera bounds). The wrapper only needs the mount element to resize with layout. |
| Teardown | `view.destroy()` in the effect cleanup. Frees the canvas + RAF (destroy/recreate test proves exactly one canvas remains). |
| One-canvas guarantee | Verified: after `recreate()` there is exactly one `#lot-stage canvas`. |
| React Strict Mode / dev double-mount | Strict Mode mounts→unmounts→remounts effects in dev. Because construction and `destroy()` are paired in the same effect, a double-mount creates then destroys then recreates cleanly. Verified analogue: `recreate()` (destroy+boot) leaves one canvas. |
| Route change | Unmounting the panel runs cleanup → `destroy()`. Re-entering constructs fresh. |
| Hidden tab / off-screen | If the panel stays mounted while hidden, **pause** to save CPU (see note below). |
| Error boundary | Wrap the panel in an error boundary; on error, unmount → `destroy()`. The lot throws no expected runtime errors (console-clean assertion). |
| Focus / keyboard | The lot installs its own keyboard handlers (WASD/arrows/R) on the Phaser canvas; they fire only when the canvas has focus. Ensure the mount doesn't trap global shortcuts. |
| Reduced motion | `prefers-reduced-motion` is **not** yet honored by the lot. The host should gate/attenuate ambient + vignette motion (a `pauseVignettes(true)` + reduced ambient hook to add at integration). |

## Thin wrapper (pseudocode — adapt to the real API)

```tsx
function StudioLotPanel(props: { snapshot: StudioLotSnapshot;
                                 onSelect?: (s: SelectionInfo | null) => void;
                                 onAction?: (e: LotActionEvent) => void }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<StudioLotView | null>(null)
  const handlers = useRef(props)               // keep latest callbacks without re-mounting
  handlers.current = props

  useEffect(() => {
    if (!mountRef.current) return
    const view = new StudioLotView({
      parent: mountRef.current,
      snapshot: handlers.current.snapshot,
      onSelect: (s) => handlers.current.onSelect?.(s),
      onAction: (e) => handlers.current.onAction?.(e),
    })
    viewRef.current = view
    return () => { view.destroy(); viewRef.current = null }   // paired teardown
  }, [])                                                       // construct once

  useEffect(() => { viewRef.current?.setSnapshot(props.snapshot) }, [props.snapshot])

  // full-size, non-zero mount element
  return <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />
}
```

Notes:
- The `handlers` ref pattern avoids stale callbacks **and** avoids re-mounting the
  Phaser game when a handler identity changes.
- Give the mount element an explicit size (the lot needs non-zero CSS dimensions).
- Bring the `#lot-stage` sky-gradient CSS (from `host.css`) onto the mount element.
