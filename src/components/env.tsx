// Scene environment. Lab 02 upgrades this to a warm golden-hour studio look (contract §6):
// procedural sky (offline-safe), warm directional key aligned with the visible sun, warm
// ambient/hemisphere fill, plus procedural IBL. Also the wireframe controller + scale ref.
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useLab } from '../lab/LabContext'

// Shared low, warm sun so cast shadows point away from the sun you can actually see.
export const SUN: [number, number, number] = [42, 20, 26]

/** PBR image-based lighting from a procedural room — no network fetch (headless-capture safe). */
export function RoomEnv(): null {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const rt = pmrem.fromScene(new RoomEnvironment(), 0.04)
    scene.environment = rt.texture
    return () => { rt.dispose(); pmrem.dispose(); scene.environment = null }
  }, [gl, scene])
  return null
}

export function StudioSky(): JSX.Element {
  // distance must be inside the camera far plane (2000). Sky material ignores fog, so the
  // warm sky stays readable behind the fogged lot.
  return (
    <Sky distance={1000} sunPosition={SUN} turbidity={4} rayleigh={3} mieCoefficient={0.005} mieDirectionalG={0.92} />
  )
}

export function Lights(): JSX.Element {
  const { state } = useLab()
  return (
    <>
      <ambientLight intensity={state.ambientLight * 0.6} color={'#ffe9cf'} />
      <hemisphereLight intensity={state.ambientLight} color={'#ffe3bd'} groundColor={'#4a4034'} />
      <directionalLight
        castShadow={state.showShadows}
        position={SUN}
        intensity={state.keyLight}
        color={'#ffdca8'}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={220}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-bias={-0.00035}
        shadow-normalBias={0.02}
      />
      {/* subtle cool bounce from the opposite side to keep shadows from going muddy */}
      <directionalLight position={[-30, 14, -20]} intensity={state.keyLight * 0.12} color={'#bcd0ff'} />
    </>
  )
}

/** Applies the global wireframe toggle to every material currently in the scene. */
export function WireframeController(): null {
  const scene = useThree((s) => s.scene)
  const { state } = useLab()
  useEffect(() => {
    scene.traverse((o) => {
      const m = (o as THREE.Mesh).material
      if (!m) return
      for (const mm of Array.isArray(m) ? m : [m]) {
        if (mm && 'wireframe' in mm) (mm as THREE.MeshStandardMaterial).wireframe = state.wireframe
      }
    })
  }, [state.wireframe, state.scene, scene])
  return null
}

/** A 1.8 m stylized human silhouette + a 1.8 m measuring rod. THE scale reference. */
export function HumanScaleRef({ position = [0, 0, 0] }: { position?: [number, number, number] }): JSX.Element {
  return (
    <group position={position}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.22, 1.0, 6, 14]} />
        <meshStandardMaterial color={'#ff7043'} roughness={0.65} metalness={0} />
      </mesh>
      <mesh position={[0, 1.63, 0]} castShadow>
        <sphereGeometry args={[0.16, 20, 20]} />
        <meshStandardMaterial color={'#ffab91'} roughness={0.6} metalness={0} />
      </mesh>
      <mesh position={[0.36, 0.9, 0]}>
        <boxGeometry args={[0.03, 1.8, 0.03]} />
        <meshStandardMaterial color={'#fdd835'} emissive={'#fdd835'} emissiveIntensity={0.25} />
      </mesh>
    </group>
  )
}
