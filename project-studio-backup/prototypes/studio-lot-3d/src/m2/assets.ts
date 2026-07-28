// ── M2 sample registry (Low-Poly Asset Compatibility Survey) ──────────────────
// ONE coherent permissively-licensed low-poly family (Kenney, CC0). A small
// coordinated sample — one asset per required type — imported to test scale,
// coherence, restyle-toward-Meridian, and (for the humanoid) rig + animation.
// These are EVALUATION assets, not shipped identity assets. See PROVENANCE.md.

export type M2AssetType =
  | 'building' // bungalow / office
  | 'hangar' // industrial / soundstage-adjacent structure component
  | 'vehicle' // production vehicle (truck)
  | 'car' // car / cart
  | 'vegetation' // planting cluster
  | 'prop' // equipment-case / crate cluster
  | 'humanoid' // rigged character (+ animation)

export type M2Asset = {
  key: string
  type: M2AssetType
  label: string
  url: string // served from /m2-assets (public/)
  pack: string // Kenney pack (all CC0)
  /** how many to place, to read as a "cluster" where the brief asks for one */
  count?: number
  /** true when the GLB carries a rig + animation clips */
  animated?: boolean
}

const BASE = 'm2-assets'

export const M2_ASSETS: M2Asset[] = [
  { key: 'building', type: 'building', label: 'Office / bungalow', pack: 'City Kit (Commercial)', url: `${BASE}/city/building-a.glb` },
  { key: 'hangar', type: 'hangar', label: 'Hangar component', pack: 'Factory Kit', url: `${BASE}/factory/structure-tall.glb` },
  { key: 'vehicle', type: 'vehicle', label: 'Production truck', pack: 'Car Kit', url: `${BASE}/car-kit/delivery.glb` },
  { key: 'car', type: 'car', label: 'Car', pack: 'Car Kit', url: `${BASE}/car-kit/sedan.glb` },
  { key: 'vegetation', type: 'vegetation', label: 'Planting', pack: 'Nature Kit', url: `${BASE}/nature/tree_default.glb`, count: 3 },
  { key: 'prop', type: 'prop', label: 'Equipment cases', pack: 'Factory Kit', url: `${BASE}/factory/box-large.glb`, count: 3 },
  { key: 'humanoid', type: 'humanoid', label: 'Crew (rigged)', pack: 'Blocky Characters', url: `${BASE}/character/character-a.glb`, animated: true },
]

// clips present in the character GLB that map to the brief's motion needs
export const CLIP_MAP: Record<string, string> = {
  idle: 'idle',
  walk: 'walk',
  gesture: 'emote-yes',
  carrying: 'holding-both',
  reacting: 'emote-no',
}
