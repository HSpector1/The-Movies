// Vitest jsdom setup for the UI project: register @testing-library/jest-dom
// matchers (toBeInTheDocument, toHaveTextContent, …) on expect.
import '@testing-library/jest-dom/vitest'

// jsdom has no layout engine, so window.scrollTo is "not implemented" and logs noisily
// whenever a component resets scroll on a transition (Assembly A2). Stub it as a no-op —
// the accessible signal the UI actually relies on (focusing the new step heading) is fully
// exercised in jsdom; only the visual scroll is inapplicable here.
window.scrollTo = (() => {}) as typeof window.scrollTo
