import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import * as THREE from 'three'
import { writeStats, latestStats } from '../lab/stats'
import { useLab } from '../lab/LabContext'

// Samples renderer statistics + loading progress every frame into latestStats (contract §8).
//
// FIX (owner correction pass): renderer.info.autoReset defaults true, which resets the render
// counters at the START of every gl.render() call. With Post FX, the EffectComposer runs several
// passes per frame and the LAST is a fullscreen quad, so the panel was reading calls=1/triangles=1.
// Here autoReset is disabled and the counters are read + reset ONCE per frame, so drawCalls/triangles
// report the whole frame (scene + any Post FX passes). A separate, deterministic scene-graph
// traversal reports a reproducible triangle/mesh inventory that never collapses. Renderer/GPU and
// SwiftShader (software) status are surfaced so diagnostic numbers are honestly labeled.
export function StatsCollector(): null {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const { active, loaded, total } = useProgress()
  const { state } = useLab()
  const f = useRef({ frames: 0, t: performance.now(), fps: 0, lastInv: 0 })
  const renderer = useRef({ str: 'unknown', software: false })

  useEffect(() => {
    gl.info.autoReset = false          // accumulate across multi-pass frames; we reset manually
    try {
      const ctx = gl.getContext() as WebGLRenderingContext
      const ext = ctx.getExtension('WEBGL_debug_renderer_info')
      const str = ext ? String(ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : (gl.capabilities.isWebGL2 ? 'WebGL 2' : 'WebGL')
      renderer.current = { str, software: /swiftshader|software|llvmpipe|angle \(google/i.test(str) }
    } catch { renderer.current = { str: 'unavailable', software: false } }
    return () => { gl.info.autoReset = true }
  }, [gl])

  useFrame(() => {
    const info = gl.info
    const c = f.current
    // read the PREVIOUS frame's accumulated render (all passes), then reset for the new frame
    const calls = info.render.calls
    const tris = info.render.triangles
    info.reset()

    c.frames++
    const now = performance.now()
    if (now - c.t >= 500) { c.fps = Math.round((c.frames * 1000) / (now - c.t)); c.frames = 0; c.t = now }

    // deterministic scene inventory (visible meshes / triangles) — recomputed ~4x/sec, never collapses
    let invTris = latestStats.sceneTriangles
    let invMeshes = latestStats.sceneMeshes
    if (now - c.lastInv >= 250) {
      c.lastInv = now
      let t = 0, n = 0
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        if (m.isMesh && m.visible && m.geometry) {
          const g = m.geometry
          const count = g.index ? g.index.count : (g.attributes.position ? g.attributes.position.count : 0)
          t += count / 3; n += 1
        }
      })
      invTris = Math.round(t); invMeshes = n
    }

    writeStats({
      fps: c.fps,
      drawCalls: calls,
      triangles: tris,
      sceneTriangles: invTris,
      sceneMeshes: invMeshes,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      programs: info.programs?.length ?? 0,
      renderer: renderer.current.str,
      isSoftware: renderer.current.software,
      postFx: state.postFx && state.scene === 'E',
      loadedAssets: loaded,
      totalAssets: total,
      loading: active,
    })
  })
  return null
}
