import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { LabProvider, useLab } from './lab/LabContext'
import { useRuntimeManifest } from './lab/useRuntimeManifest'
import { RoomEnv, Lights, WireframeController } from './components/env'
import { StatsCollector } from './components/StatsCollector'
import { CameraController } from './camera/CameraController'
import { SceneA, SceneB, SceneC } from './scenes'
import { DevPanel } from './ui/DevPanel'
import type { RuntimeManifest } from './types'

function LabScene({ manifest }: { manifest: RuntimeManifest | null }): JSX.Element {
  const { state } = useLab()
  return (
    <>
      <color attach="background" args={['#0e1116']} />
      <fog attach="fog" args={['#0e1116', 60, 180]} />
      <RoomEnv />
      <Lights />
      <CameraController />
      <OrbitControls makeDefault enableDamping={false} maxPolarAngle={Math.PI / 2.02} minDistance={0.6} maxDistance={140} />
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
