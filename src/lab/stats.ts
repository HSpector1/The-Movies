// Diagnostic renderer statistics (contract §8). Written every frame by <StatsCollector/>,
// read by the HUD and by window.__lab.getStats() for headless capture (§12 perf panel).
// NOTE: these are diagnostic only, NOT target-hardware acceptance numbers (§8).
export interface LabStats {
  fps: number
  drawCalls: number
  triangles: number
  geometries: number
  textures: number
  programs: number
  loadedAssets: number
  totalAssets: number
  loading: boolean
}

export const latestStats: LabStats = {
  fps: 0, drawCalls: 0, triangles: 0, geometries: 0, textures: 0,
  programs: 0, loadedAssets: 0, totalAssets: 0, loading: true,
}

export function writeStats(p: Partial<LabStats>): void {
  Object.assign(latestStats, p)
}
