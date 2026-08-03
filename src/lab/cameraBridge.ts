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
  | 'hero05gcompare' | 'hero05gsingle' | 'hero05glod'
  | 'hero05hcompare' | 'hero05hsingle' | 'hero05hlod'
  | 'hero05icompare' | 'hero05isingle' | 'hero05ilod'   // Asset Lab 05I corrective pass (05H ↔ 05I)
  | 'mgmt'   // Asset Lab 05H final review: fixed-isometric management-camera vignette (Question B)
// `zoom` (orthographic) and `mgmt` (vignette scene id) are used only by the 'mgmt' kind.
export interface GReviewView { group: string; kind: GReviewKind; pos: Vec3; tgt: Vec3; clip?: string; lodFocus?: 0 | 1 | 2; zoom?: number; mgmt?: string }

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

// -----------------------------------------------------------------------------
// Asset Lab 05G — 05F-HERO ↔ 05G surgical-correction comparison group (additive to the Scene-G harness).
// The neutral review area renders the accepted 05F hero on the LEFT (x<0) and the 05G correction on the
// RIGHT (x>0) at IDENTICAL pose / animation-time / scale / lighting / camera. Keys are namespaced "05G/"
// so they NEVER collide with the 05E-vs-05F group above (getReviewView resolves G_REVIEW ?? G_HERO ?? this).
//   hero05gcompare → both framed together;  hero05gsingle (focus '05f'|'05g') → one framed alone;
//   hero05glod     → the 05G hero at LOD0/1/2 side by side.  `clip` plays a clip live (else a static idle).
export interface GHero05GView extends GReviewView { focus?: '05f' | '05g' }
export const G_HERO_05G: Record<string, GHero05GView> = {
  '05G/05F Hero — Front':           { group: '05G Hero', kind: 'hero05gsingle', focus: '05f', pos: [-0.55, 1.30, 2.5], tgt: [-0.55, 0.98, 0] },
  '05G/05G Hero — Front':           { group: '05G Hero', kind: 'hero05gsingle', focus: '05g', pos: [0.55, 1.30, 2.5],  tgt: [0.55, 0.98, 0] },
  '05G/05F Hero — Back':            { group: '05G Hero', kind: 'hero05gsingle', focus: '05f', pos: [-0.55, 1.30, -2.5], tgt: [-0.55, 0.98, 0] },
  '05G/05G Hero — Back':            { group: '05G Hero', kind: 'hero05gsingle', focus: '05g', pos: [0.55, 1.30, -2.5],  tgt: [0.55, 0.98, 0] },
  '05G/Side-by-Side Front':         { group: '05G Hero', kind: 'hero05gcompare', pos: [0, 1.35, 5.2],  tgt: [0, 0.95, 0] },
  '05G/Side-by-Side Back':          { group: '05G Hero', kind: 'hero05gcompare', pos: [0, 1.35, -5.2], tgt: [0, 0.95, 0] },
  '05G/Side-by-Side Side':          { group: '05G Hero', kind: 'hero05gcompare', pos: [5.6, 1.35, 0.6], tgt: [0, 0.95, 0] },
  '05G/Side-by-Side Three-Quarter': { group: '05G Hero', kind: 'hero05gcompare', pos: [4.6, 2.1, 5.0], tgt: [0, 0.95, 0] },
  '05G/Shoulder Front':             { group: '05G Hero', kind: 'hero05gcompare', pos: [0, 1.52, 2.7],  tgt: [0, 1.44, 0] },
  '05G/Shoulder Back':              { group: '05G Hero', kind: 'hero05gcompare', pos: [0, 1.52, -2.7], tgt: [0, 1.44, 0] },
  '05G/Vest Front':                 { group: '05G Hero', kind: 'hero05gcompare', pos: [0, 1.30, 2.7],  tgt: [0, 1.22, 0] },
  '05G/Vest Back':                  { group: '05G Hero', kind: 'hero05gcompare', pos: [0, 1.30, -2.7], tgt: [0, 1.22, 0] },
  '05G/Vest Side':                  { group: '05G Hero', kind: 'hero05gcompare', pos: [3.4, 1.30, 0.6], tgt: [0, 1.22, 0] },
  '05G/Pelvis Front':               { group: '05G Hero', kind: 'hero05gcompare', pos: [0, 0.74, 3.0],  tgt: [0, 0.62, 0] },
  '05G/Pelvis Back':                { group: '05G Hero', kind: 'hero05gcompare', pos: [0, 0.74, -3.0], tgt: [0, 0.62, 0] },
  '05G/Pelvis Side':                { group: '05G Hero', kind: 'hero05gcompare', pos: [3.4, 0.74, 0.6], tgt: [0, 0.62, 0] },
  '05G/Walk':                       { group: '05G Hero', kind: 'hero05gcompare', clip: 'Walk_Loop',         pos: [4.4, 1.8, 5.2], tgt: [-0.1, 0.95, 0] },
  '05G/Talk':                       { group: '05G Hero', kind: 'hero05gcompare', clip: 'Idle_Talking_Loop', pos: [4.4, 1.8, 5.2], tgt: [-0.1, 0.95, 0] },
  '05G/Kneeling':                   { group: '05G Hero', kind: 'hero05gcompare', clip: 'Fixing_Kneeling',   pos: [4.2, 1.4, 4.6], tgt: [-0.1, 0.65, 0] },
  '05G/Pickup':                     { group: '05G Hero', kind: 'hero05gcompare', clip: 'PickUp_Table',      pos: [4.2, 1.6, 4.8], tgt: [-0.1, 0.9, 0] },
  '05G/Sitting':                    { group: '05G Hero', kind: 'hero05gcompare', clip: 'Sitting_Idle_Loop', pos: [4.2, 1.4, 4.8], tgt: [-0.1, 0.8, 0] },
  '05G/LOD':                        { group: '05G Hero', kind: 'hero05glod', pos: [0, 1.45, 6.0], tgt: [0, 0.95, 0] },
  '05G/Management Distance':        { group: '05G Hero', kind: 'hero05gcompare', pos: [0, 1.7, 11], tgt: [0, 0.95, 0] },
  '05G/Human Scale':                { group: '05G Hero', kind: 'hero05gcompare', pos: [0, 1.5, 3.6], tgt: [0, 1.0, 0] },
  '05G/Wireframe':                  { group: '05G Hero', kind: 'hero05gcompare', pos: [0, 1.35, 5.2], tgt: [0, 0.95, 0] },
}
export const G_HERO_05G_ORDER: string[] = [
  '05G/05F Hero — Front', '05G/05G Hero — Front', '05G/05F Hero — Back', '05G/05G Hero — Back',
  '05G/Side-by-Side Front', '05G/Side-by-Side Back', '05G/Side-by-Side Side', '05G/Side-by-Side Three-Quarter',
  '05G/Shoulder Front', '05G/Shoulder Back', '05G/Vest Front', '05G/Vest Back', '05G/Vest Side',
  '05G/Pelvis Front', '05G/Pelvis Back', '05G/Pelvis Side',
  '05G/Walk', '05G/Talk', '05G/Kneeling', '05G/Pickup', '05G/Sitting',
  '05G/LOD', '05G/Management Distance', '05G/Human Scale', '05G/Wireframe',
]

// Asset Lab 05H — 05G-HERO ↔ 05H authored-base-hero comparison group (additive). 05G on the LEFT
// (x<0), the 05H authored-base hero on the RIGHT (x>0), identical pose/time/scale/lighting/camera.
// Keys namespaced "05H/". hero05hsingle (focus) frames one; hero05hcompare frames both; hero05hlod
// shows 05H at LOD0/1/2. `clip` plays a clip live (else static idle).
export interface GHero05HView extends GReviewView { focus?: '05g' | '05h' }
export const G_HERO_05H: Record<string, GHero05HView> = {
  '05H/05G Hero — Front':           { group: '05H Hero', kind: 'hero05hsingle', focus: '05g', pos: [-0.55, 1.30, 2.5], tgt: [-0.55, 0.98, 0] },
  '05H/05H Hero — Front':           { group: '05H Hero', kind: 'hero05hsingle', focus: '05h', pos: [0.55, 1.30, 2.5],  tgt: [0.55, 0.98, 0] },
  '05H/05G Hero — Back':            { group: '05H Hero', kind: 'hero05hsingle', focus: '05g', pos: [-0.55, 1.30, -2.5], tgt: [-0.55, 0.98, 0] },
  '05H/05H Hero — Back':            { group: '05H Hero', kind: 'hero05hsingle', focus: '05h', pos: [0.55, 1.30, -2.5],  tgt: [0.55, 0.98, 0] },
  '05H/Side-by-Side Front':         { group: '05H Hero', kind: 'hero05hcompare', pos: [0, 1.35, 5.2],  tgt: [0, 0.95, 0] },
  '05H/Side-by-Side Back':          { group: '05H Hero', kind: 'hero05hcompare', pos: [0, 1.35, -5.2], tgt: [0, 0.95, 0] },
  '05H/Side-by-Side Side':          { group: '05H Hero', kind: 'hero05hcompare', pos: [5.6, 1.35, 0.6], tgt: [0, 0.95, 0] },
  '05H/Side-by-Side Three-Quarter': { group: '05H Hero', kind: 'hero05hcompare', pos: [4.6, 2.1, 5.0], tgt: [0, 0.95, 0] },
  '05H/Shoulder Front':             { group: '05H Hero', kind: 'hero05hcompare', pos: [0, 1.52, 2.7],  tgt: [0, 1.44, 0] },
  '05H/Shoulder Back':              { group: '05H Hero', kind: 'hero05hcompare', pos: [0, 1.52, -2.7], tgt: [0, 1.44, 0] },
  '05H/Vest Front':                 { group: '05H Hero', kind: 'hero05hcompare', pos: [0, 1.30, 2.7],  tgt: [0, 1.22, 0] },
  '05H/Vest Back':                  { group: '05H Hero', kind: 'hero05hcompare', pos: [0, 1.30, -2.7], tgt: [0, 1.22, 0] },
  '05H/Vest Side':                  { group: '05H Hero', kind: 'hero05hcompare', pos: [3.4, 1.30, 0.6], tgt: [0, 1.22, 0] },
  '05H/Pelvis Front':               { group: '05H Hero', kind: 'hero05hcompare', pos: [0, 0.74, 3.0],  tgt: [0, 0.62, 0] },
  '05H/Pelvis Back':                { group: '05H Hero', kind: 'hero05hcompare', pos: [0, 0.74, -3.0], tgt: [0, 0.62, 0] },
  '05H/Pelvis Side':                { group: '05H Hero', kind: 'hero05hcompare', pos: [3.4, 0.74, 0.6], tgt: [0, 0.62, 0] },
  '05H/Hand':                       { group: '05H Hero', kind: 'hero05hcompare', pos: [3.0, 1.02, 2.2], tgt: [0.55, 0.98, 0] },
  '05H/Boot':                       { group: '05H Hero', kind: 'hero05hcompare', pos: [2.6, 0.35, 2.6], tgt: [0, 0.16, 0] },
  '05H/Walk':                       { group: '05H Hero', kind: 'hero05hcompare', clip: 'Walk_Loop',         pos: [4.4, 1.8, 5.2], tgt: [-0.1, 0.95, 0] },
  '05H/Talk':                       { group: '05H Hero', kind: 'hero05hcompare', clip: 'Idle_Talking_Loop', pos: [4.4, 1.8, 5.2], tgt: [-0.1, 0.95, 0] },
  '05H/Kneeling':                   { group: '05H Hero', kind: 'hero05hcompare', clip: 'Fixing_Kneeling',   pos: [4.2, 1.4, 4.6], tgt: [-0.1, 0.65, 0] },
  '05H/Pickup':                     { group: '05H Hero', kind: 'hero05hcompare', clip: 'PickUp_Table',      pos: [4.2, 1.6, 4.8], tgt: [-0.1, 0.9, 0] },
  '05H/Sitting':                    { group: '05H Hero', kind: 'hero05hcompare', clip: 'Sitting_Idle_Loop', pos: [4.2, 1.4, 4.8], tgt: [-0.1, 0.8, 0] },
  '05H/LOD':                        { group: '05H Hero', kind: 'hero05hlod', pos: [0, 1.45, 6.0], tgt: [0, 0.95, 0] },
  '05H/Management Distance':        { group: '05H Hero', kind: 'hero05hcompare', pos: [0, 1.7, 11], tgt: [0, 0.95, 0] },
  '05H/Human Scale':                { group: '05H Hero', kind: 'hero05hcompare', pos: [0, 1.5, 3.6], tgt: [0, 1.0, 0] },
  '05H/Wireframe':                  { group: '05H Hero', kind: 'hero05hcompare', pos: [0, 1.35, 5.2], tgt: [0, 0.95, 0] },
}
export const G_HERO_05H_ORDER: string[] = [
  '05H/05G Hero — Front', '05H/05H Hero — Front', '05H/05G Hero — Back', '05H/05H Hero — Back',
  '05H/Side-by-Side Front', '05H/Side-by-Side Back', '05H/Side-by-Side Side', '05H/Side-by-Side Three-Quarter',
  '05H/Shoulder Front', '05H/Shoulder Back', '05H/Vest Front', '05H/Vest Back', '05H/Vest Side',
  '05H/Pelvis Front', '05H/Pelvis Back', '05H/Pelvis Side', '05H/Hand', '05H/Boot',
  '05H/Walk', '05H/Talk', '05H/Kneeling', '05H/Pickup', '05H/Sitting',
  '05H/LOD', '05H/Management Distance', '05H/Human Scale', '05H/Wireframe',
]

// Asset Lab 05I — 05H-HERO ↔ 05I corrective-pass comparison group (additive). 05H on the LEFT (x<0),
// the 05I correction on the RIGHT (x>0), identical pose/time/scale/lighting/camera. Keys namespaced "05I/".
// Covers the owner's required Iteration-1 static views (front/rear/L/R/3q ×2, face, shoulder, shirt+vest,
// vest side/wrap, pelvis/seat, boots, hard hat, wireframe), the six clips, and three distances.
export interface GHero05IView extends GReviewView { focus?: '05h' | '05i' }
export const G_HERO_05I: Record<string, GHero05IView> = {
  '05I/05H Hero — Front':       { group: '05I Hero', kind: 'hero05isingle', focus: '05h', pos: [-0.55, 1.30, 2.5], tgt: [-0.55, 0.98, 0] },
  '05I/05I Hero — Front':       { group: '05I Hero', kind: 'hero05isingle', focus: '05i', pos: [0.55, 1.30, 2.5],  tgt: [0.55, 0.98, 0] },
  '05I/Side-by-Side Front':     { group: '05I Hero', kind: 'hero05icompare', pos: [0, 1.35, 5.2],  tgt: [0, 0.95, 0] },
  '05I/Side-by-Side Rear':      { group: '05I Hero', kind: 'hero05icompare', pos: [0, 1.35, -5.2], tgt: [0, 0.95, 0] },
  '05I/Side-by-Side Left':      { group: '05I Hero', kind: 'hero05icompare', pos: [-5.6, 1.35, 0.6], tgt: [0, 0.95, 0] },
  '05I/Side-by-Side Right':     { group: '05I Hero', kind: 'hero05icompare', pos: [5.6, 1.35, 0.6],  tgt: [0, 0.95, 0] },
  '05I/Front Three-Quarter':    { group: '05I Hero', kind: 'hero05icompare', pos: [4.6, 2.1, 5.0], tgt: [0, 0.95, 0] },
  '05I/Rear Three-Quarter':     { group: '05I Hero', kind: 'hero05icompare', pos: [-4.6, 2.1, -5.0], tgt: [0, 0.95, 0] },
  '05I/Face':                   { group: '05I Hero', kind: 'hero05icompare', pos: [0, 1.66, 2.1], tgt: [0, 1.58, 0] },
  '05I/Shoulder & Neck':        { group: '05I Hero', kind: 'hero05icompare', pos: [0, 1.52, 2.7], tgt: [0, 1.42, 0] },
  '05I/Shirt & Vest Front':     { group: '05I Hero', kind: 'hero05icompare', pos: [0, 1.28, 2.7], tgt: [0, 1.18, 0] },
  '05I/Vest Side & Wrap':       { group: '05I Hero', kind: 'hero05icompare', pos: [3.4, 1.28, 0.6], tgt: [0, 1.20, 0] },
  '05I/Pelvis & Seat':          { group: '05I Hero', kind: 'hero05icompare', pos: [0, 0.74, 3.0], tgt: [0, 0.62, 0] },
  '05I/Boots & Feet':           { group: '05I Hero', kind: 'hero05icompare', pos: [2.6, 0.35, 2.6], tgt: [0, 0.16, 0] },
  '05I/Hard Hat':               { group: '05I Hero', kind: 'hero05icompare', pos: [2.2, 1.98, 2.3], tgt: [0, 1.70, 0] },
  '05I/Walk':                   { group: '05I Hero', kind: 'hero05icompare', clip: 'Walk_Loop',         pos: [4.4, 1.8, 5.2], tgt: [-0.1, 0.95, 0] },
  '05I/Talk':                   { group: '05I Hero', kind: 'hero05icompare', clip: 'Idle_Talking_Loop', pos: [4.4, 1.8, 5.2], tgt: [-0.1, 0.95, 0] },
  '05I/Kneeling':               { group: '05I Hero', kind: 'hero05icompare', clip: 'Fixing_Kneeling',   pos: [4.2, 1.4, 4.6], tgt: [-0.1, 0.65, 0] },
  '05I/Pickup':                 { group: '05I Hero', kind: 'hero05icompare', clip: 'PickUp_Table',      pos: [4.2, 1.6, 4.8], tgt: [-0.1, 0.9, 0] },
  '05I/Sitting':                { group: '05I Hero', kind: 'hero05icompare', clip: 'Sitting_Idle_Loop', pos: [4.2, 1.4, 4.8], tgt: [-0.1, 0.8, 0] },
  '05I/LOD':                    { group: '05I Hero', kind: 'hero05ilod', pos: [0, 1.45, 6.0], tgt: [0, 0.95, 0] },
  '05I/Human Distance':         { group: '05I Hero', kind: 'hero05icompare', pos: [0, 1.5, 3.6], tgt: [0, 1.0, 0] },
  '05I/Moderate Distance':      { group: '05I Hero', kind: 'hero05icompare', pos: [0, 1.6, 6.8], tgt: [0, 0.95, 0] },
  '05I/Management Distance':    { group: '05I Hero', kind: 'hero05icompare', pos: [0, 1.7, 11],  tgt: [0, 0.95, 0] },
  '05I/Wireframe':              { group: '05I Hero', kind: 'hero05icompare', pos: [0, 1.35, 5.2], tgt: [0, 0.95, 0] },
}
export const G_HERO_05I_ORDER: string[] = [
  '05I/05H Hero — Front', '05I/05I Hero — Front', '05I/Side-by-Side Front', '05I/Side-by-Side Rear',
  '05I/Side-by-Side Left', '05I/Side-by-Side Right', '05I/Front Three-Quarter', '05I/Rear Three-Quarter',
  '05I/Face', '05I/Shoulder & Neck', '05I/Shirt & Vest Front', '05I/Vest Side & Wrap', '05I/Pelvis & Seat',
  '05I/Boots & Feet', '05I/Hard Hat', '05I/Walk', '05I/Talk', '05I/Kneeling', '05I/Pickup', '05I/Sitting',
  '05I/LOD', '05I/Human Distance', '05I/Moderate Distance', '05I/Management Distance', '05I/Wireframe',
]

// -----------------------------------------------------------------------------
// Asset Lab 05H FINAL OWNER REVIEW — FIXED-ISOMETRIC MANAGEMENT-CAMERA group (Question B).
//
// IMPORTANT (documented assumption): this repo contains NO "approved D1 fixed-isometric management
// camera" — there is exactly one PerspectiveCamera (fov 42) app-wide and its params are defined
// nowhere here. This group is a REPRESENTATIVE orthographic isometric management rig, built from
// standard management-sim conventions, spanning a RANGE of elevations (30° / 37°≈true-iso / 45°)
// and framings (the `zoom` here is the default; the capture matrix sweeps it via state.mgmtZoomMul).
// It exists to answer Question B robustly ACROSS the plausible range, NOT to replicate a specific D1
// camera. If the real D1 camera differs, the value conclusion must be revisited. `kind: 'mgmt'`.
//
// Orthographic camera: pos gives the fixed iso DIRECTION (distance is irrelevant under ortho — only
// direction + zoom set the picture); the rig does lookAt(tgt); `zoom` sets framing. Vignettes are
// neutral review geometry (procedural stage-massing box + apron + cart/light props) with the worker
// source swappable at capture time via state.mgmtWorker ('05g' | '05h' | 'sprite' | 'none'; '' =
// default 05h) and animation frozen when state.reducedMotion. `mgmt` selects the vignette layout.
export const G_MGMT: Record<string, GReviewView> = {
  'Mgmt/One Worker + Stage':     { group: '05H Mgmt', kind: 'mgmt', mgmt: 'one',   zoom: 46, pos: [22.6, 24.9, 21.1], tgt: [0, 0.8, -1.5] },
  'Mgmt/Two Workers + Cart':     { group: '05H Mgmt', kind: 'mgmt', mgmt: 'two',   zoom: 44, pos: [22.6, 24.8, 22.6], tgt: [0, 0.7, 0] },
  'Mgmt/Four Workers + Stage':   { group: '05H Mgmt', kind: 'mgmt', mgmt: 'four',  zoom: 34, pos: [22.6, 24.9, 20.6], tgt: [0, 0.8, -2] },
  'Mgmt/Walking Service Area':   { group: '05H Mgmt', kind: 'mgmt', mgmt: 'walk',  zoom: 40, clip: 'Walk_Loop',       pos: [22.6, 24.8, 22.6], tgt: [0, 0.7, 0] },
  'Mgmt/Seated Worker':          { group: '05H Mgmt', kind: 'mgmt', mgmt: 'seat',  zoom: 52, clip: 'Sitting_Idle_Loop', pos: [22.6, 24.6, 22.6], tgt: [0, 0.5, 0] },
  'Mgmt/Kneeling Worker':        { group: '05H Mgmt', kind: 'mgmt', mgmt: 'kneel', zoom: 52, clip: 'Fixing_Kneeling',   pos: [22.6, 24.55, 22.6], tgt: [0, 0.45, 0] },
  // elevation-range variants on the busiest vignette, so Question B is judged across iso angles
  'Mgmt/Four Workers (Iso 30°)': { group: '05H Mgmt', kind: 'mgmt', mgmt: 'four',  zoom: 34, pos: [24.5, 20.8, 22.5], tgt: [0, 0.8, -2] },
  'Mgmt/Four Workers (Iso 45°)': { group: '05H Mgmt', kind: 'mgmt', mgmt: 'four',  zoom: 34, pos: [20.0, 29.1, 18.0], tgt: [0, 0.8, -2] },
}
export const G_MGMT_ORDER: string[] = [
  'Mgmt/One Worker + Stage', 'Mgmt/Two Workers + Cart', 'Mgmt/Four Workers + Stage',
  'Mgmt/Walking Service Area', 'Mgmt/Seated Worker', 'Mgmt/Kneeling Worker',
  'Mgmt/Four Workers (Iso 30°)', 'Mgmt/Four Workers (Iso 45°)',
]
export const isMgmtView = (name: string): boolean => name in G_MGMT

// combined accessor + kind (Scene-G views live in G_REVIEW, the 05F G_HERO, 05G, 05H, or 05H-mgmt map)
export const getReviewView = (name: string): GReviewView | undefined =>
  G_REVIEW[name] ?? G_HERO[name] ?? G_HERO_05G[name] ?? G_HERO_05H[name] ?? G_HERO_05I[name] ?? G_MGMT[name]
export const gReviewKind = (name: string): GReviewKind => getReviewView(name)?.kind ?? 'production'
