// Imperative camera override so the headless capture tool can frame any view precisely.
// CameraController registers the applier; window.__lab.view(pos, tgt) calls it.
export type Vec3 = [number, number, number]
type ApplyView = (pos: Vec3, tgt: Vec3) => void

let applier: ApplyView | null = null
export function registerApplyView(fn: ApplyView): void { applier = fn }
export function applyView(pos: Vec3, tgt: Vec3): void { applier?.(pos, tgt) }
