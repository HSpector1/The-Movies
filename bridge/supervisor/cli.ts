import {
  parseStudioSupervisorArguments,
  studioSupervisorUsage,
} from './config.ts'
import { runStudioSupervisor } from './supervisor.ts'

const abortController = new AbortController()
let asynchronousFatal: unknown = null

// Vite's development server installs an eager SIGTERM exit hook before this
// script executes. The supervisor must own termination until both children and
// its durable lease are clean; vite-node closes normally after this module returns.
for (const listener of process.rawListeners('SIGTERM')) {
  process.removeListener('SIGTERM', listener as NodeJS.SignalsListener)
}

const requestShutdown = (reason: NodeJS.Signals | Error): void => {
  if (!abortController.signal.aborted) abortController.abort(reason)
}
const onSigint = (): void => requestShutdown('SIGINT')
const onSigterm = (): void => requestShutdown('SIGTERM')
const onSighup = (): void => requestShutdown('SIGHUP')
const onUncaughtException = (error: Error): void => {
  asynchronousFatal ??= error
  requestShutdown(error)
}
const onUnhandledRejection = (reason: unknown): void => {
  asynchronousFatal ??= reason
  requestShutdown(reason instanceof Error ? reason : new Error(String(reason)))
}

process.once('SIGINT', onSigint)
process.once('SIGTERM', onSigterm)
process.once('SIGHUP', onSighup)
process.once('uncaughtException', onUncaughtException)
process.once('unhandledRejection', onUnhandledRejection)

try {
  const parsed = parseStudioSupervisorArguments(process.argv.slice(2))
  if (parsed.help) {
    process.stdout.write(`${studioSupervisorUsage()}\n`)
  } else {
    const exitCode = await runStudioSupervisor(parsed.options, abortController.signal)
    if (asynchronousFatal !== null) throw asynchronousFatal
    process.exitCode = exitCode
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`[supervisor] failed: ${message}\n`)
  process.exitCode = 1
} finally {
  process.off('SIGINT', onSigint)
  process.off('SIGTERM', onSigterm)
  process.off('SIGHUP', onSighup)
  process.off('uncaughtException', onUncaughtException)
  process.off('unhandledRejection', onUnhandledRejection)
}
