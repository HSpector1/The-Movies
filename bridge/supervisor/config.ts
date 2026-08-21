import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export const STUDIO_PROFILE_ROOT_ENV = 'PROJECT_STUDIO_PROFILE_ROOT'
export const STUDIO_UNITY_EXECUTABLE_ENV = 'PROJECT_STUDIO_UNITY_EXECUTABLE'
export const STUDIO_UNITY_APP_ENV = 'PROJECT_STUDIO_UNITY_APP'
export const STUDIO_UNITY_PROJECT_ENV = 'PROJECT_STUDIO_UNITY_PROJECT'

export const DEFAULT_MAX_ENGINE_RESTARTS = 3
export const MAX_ENGINE_RESTARTS = 10

const MACOS_BUILD_RELATIVE_PATH = path.join(
  'Builds',
  'macOS',
  'Project Studio Visual Spike.app',
)

const PASSTHROUGH_ENVIRONMENT_KEYS = new Set([
  'HOME',
  'LANG',
  'LC_ALL',
  'LC_CTYPE',
  'LOGNAME',
  'PATH',
  'PATHEXT',
  'SHELL',
  'SYSTEMROOT',
  'TEMP',
  'TMP',
  'TMPDIR',
  'TZ',
  'USER',
  'USERPROFILE',
  'WINDIR',
  'XDG_CONFIG_HOME',
  'XDG_DATA_HOME',
  'XDG_STATE_HOME',
])

const CONTROLLED_UNITY_ARGUMENTS = [
  '-logfile',
  '-studiobridgecapability',
  '-studiobridgeport',
  '-studiobridgeruntimedir',
  '-studiobridgeurl',
] as const

export type StudioSupervisorOptions = {
  repositoryRoot: string
  profileRoot: string
  unityExecutable: string
  unityWorkingDirectory: string
  unityArguments: string[]
  maxEngineRestarts: number
}

export type StudioSupervisorArgumentResult =
  | { help: true }
  | { help: false; options: StudioSupervisorOptions }

type ParsedArguments = {
  profileRoot: string | null
  unityExecutable: string | null
  unityApp: string | null
  unityProject: string | null
  maxEngineRestarts: number | null
  unityArguments: string[]
  help: boolean
}

function requiredOptionValue(argv: readonly string[], index: number, option: string): string {
  const value = argv[index + 1]
  if (value === undefined || value.length === 0 || value.startsWith('--')) {
    throw new Error(`${option} requires a non-empty value.`)
  }
  return value
}

function setOnce(current: string | null, value: string, option: string): string {
  if (current !== null) throw new Error(`${option} may be specified only once.`)
  return value
}

function parseRestartCount(value: string): number {
  if (!/^\d+$/.test(value)) {
    throw new Error('--max-engine-restarts must be an integer from 0 to 10.')
  }
  const count = Number(value)
  if (!Number.isSafeInteger(count) || count < 0 || count > MAX_ENGINE_RESTARTS) {
    throw new Error('--max-engine-restarts must be an integer from 0 to 10.')
  }
  return count
}

function parseArguments(argv: readonly string[]): ParsedArguments {
  const parsed: ParsedArguments = {
    profileRoot: null,
    unityExecutable: null,
    unityApp: null,
    unityProject: null,
    maxEngineRestarts: null,
    unityArguments: [],
    help: false,
  }
  let index = 0
  for (; index < argv.length; index++) {
    const argument = argv[index]
    if (argument === '--') {
      parsed.unityArguments = argv.slice(index + 1)
      break
    }
    if (argument === '--help' || argument === '-h') {
      parsed.help = true
      continue
    }
    if (argument === '--profile-root') {
      parsed.profileRoot = setOnce(
        parsed.profileRoot,
        requiredOptionValue(argv, index, argument),
        argument,
      )
      index++
      continue
    }
    if (argument === '--unity-executable') {
      parsed.unityExecutable = setOnce(
        parsed.unityExecutable,
        requiredOptionValue(argv, index, argument),
        argument,
      )
      index++
      continue
    }
    if (argument === '--unity-app') {
      parsed.unityApp = setOnce(
        parsed.unityApp,
        requiredOptionValue(argv, index, argument),
        argument,
      )
      index++
      continue
    }
    if (argument === '--unity-project') {
      parsed.unityProject = setOnce(
        parsed.unityProject,
        requiredOptionValue(argv, index, argument),
        argument,
      )
      index++
      continue
    }
    if (argument === '--max-engine-restarts') {
      if (parsed.maxEngineRestarts !== null) {
        throw new Error('--max-engine-restarts may be specified only once.')
      }
      parsed.maxEngineRestarts = parseRestartCount(
        requiredOptionValue(argv, index, argument),
      )
      index++
      continue
    }
    throw new Error(`Unknown supervisor option: ${argument}`)
  }
  return parsed
}

function configuredEnvironmentValue(
  environment: NodeJS.ProcessEnv,
  name: string,
): string | null {
  const value = environment[name]
  if (value === undefined) return null
  const trimmed = value.trim()
  if (trimmed.length === 0) throw new Error(`${name} must not be blank.`)
  return trimmed
}

function defaultProfileRoot(environment: NodeJS.ProcessEnv): string {
  const home = configuredEnvironmentValue(environment, 'HOME') ?? os.homedir()
  if (home.length === 0) throw new Error('A home directory is required for the studio profile.')
  if (process.platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', 'Project Studio')
  }
  const stateHome = configuredEnvironmentValue(environment, 'XDG_STATE_HOME')
  return stateHome === null
    ? path.join(home, '.local', 'state', 'project-studio')
    : path.join(stateHome, 'project-studio')
}

function absolutePath(value: string, cwd: string): string {
  if (/[\0\r\n]/.test(value)) throw new Error('Configured paths must not contain control separators.')
  return path.resolve(cwd, value)
}

function platformCanonicalPath(filePath: string): string {
  if (process.platform !== 'darwin') return filePath
  for (const alias of ['/var', '/tmp', '/etc']) {
    if (filePath !== alias && !filePath.startsWith(`${alias}${path.sep}`)) continue
    return path.join(fs.realpathSync.native(alias), path.relative(alias, filePath))
  }
  return filePath
}

function assertDirectory(directoryPath: string, label: string): string {
  const stat = fs.lstatSync(directoryPath)
  if (stat.isSymbolicLink() || !stat.isDirectory()) {
    throw new Error(`${label} must be a real directory: ${directoryPath}`)
  }
  const canonical = fs.realpathSync.native(directoryPath)
  if (canonical !== platformCanonicalPath(directoryPath)) {
    throw new Error(`${label} must not traverse a symbolic link: ${directoryPath}`)
  }
  return canonical
}

function assertExecutable(filePath: string, label: string): string {
  const stat = fs.lstatSync(filePath)
  if (stat.isSymbolicLink() || !stat.isFile()) {
    throw new Error(`${label} must be a real regular file: ${filePath}`)
  }
  if ((stat.mode & 0o111) === 0) {
    throw new Error(`${label} is not executable: ${filePath}`)
  }
  const canonical = fs.realpathSync.native(filePath)
  if (canonical !== platformCanonicalPath(filePath)) {
    throw new Error(`${label} must not traverse a symbolic link: ${filePath}`)
  }
  return canonical
}

function executableFromApp(appPath: string): string {
  const canonicalApp = assertDirectory(appPath, 'Unity application bundle')
  if (!canonicalApp.endsWith('.app')) {
    throw new Error(`Unity application bundle must end in .app: ${canonicalApp}`)
  }
  const macosDirectory = path.join(canonicalApp, 'Contents', 'MacOS')
  assertDirectory(macosDirectory, 'Unity application executable directory')
  const infoPath = path.join(canonicalApp, 'Contents', 'Info.plist')
  const infoStat = fs.lstatSync(infoPath)
  if (infoStat.isSymbolicLink() || !infoStat.isFile() || infoStat.size > 1024 * 1024) {
    throw new Error(`Unity application bundle has an unsafe Info.plist: ${canonicalApp}`)
  }
  const info = fs.readFileSync(infoPath, 'utf8')
  const executableMatch = /<key>\s*CFBundleExecutable\s*<\/key>\s*<string>([^<]+)<\/string>/.exec(info)
  if (executableMatch === null) {
    throw new Error('Unity application Info.plist must declare CFBundleExecutable.')
  }
  const executableName = (executableMatch[1] as string)
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
  if (
    executableName.length === 0 ||
    executableName === '.' ||
    executableName === '..' ||
    executableName.includes('/') ||
    executableName.includes('\\') ||
    executableName.includes('\0')
  ) throw new Error('Unity application CFBundleExecutable is malformed.')
  return assertExecutable(
    path.join(macosDirectory, executableName),
    'Unity application executable',
  )
}

function executableFromProject(projectPath: string): string {
  const canonicalProject = assertDirectory(projectPath, 'Unity project')
  const settingsPath = path.join(canonicalProject, 'ProjectSettings', 'ProjectSettings.asset')
  const settings = fs.lstatSync(settingsPath)
  if (settings.isSymbolicLink() || !settings.isFile()) {
    throw new Error(`Unity project is missing ProjectSettings/ProjectSettings.asset: ${canonicalProject}`)
  }
  return executableFromApp(path.join(canonicalProject, MACOS_BUILD_RELATIVE_PATH))
}

function chooseUnitySource(
  parsed: ParsedArguments,
  environment: NodeJS.ProcessEnv,
): { kind: 'executable' | 'app' | 'project'; value: string } {
  const commandLineSources = [
    parsed.unityExecutable === null ? null : { kind: 'executable' as const, value: parsed.unityExecutable },
    parsed.unityApp === null ? null : { kind: 'app' as const, value: parsed.unityApp },
    parsed.unityProject === null ? null : { kind: 'project' as const, value: parsed.unityProject },
  ].filter((source) => source !== null)
  if (commandLineSources.length > 1) {
    throw new Error('Specify exactly one of --unity-executable, --unity-app, or --unity-project.')
  }
  if (commandLineSources.length === 1) return commandLineSources[0] as NonNullable<typeof commandLineSources[0]>

  const environmentSources = [
    configuredEnvironmentValue(environment, STUDIO_UNITY_EXECUTABLE_ENV) === null
      ? null
      : { kind: 'executable' as const, value: configuredEnvironmentValue(environment, STUDIO_UNITY_EXECUTABLE_ENV) as string },
    configuredEnvironmentValue(environment, STUDIO_UNITY_APP_ENV) === null
      ? null
      : { kind: 'app' as const, value: configuredEnvironmentValue(environment, STUDIO_UNITY_APP_ENV) as string },
    configuredEnvironmentValue(environment, STUDIO_UNITY_PROJECT_ENV) === null
      ? null
      : { kind: 'project' as const, value: configuredEnvironmentValue(environment, STUDIO_UNITY_PROJECT_ENV) as string },
  ].filter((source) => source !== null)
  if (environmentSources.length !== 1) {
    throw new Error(
      `Configure exactly one of ${STUDIO_UNITY_EXECUTABLE_ENV}, ${STUDIO_UNITY_APP_ENV}, or ${STUDIO_UNITY_PROJECT_ENV}.`,
    )
  }
  return environmentSources[0] as NonNullable<typeof environmentSources[0]>
}

export function assertSafeUnityArguments(arguments_: readonly string[]): string[] {
  for (const argument of arguments_) {
    if (argument.includes('\0')) throw new Error('Unity arguments must not contain NUL bytes.')
    const normalized = argument.toLowerCase().replace(/^-+/, '-')
    if (
      CONTROLLED_UNITY_ARGUMENTS.some((controlled) =>
        normalized === controlled || normalized.startsWith(`${controlled}=`),
      )
    ) {
      throw new Error(`Unity argument ${argument} is owned by the studio supervisor.`)
    }
  }
  return [...arguments_]
}

export function createMinimalChildEnvironment(
  inherited: NodeJS.ProcessEnv,
  additions: Readonly<Record<string, string>>,
): NodeJS.ProcessEnv {
  const environment: NodeJS.ProcessEnv = {}
  for (const [name, value] of Object.entries(inherited)) {
    if (value !== undefined && PASSTHROUGH_ENVIRONMENT_KEYS.has(name.toUpperCase())) {
      environment[name] = value
    }
  }
  for (const [name, value] of Object.entries(additions)) environment[name] = value
  return environment
}

export function studioSupervisorUsage(): string {
  return [
    'Usage: npm run studio -- [supervisor options] [-- Unity arguments]',
    '',
    'Supervisor options:',
    '  --profile-root PATH          Stable private save/runtime profile',
    '  --unity-executable PATH      Native Unity player executable',
    '  --unity-app PATH             macOS .app bundle containing one executable',
    '  --unity-project PATH         Unity project with the standard native build',
    '  --max-engine-restarts N      Restart budget from 0 through 10 (default 3)',
    '  --help                       Print this help',
    '',
    'Equivalent path environment variables are PROJECT_STUDIO_PROFILE_ROOT and',
    'exactly one of PROJECT_STUDIO_UNITY_EXECUTABLE, PROJECT_STUDIO_UNITY_APP,',
    'or PROJECT_STUDIO_UNITY_PROJECT. Bridge URL/capability/log options are owned',
    'by the supervisor and are rejected from Unity arguments.',
  ].join('\n')
}

export function parseStudioSupervisorArguments(
  argv: readonly string[],
  environment: NodeJS.ProcessEnv = process.env,
  cwd: string = process.cwd(),
): StudioSupervisorArgumentResult {
  const parsed = parseArguments(argv)
  if (parsed.help) return { help: true }

  const repositoryRoot = fs.realpathSync.native(cwd)
  const profileConfigured = parsed.profileRoot ??
    configuredEnvironmentValue(environment, STUDIO_PROFILE_ROOT_ENV) ??
    defaultProfileRoot(environment)
  const source = chooseUnitySource(parsed, environment)
  const sourcePath = absolutePath(source.value, cwd)
  const unityExecutable = source.kind === 'executable'
    ? assertExecutable(sourcePath, 'Unity executable')
    : source.kind === 'app'
      ? executableFromApp(sourcePath)
      : executableFromProject(sourcePath)

  return {
    help: false,
    options: {
      repositoryRoot,
      profileRoot: absolutePath(profileConfigured, cwd),
      unityExecutable,
      unityWorkingDirectory: source.kind === 'project'
        ? fs.realpathSync.native(sourcePath)
        : source.kind === 'app'
          ? path.dirname(fs.realpathSync.native(sourcePath))
          : path.dirname(unityExecutable),
      unityArguments: assertSafeUnityArguments(parsed.unityArguments),
      maxEngineRestarts: parsed.maxEngineRestarts ?? DEFAULT_MAX_ENGINE_RESTARTS,
    },
  }
}
