import { useSyncExternalStore } from 'react'
import { subscribe, getVersion } from './store'

/** Re-render the calling component whenever the store bumps its version. */
export function useStoreTick(): number {
  return useSyncExternalStore(subscribe, getVersion, getVersion)
}
