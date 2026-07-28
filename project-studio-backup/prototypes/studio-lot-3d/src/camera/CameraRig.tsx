// ── Camera rig ────────────────────────────────────────────────────────────────
// Custom spherical rig: three presets (overview/production/human) with smooth
// lerp, plus clamped user orbit (drag) + dolly (wheel). Clamps prevent going under
// the ground, top-down, or too far — so unfinished areas stay off-screen.
// Deterministic: a goal can be snapped instantly for headless capture.

import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { state } from '../app/store'

const PITCH_MIN = 0.18
const PITCH_MAX = 1.15
const DIST_MIN = 6
const DIST_MAX = 95

type Spherical = { yaw: number; pitch: number; dist: number; target: Vector3 }

function fromGoal(pos: readonly number[], target: readonly number[]): Spherical {
  const t = new Vector3(target[0], target[1], target[2])
  const off = new Vector3(pos[0] - target[0], pos[1] - target[1], pos[2] - target[2])
  const dist = off.length()
  return { yaw: Math.atan2(off.x, off.z), pitch: Math.asin(off.y / dist), dist, target: t }
}
const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v)

export function CameraRig(): null {
  const { camera, gl } = useThree()
  const cur = useRef<Spherical>(fromGoal(state.cameraGoal.pos, state.cameraGoal.target))
  const dst = useRef<Spherical>(cur.current)
  const lastToken = useRef(-1)
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const el = gl.domElement
    const down = (e: PointerEvent) => {
      dragging.current = true
      last.current = { x: e.clientX, y: e.clientY }
    }
    const move = (e: PointerEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - last.current.x
      const dy = e.clientY - last.current.y
      last.current = { x: e.clientX, y: e.clientY }
      cur.current.yaw -= dx * 0.005
      cur.current.pitch = clamp(cur.current.pitch + dy * 0.004, PITCH_MIN, PITCH_MAX)
      dst.current = cur.current // user input cancels any active preset tween
    }
    const up = () => {
      dragging.current = false
    }
    const wheel = (e: WheelEvent) => {
      cur.current.dist = clamp(cur.current.dist * (e.deltaY > 0 ? 1.08 : 0.93), DIST_MIN, DIST_MAX)
      dst.current = cur.current
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    el.addEventListener('wheel', wheel, { passive: true })
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      el.removeEventListener('wheel', wheel)
    }
  }, [gl])

  useFrame((_s, dt) => {
    // new preset/goal?
    if (state.cameraToken !== lastToken.current) {
      lastToken.current = state.cameraToken
      dst.current = fromGoal(state.cameraGoal.pos, state.cameraGoal.target)
      if (state.cameraInstant) {
        cur.current = {
          yaw: dst.current.yaw,
          pitch: dst.current.pitch,
          dist: dst.current.dist,
          target: dst.current.target.clone(),
        }
      }
    }
    // lerp toward destination
    const k = 1 - Math.pow(0.001, dt) // ~smooth, frame-rate independent
    const c = cur.current
    const d = dst.current
    c.yaw += (d.yaw - c.yaw) * k
    c.pitch += (d.pitch - c.pitch) * k
    c.dist += (d.dist - c.dist) * k
    c.target.lerp(d.target, k)
    c.pitch = clamp(c.pitch, PITCH_MIN, PITCH_MAX)
    c.dist = clamp(c.dist, DIST_MIN, DIST_MAX)
    // spherical → cartesian
    const y = Math.sin(c.pitch) * c.dist
    const r = Math.cos(c.pitch) * c.dist
    camera.position.set(c.target.x + Math.sin(c.yaw) * r, c.target.y + y, c.target.z + Math.cos(c.yaw) * r)
    camera.lookAt(c.target)
  })
  return null
}
