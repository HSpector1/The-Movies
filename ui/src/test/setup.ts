// Vitest jsdom setup for the UI project: register @testing-library/jest-dom
// matchers (toBeInTheDocument, toHaveTextContent, …) on expect.
import '@testing-library/jest-dom/vitest'
import { beforeEach } from 'vitest'

// Newer Node releases may expose an unusable experimental `localStorage` global
// unless the process was given a backing file. Even probing that getter emits a
// process warning, so UI tests install their deterministic browser-storage
// boundary directly instead of touching the host implementation first.
const storageValues = new Map<string, string>()
const memoryStorage: Storage = {
  get length() { return storageValues.size },
  clear: () => storageValues.clear(),
  getItem: (key) => storageValues.get(String(key)) ?? null,
  key: (index) => [...storageValues.keys()][index] ?? null,
  removeItem: (key) => { storageValues.delete(String(key)) },
  setItem: (key, value) => { storageValues.set(String(key), String(value)) },
}
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: memoryStorage,
})

// D-12 session recovery: the app now autosaves the active session to localStorage, so any test that
// renders <App> more than once (or after another test) would otherwise RESTORE a prior session instead
// of starting fresh. Clear browser storage before every test — this restores the pre-persistence
// default (fresh mount ⇒ Start screen); a test that wants a recovered session seeds it explicitly.
beforeEach(() => {
  try {
    localStorage.clear()
  } catch {
    /* storage unavailable — nothing to clear */
  }
})

// jsdom has no Web Audio at all, and ~80 UI test files mount components that can reach
// the audio service through an ordinary click. The service's sink already treats a missing
// implementation as permanent silence; this inert stub is the SECOND belt, so a test that
// exercises a real interaction path can never explode on a browser API jsdom does not have.
// It records nothing and produces nothing: audio behaviour is asserted through RecordingSink,
// never here. (Same precedent as the storage boundary above: install the deterministic
// boundary rather than depend on the host implementation.)
class InertAudioContext {
  readonly state = 'running'
  readonly currentTime = 0
  readonly destination = { connect: () => {}, disconnect: () => {} }
  createGain() {
    return { gain: { value: 1 }, connect: () => {}, disconnect: () => {} }
  }
  createBufferSource() {
    return {
      buffer: null,
      loop: false,
      onended: null,
      connect: () => {},
      disconnect: () => {},
      start: () => {},
      stop: () => {},
    }
  }
  decodeAudioData() {
    return Promise.reject(new Error('jsdom has no audio decoder')) // the sink catches this
  }
  resume() {
    return Promise.resolve()
  }
  close() {
    return Promise.resolve()
  }
}
Object.defineProperty(globalThis, 'AudioContext', {
  configurable: true,
  writable: true,
  value: InertAudioContext,
})

// jsdom has no layout engine, so window.scrollTo is "not implemented" and logs noisily
// whenever a component resets scroll on a transition (Assembly A2). Stub it as a no-op —
// the accessible signal the UI actually relies on (focusing the new step heading) is fully
// exercised in jsdom; only the visual scroll is inapplicable here.
window.scrollTo = (() => {}) as typeof window.scrollTo
