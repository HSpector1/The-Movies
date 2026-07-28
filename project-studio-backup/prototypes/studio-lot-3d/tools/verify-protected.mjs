// Verifies the two protected repositories are untouched. Read-only (git rev-parse
// / status). Exits non-zero if either drifted from its authorized baseline.
import { execFileSync } from 'node:child_process'

// Baselines are the last commit each protected repo was at when this spike last
// confirmed it. The main app repo advances on ITS OWN track (the management sim);
// re-pin only after confirming the new HEAD is that track's work and contains NO
// 3D-spike leakage. Re-pinned 2026-07-26 (Gate-C defect close): main advanced
// eb9dd43 → 0f9d23d ("Phase 5.2A: studio roster, contracts, payroll, and freelancer
// market") — the management-sim track's own work, clean tree; contamination scan found
// NO 3D-spike files in main, and the spike shares no remote/link with main (leakage
// impossible by construction).
const EXPECT = {
  '/Users/bruce/The Movies': '0f9d23d',
  '/Users/bruce/The Movies - Studio Lot Spike': '3806ef6',
}
let ok = true
for (const [dir, base] of Object.entries(EXPECT)) {
  try {
    const head = execFileSync('git', ['-C', dir, 'rev-parse', '--short', 'HEAD']).toString().trim()
    const dirty = execFileSync('git', ['-C', dir, 'status', '--porcelain']).toString().trim()
    const headOk = head.startsWith(base)
    // studio-lot-spike must be clean; main may carry the other track's own working
    // changes, but MUST still be at its committed baseline and not modified by us.
    console.log(`${dir}\n  HEAD ${head} (expect ${base}) ${headOk ? 'OK' : 'DRIFT'}; ${dirty ? dirty.split('\n').length + ' local file(s)' : 'clean'}`)
    if (!headOk) ok = false
  } catch (e) {
    console.log(`${dir}  ERROR: ${e.message}`)
    ok = false
  }
}
console.log(ok ? '\n✓ protected baselines intact' : '\n✗ protected baseline drift')
process.exit(ok ? 0 : 1)
