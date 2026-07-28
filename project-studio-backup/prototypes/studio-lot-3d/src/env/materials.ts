// ── Shared Meridian material library ──────────────────────────────────────────
// One cached material per (colour + finish) so the whole scene shares a small set of
// MeshStandardMaterials (fewer GPU programs, lower draw-call/material churn). Colours
// are the LOCKED Meridian palette from `01-ART-DIRECTION.md`. Reused by the
// MeridianEnvironmentKit and the scene. Full doc: docs/M3-MATERIAL-LIBRARY.md.

import * as THREE from 'three'

// Canonical Meridian palette (hex) — do not inline these elsewhere; import from here.
export const MERIDIAN = {
  skyTop: '#f5e6c8',
  skyHorizon: '#e6c79c',
  lawn: '#93a86c',
  lawnEdge: '#74894f',
  path: '#dac9a6', // decomposed granite
  asphalt: '#6f6a63',
  markings: '#e9dcbf',
  plaza: '#e4d7bc',
  creamStucco: '#efe3c6',
  creamShadow: '#c9b78e',
  taupe: '#cdbb9a', // Deco admin body
  brass: '#caa25a',
  brassDark: '#a9863f',
  buff: '#dcc9a0', // soundstage
  buffShadow: '#b09f72',
  terracotta: '#b56a4a', // roofs
  slate: '#b9c0c4',
  red: '#b8484a', // signature accent (marquee/banners/barriers)
  litWindow: '#f6e4a6', // warm interior spill
  glass: '#93a7ad',
  wood: '#8a6a44',
  metal: '#8f8a82',
  darkInterior: '#3a3226',
} as const

export type MatOpts = { rough?: number; metal?: number; emissive?: string; emissiveIntensity?: number; flatShading?: boolean; polyOffset?: number }

const cache = new Map<string, THREE.MeshStandardMaterial>()

/** Cached, shared MeshStandardMaterial for a colour + finish. */
export function mat(color: string, opts: MatOpts = {}): THREE.MeshStandardMaterial {
  const key = color + '|' + JSON.stringify(opts)
  let m = cache.get(key)
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: opts.rough ?? 0.9,
      metalness: opts.metal ?? 0,
      flatShading: opts.flatShading ?? false,
    })
    if (opts.emissive) {
      m.emissive = new THREE.Color(opts.emissive)
      m.emissiveIntensity = opts.emissiveIntensity ?? 1
    }
    if (opts.polyOffset != null) {
      // pull coplanar decals (road paint) toward the camera so they never z-fight
      m.polygonOffset = true
      m.polygonOffsetFactor = -1
      m.polygonOffsetUnits = opts.polyOffset
    }
    cache.set(key, m)
  }
  return m
}

// Named roles (the "library") — thin wrappers over `mat` for legible call sites.
export const M = {
  stucco: () => mat(MERIDIAN.creamStucco, { rough: 0.95 }),
  stuccoShadow: () => mat(MERIDIAN.creamShadow, { rough: 0.95 }),
  taupe: () => mat(MERIDIAN.taupe, { rough: 0.9 }),
  brass: () => mat(MERIDIAN.brass, { rough: 0.45, metal: 0.5 }),
  brassDark: () => mat(MERIDIAN.brassDark, { rough: 0.5, metal: 0.5 }),
  buff: () => mat(MERIDIAN.buff, { rough: 0.9 }),
  buffShadow: () => mat(MERIDIAN.buffShadow, { rough: 0.9 }),
  terracotta: () => mat(MERIDIAN.terracotta, { rough: 0.85 }),
  slate: () => mat(MERIDIAN.slate, { rough: 0.8 }),
  red: () => mat(MERIDIAN.red, { rough: 0.7 }),
  glass: () => mat(MERIDIAN.glass, { rough: 0.25, metal: 0.1 }),
  litWindow: () => mat(MERIDIAN.litWindow, { rough: 0.4, emissive: MERIDIAN.litWindow, emissiveIntensity: 0.6 }),
  wood: () => mat(MERIDIAN.wood, { rough: 0.9 }),
  metal: () => mat(MERIDIAN.metal, { rough: 0.6, metal: 0.4 }),
  asphalt: () => mat(MERIDIAN.asphalt, { rough: 1 }),
  path: () => mat(MERIDIAN.path, { rough: 1 }),
  plaza: () => mat(MERIDIAN.plaza, { rough: 1 }),
  lawn: () => mat(MERIDIAN.lawn, { rough: 1 }),
  darkInterior: () => mat(MERIDIAN.darkInterior, { rough: 1, emissive: '#5a4326', emissiveIntensity: 0.4 }),
}

/** Dispose all cached materials (call on renderer teardown to avoid GPU leaks). */
export function disposeMaterials(): void {
  cache.forEach((m) => m.dispose())
  cache.clear()
}
