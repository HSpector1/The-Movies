import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { LabProvider, useLab } from './lab/LabContext'
import { useRuntimeManifest } from './lab/useRuntimeManifest'
import { RoomEnv, Lights, WireframeController, StudioSky } from './components/env'
import { StatsCollector } from './components/StatsCollector'
import { CameraController } from './camera/CameraController'
import { ToneMapController, HeroGrounding, HeroSoftShadows, HeroComposer } from './components/HeroFx'
import { SceneA, SceneB, SceneC, SceneD, SceneE } from './scenes'
import { DevPanel } from './ui/DevPanel'
import type { RuntimeManifest } from './types'

function LabScene({ manifest }: { manifest: RuntimeManifest | null }): JSX.Element {
  const { state } = useLab()
  const warm = state.scene === 'D' || state.scene === 'E'
  const bg = warm ? (state.atmosphere ? '#dcc9a8' : '#aeb6bd') : '#0e1116'
  return (
    <>
      <color attach="background" args={[bg]} />
      {warm
        ? (state.atmosphere && <fog attach="fog" args={['#e6d2ac', 70, 340]} />)
        : <fog attach="fog" args={['#0e1116', 60, 180]} />}
      {warm && state.atmosphere && <StudioSky />}
      <RoomEnv />
      <Lights />
      {/* Scene-E hero render enhancements (ACES + grounding + optional PCSS), scoped to E so
          Scene D keeps its plain greybox baseline. */}
      {state.scene === 'E' && <><ToneMapController /><HeroSoftShadows /><HeroGrounding /><HeroComposer /></>}
      <CameraController />
      <OrbitControls makeDefault enableDamping={false} maxPolarAngle={Math.PI / 2.05} minDistance={1} maxDistance={180} />
      <StatsCollector />
      <WireframeController />
      {state.showGrid && (
        <Grid args={[240, 240]} cellSize={1} cellThickness={0.6} sectionSize={10} sectionThickness={1.2}
          cellColor={'#2a2f38'} sectionColor={'#3b8fbf'} fadeDistance={95} fadeStrength={1} infiniteGrid />
      )}
      {manifest && (
        <Suspense fallback={null}>
          {state.scene === 'A' && <SceneA manifest={manifest} />}
          {state.scene === 'B' && <SceneB manifest={manifest} />}
          {state.scene === 'C' && <SceneC />}
          {state.scene === 'D' && <SceneD manifest={manifest} />}
          {state.scene === 'E' && <SceneE />}
        </Suspense>
      )}
    </>
  )
}

export default function App(): JSX.Element {
  const manifest = useRuntimeManifest()
  return (
    <LabProvider>
      <div style={{ position: 'fixed', inset: 0 }}>
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
          camera={{ position: [30, 22, 34], fov: 42, near: 0.1, far: 2000 }}
        >
          <LabScene manifest={manifest} />
        </Canvas>
        <DevPanel manifest={manifest} />
      </div>
    </LabProvider>
  )
}
