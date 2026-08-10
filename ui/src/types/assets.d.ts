// ── Static asset imports ──────────────────────────────────────────────────────
// Vite resolves `import url from './thing.png'` to the emitted (fingerprinted) URL
// string. This declaration is the TypeScript half of that; it is deliberately narrow
// rather than pulling in the whole `vite/client` type surface, because the lot's flag
// helpers already hand-type `import.meta.env` and `vite/client` would redeclare it.
//
// Introduced by the Fable Authored Environment Spike (Lane D): before it, the lot had
// no asset-loading path of any kind — every texture was generated at runtime.

declare module '*.png' {
  const src: string
  export default src
}
