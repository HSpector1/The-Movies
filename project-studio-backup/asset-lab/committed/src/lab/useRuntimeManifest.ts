import { useEffect, useState } from 'react'
import type { RuntimeManifest } from '../types'

// Loads the runtime catalog produced by `npm run manifest` (served from /runtime-assets.json).
export function useRuntimeManifest(): RuntimeManifest | null {
  const [m, setM] = useState<RuntimeManifest | null>(null)
  useEffect(() => {
    let alive = true
    fetch('/runtime-assets.json')
      .then((r) => r.json())
      .then((j) => { if (alive) setM(j as RuntimeManifest) })
      .catch((e) => console.error('failed to load runtime-assets.json', e))
    return () => { alive = false }
  }, [])
  return m
}
