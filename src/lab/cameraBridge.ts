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

// -----------------------------------------------------------------------------
// Asset Lab 05E — Scene-G CHARACTER REVIEW HARNESS (owner-review correction).
// A complete, additive owner-review camera set. `kind` selects what Scene G renders:
//   production → the real Scene G set + crew (composition UNCHANGED — context views only)
//   lineup     → the neutral review area, the 8 roles in a straight labelled row (static idle)
//   closeup    → the same neutral row, camera framed on a body region (owner pans along the row)
//   anim       → the same neutral row, every role performing ONE clip (front three-quarter)
//   lod        → three copies of ONE role at LOD0/1/2, same pose/scale/lighting, with live counts
// The neutral review area is spatially separate presentation, shown only for non-production views,
// so the production Scene G composition is never altered.
export type GReviewKind = 'production' | 'lineup' | 'closeup' | 'anim' | 'lod' | 'herocompare' | 'herosingle' | 'herolod'
export interface GReviewView { group: string; kind: GReviewKind; pos: Vec3; tgt: Vec3; clip?: string; lodFocus?: 0 | 1 | 2 }

// The review lineup stands centred on origin, facing +Z (character front = Blender −Y → three +Z),
// spread along X. The LOD trio uses one representative role at three detail tiers.
export const G_REVIEW_LOD_ROLE = 'Grip'

export const G_REVIEW: Record<string, GReviewView> = {
  // ---- Lineups (whole crew, static idle) ----
  'Crew Lineup Front':        { group: 'Lineups', kind: 'lineup', pos: [0, 1.62, 9.6],  tgt: [0, 0.98, 0] },
  'Crew Lineup Back':         { group: 'Lineups', kind: 'lineup', pos: [0, 1.62, -9.6], tgt: [0, 0.98, 0] },
  'Crew Lineup Left':         { group: 'Lineups', kind: 'lineup', pos: [-9.6, 1.62, 0], tgt: [0, 0.98, 0] },
  'Crew Lineup Right':        { group: 'Lineups', kind: 'lineup', pos: [9.6, 1.62, 0],  tgt: [0, 0.98, 0] },
  'Crew Three-Quarter Front': { group: 'Lineups', kind: 'lineup', pos: [6.9, 2.6, 8.4], tgt: [0, 0.98, 0] },
  'Crew Three-Quarter Back':  { group: 'Lineups', kind: 'lineup', pos: [-6.9, 2.6, -8.4], tgt: [0, 0.98, 0] },
  'Role Comparison':          { group: 'Lineups', kind: 'lineup', pos: [0, 2.05, 11.6], tgt: [0, 1.02, 0] },
  // ---- Close review (centred on the vest/shirt roles; owner pans along the row) ----
  'Faces and Hair':           { group: 'Close Review', kind: 'closeup', pos: [-1.7, 1.62, 1.55], tgt: [-1.7, 1.57, 0] },
  'Hands':                    { group: 'Close Review', kind: 'closeup', pos: [-1.7, 0.94, 1.5],  tgt: [-1.7, 0.86, 0] },
  'Feet and Shoes':           { group: 'Close Review', kind: 'closeup', pos: [-1.7, 0.40, 1.55], tgt: [-1.7, 0.07, 0] },
  'Torso and Vest':           { group: 'Close Review', kind: 'closeup', pos: [-1.7, 1.30, 1.6],  tgt: [-1.7, 1.24, 0] },
  'Pelvis and Hips — Front':  { group: 'Close Review', kind: 'closeup', pos: [-1.7, 1.00, 1.5],  tgt: [-1.7, 0.93, 0] },
  'Pelvis and Hips — Back':   { group: 'Close Review', kind: 'closeup', pos: [-1.7, 1.00, -1.5], tgt: [-1.7, 0.93, 0] },
  // ---- Animation review (every role performs the same clip; front three-quarter) ----
  'Walk':                     { group: 'Animation', kind: 'anim', clip: 'Walk_Loop',         pos: [5.4, 1.9, 7.4], tgt: [-0.3, 1.0, 0] },
  'Idle Talking':             { group: 'Animation', kind: 'anim', clip: 'Idle_Talking_Loop', pos: [5.4, 1.9, 7.4], tgt: [-0.3, 1.0, 0] },
  'Kneeling':                 { group: 'Animation', kind: 'anim', clip: 'Fixing_Kneeling',   pos: [5.0, 1.5, 6.4], tgt: [-0.3, 0.65, 0] },
  'Pickup':                   { group: 'Animation', kind: 'anim', clip: 'PickUp_Table',      pos: [5.0, 1.7, 6.6], tgt: [-0.3, 0.85, 0] },
  'Sitting':                  { group: 'Animation', kind: 'anim', clip: 'Sitting_Idle_Loop', pos: [5.0, 1.5, 6.6], tgt: [-0.3, 0.75, 0] },
  // ---- LOD comparison (same role, same pose/scale/lighting; all three always present) ----
  'LOD0 Comparison':          { group: 'LOD', kind: 'lod', lodFocus: 0, pos: [0, 1.45, 6.2],  tgt: [0, 0.95, 0] },
  'LOD1 Comparison':          { group: 'LOD', kind: 'lod', lodFocus: 1, pos: [0.0, 1.35, 4.3], tgt: [0, 0.95, 0] },
  'LOD2 Comparison':          { group: 'LOD', kind: 'lod', lodFocus: 2, pos: [1.95, 1.30, 4.1], tgt: [1.95, 0.95, 0] },
  // ---- Context (the REAL Scene G production composition — unchanged) ----
  'Management Distance':      { group: 'Context', kind: 'production', pos: [12, 7, 26],  tgt: [0, 1.6, 11] },
  'Human Scale':             { group: 'Context', kind: 'production', pos: [-2.5, 1.75, 17], tgt: [0, 1.5, 11] },
  'Refined Lot Scale Reference': { group: 'Context', kind: 'production', pos: [42, 24, 58], tgt: [0, 2, 10] },
  'Full Scene Overview':      { group: 'Context', kind: 'production', pos: [18, 12, 34], tgt: [0, 2.5, 10] },
}

// Button order for the HUD (grouped). "Reset" is rendered separately and maps to Full Scene Overview.
export const G_REVIEW_ORDER: string[] = [
  'Crew Lineup Front', 'Crew Lineup Back', 'Crew Lineup Left', 'Crew Lineup Right',
  'Crew Three-Quarter Front', 'Crew Three-Quarter Back', 'Role Comparison',
  'Faces and Hair', 'Hands', 'Feet and Shoes', 'Torso and Vest', 'Pelvis and Hips — Front', 'Pelvis and Hips — Back',
  'Walk', 'Idle Talking', 'Kneeling', 'Pickup', 'Sitting',
  'LOD0 Comparison', 'LOD1 Comparison', 'LOD2 Comparison',
  'Management Distance', 'Human Scale', 'Refined Lot Scale Reference', 'Full Scene Overview',
]
export const G_REVIEW_DEFAULT = 'Full Scene Overview'

// -----------------------------------------------------------------------------
// Asset Lab 05F — 05E-Electric ↔ 05F-HERO comparison group (additive to the Scene-G harness).
// The neutral review area renders the accepted 05E Electric on the LEFT (x<0) and the 05F hero on the
// RIGHT (x>0) at IDENTICAL pose / animation-time / scale / lighting / camera. `kind`:
//   herocompare → both characters framed together;  herosingle (focus '05e'|'05f') → one framed alone;
//   herolod     → the 05F hero at LOD0/1/2 side by side.  `clip` plays a clip live (else a static idle).
export interface GHeroView extends GReviewView { focus?: '05e' | '05f' }
export const G_HERO: Record<string, GHeroView> = {
  '05E Electric — Front':       { group: '05F Hero', kind: 'herosingle', focus: '05e', pos: [-0.55, 1.30, 2.5], tgt: [-0.55, 0.98, 0] },
  '05F Hero — Front':           { group: '05F Hero', kind: 'herosingle', focus: '05f', pos: [0.55, 1.30, 2.5],  tgt: [0.55, 0.98, 0] },
  '05E Electric — Back':        { group: '05F Hero', kind: 'herosingle', focus: '05e', pos: [-0.55, 1.30, -2.5], tgt: [-0.55, 0.98, 0] },
  '05F Hero — Back':            { group: '05F Hero', kind: 'herosingle', focus: '05f', pos: [0.55, 1.30, -2.5],  tgt: [0.55, 0.98, 0] },
  'Side-by-Side Front':         { group: '05F Hero', kind: 'herocompare', pos: [0, 1.35, 5.2],  tgt: [0, 0.95, 0] },
  'Side-by-Side Back':          { group: '05F Hero', kind: 'herocompare', pos: [0, 1.35, -5.2], tgt: [0, 0.95, 0] },
  'Side-by-Side Three-Quarter': { group: '05F Hero', kind: 'herocompare', pos: [4.6, 2.1, 5.0], tgt: [0, 0.95, 0] },
  'Pelvis Front Comparison':    { group: '05F Hero', kind: 'herocompare', pos: [0, 0.74, 3.0],  tgt: [0, 0.62, 0] },
  'Pelvis Back Comparison':     { group: '05F Hero', kind: 'herocompare', pos: [0, 0.74, -3.0], tgt: [0, 0.62, 0] },
  'Vest Comparison':            { group: '05F Hero', kind: 'herocompare', pos: [0, 1.36, 2.9],  tgt: [0, 1.28, 0] },
  'Shoulder Comparison':        { group: '05F Hero', kind: 'herocompare', pos: [0, 1.52, 2.7],  tgt: [0, 1.44, 0] },
  'Hand Comparison':            { group: '05F Hero', kind: 'herocompare', pos: [0, 0.96, 2.7],  tgt: [0, 0.86, 0] },
  'Boot Comparison':            { group: '05F Hero', kind: 'herocompare', pos: [0, 0.40, 2.7],  tgt: [0, 0.08, 0] },
  'Walk Comparison':            { group: '05F Hero', kind: 'herocompare', clip: 'Walk_Loop',         pos: [4.4, 1.8, 5.2], tgt: [-0.1, 0.95, 0] },
  'Talk Comparison':           { group: '05F Hero', kind: 'herocompare', clip: 'Idle_Talking_Loop', pos: [4.4, 1.8, 5.2], tgt: [-0.1, 0.95, 0] },
  'Kneeling Comparison':        { group: '05F Hero', kind: 'herocompare', clip: 'Fixing_Kneeling',   pos: [4.2, 1.4, 4.6], tgt: [-0.1, 0.65, 0] },
  'Pickup Comparison':          { group: '05F Hero', kind: 'herocompare', clip: 'PickUp_Table',      pos: [4.2, 1.6, 4.8], tgt: [-0.1, 0.9, 0] },
  'Sitting Comparison':         { group: '05F Hero', kind: 'herocompare', clip: 'Sitting_Idle_Loop', pos: [4.2, 1.4, 4.8], tgt: [-0.1, 0.8, 0] },
  '05F LOD Comparison':         { group: '05F Hero', kind: 'herolod', pos: [0, 1.45, 6.0], tgt: [0, 0.95, 0] },
  'Management Distance Comparison': { group: '05F Hero', kind: 'herocompare', pos: [0, 1.7, 11], tgt: [0, 0.95, 0] },
  'Human Scale Comparison':     { group: '05F Hero', kind: 'herocompare', pos: [0, 1.5, 3.6], tgt: [0, 1.0, 0] },
  'Wireframe Comparison':       { group: '05F Hero', kind: 'herocompare', pos: [0, 1.35, 5.2], tgt: [0, 0.95, 0] },
}
export const G_HERO_ORDER: string[] = [
  '05E Electric — Front', '05F Hero — Front', '05E Electric — Back', '05F Hero — Back',
  'Side-by-Side Front', 'Side-by-Side Back', 'Side-by-Side Three-Quarter',
  'Pelvis Front Comparison', 'Pelvis Back Comparison', 'Vest Comparison', 'Shoulder Comparison',
  'Hand Comparison', 'Boot Comparison', 'Walk Comparison', 'Talk Comparison', 'Kneeling Comparison',
  'Pickup Comparison', 'Sitting Comparison', '05F LOD Comparison', 'Management Distance Comparison',
  'Human Scale Comparison', 'Wireframe Comparison',
]

// combined accessor + kind (Scene-G views live in either G_REVIEW or the 05F G_HERO map)
export const getReviewView = (name: string): GReviewView | undefined => G_REVIEW[name] ?? G_HERO[name]
export const gReviewKind = (name: string): GReviewKind => getReviewView(name)?.kind ?? 'production'
