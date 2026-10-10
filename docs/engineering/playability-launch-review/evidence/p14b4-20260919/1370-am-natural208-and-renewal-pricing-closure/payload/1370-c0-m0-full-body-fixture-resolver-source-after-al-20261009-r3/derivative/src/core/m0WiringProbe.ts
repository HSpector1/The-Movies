// Test derivative only. Default behavior leaves the accepted observer enabled.
// No GameState writes, no RNG, no globals monkey-patching, no gameplay stubs.
import type { GameState } from './types.js'
type Fault = 'row-cap' | 'row-byte-cap' | 'total-byte-cap' | 'serialization' | 'ordinary-refusal'
type Call = { sequence: number; name: string; detail: unknown }
type Evaluation = { inputs: unknown; canonicalInputs: string; result: unknown; context: unknown }
let active = false, enabled = true, overflow = false, fault: Fault | null = null
let calls: Call[] = [], evaluations: Evaluation[] = [], bytes = 0
let boundary: ((state: GameState) => void) | null = null
let faultReached: { kind: Fault; phase: string } | null = null
const MAX_ENTRIES=16384, MAX_ROW_BYTES=64*1024, MAX_TOTAL_BYTES=2*1024*1024
function bounded(value: unknown): unknown | undefined {
  if (overflow) return undefined
  const raw = JSON.stringify(value)
  const n = new TextEncoder().encode(raw + '\n').length
  if (calls.length + evaluations.length >= MAX_ENTRIES || n > MAX_ROW_BYTES || bytes + n > MAX_TOTAL_BYTES) {
    overflow = true; return undefined
  }
  bytes += n; return JSON.parse(raw) as unknown
}
export const m0WiringProbe = Object.freeze({
  captureEnabled: (): boolean => enabled,
  call(name: string, detail: unknown = null): void {
    if (!active) return
    const row=bounded({ sequence:calls.length,name,detail })
    if (row !== undefined) calls.push(row as Call)
  },
  evaluation(inputs: readonly unknown[], canonicalInputs: string, result: unknown, context: unknown): void {
    if (!active) return
    const row=bounded({inputs,canonicalInputs,result,context})
    if (row !== undefined) evaluations.push(row as Evaluation)
  },
  beforeAdvance(state: GameState): void { boundary?.(state) },
  setBoundaryConsumer(value: ((state: GameState) => void) | null): void { boundary=value },
  begin(capture: boolean, requestedFault: Fault | null = null): void {
    active=true;enabled=capture;overflow=false;calls=[];evaluations=[];bytes=0;fault=requestedFault;faultReached=null
  },
  consumeFault(phase: string): Fault | null {
    if (!active || fault === null || (fault === 'ordinary-refusal' ? phase !== 'submitProposal' : phase !== 'draftPrice')) return null
    const kind=fault;fault=null;faultReached={kind,phase};return kind
  },
  end() {
    active=false;enabled=true;fault=null
    return {calls,evaluations,overflow,faultReached,bytes}
  },
})
