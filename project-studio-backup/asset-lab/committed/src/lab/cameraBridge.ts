// Imperative camera override so the headless capture tool can frame any view precisely.
// CameraController registers the applier; window.__lab.view(pos, tgt) calls it.
export type Vec3 = [number, number, number]
type ApplyView = (pos: Vec3, tgt: Vec3) => void

let applier: ApplyView | null = null
export function registerApplyView(fn: ApplyView): void { applier = fn }
export function applyView(pos: Vec3, tgt: Vec3): void { applier?.(pos, tgt) }

// Named Scene-D camera presets (contract §7). Shared by the HUD buttons and the capture tool.
export const D_VIEWS: Record<string, { pos: Vec3; tgt: Vec3 }> = {
  Overview: { pos: [42, 34, 48], tgt: [2, 2, -1] },
  Entrance: { pos: [1, 6, 42], tgt: [-2, 4, 18] },
  Soundstage: { pos: [-8, 11, 8], tgt: [8, 6, -14] },
  Courtyard: { pos: [17, 8, 23], tgt: [3, 1.5, 2] },
  'Human Scale': { pos: [-3.5, 1.75, 11], tgt: [3, 1.4, 2] },
}
