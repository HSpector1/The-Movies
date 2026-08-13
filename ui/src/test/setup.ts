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

// jsdom has no layout engine, so window.scrollTo is "not implemented" and logs noisily
// whenever a component resets scroll on a transition (Assembly A2). Stub it as a no-op —
// the accessible signal the UI actually relies on (focusing the new step heading) is fully
// exercised in jsdom; only the visual scroll is inapplicable here.
window.scrollTo = (() => {}) as typeof window.scrollTo
