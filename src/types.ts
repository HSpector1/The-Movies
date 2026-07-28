// Runtime manifest shape (produced by tools/build-manifest.mjs). The app is data-driven:
// it renders whatever the manifest declares. No asset paths are hard-coded in scenes.
export type Provenance =
  | 'CC0' | 'ATTRIBUTION-REQUIRED' | 'PROTOTYPE-ONLY' | 'LICENSE-UNCLEAR' | 'DO-NOT-USE'

export type Pack = 'downtown' | 'props' | 'animation'

export interface RuntimeAsset {
  id: string
  pack: Pack
  kind: 'glb' | 'fbx'
  url: string
  role: string
  note?: string
  provenance: Provenance
  author: string
  reuse: 'reusable' | 'prototype-only'
  sizeMeters?: [number, number, number] | null
  triangles?: number | null
  materials?: number | null
  rootMotion?: boolean
  clipCount?: number
  present: boolean
  fileKB?: number | null
}

export interface Clip { name: string; duration: number; file?: string }

export interface RuntimeManifest {
  scale: { unit: string; adultHeight: number; note?: string }
  roleClipMap: Record<string, string>
  clips: Clip[]
  counts: { total: number; reusable: number; prototypeOnly: number; present: number }
  assets: RuntimeAsset[]
}

export type SceneKey = 'A' | 'B' | 'C' | 'D' | 'E'
export type CameraMode = 'overview' | 'inspection'
