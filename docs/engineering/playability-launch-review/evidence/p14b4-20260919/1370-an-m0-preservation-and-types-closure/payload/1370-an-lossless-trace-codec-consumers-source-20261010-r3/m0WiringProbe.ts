// Test derivative only. Default behavior leaves the accepted observer enabled.
// No GameState writes, no RNG, no globals monkey-patching, no gameplay stubs.
import type { GameState } from './types.js'
import {createTraceStore} from './m0TraceCodec.mjs'
type Fault = 'row-cap' | 'row-byte-cap' | 'total-byte-cap' | 'serialization' | 'ordinary-refusal'
let active = false, enabled = true, fault: Fault | null = null
let store=createTraceStore(),acceptedCalls=0
let boundary: ((state: GameState) => void) | null = null
let faultReached: { kind: Fault; phase: string } | null = null
export const m0WiringProbe = Object.freeze({
  captureEnabled: (): boolean => enabled,
  call(name: string, detail: unknown = null): void {
    if (!active) return
    if(store.appendCall({sequence:acceptedCalls,name,detail}))acceptedCalls++
  },
  evaluation(inputs: readonly unknown[], canonicalInputs: string, result: unknown, context: unknown): void {
    if (!active) return
    store.appendEvaluation({inputs,canonicalInputs,result,context})
  },
  beforeAdvance(state: GameState): void { boundary?.(state) },
  setBoundaryConsumer(value: ((state: GameState) => void) | null): void { boundary=value },
  begin(capture: boolean, requestedFault: Fault | null = null): void {
    store=createTraceStore();acceptedCalls=0;active=true;enabled=capture;fault=requestedFault;faultReached=null
  },
  consumeFault(phase: string): Fault | null {
    if (!active || fault === null || (fault === 'ordinary-refusal' ? phase !== 'submitProposal' : phase !== 'draftPrice')) return null
    const kind=fault;fault=null;faultReached={kind,phase};return kind
  },
  end() {
    active=false;enabled=true;fault=null
    const trace=store.snapshot()
    return Object.freeze({...trace,faultReached,bytes:trace.encodedBytes})
  },
})
