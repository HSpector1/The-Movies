// Read-only diagnostic comparison, not a pass/fail waiver. Review every mismatch.
// Usage: node compare-failures.mjs <baseline-log> <candidate-log>
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const [baselinePath, candidatePath] = process.argv.slice(2);
if (!baselinePath || !candidatePath) throw new Error('Supply baseline and candidate raw logs');
const sha = (value) => createHash('sha256').update(value).digest('hex');
const normalize = (value) => value
  .replace(/\u001b\[[0-9;]*m/g, '')
  // Only the exporter-owned mkdtemp suffix is nondeterministic evidence noise.
  .replace(/studio-scenery-export-[A-Za-z0-9]+/g, 'studio-scenery-export-<temporary>')
  .trim();

function readFailures(path) {
  const raw = readFileSync(path, 'utf8');
  const clean = raw.replace(/\u001b\[[0-9;]*m/g, '');
  const summary = clean.match(/^\s*Tests\s+(\d+) failed\b/m);
  if (!summary) throw new Error(`No completed failing-test summary in ${path}`);
  const failures = new Map();
  for (const block of clean.split(/^.*⎯.*\[\d+\/\d+\].*$/m)) {
    const lines = block.split('\n');
    const names = [];
    let last = -1;
    lines.forEach((line, i) => {
      const match = line.match(/^\s*FAIL\s+(?:\|[^|]+\|\s+)?(tests\/.*)$/);
      if (match) { names.push(match[1].trim()); last = i; }
    });
    if (!names.length) continue;
    const diagnostic = normalize(lines.slice(last + 1).join('\n'));
    if (!/^(?:Error|AssertionError|TypeError|RangeError|ReferenceError|SyntaxError):/m.test(diagnostic)) {
      throw new Error(`Unrecognized diagnostic format for ${names.join(', ')}`);
    }
    for (const name of names) {
      if (failures.has(name)) throw new Error(`Duplicate failure identifier: ${name}`);
      failures.set(name, diagnostic);
    }
  }
  if (failures.size !== Number(summary[1])) {
    throw new Error(`Parsed ${failures.size}, summary reports ${summary[1]} failures in ${path}`);
  }
  return { rawSha256: sha(raw), failures };
}

const baseline = readFailures(baselinePath);
const candidate = readFailures(candidatePath);
const rows = [...candidate.failures].map(([test, diagnostic]) => {
  const prior = baseline.failures.get(test);
  return {
    test,
    comparison: prior === undefined ? 'NEW_IDENTIFIER' : prior === diagnostic ? 'EXACT_DIAGNOSTIC_MATCH' : 'CHANGED_DIAGNOSTIC',
    diagnostic,
    diagnosticSha256: sha(diagnostic),
    baselineDiagnostic: prior ?? null,
    baselineDiagnosticSha256: prior === undefined ? null : sha(prior),
  };
});
console.log(JSON.stringify({
  baselinePath, candidatePath,
  baselineRawSha256: baseline.rawSha256, candidateRawSha256: candidate.rawSha256,
  qualification: 'Complete test identifier plus diagnostic/trace comparison; only ANSI and generated exporter temporary suffix normalized. Exact historical signatures are evidence for attribution, not a green suite or Owner acceptance.',
  baselineCount: baseline.failures.size, candidateCount: candidate.failures.size,
  rows,
  baselineFailuresAbsentNow: [...baseline.failures.keys()].filter((test) => !candidate.failures.has(test)),
}, null, 2));
process.exitCode = rows.some((row) => row.comparison !== 'EXACT_DIAGNOSTIC_MATCH') ? 1 : 0;
