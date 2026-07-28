import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Standalone isolated spike. No path aliases into any protected repo; no dev-server
// fs allowance beyond this project.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 4318, strictPort: true },
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    // M1 slice (index.html) + M2 asset survey (m2.html) + M3 scale reference
    // (m3-scale.html) as separate pages
    rollupOptions: { input: { main: 'index.html', m2: 'm2.html', 'm3-scale': 'm3-scale.html' } },
  },
})
