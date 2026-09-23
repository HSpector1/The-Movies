# 726 — the T0 probe file: recovered, its effect established, and archived outside the suite

Opened on the Owner's instruction of 2026-09-23: "Do not delete the stray probe blindly. Preserve
it, establish whether it entered any test run, and keep it outside the normal suite unless
deliberately admitted. Record any effect on test discovery."

**The parent owns the error.** During T0 the parent saw `tests/_zz-probe.test.ts` in the working
tree and instructed the test engineer to delete it, on the correct concern that the core project
globs `tests/**/*.test.ts` and a stray file joins the suite. Deleting was the wrong remedy: it
destroys the evidence needed to answer whether anything was affected. The engineer executed the
parent's instruction and then, when asked, recovered the file verbatim from its own context.

## 1. The file, recovered verbatim

Reported as the exact `content` argument of the `Write` call that created it, still present in the
engineer's context rather than reconstructed from memory. Created once, never edited, then deleted.

```typescript
import { it } from 'vitest'
import { p13aGeneratedStudio, fund } from './helpers/p14b2-fixtures.js'
it('probe stages', () => {
  const state = fund(p13aGeneratedStudio())
  console.log('stages', state.operations.facilities.filter((f) => f.capability === 'soundstage').map((f) => f.id))
  console.log('scriptDevelopment.mode', state.scriptDevelopment.mode)
  console.log('concepts', state.concepts.length)
})
```

**It asserts nothing.** No `expect`, no `assert`. Three `console.log` lines in one `it()`. Any code
that does not throw passes with zero assertions, so its maximum possible contribution to any count
was one passing file and one passing test. It could not have failed and could not have changed
another case's result.

## 2. Did it enter a test run? YES, once, deliberately

It was run alone and on purpose: `vitest run tests/_zz-probe.test.ts --minWorkers=1 --maxWorkers=1`,
reporting `✓ |core| tests/_zz-probe.test.ts (1 test) 42ms`, `Test Files 1 passed (1)`. That run is
what it was for. Its three logs are the two engine facts record 722 reports: this seed starts with
TWO soundstages (`facility-soundstage-07`, `facility-soundstage-12`) and `scriptDevelopment.mode`
starts `'legacy'`, which is why switching it to `'managed'` had broken the earlier route.

## 3. Did it enter any OTHER run? NO, and this is established rather than assumed

Four further vitest invocations happened while the file existed. Every one named a single file
positionally (`tests/bridge-p14b7-mint-v31.test.ts`); none used a glob, a directory or a bare
`vitest run`. Three of the four showed `Test Files 1 passed (1)` or `1 failed (1)` in captured
output, which settles them directly.

**The fourth was an honest gap and the engineer reported it as one** rather than closing it with a
plausible claim: that run's output was piped through `grep -A3`, so its summary line was never
seen, and the engineer stated it could not rule out collection from what it captured. It also
named the open question correctly: whether Vitest enumerates the configured `include` globs before
filtering to the CLI path is a question about Vitest's own discovery mechanics, not something the
run's visible output answers.

**The parent closed it by experiment rather than by reasoning.** A file guaranteed to fail was
planted in `tests/`:

```typescript
import { it, expect } from 'vitest'
it('DISCOVERY-EXPERIMENT must fail loudly if collected', () => { expect('collected').toBe('not-collected') })
```

Then `vitest run tests/bridge-p14b6-d2-withheld-employment-claim.test.ts --minWorkers=1
--maxWorkers=1` was run, naming a DIFFERENT file. Result:

```
 ✓ |core| tests/bridge-p14b6-d2-withheld-employment-claim.test.ts (2 tests) 356ms
 Test Files  1 passed (1)
      Tests  2 passed (2)
```

A file that fails on collection did not appear and did not fail the run. **A positional CLI
argument filters COLLECTION, not merely reporting, in this repo at vitest 2.1.9.** So the probe
could not have been collected in any of the four invocations, and the gap closes by a general fact
rather than by that one run's filtered output.

The experiment file was created and removed inside a single shell command under a `trap ... EXIT
INT TERM`, so it could not survive an interrupt, and its absence was confirmed afterwards. No
baseline run was in flight.

## 4. Effect on test discovery, and on any baseline: NONE

The probe existed from roughly 11:44:20 to between 11:47:57 and 11:48:56, bounded by Vitest's own
`Start at` lines rather than by an assumed clock. No `record-check.mjs` run, no full core run and
no `test:ui` run occurred in that window. The last full core is run 717 at `5ba2b8d6`, long before
the file existed, and the next will be B.7's, long after. **No baseline was touched, and no
published count includes it.**

## 5. Disposition

Archived here, in this record, which is outside the `tests/**/*.test.ts` glob. It is NOT revived in
`tests/`. It is not worth admitting as a real test in its current form: it has no pass/fail
contract and its title names a diagnostic action rather than a behaviour. The two facts it
surfaced are already load-bearing assertions inside the archived minter
(`722-mint-final-v31.executed.ts.txt`), which is the better home for them.

## 6. The rule this produces

A diagnostic probe under `tests/` is not made safe by deleting it, and deleting it destroys the
only evidence of what it touched. Archive it as evidence text, record the runs it was present for,
and establish the discovery behaviour by experiment rather than by assumption. The habit the parent
reached for, delete the stray and move on, would have left a correct conclusion resting on nothing.
