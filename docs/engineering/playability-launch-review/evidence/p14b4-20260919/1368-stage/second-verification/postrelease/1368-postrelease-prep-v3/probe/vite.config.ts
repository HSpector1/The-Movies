import { defineConfig, type UserConfig } from '../tree/node_modules/vite/dist/node/index.js'
const config: UserConfig = defineConfig({ root: new URL('../tree/', import.meta.url).pathname })
export default config
