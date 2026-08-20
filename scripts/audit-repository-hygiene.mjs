import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { extname } from 'node:path'

const repositoryFiles = execFileSync(
  'git',
  ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
  {
    encoding: 'utf8',
  },
).split('\0').filter(Boolean)

const allowedCredentialExamples = new Set(['.env.example', '.env.sample'])
const generatedPaths = [
  /^(?:Evidence|Builds|Library|Logs|Temp)\//,
  /(?:^|\/)(?:node_modules|dist|coverage|out|test-results|playwright-report)\//,
  /^ui\/e2e\/fixtures\//,
  /^\.tmp\/3d-asset-audit\.json$/,
]
const credentialPaths = [
  /(?:^|\/)\.env(?:\.|$)/,
  /(?:^|\/)(?:\.envrc|\.netrc|\.npmrc)$/,
  /(?:^|\/)(?:id_rsa|id_ed25519)$/,
  /\.(?:pem|key|p12|pfx|jks|keystore)$/i,
  /(?:^|\/)(?:credentials|service-account)(?:\.[^/]*)?\.json$/i,
]
const textExtensions = new Set([
  '', '.bat', '.cjs', '.cmd', '.conf', '.cs', '.css', '.gitignore', '.gradle',
  '.html', '.ini', '.java', '.js', '.json', '.kt', '.md', '.mjs', '.mts',
  '.properties', '.ps1', '.py', '.rb', '.scss', '.sh', '.svg', '.toml', '.ts',
  '.tsx', '.txt', '.xml', '.yaml', '.yml', '.zsh',
])
const secretMarkers = [
  {
    label: 'private-key marker',
    pattern: new RegExp(['-----BEGIN', '(?: RSA| EC| OPENSSH)? PRIVATE KEY-----'].join('')),
  },
  { label: 'GitHub token', pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{36,255}|github_pat_[A-Za-z0-9_]{50,255})\b/ },
  { label: 'npm access token', pattern: /\bnpm_[A-Za-z0-9]{36,255}\b/ },
  { label: 'AWS access key', pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/ },
]

const violations = []

function isSecretLikePath(file) {
  const basename = file.slice(file.lastIndexOf('/') + 1)
  return !allowedCredentialExamples.has(basename) && credentialPaths.some((pattern) => pattern.test(file))
}

function matchedMarkers(contents) {
  return secretMarkers.filter((marker) => marker.pattern.test(contents))
}

function shouldScanContent(file) {
  const basename = file.slice(file.lastIndexOf('/') + 1)
  return allowedCredentialExamples.has(basename) || textExtensions.has(extname(file).toLowerCase())
}

function assertGuardsDetectKnownRisks() {
  const npmToken = `npm_${'A'.repeat(36)}`
  const privateKey = ['-----BEGIN', ' PRIVATE KEY-----'].join('')
  if (
    !isSecretLikePath('.npmrc') ||
    !isSecretLikePath('config/.envrc') ||
    isSecretLikePath('.env.example') ||
    !generatedPaths.some((pattern) => pattern.test('node_modules/example/index.js')) ||
    !shouldScanContent('.env.example') ||
    matchedMarkers(npmToken).every((marker) => marker.label !== 'npm access token') ||
    matchedMarkers(privateKey).every((marker) => marker.label !== 'private-key marker')
  ) {
    throw new Error('Repository hygiene guard self-test failed.')
  }
}

assertGuardsDetectKnownRisks()

for (const file of repositoryFiles) {
  if (generatedPaths.some((pattern) => pattern.test(file))) {
    violations.push(`${file}: generated local-output root`)
    continue
  }
  if (isSecretLikePath(file)) {
    violations.push(`${file}: secret-like tracked filename`)
    continue
  }
  if (!shouldScanContent(file)) continue

  const contents = readFileSync(file, 'utf8')
  for (const marker of matchedMarkers(contents)) {
    violations.push(`${file}: ${marker.label}`)
  }
}

if (violations.length > 0) {
  console.error('Repository hygiene audit failed:')
  for (const violation of violations) console.error(`- ${violation}`)
  process.exitCode = 1
} else {
  console.log(`Repository hygiene audit passed: ${repositoryFiles.length} repository files checked.`)
}
