// Asset Lab 03 — Scene-E render enhancements (the capture-safe, ZERO-DEPENDENCY core look).
//
// These are the modern-fidelity levers that carry the deliverable and are guaranteed to survive
// headless ANGLE/SwiftShader capture: ACES filmic tone mapping (the single biggest "2026" shift),
// baked contact-shadow grounding, and an optional PCSS soft-shadow pass.
//
// CRITICAL isolation rule: every effect here is Scene-E-scoped by mount/unmount so Scene D keeps
// its plain default-tonemap / plain-PCF greybox baseline untouched. ACES restores to NoToneMapping
// on unmount; SoftShadows (a global shader monkeypatch) only mounts when explicitly toggled.
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { ContactShadows, SoftShadows } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, SMAA, N8AO } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useLab } from '../lab/LabContext'

const ACES_EXPOSURE = 1.05

/** Switch the renderer to ACES filmic tone mapping while mounted; restore the Canvas default on
 *  unmount so Scene D stays byte-comparable. Pure fragment math → identical under SwiftShader. */
export function ToneMapController(): null {
  const gl = useThree((s) => s.gl)
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    const prevMode = gl.toneMapping
    const prevExp = gl.toneMappingExposure
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = ACES_EXPOSURE
    invalidate()
    return () => {
      gl.toneMapping = prevMode
      gl.toneMappingExposure = prevExp
      invalidate()
    }
  }, [gl, invalidate])
  return null
}

/** Soft, baked contact-occlusion pool over the apron + building base. frames={1} = one bake,
 *  deterministic and cheap under SwiftShader. Warm-tinted to match golden hour. */
export function HeroGrounding(): JSX.Element {
  return (
    <ContactShadows
      position={[2, 0.03, 6]}
      scale={64}
      resolution={1024}
      far={7}
      blur={3}
      opacity={0.55}
      color={'#2a2018'}
      frames={1}
    />
  )
}

/** Optional PCSS contact-hardening soft shadows on the key light. Global shader patch — only
 *  mounts when toggled, and drei restores the original shadow shader on unmount. Software-heavy,
 *  so the deterministic capture keeps it OFF; it is a live/real-GPU enhancement. */
export function HeroSoftShadows(): JSX.Element | null {
  const { state } = useLab()
  if (!state.softShadows) return null
  return <SoftShadows size={12} samples={10} focus={0.6} />
}

/** Optional post-processing beauty pass — N8AO contact occlusion + warm bloom on the emissive
 *  practicals (red-eye, film-light lenses) + a gentle vignette, with SMAA to replace the MSAA
 *  the composer forgoes. ACES stays the single tone-map owner (renderer side), so NO ToneMapping
 *  effect here. This is a real-GPU enhancement: the deterministic SwiftShader capture keeps it
 *  OFF (postFx default false) because multi-pass post is slow/fragile in software. */
export function HeroComposer(): JSX.Element | null {
  const { state } = useLab()
  if (!((state.scene === 'E' || state.scene === 'F') && state.postFx)) return null
  return (
    <EffectComposer multisampling={4}>
      <N8AO halfRes color="#1a1206" aoRadius={1.4} intensity={2.4} distanceFalloff={1} quality="performance" />
      <Bloom luminanceThreshold={0.72} luminanceSmoothing={0.28} intensity={0.55} mipmapBlur levels={6} />
      <Vignette eskil={false} offset={0.28} darkness={0.5} />
      <SMAA />
    </EffectComposer>
  )
}
