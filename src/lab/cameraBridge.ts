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

// Named Scene-E (hero soundstage) camera presets. Hero building sits at ~[0,0,-3], doors face +z,
// the production apron spans +z in front of it. The front/left quadrant carries the hero read.
export const E_VIEWS: Record<string, { pos: Vec3; tgt: Vec3 }> = {
  'Hero Overview': { pos: [23, 9, 27], tgt: [-2, 6, 3] },
  Overview: { pos: [34, 20, 42], tgt: [-2, 5, -1] },
  'Loading Bay': { pos: [-3.5, 5, 23], tgt: [-3.5, 5, 6] },
  'Production Apron': { pos: [11, 4, 21], tgt: [-3, 1.5, 9] },
  'Roof and Utilities': { pos: [19, 16, 19], tgt: [0, 11, -3] },
  'Human Scale': { pos: [1.5, 1.75, 16], tgt: [-3, 1.5, 8] },
}
