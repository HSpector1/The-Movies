import {NATIVE_ROW_SCHEMA} from './m0NativeObserverRows.mjs'
// Scratch evidence only. The original sink remains the acceptance authority.
const SCHEMA = '1370-m0-observer-row-diagnostic/v1'
const MESSAGE = 'M0 feasibility row byte bound exceeded'
const bytes = text => new TextEncoder().encode(text).length
const identity = (context, kind) => JSON.stringify([context.week, context.caseKey,
  context.caseOccurrence, context.proposalKey, context.proposalOccurrence, context.phase,
  context.candidateOrdinal ?? null, context.submittedOrdinal ?? null,
  context.survivorOrdinal ?? null, kind])
const sameContext = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const CONTEXT_KEYS = new Set(['era','week','caseKey','caseOccurrence','caseSourceIndex',
  'subject','issuer','proposalKey','proposalOccurrence','proposalSourceIndex','phase',
  'candidateOrdinal','submittedOrdinal','survivorOrdinal'])
const fail = code => { const error = new Error(code); error.diagnosticCode = code; throw error }
// Diagnostic-only refusal ceilings; none replace an original observer predicate.
function utf8LengthBounded(text, limit) {
  if (text.length > limit) return null
  let length = 0
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i)
    if (c < 128) length++
    else if (c < 2048) length += 2
    else if (c >= 0xd800 && c <= 0xdbff && i + 1 < text.length &&
      text.charCodeAt(i + 1) >= 0xdc00 && text.charCodeAt(i + 1) <= 0xdfff) { length += 4; i++ }
    else length += 3
    if (length > limit) return null
  }
  return length
}
function safeJSONBytes(value, limit, unsupported = 'FAILED_ROW_UNSUPPORTED', over = 'FAILED_ROW_OVER_BOUND') {
  let total = 0, nodes = 0
  const ancestors = new Set()
  const add = n => { total += n; if (total > limit) fail(over) }
  function visit(v, depth) {
    if (++nodes > 16384 || depth > 64) fail(over)
    if (v === null) { add(4); return }
    if (typeof v === 'string') {
      // Prevent an unbounded stringify/TextEncoder allocation before checking.
      if (v.length > 65536) fail(over)
      add(2)
      for (let i = 0; i < v.length; i++) {
        const c = v.charCodeAt(i)
        if (c === 34 || c === 92 || [8,9,10,12,13].includes(c)) add(2)
        else if (c < 32) add(6)
        else if (c < 128) add(1)
        else if (c < 2048) add(2)
        else if (c >= 0xd800 && c <= 0xdbff && i + 1 < v.length &&
          v.charCodeAt(i + 1) >= 0xdc00 && v.charCodeAt(i + 1) <= 0xdfff) { add(4); i++ }
        else if (c >= 0xd800 && c <= 0xdfff) add(6)
        else add(3)
      }
      return
    }
    if (typeof v === 'number' || typeof v === 'boolean') { add(JSON.stringify(v).length); return }
    if (typeof v !== 'object') fail(unsupported)
    const proto = Object.getPrototypeOf(v)
    if (proto !== Object.prototype && proto !== Array.prototype && proto !== null) fail(unsupported)
    if (ancestors.has(v)) fail(unsupported)
    if (Object.getOwnPropertyDescriptor(v, 'toJSON') ||
      (proto && Object.getOwnPropertyDescriptor(proto, 'toJSON'))) fail(unsupported)
    ancestors.add(v)
    if (Array.isArray(v)) {
      if (v.length > 16384) fail(over)
      add(2)
      for (let i = 0; i < v.length; i++) {
        if (++nodes > 16384) fail(over)
        if (i) add(1)
        const d = Object.getOwnPropertyDescriptor(v, String(i))
        if (d && !Object.hasOwn(d, 'value')) fail(unsupported)
        if (!d || d.value === undefined) add(4)
        else visit(d.value, depth + 1)
      }
    } else {
      add(2); let first = true
      for (const key in v) {
        if (!Object.hasOwn(v, key)) continue
        if (++nodes > 16384) fail(over)
        const d = Object.getOwnPropertyDescriptor(v, key)
        if (!d || !Object.hasOwn(d, 'value')) fail(unsupported)
        if (d.value === undefined) continue
        if (!first) add(1); first = false
        visit(key, depth + 1); add(1); visit(d.value, depth + 1)
      }
    }
    ancestors.delete(v)
  }
  visit(value, 0)
  return total
}
function preflightContext(context) {
  if (!context || typeof context !== 'object' || Array.isArray(context)) fail('CONTEXT_UNSUPPORTED')
  for (const key in context) {
    if (!Object.hasOwn(context, key)) continue
    const d = Object.getOwnPropertyDescriptor(context, key)
    if (!CONTEXT_KEYS.has(key) || !d || !Object.hasOwn(d, 'value') ||
      !['string','number'].includes(typeof d.value)) fail('CONTEXT_UNSUPPORTED')
  }
  return safeJSONBytes(context, 65536, 'CONTEXT_UNSUPPORTED', 'CONTEXT_OVER_BOUND')
}
function preflightCanonical(detail) {
  if (!detail || typeof detail !== 'object') return
  const d = Object.getOwnPropertyDescriptor(detail, 'canonicalInputs')
  if (d && !Object.hasOwn(d, 'value')) fail('FAILED_ROW_UNSUPPORTED')
  if (d && typeof d.value === 'string' && utf8LengthBounded(d.value, 65536) === null) fail('CANONICAL_INPUT_OVER_BOUND')
}
function familyEvidence(kind, detail, context, rows, codec) {
  let input = kind === 'inputTuple' ? detail : null
  if (kind === 'assessment') {
    for (let i = rows.length - 1; i >= 0; i--) {
      if (rows[i].kind === 'inputTuple' && sameContext(rows[i].context, context)) {
        input = codec.decodeInputDetailForDiagnostic(rows[i].detail); break
      }
    }
  }
  const missing = reason => ({family: null, familyUnavailableReason: reason,
    canonicalInputBytes: null, canonicalInputUnavailableReason: reason})
  if (!input || typeof input.canonicalInputs !== 'string') return missing('CANONICAL_INPUT_MISSING')
  const length = bytes(input.canonicalInputs)
  if (length > 65536) return missing('CANONICAL_INPUT_OVER_BOUND')
  if (!Number.isInteger(input.inputBytes) || input.inputBytes !== length) return missing('CANONICAL_INPUT_BYTE_MISMATCH')
  let parsed
  try { parsed = JSON.parse(input.canonicalInputs) } catch {
    return {family: null, familyUnavailableReason: 'CANONICAL_INPUT_MALFORMED',
      canonicalInputBytes: length, canonicalInputUnavailableReason: null}
  }
  return {family: Array.isArray(parsed) && typeof parsed[0] === 'string' ? parsed[0] : null,
    familyUnavailableReason: Array.isArray(parsed) && typeof parsed[0] === 'string' ? null : 'FAMILY_UNAVAILABLE',
    canonicalInputBytes: length, canonicalInputUnavailableReason: null}
}
export function createObserverRowDiagnostic({codec,latch}) {
  let failed = null, line = null, emitted = false
  const fallback = reason => JSON.stringify({schema: SCHEMA, predicate: 'ROW_BYTE_CAP',
    availability: 'unavailable', reason, rowLimit: 16384,
    error: {name: 'Error', message: MESSAGE}}) + '\n'
  function retain(error, capture, rowsProvider, kind, detail) {
    failed = error // Sticky BEFORE any diagnostic operation that can throw.
    line = fallback('DIAGNOSTIC_UNAVAILABLE')
    try {
      const rows = rowsProvider()
      if (!Array.isArray(rows) || rows.length > 512) {
        line = fallback('PRIOR_ROWS_UNAVAILABLE'); return
      }
      let priorBytes = 0
      for (let i = 0; i < rows.length; i++) {
        const d = Object.getOwnPropertyDescriptor(rows, String(i))
        if (!d || !Object.hasOwn(d, 'value')) fail('PRIOR_ROWS_UNAVAILABLE')
        priorBytes += safeJSONBytes(d.value, 16383, 'PRIOR_ROWS_UNAVAILABLE', 'PRIOR_ROWS_UNAVAILABLE') + 1
        if (priorBytes > 2097152) fail('PRIOR_ROWS_UNAVAILABLE')
      }
      const context = capture.context
      const contextBytes = preflightContext(context)
      if (kind !== 'inputTuple' && kind !== 'assessment') fail('FAILED_ROW_UNSUPPORTED')
      preflightCanonical(detail)
      const physicalDetail = kind === 'inputTuple' ? codec.encodeInputDetailForDiagnostic(detail) : detail
      const detailBytes = safeJSONBytes(physicalDetail, 524288)
      const key = identity(context, kind)
      let occurrence = 0
      for (let i = 0; i < rows.length; i++) if (identity(rows[i].context, rows[i].kind) === key) occurrence++
      const row = {schema: NATIVE_ROW_SCHEMA, sequence: rows.length, occurrence, context, kind, detail:physicalDetail}
      if (safeJSONBytes(row, 524288) + 1 > 524288) fail('FAILED_ROW_OVER_BOUND')
      const metadata = {schema: SCHEMA, predicate: 'ROW_BYTE_CAP', availability: 'available',
        rowBytes: bytes(JSON.stringify(row) + '\n'), rowLimit: 16384,
        sequence: rows.length, occurrence, priorRowCount: rows.length, kind,
        context, ...familyEvidence(kind, detail, context, rows, codec),
        detailBytes, contextBytes,
        error: {name: error.name, message: error.message}}
      safeJSONBytes(metadata, 4095, 'DIAGNOSTIC_UNAVAILABLE', 'DIAGNOSTIC_OUTPUT_OVER_BOUND')
      const candidate = JSON.stringify(metadata) + '\n'
      line = bytes(candidate) <= 4096 ? candidate : fallback('DIAGNOSTIC_OUTPUT_OVER_BOUND')
    } catch (error) {
      const codes = ['CONTEXT_UNSUPPORTED','CONTEXT_OVER_BOUND','FAILED_ROW_UNSUPPORTED',
        'FAILED_ROW_OVER_BOUND','CANONICAL_INPUT_OVER_BOUND','PRIOR_ROWS_UNAVAILABLE',
        'DIAGNOSTIC_OUTPUT_OVER_BOUND','DIAGNOSTIC_UNAVAILABLE']
      line = fallback(codes.includes(error?.diagnosticCode) ? error.diagnosticCode : 'DIAGNOSTIC_UNAVAILABLE')
    }
  }
  return Object.freeze({
    wrap(capture, rowsProvider) {
      return Object.freeze({context: capture.context, record(kind, detail) {
        latch.throwIfFailed()
        let priorRows
        try { priorRows=rowsProvider() } catch(error) { latch.record(error); throw error }
        try { capture.record(kind, detail) } catch (error) {
          latch.record(error)
          if (latch.first().error === error && error instanceof Error && error.name === 'Error' && error.message === MESSAGE) {
            // Even an unexpected diagnostic serializer failure cannot replace E.
            try { retain(error, capture, () => priorRows, kind, detail) } catch { /* failed is already sticky. */ }
          }
          throw error
        }
      }})
    },
    throwIfFailed() { latch.throwIfFailed() },
    emitFirst(writeLine) {
      if (failed === null || emitted || latch.first().error !== failed) return
      emitted = true
      try { if (typeof line === 'string') writeLine(line) } catch { /* Original sticky refusal wins. */ }
    },
    reset() { failed = null; line = null; emitted = false },
  })
}

// The actual fullbody arm and pure controls share this error-precedence adapter.
export function runObserverArm(diagnostic, body, end, reset, writeLine) {
  let result, failed=false, error, sticky=false, stickyError
  const health=()=>{try{diagnostic.throwIfFailed()}catch(value){if(!sticky){sticky=true;stickyError=value}}}
  const emit=()=>{try{diagnostic.emitFirst(writeLine)}catch{/* Selected actual error remains primary. */}}
  try{result=body()}catch(value){failed=true;error=value}
  health();if(failed||sticky)emit()
  try{end()}catch(value){failed=true;error=value}
  health();if(sticky)emit()
  try{reset()}catch(value){failed=true;error=value}
  health();if(sticky)emit()
  if(sticky)throw stickyError
  if(failed)throw error
  return result
}
