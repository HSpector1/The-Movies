import { defineConfig } from 'vite'

// Self-contained spike. Rooted at lot-spike/, no path aliases reaching into the
// simulation core, no dev-server fs allowance beyond this folder. The spike must
// never import ../src/core/* — the boundary is StudioLotSnapshot (a plain type).
export default defineConfig({
  base: './',
  server: {
    port: 4316,
    strictPort: true,
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
  },
})
