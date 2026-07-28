import { useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import { writeStats } from '../lab/stats'

// Samples renderer.info + loading progress every frame into latestStats (contract §8).
export function StatsCollector(): null {
  const gl = useThree((s) => s.gl)
  const { active, loaded, total } = useProgress()
  const f = useRef({ frames: 0, t: performance.now(), fps: 0 })
  useFrame(() => {
    const info = gl.info
    const c = f.current
    c.frames++
    const now = performance.now()
    if (now - c.t >= 500) { c.fps = Math.round((c.frames * 1000) / (now - c.t)); c.frames = 0; c.t = now }
    writeStats({
      fps: c.fps,
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      programs: info.programs?.length ?? 0,
      loadedAssets: loaded,
      totalAssets: total,
      loading: active,
    })
  })
  return null
}
