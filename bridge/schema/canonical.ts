import { createHash } from 'node:crypto'

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (typeof value !== 'object' || value === null) return value
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
      .map(([key, entry]) => [key, canonicalize(entry)]),
  )
}

/** RFC 8785-style ordering for the JSON-only schema vocabulary used by the bridge. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value))
}

export function canonicalJsonPretty(value: unknown): string {
  return `${JSON.stringify(canonicalize(value), null, 2)}\n`
}

export function schemaIdentity(value: unknown): string {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`
}
