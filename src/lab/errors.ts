// Lightweight console-error / window-error tracker for the owner review status panel (Lab 05E).
// Diagnostic only. Records a count + the last message so the review panel can show an honest
// "console-error status" without needing the headless capture tool.
let errorCount = 0
let lastError = ''
let installed = false

export function installErrorTracker(): void {
  if (installed || typeof window === 'undefined') return
  installed = true
  const origError = console.error.bind(console)
  console.error = (...args: unknown[]) => {
    errorCount++
    lastError = args.map((a) => (a instanceof Error ? a.message : String(a))).join(' ').slice(0, 200)
    origError(...args)
  }
  window.addEventListener('error', (e) => { errorCount++; lastError = String(e.message).slice(0, 200) })
  window.addEventListener('unhandledrejection', (e) => { errorCount++; lastError = 'unhandledrejection: ' + String((e as PromiseRejectionEvent).reason).slice(0, 180) })
}

export function getErrorCount(): number { return errorCount }
export function getLastError(): string { return lastError }
