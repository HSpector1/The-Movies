// Drive Blender headless from an npm script (the Blender binary path has spaces, so we spawn
// it directly rather than shelling out). Usage:
//   node tools/blender-run.mjs blender/build_all.py -- --only characters
// Override the binary with BLENDER=/path/to/Blender.
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'

const BLENDER = process.env.BLENDER || '/Applications/Blender.app/Contents/MacOS/Blender'
if (!existsSync(BLENDER)) {
  console.error(`Blender not found at ${BLENDER}. Set BLENDER=/path/to/Blender.`)
  process.exit(2)
}
const script = process.argv[2]
if (!script) {
  console.error('usage: node tools/blender-run.mjs <script.py> [-- <passthrough args>]')
  process.exit(2)
}
const rest = process.argv.slice(3).filter((a) => a !== '--')
const args = ['--background', '--factory-startup', '--python', script, '--', ...rest]
const p = spawn(BLENDER, args, { stdio: 'inherit' })
p.on('exit', (code) => process.exit(code ?? 0))
