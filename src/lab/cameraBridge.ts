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

// Named Scene-F (refined studio lot) camera presets. Entrance gate at Z+38, stage row at Z-20,
// admin west, backlot east, water tower NW. A ~150 m lot — camera framings are high/far.
export const F_VIEWS: Record<string, { pos: Vec3; tgt: Vec3 }> = {
  Overview: { pos: [90, 46, 96], tgt: [-4, 7, -10] },
  Entrance: { pos: [0, 9, 58], tgt: [0, 6, 6] },
  'Stage Row': { pos: [54, 27, 24], tgt: [2, 9, -20] },
  Avenue: { pos: [58, 9, 13], tgt: [-38, 4, -2] },
  Backlot: { pos: [54, 15, 6], tgt: [40, 4, -14] },
  Commissary: { pos: [42, 13, 34], tgt: [22, 4, 12] },
  'Water Tower': { pos: [-14, 17, 8], tgt: [-42, 9, -16] },
  'Human Scale': { pos: [9, 1.75, 22], tgt: [0, 1.5, 10] },
}
