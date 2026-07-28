// Scene environment: procedural IBL (offline-safe, no CDN), lights, wireframe controller,
// and the 1.8 m human scale reference (contract §8 "grid and scale reference").
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useLab } from '../lab/LabContext'

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

export function Lights(): JSX.Element {
  const { state } = useLab()
  return (
    <>
      <ambientLight intensity={state.ambientLight} />
      <hemisphereLight intensity={state.ambientLight * 0.6} groundColor={'#20242c'} color={'#cfe0ff'} />
      <directionalLight
        castShadow
        position={[18, 28, 14]}
        intensity={state.keyLight}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={180}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-bias={-0.0002}
      />
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
