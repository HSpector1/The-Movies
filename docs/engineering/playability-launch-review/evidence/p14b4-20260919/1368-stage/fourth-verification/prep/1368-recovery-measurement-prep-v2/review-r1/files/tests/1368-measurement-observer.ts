/** Scratch observation only. Never exposes live references to the consumer. */
export type Observation = { kind: string; facts: Record<string, unknown> }
let sink: ((row: Observation) => void) | null = null
export function setMeasurementSink(next: typeof sink): void { sink = next }
export function observe1368(kind: string, facts: () => Record<string, unknown>): void {
  if (sink !== null) sink({ kind, facts: JSON.parse(JSON.stringify(facts())) as Record<string, unknown> })
}
