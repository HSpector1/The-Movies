#!/usr/bin/env node
// Read-only dependency identity check. This script never installs packages.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

function requireOk(ok, message) { if (!ok) throw new Error(message) }
const [mirror, production, expectedLockSha] = process.argv.slice(2)
requireOk(mirror && production && /^[0-9a-f]{64}$/.test(expectedLockSha || ''), 'missing exact dependency pins')
const lockPath = path.join(mirror, 'package-lock.json')
const lockRaw = fs.readFileSync(lockPath)
requireOk(crypto.createHash('sha256').update(lockRaw).digest('hex') === expectedLockSha, 'lockfile SHA mismatch')
const manifest = JSON.parse(fs.readFileSync(path.join(mirror, 'package.json'), 'utf8'))
const lock = JSON.parse(lockRaw.toString('utf8'))
const link = path.join(mirror, 'node_modules')
requireOk(fs.lstatSync(link).isSymbolicLink(), 'mirror node_modules is not a link')
requireOk(fs.realpathSync(link) === fs.realpathSync(path.join(production, 'node_modules')), 'wrong installed dependency tree')
const names = [...new Set([...Object.keys(manifest.dependencies || {}), ...Object.keys(manifest.devDependencies || {})])].sort()
const observed = []
for (const name of names) {
  const lockRow = lock.packages?.[`node_modules/${name}`]
  requireOk(lockRow && typeof lockRow.version === 'string', `missing lock version ${name}`)
  const actual = JSON.parse(fs.readFileSync(path.join(link, name, 'package.json'), 'utf8'))
  requireOk(actual.name === name && actual.version === lockRow.version, `installed version mismatch ${name}`)
  observed.push({name, version: actual.version})
}
requireOk(observed.some(x => x.name === 'typescript') && observed.some(x => x.name === 'vitest'), 'compiler/test runner missing')
process.stdout.write(JSON.stringify({status:'DEPENDENCY_VERSIONS_MATCH_LOCK', lockSha256:expectedLockSha, packageCount:observed.length, packages:observed}) + '\n')
