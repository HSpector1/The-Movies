import { defineConfig } from '../tree/node_modules/vite/dist/node/index.js'
export default defineConfig({ root: new URL('../tree/', import.meta.url).pathname })
