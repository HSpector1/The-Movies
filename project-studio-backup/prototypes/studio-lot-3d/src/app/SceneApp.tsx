// ── Scene assembly + overlay ──────────────────────────────────────────────────
import { useEffect, useRef, type CSSProperties } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Buildings } from '../scene/Buildings'
import { Characters } from '../characters/Characters'
import { CameraRig } from '../camera/CameraRig'
import {
  state,
  setFps,
  ready,
  clearCharacter,
  setCameraPreset,
  playVignette,
  pauseVignette,
} from './store'
import { useStoreTick } from './useStore'

function VignetteClock(): null {
  useFrame((_s, dt) => {
    const v = state.vignette
    if (v.active && !v.paused) {
      v.t += dt
      if (v.t >= v.duration) v.t = 0 // loop the single sequence for the demo
    }
  })
  return null
}

function PerfMeter(): null {
  const frames = useRef(0)
  const acc = useRef(0)
  useFrame((_s, dt) => {
    frames.current++
    acc.current += dt
    if (acc.current >= 0.5) {
      setFps(Math.round(frames.current / acc.current))
      frames.current = 0
      acc.current = 0
    }
  })
  return null
}

function Lights(): JSX.Element {
  return (
    <group>
      {/* warm golden-hour key from upper-left */}
      <directionalLight
        position={[-40, 46, 28]}
        intensity={2.1}
        color="#ffe6bd"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-bias={-0.0004}
      />
      <hemisphereLight args={['#f5e6c8', '#6a7a58', 0.7]} />
      <ambientLight intensity={0.25} />
    </group>
  )
}

function Overlay(): JSX.Element | null {
  useStoreTick()
  const c = state.selectedCharacter
  const b = state.selectedBuilding
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none', fontFamily: 'Avenir, Helvetica, Arial, sans-serif' }}>
      {state.dev && (
        <div style={panel}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: '#caa25a', marginBottom: 6 }}>
            DEV · 3D SPIKE · {state.fps} fps
          </div>
          <button style={btn} onClick={() => setCameraPreset('overview')}>Overview</button>
          <button style={btn} onClick={() => setCameraPreset('production')}>Production</button>
          <button style={btn} onClick={() => setCameraPreset('human')}>Human-scale</button>
          <button style={btn} onClick={() => playVignette()}>▶ Vignette</button>
          <button style={btn} onClick={() => pauseVignette(!state.vignette.paused)}>⏸ Toggle</button>
        </div>
      )}
      {c && (
        <aside style={card}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: '#f4ead4' }}>{c.role}</div>
          <div style={{ fontSize: 12, color: '#caa25a', margin: '3px 0 6px' }}>
            {c.activity}{c.production ? ` · “${c.production}”` : c.building ? ` · ${c.building}` : ''}
          </div>
          <button style={{ ...btn, pointerEvents: 'auto' }} onClick={() => clearCharacter()}>Dismiss</button>
        </aside>
      )}
      {b && !c && (
        <div style={badge}>{b}</div>
      )}
    </div>
  )
}

const panel: CSSProperties = { position: 'absolute', top: 12, right: 12, pointerEvents: 'auto', background: 'rgba(30,22,14,0.86)', border: '1px dashed rgba(202,162,90,0.5)', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }
const card: CSSProperties = { position: 'absolute', top: 84, right: 12, width: 210, pointerEvents: 'auto', background: 'linear-gradient(180deg,#34291c,#281e14)', border: '1px solid rgba(202,162,90,0.35)', borderLeft: '3px solid #caa25a', borderRadius: 9, padding: 13 }
const badge: CSSProperties = { position: 'absolute', bottom: 16, left: 16, background: 'rgba(26,18,10,0.8)', color: '#f4ead4', border: '1px solid rgba(202,162,90,0.4)', borderRadius: 999, padding: '6px 12px', fontSize: 12 }
const btn: CSSProperties = { appearance: 'none', border: '1px solid rgba(202,162,90,0.4)', background: 'rgba(20,14,8,0.6)', color: '#e9dcc0', borderRadius: 6, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }

function ReadyBeacon(): null {
  useEffect(() => {
    ready()
  }, [])
  return null
}

export function SceneApp(): JSX.Element {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Overlay />
      <Canvas
        shadows
        camera={{ fov: 45, near: 0.5, far: 400, position: [46, 38, 50] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onPointerMissed={() => {
          clearCharacter(true)
          if (state.selectedBuilding) {
            state.selectedBuilding = null
          }
        }}
      >
        <color attach="background" args={['#e6c79c']} />
        <fog attach="fog" args={['#e6c79c', 90, 220]} />
        <Lights />
        <CameraRig />
        <Buildings />
        <Characters />
        <VignetteClock />
        <PerfMeter />
        <ReadyBeacon />
      </Canvas>
    </div>
  )
}
