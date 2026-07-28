// Diagnostic renderer statistics (contract §8). Written every frame by <StatsCollector/>,
// read by the HUD and by window.__lab.getStats() for headless capture (§12 perf panel).
// NOTE: these are diagnostic only, NOT target-hardware acceptance numbers (§8).
export interface LabStats {
  fps: number
  drawCalls: number        // CURRENT FRAME, all render passes (scene + any Post FX passes)
  triangles: number        // CURRENT FRAME, all render passes
  sceneTriangles: number   // INVENTORY: deterministic sum of visible-mesh triangles (never collapses)
  sceneMeshes: number      // INVENTORY: count of visible meshes
  geometries: number       // LOADED (renderer memory)
  textures: number         // LOADED (renderer memory)
  programs: number
  renderer: string         // active renderer / GPU
  isSoftware: boolean      // SwiftShader / software raster → diagnostic-only
  postFx: boolean          // Post FX composer active (frame draw calls then include post passes)
  loadedAssets: number
  totalAssets: number
  loading: boolean
}

export const latestStats: LabStats = {
  fps: 0, drawCalls: 0, triangles: 0, sceneTriangles: 0, sceneMeshes: 0,
  geometries: 0, textures: 0, programs: 0, renderer: 'unknown', isSoftware: false,
  postFx: false, loadedAssets: 0, totalAssets: 0, loading: true,
}

export function writeStats(p: Partial<LabStats>): void {
  Object.assign(latestStats, p)
}
