// Scratch evidence only. The original sink remains the acceptance authority.
const SCHEMA = '1370-m0-observer-row-diagnostic/v1'
const MESSAGE = 'M0 feasibility row byte bound exceeded'
const bytes = text => new TextEncoder().encode(text).length
const identity = (context, kind) => JSON.stringify([context.week, context.caseKey,
  context.caseOccurrence, context.proposalKey, context.proposalOccurrence, context.phase,
  context.candidateOrdinal ?? null, context.submittedOrdinal ?? null,
  context.survivorOrdinal ?? null, kind])
const sameContext = (a, b) => JSON.stringify(a) === JSON.stringify(b)
function familyEvidence(kind, detail, context, rows) {
  let input = kind === 'inputTuple' ? detail : null
  if (kind === 'assessment') {
    for (let i = rows.length - 1; i >= 0; i--) {
      if (rows[i].kind === 'inputTuple' && sameContext(rows[i].context, context)) {
        input = rows[i].detail; break
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
  try { parsed = JSON.parse(input.canonicalInputs) } catch { return missing('CANONICAL_INPUT_MALFORMED') }
  return {family: Array.isArray(parsed) && typeof parsed[0] === 'string' ? parsed[0] : null,
    familyUnavailableReason: Array.isArray(parsed) && typeof parsed[0] === 'string' ? null : 'FAMILY_UNAVAILABLE',
    canonicalInputBytes: length, canonicalInputUnavailableReason: null}
}
export function createObserverRowDiagnostic() {
  let failed = null, line = null, emitted = false
  const fallback = reason => JSON.stringify({schema: SCHEMA, predicate: 'ROW_BYTE_CAP',
    availability: 'unavailable', reason, rowLimit: 16384,
    error: {name: 'Error', message: MESSAGE}}) + '\n'
  function retain(error, capture, rowsProvider, kind, detail) {
    failed = error // Sticky BEFORE any diagnostic operation that can throw.
    line = fallback('DIAGNOSTIC_UNAVAILABLE')
    try {
      const rows = rowsProvider()
      if (!Array.isArray(rows) || rows.length > 512 || bytes(JSON.stringify(rows)) > 2097152) {
        line = fallback('PRIOR_ROWS_UNAVAILABLE'); return
      }
      const context = capture.context, key = identity(context, kind)
      const occurrence = rows.reduce((n, row) => n + (identity(row.context, row.kind) === key ? 1 : 0), 0)
      const row = {schema: 'c0-m0-feasibility/v1', sequence: rows.length, occurrence, context, kind, detail}
      const candidate = JSON.stringify({schema: SCHEMA, predicate: 'ROW_BYTE_CAP', availability: 'available',
        rowBytes: bytes(JSON.stringify(row) + '\n'), rowLimit: 16384,
        sequence: rows.length, occurrence, priorRowCount: rows.length, kind,
        context, ...familyEvidence(kind, detail, context, rows),
        detailBytes: bytes(JSON.stringify(detail)), contextBytes: bytes(JSON.stringify(context)),
        error: {name: error.name, message: error.message}}) + '\n'
      line = bytes(candidate) <= 4096 ? candidate : fallback('DIAGNOSTIC_OUTPUT_OVER_BOUND')
    } catch { line = fallback('DIAGNOSTIC_UNAVAILABLE') }
  }
  return Object.freeze({
    wrap(capture, rowsProvider) {
      return Object.freeze({context: capture.context, record(kind, detail) {
        if (failed !== null) throw failed
        try { capture.record(kind, detail) } catch (error) {
          if (error instanceof Error && error.name === 'Error' && error.message === MESSAGE) {
            // Even an unexpected diagnostic serializer failure cannot replace E.
            try { retain(error, capture, rowsProvider, kind, detail) } catch { /* failed is already sticky. */ }
          }
          throw error
        }
      }})
    },
    throwIfFailed() { if (failed !== null) throw failed },
    emitFirst(writeLine) {
      if (failed === null || emitted) return
      emitted = true
      try { if (typeof line === 'string') writeLine(line) } catch { /* Original sticky refusal wins. */ }
    },
    reset() { failed = null; line = null; emitted = false },
  })
}

// The actual fullbody arm and pure controls share this error-precedence adapter.
export function runObserverArm(diagnostic, body, end, reset, writeLine) {
  let rowFailed = false, rowError
  try {
    const result = body()
    diagnostic.throwIfFailed()
    return result
  } catch (error) {
    try { diagnostic.throwIfFailed() } catch (sticky) {
      rowFailed = true; rowError = sticky
    }
    try { diagnostic.emitFirst(writeLine) } catch { /* Diagnostic output cannot replace the caught error. */ }
    throw rowFailed ? rowError : error
  } finally {
    if (rowFailed) {
      // Both cleanup operations still run; neither may replace the original E.
      try { end() } catch { /* Fatal row refusal already retained locally. */ }
      try { reset() } catch { /* Fatal row refusal already retained locally. */ }
    } else {
      try { end() } finally { reset() }
    }
  }
}
