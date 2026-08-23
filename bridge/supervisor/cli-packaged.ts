import { emittedEngineEntryFromModuleUrl } from './config.ts'
import { studioSupervisorMain } from './cli-main.ts'

// Packaged entry: bundled to dist/studio/studio.mjs, it supervises the
// emitted sibling engine bundle and never touches the development loader.
await studioSupervisorMain(emittedEngineEntryFromModuleUrl(import.meta.url))
