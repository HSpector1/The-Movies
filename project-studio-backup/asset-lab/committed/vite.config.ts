import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Isolated Asset Lab dev/preview server. Fixed port so the capture tool (tools/capture.mjs)
// can attach deterministically. Runtime asset binaries are served statically from public/assets.
export default defineConfig({
  plugins: [react()],
  server: { port: 4320, strictPort: true },
  preview: { port: 4320, strictPort: true },
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.fbx', '**/*.hdr'],
})
